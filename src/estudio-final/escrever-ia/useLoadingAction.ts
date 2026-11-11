// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: Arquivos_temporarios_for_AI/digisystem-loading-buttons/.../useLoadingAction.ts (portado sem mudança de lógica;
//   só o import de tipos ficou relativo). Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
import { useCallback, useEffect, useRef, useState } from "react";
import type { LoadState } from "./types";

export interface UseLoadingActionOptions<T> {
  /** Tempo mínimo em loading, para o estado não piscar. Padrão: 600 ms. */
  minLoadingMs?: number;
  /** Quanto tempo o sucesso fica visível antes de voltar a idle. 0 = fica. Padrão: 1500 ms. */
  successMs?: number;
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Controla o ciclo idle → loading → success | error.
 * - Ignora cliques enquanto está em loading ou success (sem envio duplicado).
 * - Garante um tempo mínimo de loading.
 * - Passa um AbortSignal para a ação, usado por `cancel()`.
 */
export function useLoadingAction<T = void>(
  action: (signal: AbortSignal) => Promise<T>,
  { minLoadingMs = 600, successMs = 1500, onSuccess, onError }: UseLoadingActionOptions<T> = {},
) {
  const [state, setStateRaw] = useState<LoadState>("idle");
  const [error, setError] = useState<unknown>(null);

  const stateRef = useRef<LoadState>("idle");
  const controller = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const actionRef = useRef(action);
  const callbacks = useRef({ onSuccess, onError });
  actionRef.current = action;
  callbacks.current = { onSuccess, onError };

  const setState = useCallback((next: LoadState) => {
    stateRef.current = next;
    if (mounted.current) setStateRaw(next);
  }, []);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
      clearTimer();
    };
  }, []);

  const run = useCallback(async () => {
    if (stateRef.current === "loading" || stateRef.current === "success") return;
    clearTimer();
    const ctrl = new AbortController();
    controller.current = ctrl;
    setError(null);
    setState("loading");
    const startedAt = Date.now();

    try {
      const result = await actionRef.current(ctrl.signal);
      await wait(Math.max(0, minLoadingMs - (Date.now() - startedAt)));
      if (!mounted.current || ctrl.signal.aborted) return;
      setState("success");
      callbacks.current.onSuccess?.(result);
      if (successMs > 0) timer.current = setTimeout(() => setState("idle"), successMs);
    } catch (err) {
      if (!mounted.current || ctrl.signal.aborted) return;
      await wait(Math.max(0, minLoadingMs - (Date.now() - startedAt)));
      setError(err);
      setState("error");
      callbacks.current.onError?.(err);
    } finally {
      if (controller.current === ctrl) controller.current = null;
    }
  }, [minLoadingMs, successMs, setState]);

  /** Interrompe a ação em andamento e volta para idle. */
  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    clearTimer();
    setState("idle");
  }, [setState]);

  /** Volta para idle e limpa o erro. */
  const reset = useCallback(() => {
    cancel();
    setError(null);
  }, [cancel]);

  return { state, error, run, cancel, reset, isBusy: state === "loading" || state === "success" };
}
