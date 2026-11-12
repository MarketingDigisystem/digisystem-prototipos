// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: formato.ts desta pasta (urlDoAsset), escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Logo exclusivo da Digi Store, Req. 9.3).

import { describe, expect, it } from "vitest";
import { urlDoAsset } from "./formato";

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
