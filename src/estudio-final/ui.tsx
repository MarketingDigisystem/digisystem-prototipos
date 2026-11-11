// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/components/estudio/ColorHexInput.tsx, SeletorRedes.tsx, ContadorLimite.tsx e das
//   convenções de tokens/pills de src/styles.css @ leitura 2026-10 (clone mhdgst-trabalho).
// Fonte da verdade = clone real. Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
//
// Refino pós-feedback: 2 colunas, sem trilho, Briefing (2026-11-04) — +CARD_COMPACTO.
// Refino pós-feedback 2: exportar SVG, carregamento IA, acervo, seleção larga, botões de continuidade,
//   parecer, sem ícone de rede (2026-11-04) — +BotaoContinuidade, +MarcaIA, +useFraseRotativa, +useContagem.
//
// Pequenos blocos de UI do protótipo (pills Básico/Avançado, segmented, color hex, loader discreto).
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { PALETA } from "./efData";

export const FOCO =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)]";
export const ROTULO = "font-display text-xs font-bold uppercase tracking-wider text-[#c24a12]";
export const CARD = "rounded-3xl bg-card p-5 shadow-[var(--shadow-card)] sm:p-6";
/** Cartão compacto do passo Conteúdo (densidade de estudio-conteudo, rodada 6). */
export const CARD_COMPACTO = "rounded-3xl bg-card p-4 shadow-[var(--shadow-card)]";

