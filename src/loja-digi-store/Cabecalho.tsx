/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (LojaShell) + tasks 1.5 (âncora fixa dos controles) + preferência de layout do projeto.
 * Regra: nenhum controle muda de posição por causa do estado de outro. Marca à esquerda; à direita
 * "Sugira um brinde", "Pedidos", "Carrinho" (selo absoluto) e menu da conta, todos com largura fixa.
 * Ativo muda só cor e anel (box-shadow), nunca peso, borda ou tamanho.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { ClipboardList, Gift, Lightbulb, ShoppingBag, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { href, type RotaAtual } from "./rota";
import { useLoja } from "./store";

const BASE = "relative inline-flex h-10 items-center justify-center gap-2 rounded-full border border-transparent px-3 font-display text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky";
const ATIVO = "bg-navy-soft text-navy shadow-[0_0_0_2px_var(--sky)]";
const INATIVO = "text-foreground/80 hover:bg-navy-soft hover:text-navy";

export function Cabecalho({ rota }: { rota: RotaAtual }) {
  const loja = useLoja();
  const [menu, setMenu] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const secao = rota.caminho[0] ?? "";
  const itens = loja.carrinho.reduce((n, l) => n + l.quantidade, 0);

  useEffect(() => {
    if (!menu) return;
    const f = (e: MouseEvent) => caixa.current && !caixa.current.contains(e.target as Node) && setMenu(false);
    const h = () => setMenu(false);
    document.addEventListener("mousedown", f);
    window.addEventListener("hashchange", h);
    return () => {
      document.removeEventListener("mousedown", f);
      window.removeEventListener("hashchange", h);
    };
  }, [menu]);

  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href={href("")} className="flex h-10 w-[148px] shrink-0 items-center gap-2" aria-label="Digi Store, início">
          <span className="grid size-9 place-items-center rounded-2xl bg-navy text-white">
            <Gift className="size-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-bold leading-none text-navy">Digi Store</span>
        </a>

        <nav className="flex items-center gap-1" aria-label="Navegação da Digi Store">
          <a href={href("sugestoes")} className={`${BASE} sm:w-[168px] w-10 ${secao === "sugestoes" ? ATIVO : INATIVO}`} aria-label="Sugira um brinde">
            <Lightbulb className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Sugira um brinde</span>
          </a>
          <a href={href("pedidos")} className={`${BASE} sm:w-[104px] w-10 ${secao === "pedidos" ? ATIVO : INATIVO}`} aria-label="Pedidos">
            <ClipboardList className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Pedidos</span>
          </a>
          <button
            type="button"
            onClick={() => loja.abrirCarrinho(!loja.carrinhoAberto)}
            aria-expanded={loja.carrinhoAberto}
            aria-label={`Carrinho, ${itens} ${itens === 1 ? "item" : "itens"}`}
            className={`${BASE} sm:w-[112px] w-10 ${loja.carrinhoAberto ? ATIVO : INATIVO}`}
          >
            <ShoppingBag className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Carrinho</span>
            {itens > 0 && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-[var(--accent-strong)] px-1 text-[11px] font-bold leading-5 text-white">
                {itens}
              </span>
            )}
          </button>

          <div ref={caixa} className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-label={`Conta de ${loja.pessoa}`}
              className={`${BASE} w-10 ${menu ? ATIVO : INATIVO}`}
            >
              <User className="size-4" aria-hidden />
            </button>
            {menu && (
              <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border bg-popover p-3 shadow-[var(--shadow-float)]">
                <p className="font-display text-base font-bold text-navy">{loja.pessoa}</p>
                <p className="text-xs text-muted-foreground">{loja.visao === "diretor" ? "Diretor" : "Equipe da Loja"}</p>
                <p className="mb-1.5 mt-3 text-xs font-semibold text-muted-foreground">Ver o protótipo como</p>
                <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1" role="group" aria-label="Visão">
                  {(["diretor", "equipe"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={loja.visao === v}
                      onClick={() => loja.trocarVisao(v)}
                      className={`h-8 rounded-full font-display text-sm font-bold transition-colors ${loja.visao === v ? "bg-navy text-white" : "text-navy hover:bg-card"}`}
                    >
                      {v === "diretor" ? "Diretor" : "Equipe"}
                    </button>
                  ))}
                </div>
                {loja.visao === "equipe" && (
                  <a href={href("gestao", { aba: "pedidos" })} onClick={() => setMenu(false)} className="mt-3 block rounded-xl px-2 py-2 text-sm font-semibold text-navy hover:bg-navy-soft">
                    Gestão da loja
                  </a>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
