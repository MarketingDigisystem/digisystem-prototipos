// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: regras.ts e mock.ts desta pasta, escritos em 2026-11-11.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Exemplos básicos. As propriedades ficam para as tarefas 2.2 a 2.10.

import { describe, expect, it } from "vitest";
import { ROTULO_ESTADO } from "./formato";
import { ESTADO_INICIAL, HOJE } from "./mock";
import {
  aceitarOrcamento, alertasMinimo, criarPedido, dataMinima, disponivel, esgotados, historicoBrinde,
  informarOrcamento, metricasDoPeriodo, mudarEstado, popularidade, registrarAjuste, registrarEntrada,
  ajustarQuantidadeLinha, linhasAcimaDoEstoque, pedidosQuePodemReceberReserva, reconstruirEstoque, reservarReposicao,
  selosDeEstoque, selosDoDiretor, urgencia, validarDataDesejada, validarLinha, valorDoPedido, valorEmEstoque,
} from "./regras";
import { MSG_CIENCIA_OBRIGATORIA } from "./avisos";
import type { Estado } from "./tipos";

const base: Estado = ESTADO_INICIAL;
const brinde = (e: Estado, id: string) => e.brindes.find((b) => b.id === id)!;
const dados = { solicitanteId: "d1", finalidade: "Evento de teste" };

/** Soma saldo, reserva e mínimo dos itens do mock legado de um mesmo brinde (Req. 11.8). Só para teste. */
function migrarBrindeLegado(itens: { saldo: number; reserva: number; minimo: number }[]) {
  return itens.reduce(
    (acc, x) => ({ saldo: acc.saldo + x.saldo, reserva: acc.reserva + x.reserva, minimo: acc.minimo + x.minimo }),
    { saldo: 0, reserva: 0, minimo: 0 },
  );
}

