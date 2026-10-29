/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/PostPreview.tsx, src/components/estudio/TemplateLivePreview.tsx,
 *   src/components/estudio/StoryPreviewPanel.tsx e o resultado do ArteStep.tsx (setas, bolinhas,
 *   n/N, Baixar SVG / tudo .zip / tudo junto) @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 1 (coluna da direita)
 *   e pontos confusos 13 (um menu Baixar), 14 (Story na prévia) e 15 (sempre 4:5).
 *
 * Coluna da direita do "Criar post": a PRÉVIA AO VIVO 4:5 (nunca quadrada)
 * que redesenha a cada ajuste da Arte, desde o primeiro minuto, e embaixo o
 * texto do post como vai sair: redes, legenda, chamadas e hashtags.
 * Item 5.5c: alternador Feed 4:5 / Story 9:16 (com as faixas da interface da
 * rede, 13% no topo e na base); com a arte pronta, a prévia mostra a arte
 * final com setas, bolinhas e n/N; no Carrossel, a tira de pranchetas fica
 * embaixo; botões Finalizar arte e um menu único Baixar (simulado, com aviso).
 * O real renderiza no servidor com 500 ms de espera; aqui é desenhado no
 * cliente (desenhar-arte.ts).
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Loader2, Smartphone } from "lucide-react";
import { cn } from "../../../lib/utils";
import { REDE_META } from "../RedeIcone";
import { SAFE_ZONE_STORY_PCT, ctasValidos, itensBaixar, navegarIndice, type ItemBaixar, type Resultado } from "../../store/regras";
import type { Marca } from "../../store/tipos";
import { rotuloPrancheta } from "./arte-config";
import { desenharArte, entradaDoEditor } from "./desenhar-arte";
import { TiraPranchetas } from "./EditorCarrossel";
import { legendaFinal, type Editor } from "./editor";
import { ParPilulas, botaoAzul, pilulaAcao } from "./partes";
import { MODELOS } from "./SecaoArte";

type Formato = "feed" | "story";

