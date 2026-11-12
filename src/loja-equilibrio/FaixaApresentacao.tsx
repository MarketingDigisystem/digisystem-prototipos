// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: referência visual do usuário (vitrine com faixa azul-escura), 2026-11-12; escrito aqui, sem importar de outro protótipo.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Layout da vitrine, Req. 12.5 a 12.8).
//
// Faixa de apresentação, só na vitrine do Diretor. Sem os três quadros numerados e sem "Como funciona" (Req. 12.6).
// Cores fixas (independem do tema) e exportadas para o teste de contraste conferir exatamente o que é usado aqui.
// Estática: os arcos não têm animação; se algum dia houver, só transform/opacity e com motion-reduce:.

/** Fundo da faixa: azul Reflex da marca. */
export const COR_FAIXA_FUNDO = "#36499b";
/** Título principal e demais textos brancos. */
export const COR_FAIXA_TEXTO = "#ffffff";
/** Subtítulo claro (texto pequeno: exige 4,5:1). */
export const COR_FAIXA_SUBTITULO = "#e8ecfb";
/** Etiqueta em caixa alta (texto pequeno: exige 4,5:1). */
export const COR_FAIXA_ETIQUETA = "#ffb88f";
/** "para perto." no título (texto grande: exige 3:1). O laranja puro #ff6d2d dá ~2,9:1 e não passa. */
export const COR_FAIXA_DESTAQUE = "#ff7a3d";

/** Razões mínimas WCAG AA: 4,5:1 para texto pequeno e 3:1 para texto grande (título em negrito acima de 24 px). */
export const CONTRASTE_MINIMO_TEXTO_PEQUENO = 4.5;
export const CONTRASTE_MINIMO_TEXTO_GRANDE = 3;

export function FaixaApresentacao() {
  return (
    <section aria-label="Apresentação da Digi Store" className="relative overflow-hidden" style={{ backgroundColor: COR_FAIXA_FUNDO }}>
      {/* Arcos finos decorativos à direita, cortados pela borda da faixa. */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 520 320"
        preserveAspectRatio="xMaxYMid slice"
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[520px] sm:block"
      >
        <g fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5">
          <circle cx="470" cy="160" r="120" />
          <circle cx="470" cy="160" r="190" strokeOpacity="0.11" />
          <circle cx="470" cy="160" r="260" strokeOpacity="0.08" />
          <circle cx="470" cy="160" r="330" strokeOpacity="0.06" />
        </g>
      </svg>
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: COR_FAIXA_ETIQUETA }}>
          DIGI STORE · BRINDES DIGISYSTEM
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight lg:text-4xl" style={{ color: COR_FAIXA_TEXTO }}>
          Brindes que levam a marca{" "}
          <span className="whitespace-nowrap" style={{ color: COR_FAIXA_DESTAQUE }}>
            para perto.
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-sm sm:text-base" style={{ color: COR_FAIXA_SUBTITULO }}>
          Escolha os itens, monte o carrinho e acompanhe cada solicitação em Pedidos.
        </p>
      </div>
    </section>
  );
}
