/*
 * PROTÓTIPO DESCARTÁVEL — não é o app. Cópia da lógica pura de src/hub/pages/resultados/redes/consolidado.ts
 * @ commit 83755ae (main, PR #94), leitura 2026-11-11. Só os imports foram trocados
 * por ./tipos-proto. Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 */
/**
 * Consolidado da visão "Todas as redes" (Req. 5.1, 5.4, 5.8, 6.2, 6.4, 6.6, 6.7, 6.9, 6.10).
 *
 * Soma só métricas comparáveis (`comparabilidade.ts`), a partir dos números já
 * calculados por rede (`calcularKpis`). Não reabre linhas cruas. Pura e total:
 * todo valor devolvido é finito ou `null` (Sem dado); nunca `NaN`, nunca 0 inventado.
 *
 * - Soma (impressões, alcance, cliques, seguidores): entra a rede com valor não nulo.
 * - Taxa de engajamento: Σ engajamentos ÷ Σ impressões dos posts elegíveis, só das redes
 *   que têm os dois lados (mesmo conjunto no numerador e no denominador), em %.
 * - CTR: Σ cliques ÷ Σ impressões das redes com as duas medidas, em %.
 * - Cada rede aparece exatamente uma vez em `incluidas` ou `excluidas` de cada métrica.
 */
import type { SocialProvider } from "./tipos-proto";
import type { Kpis, Valor } from "./tipos-proto";
import { METRICAS_COMPARAVEIS, TABELA_COMPARABILIDADE, type MetricaComparavel } from "./comparabilidade";
import type { EstadoRede } from "./estado-rede";

export type MotivoExclusao = "nao_conectada" | "sem_dados_no_periodo" | "em_breve" | "metrica_ausente";

export type MetricaConsolidada = {
  /** `null` = Sem dado. */
  valor: Valor;
  incluidas: SocialProvider[];
  excluidas: { rede: SocialProvider; motivo: MotivoExclusao }[];
};

export type EntradaRede = {
  rede: SocialProvider;
  estado: EstadoRede;
  /** Saída de `calcularKpis` da rede (ou `null` quando não há cálculo). */
  kpis: Kpis | null;
  /** Saída de `somaEngajamentoEImpressoes` dos posts do período. */
  postsElegiveis: { engajamento: Valor; impressoes: Valor } | null;
};

export type ConsolidadoRedes = Record<MetricaComparavel, MetricaConsolidada>;

const CEM = 100;

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** Motivo de exclusão derivado do estado; `null` quando a rede tem dados (`ok`). */
function motivoDoEstado(estado: EstadoRede): MotivoExclusao | null {
  switch (estado.tipo) {
    case "ok":
      return null;
    case "em_breve":
      return "em_breve";
    case "nao_conectada":
      return "nao_conectada";
    case "sem_dados":
      return "sem_dados_no_periodo";
  }
}

/** Primeira ocorrência de cada rede vence (garante a partição). */
function unicas(entradas: readonly EntradaRede[]): EntradaRede[] {
  const vistas = new Set<SocialProvider>();
  const saida: EntradaRede[] = [];
  for (const e of Array.isArray(entradas) ? entradas : []) {
    if (!e || vistas.has(e.rede)) continue;
    vistas.add(e.rede);
    saida.push(e);
  }
  return saida;
}

/** Valores numéricos da rede para a métrica, ou `null` se a métrica não pode entrar. */
type Extrator = (e: EntradaRede) => number[] | null;

const EXTRATORES: Record<MetricaComparavel, Extrator> = {
  impressoes: (e) => um(num(e.kpis?.impressoes)),
  alcance: (e) => um(num(e.kpis?.alcance)),
  cliques: (e) => um(num(e.kpis?.cliques)),
  seguidoresTotais: (e) => um(num(e.kpis?.seguidoresTotais)),
  // [engajamento, impressões] dos posts elegíveis
  taxaEngajamento: (e) => {
    const eng = num(e.postsElegiveis?.engajamento);
    const imp = num(e.postsElegiveis?.impressoes);
    return eng === null || imp === null ? null : [eng, imp];
  },
  // [cliques, impressões]
  ctr: (e) => {
    const cl = num(e.kpis?.cliques);
    const imp = num(e.kpis?.impressoes);
    return cl === null || imp === null ? null : [cl, imp];
  },
};