export function PreviaPost({
  ed,
  marca,
  mudar,
  liberada,
  somenteLeitura,
  ocupado,
  finalizar,
  podeStory,
  onFinalizar,
  onGerarStory,
  onBaixar,
}: {
  ed: Editor;
  marca: Marca;
  mudar: (p: Partial<Editor>) => void;
  /** A arte só libera com o post salvo (texto aprovado). */
  liberada: boolean;
  somenteLeitura: boolean;
  ocupado: "imagem" | "arte" | "story" | null;
  finalizar: Resultado;
  podeStory: Resultado;
  onFinalizar: () => void;
  onGerarStory: () => void;
  onBaixar: (item: ItemBaixar) => void;
}) {
  const [formato, setFormato] = useState<Formato>("feed");
  const [indice, setIndice] = useState(0);
  const [indiceStory, setIndiceStory] = useState(0);

  const legenda = legendaFinal(ed);
  const ctas = ctasValidos(ed.ctas, ed.redes);
  const entrada = entradaDoEditor(ed, marca, formato === "story" ? "previa-story" : "previa");
  const modelo = MODELOS.find((m) => m.id === ed.template)?.titulo ?? "";
  const semTitulo = ed.template !== "C" && !entrada.titulo.trim();
  const ehCarrossel = ed.template === "C";

  // Arte pronta e não reaberta: a prévia mostra a arte final (linha 68).
  const mostraFinal = ed.arteFinal && !ed.editandoArte && ed.arteUrls.length > 0;
  const storyPronto = mostraFinal && ed.storyUrls.length > 0;
  const n = ed.arteUrls.length;
  const nStory = ed.storyUrls.length;
  const i = Math.min(indice, Math.max(n - 1, 0));
  const iStory = Math.min(indiceStory, Math.max(nStory - 1, 0));

  // Redesenha a cada render: é uma string SVG pequena, sem rede (o real espera 500 ms e vai ao servidor).
  const svgAoVivo = (formato === "feed" && !mostraFinal) || (formato === "story" && !storyPronto) ? desenharArte(entrada, { formato }) : "";
  const rotuloAtual = ehCarrossel ? rotuloPrancheta(ed.arte.carrossel, ed.arte.carrossel.editando) : "";

  const itens = itensBaixar({ arteFinal: ed.arteFinal, pranchetas: n, indice: i, stories: nStory, indiceStory: iStory });

  return (
    <aside aria-label="Prévia do post" className="rounded-3xl bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-sm font-bold text-primary">Prévia</p>
        <ParPilulas
          rotulo="Formato da prévia"
          opcoes={[
            { id: "feed", label: "Feed 4:5" },
            { id: "story", label: "Story 9:16" },
          ]}
          valor={formato}
          onMudar={setFormato}
        />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {modelo}
        {mostraFinal ? " · arte final" : " · ao vivo"}
      </p>

      {formato === "feed" ? (
        <div className="relative mt-2 aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
          {mostraFinal ? (
            <img src={ed.arteUrls[i]} alt={`Arte final${n > 1 ? `, prancheta ${i + 1} de ${n}` : ""}: ${entrada.titulo}`} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div
              role="img"
              aria-label={`Prévia da arte (${modelo}${rotuloAtual ? `, ${rotuloAtual}` : ""}): ${entrada.titulo || "sem título"}`}
              className="absolute inset-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svgAoVivo }}
            />
          )}
          {semTitulo && !mostraFinal && (
            <p className="absolute inset-x-3 bottom-3 rounded-xl bg-card/90 px-3 py-2 text-center text-[11px] font-semibold text-primary shadow-card">
              Preencha o título da arte para ver a prévia completa.
            </p>
          )}
          {ehCarrossel && !mostraFinal && (
            <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-0.5 font-display text-[10px] font-bold text-white">{rotuloAtual}</span>
          )}
          {mostraFinal && (
            <span className="absolute right-3 top-3 rounded-full bg-success px-2.5 py-0.5 font-display text-[10px] font-bold text-success-foreground">Arte finalizada</span>
          )}
          {ed.arteFinal && ed.editandoArte && (
            <span className="absolute right-3 top-3 rounded-full bg-warning px-2.5 py-0.5 font-display text-[10px] font-bold text-white">Editando</span>
          )}
        </div>
      ) : (
        <div className="relative mx-auto mt-2 aspect-[9/16] w-[78%] overflow-hidden rounded-2xl bg-secondary">
          {storyPronto ? (
            <img src={ed.storyUrls[iStory]} alt={`Story${nStory > 1 ? ` ${iStory + 1} de ${nStory}` : ""}: ${entrada.titulo}`} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div
              role="img"
              aria-label={`Prévia do Story (${modelo}): ${entrada.titulo || "sem título"}`}
              className="absolute inset-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svgAoVivo }}
            />
          )}
          {/* Faixas da interface da rede (linha 72): o texto não deve ficar aqui. */}
          {(["top-0 border-b", "bottom-0 border-t"] as const).map((pos) => (
            <div
              key={pos}
              aria-hidden
              className={cn("absolute inset-x-0 grid place-items-center border-dashed border-white/70", pos)}
              style={{
                height: `${SAFE_ZONE_STORY_PCT}%`,
                background: "repeating-linear-gradient(135deg, rgba(255,255,255,.16) 0 6px, rgba(0,0,0,.16) 6px 12px)",
              }}
            >
              <span className="rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-semibold text-white">Área da interface da rede</span>
            </div>
          ))}
        </div>
      )}

      {formato === "feed" && mostraFinal && n > 1 && <Navegacao i={i} n={n} onIr={setIndice} rotulo="prancheta" />}
      {formato === "story" && storyPronto && nStory > 1 && <Navegacao i={iStory} n={nStory} onIr={setIndiceStory} rotulo="tela do Story" />}

      {formato === "story" && !storyPronto && (
        <div className="mt-2.5 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Story ao vivo, com o mesmo editor. {ehCarrossel ? "No carrossel, cada prancheta vira uma tela." : ""}
          </p>
          {liberada && !somenteLeitura && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={onGerarStory} disabled={!podeStory.ok} className={pilulaAcao} title={podeStory.ok ? undefined : podeStory.motivo}>
                {ocupado === "story" ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : <Smartphone aria-hidden className="h-3.5 w-3.5" />}
                {ocupado === "story" ? "Gerando o Story…" : "Gerar versão Story"}
              </button>
              {!podeStory.ok && ocupado !== "story" && <span className="text-[10px] text-muted-foreground">{podeStory.motivo}</span>}
            </div>
          )}
        </div>
      )}

      {ehCarrossel && liberada && !somenteLeitura && !mostraFinal && formato === "feed" && (
        <TiraPranchetas entrada={entrada} bloqueada={ocupado === "arte"} onMudar={(carrossel) => mudar({ arte: { ...ed.arte, carrossel } })} />
      )}

      {(liberada || somenteLeitura) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!somenteLeitura && (!ed.arteFinal || ed.editandoArte) && (
            <button type="button" onClick={onFinalizar} disabled={!finalizar.ok} title={finalizar.ok ? undefined : finalizar.motivo} className={botaoAzul}>
              {ocupado === "arte" ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : null}
              {ocupado === "arte" ? "Finalizando…" : ed.arteFinal ? "Gerar novamente" : "Finalizar arte"}
            </button>
          )}
          <MenuBaixar itens={itens} onBaixar={onBaixar} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ed.redes.map((r) => {
          const { Icone, label, className } = REDE_META[r];
          return (
            <span key={r} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-[10px] font-bold", className)}>
              <Icone aria-hidden className="h-3 w-3" /> {label}
            </span>
          );
        })}
      </div>

      {legenda ? (
        <p className="mt-3 line-clamp-5 whitespace-pre-line text-xs leading-relaxed text-foreground/85">{legenda}</p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">A legenda aparece aqui depois de escrever com a IA ou colar a sua.</p>
      )}
      {ctas.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {ctas.map((c) => (
            <li key={c.plataformas.join()} className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-primary">{c.plataformas.map((r) => REDE_META[r].label).join(" e ")}:</span> {c.texto}
            </li>
          ))}
        </ul>
      )}
      {ed.hashtags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {ed.hashtags.map((h) => (
            <span key={h} className="rounded-full bg-orange-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
              {h}
            </span>
          ))}
        </div>
      )}
    </aside>
  );
}

