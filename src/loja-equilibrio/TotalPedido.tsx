// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: design.md "Preço visível (Requirement 10)" e das telas desta pasta, escrito em 2026-11-12; sem importar de outras lojas.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 10.5 e 10.6).
//
// Bloco de total: "Total" com o valor em reais; "Mais itens a avaliar" quando há linha sem preço (fora da soma);
// "a avaliar" no lugar de "R$ 0,00" quando só há linhas sem preço. A faixa do aviso tem altura reservada (o botão abaixo não se move).

import { brl } from "./formato";

/** Texto do total: nunca "R$ 0,00" quando só há linhas sem preço. */
export function textoTotal(total: number, aAvaliar: number): string {
  return total === 0 && aAvaliar > 0 ? "a avaliar" : brl(total);
}

interface Props {
  total: number;
  aAvaliar: number;
  rotulo?: string;
  /** Classes do contêiner da linha do total (cada tela mantém o seu cartão). */
  className?: string;
}

export function TotalPedido({ total, aAvaliar, rotulo = "Total", className = "" }: Props) {
  return (
    <div>
      <div className={`flex items-baseline justify-between gap-3 ${className}`}>
        <span className="font-display text-sm font-bold text-navy">{rotulo}</span>
        <span className="font-display text-lg font-bold text-navy tabular-nums">{textoTotal(total, aAvaliar)}</span>
      </div>
      <p className="min-h-5 pt-1 text-xs font-semibold text-foreground/80">{aAvaliar > 0 && total > 0 ? "Mais itens a avaliar" : ""}</p>
    </div>
  );
}
