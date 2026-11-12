// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: regras.ts, formato.ts e mock.ts desta pasta, escritos em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Correctness Properties 5, 10 e 11).
//
// Testes de propriedade (fast-check, 100 execuções ou mais). A Property 5 substitui a antiga tarefa opcional 2.6
// (quantidade mínima da personalização), removida em 2026-11-12.

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ROTULO_ESTADO, urlDoAsset } from "./formato";
import { ESTADO_INICIAL } from "./mock";
import {
  TRANSICOES, aceitarOrcamento, ajustarQuantidadeLinha, informarOrcamento, mudarEstado, validarLinha,
} from "./regras";
import type { Brinde, EstadoPedido } from "./tipos";

const base = ESTADO_INICIAL;
const NUM_RUNS = 200;
const ESTADOS: EstadoPedido[] = ["solicitada", "em_alinhamento", "pronto", "encerrada", "recusada", "cancelada"];

/* ---------------------------------------------------------------- */
/* Property 5                                                        */
/* ---------------------------------------------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 5: quantidade inteira a partir de 1 vale para todo tipo", () => {
  // **Validates: Requirements 3.2, 3.8, 3.9**
  const MSG_QTD = "Informe uma quantidade inteira, a partir de 1.";
  const brindesAtivos = base.brindes.filter((b) => b.ativo);

  it("o mock tem brindes de estoque e personalizáveis ativos", () => {
    expect(brindesAtivos.some((b) => b.tipo === "estoque")).toBe(true);
    expect(brindesAtivos.some((b) => b.tipo === "personalizavel")).toBe(true);
  });

  it("o erro de quantidade aparece se e somente se q não é inteiro >= 1; o Personalizável não tem outra condição", () => {
    const quantidade = fc.oneof(
      fc.integer({ min: -20, max: 400 }),
      fc.double({ min: -20, max: 400 }),
      fc.constantFrom(Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0, 1, 1.5),
    );
    fc.assert(
      fc.property(
        fc.constantFrom(...brindesAtivos),
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 0, max: 500 }),
        quantidade,
        (original, saldo, reservaBruta, q) => {
          const reserva = Math.min(saldo, reservaBruta);
          const b: Brinde = original.tipo === "estoque" ? { ...original, saldo, reserva } : original;
          const r = validarLinha(b, q);
          const qtdValida = Number.isInteger(q) && q >= 1;

          expect(r.erros.includes(MSG_QTD)).toBe(!qtdValida);
          if (b.tipo === "personalizavel") {
            // Sem saldo e sem mínimo: a única condição é o inteiro a partir de 1.
            expect(r.ok).toBe(qtdValida);
          } else {
            const disp = saldo - reserva;
            expect(r.ok).toBe(qtdValida && disp > 0 && q <= disp);
          }
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------------------------------------------- */
/* Property 10                                                       */
/* ---------------------------------------------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 10: mensagens de erro citam rótulos, não termos antigos", () => {
  // **Validates: Requirements 8.1, 8.5, 8.6**
  const ANTIGOS = /\b(?:Solicitadas?|Encerradas?|Recusadas?|Canceladas?)\b|em alinhamento/i;
  const idsDosPedidos = base.pedidos.map((p) => p.id);

  it("o mock tem pedidos em todos os estados", () => {
    expect(new Set(base.pedidos.map((p) => p.estado))).toEqual(new Set(ESTADOS));
  });

  it("toda recusa por estado usa ROTULO_ESTADO e nenhum termo antigo", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...idsDosPedidos),
        fc.constantFrom(...ESTADOS),
        fc.constantFrom("mudar", "orcamento", "aceite", "ajuste"),
        fc.integer({ min: -2, max: 4 }),
        fc.oneof(fc.integer({ min: -5, max: 300 }), fc.double({ min: -5, max: 300 })),
        fc.string({ maxLength: 12 }),
        (id, alvo, operacao, indice, qtd, texto) => {
          const pedido = base.pedidos.find((p) => p.id === id)!;
          let mensagem: string | null = null;
          try {
            if (operacao === "mudar") mudarEstado(base, id, alvo, "g1", texto);
            else if (operacao === "orcamento") informarOrcamento(base, id, indice, qtd, "g1");
            else if (operacao === "aceite") aceitarOrcamento(base, id, indice, "d1");
            else ajustarQuantidadeLinha(base, id, indice, qtd, "g1", texto);
          } catch (erro) {
            mensagem = (erro as Error).message;
          }

          if (mensagem !== null) expect(mensagem).not.toMatch(ANTIGOS);

          // Casos em que a recusa vem do estado: a mensagem existe e cita os rótulos novos.
          if (operacao === "mudar" && !TRANSICOES[pedido.estado].includes(alvo)) {
            expect(mensagem).toBe(`Não é possível passar o pedido de "${ROTULO_ESTADO[pedido.estado]}" para "${ROTULO_ESTADO[alvo]}".`);
          }
          if ((operacao === "orcamento" || operacao === "aceite") && pedido.estado !== "em_alinhamento") {
            expect(mensagem).not.toBeNull();
            expect(mensagem).toContain(`"${ROTULO_ESTADO.em_alinhamento}"`);
          }
          if (operacao === "ajuste" && pedido.estado !== "solicitada" && pedido.estado !== "em_alinhamento") {
            expect(mensagem).not.toBeNull();
            expect(mensagem).toContain(`"${ROTULO_ESTADO.solicitada}"`);
            expect(mensagem).toContain(`"${ROTULO_ESTADO.em_alinhamento}"`);
          }
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------------------------------------------- */
/* Property 11                                                       */
/* ---------------------------------------------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 11: caminho de asset respeita a base", () => {
  // **Validates: Requirements 9.3**
  const segmento = fc.stringMatching(/^[a-z0-9][a-z0-9-]{0,14}$/);
  const base_ = fc
    .tuple(fc.array(segmento, { maxLength: 3 }), fc.boolean())
    .map(([partes, barraFinal]) => {
      if (partes.length === 0) return "/";
      const miolo = `/${partes.join("/")}`;
      return barraFinal ? `${miolo}/` : miolo;
    });
  const nome = fc.oneof(
    fc.constantFrom("icone.png", "logo-colorido.png", "logo-negativo.png", "logo-branco.png"),
    fc.stringMatching(/^[a-z0-9][a-z0-9._-]{0,20}$/),
  );

  it("devolve a base normalizada, 'digistore/' e o nome, sem barra dupla", () => {
    fc.assert(
      fc.property(base_, nome, (base, arquivo) => {
        const normalizada = base.endsWith("/") ? base : `${base}/`;
        const url = urlDoAsset(arquivo, base);
        expect(url).toBe(`${normalizada}digistore/${arquivo}`);
        expect(url.startsWith(normalizada)).toBe(true);
        expect(url.includes("//")).toBe(false);
        expect(url.startsWith("/")).toBe(true);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ================================================================ */
