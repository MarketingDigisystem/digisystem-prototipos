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
        expect(Object.keys(l).every((k) => ["brindeId", "qtd", "tipo", "custoUnitarioNaHora", "personalizacao", "orcamentoUnitario", "orcamentoAceito", "notaAjuste"].includes(k))).toBe(true);
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

  it("selos: últimas unidades até 5, indisponível em 0", () => {
    expect(selos(brinde(base, "mochila")).ultimasUnidades).toBe(false); // saldo 17 − reserva 6 = 11
    expect(selos(brinde(base, "bloco-adesivo"))).toMatchObject({ indisponivel: true, ultimasUnidades: false });
    expect(selos(brinde(base, "camiseta")).novidade).toBe(true);
    expect(selos(brinde(base, "camiseta")).indisponivel).toBe(false);
  });

  it("alertas de mínimo e esgotados", () => {
    expect(alertasMinimo(base).map((a) => a.brindeId)).toContain("squeeze"); // disp 35 < mínimo 40
    expect(esgotados(base).map((a) => a.brindeId)).toEqual(["bloco-adesivo"]);
  });

  it("valor em estoque soma saldo × custo", () => {
    expect(valorEmEstoque(base)).toBeGreaterThan(0);
  });
});

describe("criarPedido", () => {
  it("reserva a quantidade de estoque e grava o custo na linha", () => {
    const antes = disponivel(brinde(base, "caneca"));
    const e = criarPedido(base, dados, [{ brindeId: "caneca", qtd: 4 }]);
    expect(disponivel(brinde(e, "caneca"))).toBe(antes - 4);
    const p = e.pedidos[e.pedidos.length - 1];
    expect(p.estado).toBe("solicitada");
    expect(p.areaSolicitante).toBe("Comercial");
    expect(p.linhas[0].custoUnitarioNaHora).toBe(18.9);
    expect(base.pedidos.length).toBe(e.pedidos.length - 1); // entrada intacta
  });

  it("recusa inteiro se uma linha passa do disponível", () => {
    expect(() =>
      criarPedido(base, dados, [
        { brindeId: "caneca", qtd: 1 },
        { brindeId: "mochila", qtd: 12 },
      ]),
    ).toThrow(/disponíveis/);
  });

  it("duas linhas do mesmo brinde somam contra o disponível", () => {
    expect(() =>
      criarPedido(base, dados, [
        { brindeId: "mochila", qtd: 6 },
        { brindeId: "mochila", qtd: 6 },
      ]),
    ).toThrow(/só há 11 disponíveis/);
  });

  it("não reserva linha personalizável e aceita qualquer inteiro a partir de 1", () => {
    for (const qtd of [1, 49]) {
      const e = criarPedido(base, dados, [{ brindeId: "ecobag", qtd }]);
      expect(brinde(e, "ecobag").reserva).toBe(0);
    }
  });

  it("finalidade é obrigatória", () => {
    expect(() => criarPedido(base, { ...dados, finalidade: "  " }, [{ brindeId: "caneca", qtd: 1 }])).toThrow(/finalidade/);
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
      criarPedido(base, { ...dados, dataDesejada: "2026-11-13" }, [{ brindeId: "ecobag", qtd: 60 }]),
    ).toThrow(/a partir de 20\/11/);
  });
});

describe("fluxo de estados", () => {
  const comPedido = criarPedido(base, dados, [{ brindeId: "caneca", qtd: 4 }]);
  const id = comPedido.pedidos[comPedido.pedidos.length - 1].id;

  it("recusa transição fora do fluxo", () => {
    expect(() => mudarEstado(comPedido, id, "encerrada", "g1")).toThrow(/Não é possível passar o pedido de "Recebido" para "Retirado"/);
  });

  it("recusada e cancelada pedem motivo e liberam a reserva", () => {
    expect(() => mudarEstado(comPedido, id, "recusada", "g1", " ")).toThrow(/motivo/i);
    const e = mudarEstado(comPedido, id, "recusada", "g1", "Sem verba");
    expect(brinde(e, "caneca").reserva).toBe(brinde(base, "caneca").reserva);
    expect(brinde(e, "caneca").saldo).toBe(brinde(base, "caneca").saldo);
  });

  it("encerrar baixa o saldo, libera a reserva e registra a saída", () => {
    let e = mudarEstado(comPedido, id, "em_alinhamento", "g1");
    e = mudarEstado(e, id, "pronto", "g1");
    e = mudarEstado(e, id, "encerrada", "g1");
    expect(brinde(e, "caneca").saldo).toBe(brinde(base, "caneca").saldo - 4);
    expect(brinde(e, "caneca").reserva).toBe(brinde(base, "caneca").reserva);
    const saida = e.movimentacoes.find((m) => m.pedidoId === id);
    expect(saida).toMatchObject({ tipo: "saida", qtd: 4, brindeId: "caneca" });
    expect(historicoBrinde(e, "caneca").fecha).toBe(true);
  });
});

