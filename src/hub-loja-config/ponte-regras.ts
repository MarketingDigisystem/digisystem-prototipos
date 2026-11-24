// PROTÓTIPO DESCARTÁVEL — não é o app. Regras puras da aba Ponte (traduz códigos para português; nunca mostra segredo, URL nem corpo de evento).
// Gerado de: src/hub/pages/loja/ponte-loja.ts, usePonteLoja.ts e AbaPonte.tsx @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import type { Divergencia, EventoFila, TipoEvento } from "./dados";
import {
  T_PONTE_CONFIRMA_DESLIGAR,
  T_PONTE_CONFIRMA_DISPONIBILIDADE,
  T_PONTE_CONFIRMA_LIGAR,
  T_PONTE_CONFIRMA_RECONCILIAR,
  T_PONTE_FALHA,
  textoConfirmaReenviarEvento,
  textoConfirmaSnapshot,
} from "./textos";

export type Tom = "sucesso" | "erro" | "info";
export interface Mensagem {
  tom: Tom;
  texto: string;
}

const ROTULO_TIPO: Readonly<Record<string, string>> = {
  "pedido.estado": "Estado do pedido",
  "catalogo.sincronizado": "Catálogo de brindes",
  "autorizado.sincronizado": "Pessoas autorizadas",
  "sugestao.decidida": "Decisão de sugestão",
  "disponibilidade.sincronizada": "Disponibilidade dos brindes",
};
export const rotuloTipoEvento = (tipo: string): string => ROTULO_TIPO[tipo] ?? "Outro evento";
export const TIPOS_EVENTO: readonly TipoEvento[] = [
  "pedido.estado",
  "catalogo.sincronizado",
  "autorizado.sincronizado",
  "sugestao.decidida",
  "disponibilidade.sincronizada",
];

export const ROTULO_ESTADO_FILA: Readonly<Record<string, string>> = {
  pendente: "Aguardando envio",
  enviado: "Enviado",
  falhou: "Falhou",
};

/** Rótulos de Fase pelo id do motor (src/lib/loja/regras.ts). */
const ROTULO_ESTADO_PEDIDO: Readonly<Record<string, string>> = {
  aguardando: "Aguardando atendimento",
  em_separacao: "Em separação",
  pronto_entrega: "Pronto para entrega",
  pronto_retirada: "Pronto para retirada",
  entregue: "Entregue",
  recusada: "Recusado",
  cancelada: "Cancelado",
};
export const rotuloEstadoPedido = (estado: string): string => ROTULO_ESTADO_PEDIDO[estado] ?? "Estado desconhecido";

/** Motivo curto vindo do servidor (`http_503`, `falha_de_rede`...) em frase. */
export function textoMotivo(motivo: string | null | undefined): string {
  if (!motivo) return "";
  if (/^http_5\d\d$/.test(motivo)) return "A Loja não respondeu como esperado (erro do lado da Loja).";
  if (/^http_4\d\d$/.test(motivo)) return "A Loja recusou o envio (confira a configuração da ponte).";
  switch (motivo) {
    case "falha_de_rede":
      return "Não foi possível alcançar a Loja (falha de rede).";
    case "url_nao_configurada":
      return "O endereço da Loja ainda não foi configurado.";
    case "segredo_ausente":
      return "O segredo da ponte não está configurado neste ambiente.";
    case "tipo_sem_rota":
      return "Este tipo de evento não tem destino na Loja.";
    case "nao_configurada":
      return "A ponte ainda não está configurada (endereço ou segredo ausente).";
    case "ponte_desativada":
      return "A ponte está desligada.";
    case "pedido_inexistente":
      return "O pedido não existe mais no Hub.";
    default:
      return "Ocorreu um erro no envio.";
  }
}

export type ResultadoReenvio = "enviado" | "falhou_agora" | "esgotado" | "ponte_desativada" | "ausente";

/** Mensagem do botão "Reenviar" a partir do resultado do envio. */
export function mensagemReenvio(resultado: string): Mensagem {
  switch (resultado) {
    case "enviado":
      return { tom: "sucesso", texto: "Evento reenviado e recebido pela Loja." };
    case "falhou_agora":
      return { tom: "erro", texto: "O reenvio falhou. O evento continua na fila e será tentado de novo." };
    case "esgotado":
      return { tom: "erro", texto: "O reenvio falhou e o evento esgotou as tentativas." };
    case "ponte_desativada":
      return { tom: "info", texto: "A ponte está desligada. Ligue-a para reenviar." };
    case "sem_destino":
      return { tom: "erro", texto: "Não foi possível enviar: a ponte não está totalmente configurada." };
    case "ausente":
      return { tom: "info", texto: "Este evento já foi enviado ou não está mais na fila." };
    default:
      return { tom: "erro", texto: "Não foi possível reenviar agora. Tente novamente em instantes." };
  }
}

export function mensagemReconciliacao(total: number): Mensagem {
  return total === 0
    ? { tom: "sucesso", texto: "Tudo em dia: nenhum pedido diverge entre o Hub e a Loja." }
    : { tom: "info", texto: total === 1 ? "Foi encontrado 1 pedido divergente." : `Foram encontrados ${total} pedidos divergentes.` };
}

