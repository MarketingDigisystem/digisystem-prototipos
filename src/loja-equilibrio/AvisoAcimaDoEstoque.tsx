// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Estoque oculto ao diretor e aviso acima do estoque"), escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: design.md (Req. 14 e 15).
//
// Avisos sem número: o diretor nunca vê quanto há em estoque. Nenhum componente aqui recebe valor numérico.
// A região é sempre montada e, quando `reservar` é verdadeiro, tem altura reservada: o aviso aparecer ou sumir
// não move o campo, o botão nem o que vem abaixo (âncora fixa).

import { TEXTO_AVISO_ACIMA_ESTOQUE, TEXTO_AVISO_REPOSICAO } from "./avisos";

interface PropsAviso {
  /** Texto menor (linha do Carrinho): reserva três linhas de 16 px em vez de quatro de 20 px. */
  pequeno?: boolean;
  /** Mostra o texto. A região continua montada, então leitores de tela anunciam a mudança. */
  visivel: boolean;
  /** Reserva a altura de até quatro linhas, mesmo sem texto. */
  reservar?: boolean;
  id?: string;
  className?: string;
}

const ALTURA_RESERVADA = "min-h-[4.5rem] sm:min-h-[3.25rem]";

const ALTURA_RESERVADA_PEQUENA = "min-h-12";

export function AvisoAcimaDoEstoque({ visivel, reservar = true, pequeno = false, id, className = "" }: PropsAviso) {
  const altura = reservar ? (pequeno ? ALTURA_RESERVADA_PEQUENA : ALTURA_RESERVADA) : "";
  return (
    <div id={id} role="status" aria-live="polite" className={`${altura} ${className}`}>
      {visivel && (
        <p className={`le-msg font-semibold text-foreground/85 ${pequeno ? "text-xs leading-4" : "text-sm leading-5"}`}>{TEXTO_AVISO_ACIMA_ESTOQUE}</p>
      )}
    </div>
  );
}

/** Aviso de pedido que aguarda reposição. Renderiza nada quando não visível (sem espaço reservado). */
export function AvisoDeReposicao({ visivel, compacto = false, className = "" }: Pick<PropsAviso, "visivel" | "className"> & { compacto?: boolean }) {
  if (!visivel) return null;
  // Dentro de um botão (linha da lista) só vale conteúdo de fraseado: span em bloco e sem role.
  if (compacto) return <span className={`block text-xs font-semibold leading-4 text-foreground/85 ${className}`}>{TEXTO_AVISO_REPOSICAO}</span>;
  return (
    <p role="status" className={`rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-foreground/85 ${className}`}>
      {TEXTO_AVISO_REPOSICAO}
    </p>
  );
}
