/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (área de gestão) e requirements.md Requisitos 7, 8, 9, 12, 14.
 * Rota #/loja-digi-store/gestao?aba=pedidos|estoque|sugestoes. Só a visão Equipe enxerga estoque, mínimo e alerta.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { href, useRota } from "../../rota";
import { useLoja } from "../../store";
import { EstoqueGestao } from "./EstoqueGestao";
import { PedidosGestao } from "./PedidosGestao";
import { SugestoesGestao } from "./SugestoesGestao";

const ABAS = [
  { id: "pedidos", rotulo: "Pedidos" },
  { id: "estoque", rotulo: "Estoque" },
  { id: "sugestoes", rotulo: "Sugestões" },
] as const;

export function Gestao() {
  const rota = useRota();
  const loja = useLoja();
  const aba = ABAS.find((a) => a.id === rota.aba)?.id ?? "pedidos";

  if (loja.visao !== "equipe") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-navy">Área da Equipe da Loja</h1>
        <p className="mt-2 text-muted-foreground">Estoque e gestão de pedidos aparecem só para a Equipe da Loja. No protótipo, troque a visão no menu da conta.</p>
        <button type="button" onClick={() => loja.trocarVisao("equipe")} className="mt-6 inline-flex h-10 items-center rounded-full bg-navy px-5 font-display text-sm font-bold text-white">
          Ver como Equipe
        </button>
      </div>
    );
  }

  const pendentes = loja.pedidos.filter((p) => p.estado === "solicitada").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-navy sm:text-4xl">Gestão da loja</h1>
      <p className="mt-1 text-muted-foreground">
        {pendentes > 0 ? `${pendentes} ${pendentes === 1 ? "pedido espera" : "pedidos esperam"} alguém assumir.` : "Nenhum pedido esperando alguém assumir."}
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Seções da gestão">
        {ABAS.map((a) => (
          <a
            key={a.id}
            role="tab"
            aria-selected={aba === a.id}
            href={href("gestao", { aba: a.id })}
            className={`inline-flex h-10 min-w-[112px] shrink-0 items-center justify-center rounded-full px-4 font-display text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky ${aba === a.id ? "bg-navy text-white shadow-[0_0_0_2px_var(--sky)]" : "bg-card text-navy hover:bg-navy-soft"}`}
          >
            {a.rotulo}
          </a>
        ))}
      </div>

      {aba === "pedidos" && <PedidosGestao estadoTela={rota.estado} />}
      {aba === "estoque" && <EstoqueGestao estadoTela={rota.estado} />}
      {aba === "sugestoes" && <SugestoesGestao estadoTela={rota.estado} />}
    </div>
  );
}
