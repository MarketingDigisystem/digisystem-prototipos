/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: .kiro/specs/loja-digi-store-brindes/design.md (maquina-pedido.ts, D11) e
 *   requirements.md Requisito 8 (diagrama + tabela de transições). Escrito do zero.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import type { AcaoPedido, AtorPedido, EstadoPedido, EtapaLinhaDoTempo } from "./tipos";

export interface TransicaoDef {
  de: EstadoPedido;
  para: EstadoPedido;
  acao: AcaoPedido;
  quem: ("equipe" | "solicitante")[];
  exigeMotivo: boolean;
}

export const TRANSICOES: readonly TransicaoDef[] = [
  { de: "solicitada", para: "em_alinhamento", acao: "assumir", quem: ["equipe"], exigeMotivo: false },
  { de: "solicitada", para: "recusada", acao: "recusar", quem: ["equipe"], exigeMotivo: true },
  { de: "solicitada", para: "cancelada", acao: "cancelar", quem: ["equipe", "solicitante"], exigeMotivo: true },
  { de: "em_alinhamento", para: "pronto_para_retirada", acao: "marcar_pronto", quem: ["equipe"], exigeMotivo: false },
  { de: "em_alinhamento", para: "recusada", acao: "recusar", quem: ["equipe"], exigeMotivo: true },
  { de: "em_alinhamento", para: "cancelada", acao: "cancelar", quem: ["equipe", "solicitante"], exigeMotivo: true },
  { de: "pronto_para_retirada", para: "encerrada", acao: "encerrar", quem: ["equipe"], exigeMotivo: false },
  { de: "pronto_para_retirada", para: "cancelada", acao: "cancelar", quem: ["equipe", "solicitante"], exigeMotivo: true },
];

export interface EntradaTransicao {
  estado: EstadoPedido;
  acao: AcaoPedido;
  ator: AtorPedido;
  motivo?: string;
  todasLinhasProntas: boolean;
  temOrcamentoAceito: boolean;
}

export type ResultadoTransicao = { ok: true; para: EstadoPedido } | { ok: false; motivo: string };

export function avaliarTransicao(e: EntradaTransicao): ResultadoTransicao {
  const def = TRANSICOES.find((t) => t.de === e.estado && t.acao === e.acao);
  if (!def) return { ok: false, motivo: "O estado atual do pedido não permite esta ação." };
  if (e.ator === "outro" || !def.quem.includes(e.ator)) {
    return { ok: false, motivo: "Você não tem permissão para esta ação." };
  }
  if (e.acao === "cancelar" && e.ator === "solicitante" && e.temOrcamentoAceito) {
    return { ok: false, motivo: "Há orçamento aceito. O cancelamento fica com o Marketing." };
  }
  if (def.exigeMotivo && !(e.motivo ?? "").trim()) {
    return { ok: false, motivo: "Informe o motivo." };
  }
  if (e.acao === "marcar_pronto" && !e.todasLinhasProntas) {
    return { ok: false, motivo: "Ainda há brindes que não estão prontos." };
  }
  return { ok: true, para: def.para };
}

export function etapaDaLinhaDoTempo(e: EstadoPedido): {
  etapa: EtapaLinhaDoTempo;
  desvio?: "recusada" | "cancelada";
} {
  if (e === "recusada") return { etapa: "encerrada", desvio: "recusada" };
  if (e === "cancelada") return { etapa: "encerrada", desvio: "cancelada" };
  return { etapa: e };
}

export function acoesPermitidas(
  e: EstadoPedido,
  ator: "equipe" | "solicitante",
  ctx: { temOrcamentoAceito: boolean },
): AcaoPedido[] {
  return TRANSICOES.filter((t) => t.de === e && t.quem.includes(ator))
    .filter((t) => !(t.acao === "cancelar" && ator === "solicitante" && ctx.temOrcamentoAceito))
    .map((t) => t.acao);
}

export const ROTULO_ESTADO: Record<EstadoPedido, string> = {
  solicitada: "Solicitada",
  em_alinhamento: "Em alinhamento",
  pronto_para_retirada: "Pronto para retirada",
  encerrada: "Encerrada",
  recusada: "Recusada",
  cancelada: "Cancelada",
};

export const ETAPAS: { etapa: EtapaLinhaDoTempo; rotulo: string; frase: string }[] = [
  { etapa: "solicitada", rotulo: "Solicitada", frase: "Recebemos o seu pedido e reservamos os brindes." },
  { etapa: "em_alinhamento", rotulo: "Em alinhamento", frase: "O Marketing separa o estoque ou providencia a personalização." },
  { etapa: "pronto_para_retirada", rotulo: "Pronto para retirada", frase: "Você recebe um aviso para retirar com o Marketing." },
  { etapa: "encerrada", rotulo: "Encerrada", frase: "A retirada foi registrada." },
];
