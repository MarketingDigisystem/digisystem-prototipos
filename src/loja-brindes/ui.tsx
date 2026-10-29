// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Peças de UI da loja. Contraste: texto sempre escuro sobre fundo suave; laranja só como
// preenchimento com texto escuro; nunca texto branco sobre laranja.

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Ban, Check, ChevronRight, CircleCheck, CircleX, ClipboardList, Factory, Hourglass, Minus, PackageCheck, Plus, Handshake, TriangleAlert, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusPedido } from "./tipos";
import type { Situacao } from "./regras";

/* ---------------- Botão ---------------- */

type Variante = "primary" | "contorno" | "suave" | "perigo" | "fantasma" | "claro";
type TamanhoBotao = "sm" | "md" | "lg";

const VARIANTES: Record<Variante, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  contorno: "border border-primary/35 bg-card text-primary hover:bg-navy-soft",
  suave: "bg-navy-soft text-primary hover:bg-primary/15",
  perigo: "border border-destructive/40 bg-card text-destructive hover:bg-destructive/5",
  fantasma: "text-primary hover:bg-navy-soft",
  claro: "bg-card text-primary hover:bg-sky-soft shadow-sm",
};
const TAMANHOS: Record<TamanhoBotao, string> = {
  sm: "h-9 px-3 text-[13px] rounded-xl",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-5 text-[15px] rounded-2xl",
};

export function Botao({
  variante = "primary", tamanho = "md", className, children, type = "button", ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; tamanho?: TamanhoBotao }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 font-display font-bold tracking-wide transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-45",
        VARIANTES[variante], TAMANHOS[tamanho], className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Selos ---------------- */

type TomSelo = "neutro" | "ok" | "atencao" | "erro" | "info" | "apoio" | "destaque" | "escuro";
const TONS: Record<TomSelo, string> = {
  neutro: "bg-secondary text-foreground",
  ok: "bg-success-soft text-foreground",
  atencao: "bg-warning-soft text-foreground",
  erro: "bg-destructive/10 text-foreground",
  info: "bg-navy-soft text-primary",
  apoio: "bg-sky-soft text-primary",
  destaque: "bg-accent text-foreground",
  escuro: "bg-primary text-primary-foreground",
};

export function Selo({ tom = "neutro", children, className }: { tom?: TomSelo; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 font-display text-[11.5px] font-bold tracking-wide", TONS[tom], className)}>
      {children}
    </span>
  );
}

export function SeloSituacao({ situacao, curto }: { situacao: Situacao; curto?: boolean }) {
  if (situacao === "esgotado") return <Selo tom="erro"><CircleX className="size-3.5 text-destructive" aria-hidden /> Esgotado</Selo>;
  if (situacao === "ultimas") return <Selo tom="atencao"><TriangleAlert className="size-3.5 text-warning" aria-hidden /> {curto ? "Últimas" : "Últimas unidades"}</Selo>;
  return <Selo tom="ok"><CircleCheck className="size-3.5 text-success" aria-hidden /> Disponível</Selo>;
}

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  encomenda_solicitada: "Encomenda solicitada",
  em_alinhamento: "Em alinhamento",
  confirmada: "Confirmada",
  em_producao: "Em produção",
  pronto: "Pronto para retirada",
  encerrado: "Encerrado",
  negado: "Negado",
  cancelado: "Cancelado",
};

export function SeloStatus({ status }: { status: StatusPedido }) {
  const map: Record<StatusPedido, { tom: TomSelo; icone: ReactNode }> = {
    encomenda_solicitada: { tom: "info", icone: <Hourglass className="size-3.5" aria-hidden /> },
    em_alinhamento: { tom: "apoio", icone: <Handshake className="size-3.5 text-primary" aria-hidden /> },
    confirmada: { tom: "info", icone: <ClipboardList className="size-3.5 text-primary" aria-hidden /> },
    em_producao: { tom: "atencao", icone: <Factory className="size-3.5 text-warning" aria-hidden /> },
    pronto: { tom: "atencao", icone: <PackageCheck className="size-3.5 text-primary" aria-hidden /> },
    encerrado: { tom: "ok", icone: <CircleCheck className="size-3.5 text-success" aria-hidden /> },
    negado: { tom: "erro", icone: <CircleX className="size-3.5 text-destructive" aria-hidden /> },
    cancelado: { tom: "neutro", icone: <Ban className="size-3.5 text-muted-foreground" aria-hidden /> },
  };
  const s = map[status];
  return <Selo tom={s.tom}>{s.icone} {ROTULO_STATUS[status]}</Selo>;
}

