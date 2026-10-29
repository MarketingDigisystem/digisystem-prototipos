/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/store/regras.ts + tipos.ts @ leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: .kiro/specs/kanban-asana-hub/ (Task 6.7).
 *
 * Property 2 — "Drag não burla regra" (Validates: Requirements 2.1).
 * Teste de propriedade (fast-check) para `podeMover` de regras.ts. NÃO toca em
 * regras.ts/tipos.ts — só os importa. Arquivo autocontido.
 *
 * O que a propriedade garante: um arraste que `podeMover` REJEITA nunca pode
 * virar mudança de estado. Em termos verificáveis sobre a regra pura:
 *  - `podeMover` é pura/sem efeito colateral: não muta `dados` nem `card`;
 *  - colunas calculadas (recebidos/problemas) ficam barradas como ORIGEM e
 *    como DESTINO;
 *  - card com post não vai para `afazer`;
 *  - só card sem conteúdo (sem post e sem subtarefa) entra em `concluido`;
 *  - todo `{ok:false}` carrega um `motivo` não vazio.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  cardSemConteudo,
  colunaDoCard,
  COLUNAS,
  podeMover,
  temPost,
  type Coluna,
} from "./regras";
import type {
  Card,
  ColunaBase,
  DadosHub,
  EstadoTriagem,
  Marca,
  Post,
  PostEstado,
  Problema,
  Subtarefa,
  TipoProblema,
} from "./tipos";

// Todas as 5 colunas como destino possível de um arraste.
const COLUNAS_TODAS: readonly Coluna[] = COLUNAS.map((c) => c.id);

// ─── DadosHub mínimo (idem Property 1: só cards/subtarefas/posts/problemas são lidos) ──

const MARCA_VAZIA = {} as Marca;

function montarDados(
  cards: Card[],
  subtarefas: Subtarefa[],
  posts: Post[],
  problemas: Problema[],
): DadosHub {
  return {
    usuarios: [],
    solicitantes: [],
    etiquetas: [],
    cards,
    subtarefas,
    comentarios: [],
    posts,
    problemas,
    decisoes: [],
    tendencias: [],
    concorrentes: [],
    swot: [],
    swotAnalisadoEm: "2026-01-01T00:00:00.000Z",
    marca: MARCA_VAZIA,
    webhooks: [],
    prompts: [],
    camposAgente: { kicker: false, titulo: false, subtitulo: false },
    historico: { pedidos: [], entregas: [], problemas: [] },
  };
}

// ─── Arbitrários (grafo-card autocontido, ids locais ao índice) ────────────

const colunaBaseArb: fc.Arbitrary<ColunaBase> = fc.constantFrom("afazer", "andamento");

const estadoPedidoArb: fc.Arbitrary<EstadoTriagem | undefined> = fc.constantFrom<
  EstadoTriagem | undefined
>(undefined, "recebido", "triagem", "aprovado", "devolvido", "negado");

const postEstadoArb: fc.Arbitrary<PostEstado> = fc.constantFrom(
  "rascunho",
  "enviado",
  "reprovado",
  "aprovado",
  "publicado",
);

const tipoProblemaArb: fc.Arbitrary<TipoProblema> = fc.constantFrom(
  "reprovado",
  "aguardando_solicitante",
  "bloqueado",
);

