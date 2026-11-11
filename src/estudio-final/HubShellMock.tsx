// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/hub/components/shell/CabecalhoShell.tsx (+ NavAreas, MenuAreas, BuscaTopo, BotaoTema,
//   MenuAvatar), src/hub/components/sidebar/modulos.ts, src/routes/_authenticated/route.tsx @ leitura
//   2026-10 (clone mhdgst-trabalho, somente leitura). Fonte da verdade = clone real.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
//
// Casca do Hub: barra superior de 56px (marca à esquerda, áreas centradas na JANELA em lg+, busca/tema/
// avatar à direita) com a alça de ocultar/mostrar ANCORADA à extremidade direita nos dois estados
// (Opção A, 2026-10-29). Abaixo de lg as áreas viram o seletor compacto. O Estúdio força tema CLARO, então o
// botão de tema fica desabilitado com a dica. O logo é um MOCK (o real é um PNG do Marketing Hub).
import { ChevronDown, ChevronUp, LayoutGrid, Search, Sun } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { FOCO } from "./ui";

const AREAS = ["Minha mesa", "Tarefas", "Posts", "Tendências", "Marca", "Resultados", "Configurações"];
const AREA_ATIVA = "Posts";

function MarcaTopo() {
  return (
    <span className="flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 60 56" aria-hidden>
        <circle cx="18" cy="30" r="14" fill="#36499b" />
        <circle cx="40" cy="18" r="10" fill="#ff6d2d" />
        <circle cx="44" cy="40" r="8" fill="#67cfee" />
      </svg>
      <span className="font-display text-lg font-bold leading-none text-primary">
        Marketing <span className="text-[#ff6d2d]">Hub</span>
      </span>
    </span>
  );
}

function MenuCompacto() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);
  return (
    <div ref={ref} className="relative lg:hidden">
      <button
        type="button"
        aria-expanded={aberto}
        aria-label="Áreas do hub"
        onClick={() => setAberto((v) => !v)}
        className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl bg-secondary px-2.5 font-display text-xs font-bold text-primary", FOCO)}
      >
        <LayoutGrid aria-hidden className="h-4 w-4" />
        <span className="hidden min-[420px]:inline">{AREA_ATIVA}</span>
        <ChevronDown aria-hidden className="h-3.5 w-3.5" />
      </button>
      {aberto && (
        <ul className="absolute left-0 top-11 z-50 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-float)]">
          {AREAS.map((a) => (
            <li key={a}>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left font-display text-sm font-bold",
                  a === AREA_ATIVA ? "bg-[var(--navy-soft)] text-primary" : "text-muted-foreground hover:bg-secondary",
                )}
              >
                {a}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HubShellMock({ children }: { children: ReactNode }) {
  const [oculta, setOculta] = useState(false);
  return (
    <div className="ef-shell min-h-[100dvh] bg-background text-foreground">
      <header className="relative z-30 shrink-0 border-b border-border bg-background">
        <h1 className="sr-only">Posts</h1>
        <div className="flex min-w-0 items-start">
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "grid min-w-0 transition-[grid-template-rows,opacity] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                oculta ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
              aria-hidden
            >
              <div className="min-h-0 overflow-hidden">
                <div className="h-6" />
              </div>
            </div>
            <div
              id="ef-barra-modulos"
              inert={oculta}
              className={cn(
                "grid min-w-0 transition-[grid-template-rows,opacity] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                oculta ? "invisible grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
              )}
            >
              <div className="min-h-0 min-w-0 overflow-hidden">
                <div className="relative grid h-14 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-4 sm:px-6">
                  <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 sm:gap-3">
                    <a href="#/estudio-final" className={cn("shrink-0 rounded-lg", FOCO)} aria-label="Marketing Hub — ir para Minha mesa">
                      <MarcaTopo />
                    </a>
                    <MenuCompacto />
                  </div>
                  <nav
                    aria-label="Áreas do hub"
                    className="pointer-events-none absolute left-1/2 top-0 row-start-1 hidden h-14 -translate-x-1/2 min-w-0 items-stretch lg:flex"
                  >
                    <ul className="pointer-events-auto flex items-stretch gap-0.5">
                      {AREAS.map((a) => {
                        const ativa = a === AREA_ATIVA;
                        return (
                          <li key={a} className="shrink-0">
                            <button
                              type="button"
                              aria-current={ativa ? "page" : undefined}
                              className={cn(
                                "relative flex h-full items-center px-3 font-display text-sm font-bold transition-colors motion-reduce:transition-none",
                                FOCO,
                                ativa ? "text-primary" : "text-muted-foreground hover:text-primary",
                              )}
                            >
                              {a}
                              {ativa && <span aria-hidden className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-[#36499b]" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                  <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-end gap-1.5 sm:gap-2.5">
                    <button
                      type="button"
                      aria-label="Buscar"
                      className={cn(
                        "inline-flex h-9 items-center gap-2 rounded-xl bg-secondary px-2.5 text-xs text-muted-foreground min-[1280px]:w-52",
                        FOCO,
                      )}
                    >
                      <Search aria-hidden className="h-4 w-4 shrink-0" />
                      <span className="hidden min-[1280px]:inline">Buscar no hub…</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      title="O Estúdio usa o tema claro"
                      aria-label="Tema (o Estúdio usa o tema claro)"
                      className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground opacity-60"
                    >
                      <Sun aria-hidden className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Menu da conta — Marcelo Lucas, Admin"
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#36499b] font-display text-xs font-bold text-white",
                        FOCO,
                      )}
                    >
                      ML
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Alça ancorada à direita do topo: MESMA posição nos dois estados (Opção A). */}
          <span className="flex shrink-0 items-center py-[7px] pr-4 sm:pr-6">
            <button
              type="button"
              onClick={() => setOculta((v) => !v)}
              aria-expanded={!oculta}
              aria-controls="ef-barra-modulos"
              aria-label={oculta ? "Mostrar barra de módulos" : "Ocultar barra de módulos"}
              title={oculta ? "Mostrar barra de módulos" : "Ocultar barra de módulos"}
              className={cn(
                "group flex h-[18px] w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-muted-foreground shadow-[var(--shadow-card)] transition-[height,color] duration-[160ms] hover:h-[22px] hover:text-primary focus-visible:h-[22px] motion-reduce:transition-none",
                FOCO,
              )}
            >
              {oculta ? <ChevronDown aria-hidden className="h-3.5 w-3.5" /> : <ChevronUp aria-hidden className="h-3.5 w-3.5" />}
            </button>
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
