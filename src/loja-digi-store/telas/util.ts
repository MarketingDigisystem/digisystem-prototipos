/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (telas do Diretor). Formatadores e classes de chip compartilhados pelas telas.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import type { EstadoPedido, Pedido } from "../tipos";

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtData = (iso: string) => {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString("pt-BR");
};

export const fmtDataHora = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

/** Chip de estado: cor e fundo mudam por estado, tamanho nunca. */
export const CLASSE_ESTADO: Record<EstadoPedido, string> = {
  solicitada: "bg-navy-soft text-navy",
  em_alinhamento: "bg-sky-soft text-navy",
  pronto_para_retirada: "bg-orange-soft text-[oklch(0.46_0.14_41)]",
  encerrada: "bg-success-soft text-[var(--success-strong)]",
  recusada: "bg-destructive/10 text-destructive",
  cancelada: "bg-secondary text-muted-foreground",
};

export const TIPO_ROTULO = { propriedade: "Propriedade", personalizavel: "Personalizável" } as const;

/** "10 × Caneca de cerâmica 300 ml" e, havendo mais, "+ 1 brinde". */
export function resumoLinhas(p: Pedido): { principal: string; resto: string } {
  const [a, ...r] = p.linhas;
  return {
    principal: a ? `${a.quantidade} × ${a.skuNome}` : "Sem brindes",
    resto: r.length ? `+ ${r.length} ${r.length === 1 ? "brinde" : "brindes"}` : "",
  };
}

export const CAMPO =
  "h-11 w-full rounded-2xl border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky";
export const AREA = "w-full rounded-2xl border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky";
export const BOTAO_PRIMARIO =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent-strong)] px-6 font-display text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2";
export const BOTAO_SECUNDARIO =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border bg-card px-5 font-display text-base font-bold text-navy transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky";
