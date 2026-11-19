// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/AbaEstoque.tsx, PainelEstoqueBrinde.tsx e estoque-loja.ts @ origin/main aff470d (2026-11-19).
// Fonte da verdade = Lovable/GitHub. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-2026-11-19.md
// Regras reais espelhadas: Disponível = saldo − reserva − guardadas; entrada guarda primeiro para "Vamos repor" (em ordem de
// chegada, por 3 dias úteis); ajuste exige nota e não deixa o saldo abaixo de reserva + guardadas.
import { useEffect, useMemo, useRef, useState } from "react";
import { ClipboardCheck, Clock, Download, Loader2, Plus, UserRound } from "lucide-react";
import type { Loja } from "./HubLoja";
import { PRAZO_GUARDADAS, type Brinde, type Mov } from "./dados";
import { HOJE, baixarCsv, brl, ddmm, erroAjuste, erroEntrada, lerInteiro, somarDiasUteis, type Alerta } from "./regras";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO, FotoBrinde, Numero, ROTULO_PEQUENO, Segmentado, Shimmer, cx, useCarregando, useToast } from "./ui";

const MESES = ["Jun", "Jul", "Ago", "Set", "Out", "Nov"];
const NUM_MES = ["06", "07", "08", "09", "10", "11"];
const disp = (b: Brinde) => b.saldo - b.reserva - b.guardadas;
function saidasPorMes(movs: Mov[], id: string) {
  return NUM_MES.map((m) => movs.filter((x) => x.brindeId === id && x.tipo === "saida" && x.em.slice(5, 7) === m).reduce((s, x) => s + x.qtd, 0));
}
function mediaMensal(movs: Mov[], id: string) { const s = saidasPorMes(movs, id).slice(-4, -1); return s.reduce((a, b) => a + b, 0) / 3; }
function cobertura(b: Brinde, movs: Mov[]): { texto: string; meses: number | null } {
  if (!b.ativo) return { texto: "Fora da vitrine", meses: null };
  const d = disp(b);
  if (d <= 0) return { texto: "Sem unidades para novos pedidos", meses: 0 };
  const m = mediaMensal(movs, b.id);
  if (m <= 0) return { texto: "Sem saídas recentes", meses: null };
  const meses = d / m;
  if (meses > 12) return { texto: "Dura mais de 1 ano no ritmo atual", meses };
  if (meses < 1) return { texto: `Dura ~${Math.max(1, Math.round(meses * 4))} semanas no ritmo atual`, meses };
  return { texto: `Dura ~${Math.round(meses)} ${Math.round(meses) === 1 ? "mês" : "meses"} no ritmo atual`, meses };
}
function situacao(b: Brinde, movs: Mov[]): Alerta {
  if (!b.ativo) return "inativo";
  const d = disp(b);
  if (d <= 0) return "esgotado";
  if (b.minimo > 0 && d <= b.minimo) return "minimo";
  const c = cobertura(b, movs).meses;
  if (c !== null && c < 1) return "cobertura";
  return "ok";
}
const ROTULO_SIT: Record<Alerta, string> = { esgotado: "Esgotado", minimo: "Abaixo do mínimo", cobertura: "Cobertura baixa", ok: "Em dia", inativo: "Inativo" };
const COR_SIT: Record<Alerta, string> = {
  esgotado: "bg-[#fde8e6] text-[#b42318]", minimo: "bg-orange-soft text-[#a83a0c]", cobertura: "bg-warning-soft text-[#6b4d00]", ok: "bg-success-soft text-[#1a6340]", inativo: "bg-muted text-muted-foreground",
};

