// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Modelo v2 da mesa: seções de colunas independentes (pacote, decisão 8).
import { describe, expect, it, vi } from "vitest";
import { cardDisponivel, type CardId } from "./catalogo";
import {
  CHAVE_PREFS,
  adicionar,
  alternarTamanho,
  aplicarColunasDeTrabalho,
  arranjoPadrao,
  chaveMesa,
  colunasDeTrabalho,
  definirDensidadeCard,
  densidadeDe,
  foraDaMesa,
  lerArranjo,
  lerPrefs,
  migrarOrdemLinear,
  moverLargo,
  moverNaOrdem,
  moverNoTrabalho,
  normalizarArranjo,
  normalizarSecoes,
  ocultar,
  ordemLogica,
  paraLargo,
  paraNormal,
  podeMover,
  restaurar,
  salvarArranjo,
  tamanhoDe,
  trocarColuna,
  visiveisNaMesa,
  type ArranjoMesa,
  type Armazenamento,
  type Secao,
} from "./layout";

function memoria(inicial: Record<string, string> = {}): Armazenamento {
  const m = new Map(Object.entries(inicial));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

// Atalhos de escrita: C(esq | dir) e L(id).
const C = (esquerda: CardId[] = [], direita: CardId[] = []): Secao => ({ tipo: "colunas", esquerda, direita });
const L = (id: CardId): Secao => ({ tipo: "largo", id });
const com = (secoes: Secao[], extra: Partial<ArranjoMesa> = {}): ArranjoMesa => ({ ...arranjoPadrao(), secoes: normalizarSecoes(secoes), ...extra });

describe("estrutura e padrão", () => {
  it("padrão = [C(), L tarefas, C(publicar | ajustar)], v2, sem mexer, compacto, com fita", () => {
    const a = arranjoPadrao();
    expect(a.versao).toBe(2);
    expect(a.secoes).toEqual([C(), L("tarefas"), C(["publicar"], ["ajustar"])]);
    expect(a.movido).toBe(false);
    expect(a.densidade.mesa).toBe("compacto");
    expect(a.fraseComFita).toBe(true);
    expect(tamanhoDe(a, "tarefas")).toBe("largo");
    expect(tamanhoDe(a, "publicar")).toBe("normal");
  });

  it("normalizarSecoes: funde blocos vizinhos por coluna, bloco no início/fim/entre largos, idempotente", () => {
    const n = normalizarSecoes([C(["publicar"]), C(["ajustar"], ["recentes"]), L("tarefas"), L("prazos")]);
    expect(n).toEqual([C(["publicar", "ajustar"], ["recentes"]), L("tarefas"), C(), L("prazos"), C()]);
    expect(normalizarSecoes(n)).toEqual(n);
    expect(normalizarSecoes([])).toEqual([C()]);
    // Nunca dois blocos vazios seguidos.
    expect(normalizarSecoes([C(), C(), L("tarefas")])).toEqual([C(), L("tarefas"), C()]);
  });

  it("ordem lógica = por seção; num bloco, a esquerda inteira e depois a direita", () => {
    const a = com([C(["tarefas", "publicar"], ["ajustar"]), L("prazos"), C(["recentes"])]);
    expect(ordemLogica(a)).toEqual(["tarefas", "publicar", "ajustar", "prazos", "recentes"]);
  });

  it("gate R-PED-11 por papel", () => {
    expect(cardDisponivel("aprovar", "marketing")).toBe(false);
    expect(cardDisponivel("aprovar", "aprovador")).toBe(true);
    expect(cardDisponivel("triagem", "admin")).toBe(true);
    expect(foraDaMesa(arranjoPadrao(), "marketing")).toEqual(["tendencia", "prazos", "recentes"]);
    const a = com([C(["tarefas", "aprovar"], ["ajustar"])]);
    expect(visiveisNaMesa(a, "marketing")).toEqual(["tarefas", "ajustar"]);
    expect(visiveisNaMesa(a, "admin")).toEqual(["tarefas", "aprovar", "ajustar"]);
  });
});

describe("normalização e migração", () => {
  it("v2: id desconhecido/duplicado, conflito seções/gaveta, seção malformada, lado inválido, principal ausente", () => {
    const n = normalizarArranjo({
      versao: 2,
      secoes: [{ tipo: "colunas", esquerda: ["publicar", "xyz", "publicar"], direita: ["aprovar"] }, { tipo: "nada" }, "x", { tipo: "largo", id: "aprovar" }],
      ocultos: ["aprovar", "tendencia"],
      ladoAnterior: { publicar: "dir", ajustar: "meio" },
      densidade: { mesa: "nada", porCard: { publicar: "tudo", tarefas: "x" } },
      movido: true,
    });
    expect(n).not.toBeNull();
    // tarefas (largo de fábrica) e ajustar (normal) voltam porque são principais, no fim.
    expect(n!.secoes).toEqual([C(["publicar"], ["aprovar"]), L("tarefas"), C(["ajustar"])]);
    expect(n!.ocultos).toEqual(["tendencia"]);
    expect(n!.ladoAnterior).toEqual({ publicar: "dir" });
    expect(n!.densidade).toEqual({ mesa: "compacto", porCard: { publicar: "tudo" } });
    expect(n!.movido).toBe(true);
  });

  it("formato de cima errado vira null", () => {
    expect(normalizarArranjo({ versao: 2, ordem: [], ocultos: [] })).toBeNull();
    expect(normalizarArranjo({ versao: 3, secoes: [], ocultos: [] })).toBeNull();
    expect(normalizarArranjo({ versao: 1, ocultos: [] })).toBeNull();
    expect(normalizarArranjo("x")).toBeNull();
  });

  it("v1 → v2: simula a grade antiga (normal alterna colunas, largo vira seção)", () => {
    expect(migrarOrdemLinear(["publicar", "ajustar", "prazos", "recentes"], {})).toEqual([C(["publicar"], ["ajustar"]), L("prazos"), C(["recentes"])]);
    // O caso do print: Minhas tarefas normal, Para ajustar ao lado, Publicar hoje embaixo.
    expect(migrarOrdemLinear(["tarefas", "ajustar", "publicar"], { tarefas: "normal" })).toEqual([C(["tarefas", "publicar"], ["ajustar"])]);
  });

  it("v1 salvo é lido sem problema, preserva gaveta/densidade/movido/fita e regrava como v2", () => {
    const s = memoria({
      [chaveMesa("u-v1")]: JSON.stringify({
        versao: 1,
        ordem: ["tarefas", "ajustar", "publicar"],
        ocultos: ["recentes"],
        tamanhos: { tarefas: "normal" },
        densidade: { mesa: "tudo", porCard: { ajustar: "compacto" } },
        movido: true,
        fraseComFita: false,
      }),
    });
    const r = lerArranjo(s, "u-v1");
    expect(r.problema).toBe(false);
    expect(r.arranjo.versao).toBe(2);
    expect(r.arranjo.secoes).toEqual([C(["tarefas", "publicar"], ["ajustar"])]);
    expect(r.arranjo.ocultos).toEqual(["recentes"]);
    expect(r.arranjo.densidade).toEqual({ mesa: "tudo", porCard: { ajustar: "compacto" } });
    expect(r.arranjo.movido).toBe(true);
    expect(r.arranjo.fraseComFita).toBe(false);
    salvarArranjo(s, "u-v1", r.arranjo);
    expect(JSON.parse(s.getItem(chaveMesa("u-v1"))!).versao).toBe(2);
    expect(lerArranjo(s, "u-v1").arranjo).toEqual(r.arranjo);
  });

  it("lê e grava; JSON quebrado volta ao padrão com problema", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const s = memoria({ [chaveMesa("u-x")]: "{quebrado" });
    const r = lerArranjo(s, "u-x");
    expect(r.problema).toBe(true);
    expect(r.arranjo).toEqual(arranjoPadrao());
    const a = ocultar(arranjoPadrao(), "ajustar");
    salvarArranjo(s, "u-x", a);
    expect(lerArranjo(s, "u-x")).toEqual({ arranjo: a, problema: false });
    expect(lerArranjo(s, "u-novo")).toEqual({ arranjo: arranjoPadrao(), problema: false });
    warn.mockRestore();
  });

  it("preferências: o modoSub antigo (B1 x B2) é ignorado", () => {
    const s = memoria({ [CHAVE_PREFS]: JSON.stringify({ tema: "escuro", modoSub: "deslizar" }) });
    expect(lerPrefs(s)).toEqual({ tema: "escuro" });
  });
});

