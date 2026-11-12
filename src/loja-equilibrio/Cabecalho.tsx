// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/Cabecalho.tsx e loja-brindes/Cabecalho.tsx, lidos em 2026-11-11; reescrito em 2026-11-12 (Req. 12) sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Layout da vitrine).
//
// Cabeçalho branco de uma linha (lg+): logo à esquerda, navegação sublinhada em laranja no item ativo (sem pill),
// "Sugira um brinde" e "Carrinho" à direita, com larguras fixas. Abaixo de lg a navegação desce para uma linha própria que rola.
// O seletor de visão vive na FaixaSeletor, fora daqui.
// Âncora fixa (Req. 12.15, 2.5): abrir/fechar/esvaziar o Carrinho só muda o selo (posição absoluta, sempre montado).
// Ativo muda só cor e sublinhado (border-b-2 transparente nos inativos), nunca peso, tamanho ou posição.

import { Lightbulb, ShoppingBag } from "lucide-react";
import { LogoDigiStore } from "./LogoDigiStore";
import { alertasMinimo, esgotados } from "./regras";
import { href, type AbaGestao, type RotaAtual } from "./rota";
import { useLoja } from "./store";
import { useContagemDeMudancas, useFaixaRolante } from "./ui";

const FOCO = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";
const ACAO = `relative inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 font-display text-sm font-bold le-cor ${FOCO}`;

function Contador({ n }: { n: number }) {
  const texto = n > 99 ? "99+" : String(n);
  return (
    <span className="ml-2 grid h-5 min-w-6 place-items-center rounded-full bg-secondary px-1.5 text-xs font-bold tabular-nums text-navy">
      {texto}
    </span>
  );
}

interface ItemNav {
  id: string;
  rotulo: string;
  caminho: string;
  /** null = item sem contador. */
  contador: number | null;
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
      { id: "brindes", rotulo: "Brindes", caminho: "", contador: null, ativo: t.tela === "vitrine" || t.tela === "brinde" },
      { id: "pedidos", rotulo: "Pedidos", caminho: "pedidos", contador: meusAtivos, ativo: t.tela === "pedidos" },
    ];
  }
  const fila = dados.pedidos.filter((p) => p.estado === "solicitada" || p.estado === "em_alinhamento" || p.estado === "pronto").length;
  const sugestoes = dados.sugestoes.filter((s) => s.estado === "sugerida" || s.estado === "em_analise").length;
  const estoque = alertasMinimo(dados).length + esgotados(dados).length;
  const aba: AbaGestao | null = t.tela === "gestao" ? t.aba : null;
  const g = (id: AbaGestao, rotulo: string, contador: number | null): ItemNav => ({
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
    g("movimentacoes", "Movimentações", null),
    g("metricas", "Métricas", null),
    g("cadastro", "Cadastro", null),
  ];
}

export function Cabecalho({ rota }: { rota: RotaAtual }) {
  const loja = useLoja();
  const itens = useItensNav(rota);
  const unidades = loja.carrinho.reduce((n, l) => n + l.qtd, 0);
  const rotuloSelo = unidades > 99 ? "99+" : String(unidades);
  const pulso = useContagemDeMudancas(unidades);
  const noDiretor = loja.visao === "diretor";
  const refNav = useFaixaRolante<HTMLElement>(`${loja.visao}|${rota.t.tela}|${rota.t.tela === "gestao" ? rota.t.aba : ""}`);
  const sugerirAtivo = rota.t.tela === "sugerir";

  return (
    <header className="sticky top-0 z-30 border-b bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 px-4 sm:px-6 lg:flex-nowrap lg:gap-x-8">
        <a href={href("")} className={`flex h-14 shrink-0 items-center rounded-lg lg:h-16 ${FOCO}`}>
          <LogoDigiStore />
        </a>

        {/* Navegação: na mesma linha em lg+; abaixo disso ocupa a linha de baixo e rola dentro dela. */}
        <nav
          ref={refNav}
          aria-label={noDiretor ? "Navegação do diretor" : "Navegação da gestão"}
          className="le-nav le-rola order-last -mx-4 h-11 w-[calc(100%+2rem)] overflow-x-auto border-t border-border/60 px-4 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 lg:order-none lg:mx-0 lg:h-16 lg:w-auto lg:min-w-0 lg:flex-1 lg:border-t-0 lg:px-0"
        >
          <ul className="flex h-full w-max items-stretch gap-1">
            {itens.map((i) => (
              <li key={i.id} className="flex">
                <a
                  href={href(i.caminho)}
                  aria-current={i.ativo ? "page" : undefined}
                  className={`inline-flex items-center whitespace-nowrap border-b-2 px-3 font-display text-sm font-bold le-cor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--le-foco)] sm:px-4 ${
                    i.ativo ? "border-orange text-navy" : "border-transparent text-foreground/75 hover:text-navy"
                  }`}
                >
                  {i.rotulo}
                  {i.contador !== null && <Contador n={i.contador} />}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex h-14 shrink-0 items-center gap-2 lg:ml-0 lg:h-16">
          <a
            href={href("sugerir")}
            aria-label="Sugira um brinde"
            aria-current={sugerirAtivo ? "page" : undefined}
            className={`${ACAO} w-10 border-transparent sm:w-[168px] ${sugerirAtivo ? "bg-secondary text-navy" : "text-foreground/80 hover:bg-secondary hover:text-navy"}`}
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
            className={`${ACAO} w-10 border-input sm:w-[124px] ${loja.carrinhoAberto ? "bg-secondary text-navy" : "bg-card text-navy hover:bg-secondary"} ${noDiretor ? "" : "cursor-not-allowed opacity-50"}`}
          >
            <ShoppingBag className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Carrinho</span>
            {/* Selo sempre montado e absoluto: 0, 1 ou 2 dígitos e o pulso (scale) não deslocam o botão nem os vizinhos. */}
            <span
              key={pulso}
              aria-hidden
              className={`pointer-events-none absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold leading-5 tabular-nums text-[color:var(--on-accent)] ${
                unidades > 0 ? "opacity-100" : "opacity-0"
              } ${pulso > 0 && unidades > 0 ? "le-pulso-selo" : ""}`}
            >
              {rotuloSelo}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
