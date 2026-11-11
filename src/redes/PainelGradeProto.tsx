/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/pages/resultados/Redes.tsx e rede/PaginaRede.tsx @ leitura 2026-11-11 (commit 83755ae).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 *
 * Grade com modo Reorganizar. A lógica de posição vem toda de ./nucleo/grade.ts (mover, redimensionar,
 * ocultar, restaurar, projetar, celulaDoPonteiro, tamanhoDoPonteiro). Aqui só há interação e visual.
 * Arrastar e redimensionar usam eventos de ponteiro direto (o protótipo dispensa o dnd-kit).
 */
import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent as PEvt } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, EyeOff, GripVertical, Minus, Plus, Eye } from "lucide-react";
import {
  ALTURA_LINHA_PX,
  GAP_PX,
  celulaDoPonteiro,
  mover,
  ocultar,
  projetar,
  redimensionar,
  restaurar,
  tamanhoDoPonteiro,
  type ArranjoGrade,
  type CatalogoGrade,
  type ColunasVisiveis,
  type GeometriaGrade,
  type ItemGrade,
} from "./nucleo/grade";

function colunasDaJanela(): ColunasVisiveis {
  const w = window.innerWidth;
  return w >= 1280 ? 4 : w >= 768 ? 2 : 1;
}

type Props = {
  arranjo: ArranjoGrade;
  catalogo: CatalogoGrade;
  onArranjo: (a: ArranjoGrade) => void;
  reorganizar: boolean;
  titulo: (id: string) => string;
  renderCard: (item: ItemGrade) => ReactNode;
};

type Arrasto = { id: string; ox: number; oy: number; dx: number; dy: number; alvo: { x: number; y: number }; w: number };
type Redim = {
  id: string;
  eixo: "w" | "h" | "wh";
  card: { esquerda: number; topo: number; x: number };
  alvo: { w: number; h: number };
};

const BTN =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground " +
  "hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:opacity-40 aria-disabled:hover:bg-card";

