/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/MinhaMesa.tsx (bloco Pedidos novos, main @ 0a6b425) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Pedidos novos (só Aprovador e Admin, R-PED-11): o ponto "novo" faz um ping
 * único na entrada.
 */
import type { ReactNode } from "react";
import { useHub } from "../../../../store/HubStore";
import type { Card } from "../../../../store/tipos";
import { CATEGORIA_PEDIDO } from "../../../../components/PedidoDialog";
import { hrefDe } from "../../../../router";
import { CardMesa, Resto, Vazio, useListaDensa, type Casca } from "../CardMesa";
import { LinhaLink, haQuanto, tituloLinha } from "./partes";

export function CardPedidosNovos({ casca }: { casca: Casca }) {
  const { sel, hoje } = useHub();
  const cards = sel.mesa().pedidosNovos;
  const lista = useListaDensa(cards, casca.densidade);

  const linha = (c: Card): ReactNode => {
    const pedido = c.pedido as NonNullable<Card["pedido"]>;
    const solicitante = sel.solicitantePorId(pedido.solicitanteId);
    return (
      <li key={c.id}>
        <LinhaLink href={hrefDe("tarefas", "pedidos", { card: c.id })}>
          <span aria-hidden className="relative mt-1.5 flex h-2 w-2 shrink-0">
            <span className="mmv-ping absolute inset-0 rounded-full bg-accent" />
            <span className="relative h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={tituloLinha}>{c.titulo}</span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              {CATEGORIA_PEDIDO[pedido.categoria]} · {solicitante?.area ?? "Área não informada"} · {haQuanto(pedido.recebidoEm, hoje)}
            </span>
          </span>
        </LinhaLink>
      </li>
    );
  };

  return (
    <CardMesa casca={casca} contador={cards.length} rodape={lista.botao}>
      {cards.length === 0 ? (
        <Vazio>Nenhum pedido esperando alguém assumir.</Vazio>
      ) : (
        <>
          <p className="mb-1 text-xs text-muted-foreground">Ninguém assumiu ainda.</p>
          <ul>{lista.primeiros.map(linha)}</ul>
          <Resto aberto={lista.aberto}>
            <ul>{lista.resto.map(linha)}</ul>
          </Resto>
        </>
      )}
    </CardMesa>
  );
}
