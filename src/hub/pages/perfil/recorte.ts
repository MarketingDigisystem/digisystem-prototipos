/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: nenhum arquivo do real (o recorte não existe no app); padrões de
 *   src/hub/pages/marca/Marca.tsx (LogoUploader) @ origin/main c16c790 / leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-perfil-e-foto-2026-10-27.md.
 *
 * Matemática pura do recorte em círculo. Unidade = diâmetro do círculo (D).
 * Com zoom 1, o lado MENOR da imagem mede exatamente D (cobre o círculo).
 * (x, y) = deslocamento do centro da imagem em relação ao centro do círculo.
 * No app real isto vira src/hub/ui/recorte-foto.ts, testado em node.
 */

export type Recorte = { zoom: number; x: number; y: number };
export type Dimensoes = { w: number; h: number };

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;
export const LADO_SAIDA = 512;

export const enquadramentoInicial = (): Recorte => ({ zoom: 1, x: 0, y: 0 });

/** Tamanho exibido da imagem, em unidades de D. */
export function tamanhoExibido(img: Dimensoes, zoom: number) {
  const m = Math.min(img.w, img.h);
  return { w: (zoom * img.w) / m, h: (zoom * img.h) / m };
}

const prender = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Prende zoom e posição: a imagem nunca deixa vazio dentro do círculo. */
export function limitar(img: Dimensoes, r: Recorte): Recorte {
  const zoom = prender(r.zoom, ZOOM_MIN, ZOOM_MAX);
  const t = tamanhoExibido(img, zoom);
  const mx = Math.max(0, (t.w - 1) / 2);
  const my = Math.max(0, (t.h - 1) / 2);
  return { zoom, x: prender(r.x, -mx, mx), y: prender(r.y, -my, my) };
}

/** Zoom mantendo fixo o ponto (px, py) (em unidades de D, a partir do centro). */
export function zoomEm(img: Dimensoes, r: Recorte, novoZoom: number, px = 0, py = 0): Recorte {
  const z2 = prender(novoZoom, ZOOM_MIN, ZOOM_MAX);
  const k = z2 / r.zoom;
  return limitar(img, { zoom: z2, x: px - (px - r.x) * k, y: py - (py - r.y) * k });
}

export const mover = (img: Dimensoes, r: Recorte, dx: number, dy: number): Recorte => limitar(img, { ...r, x: r.x + dx, y: r.y + dy });

/** Quadrado de origem (pixels da imagem) que cai dentro do círculo. */
export function retanguloDeOrigem(img: Dimensoes, r: Recorte) {
  const m = Math.min(img.w, img.h);
  const t = tamanhoExibido(img, r.zoom);
  const unidade = m / r.zoom; // pixels de origem por D
  return {
    sx: (t.w / 2 - r.x - 0.5) * unidade,
    sy: (t.h / 2 - r.y - 0.5) * unidade,
    lado: unidade,
  };
}

/** Exporta 512×512 em WebP 0,9 (cai para JPEG 0,9 se o navegador não gerar WebP). */
export function exportarRecorte(img: HTMLImageElement, r: Recorte): string {
  const c = document.createElement("canvas");
  c.width = LADO_SAIDA;
  c.height = LADO_SAIDA;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");
  const o = retanguloDeOrigem({ w: img.naturalWidth, h: img.naturalHeight }, r);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, o.sx, o.sy, o.lado, o.lado, 0, 0, LADO_SAIDA, LADO_SAIDA);
  const webp = c.toDataURL("image/webp", 0.9);
  return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/jpeg", 0.9);
}

/** "1,4" para o anúncio do leitor de tela. */
export const zoomPorExtenso = (z: number) => z.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