describe("estoque e selos", () => {
  it("o mock respeita saldo >= reserva >= 0 e a conta de cada brinde fecha", () => {
    for (const b of base.brindes) {
      expect(b.reserva).toBeGreaterThanOrEqual(0);
      expect(b.saldo).toBeGreaterThanOrEqual(b.reserva);
      if (b.tipo === "estoque") expect(historicoBrinde(base, b.id).fecha).toBe(true);
      else expect([b.saldo, b.reserva, b.minimo]).toEqual([0, 0, 0]);
    }
  });

  it("pedidos e movimentações do mock identificam o brinde sem campo de item legado", () => {
    for (const p of base.pedidos) {
      for (const l of p.linhas) {
        expect(Object.keys(l).every((k) => ["brindeId", "qtd", "tipo", "qtdReservada", "qtdPendente", "acimaDoEstoque", "custoUnitarioNaHora", "personalizacao", "orcamentoUnitario", "orcamentoAceito", "notaAjuste"].includes(k))).toBe(true);
      }
    }
    for (const m of base.movimentacoes) {
      expect(Object.keys(m).every((k) => ["id", "brindeId", "tipo", "qtd", "quem", "em", "pedidoId", "nota"].includes(k))).toBe(true);
    }
  });

  it("migração do legado soma saldo, reserva e mínimo e mantém o disponível total", () => {
    const itens = [
      { saldo: 120, reserva: 10, minimo: 30 },
      { saldo: 60, reserva: 0, minimo: 20 },
    ];
    const junto = migrarBrindeLegado(itens);
    expect(junto).toEqual({ saldo: 180, reserva: 10, minimo: 50 });
    expect(junto.saldo - junto.reserva).toBe(itens.reduce((s, x) => s + x.saldo - x.reserva, 0));
  });

  it("selos do diretor trazem só a novidade; selos de estoque ficam para a gestão", () => {
    expect(selosDoDiretor(brinde(base, "caderno-espiral-35"))).toEqual({ novidade: true });
    expect(selosDoDiretor(brinde(base, "caneta-azul-touch"))).toEqual({ novidade: false });
    expect(selosDeEstoque(brinde(base, "caderno-bambu")).ultimasUnidades).toBe(false); // saldo 120 − reserva 18 = 102
    expect(selosDeEstoque(brinde(base, "caneta-azul-touch"))).toEqual({ indisponivel: true, ultimasUnidades: false });
    expect(selosDeEstoque(brinde(base, "caderno-espiral-35")).indisponivel).toBe(false);
    expect(selosDeEstoque(brinde(base, "kit-churrasco"))).toEqual({ indisponivel: false, ultimasUnidades: false });
  });

  it("mock: P-2006 e P-2007 acima do estoque; antigos reservados por inteiro; recusado e cancelado 0/0", () => {
    const p = (id: string) => base.pedidos.find((x) => x.id === id)!;
    expect(p("P-2006").linhas[0]).toMatchObject({ qtd: 50, qtdReservada: 30, qtdPendente: 20, acimaDoEstoque: true });
    expect(p("P-2006")).toMatchObject({ acimaDoEstoque: true, cienteAcimaEstoque: true, estado: "em_alinhamento" });
    expect(p("P-2007")).toMatchObject({ estado: "solicitada", acimaDoEstoque: true, cienteAcimaEstoque: true });
    expect(p("P-2007").linhas[0]).toMatchObject({ brindeId: "caneta-azul-touch", qtd: 150, qtdReservada: 0, qtdPendente: 150 });
    expect(p("P-2005").linhas.map((l) => [l.qtdReservada, l.qtdPendente])).toEqual([[0, 0], [8, 0]]);
    for (const x of base.pedidos) {
      for (const l of x.linhas) {
        expect(l.qtdReservada + l.qtdPendente === l.qtd || x.estado === "recusada" || x.estado === "cancelada" || l.tipo === "personalizavel").toBe(true);
        if (x.estado === "recusada" || x.estado === "cancelada") expect([l.qtdReservada, l.qtdPendente, l.acimaDoEstoque]).toEqual([0, 0, false]);
        if (l.tipo === "personalizavel") expect([l.qtdReservada, l.qtdPendente, l.acimaDoEstoque]).toEqual([0, 0, false]);
        if (["pronto", "encerrada"].includes(x.estado) && l.tipo === "estoque") expect(l.qtdReservada).toBe(l.qtd);
      }
      expect(x.acimaDoEstoque).toBe(x.linhas.some((l) => l.qtdPendente > 0));
    }
  });

  it("reconstruirEstoque soma só qtdReservada dos pedidos ativos e a conta fecha (saldo ≥ reserva ≥ 0)", () => {
    const recon = reconstruirEstoque(base.brindes, base.pedidos, base.movimentacoes);
    expect(recon).toEqual(base.brindes);
    for (const b of base.brindes) {
      const soma = base.pedidos
        .filter((x) => ["solicitada", "em_alinhamento", "pronto"].includes(x.estado))
        .flatMap((x) => x.linhas)
        .filter((l) => l.brindeId === b.id)
        .reduce((s, l) => s + l.qtdReservada, 0);
      expect(b.reserva).toBe(soma);
      expect(b.saldo).toBeGreaterThanOrEqual(b.reserva);
      expect(b.reserva).toBeGreaterThanOrEqual(0);
    }
    expect(brinde(base, "caderno-espiral-35").reserva).toBe(45); // 30 do P-2006 + 15 do P-2009; os 20 pendentes não pesam
    expect(brinde(base, "caneta-azul-touch")).toMatchObject({ saldo: 0, reserva: 0 });
  });

  it("alertas de mínimo e esgotados", () => {
    expect(alertasMinimo(base).map((a) => a.brindeId)).toEqual(["caderno-espiral-35"]); // disp 25 < mínimo 40
    expect(esgotados(base).map((a) => a.brindeId)).toEqual(["caneta-azul-touch"]);
  });

  it("o catálogo do mock tem os 7 brindes oficiais, nesta ordem, e o kit churrasco tem segunda foto", () => {
    expect(base.brindes.map((b) => b.id)).toEqual([
      "kit-churrasco", "caderno-bambu", "caneta-azul-touch", "caderno-espiral-35", "caderneta-digisystem", "caderneta-35", "copo-termico",
    ]);
    expect(base.brindes.filter((b) => b.tipo === "personalizavel").map((b) => b.id)).toEqual(["kit-churrasco"]);
    expect(base.brindes.filter((b) => b.fotoExtra).map((b) => b.id)).toEqual(["kit-churrasco"]);
    expect(base.brindes.filter((b) => b.novidade).map((b) => b.id)).toEqual(["caderno-espiral-35", "caderneta-35"]);
    expect(brinde(base, "kit-churrasco").descricao).toMatch(/placa metálica/);
    expect(brinde(base, "kit-churrasco")).toMatchObject({ prazoExtraDiasUteis: 7, opcoesPersonalizacao: ["logo", "nome"] });
    expect(
      ["caderno-bambu", "caneta-azul-touch", "caderno-espiral-35", "caderneta-digisystem", "caderneta-35", "copo-termico"].map((id) => [
        brinde(base, id).saldo, brinde(base, id).reserva, brinde(base, id).minimo,
      ]),
    ).toEqual([[120, 18, 30], [0, 0, 100], [70, 45, 40], [200, 40, 50], [85, 25, 30], [40, 12, 15]]);
  });

  it("valor em estoque soma saldo × custo", () => {
    expect(valorEmEstoque(base)).toBeGreaterThan(0);
  });
});

