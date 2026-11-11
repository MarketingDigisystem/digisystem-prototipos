// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: Arquivos_temporarios_for_AI/digisystem-loading-buttons/src/components/loading-buttons/types.ts
//   (kit "07 · AIGenerateButton", recebido em 2026-11-04). Fonte da verdade = o app real / o kit recebido.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md (“Botão Escrever com a IA — componente 07 adaptado”).

/** Os quatro estados do botão de geração. */
export type LoadState = "idle" | "loading" | "success" | "error";

/** Uma etapa da geração (também é um item do checklist “A IA vai escrever…”). */
export interface AIStep {
  id: string;
  /** Nome curto do item (ex.: “Legenda”). */
  label: string;
  /** Descrição do que será gerado. */
  detail: string;
  /** Título do botão enquanto a etapa roda (ex.: “Escrevendo a legenda”). */
  doing: string;
}
