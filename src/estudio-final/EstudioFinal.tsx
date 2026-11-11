// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/routes/_authenticated/estudio.tsx, src/hub/components/shell/*,
//   src/components/estudio/{SobreOPost,EnviarSecao,IndicadorObrigatorios,AgenteMolecula,ArteStep,
//   DirecaoCriativaStep,TemplateLivePreview,PostPreview}.tsx, src/lib/{estudio-fonts,estudio-regras}.ts
//   e as classes `agente-*` de src/styles.css @ leitura 2026-10 (clone mhdgst-trabalho, somente leitura).
//   Arranjo do passo Conteúdo: prototipos/react/src/estudio-conteudo/EstudioConteudo.tsx (rodada 6, aprovado).
// Fonte da verdade = clone real. Regenerar (não remendar) se o real mudar.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
// Refino pós-feedback: 2 colunas, sem trilho, Briefing (2026-11-04).
// Refino pós-feedback 2: exportar SVG, carregamento IA, acervo, seleção larga, botões de continuidade,
//   parecer, sem ícone de rede (2026-11-04). Aqui: a SelecaoAmpla (candidatas/acervo) é montada DENTRO da
//   coluna da arte (âncora à direita, cobre a coluna do texto em lg+, tela inteira abaixo); a escolha agora
//   é selecionar + “Usar esta imagem” (duplo clique usa direto); “Personalizar em detalhe” e “Revisar e
//   enviar” usam o BotaoContinuidade; o Parecer recebe ações “Ir para…” por item a ajustar.
//
// LAYOUT (3 colunas REJEITADO; trilho “Sobre o post · Texto · Arte · Enviar” REMOVIDO):
//   • topo: trilha Posts › Criar post, ações “Novo post” e “Salvar rascunho” (visível em todos os tamanhos)
//     e o stepper fino “Etapa N/3 · <nome>” com trilho laranja SÓLIDO;
//   • Etapa 1 Briefing: formulário | Resumo do briefing (lg: 2 colunas);
//   • Etapa 2 Conteúdo: TEXTO à esquerda | ARTE à direita (sticky em lg), como em estudio-conteudo; abaixo,
//     a bifurcação “Revisar e enviar” / “Personalizar em detalhe”;
//   • Etapa 3 Revisar e enviar: prévia POR REDE (IG/LI/FB, Story vertical) à esquerda | Parecer da IA +
//     envio à direita.
// Abaixo de lg tudo empilha na ordem do DOM: no Conteúdo, TEXTO primeiro e ARTE depois (mesma ordem visual,
// de teclado e de leitor de tela; a IA já escreveu o texto, então a pessoa confere e desce para a imagem).
import { ChevronLeft, ChevronRight, FilePlus, Save, Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { type IaEstado } from "../IaDigisystem";
import { AgenteFinal, type PainelAgente } from "./AgenteFinal";
import { Briefing, ResumoPost } from "./Contexto";
import { Gaveta } from "./Gaveta";
import { HubShellMock } from "./HubShellMock";
import { PainelArte } from "./PainelArte";
import { PortalPreview } from "./PortalPreview";
import { QuadroArte, SelecaoAmpla, cenaDoAcervo, estaSelecionando, type Quadro } from "./QuadroArte";
import { ParecerIA, EnviarSecao, type AlvoAjuste, type AvisoParecer, type Pendencia, type ResultadoParecer } from "./Revisar";
import { TextoSecao } from "./TextoSecao";
import {
  type Ajustes, type Estilo, type Formato, type RedeId, type Slide,
  AJUSTES_PADRAO, CTA_INICIAL, CTA_NOVO, HASHTAGS_INICIAL, HASHTAGS_NOVAS, FONTES_HREF,
  LEGENDA_INICIAL, LEGENDA_NOVA, LIMITE_PALAVRAS_SUBTITULO, LIMITE_PALAVRAS_TITULO,
  SLIDES_INICIAIS, contarPalavras,
} from "./efData";
import { BotaoContinuidade, FOCO, Spinner } from "./ui";
import { useAIGeneration } from "./escrever-ia/useAIGeneration";

/** Chamada de IA FALSA do protótipo: resolve em ~6,5 s (ou rejeita em ~1,5 s quando `deveFalhar()`), respeitando o cancelamento. */
function gerarTextoMock(signal: AbortSignal, deveFalhar: () => boolean) {
  return new Promise<void>((resolve, reject) => {
    const falha = deveFalhar();
    const id = window.setTimeout(() => (falha ? reject(new Error("A IA não respondeu")) : resolve()), falha ? 1500 : 6500);
    signal.addEventListener("abort", () => {
      window.clearTimeout(id);
      reject(new DOMException("Cancelado", "AbortError"));
    });
  });
}

const TITULOS_ALT = [
  { titulo: "Dado bom decide mais rápido", subtitulo: "Regras claras para a sua base de dados", etiqueta: "Governança de dados" },
  { titulo: "Menos planilha, mais decisão", subtitulo: "Como organizar a informação da operação", etiqueta: "Dados" },
];
const TERMOS_BANIDOS = ["otimizar", "potencializar", "revolucionar", "garantir", "alavancar", "maximizar", "sinergia"];
const ETAPAS = ["Briefing", "Conteúdo", "Revisar e enviar"] as const;

function rolarPara(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
}

export function EstudioFinal() {
  /* ---------- fontes reais (subconjunto de ESTUDIO_FONTES) ---------- */
  useEffect(() => {
    if (document.getElementById("ef-fontes")) return;
    const l = document.createElement("link");
    l.id = "ef-fontes";
    l.rel = "stylesheet";
    l.href = FONTES_HREF;
    document.head.appendChild(l);
  }, []);

  /* ---------- timers com limpeza ---------- */
  const timers = useRef<number[]>([]);
  const agenda = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  const intervalo = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      window.clearInterval(intervalo.current);
    },
    [],
  );

  /* ---------- fluxo ---------- */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [espaco, setEspaco] = useState<string | null>(null);
  const [tema, setTema] = useState("Governança de dados na prática");
  const [redes, setRedes] = useState<RedeId[]>(["instagram"]);
  const [contexto, setContexto] = useState("");
  const [segmentos, setSegmentos] = useState<string[]>(["Governo"]);
  /* “Escrever com a IA” (componente 07 adaptado). ESTADO COMPARTILHADO: o botão do Briefing e a ação do agente
     (“escrever-briefing”) chamam a MESMA geração (escrita.start). A chamada é MOCK (temporizador).
     No app real: (1) o check de cada etapa do checklist só pode aparecer quando a etapa realmente terminou
     (resultado real da API), nunca porque o relógio passou; (2) o progresso é estimado e fica abaixo de 100%
     até a resposta chegar (ver useEstimatedProgress).
     Estado de erro para verificação, sem chrome na tela: abrir http://localhost:5199/?erro-ia#/estudio-final
     (query string, lida em gerarTextoMock). A 1ª tentativa falha; “Tentar de novo” funciona. */
  const falhouUmaVez = useRef(false);
  const escrita = useAIGeneration<void>(
    (signal) =>
      gerarTextoMock(signal, () => {
        const forcarErro = /erro-ia/.test(window.location.search + window.location.hash);
        if (forcarErro && !falhouUmaVez.current) {
          falhouUmaVez.current = true;
          return true;
        }
        return false;
      }),
    { expectedMs: 6000 },
  );
  const escrevendo = escrita.state === "loading";
  /* mudou o briefing depois do “Texto pronto”: o resultado deixou de corresponder, volta ao repouso */
  useEffect(() => {
    if (escrita.state === "success") escrita.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [espaco, tema, redes, contexto]);
  const [rascunho, setRascunho] = useState<"nao" | "salvando" | "salvo">("nao");

  /* ---------- texto ---------- */
  const [legenda, setLegenda] = useState(LEGENDA_INICIAL);
  const [hashtags, setHashtags] = useState(HASHTAGS_INICIAL);
  const [cta, setCta] = useState(CTA_INICIAL);
  const [gerandoTexto, setGerandoTexto] = useState(false);
  const [variante, setVariante] = useState(0);

  /* ---------- arte ---------- */
  const [estilo, setEstilo] = useState<Estilo>("A");
  const [formato, setFormato] = useState<Formato>("feed");
  const [slides, setSlides] = useState<Slide[]>(SLIDES_INICIAIS);
  const [cur, setCur] = useState(0);
  const [aj, setAjState] = useState<Ajustes>(AJUSTES_PADRAO);
  const [quadro, setQuadro] = useState<Quadro>({ t: "zonas" });
  const [finalizada, setFinalizada] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [storyPronta, setStoryPronta] = useState(false);
  const [gerandoStory, setGerandoStory] = useState(false);
  const [gaveta, setGaveta] = useState(false);

  /* ---------- revisar ---------- */
  const [parecerFase, setParecerFase] = useState<"analisando" | "pronto">("analisando");
  const [observacao, setObservacao] = useState("");
  const [modo, setModo] = useState<"aprovacao" | "agendar">("aprovacao");
  const [data, setData] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  /* ---------- agente ---------- */
  const [agenteAberto, setAgenteAberto] = useState(false);
  const [agenteOcupado, setAgenteOcupado] = useState(false);
  /* coluna em uso no Conteúdo: com as duas lado a lado, quem guia o menu do agente é a última coluna em que a
     pessoa clicou/focou (não a rolagem). */
  const [secaoVisivel, setSecaoVisivel] = useState<"texto" | "arte">("texto");
  const [camposArte, setCamposArte] = useState({ titulo: true, subtitulo: true, etiqueta: false });

  const idx = estilo === "C" ? Math.min(cur, slides.length - 1) : 0;
  const slide = slides[idx];
  const setAj = (p: Partial<Ajustes>) => setAjState((a) => ({ ...a, ...p }));
  const patchSlide = useCallback((i: number, p: Partial<Slide>) => setSlides((arr) => arr.map((s, k) => (k === i ? { ...s, ...p } : s))), []);

  /* quadro coerente com a prancheta/estilo em foco */
  const quadroPara = useCallback((est: Estilo, s: Slide): Quadro => {
    const aceita = !(est === "C" && s.papel === "cta");
    const precisa = est !== "C" || s.papel === "capa";
    if (!aceita) return { t: "pronto" };
    if (s.img !== null || !precisa) return { t: "pronto" };
    return { t: "zonas" };
  }, []);

  function trocarEstilo(e: Estilo) {
    if (e === estilo) return;
    setEstilo(e);
    if (e === "C") setFormato("feed");
    const alvo = e === "C" ? slides[Math.min(cur, slides.length - 1)] : slides[0];
    setQuadro(quadroPara(e, alvo));
  }
  function irSlide(i: number) {
    setCur(i);
    setQuadro(quadroPara("C", slides[i]));
  }

  /* arte “desatualizada” quando algo muda depois de finalizar */
  const primeiraArte = useRef(true);
  useEffect(() => {
    if (primeiraArte.current) {
      primeiraArte.current = false;
      return;
    }
    setFinalizada(false);
  }, [slides, aj, estilo, formato]);

  function irPara(n: 1 | 2 | 3) {
    setStep(n);
    if (n === 2) setSecaoVisivel("texto");
    window.scrollTo({ top: 0 });
  }

  /* ---------- ações de imagem (todas dentro do quadro) ---------- */
  function iniciarGeracao() {
    window.clearInterval(intervalo.current);
    setQuadro({ t: "gerando", pct: 4 });
    intervalo.current = window.setInterval(() => {
      setQuadro((q) => {
        if (q.t !== "gerando") return q;
        const prox = Math.min(100, q.pct + 6 + Math.random() * 5);
        return { t: "gerando", pct: prox };
      });
    }, 220);
    agenda(() => {
      window.clearInterval(intervalo.current);
      setQuadro((q) => (q.t === "gerando" ? { t: "candidatas", sel: null } : q));
    }, 3600);
  }
  function aoArquivo(f: File) {
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
      setQuadro({ t: "erro", de: "upload", msg: "Use uma imagem JPG, PNG ou WebP." });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setQuadro({ t: "erro", de: "upload", msg: "O arquivo passa de 5 MB. Escolha uma imagem menor." });
      return;
    }
    setQuadro({ t: "upload" });
    const url = URL.createObjectURL(f);
    agenda(() => {
      patchSlide(idx, { img: url });
      setQuadro({ t: "pronto" });
    }, 1200);
  }
  function abrirAcervo(termo = "escritório") {
    setQuadro({ t: "acervo", carregando: true, mais: false, termo, extra: 0, sel: null });
    agenda(() => setQuadro((q) => (q.t === "acervo" ? { ...q, carregando: false } : q)), 900);
  }
  function usarImagem(img: number) {
    patchSlide(idx, { img });
    setQuadro({ t: "pronto" });
  }
  function promptPadrao() {
    return `Fotografia editorial, luz natural, equipe de tecnologia analisando dados em uma sala moderna. Paleta azul e laranja. Tema: ${tema}.`;
  }

  /* ---------- ações de texto ---------- */
  function reescreverTexto() {
    setGerandoTexto(true);
    agenda(() => {
      const prox = variante === 0 ? 1 : 0;
      setVariante(prox);
      setLegenda(prox ? LEGENDA_NOVA : LEGENDA_INICIAL);
      setHashtags(prox ? HASHTAGS_NOVAS : HASHTAGS_INICIAL);
      setCta(prox ? CTA_NOVO : CTA_INICIAL);
      setGerandoTexto(false);
    }, 2600);
  }

  /* Disparo único da geração (botão do Briefing e agente). No sucesso a pessoa fica no Briefing e clica em
     “Texto pronto. Revisar” para ir à Etapa 2 · Conteúdo. */
  function escreverComIA() {
    if (escrita.state === "success") irPara(2);
    else escrita.start();
  }

  /* ---------- agente ---------- */
  function executarAcao(id: string) {
    const trabalhar = (ms: number, fim: () => void) => {
      setAgenteOcupado(true);
      agenda(() => {
        setAgenteOcupado(false);
        setAgenteAberto(false);
        fim();
      }, ms);
    };
    switch (id) {
      case "escrever-briefing":
        if (espaco && tema.trim() && redes.length) {
          setAgenteAberto(false);
          escreverComIA();
        }
        break;
      case "texto":
        trabalhar(900, reescreverTexto);
        break;
      case "titulos":
        trabalhar(1600, () => {
          const alt = TITULOS_ALT[variante % TITULOS_ALT.length];
          patchSlide(idx, {
            ...(camposArte.titulo ? { titulo: alt.titulo } : {}),
            ...(camposArte.subtitulo ? { subtitulo: alt.subtitulo } : {}),
            ...(camposArte.etiqueta ? { etiqueta: alt.etiqueta } : {}),
          });
          setVariante((v) => v + 1);
        });
        break;
      case "gerar-imagem":
        trabalhar(700, () => {
          setSecaoVisivel("arte");
          rolarPara("ef-previa-arte");
          iniciarGeracao();
        });
        break;
      case "acervo":
        trabalhar(500, () => {
          setSecaoVisivel("arte");
          rolarPara("ef-previa-arte");
          abrirAcervo();
        });
        break;
      case "descrever":
        trabalhar(1500, () => setQuadro({ t: "prompt", prompt: promptPadrao() }));
        break;
      case "carrossel":
        trabalhar(2300, () => {
          setSlides(SLIDES_INICIAIS.map((s, i) => ({ ...s, img: i === 0 ? slides[0].img : null })));
          trocarEstilo("C");
        });
        break;
      case "reanalisar":
        setAgenteAberto(false);
        analisar();
        break;
      default:
        setAgenteAberto(false);
    }
  }

  const painel: PainelAgente = useMemo(() => {
    if (step === 1)
      return {
        secaoLabel: "Briefing",
        intro: "Preencha o briefing e eu escrevo o texto.",
        acoes: [{ id: "escrever-briefing", label: "Escrever o texto com a IA", descricao: "Legenda, hashtags e CTA a partir do briefing." }],
      };
    if (step === 3)
      return {
        secaoLabel: "Revisar e enviar",
        intro: "Posso conferir o post de novo depois dos seus ajustes.",
        acoes: [{ id: "reanalisar", label: "Analisar de novo", descricao: "Refaz o Parecer da IA com o que está na tela." }],
      };
    if (secaoVisivel === "texto")
      return {
        secaoLabel: "Texto",
        intro: "Eu cuido do texto do post e dos textos da arte.",
        acoes: [
          { id: "texto", grupo: "Texto do post", label: "Reescrever legenda, hashtags e CTA", descricao: "Gera uma nova sugestão completa." },
          { id: "gerar-imagem", grupo: "Imagem", label: "Gerar imagem por IA", descricao: "Quatro opções a partir do tema." },
          { id: "acervo", grupo: "Imagem", label: "Buscar no acervo", descricao: "Fotos da Digisystem." },
        ],
        toggles: {
          titulo: "Textos da arte",
          campos: [
            { id: "titulo", label: "Título", ligado: camposArte.titulo },
            { id: "subtitulo", label: "Subtítulo", ligado: camposArte.subtitulo },
            { id: "etiqueta", label: "Etiqueta", ligado: camposArte.etiqueta },
          ],
          acaoLabel: "Escrever textos selecionados",
          acaoId: "titulos",
        },
      };
    return {
      secaoLabel: "Arte",
      intro: "Eu gero a imagem e ajudo com os textos da arte.",
      acoes: [
        { id: "gerar-imagem", grupo: "Imagem", label: "Gerar imagem por IA", descricao: "Quatro opções a partir do tema." },
        { id: "descrever", grupo: "Imagem", label: "Descrever a imagem com a IA", descricao: "Preenche o prompt para você ajustar." },
        { id: "acervo", grupo: "Imagem", label: "Buscar no acervo", descricao: "Fotos da Digisystem." },
        ...(estilo === "C" ? [{ id: "carrossel", grupo: "Carrossel", label: "Montar carrossel com a IA", descricao: "Cria capa, miolo e CTA." }] : []),
        { id: "titulos", grupo: "Textos da arte", label: "Escrever título, subtítulo e etiqueta", descricao: "Sugere os três textos da arte." },
        { id: "texto", grupo: "Texto do post", label: "Reescrever legenda, hashtags e CTA" },
      ],
    };
  }, [step, secaoVisivel, estilo, camposArte]);

  const agenteEstado: IaEstado =
    agenteOcupado || escrevendo || gerandoTexto || quadro.t === "gerando" || (parecerFase === "analisando" && step === 3) ? "processando" : "vivo";

  /* ---------- arte: finalizar / story ---------- */
  const temImagem = slides[0].img !== null;
  function finalizarArte() {
    if (!temImagem || finalizando) return;
    setFinalizando(true);
    agenda(() => {
      setFinalizando(false);
      setFinalizada(true);
    }, 1800);
  }
  function gerarStory() {
    setGerandoStory(true);
    agenda(() => {
      setGerandoStory(false);
      setStoryPronta(true);
    }, 1700);
  }

  /* ---------- parecer ---------- */
  function analisar() {
    setParecerFase("analisando");
    agenda(() => setParecerFase("pronto"), 2800);
  }
  /* ação curta de cada item “vale ajustar” do Parecer: volta ao Conteúdo e leva a pessoa ao ponto certo */
  function irParaAjuste(alvo: AlvoAjuste) {
    irPara(2);
    if (alvo === "imagem") setSecaoVisivel("arte");
    agenda(() => {
      if (alvo === "imagem") {
        rolarPara("ef-sec-arte");
        return;
      }
      rolarPara("ef-sec-texto");
      const campos = document.querySelectorAll<HTMLInputElement>("#ef-sec-texto input");
      const alvoEl = alvo === "titulo" ? campos[0] : alvo === "subtitulo" ? campos[1] : null;
      alvoEl?.focus({ preventScroll: true });
    }, 60);
  }

  useEffect(() => {
    if (step === 3) analisar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const resultado: ResultadoParecer = useMemo(() => {
    const avisos: AvisoParecer[] = [];
    const acertos: string[] = [];
    const capa = slides[0];
    if (contarPalavras(capa.titulo) > LIMITE_PALAVRAS_TITULO)
      avisos.push({ texto: `O título tem ${contarPalavras(capa.titulo)} palavras. O padrão da marca é até ${LIMITE_PALAVRAS_TITULO}.`, acao: { rotulo: "Ir para o título", alvo: "titulo" } });
    else acertos.push("Título dentro do tamanho da marca.");
    if (contarPalavras(capa.subtitulo) > LIMITE_PALAVRAS_SUBTITULO)
      avisos.push({ texto: `O subtítulo tem ${contarPalavras(capa.subtitulo)} palavras. O padrão é até ${LIMITE_PALAVRAS_SUBTITULO}.`, acao: { rotulo: "Ir para o subtítulo", alvo: "subtitulo" } });
    const achados = TERMOS_BANIDOS.filter((t) => (legenda + " " + cta).toLowerCase().includes(t));
    if (achados.length) avisos.push({ texto: `Termos fora do tom da marca: ${achados.join(", ")}.`, acao: { rotulo: "Ir para a legenda", alvo: "legenda" } });
    else acertos.push("Tom de colega capacitado, sem termos banidos.");
    if (!["#Digisystem", "#Parceriaquetransforma", "#Tecnologia"].every((h) => hashtags.includes(h)))
      avisos.push({ texto: "Faltam hashtags oficiais da marca.", acao: { rotulo: "Ir para as hashtags", alvo: "hashtags" } });
    else acertos.push("Hashtags oficiais presentes.");
    if (!temImagem) avisos.push({ texto: "A arte ainda não tem imagem.", acao: { rotulo: "Escolher a imagem", alvo: "imagem" } });
    else acertos.push("Paleta e tipografia da marca na arte.");
    const pct = Math.max(40, 100 - avisos.length * 9);
    return { pct, ok: avisos.length === 0, acertos, avisos };
  }, [slides, legenda, cta, hashtags, temImagem]);

  const pendencias: Pendencia[] = [
    { rotulo: "Espaço (briefing)", ok: !!espaco, bloqueia: true },
    { rotulo: "Tema (briefing)", ok: !!tema.trim(), bloqueia: true },
    { rotulo: "Rede (briefing)", ok: redes.length > 0, bloqueia: true },
    { rotulo: "Texto do post", ok: !!legenda.trim(), bloqueia: true },
    { rotulo: "Imagem da arte", ok: temImagem, bloqueia: true },
    { rotulo: "Arte finalizada", ok: finalizada, bloqueia: true },
    { rotulo: "Observação", ok: !!observacao.trim(), bloqueia: false },
  ];

  function enviar() {
    setEnviando(true);
    agenda(() => {
      setEnviando(false);
      setEnviado(true);
    }, 1400);
  }
  function novoPost() {
    setEnviado(false);
    setEspaco(null);
    setSlides(SLIDES_INICIAIS);
    setQuadro({ t: "zonas" });
    setFinalizada(false);
    setCur(0);
    setEstilo("A");
    setFormato("feed");
    setObservacao("");
    setRascunho("nao");
    escrita.reset();
    irPara(1);
  }
  function salvarRascunho() {
    setRascunho("salvando");
    agenda(() => setRascunho("salvo"), 1000);
  }

  const quadroEl = (
    <QuadroArte
      estilo={estilo}
      formato={formato}
      slide={slide}
      indice={idx}
      total={estilo === "C" ? slides.length : 1}
      aj={aj}
      quadro={quadro}
      finalizada={finalizada}
      onArquivo={aoArquivo}
      onZona={(z) => {
        if (z === "upload") document.getElementById("ef-input-arquivo")?.click();
        else if (z === "gerar") setQuadro({ t: "prompt", prompt: promptPadrao() });
        else abrirAcervo();
      }}
      onGerar={iniciarGeracao}
      onPrompt={(p) => setQuadro({ t: "prompt", prompt: p })}
      onCancelar={() => setQuadro(quadroPara(estilo, slide))}
      onTrocar={() => setQuadro({ t: "zonas" })}
      onSlide={irSlide}
    />
  );

  /* superfície larga de escolha (só enquanto a pessoa escolhe a imagem) */
  const selecaoEl = estaSelecionando(quadro) ? (
    <SelecaoAmpla
      quadro={quadro}
      formato={formato}
      estilo={estilo}
      onSelecionar={(i) => setQuadro((q) => (estaSelecionando(q) ? { ...q, sel: i } : q))}
      onConfirmar={(i) => {
        const escolhida = i ?? quadro.sel;
        if (escolhida === null || escolhida === undefined) return;
        usarImagem(quadro.t === "acervo" ? cenaDoAcervo(escolhida, quadro.termo) : escolhida);
      }}
      onCancelar={() => setQuadro(quadroPara(estilo, slide))}
      onOutraFonte={() => setQuadro({ t: "zonas" })}
      onGerarDeNovo={iniciarGeracao}
      onTermo={abrirAcervo}
      onBuscarMais={() => {
        setQuadro((q) => (q.t === "acervo" ? { ...q, carregando: true, mais: true } : q));
        agenda(() => setQuadro((q) => (q.t === "acervo" ? { ...q, carregando: false, mais: false, extra: q.extra + 1 } : q)), 900);
      }}
    />
  ) : null;

  const etapaRotulo = ETAPAS[step - 1];
  const marcarTexto = () => secaoVisivel !== "texto" && setSecaoVisivel("texto");
  const marcarArte = () => secaoVisivel !== "arte" && setSecaoVisivel("arte");

  return (
    <>
      {/* faixa reservada ao seletor de protótipos do App (fora do quadro do app) */}
      <div aria-hidden className="h-[76px] bg-[#1f2a44]" />
      <HubShellMock>
        <main className="ef-main mx-auto max-w-6xl px-4 pb-40 pt-6 sm:px-6 sm:pt-8">
          {/* cabeçalho no padrão dos módulos — ações ancoradas à direita, largura reservada (sem layout shift) */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <nav aria-label="Trilha" className="flex items-center gap-1 text-xs text-muted-foreground">
                <a href="#/estudio-final" className={cn("font-semibold hover:text-primary", FOCO)}>Posts</a>
                <ChevronRight aria-hidden className="h-3 w-3" />
                <span aria-current="page">Criar post</span>
              </nav>
              <h2 className="mt-1 font-display text-2xl font-bold text-primary">Criar post</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={novoPost} className={cn("inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 font-display text-xs font-bold text-primary shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0", FOCO)}>
                <FilePlus aria-hidden className="h-3.5 w-3.5" /> Novo post
              </button>
              <button
                type="button"
                onClick={salvarRascunho}
                disabled={rascunho === "salvando"}
                aria-live="polite"
                className={cn(
                  "inline-flex min-w-[9.75rem] items-center justify-center gap-1.5 rounded-full bg-card px-3.5 py-2 font-display text-xs font-bold text-primary shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  FOCO,
                )}
              >
                {rascunho === "salvando" ? <Spinner className="h-3.5 w-3.5" /> : rascunho === "salvo" ? <Check aria-hidden className="h-3.5 w-3.5 text-[var(--success)]" /> : <Save aria-hidden className="h-3.5 w-3.5" />}
                {rascunho === "salvando" ? "Salvando…" : rascunho === "salvo" ? "Rascunho salvo" : "Salvar rascunho"}
              </button>
            </div>
          </div>

          {/* stepper minimalista: uma linha fina + trilho laranja SÓLIDO (sem degradê) */}
          <div className="mt-4" role="group" aria-label={`Etapa ${step} de 3: ${etapaRotulo}`}>
            <p className="font-display text-xs font-bold text-primary">
              Etapa {step}/3 <span className="font-normal text-muted-foreground">· {etapaRotulo}</span>
            </p>
            <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-[#ff6d2d] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>

          {/* ---------- Etapa 1: Briefing ---------- */}
          {step === 1 && (
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Briefing
                espaco={espaco}
                setEspaco={setEspaco}
                tema={tema}
                setTema={setTema}
                redes={redes}
                setRedes={setRedes}
                contexto={contexto}
                setContexto={setContexto}
                segmentos={segmentos}
                setSegmentos={setSegmentos}
                escrita={escrita}
                onRevisar={() => irPara(2)}
              />
              <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                <ResumoPost espaco={espaco} redes={redes} segmentos={segmentos} />
              </aside>
            </div>
          )}

          {/* ---------- Etapa 2: Conteúdo (texto | arte) ---------- */}
          {step === 2 && (
            <>
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="min-w-0" onPointerDownCapture={marcarTexto} onFocusCapture={marcarTexto}>
                  <TextoSecao
                    estilo={estilo}
                    slides={slides}
                    indice={idx}
                    setIndice={irSlide}
                    patchSlide={patchSlide}
                    legenda={legenda}
                    setLegenda={setLegenda}
                    hashtags={hashtags}
                    setHashtags={setHashtags}
                    cta={cta}
                    setCta={setCta}
                    gerando={gerandoTexto}
                  />
                </div>
                <div className="min-w-0 lg:sticky lg:top-4 lg:self-start" onPointerDownCapture={marcarArte} onFocusCapture={marcarArte}>
                  <PainelArte
                    estilo={estilo}
                    onEstilo={trocarEstilo}
                    formato={formato}
                    onFormato={setFormato}
                    gerandoStory={gerandoStory}
                    storyPronta={storyPronta}
                    onGerarStory={gerarStory}
                    temImagem={temImagem}
                    finalizando={finalizando}
                    finalizada={finalizada}
                    onFinalizar={finalizarArte}
                  >
                    {quadroEl}
                  </PainelArte>
                  {selecaoEl}
                </div>
              </div>

              {/* fim do passo: dois caminhos (bifurcação) */}
              <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Texto e arte prontos? Siga para revisar. A personalização da arte é opcional e não vira uma etapa.
                </p>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {/* botões de CONTINUIDADE: navy = caminho secundário (opcional), laranja = caminho principal */}
                  <BotaoContinuidade
                    variante="secundaria"
                    onClick={() => setGaveta(true)}
                    extra={<span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/85">opcional</span>}
                  >
                    Personalizar em detalhe
                  </BotaoContinuidade>
                  <BotaoContinuidade variante="principal" onClick={() => irPara(3)}>
                    Revisar e enviar
                  </BotaoContinuidade>
                </div>
              </div>
            </>
          )}

          {/* ---------- Etapa 3: Revisar e enviar (prévia por rede | parecer + envio) ---------- */}
          {step === 3 && (
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="min-w-0 space-y-3 lg:sticky lg:top-4 lg:self-start">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => irPara(2)}
                    className={cn("inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 font-display text-xs font-bold text-primary hover:bg-secondary", FOCO)}
                  >
                    <ChevronLeft aria-hidden className="h-3.5 w-3.5" /> Voltar ao conteúdo
                  </button>
                </div>
                <PortalPreview redes={redes} estilo={estilo} formato={formato} slides={slides} aj={aj} legenda={legenda} hashtags={hashtags} />
              </div>
              <div className="min-w-0 space-y-5">
                <ParecerIA fase={parecerFase} resultado={resultado} onReanalisar={analisar} onIrPara={irParaAjuste} />
                <EnviarSecao
                  pendencias={pendencias}
                  carrossel={estilo === "C"}
                  observacao={observacao}
                  setObservacao={setObservacao}
                  modo={modo}
                  setModo={setModo}
                  data={data}
                  setData={setData}
                  enviando={enviando}
                  enviado={enviado}
                  onEnviar={enviar}
                  onNovo={novoPost}
                />
              </div>
            </div>
          )}
        </main>
      </HubShellMock>

      <AgenteFinal
        estado={agenteEstado}
        aberto={agenteAberto}
        onToggle={() => setAgenteAberto((v) => !v)}
        onFechar={() => setAgenteAberto(false)}
        painel={painel}
        onAcao={executarAcao}
        onToggleCampo={(id) => setCamposArte((c) => ({ ...c, [id]: !c[id as keyof typeof c] }))}
        ocupado={agenteOcupado}
      />

      <Gaveta
        aberto={gaveta}
        onFechar={() => setGaveta(false)}
        onConcluir={() => {
          setGaveta(false);
          irPara(3);
        }}
        estilo={estilo}
        formato={formato}
        slides={slides}
        indice={idx}
        setIndice={irSlide}
        aj={aj}
        setAj={setAj}
        patchSlide={patchSlide}
        setSlides={(s) => {
          setSlides(s);
        }}
      />

      {/* seletor de etapa SÓ para demonstração — fora do quadro do app */}
      <div className="fixed bottom-3 left-3 z-[70] flex items-center gap-1 rounded-full bg-[#1f2a44]/85 p-1 pl-3 text-white backdrop-blur-sm" role="group" aria-label="Demonstração: ir para a etapa">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-white/60">demo</span>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => irPara(n as 1 | 2 | 3)}
            aria-label={`Ir para a etapa ${n}: ${ETAPAS[n - 1]}`}
            aria-pressed={step === n}
            className={cn("h-6 w-6 rounded-full font-display text-[11px] font-bold", FOCO, step === n ? "bg-[#ff6d2d] text-white" : "text-white/80 hover:bg-white/15")}
          >
            {n}
          </button>
        ))}
      </div>
    </>
  );
}
