/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/brand-kit.tsx (Paleta, Tipografia, TypographyPreview,
 *   FONT_GROUPS, WEIGHTS) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Marca → Cores e fontes. A paleta do Brand Kit real (até 6 cores, cada uma
 * por ColorHexInput + nome) ganha uma faixa no topo que mostra a paleta como
 * ela aparece numa arte. A tipografia segue o real: escala, line-height,
 * letter-spacing do display, os 7 níveis com família, peso e tamanho, e a
 * prévia ao vivo. A escala vira pílulas (padrão do projeto para alternador).
 * "Padrão" de cada nível volta ao Brand Kit configurado (Dosis + Open Sans),
 * não ao fallback Sora + Inter do código real.
 */
import type { CSSProperties } from "react";
import { Palette, Plus, Type, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ColorHexInput } from "../../components/ColorHexInput";
import { MARCA } from "../../store/mock-referencia";
import { MAX_CORES_PALETA, textoSobre } from "../../store/regras";
import type { Marca, NivelTipografia } from "../../store/tipos";
import { atraso, BotaoLeve, BotaoRemover, CAMPO, Pilulas, Secao, type PropsAba } from "./partes";

type ChaveNivel = "display" | "h1" | "h2" | "h3" | "body" | "caption" | "mono";

const NIVEIS: { chave: ChaveNivel; rotulo: string; exemplo: string }[] = [
  { chave: "display", rotulo: "Display", exemplo: "Parceria que transforma" },
  { chave: "h1", rotulo: "H1", exemplo: "Contexto que acompanha o cliente" },
  { chave: "h2", rotulo: "H2", exemplo: "Atendimento sem repetição" },
  { chave: "h3", rotulo: "H3", exemplo: "Service desk com histórico" },
  { chave: "body", rotulo: "Body", exemplo: "O cliente conta o problema uma vez, e o time inteiro passa a saber." },
  { chave: "caption", rotulo: "Caption", exemplo: "Fale com nossos especialistas" },
  { chave: "mono", rotulo: "Mono", exemplo: "#36499b · #ff6d2d · #67cfee" },
];

const PESOS = [
  { valor: 200, rotulo: "200 · ExtraLight" },
  { valor: 300, rotulo: "300 · Light" },
  { valor: 400, rotulo: "400 · Regular" },
  { valor: 500, rotulo: "500 · Medium" },
  { valor: 600, rotulo: "600 · SemiBold" },
  { valor: 700, rotulo: "700 · Bold" },
  { valor: 800, rotulo: "800 · ExtraBold" },
];

const GRUPOS_FONTE: { rotulo: string; fontes: string[] }[] = [
  { rotulo: "Marca", fontes: ["Gugi", "Dosis", "Open Sans"] },
  {
    rotulo: "Sans",
    fontes: ["Inter", "Sora", "Manrope", "DM Sans", "Plus Jakarta Sans", "Space Grotesk", "Outfit", "Figtree", "Urbanist", "Work Sans", "Poppins", "Nunito Sans"],
  },
  { rotulo: "Serif", fontes: ["Playfair Display", "Instrument Serif", "DM Serif Display", "Cormorant", "Libre Baskerville", "Lora"] },
  { rotulo: "Display", fontes: ["Bebas Neue", "Archivo Black", "Abril Fatface", "Syne"] },
  { rotulo: "Mono", fontes: ["JetBrains Mono", "Space Mono", "Fira Code", "IBM Plex Mono"] },
];

/** As únicas carregadas no protótipo (index.html). As outras caem na fonte padrão da prévia. */
const CARREGADAS = new Set(["Dosis", "Open Sans"]);

