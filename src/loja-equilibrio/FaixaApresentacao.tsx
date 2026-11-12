// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: referência visual do usuário (vitrine com faixa azul-escura), 2026-11-12; escrito aqui, sem importar de outro protótipo.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Layout da vitrine, Req. 12.5 a 12.8).
//
// Faixa de apresentação, só na vitrine do Diretor. Sem os três quadros numerados e sem "Como funciona" (Req. 12.6).
// Cores fixas (independem do tema) e exportadas para o teste de contraste conferir exatamente o que é usado aqui.
// Estática: o degradê não tem animação; se algum dia houver, só transform/opacity e com motion-reduce:.

/** Fundo da faixa no centro (ponto mais claro do degradê): azul Reflex da marca. */
export const COR_FAIXA_FUNDO = "#36499b";
/** Cor das quatro pontas (ponto mais escuro do degradê). */
export const COR_FAIXA_CANTO = "#17234f";
/** Título principal e demais textos brancos. */
export const COR_FAIXA_TEXTO = "#ffffff";
/** Subtítulo claro (texto pequeno: exige 4,5:1). */
export const COR_FAIXA_SUBTITULO = "#e8ecfb";
/** Etiqueta em caixa alta (texto pequeno: exige 4,5:1). */
export const COR_FAIXA_ETIQUETA = "#ffb88f";
/** "para perto." no título (texto grande: exige 3:1). O laranja puro #ff6d2d dá ~2,9:1 e não passa. */
export const COR_FAIXA_DESTAQUE = "#ff7a3d";

/** Razões mínimas WCAG AA: 4,5:1 para texto pequeno e 3:1 para texto grande (título acima de 24 px). */
export const CONTRASTE_MINIMO_TEXTO_PEQUENO = 4.5;
export const CONTRASTE_MINIMO_TEXTO_GRANDE = 3;

/** Mesma cor do canto, transparente (evita franja cinza na transição). */
const CANTO_TRANSPARENTE = `${COR_FAIXA_CANTO}00`;
/** Stops intermediários (opacidade 70%, 38% e 12%) para a transição ficar fluida e sem banding. */
const CANTO_70 = `${COR_FAIXA_CANTO}b3`;
const CANTO_38 = `${COR_FAIXA_CANTO}61`;
const CANTO_12 = `${COR_FAIXA_CANTO}1f`;

/** Tamanho explícito de cada radial: sem ele o padrão (farthest-corner) cobre a faixa toda e escurece o miolo. */
const TAMANHO_PONTA = "ellipse 28% 55%";

/** Um radial por ponta sobre a base azul; o miolo e a região do texto ficam no azul da marca (a transição termina no limite do raio). */
function pontaDoDegrade(posicao: string): string {
  return `radial-gradient(${TAMANHO_PONTA} at ${posicao}, ${COR_FAIXA_CANTO} 0%, ${CANTO_70} 20%, ${CANTO_38} 50%, ${CANTO_12} 78%, ${CANTO_TRANSPARENTE} 100%)`;
}

const FUNDO_DEGRADE = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"].map(pontaDoDegrade).join(", ");

export function FaixaApresentacao() {
  return (
    <section
      aria-label="Apresentação da Digi Store"
      className="relative overflow-hidden"
      style={{ backgroundColor: COR_FAIXA_FUNDO, backgroundImage: FUNDO_DEGRADE }}
    >
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: COR_FAIXA_ETIQUETA }}>
          DIGI STORE · BRINDES DIGISYSTEM
        </p>
        <h1 className="mt-3 font-display text-3xl font-light leading-tight lg:text-4xl" style={{ color: COR_FAIXA_TEXTO }}>
          Brindes que levam a marca{" "}
          <span className="whitespace-nowrap font-semibold" style={{ color: COR_FAIXA_DESTAQUE }}>
            para perto.
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-sm font-light sm:text-base" style={{ color: COR_FAIXA_SUBTITULO }}>
          Escolha os itens, monte o carrinho e acompanhe cada solicitação em Pedidos.
        </p>
      </div>
    </section>
  );
}
