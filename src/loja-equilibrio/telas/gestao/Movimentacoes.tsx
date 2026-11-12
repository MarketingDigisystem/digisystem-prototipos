// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ (movimentações) e regras.ts desta pasta (historicoBrinde), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 4.5, 5.4).
//
// Movimentações: histórico por brinde (saldo inicial + entradas − saídas ± ajustes = saldo atual, com selo da conta) e visão geral recente.

import { useMemo, useState } from "react";
import { historicoBrinde } from "../../regras";
import { useLoja } from "../../store";
import type { Movimentacao, TipoMovimentacao } from "../../tipos";
import { CAMPO, formatarInstante } from "./comum";

const ROTULO: Record<TipoMovimentacao, string> = {
  saldo_inicial: "Saldo inicial",
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
};

function textoQtd(m: Movimentacao): string {
  if (m.tipo === "saida") return `−${m.qtd}`;
  if (m.tipo === "ajuste") return m.qtd > 0 ? `+${m.qtd}` : `−${Math.abs(m.qtd)}`;
  return `+${m.qtd}`;
}

function corQtd(m: Movimentacao): string {
  const negativo = m.tipo === "saida" || (m.tipo === "ajuste" && m.qtd < 0);
  return negativo ? "text-destructive" : "text-foreground";
}

function Conta({ rotulo, valor, forte }: { rotulo: string; valor: string; forte?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${forte ? "bg-navy-soft" : "bg-card"}`}>
      <p className="text-[11px] font-semibold text-muted-foreground">{rotulo}</p>
      <p className="font-display text-xl font-bold tabular-nums text-navy">{valor}</p>
    </div>
  );
}

function ItemMov({ m, rotuloExtra }: { m: Movimentacao; rotuloExtra?: string }) {
  const { nomeDaPessoa, brinde } = useLoja();
  const b = brinde(m.brindeId);
  const v = b?.variacoes.find((x) => x.id === m.variacaoId);
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-b px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold">
          {ROTULO[m.tipo]}
          {rotuloExtra ? <span className="font-normal text-foreground/80"> · {rotuloExtra}</span> : null}
          <span className="font-normal text-foreground/80"> · {v?.rotulo ?? m.variacaoId}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {nomeDaPessoa(m.quem)} · {formatarInstante(m.em)}
          {m.pedidoId ? ` · pedido ${m.pedidoId}` : ""}
        </p>
        {m.nota && <p className="text-xs text-foreground/80">{m.nota}</p>}
      </div>
      <p className={`font-display text-lg font-bold tabular-nums ${corQtd(m)}`}>{textoQtd(m)}</p>
    </li>
  );
}

export function Movimentacoes() {
  const { dados, brinde } = useLoja();
  const comSaldo = useMemo(() => dados.brindes.filter((b) => b.tipo === "estoque"), [dados.brindes]);
  const [escolhido, setEscolhido] = useState(comSaldo[0]?.id ?? "");
  const h = escolhido && comSaldo.some((b) => b.id === escolhido) ? historicoBrinde(dados, escolhido) : null;
  const recentes = useMemo(
    () => [...dados.movimentacoes].sort((a, b) => b.em.localeCompare(a.em) || b.id.localeCompare(a.id, "pt-BR", { numeric: true })).slice(0, 10),
    [dados.movimentacoes],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6" aria-labelledby="mov-titulo">
      <h1 id="mov-titulo" className="sr-only">
        Movimentações de estoque
      </h1>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <label className="block max-w-sm">
            <span className="mb-1 block text-xs font-semibold text-foreground/80">Brinde</span>
            <select value={escolhido} onChange={(e) => setEscolhido(e.target.value)} className={CAMPO}>
              {comSaldo.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </label>

          {h && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                <Conta rotulo="Saldo inicial" valor={String(h.saldoInicial)} />
                <Conta rotulo="+ Entradas" valor={String(h.entradas)} />
                <Conta rotulo="− Saídas" valor={String(h.saidas)} />
                <Conta rotulo="± Ajustes" valor={h.ajustes > 0 ? `+${h.ajustes}` : String(h.ajustes)} />
                <Conta rotulo="= Saldo calculado" valor={String(h.saldoCalculado)} forte />
                <Conta rotulo="Saldo atual" valor={String(h.saldoAtual)} forte />
              </div>
              <div className="mt-2 flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1">
                <span
                  className={`inline-flex h-7 items-center rounded-full px-3 font-display text-sm font-bold ${h.fecha ? "bg-success-soft text-foreground ring-1 ring-success" : "bg-destructive text-destructive-foreground"}`}
                >
                  {h.fecha ? "A conta fecha" : "Não fecha"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Reservado {h.reserva} · disponível {h.disponivel}
                </span>
              </div>

              <h2 className="mb-2 mt-3 font-display text-lg font-bold text-navy">Histórico de {brinde(escolhido)?.nome}</h2>
              {h.movimentacoes.length === 0 ? (
                <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">Ainda não há movimentações para este brinde.</p>
              ) : (
                <ul className="overflow-hidden rounded-3xl border bg-card shadow-card">
                  {[...h.movimentacoes].reverse().map((m) => (
                    <ItemMov key={m.id} m={m} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 font-display text-lg font-bold text-navy">Últimas movimentações</h2>
          {recentes.length === 0 ? (
            <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
          ) : (
            <ul className="overflow-hidden rounded-3xl border bg-card shadow-card">
              {recentes.map((m) => (
                <ItemMov key={m.id} m={m} rotuloExtra={brinde(m.brindeId)?.nome} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
