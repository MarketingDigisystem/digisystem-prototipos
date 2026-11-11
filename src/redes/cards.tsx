/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/pages/resultados/Redes.tsx e rede/PaginaRede.tsx @ leitura 2026-11-11 (commit 83755ae).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 *
 * Conteúdo dos cards das duas visões. Dados fictícios (./mock). Os cards respondem ao próprio
 * tamanho por container queries (@lg, @3xl) e pela altura em linhas (`h`), porque o usuário pode
 * redimensioná-los livremente.
 */
import { useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Facebook, Info, Instagram, Linkedin, TriangleAlert, Youtube } from "lucide-react";
import type { SocialProvider } from "./nucleo/tipos-proto";
import { alertaMenosRedes, consolidar, type ConsolidadoRedes, type EntradaRede, type MotivoExclusao } from "./nucleo/consolidado";
import { TABELA_COMPARABILIDADE, type MetricaComparavel } from "./nucleo/comparabilidade";
import { textoAjuda } from "./nucleo/consolidado";
import { textosDoEstado, type EstadoRede } from "./nucleo/estado-rede";
import { estilosDasSeries, estiloDaSerie } from "./nucleo/estilo-series";
import { AmostraSerie, BarraH, GraficoLinhas, Sparkline, fmt, type SerieGrafico } from "./graficos";
import { ImagemMarca } from "./ImagemMarca";
import {
  DIAS_SEMANA,
  FAIXAS_HORA,
  FORMATOS_LINKEDIN,
  FREQUENCIA_LINKEDIN,
  METAS_LINKEDIN,
  MOMENTO_LINKEDIN,
  POSTS_LINKEDIN,
  PUBLICO_LINKEDIN,
  REDES,
  ROTULO_REDE,
  VARIACAO_LINKEDIN,
  kpisDaRede,
  serieCliquesLinkedin,
  serieDaRede,
  type FasePagina,
  type PeriodoDias,
} from "./mock";

export type ContextoCards = {
  dias: PeriodoDias;
  entradas: EntradaRede[];
  abrirRede: (r: SocialProvider) => void;
  fase: FasePagina;
  tentarDeNovo: () => void;
};

const ICONE_REDE: Record<SocialProvider, typeof Linkedin> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

const estadoDe = (ctx: ContextoCards, r: SocialProvider): EstadoRede => ctx.entradas.find((e) => e.rede === r)!.estado;

/* ------------------------------ peças comuns ------------------------------ */

function Variacao({ v, unidade = "%" }: { v: number | undefined; unidade?: string }) {
  if (v === undefined) return null;
  const sobe = v >= 0;
  const Seta = sobe ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums text-foreground">
      <Seta className="h-3.5 w-3.5" style={{ color: sobe ? "var(--success)" : "var(--destructive)" }} aria-hidden="true" />
      <span className="sr-only">{sobe ? "Alta de " : "Queda de "}</span>
      {sobe ? "+" : "−"}
      {fmt(Math.abs(v), 1)}
      {unidade}
    </span>
  );
}

/** Estado sem número: nunca inventa valor. */
function EstadoVazio({ estado, rede }: { estado: EstadoRede; rede: SocialProvider }) {
  const [titulo, ...resto] = textosDoEstado(estado, true);
  const Icone = ICONE_REDE[rede];
  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-2">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
          <Icone className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="font-display text-xl font-bold leading-none">{titulo}</span>
      </div>
      {resto.map((t) => (
        <p key={t} className="text-sm text-muted-foreground">
          {t}
        </p>
      ))}
    </div>
  );
}

/** Carregando: blocos discretos no lugar do conteúdo (Req. 12.3). Pulso só com movimento permitido. */
function Esqueleto({ h }: { h: number }) {
  const barra = "rounded-xl bg-secondary motion-safe:animate-pulse";
  return (
    <div className="flex h-full min-h-0 flex-col gap-3" aria-busy="true">
      <div className="flex items-center gap-3">
        <div className={`${barra} h-8 w-8 shrink-0 rounded-full`} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={`${barra} h-3 w-2/5`} />
          <div className={`${barra} h-5 w-3/5`} />
        </div>
      </div>
      <div className={`${barra} min-h-8 flex-1`} />
      {h >= 2 ? <div className={`${barra} h-3 w-4/5 shrink-0`} /> : null}
    </div>
  );
}

