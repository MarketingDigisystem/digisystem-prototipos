/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/trends/TrendDetailSheet.tsx, src/routes/_authenticated/tendencias.tsx,
 *   src/hooks/use-trends.ts, src/hooks/use-tasks.ts (useAddTask) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Painel lateral de uma tendência (o TrendDetailSheet real) e as ações da
 * proposta 2.7, reaproveitadas pelo destaque da página:
 *  - "Proposta de conteúdo" passa a se chamar "Por que importa para a Digisystem";
 *  - entra "O que o time já fez": cards e posts ligados, com o estado de cada um;
 *  - "Criar tarefa" vira "Criar card" (A fazer, etiqueta Tendência), com o mesmo
 *    popover do real (Responsável e Data de entrega);
 *  - "Excluir" vira "Descartar", que pede o motivo (só para tendência sem nada
 *    ligado, regras.ts → podeDescartarTendencia). A descartada pode voltar.
 *  - A edição de título/descrição/proposta do real não entra (fora da proposta).
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, LayoutTemplate, ListChecks, RotateCcw, Share2, Target, Trash2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { hrefDe } from "../router";
import { useHub } from "../store/HubStore";
import { COLUNAS, ddmm, diaDe } from "../store/regras";
import type { Post, Tendencia } from "../store/tipos";
import { MARCADOR_COLUNA } from "./CardTarefa";
import { EstadoPost } from "./EstadoPost";
import { campo, rotulo } from "./NovaTarefaDialog";
import { ChipEstadoTendencia, ChipPlataforma, ChipPotencial, formatoLegivel, platformMeta } from "./TendenciaChips";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const kicker = "font-display text-[10px] font-bold uppercase tracking-[0.14em] text-accent";

/** "7 de outubro de 2026" (o "Adicionada em" do real usa o mês por extenso). */
export function dataPorExtenso(iso: string): string {
  const [a, m, d] = diaDe(iso).split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

/** Título do card criado a partir da tendência (o mesmo "Produzir: …" do real). */
export const tituloCardTendencia = (t: Tendencia) => `Produzir: ${t.titulo}`;

/** Para onde leva um post ligado: acervo se publicado, o card se tiver, senão Meus posts. */
export function hrefDoPost(post: Post, cardId?: string): string {
  if (post.estado === "publicado") return hrefDe("posts", "publicados", { post: post.id });
  if (cardId) return hrefDe("tarefas", "quadro", { card: cardId });
  return hrefDe("posts", "meus", { post: post.id });
}

// ─── Popover simples (sem biblioteca): fecha com Esc e clique fora ───────

function Popover({
  aberto,
  onFechar,
  lado,
  alinhar = "direita",
  children,
}: {
  aberto: boolean;
  onFechar: () => void;
  lado: "cima" | "baixo";
  alinhar?: "direita" | "esquerda";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (ref.current && !ref.current.parentElement?.contains(e.target as Node)) onFechar();
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div
      ref={ref}
      role="dialog"
      onKeyDown={(e) => {
        // Esc fecha só o popover, não o painel por trás.
        if (e.key === "Escape") {
          e.stopPropagation();
          onFechar();
        }
      }}
      className={cn(
        "animate-rise absolute z-20 w-[min(88vw,19rem)] rounded-2xl border border-border bg-card p-4 text-left shadow-float",
        lado === "cima" ? "bottom-full mb-2" : "top-full mt-2",
        alinhar === "direita" ? "right-0" : "left-0",
      )}
    >
      {children}
    </div>
  );
}

// ─── Criar card ──────────────────────────────────────────────────────────

export function CriarCardTendencia({
  tendencia,
  lado = "cima",
  alinhar = "direita",
  onCriado,
}: {
  tendencia: Tendencia;
  lado?: "cima" | "baixo";
  alinhar?: "direita" | "esquerda";
  onCriado?: (cardId: string) => void;
}) {
  const { dados, usuario, acoes } = useHub();
  const [aberto, setAberto] = useState(false);
  const [responsavelId, setResponsavelId] = useState(usuario.id);
  const [prazo, setPrazo] = useState("");
  const idSel = useId();
  const idData = useId();

  const criar = () => {
    const id = acoes.criarCard({
      titulo: tituloCardTendencia(tendencia),
      descricao: tendencia.proposta,
      etiquetas: ["e-tendencia"],
      origem: "tendencia",
      trendId: tendencia.id,
      responsavelId: responsavelId || undefined,
      prazo: prazo || undefined,
    });
    acoes.avisar("Card criado em A fazer, com a etiqueta Tendência.");
    setAberto(false);
    setPrazo("");
    onCriado?.(id);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => {
          setResponsavelId(usuario.id);
          setAberto((v) => !v);
        }}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-display text-xs font-bold text-primary-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
      >
        <ListChecks aria-hidden className="h-3.5 w-3.5" /> Criar card
      </button>
      <Popover aberto={aberto} onFechar={() => setAberto(false)} lado={lado} alinhar={alinhar}>
        <p className="font-display text-sm font-bold text-primary">Novo card</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{tituloCardTendencia(tendencia)}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Entra em A fazer com a etiqueta Tendência. Subtarefas e posts você adiciona no card.
        </p>
        <label htmlFor={idSel} className={cn(rotulo, "mt-3 block text-[10px]")}>
          Responsável
        </label>
        <select id={idSel} value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} className={campo}>
          <option value="">Sem responsável</option>
          {dados.usuarios
            .filter((u) => u.ativo)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
        </select>
        <label htmlFor={idData} className={cn(rotulo, "mt-3 block text-[10px]")}>
          Data de entrega
        </label>
        <input id={idData} type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className={campo} />
        <button
          type="button"
          onClick={criar}
          className="mt-4 w-full rounded-full bg-primary px-4 py-2.5 font-display text-xs font-bold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
        >
          Criar card
        </button>
      </Popover>
    </div>
  );
}

