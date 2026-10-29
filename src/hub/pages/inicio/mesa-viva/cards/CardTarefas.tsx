/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/MinhaMesa.tsx (bloco Minhas tarefas e subtarefas, main @ 0a6b425) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Revisado em 2026-10-27 (noite): só Acordeão (decisão 2; o B1 Deslizar saiu).
 *
 * Minhas tarefas e subtarefas em Acordeão: a seta gira e as subtarefas abrem
 * logo abaixo; em "Mostrar tudo" os grupos já vêm abertos.
 * Concluir subtarefa: o check se desenha, o título ganha um risco e a linha
 * recolhe; um "Desfazer" fica 5 s no card.
 */
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../../../../lib/utils";
import { useHub } from "../../../../store/HubStore";
import { COLUNAS, ROTULO_PROBLEMA, plural, type Coluna, type TarefaDaMesa } from "../../../../store/regras";
import type { Card, Problema, Subtarefa } from "../../../../store/tipos";
import { MARCADOR_COLUNA, PrazoCard } from "../../../../components/CardTarefa";
import { EstadoPost } from "../../../../components/EstadoPost";
import { hrefDe } from "../../../../router";
import { CheckAnimado, ContadorAnimado, useMovimentoReduzido } from "../anim";
import { CardMesa, Resto, Vazio, useListaDensa, type Casca } from "../CardMesa";
import type { Densidade } from "../layout";
import { BOTAO_ICONE } from "../MenuCard";
import { primeiroNome } from "./partes";

// ─── Agrupamento por card ────────────────────────────────────────────────

type Grupo = {
  id: string;
  card: Card;
  coluna: Coluna;
  membros: TarefaDaMesa[];
  atrasado: boolean;
  prazo?: string;
  problema?: Problema;
};

/** A lista já vem ordenada (atrasadas, prazo, sem prazo); o grupo herda a posição do 1º membro. */
function agrupar(tarefas: TarefaDaMesa[]): Grupo[] {
  const porCard = new Map<string, Grupo>();
  for (const t of tarefas) {
    let g = porCard.get(t.card.id);
    if (!g) {
      g = { id: t.card.id, card: t.card, coluna: t.coluna, membros: [], atrasado: false };
      porCard.set(t.card.id, g);
    }
    g.membros.push(t);
    g.atrasado ||= t.atrasada;
    if (t.prazo && (!g.prazo || t.prazo < g.prazo)) g.prazo = t.prazo;
    g.problema ??= t.problemas[0];
  }
  return [...porCard.values()];
}

function subtituloGrupo(g: Grupo) {
  const coluna = COLUNAS.find((c) => c.id === g.coluna)?.label ?? "";
  const temCard = g.membros.some((m) => m.tipo === "card");
  const nSubs = g.membros.filter((m) => m.tipo === "subtarefa").length;
  const subs = plural(nSubs, "subtarefa sua", "subtarefas suas");
  if (temCard && nSubs) return `Seu card em ${coluna} · ${subs}`;
  if (temCard) return `Seu card em ${coluna}`;
  return `${subs} neste card`;
}

// ─── Conclusão animada ───────────────────────────────────────────────────

type FaseSub = "marcando" | "recolhendo";

type Conclusao = {
  fase: (id: string) => FaseSub | undefined;
  concluir: (sub: Subtarefa) => void;
  reabrir: (sub: Subtarefa) => void;
};

function useConclusao(): { api: Conclusao; desfazer: { id: string; titulo: string } | null; limparDesfazer: () => void } {
  const { sel, acoes } = useHub();
  const reduzido = useMovimentoReduzido();
  const [fases, setFases] = useState<Record<string, FaseSub>>({});
  const [desfazer, setDesfazer] = useState<{ id: string; titulo: string } | null>(null);
  const timers = useRef<number[]>([]);
  const timerDesfazer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(timerDesfazer.current);
    },
    [],
  );

  const tirar = (id: string) =>
    setFases((f) => {
      const n = { ...f };
      delete n[id];
      return n;
    });

  const concluir = (sub: Subtarefa) => {
    if (fases[sub.id]) return;
    const pode = sel.podeConcluirManual(sub);
    if (!pode.ok) {
      acoes.avisar(pode.motivo, "erro");
      return;
    }
    setFases((f) => ({ ...f, [sub.id]: "marcando" }));
    const espera = reduzido ? 600 : 900;
    timers.current.push(window.setTimeout(() => setFases((f) => ({ ...f, [sub.id]: "recolhendo" })), espera));
    timers.current.push(
      window.setTimeout(() => {
        const r = acoes.concluirSubtarefa(sub.id, true);
        tirar(sub.id);
        if (!r.ok) return;
        acoes.avisar("Subtarefa concluída.");
        setDesfazer({ id: sub.id, titulo: sub.titulo });
        window.clearTimeout(timerDesfazer.current);
        timerDesfazer.current = window.setTimeout(() => setDesfazer(null), 5000);
      }, espera + (reduzido ? 0 : 280)),
    );
  };

  const reabrir = (sub: Subtarefa) => {
    const r = acoes.concluirSubtarefa(sub.id, false);
    if (r.ok) acoes.avisar(`${sub.titulo} voltou a ficar aberta.`);
  };

  return {
    api: { fase: (id) => fases[id], concluir, reabrir },
    desfazer,
    limparDesfazer: () => {
      window.clearTimeout(timerDesfazer.current);
      setDesfazer(null);
    },
  };
}

