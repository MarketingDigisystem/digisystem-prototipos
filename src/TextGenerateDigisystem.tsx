// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Efeito "texto sendo gerado" inspirado no TextGenerateEffect (Aceternity UI),
// reescrito SEM Framer Motion — só CSS (.tg-word + --i em styles.css) — para
// alinhar com a stack de animações do Hub. Aplicado à identidade Digisystem
// (fonte Dosis, azul reflex + laranja de acento).

import { useMemo } from "react";
import { cn } from "./lib/utils";

/**
 * Revela o texto palavra a palavra (fade + blur), via CSS.
 * - `palavrasAcento`: quantas palavras finais recebem a cor de acento (laranja).
 * - `remontarKey`: mude este valor para "re-tocar" a animação (ex.: nova análise).
 */
export function TextGenerateDigisystem({
  texto,
  className,
  acentoUltimasN = 0,
  remontarKey,
}: {
  texto: string;
  className?: string;
  acentoUltimasN?: number;
  remontarKey?: string | number;
}) {
  const palavras = useMemo(() => (texto ?? "").trim().split(/\s+/).filter(Boolean), [texto]);
  const inicioAcento = palavras.length - acentoUltimasN;

  return (
    <p key={remontarKey} className={cn("leading-snug", className)}>
      {palavras.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="tg-word"
          style={
            {
              ["--i" as string]: i,
              ...(i >= inicioAcento ? { color: "var(--accent)" } : null),
            } as React.CSSProperties
          }
        >
          {w}
          {i < palavras.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </p>
  );
}
