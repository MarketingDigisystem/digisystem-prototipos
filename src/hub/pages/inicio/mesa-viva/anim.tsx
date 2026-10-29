/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Peças de movimento da Minha Mesa viva. Tudo respeita prefers-reduced-motion.
 */
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "../../../../lib/utils";

const CONSULTA = "(prefers-reduced-motion: reduce)";

/** true quando a pessoa pediu menos movimento (acompanha a mudança ao vivo). */
export function useMovimentoReduzido(): boolean {
  const [reduzido, setReduzido] = useState(() => typeof window !== "undefined" && window.matchMedia(CONSULTA).matches);
  useEffect(() => {
    const mq = window.matchMedia(CONSULTA);
    const ao = () => setReduzido(mq.matches);
    mq.addEventListener("change", ao);
    return () => mq.removeEventListener("change", ao);
  }, []);
  return reduzido;
}

type DocVT = Document & {
  startViewTransition?: (cb: () => void) => {
    updateCallbackDone: Promise<void>;
    finished: Promise<void>;
    skipTransition: () => void;
  };
};

/**
 * Muda o layout com View Transitions (morph de posição e tamanho dos cards).
 * Sem suporte, ou com menos movimento, muda direto. `depois` roda quando o DOM
 * novo já está no lugar (para mover o foco).
 */
export function comTransicao(mudar: () => void, reduzido: boolean, depois?: () => void) {
  const doc = document as DocVT;
  if (reduzido || typeof doc.startViewTransition !== "function") {
    flushSync(mudar);
    depois?.();
    return;
  }
  try {
    let rodou = false;
    const t = doc.startViewTransition(() => {
      rodou = true;
      flushSync(mudar);
    });
    // O navegador só chama o callback no próximo quadro. Se o quadro não vier
    // logo (aba sem pintar, automação), pula a animação: a mudança nunca trava.
    const vigia = window.setTimeout(() => {
      if (!rodou) t.skipTransition();
    }, 300);
    t.updateCallbackDone.then(
      () => {
        window.clearTimeout(vigia);
        depois?.();
      },
      () => {
        window.clearTimeout(vigia);
        depois?.();
      },
    );
    // Transição pulada rejeita `ready`; não é erro, a mudança já entrou.
    (t as unknown as { ready?: Promise<void> }).ready?.catch(() => {});
    t.finished.catch(() => {});
  } catch {
    flushSync(mudar);
    depois?.();
  }
}

/** Número que troca com o velho subindo e o novo entrando de baixo. */
export function ContadorAnimado({ valor, className }: { valor: number; className?: string }) {
  const reduzido = useMovimentoReduzido();
  const [atual, setAtual] = useState(valor);
  const [anterior, setAnterior] = useState<number | null>(null);

  useEffect(() => {
    if (valor === atual) return;
    if (reduzido) {
      setAtual(valor);
      return;
    }
    setAnterior(atual);
    setAtual(valor);
    const t = window.setTimeout(() => setAnterior(null), 230);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <span className={cn("relative inline-flex overflow-hidden tabular-nums", className)}>
      {anterior !== null && (
        <span aria-hidden className="mmv-num-sai absolute inset-0 text-center">
          {anterior}
        </span>
      )}
      <span key={atual} className={anterior !== null ? "mmv-num-entra" : undefined}>
        {atual}
      </span>
    </span>
  );
}

/** Check que se desenha: anel, depois o tique. */
export function CheckAnimado({ marcado, className }: { marcado: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden data-marcado={marcado} className={cn("mmv-check h-5 w-5", className)} fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle className="mmv-check-fundo mmv-check-base" cx="10" cy="10" r="8.25" fill="transparent" />
      <circle className="mmv-check-anel" cx="10" cy="10" r="8.25" pathLength={1} transform="rotate(-90 10 10)" />
      <path className="mmv-check-tique" d="M6.2 10.4l2.6 2.6 5-5.4" pathLength={1} />
    </svg>
  );
}

/** Espera que respeita o movimento reduzido (usa `curto` quando reduzido). */
export const esperar = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
