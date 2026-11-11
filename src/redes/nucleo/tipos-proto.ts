/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Tipos mínimos que substituem os imports do app nos arquivos copiados de ./
 * Gerado de: src/lib/hub-meta.ts (SocialProvider), src/hub/pages/resultados/rede/tipos.ts (Valor, Kpis)
 * e src/hub/pages/resultados/redes-cards.ts (ConexaoEstado, redeConectada) @ commit 83755ae, leitura 2026-11-11.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 */

export type SocialProvider = "instagram" | "facebook" | "linkedin" | "youtube";

export type Valor = number | null;

/** Subconjunto de `Kpis` que o consolidado lê. */
export type Kpis = {
  impressoes: Valor;
  alcance: Valor;
  cliques: Valor;
  engajamentosTotais: Valor;
  taxaEngajamento: Valor;
  ctr: Valor;
  seguidoresTotais: Valor;
  seguidoresGanhos: Valor;
  crescimentoSeguidores: Valor;
};

export type ConexaoEstado = {
  id: string;
  provider: SocialProvider;
  status: "ativo" | "expirado" | "erro";
  tipoAcesso: "leitura" | "escrita";
};

/** Mesma regra do app: LinkedIn só conta com conexão de leitura ativa. */
export function redeConectada(provider: SocialProvider, conexoes: readonly ConexaoEstado[]): boolean {
  return conexoes.some(
    (c) => c.provider === provider && c.status === "ativo" && (provider !== "linkedin" || c.tipoAcesso === "leitura"),
  );
}