/** "Criar post →": abre o Estúdio com o briefing da tendência (o post nasce ligado a ela). */
export function CriarPostTendencia({ tendencia }: { tendencia: Tendencia }) {
  return (
    <a
      href={hrefDe("posts", "criar", { trend: tendencia.id })}
      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
    >
      Criar post <ArrowRight aria-hidden className="h-3.5 w-3.5" />
    </a>
  );
}

// ─── Descartar ───────────────────────────────────────────────────────────

export function DescartarTendencia({ tendencia, onDescartada }: { tendencia: Tendencia; onDescartada?: () => void }) {
  const { acoes } = useHub();
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const idMotivo = useId();

  const descartar = () => {
    const r = acoes.descartarTendencia(tendencia.id, motivo);
    if (r.ok) {
      setAberto(false);
      setMotivo("");
      onDescartada?.();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-display text-xs font-bold text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 aria-hidden className="h-3.5 w-3.5" /> Descartar
      </button>
      <Popover aberto={aberto} onFechar={() => setAberto(false)} lado="cima" alinhar="esquerda">
        <label htmlFor={idMotivo} className="font-display text-sm font-bold text-primary">
          Por que descartar?
        </label>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          Ela sai da lista e fica em Descartadas. O motivo ajuda a calibrar a IA depois.
        </p>
        <textarea
          id={idMotivo}
          autoFocus
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex: fala com o RH, não com gestores de TI."
          className={cn(campo, "resize-none")}
        />
        <button
          type="button"
          onClick={descartar}
          className="mt-3 w-full rounded-full bg-destructive px-4 py-2.5 font-display text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
        >
          Descartar tendência
        </button>
      </Popover>
    </div>
  );
}

// ─── Painel lateral ──────────────────────────────────────────────────────

export function TendenciaDetalhe({ tendenciaId, onFechar }: { tendenciaId: string; onFechar: () => void }) {
  const { dados } = useHub();
  const idTitulo = useId();
  const t = dados.tendencias.find((x) => x.id === tendenciaId);

  useEffect(() => {
    const onTecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onTecla);
    return () => window.removeEventListener("keydown", onTecla);
  }, [onFechar]);

  return (
    <div className="fixed inset-0 z-[55] flex justify-end">
      <button type="button" aria-label="Fechar a tendência" onClick={onFechar} className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="animate-rise relative flex h-full w-full flex-col bg-background shadow-float sm:max-w-[640px]"
      >
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          title="Fechar (Esc)"
          className="absolute right-4 top-12 z-10 rounded-full p-1.5 text-muted-foreground transition-colors duration-300 hover:bg-card hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        {t ? (
          <Conteudo t={t} idTitulo={idTitulo} />
        ) : (
          <div className="px-6 py-12">
            <h2 id={idTitulo} className="font-display text-xl font-bold text-primary">
              Esta tendência não existe mais
            </h2>
          </div>
        )}
      </aside>
    </div>
  );
}

