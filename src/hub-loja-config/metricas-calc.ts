// PROTÓTIPO DESCARTÁVEL — não é o app. Cálculos puros sobre dados MOCK.
// Gerado de: src/hub/pages/loja/metricas-loja.ts, src/lib/loja/metricas.ts, regras-datas.ts e src/lib/ponte/calendario.ts @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import type { Brinde, DadosMock, EstadoPedido, LinhaPedido, PedidoMock } from "./dados";

/* ------------------------------------------------------------------ */
/* Dias úteis (calendário da ponte: segunda a sexta, sem feriados)     */
/* ------------------------------------------------------------------ */
const DIA_MS = 86_400_000;
const paraMs = (iso: string): number => Date.parse(`${iso}T00:00:00Z`);
const deMs = (ms: number): string => new Date(ms).toISOString().slice(0, 10);
const somarDias = (iso: string, dias: number): string => deMs(paraMs(iso) + dias * DIA_MS);
export function ehDiaUtil(iso: string): boolean {
  const dow = new Date(paraMs(iso)).getUTCDay();
  return dow >= 1 && dow <= 5;
}
/** Quantidade de dias úteis em (de, ate]. Zero quando `ate` não é posterior a `de`. */
export function diasUteisEntre(de: string, ate: string): number {
  let n = 0;
  let d = de;
  while (d < ate) {
    d = somarDias(d, 1);
    if (ehDiaUtil(d)) n++;
  }
  return n;
}
/** AAAA-MM-DD de um instante ISO. */
export const diaDe = (iso: string): string => iso.slice(0, 10);

/** Regra real (regras-datas.ts): só `aguardando`, desde o dia da criação, estrito `>`, em dias úteis. */
export function eParado(p: Pick<PedidoMock, "estado" | "criadoEm">, hoje: string, limite: number): boolean {
  if (p.estado !== "aguardando") return false;
  return diasUteisEntre(diaDe(p.criadoEm), hoje) > limite;
}

/* ------------------------------------------------------------------ */
/* Formatação                                                          */
/* ------------------------------------------------------------------ */
const MES_ISO = /^\d{4}-(0[1-9]|1[0-2])$/;
export const ehMesValido = (mes: string): boolean => MES_ISO.test(mes);

export function somarMeses(mes: string, delta: number): string {
  const [a, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1 + delta, 1)).toISOString().slice(0, 7);
}
const NOMES_MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
/** "2026-11" → "novembro de 2026". */
export function rotuloMes(mes: string): string {
  if (!ehMesValido(mes)) return mes;
  const [a, m] = mes.split("-").map(Number);
  return `${NOMES_MES[m - 1]} de ${a}`;
}
const REAL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
/** "R$ 1.234,56" (com espaço não separável, como o Hub real). */
export const formatarReal = (v: number): string => REAL.format(v);

/** Tempo médio em texto simples ("40 min", "5 h", "3 dias"); sem pedido assumido, diz isso. */
export function formatarTempoAtendimento(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "Sem dados";
  const min = Math.max(0, Math.round(ms / 60_000));
  if (min < 60) return `${min} min`;
  const horas = Math.round(min / 60);
  if (horas < 48) return `${horas} h`;
  return `${Math.round(horas / 24)} dias`;
}

const centavos = (v: number): number => Math.round(v * 100);

/** Variação do gasto contra o mês anterior, em texto. Sem base de comparação, diz isso em vez de inventar %. */
export function textoComparacaoGasto(atual: number, anterior: number, rotuloAnterior: string): string {
  if (centavos(anterior) === 0) {
    return centavos(atual) === 0 ? `Sem gasto em ${rotuloAnterior} nem neste mês.` : `Sem gasto em ${rotuloAnterior} para comparar.`;
  }
  const diff = centavos(atual) - centavos(anterior);
  if (diff === 0) return `Igual a ${rotuloAnterior} (${formatarReal(anterior)}).`;
  const pct = Math.round((Math.abs(diff) / centavos(anterior)) * 100);
  return `${diff > 0 ? "Alta" : "Queda"} de ${pct}% contra ${rotuloAnterior} (${formatarReal(anterior)}).`;
}

