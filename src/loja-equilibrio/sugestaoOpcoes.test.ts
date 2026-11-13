// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: sugestaoOpcoes.ts desta pasta, escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Sugestão de brinde completa").

import { describe, expect, it } from "vitest";
import { detalhesPreenchidos, validarSugestao } from "./regras";
import {
  FORM_VAZIO, alternar, chipsDaSugestao, lerQuantidade, linhasDoResumo, linkSeguro, montarDados, rascunhoDaSugestao, textoIndicador,
} from "./sugestaoOpcoes";

describe("montarDados", () => {
  it("formulário vazio vira só o nome vazio, que a validação recusa", () => {
    const d = montarDados(FORM_VAZIO);
    expect(d).toEqual({ nome: "" });
    expect(validarSugestao(d, "2026-11-11").ok).toBe(false);
    expect(detalhesPreenchidos(d)).toBe(0);
  });

  it("omite o que está em branco e converte a quantidade", () => {
    const d = montarDados({ ...FORM_VAZIO, nome: "Boné", descricao: "   ", quantidade: " 30 ", faixaCusto: "10_30", ocasioes: ["Feira"] });
    expect(d).toEqual({ nome: "Boné", quantidadeEstimada: 30, faixaCusto: "10_30", ocasioes: ["Feira"] });
    expect(detalhesPreenchidos(d)).toBe(3);
  });

  it("quantidade fracionada ou em texto chega à validação como inválida", () => {
    expect(lerQuantidade("1,5")).toBe(1.5);
    expect(lerQuantidade("")).toBeUndefined();
    for (const q of ["1,5", "abc", "0"]) {
      const v = validarSugestao(montarDados({ ...FORM_VAZIO, nome: "a", quantidade: q }), "2026-11-11");
      expect(v.erros.quantidadeEstimada).toBe("Informe uma quantidade inteira, a partir de 1.");
    }
  });
});

describe("linhasDoResumo", () => {
  it("sem campos preenchidos não tem linhas", () => {
    expect(linhasDoResumo({ nome: "Boné" })).toEqual([]);
  });

  it("mostra só o que foi preenchido, com data em dd/mm/aaaa e rótulos em português", () => {
    const linhas = linhasDoResumo({
      nome: "Boné", categoria: "Outra", dataNecessaria: "2026-12-05", frequencia: "trimestral",
      quantidadeEstimada: 20, faixaCusto: "60_120", comLogo: "com_logo", publicos: ["Clientes", "Parceiros"],
    });
    expect(linhas).toEqual([
      { rotulo: "Categoria", valor: "Outra" },
      { rotulo: "Públicos", valor: "Clientes, Parceiros" },
      { rotulo: "Quando", valor: "até 05/12/2026 · A cada trimestre" },
      { rotulo: "Quantidade estimada", valor: "20" },
      { rotulo: "Custo por unidade", valor: "R$ 60 a 120" },
      { rotulo: "Marca Digisystem", valor: "Com logo" },
    ]);
  });
});

describe("alternar e chipsDaSugestao", () => {
  it("alternar liga e desliga sem alterar a lista original", () => {
    const base = ["Evento"];
    expect(alternar(base, "Feira")).toEqual(["Evento", "Feira"]);
    expect(alternar(base, "Evento")).toEqual([]);
    expect(base).toEqual(["Evento"]);
  });

  it("os chips principais limitam as ocasiões a 2", () => {
    expect(chipsDaSugestao({ categoria: "Outra", ocasioes: ["Evento", "Feira", "Treinamento"], publicos: ["Clientes"], faixaCusto: "ate_10" })).toEqual([
      "Outra", "Evento", "Feira", "Clientes", "Até R$ 10",
    ]);
    expect(chipsDaSugestao({})).toEqual([]);
  });

  it("o indicador usa o texto pedido", () => {
    expect(textoIndicador(3)).toBe("3 de 9 detalhes preenchidos");
  });
});

describe("rascunhoDaSugestao (Req. 16.29)", () => {
  it("copia nome, categoria e descrição", () => {
    expect(rascunhoDaSugestao({ nome: " Caneta ", categoria: "Escritório", descricao: "Para eventos." })).toEqual({
      nome: "Caneta",
      categoria: "Escritório",
      descricao: "Para eventos.",
    });
  });
  it("categoria 'Outra' ou ausente fica vazia", () => {
    expect(rascunhoDaSugestao({ nome: "A", categoria: "Outra", descricao: "" }).categoria).toBe("");
    expect(rascunhoDaSugestao({ nome: "A", descricao: "" }).categoria).toBe("");
  });
  it("concatena 'Por que combina' à descrição, ou usa só ele quando a descrição está vazia", () => {
    expect(rascunhoDaSugestao({ nome: "A", descricao: "Texto.", porQueCombina: "Combina." }).descricao).toBe(
      "Texto.\n\nPor que combina com a marca: Combina.",
    );
    expect(rascunhoDaSugestao({ nome: "A", descricao: "", porQueCombina: "Combina." }).descricao).toBe("Por que combina com a marca: Combina.");
    expect(rascunhoDaSugestao({ nome: "A", descricao: "", porQueCombina: "  " }).descricao).toBe("");
  });
});

describe("linkSeguro (Req. 16.25)", () => {
  it("aceita só http e https", () => {
    expect(linkSeguro("https://exemplo.com.br/a")).toBe("https://exemplo.com.br/a");
    expect(linkSeguro(" http://exemplo.com ")).toBe("http://exemplo.com/");
  });
  it("recusa outros protocolos, texto solto e vazio", () => {
    for (const x of ["javascript:alert(1)", "data:text/html,x", "ftp://a.com", "exemplo.com", "", undefined]) expect(linkSeguro(x)).toBeNull();
  });
});
