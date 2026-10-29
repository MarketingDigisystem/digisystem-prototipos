/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/planejamento/MetricasPlanejamentoView.tsx,
 *   src/hooks/use-metricas-planejamento.ts @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Resultados → Time (proposta 4.11 e 2.7).
 *  - No topo, o resumo em uma frase (resumoDoTime), com o alternador entre o
 *    mês do "hoje" do protótipo (calculado do store, reage às ações) e o mês
 *    anterior (histórico fechado, só leitura).
 *  - Os 6 blocos da proposta + aproveitamento de tendências, todos de
 *    metricasDoTime em regras.ts. Sai a grade de 3 KPIs iguais do real: blocos
 *    de tamanhos diferentes, conforme o peso de cada pergunta.
 *  - Do real ficam o kicker laranja + título em Dosis, as barras horizontais
 *    do "Backlog por responsável" (accent/sky alternados), o contador em
 *    pílula navy-soft e o formato "2,4 d" / "18%".
 *  - Carga por pessoa e problemas abertos são uma foto de agora; o resto é do
 *    mês escolhido. Fica de fora de propósito: horas, tempo por post e ranking.
 */
import { useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Avatar } from "../../components/CardTarefa";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { hrefDe } from "../../router";
import { useHub } from "../../store/HubStore";
import {
  ROTULO_PROBLEMA,
  ddmm,
  formatarDuracao,
  periodosDoTime,
  plural,
  resumoDoTime,
  type MetricasTime,
} from "../../store/regras";
import type { EstadoTendencia } from "../../store/tipos";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

const VAZIO = "Ainda não há dados suficientes para este indicador.";

const pct = (parte: number, todo: number) => (todo ? Math.round((parte / todo) * 100) : 0);

