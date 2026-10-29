// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// AGENTE-MOLÉCULA — ÚNICO ponto de IA na etapa Geração do Estúdio. Acompanha o
// scroll e muda as ações conforme a seção em foco (Direção Criativa / Arte).
//
// v3 (2026-09-22): refino de UX pedido pelo usuário —
//   - cabeçalho MENOS "carimbo de IA" (rótulo discreto, sem faixa gradiente forte);
//   - título da seção com efeito de "escrever" (TextGenerateDigisystem), re-toca
//     ao trocar de seção → a troca de conteúdo deixa de ser abrupta;
//   - conteúdo do painel com transição suave (fade/slide) ao mudar de seção;
//   - opções sem sombra pesada (menos cara de card de bot);
//   - glow atrás da molécula alternando laranja↔azul da marca, sutil.
//
// Design autoral — NÃO é balãozinho de chat/bot. É a própria molécula solta,
// pairando. Reusa IaDigisystem (estados vivo/processando).

import { IaDigisystem, type IaEstado } from "@/IaDigisystem";
import { TextGenerateDigisystem } from "@/TextGenerateDigisystem";
import { cn } from "@/lib/utils";

/** Ação simples (um clique executa). */
export type AcaoAgente = { id: string; label: string; descricao?: string };

/** Campo com toggle (o usuário escolhe se o agente preenche ou não). */
export type CampoToggle = { id: string; label: string; ligado: boolean };

/** Conteúdo do painel para a seção atual. */
export type PainelAgente = {
  secaoLabel: string;
  /** Frase curta explicando o que o agente faz nesta seção. */
  intro?: string;
  /** Ações diretas (regenerar legenda, gerar imagem, montar carrossel…). */
  acoes: AcaoAgente[];
  /** Bloco opcional de campos-toggle (ex.: textos da arte no estático/blog). */
  toggles?: {
    titulo: string;
    campos: CampoToggle[];
    acaoLabel: string; // ex.: "Escrever textos selecionados"
    acaoId: string;
  };
};

