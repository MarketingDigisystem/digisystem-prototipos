/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (CartaoBrinde/GaleriaFotos) + regra de protótipos (imagem sempre, fallback elegante).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { Gift } from "lucide-react";
import { useState } from "react";

/** Foto do brinde. Se o arquivo faltar, cai num fallback da marca (gradiente navy e sky), nunca em quadro cinza. */
export function FotoBrinde({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [falhou, setFalhou] = useState(false);
  // No GitHub Pages o app vive em /digisystem-prototipos/, então "/brindes/x.png" precisa do prefixo da base.
  const base = import.meta.env.BASE_URL;
  const url = src.startsWith("/") ? `${base}${src.slice(1)}` : src;
  if (falhou) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`grid place-items-center bg-gradient-to-br from-navy to-sky ${className}`}
      >
        <Gift className="size-1/4 text-white/70" strokeWidth={1.25} aria-hidden />
      </div>
    );
  }
  return <img src={url} alt={alt} loading="lazy" onError={() => setFalhou(true)} className={`bg-white object-contain ${className}`} />;
}