/* ---------------- Par de pills ---------------- */

export function ParPills<T extends string>({
  opcoes, valor, onChange, rotulo, tamanho = "md", escuro, className,
}: {
  opcoes: { valor: T; rotulo: ReactNode }[];
  valor: T;
  onChange: (v: T) => void;
  rotulo: string;
  tamanho?: "sm" | "md";
  escuro?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={cn("inline-flex max-w-full flex-wrap gap-1 rounded-full p-1", escuro ? "bg-white/12" : "bg-secondary", className)}
    >
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={ativo}
            onClick={() => onChange(o.valor)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full font-display font-bold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
              tamanho === "sm" ? "h-8 px-3 text-[12.5px]" : "h-10 px-4 text-[13.5px]",
              ativo
                ? escuro ? "bg-card text-primary shadow-sm" : "bg-card text-primary shadow-card"
                : escuro ? "text-primary-foreground/85 hover:bg-white/10" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Stepper de quantidade ---------------- */

export function Stepper({
  valor, min = 1, max, onChange, rotulo, compacto,
}: { valor: number; min?: number; max: number; onChange: (n: number) => void; rotulo: string; compacto?: boolean }) {
  const h = compacto ? "size-9" : "size-11";
  const teto = Math.max(max, 0);
  const limitar = (n: number) => Math.max(Math.min(n, teto), Math.min(min, teto));
  return (
    <div className="inline-flex items-center rounded-2xl border border-border bg-card" role="group" aria-label={rotulo}>
      <button type="button" className={cn(h, "grid place-items-center rounded-l-2xl text-primary hover:bg-navy-soft disabled:opacity-35")}
        onClick={() => onChange(limitar(valor - 1))} disabled={valor <= min} aria-label="Diminuir quantidade">
        <Minus className="size-4" />
      </button>
      <input
        type="number" inputMode="numeric" value={valor} min={min} max={max} aria-label={rotulo}
        onChange={(e) => onChange(limitar(Number(e.target.value) || 0))}
        className={cn("w-12 border-x border-border bg-transparent text-center font-display font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none", compacto ? "h-9 text-sm" : "h-11 text-base")}
      />
      <button type="button" className={cn(h, "grid place-items-center rounded-r-2xl text-primary hover:bg-navy-soft disabled:opacity-35")}
        onClick={() => onChange(limitar(valor + 1))} disabled={valor >= max} aria-label="Aumentar quantidade">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/* ---------------- Campo ---------------- */

export function Campo({
  rotulo, ajuda, erro, children, htmlFor, className,
}: { rotulo: string; ajuda?: ReactNode; erro?: string | null; children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="font-display text-[13.5px] font-bold text-foreground">{rotulo}</label>
      {children}
      {erro ? (
        <p className="flex items-start gap-1.5 text-[13px] font-semibold text-destructive" role="alert">
          <CircleX className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {erro}
        </p>
      ) : ajuda ? <p className="text-[12.5px] text-muted-foreground">{ajuda}</p> : null}
    </div>
  );
}

export const classeInput =
  "w-full min-w-0 rounded-xl border border-border bg-card px-3.5 py-2.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring disabled:bg-secondary disabled:text-muted-foreground";

/* ---------------- Gaveta (drawer / painel lateral / bottom sheet) ---------------- */

export function Gaveta({
  aberto, onFechar, titulo, subtitulo, children, rodape, largura = 440, lado = "direita",
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: ReactNode;
  subtitulo?: ReactNode;
  children: ReactNode;
  rodape?: ReactNode;
  largura?: number;
  lado?: "direita" | "baixo";
}) {
  const painel = useRef<HTMLDivElement>(null);
  const fechar = useRef(onFechar);
  fechar.current = onFechar;

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    painel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); fechar.current(); return; }
      if (e.key !== "Tab" || !painel.current) return;
      const focaveis = painel.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])");
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [aberto]);

  if (!aberto) return null;
  const direita = lado === "direita";
  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button" aria-label="Fechar" tabIndex={-1} onClick={onFechar}
        className="absolute inset-0 bg-foreground/45 transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none"
      />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={direita ? { maxWidth: largura } : undefined}
        className={cn(
          "absolute flex flex-col bg-card shadow-[var(--shadow-float)] outline-none transition-transform duration-200 ease-out motion-reduce:transition-none",
          direita ? "inset-y-0 right-0 w-full starting:translate-x-full" : "inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl starting:translate-y-full",
        )}
      >
        <header className="flex items-start gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold leading-tight text-foreground">{titulo}</h2>
            {subtitulo && <div className="mt-0.5 text-[13px] text-muted-foreground">{subtitulo}</div>}
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar painel"
            className="-mr-2 grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="size-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {rodape && <footer className="border-t border-border bg-card px-5 py-4">{rodape}</footer>}
      </div>
    </div>,
    document.body,
  );
}

