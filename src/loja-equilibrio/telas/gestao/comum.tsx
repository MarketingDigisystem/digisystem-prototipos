// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ (gestão do DigiPlace) e telas/solicitante/Vitrine.tsx (padrão de classes), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (tarefa 5.1).
//
// Peças compartilhadas das telas de gestão: classes, formatadores, selos de estado/urgência, diálogo centralizado e erro junto à ação.

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { ROTULO_ESTADO } from "../../formato";
import type { EstadoPedido, Urgencia } from "../../tipos";
import { Msg, useArmadilhaFoco } from "../../ui";

export const PILL =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-transparent px-4 font-display text-sm font-bold whitespace-nowrap le-cor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";
export const PILL_ATIVO = "bg-navy-soft text-[color:var(--le-ativo)] shadow-[0_0_0_2px_var(--sky)]";
export const PILL_INATIVO = "text-foreground/80 hover:bg-navy-soft hover:text-navy";
export const CAMPO =
  "h-11 w-full rounded-xl border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:opacity-60";
export const BTN_PRIMARIO =
  "inline-flex h-11 items-center justify-center rounded-full bg-navy px-5 font-display text-sm font-bold text-navy-foreground le-btn hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:opacity-50";
export const BTN_LARANJA =
  "inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 font-display text-sm font-bold text-[color:var(--on-accent)] le-btn hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:opacity-50";
export const BTN_SECUNDARIO =
  "inline-flex h-11 items-center justify-center rounded-full border bg-card px-5 font-display text-sm font-bold text-navy le-btn hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:opacity-50";

/** Reexporta o mapa único de formato.ts; não redefinir aqui. */
export { ROTULO_ESTADO };

const COR_ESTADO: Record<EstadoPedido, string> = {
  solicitada: "bg-sky-soft text-navy ring-1 ring-sky",
  em_alinhamento: "bg-warning-soft text-foreground ring-1 ring-warning",
  pronto: "bg-success-soft text-foreground ring-1 ring-success",
  encerrada: "bg-secondary text-muted-foreground",
  recusada: "bg-secondary text-[color:var(--destructive-strong)] ring-1 ring-destructive/40",
  cancelada: "bg-secondary text-muted-foreground",
};

const SELO = "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 font-display text-xs font-bold whitespace-nowrap";

export function SeloEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={`${SELO} ${COR_ESTADO[estado]}`}>{ROTULO_ESTADO[estado]}</span>;
}

/** Selo de aviso da gestão. Largura fixa: aparecer ou sumir não move o resto da linha. Texto escuro sobre o amarelo da marca. */
export function SeloAcimaDoEstoque() {
  return <span className={`${SELO} w-[7.75rem] justify-center bg-warning text-[color:var(--on-accent)]`}>Acima do estoque</span>;
}

/** Chip dos pedidos que já podem receber reserva depois de uma entrada. */
export function SeloPodeReservar() {
  return <span className={`${SELO} w-[6.5rem] justify-center bg-sky-soft text-navy ring-1 ring-sky`}>Pode reservar</span>;
}

/** Selo de urgência pela data desejada. Só vale para pedido em andamento; o resto mostra a data em texto simples. */
export function SeloUrgencia({ urgencia, data, ativo }: { urgencia: Urgencia; data?: string; ativo: boolean }) {
  const dd = data ? formatarDia(data) : "";
  if (!ativo || urgencia === "sem_data") {
    return <span className="text-xs text-muted-foreground">{data ? `Para ${dd}` : "Sem data desejada"}</span>;
  }
  const mapa: Record<Exclude<Urgencia, "sem_data">, { texto: string; cls: string }> = {
    atrasada: { texto: `Atrasado · ${dd}`, cls: "bg-destructive text-destructive-foreground" },
    urgente: { texto: `Urgente · ${dd}`, cls: "bg-accent text-[color:var(--on-accent)]" },
    proxima: { texto: `Próxima · ${dd}`, cls: "bg-warning-soft text-foreground ring-1 ring-warning" },
    normal: { texto: `Para ${dd}`, cls: "bg-secondary text-muted-foreground" },
  };
  const m = mapa[urgencia];
  return <span className={`${SELO} ${m.cls}`}>{m.texto}</span>;
}

export function formatarDia(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function formatarInstante(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)} às ${iso.slice(11, 16) || "00:00"}`;
}

export function brl(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Faixa de altura reservada para a mensagem de erro: aparecer ou sumir não desloca os controles. */
export function ErroInline({ texto, className = "" }: { texto: string | null; className?: string }) {
  return (
    <p role="alert" aria-live="polite" className={`min-h-5 text-xs font-semibold text-[color:var(--destructive-strong)] ${className}`}>
      <Msg texto={texto} />
    </p>
  );
}

export function Campo({ rotulo, children, dica }: { rotulo: string; children: ReactNode; dica?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-foreground/80">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-xs text-muted-foreground">{dica}</span>}
    </label>
  );
}

/**
 * Diálogo centralizado e fixo: abre sobre a tela e não empurra nada. Esc e o botão fecham.
 * Animação (10.3): o fundo escurecido faz fade; no desktop o painel entra com scale .96 → 1 + fade, abaixo de sm sobe de baixo.
 * Na saída (~140 ms) quem usa deve fechar por `useSaidaAnimada`: passa `fechar` em `onFechar` e `saindo` aqui, e só desmonta depois da saída.
 */
export function Dialogo({
  titulo,
  aberto,
  onFechar,
  saindo = false,
  largo = false,
  children,
  rodape,
}: {
  titulo: string;
  aberto: boolean;
  onFechar: () => void;
  /** true durante a animação de saída (vem de useSaidaAnimada). */
  saindo?: boolean;
  largo?: boolean;
  children: ReactNode;
  rodape?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Foco preso no diálogo, rolagem do fundo travada e foco devolvido ao gatilho ao fechar (A-13).
  useArmadilhaFoco(aberto, ref, "container");
  useEffect(() => {
    if (!aberto) return;
    const f = (ev: KeyboardEvent) => ev.key === "Escape" && onFechar();
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div className="le-dlg fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" data-estado={saindo ? "saindo" : "aberto"}>
      <button type="button" aria-label="Fechar" onClick={onFechar} className="le-dlg-fundo absolute inset-0 bg-foreground/40" tabIndex={-1} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`le-dlg-painel relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-card shadow-card focus-visible:outline-none sm:rounded-3xl ${largo ? "sm:max-w-2xl" : "sm:max-w-md"}`}
      >
        <header className="flex items-center justify-between gap-3 border-b px-5 py-3">
          <h2 className="font-display text-xl font-bold text-navy">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="le-btn grid size-11 place-items-center rounded-full text-foreground/70 hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {rodape && <footer className="border-t px-5 py-3">{rodape}</footer>}
      </div>
    </div>
  );
}

/** Contador com largura reservada, para a pill não mudar de tamanho quando o número muda. */
export function Contador({ n }: { n: number }) {
  return <span className="inline-block min-w-[2ch] text-center text-xs tabular-nums text-muted-foreground">{n}</span>;
}
