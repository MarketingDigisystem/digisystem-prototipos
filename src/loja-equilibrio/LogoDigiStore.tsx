// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: public/digistore/ (logo-colorido, logo-negativo, logo-branco 800x156), conferido em 2026-11-12; escrito aqui, sem importar de outro protótipo.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Logo exclusivo da Digi Store, Req. 9).
//
// A caixa externa tem altura e largura fixas nos dois breakpoints (32 x 164 px abaixo de lg, 36 x 185 px a partir de lg),
// então a falha do logo (troca por texto) e o carregamento tardio não movem os controles vizinhos.

import { useState } from "react";
import { urlDoAsset } from "./formato";

export type VarianteLogo = "colorido" | "negativo" | "branco";

/** Colorido para fundo claro; negativo e branco para fundo escuro. Nunca recolore nem distorce. */
export function LogoDigiStore({ variante = "colorido" }: { variante?: VarianteLogo }) {
  const [falhou, setFalhou] = useState(false);
  const arquivo = `logo-${variante}.png`;
  return (
    <span className="relative inline-flex h-8 w-[164px] shrink-0 items-center lg:h-9 lg:w-[185px]">
      {falhou ? (
        <span className="font-display text-xl font-bold leading-none text-navy">Digi Store</span>
      ) : (
        <img
          src={urlDoAsset(arquivo, import.meta.env.BASE_URL)}
          alt="Digi Store"
          width={185}
          height={36}
          className="h-full w-full object-contain object-left"
          onError={() => setFalhou(true)}
        />
      )}
    </span>
  );
}