describe("orçamento da linha personalizável", () => {
  const ini = criarPedido(base, dados, [{ brindeId: "chaveiro", qtd: 30 }]);
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
    const e = registrarEntrada(base, "caderno", 10, "g1");
    expect(brinde(e, "caderno").saldo).toBe(brinde(base, "caderno").saldo + 10);
    expect(() => registrarAjuste(base, "caderno", -1, "g1", " ")).toThrow(/motivo/);
    expect(() => registrarAjuste(base, "bloco-adesivo", -1, "g1", "Perda")).toThrow(/reservado/);
    expect(historicoBrinde(registrarAjuste(e, "caderno", -2, "g1", "Contagem"), "caderno").fecha).toBe(true);
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
    for (const q of [0, -1, 1.5]) {
      const r = validarLinha(camiseta, q);
      expect(r.ok).toBe(false);
      expect(r.erros).toContain("Informe uma quantidade inteira, a partir de 1.");
    }
    expect(validarLinha(camiseta, 1).ok).toBe(true);
  });

  it("validarLinha no estoque recusa acima do disponível e brinde esgotado", () => {
    expect(validarLinha(brinde(base, "mochila"), 12).erros).toContain("Só há 11 disponíveis.");
    expect(validarLinha(brinde(base, "bloco-adesivo"), 1).erros).toContain("Indisponível no momento.");
    expect(validarLinha(brinde(base, "mochila"), 11).ok).toBe(true);
  });
});

/* ---------------- Cadastro de brinde (tarefa 5.1) ---------------- */
import { alternarAtivo, salvarBrinde } from "./regras";

describe("cadastro de brinde", () => {
  const novo = {
    id: "", slug: "", nome: "Boné bordado", tipo: "estoque" as const, categoria: "Vestuário", foto: "/brindes/camiseta.png",
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
    const caneca = brinde(base, "caneca");
    const e = salvarBrinde(base, { ...caneca, nome: "Caneca nova", minimo: 70, saldoInicial: 999 });
    expect(brinde(e, "caneca").nome).toBe("Caneca nova");
    expect(brinde(e, "caneca").minimo).toBe(70);
    expect(brinde(e, "caneca").saldo).toBe(caneca.saldo);
    expect(brinde(e, "caneca").reserva).toBe(caneca.reserva);
    expect(e.movimentacoes).toHaveLength(base.movimentacoes.length);
    expect(() => salvarBrinde(base, { ...caneca, tipo: "personalizavel", custoUnitario: null, prazoExtraDiasUteis: 5 })).toThrow(/tipo/);
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
    const off = alternarAtivo(base, "caneca");
    expect(brinde(off, "caneca").ativo).toBe(false);
    expect(brinde(base, "caneca").ativo).toBe(true);
    expect(brinde(alternarAtivo(off, "caneca"), "caneca").ativo).toBe(true);
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
      { brindeId: "caneca", qtd: 4 },
      { brindeId: "ecobag", qtd: 20 },
    ];
    const c = totalDoCarrinho(base.brindes, carrinho);
    const criado = criarPedido(base, dados, carrinho);
    expect(valorDoPedido(criado.pedidos[criado.pedidos.length - 1])).toEqual({ valor: c.total, aAvaliar: c.aAvaliar });
    expect(c.aAvaliar).toBe(1);
    const b = base.brindes.find((x) => x.id === "caneca")!;
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
    const ini = criarPedido(base, dados, [{ brindeId: "caneca", qtd: 1 }]);
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
    const caneca = filtrarBrindes(base.brindes, CATEGORIA_TODOS, "CANECA", "az");
    expect(caneca.length).toBeGreaterThan(0);
    expect(caneca.every((b) => b.nome.toLowerCase().includes("caneca"))).toBe(true);
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
