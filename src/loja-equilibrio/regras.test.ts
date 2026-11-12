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
  selos, urgencia, validarDataDesejada, validarLinha, valorDoPedido, valorEmEstoque,
} from "./regras";
import type { Estado } from "./tipos";

const base: Estado = ESTADO_INICIAL;
const brinde = (e: Estado, id: string) => e.brindes.find((b) => b.id === id)!;
const vari = (e: Estado, b: string, v: string) => brinde(e, b).variacoes.find((x) => x.id === v)!;
const dados = { solicitanteId: "d1", finalidade: "Evento de teste" };

describe("estoque e selos", () => {
  it("o mock respeita saldo >= reserva e a conta de cada brinde fecha", () => {
    for (const b of base.brindes) {
      for (const x of b.variacoes) {
        expect(x.reserva).toBeGreaterThanOrEqual(0);
        expect(x.saldo).toBeGreaterThanOrEqual(x.reserva);
      }
      if (b.tipo === "estoque") expect(historicoBrinde(base, b.id).fecha).toBe(true);
    }
  });

  it("selos: últimas unidades até 5, indisponível em 0", () => {
    expect(selos(brinde(base, "mochila")).ultimasUnidades).toBe(false); // preta 3 + cinza 8 = 11
    expect(selos(brinde(base, "bloco-adesivo"))).toMatchObject({ indisponivel: true, ultimasUnidades: false });
    expect(selos(brinde(base, "camiseta")).novidade).toBe(true);
    expect(selos(brinde(base, "camiseta")).indisponivel).toBe(false);
  });

  it("alertas de mínimo e esgotados", () => {
    expect(alertasMinimo(base).map((a) => a.variacaoId)).toContain("preta"); // mochila preta, disp 3 < 6
    expect(esgotados(base).map((a) => a.brindeId)).toEqual(["bloco-adesivo"]);
  });

  it("valor em estoque soma saldo × custo", () => {
    expect(valorEmEstoque(base)).toBeGreaterThan(0);
  });
});

describe("criarPedido", () => {
  it("reserva a quantidade de estoque e grava o custo na linha", () => {
    const antes = disponivel(vari(base, "caneca", "azul"));
    const e = criarPedido(base, dados, [{ brindeId: "caneca", variacaoId: "azul", qtd: 4 }]);
    expect(disponivel(vari(e, "caneca", "azul"))).toBe(antes - 4);
    const p = e.pedidos[e.pedidos.length - 1];
    expect(p.estado).toBe("solicitada");
    expect(p.areaSolicitante).toBe("Comercial");
    expect(p.linhas[0].custoUnitarioNaHora).toBe(18.9);
    expect(base.pedidos.length).toBe(e.pedidos.length - 1); // entrada intacta
  });

  it("recusa inteiro se uma linha passa do disponível", () => {
    expect(() =>
      criarPedido(base, dados, [
        { brindeId: "caneca", variacaoId: "azul", qtd: 1 },
        { brindeId: "mochila", variacaoId: "preta", qtd: 4 },
      ]),
    ).toThrow(/disponíveis/);
  });

  it("não reserva linha personalizável", () => {
    for (const qtd of [1, 49]) {
      const e = criarPedido(base, dados, [{ brindeId: "ecobag", variacaoId: "unica", qtd }]);
      expect(vari(e, "ecobag", "unica").reserva).toBe(0);
    }
  });

  it("finalidade é obrigatória", () => {
    expect(() =>
      criarPedido(base, { ...dados, finalidade: "  " }, [{ brindeId: "caneca", variacaoId: "azul", qtd: 1 }]),
    ).toThrow(/finalidade/);
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
    expect(dataMinima(5, HOJE)).toBe("2026-11-20");
    expect(() =>
      criarPedido(base, { ...dados, dataDesejada: "2026-11-13" }, [{ brindeId: "ecobag", variacaoId: "unica", qtd: 60 }]),
    ).toThrow(/a partir de 20\/11/);
  });
});

