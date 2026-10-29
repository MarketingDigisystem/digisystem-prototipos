// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Vitrine (home do DigiPlace). Filtros e ordenação vivem no hash: o voltar do navegador desfaz
// filtro. O botão "Sugerir um brinde" tem âncora fixa (ao lado de Ordenar) e abre a gaveta de
// sugestão via ?sugerir=1.

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Factory, Lightbulb, NotebookPen, PackageOpen, SearchX, SlidersHorizontal, TrendingUp, Leaf, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardProduto } from "../CardProduto";
import { FotoProduto } from "../FotoProduto";
import { useLoja } from "../estado";
import { CATEGORIAS, nomeCategoria } from "../mock";
import { popularidade, situacaoProduto, temProntaEntrega } from "../regras";
import { navegar, trocarParams, type RotaLoja } from "../rota";
import type { CategoriaId, Pedido, Produto } from "../tipos";
import { Botao, CardEsqueleto, Gaveta, ParPills, Vazio } from "../ui";

let jaCarregou = false;

const FAIXAS = [
  { id: "ate20", rotulo: "Até R$ 20", teste: (v: number) => v <= 20 },
  { id: "20a60", rotulo: "De R$ 20 a R$ 60", teste: (v: number) => v > 20 && v <= 60 },
  { id: "60mais", rotulo: "Acima de R$ 60", teste: (v: number) => v > 60 },
];

type ClasseDisp = "pronta" | "ultimas" | "encomenda";

/** Classe de disponibilidade do item no v4: pronta entrega, últimas unidades ou sob encomenda. */
function classeDisponibilidade(p: Produto, pedidos: Pedido[]): ClasseDisp | null {
  const temPronta = temProntaEntrega(p, pedidos);
  const sit = situacaoProduto(p, pedidos);
  if (p.aceitaEncomenda && (p.somenteEncomenda || !temPronta)) return "encomenda";
  if (temPronta && sit === "ultimas") return "ultimas";
  if (temPronta) return "pronta";
  return null; // esgotado de verdade, sem encomenda
}

const DISP: { id: ClasseDisp; rotulo: string }[] = [
  { id: "pronta", rotulo: "Pronta entrega" },
  { id: "ultimas", rotulo: "Últimas unidades" },
  { id: "encomenda", rotulo: "Sob encomenda" },
];
const ORDENS = [
  { id: "mais-pedidos", rotulo: "Mais pedidos" },
  { id: "menor-custo", rotulo: "Menor custo" },
  { id: "novidades", rotulo: "Novidades" },
];

const lista = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

