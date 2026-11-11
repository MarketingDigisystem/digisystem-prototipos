// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/components/estudio/ArteStep.tsx e ArteAjustePanel.tsx (controles reais da arte),
//   src/lib/composicao-types.ts (ComposicaoInput), src/lib/estudio-fonts.ts @ leitura 2026-10 (clone
//   mhdgst-trabalho, somente leitura). Fonte da verdade = clone real.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md (rodadas 4 e 5)
//
// "Personalizar em detalhe" — DESVIO OPCIONAL (não é um passo). Gaveta lateral com scroll próprio,
// cabeçalho e rodapé ancorados, largura alternável (normal ↔ larga, âncora fixa à direita do cabeçalho) e
// prévia ao vivo apartada. Edição por prancheta SÓ no carrossel. Paridade dos controles do ArteStep.
// RISCO (do pacote, rodada 5): o ComposicaoInput leva TODOS estes campos; esconder na UI não pode virar
// "não enviar" no app real.
// Refino pós-feedback 2: exportar SVG, carregamento IA, acervo, seleção larga, botões de continuidade,
//   parecer, sem ícone de rede (2026-11-04). Aqui: bloco Exportar sem PNG; SVG é a exportação principal;
//   no carrossel, “Baixar .zip” (todas as pranchetas em SVG) + “Imagem combinada” como secundária.
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, FileArchive, Images, Maximize2, Minimize2, Minus, Plus, X, Download,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { ArteCanvas } from "./ArteCanvas";
import { type Ajustes, type Estilo, type Formato, type Slide, ESTUDIO_FONTES, slideNovo } from "./efData";
import { ColorHex, FOCO, PillPar, Slider, Spinner } from "./ui";

function Secao({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold text-primary">{titulo}</h3>
        {acao}
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function SeletorFonte({ rotulo, valor, onChange }: { rotulo: string; valor: string; onChange: (v: string) => void }) {
  return (
    <label className="block min-w-0">
      <span className="font-display text-[11px] font-bold text-primary">{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: `'${valor}', sans-serif` }}
        className={cn("mt-1 h-9 w-full rounded-xl border border-border bg-card px-2.5 text-sm text-foreground", FOCO)}
      >
        {ESTUDIO_FONTES.map((f) => (
          <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>
            {f}
          </option>
        ))}
        <option value="Open Sans" style={{ fontFamily: "'Open Sans', sans-serif" }}>Open Sans</option>
      </select>
    </label>
  );
}

function Grade3x3({ valor, onChange, rotulo }: { valor: number; onChange: (v: number) => void; rotulo: string }) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="grid w-24 grid-cols-3 gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={valor === i}
          aria-label={`${rotulo} ${i + 1}`}
          onClick={() => onChange(i)}
          className={cn("h-7 rounded-lg transition-colors motion-reduce:transition-none", FOCO, valor === i ? "bg-[#ff6d2d]" : "bg-secondary hover:bg-[#67cfee]/40")}
        />
      ))}
    </div>
  );
}

export function BotaoExportar({
  icone,
  rotulo,
  onClick,
  principal,
  className,
}: {
  icone: ReactNode;
  rotulo: string;
  onClick?: () => void;
  /** exportação principal (SVG): contorno navy, mais presença que as secundárias */
  principal?: boolean;
  className?: string;
}) {
  const [estado, setEstado] = useState<"idle" | "carregando" | "ok">("idle");
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return (
    <button
      type="button"
      disabled={estado === "carregando"}
      onClick={() => {
        onClick?.();
        setEstado("carregando");
        t.current = window.setTimeout(() => {
          setEstado("ok");
          t.current = window.setTimeout(() => setEstado("idle"), 1800);
        }, 1200);
      }}
      aria-live="polite"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 font-display text-xs font-bold text-primary transition-colors disabled:opacity-70 motion-reduce:transition-none",
        principal ? "border-2 border-[#36499b]/40 bg-card hover:border-[#36499b] hover:bg-[var(--navy-soft)]" : "bg-secondary hover:bg-secondary/70",
        FOCO,
        className,
      )}
    >
      {estado === "carregando" ? <Spinner /> : estado === "ok" ? <Check aria-hidden className="h-4 w-4 text-[var(--success)]" /> : icone}
      {estado === "ok" ? "Baixado" : rotulo}
    </button>
  );
}

