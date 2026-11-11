/*
  PROTÓTIPO DESCARTÁVEL — não é o app.
  Variante comparativa da fonte da imagem (Opção D).
  Fonte da verdade = clone real.
  Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
*/
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Images, Upload } from "lucide-react";
import { IaDigisystem } from "../IaDigisystem";
import { cn } from "../lib/utils";

type Fase = "vazio" | "enviando" | "gerando" | "pronto";
type Painel = "fechado" | "opcoes" | "acervo";

const TITULO = "Governança de dados começa pelo básico";
const SUBTITULO = "Três passos para organizar a base antes da IA";

const ACERVO = [
  { id: "a1", nome: "Equipe em reunião", de: "#36499b", para: "#67cfee" },
  { id: "a2", nome: "Painel de dados", de: "#22306b", para: "#36499b" },
  { id: "a3", nome: "Escritório aberto", de: "#67cfee", para: "#36499b" },
  { id: "a4", nome: "Mãos no teclado", de: "#36499b", para: "#22306b" },
];

export function OpcaoDPopover() {
  const [fase, setFase] = useState<Fase>("vazio");
  const [painel, setPainel] = useState<Painel>("fechado");
  const [carregandoAcervo, setCarregandoAcervo] = useState(false);
  const [escolhida, setEscolhida] = useState<{ de: string; para: string; nome: string } | null>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Fecha com clique fora e Esc.
  useEffect(() => {
    if (painel === "fechado") return;
    const fora = (e: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setPainel("fechado");
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setPainel("fechado");
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [painel]);

  function concluir(img: { de: string; para: string; nome: string }) {
    setEscolhida(img);
    setFase("pronto");
  }

  function enviar() {
    setPainel("fechado");
    setFase("enviando");
    later(() => concluir({ de: "#36499b", para: "#67cfee", nome: "Arquivo enviado" }), 1000);
  }
  function gerar() {
    setPainel("fechado");
    setFase("gerando");
    later(() => concluir({ de: "#22306b", para: "#67cfee", nome: "Gerada pela IA" }), 2000);
  }
  function abrirAcervo() {
    setPainel("acervo");
    setCarregandoAcervo(true);
    later(() => setCarregandoAcervo(false), 1000);
  }

  const temImagem = fase === "pronto" && escolhida;
  const fundo = temImagem
    ? `linear-gradient(160deg, ${escolhida.de}, ${escolhida.para})`
    : "linear-gradient(160deg, #22306b, #36499b 55%, #67cfee)";

  const opcao =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-display text-sm font-bold text-navy transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67cfee]";

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-20">
      <div className="mx-auto max-w-sm">
        <header className="mb-4">
          <h1 className="font-display text-lg font-bold leading-none text-navy">
            Opção D — botão + popover
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Na Opção A (rodada 6) o próprio quadro vazio já mostra as 3 zonas; aqui o quadro mostra
            só um botão e as fontes aparecem num popover.
          </p>
        </header>

        <div ref={raiz} className="relative">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-card"
            style={{ background: fundo }}
          >
            {/* título/subtítulo sempre visíveis */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 text-white">
              <p className="font-display text-xl font-bold leading-tight">{TITULO}</p>
              <p className="mt-1 text-xs text-white/85">{SUBTITULO}</p>
            </div>

            {fase === "vazio" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setPainel(painel === "fechado" ? "opcoes" : "fechado")}
                  aria-haspopup="menu"
                  aria-expanded={painel !== "fechado"}
                  className="ec-cta-ia-solido inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-bold text-white"
                >
                  <ImagePlus className="size-4" aria-hidden />
                  Adicionar imagem
                </button>
              </div>
            )}

            {fase === "enviando" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20">
                <div className="ec-spinner size-6" />
                <p className="text-xs font-semibold text-white">Enviando imagem…</p>
              </div>
            )}

            {fase === "gerando" && (
              <div className="ec-gerando-fundo absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 text-center">
                <IaDigisystem size={92} estado="processando" />
                <div className="w-40">
                  <div className="ec-bar-trilho h-1.5 w-full" />
                  <p className="mt-2 font-display text-xs font-bold text-navy">Criando a imagem…</p>
                </div>
              </div>
            )}

            {temImagem && (
              <>
                <span className="ec-select-pop absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-navy">
                  imagem escolhida · {escolhida.nome}
                </span>
                <button
                  type="button"
                  onClick={() => setPainel(painel === "fechado" ? "opcoes" : "fechado")}
                  aria-haspopup="menu"
                  aria-expanded={painel !== "fechado"}
                  className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 font-display text-xs font-bold text-navy shadow-card hover:bg-white"
                >
                  Trocar imagem
                </button>
              </>
            )}
          </div>

          {/* Popover ancorado ao botão, sobre o quadro */}
          {painel !== "fechado" && (fase === "vazio" || fase === "pronto") && (
            <div
              role="menu"
              className={cn(
                "absolute z-20 w-64 rounded-2xl border border-border bg-card p-2 shadow-card",
                fase === "vazio"
                  ? "left-1/2 top-[calc(50%+28px)] -translate-x-1/2"
                  : "right-3 top-12",
              )}
            >
              {painel === "opcoes" ? (
                <div className="space-y-0.5">
                  <button type="button" role="menuitem" className={opcao} onClick={enviar}>
                    <Upload className="size-5 text-[#36499b]" aria-hidden />
                    Enviar imagem
                  </button>
                  <button type="button" role="menuitem" className={opcao} onClick={gerar}>
                    <IaDigisystem size={22} estado="vivo" />
                    Gerar com IA
                  </button>
                  <button type="button" role="menuitem" className={opcao} onClick={abrirAcervo}>
                    <Images className="size-5 text-[#36499b]" aria-hidden />
                    Buscar no acervo
                  </button>
                </div>
              ) : (
                <div className="p-1">
                  <p className="mb-2 font-display text-xs font-bold text-navy">Acervo da marca</p>
                  <div className="grid grid-cols-2 gap-2">
                    {carregandoAcervo
                      ? ACERVO.map((a) => (
                          <div key={a.id} className="ec-skeleton aspect-[4/3] rounded-xl" />
                        ))
                      : ACERVO.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            title={a.nome}
                            aria-label={a.nome}
                            onClick={() => {
                              setPainel("fechado");
                              concluir({ de: a.de, para: a.para, nome: a.nome });
                            }}
                            className="aspect-[4/3] rounded-xl transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67cfee]"
                            style={{ background: `linear-gradient(160deg, ${a.de}, ${a.para})` }}
                          />
                        ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Mock descartável: as imagens são gradientes da marca.
        </p>
      </div>
    </div>
  );
}
