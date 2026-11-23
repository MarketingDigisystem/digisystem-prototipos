// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/AbaSolicitacoes.tsx, AbaSugestoes.tsx, FilaMaisUnidades.tsx, sugestoes-loja.ts e
// solicitacoes-mais-loja.ts @ origin/main aff470d (2026-11-19).
// Fonte da verdade = Lovable/GitHub. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-2026-11-19.md
// Mudança proposta (decisão do usuário 2026-11-19): "Aprovar" cria NA HORA um brinde inativo marcado como rascunho no
// Cadastro, vinculado à sugestão. Hoje o Hub só abre o formulário preenchido, sem salvar.
import { useMemo, useState } from "react";
import { ExternalLink, FileText, Loader2, Users } from "lucide-react";
import type { Loja } from "./HubLoja";
import { ROTULO_FAIXA, type MaisUnidades, type Sugestao } from "./dados";
import { HOJE, ddmm, somarDias } from "./regras";
import { BOTAO_DESTRUTIVO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO, FotoBrinde, ROTULO_PEQUENO, Shimmer, cx, useCarregando, useToast } from "./ui";

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
const dataBr = (iso: string) => (/^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : iso);
const ROTULO_SUG: Record<Sugestao["estado"], string> = { aberta: "Aberta", aprovada: "Aprovada", recusada: "Recusada" };
const COR_SUG: Record<Sugestao["estado"], string> = { aberta: "bg-orange-soft text-[#a83a0c]", aprovada: "bg-success-soft text-[#1a6340]", recusada: "bg-[#fde8e6] text-[#b42318]" };
const ROTULO_MAIS: Record<MaisUnidades["estado"], string> = { aberta: "Aberto", vamos_repor: "Vamos repor", nao_repor: "Não vamos repor", outra_opcao: "Outra opção" };

/** Mesma regra da Loja: 7 grupos de detalhes, o nome não conta. */
function contarDetalhes(s: Sugestao): number {
  return [s.categoria !== "", s.descricao !== "", s.porQueCombina !== "", s.link !== "", s.ocasioes.length > 0 || s.publicos.length > 0, s.dataNecessaria !== "", s.quantidadeEstimada !== null || s.faixaCusto !== ""].filter(Boolean).length;
}
const palavras = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter((p) => p.length >= 4);
/** Outras pessoas que pediram algo parecido nos últimos 90 dias (palavra de 4+ letras em comum no nome). Só no Hub. */
function parecidas(s: Sugestao, todas: Sugestao[]): Sugestao[] {
  const p = new Set(palavras(s.nome));
  const limite = somarDias(HOJE, -90);
  return todas.filter((x) => x.id !== s.id && x.pessoa !== s.pessoa && x.criadoEm.slice(0, 10) >= limite && palavras(x.nome).some((w) => p.has(w)));
}

