// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/ e loja-brindes/ (formatação de valores e rótulos), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.

import type { EstadoPedido, EstadoSugestao } from "./tipos";

const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function brl(valor: number): string {
  // O Intl separa "R$" do número com espaço não separável; troca por espaço comum para o texto ficar estável.
  return MOEDA.format(valor).replace(/\u00a0/g, " ");
}

/** Fonte única do texto exibido de cada estado de pedido. Os identificadores (chaves) não mudam. */
export const ROTULO_ESTADO: Record<EstadoPedido, string> = {
  solicitada: "Recebido",
  em_alinhamento: "Em preparação",
  pronto: "Pronto para retirada",
  encerrada: "Retirado",
  recusada: "Recusado",
  cancelada: "Cancelado",
};

export const ROTULO_SUGESTAO: Record<EstadoSugestao, string> = {
  sugerida: "Enviada",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  recusada: "Recusada",
};

/** Monta o caminho de um arquivo de public/digistore/ respeitando a base do Pages. */
export function urlDoAsset(nome: string, base: string): string {
  const b = base.endsWith("/") ? base : `${base}/`;
  return `${b}digistore/${nome.replace(/^\/+/, "")}`;
}

/** Luminância relativa WCAG de uma cor "#rrggbb" (0 = preto, 1 = branco). */
export function luminanciaRelativa(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Cor inválida: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG entre duas cores "#rrggbb" (1 a 21), simétrica. */
export function razaoDeContraste(a: string, b: string): number {
  const la = luminanciaRelativa(a);
  const lb = luminanciaRelativa(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** "2026-11-11T10:00:00" → "11/11/2026". */
export function dataCurta(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

/** "2026-11-11T10:00:00" → "11/11 às 10:00". */
export function dataHora(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)} às ${iso.slice(11, 16)}`;
}
