// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// "Ver como" existe só no protótipo: a navegação final do back-office no Hub ainda não está fechada.

import { useEffect, useState, type FormEvent } from "react";
import { ChartNoAxesColumn, ChevronDown, ClipboardList, Lightbulb, Package, Search, ShoppingBag, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoja } from "./estado";
import { areaDoCentro, CATEGORIAS, usuario } from "./mock";
import { alertasMinimo, ENCOMENDA_EM_ANDAMENTO } from "./regras";
import { navegar, trocarParams, type RotaLoja } from "./rota";
import { Avatar, ParPills } from "./ui";

export function Cabecalho({ rota }: { rota: RotaLoja }) {
  const { carrinho, estado, diretorId, equipeId } = useLoja();
  const equipe = rota.perfil === "equipe";
  const qParam = rota.t.tela === "vitrine" ? rota.params.get("q") ?? "" : "";
  const [busca, setBusca] = useState(qParam);
  const [menuPerfil, setMenuPerfil] = useState(false);
  useEffect(() => setBusca(qParam), [qParam]);

  const qtdCarrinho = carrinho.length;
  const eu = usuario(equipe ? equipeId : diretorId);
  const catAtiva = rota.t.tela === "vitrine" ? rota.params.get("cat") ?? "" : "";

  const buscar = (e?: FormEvent) => {
    e?.preventDefault();
    navegar("/loja", { q: busca.trim() || undefined });
  };
  const digitar = (v: string) => {
    setBusca(v);
    if (rota.t.tela === "vitrine") trocarParams({ q: v || undefined }, true);
  };
  const trocarPerfil = (p: "diretor" | "equipe") => {
    setMenuPerfil(false);
    if (p === rota.perfil) return;
    navegar(p === "equipe" ? "/loja/gestao/pedidos" : "/loja");
  };

  const encomendasAtivas = estado.pedidos.filter((p) => p.tipoPedido === "encomenda" && ENCOMENDA_EM_ANDAMENTO.includes(p.status)).length;
  const prontosRetirada = estado.pedidos.filter((p) => p.status === "pronto").length;
  const sugestoesPendentes = estado.sugestoes.filter((s) => s.status === "sugerida" || s.status === "em_analise").length;
  const alertas = alertasMinimo(estado.produtos, estado.pedidos).length;

  const abas = [
    { id: "gestao-pedidos", rotulo: "Pedidos", icone: ClipboardList, cont: encomendasAtivas + prontosRetirada, para: "/loja/gestao/pedidos" },
    { id: "gestao-sugestoes", rotulo: "Sugestões", icone: Lightbulb, cont: sugestoesPendentes, para: "/loja/gestao/sugestoes" },
    { id: "gestao-estoque", rotulo: "Estoque", icone: Warehouse, cont: alertas, para: "/loja/gestao/estoque" },
    { id: "gestao-rastreabilidade", rotulo: "Rastreabilidade", icone: ChartNoAxesColumn, cont: 0, para: "/loja/gestao/rastreabilidade" },
  ];
  const abaAtiva = rota.t.tela === "gestao-produto" ? "gestao-estoque" : rota.t.tela;

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap md:px-6">
          <button type="button" onClick={() => navegar(equipe ? "/loja/gestao/pedidos" : "/loja")} className="flex min-w-0 items-center text-left">
            <span className="min-w-0 leading-tight">
              <span className="hidden font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/70 sm:block">Marketing Hub Digisystem</span>
              <span className="flex items-baseline gap-0.5 font-display text-[20px] font-bold leading-none tracking-tight">
                DigiPlace<span className="ml-0.5 size-1.5 rounded-full bg-accent" aria-hidden />
                {equipe && <span className="ml-1.5 font-semibold text-primary-foreground/80">· Gestão</span>}
              </span>
              <span className="hidden text-[12px] font-semibold text-primary-foreground/70 sm:block">Brindes da marca</span>
            </span>
          </button>

          {!equipe ? (
            <form role="search" onSubmit={buscar} className="order-last w-full md:order-none md:mx-4 md:max-w-[560px] md:flex-1">
              <label htmlFor="busca-loja" className="sr-only">Buscar brindes</label>
              <div className="flex h-11 items-center overflow-hidden rounded-2xl bg-card text-foreground shadow-sm focus-within:ring-2 focus-within:ring-sky">
                <Search className="ml-3.5 size-4.5 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  id="busca-loja" value={busca} onChange={(e) => digitar(e.target.value)}
                  placeholder="Buscar brindes, ex.: garrafa, caderno, camiseta"
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14.5px] outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" className="h-full shrink-0 bg-accent px-4 font-display text-[14px] font-bold text-foreground hover:bg-accent/90">Buscar</button>
              </div>
            </form>
          ) : <div className="hidden flex-1 md:block" />}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden lg:block">
              <ParPills
                rotulo="Ver como (só no protótipo)" escuro tamanho="sm" valor={rota.perfil} onChange={trocarPerfil}
                opcoes={[{ valor: "diretor", rotulo: "Diretor" }, { valor: "equipe", rotulo: "Equipe de marketing" }]}
              />
            </div>
            <div className="relative lg:hidden">
              <button type="button" onClick={() => setMenuPerfil((v) => !v)} aria-expanded={menuPerfil} aria-haspopup="menu"
                className="flex h-11 items-center gap-1 rounded-xl bg-white/12 px-3 font-display text-[13px] font-bold">
                {equipe ? "Equipe" : "Diretor"} <ChevronDown className="size-4" aria-hidden />
              </button>
              {menuPerfil && (
                <div role="menu" className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border bg-card p-1.5 text-foreground shadow-[var(--shadow-float)]">
                  <p className="px-3 pb-1 pt-1.5 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">Ver como (só no protótipo)</p>
                  {(["diretor", "equipe"] as const).map((p) => (
                    <button key={p} role="menuitemradio" aria-checked={rota.perfil === p} type="button" onClick={() => trocarPerfil(p)}
                      className={cn("flex h-11 w-full items-center rounded-xl px-3 text-left font-display text-[14px] font-bold", rota.perfil === p ? "bg-navy-soft text-primary" : "hover:bg-secondary")}>
                      {p === "diretor" ? "Diretor de área" : "Equipe de marketing"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!equipe && (
              <>
                <button type="button" onClick={() => navegar("/loja/pedidos")}
                  className={cn("hidden h-11 items-center gap-2 rounded-xl px-3 font-display text-[14px] font-bold hover:bg-white/10 sm:flex", (rota.t.tela === "pedidos" || rota.t.tela === "pedido") && "bg-white/12")}>
                  <Package className="size-4.5" aria-hidden /> Meus pedidos
                </button>
                <button type="button" onClick={() => trocarParams({ carrinho: "1" })} aria-label={`Meu pedido, ${qtdCarrinho} itens`}
                  className="relative flex h-11 items-center gap-2 rounded-xl bg-white/12 px-3 font-display text-[14px] font-bold hover:bg-white/20">
                  <ShoppingBag className="size-5" aria-hidden />
                  <span className="hidden sm:inline">Meu pedido</span>
                  {qtdCarrinho > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[12px] font-bold tabular-nums text-foreground">{qtdCarrinho}</span>
                  )}
                </button>
              </>
            )}
            <span className="hidden md:block"><Avatar iniciais={eu.iniciais} escuro /></span>
          </div>
        </div>
      </div>
      <div className="h-[3px] bg-accent" aria-hidden />
      <div className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 md:px-6">
          <nav aria-label={equipe ? "Áreas da gestão" : "Categorias"} className="-mb-px min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
            <ul className="flex w-max items-center gap-1">
              {equipe
                ? abas.map((a) => {
                    const ativo = abaAtiva === a.id;
                    return (
                      <li key={a.id}>
                        <button type="button" onClick={() => navegar(a.para)} aria-current={ativo ? "page" : undefined}
                          className={cn("flex h-12 items-center gap-2 border-b-[3px] px-3 font-display text-[14.5px] font-bold transition-colors", ativo ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                          <a.icone className="size-4.5" aria-hidden /> {a.rotulo}
                          {a.cont > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-navy-soft px-1.5 text-[12px] tabular-nums text-primary">{a.cont}</span>}
                        </button>
                      </li>
                    );
                  })
                : [{ id: "", nome: "Todas" }, ...CATEGORIAS].map((c) => {
                    const ativo = rota.t.tela === "vitrine" && catAtiva === c.id;
                    return (
                      <li key={c.id || "todas"}>
                        <button type="button" onClick={() => navegar("/loja", { cat: c.id || undefined })} aria-current={ativo ? "page" : undefined}
                          className={cn("flex h-12 items-center whitespace-nowrap border-b-[3px] px-3 font-display text-[14.5px] font-bold transition-colors", ativo ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                          {c.nome}
                        </button>
                      </li>
                    );
                  })}
            </ul>
          </nav>
          <p className="hidden shrink-0 text-[13px] text-muted-foreground xl:block">
            <span className="font-semibold text-foreground">{eu.nome}</span>
            {" · "}
            {equipe ? "Equipe de marketing" : `${eu.centroCustoId} ${areaDoCentro(eu.centroCustoId!)}`}
          </p>
        </div>
      </div>
    </header>
  );
}
