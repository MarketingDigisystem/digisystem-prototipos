/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/brand-kit.tsx (LogoUploader, OutrosLogos, OutrosFundos,
 *   ElementosGallery, seção Elementos), src/components/admin/AbaMarca.tsx
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Marca → Logos e fundos. Junta o "Logo & Cores" e os "Elementos" do Brand
 * Kit com os tamanhos de logo P/M/G que hoje moram na aba Marca da
 * Administração. Sem seletor de arquivo: o protótipo não tem os arquivos reais
 * (só os rótulos do banco), então os logos e os elementos são desenhados e
 * "Adicionar" entra só com o nome.
 */
import { useState } from "react";
import { ImagePlus, Palette, Plus, RotateCcw, Shapes, Trash2, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ColorHexInput } from "../../components/ColorHexInput";
import { useHub, novoId } from "../../store/HubStore";
import { MARCA } from "../../store/mock-referencia";
import { plural, validarTamanhosLogo } from "../../store/regras";
import { atraso, BotaoLeve, BotaoRemover, CAMPO, Pilulas, Secao, type PropsAba } from "./partes";

type Tamanho = "P" | "M" | "G";

export function LogosFundos({ form, patch, podeEditar }: PropsAba) {
  const { acoes } = useHub();
  const [principal, ...outros] = form.logos;
  const semArquivo = () => acoes.avisar("No app, aqui você escolhe o arquivo. No protótipo a versão entra só com o nome.");

  return (
    <>
      <p className="animate-rise mt-8 max-w-3xl text-[15px] leading-relaxed text-foreground/85" style={atraso(70)}>
        {plural(form.logos.length, "versão do logo", "versões do logo")}, {plural(form.fundos.length, "fundo", "fundos")} e{" "}
        {plural(form.elementosImagens.length, "elemento gráfico", "elementos gráficos")}. O Estúdio aplica o logo no
        tamanho escolhido e usa os fundos no template de bandas.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Secao icone={<Palette aria-hidden className="h-4 w-4" />} titulo="Logo da marca" delay={120}>
          {principal ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <LogoDesenho label={principal.label} nome={form.nome} slogan={form.tagline} className="h-40" grande />
              {podeEditar && (
                <BotaoLeve onClick={semArquivo}>
                  <ImagePlus aria-hidden className="h-3.5 w-3.5" /> Trocar logo
                </BotaoLeve>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum logo principal.</p>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Outras versões</p>
            <ul className="mt-3 space-y-2">
              {outros.map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <LogoDesenho label={l.label} nome={form.nome} slogan={form.tagline} className="h-12 w-20 shrink-0" />
                  <label htmlFor={`logo-${l.id}`} className="sr-only">
                    Nome da versão
                  </label>
                  <input
                    id={`logo-${l.id}`}
                    value={l.label}
                    onChange={(e) => patch("logos", form.logos.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)))}
                    disabled={!podeEditar}
                    placeholder="Ex.: Negativo (branco)"
                    className={cn(CAMPO, "h-9 min-w-0")}
                  />
                  {podeEditar && (
                    <BotaoRemover rotulo={`Remover ${l.label}`} onClick={() => patch("logos", form.logos.filter((x) => x.id !== l.id))}>
                      <X aria-hidden className="h-4 w-4" />
                    </BotaoRemover>
                  )}
                </li>
              ))}
            </ul>
            {podeEditar && (
              <BotaoLeve
                className="mt-3"
                onClick={() => {
                  patch("logos", [...form.logos, { id: novoId("logo"), label: "Nova versão" }]);
                  semArquivo();
                }}
              >
                <Plus aria-hidden className="h-3.5 w-3.5" /> Adicionar versão
              </BotaoLeve>
            )}
          </div>
        </Secao>

        <div className="flex flex-col gap-6">
          <TamanhosLogo form={form} patch={patch} podeEditar={podeEditar} />

          <Secao
            icone={<Palette aria-hidden className="h-4 w-4" />}
            titulo="Fundos"
            ajuda="Os fundos sólidos que o template de bandas oferece no Estúdio."
            delay={260}
          >
            <ul className="mt-4 space-y-2.5">
              {form.fundos.map((f) => (
                <li key={f.id} className="flex items-center gap-2.5">
                  <span aria-hidden className="h-9 w-12 shrink-0 rounded-xl border border-black/5 shadow-card" style={{ background: f.hex }} />
                  <ColorHexInput
                    value={f.hex}
                    onChange={(hex) => patch("fundos", form.fundos.map((x) => (x.id === f.id ? { ...x, hex } : x)))}
                    paleta={form.cores}
                    disabled={!podeEditar}
                    rotulo={`Fundo ${f.label}`}
                  />
                  <label htmlFor={`fundo-${f.id}`} className="sr-only">
                    Nome do fundo
                  </label>
                  <input
                    id={`fundo-${f.id}`}
                    value={f.label}
                    onChange={(e) => patch("fundos", form.fundos.map((x) => (x.id === f.id ? { ...x, label: e.target.value } : x)))}
                    disabled={!podeEditar}
                    placeholder="Ex.: Textura azul"
                    className={cn(CAMPO, "h-9 min-w-0")}
                  />
                  {podeEditar && (
                    <BotaoRemover rotulo={`Remover o fundo ${f.label}`} onClick={() => patch("fundos", form.fundos.filter((x) => x.id !== f.id))}>
                      <X aria-hidden className="h-4 w-4" />
                    </BotaoRemover>
                  )}
                </li>
              ))}
            </ul>
            {podeEditar && (
              <BotaoLeve
                className="mt-3 self-start"
                onClick={() => patch("fundos", [...form.fundos, { id: novoId("fundo"), label: "Novo fundo", hex: "#2a397a" }])}
              >
                <Plus aria-hidden className="h-3.5 w-3.5" /> Adicionar fundo
              </BotaoLeve>
            )}
          </Secao>
        </div>
      </div>

      <Elementos form={form} patch={patch} podeEditar={podeEditar} />
    </>
  );
}

