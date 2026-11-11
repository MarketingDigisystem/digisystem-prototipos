/*
 * PROTÓTIPO DESCARTÁVEL — não é o app. Cópia da lógica pura de src/hub/pages/resultados/redes/comparabilidade.ts
 * @ commit 83755ae (main, PR #94), leitura 2026-11-11. Só os imports foram trocados
 * por ./tipos-proto. Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 */
/**
 * Comparabilidade de métricas entre redes (Req. 6.1 a 6.3).
 *
 * Tabela única que decide quais métricas entram no consolidado da visão
 * "Todas". A classificação é total e fail-closed: qualquer identificador
 * fora da tabela é NÃO comparável, então nada novo entra no consolidado
 * por engano. Módulo puro, sem I/O.
 */

/** Métricas que podem ser somadas ou razoadas entre redes. */
export const METRICAS_COMPARAVEIS = [
  "impressoes",
  "alcance",
  "cliques",
  "seguidoresTotais",
  "taxaEngajamento",
  "ctr",
] as const;

export type MetricaComparavel = (typeof METRICAS_COMPARAVEIS)[number];

/** Métricas conhecidas que existem só em uma rede (ou não têm sentido somadas). */
export const METRICAS_NAO_COMPARAVEIS_CONHECIDAS = [
  "visualizacoesVideo",
  "inscritosYouTube",
  "reacoesEspecificas",
  "perfilPublico",
] as const;

export type ClasseComparabilidade = "comparavel" | "nao_comparavel";

/** Como o consolidado agrega uma métrica comparável. */
export type AgregacaoConsolidado =
  | "soma"
  | "soma_ultimo_valor"
  | "razao_posts_elegiveis"
  | "razao_com_duas_medidas";

export type EntradaComparabilidade = {
  classe: "comparavel";
  agregacao: AgregacaoConsolidado;
  /** Ressalva exibida junto do número, quando houver. */
  rotulo: string | null;
};

/** Fonte única da classificação. */
export const TABELA_COMPARABILIDADE: Readonly<
  Record<MetricaComparavel, EntradaComparabilidade>
> = Object.freeze({
  impressoes: { classe: "comparavel", agregacao: "soma", rotulo: null },
  alcance: {
    classe: "comparavel",
    agregacao: "soma",
    rotulo: "alcance somado das redes, pode repetir pessoas",
  },
  cliques: { classe: "comparavel", agregacao: "soma", rotulo: null },
  seguidoresTotais: {
    classe: "comparavel",
    agregacao: "soma_ultimo_valor",
    rotulo: null,
  },
  taxaEngajamento: {
    classe: "comparavel",
    agregacao: "razao_posts_elegiveis",
    rotulo: null,
  },
  ctr: {
    classe: "comparavel",
    agregacao: "razao_com_duas_medidas",
    rotulo: null,
  },
});

/** Rótulo das métricas que ficam só no resumo da rede. */
export const ROTULO_SO_NESTA_REDE = "Só nesta rede";

/** Rótulo do alcance somado (atalho para a tabela). */
export const ROTULO_ALCANCE_SOMADO = "alcance somado das redes, pode repetir pessoas";

/**
 * Classifica um identificador de métrica. Total: aceita qualquer string e
 * devolve exatamente uma classe. Fora da tabela, é não comparável.
 */
export function classificar(id: string): ClasseComparabilidade {
  return ehComparavel(id) ? "comparavel" : "nao_comparavel";
}

/** Guarda de tipo: o id é uma métrica comparável. */
export function ehComparavel(id: string): id is MetricaComparavel {
  return Object.prototype.hasOwnProperty.call(TABELA_COMPARABILIDADE, id);
}

/** Rótulo de ressalva para o id: "Só nesta rede" para não comparável, ressalva própria ou null. */
export function rotuloDaMetrica(id: string): string | null {
  return ehComparavel(id) ? TABELA_COMPARABILIDADE[id].rotulo : ROTULO_SO_NESTA_REDE;
}
