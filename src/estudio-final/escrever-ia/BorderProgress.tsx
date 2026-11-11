// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: Arquivos_temporarios_for_AI/digisystem-loading-buttons/.../BorderProgress.tsx (classes dg- → ia-w-;
//   cores da marca ATUAL do Hub: sky #67cfee → laranja #ff6d2d). Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface BorderProgressProps {
  /** 0 a 100. O traço percorre a borda nessa proporção. */
  progress: number;
  /** Raio da borda do elemento pai, em px. */
  radius?: number;
  /** Folga entre o elemento e o traço, em px. */
  gap?: number;
  strokeWidth?: number;
  /** Quando true, o anel some suavemente (use no sucesso). */
  fading?: boolean;
  className?: string;
}

/**
 * Progresso de 0 a 100% desenhado na borda do elemento pai.
 * Coloque como filho de um elemento `position: relative` sem `overflow: hidden`.
 * Mede o pai com ResizeObserver, então funciona em qualquer largura.
 *
 * O traço sky → laranja é um TRAÇO DE PROGRESSO (quanto falta), não um indicador de “ativo” da UI: não o
 * reutilize para marcar seleção, foco ou aba ativa (isso é laranja SÓLIDO no Hub, sem degradê).
 */
export function BorderProgress({ progress, radius = 20, gap = 3, strokeWidth = 4, fading = false, className }: BorderProgressProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const gradientId = `ia-w-ring-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const update = () => setBox({ w: parent.offsetWidth, h: parent.offsetHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const pct = Math.min(100, Math.max(0, progress));
  const offset = gap + strokeWidth;
  const w = box.w + offset * 2;
  const h = box.h + offset * 2;
  const half = strokeWidth / 2;
  const rect = { x: half, y: half, width: Math.max(0, w - strokeWidth), height: Math.max(0, h - strokeWidth), rx: radius + gap + half };

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={cn("pointer-events-none absolute overflow-visible", fading && "ia-w-ring-out", className)}
      style={{ top: -offset, left: -offset }}
    >
      {box.w > 0 && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#67cfee" />
              <stop offset="1" stopColor="#ff6d2d" />
            </linearGradient>
          </defs>
          <rect {...rect} fill="none" style={{ stroke: "var(--border)" }} strokeWidth={strokeWidth} />
          <rect
            {...rect}
            className="ia-w-trace"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${pct} 100`}
          />
        </>
      )}
    </svg>
  );
}
