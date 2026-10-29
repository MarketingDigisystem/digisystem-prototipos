/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 * Revisado em 2026-10-27 (noite): disposição livre em colunas (decisão 8) e só Acordeão (decisão 2).
 *
 * Funções puras do arranjo da mesa ("sua mesa, do seu jeito") e a leitura/
 * gravação no localStorage. No app real isso vai para o banco (user_preferencias,
 * DDL só com OK do usuário); aqui é só simulação.
 *
 * Modelo v2 (decisão 8): a mesa é uma sequência de SEÇÕES. Uma seção é um card
 * largo (largura toda) ou um bloco de duas colunas independentes (esquerda e
 * direita), cada uma uma pilha sem buracos. Forma canônica C (L C)*: começa e
 * termina com um bloco de colunas e há sempre um bloco (talvez vazio) entre
 * dois largos, para que dê para soltar um card normal em qualquer vão.
 * O tamanho é derivado da posição: card numa seção largo = largo; numa coluna = normal.
 */
import type { Papel } from "../../../store/tipos";
import { CATALOGO, IDS, PRINCIPAIS, cardDisponivel, ehCardId, type CardId, type Tamanho } from "./catalogo";

export type Densidade = "compacto" | "tudo";
export type DensidadeCard = Densidade | "seguir";

export type Lado = "esq" | "dir";
export type SecaoLargo = { tipo: "largo"; id: CardId };
export type SecaoColunas = { tipo: "colunas"; esquerda: CardId[]; direita: CardId[] };
export type Secao = SecaoLargo | SecaoColunas;

export type ArranjoMesa = {
  versao: 2;
  /** Forma canônica C (L C)*. Inclui os cards que o papel atual não vê. */
  secoes: Secao[];
  /** Na gaveta, na ordem em que foram ocultados. */
  ocultos: CardId[];
  /** Coluna de onde o card saiu ao virar largo (para voltar ao mesmo lugar). */
  ladoAnterior: Partial<Record<CardId, Lado>>;
  densidade: { mesa: Densidade; porCard: Partial<Record<CardId, Densidade>> };
  /** false enquanto ninguém mexeu na posição (chip "Fixado"). */
  movido: boolean;
  /** Frase do dia: dia no bilhete com fita (padrão) ou limpo. Ausente = true. */
  fraseComFita: boolean;
};

/** O que a grade renderiza (já filtrado por papel). `indice` = posição em arranjo.secoes. */
export type SecaoVista =
  | { tipo: "largo"; chave: string; indice: number; id: CardId }
  | { tipo: "colunas"; chave: string; indice: number; esquerda: CardId[]; direita: CardId[] };
export type Posicao = { secao: number; lado: Lado; indice: number } | { secao: number; lado: "largo" };
/** Estado de trabalho do arrastar: "<chaveBloco>|esq" → ids VISÍVEIS daquela coluna. */
export type ColunasTrabalho = Record<string, CardId[]>;

export type PrefsPrototipo = { tema: "claro" | "escuro" };
export type Armazenamento = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** O nome da chave é legado; o campo `versao` discrimina v1 (ordem linear) e v2 (seções). */
export const chaveMesa = (usuarioId: string) => `mmv:mesa:v1:${usuarioId}`;
export const CHAVE_PREFS = "mmv:prefs:v1";
/** Data (YYYY-MM-DD) da última vez que a entrada animada da frase rodou. */
export const CHAVE_FRASE_ENTRADA = "mmv:frase-entrada:v1";

const colunasVazias = (): SecaoColunas => ({ tipo: "colunas", esquerda: [], direita: [] });
const campo = (lado: Lado) => (lado === "esq" ? "esquerda" : "direita");
const outro = (lado: Lado): Lado => (lado === "esq" ? "dir" : "esq");
export const chaveColuna = (chaveBloco: string, lado: Lado) => `${chaveBloco}|${lado}`;

// ─── Estrutura ────────────────────────────────────────────────────────────

