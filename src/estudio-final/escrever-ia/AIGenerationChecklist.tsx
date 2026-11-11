// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: Arquivos_temporarios_for_AI/digisystem-loading-buttons/.../AIGenerationChecklist.tsx.
//   Cores/fontes do Hub ATUAL (não o “rebrand 2026”): títulos Dosis, corpo Open Sans, navy #1f2a44, azul #36499b.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
import { cn } from "../../lib/utils";
import { AnimatedCheck, Spinner } from "./primitives";
import type { AIStep, LoadState } from "./types";

export interface AIGenerationChecklistProps {
  steps: AIStep[];
  state: LoadState;
  /** Índice da etapa em andamento (0-based). */
  activeStep: number;
  title: string;
  footnote?: string;
  className?: string;
}

/**
 * Lista “A IA vai escrever…” sincronizada com o AIGenerateButton.
 * Cada item passa por: vazio → spinner (ativo, com fundo) → check laranja.
 * Altura constante em todos os estados (só troca o conteúdo dos marcadores), então nada se desloca.
 */
export function AIGenerationChecklist({
  steps,
  state,
  activeStep,
  title,
  footnote = "Você revisa e edita tudo no passo seguinte.",
  className,
}: AIGenerationChecklistProps) {
  return (
    <div className={cn("flex w-full flex-col gap-1.5 rounded-[20px] border border-[#eef1f7] bg-[#f8fafd] px-3 py-4", className)}>
      <div className="px-2.5 pb-1 font-display text-xs font-bold uppercase tracking-[0.1em] text-[#36499b]">{title}</div>
      <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
        {steps.map((step, i) => {
          const done = state === "success" || (state === "loading" && i < activeStep);
          const active = state === "loading" && i === activeStep;
          return (
            <li
              key={step.id}
              aria-current={active ? "step" : undefined}
              className={cn("flex gap-3 rounded-xl px-2.5 py-2 transition-colors duration-300 motion-reduce:transition-none", active ? "bg-white" : "bg-transparent")}
            >
              <span className="mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                {done ? (
                  <span className="ia-w-pop flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--ia-w-btn)] text-white">
                    <AnimatedCheck size={14} strokeWidth={3.2} />
                  </span>
                ) : active ? (
                  <Spinner size={22} strokeWidth={6} trackOpacity={0.2} className="text-[var(--ia-w-btn)]" />
                ) : (
                  <span className="block h-[22px] w-[22px] rounded-full border-2 border-[#d6dcea]" aria-hidden="true" />
                )}
              </span>
              <span className="text-[13px] leading-snug text-muted-foreground">
                <span className="font-display text-sm font-bold text-[#1f2a44]">{step.label}</span> · {step.detail}
                <span className="sr-only">{done ? " (concluído)" : active ? " (em andamento)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {footnote && <div className="px-2.5 pt-1 text-xs leading-snug text-muted-foreground">{footnote}</div>}
    </div>
  );
}