export function Gaveta({
  aberto,
  onFechar,
  onConcluir,
  estilo,
  formato,
  slides,
  indice,
  setIndice,
  aj,
  setAj,
  patchSlide,
  setSlides,
}: {
  aberto: boolean;
  onFechar: () => void;
  onConcluir: () => void;
  estilo: Estilo;
  formato: Formato;
  slides: Slide[];
  indice: number;
  setIndice: (i: number) => void;
  aj: Ajustes;
  setAj: (p: Partial<Ajustes>) => void;
  patchSlide: (i: number, p: Partial<Slide>) => void;
  setSlides: (s: Slide[]) => void;
}) {
  const [larga, setLarga] = useState(false);
  const painel = useRef<HTMLDivElement>(null);
  const slide = slides[Math.min(indice, slides.length - 1)];
  const ehC = estilo === "C";

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    painel.current?.focus();
    return () => document.removeEventListener("keydown", esc);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const mover = (dx: number, dy: number, fino: boolean) => {
    const passo = fino ? 0.5 : 2;
    setAj({
      logoX: Math.max(0, Math.min(88, +(aj.logoX + dx * passo).toFixed(1))),
      logoY: Math.max(0, Math.min(90, +(aj.logoY + dy * passo).toFixed(1))),
    });
  };

  const presetsLogo: [string, number, number][] = [
    ["↖", 4, 4], ["↑", 38, 4], ["↗", 70, 4],
    ["←", 4, 48], ["•", 38, 48], ["→", 70, 48],
    ["↙", 4, 84], ["↓", 38, 84], ["↘", 70, 84],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" aria-label="Fechar a personalização" tabIndex={-1} onClick={onFechar} className="ef-fade absolute inset-0 bg-[#1f2a44]/45" />
      <div
        ref={painel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Personalizar a arte em detalhe"
        className={cn(
          "ef-gaveta relative flex h-full w-full flex-col bg-background shadow-[var(--shadow-float)] outline-none transition-[max-width] duration-300 motion-reduce:transition-none",
          larga ? "max-w-full" : "max-w-[540px]",
        )}
      >
        {/* cabeçalho ancorado */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold text-primary">Personalizar em detalhe</p>
            <p className="truncate text-[11px] text-muted-foreground">Opcional · as mudanças aparecem na prévia ao vivo</p>
          </div>
          <button
            type="button"
            onClick={() => setLarga((v) => !v)}
            aria-pressed={larga}
            aria-label={larga ? "Voltar à gaveta lateral" : "Expandir para a tela inteira"}
            title={larga ? "Voltar à gaveta" : "Tela inteira"}
            className={cn("hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-primary hover:bg-secondary/70 md:grid", FOCO)}
          >
            {larga ? <Minimize2 aria-hidden className="h-4 w-4" /> : <Maximize2 aria-hidden className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onFechar} aria-label="Fechar" className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-primary hover:bg-secondary/70", FOCO)}>
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* prévia ao vivo apartada */}
          <div
            className={cn(
              "shrink-0 border-b border-border bg-[var(--sky-soft)] p-3 md:border-b-0 md:border-l md:order-2 md:overflow-y-auto",
              larga ? "md:w-[46%] md:flex md:flex-col md:justify-center" : "md:hidden",
            )}
          >
            <div className="mx-auto flex max-h-[32dvh] justify-center md:max-h-none">
              <div className={cn("w-full", formato === "story" && !ehC ? "max-w-[210px]" : "max-w-[300px] md:max-w-[520px]")}>
                <ArteCanvas estilo={estilo} formato={formato} slide={slide} indice={indice} total={slides.length} aj={aj} className="block h-auto w-full rounded-xl shadow-[var(--shadow-card)]" />
              </div>
            </div>
            <p className="mt-2 text-center font-display text-[11px] font-bold uppercase tracking-wider text-primary">
              Prévia ao vivo{ehC ? ` · prancheta ${indice + 1} de ${slides.length}` : ""}
            </p>
          </div>

          {/* controles */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 md:order-1">
            {/* por prancheta — só no carrossel */}
            {ehC && (
              <Secao
                titulo="Por prancheta"
                acao={
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Remover prancheta"
                      disabled={slides.length <= 2}
                      onClick={() => {
                        const n = slides.filter((_, i) => i !== indice);
                        setSlides(n);
                        setIndice(Math.max(0, indice - 1));
                      }}
                      className={cn("grid h-7 w-7 place-items-center rounded-full bg-secondary text-primary disabled:opacity-40", FOCO)}
                    >
                      <Minus aria-hidden className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-12 text-center font-display text-xs font-bold text-primary">{slides.length} de 8</span>
                    <button
                      type="button"
                      aria-label="Adicionar prancheta"
                      disabled={slides.length >= 8}
                      onClick={() => {
                        const n = [...slides];
                        n.splice(slides.length - 1, 0, slideNovo("miolo", { titulo: "Novo ponto", subtitulo: "Explique em uma frase", etiqueta: `Passo ${slides.length - 1}` }));
                        setSlides(n);
                        setIndice(slides.length - 1);
                      }}
                      className={cn("grid h-7 w-7 place-items-center rounded-full bg-secondary text-primary disabled:opacity-40", FOCO)}
                    >
                      <Plus aria-hidden className="h-3.5 w-3.5" />
                    </button>
                  </div>
                }
              >
                <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Pranchetas">
                  {slides.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === indice}
                      onClick={() => setIndice(i)}
                      className={cn("rounded-full px-3 py-1 font-display text-xs font-bold", FOCO, i === indice ? "bg-[#ff6d2d] text-white" : "bg-secondary text-primary")}
                    >
                      {i + 1} · {s.papel === "capa" ? "Capa" : s.papel === "cta" ? "CTA" : "Miolo"}
                    </button>
                  ))}
                </div>
                {slide.papel !== "capa" && <ColorHex rotulo="Cor de fundo da prancheta" valor={slide.bg} onChange={(v) => patchSlide(indice, { bg: v })} />}
                {slide.img !== null && (
                  <div>
                    <span className="font-display text-[11px] font-bold text-primary">Foco da imagem</span>
                    <div className="mt-1"><Grade3x3 rotulo="Foco" valor={slide.foco} onChange={(v) => patchSlide(indice, { foco: v })} /></div>
                  </div>
                )}
                {slide.papel === "cta" && (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="font-display text-[11px] font-bold text-primary">Texto do botão (CTA)</span>
                      <input
                        value={slide.ctaTexto}
                        onChange={(e) => patchSlide(indice, { ctaTexto: e.target.value })}
                        className={cn("mt-1 h-9 w-full rounded-xl border border-border bg-card px-3 text-sm", FOCO)}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <ColorHex rotulo="Fundo do botão" valor={slide.ctaBg} onChange={(v) => patchSlide(indice, { ctaBg: v })} />
                      <ColorHex rotulo="Texto do botão" valor={slide.ctaFg} onChange={(v) => patchSlide(indice, { ctaFg: v })} />
                    </div>
                  </div>
                )}
              </Secao>
            )}

            {/* tipografia */}
            <Secao titulo="Tipografia e cores">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SeletorFonte rotulo="Fonte do título" valor={aj.fonteTitulo} onChange={(v) => setAj({ fonteTitulo: v })} />
                <SeletorFonte rotulo="Fonte do subtítulo" valor={aj.fonteSub} onChange={(v) => setAj({ fonteSub: v })} />
                <Slider rotulo="Tamanho do título" valor={aj.tamTitulo} min={56} max={140} onChange={(v) => setAj({ tamTitulo: v })} sufixo=" px" />
                <Slider rotulo="Tamanho do subtítulo" valor={aj.tamSub} min={26} max={72} onChange={(v) => setAj({ tamSub: v })} sufixo=" px" />
                <ColorHex rotulo="Cor do título" valor={aj.corTitulo} onChange={(v) => setAj({ corTitulo: v })} />
                <ColorHex rotulo="Cor do subtítulo" valor={aj.corSub} onChange={(v) => setAj({ corSub: v })} />
              </div>
              {estilo !== "C" && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-xs font-bold text-primary">Título acima do subtítulo</span>
                  <PillPar rotulo="Título acima" valor={aj.tituloAcima ? "sim" : "nao"} onChange={(v) => setAj({ tituloAcima: v === "sim" })} opcoes={[{ id: "sim", label: "Sim" }, { id: "nao", label: "Não" }]} />
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-xs font-bold text-primary">Destaque atrás do subtítulo</span>
                <PillPar rotulo="Destaque" valor={aj.destaque ? "sim" : "nao"} onChange={(v) => setAj({ destaque: v === "sim" })} opcoes={[{ id: "sim", label: "Ligado" }, { id: "nao", label: "Desligado" }]} />
              </div>
              {aj.destaque && <ColorHex rotulo="Cor do destaque" valor={aj.destaqueCor} onChange={(v) => setAj({ destaqueCor: v })} />}
            </Secao>

            {/* posição do texto */}
            {estilo === "A" && (
              <Secao
                titulo="Posição do texto"
                acao={<PillPar rotulo="Modo" valor={aj.posModo} onChange={(v) => setAj({ posModo: v })} opcoes={[{ id: "basico", label: "Básico" }, { id: "avancado", label: "Avançado" }]} />}
              >
                {aj.posModo === "basico" ? (
                  <PillPar rotulo="Posição vertical" valor={aj.posPreset} onChange={(v) => setAj({ posPreset: v })} opcoes={[{ id: "topo", label: "Topo" }, { id: "centro", label: "Centro" }, { id: "rodape", label: "Rodapé" }]} />
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Slider rotulo="X" valor={aj.posX} min={0} max={30} onChange={(v) => setAj({ posX: v })} sufixo="%" />
                    <Slider rotulo="Y" valor={aj.posY} min={0} max={100} onChange={(v) => setAj({ posY: v })} sufixo="%" />
                    <Slider rotulo="Largura" valor={aj.posL} min={40} max={92} onChange={(v) => setAj({ posL: v })} sufixo="%" />
                  </div>
                )}
              </Secao>
            )}

            {/* degradê */}
            {estilo !== "B" && (
              <Secao titulo="Degradê sobre a imagem">
                <div className="flex flex-wrap items-center gap-2">
                  {([["up", ArrowUp, "De baixo para cima"], ["down", ArrowDown, "De cima para baixo"], ["right", ArrowRight, "Da esquerda para a direita"], ["diag", ArrowLeft, "Diagonal"]] as const).map(([id, Ic, nome]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={aj.degDir === id}
                      aria-label={nome}
                      title={nome}
                      onClick={() => setAj({ degDir: id })}
                      className={cn("grid h-9 w-9 place-items-center rounded-xl", FOCO, aj.degDir === id ? "bg-[#ff6d2d] text-white" : "bg-secondary text-primary")}
                    >
                      <Ic aria-hidden className={cn("h-4 w-4", id === "diag" && "-rotate-[135deg]")} />
                    </button>
                  ))}
                </div>
                <Slider rotulo="Intensidade" valor={aj.degInt} min={0} max={100} onChange={(v) => setAj({ degInt: v })} sufixo="%" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-xs font-bold text-primary">Cores</span>
                  <PillPar rotulo="Cores do degradê" valor={aj.degMarca ? "marca" : "livre"} onChange={(v) => setAj({ degMarca: v === "marca" })} opcoes={[{ id: "marca", label: "Cor da marca" }, { id: "livre", label: "Personalizar" }]} />
                </div>
                {!aj.degMarca && (
                  <div className="grid grid-cols-2 gap-3">
                    <ColorHex rotulo="Cor inicial" valor={aj.degIni} onChange={(v) => setAj({ degIni: v })} />
                    <ColorHex rotulo="Cor final" valor={aj.degFim} onChange={(v) => setAj({ degFim: v })} />
                  </div>
                )}
              </Secao>
            )}

            {/* logo */}
            <Secao titulo="Logo">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-xs font-bold text-primary">Versão do Brand Kit</span>
                <PillPar rotulo="Versão do logo" valor={aj.logoSel} onChange={(v) => setAj({ logoSel: v })} opcoes={[{ id: "branco", label: "Branco" }, { id: "principal", label: "Principal" }, { id: "icone", label: "Ícone" }]} />
              </div>
              <div className="flex flex-wrap items-start gap-5">
                <div>
                  <span className="font-display text-[11px] font-bold text-primary">Posição</span>
                  <div className="mt-1 grid w-24 grid-cols-3 gap-1" role="group" aria-label="Posições do logo">
                    {presetsLogo.map(([s, x, y]) => (
                      <button key={s} type="button" aria-label={`Logo ${s}`} onClick={() => setAj({ logoX: x, logoY: y })} className={cn("h-7 rounded-lg bg-secondary font-display text-xs font-bold text-primary hover:bg-[#67cfee]/40", FOCO)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-display text-[11px] font-bold text-primary">Mover logo · Shift = fino</span>
                  <div className="mt-1 grid w-24 grid-cols-3 gap-1" role="group" aria-label="Mover o logo">
                    <span />
                    <button type="button" aria-label="Mover para cima" onClick={(e) => mover(0, -1, e.shiftKey)} className={cn("grid h-7 place-items-center rounded-lg bg-secondary text-primary", FOCO)}><ArrowUp aria-hidden className="h-3.5 w-3.5" /></button>
                    <span />
                    <button type="button" aria-label="Mover para a esquerda" onClick={(e) => mover(-1, 0, e.shiftKey)} className={cn("grid h-7 place-items-center rounded-lg bg-secondary text-primary", FOCO)}><ArrowLeft aria-hidden className="h-3.5 w-3.5" /></button>
                    <span className="grid h-7 place-items-center font-mono text-[9px] text-muted-foreground">{Math.round(aj.logoX)},{Math.round(aj.logoY)}</span>
                    <button type="button" aria-label="Mover para a direita" onClick={(e) => mover(1, 0, e.shiftKey)} className={cn("grid h-7 place-items-center rounded-lg bg-secondary text-primary", FOCO)}><ArrowRight aria-hidden className="h-3.5 w-3.5" /></button>
                    <span />
                    <button type="button" aria-label="Mover para baixo" onClick={(e) => mover(0, 1, e.shiftKey)} className={cn("grid h-7 place-items-center rounded-lg bg-secondary text-primary", FOCO)}><ArrowDown aria-hidden className="h-3.5 w-3.5" /></button>
                    <span />
                  </div>
                </div>
                <div>
                  <span className="font-display text-[11px] font-bold text-primary">Tamanho</span>
                  <div className="mt-1">
                    <PillPar rotulo="Tamanho do logo" valor={aj.logoTam} onChange={(v) => setAj({ logoTam: v })} opcoes={[{ id: "P", label: "P" }, { id: "M", label: "M" }, { id: "G", label: "G" }]} />
                  </div>
                </div>
              </div>
              {ehC && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-xs font-bold text-primary">Exibir logo no carrossel</span>
                  <PillPar rotulo="Exibir logo no carrossel" valor={aj.logoCarrossel ? "sim" : "nao"} onChange={(v) => setAj({ logoCarrossel: v === "sim" })} opcoes={[{ id: "sim", label: "Em todas" }, { id: "nao", label: "Só na capa" }]} />
                </div>
              )}
            </Secao>

            {/* exportar */}
            <Secao titulo="Exportar">
              <div className="flex flex-wrap gap-2">
                <BotaoExportar principal className="min-w-[8.5rem]" icone={<Download aria-hidden className="h-4 w-4" />} rotulo="Exportar SVG" />
                {ehC && <BotaoExportar className="min-w-[8rem]" icone={<FileArchive aria-hidden className="h-4 w-4" />} rotulo="Baixar .zip" />}
                {ehC && <BotaoExportar className="min-w-[10rem]" icone={<Images aria-hidden className="h-4 w-4" />} rotulo="Imagem combinada" />}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {ehC ? "O SVG baixa a prancheta em foco. O .zip traz todas as pranchetas em SVG." : "A arte sai em SVG, com os textos editáveis."}
              </p>
            </Secao>
          </div>
        </div>

        {/* rodapé ancorado */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-card px-5 py-3">
          <button type="button" onClick={onFechar} className={cn("rounded-full px-4 py-2 font-display text-xs font-bold text-muted-foreground hover:text-primary", FOCO)}>
            Voltar ao conteúdo
          </button>
          <button type="button" onClick={onConcluir} className={cn("rounded-full bg-[#ff6d2d] px-5 py-2 font-display text-xs font-bold text-white transition-transform hover:-translate-y-0.5 motion-reduce:transition-none", FOCO)}>
            Concluir e revisar
          </button>
        </div>
      </div>
    </div>
  );
}

