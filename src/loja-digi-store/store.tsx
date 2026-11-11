/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (D2 estoque saldo+reserva, D3/D4 criação, D5 custo congelado, D11 máquina).
 * Estado em memória (some ao recarregar). Sem Supabase, sem segredo.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { avaliarTransicao } from "./maquina";
import { MOVIMENTOS_INICIAIS, PEDIDOS_INICIAIS, PESSOA_DIRETOR, PESSOA_EQUIPE, SKUS_INICIAIS, SUGESTOES_INICIAIS } from "./mock";
import type { AcaoPedido, EstadoSugestao, LinhaCarrinho, LinhaPedido, Movimento, Pedido, Sku, Sugestao, Visao } from "./tipos";

interface Estado {
  skus: Sku[];
  pedidos: Pedido[];
  sugestoes: Sugestao[];
  movimentos: Movimento[];
  carrinho: LinhaCarrinho[];
  visao: Visao;
  carrinhoAberto: boolean;
}

export type Resultado<T = undefined> = ({ ok: true } & (T extends undefined ? object : { dado: T })) | { ok: false; motivo: string };

export interface DadosPedido {
  finalidade: string;
  destino?: string;
  dataDesejada?: string;
  observacao?: string;
}

export interface Loja extends Estado {
  disponivel: (skuId: string) => number;
  pessoa: string;
  adicionar: (skuId: string, quantidade: number, personalizacao?: LinhaCarrinho["personalizacao"]) => Resultado;
  definirQuantidade: (chave: string, quantidade: number) => void;
  remover: (chave: string) => void;
  limparCarrinho: () => void;
  abrirCarrinho: (aberto: boolean) => void;
  trocarVisao: (v: Visao) => void;
  criarPedido: (d: DadosPedido) => Resultado<Pedido>;
  transicionar: (pedidoId: string, acao: AcaoPedido, motivo?: string) => Resultado;
  marcarLinhaPronta: (pedidoId: string, linhaId: string) => void;
  criarSugestao: (nome: string, paraQueServe: string, qtd?: number, referencia?: string) => void;
  // Tarefa 1.3 (Diretor): aceite ou recusa do orçamento (Req. 10.4 e 10.5)
  decidirOrcamento: (pedidoId: string, linhaId: string, aceitar: boolean, motivo?: string) => Resultado;
  // Tarefa 1.4 (Equipe_da_Loja)
  registrarEntrada: (skuId: string, quantidade: number, origem: string) => Resultado;
  ajustarInventario: (skuId: string, novoSaldo: number, motivo: string) => Resultado;
  decidirSugestao: (id: string, para: Exclude<EstadoSugestao, "sugerida">, motivo?: string) => Resultado;
  informarOrcamento: (pedidoId: string, linhaId: string, valorTotal: number, prazoDias: number) => Resultado;
  ajustarQuantidadeLinha: (pedidoId: string, linhaId: string, quantidade: number, nota: string) => Resultado;
}

const Ctx = createContext<Loja | null>(null);

/** Req. 5.7: o carrinho sobrevive a recarregar a página (só na sessão da aba). */
const CHAVE_CARRINHO = "digi-store:carrinho";

function lerCarrinho(): LinhaCarrinho[] {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE_CARRINHO);
    const lista: unknown = bruto ? JSON.parse(bruto) : [];
    if (!Array.isArray(lista)) return [];
    // Descarta linhas de brindes que não existem mais ou com quantidade inválida.
    return lista.filter(
      (l): l is LinhaCarrinho =>
        !!l && typeof l.chave === "string" && Number.isInteger(l.quantidade) && l.quantidade >= 1 && SKUS_INICIAIS.some((s) => s.id === l.skuId),
    );
  } catch {
    return [];
  }
}

const inicial = (): Estado => ({
  skus: structuredClone(SKUS_INICIAIS),
  pedidos: structuredClone(PEDIDOS_INICIAIS),
  sugestoes: structuredClone(SUGESTOES_INICIAIS),
  movimentos: structuredClone(MOVIMENTOS_INICIAIS),
  carrinho: lerCarrinho(),
  visao: "diretor",
  carrinhoAberto: false,
});

