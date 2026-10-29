/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/estudio.tsx, src/components/estudio/DirecaoCriativaStep.tsx
 *   (classes de botão, pílula e card) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md (aprovada, D1 a D7).
 *
 * Peças pequenas do "Criar post": classes de botão, pílula, botão de IA e a
 * moldura de cada seção (aberta ou recolhida com resumo e Editar).
 */
import type { ReactNode } from "react";
import { ChevronRight, Lock } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { cn } from "../../../lib/utils";

export const pilulaAcao =
  "inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 font-display text-xs font-bold text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";
export const botaoLaranja =
  "inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";
export const botaoAzul =
  "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-display text-xs font-bold text-primary-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";
/** Ação de texto discreta (Editar, Remover). */
export const acaoLeve =
  "inline-flex items-center gap-1 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50";

export function Pilula({
  ativa,
  onClick,
  children,
  disabled,
  rotuloAria,
}: {
  ativa: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  rotuloAria?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativa}
      aria-label={rotuloAria}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        ativa ? "bg-primary text-primary-foreground shadow-card" : "bg-card text-muted-foreground shadow-card hover:-translate-y-0.5 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

/** Par de pílulas (alternador de duas opções), padrão dos toggles da marca. */
export function ParPilulas<T extends string>({
  opcoes,
  valor,
  onMudar,
  rotulo,
}: {
  opcoes: { id: T; label: string }[];
  valor: T;
  onMudar: (v: T) => void;
  rotulo: string;
}) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="inline-flex rounded-full bg-secondary/70 p-0.5">
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={valor === o.id}
          onClick={() => onMudar(o.id)}
          className={cn(
            "rounded-full px-3 py-1 font-display text-[11px] font-bold transition-all duration-300",
            valor === o.id ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Botão de ação de IA ao lado do campo, sempre com o símbolo IaDigisystem. */
export function BotaoIa({
  onClick,
  children,
  ocupado,
  disabled,
  rotuloAria,
}: {
  onClick: () => void;
  children: ReactNode;
  ocupado?: boolean;
  disabled?: boolean;
  rotuloAria?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || ocupado}
      aria-label={rotuloAria}
      aria-busy={ocupado || undefined}
      className="inline-flex items-center gap-1.5 rounded-full bg-sky-soft px-3 py-1.5 font-display text-[11px] font-bold text-primary transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      <IaDigisystem size={16} estado={ocupado ? "processando" : "vivo"} />
      {ocupado ? "Escrevendo…" : children}
    </button>
  );
}

export type EstadoSecao = "pronta" | "andamento" | "bloqueada";

/**
 * Moldura de uma seção do centro. Aberta mostra o conteúdo; fechada mostra o
 * resumo e "Editar" (pronta), "Abrir" (liberada) ou o motivo do bloqueio.
 */
export function MolduraSecao({
  id,
  titulo,
  estado,
  linha,
  resumo,
  aberta,
  onAbrir,
  somenteLeitura,
  children,
}: {
  id: string;
  titulo: string;
  estado: EstadoSecao;
  /** Status curto ("Falta aprovar a legenda."). */
  linha: string;
  resumo?: ReactNode;
  aberta: boolean;
  onAbrir: () => void;
  somenteLeitura?: boolean;
  children: ReactNode;
}) {
  if (aberta) {
    return (
      <section id={`secao-${id}`} aria-labelledby={`titulo-${id}`} className="glass animate-rise scroll-mt-6 rounded-3xl p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id={`titulo-${id}`} className="font-display text-lg font-bold text-primary">
            {titulo}
          </h2>
          <p className={cn("text-xs", estado === "pronta" ? "font-semibold text-success" : "text-muted-foreground")}>{linha}</p>
        </div>
        {children}
      </section>
    );
  }

  const bloqueada = estado === "bloqueada";
  return (
    <section
      id={`secao-${id}`}
      aria-labelledby={`titulo-${id}`}
      className={cn(
        "animate-rise flex items-center gap-4 rounded-3xl px-5 py-4 transition-all duration-300",
        bloqueada ? "border border-dashed border-border bg-transparent" : "bg-card shadow-card",
      )}
    >
      <div className="min-w-0 flex-1">
        <h2 id={`titulo-${id}`} className={cn("font-display text-sm font-bold", bloqueada ? "text-muted-foreground" : "text-primary")}>
          {titulo}
        </h2>
        {resumo && estado === "pronta" ? (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{resumo}</div>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">{linha}</p>
        )}
      </div>
      {bloqueada ? (
        <Lock aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground/70" />
      ) : (
        !somenteLeitura && (
          <button type="button" onClick={onAbrir} className={pilulaAcao}>
            {estado === "pronta" ? "Editar" : "Abrir"} <ChevronRight aria-hidden className="h-3.5 w-3.5" />
          </button>
        )
      )}
    </section>
  );
}
