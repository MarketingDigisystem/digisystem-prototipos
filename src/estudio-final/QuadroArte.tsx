// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/components/estudio/ArteStep.tsx (fonte da imagem, candidatas, acervo, carrossel),
//   TemplateLivePreview.tsx, StoryPreviewPanel.tsx, ArteCarregando.tsx @ leitura 2026-10 (clone
//   mhdgst-trabalho, somente leitura). Fonte da verdade = clone real.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md (rodada 6, Opção A)
//
// Refino pós-feedback: 2 colunas, sem trilho, Briefing (2026-11-04). O estado da arte aparece SÓ nos
//   selos dentro da prévia (“Falta título” / “Arte pronta”); a lista de status fora do quadro saiu.
//
// A PRÉVIA É O SELETOR DA FONTE DA IMAGEM. Enquanto não há imagem, o próprio quadro (que muda de aspecto
// Feed 4:5 / Story 9:16) mostra três zonas: Upload, Gerar com IA, Acervo. Os estados assíncronos (envio,
// geração, busca, erro) acontecem no MESMO quadro, com o aspecto reservado: zero layout shift.
//
// Refino pós-feedback 2: exportar SVG, carregamento IA, acervo, seleção larga, botões de continuidade,
//   parecer, sem ícone de rede (2026-11-04). Aqui:
//   • GERANDO: fundo calmo claro (sky/navy suaves, sem aurora multicolor), símbolo da IA cheio no centro,
//     barra fina determinada com % e etapa, frases curtas e honestas que mudam com o progresso. O quadro
//     mantém o aspecto: nada pula ao começar/terminar. Movimento reduzido: sem halo pulsante.
//   • ESCOLHA DA IMAGEM (candidatas e acervo): sai do quadro 4:5/9:16 e abre a SelecaoAmpla, uma
//     superfície larga ancorada na coluna da arte que cobre a coluna do texto (sobreposição, sem reflow) em
//     lg+, e tela inteira abaixo de lg. O quadro não distorce. Rodapé com âncoras fixas: “Outra fonte” e
//     “Cancelar” à esquerda; ação do meio (“Gerar de novo”/“Buscar mais”) e “Usar esta imagem” à direita.
//   • ACERVO: campo de busca no topo, termos sugeridos numa única linha rolável, grade maior com miniaturas
//     de aspecto constante (cover), seleção com anel + check, skeletons no mesmo formato e estado vazio com
//     próximo passo.
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Images, Pencil, Search, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { IaDigisystem } from "../IaDigisystem";
import { ArteCanvas, FotoMini } from "./ArteCanvas";
import { type Ajustes, type Estilo, type Formato, type Slide, NOMES_CENAS, TERMOS_ACERVO } from "./efData";
import { FOCO, Spinner } from "./ui";

export type Quadro =
  | { t: "zonas" }
  | { t: "upload" }
  | { t: "prompt"; prompt: string }
  | { t: "gerando"; pct: number }
  | { t: "candidatas"; sel: number | null }
  | { t: "acervo"; carregando: boolean; mais?: boolean; termo: string; extra: number; sel: number | null }
  | { t: "erro"; msg: string; de: "upload" | "gerar" | "acervo" }
  | { t: "pronto" };

type QuadroSelecao = Extract<Quadro, { t: "candidatas" } | { t: "acervo" }>;

/** Estados em que a pessoa está ESCOLHENDO a imagem (abre a superfície larga). */
export function estaSelecionando(q: Quadro): q is QuadroSelecao {
  return q.t === "candidatas" || q.t === "acervo";
}

const FASES_GERACAO = ["Lendo o tema", "Compondo a cena", "Ajustando a luz", "Separando as quatro opções"];
function faseDaGeracao(pct: number) {
  return pct < 28 ? 0 : pct < 55 ? 1 : pct < 82 ? 2 : 3;
}

