/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Meus posts recentes (opcional novo): os últimos posts que a pessoa mexeu e
 * em que pé estão. A miniatura aparece com fade ao carregar.
 */
import type { ReactNode } from "react";
import { useHub } from "../../../../store/HubStore";
import type { Post } from "../../../../store/tipos";
import { EstadoPost } from "../../../../components/EstadoPost";
import { hrefDe } from "../../../../router";
import { CardMesa, Resto, Vazio, useListaDensa, type Casca } from "../CardMesa";
import { LinhaLink, Miniatura, haQuanto, tituloLinha } from "./partes";

export function CardPostsRecentes({ casca }: { casca: Casca }) {
  const { sel, dados, hoje, usuario } = useHub();
  const posts = dados.posts.filter((p) => p.autorId === usuario.id).sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  const lista = useListaDensa(posts, casca.densidade);

  const linha = (p: Post): ReactNode => (
    <li key={p.id}>
      <LinhaLink href={hrefDe("posts", "meus", { post: p.id })}>
        <Miniatura src={p.arteUrl} />
        <span className="min-w-0 flex-1">
          <span className={tituloLinha}>{p.titulo}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <EstadoPost estado={sel.estadoPost(p)} />
            <span className="text-[11px] text-muted-foreground">atualizado {haQuanto(p.atualizadoEm, hoje)}</span>
          </span>
        </span>
      </LinhaLink>
    </li>
  );

  return (
    <CardMesa casca={casca} contador={posts.length} rodape={lista.botao}>
      {posts.length === 0 ? (
        <Vazio>
          Você ainda não criou posts.{" "}
          <a href={hrefDe("posts", "criar")} className="font-display text-xs font-bold text-primary hover:text-accent">
            Criar post
          </a>
        </Vazio>
      ) : (
        <>
          <ul>{lista.primeiros.map(linha)}</ul>
          <Resto aberto={lista.aberto}>
            <ul>{lista.resto.map(linha)}</ul>
          </Resto>
        </>
      )}
    </CardMesa>
  );
}
