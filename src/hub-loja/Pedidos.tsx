// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/AbaPedidos.tsx, PedidoCartao.tsx, PedidoDetalhe.tsx e pedidos-loja.ts @ origin/main aff470d (2026-11-19).
// Fonte da verdade = Lovable/GitHub. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-2026-11-19.md
// Correção em relação à proposta da outra IA: o fluxo NÃO é linear; depois de "Em separação" ele se divide em entrega
// ou retirada (e a entrega pode virar retirada). A linha do tempo segue a forma do pedido.
import { useMemo, useState } from "react";
import {
  AlertTriangle, Check, ChevronRight, Clock, Copy, Download, KanbanSquare, List, Loader2, Mail, MapPin, Printer, Search,
} from "lucide-react";
import type { Loja } from "./HubLoja";
import { EU, GESTOR, LIMITE_PARADO, LOCAL_RETIRADA, type Pedido } from "./dados";
import {
  ACOES_COM_CAMPO, ATIVOS, CONCLUIDOS, COR_ESTADO, HOJE, ROTULO_ACAO, ROTULO_ESTADO, acoesDaFase, baixarCsv, brl, ddmm, diasUteisEntre,
  erroCampoAcao, hhmm, iniciais, limitesDaSemana, somarDias, somarDiasUteis, textoSucessoAcao, type AcaoPedido, type Estado,
} from "./regras";
import {
  BOTAO_DESTRUTIVO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Badge, CARTAO, FotoBrinde, Numero, ROTULO_PEQUENO, Segmentado, Shimmer, cx, useCarregando, useToast,
} from "./ui";

type FiltroDia = "hoje" | "amanha" | "semana" | "escolher";
const ROTULO_DIA: Record<FiltroDia, string> = { hoje: "Hoje", amanha: "Amanhã", semana: "Esta semana", escolher: "Escolher dia" };

