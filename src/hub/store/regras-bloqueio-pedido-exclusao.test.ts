/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/store/regras.ts + src/hub/store/tipos.ts @ leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: .kiro/specs/kanban-asana-hub (Task 7.8).
 *
 * Testes UNITÁRIOS (exemplos reais, não property) das três travas de ação:
 *  - validarMotivo .......... motivo obrigatório ≥5 chars (Requirements 9.4)
 *  - podeMarcarBloqueado .... K9: post em aprovação não vira bloqueado (9.4)
 *  - podeDecidirPedido ...... trava de autoria: autor não decide (Requirements 9.5)
 *  - podeExcluirItem ........ item com post na subárvore não é excluído (9.9)
 *
 * Cada caso monta um DadosHub mínimo e legível, exercita a regra e confere
 * tanto o `ok` quanto — nos casos barrados — que vem um `motivo` não vazio.
 */
import { describe, expect, it } from "vitest";

import {
  podeDecidirPedido,
  podeExcluirItem,
  podeMarcarBloqueado,
  validarMotivo,
} from "./regras";
import type {
  Card,
  DadosHub,
  Historico,
  Marca,
  Pedido,
  Post,
  PostEstado,
  Problema,
  Solicitante,
  Subtarefa,
} from "./tipos";

// ─── Fábricas mínimas e legíveis ────────────────────────────────────────────

const AGORA = "2026-10-08T12:00:00.000Z";

/** DadosHub só com o que cada caso precisa; o resto vem vazio. */
function montarDados(parcial: Partial<DadosHub>): DadosHub {
  return {
    usuarios: [],
    solicitantes: [],
    etiquetas: [],
    cards: [],
    subtarefas: [],
    comentarios: [],
    posts: [],
    problemas: [],
    decisoes: [],
    tendencias: [],
    concorrentes: [],
    swot: [],
    swotAnalisadoEm: new Date(0).toISOString(),
    marca: {} as Marca,
    webhooks: [],
    prompts: [],
    camposAgente: { kicker: false, titulo: false, subtitulo: false },
    historico: { pedidos: [], entregas: [], problemas: [] } as Historico,
    ...parcial,
  };
}

function card(over: Partial<Card> = {}): Card {
  return {
    id: "card-1",
    titulo: "Campanha de lançamento",
    descricao: "",
    etiquetas: [],
    origem: "manual",
    colunaBase: "afazer",
    criadoPor: "u-ana",
    criadoEm: AGORA,
    ...over,
  };
}

function subtarefa(over: Partial<Subtarefa> = {}): Subtarefa {
  return {
    id: "sub-1",
    cardId: "card-1",
    titulo: "Escrever a legenda",
    ordem: 0,
    criadoEm: AGORA,
    ...over,
  };
}

function post(estado: PostEstado, over: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    titulo: "Post do lançamento",
    tituloArte: "Lançamento",
    subtituloArte: "",
    legenda: "",
    hashtags: [],
    redes: ["instagram"],
    ctas: [],
    segmento: "",
    formato: "Post",
    template: "A",
    estado,
    autorId: "u-ana",
    criadoEm: AGORA,
    atualizadoEm: AGORA,
    arteUrl: "",
    ...over,
  };
}

function problemaBloqueado(alvo: Problema["alvo"], over: Partial<Problema> = {}): Problema {
  return {
    id: "prob-1",
    tipo: "bloqueado",
    alvo,
    cardId: "card-1",
    motivo: "Aguardando material do cliente.",
    abertoPor: "u-ana",
    abertoEm: AGORA,
    ...over,
  };
}

function pedido(over: Partial<Pedido> = {}): Pedido {
  return {
    solicitanteId: "sol-1",
    categoria: "post",
    meta: { tipoPedido: "post" },
    estado: "recebido",
    recebidoEm: AGORA,
    parecer: {
      nivel: "verde",
      prontidao: 80,
      titulo: "Pronto para produzir",
      resumo: "",
      pontos: [],
    },
    ...over,
  };
}

