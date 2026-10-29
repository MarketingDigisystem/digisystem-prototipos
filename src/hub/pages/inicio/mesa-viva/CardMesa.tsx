/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Casca de todo card da mesa: cabeçalho (alça ⠿, título, contador, Fixado,
 * ↑ ↓, normal/largo, ⋯), corpo e rodapé (Ver mais / ver todos).
 * Revisão 2026-10-27 (tarde): alça, Fixado, ↑ ↓, normal/largo e ⋯ só existem
 * com o modo Reorganizar ligado. Fora dele o cabeçalho é só título + contador.
 * Revisado em 2026-10-27 (noite): disposição livre em colunas (decisão 8) e só Acordeão (decisão 2).
 * Card normal ganha ← → (trocar de coluna, só lg+); sai o modoSub (B1 Deslizar removido).
 */
import { useState, type ReactNode } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { hrefDe } from "../../../router";
import { ContadorAnimado } from "./anim";
import type { CardId, MetaCard, Tamanho } from "./catalogo";
import type { Densidade, DensidadeCard, Lado } from "./layout";
import { BOTAO_ICONE, MenuCard } from "./MenuCard";

export type AlcaProps = {
  ref: (el: HTMLElement | null) => void;
  listeners: DraggableSyntheticListeners;
  attributes: DraggableAttributes;
};

export type DirecaoSeta = "subir" | "descer" | "esquerda" | "direita";

/** Tudo o que a grade passa para um card. */
export type Casca = {
  id: CardId;
  meta: MetaCard;
  tamanho: Tamanho;
  /** Densidade já resolvida (card ou mesa). */
  densidade: Densidade;
  densidadeCard: DensidadeCard;
  /** Modo Reorganizar ligado: só nele existem alça, setas, tamanho, ⋯ e "Fixado". */
  reorganizar: boolean;
  fixado: boolean;
  /** Não dá para subir/descer mais na ordem lógica. */
  primeiro: boolean;
  ultimo: boolean;
  /** Coluna do card normal (ausente no largo). */
  lado?: Lado;
  onEsquerda?: () => void;
  onDireita?: () => void;
  indiceEntrada: number;
  /** Cópia levantada do DragOverlay (sem interação). */
  sobreposicao?: boolean;
  alca?: AlcaProps;
  onSubir: () => void;
  onDescer: () => void;
  onTamanho: () => void;
  onOcultar: () => void;
  onDensidadeCard: (d: DensidadeCard) => void;
  registrarSeta: (dir: DirecaoSeta, el: HTMLButtonElement | null) => void;
};