describe("criarPedido", () => {
  it("reserva a quantidade de estoque e grava o custo na linha", () => {
    const antes = disponivel(brinde(base, "caderno-bambu"));
    const e = criarPedido(base, dados, [{ brindeId: "caderno-bambu", qtd: 4 }], false);
    expect(disponivel(brinde(e, "caderno-bambu"))).toBe(antes - 4);
    const p = e.pedidos[e.pedidos.length - 1];
    expect(p.estado).toBe("solicitada");
    expect(p.areaSolicitante).toBe("Comercial");
    expect(p.linhas[0].custoUnitarioNaHora).toBe(38.9);
    expect(p.linhas[0]).toMatchObject({ qtdReservada: 4, qtdPendente: 0, acimaDoEstoque: false });
    expect(p).toMatchObject({ acimaDoEstoque: false, cienteAcimaEstoque: false });
    expect(base.pedidos.length).toBe(e.pedidos.length - 1); // entrada intacta
  });

  it("quantidade igual ao disponível cabe inteira, sem pendente e sem ciência", () => {
    const e = criarPedido(base, dados, [{ brindeId: "caderno-espiral-35", qtd: 25 }], false);
    expect(e.pedidos.at(-1)!.linhas[0]).toMatchObject({ qtdReservada: 25, qtdPendente: 0, acimaDoEstoque: false });
    expect(disponivel(brinde(e, "caderno-espiral-35"))).toBe(0);
  });

  it("acima do disponível é aceito com ciência: reserva o que há e guarda o resto como pendente", () => {
    const e = criarPedido(base, dados, [{ brindeId: "caderno-espiral-35", qtd: 26 }], true);
    const p = e.pedidos.at(-1)!;
    expect(p.linhas[0]).toMatchObject({ qtd: 26, qtdReservada: 25, qtdPendente: 1, acimaDoEstoque: true });
    expect(p).toMatchObject({ acimaDoEstoque: true, cienteAcimaEstoque: true });
    expect(brinde(e, "caderno-espiral-35").reserva).toBe(70); // saldo 70: reserva no teto, nunca acima
    expect(brinde(e, "caderno-espiral-35").saldo).toBeGreaterThanOrEqual(brinde(e, "caderno-espiral-35").reserva);
  });

  it("acima do disponível sem ciência lança a mensagem e não altera nada", () => {
    expect(() => criarPedido(base, dados, [{ brindeId: "caderno-espiral-35", qtd: 26 }], false)).toThrow(MSG_CIENCIA_OBRIGATORIA);
    expect(MSG_CIENCIA_OBRIGATORIA).toBe("Marque a ciência de que o prazo será maior para enviar este pedido.");
    expect(base.pedidos).toHaveLength(ESTADO_INICIAL.pedidos.length);
    expect(brinde(base, "caderno-espiral-35").reserva).toBe(45);
  });

  it("brinde com disponível zero é aceito com tudo pendente", () => {
    const e = criarPedido(base, dados, [{ brindeId: "caneta-azul-touch", qtd: 10 }], true);
    expect(e.pedidos.at(-1)!.linhas[0]).toMatchObject({ qtdReservada: 0, qtdPendente: 10, acimaDoEstoque: true });
    expect(brinde(e, "caneta-azul-touch").reserva).toBe(0);
  });

  it("duas linhas do mesmo brinde somam na ordem: a segunda pega o que sobrou", () => {
    const e = criarPedido(
      base,
      dados,
      [
        { brindeId: "caderno-espiral-35", qtd: 20 },
        { brindeId: "caderno-espiral-35", qtd: 20 },
      ],
      true,
    );
    const [a, b] = e.pedidos.at(-1)!.linhas;
    expect(a).toMatchObject({ qtdReservada: 20, qtdPendente: 0, acimaDoEstoque: false });
    expect(b).toMatchObject({ qtdReservada: 5, qtdPendente: 15, acimaDoEstoque: true });
    expect(brinde(e, "caderno-espiral-35").reserva).toBe(70);
  });

  it("não reserva linha personalizável, não pede ciência e aceita qualquer inteiro a partir de 1", () => {
    for (const qtd of [1, 49]) {
      const e = criarPedido(base, dados, [{ brindeId: "kit-churrasco", qtd }], false);
      expect(brinde(e, "kit-churrasco").reserva).toBe(0);
      expect(e.pedidos.at(-1)!.linhas[0]).toMatchObject({ qtdReservada: 0, qtdPendente: 0, acimaDoEstoque: false });
    }
  });

  it("quantidade inválida ainda é recusada", () => {
    expect(() => criarPedido(base, dados, [{ brindeId: "caderno-bambu", qtd: 0 }], true)).toThrow(/quantidade inteira/);
  });

  it("finalidade é obrigatória", () => {
    expect(() => criarPedido(base, { ...dados, finalidade: "  " }, [{ brindeId: "caderno-bambu", qtd: 1 }], false)).toThrow(/finalidade/);
  });
});

describe("linhasAcimaDoEstoque e pedidosQuePodemReceberReserva", () => {
  it("avalia contra o disponível de agora, somando linhas do mesmo brinde na ordem", () => {
    const itens = [
      { brindeId: "caderno-espiral-35", qtd: 20 },
      { brindeId: "caderno-bambu", qtd: 5 },
      { brindeId: "caderno-espiral-35", qtd: 20 },
      { brindeId: "kit-churrasco", qtd: 999 },
      { brindeId: "caneta-azul-touch", qtd: 1 },
    ];
    expect(linhasAcimaDoEstoque(base.brindes, itens)).toEqual([2, 4]);
  });

  it("destaca pedidos com pendente só quando há disponível do brinde", () => {
    expect(pedidosQuePodemReceberReserva(base).map((p) => p.id)).toEqual(["P-2006"]); // espiral tem 25 disponíveis; a caneta tem 0
    const com = registrarEntrada(base, "caneta-azul-touch", 200, "g1");
    expect(pedidosQuePodemReceberReserva(com).map((p) => p.id).sort()).toEqual(["P-2006", "P-2007"]);
  });
});

describe("reservarReposicao", () => {
  it("reserva min(pendente, disponível) e registra a operação no histórico", () => {
    // espiral tem 25 disponíveis e o P-2006 tem 20 pendentes: reserva os 20
    const e = reservarReposicao(base, "P-2006", 0, "g1");
    const p = e.pedidos.find((x) => x.id === "P-2006")!;
    expect(p.linhas[0]).toMatchObject({ qtdReservada: 50, qtdPendente: 0, acimaDoEstoque: false });
    expect(p.acimaDoEstoque).toBe(false);
    expect(brinde(e, "caderno-espiral-35").reserva).toBe(65);
    const ev = p.historico.at(-1)!;
    expect(ev).toMatchObject({ tipo: "reposicao", quem: "g1", em: base.agora, estado: "em_alinhamento" });
    expect(ev.nota).toBe("Reservado 20 un. de Caderno espiral 35 anos; pendente restante 0");
  });

  it("reserva só o que há quando o disponível é menor que o pendente", () => {
    const entrada = registrarEntrada(base, "caneta-azul-touch", 40, "g1");
    const e = reservarReposicao(entrada, "P-2007", 0, "g2");
    const l = e.pedidos.find((x) => x.id === "P-2007")!.linhas[0];
    expect(l).toMatchObject({ qtdReservada: 40, qtdPendente: 110, acimaDoEstoque: true });
    expect(e.pedidos.find((x) => x.id === "P-2007")!.acimaDoEstoque).toBe(true);
    expect(brinde(e, "caneta-azul-touch")).toMatchObject({ saldo: 40, reserva: 40 });
  });

  it("sem disponível lança a mensagem e o estado não muda", () => {
    expect(() => reservarReposicao(base, "P-2007", 0, "g1")).toThrow("Não há estoque disponível para reservar.");
    expect(base.pedidos.find((x) => x.id === "P-2007")!.linhas[0].qtdPendente).toBe(150);
  });

  it("só vale em Recebido e Em preparação e em linha com pendente", () => {
    const pronto = mudarEstado(mudarEstado(criarPedido(base, dados, [{ brindeId: "caderno-bambu", qtd: 1 }], false), "P-1001", "em_alinhamento", "g1"), "P-1001", "pronto", "g1");
    expect(() => reservarReposicao(pronto, "P-1001", 0, "g1")).toThrow(/Recebido/);
    expect(() => reservarReposicao(base, "P-2008", 0, "g1")).toThrow(/pendente/);
  });
});