function solicitante(over: Partial<Solicitante> = {}): Solicitante {
  return { id: "sol-1", nome: "Carla do RH", area: "RH", ...over };
}

/** Garante que um resultado barrado carrega um motivo com texto de verdade. */
function esperarBarradoComMotivo(resultado: { ok: boolean } | { ok: false; motivo: string }) {
  expect(resultado.ok).toBe(false);
  const motivo = (resultado as { ok: false; motivo: string }).motivo;
  expect(typeof motivo).toBe("string");
  expect(motivo.trim().length).toBeGreaterThan(0);
}

// ─── validarMotivo (Requirements 9.4) ───────────────────────────────────────

describe("validarMotivo — motivo obrigatório para barrar/decidir (Requirement 9.4)", () => {
  it("string vazia → {ok:false} com motivo", () => {
    esperarBarradoComMotivo(validarMotivo(""));
  });

  it("só espaços em branco → {ok:false} com motivo", () => {
    esperarBarradoComMotivo(validarMotivo("     "));
  });

  it("curto demais (menos de 5 chars após trim) → {ok:false}", () => {
    esperarBarradoComMotivo(validarMotivo("  oi  ")); // "oi" = 2 chars
    esperarBarradoComMotivo(validarMotivo("abcd")); // 4 chars, no limite inferior
  });

  it("motivo válido (≥5 chars após trim) → {ok:true}", () => {
    expect(validarMotivo("Falta briefing").ok).toBe(true);
    expect(validarMotivo("  12345  ").ok).toBe(true); // exatamente 5 após trim
  });
});

// ─── podeMarcarBloqueado (Requirements 9.4, K9) ─────────────────────────────

describe("podeMarcarBloqueado — K9 e demais travas (Requirement 9.4)", () => {
  it("item aberto, sem post aguardando aprovação → {ok:true}", () => {
    const c = card();
    const s = subtarefa();
    const dados = montarDados({ cards: [c], subtarefas: [s] });
    expect(podeMarcarBloqueado(dados, { tipo: "subtarefa", id: s.id }).ok).toBe(true);
  });

  it("post em `enviado` (aguardando aprovação) → {ok:false} (quem decide é quem aprova)", () => {
    const c = card();
    const s = subtarefa();
    const p = post("enviado", { itemId: s.id });
    const dados = montarDados({ cards: [c], subtarefas: [s], posts: [p] });
    esperarBarradoComMotivo(podeMarcarBloqueado(dados, { tipo: "subtarefa", id: s.id }));
  });

  it("post já publicado → {ok:false}", () => {
    const c = card();
    const s = subtarefa();
    const p = post("publicado", { itemId: s.id, publicadoEm: AGORA });
    const dados = montarDados({ cards: [c], subtarefas: [s], posts: [p] });
    esperarBarradoComMotivo(podeMarcarBloqueado(dados, { tipo: "subtarefa", id: s.id }));
  });

  it("item já marcado como bloqueado → {ok:false}", () => {
    const c = card();
    const s = subtarefa();
    const prob = problemaBloqueado({ tipo: "subtarefa", id: s.id });
    const dados = montarDados({ cards: [c], subtarefas: [s], problemas: [prob] });
    esperarBarradoComMotivo(podeMarcarBloqueado(dados, { tipo: "subtarefa", id: s.id }));
  });

  it("subtarefa concluída (sem post) → {ok:false}", () => {
    const c = card();
    const s = subtarefa({ concluidaEm: AGORA });
    const dados = montarDados({ cards: [c], subtarefas: [s] });
    esperarBarradoComMotivo(podeMarcarBloqueado(dados, { tipo: "subtarefa", id: s.id }));
  });

  it("card concluído (sem post e sem subtarefa, concluído à mão) → {ok:false}", () => {
    const c = card({ concluidoManualEm: AGORA });
    const dados = montarDados({ cards: [c] });
    esperarBarradoComMotivo(podeMarcarBloqueado(dados, { tipo: "card", id: c.id }));
  });
});

// ─── podeDecidirPedido (Requirements 9.5) ───────────────────────────────────

