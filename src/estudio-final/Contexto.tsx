// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/components/estudio/SobreOPost.tsx, IndicadorObrigatorios.tsx, SeletorRedes.tsx,
//   ResumoPost.tsx @ leitura 2026-10 (clone mhdgst-trabalho, somente leitura). Fonte da verdade = clone real.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
// Refino pós-feedback: 2 colunas, sem trilho, Briefing (2026-11-04). O trilho de etapas SAIU deste arquivo
//   (o usuário não sentiu falta); a primeira etapa passou a se chamar “Briefing”.
// Refino pós-feedback 2: exportar SVG, carregamento IA, acervo, seleção larga, botões de continuidade,
//   parecer, sem ícone de rede (2026-11-04). Aqui: “Escrever com a IA” virou BotaoContinuidade (laranja,
//   marca da IA em repouso num chip claro; loader discreto dentro do botão enquanto escreve).
//
// Refino pós-feedback 3 (2026-11-04): o BotaoContinuidade “Escrever com a IA” foi trocado pelo componente 07
//   adaptado (escrever-ia/: checklist + cartão-botão + progresso na borda + cancelar + sucesso + erro).
//
// Etapa 1 (Briefing): Espaço*, tema*, redes* (IG/LI/FB, Instagram pré-marcado), contexto, segmentos,
// “Já tenho um texto” e o indicador PERSISTENTE de obrigatórios. ResumoPost fica na coluna da direita.
import { Check, ChevronDown, Facebook, Instagram, Linkedin } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { type RedeId, ESPACOS, REDES, SEGMENTOS } from "./efData";
import { CARD, FOCO, ROTULO } from "./ui";
import { EscreverIA } from "./escrever-ia/EscreverIA";
import type { AIGeneration } from "./escrever-ia/useAIGeneration";

const ICONE = { instagram: Instagram, linkedin: Linkedin, facebook: Facebook } as const;