export function Estoque({ loja, carregando }: { loja: Loja; carregando: boolean }) {
  const toast = useToast();
  const { brindes, movs } = loja;
  const [cat, setCat] = useState<string>("Todas");
  const [sit, setSit] = useState<"todas" | "esgotado" | "cobertura" | "ok">("todas");
  const [selId, setSelId] = useState("b1");
  const [contagem, setContagem] = useState(false);
  const focoEntrada = useRef<() => void>(() => {});
  const categorias = ["Todas", ...new Set(brindes.map((b) => b.categoria))];
  const lista = brindes.filter((b) => (cat === "Todas" || b.categoria === cat) && (sit === "todas" || (sit === "esgotado" ? situacao(b, movs) === "esgotado" : sit === "cobertura" ? ["cobertura", "minimo"].includes(situacao(b, movs)) : situacao(b, movs) === "ok")));
  const sel = brindes.find((b) => b.id === selId) ?? brindes[0]!;
  const ativos = brindes.filter((b) => b.ativo);
  const valor = ativos.reduce((s, b) => s + b.saldo * b.custo, 0);
  const reservado = brindes.reduce((s, b) => s + b.reserva, 0);
  const esgotados = ativos.filter((b) => disp(b) <= 0);
  const semMinimo = ativos.filter((b) => b.minimo <= 0).length;

  function listaReposicao() {
    const itens = ativos.filter((b) => ["esgotado", "minimo", "cobertura"].includes(situacao(b, movs)));
    baixarCsv(`reposicao-${HOJE}.csv`, [["Brinde", "Disponível", "Mínimo", "Média mensal de saídas", "Sugestão de compra"], ...itens.map((b) => { const m = Math.ceil(mediaMensal(movs, b.id)); return [b.nome, disp(b), b.minimo, m, Math.max(m * 2 - disp(b), m)]; })]);
    toast({ texto: `Lista de reposição com ${itens.length} ${itens.length === 1 ? "brinde" : "brindes"} baixada.` });
  }

  if (carregando) return <EsqueletoEstoque />;
  return (
    <div className="space-y-4">
      <div className="hl-entra-seq grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador rotulo="Valor em estoque" valor={brl(valor)} apoio={`Saldo × custo unitário de ${ativos.length} brindes ativos`} />
        <Indicador rotulo="Reservado em pedidos" valor={`${reservado} un.`} apoio="Sai do saldo quando a entrega é confirmada" />
        <Indicador rotulo="Esgotados" valor={String(esgotados.length)} apoio={esgotados.map((b) => b.nome).join(" · ") || "Nenhum brinde esgotado"} alerta={esgotados.length > 0} />
        <Indicador rotulo="Sem mínimo definido" valor={`${semMinimo} de ${ativos.length}`} apoio="Sem mínimo, o alerta de reposição não dispara" />
      </div>

      <div className="hl-entra flex flex-wrap items-center gap-2">
        <Segmentado rotulo="Categoria" valor={cat} aoMudar={setCat} opcoes={categorias.map((c) => ({ id: c, rotulo: c }))} />
        <Segmentado rotulo="Situação" valor={sit} aoMudar={setSit} opcoes={[{ id: "todas", rotulo: "Todas" }, { id: "esgotado", rotulo: "Esgotados" }, { id: "cobertura", rotulo: "Precisa repor" }, { id: "ok", rotulo: "Em dia" }]} />
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => setContagem(true)} className={BOTAO_SECUNDARIO}><ClipboardCheck className="h-4 w-4" aria-hidden />Contagem física</button>
          <button type="button" onClick={listaReposicao} className={BOTAO_SECUNDARIO}><Download className="h-4 w-4" aria-hidden />Lista de reposição</button>
          <button type="button" onClick={() => focoEntrada.current()} className={BOTAO_PRIMARIO}><Plus className="h-4 w-4" aria-hidden />Registrar entrada</button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_440px] xl:items-start">
        <ul className="hl-entra-seq grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
          {lista.map((b) => <CartaoBrinde key={b.id} b={b} movs={movs} sel={b.id === sel.id} onClick={() => setSelId(b.id)} />)}
          {lista.length === 0 ? <li className={cx(CARTAO, "col-span-full p-6 text-center text-sm text-muted-foreground")}>Nenhum brinde com esses filtros.</li> : null}
        </ul>
        <div className="xl:sticky xl:top-4">
          <Painel key={sel.id} b={sel} loja={loja} registrarFoco={(f) => { focoEntrada.current = f; }} />
        </div>
      </div>
      {contagem ? <ContagemFisica loja={loja} fechar={() => setContagem(false)} /> : null}
    </div>
  );
}