describe("fluxo de estados", () => {
  const comPedido = criarPedido(base, dados, [{ brindeId: "caneca", variacaoId: "azul", qtd: 4 }]);
  const id = comPedido.pedidos[comPedido.pedidos.length - 1].id;

  it("recusa transição fora do fluxo", () => {
    expect(() => mudarEstado(comPedido, id, "encerrada", "g1")).toThrow(/Não é possível passar o pedido de "Recebido" para "Retirado"/);
  });

  it("recusada e cancelada pedem motivo e liberam a reserva", () => {
    expect(() => mudarEstado(comPedido, id, "recusada", "g1", " ")).toThrow(/motivo/i);
    const e = mudarEstado(comPedido, id, "recusada", "g1", "Sem verba");
    expect(vari(e, "caneca", "azul").reserva).toBe(vari(base, "caneca", "azul").reserva);
    expect(vari(e, "caneca", "azul").saldo).toBe(vari(base, "caneca", "azul").saldo);
  });

  it("encerrar baixa o saldo, libera a reserva e registra a saída", () => {
    let e = mudarEstado(comPedido, id, "em_alinhamento", "g1");
    e = mudarEstado(e, id, "pronto", "g1");
    e = mudarEstado(e, id, "encerrada", "g1");
    expect(vari(e, "caneca", "azul").saldo).toBe(vari(base, "caneca", "azul").saldo - 4);
    expect(vari(e, "caneca", "azul").reserva).toBe(vari(base, "caneca", "azul").reserva);
    const saida = e.movimentacoes.find((m) => m.pedidoId === id);
    expect(saida).toMatchObject({ tipo: "saida", qtd: 4 });
    expect(historicoBrinde(e, "caneca").fecha).toBe(true);
  });
});

describe("orçamento da linha personalizável", () => {
  const ini = criarPedido(base, dados, [{ brindeId: "chaveiro", variacaoId: "unico", qtd: 30 }]);
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
    const e = registrarEntrada(base, "caderno", "padrao", 10, "g1");
    expect(vari(e, "caderno", "padrao").saldo).toBe(vari(base, "caderno", "padrao").saldo + 10);
    expect(() => registrarAjuste(base, "caderno", "padrao", -1, "g1", " ")).toThrow(/motivo/);
    expect(() => registrarAjuste(base, "bloco-adesivo", "padrao", -1, "g1", "Perda")).toThrow(/reservado/);
    expect(historicoBrinde(registrarAjuste(e, "caderno", "padrao", -2, "g1", "Contagem"), "caderno").fecha).toBe(true);
  });
});

describe("métricas e urgência", () => {
  it("mês calculado soma por solicitante e por área igual ao total", () => {
    const m = metricasDoPeriodo(base, "2026-10");
    expect(m.gasto).toBeCloseTo(3082, 2);
    expect(m.porSolicitante.reduce((s, x) => s + x.valor, 0)).toBeCloseTo(m.gasto, 2);
    expect(m.porArea.reduce((s, x) => s + x.valor, 0)).toBeCloseTo(m.gasto, 2);
    expect(m.gastoMesAnterior).toBe(2840); // setembro fechado, total mock
  });

  it("novembro compara com outubro calculado; prontos e a avaliar", () => {
    const m = metricasDoPeriodo(base, "2026-11");
    expect(m.gasto).toBeCloseTo(1901.5, 2);
    expect(m.gastoMesAnterior).toBeCloseTo(3082, 2);
    expect(m.prontosUnidades).toBe(10 + 40 + 6);
    expect(m.custoProntosAguardando).toBeCloseTo(10 * 21.5 + 40 * 7.9 + 6 * 118, 2);
    expect(m.linhasAAvaliar).toBe(2); // ecobag sem aceite e camiseta sem orçamento
  });

  it("mês fechado usa o total mock", () => {
    const m = metricasDoPeriodo(base, "2026-09");
    expect(m.fechado).toBe(true);
    expect(m.gasto).toBe(2840);
  });

  it("popularidade ignora recusados e cancelados", () => {
    const pop = popularidade(base);
    expect(pop.find((p) => p.brindeId === "mochila")!.unidades).toBe(5 + 6);
  });

  it("urgência é calculada a partir de hoje", () => {
    expect(urgencia(undefined, HOJE)).toBe("sem_data");
    expect(urgencia("2026-11-10", HOJE)).toBe("atrasada");
    expect(urgencia("2026-11-12", HOJE)).toBe("urgente");
    expect(urgencia("2026-11-16", HOJE)).toBe("proxima");
    expect(urgencia("2026-12-01", HOJE)).toBe("normal");
  });

  it("validarLinha aceita no Personalizável todo inteiro a partir de 1", () => {
    const camiseta = brinde(base, "camiseta");
    const v = camiseta.variacoes[0];
    for (const q of [0, -1, 1.5]) {
      const r = validarLinha(camiseta, v, q);
      expect(r.ok).toBe(false);
      expect(r.erros).toContain("Informe uma quantidade inteira, a partir de 1.");
    }
    expect(validarLinha(camiseta, v, 1).ok).toBe(true);
  });
});

