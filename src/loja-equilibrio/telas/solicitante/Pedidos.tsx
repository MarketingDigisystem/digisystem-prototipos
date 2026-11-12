// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ e loja-digi-store/ (pedidos do solicitante), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 4).
//
// Lista em linhas com filtro e ordenação discretos (faixa de controles fixa) e detalhe que substitui a lista, com "Voltar".
// Orçamento e aceite vivem dentro da linha personalizável. Mensagens em faixas de altura reservada.

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ROTULO_ESTADO, dataCurta, dataHora } from "../../formato";
import { PrecoBrinde } from "../../PrecoBrinde";
import { TotalPedido, textoTotal } from "../../TotalPedido";
import { TRANSICOES, formatarDdMm, valorDoPedido } from "../../regras";
import { href } from "../../rota";
import { useLoja } from "../../store";
import type { EstadoPedido, Pedido } from "../../tipos";
import { estiloEntrada } from "../../movimento";
import { Msg, ParDeslizante, useFaixaRolante } from "../../ui";
import { LinhaDoTempo } from "./LinhaDoTempo";

const PILL =
  "inline-flex h-11 items-center justify-center rounded-full border border-transparent px-4 font-display text-sm font-bold le-cor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:cursor-not-allowed disabled:opacity-50";
const PILL_ATIVO = "bg-navy-soft text-[color:var(--le-ativo)] shadow-[0_0_0_2px_var(--sky)]";
const PILL_INATIVO = "bg-secondary text-foreground/80 hover:bg-navy-soft hover:text-navy";
const CAMPO =
  "h-11 w-full rounded-2xl border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";

type Filtro = "todos" | EstadoPedido;
const FILTROS: Filtro[] = ["todos", "solicitada", "em_alinhamento", "pronto", "encerrada", "recusada", "cancelada"];

