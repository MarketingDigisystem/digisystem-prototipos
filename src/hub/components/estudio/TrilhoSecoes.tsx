/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/estudio.tsx (STEPS, stepper 1·2·3 e as condições de cada etapa)
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 1 (trilho sem números).
 *
 * Trilho à esquerda: as quatro seções sem números, cada uma com o estado e
 * "o que falta" em texto real. Embaixo, o salvamento automático do post.
 * Substitui o stepper 1·2·3 (linha 7) e o botão de avanço com motivo (linha 29).
 */
import { Check, CloudOff, Lock } from "lucide-react";
import { cn } from "../../../lib/utils";
import { EstadoPost } from "../EstadoPost";
import type { EstadoPostExibido } from "../../store/regras";
import type { SecaoId } from "./editor";
import type { EstadoSecao } from "./partes";

export type ItemTrilho = { id: SecaoId; titulo: string; estado: EstadoSecao; linha: string };

export function TrilhoSecoes({
  itens,
  ativa,
  onIr,
  salvo,
  estadoPost,
}: {
  itens: ItemTrilho[];
  ativa: SecaoId;
  onIr: (id: SecaoId) => void;
  /** "Salvo há 2 min", ou null quando o post ainda não existe. */
  salvo: string | null;
  estadoPost?: EstadoPostExibido;
}) {
  return (
    <nav aria-label="Seções do post" className="lg:sticky lg:top-6">
      <ol className="relative space-y-1">
        <span aria-hidden className="absolute bottom-6 left-[15px] top-6 w-px bg-border" />
        {itens.map((it) => {
          const atual = it.id === ativa;
          const bloqueada = it.estado === "bloqueada";
          return (
            <li key={it.id} className="relative">
              <button
                type="button"
                onClick={() => onIr(it.id)}
                disabled={bloqueada}
                aria-current={atual ? "step" : undefined}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-2xl px-1.5 py-2.5 text-left transition-all duration-300 disabled:cursor-not-allowed",
                  atual ? "bg-card shadow-card" : !bloqueada && "hover:bg-card/60",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 grid h-[19px] w-[19px] shrink-0 translate-x-[3px] place-items-center rounded-full",
                    it.estado === "pronta" && "bg-success text-white",
                    it.estado === "andamento" && (atual ? "bg-accent ring-4 ring-orange-soft" : "border-2 border-accent bg-background"),
                    bloqueada && "border border-border bg-background text-muted-foreground/70",
                  )}
                >
                  {it.estado === "pronta" && <Check className="h-3 w-3" strokeWidth={3} />}
                  {bloqueada && <Lock className="h-2.5 w-2.5" />}
                </span>
                <span className="min-w-0">
                  <span className={cn("block font-display text-sm font-bold", bloqueada ? "text-muted-foreground" : "text-primary")}>
                    {it.titulo}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{it.linha}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 border-t border-border pt-4 text-[11px] leading-snug text-muted-foreground">
        {salvo ? (
          <div className="space-y-2">
            <p className="inline-flex items-center gap-1.5 font-display font-bold text-success">
              <Check aria-hidden className="h-3.5 w-3.5" /> {salvo}
            </p>
            {estadoPost && (
              <div>
                <EstadoPost estado={estadoPost} />
              </div>
            )}
          </div>
        ) : (
          <p className="flex gap-1.5">
            <CloudOff aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>Ainda não salvo. O post é salvo sozinho quando o texto for aprovado.</span>
          </p>
        )}
      </div>
    </nav>
  );
}