function IndicadorObrigatorios({ campos }: { campos: { rotulo: string; preenchido: boolean }[] }) {
  const faltam = campos.filter((c) => !c.preenchido).length;
  return (
    <div className="mt-4" role="group" aria-label="Campos obrigatórios do briefing">
      <div className="flex flex-wrap items-center gap-2">
        {campos.map((c) => (
          <span
            key={c.rotulo}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[11px] font-bold",
              c.preenchido ? "bg-[var(--sky-soft)] text-primary" : "bg-[var(--orange-soft)] text-[#c24a12]",
            )}
          >
            {c.preenchido ? <Check aria-hidden className="h-3 w-3" /> : <span aria-hidden className="leading-none">*</span>}
            {c.rotulo}
            <span className="sr-only">{c.preenchido ? " preenchido" : " obrigatório, pendente"}</span>
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground" aria-live="polite">
        {faltam === 0 ? "Briefing completo. Os demais campos são opcionais." : `Campos com * são obrigatórios. Faltam ${faltam} para continuar.`}
      </p>
    </div>
  );
}

export function Briefing({
  espaco,
  setEspaco,
  tema,
  setTema,
  redes,
  setRedes,
  contexto,
  setContexto,
  segmentos,
  setSegmentos,
  escrita,
  onRevisar,
}: {
  espaco: string | null;
  setEspaco: (v: string) => void;
  tema: string;
  setTema: (v: string) => void;
  redes: RedeId[];
  setRedes: (v: RedeId[]) => void;
  contexto: string;
  setContexto: (v: string) => void;
  segmentos: string[];
  setSegmentos: (v: string[]) => void;
  escrita: AIGeneration;
  onRevisar: () => void;
}) {
  const [textoProprio, setTextoProprio] = useState(false);
  const campos = [
    { rotulo: "Espaço", preenchido: !!espaco },
    { rotulo: "Tema", preenchido: tema.trim().length > 0 },
    { rotulo: "Rede", preenchido: redes.length > 0 },
  ];
  const alternarRede = (id: RedeId) => setRedes(redes.includes(id) ? redes.filter((r) => r !== id) : [...redes, id]);
  const alternarSeg = (s: string) => setSegmentos(segmentos.includes(s) ? segmentos.filter((x) => x !== s) : [...segmentos, s]);

  return (
    <section className={CARD} aria-labelledby="ef-briefing-h">
      <h2 id="ef-briefing-h" className="font-display text-lg font-bold text-primary">Briefing</h2>
      <p className="mt-1 text-xs text-muted-foreground">Conte o essencial. A IA escreve o texto a partir daqui.</p>

      <div className="mt-4" role="group" aria-labelledby="ef-espaco">
        <span id="ef-espaco" className={ROTULO}>Espaço <span className="text-[#c24a12]">*</span></span>
        <p className="mt-1 text-xs text-muted-foreground">Define onde o post fica no hub.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ESPACOS.map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={espaco === e}
              onClick={() => setEspaco(e)}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-display text-xs font-bold transition-colors motion-reduce:transition-none",
                FOCO,
                espaco === e ? "bg-[#36499b] text-white" : "bg-secondary text-primary hover:bg-secondary/70",
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 block">
        <span className={ROTULO}>Tema do post <span className="text-[#c24a12]">*</span></span>
        <input
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: 5 sinais para automatizar"
          className={cn("mt-1.5 h-10 w-full rounded-2xl border border-border bg-card px-3.5 text-sm text-foreground", FOCO)}
        />
      </label>

      <div className="mt-4" role="group" aria-labelledby="ef-redes">
        <span id="ef-redes" className={ROTULO}>Onde publicar <span className="text-[#c24a12]">*</span></span>
        <div className="mt-2 flex flex-wrap gap-2">
          {REDES.map((r) => {
            const Ic = ICONE[r.id];
            const sel = redes.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={sel}
                onClick={() => alternarRede(r.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-display text-xs font-bold transition-colors motion-reduce:transition-none",
                  FOCO,
                  sel ? "bg-[#36499b] text-white" : "bg-secondary text-primary hover:bg-secondary/70",
                )}
              >
                <Ic aria-hidden className="h-3.5 w-3.5" /> {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-4 block">
        <span className={ROTULO}>Contexto (opcional)</span>
        <textarea
          value={contexto}
          onChange={(e) => setContexto(e.target.value)}
          rows={3}
          placeholder="Descreva o post: pontos-chave, ângulo, insights, referências…"
          className={cn("mt-1.5 w-full resize-y rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground", FOCO)}
        />
      </label>

      <div className="mt-4" role="group" aria-labelledby="ef-seg">
        <span id="ef-seg" className={ROTULO}>Segmentos (opcional)</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {SEGMENTOS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={segmentos.includes(s)}
              onClick={() => alternarSeg(s)}
              className={cn(
                "rounded-full px-3 py-1 font-display text-xs font-bold transition-colors motion-reduce:transition-none",
                FOCO,
                segmentos.includes(s) ? "bg-[var(--sky)] text-[#1f2a44]" : "bg-secondary text-primary hover:bg-secondary/70",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border">
        <button type="button" aria-expanded={textoProprio} onClick={() => setTextoProprio((v) => !v)} className={cn("flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left", FOCO)}>
          <span className="font-display text-sm font-bold text-primary">Já tenho um texto</span>
          <ChevronDown aria-hidden className={cn("h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none", textoProprio && "rotate-180")} />
        </button>
        {textoProprio && (
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground">Cole a legenda e as hashtags. Se deixar em branco, a IA gera uma sugestão.</p>
            <textarea rows={3} aria-label="Legenda própria (opcional)" placeholder="Legenda (opcional)" className={cn("mt-2 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm", FOCO)} />
          </div>
        )}
      </div>

      <IndicadorObrigatorios campos={campos} />

      {/* “Escrever com a IA” (componente 07 adaptado): checklist à esquerda + cartão-botão à direita, tamanho
          fixo. A geração (estado compartilhado) vive em EstudioFinal; o agente dispara a MESMA geração. */}
      <EscreverIA escrita={escrita} tema={tema} redes={redes} faltam={campos.filter((c) => !c.preenchido).map((c) => c.rotulo)} onRevisar={onRevisar} />
    </section>
  );
}

export function ResumoPost({ espaco, redes, segmentos }: { espaco: string | null; redes: RedeId[]; segmentos: string[] }) {
  return (
    <section aria-labelledby="ef-resumo" className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 id="ef-resumo" className="font-display text-base font-bold text-primary">Resumo do briefing</h2>
      <dl className="mt-3 space-y-2.5 text-sm">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Espaço</dt>
          <dd className="text-foreground">{espaco || "Ainda não escolhido"}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Onde</dt>
          <dd className="mt-0.5 flex flex-wrap gap-1.5">
            {redes.length === 0 ? (
              <span className="text-muted-foreground">Ainda não escolhido</span>
            ) : (
              REDES.filter((r) => redes.includes(r.id)).map((r) => {
                const Ic = ICONE[r.id];
                return (
                  <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-display text-[11px] font-bold text-primary">
                    <Ic aria-hidden className="h-3 w-3" /> {r.label}
                  </span>
                );
              })
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Segmentos</dt>
          <dd className="text-foreground">{segmentos.length ? segmentos.join(", ") : "Nenhum"}</dd>
        </div>
      </dl>
      <p className="mt-4 rounded-2xl bg-[var(--sky-soft)] px-3 py-2.5 text-xs text-primary">
        Em Conteúdo você ajusta o texto e a arte. Em Revisar e enviar você vê como o post fica em cada rede.
      </p>
    </section>
  );
}
