// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Estoque: saldo físico × disponível por variação (pronta entrega), com alerta de mínimo,
// entrada de lote e ajuste de inventário. Itens sob encomenda não têm estoque próprio.

import { useState } from "react";
import { Ellipsis, History, PackagePlus, Pencil, Plus, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { FotoProduto } from "../FotoProduto";
import { useLoja } from "../estado";
import { moeda } from "../formato";
import { nomeCategoria } from "../mock";
import { alertasMinimo, disponivel, encomendaMinimaDe, esgotados, situacaoVariacao } from "../regras";
import { navegar, trocarParams, type RotaLoja } from "../rota";
import type { Produto } from "../tipos";
import { Botao, Campo, classeInput, Gaveta, ParPills, Selo, SeloSituacao } from "../ui";
import { GestaoShell, Kpi } from "./GestaoShell";

export function Estoque({ rota }: { rota: RotaLoja }) {
  const { estado } = useLoja();
  const { produtos, pedidos } = estado;
  const soAlertas = rota.params.get("alerta") === "1";
  const alertas = alertasMinimo(produtos, pedidos);
  const zerados = esgotados(produtos, pedidos);
  const comAlerta = new Set([...alertas.map((a) => a.produto.id), ...zerados.map((z) => z.produto.id)]);
  const lista = soAlertas ? produtos.filter((p) => comAlerta.has(p.id)) : produtos;
  const valor = produtos.reduce((s, p) => s + p.variacoes.reduce((t, v) => t + v.saldo * p.custoUnitario, 0), 0);
  const movProduto = produtos.find((p) => p.slug === rota.params.get("mov"));
  const tipoMov = rota.params.get("tipo") === "ajuste" ? "ajuste" : "entrada";

  return (
    <GestaoShell
      titulo="Estoque"
      descricao="Saldo é o que existe na prateleira. Com a baixa imediata, o pedido de pronta entrega com saldo já desconta na hora. Itens marcados como encomenda são produzidos sob demanda e não dependem de saldo."
      acoes={<Botao onClick={() => navegar("/loja/gestao/estoque/novo")}><Plus className="size-4" aria-hidden /> Cadastrar produto</Botao>}
    >
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi rotulo="Produtos ativos" valor={String(produtos.filter((p) => p.ativo).length)} detalhe={`${produtos.reduce((s, p) => s + p.variacoes.length, 0)} variações`} />
        <Kpi rotulo="Abaixo do mínimo" valor={String(alertas.length)} detalhe={`em ${new Set(alertas.map((a) => a.produto.id)).size} produtos`} tom="atencao" />
        <Kpi rotulo="Esgotados" valor={String(zerados.length)} detalhe="variações sem disponível" tom="erro" />
        <Kpi rotulo="Valor em estoque" valor={moeda(valor)} detalhe="saldo × custo unitário" />
      </div>

      {alertas.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-warning/50 bg-warning-soft p-4 sm:flex-row sm:items-center">
          <TriangleAlert className="size-6 shrink-0 text-warning" aria-hidden />
          <div className="min-w-0 flex-1 text-[14px]">
            <p className="font-display text-[16px] font-bold">{alertas.length} variações abaixo do mínimo</p>
            <p className="text-foreground/85">
              {alertas.map((a) => `${a.produto.nome}${a.variacao.rotulo !== "Único" ? ` ${a.variacao.rotulo}` : ""} (${a.disponivel})`).join(" · ")}.
              {zerados.length > 0 && ` Esgotados: ${zerados.map((z) => `${z.produto.nome}${z.variacao.rotulo !== "Único" ? ` ${z.variacao.rotulo}` : ""}`).join(", ")}.`}
            </p>
          </div>
          <ParPills rotulo="Mostrar" tamanho="sm" valor={soAlertas ? "alertas" : "todos"} onChange={(v) => trocarParams({ alerta: v === "alertas" ? "1" : undefined })}
            opcoes={[{ valor: "todos", rotulo: "Todos" }, { valor: "alertas", rotulo: "Só alertas" }]} className="bg-card/70 self-start sm:self-auto" />
        </div>
      )}

      <ul className="space-y-3">
        {lista.map((p) => <LinhaProduto key={p.id} produto={p} />)}
      </ul>

      <Gaveta aberto={!!movProduto} onFechar={() => trocarParams({ mov: undefined, tipo: undefined }, true)} largura={480}
        titulo={tipoMov === "entrada" ? "Registrar entrada" : "Ajuste de inventário"} subtitulo={movProduto?.nome}>
        {movProduto && <PainelMov key={movProduto.id + tipoMov} produto={movProduto} tipo={tipoMov} />}
      </Gaveta>
    </GestaoShell>
  );
}