function alternar(params: URLSearchParams, chave: string, valor: string) {
  const atual = lista(params.get(chave));
  const novo = atual.includes(valor) ? atual.filter((x) => x !== valor) : [...atual, valor];
  trocarParams({ [chave]: novo.join(",") || undefined });
}

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function Vitrine({ rota }: { rota: RotaLoja }) {
  const { estado } = useLoja();
  const { produtos, pedidos } = estado;
  const p = rota.params;
  const q = p.get("q") ?? "";
  const cats = lista(p.get("cat"));
  const disp = lista(p.get("disp"));
  const faixas = lista(p.get("faixa"));
  const perso = p.get("perso") === "1";
  const ord = p.get("ord") ?? "mais-pedidos";
  const [carregando, setCarregando] = useState(!jaCarregou);
  const [filtrosMobile, setFiltrosMobile] = useState(false);

  useEffect(() => {
    if (jaCarregou) return;
    const t = window.setTimeout(() => { jaCarregou = true; setCarregando(false); }, 400);
    return () => window.clearTimeout(t);
  }, []);

  const filtrados = useMemo(() => {
    const termo = normalizar(q.trim());
    const r = produtos.filter((x) => {
      if (!x.ativo) return false;
      if (termo && !normalizar(`${x.nome} ${nomeCategoria(x.categoria)} ${x.descricaoCurta}`).includes(termo)) return false;
      if (cats.length && !cats.includes(x.categoria)) return false;
      if (disp.length) { const c = classeDisponibilidade(x, pedidos); if (!c || !disp.includes(c)) return false; }
      if (faixas.length && !FAIXAS.filter((f) => faixas.includes(f.id)).some((f) => f.teste(x.custoUnitario))) return false;
      if (perso && !x.personalizacao) return false;
      return true;
    });
    const esgot = (x: Produto) => (classeDisponibilidade(x, pedidos) === null ? 1 : 0);
    return r.sort((a, b) => {
      if (ord === "menor-custo") return a.custoUnitario - b.custoUnitario;
      const e = esgot(a) - esgot(b);
      if (e) return e;
      if (ord === "novidades") return b.cadastradoEm.localeCompare(a.cadastradoEm);
      return popularidade(b, pedidos) - popularidade(a, pedidos);
    });
  }, [produtos, pedidos, q, cats.join(), disp.join(), faixas.join(), perso, ord]); // eslint-disable-line react-hooks/exhaustive-deps

  const ativos = [
    ...cats.map((c) => ({ rotulo: nomeCategoria(c as CategoriaId), tirar: () => alternar(p, "cat", c) })),
    ...disp.map((d) => ({ rotulo: DISP.find((x) => x.id === d)?.rotulo ?? d, tirar: () => alternar(p, "disp", d) })),
    ...faixas.map((f) => ({ rotulo: FAIXAS.find((x) => x.id === f)?.rotulo ?? f, tirar: () => alternar(p, "faixa", f) })),
    ...(perso ? [{ rotulo: "Só personalizáveis", tirar: () => trocarParams({ perso: undefined }) }] : []),
  ];
  const limpar = () => trocarParams({ cat: undefined, disp: undefined, faixa: undefined, perso: undefined });
  const home = !q && !ativos.length;
  const titulo = q ? `Resultados para "${q}"` : cats.length === 1 ? nomeCategoria(cats[0] as CategoriaId) : "Todos os brindes";

  const filtros = (
    <div className="space-y-6">
      <GrupoFiltro titulo="Categoria">
        {CATEGORIAS.map((c) => (
          <Opcao key={c.id} marcado={cats.includes(c.id)} onChange={() => alternar(p, "cat", c.id)}
            rotulo={c.nome} conta={produtos.filter((x) => x.categoria === c.id).length} />
        ))}
      </GrupoFiltro>
      <GrupoFiltro titulo="Disponibilidade">
        {DISP.map((d) => (
          <Opcao key={d.id} marcado={disp.includes(d.id)} onChange={() => alternar(p, "disp", d.id)}
            rotulo={d.rotulo} conta={produtos.filter((x) => classeDisponibilidade(x, pedidos) === d.id).length} />
        ))}
      </GrupoFiltro>
      <GrupoFiltro titulo="Custo por unidade">
        {FAIXAS.map((f) => (
          <Opcao key={f.id} marcado={faixas.includes(f.id)} onChange={() => alternar(p, "faixa", f.id)}
            rotulo={f.rotulo} conta={produtos.filter((x) => f.teste(x.custoUnitario)).length} />
        ))}
      </GrupoFiltro>
      <GrupoFiltro titulo="Personalização">
        <ParPills rotulo="Personalização" tamanho="sm" valor={perso ? "so" : "todos"}
          onChange={(v) => trocarParams({ perso: v === "so" ? "1" : undefined })}
          opcoes={[{ valor: "todos", rotulo: "Todos" }, { valor: "so", rotulo: "Só personalizáveis" }]} />
      </GrupoFiltro>
    </div>
  );

  return (
    <div>
      {home && <Destaques />}

      <div className="mt-2 flex gap-7">
        <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filtros">
          <div className="sticky top-[136px]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filtrar</h2>
              {ativos.length > 0 && <button type="button" onClick={limpar} className="font-display text-[13px] font-bold text-primary hover:underline">Limpar</button>}
            </div>
            {filtros}
          </div>
        </aside>

        <section className="min-w-0 flex-1" aria-labelledby="titulo-grade">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 id="titulo-grade" className="truncate font-display text-[24px] font-bold leading-tight md:text-[28px]">{titulo}</h1>
              <p className="text-[13.5px] text-muted-foreground">{filtrados.length === 1 ? "1 brinde" : `${filtrados.length} brindes`}</p>
            </div>
            <div className="flex items-center gap-2">
              <Botao variante="contorno" className="lg:hidden" onClick={() => setFiltrosMobile(true)}>
                <SlidersHorizontal className="size-4" aria-hidden /> Filtros{ativos.length ? ` (${ativos.length})` : ""}
              </Botao>
              <Botao variante="contorno" onClick={() => trocarParams({ sugerir: "1" })}>
                <Lightbulb className="size-4" aria-hidden /> <span className="hidden sm:inline">Sugerir um brinde</span><span className="sm:hidden">Sugerir</span>
              </Botao>
              <label className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
                <span className="hidden sm:inline">Ordenar por</span>
                <select value={ord} onChange={(e) => trocarParams({ ord: e.target.value === "mais-pedidos" ? undefined : e.target.value })}
                  aria-label="Ordenar por"
                  className="h-11 rounded-xl border border-border bg-card px-3 font-display text-[14px] font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {ORDENS.map((o) => <option key={o.id} value={o.id}>{o.rotulo}</option>)}
                </select>
              </label>
            </div>
          </div>

          {ativos.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {ativos.map((a) => (
                <button key={a.rotulo} type="button" onClick={a.tirar}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-navy-soft px-3 font-display text-[13px] font-bold text-primary hover:bg-primary/15">
                  {a.rotulo} <X className="size-3.5" aria-label="Remover filtro" />
                </button>
              ))}
              <button type="button" onClick={limpar} className="px-2 font-display text-[13px] font-bold text-muted-foreground hover:text-foreground">Limpar tudo</button>
            </div>
          )}

          {carregando ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => <CardEsqueleto key={i} />)}
            </div>
          ) : filtrados.length === 0 ? (
            <Vazio
              icone={<SearchX className="size-7" />}
              titulo={q ? `Nenhum brinde com "${q}"` : "Nenhum brinde com esses filtros"}
              texto={q ? "Tente outro termo, como caderno, caneta ou garrafa. Ou veja os mais pedidos." : "Tire um dos filtros para ver mais opções."}
            >
              <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {[...produtos].sort((a, b) => popularidade(b, pedidos) - popularidade(a, pedidos)).slice(0, 4)
                  .map((x) => <CardProduto key={x.id} produto={x} pedidos={pedidos} />)}
              </div>
            </Vazio>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {filtrados.map((x) => <CardProduto key={x.id} produto={x} pedidos={pedidos} />)}
            </div>
          )}
        </section>
      </div>

      <Gaveta
        aberto={filtrosMobile} onFechar={() => setFiltrosMobile(false)} lado="baixo" titulo="Filtros"
        subtitulo={ativos.length ? `${ativos.length} ativos` : "Nenhum filtro ativo"}
        rodape={
          <div className="flex gap-2">
            <Botao variante="contorno" className="flex-1" onClick={limpar} disabled={!ativos.length}>Limpar</Botao>
            <Botao className="flex-[2]" onClick={() => setFiltrosMobile(false)}>
              Ver {filtrados.length === 1 ? "1 brinde" : `${filtrados.length} brindes`}
            </Botao>
          </div>
        }
      >
        {filtros}
      </Gaveta>
    </div>
  );
}

