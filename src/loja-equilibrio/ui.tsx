// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/ e loja-brindes/ (cartões, selos, fallback de foto), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Peças visuais reutilizáveis: foto do brinde com placeholder de marca e selos.

import { useState } from "react";
import { Package } from "lucide-react";

/**
 * Foto real do brinde em fundo claro, sem cortar (object-contain).
 * Se a imagem falhar, entra um placeholder elegante da marca (gradiente navy/sky + silhueta discreta), nunca um bloco vazio.
 */
export function FotoBrinde({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [falhou, setFalhou] = useState(false);
  return (
    <div className={`relative aspect-square w-full overflow-hidden bg-white ${className}`}>
      {falhou ? (
        <div
          role="img"
          aria-label={alt}
          className="grid size-full place-items-center bg-gradient-to-br from-navy to-sky"
        >
          <Package className="size-1/4 text-white/70" strokeWidth={1.25} aria-hidden />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFalhou(true)}
          className="size-full object-contain p-3"
        />
      )}
    </div>
  );
}

/** Selo informativo. "Últimas unidades" usa laranja com texto escuro; "Novidade" usa o apoio azul. */
export function Selo({ tipo }: { tipo: "novidade" | "ultimas" }) {
  const estilo = tipo === "novidade" ? "bg-sky-soft text-navy ring-1 ring-sky" : "bg-accent text-foreground";
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 font-display text-xs font-bold ${estilo}`}>
      {tipo === "novidade" ? "Novidade" : "Últimas unidades"}
    </span>
  );
}