function LinhaProduto({ produto: p }: { produto: Produto }) {
  const { estado } = useLoja();
  const [menu, setMenu] = useState(false);
  const acoes = [
    { rotulo: "Registrar entrada", icone: PackagePlus, fazer: () => trocarParams({ mov: p.slug, tipo: "entrada" }) },
    { rotulo: "Ajuste", icone: SlidersHorizontal, fazer: () => trocarParams({ mov: p.slug, tipo: "ajuste" }) },
    { rotulo: "Editar", icone: Pencil, fazer: () => navegar(`/loja/gestao/estoque/${p.slug}`) },
    { rotulo: "Histórico", icone: History, fazer: () => navegar("/loja/gestao/rastreabilidade", { item: p.slug }) },
  ];
  return (
    <li className="rounded-3xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <FotoProduto produto={p} corHex={p.variacoes[0].cor?.hex} tamanho="mini" className="size-14 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-display text-[16px] font-bold leading-tight">
            {p.nome}
            {p.somenteEncomenda ? <Selo tom="apoio">Sob encomenda · mín. {encomendaMinimaDe(p)}</Selo>
              : p.aceitaEncomenda ? <Selo tom="apoio">Pronta entrega + encomenda</Selo> : null}
          </p>
          <p className="text-[13px] text-muted-foreground">{nomeCategoria(p.categoria)} · {moeda(p.custoUnitario)} / un.{p.personalizacao ? " · personalizável" : ""}</p>
        </div>
        <div className="hidden shrink-0 flex-wrap justify-end gap-1.5 md:flex">
          {acoes.map((a) => (
            <Botao key={a.rotulo} variante={a.rotulo === "Registrar entrada" ? "suave" : "fantasma"} tamanho="sm" onClick={a.fazer}>
              <a.icone className="size-4" aria-hidden /> {a.rotulo}
            </Botao>
          ))}
        </div>
        <div className="relative md:hidden">
          <button type="button" aria-label={`Ações de ${p.nome}`} aria-expanded={menu} onClick={() => setMenu((x) => !x)}
            className="grid size-11 place-items-center rounded-xl text-primary hover:bg-navy-soft">
            <Ellipsis className="size-5" />
          </button>
          {menu && (
            <div role="menu" className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-float)]">
              {acoes.map((a) => (
                <button key={a.rotulo} role="menuitem" type="button" onClick={() => { setMenu(false); a.fazer(); }}
                  className="flex h-11 w-full items-center gap-2 rounded-xl px-3 text-left font-display text-[14px] font-bold hover:bg-secondary">
                  <a.icone className="size-4 text-primary" aria-hidden /> {a.rotulo}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {p.somenteEncomenda ? (
        <p className="mt-3 rounded-2xl border border-sky/50 bg-sky-soft p-3 text-[13px]">
          Item sob encomenda: não tem estoque próprio. A produção é feita sob demanda, a partir de {encomendaMinimaDe(p)} unidades.
        </p>
      ) : (
        <div className="mt-3 overflow-hidden rounded-2xl border border-border">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))_minmax(0,1.6fr)] gap-3 bg-secondary/60 px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.06em] text-muted-foreground md:grid">
            <span>Variação</span><span>Saldo</span><span>Disponível</span><span>Mínimo</span><span>Situação</span>
          </div>
          <ul className="divide-y divide-border">
            {p.variacoes.map((v) => {
              const d = disponivel(p, v, estado.pedidos);
              const sit = situacaoVariacao(p, v, estado.pedidos);
              return (
                <li key={v.id} className="grid grid-cols-3 items-center gap-x-3 gap-y-2 px-4 py-3 text-[14px] md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))_minmax(0,1.6fr)]">
                  <span className="col-span-3 flex min-w-0 items-center gap-2 font-semibold md:col-span-1">
                    {v.cor && <span className="size-3.5 shrink-0 rounded-full ring-1 ring-border" style={{ background: v.cor.hex }} aria-hidden />}
                    <span className="truncate">{v.rotulo}</span>
                  </span>
                  <Num rotulo="Saldo" valor={v.saldo} forte />
                  <Num rotulo="Disponível" valor={d} />
                  <Num rotulo="Mínimo" valor={v.minimo} />
                  <span className="col-span-3 flex min-w-0 flex-wrap items-center gap-2 md:col-span-1">
                    <SeloSituacao situacao={sit} curto />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}

function Num({ rotulo, valor, forte }: { rotulo: string; valor: number; forte?: boolean }) {
  return (
    <span className="min-w-0">
      <span className="block text-[11.5px] text-muted-foreground md:hidden">{rotulo}</span>
      <span className={cn("font-display tabular-nums", forte ? "text-[16px] font-bold" : "text-[15px] font-semibold")}>{valor}</span>
    </span>
  );
}

function PainelMov({ produto: p, tipo }: { produto: Produto; tipo: "entrada" | "ajuste" }) {
  const { estado, registrarEntrada, ajustar } = useLoja();
  const [vid, setVid] = useState(p.variacoes[0].id);
  const v = p.variacoes.find((x) => x.id === vid)!;
  const [qtd, setQtd] = useState(tipo === "entrada" ? "" : String(v.saldo));
  const [texto, setTexto] = useState("");
  const [tentou, setTentou] = useState(false);
  const n = Number(qtd);
  const erroQtd = !qtd || !Number.isInteger(n) ? "Informe um número inteiro." : tipo === "entrada" && n <= 0 ? "A entrada precisa ser de pelo menos 1 unidade." : tipo === "ajuste" && n < 0 ? "O saldo não pode ficar negativo." : null;
  const erroTexto = !texto.trim() ? (tipo === "entrada" ? "Informe o lote ou a origem." : "Explique o motivo do ajuste.") : null;

  const salvar = () => {
    setTentou(true);
    if (erroQtd || erroTexto) return;
    const ok = tipo === "entrada" ? registrarEntrada(p.id, v.id, n, texto) : ajustar(p.id, v.id, n, texto);
    if (ok) trocarParams({ mov: undefined, tipo: undefined }, true);
  };

  return (
    <div className="space-y-5">
      <ParPills rotulo="Tipo de movimentação" valor={tipo} onChange={(t) => trocarParams({ tipo: t }, true)}
        opcoes={[{ valor: "entrada", rotulo: "Entrada" }, { valor: "ajuste", rotulo: "Ajuste" }]} />
      {p.variacoes.length > 1 && (
        <div>
          <p className="mb-2 font-display text-[13.5px] font-bold">Variação</p>
          <div className="flex flex-wrap gap-2">
            {p.variacoes.map((x) => (
              <button key={x.id} type="button" aria-pressed={x.id === vid} onClick={() => { setVid(x.id); if (tipo === "ajuste") setQtd(String(x.saldo)); }}
                className={cn("flex h-10 items-center gap-2 rounded-full border px-3 font-display text-[13.5px] font-bold", x.id === vid ? "border-primary bg-navy-soft text-primary" : "border-border hover:border-primary/40")}>
                {x.cor && <span className="size-3 rounded-full ring-1 ring-border" style={{ background: x.cor.hex }} aria-hidden />} {x.rotulo}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-3 text-center">
        <div><p className="text-[12px] text-muted-foreground">Saldo</p><p className="font-display text-[20px] font-bold tabular-nums">{v.saldo}</p></div>
        <div><p className="text-[12px] text-muted-foreground">Disponível</p><p className="font-display text-[20px] font-bold tabular-nums">{disponivel(p, v, estado.pedidos)}</p></div>
      </div>
      <Campo rotulo={tipo === "entrada" ? "Quantas unidades chegaram" : "Saldo contado na prateleira"} htmlFor="mov-qtd" erro={tentou ? erroQtd : null}
        ajuda={tipo === "entrada" ? `O saldo passa de ${v.saldo} para ${v.saldo + (Number.isInteger(n) && n > 0 ? n : 0)}.` : `Hoje o sistema diz ${v.saldo}. Diferença: ${Number.isInteger(n) ? n - v.saldo : 0}.`}>
        <input id="mov-qtd" type="number" inputMode="numeric" value={qtd} onChange={(e) => setQtd(e.target.value)} className={cn(classeInput, "max-w-[200px] font-display text-[18px] font-bold")} />
      </Campo>
      <Campo rotulo={tipo === "entrada" ? "Lote ou origem" : "Motivo do ajuste"} htmlFor="mov-texto" erro={tentou ? erroTexto : null}>
        <input id="mov-texto" value={texto} onChange={(e) => setTexto(e.target.value)} className={classeInput}
          placeholder={tipo === "entrada" ? "Ex.: Reposição lote nov/26, nota 4821" : "Ex.: inventário físico, 3 com avaria na tampa"} />
      </Campo>
      <Botao tamanho="lg" className="w-full" onClick={salvar}>{tipo === "entrada" ? "Registrar entrada" : "Salvar ajuste"}</Botao>
    </div>
  );
}
