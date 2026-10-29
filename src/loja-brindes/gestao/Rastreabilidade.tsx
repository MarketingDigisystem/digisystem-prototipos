// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Rastreabilidade: gasto por centro de custo (débito acontece na entrega) e histórico de
// movimentações por item (quem, quando, quanto, destino).

import { ArrowDownRight, ArrowUpRight, Flag, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FotoProduto } from "../FotoProduto";
import { useLoja } from "../estado";
import { dataCurta, dataHora, moeda, nomeMes } from "../formato";
import { CENTROS_CUSTO, usuario } from "../mock";
import { custoPedido, dataEncerramento, disponivel, gastoPorCentro, unidadesPedido } from "../regras";
import { navegar, trocarParams, type RotaLoja } from "../rota";
import type { CentroCustoId, TipoMov } from "../tipos";
import { classeInput, ParPills, Selo } from "../ui";
import { GestaoShell, Kpi } from "./GestaoShell";

const PERIODOS = ["2026-10", "2026-09", "2026-08"];
const TIPO: Record<TipoMov, { rotulo: string; icone: ReactNode; tom: "ok" | "info" | "apoio" | "neutro" | "atencao" }> = {
  "saldo-inicial": { rotulo: "Saldo inicial", icone: <Flag className="size-3.5" aria-hidden />, tom: "neutro" },
  entrada: { rotulo: "Entrada", icone: <ArrowUpRight className="size-3.5 text-success" aria-hidden />, tom: "ok" },
  saida: { rotulo: "Saída", icone: <ArrowDownRight className="size-3.5" aria-hidden />, tom: "info" },
  ajuste: { rotulo: "Ajuste", icone: <SlidersHorizontal className="size-3.5 text-warning" aria-hidden />, tom: "atencao" },
};