describe("teclado: ↑ ↓ na ordem lógica", () => {
  const base = () => com([C(["tarefas", "publicar"], ["ajustar"]), L("prazos"), C(["recentes"])]);

  it("dentro da coluna troca com o vizinho e marca movido", () => {
    const b = moverNaOrdem(base(), "publicar", -1, "marketing");
    expect(b.secoes[0]).toEqual(C(["publicar", "tarefas"], ["ajustar"]));
    expect(b.movido).toBe(true);
  });

  it("fim da esquerda → topo da direita (inclusive direita vazia); ↑ é o espelho", () => {
    const b = moverNaOrdem(base(), "publicar", 1, "marketing");
    expect(b.secoes[0]).toEqual(C(["tarefas"], ["publicar", "ajustar"]));
    expect(moverNaOrdem(b, "publicar", -1, "marketing").secoes[0]).toEqual(C(["tarefas", "publicar"], ["ajustar"]));
    const vazia = com([C(["tarefas", "publicar"])]);
    expect(moverNaOrdem(vazia, "publicar", 1, "marketing").secoes).toEqual([C(["tarefas"], ["publicar"])]);
  });

  it("fim da direita → topo da esquerda do próximo bloco, atravessando o largo", () => {
    const b = moverNaOrdem(base(), "ajustar", 1, "marketing");
    expect(b.secoes).toEqual([C(["tarefas", "publicar"]), L("prazos"), C(["ajustar", "recentes"])]);
    // ↑ do topo da esquerda volta para o fim da direita do bloco anterior.
    expect(moverNaOrdem(b, "ajustar", -1, "marketing").secoes).toEqual(base().secoes);
  });

  it("nas pontas devolve o mesmo objeto", () => {
    const a = base();
    expect(moverNaOrdem(a, "tarefas", -1, "marketing")).toBe(a);
    // recentes está no fim da esquerda do último bloco: ↓ ainda vai para a direita vazia.
    const b = moverNaOrdem(a, "recentes", 1, "marketing");
    expect(b.secoes[2]).toEqual(C([], ["recentes"]));
    expect(moverNaOrdem(b, "recentes", 1, "marketing")).toBe(b);
    expect(podeMover(b, "recentes", 1, "marketing")).toBe(false);
    expect(podeMover(b, "recentes", -1, "marketing")).toBe(true);
  });

  it("card largo troca com a seção vizinha, pula bloco vazio e funde ao normalizar", () => {
    const a = com([C(["publicar"], ["ajustar"]), L("tarefas"), C(["recentes"])]);
    expect(moverNaOrdem(a, "tarefas", 1, "marketing").secoes).toEqual([C(["publicar", "recentes"], ["ajustar"]), L("tarefas"), C()]);
    const p = arranjoPadrao(); // [C(), L tarefas, C(publicar|ajustar)]
    expect(moverNaOrdem(p, "tarefas", -1, "marketing")).toBe(p);
    const dois = com([C(["publicar"]), L("tarefas"), C(), L("prazos")]);
    // prazos ↑ pula o bloco vazio e troca com tarefas.
    expect(moverNaOrdem(dois, "prazos", -1, "marketing").secoes).toEqual([C(["publicar"]), L("prazos"), C(), L("tarefas"), C()]);
  });

  it("card que o papel não vê não pula", () => {
    const a = com([C(["tarefas", "aprovar", "publicar"], ["ajustar"])]);
    const b = moverNaOrdem(a, "publicar", -1, "marketing");
    expect(b.secoes[0]).toEqual(C(["publicar", "aprovar", "tarefas"], ["ajustar"]));
    const c = trocarColuna(a, "ajustar", "esq", "marketing");
    // ajustar (índice 0 na direita) entra no índice visível 0 da esquerda; aprovar fica entre tarefas e publicar.
    expect(c.secoes[0]).toEqual(C(["ajustar", "tarefas", "aprovar", "publicar"], []));
  });
});

