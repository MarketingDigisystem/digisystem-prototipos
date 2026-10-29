/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Menu "⋯" do card: densidade só deste card e "Ocultar card".
 */
import { useEffect, useId, useRef, useState } from "react";
import { Ellipsis, EyeOff } from "lucide-react";
import { cn } from "../../../../lib/utils";
import type { DensidadeCard } from "./layout";
import { Pills } from "./Pills";

export const BOTAO_ICONE =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-40 sm:h-9 sm:w-9";

export function MenuCard({
  titulo,
  densidade,
  onDensidade,
  onOcultar,
  className,
}: {
  titulo: string;
  densidade: DensidadeCard;
  onDensidade: (d: DensidadeCard) => void;
  onOcultar: () => void;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const idMenu = useId();
  const refBotao = useRef<HTMLButtonElement>(null);
  const refMenu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const primeiro = refMenu.current?.querySelector<HTMLElement>("[role=radio][tabindex='0']");
    primeiro?.focus();
    const fora = (e: MouseEvent) => {
      if (!refMenu.current?.contains(e.target as Node) && !refBotao.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Fecha só o menu; o Esc não chega a sair do modo Reorganizar.
        e.preventDefault();
        e.stopPropagation();
        setAberto(false);
        refBotao.current?.focus();
      }
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={refBotao}
        type="button"
        aria-label={`Opções de ${titulo}`}
        title="Opções do card"
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-controls={aberto ? idMenu : undefined}
        onClick={() => setAberto((v) => !v)}
        className={BOTAO_ICONE}
      >
        <Ellipsis aria-hidden className="h-4 w-4" />
      </button>
      {aberto && (
        <div
          ref={refMenu}
          id={idMenu}
          role="group"
          aria-label={`Opções de ${titulo}`}
          className="animate-tela-abrindo absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl bg-popover p-4 text-popover-foreground shadow-float ring-1 ring-border"
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Densidade deste card</p>
          <Pills
            className="mt-2"
            tamanho="sm"
            rotulo={`Densidade de ${titulo}`}
            valor={densidade}
            onChange={onDensidade}
            opcoes={[
              { id: "seguir", label: "Seguir a mesa" },
              { id: "compacto", label: "Compacto" },
              { id: "tudo", label: "Mostrar tudo" },
            ]}
          />
          <div className="my-3 h-px bg-border" />
          <button
            type="button"
            onClick={() => {
              setAberto(false);
              onOcultar();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <EyeOff aria-hidden className="h-4 w-4 text-muted-foreground" /> Ocultar card
            <span className="ml-auto text-[11px] text-muted-foreground">vai para a gaveta</span>
          </button>
        </div>
      )}
    </div>
  );
}
