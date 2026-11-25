import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { alternar, podeComparar, LIMITE_COMPARAR, type Selecao } from "./selecao-comparar";

describe("selecao-comparar", () => {
  it("adiciona, remove e preserva a ordem", () => {
    let s: Selecao = [];
    for (const id of ["c", "a", "b"]) s = alternar(s, id).selecao;
    expect(s).toEqual(["c", "a", "b"]);
    expect(alternar(s, "a").selecao).toEqual(["c", "b"]);
  });

  it("com 4 selecionados, adicionar sinaliza limite e não muda", () => {
    const s: Selecao = ["a", "b", "c", "d"];
    const r = alternar(s, "e");
    expect(r.limite).toBe(true);
    expect(r.selecao).toBe(s);
    expect(alternar(s, "b").limite).toBe(false);
  });

  it("podeComparar vale de 2 a 4", () => {
    expect(podeComparar([])).toBe(false);
    expect(podeComparar(["a"])).toBe(false);
    expect(podeComparar(["a", "b"])).toBe(true);
    expect(podeComparar(["a", "b", "c", "d"])).toBe(true);
  });

  it("não muta a entrada", () => {
    const s: Selecao = Object.freeze(["a", "b"]);
    expect(() => alternar(s, "c")).not.toThrow();
    expect(s).toEqual(["a", "b"]);
  });

  // Feature: mercado-redesign-dados, Property 6: Seleção para comparar limitada
  // **Validates: Requirements 8.5**
  it("Property 6: sem duplicados, 0 a 4 itens, e o quinto não entra", () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom("a", "b", "c", "d", "e", "f", "g"), { maxLength: 40 }), (ids) => {
        let s: Selecao = [];
        for (const id of ids) {
          const antes = s;
          const r = alternar(s, id);
          if (!antes.includes(id) && antes.length === LIMITE_COMPARAR) {
            expect(r.selecao).toBe(antes);
            expect(r.limite).toBe(true);
          }
          s = r.selecao;
          expect(new Set(s).size).toBe(s.length);
          expect(s.length).toBeLessThanOrEqual(LIMITE_COMPARAR);
        }
      }),
      { numRuns: 200 },
    );
  });
});