/** Funde blocos de colunas encostados e garante bloco no início, no fim e entre largos. */
export function normalizarSecoes(secoes: Secao[]): Secao[] {
  const out: Secao[] = [];
  for (const s of secoes) {
    const ultimo = out[out.length - 1];
    if (s.tipo === "colunas") {
      if (ultimo?.tipo === "colunas") out[out.length - 1] = { tipo: "colunas", esquerda: [...ultimo.esquerda, ...s.esquerda], direita: [...ultimo.direita, ...s.direita] };
      else out.push({ tipo: "colunas", esquerda: [...s.esquerda], direita: [...s.direita] });
    } else {
      if (!ultimo || ultimo.tipo === "largo") out.push(colunasVazias());
      out.push({ tipo: "largo", id: s.id });
    }
  }
  if (out.length === 0 || out[out.length - 1].tipo === "largo") out.push(colunasVazias());
  return out;
}

/** Chave estável do bloco: "apos:topo" ou "apos:<id do largo anterior>". */
export function chaveDoBloco(secoes: Secao[], indice: number): string {
  if (indice === 0) return "apos:topo";
  const anterior = secoes[indice - 1];
  return anterior?.tipo === "largo" ? `apos:${anterior.id}` : `apos:#${indice}`;
}

export function posicaoDe(a: ArranjoMesa, id: CardId): Posicao | null {
  for (let s = 0; s < a.secoes.length; s++) {
    const sec = a.secoes[s];
    if (sec.tipo === "largo") {
      if (sec.id === id) return { secao: s, lado: "largo" };
    } else {
      const e = sec.esquerda.indexOf(id);
      if (e >= 0) return { secao: s, lado: "esq", indice: e };
      const d = sec.direita.indexOf(id);
      if (d >= 0) return { secao: s, lado: "dir", indice: d };
    }
  }
  return null;
}

/** Ordem lógica (DOM, Tab, leitor de tela, mobile): por seção; num bloco, a esquerda inteira e depois a direita. */
export const ordemLogica = (a: ArranjoMesa): CardId[] =>
  a.secoes.flatMap((s) => (s.tipo === "largo" ? [s.id] : [...s.esquerda, ...s.direita]));

export const ordemDasSecoes = (secoes: Secao[]): CardId[] => ordemLogica({ secoes } as ArranjoMesa);

export function vistaDaMesa(a: ArranjoMesa, papel: Papel): SecaoVista[] {
  const out: SecaoVista[] = [];
  a.secoes.forEach((s, indice) => {
    if (s.tipo === "largo") {
      if (cardDisponivel(s.id, papel)) out.push({ tipo: "largo", chave: s.id, indice, id: s.id });
    } else {
      const ver = (l: CardId[]) => l.filter((id) => cardDisponivel(id, papel));
      out.push({ tipo: "colunas", chave: chaveDoBloco(a.secoes, indice), indice, esquerda: ver(s.esquerda), direita: ver(s.direita) });
    }
  });
  return out;
}

export const visiveisNaMesa = (a: ArranjoMesa, papel: Papel) => ordemLogica(a).filter((id) => cardDisponivel(id, papel));
export const ocultosVisiveis = (a: ArranjoMesa, papel: Papel) => a.ocultos.filter((id) => cardDisponivel(id, papel));
/** Cards que não estão na mesa nem na gaveta (vão para a galeria). */
export const foraDaMesa = (a: ArranjoMesa, papel: Papel) => {
  const naMesa = ordemLogica(a);
  return IDS.filter((id) => !naMesa.includes(id) && !a.ocultos.includes(id) && cardDisponivel(id, papel));
};

/** Derivado da posição; card fora da mesa usa o tamanho de fábrica. */
export function tamanhoDe(a: ArranjoMesa, id: CardId): Tamanho {
  const p = posicaoDe(a, id);
  if (!p) return CATALOGO[id].tamanhoPadrao;
  return p.lado === "largo" ? "largo" : "normal";
}

