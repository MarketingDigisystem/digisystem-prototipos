/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/store/regras.ts + src/hub/store/tipos.ts @ leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: .kiro/specs/kanban-asana-hub (Task 6.8, Property 3).
 *
 * Property 3 — "Idempotência de aplicarMovimento" (Validates: Requirements 2.2).
 *
 * Aplicar `aplicarMovimento(card, destino, agora)` duas (ou mais) vezes consecutivas
 * para o MESMO `destino` produz, a partir da segunda aplicação, um estado idêntico
 * ao da primeira — sem acumular efeito. Em concreto:
 *   r1 = aplicarMovimento(card, destino, agora);
 *   r2 = aplicarMovimento(r1,   destino, agora);
 *   r2 deep-equals r1   (∀ destino ∈ 5 colunas, ∀ card).
 *
 * `aplicarMovimento` só mexe em `colunaBase` e `concluidoManualEm`:
 *  - concluido          → grava concluidoManualEm = agora (não mexe em colunaBase);
 *  - afazer/andamento   → grava colunaBase = destino e zera concluidoManualEm;
 *  - recebidos/problemas → devolve o card inalterado (barradas por podeMover antes).
 * Em todos os casos a função é um ponto fixo após a 1ª aplicação PARA UM `agora` FIXO.
 *
 * NUANCE DE DESIGN (documentada de propósito): a idempotência é definida sobre um
 * `agora` FIXO. Para destino=concluido com um `agora` DIFERENTE na 2ª chamada, o
 * `concluidoManualEm` passa a refletir o `agora` mais recente — isso é por design
 * (o carimbo de conclusão reflete o último instante), e NÃO viola a idempotência,
 * que vale para o mesmo `agora`. O que precisa permanecer estável mesmo com `agora`
 * diferente é a `colunaBase` (concluido não altera a base).
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
 * Gera um Card plausível. `colunaBase` fica dentro do contrato ({afazer,
 * andamento}); `concluidoManualEm` pode já vir preenchido ou vazio, para
 * exercitar tanto a transição quanto o ponto fixo.
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

// ─── Propriedade 3 ──────────────────────────────────────────────────────────

describe("Property 3 — Idempotência de aplicarMovimento (Requirement 2.2)", () => {
  it("aplicar 2x o mesmo destino com o MESMO agora: r2 é idêntico a r1 (∀ card, ∀ destino)", () => {
    fc.assert(
      fc.property(cardArb, destinoArb, agoraArb, (card, destino, agora) => {
        const r1 = aplicarMovimento(card, destino, agora);
        const r2 = aplicarMovimento(r1, destino, agora);
        // Ponto fixo: a 2ª aplicação não acumula nenhuma mudança.
        expect(r2).toEqual(r1);
        // Garantia explícita dos únicos campos que a função pode tocar.
        expect(r2.colunaBase).toBe(r1.colunaBase);
        expect(r2.concluidoManualEm).toBe(r1.concluidoManualEm);
      }),
    );
  });

  it("aplicar N vezes (≥2) o mesmo destino converge ao estado de r1 a partir da 2ª", () => {
    fc.assert(
      fc.property(
        cardArb,
        destinoArb,
        agoraArb,
        fc.integer({ min: 2, max: 6 }),
        (card, destino, agora, n) => {
          const r1 = aplicarMovimento(card, destino, agora);
          let atual = r1;
          for (let i = 1; i < n; i++) {
            atual = aplicarMovimento(atual, destino, agora);
            // Toda aplicação a partir da 2ª reproduz exatamente r1.
            expect(atual).toEqual(r1);
          }
        },
      ),
    );
  });

  it("destino afazer/andamento: 2ª aplicação não altera colunaBase nem reintroduz concluidoManualEm", () => {
    fc.assert(
      fc.property(
        cardArb,
        fc.constantFrom<Coluna>("afazer", "andamento"),
        agoraArb,
        (card, destino, agora) => {
          const r1 = aplicarMovimento(card, destino, agora);
          const r2 = aplicarMovimento(r1, destino, agora);
          expect(r1.colunaBase).toBe(destino);
          expect(r1.concluidoManualEm).toBeUndefined();
          expect(r2).toEqual(r1);
        },
      ),
    );
  });

  it("destino concluido com o MESMO agora: 2ª aplicação é ponto fixo (concluidoManualEm estável)", () => {
    fc.assert(
      fc.property(cardArb, agoraArb, (card, agora) => {
        const r1 = aplicarMovimento(card, "concluido", agora);
        const r2 = aplicarMovimento(r1, "concluido", agora);
        expect(r1.concluidoManualEm).toBe(agora);
        expect(r2).toEqual(r1);
        expect(r2.colunaBase).toBe(card.colunaBase);
      }),
    );
  });

  it("destinos read-only recebidos/problemas: aplicar 2x devolve o card inalterado (ponto fixo trivial)", () => {
    fc.assert(
      fc.property(
        cardArb,
        fc.constantFrom<Coluna>("recebidos", "problemas"),
        agoraArb,
        (card, destino, agora) => {
          const r1 = aplicarMovimento(card, destino, agora);
          const r2 = aplicarMovimento(r1, destino, agora);
          expect(r1).toEqual(card);
          expect(r2).toEqual(r1);
        },
      ),
    );
  });

  it("NUANCE: destino concluido com agora DIFERENTE — colunaBase estável; concluidoManualEm reflete o agora mais recente (por design)", () => {
    fc.assert(
      fc.property(
        cardArb,
        agoraArb,
        agoraArb,
        (card, agora1, agora2) => {
          const r1 = aplicarMovimento(card, "concluido", agora1);
          const r2 = aplicarMovimento(r1, "concluido", agora2);
          // A idempotência é definida sobre um `agora` FIXO; com `agora` diferente,
          // o carimbo acompanha o instante mais recente — e isso é esperado.
          expect(r2.concluidoManualEm).toBe(agora2);
          // O que permanece invariante mesmo com `agora` diferente: a base não muda.
          expect(r2.colunaBase).toBe(card.colunaBase);
          expect(r2.colunaBase).toBe(r1.colunaBase);
        },
      ),
    );
  });
});
