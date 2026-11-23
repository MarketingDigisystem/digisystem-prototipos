// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/AbaCadastro.tsx, BrindeFormulario.tsx, cadastro-loja.ts e src/lib/loja/catalogo-regras.ts
// @ origin/main aff470d (2026-11-19). Fonte da verdade = Lovable/GitHub. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-2026-11-19.md
// Regras espelhadas: publicar exige foto, categoria e preço maior que zero; rascunho só exige o nome; o saldo inicial
// só existe na criação; máximo por pedido vazio = sem limite. Novo: filtro "Rascunhos" e "Veio da sugestão de <pessoa>".
import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import type { Loja } from "./HubLoja";
import type { Brinde } from "./dados";
import { brl } from "./regras";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO, FotoBrinde, ROTULO_PEQUENO, Segmentado, Shimmer, cx, useCarregando, useToast } from "./ui";

type Filtro = "todos" | "publicados" | "inativos" | "rascunhos";
type Campo = "nome" | "categoria" | "descricao" | "foto" | "preco" | "saldoInicial" | "minimo" | "maximo";
interface Form { nome: string; categoria: string; descricao: string; foto: string | null; fotoExtra: string | null; preco: string; saldoInicial: string; minimo: string; maximo: string; ativo: boolean; novidade: boolean }
const LIMITE_FOTO = 10 * 1024 * 1024;
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
const numero = (s: string) => { const t = s.trim().replace(",", "."); return t === "" ? null : Number(t); };
const formDe = (b: Brinde | null): Form => (b
  ? { nome: b.nome, categoria: b.categoria === "Sem categoria" ? "" : b.categoria, descricao: b.descricao ?? "", foto: b.foto, fotoExtra: b.fotoExtra ?? null, preco: b.custo === null ? "" : String(b.custo).replace(".", ","), saldoInicial: "", minimo: String(b.minimo), maximo: b.maximoPorPedido === null ? "" : String(b.maximoPorPedido), ativo: b.ativo, novidade: !!b.novidade }
  : { nome: "", categoria: "", descricao: "", foto: null, fotoExtra: null, preco: "", saldoInicial: "", minimo: "", maximo: "", ativo: false, novidade: false });

/** Mesmas mensagens de `validarCadastroBrinde` do Hub. */
function validar(f: Form, criando: boolean): Partial<Record<Campo, string>> {
  const e: Partial<Record<Campo, string>> = {};
  if (!f.nome.trim()) e.nome = "Informe o nome do brinde.";
  const preco = numero(f.preco);
  if (preco !== null && (!Number.isFinite(preco) || preco < 0)) e.preco = "Informe um preço válido, em reais.";
  const min = numero(f.minimo) ?? 0;
  if (!Number.isInteger(min) || min < 0) e.minimo = "Informe o mínimo como um número inteiro, zero ou maior.";
  if (criando) { const s = numero(f.saldoInicial) ?? 0; if (!Number.isInteger(s) || s < 0) e.saldoInicial = "Informe o saldo inicial como um número inteiro, zero ou maior."; }
  const max = numero(f.maximo);
  if (max !== null && (!Number.isInteger(max) || max < 1)) e.maximo = "Informe o máximo por pedido como número inteiro maior que zero, ou deixe vazio para não limitar.";
  if (f.ativo) {
    if (!f.foto) e.foto = "Informe a foto para publicar o brinde.";
    if (!f.categoria.trim()) e.categoria = "Informe a categoria para publicar o brinde.";
    if (!(preco !== null && Number.isFinite(preco) && preco > 0)) e.preco = "Informe o preço para publicar um brinde de estoque.";
  }
  return e;
}
/** "falta foto e preço" / "falta foto, categoria e preço" / "só falta ligar Publicado". */
function faltaParaPublicar(itens: (string | false)[]): string {
  const l = itens.filter((x): x is string => !!x);
  if (l.length === 0) return "só falta ligar Publicado";
  return "falta " + (l.length === 1 ? l[0] : `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}`);
}
const selo = (b: Brinde) => (b.rascunho ? { t: "Rascunho", c: "bg-sky-soft text-[#0b4a62]" } : b.ativo ? { t: "Publicado", c: "bg-success-soft text-[#1a6340]" } : { t: "Inativo", c: "bg-muted text-muted-foreground" });

