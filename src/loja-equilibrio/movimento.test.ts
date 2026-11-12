// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: movimento.ts desta pasta, escrito em 2026-11-12 (tarefa 10.3).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/refino/animacao.md.

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { LIMITE_ESCALONADO, PASSO_ESCALONADO_MS, atrasoEscalonado, estiloEntrada, larguraDaBarra, movimentoReduzido } from "./movimento";

describe("atrasoEscalonado", () => {
  it("escalona de 30 em 30 ms nos 8 primeiros itens", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((i) => atrasoEscalonado(i))).toEqual([0, 30, 60, 90, 120, 150, 180, 210]);
  });

  it("do 9º item em diante não há atraso", () => {
    expect(atrasoEscalonado(8)).toBe(0);
    expect(atrasoEscalonado(9)).toBe(0);
    expect(atrasoEscalonado(200)).toBe(0);
  });

  it("índice inválido não atrasa", () => {
    expect(atrasoEscalonado(-1)).toBe(0);
    expect(atrasoEscalonado(Number.NaN)).toBe(0);
    expect(atrasoEscalonado(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("aceita passo e limite próprios (barras, linha do tempo)", () => {
    expect(atrasoEscalonado(2, 70, 4)).toBe(140);
    expect(atrasoEscalonado(4, 70, 4)).toBe(0);
  });

  it("propriedade: nunca passa de (limite - 1) * passo e é não decrescente até o limite", () => {
    fc.assert(
      fc.property(fc.integer({ min: -5, max: 500 }), (i) => {
        const a = atrasoEscalonado(i);
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThanOrEqual((LIMITE_ESCALONADO - 1) * PASSO_ESCALONADO_MS);
        if (i >= 0 && i < LIMITE_ESCALONADO - 1) expect(atrasoEscalonado(i + 1)).toBeGreaterThan(a);
      }),
    );
  });
});

describe("estiloEntrada", () => {
  it("devolve animationDelay em ms só quando há atraso", () => {
    expect(estiloEntrada(0)).toEqual({});
    expect(estiloEntrada(3)).toEqual({ animationDelay: "90ms" });
    expect(estiloEntrada(12)).toEqual({});
  });
});

describe("larguraDaBarra", () => {
  it("a maior barra ocupa 100% e as outras são proporcionais", () => {
    expect(larguraDaBarra(200, 200)).toBe(100);
    expect(larguraDaBarra(100, 200)).toBe(50);
  });

  it("valor pequeno ou zero mantém 2% para a barra continuar visível", () => {
    expect(larguraDaBarra(0, 200)).toBe(2);
    expect(larguraDaBarra(1, 1000)).toBe(2);
  });

  it("entradas inválidas caem no mínimo, nunca em NaN", () => {
    expect(larguraDaBarra(10, 0)).toBe(2);
    expect(larguraDaBarra(Number.NaN, 10)).toBe(2);
    expect(larguraDaBarra(10, Number.NaN)).toBe(2);
  });

  it("propriedade: sempre entre o mínimo e 100, e monótona no valor", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1e6, noNaN: true }), fc.double({ min: 0, max: 1e6, noNaN: true }), fc.double({ min: 0, max: 1e6, noNaN: true }), (a, b, m) => {
        const x = larguraDaBarra(a, m);
        const y = larguraDaBarra(b, m);
        expect(x).toBeGreaterThanOrEqual(2);
        expect(x).toBeLessThanOrEqual(100);
        if (a <= b) expect(x).toBeLessThanOrEqual(y);
      }),
    );
  });
});

describe("movimentoReduzido", () => {
  it("sem window (ambiente de teste em node) não reduz e não quebra", () => {
    expect(movimentoReduzido()).toBe(false);
  });
});
