// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Estado só em memória: recarregar a página volta ao mock inicial.

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { agora } from "./formato";
import {
  CARRINHO_INICIAL, DIRETOR_LOGADO, EQUIPE_LOGADA, LOCAL_RETIRADA, MOVIMENTOS_INICIAIS, PEDIDOS_INICIAIS, PRODUTOS_INICIAIS, SUGESTOES_INICIAIS, usuario,
} from "./mock";
import * as R from "./regras";
import type { DadosEncomenda, EstadoLoja, ItemCarrinho, Pedido, Produto, RascunhoCheckout } from "./tipos";

export interface Toast {
  id: number;
  texto: string;
  tom: "ok" | "erro";
  acao?: { rotulo: string; onClick: () => void };
}

const RASCUNHO_VAZIO: RascunhoCheckout = { finalidade: "evento", destino: "", dataNecessaria: "", observacao: "" };

/** Dados para abrir uma encomenda a partir de um item da vitrine. */
export interface DadosNovaEncomenda {
  produtoId: string;
  variacaoId: string;
  qtd: number;
  finalidade: RascunhoCheckout["finalidade"];
  destino: string;
  prazoDesejado?: string;
  observacoesPersonalizacao?: string;
  personalizacao?: Pedido["itens"][number]["personalizacao"];
}

interface Ctx {
  estado: EstadoLoja;
  carrinho: ItemCarrinho[];
  rascunho: RascunhoCheckout;
  toasts: Toast[];
  diretorId: string;
  equipeId: string;
  avisar: (texto: string, tom?: Toast["tom"], acao?: Toast["acao"]) => void;
  fecharToast: (id: number) => void;
  adicionarAoCarrinho: (item: Omit<ItemCarrinho, "chave">) => void;
  alterarQtd: (chave: string, qtd: number) => void;
  remover: (chave: string) => void;
  setRascunho: (r: Partial<RascunhoCheckout>) => void;
  enviarPedido: () => { id: string; status: Pedido["status"] } | null;
  enviarEncomenda: (dados: DadosNovaEncomenda) => { id: string } | null;
  avancarEncomenda: (id: string, nota?: string) => boolean;
  negar: (id: string, motivo: string) => boolean;
  retirar: (id: string) => boolean;
  cancelar: (id: string, motivo: string, porId: string) => boolean;
  registrarEntrada: (produtoId: string, variacaoId: string, qtd: number, lote: string) => boolean;
  ajustar: (produtoId: string, variacaoId: string, novoSaldo: number, motivo: string) => boolean;
  salvarProduto: (p: Produto) => boolean;
  sugerirItem: (dados: { nome: string; descricao: string; referencia?: string; qtdEstimada?: number }) => { id: string } | null;
  analisarSugestao: (id: string) => boolean;
  aprovarSugestao: (id: string) => boolean;
  recusarSugestao: (id: string, motivo: string) => boolean;
}

const LojaCtx = createContext<Ctx | null>(null);