export function Cadastro({ loja, carregando }: { loja: Loja; carregando: boolean }) {
  const idInicial = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("brinde");
  const [filtro, setFiltro] = useState<Filtro>(() => (idInicial && loja.brindes.find((b) => b.id === idInicial)?.rascunho ? "rascunhos" : "todos"));
  const [selId, setSelId] = useState<string | "novo">(() => idInicial && loja.brindes.some((b) => b.id === idInicial) ? idInicial : loja.brindes[0]!.id);
  const conta = {
    todos: loja.brindes.length,
    publicados: loja.brindes.filter((b) => b.ativo).length,
    inativos: loja.brindes.filter((b) => !b.ativo && !b.rascunho).length,
    rascunhos: loja.brindes.filter((b) => b.rascunho).length,
  };
  const lista = loja.brindes.filter((b) => filtro === "todos" || (filtro === "publicados" ? b.ativo : filtro === "rascunhos" ? !!b.rascunho : !b.ativo && !b.rascunho));
  const sel = selId === "novo" ? null : loja.brindes.find((b) => b.id === selId) ?? null;

  if (carregando) return <div className="grid gap-4 lg:grid-cols-[380px_1fr]" aria-busy="true"><div className="space-y-3">{[0, 1, 2, 3].map((i) => <Shimmer key={i} className="h-24 rounded-2xl" />)}</div><Shimmer className="h-[620px] rounded-2xl" /></div>;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(300px,380px)_1fr] lg:items-start">
      <div className="min-w-0 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-display text-2xl font-bold text-primary">Brindes ({loja.brindes.length})</h1>
          <button type="button" onClick={() => setSelId("novo")} className={BOTAO_PRIMARIO}><Plus className="h-4 w-4" aria-hidden />Novo brinde</button>
        </div>
        <Segmentado rotulo="Filtrar brindes" valor={filtro} aoMudar={setFiltro} opcoes={[
          { id: "todos", rotulo: `Todos ${conta.todos}` }, { id: "publicados", rotulo: `Publicados ${conta.publicados}` },
          { id: "inativos", rotulo: `Inativos ${conta.inativos}` }, { id: "rascunhos", rotulo: `Rascunhos ${conta.rascunhos}` },
        ]} />
        <ul className="hl-entra-seq space-y-2.5">
          {lista.map((b) => {
            const s = selo(b);
            return (
              <li key={b.id}>
                <button type="button" onClick={() => setSelId(b.id)} className={cx(CARTAO, "hl-elevar flex w-full gap-3 p-3 text-left", b.id === selId ? "border-primary ring-1 ring-primary" : "", b.rascunho ? "border-dashed" : "")}>
                  <FotoBrinde src={b.foto} alt="" pad="p-1" apagada={!b.ativo} className="h-14 w-14 shrink-0 rounded-xl border border-border" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug text-primary">{b.nome}</p>
                      <span className={cx("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", s.c)}>{s.t}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.categoria} · {b.custo === null ? "Sem preço" : brl(b.custo)} · {b.maximoPorPedido ? `Até ${b.maximoPorPedido} por pedido` : "Sem limite por pedido"}</p>
                    <p className="text-xs text-muted-foreground">{b.rascunho ? `Veio da sugestão de ${b.rascunho.sugeridoPor}` : `Saldo ${b.saldo} · Disponível ${b.saldo - b.reserva - b.guardadas}`}</p>
                  </div>
                </button>
              </li>
            );
          })}
          {lista.length === 0 ? <li className={cx(CARTAO, "p-6 text-center text-sm text-muted-foreground")}>{filtro === "rascunhos" ? "Nenhum rascunho. Ao aprovar uma sugestão em Solicitações, o rascunho aparece aqui." : "Nenhum brinde neste filtro."}</li> : null}
        </ul>
      </div>
      <Formulario key={selId} b={sel} loja={loja} aoSalvar={(id) => setSelId(id)} aoDescartar={() => { setSelId(loja.brindes[0]!.id); setFiltro("todos"); }} />
    </div>
  );
}