/* ---------------- Cadastro de brinde (tarefa 5.1) ---------------- */
import { alternarAtivo, salvarBrinde } from "./regras";

describe("cadastro de brinde", () => {
  const novo = {
    id: "", slug: "", nome: "Boné bordado", tipo: "estoque" as const, categoria: "Vestuário", foto: "/brindes/camiseta.png",
    descricao: "Boné com logo.", custoUnitario: 25, novidade: true, ativo: true,
    variacoes: [{ id: "", rotulo: "Azul", saldo: 99, reserva: 99, minimo: 5 }],
  };

  it("cria brinde novo com id único, saldo e reserva zerados", () => {
    const e = salvarBrinde(base, novo);
    const criado = e.brindes.at(-1)!;
    expect(criado.id).toBe("bone-bordado");
    expect(criado.variacoes[0]).toMatchObject({ id: "azul", saldo: 0, reserva: 0, minimo: 5 });
    expect(historicoBrinde(e, criado.id).fecha).toBe(true);
    expect(e.brindes).toHaveLength(base.brindes.length + 1);
  });

  it("edita preservando saldo e reserva e recusa mudar o tipo", () => {
    const caneca = brinde(base, "caneca");
    const e = salvarBrinde(base, { ...caneca, nome: "Caneca nova", variacoes: caneca.variacoes.map((v) => ({ ...v, saldo: 0, reserva: 0 })) });
    expect(brinde(e, "caneca").nome).toBe("Caneca nova");
    expect(vari(e, "caneca", "azul").saldo).toBe(vari(base, "caneca", "azul").saldo);
    expect(() => salvarBrinde(base, { ...caneca, tipo: "personalizavel", custoUnitario: null, prazoExtraDiasUteis: 5 })).toThrow(/tipo/);
  });

  it("valida campos obrigatórios e não remove variação com saldo", () => {
    expect(() => salvarBrinde(base, { ...novo, nome: " " })).toThrow(/nome/);
    expect(() => salvarBrinde(base, { ...novo, custoUnitario: 0 })).toThrow(/custo/);
    const caneca = brinde(base, "caneca");
    expect(() => salvarBrinde(base, { ...caneca, variacoes: [caneca.variacoes[0]] })).toThrow(/não pode ser removida/);
  });

  it("alternarAtivo liga e desliga sem mutar a entrada", () => {
    const off = alternarAtivo(base, "caneca");
    expect(brinde(off, "caneca").ativo).toBe(false);
    expect(brinde(base, "caneca").ativo).toBe(true);
    expect(brinde(alternarAtivo(off, "caneca"), "caneca").ativo).toBe(true);
  });
});

/* ---------------- Painel de métricas (tarefa 5.2) ---------------- */
import { mesesDoPainel, pedidosEncerradosDoPeriodo, variacaoDeGasto } from "./regras";

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

  it("variação de gasto indica sentido e percentual", () => {
    expect(variacaoDeGasto({ gasto: 150, gastoMesAnterior: 100 })).toEqual({ sentido: "subiu", diferenca: 50, percentual: 50 });
    expect(variacaoDeGasto({ gasto: 50, gastoMesAnterior: 100 }).sentido).toBe("caiu");
    expect(variacaoDeGasto({ gasto: 10, gastoMesAnterior: 0 }).percentual).toBeNull();
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
    const ini = criarPedido(base, dados, [{ brindeId: "caneca", variacaoId: "azul", qtd: 1 }]);
    const id = ini.pedidos[ini.pedidos.length - 1].id;
    expect(() => informarOrcamento(ini, id, 0, 10, "g1")).toThrow(/em "Em preparação"/);
  });
});