function Indicador({ rotulo, valor, apoio, alerta }: { rotulo: string; valor: string; apoio: string; alerta?: boolean }) {
  return (
    <div className={cx(CARTAO, "p-4", alerta ? "border-[#f4c7bb]" : "")}>
      <p className={cx(ROTULO_PEQUENO, alerta ? "text-[#b42318]" : "")}>{rotulo}</p>
      <p className={cx("mt-1 font-display text-[28px] font-bold leading-tight", alerta ? "text-[#b42318]" : "text-primary")}><Numero valor={valor} /></p>
      <p className="mt-1 text-xs text-muted-foreground">{apoio}</p>
    </div>
  );
}

function Composicao({ b }: { b: Brinde }) {
  const t = Math.max(1, b.saldo);
  const pr = b.reserva / t, pg = b.guardadas / t, pd = Math.max(0, disp(b)) / t;
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-muted" aria-label={`Reserva ${b.reserva}, guardadas ${b.guardadas}, disponível ${disp(b)}`}>
      <span className="hl-cresce h-full bg-primary" style={{ width: `${pr * 100}%` }} />
      <span className="hl-cresce h-full bg-sky" style={{ width: `${pg * 100}%` }} />
      <span className="hl-cresce h-full bg-accent" style={{ width: `${pd * 100}%` }} />
    </div>
  );
}

function CartaoBrinde({ b, movs, sel, onClick }: { b: Brinde; movs: Mov[]; sel: boolean; onClick: () => void }) {
  const s = situacao(b, movs);
  const d = disp(b);
  return (
    <li>
      <button type="button" onClick={onClick} className={cx(CARTAO, "hl-elevar block w-full overflow-hidden text-left", sel ? "border-2 border-primary" : "")}>
        <div className="relative">
          <FotoBrinde src={b.foto} alt={b.nome} apagada={!b.ativo} className="h-[170px] w-full" />
          <span className={cx("absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold", COR_SIT[s])}>{ROTULO_SIT[s]}</span>
          <span className="absolute bottom-3 right-3 rounded-full bg-card/90 px-2.5 py-0.5 text-xs text-foreground shadow-sm">{b.categoria}</span>
        </div>
        <div className="space-y-2.5 p-4">
          <div><p className="font-semibold leading-snug text-primary">{b.nome}</p><p className="text-xs text-muted-foreground">{brl(b.custo)} por unidade</p></div>
          <Composicao b={b} />
          <div className="grid grid-cols-3 text-xs text-muted-foreground">
            <span>Saldo<br /><Numero valor={b.saldo} className="font-display text-lg font-bold text-primary" /></span>
            <span>Reserva<br /><Numero valor={b.reserva} className="font-display text-lg font-bold text-primary" /></span>
            <span>Disponível<br /><Numero valor={d} className={cx("font-display text-lg font-bold", d <= 0 ? "text-[#b42318]" : "text-primary")} /></span>
          </div>
          <p className="flex items-center gap-1.5 border-t border-border pt-2.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" aria-hidden />{cobertura(b, movs).texto}</p>
        </div>
      </button>
    </li>
  );
}

