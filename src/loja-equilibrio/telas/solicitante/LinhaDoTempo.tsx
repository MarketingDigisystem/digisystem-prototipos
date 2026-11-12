// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ (acompanhamento do pedido), lido em 2026-11-11; reescrito aqui, sem importar dele.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 4).
//
// Linha do tempo das 4 etapas, com uma frase por etapa. Sem `atual`, todas aparecem como "a seguir" (usada na Revisão).
// Movimento (10.3): ao carregar, os marcadores já alcançados aparecem em sequência curta (70 ms entre um e outro);
// quando o estado muda, cor, fundo e anel das etapas fazem transição (sem mexer no tamanho).

import { Check } from "lucide-react";
import { ROTULO_ESTADO } from "../../formato";
import { estiloEntrada } from "../../movimento";
import type { EstadoPedido, Evento } from "../../tipos";

const ETAPAS: { estado: EstadoPedido; titulo: string; frase: string }[] = [
  { estado: "solicitada", titulo: ROTULO_ESTADO.solicitada, frase: "O Marketing recebe o pedido e reserva os brindes de estoque." },
  { estado: "em_alinhamento", titulo: ROTULO_ESTADO.em_alinhamento, frase: "O Marketing confere detalhes e, se for personalizado, informa o valor." },
  { estado: "pronto", titulo: ROTULO_ESTADO.pronto, frase: "O pedido está separado e esperando você." },
  { estado: "encerrada", titulo: ROTULO_ESTADO.encerrada, frase: "Retirada confirmada e estoque baixado." },
];

/** Posição da última etapa alcançada (0 a 3); -1 se nenhuma. Recusado e cancelado param onde estavam. */
function alcancada(atual: EstadoPedido | undefined, historico: Evento[] | undefined): number {
  if (!atual) return -1;
  const idx = ETAPAS.findIndex((e) => e.estado === atual);
  if (idx >= 0) return idx;
  const anteriores = (historico ?? []).filter((h) => h.estado !== atual).map((h) => ETAPAS.findIndex((e) => e.estado === h.estado));
  return Math.max(0, ...anteriores);
}

export function LinhaDoTempo({ atual, historico }: { atual?: EstadoPedido; historico?: Evento[] }) {
  const ate = alcancada(atual, historico);
  const interrompido = atual === "recusada" || atual === "cancelada";
  return (
    <ol className="grid gap-3 sm:grid-cols-4" aria-label="Etapas do pedido">
      {ETAPAS.map((e, i) => {
        const feita = i < ate || (i === ate && atual === "encerrada");
        const corrente = i === ate && !feita && !interrompido;
        return (
          <li
            key={e.estado}
            aria-current={corrente ? "step" : undefined}
            className={`le-etapa rounded-2xl border p-3 ${corrente ? "bg-navy-soft shadow-[0_0_0_2px_var(--sky)]" : "bg-card"} ${
              interrompido && i > ate ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                style={i <= ate ? estiloEntrada(i, 70, 4) : undefined}
                className={`le-marcador ${i <= ate ? "le-marcador-entra" : ""} grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  feita ? "bg-navy text-navy-foreground" : corrente ? "bg-accent text-[color:var(--on-accent)]" : "bg-secondary text-foreground/70"
                }`}
              >
                {feita ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="font-display text-sm font-bold text-navy">{e.titulo}</span>
            </div>
            <p className="mt-2 text-xs text-foreground/80">{e.frase}</p>
          </li>
        );
      })}
    </ol>
  );
}
