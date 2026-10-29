/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/store/regras.ts + src/hub/store/tipos.ts @ leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: .kiro/specs/kanban-asana-hub (Task 7.5, Property 6).
 *
 * Property 6 — "Um post por item" (Validates: Requirements 4.1).
 *
 * A relação item↔post é 1:1. A regra pura `podeAssociar(dados, post, itemId)`
 * é o guardião disso. Para qualquer DadosHub gerado:
 *
 *   1. Se o item já tem post associado (`postDoItem` devolve algo),      → {ok:false}
 *   2. ou o post já tem itemId (está associado em outro lugar),          → {ok:false}
 *   3. ou o post está `publicado`,                                       → {ok:false}
 *   então `podeAssociar` barra a associação.
 *
 *   4. Sempre que `podeAssociar` devolve {ok:true}, a associação NÃO cria
 *      um segundo post no item — porque o item estava sem post nenhum.
 *
 * Invariante estrutural: nos estados "válidos" gerados, dois posts nunca
 * compartilham o mesmo `itemId` não-nulo (1 post por item no próprio dado).
 */
import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { podeAssociar, postDoItem } from "./regras";
import type {
  Card,
  DadosHub,
  Historico,
  Marca,
  Post,
  PostEstado,
  Rede,
  Subtarefa,
} from "./tipos";

// ─── Universo de valores ──────────────────────────────────────────────────

const ESTADOS_POST: PostEstado[] = ["rascunho", "enviado", "reprovado", "aprovado", "publicado"];
const REDES: Rede[] = ["instagram", "linkedin", "facebook", "youtube"];

/**
 * Pedidos já DECIDIDOS: nunca "recebido"/"triagem"/"negado". Assim o ramo de
 * pedido pendente de `podeAssociar` não entra em cena e não mascara a checagem
 * do 1:1 — a propriedade testa a relação item↔post, não a triagem de pedidos.
 */
const cardArb: fc.Arbitrary<Card> = fc.record({
  id: fc.uuid(),
  titulo: fc.string(),
  descricao: fc.string(),
  etiquetas: fc.constant<string[]>([]),
  origem: fc.constantFrom("manual", "tendencia", "estudio"),
  // sem `pedido`: card interno já decidido / sem triagem pendente.
  colunaBase: fc.constantFrom("afazer", "andamento"),
  criadoPor: fc.string({ minLength: 1, maxLength: 6 }),
  criadoEm: fc.date().map((d) => d.toISOString()),
});

/** Subtarefa de nível 2 (sem parentId), não concluída, de um card existente. */
function subtarefaArb(cardId: string): fc.Arbitrary<Subtarefa> {
  return fc.record({
    id: fc.uuid(),
    cardId: fc.constant(cardId),
    titulo: fc.string(),
    // concluidaEm ausente: subtarefa aberta (concluída barraria por outro motivo).
    ordem: fc.nat({ max: 50 }),
    criadoEm: fc.date().map((d) => d.toISOString()),
  });
}

/** Post "cru" sem itemId; o itemId é atribuído depois, de forma controlada. */
function postBaseArb(): fc.Arbitrary<Omit<Post, "itemId">> {
  return fc.record({
    id: fc.uuid(),
    titulo: fc.string(),
    tituloArte: fc.string(),
    subtituloArte: fc.string(),
    legenda: fc.string(),
    hashtags: fc.constant<string[]>([]),
    redes: fc.array(fc.constantFrom(...REDES), { minLength: 1, maxLength: 2 }),
    ctas: fc.constant([]),
    segmento: fc.string(),
    formato: fc.constantFrom("Post", "Carrossel", "Reels", "Artigo"),
    template: fc.constantFrom("A", "B", "C"),
    estado: fc.constantFrom(...ESTADOS_POST),
    autorId: fc.string({ minLength: 1, maxLength: 6 }),
    criadoEm: fc.date().map((d) => d.toISOString()),
    atualizadoEm: fc.date().map((d) => d.toISOString()),
    arteUrl: fc.constant(""),
  });
}

/** Casca mínima de DadosHub — só cards/subtarefas/posts importam para a regra. */
function montarDados(cards: Card[], subtarefas: Subtarefa[], posts: Post[]): DadosHub {
  return {
    usuarios: [],
    solicitantes: [],
    etiquetas: [],
    cards,
    subtarefas,
    comentarios: [],
    posts,
    problemas: [],
    decisoes: [],
    tendencias: [],
    concorrentes: [],
    swot: [],
    swotAnalisadoEm: new Date(0).toISOString(),
    marca: {} as Marca,
    webhooks: [],
    prompts: [],
    camposAgente: { kicker: false, titulo: false, subtitulo: false },
    historico: { pedidos: [], entregas: [], problemas: [] } as Historico,
  };
}

