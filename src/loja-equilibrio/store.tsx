// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/store.tsx (carrinho em sessionStorage, visão ativa), lido em 2026-11-11; reescrito aqui, sem importar dele.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Estado em memória sobre ESTADO_INICIAL. Toda mudança de negócio passa pelas funções puras de regras.ts;
// o Error em português vira { ok: false, motivo } para a UI mostrar junto ao campo ou no painel.

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { ESTADO_INICIAL } from "./mock";
import {
  aceitarOrcamento as rAceitarOrcamento,
  analisarSugestao as rAnalisarSugestao,
  ajustarQuantidadeLinha as rAjustarQuantidadeLinha,
  criarPedido as rCriarPedido,
  criarSugestao as rCriarSugestao,
  decidirSugestao as rDecidirSugestao,
  informarOrcamento as rInformarOrcamento,
  mudarEstado as rMudarEstado,
  registrarAjuste as rRegistrarAjuste,
  registrarEntrada as rRegistrarEntrada,
  alternarAtivo as rAlternarAtivo,
  salvarBrinde as rSalvarBrinde,
  validarLinha,
} from "./regras";
import type { Brinde, DadosPedido, Estado, EstadoPedido, Pedido, Pessoa, Variacao } from "./tipos";

export type Visao = "diretor" | "gestao";

export type Resultado<T = void> = { ok: true; dado: T } | { ok: false; motivo: string };

export interface LinhaCarrinho {
  chave: string;
  brindeId: string;
  variacaoId: string;
  qtd: number;
  personalizacao?: { texto?: string; arte?: string };
}

export const PESSOA_DIRETOR_PADRAO = "d1"; // Marina Costa
export const PESSOA_GESTAO_PADRAO = "g1"; // Ana Beatriz Lopes

interface Interno {
  dados: Estado;
  carrinho: LinhaCarrinho[];
  carrinhoAberto: boolean;
  visao: Visao;
  diretorId: string;
  gestaoId: string;
}

type Acao =
  | { tipo: "dados"; dados: Estado }
  | { tipo: "dadosECarrinho"; dados: Estado; carrinho: LinhaCarrinho[] }
  | { tipo: "carrinho"; carrinho: LinhaCarrinho[] }
  | { tipo: "abrirCarrinho"; aberto: boolean }
  | { tipo: "visao"; visao: Visao }
  | { tipo: "pessoa"; visao: Visao; id: string };

function reducer(s: Interno, a: Acao): Interno {
  switch (a.tipo) {
    case "dados":
      return { ...s, dados: a.dados };
    case "dadosECarrinho":
      return { ...s, dados: a.dados, carrinho: a.carrinho };
    case "carrinho":
      return { ...s, carrinho: a.carrinho };
    case "abrirCarrinho":
      return { ...s, carrinhoAberto: a.aberto };
    case "visao":
      // Trocar de visão fecha o carrinho (ele só existe para o diretor) e nada mais se move.
      return { ...s, visao: a.visao, carrinhoAberto: false };
    case "pessoa":
      return a.visao === "diretor" ? { ...s, diretorId: a.id } : { ...s, gestaoId: a.id };
  }
}

/* ---------------------- Carrinho em sessionStorage ---------------------- */

const CHAVE_CARRINHO = "loja-equilibrio:carrinho";

function lerCarrinho(): LinhaCarrinho[] {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE_CARRINHO);
    const lista: unknown = bruto ? JSON.parse(bruto) : [];
    if (!Array.isArray(lista)) return [];
    return lista.filter(
      (l): l is LinhaCarrinho =>
        !!l &&
        typeof l.chave === "string" &&
        Number.isInteger(l.qtd) &&
        l.qtd >= 1 &&
        ESTADO_INICIAL.brindes.some((b) => b.id === l.brindeId && b.variacoes.some((v) => v.id === l.variacaoId)),
    );
  } catch {
    return [];
  }
}

function inicial(): Interno {
  return {
    dados: structuredClone(ESTADO_INICIAL),
    carrinho: lerCarrinho(),
    carrinhoAberto: false,
    visao: "diretor",
    diretorId: PESSOA_DIRETOR_PADRAO,
    gestaoId: PESSOA_GESTAO_PADRAO,
  };
}

/* ------------------------------ Contexto ------------------------------- */

export interface Loja {
  dados: Estado;
  visao: Visao;
  pessoa: Pessoa;
  /** Pessoas da visão ativa (para trocar de pessoa, se a UI quiser). */
  pessoasDaVisao: Pessoa[];
  trocarVisao: (v: Visao) => void;
  trocarPessoa: (id: string) => void;

