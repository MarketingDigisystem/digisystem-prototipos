// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/regras.ts (DigiPlace) e loja-digi-store/ (Digi Store), lidos em 2026-11-11; reescrito aqui, sem importar delas.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Funções puras: nunca mutam a entrada e lançam Error em português quando a operação não vale.

import type {
  Brinde,
  DadosPedido,
  DadosBrinde,
  Estado,
  EstadoPedido,
  HistoricoBrinde,
  LinhaEntrada,
  LinhaGasto,
  LinhaPedido,
  Metricas,
  Movimentacao,
  Pedido,
  Sugestao,
  Urgencia,
  ValorPedido,
} from "./tipos";
import { ROTULO_ESTADO } from "./formato";

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

export const PRAZO_MINIMO_DIAS_UTEIS = 2;
/** Valor fixo para todos os brindes: o selo não revela o mínimo de estoque. */
export const LIMITE_ULTIMAS_UNIDADES = 5;

export const TRANSICOES: Record<EstadoPedido, EstadoPedido[]> = {
  solicitada: ["em_alinhamento", "recusada", "cancelada"],
  em_alinhamento: ["pronto", "recusada", "cancelada"],
  pronto: ["encerrada", "cancelada"],
  encerrada: [],
  recusada: [],
  cancelada: [],
};

const ESTADOS_ATIVOS: EstadoPedido[] = ["solicitada", "em_alinhamento", "pronto"];

/* ------------------------------------------------------------------ */
/* Datas (ISO AAAA-MM-DD, sempre em UTC para não depender do fuso)     */
/* ------------------------------------------------------------------ */

const RE_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function dataValida(iso: string): boolean {
  if (!RE_ISO.test(iso)) return false;
  return paraIso(paraData(iso)) === iso;
}

function paraData(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

function paraIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function hojeDe(e: Pick<Estado, "agora">): string {
  return e.agora.slice(0, 10);
}

/** Soma dias úteis (segunda a sexta). Sem calendário de feriados no protótipo. */
export function somarDiasUteis(iso: string, dias: number): string {
  const d = paraData(iso);
  let faltam = Math.max(0, Math.floor(dias));
  while (faltam > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) faltam -= 1;
  }
  return paraIso(d);
}

/** Dias corridos de a até b (negativo se b vier antes). */
export function diasEntre(a: string, b: string): number {
  return Math.round((paraData(b).getTime() - paraData(a).getTime()) / 86_400_000);
}

export function formatarDdMm(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function mesAnteriorDe(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 2, 1));
  return d.toISOString().slice(0, 7);
}

/* ------------------------------------------------------------------ */
/* Estoque e selos                                                     */
/* ------------------------------------------------------------------ */

/** Saldo menos reserva do brinde. Personalizável não tem saldo próprio (0/0/0). */
export function disponivel(b: Brinde): number {
  if (b.tipo !== "estoque") return 0;
  return b.saldo - b.reserva;
}

export function ultimasUnidades(disp: number): boolean {
  return disp > 0 && disp <= LIMITE_ULTIMAS_UNIDADES;
}

export function selos(b: Brinde): { novidade: boolean; ultimasUnidades: boolean; indisponivel: boolean } {
  const disp = disponivel(b);
  return {
    novidade: b.novidade,
    ultimasUnidades: b.tipo === "estoque" && ultimasUnidades(disp),
    indisponivel: b.tipo === "estoque" && disp <= 0,
  };
}

/* ------------------------------------------------------------------ */
/* Validações                                                          */
/* ------------------------------------------------------------------ */

type Validacao = { ok: boolean; erros: string[] };

function inteiroPositivo(n: number): boolean {
  return Number.isInteger(n) && n >= 1;
}

export function validarLinha(b: Brinde, qtd: number): Validacao {
  const erros: string[] = [];
  if (!b.ativo) erros.push("Este brinde não está ativo.");
  if (!inteiroPositivo(qtd)) {
    erros.push("Informe uma quantidade inteira, a partir de 1.");
  } else if (b.tipo === "estoque") {
    const disp = disponivel(b);
    if (disp <= 0) erros.push("Indisponível no momento.");
    else if (qtd > disp) erros.push(`Só há ${disp} disponíveis.`);
  }
  // Personalizável: sem saldo e sem mínimo por brinde; vale só o inteiro a partir de 1.
  return { ok: erros.length === 0, erros };
}

/** Primeira data aceita: hoje + 2 dias úteis + prazo extra da personalização. */
export function dataMinima(prazoExtraDiasUteis: number, hoje: string): string {
  return somarDiasUteis(hoje, PRAZO_MINIMO_DIAS_UTEIS + Math.max(0, prazoExtraDiasUteis));
}