/** Proposta nova (marca de variação). Sem base real, devolve "sem_base" em vez de inventar %. */
export function variacaoPercentual(
  atual: number,
  anterior: number,
): { texto: string; sentido: "alta" | "queda" | "igual" | "sem_base" } {
  if (centavos(anterior) === 0) return { texto: "Sem base para comparar", sentido: "sem_base" };
  const diff = centavos(atual) - centavos(anterior);
  if (diff === 0) return { texto: "Igual ao mês anterior", sentido: "igual" };
  const pct = Math.round((Math.abs(diff) / centavos(anterior)) * 100);
  return diff > 0 ? { texto: `Alta de ${pct}%`, sentido: "alta" } : { texto: `Queda de ${pct}%`, sentido: "queda" };
}

/* ------------------------------------------------------------------ */
/* Painel do mês                                                       */
/* ------------------------------------------------------------------ */
export interface LinhaGasto {
  chave: string;
  rotulo: string;
  valor: number;
  pedidos: number;
  unidades: number;
}
export interface BrindeEmAlerta {
  id: string;
  nome: string;
  foto: string;
  disponivel: number;
  saldo: number;
  minimo: number;
}
export interface Popularidade {
  brindeId: string;
  nome: string;
  foto: string;
  unidades: number;
  pedidos: number;
}
export interface PainelMetricas {
  mes: string;
  mesAnterior: string;
  /* Dependem do mês */
  gasto: number;
  gastoMesAnterior: number;
  unidadesEntregues: number;
  unidadesMesAnterior: number;
  porSolicitante: LinhaGasto[];
  porArea: LinhaGasto[];
  popularidade: Popularidade[];
  /* Posição de hoje (não mudam com o mês; D2) */
  prontosUnidades: number;
  custoProntosAguardando: number;
  valorEmEstoque: number;
  semCustoCadastrado: number;
  pedidosParados: number;
  tempoMedioAtendimentoMs: number | null;
  esgotados: BrindeEmAlerta[];
  abaixoDoMinimo: BrindeEmAlerta[];
  totalPedidos: number;
  totalBrindes: number;
}

export const disponivelDe = (b: Pick<Brinde, "saldo" | "reserva" | "guardadas">): number => Math.max(0, b.saldo - b.reserva - b.guardadas);

const mesDe = (iso: string): string => iso.slice(0, 7);
const centavosDaLinha = (l: LinhaPedido): number => Math.round(l.qtd * (l.custoNaHora ?? 0) * 100);
const centavosDoPedido = (p: PedidoMock): number => p.linhas.reduce((s, l) => s + centavosDaLinha(l), 0);
const unidadesDoPedido = (p: PedidoMock): number => p.linhas.reduce((s, l) => s + l.qtd, 0);
const entregueNoMes = (p: PedidoMock, mes: string): boolean => p.estado === "entregue" && !!p.entregueEm && mesDe(p.entregueEm) === mes;

function agrupar(pedidos: PedidoMock[], chave: (p: PedidoMock) => string): LinhaGasto[] {
  const mapa = new Map<string, { rotulo: string; cent: number; pedidos: number; unidades: number }>();
  for (const p of pedidos) {
    const k = chave(p);
    const atual = mapa.get(k) ?? { rotulo: k, cent: 0, pedidos: 0, unidades: 0 };
    atual.cent += centavosDoPedido(p);
    atual.pedidos += 1;
    atual.unidades += unidadesDoPedido(p);
    mapa.set(k, atual);
  }
  return [...mapa.entries()]
    .map(([k, v]) => ({ chave: k, rotulo: v.rotulo, valor: v.cent / 100, pedidos: v.pedidos, unidades: v.unidades }))
    .sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo, "pt-BR"));
}

/** Gasto do mês, em reais: soma dos pedidos entregues no mês (em centavos, como o real). */
export function gastoDoMes(pedidos: PedidoMock[], mes: string): number {
  return pedidos.filter((p) => entregueNoMes(p, mes)).reduce((s, p) => s + centavosDoPedido(p), 0) / 100;
}
const unidadesDoMes = (pedidos: PedidoMock[], mes: string): number =>
  pedidos.filter((p) => entregueNoMes(p, mes)).reduce((s, p) => s + unidadesDoPedido(p), 0);

