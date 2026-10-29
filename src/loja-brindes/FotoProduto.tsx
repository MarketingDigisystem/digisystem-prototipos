// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Foto do produto. Quando a foto tem src (foto real em /brindes/*.png), mostra a <img> sobre
// fundo claro suave (as fotos têm fundo branco de estúdio). Sem src — ou se a imagem falhar
// ao carregar (ex.: caderno.png ainda não está no disco) — cai no PLACEHOLDER de marca
// (gradiente navy/sky + silhueta em ícone), nunca emoji.

import { useEffect, useState, type CSSProperties } from "react";
import {
  Backpack, BatteryCharging, Coffee, CupSoda, FileText, HardHat, IdCard, KeyRound, Milk, Mouse, NotebookPen,
  PenTool, PlugZap, Shirt, ShoppingBag, Snowflake, Sprout, StickyNote, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { asset } from "./asset";
import type { Foto, FundoFoto, IconeProduto, Produto } from "./tipos";

export const ICONES: Record<IconeProduto, LucideIcon> = {
  garrafa: Milk, caneca: Coffee, copo: CupSoda, camiseta: Shirt, moletom: Snowflake, bone: HardHat,
  caderno: NotebookPen, caneta: PenTool, mochila: Backpack, powerbank: BatteryCharging, carregador: PlugZap,
  mousepad: Mouse, cracha: IdCard, ecobag: ShoppingBag, semente: Sprout,
  bloco: StickyNote, squeeze: CupSoda, chaveiro: KeyRound, folder: FileText,
};

const FUNDOS: Record<FundoFoto, CSSProperties> = {
  "navy-sky": { background: "linear-gradient(140deg, var(--navy-soft), var(--sky-soft)), var(--card)" },
  "sky-orange": { background: "linear-gradient(140deg, var(--sky-soft), var(--orange-soft)), var(--card)" },
  "navy-escuro": { background: "radial-gradient(120% 90% at 20% 10%, oklch(0.52 0.13 262), var(--navy) 60%)" },
  neutro: { background: "linear-gradient(160deg, var(--card), var(--secondary))" },
};

const CLARAS = ["#ffffff", "#efe6d2", "#c4c8d0"];

export function FotoProduto({
  produto, foto, corHex, className, rotulo, dessaturar, tamanho = "card",
}: {
  produto: Produto;
  foto?: Foto;
  corHex?: string;
  className?: string;
  rotulo?: string;
  dessaturar?: boolean;
  tamanho?: "mini" | "card" | "grande";
}) {
  const f = foto ?? produto.galeria[0];
  const [falhou, setFalhou] = useState(false);
  // Se trocar de foto (galeria), tentar carregar de novo.
  useEffect(() => { setFalhou(false); }, [f.src]);

  const temFoto = !!f.src && !falhou;
  const ariaLabel = rotulo ?? `${produto.nome}: ${f.legenda}`;
  // Resolve os caminhos de public/ contra o base do Vite (necessário no GitHub Pages).
  const srcUrl = asset(f.src);
  const pdfUrl = asset(f.pdf);

  // Arte em PDF (ex.: folder institucional): no tamanho grande, o navegador renderiza o PDF
  // nativo via <embed>. Nos tamanhos mini/card fica a imagem (f.src) para não pesar.
  if (f.pdf && tamanho === "grande") {
    return (
      <div
        className={cn("relative isolate overflow-hidden bg-[color:var(--foto-fundo)]", dessaturar && "opacity-70 grayscale", className)}
        style={{ "--foto-fundo": "oklch(0.985 0.004 250)" } as CSSProperties}
      >
        <object data={`${pdfUrl}#page=1&toolbar=0&navpanes=0&view=FitH`} type="application/pdf" aria-label={ariaLabel} className="h-full w-full">
          {srcUrl ? <img src={srcUrl} alt={ariaLabel} className="h-full w-full object-contain p-6 sm:p-8" /> : null}
        </object>
      </div>
    );
  }

  if (temFoto) {
    const pad = tamanho === "mini" ? "p-1.5" : tamanho === "grande" ? "p-6 sm:p-8" : "p-3 sm:p-4";
    return (
      <div
        className={cn("relative isolate grid place-items-center overflow-hidden bg-[color:var(--foto-fundo)]", dessaturar && "opacity-70 grayscale", className)}
        style={{ "--foto-fundo": "oklch(0.985 0.004 250)" } as CSSProperties}
      >
        <img
          src={srcUrl}
          alt={ariaLabel}
          loading="lazy"
          onError={() => setFalhou(true)}
          className={cn("h-full w-full object-contain", pad)}
        />
      </div>
    );
  }

  // Placeholder de marca (sem foto / foto ainda não está no disco).
  const Icone = ICONES[produto.icone];
  const escuro = f.fundo === "navy-escuro";
  const corIcone = !corHex || CLARAS.includes(corHex) || (escuro && corHex === "#36499b") ? undefined : corHex;
  const base = escuro ? "text-sky" : "text-primary";
  const traco = tamanho === "mini" ? 1.6 : 1.25;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={FUNDOS[f.fundo]}
      className={cn("relative isolate overflow-hidden", dessaturar && "opacity-70 grayscale", className)}
    >
      {f.angulo === "frente" && (
        <div className="absolute inset-0 grid place-items-center">
          <span className={cn("absolute aspect-square w-[62%] rounded-full", escuro ? "bg-white/8" : "bg-card/70")} />
          <span className="absolute bottom-[14%] h-[5%] w-[42%] rounded-[50%] bg-foreground/10 blur-[6px]" />
          <Icone className={cn("relative w-[44%] h-[44%]", base)} strokeWidth={traco} style={corIcone ? { color: corIcone } : undefined} />
        </div>
      )}
      {f.angulo === "detalhe" && (
        <div className="absolute inset-0">
          <Icone className={cn("absolute -right-[14%] -bottom-[18%] h-[105%] w-[105%] opacity-90", base)} strokeWidth={0.9} />
          <span className={cn("absolute left-[12%] top-[14%] aspect-square w-[34%] rounded-full border-[3px] border-dashed", escuro ? "border-sky/70" : "border-primary/40")} />
          <span className="absolute left-[12%] top-[14%] grid aspect-square w-[34%] place-items-center">
            <span className="size-[18%] rounded-full bg-accent" />
          </span>
        </div>
      )}
      {f.angulo === "uso" && (
        <div className="absolute inset-0">
          <span className={cn("absolute inset-x-0 bottom-0 h-[30%]", escuro ? "bg-white/10" : "bg-card/80")} />
          <span className={cn("absolute bottom-[30%] left-[14%] h-[22%] w-[16%] rounded-t-xl", escuro ? "bg-white/15" : "bg-primary/12")} />
          <Icone className={cn("absolute bottom-[26%] left-[40%] h-[46%] w-[46%]", base)} strokeWidth={traco} />
        </div>
      )}
      {f.angulo === "embalagem" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className={cn("relative grid aspect-[5/4] w-[60%] place-items-center rounded-2xl border shadow-card", escuro ? "border-white/20 bg-white/10" : "border-border bg-card")}>
            <span className="absolute inset-x-0 top-[18%] h-[10%] bg-accent/85" />
            <Icone className={cn("h-[46%] w-[46%]", base)} strokeWidth={traco} />
          </div>
        </div>
      )}
    </div>
  );
}