export function ladoDe(a: ArranjoMesa, id: CardId): Lado | null {
  const p = posicaoDe(a, id);
  return p && p.lado !== "largo" ? p.lado : null;
}

export const densidadeDe = (a: ArranjoMesa, id: CardId): Densidade => a.densidade.porCard[id] ?? a.densidade.mesa;
export const densidadeCardDe = (a: ArranjoMesa, id: CardId): DensidadeCard => a.densidade.porCard[id] ?? "seguir";

// ─── Padrão, migração e normalização ──────────────────────────────────────

export function arranjoPadrao(): ArranjoMesa {
  return {
    versao: 2,
    secoes: normalizarSecoes([
      { tipo: "largo", id: "tarefas" },
      { tipo: "colunas", esquerda: ["publicar"], direita: ["ajustar"] },
    ]),
    ocultos: [],
    ladoAnterior: {},
    densidade: { mesa: "compacto", porCard: {} },
    movido: false,
    fraseComFita: true,
  };
}

/**
 * v1 → v2: simula a grade antiga de 2 colunas (sem dense). Normal ocupa a
 * coluna do cursor e alterna; largo fecha o bloco, vira seção e o cursor volta
 * à esquerda. Ex.: [a, b, c(L), d] → C(a|b) L(c) C(d|).
 */
export function migrarOrdemLinear(ordem: CardId[], tamanhos: Partial<Record<CardId, Tamanho>>): Secao[] {
  const secoes: Secao[] = [];
  let atual = colunasVazias();
  let cursor: Lado = "esq";
  for (const id of ordem) {
    if ((tamanhos[id] ?? CATALOGO[id].tamanhoPadrao) === "largo") {
      secoes.push(atual, { tipo: "largo", id });
      atual = colunasVazias();
      cursor = "esq";
    } else {
      atual[campo(cursor)].push(id);
      cursor = outro(cursor);
    }
  }
  secoes.push(atual);
  return normalizarSecoes(secoes);
}

const ehDensidade = (x: unknown): x is Densidade => x === "compacto" || x === "tudo";
const ehTamanho = (x: unknown): x is Tamanho => x === "normal" || x === "largo";
const ehLado = (x: unknown): x is Lado => x === "esq" || x === "dir";
const ehObjeto = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

/**
 * Normaliza um arranjo vindo de fora (v1 é migrado). Devolve null quando o
 * formato de cima não bate (versão, listas). Partes ruins por dentro são
 * descartadas sem erro: id desconhecido, duplicado (vence a 1ª ocorrência na
 * ordem lógica), id nas seções e na gaveta ao mesmo tempo (fica nas seções),
 * seção malformada, enum inválido. Card principal nunca fica "fora": volta à mesa.
 */
