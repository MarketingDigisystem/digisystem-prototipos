/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/metricas.tsx (parte de concorrentes),
 *   src/components/metrics/CompetitorDialog.tsx, src/hooks/use-competitors.ts
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Tendências → Concorrência (proposta 2.3: sai de Métricas e vem para o olhar de fora).
 *  - Sai a grade de cards iguais do real: entra uma lista editorial (quem mais
 *    publica primeiro) com o tema forte em destaque, e o detalhe ao lado.
 *  - O detalhe junta o que o CompetitorDialog real mostra em abas: descrição,
 *    sentimento, os 3 mini-KPIs do card real (Engaj. %, Freq/sem, Temas), os
 *    temas (Tag laranja, "Frequência N · últ. DD/MM · notas") e os links.
 *  - Abaixo, o "Comparativo de engajamento médio" do real (Digisystem em azul,
 *    concorrentes em sky). A Digisystem ainda não tem medição: Resultados →
 *    Redes está "Em breve".
 *  - Cadastrar e editar concorrente fica para a implementação (P2): o botão
 *    "Novo concorrente" existe e avisa. Os links aparecem como texto (no
 *    protótipo nada sai para fora). "N concorrentes falando disso" nas
 *    tendências é fase 2 (2.7 item 5).
 *  - Os 4 concorrentes são fictícios: a tabela real está vazia.
 */
import { useState } from "react";
import { Globe, Plus, Tag } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { REDE_META } from "../../components/RedeIcone";
import { useHub } from "../../store/HubStore";
import { ddmm, plural } from "../../store/regras";
import type { Concorrente, Rede } from "../../store/tipos";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

const SENTIMENTO: Record<Concorrente["sentimento"], { rotulo: string; classe: string }> = {
  positivo: { rotulo: "Positivo", classe: "bg-success-soft text-success" },
  neutro: { rotulo: "Neutro", classe: "bg-muted text-muted-foreground" },
  negativo: { rotulo: "Negativo", classe: "bg-destructive/10 text-destructive" },
};

const pct = (n: number) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

function ChipSentimento({ s }: { s: Concorrente["sentimento"] }) {
  const cfg = SENTIMENTO[s];
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide", cfg.classe)}>
      {cfg.rotulo}
    </span>
  );
}

export function Concorrencia() {
  const { dados, acoes } = useHub();
  const lista = [...dados.concorrentes].sort((a, b) => b.frequenciaSemanal - a.frequenciaSemanal || a.nome.localeCompare(b.nome));
  const [selId, setSelId] = useState(lista[0]?.id);
  const sel = lista.find((c) => c.id === selId) ?? lista[0];

  const maisAtivo = lista[0];
  const maiorEngajamento = [...lista].sort((a, b) => b.engajamentoMedio - a.engajamentoMedio)[0];
  const porSentimento = (s: Concorrente["sentimento"]) => lista.filter((c) => c.sentimento === s).length;
  const sentimentos = (["positivo", "neutro", "negativo"] as const)
    .map((s) => [porSentimento(s), SENTIMENTO[s].rotulo.toLocaleLowerCase("pt-BR")] as const)
    .filter(([n]) => n > 0)
    .map(([n, r]) => `${n} ${r}`);
  const fraseSentimento =
    sentimentos.length > 1 ? `${sentimentos.slice(0, -1).join(", ")} e ${sentimentos[sentimentos.length - 1]}` : sentimentos[0];

  const novoConcorrente = () =>
    acoes.avisar("No protótipo, Concorrência é só a tela inicial. Cadastrar e editar concorrentes entra na implementação.");

  return (
    <>
      <CabecalhoArea
        area="tendencias"
        aba="concorrencia"
        subtitulo="Quem disputa a mesma conversa e sobre o que cada um fala."
      />

      {lista.length === 0 || !sel ? (
        <section className="animate-rise mt-8 rounded-3xl border border-dashed border-border px-6 py-10 text-center" style={delay(70)}>
          <p className="font-display text-base font-bold text-primary">Nenhum concorrente acompanhado ainda.</p>
          <p className="mt-1 text-sm text-muted-foreground">Cadastre quem disputa a mesma conversa para ver os temas de cada um.</p>
        </section>
      ) : (
        <>
          <section
            aria-label="Resumo"
            className="animate-rise mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            style={delay(70)}
          >
            <p className="max-w-3xl text-[15px] leading-relaxed text-foreground/85">
              {plural(lista.length, "concorrente acompanhado", "concorrentes acompanhados")}. Quem mais publica é a {maisAtivo.nome}, com{" "}
              {plural(maisAtivo.frequenciaSemanal, "post", "posts")} por semana; o maior engajamento médio é o da {maiorEngajamento.nome},{" "}
              {pct(maiorEngajamento.engajamentoMedio)}. Sentimento do público: {fraseSentimento}.
            </p>
            <button
              type="button"
              onClick={novoConcorrente}
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-accent px-4 py-2.5 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float sm:self-auto"
            >
              <Plus aria-hidden className="h-3.5 w-3.5" /> Novo concorrente
            </button>
          </section>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]">
            <section aria-label="Concorrentes" className="animate-rise" style={delay(140)}>
              <h2 className="flex items-baseline gap-2 border-b border-border pb-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
                Quem mais publica
                <span className="font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground">posts por semana</span>
              </h2>
              <ul className="mt-3 divide-y divide-border/70 overflow-hidden rounded-3xl bg-card shadow-card">
                {lista.map((c, i) => (
                  <li key={c.id} className="animate-rise" style={delay(i * 50)}>
                    <LinhaConcorrente c={c} ativo={c.id === sel.id} onAbrir={() => setSelId(c.id)} />
                  </li>
                ))}
              </ul>

              <Comparativo lista={lista} />
            </section>

            <DetalheConcorrente key={sel.id} c={sel} />
          </div>
        </>
      )}
    </>
  );
}

