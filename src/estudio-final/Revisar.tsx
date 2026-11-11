// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/components/estudio/EnviarSecao.tsx, PainelParecerPost.tsx, BrandComplianceCard.tsx,
//   TelaConclusao.tsx, src/lib/estudio-regras.ts (R-EST-7) @ leitura 2026-10 (clone mhdgst-trabalho,
//   somente leitura). Fonte da verdade = clone real.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md (rodada 4, item 5)
//
// Refino pós-feedback: 2 colunas, sem trilho, Briefing (2026-11-04). Esta coluna (Parecer + envio) fica à
//   DIREITA da prévia por rede (PortalPreview), que agora mora só nesta etapa.
//
// Etapa 3 (Revisar e enviar): Parecer da IA (símbolo COMPLETO enquanto analisa, depois cartão de resultado
// com prontidão e veredito), observação, agendamento em pills, Exportar (loader discreto) e a lista de
// pendências. O parecer é calculado a partir do estado real da tela (mock de regras de marca).
//
// Refino pós-feedback 2: exportar SVG, carregamento IA, acervo, seleção larga, botões de continuidade,
//   parecer, sem ícone de rede (2026-11-04). Aqui:
//   • Parecer ANALISANDO: símbolo cheio + frases curtas que mudam (o que está sendo conferido) + barra fina
//     de progresso por etapa. RESULTADO: anel de prontidão com % em contagem crescente, título de veredito
//     (“Dentro da identidade” / “Vale ajustar antes de enviar”), grupos “O que vale ajustar” (com ação
//     curta “Ir para…”) e “O que está bom”, entrada escalonada dos itens. “Analisar de novo” fica sempre no
//     mesmo lugar (desabilitado enquanto analisa). Movimento reduzido: sem contagem e sem escalonamento.
//   • Exportar: sem PNG; “Exportar SVG” é a principal e, no carrossel, “Baixar .zip”.
import { AlertTriangle, ArrowRight, Calendar, Check, CircleCheck, Download, FileArchive, Send } from "lucide-react";
import { cn } from "../lib/utils";
import { IaDigisystem } from "../IaDigisystem";
import { BotaoExportar } from "./Gaveta";
import { CARD, FOCO, PillPar, ROTULO, Spinner, useContagem, useFraseRotativa } from "./ui";

export type Pendencia = { rotulo: string; ok: boolean; bloqueia: boolean };

export type AlvoAjuste = "titulo" | "subtitulo" | "legenda" | "hashtags" | "imagem";
export type AvisoParecer = { texto: string; acao?: { rotulo: string; alvo: AlvoAjuste } };
export type ResultadoParecer = { pct: number; ok: boolean; acertos: string[]; avisos: AvisoParecer[] };

const FASES_PARECER = ["Lendo a legenda e o CTA", "Conferindo as hashtags oficiais", "Olhando a paleta e a tipografia da arte", "Medindo o título e o subtítulo"];

function AnelProntidao({ pct, ok }: { pct: number; ok: boolean }) {
  const v = useContagem(pct, true, 950);
  const r = 34;
  const c = 2 * Math.PI * r;
  const cor = ok ? "var(--success)" : "#e0a02b";
  return (
    <div className="relative h-[5.5rem] w-[5.5rem] shrink-0" role="img" aria-label={`Prontidão ${pct}%`}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--secondary)" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={cor} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
      </svg>
      <span aria-hidden className="absolute inset-0 grid place-items-center">
        <span className="text-center leading-none">
          <span className="block font-display text-xl font-bold tabular-nums text-primary">{v}%</span>
          <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">pronto</span>
        </span>
      </span>
    </div>
  );
}