export function normalizarArranjo(bruto: unknown): ArranjoMesa | null {
  if (!ehObjeto(bruto) || !Array.isArray(bruto.ocultos)) return null;
  let secoes: Secao[];
  const vistos: CardId[] = [];
  const pegar = (x: unknown): x is CardId => {
    if (!ehCardId(x) || vistos.includes(x)) return false;
    vistos.push(x);
    return true;
  };

  if (bruto.versao === 1) {
    if (!Array.isArray(bruto.ordem)) return null;
    const ordem = bruto.ordem.filter(pegar);
    const tamanhos: Partial<Record<CardId, Tamanho>> = {};
    if (ehObjeto(bruto.tamanhos)) {
      for (const [k, v] of Object.entries(bruto.tamanhos)) if (ehCardId(k) && ehTamanho(v)) tamanhos[k] = v;
    }
    secoes = migrarOrdemLinear(ordem, tamanhos);
  } else if (bruto.versao === 2) {
    if (!Array.isArray(bruto.secoes)) return null;
    secoes = [];
    for (const s of bruto.secoes) {
      if (!ehObjeto(s)) continue;
      if (s.tipo === "largo") {
        if (pegar(s.id)) secoes.push({ tipo: "largo", id: s.id });
      } else if (s.tipo === "colunas" && Array.isArray(s.esquerda) && Array.isArray(s.direita)) {
        secoes.push({ tipo: "colunas", esquerda: s.esquerda.filter(pegar), direita: s.direita.filter(pegar) });
      }
    }
    secoes = normalizarSecoes(secoes);
  } else {
    return null;
  }

  const ocultos: CardId[] = [];
  for (const x of bruto.ocultos) if (ehCardId(x) && !vistos.includes(x) && !ocultos.includes(x)) ocultos.push(x);
  for (const p of PRINCIPAIS) if (!vistos.includes(p) && !ocultos.includes(p)) secoes = entrarNaMesa(secoes, p);

  const ladoAnterior: ArranjoMesa["ladoAnterior"] = {};
  if (ehObjeto(bruto.ladoAnterior)) {
    for (const [k, v] of Object.entries(bruto.ladoAnterior)) if (ehCardId(k) && ehLado(v)) ladoAnterior[k] = v;
  }
  const den = ehObjeto(bruto.densidade) ? bruto.densidade : {};
  const porCard: ArranjoMesa["densidade"]["porCard"] = {};
  if (ehObjeto(den.porCard)) {
    for (const [k, v] of Object.entries(den.porCard)) if (ehCardId(k) && ehDensidade(v)) porCard[k] = v;
  }
  return {
    versao: 2,
    secoes,
    ocultos,
    ladoAnterior,
    densidade: { mesa: ehDensidade(den.mesa) ? den.mesa : "compacto", porCard },
    movido: bruto.movido === true,
    fraseComFita: bruto.fraseComFita !== false,
  };
}

// ─── Persistência ─────────────────────────────────────────────────────────

let avisouGravacao = false;
function gravar(storage: Armazenamento, chave: string, valor: unknown): boolean {
  try {
    storage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    if (!avisouGravacao) {
      console.warn("[mesa-viva] não deu para gravar no localStorage; a mesa segue só em memória");
      avisouGravacao = true;
    }
    return false;
  }
}

/** Lê o arranjo da pessoa (v1 é migrado para v2). `problema` = havia algo salvo e não deu para ler. */
export function lerArranjo(storage: Armazenamento, usuarioId: string): { arranjo: ArranjoMesa; problema: boolean } {
  let txt: string | null;
  try {
    txt = storage.getItem(chaveMesa(usuarioId));
  } catch {
    return { arranjo: arranjoPadrao(), problema: false };
  }
  if (txt === null) return { arranjo: arranjoPadrao(), problema: false };
  try {
    const n = normalizarArranjo(JSON.parse(txt));
    if (n) return { arranjo: n, problema: false };
  } catch {
    /* cai no aviso abaixo */
  }
  console.warn("[mesa-viva] arranjo salvo inválido, voltando ao padrão");
  return { arranjo: arranjoPadrao(), problema: true };
}

export const salvarArranjo = (storage: Armazenamento, usuarioId: string, a: ArranjoMesa) => gravar(storage, chaveMesa(usuarioId), a);

export function apagarArranjo(storage: Armazenamento, usuarioId: string) {
  try {
    storage.removeItem(chaveMesa(usuarioId));
  } catch {
    /* sem armazenamento: nada a apagar */
  }
}

/** Preferências do protótipo. O `modoSub` antigo (B1 x B2) é ignorado: só Acordeão. */
export function lerPrefs(storage: Armazenamento): PrefsPrototipo {
  const padrao: PrefsPrototipo = { tema: "claro" };
  try {
    const txt = storage.getItem(CHAVE_PREFS);
    if (!txt) return padrao;
    const b = JSON.parse(txt) as unknown;
    if (!ehObjeto(b)) throw new Error("formato");
    return { tema: b.tema === "escuro" ? "escuro" : "claro" };
  } catch {
    console.warn("[mesa-viva] preferências salvas inválidas, voltando ao padrão");
    return padrao;
  }
}

