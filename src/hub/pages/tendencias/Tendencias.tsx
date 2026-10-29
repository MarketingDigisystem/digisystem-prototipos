/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/tendencias.tsx, src/components/trends/TrendDetailSheet.tsx,
 *   src/hooks/use-trends.ts, src/lib/trend-platform.ts @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Tendências → Tendências (proposta 2.7): o radar do marketing, não uma lista
 * de sugestões.
 *  1. Destaque editorial no topo: a tendência de maior potencial ainda não
 *     aproveitada (regras.ts → tendenciaDestaque), com o que está acontecendo,
 *     por que importa para a Digisystem, segmento, formato, Criar post e Criar card.
 *  2. Abaixo, as outras, agrupadas por potencial, em lista (sai a grade de cards
 *     iguais do real), com filtro por estado, segmento e formato.
 *  3. Estado derivado do que o time fez (Nova / Em produção / Aproveitada ·
 *     N posts publicados / Descartada com motivo). Descartadas só no filtro próprio.
 *  4. Cada linha diz o que o time já fez; o painel lista os cards e posts ligados.
 *  - ?trend=<id> abre o painel (é para onde o post e o card apontam).
 *  - A "Pesquisa personalizada" do real fica fora desta tela inicial.
 *  - "N concorrentes falando disso" (2.7 item 5) é fase 2: não entra.
 */
