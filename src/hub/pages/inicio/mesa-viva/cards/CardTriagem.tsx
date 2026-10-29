/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/MinhaMesa.tsx (bloco Na minha triagem, main @ 0a6b425) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Na minha triagem (só Aprovador e Admin, R-PED-11). É o único ponto de peso
 * da IA nesta tela: o Parecer da IA leva o símbolo animado da Digisystem, e a
 * barra de prontidão enche na entrada.
 */
import type { ReactNode } from "react";
import { IaDigisystem } from "../../../../../IaDigisystem";
import { cn } from "../../../../../lib/utils";
import { useHub } from "../../../../store/HubStore";
import type { Card } from "../../../../store/tipos";
import { CATEGORIA_PEDIDO } from "../../../../components/PedidoDialog";
import { hrefDe } from "../../../../router";
import { CardMesa, Resto, Vazio, useListaDensa, type Casca } from "../CardMesa";
import { LinhaLink, haQuanto, tituloLinha } from "./partes";

const COR_NIVEL = { verde: "bg-success", ambar: "bg-warning", vermelho: "bg-destructive" } as const;

export function CardTriagem({ casca }: { casca: Casca }) {
  const { sel, hoje } = useHub();
  const cards = sel.mesa().naMinhaTriagem;
  const lista = useListaDensa(cards, casca.densidade);

  const linha = (c: Card): ReactNode => {
    const pedido = c.pedido as NonNullable<Card["pedido"]>;
    const solicitante = sel.solicitantePorId(pedido.solicitanteId);
    const parecer = pedido.parecer;
    return (
      <li key={c.id}>
        <LinhaLink href={hrefDe("tarefas", "pedidos", { card: c.id })}>
          <span className="min-w-0 flex-1">
            <span className={tituloLinha}>{c.titulo}</span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              {CATEGORIA_PEDIDO[pedido.categoria]} · {solicitante?.area ?? "Área não informada"} · {haQuanto(pedido.recebidoEm, hoje)}
            </span>
            <span className="mt-2 flex items-center gap-2">
              <IaDigisystem size={18} estado="vivo" />
              <span className="font-display text-[11px] font-bold text-primary">Parecer da IA</span>
              <span
                role="progressbar"
                aria-label="Prontidão do pedido"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={parecer.prontidao}
                className="h-1.5 min-w-12 flex-1 overflow-hidden rounded-full bg-secondary"
              >
                <span
                  className={cn("mmv-enche block h-full rounded-full", COR_NIVEL[parecer.nivel])}
                  style={{ width: `${parecer.prontidao}%` }}
                />
              </span>
              <span className="font-display text-[11px] font-bold tabular-nums text-foreground">{parecer.prontidao}%</span>
            </span>
            <span className="mt-1 line-clamp-1 block text-[11px] text-muted-foreground">{parecer.titulo}</span>
          </span>
        </LinhaLink>
      </li>
    );
  };

  return (
    <CardMesa casca={casca} contador={cards.length} rodape={lista.botao}>
      {cards.length === 0 ? (
        <Vazio>Você não assumiu nenhum pedido.</Vazio>
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
