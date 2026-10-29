/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/ChatImagem.tsx @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Arte" (Gerar com a IA).
 *
 * "Descrever com a IA": a conversa de imagem do real (linha 37), com a IA
 * simulada. A IA pergunta o que aparece e onde, sugere respostas clicáveis e
 * entrega o "Prompt pronto" com "Ajustar" e "Usar este prompt". Cada abertura
 * recomeça do zero, como no real. Com a IA indisponível no painel de demo,
 * mostra a mensagem de erro do real.
 */
import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";

type Mensagem = { autor: "ia" | "usuario"; texto: string };

const RODADAS: { pergunta: (tema: string) => string; sugestoes: string[] }[] = [
  {
    pergunta: (tema) => `Vamos montar a imagem do post "${tema}". O que precisa aparecer na cena?`,
    sugestoes: ["Pessoas trabalhando juntas", "Um ambiente de tecnologia", "Um detalhe de perto: mãos, telas, equipamentos"],
  },
  {
    pergunta: () => "Boa. Onde a cena acontece e com que luz?",
    sugestoes: ["Escritório claro, luz natural", "Data center com luz azul", "Hospital ou clínica, em tons claros"],
  },
];

function montarPrompt(base: string, respostas: string[]): string {
  const cena = respostas.filter(Boolean).join("; ").toLowerCase();
  return (
    `${base.replace(/\.$/, "")}${cena ? `. Cena: ${cena}` : ""}. Fotografia realista, enquadramento limpo, ` +
    "espaço livre para o texto da arte. Sem texto, letras, logos ou marca d'água na imagem."
  );
}

export function ChatImagem({
  tema,
  descricaoBase,
  indisponivel,
  onFechar,
  onUsarPrompt,
}: {
  tema: string;
  /** Ponto de partida da cena (a descrição da IA para o tema). */
  descricaoBase: string;
  indisponivel: boolean;
  onFechar: () => void;
  onUsarPrompt: (prompt: string) => void;
}) {
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [promptPronto, setPromptPronto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [entrada, setEntrada] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const rodada = (hist: Mensagem[]) => {
    setCarregando(true);
    setSugestoes([]);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setCarregando(false);
      if (indisponivel) {
        setHistorico([...hist, { autor: "ia", texto: "Não consegui responder agora. Tente enviar de novo em instantes." }]);
        return;
      }
      const respostas = hist.filter((m) => m.autor === "usuario").map((m) => m.texto);
      const etapa = respostas.length;
      if (etapa < RODADAS.length) {
        setHistorico([...hist, { autor: "ia", texto: RODADAS[etapa].pergunta(tema || "sem tema") }]);
        setSugestoes(RODADAS[etapa].sugestoes);
      } else {
        setHistorico([...hist, { autor: "ia", texto: "Fechado. O prompt está abaixo. Se quiser mudar alguma coisa, é só ajustar." }]);
        setPromptPronto(montarPrompt(descricaoBase, respostas));
      }
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }, 900);
  };

  // Cada abertura recomeça do zero (o componente monta de novo).
  useEffect(() => {
    rodada([]);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    return () => {
      window.clearTimeout(timer.current);
      document.removeEventListener("keydown", esc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [historico, carregando, promptPronto]);

  const enviar = (texto: string) => {
    const t = texto.trim();
    if (!t || carregando) return;
    const hist: Mensagem[] = [...historico, { autor: "usuario", texto: t }];
    setHistorico(hist);
    setEntrada("");
    setPromptPronto("");
    rodada(hist);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[oklch(0.2_0.05_268/0.45)] p-4" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div role="dialog" aria-modal="true" aria-labelledby="chat-imagem-titulo" className="animate-rise w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-3 border-b border-border/60 bg-gradient-to-r from-navy-soft to-orange-soft px-5 py-4">
          <span className="relative grid place-items-center">
            <span className="agente-glow-a" aria-hidden />
            <IaDigisystem size={36} estado={carregando ? "processando" : "vivo"} className="relative" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="chat-imagem-titulo" className="font-display text-base font-bold text-primary">
              Descrever imagem com a IA
            </h2>
            <p className="text-[11px] text-muted-foreground">Descreva a cena que você imagina, eu monto o prompt para a imagem.</p>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-primary">
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
          {historico.map((m, i) =>
            m.autor === "ia" ? (
              <div key={i} className="bolha-in flex justify-start">
                <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-secondary/60 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">{m.texto}</div>
              </div>
            ) : (
              <div key={i} className="bolha-in flex justify-end">
                <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-card">{m.texto}</div>
              </div>
            ),
          )}

          {carregando && (
            <div className="flex justify-start" aria-label="A IA está escrevendo">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-secondary/60 px-3.5 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky" />
              </div>
            </div>
          )}

          {!carregando && !promptPronto && sugestoes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sugestoes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => enviar(s)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {promptPronto && !carregando && (
            <div className="rounded-2xl border border-sky/30 bg-gradient-to-br from-sky-soft to-transparent p-4">
              <p className="font-display text-[11px] font-bold uppercase tracking-wide text-primary">Prompt pronto</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-foreground">{promptPronto}</p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPromptPronto("");
                    window.setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className="rounded-full bg-card px-4 py-2 font-display text-xs font-bold text-primary shadow-card transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Ajustar
                </button>
                <button
                  type="button"
                  onClick={() => onUsarPrompt(promptPronto)}
                  className="rounded-full bg-primary px-4 py-2 font-display text-xs font-bold text-primary-foreground shadow-card transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Usar este prompt
                </button>
              </div>
            </div>
          )}
          <div ref={fimRef} />
        </div>

        {!promptPronto && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(entrada);
            }}
            className="border-t border-border/60 px-5 py-4"
          >
            <div className="chat-caixa">
              <input
                ref={inputRef}
                autoFocus
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Descreva a cena…"
                aria-label="Sua resposta"
                disabled={carregando}
              />
              <button type="submit" className="chat-enviar" aria-label="Enviar" disabled={carregando || !entrada.trim()}>
                <Send aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
