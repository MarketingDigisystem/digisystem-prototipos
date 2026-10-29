// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).

import { describe, expect, it } from "vitest";
import { MOVIMENTOS_INICIAIS, PEDIDOS_INICIAIS, PRODUTOS_INICIAIS, SUGESTOES_INICIAIS } from "./mock";
import fc from "fast-check";
import {
  QTD_MINIMA_ENCOMENDA, ajustar, alertasMinimo, aprovarSugestao, avancarEncomenda, cancelar, criarEncomenda, criarPedido,
  disponivel, gastoPorCentro, negar, recusarSugestao, registrarEntrada, retirar, validarData, validarEncomenda, validarItem,
} from "./regras";
import type { EstadoLoja } from "./tipos";

const inicial = (): EstadoLoja => ({ produtos: PRODUTOS_INICIAIS, pedidos: PEDIDOS_INICIAIS, movimentos: MOVIMENTOS_INICIAIS, sugestoes: SUGESTOES_INICIAIS });
const prod = (e: EstadoLoja, id: string) => e.produtos.find((p) => p.id === id)!;
const varia = (e: EstadoLoja, id: string, v: string) => prod(e, id).variacoes.find((x) => x.id === v)!;
const EM = "2026-10-29T10:00";

const BASE = (id: string) => ({
  id, solicitanteId: "u-ana", centroCustoId: "MKT-DIR" as const,
  finalidade: "evento" as const, destino: "Teste", dataNecessaria: "2026-11-20",
  localRetirada: "Recepção", observacao: undefined, motivo: undefined,
});

describe("estado derivado do mock", () => {
  it("disponível é o saldo físico (sem reserva)", () => {
    const e = inicial();
    expect(disponivel(prod(e, "p01"), varia(e, "p01", "azul"), e.pedidos)).toBe(60);
    expect(disponivel(prod(e, "p06"), varia(e, "p06", "azul"), e.pedidos)).toBe(0); // esgotado
  });
  it("alertas de mínimo: só o que está acima de zero e abaixo do mínimo", () => {
    const e = inicial();
    const a = alertasMinimo(e.produtos, e.pedidos);
    expect(a.every((x) => x.disponivel > 0 && x.disponivel < x.variacao.minimo)).toBe(true);
  });
});

describe("pronta entrega: baixa imediata", () => {
  it("item com saldo → nasce pronto e baixa o estoque na hora", () => {
    const e = inicial();
    const { estado, pedido } = criarPedido(e, BASE("BR-9001"), [{ produtoId: "p01", variacaoId: "azul", qtd: 10 }], "u-ana", EM);
    expect(pedido.status).toBe("pronto");
    expect(pedido.tipoPedido).toBe("pronta");
    expect(varia(estado, "p01", "azul").saldo).toBe(50); // 60 − 10
    expect(estado.movimentos.at(-1)?.tipo).toBe("saida");
  });
  it("item sem saldo não pode virar pronta entrega (lança)", () => {
    const e = inicial();
    expect(() => criarPedido(e, BASE("BR-9002"), [{ produtoId: "p06", variacaoId: "azul", qtd: 5 }], "u-ana", EM)).toThrow(/sem saldo/i);
  });
  it("pedir acima do disponível é inválido na validação", () => {
    const e = inicial();
    // p01 azul tem 60; pedir 61 reprova
    expect(validarItem(prod(e, "p01"), varia(e, "p01", "azul"), 61, false, e.pedidos).ok).toBe(false);
    expect(validarItem(prod(e, "p01"), varia(e, "p01", "azul"), 60, false, e.pedidos).ok).toBe(true);
    // item esgotado reprova na pronta entrega
    expect(validarItem(prod(e, "p06"), varia(e, "p06", "azul"), 5, false, e.pedidos).ok).toBe(false);
  });
  it("retirar um pronto encerra e debita o centro de custo", () => {
    const antes = gastoPorCentro(inicial().pedidos, "2026-10")["MKT-DIR"].valor;
    const e = retirar(inicial(), "BR-0049", "u-felipe", EM);
    const p = e.pedidos.find((x) => x.id === "BR-0049")!;
    expect(p.status).toBe("encerrado");
    // BR-0049: 10×27 + 20×9,5 = 270 + 190 = 460
    expect(gastoPorCentro(e.pedidos, "2026-10")["MKT-DIR"].valor - antes).toBeCloseTo(460);
    expect(varia(e, "p01", "azul").saldo).toBe(60); // saldo não muda na retirada
  });
  it("cancelar um pronto devolve as unidades ao estoque", () => {
    const antes = varia(inicial(), "p01", "azul").saldo;
    const e = cancelar(inicial(), "BR-0049", "Evento adiado", "u-ana", EM);
    expect(e.pedidos.find((x) => x.id === "BR-0049")!.status).toBe("cancelado");
    expect(varia(e, "p01", "azul").saldo).toBe(antes + 10); // devolução
    expect(e.movimentos.at(-1)?.tipo).toBe("entrada");
  });
  it("ajuste não deixa o saldo negativo", () => {
    expect(() => ajustar(inicial(), "p01", "azul", -1, "teste", "u-felipe", EM)).toThrow();
  });
});