export function CardMesa({
  casca,
  contador,
  rodape,
  className,
  children,
}: {
  casca: Casca;
  contador?: number;
  rodape?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const { id, meta, tamanho, sobreposicao } = casca;
  const idTitulo = `mmv-titulo-${id}`;
  const largo = tamanho === "largo";
  // Fora do modo Reorganizar a mesa é só de uso: os controles nem entram no DOM.
  const editando = casca.reorganizar;

  return (
    <section
      aria-labelledby={idTitulo}
      inert={sobreposicao || undefined}
      className={cn(
        "group relative flex h-full flex-col rounded-3xl bg-card p-5 text-card-foreground shadow-card sm:p-6",
        sobreposicao ? "mmv-levantado" : "animate-rise",
        className,
      )}
      style={sobreposicao ? undefined : { animationDelay: `${Math.min(casca.indiceEntrada, 8) * 60}ms` }}
    >
      <header className="flex items-center gap-1.5">
        {editando && casca.alca && (
          <button
            type="button"
            ref={casca.alca.ref}
            {...casca.alca.attributes}
            {...casca.alca.listeners}
            data-mmv-edicao
            aria-label={`Arrastar ${meta.titulo}`}
            aria-roledescription="alça de arrastar"
            title="Arrastar para mudar de lugar"
            className={cn(BOTAO_ICONE, "mmv-controles-entram -ml-2 hidden cursor-grab touch-none active:cursor-grabbing sm:inline-flex")}
          >
            <GripVertical aria-hidden className="h-4 w-4" />
          </button>
        )}
        <h2 id={idTitulo} tabIndex={-1} className="min-w-0 flex-1 break-words leading-snug sm:truncate font-display text-sm font-bold uppercase tracking-wide text-primary focus:outline-none">
          {meta.titulo}
          {contador !== undefined && (
            <span className="ml-2 align-baseline font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground">
              <ContadorAnimado valor={contador} />
              <span className="sr-only"> {contador === 1 ? "item" : "itens"}</span>
            </span>
          )}
        </h2>
        {editando && casca.fixado && (
          <span
            title="Posição de fábrica. Some quando você muda a ordem."
            className="mmv-controles-entram hidden shrink-0 rounded-full bg-sky-soft px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-primary sm:inline"
          >
            Fixado
          </span>
        )}
        {editando && (
          <div className="mmv-controles-entram flex shrink-0 items-center">
            <button
              type="button"
              ref={(el) => casca.registrarSeta("subir", el)}
              onClick={casca.onSubir}
              disabled={casca.primeiro}
              data-mmv-edicao
              aria-label={`Mover ${meta.titulo} para cima`}
              title="Mover para cima"
              className={BOTAO_ICONE}
            >
              <ArrowUp aria-hidden className="h-4 w-4" />
            </button>
            <button
              type="button"
              ref={(el) => casca.registrarSeta("descer", el)}
              onClick={casca.onDescer}
              disabled={casca.ultimo}
              data-mmv-edicao
              aria-label={`Mover ${meta.titulo} para baixo`}
              title="Mover para baixo"
              className={BOTAO_ICONE}
            >
              <ArrowDown aria-hidden className="h-4 w-4" />
            </button>
            {!largo && casca.lado && (
              <>
                <button
                  type="button"
                  ref={(el) => casca.registrarSeta("esquerda", el)}
                  onClick={casca.onEsquerda}
                  disabled={casca.lado === "esq"}
                  data-mmv-edicao
                  aria-label={`Mover ${meta.titulo} para a coluna da esquerda`}
                  title="Mover para a coluna da esquerda"
                  className={cn(BOTAO_ICONE, "hidden lg:inline-flex")}
                >
                  <ArrowLeft aria-hidden className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  ref={(el) => casca.registrarSeta("direita", el)}
                  onClick={casca.onDireita}
                  disabled={casca.lado === "dir"}
                  data-mmv-edicao
                  aria-label={`Mover ${meta.titulo} para a coluna da direita`}
                  title="Mover para a coluna da direita"
                  className={cn(BOTAO_ICONE, "hidden lg:inline-flex")}
                >
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={casca.onTamanho}
              aria-pressed={largo}
              data-mmv-edicao
              aria-label={largo ? `Deixar ${meta.titulo} normal (1 coluna)` : `Deixar ${meta.titulo} largo (largura toda)`}
              title={largo ? "Normal: volta para uma coluna" : "Largo: ocupa a largura toda"}
              className={cn(BOTAO_ICONE, "hidden lg:inline-flex")}
            >
              {largo ? <Minimize2 aria-hidden className="h-4 w-4" /> : <Maximize2 aria-hidden className="h-4 w-4" />}
            </button>
            <MenuCard titulo={meta.titulo} densidade={casca.densidadeCard} onDensidade={casca.onDensidadeCard} onOcultar={casca.onOcultar} />
          </div>
        )}
      </header>

      <div className="mt-3 min-w-0 flex-1">{children}</div>

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <div className="min-w-0">{rodape}</div>
        <a
          href={hrefDe(meta.linkVerTodos.area, meta.linkVerTodos.aba)}
          className="inline-flex shrink-0 items-center gap-1 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-200 hover:text-accent"
        >
          {meta.linkVerTodos.rotulo} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
        </a>
      </footer>
    </section>
  );
}

/** Estado vazio de uma linha, sem caixa extra. */
export function Vazio({ children }: { children: ReactNode }) {
  return <p className="py-2 text-sm text-muted-foreground">{children}</p>;
}

/**
 * Densidade numa lista: no compacto mostra `limite` e o resto abre ali mesmo
 * ("um clique a mais"); em Mostrar tudo vem tudo.
 */
export function useListaDensa<T>(itens: T[], densidade: Densidade, limite = 3) {
  const [aberto, setAberto] = useState(false);
  const compacto = densidade === "compacto" && itens.length > limite;
  const primeiros = compacto ? itens.slice(0, limite) : itens;
  const resto = compacto ? itens.slice(limite) : [];
  const botao =
    resto.length > 0 ? (
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className="rounded-lg px-1 py-1 font-display text-[11px] font-bold text-primary transition-colors duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {aberto ? "Mostrar menos" : `Ver mais ${resto.length}`}
      </button>
    ) : null;
  return { primeiros, resto, aberto: aberto && resto.length > 0, botao };
}

/** O "resto" do compacto, abrindo em altura. */
export function Resto({ aberto, children }: { aberto: boolean; children: ReactNode }) {
  return (
    <div className="mmv-expansor" data-aberto={aberto}>
      <div inert={!aberto || undefined}>{children}</div>
    </div>
  );
}
