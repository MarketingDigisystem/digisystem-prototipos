// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/components/estudio/AgenteMolecula.tsx + classes `agente-*` de src/styles.css do clone
//   real (mhdgst-trabalho) @ leitura 2026-10. Fonte da verdade = clone real.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
//
// O visual do agente é IDÊNTICO ao de produção hoje: molécula de 80px flutuando em `fixed bottom-8
// right-8`, sem balão por trás, com o painel `agente-painel` aberto acima dela. Só o MENU ganha itens
// (texto + imagem + montar carrossel + textos da arte + descrever imagem). Clique fora e Esc recolhem.
import { useEffect, useRef, useState } from "react";
import { IaDigisystem, type IaEstado } from "../IaDigisystem";
import { TextGenerateDigisystem } from "../TextGenerateDigisystem";
import { cn } from "../lib/utils";

export type AcaoAgente = { id: string; label: string; descricao?: string; grupo?: string };
export type CampoToggle = { id: string; label: string; ligado: boolean };
export type PainelAgente = {
  secaoLabel: string;
  intro?: string;
  acoes: AcaoAgente[];
  toggles?: { titulo: string; campos: CampoToggle[]; acaoLabel: string; acaoId: string };
};

export function AgenteFinal({
  estado,
  aberto,
  onToggle,
  onFechar,
  painel,
  onAcao,
  onToggleCampo,
  ocupado,
}: {
  estado: IaEstado;
  aberto: boolean;
  onToggle: () => void;
  onFechar: () => void;
  painel: PainelAgente;
  onAcao: (id: string) => void;
  onToggleCampo: (id: string) => void;
  ocupado: boolean;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const algumLigado = painel.toggles?.campos.some((c) => c.ligado) ?? false;

  // Clique fora e Esc recolhem o menu (decisão da rodada 2).
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) onFechar();
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto, onFechar]);

  return (
    <div
      ref={raiz}
      className={cn(
        "pointer-events-none fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-4 sm:bottom-8 sm:right-8",
        estado === "processando" && "agente-processando",
      )}
    >
      {aberto && (
        <div
          role="dialog"
          aria-label="Agente Digisystem"
          className="agente-painel pointer-events-auto max-h-[min(70dvh,640px)] w-80 max-w-full overflow-y-auto rounded-3xl border border-border/70 bg-card/95 shadow-[var(--shadow-float)] backdrop-blur-md"
        >
          <div className="border-b border-border/60 px-4 py-3">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Agente</p>
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
          <div key={painel.secaoLabel} className="agente-conteudo p-2.5">
            {ocupado ? (
              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                <IaDigisystem size={52} estado="processando" />
                <p className="font-display text-sm font-bold text-primary">Trabalhando nisso…</p>
                <p className="text-[11px] text-muted-foreground">Já preencho aqui na tela para você.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {painel.acoes.length > 0 && (
                  <ul className="space-y-0.5">
                    {painel.acoes.map((a, i) => (
                      <li key={`${painel.secaoLabel}-${a.id}`}>
                        {a.grupo && painel.acoes[i - 1]?.grupo !== a.grupo && (
                          <p className="px-3.5 pb-0.5 pt-2 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            {a.grupo}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => onAcao(a.id)}
                          className="agente-acao group relative flex w-full flex-col gap-0.5 rounded-2xl px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--orange-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--navy)]"
                        >
                          <span className="font-display text-[13px] font-bold text-primary">{a.label}</span>
                          {a.descricao && <span className="text-[11px] leading-snug text-muted-foreground">{a.descricao}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {painel.toggles && (
                  <div className="rounded-2xl border border-border/60 bg-secondary/25 p-3">
                    <p className="font-display text-[11px] font-bold uppercase tracking-wide text-primary">{painel.toggles.titulo}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Escolha o que o agente deve escrever.</p>
                    <div className="mt-2.5 space-y-1.5">
                      {painel.toggles.campos.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          role="switch"
                          aria-checked={c.ligado}
                          onClick={() => onToggleCampo(c.id)}
                          className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-3 py-2 text-left transition-colors hover:border-[var(--orange)]/30"
                        >
                          <span className="font-display text-[13px] font-bold text-primary">{c.label}</span>
                          <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", c.ligado ? "bg-accent" : "bg-muted")}>
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
      <BotaoFlutuante estado={estado} aberto={aberto} onToggle={onToggle} />
    </div>
  );
}

function BotaoFlutuante({ estado, aberto, onToggle }: { estado: IaEstado; aberto: boolean; onToggle: () => void }) {
  const [clique, setClique] = useState(0);
  return (
    <button
      type="button"
      onClick={() => {
        setClique((n) => n + 1);
        onToggle();
      }}
      aria-label={aberto ? "Fechar o agente Digisystem" : "Abrir o agente Digisystem"}
      aria-expanded={aberto}
      className="agente-float pointer-events-auto relative grid place-items-center rounded-full p-1 transition-transform duration-200 hover:scale-110 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]/60"
    >
      <span className="agente-glow-a" aria-hidden />
      <span className="agente-glow-b" aria-hidden />
      {clique > 0 && (
        <span key={clique} className="contents">
          <span className="agente-onda-1" aria-hidden />
          <span className="agente-onda-2" aria-hidden />
        </span>
      )}
      <IaDigisystem
        key={`sq-${clique}`}
        size={80}
        estado={estado}
        className={cn("relative drop-shadow-[0_8px_18px_oklch(0.45_0.15_268/35%)]", clique > 0 && "agente-squash")}
      />
    </button>
  );
}
