/*
 * PROTÓTIPO DESCARTÁVEL — não é o app. Cópia da lógica pura de src/hub/pages/resultados/redes/visao.ts
 * @ commit 83755ae (main, PR #94), leitura 2026-11-11. Só os imports foram trocados
 * por ./tipos-proto. Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 */
/**
 * Visão ativa de Resultados › Redes (Req. 3.4, 3.5, 3.9, 3.10).
 *
 * A URL (`?aba=redes&rede=...`) decide se a tela mostra "todas" as redes ou
 * uma rede. Funções puras e totais: texto desconhecido cai em `todas`.
 */
import type { SocialProvider } from "./tipos-proto";

export type VisaoAtiva = "todas" | SocialProvider;

/** Redes que têm visão própria, na ordem do seletor. */
export const REDES_VISAO: readonly SocialProvider[] = [
  "linkedin",
  "instagram",
  "facebook",
  "youtube",
];

/** Valor de URL que representa a visão com todas as redes. */
export const PARAM_TODAS = "todas";

/** Guarda de tipo: o texto é uma das quatro redes. */
export function ehRedeVisao(valor: unknown): valor is SocialProvider {
  return typeof valor === "string" && (REDES_VISAO as readonly string[]).includes(valor);
}

/** Guarda de tipo: o valor é uma visão válida (`todas` ou uma rede). */
export function ehVisaoAtiva(valor: unknown): valor is VisaoAtiva {
  return valor === PARAM_TODAS || ehRedeVisao(valor);
}

/**
 * Decide a visão ativa.
 * - `rede` ausente + última salva é rede válida → última, com `restaurar`.
 * - `rede` ausente sem última válida (ou `todas`) → `todas`.
 * - `todas` → `todas`; rede válida → ela mesma.
 * - qualquer outro texto (inclusive vazio) → `todas`, sem restaurar.
 */
export function resolverVisao(
  redeDaUrl: string | undefined,
  ultimaSalva: string | undefined,
): { visao: VisaoAtiva; restaurar: boolean } {
  if (redeDaUrl === undefined || redeDaUrl === null) {
    if (ehRedeVisao(ultimaSalva)) return { visao: ultimaSalva, restaurar: true };
    return { visao: "todas", restaurar: false };
  }
  if (ehRedeVisao(redeDaUrl)) return { visao: redeDaUrl, restaurar: false };
  return { visao: "todas", restaurar: false };
}

/** Valor escrito na URL para a visão: o nome da rede ou `todas`. Total. */
export function paramDaVisao(visao: VisaoAtiva): string {
  return ehRedeVisao(visao) ? visao : PARAM_TODAS;
}