function cardGrafoArb(i: number) {
  const cardId = `c${i}`;
  return fc
    .record({
      estadoPedido: estadoPedidoArb,
      colunaBase: colunaBaseArb,
      concluidoManual: fc.boolean(),
      subs: fc.array(
        fc.record({
          concluidaManual: fc.boolean(),
          comPost: fc.boolean(),
          postEstado: postEstadoArb,
        }),
        { maxLength: 3 },
      ),
      postCard: fc.option(fc.record({ estado: postEstadoArb }), { nil: undefined }),
      problemas: fc.array(
        fc.record({
          tipo: tipoProblemaArb,
          alvoTipo: fc.constantFrom<"card" | "subtarefa" | "post">("card", "subtarefa", "post"),
          alvoIdx: fc.nat({ max: 4 }),
          resolvido: fc.boolean(),
        }),
        { maxLength: 3 },
      ),
    })
    .map((spec) => {
      const subtarefas: Subtarefa[] = [];
      const posts: Post[] = [];
      const problemas: Problema[] = [];

      const basePost = (id: string, itemId: string, estado: PostEstado): Post => ({
        id,
        titulo: "Post",
        tituloArte: "",
        subtituloArte: "",
        legenda: "",
        hashtags: [],
        redes: ["instagram"],
        ctas: [],
        segmento: "",
        formato: "Post",
        template: "A",
        estado,
        autorId: "u",
        criadoEm: "2026-01-01T00:00:00.000Z",
        atualizadoEm: "2026-01-01T00:00:00.000Z",
        itemId,
        arteUrl: "",
      });

      if (spec.postCard) {
        posts.push(basePost(`${cardId}-pc`, cardId, spec.postCard.estado));
      }

      spec.subs.forEach((s, j) => {
        const subId = `${cardId}-s${j}`;
        subtarefas.push({
          id: subId,
          cardId,
          titulo: `Sub ${j}`,
          ordem: j,
          criadoEm: "2026-01-01T00:00:00.000Z",
          concluidaEm: s.concluidaManual ? "2026-01-02T00:00:00.000Z" : undefined,
        });
        if (s.comPost) {
          posts.push(basePost(`${subId}-p`, subId, s.postEstado));
        }
      });

      const subIds = subtarefas.map((s) => s.id);
      const postIds = posts.map((p) => p.id);
      spec.problemas.forEach((pb, k) => {
        let alvoId: string;
        if (pb.alvoTipo === "card") {
          alvoId = cardId;
        } else if (pb.alvoTipo === "subtarefa") {
          alvoId = subIds.length ? subIds[pb.alvoIdx % subIds.length] : cardId;
        } else {
          alvoId = postIds.length ? postIds[pb.alvoIdx % postIds.length] : cardId;
        }
        const alvoTipo: Problema["alvo"]["tipo"] =
          pb.alvoTipo === "subtarefa" && subIds.length === 0
            ? "card"
            : pb.alvoTipo === "post" && postIds.length === 0
              ? "card"
              : pb.alvoTipo;
        problemas.push({
          id: `${cardId}-pb${k}`,
          tipo: pb.tipo,
          alvo: { tipo: alvoTipo, id: alvoId },
          cardId,
          motivo: "motivo de exemplo",
          abertoPor: "u",
          abertoEm: "2026-01-03T00:00:00.000Z",
          resolvidoEm: pb.resolvido ? "2026-01-04T00:00:00.000Z" : undefined,
        });
      });

      const card: Card = {
        id: cardId,
        titulo: `Card ${i}`,
        descricao: "",
        etiquetas: [],
        origem: spec.estadoPedido ? "pedido" : "manual",
        colunaBase: spec.colunaBase,
        concluidoManualEm: spec.concluidoManual ? "2026-01-05T00:00:00.000Z" : undefined,
        criadoPor: "u",
        criadoEm: "2026-01-01T00:00:00.000Z",
        pedido: spec.estadoPedido
          ? {
              solicitanteId: "s",
              categoria: "post",
              meta: { tipoPedido: "post" },
              estado: spec.estadoPedido,
              recebidoEm: "2026-01-01T00:00:00.000Z",
              parecer: { nivel: "verde", prontidao: 1, titulo: "", resumo: "", pontos: [] },
            }
          : undefined,
      };

      return { card, subtarefas, posts, problemas };
    });
}

const dadosArb: fc.Arbitrary<DadosHub> = fc
  .array(fc.nat({ max: 1000 }), { minLength: 1, maxLength: 6 })
  .chain((seeds) =>
    fc.tuple(...seeds.map((_, i) => cardGrafoArb(i))).map((grafos) => {
      const cards: Card[] = [];
      const subtarefas: Subtarefa[] = [];
      const posts: Post[] = [];
      const problemas: Problema[] = [];
      for (const g of grafos) {
        cards.push(g.card);
        subtarefas.push(...g.subtarefas);
        posts.push(...g.posts);
        problemas.push(...g.problemas);
      }
      return montarDados(cards, subtarefas, posts, problemas);
    }),
  );