// ─── Card ────────────────────────────────────────────────────────────────

export function CardTarefas({ casca }: { casca: Casca }) {
  const { sel, acoes } = useHub();
  const mesa = sel.mesa();
  const grupos = agrupar(mesa.tarefas);
  const atrasadas = mesa.tarefas.filter((t) => t.atrasada).length;
  const lista = useListaDensa(grupos, casca.densidade);
  const { api, desfazer, limparDesfazer } = useConclusao();

  return (
    <CardMesa casca={casca} contador={mesa.tarefas.length} rodape={lista.botao}>
      {grupos.length === 0 ? (
        <Vazio>Nenhum card ou subtarefa com o seu nome agora.</Vazio>
      ) : (
        <>
          {atrasadas > 0 && (
            <p className="mmv-texto-laranja mb-2 inline-flex rounded-full bg-orange-soft px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider">
              {plural(atrasadas, "atrasada", "atrasadas")}
            </p>
          )}
          <Acordeao primeiros={lista.primeiros} resto={lista.resto} restoAberto={lista.aberto} densidade={casca.densidade} conclusao={api} />
        </>
      )}
      {desfazer && (
        <div role="status" className="mmv-entra-item mt-3 flex items-center justify-between gap-3 rounded-xl bg-success-soft px-3 py-2 text-xs text-foreground">
          <span className="min-w-0 truncate">
            <span className="font-semibold">{desfazer.titulo}</span> concluída.
          </span>
          <button
            type="button"
            onClick={() => {
              const r = acoes.concluirSubtarefa(desfazer.id, false);
              if (r.ok) acoes.avisar("Conclusão desfeita.");
              limparDesfazer();
            }}
            className="shrink-0 rounded-lg px-2 py-1 font-display text-[11px] font-bold text-primary hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Desfazer
          </button>
        </div>
      )}
    </CardMesa>
  );
}

// ─── Linhas ──────────────────────────────────────────────────────────────

function LinhaGrupo({ g, seta }: { g: Grupo; seta?: ReactNode }) {
  const { hoje } = useHub();
  const p = g.problema;
  return (
    <div className="flex items-start gap-1">
      <a
        href={hrefDe("tarefas", "quadro", { card: g.card.id })}
        className="group/l -ml-2 flex min-w-0 flex-1 items-start gap-3 rounded-2xl px-2 py-2.5 transition-colors duration-200 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", MARCADOR_COLUNA[g.coluna])} />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] font-bold leading-snug text-primary transition-colors duration-200 group-hover/l:text-accent">
            {g.card.titulo}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{subtituloGrupo(g)}</span>
          {p && (
            <span className="mt-1 block truncate text-[11px] font-semibold text-destructive">
              ⚑ {ROTULO_PROBLEMA[p.tipo]}
              {p.tipo === "bloqueado" && `: ${p.motivo}`}
            </span>
          )}
        </span>
        <span className="shrink-0 pt-0.5">
          <PrazoCard prazo={g.prazo} atrasado={g.atrasado} hoje={hoje} />
        </span>
      </a>
      {seta}
    </div>
  );
}

