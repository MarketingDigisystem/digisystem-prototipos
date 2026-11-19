// PROTÓTIPO DESCARTÁVEL — peças visuais compartilhadas do redesign da Loja no Hub.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, ImageOff } from "lucide-react";
import { COR_ESTADO, ROTULO_ESTADO, type Estado } from "./regras";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Badge({ estado, className }: { estado: Estado; className?: string }) {
  return (
    <span className={cx("inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold", COR_ESTADO[estado].badge, className)}>
      {ROTULO_ESTADO[estado]}
    </span>
  );
}

export function Shimmer({ className }: { className?: string }) {
  return <div aria-hidden className={cx("hl-shimmer", className)} />;
}

/** Número que "pula" de leve quando muda (a chave reinicia a animação). */
export function Numero({ valor, className }: { valor: number | string; className?: string }) {
  return (
    <span key={String(valor)} className={cx("hl-pop tabular-nums", className)}>
      {valor}
    </span>
  );
}

/** Simula o carregamento: devolve true por `ms` sempre que `chave` muda. */
export function useCarregando(chave: unknown, ms = 550): boolean {
  const [c, setC] = useState(true);
  useEffect(() => {
    setC(true);
    const t = setTimeout(() => setC(false), ms);
    return () => clearTimeout(t);
  }, [chave, ms]);
  return c;
}

/** Foto do brinde em fundo branco (as fotos reais são de estúdio); sem foto, fundo da marca com ícone. */
export function FotoBrinde({ src, alt, className, apagada, pad = "p-3" }: { src: string | null; alt: string; className?: string; apagada?: boolean; pad?: string }) {
  const [ok, setOk] = useState(false);
  if (!src) {
    return (
      <div className={cx("flex items-center justify-center bg-gradient-to-br from-navy-soft to-sky-soft text-primary/60", className)}>
        <ImageOff className="h-8 w-8" aria-hidden />
      </div>
    );
  }
  return (
    <div className={cx("relative overflow-hidden bg-white", className)}>
      {!ok && <div className="hl-shimmer absolute inset-0 rounded-none" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setOk(true)}
        className={cx("hl-fade h-full w-full object-contain", pad, ok ? (apagada ? "opacity-50" : "opacity-100") : "opacity-0")}
      />
    </div>
  );
}

/* ----------------------------- Toast ----------------------------- */
interface ToastItem { id: number; texto: string; acao?: { rotulo: string; fazer: () => void } }
const ToastCtx = createContext<(t: Omit<ToastItem, "id">) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const mostrar = useCallback((t: Omit<ToastItem, "id">) => {
    const id = ++seq.current;
    setItens((a) => [...a.slice(-2), { ...t, id }]);
    setTimeout(() => setItens((a) => a.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={mostrar}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(92vw,380px)] flex-col gap-2">
        {itens.map((t) => (
          <div key={t.id} className="hl-toast pointer-events-auto flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-foreground shadow-[var(--shadow-float)]">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
            <p className="min-w-0 flex-1">{t.texto}</p>
            {t.acao ? (
              <button type="button" onClick={t.acao.fazer} className="shrink-0 font-semibold text-primary underline-offset-4 hover:underline">
                {t.acao.rotulo}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function Segmentado<T extends string>({ opcoes, valor, aoMudar, rotulo }: { opcoes: { id: T; rotulo: ReactNode }[]; valor: T | null; aoMudar: (v: T) => void; rotulo: string }) {
  return (
    <div role="group" aria-label={rotulo} className="inline-flex flex-wrap gap-1 rounded-full bg-muted p-1">
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={valor === o.id}
          onClick={() => aoMudar(o.id)}
          className={cx(
            "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
            valor === o.id ? "bg-card text-primary shadow-[var(--shadow-card)]" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}

export const BOTAO_PRIMARIO = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50";
export const BOTAO_SECUNDARIO = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-primary transition hover:bg-muted active:scale-[0.98]";
export const BOTAO_DESTRUTIVO = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-destructive/60 bg-card px-4 text-sm font-semibold text-[#b42318] transition hover:bg-[#fde8e6] active:scale-[0.98]";
export const CARTAO = "rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]";
export const ROTULO_PEQUENO = "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";