describe("pronto, recusar e cancelar com pendente", () => {
  it("pronto é bloqueado enquanto houver pendente, citando Em preparação, e libera depois de reservar", () => {
    const pend = base.pedidos.find((x) => x.id === "P-2006")!.linhas.reduce((s, l) => s + l.qtdPendente, 0);
    expect(pend).toBeGreaterThan(1);
    expect(() => mudarEstado(base, "P-2006", "pronto", "g1")).toThrow(
      `Não é possível passar o pedido para "Pronto para retirada" com ${pend} unidades pendentes. Reserve o que chegou enquanto o pedido estiver em "Em preparação".`,
    );
    const e = mudarEstado(reservarReposicao(base, "P-2006", 0, "g1"), "P-2006", "pronto", "g1");
    expect(e.pedidos.find((x) => x.id === "P-2006")!.linhas[0].qtdReservada).toBe(50);
  });

  it("recusar libera só o reservado e descarta o pendente", () => {
    const e = mudarEstado(base, "P-2006", "recusada", "g1", "Sem verba");
    const l = e.pedidos.find((x) => x.id === "P-2006")!.linhas[0];
    expect(l).toMatchObject({ qtdReservada: 0, qtdPendente: 0, acimaDoEstoque: false });
    expect(e.pedidos.find((x) => x.id === "P-2006")!.acimaDoEstoque).toBe(false);
    expect(brinde(e, "caderno-espiral-35")).toMatchObject({ saldo: 70, reserva: 15 }); // só os 30 reservados voltaram
  });

  it("cancelar um pedido sem nada reservado não mexe na reserva", () => {
    const e = mudarEstado(base, "P-2007", "cancelada", "g1", "Evento adiado");
    expect(brinde(e, "caneta-azul-touch")).toMatchObject({ saldo: 0, reserva: 0 });
    expect(e.pedidos.find((x) => x.id === "P-2007")!.linhas[0].qtdPendente).toBe(0);
  });

  it("encerrar baixa a quantidade reservada de cada linha", () => {
    const e = mudarEstado(base, "P-2004", "encerrada", "g1");
    expect(brinde(e, "caderneta-35")).toMatchObject({ saldo: 60, reserva: 0 });
    expect(e.movimentacoes.find((m) => m.pedidoId === "P-2004")).toMatchObject({ tipo: "saida", qtd: 25 });
  });
});

describe("ajustarQuantidadeLinha com pendente", () => {
  it("a redução abate primeiro o pendente e só depois o reservado", () => {
    let e = ajustarQuantidadeLinha(base, "P-2006", 0, 40, "g1", "Cortar 10");
    expect(e.pedidos.find((x) => x.id === "P-2006")!.linhas[0]).toMatchObject({ qtd: 40, qtdReservada: 30, qtdPendente: 10, acimaDoEstoque: true });
    expect(brinde(e, "caderno-espiral-35").reserva).toBe(45);
    e = ajustarQuantidadeLinha(e, "P-2006", 0, 25, "g1", "Cortar mais 15");
    expect(e.pedidos.find((x) => x.id === "P-2006")!.linhas[0]).toMatchObject({ qtd: 25, qtdReservada: 25, qtdPendente: 0, acimaDoEstoque: false });
    expect(e.pedidos.find((x) => x.id === "P-2006")!.acimaDoEstoque).toBe(false);
    expect(brinde(e, "caderno-espiral-35").reserva).toBe(40); // 5 reservados liberados
  });

  it("o aumento reserva o possível e soma o resto ao pendente", () => {
    const e = ajustarQuantidadeLinha(base, "P-2008", 0, 40, "g1", "Mais cadernos"); // bambu: tinha 10, disponível 102
    expect(e.pedidos.find((x) => x.id === "P-2008")!.linhas[0]).toMatchObject({ qtd: 40, qtdReservada: 40, qtdPendente: 0 });
    const f = ajustarQuantidadeLinha(base, "P-2009", 0, 45, "g1", "Mais cadernos"); // espiral: tinha 15, disponível 25, pede +30
    expect(f.pedidos.find((x) => x.id === "P-2009")!.linhas[0]).toMatchObject({ qtd: 45, qtdReservada: 40, qtdPendente: 5, acimaDoEstoque: true });
    expect(f.pedidos.find((x) => x.id === "P-2009")!.acimaDoEstoque).toBe(true);
    expect(brinde(f, "caderno-espiral-35").reserva).toBe(70);
  });

  it("recusa nota vazia, quantidade não inteira e redução que zera a linha", () => {
    expect(() => ajustarQuantidadeLinha(base, "P-2006", 0, 40, "g1", " ")).toThrow(/nota/);
    expect(() => ajustarQuantidadeLinha(base, "P-2006", 0, 1.5, "g1", "x")).toThrow(/inteira/);
    expect(() => ajustarQuantidadeLinha(base, "P-2006", 0, 0, "g1", "x")).toThrow(/inteira/);
  });
});

