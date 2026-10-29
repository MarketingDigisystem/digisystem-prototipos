/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/store/regras.ts + tipos.ts @ leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: .kiro/specs/kanban-asana-hub/design.md (Property 4).
 *
 * Property 4 — Reversibilidade de Problemas.
 * Validates: Requirements 1.2 (e requisito 1.3 do mesmo documento: o card volta
 * sozinho à coluna base/Concluído quando o último problema aberto é resolvido,
 * SEM nenhum arraste manual).
 *
 * Estratégia: um gerador fast-check monta um DadosHub em que um card está parado
 * na coluna `problemas` (`cardParou` verdadeiro) por causa de um ou mais
 * problemas ABERTOS. Em seguida produzimos um segundo DadosHub idêntico, só que
 * com todos esses problemas marcados como resolvidos (`resolvidoEm` setado). A
 * propriedade afirma que, no estado resolvido, `colunaDoCard` NÃO devolve mais
 * `problemas` e sim a coluna base derivada (`afazer`/`andamento`/`concluido`).
 *
 * Importa só de ./regras e ./tipos (regras puras — sem React, sem rede).
 */
import { describe, expect, test } from "vitest";
import fc from "fast-check";
import { cardParou, colunaDoCard, pendentesDoCard, temPost } from "./regras";
import type {
  Card,
  DadosHub,
  Post,
  Problema,
  Subtarefa,
  TipoProblema,
} from "./tipos";

// ─── Helpers de construção ──────────────────────────────────────────────────

/** DadosHub mínimo: só as coleções que as regras de coluna/problema leem. */
function montarDados(partes: {
  cards: Card[];
  subtarefas?: Subtarefa[];
  posts?: Post[];
  problemas?: Problema[];
}): DadosHub {
  // As demais coleções não são tocadas por colunaDoCard/cardParou/pendentesDoCard/
  // itemTravado/temPost; ficam vazias. Cast porque é um fixture de regras puras.
  return {
    usuarios: [],
    solicitantes: [],
    etiquetas: [],
    cards: partes.cards,
    subtarefas: partes.subtarefas ?? [],
    comentarios: [],
    posts: partes.posts ?? [],
    problemas: partes.problemas ?? [],
    decisoes: [],
    tendencias: [],
    concorrentes: [],
    swot: [],
    swotAnalisadoEm: "",
    marca: {} as DadosHub["marca"],
    webhooks: [],
    prompts: [],
    camposAgente: { kicker: false, titulo: false, subtitulo: false },
    historico: { pedidos: [], entregas: [], problemas: [] },
  } as DadosHub;
}

function fazerCard(id: string, colunaBase: "afazer" | "andamento"): Card {
  return {
    id,
    titulo: `Card ${id}`,
    descricao: "",
    etiquetas: [],
    origem: "manual",
    colunaBase,
    criadoPor: "u1",
    criadoEm: "2026-10-08T00:00:00.000Z",
  };
}

function fazerSubtarefa(id: string, cardId: string, concluida: boolean, ordem: number): Subtarefa {
  return {
    id,
    cardId,
    titulo: `Sub ${id}`,
    concluidaEm: concluida ? "2026-10-08T00:00:00.000Z" : undefined,
    ordem,
    criadoEm: "2026-10-08T00:00:00.000Z",
  };
}

function fazerProblema(
  id: string,
  cardId: string,
  alvo: Problema["alvo"],
  tipo: TipoProblema,
  resolvido: boolean,
): Problema {
  return {
    id,
    tipo,
    alvo,
    cardId,
    motivo: "motivo de teste suficiente",
    abertoPor: "u1",
    abertoEm: "2026-10-08T00:00:00.000Z",
    ...(resolvido
      ? { resolvidoEm: "2026-10-08T01:00:00.000Z", resolvidoPor: "u1" }
      : {}),
  };
}

/** Marca TODOS os problemas abertos de um card como resolvidos. */
function resolverTudo(dados: DadosHub, cardId: string): DadosHub {
  return {
    ...dados,
    problemas: dados.problemas.map((p) =>
      p.cardId === cardId && !p.resolvidoEm
        ? { ...p, resolvidoEm: "2026-10-08T02:00:00.000Z", resolvidoPor: "u1" }
        : p,
    ),
  };
}

// ─── Gerador ─────────────────────────────────────────────────────────────────

const CARD_ID = "card-1";
const tipoProblemaArb = fc.constantFrom<TipoProblema>(
  "reprovado",
  "aguardando_solicitante",
  "bloqueado",
);

