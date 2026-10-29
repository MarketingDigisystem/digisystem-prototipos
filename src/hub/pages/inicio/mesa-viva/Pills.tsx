/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Par (ou trio) de pills: o padrão do projeto para Básico/Avançado, nunca
 * switch. radiogroup com setas ←/→ e só a opção marcada no Tab.
 */
import { useRef, type KeyboardEvent } from "react";
import { cn } from "../../../../lib/utils";

export type OpcaoPill<T extends string> = { id: T; label: string };

export function Pills<T extends string>({
  opcoes,
  valor,
  onChange,
  rotulo,
  tamanho = "md",
  className,
}: {
  opcoes: OpcaoPill<T>[];
  valor: T;
  onChange: (v: T) => void;
  /** aria-label do grupo. */
  rotulo: string;
  tamanho?: "sm" | "md";
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const tecla = (e: KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const j = (i + delta + opcoes.length) % opcoes.length;
    onChange(opcoes[j].id);
    refs.current[j]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={rotulo} className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {opcoes.map((o, i) => {
        const marcado = o.id === valor;
        return (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={marcado}
            tabIndex={marcado ? 0 : -1}
            onClick={() => onChange(o.id)}
            onKeyDown={(e) => tecla(e, i)}
            className={cn(
              "rounded-full font-display font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              tamanho === "sm" ? "px-3 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
              marcado ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-sky-soft",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