/** Barra fixa no rodapé (só no mobile). Vai por portal porque a tela tem transform de entrada. */
export function BarraFixaMobile({ children, className = "lg:hidden" }: { children: ReactNode; className?: string }) {
  return createPortal(
    <div className={cn("fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/97 px-4 py-3 shadow-[0_-8px_24px_-12px_oklch(0.435_0.132_268/25%)] backdrop-blur", className)}>
      {children}
    </div>,
    document.body,
  );
}

/* ---------------- Toasts ---------------- */

export function Toasts({ toasts, onFechar }: { toasts: { id: number; texto: string; tom: "ok" | "erro"; acao?: { rotulo: string; onClick: () => void } }[]; onFechar: (id: number) => void }) {
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-3 bottom-24 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-2xl px-4 py-3 text-[13.5px] shadow-[var(--shadow-float)] animate-rise",
            t.tom === "ok" ? "bg-foreground text-primary-foreground" : "border border-destructive/40 bg-card text-foreground",
          )}
        >
          {t.tom === "ok" ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden /> : <CircleX className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />}
          <span className="min-w-0 flex-1">{t.texto}</span>
          {t.acao && (
            <button type="button" onClick={() => { t.acao!.onClick(); onFechar(t.id); }}
              className={cn("shrink-0 font-display font-bold underline underline-offset-2", t.tom === "ok" ? "text-sky" : "text-primary")}>
              {t.acao.rotulo}
            </button>
          )}
          <button type="button" aria-label="Fechar aviso" onClick={() => onFechar(t.id)} className="shrink-0 opacity-70 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Vazio / Esqueleto ---------------- */

export function Vazio({ icone, titulo, texto, children }: { icone: ReactNode; titulo: string; texto: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-navy-soft text-primary">{icone}</div>
      <h2 className="mt-4 font-display text-xl font-bold text-foreground">{titulo}</h2>
      <p className="mt-1 max-w-md text-[14px] text-muted-foreground">{texto}</p>
      {children && <div className="mt-5 w-full">{children}</div>}
    </div>
  );
}

export function CardEsqueleto() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card" aria-hidden>
      <div className="aspect-square animate-pulse bg-secondary motion-reduce:animate-none sm:aspect-[4/3]" />
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-secondary motion-reduce:animate-none" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-secondary motion-reduce:animate-none" />
        <div className="h-5 w-1/2 animate-pulse rounded-full bg-secondary motion-reduce:animate-none" />
      </div>
    </div>
  );
}

/* ---------------- Linha do tempo ---------------- */

export type EstadoPasso = "feito" | "atual" | "pendente" | "erro" | "cancelado";
export interface Passo { rotulo: string; detalhe?: string; estado: EstadoPasso }

