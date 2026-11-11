/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/pages/resultados/Redes.tsx e rede/PaginaRede.tsx @ leitura 2026-11-11 (commit 83755ae).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 *
 * Gráficos em SVG simples (o protótipo não tem recharts e não instala dependência nova).
 * Cada gráfico mede o próprio contêiner, então acompanha o redimensionamento do card.
 */
import { useEffect, useRef, useState, type RefObject } from "react";
import type { EstiloSerie, MarcadorSerie } from "./nucleo/estilo-series";
import type { PontoSerie } from "./mock";

export function useTamanho(ref: RefObject<HTMLElement | null>): { w: number; h: number } {
  const [t, setT] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setT({ w: Math.round(el.clientWidth), h: Math.round(el.clientHeight) });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return t;
}

export const fmt = (n: number | null | undefined, casas = 0): string =>
  n === null || n === undefined || !Number.isFinite(n)
    ? "Sem dado"
    : n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

export const fmtCompacto = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : String(Math.round(n));

function Marcador({ forma, x, y, cor }: { forma: MarcadorSerie; x: number; y: number; cor: string }) {
  const s = 4.5;
  const estilo = { fill: "var(--card)", stroke: cor, strokeWidth: 2 } as const;
  switch (forma) {
    case "circulo":
      return <circle cx={x} cy={y} r={s} style={estilo} />;
    case "quadrado":
      return <rect x={x - s} y={y - s} width={s * 2} height={s * 2} style={estilo} />;
    case "triangulo":
      return <polygon points={`${x},${y - s - 1} ${x + s + 1},${y + s} ${x - s - 1},${y + s}`} style={estilo} />;
    case "losango":
      return <polygon points={`${x},${y - s - 1} ${x + s + 1},${y} ${x},${y + s + 1} ${x - s - 1},${y}`} style={estilo} />;
  }
}

/** Amostra da legenda: o mesmo traçado e marcador da linha. */
export function AmostraSerie({ estilo, apagada = false }: { estilo: EstiloSerie; apagada?: boolean }) {
  return (
    <svg width="34" height="12" aria-hidden="true" className={apagada ? "opacity-50" : ""}>
      <line
        x1="1"
        y1="6"
        x2="33"
        y2="6"
        strokeWidth="2"
        strokeDasharray={estilo.tracejado || undefined}
        style={{ stroke: estilo.cor }}
      />
      <Marcador forma={estilo.marcador} x={17} y={6} cor={estilo.cor} />
    </svg>
  );
}

export type SerieGrafico = {
  chave: string;
  rotulo: string;
  cor: string;
  tracejado: string;
  marcador: MarcadorSerie | null;
  pontos: PontoSerie[];
};

