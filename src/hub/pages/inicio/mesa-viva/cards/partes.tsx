/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Pedaços repetidos dos cards da mesa.
 */
import { useState, type ReactNode } from "react";
import { cn } from "../../../../../lib/utils";
import { diaDe } from "../../../../store/regras";
import { diasEntre } from "../../../../components/PedidoDialog";

export function haQuanto(instante: string, hoje: string) {
  const n = diasEntre(diaDe(instante), hoje);
  if (n <= 0) return "hoje";
  if (n === 1) return "ontem";
  return `há ${n} dias`;
}

export const primeiroNome = (nome?: string) => nome?.split(" ")[0] ?? "";

/** Miniatura do post que aparece com fade quando a imagem carrega. */
export function Miniatura({ src, className }: { src: string; className?: string }) {
  const [carregou, setCarregou] = useState(false);
  return (
    <img
      src={src}
      alt=""
      onLoad={() => setCarregou(true)}
      data-carregou={carregou}
      className={cn("mmv-mini h-11 w-11 shrink-0 rounded-xl object-cover", className)}
    />
  );
}

/** Linha clicável das listas curtas, com a barrinha laranja no hover (do real). */
export function LinhaLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "group/l relative -mx-2 flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-200 hover:bg-secondary/60 focus-visible:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {children}
    </a>
  );
}

export const tituloLinha =
  "block truncate font-display text-sm font-bold text-primary transition-colors duration-200 group-hover/l:text-accent";
