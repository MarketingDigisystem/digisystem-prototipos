/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/store/regras.ts + tipos.ts @ leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: .kiro/specs/kanban-asana-hub/ (Task 6.2).
 *
 * Property 1 — "Posição sempre derivada" (Validates: Requirements 1.1).
 * Teste de propriedade (fast-check) para `colunaDoCard` / `cardsPorColuna` de
 * regras.ts. NÃO toca em regras.ts/tipos.ts — só os importa.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cardsPorColuna, colunaDoCard, type Coluna } from "./regras";
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

// ─── Conjunto de colunas válido (contrato do requisito 1.1) ────────────────

const COLUNAS_VALIDAS: ReadonlySet<Coluna> = new Set<Coluna>([
  "recebidos",
  "afazer",
  "andamento",
  "concluido",
  "problemas",
]);

// ─── DadosHub mínimo ───────────────────────────────────────────────────────
// colunaDoCard/cardsPorColuna só leem cards, subtarefas, posts e problemas.
// Os demais campos de DadosHub existem só para satisfazer o tipo; ficam vazios.
// `marca` nunca é lida por estas funções, então um shell `as` é seguro aqui.

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

// ─── Arbitrários focados nos ramos de decisão de colunaDoCard ──────────────

const colunaBaseArb: fc.Arbitrary<ColunaBase> = fc.constantFrom("afazer", "andamento");

// Inclui estados que mandam o card para fora/recebidos e também os neutros,
// para exercitar o ramo "sem pedido relevante" (que cai nos cálculos abaixo).
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

/**
 * Gera UM grafo-card autocontido: um card + suas subtarefas + os posts dos itens
 * + os problemas do card. Os ids são locais ao índice `i` para nunca colidirem
 * entre cards distintos. Cobre os estados de borda citados na Task 6.2.
 */
function cardGrafoArb(i: number) {
  const cardId = `c${i}`;
  return fc
    .record({
      estadoPedido: estadoPedidoArb,
      colunaBase: colunaBaseArb,
      concluidoManual: fc.boolean(),
      // Subtarefas: nível 2 (filhas do card). Para cada uma, pode haver post.
      subs: fc.array(
        fc.record({
          concluidaManual: fc.boolean(),
          comPost: fc.boolean(),
          postEstado: postEstadoArb,
        }),
        { maxLength: 3 },
      ),
      // Post direto no card (item = o próprio card).
      postCard: fc.option(fc.record({ estado: postEstadoArb }), { nil: undefined }),
      // Problemas abertos/resolvidos ligados ao card, a subtarefas ou a posts.
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

      // Post direto no card.
      if (spec.postCard) {
        posts.push(basePost(`${cardId}-pc`, cardId, spec.postCard.estado));
      }

      // Subtarefas (nível 2) e seus posts.
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

      // Alvos possíveis para os problemas: o card, as subtarefas e os posts.
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

/** DadosHub completo: um punhado de grafos-card independentes. */
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

// ─── Property 1: Posição sempre derivada ───────────────────────────────────

describe("Property 1 — Posição sempre derivada (Validates: Requirements 1.1)", () => {
  it("colunaDoCard devolve exatamente uma das 5 colunas ou null, para todo card", () => {
    fc.assert(
      fc.property(dadosArb, (dados) => {
        for (const card of dados.cards) {
          const col = colunaDoCard(dados, card);
          if (col !== null) {
            expect(COLUNAS_VALIDAS.has(col)).toBe(true);
          }
        }
      }),
    );
  });

  it("cardsPorColuna coloca cada card na coluna derivada, uma só vez, e omite os null", () => {
    fc.assert(
      fc.property(dadosArb, (dados) => {
        const mapa = cardsPorColuna(dados);

        // Toda chave do mapa é uma coluna válida.
        for (const chave of Object.keys(mapa)) {
          expect(COLUNAS_VALIDAS.has(chave as Coluna)).toBe(true);
        }

        for (const card of dados.cards) {
          const derivada = colunaDoCard(dados, card);

          // Em quantas colunas o card aparece e quais.
          const colunasComOCard = (Object.keys(mapa) as Coluna[]).filter((c) =>
            mapa[c].some((x) => x.id === card.id),
          );

          if (derivada === null) {
            // Omitido do quadro: não aparece em nenhuma coluna (req 1.2 / 1.6).
            expect(colunasComOCard).toEqual([]);
          } else {
            // Aparece em EXATAMENTE a coluna derivada e em nenhuma outra (req 1.1).
            expect(colunasComOCard).toEqual([derivada]);
          }
        }

        // Nenhum card duplicado dentro de uma mesma coluna.
        for (const chave of Object.keys(mapa) as Coluna[]) {
          const ids = mapa[chave].map((c) => c.id);
          expect(new Set(ids).size).toBe(ids.length);
        }

        // A soma dos cards colocados == número de cards com derivação não-nula.
        const totalColocados = (Object.keys(mapa) as Coluna[]).reduce(
          (acc, c) => acc + mapa[c].length,
          0,
        );
        const totalNaoNulos = dados.cards.filter((c) => colunaDoCard(dados, c) !== null).length;
        expect(totalColocados).toBe(totalNaoNulos);
      }),
    );
  });
});