export const salvarPrefs = (storage: Armazenamento, p: PrefsPrototipo) => gravar(storage, CHAVE_PREFS, p);

/**
 * A entrada animada da frase do dia roda só na primeira abertura da mesa no
 * dia. true = ainda não rodou hoje (ou não dá para saber: sem armazenamento,
 * anima e segue).
 */
export function deveAnimarEntradaFrase(storage: Armazenamento, dia: string): boolean {
  try {
    return storage.getItem(CHAVE_FRASE_ENTRADA) !== dia;
  } catch {
    return true;
  }
}

/** Grava que a entrada da frase já rodou neste dia. */
export function marcarEntradaFrase(storage: Armazenamento, dia: string) {
  try {
    storage.setItem(CHAVE_FRASE_ENTRADA, dia);
  } catch {
    /* sem armazenamento: anima de novo na próxima abertura, sem erro */
  }
}

// ─── Helpers internos ─────────────────────────────────────────────────────

const iguais = (x: Secao[], y: Secao[]) => JSON.stringify(x) === JSON.stringify(y);

/** Insere `id` antes do `indiceVisivel`-ésimo card visível (no fim se passar). */
function inserirNaVisivel(lista: CardId[], id: CardId, indiceVisivel: number, papel: Papel): CardId[] {
  const out = [...lista];
  let vis = 0;
  for (let k = 0; k < out.length; k++) {
    if (!cardDisponivel(out[k], papel)) continue;
    if (vis === indiceVisivel) {
      out.splice(k, 0, id);
      return out;
    }
    vis++;
  }
  // Depois do último visível (os invisíveis do fim ficam onde estão).
  let ultimoVis = -1;
  out.forEach((x, k) => {
    if (cardDisponivel(x, papel)) ultimoVis = k;
  });
  out.splice(ultimoVis + 1 || out.length, 0, id);
  return out;
}

const semCard = (secoes: Secao[], id: CardId): Secao[] =>
  secoes
    .filter((s) => !(s.tipo === "largo" && s.id === id))
    .map((s) => (s.tipo === "colunas" ? { tipo: "colunas", esquerda: s.esquerda.filter((x) => x !== id), direita: s.direita.filter((x) => x !== id) } : s));

/** Card que entra na mesa (gaveta/galeria): largo de fábrica vira seção no fim; normal vai para a coluna mais curta do último bloco. */
function entrarNaMesa(secoes: Secao[], id: CardId): Secao[] {
  if (CATALOGO[id].tamanhoPadrao === "largo") return normalizarSecoes([...secoes, { tipo: "largo", id }]);
  const base = normalizarSecoes(secoes);
  const ultimo = base[base.length - 1] as SecaoColunas;
  const lado: Lado = ultimo.direita.length < ultimo.esquerda.length ? "dir" : "esq";
  const novo: SecaoColunas = { ...ultimo, [campo(lado)]: [...ultimo[campo(lado)], id] };
  return [...base.slice(0, -1), novo];
}

/** Colunas do arranjo em ordem lógica: [seção, lado]. */
const colunasEmOrdem = (secoes: Secao[]) =>
  secoes.flatMap((s, i) => (s.tipo === "colunas" ? ([[i, "esq"], [i, "dir"]] as [number, Lado][]) : []));

const comSecoes = (a: ArranjoMesa, secoes: Secao[], mexeu = true): ArranjoMesa => {
  const n = normalizarSecoes(secoes);
  if (iguais(n, a.secoes)) return a;
  return { ...a, secoes: n, movido: mexeu ? true : a.movido };
};

// ─── Teclado (botões do card) ─────────────────────────────────────────────

/**
 * ↑ (-1) / ↓ (+1) na ordem lógica, contando só os cards visíveis (os que o
 * papel não vê ficam no lugar). Card normal: dentro da coluna troca com o
 * vizinho; no fim da esquerda vai para o topo da direita; no fim da direita
 * vai para o topo da esquerda do próximo bloco (atravessa o largo). ↑ é o
 * espelho. Card largo: troca de lugar com a seção vizinha que tenha card
 * visível. Na ponta devolve o mesmo objeto.
 */