function Painel({ b, loja, registrarFoco }: { b: Brinde; loja: Loja; registrarFoco: (f: () => void) => void }) {
  const toast = useToast();
  const carregando = useCarregando(b.id, 320);
  const [modo, setModo] = useState<"entrada" | "ajuste">("entrada");
  const [qtd, setQtd] = useState("");
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const campo = useRef<HTMLInputElement>(null);
  useEffect(() => { registrarFoco(() => { setModo("entrada"); campo.current?.focus(); campo.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }); }, [registrarFoco]);
  const saidas = saidasPorMes(loja.movs, b.id);
  const max = Math.max(1, ...saidas);
  const media = mediaMensal(loja.movs, b.id);
  const sugerido = Math.ceil(media);
  const d = disp(b);
  const fila = loja.reposicoes.filter((r) => r.brindeId === b.id && r.guardado < r.qtd).sort((x, y) => x.criadoEm.localeCompare(y.criadoEm));
  const n = lerInteiro(qtd);
  const previsto = (() => { let resto = Number.isInteger(n) && n > 0 ? n : 0; return fila.map((r) => { const g = Math.min(resto, r.qtd - r.guardado); resto -= g; return { ...r, g }; }).filter((r) => r.g > 0); })();
  const historico = loja.movs.filter((m) => m.brindeId === b.id).sort((x, y) => y.em.localeCompare(x.em)).slice(0, 5);

  async function registrar() {
    setMsg(null);
    const e = modo === "entrada" ? erroEntrada(n) : erroAjuste(b, n, nota);
    if (e) { setMsg({ ok: false, texto: e }); return; }
    setOcupado(true);
    await new Promise((r) => setTimeout(r, 450));
    if (modo === "entrada") {
      const guardar = previsto.reduce((s, r) => s + r.g, 0);
      loja.setBrindes((bs) => bs.map((x) => (x.id === b.id ? { ...x, saldo: x.saldo + n, guardadas: x.guardadas + guardar } : x)));
      loja.setReposicoes((rs) => rs.map((r) => { const p = previsto.find((x) => x.id === r.id); return p ? { ...r, guardado: r.guardado + p.g } : r; }));
      loja.setMovs((m) => [{ id: `e${Date.now()}`, brindeId: b.id, tipo: "entrada", qtd: n, em: HOJE, nota: nota.trim() || null }, ...m]);
      setMsg({ ok: true, texto: guardar > 0 ? `Entrada de ${n} registrada. ${guardar} ${guardar === 1 ? "unidade ficou guardada" : "unidades ficaram guardadas"} para ${previsto.map((r) => r.pessoa).join(" e ")}.` : `Entrada de ${n} registrada.` });
    } else {
      loja.setBrindes((bs) => bs.map((x) => (x.id === b.id ? { ...x, saldo: x.saldo + n } : x)));
      loja.setMovs((m) => [{ id: `a${Date.now()}`, brindeId: b.id, tipo: "ajuste", qtd: n, em: HOJE, nota: nota.trim() }, ...m]);
      setMsg({ ok: true, texto: `Ajuste de ${n > 0 ? "+" : ""}${n} registrado.` });
    }
    setOcupado(false); setQtd(""); setNota("");
  }

  if (carregando) return <div className={cx(CARTAO, "space-y-4 p-5")}><Shimmer className="h-60 w-full" /><Shimmer className="h-6 w-2/3" /><Shimmer className="h-20 w-full" /><Shimmer className="h-32 w-full" /></div>;
  return (
    <aside className={cx(CARTAO, "hl-entra overflow-hidden")}>
      <FotoBrinde src={b.foto} alt={b.nome} apagada={!b.ativo} className="h-[240px] w-full border-b border-border" />
      <div className="space-y-4 p-5">
        <div>
          <p className={ROTULO_PEQUENO}>{b.categoria}</p>
          <h2 className="font-display text-2xl font-bold leading-tight text-primary">{b.nome}</h2>
          <p className="text-sm text-muted-foreground">{brl(b.custo)} por unidade{b.maximoPorPedido ? ` · máximo de ${b.maximoPorPedido} por pedido` : " · sem limite por pedido"}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[["Saldo", b.saldo], ["Reserva", b.reserva], ["Guardadas", b.guardadas]].map(([r, v]) => (
            <div key={r as string} className="rounded-xl bg-muted/60 p-2.5"><p className="text-[11px] text-muted-foreground">{r}</p><Numero valor={v as number} className="font-display text-xl font-bold text-primary" /></div>
          ))}
          <div className="rounded-xl bg-primary p-2.5 text-primary-foreground"><p className="text-[11px] opacity-80">Disponível</p><Numero valor={d} className="font-display text-xl font-bold" /></div>
        </div>

        <section>
          <div className="flex items-baseline justify-between"><p className="text-sm font-semibold">Saídas por mês</p><p className="text-xs text-muted-foreground">{cobertura(b, loja.movs).texto}</p></div>
          <div className="mt-2 flex h-24 items-end gap-2">
            {saidas.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{v}</span>
                <span className={cx("hl-cresce-y w-full rounded-t-md", i === saidas.length - 1 ? "bg-accent" : "bg-primary/80")} style={{ height: `${Math.max(4, (v / max) * 60)}px` }} />
                <span className="text-[10px] text-muted-foreground">{MESES[i]}</span>
              </div>
            ))}
          </div>
        </section>

        {sugerido > 0 && b.minimo !== sugerido ? (
          <div className="flex items-center gap-3 rounded-xl bg-orange-soft p-3 text-sm text-[#7a2a12]">
            <p className="min-w-0 flex-1"><strong>Mínimo sugerido: {sugerido} un.</strong> Cobre um mês de saídas. Hoje o mínimo é {b.minimo}.</p>
            <button type="button" onClick={() => { loja.setBrindes((bs) => bs.map((x) => (x.id === b.id ? { ...x, minimo: sugerido } : x))); toast({ texto: `Mínimo de ${b.nome} ajustado para ${sugerido}.` }); }} className="min-h-11 shrink-0 rounded-xl border border-[#e9a58f] bg-card px-3 font-semibold text-[#7a2a12] hover:bg-white">Aplicar</button>
          </div>
        ) : null}

        <section className="rounded-2xl border border-border p-4">
          <Segmentado rotulo="Movimentar estoque" valor={modo} aoMudar={(v) => { setModo(v); setMsg(null); }} opcoes={[{ id: "entrada", rotulo: "Registrar entrada" }, { id: "ajuste", rotulo: "Registrar ajuste" }]} />
          <div className="mt-3 grid grid-cols-[110px_1fr] gap-2">
            <label className="text-xs font-semibold">Quantidade<input ref={campo} value={qtd} onChange={(e) => { setQtd(e.target.value); setMsg(null); }} inputMode="numeric" placeholder={modo === "entrada" ? "Ex.: 50" : "Ex.: -2"} className="mt-1 h-11 w-full rounded-xl border border-muted-foreground/40 bg-card px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
            <label className="text-xs font-semibold">{modo === "entrada" ? "Nota (opcional)" : "Motivo do ajuste"}<input value={nota} onChange={(e) => { setNota(e.target.value); setMsg(null); }} placeholder={modo === "entrada" ? "Ex.: nota fiscal ou fornecedor" : "Ex.: avaria na caixa"} className="mt-1 h-11 w-full rounded-xl border border-muted-foreground/40 bg-card px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          </div>
          {/* Aviso das guardadas: espaço reservado para não empurrar o botão. */}
          <div className="mt-3 min-h-[64px]">
            {modo === "entrada" && fila.length > 0 ? (
              <p className="hl-entra flex gap-2 rounded-xl bg-sky-soft p-3 text-xs text-[#0b4a62]">
                <UserRound className="h-4 w-4 shrink-0" aria-hidden />
                {previsto.length > 0
                  ? `Esta entrada atende primeiro ${previsto.length === 1 ? "1 pedido" : `${previsto.length} pedidos`} de mais unidades: ${previsto.map((r) => `${r.g} un. para ${r.pessoa}`).join(", ")}, guardadas até ${ddmm(somarDiasUteis(HOJE, PRAZO_GUARDADAS))} (${PRAZO_GUARDADAS} dias úteis).`
                  : `${fila.length === 1 ? "1 pessoa espera" : `${fila.length} pessoas esperam`} reposição deste brinde (${fila.map((r) => r.pessoa).join(", ")}). A próxima entrada guarda para elas primeiro.`}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" disabled={ocupado} onClick={registrar} className={BOTAO_PRIMARIO}>{ocupado ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}{modo === "entrada" ? "Registrar entrada" : "Registrar ajuste"}</button>
            <p role={msg && !msg.ok ? "alert" : "status"} className={cx("min-h-5 min-w-0 flex-1 text-xs", msg?.ok ? "font-semibold text-[#1a6340]" : "text-[#b42318]")}>{msg?.texto ?? ""}</p>
          </div>
        </section>

        <section>
          <p className="text-sm font-semibold">Histórico de movimentações</p>
          <ul className="mt-2 divide-y divide-border text-sm">
            {historico.map((m) => (
              <li key={m.id} className="hl-entra grid grid-cols-[90px_50px_1fr] gap-2 py-2">
                <span className="font-semibold">{m.tipo === "saida" ? "Retirada" : m.tipo === "entrada" ? "Entrada" : m.tipo === "ajuste" ? "Ajuste" : "Saldo inicial"}</span>
                <span className={cx("font-semibold tabular-nums", m.tipo === "saida" || m.qtd < 0 ? "text-[#b42318]" : "text-[#1a6340]")}>{m.tipo === "saida" ? `−${m.qtd}` : m.qtd > 0 ? `+${m.qtd}` : `−${Math.abs(m.qtd)}`}</span>
                <span className="text-muted-foreground">{ddmm(m.em)}{m.nota ? ` · ${m.nota}` : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}

function ContagemFisica({ loja, fechar }: { loja: Loja; fechar: () => void }) {
  const toast = useToast();
  const ativos = loja.brindes.filter((b) => b.ativo);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const difs = useMemo(() => ativos.map((b) => ({ b, v: lerInteiro(valores[b.id] ?? "") })).filter((x) => Number.isInteger(x.v) && x.v !== x.b.saldo), [ativos, valores]);
  function aplicar() {
    const e: Record<string, string> = {};
    const nota = `Contagem física ${ddmm(HOJE)}`;
    for (const { b, v } of difs) { const msg = erroAjuste(b, v - b.saldo, nota); if (msg) e[b.id] = msg; }
    setErros(e);
    if (Object.keys(e).length) return;
    loja.setBrindes((bs) => bs.map((b) => { const d = difs.find((x) => x.b.id === b.id); return d ? { ...b, saldo: d.v } : b; }));
    loja.setMovs((m) => [...difs.map(({ b, v }, i) => ({ id: `c${Date.now()}${i}`, brindeId: b.id, tipo: "ajuste" as const, qtd: v - b.saldo, em: HOJE, nota })), ...m]);
    toast({ texto: difs.length ? `${difs.length} ${difs.length === 1 ? "ajuste registrado" : "ajustes registrados"} com a nota "${nota}".` : "Contagem conferida, sem diferenças." });
    fechar();
  }
  return (
    <div role="dialog" aria-modal="true" aria-label="Contagem física" className="fixed inset-0 z-40 flex items-center justify-center bg-[#0b1230]/40 p-4">
      <div className={cx(CARTAO, "hl-toast max-h-[90vh] w-full max-w-xl overflow-y-auto p-6")}>
        <h2 className="font-display text-2xl font-bold text-primary">Contagem física</h2>
        <p className="mt-1 text-sm text-muted-foreground">Digite quantas unidades você contou. Cada diferença vira um ajuste com a nota "Contagem física {ddmm(HOJE)}".</p>
        <ul className="mt-4 divide-y divide-border">
          {ativos.map((b) => {
            const v = lerInteiro(valores[b.id] ?? "");
            const dif = Number.isInteger(v) ? v - b.saldo : 0;
            return (
              <li key={b.id} className="grid grid-cols-[40px_1fr_90px_60px] items-center gap-3 py-2">
                <FotoBrinde src={b.foto} alt="" pad="p-0.5" className="h-10 w-10 rounded-lg border border-border" />
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{b.nome}</p><p className="text-xs text-muted-foreground">No sistema: {b.saldo}</p>{erros[b.id] ? <p className="text-xs text-[#b42318]">{erros[b.id]}</p> : null}</div>
                <input aria-label={`Contagem de ${b.nome}`} value={valores[b.id] ?? ""} onChange={(e) => setValores((x) => ({ ...x, [b.id]: e.target.value }))} inputMode="numeric" className="h-11 rounded-xl border border-muted-foreground/40 bg-card px-3 text-sm" />
                <span className={cx("text-right text-sm font-semibold tabular-nums", dif < 0 ? "text-[#b42318]" : dif > 0 ? "text-[#1a6340]" : "text-muted-foreground")}>{dif === 0 ? "—" : dif > 0 ? `+${dif}` : dif}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={fechar} className={BOTAO_SECUNDARIO}>Cancelar</button>
          <button type="button" onClick={aplicar} className={BOTAO_PRIMARIO}>Registrar {difs.length} {difs.length === 1 ? "ajuste" : "ajustes"}</button>
        </div>
      </div>
    </div>
  );
}

function EsqueletoEstoque() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Carregando o estoque</span>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Shimmer key={i} className="h-28 rounded-2xl" />)}</div>
      <Shimmer className="h-11 w-3/4" />
      <div className="grid gap-4 xl:grid-cols-[1fr_440px]">
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">{[0, 1, 2, 3, 4, 5].map((i) => <Shimmer key={i} className="h-[330px] rounded-2xl" />)}</div>
        <Shimmer className="h-[640px] rounded-2xl" />
      </div>
    </div>
  );
}