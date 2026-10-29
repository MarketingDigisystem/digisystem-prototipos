/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/components/shell/MenuAvatar.tsx (avatar bg-sky + iniciais),
 *   src/hub/pages/marca/Marca.tsx (LogoUploader: clique e arrastar) @ origin/main c16c790 / leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-perfil-e-foto-2026-10-27.md.
 *
 * Foto grande do Perfil: botão circular (abre o seletor), camadas para a troca
 * com transição (íris), anel SVG desenhado uma vez e arco girando só enquanto envia.
 */
import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "../../../lib/utils";

type Saindo = { src: string; modo: "troca" | "fecha"; n: number };

export function FotoPerfil({
  foto,
  previa,
  iniciais,
  enviando,
  arrastando,
  onEscolher,
}: {
  /** Foto salva. */
  foto?: string;
  /** Foto recortada que está sendo enviada (aparece esmaecida). */
  previa?: string;
  iniciais: string;
  enviando: boolean;
  arrastando: boolean;
  onEscolher: () => void;
}) {
  const [saindo, setSaindo] = useState<Saindo | null>(null);
  const [modoEntrada, setModoEntrada] = useState<"entrada" | "troca">("entrada");
  const [iniciaisVoltaram, setIniciaisVoltaram] = useState(false);
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [foto]);

  // A troca acompanha o que está NA TELA (prévia do envio ou foto salva):
  // A → B: A encolhe e some, B entra em íris; A → nada: A fecha em íris e as iniciais voltam.
  const mostrada = previa ?? (falhou ? undefined : foto);
  const anterior = useRef(mostrada);
  useEffect(() => {
    const prev = anterior.current;
    anterior.current = mostrada;
    if (prev === mostrada) return;
    setModoEntrada("troca");
    setIniciaisVoltaram(!mostrada);
    if (!prev) return;
    const n = Date.now();
    setSaindo({ src: prev, modo: mostrada ? "troca" : "fecha", n });
    const t = window.setTimeout(() => setSaindo((s) => (s?.n === n ? null : s)), 320);
    return () => window.clearTimeout(t);
  }, [mostrada]);

  const temFoto = !!mostrada;
  const rotulo = temFoto ? "Sua foto de perfil. Ativar para trocar." : "Você ainda não tem foto. Ativar para enviar uma.";

  return (
    <div
      className={cn(
        "relative size-32 transition-transform duration-150 motion-reduce:transition-none lg:size-40",
        arrastando && "scale-[1.03] motion-reduce:scale-100",
      )}
    >
      {/* Anel: enquadramento fixo + arco de envio. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        data-foto={temFoto}
        data-arrastando={arrastando}
        data-entrada="true"
        className="pf-anel pointer-events-none absolute -inset-[6px] size-[calc(100%+12px)] -rotate-90"
      >
        <circle className="pf-anel-base" cx="50" cy="50" r="48.5" pathLength={1} />
      </svg>
      {enviando && (
        <svg aria-hidden viewBox="0 0 100 100" className="pf-arco-gira pointer-events-none absolute -inset-[6px] size-[calc(100%+12px)]">
          <circle className="pf-arco" cx="50" cy="50" r="48.5" pathLength={1} fill="none" strokeWidth={2.5} />
        </svg>
      )}

      <button
        type="button"
        onClick={onEscolher}
        disabled={enviando}
        aria-label={rotulo}
        data-testid="foto-perfil"
        className="group relative block size-full overflow-hidden rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-wait"
      >
        {/* Iniciais (sempre por baixo: aparecem quando não há foto). */}
        <span
          aria-hidden
          className={cn(
            "pf-iniciais-cor absolute inset-0 flex items-center justify-center bg-sky font-display text-[44px] font-bold lg:text-[56px]",
            iniciaisVoltaram && !temFoto && "pf-iniciais-entra",
            // Com foto (ou prévia esmaecida do envio), as iniciais não vazam por baixo.
            temFoto && "opacity-0",
          )}
        >
          {iniciais}
        </span>

        {saindo && (
          <img
            key={`sai-${saindo.n}`}
            src={saindo.src}
            alt=""
            draggable={false}
            className={cn("absolute inset-0 size-full object-cover", saindo.modo === "troca" ? "pf-foto-sai" : "pf-foto-fecha")}
          />
        )}

        {mostrada && (
          <img
            key={mostrada.slice(-48)}
            src={mostrada}
            alt=""
            draggable={false}
            onError={() => {
              console.warn("[perfil] foto não carregou, voltando para a inicial");
              setFalhou(true);
            }}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-200 motion-reduce:transition-none",
              modoEntrada === "entrada" ? "pf-foto-entrada" : "pf-foto-troca",
              previa && "opacity-70",
            )}
          />
        )}

        {/* Véu do hover / do arrastar. */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full font-display text-[13px] font-bold transition-opacity duration-150 motion-reduce:transition-none",
            arrastando
              ? "bg-sky/20 text-foreground opacity-100"
              : "bg-primary/75 text-primary-foreground opacity-0 group-hover:opacity-100 group-disabled:opacity-0",
          )}
        >
          {arrastando ? (
            <span className="rounded-full bg-card/90 px-3 py-1 text-center text-xs text-foreground shadow-card">Solte para usar esta foto</span>
          ) : (
            <>
              <Camera className="size-5" aria-hidden />
              {temFoto ? "Trocar foto" : "Enviar foto"}
            </>
          )}
        </span>
      </button>
    </div>
  );
}
