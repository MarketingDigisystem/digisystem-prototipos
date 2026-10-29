/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/biblioteca/index.tsx (chips de status do post),
 *   src/lib/hub-meta.ts (STATUS_POST) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Estado do post como aparece no card, na subtarefa, na mesa e no calendário
 * (tabela da proposta 4.4). O rótulo e o tom vêm de regras.ts
 * (estadoPostExibido); aqui só se traduz o tom para a cor.
 */
import type { EstadoPostExibido, TomEstado } from "../store/regras";
import { cn } from "../../lib/utils";

export const CLASSE_TOM: Record<TomEstado, { chip: string; ponto: string }> = {
  neutro: { chip: "bg-muted text-muted-foreground", ponto: "bg-muted-foreground/60" },
  progresso: { chip: "bg-sky-soft text-primary", ponto: "bg-sky" },
  alerta: { chip: "bg-destructive/10 text-destructive", ponto: "bg-destructive" },
  atencao: { chip: "bg-warning-soft text-warning", ponto: "bg-warning" },
  sucesso: { chip: "bg-success-soft text-success", ponto: "bg-success" },
};

export function EstadoPost({
  estado,
  sufixo,
  className,
}: {
  estado: EstadoPostExibido;
  /** Complemento curto, ex.: "2 posts" quando o mesmo estado vale para mais de um. */
  sufixo?: string;
  className?: string;
}) {
  const tom = CLASSE_TOM[estado.tom];
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 font-display text-[11px] font-semibold",
        tom.chip,
        className,
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tom.ponto)} />
      <span className="truncate">
        {estado.rotulo}
        {sufixo && <span className="font-normal opacity-80"> · {sufixo}</span>}
      </span>
    </span>
  );
}
