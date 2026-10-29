/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: nenhum arquivo do real (o recorte não existe no app); diálogo no padrão de
 *   src/components/ui/dialog.tsx e drawer.tsx (shadcn) @ origin/main c16c790 / leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-perfil-e-foto-2026-10-27.md.
 *
 * Recorte em círculo feito à mão (sem dependência): arrastar com mouse ou um
 * dedo, pinça com dois dedos, roda do mouse, controle de zoom com − e +, e
 * teclado (setas, Shift+setas, + / −, 0). Diálogo no desktop, folha de baixo
 * abaixo de 640px. Foco preso, Esc cancela, foco volta para quem abriu.
 */
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus } from "lucide-react";
import {
  ZOOM_MAX,
  ZOOM_MIN,
  enquadramentoInicial,
  limitar,
  mover,
  tamanhoExibido,
  zoomEm,
  zoomPorExtenso,
  type Recorte,
} from "./recorte";

const FOCAVEIS = 'button:not([disabled]), input:not([disabled]), [tabindex="0"]';

export function RecorteFoto({
  imagem,
  onCancelar,
  onUsar,
}: {
  imagem: HTMLImageElement;
  onCancelar: () => void;
  onUsar: (r: Recorte) => void;
}) {
  const dim = { w: imagem.naturalWidth, h: imagem.naturalHeight };
  const [r, setR] = useState<Recorte>(enquadramentoInicial);
  const [diametro, setDiametro] = useState(288);
  const [anuncio, setAnuncio] = useState("");
  const area = useRef<HTMLDivElement>(null);
  const dialogo = useRef<HTMLDivElement>(null);
  const ponteiros = useRef(new Map<number, { x: number; y: number }>());
  const pinca = useRef<{ dist: number; zoom: number } | null>(null);
  const timerAnuncio = useRef<number | undefined>(undefined);
  const rRef = useRef(r);
  rRef.current = r;

  // Diâmetro do círculo = 90% da área (a área muda no celular).
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    const medir = () => setDiametro(el.clientWidth * 0.9);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Foco inicial na área; trava a rolagem do fundo enquanto aberto.
  useEffect(() => {
    area.current?.focus({ preventScroll: true });
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
      window.clearTimeout(timerAnuncio.current);
    };
  }, []);

  const anunciar = (texto: string) => {
    window.clearTimeout(timerAnuncio.current);
    timerAnuncio.current = window.setTimeout(() => setAnuncio(texto), 400);
  };

  const aplicar = (novo: Recorte, falar?: string) => {
    setR(novo);
    if (falar) anunciar(falar);
  };

  const textoPosicao = (n: Recorte) =>
    Math.abs(n.x) < 0.005 && Math.abs(n.y) < 0.005 ? "Foto no centro." : `Foto movida. Zoom ${zoomPorExtenso(n.zoom)} vezes.`;

  // ─── Teclado ─────────────────────────────────────────────────────────
  const teclaArea = (e: KeyboardEvent<HTMLDivElement>) => {
    const passo = (e.shiftKey ? 20 : 4) / diametro;
    let novo: Recorte | null = null;
    let falar = "";
    if (e.key === "ArrowLeft") novo = mover(dim, r, -passo, 0);
    else if (e.key === "ArrowRight") novo = mover(dim, r, passo, 0);
    else if (e.key === "ArrowUp") novo = mover(dim, r, 0, -passo);
    else if (e.key === "ArrowDown") novo = mover(dim, r, 0, passo);
    else if (e.key === "+" || e.key === "=") novo = zoomEm(dim, r, r.zoom + 0.1);
    else if (e.key === "-" || e.key === "_") novo = zoomEm(dim, r, r.zoom - 0.1);
    else if (e.key === "0") {
      novo = enquadramentoInicial();
      falar = "Enquadramento inicial. Foto no centro.";
    }
    if (!novo) return;
    e.preventDefault();
    if (!falar) falar = e.key.startsWith("Arrow") ? textoPosicao(novo) : `Zoom ${zoomPorExtenso(novo.zoom)} vezes.`;
    aplicar(novo, falar);
  };

  // Tab preso no diálogo; Esc cancela.
  const teclaDialogo = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancelar();
      return;
    }
    if (e.key !== "Tab" || !dialogo.current) return;
    const itens = [...dialogo.current.querySelectorAll<HTMLElement>(FOCAVEIS)];
    if (itens.length === 0) return;
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  };

  // ─── Ponteiro: arrastar (1) e pinça (2) ──────────────────────────────
  const centroRelativo = (cx: number, cy: number) => {
    const b = area.current!.getBoundingClientRect();
    return { x: (cx - (b.left + b.width / 2)) / diametro, y: (cy - (b.top + b.height / 2)) / diametro };
  };

  const desce = (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ponteiro sem captura possível (evento sintético): segue sem capturar.
    }
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ponteiros.current.size === 2) {
      const [a, b] = [...ponteiros.current.values()];
      pinca.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: rRef.current.zoom };
    }
  };

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const antes = ponteiros.current.get(e.pointerId);
    if (!antes) return;
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ponteiros.current.size >= 2 && pinca.current) {
      const [a, b] = [...ponteiros.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const meio = centroRelativo((a.x + b.x) / 2, (a.y + b.y) / 2);
      setR((atual) => zoomEm(dim, atual, (pinca.current!.zoom * dist) / pinca.current!.dist, meio.x, meio.y));
      return;
    }
    const dx = (e.clientX - antes.x) / diametro;
    const dy = (e.clientY - antes.y) / diametro;
    setR((atual) => mover(dim, atual, dx, dy));
  };

  const sobe = (e: PointerEvent<HTMLDivElement>) => {
    ponteiros.current.delete(e.pointerId);
    if (ponteiros.current.size < 2) pinca.current = null;
    if (ponteiros.current.size === 0) anunciar(textoPosicao(rRef.current));
  };

  // Roda do mouse (listener não passivo para impedir a rolagem da página).
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const roda = (e: WheelEvent) => {
      e.preventDefault();
      const p = centroRelativo(e.clientX, e.clientY);
      setR((atual) => zoomEm(dim, atual, atual.zoom + (e.deltaY < 0 ? 0.05 : -0.05), p.x, p.y));
    };
    el.addEventListener("wheel", roda, { passive: false });
    return () => el.removeEventListener("wheel", roda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diametro]);

  const t = tamanhoExibido(dim, r.zoom);
  const zoomBotao = (delta: number) => aplicar(zoomEm(dim, r, r.zoom + delta), `Zoom ${zoomPorExtenso(limitar(dim, { ...r, zoom: r.zoom + delta }).zoom)} vezes.`);

  // Portal no body: o cartão de identidade tem transform (animate-rise), que
  // viraria o "bloco de contenção" do position: fixed e prenderia o diálogo nele.
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" onKeyDown={teclaDialogo}>
      <div aria-hidden className="pf-veu-dialogo absolute inset-0 bg-[rgba(11,18,48,0.55)]" onClick={onCancelar} />
      <div
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recorte-titulo"
        aria-describedby="recorte-descricao"
        className="pf-dialogo relative flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-3xl bg-card px-4 pb-4 pt-5 text-card-foreground shadow-float sm:max-w-[440px] sm:rounded-3xl sm:p-6"
      >
        <span aria-hidden className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden" />
        <h2 id="recorte-titulo" className="font-display text-xl font-bold text-foreground">
          Ajustar a foto
        </h2>
        <p id="recorte-descricao" className="mt-1 text-sm text-muted-foreground">
          Arraste para posicionar e use o zoom para deixar o rosto dentro do círculo.
        </p>

        <div
          ref={area}
          tabIndex={0}
          role="group"
          aria-roledescription="recorte da foto"
          aria-label="Posição da foto. Use as setas para mover e mais ou menos para o zoom."
          data-testid="area-recorte"
          onKeyDown={teclaArea}
          onPointerDown={desce}
          onPointerMove={move}
          onPointerUp={sobe}
          onPointerCancel={sobe}
          className="relative mx-auto mt-5 aspect-square w-[min(340px,calc(100vw-32px))] cursor-grab touch-none select-none overflow-hidden rounded-3xl bg-muted outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring active:cursor-grabbing sm:w-[320px]"
        >
          <img
            src={imagem.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
            style={{
              width: t.w * diametro,
              height: t.h * diametro,
              transform: `translate(-50%, -50%) translate(${r.x * diametro}px, ${r.y * diametro}px)`,
            }}
          />
          {/* Máscara com o círculo vazado: fora dele a foto fica esmaecida. */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: diametro,
              height: diametro,
              boxShadow: "0 0 0 9999px color-mix(in oklab, var(--background) 70%, transparent)",
              outline: "2px solid var(--card)",
            }}
          />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => zoomBotao(-0.1)}
            disabled={r.zoom <= ZOOM_MIN}
            aria-label="Diminuir zoom"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-sky-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <div className="flex min-w-0 flex-1 flex-col">
            <label htmlFor="recorte-zoom" className="mb-1 font-display text-xs font-bold text-muted-foreground">
              Zoom
            </label>
            <input
              id="recorte-zoom"
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={0.01}
              value={r.zoom}
              aria-valuetext={`${zoomPorExtenso(r.zoom)} vezes`}
              onChange={(e) => aplicar(zoomEm(dim, r, Number(e.target.value)), `Zoom ${zoomPorExtenso(Number(e.target.value))} vezes.`)}
              className="h-11 w-full cursor-pointer accent-[var(--primary)]"
            />
          </div>
          <button
            type="button"
            onClick={() => zoomBotao(0.1)}
            disabled={r.zoom >= ZOOM_MAX}
            aria-label="Aumentar zoom"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-sky-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        <p className="mt-2 hidden text-xs text-muted-foreground sm:block">Teclado: setas movem, + e − ajustam o zoom, 0 volta ao início.</p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button
            type="button"
            onClick={onCancelar}
            className="h-12 rounded-full bg-secondary px-5 font-display text-sm font-bold text-secondary-foreground transition-colors hover:bg-sky-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-10 sm:text-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onUsar(r)}
            className="pf-botao-principal h-12 rounded-full px-5 font-display text-sm font-bold shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-10 sm:text-xs"
          >
            Usar esta foto
          </button>
        </div>

        <p aria-live="polite" className="sr-only">
          {anuncio}
        </p>
      </div>
    </div>,
    document.body,
  );
}
