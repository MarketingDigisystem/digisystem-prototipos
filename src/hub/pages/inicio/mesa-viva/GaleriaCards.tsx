/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: prototipos/react/src/hub/components/NovaTarefaDialog.tsx (padrão de diálogo: fundo, Esc, foco) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Galeria "+ Adicionar card": os cards fora da mesa para o papel atual, com
 * uma mini prévia de forma e o selo "Indicado para você" para quem decide.
 */
import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { CATALOGO, type CardId } from "./catalogo";
import { BOTAO_ICONE } from "./MenuCard";

export function GaleriaCards({
  cards,
  indicados,
  onAdicionar,
  onFechar,
}: {
  cards: CardId[];
  indicados: CardId[];
  onAdicionar: (id: CardId) => void;
  onFechar: () => void;
}) {
  const idTitulo = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const primeiro = ref.current?.querySelector<HTMLElement>("[data-adicionar]") ?? ref.current?.querySelector<HTMLElement>("button");
    primeiro?.focus();
  }, []);

  // Tab preso dentro do diálogo; Esc fecha.
  const tecla = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onFechar();
      return;
    }
    if (e.key !== "Tab" || !ref.current) return;
    const focaveis = [...ref.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]")];
    if (focaveis.length === 0) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-4" onKeyDown={tecla}>
      <button type="button" aria-label="Fechar" tabIndex={-1} onClick={onFechar} className="absolute inset-0 bg-primary/25 backdrop-blur-[2px]" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="animate-tela-abrindo relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-card p-6 text-card-foreground shadow-float sm:max-w-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={idTitulo} className="font-display text-xl font-bold text-primary">
              Adicionar card
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Escolha o que mais ajuda no seu dia. Dá para tirar depois pela gaveta.</p>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar a galeria" className={BOTAO_ICONE}>
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        {cards.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Todos os cards já estão na sua mesa ou na gaveta.</p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {cards.map((id) => {
              const m = CATALOGO[id];
              const indicado = indicados.includes(id);
              return (
                <li key={id} className="flex flex-col rounded-2xl border border-border bg-background/40 p-4">
                  <div aria-hidden className="mb-3 space-y-1.5 rounded-xl bg-secondary/70 p-3">
                    <span className={cn("block h-2 rounded-full bg-primary/25", m.tamanhoPadrao === "largo" ? "w-3/4" : "w-1/2")} />
                    <span className="block h-2 w-full rounded-full bg-muted-foreground/15" />
                    <span className="block h-2 w-5/6 rounded-full bg-muted-foreground/15" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-primary">{m.titulo}</h3>
                    {indicado && (
                      <span className="mmv-texto-laranja rounded-full bg-orange-soft px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider">
                        Indicado para você
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted-foreground">{m.descricaoGaleria}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">{m.tamanhoPadrao === "largo" ? "Ocupa 2 colunas" : "Ocupa 1 coluna"}</span>
                    <button
                      type="button"
                      data-adicionar
                      onClick={() => onAdicionar(id)}
                      aria-label={`Adicionar ${m.titulo} à mesa`}
                      className="rounded-xl bg-primary px-4 py-2 font-display text-xs font-bold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    >
                      Adicionar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
