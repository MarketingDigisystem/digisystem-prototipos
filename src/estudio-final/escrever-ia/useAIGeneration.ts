// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: Arquivos_temporarios_for_AI/digisystem-loading-buttons/.../useAIGeneration.ts (portado sem mudança de lógica).
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
import { useCallback, useState } from "react";
import { useLoadingAction } from "./useLoadingAction";
import { stepFromProgress, useEstimatedProgress } from "./useEstimatedProgress";

export interface UseAIGenerationOptions<T> {
  /** Duração típica da geração. Padrão: 10 s. */
  expectedMs?: number;
  /** Onde cada etapa termina, em %. Padrão para 3 etapas: [38, 72]. */
  stepThresholds?: number[];
  onDone?: (result: T) => void;
}

/**
 * Orquestra o botão de geração + checklist (mesmo estado nos dois).
 * No app real, se a API fizer streaming por etapa, troque o progresso estimado pelo real e passe
 * `activeStep` direto (ver a regra de honestidade em useEstimatedProgress).
 */
export function useAIGeneration<T>(
  generate: (signal: AbortSignal) => Promise<T>,
  { expectedMs = 10000, stepThresholds = [38, 72], onDone }: UseAIGenerationOptions<T> = {},
) {
  const [cancelled, setCancelled] = useState(false);
  const action = useLoadingAction(generate, { successMs: 0, minLoadingMs: 1200, onSuccess: onDone });
  const { progress, secondsLeft } = useEstimatedProgress(action.state === "loading", action.state === "success", expectedMs);
  const activeStep = stepFromProgress(progress, stepThresholds);

  const start = useCallback(() => {
    setCancelled(false);
    void action.run();
  }, [action]);

  const cancel = useCallback(() => {
    action.cancel();
    setCancelled(true);
  }, [action]);

  const reset = useCallback(() => {
    action.reset();
    setCancelled(false);
  }, [action]);

  return { state: action.state, error: action.error, progress, secondsLeft, activeStep, cancelled, start, cancel, reset };
}

/** Forma do que o hook devolve (para passar como prop sem repetir a lista). */
export type AIGeneration = ReturnType<typeof useAIGeneration>;