/** Data desejada é opcional; se preenchida, respeita o prazo mínimo. */
export function validarDataDesejada(
  data: string | undefined,
  prazoExtraDiasUteis: number,
  hoje: string,
): { ok: boolean; erros: string[]; sugestao?: string } {
  if (data === undefined || data === "") return { ok: true, erros: [] };
  if (!dataValida(data)) return { ok: false, erros: ["Informe uma data válida."] };
  const minima = dataMinima(prazoExtraDiasUteis, hoje);
  if (data < minima) {
    return { ok: false, erros: [`A data precisa ser a partir de ${formatarDdMm(minima)}.`], sugestao: minima };
  }
  return { ok: true, erros: [] };
}

/** Maior prazo extra entre as linhas personalizáveis (0 se não houver). */
export function prazoExtraDasLinhas(brindes: Brinde[], linhas: Pick<LinhaEntrada, "brindeId">[]): number {
  let max = 0;
  for (const l of linhas) {
    const b = brindes.find((x) => x.id === l.brindeId);
    if (b?.tipo === "personalizavel") max = Math.max(max, b.prazoExtraDiasUteis ?? 0);
  }
  return max;
}

/* ------------------------------------------------------------------ */
/* Utilitários internos                                                */
/* ------------------------------------------------------------------ */

function clonar<T>(x: T): T {
  return structuredClone(x);
}

function proximoId(d: Estado, prefixo: string): string {
  const id = `${prefixo}-${d.seq}`;
  d.seq += 1;
  return id;
}

function achar<T extends { id: string }>(lista: T[], id: string, rotulo: string): T {
  const x = lista.find((i) => i.id === id);
  if (!x) throw new Error(`${rotulo} não encontrado.`);
  return x;
}

function registrar(
  d: Estado,
  m: Omit<Movimentacao, "id" | "em"> & { em?: string },
): void {
  d.movimentacoes.push({ ...m, id: proximoId(d, "M"), em: m.em ?? d.agora });
}

function textoObrigatorio(texto: string | undefined, mensagem: string): string {
  const t = (texto ?? "").trim();
  if (!t) throw new Error(mensagem);
  return t;
}

/* ------------------------------------------------------------------ */
/* Pedido: criar, mudar estado, orçamento, ajuste                      */
/* ------------------------------------------------------------------ */

export function criarPedido(e: Estado, dados: DadosPedido, linhas: LinhaEntrada[]): Estado {
  const d = clonar(e);
  const pessoa = d.pessoas.find((p) => p.id === dados.solicitanteId);
  if (!pessoa) throw new Error("Solicitante não encontrado.");
  const finalidade = textoObrigatorio(dados.finalidade, "Informe a finalidade do pedido.");
  if (linhas.length === 0) throw new Error("O carrinho está vazio.");

  // Valida cada linha e a soma por brinde de estoque (duas linhas do mesmo brinde somam).
  const somaPorBrinde = new Map<string, number>();
  const novasLinhas: LinhaPedido[] = [];
  for (const l of linhas) {
    const b = achar(d.brindes, l.brindeId, "Brinde");
    const r = validarLinha(b, l.qtd);
    if (!r.ok) throw new Error(`${b.nome}: ${r.erros.join(" ")}`);
    if (b.tipo === "estoque") {
      const soma = (somaPorBrinde.get(b.id) ?? 0) + l.qtd;
      if (soma > disponivel(b)) throw new Error(`${b.nome}: só há ${disponivel(b)} disponíveis.`);
      somaPorBrinde.set(b.id, soma);
    }
    novasLinhas.push({
      brindeId: b.id,
      qtd: l.qtd,
      tipo: b.tipo,
      custoUnitarioNaHora: b.tipo === "estoque" ? b.custoUnitario : null,
      personalizacao: l.personalizacao,
      orcamentoAceito: false,
    });
  }

  const data = validarDataDesejada(dados.dataDesejada, prazoExtraDasLinhas(d.brindes, linhas), hojeDe(d));
  if (!data.ok) throw new Error(data.erros.join(" "));

  // Tudo válido: reserva só as linhas de estoque.
  for (const l of novasLinhas) {
    if (l.tipo !== "estoque") continue;
    achar(d.brindes, l.brindeId, "Brinde").reserva += l.qtd;
  }

  const pedido: Pedido = {
    id: proximoId(d, "P"),
    solicitanteId: pessoa.id,
    areaSolicitante: pessoa.area ?? "",
    finalidade,
    destino: dados.destino?.trim() || undefined,
    observacao: dados.observacao?.trim() || undefined,
    dataDesejada: dados.dataDesejada || undefined,
    linhas: novasLinhas,
    estado: "solicitada",
    historico: [{ estado: "solicitada", quem: pessoa.id, em: d.agora }],
  };
  d.pedidos.push(pedido);
  return d;
}

