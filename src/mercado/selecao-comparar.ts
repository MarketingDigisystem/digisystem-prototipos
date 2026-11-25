/*
PROTÓTIPO DESCARTÁVEL — não é o app.
Gerado de: lógica nova do protótipo (sem arquivo equivalente no Lovable) @ leitura 2026-11-25.
Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
Decisão de design correspondente: docs-marketing-hub/implementacao/analise-redesign-mercado-2026-11-25.md.
*/

/** Máximo de concorrentes comparados lado a lado. */
export const LIMITE_COMPARAR = 4;
/** Mínimo para a comparação fazer sentido. */
export const MINIMO_COMPARAR = 2;

export type Selecao = readonly string[];

export interface ResultadoAlternar {
  /** Nova seleção (a mesma referência quando nada mudou). */
  selecao: Selecao;
  /** true quando a adição foi recusada por já haver 4 selecionados. */
  limite: boolean;
}

/**
 * Adiciona o id se ausente e houver vaga; remove se presente.
 * Com 4 selecionados, adicionar não muda a seleção e sinaliza `limite`.
 * Imutável; a ordem de seleção é preservada.
 */
export function alternar(sel: Selecao, id: string): ResultadoAlternar {
  if (sel.includes(id)) {
    return { selecao: sel.filter((x) => x !== id), limite: false };
  }
  if (sel.length >= LIMITE_COMPARAR) {
    return { selecao: sel, limite: true };
  }
  return { selecao: [...sel, id], limite: false };
}

/** Verdadeiro com 2 a 4 selecionados. */
export function podeComparar(sel: Selecao): boolean {
  return sel.length >= MINIMO_COMPARAR && sel.length <= LIMITE_COMPARAR;
}