function Formulario({ b, loja, aoSalvar, aoDescartar }: { b: Brinde | null; loja: Loja; aoSalvar: (id: string) => void; aoDescartar: () => void }) {
  const toast = useToast();
  const carregando = useCarregando(b?.id ?? "novo", 320);
  const inicial = useMemo(() => formDe(b), [b]);
  const [f, setF] = useState<Form>(inicial);
  const [tentou, setTentou] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const entradaExtra = useRef<HTMLInputElement>(null);
  useEffect(() => setF(inicial), [inicial]);
  const criando = b === null;
  const erros = validar(f, criando);
  const ver = (c: Campo) => (tentou ? erros[c] : undefined);
  const sujo = JSON.stringify(f) !== JSON.stringify(inicial);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((x) => ({ ...x, [k]: v })); setMsg(null); };
  const categorias = [...new Set(loja.brindes.map((x) => x.categoria).filter((c) => c !== "Sem categoria"))];
  const sugestaoMin = b ? Math.ceil(["08", "09", "10"].map((m) => loja.movs.filter((x) => x.brindeId === b.id && x.tipo === "saida" && x.em.slice(5, 7) === m).reduce((s, x) => s + x.qtd, 0)).reduce((a, c) => a + c, 0) / 3) : 0;

  function escolherFoto(arq: File | undefined, campo: "foto" | "fotoExtra") {
    if (!arq) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(arq.type)) { setMsg({ ok: false, t: "Escolha uma foto JPG, PNG ou WebP. Outros formatos não são aceitos." }); return; }
    if (arq.size > LIMITE_FOTO) { setMsg({ ok: false, t: "A foto passa de 10 MB. Escolha uma menor." }); return; }
    set(campo, URL.createObjectURL(arq));
  }

  async function salvar() {
    setTentou(true);
    if (Object.keys(erros).length > 0) { setMsg({ ok: false, t: "Confira os campos destacados." }); return; }
    setOcupado(true);
    await espera(550);
    const dados = { nome: f.nome.trim(), categoria: f.categoria.trim() || "Sem categoria", descricao: f.descricao.trim(), foto: f.foto, fotoExtra: f.fotoExtra, custo: numero(f.preco), minimo: numero(f.minimo) ?? 0, maximoPorPedido: numero(f.maximo), ativo: f.ativo, novidade: f.novidade };
    let id = b?.id ?? "";
    let texto = "";
    if (criando) {
      id = `n${Date.now()}`;
      const saldo = numero(f.saldoInicial) ?? 0;
      loja.setBrindes((bs) => [...bs, { id, ...dados, saldo, reserva: 0, guardadas: 0 }]);
      if (saldo > 0) loja.setMovs((m) => [{ id: `s${id}`, brindeId: id, tipo: "saldo_inicial", qtd: saldo, em: "2026-11-19", nota: "Saldo inicial do cadastro" }, ...m]);
      texto = f.ativo ? `Brinde “${dados.nome}” criado e publicado na Digi Store.` : `Brinde “${dados.nome}” criado. Ele fica inativo até você publicar.`;
    } else {
      const publicouRascunho = !!b!.rascunho && f.ativo;
      // O rascunho deixa de ser rascunho quando é publicado; salvar sem publicar mantém o selo.
      loja.setBrindes((bs) => bs.map((x) => (x.id === id ? { ...x, ...dados, rascunho: publicouRascunho ? undefined : x.rascunho } : x)));
      texto = publicouRascunho ? `Rascunho publicado. “${dados.nome}” já aparece na Digi Store.` : f.ativo ? "Alterações salvas e publicadas." : "Alterações salvas. O brinde continua fora da vitrine.";
    }
    setOcupado(false);
    setTentou(false);
    toast({ texto });
    aoSalvar(id);
  }

  async function descartarRascunho() {
    if (!b?.rascunho) return;
    if (!confirmarDescarte) { setConfirmarDescarte(true); return; }
    setOcupado(true);
    await espera(400);
    loja.setBrindes((bs) => bs.filter((x) => x.id !== b.id));
    loja.setSugestoes((ss) => ss.map((s) => (s.id === b.rascunho!.sugestaoId ? { ...s, brindeRascunhoId: undefined } : s)));
    setOcupado(false);
    toast({ texto: `Rascunho “${b.nome}” descartado. A sugestão continua aprovada.` });
    aoDescartar();
  }

  const campoCls = (c: Campo) => cx("mt-1 h-11 w-full rounded-xl border bg-card px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring", ver(c) ? "border-destructive" : "border-muted-foreground/40");
  const Erro = ({ c }: { c: Campo }) => <p className="mt-1 min-h-4 text-xs font-normal text-[#b42318]">{ver(c) ?? ""}</p>;
  const precoNum = numero(f.preco);
  const disponivel = b ? b.saldo - b.reserva - b.guardadas : numero(f.saldoInicial) ?? 0;

  if (carregando) return <div className={cx(CARTAO, "space-y-4 p-6")}><Shimmer className="h-6 w-60" /><Shimmer className="h-32 w-full" /><Shimmer className="h-11 w-full" /><Shimmer className="h-11 w-full" /><Shimmer className="h-24 w-full" /></div>;
  return (
    <article className={cx(CARTAO, "hl-entra overflow-hidden")}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5 sm:p-6">
        <div className="min-w-0">
          <p className={ROTULO_PEQUENO}>{criando ? "Novo brinde" : b!.rascunho ? "Rascunho" : "Editando brinde"}</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-primary">{f.nome || "Sem nome"}</h2>
        </div>
        {/* Botões fixos no canto; a mensagem ocupa uma linha reservada abaixo do cabeçalho. */}
        <div className="flex gap-2">
          <button type="button" disabled={!sujo || ocupado} onClick={() => { setF(inicial); setTentou(false); setMsg(null); }} className={cx(BOTAO_SECUNDARIO, "disabled:opacity-50")}>Descartar alterações</button>
          <button type="button" disabled={ocupado} onClick={salvar} className={BOTAO_PRIMARIO}>{ocupado ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}{criando ? "Criar brinde" : "Salvar alterações"}</button>
        </div>
      </div>
      <div className="min-h-[52px] px-5 pt-3 sm:px-6">
        {b?.rascunho ? (
          <div className="hl-entra flex flex-wrap items-center gap-3 rounded-2xl bg-sky-soft p-3 text-sm text-[#0b4a62]">
            <FileText className="h-4 w-4 shrink-0" aria-hidden />
            <p className="min-w-0 flex-1">Veio da sugestão de <strong>{b.rascunho.sugeridoPor}</strong>. <button type="button" onClick={() => loja.irPara("solicitacoes")} className="font-semibold underline underline-offset-4">Ver a sugestão</button>. Para publicar, {faltaParaPublicar([!f.foto && "foto", !f.categoria.trim() && "categoria", !(precoNum && precoNum > 0) && "preço"])}.</p>
            <button type="button" disabled={ocupado} onClick={descartarRascunho} className="inline-flex min-h-11 w-[190px] items-center justify-center gap-1.5 rounded-xl px-3 font-semibold text-[#b42318] hover:bg-white/60"><Trash2 className="h-4 w-4" aria-hidden />{confirmarDescarte ? "Confirmar descarte" : "Descartar rascunho"}</button>
          </div>
        ) : (
          <p role={msg && !msg.ok ? "alert" : "status"} className={cx("min-h-5 text-sm", msg?.ok ? "text-[#1a6340]" : "text-[#b42318]")}>{msg?.t ?? ""}</p>
        )}
        {b?.rascunho && msg ? <p role="alert" className="mt-1 text-sm text-[#b42318]">{msg.t}</p> : null}
      </div>

      <div className="grid gap-0 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6 p-5 sm:p-6">
          <section>
            <p className={ROTULO_PEQUENO}>Fotos</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {(["foto", "fotoExtra"] as const).map((campo) => {
                const src = f[campo];
                const ref = campo === "foto" ? entradaFoto : entradaExtra;
                return (
                  <div key={campo}>
                    <button type="button" onClick={() => ref.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); escolherFoto(e.dataTransfer.files[0], campo); }}
                      className={cx("relative flex h-40 w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed text-sm transition-colors hover:bg-muted/50", campo === "foto" && ver("foto") ? "border-destructive" : "border-muted-foreground/40")}>
                      {src ? (
                        <>
                          <FotoBrinde src={src} alt="" className="absolute inset-0 h-full w-full" />
                          <span className="absolute bottom-2 right-2 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm">Trocar foto</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-6 w-6 text-primary" aria-hidden />
                          <span className="font-semibold text-primary">{campo === "foto" ? "Foto principal" : "Foto extra"}</span>
                          <span className="text-xs text-muted-foreground">{campo === "foto" ? "Arraste ou escolha · JPG, PNG ou WebP, até 10 MB" : "Opcional"}</span>
                        </>
                      )}
                    </button>
                    <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => { escolherFoto(e.target.files?.[0], campo); e.target.value = ""; }} />
                    {campo === "foto" ? <Erro c="foto" /> : <p className="mt-1 min-h-4" />}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-x-3 sm:grid-cols-2">
            <p className={cx(ROTULO_PEQUENO, "sm:col-span-2")}>Identificação</p>
            <label className="mt-2 text-sm font-semibold sm:col-span-2">Nome<input value={f.nome} onChange={(e) => set("nome", e.target.value)} className={campoCls("nome")} /><Erro c="nome" /></label>
            <label className="text-sm font-semibold">Categoria<input list="categorias-loja" value={f.categoria} onChange={(e) => set("categoria", e.target.value)} className={campoCls("categoria")} /><datalist id="categorias-loja">{categorias.map((c) => <option key={c} value={c} />)}</datalist><Erro c="categoria" /></label>
            <label className="text-sm font-semibold">Máximo por pedido<input value={f.maximo} onChange={(e) => set("maximo", e.target.value)} inputMode="numeric" placeholder="Vazio = sem limite" className={campoCls("maximo")} /><Erro c="maximo" /></label>
            <label className="text-sm font-semibold sm:col-span-2">Descrição<textarea value={f.descricao} onChange={(e) => set("descricao", e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-muted-foreground/40 bg-card p-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          </section>

          <section className="grid gap-x-3 sm:grid-cols-2">
            <p className={cx(ROTULO_PEQUENO, "sm:col-span-2")}>Preço e estoque</p>
            <label className="mt-2 text-sm font-semibold">Custo unitário (R$)<input value={f.preco} onChange={(e) => set("preco", e.target.value)} inputMode="decimal" placeholder="Ex.: 54,00" className={campoCls("preco")} /><Erro c="preco" /></label>
            <label className="mt-2 text-sm font-semibold">Estoque mínimo<input value={f.minimo} onChange={(e) => set("minimo", e.target.value)} inputMode="numeric" placeholder="0" className={campoCls("minimo")} />
              <span className="mt-1 flex min-h-4 items-center gap-2 text-xs font-normal">
                {ver("minimo") ? <span className="text-[#b42318]">{ver("minimo")}</span> : sugestaoMin > 0 && String(sugestaoMin) !== f.minimo ? <><span className="text-muted-foreground">Sugerido: {sugestaoMin} un. (um mês de saídas)</span><button type="button" onClick={() => set("minimo", String(sugestaoMin))} className="font-semibold text-primary underline underline-offset-4">Usar</button></> : null}
              </span>
            </label>
            {criando ? (
              <label className="text-sm font-semibold">Saldo inicial<input value={f.saldoInicial} onChange={(e) => set("saldoInicial", e.target.value)} inputMode="numeric" placeholder="Quantas unidades existem hoje" className={campoCls("saldoInicial")} /><Erro c="saldoInicial" /></label>
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-muted/60 px-3 py-2.5 text-sm sm:col-span-2">
                <span>Saldo <strong>{b!.saldo}</strong></span><span>Reservado <strong>{b!.reserva}</strong></span><span>Guardadas <strong>{b!.guardadas}</strong></span>
                <span>Disponível <strong className={disponivel <= 0 ? "text-[#b42318]" : ""}>{disponivel}</strong></span>
                {b!.rascunho ? <span className="text-xs text-muted-foreground">O estoque do rascunho entra pela aba Estoque depois de publicar.</span> : <button type="button" onClick={() => loja.irPara("estoque")} className="ml-auto font-semibold text-primary underline underline-offset-4">Movimentar no Estoque</button>}
              </div>
            )}
          </section>

          <section>
            <p className={ROTULO_PEQUENO}>Vitrine da Digi Store</p>
            {[
              { k: "ativo" as const, t: "Publicado", d: "Aparece para quem tem acesso à Loja. Exige foto, categoria e preço." },
              { k: "novidade" as const, t: "Novidade", d: "Ganha o selo “Novo” na vitrine." },
            ].map((x) => (
              <div key={x.k} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
                <div><p className="text-sm font-semibold">{x.t}</p><p className="text-xs text-muted-foreground">{x.d}</p></div>
                <button type="button" role="switch" aria-checked={f[x.k]} aria-label={x.t} onClick={() => set(x.k, !f[x.k])} className={cx("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors", f[x.k] ? "bg-primary" : "bg-muted-foreground/30")}>
                  <span className={cx("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", f[x.k] ? "translate-x-6" : "translate-x-1")} />
                </button>
              </div>
            ))}
          </section>
        </div>

        <aside className="border-t border-border bg-muted/30 p-5 xl:border-l xl:border-t-0">
          <p className={ROTULO_PEQUENO}>Como aparece na Digi Store</p>
          <div className={cx("relative mt-3 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition-opacity", f.ativo ? "" : "opacity-70")}>
            <FotoBrinde src={f.foto} alt="" className="h-44 w-full" />
            {f.novidade ? <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-[#3a1500]">Novo</span> : null}
            <div className="space-y-1.5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{f.categoria || "Categoria"}</p>
              <p className="font-display text-lg font-bold leading-snug text-primary">{f.nome || "Nome do brinde"}</p>
              <p className="line-clamp-3 text-sm text-muted-foreground">{f.descricao || "A descrição aparece aqui."}</p>
              <p className="text-sm font-semibold text-foreground">{precoNum && precoNum > 0 ? `${brl(precoNum)} por unidade` : "Preço a definir"}</p>
              <p className={cx("text-xs font-semibold", disponivel > 0 ? "text-[#1a6340]" : "text-[#b42318]")}>{disponivel > 0 ? `${disponivel} disponíveis` : "Sem unidades agora"}</p>
              <span className="mt-1 inline-flex min-h-9 items-center rounded-full bg-accent px-4 text-sm font-semibold text-[#3a1500]">Ver brinde</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{f.ativo ? "É assim que o Solicitante vê o brinde. Saldo, reserva e mínimo nunca aparecem para ele." : "Fora da vitrine: o Solicitante não vê este brinde enquanto Publicado estiver desligado."}</p>
        </aside>
      </div>
    </article>
  );
}