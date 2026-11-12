// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ (métricas do DigiPlace, relatório seção c) e regras.ts desta pasta (metricasDoPeriodo, popularidade, alertasMinimo, esgotados, valorEmEstoque), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 5.1, 5.2, 5.3, 5.5).
//
// Painel de Métricas da gestão. Período de 3 meses em pills de largura fixa; barras em HTML/CSS (só apoio ao texto).
// Âncora fixa: trocar de período ou de filtro de área nunca muda a posição dos controles (blocos têm altura reservada).

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import {
  alertasMinimo,
  esgotados,
  mesDoEncerramentoEm,
  mesesDoPainel,
  metricasDoPeriodo,
  pedidosEncerradosDoPeriodo,
  popularidade,
  unidadesDoPedido,
  valorDoPedido,
  valorEmEstoque,
  variacaoDeGasto,
} from "../../regras";
import { href } from "../../rota";
import { useLoja } from "../../store";
import type { LinhaGasto } from "../../tipos";
import { FotoBrinde } from "../../ui";
import { BTN_SECUNDARIO, PILL, PILL_ATIVO, PILL_INATIVO, brl, formatarInstante } from "./comum";

const NOMES_MES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function nomeDoMes(mes: string): string {
  return NOMES_MES[Number(mes.slice(5, 7)) - 1] ?? mes;
}

function rotuloDoMes(mes: string): string {
  return `${nomeDoMes(mes)} de ${mes.slice(0, 4)}`;
}

