/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/planejamento.tsx (chip de origem do card) @ commit 4fcf254 / leitura 2026-10-07.
 *   Sem origem direta: etiquetas são novas (proposta 4.2 item 7).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Etiqueta do card. No lugar do antigo chip de origem (Tendência, Pedido externo…)
 * entram etiquetas livres, criadas em Configurações → Etiquetas. A cor vem da
 * etiqueta (hex) e aparece só como bolinha + fundo bem leve, para o card não
 * virar uma parede de selos.
 */
import type { Etiqueta } from "../store/tipos";
import { cn } from "../../lib/utils";

export function EtiquetaChip({ etiqueta, className }: { etiqueta: Etiqueta; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 font-display text-[11px] font-semibold text-foreground/75",
        className,
      )}
      // 1f = ~12% de opacidade: o fundo só sugere a cor, o texto fica sempre legível.
      style={{ backgroundColor: `${etiqueta.cor}1f` }}
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: etiqueta.cor }} />
      <span className="truncate">{etiqueta.nome}</span>
    </span>
  );
}

/** Linha de etiquetas com limite: mostra as primeiras e resume o resto em "+N". */
export function EtiquetasLinha({ etiquetas, max = 3 }: { etiquetas: Etiqueta[]; max?: number }) {
  if (etiquetas.length === 0) return null;
  const visiveis = etiquetas.slice(0, max);
  const resto = etiquetas.length - visiveis.length;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {visiveis.map((e) => (
        <EtiquetaChip key={e.id} etiqueta={e} />
      ))}
      {resto > 0 && (
        <span className="font-display text-[11px] font-semibold text-muted-foreground" title={etiquetas.slice(max).map((e) => e.nome).join(", ")}>
          +{resto}
        </span>
      )}
    </div>
  );
}
