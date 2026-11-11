/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: requirements.md Requisito 9 (físico, reserva, Disponivel, mínimo e alerta só para a Equipe_da_Loja).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { FotoBrinde } from "../../FotoBrinde";
import type { EstadoTela } from "../../rota";
import { useLoja } from "../../store";
import type { Sku } from "../../tipos";
import { BotaoAcao, CAMPO, Campo, dataHora, Erro, EstadosDaTela, Modal } from "./ui";

export function EstoqueGestao({ estadoTela }: { estadoTela: EstadoTela }) {
  const loja = useLoja();
  const [soAlerta, setSoAlerta] = useState(false);
  const [painel, setPainel] = useState<{ sku: Sku; tipo: "entrada" | "ajuste" } | null>(null);
  const skus = loja.skus.filter((s) => s.tipo === "propriedade");
  const emAlerta = skus.filter((s) => loja.disponivel(s.id) < s.minimoEstoque);
  const lista = soAlerta ? emAlerta : skus;
  const nome = (id: string) => loja.skus.find((s) => s.id === id)?.nome ?? id;

  return (
    <section aria-label="Estoque" className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        {([false, true] as const).map((v) => (
          <button
            key={String(v)}
            type="button"
            aria-pressed={soAlerta === v}
            onClick={() => setSoAlerta(v)}
            className={`h-9 min-w-[150px] rounded-full px-4 font-display text-sm font-bold transition-colors ${soAlerta === v ? "bg-navy-soft text-navy shadow-[0_0_0_2px_var(--sky)]" : "text-foreground/80 hover:bg-navy-soft"}`}
          >
            {v ? `Abaixo do mínimo (${emAlerta.length})` : "Todos os brindes"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Disponível é o saldo físico menos a reserva. Brindes personalizáveis não têm estoque e não aparecem aqui.</p>

      <EstadosDaTela estado={estadoTela} vazio="Nenhum brinde em estoque cadastrado." />
      {!estadoTela && (lista.length === 0 ? (
        <div className="mt-4 rounded-3xl bg-card p-10 text-center text-muted-foreground shadow-[var(--shadow-card)]">Nenhum brinde abaixo do mínimo agora.</div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-3xl bg-card shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Brinde</th>
                <th className="px-3 py-3 text-right font-semibold">Físico</th>
                <th className="px-3 py-3 text-right font-semibold">Reserva</th>
                <th className="px-3 py-3 text-right font-semibold">Disponível</th>
                <th className="px-3 py-3 text-right font-semibold">Mínimo</th>
                <th className="px-3 py-3 font-semibold">Alerta</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => {
                const disp = loja.disponivel(s.id);
                const alerta = disp < s.minimoEstoque;
                return (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-navy-soft/40">
                    <td className="px-5 py-2">
                      <div className="flex items-center gap-3">
                        <FotoBrinde src={s.foto} alt="" className="size-11 shrink-0 rounded-xl p-1" />
                        <span className="font-semibold text-navy">{s.nome}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.saldoFisico}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.reserva}</td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums text-navy">{disp}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.minimoEstoque}</td>
                    <td className="px-3 py-2">
                      {alerta ? (
                        <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--warning-soft,oklch(0.95_0.05_85))] px-3 text-xs font-bold text-[var(--warning-strong)]">
                          <AlertTriangle className="size-3.5" aria-hidden /> Abaixo do mínimo
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Em dia</span>
                      )}
                    </td>
                    <td className="px-5 py-2">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setPainel({ sku: s, tipo: "entrada" })} className="h-8 whitespace-nowrap rounded-full bg-navy-soft px-3 font-display text-xs font-bold text-navy hover:bg-navy-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">Registrar entrada</button>
                        <button type="button" onClick={() => setPainel({ sku: s, tipo: "ajuste" })} className="h-8 whitespace-nowrap rounded-full px-3 font-display text-xs font-bold text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">Ajustar inventário</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {!estadoTela && (
        <div className="mt-6 rounded-3xl bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-lg font-bold text-navy">Movimentações recentes</h2>
          <p className="text-xs text-muted-foreground">Histórico sem edição: cada linha guarda a pessoa e o horário.</p>
          <ul className="mt-3 divide-y">
            {loja.movimentos.slice(0, 8).map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{nome(m.skuId)}</p>
                  <p className="text-xs text-muted-foreground">{m.nota}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-xs text-muted-foreground">{m.pessoa} · {dataHora(m.em)}</span>
                  <span className={`w-14 font-bold tabular-nums ${m.quantidade < 0 ? "text-[oklch(0.5_0.18_25)]" : "text-[var(--success-strong)]"}`}>{m.quantidade > 0 ? "+" : ""}{m.quantidade}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {painel && <ModalMovimento sku={painel.sku} tipo={painel.tipo} onFechar={() => setPainel(null)} />}
    </section>
  );
}

function ModalMovimento({ sku, tipo, onFechar }: { sku: Sku; tipo: "entrada" | "ajuste"; onFechar: () => void }) {
  const loja = useLoja();
  const [valor, setValor] = useState("");
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const atual = loja.skus.find((s) => s.id === sku.id) ?? sku;
  return (
    <Modal titulo={tipo === "entrada" ? `Registrar entrada: ${sku.nome}` : `Ajustar inventário: ${sku.nome}`} onFechar={onFechar}>
      <p className="mb-3 text-sm text-muted-foreground">Saldo físico {atual.saldoFisico} · reserva {atual.reserva} · disponível {atual.saldoFisico - atual.reserva}.</p>
      <Campo rotulo={tipo === "entrada" ? "Quantidade que chegou" : "Novo saldo físico"}>
        <input inputMode="numeric" value={valor} onChange={(e) => setValor(e.target.value)} className={CAMPO} autoFocus />
      </Campo>
      <div className="mt-3">
        <Campo rotulo={tipo === "entrada" ? "Origem ou lote" : "Motivo do ajuste"}>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} className={CAMPO} placeholder={tipo === "entrada" ? "Ex.: Lote 2026-11, fornecedor Brindes Sul" : "Ex.: Contagem de inventário"} />
        </Campo>
      </div>
      {tipo === "ajuste" && <p className="mt-2 text-xs text-muted-foreground">O saldo não pode ficar abaixo da reserva atual ({atual.reserva}).</p>}
      <Erro texto={erro} />
      <div className="mt-4 flex justify-end gap-2">
        <BotaoAcao rotulo="Voltar" variante="secundario" onClick={onFechar} />
        <BotaoAcao
          rotulo={tipo === "entrada" ? "Registrar entrada" : "Salvar ajuste"}
          onClick={() => {
            const n = Number(valor);
            const r = tipo === "entrada" ? loja.registrarEntrada(sku.id, n, texto) : loja.ajustarInventario(sku.id, n, texto);
            if (!r.ok) setErro(r.motivo); else onFechar();
          }}
        />
      </div>
    </Modal>
  );
}