import { useMemo, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { ChipEstadoTendencia, ChipPlataforma, ChipPotencial, formatoLegivel } from "../../components/TendenciaChips";
import {
  CriarCardTendencia,
  CriarPostTendencia,
  TendenciaDetalhe,
  tituloCardTendencia,
} from "../../components/TendenciaDetalhe";
import { hrefDe, navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { ddmm, diaDe, plural, type SituacaoTendencia } from "../../store/regras";
import type { EstadoTendencia, Potencial, Tendencia } from "../../store/tipos";

type FiltroEstado = "todas" | EstadoTendencia;

const POTENCIAIS: Potencial[] = ["Alto", "Médio", "Baixo"];
const ORDEM_ESTADO: Record<EstadoTendencia, number> = { nova: 0, em_producao: 1, aproveitada: 2, descartada: 3 };
const FILTROS: { id: FiltroEstado; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "nova", label: "Novas" },
  { id: "em_producao", label: "Em produção" },
  { id: "aproveitada", label: "Aproveitadas" },
  { id: "descartada", label: "Descartadas" },
];

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

/** Dias inteiros entre dois dias YYYY-MM-DD. */
function diasEntre(de: string, ate: string): number {
  const [a1, m1, d1] = de.split("-").map(Number);
  const [a2, m2, d2] = ate.split("-").map(Number);
  return Math.round((new Date(a2, m2 - 1, d2).getTime() - new Date(a1, m1 - 1, d1).getTime()) / 86_400_000);
}

function haQuantoTempo(criadoEm: string, hoje: string): string {
  const n = diasEntre(diaDe(criadoEm), hoje);
  if (n <= 0) return "hoje";
  if (n === 1) return "ontem";
  return `há ${n} dias`;
}

export function Tendencias({ rota }: { rota: Rota }) {
  const { dados, hoje, sel } = useHub();
  const [estado, setEstado] = useState<FiltroEstado>("todas");
  const [segmento, setSegmento] = useState("todos");
  const [formato, setFormato] = useState("todos");
  /** Confirmação da última ação feita no destaque (ele troca de tendência logo depois). */
  const [ultimaAcao, setUltimaAcao] = useState<{ texto: string; href: string; link: string } | null>(null);
  const aberta = rota.params.trend;

  const situacoes = useMemo(
    () => new Map(dados.tendencias.map((t) => [t.id, sel.situacaoTendencia(t)] as const)),
    [dados.tendencias, sel],
  );
  const sit = (t: Tendencia) => situacoes.get(t.id) as SituacaoTendencia;
  const destaque = sel.tendenciaDestaque();

  const contagem = (e: EstadoTendencia) => dados.tendencias.filter((t) => sit(t).estado === e).length;
  const contagens: Record<FiltroEstado, number> = {
    todas: dados.tendencias.length - contagem("descartada"),
    nova: contagem("nova"),
    em_producao: contagem("em_producao"),
    aproveitada: contagem("aproveitada"),
    descartada: contagem("descartada"),
  };

  const segmentos = [...new Set(dados.tendencias.map((t) => t.segmento).filter(Boolean))].sort();
  const formatos = [...new Set(dados.tendencias.map((t) => t.formato).filter(Boolean))].sort();

  const visiveis = dados.tendencias
    .filter((t) => {
      const e = sit(t).estado;
      if (estado === "todas" ? e === "descartada" : e !== estado) return false;
      if (segmento !== "todos" && t.segmento !== segmento) return false;
      if (formato !== "todos" && t.formato !== formato) return false;
      return true;
    })
    .sort((a, b) => ORDEM_ESTADO[sit(a).estado] - ORDEM_ESTADO[sit(b).estado] || b.criadoEm.localeCompare(a.criadoEm));
  const filtrando = estado !== "todas" || segmento !== "todos" || formato !== "todos";

  const abrir = (t: Tendencia) => navegar("tendencias", "tendencias", { trend: t.id });
  const fechar = () => navegar("tendencias", "tendencias");
  const limpar = () => {
    setEstado("todas");
    setSegmento("todos");
    setFormato("todos");
  };

  // Frase de resumo no topo (no lugar de contadores em grade).
  const aproveitadas = dados.tendencias.filter((t) => sit(t).estado === "aproveitada");
  const publicadosAproveitados = aproveitadas.reduce((n, t) => n + sit(t).postsPublicados, 0);
  const partes = [
    contagens.nova && `${plural(contagens.nova, "ainda não foi aproveitada", "ainda não foram aproveitadas")}`,
    contagens.em_producao && `${plural(contagens.em_producao, "está em produção", "estão em produção")}`,
    contagens.aproveitada &&
      `${plural(contagens.aproveitada, "já virou conteúdo", "já viraram conteúdo")}, com ${plural(publicadosAproveitados, "post publicado", "posts publicados")}`,
  ].filter(Boolean) as string[];
  const resumo =
    partes.length > 1 ? `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}` : partes[0] ?? "nenhuma está ativa";

  return (
    <>
      <CabecalhoArea
        area="tendencias"
        aba="tendencias"
        subtitulo="O radar do marketing: o que o mercado está discutindo e o que o time já fez com isso."
      />

      <p className="animate-rise mt-8 max-w-3xl text-[15px] leading-relaxed text-foreground/85" style={delay(70)}>
        {plural(contagens.todas, "tendência no radar", "tendências no radar")}: {resumo}.
        {contagens.descartada > 0 && ` ${plural(contagens.descartada, "descartada fica", "descartadas ficam")} no filtro próprio.`}
      </p>

      {ultimaAcao && (
        <div
          role="status"
          className="animate-rise mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-success-soft px-4 py-3 text-sm text-success"
        >
          <span className="min-w-0 flex-1">{ultimaAcao.texto}</span>
          <a href={ultimaAcao.href} className="inline-flex items-center gap-1 font-display text-xs font-bold text-primary hover:text-accent">
            {ultimaAcao.link} <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            aria-label="Dispensar"
            onClick={() => setUltimaAcao(null)}
            className="rounded-full p-1 text-success/70 transition-colors duration-300 hover:text-success"
          >
            <X aria-hidden className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {destaque ? (
        <Destaque
          t={destaque}
          hoje={hoje}
          onAbrir={() => abrir(destaque)}
          onCardCriado={(id) =>
            setUltimaAcao({
              texto: `"${tituloCardTendencia(destaque)}" está em A fazer. A tendência passou para Em produção e o destaque mudou para a próxima.`,
              href: hrefDe("tarefas", "quadro", { card: id }),
              link: "Ver no Quadro",
            })
          }
        />
      ) : (
        <section className="animate-rise mt-6 rounded-3xl border border-dashed border-border px-6 py-10 text-center" style={delay(140)}>
          <IaDigisystem size={44} className="mx-auto" />
          <p className="mt-3 font-display text-base font-bold text-primary">Todas as tendências do radar já têm um destino.</p>
          <p className="mt-1 text-sm text-muted-foreground">Quando o radar trouxer uma nova, ela aparece aqui em destaque.</p>
        </section>
      )}

      <section aria-label="Filtrar tendências" className="animate-rise mt-12 flex flex-wrap items-center gap-2" style={delay(210)}>
        <div role="group" aria-label="Estado" className="flex flex-wrap items-center gap-1.5">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={estado === f.id}
              onClick={() => setEstado(f.id)}
              className={cn(
                "rounded-full px-3 py-1.5 font-display text-[11px] font-bold transition-all duration-300",
                estado === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground shadow-card hover:-translate-y-0.5 hover:text-primary",
              )}
            >
              {f.label} <span className={estado === f.id ? "opacity-75" : "text-muted-foreground/70"}>{contagens[f.id]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <Seletor rotulo="Segmento" valor={segmento} onMudar={setSegmento} todos="Todos os segmentos" opcoes={segmentos.map((s) => [s, s])} />
          <Seletor
            rotulo="Formato"
            valor={formato}
            onMudar={setFormato}
            todos="Todos os formatos"
            opcoes={formatos.map((f) => [f, formatoLegivel(f)])}
          />
          {filtrando && (
            <button
              type="button"
              onClick={limpar}
              className="inline-flex items-center gap-1 px-2 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
            >
              <X aria-hidden className="h-3.5 w-3.5" /> Limpar filtros
            </button>
          )}
        </div>
      </section>

      {visiveis.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          {estado === "descartada" ? "Nenhuma tendência descartada." : "Nenhuma tendência com esse filtro."}
        </p>
      ) : (
        POTENCIAIS.map((pot, g) => {
          const grupo = visiveis.filter((t) => t.potencial === pot);
          if (grupo.length === 0) return null;
          return (
            <section key={pot} className="animate-rise mt-8" style={delay(280 + g * 70)}>
              <h2 className="flex items-baseline gap-2 border-b border-border pb-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
                Potencial {pot.toLocaleLowerCase("pt-BR")}
                <span className="font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground">
                  {plural(grupo.length, "tendência", "tendências")}
                </span>
              </h2>
              <ul className="mt-3 divide-y divide-border/70 overflow-hidden rounded-3xl bg-card shadow-card">
                {grupo.map((t, i) => (
                  <li key={t.id} className="animate-rise" style={delay(Math.min(i, 8) * 50)}>
                    <LinhaTendencia t={t} situacao={sit(t)} emDestaque={t.id === destaque?.id} hoje={hoje} onAbrir={() => abrir(t)} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {aberta && <TendenciaDetalhe tendenciaId={aberta} onFechar={fechar} />}
    </>
  );
}

// ─── Destaque editorial ──────────────────────────────────────────────────

function Destaque({
  t,
  hoje,
  onAbrir,
  onCardCriado,
}: {
  t: Tendencia;
  hoje: string;
  onAbrir: () => void;
  onCardCriado: (cardId: string) => void;
}) {
  return (
    <section
      aria-labelledby="destaque-titulo"
      className="animate-rise relative mt-6 overflow-hidden rounded-3xl bg-card shadow-card"
      style={delay(140)}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-accent" />
      <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="px-6 pb-7 pt-8 sm:px-8">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Em destaque</span>
            <span className="text-xs text-muted-foreground">maior potencial que o time ainda não aproveitou</span>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ChipPotencial potencial={t.potencial} />
            <ChipPlataforma tag={t.tag} />
          </div>
          <h2 id="destaque-titulo" className="mt-3 font-display text-3xl font-bold leading-[1.1] text-primary sm:text-[2.4rem]">
            {t.titulo}
          </h2>
          <h3 className="mt-6 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">O que está acontecendo</h3>
          <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-foreground/85">{t.descricao}</p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Segmento</dt>
              <dd className="mt-0.5 font-display font-bold text-primary">{t.segmento}</dd>
            </div>
            <div>
              <dt className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Formato sugerido</dt>
              <dd className="mt-0.5 font-display font-bold text-primary">{formatoLegivel(t.formato)}</dd>
            </div>
            <div>
              <dt className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">No radar</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
                <IaDigisystem size={18} /> captada {haQuantoTempo(t.criadoEm, hoje)}, em {ddmm(t.criadoEm)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col border-t border-border/70 bg-navy-soft px-6 py-7 sm:px-8 lg:border-l lg:border-t-0 lg:pt-8">
          <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-accent">Por que importa para a Digisystem</h3>
          <p className="mt-3 font-display text-lg font-semibold leading-snug text-primary">{t.proposta}</p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-7">
            <CriarPostTendencia tendencia={t} />
            <CriarCardTendencia tendencia={t} lado="cima" alinhar="esquerda" onCriado={onCardCriado} />
            <button
              type="button"
              onClick={onAbrir}
              className="inline-flex items-center gap-1.5 px-2 py-2 font-display text-xs font-bold text-primary transition-all duration-300 hover:gap-2.5 hover:text-accent"
            >
              Ver detalhes <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Linha da lista ──────────────────────────────────────────────────────

function LinhaTendencia({
  t,
  situacao,
  emDestaque,
  hoje,
  onAbrir,
}: {
  t: Tendencia;
  situacao: SituacaoTendencia;
  emDestaque: boolean;
  hoje: string;
  onAbrir: () => void;
}) {
  const descartada = situacao.estado === "descartada";
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="group relative grid w-full gap-x-6 gap-y-3 px-5 py-5 text-left transition-colors duration-300 hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none sm:px-6 md:grid-cols-[minmax(0,1fr)_15rem]"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100"
      />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <ChipPlataforma tag={t.tag} className="px-2 text-[10px]" />
          <span>{t.segmento}</span>
          <span aria-hidden>·</span>
          <span>{formatoLegivel(t.formato)}</span>
          <span aria-hidden>·</span>
          <span>{haQuantoTempo(t.criadoEm, hoje)}</span>
          {emDestaque && <span className="font-display font-bold text-accent">Em destaque acima</span>}
        </span>
        <span
          className={cn(
            "mt-1.5 block font-display text-lg font-bold leading-snug transition-colors duration-300 group-hover:text-accent",
            descartada ? "text-muted-foreground" : "text-primary",
          )}
        >
          {t.titulo}
        </span>
        <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">{t.descricao}</span>
      </span>

      <span className="flex flex-col items-start gap-1.5 md:items-end md:text-right">
        <ChipEstadoTendencia situacao={situacao} />
        <span className="text-xs leading-relaxed text-muted-foreground">{oQueFoiFeito(situacao, t)}</span>
      </span>
    </button>
  );
}

/** Uma linha sobre o que o time fez com a tendência. */
function oQueFoiFeito(s: SituacaoTendencia, t: Tendencia): string {
  if (s.estado === "descartada") return t.descarte?.motivo ?? "";
  if (s.estado === "nova") return "Nada feito ainda.";
  const partes = [
    s.cards.length && plural(s.cards.length, "card", "cards"),
    s.posts.length && plural(s.posts.length, "post", "posts"),
  ].filter(Boolean);
  const emAberto = s.posts.length - s.postsPublicados;
  const sobre =
    s.estado === "aproveitada"
      ? "tudo publicado"
      : s.postsPublicados
        ? `${s.postsPublicados} no ar, ${emAberto} em andamento`
        : s.posts.length
          ? "nenhum no ar ainda"
          : "sem post ainda";
  return `${partes.join(" e ")} · ${sobre}`;
}

// ─── Seletor compacto (segmento e formato) ───────────────────────────────

function Seletor({
  rotulo,
  valor,
  onMudar,
  todos,
  opcoes,
}: {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  todos: string;
  opcoes: [string, string][];
}) {
  return (
    <label className="relative">
      <span className="sr-only">{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        className={cn(
          "h-9 rounded-full border bg-card pl-3.5 pr-8 font-display text-[11px] font-bold shadow-card outline-none transition-colors duration-300 focus:border-sky focus:ring-2 focus:ring-sky/30",
          valor === "todos" ? "border-border text-muted-foreground" : "border-primary/40 text-primary",
        )}
      >
        <option value="todos">{todos}</option>
        {opcoes.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