describe("métricas de pedidos acima do estoque (só gestão)", () => {
  it("conta pedidos abertos acima do estoque e as unidades pendentes", () => {
    const m = metricasDoPeriodo(base, "2026-11");
    expect(m.pedidosAcimaDoEstoque).toBe(2); // P-2006 e P-2007
    expect(m.unidadesPendentes).toBe(170); // 20 + 150
    const sem = metricasDoPeriodo(reservarReposicao(base, "P-2006", 0, "g1"), "2026-11");
    expect(sem).toMatchObject({ pedidosAcimaDoEstoque: 1, unidadesPendentes: 150 });
  });
});

describe("data desejada opcional com mínimo", () => {
  it("sem data é aceito; com data antes do mínimo é recusado com sugestão", () => {
    expect(validarDataDesejada(undefined, 0, HOJE).ok).toBe(true);
    const minima = dataMinima(0, HOJE); // 2026-11-11 + 2 úteis = 2026-11-13
    expect(minima).toBe("2026-11-13");
    const r = validarDataDesejada("2026-11-12", 0, HOJE);
    expect(r.ok).toBe(false);
    expect(r.sugestao).toBe(minima);
    expect(validarDataDesejada(minima, 0, HOJE).ok).toBe(true);
  });

  it("prazo extra da personalização soma aos dias úteis", () => {
    expect(dataMinima(7, HOJE)).toBe("2026-11-24");
    expect(() =>
      criarPedido(base, { ...dados, dataDesejada: "2026-11-13" }, [{ brindeId: "kit-churrasco", qtd: 60 }], false),
    ).toThrow(/a partir de 24\/11/);
  });
});

describe("fluxo de estados", () => {
  const comPedido = criarPedido(base, dados, [{ brindeId: "caderno-bambu", qtd: 4 }], false);
  const id = comPedido.pedidos[comPedido.pedidos.length - 1].id;

  it("recusa transição fora do fluxo", () => {
    expect(() => mudarEstado(comPedido, id, "encerrada", "g1")).toThrow(/Não é possível passar o pedido de "Recebido" para "Retirado"/);
  });

  it("recusada e cancelada pedem motivo e liberam a reserva", () => {
    expect(() => mudarEstado(comPedido, id, "recusada", "g1", " ")).toThrow(/motivo/i);
    const e = mudarEstado(comPedido, id, "recusada", "g1", "Sem verba");
    expect(brinde(e, "caderno-bambu").reserva).toBe(brinde(base, "caderno-bambu").reserva);
    expect(brinde(e, "caderno-bambu").saldo).toBe(brinde(base, "caderno-bambu").saldo);
  });

  it("encerrar baixa o saldo, libera a reserva e registra a saída", () => {
    let e = mudarEstado(comPedido, id, "em_alinhamento", "g1");
    e = mudarEstado(e, id, "pronto", "g1");
    e = mudarEstado(e, id, "encerrada", "g1");
    expect(brinde(e, "caderno-bambu").saldo).toBe(brinde(base, "caderno-bambu").saldo - 4);
    expect(brinde(e, "caderno-bambu").reserva).toBe(brinde(base, "caderno-bambu").reserva);
    const saida = e.movimentacoes.find((m) => m.pedidoId === id);
    expect(saida).toMatchObject({ tipo: "saida", qtd: 4, brindeId: "caderno-bambu" });
    expect(historicoBrinde(e, "caderno-bambu").fecha).toBe(true);
  });
});

describe("orçamento da linha personalizável", () => {
  const ini = criarPedido(base, dados, [{ brindeId: "kit-churrasco", qtd: 30 }], false);
  const id = ini.pedidos[ini.pedidos.length - 1].id;
  const alinhado = mudarEstado(ini, id, "em_alinhamento", "g1");

  it("sem orçamento aceito o pedido não vai para pronto e o valor é 'a avaliar'", () => {
    expect(() => mudarEstado(alinhado, id, "pronto", "g1")).toThrow(/orçamento/);
    expect(valorDoPedido(alinhado.pedidos.at(-1)!)).toEqual({ valor: 0, aAvaliar: 1 });
  });

  it("informar e aceitar libera pronto e entra em R$", () => {
    let e = informarOrcamento(alinhado, id, 0, 8, "g1");
    expect(() => mudarEstado(e, id, "pronto", "g1")).toThrow(/orçamento/); // falta aceite
    e = aceitarOrcamento(e, id, 0, "d1");
    expect(valorDoPedido(e.pedidos.at(-1)!)).toEqual({ valor: 240, aAvaliar: 0 });
    expect(mudarEstado(e, id, "pronto", "g1").pedidos.at(-1)!.estado).toBe("pronto");
  });
});

