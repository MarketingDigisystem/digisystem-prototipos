/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/lib/hub-meta.ts (REDE_META), src/lib/trend-platform.ts (YouTube),
 *   src/components/estudio/CalendarioPostsView.tsx (ícone da rede) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Grafia, cor e ícone de cada rede, iguais ao REDE_META real. YouTube entra
 * com a cor do trend-platform real (a proposta, etapa 1, põe o YouTube na lista).
 */
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Rede } from "../store/tipos";

export const REDE_META: Record<Rede, { label: string; className: string; Icone: typeof Instagram }> = {
  instagram: { label: "Instagram", className: "bg-orange-soft text-accent", Icone: Instagram },
  linkedin: { label: "LinkedIn", className: "bg-sky-soft text-primary", Icone: Linkedin },
  facebook: { label: "Facebook", className: "bg-navy-soft text-primary", Icone: Facebook },
  youtube: { label: "YouTube", className: "bg-destructive/10 text-destructive", Icone: Youtube },
};

export const REDES: Rede[] = ["linkedin", "instagram", "facebook", "youtube"];

/** Quadradinho com o ícone da rede (h-5 no chip do calendário, h-11 no modal). */
export function RedeIcone({ rede, tamanho = "sm" }: { rede: Rede; tamanho?: "sm" | "lg" }) {
  const { Icone, className, label } = REDE_META[rede];
  return (
    <span
      title={label}
      className={cn(
        "flex shrink-0 items-center justify-center",
        tamanho === "sm" ? "h-5 w-5 rounded-md" : "h-11 w-11 rounded-2xl",
        className,
      )}
    >
      <Icone aria-hidden className={tamanho === "sm" ? "h-3 w-3" : "h-5 w-5"} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