export function mudarEstado(
  e: Estado,
  pedidoId: string,
  alvo: EstadoPedido,
  quem: string,
  motivo?: string,
): Estado {
  const d = clonar(e);
  const p = achar(d.pedidos, pedidoId, "Pedido");
  if (!TRANSICOES[p.estado].includes(alvo)) {
    throw new Error(`Não é possível passar o pedido de "${ROTULO_ESTADO[p.estado]}" para "${ROTULO_ESTADO[alvo]}".`);
  }
  const exigeMotivo = alvo === "recusada" || alvo === "cancelada";
  const motivoLimpo = exigeMotivo ? textoObrigatorio(motivo, "Informe o motivo.") : undefined;

  if (alvo === "pronto") {
    const pendente = p.linhas.some(
      (l) => l.tipo === "personalizavel" && !(l.orcamentoAceito && l.orcamentoUnitario !== undefined),
    );
    if (pendente) throw new Error("Falta o orçamento aceito de um brinde personalizável.");
  }

  if (alvo === "encerrada") {
    for (const l of p.linhas) {
      if (l.tipo !== "estoque") continue;
      const b = achar(d.brindes, l.brindeId, "Brinde");
      if (b.saldo < l.qtd || b.reserva < l.qtd) throw new Error("Estoque insuficiente para confirmar a retirada do pedido.");
      b.saldo -= l.qtd;
      b.reserva -= l.qtd;
      registrar(d, { brindeId: l.brindeId, tipo: "saida", qtd: l.qtd, quem, pedidoId: p.id });
    }
  } else if (exigeMotivo) {
    for (const l of p.linhas) {
      if (l.tipo !== "estoque") continue;
      achar(d.brindes, l.brindeId, "Brinde").reserva -= l.qtd;
    }
  }

  p.estado = alvo;
  p.historico.push({ estado: alvo, quem, em: d.agora, motivo: motivoLimpo });
  return d;
}

function linhaDoPedido(p: Pedido, indice: number): LinhaPedido {
  const l = p.linhas[indice];
  if (!l) throw new Error("Linha do pedido não encontrada.");
  return l;
}

/** O Marketing informa o valor unitário do orçamento, dentro da linha, em "Em preparação". */
export function informarOrcamento(
  e: Estado,
  pedidoId: string,
  indiceLinha: number,
  valorUnitario: number,
  quem: string,
): Estado {
  const d = clonar(e);
  const p = achar(d.pedidos, pedidoId, "Pedido");
  if (p.estado !== "em_alinhamento") throw new Error(`O orçamento só é informado com o pedido em "${ROTULO_ESTADO.em_alinhamento}".`);
  const l = linhaDoPedido(p, indiceLinha);
  if (l.tipo !== "personalizavel") throw new Error("Só brindes personalizáveis têm orçamento.");
  if (!Number.isFinite(valorUnitario) || valorUnitario <= 0) throw new Error("Informe um valor unitário maior que zero.");
  l.orcamentoUnitario = valorUnitario;
  l.orcamentoAceito = false;
  p.historico.push({ estado: p.estado, quem, em: d.agora, nota: "Orçamento informado." });
  return d;
}

/** O diretor aceita o orçamento da linha. */
export function aceitarOrcamento(e: Estado, pedidoId: string, indiceLinha: number, quem: string): Estado {
  const d = clonar(e);
  const p = achar(d.pedidos, pedidoId, "Pedido");
  if (p.estado !== "em_alinhamento") throw new Error(`O aceite só vale com o pedido em "${ROTULO_ESTADO.em_alinhamento}".`);
  const l = linhaDoPedido(p, indiceLinha);
  if (l.tipo !== "personalizavel" || l.orcamentoUnitario === undefined) {
    throw new Error("Não há orçamento para aceitar nesta linha.");
  }
  l.orcamentoAceito = true;
  p.historico.push({ estado: p.estado, quem, em: d.agora, nota: "Orçamento aceito." });
  return d;
}