describe("podeDecidirPedido — trava de autoria (Requirement 9.5)", () => {
  it("autor decidindo o PRÓPRIO pedido → {ok:false}", () => {
    const sol = solicitante({ usuarioId: "u-ana" });
    const c = card({ pedido: pedido({ estado: "recebido" }) });
    const dados = montarDados({ cards: [c], solicitantes: [sol] });
    esperarBarradoComMotivo(podeDecidirPedido(dados, c, "u-ana"));
  });

  it("outra pessoa decidindo um pedido em `recebido`/`triagem` → {ok:true}", () => {
    const sol = solicitante({ usuarioId: "u-ana" });
    const recebido = card({ id: "card-r", pedido: pedido({ estado: "recebido" }) });
    const triagem = card({ id: "card-t", pedido: pedido({ estado: "triagem" }) });
    const dados = montarDados({ cards: [recebido, triagem], solicitantes: [sol] });
    expect(podeDecidirPedido(dados, recebido, "u-bruno").ok).toBe(true);
    expect(podeDecidirPedido(dados, triagem, "u-bruno").ok).toBe(true);
  });

  it("card que não é pedido externo → {ok:false}", () => {
    const c = card(); // sem `pedido`
    const dados = montarDados({ cards: [c] });
    esperarBarradoComMotivo(podeDecidirPedido(dados, c, "u-bruno"));
  });

  it("pedido já decidido (aprovado/negado/devolvido) → {ok:false}", () => {
    const sol = solicitante({ usuarioId: "u-ana" });
    const aprovado = card({ id: "card-a", pedido: pedido({ estado: "aprovado" }) });
    const negado = card({ id: "card-n", pedido: pedido({ estado: "negado" }) });
    const dados = montarDados({ cards: [aprovado, negado], solicitantes: [sol] });
    esperarBarradoComMotivo(podeDecidirPedido(dados, aprovado, "u-bruno"));
    esperarBarradoComMotivo(podeDecidirPedido(dados, negado, "u-bruno"));
  });
});

// ─── podeExcluirItem (Requirements 9.9) ─────────────────────────────────────

describe("podeExcluirItem — não some com post junto (Requirement 9.9)", () => {
  it("item com post associado diretamente → {ok:false} (mantém o item)", () => {
    const c = card();
    const s = subtarefa();
    const p = post("rascunho", { itemId: s.id });
    const dados = montarDados({ cards: [c], subtarefas: [s], posts: [p] });
    esperarBarradoComMotivo(podeExcluirItem(dados, s.id));
  });

  it("card com descendente (subtarefa) que tem post → {ok:false}", () => {
    const c = card();
    const s = subtarefa({ id: "sub-neta", parentId: undefined });
    const p = post("rascunho", { itemId: s.id });
    const dados = montarDados({ cards: [c], subtarefas: [s], posts: [p] });
    // Excluir o CARD arrastaria o post da subtarefa junto → barrado.
    esperarBarradoComMotivo(podeExcluirItem(dados, c.id));
  });

  it("subtarefa-mãe com sub-subtarefa (neta) que tem post → {ok:false}", () => {
    const c = card();
    const mae = subtarefa({ id: "sub-mae" });
    const neta = subtarefa({ id: "sub-neta", parentId: "sub-mae", ordem: 0 });
    const p = post("rascunho", { itemId: neta.id });
    const dados = montarDados({ cards: [c], subtarefas: [mae, neta], posts: [p] });
    esperarBarradoComMotivo(podeExcluirItem(dados, mae.id));
  });

  it("item limpo (nenhum post na subárvore) → {ok:true}", () => {
    const c = card();
    const mae = subtarefa({ id: "sub-mae" });
    const neta = subtarefa({ id: "sub-neta", parentId: "sub-mae", ordem: 0 });
    const dados = montarDados({ cards: [c], subtarefas: [mae, neta] });
    expect(podeExcluirItem(dados, c.id).ok).toBe(true);
    expect(podeExcluirItem(dados, mae.id).ok).toBe(true);
    expect(podeExcluirItem(dados, neta.id).ok).toBe(true);
  });
});