export function Solicitacoes({ loja, carregando }: { loja: Loja; carregando: boolean }) {
  const [fila, setFila] = useState<"novo" | "mais">("novo");
  const nNovo = loja.sugestoes.filter((s) => s.estado === "aberta").length;
  const nMais = loja.mais.filter((m) => m.estado === "aberta").length;
  if (carregando) return <div className="space-y-4" aria-busy="true"><Shimmer className="h-11 w-72" /><div className="grid gap-4 lg:grid-cols-[380px_1fr]"><div className="space-y-3">{[0, 1, 2].map((i) => <Shimmer key={i} className="h-24 rounded-2xl" />)}</div><Shimmer className="h-[460px] rounded-2xl" /></div></div>;
  const pill = (id: "novo" | "mais", rotulo: string, n: number) => (
    <button type="button" aria-pressed={fila === id} onClick={() => setFila(id)} className={cx("inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors", fila === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary hover:bg-muted")}>
      {rotulo}
      {/* Contador com largura fixa: a pill não muda de tamanho quando o número muda. */}
      <span className={cx("inline-flex h-6 min-w-[2.25rem] items-center justify-center rounded-full px-1.5 text-xs tabular-nums", fila === id ? "bg-white/20" : "bg-navy-soft")}>{n}</span>
    </button>
  );
  return (
    <div className="space-y-4">
      <div role="group" aria-label="Filas de solicitações" className="hl-entra flex flex-wrap gap-2">{pill("novo", "Brinde novo", nNovo)}{pill("mais", "Mais unidades", nMais)}</div>
      {fila === "novo" ? <BrindeNovo loja={loja} /> : <FilaMais loja={loja} />}
    </div>
  );
}

/* =============================== Brinde novo =============================== */

function BrindeNovo({ loja }: { loja: Loja }) {
  const ordenadas = useMemo(() => [...loja.sugestoes].sort((a, b) => (a.estado === "aberta" ? 0 : 1) - (b.estado === "aberta" ? 0 : 1) || b.criadoEm.localeCompare(a.criadoEm)), [loja.sugestoes]);
  const [selId, setSelId] = useState(ordenadas[0]?.id ?? "");
  const sel = loja.sugestoes.find((s) => s.id === selId) ?? null;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(300px,380px)_1fr] lg:items-start">
      <ul className="hl-entra-seq space-y-2.5">
        {ordenadas.map((s) => {
          const n = contarDetalhes(s);
          return (
            <li key={s.id}>
              <button type="button" onClick={() => setSelId(s.id)} className={cx(CARTAO, "hl-elevar block w-full p-4 text-left", s.id === selId ? "border-primary ring-1 ring-primary" : "")}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-base font-bold leading-snug text-primary">{s.nome}</p>
                  <span className={cx("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", COR_SUG[s.estado])}>{ROTULO_SUG[s.estado]}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.pessoa} · {s.area} · enviada em {ddmm(s.criadoEm)}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className="hl-cresce absolute inset-y-0 left-0 w-full rounded-full bg-primary" style={{ transform: `scaleX(${n / 7})` }} /></span>
                  <span className="shrink-0 text-xs text-muted-foreground">{n} de 7 detalhes</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {sel ? <DetalheSugestao key={sel.id} s={sel} loja={loja} /> : null}
    </div>
  );
}

function Bloco({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className={cx("mt-0.5 font-semibold", valor ? "text-foreground" : "text-muted-foreground")}>{valor || "Não informado"}</p>
    </div>
  );
}

function DetalheSugestao({ s, loja }: { s: Sugestao; loja: Loja }) {
  const toast = useToast();
  const carregando = useCarregando(s.id, 300);
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<"aprovar" | "recusar" | null>(null);
  const outras = parecidas(s, loja.sugestoes);
  const rascunho = s.brindeRascunhoId ? loja.brindes.find((b) => b.id === s.brindeRascunhoId) : undefined;

  async function aprovar() {
    setOcupado("aprovar");
    await espera(650);
    const id = `r${Date.now()}`;
    // O rascunho nasce com o que a sugestão trouxe; preço, estoque e foto ficam para quem revisar.
    loja.setBrindes((bs) => [...bs, { id, nome: s.nome, categoria: s.categoria || "Sem categoria", foto: null, custo: null, saldo: 0, reserva: 0, guardadas: 0, minimo: 0, maximoPorPedido: null, ativo: false, descricao: s.descricao, rascunho: { sugestaoId: s.id, sugeridoPor: s.pessoa } }]);
    loja.setSugestoes((ss) => ss.map((x) => (x.id === s.id ? { ...x, estado: "aprovada", brindeRascunhoId: id } : x)));
    setOcupado(null);
    toast({ texto: `Sugestão aprovada. O rascunho “${s.nome}” foi criado no Cadastro e fica inativo até você publicar. ${s.pessoa} recebe o e-mail da decisão.`, acao: { rotulo: "Abrir rascunho", fazer: () => loja.irPara("cadastro", `?brinde=${id}`) } });
  }
  async function recusar() {
    if (!recusando) { setRecusando(true); setErro(null); return; }
    if (!motivo.trim()) { setErro("Informe o motivo da recusa. Ele vai no e-mail ao Solicitante."); return; }
    setOcupado("recusar");
    await espera(500);
    loja.setSugestoes((ss) => ss.map((x) => (x.id === s.id ? { ...x, estado: "recusada", motivo: motivo.trim() } : x)));
    setOcupado(null);
    setRecusando(false);
    toast({ texto: `Sugestão recusada. ${s.pessoa} recebe o motivo por e-mail.` });
  }

  if (carregando) return <div className={cx(CARTAO, "space-y-4 p-6")}><Shimmer className="h-5 w-48" /><Shimmer className="h-8 w-72" /><div className="grid grid-cols-3 gap-3"><Shimmer className="h-16" /><Shimmer className="h-16" /><Shimmer className="h-16" /></div><Shimmer className="h-40" /></div>;
  return (
    <article className={cx(CARTAO, "hl-entra p-5 sm:p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={ROTULO_PEQUENO}>Sugestão de brinde novo</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-primary">{s.nome}</h2>
          <p className="text-sm text-muted-foreground">{s.pessoa} · {s.email} · {s.area} · enviada em {dataBr(s.criadoEm.slice(0, 10))}</p>
        </div>
        {/* Ações: a mesma faixa em todos os estados. Sem ação, o espaço fica com o resultado da decisão. */}
        <div className="flex min-h-11 flex-wrap items-center gap-2">
          {s.estado === "aberta" ? (
            <>
              <button type="button" disabled={!!ocupado} onClick={recusar} className={cx(BOTAO_DESTRUTIVO, "w-[176px]")}>{ocupado === "recusar" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}{recusando ? "Confirmar recusa" : "Recusar"}</button>
              <button type="button" disabled={!!ocupado} onClick={aprovar} className={cx(BOTAO_PRIMARIO, "w-[236px]")}>{ocupado === "aprovar" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}Aprovar e criar rascunho</button>
            </>
          ) : (
            <span className={cx("rounded-full px-3 py-1 text-sm font-semibold", COR_SUG[s.estado])}>{ROTULO_SUG[s.estado]}</span>
          )}
        </div>
      </div>

      {/* Faixa de decisão: altura reservada para o motivo da recusa ou o resultado. */}
      <div className="mt-4 min-h-[76px]">
        {s.estado === "aberta" && recusando ? (
          <div className="hl-entra">
            <label htmlFor="motivo-sug" className="text-sm font-semibold">Motivo da recusa (vai no e-mail ao Solicitante)</label>
            <div className="mt-1 flex gap-2">
              <input id="motivo-sug" autoFocus value={motivo} onChange={(e) => { setMotivo(e.target.value); setErro(null); }} className="h-11 min-w-0 flex-1 rounded-xl border border-muted-foreground/40 bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <button type="button" onClick={() => { setRecusando(false); setErro(null); }} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-primary hover:bg-muted">Cancelar</button>
            </div>
            <p className="mt-1 min-h-5 text-sm text-[#b42318]">{erro ?? ""}</p>
          </div>
        ) : s.estado === "aprovada" ? (
          <div className="hl-entra flex flex-wrap items-center gap-3 rounded-2xl border border-success/40 bg-success-soft p-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-[#1a6340]"><FileText className="h-5 w-5" aria-hidden /></span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-[#1a6340]">{rascunho ? (rascunho.rascunho ? "Rascunho criado no Cadastro" : rascunho.ativo ? "Já publicado na Digi Store" : "Salvo no Cadastro, ainda inativo") : "Rascunho descartado"}</p>
              <p className="text-[#24573c]">{rascunho ? `“${rascunho.nome}” · ${rascunho.ativo ? "visível para os Solicitantes" : "fora da vitrine até você publicar"}` : "O rascunho foi descartado no Cadastro."}</p>
            </div>
            {rascunho ? <button type="button" onClick={() => loja.irPara("cadastro", `?brinde=${rascunho.id}`)} className={BOTAO_SECUNDARIO}>Abrir no Cadastro</button> : null}
          </div>
        ) : s.estado === "recusada" ? (
          <p className="hl-entra rounded-2xl bg-[#fde8e6] p-3 text-sm text-[#8a1c12]"><strong>Motivo:</strong> {s.motivo}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Aprovar cria o brinde no Cadastro como rascunho inativo, com nome, categoria e descrição da sugestão. Nada vai para a vitrine até você publicar.</p>
        )}
      </div>

      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        <Bloco rotulo="Precisa até" valor={s.dataNecessaria ? dataBr(s.dataNecessaria) : ""} />
        <Bloco rotulo="Quantidade estimada" valor={s.quantidadeEstimada ? `${s.quantidadeEstimada} unidades` : ""} />
        <Bloco rotulo="Faixa de custo" valor={ROTULO_FAIXA[s.faixaCusto] ?? ""} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section><p className={ROTULO_PEQUENO}>Por que combina</p><p className={cx("mt-1 text-sm", s.porQueCombina ? "" : "text-muted-foreground")}>{s.porQueCombina || "Não informado"}</p></section>
        <section><p className={ROTULO_PEQUENO}>Descrição</p><p className={cx("mt-1 text-sm", s.descricao ? "" : "text-muted-foreground")}>{s.descricao || "Não informado"}</p></section>
        <section>
          <p className={ROTULO_PEQUENO}>Ocasiões e públicos</p>
          {s.ocasioes.length + s.publicos.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">{[...s.ocasioes, ...s.publicos].map((o) => <span key={o} className="rounded-full bg-navy-soft px-2.5 py-0.5 text-xs font-semibold text-primary">{o}</span>)}</div>
          ) : <p className="mt-1 text-sm text-muted-foreground">Não informado</p>}
        </section>
        <section>
          <p className={ROTULO_PEQUENO}>Referência</p>
          {s.link ? <a href={s.link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-4">Link do fornecedor<ExternalLink className="h-3.5 w-3.5" aria-hidden /></a> : <p className="mt-1 text-sm text-muted-foreground">Não informado</p>}
        </section>
      </div>
      {outras.length > 0 ? (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sky-soft p-3 text-sm text-[#0b4a62]">
          <Users className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{outras.length === 1 ? "Outra pessoa pediu" : `Outras ${outras.length} pessoas pediram`} algo parecido nos últimos 90 dias: {outras.map((o) => `${o.nome} (${o.pessoa}, ${ROTULO_SUG[o.estado].toLowerCase()})`).join("; ")}.</span>
        </p>
      ) : null}
    </article>
  );
}

/* =============================== Mais unidades =============================== */

type Resposta = "vamos_repor" | "nao_repor" | "outra_opcao";
const RESPOSTAS: { id: Resposta; rotulo: string }[] = [{ id: "vamos_repor", rotulo: "Vamos repor" }, { id: "nao_repor", rotulo: "Não vamos repor" }, { id: "outra_opcao", rotulo: "Outra opção" }];

function FilaMais({ loja }: { loja: Loja }) {
  const ordenadas = [...loja.mais].sort((a, b) => (a.estado === "aberta" ? 0 : 1) - (b.estado === "aberta" ? 0 : 1) || a.criadoEm.localeCompare(b.criadoEm));
  const brinde = (id: string) => loja.brindes.find((b) => b.id === id);
  return (
    <ul className="hl-entra-seq grid gap-3 xl:grid-cols-2">
      {ordenadas.map((m) => <CartaoMais key={m.id} m={m} loja={loja} nome={brinde(m.brindeId)?.nome ?? "Brinde"} foto={brinde(m.brindeId)?.foto ?? null} />)}
    </ul>
  );
}

function CartaoMais({ m, loja, nome, foto }: { m: MaisUnidades; loja: Loja; nome: string; foto: string | null }) {
  const toast = useToast();
  const [resp, setResp] = useState<Resposta>("vamos_repor");
  const [previsao, setPrevisao] = useState("");
  const [motivo, setMotivo] = useState("");
  const [alt, setAlt] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const alternativos = loja.brindes.filter((b) => b.ativo && !b.rascunho && b.id !== m.brindeId);
  const nomeAlt = loja.brindes.find((b) => b.id === m.alternativoId)?.nome;

  function erroDaResposta(): string | null {
    if (resp === "vamos_repor") return !/^\d{4}-\d{2}-\d{2}$/.test(previsao) ? "Informe a previsão de chegada." : previsao < HOJE ? "A previsão de chegada não pode ser uma data que já passou." : null;
    if (resp === "nao_repor") return motivo.trim() ? null : "Informe o motivo.";
    return alt ? null : "Indique um brinde do catálogo.";
  }
  async function responder() {
    const e = erroDaResposta();
    if (e) { setErro(e); return; }
    setOcupado(true);
    await espera(550);
    loja.setMais((ms) => ms.map((x) => (x.id === m.id ? { ...x, estado: resp, previsao: resp === "vamos_repor" ? previsao : "", motivoResposta: resp === "nao_repor" ? motivo.trim() : "", alternativoId: resp === "outra_opcao" ? alt : "" } : x)));
    if (resp === "vamos_repor") {
      // A próxima entrada desse brinde no Estoque guarda as unidades para esta pessoa, em ordem de chegada.
      loja.setReposicoes((rs) => [...rs, { id: `r${m.id}`, brindeId: m.brindeId, pessoa: m.pessoa, qtd: m.qtd, guardado: 0, criadoEm: m.criadoEm }]);
      toast({ texto: `Resposta enviada a ${m.pessoa}. Quando a entrada de ${nome} for registrada, ${m.qtd} un. ficam guardadas para ela.`, acao: { rotulo: "Ver no Estoque", fazer: () => loja.irPara("estoque") } });
    } else toast({ texto: `Resposta enviada a ${m.pessoa} por e-mail.` });
    setOcupado(false);
  }

  const resumo = m.estado === "vamos_repor" ? `Vamos repor. Previsão de chegada: ${dataBr(m.previsao)}.` : m.estado === "nao_repor" ? `Não vamos repor. Motivo: ${m.motivoResposta}` : m.estado === "outra_opcao" ? `Outra opção: ${nomeAlt ?? "brinde do catálogo"}.` : "";
  return (
    <li className={cx(CARTAO, "p-4")}>
      <div className="flex gap-3">
        <FotoBrinde src={foto} alt={nome} pad="p-1" className="h-16 w-16 shrink-0 rounded-xl border border-border" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-base font-bold leading-snug text-primary">{nome}</p>
            <span className={cx("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", m.estado === "aberta" ? "bg-orange-soft text-[#a83a0c]" : "bg-muted text-foreground")}>{ROTULO_MAIS[m.estado]}</span>
          </div>
          <p className="text-sm"><strong className="font-semibold">{m.qtd} unidades</strong> <span className="text-muted-foreground">· {m.pessoa} · {m.area} · {ddmm(m.criadoEm)}</span></p>
          {m.motivo ? <p className="mt-0.5 text-sm text-muted-foreground">“{m.motivo}”</p> : null}
        </div>
      </div>
      {m.estado === "aberta" ? (
        <div className="mt-3 rounded-2xl bg-muted/50 p-3">
          {/* Pills fixas, campo de altura fixa, botão e mensagem sempre no mesmo lugar. */}
          <div role="group" aria-label="Resposta" className="flex flex-wrap gap-1.5">
            {RESPOSTAS.map((r) => (
              <button key={r.id} type="button" aria-pressed={resp === r.id} onClick={() => { setResp(r.id); setErro(null); }} className={cx("min-h-11 rounded-full border px-3.5 text-sm font-semibold transition-colors", resp === r.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary hover:bg-muted")}>{r.rotulo}</button>
            ))}
          </div>
          <div className="mt-2 min-h-[72px]">
            {resp === "vamos_repor" ? (
              <label className="hl-entra block text-xs font-semibold">Previsão de chegada<input type="date" min={HOJE} value={previsao} onChange={(e) => { setPrevisao(e.target.value); setErro(null); }} className="mt-1 h-11 w-full rounded-xl border border-muted-foreground/40 bg-card px-3 text-sm font-normal" /></label>
            ) : resp === "nao_repor" ? (
              <label className="hl-entra block text-xs font-semibold">Motivo (vai no e-mail)<input value={motivo} onChange={(e) => { setMotivo(e.target.value); setErro(null); }} placeholder="Ex.: o fornecedor parou de produzir" className="mt-1 h-11 w-full rounded-xl border border-muted-foreground/40 bg-card px-3 text-sm font-normal" /></label>
            ) : (
              <label className="hl-entra block text-xs font-semibold">Brinde do catálogo no lugar<select value={alt} onChange={(e) => { setAlt(e.target.value); setErro(null); }} className="mt-1 h-11 w-full rounded-xl border border-muted-foreground/40 bg-card px-3 text-sm font-normal"><option value="">Escolha um brinde</option>{alternativos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}</select></label>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" disabled={ocupado} onClick={responder} className={BOTAO_PRIMARIO}>{ocupado ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}Responder</button>
            <p role={erro ? "alert" : undefined} className="min-h-5 min-w-0 flex-1 text-xs text-[#b42318]">{erro ?? ""}</p>
          </div>
        </div>
      ) : (
        <p className="hl-entra mt-3 rounded-xl bg-muted/60 p-3 text-sm">{resumo}</p>
      )}
    </li>
  );
}