/* Properties 12, 13, 15, 16 e 17 (tarefa 13.4)                      */
/* (a Property 14 fica em regras.test.ts, onde mora o helper legado) */
/* ================================================================ */

import { brl, razaoDeContraste } from "./formato";
import {
  COR_FAIXA_CANTO, COR_FAIXA_DESTAQUE, COR_FAIXA_ETIQUETA, COR_FAIXA_FUNDO, COR_FAIXA_SUBTITULO, COR_FAIXA_TEXTO,
  CONTRASTE_MINIMO_TEXTO_GRANDE, CONTRASTE_MINIMO_TEXTO_PEQUENO,
} from "./FaixaApresentacao";
import {
  CATEGORIA_TODOS, contarPorCategoria, disponivel, filtrarBrindes, selos, totalDasLinhas, type LinhaComPreco, type OrdemVitrine,
} from "./regras";
import { chaveDeFusao } from "./store";

/* ---------------------------- Property 12 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 12: preço, subtotal e total", () => {
  // **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.9**
  const qtd = fc.integer({ min: 1, max: 500 });
  const centavos = fc.integer({ min: 1, max: 5_000_000 });
  const linhaEstoque = fc
    .tuple(qtd, centavos)
    .map(([q, c]): { linha: LinhaComPreco; cent: number | null } => ({
      linha: { tipo: "estoque", qtd: q, custoUnitarioNaHora: c / 100, orcamentoAceito: false },
      cent: c,
    }));
  const linhaPersonalizavel = fc
    .tuple(qtd, fc.option(centavos, { nil: undefined }), fc.boolean())
    .map(([q, c, aceito]): { linha: LinhaComPreco; cent: number | null } => {
      const aceita = aceito && c !== undefined;
      return {
        linha: { tipo: "personalizavel", qtd: q, custoUnitarioNaHora: null, orcamentoUnitario: c === undefined ? undefined : c / 100, orcamentoAceito: aceita },
        cent: aceita ? c! : null,
      };
    });

  it("o total soma só as linhas com preço, aAvaliar conta as demais e o brl tem vírgula e duas casas", () => {
    fc.assert(
      fc.property(fc.array(fc.oneof(linhaEstoque, linhaPersonalizavel), { maxLength: 12 }), (itens) => {
        const r = totalDasLinhas(itens.map((i) => i.linha));
        const esperado = itens.reduce((s, i) => s + (i.cent === null ? 0 : i.cent * i.linha.qtd), 0);
        expect(Math.round(r.total * 100)).toBe(esperado);
        expect(r.aAvaliar).toBe(itens.filter((i) => i.cent === null).length);
        expect(r.aAvaliar).toBe(itens.filter((i) => i.linha.tipo === "personalizavel" && !i.linha.orcamentoAceito).length);
        expect(brl(r.total)).toMatch(/^R\$ \d{1,3}(\.\d{3})*,\d{2}$/);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("linha sem preço nunca soma zero: só linhas a avaliar dão total 0 e aAvaliar igual ao número de linhas", () => {
    fc.assert(
      fc.property(fc.array(linhaPersonalizavel.filter((i) => i.cent === null), { minLength: 1, maxLength: 6 }), (itens) => {
        expect(totalDasLinhas(itens.map((i) => i.linha))).toEqual({ total: 0, aAvaliar: itens.length });
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 13 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 13: visão do diretor não expõe dados internos de estoque", () => {
  // **Validates: Requirements 3.6, 4.7, 10.8**
  const modelo = base.brindes.find((b) => b.tipo === "estoque")!;
  const faixa = (b: Brinde): "indisponivel" | "ultimas" | "normal" => {
    const s = selos(b);
    return s.indisponivel ? "indisponivel" : s.ultimasUnidades ? "ultimas" : "normal";
  };

  it("a faixa de estoque depende só do Disponivel (saldo − reserva), não do saldo, da reserva nem do mínimo", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 400 }),
        fc.integer({ min: 0, max: 400 }),
        fc.integer({ min: 0, max: 400 }),
        fc.integer({ min: 0, max: 400 }),
        fc.integer({ min: 0, max: 400 }),
        (disp, reservaA, reservaB, minimoA, minimoB) => {
          const a: Brinde = { ...modelo, saldo: disp + reservaA, reserva: reservaA, minimo: minimoA };
          const b: Brinde = { ...modelo, saldo: disp + reservaB, reserva: reservaB, minimo: minimoB };
          expect(disponivel(a)).toBe(disp);
          const esperado = disp === 0 ? "indisponivel" : disp <= 5 ? "ultimas" : "normal";
          expect(faixa(a)).toBe(esperado);
          expect(faixa(b)).toBe(faixa(a));
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 15 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 15: fusão de linhas do Carrinho", () => {
  // **Validates: Requirements 11.5, 11.6**
  const personalizacao = fc.option(
    fc.oneof(
      fc.record({ texto: fc.constantFrom("Ana", "Bia", "Cadu") }),
      fc.record({ arte: fc.constantFrom("a1.png", "a2.png") }),
      fc.record({ texto: fc.constantFrom("Ana", "Bia"), arte: fc.constantFrom("a1.png", "a2.png") }),
    ),
    { nil: undefined },
  );
  const inclusao = fc.record({ brindeId: fc.constantFrom("caneca", "ecobag", "mochila"), qtd: fc.integer({ min: 1, max: 50 }), personalizacao });

  /** Mesma regra do `adicionar` do store: a chave de fusão decide se soma em uma linha existente. */
  type Inclusao = { brindeId: string; qtd: number; personalizacao?: { texto?: string; arte?: string } };
  function incluir(carrinho: Inclusao[], i: Inclusao) {
    const k = chaveDeFusao(i.brindeId, i.personalizacao);
    const igual = carrinho.find((l) => chaveDeFusao(l.brindeId, l.personalizacao) === k);
    if (igual) igual.qtd += i.qtd;
    else carrinho.push({ ...i });
  }
  /** Chave independente do par (brinde, personalização), só para conferir. */
  const par = (b: string, p?: { texto?: string; arte?: string }) => JSON.stringify([b, p?.texto ?? null, p?.arte ?? null]);

  it("no máximo uma linha por par (brinde, personalização) e a soma por par é a soma das inclusões", () => {
    fc.assert(
      fc.property(fc.array(inclusao, { maxLength: 30 }), (inclusoes) => {
        const carrinho: { brindeId: string; qtd: number; personalizacao?: { texto?: string; arte?: string } }[] = [];
        for (const i of inclusoes) incluir(carrinho, i);

        const pares = carrinho.map((l) => par(l.brindeId, l.personalizacao));
        expect(new Set(pares).size).toBe(pares.length);

        const esperado = new Map<string, number>();
        for (const i of inclusoes) esperado.set(par(i.brindeId, i.personalizacao), (esperado.get(par(i.brindeId, i.personalizacao)) ?? 0) + i.qtd);
        expect(carrinho).toHaveLength(esperado.size);
        for (const l of carrinho) expect(l.qtd).toBe(esperado.get(par(l.brindeId, l.personalizacao)));
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 16 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 16: contadores e filtros da vitrine", () => {
  // **Validates: Requirements 2.7, 12.9, 12.10, 12.11**
  const categorias = ["Vestuário", "Escritório", "Casa", "Eventos"];
  const modelo = base.brindes[0];
  const brindeArb = fc
    .record({
      nome: fc.constantFrom("Caneca", "Camiseta", "Mochila", "Bloco", "Squeeze", "Caneta verde", "Boné"),
      categoria: fc.constantFrom(...categorias),
      ativo: fc.boolean(),
      novidade: fc.boolean(),
      custoUnitario: fc.option(fc.integer({ min: 1, max: 100_000 }).map((c) => c / 100), { nil: null }),
    })
    .map((r): Brinde => ({ ...modelo, ...r }));
  const lista = fc.array(brindeArb, { maxLength: 15 }).map((l) => l.map((b, i) => ({ ...b, id: `g${i}`, slug: `g${i}` })));
  const ordem = fc.constantFrom<OrdemVitrine>("novos", "custo", "az");

  it("N brindes acompanha o filtro, Todos soma as categorias e 'menor custo' não decresce entre os com preço", () => {
    fc.assert(
      fc.property(
        lista,
        fc.constantFrom(CATEGORIA_TODOS, ...categorias),
        fc.constantFrom("", "can", "CAM", "é", "zzz", " bo "),
        ordem,
        (brindes, categoria, busca, o) => {
          const cont = contarPorCategoria(brindes);
          expect(cont[0].categoria).toBe(CATEGORIA_TODOS);
          expect(cont[0].total).toBe(cont.slice(1).reduce((s, c) => s + c.total, 0));
          expect(cont[0].total).toBe(brindes.filter((b) => b.ativo).length);

          const filtrada = filtrarBrindes(brindes, categoria, busca, o);
          expect(filtrada.every((b) => b.ativo && (categoria === CATEGORIA_TODOS || b.categoria === categoria))).toBe(true);
          if (busca.trim() === "" && categoria !== CATEGORIA_TODOS) {
            expect(filtrada).toHaveLength(cont.find((c) => c.categoria === categoria)?.total ?? 0);
          }
          if (busca.trim() === "" && categoria === CATEGORIA_TODOS) expect(filtrada).toHaveLength(cont[0].total);

          const custos = filtrarBrindes(brindes, categoria, busca, "custo")
            .map((b) => b.custoUnitario)
            .filter((c): c is number => c !== null);
          for (let i = 1; i < custos.length; i += 1) expect(custos[i]).toBeGreaterThanOrEqual(custos[i - 1]);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 17 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 17: contraste do texto da faixa", () => {
  // **Validates: Requirements 12.8**
  const pares: { cor: string; grande: boolean }[] = [
    { cor: COR_FAIXA_TEXTO, grande: true },
    { cor: COR_FAIXA_DESTAQUE, grande: true },
    { cor: COR_FAIXA_ETIQUETA, grande: false },
    { cor: COR_FAIXA_SUBTITULO, grande: false },
    { cor: COR_FAIXA_TEXTO, grande: false },
  ];

  it("texto grande tem 3:1 ou mais e texto pequeno 4,5:1 ou mais sobre o ponto mais claro e o canto escuro", () => {
    fc.assert(
      fc.property(fc.constantFrom(...pares), fc.constantFrom(COR_FAIXA_FUNDO, COR_FAIXA_CANTO), ({ cor, grande }, fundo) => {
        const minimo = grande ? CONTRASTE_MINIMO_TEXTO_GRANDE : CONTRASTE_MINIMO_TEXTO_PEQUENO;
        expect(razaoDeContraste(cor, fundo)).toBeGreaterThanOrEqual(minimo);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