/** Ajusta a quantidade de uma linha em "Recebido" ou "Em preparação", com nota obrigatória. */
export function ajustarQuantidadeLinha(
  e: Estado,
  pedidoId: string,
  indiceLinha: number,
  novaQtd: number,
  quem: string,
  nota: string,
): Estado {
  const d = clonar(e);
  const p = achar(d.pedidos, pedidoId, "Pedido");
  if (p.estado !== "solicitada" && p.estado !== "em_alinhamento") {
    throw new Error(`A quantidade só muda enquanto o pedido está em "${ROTULO_ESTADO.solicitada}" ou "${ROTULO_ESTADO.em_alinhamento}".`);
  }
  const notaLimpa = textoObrigatorio(nota, "Informe a nota do ajuste.");
  const l = linhaDoPedido(p, indiceLinha);
  const b = achar(d.brindes, l.brindeId, "Brinde");
  if (!inteiroPositivo(novaQtd)) throw new Error("Informe uma quantidade inteira, a partir de 1.");
  if (l.tipo === "estoque") {
    const delta = novaQtd - l.qtd;
    if (delta > disponivel(b)) throw new Error(`Só há ${disponivel(b)} disponíveis a mais.`);
    b.reserva += delta;
  } else {
    l.orcamentoAceito = false; // quantidade nova pede novo aceite
  }
  l.qtd = novaQtd;
  l.notaAjuste = notaLimpa;
  p.historico.push({ estado: p.estado, quem, em: d.agora, nota: notaLimpa });
  return d;
}

/* ------------------------------------------------------------------ */
/* Estoque: entrada e ajuste                                           */
/* ------------------------------------------------------------------ */

export function registrarEntrada(
  e: Estado,
  brindeId: string,
  qtd: number,
  quem: string,
  nota?: string,
): Estado {
  const d = clonar(e);
  const b = achar(d.brindes, brindeId, "Brinde");
  if (b.tipo !== "estoque") throw new Error("Brinde personalizável não tem saldo próprio.");
  if (!inteiroPositivo(qtd)) throw new Error("Informe uma quantidade inteira, a partir de 1.");
  b.saldo += qtd;
  registrar(d, { brindeId, tipo: "entrada", qtd, quem, nota: nota?.trim() || undefined });
  return d;
}

/** Ajuste com sinal e nota obrigatória; o saldo nunca fica abaixo da reserva. */
export function registrarAjuste(
  e: Estado,
  brindeId: string,
  delta: number,
  quem: string,
  nota: string,
): Estado {
  const d = clonar(e);
  const b = achar(d.brindes, brindeId, "Brinde");
  if (b.tipo !== "estoque") throw new Error("Brinde personalizável não tem saldo próprio.");
  if (!Number.isInteger(delta) || delta === 0) throw new Error("Informe um ajuste inteiro diferente de zero.");
  const notaLimpa = textoObrigatorio(nota, "Informe o motivo do ajuste.");
  if (b.saldo + delta < b.reserva) throw new Error("O saldo não pode ficar abaixo do que está reservado.");
  b.saldo += delta;
  registrar(d, { brindeId, tipo: "ajuste", qtd: delta, quem, nota: notaLimpa });
  return d;
}

/**
 * Recalcula saldo (a partir das movimentações) e reserva (a partir dos pedidos ativos).
 * Usado no mock para a conta fechar desde o início.
 */
export function reconstruirEstoque(brindes: Brinde[], pedidos: Pedido[], movs: Movimentacao[]): Brinde[] {
  const saldo = new Map<string, number>();
  const reserva = new Map<string, number>();
  for (const m of movs) {
    const sinal = m.tipo === "saida" ? -m.qtd : m.qtd;
    saldo.set(m.brindeId, (saldo.get(m.brindeId) ?? 0) + sinal);
  }
  for (const p of pedidos) {
    if (!ESTADOS_ATIVOS.includes(p.estado)) continue;
    for (const l of p.linhas) {
      if (l.tipo !== "estoque") continue;
      reserva.set(l.brindeId, (reserva.get(l.brindeId) ?? 0) + l.qtd);
    }
  }
  return brindes.map((b) => ({
    ...b,
    saldo: saldo.get(b.id) ?? 0,
    reserva: reserva.get(b.id) ?? 0,
  }));
}

/* ------------------------------------------------------------------ */
/* Cadastro de brinde (gestão)                                         */
/* ------------------------------------------------------------------ */

