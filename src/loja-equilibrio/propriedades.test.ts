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
          const v = { ...original.variacoes[0], saldo, reserva };
          const b: Brinde = { ...original, variacoes: [v, ...original.variacoes.slice(1)] };
          const r = validarLinha(b, v, q);
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
