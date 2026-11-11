/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (área de gestão da Equipe_da_Loja) + tokens do Lovable src/styles.css @ leitura 2026-11-11.
 * Peças compartilhadas da gestão: selo de estado, botão com loader sutil, modal, estados de tela.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ROTULO_ESTADO } from "../../maquina";
import type { EstadoPedido, EstadoSugestao } from "../../tipos";
import type { EstadoTela } from "../../rota";

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

const COR_ESTADO: Record<EstadoPedido, string> = {
  solicitada: "bg-[var(--warning-soft,oklch(0.95_0.05_85))] text-[var(--warning-strong)]",
  em_alinhamento: "bg-navy-soft text-navy",
  pronto_para_retirada: "bg-[oklch(0.95_0.05_155)] text-[var(--success-strong)]",
  encerrada: "bg-secondary text-muted-foreground",
  recusada: "bg-[oklch(0.95_0.04_25)] text-[oklch(0.5_0.18_25)]",
  cancelada: "bg-[oklch(0.95_0.04_25)] text-[oklch(0.5_0.18_25)]",
};

export function SeloEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={`inline-flex h-7 items-center whitespace-nowrap rounded-full px-3 text-xs font-bold ${COR_ESTADO[estado]}`}>{ROTULO_ESTADO[estado]}</span>;
}

export const ROTULO_SUGESTAO: Record<EstadoSugestao, string> = { sugerida: "Sugerida", em_analise: "Em análise", aprovada: "Aprovada", recusada: "Recusada" };

/** Botão de ação com loader sutil: o rótulo e a largura não mudam enquanto roda. */
export function BotaoAcao({
  rotulo, onClick, variante = "primario", desabilitado, dica,
}: {
  rotulo: string;
  onClick: () => void;
  variante?: "primario" | "secundario" | "perigo";
  desabilitado?: boolean;
  dica?: string;
}) {
  const [rodando, setRodando] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  const cor =
    variante === "primario" ? "bg-navy text-white hover:bg-navy/90"
    : variante === "perigo" ? "border border-[oklch(0.5_0.18_25)]/40 text-[oklch(0.5_0.18_25)] hover:bg-[oklch(0.95_0.04_25)]"
    : "bg-navy-soft text-navy hover:bg-navy-soft/70";
  return (
    <button
      type="button"
      disabled={desabilitado || rodando}
      title={dica}
      aria-busy={rodando}
      onClick={() => {
        setRodando(true);
        t.current = window.setTimeout(() => { setRodando(false); onClick(); }, 420);
      }}
      className={`relative inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full px-5 font-display text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky disabled:cursor-not-allowed disabled:opacity-50 ${cor}`}
    >
      <span className={rodando ? "opacity-0" : ""}>{rotulo}</span>
      {rodando && <Loader2 className="absolute size-4 animate-spin motion-reduce:animate-none" aria-hidden />}
    </button>
  );
}

export function Modal({ titulo, onFechar, children }: { titulo: string; onFechar: () => void; children: ReactNode }) {
  const id = useId();
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", f);
    return () => document.removeEventListener("keydown", f);
  }, [onFechar]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div role="dialog" aria-modal="true" aria-labelledby={id} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-6 shadow-[var(--shadow-float)]">
        <div className="flex items-start justify-between gap-3">
          <h2 id={id} className="text-xl font-bold text-navy">{titulo}</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="grid size-9 shrink-0 place-items-center rounded-full text-navy hover:bg-navy-soft">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export const CAMPO = "w-full rounded-2xl border bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky";

export function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-navy">{rotulo}</span>
      {children}
    </label>
  );
}

export function Erro({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return <p role="alert" className="mt-3 flex items-start gap-2 rounded-2xl bg-[oklch(0.95_0.04_25)] px-3 py-2 text-sm font-semibold text-[oklch(0.5_0.18_25)]"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />{texto}</p>;
}

/** Cobre os estados da tela pedidos em ?estado=. Retorna null quando a tela deve renderizar normalmente. */
export function EstadosDaTela({ estado, vazio }: { estado: EstadoTela; vazio: string }) {
  if (estado === "carregando") {
    return (
      <div className="mt-6 space-y-3" aria-busy="true" aria-label="Carregando">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-secondary motion-reduce:animate-none" />)}
      </div>
    );
  }
  if (estado === "vazio") return <div className="mt-6 rounded-3xl bg-card p-10 text-center text-muted-foreground shadow-[var(--shadow-card)]">{vazio}</div>;
  if (estado === "erro") {
    return (
      <div role="alert" className="mt-6 rounded-3xl bg-card p-10 text-center shadow-[var(--shadow-card)]">
        <p className="font-display text-lg font-bold text-navy">Não foi possível carregar</p>
        <p className="mt-1 text-sm text-muted-foreground">Tente de novo em instantes. Seus dados não foram alterados.</p>
      </div>
    );
  }
  return null;
}