let seq = 1;
const novoId = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;

/** Mexe na reserva/saldo das linhas Propriedade de um pedido (Personalizável nunca reserva). */
function ajustarEstoque(skus: Sku[], linhas: LinhaPedido[], modo: "liberar" | "baixar"): Sku[] {
  return skus.map((s) => {
    const l = linhas.find((x) => x.skuId === s.id && x.skuTipo === "propriedade");
    if (!l) return s;
    const reserva = Math.max(0, s.reserva - l.quantidade);
    return modo === "liberar" ? { ...s, reserva } : { ...s, reserva, saldoFisico: Math.max(0, s.saldoFisico - l.quantidade) };
  });
}

export function LojaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(inicial);
  const ref = useRef(estado);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHAVE_CARRINHO, JSON.stringify(estado.carrinho));
    } catch {
      /* armazenamento indisponível: o carrinho segue em memória */
    }
  }, [estado.carrinho]);

  const mudar = useCallback(<R,>(fn: (e: Estado) => { e: Estado; r: R }): R => {
    const { e, r } = fn(ref.current);
    ref.current = e;
    setEstado(e);
    return r;
  }, []);

  const loja = useMemo<Loja>(() => {
    const pessoa = estado.visao === "diretor" ? PESSOA_DIRETOR : PESSOA_EQUIPE;
    const disp = (id: string) => {
      const s = estado.skus.find((x) => x.id === id);
      return s ? s.saldoFisico - s.reserva : 0;
    };
    return {
      ...estado,
      pessoa,
      disponivel: disp,
      adicionar: (skuId, quantidade, personalizacao) =>
        mudar((e) => {
          const sku = e.skus.find((s) => s.id === skuId);
          if (!sku) return { e, r: { ok: false, motivo: "Brinde não encontrado." } as Resultado };
          if (!Number.isInteger(quantidade) || quantidade < 1) return { e, r: { ok: false, motivo: "Informe uma quantidade inteira maior que zero." } as Resultado };
          const ja = e.carrinho.find((l) => l.skuId === skuId && !personalizacao && !l.personalizacao);
          const total = quantidade + (ja?.quantidade ?? 0);
          if (sku.tipo === "propriedade" && total > sku.saldoFisico - sku.reserva) {
            return { e, r: { ok: false, motivo: `Só há ${sku.saldoFisico - sku.reserva} disponíveis.` } as Resultado };
          }
          const carrinho = ja
            ? e.carrinho.map((l) => (l === ja ? { ...l, quantidade: total } : l))
            : [...e.carrinho, { chave: novoId("c"), skuId, quantidade, personalizacao }];
          return { e: { ...e, carrinho }, r: { ok: true } as Resultado };
        }),
      definirQuantidade: (chave, quantidade) =>
        mudar((e) => ({ e: { ...e, carrinho: e.carrinho.map((l) => (l.chave === chave ? { ...l, quantidade: Math.max(1, quantidade) } : l)) }, r: undefined })),
      remover: (chave) => mudar((e) => ({ e: { ...e, carrinho: e.carrinho.filter((l) => l.chave !== chave) }, r: undefined })),
      limparCarrinho: () => mudar((e) => ({ e: { ...e, carrinho: [] }, r: undefined })),
      abrirCarrinho: (aberto) => mudar((e) => ({ e: { ...e, carrinhoAberto: aberto }, r: undefined })),
      trocarVisao: (v) => mudar((e) => ({ e: { ...e, visao: v }, r: undefined })),

      criarPedido: (d) =>
        mudar((e) => {
          if (!d.finalidade.trim()) return { e, r: { ok: false, motivo: "Informe a finalidade do pedido." } as Resultado<Pedido> };
          if (!e.carrinho.length) return { e, r: { ok: false, motivo: "O carrinho está vazio." } as Resultado<Pedido> };
          // Valida o Disponivel de cada linha Propriedade antes de reservar (tudo ou nada).
          for (const l of e.carrinho) {
            const s = e.skus.find((x) => x.id === l.skuId);
            if (s?.tipo === "propriedade" && l.quantidade > s.saldoFisico - s.reserva) {
              return { e, r: { ok: false, motivo: `Sem saldo para ${s.nome}. Disponível: ${s.saldoFisico - s.reserva}.` } as Resultado<Pedido> };
            }
          }
          const linhas: LinhaPedido[] = e.carrinho.map((l) => {
            const s = e.skus.find((x) => x.id === l.skuId)!;
            return {
              id: novoId("l"), skuId: s.id, skuNome: s.nome, skuTipo: s.tipo, custoUnitario: s.custoUnitario,
              quantidade: l.quantidade, personalizacao: l.personalizacao,
              andamento: s.tipo === "propriedade" ? "em_separacao" : "aguardando_orcamento",
            };
          });
          const agora = new Date().toISOString();
          const numero = Math.max(1000, ...e.pedidos.map((p) => p.numero)) + 1;
          const pedido: Pedido = {
            id: `p-${numero}`, numero, solicitante: PESSOA_DIRETOR, criadoEm: agora, ...d, estado: "solicitada", linhas,
            eventos: [{ em: agora, pessoa: PESSOA_DIRETOR, de: null, para: "solicitada" }],
          };
          const skus = e.skus.map((s) => {
            const l = linhas.find((x) => x.skuId === s.id && x.skuTipo === "propriedade");
            return l ? { ...s, reserva: s.reserva + l.quantidade } : s;
          });
          return { e: { ...e, skus, pedidos: [pedido, ...e.pedidos], carrinho: [] }, r: { ok: true, dado: pedido } as Resultado<Pedido> };
        }),

      transicionar: (pedidoId, acao, motivo) =>
        mudar((e) => {
          const p = e.pedidos.find((x) => x.id === pedidoId);
          if (!p) return { e, r: { ok: false, motivo: "Pedido não encontrado." } as Resultado };
          const ator = e.visao === "equipe" ? "equipe" : p.solicitante === PESSOA_DIRETOR ? "solicitante" : "outro";
          const v = avaliarTransicao({
            estado: p.estado, acao, ator, motivo,
            todasLinhasProntas: p.linhas.every((l) => l.andamento === "pronta"),
            temOrcamentoAceito: p.linhas.some((l) => l.andamento === "orcamento_aceito" || (l.skuTipo === "personalizavel" && l.andamento === "pronta")),
          });
          if (!v.ok) return { e, r: v as Resultado };
          const quem = e.visao === "equipe" ? PESSOA_EQUIPE : PESSOA_DIRETOR;
          const pedido: Pedido = {
            ...p, estado: v.para,
            responsavel: acao === "assumir" ? quem : p.responsavel,
            motivo: acao === "recusar" || acao === "cancelar" ? motivo : p.motivo,
            eventos: [...p.eventos, { em: new Date().toISOString(), pessoa: quem, de: p.estado, para: v.para, nota: motivo }],
          };
          const skus = acao === "encerrar" ? ajustarEstoque(e.skus, p.linhas, "baixar") : acao === "recusar" || acao === "cancelar" ? ajustarEstoque(e.skus, p.linhas, "liberar") : e.skus;
          const saidas: Movimento[] = acao === "encerrar"
            ? p.linhas.filter((l) => l.skuTipo === "propriedade").map((l) => ({ id: novoId("m"), em: new Date().toISOString(), skuId: l.skuId, tipo: "saida" as const, quantidade: -l.quantidade, pessoa: quem, nota: `Retirada do pedido #${p.numero}` }))
            : [];
          return { e: { ...e, skus, movimentos: [...saidas, ...e.movimentos], pedidos: e.pedidos.map((x) => (x.id === pedidoId ? pedido : x)) }, r: { ok: true } as Resultado };
        }),

      marcarLinhaPronta: (pedidoId, linhaId) =>
        mudar((e) => ({
          e: { ...e, pedidos: e.pedidos.map((p) => (p.id === pedidoId ? { ...p, linhas: p.linhas.map((l) => (l.id === linhaId ? { ...l, andamento: "pronta" as const } : l)) } : p)) },
          r: undefined,
        })),

      criarSugestao: (nome, paraQueServe, qtd, referencia) =>
        mudar((e) => ({
          e: { ...e, sugestoes: [{ id: novoId("s"), nome, paraQueServe, qtdEstimada: qtd, referencia: referencia?.trim() || undefined, solicitante: PESSOA_DIRETOR, estado: "sugerida" as const }, ...e.sugestoes] },
          r: undefined,
        })),

      decidirOrcamento: (pedidoId, linhaId, aceitar, motivo) =>
        mudar((e) => {
          const p = e.pedidos.find((x) => x.id === pedidoId);
          const l = p?.linhas.find((x) => x.id === linhaId);
          if (!p || !l || l.andamento !== "orcamento_enviado") return { e, r: { ok: false, motivo: "Não há orçamento para decidir nesta linha." } as Resultado };
          if (!aceitar && !(motivo ?? "").trim()) return { e, r: { ok: false, motivo: "Informe o motivo da recusa." } as Resultado };
          const evento = { em: new Date().toISOString(), pessoa: PESSOA_DIRETOR, de: p.estado, para: p.estado, nota: aceitar ? `Orçamento aceito: ${l.skuNome}.` : `Orçamento recusado: ${l.skuNome}. ${motivo!.trim()}` };
          const linha = aceitar ? { ...l, andamento: "orcamento_aceito" as const } : { ...l, andamento: "aguardando_orcamento" as const, orcamento: undefined };
          return {
            e: { ...e, pedidos: e.pedidos.map((x) => (x.id !== pedidoId ? x : { ...x, eventos: [...x.eventos, evento], linhas: x.linhas.map((y) => (y.id === linhaId ? linha : y)) })) },
            r: { ok: true } as Resultado,
          };
        }),

      registrarEntrada: (skuId, quantidade, origem) =>
        mudar((e) => {
          const s = e.skus.find((x) => x.id === skuId);
          if (!s || s.tipo !== "propriedade") return { e, r: { ok: false, motivo: "Só brindes em estoque recebem entrada." } as Resultado };
          if (!Number.isInteger(quantidade) || quantidade < 1) return { e, r: { ok: false, motivo: "Informe uma quantidade inteira maior que zero." } as Resultado };
          if (!origem.trim()) return { e, r: { ok: false, motivo: "Informe a origem ou o lote." } as Resultado };
          const m: Movimento = { id: novoId("m"), em: new Date().toISOString(), skuId, tipo: "entrada", quantidade, pessoa: PESSOA_EQUIPE, nota: origem.trim() };
          return { e: { ...e, skus: e.skus.map((x) => (x.id === skuId ? { ...x, saldoFisico: x.saldoFisico + quantidade } : x)), movimentos: [m, ...e.movimentos] }, r: { ok: true } as Resultado };
        }),

      ajustarInventario: (skuId, novoSaldo, motivo) =>
        mudar((e) => {
          const s = e.skus.find((x) => x.id === skuId);
          if (!s || s.tipo !== "propriedade") return { e, r: { ok: false, motivo: "Só brindes em estoque têm saldo." } as Resultado };
          if (!Number.isInteger(novoSaldo) || novoSaldo < 0) return { e, r: { ok: false, motivo: "Informe um saldo inteiro, zero ou maior." } as Resultado };
          if (novoSaldo < s.reserva) return { e, r: { ok: false, motivo: `O saldo não pode ficar abaixo da reserva atual (${s.reserva}).` } as Resultado };
          if (!motivo.trim()) return { e, r: { ok: false, motivo: "Informe o motivo do ajuste." } as Resultado };
          if (novoSaldo === s.saldoFisico) return { e, r: { ok: false, motivo: "O novo saldo é igual ao atual." } as Resultado };
          const m: Movimento = { id: novoId("m"), em: new Date().toISOString(), skuId, tipo: "ajuste", quantidade: novoSaldo - s.saldoFisico, pessoa: PESSOA_EQUIPE, nota: motivo.trim() };
          return { e: { ...e, skus: e.skus.map((x) => (x.id === skuId ? { ...x, saldoFisico: novoSaldo } : x)), movimentos: [m, ...e.movimentos] }, r: { ok: true } as Resultado };
        }),

      decidirSugestao: (id, para, motivo) =>
        mudar((e) => {
          if (para === "recusada" && !(motivo ?? "").trim()) return { e, r: { ok: false, motivo: "Informe o motivo da recusa." } as Resultado };
          return { e: { ...e, sugestoes: e.sugestoes.map((s) => (s.id === id ? { ...s, estado: para, motivo: para === "recusada" || para === "aprovada" ? motivo?.trim() : s.motivo } : s)) }, r: { ok: true } as Resultado };
        }),

      informarOrcamento: (pedidoId, linhaId, valorTotal, prazoDias) =>
        mudar((e) => {
          if (!(valorTotal > 0) || !Number.isInteger(prazoDias) || prazoDias < 1) return { e, r: { ok: false, motivo: "Informe valor e prazo maiores que zero." } as Resultado };
          return {
            e: { ...e, pedidos: e.pedidos.map((p) => (p.id !== pedidoId ? p : { ...p, linhas: p.linhas.map((l) => (l.id === linhaId ? { ...l, andamento: "orcamento_enviado" as const, orcamento: { valorTotal, quantidade: l.quantidade, prazoDias } } : l)) })) },
            r: { ok: true } as Resultado,
          };
        }),

      ajustarQuantidadeLinha: (pedidoId, linhaId, quantidade, nota) =>
        mudar((e) => {
          const p = e.pedidos.find((x) => x.id === pedidoId);
          const l = p?.linhas.find((x) => x.id === linhaId);
          if (!p || !l) return { e, r: { ok: false, motivo: "Linha não encontrada." } as Resultado };
          if (p.estado !== "em_alinhamento") return { e, r: { ok: false, motivo: "A quantidade só muda durante o alinhamento." } as Resultado };
          if (!Number.isInteger(quantidade) || quantidade < 1) return { e, r: { ok: false, motivo: "Informe uma quantidade inteira maior que zero." } as Resultado };
          if (!nota.trim()) return { e, r: { ok: false, motivo: "Informe a nota para o diretor." } as Resultado };
          const s = e.skus.find((x) => x.id === l.skuId);
          const delta = quantidade - l.quantidade;
          if (s && l.skuTipo === "propriedade" && delta > s.saldoFisico - s.reserva) return { e, r: { ok: false, motivo: `Só há ${s.saldoFisico - s.reserva} disponíveis a mais.` } as Resultado };
          const skus = l.skuTipo === "propriedade" ? e.skus.map((x) => (x.id === l.skuId ? { ...x, reserva: x.reserva + delta } : x)) : e.skus;
          const evento = { em: new Date().toISOString(), pessoa: PESSOA_EQUIPE, de: p.estado, para: p.estado, nota: `${l.skuNome}: ${l.quantidade} para ${quantidade}. ${nota.trim()}` };
          const pedidos = e.pedidos.map((x) => (x.id !== pedidoId ? x : { ...x, eventos: [...x.eventos, evento], linhas: x.linhas.map((y) => (y.id === linhaId ? { ...y, quantidade } : y)) }));
          return { e: { ...e, skus, pedidos }, r: { ok: true } as Resultado };
        }),
    };
  }, [estado, mudar]);

  return <Ctx.Provider value={loja}>{children}</Ctx.Provider>;
}

export function useLoja(): Loja {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLoja fora do LojaProvider");
  return v;
}
