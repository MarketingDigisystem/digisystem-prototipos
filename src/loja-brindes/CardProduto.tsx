// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).

import { Palette, ArrowRight, Factory } from "lucide-react";
import { cn } from "@/lib/utils";
import { FotoProduto } from "./FotoProduto";
import { moeda, unidades } from "./formato";
import { nomeCategoria } from "./mock";
import { disponivelTotal, encomendaMinimaDe, situacaoProduto, temProntaEntrega, usosDoProduto } from "./regras";
import { navegar } from "./rota";
import type { Pedido, Produto } from "./tipos";
import { Selo, SeloSituacao } from "./ui";

const SELO_TXT = { "mais-pedido": "Mais pedido", novidade: "Novidade" } as const;

export function resumoVariacoes(p: Produto) {
  const cores = new Set(p.variacoes.filter((v) => v.cor).map((v) => v.cor!.hex)).size;
  const tamanhos = new Set(p.variacoes.filter((v) => v.tamanho).map((v) => v.tamanho)).size;
  const partes: string[] = [];
  if (cores > 1) partes.push(`${cores} cores`);
  if (tamanhos > 1) partes.push(`${tamanhos} tamanhos`);
  return partes.join(" · ");
}

export function CardProduto({ produto, pedidos, previa, className }: { produto: Produto; pedidos: Pedido[]; previa?: boolean; className?: string }) {
  const sit = situacaoProduto(produto, pedidos);
  const temPronta = temProntaEntrega(produto, pedidos);
  // Sob encomenda: item só-encomenda, ou esgotado para pronta entrega mas que aceita encomenda.
  const sobEncomenda = !!produto.aceitaEncomenda && (produto.somenteEncomenda || !temPronta);
  // Esgotado de verdade: sem pronta entrega e sem encomenda.
  const esgotado = sit === "esgotado" && !sobEncomenda && !temPronta;
  const dessatura = (sit === "esgotado" && !sobEncomenda) || esgotado;
  const usosMes = usosDoProduto(produto, pedidos).filter((u) => u.em.startsWith("2026-10")).length;
  const selo = produto.selos[0];
  const varTxt = resumoVariacoes(produto);
  const disp = disponivelTotal(produto, pedidos);

  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-[transform,box-shadow] duration-200",
        !previa && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="relative">
        <FotoProduto produto={produto} dessaturar={dessatura} corHex={produto.variacoes[0]?.cor?.hex} className="aspect-square sm:aspect-[4/3]" />
        {selo && !esgotado && !sobEncomenda && (
          <Selo tom={selo === "mais-pedido" ? "destaque" : "apoio"} className="absolute left-3 top-3 shadow-sm">
            {SELO_TXT[selo]}
          </Selo>
        )}
        {sobEncomenda && <Selo tom="apoio" className="absolute left-3 top-3 shadow-sm"><Factory className="size-3.5" aria-hidden /> Sob encomenda</Selo>}
        {esgotado && <span className="absolute left-3 top-3"><SeloSituacao situacao="esgotado" /></span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        <span className="font-display text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{nomeCategoria(produto.categoria)}</span>
        <h3 className="line-clamp-2 min-h-[2.5em] font-display text-[15.5px] font-bold leading-tight text-foreground sm:text-[16.5px]">
          {previa ? produto.nome || "Nome do produto" : (
            <button type="button" onClick={() => navegar(`/loja/produto/${produto.slug}`)} className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {produto.nome}
            </button>
          )}
        </h3>
        <p className="font-display text-[19px] font-bold leading-none tabular-nums text-primary sm:text-[21px]">
          {moeda(produto.custoUnitario)} <span className="text-[12.5px] font-semibold text-muted-foreground">/ un.</span>
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {!esgotado && !sobEncomenda && <SeloSituacao situacao={sit} curto />}
          {produto.personalizacao && <Selo tom="apoio" className="hidden sm:inline-flex"><Palette className="size-3.5" aria-hidden /> Personalizável</Selo>}
          {varTxt && <Selo tom="info" className="hidden sm:inline-flex">{varTxt}</Selo>}
        </div>
        <p className="mt-auto pt-1.5 text-[12.5px] text-muted-foreground">
          {esgotado ? "Esgotado no momento."
            : sobEncomenda ? `Sob encomenda · mínimo ${unidades(encomendaMinimaDe(produto))}`
            : usosMes > 0 ? `Usado em ${usosMes} ${usosMes === 1 ? "evento" : "eventos"} este mês`
            : `${disp} disponíveis`}
        </p>
      </div>
      {!previa && (
        <span className="pointer-events-none absolute right-3 top-3 hidden items-center gap-1 rounded-full bg-card px-3 py-1 font-display text-[12px] font-bold text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:inline-flex motion-reduce:transition-none">
          Ver detalhes <ArrowRight className="size-3.5" aria-hidden />
        </span>
      )}
    </article>
  );
}
