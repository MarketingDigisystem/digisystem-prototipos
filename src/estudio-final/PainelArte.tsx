// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/components/estudio/ArteStep.tsx (estilo, formato, Story, Finalizar arte, exportar) @ leitura
//   2026-10 (clone mhdgst-trabalho, somente leitura). Arranjo aprovado: prototipos/react/src/estudio-conteudo/
//   EstudioConteudo.tsx (rodada 6, PainelArte). Fonte da verdade = clone real. Regenerar (não remendar).
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
// Refino pós-feedback: 2 colunas, sem trilho, Briefing (2026-11-04).
// Refino pós-feedback 2: exportar SVG, carregamento IA, acervo, seleção larga, botões de continuidade,
//   parecer, sem ícone de rede (2026-11-04). Aqui: sem “Exportar PNG”; “Exportar SVG” é a exportação
//   principal e, no carrossel (C), “Baixar .zip” com todas as pranchetas em SVG. Largura mínima fixa nos
//   botões: o rótulo “Baixado” não desloca o vizinho.
//
// COLUNA DA DIREITA do passo Conteúdo (sticky em lg+), nesta ordem e nada mais:
//   1. “Estilo da arte” A/B/C (segmented, topo);
//   2. Formato Feed 4:5 / Story 9:16 + “Gerar versão Story” (ação secundária pequena; some no carrossel);
//   3. a PRÉVIA, que é o seletor da fonte da imagem quando vazia (children = QuadroArte);
//   4. UMA linha de ação: “Finalizar arte” (loader discreto) + exportar SVG (+ .zip no carrossel).
// Sem cartão “Arte” duplicado, sem parágrafo explicativo, sem lista de status (o status vive nos selos da
// prévia), sem a prévia por rede (ela foi para Revisar e enviar).
import { Download, FileArchive } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { BotaoExportar } from "./Gaveta";
import type { Estilo, Formato } from "./efData";
import { CARD_COMPACTO, FOCO, Segmentado, Spinner } from "./ui";

export function PainelArte({
  estilo,
  onEstilo,
  formato,
  onFormato,
  gerandoStory,
  storyPronta,
  onGerarStory,
  temImagem,
  finalizando,
  finalizada,
  onFinalizar,
  children,
}: {
  estilo: Estilo;
  onEstilo: (e: Estilo) => void;
  formato: Formato;
  onFormato: (f: Formato) => void;
  gerandoStory: boolean;
  storyPronta: boolean;
  onGerarStory: () => void;
  temImagem: boolean;
  finalizando: boolean;
  finalizada: boolean;
  onFinalizar: () => void;
  children: ReactNode;
}) {
  const ehC = estilo === "C";
  const dims = ehC ? "Carrossel · 1080×1350" : formato === "story" ? "Story · 1080×1920" : "Feed · 1080×1350";

  return (
    <section id="ef-sec-arte" aria-labelledby="ef-arte-h" className={cn(CARD_COMPACTO, "scroll-mt-24 space-y-3")}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="ef-arte-h" className="font-display text-base font-bold text-primary">Arte</h2>
        <span className="text-[11px] text-muted-foreground">{dims}</span>
      </div>

      {/* 1. estilo no topo */}
      <div>
        <p className="mb-1 font-display text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estilo da arte</p>
        <Segmentado
          className="flex w-full"
          rotulo="Estilo da arte"
          valor={estilo}
          onChange={onEstilo}
          opcoes={[
            { id: "A", label: "A · Foto", titulo: "Template A: foto com overlay" },
            { id: "B", label: "B · Bandas", titulo: "Template B: bandas e fundo sólido" },
            { id: "C", label: "C · Carrossel", titulo: "Template C: carrossel" },
          ]}
        />
      </div>

      {/* 2. formato + Story (a ação ocupa espaço reservado: nada pula quando o rótulo muda) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmentado
          rotulo="Formato"
          valor={formato}
          onChange={onFormato}
          opcoes={[
            { id: "feed", label: "Feed 4:5" },
            { id: "story", label: "Story 9:16", desabilitado: ehC, titulo: ehC ? "O carrossel é só Feed" : undefined },
          ]}
        />
        {!ehC && (
          <button
            type="button"
            onClick={onGerarStory}
            disabled={gerandoStory || storyPronta}
            className={cn(
              "inline-flex min-w-[9.5rem] items-center justify-center gap-1.5 rounded-full border border-[#36499b]/30 bg-background px-3 py-1.5 font-display text-[11px] font-bold text-primary transition-colors hover:border-[#36499b]/50 hover:bg-secondary disabled:opacity-70 motion-reduce:transition-none",
              FOCO,
            )}
          >
            {gerandoStory && <Spinner className="h-3 w-3" />}
            {storyPronta ? "Versão Story pronta" : gerandoStory ? "Gerando Story…" : "Gerar versão Story"}
          </button>
        )}
      </div>

      {/* 3. prévia = seletor da fonte da imagem quando vazia */}
      <div id="ef-previa-arte" className="mx-auto w-full max-w-[360px] scroll-mt-24">
        {children}
      </div>

      {/* 4. uma linha de ação: finalizar + exportar SVG (+ .zip no carrossel). Sem PNG. */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onFinalizar}
          disabled={!temImagem || finalizando || finalizada}
          title={!temImagem ? "Escolha a imagem para finalizar" : undefined}
          className={cn(
            "inline-flex min-w-[10.5rem] items-center justify-center gap-2 rounded-full bg-[#36499b] px-5 py-2 font-display text-xs font-bold text-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            FOCO,
          )}
        >
          {finalizando && <Spinner className="h-3.5 w-3.5" />}
          {finalizando ? "Finalizando…" : finalizada ? "Arte finalizada" : "Finalizar arte"}
        </button>
        <BotaoExportar principal className="min-w-[8.5rem]" icone={<Download aria-hidden className="h-3.5 w-3.5" />} rotulo="Exportar SVG" />
        {ehC && <BotaoExportar className="min-w-[8rem]" icone={<FileArchive aria-hidden className="h-3.5 w-3.5" />} rotulo="Baixar .zip" />}
      </div>
    </section>
  );
}
