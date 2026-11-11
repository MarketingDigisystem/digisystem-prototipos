/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/pages/resultados/Redes.tsx e rede/PaginaRede.tsx @ leitura 2026-11-11 (commit 83755ae).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 *
 * Imagem com fallback de marca (gradiente azul/apoio + silhueta discreta), nunca bloco cinza.
 */
import { useState } from "react";

export function ImagemMarca({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [falhou, setFalhou] = useState(false);
  if (falhou) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-[#36499b] to-[#67cfee] ${className}`}
      >
        <svg viewBox="0 0 24 24" className="h-1/3 w-1/3 text-white/60" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
        </svg>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFalhou(true)} className={`object-cover ${className}`} />;
}
