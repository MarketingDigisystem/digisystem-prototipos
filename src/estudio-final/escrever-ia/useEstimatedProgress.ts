// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: Arquivos_temporarios_for_AI/digisystem-loading-buttons/.../useEstimatedProgress.ts (portado sem mudança de lógica).
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
import { useEffect, useRef, useState } from "react";

/**
 * Progresso ESTIMADO para tarefas sem progresso real (chamada de IA).
 * Avança com desaceleração até `cap` (92%) e só chega a 100 quando `done` vira true: a barra nunca “trava
 * em 100%” esperando a resposta.
 *
 * REGRA DE HONESTIDADE (app real): este número é uma estimativa, não uma medida. O progresso fica abaixo de
 * 100% até a resposta chegar. E o check de cada etapa do checklist só pode aparecer quando a etapa realmente
 * terminou (resultado real da API, ex.: legenda recebida), nunca só porque o relógio passou. Aqui, no
 * protótipo, as etapas avançam pela estimativa porque a chamada é um temporizador de mentira.
 */
export function useEstimatedProgress(active: boolean, done: boolean, expectedMs = 10000, cap = 92) {
  const [progress, setProgress] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (done) {
      setProgress(100);
      return;
    }
    if (!active) {
      startedAt.current = null;
      setProgress(0);
      return;
    }
    startedAt.current = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - (startedAt.current ?? Date.now());
      // Curva exponencial: ~63% do cap no tempo esperado, depois desacelera.
      const value = cap * (1 - Math.exp(-elapsed / (expectedMs * 0.6)));
      setProgress(Math.min(cap, value));
    }, 100);
    return () => clearInterval(id);
  }, [active, done, expectedMs, cap]);

  const secondsLeft = Math.max(1, Math.round(((100 - progress) / 100) * (expectedMs / 1000)));
  return { progress, secondsLeft };
}

/** Converte o percentual em índice de etapa. Ex.: [38, 72] → 0, 1 ou 2. */
export function stepFromProgress(progress: number, thresholds: number[]) {
  const index = thresholds.findIndex((t) => progress < t);
  return index === -1 ? thresholds.length : index;
}
