/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/ArteStep.tsx (origem da imagem, cards Estilo, Logo, Texto,
 *   Fundo e Conteúdo), src/components/estudio/TemplateLivePreview.tsx (nomes dos modelos),
 *   src/components/estudio/ChatImagem.tsx @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Arte".
 *
 * ARTE, item 5.5b (linhas 34 a 57 do inventário), na ordem da ESPEC:
 *  1. Modelo no topo, em 3 cartões: Estático, Estilo Blog, Carrossel.
 *  2. Imagem em 3 pílulas: Gerar com a IA (prompt, "Descrever com a IA" com o
 *     chat e "Gerar opções" com a faixa de escolha), Buscar no acervo (termos
 *     sugeridos, 9 por vez até 30, vazio e erro) e Enviar arquivo (galeria de
 *     exemplo, sem seletor de arquivo). Trocar e remover a imagem.
 *  3. Texto da arte: título (obrigatório em Estático e Blog), subtítulo,
 *     selo do subtítulo no Estático, Enter quebra linha, e "Escrever os textos
 *     da arte" pelo que está em "O que o agente escreve".
 *  4. Ajustes em par de pílulas: Básico (posição do texto, logo, P/M/G,
 *     fundo do Blog) | Avançado (fonte, cores, degradê, X/Y, tamanhos, D-pad).
 * A prévia ao vivo fica na coluna da direita (PreviaPost) e muda a cada ajuste.
 * Item 5.5c (linhas 58 a 73): no Carrossel o texto e os ajustes são da
 *  prancheta em edição (EditorCarrossel.tsx; a tira fica embaixo da prévia) e
 *  "Montar o carrossel com a IA" pede confirmação. Finalizar trava o painel
 *  ("Finalizando sua arte"), pode falhar com motivo e Tentar novamente (painel
 *  de demo) e, pronta, a arte troca os controles por Editar arte e Gerar
 *  versão Story; editando, o botão vira "Gerar novamente".
 * Regra do real mantida: sem post salvo não há arte (linha 31 → linha 35).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Ban, CheckCircle2, Image as ImageIcon, Images, LayoutTemplate, Loader2, Lock, Pencil, RotateCcw, Search, Smartphone, Upload, X } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { cn } from "../../../lib/utils";
import { ColorHexInput } from "../ColorHexInput";
import { campo, rotulo } from "../NovaTarefaDialog";
import { IMAGENS_EXEMPLO, acervoDeExemplo, type ImagemExemplo } from "../../store/mock-arte";
import {
  ACERVO,
  LIMITES_CONTEUDO,
  TAMANHOS_PADRAO_ARTE,
  contarPalavras,
  moverLogo,
  passoTamanhoFonte,
  podeFinalizarArte,
  proximoLimiteAcervo,
  temMaisNoAcervo,
  tituloDaArte,
  type PosicaoTexto,
} from "../../store/regras";
import type { Marca, Post } from "../../store/tipos";
import type { Resultado } from "../../store/regras";
import { BUSSOLA_DEGRADE, FONTES_ESTUDIO, POSICOES_LOGO, rotuloPrancheta, type ConfigArte, type ConfigCarrossel } from "./arte-config";
import { CampoPct, Grupo, Stepper } from "./controles-arte";
import { posicaoLogoPct } from "./desenhar-arte";
import { AjustesPranchetaCarrossel, ConfirmarMontar, TextoPrancheta } from "./EditorCarrossel";
import type { Editor, OrigemImagem } from "./editor";
import { BotaoIa, ParPilulas, Pilula, acaoLeve, botaoAzul, pilulaAcao } from "./partes";

/** Frases do painel travado enquanto o compositor trabalha (linha 66). */
const FRASES_FINALIZANDO = [
  "Aplicando a identidade da Marca…",
  "Montando as camadas da arte…",
  "Conferindo o texto e o logo…",
  "Gravando a arte no post…",
];

