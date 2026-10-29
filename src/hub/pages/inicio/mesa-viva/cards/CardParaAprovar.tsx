/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/MinhaMesa.tsx (bloco Para aprovar, main @ 0a6b425) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Para aprovar (só Aprovador e Admin, R-PED-11): o ponto de "Em revisão por"
 * pulsa devagar.
 */
import type { ReactNode } from "react";
import { useHub } from "../../../../store/HubStore";
import { ddmm } from "../../../../store/regras";
import type { Post } from "../../../../store/tipos";
import { hrefDe } from "../../../../router";
import { CardMesa, Resto, Vazio, useListaDensa, type Casca } from "../CardMesa";
import { LinhaLink, Miniatura, haQuanto, primeiroNome, tituloLinha } from "./partes";

export function CardParaAprovar({ casca }: { casca: Casca }) {
  const { sel, hoje } = useHub();
  const posts = sel.mesa().paraAprovar ?? [];
  const lista = useListaDensa(posts, casca.densidade);

  const linha = (p: Post): ReactNode => {
    const autor = primeiroNome(sel.usuarioPorId(p.autorId)?.nome);
    const revisor = p.emRevisaoPor ? primeiroNome(sel.usuarioPorId(p.emRevisaoPor)?.nome) : undefined;
    return (
      <li key={p.id}>
        <LinhaLink href={hrefDe("posts", "aprovar", { post: p.id })}>
          <Miniatura src={p.arteUrl} />
          <span className="min-w-0 flex-1">
            <span className={tituloLinha}>{p.titulo}</span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              De {autor}, enviado {haQuanto(p.atualizadoEm, hoje)}
              {p.dataSugerida && ` · sugere ${ddmm(p.dataSugerida)}`}
            </span>
            {revisor && (
              <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                <span aria-hidden className="parecer-dot h-1.5 w-1.5 rounded-full bg-sky" /> Em revisão por {revisor}
              </span>
            )}
          </span>
        </LinhaLink>
      </li>
    );
  };

  return (
    <CardMesa casca={casca} contador={posts.length} rodape={lista.botao}>
      {posts.length === 0 ? (
        <Vazio>A fila de aprovação está vazia.</Vazio>
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