/**
 * Mundo coerente: um conjunto de itens (cards + subtarefas) e um conjunto de
 * posts, onde cada post pode ou não estar associado a um item — mas, por
 * construção, DOIS posts nunca ficam no mesmo item (atribuição 1:1 por sorteio
 * sem reposição). Devolve também um `itemAlvo` e um `postAlvo` para exercitar
 * `podeAssociar`.
 */
const mundoArb = fc
  .array(cardArb, { minLength: 1, maxLength: 4 })
  .chain((cards) => {
    const subPorCard = cards.map((c) =>
      fc.array(subtarefaArb(c.id), { maxLength: 2 }),
    );
    return fc.tuple(...subPorCard).map((listas) => ({
      cards,
      subtarefas: listas.flat(),
    }));
  })
  .chain(({ cards, subtarefas }) => {
    const itemIds = [...cards.map((c) => c.id), ...subtarefas.map((s) => s.id)];
    return fc
      .array(postBaseArb(), { minLength: 1, maxLength: 5 })
      .chain((postsBase) =>
        // Para cada post, decide se recebe itemId e qual índice de item usar.
        fc
          .array(
            fc.record({
              associar: fc.boolean(),
              itemIdx: fc.nat({ max: Math.max(itemIds.length - 1, 0) }),
            }),
            { minLength: postsBase.length, maxLength: postsBase.length },
          )
          .map((escolhas) => {
            const usados = new Set<string>();
            const posts: Post[] = postsBase.map((base, i) => {
              const esc = escolhas[i];
              let itemId: string | undefined;
              if (esc.associar && itemIds.length > 0) {
                const candidato = itemIds[esc.itemIdx % itemIds.length];
                // sem reposição → garante no máximo 1 post por item no estado
                if (!usados.has(candidato)) {
                  usados.add(candidato);
                  itemId = candidato;
                }
              }
              return { ...base, itemId };
            });
            return { cards, subtarefas, posts, itemIds };
          }),
      );
  })
  .chain((mundo) =>
    fc
      .record({
        itemIdx: fc.nat({ max: Math.max(mundo.itemIds.length - 1, 0) }),
        postIdx: fc.nat({ max: Math.max(mundo.posts.length - 1, 0) }),
      })
      .map(({ itemIdx, postIdx }) => ({
        ...mundo,
        itemAlvo: mundo.itemIds[itemIdx % mundo.itemIds.length],
        postAlvo: mundo.posts[postIdx % mundo.posts.length],
      })),
  );

// ─── Propriedade 6 ──────────────────────────────────────────────────────────

describe("Property 6 — um post por item (Requirement 4.1)", () => {
  it("invariante estrutural: dois posts nunca compartilham o mesmo itemId não-nulo", () => {
    fc.assert(
      fc.property(mundoArb, ({ posts }) => {
        const vistos = new Set<string>();
        for (const p of posts) {
          if (!p.itemId) continue;
          expect(vistos.has(p.itemId)).toBe(false);
          vistos.add(p.itemId);
        }
      }),
    );
  });

  it("barra quando o item já tem post, ou o post já está em outro item, ou o post está publicado", () => {
    fc.assert(
      fc.property(mundoArb, ({ cards, subtarefas, posts, itemAlvo, postAlvo }) => {
        const dados = montarDados(cards, subtarefas, posts);
        const resultado = podeAssociar(dados, postAlvo, itemAlvo);

        const itemJaTemPost = postDoItem(dados, itemAlvo) !== undefined;
        const postJaEmOutro = postAlvo.itemId !== undefined && postAlvo.itemId !== itemAlvo;
        const postPublicado = postAlvo.estado === "publicado";

        if (itemJaTemPost || postJaEmOutro || postPublicado) {
          expect(resultado.ok).toBe(false);
        }
      }),
    );
  });

  it("quando podeAssociar devolve ok, o item NÃO tinha post (associar não cria o 2º)", () => {
    fc.assert(
      fc.property(mundoArb, ({ cards, subtarefas, posts, itemAlvo, postAlvo }) => {
        const dados = montarDados(cards, subtarefas, posts);
        const resultado = podeAssociar(dados, postAlvo, itemAlvo);

        if (resultado.ok) {
          // Pré-condição garantida pela regra: o item estava livre…
          expect(postDoItem(dados, itemAlvo)).toBeUndefined();
          // …e o post não estava preso a nenhum item, nem publicado.
          expect(postAlvo.itemId).toBeUndefined();
          expect(postAlvo.estado).not.toBe("publicado");

          // Simula a associação e confere que o item fica com UM único post.
          const depois = dados.posts.map((p) =>
            p.id === postAlvo.id ? { ...p, itemId: itemAlvo } : p,
          );
          const noItem = depois.filter((p) => p.itemId === itemAlvo);
          expect(noItem).toHaveLength(1);
        }
      }),
    );
  });
});
