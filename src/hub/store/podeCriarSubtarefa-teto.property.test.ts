/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/store/regras.ts + src/hub/store/tipos.ts @ leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: .kiro/specs/kanban-asana-hub (Task 7.2, Property 5).
 *
 * Property 5 — "Teto de níveis" (Validates: Requirements 3.1).
 *
 * ∀ item: nivel(item) ≤ 3 (card = 1, subtarefa = 2, sub-subtarefa = 3). Não
 * existe nível 4. `podeCriarSubtarefa(dados, paiId)` recusa qualquer tentativa
 * de criar um filho que ultrapassaria NIVEL_MAXIMO (3):
 *  - pai no nível 3 (subtarefa com parentId)  → SEMPRE {ok:false}, com motivo
 *    citando o limite de 3 níveis (criar o filho seria nível 4, proibido);
 *  - pai no nível 1 (card) ou nível 2 (subtarefa sem parentId) → a profundidade
 *    é válida, então a criação só é permitida ({ok:true}) QUANDO o pedido do
 *    card não está bloqueando (recebido/triagem/negado). Nunca é permitida a uma
 *    profundidade que estouraria o teto.
 *
 * O oráculo de profundidade é `itemPorId(dados, paiId).nivel` — a mesma leitura
 * que a regra usa internamente, exercitada aqui sobre árvores geradas.
 */
import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { NIVEL_MAXIMO, itemPorId, podeCriarSubtarefa } from "./regras";
import type { Card, DadosHub, EstadoTriagem, Subtarefa } from "./tipos";

// ─── DadosHub mínimo ────────────────────────────────────────────────────────

/**
 * A regra sob teste só toca em `cards` e `subtarefas` (via itemPorId/cardPorId).
 * Os demais campos existem só para o objeto satisfazer o tipo DadosHub; ficam
 * vazios porque nenhuma das funções no caminho os lê.
 */
function dadosDe(cards: Card[], subtarefas: Subtarefa[]): DadosHub {
  return {
    usuarios: [],
    solicitantes: [],
    etiquetas: [],
    cards,
    subtarefas,
    comentarios: [],
    posts: [],
    problemas: [],
    decisoes: [],
    tendencias: [],
    concorrentes: [],
    swot: [],
    swotAnalisadoEm: "2026-01-01T00:00:00.000Z",
    // marca não é lida por podeCriarSubtarefa; cast estreito para o mínimo.
    marca: {} as DadosHub["marca"],
    webhooks: [],
    prompts: [],
    camposAgente: { kicker: false, titulo: false, subtitulo: false },
    historico: { pedidos: [], entregas: [], problemas: [] },
  };
}

// ─── Estados de pedido ──────────────────────────────────────────────────────

/** Estados que BLOQUEIAM a criação de subtarefa (precisam de decisão antes). */
const ESTADOS_BLOQUEANTES: EstadoTriagem[] = ["recebido", "triagem", "negado"];
/** Estados que NÃO bloqueiam (pedido já resolvido como card normal). */
const ESTADOS_LIVRES: EstadoTriagem[] = ["aprovado", "devolvido"];

// ─── Arbitrary de árvore (card + subtarefas níveis 2 e 3) ───────────────────

type Arvore = { dados: DadosHub; cardId: string; nivel2Ids: string[]; nivel3Ids: string[] };

/**
 * Gera um card e uma árvore de subtarefas: algumas subtarefas de nível 2
 * (parentId ausente, filhas diretas do card) e, para parte delas, subtarefas de
 * nível 3 (parentId apontando para uma nível 2). Pedido opcional, podendo estar
 * em estado bloqueante ou livre.
 */
