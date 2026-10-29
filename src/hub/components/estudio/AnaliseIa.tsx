/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/AnalisePostCard.tsx (e o formato de src/lib/analisar-post.functions.ts)
 *   @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Enviar" (D2).
 *
 * "Análise da IA" do Enviar (linha 74 do inventário), fiel ao AnalisePostCard:
 * roda sozinha 600 ms depois que a legenda, as hashtags, as chamadas ou o
 * modelo mudam; mostra o resumo, "O que está bom" e "Sugestões" (ou "Nenhum
 * ajuste crítico"); tem "Analisar de novo"; com a IA fora do ar (painel de
 * demo, "ia do estúdio"), mostra "Não consegui analisar agora." e "Tentar de
 * novo". A análise não barra o envio. A IA é simulada (mock-geracao.analisarPost).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Lightbulb, RefreshCw } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { analisarPost, type AnaliseDoPost, type EntradaAnalise } from "../../store/mock-geracao";

const ESPERA_MS = 600;
const ANALISE_MS = 1600;

export function AnaliseIa({ entrada, indisponivel }: { entrada: EntradaAnalise; indisponivel: boolean }) {
  const [analise, setAnalise] = useState<AnaliseDoPost | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);

  // O último conteúdo e o estado da IA, para o disparo manual e a espera usarem sempre o valor atual.
  const atual = useRef({ entrada, indisponivel });
  atual.current = { entrada, indisponivel };
  const pedido = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const rodar = useCallback(() => {
    const { entrada: e } = atual.current;
    if (!e.legenda.trim()) return;
    const id = ++pedido.current;
    setCarregando(true);
    setErro(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (id !== pedido.current) return;
      setCarregando(false);
      if (atual.current.indisponivel) {
        setErro(true);
        return;
      }
      setAnalise(analisarPost(atual.current.entrada));
    }, ANALISE_MS);
  }, []);

  const chave = JSON.stringify({ l: entrada.legenda, h: entrada.hashtags, c: entrada.ctas, r: entrada.redes, m: entrada.modelo });
  const ultimaChave = useRef<string | null>(null);
  useEffect(() => {
    if (!entrada.legenda.trim() || ultimaChave.current === chave) return;
    const t = window.setTimeout(() => {
      ultimaChave.current = chave;
      rodar();
    }, ESPERA_MS);
    return () => window.clearTimeout(t);
  }, [chave, entrada.legenda, rodar]);

  return (
    <section
      aria-labelledby="analise-ia-titulo"
      aria-busy={carregando || undefined}
      className={carregando ? "ia-borda-analise p-5 shadow-card" : "rounded-3xl bg-card p-5 shadow-card"}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <IaDigisystem size={36} estado={carregando ? "processando" : "vivo"} />
          <div>
            <h3 id="analise-ia-titulo" className="font-display text-base font-bold text-primary">
              Análise da IA
            </h3>
            <p className="text-xs text-muted-foreground">Leitura crítica do post pronto, com sugestões. Não impede o envio.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={rodar}
          disabled={carregando || !entrada.legenda.trim()}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:bg-secondary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        >
          <RefreshCw aria-hidden className={carregando ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Analisar de novo
        </button>
      </div>

      <div className="mt-4" aria-live="polite">
        {erro && !carregando ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/40 p-4">
            <p className="text-sm text-muted-foreground">Não consegui analisar agora.</p>
            <button
              type="button"
              onClick={rodar}
              className="rounded-full bg-card px-3.5 py-1.5 font-display text-xs font-bold text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5"
            >
              Tentar de novo
            </button>
          </div>
        ) : !analise ? (
          <p className="rounded-2xl bg-secondary/30 p-4 text-sm text-muted-foreground">
            {carregando ? "Analisando o post…" : "A análise aparece assim que houver legenda."}
          </p>
        ) : (
          <div className={carregando ? "space-y-4 opacity-60 transition-opacity" : "space-y-4 transition-opacity"}>
            <p className="text-sm leading-relaxed text-foreground">{analise.resumo}</p>
            {analise.pontosFortes.length > 0 && (
              <div>
                <p className="font-display text-[11px] font-bold uppercase tracking-wide text-primary">O que está bom</p>
                <ul className="mt-2 space-y-1.5">
                  {analise.pontosFortes.map((p) => (
                    <li key={p} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                      <Check aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="font-display text-[11px] font-bold uppercase tracking-wide text-primary">Sugestões</p>
              {analise.sugestoes.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {analise.sugestoes.map((s) => (
                    <li key={s.rotulo} className="flex gap-2.5 rounded-2xl bg-secondary/40 p-3 text-sm">
                      <Lightbulb aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="min-w-0">
                        <span className="block font-display font-bold text-primary">{s.rotulo}</span>
                        <span className="block text-foreground/85">{s.detalhe}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 flex items-center gap-2 text-sm text-foreground">
                  <Check aria-hidden className="h-4 w-4 text-success" /> Nenhum ajuste crítico. O post está pronto.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