describe("encomenda", () => {
  const encBase = (id: string) => BASE(id);
  it("exige quantidade mínima (QTD_MINIMA_ENCOMENDA e mínima por produto)", () => {
    const e = inicial();
    // p06 garrafa: encomendaMinima 10 (= QTD_MINIMA_ENCOMENDA)
    expect(QTD_MINIMA_ENCOMENDA).toBe(10);
    expect(validarEncomenda(prod(e, "p06"), 9).ok).toBe(false);
    expect(validarEncomenda(prod(e, "p06"), 10).ok).toBe(true);
    // p14 camiseta: encomendaMinima 20
    expect(validarEncomenda(prod(e, "p14"), 19).ok).toBe(false);
    expect(validarEncomenda(prod(e, "p14"), 20).ok).toBe(true);
    // item que não aceita encomenda reprova
    expect(validarEncomenda(prod(e, "p07"), 50).ok).toBe(false);
  });
  it("criar encomenda nasce solicitada e NÃO mexe no saldo próprio", () => {
    const e = inicial();
    const antes = varia(e, "p14", "m").saldo;
    const { estado, pedido } = criarEncomenda(e, encBase("BR-9100"), { produtoId: "p14", variacaoId: "m", qtd: 30 }, { prazoDesejado: "2026-12-10" }, "u-ana", EM);
    expect(pedido.status).toBe("encomenda_solicitada");
    expect(pedido.tipoPedido).toBe("encomenda");
    expect(varia(estado, "p14", "m").saldo).toBe(antes); // produção externa, saldo intacto
    expect(estado.movimentos.length).toBe(e.movimentos.length); // sem saída
  });
  it("criar encomenda abaixo do mínimo lança", () => {
    const e = inicial();
    expect(() => criarEncomenda(e, encBase("BR-9101"), { produtoId: "p14", variacaoId: "m", qtd: 5 }, {}, "u-ana", EM)).toThrow(/a partir de/i);
  });
  it("ciclo completo com guardas de ordem", () => {
    let e = inicial();
    const id = "BR-9102";
    e = criarEncomenda(e, encBase(id), { produtoId: "p06", variacaoId: "azul", qtd: 20 }, {}, "u-ana", EM).estado;
    const st = () => e.pedidos.find((x) => x.id === id)!.status;
    expect(st()).toBe("encomenda_solicitada");
    e = avancarEncomenda(e, id, "u-felipe", EM); expect(st()).toBe("em_alinhamento");
    e = avancarEncomenda(e, id, "u-felipe", EM); expect(st()).toBe("confirmada");
    e = avancarEncomenda(e, id, "u-felipe", EM); expect(st()).toBe("em_producao");
    e = avancarEncomenda(e, id, "u-felipe", EM); expect(st()).toBe("pronto");
    // não dá para avançar além de pronto
    expect(() => avancarEncomenda(e, id, "u-felipe", EM)).toThrow();
    // retirada encerra e debita o centro de custo
    const antes = gastoPorCentro(e.pedidos, "2026-10")["MKT-DIR"].valor;
    e = retirar(e, id, "u-felipe", EM);
    expect(st()).toBe("encerrado");
    expect(gastoPorCentro(e.pedidos, "2026-10")["MKT-DIR"].valor - antes).toBeCloseTo(20 * 42);
  });
  it("negar vale para encomenda em análise e exige motivo", () => {
    expect(() => negar(inicial(), "BR-0051", "  ", "u-felipe", EM)).toThrow();
    expect(() => negar(inicial(), "BR-0049", "qualquer", "u-felipe", EM)).toThrow(); // pronta entrega não nega
    const e = negar(inicial(), "BR-0051", "Sem orçamento agora", "u-felipe", EM);
    expect(e.pedidos.find((x) => x.id === "BR-0051")!.status).toBe("negado");
  });
  it("cancelar encomenda não mexe no saldo", () => {
    const antes = varia(inicial(), "p06", "azul").saldo;
    const e = cancelar(inicial(), "BR-0050", "Evento adiado", "u-rafael", EM);
    expect(e.pedidos.find((x) => x.id === "BR-0050")!.status).toBe("cancelado");
    expect(varia(e, "p06", "azul").saldo).toBe(antes);
    expect(e.movimentos.length).toBe(inicial().movimentos.length);
  });
});

