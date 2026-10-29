/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/CalendarioPostsView.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Posts → Calendário (proposta 5 e K8). Fiel ao CalendarioPostsView real
 * (setas, mês em Dosis, pílula "Hoje", grade de 7 colunas com células
 * rounded-2xl, PostChip, legenda e PostModal), com o que muda pela proposta:
 *  - só aparecem os aprovados com data de publicação e os já publicados
 *    (o real mostra também rascunhos e aguardando);
 *  - selos "Publicar hoje" e "Atrasado" no chip e no modal (regras.ts,
 *    estadoPostExibido, contra o "hoje" do store);
 *  - "Marcar como publicado" no modal e na faixa "Para publicar" do topo. A
 *    conclusão da subtarefa e do card é derivada (regras.ts, subtarefaConcluida
 *    e cardConcluido); o modal mostra na hora o que aconteceu com o card;
 *  - aprovados sem data ficam numa lista abaixo do mês, para não sumirem.
 * ?post=<id> abre o modal.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { BotaoCriarPost, CabecalhoArea } from "../../components/CabecalhoArea";
import { CLASSE_TOM, EstadoPost } from "../../components/EstadoPost";
import { REDE_META, RedeIcone } from "../../components/RedeIcone";
import { cn } from "../../../lib/utils";
import { hrefDe, navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { COLUNAS, diaDe, plural, type EstadoPostExibido } from "../../store/regras";
import type { Post } from "../../store/tipos";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const kicker = "font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground";
const botaoLaranja =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-display text-[11px] font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float";
const botaoAzul =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-display text-[11px] font-bold text-primary-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float";

/** "14 out" a partir de YYYY-MM-DD. */
function diaMes(dia: string): string {
  const [, m, d] = dia.split("-").map(Number);
  return `${d} ${MESES_CURTOS[m - 1]}`;
}

/** Dia em que o post aparece no calendário: publicado no dia em que foi ao ar; aprovado na data confirmada. */
function diaNoCalendario(p: Post): string | undefined {
  if (p.estado === "publicado") return diaDe(p.publicadoEm ?? p.dataPublicacao ?? p.atualizadoEm);
  if (p.estado === "aprovado") return p.dataPublicacao;
  return undefined;
}

const urgente = (e: EstadoPostExibido) => e.chave === "publicar_hoje" || e.chave === "atrasado";

export function Calendario({ rota }: { rota: Rota }) {
  const { dados, hoje, sel } = useHub();
  const [cursor, setCursor] = useState(() => hoje.slice(0, 7));
  const postAberto = rota.params.post;

  const [ano, mes] = cursor.split("-").map(Number);
  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const irPara = (a: number, m: number) => {
    const d = new Date(a, m - 1, 1);
    setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const celulas = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < primeiroDiaSemana; i++) arr.push(null);
    for (let d = 1; d <= diasNoMes; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    while (arr.length < 35) arr.push(null);
    return arr;
  }, [primeiroDiaSemana, diasNoMes]);

  // Só aprovados com data e publicados (proposta 5).
  const porDia = useMemo(() => {
    const mapa = new Map<number, Post[]>();
    for (const p of dados.posts) {
      const dia = diaNoCalendario(p);
      if (!dia || dia.slice(0, 7) !== cursor) continue;
      const n = Number(dia.slice(8, 10));
      mapa.set(n, [...(mapa.get(n) ?? []), p]);
    }
    // Dentro do dia: o que ainda falta publicar vem antes do que já foi.
    for (const lista of mapa.values()) lista.sort((a, b) => Number(a.estado === "publicado") - Number(b.estado === "publicado"));
    return mapa;
  }, [dados.posts, cursor]);

  const doMes = [...porDia.values()].flat();
  const aPublicarNoMes = doMes.filter((p) => p.estado === "aprovado").length;
  const publicadosNoMes = doMes.length - aPublicarNoMes;

  // Faixa do topo: o que pede ação hoje, de qualquer mês.
  const paraPublicar = dados.posts
    .filter((p) => p.estado === "aprovado" && urgente(sel.estadoPost(p)))
    .sort((a, b) => (a.dataPublicacao ?? "").localeCompare(b.dataPublicacao ?? ""));
  const semData = dados.posts.filter((p) => p.estado === "aprovado" && !p.dataPublicacao);

  const hojeAno = Number(hoje.slice(0, 4));
  const hojeMes = Number(hoje.slice(5, 7));
  const hojeDia = Number(hoje.slice(8, 10));
  const ehHoje = (d: number) => d === hojeDia && mes === hojeMes && ano === hojeAno;

  const abrir = (p: Post) => navegar("posts", "calendario", { post: p.id });
  const fechar = () => navegar("posts", "calendario");

  return (
    <>
      <CabecalhoArea
        area="posts"
        aba="calendario"
        subtitulo="O que está aprovado e quando vai ao ar."
        actions={<BotaoCriarPost />}
      />

      {paraPublicar.length > 0 && <FaixaParaPublicar posts={paraPublicar} onAbrir={abrir} />}

      <section className="animate-rise mt-8 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "70ms" }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => irPara(ano, mes - 1)}
            aria-label="Mês anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-float"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => irPara(ano, mes + 1)}
            aria-label="Próximo mês"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:text-primary hover:shadow-float"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 className="ml-2 font-display text-2xl font-bold text-primary sm:text-3xl" aria-live="polite">
            {MESES[mes - 1]} <span className="text-muted-foreground">{ano}</span>
          </h2>
          <button
            type="button"
            onClick={() => setCursor(hoje.slice(0, 7))}
            className="ml-2 rounded-full bg-sky-soft px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-primary transition-all duration-300 hover:-translate-y-0.5"
          >
            Hoje
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {doMes.length === 0
            ? "Nada aprovado com data neste mês."
            : `${plural(aPublicarNoMes, "post para publicar", "posts para publicar")} e ${plural(publicadosNoMes, "publicado", "publicados")} em ${MESES[mes - 1].toLowerCase()}.`}
        </p>
      </section>

      {/* No celular a grade rola de lado, para os chips continuarem legíveis. */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="min-w-[46rem]">
          <div className="mt-6 grid grid-cols-7 gap-2 px-1">
            {DIAS_SEMANA.map((w) => (
              <div key={w} className="text-center font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {w}
              </div>
            ))}
          </div>

          <section aria-label={`Calendário de ${MESES[mes - 1]} de ${ano}`} className="mt-2 grid grid-cols-7 gap-2">
            {celulas.map((d, i) => {
              const posts = d ? (porDia.get(d) ?? []) : [];
              const destaque = d ? ehHoje(d) : false;
              return (
                <div
                  key={`${cursor}-${i}`}
                  className={cn(
                    "animate-rise flex min-h-[124px] flex-col gap-1.5 rounded-2xl border p-2.5 transition-all duration-300",
                    d
                      ? cn("bg-card shadow-card hover:-translate-y-0.5 hover:shadow-float", destaque ? "border-accent" : "border-transparent")
                      : "border-dashed border-border/60 bg-transparent",
                  )}
                  style={{ animationDelay: `${(i % 7) * 25}ms` }}
                >
                  {d && (
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "font-display text-sm font-bold",
                          destaque
                            ? "flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground"
                            : "text-primary",
                        )}
                      >
                        {d}
                      </span>
                      {posts.length > 0 && (
                        <span className="rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">{posts.length}</span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    {posts.slice(0, 3).map((p) => (
                      <ChipPost key={p.id} post={p} onClick={() => abrir(p)} />
                    ))}
                    {posts.length > 3 && (
                      <span className="pl-1 text-[10px] font-semibold text-muted-foreground">+{posts.length - 3} mais</span>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </div>

      <div className="animate-rise mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-card" style={{ animationDelay: "140ms" }}>
        <span className={kicker}>Status:</span>
        <SeloLegenda tom="sucesso">Aprovado</SeloLegenda>
        <SeloLegenda tom="atencao">Publicar hoje</SeloLegenda>
        <SeloLegenda tom="alerta">Atrasado</SeloLegenda>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
          <Check aria-hidden className="h-3 w-3" /> Publicado
        </span>
        <span className="text-[11px] text-muted-foreground">Rascunhos e posts em aprovação ficam em Meus posts.</span>
      </div>

      {semData.length > 0 && <AprovadosSemData posts={semData} onAbrir={abrir} />}

      {postAberto && <ModalPost postId={postAberto} onFechar={fechar} />}
    </>
  );
}

// ─── Chip do dia (PostChip do real, com os selos novos) ──────────────────

function ChipPost({ post, onClick }: { post: Post; onClick: () => void }) {
  const { sel } = useHub();
  const estado = sel.estadoPost(post);
  const publicado = post.estado === "publicado";
  const selo = estado.chave === "publicar_hoje" ? "Publicar hoje" : estado.chave === "atrasado" ? "Atrasado" : null;
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${post.titulo} · ${estado.rotulo}`}
      className={cn(
        "group flex w-full flex-col gap-0.5 rounded-lg px-1.5 py-1 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card",
        selo === "Atrasado"
          ? "bg-destructive/10 ring-1 ring-destructive/30"
          : selo
            ? "bg-warning-soft ring-1 ring-warning/40"
            : "bg-secondary/60 hover:bg-secondary",
        publicado && "opacity-70 hover:opacity-100",
      )}
    >
      <span className="flex w-full items-center gap-1.5">
        {post.redes.map((r) => (
          <RedeIcone key={r} rede={r} />
        ))}
        <span className={cn("min-w-0 flex-1 truncate text-[11px] font-semibold", publicado ? "text-muted-foreground" : "text-foreground")}>
          {post.titulo}
        </span>
        {publicado ? (
          <Check aria-hidden className="h-3 w-3 shrink-0 text-success" />
        ) : (
          <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0 rounded-full", CLASSE_TOM[estado.tom].ponto)} />
        )}
      </span>
      {selo && (
        <span
          className={cn(
            "pl-0.5 font-display text-[10px] font-bold uppercase tracking-wide",
            selo === "Atrasado" ? "text-destructive" : "text-warning",
          )}
        >
          {selo}
        </span>
      )}
    </button>
  );
}

function SeloLegenda({ tom, children }: { tom: keyof typeof CLASSE_TOM; children: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold", CLASSE_TOM[tom].chip)}>
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", CLASSE_TOM[tom].ponto)} /> {children}
    </span>
  );
}

// ─── Para publicar (hoje e atrasados, de qualquer mês) ───────────────────

function FaixaParaPublicar({ posts, onAbrir }: { posts: Post[]; onAbrir: (p: Post) => void }) {
  const { sel, acoes } = useHub();
  const hojeN = posts.filter((p) => sel.estadoPost(p).chave === "publicar_hoje").length;
  const atrasados = posts.length - hojeN;
  const partes = [
    hojeN > 0 && `${plural(hojeN, "post para publicar", "posts para publicar")} hoje`,
    atrasados > 0 && `${plural(atrasados, "atrasado", "atrasados")}`,
  ].filter(Boolean);

  return (
    <section
      aria-labelledby="titulo-para-publicar"
      className="animate-rise mt-8 rounded-3xl border-l-4 border-accent bg-card px-5 py-4 shadow-card"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-para-publicar" className="font-display text-sm font-bold uppercase tracking-wide text-primary">
          Para publicar
        </h2>
        <p className="text-xs text-muted-foreground">
          {partes.join(" e ")}. O Hub não publica nas redes: depois de postar, marque aqui.
        </p>
      </div>
      <ul className="mt-3 divide-y divide-border/70">
        {posts.map((p) => {
          const item = p.itemId ? sel.itemPorId(p.itemId) : undefined;
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
              {/* Largura fixa para os títulos alinharem com 1 ou 2 redes. */}
              <span className="flex w-11 shrink-0 gap-1">
                {p.redes.map((r) => (
                  <RedeIcone key={r} rede={r} />
                ))}
              </span>
              <button
                type="button"
                onClick={() => onAbrir(p)}
                className="min-w-0 flex-1 text-left transition-colors duration-300 hover:text-accent"
              >
                <span className="block truncate text-sm font-semibold text-primary">{p.titulo}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {item ? `No card ${item.card.titulo}` : "Fora de card"} · por {sel.usuarioPorId(p.autorId)?.nome.split(" ")[0] ?? "alguém do time"}
                </span>
              </button>
              <EstadoPost estado={sel.estadoPost(p)} />
              <button type="button" onClick={() => acoes.marcarPublicado(p.id)} className={botaoLaranja}>
                Marcar como publicado
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Aprovados sem data (não somem do calendário) ────────────────────────

function AprovadosSemData({ posts, onAbrir }: { posts: Post[]; onAbrir: (p: Post) => void }) {
  const { sel } = useHub();
  return (
    <section className="animate-rise mt-8" style={{ animationDelay: "210ms" }}>
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">Aprovados sem data</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Quem aprovou não marcou o dia de publicação. Eles não entram no mês, mas podem ser marcados como publicados.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {posts.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onAbrir(p)}
              className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card/60 px-3 py-2 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-solid hover:shadow-card"
            >
              <span className="flex gap-1">
                {p.redes.map((r) => (
                  <RedeIcone key={r} rede={r} />
                ))}
              </span>
              <span className="max-w-[16rem] truncate text-xs font-semibold text-primary">{p.titulo}</span>
              <span className="text-[11px] text-muted-foreground">de {sel.usuarioPorId(p.autorId)?.nome.split(" ")[0]}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Modal do post (PostModal do real + Marcar como publicado) ───────────

function ModalPost({ postId, onFechar }: { postId: string; onFechar: () => void }) {
  const { dados, hoje, sel, acoes } = useHub();
  const post = sel.postPorId(postId);
  // Depois de marcar, o modal mostra o que aconteceu com a subtarefa e o card.
  const [marcadoAgora, setMarcadoAgora] = useState(false);

  useEffect(() => {
    const onTecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onTecla);
    return () => window.removeEventListener("keydown", onTecla);
  }, [onFechar]);

  if (!post) {
    return (
      <Moldura onFechar={onFechar} titulo="Este post não está mais aqui">
        <p className="mt-2 text-sm text-muted-foreground">Ele pode ter sido apagado ou voltado para a aprovação.</p>
      </Moldura>
    );
  }

  const estado = sel.estadoPost(post);
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;
  const autor = sel.usuarioPorId(post.autorId);
  const aprovador = sel.usuarioPorId(post.aprovadoPor);
  const tendencia = dados.tendencias.find((t) => t.id === post.trendId);
  const dia = diaNoCalendario(post);
  const antesDoDia = post.estado === "aprovado" && post.dataPublicacao !== undefined && post.dataPublicacao > hoje;

  const marcar = () => {
    if (acoes.marcarPublicado(post.id).ok) setMarcadoAgora(true);
  };

  return (
    <Moldura
      onFechar={onFechar}
      titulo={post.titulo}
      topo={
        <div className="flex items-center gap-3">
          {post.redes.map((r) => (
            <RedeIcone key={r} rede={r} tamanho="lg" />
          ))}
          <div>
            <p className={kicker}>{post.redes.map((r) => REDE_META[r].label).join(" · ")}</p>
            <p className="font-display text-lg font-bold text-primary">{dia ? diaMes(dia) : "Sem data"}</p>
          </div>
        </div>
      }
    >
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <EstadoPost estado={estado} />
        <span className="text-[11px] text-muted-foreground">
          por {autor?.nome ?? "alguém do time"}
          {aprovador && ` · aprovado por ${aprovador.nome.split(" ")[0]}`}
        </span>
      </div>

      <div className="mt-4 flex gap-4">
        <img src={post.arteUrl} alt={`Arte do post ${post.titulo}`} className="aspect-square w-24 shrink-0 rounded-2xl bg-navy-soft object-cover shadow-card" />
        <p className="line-clamp-5 text-sm leading-relaxed text-muted-foreground">{post.legenda}</p>
      </div>

      {(item || tendencia) && (
        <div className="mt-4 rounded-2xl bg-secondary/60 px-4 py-3 text-xs">
          {item && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-muted-foreground">{item.tipo === "subtarefa" ? `Subtarefa “${item.titulo}”, do card` : "No card"}</span>
              <a
                href={hrefDe("tarefas", "quadro", { card: item.card.id })}
                className="inline-flex items-center gap-0.5 font-semibold text-primary transition-colors duration-300 hover:text-accent"
              >
                {item.card.titulo} <ArrowUpRight aria-hidden className="h-3 w-3" />
              </a>
            </p>
          )}
          {tendencia && (
            <p className={cn("text-muted-foreground", item && "mt-1")}>
              Nasceu da tendência <span className="font-semibold text-primary">{tendencia.titulo}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-5 border-t border-border pt-4">
        {post.estado === "aprovado" ? (
          <div className="space-y-2">
            <button type="button" onClick={marcar} className={urgente(estado) ? botaoLaranja : botaoAzul}>
              Marcar como publicado
            </button>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {antesDoDia
                ? `A data confirmada é ${diaMes(post.dataPublicacao as string)}. Se já foi ao ar, marcar agora registra a publicação de hoje.`
                : "O Hub não publica nas redes. Depois de postar, marque aqui: a data de publicação fica gravada."}
            </p>
          </div>
        ) : post.estado === "publicado" ? (
          <div className={cn("space-y-2", marcadoAgora && "animate-rise")}>
            {marcadoAgora && <ConsequenciaDoCard post={post} />}
            <a
              href={hrefDe("posts", "publicados", { post: post.id })}
              className="inline-flex items-center gap-1 font-display text-xs font-bold text-primary transition-colors duration-300 hover:text-accent"
            >
              Ver em Publicados <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Este post saiu do calendário: {estado.rotulo.toLowerCase()}. Ele volta quando for aprovado de novo.
          </p>
        )}
      </div>
    </Moldura>
  );
}

/** O que a publicação fez com a subtarefa e o card (derivado de regras.ts). */
function ConsequenciaDoCard({ post }: { post: Post }) {
  const { sel } = useHub();
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;
  const frases: string[] = [];
  if (item) {
    if (item.tipo === "subtarefa") frases.push(`A subtarefa “${item.titulo}” concluiu sozinha.`);
    const coluna = sel.colunaDoCard(item.card);
    if (coluna === "concluido") {
      frases.push(`Tudo no card “${item.card.titulo}” terminou, e ele foi sozinho para Concluído.`);
    } else {
      const rotulo = COLUNAS.find((c) => c.id === coluna)?.label ?? "o Quadro";
      frases.push(`O card “${item.card.titulo}” continua em ${rotulo}. ${sel.textoFalta(item.card)}`.trim());
    }
  } else {
    frases.push("O post não está em nenhum card, então nada muda no Quadro.");
  }
  return (
    <div className="rounded-2xl bg-success-soft px-4 py-3">
      <p className="flex items-center gap-1.5 font-display text-sm font-bold text-success">
        <Check aria-hidden className="h-4 w-4" /> Publicado. Já está no acervo do time.
      </p>
      {frases.map((f) => (
        <p key={f} className="mt-1 text-xs leading-relaxed text-foreground/80">
          {f}
        </p>
      ))}
    </div>
  );
}

function Moldura({
  titulo,
  topo,
  onFechar,
  children,
}: {
  titulo: string;
  topo?: ReactNode;
  onFechar: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-primary/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="animate-rise max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-6 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          {topo ?? <span />}
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-secondary hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="mt-5 font-display text-xl font-bold leading-snug text-primary">{titulo}</h3>
        {children}
      </div>
    </div>
  );
}