export function moverNaOrdem(a: ArranjoMesa, id: CardId, delta: -1 | 1, papel: Papel): ArranjoMesa {
  const p = posicaoDe(a, id);
  if (!p) return a;
  if (p.lado === "largo") {
    const temVisivel = (s: Secao) =>
      s.tipo === "largo" ? cardDisponivel(s.id, papel) : [...s.esquerda, ...s.direita].some((x) => cardDisponivel(x, papel));
    let t = p.secao + delta;
    while (t >= 0 && t < a.secoes.length && !temVisivel(a.secoes[t])) t += delta;
    if (t < 0 || t >= a.secoes.length) return a;
    const nova = [...a.secoes];
    [nova[p.secao], nova[t]] = [nova[t], nova[p.secao]];
    return comSecoes(a, nova);
  }
  const sec = a.secoes[p.secao] as SecaoColunas;
  const coluna = sec[campo(p.lado)];
  const vis = coluna.filter((x) => cardDisponivel(x, papel));
  const j = vis.indexOf(id);
  const alvoNaColuna = j + delta;
  if (alvoNaColuna >= 0 && alvoNaColuna < vis.length) {
    // Troca com o vizinho visível da mesma coluna.
    const outroId = vis[alvoNaColuna];
    const nova = coluna.map((x) => (x === id ? outroId : x === outroId ? id : x));
    const secoes = a.secoes.map((s, i) => (i === p.secao ? { ...sec, [campo(p.lado)]: nova } : s));
    return comSecoes(a, secoes);
  }
  // Atravessa para a coluna vizinha na ordem lógica.
  const cols = colunasEmOrdem(a.secoes);
  const k = cols.findIndex(([s, l]) => s === p.secao && l === p.lado);
  const destino = cols[k + delta];
  if (!destino) return a;
  const [sd, ld] = destino;
  const semEle = semCard(a.secoes, id) as Secao[];
  const alvo = semEle[sd] as SecaoColunas;
  const lista = alvo[campo(ld)];
  const nVis = lista.filter((x) => cardDisponivel(x, papel)).length;
  const inserida = inserirNaVisivel(lista, id, delta === 1 ? 0 : nVis, papel);
  return comSecoes(a, semEle.map((s, i) => (i === sd ? { ...alvo, [campo(ld)]: inserida } : s)));
}

export const podeMover = (a: ArranjoMesa, id: CardId, delta: -1 | 1, papel: Papel) => moverNaOrdem(a, id, delta, papel) !== a;

/** ← → (card normal): troca de coluna no mesmo bloco, no índice min(i, tamanho da outra). */
export function trocarColuna(a: ArranjoMesa, id: CardId, para: Lado, papel: Papel): ArranjoMesa {
  const p = posicaoDe(a, id);
  if (!p || p.lado === "largo" || p.lado === para) return a;
  const sec = a.secoes[p.secao] as SecaoColunas;
  const i = sec[campo(p.lado)].filter((x) => cardDisponivel(x, papel)).indexOf(id);
  const origem = sec[campo(p.lado)].filter((x) => x !== id);
  const destino = sec[campo(para)];
  const nVis = destino.filter((x) => cardDisponivel(x, papel)).length;
  const novo: SecaoColunas = { tipo: "colunas", esquerda: [], direita: [] };
  novo[campo(p.lado)] = origem;
  novo[campo(para)] = inserirNaVisivel(destino, id, Math.min(i, nVis), papel);
  return comSecoes(a, a.secoes.map((s, k) => (k === p.secao ? novo : s)));
}

// ─── Tamanho (normal ↔ largo) ─────────────────────────────────────────────

/**
 * Normal → largo: corta as duas colunas do bloco na altura (índice) do card.
 * O que estava acima nas duas colunas fica acima; o resto vai para baixo.
 * Guarda a coluna de origem em `ladoAnterior`.
 */