function slugDe(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function idUnico(base: string, usados: Set<string>): string {
  const raiz = base || "item";
  let id = raiz;
  let n = 2;
  while (usados.has(id)) {
    id = `${raiz}-${n}`;
    n += 1;
  }
  return id;
}

/**
 * Cria (id vazio ou desconhecido) ou edita um brinde. Saldo e reserva nunca vêm do formulário:
 * o brinde novo nasce com `saldoInicial` (gera a movimentação `saldo_inicial`) e reserva 0; editar não
 * altera saldo nem reserva (entrada e ajuste ficam no Estoque). O tipo não muda depois de criado.
 */
export function salvarBrinde(e: Estado, brinde: DadosBrinde, quem = "gestao"): Estado {
  const d = clonar(e);
  const nome = textoObrigatorio(brinde.nome, "Informe o nome do brinde.");
  const categoria = textoObrigatorio(brinde.categoria, "Informe a categoria.");
  const foto = textoObrigatorio(brinde.foto, "Escolha uma foto.");

  let prazoExtraDiasUteis: number | undefined;
  let custoUnitario: number | null = null;
  let minimo = 0;
  if (brinde.tipo === "estoque") {
    if (brinde.custoUnitario === null || !Number.isFinite(brinde.custoUnitario) || brinde.custoUnitario <= 0) {
      throw new Error("Informe o custo unitário, maior que zero.");
    }
    custoUnitario = brinde.custoUnitario;
    minimo = brinde.minimo ?? 0;
    if (!Number.isInteger(minimo) || minimo < 0) throw new Error("O mínimo de estoque é um número inteiro, a partir de 0.");
    const inicial = brinde.saldoInicial ?? 0;
    if (!Number.isInteger(inicial) || inicial < 0) throw new Error("O saldo inicial é um número inteiro, a partir de 0.");
  } else {
    const prazo = brinde.prazoExtraDiasUteis ?? 0;
    if (!Number.isInteger(prazo) || prazo < 0) throw new Error("O prazo extra é um número inteiro de dias úteis, a partir de 0.");
    prazoExtraDiasUteis = prazo;
  }

  const existente = d.brindes.find((b) => b.id === brinde.id);
  if (existente && existente.tipo !== brinde.tipo) throw new Error("O tipo do brinde não muda depois de criado.");

  const campos = {
    nome,
    categoria,
    foto,
    descricao: brinde.descricao.trim(),
    tipo: brinde.tipo,
    custoUnitario,
    minimo,
    prazoExtraDiasUteis,
    opcoesPersonalizacao: brinde.tipo === "personalizavel" ? brinde.opcoesPersonalizacao : undefined,
    novidade: brinde.novidade,
    ativo: brinde.ativo,
  };

  if (existente) {
    Object.assign(existente, campos);
  } else {
    const id = idUnico(slugDe(nome), new Set(d.brindes.flatMap((b) => [b.id, b.slug])));
    const saldo = brinde.tipo === "estoque" ? (brinde.saldoInicial ?? 0) : 0;
    d.brindes.push({ id, slug: id, ...campos, saldo, reserva: 0 });
    if (saldo > 0) registrar(d, { brindeId: id, tipo: "saldo_inicial", qtd: saldo, quem });
  }
  return d;
}

/** Ativa ou desativa um brinde (some da vitrine; pedidos já feitos seguem o fluxo). */
export function alternarAtivo(e: Estado, id: string): Estado {
  const d = clonar(e);
  const b = achar(d.brindes, id, "Brinde");
  b.ativo = !b.ativo;
  return d;
}

/* ------------------------------------------------------------------ */
/* Sugestões                                                           */
/* ------------------------------------------------------------------ */

export function criarSugestao(e: Estado, autorId: string, nome: string, descricao: string): Estado {
  const d = clonar(e);
  achar(d.pessoas, autorId, "Pessoa");
  const s: Sugestao = {
    id: proximoId(d, "S"),
    autorId,
    nome: textoObrigatorio(nome, "Informe o nome do brinde."),
    descricao: descricao.trim(),
    estado: "sugerida",
    em: d.agora,
  };
  d.sugestoes.push(s);
  return d;
}

export function analisarSugestao(e: Estado, id: string): Estado {
  const d = clonar(e);
  const s = achar(d.sugestoes, id, "Sugestão");
  if (s.estado !== "sugerida") throw new Error("Só uma sugestão nova entra em análise.");
  s.estado = "em_analise";
  return d;
}

export function decidirSugestao(e: Estado, id: string, alvo: "aprovada" | "recusada", motivo?: string): Estado {
  const d = clonar(e);
  const s = achar(d.sugestoes, id, "Sugestão");
  if (s.estado !== "sugerida" && s.estado !== "em_analise") throw new Error("Essa sugestão já foi decidida.");
  if (alvo === "recusada") s.motivo = textoObrigatorio(motivo, "Informe o motivo da recusa.");
  s.estado = alvo;
  return d;
}

/* ------------------------------------------------------------------ */
/* Valores e métricas                                                  */
/* ------------------------------------------------------------------ */

function centavos(reais: number): number {
  return Math.round(reais * 100);
}

/* ---- Preço visível (Req. 10): fonte única do preço, usada pelas telas, pelo pedido e pelas métricas ---- */

export type LinhaComPreco = Pick<LinhaPedido, "tipo" | "qtd" | "custoUnitarioNaHora" | "orcamentoAceito" | "orcamentoUnitario">;

/**
 * Preço unitário da linha, ou null quando ainda não há preço.
 * Estoque: custo gravado na linha. Personalizável: só o orçamento ACEITO. Nunca devolve 0 por falta de preço.
 */
export function precoUnitarioLinha(l: LinhaComPreco): number | null {
  if (l.tipo === "estoque") return l.custoUnitarioNaHora ?? null;
  return l.orcamentoAceito && l.orcamentoUnitario !== undefined ? l.orcamentoUnitario : null;
}

/** Subtotal da linha em R$ (quantidade × preço unitário), ou null se a linha não tem preço. */
export function subtotalDaLinha(l: LinhaComPreco): number | null {
  const preco = precoUnitarioLinha(l);
  return preco === null ? null : centavos(preco * l.qtd) / 100;
}

/** Soma só as linhas com preço; as demais contam em `aAvaliar` e ficam fora do total. */
export function totalDasLinhas(linhas: LinhaComPreco[]): { total: number; aAvaliar: number } {
  let cent = 0;
  let aAvaliar = 0;
  for (const l of linhas) {
    const sub = subtotalDaLinha(l);
    if (sub === null) aAvaliar += 1;
    else cent += centavos(sub);
  }
  return { total: cent / 100, aAvaliar };
}

/** Linha do Carrinho vista como linha de pedido, com o custo vigente do brinde (ainda sem orçamento). */
export function precoDaLinhaDoCarrinho(b: Brinde, qtd: number): LinhaComPreco {
  return {
    tipo: b.tipo,
    qtd,
    custoUnitarioNaHora: b.tipo === "estoque" ? b.custoUnitario : null,
    orcamentoAceito: false,
  };
}

/** Total do Carrinho; linhas de brinde desconhecido são ignoradas. */
export function totalDoCarrinho(brindes: Brinde[], carrinho: { brindeId: string; qtd: number }[]): { total: number; aAvaliar: number } {
  const linhas: LinhaComPreco[] = [];
  for (const l of carrinho) {
    const b = brindes.find((x) => x.id === l.brindeId);
    if (b) linhas.push(precoDaLinhaDoCarrinho(b, l.qtd));
  }
  return totalDasLinhas(linhas);
}

function centavosDoPedido(p: Pedido): { centavos: number; aAvaliar: number } {
  const t = totalDasLinhas(p.linhas);
  return { centavos: centavos(t.total), aAvaliar: t.aAvaliar };
}

/** Valor do pedido em R$. Linha personalizável só entra com orçamento aceito; as demais contam em `aAvaliar`. */
export function valorDoPedido(p: Pedido): ValorPedido {
  const c = centavosDoPedido(p);
  return { valor: c.centavos / 100, aAvaliar: c.aAvaliar };
}

export function unidadesDoPedido(p: Pedido): number {
  return p.linhas.reduce((s, l) => s + l.qtd, 0);
}

/** Mês (AAAA-MM) em que o pedido foi retirado, ou undefined. */
export function mesDoEncerramento(p: Pedido): string | undefined {
  if (p.estado !== "encerrada") return undefined;
  const ev = [...p.historico].reverse().find((h) => h.estado === "encerrada");
  return ev?.em.slice(0, 7);
}

function agrupar(
  pedidos: Pedido[],
  chave: (p: Pedido) => string,
  rotulo: (p: Pedido) => string,
): LinhaGasto[] {
  const mapa = new Map<string, { rotulo: string; cent: number; pedidos: number; unidades: number }>();
  for (const p of pedidos) {
    const k = chave(p);
    const atual = mapa.get(k) ?? { rotulo: rotulo(p), cent: 0, pedidos: 0, unidades: 0 };
    atual.cent += centavosDoPedido(p).centavos;
    atual.pedidos += 1;
    atual.unidades += unidadesDoPedido(p);
    mapa.set(k, atual);
  }
  return [...mapa.entries()]
    .map(([k, v]) => ({ chave: k, rotulo: v.rotulo, valor: v.cent / 100, pedidos: v.pedidos, unidades: v.unidades }))
    .sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo, "pt-BR"));
}

