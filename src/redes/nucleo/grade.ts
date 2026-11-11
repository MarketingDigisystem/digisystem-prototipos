/*
 * PROTÓTIPO DESCARTÁVEL — não é o app. Cópia da lógica pura de src/hub/ui/painel-grade/grade.ts
 * @ commit 83755ae (main, PR #94), leitura 2026-11-11. Só os imports foram trocados
 * por ./tipos-proto. Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 */
/**
 * Modelo de grade do Painel_de_Cards (Resultados › Redes), puro.
 *
 * Posição explícita (x, y, w, h) no canônico de 4 colunas. Larguras de 2 e 1
 * colunas são projeções calculadas na leitura (`projetar`), nunca gravadas.
 * Toda operação termina em `normalizarGrade`, que garante: sem sobreposição,
 * sem lacuna vertical e idempotência.
 *
 * Sem DOM, sem React, sem rede. Não altera `arranjo-painel.ts` (v1).
 */

export const COLUNAS_CANONICAS = 4 as const;
export const LARGURA = { min: 1, max: 4 } as const;
export const ALTURA = { min: 1, max: 3 } as const;
/** Final (medição 10.4, 2026-11-11): 224 px. Área útil do card (já sem cabeçalho e padding): h1=150, h2=394, h3=638 px. */
export const ALTURA_LINHA_PX = 224;
/** `gap-5`. */
export const GAP_PX = 20;

export type TamanhoCard = { w: number; h: number };
export type LimitesCard = { min: TamanhoCard; max: TamanhoCard; padrao: TamanhoCard };

export type ItemGrade = { id: string; x: number; y: number; w: number; h: number };
export type OcultoGrade = { id: string; w: number; h: number };
export type ArranjoGrade = { versao: 2; itens: ItemGrade[]; ocultos: OcultoGrade[] };
export type CatalogoGrade = ReadonlyArray<{ id: string; limites: LimitesCard }>;

export type ColunasVisiveis = 4 | 2 | 1;

/** Entrada frouxa aceita por `limitar` (valores de origem não confiável). */
export type ItemBruto = { id: string; x?: unknown; y?: unknown; w?: unknown; h?: unknown };

/* ------------------------------------------------------------------ */
/* Auxiliares                                                          */
/* ------------------------------------------------------------------ */

function inteiroOu(valor: unknown, padrao: number): number {
  return typeof valor === "number" && Number.isFinite(valor) ? Math.round(valor) : padrao;
}

function entre(valor: number, min: number, max: number): number {
  return Math.min(Math.max(valor, min), max);
}

function limitesDe(catalogo: CatalogoGrade, id: string): LimitesCard | undefined {
  return catalogo.find((c) => c.id === id)?.limites;
}

function ehObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/* ------------------------------------------------------------------ */
/* Primitivas                                                          */
/* ------------------------------------------------------------------ */

/**
 * `w` e `h` viram inteiros dentro de [min, max] do card; `x` em [0, 4 − w];
 * `y ≥ 0`. Valor não finito, texto ou ausente cai no `padrao` (tamanho) ou 0
 * (posição).
 */
export function limitar(item: ItemBruto, limites: LimitesCard): ItemGrade {
  const w = entre(inteiroOu(item.w, limites.padrao.w), limites.min.w, limites.max.w);
  const h = entre(inteiroOu(item.h, limites.padrao.h), limites.min.h, limites.max.h);
  const x = entre(inteiroOu(item.x, 0), 0, Math.max(0, COLUNAS_CANONICAS - w));
  const y = Math.max(0, inteiroOu(item.y, 0));
  return { id: item.id, x, y, w, h };
}

/** Retângulos [x, x+w) × [y, y+h) que se interceptam. */
export function colide(
  a: Pick<ItemGrade, "x" | "y" | "w" | "h">,
  b: Pick<ItemGrade, "x" | "y" | "w" | "h">,
): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function menorYLivre(colocados: readonly ItemGrade[], item: ItemGrade): number {
  let y = 0;
  for (;;) {
    const candidato = { ...item, y };
    const batida = colocados.find((c) => colide(c, candidato));
    if (!batida) return y;
    // Salta direto para abaixo do item que bloqueia (nunca volta atrás).
    y = batida.y + batida.h;
  }
}

/**
 * Gravidade vertical. Ordem `(y, x, índice)`; cada item vai para o menor
 * `y ≥ 0` sem colisão, mantendo `x`. Com `fixoId`, esse item é colocado
 * primeiro, na posição pedida. Saída ordenada por `(y, x)`.
 */
