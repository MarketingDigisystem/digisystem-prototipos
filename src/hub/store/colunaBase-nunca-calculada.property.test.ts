/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/store/regras.ts + src/hub/store/tipos.ts @ leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: .kiro/specs/kanban-asana-hub (Task 6.3, Property 8).
 *
 * Property 8 — "Recebidos/Problemas nunca gravadas" (Validates: Requirements 1.3).
 *
 * `card.colunaBase` só pode ser `afazer` ou `andamento`. As colunas calculadas
 * (recebidos, concluido, problemas) NUNCA são gravadas como colunaBase:
 *  - aplicarMovimento para `concluido`           → grava concluidoManualEm, NÃO mexe em colunaBase;
 *  - aplicarMovimento para `afazer`/`andamento`  → grava colunaBase (sempre ∈ {afazer, andamento});
 *  - aplicarMovimento para `recebidos`/`problemas` → devolve o card inalterado.
 *
 * Logo, para qualquer card e qualquer destino nas 5 colunas, o colunaBase
 * resultante continua ∈ {afazer, andamento}.
 */
import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { aplicarMovimento, type Coluna } from "./regras";
import type { Card, ColunaBase, OrigemCard } from "./tipos";

// ─── Universo de valores ──────────────────────────────────────────────────

const COLUNAS_BASE: ColunaBase[] = ["afazer", "andamento"];

/** As 5 colunas do quadro — todos os destinos possíveis de um arraste. */
const DESTINOS: Coluna[] = ["recebidos", "afazer", "andamento", "concluido", "problemas"];

const ORIGENS: OrigemCard[] = ["manual", "tendencia", "pedido", "estudio"];

// ─── Arbitrary de card ──────────────────────────────────────────────────────

/**
 * Gera um Card plausível. O ponto que importa para a propriedade é que
 * `colunaBase` é SEMPRE gerado dentro do contrato ({afazer, andamento}); os
 * demais campos variam para exercitar o espaço de entrada.
 */
const cardArb: fc.Arbitrary<Card> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 8 }),
  titulo: fc.string(),
  descricao: fc.string(),
  etiquetas: fc.array(fc.string({ minLength: 1, maxLength: 6 }), { maxLength: 4 }),
  origem: fc.constantFrom(...ORIGENS),
  colunaBase: fc.constantFrom(...COLUNAS_BASE),
  concluidoManualEm: fc.option(fc.date().map((d) => d.toISOString()), { nil: undefined }),
  criadoPor: fc.string({ minLength: 1, maxLength: 6 }),
  criadoEm: fc.date().map((d) => d.toISOString()),
});

const agoraArb = fc.date().map((d) => d.toISOString());
const destinoArb = fc.constantFrom(...DESTINOS);

// ─── Propriedade 8 ──────────────────────────────────────────────────────────

describe("Property 8 — colunaBase nunca é uma coluna calculada (Requirement 1.3)", () => {
  it("todo card gerado já respeita o contrato: colunaBase ∈ {afazer, andamento}", () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        expect(COLUNAS_BASE).toContain(card.colunaBase);
      }),
    );
  });

  it("aplicarMovimento(card, destino, agora) jamais grava uma coluna calculada em colunaBase", () => {
    fc.assert(
      fc.property(cardArb, destinoArb, agoraArb, (card, destino, agora) => {
        const resultado = aplicarMovimento(card, destino, agora);
        // Invariante central: a saída continua com colunaBase ∈ {afazer, andamento}.
        expect(COLUNAS_BASE).toContain(resultado.colunaBase);
      }),
    );
  });

  it("destinos recebidos/problemas deixam o card inalterado (nunca viram colunaBase)", () => {
    fc.assert(
      fc.property(
        cardArb,
        fc.constantFrom<Coluna>("recebidos", "problemas"),
        agoraArb,
        (card, destino, agora) => {
          const resultado = aplicarMovimento(card, destino, agora);
          expect(resultado).toEqual(card);
          expect(resultado.colunaBase).toBe(card.colunaBase);
        },
      ),
    );
  });

  it("destino concluido grava concluidoManualEm mas preserva colunaBase", () => {
    fc.assert(
      fc.property(cardArb, agoraArb, (card, agora) => {
        const resultado = aplicarMovimento(card, "concluido", agora);
        expect(resultado.colunaBase).toBe(card.colunaBase);
        expect(COLUNAS_BASE).toContain(resultado.colunaBase);
        expect(resultado.concluidoManualEm).toBe(agora);
      }),
    );
  });

  it("destinos afazer/andamento gravam exatamente o destino como colunaBase (sempre válido)", () => {
    fc.assert(
      fc.property(
        cardArb,
        fc.constantFrom<Coluna>("afazer", "andamento"),
        agoraArb,
        (card, destino, agora) => {
          const resultado = aplicarMovimento(card, destino, agora);
          expect(resultado.colunaBase).toBe(destino);
          expect(COLUNAS_BASE).toContain(resultado.colunaBase);
        },
      ),
    );
  });
});
