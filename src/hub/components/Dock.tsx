/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/AppDock.tsx, src/routes/_authenticated/route.tsx
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Dock flutuante com as mesmas classes do real e o menu novo (proposta 2.2/2.3):
 * Início · Tendências · Tarefas · Posts · Marca · Resultados · | · ⚙ Configurações (só admin) · Sair.
 * Celular (o real não tem versão própria): ícones h-10 w-10, sem rótulo flutuante,
 * e o dock rola na horizontal se não couber.
 */
import {
  BarChart3,
  CalendarClock,
  LayoutGrid,
  Library,
  LogOut,
  Palette,
  Settings,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Papel } from "../store/tipos";
import { AREAS, ORDEM_DOCK, areaVisivel, hrefDe, type AreaId } from "../router";

const ICONES: Record<AreaId, LucideIcon> = {
  inicio: LayoutGrid,
  tendencias: TrendingUp,
  tarefas: CalendarClock,
  posts: Library,
  marca: Palette,
  resultados: BarChart3,
  configuracoes: Settings,
  // Fora do ORDEM_DOCK (não aparece no Dock); só satisfaz o tipo.
  perfil: UserRound,
};

export function Dock({
  areaAtiva,
  papel,
  onSair,
}: {
  areaAtiva: AreaId;
  papel: Papel;
  onSair: () => void;
}) {
  const mostraConfig = areaVisivel("configuracoes", papel);

  return (
    <nav
      aria-label="Navegação principal"
      className="glass fixed bottom-3 left-1/2 z-50 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-0.5 rounded-3xl px-1.5 py-1.5 max-sm:overflow-x-auto max-sm:[scrollbar-width:none] sm:bottom-5 sm:gap-1 sm:px-2.5 sm:py-2"
    >
      {ORDEM_DOCK.map((id) => (
        <ItemDock key={id} area={id} ativo={areaAtiva === id} />
      ))}

      {mostraConfig && (
        <>
          <span aria-hidden className="mx-0.5 h-8 w-px shrink-0 bg-border sm:mx-1" />
          <ItemDock area="configuracoes" ativo={areaAtiva === "configuracoes"} />
        </>
      )}

      <button
        type="button"
        onClick={onSair}
        aria-label="Sair"
        className="group relative flex shrink-0 flex-col items-center"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-destructive/10 hover:text-destructive sm:h-11 sm:w-11">
          <LogOut className="h-5 w-5" strokeWidth={2} />
        </span>
        <Rotulo texto="Sair" />
        <span className="mt-1 h-1 w-1 rounded-full" />
      </button>
    </nav>
  );
}

function ItemDock({ area, ativo }: { area: AreaId; ativo: boolean }) {
  const Icon = ICONES[area];
  const label = AREAS[area].label;
  return (
    <a
      href={hrefDe(area)}
      aria-label={label}
      aria-current={ativo ? "page" : undefined}
      className="group relative flex shrink-0 flex-col items-center"
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 sm:h-11 sm:w-11",
          ativo
            ? "bg-primary text-primary-foreground shadow-float"
            : "text-muted-foreground hover:-translate-y-1 hover:bg-navy-soft hover:text-primary",
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={ativo ? 2.4 : 2} />
      </span>
      <Rotulo texto={label} />
      <span
        className={cn("mt-1 h-1 w-1 rounded-full transition-all duration-300", ativo ? "bg-accent" : "bg-transparent")}
      />
    </a>
  );
}

/** Rótulo ao passar o mouse (só a partir de sm; no celular o dock rola e cortaria). */
function Rotulo({ texto }: { texto: string }) {
  return (
    <span className="pointer-events-none absolute -top-9 hidden whitespace-nowrap rounded-lg bg-primary px-2.5 py-1 font-display text-xs font-semibold tracking-wide text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
      {texto}
    </span>
  );
}