/** Média de (assumidoEm − criadoEm) em ms sobre todos os pedidos assumidos; null se nenhum. */
export function tempoMedioAtendimento(pedidos: PedidoMock[]): number | null {
  const duracoes = pedidos
    .filter((p) => p.assumidoEm)
    .map((p) => Date.parse(p.assumidoEm as string) - Date.parse(p.criadoEm))
    .filter((d) => Number.isFinite(d));
  if (duracoes.length === 0) return null;
  return duracoes.reduce((s, d) => s + d, 0) / duracoes.length;
}

/** Popularidade: unidades pedidas por brinde nos pedidos criados no mês, sem recusados e cancelados. */
export function popularidadeDoMes(pedidos: PedidoMock[], brindes: Brinde[], mes: string): Popularidade[] {
  const porId = new Map(brindes.map((b) => [b.id, b]));
  const acc = new Map<string, Popularidade>();
  for (const p of pedidos) {
    if (p.estado === "recusada" || p.estado === "cancelada") continue;
    if (!p.criadoEm.startsWith(mes)) continue;
    const vistos = new Set<string>();
    for (const l of p.linhas) {
      const b = porId.get(l.brindeId);
      const a = acc.get(l.brindeId) ?? { brindeId: l.brindeId, nome: b?.nome ?? "Brinde removido", foto: b?.foto ?? "", unidades: 0, pedidos: 0 };
      a.unidades += l.qtd;
      if (!vistos.has(l.brindeId)) a.pedidos += 1;
      vistos.add(l.brindeId);
      acc.set(l.brindeId, a);
    }
  }
  return [...acc.values()].sort((a, b) => b.unidades - a.unidades || a.nome.localeCompare(b.nome, "pt-BR"));
}

const emAlerta = (b: Brinde): BrindeEmAlerta => ({ id: b.id, nome: b.nome, foto: b.foto, disponivel: disponivelDe(b), saldo: b.saldo, minimo: b.minimo });

/** Única origem dos números da aba Métricas. `limite` = limite de pedido parado da Retirada. */
export function painelDoMes(dados: DadosMock, mes: string, hoje: string, limite: number): PainelMetricas {
  const { pedidos, brindes } = dados;
  const anterior = somarMeses(mes, -1);
  const entregues = pedidos.filter((p) => entregueNoMes(p, mes));
  const prontos = pedidos.filter((p) => p.estado === "pronto_entrega" || p.estado === "pronto_retirada");
  const ativos = brindes.filter((b) => b.ativo);
  const comCusto = ativos.filter((b) => b.custo !== null);
  return {
    mes,
    mesAnterior: anterior,
    gasto: gastoDoMes(pedidos, mes),
    gastoMesAnterior: gastoDoMes(pedidos, anterior),
    unidadesEntregues: unidadesDoMes(pedidos, mes),
    unidadesMesAnterior: unidadesDoMes(pedidos, anterior),
    porSolicitante: agrupar(entregues, (p) => p.solicitanteNome),
    porArea: agrupar(entregues, (p) => p.area || "Sem área"),
    popularidade: popularidadeDoMes(pedidos, brindes, mes),
    prontosUnidades: prontos.reduce((s, p) => s + unidadesDoPedido(p), 0),
    custoProntosAguardando: prontos.reduce((s, p) => s + centavosDoPedido(p), 0) / 100,
    valorEmEstoque: comCusto.reduce((s, b) => s + centavos((b.custo as number) * b.saldo), 0) / 100,
    semCustoCadastrado: ativos.length - comCusto.length,
    pedidosParados: pedidos.filter((p) => eParado(p, hoje, limite)).length,
    tempoMedioAtendimentoMs: tempoMedioAtendimento(pedidos),
    esgotados: ativos.filter((b) => disponivelDe(b) <= 0).map(emAlerta),
    abaixoDoMinimo: ativos.filter((b) => b.minimo > 0 && disponivelDe(b) > 0 && disponivelDe(b) <= b.minimo).map(emAlerta),
    totalPedidos: pedidos.length,
    totalBrindes: brindes.length,
  };
}

export type { EstadoPedido };