// ─── Tamanhos do logo (AbaMarca) ──────────────────────────────────────────

function TamanhosLogo({ form, patch, podeEditar }: PropsAba) {
  const [ver, setVer] = useState<Tamanho>("M");
  const t = form.tamanhosLogo;
  const valid = validarTamanhosLogo(t);
  const padrao = MARCA.tamanhosLogo;
  const ehPadrao = t.P === padrao.P && t.M === padrao.M && t.G === padrao.G;

  return (
    <Secao
      icone={<Palette aria-hidden className="h-4 w-4" />}
      titulo="Tamanhos do logo"
      ajuda="Percentuais de largura e altura do logo usados nos botões de tamanho Básico do Estúdio."
      delay={190}
    >
      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <div className="grid grid-cols-3 gap-2">
            {(["P", "M", "G"] as const).map((k) => (
              <div key={k}>
                <label htmlFor={`tam-${k}`} className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {k} (%)
                </label>
                <input
                  id={`tam-${k}`}
                  type="number"
                  min={1}
                  max={100}
                  value={t[k]}
                  onChange={(e) => patch("tamanhosLogo", { ...t, [k]: Number(e.target.value) })}
                  onFocus={() => setVer(k)}
                  disabled={!podeEditar}
                  aria-invalid={!valid.ok}
                  className={cn(CAMPO, "mt-1.5 h-9")}
                />
              </div>
            ))}
          </div>
          {!valid.ok ? (
            <p role="alert" className="mt-2 text-[11px] font-semibold text-destructive">
              {valid.motivo}
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground">
              {ehPadrao ? "Usando os valores padrão." : "Valores ajustados pelo time."}
            </p>
          )}
          {podeEditar && !ehPadrao && (
            <button
              type="button"
              onClick={() => patch("tamanhosLogo", { ...padrao })}
              className="mt-2 inline-flex items-center gap-1.5 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
            >
              <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Restaurar padrão
            </button>
          )}
        </div>

        <figure className="flex flex-col items-center gap-2">
          <div
            className="relative grid aspect-square w-32 place-items-start overflow-hidden rounded-2xl bg-primary p-2.5 shadow-card"
            aria-label={`Prévia do logo no tamanho ${ver}: ${t[ver]}% da largura`}
            role="img"
          >
            <span aria-hidden className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full border-[6px] border-accent/80" />
            <span
              aria-hidden
              className="grid place-items-center rounded-md bg-card/95 font-display font-bold text-primary transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(1, t[ver] || 1))}%`, aspectRatio: "3 / 1", fontSize: `${Math.max(6, (t[ver] || 1) / 3.2)}px` }}
            >
              {form.nome}
            </span>
          </div>
          <Pilulas
            rotulo="Tamanho na prévia"
            opcoes={[
              { id: "P", label: "P" },
              { id: "M", label: "M" },
              { id: "G", label: "G" },
            ]}
            valor={ver}
            onChange={setVer}
          />
        </figure>
      </div>
    </Secao>
  );
}

// ─── Elementos ────────────────────────────────────────────────────────────