describe("estoque: entrada e ajuste", () => {
  it("entrada soma ao saldo e ajuste exige nota e respeita a reserva", () => {
    const e = registrarEntrada(base, "caderno-bambu", 10, "g1");
    expect(brinde(e, "caderno-bambu").saldo).toBe(brinde(base, "caderno-bambu").saldo + 10);
    expect(() => registrarAjuste(base, "caderno-bambu", -1, "g1", " ")).toThrow(/motivo/);
    // caderno espiral: saldo 70, reserva 45; tirar 26 deixaria o saldo em 44, abaixo do reservado
    expect(() => registrarAjuste(base, "caderno-espiral-35", -26, "g1", "Perda")).toThrow(/reservado/);
    expect(historicoBrinde(registrarAjuste(e, "caderno-bambu", -2, "g1", "Contagem"), "caderno-bambu").fecha).toBe(true);
  });
});

describe("métricas e urgência", () => {
  it("mês calculado soma por solicitante e por área igual ao total", () => {
    const m = metricasDoPeriodo(base, "2026-10");
    expect(m.gasto).toBeCloseTo(60 * 22.5, 2); // P-2010: 60 cadernetas Digisystem
    expect(m.porSolicitante.reduce((s, x) => s + x.valor, 0)).toBeCloseTo(m.gasto, 2);
    expect(m.porArea.reduce((s, x) => s + x.valor, 0)).toBeCloseTo(m.gasto, 2);
    expect(m.gastoMesAnterior).toBe(2840); // setembro fechado, total mock
  });

  it("novembro compara com outubro calculado; prontos e a avaliar", () => {
    const m = metricasDoPeriodo(base, "2026-11");
    expect(m.gasto).toBeCloseTo(300 * 6.4, 2); // P-2001: 300 canetas retiradas em 03/11
    expect(m.gastoMesAnterior).toBeCloseTo(60 * 22.5, 2);
    expect(m.unidadesRetiradas).toBe(300);
    expect(m.prontosUnidades).toBe(25); // P-2004
    expect(m.custoProntosAguardando).toBeCloseTo(25 * 19.9, 2);
    expect(m.linhasAAvaliar).toBe(0); // o orçamento do kit churrasco (P-2005) já foi aceito
  });

  it("mês fechado usa o total mock", () => {
    const m = metricasDoPeriodo(base, "2026-09");
    expect(m.fechado).toBe(true);
    expect(m.gasto).toBe(2840);
  });

  it("popularidade ignora recusados e cancelados", () => {
    const pop = popularidade(base);
    // P-2010 (60) e P-2009 (40); o P-2003 cancelado (20) não conta
    expect(pop.find((p) => p.brindeId === "caderneta-digisystem")!.unidades).toBe(60 + 40);
    // P-2008 (12); o P-2002 recusado (10) não conta
    expect(pop.find((p) => p.brindeId === "copo-termico")!.unidades).toBe(12);
  });

  it("urgência é calculada a partir de hoje", () => {
    expect(urgencia(undefined, HOJE)).toBe("sem_data");
    expect(urgencia("2026-11-10", HOJE)).toBe("atrasada");
    expect(urgencia("2026-11-12", HOJE)).toBe("urgente");
    expect(urgencia("2026-11-16", HOJE)).toBe("proxima");
    expect(urgencia("2026-12-01", HOJE)).toBe("normal");
  });

  it("validarLinha aceita no Personalizável todo inteiro a partir de 1", () => {
    const kit = brinde(base, "kit-churrasco");
    for (const q of [0, -1, 1.5]) {
      const r = validarLinha(kit, q);
      expect(r.ok).toBe(false);
      expect(r.erros).toContain("Informe uma quantidade inteira, a partir de 1.");
    }
    expect(validarLinha(kit, 1).ok).toBe(true);
  });

  it("validarLinha no estoque aceita acima do disponível e brinde esgotado, só sinalizando acimaDoEstoque", () => {
    expect(validarLinha(brinde(base, "caderno-espiral-35"), 26)).toEqual({ ok: true, erros: [], acimaDoEstoque: true });
    expect(validarLinha(brinde(base, "caneta-azul-touch"), 1)).toEqual({ ok: true, erros: [], acimaDoEstoque: true });
    expect(validarLinha(brinde(base, "caderno-espiral-35"), 25)).toEqual({ ok: true, erros: [], acimaDoEstoque: false });
    expect(validarLinha(brinde(base, "kit-churrasco"), 5000).acimaDoEstoque).toBe(false);
    const invalida = validarLinha(brinde(base, "caderno-espiral-35"), 0);
    expect(invalida).toMatchObject({ ok: false, acimaDoEstoque: false });
  });
});

/* ---------------- Cadastro de brinde (tarefa 5.1) ---------------- */
import { alternarAtivo, salvarBrinde } from "./regras";

