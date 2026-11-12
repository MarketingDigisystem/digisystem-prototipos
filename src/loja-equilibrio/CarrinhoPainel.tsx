// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/CarrinhoPainel.tsx (folha lateral fixa), lido em 2026-11-11; reescrito aqui, sem importar dele.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Folha lateral fixa (position: fixed): abrir ou fechar não desloca nenhum controle.
// Cada linha reserva uma faixa de mensagem de altura fixa, então validar a quantidade não move o "Remover".

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { brl } from "./formato";
import { navegar } from "./rota";
import { useLoja, type LinhaCarrinho } from "./store";
import { FotoBrinde } from "./ui";

const CAMPO =
  "h-11 w-full rounded-2xl border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky";

function ItemCarrinho({ l }: { l: LinhaCarrinho }) {
  const loja = useLoja();
  const b = loja.brinde(l.brindeId);
  const v = b?.variacoes.find((x) => x.id === l.variacaoId);
  const [texto, setTexto] = useState(String(l.qtd));
  const [erro, setErro] = useState<string | null>(null);
  if (!b || !v) return null;

  const personalizavel = b.tipo === "personalizavel";
  const resumo = [l.personalizacao?.texto, l.personalizacao?.arte ? `Arte: ${l.personalizacao.arte}` : ""].filter(Boolean).join(" · ");

  const mudar = (valor: string) => {
    setTexto(valor);
    const n = valor.trim() === "" ? Number.NaN : Number(valor);
    const r = loja.definirQuantidade(l.chave, n);
    setErro(r.ok ? null : r.motivo);
  };

  return (
    <li className="rounded-2xl border bg-card p-3">
      <div className="flex gap-3">
        <div className="size-16 shrink-0 overflow-hidden rounded-xl border">
          <FotoBrinde src={b.foto} alt={b.nome} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold text-navy">{b.nome}</p>
          <p className="text-xs text-muted-foreground">{v.rotulo}</p>
          {resumo && <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{resumo}</p>}
          <p className="mt-1 text-sm font-semibold text-foreground">
            {personalizavel ? "Valor avaliado conforme a quantidade" : `${brl((b.custoUnitario ?? 0) * l.qtd)} (${brl(b.custoUnitario ?? 0)} cada)`}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <span>Qtd.</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={texto}
            onChange={(e) => mudar(e.target.value)}
            aria-label={`Quantidade de ${b.nome}`}
            aria-invalid={!!erro}
            className={`${CAMPO} w-24 ${erro ? "border-destructive" : ""}`}
          />
        </label>
        <button
          type="button"
          onClick={() => loja.remover(l.chave)}
          className="h-11 shrink-0 rounded-full px-4 font-display text-sm font-bold text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          Remover
        </button>
      </div>
      <p role={erro ? "alert" : undefined} className="mt-1 min-h-10 text-xs font-semibold text-destructive">
        {erro}
      </p>
    </li>
  );
}

export function CarrinhoPainel() {
  const loja = useLoja();
  const aberto = loja.carrinhoAberto && loja.visao === "diretor";
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    fechar.current?.focus();
    const f = (e: KeyboardEvent) => e.key === "Escape" && loja.abrirCarrinho(false);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  // Total só das linhas de estoque; as personalizáveis contam como "a avaliar".
  let total = 0;
  let aAvaliar = 0;
  for (const l of loja.carrinho) {
    const b = loja.brinde(l.brindeId);
    if (!b) continue;
    if (b.tipo === "estoque") total += Math.round((b.custoUnitario ?? 0) * l.qtd * 100) / 100;
    else aAvaliar += 1;
  }

  const revisar = () => {
    loja.abrirCarrinho(false);
    navegar("revisao");
  };

  return (
    <>
      <div
        className="le-scrim fixed inset-0 z-40 bg-foreground/30 data-[aberto=false]:invisible data-[aberto=false]:opacity-0"
        data-aberto={aberto}
        onClick={() => loja.abrirCarrinho(false)}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Carrinho"
        aria-hidden={!aberto}
        data-aberto={aberto}
        className="le-sheet fixed right-0 top-0 z-50 flex h-full w-[min(420px,100vw)] translate-x-0 flex-col rounded-l-3xl border-l bg-card shadow-card data-[aberto=false]:invisible data-[aberto=false]:translate-x-full"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
          <h2 className="font-display text-xl font-bold text-navy">Carrinho</h2>
          <button
            ref={fechar}
            type="button"
            onClick={() => loja.abrirCarrinho(false)}
            aria-label="Fechar carrinho"
            className="grid size-11 place-items-center rounded-full text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loja.carrinho.length === 0 ? (
            <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
              Seu carrinho está vazio. Escolha um brinde no catálogo para começar o pedido.
            </p>
          ) : (
            <ul className="space-y-3">
              {loja.carrinho.map((l) => (
                <ItemCarrinho key={l.chave} l={l} />
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-sm font-bold text-navy">Total dos brindes de estoque</span>
            <span className="font-display text-lg font-bold text-navy tabular-nums">{brl(total)}</span>
          </div>
          {/* Faixa reservada: com ou sem aviso, o botão não se move. */}
          <p className="min-h-5 text-xs font-semibold text-foreground/80">
            {aAvaliar > 0 ? `${aAvaliar} ${aAvaliar === 1 ? "item" : "itens"} a avaliar` : ""}
          </p>
          <button
            type="button"
            disabled={loja.carrinho.length === 0}
            onClick={revisar}
            className="h-11 w-full rounded-full bg-navy font-display text-sm font-bold text-white transition-colors hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            Revisar pedido
          </button>
        </div>
      </aside>
    </>
  );
}
