/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/MinhaMesa.tsx (bloco Para ajustar, main @ 0a6b425) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Para ajustar: posts meus reprovados. A barra vermelha cresce de cima na
 * entrada; no hover o item sobe 2px.
 */
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { useHub } from "../../../../store/HubStore";
import type { Post } from "../../../../store/tipos";
import { EstadoPost } from "../../../../components/EstadoPost";
import { hrefDe } from "../../../../router";
import { CardMesa, Resto, Vazio, useListaDensa, type Casca } from "../CardMesa";
import { Miniatura } from "./partes";

export function CardParaAjustar({ casca }: { casca: Casca }) {
  const { sel } = useHub();
  const posts = sel.mesa().paraAjustar;
  const lista = useListaDensa(posts, casca.densidade, 2);
  const linha = (p: Post): ReactNode => <ItemAjustar key={p.id} p={p} />;

  return (
    <CardMesa casca={casca} contador={posts.length} rodape={lista.botao}>
      {posts.length === 0 ? (
        <Vazio>Nenhum post seu foi reprovado.</Vazio>
      ) : (
        <>
          <ul className="space-y-2.5">{lista.primeiros.map(linha)}</ul>
          <Resto aberto={lista.aberto}>
            <ul className="space-y-2.5 pt-2.5">{lista.resto.map(linha)}</ul>
          </Resto>
        </>
      )}
    </CardMesa>
  );
}

function ItemAjustar({ p }: { p: Post }) {
  const { sel } = useHub();
  const item = p.itemId ? sel.itemPorId(p.itemId) : undefined;
  return (
    <li>
      <a
        href={hrefDe("posts", "meus", { post: p.id })}
        className="group/l relative flex gap-3 overflow-hidden rounded-2xl bg-secondary/50 p-3 pl-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden className="mmv-barra-cresce absolute inset-y-0 left-0 w-1 bg-destructive" />
        <Miniatura src={p.arteUrl} className="h-14 w-14" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <EstadoPost estado={sel.estadoPost(p)} />
            {item && <span className="truncate text-[11px] text-muted-foreground">No card {item.card.titulo}</span>}
          </span>
          <span className="mt-1 block font-display text-sm font-bold leading-snug text-primary transition-colors duration-200 group-hover/l:text-accent">
            {p.titulo}
          </span>
          {p.motivoReprovacao && (
            <span className="mt-0.5 line-clamp-2 block text-[13px] leading-relaxed text-foreground/80">
              <span className="font-semibold text-destructive">Motivo: </span>
              {p.motivoReprovacao}
            </span>
          )}
          <span className="mmv-texto-laranja mt-1.5 inline-flex items-center gap-1 font-display text-xs font-bold">
            Ajustar e reenviar <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </span>
        </span>
      </a>
    </li>
  );
}
