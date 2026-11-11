/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: .kiro/specs/loja-digi-store-brindes/design.md (Vitrine, FiltroCategorias, CartaoBrinde) + requirements.md Req. 2.
 * Cabeçalho e, logo abaixo, a grade. Uma linha de categorias, sem destaque, sem "Como funciona", sem "Usado em N eventos".
 * Cartão: foto, nome, tipo e Disponivel. O diretor nunca vê saldo físico, reserva ou mínimo.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { useState } from "react";
import { FotoBrinde } from "../FotoBrinde";
import { CATEGORIAS } from "../mock";
import { href, useRota } from "../rota";
import { useLoja } from "../store";
import { Aviso, EstadoErro, EstadoVazio, Esqueleto } from "./Estados";
import { TIPO_ROTULO } from "./util";

export function Vitrine() {
  const loja = useLoja();
  const { estado } = useRota();
  const [cat, setCat] = useState("todos");
  const skus = estado === "vazio" ? [] : loja.skus.filter((s) => cat === "todos" || s.categoria === cat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="sr-only">Brindes da Digi Store</h1>

      <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Categorias">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
            className={`h-10 shrink-0 rounded-full border border-transparent px-4 font-display text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky ${cat === c.id ? "bg-navy-soft text-navy shadow-[0_0_0_2px_var(--sky)]" : "text-foreground/80 hover:bg-navy-soft hover:text-navy"}`}
          >
            {c.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {estado === "sucesso" && <div className="mb-4"><Aviso tom="sucesso">Brinde adicionado ao carrinho. Abra o carrinho para revisar o pedido.</Aviso></div>}
        {estado === "carregando" ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Carregando brindes">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]">
                <Esqueleto className="aspect-square w-full rounded-none" />
                <div className="space-y-2 p-4">
                  <Esqueleto className="h-4 w-3/4" />
                  <Esqueleto className="h-3 w-1/2" />
                </div>
              </li>
            ))}
          </ul>
        ) : estado === "erro" ? (
          <EstadoErro titulo="Não foi possível carregar os brindes" texto="Confira a conexão e tente de novo." />
        ) : skus.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum brinde por aqui"
            texto={cat === "todos" ? "O catálogo está sem brindes no momento." : "Não há brindes nesta categoria agora."}
            acao={
              cat !== "todos" ? (
                <button type="button" onClick={() => setCat("todos")} className="h-10 rounded-full bg-navy px-5 font-display text-sm font-bold text-white">
                  Ver todos os brindes
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {skus.map((s) => {
              const disp = loja.disponivel(s.id);
              const indisponivel = s.tipo === "propriedade" && disp <= 0;
              return (
                <li key={s.id}>
                  <a
                    href={href(`brinde/${s.id}`)}
                    className="group block h-full overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-float)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                  >
                    <FotoBrinde src={s.foto} alt={s.nome} className={`aspect-square w-full p-3 ${indisponivel ? "opacity-50" : ""}`} />
                    <div className="space-y-2 p-4">
                      <h2 className="line-clamp-2 min-h-[2.5rem] text-base font-bold leading-tight text-navy">{s.nome}</h2>
                      <div className="flex min-h-[1.5rem] flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="rounded-full bg-navy-soft px-2.5 py-0.5 text-xs font-bold text-navy">{TIPO_ROTULO[s.tipo]}</span>
                        {s.tipo === "propriedade" && (
                          <span className={`text-xs font-semibold ${indisponivel ? "text-destructive" : "text-muted-foreground"}`}>
                            {indisponivel ? "Indisponível no momento" : `${disp} ${disp === 1 ? "disponível" : "disponíveis"}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
