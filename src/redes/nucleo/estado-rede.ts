/*
 * PROTÓTIPO DESCARTÁVEL — não é o app. Cópia da lógica pura de src/hub/pages/resultados/redes/estado-rede.ts
 * @ commit 83755ae (main, PR #94), leitura 2026-11-11. Só os imports foram trocados
 * por ./tipos-proto. Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 */
/*
 * Módulo do hub, parte do app real (Lovable, projeto 2d1b57ac-...).
 * Estado de uma rede em Resultados › Redes (função total, pura). NUNCA inventa número:
 * só decide qual mensagem mostrar. Substitui o `estadoDoCard` de 3 estados (design, "Estado da rede").
 * Fonte de verdade final = Lovable.
 */
import type { SocialProvider } from "./tipos-proto";
import { redeConectada, type ConexaoEstado } from "./tipos-proto";

/** Subconjunto não sensível da conexão (sem token, escopo, URN nem e-mail). Mesmo tipo de `redes-cards.ts`. */
export type { ConexaoEstado };

export type MotivoNaoConectada = "ausente" | "expirada" | "erro";

export type EstadoRede =
  | { tipo: "em_breve"; conectada: boolean }
  | { tipo: "nao_conectada"; motivo: MotivoNaoConectada }
  | { tipo: "sem_dados" }
  | { tipo: "ok" };

/**
 * Ordem: sem coleta → em_breve; sem conexão ativa → nao_conectada; sem linhas → sem_dados; senão ok.
 * `linhasNoPeriodo` inválido (NaN, negativo, não finito) conta como zero.
 */
export function estadoDaRede(
  rede: SocialProvider,
  conexoes: readonly ConexaoEstado[],
  linhasNoPeriodo: number,
  coleta: boolean,
): EstadoRede {
  const lista = Array.isArray(conexoes) ? conexoes : [];
  const conectada = redeConectada(rede, lista);
  if (!coleta) return { tipo: "em_breve", conectada };
  if (!conectada) return { tipo: "nao_conectada", motivo: motivoDaDesconexao(rede, lista) };
  const linhas = Number.isFinite(linhasNoPeriodo) ? linhasNoPeriodo : 0;
  if (linhas <= 0) return { tipo: "sem_dados" };
  return { tipo: "ok" };
}

/** Por que a rede não está conectada: expirada, com erro ou sem nenhuma conexão utilizável. */
function motivoDaDesconexao(rede: SocialProvider, conexoes: readonly ConexaoEstado[]): MotivoNaoConectada {
  // No LinkedIn só a conexão de leitura alimenta métricas; a de escrita não entra no motivo.
  const daRede = conexoes.filter((c) => c.provider === rede && (rede !== "linkedin" || c.tipoAcesso === "leitura"));
  if (daRede.some((c) => c.status === "expirado")) return "expirada";
  if (daRede.some((c) => c.status === "erro")) return "erro";
  return "ausente";
}

export const TEXTO_CAMINHO_INTEGRACOES = "Configurações › Integrações";

export const TEXTOS_ESTADO_REDE = {
  emBreveTitulo: "Em breve",
  emBreveDetalhe: "A coleta de dados desta rede ainda não está disponível.",
  emBreveNaoConectada: "Esta rede também ainda não está conectada.",
  naoConectadaTitulo: "Rede não conectada",
  naoConectadaAusente: `Conecte em ${TEXTO_CAMINHO_INTEGRACOES}.`,
  naoConectadaExpirada: `A conexão expirou. Reconecte em ${TEXTO_CAMINHO_INTEGRACOES}.`,
  naoConectadaErro: `A conexão teve erro. Verifique em ${TEXTO_CAMINHO_INTEGRACOES}.`,
  semDadosSemHistorico: "Esta rede ainda não tem dados sincronizados",
  semDadosNoPeriodo: "Sem dados neste período",
} as const;

/**
 * Textos do estado, em ordem de exibição (título/rótulo principal, depois detalhes).
 * `ok` não tem texto: quem mostra são os números. `temHistorico` só vale para `sem_dados`.
 */
export function textosDoEstado(estado: EstadoRede, temHistorico = false): string[] {
  const T = TEXTOS_ESTADO_REDE;
  switch (estado.tipo) {
    case "em_breve":
      return estado.conectada ? [T.emBreveTitulo, T.emBreveDetalhe] : [T.emBreveTitulo, T.emBreveDetalhe, T.emBreveNaoConectada];
    case "nao_conectada":
      return [
        T.naoConectadaTitulo,
        estado.motivo === "expirada" ? T.naoConectadaExpirada : estado.motivo === "erro" ? T.naoConectadaErro : T.naoConectadaAusente,
      ];
    case "sem_dados":
      return [temHistorico ? T.semDadosNoPeriodo : T.semDadosSemHistorico];
    case "ok":
      return [];
  }
}