export function paraLargo(a: ArranjoMesa, id: CardId): ArranjoMesa {
  const p = posicaoDe(a, id);
  if (!p || p.lado === "largo") return a;
  const sec = a.secoes[p.secao] as SecaoColunas;
  const i = p.indice;
  const meu = sec[campo(p.lado)];
  const dele = sec[campo(outro(p.lado))];
  const cima: SecaoColunas = { tipo: "colunas", esquerda: [], direita: [] };
  const baixo: SecaoColunas = { tipo: "colunas", esquerda: [], direita: [] };
  cima[campo(p.lado)] = meu.slice(0, i);
  baixo[campo(p.lado)] = meu.slice(i + 1);
  cima[campo(outro(p.lado))] = dele.slice(0, i);
  baixo[campo(outro(p.lado))] = dele.slice(i);
  const secoes = [...a.secoes.slice(0, p.secao), cima, { tipo: "largo", id } as SecaoLargo, baixo, ...a.secoes.slice(p.secao + 1)];
  return { ...a, secoes: normalizarSecoes(secoes), ladoAnterior: { ...a.ladoAnterior, [id]: p.lado } };
}

/**
 * Largo → normal: volta para a coluna de onde saiu (`ladoAnterior`; largo de
 * fábrica vai para a esquerda), na junção dos blocos de cima e de baixo, que
 * se fundem de novo.
 */
export function paraNormal(a: ArranjoMesa, id: CardId): ArranjoMesa {
  const secoes = normalizarSecoes(a.secoes);
  const s = secoes.findIndex((x) => x.tipo === "largo" && x.id === id);
  if (s < 0) return a;
  const cima = secoes[s - 1] as SecaoColunas;
  const baixo = secoes[s + 1] as SecaoColunas;
  const lado = a.ladoAnterior[id] ?? "esq";
  const junto: SecaoColunas = {
    tipo: "colunas",
    esquerda: [...cima.esquerda, ...baixo.esquerda],
    direita: [...cima.direita, ...baixo.direita],
  };
  junto[campo(lado)] = [...cima[campo(lado)], id, ...baixo[campo(lado)]];
  const ladoAnterior = { ...a.ladoAnterior };
  delete ladoAnterior[id];
  return { ...a, secoes: normalizarSecoes([...secoes.slice(0, s - 1), junto, ...secoes.slice(s + 2)]), ladoAnterior };
}

export function alternarTamanho(a: ArranjoMesa, id: CardId): ArranjoMesa {
  const p = posicaoDe(a, id);
  if (!p) return a;
  return p.lado === "largo" ? paraNormal(a, id) : paraLargo(a, id);
}

// ─── Arrastar ─────────────────────────────────────────────────────────────

/** Uma entrada por coluna de cada bloco (inclusive vazias), só com os ids visíveis. */
export function colunasDeTrabalho(a: ArranjoMesa, papel: Papel): ColunasTrabalho {
  const t: ColunasTrabalho = {};
  for (const v of vistaDaMesa(a, papel)) {
    if (v.tipo !== "colunas") continue;
    t[chaveColuna(v.chave, "esq")] = [...v.esquerda];
    t[chaveColuna(v.chave, "dir")] = [...v.direita];
  }
  return t;
}

export function containerDe(t: ColunasTrabalho, id: string): string | null {
  if (id in t) return id;
  for (const [k, lista] of Object.entries(t)) if (lista.includes(id as CardId)) return k;
  return null;
}

/** Move `id` para a coluna `para`, no `indice` (limitado ao tamanho). */
export function moverNoTrabalho(t: ColunasTrabalho, id: CardId, para: string, indice: number): ColunasTrabalho {
  const de = containerDe(t, id);
  if (!de || !(para in t)) return t;
  const atual = t[de].indexOf(id);
  const semEle = t[de].filter((x) => x !== id);
  const destino = de === para ? semEle : [...t[para]];
  const i = Math.max(0, Math.min(indice, destino.length));
  if (de === para && i === atual) return t;
  destino.splice(i, 0, id);
  return de === para ? { ...t, [de]: destino } : { ...t, [de]: semEle, [para]: destino };
}