/** Loader DISCRETO (ação pontual) — nunca o símbolo da IA. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden className={cn("h-4 w-4 animate-spin motion-reduce:animate-none", className)} />;
}

/** Par de pills (Básico/Avançado, Sim/Não…). Nunca checkbox/switch solto. */
export function PillPar<T extends string>({
  valor,
  opcoes,
  onChange,
  rotulo,
}: {
  valor: T;
  opcoes: { id: T; label: string }[];
  onChange: (v: T) => void;
  rotulo: string;
}) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="inline-flex shrink-0 rounded-full bg-secondary p-0.5">
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={valor === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-3 py-1 font-display text-[11px] font-bold transition-colors motion-reduce:transition-none",
            FOCO,
            valor === o.id ? "bg-[#ff6d2d] text-white" : "text-muted-foreground hover:text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Segmented com item ativo em laranja SÓLIDO (#ff6d2d, sem degradê). */
export function Segmentado<T extends string>({
  valor,
  opcoes,
  onChange,
  rotulo,
  className,
}: {
  valor: T;
  opcoes: { id: T; label: ReactNode; titulo?: string; desabilitado?: boolean }[];
  onChange: (v: T) => void;
  rotulo: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={rotulo} className={cn("inline-flex max-w-full rounded-2xl bg-secondary p-1", className)}>
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={valor === o.id}
          disabled={o.desabilitado}
          title={o.titulo}
          onClick={() => onChange(o.id)}
          className={cn(
            "min-w-0 flex-1 whitespace-nowrap rounded-xl px-3 py-1.5 font-display text-xs font-bold transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-45",
            FOCO,
            valor === o.id ? "bg-[#ff6d2d] text-white shadow-sm" : "text-muted-foreground hover:text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const HEX = /^#([0-9a-fA-F]{6})$/;

/** ColorHexInput (swatch + hex + paleta da marca). Nunca <input type="color"> nativo, nunca RGB solto. */
export function ColorHex({ valor, onChange, rotulo }: { valor: string; onChange: (v: string) => void; rotulo: string }) {
  const [txt, setTxt] = useState(valor);
  useEffect(() => setTxt(valor), [valor]);
  const valido = HEX.test(txt);
  return (
    <div className="min-w-0">
      <span className="font-display text-[11px] font-bold text-primary">{rotulo}</span>
      <div className="mt-1 flex items-center gap-2">
        <span
          aria-hidden
          className="h-8 w-8 shrink-0 rounded-xl border border-border shadow-inner"
          style={{ background: valido ? txt : valor }}
        />
        <input
          value={txt}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setTxt(v.slice(0, 7));
            if (HEX.test(v.slice(0, 7))) onChange(v.slice(0, 7).toLowerCase());
          }}
          aria-label={`${rotulo} (hexadecimal)`}
          aria-invalid={!valido}
          spellCheck={false}
          className={cn(
            "h-8 w-24 min-w-0 rounded-xl border bg-card px-2.5 font-mono text-xs uppercase text-foreground",
            valido ? "border-border" : "border-destructive",
            FOCO,
          )}
        />
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {PALETA.map((p) => (
          <button
            key={p.hex}
            type="button"
            title={p.nome}
            aria-label={`${rotulo}: ${p.nome}`}
            onClick={() => onChange(p.hex)}
            className={cn("grid h-5 w-5 place-items-center rounded-full border border-border", FOCO)}
            style={{ background: p.hex }}
          >
            {valor.toLowerCase() === p.hex && <Check aria-hidden className="h-3 w-3" style={{ color: p.hex === "#ffffff" ? "#36499b" : "#fff" }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Slider({
  rotulo,
  valor,
  min,
  max,
  onChange,
  sufixo = "",
}: {
  rotulo: string;
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  sufixo?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="flex items-center justify-between font-display text-[11px] font-bold text-primary">
        {rotulo}
        <span className="font-sans font-normal text-muted-foreground">
          {valor}
          {sufixo}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[#36499b]"
      />
    </label>
  );
}

/** Badge de ok/pendente de bloco. */
export function SeloOk({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[11px] font-bold",
        ok ? "bg-[var(--success-soft)] text-[#2f8a57]" : "bg-[var(--orange-soft)] text-[#c24a12]",
      )}
    >
      {ok && <Check aria-hidden className="h-3 w-3" />}
      {children}
    </span>
  );
}


/* ---------------- refino pós-feedback 2 ---------------- */

export function prefereMenosMovimento() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Forma EM REPOUSO (estática) do símbolo da IA, para botões pequenos. Nunca Sparkles. */
export function MarcaIA({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 56" aria-hidden className={className}>
      <circle cx="18" cy="30" r="13" fill="#36499b" />
      <circle cx="40" cy="18" r="9" fill="#ff6d2d" />
      <circle cx="44" cy="40" r="7" fill="#67cfee" />
    </svg>
  );
}

/**
 * Botão de CONTINUIDADE (leva a pessoa adiante no fluxo). Fora do padrão dos botões comuns: pílula maior,
 * cor sólida (laranja = continuidade principal, navy = continuidade secundária, sem degradê), seta à
 * direita que avança no hover, leve elevação e anel de foco. Largura mínima fixa: o rótulo que muda
 * (“Escrevendo…”) não desloca nada. Com movimento reduzido, sem elevação nem deslize da seta.
 */
export function BotaoContinuidade({
  variante = "principal",
  onClick,
  disabled,
  carregando,
  marcaIA,
  children,
  extra,
  className,
  title,
}: {
  variante?: "principal" | "secundaria";
  onClick?: () => void;
  disabled?: boolean;
  carregando?: boolean;
  marcaIA?: boolean;
  children: ReactNode;
  extra?: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || carregando}
      title={title}
      aria-busy={carregando || undefined}
      className={cn(
        "ef-continuar group inline-flex items-center justify-center gap-2.5 rounded-full py-2.5 pl-5 pr-2.5 font-display text-sm font-bold text-white",
        /* anel de foco por outline (a sombra de .ef-continuar ocuparia o box-shadow do ring) */
        "focus-visible:outline-[3px] focus-visible:outline-offset-[3px]",
        variante === "principal" ? "bg-[#ff6d2d] focus-visible:outline-[#36499b]" : "bg-[#36499b] focus-visible:outline-[#ff6d2d]",
        "disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
    >
      {marcaIA && (
        <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white">
          {carregando ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#36499b] motion-reduce:animate-none" /> : <MarcaIA className="h-4 w-4" />}
        </span>
      )}
      {!marcaIA && carregando && <Loader2 aria-hidden className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
      <span className="whitespace-nowrap">{children}</span>
      {extra}
      <span aria-hidden className="ef-continuar-seta grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

/** Troca a frase de status em intervalos (estado assíncrono com mensagem honesta que muda no tempo). */
export function useFraseRotativa(total: number, ativo: boolean, ms = 800) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!ativo) {
      setI(0);
      return;
    }
    const id = window.setInterval(() => setI((n) => Math.min(total - 1, n + 1)), ms);
    return () => window.clearInterval(id);
  }, [ativo, total, ms]);
  return i;
}

/** Contagem crescente até `alvo` (movimento reduzido = valor final direto). */
export function useContagem(alvo: number, ativo: boolean, ms = 900) {
  const [v, setV] = useState(ativo && !prefereMenosMovimento() ? 0 : alvo);
  const raf = useRef(0);
  useEffect(() => {
    if (!ativo) return;
    if (prefereMenosMovimento()) {
      setV(alvo);
      return;
    }
    const t0 = performance.now();
    const passo = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(passo);
    };
    setV(0);
    raf.current = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf.current);
  }, [alvo, ativo, ms]);
  return v;
}
