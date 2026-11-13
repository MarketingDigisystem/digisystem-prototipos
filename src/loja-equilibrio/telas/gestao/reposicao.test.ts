// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: reposicao.ts e mock.ts desta pasta, escritos em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Reserva parcial, pendente e telas da gestão).
//
// Exemplos das funções puras da gestão para reserva parcial e pendente (tarefa 15.4).

import { describe, expect, it } from "vitest";
import { ESTADO_INICIAL } from "../../mock";
import { metricasDoPeriodo, mudarEstado, pedidosQuePodemReceberReserva, registrarEntrada, reservarReposicao } from "../../regras";
import {
  MOTIVO_LINHA_SEM_PENDENTE,
  MOTIVO_PEDIDO_SEM_PENDENTE,
  MOTIVO_PRONTO_PENDENTE,
  MOTIVO_SEM_ESTOQUE,
  estadoPermiteReserva,
  filtrarAcimaDoEstoque,
  motivoProntoBloqueado,
  motivoReservaDaLinha,
  motivoReservaDoPedido,
  pedidoTemPendente,
  textoPodemReceberReserva,
  textoReservaBase,
  textoReservaDaLinha,
} from "./reposicao";

const base = ESTADO_INICIAL;
const pedido = (e: typeof base, id: string) => e.pedidos.find((p) => p.id === id)!;

describe("reposição na gestão", () => {
  it("texto por linha: pendente só aparece quando maior que zero", () => {
    const l = pedido(base, "P-2006").linhas[0];
    expect(textoReservaBase(l)).toBe("Pedido 50 · Reservado 30");
    expect(textoReservaDaLinha(l)).toBe("Pedido 50 · Reservado 30 · Pendente 20");
    expect(textoReservaDaLinha({ ...l, qtdReservada: 50, qtdPendente: 0 })).toBe("Pedido 50 · Reservado 50");
  });

  it("botão da linha: habilitado com disponível, desabilitado com motivo sem disponível ou sem pendente", () => {
    // P-2006: espiral com disponível 25 e 20 pendentes.
    expect(motivoReservaDaLinha(pedido(base, "P-2006"), 0, base.brindes)).toBeNull();
    // P-2007: caneta azul com saldo zero.
    expect(motivoReservaDaLinha(pedido(base, "P-2007"), 0, base.brindes)).toBe(MOTIVO_SEM_ESTOQUE);
    // Linha sem pendente.
    expect(motivoReservaDaLinha(pedido(base, "P-2005"), 1, base.brindes)).toBe(MOTIVO_LINHA_SEM_PENDENTE);
  });

  it("botão do pedido: mesmas regras, no nível do pedido", () => {
    expect(motivoReservaDoPedido(pedido(base, "P-2006"), base.brindes)).toBeNull();
    expect(motivoReservaDoPedido(pedido(base, "P-2007"), base.brindes)).toBe(MOTIVO_SEM_ESTOQUE);
    expect(motivoReservaDoPedido(pedido(base, "P-2005"), base.brindes)).toBe(MOTIVO_PEDIDO_SEM_PENDENTE);
  });

  it("depois de uma entrada, o botão da caneta azul habilita e a reserva zera o pendente", () => {
    const com = registrarEntrada(base, "caneta-azul-touch", 200, "g1", "reposição");
    expect(pedidosQuePodemReceberReserva(com).map((p) => p.id)).toContain("P-2007");
    expect(motivoReservaDoPedido(pedido(com, "P-2007"), com.brindes)).toBeNull();
    const depois = reservarReposicao(com, "P-2007", 0, "g1");
    const p = pedido(depois, "P-2007");
    expect(p.acimaDoEstoque).toBe(false);
    expect(motivoReservaDoPedido(p, depois.brindes)).toBe(MOTIVO_PEDIDO_SEM_PENDENTE);
    const ev = p.historico.at(-1)!;
    expect(ev.tipo).toBe("reposicao");
    expect(ev.nota).toMatch(/Reservado 150 un\./);
  });

  it("'Pronto para retirada' fica bloqueado com pendente, com a mensagem clara; a regra também recusa", () => {
    const p = pedido(base, "P-2006");
    expect(p.estado).toBe("em_alinhamento");
    expect(pedidoTemPendente(p)).toBe(true);
    expect(motivoProntoBloqueado(p)).toBe(MOTIVO_PRONTO_PENDENTE);
    expect(MOTIVO_PRONTO_PENDENTE).toBe("Há quantidade aguardando reposição. Reserve o que chegou ou reduza a quantidade.");
    expect(() => mudarEstado(base, "P-2006", "pronto", "g1")).toThrow(/Em preparação/);
    expect(motivoProntoBloqueado(pedido(base, "P-2005"))).toBeNull();
  });

  it("a reserva só vale em Recebido e Em preparação", () => {
    expect(estadoPermiteReserva(pedido(base, "P-2006"))).toBe(true);
    expect(estadoPermiteReserva(pedido(base, "P-2007"))).toBe(true);
    expect(base.pedidos.filter((p) => !estadoPermiteReserva(p)).every((p) => !["solicitada", "em_alinhamento"].includes(p.estado))).toBe(true);
  });

  it("filtro 'Acima do estoque' e texto do aviso pós-entrada", () => {
    expect(filtrarAcimaDoEstoque(base.pedidos, false)).toHaveLength(base.pedidos.length);
    expect(filtrarAcimaDoEstoque(base.pedidos, true).map((p) => p.id).sort()).toEqual(["P-2006", "P-2007"]);
    expect(textoPodemReceberReserva(1)).toBe("1 pedido pode receber reserva");
    expect(textoPodemReceberReserva(3)).toBe("3 pedidos podem receber reserva");
  });

  it("métricas da gestão: pedidos acima do estoque e unidades pendentes", () => {
    const m = metricasDoPeriodo(base, "2026-11");
    expect(m.pedidosAcimaDoEstoque).toBe(2);
    expect(m.unidadesPendentes).toBe(170); // 20 do P-2006 + 150 do P-2007
  });
});
