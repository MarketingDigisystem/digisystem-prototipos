// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/ e loja-brindes/ (formatação de valores e rótulos), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.

import type { EstadoPedido, EstadoSugestao } from "./tipos";

const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function brl(valor: number): string {
  return MOEDA.format(valor);
}

export const ROTULO_ESTADO: Record<EstadoPedido, string> = {
  solicitada: "Solicitada",
  em_alinhamento: "Em alinhamento",
  pronto: "Pronto para retirada",
  encerrada: "Encerrada",
  recusada: "Recusada",
  cancelada: "Cancelada",
};

export const ROTULO_SUGESTAO: Record<EstadoSugestao, string> = {
  sugerida: "Enviada",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  recusada: "Recusada",
};

/** "2026-11-11T10:00:00" → "11/11/2026". */
export function dataCurta(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

/** "2026-11-11T10:00:00" → "11/11 às 10:00". */
export function dataHora(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)} às ${iso.slice(11, 16)}`;
}
