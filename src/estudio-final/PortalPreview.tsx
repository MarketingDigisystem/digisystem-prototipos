// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/components/estudio/PostPreview.tsx (cartão de prévia por rede, REDE_ICON/REDE_META),
//   StoryPreviewPanel.tsx, ResumoPost.tsx @ leitura 2026-10 (clone mhdgst-trabalho, somente leitura).
// Fonte da verdade = clone real. Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
//
// Refino pós-feedback: 2 colunas, sem trilho, Briefing (2026-11-04). A prévia por rede SAIU do passo
//   Conteúdo (não empilha mais sob a prévia da arte) e vive só em Etapa 3 “Revisar e enviar”, ao lado do
//   Parecer da IA e do envio.
//
// Prévia POR PORTAL: abas só das redes escolhidas no Briefing; cada aba mostra o post como aquela rede
// o desenha (Instagram, LinkedIn, Facebook), com a arte atual dentro. Em Story mostra o quadro vertical.
//
// Refino pós-feedback 2: exportar SVG, carregamento IA, acervo, seleção larga, botões de continuidade,
//   parecer, sem ícone de rede (2026-11-04). Aqui: as abas perderam os símbolos/logos de rede (e as cores
//   de marca das redes); são rótulos de texto “Instagram”, “LinkedIn”, “Facebook”. As molduras não usam
//   logo de rede; ficam só os ícones genéricos de ação do feed (curtir, comentar…), que não são marcas.
import { Bookmark, Globe, Heart, MessageCircle, MoreHorizontal, Repeat2, Send, Share2, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { ArteCanvas } from "./ArteCanvas";
import { type Ajustes, type Estilo, type Formato, type RedeId, type Slide, REDES } from "./efData";
import { FOCO } from "./ui";

function Avatar({ quadrado }: { quadrado?: boolean }) {
  return (
    <span className={cn("grid h-9 w-9 shrink-0 place-items-center bg-[#36499b]", quadrado ? "rounded-md" : "rounded-full")}>
      <svg width="20" height="20" viewBox="0 0 60 56" aria-hidden>
        <circle cx="18" cy="30" r="13" fill="#fff" />
        <circle cx="40" cy="18" r="9" fill="#ff6d2d" />
        <circle cx="44" cy="40" r="7" fill="#67cfee" />
      </svg>
    </span>
  );
}

export function PortalPreview({
  redes,
  estilo,
  formato,
  slides,
  aj,
  legenda,
  hashtags,
}: {
  redes: RedeId[];
  estilo: Estilo;
  formato: Formato;
  slides: Slide[];
  aj: Ajustes;
  legenda: string;
  hashtags: string[];
}) {
  const ativas = REDES.filter((r) => redes.includes(r.id));
  const [aba, setAba] = useState<RedeId>(ativas[0]?.id ?? "instagram");
  useEffect(() => {
    if (ativas.length && !ativas.some((r) => r.id === aba)) setAba(ativas[0].id);
  }, [ativas, aba]);
  const ehStory = formato === "story" && estilo !== "C";
  const capa = slides[0];
  const arte = (cls?: string) => (
    <ArteCanvas estilo={estilo} formato={formato} slide={capa} indice={0} total={slides.length} aj={aj} className={cn("block h-auto w-full", cls)} />
  );
  const textoCurto = legenda.split("\n")[0];

  if (ativas.length === 0) {
    return (
      <div className="rounded-3xl bg-card p-5 text-sm text-muted-foreground shadow-[var(--shadow-card)]">
        Escolha ao menos uma rede no Briefing para ver como o post aparece.
      </div>
    );
  }

  return (
    <section aria-labelledby="ef-portal-titulo" className="rounded-3xl bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="ef-portal-titulo" className="font-display text-lg font-bold text-primary">Como o post aparece</h2>
        {/* abas só com o NOME da rede (sem símbolo/logo de rede), item ativo em laranja sólido */}
        <div role="tablist" aria-label="Rede" className="inline-flex max-w-full gap-0.5 rounded-2xl bg-secondary p-1">
          {ativas.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={aba === r.id}
              onClick={() => setAba(r.id)}
              className={cn(
                "whitespace-nowrap rounded-xl px-3 py-1.5 font-display text-xs font-bold transition-colors motion-reduce:transition-none",
                FOCO,
                aba === r.id ? "bg-[#ff6d2d] text-white shadow-sm" : "text-muted-foreground hover:text-primary",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-3 w-full max-w-[380px] overflow-hidden rounded-2xl border border-border bg-white text-[#1f2a44]">
        {ehStory ? (
          <div className="mx-auto w-full max-w-[210px] bg-black p-0">
            <div className="relative">
              {arte()}
              <div className="absolute inset-x-2 top-2 flex gap-1" aria-hidden>
                <span className="h-0.5 flex-1 rounded-full bg-white" />
                <span className="h-0.5 flex-1 rounded-full bg-white/40" />
              </div>
              <div className="absolute inset-x-2 top-4 flex items-center gap-1.5 text-white">
                <Avatar />
                <span className="font-display text-[11px] font-bold">digisystem</span>
                <span className="text-[10px] opacity-80">Agora</span>
              </div>
            </div>
            {aba === "linkedin" && <p className="bg-white px-3 py-2 text-[10px] text-muted-foreground">O LinkedIn não tem Story. A versão vertical vale para Instagram e Facebook.</p>}
          </div>
        ) : aba === "instagram" ? (
          <div>
            <div className="flex items-center gap-2 px-3 py-2">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">digisystem</p>
                <p className="truncate text-[10px] text-muted-foreground">Brasil</p>
              </div>
              <MoreHorizontal aria-hidden className="h-4 w-4" />
            </div>
            {arte()}
            <div className="flex items-center gap-3 px-3 pt-2">
              <Heart aria-hidden className="h-5 w-5" />
              <MessageCircle aria-hidden className="h-5 w-5" />
              <Send aria-hidden className="h-5 w-5" />
              <Bookmark aria-hidden className="ml-auto h-5 w-5" />
            </div>
            <div className="px-3 pb-3 pt-1.5 text-xs leading-snug">
              <p className="line-clamp-2"><b>digisystem</b> {textoCurto}</p>
              <p className="mt-1 line-clamp-2 text-[#1d6fb8]">{hashtags.join(" ")}</p>
            </div>
          </div>
        ) : aba === "linkedin" ? (
          <div>
            <div className="flex items-start gap-2 px-3 pt-3">
              <Avatar quadrado />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">Digisystem</p>
                <p className="truncate text-[10px] text-muted-foreground">12.480 seguidores</p>
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground">Agora · <Globe aria-hidden className="h-3 w-3" /></p>
              </div>
            </div>
            <p className="line-clamp-3 px-3 py-2 text-xs leading-snug">{legenda.replace(/\n+/g, " ")}</p>
            {arte()}
            <div className="flex items-center justify-around border-t border-border px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ThumbsUp aria-hidden className="h-3.5 w-3.5" /> Gostei</span>
              <span className="inline-flex items-center gap-1"><MessageCircle aria-hidden className="h-3.5 w-3.5" /> Comentar</span>
              <span className="inline-flex items-center gap-1"><Repeat2 aria-hidden className="h-3.5 w-3.5" /> Repostar</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 px-3 py-2">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">Digisystem</p>
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground">Agora · <Globe aria-hidden className="h-3 w-3" /></p>
              </div>
              <MoreHorizontal aria-hidden className="h-4 w-4" />
            </div>
            <p className="line-clamp-2 px-3 pb-2 text-xs leading-snug">{textoCurto}</p>
            {arte()}
            <div className="flex items-center justify-around border-t border-border px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ThumbsUp aria-hidden className="h-3.5 w-3.5" /> Curtir</span>
              <span className="inline-flex items-center gap-1"><MessageCircle aria-hidden className="h-3.5 w-3.5" /> Comentar</span>
              <span className="inline-flex items-center gap-1"><Share2 aria-hidden className="h-3.5 w-3.5" /> Compartilhar</span>
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Prévia de {REDES.find((r) => r.id === aba)?.label}
        {estilo === "C" ? " · mostra a capa do carrossel" : ""}.
      </p>
    </section>
  );
}