function um(v: number | null): number[] | null {
  return v === null ? null : [v];
}

function somar(valores: readonly number[]): Valor {
  const s = valores.reduce((a, b) => a + b, 0);
  return Number.isFinite(s) ? s : null;
}

function razaoPct(num_: number, den: number): Valor {
  if (!Number.isFinite(num_) || !Number.isFinite(den) || den === 0) return null;
  const r = (num_ / den) * CEM;
  return Number.isFinite(r) ? r : null;
}

function consolidarMetrica(metrica: MetricaComparavel, entradas: readonly EntradaRede[]): MetricaConsolidada {
  const incluidas: SocialProvider[] = [];
  const excluidas: { rede: SocialProvider; motivo: MotivoExclusao }[] = [];
  const partes: number[][] = [];
  for (const e of entradas) {
    const motivo = motivoDoEstado(e.estado);
    if (motivo !== null) {
      excluidas.push({ rede: e.rede, motivo });
      continue;
    }
    const v = EXTRATORES[metrica](e);
    if (v === null) {
      excluidas.push({ rede: e.rede, motivo: "metrica_ausente" });
      continue;
    }
    incluidas.push(e.rede);
    partes.push(v);
  }
  if (partes.length === 0) return { valor: null, incluidas, excluidas };

  const agregacao = TABELA_COMPARABILIDADE[metrica].agregacao;
  let valor: Valor;
  if (agregacao === "razao_posts_elegiveis" || agregacao === "razao_com_duas_medidas") {
    const numerador = somar(partes.map((p) => p[0]));
    const denominador = somar(partes.map((p) => p[1]));
    valor = numerador === null || denominador === null ? null : razaoPct(numerador, denominador);
  } else {
    valor = somar(partes.map((p) => p[0]));
  }
  return { valor, incluidas, excluidas };
}

export function consolidar(entradas: readonly EntradaRede[]): ConsolidadoRedes {
  const lista = unicas(entradas);
  const saida = {} as ConsolidadoRedes;
  for (const m of METRICAS_COMPARAVEIS) saida[m] = consolidarMetrica(m, lista);
  return saida;
}

/** Rede com conexão ativa (inclui "Em breve" já conectada). */
export function redesConectadas(entradas: readonly EntradaRede[]): SocialProvider[] {
  return unicas(entradas)
    .filter((e) => (e.estado.tipo === "em_breve" ? e.estado.conectada : e.estado.tipo !== "nao_conectada"))
    .map((e) => e.rede);
}

export const TEXTO_ALERTA_MENOS_REDES =
  "Este consolidado tem menos redes do que as conectadas. Veja quais ficaram de fora.";

/** Req. 5.8: texto fixo quando entram menos redes do que as conectadas; senão `null`. */
export function alertaMenosRedes(
  entradas: readonly EntradaRede[],
  consolidado: ConsolidadoRedes,
  metrica: MetricaComparavel = "impressoes",
): string | null {
  const conectadas = redesConectadas(entradas).length;
  return consolidado[metrica].incluidas.length < conectadas ? TEXTO_ALERTA_MENOS_REDES : null;
}

/** Req. 6.9: definição de cada métrica comparável, para a ajuda acessível. */
export const TEXTOS_AJUDA_METRICA: Readonly<Record<MetricaComparavel, string>> = Object.freeze({
  impressoes: "Soma das impressões das redes que entraram.",
  alcance: "Soma do alcance das redes que entraram; alcance somado das redes, pode repetir pessoas.",
  cliques: "Soma dos cliques das redes que entraram.",
  seguidoresTotais: "Soma do último valor de seguidores medido em cada rede que entrou.",
  taxaEngajamento:
    "Curtidas, comentários e compartilhamentos divididos pelas impressões dos mesmos posts, somando as redes que entraram.",
  ctr: "Cliques divididos pelas impressões, somando as redes que têm as duas medidas.",
});

export function textoAjuda(metrica: MetricaComparavel): string {
  return TEXTOS_AJUDA_METRICA[metrica];
}