export function PainelGradeProto({ arranjo, catalogo, onArranjo, reorganizar, titulo, renderCard }: Props) {
  const [colunas, setColunas] = useState<ColunasVisiveis>(colunasDaJanela);
  const [arrasto, setArrasto] = useState<Arrasto | null>(null);
  const [redim, setRedim] = useState<Redim | null>(null);
  const [aviso, setAviso] = useState("");
  const gradeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aoRedimensionar = () => setColunas(colunasDaJanela());
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, []);

  // Esc cancela arrasto e redimensionamento em andamento.
  useEffect(() => {
    if (!arrasto && !redim) return;
    const aoTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setArrasto(null);
        setRedim(null);
        setAviso("Ação cancelada. O card voltou ao lugar.");
      }
    };
    window.addEventListener("keydown", aoTecla);
    return () => window.removeEventListener("keydown", aoTecla);
  }, [arrasto, redim]);

  const limitesDe = useCallback((id: string) => catalogo.find((c) => c.id === id)!.limites, [catalogo]);

  const itens = projetar(arranjo, colunas);
  const ordem = [...itens].sort((a, b) => a.y - b.y || a.x - b.x);

  function geometria(): GeometriaGrade {
    const r = gradeRef.current!.getBoundingClientRect();
    return {
      esquerda: r.left,
      topo: r.top,
      larguraColuna: (r.width - (colunas - 1) * GAP_PX) / colunas,
      alturaLinha: ALTURA_LINHA_PX,
      gap: GAP_PX,
    };
  }

  function aplicar(proximo: ArranjoGrade, mensagem: string, semMudanca = "Não é possível nessa direção.") {
    if (JSON.stringify(proximo) === JSON.stringify(arranjo)) {
      setAviso(semMudanca);
      return;
    }
    onArranjo(proximo);
    setAviso(mensagem);
  }

  function posicaoDe(a: ArranjoGrade, id: string) {
    const i = a.itens.find((x) => x.id === id)!;
    return `linha ${i.y + 1}, coluna ${i.x + 1}`;
  }

  /** Mover por seta. Em 4 colunas anda uma célula; em 2 e 1 troca de lugar na ordem de leitura. */
  function moverPorSeta(id: string, dir: "esq" | "dir" | "cima" | "baixo") {
    const atual = arranjo.itens.find((i) => i.id === id)!;
    let proximo: ArranjoGrade;
    if (colunas === 4) {
      const dx = dir === "esq" ? -1 : dir === "dir" ? 1 : 0;
      const dy = dir === "cima" ? -1 : dir === "baixo" ? 1 : 0;
      proximo = mover(arranjo, id, atual.x + dx, atual.y + dy, catalogo);
    } else {
      const k = ordem.findIndex((i) => i.id === id);
      const vizinho = ordem[dir === "esq" || dir === "cima" ? k - 1 : k + 1];
      if (!vizinho) {
        setAviso("Não é possível nessa direção.");
        return;
      }
      const v = arranjo.itens.find((i) => i.id === vizinho.id)!;
      proximo = mover(arranjo, id, v.x, v.y, catalogo);
    }
    aplicar(proximo, `Card ${titulo(id)} movido para a ${posicaoDe(proximo, id)}.`);
  }

  function tamanhoPorBotao(id: string, dw: number, dh: number) {
    const a = arranjo.itens.find((i) => i.id === id)!;
    const proximo = redimensionar(arranjo, id, a.w + dw, a.h + dh, catalogo);
    const n = proximo.itens.find((i) => i.id === id)!;
    aplicar(
      proximo,
      dw !== 0 ? `Largura do card ${titulo(id)}: ${n.w} de 4.` : `Altura do card ${titulo(id)}: ${n.h} de 3.`,
      dw !== 0 ? "A largura já está no limite." : "A altura já está no limite.",
    );
  }

  /* ----------------------------- arrastar (4 colunas) ----------------------------- */
  function iniciarArrasto(e: PEvt<HTMLElement>, item: ItemGrade) {
    if (colunas !== 4 || e.button !== 0) return;
    e.preventDefault(); // evita o início de seleção/arrasto nativo, que cancela o ponteiro
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrasto({ id: item.id, ox: e.clientX, oy: e.clientY, dx: 0, dy: 0, alvo: { x: item.x, y: item.y }, w: item.w });
  }
  function moverArrasto(e: PEvt<HTMLElement>, item: ItemGrade) {
    if (!arrasto || arrasto.id !== item.id) return;
    const dx = e.clientX - arrasto.ox;
    const dy = e.clientY - arrasto.oy;
    const g = geometria();
    const secao = e.currentTarget.closest("section")!.getBoundingClientRect();
    // secao já inclui o deslocamento atual; o canto original = secao − (dx, dy) anterior
    const esquerda = secao.left - arrasto.dx + dx;
    const topo = secao.top - arrasto.dy + dy;
    const alvo = celulaDoPonteiro(esquerda + (g.larguraColuna + g.gap) / 2, topo + (g.alturaLinha + g.gap) / 2, g, item.w);
    setArrasto({ ...arrasto, dx, dy, alvo });
  }
  function soltarArrasto(item: ItemGrade) {
    if (!arrasto || arrasto.id !== item.id) return;
    const { alvo } = arrasto;
    setArrasto(null);
    const proximo = mover(arranjo, item.id, alvo.x, alvo.y, catalogo);
    aplicar(proximo, `Card ${titulo(item.id)} movido para a ${posicaoDe(proximo, item.id)}.`, "O card ficou no mesmo lugar.");
  }

  /* --------------------------- redimensionar (4 colunas) --------------------------- */
  function iniciarRedim(e: PEvt<HTMLElement>, item: ItemGrade, eixo: Redim["eixo"]) {
    if (colunas !== 4 || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.closest("section")!.getBoundingClientRect();
    setRedim({ id: item.id, eixo, card: { esquerda: r.left, topo: r.top, x: item.x }, alvo: { w: item.w, h: item.h } });
  }
  function moverRedim(e: PEvt<HTMLElement>, item: ItemGrade) {
    if (!redim || redim.id !== item.id) return;
    const t = tamanhoDoPonteiro(e.clientX, e.clientY, geometria(), redim.card, limitesDe(item.id));
    setRedim({ ...redim, alvo: { w: redim.eixo === "h" ? item.w : t.w, h: redim.eixo === "w" ? item.h : t.h } });
  }
  function soltarRedim(item: ItemGrade) {
    if (!redim || redim.id !== item.id) return;
    const { alvo } = redim;
    setRedim(null);
    const proximo = redimensionar(arranjo, item.id, alvo.w, alvo.h, catalogo);
    aplicar(proximo, `Card ${titulo(item.id)} agora com ${alvo.w} de 4 colunas e ${alvo.h} de 3 linhas.`, "O tamanho não mudou.");
  }

  function retanguloGhost(x: number, y: number, w: number, h: number) {
    const g = gradeRef.current;
    if (!g) return null;
    const col = (g.clientWidth - 3 * GAP_PX) / 4;
    return {
      left: x * (col + GAP_PX),
      top: y * (ALTURA_LINHA_PX + GAP_PX),
      width: w * col + (w - 1) * GAP_PX,
      height: h * ALTURA_LINHA_PX + (h - 1) * GAP_PX,
    };
  }
  const ghost = arrasto
    ? (() => {
        const i = arranjo.itens.find((x) => x.id === arrasto.id)!;
        return retanguloGhost(arrasto.alvo.x, arrasto.alvo.y, i.w, i.h);
      })()
    : redim
      ? (() => {
          const i = arranjo.itens.find((x) => x.id === redim.id)!;
          return retanguloGhost(i.x, i.y, redim.alvo.w, redim.alvo.h);
        })()
      : null;

  return (
    <div>
      <div
        ref={gradeRef}
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`,
          // 4 e 2 colunas: linhas de altura fixa (o tamanho salvo vale). 1 coluna: a altura do salvo vira MÍNIMA
          // e o card cresce com o conteúdo, para nada rolar dentro do card no celular (medição 10.4).
          gridAutoRows: colunas === 1 ? "auto" : `${ALTURA_LINHA_PX}px`,
          gap: GAP_PX,
        }}
      >
        {ordem.map((item) => {
          const original = arranjo.itens.find((i) => i.id === item.id)!;
          const arrastando = arrasto?.id === item.id;
          const lim = limitesDe(item.id);
          return (
            <section
              key={item.id}
              aria-label={titulo(item.id)}
              data-card={item.id}
              className={`relative flex min-h-0 min-w-0 flex-col rounded-3xl border bg-card shadow-card transition-[box-shadow,opacity] duration-150 motion-reduce:transition-none ${
                reorganizar ? "border-dashed border-primary/45" : "border-border"
              } ${arrastando ? "z-30 opacity-90 shadow-float" : ""}`}
              style={{
                gridColumn: `${item.x + 1} / span ${item.w}`,
                gridRow: colunas === 1 ? `${ordem.indexOf(item) + 1}` : `${item.y + 1} / span ${item.h}`,
                minHeight: colunas === 1 ? item.h * ALTURA_LINHA_PX + (item.h - 1) * GAP_PX : undefined,
                transform: arrastando ? `translate(${arrasto!.dx}px, ${arrasto!.dy}px)` : undefined,
              }}
            >
              <header className="flex min-h-12 items-center justify-between gap-2 px-5 pt-4">
                <h3 className="min-w-0 truncate font-display text-lg font-bold leading-none text-foreground">{titulo(item.id)}</h3>
                {reorganizar ? (
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {original.w}×{original.h}
                  </span>
                ) : null}
              </header>
              <div className="min-h-0 min-w-0 flex-1 overflow-auto px-5 pb-4 pt-2">{renderCard(item)}</div>

              {reorganizar ? (
                <>
                  <div
                    role="toolbar"
                    aria-label={`Reorganizar ${titulo(item.id)}`}
                    className="absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-float backdrop-blur"
                  >
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Arrastar ${titulo(item.id)}. Use as setas do teclado para mover.`}
                      className={`${BTN} ${colunas === 4 ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-default"}`}
                      onPointerDown={(e) => iniciarArrasto(e, original)}
                      onPointerMove={(e) => moverArrasto(e, original)}
                      onPointerUp={() => soltarArrasto(original)}
                      onPointerCancel={() => setArrasto(null)}
                      onKeyDown={(e) => {
                        const mapa: Record<string, "esq" | "dir" | "cima" | "baixo"> = {
                          ArrowLeft: "esq",
                          ArrowRight: "dir",
                          ArrowUp: "cima",
                          ArrowDown: "baixo",
                        };
                        if (mapa[e.key]) {
                          e.preventDefault();
                          moverPorSeta(item.id, mapa[e.key]);
                        }
                      }}
                    >
                      <GripVertical className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <BotaoIcone rotulo={`Mover ${titulo(item.id)} para cima`} onClick={() => moverPorSeta(item.id, "cima")}>
                      <ArrowUp className="h-4 w-4" />
                    </BotaoIcone>
                    <BotaoIcone rotulo={`Mover ${titulo(item.id)} para baixo`} onClick={() => moverPorSeta(item.id, "baixo")}>
                      <ArrowDown className="h-4 w-4" />
                    </BotaoIcone>
                    <BotaoIcone rotulo={`Mover ${titulo(item.id)} para a esquerda`} onClick={() => moverPorSeta(item.id, "esq")}>
                      <ArrowLeft className="h-4 w-4" />
                    </BotaoIcone>
                    <BotaoIcone rotulo={`Mover ${titulo(item.id)} para a direita`} onClick={() => moverPorSeta(item.id, "dir")}>
                      <ArrowRight className="h-4 w-4" />
                    </BotaoIcone>
                    <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
                    {colunas !== 1 ? (
                      <>
                        <BotaoIcone
                          rotulo={`Diminuir largura de ${titulo(item.id)}`}
                          desativado={original.w <= lim.min.w}
                          onClick={() => tamanhoPorBotao(item.id, -1, 0)}
                        >
                          <span className="flex items-center text-[10px] font-bold">
                            <Minus className="h-3 w-3" />L
                          </span>
                        </BotaoIcone>
                        <BotaoIcone
                          rotulo={`Aumentar largura de ${titulo(item.id)}`}
                          desativado={original.w >= lim.max.w}
                          onClick={() => tamanhoPorBotao(item.id, 1, 0)}
                        >
                          <span className="flex items-center text-[10px] font-bold">
                            <Plus className="h-3 w-3" />L
                          </span>
                        </BotaoIcone>
                      </>
                    ) : null}
                    <BotaoIcone
                      rotulo={`Diminuir altura de ${titulo(item.id)}`}
                      desativado={original.h <= lim.min.h}
                      onClick={() => tamanhoPorBotao(item.id, 0, -1)}
                    >
                      <span className="flex items-center text-[10px] font-bold">
                        <Minus className="h-3 w-3" />A
                      </span>
                    </BotaoIcone>
                    <BotaoIcone
                      rotulo={`Aumentar altura de ${titulo(item.id)}`}
                      desativado={original.h >= lim.max.h}
                      onClick={() => tamanhoPorBotao(item.id, 0, 1)}
                    >
                      <span className="flex items-center text-[10px] font-bold">
                        <Plus className="h-3 w-3" />A
                      </span>
                    </BotaoIcone>
                    <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
                    <BotaoIcone
                      rotulo={`Ocultar ${titulo(item.id)}`}
                      onClick={() => {
                        onArranjo(ocultar(arranjo, item.id, catalogo));
                        setAviso(`Card ${titulo(item.id)} ocultado. Ele está na gaveta de cards ocultos.`);
                      }}
                    >
                      <EyeOff className="h-4 w-4" />
                    </BotaoIcone>
                  </div>

                  {colunas === 4 ? (
                    <>
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label={`Largura de ${titulo(item.id)}`}
                        aria-orientation="horizontal"
                        aria-valuemin={lim.min.w}
                        aria-valuemax={Math.min(lim.max.w, 4 - original.x)}
                        aria-valuenow={original.w}
                        aria-valuetext={`${original.w} de 4`}
                        className="absolute right-[-7px] top-1/2 z-20 h-12 w-3.5 -translate-y-1/2 cursor-ew-resize touch-none rounded-full border border-primary/60 bg-card shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onPointerDown={(e) => iniciarRedim(e, original, "w")}
                        onPointerMove={(e) => moverRedim(e, original)}
                        onPointerUp={() => soltarRedim(original)}
                        onPointerCancel={() => setRedim(null)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowRight") tamanhoPorBotao(item.id, 1, 0);
                          else if (e.key === "ArrowLeft") tamanhoPorBotao(item.id, -1, 0);
                          else return;
                          e.preventDefault();
                        }}
                      />
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label={`Altura de ${titulo(item.id)}`}
                        aria-orientation="vertical"
                        aria-valuemin={lim.min.h}
                        aria-valuemax={lim.max.h}
                        aria-valuenow={original.h}
                        aria-valuetext={`${original.h} de 3`}
                        className="absolute bottom-[-7px] left-1/2 z-20 h-3.5 w-12 -translate-x-1/2 cursor-ns-resize touch-none rounded-full border border-primary/60 bg-card shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onPointerDown={(e) => iniciarRedim(e, original, "h")}
                        onPointerMove={(e) => moverRedim(e, original)}
                        onPointerUp={() => soltarRedim(original)}
                        onPointerCancel={() => setRedim(null)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") tamanhoPorBotao(item.id, 0, 1);
                          else if (e.key === "ArrowUp") tamanhoPorBotao(item.id, 0, -1);
                          else return;
                          e.preventDefault();
                        }}
                      />
                      <div
                        aria-hidden="true"
                        className="absolute bottom-[-6px] right-[-6px] z-20 h-4 w-4 cursor-nwse-resize touch-none rounded-full border border-primary/60 bg-primary"
                        onPointerDown={(e) => iniciarRedim(e, original, "wh")}
                        onPointerMove={(e) => moverRedim(e, original)}
                        onPointerUp={() => soltarRedim(original)}
                        onPointerCancel={() => setRedim(null)}
                      />
                    </>
                  ) : null}
                </>
              ) : null}
            </section>
          );
        })}

        {ghost ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-3xl border-2 border-dashed border-primary bg-primary/5"
            style={ghost}
          />
        ) : null}
      </div>

      {/* Gaveta: abaixo da grade, só aparece com a grade em modo Reorganizar; não empurra controles do cabeçalho */}
      {reorganizar ? (
        <div className="mt-5 rounded-3xl border border-dashed border-border bg-card/60 p-4" aria-label="Cards ocultos">
          <h3 className="font-display text-base font-bold">Cards ocultos</h3>
          {arranjo.ocultos.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">Nenhum card oculto. Use o botão de olho cortado em um card para guardá-lo aqui.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {arranjo.ocultos.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => {
                      onArranjo(restaurar(arranjo, o.id, catalogo));
                      setAviso(`Card ${titulo(o.id)} restaurado.`);
                    }}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Restaurar {titulo(o.id)}
                    <span className="text-xs font-normal text-muted-foreground">
                      {o.w}×{o.h}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div role="status" aria-live="polite" className="sr-only">
        {aviso}
      </div>
    </div>
  );
}

function BotaoIcone({
  rotulo,
  onClick,
  children,
  desativado = false,
}: {
  rotulo: string;
  onClick: () => void;
  children: ReactNode;
  desativado?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      aria-disabled={desativado || undefined}
      className={BTN}
      onClick={() => {
        if (!desativado) onClick();
      }}
    >
      {children}
    </button>
  );
}
