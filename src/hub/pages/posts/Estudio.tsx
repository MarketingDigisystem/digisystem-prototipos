/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/estudio.tsx, src/components/estudio/DirecaoCriativaStep.tsx,
 *   src/components/estudio/ArteStep.tsx, src/components/estudio/AgenteMolecula.tsx,
 *   src/hooks/use-gerar-direcao.ts @ commit 4fcf254 / leitura 2026-10-07
 *   (inventário em prototipos/INVENTARIO-estudio.md, lido em 2026-10-07).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md (aprovada, D1 a D7)
 *   e docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Posts → Criar post, REGENERADO no item 5.5a. Abre pelo botão "Criar post",
 * por um card (?card=&item=), por uma tendência (?trend=) ou para continuar um
 * post salvo (?post=).
 *  - Três colunas: trilho das seções sem números (Sobre o post · Texto · Arte ·
 *    Enviar, com o que falta), a seção ativa no centro (as prontas recolhidas
 *    com resumo e Editar) e a prévia 4:5 à direita.
 *  - "Sobre o post" e "Texto" seguem a ESPEC. Ao aprovar o texto, o post nasce
 *    como rascunho sozinho (linha 31) e, daí em diante, toda mudança é salva
 *    sozinha ("Salvo há…"). A origem (tendência, card, pedido) vira chips.
 *  - Arte refeita no item 5.5b (modelo, imagem, texto da arte, Básico/Avançado
 *    e prévia ao vivo). Item 5.5c: carrossel por prancheta e "Montar o
 *    carrossel" com confirmação, Finalizar com painel travado e falha
 *    simulável (painel de demo), Editar arte / Gerar novamente, Story 9:16 e
 *    o menu Baixar.
 *  - Item 5.5d: Enviar com a Análise da IA, observação, data opcional sem
 *    mínimo (D3), legenda gravada com o bloco de CTAs (D4), a pergunta
 *    "Associar ou criar?" sem card e a tela de conclusão (D7). O salvamento
 *    automático leva também o contexto e a configuração da arte (D5), e
 *    reabrir o post em Meus posts restaura modelo, textos e ajustes.
 * A IA é simulada (mock-geracao.ts), sempre com o símbolo IaDigisystem. O
 * painel de demo deixa a IA "indisponível" para ver o fallback (linha 20).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, FilePlus, Info, Link2, MessageSquareQuote, TrendingUp } from "lucide-react";
