// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: kit “07 · AIGenerateButton” (Arquivos_temporarios_for_AI/digisystem-loading-buttons) + mock v2
//   (prototipos/mock-botao-escrever-ia-v2.html). Fonte da verdade = app real. Regenerar (não remendar).
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md (“Botão Escrever com a IA — componente 07 adaptado”).
//
// Rodapé do Briefing: checklist “A IA vai escrever para …” à ESQUERDA, cartão-botão à DIREITA (coluna de largura
// fixa, então nada se desloca entre os estados). Abaixo de md empilha: checklist em cima, botão embaixo.
import { REDES, type RedeId } from "../efData";
import { AIGenerateButton } from "./AIGenerateButton";
import { AIGenerationChecklist } from "./AIGenerationChecklist";
import type { AIGeneration } from "./useAIGeneration";
import type { AIStep } from "./types";

/** “o Instagram”, “o Instagram e o LinkedIn”, “o Instagram, o LinkedIn e o Facebook”. */
function listaDeRedes(ids: RedeId[]) {
  const nomes = REDES.filter((r) => ids.includes(r.id)).map((r) => `o ${r.label}`);
  if (nomes.length <= 1) return nomes[0] ?? "as redes escolhidas";
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

function montarPassos(tema: string, redes: RedeId[]): AIStep[] {
  const temaCurto = tema.trim().length > 56 ? `${tema.trim().slice(0, 55)}…` : tema.trim();
  return [
    {
      id: "legenda",
      label: "Legenda",
      detail: temaCurto ? `tom de colega, parágrafos curtos, sobre “${temaCurto}”` : "tom de colega, parágrafos curtos",
      doing: "Escrevendo a legenda",
    },
    { id: "hashtags", label: "Hashtags", detail: "as 3 oficiais da marca + até 5 do tema (máx. 8)", doing: "Escolhendo as hashtags" },
    {
      id: "cta",
      label: "CTA",
      detail: redes.length > 1 ? "chamada curta no formato de cada rede" : "chamada curta no formato da rede",
      doing: "Fechando o CTA",
    },
  ];
}

export function EscreverIA({
  escrita,
  tema,
  redes,
  faltam,
  onRevisar,
}: {
  escrita: AIGeneration;
  tema: string;
  redes: RedeId[];
  /** Rótulos dos campos obrigatórios que faltam (vazio = pode gerar). */
  faltam: string[];
  /** Clique no sucesso: vai para a Etapa 2 · Conteúdo. */
  onRevisar: () => void;
}) {
  const passos = montarPassos(tema, redes);
  return (
    <div className="mt-5 grid grid-cols-1 items-center gap-5 md:grid-cols-[minmax(0,1fr)_340px]">
      <AIGenerationChecklist
        steps={passos}
        state={escrita.state}
        activeStep={escrita.activeStep}
        title={`A IA vai escrever para ${listaDeRedes(redes)}`}
      />
      <AIGenerateButton
        state={escrita.state}
        steps={passos}
        activeStep={escrita.activeStep}
        progress={escrita.progress}
        secondsLeft={escrita.secondsLeft}
        cancelled={escrita.cancelled}
        onGenerate={escrita.start}
        onCancel={escrita.cancel}
        onReview={onRevisar}
        blocked={faltam.length > 0}
        blockedHelper={`Falta preencher: ${faltam.join(", ")}.`}
      />
    </div>
  );
}