  carrinho: LinhaCarrinho[];
  carrinhoAberto: boolean;
  abrirCarrinho: (aberto: boolean) => void;
  /** Valida a linha (ativo, variação, disponível, inteiro a partir de 1) somando o que já está no carrinho. */
  adicionar: (brindeId: string, variacaoId: string, qtd: number, personalizacao?: LinhaCarrinho["personalizacao"]) => Resultado;
  definirQuantidade: (chave: string, qtd: number) => Resultado;
  remover: (chave: string) => void;
  limparCarrinho: () => void;

  /** Cria o pedido a partir do carrinho. Se falhar, o carrinho fica preservado. */
  criarPedido: (d: Omit<DadosPedido, "solicitanteId">) => Resultado<Pedido>;
  mudarEstado: (pedidoId: string, alvo: EstadoPedido, motivo?: string) => Resultado;
  informarOrcamento: (pedidoId: string, indiceLinha: number, valorUnitario: number) => Resultado;
  aceitarOrcamento: (pedidoId: string, indiceLinha: number) => Resultado;
  ajustarQuantidadeLinha: (pedidoId: string, indiceLinha: number, novaQtd: number, nota: string) => Resultado;
  registrarEntrada: (brindeId: string, variacaoId: string, qtd: number, nota?: string) => Resultado;
  registrarAjuste: (brindeId: string, variacaoId: string, delta: number, nota: string) => Resultado;
  criarSugestao: (nome: string, descricao: string) => Resultado;
  analisarSugestao: (id: string) => Resultado;
  decidirSugestao: (id: string, alvo: "aprovada" | "recusada", motivo?: string) => Resultado;
  /** Cadastro (gestão): cria ou edita um brinde; liga/desliga na vitrine. */
  salvarBrinde: (brinde: Brinde) => Resultado;
  alternarAtivo: (id: string) => Resultado;

  /** Atalhos de leitura. */
  brinde: (idOuSlug: string) => Brinde | undefined;
  nomeDaPessoa: (id: string) => string;
}

const Ctx = createContext<Loja | null>(null);

export function useLoja(): Loja {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLoja fora do LojaProvider.");
  return c;
}

function mensagem(e: unknown): string {
  return e instanceof Error ? e.message : "Não foi possível concluir a operação.";
}

let contadorChave = 0;
function novaChave(): string {
  contadorChave += 1;
  return `c-${Date.now().toString(36)}-${contadorChave}`;
}