/** Erro: mensagem curta e nova tentativa, sem inventar número (Req. 12.3, 12.8). */
function ErroCard({ ctx, h }: { ctx: ContextoCards; h: number }) {
  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-2">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary" style={{ color: "var(--destructive)" }}>
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="font-display text-xl font-bold leading-none">Não foi possível carregar</span>
      </div>
      {h >= 2 ? <p className="text-sm text-muted-foreground">Os dados desta área não chegaram. Os outros cards seguem no lugar.</p> : null}
      <button
        type="button"
        onClick={ctx.tentarDeNovo}
        className="inline-flex min-h-11 w-fit items-center rounded-full border border-border px-4 text-sm font-semibold hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Tentar de novo
      </button>
    </div>
  );
}

function Rotulo({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>;
}

/* ============================== VISÃO TODAS ============================== */

const METRICAS_ROTULO: Record<MetricaComparavel, string> = {
  impressoes: "Impressões",
  alcance: "Alcance",
  cliques: "Cliques",
  seguidoresTotais: "Seguidores",
  taxaEngajamento: "Taxa de engajamento",
  ctr: "CTR",
};
const METRICAS_ORDEM: MetricaComparavel[] = ["impressoes", "alcance", "cliques", "seguidoresTotais", "taxaEngajamento", "ctr"];
const MOTIVO_TEXTO: Record<MotivoExclusao, string> = {
  nao_conectada: "não conectada",
  sem_dados_no_periodo: "sem dados no período",
  em_breve: "em breve",
  metrica_ausente: "sem esta métrica",
};

function CardConsolidado({ ctx, h }: { ctx: ContextoCards; h: number }) {
  const c: ConsolidadoRedes = consolidar(ctx.entradas);
  const alerta = alertaMenosRedes(ctx.entradas, c);
  const inc = c.impressoes.incluidas;
  const exc = c.impressoes.excluidas;
  const total = ctx.entradas.length;
  const tilesCompactos = h < 2;
  return (
    <div className="@container flex h-full min-h-0 flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 @lg:grid-cols-3 @3xl:grid-cols-6">
        {METRICAS_ORDEM.map((m) => {
          const eh = m === "taxaEngajamento" || m === "ctr";
          const valor = c[m].valor;
          const rotuloExtra = TABELA_COMPARABILIDADE[m].rotulo;
          return (
            <div key={m} className="min-w-0 rounded-2xl bg-secondary/60 p-3" title={textoAjuda(m)}>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="truncate">{METRICAS_ROTULO[m]}</span>
                <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="sr-only">{textoAjuda(m)}</span>
              </p>
              <p className="mt-1 font-display text-2xl font-bold leading-none tabular-nums">
                {valor === null ? "Sem dado" : eh ? `${fmt(valor, 2)}%` : fmt(valor)}
              </p>
              {!tilesCompactos ? (
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                  {c[m].incluidas.length} de {total} redes
                  {rotuloExtra ? ` · ${rotuloExtra}` : ""}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {alerta ? (
        <div
          role="note"
          className="flex items-start gap-2 rounded-2xl border border-warning/50 bg-warning-soft px-3 py-2 text-sm text-foreground"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{alerta}</span>
        </div>
      ) : null}

      {h >= 2 ? (
        <div className="grid gap-2 text-sm @lg:grid-cols-2">
          <div>
            <Rotulo>Entraram no consolidado</Rotulo>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {inc.length === 0 ? <li className="text-muted-foreground">Nenhuma rede.</li> : null}
              {inc.map((r) => (
                <li key={r} className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  {ROTULO_REDE[r]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Rotulo>Ficaram de fora</Rotulo>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {exc.length === 0 ? <li className="text-muted-foreground">Nenhuma.</li> : null}
              {exc.map((e) => (
                <li key={e.rede} className="rounded-full border border-border px-2.5 py-1 text-xs">
                  <span className="font-semibold">{ROTULO_REDE[e.rede]}</span> · {MOTIVO_TEXTO[e.motivo]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Entraram {inc.length} de {total} redes. Aumente o card para ver quais ficaram de fora.
        </p>
      )}
    </div>
  );
}

function CardEvolucaoRedes({ ctx }: { ctx: ContextoCards }) {
  const comDados = REDES.filter((r) => estadoDe(ctx, r).tipo === "ok");
  const series: SerieGrafico[] = estilosDasSeries(comDados).map((e) => ({
    chave: e.rede,
    rotulo: e.rotulo,
    cor: e.cor,
    tracejado: e.tracejado,
    marcador: e.marcador,
    pontos: serieDaRede(e.rede, ctx.dias),
  }));
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="min-h-0 flex-1">
        {series.length === 0 ? (
          <p className="grid h-full place-items-center rounded-2xl bg-secondary/60 px-4 text-center text-sm text-muted-foreground">
            Nenhuma rede com dados no período. O gráfico aparece quando houver a primeira sincronização.
          </p>
        ) : (
          <GraficoLinhas series={series} rotuloEixo={`Impressões por dia, últimos ${ctx.dias} dias`} />
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Legenda do gráfico">
        {REDES.map((r) => {
          const e = estadoDe(ctx, r);
          const ok = e.tipo === "ok";
          return (
            <li key={r} className={`flex items-center gap-1.5 ${ok ? "text-foreground" : "text-muted-foreground"}`}>
              <AmostraSerie estilo={estiloDaSerie(r)} apagada={!ok} />
              <span className="font-semibold">{ROTULO_REDE[r]}</span>
              {!ok ? <span>· {textosDoEstado(e)[0].toLowerCase()}</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CardResumoRede({ ctx, rede, h }: { ctx: ContextoCards; rede: SocialProvider; h: number }) {
  const estado = estadoDe(ctx, rede);
  const Icone = ICONE_REDE[rede];
  if (estado.tipo !== "ok") {
    return (
      <div className="flex h-full min-h-0 flex-col justify-between gap-2">
        <EstadoVazio estado={estado} rede={rede} />
        <BotaoVerRede ctx={ctx} rede={rede} />
      </div>
    );
  }
  const k = kpisDaRede(rede, ctx.dias);
  const serie = serieDaRede(rede, ctx.dias);
  const estilo = estiloDaSerie(rede);
  return (
    <div className="@container flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Icone className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Impressões nos últimos {ctx.dias} dias</p>
          <p className="font-display text-2xl font-bold leading-none tabular-nums">{fmt(k.impressoes)}</p>
        </div>
        <span className="ml-auto shrink-0">
          <Variacao v={rede === "linkedin" ? VARIACAO_LINKEDIN.impressoes : undefined} />
        </span>
      </div>
      {h >= 2 ? (
        <div className="min-h-[3.5rem] flex-1">
          <Sparkline pontos={serie} cor={estilo.cor} rotulo={`Impressões diárias de ${ROTULO_REDE[rede]}`} />
        </div>
      ) : null}
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Seguidores</dt>
          <dd className="font-semibold tabular-nums">{fmt(k.seguidoresTotais)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Engajamento</dt>
          <dd className="font-semibold tabular-nums">{fmt(k.taxaEngajamento, 2)}%</dd>
        </div>
      </dl>
      <BotaoVerRede ctx={ctx} rede={rede} />
    </div>
  );
}

function BotaoVerRede({ ctx, rede }: { ctx: ContextoCards; rede: SocialProvider }) {
  return (
    <button
      type="button"
      onClick={() => ctx.abrirRede(rede)}
      className="inline-flex min-h-11 w-full items-center justify-between rounded-full border border-border px-4 text-sm font-semibold hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Ver {ROTULO_REDE[rede]}
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

/* ============================== VISÃO REDE ============================== */

function CardKpis({ ctx, rede, h }: { ctx: ContextoCards; rede: SocialProvider; h: number }) {
  const k = kpisDaRede(rede, ctx.dias);
  const itens: { rot: string; val: string; v?: number; un?: string }[] = [
    { rot: "Impressões", val: fmt(k.impressoes), v: VARIACAO_LINKEDIN.impressoes },
    { rot: "Alcance", val: fmt(k.alcance), v: VARIACAO_LINKEDIN.alcance },
    { rot: "Cliques", val: fmt(k.cliques), v: VARIACAO_LINKEDIN.cliques },
    { rot: "Taxa de engajamento", val: `${fmt(k.taxaEngajamento, 2)}%`, v: VARIACAO_LINKEDIN.taxaEngajamento, un: " p.p." },
    { rot: "CTR", val: `${fmt(k.ctr, 2)}%`, v: VARIACAO_LINKEDIN.ctr, un: " p.p." },
    { rot: "Seguidores", val: fmt(k.seguidoresTotais), v: VARIACAO_LINKEDIN.seguidoresTotais },
  ];
  return (
    <div className="@container h-full min-h-0">
      <div className="grid grid-cols-2 gap-3 @lg:grid-cols-3 @3xl:grid-cols-6">
        {itens.map((i) => (
          <div key={i.rot} className="min-w-0 rounded-2xl bg-secondary/60 p-3">
            <p className="truncate text-xs text-muted-foreground">{i.rot}</p>
            <p className="mt-1 font-display text-2xl font-bold leading-none tabular-nums">{i.val}</p>
            {h >= 2 ? (
              <p className="mt-1.5">
                <Variacao v={i.v} unidade={i.un ?? "%"} />
                <span className="ml-1 text-[11px] text-muted-foreground">contra o período anterior</span>
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function CardEvolucaoRede({ ctx, rede }: { ctx: ContextoCards; rede: SocialProvider }) {
  const [metrica, setMetrica] = useState<"impressoes" | "cliques">("impressoes");
  const estilo = estiloDaSerie(rede);
  const atual = metrica === "impressoes" ? serieDaRede(rede, ctx.dias) : serieCliquesLinkedin(ctx.dias);
  const anterior = metrica === "impressoes" ? serieDaRede(rede, ctx.dias, -ctx.dias) : serieCliquesLinkedin(ctx.dias, -ctx.dias);
  const series: SerieGrafico[] = [
    { chave: "atual", rotulo: "Período atual", cor: estilo.cor, tracejado: "", marcador: estilo.marcador, pontos: atual },
    { chave: "anterior", rotulo: "Período anterior", cor: "var(--muted-foreground)", tracejado: "5 4", marcador: null, pontos: anterior },
  ];
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div role="group" aria-label="Métrica do gráfico" className="inline-flex w-fit gap-1 rounded-full border border-border bg-secondary/60 p-1">
        {(["impressoes", "cliques"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={metrica === m}
            onClick={() => setMetrica(m)}
            className={`min-h-9 rounded-full px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              metrica === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {m === "impressoes" ? "Impressões" : "Cliques"}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <GraficoLinhas series={series} rotuloEixo={`${metrica === "impressoes" ? "Impressões" : "Cliques"} por dia, últimos ${ctx.dias} dias`} />
      </div>
    </div>
  );
}

function CardRanking() {
  return (
    <ol className="space-y-3">
      {POSTS_LINKEDIN.map((p, i) => (
        <li key={p.titulo} className="flex items-center gap-3">
          <span className="w-4 shrink-0 text-center text-sm font-bold text-muted-foreground tabular-nums">{i + 1}</span>
          <ImagemMarca src={p.imagem} alt={`Miniatura do post: ${p.titulo}`} className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold leading-snug">{p.titulo}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {p.formato} · {p.data}
            </p>
          </div>
          <div className="shrink-0 text-right text-xs">
            <p className="font-semibold tabular-nums">{fmt(p.impressoes)}</p>
            <p className="text-muted-foreground tabular-nums">{fmt(p.eng, 1)}% eng.</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CardFormatos() {
  const max = Math.max(...FORMATOS_LINKEDIN.map((f) => f.eng));
  const melhor = FORMATOS_LINKEDIN.reduce((a, b) => (b.eng > a.eng ? b : a));
  return (
    <div className="space-y-3">
      {FORMATOS_LINKEDIN.map((f) => (
        <BarraH
          key={f.formato}
          rotulo={`${f.formato} · ${f.posts} posts`}
          valorTexto={`${fmt(f.eng, 1)}%`}
          pct={(f.eng / max) * 100}
          destaque={f.formato === melhor.formato}
        />
      ))}
      <p className="text-xs text-muted-foreground">Engajamento médio por post. Em laranja, o formato que mais engaja.</p>
    </div>
  );
}

function CardMomento() {
  const todos = MOMENTO_LINKEDIN.flat();
  const max = Math.max(...todos);
  let melhor = { l: 0, c: 0 };
  MOMENTO_LINKEDIN.forEach((linha, l) => linha.forEach((v, c) => v === max && (melhor = { l, c })));
  return (
    <div className="@container space-y-2">
      <p className="text-sm">
        Melhor momento: <strong>terça-feira, {FAIXAS_HORA[melhor.l]}</strong>, com {fmt(max, 1)}% de engajamento.
      </p>
      <div role="table" aria-label="Engajamento por dia e faixa de horário" className="grid gap-1" style={{ gridTemplateColumns: "auto repeat(7, minmax(0, 1fr))" }}>
        <span />
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="text-center text-[11px] text-muted-foreground">
            {d}
          </span>
        ))}
        {MOMENTO_LINKEDIN.map((linha, l) => (
          <div key={l} className="contents">
            <span className="pr-1 text-right text-[11px] text-muted-foreground">{FAIXAS_HORA[l]}</span>
            {linha.map((v, c) => {
              const eh = l === melhor.l && c === melhor.c;
              return (
                <span
                  key={c}
                  title={`${DIAS_SEMANA[c]}, ${FAIXAS_HORA[l]}: ${fmt(v, 1)}%`}
                  className={`grid h-7 place-items-center rounded-md text-[10px] font-semibold tabular-nums ${eh ? "ring-2 ring-accent" : ""}`}
                  style={{
                    background: `color-mix(in oklab, var(--primary) ${Math.round((v / max) * 85) + 6}%, var(--card))`,
                    color: v / max > 0.45 ? "var(--primary-foreground)" : "var(--foreground)",
                  }}
                >
                  {fmt(v, 1)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function CardFrequencia() {
  const max = Math.max(...FREQUENCIA_LINKEDIN.map((s) => s.posts));
  const media = FREQUENCIA_LINKEDIN.reduce((a, s) => a + s.posts, 0) / FREQUENCIA_LINKEDIN.length;
  return (
    <div className="space-y-3">
      <p className="text-sm">
        Média de <strong>{fmt(media, 1)} posts por semana</strong> nas últimas 5 semanas.
      </p>
      <div className="flex h-24 items-end gap-2" role="img" aria-label={`Posts por semana: ${FREQUENCIA_LINKEDIN.map((s) => `${s.semana}, ${s.posts}`).join("; ")}`}>
        {FREQUENCIA_LINKEDIN.map((s) => (
          <div key={s.semana} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-xs font-semibold tabular-nums">{s.posts}</span>
            <div className="w-full rounded-t-lg bg-primary" style={{ height: `${(s.posts / max) * 56 + 6}px` }} />
            <span className="text-[10px] text-muted-foreground">{s.semana}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardMetas() {
  return (
    <ul className="space-y-4">
      {METAS_LINKEDIN.map((m) => {
        const pct = Math.min(100, Math.round((m.atual / m.meta) * 100));
        const atual = m.unidade ? fmt(m.atual, 2) : fmt(m.atual);
        const meta = m.unidade ? fmt(m.meta, 2) : fmt(m.meta);
        return (
          <li key={m.nome}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">{m.nome}</span>
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {atual}
                {m.unidade} de {meta}
                {m.unidade} · {pct}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={m.nome}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-secondary"
            >
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? "var(--success)" : "var(--accent)" }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CardPublico() {
  return (
    <div className="@container">
      <div className="grid gap-5 @lg:grid-cols-2 @4xl:grid-cols-4">
        {PUBLICO_LINKEDIN.map((f) => (
          <section key={f.faceta} className="min-w-0 space-y-2.5">
            <Rotulo>{f.faceta}</Rotulo>
            {f.itens.map((i) => (
              <BarraH key={i.nome} rotulo={i.nome} valorTexto={`${i.pct}%`} pct={i.pct * 2.6} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

/* ============================== roteador ============================== */

export function ConteudoCard({ visao, id, h, ctx }: { visao: "todas" | SocialProvider; id: string; h: number; ctx: ContextoCards }) {
  if (ctx.fase === "carregando") return <Esqueleto h={h} />;
  if (ctx.fase === "erro") return <ErroCard ctx={ctx} h={h} />;
  if (visao === "todas") {
    if (id === "consolidado") return <CardConsolidado ctx={ctx} h={h} />;
    if (id === "evolucao-redes") return <CardEvolucaoRedes ctx={ctx} />;
    const rede = id.replace("resumo-", "") as SocialProvider;
    return <CardResumoRede ctx={ctx} rede={rede} h={h} />;
  }
  const estado = estadoDe(ctx, visao);
  if (estado.tipo !== "ok") return <EstadoVazio estado={estado} rede={visao} />;
  switch (id) {
    case "kpis":
      return <CardKpis ctx={ctx} rede={visao} h={h} />;
    case "evolucao":
      return <CardEvolucaoRede ctx={ctx} rede={visao} />;
    case "ranking":
      return <CardRanking />;
    case "formatos":
      return <CardFormatos />;
    case "momento":
      return <CardMomento />;
    case "frequencia":
      return <CardFrequencia />;
    case "metas":
      return <CardMetas />;
    case "publico":
      return <CardPublico />;
    default:
      return null;
  }
}