describe("cadastro de brinde", () => {
  const novo = {
    id: "", slug: "", nome: "Boné bordado", tipo: "estoque" as const, categoria: "Vestuário", foto: "/brindes/copo-termico.jpg",
    descricao: "Boné com logo.", custoUnitario: 25, novidade: true, ativo: true,
    minimo: 5, saldoInicial: 12,
  };

  it("cria brinde novo com id único, saldo inicial, reserva zerada e movimentação de saldo inicial", () => {
    const e = salvarBrinde(base, novo);
    const criado = e.brindes.at(-1)!;
    expect(criado.id).toBe("bone-bordado");
    expect(criado).toMatchObject({ saldo: 12, reserva: 0, minimo: 5 });
    const mov = e.movimentacoes.filter((m) => m.brindeId === criado.id);
    expect(mov).toHaveLength(1);
    expect(mov[0]).toMatchObject({ tipo: "saldo_inicial", qtd: 12 });
    expect(historicoBrinde(e, criado.id).fecha).toBe(true);
    expect(e.brindes).toHaveLength(base.brindes.length + 1);
  });

  it("brinde novo sem saldo inicial não gera movimentação", () => {
    const e = salvarBrinde(base, { ...novo, saldoInicial: 0 });
    expect(e.movimentacoes).toHaveLength(base.movimentacoes.length);
    expect(e.brindes.at(-1)!.saldo).toBe(0);
  });

  it("edita preservando saldo e reserva, atualiza o mínimo e recusa mudar o tipo", () => {
    const bambu = brinde(base, "caderno-bambu");
    const e = salvarBrinde(base, { ...bambu, nome: "Caderno de bambu novo", minimo: 70, saldoInicial: 999 });
    expect(brinde(e, "caderno-bambu").nome).toBe("Caderno de bambu novo");
    expect(brinde(e, "caderno-bambu").minimo).toBe(70);
    expect(brinde(e, "caderno-bambu").saldo).toBe(bambu.saldo);
    expect(brinde(e, "caderno-bambu").reserva).toBe(bambu.reserva);
    expect(e.movimentacoes).toHaveLength(base.movimentacoes.length);
    expect(() => salvarBrinde(base, { ...bambu, tipo: "personalizavel", custoUnitario: null, prazoExtraDiasUteis: 5 })).toThrow(/tipo/);
  });

  it("valida campos obrigatórios, saldo inicial e mínimo", () => {
    expect(() => salvarBrinde(base, { ...novo, nome: " " })).toThrow(/nome/);
    expect(() => salvarBrinde(base, { ...novo, custoUnitario: 0 })).toThrow(/custo/);
    expect(() => salvarBrinde(base, { ...novo, saldoInicial: -1 })).toThrow(/saldo inicial/);
    expect(() => salvarBrinde(base, { ...novo, saldoInicial: 1.5 })).toThrow(/saldo inicial/);
    expect(() => salvarBrinde(base, { ...novo, minimo: -2 })).toThrow(/mínimo/);
  });

  it("personalizável ignora saldo e mínimo e guarda só o prazo extra", () => {
    const e = salvarBrinde(base, {
      ...novo, nome: "Boné personalizado", tipo: "personalizavel", custoUnitario: null, prazoExtraDiasUteis: 5, minimo: 9, saldoInicial: 9,
    });
    expect(e.brindes.at(-1)).toMatchObject({ saldo: 0, reserva: 0, minimo: 0, prazoExtraDiasUteis: 5 });
  });

  it("alternarAtivo liga e desliga sem mutar a entrada", () => {
    const off = alternarAtivo(base, "caderno-bambu");
    expect(brinde(off, "caderno-bambu").ativo).toBe(false);
    expect(brinde(base, "caderno-bambu").ativo).toBe(true);
    expect(brinde(alternarAtivo(off, "caderno-bambu"), "caderno-bambu").ativo).toBe(true);
  });
});

/* ---------------- Preço visível (tarefa 13.2) ---------------- */
import { brl } from "./formato";
import { precoDaLinhaDoCarrinho, precoUnitarioLinha, subtotalDaLinha, totalDasLinhas, totalDoCarrinho } from "./regras";

describe("preço visível ao diretor", () => {
  const estoque = { tipo: "estoque" as const, qtd: 3, custoUnitarioNaHora: 12.5, orcamentoAceito: false };
  const persSem = { tipo: "personalizavel" as const, qtd: 10, custoUnitarioNaHora: null, orcamentoAceito: false };
  const persInformado = { ...persSem, orcamentoUnitario: 8 };
  const persAceito = { ...persSem, orcamentoUnitario: 8, orcamentoAceito: true };

  it("brl usa vírgula, duas casas, milhar com ponto e espaço comum", () => {
    expect(brl(12.5)).toBe("R$ 12,50");
    expect(brl(1234.5)).toBe("R$ 1.234,50");
  });

  it("precoUnitarioLinha e subtotalDaLinha: estoque usa o custo gravado; personalizável só com orçamento aceito", () => {
    expect(precoUnitarioLinha(estoque)).toBe(12.5);
    expect(subtotalDaLinha(estoque)).toBe(37.5);
    expect(precoUnitarioLinha(persSem)).toBeNull();
    expect(precoUnitarioLinha(persInformado)).toBeNull();
    expect(subtotalDaLinha(persInformado)).toBeNull();
    expect(precoUnitarioLinha(persAceito)).toBe(8);
    expect(subtotalDaLinha(persAceito)).toBe(80);
  });

  it("totalDasLinhas: estoque, personalizável sem e com aceite, mistura e só a avaliar", () => {
    expect(totalDasLinhas([estoque])).toEqual({ total: 37.5, aAvaliar: 0 });
    expect(totalDasLinhas([persAceito])).toEqual({ total: 80, aAvaliar: 0 });
    expect(totalDasLinhas([estoque, persSem])).toEqual({ total: 37.5, aAvaliar: 1 });
    expect(totalDasLinhas([persSem, persInformado])).toEqual({ total: 0, aAvaliar: 2 });
  });

  it("o total do carrinho e o valor do pedido criado vêm da mesma conta", () => {
    const carrinho = [
      { brindeId: "caderno-bambu", qtd: 4 },
      { brindeId: "kit-churrasco", qtd: 20 },
    ];
    const c = totalDoCarrinho(base.brindes, carrinho);
    const criado = criarPedido(base, dados, carrinho, false);
    expect(valorDoPedido(criado.pedidos[criado.pedidos.length - 1])).toEqual({ valor: c.total, aAvaliar: c.aAvaliar });
    expect(c.aAvaliar).toBe(1);
    const b = base.brindes.find((x) => x.id === "caderno-bambu")!;
    expect(precoDaLinhaDoCarrinho(b, 4).custoUnitarioNaHora).toBe(b.custoUnitario);
  });
});

