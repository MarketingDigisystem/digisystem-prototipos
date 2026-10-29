/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/planejamento/GanttView.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Tarefas → Cronograma (proposta 4.12): o mesmo trabalho do Quadro na linha
 * do tempo. Fiel ao GanttView real (grade de dias de 34px, coluna da tarefa
 * fixa à esquerda, barra arredondada com a cor do status, legenda no rodapé,
 * modo Calendário de entregas), ajustado aos status novos: a cor é a da
 * COLUNA CALCULADA em regras.ts (Recebidos, A fazer, Em andamento, Concluído,
 * Problemas), sem Recebido/Em triagem separados nem Em revisão. Subtarefas
 * como linhas ficam para depois (4.12). Negados não aparecem (saíram do Quadro).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { Avatar, MARCADOR_COLUNA } from "../../components/CardTarefa";
import { DetalheCard } from "../../components/DetalheCard";
import { navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { COLUNAS, diaDe, plural, somarDias, type Coluna } from "../../store/regras";
import type { Card } from "../../store/tipos";

const DAY_W = 34;
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const stagger = (i: number) => ({ animationDelay: `${i * 60}ms` });

// ─── Datas em YYYY-MM-DD (sem biblioteca, como o resto do protótipo) ─────

const partes = (dia: string) => dia.split("-").map(Number) as [number, number, number];
const utc = (dia: string) => {
  const [a, m, d] = partes(dia);
  return Date.UTC(a, m - 1, d);
};
/** Dias de `a` até `b` (b − a). */
const diasEntre = (a: string, b: string) => Math.round((utc(b) - utc(a)) / 86_400_000);
const diaDaSemana = (dia: string) => new Date(utc(dia)).getUTCDay();
const curto = (dia: string) => {
  const [, m, d] = partes(dia);
  return `${d} ${MESES_CURTOS[m - 1]}`;
};

/** Cor da barra = marcador da coluna no Quadro. Recebidos é vazado (fila de decisão). */
const corBarra = (c: Coluna) => cn(MARCADOR_COLUNA[c], c === "recebidos" && "bg-card");

type Linha = {
  card: Card;
  coluna: Coluna;
  inicio: string;
  /** Sem data de início: a barra conta do dia em que o card entrou no Quadro. */
  inicioEstimado: boolean;
  prazo: string;
  /** Dias de atraso até hoje (0 = em dia). */
  atraso: number;
};

export function Cronograma({ rota }: { rota: Rota }) {
  const { dados, hoje, sel } = useHub();
  const [modo, setModo] = useState<"linha" | "calendario">("linha");
  const cardAberto = rota.params.card;

  // Só o que está no Quadro: negados ficam de fora, como lá.
  const noQuadro = dados.cards
    .map((card) => ({ card, coluna: sel.colunaDoCard(card) }))
    .filter((x): x is { card: Card; coluna: Coluna } => x.coluna !== null);

  const abrir = (card: Card, coluna: Coluna) => {
    // Pedido ainda em Recebidos se decide em Pedidos, como no Quadro.
    if (coluna === "recebidos") navegar("tarefas", "pedidos", { card: card.id });
    else navegar("tarefas", "cronograma", { card: card.id });
  };

  return (
    <>
      <CabecalhoArea area="tarefas" aba="cronograma" subtitulo="Os cards na linha do tempo, do início ao prazo." />

      <div className="animate-rise mt-8 flex flex-wrap items-center gap-3" style={stagger(1)}>
        <div role="group" aria-label="Modo de visualização" className="inline-flex items-center gap-1 rounded-full bg-card p-1 shadow-card">
          {(
            [
              { id: "linha", label: "Linha do tempo" },
              { id: "calendario", label: "Calendário" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModo(m.id)}
              aria-pressed={modo === m.id}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-wide transition-all duration-300",
                modo === m.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-primary",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {modo === "linha" ? (
          <LinhaDoTempo itens={noQuadro} hoje={hoje} onAbrir={abrir} />
        ) : (
          <CalendarioEntregas itens={noQuadro} hoje={hoje} onAbrir={abrir} />
        )}
      </div>

      {cardAberto && <DetalheCard cardId={cardAberto} onFechar={() => navegar("tarefas", "cronograma")} />}
    </>
  );
}

type ViewProps = {
  itens: { card: Card; coluna: Coluna }[];
  hoje: string;
  onAbrir: (card: Card, coluna: Coluna) => void;
};

// ─── Linha do tempo (o GANTT do real) ──────────────────────────────────────

function LinhaDoTempo({ itens, hoje, onAbrir }: ViewProps) {
  const { sel } = useHub();
  const rolagem = useRef<HTMLDivElement>(null);

  const linhas: Linha[] = useMemo(
    () =>
      itens
        .filter((x) => x.card.prazo)
        .map(({ card, coluna }) => {
          const prazo = card.prazo!;
          const criado = diaDe(card.criadoEm);
          // Início estimado nunca passa do prazo (card criado depois do prazo combinado).
          const inicio = card.inicio ?? (criado <= prazo ? criado : prazo);
          const aberto = coluna !== "concluido";
          return {
            card,
            coluna,
            inicio,
            inicioEstimado: !card.inicio,
            prazo,
            atraso: aberto && prazo < hoje ? diasEntre(prazo, hoje) : 0,
          };
        })
        .sort((a, b) => a.inicio.localeCompare(b.inicio) || a.prazo.localeCompare(b.prazo)),
    [itens, hoje],
  );

  const semPrazo = itens.filter((x) => !x.card.prazo);

  const eixo = useMemo(() => {
    if (linhas.length === 0) return null;
    let min = hoje;
    let max = hoje;
    for (const l of linhas) {
      if (l.inicio < min) min = l.inicio;
      if (l.prazo > max) max = l.prazo;
    }
    const total = diasEntre(min, max) + 1;
    const dias = Array.from({ length: total }, (_, i) => somarDias(min, i));
    const meses: { label: string; span: number }[] = [];
    for (const d of dias) {
      const [a, m] = partes(d);
      const label = `${MESES[m - 1]} ${a}`;
      const ultimo = meses[meses.length - 1];
      if (ultimo && ultimo.label === label) ultimo.span += 1;
      else meses.push({ label, span: 1 });
    }
    return { min, dias, meses, total, idxHoje: diasEntre(min, hoje) };
  }, [linhas, hoje]);

  // Abre com o hoje à vista, uma semana depois da coluna fixa.
  // Depende só de números: um re-render qualquer não desfaz a rolagem da pessoa.
  const idxHoje = eixo?.idxHoje;
  useEffect(() => {
    if (rolagem.current && idxHoje !== undefined) rolagem.current.scrollLeft = Math.max(0, (idxHoje - 7) * DAY_W);
  }, [idxHoje]);

  const atrasados = linhas.filter((l) => l.atraso > 0).length;
  const fimSemana = somarDias(hoje, 6);
  const estaSemana = linhas.filter((l) => l.coluna !== "concluido" && l.prazo >= hoje && l.prazo <= fimSemana).length;
  const contagem = COLUNAS.map((c) => ({ ...c, n: linhas.filter((l) => l.coluna === c.id).length }));

  // Resumo em uma frase no lugar do selo "N com datas" do real.
  const frase =
    linhas.length === 0
      ? "Nenhum card com prazo ainda."
      : `${plural(linhas.length, "card", "cards")} com prazo. ` +
        (estaSemana > 0
          ? `${estaSemana} ${estaSemana === 1 ? "vence" : "vencem"} nos próximos 7 dias`
          : "Nada vence nos próximos 7 dias") +
        (atrasados > 0
          ? ` e ${atrasados} ${atrasados === 1 ? "está atrasado" : "estão atrasados"}.`
          : " e nenhum está atrasado.");

  return (
    <div className="space-y-6">
      <section className="animate-rise rounded-3xl bg-card p-6 shadow-card" style={stagger(2)}>
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Fase de execução</p>
            <h2 className="font-display text-lg font-bold text-primary">Cronograma de tarefas</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{frase}</p>
          </div>
        </header>

        {!eixo ? (
          <p className="rounded-2xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
            Quando um card ganhar prazo no Quadro, ele aparece aqui.
          </p>
        ) : (
          <div ref={rolagem} className="overflow-x-auto pb-2">
            <div className="relative min-w-max [--col:150px] sm:[--col:240px]">
              {/* Faixa do hoje atrás das barras. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 rounded-xl bg-orange-soft/60"
                style={{ left: `calc(var(--col) + ${eixo.idxHoje * DAY_W}px)`, width: DAY_W }}
              />
              <div className="grid" style={{ gridTemplateColumns: `var(--col) repeat(${eixo.total}, ${DAY_W}px)` }}>
                {/* Cabeçalho de meses */}
                <div className="sticky left-0 z-10 bg-card" />
                {eixo.meses.map((m) => (
                  <div
                    key={m.label}
                    style={{ gridColumn: `span ${m.span}` }}
                    className="relative overflow-hidden whitespace-nowrap border-b border-border pb-1 font-display text-[11px] font-bold uppercase tracking-wider text-primary"
                  >
                    {/* Mês curto (poucos dias à vista) mostra só a sigla, sem invadir o mês seguinte. */}
                    <span className="sticky left-[var(--col)] pl-1">{m.span >= 5 ? m.label : m.label.slice(0, 3)}</span>
                  </div>
                ))}

                {/* Cabeçalho de dias */}
                <div className="sticky left-0 z-10 bg-card pr-4 pt-2">
                  <span className="font-display text-[11px] font-bold uppercase tracking-wider text-primary">Card</span>
                </div>
                {eixo.dias.map((d) => {
                  const ehHoje = d === hoje;
                  return (
                    <div
                      key={d}
                      className={cn(
                        "relative pt-2 text-center font-display text-[10px] font-bold uppercase tracking-wider",
                        ehHoje ? "text-accent" : "text-muted-foreground",
                      )}
                      aria-label={ehHoje ? `Hoje, ${curto(d)}` : undefined}
                    >
                      <div>{DIAS_SEMANA[diaDaSemana(d)].slice(0, 1)}</div>
                      <div className={ehHoje ? "text-accent" : "text-primary"}>{partes(d)[2]}</div>
                    </div>
                  );
                })}

                {/* Linhas */}
                {linhas.map((l, i) => {
                  const start = diasEntre(eixo.min, l.inicio) + 1;
                  const span = Math.max(1, diasEntre(l.inicio, l.prazo) + 1);
                  const ocupa = span + l.atraso;
                  const responsavel = sel.usuarioPorId(l.card.responsavelId);
                  const nomeColuna = COLUNAS.find((c) => c.id === l.coluna)?.label ?? "";
                  const titulo = [
                    l.card.titulo,
                    nomeColuna,
                    l.inicioEstimado ? `sem data de início, conta de ${curto(l.inicio)}` : `de ${curto(l.inicio)}`,
                    `até ${curto(l.prazo)}`,
                    l.atraso > 0 ? `atrasado há ${plural(l.atraso, "dia", "dias")}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <div key={l.card.id} className="contents">
                      <div
                        className="animate-rise sticky left-0 z-10 flex items-center gap-2 border-t border-border/60 bg-card py-2.5 pr-3 sm:pr-4"
                        style={stagger(i + 3)}
                      >
                        <span className="hidden sm:block">
                          <Avatar usuario={responsavel} />
                        </span>
                        <button type="button" onClick={() => onAbrir(l.card, l.coluna)} className="min-w-0 flex-1 text-left">
                          <span
                            className={cn(
                              "line-clamp-1 text-xs font-semibold hover:text-primary",
                              l.coluna === "concluido" ? "text-foreground/60" : "text-foreground",
                            )}
                          >
                            {l.card.titulo}
                          </span>
                          <span
                            className={cn(
                              "block font-display text-[10px] font-bold uppercase tracking-wide",
                              l.atraso > 0 ? "text-accent" : "text-muted-foreground",
                            )}
                          >
                            {l.atraso > 0 ? `Atrasado · ${curto(l.prazo)}` : curto(l.prazo)}
                          </span>
                        </button>
                      </div>
                      {start > 1 && <div className="border-t border-border/60" style={{ gridColumn: `2 / ${start + 1}` }} />}
                      <div
                        className="relative flex items-center border-t border-border/60 py-2.5"
                        style={{ gridColumn: `${start + 1} / span ${ocupa}` }}
                      >
                        <button
                          type="button"
                          onClick={() => onAbrir(l.card, l.coluna)}
                          title={titulo}
                          aria-label={titulo}
                          style={{ width: span * DAY_W }}
                          className={cn(
                            "relative z-[2] h-6 shrink-0 overflow-hidden rounded-full shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float",
                            corBarra(l.coluna),
                          )}
                        >
                          {/* Começo esmaecido = início estimado pela criação do card. */}
                          {l.inicioEstimado && (
                            <span aria-hidden className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent" />
                          )}
                        </button>
                        {l.atraso > 0 && (
                          <span
                            aria-hidden
                            className="relative z-[1] -ml-3 h-6 flex-1 rounded-r-full border-2 border-l-0 border-dashed border-accent/70 bg-orange-soft/70"
                          />
                        )}
                      </div>
                      {start + ocupa <= eixo.total && (
                        <div className="border-t border-border/60" style={{ gridColumn: `${start + ocupa + 1} / -1` }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
          {contagem.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
            >
              <span className={cn("h-2 w-2 rounded-full", corBarra(c.id))} /> {c.label}
              <span className="tabular-nums opacity-70">{c.n}</span>
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <span className="h-2 w-4 rounded-r-full border-[1.5px] border-dashed border-accent/70 bg-orange-soft" /> Atraso até hoje
          </span>
          <span className="text-[11px] text-muted-foreground sm:ml-auto">
            Começo esmaecido: sem data de início, a barra conta do dia em que o card entrou no Quadro.
          </span>
        </div>
      </section>

      <section className="animate-rise rounded-3xl bg-card p-6 shadow-card" style={stagger(3)}>
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary">Sem prazo · {semPrazo.length}</h2>
        {semPrazo.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">Todos os cards do Quadro têm prazo.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60">
            {semPrazo.map(({ card, coluna }) => (
              <li key={card.id} className="flex items-center gap-3 py-2.5">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", corBarra(coluna))} />
                <button
                  type="button"
                  onClick={() => onAbrir(card, coluna)}
                  className="min-w-0 flex-1 truncate text-left text-xs font-semibold text-foreground hover:text-primary"
                >
                  {card.titulo}
                </button>
                <span className="inline-flex items-center gap-1 font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  <CalendarDays aria-hidden className="h-3 w-3" />
                  {card.inicio ? `começa ${curto(card.inicio)}` : "sem prazo"}
                </span>
                <Avatar usuario={sel.usuarioPorId(card.responsavelId)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ─── Calendário de entregas (o modo Calendário do real) ─────────────────────

function CalendarioEntregas({ itens, hoje, onAbrir }: ViewProps) {
  const { sel } = useHub();
  const [cursor, setCursor] = useState(() => {
    const [a, m] = partes(hoje);
    return { a, m };
  });

  const primeiro = `${cursor.a}-${String(cursor.m).padStart(2, "0")}-01`;
  const totalDias = new Date(Date.UTC(cursor.a, cursor.m, 0)).getUTCDate();
  const offset = diaDaSemana(primeiro);
  const celulas: (string | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => somarDias(primeiro, i)),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const porDia = new Map<string, { card: Card; coluna: Coluna }[]>();
  for (const x of itens) {
    if (!x.card.prazo) continue;
    const lista = porDia.get(x.card.prazo) ?? [];
    lista.push(x);
    porDia.set(x.card.prazo, lista);
  }

  const mudarMes = (delta: number) =>
    setCursor(({ a, m }) => {
      const n = m + delta;
      return n < 1 ? { a: a - 1, m: 12 } : n > 12 ? { a: a + 1, m: 1 } : { a, m: n };
    });

  return (
    <section className="animate-rise rounded-3xl bg-card p-6 shadow-card" style={stagger(2)}>
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Entregas do mês</p>
          <h2 className="font-display text-lg font-bold text-primary">
            {MESES[cursor.m - 1]} {cursor.a}
          </h2>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => mudarMes(-1)}
            className="rounded-full p-1.5 text-primary transition-colors hover:bg-card"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mudarMes(1)}
            className="rounded-full p-1.5 text-primary transition-colors hover:bg-card"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {DIAS_SEMANA.map((w) => (
          <div key={w} className="pb-1 text-center font-display text-[10px] font-bold uppercase tracking-wider text-primary">
            {w}
          </div>
        ))}
        {celulas.map((d, i) => {
          if (!d) return <div key={`v-${i}`} className="min-h-24 rounded-2xl bg-muted/40" />;
          const lista = porDia.get(d) ?? [];
          const ehHoje = d === hoje;
          return (
            <div
              key={d}
              className={cn("min-h-24 min-w-0 rounded-2xl p-1.5 transition-colors sm:p-2", ehHoje ? "bg-navy-soft" : "bg-muted/40")}
            >
              <span className={cn("font-display text-[11px] font-bold", ehHoje ? "text-accent" : "text-muted-foreground")}>
                {partes(d)[2]}
              </span>
              <div className="mt-1 space-y-1">
                {lista.map(({ card, coluna }) => {
                  const atrasado = coluna !== "concluido" && d < hoje;
                  const nome = sel.usuarioPorId(card.responsavelId)?.nome ?? "Sem responsável";
                  const nomeColuna = COLUNAS.find((c) => c.id === coluna)?.label ?? "";
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => onAbrir(card, coluna)}
                      title={`${card.titulo} · ${nomeColuna} · ${nome}${atrasado ? " · atrasado" : ""}`}
                      className={cn(
                        "flex w-full items-center gap-1.5 rounded-full bg-card px-2 py-1 text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float",
                        atrasado && "ring-1 ring-accent/60",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", corBarra(coluna))} />
                      <span className={cn("truncate text-[10px] font-semibold", coluna === "concluido" ? "text-foreground/60" : "text-foreground")}>
                        {card.titulo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