export function AgenteMolecula({
  estado,
  aberto,
  onToggle,
  painel,
  onAcao,
  onToggleCampo,
  ocupado,
}: {
  estado: IaEstado;
  aberto: boolean;
  onToggle: () => void;
  painel: PainelAgente;
  onAcao: (id: string) => void;
  onToggleCampo: (id: string) => void;
  ocupado: boolean;
}) {
  const algumLigado = painel.toggles?.campos.some((c) => c.ligado) ?? false;

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-8 right-8 z-40 flex flex-col items-end gap-4",
        estado === "processando" && "agente-processando",
      )}
    >
      {aberto && (
        <div className="agente-painel pointer-events-auto w-80 overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-[var(--shadow-float)] backdrop-blur-md">
          {/* Cabeçalho discreto — o rótulo "Agente" é sutil (não carimbo de IA).
              O título da seção é "escrito" (re-toca ao trocar de seção). */}
          <div className="border-b border-border/60 px-4 py-3">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Agente
            </p>
            <TextGenerateDigisystem
              key={`titulo-${painel.secaoLabel}`}
              remontarKey={painel.secaoLabel}
              texto={painel.secaoLabel}
              className="mt-0.5 font-display text-base font-bold text-primary"
            />
            {painel.intro && (
              <TextGenerateDigisystem
                key={`intro-${painel.secaoLabel}`}
                remontarKey={painel.secaoLabel}
                texto={painel.intro}
                className="mt-1 text-[11px] text-muted-foreground"
              />
            )}
          </div>

          {/* Conteúdo — a key por seção faz o bloco re-animar (fade/slide) na troca,
              evitando a mudança abrupta ao rolar de uma seção para outra. */}
          <div key={painel.secaoLabel} className="agente-conteudo p-2.5">
            {ocupado ? (
              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                <IaDigisystem size={52} estado="processando" />
                <p className="font-display text-sm font-bold text-primary">Trabalhando nisso…</p>
                <p className="text-[11px] text-muted-foreground">Já preencho aqui na tela para você.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Ações diretas: sem mini-círculo fixo; o realce (glow laranja
                    à esquerda) aparece só no HOVER. Rótulo e descrição entram com
                    o efeito de "escrever" ao trocar de seção. */}
                {painel.acoes.length > 0 && (
                  <ul className="space-y-0.5">
                    {painel.acoes.map((a) => (
                      <li key={`${painel.secaoLabel}-${a.id}`}>
                        <button
                          type="button"
                          onClick={() => onAcao(a.id)}
                          className="agente-acao group relative flex w-full flex-col gap-0.5 rounded-2xl px-3.5 py-2.5 text-left transition-colors hover:bg-orange-soft/60"
                        >
                          <TextGenerateDigisystem
                            key={`lbl-${painel.secaoLabel}-${a.id}`}
                            remontarKey={`${painel.secaoLabel}-${a.id}`}
                            texto={a.label}
                            className="font-display text-[13px] font-bold text-primary"
                          />
                          {a.descricao && (
                            <TextGenerateDigisystem
                              key={`desc-${painel.secaoLabel}-${a.id}`}
                              remontarKey={`${painel.secaoLabel}-${a.id}`}
                              texto={a.descricao}
                              className="text-[11px] leading-snug text-muted-foreground"
                            />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Bloco de toggles (textos da arte no estático/blog) — sem sombras.
                    Título, instrução e rótulos dos campos entram com o efeito de
                    escrever, re-tocando ao trocar de seção/estilo. */}
                {painel.toggles && (
                  <div className="rounded-2xl border border-border/60 bg-secondary/25 p-3">
                    <TextGenerateDigisystem
                      key={`tg-titulo-${painel.secaoLabel}`}
                      remontarKey={painel.secaoLabel}
                      texto={painel.toggles.titulo}
                      className="font-display text-[11px] font-bold uppercase tracking-wide text-primary"
                    />
                    <TextGenerateDigisystem
                      key={`tg-instr-${painel.secaoLabel}`}
                      remontarKey={painel.secaoLabel}
                      texto="Escolha o que o agente deve escrever."
                      className="mt-0.5 text-[11px] text-muted-foreground"
                    />
                    <div className="mt-2.5 space-y-1.5">
                      {painel.toggles.campos.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onToggleCampo(c.id)}
                          className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-3 py-2 text-left transition-colors hover:border-accent/30"
                        >
                          <TextGenerateDigisystem
                            key={`tg-campo-${painel.secaoLabel}-${c.id}`}
                            remontarKey={painel.secaoLabel}
                            texto={c.label}
                            className="font-display text-[13px] font-bold text-primary"
                          />
                          {/* Pill toggle (padrão de marca, não switch solto) */}
                          <span
                            className={cn(
                              "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                              c.ligado ? "bg-accent" : "bg-muted",
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-0.5 h-4 w-4 rounded-full bg-card transition-all",
                                c.ligado ? "left-[18px]" : "left-0.5",
                              )}
                            />
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={!algumLigado}
                      onClick={() => onAcao(painel.toggles!.acaoId)}
                      className="mt-3 w-full rounded-2xl bg-accent px-4 py-2.5 font-display text-xs font-bold text-accent-foreground transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {painel.toggles.acaoLabel}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* A molécula flutuante — o "corpo" do agente. Glow alterna laranja↔azul. */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={aberto ? "Fechar o agente Digisystem" : "Abrir o agente Digisystem"}
        aria-expanded={aberto}
        className="agente-float pointer-events-auto relative grid place-items-center rounded-full p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <span className="agente-glow" aria-hidden />
        <IaDigisystem
          size={80}
          estado={estado}
          className="relative drop-shadow-[0_8px_18px_oklch(0.45_0.15_268/35%)]"
        />
      </button>
    </div>
  );
}
