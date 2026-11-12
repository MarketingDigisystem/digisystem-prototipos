// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/Cabecalho.tsx e loja-brindes/Cabecalho.tsx (pills), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Âncora fixa (Req. 2.5 e 6.1): linha 1 = marca à esquerda; "Sugira um brinde" e "Carrinho" na extremidade direita, com largura fixa.
// Linha 2 = região de navegação (largura estável, rola na horizontal) + Seletor_de_Visao em par de pills na extremidade direita.
// Trocar de visão, abrir o carrinho ou esvaziá-lo muda só o conteúdo da região de navegação e o selo do carrinho (posição absoluta).
// Ativo muda só cor e anel (box-shadow), nunca peso, borda ou tamanho.

import { ClipboardList, Lightbulb, ShoppingBag } from "lucide-react";
import { alertasMinimo, esgotados } from "./regras";
import { href, navegar, type AbaGestao, type RotaAtual } from "./rota";
import { useLoja, type Visao } from "./store";

const BASE =
  "relative inline-flex h-11 items-center justify-center gap-2 rounded-full border border-transparent px-3 font-display text-sm font-bold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky";
const ATIVO = "bg-navy-soft text-navy shadow-[0_0_0_2px_var(--sky)]";
const INATIVO = "text-foreground/80 hover:bg-navy-soft hover:text-navy";

/** Contador com largura reservada: o espaço existe de 0 a 99, só o fundo aparece quando há valor. */
function Contador({ n }: { n: number }) {
  const texto = n > 99 ? "99+" : String(n);
  return (
    <span
      aria-hidden={n === 0}
      className={`grid h-5 w-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums ${
        n > 0 ? "bg-navy-soft text-navy" : "text-transparent"
      }`}
    >
      {n > 0 ? texto : "0"}
    </span>
  );
}

interface ItemNav {
  id: string;
  rotulo: string;
  caminho: string;
  contador: number;
  ativo: boolean;
}

function useItensNav(rota: RotaAtual): ItemNav[] {
  const { visao, dados, pessoa } = useLoja();
  const t = rota.t;
  if (visao === "diretor") {
    const meusAtivos = dados.pedidos.filter(
      (p) => p.solicitanteId === pessoa.id && (p.estado === "solicitada" || p.estado === "em_alinhamento" || p.estado === "pronto"),
    ).length;
    return [
      { id: "brindes", rotulo: "Brindes", caminho: "", contador: 0, ativo: t.tela === "vitrine" || t.tela === "brinde" },
      { id: "pedidos", rotulo: "Pedidos", caminho: "pedidos", contador: meusAtivos, ativo: t.tela === "pedidos" },
    ];
  }
  const fila = dados.pedidos.filter((p) => p.estado === "solicitada" || p.estado === "em_alinhamento" || p.estado === "pronto").length;
  const sugestoes = dados.sugestoes.filter((s) => s.estado === "sugerida" || s.estado === "em_analise").length;
  const estoque = alertasMinimo(dados).length + esgotados(dados).length;
  const aba: AbaGestao | null = t.tela === "gestao" ? t.aba : null;
  const g = (id: AbaGestao, rotulo: string, contador: number): ItemNav => ({
    id,
    rotulo,
    caminho: `gestao/${id}`,
    contador,
    ativo: aba === id,
  });
  return [
    g("fila", "Fila", fila),
    g("sugestoes", "Sugestões", sugestoes),
    g("estoque", "Estoque", estoque),
    g("movimentacoes", "Movimentações", 0),
    g("metricas", "Métricas", 0),
    g("cadastro", "Cadastro", 0),
  ];
}

export function Cabecalho({ rota }: { rota: RotaAtual }) {
  const loja = useLoja();
  const itens = useItensNav(rota);
  const unidades = loja.carrinho.reduce((n, l) => n + l.qtd, 0);
  const rotuloSelo = unidades > 99 ? "99+" : String(unidades);
  const noDiretor = loja.visao === "diretor";

  const trocar = (v: Visao) => {
    if (v === loja.visao) return;
    loja.trocarVisao(v);
    navegar(v === "gestao" ? "gestao/fila" : "");
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Linha 1: marca à esquerda; Sugira e Carrinho na extremidade direita, larguras fixas. */}
        <div className="flex h-16 items-center justify-between gap-3">
          <a href={href("")} className="flex h-11 w-[132px] shrink-0 items-center" aria-label="Digi Store, início">
            <span className="font-display text-2xl font-bold leading-none tracking-tight text-navy">Digi Store</span>
            <span className="ml-1 mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          </a>

          <div className="flex shrink-0 items-center gap-1">
            <a
              href={href("sugerir")}
              aria-label="Sugira um brinde"
              aria-current={rota.t.tela === "sugerir" ? "page" : undefined}
              className={`${BASE} w-11 sm:w-[176px] ${rota.t.tela === "sugerir" ? ATIVO : INATIVO}`}
            >
              <Lightbulb className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Sugira um brinde</span>
            </a>
            <button
              type="button"
              onClick={() => noDiretor && loja.abrirCarrinho(!loja.carrinhoAberto)}
              aria-expanded={loja.carrinhoAberto}
              aria-disabled={!noDiretor}
              title={noDiretor ? undefined : "O carrinho é do diretor solicitante."}
              aria-label={`Carrinho, ${unidades} ${unidades === 1 ? "unidade" : "unidades"}`}
              className={`${BASE} w-11 sm:w-[124px] ${loja.carrinhoAberto ? ATIVO : INATIVO} ${noDiretor ? "" : "cursor-not-allowed opacity-50"}`}
            >
              <ShoppingBag className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Carrinho</span>
              {unidades > 0 && (
                <span className="pointer-events-none absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold leading-5 tabular-nums text-foreground">
                  {rotuloSelo}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Linha 2: navegação com região estável + Seletor_de_Visao fixo na extremidade direita. */}
        <div className="flex h-14 items-center justify-between gap-3 border-t border-border/60">
          <nav aria-label={noDiretor ? "Navegação do diretor" : "Navegação da gestão"} className="le-nav h-full min-w-0 flex-1 overflow-x-auto">
            <ul className="flex h-full w-max items-center gap-1">
              {itens.map((i) => (
                <li key={i.id}>
                  <a
                    href={href(i.caminho)}
                    aria-current={i.ativo ? "page" : undefined}
                    className={`${BASE} gap-1.5 whitespace-nowrap ${i.ativo ? ATIVO : INATIVO}`}
                  >
                    {i.rotulo}
                    <Contador n={i.contador} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden w-[132px] text-right text-xs font-semibold text-muted-foreground md:block">Ver o protótipo como</span>
            <div role="group" aria-label="Ver o protótipo como" className="grid grid-cols-2 gap-0.5 rounded-full bg-secondary p-0.5">
              {(["diretor", "gestao"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={loja.visao === v}
                  onClick={() => trocar(v)}
                  className={`h-11 w-[76px] rounded-full font-display text-sm font-bold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky sm:w-[88px] ${
                    loja.visao === v ? "bg-navy text-white" : "text-navy hover:bg-card"
                  }`}
                >
                  {v === "diretor" ? "Diretor" : "Gestão"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