export function CoresFontes({ form, patch, podeEditar }: PropsAba) {
  const tip = form.tipografia;
  const patchTip = <K extends keyof Marca["tipografia"]>(k: K, v: Marca["tipografia"][K]) => patch("tipografia", { ...tip, [k]: v });
  const familias = [...new Set(NIVEIS.map((n) => tip[n.chave].family))];

  return (
    <>
      <p className="animate-rise mt-8 max-w-3xl text-[15px] leading-relaxed text-foreground/85" style={atraso(70)}>
        {form.cores.length} de {MAX_CORES_PALETA} cores na paleta, com {form.cores.slice(0, 3).map((c) => c.label).join(", ")} na
        base. Os textos usam {familias.join(" e ")}.
      </p>

      <Secao icone={<Palette aria-hidden className="h-4 w-4" />} titulo="Paleta" className="mt-6" delay={120}>
        <div role="img" aria-label="Paleta como aparece numa arte" className="mt-4 flex h-24 overflow-hidden rounded-2xl shadow-card">
          {form.cores.map((c, i) => (
            <div
              key={i}
              className={cn(
                "flex min-w-0 flex-col justify-end p-3 transition-[flex-grow] duration-500",
                textoSobre(c.hex) === "claro" ? "text-white" : "text-primary",
              )}
              style={{ background: c.hex, flexGrow: i < 3 ? 3 : 1, flexBasis: 0 }}
            >
              <span className="truncate font-display text-xs font-bold">{c.label}</span>
              <span className="truncate font-mono text-[10px] opacity-80">{c.hex}</span>
            </div>
          ))}
        </div>

        <ul className="mt-5 grid gap-x-8 gap-y-2.5 md:grid-cols-2">
          {form.cores.map((c, i) => (
            <li key={i} className="flex items-center gap-2">
              <ColorHexInput
                value={c.hex}
                onChange={(hex) => patch("cores", form.cores.map((x, j) => (j === i ? { ...x, hex } : x)))}
                paleta={form.cores}
                disabled={!podeEditar}
                rotulo={`Cor ${c.label || i + 1}`}
              />
              <label htmlFor={`cor-nome-${i}`} className="sr-only">
                Nome da cor
              </label>
              <input
                id={`cor-nome-${i}`}
                value={c.label}
                onChange={(e) => patch("cores", form.cores.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                disabled={!podeEditar}
                placeholder="Nome"
                className={cn(CAMPO, "h-9 min-w-0")}
              />
              {podeEditar && (
                <BotaoRemover rotulo={`Remover a cor ${c.label}`} onClick={() => patch("cores", form.cores.filter((_, j) => j !== i))}>
                  <X aria-hidden className="h-4 w-4" />
                </BotaoRemover>
              )}
            </li>
          ))}
        </ul>
        {podeEditar &&
          (form.cores.length < MAX_CORES_PALETA ? (
            <BotaoLeve className="mt-4 self-start" onClick={() => patch("cores", [...form.cores, { hex: "#000000", label: "Nova cor" }])}>
              <Plus aria-hidden className="h-3.5 w-3.5" /> Adicionar cor
            </BotaoLeve>
          ) : (
            <p className="mt-4 text-[11px] text-muted-foreground">A paleta já tem as {MAX_CORES_PALETA} cores que cabem. Para trocar uma, edite ou remova antes.</p>
          ))}
      </Secao>

      <Secao
        icone={<Type aria-hidden className="h-4 w-4" />}
        titulo="Tipografia"
        ajuda="Defina família, peso e tamanho para cada nível. As fontes precisam estar disponíveis no sistema ou via Google Fonts."
        className="mt-6"
        delay={190}
      >
        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Escala</p>
            <div className="mt-1.5">
              <Pilulas
                rotulo="Escala"
                opcoes={[
                  { id: "Compacta", label: "Compacta" },
                  { id: "Padrão", label: "Padrão" },
                  { id: "Ampla", label: "Ampla" },
                ]}
                valor={tip.escala}
                onChange={(v) => patchTip("escala", v)}
                disabled={!podeEditar}
              />
            </div>
          </div>
          <Faixa
            id="tip-lh"
            rotulo={`Line-height base (${tip.lineHeight.toFixed(2)})`}
            min={1.2}
            max={1.8}
            passo={0.05}
            valor={tip.lineHeight}
            onChange={(v) => patchTip("lineHeight", v)}
            disabled={!podeEditar}
          />
          <Faixa
            id="tip-ls"
            rotulo={`Letter-spacing do display (${tip.letterSpacing.toFixed(3)}em)`}
            min={-0.04}
            max={0.04}
            passo={0.005}
            valor={tip.letterSpacing}
            onChange={(v) => patchTip("letterSpacing", v)}
            disabled={!podeEditar}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ul className="divide-y divide-border rounded-2xl bg-card px-4 shadow-card">
            {NIVEIS.map(({ chave, rotulo }) => {
              const nivel = tip[chave];
              const padrao = MARCA.tipografia[chave];
              const ehPadrao = nivel.family === padrao.family && nivel.weight === padrao.weight && nivel.size === padrao.size;
              const mudar = (p: Partial<NivelTipografia>) => patchTip(chave, { ...nivel, ...p });
              return (
                <li key={chave} className="py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-primary">{rotulo}</span>
                    {podeEditar && !ehPadrao && (
                      <button
                        type="button"
                        onClick={() => patchTip(chave, { ...padrao })}
                        className="font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
                      >
                        Padrão
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_8.5rem_4.5rem] gap-2">
                    <select
                      aria-label={`Família do ${rotulo}`}
                      value={nivel.family}
                      onChange={(e) => mudar({ family: e.target.value })}
                      disabled={!podeEditar}
                      className={cn(CAMPO, "h-9 px-2")}
                    >
                      {GRUPOS_FONTE.map((g) => (
                        <optgroup key={g.rotulo} label={g.rotulo}>
                          {g.fontes.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <select
                      aria-label={`Peso do ${rotulo}`}
                      value={nivel.weight}
                      onChange={(e) => mudar({ weight: Number(e.target.value) })}
                      disabled={!podeEditar}
                      className={cn(CAMPO, "h-9 px-2")}
                    >
                      {PESOS.map((p) => (
                        <option key={p.valor} value={p.valor}>
                          {p.rotulo}
                        </option>
                      ))}
                    </select>
                    <input
                      aria-label={`Tamanho do ${rotulo} em px`}
                      type="number"
                      min={8}
                      max={200}
                      value={nivel.size}
                      onChange={(e) => mudar({ size: Number(e.target.value) || 0 })}
                      disabled={!podeEditar}
                      className={cn(CAMPO, "h-9 px-2")}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <Previa tipografia={tip} />
        </div>
      </Secao>
    </>
  );
}

function Faixa({
  id,
  rotulo,
  min,
  max,
  passo,
  valor,
  onChange,
  disabled,
}: {
  id: string;
  rotulo: string;
  min: number;
  max: number;
  passo: number;
  valor: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-[13rem] flex-1">
      <label htmlFor={id} className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {rotulo}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={passo}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="mt-2 w-full accent-[var(--color-primary)]"
      />
    </div>
  );
}

/** TypographyPreview do real: "Preview ao vivo" com os 7 níveis. */
function Previa({ tipografia }: { tipografia: Marca["tipografia"] }) {
  const fator = tipografia.escala === "Compacta" ? 0.9 : tipografia.escala === "Ampla" ? 1.1 : 1;
  const faltando = [...new Set(NIVEIS.map((n) => tipografia[n.chave].family).filter((f) => !CARREGADAS.has(f)))];
  return (
    <div className="h-fit rounded-2xl bg-card p-5 shadow-card lg:sticky lg:top-6" style={{ lineHeight: tipografia.lineHeight }}>
      <span className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Prévia ao vivo</span>
      <div className="mt-3 space-y-3">
        {NIVEIS.map(({ chave, rotulo, exemplo }) => {
          const nivel = tipografia[chave];
          const extra: CSSProperties = chave === "display" ? { letterSpacing: `${tipografia.letterSpacing}em` } : {};
          return (
            <div key={chave} className="min-w-0">
              <span className="font-display text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{rotulo}</span>
              <div
                className="mt-1 break-words text-primary"
                style={{ fontFamily: `"${nivel.family}", sans-serif`, fontWeight: nivel.weight, fontSize: `${nivel.size * fator}px`, ...extra }}
              >
                {exemplo}
              </div>
            </div>
          );
        })}
      </div>
      {faltando.length > 0 && (
        <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
          No protótipo só Dosis e Open Sans estão carregadas. {faltando.join(", ")} aparece na fonte padrão nesta prévia.
        </p>
      )}
    </div>
  );
}
