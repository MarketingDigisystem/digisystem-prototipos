/*
 * PROTÓTIPO DESCARTÁVEL — não é o app. Cópia da lógica pura de src/hub/pages/resultados/redes/catalogo-cards.ts
 * @ commit 83755ae (main, PR #94), leitura 2026-11-11. Só os imports foram trocados
 * por ./tipos-proto. Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 */
/**
 * Catálogo de cards de Resultados › Redes, por visão (Req. 7.3, 8).
 *
 * Puro: sem React, sem rede. Cada entrada traz id estável, título e limites
 * (mínimo, máximo, padrão). Os `padrao` abaixo são os valores FINAIS medidos na tarefa 10.4
 * (ALTURA_LINHA_PX = 224).
 */
import type { SocialProvider } from "./tipos-proto";
import {
  arranjoPadrao,
  type ArranjoGrade,
  type CatalogoGrade,
  type LimitesCard,
} from "./grade";
import { REDES_VISAO, type VisaoAtiva } from "./visao";

export type EntradaCatalogo = { id: string; titulo: string; limites: LimitesCard };
export type CatalogoCards = ReadonlyArray<EntradaCatalogo>;

const MAX = { w: 4, h: 3 } as const;

function limites(min: [number, number], padrao: [number, number]): LimitesCard {
  return {
    min: { w: min[0], h: min[1] },
    max: { ...MAX },
    padrao: { w: padrao[0], h: padrao[1] },
  };
}

/** Visao_Rede: os blocos atuais da página do LinkedIn (PaginaRede/BlocoRede). */
export const CATALOGO_REDE: CatalogoCards = [
  { id: "kpis", titulo: "Indicadores principais", limites: limites([2, 1], [4, 1]) },
  { id: "evolucao", titulo: "Evolução no período", limites: limites([2, 2], [2, 2]) },
  { id: "ranking", titulo: "Ranking de posts", limites: limites([2, 2], [2, 2]) },
  { id: "formatos", titulo: "Desempenho por formato", limites: limites([1, 1], [2, 2]) },
  { id: "momento", titulo: "Melhor momento", limites: limites([1, 1], [2, 2]) },
  { id: "frequencia", titulo: "Frequência de publicação", limites: limites([1, 1], [2, 1]) },
  { id: "metas", titulo: "Metas do mês", limites: limites([1, 1], [2, 1]) },
  { id: "publico", titulo: "Perfil do público", limites: limites([2, 2], [4, 2]) },
];

/** Visao_Todas: consolidado, evolução e um resumo por rede (LinkedIn primeiro). */
export const CATALOGO_TODAS: CatalogoCards = [
  { id: "consolidado", titulo: "Consolidado das redes", limites: limites([2, 1], [4, 2]) },
  { id: "evolucao-redes", titulo: "Evolução por rede", limites: limites([2, 2], [4, 2]) },
  { id: "resumo-linkedin", titulo: "LinkedIn", limites: limites([1, 1], [2, 2]) },
  { id: "resumo-instagram", titulo: "Instagram", limites: limites([1, 1], [2, 2]) },
  { id: "resumo-facebook", titulo: "Facebook", limites: limites([1, 1], [2, 2]) },
  { id: "resumo-youtube", titulo: "YouTube", limites: limites([1, 1], [2, 2]) },
];

/** Catálogo da visão. Total: toda visão válida tem catálogo. */
export function catalogoDaVisao(visao: VisaoAtiva): CatalogoCards {
  return visao === "todas" ? CATALOGO_TODAS : CATALOGO_REDE;
}

/** Forma que `grade.ts` consome (id + limites). */
export function catalogoGrade(visao: VisaoAtiva): CatalogoGrade {
  return catalogoDaVisao(visao).map(({ id, limites: l }) => ({ id, limites: l }));
}

/** Disposição padrão da visão (Req. 8.8). */
export function arranjoPadraoDaVisao(visao: VisaoAtiva): ArranjoGrade {
  return arranjoPadrao(catalogoGrade(visao));
}

/** Título do card, ou o próprio id se desconhecido. */
export function tituloDoCard(visao: VisaoAtiva, id: string): string {
  return catalogoDaVisao(visao).find((c) => c.id === id)?.titulo ?? id;
}

/** Id do card de resumo de uma rede na Visao_Todas. */
export function idResumoDaRede(rede: SocialProvider): string {
  return `resumo-${rede}`;
}

/** Todas as visões possíveis, na ordem do seletor. */
export const VISOES: readonly VisaoAtiva[] = ["todas", ...REDES_VISAO];