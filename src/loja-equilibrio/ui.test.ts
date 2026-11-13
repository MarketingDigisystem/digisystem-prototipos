// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: ui.tsx desta pasta (urlDaFoto), escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/refino/achados.md (A-01).

import { describe, expect, it } from "vitest";
import { urlDaFoto } from "./ui";

describe("urlDaFoto", () => {
  it("mantém o caminho com a base '/'", () => {
    expect(urlDaFoto("/brindes/copo-termico.jpg", "/")).toBe("/brindes/copo-termico.jpg");
  });

  it("prefixa a base do GitHub Pages", () => {
    expect(urlDaFoto("/brindes/copo-termico.jpg", "/digisystem-prototipos/")).toBe("/digisystem-prototipos/brindes/copo-termico.jpg");
  });

  it("aceita base sem barra final", () => {
    expect(urlDaFoto("/brindes/copo-termico.jpg", "/digisystem-prototipos")).toBe("/digisystem-prototipos/brindes/copo-termico.jpg");
  });

  it("não prefixa duas vezes", () => {
    expect(urlDaFoto("/digisystem-prototipos/brindes/copo-termico.jpg", "/digisystem-prototipos/")).toBe("/digisystem-prototipos/brindes/copo-termico.jpg");
  });

  it("deixa URLs absolutas, data: e blob: como estão", () => {
    expect(urlDaFoto("https://exemplo.com/a.png", "/digisystem-prototipos/")).toBe("https://exemplo.com/a.png");
    expect(urlDaFoto("//cdn.exemplo.com/a.png", "/digisystem-prototipos/")).toBe("//cdn.exemplo.com/a.png");
    expect(urlDaFoto("data:image/png;base64,AAA", "/digisystem-prototipos/")).toBe("data:image/png;base64,AAA");
    expect(urlDaFoto("blob:http://localhost/abc", "/digisystem-prototipos/")).toBe("blob:http://localhost/abc");
  });

  it("caminho vazio (brinde sem foto) continua vazio", () => {
    expect(urlDaFoto("", "/digisystem-prototipos/")).toBe("");
  });
});
