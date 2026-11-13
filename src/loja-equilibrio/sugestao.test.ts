// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: regras.ts, tipos.ts e mock.ts desta pasta, escritos em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Sugestão de brinde completa", Properties 23, 24 e 25).

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ESTADO_INICIAL } from "./mock";
import { brindesParecidos, criarSugestao, detalhesPreenchidos, validarSugestao } from "./regras";
import type { Brinde, DadosSugestao } from "./tipos";

const base = ESTADO_INICIAL;
const HOJE = "2026-11-11";
const NUM_RUNS = 200;

describe("validarSugestao (exemplos)", () => {
  it("nome vazio e só espaços recusam", () => {
    expect(validarSugestao({ nome: "" }, HOJE).erros.nome).toBe("Informe o nome do brinde.");
    expect(validarSugestao({ nome: "   " }, HOJE).ok).toBe(false);
    expect(validarSugestao({ nome: "Boné" }, HOJE).ok).toBe(true);
  });
  it("link inválido e válido", () => {
    expect(validarSugestao({ nome: "a", link: "ftp://x.com" }, HOJE).erros.link).toBe("Informe um link que comece com http:// ou https://.");
    expect(validarSugestao({ nome: "a", link: "exemplo.com" }, HOJE).ok).toBe(false);
    expect(validarSugestao({ nome: "a", link: "https://exemplo.com/x" }, HOJE).ok).toBe(true);
    expect(validarSugestao({ nome: "a", link: "" }, HOJE).ok).toBe(true);
  });
  it("quantidade 0, -1, 1,5 recusam e 1 vale", () => {
    for (const q of [0, -1, 1.5]) {
      expect(validarSugestao({ nome: "a", quantidadeEstimada: q }, HOJE).erros.quantidadeEstimada).toBe("Informe uma quantidade inteira, a partir de 1.");
    }
    expect(validarSugestao({ nome: "a", quantidadeEstimada: 1 }, HOJE).ok).toBe(true);
  });
  it("data de ontem recusa; hoje e futura valem", () => {
    expect(validarSugestao({ nome: "a", dataNecessaria: "2026-11-10" }, HOJE).erros.dataNecessaria).toBe("Escolha uma data a partir de hoje.");
    expect(validarSugestao({ nome: "a", dataNecessaria: HOJE }, HOJE).ok).toBe(true);
    expect(validarSugestao({ nome: "a", dataNecessaria: "2026-12-01" }, HOJE).ok).toBe(true);
  });
  it("280 caracteres valem e 281 recusam", () => {
    expect(validarSugestao({ nome: "a", porQueCombina: "x".repeat(280) }, HOJE).ok).toBe(true);
    expect(validarSugestao({ nome: "a", porQueCombina: "x".repeat(281) }, HOJE).erros.porQueCombina).toBe("Use até 280 caracteres em Por que combina com a marca.");
  });
  it("as sugestões do mock continuam válidas", () => {
    for (const s of base.sugestoes) {
      expect(validarSugestao({ ...s }, "2026-11-01").ok, s.id).toBe(true);
    }
  });
  it("o mock tem 7 sugestões variadas", () => {
    expect(base.sugestoes).toHaveLength(7);
    expect(base.sugestoes.some((s) => s.estado === "recusada" && s.motivo && s.categoria)).toBe(true);
    expect(base.sugestoes.some((s) => s.estado === "aprovada" && s.categoria)).toBe(true);
  });
});

describe("brindesParecidos (exemplos)", () => {
  it("ignora acento e caixa", () => {
    const r = brindesParecidos(base.brindes, "ESCRITORIO caderno");
    expect(r.length).toBeGreaterThan(0);
    expect(r.some((b) => b.nome.toLowerCase().includes("caderno"))).toBe(true);
    expect(brindesParecidos(base.brindes, "copo TÉRMICO").map((b) => b.id)).toContain("copo-termico");
  });
  it("não devolve brinde inativo", () => {
    const brindes = base.brindes.map((b) => (b.id === "copo-termico" ? { ...b, ativo: false } : b));
    expect(brindesParecidos(brindes, "copo térmico").map((b) => b.id)).not.toContain("copo-termico");
  });
  it("sem parecidos devolve lista vazia", () => {
    expect(brindesParecidos(base.brindes, "zzzxyq")).toEqual([]);
    expect(brindesParecidos(base.brindes, "")).toEqual([]);
  });
});