/**
 * Escreve o trabalho de volta no arranjo. Cada card invisível fica logo
 * depois do visível que o precedia (ou no topo, se não havia).
 */
export function aplicarColunasDeTrabalho(a: ArranjoMesa, t: ColunasTrabalho, papel: Papel): ArranjoMesa {
  const reconstruir = (completa: CardId[], novaVisivel: CardId[] | undefined) => {
    if (!novaVisivel) return completa;
    const res = [...novaVisivel];
    let ancora = -1;
    for (const x of completa) {
      if (cardDisponivel(x, papel)) {
        const k = res.indexOf(x);
        if (k >= 0) ancora = k;
      } else {
        res.splice(ancora + 1, 0, x);
        ancora++;
      }
    }
    return res;
  };
  const secoes = a.secoes.map((s, i): Secao => {
    if (s.tipo !== "colunas") return s;
    const chave = chaveDoBloco(a.secoes, i);
    return {
      tipo: "colunas",
      esquerda: reconstruir(s.esquerda, t[chaveColuna(chave, "esq")]),
      direita: reconstruir(s.direita, t[chaveColuna(chave, "dir")]),
    };
  });
  return comSecoes(a, secoes);
}

/** Card largo arrastado: arrayMove da seção para `paraSecao` (índice em arranjo.secoes) e normaliza. */
export function moverLargo(a: ArranjoMesa, id: CardId, paraSecao: number): ArranjoMesa {
  const s = a.secoes.findIndex((x) => x.tipo === "largo" && x.id === id);
  if (s < 0 || paraSecao === s || paraSecao < 0 || paraSecao >= a.secoes.length) return a;
  const nova = [...a.secoes];
  const [item] = nova.splice(s, 1);
  nova.splice(paraSecao, 0, item);
  return comSecoes(a, nova);
}

// ─── Gaveta / galeria ─────────────────────────────────────────────────────

/** Tira da mesa (um largo que sai faz os blocos vizinhos se juntarem). */
export function ocultar(a: ArranjoMesa, id: CardId): ArranjoMesa {
  if (!posicaoDe(a, id)) return a;
  const ladoAnterior = { ...a.ladoAnterior };
  delete ladoAnterior[id];
  return { ...a, secoes: normalizarSecoes(semCard(a.secoes, id)), ocultos: [...a.ocultos.filter((x) => x !== id), id], ladoAnterior };
}

/** Da gaveta de volta para a mesa (fim). */
export function restaurar(a: ArranjoMesa, id: CardId): ArranjoMesa {
  if (!a.ocultos.includes(id)) return a;
  return { ...a, ocultos: a.ocultos.filter((x) => x !== id), secoes: entrarNaMesa(a.secoes, id) };
}

/** Da galeria para a mesa (fim). */
export function adicionar(a: ArranjoMesa, id: CardId): ArranjoMesa {
  if (posicaoDe(a, id)) return a;
  return { ...a, ocultos: a.ocultos.filter((x) => x !== id), secoes: entrarNaMesa(a.secoes, id) };
}

// ─── Densidade e frase ────────────────────────────────────────────────────

export function definirDensidadeMesa(a: ArranjoMesa, d: Densidade): ArranjoMesa {
  return { ...a, densidade: { ...a.densidade, mesa: d } };
}

export function definirDensidadeCard(a: ArranjoMesa, id: CardId, d: DensidadeCard): ArranjoMesa {
  const porCard = { ...a.densidade.porCard };
  if (d === "seguir") delete porCard[id];
  else porCard[id] = d;
  return { ...a, densidade: { ...a.densidade, porCard } };
}

export function definirFraseComFita(a: ArranjoMesa, comFita: boolean): ArranjoMesa {
  return a.fraseComFita === comFita ? a : { ...a, fraseComFita: comFita };
}