/** Gráfico de linhas multi-série, com leitura por ponteiro e por teclado (setas). */
export function GraficoLinhas({ series, rotuloEixo }: { series: SerieGrafico[]; rotuloEixo: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const { w, h } = useTamanho(caixa);
  const [indice, setIndice] = useState<number | null>(null);

  const n = series[0]?.pontos.length ?? 0;
  const margem = { t: 14, r: 12, b: 24, l: 44 };
  const iw = Math.max(10, w - margem.l - margem.r);
  const ih = Math.max(10, h - margem.t - margem.b);
  const maximo = Math.max(1, ...series.flatMap((s) => s.pontos.map((p) => p.valor)));
  const teto = Math.ceil((maximo * 1.1) / 500) * 500 || 500;
  const px = (i: number) => margem.l + (n <= 1 ? 0 : (i / (n - 1)) * iw);
  const py = (v: number) => margem.t + ih - (v / teto) * ih;
  const passoMarcador = Math.max(1, Math.round(n / 6));
  const rotulosX = Array.from({ length: 5 }, (_, k) => Math.round((k * (n - 1)) / 4));

  function achar(clientX: number) {
    const r = caixa.current?.getBoundingClientRect();
    if (!r || n < 2) return;
    const rel = (clientX - r.left - margem.l) / iw;
    setIndice(Math.min(n - 1, Math.max(0, Math.round(rel * (n - 1)))));
  }

  const ativo = indice !== null ? indice : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Leitura: altura fixa para não deslocar o gráfico */}
      <p className="min-h-5 truncate text-xs text-muted-foreground" aria-live="polite">
        {ativo !== null
          ? `${series[0].pontos[ativo].dia}: ` +
            series.map((s) => `${s.rotulo} ${fmt(s.pontos[ativo].valor)}`).join(" · ")
          : rotuloEixo}
      </p>
      <div
        ref={caixa}
        tabIndex={0}
        role="img"
        aria-label={`Gráfico de linhas: ${rotuloEixo}. Use as setas para ler os valores dia a dia.`}
        className="relative min-h-0 flex-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onPointerMove={(e) => achar(e.clientX)}
        onPointerLeave={() => setIndice(null)}
        onBlur={() => setIndice(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setIndice((i) => Math.min(n - 1, (i ?? -1) + 1));
          else if (e.key === "ArrowLeft") setIndice((i) => Math.max(0, (i ?? n) - 1));
          else if (e.key === "Escape") setIndice(null);
          else return;
          e.preventDefault();
        }}
      >
        {w > 0 && h > 0 && n > 0 ? (
          <svg width={w} height={h} className="absolute inset-0" aria-hidden="true">
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <g key={f}>
                <line x1={margem.l} x2={margem.l + iw} y1={py(teto * f)} y2={py(teto * f)} style={{ stroke: "var(--border)" }} strokeWidth="1" />
                <text x={margem.l - 6} y={py(teto * f) + 3} textAnchor="end" fontSize="10" style={{ fill: "var(--muted-foreground)" }}>
                  {fmtCompacto(teto * f)}
                </text>
              </g>
            ))}
            {rotulosX.map((i, k) => (
              <text
                key={k}
                x={px(i)}
                y={h - 6}
                textAnchor={k === 0 ? "start" : k === rotulosX.length - 1 ? "end" : "middle"}
                fontSize="10"
                style={{ fill: "var(--muted-foreground)" }}
              >
                {series[0].pontos[i].dia}
              </text>
            ))}
            {series.map((s) => (
              <g key={s.chave}>
                <polyline
                  fill="none"
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={s.tracejado || undefined}
                  points={s.pontos.map((p, i) => `${px(i)},${py(p.valor)}`).join(" ")}
                  style={{ stroke: s.cor }}
                />
                {s.marcador &&
                  s.pontos.map((p, i) =>
                    i % passoMarcador === 0 || i === ativo ? (
                      <Marcador key={i} forma={s.marcador!} x={px(i)} y={py(p.valor)} cor={s.cor} />
                    ) : null,
                  )}
              </g>
            ))}
            {ativo !== null && (
              <line x1={px(ativo)} x2={px(ativo)} y1={margem.t} y2={margem.t + ih} strokeDasharray="3 3" style={{ stroke: "var(--muted-foreground)" }} />
            )}
          </svg>
        ) : null}
      </div>
    </div>
  );
}

/** Mini linha sem eixos, para o resumo por rede. */
export function Sparkline({ pontos, cor, rotulo }: { pontos: PontoSerie[]; cor: string; rotulo: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const { w, h } = useTamanho(caixa);
  const max = Math.max(1, ...pontos.map((p) => p.valor));
  const min = Math.min(...pontos.map((p) => p.valor));
  const pad = 3;
  const pts = pontos
    .map((p, i) => {
      const x = pad + (i / Math.max(1, pontos.length - 1)) * Math.max(1, w - pad * 2);
      const y = pad + (1 - (p.valor - min) / Math.max(1, max - min)) * Math.max(1, h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div ref={caixa} className="h-full min-h-0 w-full" role="img" aria-label={rotulo}>
      {w > 0 && h > 0 ? (
        <svg width={w} height={h} aria-hidden="true">
          <polyline points={pts} fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: cor }} />
        </svg>
      ) : null}
    </div>
  );
}

/** Barra horizontal com valor em texto (nunca só cor). */
export function BarraH({ rotulo, valorTexto, pct, destaque = false }: { rotulo: string; valorTexto: string; pct: number; destaque?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="min-w-0 truncate">{rotulo}</span>
        <span className="shrink-0 font-semibold tabular-nums">{valorTexto}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(2, Math.min(100, pct))}%`, background: destaque ? "var(--accent)" : "var(--primary)" }}
        />
      </div>
    </div>
  );
}
