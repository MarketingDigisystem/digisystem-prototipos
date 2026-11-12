// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ (fila da gestão) e regras.ts desta pasta (TRANSICOES, urgencia, valorDoPedido), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 4, 5.4).
//
// Fila de pedidos. A lista fica numa coluna e o detalhe numa coluna de largura fixa (lg) ou folha lateral fixa (abaixo de lg):
// selecionar um pedido nunca empurra a lista. Rodapé de ações ancorado no fim do painel, com o campo de motivo sempre presente.

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { TRANSICOES, hojeDe, unidadesDoPedido, urgencia, valorDoPedido } from "../../regras";
import { useLoja } from "../../store";
import type { EstadoPedido, LinhaPedido, Pedido } from "../../tipos";
import {
  BTN_LARANJA,
  BTN_PRIMARIO,
  BTN_SECUNDARIO,
  CAMPO,
  Contador,
  ErroInline,
  PILL,
  PILL_ATIVO,
  PILL_INATIVO,
  ROTULO_ESTADO,
  SeloEstado,
  SeloUrgencia,
  brl,
  formatarInstante,
} from "./comum";

type Filtro = "todos" | EstadoPedido;
const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "solicitada", rotulo: "Solicitadas" },
  { id: "em_alinhamento", rotulo: "Em alinhamento" },
  { id: "pronto", rotulo: "Prontos" },
  { id: "encerrada", rotulo: "Encerrados" },
  { id: "recusada", rotulo: "Recusados" },
  { id: "cancelada", rotulo: "Cancelados" },
];

const ATIVOS: EstadoPedido[] = ["solicitada", "em_alinhamento", "pronto"];
const RANK_URGENCIA = { atrasada: 0, urgente: 1, proxima: 2, normal: 3, sem_data: 4 } as const;

function textoValor(p: Pedido): string {
  const v = valorDoPedido(p);
  if (v.aAvaliar > 0 && v.valor === 0) return "a avaliar";
  return v.aAvaliar > 0 ? `${brl(v.valor)} + a avaliar` : brl(v.valor);
}

/* ------------------------------ Linha do detalhe ------------------------------ */

