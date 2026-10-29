/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/planejamento.tsx (chip "⚑ Reprovado" com Flag) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Alerta de problema na frente do card (proposta 4.4, revisão 3): "1 problema:
 * post de cobertura reprovado". O texto vem de regras.ts (alertaDoCard). O card
 * só vai para a coluna Problemas quando parou por inteiro; antes disso, o
 * problema aparece aqui, sem esconder o que continua andando.
 */
import { Flag } from "lucide-react";
import type { Problema } from "../store/tipos";
import { cn } from "../../lib/utils";

export function AlertaProblema({
  texto,
  problemas,
  className,
}: {
  texto: string;
  problemas: Problema[];
  className?: string;
}) {
  // Esperar o solicitante não é falha do time: tom laranja da marca, não vermelho.
  const soEspera = problemas.every((p) => p.tipo === "aguardando_solicitante");
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 rounded-xl px-2.5 py-1.5 font-display text-[11px] font-semibold leading-snug",
        soEspera ? "bg-orange-soft text-accent" : "bg-destructive/[0.07] text-destructive",
        className,
      )}
      title={problemas.map((p) => p.motivo).join("\n")}
    >
      <Flag aria-hidden className="mt-px h-3 w-3 shrink-0" />
      <span className="min-w-0">{texto}</span>
    </p>
  );
}
