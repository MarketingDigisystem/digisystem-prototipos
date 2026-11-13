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
            // Estoque: acima do disponível não é erro (Req. 14.7); só sinaliza acimaDoEstoque.
            expect(r.ok).toBe(qtdValida);
            expect(r.acimaDoEstoque).toBe(qtdValida && q > saldo - reserva);
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
  CATEGORIA_TODOS, contarPorCategoria, disponivel, filtrarBrindes, selosDeEstoque, totalDasLinhas, type LinhaComPreco, type OrdemVitrine,
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

describe("Feature: loja-equilibrio-digiplace, Property 13: a visão do diretor não depende de estoque, exceto pelo aviso booleano", () => {
  // **Validates: Requirements 14.1, 14.2, 14.9, 15.15**
  const estoqueAtivos = base.brindes.filter((b) => b.tipo === "estoque");
  const conjunto = fc
    .tuple(fc.integer({ min: 0, max: 500 }), fc.integer({ min: 0, max: 500 }), fc.integer({ min: 0, max: 500 }))
    .map(([saldo, r, minimo]) => ({ saldo, reserva: Math.min(saldo, r), minimo }));
  const comEstoque = (b: Brinde, c: { saldo: number; reserva: number; minimo: number }): Brinde =>
    b.tipo === "estoque" ? { ...b, ...c } : b;
  const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el).replace(/<[^>]+>/g, "");

  it("selos, preço, ordem da vitrine e inclusão no Carrinho são iguais com quaisquer saldo, reserva e mínimo; só o booleano pode mudar", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...base.brindes),
        conjunto,
        conjunto,
        fc.integer({ min: 1, max: 600 }),
        fc.constantFrom<OrdemVitrine>("novos", "custo", "az"),
        (b, c1, c2, q, ordem) => {
          const v1 = visaoDoBrindeParaDiretor(comEstoque(b, c1), q);
          const v2 = visaoDoBrindeParaDiretor(comEstoque(b, c2), q);
          const { acimaDoEstoque: a1, ...resto1 } = v1;
          const { acimaDoEstoque: a2, ...resto2 } = v2;
          expect(resto1).toEqual(resto2);
          expect(Object.keys(v1).sort()).toEqual(["acimaDoEstoque", "preco", "selos"]);
          expect(typeof a1 === "boolean" && typeof a2 === "boolean").toBe(true);
          expect(Object.keys(v1.selos)).toEqual(["novidade"]);
          expect(JSON.stringify(v1.selos)).not.toMatch(/ltimas|ndispon/);
          // Habilitação da inclusão: nunca depende de saldo (esgotado entra igual).
          expect(validarLinha(comEstoque(b, c1), q).ok).toBe(validarLinha(comEstoque(b, c2), q).ok);
          // Ordem na vitrine.
          const ids = (c: { saldo: number; reserva: number; minimo: number }) =>
            filtrarBrindes(base.brindes.map((x) => comEstoque(x, c)), CATEGORIA_TODOS, "", ordem).map((x) => x.id);
          expect(ids(c1)).toEqual(ids(c2));
          // O booleano acompanha o Disponivel só no brinde de estoque.
          if (b.tipo === "estoque") expect(a1).toBe(q > c1.saldo - c1.reserva);
          else expect(a1).toBe(false);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it("o texto exibido ao diretor para o booleano não carrega número, com qualquer estoque", () => {
    expect(estoqueAtivos.length).toBeGreaterThan(0);
    for (const t of [TEXTO_AVISO_ACIMA_ESTOQUE, TEXTO_AVISO_REPOSICAO, TEXTO_DATA_NAO_GARANTIDA, TEXTO_CIENCIA, MSG_CIENCIA_OBRIGATORIA]) {
      expect(t).not.toMatch(/\d/);
    }
    fc.assert(
      fc.property(fc.constantFrom(...estoqueAtivos), conjunto, fc.integer({ min: 1, max: 600 }), (b, c, q) => {
        const acima = visaoDoBrindeParaDiretor(comEstoque(b, c), q).acimaDoEstoque;
        const aviso = html(createElement(AvisoAcimaDoEstoque, { visivel: acima, reservar: true }));
        expect(aviso).toBe(acima ? TEXTO_AVISO_ACIMA_ESTOQUE : "");
        expect(aviso).not.toMatch(/\d/);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("a faixa de estoque da GESTÃO depende só do Disponivel (saldo − reserva), não do saldo, da reserva nem do mínimo", () => {
    const modelo = base.brindes.find((b) => b.tipo === "estoque")!;
    const faixa = (b: Brinde): "indisponivel" | "ultimas" | "normal" => {
      const s = selosDeEstoque(b);
      return s.indisponivel ? "indisponivel" : s.ultimasUnidades ? "ultimas" : "normal";
    };
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
  const inclusao = fc.record({ brindeId: fc.constantFrom("copo-termico", "kit-churrasco", "caderno-bambu"), qtd: fc.integer({ min: 1, max: 50 }), personalizacao });

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
      nome: fc.constantFrom("Copo", "Caderno", "Caderneta", "Kit", "Caneta verde", "Boné", "Estojo"),
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

/* ================================================================ */
/* Property 4 (substituída na 5ª rodada, tarefa 15.2)                 */
/* ================================================================ */

import { criarPedido, mudarEstado as mudarEstadoReg, reservarReposicao } from "./regras";

describe("Feature: loja-equilibrio-digiplace, Property 4: pedido acima do disponível é aceito com ciência e reserva parcial", () => {
  // **Validates: Requirements 4.3, 4.4, 14.7, 14.9, 15.1, 15.2**
  const estoque = base.brindes.filter((b) => b.tipo === "estoque" && b.ativo);
  const dados = { solicitanteId: "d1", finalidade: "Teste de propriedade" };
  const item = fc.record({ brindeId: fc.constantFrom(...estoque.map((b) => b.id)), qtd: fc.integer({ min: 1, max: 400 }) });

  it("reserva min(qtd, disponível corrente) por linha, pendente = resto, e o invariante saldo >= reserva >= 0 se mantém", () => {
    fc.assert(
      fc.property(fc.array(item, { minLength: 1, maxLength: 5 }), (itens) => {
        const e = criarPedido(base, dados, itens, true);
        const p = e.pedidos.at(-1)!;
        const restante = new Map(base.brindes.map((b) => [b.id, b.saldo - b.reserva]));
        p.linhas.forEach((l, i) => {
          const disp = Math.max(0, restante.get(l.brindeId)!);
          const esperado = Math.min(itens[i].qtd, disp);
          expect(l.qtdReservada).toBe(esperado);
          expect(l.qtdPendente).toBe(itens[i].qtd - esperado);
          expect(l.acimaDoEstoque).toBe(l.qtdPendente > 0);
          restante.set(l.brindeId, disp - esperado);
        });
        expect(p.acimaDoEstoque).toBe(p.linhas.some((l) => l.qtdPendente > 0));
        for (const b of e.brindes) {
          expect(b.reserva).toBeGreaterThanOrEqual(0);
          expect(b.saldo).toBeGreaterThanOrEqual(b.reserva);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("sem ciência só falha quando alguma linha ficou acima do estoque, com a mensagem exata e sem alterar a entrada", () => {
    fc.assert(
      fc.property(fc.array(item, { minLength: 1, maxLength: 5 }), (itens) => {
        const com = criarPedido(base, dados, itens, true);
        const acima = com.pedidos.at(-1)!.acimaDoEstoque;
        if (acima) {
          expect(() => criarPedido(base, dados, itens, false)).toThrow("Marque a ciência de que o prazo será maior para enviar este pedido.");
        } else {
          expect(criarPedido(base, dados, itens, false).pedidos.at(-1)!.cienteAcimaEstoque).toBe(false);
        }
        expect(base.pedidos).toHaveLength(ESTADO_INICIAL.pedidos.length);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("recusar devolve exatamente o reservado e reservar a reposição nunca passa do saldo", () => {
    fc.assert(
      fc.property(fc.array(item, { minLength: 1, maxLength: 4 }), fc.integer({ min: 1, max: 300 }), (itens, entrada) => {
        const criado = criarPedido(base, dados, itens, true);
        const id = criado.pedidos.at(-1)!.id;
        const recusado = mudarEstadoReg(criado, id, "recusada", "g1", "Teste");
        for (const b of base.brindes) {
          expect(recusado.brindes.find((x) => x.id === b.id)!.reserva).toBe(b.reserva);
        }
        let e = criado;
        const ids = [...new Set(itens.map((i) => i.brindeId))];
        e = { ...e, brindes: e.brindes.map((b) => (ids.includes(b.id) ? { ...b, saldo: b.saldo + entrada } : b)) };
        e.pedidos.at(-1)!.linhas.forEach((l, i) => {
          if (l.qtdPendente <= 0) return;
          try {
            e = reservarReposicao(e, id, i, "g1");
          } catch {
            /* sem disponível: tudo bem */
          }
        });
        for (const b of e.brindes) expect(b.saldo).toBeGreaterThanOrEqual(b.reserva);
        const reservaPorBrinde = new Map<string, number>();
        for (const p of e.pedidos.filter((x) => ["solicitada", "em_alinhamento", "pronto"].includes(x.estado))) {
          for (const l of p.linhas) reservaPorBrinde.set(l.brindeId, (reservaPorBrinde.get(l.brindeId) ?? 0) + l.qtdReservada);
        }
        for (const b of e.brindes.filter((x) => x.tipo === "estoque")) expect(b.reserva).toBe(reservaPorBrinde.get(b.id) ?? 0);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ================================================================ */
/* Properties 1, 2, 4 (estado intocado), 9, 18 a 22 (tarefa 15.5)    */
/* ================================================================ */

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AvisoAcimaDoEstoque, AvisoDeReposicao } from "./AvisoAcimaDoEstoque";
import {
  MSG_CIENCIA_OBRIGATORIA, TEXTO_AVISO_ACIMA_ESTOQUE, TEXTO_AVISO_REPOSICAO, TEXTO_CIENCIA, TEXTO_DATA_NAO_GARANTIDA,
} from "./avisos";
import { aguardaReposicao, visaoDoBrindeParaDiretor } from "./visaoDiretor";
import { metricasDoPeriodo, registrarAjuste, registrarEntrada } from "./regras";
import type { Estado, LinhaPedido, Pedido } from "./tipos";

const ATIVOS: EstadoPedido[] = ["solicitada", "em_alinhamento", "pronto"];
const IDS_ESTOQUE = base.brindes.filter((b) => b.tipo === "estoque").map((b) => b.id);
const IDS_PERSONALIZAVEL = base.brindes.filter((b) => b.tipo === "personalizavel").map((b) => b.id);
const IDS_ATIVOS = base.brindes.filter((b) => b.ativo).map((b) => b.id);
const dadosPedido = { solicitanteId: "d1", finalidade: "Teste de propriedade" };
const ultimoPedido = (e: Estado): Pedido => e.pedidos[e.pedidos.length - 1];
const semTags = (m: string) => m.replace(/<[^>]+>/g, "");

/** Invariantes do modelo com reserva parcial (Property 1) mais a coerência das linhas. */
function conferirInvariantes(e: Estado): void {
  const reservaEsperada = new Map<string, number>();
  for (const p of e.pedidos) {
    for (const l of p.linhas) {
      if (l.tipo === "personalizavel") {
        expect([l.qtdReservada, l.qtdPendente, l.acimaDoEstoque]).toEqual([0, 0, false]);
        continue;
      }
      expect(l.qtdReservada).toBeGreaterThanOrEqual(0);
      expect(l.qtdPendente).toBeGreaterThanOrEqual(0);
      expect(l.acimaDoEstoque).toBe(l.qtdPendente > 0);
      if (ATIVOS.includes(p.estado)) {
        expect(l.qtdReservada + l.qtdPendente).toBe(l.qtd);
        reservaEsperada.set(l.brindeId, (reservaEsperada.get(l.brindeId) ?? 0) + l.qtdReservada);
      }
    }
    expect(p.acimaDoEstoque).toBe(p.linhas.some((l) => l.qtdPendente > 0));
  }
  for (const b of e.brindes.filter((x) => x.tipo === "estoque")) {
    expect(b.reserva).toBeGreaterThanOrEqual(0);
    expect(b.saldo).toBeGreaterThanOrEqual(b.reserva);
    expect(b.reserva).toBe(reservaEsperada.get(b.id) ?? 0);
  }
}

/* Operações aleatórias sobre o estado (as que a regra recusa deixam o estado como estava). */
type Op =
  | { k: "criar"; itens: { brindeId: string; qtd: number }[]; ciente: boolean }
  | { k: "mudar"; i: number; alvo: EstadoPedido; motivo: string }
  | { k: "repor"; i: number; l: number }
  | { k: "ajustar"; i: number; l: number; qtd: number }
  | { k: "entrada"; b: string; qtd: number }
  | { k: "ajusteEstoque"; b: string; delta: number };

const itemArb = fc.record({ brindeId: fc.constantFrom(...IDS_ATIVOS), qtd: fc.integer({ min: 1, max: 300 }) });
const opArb: fc.Arbitrary<Op> = fc.oneof(
  fc.record({ k: fc.constant("criar" as const), itens: fc.array(itemArb, { minLength: 1, maxLength: 4 }), ciente: fc.boolean() }),
  fc.record({ k: fc.constant("mudar" as const), i: fc.nat(40), alvo: fc.constantFrom(...ESTADOS), motivo: fc.constantFrom("", "Motivo de teste") }),
  fc.record({ k: fc.constant("repor" as const), i: fc.nat(40), l: fc.nat(4) }),
  fc.record({ k: fc.constant("ajustar" as const), i: fc.nat(40), l: fc.nat(4), qtd: fc.integer({ min: -2, max: 400 }) }),
  fc.record({ k: fc.constant("entrada" as const), b: fc.constantFrom(...IDS_ESTOQUE), qtd: fc.integer({ min: 1, max: 300 }) }),
  fc.record({ k: fc.constant("ajusteEstoque" as const), b: fc.constantFrom(...IDS_ESTOQUE), delta: fc.integer({ min: -200, max: 200 }) }),
);

function aplicar(e: Estado, op: Op): Estado {
  const pedido = e.pedidos.length > 0 ? e.pedidos[(op.k === "criar" || op.k === "entrada" || op.k === "ajusteEstoque" ? 0 : op.i) % e.pedidos.length] : undefined;
  try {
    switch (op.k) {
      case "criar": return criarPedido(e, dadosPedido, op.itens, op.ciente);
      case "mudar": return pedido ? mudarEstado(e, pedido.id, op.alvo, "g1", op.motivo) : e;
      case "repor": return pedido ? reservarReposicao(e, pedido.id, op.l, "g1") : e;
      case "ajustar": return pedido ? ajustarQuantidadeLinha(e, pedido.id, op.l, op.qtd, "g1", "Ajuste de teste") : e;
      case "entrada": return registrarEntrada(e, op.b, op.qtd, "g1");
      case "ajusteEstoque": return registrarAjuste(e, op.b, op.delta, "g1", "Ajuste de teste");
    }
  } catch {
    return e;
  }
}

/** Estado sintético: só estes pedidos, e cada brinde de estoque com saldo = reservado dos ativos + disponível `disp`. */
interface Spec { brindeId: string; res: number; pend: number }
const specArb: fc.Arbitrary<Spec> = fc
  .record({ brindeId: fc.constantFrom(...IDS_ESTOQUE), res: fc.integer({ min: 0, max: 60 }), pend: fc.integer({ min: 0, max: 60 }) })
  .map((s) => (s.res + s.pend === 0 ? { ...s, res: 1 } : s));
const specsArb = fc.array(specArb, { minLength: 1, maxLength: 4 });

function pedidoDe(id: string, estado: EstadoPedido, specs: Spec[]): Pedido {
  const linhas: LinhaPedido[] = specs.map((s) => ({
    brindeId: s.brindeId, qtd: s.res + s.pend, tipo: "estoque", qtdReservada: s.res, qtdPendente: s.pend,
    acimaDoEstoque: s.pend > 0, custoUnitarioNaHora: 10, orcamentoAceito: false,
  }));
  return {
    id, solicitanteId: "d1", areaSolicitante: "Comercial", finalidade: "Pedido sintético", linhas, estado,
    historico: [{ estado: "solicitada", quem: "d1", em: base.agora }],
    acimaDoEstoque: linhas.some((l) => l.qtdPendente > 0), cienteAcimaEstoque: true,
  };
}

function estadoSintetico(pedidos: { estado: EstadoPedido; specs: Spec[] }[], disp = 0): Estado {
  const d = structuredClone(base);
  d.pedidos = pedidos.map((p, i) => pedidoDe(`PX-${i + 1}`, p.estado, p.specs));
  d.movimentacoes = [];
  const reservado = new Map<string, number>();
  for (const p of d.pedidos) {
    if (!ATIVOS.includes(p.estado)) continue;
    for (const l of p.linhas) reservado.set(l.brindeId, (reservado.get(l.brindeId) ?? 0) + l.qtdReservada);
  }
  for (const b of d.brindes) {
    if (b.tipo !== "estoque") continue;
    b.reserva = reservado.get(b.id) ?? 0;
    b.saldo = b.reserva + disp;
  }
  return d;
}

/* ---------------------------- Property 1 ---------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 1: invariante de estoque por brinde", () => {
  // **Validates: Requirements 4.3, 4.4, 4.5, 11.1, 11.7, 15.2**
  it("o mock de partida já respeita o invariante", () => {
    conferirInvariantes(base);
  });

  it("saldo >= reserva >= 0 e reserva = soma de qtdReservada dos pedidos ativos, depois de qualquer sequência de operações", () => {
    fc.assert(
      fc.property(fc.array(opArb, { minLength: 1, maxLength: 25 }), (ops) => {
        let e = base;
        for (const op of ops) {
          e = aplicar(e, op);
          conferirInvariantes(e);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 2 ---------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 2: reserva, baixa e liberação por brinde", () => {
  // **Validates: Requirements 4.1, 4.2, 8.2**
  const itensEstoque = fc.array(
    fc.record({ brindeId: fc.constantFrom(...IDS_ESTOQUE), qtd: fc.integer({ min: 1, max: 300 }) }),
    { minLength: 1, maxLength: 4 },
  );
  const somaPorBrinde = (p: Pedido, campo: "qtdReservada" | "qtd") => {
    const m = new Map<string, number>();
    for (const l of p.linhas) m.set(l.brindeId, (m.get(l.brindeId) ?? 0) + l[campo]);
    return m;
  };
  const reservaDe = (e: Estado, id: string) => e.brindes.find((b) => b.id === id)!.reserva;
  const saldoDe = (e: Estado, id: string) => e.brindes.find((b) => b.id === id)!.saldo;

  it("criar sobe a reserva pela soma das qtdReservada; recusar ou cancelar desce só o reservado e não mexe no saldo", () => {
    fc.assert(
      fc.property(itensEstoque, fc.constantFrom<EstadoPedido>("recusada", "cancelada"), fc.boolean(), (itens, alvo, passaPorPreparacao) => {
        const criado = criarPedido(base, dadosPedido, itens, true);
        const p = ultimoPedido(criado);
        for (const [id, soma] of somaPorBrinde(p, "qtdReservada")) expect(reservaDe(criado, id)).toBe(reservaDe(base, id) + soma);

        const antes = passaPorPreparacao ? mudarEstado(criado, p.id, "em_alinhamento", "g1") : criado;
        const depois = mudarEstado(antes, p.id, alvo, "g1", "Motivo de teste");
        for (const id of somaPorBrinde(p, "qtdReservada").keys()) {
          expect(reservaDe(depois, id)).toBe(reservaDe(base, id));
          expect(saldoDe(depois, id)).toBe(saldoDe(criado, id));
        }
        expect(depois.movimentacoes).toHaveLength(criado.movimentacoes.length);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("retirar baixa o saldo e a reserva pela quantidade inteira e grava uma saída por linha", () => {
    fc.assert(
      fc.property(itensEstoque, (itens) => {
        let e = criarPedido(base, dadosPedido, itens, true);
        const id = ultimoPedido(e).id;
        for (const brindeId of new Set(itens.map((i) => i.brindeId))) e = registrarEntrada(e, brindeId, 5000, "g1", "Reposição de teste");
        ultimoPedido(e).linhas.forEach((l, i) => {
          if (l.qtdPendente > 0) e = reservarReposicao(e, id, i, "g1");
        });
        e = mudarEstado(mudarEstado(e, id, "em_alinhamento", "g1"), id, "pronto", "g1");
        const antes = e;
        const p = antes.pedidos.find((x) => x.id === id)!;
        const depois = mudarEstado(antes, id, "encerrada", "g1");

        const total = somaPorBrinde(p, "qtd");
        for (const [brindeId, soma] of total) {
          expect(somaPorBrinde(p, "qtdReservada").get(brindeId)).toBe(soma);
          expect(reservaDe(depois, brindeId)).toBe(reservaDe(antes, brindeId) - soma);
          expect(saldoDe(depois, brindeId)).toBe(saldoDe(antes, brindeId) - soma);
          const saidas = depois.movimentacoes.filter((m) => m.pedidoId === id && m.tipo === "saida" && m.brindeId === brindeId);
          expect(saidas.reduce((s, m) => s + m.qtd, 0)).toBe(soma);
          expect(saidas).toHaveLength(p.linhas.filter((l) => l.brindeId === brindeId).length);
        }
        conferirInvariantes(depois);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ------------------- Property 4 (estado intocado) ------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 4: pedido acima do disponível é aceito com ciência e reserva parcial (sem ciência nada muda)", () => {
  // **Validates: Requirements 14.7, 14.8, 14.9, 14.10, 14.11, 15.1, 15.2**
  it("a recusa por falta de ciência não altera o estado de entrada nem cria reserva", () => {
    const itens = fc.array(
      fc.record({ brindeId: fc.constantFrom(...IDS_ESTOQUE), qtd: fc.integer({ min: 1, max: 600 }) }),
      { minLength: 1, maxLength: 5 },
    );
    fc.assert(
      fc.property(itens, (lista) => {
        const snapshot = structuredClone(base);
        let falhou = false;
        try {
          criarPedido(base, dadosPedido, lista, false);
        } catch (erro) {
          falhou = true;
          expect((erro as Error).message).toBe(MSG_CIENCIA_OBRIGATORIA);
        }
        expect(falhou).toBe(criarPedido(base, dadosPedido, lista, true).pedidos.at(-1)!.acimaDoEstoque);
        expect(base).toEqual(snapshot);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 9 ---------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 9: linha personalizável não reserva", () => {
  // **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.9**
  const itens = fc.array(
    fc.record({ brindeId: fc.constantFrom(...IDS_ATIVOS), qtd: fc.integer({ min: 1, max: 300 }) }),
    { minLength: 1, maxLength: 4 },
  );
  const estoqueDe = (e: Estado) => e.brindes.map((b) => [b.id, b.saldo, b.reserva]);

  it("o mock tem ao menos um brinde personalizável ativo", () => {
    expect(IDS_PERSONALIZAVEL.length).toBeGreaterThan(0);
  });

  it("as linhas personalizáveis ficam em 0, 0 e falso e não mexem em saldo nem em reserva em toda a vida do pedido", () => {
    fc.assert(
      fc.property(itens, fc.integer({ min: 1, max: 400 }), fc.integer({ min: 1, max: 900 }), (lista, novaQtd, valor) => {
        const comPers = [...lista, { brindeId: IDS_PERSONALIZAVEL[0], qtd: 3 }];
        const criado = criarPedido(base, dadosPedido, comPers, true);
        const id = ultimoPedido(criado).id;

        // A reserva por linha de personalizável é sempre zero logo na criação.
        const linhasPers = ultimoPedido(criado).linhas.map((l, i) => ({ l, i })).filter((x) => x.l.tipo === "personalizavel");
        expect(linhasPers.length).toBeGreaterThan(0);
        for (const { l } of linhasPers) expect([l.qtdReservada, l.qtdPendente, l.acimaDoEstoque]).toEqual([0, 0, false]);

        // Ajuste de quantidade, reposição, orçamento, aceite e estados seguintes não tocam o estoque.
        let e = criado;
        const fotografia = () => estoqueDe(e);
        for (const { i } of linhasPers) {
          const antes = fotografia();
          e = ajustarQuantidadeLinha(e, id, i, novaQtd, "g1", "Ajuste de teste");
          expect(fotografia()).toEqual(antes);
          expect(() => reservarReposicao(e, id, i, "g1")).toThrow();
          const l = e.pedidos.find((p) => p.id === id)!.linhas[i];
          expect([l.qtdReservada, l.qtdPendente, l.acimaDoEstoque]).toEqual([0, 0, false]);
        }
        conferirInvariantes(e);

        // Um pedido só com personalizável percorre o fluxo inteiro sem alterar saldo, reserva nem movimentações.
        let s = criarPedido(base, dadosPedido, [{ brindeId: IDS_PERSONALIZAVEL[0], qtd: novaQtd }], false);
        const sid = ultimoPedido(s).id;
        expect(estoqueDe(s)).toEqual(estoqueDe(base));
        s = mudarEstado(s, sid, "em_alinhamento", "g1");
        s = informarOrcamento(s, sid, 0, valor, "g1");
        s = aceitarOrcamento(s, sid, 0, "d1");
        s = mudarEstado(s, sid, "pronto", "g1");
        s = mudarEstado(s, sid, "encerrada", "g1");
        expect(estoqueDe(s)).toEqual(estoqueDe(base));
        expect(s.movimentacoes).toHaveLength(base.movimentacoes.length);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 18 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 18: pronto para retirada exige pendente zero", () => {
  // **Validates: Requirements 15.9, 15.10**
  it("pronto só passa com todas as linhas sem pendente; com pendente a transição falha citando Em preparação e nada muda", () => {
    fc.assert(
      fc.property(specsArb, fc.integer({ min: 0, max: 30 }), (specs, disp) => {
        const e = estadoSintetico([{ estado: "em_alinhamento", specs }], disp);
        const snapshot = structuredClone(e);
        const semPendente = specs.every((s) => s.pend === 0);
        if (semPendente) {
          const depois = mudarEstado(e, "PX-1", "pronto", "g1");
          const p = depois.pedidos[0];
          expect(p.estado).toBe("pronto");
          for (const l of p.linhas) expect(l.qtdReservada).toBe(l.qtd);
          conferirInvariantes(depois);
        } else {
          let mensagem = "";
          try {
            mudarEstado(e, "PX-1", "pronto", "g1");
          } catch (erro) {
            mensagem = (erro as Error).message;
          }
          expect(mensagem).toContain(`"${ROTULO_ESTADO.em_alinhamento}"`);
        }
        expect(e).toEqual(snapshot);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("depois de reservar toda a reposição o pedido passa a pronto com qtdReservada igual a qtd", () => {
    fc.assert(
      fc.property(specsArb, (specs) => {
        let e = estadoSintetico([{ estado: "em_alinhamento", specs }], 0);
        e.brindes.filter((b) => b.tipo === "estoque").forEach((b) => (b.saldo += 5000));
        e.pedidos[0].linhas.forEach((l, i) => {
          if (l.qtdPendente > 0) e = reservarReposicao(e, "PX-1", i, "g1");
        });
        const pronto = mudarEstado(e, "PX-1", "pronto", "g1");
        for (const l of pronto.pedidos[0].linhas) expect(l.qtdReservada).toBe(l.qtd);
        conferirInvariantes(pronto);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 19 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 19: recusar ou cancelar libera somente o reservado", () => {
  // **Validates: Requirements 4.5, 15.13**
  const motivoArb = fc.stringMatching(/^[a-z]{1,10}$/);

  it("a reserva desce pela soma das qtdReservada, o saldo não muda e o pendente é descartado", () => {
    fc.assert(
      fc.property(specsArb, fc.constantFrom<EstadoPedido>("solicitada", "em_alinhamento", "pronto"), fc.constantFrom<EstadoPedido>("recusada", "cancelada"), motivoArb, fc.integer({ min: 0, max: 30 }),
        (specsBrutos, estado, alvoBruto, motivo, disp) => {
          // Em "pronto" não há pendente e só cancelar é possível.
          const specs = estado === "pronto" ? specsBrutos.map((s) => ({ ...s, res: s.res + s.pend, pend: 0 })) : specsBrutos;
          const alvo = estado === "pronto" ? "cancelada" : alvoBruto;
          const e = estadoSintetico([{ estado, specs }], disp);
          const depois = mudarEstado(e, "PX-1", alvo, "g1", motivo);

          const liberado = new Map<string, number>();
          for (const s of specs) liberado.set(s.brindeId, (liberado.get(s.brindeId) ?? 0) + s.res);
          for (const b of e.brindes.filter((x) => x.tipo === "estoque")) {
            const novo = depois.brindes.find((x) => x.id === b.id)!;
            expect(novo.reserva).toBe(b.reserva - (liberado.get(b.id) ?? 0));
            expect(novo.saldo).toBe(b.saldo);
          }
          for (const l of depois.pedidos[0].linhas) expect([l.qtdReservada, l.qtdPendente, l.acimaDoEstoque]).toEqual([0, 0, false]);
          expect(depois.pedidos[0].acimaDoEstoque).toBe(false);
          conferirInvariantes(depois);
        }),
      { numRuns: NUM_RUNS },
    );
  });

  it("sem motivo a transição falha e nada muda", () => {
    fc.assert(
      fc.property(specsArb, fc.constantFrom<EstadoPedido>("recusada", "cancelada"), fc.constantFrom("", " ", "   "), (specs, alvo, motivo) => {
        const e = estadoSintetico([{ estado: "solicitada", specs }], 3);
        const snapshot = structuredClone(e);
        expect(() => mudarEstado(e, "PX-1", alvo, "g1", motivo)).toThrow("Informe o motivo.");
        expect(e).toEqual(snapshot);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 20 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 20: reservarReposicao nunca ultrapassa o disponível", () => {
  // **Validates: Requirements 15.2, 15.6, 15.7, 15.8**
  const linhaComPendente = fc
    .record({ brindeId: fc.constantFrom(...IDS_ESTOQUE), res: fc.integer({ min: 0, max: 40 }), pend: fc.integer({ min: 1, max: 80 }) });

  it("soma min(pendente, disponível), mantém qtd = reservada + pendente e nunca passa do saldo", () => {
    fc.assert(
      fc.property(linhaComPendente, fc.constantFrom<EstadoPedido>("solicitada", "em_alinhamento"), fc.integer({ min: 0, max: 120 }), (spec, estado, disp) => {
        const e = estadoSintetico([{ estado, specs: [spec] }], disp);
        const snapshot = structuredClone(e);
        const antesBrinde = e.brindes.find((b) => b.id === spec.brindeId)!;
        if (disp === 0) {
          expect(() => reservarReposicao(e, "PX-1", 0, "g1")).toThrow("Não há estoque disponível para reservar.");
          expect(e).toEqual(snapshot);
          return;
        }
        const n = Math.min(spec.pend, disp);
        const depois = reservarReposicao(e, "PX-1", 0, "g1");
        const l = depois.pedidos[0].linhas[0];
        const b = depois.brindes.find((x) => x.id === spec.brindeId)!;
        expect(l.qtdReservada).toBe(spec.res + n);
        expect(l.qtdPendente).toBe(spec.pend - n);
        expect(l.qtdReservada + l.qtdPendente).toBe(l.qtd);
        expect(l.acimaDoEstoque).toBe(spec.pend - n > 0);
        expect(b.reserva).toBe(antesBrinde.reserva + n);
        expect(b.reserva).toBeLessThanOrEqual(b.saldo);
        expect(depois.pedidos[0].acimaDoEstoque).toBe(l.qtdPendente > 0);
        expect(e).toEqual(snapshot);
        // Idempotente quando o pendente chegou a zero: repetir falha e não muda nada.
        if (l.qtdPendente === 0) {
          const antes2 = structuredClone(depois);
          expect(() => reservarReposicao(depois, "PX-1", 0, "g1")).toThrow("Esta linha não tem quantidade pendente.");
          expect(depois).toEqual(antes2);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("fora de Recebido e Em preparação a reserva é recusada e nada muda", () => {
    fc.assert(
      fc.property(linhaComPendente, fc.constantFrom<EstadoPedido>("pronto", "encerrada", "recusada", "cancelada"), (spec, estado) => {
        const e = estadoSintetico([{ estado, specs: [spec] }], 50);
        const snapshot = structuredClone(e);
        expect(() => reservarReposicao(e, "PX-1", 0, "g1")).toThrow();
        expect(e).toEqual(snapshot);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 21 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 21: aviso de reposição ao diretor depende só do pendente", () => {
  // **Validates: Requirements 15.15, 15.16**
  it("o aviso aparece se e somente se o estado é Recebido ou Em preparação e há pendente; o texto é a constante, sem número", () => {
    fc.assert(
      fc.property(specsArb, fc.constantFrom(...ESTADOS), (specs, estado) => {
        const e = estadoSintetico([{ estado, specs }], 0);
        const p = e.pedidos[0];
        const esperado = (estado === "solicitada" || estado === "em_alinhamento") && specs.some((s) => s.pend > 0);
        expect(aguardaReposicao(p)).toBe(esperado);
        const marcacao = renderToStaticMarkup(createElement(AvisoDeReposicao, { visivel: aguardaReposicao(p) }));
        if (esperado) {
          expect(semTags(marcacao)).toBe(TEXTO_AVISO_REPOSICAO);
          expect(semTags(marcacao)).not.toMatch(/\d/);
        } else {
          expect(marcacao).toBe("");
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("ao zerar o pendente de todas as linhas o aviso deixa de ser exibido", () => {
    fc.assert(
      fc.property(specsArb, fc.constantFrom<EstadoPedido>("solicitada", "em_alinhamento"), (specs, estado) => {
        let e = estadoSintetico([{ estado, specs }], 0);
        e.brindes.filter((b) => b.tipo === "estoque").forEach((b) => (b.saldo += 5000));
        e.pedidos[0].linhas.forEach((l, i) => {
          if (l.qtdPendente > 0) e = reservarReposicao(e, "PX-1", i, "g1");
        });
        expect(aguardaReposicao(e.pedidos[0])).toBe(false);
        expect(renderToStaticMarkup(createElement(AvisoDeReposicao, { visivel: aguardaReposicao(e.pedidos[0]) }))).toBe("");
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

/* ---------------------------- Property 22 --------------------------- */

describe("Feature: loja-equilibrio-digiplace, Property 22: métricas de pendência somam as linhas abertas", () => {
  // **Validates: Requirements 15.17**
  it("pedidosAcimaDoEstoque e unidadesPendentes batem com a soma das linhas dos pedidos em Recebido e Em preparação", () => {
    const pedidoArb = fc.record({ estado: fc.constantFrom(...ESTADOS), specs: specsArb });
    fc.assert(
      fc.property(fc.array(pedidoArb, { maxLength: 10 }), (pedidos) => {
        const e = estadoSintetico(pedidos, 2);
        const m = metricasDoPeriodo(e, "2026-11");
        const abertos = e.pedidos.filter((p) => (p.estado === "solicitada" || p.estado === "em_alinhamento") && p.linhas.some((l) => l.qtdPendente > 0));
        expect(m.pedidosAcimaDoEstoque).toBe(abertos.length);
        expect(m.unidadesPendentes).toBe(abertos.reduce((s, p) => s + p.linhas.reduce((n, l) => n + l.qtdPendente, 0), 0));
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("o mock tem 2 pedidos abertos acima do estoque e 170 unidades pendentes", () => {
    const m = metricasDoPeriodo(base, "2026-11");
    expect([m.pedidosAcimaDoEstoque, m.unidadesPendentes]).toEqual([2, 170]);
  });
});
