// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
import { describe, expect, it } from "vitest";
import { FRASES, ORDEM, fraseDoDia } from "./frases";

const BANIDOS = /otimiz|potencializ|alavanc|revolucion|garant|maximiz|sinergia/i;

describe("frase do dia", () => {
  it("tem pelo menos 60 frases, com ids únicos e texto/autor preenchidos", () => {
    expect(FRASES.length).toBeGreaterThanOrEqual(60);
    expect(new Set(FRASES.map((f) => f.id)).size).toBe(FRASES.length);
    for (const f of FRASES) {
      expect(f.texto.trim()).not.toBe("");
      expect(f.autor.trim()).not.toBe("");
    }
  });

  it("não usa termos banidos do tom do projeto", () => {
    for (const f of FRASES) expect(BANIDOS.test(`${f.texto} ${f.fonte ?? ""}`), f.texto).toBe(false);
  });

  it("toda frase tem palavra-chave, e ela aparece no texto como palavra inteira", () => {
    const letra = /\p{L}/u;
    for (const f of FRASES) {
      expect(f.chave.trim(), f.texto).not.toBe("");
      const i = f.texto.toLocaleLowerCase("pt-BR").indexOf(f.chave.toLocaleLowerCase("pt-BR"));
      expect(i, `${f.chave} em "${f.texto}"`).toBeGreaterThanOrEqual(0);
      expect(letra.test(f.texto[i - 1] ?? " "), `${f.chave} começa no meio de palavra`).toBe(false);
      expect(letra.test(f.texto[i + f.chave.length] ?? " "), `${f.chave} termina no meio de palavra`).toBe(false);
    }
  });

  it("ORDEM é uma permutação dos índices", () => {
    expect([...ORDEM].sort((a, b) => a - b)).toEqual(FRASES.map((_, i) => i));
  });

  it("é determinística e muda com o dia e com o deslocamento", () => {
    expect(fraseDoDia("2026-10-27")).toBe(fraseDoDia("2026-10-27"));
    expect(fraseDoDia("2026-10-27").id).not.toBe(fraseDoDia("2026-10-28").id);
    expect(fraseDoDia("2026-10-27", 1)).toBe(fraseDoDia("2026-10-28"));
  });

  it("dá a volta no fim da lista", () => {
    expect(fraseDoDia("2026-10-27", FRASES.length)).toBe(fraseDoDia("2026-10-27"));
  });
});
