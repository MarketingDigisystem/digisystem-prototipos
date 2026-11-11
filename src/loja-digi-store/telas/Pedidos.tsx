/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (ListaPedidos, DetalhePedido visao="diretor") + requirements.md Req. 7, 8.10, 10 e 11.
 * Lista em linhas (número, data, resumo, etapa) com filtro por etapa e ordem por data. Detalhe com a Linha_do_Tempo de
 * quatro etapas (desvio Recusada/Cancelada com motivo), linhas de brinde, orçamento e histórico.
 * O diretor só vê os próprios pedidos (Req. 14.7) e não vê rótulos internos de estoque.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { FotoBrinde } from "../FotoBrinde";
import { acoesPermitidas, ROTULO_ESTADO } from "../maquina";
import { PESSOA_DIRETOR } from "../mock";
import { href, useRota } from "../rota";
import { useLoja } from "../store";
import type { EstadoPedido, LinhaPedido, Pedido } from "../tipos";
import { Aviso, EstadoErro, EstadoVazio, Esqueleto } from "./Estados";
import { LinhaDoTempo } from "./LinhaDoTempo";
import { AREA, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CLASSE_ESTADO, brl, fmtData, fmtDataHora, resumoLinhas } from "./util";

const FILTROS: { id: EstadoPedido | "todos"; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "solicitada", rotulo: ROTULO_ESTADO.solicitada },
  { id: "em_alinhamento", rotulo: ROTULO_ESTADO.em_alinhamento },
  { id: "pronto_para_retirada", rotulo: ROTULO_ESTADO.pronto_para_retirada },
  { id: "encerrada", rotulo: ROTULO_ESTADO.encerrada },
  { id: "recusada", rotulo: ROTULO_ESTADO.recusada },
  { id: "cancelada", rotulo: ROTULO_ESTADO.cancelada },
];

function Chip({ estado }: { estado: EstadoPedido }) {
  return <span className={`inline-flex h-7 items-center whitespace-nowrap rounded-full px-3 text-xs font-bold ${CLASSE_ESTADO[estado]}`}>{ROTULO_ESTADO[estado]}</span>;
}

/* ───────────────────────── Lista ───────────────────────── */