export function ParecerIA({
  fase,
  resultado,
  onReanalisar,
  onIrPara,
}: {
  fase: "analisando" | "pronto";
  resultado: ResultadoParecer;
  onReanalisar: () => void;
  onIrPara: (alvo: AlvoAjuste) => void;
}) {
  const analisando = fase === "analisando";
  const passo = useFraseRotativa(FASES_PARECER.length, analisando, 650);
  return (
    <section aria-labelledby="ef-parecer" className={cn(CARD, analisando && "ia-borda-analise")} aria-busy={analisando}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="ef-parecer" className="font-display text-lg font-bold text-primary">Parecer da IA</h2>
        {/* sempre no mesmo lugar: desabilitado enquanto analisa (sem controle que aparece e some) */}
        <button
          type="button"
          onClick={onReanalisar}
          disabled={analisando}
          className={cn("min-w-[8.5rem] rounded-full bg-secondary px-3 py-1.5 font-display text-[11px] font-bold text-primary hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50", FOCO)}
        >
          Analisar de novo
        </button>
      </div>
      {/* altura mínima reservada para a análise e o resultado não deslocarem o resto */}
      <div className="mt-3 min-h-[17rem]">
        {analisando ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <IaDigisystem size={88} estado="processando" />
            <p className="mt-3 font-display text-sm font-bold text-primary">Conferindo o post com a identidade da marca</p>
            <p className="mt-1 h-4 text-xs text-[#36499b]/80" role="status" aria-live="polite">
              <span key={passo} className="ef-status-troca inline-block">{FASES_PARECER[passo]}</span>
            </p>
            <div className="mt-4 flex w-full max-w-[14rem] gap-1.5" aria-hidden>
              {FASES_PARECER.map((_, i) => (
                <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-[#36499b]/12">
                  <span className={cn("block h-full rounded-full bg-[#36499b] transition-[width] duration-500 ease-out motion-reduce:transition-none", i <= passo ? "w-full" : "w-0")} />
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Leva poucos segundos. Nada é alterado no seu post.</p>
          </div>
        ) : (
          <ResultadoParecerCartao resultado={resultado} onIrPara={onIrPara} />
        )}
      </div>
    </section>
  );
}

function ResultadoParecerCartao({ resultado, onIrPara }: { resultado: ResultadoParecer; onIrPara: (alvo: AlvoAjuste) => void }) {
  const n = resultado.avisos.length;
  let ordem = 0;
  const atraso = () => ({ animationDelay: `${180 + ordem++ * 70}ms` });
  return (
    <div className="parecer-settle">
      <div className="flex flex-wrap items-center gap-4">
        <AnelProntidao pct={resultado.pct} ok={resultado.ok} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold leading-tight text-primary">{resultado.ok ? "Dentro da identidade" : "Vale ajustar antes de enviar"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {resultado.ok
              ? "O post segue o tom, a paleta e as hashtags da marca. Pode enviar."
              : n === 1
                ? "Encontrei 1 ponto para olhar. Dá para enviar assim, mas a aprovação tende a ser mais rápida com ele resolvido."
                : `Encontrei ${n} pontos para olhar. Dá para enviar assim, mas a aprovação tende a ser mais rápida com eles resolvidos.`}
          </p>
        </div>
      </div>

      {n > 0 && (
        <div className="mt-4">
          <h3 className="font-display text-[11px] font-bold uppercase tracking-wider text-[#8a5a00]">O que vale ajustar</h3>
          <ul className="mt-1.5 space-y-1.5">
            {resultado.avisos.map((a) => (
              <li key={a.texto} className="ef-entra flex flex-wrap items-start gap-x-2 gap-y-1 rounded-2xl bg-[var(--warning-soft)] px-3 py-2 text-xs text-[#6b4700]" style={atraso()}>
                <AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1">{a.texto}</span>
                {a.acao && (
                  <button
                    type="button"
                    onClick={() => onIrPara(a.acao!.alvo)}
                    className={cn("group inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 font-display text-[11px] font-bold text-[#36499b] underline-offset-2 hover:underline", FOCO)}
                  >
                    {a.acao.rotulo}
                    <ArrowRight aria-hidden className="h-3 w-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {resultado.acertos.length > 0 && (
        <div className="mt-4">
          <h3 className="font-display text-[11px] font-bold uppercase tracking-wider text-[#2f8a57]">O que está bom</h3>
          <ul className="mt-1.5 space-y-1">
            {resultado.acertos.map((a) => (
              <li key={a} className="ef-entra flex items-start gap-2 px-1 text-xs text-foreground/80" style={atraso()}>
                <CircleCheck aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--success)]" /> {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function EnviarSecao({
  pendencias,
  carrossel,
  observacao,
  setObservacao,
  modo,
  setModo,
  data,
  setData,
  enviando,
  enviado,
  onEnviar,
  onNovo,
}: {
  pendencias: Pendencia[];
  carrossel: boolean;
  observacao: string;
  setObservacao: (v: string) => void;
  modo: "aprovacao" | "agendar";
  setModo: (v: "aprovacao" | "agendar") => void;
  data: string;
  setData: (v: string) => void;
  enviando: boolean;
  enviado: boolean;
  onEnviar: () => void;
  onNovo: () => void;
}) {
  const bloqueios = pendencias.filter((p) => !p.ok && p.bloqueia);
  const podeEnviar = bloqueios.length === 0 && !enviando;

  if (enviado) {
    return (
      <section className={CARD} aria-live="polite">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--success)] text-white">
            <Check aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-primary">{modo === "agendar" ? "Post enviado com data sugerida" : "Post enviado para aprovação"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Está em Meus posts. Quem aprova recebe um aviso agora.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={cn("rounded-full bg-[#36499b] px-4 py-2 font-display text-xs font-bold text-white", FOCO)}>Ir para Meus posts</button>
              <button type="button" onClick={onNovo} className={cn("rounded-full bg-secondary px-4 py-2 font-display text-xs font-bold text-primary", FOCO)}>Criar outro post</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={CARD} aria-labelledby="ef-enviar">
      <h2 id="ef-enviar" className="font-display text-lg font-bold text-primary">Enviar</h2>
      <p className="mt-1 text-xs text-muted-foreground">Revise as pendências, deixe um recado para quem aprova e envie.</p>

      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2" aria-label="Pendências">
        {pendencias.map((p) => (
          <li
            key={p.rotulo}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-xs",
              p.ok ? "bg-[var(--sky-soft)] text-primary" : p.bloqueia ? "bg-[var(--orange-soft)] text-[#c24a12]" : "bg-secondary text-muted-foreground",
            )}
          >
            {p.ok ? <Check aria-hidden className="h-3.5 w-3.5 shrink-0" /> : <span aria-hidden className="grid h-3.5 w-3.5 shrink-0 place-items-center font-bold">*</span>}
            <span className="font-display font-bold">{p.rotulo}</span>
            <span className="sr-only">{p.ok ? " pronto" : p.bloqueia ? " pendente, impede o envio" : " opcional"}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <label htmlFor="ef-obs" className={ROTULO}>Observação para quem aprova (opcional)</label>
        <textarea
          id="ef-obs"
          rows={2}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Ex: prazo de publicação na quinta; arte pode ser ajustada pelo designer."
          className={cn("mt-1.5 w-full resize-y rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm", FOCO)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PillPar rotulo="Como enviar" valor={modo} onChange={setModo} opcoes={[{ id: "aprovacao", label: "Enviar à aprovação" }, { id: "agendar", label: "Sugerir data" }]} />
        {modo === "agendar" && (
          <label className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 font-display text-xs font-bold text-primary">
            <Calendar aria-hidden className="h-4 w-4" />
            <span className="sr-only">Data sugerida</span>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="bg-transparent text-xs outline-none" />
          </label>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!podeEnviar}
          onClick={onEnviar}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-[#ff6d2d] px-5 py-2.5 font-display text-xs font-bold text-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            FOCO,
          )}
        >
          {enviando ? <Spinner /> : <Send aria-hidden className="h-4 w-4" />}
          {enviando ? "Enviando…" : modo === "agendar" ? "Enviar com data sugerida" : "Enviar para aprovação"}
        </button>
        <BotaoExportar principal className="min-w-[8.5rem]" icone={<Download aria-hidden className="h-4 w-4" />} rotulo="Exportar SVG" />
        {carrossel && <BotaoExportar className="min-w-[8rem]" icone={<FileArchive aria-hidden className="h-4 w-4" />} rotulo="Baixar .zip" />}
      </div>
      {!podeEnviar && !enviando && (
        <p className="mt-2 text-[11px] text-[#c24a12]" role="status">
          Falta: {bloqueios.map((b) => b.rotulo.toLowerCase()).join(", ")}.
        </p>
      )}
    </section>
  );
}
