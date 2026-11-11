/* PROTÓTIPO DESCARTÁVEL — não é o app. Teste mínimo da máquina em memória (Requisito 8). */
import { describe, expect, it } from "vitest";
import { acoesPermitidas, avaliarTransicao, etapaDaLinhaDoTempo, TRANSICOES } from "./maquina";

const base = { todasLinhasProntas: true, temOrcamentoAceito: false };

describe("máquina do pedido (protótipo)", () => {
  it("tem 8 transições e nenhuma sai de estado final", () => {
    expect(TRANSICOES).toHaveLength(8);
    expect(TRANSICOES.some((t) => ["encerrada", "recusada", "cancelada"].includes(t.de))).toBe(false);
  });

  it("recusa transição fora do diagrama", () => {
    const r = avaliarTransicao({ ...base, estado: "solicitada", acao: "encerrar", ator: "equipe" });
    expect(r.ok).toBe(false);
  });

  it("exige motivo para recusar e cancelar", () => {
    expect(avaliarTransicao({ ...base, estado: "solicitada", acao: "recusar", ator: "equipe" }).ok).toBe(false);
    expect(avaliarTransicao({ ...base, estado: "solicitada", acao: "recusar", ator: "equipe", motivo: "Sem verba" }).ok).toBe(true);
  });

  it("só marca pronto com todas as linhas prontas", () => {
    const r = avaliarTransicao({ ...base, estado: "em_alinhamento", acao: "marcar_pronto", ator: "equipe", todasLinhasProntas: false });
    expect(r.ok).toBe(false);
  });

  it("diretor não cancela com orçamento aceito", () => {
    const r = avaliarTransicao({ ...base, estado: "em_alinhamento", acao: "cancelar", ator: "solicitante", motivo: "x", temOrcamentoAceito: true });
    expect(r.ok).toBe(false);
    expect(acoesPermitidas("em_alinhamento", "solicitante", { temOrcamentoAceito: true })).toEqual([]);
  });

  it("recusada e cancelada viram etapa final do desvio", () => {
    expect(etapaDaLinhaDoTempo("recusada")).toEqual({ etapa: "encerrada", desvio: "recusada" });
  });
});
