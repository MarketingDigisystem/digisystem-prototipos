// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: Arquivos_temporarios_for_AI/digisystem-loading-buttons/.../primitives.tsx (Spinner, AnimatedCheck,
//   LiveRegion, AlertIcon portados; classes dg- → ia-w-). SparkleIcon e DocIcon NÃO foram portados: a marca de
//   repouso é a folha com cursor do mock v2 (nunca Sparkles / ícone genérico de IA).
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
import { cn } from "../../lib/utils";

interface SvgProps {
  size?: number;
  className?: string;
}

/** Spinner de arco (item ativo do checklist). Herda a cor do texto. */
export function Spinner({ size = 20, className, strokeWidth = 5, trackOpacity = 0.25 }: SvgProps & { strokeWidth?: number; trackOpacity?: number }) {
  return (
    <svg className={cn("ia-w-spinner shrink-0", className)} width={size} height={size} viewBox="0 0 50 50" aria-hidden="true">
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeOpacity={trackOpacity} strokeWidth={strokeWidth} />
      <circle className="arc" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/** Check que se desenha. */
export function AnimatedCheck({ size = 20, className, strokeWidth = 2.8 }: SvgProps & { strokeWidth?: number }) {
  return (
    <svg
      className={cn("ia-w-check shrink-0", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export const AlertIcon = ({ size = 18, className }: SvgProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={2.4} className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5h.01" />
  </svg>
);

/** Região invisível que anuncia o status para leitores de tela. */
export function LiveRegion({ message }: { message?: string }) {
  return (
    <span className="sr-only" role="status" aria-live="polite">
      {message ?? ""}
    </span>
  );
}

/**
 * Símbolo de repouso do botão: folha com linhas + cursor (mock v2 aprovado).
 * Cursor pisca em repouso; as linhas se redesenham no hover do botão pai (.ia-w-btn); enquanto o botão está
 * ocupado (aria-busy) as linhas se desenham sem parar e o cursor anda. Tudo em CSS (ia-w-folha).
 */
export function FolhaCursor({ size = 30, className }: SvgProps) {
  return (
    <svg className={cn("ia-w-folha shrink-0", className)} width={size} height={size} viewBox="0 0 30 30" aria-hidden="true">
      <rect className="borda" x="5" y="3" width="20" height="24" rx="4" />
      <line className="l l1" x1="9.5" y1="10" x2="20.5" y2="10" />
      <line className="l l2" x1="9.5" y1="15" x2="20.5" y2="15" />
      <line className="l l3" x1="9.5" y1="20" x2="16.5" y2="20" />
      <rect className="cursor" x="18" y="17.5" width="1.8" height="5" rx="0.9" />
    </svg>
  );
}