function Elementos({ form, patch, podeEditar }: PropsAba) {
  const [novo, setNovo] = useState("");
  const adicionar = () => {
    const label = novo.trim();
    if (!label) return;
    patch("elementosImagens", [...form.elementosImagens, { label }]);
    setNovo("");
  };
  return (
    <Secao
      icone={<Shapes aria-hidden className="h-4 w-4" />}
      titulo="Elementos"
      ajuda="Grafismos, padrões, ícones recorrentes e referências visuais que compõem a marca."
      className="mt-6"
      delay={330}
    >
      <label htmlFor="marca-elementos" className="sr-only">
        Como usar os elementos
      </label>
      <textarea
        id="marca-elementos"
        rows={3}
        value={form.elementos}
        onChange={(e) => patch("elementos", e.target.value)}
        disabled={!podeEditar}
        placeholder="Descreva os elementos visuais e verbais recorrentes…"
        className={cn(CAMPO, "mt-3 resize-y leading-relaxed")}
      />
      <p className="mt-5 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Galeria de referências visuais <span className="font-sans font-normal normal-case tracking-normal">· {form.elementosImagens.length}</span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-2.5">
        {form.elementosImagens.map((el, i) => (
          <li key={`${el.label}-${i}`} className="group relative flex w-[6.5rem] flex-col items-center gap-1.5 rounded-2xl bg-card p-2 shadow-card">
            <FormaElemento label={el.label} />
            <span className="line-clamp-2 text-center text-[11px] leading-tight text-muted-foreground">{el.label}</span>
            {podeEditar && (
              <button
                type="button"
                onClick={() => patch("elementosImagens", form.elementosImagens.filter((_, j) => j !== i))}
                aria-label={`Remover ${el.label}`}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-card text-muted-foreground opacity-0 shadow-card transition-opacity duration-300 hover:text-destructive focus:opacity-100 group-hover:opacity-100"
              >
                <Trash2 aria-hidden className="h-3 w-3" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {podeEditar && (
        <div className="mt-3 flex max-w-md gap-2">
          <label htmlFor="novo-elemento" className="sr-only">
            Nome do elemento
          </label>
          <input
            id="novo-elemento"
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionar();
              }
            }}
            placeholder="Rótulo (ex.: Anel laranja)"
            className={cn(CAMPO, "h-9")}
          />
          <BotaoLeve onClick={adicionar}>
            <Plus aria-hidden className="h-3.5 w-3.5" /> Adicionar
          </BotaoLeve>
        </div>
      )}
    </Secao>
  );
}

// ─── Desenhos (no lugar dos arquivos reais) ───────────────────────────────

/** Cor de um elemento pelo nome ("laranja", "azul claro", "branco"…). */
function corPeloNome(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("laranja")) return "#ff6d2d";
  if (l.includes("azul claro")) return "#67cfee";
  if (l.includes("branco") || l.includes("negativo")) return "#ffffff";
  return "#36499b";
}

function FormaElemento({ label }: { label: string }) {
  const l = label.toLowerCase();
  const cor = corPeloNome(label);
  // Elemento branco só aparece sobre o azul.
  const fundoEscuro = cor === "#ffffff";
  let forma;
  if (l.includes("cilindro")) forma = <span className="h-11 w-5 rounded-full" style={{ background: cor }} />;
  else if (l.includes("anel")) forma = <span className="h-10 w-10 rounded-full border-[6px]" style={{ borderColor: cor }} />;
  else if (l.includes("circulo") || l.includes("círculo")) forma = <span className="h-10 w-10 rounded-full" style={{ background: cor }} />;
  else if (/\bf\b/.test(l)) forma = <span className="font-display text-4xl font-extrabold leading-none" style={{ color: cor }}>f</span>;
  else
    forma = (
      <span className="font-display text-2xl font-extrabold leading-none" style={{ color: l.includes("colorido") ? "#36499b" : cor }}>
        d<span className="text-accent">.</span>
      </span>
    );
  return (
    <span
      aria-hidden
      className={cn("grid h-14 w-full place-items-center rounded-xl", fundoEscuro ? "bg-primary" : "bg-secondary/60")}
    >
      {forma}
    </span>
  );
}

/** Logo desenhado em texto a partir do nome da versão (o protótipo não tem os arquivos). */
function LogoDesenho({
  label,
  nome,
  slogan,
  className,
  grande,
}: {
  label: string;
  nome: string;
  slogan: string;
  className?: string;
  grande?: boolean;
}) {
  const l = label.toLowerCase();
  const negativo = l.includes("branco") || l.includes("negativo");
  const icone = l.includes("icon");
  const vertical = l.includes("vertical");
  const comSlogan = l.includes("slogan");
  const tamanho = grande ? "text-4xl" : "text-sm";
  return (
    <div
      role="img"
      aria-label={`Logo: ${label}`}
      className={cn(
        "grid place-items-center overflow-hidden rounded-2xl border border-border px-3",
        negativo ? "bg-primary text-primary-foreground" : "bg-card text-primary",
        className,
      )}
    >
      {icone ? (
        <span className={cn("font-display font-extrabold leading-none", grande ? "text-6xl" : "text-xl")}>
          d<span className="text-accent">.</span>
        </span>
      ) : (
        <span className={cn("text-center font-display font-bold leading-none", tamanho)}>
          {vertical ? (
            <>
              {nome.slice(0, 4)}
              <br />
              {nome.slice(4)}
            </>
          ) : (
            nome
          )}
          <span className="text-accent">.</span>
          {comSlogan && (
            <span className={cn("mt-1 block font-sans font-semibold opacity-80", grande ? "text-sm" : "text-[7px]")}>{slogan}</span>
          )}
        </span>
      )}
    </div>
  );
}