/** Lado de uma divergência em texto curto: "Em separação (versão 3)" ou "não existe". */
export function textoLado(l: { versao: number; estado: string } | null): string {
  return l ? `${rotuloEstadoPedido(l.estado)} (versão ${l.versao})` : "não existe";
}
/** Reenviar snapshot só faz sentido quando o Hub tem o pedido. */
export const podeReenviarSnapshot = (d: Pick<Divergencia, "hub">): boolean => d.hub !== null;
/** Identificador curto do pedido para leitura (8 primeiros caracteres). */
export const idCurto = (id: string): string => id.slice(0, 8);

/** "24/11/2026 14:35" (ISO local sem fuso, igual em qualquer máquina). */
export function formatarDataHora(iso: string | null): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!m) return "—";
  return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`;
}

/* ---------------- Texto das confirmações ---------------- */
export type ConfirmacaoPonte =
  | { tipo: "interruptor"; ativa: boolean }
  | { tipo: "reenviar"; eventId: string; rotulo: string }
  | { tipo: "snapshot"; pedidoId: string }
  | { tipo: "disponibilidade" }
  | { tipo: "reconciliar" };

export function textoConfirmacaoPonte(c: ConfirmacaoPonte): string {
  switch (c.tipo) {
    case "interruptor":
      return c.ativa ? T_PONTE_CONFIRMA_LIGAR : T_PONTE_CONFIRMA_DESLIGAR;
    case "reenviar":
      return textoConfirmaReenviarEvento(c.rotulo);
    case "snapshot":
      return textoConfirmaSnapshot(idCurto(c.pedidoId));
    case "disponibilidade":
      return T_PONTE_CONFIRMA_DISPONIBILIDADE;
    case "reconciliar":
      return T_PONTE_CONFIRMA_RECONCILIAR;
  }
}

/* ---------------- Simulação determinística ---------------- */
const SOMA = (s: string): number => [...s].reduce((a, ch) => a + ch.charCodeAt(0), 0);

/**
 * Resultado do "Reenviar" de um evento, sorteado de forma determinística pelo id (repetível na verificação).
 * Soma dos códigos do id, módulo 4: 0 e 1 enviam, 2 falha de novo, 3 esgota as tentativas.
 * Com a ponte desligada, nada é enviado.
 */
export function resultadoReenvio(eventId: string, ponteLigada: boolean): ResultadoReenvio {
  if (!ponteLigada) return "ponte_desativada";
  const r = SOMA(eventId) % 4;
  return r <= 1 ? "enviado" : r === 2 ? "falhou_agora" : "esgotado";
}

export const MAX_TENTATIVAS = 5;

/** Aplica o resultado do reenvio na fila. `enviado` sai da fila (e conta em "Enviados"). Não muta a entrada. */
export function aplicarReenvio(
  fila: readonly EventoFila[],
  eventId: string,
  resultado: ResultadoReenvio,
): { fila: EventoFila[]; enviou: boolean } {
  const existe = fila.some((e) => e.id === eventId);
  if (!existe) return { fila: [...fila], enviou: false };
  if (resultado === "enviado") return { fila: fila.filter((e) => e.id !== eventId), enviou: true };
  if (resultado === "falhou_agora") {
    return { fila: fila.map((e) => (e.id === eventId ? { ...e, estado: "falhou" as const, tentativas: e.tentativas + 1, proximaTentativa: null } : e)), enviou: false };
  }
  if (resultado === "esgotado") {
    return { fila: fila.map((e) => (e.id === eventId ? { ...e, estado: "falhou" as const, tentativas: MAX_TENTATIVAS, proximaTentativa: null } : e)), enviou: false };
  }
  return { fila: [...fila], enviou: false };
}

export type FiltroFila = "todos" | "aguardando" | "falharam";
export const ROTULO_FILTRO_FILA: Readonly<Record<FiltroFila, string>> = { todos: "Todos", aguardando: "Aguardando", falharam: "Falharam" };

/** PROPOSTA NOVA: filtro da fila. */
export function filtrarFila(fila: readonly EventoFila[], filtro: FiltroFila): EventoFila[] {
  if (filtro === "aguardando") return fila.filter((e) => e.estado === "pendente");
  if (filtro === "falharam") return fila.filter((e) => e.estado === "falhou");
  return [...fila];
}

/** Contadores do cartão de estado: Aguardando e Falharam vêm da fila; Enviados é o acumulado. */
export function contadoresFila(fila: readonly EventoFila[], enviados: number): { pendente: number; enviado: number; falhou: number } {
  return {
    pendente: fila.filter((e) => e.estado === "pendente").length,
    enviado: enviados,
    falhou: fila.filter((e) => e.estado === "falhou").length,
  };
}

/** Reconciliar: devolve as divergências reais ainda abertas (mesma lista até alguém resolver). */
export function reconciliar(reais: readonly Divergencia[]): { divergencias: Divergencia[]; mensagem: Mensagem } {
  const divergencias = reais.map((d) => ({ ...d }));
  return { divergencias, mensagem: mensagemReconciliacao(divergencias.length) };
}

/** "Reenviar snapshot" numa linha: o pedido some das divergências reais e da lista exibida. Sem Hub, não resolve. */
export function resolverDivergencia(
  reais: readonly Divergencia[],
  pedidoId: string,
): { reais: Divergencia[]; resolveu: boolean } {
  const alvo = reais.find((d) => d.pedidoId === pedidoId);
  if (!alvo || !podeReenviarSnapshot(alvo)) return { reais: [...reais], resolveu: false };
  return { reais: reais.filter((d) => d.pedidoId !== pedidoId), resolveu: true };
}

export const MSG_FALHA_PONTE: Mensagem = { tom: "erro", texto: T_PONTE_FALHA };