export function Rastreabilidade({ rota }: { rota: RotaLoja }) {
  const { estado } = useLoja();
  const per = PERIODOS.includes(rota.params.get("per") ?? "") ? rota.params.get("per")! : PERIODOS[0];
  const cc = (rota.params.get("cc") as CentroCustoId | null) ?? null;
  const item = estado.produtos.find((p) => p.slug === (rota.params.get("item") ?? "garrafa-termica")) ?? estado.produtos[0];
  const gasto = gastoPorCentro(estado.pedidos, per);
  const maximo = Math.max(1, ...Object.values(gasto).map((g) => g.valor));
  const totalMes = Object.values(gasto).reduce((s, g) => s + g.valor, 0);
  const unidadesMes = Object.values(gasto).reduce((s, g) => s + g.unidades, 0);
  const anterior = PERIODOS[PERIODOS.indexOf(per) + 1];
  const totalAnterior = anterior ? Object.values(gastoPorCentro(estado.pedidos, anterior)).reduce((s, g) => s + g.valor, 0) : 0;

  const movs = estado.movimentos.filter((m) => m.produtoId === item.id).sort((a, b) => b.em.localeCompare(a.em));
  const saldoInicial = movs.filter((m) => m.tipo === "saldo-inicial").reduce((s, m) => s + m.qtd, 0);
  const entradas = movs.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.qtd, 0);
  const saidas = -movs.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.qtd, 0);
  const ajustes = movs.filter((m) => m.tipo === "ajuste").reduce((s, m) => s + m.qtd, 0);
  const dispAgora = item.variacoes.reduce((s, v) => s + disponivel(item, v, estado.pedidos), 0);

  const encerrados = estado.pedidos
    .filter((p) => p.status === "encerrado" && dataEncerramento(p)?.startsWith(per) && (!cc || p.centroCustoId === cc))
    .sort((a, b) => (dataEncerramento(b) ?? "").localeCompare(dataEncerramento(a) ?? ""));

  return (
    <GestaoShell titulo="Rastreabilidade e custos" descricao="Quanto cada área gastou e para onde foi cada brinde. O gasto conta na retirada, quando o pedido encerra.">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <ParPills rotulo="Período" valor={per} onChange={(v) => trocarParams({ per: v === PERIODOS[0] ? undefined : v })}
          opcoes={PERIODOS.map((p) => ({ valor: p, rotulo: nomeMes(p) }))} />
        {per !== PERIODOS[0] && <p className="text-[13px] text-muted-foreground">Mês fechado: valores do histórico.</p>}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi rotulo={`Gasto em ${nomeMes(per).toLowerCase()}`} valor={moeda(totalMes)} detalhe={anterior ? `${nomeMes(anterior)}: ${moeda(totalAnterior)}` : undefined} />
        <Kpi rotulo="Unidades retiradas" valor={String(unidadesMes)} />
        <Kpi rotulo="Pronto, aguardando retirada" valor={String(estado.pedidos.filter((p) => p.status === "pronto").reduce((s, p) => s + unidadesPedido(p), 0))} detalhe="já baixado do estoque" />
        <Kpi rotulo="A debitar na retirada" valor={moeda(estado.pedidos.filter((p) => p.status === "pronto").reduce((s, p) => s + custoPedido(p), 0))} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="min-w-0 rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-[18px] font-bold">Gasto por centro de custo</h2>
            {cc && <button type="button" onClick={() => trocarParams({ cc: undefined })} className="font-display text-[13px] font-bold text-primary hover:underline">Ver todos</button>}
          </div>
          <ul className="space-y-3">
            {CENTROS_CUSTO.map((c) => {
              const g = gasto[c.id];
              const ativo = cc === c.id;
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => trocarParams({ cc: ativo ? undefined : c.id })} aria-pressed={ativo}
                    className={cn("w-full rounded-2xl p-3 text-left transition-colors", ativo ? "bg-navy-soft ring-1 ring-primary/40" : "hover:bg-secondary", cc && !ativo && "opacity-60")}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-display text-[15px] font-bold">{c.id} <span className="font-semibold text-muted-foreground">· {c.area} · {usuario(c.diretorId).nome}</span></span>
                      <span className="font-display text-[17px] font-bold tabular-nums">{moeda(g.valor)}</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(g.valor / maximo) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">{g.pedidos} {g.pedidos === 1 ? "pedido" : "pedidos"} · {g.unidades} unidades</p>
                  </button>
                </li>
              );
            })}
          </ul>

          <h3 className="mb-3 mt-6 font-display text-[16px] font-bold">Pedidos retirados em {nomeMes(per).toLowerCase()}{cc ? ` · ${cc}` : ""}</h3>
          {encerrados.length ? (
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {encerrados.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => navegar("/loja/gestao/pedidos", { status: "encerrados", pedido: p.id })} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary">
                    <span className="w-12 shrink-0 font-display text-[13px] font-bold tabular-nums text-muted-foreground">{dataCurta(dataEncerramento(p)!)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{p.destino}</span>
                      <span className="text-[12.5px] text-muted-foreground">{p.id} · {p.centroCustoId} · {unidadesPedido(p)} un.</span>
                    </span>
                    <span className="shrink-0 font-display text-[14.5px] font-bold tabular-nums">{moeda(custoPedido(p))}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-secondary p-4 text-[13.5px] text-muted-foreground">
              {per === PERIODOS[0] ? "Nenhum pedido retirado neste filtro ainda." : "O detalhe por pedido dos meses fechados fica no histórico. Aqui aparecem só os totais."}
            </p>
          )}
        </section>

        <section className="min-w-0 rounded-3xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-[18px] font-bold">Para onde foram os brindes</h2>
          <p className="mb-4 text-[13.5px] text-muted-foreground">Histórico de cada movimentação do item: saldo inicial, entrada, saída e ajuste. Saldo inicial + entradas − saídas ± ajustes = saldo atual.</p>
          <label className="mb-4 flex flex-col gap-1.5">
            <span className="font-display text-[13.5px] font-bold">Item</span>
            <select value={item.slug} onChange={(e) => trocarParams({ item: e.target.value })} className={classeInput}>
              {estado.produtos.map((p) => <option key={p.id} value={p.slug}>{p.nome}</option>)}
            </select>
          </label>
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-secondary p-3">
            <FotoProduto produto={item} tamanho="mini" className="size-14 shrink-0 rounded-xl" />
            <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-1 text-[12.5px] sm:grid-cols-5">
              <Mini rotulo="Inicial" valor={String(saldoInicial)} />
              <Mini rotulo="Entradas" valor={`+${entradas}`} />
              <Mini rotulo="Saídas" valor={`−${saidas}`} />
              <Mini rotulo="Ajustes" valor={`${ajustes >= 0 ? "+" : "−"}${Math.abs(ajustes)}`} />
              <Mini rotulo="Disponível" valor={String(dispAgora)} />
            </dl>
          </div>
          {movs.length ? (
            <ol className="relative space-y-0">
              {movs.map((m, i) => {
                const t = TIPO[m.tipo];
                const v = item.variacoes.find((x) => x.id === m.variacaoId);
                const efeito = "";
                return (
                  <li key={m.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < movs.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 bg-border" aria-hidden />}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary">{t.icone}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Selo tom={t.tom}>{t.rotulo}</Selo>
                        <span className="font-display text-[15px] font-bold tabular-nums">{m.qtd > 0 ? "+" : "−"}{Math.abs(m.qtd)}{efeito}</span>
                        {v && v.rotulo !== "Único" && <span className="text-[13px] text-muted-foreground">{v.rotulo}</span>}
                      </div>
                      <p className="mt-0.5 text-[14px]">
                        {m.destino}
                        {m.pedidoId && (
                          <> · <button type="button" onClick={() => navegar("/loja/gestao/pedidos", { pedido: m.pedidoId })} className="font-semibold text-primary hover:underline">{m.pedidoId}</button></>
                        )}
                      </p>
                      <p className="text-[12.5px] text-muted-foreground">{dataHora(m.em)} · {usuario(m.porId).nome}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : <p className="rounded-2xl bg-secondary p-4 text-[13.5px] text-muted-foreground">Sem movimentações registradas para este item.</p>}
        </section>
      </div>
    </GestaoShell>
  );
}

function Mini({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="font-display text-[16px] font-bold tabular-nums text-foreground">{valor}</dd>
    </div>
  );
}