function encerradosDoMes(e: Estado, mes: string): Pedido[] {
  return e.pedidos.filter((p) => mesDoEncerramento(p) === mes);
}

function gastoCalculado(e: Estado, mes: string): number {
  return encerradosDoMes(e, mes).reduce((s, p) => s + centavosDoPedido(p).centavos, 0) / 100;
}

/** Gasto do mês: total mock se o mês está fechado, senão soma dos pedidos retirados no mês. */
export function gastoDoMes(e: Estado, mes: string): number {
  return mes in e.gastoFechado ? e.gastoFechado[mes] : gastoCalculado(e, mes);
}

export function metricasDoPeriodo(e: Estado, mes: string): Metricas {
  const anterior = mesAnteriorDe(mes);
  const fechado = mes in e.gastoFechado;
  const encerrados = fechado ? [] : encerradosDoMes(e, mes);
  const prontos = e.pedidos.filter((p) => p.estado === "pronto");
  const ativos = e.pedidos.filter((p) => ESTADOS_ATIVOS.includes(p.estado));
  const nomes = new Map(e.pessoas.map((p) => [p.id, p.nome]));
  return {
    mes,
    mesAnterior: anterior,
    fechado,
    gasto: gastoDoMes(e, mes),
    gastoMesAnterior: gastoDoMes(e, anterior),
    unidadesRetiradas: encerrados.reduce((s, p) => s + unidadesDoPedido(p), 0),
    prontosUnidades: prontos.reduce((s, p) => s + unidadesDoPedido(p), 0),
    custoProntosAguardando: prontos.reduce((s, p) => s + centavosDoPedido(p).centavos, 0) / 100,
    linhasAAvaliar: ativos.reduce((s, p) => s + centavosDoPedido(p).aAvaliar, 0),
    porSolicitante: agrupar(
      encerrados,
      (p) => p.solicitanteId,
      (p) => nomes.get(p.solicitanteId) ?? p.solicitanteId,
    ),
    porArea: agrupar(
      encerrados,
      (p) => p.areaSolicitante || "Sem área",
      (p) => p.areaSolicitante || "Sem área",
    ),
    pedidosEncerrados: encerrados.map((p) => p.id),
  };
}

