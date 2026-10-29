// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Gaveta "Meu pedido" (carrinho de pronta entrega) + lista editável reaproveitada na etapa 1
// do checkout. A encomenda tem fluxo próprio na página do produto, fora do carrinho.

import { Palette, ShoppingBag, Trash2, TriangleAlert } from "lucide-react";
import { FotoProduto } from "../FotoProduto";
import { useLoja } from "../estado";
import { moeda } from "../formato";
import { areaDoCentro, usuario } from "../mock";
import { popularidade, validarItem } from "../regras";
import { navegar } from "../rota";
import type { CentroCustoId, ItemCarrinho } from "../tipos";
import { Botao, Gaveta, Stepper } from "../ui";

export function totalCarrinho(itens: ItemCarrinho[], custo: (id: string) => number) {
  return itens.reduce((s, i) => s + i.qtd * custo(i.produtoId), 0);
}

export function useResumoCarrinho() {
  const { carrinho, estado } = useLoja();
  const custo = (id: string) => estado.produtos.find((p) => p.id === id)?.custoUnitario ?? 0;
  const problemas = carrinho.map((i) => {
    const p = estado.produtos.find((x) => x.id === i.produtoId)!;
    const v = p.variacoes.find((x) => x.id === i.variacaoId)!;
    const outras = carrinho.filter((o) => o.chave !== i.chave && o.produtoId === i.produtoId && o.variacaoId === i.variacaoId).reduce((s, o) => s + o.qtd, 0);
    return { chave: i.chave, val: validarItem(p, v, i.qtd, !!i.personalizacao, estado.pedidos, outras) };
  });
  return { total: totalCarrinho(carrinho, custo), problemas, ok: problemas.every((x) => x.val.ok) };
}

export function ListaItens({ compacta }: { compacta?: boolean }) {
  const { carrinho, estado, alterarQtd, remover } = useLoja();
  const { problemas } = useResumoCarrinho();
  return (
    <ul className="divide-y divide-border">
      {carrinho.map((i) => {
        const p = estado.produtos.find((x) => x.id === i.produtoId)!;
        const v = p.variacoes.find((x) => x.id === i.variacaoId)!;
        const val = problemas.find((x) => x.chave === i.chave)!.val;
        return (
          <li key={i.chave} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <button type="button" onClick={() => navegar(`/loja/produto/${p.slug}`, { v: v.id })} className="shrink-0" aria-label={`Abrir ${p.nome}`}>
              <FotoProduto produto={p} corHex={v.cor?.hex} tamanho="mini" className={compacta ? "size-16 rounded-2xl" : "size-20 rounded-2xl sm:size-24"} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-[15.5px] font-bold leading-tight">{p.nome}</p>
                  <p className="text-[13px] text-muted-foreground">
                    {v.rotulo !== "Único" && <>{v.rotulo} · </>}{moeda(p.custoUnitario)} / un.
                  </p>
                </div>
                <p className="shrink-0 font-display text-[16px] font-bold tabular-nums">{moeda(i.qtd * p.custoUnitario)}</p>
              </div>
              {i.personalizacao && (
                <p className="mt-1.5 flex items-start gap-1.5 rounded-xl bg-sky-soft px-2.5 py-1.5 text-[12.5px] text-foreground">
                  <Palette className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0"><b className="font-display">Personalizado:</b> {i.personalizacao.texto}{i.personalizacao.arteNome && ` · ${i.personalizacao.arteNome}`}</span>
                </p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <Stepper compacto valor={i.qtd} min={val.minimo} max={val.maximo} onChange={(n) => alterarQtd(i.chave, n)} rotulo={`Quantidade de ${p.nome}`} />
                <button type="button" onClick={() => remover(i.chave)} className="flex h-9 items-center gap-1.5 rounded-xl px-2 font-display text-[13px] font-bold text-muted-foreground hover:bg-secondary hover:text-destructive">
                  <Trash2 className="size-4" aria-hidden /> Remover
                </button>
              </div>
              {!val.ok && (
                <p className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-semibold text-destructive" role="alert">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {val.erros[0]}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CarrinhoGaveta({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { carrinho, estado, diretorId } = useLoja();
  const { total, ok } = useResumoCarrinho();
  const eu = usuario(diretorId);
  const n = carrinho.length;
  const sugestoes = [...estado.produtos].sort((a, b) => popularidade(b, estado.pedidos) - popularidade(a, estado.pedidos)).slice(0, 3);

  return (
    <Gaveta
      aberto={aberto} onFechar={onFechar} titulo="Meu pedido"
      subtitulo={n ? `${n} ${n === 1 ? "item" : "itens"} · ainda não enviado` : "Nada escolhido ainda"}
      rodape={n ? (
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] text-muted-foreground">Total estimado</span>
            <span className="font-display text-[24px] font-bold tabular-nums">{moeda(total)}</span>
          </div>
          <p className="mb-3 text-[12.5px] text-muted-foreground">Debita {eu.centroCustoId} {areaDoCentro(eu.centroCustoId as CentroCustoId)} só na retirada.</p>
          <Botao tamanho="lg" className="w-full" disabled={!ok} onClick={() => navegar("/loja/checkout/itens")}>Continuar para a solicitação</Botao>
          <Botao variante="fantasma" className="mt-1.5 w-full" onClick={onFechar}>Continuar escolhendo</Botao>
        </div>
      ) : undefined}
    >
      {n ? <ListaItens compacta /> : (
        <div className="py-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-navy-soft text-primary"><ShoppingBag className="size-7" aria-hidden /></span>
          <p className="mt-3 font-display text-[18px] font-bold">Seu pedido está vazio</p>
          <p className="mt-1 text-[14px] text-muted-foreground">Os mais pedidos do mês podem ajudar a começar.</p>
          <ul className="mt-5 space-y-2 text-left">
            {sugestoes.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => navegar(`/loja/produto/${p.slug}`)} className="flex w-full items-center gap-3 rounded-2xl border border-border p-2.5 hover:bg-secondary">
                  <FotoProduto produto={p} tamanho="mini" className="size-14 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[15px] font-bold">{p.nome}</span>
                    <span className="text-[13px] text-muted-foreground">{moeda(p.custoUnitario)} / un.</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Gaveta>
  );
}