function GrupoFiltro({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 font-display text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{titulo}</legend>
      <div className="space-y-0.5">{children}</div>
    </fieldset>
  );
}

function Opcao({ marcado, onChange, rotulo, conta }: { marcado: boolean; onChange: () => void; rotulo: string; conta: number }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2 text-[14px] hover:bg-secondary">
      <input type="checkbox" checked={marcado} onChange={onChange} className="size-4 accent-[var(--navy)]" />
      <span className={cn("flex-1", marcado && "font-semibold text-foreground")}>{rotulo}</span>
      <span className="text-[12.5px] tabular-nums text-muted-foreground">{conta}</span>
    </label>
  );
}

// Banner institucional com foto real. Tenta caderno-caneta.png; se não existir no disco,
// cai para moleskine.png; se nenhuma carregar, mostra o fundo de marca sem quebrar.
function FotoBanner() {
  const CAMINHOS = ["/brindes/caderno-caneta.png", "/brindes/moleskine.png"];
  const [idx, setIdx] = useState(0);
  const falhou = idx >= CAMINHOS.length;
  return (
    <div className="relative hidden aspect-square w-52 shrink-0 place-items-center overflow-hidden rounded-3xl bg-[oklch(0.985_0.004_250)] ring-1 ring-white/15 sm:grid md:w-60">
      {!falhou ? (
        <img src={CAMINHOS[idx]} alt="Caderno e caneta da Digisystem" loading="lazy" onError={() => setIdx((i) => i + 1)} className="h-full w-full object-contain p-6" />
      ) : (
        <span className="grid size-full place-items-center bg-[linear-gradient(140deg,var(--navy-soft),var(--sky-soft))] text-primary"><NotebookPen className="size-20" strokeWidth={1.1} aria-hidden /></span>
      )}
    </div>
  );
}