/** O acervo mock só “acha” fotos para termos próximos dos sugeridos (para demonstrar o estado vazio). */
function acervoTemResultado(termo: string) {
  const t = termo.trim().toLowerCase();
  if (!t) return true;
  return TERMOS_ACERVO.some((k) => k.includes(t) || t.includes(k));
}
/** Índice da cena mock exibida na posição i do acervo para um termo. */
export function cenaDoAcervo(i: number, termo: string) {
  return (i + (termo.length % 6)) % 6;
}

export function PontosIA({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 56" aria-hidden className={className}>
      <circle cx="18" cy="30" r="13" fill="#36499b" />
      <circle cx="40" cy="18" r="9" fill="#ff6d2d" />
      <circle cx="44" cy="40" r="7" fill="#67cfee" />
    </svg>
  );
}

export function QuadroArte({
  estilo,
  formato,
  slide,
  indice,
  total,
  aj,
  quadro,
  leitura,
  finalizada,
  onArquivo,
  onZona,
  onGerar,
  onPrompt,
  onCancelar,
  onTrocar,
  onSlide,
}: {
  estilo: Estilo;
  formato: Formato;
  slide: Slide;
  indice: number;
  total: number;
  aj: Ajustes;
  quadro: Quadro;
  leitura?: boolean;
  finalizada: boolean;
  onArquivo: (f: File) => void;
  onZona: (z: "upload" | "gerar" | "acervo") => void;
  onGerar: () => void;
  onPrompt: (p: string) => void;
  onCancelar: () => void;
  onTrocar: () => void;
  onSlide: (i: number) => void;
}) {
  const [arrastando, setArrastando] = useState(false);
  const ehStory = formato === "story" && estilo !== "C";
  const ratio = ehStory ? "9 / 16" : "4 / 5";
  const aceitaImagem = !(estilo === "C" && slide.papel === "cta");
  const mostrarArte = quadro.t === "pronto" || !aceitaImagem;
  const faltaTitulo = !leitura && slide.papel !== "cta" && !slide.titulo.trim();

  function soltar(e: React.DragEvent) {
    e.preventDefault();
    setArrastando(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onArquivo(f);
  }

  return (
    <div className={cn("mx-auto w-full", ehStory && "max-w-[250px]")}>
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-[var(--sky-soft)] ring-1 ring-border"
        style={{ aspectRatio: ratio }}
        onDragOver={(e) => {
          if (leitura || mostrarArte) return;
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={leitura || mostrarArte ? undefined : soltar}
      >
        {/* ---------- resultado ---------- */}
        {mostrarArte && (
          <>
            <ArteCanvas estilo={estilo} formato={formato} slide={slide} indice={indice} total={total} aj={aj} className="absolute inset-0 h-full w-full" />
            {/* status SÓ por selos na prévia (sem lista de status fora do quadro) */}
            {finalizada ? (
              <span role="status" className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[var(--success)] px-2.5 py-1 font-display text-[11px] font-bold text-white shadow-[var(--shadow-card)]">
                <Check aria-hidden className="h-3 w-3" /> Arte pronta
              </span>
            ) : faltaTitulo ? (
              <span role="status" className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[var(--warning-soft)] px-2.5 py-1 font-display text-[11px] font-bold text-[#6b4700] shadow-[var(--shadow-card)]">
                <AlertTriangle aria-hidden className="h-3 w-3" /> Falta título
              </span>
            ) : null}
            {!leitura && aceitaImagem && (
              <button
                type="button"
                onClick={onTrocar}
                className={cn(
                  "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 font-display text-[11px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/60",
                  FOCO,
                )}
              >
                <Pencil aria-hidden className="h-3 w-3" /> {slide.img === null ? "Adicionar imagem" : "Trocar imagem"}
              </button>
            )}
          </>
        )}

        {/* ---------- pendente: a prévia vira o seletor ---------- */}
        {!mostrarArte && quadro.t === "zonas" && (
          <div className={cn("absolute inset-0 flex flex-col gap-2 p-3 transition-colors", arrastando && "bg-[var(--orange-soft)]")}>
            {leitura ? (
              <div className="grid flex-1 place-items-center text-center">
                <p className="px-6 font-display text-sm font-bold text-primary">Escolha a imagem na etapa Conteúdo.</p>
              </div>
            ) : (
              <>
                <p className="px-1 pt-0.5 text-center font-display text-[11px] font-bold uppercase tracking-wider text-primary">
                  {arrastando ? "Solte a imagem aqui" : "Escolha a imagem da arte"}
                </p>
                <button
                  type="button"
                  onClick={() => onZona("upload")}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#36499b]/35 bg-card/80 px-3 text-center transition-colors hover:border-[#ff6d2d] hover:bg-card motion-reduce:transition-none",
                    FOCO,
                  )}
                >
                  <Upload aria-hidden className="h-5 w-5 text-[#36499b]" />
                  <span className="font-display text-sm font-bold text-primary">Arrastar ou enviar imagem</span>
                  <span className="text-[11px] text-muted-foreground">JPG, PNG ou WebP · até 5 MB</span>
                </button>
                <button
                  type="button"
                  onClick={() => onZona("gerar")}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-[#36499b] px-3 text-center text-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                    FOCO,
                  )}
                >
                  <PontosIA className="h-6 w-6" />
                  <span className="font-display text-sm font-bold">Gerar com IA</span>
                  <span className="text-[11px] text-white/75">Quatro opções a partir do tema</span>
                </button>
                <button
                  type="button"
                  onClick={() => onZona("acervo")}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card/80 px-3 text-center transition-colors hover:border-[#ff6d2d] hover:bg-card motion-reduce:transition-none",
                    FOCO,
                  )}
                >
                  <Search aria-hidden className="h-5 w-5 text-[#36499b]" />
                  <span className="font-display text-sm font-bold text-primary">Buscar no acervo</span>
                  <span className="text-[11px] text-muted-foreground">Fotos da Digisystem</span>
                </button>
                <p className="px-2 pb-0.5 text-center text-[10px] leading-tight text-muted-foreground">
                  O título e o subtítulo entram por cima da imagem.
                </p>
              </>
            )}
          </div>
        )}

        {/* ---------- upload ---------- */}
        {!mostrarArte && quadro.t === "upload" && (
          <div className="absolute inset-0 grid place-items-center bg-card/80" role="status" aria-live="polite">
            <div className="flex flex-col items-center gap-2 text-center">
              <Spinner className="h-6 w-6 text-[#36499b]" />
              <p className="font-display text-sm font-bold text-primary">Enviando imagem…</p>
              <p className="text-[11px] text-muted-foreground">Ajustando para o formato da arte</p>
            </div>
          </div>
        )}

        {/* ---------- prompt ---------- */}
        {!mostrarArte && quadro.t === "prompt" && (
          <div className="absolute inset-0 flex flex-col gap-2 bg-card p-3">
            <div className="flex items-center gap-2">
              <PontosIA className="h-5 w-5" />
              <p className="font-display text-sm font-bold text-primary">Descreva a imagem</p>
              <button type="button" onClick={onCancelar} aria-label="Voltar para as opções" className={cn("ml-auto grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary", FOCO)}>
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={quadro.prompt}
              onChange={(e) => onPrompt(e.target.value)}
              aria-label="Descrição da imagem para a IA"
              className={cn("min-h-0 flex-1 resize-none rounded-2xl border border-border bg-background p-3 text-xs leading-relaxed text-foreground", FOCO)}
            />
            <button
              type="button"
              onClick={onGerar}
              disabled={!quadro.prompt.trim()}
              className={cn(
                "rounded-2xl bg-[#ff6d2d] px-4 py-2.5 font-display text-xs font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50 motion-reduce:transition-none",
                FOCO,
              )}
            >
              Gerar quatro opções
            </button>
          </div>
        )}

        {/* ---------- gerando: momento de peso, símbolo cheio ---------- */}
        {!mostrarArte && quadro.t === "gerando" && (
          <GerandoImagem pct={quadro.pct} compacto={ehStory} />
        )}

        {/* ---------- escolhendo: a escolha acontece na superfície larga (SelecaoAmpla); o quadro só descansa ---------- */}
        {!mostrarArte && estaSelecionando(quadro) && (
          <div className="absolute inset-0 grid place-items-center bg-[var(--sky-soft)] p-4 text-center" aria-hidden>
            <div className="flex flex-col items-center gap-2 opacity-80">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-card text-[#36499b] shadow-[var(--shadow-card)]">
                <Images className="h-5 w-5" />
              </span>
              <p className="font-display text-sm font-bold text-primary">Escolhendo a imagem</p>
            </div>
          </div>
        )}

        {/* ---------- erro ---------- */}
        {!mostrarArte && quadro.t === "erro" && (
          <div className="absolute inset-0 grid place-items-center bg-card p-4" role="alert">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--orange-soft)] text-[#c24a12]">
                <AlertTriangle aria-hidden className="h-5 w-5" />
              </span>
              <p className="font-display text-sm font-bold text-primary">Não foi possível usar a imagem</p>
              <p className="text-[11px] text-muted-foreground">{quadro.msg}</p>
              <button type="button" onClick={onCancelar} className={cn("mt-1 rounded-2xl bg-[#ff6d2d] px-4 py-2 font-display text-xs font-bold text-white", FOCO)}>
                Tentar de novo
              </button>
            </div>
          </div>
        )}

        {/* ---------- navegador do carrossel ‹1/N› ---------- */}
        {estilo === "C" && total > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-black/55 px-1 py-0.5 text-white backdrop-blur-sm">
              <button type="button" aria-label="Prancheta anterior" disabled={indice === 0} onClick={() => onSlide(indice - 1)} className={cn("grid h-8 w-8 place-items-center rounded-full hover:bg-white/15 disabled:opacity-40", FOCO)}>
                <ChevronLeft aria-hidden className="h-4 w-4" />
              </button>
              <span className="min-w-[3.5rem] text-center font-display text-xs font-bold" aria-live="polite">
                {indice + 1}/{total} · {slide.papel === "capa" ? "Capa" : slide.papel === "cta" ? "CTA" : "Miolo"}
              </span>
              <button type="button" aria-label="Próxima prancheta" disabled={indice === total - 1} onClick={() => onSlide(indice + 1)} className={cn("grid h-8 w-8 place-items-center rounded-full hover:bg-white/15 disabled:opacity-40", FOCO)}>
                <ChevronRight aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        id="ef-input-arquivo"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onArquivo(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}



/* ======================================================================================
   GERANDO A IMAGEM — momento de peso da IA (símbolo cheio), dentro do quadro com aspecto reservado.
   Fundo claro e calmo (sky/navy suaves): o símbolo azul não some num fundo navy (regra de contraste).
   ====================================================================================== */
function GerandoImagem({ pct, compacto }: { pct: number; compacto?: boolean }) {
  const fase = faseDaGeracao(pct);
  const valor = Math.min(100, Math.round(pct));
  return (
    <div className="ef-gerando absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
      <div className="relative grid place-items-center">
        <span aria-hidden className={cn("ef-gerando-halo absolute rounded-full", compacto ? "h-28 w-28" : "h-36 w-36")} />
        <IaDigisystem size={compacto ? 76 : 92} estado="processando" />
      </div>
      <p className="mt-4 font-display text-base font-bold text-primary">Gerando a imagem</p>
      {/* altura fixa: a troca de frase não empurra a barra */}
      <p className="mt-1 h-4 text-xs text-[#36499b]/80" role="status" aria-live="polite">
        <span key={fase} className="ef-status-troca inline-block">{FASES_GERACAO[fase]}</span>
      </p>
      <div className="mt-4 w-full max-w-[13rem]">
        <div className="flex items-center justify-between font-display text-[10px] font-bold uppercase tracking-wider text-[#36499b]/70">
          <span>Etapa {fase + 1} de {FASES_GERACAO.length}</span>
          <span className="tabular-nums text-[#36499b]">{valor}%</span>
        </div>
        <div
          className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#36499b]/12"
          role="progressbar"
          aria-label="Progresso da geração"
          aria-valuenow={valor}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-[#ff6d2d] transition-[width] duration-300 ease-out motion-reduce:transition-none" style={{ width: `${valor}%` }} />
        </div>
      </div>
      <p className="mt-3 max-w-[15rem] text-[11px] leading-snug text-muted-foreground">
        Costuma levar alguns segundos. Enquanto isso, você pode revisar o texto.
      </p>
    </div>
  );
}

/* ======================================================================================
   SUPERFÍCIE LARGA DE ESCOLHA (candidatas da IA e acervo).
   lg+: absoluta, ancorada à direita da coluna da arte e cobrindo a coluna do texto (sem reflow); abaixo de
   lg: tela inteira. O quadro da arte não muda de aspecto. Rodapé com posições fixas.
   ====================================================================================== */
function Miniatura({
  cena,
  ratio,
  selecionada,
  rotulo,
  legenda,
  atraso,
  onSelecionar,
  onUsar,
}: {
  cena: number;
  ratio: string;
  selecionada: boolean;
  rotulo: string;
  legenda?: string;
  atraso: number;
  onSelecionar: () => void;
  onUsar: () => void;
}) {
  return (
    <div className="ef-entra min-w-0" style={{ animationDelay: `${atraso}ms` }}>
      <button
        type="button"
        onClick={onSelecionar}
        onDoubleClick={onUsar}
        aria-pressed={selecionada}
        aria-label={rotulo}
        className={cn(
          "group relative block w-full overflow-hidden rounded-2xl bg-secondary ring-offset-2 ring-offset-card transition-[box-shadow,transform] duration-200 motion-reduce:transition-none",
          FOCO,
          selecionada ? "ring-[3px] ring-[#ff6d2d]" : "ring-2 ring-transparent hover:ring-[#67cfee]",
        )}
        style={{ aspectRatio: ratio }}
      >
        <FotoMini idx={cena} className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        <span
          aria-hidden
          className={cn(
            "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border-2 transition-colors motion-reduce:transition-none",
            selecionada ? "border-[#ff6d2d] bg-[#ff6d2d] text-white" : "border-white/90 bg-black/20 text-transparent group-hover:bg-black/30",
          )}
        >
          <Check className="h-4 w-4" />
        </span>
      </button>
      {legenda && (
        <p className={cn("mt-1.5 truncate px-0.5 font-display text-xs font-bold", selecionada ? "text-[#c24a12]" : "text-primary")}>{legenda}</p>
      )}
    </div>
  );
}

export function SelecaoAmpla({
  quadro,
  formato,
  estilo,
  onSelecionar,
  onConfirmar,
  onCancelar,
  onOutraFonte,
  onGerarDeNovo,
  onTermo,
  onBuscarMais,
}: {
  quadro: QuadroSelecao;
  formato: Formato;
  estilo: Estilo;
  onSelecionar: (i: number) => void;
  onConfirmar: (i?: number) => void;
  onCancelar: () => void;
  onOutraFonte: () => void;
  onGerarDeNovo: () => void;
  onTermo: (t: string) => void;
  onBuscarMais: () => void;
}) {
  const ehStory = formato === "story" && estilo !== "C";
  const ratio = ehStory ? "9 / 16" : "4 / 5";
  const ehAcervo = quadro.t === "acervo";
  const raiz = useRef<HTMLDivElement>(null);
  const [busca, setBusca] = useState(ehAcervo ? quadro.termo : "");
  const termoAtual = ehAcervo ? quadro.termo : "";
  useEffect(() => setBusca(termoAtual), [termoAtual]);

  const cancelarRef = useRef(onCancelar);
  cancelarRef.current = onCancelar;
  useEffect(() => {
    raiz.current?.focus({ preventScroll: true });
    /* em lg+ a superfície é absoluta na coluna da arte: garante que o cabeçalho (busca) fique visível */
    if (window.matchMedia("(min-width: 1024px)").matches) {
      const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      raiz.current?.scrollIntoView({ block: "nearest", behavior: reduzido ? "auto" : "smooth" });
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && cancelarRef.current();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  const sel = quadro.sel;
  const vazio = ehAcervo && !quadro.carregando && !acervoTemResultado(quadro.termo);
  const totalAcervo = ehAcervo ? 10 + quadro.extra * 5 : 0;
  const carregandoInicial = ehAcervo && quadro.carregando && !quadro.mais;
  const carregandoMais = ehAcervo && quadro.carregando && !!quadro.mais;

  return (
    <div
      ref={raiz}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ef-selecao-h"
      className={cn(
        /* abaixo de lg: tela inteira. top-[76px] só por causa da faixa do seletor de protótipos (fora do app);
           no app real seria inset-0. */
        "ef-amplia fixed inset-x-0 bottom-0 top-[76px] z-[60] flex flex-col bg-card outline-none lg:scroll-mt-24",
        "lg:absolute lg:inset-auto lg:right-0 lg:top-0 lg:z-30 lg:h-full lg:max-h-[calc(100dvh-2rem)] lg:w-[calc(200%+1.25rem)] lg:rounded-3xl lg:shadow-[var(--shadow-float)] lg:ring-1 lg:ring-border",
      )}
    >
      {/* cabeçalho ancorado */}
      <div className="flex shrink-0 items-start gap-3 border-b border-border px-4 py-3 sm:px-5">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--sky-soft)] text-[#36499b]">
          {ehAcervo ? <Search aria-hidden className="h-4 w-4" /> : <PontosIA className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 id="ef-selecao-h" className="font-display text-base font-bold text-primary">
            {ehAcervo ? "Buscar no acervo" : "Escolha uma das quatro opções"}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {ehAcervo ? "Fotos da Digisystem. Clique para selecionar e confirme em “Usar esta imagem”." : "Geradas a partir do tema. Clique para comparar e confirme a escolhida."}
            {" "}Formato da arte: {ehStory ? "Story 9:16" : "Feed 4:5"}.
          </p>
        </div>
        <button type="button" onClick={onCancelar} aria-label="Cancelar a escolha" className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-primary hover:bg-secondary/70", FOCO)}>
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>

      {/* busca do acervo (topo) */}
      {ehAcervo && (
        <div className="shrink-0 space-y-2.5 border-b border-border px-4 py-3 sm:px-5">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (busca.trim()) onTermo(busca.trim());
            }}
            className="flex items-center gap-2 rounded-2xl border border-border bg-background py-1 pl-3 pr-1 focus-within:border-[#36499b] focus-within:ring-2 focus-within:ring-[#36499b]/20"
          >
            <Search aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar fotos no acervo"
              placeholder="Ex.: equipe, servidor, cidade"
              className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" disabled={!busca.trim()} className={cn("h-9 shrink-0 rounded-xl bg-[#36499b] px-4 font-display text-xs font-bold text-white disabled:opacity-50", FOCO)}>
              Buscar
            </button>
          </form>
          <div className="ef-sem-barra -mx-1 flex flex-nowrap gap-1.5 overflow-x-auto px-1 pb-0.5" role="group" aria-label="Termos sugeridos">
            {TERMOS_ACERVO.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={quadro.termo === t}
                onClick={() => onTermo(t)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 font-display text-[11px] font-bold transition-colors motion-reduce:transition-none",
                  FOCO,
                  quadro.termo === t ? "bg-[#ff6d2d] text-white" : "bg-secondary text-primary hover:bg-secondary/70",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* grade de escolha (rolagem própria) */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5" aria-busy={ehAcervo ? quadro.carregando : undefined}>
        {!ehAcervo ? (
          <div className={cn("mx-auto grid gap-3 sm:gap-4", ehStory ? "max-w-[880px] grid-cols-2 sm:grid-cols-4" : "grid-cols-2 lg:grid-cols-4")}>
            {[0, 1, 2, 3].map((i) => (
              <Miniatura
                key={i}
                cena={i}
                ratio={ratio}
                selecionada={sel === i}
                rotulo={`Opção ${i + 1}: ${NOMES_CENAS[i]}`}
                legenda={`${i + 1}. ${NOMES_CENAS[i]}`}
                atraso={i * 60}
                onSelecionar={() => onSelecionar(i)}
                onUsar={() => onConfirmar(i)}
              />
            ))}
          </div>
        ) : vazio ? (
          <div className="mx-auto flex max-w-sm flex-col items-center gap-2 py-10 text-center" role="status">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--sky-soft)] text-[#36499b]">
              <Search aria-hidden className="h-5 w-5" />
            </span>
            <p className="font-display text-sm font-bold text-primary">Nada no acervo para “{quadro.termo}”</p>
            <p className="text-xs text-muted-foreground">
              Tente um termo mais amplo, como “equipe” ou “dados”. Se mesmo assim não achar, a IA gera a imagem a partir do tema.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => onTermo("equipe")} className={cn("rounded-full bg-secondary px-3.5 py-1.5 font-display text-xs font-bold text-primary hover:bg-secondary/70", FOCO)}>
                Buscar “equipe”
              </button>
              <button type="button" onClick={onOutraFonte} className={cn("rounded-full bg-[#36499b] px-3.5 py-1.5 font-display text-xs font-bold text-white", FOCO)}>
                Escolher outra fonte
              </button>
            </div>
          </div>
        ) : (
          <div className={cn("grid gap-3", ehStory ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5")}>
            {carregandoInicial
              ? Array.from({ length: 10 }).map((_, i) => <div key={i} className="ef-shimmer w-full rounded-2xl" style={{ aspectRatio: ratio }} aria-hidden />)
              : Array.from({ length: totalAcervo }).map((_, i) => (
                  <Miniatura
                    key={i}
                    cena={cenaDoAcervo(i, quadro.termo)}
                    ratio={ratio}
                    selecionada={sel === i}
                    rotulo={`Foto ${i + 1} do acervo: ${NOMES_CENAS[cenaDoAcervo(i, quadro.termo)]}`}
                    atraso={Math.max(0, i - (totalAcervo - 10)) * 35}
                    onSelecionar={() => onSelecionar(i)}
                    onUsar={() => onConfirmar(i)}
                  />
                ))}
            {carregandoMais && Array.from({ length: 5 }).map((_, i) => <div key={`m${i}`} className="ef-shimmer w-full rounded-2xl" style={{ aspectRatio: ratio }} aria-hidden />)}
          </div>
        )}
      </div>

      {/* rodapé ancorado — posições fixas, larguras mínimas (rótulos que mudam não deslocam nada) */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border bg-card px-4 py-3 sm:px-5">
        <div className="flex items-center gap-1">
          <button type="button" onClick={onOutraFonte} className={cn("rounded-full px-3 py-2 font-display text-xs font-bold text-primary hover:bg-secondary", FOCO)}>
            Outra fonte
          </button>
          <button type="button" onClick={onCancelar} className={cn("rounded-full px-3 py-2 font-display text-xs font-bold text-muted-foreground hover:text-primary", FOCO)}>
            Cancelar
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {ehAcervo ? (
            <button
              type="button"
              onClick={onBuscarMais}
              disabled={quadro.carregando || vazio}
              className={cn("inline-flex min-w-[8.75rem] items-center justify-center gap-1.5 rounded-full bg-secondary px-4 py-2 font-display text-xs font-bold text-primary hover:bg-secondary/70 disabled:opacity-60", FOCO)}
            >
              {carregandoMais && <Spinner className="h-3.5 w-3.5" />}
              {carregandoMais ? "Buscando…" : "Buscar mais"}
            </button>
          ) : (
            <button type="button" onClick={onGerarDeNovo} className={cn("inline-flex min-w-[8.75rem] items-center justify-center rounded-full bg-secondary px-4 py-2 font-display text-xs font-bold text-primary hover:bg-secondary/70", FOCO)}>
              Gerar de novo
            </button>
          )}
          <button
            type="button"
            onClick={() => onConfirmar()}
            disabled={sel === null}
            className={cn(
              "inline-flex min-w-[10rem] items-center justify-center gap-1.5 rounded-full bg-[#ff6d2d] px-5 py-2 font-display text-xs font-bold text-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              FOCO,
            )}
          >
            <Check aria-hidden className="h-3.5 w-3.5" /> Usar esta imagem
          </button>
        </div>
      </div>
    </div>
  );
}
