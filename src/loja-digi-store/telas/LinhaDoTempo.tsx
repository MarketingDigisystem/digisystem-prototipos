/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: requirements.md Req. 6.2, 7.3, 8.10 + design.md (LinhaDoTempo, etapaDaLinhaDoTempo).
 * Quatro etapas com frase curta. Recusada/Cancelada viram a etapa final de desvio, com o motivo.
 * Sem `estado`, mostra o caminho completo ainda por fazer (tela de revisão).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { Check, X } from "lucide-react";
import { ETAPAS, ROTULO_ESTADO, etapaDaLinhaDoTempo } from "../maquina";
import type { EstadoPedido, EventoPedido } from "../tipos";
import { fmtData } from "./util";

type Status = "feito" | "atual" | "futuro" | "pulado" | "desvio";

interface Props {
  estado?: EstadoPedido;
  eventos?: EventoPedido[];
  motivo?: string;
  /** Força a coluna vertical (painéis estreitos). Por padrão vira linha a partir de md. */
  vertical?: boolean;
}

export function LinhaDoTempo({ estado, eventos = [], motivo, vertical = false }: Props) {
  const alvo = estado ? etapaDaLinhaDoTempo(estado) : null;
  const idxAtual = alvo ? ETAPAS.findIndex((e) => e.etapa === alvo.etapa) : -1;
  const alcancados = new Set(eventos.map((e) => e.para));

  const passos = ETAPAS.map((e, i) => {
    const ultimo = i === ETAPAS.length - 1;
    let status: Status;
    if (ultimo && alvo?.desvio) status = "desvio";
    else if (!alvo) status = "futuro";
    else if (alvo.desvio) status = alcancados.has(e.etapa) ? "feito" : "pulado";
    else if (i < idxAtual) status = "feito";
    else if (i === idxAtual) status = e.etapa === "encerrada" ? "feito" : "atual";
    else status = "futuro";
    const evento = eventos.find((x) => x.para === (ultimo && alvo?.desvio ? estado : e.etapa));
    return {
      chave: e.etapa,
      rotulo: ultimo && alvo?.desvio ? ROTULO_ESTADO[alvo.desvio] : e.rotulo,
      frase: ultimo && alvo?.desvio ? (motivo ? `Motivo: ${motivo}` : "Sem motivo registrado.") : e.frase,
      data: evento ? fmtData(evento.em) : null,
      status,
      ultimo,
    };
  });

  // Classes literais (o Tailwind não enxerga nomes montados por concatenação).
  const cOl = vertical ? "grid gap-0" : "grid gap-0 md:grid-cols-4 md:gap-4";
  const cLi = vertical ? "relative flex gap-3" : "relative flex gap-3 md:flex-col md:gap-2";
  const cMarca = vertical ? "flex flex-col items-center" : "flex flex-col items-center md:w-full md:flex-row";
  const cLinha = vertical ? "mt-1 min-h-6 w-0.5 flex-1" : "mt-1 min-h-6 w-0.5 flex-1 md:ml-2 md:mt-0 md:h-0.5 md:min-h-0 md:w-auto";
  const cTexto = vertical ? "min-w-0 pb-5" : "min-w-0 pb-5 md:pb-0";
  return (
    <ol className={cOl} aria-label="Linha do tempo do pedido">
      {passos.map((p) => (
        <li key={p.chave} className={cLi} aria-current={p.status === "atual" ? "step" : undefined}>
          <div className={cMarca}>
            <Marcador status={p.status} numero={ETAPAS.findIndex((e) => e.etapa === p.chave) + 1} />
            {!p.ultimo && <span aria-hidden className={`${cLinha} ${p.status === "feito" ? "bg-navy" : "bg-border"}`} />}
          </div>
          <div className={cTexto}>
            <p className={`font-display text-base font-bold leading-tight ${p.status === "desvio" ? "text-destructive" : p.status === "futuro" || p.status === "pulado" ? "text-muted-foreground" : "text-navy"}`}>
              {p.rotulo}
              {p.status === "atual" && <span className="ml-2 align-middle text-xs font-semibold text-[var(--accent-strong)]">Agora</span>}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{p.frase}</p>
            {p.data && <p className="mt-0.5 text-xs font-semibold text-foreground/70">{p.data}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Marcador({ status, numero }: { status: Status; numero: number }) {
  const base = "grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold";
  if (status === "feito") return <span className={`${base} bg-navy text-white`}><Check className="size-4" aria-hidden /><span className="sr-only">Concluída</span></span>;
  if (status === "atual") return <span className={`${base} bg-[var(--accent-strong)] text-white shadow-[0_0_0_3px_var(--sky)]`}>{numero}</span>;
  if (status === "desvio") return <span className={`${base} bg-destructive text-white`}><X className="size-4" aria-hidden /><span className="sr-only">Encerrada sem retirada</span></span>;
  return <span className={`${base} bg-secondary text-muted-foreground`}>{numero}</span>;
}
