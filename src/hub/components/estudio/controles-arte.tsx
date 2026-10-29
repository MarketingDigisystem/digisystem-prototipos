/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/ArteStep.tsx (StepperTamanho, campos de % do Avançado,
 *   seletor de logo por posição) @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Arte".
 *
 * Peças dos controles da Arte usadas pelo Estático/Blog (SecaoArte) e pelo
 * carrossel por prancheta (EditorCarrossel): grupo com título, campo de %,
 * stepper de tamanho, grade das 6 posições do logo e P/M/G.
 */
import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { FONTES_ESTUDIO, POSICOES_LOGO, type PosicaoLogo } from "./arte-config";

export function Grupo({ titulo, dica, children }: { titulo: string; dica?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="font-display text-[11px] font-bold uppercase tracking-wider text-primary">{titulo}</legend>
      <span aria-hidden className="mb-2 mt-1 block h-0.5 w-8 rounded-full bg-accent" />
      {children}
      {dica && <p className="mt-1.5 text-[10px] text-muted-foreground">{dica}</p>}
    </fieldset>
  );
}

export function CampoPct({ rotuloCampo, valor, onMudar }: { rotuloCampo: string; valor: string; onMudar: (v: string) => void }) {
  return (
    <label className="block w-20">
      <span className="text-[10px] text-muted-foreground">{rotuloCampo}</span>
      <input
        inputMode="decimal"
        value={valor}
        onChange={(e) => onMudar(e.target.value.replace(/[^\d.,]/g, "").slice(0, 5))}
        placeholder="auto"
        className="mt-0.5 h-8 w-full rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
      />
    </label>
  );
}

export function Stepper({
  rotuloCampo,
  valor,
  padrao,
  onMudar,
  onPadrao,
}: {
  rotuloCampo: string;
  valor: number | undefined;
  padrao: number;
  onMudar: (sentido: 1 | -1) => void;
  onPadrao: () => void;
}) {
  const botao = "grid h-8 w-8 place-items-center rounded-full bg-card text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5";
  return (
    <div>
      <p className="text-[11px] font-semibold text-foreground">{rotuloCampo}</p>
      <p className="text-[10px] text-muted-foreground">
        {valor === undefined ? `Padrão (${padrao}px)` : `Padrão do modelo: ${padrao}px`}
        {valor !== undefined && (
          <button type="button" onClick={onPadrao} className="ml-1.5 font-semibold text-primary underline-offset-2 hover:underline">
            voltar ao padrão
          </button>
        )}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <button type="button" onClick={() => onMudar(-1)} aria-label={`Diminuir ${rotuloCampo.toLowerCase()}`} className={botao}>
          <Minus aria-hidden className="h-3.5 w-3.5" />
        </button>
        <span className="w-16 text-center font-display text-xs font-bold text-foreground" aria-live="polite">
          {valor === undefined ? "Padrão" : `${valor}px`}
        </span>
        <button type="button" onClick={() => onMudar(1)} aria-label={`Aumentar ${rotuloCampo.toLowerCase()}`} className={botao}>
          <Plus aria-hidden className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Select de fonte com as 16 do Estúdio real e o "Padrão". */
export function SeletorFonte({ rotuloCampo, valor, padrao, onMudar }: { rotuloCampo: string; valor: string; padrao: string; onMudar: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground">{rotuloCampo}</span>
      <select
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        className="mt-1 h-8 w-full rounded-xl border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
        style={valor ? { fontFamily: valor } : undefined}
      >
        <option value="">{padrao}</option>
        {FONTES_ESTUDIO.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>
            {f}
          </option>
        ))}
      </select>
    </label>
  );
}

/** As 6 posições do logo; clicar de novo volta ao automático. */
export function GradePosicaoLogo({ valor, onMudar }: { valor: PosicaoLogo | null; onMudar: (v: PosicaoLogo | null) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Posição do logo">
      {POSICOES_LOGO.map((p) => {
        const ativa = valor === p.valor;
        return (
          <button
            key={p.valor}
            type="button"
            title={p.label}
            aria-label={p.label}
            aria-pressed={ativa}
            onClick={() => onMudar(ativa ? null : p.valor)}
            className={cn(
              "grid h-8 w-10 place-items-center rounded-lg border text-xs transition-all duration-300",
              ativa ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-primary",
            )}
          >
            {p.icone}
          </button>
        );
      })}
    </div>
  );
}

/** P/M/G do logo, com os números de Marca → Logos e fundos. */
export function TamanhoLogoPmg({
  valor,
  tamanhos,
  onMudar,
}: {
  valor: "P" | "M" | "G" | null;
  tamanhos: { P: number; M: number; G: number };
  onMudar: (v: "P" | "M" | "G" | null) => void;
}) {
  return (
    <div className="flex gap-1.5" role="group" aria-label="Tamanho do logo">
      {(["P", "M", "G"] as const).map((t) => {
        const ativo = valor === t;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={ativo}
            title={`${tamanhos[t]}% da arte`}
            onClick={() => onMudar(ativo ? null : t)}
            className={cn(
              "h-8 w-10 rounded-full font-display text-xs font-bold transition-all duration-300",
              ativo ? "bg-primary text-primary-foreground shadow-card" : "border border-border bg-card text-muted-foreground hover:text-primary",
            )}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
