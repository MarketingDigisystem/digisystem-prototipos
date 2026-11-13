// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: mock.ts e public/brindes/ deste protótipo, escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Catálogo oficial e fotos, Req. 13).
//
// Guarda das fotos do catálogo: cada foto citada existe, tem nome em kebab-case, 800x800 e até 160 KB, e nada sobra em public/brindes/.
// O projeto não tem @types/node; o módulo é carregado por importação dinâmica sem tipos (os testes rodam em Node).

import { describe, expect, it } from "vitest";
import { ESTADO_INICIAL } from "./mock";

const PASTA = new URL("../../public/brindes/", import.meta.url);
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*\.jpg$/;
const LIMITE_BYTES = 160 * 1024;

interface FsMinimo {
  readdirSync(p: URL): string[];
  readFileSync(p: URL): Uint8Array;
}
const nomeDoModulo: string = "node:fs";
const fs = (await import(/* @vite-ignore */ nomeDoModulo)) as FsMinimo;

/** Largura e altura lidas do marcador SOF do JPEG. */
function dimensoes(bytes: Uint8Array): { largura: number; altura: number } {
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marcador = bytes[i + 1];
    if (marcador >= 0xc0 && marcador <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marcador)) {
      return { altura: (bytes[i + 5] << 8) | bytes[i + 6], largura: (bytes[i + 7] << 8) | bytes[i + 8] };
    }
    i += 2 + ((bytes[i + 2] << 8) | bytes[i + 3]);
  }
  throw new Error("Marcador SOF não encontrado");
}

const citadas = [...new Set(ESTADO_INICIAL.brindes.flatMap((b) => [b.foto, b.fotoExtra]).filter((f): f is string => Boolean(f)))];
const noDisco = fs.readdirSync(PASTA).sort();

describe("fotos do catálogo oficial", () => {
  it("o catálogo cita 8 fotos, todas em /brindes/, e as do kit são a principal e a extra", () => {
    expect(citadas).toHaveLength(8);
    expect(citadas.every((f) => f.startsWith("/brindes/"))).toBe(true);
    const kit = ESTADO_INICIAL.brindes.find((b) => b.id === "kit-churrasco")!;
    expect([kit.foto, kit.fotoExtra]).toEqual(["/brindes/kit-churrasco-aberto.jpg", "/brindes/estojo-churrasco-fechado.jpg"]);
  });

  it.each(citadas)("%s existe, é kebab-case, tem 800x800 e até 160 KB", (foto) => {
    const nome = foto.replace("/brindes/", "");
    expect(nome).toMatch(KEBAB);
    expect(noDisco).toContain(nome);
    const bytes = fs.readFileSync(new URL(nome, PASTA));
    expect(bytes.length).toBeLessThanOrEqual(LIMITE_BYTES);
    expect(dimensoes(bytes)).toEqual({ largura: 800, altura: 800 });
  });

  it("public/brindes/ não guarda arquivo sem uso", () => {
    expect(noDisco).toEqual(citadas.map((f) => f.replace("/brindes/", "")).sort());
  });
});
