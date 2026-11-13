// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: regras.ts desta pasta (disponivel, reservarReposicao, mudarEstado), lido em 2026-11-12; reescrito aqui, sem importar de outro protótipo.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Reserva parcial, pendente e telas da gestão) e Req. 15.
//
// Funções puras da gestão para reserva parcial e pendente: textos por linha, motivos de botão desabilitado e filtro.
// Só a gestão importa este arquivo (mostra números de estoque).

import { disponivel } from "../../regras";
import type { Brinde, LinhaPedido, Pedido } from "../../tipos";

export const MOTIVO_SEM_ESTOQUE = "Sem estoque disponível para reservar.";
export const MOTIVO_LINHA_SEM_PENDENTE = "Nada aguarda reposição nesta linha.";
export const MOTIVO_PEDIDO_SEM_PENDENTE = "Nada aguarda reposição neste pedido.";
export const DICA_HA_ESTOQUE = "Há estoque disponível: reserve o que chegou.";
export const MOTIVO_PRONTO_PENDENTE = "Há quantidade aguardando reposição. Reserve o que chegou ou reduza a quantidade.";

/** A reserva só vale em Recebido e Em preparação (Req. 15.6). */
export function estadoPermiteReserva(p: Pedido): boolean {
  return p.estado === "solicitada" || p.estado === "em_alinhamento";
}

export function linhaTemPendente(l: LinhaPedido): boolean {
  return l.tipo === "estoque" && l.qtdPendente > 0;
}

export function pedidoTemPendente(p: Pedido): boolean {
  return p.linhas.some(linhaTemPendente);
}

/** "Pedido 40 · Reservado 25 · Pendente 15". O pendente só aparece quando maior que zero. */
export function textoReservaDaLinha(l: LinhaPedido): string {
  return l.qtdPendente > 0 ? `${textoReservaBase(l)} · Pendente ${l.qtdPendente}` : textoReservaBase(l);
}

/** "Pedido 40 · Reservado 25" (a tela acrescenta o pendente em destaque). */
export function textoReservaBase(l: LinhaPedido): string {
  return `Pedido ${l.qtd} · Reservado ${l.qtdReservada}`;
}

function disponivelDoBrinde(brindes: Brinde[], id: string): number {
  const b = brindes.find((x) => x.id === id);
  return b ? Math.max(0, disponivel(b)) : 0;
}

/** Motivo de o botão da linha estar desabilitado, ou null se pode reservar. */
export function motivoReservaDaLinha(p: Pedido, indice: number, brindes: Brinde[]): string | null {
  const l = p.linhas[indice];
  if (!l || !linhaTemPendente(l)) return MOTIVO_LINHA_SEM_PENDENTE;
  if (disponivelDoBrinde(brindes, l.brindeId) <= 0) return MOTIVO_SEM_ESTOQUE;
  return null;
}

/** Motivo de o botão do pedido estar desabilitado: nada pendente, ou nenhuma linha pendente tem disponível. */
export function motivoReservaDoPedido(p: Pedido, brindes: Brinde[]): string | null {
  const pendentes = p.linhas.filter(linhaTemPendente);
  if (pendentes.length === 0) return MOTIVO_PEDIDO_SEM_PENDENTE;
  if (pendentes.every((l) => disponivelDoBrinde(brindes, l.brindeId) <= 0)) return MOTIVO_SEM_ESTOQUE;
  return null;
}

/** Motivo de "Pronto para retirada" estar bloqueado, ou null. A regra também recusa se for tentado. */
export function motivoProntoBloqueado(p: Pedido): string | null {
  return pedidoTemPendente(p) ? MOTIVO_PRONTO_PENDENTE : null;
}

/** Filtro "Acima do estoque" da Fila. */
export function filtrarAcimaDoEstoque(pedidos: Pedido[], ligado: boolean): Pedido[] {
  return ligado ? pedidos.filter((p) => p.acimaDoEstoque) : pedidos;
}

/** "1 pedido pode receber reserva" / "3 pedidos podem receber reserva". */
export function textoPodemReceberReserva(n: number): string {
  return n === 1 ? "1 pedido pode receber reserva" : `${n} pedidos podem receber reserva`;
}