/* ---------------- Painel de métricas (tarefa 5.2) ---------------- */
import { mesesDoPainel, mudancaDeGasto, pedidosEncerradosDoPeriodo } from "./regras";

describe("painel de métricas", () => {
  it("o painel cobre o mês de hoje e os 2 anteriores", () => {
    expect(mesesDoPainel(base)).toEqual(["2026-11", "2026-10", "2026-09"]);
  });

  it("filtrar por área devolve só pedidos dela e a soma por área fecha com a lista", () => {
    const m = metricasDoPeriodo(base, "2026-10");
    const todos = pedidosEncerradosDoPeriodo(base, "2026-10");
    expect(todos.map((p) => p.id).sort()).toEqual([...m.pedidosEncerrados].sort());
    for (const a of m.porArea) {
      const doArea = pedidosEncerradosDoPeriodo(base, "2026-10", a.chave);
      expect(doArea).toHaveLength(a.pedidos);
      expect(doArea.every((p) => (p.areaSolicitante || "Sem área") === a.chave)).toBe(true);
    }
  });

  it("mês fechado não tem lista de pedidos", () => {
    expect(pedidosEncerradosDoPeriodo(base, "2026-09")).toEqual([]);
  });

  it("mudança de gasto indica sentido e percentual", () => {
    expect(mudancaDeGasto({ gasto: 150, gastoMesAnterior: 100 })).toEqual({ sentido: "subiu", diferenca: 50, percentual: 50 });
    expect(mudancaDeGasto({ gasto: 50, gastoMesAnterior: 100 }).sentido).toBe("caiu");
    expect(mudancaDeGasto({ gasto: 10, gastoMesAnterior: 0 }).percentual).toBeNull();
  });
});

describe("rótulos dos estados do pedido", () => {
  it("o mapa único usa os nomes novos e as mensagens de erro citam os rótulos", () => {
    expect(ROTULO_ESTADO).toEqual({
      solicitada: "Recebido",
      em_alinhamento: "Em preparação",
      pronto: "Pronto para retirada",
      encerrada: "Retirado",
      recusada: "Recusado",
      cancelada: "Cancelado",
    });
    const ini = criarPedido(base, dados, [{ brindeId: "caderno-bambu", qtd: 1 }], false);
    const id = ini.pedidos[ini.pedidos.length - 1].id;
    expect(() => informarOrcamento(ini, id, 0, 10, "g1")).toThrow(/em "Em preparação"/);
  });
});

/* ---------------- Vitrine: contadores e filtros (tarefa 13.4) ---------------- */
import fc from "fast-check";
import { CATEGORIA_TODOS, contarPorCategoria, filtrarBrindes } from "./regras";

describe("contadores e filtros da vitrine", () => {
  it('"Todos" soma as categorias e o total acompanha o filtro e a busca', () => {
    const cont = contarPorCategoria(base.brindes);
    expect(cont[0].categoria).toBe(CATEGORIA_TODOS);
    expect(cont[0].total).toBe(cont.slice(1).reduce((s, c) => s + c.total, 0));
    expect(cont[0].total).toBe(base.brindes.filter((b) => b.ativo).length);
    expect(filtrarBrindes(base.brindes, CATEGORIA_TODOS, "", "az")).toHaveLength(cont[0].total);
    const primeira = cont[1];
    expect(filtrarBrindes(base.brindes, primeira.categoria, "", "novos")).toHaveLength(primeira.total);
    const bambu = filtrarBrindes(base.brindes, CATEGORIA_TODOS, "BAMBU", "az");
    expect(bambu.length).toBeGreaterThan(0);
    expect(bambu.every((b) => b.nome.toLowerCase().includes("bambu"))).toBe(true);
    expect(Object.fromEntries(cont.map((c) => [c.categoria, c.total]))).toEqual({
      [CATEGORIA_TODOS]: 7, "Casa e lazer": 1, "Escritório": 5, "Bem-estar": 1,
    });
    expect(filtrarBrindes(base.brindes, CATEGORIA_TODOS, "zzzz-inexistente", "az")).toEqual([]);
  });
});

/* ---------------- Property 14 (tarefa 13.4) ---------------- */

describe("Feature: loja-equilibrio-digiplace, Property 14: migração de mock preserva totais", () => {
  // **Validates: Requirements 11.8, 11.9**
  const parte = fc
    .tuple(fc.integer({ min: 0, max: 5000 }), fc.integer({ min: 0, max: 5000 }), fc.integer({ min: 0, max: 500 }))
    .map(([saldo, reservaBruta, minimo]) => ({ saldo, reserva: Math.min(saldo, reservaBruta), minimo }));

  it("saldo e reserva são as somas das partes, saldo >= reserva e o disponível total é a soma dos disponíveis", () => {
    fc.assert(
      fc.property(fc.array(parte, { minLength: 1, maxLength: 8 }), (partes) => {
        const junto = migrarBrindeLegado(partes);
        expect(junto.saldo).toBe(partes.reduce((s, x) => s + x.saldo, 0));
        expect(junto.reserva).toBe(partes.reduce((s, x) => s + x.reserva, 0));
        expect(junto.saldo).toBeGreaterThanOrEqual(junto.reserva);
        expect(junto.saldo - junto.reserva).toBe(partes.reduce((s, x) => s + (x.saldo - x.reserva), 0));
      }),
      { numRuns: 200 },
    );
  });
});