const diaDoPedido = (p: Pedido) => (p.recebimento.forma === "entrega" ? p.recebimento.diaPresencial : p.recebimento.dataDesejada ?? null);
const idadeUteis = (p: Pedido) => diasUteisEntre(p.criadoEm.slice(0, 10), HOJE);
const eParado = (p: Pedido) => p.estado === "aguardando" && idadeUteis(p) > LIMITE_PARADO;
const dataProxima = (p: Pedido) => { const d = diaDoPedido(p); return !!d && ATIVOS.includes(p.estado) && d >= HOJE && d <= somarDiasUteis(HOJE, 2); };
function textoChip(p: Pedido) {
  const r = p.recebimento;
  if (r.forma === "entrega") return ["Entrega em mãos", r.ondeEncontrar, ddmm(r.diaPresencial)].filter(Boolean).join(" · ");
  return r.dataDesejada ? `Retirada · até ${ddmm(r.dataDesejada)}` : "Retirada";
}
function textoPrazo(p: Pedido): string {
  switch (p.estado) {
    case "aguardando": { const n = idadeUteis(p); return n === 0 ? `Chegou hoje · limite de ${LIMITE_PARADO} dias úteis` : `Aguardando há ${n} ${n === 1 ? "dia útil" : "dias úteis"} · limite ${LIMITE_PARADO}`; }
    case "em_separacao": return `Em separação com ${p.responsavel ?? "—"}`;
    case "pronto_entrega": { const r = p.recebimento; return r.forma === "entrega" && r.diaPresencial === HOJE ? `Entregar hoje · ${r.ondeEncontrar}` : `Entregar em ${r.forma === "entrega" ? ddmm(r.diaPresencial) : ""}`; }
    case "pronto_retirada": return `Aguardando retirada até ${ddmm(p.prazoRetirada)}`;
    case "entregue": return `Entregue a ${p.entregueA ?? "—"}`;
    default: return p.motivo ?? "";
  }
}
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Pedidos({ loja, carregando }: { loja: Loja; carregando: boolean }) {
  const toast = useToast();
  const { pedidos, brindes } = loja;
  const brindeDe = useMemo(() => new Map(brindes.map((b) => [b.id, b])), [brindes]);
  const [fases, setFases] = useState<Estado[]>([]);
  const [concluidos, setConcluidos] = useState(false);
  const [filtroDia, setFiltroDia] = useState<FiltroDia | null>(null);
  const [diaEscolhido, setDiaEscolhido] = useState("");
  const [busca, setBusca] = useState("");
  const [visao, setVisao] = useState<"lista" | "quadro">("lista");
  const [selId, setSelId] = useState<string>("p5");
  const [lote, setLote] = useState<Set<string>>(new Set());
  const [loteMsg, setLoteMsg] = useState<string | null>(null);
  const [loteOcupado, setLoteOcupado] = useState(false);

  const contagem = useMemo(() => {
    const c = Object.fromEntries([...ATIVOS, ...CONCLUIDOS].map((e) => [e, 0])) as Record<Estado, number>;
    for (const p of pedidos) c[p.estado] += 1;
    return c;
  }, [pedidos]);
  const nConcluidos = CONCLUIDOS.reduce((s, e) => s + contagem[e], 0);

  const visiveis = useMemo(() => {
    let l = [...pedidos].sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
    if (fases.length > 0) l = l.filter((p) => fases.includes(p.estado));
    else if (!concluidos) l = l.filter((p) => ATIVOS.includes(p.estado));
    if (filtroDia && !(filtroDia === "escolher" && !diaEscolhido)) {
      const { ini, fim } = limitesDaSemana(HOJE);
      l = l.filter((p) => {
        const d = diaDoPedido(p);
        if (!d) return false;
        if (filtroDia === "hoje") return d === HOJE;
        if (filtroDia === "amanha") return d === somarDias(HOJE, 1);
        if (filtroDia === "escolher") return d === diaEscolhido;
        return d >= ini && d <= fim;
      });
    }
    const q = busca.trim().toLowerCase();
    if (q) l = l.filter((p) => [p.codigo, p.solicitante, p.area, ...p.linhas.map((x) => brindeDe.get(x.brindeId)?.nome ?? "")].join(" ").toLowerCase().includes(q));
    return l;
  }, [pedidos, fases, concluidos, filtroDia, diaEscolhido, busca, brindeDe]);

  const parados = pedidos.filter(eParado);
  const sel = pedidos.find((p) => p.id === selId) ?? null;
  const alternarFase = (e: Estado) => setFases((f) => (f.includes(e) ? f.filter((x) => x !== e) : [...f, e]));
  const temFiltro = fases.length > 0 || filtroDia !== null || busca.trim() !== "";

  /* ---------------- ações: mesmas transições do motor ---------------- */
  function aplicar(id: string, acao: AcaoPedido, valor: string) {
    const agora = `${HOJE}T${new Date().toTimeString().slice(0, 8)}`;
    let liberar: { brindeId: string; qtd: number }[] = [];
    let baixar: { brindeId: string; qtd: number }[] = [];
    loja.setPedidos((lista) =>
      lista.map((p) => {
        if (p.id !== id) return p;
        const hist = (estado: Estado, extra: { motivo?: string; nota?: string } = {}) => [...p.historico, { estado, em: agora, quem: EU, ...extra }];
        switch (acao) {
          case "assumir": return { ...p, estado: "em_separacao", responsavel: EU, historico: hist("em_separacao") };
          case "marcar_pronto":
            return p.recebimento.forma === "entrega"
              ? { ...p, estado: "pronto_entrega", historico: hist("pronto_entrega") }
              : { ...p, estado: "pronto_retirada", prazoRetirada: somarDiasUteis(HOJE, 5), historico: hist("pronto_retirada") };
          case "mudar_para_retirada":
            return { ...p, estado: "pronto_retirada", recebimento: { forma: "retirada" }, prazoRetirada: somarDiasUteis(HOJE, 5), historico: hist("pronto_retirada", { motivo: valor }) };
          case "confirmar_entrega":
            baixar = p.linhas;
            return { ...p, estado: "entregue", entregueA: valor, historico: hist("entregue", { nota: `Quem recebeu: ${valor}` }) };
          case "recusar":
            liberar = p.linhas;
            return { ...p, estado: "recusada", motivo: valor, historico: hist("recusada", { motivo: valor }) };
        }
      }),
    );
    if (liberar.length || baixar.length) {
      loja.setBrindes((bs) =>
        bs.map((b) => {
          const l = liberar.find((x) => x.brindeId === b.id);
          const s = baixar.find((x) => x.brindeId === b.id);
          return { ...b, reserva: b.reserva - (l?.qtd ?? 0) - (s?.qtd ?? 0), saldo: b.saldo - (s?.qtd ?? 0) };
        }),
      );
      if (baixar.length) loja.setMovs((m) => [...baixar.map((x, i) => ({ id: `n${Date.now()}${i}`, brindeId: x.brindeId, tipo: "saida" as const, qtd: x.qtd, em: HOJE, nota: `Pedido ${pedidos.find((p) => p.id === id)?.codigo}` })), ...m]);
    }
  }

  async function assumirLote() {
    setLoteOcupado(true);
    setLoteMsg(null);
    let ok = 0;
    const falhas: string[] = [];
    for (const id of lote) {
      await espera(350);
      const p = pedidos.find((x) => x.id === id);
      if (p && p.estado === "aguardando") { aplicar(id, "assumir", ""); ok++; }
      else if (p) falhas.push(`${p.codigo}: já não está em "Aguardando atendimento"`);
    }
    setLoteOcupado(false);
    setLote(new Set());
    setLoteMsg(`${ok} ${ok === 1 ? "pedido assumido" : "pedidos assumidos"}${falhas.length ? `. ${falhas.join("; ")}.` : "."}`);
  }

  function exportar() {
    baixarCsv(`pedidos-loja-${HOJE}.csv`, [
      ["Código", "Fase", "Solicitante", "Área", "Itens", "Unidades", "Recebimento", "Responsável", "Chegou em"],
      ...visiveis.map((p) => [p.codigo, ROTULO_ESTADO[p.estado], p.solicitante, p.area, p.linhas.length, p.linhas.reduce((s, l) => s + l.qtd, 0), textoChip(p), p.responsavel ?? "", `${ddmm(p.criadoEm)} ${hhmm(p.criadoEm)}`]),
    ]);
    toast({ texto: `Exportamos ${visiveis.length} ${visiveis.length === 1 ? "pedido" : "pedidos"} da lista filtrada.` });
  }

  if (carregando) return <EsqueletoPedidos />;
  const nAguardandoLote = [...lote].filter((id) => pedidos.find((p) => p.id === id)?.estado === "aguardando").length;

  return (
    <div className="space-y-4">
      {/* Fluxo do pedido: filtro por Fase. Entrega e retirada são caminhos alternativos. */}
      <section aria-label="Fluxo do pedido" className={cx(CARTAO, "hl-entra p-4 sm:p-5")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={ROTULO_PEQUENO}>Fluxo do pedido · toque numa Fase para filtrar</p>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={concluidos} onChange={(e) => setConcluidos(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
            Mostrar concluídos ({nConcluidos})
          </label>
        </div>
        <div className="mt-3 flex items-stretch gap-2 overflow-x-auto pb-1">
          <BlocoFase e="aguardando" n={contagem.aguardando} ativo={fases.includes("aguardando")} onClick={alternarFase} />
          <Seta />
          <BlocoFase e="em_separacao" n={contagem.em_separacao} ativo={fases.includes("em_separacao")} onClick={alternarFase} />
          <Seta />
          <div className="flex min-w-[170px] flex-1 flex-col gap-2">
            <BlocoFase compacto e="pronto_entrega" n={contagem.pronto_entrega} ativo={fases.includes("pronto_entrega")} onClick={alternarFase} />
            <BlocoFase compacto e="pronto_retirada" n={contagem.pronto_retirada} ativo={fases.includes("pronto_retirada")} onClick={alternarFase} />
          </div>
          <Seta />
          <BlocoFase e="entregue" n={contagem.entregue} ativo={fases.includes("entregue")} onClick={alternarFase} />
          <div className="mx-1 w-px shrink-0 bg-border" />
          <div className="flex min-w-[150px] flex-col gap-2">
            <BlocoFase compacto tracejado e="recusada" n={contagem.recusada} ativo={fases.includes("recusada")} onClick={alternarFase} />
            <BlocoFase compacto tracejado e="cancelada" n={contagem.cancelada} ativo={fases.includes("cancelada")} onClick={alternarFase} />
          </div>
        </div>
      </section>

      {/* Ferramentas: posição fixa; "Limpar filtros" ocupa o lugar mesmo sem filtro. */}
      <div className="hl-entra flex flex-wrap items-center gap-2">
        <Segmentado rotulo="Filtrar por dia" valor={filtroDia} aoMudar={(v) => setFiltroDia((a) => (a === v ? null : v))} opcoes={(["hoje", "amanha", "semana", "escolher"] as FiltroDia[]).map((id) => ({ id, rotulo: ROTULO_DIA[id] }))} />
        <input type="date" aria-label="Dia escolhido" value={diaEscolhido} onChange={(e) => setDiaEscolhido(e.target.value)} className={cx("h-11 rounded-xl border border-muted-foreground/40 bg-card px-3 text-sm", filtroDia === "escolher" ? "" : "invisible")} />
        <button type="button" onClick={() => { setFases([]); setFiltroDia(null); setBusca(""); }} className={cx("min-h-11 rounded-xl px-3 text-sm font-semibold text-primary hover:bg-muted", temFiltro ? "" : "invisible")}>Limpar filtros</button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Buscar na fila</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Código, pessoa, área ou brinde" className="h-11 w-[min(78vw,260px)] rounded-xl border border-muted-foreground/40 bg-card pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <Segmentado rotulo="Visão" valor={visao} aoMudar={setVisao} opcoes={[{ id: "lista", rotulo: <><List className="h-4 w-4" aria-hidden />Lista</> }, { id: "quadro", rotulo: <><KanbanSquare className="h-4 w-4" aria-hidden />Quadro</> }]} />
          <button type="button" onClick={exportar} className={BOTAO_SECUNDARIO}><Download className="h-4 w-4" aria-hidden />Exportar</button>
        </div>
      </div>

      {/* Aviso de parados: altura reservada. */}
      <div className="min-h-[52px]">
        {parados.length > 0 ? (
          <div role="status" className="hl-entra flex flex-wrap items-center gap-3 rounded-2xl border border-[#f4c7bb] bg-[#fdeee9] px-4 py-2.5 text-sm text-[#7a2a12]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#b8410f]" aria-hidden />
            <p className="min-w-0 flex-1"><strong>{parados.length === 1 ? "1 pedido está parado" : `${parados.length} pedidos estão parados`}</strong> em "Aguardando atendimento" há mais de {LIMITE_PARADO} dias úteis. Gestor avisado: {GESTOR}.</p>
            <button type="button" onClick={() => { setFases(["aguardando"]); setVisao("lista"); setSelId(parados[0]!.id); }} className="min-h-9 rounded-lg border border-[#e9a58f] bg-card px-3 font-semibold text-[#7a2a12] hover:bg-white">Ver parados</button>
          </div>
        ) : null}
      </div>

      {visao === "quadro" ? (
        <Quadro pedidos={pedidos} onAbrir={(id) => { setSelId(id); setVisao("lista"); }} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(320px,400px)_1fr] lg:items-start">
          <div className="min-w-0 space-y-3">
            <EntregasDeHoje pedidos={pedidos} onAbrir={setSelId} />
            {/* Barra de lote: espaço reservado. */}
            <div className="min-h-[56px]">
              {lote.size > 0 || loteMsg ? (
                <div className="hl-entra flex flex-wrap items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                  {lote.size > 0 ? (
                    <>
                      <span className="font-semibold">{lote.size} {lote.size === 1 ? "selecionado" : "selecionados"} · {nAguardandoLote} para assumir</span>
                      <div className="ml-auto flex gap-2">
                        <button type="button" disabled={nAguardandoLote === 0 || loteOcupado} onClick={assumirLote} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-card px-3 font-semibold text-primary disabled:opacity-60">
                          {loteOcupado ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}Assumir selecionados
                        </button>
                        <button type="button" onClick={() => setLote(new Set())} className="min-h-9 rounded-lg px-3 font-semibold hover:bg-white/10">Limpar</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1">{loteMsg}</span>
                      <button type="button" onClick={() => setLoteMsg(null)} className="min-h-9 rounded-lg px-3 font-semibold hover:bg-white/10">Fechar</button>
                    </>
                  )}
                </div>
              ) : (
                <p className="px-1 pt-4 text-xs font-semibold text-primary">Fila · ordem de chegada <span className="float-right font-normal text-muted-foreground">{visiveis.length} {visiveis.length === 1 ? "pedido" : "pedidos"}</span></p>
              )}
            </div>
            <ul className="hl-entra-seq space-y-2.5">
              {visiveis.map((p) => (
                <li key={p.id}>
                  <CartaoPedido
                    p={p}
                    selecionado={p.id === selId}
                    marcado={lote.has(p.id)}
                    onMarcar={() => setLote((s) => { const n = new Set(s); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); return n; })}
                    onAbrir={() => setSelId(p.id)}
                  />
                </li>
              ))}
              {visiveis.length === 0 ? <li className={cx(CARTAO, "p-6 text-center text-sm text-muted-foreground")}>Nenhum pedido com esses filtros.</li> : null}
            </ul>
          </div>
          <div className="min-w-0 lg:sticky lg:top-4">
            {sel ? <Detalhe key={sel.id} p={sel} loja={loja} aplicar={aplicar} /> : <div className={cx(CARTAO, "p-8 text-center text-sm text-muted-foreground")}>Escolha um pedido na fila.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Seta() {
  return <ChevronRight className="h-4 w-4 shrink-0 self-center text-muted-foreground" aria-hidden />;
}

function BlocoFase({ e, n, ativo, onClick, compacto, tracejado }: { e: Estado; n: number; ativo: boolean; onClick: (e: Estado) => void; compacto?: boolean; tracejado?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={() => onClick(e)}
      className={cx(
        "hl-elevar flex min-w-[150px] flex-1 items-center justify-between gap-3 rounded-xl border bg-card px-3.5 text-left",
        compacto ? "min-h-11 py-1.5" : "min-h-[84px] flex-col items-start justify-center py-3",
        tracejado ? "border-dashed" : "",
        ativo ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className={cx("h-2 w-2 shrink-0 rounded-full", COR_ESTADO[e].ponto)} />
        {ROTULO_ESTADO[e]}
      </span>
      <Numero valor={n} className={cx("font-display font-bold text-primary", compacto ? "text-lg" : "text-[26px] leading-none")} />
    </button>
  );
}

function CartaoPedido({ p, selecionado, marcado, onMarcar, onAbrir }: { p: Pedido; selecionado: boolean; marcado: boolean; onMarcar: () => void; onAbrir: () => void }) {
  const idade = idadeUteis(p);
  const pct = Math.min(1, idade / (LIMITE_PARADO + 1));
  const corIdade = idade > LIMITE_PARADO ? "bg-destructive" : idade === LIMITE_PARADO ? "bg-accent" : "bg-sky";
  const unidades = p.linhas.reduce((s, l) => s + l.qtd, 0);
  return (
    <div className={cx(CARTAO, "hl-elevar relative p-3.5", selecionado ? "border-primary ring-1 ring-primary" : "")}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={marcado} onChange={onMarcar} aria-label={`Selecionar ${p.codigo}`} className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]" />
        <button type="button" onClick={onAbrir} className="min-w-0 flex-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-base font-bold text-primary">{p.codigo}</span>
            <Badge estado={p.estado} />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm"><strong className="font-semibold">{p.solicitante}</strong> <span className="text-muted-foreground">· {p.area}</span></p>
            {p.responsavel ? (
              <span title={`Responsável: ${p.responsavel}`} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-soft text-[10px] font-bold text-primary">{iniciais(p.responsavel)}</span>
            ) : (
              <span title="Sem Responsável" className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/60 text-xs text-muted-foreground">–</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-navy-soft px-2 py-0.5 font-semibold text-primary">{textoChip(p)}</span>
            <span className="text-muted-foreground">{p.linhas.length} {p.linhas.length === 1 ? "item" : "itens"} · {unidades} {unidades === 1 ? "unidade" : "unidades"}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">{textoPrazo(p)}</span>
            {p.estado === "aguardando" ? (
              <span className="relative h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted" aria-hidden>
                <span className={cx("hl-cresce absolute inset-y-0 left-0 w-full rounded-full", corIdade)} style={{ transform: `scaleX(${Math.max(0.08, pct)})` }} />
              </span>
            ) : null}
          </div>
          {eParado(p) || dataProxima(p) ? (
            <div className="mt-2 flex gap-1.5 text-xs">
              {eParado(p) ? <span className="rounded-full bg-[#fde8e6] px-2 py-0.5 font-semibold text-[#b42318]">Parado</span> : null}
              {dataProxima(p) ? <span className="rounded-full bg-warning-soft px-2 py-0.5 font-semibold text-[#7a5600]">Data próxima</span> : null}
            </div>
          ) : null}
        </button>
      </div>
    </div>
  );
}

function EntregasDeHoje({ pedidos, onAbrir }: { pedidos: Pedido[]; onAbrir: (id: string) => void }) {
  const hoje = pedidos.filter((p) => ATIVOS.includes(p.estado) && p.recebimento.forma === "entrega" && p.recebimento.diaPresencial === HOJE);
  if (hoje.length === 0) return null;
  const porLocal = new Map<string, Pedido[]>();
  for (const p of hoje) { const k = p.recebimento.forma === "entrega" ? p.recebimento.ondeEncontrar : ""; porLocal.set(k, [...(porLocal.get(k) ?? []), p]); }
  const imprimir = () => {
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    w.document.write(`<html><head><title>Roteiro de entregas ${ddmm(HOJE)}</title><style>body{font-family:'Open Sans',sans-serif;padding:32px;color:#1f2a5c}h1{font-family:Dosis,sans-serif}li{margin:6px 0}</style></head><body><h1>Entregas em mãos de hoje (${ddmm(HOJE)})</h1>${[...porLocal].map(([l, ps]) => `<h3>${l}</h3><ul>${ps.map((p) => `<li>${p.codigo} · ${p.solicitante} · ${ROTULO_ESTADO[p.estado]} ☐</li>`).join("")}</ul>`).join("")}</body></html>`);
    w.document.close(); w.focus(); w.print();
  };
  return (
    <section aria-label="Entregas em mãos de hoje" className={cx(CARTAO, "hl-entra p-4")}>
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-soft text-[#b8410f]"><MapPin className="h-4 w-4" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold text-primary">Entregas em mãos de hoje</p>
          <p className="text-xs text-muted-foreground">Roteiro por local · {hoje.length} {hoje.length === 1 ? "pedido" : "pedidos"}</p>
        </div>
        <button type="button" onClick={imprimir} aria-label="Imprimir roteiro" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"><Printer className="h-4 w-4" aria-hidden /></button>
      </div>
      <ul className="mt-3 space-y-2">
        {[...porLocal].map(([local, ps]) => (
          <li key={local} className="rounded-xl bg-muted/60 p-3">
            <p className="text-sm font-semibold text-foreground">{local}</p>
            {ps.map((p) => (
              <button key={p.id} type="button" onClick={() => onAbrir(p.id)} className="mt-1 flex w-full min-h-9 items-center justify-between gap-2 rounded-lg px-1 text-left text-xs hover:bg-card">
                <span className="text-muted-foreground">{p.codigo} · {p.solicitante}</span>
                <Badge estado={p.estado} />
              </button>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Quadro({ pedidos, onAbrir }: { pedidos: Pedido[]; onAbrir: (id: string) => void }) {
  const cols: Estado[] = ["aguardando", "em_separacao", "pronto_entrega", "pronto_retirada", "entregue"];
  return (
    <div className="hl-entra grid auto-cols-[minmax(240px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
      {cols.map((c) => {
        const ps = pedidos.filter((p) => p.estado === c);
        return (
          <section key={c} aria-label={ROTULO_ESTADO[c]} className="rounded-2xl bg-muted/70 p-3">
            <p className="mb-2 flex items-center justify-between text-sm font-semibold text-foreground">
              <span className="flex items-center gap-2"><span className={cx("h-2 w-2 rounded-full", COR_ESTADO[c].ponto)} />{ROTULO_ESTADO[c]}</span>
              <span className="text-muted-foreground">{ps.length}</span>
            </p>
            <ul className="hl-entra-seq space-y-2">
              {ps.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => onAbrir(p.id)} className={cx(CARTAO, "hl-elevar block w-full p-3 text-left")}>
                    <p className="font-display font-bold text-primary">{p.codigo}</p>
                    <p className="truncate text-sm">{p.solicitante} <span className="text-muted-foreground">· {p.area}</span></p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{textoChip(p)}</p>
                    {eParado(p) ? <span className="mt-2 inline-block rounded-full bg-[#fde8e6] px-2 py-0.5 text-xs font-semibold text-[#b42318]">Parado</span> : null}
                  </button>
                </li>
              ))}
              {ps.length === 0 ? <li className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Nenhum pedido</li> : null}
            </ul>
          </section>
        );
      })}
      <p className="col-span-full text-xs text-muted-foreground">O Quadro é só para enxergar a fila. Mudar de Fase continua sendo pelas ações do pedido.</p>
    </div>
  );
}

/* ============================== Detalhe ============================== */

function Detalhe({ p, loja, aplicar }: { p: Pedido; loja: Loja; aplicar: (id: string, a: AcaoPedido, v: string) => void }) {
  const toast = useToast();
  const carregando = useCarregando(p.id, 380);
  const [acao, setAcao] = useState<AcaoPedido | null>(null);
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [separados, setSeparados] = useState<Set<number>>(new Set());
  const [nota, setNota] = useState("");
  const [notaMsg, setNotaMsg] = useState<string | null>(null);
  const barra = acoesDaFase(p.estado);
  const brindeDe = new Map(loja.brindes.map((b) => [b.id, b]));
  const custo = p.linhas.reduce((s, l) => s + (brindeDe.get(l.brindeId)?.custo ?? 0) * l.qtd, 0);
  const unidades = p.linhas.reduce((s, l) => s + l.qtd, 0);
  const podeSeparar = p.estado === "em_separacao";

  async function executar(a: AcaoPedido) {
    setSucesso(null);
    if (ACOES_COM_CAMPO.includes(a) && acao !== a) { setAcao(a); setValor(a === "confirmar_entrega" ? p.solicitante : ""); setErro(null); return; }
    const e = erroCampoAcao(a, valor);
    if (e) { setErro(e); return; }
    setOcupado(true);
    await espera(500);
    aplicar(p.id, a, valor.trim());
    setOcupado(false);
    setAcao(null); setValor(""); setErro(null);
    setSucesso(textoSucessoAcao(a, p.codigo));
  }

  const botao = (a: AcaoPedido | null, estilo: string) => (
    <button type="button" disabled={ocupado || !a} onClick={() => a && executar(a)} aria-hidden={a ? undefined : true} tabIndex={a ? undefined : -1} className={cx(estilo, "w-full", a ? "" : "invisible")}>
      {ocupado && acao === a ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {a ? (acao === a ? `Confirmar: ${ROTULO_ACAO[a].toLowerCase()}` : ROTULO_ACAO[a]) : "—"}
    </button>
  );

  if (carregando) return <EsqueletoDetalhe />;
  return (
    <article className={cx(CARTAO, "hl-entra p-5 sm:p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={ROTULO_PEQUENO}>Pedido · chegou em {ddmm(p.criadoEm)} · {hhmm(p.criadoEm)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="font-display text-[28px] font-bold leading-tight text-primary">{p.codigo}</h2>
            <Badge estado={p.estado} />
            {eParado(p) ? <span className="rounded-full bg-[#fde8e6] px-2.5 py-0.5 text-xs font-semibold text-[#b42318]">Parado</span> : null}
            {dataProxima(p) ? <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-[#7a5600]">Data próxima</span> : null}
          </div>
          <p className="mt-1 text-sm"><strong className="font-semibold">{p.solicitante}</strong> <span className="text-muted-foreground">· Solicitante · {p.area} · {p.email}</span></p>
          <p className="text-xs text-muted-foreground">{p.responsavel ? `Responsável: ${p.responsavel}` : "Sem Responsável · quem assumir passa a responder pelo pedido"}</p>
        </div>
        <div className="flex gap-2 hl-nao-imprime">
          <button type="button" aria-label="Copiar link do pedido" onClick={() => { void navigator.clipboard?.writeText(`${location.origin}${location.pathname}#/hub-loja/pedidos?pedido=${p.codigo}`); toast({ texto: `Link do ${p.codigo} copiado.` }); }} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"><Copy className="h-4 w-4" aria-hidden /></button>
          <a aria-label="Escrever para o Solicitante" href={`mailto:${p.email}?subject=Pedido ${p.codigo} na Digi Store`} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"><Mail className="h-4 w-4" aria-hidden /></a>
          <button type="button" onClick={() => imprimirComprovante(p, loja)} className={BOTAO_SECUNDARIO}><Printer className="h-4 w-4" aria-hidden />Comprovante</button>
        </div>
      </div>

      <LinhaDoTempo p={p} />

      {/* Barra de ações: 3 posições fixas, a vazia fica invisível. */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {botao(barra.primaria, BOTAO_PRIMARIO)}
        {botao(barra.secundaria, BOTAO_SECUNDARIO)}
        {botao(barra.destrutiva, BOTAO_DESTRUTIVO)}
      </div>
      {/* Painel de ação: altura reservada, o conteúdo troca sem mover os botões. */}
      <div className="mt-3 min-h-[112px] rounded-2xl bg-muted/50 p-4">
        {acao ? (
          <div key={acao} className="hl-entra">
            <label className="text-sm font-semibold text-foreground" htmlFor="campo-acao">
              {acao === "confirmar_entrega" ? "Quem recebeu" : acao === "recusar" ? "Motivo da recusa (vai no e-mail ao Solicitante)" : "Motivo da mudança para retirada"}
            </label>
            <div className="mt-1.5 flex gap-2">
              <input id="campo-acao" autoFocus value={valor} onChange={(e) => { setValor(e.target.value); setErro(null); }} className="h-11 min-w-0 flex-1 rounded-xl border border-muted-foreground/40 bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <button type="button" onClick={() => { setAcao(null); setErro(null); }} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-primary hover:bg-card">Cancelar</button>
            </div>
            <p className="mt-1 min-h-5 text-sm text-[#b42318]">{erro ?? ""}</p>
          </div>
        ) : sucesso ? (
          <p key={sucesso} className="hl-entra flex items-center gap-2 text-sm font-semibold text-[#1a6340]"><Check className="hl-check h-4 w-4" aria-hidden />{sucesso}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Recusar, mudar para retirada e confirmar a entrega pedem uma informação. Ela aparece aqui.</p>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-border p-4">
          <p className={ROTULO_PEQUENO}>Como o Solicitante vai receber</p>
          <div className="mt-2 flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-soft text-primary"><MapPin className="h-4 w-4" aria-hidden /></span>
            {p.recebimento.forma === "entrega" ? (
              <div className="text-sm"><p className="font-semibold">Entrega em mãos</p><p className="text-muted-foreground">{p.recebimento.ondeEncontrar} · {ddmm(p.recebimento.diaPresencial)}</p></div>
            ) : (
              <div className="text-sm">
                <p className="font-semibold">Retirada</p>
                <p className="text-muted-foreground">{LOCAL_RETIRADA} · horário comercial</p>
                {p.prazoRetirada ? <p className="text-muted-foreground">Retirar até {ddmm(p.prazoRetirada)}</p> : null}
                {p.recebimento.dataDesejada ? <p className="text-muted-foreground">Precisa até {ddmm(p.recebimento.dataDesejada)}</p> : null}
              </div>
            )}
          </div>
          {p.entregueA ? <p className="mt-2 text-sm">Quem recebeu: <strong>{p.entregueA}</strong></p> : null}
        </section>
        <section className="rounded-2xl border border-border p-4">
          <p className={ROTULO_PEQUENO}>Finalidade e destino</p>
          <p className="mt-2 font-display text-lg font-bold text-primary">{p.finalidade}</p>
          {p.destino ? <p className="text-sm text-muted-foreground">Destino: {p.destino}</p> : null}
          {p.observacao ? <p className="mt-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-[#5c4300]">Observação: {p.observacao}</p> : null}
          {p.motivo ? <p className="mt-2 rounded-lg bg-[#fde8e6] px-3 py-2 text-sm text-[#8a1c12]">Motivo: {p.motivo}</p> : null}
        </section>
      </div>

      <section className="mt-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-primary">Itens do pedido</h3>
          <p className="text-xs text-muted-foreground">{podeSeparar ? "Marque o que já foi separado" : "A conferência de separação fica disponível em Em separação"}</p>
        </div>
        <div className="mt-2 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead><tr className={cx(ROTULO_PEQUENO, "border-b border-border text-left")}><th className="w-12 p-3" /><th className="p-3">Brinde</th><th className="p-3 text-right">Qtd.</th><th className="p-3 text-right">Saldo atual</th><th className="p-3 text-right">Custo</th></tr></thead>
            <tbody>
              {p.linhas.map((l, i) => {
                const b = brindeDe.get(l.brindeId);
                const marcado = separados.has(i);
                return (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <button type="button" role="checkbox" aria-checked={marcado} aria-label={`Separado: ${b?.nome}`} disabled={!podeSeparar} onClick={() => setSeparados((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })} className={cx("inline-flex h-6 w-6 items-center justify-center rounded-md border-2", marcado ? "border-success bg-success text-white" : "border-muted-foreground/50", podeSeparar ? "" : "opacity-40")}>
                        {marcado ? <Check className="hl-check h-4 w-4" aria-hidden /> : null}
                      </button>
                    </td>
                    <td className="p-3"><span className="flex items-center gap-3"><FotoBrinde src={b?.foto ?? null} alt="" pad="p-0.5" className="h-11 w-11 shrink-0 rounded-lg border border-border" /><span className={cx("font-semibold", marcado ? "text-muted-foreground line-through" : "")}>{b?.nome}</span></span></td>
                    <td className="p-3 text-right font-semibold text-primary">{l.qtd}</td>
                    <td className={cx("p-3 text-right", b && b.saldo < l.qtd ? "font-semibold text-[#b42318]" : "")}>{b?.saldo ?? "—"}</td>
                    <td className="p-3 text-right">{brl((b?.custo ?? 0) * l.qtd)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex flex-wrap justify-between gap-2 border-t border-border bg-muted/40 px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">{p.linhas.length} {p.linhas.length === 1 ? "item" : "itens"} · {unidades} unidades · separado <Numero valor={`${separados.size} de ${p.linhas.length}`} /></span>
            <span>Custo do pedido <strong className="font-display text-primary">{brl(custo)}</strong></span>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section>
          <h3 className="font-display text-lg font-bold text-primary">Histórico</h3>
          <ol className="mt-2 space-y-3 border-l-2 border-border pl-4">
            {[...p.historico].reverse().map((h, i) => (
              <li key={i} className="hl-entra relative text-sm">
                <span className={cx("absolute -left-[23px] top-1.5 h-3 w-3 rounded-full ring-4 ring-card", COR_ESTADO[h.estado].ponto)} />
                <p><strong className="font-semibold">{ROTULO_ESTADO[h.estado]}</strong> <span className="text-muted-foreground">· {ddmm(h.em)} · {hhmm(h.em)} · {h.quem}</span></p>
                {h.motivo ? <p className="text-muted-foreground">Motivo: {h.motivo}</p> : null}
                {h.nota ? <p className="text-muted-foreground">{h.nota}</p> : null}
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h3 className="font-display text-lg font-bold text-primary">Nota interna</h3>
          <textarea value={nota} onChange={(e) => { setNota(e.target.value); setNotaMsg(null); }} rows={3} placeholder="Só a equipe de Marketing vê. Ex.: embalar para presente, combinar com a recepção." className="mt-2 w-full rounded-xl border border-muted-foreground/40 bg-card p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="min-h-5 text-xs text-muted-foreground">{notaMsg ?? "Não vai para a Loja nem para o Solicitante."}</p>
            <button type="button" onClick={() => setNotaMsg("Nota salva.")} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-primary hover:bg-muted">Salvar nota</button>
          </div>
        </section>
      </div>
    </article>
  );
}

/** Linha do tempo: 4 passos que seguem a forma do pedido; em Recusado/Cancelado, 2 passos. */
function LinhaDoTempo({ p }: { p: Pedido }) {
  const quando = (e: Estado) => p.historico.filter((h) => h.estado === e).at(-1)?.em ?? null;
  const virouRetirada = p.historico.some((h) => h.estado === "pronto_entrega") && p.estado !== "pronto_entrega" && p.historico.some((h) => h.estado === "pronto_retirada");
  const final = p.estado === "recusada" || p.estado === "cancelada";
  const pronto: Estado = p.estado === "pronto_retirada" || virouRetirada || (p.recebimento.forma === "retirada" && p.estado !== "pronto_entrega") ? "pronto_retirada" : "pronto_entrega";
  const passos: { e: Estado; rotulo: string; sub?: string }[] = final
    ? [{ e: "aguardando", rotulo: "Aguardando atendimento" }, { e: p.estado, rotulo: ROTULO_ESTADO[p.estado] }]
    : [
        { e: "aguardando", rotulo: "Aguardando atendimento" },
        { e: "em_separacao", rotulo: "Em separação" },
        { e: pronto, rotulo: ROTULO_ESTADO[pronto], sub: virouRetirada ? "Era entrega em mãos" : undefined },
        { e: "entregue", rotulo: "Entregue" },
      ];
  const ordem = passos.map((x) => x.e);
  const atual = ordem.indexOf(p.estado);
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-muted/30">
    <ol className="grid min-w-[480px] gap-2 p-4" style={{ gridTemplateColumns: `repeat(${passos.length}, minmax(0,1fr))` }}>
      {passos.map((s, i) => {
        const feito = i < atual || (i === atual && p.estado === "entregue");
        const agora = i === atual && p.estado !== "entregue";
        const ruim = final && i === 1;
        const em = quando(s.e);
        return (
          <li key={s.e} className="relative min-w-0">
            {i < passos.length - 1 ? <span className={cx("absolute left-7 right-0 top-3 h-0.5", i < atual ? "bg-primary" : "bg-border")} /> : null}
            <span className={cx("relative inline-flex h-6 w-6 items-center justify-center rounded-full border-2",
              ruim ? "border-destructive bg-destructive text-white" : feito ? "border-primary bg-primary text-white" : agora ? "hl-halo border-accent bg-accent text-white" : "border-muted-foreground/50 bg-card")}>
              {feito || agora || ruim ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
            </span>
            <p className={cx("mt-1.5 text-xs font-semibold sm:text-sm", agora ? "text-[#a83a0c]" : ruim ? "text-[#b42318]" : "text-foreground")}>{s.rotulo}</p>
            <p className="text-xs text-muted-foreground">{em ? `${ddmm(em)} · ${hhmm(em)}` : s.sub ?? "Próxima etapa"}</p>
          </li>
        );
      })}
    </ol>
    </div>
  );
}

function imprimirComprovante(p: Pedido, loja: Loja) {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  const nome = (id: string) => loja.brindes.find((b) => b.id === id)?.nome ?? id;
  const receber = p.recebimento.forma === "entrega" ? `Entrega em mãos · ${p.recebimento.ondeEncontrar} · ${ddmm(p.recebimento.diaPresencial)}` : `Retirada · ${LOCAL_RETIRADA}`;
  w.document.write(`<html><head><title>Comprovante ${p.codigo}</title><style>body{font-family:'Open Sans',sans-serif;padding:40px;color:#1f2a5c}h1{font-family:Dosis,sans-serif;margin:0}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border-bottom:1px solid #ccd;padding:8px;text-align:left}.ass{margin-top:64px;border-top:1px solid #1f2a5c;width:60%;padding-top:6px}</style></head><body><p>Digi Store · Comprovante de entrega</p><h1>${p.codigo}</h1><p>${p.solicitante} · ${p.area}<br/>${receber}<br/>Finalidade: ${p.finalidade}</p><table><tr><th>Brinde</th><th>Qtd.</th></tr>${p.linhas.map((l) => `<tr><td>${nome(l.brindeId)}</td><td>${l.qtd}</td></tr>`).join("")}</table><div class="ass">Quem recebeu (nome e assinatura)</div><p style="margin-top:24px">Data: ____/____/______</p></body></html>`);
  w.document.close(); w.focus(); w.print();
}

function EsqueletoPedidos() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Carregando os pedidos</span>
      <Shimmer className="h-[150px] w-full rounded-2xl" />
      <Shimmer className="h-11 w-2/3" />
      <div className="grid gap-4 lg:grid-cols-[minmax(320px,400px)_1fr]">
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Shimmer key={i} className="h-28 w-full rounded-2xl" />)}</div>
        <EsqueletoDetalhe />
      </div>
    </div>
  );
}
function EsqueletoDetalhe() {
  return (
    <div className={cx(CARTAO, "space-y-4 p-6")} aria-busy="true">
      <Shimmer className="h-4 w-40" /><Shimmer className="h-8 w-56" /><Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-20 w-full" /><div className="grid grid-cols-3 gap-3"><Shimmer className="h-11" /><Shimmer className="h-11" /><Shimmer className="h-11" /></div>
      <Shimmer className="h-28 w-full" /><Shimmer className="h-40 w-full" />
    </div>
  );
}
