// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Estoque oculto ao diretor e aviso acima do estoque"), escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: design.md (Req. 14 e 15; tarefa 15.3).
//
// Exemplos: o aviso aparece só acima do estoque e nunca contém dígito; a visão do diretor devolve só o booleano.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AvisoAcimaDoEstoque, AvisoDeReposicao } from "./AvisoAcimaDoEstoque";
import { MSG_CIENCIA_OBRIGATORIA, TEXTO_AVISO_ACIMA_ESTOQUE, TEXTO_AVISO_REPOSICAO, TEXTO_CIENCIA, TEXTO_DATA_NAO_GARANTIDA } from "./avisos";
import { aguardaReposicao, visaoDoBrindeParaDiretor } from "./visaoDiretor";
import { disponivel } from "./regras";
import { ESTADO_INICIAL } from "./mock";
import type { Brinde } from "./tipos";

const base = ESTADO_INICIAL;
const estoque = base.brindes.find((b) => b.tipo === "estoque" && disponivel(b) > 0)!;
const html = (visivel: boolean, reservar = true) => renderToStaticMarkup(createElement(AvisoAcimaDoEstoque, { visivel, reservar }));
const texto = (marcacao: string) => marcacao.replace(/<[^>]+>/g, "");

describe("AvisoAcimaDoEstoque", () => {
  it("mostra o texto só quando a quantidade passa do estoque", () => {
    expect(texto(html(true))).toBe(TEXTO_AVISO_ACIMA_ESTOQUE);
    expect(texto(html(false))).toBe("");
  });

  it("a região fica montada e com altura reservada nos dois casos (âncora fixa)", () => {
    for (const visivel of [true, false]) {
      const m = html(visivel);
      expect(m).toContain('role="status"');
      expect(m).toContain('aria-live="polite"');
      expect(m).toMatch(/min-h-/);
    }
  });

  it("nenhum texto de aviso ou ciência contém dígito", () => {
    for (const t of [TEXTO_AVISO_ACIMA_ESTOQUE, TEXTO_CIENCIA, MSG_CIENCIA_OBRIGATORIA, TEXTO_AVISO_REPOSICAO, TEXTO_DATA_NAO_GARANTIDA]) {
      expect(t).not.toMatch(/\d/);
    }
    expect(texto(html(true))).not.toMatch(/\d/);
  });

  it("AvisoDeReposicao só renderiza quando visível e também não tem dígito", () => {
    expect(renderToStaticMarkup(createElement(AvisoDeReposicao, { visivel: false }))).toBe("");
    const m = renderToStaticMarkup(createElement(AvisoDeReposicao, { visivel: true }));
    expect(texto(m)).toBe(TEXTO_AVISO_REPOSICAO);
    expect(texto(m)).not.toMatch(/\d/);
  });
});

describe("visão do diretor", () => {
  it("acimaDoEstoque é verdadeiro só acima do disponível e a visão não traz número de estoque", () => {
    const disp = disponivel(estoque);
    expect(visaoDoBrindeParaDiretor(estoque, disp).acimaDoEstoque).toBe(false);
    expect(visaoDoBrindeParaDiretor(estoque, disp + 1).acimaDoEstoque).toBe(true);
    expect(Object.keys(visaoDoBrindeParaDiretor(estoque, disp + 1)).sort()).toEqual(["acimaDoEstoque", "preco", "selos"]);
  });

  it("brinde sem saldo tem a mesma visão de um com saldo: só o booleano muda com a quantidade", () => {
    const zerado: Brinde = { ...estoque, saldo: 0, reserva: 0 };
    const v = visaoDoBrindeParaDiretor(zerado, 1);
    expect(v.acimaDoEstoque).toBe(true);
    expect(v.selos).toEqual({ novidade: estoque.novidade });
    expect(v.preco).toBe(visaoDoBrindeParaDiretor(estoque, 1).preco);
  });

  it("aguardaReposicao vale só em Recebido e Em preparação com pedido acima do estoque", () => {
    expect(aguardaReposicao({ estado: "solicitada", acimaDoEstoque: true })).toBe(true);
    expect(aguardaReposicao({ estado: "em_alinhamento", acimaDoEstoque: true })).toBe(true);
    expect(aguardaReposicao({ estado: "pronto", acimaDoEstoque: true })).toBe(false);
    expect(aguardaReposicao({ estado: "solicitada", acimaDoEstoque: false })).toBe(false);
  });
});
