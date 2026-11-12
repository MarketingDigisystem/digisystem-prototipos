// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: formato.ts desta pasta (urlDoAsset), escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Logo exclusivo da Digi Store, Req. 9.3).

import { describe, expect, it } from "vitest";
import { razaoDeContraste, urlDoAsset } from "./formato";
import {
  COR_FAIXA_CANTO, COR_FAIXA_DESTAQUE, COR_FAIXA_ETIQUETA, COR_FAIXA_FUNDO, COR_FAIXA_SUBTITULO, COR_FAIXA_TEXTO,
  CONTRASTE_MINIMO_TEXTO_GRANDE, CONTRASTE_MINIMO_TEXTO_PEQUENO,
} from "./FaixaApresentacao";

describe("urlDoAsset", () => {
  it("usa a base '/' sem barra dupla", () => {
    expect(urlDoAsset("logo-colorido.png", "/")).toBe("/digistore/logo-colorido.png");
  });

  it("prefixa a base do GitHub Pages com barra final", () => {
    expect(urlDoAsset("logo-colorido.png", "/digisystem-prototipos/")).toBe("/digisystem-prototipos/digistore/logo-colorido.png");
  });

  it("aceita base sem barra final", () => {
    expect(urlDoAsset("icone.png", "/digisystem-prototipos")).toBe("/digisystem-prototipos/digistore/icone.png");
  });

  it("ignora barra inicial no nome do arquivo", () => {
    expect(urlDoAsset("/logo-branco.png", "/digisystem-prototipos/")).toBe("/digisystem-prototipos/digistore/logo-branco.png");
  });
});

describe("razaoDeContraste (WCAG)", () => {
  it("preto sobre branco dá 21:1 e a razão é simétrica", () => {
    expect(razaoDeContraste("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(razaoDeContraste("#36499b", "#ffffff")).toBeCloseTo(razaoDeContraste("#ffffff", "#36499b"), 10);
  });

  it("o laranja puro #ff6d2d não atinge 3:1 sobre o navy (por isso o destaque usa outro tom)", () => {
    expect(razaoDeContraste("#ff6d2d", COR_FAIXA_FUNDO)).toBeLessThan(CONTRASTE_MINIMO_TEXTO_GRANDE);
  });
});

describe("contraste da Faixa_de_Apresentacao sobre o navy (Req. 12.8)", () => {
  // **Validates: Requirements 12.8**
  it("texto grande (título light, 'para perto.' semibold) tem pelo menos 3:1 no centro e no canto", () => {
    for (const fundo of [COR_FAIXA_FUNDO, COR_FAIXA_CANTO]) {
      expect(razaoDeContraste(COR_FAIXA_DESTAQUE, fundo)).toBeGreaterThanOrEqual(CONTRASTE_MINIMO_TEXTO_GRANDE);
      expect(razaoDeContraste(COR_FAIXA_TEXTO, fundo)).toBeGreaterThanOrEqual(CONTRASTE_MINIMO_TEXTO_GRANDE);
    }
  });

  it("texto pequeno (etiqueta e subtítulo) tem pelo menos 4,5:1 no centro e no canto", () => {
    for (const fundo of [COR_FAIXA_FUNDO, COR_FAIXA_CANTO]) {
      for (const cor of [COR_FAIXA_ETIQUETA, COR_FAIXA_SUBTITULO, COR_FAIXA_TEXTO]) {
        expect(razaoDeContraste(cor, fundo)).toBeGreaterThanOrEqual(CONTRASTE_MINIMO_TEXTO_PEQUENO);
      }
    }
  });
});