function LinhaDetalhe({ pedido, indice, linha }: { pedido: Pedido; indice: number; linha: LinhaPedido }) {
  const loja = useLoja();
  const b = loja.brinde(linha.brindeId);
  const v = b?.variacoes.find((x) => x.id === linha.variacaoId);
  const [valor, setValor] = useState(linha.orcamentoUnitario !== undefined ? String(linha.orcamentoUnitario) : "");
  const [qtd, setQtd] = useState(String(linha.qtd));
  const [nota, setNota] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const ajustavel = pedido.estado === "solicitada" || pedido.estado === "em_alinhamento";
  const orcavel = linha.tipo === "personalizavel" && pedido.estado === "em_alinhamento";

  const informar = () => {
    const r = loja.informarOrcamento(pedido.id, indice, Number(valor.replace(",", ".")));
    setErro(r.ok ? null : r.motivo);
  };
  const ajustar = () => {
    const r = loja.ajustarQuantidadeLinha(pedido.id, indice, Number(qtd), nota);
    if (r.ok) setNota("");
    setErro(r.ok ? null : r.motivo);
  };

  return (
    <li className="rounded-2xl border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-base font-bold text-navy">{b?.nome ?? linha.brindeId}</p>
          <p className="text-xs text-muted-foreground">
            {v?.rotulo ?? linha.variacaoId} · {linha.tipo === "estoque" ? "em estoque" : "personalizável"}
          </p>
        </div>
        <p className="shrink-0 text-right text-sm font-semibold">
          {linha.qtd} un.
          <span className="block text-xs font-normal text-muted-foreground">
            {linha.tipo === "estoque"
              ? brl((linha.custoUnitarioNaHora ?? 0) * linha.qtd)
              : linha.orcamentoAceito && linha.orcamentoUnitario !== undefined
                ? brl(linha.orcamentoUnitario * linha.qtd)
                : "a avaliar"}
          </span>
        </p>
      </div>
      {linha.personalizacao?.texto && <p className="mt-1 text-xs text-foreground/80">Texto: {linha.personalizacao.texto}</p>}
      {linha.personalizacao?.arte && <p className="text-xs text-foreground/80">Arte: {linha.personalizacao.arte}</p>}
      {linha.notaAjuste && <p className="mt-1 text-xs text-muted-foreground">Último ajuste: {linha.notaAjuste}</p>}

      {linha.tipo === "personalizavel" && (
        <p className="mt-2 text-xs font-semibold text-foreground/80">
          {linha.orcamentoAceito
            ? "Orçamento aceito pelo diretor."
            : linha.orcamentoUnitario !== undefined
              ? "Orçamento informado, aguardando o aceite do diretor."
              : "Orçamento ainda não informado."}
        </p>
      )}

      {(orcavel || ajustavel) && (
        <div className="mt-2 grid gap-2 border-t pt-2">
          {orcavel && (
            <div className="flex items-end gap-2">
              <label className="block min-w-0 flex-1">
                <span className="mb-1 block text-xs font-semibold text-foreground/80">Valor unitário (R$)</span>
                <input
                  inputMode="decimal"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className={CAMPO}
                />
              </label>
              <button type="button" onClick={informar} className={BTN_SECUNDARIO}>
                Informar orçamento
              </button>
            </div>
          )}
          {ajustavel && (
            <div className="grid gap-2">
              <div className="flex items-end gap-2">
                <label className="block w-24 shrink-0">
                  <span className="mb-1 block text-xs font-semibold text-foreground/80">Quantidade</span>
                  <input type="number" min={1} value={qtd} onChange={(e) => setQtd(e.target.value)} className={CAMPO} />
                </label>
                <label className="block min-w-0 flex-1">
                  <span className="mb-1 block text-xs font-semibold text-foreground/80">Nota do ajuste</span>
                  <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Motivo da mudança" className={CAMPO} />
                </label>
              </div>
              <button type="button" onClick={ajustar} className={`${BTN_SECUNDARIO} justify-self-start`}>
                Ajustar quantidade
              </button>
            </div>
          )}
          <ErroInline texto={erro} />
        </div>
      )}
    </li>
  );
}

/* ------------------------------ Painel de detalhe ------------------------------ */