describe("teclado: ← → trocam de coluna", () => {
  it("índice min(i, tamanho da outra), coluna vazia, mesmo lado devolve o mesmo objeto", () => {
    const a = com([C(["tarefas", "publicar", "recentes"], ["ajustar"])]);
    expect(trocarColuna(a, "recentes", "dir", "marketing").secoes[0]).toEqual(C(["tarefas", "publicar"], ["ajustar", "recentes"]));
    expect(trocarColuna(a, "tarefas", "dir", "marketing").secoes[0]).toEqual(C(["publicar", "recentes"], ["tarefas", "ajustar"]));
    const vazia = com([C(["tarefas", "publicar"])]);
    expect(trocarColuna(vazia, "publicar", "dir", "marketing").secoes[0]).toEqual(C(["tarefas"], ["publicar"]));
    expect(trocarColuna(a, "tarefas", "esq", "marketing")).toBe(a);
    // Card largo não troca de coluna.
    const p = arranjoPadrao();
    expect(trocarColuna(p, "tarefas", "dir", "marketing")).toBe(p);
  });
});

describe("normal ↔ largo", () => {
  it("paraLargo corta as duas colunas na altura do card e guarda a coluna de origem", () => {
    const a = com([C(["tarefas", "publicar", "recentes"], ["ajustar", "tendencia"])]);
    const b = paraLargo(a, "publicar");
    expect(b.secoes).toEqual([C(["tarefas"], ["ajustar"]), L("publicar"), C(["recentes"], ["tendencia"])]);
    expect(b.ladoAnterior).toEqual({ publicar: "esq" });
    expect(tamanhoDe(b, "publicar")).toBe("largo");
  });

  it("paraNormal volta para a coluna de origem, no mesmo ponto, e os blocos se juntam (ida e volta exata)", () => {
    const a = com([C(["tarefas", "publicar", "recentes"], ["ajustar", "tendencia"])]);
    expect(paraNormal(paraLargo(a, "publicar"), "publicar").secoes).toEqual(a.secoes);
    const d = paraLargo(a, "tendencia");
    expect(d.secoes).toEqual([C(["tarefas"], ["ajustar"]), L("tendencia"), C(["publicar", "recentes"])]);
    const volta = paraNormal(d, "tendencia");
    expect(volta.secoes).toEqual(a.secoes);
    expect(volta.ladoAnterior).toEqual({});
    expect(tamanhoDe(volta, "tendencia")).toBe("normal");
  });

  it("largo de fábrica (Minhas tarefas) volta para a esquerda: é o caso do print", () => {
    const b = alternarTamanho(arranjoPadrao(), "tarefas");
    expect(b.secoes).toEqual([C(["tarefas", "publicar"], ["ajustar"])]);
    expect(tamanhoDe(b, "tarefas")).toBe("normal");
    expect(alternarTamanho(b, "tarefas").secoes).toEqual([C(), L("tarefas"), C(["publicar"], ["ajustar"])]);
  });
});

