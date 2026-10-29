/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/brand-kit.tsx (SectionTitle, Field, ChipsField)
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Peças comuns das abas de Marca, com as classes do Brand Kit real:
 * seção `glass rounded-3xl p-6`, título com ícone em círculo navy-soft,
 * rótulo de campo em caixa alta Dosis e o campo de chips com "Adicionar".
 */
import { useId, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Marca } from "../../store/tipos";

export type PatchMarca = <K extends keyof Marca>(chave: K, valor: Marca[K]) => void;

export type PropsAba = {
  form: Marca;
  patch: PatchMarca;
  podeEditar: boolean;
};

export const atraso = (ms: number) => ({ animationDelay: `${ms}ms` });

/** Classe base dos campos (Input/Textarea do real, com o foco sky do protótipo). */
export const CAMPO =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-sky focus:ring-2 focus:ring-sky/30 disabled:cursor-not-allowed disabled:bg-secondary/40 disabled:text-foreground/80";

export function Secao({
  id,
  icone,
  titulo,
  ajuda,
  children,
  className,
  delay = 0,
  extra,
}: {
  id?: string;
  icone: ReactNode;
  titulo: string;
  ajuda?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Conteúdo à direita do título (contagem, ação). */
  extra?: ReactNode;
}) {
  const tituloId = useId();
  return (
    <section
      id={id}
      aria-labelledby={tituloId}
      className={cn("animate-rise glass flex flex-col rounded-3xl p-6", className)}
      style={atraso(delay)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-soft text-primary">{icone}</span>
          <h2 id={tituloId} className="font-display text-lg font-bold text-primary">
            {titulo}
          </h2>
        </div>
        {extra}
      </div>
      {ajuda && <p className="mt-2 text-xs text-muted-foreground">{ajuda}</p>}
      {children}
    </section>
  );
}

/** Rótulo do Field real: Dosis, caixa alta, cinza. */
export function Campo({
  rotulo,
  children,
  dica,
  className,
}: {
  rotulo: string;
  children: (id: string) => ReactNode;
  dica?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {rotulo}
      </label>
      <div className="mt-1.5">{children(id)}</div>
      {dica && <p className="mt-1 text-[11px] text-muted-foreground">{dica}</p>}
    </div>
  );
}

/** ChipsField do real: chips no tom pedido + campo com "Adicionar" (Enter também adiciona). */
export function CampoChips({
  rotulo,
  valores,
  onChange,
  podeEditar,
  tom,
  placeholder,
  normalizar,
  aoAjustar,
}: {
  rotulo: string;
  valores: string[];
  onChange: (v: string[]) => void;
  podeEditar: boolean;
  tom: "primary" | "accent" | "danger";
  placeholder?: string;
  normalizar?: (s: string) => string;
  /** Chamado quando a normalização mudou o que a pessoa digitou. */
  aoAjustar?: (digitado: string, gravado: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const id = useId();
  const classeTom =
    tom === "accent" ? "bg-orange-soft text-accent" : tom === "danger" ? "bg-destructive/10 text-destructive" : "bg-sky-soft text-primary";

  const adicionar = () => {
    const bruto = texto.trim();
    if (!bruto) return;
    const valor = normalizar ? normalizar(bruto) : bruto;
    if (!valor || valores.includes(valor)) {
      setTexto("");
      return;
    }
    onChange([...valores, valor]);
    if (aoAjustar && valor !== bruto) aoAjustar(bruto, valor);
    setTexto("");
  };

  return (
    <div>
      <label htmlFor={id} className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {rotulo}
      </label>
      <ul className="mt-2 flex flex-wrap gap-2" aria-label={rotulo}>
        {valores.length === 0 && <li className="text-xs text-muted-foreground">Nenhum ainda.</li>}
        {valores.map((v) => (
          <li key={v} className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-bold", classeTom)}>
            {v}
            {podeEditar && (
              <button
                type="button"
                onClick={() => onChange(valores.filter((x) => x !== v))}
                className="grid h-4 w-4 place-items-center rounded-full transition-colors hover:bg-black/10"
                aria-label={`Remover ${v}`}
              >
                <X aria-hidden className="h-3 w-3" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {podeEditar && (
        <div className="mt-2 flex gap-2">
          <input
            id={id}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionar();
              }
            }}
            placeholder={placeholder}
            className={cn(CAMPO, "h-9")}
          />
          <BotaoLeve onClick={adicionar}>
            <Plus aria-hidden className="h-3.5 w-3.5" /> Adicionar
          </BotaoLeve>
        </div>
      )}
    </div>
  );
}

/** Botão branco com sombra do real ("Adicionar cor", "Adicionar segmento"). */
export function BotaoLeve({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-display text-xs font-bold text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Botão redondo de remover (X ou lixeira do real). */
export function BotaoRemover({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      title={rotulo}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-destructive/10 hover:text-destructive"
    >
      {children}
    </button>
  );
}

/** Pílulas de escolha única (padrão do projeto para alternadores). */
export function Pilulas<T extends string>({
  opcoes,
  valor,
  onChange,
  disabled,
  rotulo,
}: {
  opcoes: { id: T; label: string }[];
  valor: T;
  onChange: (v: T) => void;
  disabled?: boolean;
  rotulo: string;
}) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="inline-flex gap-1 rounded-full bg-secondary p-1">
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === valor}
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-3.5 py-1 font-display text-xs font-bold transition-all duration-300 disabled:cursor-not-allowed",
            o.id === valor ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