function Destaques() {
  return (
    <div className="mb-7 grid gap-4 lg:grid-cols-3">
      <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-card lg:col-span-2">
        <span className="absolute inset-y-0 left-0 w-1.5 bg-accent" aria-hidden />
        <div className="grid items-center gap-4 p-6 sm:grid-cols-[1fr_auto] md:p-8">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 font-display text-[12.5px] font-bold uppercase tracking-[0.08em]">
              <PackageOpen className="size-4 text-sky" aria-hidden /> Brindes da Digisystem
            </span>
            <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.1] md:text-[34px]">Os brindes que levam a marca para fora</h2>
            <p className="mt-2 text-[14.5px] text-primary-foreground/85">
              Caderno, caneta, moleskine e folder são a cara da Digisystem na mão do cliente. O que tem na prateleira sai na hora; o que está sob encomenda a gente produz sob demanda.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Botao variante="claro" tamanho="lg" onClick={() => navegar("/loja", { disp: "pronta" })}>Ver o que sai na hora <ArrowRight className="size-4" aria-hidden /></Botao>
              <Botao variante="fantasma" tamanho="lg" className="text-primary-foreground hover:bg-white/10" onClick={() => navegar("/loja", { disp: "encomenda" })}><Factory className="size-4" aria-hidden /> Itens sob encomenda</Botao>
            </div>
          </div>
          <FotoBanner />
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <MiniBanner
          classe="bg-sky-soft" icone={<Leaf className="size-5" aria-hidden />} titulo="Novidades"
          texto="O moleskine clássico e o folder institucional acabaram de entrar no catálogo."
          onClick={() => navegar("/loja", { ord: "novidades" })}
        />
        <MiniBanner
          classe="bg-orange-soft" icone={<TrendingUp className="size-5" aria-hidden />} titulo="Mais pedidos"
          texto="Caderno, caneta e o caderno com caneta são os que mais saem para cliente."
          onClick={() => navegar("/loja", { ord: "mais-pedidos", disp: "pronta" })}
        />
      </div>
    </div>
  );
}

function MiniBanner({ classe, icone, titulo, texto, onClick }: { classe: string; icone: React.ReactNode; titulo: string; texto: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("group flex items-start gap-3 rounded-3xl border border-border p-5 text-left shadow-card transition-shadow hover:shadow-[var(--shadow-float)]", classe)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-card text-primary">{icone}</span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 font-display text-[17px] font-bold text-foreground">
          {titulo} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
        </span>
        <span className="mt-0.5 block text-[13.5px] text-foreground/80">{texto}</span>
      </span>
    </button>
  );
}
