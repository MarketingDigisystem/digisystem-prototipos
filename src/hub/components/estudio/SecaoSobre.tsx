/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/estudio.tsx (etapa 1, Briefing) e
 *   src/hooks/use-gerar-direcao.ts @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Sobre o post" (D1).
 *
 * "Sobre o post" (o Briefing do real, linhas 12 a 19 do inventário):
 * Tema do post (Gancho), Contexto (Detalhamento adicional), Segmentos em
 * multisseleção, "Onde vai ser publicado" com as 3 redes (D1, sem YouTube),
 * "Já tenho um texto" recolhido (legenda e hashtags opcionais do real) e o
 * botão "Escrever com a IA" (Gerar direção criativa). Os CTAs saem daqui e
 * ficam só na seção Texto, um por rede (ESPEC, ponto confuso 3).
 */
import { ChevronDown } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { TextGenerateDigisystem } from "../../../TextGenerateDigisystem";
import { cn } from "../../../lib/utils";
import { campo, rotulo } from "../NovaTarefaDialog";
import { REDE_META } from "../RedeIcone";
import { REDES_ESTUDIO } from "../../store/regras";
import type { Rede } from "../../store/tipos";
import type { Editor } from "./editor";
import { Pilula, pilulaAcao } from "./partes";

export function SecaoSobre({
  ed,
  mudar,
  segmentosMarca,
  confirmarReescrever,
  onEscrever,
  onCancelarReescrever,
}: {
  ed: Editor;
  mudar: (p: Partial<Editor>) => void;
  segmentosMarca: string[];
  confirmarReescrever: boolean;
  onEscrever: (confirmado?: boolean) => void;
  onCancelarReescrever: () => void;
}) {
  const alternarSegmento = (s: string) =>
    mudar({ segmentos: ed.segmentos.includes(s) ? ed.segmentos.filter((x) => x !== s) : [...ed.segmentos, s] });
  const alternarRede = (r: Rede) =>
    mudar({ redes: ed.redes.includes(r) ? ed.redes.filter((x) => x !== r) : REDES_ESTUDIO.filter((x) => x === r || ed.redes.includes(x)) });
  const planejando = ed.geracao === "planejando";
  const preenchidos = [ed.legendaManual.trim() && "legenda", ed.hashtagsManuais.trim() && "hashtags"].filter(Boolean);

  return (
    <div className="space-y-5">
      <fieldset disabled={planejando} className="space-y-5">
        <label className="block">
          <span className={rotulo}>Tema do post</span>
          <input
            value={ed.tema}
            onChange={(e) => mudar({ tema: e.target.value })}
            placeholder="Ex: 5 sinais de que o atendimento precisa de contexto"
            className={campo}
          />
        </label>

        <label className="block">
          <span className={rotulo}>
            Contexto <span className="font-normal normal-case tracking-normal">(opcional)</span>
          </span>
          <textarea
            value={ed.contexto}
            onChange={(e) => mudar({ contexto: e.target.value })}
            rows={3}
            placeholder="O que o post precisa contar, para quem e com qual exemplo"
            className={cn(campo, "resize-none")}
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <span className={rotulo}>Segmentos</span>
            {segmentosMarca.length ? (
              <>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {segmentosMarca.map((s) => (
                    <Pilula key={s} ativa={ed.segmentos.includes(s)} onClick={() => alternarSegmento(s)}>
                      {s}
                    </Pilula>
                  ))}
                </div>
                <span className="mt-1.5 block text-[11px] text-muted-foreground">Pode escolher mais de um. Vêm da Marca.</span>
              </>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">Cadastre segmentos em Marca → Identidade para escolher aqui.</p>
            )}
          </div>

          <div>
            <span className={rotulo}>Onde vai ser publicado</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {REDES_ESTUDIO.map((r) => {
                const { Icone, label } = REDE_META[r];
                return (
                  <Pilula key={r} ativa={ed.redes.includes(r)} onClick={() => alternarRede(r)}>
                    <Icone aria-hidden className="h-3.5 w-3.5" /> {label}
                  </Pilula>
                );
              })}
            </div>
            <span className={cn("mt-1.5 block text-[11px]", ed.redes.length ? "text-muted-foreground" : "font-semibold text-warning")}>
              {ed.redes.length ? "A IA sugere uma chamada para cada rede escolhida." : "Escolha pelo menos uma rede."}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/40">
          <button
            type="button"
            onClick={() => mudar({ jaTenhoTextoAberto: !ed.jaTenhoTextoAberto })}
            aria-expanded={ed.jaTenhoTextoAberto}
            aria-controls="ja-tenho-texto"
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <span>
              <span className="block font-display text-sm font-bold text-primary">Já tenho um texto</span>
              <span className="block text-[11px] text-muted-foreground">
                {preenchidos.length
                  ? `Preenchido: ${preenchidos.join(" e ")}.`
                  : "Opcional. Se você já escreveu a legenda ou as hashtags, cole aqui."}
              </span>
            </span>
            <ChevronDown aria-hidden className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300", ed.jaTenhoTextoAberto && "rotate-180")} />
          </button>
          {ed.jaTenhoTextoAberto && (
            <div id="ja-tenho-texto" className="animate-rise space-y-4 px-4 pb-4">
              <label className="block">
                <span className={rotulo}>Legenda</span>
                <textarea
                  value={ed.legendaManual}
                  onChange={(e) => mudar({ legendaManual: e.target.value })}
                  rows={3}
                  placeholder="Sua legenda. Na seção Texto ela aparece como Sua versão, ao lado da sugestão da IA."
                  className={cn(campo, "resize-none")}
                />
              </label>
              <label className="block">
                <span className={rotulo}>Hashtags</span>
                <input
                  value={ed.hashtagsManuais}
                  onChange={(e) => mudar({ hashtagsManuais: e.target.value, hashtagsVieramDaTendencia: false })}
                  placeholder="#Atendimentoaocliente #Omnichannel"
                  className={campo}
                />
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {ed.hashtagsVieramDaTendencia ? "Vieram da tendência, sem IA. Edite ou apague. " : ""}
                  Separadas por espaço. As hashtags escritas aqui já entram aprovadas.
                </span>
              </label>
            </div>
          )}
        </div>
      </fieldset>

      {confirmarReescrever && (
        <div role="alertdialog" aria-labelledby="reescrever-titulo" className="animate-rise rounded-2xl border border-warning/40 bg-warning-soft p-4">
          <p id="reescrever-titulo" className="font-display text-sm font-bold text-primary">
            Escrever de novo com a IA?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/80">
            A legenda da IA, as hashtags e as chamadas são trocadas pelas sugestões novas e voltam a pedir aprovação. A sua versão da
            legenda continua guardada.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onEscrever(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-display text-xs font-bold text-primary-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5"
            >
              <IaDigisystem size={18} /> Escrever de novo
            </button>
            <button type="button" onClick={onCancelarReescrever} className={pilulaAcao}>
              Manter o que está
            </button>
          </div>
        </div>
      )}

      {planejando ? (
        <div className="gerando-aurora animate-rise flex flex-col items-center gap-3 px-6 py-10 text-center">
          <IaDigisystem size={64} estado="processando" />
          <TextGenerateDigisystem texto="Escrevendo a legenda, as hashtags e as chamadas." className="font-display text-base font-bold text-white" />
          <p className="text-xs text-white/75">Leva alguns segundos. A IA lê o que você escreveu e a Marca.</p>
        </div>
      ) : (
        !confirmarReescrever && (
          <button
            type="button"
            onClick={() => onEscrever()}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary px-5 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
          >
            <IaDigisystem size={26} />
            {ed.geracao === "pronto" ? "Escrever de novo com a IA" : "Escrever com a IA"}
          </button>
        )
      )}
    </div>
  );
}