import { AgenteMolecula, type PainelAgente } from "../../../components/estudio/AgenteMolecula";
import { cn } from "../../../lib/utils";
import { EnviarSemCardDialog } from "../../components/EnviarSemCardDialog";
import { PageHeader } from "../../components/PageHeader";
import { PreviaPost } from "../../components/estudio/PreviaPost";
import { ChatImagem } from "../../components/estudio/ChatImagem";
import { HREF_FONTES_ESTUDIO, ajustesPranchetaIniciais, novoSlide } from "../../components/estudio/arte-config";
import { arteFinalSvgs, entradaDoEditor } from "../../components/estudio/desenhar-arte";
import { SecaoArte, MODELOS } from "../../components/estudio/SecaoArte";
import { SecaoEnviar } from "../../components/estudio/SecaoEnviar";
import { SecaoSobre } from "../../components/estudio/SecaoSobre";
import { SecaoTexto } from "../../components/estudio/SecaoTexto";
import { TrilhoSecoes, type ItemTrilho } from "../../components/estudio/TrilhoSecoes";
import {
  NENHUMA_APROVADA,
  briefingDe,
  configArteDoEditor,
  editorInicial,
  legendaFinal,
  secaoInicial,
  type Editor,
  type SecaoId,
} from "../../components/estudio/editor";
import { MolduraSecao, pilulaAcao } from "../../components/estudio/partes";
import { REDE_META } from "../../components/RedeIcone";
import { hrefDe, navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { acervoDeExemplo, arteRascunho, svgParaUri } from "../../store/mock-arte";
import {
  descreverImagem,
  direcaoFallback,
  gerarCtaDaRede,
  gerarCtas,
  gerarHashtags,
  gerarLegenda,
  gerarTextosArte,
  imagemParaDescricao,
  justificativa,
  montarCarrossel,
  termosAcervo,
} from "../../store/mock-geracao";
import {
  OPCOES_POR_GERACAO,
  camposDoAgenteNaArte,
  montarCarrosselPedeConfirmacao,
  podeGerarStory,
  type ItemBaixar,
  ctasValidos,
  faltaAprovarTexto,
  fraseFaltaAprovar,
  lerHashtagsManuais,
  podeEscreverComIa,
  podeEnviarDoEstudio,
  podeFinalizarArte,
  podeGerarImagem,
  salvoHa,
  tituloDaArte,
} from "../../store/regras";
import type { CamposAgente, Marca, Post, Rede } from "../../store/tipos";

// ─── Página ──────────────────────────────────────────────────────────────

export function Estudio({ rota }: { rota: Rota }) {
  // Trocar de parâmetros (outro card, outra tendência, "Novo post") recria o editor.
  return <EditorPost key={JSON.stringify(rota.params)} params={rota.params} />;
}

/** Aplica o resultado de "Escrever com a IA" (ou do modelo padrão, se a IA estiver fora). */
function aplicarEscrita(e: Editor, marca: Marca, indisponivel: boolean): Editor {
  const b = briefingDe(e);
  const manuais = lerHashtagsManuais(e.hashtagsManuais);
  const legendaSua = e.legendaManual.trim() ? e.legendaManual : e.legendaSua;
  const base: Editor = {
    ...e,
    geracao: "pronto",
    legendaSua,
    versaoLegenda: legendaSua.trim() ? "sua" : "ia",
    // Linha 15: hashtags escritas em "Já tenho um texto" substituem as da IA e nascem aprovadas.
    aprovados: { ...NENHUMA_APROVADA, hashtags: manuais.length > 0 },
    descricaoImagem: e.descricaoImagem || descreverImagem(b),
    sujo: true,
  };
  if (indisponivel) {
    const fb = direcaoFallback(b, marca, e.tagTendencia);
    return {
      ...base,
      fallback: true,
      justificativa: "",
      legendaIa: fb.legenda,
      hashtags: manuais.length ? manuais : fb.hashtags,
      tituloSugerido: fb.tituloSugerido,
      subtituloSugerido: fb.subtituloSugerido,
    };
  }
  const textos = gerarTextosArte(b);
  return {
    ...base,
    fallback: false,
    justificativa: justificativa(b),
    legendaIa: gerarLegenda(b),
    hashtags: manuais.length ? manuais : gerarHashtags(b),
    ctas: gerarCtas(b),
    tituloSugerido: textos.titulo,
    subtituloSugerido: textos.subtitulo,
  };
}

/** Ações de IA de cada campo (as mesmas do agente-molécula). */
function aplicarAcaoIa(e: Editor, id: string, campos: CamposAgente, cores: Marca["cores"]): Editor {
  const b = briefingDe(e);
  const v = e.versoes;
  if (id === "montar-carrossel") {
    // Linha 64: capa, slides (com cor e anel) e chamada final de uma vez; substitui tudo.
    const m = montarCarrossel(b, v.textos + 1);
    const hex = { principal: cores[0]?.hex ?? "#36499b", destaque: cores[1]?.hex ?? "#ff6d2d", apoio: cores[2]?.hex ?? "#67cfee" };
    const slides = m.slides.map((s) =>
      novoSlide(hex.principal, {
        titulo: s.titulo,
        subtitulo: s.subtitulo,
        fundo: { tipo: "cor", hex: hex[s.cor] },
        ajustes: { ...ajustesPranchetaIniciais(), mostrarAnel: s.mostrarAnel },
      }),
    );
    const c = e.arte.carrossel;
    return {
      ...e,
      tituloArte: m.tituloCapa,
      subtituloArte: m.subtituloCapa,
      arte: {
        ...e.arte,
        carrossel: {
          capa: { ajustes: { ...c.capa.ajustes, kicker: m.kicker } },
          slides,
          cta: { ...c.cta, titulo: m.cta.titulo, botaoTexto: m.cta.botaoTexto },
          editando: "capa",
        },
      },
      versoes: { ...v, textos: v.textos + 1 },
      sujo: true,
    };
  }
  if (id.startsWith("sugerir-cta:")) {
    const rede = id.split(":")[1] as Rede;
    const cta = gerarCtaDaRede(b, rede, v.cta + 1);
    return {
      ...e,
      ctas: [...e.ctas.filter((c) => !c.plataformas.includes(rede)), cta],
      versoes: { ...v, cta: v.cta + 1 },
      aprovados: { ...e.aprovados, cta: false },
      sujo: true,
    };
  }
  switch (id) {
    case "regen-legenda":
      // Linha 26: a nova versão vira a "Sugestão da IA" e volta a pedir aprovação.
      return { ...e, legendaIa: gerarLegenda(b, v.legenda + 1), versaoLegenda: "ia", versoes: { ...v, legenda: v.legenda + 1 }, aprovados: { ...e.aprovados, legenda: false }, sujo: true };
    case "regen-hashtags":
      return { ...e, hashtags: gerarHashtags(b, v.hashtags + 1), versoes: { ...v, hashtags: v.hashtags + 1 }, aprovados: { ...e.aprovados, hashtags: false }, sujo: true };
    case "sugerir-cta":
      return { ...e, ctas: gerarCtas(b, v.cta + 1), versoes: { ...v, cta: v.cta + 1 }, aprovados: { ...e.aprovados, cta: false }, sujo: true };
    case "buscar-termos":
      return { ...e, origemImagem: "acervo", termos: termosAcervo(b), sujo: true };
    case "escrever-textos": {
      // Respeita "O que o agente escreve" (Configurações → IA e prompts).
      const t = gerarTextosArte(b, v.textos + 1);
      return {
        ...e,
        tituloArte: campos.titulo ? t.titulo : e.tituloArte,
        subtituloArte: campos.subtitulo ? t.subtitulo : e.subtituloArte,
        versoes: { ...v, textos: v.textos + 1 },
        sujo: true,
      };
    }
    default:
      return e;
  }
}

function EditorPost({ params }: { params: Record<string, string> }) {
  const { dados, hoje, usuario, sel, acoes, estado } = useHub();
  const [ed, setEd] = useState<Editor>(() => editorInicial(params, dados, sel, hoje));
  const postAtual = sel.postPorId(ed.postId);
  const somenteLeitura = Boolean(postAtual && postAtual.estado !== "rascunho" && postAtual.estado !== "reprovado");

  const [ativa, setAtiva] = useState<SecaoId>(() => secaoInicial(ed, somenteLeitura, Boolean(postAtual)));
  const [salvoEm, setSalvoEm] = useState<number | null>(() => (postAtual ? Date.now() : null));
  const [relogio, setRelogio] = useState(() => Date.now());
  const [confirmarNovo, setConfirmarNovo] = useState(false);
  const [confirmarReescrever, setConfirmarReescrever] = useState(false);
  const [ocupadoIa, setOcupadoIa] = useState<string | null>(null);
  const [ocupadoArte, setOcupadoArte] = useState<"imagem" | "arte" | "story" | null>(null);
  const [confirmarMontar, setConfirmarMontar] = useState(false);
  const [agenteAberto, setAgenteAberto] = useState(false);
  const [enviarSemCard, setEnviarSemCard] = useState<Post | null>(null);
  const [chatAberto, setChatAberto] = useState(false);
  const [realce, setRealce] = useState<string[]>([]);

  // Linha 85: as fontes extras da arte só carregam enquanto o Estúdio está aberto.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = HREF_FONTES_ESTUDIO;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const depois = useCallback((ms: number, f: () => void) => {
    timers.current.push(window.setTimeout(f, ms));
  }, []);
  useEffect(() => {
    const t = window.setInterval(() => setRelogio(Date.now()), 15000);
    return () => window.clearInterval(t);
  }, []);

  const mudar = (patch: Partial<Editor>) => setEd((e) => ({ ...e, ...patch, sujo: true }));

  const itemAtual = postAtual?.itemId ? sel.itemPorId(postAtual.itemId) : ed.itemId ? sel.itemPorId(ed.itemId) : undefined;
  const linkCard = itemAtual ? hrefDe("tarefas", "quadro", { card: itemAtual.card.id }) : undefined;
  const falta = faltaAprovarTexto(ed.aprovados, ed.ctas, ed.redes);
  const textoOk = ed.geracao === "pronto" && falta.length === 0;
  const arteLiberada = Boolean(postAtual);
  const enviarLiberado = textoOk && ed.arteFinal && arteLiberada;
  // Linha 77 (R-EST-11): texto aprovado e arte pronta; durante a composição, espera.
  const podeEnviar = podeEnviarDoEstudio({
    faltaTexto: ed.geracao === "pronto" ? falta : ["o texto"],
    arteFinal: ed.arteFinal && arteLiberada,
    compondo: ocupadoArte === "arte",
  });

  // ── Salvar (automático) ────────────────────────────────────────────────
  /** Grava no store (cria ou atualiza). Devolve o post salvo, ou null se barrou. */
  const salvar = (): Post | null => {
    if (somenteLeitura || !ed.tema.trim()) return null;
    const base = sel.postPorId(ed.postId);
    let itemId = base ? base.itemId : ed.itemId;
    const agora = acoes.agora();
    const tituloArte = ed.tituloArte.trim() || ed.tituloSugerido.trim() || ed.tema.trim();
    const post: Post = {
      ...(base ?? {}),
      id: ed.postId,
      titulo: ed.tema.trim(),
      tituloArte,
      subtituloArte: ed.subtituloArte.trim() || (ed.tituloArte.trim() ? "" : ed.subtituloSugerido),
      // A legenda gravada é a escolhida no alternador (o real grava a manual mesmo se a escolha for a da IA).
      legenda: legendaFinal(ed),
      hashtags: ed.hashtags,
      redes: ed.redes,
      ctas: ctasValidos(ed.ctas, ed.redes),
      segmento: ed.segmentos[0] ?? "",
      segmentos: ed.segmentos,
      formato: ed.template === "C" ? "Carrossel" : "Post",
      template: ed.template,
      estado: base?.estado ?? "rascunho",
      autorId: base?.autorId ?? usuario.id,
      criadoEm: base?.criadoEm ?? agora,
      atualizadoEm: agora,
      dataSugerida: ed.dataSugerida || undefined,
      observacao: ed.observacao.trim() || undefined,
      detalhamento: ed.contexto.trim() || undefined,
      // D5 (R-EST-5): a configuração da arte vai junto, e o post reabre igual.
      configArte: configArteDoEditor(ed),
      itemId: undefined,
      trendId: ed.trendId,
      arteUrl: ed.arteFinal && ed.arteUrl ? ed.arteUrl : base?.arteUrl ?? arteRascunho(ed.tema.trim()),
      arteUrls: ed.arteFinal && ed.arteUrls.length ? ed.arteUrls : base?.arteUrls,
      storyUrls: ed.storyUrls.length ? ed.storyUrls : undefined,
    };
    // 1 post = 1 item (K4): se o item já ganhou outro post, salva fora do card e avisa.
    if (itemId && !base?.itemId) {
      const r = sel.podeAssociar(post, itemId);
      if (!r.ok) {
        acoes.avisar(`${r.motivo} O post foi salvo em Meus posts, sem card.`, "erro");
        itemId = undefined;
      }
    }
    post.itemId = itemId;
    acoes.salvarPost(post);
    setEd((e) => ({ ...e, sujo: false, itemId }));
    setSalvoEm(Date.now());
    setRelogio(Date.now());
    return post;
  };

  // Linha 31: o post nasce como rascunho quando o texto é aprovado. Depois disso,
  // cada mudança é gravada sozinha (ESPEC, ponto confuso 5).
  useEffect(() => {
    if (somenteLeitura) return;
    if (!postAtual) {
      if (!textoOk) return;
      const p = salvar();
      if (p) {
        acoes.avisar(
          p.itemId
            ? "Texto aprovado. O post foi salvo como rascunho no card, que foi para Em andamento."
            : "Texto aprovado. O post foi salvo como rascunho em Meus posts.",
        );
        setAtiva("arte");
      }
      return;
    }
    if (!ed.sujo) return;
    const t = window.setTimeout(() => salvar(), 700);
    return () => window.clearTimeout(t);
    // `salvar` lê o estado deste render; as dependências abaixo bastam.
  }, [ed, textoOk, postAtual?.id, somenteLeitura]);

  // Depois de enviar, o editor mostra a conclusão (D7).
  useEffect(() => {
    if (somenteLeitura) setAtiva("enviar");
  }, [somenteLeitura]);

  // ── Escrever com a IA ─────────────────────────────────────────────────
  const escrever = (confirmado = false) => {
    const r = podeEscreverComIa(ed.tema, ed.redes);
    if (!r.ok) {
      acoes.avisar(r.motivo, "erro");
      return;
    }
    // ESPEC, ponto confuso 6: gerar de novo pede confirmação.
    if (ed.geracao === "pronto" && !confirmado) {
      setConfirmarReescrever(true);
      return;
    }
    setConfirmarReescrever(false);
    const indisponivel = estado.iaIndisponivel;
    setEd((e) => ({ ...e, geracao: "planejando" }));
    depois(2200, () => {
      setEd((e) => aplicarEscrita(e, dados.marca, indisponivel));
      setAtiva("texto");
    });
  };

  const executarIa = (pedido: string) => {
    // "Descrever com a IA" abre a conversa de imagem (linha 37); com a IA fora, o próprio chat avisa.
    if (pedido === "descrever-imagem") {
      setEd((e) => ({ ...e, origemImagem: "ia" }));
      setChatAberto(true);
      return;
    }
    // "Montar o carrossel com a IA" substitui tudo: com conteúdo, pede confirmação antes (linha 64).
    const id = pedido === "montar-carrossel:confirmado" ? "montar-carrossel" : pedido;
    if (pedido === "montar-carrossel") {
      const c = ed.arte.carrossel;
      if (montarCarrosselPedeConfirmacao({ kicker: c.capa.ajustes.kicker, slides: c.slides, cta: c.cta })) {
        setConfirmarMontar(true);
        setAgenteAberto(false);
        ir("arte");
        return;
      }
    }
    setConfirmarMontar(false);
    // Linha 57: o que o agente escreve na arte vem de Configurações → IA e prompts.
    const campos = camposDoAgenteNaArte(ed.template, dados.camposAgente);
    if (id === "escrever-textos" && campos.motivo) {
      acoes.avisar(campos.motivo, "erro");
      return;
    }
    if (estado.iaIndisponivel) {
      acoes.avisar("A IA não respondeu agora. Tente de novo em instantes ou edite à mão.", "erro");
      return;
    }
    setOcupadoIa(id);
    depois(1400, () => {
      setOcupadoIa(null);
      setEd((e) => aplicarAcaoIa(e, id, dados.camposAgente, dados.marca.cores));
      if (id === "escrever-textos") {
        // Os campos escritos piscam em laranja, como no real.
        setRealce([campos.titulo && "titulo", campos.subtitulo && "subtitulo"].filter(Boolean) as string[]);
        depois(1800, () => setRealce([]));
      }
    });
  };

  // ── Arte ──────────────────────────────────────────────────────────────
  /** "Gerar opções" (ESPEC): a IA devolve algumas imagens e a pessoa escolhe a que vai para a arte. */
  const gerarOpcoes = () => {
    const r = podeGerarImagem(ed.descricaoImagem);
    if (!r.ok) {
      acoes.avisar(r.motivo, "erro");
      return;
    }
    if (estado.iaIndisponivel) {
      acoes.avisar("A IA de imagem não respondeu agora. Tente de novo em instantes.", "erro");
      return;
    }
    setOcupadoArte("imagem");
    depois(2400, () => {
      setOcupadoArte(null);
      setEd((e) => {
        // Imagens de exemplo que mais combinam com o prompt; cada geração traz outras.
        const banco = acervoDeExemplo(`${e.descricaoImagem} ${imagemParaDescricao(e.descricaoImagem, e.segmentos[0] ?? "").descricao}`);
        const novas = Array.from({ length: OPCOES_POR_GERACAO }, (_, i) => banco[(e.versoes.imagem + i) % banco.length].url);
        // As mais novas primeiro; ficam só nesta sessão (linha 36).
        const candidatas = [...new Set([...novas, ...e.candidatas])];
        return { ...e, candidatas, versoes: { ...e.versoes, imagem: e.versoes.imagem + OPCOES_POR_GERACAO } };
      });
    });
  };

  const finalizarArte = () => {
    const r = podeFinalizarArte({
      postSalvo: arteLiberada,
      modelo: ed.template,
      temImagem: Boolean(ed.imagemUrl),
      titulo: tituloDaArte(ed.tituloArte, ed.tituloSugerido),
      ocupado: Boolean(ocupadoArte),
    });
    if (!r.ok) {
      acoes.avisar(r.motivo, "erro");
      return;
    }
    setOcupadoArte("arte");
    // O painel de demo decide se o compositor responde bem ou falha (linha 67).
    const falha = estado.composicaoDemo === "falha";
    depois(3200, () => {
      setOcupadoArte(null);
      if (falha) {
        // A arte pronta anterior (se houver) continua valendo; os ajustes ficam como estavam.
        setEd((e) => ({
          ...e,
          arteErro: "O compositor não conseguiu baixar a imagem da arte a tempo. Nenhum ajuste se perdeu: tente novamente.",
        }));
        return;
      }
      // A arte final é exatamente o que a prévia ao vivo mostra; no carrossel, uma por prancheta (svg_urls[]).
      setEd((e) => {
        const urls = arteFinalSvgs(entradaDoEditor(e, dados.marca, "final")).map(svgParaUri);
        return { ...e, arteUrl: urls[0], arteUrls: urls, arteFinal: true, editandoArte: false, arteErro: undefined, storyUrls: [], sujo: true };
      });
    });
  };

  const podeStory = podeGerarStory({
    arteFinal: ed.arteFinal && !ed.editandoArte,
    modelo: ed.template,
    titulo: tituloDaArte(ed.tituloArte, ed.tituloSugerido),
    ocupado: Boolean(ocupadoArte),
  });

  /** "Gerar versão Story" (linha 72): o mesmo editor no canvas 9:16; no carrossel, uma tela por prancheta. */
  const gerarStory = () => {
    if (!podeStory.ok) {
      acoes.avisar(podeStory.motivo, "erro");
      return;
    }
    setOcupadoArte("story");
    depois(1800, () => {
      setOcupadoArte(null);
      setEd((e) => ({ ...e, storyUrls: arteFinalSvgs(entradaDoEditor(e, dados.marca, "story"), "story").map(svgParaUri), sujo: true }));
      acoes.avisar("Versão Story pronta. Veja na prévia, em Story 9:16.");
    });
  };

  const baixar = (item: ItemBaixar) => {
    acoes.avisar(`Simulado: no app, aqui baixaria "${item.arquivo}".`);
  };

  // ── Enviar ────────────────────────────────────────────────────────────
  /**
   * Grava o que estiver pendente e envia. A legenda ganha o bloco de CTAs no
   * envio (D4, no store). Sem card, abre a pergunta "Associar ou criar?" (4.6).
   */
  const enviar = () => {
    if (!podeEnviar.ok) {
      acoes.avisar(podeEnviar.motivo, "erro");
      return;
    }
    const post = salvar();
    if (!post) return;
    if (!post.itemId) {
      setEnviarSemCard(post);
      return;
    }
    acoes.enviarPost(post.id, ed.dataSugerida || undefined);
  };

  const temTrabalho = Boolean(ed.tema.trim() || ed.contexto.trim() || ed.geracao !== "nao" || postAtual);
  const novoPost = (confirmado = false) => {
    // Linha 4: Novo post pede confirmação quando há trabalho em andamento.
    if (temTrabalho && !confirmado && !somenteLeitura) {
      setConfirmarNovo(true);
      return;
    }
    navegar("posts", "criar", { novo: Date.now().toString(36) });
  };

  // ── Trilho e seções ───────────────────────────────────────────────────
  const itens: ItemTrilho[] = [
    {
      id: "sobre",
      titulo: "Sobre o post",
      estado: ed.geracao === "pronto" ? "pronta" : "andamento",
      linha:
        ed.geracao === "pronto"
          ? "Pronto."
          : ed.geracao === "planejando"
            ? "A IA está escrevendo."
            : !ed.tema.trim()
              ? "Falta o tema do post."
              : !ed.redes.length
                ? "Falta escolher onde publicar."
                : "Pronto para escrever com a IA.",
    },
    {
      id: "texto",
      titulo: "Texto",
      estado: ed.geracao !== "pronto" ? "bloqueada" : textoOk ? "pronta" : "andamento",
      linha: ed.geracao !== "pronto" ? "Libera depois de escrever com a IA." : textoOk ? "Aprovado." : fraseFaltaAprovar(falta),
    },
    {
      id: "arte",
      titulo: "Arte",
      estado: !arteLiberada ? "bloqueada" : ed.arteFinal ? "pronta" : "andamento",
      linha: !arteLiberada
        ? "Libera quando o texto for aprovado."
        : ocupadoArte === "arte"
          ? "Finalizando a arte…"
          : ed.arteErro
            ? "A composição falhou. Tente novamente."
            : ed.arteFinal && ed.editandoArte
              ? "Editando. A arte pronta vale até gerar de novo."
              : ed.arteFinal
          ? "Arte pronta."
          : !ed.imagemUrl
            ? "Falta escolher a imagem e finalizar."
            : "Falta finalizar a arte.",
    },
    {
      id: "enviar",
      titulo: "Enviar",
      estado: somenteLeitura ? "pronta" : enviarLiberado ? "andamento" : "bloqueada",
      linha: somenteLeitura
        ? "Enviado."
        : podeEnviar.ok
          ? postAtual?.estado === "reprovado"
            ? "Pronto para reenviar."
            : "Pronto para enviar."
          : enviarLiberado
            ? podeEnviar.motivo
            : "Precisa do texto aprovado e da arte pronta.",
    },
  ];
  const estadoDe = (id: SecaoId) => itens.find((i) => i.id === id)!;
  const ir = (id: SecaoId) => {
    if (estadoDe(id).estado === "bloqueada") return;
    setAtiva(id);
    window.setTimeout(() => document.getElementById(`secao-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const nomesRedes = ed.redes.map((r) => REDE_META[r].label).join(", ");
  const resumoSobre = [ed.tema.trim(), ed.segmentos.join(", "), nomesRedes].filter(Boolean).join(" · ");
  const ctasOk = ctasValidos(ed.ctas, ed.redes).length;
  const resumoTexto = `${legendaFinal(ed).split("\n")[0]} · ${ed.hashtags.length} hashtags · ${ctasOk ? `${ctasOk} ${ctasOk === 1 ? "chamada" : "chamadas"}` : "sem chamada"}`;
  const resumoArte = `${MODELOS.find((m) => m.id === ed.template)?.titulo ?? ""} · ${ed.tituloArte.trim() || ed.tituloSugerido}`;

  // ── Agente-molécula (atalho das mesmas ações dos campos) ──────────────
  const mostrarAgente = !somenteLeitura && ed.geracao === "pronto" && (ativa === "texto" || (ativa === "arte" && arteLiberada));
  const painel: PainelAgente =
    ativa === "arte"
      ? {
          secaoLabel: "Arte",
          intro: "Ajudo com a imagem e com os textos que vão na arte.",
          // Linha 73: as ações trocam pelo modelo; são as mesmas dos botões ao lado dos campos.
          acoes:
            ed.template === "C"
              ? [
                  { id: "descrever-imagem", label: "Descrever imagem com a IA", descricao: "Escrevo o prompt da imagem da capa a partir do tema." },
                  { id: "buscar-termos", label: "Buscar termos no acervo", descricao: "Sugiro palavras para a busca de imagens." },
                  { id: "montar-carrossel", label: "Montar o carrossel", descricao: "Capa, slides e chamada final de uma vez. Substitui o que estiver lá." },
                ]
              : [
                  {
                    id: "escrever-textos",
                    label: ed.template === "B" ? "Criar post estilo blog" : "Criar post estático",
                    descricao: "Título e subtítulo da arte, conforme o que o agente escreve.",
                  },
                  { id: "descrever-imagem", label: "Descrever imagem com a IA", descricao: "Escrevo o prompt da imagem a partir do tema." },
                  { id: "buscar-termos", label: "Buscar termos no acervo", descricao: "Sugiro palavras para a busca de imagens." },
                ],
        }
      : {
          secaoLabel: "Texto",
          intro: "Se precisar de ajuda, é só me chamar.",
          acoes: [
            { id: "regen-legenda", label: "Regenerar legenda", descricao: "Uma nova versão, com o mesmo tema." },
            { id: "regen-hashtags", label: "Regenerar hashtags", descricao: "Oficiais da marca e de 3 a 5 do tema." },
            { id: "sugerir-cta", label: "Sugerir chamadas", descricao: "Uma por rede escolhida." },
          ],
        };

  const voltar = linkCard ?? hrefDe("posts", "meus");
  const rotuloVoltar = linkCard ? "Voltar para o card" : "Ir para Meus posts";
  const IconeOrigem = { tendencia: TrendingUp, card: Link2, pedido: MessageSquareQuote };

  return (
    <>
      <PageHeader
        eyebrow="Posts"
        title="Criar post"
        subtitle="Do tema ao envio para aprovação. Depois que o texto é aprovado, o post se salva sozinho."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a href={voltar} className={pilulaAcao}>
              <ArrowLeft aria-hidden className="h-3.5 w-3.5" /> {rotuloVoltar}
            </a>
            <button type="button" onClick={() => novoPost()} className={pilulaAcao}>
              <FilePlus aria-hidden className="h-3.5 w-3.5" /> Novo post
            </button>
          </div>
        }
      />

      {ed.origens.length > 0 && (
        <ul aria-label="De onde vem este post" className="animate-rise mt-4 flex flex-wrap gap-2">
          {ed.origens.map((o) => {
            const Icone = IconeOrigem[o.tipo];
            const classe = cn(
              "inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 font-display text-[11px] font-bold",
              o.tipo === "tendencia" ? "bg-orange-soft text-accent" : "bg-sky-soft text-primary",
            );
            const conteudo = (
              <>
                <Icone aria-hidden className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {o.tipo === "tendencia" ? "Tendência: " : o.tipo === "card" ? "Card: " : ""}
                  {o.texto}
                </span>
              </>
            );
            return (
              <li key={o.tipo} className="max-w-[min(32rem,100%)]" title={o.detalhe ? `${o.texto}. ${o.detalhe}` : o.texto}>
                {o.href ? (
                  <a href={o.href} className={cn(classe, "transition-all duration-300 hover:-translate-y-0.5")}>
                    {conteudo}
                  </a>
                ) : (
                  <span className={classe}>{conteudo}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {confirmarNovo && (
        <div role="alertdialog" aria-labelledby="novo-titulo" className="animate-rise mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-warning/40 bg-warning-soft px-4 py-3">
          <p id="novo-titulo" className="flex-1 text-xs text-foreground/85">
            <span className="font-display font-bold text-primary">Começar outro post?</span>{" "}
            {postAtual ? "Este fica salvo em Meus posts." : "Este ainda não foi salvo: o texto que não foi aprovado se perde."}
          </p>
          <button type="button" onClick={() => novoPost(true)} className={pilulaAcao}>
            Começar outro
          </button>
          <button type="button" onClick={() => setConfirmarNovo(false)} className={pilulaAcao}>
            Continuar aqui
          </button>
        </div>
      )}

      {(ed.avisoPost || somenteLeitura) && (
        <div
          className={cn(
            "animate-rise mt-4 flex items-start gap-2.5 rounded-2xl px-4 py-3 text-xs leading-relaxed",
            ed.avisoPost?.reprovado ? "bg-destructive/[0.07] text-destructive" : "bg-navy-soft text-primary",
          )}
        >
          {ed.avisoPost?.reprovado ? <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /> : <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>
            {somenteLeitura
              ? "Este post já saiu do Estúdio. Daqui em diante, os ajustes de arte ficam em Meus posts, pela versão do designer."
              : ed.avisoPost?.texto}
          </span>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_300px]">
        <TrilhoSecoes
          itens={itens}
          ativa={ativa}
          onIr={ir}
          salvo={postAtual && salvoEm ? salvoHa(salvoEm, relogio) : null}
          estadoPost={postAtual ? sel.estadoPost(postAtual) : undefined}
        />

        <div className="min-w-0 space-y-4">
          <MolduraSecao
            id="sobre"
            titulo="Sobre o post"
            estado={estadoDe("sobre").estado}
            linha={estadoDe("sobre").linha}
            resumo={resumoSobre}
            aberta={ativa === "sobre" && !somenteLeitura}
            onAbrir={() => ir("sobre")}
            somenteLeitura={somenteLeitura}
          >
            <SecaoSobre
              ed={ed}
              mudar={mudar}
              segmentosMarca={dados.marca.segmentos.map((s) => s.nome).filter(Boolean)}
              confirmarReescrever={confirmarReescrever}
              onEscrever={escrever}
              onCancelarReescrever={() => setConfirmarReescrever(false)}
            />
          </MolduraSecao>

          <MolduraSecao
            id="texto"
            titulo="Texto"
            estado={estadoDe("texto").estado}
            linha={estadoDe("texto").linha}
            resumo={resumoTexto}
            aberta={ativa === "texto" && !somenteLeitura && ed.geracao === "pronto"}
            onAbrir={() => ir("texto")}
            somenteLeitura={somenteLeitura}
          >
            <SecaoTexto ed={ed} setEd={setEd} ocupado={ocupadoIa} onIa={executarIa} postSalvo={Boolean(postAtual)} onIrArte={() => ir("arte")} />
          </MolduraSecao>

          <MolduraSecao
            id="arte"
            titulo="Arte"
            estado={estadoDe("arte").estado}
            linha={estadoDe("arte").linha}
            resumo={resumoArte}
            aberta={ativa === "arte" && !somenteLeitura && arteLiberada}
            onAbrir={() => ir("arte")}
            somenteLeitura={somenteLeitura}
          >
            <SecaoArte
              ed={ed}
              mudar={mudar}
              marca={dados.marca}
              liberada={arteLiberada}
              ocupado={ocupadoArte}
              ocupadoIa={ocupadoIa}
              realce={realce}
              acervoDemo={estado.acervoDemo}
              onIa={executarIa}
              onAbrirChat={() => executarIa("descrever-imagem")}
              onGerarOpcoes={gerarOpcoes}
              onFinalizar={finalizarArte}
              onGerarStory={gerarStory}
              podeStory={podeStory}
              confirmarMontar={confirmarMontar}
              onConfirmarMontar={() => executarIa("montar-carrossel:confirmado")}
              onCancelarMontar={() => setConfirmarMontar(false)}
            />
          </MolduraSecao>

          <MolduraSecao
            id="enviar"
            titulo={somenteLeitura ? "Enviado" : "Enviar"}
            estado={estadoDe("enviar").estado}
            linha={estadoDe("enviar").linha}
            aberta={ativa === "enviar" && (enviarLiberado || somenteLeitura)}
            onAbrir={() => ir("enviar")}
            somenteLeitura={somenteLeitura}
          >
            <SecaoEnviar
              ed={ed}
              mudar={mudar}
              post={postAtual}
              somenteLeitura={somenteLeitura}
              podeEnviar={podeEnviar}
              analise={{
                tema: ed.tema,
                legenda: legendaFinal(ed),
                hashtags: ed.hashtags,
                ctas: ctasValidos(ed.ctas, ed.redes),
                redes: ed.redes,
                modelo: ed.template,
                hashtagsOficiais: dados.marca.hashtagsOficiais,
              }}
              onEnviar={enviar}
              onNovo={() => novoPost(true)}
              linkCard={linkCard}
              veioDeCard={Boolean(params.card || params.item)}
              tituloCard={itemAtual?.card.titulo}
            />
          </MolduraSecao>
        </div>

        <div className="lg:col-start-2 xl:sticky xl:top-6 xl:col-start-auto">
          <PreviaPost
            ed={ed}
            marca={dados.marca}
            mudar={mudar}
            liberada={arteLiberada}
            somenteLeitura={somenteLeitura}
            ocupado={ocupadoArte}
            finalizar={podeFinalizarArte({
              postSalvo: arteLiberada,
              modelo: ed.template,
              temImagem: Boolean(ed.imagemUrl),
              titulo: tituloDaArte(ed.tituloArte, ed.tituloSugerido),
              ocupado: Boolean(ocupadoArte),
            })}
            podeStory={podeStory}
            onFinalizar={finalizarArte}
            onGerarStory={gerarStory}
            onBaixar={baixar}
          />
        </div>
      </div>

      {mostrarAgente && (
        <AgenteMolecula
          estado={ocupadoIa ? "processando" : "vivo"}
          aberto={agenteAberto}
          onToggle={() => setAgenteAberto((v) => !v)}
          painel={painel}
          ocupado={Boolean(ocupadoIa)}
          onAcao={executarIa}
          onToggleCampo={() => {}}
        />
      )}

      {chatAberto && (
        <ChatImagem
          tema={ed.tema}
          descricaoBase={descreverImagem(briefingDe(ed))}
          indisponivel={estado.iaIndisponivel}
          onFechar={() => setChatAberto(false)}
          onUsarPrompt={(prompt) => {
            // "Usar este prompt" preenche o campo e abre "Gerar com a IA" (linha 37).
            setChatAberto(false);
            mudar({ descricaoImagem: prompt, origemImagem: "ia" });
          }}
        />
      )}

      {enviarSemCard && (
        <EnviarSemCardDialog
          post={enviarSemCard}
          dataSugerida={ed.dataSugerida || undefined}
          onFechar={() => setEnviarSemCard(null)}
          onEnviado={() => {
            setEnviarSemCard(null);
            setEd((e) => ({ ...e, sujo: false }));
          }}
        />
      )}
    </>
  );
}