export function ListaPedidos() {
  const loja = useLoja();
  const { estado } = useRota();
  const [filtro, setFiltro] = useState<EstadoPedido | "todos">("todos");
  const [ordem, setOrdem] = useState<"recentes" | "antigos">("recentes");

  const meus = estado === "vazio" ? [] : loja.pedidos.filter((p) => p.solicitante === PESSOA_DIRETOR);
  const lista = meus
    .filter((p) => filtro === "todos" || p.estado === filtro)
    .sort((a, b) => (ordem === "recentes" ? b.criadoEm.localeCompare(a.criadoEm) : a.criadoEm.localeCompare(b.criadoEm)));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-3xl font-bold text-navy sm:text-4xl">Pedidos</h1>
      <p className="mt-1 text-muted-foreground">Acompanhe cada pedido do carrinho até a retirada.</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por etapa">
          {FILTROS.map((f) => (
            <button
              key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}
              className={`h-10 shrink-0 rounded-full border border-transparent px-4 font-display text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky ${filtro === f.id ? "bg-navy-soft text-navy shadow-[0_0_0_2px_var(--sky)]" : "text-foreground/80 hover:bg-navy-soft hover:text-navy"}`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm font-semibold text-muted-foreground">
          <span className="sr-only sm:not-sr-only">Ordem</span>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value as "recentes" | "antigos")} className="h-10 w-[148px] rounded-full border bg-card px-3 text-sm font-semibold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
          </select>
        </label>
      </div>

      <div className="mt-4">
        {estado === "sucesso" && <div className="mb-4"><Aviso tom="sucesso">Pedido enviado. O Marketing já recebeu e você acompanha cada etapa aqui.</Aviso></div>}
        {estado === "carregando" ? (
          <div className="space-y-2" aria-busy="true" aria-label="Carregando pedidos">
            {[0, 1, 2, 3].map((i) => <Esqueleto key={i} className="h-[72px] w-full" />)}
          </div>
        ) : estado === "erro" ? (
          <EstadoErro titulo="Não foi possível carregar os pedidos" texto="Confira a conexão e tente de novo." />
        ) : meus.length === 0 ? (
          <EstadoVazio titulo="Você ainda não fez pedidos" texto="Escolha os brindes na vitrine, monte o carrinho e confirme o pedido." acao={<a href={href("")} className={BOTAO_PRIMARIO}>Ver brindes</a>} />
        ) : lista.length === 0 ? (
          <EstadoVazio titulo="Nenhum pedido nesta etapa" texto="Mude o filtro para ver os outros pedidos." acao={<button type="button" onClick={() => setFiltro("todos")} className={BOTAO_SECUNDARIO}>Ver todos</button>} />
        ) : (
          <ul className="overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]">
            <li aria-hidden className="hidden grid-cols-[84px_104px_1fr_184px_20px] items-center gap-4 border-b px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground md:grid">
              <span>Pedido</span><span>Data</span><span>Brindes</span><span>Etapa</span><span />
            </li>
            {lista.map((p) => {
              const r = resumoLinhas(p);
              return (
                <li key={p.id} className="border-b last:border-b-0">
                  <a href={href(`pedidos/${p.id}`)} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-navy-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky md:grid-cols-[84px_104px_1fr_184px_20px]">
                    <span className="font-display text-base font-bold text-navy md:order-1">nº {p.numero}</span>
                    <span className="col-start-2 row-start-1 justify-self-end md:order-4 md:col-start-auto md:row-start-auto md:justify-self-start"><Chip estado={p.estado} /></span>
                    <span className="text-sm text-muted-foreground md:order-2">{fmtData(p.criadoEm)}</span>
                    <span className="col-span-2 min-w-0 text-sm text-foreground md:order-3 md:col-span-1">
                      <span className="block truncate">{r.principal}</span>
                      {r.resto && <span className="text-xs text-muted-foreground">{r.resto}</span>}
                    </span>
                    <ChevronRight className="hidden size-4 text-muted-foreground md:order-5 md:block" aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Detalhe ───────────────────────── */

export function DetalhePedido({ id }: { id: string }) {
  const loja = useLoja();
  const { estado } = useRota();
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const voltar = (
    <a href={href("pedidos")} className="mb-4 inline-flex h-10 items-center gap-2 rounded-full pr-3 font-display text-sm font-bold text-navy hover:underline">
      <ArrowLeft className="size-4" aria-hidden /> Voltar aos pedidos
    </a>
  );
  const moldura = (c: ReactNode) => <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{voltar}{c}</div>;

  if (estado === "carregando") {
    return moldura(<div className="space-y-4" aria-busy="true"><Esqueleto className="h-10 w-1/2" /><Esqueleto className="h-40 w-full" /><Esqueleto className="h-56 w-full" /></div>);
  }
  if (estado === "erro") return moldura(<EstadoErro titulo="Não foi possível abrir o pedido" texto="Confira a conexão e tente de novo." />);
  const p = loja.pedidos.find((x) => x.id === id && x.solicitante === PESSOA_DIRETOR);
  if (!p || estado === "vazio") return moldura(<EstadoVazio titulo="Pedido não encontrado" texto="Esse pedido não existe ou não é seu." acao={<a href={href("pedidos")} className={BOTAO_PRIMARIO}>Ver meus pedidos</a>} />);

  const temOrcamentoAceito = p.linhas.some((l) => l.andamento === "orcamento_aceito");
  const podeCancelar = acoesPermitidas(p.estado, "solicitante", { temOrcamentoAceito }).includes("cancelar");
  const cancelavelNaFase = ["solicitada", "em_alinhamento", "pronto_para_retirada"].includes(p.estado);
  const desvio = p.estado === "recusada" || p.estado === "cancelada";

  const cancelar = () => {
    const r = loja.transicionar(p.id, "cancelar", motivo);
    if (!r.ok) return setErro(r.motivo);
    setCancelando(false); setMotivo(""); setErro(""); setAviso("Pedido cancelado. Os brindes reservados foram liberados.");
  };

  return moldura(
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-3xl font-bold text-navy sm:text-4xl">Pedido nº {p.numero}</h1>
            <Chip estado={p.estado} />
          </div>
          <p className="mt-1 text-muted-foreground">Solicitado em {fmtDataHora(p.criadoEm)}</p>
        </div>
        {cancelavelNaFase && (
          <div className="flex flex-col items-end gap-1">
            <button type="button" disabled={!podeCancelar} onClick={() => { setCancelando(true); setErro(""); }} className={BOTAO_SECUNDARIO}>Cancelar pedido</button>
            {!podeCancelar && <p className="max-w-[260px] text-right text-xs text-muted-foreground">Há orçamento aceito. O cancelamento fica com o Marketing.</p>}
          </div>
        )}
      </div>

      {aviso && <div className="mt-4"><Aviso tom="sucesso">{aviso}</Aviso></div>}
      {estado === "sucesso" && !aviso && <div className="mt-4"><Aviso tom="sucesso">Alteração registrada.</Aviso></div>}

      <section aria-label="Andamento" className="mt-6 rounded-3xl bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-navy">Andamento</h2>
        <LinhaDoTempo estado={p.estado} eventos={p.eventos} motivo={desvio ? p.motivo : undefined} />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Brindes do pedido" className="min-w-0 rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-bold text-navy">Brindes</h2>
          <ul className="mt-3 divide-y">
            {p.linhas.map((l) => <LinhaDetalhe key={l.id} pedido={p} linha={l} />)}
          </ul>
        </section>

        <div className="space-y-6">
          <section aria-label="Dados do pedido" className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold text-navy">Sobre o pedido</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Dado rotulo="Finalidade" valor={p.finalidade} />
              {p.destino && <Dado rotulo="Destino" valor={p.destino} />}
              {p.dataDesejada && <Dado rotulo="Data desejada" valor={fmtData(p.dataDesejada)} />}
              {p.observacao && <Dado rotulo="Observação" valor={p.observacao} />}
              {p.responsavel && <Dado rotulo="No Marketing" valor={p.responsavel} />}
            </dl>
            <p className="mt-4 rounded-2xl bg-secondary/60 px-3 py-2 text-xs text-foreground">A retirada é feita com o Marketing.</p>
          </section>

          <section aria-label="Histórico" className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold text-navy">Histórico</h2>
            <ol className="mt-3 space-y-3">
              {[...p.eventos].reverse().map((ev, i) => (
                <li key={i} className="text-sm">
                  <p className="font-semibold text-navy">
                    {ev.de === ev.para ? "Atualização" : ROTULO_ESTADO[ev.para]}
                    <span className="font-normal text-muted-foreground"> · {ev.pessoa}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{fmtDataHora(ev.em)}</p>
                  {ev.nota && <p className="mt-0.5 text-xs text-foreground/80">{ev.nota}</p>}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {cancelando && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/40 p-4" onClick={() => setCancelando(false)}>
          <div role="dialog" aria-modal="true" aria-label="Cancelar pedido" onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-card p-6 shadow-[var(--shadow-float)]">
            <h2 className="text-xl font-bold text-navy">Cancelar o pedido nº {p.numero}?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Os brindes reservados voltam para a vitrine. Conte o motivo para o Marketing.</p>
            <label htmlFor="motivo" className="mb-1.5 mt-4 block text-sm font-semibold text-navy">Motivo <span className="text-destructive">*</span></label>
            <textarea id="motivo" rows={3} autoFocus value={motivo} onChange={(e) => { setMotivo(e.target.value); setErro(""); }} className={AREA} />
            <div className="mt-2 min-h-[3rem]">{erro && <Aviso tom="erro">{erro}</Aviso>}</div>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setCancelando(false)} className={BOTAO_SECUNDARIO}>Manter pedido</button>
              <button type="button" onClick={cancelar} className={BOTAO_PRIMARIO}>Cancelar pedido</button>
            </div>
          </div>
        </div>
      )}
    </>,
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground">{rotulo}</dt>
      <dd className="text-foreground">{valor}</dd>
    </div>
  );
}

/** Uma linha de brinde. Em personalizável mostra o orçamento e deixa o diretor aceitar ou recusar (Req. 10). */
function LinhaDetalhe({ pedido, linha }: { pedido: Pedido; linha: LinhaPedido }) {
  const loja = useLoja();
  const sku = loja.skus.find((s) => s.id === linha.skuId);
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  useEffect(() => { if (linha.andamento !== "orcamento_enviado") setRecusando(false); }, [linha.andamento]);
  const personalizavel = linha.skuTipo === "personalizavel";
  const aberto = ["solicitada", "em_alinhamento"].includes(pedido.estado);

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <FotoBrinde src={sku?.foto ?? ""} alt={linha.skuNome} className="size-14 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy">{linha.skuNome}</p>
          <p className="text-xs text-muted-foreground">
            {linha.quantidade} {linha.quantidade === 1 ? "unidade" : "unidades"}
            {!personalizavel && linha.custoUnitario != null && ` · ${brl(linha.custoUnitario)} cada`}
          </p>
          {linha.personalizacao && (linha.personalizacao.texto || linha.personalizacao.arte) && (
            <p className="truncate text-xs text-foreground/70">{[linha.personalizacao.texto && `“${linha.personalizacao.texto}”`, linha.personalizacao.arte && `Arte: ${linha.personalizacao.arte}`].filter(Boolean).join(" · ")}</p>
          )}
        </div>
        {!personalizavel && linha.custoUnitario != null && <p className="font-display text-base font-bold text-navy">{brl(linha.custoUnitario * linha.quantidade)}</p>}
      </div>

      {personalizavel && (
        <div className="mt-3 rounded-2xl bg-secondary/60 p-3 text-sm">
          {linha.andamento === "aguardando_orcamento" && <p className="text-foreground">O Marketing está avaliando o valor conforme a quantidade. Você recebe o orçamento por aqui e por e-mail.</p>}
          {linha.andamento === "orcamento_enviado" && linha.orcamento && (
            <>
              <p className="font-semibold text-navy">Orçamento recebido: {brl(linha.orcamento.valorTotal)}</p>
              <p className="text-xs text-muted-foreground">Para {linha.orcamento.quantidade} unidades · prazo estimado de {linha.orcamento.prazoDias} dias</p>
              {aberto && !recusando && (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => loja.decidirOrcamento(pedido.id, linha.id, true)} className="h-10 rounded-full bg-navy px-5 font-display text-sm font-bold text-white hover:opacity-90">Aceitar orçamento</button>
                  <button type="button" onClick={() => setRecusando(true)} className="h-10 rounded-full border bg-card px-5 font-display text-sm font-bold text-navy hover:bg-navy-soft">Recusar</button>
                </div>
              )}
              {recusando && (
                <div className="mt-3">
                  <label htmlFor={`m-${linha.id}`} className="mb-1.5 block text-xs font-semibold text-navy">Motivo da recusa <span className="text-destructive">*</span></label>
                  <textarea id={`m-${linha.id}`} rows={2} value={motivo} onChange={(e) => { setMotivo(e.target.value); setErro(""); }} className={AREA} />
                  <div className="min-h-[2.5rem]">{erro && <p role="alert" className="mt-1 text-xs font-semibold text-destructive">{erro}</p>}</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { const r = loja.decidirOrcamento(pedido.id, linha.id, false, motivo); if (!r.ok) setErro(r.motivo); else { setMotivo(""); setRecusando(false); } }} className="h-10 rounded-full bg-navy px-5 font-display text-sm font-bold text-white hover:opacity-90">Enviar recusa</button>
                    <button type="button" onClick={() => setRecusando(false)} className="h-10 rounded-full px-4 font-display text-sm font-bold text-navy hover:bg-navy-soft">Voltar</button>
                  </div>
                </div>
              )}
            </>
          )}
          {linha.andamento === "orcamento_aceito" && (
            <>
              <p className="font-semibold text-[var(--success-strong)]">Orçamento aceito{linha.orcamento ? `: ${brl(linha.orcamento.valorTotal)}` : ""}</p>
              <p className="text-xs text-muted-foreground">O Marketing providencia a personalização e avisa quando estiver pronto.</p>
            </>
          )}
          {linha.andamento === "pronta" && <p className="font-semibold text-[var(--success-strong)]">Personalização pronta{linha.orcamento ? ` · ${brl(linha.orcamento.valorTotal)}` : ""}</p>}
        </div>
      )}
    </li>
  );
}