describe("sugestões", () => {
  it("aprovar cria um produto de encomenda no catálogo e marca a sugestão aprovada", () => {
    const e = inicial();
    const antes = e.produtos.length;
    const nova = aprovarSugestao(e, "SG-0003", "u-fernando", EM, 50);
    const s = nova.sugestoes.find((x) => x.id === "SG-0003")!;
    expect(s.status).toBe("aprovada");
    expect(s.produtoGeradoId).toBeTruthy();
    expect(nova.produtos.length).toBe(antes + 1);
    const p = nova.produtos.find((x) => x.id === s.produtoGeradoId)!;
    expect(p.aceitaEncomenda).toBe(true);
    expect(p.somenteEncomenda).toBe(true);
    expect(p.encomendaMinima).toBe(QTD_MINIMA_ENCOMENDA);
    // o item virou pedível por encomenda
    expect(validarEncomenda(p, QTD_MINIMA_ENCOMENDA).ok).toBe(true);
  });
  it("recusar exige motivo", () => {
    expect(() => recusarSugestao(inicial(), "SG-0003", "  ", "u-fernando", EM)).toThrow();
    const e = recusarSugestao(inicial(), "SG-0003", "Fora do orçamento deste trimestre", "u-fernando", EM);
    expect(e.sugestoes.find((x) => x.id === "SG-0003")!.status).toBe("recusada");
  });
});

describe("validações de data", () => {
  it("data antes do prazo extra é inválida", () => {
    expect(validarData("2026-11-02", 5)).toMatch(/^min:/);
    expect(validarData("2026-11-18", 5)).toBeNull();
  });
});

describe("propriedade: o saldo nunca fica negativo", () => {
  it("em qualquer sequência de ações válidas (pronta entrega + encomenda + retirada + cancelamento)", () => {
    const alvos = ["BR-0051", "BR-0050", "BR-0049", "BR-0048", "BR-0043"];
    const acoes = ["avancar", "retirar", "cancelar", "criarPronta", "criarEncomenda"] as const;
    fc.assert(
      fc.property(fc.array(fc.tuple(fc.constantFrom(...alvos), fc.constantFrom(...acoes)), { maxLength: 16 }), (seq) => {
        let e = inicial();
        let n = 9000;
        for (const [id, a] of seq) {
          try {
            if (a === "avancar") e = avancarEncomenda(e, id, "u-felipe", EM);
            else if (a === "retirar") e = retirar(e, id, "u-felipe", EM);
            else if (a === "cancelar") e = cancelar(e, id, "teste", "u-felipe", EM);
            else if (a === "criarPronta") e = criarPedido(e, BASE(`BR-${++n}`), [{ produtoId: "p02", variacaoId: "unico", qtd: 10 }], "u-ana", EM).estado;
            else e = criarEncomenda(e, BASE(`BR-${++n}`), { produtoId: "p14", variacaoId: "m", qtd: 30 }, {}, "u-ana", EM).estado;
          } catch {
            /* transição inválida é ignorada */
          }
        }
        for (const p of e.produtos) for (const v of p.variacoes) {
          expect(v.saldo).toBeGreaterThanOrEqual(0);
        }
      }),
    );
  });
});