describe("gaveta e galeria", () => {
  it("ocultar um largo funde os blocos vizinhos; restaurar volta ao fim", () => {
    const a = ocultar(arranjoPadrao(), "tarefas");
    expect(a.secoes).toEqual([C(["publicar"], ["ajustar"])]);
    expect(a.ocultos).toEqual(["tarefas"]);
    const b = restaurar(a, "tarefas");
    expect(b.secoes).toEqual([C(["publicar"], ["ajustar"]), L("tarefas"), C()]);
    expect(b.ocultos).toEqual([]);
  });

  it("normal entra na coluna mais curta do último bloco; largo de fábrica vira seção no fim", () => {
    let a = ocultar(arranjoPadrao(), "ajustar");
    expect(a.secoes).toEqual([C(), L("tarefas"), C(["publicar"])]);
    a = restaurar(a, "ajustar");
    expect(a.secoes).toEqual([C(), L("tarefas"), C(["publicar"], ["ajustar"])]);
    a = adicionar(a, "recentes");
    expect(a.secoes[2]).toEqual(C(["publicar", "recentes"], ["ajustar"]));
    a = adicionar(a, "prazos");
    expect(a.secoes.slice(-2)).toEqual([L("prazos"), C()]);
    expect(foraDaMesa(a, "marketing")).toEqual(["tendencia"]);
    expect(adicionar(a, "prazos")).toBe(a);
  });

  it("densidade por card", () => {
    let a = definirDensidadeCard(arranjoPadrao(), "publicar", "tudo");
    expect(densidadeDe(a, "publicar")).toBe("tudo");
    a = definirDensidadeCard(a, "publicar", "seguir");
    expect(densidadeDe(a, "publicar")).toBe("compacto");
  });
});

