// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/ (vitrine) e loja-brindes/ (grade de brindes), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 2).
//
// Vitrine: grade direta, sem banner. Uma linha com categorias + busca + ordem; a contagem e o vazio ficam ABAIXO dela,
// numa faixa de altura reservada, então nada que o filtro faz desloca os controles (âncora fixa).

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { disponivelBrinde, selos } from "../../regras";
import { href } from "../../rota";
import { useLoja } from "../../store";
import type { Brinde } from "../../tipos";
import { estiloEntrada } from "../../movimento";
import { FotoBrinde, Selo, useFaixaRolante } from "../../ui";

type Ordem = "novos" | "custo" | "az";

const ORDENS: { id: Ordem; rotulo: string }[] = [
  { id: "novos", rotulo: "Mais novos" },
  { id: "custo", rotulo: "Menor custo" },
  { id: "az", rotulo: "A a Z" },
];

const PILL =
  "inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-transparent px-4 font-display text-sm font-bold whitespace-nowrap le-cor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";
const PILL_ATIVO = "bg-navy-soft text-[color:var(--le-ativo)] shadow-[0_0_0_2px_var(--sky)]";
const PILL_INATIVO = "text-foreground/80 hover:bg-navy-soft hover:text-navy";
const CAMPO =
  "h-11 rounded-full border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";

/** Texto sem acento e em minúsculas, para a busca por nome. */
function normalizar(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function ordenar(lista: Brinde[], ordem: Ordem): Brinde[] {
  const l = [...lista];
  if (ordem === "az") return l.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  if (ordem === "custo") {
    // Personalizável não tem custo unitário: vai para o fim, em ordem alfabética.
    return l.sort((a, b) => {
      if (a.custoUnitario === null && b.custoUnitario === null) return a.nome.localeCompare(b.nome, "pt-BR");
      if (a.custoUnitario === null) return 1;
      if (b.custoUnitario === null) return -1;
      return a.custoUnitario - b.custoUnitario;
    });
  }
  // Mais novos: novidades primeiro; a ordem do catálogo (mais recente por último no mock) se mantém dentro de cada grupo, invertida.
  const idx = new Map(lista.map((b, i) => [b.id, i]));
  return l.sort((a, b) => Number(b.novidade) - Number(a.novidade) || (idx.get(b.id)! - idx.get(a.id)!));
}

function Cartao({ b, indice }: { b: Brinde; indice: number }) {
  const s = selos(b);
  const disp = disponivelBrinde(b);
  // li: entrada escalonada (fade) e elevação no hover por transform; a sombra de hover vive num pseudo-elemento do li (.le-cartao), fora do overflow do link.
  return (
    <li className="le-cartao le-entra" style={estiloEntrada(indice)}>
      <a
        href={href(`brinde/${b.slug}`)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
      >
        <div className="relative">
          <FotoBrinde src={b.foto} alt={b.nome} className={s.indisponivel ? "opacity-60" : ""} />
          {(s.novidade || s.ultimasUnidades) && (
            <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
              {s.novidade && <Selo tipo="novidade" />}
              {s.ultimasUnidades && <Selo tipo="ultimas" />}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
          <h3 className="font-display text-base font-bold leading-snug text-navy sm:text-lg">{b.nome}</h3>
          <p className="text-xs text-muted-foreground">{b.tipo === "estoque" ? "Brinde em estoque" : "Personalizável"}</p>
          <p className="mt-auto pt-2 text-sm font-semibold text-foreground">
            {b.tipo === "personalizavel" ? (
              <span>Valor avaliado conforme a quantidade</span>
            ) : s.indisponivel ? (
              <span className="text-muted-foreground">Indisponível no momento</span>
            ) : (
              <span>{disp} disponíveis</span>
            )}
          </p>
        </div>
      </a>
    </li>
  );
}

export function Vitrine() {
  const { dados } = useLoja();
  const [categoria, setCategoria] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("novos");
  const refCategorias = useFaixaRolante<HTMLDivElement>(categoria);

  const ativos = useMemo(() => dados.brindes.filter((b) => b.ativo), [dados.brindes]);
  const categorias = useMemo(() => ["Todos", ...Array.from(new Set(ativos.map((b) => b.categoria)))], [ativos]);

  const lista = useMemo(() => {
    const q = normalizar(busca);
    const filtrada = ativos.filter(
      (b) => (categoria === "Todos" || b.categoria === categoria) && (!q || normalizar(b.nome).includes(q)),
    );
    return ordenar(filtrada, ordem);
  }, [ativos, categoria, busca, ordem]);

  const filtrando = categoria !== "Todos" || busca.trim() !== "";
  const limpar = () => {
    setCategoria("Todos");
    setBusca("");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6" aria-labelledby="vitrine-titulo">
      <h1 id="vitrine-titulo" className="sr-only">
        Brindes
      </h1>

      {/* Linha única e discreta: categorias à esquerda (rola se faltar espaço), busca e ordem fixas à direita. */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div ref={refCategorias} role="group" aria-label="Categorias" className="le-nav le-rola -mx-1 -my-1 min-w-0 flex-1 overflow-x-auto px-1 py-1">
          <div className="flex w-max items-center gap-1">
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={categoria === c}
                onClick={() => setCategoria(c)}
                className={`${PILL} ${categoria === c ? PILL_ATIVO : PILL_INATIVO}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <label className="relative block min-w-0 flex-1 md:w-52 md:flex-none">
            <span className="sr-only">Buscar brinde pelo nome</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar pelo nome"
              className={`${CAMPO} w-full pl-10`}
            />
          </label>
          <label className="block shrink-0">
            <span className="sr-only">Ordenar por</span>
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as Ordem)}
              className={`${CAMPO} w-[140px] font-semibold text-navy`}
            >
              {ORDENS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Faixa de altura reservada: a contagem muda, a linha acima e a grade não pulam por causa dela. */}
      <p className="flex min-h-9 items-center text-xs text-muted-foreground" aria-live="polite">
        {lista.length === 1 ? "1 brinde" : `${lista.length} brindes`}
        {categoria !== "Todos" ? ` em ${categoria}` : ""}
      </p>

      {lista.length === 0 ? (
        <div className="le-fade rounded-3xl border bg-card p-8 text-center shadow-card">
          <h2 className="font-display text-xl font-bold text-navy">Nenhum brinde encontrado</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {filtrando ? "Tente outro nome ou outra categoria, ou volte para ver todos os brindes." : "Ainda não há brindes ativos no catálogo."}
          </p>
          {filtrando && (
            <button
              type="button"
              onClick={limpar}
              className="le-btn mt-4 inline-flex h-11 items-center rounded-full bg-navy px-5 font-display text-sm font-bold text-navy-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
            >
              Ver todos os brindes
            </button>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {lista.map((b, i) => (
            <Cartao key={b.id} b={b} indice={i} />
          ))}
        </ul>
      )}
    </section>
  );
}
