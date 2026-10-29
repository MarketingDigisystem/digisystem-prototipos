/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/lib/trend-platform.ts, src/routes/_authenticated/tendencias.tsx (chips de potencial)
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Chips de uma tendência: plataforma (platformMeta do real, igual), potencial
 * (mesmas cores do real) e o estado novo da proposta 2.7 (Nova, Em produção,
 * Aproveitada, Descartada). Reaproveitado pela Tendência da semana da Minha mesa.
 */
import { TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import type { SituacaoTendencia } from "../store/regras";
import type { EstadoTendencia, Potencial } from "../store/tipos";

type MetaPlataforma = { label: string; className: string };

const normalizar = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** Cópia do platformMeta real: sem plataforma reconhecida, o rótulo é a própria tag. */
export function platformMeta(tag?: string): MetaPlataforma {
  const n = normalizar(tag ?? "");
  if (!n) return { label: "Outro", className: "bg-muted text-muted-foreground" };
  if (n.includes("insta") || n === "ig" || n.includes("reels")) return { label: "Instagram", className: "bg-orange-soft text-accent" };
  if (n.includes("linked") || n === "in") return { label: "LinkedIn", className: "bg-sky-soft text-primary" };
  if (n.includes("you") || n === "yt" || n.includes("shorts")) return { label: "YouTube", className: "bg-destructive/10 text-destructive" };
  if (n.includes("face") || n === "fb" || n.includes("meta")) return { label: "Facebook", className: "bg-navy-soft text-primary" };
  if (n.includes("blog") || n.includes("site") || n.includes("artigo")) return { label: "Blog", className: "bg-success-soft text-success" };
  return { label: (tag ?? "").trim(), className: "bg-muted text-muted-foreground" };
}

export const CLASSE_POTENCIAL: Record<Potencial, string> = {
  Alto: "bg-success-soft text-success",
  Médio: "bg-warning-soft text-warning",
  Baixo: "bg-muted text-muted-foreground",
};

/** Cor do estado da tendência (decisão do protótipo: Nova chama atenção em laranja). */
export const CLASSE_ESTADO_TENDENCIA: Record<EstadoTendencia, { chip: string; ponto: string }> = {
  nova: { chip: "bg-orange-soft text-accent", ponto: "bg-accent" },
  em_producao: { chip: "bg-sky-soft text-primary", ponto: "bg-sky" },
  aproveitada: { chip: "bg-success-soft text-success", ponto: "bg-success" },
  descartada: { chip: "bg-muted text-muted-foreground", ponto: "bg-muted-foreground/50" },
};

/** "carrossel" → "Carrossel" (o banco guarda o formato em minúsculas). */
export const formatoLegivel = (f: string) => (f ? f.charAt(0).toLocaleUpperCase("pt-BR") + f.slice(1) : "");

const chipBase = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wide";

export function ChipPlataforma({ tag, className }: { tag: string; className?: string }) {
  const p = platformMeta(tag);
  return <span className={cn(chipBase, p.className, className)}>{p.label}</span>;
}

export function ChipPotencial({ potencial, className }: { potencial: Potencial; className?: string }) {
  return (
    <span className={cn(chipBase, CLASSE_POTENCIAL[potencial], className)}>
      <TrendingUp aria-hidden className="h-3 w-3" /> {potencial}
    </span>
  );
}

/** Estado da tendência; sem caixa alta, para ler como frase ("Aproveitada · 2 posts publicados"). */
export function ChipEstadoTendencia({ situacao, className }: { situacao: SituacaoTendencia; className?: string }) {
  const c = CLASSE_ESTADO_TENDENCIA[situacao.estado];
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 font-display text-[11px] font-bold", c.chip, className)}>
      <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0 rounded-full", c.ponto)} />
      <span className="truncate">{situacao.rotulo}</span>
    </span>
  );
}
