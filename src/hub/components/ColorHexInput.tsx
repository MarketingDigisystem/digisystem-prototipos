/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/ColorHexInput.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Mock do ColorHexInput real: pastilha com a cor que abre um popover
 * ("Marca" com as bolinhas da paleta, uma grade de tons fixos e o campo hex) e,
 * ao lado, o campo hex. O real usa react-colorful e conta-gotas; o protótipo
 * não pode ter dependência nova, então o picker visual vira a grade de tons.
 * Nunca <input type="color">. O hex aceita 3 ou 6 dígitos, com ou sem "#",
 * e grava depois de 400 ms parado (o debounce do real) ou ao sair do campo.
 */
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { normalizarHex } from "../store/regras";

/** Tons fixos no lugar do picker visual (azuis, laranjas, neutros e apoio). */
const TONS = [
  "#1f2b5c", "#2a397a", "#36499b", "#5a6cc0", "#9aa6dc", "#dfe4f5",
  "#b3410f", "#e0561a", "#ff6d2d", "#ff9563", "#ffc2a3", "#ffe8dc",
  "#1d6f8a", "#3aa9cc", "#67cfee", "#9fe0f4", "#d4f2fb", "#ffffff",
  "#111827", "#374151", "#6b7280", "#9ca3af", "#dadada", "#f3f4f6",
];

export function ColorHexInput({
  value,
  onChange,
  paleta = [],
  disabled,
  rotulo = "Cor",
  inputClassName,
}: {
  value: string;
  onChange: (hex: string) => void;
  /** Cores da marca, mostradas no topo do popover. */
  paleta?: { hex: string; label: string }[];
  disabled?: boolean;
  /** Nome acessível do campo (ex.: "Cor Laranja"). */
  rotulo?: string;
  inputClassName?: string;
}) {
  // Posição do popover (fixed, em portal no body). Dentro da página ele ficaria
  // preso no empilhamento da seção (animate-rise/glass) e a seção seguinte o cobriria.
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const aberto = pos !== null;
  const [texto, setTexto] = useState(value);
  const caixa = useRef<HTMLDivElement>(null);
  const pastilha = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const popId = useId();
  const setAberto = (v: boolean) => {
    if (!v || !pastilha.current) return setPos(null);
    const r = pastilha.current.getBoundingClientRect();
    const alto = 300;
    const top = r.bottom + 8 + alto > window.innerHeight ? Math.max(8, r.top - alto - 8) : r.bottom + 8;
    setPos({ top, left: Math.min(r.left, window.innerWidth - 264) });
  };

  useEffect(() => setTexto(value), [value]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (!caixa.current?.contains(alvo) && !pop.current?.contains(alvo)) setPos(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setPos(null);
    const fechar = () => setPos(null);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
    };
  }, [aberto]);

  const gravar = (bruto: string) => {
    const hex = normalizarHex(bruto);
    if (hex && hex !== value) onChange(hex);
  };
  const digitar = (bruto: string) => {
    setTexto(bruto);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => gravar(bruto), 400);
  };
  const escolher = (hex: string) => {
    onChange(hex);
    setTexto(hex);
  };
  const valido = normalizarHex(texto) !== null;

  return (
    <div ref={caixa} className="relative flex items-center gap-2">
      <button
        ref={pastilha}
        type="button"
        disabled={disabled}
        onClick={() => setAberto(!aberto)}
        aria-label={`${rotulo}: escolher cor (${value})`}
        aria-expanded={aberto}
        aria-controls={popId}
        className="h-8 w-10 shrink-0 rounded-lg border border-border bg-card p-1 transition-shadow duration-300 hover:shadow-card disabled:opacity-60"
      >
        <span className="block h-full w-full rounded-md border border-black/5" style={{ background: value }} />
      </button>
      <input
        value={texto}
        disabled={disabled}
        onChange={(e) => digitar(e.target.value)}
        onBlur={() => {
          window.clearTimeout(timer.current);
          gravar(texto);
          if (!normalizarHex(texto)) setTexto(value);
        }}
        onKeyDown={(e) => e.key === "Enter" && gravar(texto)}
        aria-label={`${rotulo}: código hex`}
        aria-invalid={!valido}
        placeholder="#36499b"
        spellCheck={false}
        className={cn(
          "h-8 w-24 rounded-lg border bg-card px-2 font-mono text-xs outline-none transition-colors duration-300 focus:border-sky focus:ring-2 focus:ring-sky/30 disabled:opacity-60",
          valido ? "border-input" : "border-destructive",
          inputClassName,
        )}
      />

      {pos && createPortal(
        <div
          ref={pop}
          id={popId}
          role="dialog"
          aria-label={`Escolher ${rotulo.toLowerCase()}`}
          style={{ top: pos.top, left: pos.left }}
          className="animate-rise fixed z-[60] w-64 rounded-2xl bg-card p-3 shadow-[var(--shadow-float)]"
        >
          {paleta.length > 0 && (
            <>
              <p className="font-display text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Marca</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {paleta.map((c) => (
                  <button
                    key={c.hex + c.label}
                    type="button"
                    title={`${c.label} ${c.hex}`}
                    aria-label={`${c.label} ${c.hex}`}
                    onClick={() => escolher(c.hex)}
                    className={cn(
                      "h-6 w-6 rounded-full border border-black/10 transition-transform duration-200 hover:scale-110",
                      c.hex === value && "ring-2 ring-accent ring-offset-2 ring-offset-card",
                    )}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </>
          )}
          <p className="mt-3 font-display text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tons</p>
          <div className="mt-1.5 grid grid-cols-6 gap-1.5">
            {TONS.map((hex) => (
              <button
                key={hex}
                type="button"
                aria-label={hex}
                title={hex}
                onClick={() => escolher(hex)}
                className={cn(
                  "h-7 rounded-md border border-black/10 transition-transform duration-200 hover:scale-105",
                  hex === value && "ring-2 ring-accent ring-offset-1 ring-offset-card",
                )}
                style={{ background: hex }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-7 w-7 shrink-0 rounded-md border border-black/10" style={{ background: value }} />
            <input
              value={texto}
              onChange={(e) => digitar(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (gravar(texto), setAberto(false))}
              aria-label={`${rotulo}: código hex`}
              spellCheck={false}
              className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-card px-2 font-mono text-xs outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
            />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