export function compactar(itens: readonly ItemGrade[], fixoId?: string): ItemGrade[] {
  const indexados = itens.map((item, i) => ({ item, i }));
  indexados.sort((a, b) => a.item.y - b.item.y || a.item.x - b.item.x || a.i - b.i);

  const fila = indexados.map((e) => e.item);
  const colocados: ItemGrade[] = [];

  const fixo = fixoId === undefined ? undefined : fila.find((i) => i.id === fixoId);
  if (fixo) colocados.push({ ...fixo });

  for (const item of fila) {
    if (item === fixo) continue;
    colocados.push({ ...item, y: menorYLivre(colocados, item) });
  }

  return colocados.sort((a, b) => a.y - b.y || a.x - b.x);
}

/** Primeira célula livre varrendo linhas de cima para baixo e `x` da esquerda para a direita. */
export function primeiroEncaixe(
  itens: readonly Pick<ItemGrade, "x" | "y" | "w" | "h">[],
  novo: TamanhoCard,
): { x: number; y: number } {
  const w = entre(inteiroOu(novo.w, 1), LARGURA.min, LARGURA.max);
  const h = entre(inteiroOu(novo.h, 1), ALTURA.min, ALTURA.max);
  for (let y = 0; ; y += 1) {
    for (let x = 0; x <= COLUNAS_CANONICAS - w; x += 1) {
      const cand = { x, y, w, h };
      if (!itens.some((i) => colide(i, cand))) return { x, y };
    }
  }
}

/* ------------------------------------------------------------------ */
/* Arranjo                                                             */
/* ------------------------------------------------------------------ */

/** Disposição padrão: catálogo em ordem, posicionado por `primeiroEncaixe`. */
export function arranjoPadrao(catalogo: CatalogoGrade): ArranjoGrade {
  const itens: ItemGrade[] = [];
  for (const { id, limites } of catalogo) {
    const { w, h } = limites.padrao;
    const { x, y } = primeiroEncaixe(itens, { w, h });
    itens.push(limitar({ id, x, y, w, h }, limites));
  }
  return { versao: 2, itens: compactar(itens), ocultos: [] };
}

/**
 * Aceita qualquer valor; nunca lança. Só `versao === 2`; descarta ids fora do
 * catálogo; a primeira ocorrência vence (`itens` antes de `ocultos`); cards
 * faltantes entram com o `padrao`; compacta.
 */
export function normalizarGrade(bruto: unknown, catalogo: CatalogoGrade): ArranjoGrade {
  try {
    if (!ehObjeto(bruto) || bruto.versao !== 2) return arranjoPadrao(catalogo);

    const vistos = new Set<string>();
    const itens: ItemGrade[] = [];
    const ocultos: OcultoGrade[] = [];

    const brutosItens = Array.isArray(bruto.itens) ? bruto.itens : [];
    for (const e of brutosItens) {
      if (!ehObjeto(e) || typeof e.id !== "string" || vistos.has(e.id)) continue;
      const limites = limitesDe(catalogo, e.id);
      if (!limites) continue;
      vistos.add(e.id);
      itens.push(limitar({ id: e.id, x: e.x, y: e.y, w: e.w, h: e.h }, limites));
    }

    const brutosOcultos = Array.isArray(bruto.ocultos) ? bruto.ocultos : [];
    for (const e of brutosOcultos) {
      if (!ehObjeto(e) || typeof e.id !== "string" || vistos.has(e.id)) continue;
      const limites = limitesDe(catalogo, e.id);
      if (!limites) continue;
      vistos.add(e.id);
      const { w, h } = limitar({ id: e.id, w: e.w, h: e.h }, limites);
      ocultos.push({ id: e.id, w, h });
    }

    for (const { id, limites } of catalogo) {
      if (vistos.has(id)) continue;
      vistos.add(id);
      const { w, h } = limites.padrao;
      const { x, y } = primeiroEncaixe(itens, { w, h });
      itens.push(limitar({ id, x, y, w, h }, limites));
    }

    return { versao: 2, itens: compactar(itens), ocultos };
  } catch {
    return arranjoPadrao(catalogo);
  }
}

/** Move o card para a célula pedida; os demais se acomodam por gravidade. */
export function mover(
  a: ArranjoGrade,
  id: string,
  x: number,
  y: number,
  catalogo: CatalogoGrade,
): ArranjoGrade {
  const alvo = a.itens.find((i) => i.id === id);
  const limites = limitesDe(catalogo, id);
  if (!alvo || !limites) return normalizarGrade(a, catalogo);
  const posto = limitar({ ...alvo, x, y }, limites);
  const itens = a.itens.map((i) => (i.id === id ? posto : i));
  return normalizarGrade({ ...a, itens: compactar(itens, id) }, catalogo);
}