function rotuloCurto(mes: string): string {
  return `${nomeDoMes(mes).slice(0, 3)}/${mes.slice(2, 4)}`;
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

const CARTAO = "rounded-3xl border bg-card p-5 shadow-card";

function Kpi({ rotulo, valor, nota, children }: { rotulo: string; valor: string; nota?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <p className="text-xs font-semibold text-muted-foreground">{rotulo}</p>
      <p className="font-display text-2xl font-bold tabular-nums text-navy">{valor}</p>
      {/* Altura reservada: a nota pode mudar de texto sem empurrar os cartões vizinhos. */}
      <div className="mt-1 min-h-10 text-xs text-muted-foreground">
        {children}
        {nota && <p>{nota}</p>}
      </div>
    </div>
  );
}

function BarrasDeGasto({
  titulo,
  linhas,
  selecionada,
  onEscolher,
  vazio,
}: {
  titulo: string;
  linhas: LinhaGasto[];
  selecionada?: string;
  /** Presente só nas barras de área: clicar filtra a lista de pedidos. */
  onEscolher?: (chave: string) => void;
  vazio: string;
}) {
  const maior = Math.max(1, ...linhas.map((l) => l.valor));
  return (
    <section className={CARTAO} aria-label={titulo}>
      <h2 className="font-display text-lg font-bold text-navy">{titulo}</h2>
      {linhas.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {linhas.map((l) => {
            const conteudo = (
              <>
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-display text-sm font-bold text-navy">{l.rotulo}</span>
                  <span className="text-sm font-semibold tabular-nums">{brl(l.valor)}</span>
                </span>
                <span className="block text-xs text-muted-foreground">
                  {plural(l.pedidos, "pedido", "pedidos")} · {plural(l.unidades, "unidade", "unidades")}
                </span>
                <span aria-hidden className="mt-1 block h-2 overflow-hidden rounded-full bg-secondary">
                  <span className="block h-full rounded-full bg-sky" style={{ width: `${Math.max(2, (l.valor / maior) * 100)}%` }} />
                </span>
              </>
            );
            return (
              <li key={l.chave}>
                {onEscolher ? (
                  <button
                    type="button"
                    aria-pressed={selecionada === l.chave}
                    onClick={() => onEscolher(l.chave)}
                    className={`block min-h-11 w-full rounded-xl border px-3 py-2 text-left transition-colors hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky motion-reduce:transition-none ${
                      selecionada === l.chave ? "border-transparent bg-navy-soft shadow-[0_0_0_2px_var(--sky)]" : "border-transparent"
                    }`}
                  >
                    {conteudo}
                  </button>
                ) : (
                  <div className="block min-h-11 rounded-xl px-3 py-2">{conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function Metricas() {
  const { dados, nomeDaPessoa, brinde } = useLoja();
  const meses = useMemo(() => mesesDoPainel(dados), [dados]);
  const [mes, setMes] = useState(meses[0]);
  const [area, setArea] = useState<string | undefined>(undefined);

  const m = useMemo(() => metricasDoPeriodo(dados, mes), [dados, mes]);
  const v = variacaoDeGasto(m);
  const pedidos = useMemo(() => pedidosEncerradosDoPeriodo(dados, mes, area), [dados, mes, area]);
  const abaixo = useMemo(() => alertasMinimo(dados), [dados]);
  const zerados = useMemo(() => esgotados(dados), [dados]);
  const top = useMemo(() => popularidade(dados).slice(0, 5), [dados]);
  const maiorPop = Math.max(1, ...top.map((t) => t.unidades));
  const ativos = dados.brindes.filter((b) => b.ativo);
  const variacoesAtivas = ativos.reduce((s, b) => s + b.variacoes.length, 0);
  const anteriorFechado = m.mesAnterior in dados.gastoFechado;

  const trocarMes = (novo: string) => {
    setMes(novo);
    setArea(undefined);
  };
  const escolherArea = (chave: string) => setArea((a) => (a === chave ? undefined : chave));

  const Icone = v.sentido === "subiu" ? ArrowUpRight : v.sentido === "caiu" ? ArrowDownRight : Minus;
  const textoVariacao =
    v.sentido === "igual"
      ? `Igual a ${nomeDoMes(m.mesAnterior)}`
      : `${brl(v.diferenca)} ${v.sentido === "subiu" ? "a mais" : "a menos"} que em ${nomeDoMes(m.mesAnterior)}${
          v.percentual !== null ? ` (${v.sentido === "subiu" ? "+" : "−"}${Math.abs(v.percentual).toLocaleString("pt-BR")}%)` : ""
        }`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6" aria-labelledby="met-titulo">
      <h1 id="met-titulo" className="sr-only">
        Métricas
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm font-semibold text-foreground/80" id="met-periodo">
          Período
        </p>
        <div role="group" aria-labelledby="met-periodo" className="flex gap-1">
          {meses.map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={mes === x}
              onClick={() => trocarMes(x)}
              className={`${PILL} min-w-24 ${mes === x ? PILL_ATIVO : PILL_INATIVO}`}
            >
              {rotuloCurto(x)}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{rotuloDoMes(mes)}</p>
      </div>

      {/* KPIs: sempre os mesmos 5 cartões, só os valores mudam. */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1">
          <Kpi
            rotulo={`Gasto em ${nomeDoMes(mes)}`}
            valor={brl(m.gasto)}
            nota={m.fechado ? "Total consolidado do mês fechado." : "Pedidos encerrados no mês."}
          >
            <p className="flex items-start gap-1 font-semibold text-foreground">
              <Icone className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                {textoVariacao}
                {anteriorFechado ? " (total consolidado)" : ""}
              </span>
            </p>
          </Kpi>
        </div>
        <Kpi
          rotulo="Unidades retiradas"
          valor={m.fechado ? "—" : String(m.unidadesRetiradas)}
          nota={m.fechado ? "Sem detalhe neste mês." : "Em pedidos encerrados no mês."}
        />
        <Kpi rotulo="Prontas aguardando retirada" valor={String(m.prontosUnidades)} nota="Unidades em pedidos prontos, hoje." />
        <Kpi
          rotulo="Custo dos prontos aguardando retirada"
          valor={brl(m.custoProntosAguardando)}
          nota="Nada é debitado nesta fase."
        />
        <Kpi
          rotulo="Linhas a avaliar"
          valor={String(m.linhasAAvaliar)}
          nota="Personalizáveis sem orçamento aceito; fora dos totais."
        />
      </div>

      {m.fechado && (
        <p className="mt-4 rounded-2xl border bg-secondary/60 px-4 py-3 text-sm text-foreground/80" role="note">
          {rotuloDoMes(mes)} é um mês fechado: o protótipo mostra só o total consolidado. O detalhamento por área, por solicitante e
          a lista de pedidos não está disponível.
        </p>
      )}

      {!m.fechado && (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <BarrasDeGasto
              titulo="Gasto por área"
              linhas={m.porArea}
              selecionada={area}
              onEscolher={escolherArea}
              vazio="Nenhum pedido encerrado neste mês."
            />
            <BarrasDeGasto titulo="Gasto por solicitante" linhas={m.porSolicitante} vazio="Nenhum pedido encerrado neste mês." />
          </div>

          <section className={`${CARTAO} mt-4`} aria-labelledby="met-lista">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="met-lista" className="font-display text-lg font-bold text-navy">
                Pedidos encerrados em {nomeDoMes(mes)}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {area ? `Área: ${area}` : "Todas as áreas"}
                </p>
                {/* Sempre presente: só habilita com filtro, para a linha não mudar de altura. */}
                <button type="button" disabled={!area} onClick={() => setArea(undefined)} className={BTN_SECUNDARIO}>
                  Limpar filtro
                </button>
              </div>
            </div>
            {pedidos.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {area ? "Nenhum pedido encerrado desta área neste mês." : "Nenhum pedido encerrado neste mês."}
              </p>
            ) : (
              <ul className="mt-3 divide-y">
                {pedidos.map((p) => {
                  const val = valorDoPedido(p);
                  const em = mesDoEncerramentoEm(p);
                  return (
                    <li key={p.id} className="grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <div className="min-w-0">
                        <p className="font-display text-sm font-bold text-navy">
                          {p.id} · {nomeDaPessoa(p.solicitanteId)} <span className="font-normal text-foreground/80">· {p.areaSolicitante || "Sem área"}</span>
                        </p>
                        <p className="truncate text-sm text-foreground/80">{p.finalidade}</p>
                        <p className="text-xs text-muted-foreground">
                          {em ? `Encerrado em ${formatarInstante(em)} · ` : ""}
                          {plural(unidadesDoPedido(p), "unidade", "unidades")}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums sm:text-right">
                        {brl(val.valor)}
                        {val.aAvaliar > 0 && (
                          <span className="block text-xs font-normal text-muted-foreground">
                            {plural(val.aAvaliar, "linha a avaliar", "linhas a avaliar")}
                          </span>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={CARTAO} aria-labelledby="met-alertas">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="met-alertas" className="font-display text-lg font-bold text-navy">
              Alertas de estoque
            </h2>
            <a href={href("gestao/estoque")} className={BTN_SECUNDARIO}>
              Ver o estoque
            </a>
          </div>
          {abaixo.length === 0 && zerados.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nenhum brinde abaixo do mínimo ou esgotado.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {zerados.map((a) => (
                <li key={`z-${a.brindeId}/${a.variacaoId}`} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex h-6 items-center rounded-full bg-destructive px-2.5 font-display text-xs font-bold text-destructive-foreground">
                    Esgotado
                  </span>
                  <span className="font-semibold text-navy">{a.rotulo}</span>
                </li>
              ))}
              {abaixo.map((a) => (
                <li key={`a-${a.brindeId}/${a.variacaoId}`} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex h-6 items-center gap-1 rounded-full bg-warning-soft px-2.5 font-display text-xs font-bold text-foreground ring-1 ring-warning">
                    <AlertTriangle className="size-3" aria-hidden />
                    Abaixo do mínimo
                  </span>
                  <span className="font-semibold text-navy">{a.rotulo}</span>
                  <span className="text-muted-foreground">
                    {a.disponivel} disponíveis, mínimo {a.minimo}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={CARTAO} aria-labelledby="met-estoque">
          <h2 id="met-estoque" className="font-display text-lg font-bold text-navy">
            Estoque em números
          </h2>
          <dl className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Valor em estoque</dt>
              <dd className="font-display text-xl font-bold tabular-nums text-navy">{brl(valorEmEstoque(dados))}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Brindes ativos</dt>
              <dd className="font-display text-xl font-bold tabular-nums text-navy">{ativos.length}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Variações</dt>
              <dd className="font-display text-xl font-bold tabular-nums text-navy">{variacoesAtivas}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className={`${CARTAO} mt-4`} aria-labelledby="met-pop">
        <h2 id="met-pop" className="font-display text-lg font-bold text-navy">
          Brindes mais pedidos
        </h2>
        <p className="text-xs text-muted-foreground">Unidades em pedidos, sem contar recusados e cancelados.</p>
        {top.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Ainda não há pedidos.</p>
        ) : (
          <ol className="mt-3 grid gap-2">
            {top.map((t, i) => {
              const b = brinde(t.brindeId);
              return (
                <li key={t.brindeId} className="flex items-center gap-3">
                  <span className="w-5 text-right font-display text-sm font-bold text-muted-foreground tabular-nums">{i + 1}</span>
                  <div className="size-11 shrink-0 overflow-hidden rounded-xl border">
                    <FotoBrinde src={b?.foto ?? ""} alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="truncate font-display text-sm font-bold text-navy">{b?.nome ?? t.brindeId}</span>
                      <span className="text-sm font-semibold tabular-nums">{plural(t.unidades, "unidade", "unidades")}</span>
                    </p>
                    <span aria-hidden className="mt-1 block h-2 overflow-hidden rounded-full bg-secondary">
                      <span className="block h-full rounded-full bg-sky" style={{ width: `${Math.max(2, (t.unidades / maiorPop) * 100)}%` }} />
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </section>
  );
}