/** Um cenário completo de arraste: os dados, UM card deles e um destino qualquer. */
const movimentoArb = dadosArb.chain((dados) =>
  fc.record({
    dados: fc.constant(dados),
    cardIdx: fc.nat({ max: Math.max(0, dados.cards.length - 1) }),
    destino: fc.constantFrom(...COLUNAS_TODAS),
  }),
);

// ─── Property 2: Drag não burla regra ──────────────────────────────────────

describe("Property 2 — Drag não burla regra (Validates: Requirements 2.1)", () => {
  it("podeMover é pura: não muta `dados` nem `card`", () => {
    fc.assert(
      fc.property(movimentoArb, ({ dados, cardIdx, destino }) => {
        const card = dados.cards[cardIdx];
        const antesDados = JSON.stringify(dados);
        const antesCard = JSON.stringify(card);

        podeMover(dados, card, destino);

        // Nenhum efeito colateral: cópias profundas idênticas antes/depois.
        expect(JSON.stringify(dados)).toBe(antesDados);
        expect(JSON.stringify(card)).toBe(antesCard);
      }),
    );
  });

  it("colunas calculadas (recebidos/problemas) são barradas como ORIGEM", () => {
    fc.assert(
      fc.property(movimentoArb, ({ dados, cardIdx, destino }) => {
        const card = dados.cards[cardIdx];
        const atual = colunaDoCard(dados, card);
        if (atual !== "recebidos" && atual !== "problemas") return; // só interessa essa origem
        if (atual === destino) return; // mover para a própria coluna é no-op legítimo

        const r = podeMover(dados, card, destino);
        expect(r.ok).toBe(false);
      }),
    );
  });

  it("colunas calculadas (recebidos/problemas) são barradas como DESTINO", () => {
    fc.assert(
      fc.property(movimentoArb, ({ dados, cardIdx, destino }) => {
        const card = dados.cards[cardIdx];
        const atual = colunaDoCard(dados, card);
        if (atual === null) return; // fora do quadro: outro ramo
        if (destino !== "recebidos" && destino !== "problemas") return;
        if (atual === destino) return; // no-op legítimo

        const r = podeMover(dados, card, destino);
        expect(r.ok).toBe(false);
      }),
    );
  });

  it("card com post não pode ir para `afazer`", () => {
    fc.assert(
      fc.property(movimentoArb, ({ dados, cardIdx }) => {
        const card = dados.cards[cardIdx];
        const atual = colunaDoCard(dados, card);
        if (atual === null || atual === "afazer") return; // precisa de origem válida ≠ destino
        if (!temPost(dados, card.id)) return; // a regra só morde com post

        const r = podeMover(dados, card, "afazer");
        expect(r.ok).toBe(false);
      }),
    );
  });

  it("só card sem conteúdo pode ir para `concluido`; com pendência → bloqueia", () => {
    fc.assert(
      fc.property(movimentoArb, ({ dados, cardIdx }) => {
        const card = dados.cards[cardIdx];
        const atual = colunaDoCard(dados, card);
        if (atual === null || atual === "concluido") return;
        // Origem precisa ser arrastável (recebidos/problemas têm outro bloqueio).
        if (atual === "recebidos" || atual === "problemas") return;

        const r = podeMover(dados, card, "concluido");
        if (cardSemConteudo(dados, card)) {
          expect(r.ok).toBe(true);
        } else {
          expect(r.ok).toBe(false);
        }
      }),
    );
  });

  it("todo {ok:false} carrega um motivo não vazio", () => {
    fc.assert(
      fc.property(movimentoArb, ({ dados, cardIdx, destino }) => {
        const card = dados.cards[cardIdx];
        const r = podeMover(dados, card, destino);
        if (!r.ok) {
          expect(typeof r.motivo).toBe("string");
          expect(r.motivo.trim().length).toBeGreaterThan(0);
        }
      }),
    );
  });
});