export function LojaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoLoja>({
    produtos: PRODUTOS_INICIAIS, pedidos: PEDIDOS_INICIAIS, movimentos: MOVIMENTOS_INICIAIS, sugestoes: SUGESTOES_INICIAIS,
  });
  const ref = useRef(estado);
  ref.current = estado;
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>(CARRINHO_INICIAL);
  const [rascunho, setRascunhoState] = useState<RascunhoCheckout>(RASCUNHO_VAZIO);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idToast = useRef(0);

  const fecharToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const avisar = useCallback((texto: string, tom: Toast["tom"] = "ok", acao?: Toast["acao"]) => {
    const id = ++idToast.current;
    setToasts((t) => [...t.slice(-2), { id, texto, tom, acao }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const executar = useCallback((fn: (e: EstadoLoja) => EstadoLoja, sucesso: string) => {
    try {
      const novo = fn(ref.current);
      ref.current = novo;
      setEstado(novo);
      avisar(sucesso);
      return true;
    } catch (err) {
      avisar(err instanceof Error ? err.message : "Não deu certo. Tente de novo.", "erro");
      return false;
    }
  }, [avisar]);

  const valor = useMemo<Ctx>(() => {
    return {
      estado, carrinho, rascunho, toasts, diretorId: DIRETOR_LOGADO, equipeId: EQUIPE_LOGADA, avisar, fecharToast,
      adicionarAoCarrinho: (item) => {
        const chave = `${item.produtoId}|${item.variacaoId}|${item.personalizacao ? "perso" : ""}`;
        setCarrinho((c) => {
          const existe = c.find((x) => x.chave === chave);
          if (existe) return c.map((x) => (x.chave === chave ? { ...x, qtd: x.qtd + item.qtd, personalizacao: item.personalizacao ?? x.personalizacao } : x));
          return [...c, { ...item, chave }];
        });
      },
      alterarQtd: (chave, qtd) => setCarrinho((c) => c.map((x) => (x.chave === chave ? { ...x, qtd } : x))),
      remover: (chave) => setCarrinho((c) => c.filter((x) => x.chave !== chave)),
      setRascunho: (r) => setRascunhoState((a) => ({ ...a, ...r })),
      enviarPedido: () => {
        if (!carrinho.length) return null;
        const id = R.proximoNumeroPedido(ref.current.pedidos);
        const u = usuario(DIRETOR_LOGADO);
        const em = agora();
        const base = {
          id, solicitanteId: u.id, centroCustoId: u.centroCustoId!,
          finalidade: rascunho.finalidade,
          destino: rascunho.finalidade === "interno" && !rascunho.destino.trim() ? "Uso interno" : rascunho.destino.trim(),
          dataNecessaria: rascunho.dataNecessaria, localRetirada: LOCAL_RETIRADA,
          observacao: rascunho.observacao.trim() || undefined,
          motivo: undefined,
        };
        try {
          const { estado: novo, pedido } = R.criarPedido(
            ref.current, base,
            carrinho.map((i) => ({ produtoId: i.produtoId, variacaoId: i.variacaoId, qtd: i.qtd, personalizacao: i.personalizacao })),
            u.id, em,
          );
          ref.current = novo;
          setEstado(novo);
          setCarrinho([]);
          setRascunhoState(RASCUNHO_VAZIO);
          return { id, status: pedido.status };
        } catch (err) {
          avisar(err instanceof Error ? err.message : "Não deu para enviar o pedido.", "erro");
          return null;
        }
      },
      enviarEncomenda: (dados) => {
        const id = R.proximoNumeroPedido(ref.current.pedidos);
        const u = usuario(DIRETOR_LOGADO);
        const em = agora();
        const base = {
          id, solicitanteId: u.id, centroCustoId: u.centroCustoId!,
          finalidade: dados.finalidade,
          destino: dados.finalidade === "interno" && !dados.destino.trim() ? "Uso interno" : dados.destino.trim(),
          dataNecessaria: dados.prazoDesejado || "", localRetirada: LOCAL_RETIRADA,
          observacao: dados.observacoesPersonalizacao?.trim() || undefined,
          motivo: undefined,
        };
        try {
          const { estado: novo } = R.criarEncomenda(
            ref.current, base,
            { produtoId: dados.produtoId, variacaoId: dados.variacaoId, qtd: dados.qtd, personalizacao: dados.personalizacao },
            { prazoDesejado: dados.prazoDesejado, observacoesPersonalizacao: dados.observacoesPersonalizacao?.trim() || undefined, quantidadeAlinhada: dados.qtd },
            u.id, em,
          );
          ref.current = novo;
          setEstado(novo);
          avisar(`Encomenda ${id} enviada. O marketing vai alinhar prazo e volume com você.`);
          return { id };
        } catch (err) {
          avisar(err instanceof Error ? err.message : "Não deu para enviar a encomenda.", "erro");
          return null;
        }
      },
      avancarEncomenda: (id, nota) => executar((e) => R.avancarEncomenda(e, id, EQUIPE_LOGADA, agora(), nota), `Encomenda ${id} avançou de etapa.`),
      negar: (id, motivo) => executar((e) => R.negar(e, id, motivo, EQUIPE_LOGADA, agora()), `Encomenda ${id} negada. Quem pediu vai ver o motivo.`),
      retirar: (id) => executar((e) => R.retirar(e, id, EQUIPE_LOGADA, agora()), `Pedido ${id} encerrado. Retirada registrada e custo debitado.`),
      cancelar: (id, motivo, porId) => executar((e) => R.cancelar(e, id, motivo, porId, agora()), `Pedido ${id} cancelado.`),
      registrarEntrada: (pid, vid, qtd, lote) => executar((e) => R.registrarEntrada(e, pid, vid, qtd, lote, EQUIPE_LOGADA, agora()), `Entrada de ${qtd} unidades registrada.`),
      ajustar: (pid, vid, saldo, motivo) => executar((e) => R.ajustar(e, pid, vid, saldo, motivo, EQUIPE_LOGADA, agora()), "Ajuste de inventário registrado."),
      salvarProduto: (p) => executar((e) => R.salvarProduto(e, p), `${p.nome} salvo no catálogo.`),
      sugerirItem: (dados) => {
        const em = agora();
        try {
          const { estado: novo, sugestao } = R.criarSugestao(ref.current, dados, DIRETOR_LOGADO, em);
          ref.current = novo;
          setEstado(novo);
          avisar(`Sugestão enviada. O marketing vai analisar e avisar você.`);
          return { id: sugestao.id };
        } catch (err) {
          avisar(err instanceof Error ? err.message : "Não deu para enviar a sugestão.", "erro");
          return null;
        }
      },
      analisarSugestao: (id) => executar((e) => R.analisarSugestao(e, id, EQUIPE_LOGADA, agora()), `Sugestão ${id} em análise.`),
      aprovarSugestao: (id) => executar((e) => R.aprovarSugestao(e, id, EQUIPE_LOGADA, agora()), `Sugestão ${id} aprovada. Virou item de encomenda no catálogo.`),
      recusarSugestao: (id, motivo) => executar((e) => R.recusarSugestao(e, id, motivo, EQUIPE_LOGADA, agora()), `Sugestão ${id} recusada. Quem sugeriu vai ver o motivo.`),
    };
  }, [estado, carrinho, rascunho, toasts, avisar, fecharToast, executar]);

  return <LojaCtx.Provider value={valor}>{children}</LojaCtx.Provider>;
}

export function useLoja() {
  const c = useContext(LojaCtx);
  if (!c) throw new Error("useLoja fora do LojaProvider");
  return c;
}

export function useProduto(id: string) {
  const { estado } = useLoja();
  return estado.produtos.find((p) => p.id === id);
}
