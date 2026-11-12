// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: design.md "Preço visível (Requirement 10)" e das telas desta pasta, escrito em 2026-11-12; sem importar de outras lojas.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 10).
//
// Único ponto de decisão do texto de preço. Estoque: "R$ X,XX por unidade". Personalizável: "Valor avaliado conforme a quantidade"
// até o orçamento ser aceito; depois, "R$ X,XX por unidade". Linha sem preço nunca mostra "R$ 0,00" nem subtotal.
// Âncora: a linha de subtotal ocupa sempre a mesma altura (min-h-5), com ou sem valor, então o preço não muda a altura do cartão.

import { brl } from "./formato";
import { precoUnitarioLinha, subtotalDaLinha, type LinhaComPreco } from "./regras";
import type { Brinde } from "./tipos";

export const TEXTO_A_AVALIAR = "Valor avaliado conforme a quantidade";

/** Texto do preço unitário a partir de um preço conhecido (ou null = ainda a avaliar). */
export function textoPrecoUnitario(preco: number | null): string {
  return preco === null ? TEXTO_A_AVALIAR : `${brl(preco)} por unidade`;
}

type Props =
  | { modo: "unitario"; brinde: Brinde; destaque?: boolean; className?: string }
  | { modo: "linha"; linha: LinhaComPreco; className?: string };

export function PrecoBrinde(props: Props) {
  if (props.modo === "unitario") {
    const { brinde, destaque, className = "" } = props;
    // Brinde de estoque usa o custo do cadastro; personalizável só tem preço depois do orçamento aceito, na linha do pedido.
    const preco = brinde.tipo === "estoque" ? brinde.custoUnitario : null;
    return (
      <span className={`block font-semibold leading-5 text-foreground ${destaque ? "font-display text-xl text-navy" : "text-sm"} ${className}`}>
        {textoPrecoUnitario(preco)}
      </span>
    );
  }

  const { linha, className = "" } = props;
  const preco = precoUnitarioLinha(linha);
  const subtotal = subtotalDaLinha(linha);
  return (
    <span className={`block tabular-nums ${className}`}>
      <span className="block text-sm font-semibold leading-5 text-foreground">{textoPrecoUnitario(preco)}</span>
      <span className="block min-h-5 text-xs leading-5 text-foreground/80">
        {preco !== null && subtotal !== null ? `${linha.qtd} × ${brl(preco)} = ${brl(subtotal)}` : ""}
      </span>
    </span>
  );
}