/** Muda o tamanho (dentro dos limites); recua `x` se `x + w > 4`. */
export function redimensionar(
  a: ArranjoGrade,
  id: string,
  w: number,
  h: number,
  catalogo: CatalogoGrade,
): ArranjoGrade {
  const alvo = a.itens.find((i) => i.id === id);
  const limites = limitesDe(catalogo, id);
  if (!alvo || !limites) return normalizarGrade(a, catalogo);
  const novo = limitar({ ...alvo, w, h }, limites); // limitar já recua x
  const itens = a.itens.map((i) => (i.id === id ? novo : i));
  return normalizarGrade({ ...a, itens: compactar(itens, id) }, catalogo);
}

/** Oculta o card guardando `w` e `h`; o vazio se fecha. */
export function ocultar(a: ArranjoGrade, id: string, catalogo: CatalogoGrade): ArranjoGrade {
  const alvo = a.itens.find((i) => i.id === id);
  if (!alvo) return normalizarGrade(a, catalogo);
  return normalizarGrade(
    {
      ...a,
      itens: a.itens.filter((i) => i.id !== id),
      ocultos: [...a.ocultos, { id, w: alvo.w, h: alvo.h }],
    },
    catalogo,
  );
}

/** Devolve o card oculto ao primeiro encaixe, com o tamanho guardado. */
export function restaurar(a: ArranjoGrade, id: string, catalogo: CatalogoGrade): ArranjoGrade {
  const oculto = a.ocultos.find((o) => o.id === id);
  const limites = limitesDe(catalogo, id);
  if (!oculto || !limites) return normalizarGrade(a, catalogo);
  const { x, y } = primeiroEncaixe(a.itens, { w: oculto.w, h: oculto.h });
  return normalizarGrade(
    {
      ...a,
      itens: [...a.itens, { id, x, y, w: oculto.w, h: oculto.h }],
      ocultos: a.ocultos.filter((o) => o.id !== id),
    },
    catalogo,
  );
}

/**
 * Projeção de leitura para 4, 2 ou 1 colunas. Não grava nada; em 4 colunas é
 * a identidade (mesma referência).
 */
export function projetar(a: ArranjoGrade, colunas: ColunasVisiveis): ItemGrade[] {
  if (colunas === 4) return a.itens;
  const projetados = a.itens.map((i) => {
    const w = Math.min(i.w, colunas);
    const x = colunas === 1 ? 0 : i.x + i.w / 2 < 2 ? 0 : colunas - w;
    return { ...i, x, w };
  });
  return compactar(projetados);
}

/* ------------------------------------------------------------------ */
/* Geometria do ponteiro (pixel → célula)                              */
/* ------------------------------------------------------------------ */

export type GeometriaGrade = {
  /** Borda esquerda e topo da grade, no mesmo referencial do ponteiro. */
  esquerda: number;
  topo: number;
  /** Largura de uma coluna (sem gap). */
  larguraColuna: number;
  alturaLinha: number;
  gap: number;
};

function passo(tamanho: number, gap: number): number {
  const p = tamanho + gap;
  return Number.isFinite(p) && p > 0 ? p : 1;
}

/**
 * Célula `(x, y)` sob o ponteiro para um card de largura `w`. Aceita qualquer
 * real; `x ∈ [0, colunas − w]`, `y ≥ 0`.
 */
export function celulaDoPonteiro(
  px: number,
  py: number,
  g: GeometriaGrade,
  w: number,
  colunas: ColunasVisiveis = COLUNAS_CANONICAS,
): { x: number; y: number } {
  const largura = entre(inteiroOu(w, 1), 1, colunas);
  const cx = Math.floor((px - g.esquerda) / passo(g.larguraColuna, g.gap));
  const cy = Math.floor((py - g.topo) / passo(g.alturaLinha, g.gap));
  return {
    x: entre(Number.isFinite(cx) ? cx : 0, 0, colunas - largura),
    y: Number.isFinite(cy) ? Math.max(0, cy) : 0,
  };
}

/**
 * Tamanho encaixado `(w, h)` para uma borda arrastada até o ponteiro. A borda
 * direita de `w` colunas fica em `esquerdaCard + w·col + (w−1)·gap`. Respeita
 * mínimo, máximo e `x + w ≤ 4`. Nunca devolve valor intermediário.
 */
export function tamanhoDoPonteiro(
  px: number,
  py: number,
  g: GeometriaGrade,
  card: { esquerda: number; topo: number; x: number },
  limites: LimitesCard,
): TamanhoCard {
  const w = Math.round((px - card.esquerda + g.gap) / passo(g.larguraColuna, g.gap));
  const h = Math.round((py - card.topo + g.gap) / passo(g.alturaLinha, g.gap));
  const maxW = Math.max(
    limites.min.w,
    Math.min(limites.max.w, COLUNAS_CANONICAS - Math.max(0, inteiroOu(card.x, 0))),
  );
  return {
    w: entre(Number.isFinite(w) ? w : limites.padrao.w, limites.min.w, maxW),
    h: entre(Number.isFinite(h) ? h : limites.padrao.h, limites.min.h, limites.max.h),
  };
}
