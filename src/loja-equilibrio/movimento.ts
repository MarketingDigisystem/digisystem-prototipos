// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: equilibrio.css e ui.tsx desta pasta (tokens --mov-*), escrito em 2026-11-12 (tarefa 10.3).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/refino/animacao.md.
//
// Lógica pura do movimento: atraso escalonado de entrada, largura das barras e a consulta de movimento reduzido.
// Sem React e sem DOM (exceto `movimentoReduzido`, que só consulta matchMedia se existir).

import type { CSSProperties } from "react";

/** Passo entre um item e o seguinte na entrada de listas, em ms. */
export const PASSO_ESCALONADO_MS = 30;
/** Só os primeiros itens ganham atraso; os demais entram juntos, sem atraso. */
export const LIMITE_ESCALONADO = 8;
/** Duração da saída do diálogo, em ms (igual a --mov-rapido). O desmonte só acontece depois dela. */
export const SAIDA_DIALOGO_MS = 140;
/** Duração da saída do item do carrinho, em ms (igual a --mov-saida-dur). */
export const SAIDA_ITEM_MS = 180;

/**
 * Atraso de entrada do item `indice` (base 0), em ms: `indice * passo` para os `limite` primeiros itens, 0 para os demais.
 * Índice inválido (negativo, NaN, infinito) vira 0, para a entrada nunca travar em opacidade 0.
 */
export function atrasoEscalonado(indice: number, passo: number = PASSO_ESCALONADO_MS, limite: number = LIMITE_ESCALONADO): number {
  if (!Number.isFinite(indice) || indice < 0 || indice >= limite) return 0;
  return Math.floor(indice) * passo;
}

/** Estilo inline de entrada escalonada (`animation-delay`). Sem atraso, devolve objeto vazio para não poluir o DOM. */
export function estiloEntrada(indice: number, passo: number = PASSO_ESCALONADO_MS, limite: number = LIMITE_ESCALONADO): CSSProperties {
  const ms = atrasoEscalonado(indice, passo, limite);
  return ms > 0 ? { animationDelay: `${ms}ms` } : {};
}

/**
 * Largura final de uma barra, em % (de `minimo` a 100). A largura vem sempre do dado e é estática;
 * a animação cresce a barra com `transform: scaleX(0 → 1)`, nunca animando a largura.
 */
export function larguraDaBarra(valor: number, maior: number, minimo = 2): number {
  if (!Number.isFinite(valor) || !Number.isFinite(maior) || maior <= 0) return minimo;
  const pct = (valor / maior) * 100;
  return Math.min(100, Math.max(minimo, pct));
}

/** true se a pessoa pediu menos movimento (prefers-reduced-motion: reduce). */
export function movimentoReduzido(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
