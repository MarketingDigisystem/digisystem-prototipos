// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/components/estudio/DirecaoCriativaStep.tsx (blocos Legenda/Hashtags/CTA, BotaoIa que
//   SAI), ContadorLimite.tsx, src/lib/estudio-regras.ts (LIMITE_*) @ leitura 2026-10 (clone mhdgst-trabalho,
//   somente leitura). Fonte da verdade = clone real.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md (rodadas 1–5)
//
// Refino pós-feedback: 2 colunas, sem trilho, Briefing (2026-11-04). Esta é a COLUNA DA ESQUERDA do passo
//   Conteúdo (como em estudio-conteudo, rodada 6), na densidade compacta (cartão p-4, blocos p-3).
//
// Seção “Texto”: título/subtítulo no TOPO (com a tag curta “na arte”), depois legenda/hashtags/CTA com
// “ok por padrão + Editar”. SEM botões Regenerar/Sugerir por bloco: a IA vive no agente. Enquanto o agente
// escreve, os blocos mostram esqueleto com a MESMA altura (zero layout shift).
import { Check, ImageIcon, Pencil, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { type Estilo, type Slide, LIMITE_HASHTAGS, LIMITE_PALAVRAS_SUBTITULO, LIMITE_PALAVRAS_TITULO, contarPalavras } from "./efData";
import { CARD_COMPACTO, FOCO, ROTULO, SeloOk } from "./ui";

function Contador({ n, max }: { n: number; max: number }) {
  return (
    <span className={cn("font-sans text-[11px] font-normal", n > max ? "text-[#c24a12]" : "text-muted-foreground")} aria-live="polite">
      {n}/{max} palavras{n > max ? " · acima do padrão da marca" : ""}
    </span>
  );
}

function TagNaArte() {
  return (
    <span
      title="Este texto é desenhado sobre a imagem da arte. A legenda do post fica mais abaixo."
      className="inline-flex items-center gap-1 rounded-full bg-[var(--sky-soft)] px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-primary"
    >
      <ImageIcon aria-hidden className="h-3 w-3" /> na arte
    </span>
  );
}

function Bloco({
  titulo,
  editando,
  onEditar,
  onConfirmar,
  gerando,
  altura,
  children,
  editor,
  extra,
}: {
  titulo: string;
  editando: boolean;
  onEditar: () => void;
  onConfirmar: () => void;
  gerando: boolean;
  altura: string;
  children: ReactNode;
  editor: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold text-primary">{titulo}</h3>
        <div className="flex items-center gap-2">
          <SeloOk ok={!gerando && !editando}>{gerando ? "Escrevendo…" : editando ? "Editando" : "ok"}</SeloOk>
          {/* âncora fixa: o botão fica sempre no mesmo lugar, só troca de rótulo */}
          <button
            type="button"
            disabled={gerando}
            onClick={editando ? onConfirmar : onEditar}
            className={cn(
              "inline-flex min-w-[5.5rem] items-center justify-center gap-1 rounded-full px-3 py-1 font-display text-[11px] font-bold transition-colors disabled:opacity-50 motion-reduce:transition-none",
              FOCO,
              editando ? "bg-[#36499b] text-white" : "bg-secondary text-primary hover:bg-secondary/70",
            )}
          >
            {editando ? <Check aria-hidden className="h-3 w-3" /> : <Pencil aria-hidden className="h-3 w-3" />}
            {editando ? "Confirmar" : "Editar"}
          </button>
        </div>
      </div>
      <div className={cn("mt-2", altura)} aria-busy={gerando}>
        {gerando ? (
          <div className="space-y-2" aria-hidden>
            <div className="ef-shimmer h-3.5 w-full rounded-full" />
            <div className="ef-shimmer h-3.5 w-11/12 rounded-full" />
            <div className="ef-shimmer h-3.5 w-8/12 rounded-full" />
          </div>
        ) : editando ? (
          editor
        ) : (
          children
        )}
      </div>
      {extra}
    </div>
  );
}

export function TextoSecao({
  estilo,
  slides,
  indice,
  setIndice,
  patchSlide,
  legenda,
  setLegenda,
  hashtags,
  setHashtags,
  cta,
  setCta,
  gerando,
}: {
  estilo: Estilo;
  slides: Slide[];
  indice: number;
  setIndice: (i: number) => void;
  patchSlide: (i: number, p: Partial<Slide>) => void;
  legenda: string;
  setLegenda: (v: string) => void;
  hashtags: string[];
  setHashtags: (v: string[]) => void;
  cta: string;
  setCta: (v: string) => void;
  gerando: boolean;
}) {
  const [edit, setEdit] = useState({ legenda: false, hashtags: false, cta: false });
  const [novaTag, setNovaTag] = useState("");
  const idx = estilo === "C" ? Math.min(indice, slides.length - 1) : 0;
  const slide = slides[idx];
  const nT = contarPalavras(slide.titulo);
  const nS = contarPalavras(slide.subtitulo);
  const rotuloPapel = slide.papel === "capa" ? "Capa" : slide.papel === "cta" ? "CTA" : "Miolo";

  const addTag = () => {
    const limpa = novaTag.trim().replace(/^#+/, "").replace(/\s+/g, "");
    if (!limpa || hashtags.length >= LIMITE_HASHTAGS) return;
    const formatada = "#" + limpa.charAt(0).toUpperCase() + limpa.slice(1).toLowerCase();
    if (!hashtags.includes(formatada)) setHashtags([...hashtags, formatada]);
    setNovaTag("");
  };

  return (
    <section id="ef-sec-texto" aria-labelledby="ef-texto-h" className={cn(CARD_COMPACTO, "scroll-mt-24")}>
      <h2 id="ef-texto-h" className="font-display text-base font-bold text-primary">Texto</h2>

      {/* ---------- título e subtítulo (na arte) ---------- */}
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-sm font-bold text-primary">Título e subtítulo</h3>
          <TagNaArte />
        </div>
        {estilo === "C" && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Prancheta em edição">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === idx}
                onClick={() => setIndice(i)}
                className={cn("rounded-full px-3 py-1 font-display text-xs font-bold", FOCO, i === idx ? "bg-[#ff6d2d] text-white" : "bg-secondary text-primary hover:bg-secondary/70")}
              >
                {i + 1}
              </button>
            ))}
            <span className="ml-1 text-[11px] text-muted-foreground">Editando: prancheta {idx + 1} de {slides.length} · {rotuloPapel}</span>
          </div>
        )}
        <label className="mt-3 block">
          <span className="flex items-center justify-between gap-2 font-display text-xs font-bold text-primary">
            Título <Contador n={nT} max={LIMITE_PALAVRAS_TITULO} />
          </span>
          <input
            value={slide.titulo}
            onChange={(e) => patchSlide(idx, { titulo: e.target.value })}
            placeholder="Ex: Dado organizado decide melhor"
            className={cn("mt-1 h-11 w-full rounded-2xl border border-border bg-card px-3.5 font-display text-lg font-bold text-primary", FOCO)}
          />
        </label>
        <label className="mt-3 block">
          <span className="flex items-center justify-between gap-2 font-display text-xs font-bold text-primary">
            Subtítulo (opcional) <Contador n={nS} max={LIMITE_PALAVRAS_SUBTITULO} />
          </span>
          <input
            value={slide.subtitulo}
            onChange={(e) => patchSlide(idx, { subtitulo: e.target.value })}
            placeholder="Ex: Governança de dados sem complicação"
            className={cn("mt-1 h-10 w-full rounded-2xl border border-border bg-card px-3.5 text-sm", FOCO)}
          />
        </label>
        <details className="mt-2 group">
          <summary className={cn("inline-flex cursor-pointer list-none items-center gap-1 rounded-full px-1 py-1 font-display text-[11px] font-bold text-muted-foreground hover:text-primary", FOCO)}>
            <span className="transition-transform group-open:rotate-90 motion-reduce:transition-none" aria-hidden>›</span> Etiqueta (opcional)
          </summary>
          <input
            value={slide.etiqueta}
            onChange={(e) => patchSlide(idx, { etiqueta: e.target.value })}
            aria-label="Etiqueta da arte"
            placeholder="Ex: Governança de dados"
            className={cn("mt-1.5 h-9 w-full max-w-xs rounded-xl border border-border bg-card px-3 text-sm", FOCO)}
          />
        </details>
      </div>

      {/* ---------- divisor ---------- */}
      <div className="my-4 flex items-center gap-3" role="separator" aria-label="Texto do post, vai na legenda">
        <span className="h-px flex-1 bg-border" />
        <span className={ROTULO}>Texto do post · vai na legenda</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-3">
        <Bloco
          titulo="Legenda"
          editando={edit.legenda}
          gerando={gerando}
          altura="min-h-[7.5rem]"
          onEditar={() => setEdit((e) => ({ ...e, legenda: true }))}
          onConfirmar={() => setEdit((e) => ({ ...e, legenda: false }))}
          editor={
            <textarea
              autoFocus
              rows={6}
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              aria-label="Legenda do post"
              className={cn("w-full resize-y rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed", FOCO)}
            />
          }
        >
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{legenda}</p>
        </Bloco>

        <Bloco
          titulo="Hashtags"
          editando={edit.hashtags}
          gerando={gerando}
          altura="min-h-[3.25rem]"
          onEditar={() => setEdit((e) => ({ ...e, hashtags: true }))}
          onConfirmar={() => setEdit((e) => ({ ...e, hashtags: false }))}
          extra={<p className="mt-2 text-[11px] text-muted-foreground">{hashtags.length}/{LIMITE_HASHTAGS} · as três primeiras são as oficiais da marca</p>}
          editor={
            <div>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((h, i) => (
                  <span key={h} className="inline-flex items-center gap-1 rounded-full bg-[var(--orange-soft)] px-2.5 py-1 text-xs font-semibold text-[#c24a12]">
                    {h}
                    {i >= 3 && (
                      <button type="button" aria-label={`Remover ${h}`} onClick={() => setHashtags(hashtags.filter((x) => x !== h))} className={cn("rounded-full", FOCO)}>
                        <X aria-hidden className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={novaTag}
                  onChange={(e) => setNovaTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  aria-label="Nova hashtag"
                  placeholder="Nova hashtag"
                  className={cn("h-9 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-sm", FOCO)}
                />
                <button type="button" onClick={addTag} className={cn("rounded-xl bg-secondary px-3 font-display text-xs font-bold text-primary", FOCO)}>
                  Adicionar
                </button>
              </div>
            </div>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((h) => (
              <span key={h} className="rounded-full bg-[var(--orange-soft)] px-2.5 py-1 text-xs font-semibold text-[#c24a12]">{h}</span>
            ))}
          </div>
        </Bloco>

        <Bloco
          titulo="Chamada para ação (sugerida pela IA)"
          editando={edit.cta}
          gerando={gerando}
          altura="min-h-[3.25rem]"
          onEditar={() => setEdit((e) => ({ ...e, cta: true }))}
          onConfirmar={() => setEdit((e) => ({ ...e, cta: false }))}
          extra={
            <p className="mt-2 text-[11px] text-muted-foreground">
              LinkedIn e Facebook: link direto. Instagram: palavra-chave no comentário.
            </p>
          }
          editor={
            <textarea
              autoFocus
              rows={2}
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              aria-label="Chamada para ação"
              className={cn("w-full resize-y rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm", FOCO)}
            />
          }
        >
          <p className="text-sm leading-relaxed text-foreground">{cta}</p>
        </Bloco>
      </div>
    </section>
  );
}