function Conteudo({ t, idTitulo }: { t: Tendencia; idTitulo: string }) {
  const { sel, acoes } = useHub();
  const situacao = sel.situacaoTendencia(t);
  const podeDescartar = sel.podeDescartarTendencia(t).ok;
  const quemDescartou = t.descarte ? sel.usuarioPorId(t.descarte.por) : undefined;

  return (
    <>
      <header className="space-y-3 border-b border-border/70 bg-navy-soft px-6 pb-6 pt-6">
        <div className="flex flex-wrap items-center gap-2 pr-8">
          <ChipPlataforma tag={t.tag} />
          <ChipPotencial potencial={t.potencial} />
          <ChipEstadoTendencia situacao={situacao} />
        </div>
        <h2 id={idTitulo} className="pr-8 font-display text-2xl font-bold leading-tight text-primary">
          {t.titulo}
        </h2>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {t.descarte && (
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold">Descartada</span>
              {quemDescartou && ` por ${quemDescartou.nome}`} em {ddmm(t.descarte.em)}: {t.descarte.motivo}
            </p>
            <button
              type="button"
              onClick={() => acoes.reativarTendencia(t.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-3.5 py-1.5 font-display text-xs font-bold text-accent transition-all duration-300 hover:bg-orange-soft"
            >
              <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Trazer de volta
            </button>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-border/70 bg-card p-5">
              <h3 className={kicker}>O que está acontecendo</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">{t.descricao}</p>
            </section>
            <section className="rounded-2xl border border-border/70 bg-card p-5">
              <h3 className={kicker}>Por que importa para a Digisystem</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">{t.proposta}</p>
            </section>
          </div>
          <aside className="flex flex-col gap-3">
            <MetaChip label="Formato" value={formatoLegivel(t.formato)} icon={LayoutTemplate} />
            <MetaChip label="Plataforma" value={platformMeta(t.tag).label} icon={Share2} />
            <MetaChip label="Segmento" value={t.segmento || "Sem segmento"} icon={Target} />
            <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">Adicionada em {dataPorExtenso(t.criadoEm)}</p>
          </aside>
        </div>

        <OQueOTimeFez t={t} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-card px-6 py-4">
        {podeDescartar ? <DescartarTendencia tendencia={t} /> : <span />}
        <div className="flex flex-wrap items-center gap-2">
          <CriarCardTendencia tendencia={t} />
          <CriarPostTendencia tendencia={t} />
        </div>
      </div>
    </>
  );
}

function MetaChip({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Target }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-soft text-accent">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <span className={kicker}>{label}</span>
        <p title={value} className="mt-0.5 truncate font-display text-sm font-bold text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

/** Fecha o ciclo "vimos → produzimos → publicamos" (2.7 item 4). */
function OQueOTimeFez({ t }: { t: Tendencia }) {
  const { sel } = useHub();
  const { cards, posts } = sel.situacaoTendencia(t);
  // Posts que estão dentro de um card ligado aparecem embaixo do card, não soltos.
  const idsCards = new Set(cards.map((c) => c.id));
  const postsSoltos = posts.filter((p) => {
    const item = p.itemId ? sel.itemPorId(p.itemId) : undefined;
    return !item || !idsCards.has(item.card.id);
  });

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <h3 className={kicker}>O que o time já fez</h3>
      {cards.length === 0 && posts.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Nada ainda. Crie um post ou um card a partir dela.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {cards.map((c) => {
            const coluna = sel.colunaDoCard(c);
            const postsDoCard = posts.filter((p) => p.itemId && sel.itemPorId(p.itemId)?.card.id === c.id);
            return (
              <li key={c.id}>
                <a
                  href={hrefDe("tarefas", "quadro", { card: c.id })}
                  className="group flex items-start gap-2.5 rounded-xl px-1 py-1 transition-colors duration-300 hover:bg-secondary/50"
                >
                  {coluna && <span aria-hidden className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", MARCADOR_COLUNA[coluna])} />}
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-sm font-bold text-primary group-hover:text-accent">{c.titulo}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      Card · {coluna ? COLUNAS.find((x) => x.id === coluna)?.label : "fora do Quadro"}
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-accent" />
                </a>
                {postsDoCard.length > 0 && (
                  <ul className="ml-[1.4rem] mt-1 space-y-1 border-l border-border pl-3">
                    {postsDoCard.map((p) => (
                      <LinhaPost key={p.id} post={p} cardId={c.id} />
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
          {postsSoltos.map((p) => (
            <LinhaPost key={p.id} post={p} cardId={p.itemId ? sel.itemPorId(p.itemId)?.card.id : undefined} />
          ))}
        </ul>
      )}
    </section>
  );
}

function LinhaPost({ post, cardId }: { post: Post; cardId?: string }) {
  const { sel } = useHub();
  return (
    <li>
      <a
        href={hrefDoPost(post, cardId)}
        className="group flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl px-1 py-1 transition-colors duration-300 hover:bg-secondary/50"
      >
        <span className="min-w-0 flex-1 truncate text-sm text-foreground group-hover:text-primary">{post.titulo}</span>
        <EstadoPost estado={sel.estadoPost(post)} />
      </a>
    </li>
  );
}
