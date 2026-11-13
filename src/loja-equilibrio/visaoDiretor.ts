// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Estoque oculto ao diretor"), escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: design.md (Req. 14).
//
// Única fonte do que o diretor vê de um brinde. Lê o saldo só para calcular o booleano `acimaDoEstoque`
// (via validarLinha) e nunca devolve número de estoque.

import { brl } from "./formato";
import { selosDoDiretor, validarLinha } from "./regras";
import type { Brinde, Pedido } from "./tipos";

export const TEXTO_A_AVALIAR_DIRETOR = "Valor avaliado conforme a quantidade";

export interface VisaoDoBrindeParaDiretor {
  selos: { novidade: boolean };
  preco: string;
  acimaDoEstoque: boolean;
}

/** O pedido ainda tem parte aguardando reposição e segue em Recebido ou Em preparação (Req. 15.15). Sem número. */
export function aguardaReposicao(p: Pick<Pedido, "estado" | "acimaDoEstoque">): boolean {
  return p.acimaDoEstoque && (p.estado === "solicitada" || p.estado === "em_alinhamento");
}

export function visaoDoBrindeParaDiretor(b: Brinde, qtd = 1): VisaoDoBrindeParaDiretor {
  const preco = b.tipo === "estoque" && b.custoUnitario !== null ? `${brl(b.custoUnitario)} por unidade` : TEXTO_A_AVALIAR_DIRETOR;
  return {
    selos: selosDoDiretor(b),
    preco,
    acimaDoEstoque: validarLinha(b, qtd).acimaDoEstoque,
  };
}
