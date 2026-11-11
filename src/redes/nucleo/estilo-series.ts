/*
 * PROTÓTIPO DESCARTÁVEL — não é o app. Cópia da lógica pura de src/hub/pages/resultados/redes/estilo-series.ts
 * @ commit 83755ae (main, PR #94), leitura 2026-11-11. Só os imports foram trocados
 * por ./tipos-proto. Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 */
/**
 * Estilo das séries do gráfico de evolução por rede (Req. 5.3).
 *
 * Função pura. Cada rede tem um estilo FIXO (não depende de quais redes estão
 * visíveis), para que o LinkedIn tenha sempre o mesmo aspecto. Cor, marcador e
 * traçado são distintos aos pares: a leitura não depende só da cor.
 * Cores só por tokens da Marca (nunca cor nova).
 */
import type { SocialProvider } from "./tipos-proto";

export type MarcadorSerie = "circulo" | "quadrado" | "triangulo" | "losango";

export type EstiloSerie = {
  rede: SocialProvider;
  /** Texto da legenda (nunca vazio). */
  rotulo: string;
  /** Token CSS da Marca, ex.: `var(--primary)`. */
  cor: string;
  marcador: MarcadorSerie;
  /** Valor de `strokeDasharray` do recharts ("" = linha contínua). */
  tracejado: string;
};

export const ESTILO_POR_REDE: Readonly<Record<SocialProvider, EstiloSerie>> = {
  linkedin: {
    rede: "linkedin",
    rotulo: "LinkedIn",
    cor: "var(--primary)",
    marcador: "circulo",
    tracejado: "",
  },
  instagram: {
    rede: "instagram",
    rotulo: "Instagram",
    cor: "var(--accent-strong)",
    marcador: "quadrado",
    tracejado: "6 3",
  },
  facebook: {
    rede: "facebook",
    rotulo: "Facebook",
    cor: "var(--sky)",
    marcador: "triangulo",
    tracejado: "2 3",
  },
  youtube: {
    rede: "youtube",
    rotulo: "YouTube",
    cor: "var(--muted-foreground)",
    marcador: "losango",
    tracejado: "8 3 2 3",
  },
};

/** Ordem canônica de exibição na legenda. */
const ORDEM: readonly SocialProvider[] = ["linkedin", "instagram", "facebook", "youtube"];

/**
 * Estilos das redes pedidas, sem repetição, na ordem canônica.
 * Rede desconhecida é ignorada.
 */
export function estilosDasSeries(redes: readonly SocialProvider[]): EstiloSerie[] {
  const pedidas = new Set(redes);
  return ORDEM.filter((r) => pedidas.has(r)).map((r) => ESTILO_POR_REDE[r]);
}

/** Estilo de uma rede. */
export function estiloDaSerie(rede: SocialProvider): EstiloSerie {
  return ESTILO_POR_REDE[rede];
}