describe("detalhesPreenchidos (exemplos)", () => {
  it("conta de 0 a 9", () => {
    const passos: DadosSugestao[] = [
      { nome: "a" },
      { nome: "a", categoria: "Outra" },
      { nome: "a", categoria: "Outra", descricao: "d" },
      { nome: "a", categoria: "Outra", descricao: "d", porQueCombina: "p" },
      { nome: "a", categoria: "Outra", descricao: "d", porQueCombina: "p", fotoReferencia: "f.jpg" },
      { nome: "a", categoria: "Outra", descricao: "d", porQueCombina: "p", fotoReferencia: "f.jpg", ocasioes: ["Evento"] },
      { nome: "a", categoria: "Outra", descricao: "d", porQueCombina: "p", fotoReferencia: "f.jpg", ocasioes: ["Evento"], publicos: ["Clientes"] },
      { nome: "a", categoria: "Outra", descricao: "d", porQueCombina: "p", fotoReferencia: "f.jpg", ocasioes: ["Evento"], publicos: ["Clientes"], frequencia: "anual" },
      { nome: "a", categoria: "Outra", descricao: "d", porQueCombina: "p", fotoReferencia: "f.jpg", ocasioes: ["Evento"], publicos: ["Clientes"], frequencia: "anual", quantidadeEstimada: 3 },
      { nome: "a", categoria: "Outra", descricao: "d", porQueCombina: "p", fotoReferencia: "f.jpg", ocasioes: ["Evento"], publicos: ["Clientes"], frequencia: "anual", quantidadeEstimada: 3, comLogo: "sem_logo" },
    ];
    expect(passos.map(detalhesPreenchidos)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it("link e foto contam como um só detalhe", () => {
    expect(detalhesPreenchidos({ nome: "a", link: "https://x.com", fotoReferencia: "f.jpg" })).toBe(1);
  });
});

describe("criarSugestao (exemplos)", () => {
  it("só o nome mantém o comportamento antigo", () => {
    const e = criarSugestao(base, "d1", { nome: "  Boné  " });
    const s = e.sugestoes[e.sugestoes.length - 1];
    expect(s).toEqual({ id: s.id, autorId: "d1", nome: "Boné", descricao: "", estado: "sugerida", em: base.agora });
    expect(Object.keys(s).sort()).toEqual(["autorId", "descricao", "em", "estado", "id", "nome"]);
  });
  it("lança o primeiro erro e não muda o estado", () => {
    expect(() => criarSugestao(base, "d1", { nome: " " })).toThrow("Informe o nome do brinde.");
    expect(() => criarSugestao(base, "d1", { nome: "a", link: "x" })).toThrow("http");
  });
});

/* ---------------------------------------------------------------- */
/* Property 23                                                       */
/* ---------------------------------------------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 23: brindesParecidos é puro, limitado, só ativos e sem estoque", () => {
  // **Validates: Requirements 16.15, 16.16, 16.34**
  const brindeArb: fc.Arbitrary<Brinde> = fc.record({
    ativo: fc.boolean(),
    saldo: fc.integer({ min: 0, max: 999 }),
    reserva: fc.integer({ min: 0, max: 99 }),
    minimo: fc.integer({ min: 0, max: 99 }),
    nome: fc.constantFrom("Caneta azul", "Copo térmico", "Caderno de bambu", "Mochila", "Camiseta", "Caneca"),
    categoria: fc.constantFrom("Escritório", "Bem-estar", "Casa e lazer"),
    i: fc.integer({ min: 0, max: 9999 }),
  }).map(({ i, ...r }) => ({ ...base.brindes[1], ...r, id: `b${i}`, slug: `s${i}` }));

  it("puro, até 3, só ativos, só campos públicos", () => {
    fc.assert(
      fc.property(
        fc.array(brindeArb, { maxLength: 12 }),
        fc.string({ maxLength: 20 }),
        fc.option(fc.constantFrom("Escritório", "BEM-ESTAR", "casa e lazer", "Outra"), { nil: undefined }),
        (brindes, nome, categoria) => {
          const antes = JSON.stringify(brindes);
          const r = brindesParecidos(brindes, nome, categoria);
          expect(JSON.stringify(brindes)).toBe(antes);
          expect(r.length).toBeLessThanOrEqual(3);
          for (const item of r) {
            expect(Object.keys(item).sort()).toEqual(["categoria", "id", "nome", "slug"]);
            expect(brindes.find((b) => b.id === item.id)?.ativo).toBe(true);
          }
          expect(brindesParecidos(brindes, nome, categoria)).toEqual(r);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it("o resultado não muda com o estoque", () => {
    fc.assert(
      fc.property(fc.array(brindeArb, { maxLength: 8 }), fc.constantFrom("caneta", "COPO", "Cadérno"), fc.nat(500), (brindes, nome, s) => {
        const outros = brindes.map((b) => ({ ...b, saldo: s, reserva: 0, minimo: s }));
        expect(brindesParecidos(outros, nome)).toEqual(brindesParecidos(brindes, nome));
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------------------------------------------- */
/* Property 24                                                       */
/* ---------------------------------------------------------------- */

const dadosValidos: fc.Arbitrary<DadosSugestao> = fc.record(
  {
    nome: fc.string({ minLength: 1, maxLength: 30 }).filter((t) => t.trim() !== "").map((t) => t.trim()),
    descricao: fc.string({ maxLength: 40 }).map((t) => t.trim()),
    categoria: fc.constantFrom("Escritório", "Bem-estar", "Outra"),
    porQueCombina: fc.string({ minLength: 1, maxLength: 280 }).map((t) => t.trim()).filter((t) => t !== ""),
    link: fc.constantFrom("https://a.com", "http://b.org/x"),
    fotoReferencia: fc.constantFrom("foto.jpg", "ref.png"),
    ocasioes: fc.subarray(["Evento", "Feira", "Treinamento"], { minLength: 1 }),
    publicos: fc.subarray(["Clientes", "Parceiros"], { minLength: 1 }),
    dataNecessaria: fc.constantFrom("2026-11-11", "2026-12-24", "2027-01-05"),
    frequencia: fc.constantFrom("uma_vez", "todo_mes", "trimestral", "anual"),
    quantidadeEstimada: fc.integer({ min: 1, max: 5000 }),
    faixaCusto: fc.constantFrom("ate_10", "10_30", "30_60", "60_120", "acima_120", "nao_sei"),
    comLogo: fc.constantFrom("com_logo", "sem_logo", "nao_sei"),
  },
  { requiredKeys: ["nome"] },
) as fc.Arbitrary<DadosSugestao>;

describe("Feature: loja-equilibrio-digiplace, Property 24: criarSugestao preserva os dados e mantém o comportamento antigo", () => {
  // **Validates: Requirements 16.1, 16.21, 16.22, 16.23**
  it("grava exatamente os campos presentes e os antigos continuam", () => {
    fc.assert(
      fc.property(dadosValidos, (dados) => {
        const e = criarSugestao(base, "d2", dados);
        expect(e.sugestoes).toHaveLength(base.sugestoes.length + 1);
        const s = e.sugestoes[e.sugestoes.length - 1];
        const { descricao, ...resto } = dados;
        expect(s).toEqual({
          id: s.id, autorId: "d2", descricao: descricao ?? "", estado: "sugerida", em: base.agora, ...resto,
        });
        // o estado de entrada não é alterado
        expect(base.sugestoes).toHaveLength(7);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("só com o nome, o objeto é idêntico ao de antes", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 30 }).filter((t) => t.trim() !== ""), (nome) => {
        const s = criarSugestao(base, "d1", { nome }).sugestoes.at(-1)!;
        expect(Object.keys(s).sort()).toEqual(["autorId", "descricao", "em", "estado", "id", "nome"]);
        expect(s.nome).toBe(nome.trim());
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("as sugestões antigas do mock continuam intactas", () => {
    expect(base.sugestoes.slice(0, 3).map((s) => s.id)).toEqual(["S-1", "S-2", "S-3"]);
  });
});

/* ---------------------------------------------------------------- */
/* Property 25                                                       */
/* ---------------------------------------------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 25: Validação de sugestão aceita se e somente se tudo o que foi preenchido é válido", () => {
  // **Validates: Requirements 16.9, 16.10, 16.11, 16.12, 16.13**
  const candidato: fc.Arbitrary<DadosSugestao> = fc.record(
    {
      nome: fc.constantFrom("", "  ", "Boné", " Caneta "),
      link: fc.constantFrom("", "https://a.com", "http://b.org", "ftp://c", "a.com", "javascript:alert(1)"),
      quantidadeEstimada: fc.oneof(fc.integer({ min: -3, max: 50 }), fc.double({ min: -3, max: 50 }), fc.constant(Number.NaN)),
      dataNecessaria: fc.constantFrom("", "2026-11-10", "2026-11-11", "2026-12-31", "2026-02-30", "ontem"),
      porQueCombina: fc.integer({ min: 0, max: 300 }).map((n) => "x".repeat(n)),
    },
    { requiredKeys: [] },
  ).map((d) => ({ nome: "", ...d }));

  it("ok se e somente se cada campo preenchido é válido", () => {
    fc.assert(
      fc.property(candidato, (d) => {
        const nomeOk = (d.nome ?? "").trim() !== "";
        const linkOk = !d.link || /^https?:\/\/[^/\s]+/.test(d.link);
        const qtdOk = d.quantidadeEstimada === undefined || (Number.isInteger(d.quantidadeEstimada) && d.quantidadeEstimada >= 1);
        const dataOk = !d.dataNecessaria || (/^\d{4}-\d{2}-\d{2}$/.test(d.dataNecessaria) && d.dataNecessaria !== "2026-02-30" && d.dataNecessaria >= HOJE);
        const porOk = (d.porQueCombina ?? "").length <= 280;
        const r = validarSugestao(d, HOJE);
        expect(r.ok).toBe(nomeOk && linkOk && qtdOk && dataOk && porOk);
        expect(Object.keys(r.erros).length === 0).toBe(r.ok);
        expect("nome" in r.erros).toBe(!nomeOk);
        expect("link" in r.erros).toBe(!linkOk);
        expect("quantidadeEstimada" in r.erros).toBe(!qtdOk);
        expect("dataNecessaria" in r.erros).toBe(!dataOk);
        expect("porQueCombina" in r.erros).toBe(!porOk);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