function LinhaSub({
  sub,
  conclusao,
  recuo,
  seta,
  className,
  style,
}: {
  sub: Subtarefa;
  conclusao: Conclusao;
  recuo?: boolean;
  seta?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { sel, usuario, hoje } = useHub();
  const fase = conclusao.fase(sub.id);
  const concluida = sel.subtarefaConcluida(sub);
  const marcado = concluida || !!fase;
  const post = sel.postDoItem(sub.id);
  const pode = sel.podeConcluirManual(sub);
  const resp = sub.responsavelId === usuario.id ? "Você" : sub.responsavelId ? primeiroNome(sel.usuarioPorId(sub.responsavelId)?.nome) : "Sem responsável";

  return (
    <li className="mmv-recolhe" data-saindo={fase === "recolhendo"}>
      <div className={className} style={style}>
        <div className={cn("flex items-start gap-2 py-1.5", recuo && "pl-6")}>
          <button
            type="button"
            role="checkbox"
            aria-checked={marcado}
            aria-label={concluida ? `Reabrir ${sub.titulo}` : `Concluir ${sub.titulo}`}
            title={post ? "Conclui sozinha quando o post for publicado" : concluida ? "Reabrir" : "Concluir"}
            disabled={!pode.ok || !!fase}
            onClick={() => (concluida ? conclusao.reabrir(sub) : conclusao.concluir(sub))}
            className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <CheckAnimado marcado={marcado} />
          </button>
          <span className="min-w-0 flex-1">
            <span
              className={cn("mmv-risco text-sm leading-snug", concluida ? "text-muted-foreground" : "text-foreground")}
              data-riscado={marcado}
            >
              {sub.titulo}
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              <span className={cn(resp === "Você" && "font-semibold text-primary")}>{resp}</span>
              {!concluida && <PrazoCard prazo={sub.prazo} atrasado={sel.subtarefaAtrasada(sub)} hoje={hoje} />}
              {post && <EstadoPost estado={sel.estadoPost(post)} />}
            </span>
          </span>
          {seta}
        </div>
      </div>
    </li>
  );
}

function Progresso({ feitas, total }: { feitas: number; total: number }) {
  const pct = total ? Math.round((feitas / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span
        role="progressbar"
        aria-label="Subtarefas concluídas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={feitas}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
      >
        <span className="block h-full rounded-full bg-success transition-[width] duration-500 ease-out motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </span>
      <span className="shrink-0 text-[11px] text-muted-foreground">
        <ContadorAnimado valor={feitas} /> de {total} concluídas
      </span>
    </div>
  );
}

/** "N concluídas", fechadas por padrão; o check delas reabre a subtarefa. */
function Concluidas({ subs, conclusao }: { subs: Subtarefa[]; conclusao: Conclusao }) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  if (subs.length === 0) return null;
  return (
    <div className="mt-1">
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((v) => !v)}
        className="inline-flex items-center gap-1 rounded-lg px-1 py-1 font-display text-[11px] font-bold text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight aria-hidden data-aberto={aberto} className="mmv-seta-gira h-3.5 w-3.5" />
        {plural(subs.length, "concluída", "concluídas")}
      </button>
      <div id={id} className="mmv-expansor" data-aberto={aberto}>
        <ul inert={!aberto || undefined}>
          {subs.map((s) => (
            <LinhaSub key={s.id} sub={s} conclusao={conclusao} />
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Acordeão ────────────────────────────────────────────────────────────

function Acordeao({
  primeiros,
  resto,
  restoAberto,
  densidade,
  conclusao,
}: {
  primeiros: Grupo[];
  resto: Grupo[];
  restoAberto: boolean;
  densidade: Densidade;
  conclusao: Conclusao;
}) {
  const { sel } = useHub();
  const base = useId();
  const todos = [...primeiros, ...resto].map((g) => g.id);
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set(densidade === "tudo" ? todos : []));

  // Mostrar tudo: os grupos já vêm abertos. Compacto: fechados.
  useEffect(() => {
    setAbertos(new Set(densidade === "tudo" ? todos : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [densidade]);

  const alternar = (id: string) =>
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const linhaGrupo = (g: Grupo) => {
    const subs = sel.subtarefasDoCard(g.card.id);
    const aberto = abertos.has(g.id);
    const idRegiao = `${base}-${g.id}`;
    const abertas = subs.filter((s) => !sel.subtarefaConcluida(s));
    const feitas = subs.filter((s) => sel.subtarefaConcluida(s));
    return (
      <li key={g.id}>
        <LinhaGrupo
          g={g}
          seta={
            subs.length > 0 ? (
              <button
                type="button"
                aria-expanded={aberto}
                aria-controls={idRegiao}
                aria-label={`${aberto ? "Fechar" : "Abrir"} as ${subs.length} subtarefas de ${g.card.titulo}`}
                title={aberto ? "Fechar subtarefas" : "Abrir subtarefas"}
                onClick={() => alternar(g.id)}
                className={cn(BOTAO_ICONE, "mt-1")}
              >
                <ChevronRight aria-hidden data-aberto={aberto} className="mmv-seta-gira h-4 w-4" />
              </button>
            ) : (
              <span aria-hidden className="w-10 shrink-0 sm:w-9" />
            )
          }
        />
        {subs.length > 0 && (
          <div id={idRegiao} role="region" aria-label={`Subtarefas de ${g.card.titulo}`} className="mmv-expansor" data-aberto={aberto}>
            <div inert={!aberto || undefined}>
              <div className="mb-2 ml-3 border-l border-border pl-4">
                <div className="pt-1">
                  <Progresso feitas={feitas.length} total={subs.length} />
                </div>
                <ul className="mt-1">
                  {abertas.map((s, k) => (
                    <LinhaSub
                      key={s.id}
                      sub={s}
                      conclusao={conclusao}
                      recuo={!!s.parentId}
                      className={aberto ? "mmv-entra-item" : undefined}
                      style={aberto ? { animationDelay: `${Math.min(k, 8) * 30}ms` } : undefined}
                    />
                  ))}
                </ul>
                <Concluidas subs={feitas} conclusao={conclusao} />
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <>
      <ul>{primeiros.map(linhaGrupo)}</ul>
      <Resto aberto={restoAberto}>
        <ul>{resto.map(linhaGrupo)}</ul>
      </Resto>
    </>
  );
}