function Estado({ e }: { e: EstadoPedido }) {
  const cor =
    e === "recusada" || e === "cancelada"
      ? "bg-secondary text-foreground/80"
      : e === "pronto"
        ? "bg-accent text-[color:var(--on-accent)]"
        : "bg-navy-soft text-[color:var(--le-ativo)]";
  return (
    <span className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 font-display text-xs font-bold ${cor}`}>{ROTULO_ESTADO[e]}</span>
  );
}

export function Pedidos() {
  const loja = useLoja();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [maisNovos, setMaisNovos] = useState(true);
  const [aberto, setAberto] = useState<string | null>(null);
  // Lista ↔ detalhe é uma troca dentro da mesma rota: anima a partir da primeira troca (a entrada da rota é do .le-tela).
  const trocou = useRef(false);
  const abrir = (id: string | null) => {
    trocou.current = true;
    setAberto(id);
  };
  const refFiltros = useFaixaRolante<HTMLDivElement>(filtro);

  const meus = loja.dados.pedidos.filter((p) => p.solicitanteId === loja.pessoa.id);
  const atual = aberto ? meus.find((p) => p.id === aberto) : undefined;
  if (atual) return <Detalhe p={atual} voltar={() => abrir(null)} />;

  const inicio = (p: Pedido) => p.historico[0]?.em ?? "";
  const lista = meus
    .filter((p) => filtro === "todos" || p.estado === filtro)
    .sort((a, b) => (maisNovos ? inicio(b).localeCompare(inicio(a)) : inicio(a).localeCompare(inicio(b))));

  return (
    <section className={`mx-auto max-w-5xl px-4 py-6 sm:px-6 ${trocou.current ? "le-tela" : ""}`}>
      <h1 className="font-display text-3xl font-bold text-navy">Pedidos</h1>
      <p className="mt-1 text-sm text-muted-foreground">Os pedidos de {loja.pessoa.nome}.</p>

      {/* Faixa de controles fixa: filtro rola na horizontal; ordenação fica na extremidade direita. */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div ref={refFiltros} role="group" aria-label="Filtrar por estado" className="le-nav le-rola -mx-1 -my-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 py-1">
          {FILTROS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filtro === f}
              onClick={() => setFiltro(f)}
              className={`${PILL} shrink-0 whitespace-nowrap ${filtro === f ? PILL_ATIVO : PILL_INATIVO}`}
            >
              {f === "todos" ? "Todos" : ROTULO_ESTADO[f]}
            </button>
          ))}
        </div>
        <ParDeslizante<boolean>
          rotulo="Ordenar"
          opcoes={[
            { id: true, rotulo: "Recentes" },
            { id: false, rotulo: "Antigos" },
          ]}
          valor={maisNovos}
          onChange={setMaisNovos}
          className="grid shrink-0 grid-cols-2 gap-0.5 rounded-full bg-secondary p-0.5"
          botaoClassName="h-11 w-[88px] rounded-full font-display text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
        />
      </div>

      <div className="mt-4">
        {meus.length === 0 ? (
          <div className="rounded-2xl bg-secondary p-6 text-sm text-muted-foreground">
            Você ainda não fez nenhum pedido.{" "}
            <a href={href("")} className="font-semibold text-navy underline">
              Ver brindes
            </a>
          </div>
        ) : lista.length === 0 ? (
          <p className="rounded-2xl bg-secondary p-6 text-sm text-muted-foreground">Nenhum pedido neste estado.</p>
        ) : (
          <ul className="space-y-2">
            {lista.map((p, i) => {
              const v = valorDoPedido(p);
              const unidades = p.linhas.reduce((n, l) => n + l.qtd, 0);
              return (
                <li key={p.id} className="le-entra" style={estiloEntrada(i)}>
                  <button
                    type="button"
                    onClick={() => abrir(p.id)}
                    className="le-btn flex min-h-14 w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-left shadow-card hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p title={`${p.id} · ${p.finalidade}`} className="line-clamp-2 break-words font-display text-base font-bold leading-snug text-navy">
                        {p.id} · {p.finalidade}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dataCurta(inicio(p))} · {unidades} {unidades === 1 ? "unidade" : "unidades"}
                        {v.aAvaliar > 0 ? ` · ${v.aAvaliar} a avaliar` : ""}
                      </p>
                      {/* Abaixo de sm o selo de estado desce para a linha de baixo, sem tomar largura do título. */}
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 sm:hidden">
                        <Estado e={p.estado} />
                        <span className="text-sm font-semibold tabular-nums">{textoTotal(v.valor, v.aAvaliar)}</span>
                      </span>
                    </div>
                    <span className="hidden shrink-0 text-sm font-semibold tabular-nums sm:inline">{textoTotal(v.valor, v.aAvaliar)}</span>
                    <span className="hidden sm:inline-flex">
                      <Estado e={p.estado} />
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function Detalhe({ p, voltar }: { p: Pedido; voltar: () => void }) {
  const loja = useLoja();
  const [motivo, setMotivo] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const v = valorDoPedido(p);
  const podeCancelar = TRANSICOES[p.estado].includes("cancelada");

  const aceitar = (i: number) => {
    const r = loja.aceitarOrcamento(p.id, i);
    setMsg(r.ok ? { ok: true, texto: "Orçamento aceito." } : { ok: false, texto: r.motivo });
  };
  const cancelar = () => {
    const r = loja.mudarEstado(p.id, "cancelada", motivo);
    if (r.ok) {
      setMotivo("");
      setMsg({ ok: true, texto: "Pedido cancelado. As reservas foram liberadas." });
    } else setMsg({ ok: false, texto: r.motivo });
  };

  return (
    <section className="le-tela mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <button
        type="button"
        onClick={voltar}
        className="le-btn inline-flex h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Pedidos
      </button>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-navy">
          {p.id} · {p.finalidade}
        </h1>
        <Estado e={p.estado} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {p.destino ? `Destino: ${p.destino}. ` : ""}
        {p.dataDesejada ? `Data desejada: ${formatarDdMm(p.dataDesejada)}.` : "Sem data desejada."}
      </p>
      {p.observacao && <p className="mt-1 text-sm text-foreground/85">Observação: {p.observacao}</p>}

      {p.estado === "recusada" || p.estado === "cancelada" ? (
        <p className="mt-4 rounded-2xl bg-secondary p-4 text-sm font-semibold text-foreground/85">
          Pedido {p.estado === "recusada" ? "recusado" : "cancelado"}
          {p.historico[p.historico.length - 1]?.motivo ? `: ${p.historico[p.historico.length - 1].motivo}` : "."}
        </p>
      ) : null}

      <div className="mt-5">
        <LinhaDoTempo atual={p.estado} historico={p.historico} />
      </div>

      <h2 className="mb-2 mt-6 font-display text-lg font-bold text-navy">Itens</h2>
      <ul className="space-y-2">
        {p.linhas.map((l, i) => {
          const b = loja.brinde(l.brindeId);
          const extra = [l.personalizacao?.texto, l.personalizacao?.arte ? `Arte: ${l.personalizacao.arte}` : ""].filter(Boolean).join(" · ");
          const personalizavel = l.tipo === "personalizavel";
          const temOrcamento = l.orcamentoUnitario !== undefined;
          return (
            <li key={`${l.brindeId}-${i}`} className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-navy">{b?.nome ?? "Brinde"}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.qtd} {l.qtd === 1 ? "unidade" : "unidades"}
                  </p>
                  {extra && <p className="mt-1 text-xs text-foreground/80">{extra}</p>}
                  {l.notaAjuste && <p className="mt-1 text-xs text-foreground/80">Ajuste do Marketing: {l.notaAjuste}</p>}
                </div>
                {/* Estoque: custo gravado na linha. Personalizável: orçamento aceito; antes disso, sem valor em reais. */}
                <PrecoBrinde modo="linha" linha={l} className="max-w-[12rem] text-right" />
              </div>
              {personalizavel && temOrcamento && !l.orcamentoAceito && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-secondary p-3">
                  <p className="min-w-0 flex-1 text-sm text-foreground/85">O Marketing informou um orçamento para esta linha. Aceite para o pedido seguir.</p>
                  <button
                    type="button"
                    disabled={p.estado !== "em_alinhamento"}
                    onClick={() => aceitar(i)}
                    className="le-btn inline-flex h-11 shrink-0 items-center rounded-full bg-navy px-5 font-display text-sm font-bold text-navy-foreground hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Aceitar orçamento
                  </button>
                </div>
              )}
              {personalizavel && temOrcamento && l.orcamentoAceito && (
                <p className="le-msg mt-2 text-xs font-semibold text-[color:var(--success-strong)]">Orçamento aceito.</p>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-3">
        <TotalPedido total={v.valor} aAvaliar={v.aAvaliar} rotulo="Valor do pedido" className="rounded-2xl bg-secondary px-4 py-3" />
      </div>

      {/* Faixa de feedback com altura reservada. */}
      <p
        role={msg ? (msg.ok ? "status" : "alert") : undefined}
        className={`min-h-10 text-sm font-semibold ${msg?.ok ? "text-[color:var(--success-strong)]" : "text-[color:var(--destructive-strong)]"}`}
      >
        <Msg texto={msg?.texto} />
      </p>

      <h2 className="mb-2 mt-4 font-display text-lg font-bold text-navy">Histórico</h2>
      <ul className="space-y-1.5 text-sm">
        {p.historico.map((h, i) => (
          <li key={i} className="rounded-xl bg-secondary px-3 py-2">
            <span className="font-semibold text-navy">{ROTULO_ESTADO[h.estado]}</span>
            <span className="text-muted-foreground">
              {" "}
              · {dataHora(h.em)} · {loja.nomeDaPessoa(h.quem)}
            </span>
            {(h.nota || h.motivo) && <span className="block text-xs text-foreground/80">{h.nota ?? h.motivo}</span>}
          </li>
        ))}
      </ul>

      {podeCancelar && (
        <div className="mt-6 rounded-3xl border p-4">
          <label className="block text-sm">
            <span className="mb-1 block font-display font-bold text-navy">Motivo do cancelamento *</span>
            <input className={CAMPO} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: o evento foi adiado" />
          </label>
          <button
            type="button"
            onClick={cancelar}
            className="le-btn mt-3 inline-flex h-11 items-center rounded-full border border-destructive px-5 font-display text-sm font-bold text-[color:var(--destructive-strong)] hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
          >
            Cancelar pedido
          </button>
        </div>
      )}
    </section>
  );
}
