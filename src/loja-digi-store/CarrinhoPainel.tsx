/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (CarrinhoPainel, Sheet lateral) + requirements.md Req. 5.
 * Painel fixo à direita sobre um véu; o conteúdo da página não se move.
 * Personalizável: "Valor a avaliar conforme a quantidade" e sem total em reais. Linha acima do Disponivel fica sinalizada
 * e bloqueia "Revisar pedido".
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { AlertTriangle, Minus, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { FotoBrinde } from "./FotoBrinde";
import { href, navegar, useRota } from "./rota";
import { useLoja } from "./store";
import { EstadoErro, EstadoVazio, Esqueleto } from "./telas/Estados";
import { BOTAO_SECUNDARIO, brl } from "./telas/util";

export function CarrinhoPainel() {
  const loja = useLoja();
  const { estado } = useRota();
  const aberto = loja.carrinhoAberto;
  const linhas = loja.carrinho.map((l) => ({ l, sku: loja.skus.find((s) => s.id === l.skuId)! }));
  const temPersonalizavel = linhas.some((x) => x.sku.tipo === "personalizavel");
  const total = linhas.reduce((n, x) => n + (x.sku.custoUnitario ?? 0) * x.l.quantidade, 0);
  const excede = (x: (typeof linhas)[number]) => x.sku.tipo === "propriedade" && x.l.quantidade > loja.disponivel(x.sku.id);
  const temExcesso = linhas.some(excede);
  const vazio = estado === "vazio" || linhas.length === 0;
  const fechar = () => loja.abrirCarrinho(false);

  useEffect(() => {
    if (!aberto) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && loja.abrirCarrinho(false);
    document.addEventListener("keydown", f);
    return () => document.removeEventListener("keydown", f);
  }, [aberto, loja]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-foreground/30 transition-opacity ${aberto ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={fechar}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Carrinho"
        aria-hidden={!aberto}
        className={`ds-sheet fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-[var(--shadow-float)] ${aberto ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
          <h2 className="text-xl font-bold text-navy">Carrinho</h2>
          <button type="button" onClick={fechar} aria-label="Fechar carrinho" tabIndex={aberto ? 0 : -1} className="grid size-10 place-items-center rounded-full text-navy hover:bg-navy-soft">
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {estado === "carregando" ? (
            <div className="space-y-3" aria-busy="true" aria-label="Carregando carrinho">
              {[0, 1, 2].map((i) => <Esqueleto key={i} className="h-24 w-full" />)}
            </div>
          ) : estado === "erro" ? (
            <EstadoErro titulo="Não foi possível abrir o carrinho" texto="Seus brindes continuam salvos. Tente de novo." />
          ) : vazio ? (
            <EstadoVazio
              titulo="Seu carrinho está vazio"
              texto="Escolha os brindes na vitrine e volte aqui para revisar o pedido."
              acao={<a href={href("")} onClick={fechar} className={BOTAO_SECUNDARIO}>Ver brindes</a>}
            />
          ) : (
            <ul className="space-y-3">
              {linhas.map((x) => {
                const { l, sku } = x;
                const ruim = excede(x);
                const disp = loja.disponivel(sku.id);
                return (
                  <li key={l.chave} className={`rounded-2xl border p-2.5 ${ruim ? "border-destructive/50 bg-destructive/5" : ""}`}>
                    <div className="flex gap-3">
                      <FotoBrinde src={sku.foto} alt={sku.nome} className="size-16 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <a href={href(`brinde/${sku.id}`)} onClick={fechar} className="block truncate text-sm font-semibold text-navy hover:underline">{sku.nome}</a>
                        <p className="text-xs text-muted-foreground">
                          {sku.tipo === "propriedade" ? `${brl(sku.custoUnitario ?? 0)} cada` : "Valor a avaliar conforme a quantidade"}
                        </p>
                        {l.personalizacao && (l.personalizacao.texto || l.personalizacao.arte) && (
                          <p className="truncate text-xs text-foreground/70">
                            {[l.personalizacao.texto && `“${l.personalizacao.texto}”`, l.personalizacao.arte && `Arte: ${l.personalizacao.arte}`].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-1">
                          <button type="button" aria-label="Diminuir" disabled={l.quantidade <= 1} onClick={() => loja.definirQuantidade(l.chave, l.quantidade - 1)} className="grid size-7 place-items-center rounded-full border text-navy hover:bg-navy-soft disabled:opacity-40"><Minus className="size-3.5" aria-hidden /></button>
                          <span className="w-9 text-center text-sm font-semibold tabular-nums">{l.quantidade}</span>
                          <button type="button" aria-label="Aumentar" onClick={() => loja.definirQuantidade(l.chave, l.quantidade + 1)} className="grid size-7 place-items-center rounded-full border text-navy hover:bg-navy-soft"><Plus className="size-3.5" aria-hidden /></button>
                          <button type="button" onClick={() => loja.remover(l.chave)} className="ml-auto text-xs font-semibold text-muted-foreground hover:text-navy">Remover</button>
                        </div>
                      </div>
                    </div>
                    {ruim && (
                      <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-destructive">
                        <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
                        {disp > 0 ? `Só há ${disp} disponíveis. Ajuste a quantidade para continuar.` : "Indisponível no momento. Remova a linha para continuar."}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">Total</span>
            {vazio ? (
              <span className="font-display text-xl font-bold text-navy">{brl(0)}</span>
            ) : temPersonalizavel ? (
              <span className="text-right text-sm font-semibold text-navy">Valor a avaliar pelo Marketing</span>
            ) : (
              <span className="font-display text-xl font-bold text-navy">{brl(total)}</span>
            )}
          </div>
          <button
            type="button"
            disabled={vazio || temExcesso || estado === "carregando" || estado === "erro"}
            onClick={() => { fechar(); navegar("revisar"); }}
            className="h-11 w-full rounded-full bg-[var(--accent-strong)] font-display text-base font-bold text-white transition-opacity disabled:opacity-40"
          >
            Revisar pedido
          </button>
          <p className="min-h-[1rem] text-center text-xs text-muted-foreground">{temExcesso ? "Ajuste as linhas sinalizadas para revisar o pedido." : estado === "sucesso" ? "Brinde adicionado ao carrinho." : ""}</p>
        </div>
      </aside>
    </>
  );
}