/** Sobreposição "Finalizando sua arte": segundos e frases que trocam, como no real. */
function PainelFinalizando() {
  const [seg, setSeg] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setSeg((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div role="status" aria-live="polite" className="absolute inset-0 z-10 rounded-3xl bg-background/70 backdrop-blur-[2px]">
      <div className="gerando-aurora sticky top-24 mx-auto mt-16 flex w-fit max-w-[90%] items-center gap-3 px-5 py-4">
        <IaDigisystem size={40} estado="processando" />
        <div>
          <p className="font-display text-sm font-bold text-white">Finalizando sua arte</p>
          <p className="text-[11px] text-white/80">
            {FRASES_FINALIZANDO[Math.floor(seg / 2) % FRASES_FINALIZANDO.length]} {seg}s
          </p>
          <p className="text-[10px] text-white/65">Os controles ficam travados até terminar.</p>
        </div>
      </div>
    </div>
  );
}

/** Nomes e desenho dos modelos do real (linha 42). */
export const MODELOS: { id: Post["template"]; titulo: string; texto: string }[] = [
  { id: "A", titulo: "Estático", texto: "Foto inteira, véu da marca e o texto à esquerda." },
  { id: "B", titulo: "Estilo Blog", texto: "Banda com o logo, foto no meio e banda com título e subtítulo." },
  { id: "C", titulo: "Carrossel", texto: "Capa com foto, slides de cor e a chamada final." },
];

/** Miniatura esquemática de cada modelo, no cartão de escolha. */
function Esquema({ id, ativo }: { id: Post["template"]; ativo: boolean }) {
  const foto = ativo ? "bg-white/25" : "bg-sky/40";
  const banda = ativo ? "bg-white/45" : "bg-primary";
  const linha = ativo ? "bg-accent" : "bg-accent";
  if (id === "B") {
    return (
      <span aria-hidden className="flex aspect-[4/5] w-12 shrink-0 flex-col overflow-hidden rounded-lg">
        <span className={cn("flex h-1/4 items-center justify-center", banda)}>
          <span className="h-1 w-5 rounded-full bg-white/80" />
        </span>
        <span className={cn("flex-1", foto)} />
        <span className={cn("flex h-1/4 flex-col items-center justify-center gap-0.5", banda)}>
          <span className={cn("h-1 w-7 rounded-full", linha)} />
          <span className="h-0.5 w-5 rounded-full bg-white/70" />
        </span>
      </span>
    );
  }
  if (id === "C") {
    return (
      <span aria-hidden className="relative h-[60px] w-14 shrink-0">
        <span className={cn("absolute right-0 top-1 h-[52px] w-9 rounded-lg", ativo ? "bg-white/20" : "bg-accent/70")} />
        <span className={cn("absolute right-2 top-0.5 h-[54px] w-10 rounded-lg", ativo ? "bg-white/30" : "bg-primary/70")} />
        <span className={cn("absolute left-0 top-0 flex h-[60px] w-12 flex-col justify-end gap-0.5 rounded-lg p-1.5", foto, !ativo && "bg-sky/60")}>
          <span className="h-1 w-7 rounded-full bg-white" />
          <span className="h-0.5 w-5 rounded-full bg-white/70" />
        </span>
      </span>
    );
  }
  return (
    <span aria-hidden className={cn("flex aspect-[4/5] w-12 shrink-0 flex-col justify-end gap-0.5 overflow-hidden rounded-lg bg-gradient-to-b p-1.5", ativo ? "from-white/15 to-white/40" : "from-sky/40 to-primary")}>
      <span className={cn("h-1 w-7 rounded-full", linha)} />
      <span className="h-0.5 w-5 rounded-full bg-white/80" />
    </span>
  );
}

type EstadoAcervo = { termo: string; limite: number; status: "ocioso" | "carregando" | "pronto" | "erro"; itens: ImagemExemplo[] };

export function SecaoArte({
  ed,
  mudar,
  marca,
  liberada,
  ocupado,
  ocupadoIa,
  realce,
  acervoDemo,
  onIa,
  onAbrirChat,
  onGerarOpcoes,
  onFinalizar,
  onGerarStory,
  podeStory,
  confirmarMontar,
  onConfirmarMontar,
  onCancelarMontar,
}: {
  ed: Editor;
  mudar: (p: Partial<Editor>) => void;
  marca: Marca;
  liberada: boolean;
  ocupado: "imagem" | "arte" | "story" | null;
  onGerarStory: () => void;
  podeStory: Resultado;
  /** "Montar o carrossel com a IA" esperando confirmação (substitui tudo). */
  confirmarMontar: boolean;
  onConfirmarMontar: () => void;
  onCancelarMontar: () => void;
  ocupadoIa: string | null;
  /** Campo que acabou de ser escrito pelo agente (pisca em laranja). */
  realce: string[];
  acervoDemo: "normal" | "vazio" | "erro";
  onIa: (id: string) => void;
  onAbrirChat: () => void;
  onGerarOpcoes: () => void;
  onFinalizar: () => void;
}) {
  const [acervo, setAcervo] = useState<EstadoAcervo>({ termo: "", limite: ACERVO.porVez, status: "ocioso", itens: [] });
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!liberada) {
    return (
      <p className="flex items-start gap-2 rounded-2xl bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
        <Lock aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />A arte libera quando o texto estiver aprovado. É nesse momento que o post é salvo.
      </p>
    );
  }

  const cfg = ed.arte;
  const mudarArte = (p: Partial<ConfigArte>) => mudar({ arte: { ...ed.arte, ...p } });
  const ehCarrossel = ed.template === "C";
  const padrao = TAMANHOS_PADRAO_ARTE[ed.template];
  const paleta = marca.cores;
  const mudarCarrossel = (carrossel: ConfigCarrossel) => mudarArte({ carrossel });

  // Arte pronta (linha 68): a arte final fica na prévia; aqui, Editar arte e a versão Story.
  if (ed.arteFinal && !ed.editandoArte) {
    const n = ed.arteUrls.length;
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-success/10 px-4 py-3">
          <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-display text-sm font-bold text-primary">Arte pronta</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {n > 1 ? `${n} pranchetas. Use as setas da prévia para ver cada uma.` : "Ela está na prévia ao lado, do jeito que vai para a aprovação."} O menu Baixar fica na prévia.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => mudar({ editandoArte: true })} className={pilulaAcao}>
            <Pencil aria-hidden className="h-3.5 w-3.5" /> Editar arte
          </button>
          <button type="button" onClick={onGerarStory} disabled={!podeStory.ok} className={pilulaAcao}>
            {ocupado === "story" ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : <Smartphone aria-hidden className="h-3.5 w-3.5" />}
            {ocupado === "story" ? "Gerando o Story…" : ed.storyUrls.length ? "Gerar o Story de novo" : "Gerar versão Story"}
          </button>
          {!podeStory.ok && ocupado !== "story" && <span className="text-[11px] text-muted-foreground">{podeStory.motivo}</span>}
        </div>
        {ed.storyUrls.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            Story 9:16 pronto{ed.storyUrls.length > 1 ? `, ${ed.storyUrls.length} telas` : ""}. Veja na prévia, em Story.
          </p>
        )}
      </div>
    );
  }

  // Busca no acervo simulada (Magnific/Freepik via n8n no real).
  const buscar = (limite: number, termo = ed.buscaAcervo) => {
    if (!termo.trim()) return;
    setAcervo((a) => ({ ...a, termo, limite, status: "carregando" }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (acervoDemo === "erro") {
        setAcervo({ termo, limite, status: "erro", itens: [] });
        return;
      }
      const itens = acervoDemo === "vazio" ? [] : acervoDeExemplo(termo).slice(0, limite);
      setAcervo({ termo, limite, status: "pronto", itens });
    }, 700);
  };

  const finalizar = podeFinalizarArte({
    postSalvo: liberada,
    modelo: ed.template,
    temImagem: Boolean(ed.imagemUrl),
    titulo: tituloDaArte(ed.tituloArte, ed.tituloSugerido),
    ocupado: Boolean(ocupado),
  });

  const opcoes: { id: OrigemImagem; titulo: string; icone: ReactNode }[] = [
    { id: "ia", titulo: "Gerar com a IA", icone: <IaDigisystem size={16} /> },
    { id: "acervo", titulo: "Buscar no acervo", icone: <Search aria-hidden className="h-3.5 w-3.5" /> },
    { id: "enviar", titulo: "Enviar arquivo", icone: <Upload aria-hidden className="h-3.5 w-3.5" /> },
  ];

  const usarImagem = (url: string) => mudar({ imagemUrl: url });

  // Função (e não componente) para as miniaturas não remontarem a cada render.
  const miniatura = (url: string, descricao: string, legenda = false, chave?: string) => {
    const emUso = ed.imagemUrl === url;
    return (
      <button
        key={chave}
        type="button"
        onClick={() => usarImagem(url)}
        aria-pressed={emUso}
        aria-label={`${emUso ? "Imagem em uso" : "Usar esta imagem"}: ${descricao}`}
        title={emUso ? "Imagem em uso" : "Usar esta imagem"}
        className={cn(
          "overflow-hidden rounded-xl border bg-card text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent",
          emUso ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-background" : "border-border",
        )}
      >
        <img src={url} alt="" className="aspect-square w-full object-cover" />
        {legenda && <span className="block truncate px-2 py-1 text-[10px] text-muted-foreground">{descricao}</span>}
      </button>
    );
  };

  const temImagem = Boolean(ed.imagemUrl);
  const contexto = temImagem
    ? "Imagem escolhida. Ajuste o texto e o estilo; a prévia ao lado mostra como a arte fica."
    : "Escolha o modelo e a imagem. A prévia ao lado muda a cada ajuste, antes mesmo de finalizar.";

  return (
    <div className="relative">
      {/* Linha 66: enquanto o compositor trabalha, o painel inteiro fica travado. */}
      {ocupado === "arte" && <PainelFinalizando />}
    <div className="space-y-6" inert={ocupado === "arte"} aria-busy={ocupado === "arte" || undefined}>
      <p className="text-xs text-muted-foreground">{contexto}</p>

      {/* 1. Modelo */}
      <div>
        <span className={rotulo}>Modelo</span>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Modelo da arte">
          {MODELOS.map((t) => {
            const ativo = ed.template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => mudar({ template: t.id })}
                className={cn(
                  "flex items-center gap-3 rounded-2xl p-3 text-left transition-all duration-300",
                  ativo ? "-translate-y-0.5 bg-primary text-primary-foreground shadow-card" : "bg-card text-foreground shadow-card hover:-translate-y-0.5",
                )}
              >
                <Esquema id={t.id} ativo={ativo} />
                <span className="min-w-0">
                  <span className="block font-display text-sm font-bold">{t.titulo}</span>
                  <span className={cn("mt-0.5 block text-[11px] leading-snug", ativo ? "text-primary-foreground/75" : "text-muted-foreground")}>{t.texto}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Imagem */}
      <div>
        <span className={rotulo}>Imagem</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {opcoes.map((o) => (
            <Pilula key={o.id} ativa={ed.origemImagem === o.id} onClick={() => mudar({ origemImagem: ed.origemImagem === o.id ? undefined : o.id })}>
              {o.icone} {o.titulo}
            </Pilula>
          ))}
        </div>

        {ed.origemImagem === "ia" && (
          <div className="animate-rise mt-3 space-y-3 rounded-2xl bg-background/60 p-4">
            <label className="block">
              <span className="text-[11px] font-semibold text-muted-foreground">Prompt da imagem</span>
              <textarea
                value={ed.descricaoImagem}
                onChange={(e) => mudar({ descricaoImagem: e.target.value })}
                rows={4}
                placeholder="Descreva a imagem desejada…"
                className={cn(campo, "resize-none")}
              />
            </label>
            {ocupado === "imagem" ? (
              <div className="gerando-aurora flex items-center gap-3 px-4 py-4">
                <IaDigisystem size={40} estado="processando" />
                <div>
                  <p className="font-display text-sm font-bold text-white">Gerando as opções de imagem…</p>
                  <p className="text-[11px] text-white/75">No real costuma levar até 2 minutos.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <BotaoIa onClick={onAbrirChat} disabled={Boolean(ocupadoIa)}>
                  Descrever com a IA
                </BotaoIa>
                <button type="button" onClick={onGerarOpcoes} disabled={!ed.descricaoImagem.trim()} className={botaoAzul}>
                  <IaDigisystem size={18} /> Gerar opções
                </button>
                {!ed.descricaoImagem.trim() && <span className="text-[11px] text-muted-foreground">Escreva o prompt ou use "Descrever com a IA".</span>}
              </div>
            )}
            {ed.candidatas.length > 0 ? (
              <div className="space-y-2">
                <p className="font-display text-[11px] font-bold text-foreground">Opções geradas: escolha a que vai para a arte</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {ed.candidatas.map((url, i) => (
                    <div key={url} className="w-24 shrink-0">
                      {miniatura(url, `Opção ${ed.candidatas.length - i}`)}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">As opções valem só enquanto o Estúdio está aberto. A escolhida fica no post.</p>
              </div>
            ) : (
              ocupado !== "imagem" && <p className="text-[11px] text-muted-foreground">Gere as opções primeiro. Elas aparecem aqui para você escolher antes de finalizar a arte.</p>
            )}
          </div>
        )}

        {ed.origemImagem === "acervo" && (
          <div className="animate-rise mt-3 space-y-3 rounded-2xl bg-background/60 p-4">
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                buscar(ACERVO.porVez);
              }}
            >
              <label className="relative block min-w-[12rem] flex-1">
                <span className="sr-only">Termo da busca no acervo</span>
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input value={ed.buscaAcervo} onChange={(e) => mudar({ buscaAcervo: e.target.value })} placeholder="Buscar por termo…" className={cn(campo, "mt-0 pl-8")} />
              </label>
              <button type="submit" disabled={!ed.buscaAcervo.trim() || acervo.status === "carregando"} className={botaoAzul}>
                {acervo.status === "carregando" ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : <Search aria-hidden className="h-3.5 w-3.5" />} Buscar
              </button>
              <BotaoIa onClick={() => onIa("buscar-termos")} ocupado={ocupadoIa === "buscar-termos"} disabled={Boolean(ocupadoIa)}>
                Sugerir termos
              </BotaoIa>
            </form>
            {ed.termos.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">Termos sugeridos:</span>
                {ed.termos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => mudar({ buscaAcervo: t })}
                    className="rounded-full bg-sky-soft px-2.5 py-0.5 font-display text-[11px] font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {acervo.status === "carregando" && acervo.itens.length === 0 ? (
              <div className="grid h-24 place-items-center rounded-2xl border border-dashed border-border" aria-label="Buscando">
                <Loader2 aria-hidden className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : acervo.status === "erro" ? (
              <div role="alert" className="grid h-24 place-items-center rounded-2xl border border-dashed border-destructive/40 px-3 text-center text-[11px] text-destructive">
                Não foi possível buscar agora, tente novamente.
              </div>
            ) : acervo.itens.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  {acervo.itens.length} {acervo.itens.length === 1 ? "imagem" : "imagens"} para "{acervo.termo}"
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {acervo.itens.map((img) => miniatura(img.url, img.descricao, true, img.id))}
                </div>
                {temMaisNoAcervo(acervo.itens.length, acervo.limite) && (
                  <button type="button" onClick={() => buscar(proximoLimiteAcervo(acervo.limite), acervo.termo)} disabled={acervo.status === "carregando"} className={pilulaAcao}>
                    {acervo.status === "carregando" ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : <Search aria-hidden className="h-3.5 w-3.5" />} Buscar mais
                  </button>
                )}
              </div>
            ) : (
              <div className="grid h-24 place-items-center rounded-2xl border border-dashed border-border text-[11px] text-muted-foreground">
                {acervo.status === "pronto" ? "Nenhum resultado" : "Digite um termo para buscar"}
              </div>
            )}
          </div>
        )}

        {ed.origemImagem === "enviar" && (
          <div className="animate-rise mt-3 rounded-2xl border-2 border-dashed border-border bg-background/60 p-4">
            <p className="mb-3 text-xs text-muted-foreground">No protótipo não há envio de arquivo. Escolha uma das imagens de exemplo, como se fosse a sua.</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {IMAGENS_EXEMPLO.map((img) => miniatura(img.url, img.descricao, false, img.id))}
            </div>
          </div>
        )}

        {ed.imagemUrl && (
          <div className="animate-rise mt-3 flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
            <img src={ed.imagemUrl} alt="Imagem escolhida para a arte" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-primary">Imagem da arte</p>
              <p className="text-[11px] text-muted-foreground">O modelo e a identidade da Marca entram por cima dela.</p>
            </div>
            <button
              type="button"
              onClick={() => mudar({ imagemUrl: undefined, origemImagem: ed.origemImagem ?? "acervo" })}
              className={acaoLeve}
            >
              Trocar imagem
            </button>
            <button type="button" onClick={() => mudar({ imagemUrl: undefined })} className={acaoLeve} aria-label="Remover a imagem" title="Remover a imagem">
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Texto da arte */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={rotulo}>{ehCarrossel ? `Texto da arte · ${rotuloPrancheta(cfg.carrossel, cfg.carrossel.editando)}` : "Texto da arte"}</span>
          {ehCarrossel ? (
            <BotaoIa onClick={() => onIa("montar-carrossel")} ocupado={ocupadoIa === "montar-carrossel"} disabled={Boolean(ocupadoIa)}>
              Montar o carrossel com a IA
            </BotaoIa>
          ) : (
            <BotaoIa onClick={() => onIa("escrever-textos")} ocupado={ocupadoIa === "escrever-textos"} disabled={Boolean(ocupadoIa)}>
              Escrever os textos da arte
            </BotaoIa>
          )}
        </div>
        {ehCarrossel && confirmarMontar && <ConfirmarMontar onConfirmar={onConfirmarMontar} onCancelar={onCancelarMontar} />}
        {ehCarrossel && <TextoPrancheta c={cfg.carrossel} onMudar={mudarCarrossel} />}
        {(!ehCarrossel || cfg.carrossel.editando === "capa") && (
        <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
          <CampoTextoArte
            rotuloCampo={ehCarrossel ? "Título da capa" : "Título (obrigatório)"}
            valor={ed.tituloArte}
            onMudar={(v) => mudar({ tituloArte: v })}
            placeholder={ed.tituloSugerido ? `Sugestão da IA: ${ed.tituloSugerido}` : "Título da arte (Enter quebra linha)"}
            guia={LIMITES_CONTEUDO.palavrasTitulo}
            palavras={contarPalavras(ed.tituloArte || ed.tituloSugerido)}
            realcado={realce.includes("titulo")}
            dica={!ed.tituloArte.trim() && ed.tituloSugerido ? "Vazio, a arte usa a sugestão da IA. Nunca a legenda." : undefined}
          />
          <CampoTextoArte
            rotuloCampo="Subtítulo (opcional)"
            valor={ed.subtituloArte}
            onMudar={(v) => mudar({ subtituloArte: v })}
            placeholder={ed.template === "B" ? "Vazio, entra \"Descubra no blog\"" : "Pode ficar vazio"}
            guia={LIMITES_CONTEUDO.palavrasSubtitulo}
            palavras={contarPalavras(ed.subtituloArte)}
            realcado={realce.includes("subtitulo")}
          />
        </div>
        )}
        {ehCarrossel && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Nos slides e na chamada final, escreva <span className="font-semibold text-primary">**assim**</span> para pintar o trecho na cor de destaque da marca. Na capa as marcas só somem.
          </p>
        )}
        {ed.template === "A" && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-background/60 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground">Destaque do subtítulo</p>
              <p className="text-[10px] text-muted-foreground">Selo arredondado atrás do subtítulo.</p>
            </div>
            <ParPilulas
              rotulo="Destaque do subtítulo"
              opcoes={[
                { id: "nao", label: "Sem selo" },
                { id: "sim", label: "Com selo" },
              ]}
              valor={cfg.destaqueSubtitulo ? "sim" : "nao"}
              onMudar={(v) => mudarArte({ destaqueSubtitulo: v === "sim" })}
            />
            {cfg.destaqueSubtitulo && <ColorHexInput rotulo="Cor do selo" value={cfg.corSelo} onChange={(hex) => mudarArte({ corSelo: hex })} paleta={paleta} />}
          </div>
        )}
      </div>

      {/* 4. Ajustes: Básico | Avançado */}
      <div className="rounded-3xl bg-background/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={rotulo}>Ajustes</span>
          <ParPilulas
            rotulo="Nível dos ajustes"
            opcoes={[
              { id: "basico", label: "Básico" },
              { id: "avancado", label: "Avançado" },
            ]}
            valor={cfg.ajustes}
            onMudar={(v) => mudarArte({ ajustes: v })}
          />
        </div>

        {cfg.ajustes === "basico" ? (
          <div className="mt-4 space-y-5">
            {ed.template === "A" && (
              <Grupo titulo="Posição do texto" dica="Clique de novo para voltar à posição automática.">
                <div className="flex flex-wrap gap-2">
                  {(["topo", "centro", "rodape"] as PosicaoTexto[]).map((p) => (
                    <Pilula
                      key={p}
                      ativa={cfg.posicaoTexto === p && !cfg.textoYPct}
                      onClick={() => mudarArte({ posicaoTexto: cfg.posicaoTexto === p && !cfg.textoYPct ? null : p, textoXPct: "", textoYPct: "" })}
                    >
                      {p === "topo" ? "Topo" : p === "centro" ? "Centro" : "Rodapé"}
                    </Pilula>
                  ))}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Ordem:</span>
                  <ParPilulas
                    rotulo="Ordem do título e do subtítulo"
                    opcoes={[
                      { id: "titulo", label: "Título em cima" },
                      { id: "subtitulo", label: "Subtítulo em cima" },
                    ]}
                    valor={cfg.tituloAcima ? "titulo" : "subtitulo"}
                    onMudar={(v) => mudarArte({ tituloAcima: v === "titulo" })}
                  />
                </div>
              </Grupo>
            )}

            <Grupo titulo="Logo">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  Versão
                  <select
                    value={cfg.logoId ?? ""}
                    onChange={(e) => mudarArte({ logoId: e.target.value || null })}
                    className="h-8 rounded-xl border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
                  >
                    <option value="">{ehCarrossel ? "Automática (branca em fundo escuro)" : "Logo principal"}</option>
                    {marca.logos.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
                {ehCarrossel && (
                  <ParPilulas
                    rotulo="Exibir logo no carrossel"
                    opcoes={[
                      { id: "com", label: "Com logo" },
                      { id: "sem", label: "Sem logo" },
                    ]}
                    valor={cfg.logoOculto ? "sem" : "com"}
                    onMudar={(v) => mudarArte({ logoOculto: v === "sem" })}
                  />
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-start gap-5">
                <div>
                  <p className="mb-1.5 text-[11px] text-muted-foreground">Posição</p>
                  <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Posição do logo">
                    {POSICOES_LOGO.map((p) => {
                      const ativa = cfg.logoPosicao === p.valor && !cfg.logoXPct && !cfg.logoYPct;
                      return (
                        <button
                          key={p.valor}
                          type="button"
                          title={p.label}
                          aria-label={p.label}
                          aria-pressed={ativa}
                          onClick={() => mudarArte({ logoPosicao: ativa ? null : p.valor, logoXPct: "", logoYPct: "" })}
                          className={cn(
                            "grid h-8 w-10 place-items-center rounded-lg border text-xs transition-all duration-300",
                            ativa ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-primary",
                          )}
                        >
                          {p.icone}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] text-muted-foreground">Tamanho</p>
                  <div className="flex gap-1.5" role="group" aria-label="Tamanho do logo">
                    {(["P", "M", "G"] as const).map((t) => {
                      const ativo = cfg.logoTamanho === t && !cfg.logoLarguraPct && !cfg.logoAlturaPct;
                      return (
                        <button
                          key={t}
                          type="button"
                          aria-pressed={ativo}
                          title={`${marca.tamanhosLogo[t]}% da arte`}
                          onClick={() => mudarArte({ logoTamanho: ativo ? null : t, logoLarguraPct: "", logoAlturaPct: "" })}
                          className={cn(
                            "h-8 w-10 rounded-full font-display text-xs font-bold transition-all duration-300",
                            ativo ? "bg-primary text-primary-foreground shadow-card" : "border border-border bg-card text-muted-foreground hover:text-primary",
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    P {marca.tamanhosLogo.P}% · M {marca.tamanhosLogo.M}% · G {marca.tamanhosLogo.G}%, de Marca → Logos e fundos.
                  </p>
                </div>
              </div>
            </Grupo>

            {ed.template === "B" && marca.fundos.length > 0 && (
              <Grupo titulo="Fundo das bandas" dica="Imagens de fundo do Brand Kit.">
                <div className="flex flex-wrap gap-2">
                  <Pilula ativa={cfg.fundoId === null} onClick={() => mudarArte({ fundoId: null })}>
                    <span aria-hidden className="h-3.5 w-3.5 rounded-full border border-black/10 bg-primary" /> Fundo padrão do template
                  </Pilula>
                  {marca.fundos.map((f) => (
                    <Pilula key={f.id} ativa={cfg.fundoId === f.id} onClick={() => mudarArte({ fundoId: f.id })}>
                      <span aria-hidden className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: f.hex }} /> {f.label}
                    </Pilula>
                  ))}
                </div>
              </Grupo>
            )}

            {ehCarrossel && <AjustesPranchetaCarrossel modo="basico" c={cfg.carrossel} onMudar={mudarCarrossel} marca={marca} temImagem={temImagem} />}
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            {!ehCarrossel ? (
              <Grupo titulo="Tipografia" dica="A fonte vale para o título e o subtítulo, que é como o compositor desenha.">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="text-[11px] text-muted-foreground">Fonte</span>
                    <select
                      value={cfg.fonte}
                      onChange={(e) => mudarArte({ fonte: e.target.value })}
                      className="mt-1 h-8 w-full rounded-xl border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
                      style={cfg.fonte ? { fontFamily: cfg.fonte } : undefined}
                    >
                      <option value="">Padrão do template (Dosis)</option>
                      {FONTES_ESTUDIO.map((f) => (
                        <option key={f} value={f} style={{ fontFamily: f }}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Cor do título</span>
                    <div className="mt-1">
                      <ColorHexInput rotulo="Cor do título" value={cfg.corTitulo} onChange={(hex) => mudarArte({ corTitulo: hex })} paleta={paleta} />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Cor do subtítulo</span>
                    <div className="mt-1">
                      <ColorHexInput rotulo="Cor do subtítulo" value={cfg.corSubtitulo} onChange={(hex) => mudarArte({ corSubtitulo: hex })} paleta={paleta} />
                    </div>
                  </div>
                </div>
              </Grupo>
            ) : (
              <p className="rounded-2xl bg-sky-soft/60 px-3 py-2 text-[11px] text-primary">No carrossel, fonte, cores e tamanhos se ajustam em cada slide.</p>
            )}

            <Grupo titulo="Degradê da marca (opcional)" dica="O centro da bússola é sem degradê.">
              <div className="flex flex-wrap items-start gap-5">
                <div className="grid w-fit grid-cols-3 gap-1.5" role="group" aria-label="Direção do degradê">
                  {BUSSOLA_DEGRADE.map((d, i) =>
                    d ? (
                      <button
                        key={d.valor}
                        type="button"
                        title={d.label}
                        aria-label={d.label}
                        aria-pressed={cfg.degrade === d.valor}
                        onClick={() => mudarArte({ degrade: d.valor })}
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-lg border text-sm transition-all duration-300",
                          cfg.degrade === d.valor ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-primary",
                        )}
                      >
                        {d.icone}
                      </button>
                    ) : (
                      <button
                        key={`nenhum-${i}`}
                        type="button"
                        title="Sem degradê"
                        aria-label="Sem degradê"
                        aria-pressed={cfg.degrade === null}
                        onClick={() => mudarArte({ degrade: null })}
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-lg border transition-all duration-300",
                          cfg.degrade === null ? "border-primary bg-navy-soft text-primary" : "border-border bg-card text-muted-foreground hover:text-primary",
                        )}
                      >
                        <Ban aria-hidden className="h-4 w-4" />
                      </button>
                    ),
                  )}
                </div>
                {cfg.degrade && (
                  <div className="min-w-[14rem] flex-1 space-y-3">
                    <label className="block">
                      <span className="text-[11px] text-muted-foreground">Intensidade: {cfg.degradeIntensidade}%</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={cfg.degradeIntensidade}
                        onChange={(e) => mudarArte({ degradeIntensidade: Number(e.target.value) })}
                        className="mt-1 block w-full accent-[var(--accent)]"
                      />
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <CorDaMarca
                        rotuloCor="Cor inicial"
                        valor={cfg.degradeCorInicio}
                        padrao={paleta[1]?.hex ?? "#ff6d2d"}
                        paleta={paleta}
                        onMudar={(hex) => mudarArte({ degradeCorInicio: hex })}
                      />
                      <CorDaMarca
                        rotuloCor="Cor final"
                        valor={cfg.degradeCorFim}
                        padrao={paleta[0]?.hex ?? "#36499b"}
                        paleta={paleta}
                        onMudar={(hex) => mudarArte({ degradeCorFim: hex })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Grupo>

            {ed.template === "A" && (
              <Grupo titulo="Posição do texto" dica="Em % da arte. Vazio = automático. Largura também muda quantas letras cabem por linha.">
                <div className="flex flex-wrap gap-3">
                  <CampoPct rotuloCampo="X %" valor={cfg.textoXPct} onMudar={(v) => mudarArte({ textoXPct: v })} />
                  <CampoPct rotuloCampo="Y %" valor={cfg.textoYPct} onMudar={(v) => mudarArte({ textoYPct: v })} />
                  <CampoPct rotuloCampo="Largura %" valor={cfg.textoLarguraPct} onMudar={(v) => mudarArte({ textoLarguraPct: v })} />
                </div>
              </Grupo>
            )}

            <Grupo titulo="Logo" dica="Setas movem 3% (com Shift, 1%). Vazio = automático.">
              <div className="flex flex-wrap items-start gap-5">
                <DPad
                  onMover={(dx, dy, fino) => {
                    const atual = posicaoLogoPct({ modelo: ed.template, cfg, marca });
                    const nova = moverLogo(atual, dx, dy, fino);
                    mudarArte({ logoXPct: String(nova.xPct), logoYPct: String(nova.yPct) });
                  }}
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-3">
                    <CampoPct rotuloCampo="X %" valor={cfg.logoXPct} onMudar={(v) => mudarArte({ logoXPct: v })} />
                    <CampoPct rotuloCampo="Y %" valor={cfg.logoYPct} onMudar={(v) => mudarArte({ logoYPct: v })} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <CampoPct rotuloCampo="Largura %" valor={cfg.logoLarguraPct} onMudar={(v) => mudarArte({ logoLarguraPct: v })} />
                    <CampoPct rotuloCampo="Altura %" valor={cfg.logoAlturaPct} onMudar={(v) => mudarArte({ logoAlturaPct: v })} />
                  </div>
                </div>
              </div>
            </Grupo>

            {!ehCarrossel && (
              <Grupo titulo="Tamanhos">
                <div className="flex flex-wrap gap-6">
                  <Stepper
                    rotuloCampo="Tamanho do título"
                    valor={cfg.tamanhoTitulo}
                    padrao={padrao.titulo}
                    onMudar={(s) => mudarArte({ tamanhoTitulo: passoTamanhoFonte(cfg.tamanhoTitulo, padrao.titulo, s) })}
                    onPadrao={() => mudarArte({ tamanhoTitulo: undefined })}
                  />
                  <Stepper
                    rotuloCampo="Tamanho do subtítulo"
                    valor={cfg.tamanhoSubtitulo}
                    padrao={padrao.subtitulo}
                    onMudar={(s) => mudarArte({ tamanhoSubtitulo: passoTamanhoFonte(cfg.tamanhoSubtitulo, padrao.subtitulo, s) })}
                    onPadrao={() => mudarArte({ tamanhoSubtitulo: undefined })}
                  />
                </div>
              </Grupo>
            )}

            {ehCarrossel && <AjustesPranchetaCarrossel modo="avancado" c={cfg.carrossel} onMudar={mudarCarrossel} marca={marca} temImagem={temImagem} />}
          </div>
        )}
      </div>

      {/* Finalizar arte (linhas 65 a 67, 71): processando, falhou com motivo, Gerar novamente. */}
      <div className="space-y-3 border-t border-border pt-4">
        {ed.arteErro && ocupado !== "arte" && (
          <div role="alert" className="flex flex-wrap items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3">
            <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="min-w-[12rem] flex-1">
              <p className="font-display text-sm font-bold text-destructive">A composição falhou.</p>
              <p className="mt-0.5 text-xs text-foreground/80">{ed.arteErro}</p>
            </div>
            <button type="button" onClick={onFinalizar} disabled={!finalizar.ok} className={pilulaAcao}>
              <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Tentar novamente
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onFinalizar} disabled={!finalizar.ok} className={botaoAzul}>
            {ehCarrossel ? <Images aria-hidden className="h-3.5 w-3.5" /> : ed.template === "B" ? <LayoutTemplate aria-hidden className="h-3.5 w-3.5" /> : <ImageIcon aria-hidden className="h-3.5 w-3.5" />}
            {ed.arteFinal ? "Gerar novamente" : "Finalizar arte"}
          </button>
          {ed.arteFinal && (
            <button type="button" onClick={() => mudar({ editandoArte: false })} className={pilulaAcao}>
              Ver a arte pronta
            </button>
          )}
          <span className="text-[11px] text-muted-foreground">
            {finalizar.ok
              ? ed.arteFinal
                ? "A arte pronta continua valendo até você gerar de novo."
                : "A arte final sai igual à prévia."
              : finalizar.motivo}
          </span>
        </div>
      </div>
    </div>
    </div>
  );
}

// ─── Peças dos controles ──────────────────────────────────────────────────

function CampoTextoArte({
  rotuloCampo,
  valor,
  onMudar,
  placeholder,
  guia,
  palavras,
  realcado,
  dica,
}: {
  rotuloCampo: string;
  valor: string;
  onMudar: (v: string) => void;
  placeholder: string;
  guia: number;
  palavras: number;
  realcado: boolean;
  dica?: string;
}) {
  return (
    <label className={cn("block rounded-xl transition-all duration-500", realcado && "ring-2 ring-accent ring-offset-4 ring-offset-card")}>
      <span className="text-[11px] font-semibold text-muted-foreground">{rotuloCampo}</span>
      <textarea value={valor} onChange={(e) => onMudar(e.target.value)} rows={2} placeholder={placeholder} className={cn(campo, "mt-1 resize-none")} />
      {/* D6: o limite de palavras é guia, nunca barra. */}
      <span className={cn("mt-1 block text-[11px]", palavras > guia ? "font-semibold text-warning" : "text-muted-foreground")}>
        {palavras} de até {guia} palavras, pelo guia da marca{dica ? `. ${dica}` : ""}
      </span>
    </label>
  );
}

/** D-pad do logo: passo de 3%, com Shift 1% (linha 49). */
function DPad({ onMover }: { onMover: (dx: number, dy: number, fino: boolean) => void }) {
  const b = (rot: string, aria: string, dx: number, dy: number, classe: string) => (
    <button
      type="button"
      aria-label={aria}
      onClick={(e) => onMover(dx, dy, e.shiftKey)}
      className={cn("grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-xs text-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card", classe)}
    >
      {rot}
    </button>
  );
  return (
    <div className="grid w-fit grid-cols-3 gap-1" role="group" aria-label="Mover o logo">
      {b("▲", "Mover logo para cima", 0, -1, "col-start-2")}
      {b("◄", "Mover logo para a esquerda", -1, 0, "col-start-1 row-start-2")}
      <span aria-hidden className="col-start-2 row-start-2 grid h-8 w-8 place-items-center rounded-lg bg-navy-soft font-display text-[9px] font-bold text-primary">
        logo
      </span>
      {b("►", "Mover logo para a direita", 1, 0, "col-start-3 row-start-2")}
      {b("▼", "Mover logo para baixo", 0, 1, "col-start-2 row-start-3")}
    </div>
  );
}

/** Cor do degradê com "usar cor da marca" (volta ao padrão) como no real. */
function CorDaMarca({
  rotuloCor,
  valor,
  padrao,
  paleta,
  onMudar,
}: {
  rotuloCor: string;
  valor: string;
  padrao: string;
  paleta: { hex: string; label: string }[];
  onMudar: (hex: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground">{rotuloCor}</span>
        {valor && (
          <button type="button" onClick={() => onMudar("")} className="text-[10px] font-semibold text-primary underline-offset-2 hover:underline">
            usar cor da marca
          </button>
        )}
      </div>
      <div className="mt-1">
        <ColorHexInput rotulo={rotuloCor} value={valor || padrao} onChange={onMudar} paleta={paleta} />
      </div>
    </div>
  );
}