// ─── Linha da lista ──────────────────────────────────────────────────────

function LinhaConcorrente({ c, ativo, onAbrir }: { c: Concorrente; ativo: boolean; onAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-pressed={ativo}
      className={cn(
        "group relative grid w-full gap-x-6 gap-y-2 px-5 py-5 text-left transition-colors duration-300 focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6",
        ativo ? "bg-secondary/50" : "hover:bg-secondary/30 focus-visible:bg-secondary/30",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] origin-top bg-accent transition-transform duration-300",
          ativo ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100",
        )}
      />
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-lg font-bold leading-snug text-primary transition-colors duration-300 group-hover:text-accent">
            {c.nome}
          </span>
          <span className="text-xs text-muted-foreground">{c.segmento}</span>
        </span>
        <span className="mt-1.5 block text-sm text-muted-foreground">
          Tema forte: <span className="font-display font-bold text-primary">{c.temaForte}</span>
        </span>
      </span>
      <span className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
        <ChipSentimento s={c.sentimento} />
        <span className="text-xs text-muted-foreground">
          <span className="font-display text-sm font-bold text-primary">{c.frequenciaSemanal}</span>/sem ·{" "}
          <span className="font-display text-sm font-bold text-primary">{pct(c.engajamentoMedio)}</span> engaj.
        </span>
      </span>
    </button>
  );
}

// ─── Comparativo de engajamento (do real) ────────────────────────────────

function Comparativo({ lista }: { lista: Concorrente[] }) {
  const max = Math.max(1, ...lista.map((c) => c.engajamentoMedio));
  const ordenada = [...lista].sort((a, b) => b.engajamentoMedio - a.engajamentoMedio);
  return (
    <section aria-label="Comparativo de engajamento médio" className="mt-10">
      <h2 className="border-b border-border pb-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
        Comparativo de engajamento médio
      </h2>
      <ul className="mt-4 space-y-3">
        <li>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-display font-bold text-primary">Digisystem</span>
            <span className="text-xs text-muted-foreground">sem medição ainda</span>
          </div>
          <div className="mt-1 h-3 rounded-full bg-secondary">
            <div className="h-3 w-0 rounded-full bg-primary" />
          </div>
        </li>
        {ordenada.map((c, i) => (
          <li key={c.id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-foreground">{c.nome}</span>
              <span className="font-display font-bold text-primary">{pct(c.engajamentoMedio)}</span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="animate-rise h-3 rounded-full bg-sky transition-[width] duration-700"
                style={{ width: `${(c.engajamentoMedio / max) * 100}%`, ...delay(200 + i * 80) }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        A barra da Digisystem enche quando Resultados → Redes estiver ligado. Os números dos concorrentes são informados à mão.
      </p>
    </section>
  );
}

// ─── Detalhe ─────────────────────────────────────────────────────────────

function IconeLink({ tipo }: { tipo: string }) {
  const meta = REDE_META[tipo as Rede];
  if (!meta) {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-primary">
        <Globe aria-hidden className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", meta.className)}>
      <meta.Icone aria-hidden className="h-4 w-4" />
    </span>
  );
}

function DetalheConcorrente({ c }: { c: Concorrente }) {
  const temas = [...c.temas].sort((a, b) => b.frequencia - a.frequencia);
  return (
    <aside
      aria-label={`Detalhe de ${c.nome}`}
      className="animate-rise overflow-hidden rounded-3xl bg-card shadow-card lg:sticky lg:top-6"
      style={delay(60)}
    >
      <header className="border-b border-border/70 bg-navy-soft px-6 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <ChipSentimento s={c.sentimento} />
          <span className="text-xs text-muted-foreground">{c.segmento}</span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-primary">{c.nome}</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">{c.descricao}</p>
      </header>

      <div className="space-y-6 px-6 py-6">
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Engaj.", pct(c.engajamentoMedio)],
            ["Freq/sem", String(c.frequenciaSemanal)],
            ["Temas", String(c.temas.length)],
          ].map(([r, v]) => (
            <div key={r} className="rounded-xl bg-secondary p-2">
              <dt className="font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{r}</dt>
              <dd className="font-display text-lg font-bold text-primary">{v}</dd>
            </div>
          ))}
        </dl>

        <div>
          <h3 className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-accent">Tema forte</h3>
          <p className="mt-1 font-display text-lg font-semibold leading-snug text-primary">{c.temaForte}</p>
        </div>

        <div>
          <h3 className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Temas que trabalha · {c.temas.length}
          </h3>
          {temas.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Nenhum tema rastreado.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {temas.map((t) => (
                <li key={t.tema} className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
                  <Tag aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div className="min-w-0">
                    <p className="font-semibold text-primary">{t.tema}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Frequência {t.frequencia} · últ. {ddmm(t.ultimaOcorrencia)}
                      {t.notas && ` · ${t.notas}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Onde acompanhar</h3>
          {c.links.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Nenhum link cadastrado.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {c.links.map((l) => (
                <li key={l.url} className="flex items-center gap-3 text-sm" title={l.url}>
                  <IconeLink tipo={l.tipo} />
                  <span className="min-w-0">
                    <span className="block font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {REDE_META[l.tipo as Rede]?.label ?? "Site"}
                    </span>
                    <span className="block truncate text-primary">{l.handle}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
