// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/CarrinhoPainel.tsx (folha lateral fixa), lido em 2026-11-11; reescrito aqui, sem importar dele.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Folha lateral fixa (position: fixed): abrir ou fechar não desloca nenhum controle.
// Cada linha mostra a mensagem de validação em posição absoluta no fim do cartão, então validar a quantidade não move o "Remover".

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PrecoBrinde } from "./PrecoBrinde";
import { precoDaLinhaDoCarrinho, totalDoCarrinho } from "./regras";
import { TotalPedido } from "./TotalPedido";
import { navegar } from "./rota";
import { useLoja, type LinhaCarrinho } from "./store";
import { SAIDA_ITEM_MS } from "./movimento";
import { FotoBrinde, Msg, useArmadilhaFoco, useSaidaAnimada } from "./ui";

const CAMPO =
  "h-11 w-full rounded-2xl border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";

function ItemCarrinho({ l }: { l: LinhaCarrinho }) {
  const loja = useLoja();
  const b = loja.brinde(l.brindeId);
  const [texto, setTexto] = useState(String(l.qtd));
  const [erro, setErro] = useState<string | null>(null);
  // A quantidade pode mudar por fora (ex.: "Adicionar ao carrinho" do mesmo brinde na página dele); o campo acompanha.
  // Só roda quando l.qtd muda, então digitar um valor inválido não é desfeito.
  useEffect(() => {
    setTexto((t) => (Number(t) === l.qtd ? t : String(l.qtd)));
    setErro(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l.qtd]);
  // Remover: o item recolhe a altura (grid 1fr → 0fr) e some com fade; só depois sai da lista.
  const { saindo, fechar: remover } = useSaidaAnimada(() => loja.remover(l.chave), SAIDA_ITEM_MS);
  if (!b) return null;

  const resumo = [l.personalizacao?.texto, l.personalizacao?.arte ? `Arte: ${l.personalizacao.arte}` : ""].filter(Boolean).join(" · ");

  const mudar = (valor: string) => {
    setTexto(valor);
    const n = valor.trim() === "" ? Number.NaN : Number(valor);
    const r = loja.definirQuantidade(l.chave, n);
    setErro(r.ok ? null : r.motivo);
  };

  return (
    <li className="le-colapsa" data-saindo={saindo}>
      <div className="le-colapsa-in">
        {/* Polimento final: a faixa de erro deixou de ocupar linha própria (antes mt-1 + min-h-5 = 24 px). A mensagem é absoluta no
            fim do cartão, dentro de 18 px de padding inferior (6 px a mais que o padrão de 12), então aparecer não move nada. */}
        <div className="relative rounded-2xl border bg-card px-3 pb-[18px] pt-3">
          <div className="flex gap-3">
            <div className="size-16 shrink-0 overflow-hidden rounded-xl border">
              <FotoBrinde src={b.foto} alt={b.nome} compacto />
            </div>
            <div className="min-w-0 flex-1">
              <p title={b.nome} className="line-clamp-2 break-words font-display text-base font-bold leading-snug text-navy">{b.nome}</p>
              {resumo && <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{resumo}</p>}
              <PrecoBrinde modo="linha" linha={precoDaLinhaDoCarrinho(b, l.qtd)} className="mt-1" />
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
              onClick={remover}
              className="le-btn h-11 shrink-0 rounded-full px-4 font-display text-sm font-bold text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
            >
              Remover
            </button>
          </div>
          <p role={erro ? "alert" : undefined} className="absolute inset-x-3 bottom-px text-xs font-semibold leading-4 text-[color:var(--destructive-strong)]">
            <Msg texto={erro} />
          </p>
        </div>
      </div>
    </li>
  );
}

export function CarrinhoPainel() {
  const loja = useLoja();
  const aberto = loja.carrinhoAberto && loja.visao === "diretor";
  const painel = useRef<HTMLElement>(null);

  // Foco preso na folha (começa no botão de fechar), fundo sem rolar e foco de volta ao botão Carrinho ao fechar (A-13).
  useArmadilhaFoco(aberto, painel);
  useEffect(() => {
    if (!aberto) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && loja.abrirCarrinho(false);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  // Total só das linhas com preço; as personalizáveis sem orçamento ficam fora e contam como "a avaliar".
  const { total, aAvaliar } = totalDoCarrinho(loja.dados.brindes, loja.carrinho);

  const revisar = () => {
    loja.abrirCarrinho(false);
    navegar("revisao");
  };

  return (
    <>
      <div
        className="le-scrim fixed inset-0 z-40 bg-foreground/30"
        data-aberto={aberto}
        onClick={() => loja.abrirCarrinho(false)}
        aria-hidden
      />
      <aside
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho"
        aria-hidden={!aberto}
        data-aberto={aberto}
        className="le-sheet fixed right-0 top-0 z-50 flex h-full w-[min(420px,100vw)] flex-col rounded-l-3xl border-l bg-card shadow-card"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
          <h2 className="font-display text-xl font-bold text-navy">Carrinho</h2>
          <button
            type="button"
            onClick={() => loja.abrirCarrinho(false)}
            aria-label="Fechar carrinho"
            className="le-btn grid size-11 place-items-center rounded-full text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
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
            <ul>
              {loja.carrinho.map((l) => (
                <ItemCarrinho key={l.chave} l={l} />
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t p-5">
          {/* A faixa do aviso tem altura reservada: com ou sem aviso, o botão não se move. */}
          <TotalPedido total={total} aAvaliar={aAvaliar} />
          <button
            type="button"
            disabled={loja.carrinho.length === 0}
            onClick={revisar}
            className="le-btn h-11 w-full rounded-full bg-navy font-display text-sm font-bold text-navy-foreground hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Revisar pedido
          </button>
        </div>
      </aside>
    </>
  );
}