const arvoreArb: fc.Arbitrary<Arvore> = fc
  .record({
    cardIdx: fc.integer({ min: 0, max: 9999 }),
    nivel2Qtd: fc.integer({ min: 1, max: 4 }),
    // para cada nível 2, 0..2 filhas de nível 3
    filhasPorN2: fc.array(fc.integer({ min: 0, max: 2 }), { minLength: 4, maxLength: 4 }),
    pedido: fc.oneof(
      fc.constant<undefined>(undefined),
      fc.constantFrom(...ESTADOS_BLOQUEANTES).map((estado) => ({ bloqueante: true, estado })),
      fc.constantFrom(...ESTADOS_LIVRES).map((estado) => ({ bloqueante: false, estado })),
    ),
  })
  .map(({ cardIdx, nivel2Qtd, filhasPorN2, pedido }) => {
    const cardId = `card-${cardIdx}`;
    const card: Card = {
      id: cardId,
      titulo: `Card ${cardIdx}`,
      descricao: "",
      etiquetas: [],
      origem: pedido ? "pedido" : "manual",
      colunaBase: "afazer",
      criadoPor: "u1",
      criadoEm: "2026-01-01T00:00:00.000Z",
      ...(pedido
        ? {
            pedido: {
              solicitanteId: "s1",
              categoria: "post" as const,
              meta: { tipoPedido: "post" as const },
              estado: pedido.estado,
              recebidoEm: "2026-01-01T00:00:00.000Z",
              parecer: {
                nivel: "verde" as const,
                prontidao: 1,
                titulo: "",
                resumo: "",
                pontos: [],
              },
            },
          }
        : {}),
    };

    const subtarefas: Subtarefa[] = [];
    const nivel2Ids: string[] = [];
    const nivel3Ids: string[] = [];
    let ordem = 0;
    for (let i = 0; i < nivel2Qtd; i++) {
      const n2Id = `${cardId}-s${i}`;
      nivel2Ids.push(n2Id);
      subtarefas.push({
        id: n2Id,
        cardId,
        titulo: `Sub ${i}`,
        ordem: ordem++,
        criadoEm: "2026-01-01T00:00:00.000Z",
      });
      const filhas = filhasPorN2[i] ?? 0;
      for (let j = 0; j < filhas; j++) {
        const n3Id = `${n2Id}-n${j}`;
        nivel3Ids.push(n3Id);
        subtarefas.push({
          id: n3Id,
          cardId,
          parentId: n2Id,
          titulo: `Sub ${i}.${j}`,
          ordem: ordem++,
          criadoEm: "2026-01-01T00:00:00.000Z",
        });
      }
    }

    return { dados: dadosDe([card], subtarefas), cardId, nivel2Ids, nivel3Ids };
  });

/** Escolhe um paiId arbitrário dentro da árvore (card, qualquer nível 2 ou nível 3). */
const arvoreComPaiArb = arvoreArb.chain((arvore) => {
  const candidatos = [arvore.cardId, ...arvore.nivel2Ids, ...arvore.nivel3Ids];
  return fc.constantFrom(...candidatos).map((paiId) => ({ arvore, paiId }));
});

// ─── Propriedade 5 ──────────────────────────────────────────────────────────

describe("Property 5 — teto de níveis (Requirement 3.1)", () => {
  it("NIVEL_MAXIMO é 3 (card, subtarefa, sub-subtarefa)", () => {
    expect(NIVEL_MAXIMO).toBe(3);
  });

  it("nenhum item gerado passa de nível 3 (a árvore nunca estoura o teto)", () => {
    fc.assert(
      fc.property(arvoreArb, (arvore) => {
        const todos = [arvore.cardId, ...arvore.nivel2Ids, ...arvore.nivel3Ids];
        for (const id of todos) {
          const item = itemPorId(arvore.dados, id);
          expect(item).toBeDefined();
          expect(item!.nivel).toBeLessThanOrEqual(NIVEL_MAXIMO);
        }
      }),
    );
  });

  it("pai no nível 3 → SEMPRE {ok:false} com motivo citando o limite de 3 níveis", () => {
    fc.assert(
      fc.property(arvoreArb, (arvore) => {
        fc.pre(arvore.nivel3Ids.length > 0);
        for (const paiId of arvore.nivel3Ids) {
          // Confirma pelo oráculo que o pai é mesmo nível 3.
          expect(itemPorId(arvore.dados, paiId)!.nivel).toBe(NIVEL_MAXIMO);
          const r = podeCriarSubtarefa(arvore.dados, paiId);
          expect(r.ok).toBe(false);
          // motivo deve mencionar o limite de 3 níveis.
          const motivo = (r as { ok: false; motivo: string }).motivo;
          expect(motivo).toMatch(/3 n[íi]veis/i);
        }
      }),
    );
  });

  it("podeCriarSubtarefa só autoriza quando a profundidade resultante ≤ 3", () => {
    fc.assert(
      fc.property(arvoreComPaiArb, ({ arvore, paiId }) => {
        const pai = itemPorId(arvore.dados, paiId)!;
        const r = podeCriarSubtarefa(arvore.dados, paiId);
        if (r.ok) {
          // Se autorizou, o filho criado teria nível pai+1, que precisa caber no teto.
          expect(pai.nivel + 1).toBeLessThanOrEqual(NIVEL_MAXIMO);
          expect(pai.nivel).toBeLessThan(NIVEL_MAXIMO);
        }
      }),
    );
  });

  it("profundidade válida (nível 1 ou 2) + pedido não-bloqueante → {ok:true}", () => {
    fc.assert(
      fc.property(arvoreComPaiArb, ({ arvore, paiId }) => {
        const pai = itemPorId(arvore.dados, paiId)!;
        fc.pre(pai.nivel < NIVEL_MAXIMO);
        const estadoPedido = pai.card.pedido?.estado;
        const bloqueante = estadoPedido !== undefined && ESTADOS_BLOQUEANTES.includes(estadoPedido);
        fc.pre(!bloqueante);
        const r = podeCriarSubtarefa(arvore.dados, paiId);
        expect(r.ok).toBe(true);
      }),
    );
  });
});