describe("arrastar: estado de trabalho", () => {
  const a = () => com([C(["tarefas", "publicar"], ["ajustar"]), L("prazos"), C()]);

  it("ida e volta sem mudança devolve o mesmo arranjo", () => {
    const x = a();
    const t = colunasDeTrabalho(x, "marketing");
    expect(Object.keys(t)).toEqual(["apos:topo|esq", "apos:topo|dir", "apos:prazos|esq", "apos:prazos|dir"]);
    expect(aplicarColunasDeTrabalho(x, t, "marketing")).toBe(x);
  });

  it("move dentro da coluna, para a outra coluna (caso do print), para coluna vazia e entre blocos", () => {
    const x = a();
    const t = colunasDeTrabalho(x, "marketing");
    const dentro = moverNoTrabalho(t, "publicar", "apos:topo|esq", 0);
    expect(dentro["apos:topo|esq"]).toEqual(["publicar", "tarefas"]);
    // Publicar hoje logo abaixo de Para ajustar, na coluna da direita.
    const outra = moverNoTrabalho(t, "publicar", "apos:topo|dir", 1);
    expect(aplicarColunasDeTrabalho(x, outra, "marketing").secoes[0]).toEqual(C(["tarefas"], ["ajustar", "publicar"]));
    const vazia = moverNoTrabalho(t, "ajustar", "apos:prazos|dir", 0);
    expect(aplicarColunasDeTrabalho(x, vazia, "marketing").secoes).toEqual([C(["tarefas", "publicar"]), L("prazos"), C([], ["ajustar"])]);
    const r = aplicarColunasDeTrabalho(x, moverNoTrabalho(t, "tarefas", "apos:prazos|esq", 0), "marketing");
    expect(r.secoes).toEqual([C(["publicar"], ["ajustar"]), L("prazos"), C(["tarefas"])]);
    expect(r.movido).toBe(true);
    // Mesmo lugar: mesmo objeto.
    expect(moverNoTrabalho(t, "tarefas", "apos:topo|esq", 0)).toBe(t);
  });

  it("card invisível fica depois do mesmo vizinho visível", () => {
    const x = com([C(["tarefas", "aprovar", "publicar"], ["ajustar"])]);
    const t = colunasDeTrabalho(x, "marketing");
    expect(t["apos:topo|esq"]).toEqual(["tarefas", "publicar"]);
    const r = aplicarColunasDeTrabalho(x, moverNoTrabalho(t, "ajustar", "apos:topo|esq", 2), "marketing");
    expect(r.secoes[0]).toEqual(C(["tarefas", "aprovar", "publicar", "ajustar"], []));
  });

  it("moverLargo: muda a seção de lugar e normaliza", () => {
    const p = arranjoPadrao();
    expect(moverLargo(p, "tarefas", 2).secoes).toEqual([C(["publicar"], ["ajustar"]), L("tarefas"), C()]);
    expect(moverLargo(p, "tarefas", 1)).toBe(p);
  });
});
