/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/admin/AbaIntegracoes.tsx (seção com ícone em navy-soft),
 *   src/components/admin/PromptModularItem.tsx (botões Salvar / Restaurar padrão),
 *   src/components/admin/UserCard.tsx (menu de ações) @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Peças comuns das abas de Configurações, com as classes do admin real:
 * seção `rounded-3xl border bg-card p-6 shadow-card`, ícone em
 * `h-9 w-9 rounded-2xl bg-navy-soft`, Salvar laranja em pílula, Restaurar
 * padrão em contorno, menu de ações em portal (o fix do pacote-10: o menu não
 * é cortado pelos cards vizinhos) e um diálogo simples.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, Save, X } from "lucide-react";
import { cn } from "../../../lib/utils";

export const atraso = (ms: number) => ({ animationDelay: `${ms}ms` });

export const CAMPO =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/70 focus:border-sky focus:ring-2 focus:ring-sky/30";

export const ROTULO = "font-display text-xs font-bold uppercase tracking-wider text-muted-foreground";

/** Seção do admin real: card branco, ícone em navy-soft, título Dosis e descrição curta. */
export function SecaoConfig({
  icone,
  titulo,
  descricao,
  children,
  extra,
  delay = 0,
  className,
}: {
  icone?: ReactNode;
  titulo: string;
  descricao?: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  delay?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn("animate-rise rounded-3xl border border-border bg-card p-6 shadow-card", className)}
      style={atraso(delay)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {icone && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-navy-soft text-primary">{icone}</span>}
          <div className="min-w-0">
            <h2 id={id} className="font-display text-base font-bold text-primary">
              {titulo}
            </h2>
            {descricao && <p className="mt-0.5 max-w-prose text-[13px] leading-relaxed text-muted-foreground">{descricao}</p>}
          </div>
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}

export function BotaoSalvar({
  onClick,
  disabled,
  children = "Salvar",
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float disabled:pointer-events-none disabled:opacity-50"
    >
      <Save aria-hidden className="h-4 w-4" /> {children}
    </button>
  );
}

export function BotaoContorno({
  onClick,
  children,
  icone = <RotateCcw aria-hidden className="h-4 w-4" />,
  disabled,
}: {
  onClick: () => void;
  children: ReactNode;
  icone?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-display text-xs font-bold text-primary transition-colors duration-300 hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-50"
    >
      {icone} {children}
    </button>
  );
}

/** Origem do valor, no texto do real. */
export function Origem({ noBanco, extra }: { noBanco: boolean; extra?: string }) {
  return (
    <span className="text-[12px] text-muted-foreground">
      {noBanco ? "Configurado no banco de dados." : "Usando o padrão do sistema."}
      {extra ? ` ${extra}` : ""}
    </span>
  );
}

export type ItemMenu =
  | { tipo: "titulo"; texto: string }
  | { tipo: "nota"; texto: string }
  | { tipo: "separador" }
  | {
      tipo: "acao";
      texto: string;
      icone?: ReactNode;
      onClick: () => void;
      marcado?: boolean;
      perigo?: boolean;
      /** Motivo quando a regra não deixa (aparece na linha, a ação não roda). */
      bloqueio?: string;
    };

/**
 * Menu de ações (⋯) em portal com posição fixed, como o fix do pacote-10:
 * dentro da grade, um menu absolute era cortado pelos cards vizinhos.
 */
export function MenuAcoes({ rotulo, itens, gatilho }: { rotulo: string; itens: ItemMenu[]; gatilho: ReactNode }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const idMenu = useId();

  useEffect(() => {
    if (!pos) return;
    const fora = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (!menu.current?.contains(alvo) && !botao.current?.contains(alvo)) setPos(null);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPos(null);
        botao.current?.focus();
      }
    };
    const fechar = () => setPos(null);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
    };
  }, [pos]);

  const abrir = () => {
    if (pos) return setPos(null);
    const r = botao.current?.getBoundingClientRect();
    if (!r) return;
    const alto = 320;
    const top = r.bottom + 6 + alto > window.innerHeight ? Math.max(8, r.top - alto - 6) : r.bottom + 6;
    setPos({ top, right: Math.max(8, window.innerWidth - r.right) });
  };

  return (
    <>
      <button
        ref={botao}
        type="button"
        aria-label={rotulo}
        aria-haspopup="menu"
        aria-expanded={pos !== null}
        aria-controls={idMenu}
        onClick={abrir}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors duration-300 hover:bg-accent/15 hover:text-accent"
      >
        {gatilho}
      </button>
      {pos &&
        createPortal(
          <div
            ref={menu}
            id={idMenu}
            role="menu"
            aria-label={rotulo}
            style={{ top: pos.top, right: pos.right }}
            className="animate-rise fixed z-[60] w-64 rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-float)]"
          >
            {itens.map((it, i) => {
              if (it.tipo === "titulo") {
                return (
                  <p key={i} className="px-2.5 pb-1 pt-1.5 font-display text-[11px] font-bold uppercase tracking-wide text-accent">
                    {it.texto}
                  </p>
                );
              }
              if (it.tipo === "nota") {
                return (
                  <p key={i} className="px-2.5 pb-1.5 text-[12px] leading-snug text-muted-foreground">
                    {it.texto}
                  </p>
                );
              }
              if (it.tipo === "separador") return <div key={i} role="separator" className="my-1 h-px bg-border" />;
              return (
                <button
                  key={i}
                  type="button"
                  role={it.marcado !== undefined ? "menuitemradio" : "menuitem"}
                  aria-checked={it.marcado}
                  aria-disabled={Boolean(it.bloqueio)}
                  title={it.bloqueio}
                  onClick={() => {
                    setPos(null);
                    it.onClick();
                  }}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition-colors duration-200 hover:bg-muted",
                    it.perigo ? "text-destructive" : "text-foreground",
                    it.bloqueio && "text-muted-foreground",
                  )}
                >
                  {it.marcado !== undefined ? (
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border-[1.5px]",
                        it.marcado ? "border-primary" : "border-border",
                      )}
                    >
                      {it.marcado && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </span>
                  ) : (
                    it.icone && <span className="mt-0.5 shrink-0">{it.icone}</span>
                  )}
                  <span className="min-w-0">
                    {it.texto}
                    {it.bloqueio && <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{it.bloqueio}</span>}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}

/** Diálogo centrado (mesmo fundo e cantos do NovaTarefaDialog). */
export function Dialogo({
  titulo,
  descricao,
  onFechar,
  children,
  largura = "sm:max-w-md",
}: {
  titulo: string;
  descricao?: ReactNode;
  onFechar: () => void;
  children: ReactNode;
  largura?: string;
}) {
  const id = useId();
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);
  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label="Fechar" onClick={onFechar} className="absolute inset-0 bg-primary/25 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={cn("animate-rise relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-6 shadow-float sm:rounded-3xl", largura)}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={id} className="font-display text-xl font-bold text-primary">
              {titulo}
            </h2>
            {descricao && <div className="mt-1 text-sm text-muted-foreground">{descricao}</div>}
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