export function LojaProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(reducer, undefined, inicial);
  // Espelho síncrono para devolver o Resultado na mesma chamada, sem esperar a renderização.
  const ref = useRef(s);
  ref.current = s;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHAVE_CARRINHO, JSON.stringify(s.carrinho));
    } catch {
      /* armazenamento indisponível: o carrinho segue em memória */
    }
  }, [s.carrinho]);

  const pessoaId = s.visao === "diretor" ? s.diretorId : s.gestaoId;
  const pessoa = s.dados.pessoas.find((p) => p.id === pessoaId) ?? s.dados.pessoas[0];

  /** Aplica uma função pura de regras sobre os dados; erro vira Resultado. */
  const aplicar = useCallback((fn: (e: Estado, quem: string) => Estado): Resultado => {
    const atual = ref.current;
    const quem = atual.visao === "diretor" ? atual.diretorId : atual.gestaoId;
    try {
      const dados = fn(atual.dados, quem);
      ref.current = { ...atual, dados };
      dispatch({ tipo: "dados", dados });
      return { ok: true, dado: undefined };
    } catch (e) {
      return { ok: false, motivo: mensagem(e) };
    }
  }, []);

  const loja = useMemo<Loja>(() => {
    const achar = (e: Estado, brindeId: string, variacaoId: string): { b: Brinde; v: Variacao } | undefined => {
      const b = e.brindes.find((x) => x.id === brindeId);
      const v = b?.variacoes.find((x) => x.id === variacaoId);
      return b && v ? { b, v } : undefined;
    };

    const gravarCarrinho = (carrinho: LinhaCarrinho[]) => {
      ref.current = { ...ref.current, carrinho };
      dispatch({ tipo: "carrinho", carrinho });
    };

    return {
      dados: s.dados,
      visao: s.visao,
      pessoa,
      pessoasDaVisao: s.dados.pessoas.filter((p) => p.papel === s.visao),
      trocarVisao: (v) => dispatch({ tipo: "visao", visao: v }),
      trocarPessoa: (id) => dispatch({ tipo: "pessoa", visao: s.visao, id }),

      carrinho: s.carrinho,
      carrinhoAberto: s.carrinhoAberto,
      abrirCarrinho: (aberto) => dispatch({ tipo: "abrirCarrinho", aberto }),

      adicionar: (brindeId, variacaoId, qtd, personalizacao) => {
        const atual = ref.current;
        const alvo = achar(atual.dados, brindeId, variacaoId);
        if (!alvo) return { ok: false, motivo: "Brinde não encontrado." };
        // Linhas iguais (mesma variação, sem personalização) somam; as demais entram como linha nova.
        const igual = atual.carrinho.find(
          (l) => l.brindeId === brindeId && l.variacaoId === variacaoId && !personalizacao && !l.personalizacao,
        );
        const total = qtd + (igual?.qtd ?? 0);
        const jaDaVariacao = atual.carrinho
          .filter((l) => l.brindeId === brindeId && l.variacaoId === variacaoId && l !== igual)
          .reduce((n, l) => n + l.qtd, 0);
        const r = validarLinha(alvo.b, alvo.v, alvo.b.tipo === "estoque" ? total + jaDaVariacao : total);
        if (!r.ok) return { ok: false, motivo: r.erros.join(" ") };
        gravarCarrinho(
          igual
            ? atual.carrinho.map((l) => (l === igual ? { ...l, qtd: total } : l))
            : [...atual.carrinho, { chave: novaChave(), brindeId, variacaoId, qtd, personalizacao }],
        );
        return { ok: true, dado: undefined };
      },
      definirQuantidade: (chave, qtd) => {
        const atual = ref.current;
        const linha = atual.carrinho.find((l) => l.chave === chave);
        if (!linha) return { ok: false, motivo: "Item não encontrado no carrinho." };
        const alvo = achar(atual.dados, linha.brindeId, linha.variacaoId);
        if (!alvo) return { ok: false, motivo: "Brinde não encontrado." };
        const r = validarLinha(alvo.b, alvo.v, qtd);
        if (!r.ok) return { ok: false, motivo: r.erros.join(" ") };
        gravarCarrinho(atual.carrinho.map((l) => (l.chave === chave ? { ...l, qtd } : l)));
        return { ok: true, dado: undefined };
      },
      remover: (chave) => gravarCarrinho(ref.current.carrinho.filter((l) => l.chave !== chave)),
      limparCarrinho: () => gravarCarrinho([]),

      criarPedido: (d) => {
        const atual = ref.current;
        try {
          const antes = atual.dados.pedidos.length;
          const dados = rCriarPedido(
            atual.dados,
            { ...d, solicitanteId: atual.diretorId },
            atual.carrinho.map((l) => ({ brindeId: l.brindeId, variacaoId: l.variacaoId, qtd: l.qtd, personalizacao: l.personalizacao })),
          );
          const pedido = dados.pedidos[antes];
          ref.current = { ...atual, dados, carrinho: [] };
          dispatch({ tipo: "dadosECarrinho", dados, carrinho: [] });
          return { ok: true, dado: pedido };
        } catch (e) {
          return { ok: false, motivo: mensagem(e) }; // carrinho preservado
        }
      },
      mudarEstado: (pedidoId, alvo, motivo) => aplicar((e, quem) => rMudarEstado(e, pedidoId, alvo, quem, motivo)),
      informarOrcamento: (pedidoId, i, valor) => aplicar((e, quem) => rInformarOrcamento(e, pedidoId, i, valor, quem)),
      aceitarOrcamento: (pedidoId, i) => aplicar((e, quem) => rAceitarOrcamento(e, pedidoId, i, quem)),
      ajustarQuantidadeLinha: (pedidoId, i, qtd, nota) =>
        aplicar((e, quem) => rAjustarQuantidadeLinha(e, pedidoId, i, qtd, quem, nota)),
      registrarEntrada: (brindeId, variacaoId, qtd, nota) =>
        aplicar((e, quem) => rRegistrarEntrada(e, brindeId, variacaoId, qtd, quem, nota)),
      registrarAjuste: (brindeId, variacaoId, delta, nota) =>
        aplicar((e, quem) => rRegistrarAjuste(e, brindeId, variacaoId, delta, quem, nota)),
      criarSugestao: (nome, descricao) => aplicar((e, quem) => rCriarSugestao(e, quem, nome, descricao)),
      analisarSugestao: (id) => aplicar((e) => rAnalisarSugestao(e, id)),
      decidirSugestao: (id, alvo, motivo) => aplicar((e) => rDecidirSugestao(e, id, alvo, motivo)),
      salvarBrinde: (brinde) => aplicar((e) => rSalvarBrinde(e, brinde)),
      alternarAtivo: (id) => aplicar((e) => rAlternarAtivo(e, id)),

      brinde: (idOuSlug) => s.dados.brindes.find((b) => b.id === idOuSlug || b.slug === idOuSlug),
      nomeDaPessoa: (id) => s.dados.pessoas.find((p) => p.id === id)?.nome ?? id,
    };
  }, [s, pessoa, aplicar]);

  return <Ctx.Provider value={loja}>{children}</Ctx.Provider>;
}