/** Setas, bolinhas e n/N da arte pronta e do Story (linhas 68 e 72). */
function Navegacao({ i, n, onIr, rotulo }: { i: number; n: number; onIr: (i: number) => void; rotulo: string }) {
  const seta = "grid h-7 w-7 place-items-center rounded-full bg-card text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5";
  return (
    <div className="mt-2 flex items-center justify-center gap-2">
      <button type="button" onClick={() => onIr(navegarIndice(i, -1, n))} aria-label={`${rotulo} anterior`} className={seta}>
        <ChevronLeft aria-hidden className="h-4 w-4" />
      </button>
      <div className="flex gap-1">
        {Array.from({ length: n }, (_, k) => (
          <button
            key={k}
            type="button"
            onClick={() => onIr(k)}
            aria-label={`Ir para ${rotulo} ${k + 1}`}
            aria-current={k === i || undefined}
            className={cn("h-1.5 rounded-full transition-all duration-300", k === i ? "w-4 bg-accent" : "w-1.5 bg-border hover:bg-primary/40")}
          />
        ))}
      </div>
      <span className="font-display text-[11px] font-bold text-muted-foreground" aria-live="polite">
        {i + 1}/{n}
      </span>
      <button type="button" onClick={() => onIr(navegarIndice(i, 1, n))} aria-label={`Próxima ${rotulo}`} className={seta}>
        <ChevronRight aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Menu único "Baixar" (ponto confuso 13). No protótipo, cada opção só avisa o que baixaria. */
function MenuBaixar({ itens, onBaixar }: { itens: ItemBaixar[]; onBaixar: (item: ItemBaixar) => void }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={aberto} onClick={() => setAberto((v) => !v)} className={pilulaAcao}>
        <Download aria-hidden className="h-3.5 w-3.5" /> Baixar <ChevronDown aria-hidden className="h-3.5 w-3.5" />
      </button>
      {aberto && (
        <div role="menu" aria-label="Baixar" className="animate-rise absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl bg-card p-1.5 shadow-float">
          {itens.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={!item.ok}
              onClick={() => {
                onBaixar(item);
                setAberto(false);
              }}
              className="block w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-transparent"
            >
              <span className="block text-xs font-semibold text-foreground">{item.rotulo}</span>
              <span className="block text-[10px] text-muted-foreground">{item.ok ? item.arquivo : item.motivo}</span>
            </button>
          ))}
          <p className="px-3 pb-1 pt-1.5 text-[10px] text-muted-foreground">No protótipo o download é simulado.</p>
        </div>
      )}
    </div>
  );
}