/** Os 3 meses do painel: o mês de "hoje" e os 2 anteriores, do mais novo para o mais antigo. */
export function mesesDoPainel(e: Pick<Estado, "agora">): string[] {
  const atual = e.agora.slice(0, 7);
  const anterior = mesAnteriorDe(atual);
  return [atual, anterior, mesAnteriorDe(anterior)];
}

/** Pedidos retirados no mês (vazio se o mês é fechado), opcionalmente só de uma área, do mais recente ao mais antigo. */
export function pedidosEncerradosDoPeriodo(e: Estado, mes: string, area?: string): Pedido[] {
  if (mes in e.gastoFechado) return [];
  return encerradosDoMes(e, mes)
    .filter((p) => !area || (p.areaSolicitante || "Sem área") === area)
    .sort((a, b) => (mesDoEncerramentoEm(b) ?? "").localeCompare(mesDoEncerramentoEm(a) ?? ""));
}

/** Instante ISO em que o pedido foi retirado, ou undefined. */
export function mesDoEncerramentoEm(p: Pedido): string | undefined {
  if (p.estado !== "encerrada") return undefined;
  return [...p.historico].reverse().find((h) => h.estado === "encerrada")?.em;
}

/** Diferença do gasto contra o mês anterior. `percentual` é null quando o anterior é zero. */
export function mudancaDeGasto(m: Pick<Metricas, "gasto" | "gastoMesAnterior">): {
  sentido: "subiu" | "caiu" | "igual";
  diferenca: number;
  percentual: number | null;
} {
  const diferenca = Math.round((m.gasto - m.gastoMesAnterior) * 100) / 100;
  const percentual = m.gastoMesAnterior > 0 ? Math.round((diferenca / m.gastoMesAnterior) * 1000) / 10 : null;
  return { sentido: diferenca > 0 ? "subiu" : diferenca < 0 ? "caiu" : "igual", diferenca: Math.abs(diferenca), percentual };
}

/** Unidades pedidas por brinde (sem recusados e cancelados), da mais para a menos pedida. */
export function popularidade(e: Estado): { brindeId: string; unidades: number }[] {
  const mapa = new Map<string, number>();
  for (const p of e.pedidos) {
    if (p.estado === "recusada" || p.estado === "cancelada") continue;
    for (const l of p.linhas) mapa.set(l.brindeId, (mapa.get(l.brindeId) ?? 0) + l.qtd);
  }
  return [...mapa.entries()]
    .map(([brindeId, unidades]) => ({ brindeId, unidades }))
    .sort((a, b) => b.unidades - a.unidades || a.brindeId.localeCompare(b.brindeId));
}

export interface AlertaEstoque {
  brindeId: string;
  rotulo: string;
  disponivel: number;
  minimo: number;
}

function brindesDeEstoque(e: Estado): Brinde[] {
  return e.brindes.filter((b) => b.tipo === "estoque" && b.ativo);
}

function alertaDe(b: Brinde): AlertaEstoque {
  return { brindeId: b.id, rotulo: b.nome, disponivel: disponivel(b), minimo: b.minimo };
}