export function Time() {
  const { sel, hoje } = useHub();
  const [chave, setChave] = useState<"atual" | "anterior">("atual");
  const [atual, anterior] = periodosDoTime(hoje);
  const m = sel.metricasTime(chave);

  return (
    <>
      <CabecalhoArea area="resultados" aba="time" />

      <section
        aria-label="Resumo do mês"
        className="animate-rise mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        style={delay(70)}
      >
        <div className="max-w-3xl">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
            {m.periodo.emCurso ? "Mês em curso" : "Mês fechado"}
          </p>
          <p className="mt-2 font-display text-2xl font-bold leading-snug text-primary sm:text-[1.7rem]">{resumoDoTime(m, hoje)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tudo sai das mudanças de status que o Hub já grava. Ninguém precisa marcar horas.
          </p>
        </div>
        <div role="group" aria-label="Mês" className="flex shrink-0 gap-1 self-start rounded-full bg-secondary p-1 lg:self-auto">
          {[atual, anterior].map((p) => (
            <button
              key={p.chave}
              type="button"
              aria-pressed={chave === p.chave}
              onClick={() => setChave(p.chave)}
              className={cn(
                "rounded-full px-4 py-1.5 font-display text-xs font-bold capitalize transition-all duration-300",
                chave === p.chave ? "bg-accent text-accent-foreground shadow-card" : "text-primary hover:bg-card",
              )}
            >
              {p.nome}
              {p.emCurso && <span className="font-sans font-normal normal-case"> (até hoje)</span>}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-12">
        <BlocoPedidos m={m} className="lg:col-span-7" ordem={1} />
        <div className="grid gap-6 lg:col-span-5">
          <BlocoTriagem m={m} ordem={2} />
          <BlocoResposta m={m} ordem={3} />
        </div>
        <BlocoEntregas m={m} className="lg:col-span-5" ordem={4} />
        <BlocoCarga m={m} className="lg:col-span-7" ordem={5} />
        <BlocoProblemas m={m} className="lg:col-span-7" ordem={6} />
        <BlocoTendencias m={m} className="lg:col-span-5" ordem={7} />
      </div>

      <p className="animate-rise mt-8 max-w-2xl text-xs text-muted-foreground" style={delay(560)}>
        Fica de fora de propósito: horas, tempo por post e ranking de produtividade. As métricas de conteúdo
        (publicados por rede, reprovação na primeira aprovação, origem dos posts) chegam na versão 2.
      </p>
    </>
  );
}

// ─── Estrutura comum ─────────────────────────────────────────────────────

function Bloco({
  kicker,
  titulo,
  pergunta,
  agora,
  ordem,
  className,
  tom = "card",
  children,
}: {
  kicker: string;
  titulo: string;
  /** A pergunta que o bloco responde (tabela da proposta 4.11). */
  pergunta: string;
  /** Foto de agora, não acumulado do mês. */
  agora?: boolean;
  ordem: number;
  className?: string;
  tom?: "card" | "navy";
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "animate-rise rounded-3xl p-6 shadow-card",
        tom === "navy" ? "bg-navy-soft" : "bg-card",
        className,
      )}
      style={delay(ordem * 60 + 90)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{kicker}</p>
          <h2 className="font-display text-lg font-bold text-primary">{titulo}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{pergunta}</p>
        </div>
        {agora && (
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-primary">
            Agora
          </span>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function BarraHorizontal({ valor, max, tom }: { valor: number; max: number; tom: "accent" | "sky" | "primary" }) {
  return (
    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          tom === "accent" ? "bg-accent" : tom === "sky" ? "bg-sky" : "bg-primary",
        )}
        style={{ width: `${max ? (valor / max) * 100 : 0}%` }}
      />
    </div>
  );
}

function Numero({ children, nota }: { children: ReactNode; nota?: ReactNode }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-display text-4xl font-bold text-primary">{children}</span>
      {nota && <span className="text-sm text-muted-foreground">{nota}</span>}
    </p>
  );
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 font-display text-xs font-bold text-primary underline-offset-4 transition-colors hover:text-accent hover:underline"
    >
      {children} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
    </a>
  );
}

// ─── 1. Pedidos que chegaram ─────────────────────────────────────────────

function BlocoPedidos({ m, className, ordem }: { m: MetricasTime; className?: string; ordem: number }) {
  const { pedidos: p } = m;
  const maxArea = Math.max(1, ...p.porArea.map((a) => a.n));
  const diferenca =
    p.totalAnterior === null
      ? null
      : m.periodo.emCurso
        ? `No mês passado inteiro foram ${p.totalAnterior}.`
        : null;

  return (
    <Bloco
      kicker="Demanda"
      titulo="Pedidos que chegaram"
      pergunta="O que pedem para o marketing, e quem pede?"
      ordem={ordem}
      className={className}
    >
      <Numero nota={`${plural(p.post, "pedido de post", "pedidos de post")} e ${plural(p.acao, "de ação", "de ação")}`}>
        {p.total}
      </Numero>
      {diferenca && <p className="mt-1 text-xs text-muted-foreground">{diferenca}</p>}

      {p.total === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">{VAZIO}</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Por área</h3>
            <ul className="mt-3 space-y-3.5">
              {p.porArea.map((a, i) => (
                <li key={a.chave} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <span className="truncate text-xs font-semibold text-foreground">{a.nome}</span>
                    <BarraHorizontal valor={a.n} max={maxArea} tom={i % 2 === 0 ? "accent" : "sky"} />
                  </div>
                  <span className="rounded-full bg-navy-soft px-3 py-1 font-display text-xs font-bold text-primary">{a.n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Por etiqueta</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.porEtiqueta.map((e) => (
                <li
                  key={e.chave}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
                >
                  <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: e.cor ?? "var(--color-muted-foreground)" }} />
                  {e.nome}
                  <span className="font-display font-bold text-primary">{e.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Bloco>
  );
}

// ─── 2. Resultado da triagem ─────────────────────────────────────────────

function BlocoTriagem({ m, ordem }: { m: MetricasTime; ordem: number }) {
  const t = m.triagem;
  const partes = [
    { chave: "aprovados", rotulo: "Aprovados", n: t.aprovados, classe: "bg-success" },
    { chave: "devolvidos", rotulo: "Devolvidos", n: t.devolvidos, classe: "bg-accent" },
    { chave: "negados", rotulo: "Negados", n: t.negados, classe: "bg-destructive" },
  ];
  return (
    <Bloco kicker="Triagem" titulo="Resultado das decisões" pergunta="Os pedidos chegam bem explicados?" ordem={ordem}>
      {t.total === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma decisão de pedido neste mês.</p>
      ) : (
        <>
          <div
            role="img"
            aria-label={partes.map((p) => `${p.rotulo}: ${p.n}`).join(", ")}
            className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
          >
            {partes.map((p) =>
              p.n ? <div key={p.chave} className={cn("h-full transition-all duration-500", p.classe)} style={{ width: `${pct(p.n, t.total)}%` }} /> : null,
            )}
          </div>
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {partes.map((p) => (
              <li key={p.chave}>
                <span className="font-display text-2xl font-bold text-primary">{p.n}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span aria-hidden className={cn("h-2 w-2 rounded-full", p.classe)} />
                  {p.rotulo}
                </span>
              </li>
            ))}
          </ul>
          {t.devolvidos > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              {pct(t.devolvidos, t.total)}% voltaram para o solicitante completar. Quanto menor, melhor o formulário está explicando.
            </p>
          )}
        </>
      )}
    </Bloco>
  );
}

// ─── 3. Tempo de resposta ────────────────────────────────────────────────

function BlocoResposta({ m, ordem }: { m: MetricasTime; ordem: number }) {
  const { sel } = useHub();
  const r = m.resposta;
  return (
    <Bloco kicker="Triagem" titulo="Tempo de resposta" pergunta="O solicitante espera demais?" ordem={ordem}>
      {r.mediaHoras === null ? (
        <p className="text-sm text-muted-foreground">{VAZIO}</p>
      ) : (
        <Numero nota={`em média, da chegada à decisão. A mais lenta levou ${formatarDuracao(r.maisLentaHoras)}.`}>
          {formatarDuracao(r.mediaHoras)}
        </Numero>
      )}
      {m.periodo.emCurso && (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Esperando decisão agora · {r.esperando.length}
          </h3>
          {r.esperando.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Nenhum pedido esperando.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {r.esperando.slice(0, 4).map((e) => (
                <li key={e.cardId}>
                  <a
                    href={hrefDe("tarefas", "pedidos", { card: e.cardId })}
                    className="group flex items-baseline justify-between gap-3 rounded-xl px-2 py-1 -mx-2 transition-colors hover:bg-secondary/50"
                  >
                    <span className="min-w-0 truncate text-sm text-foreground group-hover:text-primary">{e.titulo}</span>
                    <span className={cn("shrink-0 text-xs", e.dias >= 2 ? "font-semibold text-accent" : "text-muted-foreground")}>
                      {e.dias === 0 ? "chegou hoje" : `há ${plural(e.dias, "dia", "dias")}`}
                      {e.comQuem ? ` · com ${sel.usuarioPorId(e.comQuem)?.nome.split(" ")[0] ?? ""}` : ""}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Bloco>
  );
}

// ─── 4. Entregas no prazo ────────────────────────────────────────────────

function BlocoEntregas({ m, className, ordem }: { m: MetricasTime; className?: string; ordem: number }) {
  const e = m.entregas;
  const atrasadas = e.lista.filter((x) => x.prazo && x.diasAtraso > 0);
  return (
    <Bloco
      kicker="Compromisso"
      titulo="Entregas no prazo"
      pergunta="O time cumpre o que promete?"
      ordem={ordem}
      className={className}
    >
      {e.total === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum card chegou a Concluído neste mês.</p>
      ) : (
        <>
          <Numero nota={`de ${plural(e.comPrazo, "card com prazo", "cards com prazo")} (${e.noPrazo} no prazo)`}>
            {e.comPrazo ? `${pct(e.noPrazo, e.comPrazo)}%` : "Sem prazo"}
          </Numero>
          <ul aria-label="Cada card entregue" className="mt-4 flex flex-wrap gap-1.5">
            {e.lista.map((x) => (
              <li
                key={x.id}
                title={`${x.titulo}: ${!x.prazo ? "sem prazo" : x.diasAtraso > 0 ? `${plural(x.diasAtraso, "dia", "dias")} depois do prazo` : "no prazo"}`}
                className={cn(
                  "h-4 w-4 rounded-md",
                  !x.prazo ? "bg-muted" : x.diasAtraso > 0 ? "bg-accent" : "bg-success",
                )}
              />
            ))}
          </ul>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2 w-2 rounded-sm bg-success" />No prazo</span>
            <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2 w-2 rounded-sm bg-accent" />Depois do prazo</span>
            <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2 w-2 rounded-sm bg-muted" />Sem prazo</span>
          </p>
          {atrasadas.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Depois do prazo</h3>
              <ul className="mt-2 space-y-1.5">
                {atrasadas.slice(0, 4).map((x) => {
                  const texto = (
                    <>
                      <span className="min-w-0 truncate text-sm text-foreground">{x.titulo}</span>
                      <span className="shrink-0 text-xs text-accent">
                        +{plural(x.diasAtraso, "dia", "dias")} · prazo {ddmm(x.prazo as string)}
                      </span>
                    </>
                  );
                  return (
                    <li key={x.id}>
                      {x.cardId ? (
                        <a
                          href={hrefDe("tarefas", "quadro", { card: x.cardId })}
                          className="-mx-2 flex items-baseline justify-between gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-secondary/50"
                        >
                          {texto}
                        </a>
                      ) : (
                        <span className="flex items-baseline justify-between gap-3 py-1">{texto}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </Bloco>
  );
}

// ─── 5. Carga por pessoa ─────────────────────────────────────────────────

function BlocoCarga({ m, className, ordem }: { m: MetricasTime; className?: string; ordem: number }) {
  const { sel } = useHub();
  const max = Math.max(1, ...m.carga.map((c) => c.abertas));
  return (
    <Bloco
      kicker="Carga do time"
      titulo="O que está com cada pessoa"
      pergunta="O trabalho está bem distribuído? Conta cards e subtarefas abertos."
      agora
      ordem={ordem}
      className={className}
    >
      {m.carga.length === 0 ? (
        <p className="text-sm text-muted-foreground">{VAZIO}</p>
      ) : (
        <ul className="space-y-4">
          {m.carga.map((c, i) => {
            const u = sel.usuarioPorId(c.usuarioId);
            return (
              <li key={c.usuarioId ?? "sem"} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <Avatar usuario={u} tamanho="h-8 w-8" />
                    <span className="truncate text-xs font-semibold text-foreground">{u?.nome ?? "Sem responsável"}</span>
                    {c.atrasadas > 0 && (
                      <span className="rounded-full bg-orange-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                        {c.atrasadas === 1 ? "1 atrasada" : `${c.atrasadas} atrasadas`}
                      </span>
                    )}
                    {c.emProblemas > 0 && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                        {c.emProblemas} em Problemas
                      </span>
                    )}
                  </div>
                  <BarraHorizontal valor={c.abertas} max={max} tom={i % 2 === 0 ? "accent" : "sky"} />
                </div>
                <span className="rounded-full bg-navy-soft px-3 py-1 font-display text-xs font-bold text-primary">{c.abertas}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Bloco>
  );
}

// ─── 6. Problemas por tipo ───────────────────────────────────────────────

function BlocoProblemas({ m, className, ordem }: { m: MetricasTime; className?: string; ordem: number }) {
  const totalAbertos = m.problemas.reduce((s, p) => s + p.abertos, 0);
  return (
    <Bloco
      kicker="Fluxo"
      titulo="Problemas por tipo"
      pergunta="Onde o fluxo emperra, e há quanto tempo?"
      ordem={ordem}
      className={className}
    >
      <ul className="divide-y divide-border/70">
        {m.problemas.map((p) => (
          <li key={p.tipo} className="grid gap-x-6 gap-y-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_minmax(0,1fr)]">
            <span className="font-display text-sm font-bold text-primary">{ROTULO_PROBLEMA[p.tipo]}</span>
            <span className="text-sm text-foreground">
              {p.abertos === 0 ? (
                <span className="text-muted-foreground">Nenhum aberto agora</span>
              ) : (
                <>
                  <span className="font-display font-bold text-destructive">{p.abertos}</span>{" "}
                  {p.abertos === 1 ? "aberto" : "abertos"}
                  <span className="text-muted-foreground">
                    {" "}
                    · o mais antigo {p.maisAntigoDias === 0 ? "é de hoje" : `há ${plural(p.maisAntigoDias ?? 0, "dia", "dias")}`}
                  </span>
                </>
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              {p.resolvidos === 0
                ? "Nenhum resolvido no mês"
                : `${plural(p.resolvidos, "resolvido", "resolvidos")} no mês, em ${formatarDuracao(p.mediaResolucaoHoras)} na média`}
            </span>
          </li>
        ))}
      </ul>
      {totalAbertos > 0 && (
        <p className="mt-4">
          <Link href={hrefDe("tarefas", "quadro")}>Ver a coluna Problemas no Quadro</Link>
        </p>
      )}
    </Bloco>
  );
}

// ─── Aproveitamento de tendências (2.7) ──────────────────────────────────

const ROTULO_ESTADO: { chave: EstadoTendencia; rotulo: string }[] = [
  { chave: "nova", rotulo: "Novas" },
  { chave: "em_producao", rotulo: "Em produção" },
  { chave: "aproveitada", rotulo: "Aproveitadas" },
  { chave: "descartada", rotulo: "Descartadas" },
];

function BlocoTendencias({ m, className, ordem }: { m: MetricasTime; className?: string; ordem: number }) {
  const t = m.tendencias;
  const n = t.aproveitadasNoMes.length;
  return (
    <Bloco
      kicker="Radar"
      titulo="Aproveitamento de tendências"
      pergunta="Quantas tendências viraram post publicado no mês?"
      ordem={ordem}
      className={className}
      tom="navy"
    >
      <Numero nota={`de ${t.total} no radar · ${plural(t.postsPublicadosNoMes, "post publicado", "posts publicados")}`}>{n}</Numero>
      {n === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhuma tendência virou post publicado neste mês.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {t.aproveitadasNoMes.map((x) => (
            <li key={x.id} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 text-sm leading-snug text-foreground">{x.titulo}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{plural(x.posts, "post", "posts")}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-5 grid grid-cols-4 gap-2 border-t border-primary/10 pt-4">
        {ROTULO_ESTADO.map((e) => (
          <div key={e.chave}>
            <dt className="text-[11px] leading-tight text-muted-foreground">{e.rotulo}</dt>
            <dd className="font-display text-lg font-bold text-primary">{t.porEstado[e.chave]}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4">
        <Link href={hrefDe("tendencias", "tendencias")}>Abrir o radar</Link>
      </p>
    </Bloco>
  );
}