/**
 * Gera um DadosHub em que o card está parado em `problemas`. Dois caminhos para
 * `cardParou` ficar verdadeiro:
 *   A) um problema de alvo `card` (trava tudo, independentemente dos pendentes);
 *   B) problemas em subtarefa cobrindo TODA subtarefa pendente (todo pendente
 *      travado). Sem posts para manter o controle de pendência pelo concluidaEm.
 *
 * Em ambos os caminhos, resolver os problemas tem que liberar o card de verdade
 * (nenhum problema aberto sobra), então a reversibilidade é genuína.
 */
const cenarioArb = fc
  .record({
    colunaBase: fc.constantFrom<"afazer" | "andamento">("afazer", "andamento"),
    // Caminho A = problema no card inteiro; Caminho B = travar via subtarefas.
    caminhoCard: fc.boolean(),
    // Nº de subtarefas pendentes (todas serão travadas no caminho B).
    nPendentes: fc.integer({ min: 0, max: 3 }),
    // Nº de subtarefas já concluídas (não precisam estar travadas).
    nConcluidas: fc.integer({ min: 0, max: 2 }),
    tipoCard: tipoProblemaArb,
    tiposSub: fc.array(tipoProblemaArb, { minLength: 0, maxLength: 3 }),
  })
  .map((c) => {
    const card = fazerCard(CARD_ID, c.colunaBase);

    const subtarefas: Subtarefa[] = [];
    for (let i = 0; i < c.nPendentes; i++) {
      subtarefas.push(fazerSubtarefa(`sub-p-${i}`, CARD_ID, false, i));
    }
    for (let i = 0; i < c.nConcluidas; i++) {
      subtarefas.push(fazerSubtarefa(`sub-c-${i}`, CARD_ID, true, 100 + i));
    }

    const problemas: Problema[] = [];

    // Caminho A: problema no card inteiro trava tudo (short-circuit de cardParou).
    const usarCaminhoCard = c.caminhoCard || c.nPendentes === 0;
    if (usarCaminhoCard) {
      problemas.push(
        fazerProblema("prob-card", CARD_ID, { tipo: "card", id: CARD_ID }, c.tipoCard, false),
      );
    } else {
      // Caminho B: um problema aberto em CADA subtarefa pendente → todo pendente travado.
      for (let i = 0; i < c.nPendentes; i++) {
        const tipo = c.tiposSub[i] ?? "bloqueado";
        problemas.push(
          fazerProblema(
            `prob-sub-${i}`,
            CARD_ID,
            { tipo: "subtarefa", id: `sub-p-${i}` },
            tipo,
            false,
          ),
        );
      }
    }

    return { card, subtarefas, problemas };
  });

// ─── Propriedade ──────────────────────────────────────────────────────────────

describe("Property 4: Reversibilidade de Problemas (Validates: Requirements 1.2)", () => {
  test("resolver todos os problemas tira o card de `problemas` sem arraste manual", () => {
    fc.assert(
      fc.property(cenarioArb, (cenario) => {
        const dadosParado = montarDados({
          cards: [cenario.card],
          subtarefas: cenario.subtarefas,
          problemas: cenario.problemas,
        });

        // Pré-condição do gerador: o card tem que estar REALMENTE parado em `problemas`.
        // (Se não estiver, o cenário não exercita a propriedade — descartamos.)
        fc.pre(cardParou(dadosParado, cenario.card));
        expect(colunaDoCard(dadosParado, cenario.card)).toBe("problemas");

        // Resolve TODOS os problemas abertos do card — nenhuma ação de arraste.
        const dadosResolvido = resolverTudo(dadosParado, cenario.card.id);

        // Depois de resolver, o card não está mais parado...
        expect(cardParou(dadosResolvido, cenario.card)).toBe(false);

        // ...e volta sozinho para a coluna derivada: afazer/andamento ou concluido.
        const colResolvida = colunaDoCard(dadosResolvido, cenario.card);
        expect(colResolvida).not.toBe("problemas");

        const temPendentes = pendentesDoCard(dadosResolvido, cenario.card).length > 0;
        if (!temPendentes) {
          // Card sem nada pendente → Concluído (requisito 1.3: base OU concluido).
          expect(colResolvida).toBe("concluido");
        } else if (temPost(dadosResolvido, cenario.card.id)) {
          // Não há posts neste gerador, mas o contrato manda: com post → andamento.
          expect(colResolvida).toBe("andamento");
        } else {
          // Volta exatamente para a coluna base escolhida.
          expect(colResolvida).toBe(cenario.card.colunaBase);
        }
      }),
      { numRuns: 500 },
    );
  });
});