function Detalhe({ pedido, onFechar }: { pedido: Pedido; onFechar: () => void }) {
  const loja = useLoja();
  const hoje = hojeDe(loja.dados);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const alvos = TRANSICOES[pedido.estado];
  const ativo = ATIVOS.includes(pedido.estado);
  const pedeMotivo = alvos.includes("recusada") || alvos.includes("cancelada");

  const mudar = (alvo: EstadoPedido) => {
    const r = loja.mudarEstado(pedido.id, alvo, motivo);
    if (r.ok) setMotivo("");
    setErro(r.ok ? null : r.motivo);
  };

  const principal = alvos.find((a) => a === "em_alinhamento" || a === "pronto" || a === "encerrada");
  const ROTULO_ACAO: Partial<Record<EstadoPedido, string>> = {
    em_alinhamento: "Colocar em alinhamento",
    pronto: "Pronto para retirada",
    encerrada: "Encerrar",
    recusada: "Recusar",
    cancelada: "Cancelar pedido",
  };
  const secundarios = alvos.filter((a) => a !== principal);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">Pedido {pedido.id}</p>
          <h2 className="font-display text-xl font-bold leading-tight text-navy">{loja.nomeDaPessoa(pedido.solicitanteId)}</h2>
          <p className="text-xs text-muted-foreground">{pedido.areaSolicitante || "Sem área"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SeloEstado estado={pedido.estado} />
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar detalhe"
            className="grid size-11 place-items-center rounded-full hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky lg:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Finalidade</dt>
            <dd>{pedido.finalidade}</dd>
          </div>
          {pedido.destino && (
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Destino</dt>
              <dd>{pedido.destino}</dd>
            </div>
          )}
          {pedido.observacao && (
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">Observação</dt>
              <dd>{pedido.observacao}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Data desejada</dt>
            <dd>
              <SeloUrgencia urgencia={urgencia(pedido.dataDesejada, hoje)} data={pedido.dataDesejada} ativo={ativo} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">Valor</dt>
            <dd className="font-semibold">{textoValor(pedido)}</dd>
          </div>
        </dl>

        <section aria-label="Itens do pedido">
          <h3 className="mb-2 font-display text-base font-bold text-navy">Itens</h3>
          <ul className="grid gap-2">
            {pedido.linhas.map((l, i) => (
              <LinhaDetalhe key={`${pedido.id}-${i}-${l.qtd}-${l.orcamentoUnitario ?? ""}`} pedido={pedido} indice={i} linha={l} />
            ))}
          </ul>
        </section>

        <section aria-label="Histórico do pedido">
          <h3 className="mb-2 font-display text-base font-bold text-navy">Histórico</h3>
          <ol className="grid gap-2 border-l-2 border-sky pl-3">
            {pedido.historico.map((h, i) => (
              <li key={i} className="text-sm">
                <p className="font-semibold">
                  {ROTULO_ESTADO[h.estado]} <span className="font-normal text-muted-foreground">· {loja.nomeDaPessoa(h.quem)}</span>
                </p>
                <p className="text-xs text-muted-foreground">{formatarInstante(h.em)}</p>
                {h.motivo && <p className="text-xs">Motivo: {h.motivo}</p>}
                {h.nota && <p className="text-xs">{h.nota}</p>}
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Rodapé ancorado: o campo de motivo está sempre aqui e a mensagem tem faixa reservada. */}
      <footer className="border-t px-5 py-3">
        {alvos.length === 0 ? (
          <p className="min-h-11 py-3 text-sm text-muted-foreground">Pedido {ROTULO_ESTADO[pedido.estado].toLowerCase()}: nada a fazer.</p>
        ) : (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground/80">
                {pedeMotivo ? "Motivo (obrigatório para recusar ou cancelar)" : "Motivo"}
              </span>
              <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                disabled={!pedeMotivo}
                placeholder={pedeMotivo ? "Explique para o diretor" : "Não se aplica neste estado"}
                className={CAMPO}
              />
            </label>
            <ErroInline texto={erro} className="mt-1" />
            <div className="flex flex-wrap gap-2">
              {principal && (
                <button type="button" onClick={() => mudar(principal)} className={principal === "pronto" ? BTN_LARANJA : BTN_PRIMARIO}>
                  {ROTULO_ACAO[principal]}
                </button>
              )}
              {secundarios.map((a) => (
                <button key={a} type="button" onClick={() => mudar(a)} className={BTN_SECUNDARIO}>
                  {ROTULO_ACAO[a]}
                </button>
              ))}
            </div>
          </>
        )}
      </footer>
    </div>
  );
}

/* ---------------------------------- Tela ---------------------------------- */

export function Fila() {
  const loja = useLoja();
  const { dados } = loja;
  const hoje = hojeDe(dados);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const contagem = useMemo(() => {
    const c: Record<Filtro, number> = { todos: dados.pedidos.length, solicitada: 0, em_alinhamento: 0, pronto: 0, encerrada: 0, recusada: 0, cancelada: 0 };
    for (const p of dados.pedidos) c[p.estado] += 1;
    return c;
  }, [dados.pedidos]);

  const lista = useMemo(() => {
    const filtrados = dados.pedidos.filter((p) => filtro === "todos" || p.estado === filtro);
    const chave = (p: Pedido) => {
      const ativo = ATIVOS.includes(p.estado);
      return ativo ? RANK_URGENCIA[urgencia(p.dataDesejada, hoje)] : 9;
    };
    return [...filtrados].sort(
      (a, b) =>
        chave(a) - chave(b) ||
        (a.dataDesejada ?? "9999").localeCompare(b.dataDesejada ?? "9999") ||
        b.id.localeCompare(a.id, "pt-BR", { numeric: true }),
    );
  }, [dados.pedidos, filtro, hoje]);

  const atual = dados.pedidos.find((p) => p.id === selecionado) ?? null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6" aria-labelledby="fila-titulo">
      <h1 id="fila-titulo" className="sr-only">
        Fila de pedidos
      </h1>

      <div role="group" aria-label="Filtrar por estado" className="le-nav overflow-x-auto">
        <div className="flex w-max items-center gap-1">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`${PILL} ${filtro === f.id ? PILL_ATIVO : PILL_INATIVO}`}
            >
              {f.rotulo}
              <Contador n={contagem[f.id]} />
            </button>
          ))}
        </div>
      </div>

      <p className="flex min-h-9 items-center text-xs text-muted-foreground" aria-live="polite">
        {lista.length === 1 ? "1 pedido" : `${lista.length} pedidos`}, os mais urgentes primeiro.
      </p>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-5">
        <div>
          {lista.length === 0 ? (
            <div className="rounded-3xl border bg-card p-8 text-center shadow-card">
              <h2 className="font-display text-xl font-bold text-navy">Nenhum pedido neste filtro</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Escolha outro estado para ver os pedidos.</p>
            </div>
          ) : (
            <ul className="grid gap-2">
              {lista.map((p) => {
                const ativo = ATIVOS.includes(p.estado);
                const marcado = p.id === selecionado;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={marcado}
                      onClick={() => setSelecionado(p.id)}
                      className={`grid w-full min-h-[44px] gap-x-4 gap-y-1 rounded-2xl border bg-card p-3 text-left shadow-card transition-shadow hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky motion-reduce:transition-none md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center ${marcado ? "ring-2 ring-sky" : ""}`}
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-base font-bold text-navy">
                          {loja.nomeDaPessoa(p.solicitanteId)} <span className="text-xs font-normal text-muted-foreground">· {p.id}</span>
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {p.areaSolicitante || "Sem área"} · {p.finalidade}
                        </span>
                      </span>
                      <span className="min-w-0 text-sm">
                        <span className="font-semibold">{textoValor(p)}</span>
                        <span className="block text-xs text-muted-foreground">
                          {unidadesDoPedido(p)} un. · {p.linhas.length === 1 ? "1 item" : `${p.linhas.length} itens`}
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2 md:justify-end">
                        <SeloUrgencia urgencia={urgencia(p.dataDesejada, hoje)} data={p.dataDesejada} ativo={ativo} />
                        <SeloEstado estado={p.estado} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Mesmo elemento nos dois modos: coluna fixa de 420 px em lg, folha lateral fixa abaixo disso. */}
        {atual && <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={() => setSelecionado(null)} aria-hidden />}
        <aside
          aria-label="Detalhe do pedido"
          className={`${atual ? "fixed" : "hidden"} inset-y-0 right-0 z-50 w-full max-w-md bg-card shadow-float lg:sticky lg:top-4 lg:z-auto lg:block lg:h-[calc(100vh-2rem)] lg:max-w-none lg:rounded-3xl lg:border lg:shadow-card`}
        >
          {atual ? (
            <Detalhe key={atual.id} pedido={atual} onFechar={() => setSelecionado(null)} />
          ) : (
            <div className="grid h-full place-items-center p-8 text-center">
              <div>
                <h2 className="font-display text-lg font-bold text-navy">Escolha um pedido</h2>
                <p className="mt-1 text-sm text-muted-foreground">O detalhe e as ações aparecem aqui, sem mexer na lista.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