function Bolinha({ estado, pequeno }: { estado: EstadoPasso; pequeno?: boolean }) {
  const s = pequeno ? "size-5" : "size-7";
  const i = pequeno ? "size-3" : "size-4";
  if (estado === "feito") return <span className={cn(s, "grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground")}><Check className={i} /></span>;
  if (estado === "atual") return <span className={cn(s, "grid shrink-0 place-items-center rounded-full border-2 border-primary bg-card")}><span className="size-2.5 rounded-full bg-accent" /></span>;
  if (estado === "erro") return <span className={cn(s, "grid shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground")}><X className={i} /></span>;
  if (estado === "cancelado") return <span className={cn(s, "grid shrink-0 place-items-center rounded-full bg-muted-foreground/70 text-primary-foreground")}><Ban className={i} /></span>;
  return <span className={cn(s, "shrink-0 rounded-full border-2 border-border bg-card")} />;
}

export function LinhaDoTempo({ passos, orientacao = "horizontal", compactaNoMobile }: { passos: Passo[]; orientacao?: "horizontal" | "vertical"; compactaNoMobile?: boolean }) {
  if (orientacao === "vertical") {
    return (
      <ol className="relative">
        {passos.map((p, i) => (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {i < passos.length - 1 && <span className={cn("absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5", p.estado === "feito" ? "bg-primary" : "bg-border")} aria-hidden />}
            <Bolinha estado={p.estado} />
            <div className="min-w-0 pt-0.5">
              <p className={cn("font-display text-[15px] font-bold", p.estado === "pendente" ? "text-muted-foreground" : "text-foreground")}>{p.rotulo}</p>
              {p.detalhe && <p className="text-[13px] text-muted-foreground">{p.detalhe}</p>}
            </div>
          </li>
        ))}
      </ol>
    );
  }
  const atual = passos.findIndex((p) => p.estado === "atual" || p.estado === "erro" || p.estado === "cancelado");
  return (
    <div>
      <ol className="flex items-start" aria-label="Andamento do pedido">
        {passos.map((p, i) => (
          <li key={i} className="flex min-w-0 flex-1 flex-col items-center text-center last:flex-none sm:last:flex-1" aria-current={p.estado === "atual" ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", i === 0 ? "invisible" : passos[i].estado === "pendente" ? "bg-border" : "bg-primary")} aria-hidden />
              <Bolinha estado={p.estado} pequeno={compactaNoMobile} />
              <span className={cn("h-0.5 flex-1", i === passos.length - 1 ? "invisible" : passos[i + 1].estado === "pendente" ? "bg-border" : "bg-primary")} aria-hidden />
            </div>
            <span className={cn(
              "mt-1.5 px-1 font-display text-[12.5px] font-bold leading-tight",
              p.estado === "pendente" ? "text-muted-foreground" : "text-foreground",
              compactaNoMobile && i !== atual && "hidden sm:block",
            )}>
              {p.rotulo}
            </span>
            {p.detalhe && <span className={cn("px-1 text-[11.5px] text-muted-foreground", compactaNoMobile && "hidden sm:block")}>{p.detalhe}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- Breadcrumb ---------------- */

export function Breadcrumb({ itens }: { itens: { rotulo: string; onClick?: () => void }[] }) {
  return (
    <nav aria-label="Você está em" className="min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-[13px] text-muted-foreground">
        {itens.map((it, i) => (
          <li key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
            {it.onClick ? (
              <button type="button" onClick={it.onClick} className="truncate font-semibold text-primary hover:underline">{it.rotulo}</button>
            ) : (
              <span className="truncate text-foreground" aria-current="page">{it.rotulo}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ---------------- Avatar / Cartão ---------------- */

export function Avatar({ iniciais, tamanho = 36, escuro }: { iniciais: string; tamanho?: number; escuro?: boolean }) {
  return (
    <span
      style={{ width: tamanho, height: tamanho }}
      className={cn("grid shrink-0 place-items-center rounded-full font-display text-[13px] font-bold", escuro ? "bg-sky text-foreground" : "bg-navy-soft text-primary")}
      aria-hidden
    >
      {iniciais}
    </span>
  );
}

export function Cartao({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl border border-border bg-card p-5 shadow-card", className)}>{children}</section>;
}
