// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: ui.tsx desta pasta (urlDaFoto), escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/refino/achados.md (A-01).

import { describe, expect, it } from "vitest";
import { ZOOM_MINIATURA, urlDaFoto, zoomDaMiniatura } from "./ui";

describe("urlDaFoto", () => {
  it("mantém o caminho com a base '/'", () => {
    expect(urlDaFoto("/brindes/camiseta.png", "/")).toBe("/brindes/camiseta.png");
  });

  it("prefixa a base do GitHub Pages", () => {
    expect(urlDaFoto("/brindes/camiseta.png", "/digisystem-prototipos/")).toBe("/digisystem-prototipos/brindes/camiseta.png");
  });

  it("aceita base sem barra final", () => {
    expect(urlDaFoto("/brindes/caneca.png", "/digisystem-prototipos")).toBe("/digisystem-prototipos/brindes/caneca.png");
  });

  it("não prefixa duas vezes", () => {
    expect(urlDaFoto("/digisystem-prototipos/brindes/caneca.png", "/digisystem-prototipos/")).toBe("/digisystem-prototipos/brindes/caneca.png");
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

describe("zoomDaMiniatura", () => {
  it("amplia só as fotos em que o produto ocupa pouco do quadro, com zoom <= 1,25", () => {
    expect(ZOOM_MINIATURA).toBeLessThanOrEqual(1.25);
    expect(zoomDaMiniatura("/digisystem-prototipos/brindes/camiseta.png")).toEqual({ scale: ZOOM_MINIATURA });
    expect(zoomDaMiniatura("/brindes/caderno-caneta-2.png")).toEqual({ scale: ZOOM_MINIATURA });
  });

  it("deixa as demais fotos como estão", () => {
    expect(zoomDaMiniatura("/brindes/caneca.png")).toBeUndefined();
    expect(zoomDaMiniatura("/brindes/folder.png")).toBeUndefined();
    expect(zoomDaMiniatura("")).toBeUndefined();
  });
});
