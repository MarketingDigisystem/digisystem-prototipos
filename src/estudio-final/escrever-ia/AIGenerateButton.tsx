// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: Arquivos_temporarios_for_AI/digisystem-loading-buttons/.../AIGenerateButton.tsx.
// Mudanças deliberadas (decisão do usuário, 2026-11-04):
//   • cores/fontes do Hub ATUAL (Reflex Blue #36499b, laranja #ff6d2d, sky #67cfee; títulos Dosis, corpo Open Sans),
//     NÃO os tokens do “rebrand 2026” do kit. Preenchimento do botão = var(--ia-w-btn) (#e2561a, mesmo matiz do
//     laranja da marca, mais escuro para o texto branco ler; uma linha no CSS para trocar);
//   • SparkleIcon REMOVIDO: o chip branco traz a folha com cursor (mock v2); à direita, seta “→”;
//   • enquanto escreve, o chip mostra a escrita animada (linhas + cursor) em vez do spinner (o spinner fica no
//     item ativo do checklist); título maior e bold (>= 19px) porque branco sobre este laranja dá ~3,8:1;
//   • tamanho do botão FIXO (88px de altura; largura da coluna) e linha de apoio com altura mínima fixa.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
import type { MouseEvent, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { AlertIcon, AnimatedCheck, FolhaCursor, LiveRegion } from "./primitives";
import { BorderProgress } from "./BorderProgress";
import type { AIStep, LoadState } from "./types";

export interface AIGenerateButtonProps {
  state: LoadState;
  steps: AIStep[];
  /** Índice da etapa em andamento (0-based). */
  activeStep: number;
  /** 0 a 100. Estimado (useEstimatedProgress) ou real (streaming). */
  progress: number;
  secondsLeft?: number;
  onGenerate: () => void;
  onCancel?: () => void;
  /** Clique no estado de sucesso: leva para a revisão (Etapa 2 · Conteúdo). */
  onReview?: () => void;
  /** Bloqueia o clique em idle (campos obrigatórios faltando). */
  blocked?: boolean;
  /** Texto de apoio quando bloqueado (diz o que falta). */
  blockedHelper?: ReactNode;
  title?: ReactNode;
  readyTitle?: ReactNode;
  helper?: ReactNode;
  successMessage?: ReactNode;
  errorMessage?: ReactNode;
  /** Mostra a nota “Geração cancelada” no idle. */
  cancelled?: boolean;
  className?: string;
}

export function AIGenerateButton({
  state,
  steps,
  activeStep,
  progress,
  secondsLeft,
  onGenerate,
  onCancel,
  onReview,
  blocked = false,
  blockedHelper,
  title = "Escrever com a IA",
  readyTitle = "Texto pronto. Revisar",
  helper = "Leva alguns segundos. Você revisa tudo depois.",
  successMessage = "Legenda, hashtags e CTA prontos para revisão.",
  errorMessage = "A IA não respondeu. Seu tema foi mantido.",
  cancelled = false,
  className,
}: AIGenerateButtonProps) {
  const loading = state === "loading";
  const success = state === "success";
  const error = state === "error";
  const bloqueado = blocked && state === "idle";
  const step = steps[Math.min(activeStep, steps.length - 1)];
  const pct = Math.round(Math.min(100, Math.max(0, progress)));

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) return event.preventDefault();
    if (success) return onReview?.();
    onGenerate();
  };

  const live = loading
    ? `${step.doing}, etapa ${activeStep + 1} de ${steps.length}`
    : success
      ? "Texto pronto para revisão"
      : error
        ? "Erro na geração"
        : cancelled
          ? "Geração cancelada"
          : "";

  return (
    <div className={cn("flex w-full flex-col gap-3.5", className)}>
      <button
        type="button"
        disabled={bloqueado}
        aria-disabled={loading || undefined}
        aria-busy={loading}
        onClick={handleClick}
        className={cn(
          "ia-w-btn relative flex h-[88px] w-full items-center gap-3 rounded-[20px] border-0 pl-[18px] pr-[18px] text-left font-display text-white",
          success ? "ia-w-ping-navy bg-[var(--ia-w-navy)]" : "bg-[var(--ia-w-btn)]",
          error && "ia-w-shake",
        )}
      >
        {/* chip branco: folha com cursor em repouso/escrevendo; check no sucesso; alerta no erro */}
        <span aria-hidden="true" className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-white">
          {success ? (
            <AnimatedCheck size={28} className="text-[var(--ia-w-btn)]" />
          ) : error ? (
            <AlertIcon size={26} className="text-[var(--ia-w-btn)]" />
          ) : (
            <FolhaCursor size={30} />
          )}
        </span>

        {/* título: troca a cada etapa; até 2 linhas, altura do botão não muda */}
        <span className="min-w-0 flex-1 text-[20px] font-bold leading-[1.1]">
          <span key={loading ? `step-${activeStep}` : state} className="ia-w-in line-clamp-2">
            {loading ? step.doing : success ? readyTitle : error ? "Tentar de novo" : title}
          </span>
        </span>

        {/* lado direito: % durante a geração; seta nos demais estados */}
        {loading ? (
          <span className="min-w-[52px] shrink-0 rounded-full bg-[var(--ia-w-navy)] px-2.5 py-1.5 text-center font-display text-[15px] font-bold tabular-nums">{pct}%</span>
        ) : (
          <span className="ia-w-arrow shrink-0 text-2xl leading-none" aria-hidden="true">→</span>
        )}

        {/* progresso 0–100% na borda; some suavemente no sucesso */}
        {(loading || success) && <BorderProgress progress={success ? 100 : pct} radius={20} fading={success} />}
      </button>

      {/* linha de apoio: altura mínima fixa, muda só o conteúdo */}
      <div className="flex min-h-[40px] flex-wrap content-start items-start gap-x-3 gap-y-1 px-1 text-[13px] font-medium text-muted-foreground">
        {loading ? (
          <>
            <span className="tabular-nums">
              Etapa {activeStep + 1} de {steps.length}
              {secondsLeft != null && ` · cerca de ${secondsLeft} s`}
            </span>
            {onCancel && (
              <>
                <span aria-hidden="true" className="text-[#c9d0e0]">|</span>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded border-0 bg-transparent px-0.5 text-[13px] font-semibold text-[#36499b] underline underline-offset-[3px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--ia-w-sky)]"
                >
                  Cancelar geração
                </button>
              </>
            )}
          </>
        ) : success ? (
          <span key="ok" className="ia-w-in text-[#1f2a44]">{successMessage}</span>
        ) : error ? (
          <span key="err" className="ia-w-msg inline-flex items-start gap-1.5 text-[#1f2a44]">
            <AlertIcon size={16} className="mt-px shrink-0 text-[var(--ia-w-btn)]" />
            {errorMessage}
          </span>
        ) : bloqueado ? (
          <span key="blk" className="ia-w-in">{blockedHelper}</span>
        ) : cancelled ? (
          <span key="cancel" className="ia-w-in text-[#1f2a44]">Geração cancelada. Nada foi alterado.</span>
        ) : (
          <span key="help" className="ia-w-in">{helper}</span>
        )}
      </div>
      <LiveRegion message={live} />
    </div>
  );
}
