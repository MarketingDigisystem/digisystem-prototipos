/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/PageHeader.tsx, src/routes/_authenticated/tendencias.tsx (abas em pílula),
 *   src/routes/_authenticated/planejamento.tsx (abas roláveis) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Mesmo cabeçalho do real (kicker laranja ou traço, título Dosis, subtítulo).
 * As abas em pílula, que no real cada tela monta e passa por `actions`, viram
 * uma prop própria para todas as áreas terem o mesmo desenho (proposta 2.3).
 */
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { Aba, AreaId } from "../router";
import { hrefDe } from "../router";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  area,
  abas,
  abaAtiva,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Área das abas (para montar os endereços). */
  area?: AreaId;
  abas?: Aba[];
  abaAtiva?: string;
  /** Ações extras à direita, depois das abas (ex.: "Criar post"). */
  actions?: ReactNode;
}) {
  const temAbas = !!area && !!abas && abas.length > 1;

  return (
    <header className="animate-rise grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        ) : (
          <span aria-hidden className="block h-[3px] w-10 rounded-full bg-accent" />
        )}
        <h1 className="mt-2 truncate font-display text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      {(temAbas || actions) && (
        <div className="col-span-2 flex min-w-0 flex-wrap items-center gap-2 sm:col-span-1">
          {temAbas && <AbasPilula area={area!} abas={abas!} abaAtiva={abaAtiva} />}
          {actions}
        </div>
      )}
    </header>
  );
}

/** Abas em pílula do real: rolam na horizontal sem barra quando não cabem. */
export function AbasPilula({ area, abas, abaAtiva }: { area: AreaId; abas: Aba[]; abaAtiva?: string }) {
  return (
    <nav
      aria-label="Abas da área"
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-card p-1 shadow-card [scrollbar-width:none]"
    >
      {abas.map((a) => {
        const ativa = a.id === abaAtiva;
        return (
          <a
            key={a.id}
            href={hrefDe(area, a.id)}
            aria-current={ativa ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 font-display text-xs font-bold transition-all duration-300",
              ativa
                ? "bg-primary text-primary-foreground shadow-card"
                : a.emBreve
                  ? "text-muted-foreground/70 hover:text-muted-foreground"
                  : "text-muted-foreground hover:text-primary",
            )}
          >
            {a.label}
            {a.emBreve && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[9px] uppercase tracking-wider",
                  ativa ? "bg-primary-foreground/20" : "bg-muted",
                )}
              >
                Em breve
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