/** Disponível acima de zero, mas abaixo do mínimo (só para a gestão). */
export function alertasMinimo(e: Estado): AlertaEstoque[] {
  return brindesDeEstoque(e)
    .filter((b) => b.minimo > 0 && disponivel(b) > 0 && disponivel(b) < b.minimo)
    .map(alertaDe);
}

export function esgotados(e: Estado): AlertaEstoque[] {
  return brindesDeEstoque(e)
    .filter((b) => disponivel(b) <= 0)
    .map(alertaDe);
}

/** Saldo físico × custo unitário dos brindes de estoque ativos. */
export function valorEmEstoque(e: Estado): number {
  return brindesDeEstoque(e).reduce((s, b) => s + centavos((b.custoUnitario ?? 0) * b.saldo), 0) / 100;
}

/** Histórico de um brinde: saldo inicial + entradas − saídas ± ajustes deve fechar com o saldo atual. */
export function historicoBrinde(e: Estado, brindeId: string): HistoricoBrinde {
  const b = achar(e.brindes, brindeId, "Brinde");
  const movs = e.movimentacoes.filter((m) => m.brindeId === brindeId).sort((a, c) => a.em.localeCompare(c.em));
  const soma = (tipo: Movimentacao["tipo"]) => movs.filter((m) => m.tipo === tipo).reduce((s, m) => s + m.qtd, 0);
  const saldoInicial = soma("saldo_inicial");
  const entradas = soma("entrada");
  const saidas = soma("saida");
  const ajustes = soma("ajuste");
  const saldoCalculado = saldoInicial + entradas - saidas + ajustes;
  const saldoAtual = b.saldo;
  const reserva = b.reserva;
  return {
    brindeId,
    saldoInicial,
    entradas,
    saidas,
    ajustes,
    saldoCalculado,
    saldoAtual,
    reserva,
    disponivel: saldoAtual - reserva,
    fecha: saldoCalculado === saldoAtual,
    movimentacoes: movs,
  };
}

/** Urgência pela data desejada, calculada a partir de "hoje" (nunca de uma data fixa no código). */
export function urgencia(dataDesejada: string | undefined, hoje: string): Urgencia {
  if (!dataDesejada || !dataValida(dataDesejada)) return "sem_data";
  const dias = diasEntre(hoje, dataDesejada);
  if (dias < 0) return "atrasada";
  if (dias <= 2) return "urgente";
  if (dias <= 7) return "proxima";
  return "normal";
}

/* ------------------------------------------------------------------ */
/* Vitrine: categorias, busca e ordenação (Req. 12.9 a 12.11)          */
/* ------------------------------------------------------------------ */

export type OrdemVitrine = "novos" | "custo" | "az";

export const CATEGORIA_TODOS = "Todos";

/** Texto sem acento e em minúsculas, para a busca por nome. */
export function normalizarBusca(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Contador de brindes ativos por categoria, na ordem em que as categorias aparecem; "Todos" soma todas. */
export function contarPorCategoria(brindes: Brinde[]): { categoria: string; total: number }[] {
  const mapa = new Map<string, number>();
  let todos = 0;
  for (const b of brindes) {
    if (!b.ativo) continue;
    todos += 1;
    mapa.set(b.categoria, (mapa.get(b.categoria) ?? 0) + 1);
  }
  return [{ categoria: CATEGORIA_TODOS, total: todos }, ...Array.from(mapa, ([categoria, total]) => ({ categoria, total }))];
}

/** Brindes ativos filtrados por categoria e busca por nome, já ordenados. O tamanho do resultado é o "N brindes" da vitrine. */
export function filtrarBrindes(brindes: Brinde[], categoria: string, busca: string, ordem: OrdemVitrine): Brinde[] {
  const ativos = brindes.filter((b) => b.ativo);
  const q = normalizarBusca(busca);
  const filtrada = ativos.filter(
    (b) => (categoria === CATEGORIA_TODOS || b.categoria === categoria) && (!q || normalizarBusca(b.nome).includes(q)),
  );
  const l = [...filtrada];
  if (ordem === "az") return l.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  if (ordem === "custo") {
    // Personalizável não tem custo unitário: vai para o fim, em ordem alfabética.
    return l.sort((a, b) => {
      if (a.custoUnitario === null && b.custoUnitario === null) return a.nome.localeCompare(b.nome, "pt-BR");
      if (a.custoUnitario === null) return 1;
      if (b.custoUnitario === null) return -1;
      return a.custoUnitario - b.custoUnitario;
    });
  }
  // Mais novos: novidades primeiro; dentro de cada grupo, o mais recente do catálogo (último no mock) primeiro.
  const idx = new Map(ativos.map((b, i) => [b.id, i]));
  return l.sort((a, b) => Number(b.novidade) - Number(a.novidade) || (idx.get(b.id)! - idx.get(a.id)!));
}
