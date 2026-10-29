/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/estudio.tsx (estudioSearch, estado do briefing e da direção),
 *   src/hooks/use-gerar-direcao.ts (DirecaoState) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md (aprovada, D1 a D7)
 *   e docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Estado do editor do "Criar post" e como ele nasce da rota (?trend=, ?card=,
 * ?item=, ?post=). Sem React: só tipos e funções. Item 5.5d: o que vai para o
 * post a cada salvamento (`configArteDoEditor`, D5) e como ele volta ao reabrir.
 */
import { hrefDe } from "../../router";
import type { Seletores } from "../../store/HubStore";
import { novoId } from "../../store/HubStore";
import { ehArteRascunho } from "../../store/mock-arte";
import type { BriefingGeracao } from "../../store/mock-geracao";
import {
  REDES_ESTUDIO,
  REDES_PADRAO_ESTUDIO,
  dataSugeridaAoReabrir,
  dataSugeridaInicial,
  hashtagsDaTendencia,
  legendaSemBlocoCtas,
  type AprovacoesTexto,
} from "../../store/regras";
import type { ConfigArtePost, Cta, DadosHub, Marca, Post, Rede } from "../../store/tipos";
import { configArteInicial, type ConfigArte } from "./arte-config";

export type SecaoId = "sobre" | "texto" | "arte" | "enviar";
export const ORDEM_SECOES: SecaoId[] = ["sobre", "texto", "arte", "enviar"];

/** Chip de origem no cabeçalho (tendência, card ou pedido). */
export type OrigemChip = { tipo: "tendencia" | "card" | "pedido"; texto: string; detalhe?: string; href?: string };

export type OrigemImagem = "enviar" | "ia" | "acervo";

export type Editor = {
  postId: string;
  itemId?: string;
  trendId?: string;
  /** Tag da tendência (entra nas hashtags do fallback). */
  tagTendencia?: string;
  origens: OrigemChip[];
  /** Aviso ao abrir um post salvo (reprovado ou rascunho). */
  avisoPost?: { reprovado: boolean; texto: string };

  // Sobre o post
  tema: string;
  contexto: string;
  segmentos: string[];
  redes: Rede[];
  jaTenhoTextoAberto: boolean;
  legendaManual: string;
  hashtagsManuais: string;
  hashtagsVieramDaTendencia: boolean;

  // Texto (a Direção criativa do real)
  geracao: "nao" | "planejando" | "pronto";
  /** true quando a última escrita veio do modelo padrão (IA indisponível). */
  fallback: boolean;
  justificativa: string;
  legendaIa: string;
  /** "Sua versão": a legenda de "Já tenho um texto", editável. */
  legendaSua: string;
  versaoLegenda: "sua" | "ia";
  hashtags: string[];
  /** Uma chamada por rede (D1). */
  ctas: Cta[];
  aprovados: AprovacoesTexto;
  versoes: { legenda: number; hashtags: number; cta: number; textos: number; imagem: number };
  /** Título e subtítulo sugeridos com o texto (linha 32): a arte usa quando o título está vazio. */
  tituloSugerido: string;
  subtituloSugerido: string;

  // Arte (item 5.5b; carrossel, falha, Story e Baixar no 5.5c)
  origemImagem?: OrigemImagem;
  imagemUrl?: string;
  /** Prompt da imagem (Gerar com a IA). */
  descricaoImagem: string;
  /** Opções geradas nesta sessão; não são salvas no post, como no real (linha 36). */
  candidatas: string[];
  buscaAcervo: string;
  termos: string[];
  tituloArte: string;
  subtituloArte: string;
  template: Post["template"];
  /** Tudo o que Básico e Avançado mudam (D5: é salvo no post, em `configArte`, e volta ao reabrir). */
  arte: ConfigArte;
  arteUrl?: string;
  /** Pranchetas finais (no Estático e no Blog, uma só). `arteUrl` = a primeira. */
  arteUrls: string[];
  arteFinal: boolean;
  /** "Editar arte" (linha 71): com a arte pronta, reabre os controles; o botão vira "Gerar novamente". */
  editandoArte: boolean;
  /** Motivo da última falha do compositor (linha 67). Some ao tentar de novo. */
  arteErro?: string;
  /** Versão Story 9:16 gerada (linha 72); no carrossel, uma por prancheta. */
  storyUrls: string[];

  // Enviar (item 5.5d): observação e data sugerida opcional, sem mínimo (D3)
  observacao: string;
  dataSugerida: string;

  /** Há mudança ainda não gravada no post. */
  sujo: boolean;
};

export const NENHUMA_APROVADA: AprovacoesTexto = { legenda: false, hashtags: false, cta: false };
const TODAS_APROVADAS: AprovacoesTexto = { legenda: true, hashtags: true, cta: true };

/** A legenda que vale para o post: a versão escolhida no alternador. */
export function legendaFinal(ed: Editor): string {
  return ed.versaoLegenda === "sua" && ed.legendaSua.trim() ? ed.legendaSua : ed.legendaIa;
}

/** O alternador "Sua versão / Sugestão da IA" só aparece quando as duas existem e diferem (linha 23). */
export function temDuasVersoes(ed: Editor): boolean {
  return Boolean(ed.legendaSua.trim()) && Boolean(ed.legendaIa.trim()) && ed.legendaSua.trim() !== ed.legendaIa.trim();
}

export function ctaDaRede(ed: Editor, rede: Rede): Cta | undefined {
  return ed.ctas.find((c) => c.plataformas.includes(rede));
}

export function briefingDe(ed: Editor): BriefingGeracao {
  return {
    gancho: ed.tema,
    detalhamento: ed.contexto,
    segmento: ed.segmentos[0] ?? "",
    segmentos: ed.segmentos,
    redes: ed.redes,
  };
}

/** CTA antigo com várias redes vira um por rede (D1). */
function separarCtas(ctas: Cta[]): Cta[] {
  return ctas.flatMap((c) => c.plataformas.filter((r) => REDES_ESTUDIO.includes(r)).map((r) => ({ texto: c.texto, plataformas: [r] })));
}

/**
 * D5 (R-EST-5): o que vai para `Post.configArte` a cada salvamento automático.
 * Os textos da arte vão como digitados (vazios continuam vazios: a arte usa o
 * sugerido), para o post reabrir exatamente igual.
 */
export function configArteDoEditor(ed: Editor): ConfigArtePost {
  return {
    tituloArte: ed.tituloArte,
    subtituloArte: ed.subtituloArte,
    tituloSugerido: ed.tituloSugerido,
    subtituloSugerido: ed.subtituloSugerido,
    origemImagem: ed.origemImagem,
    imagemUrl: ed.imagemUrl,
    descricaoImagem: ed.descricaoImagem,
    buscaAcervo: ed.buscaAcervo,
    termos: ed.termos,
    ajustes: ed.arte,
  };
}

function editorVazio(cores: Marca["cores"]): Editor {
  return {
    postId: novoId("p"),
    origens: [],
    tema: "",
    contexto: "",
    segmentos: [],
    redes: [...REDES_PADRAO_ESTUDIO],
    jaTenhoTextoAberto: false,
    legendaManual: "",
    hashtagsManuais: "",
    hashtagsVieramDaTendencia: false,
    geracao: "nao",
    fallback: false,
    justificativa: "",
    legendaIa: "",
    legendaSua: "",
    versaoLegenda: "ia",
    hashtags: [],
    ctas: [],
    aprovados: NENHUMA_APROVADA,
    versoes: { legenda: 0, hashtags: 0, cta: 0, textos: 0, imagem: 0 },
    tituloSugerido: "",
    subtituloSugerido: "",
    descricaoImagem: "",
    candidatas: [],
    buscaAcervo: "",
    termos: [],
    tituloArte: "",
    subtituloArte: "",
    template: "A",
    // Os padrões da arte saem das cores do Brand Kit (título e subtítulo na 2ª cor).
    arte: configArteInicial(cores),
    arteUrls: [],
    arteFinal: false,
    editandoArte: false,
    storyUrls: [],
    observacao: "",
    dataSugerida: "",
    sujo: false,
  };
}

/**
 * Editor carregado de um post salvo (Continuar / Ajustar no Estúdio). Com a
 * D5, volta tudo o que o post guardou: contexto, textos da arte, imagem e
 * ajustes. Posts antigos (sem `configArte`) voltam com os padrões da arte.
 */
function editorDoPost(p: Post, cores: Marca["cores"]): Editor {
  const redes = p.redes.filter((r) => REDES_ESTUDIO.includes(r));
  const c = p.configArte;
  const arteSalva: Partial<Editor> = c
    ? {
        tituloArte: c.tituloArte,
        subtituloArte: c.subtituloArte,
        tituloSugerido: c.tituloSugerido,
        subtituloSugerido: c.subtituloSugerido,
        origemImagem: c.origemImagem,
        imagemUrl: c.imagemUrl,
        descricaoImagem: c.descricaoImagem,
        buscaAcervo: c.buscaAcervo,
        termos: c.termos,
        arte: c.ajustes,
      }
    : {
        tituloSugerido: p.tituloArte,
        subtituloSugerido: p.subtituloArte,
        tituloArte: p.tituloArte,
        subtituloArte: p.subtituloArte,
      };
  return {
    ...editorVazio(cores),
    postId: p.id,
    itemId: p.itemId,
    trendId: p.trendId,
    avisoPost:
      p.estado === "reprovado"
        ? { reprovado: true, texto: `Post reprovado. Motivo de quem aprovou: ${p.motivoReprovacao ?? "sem motivo registrado"}. Ajuste e reenvie: ele volta para a aprovação.` }
        : p.estado === "rascunho"
          ? { reprovado: false, texto: "Continuando um post salvo. Tudo o que você já fez está aqui, e cada mudança é salva sozinha." }
          : undefined,
    tema: p.titulo,
    contexto: p.detalhamento ?? "",
    segmentos: p.segmentos?.length ? p.segmentos : p.segmento ? [p.segmento] : [],
    redes: redes.length ? redes : [...REDES_PADRAO_ESTUDIO],
    geracao: p.legenda ? "pronto" : "nao",
    // D4: depois do envio a legenda guarda o bloco de CTAs; no editor ele sai, e o envio põe de novo.
    legendaIa: legendaSemBlocoCtas(p.legenda),
    hashtags: p.hashtags,
    ctas: separarCtas(p.ctas),
    aprovados: p.legenda ? TODAS_APROVADAS : NENHUMA_APROVADA,
    template: p.template,
    ...arteSalva,
    arteUrl: ehArteRascunho(p.arteUrl) ? undefined : p.arteUrl,
    arteUrls: ehArteRascunho(p.arteUrl) ? [] : p.arteUrls?.length ? p.arteUrls : [p.arteUrl],
    arteFinal: !ehArteRascunho(p.arteUrl),
    storyUrls: p.storyUrls ?? [],
    observacao: p.observacao ?? "",
    // D3: a data salva volta como estava, mesmo que já tenha passado.
    dataSugerida: dataSugeridaAoReabrir(p.dataSugerida),
  };
}

/** Monta o editor a partir dos parâmetros da rota. */
export function editorInicial(params: Record<string, string>, dados: DadosHub, sel: Seletores, hoje: string): Editor {
  const cores = dados.marca.cores;
  const existente = params.post ? sel.postPorId(params.post) : undefined;
  const item = params.item ? sel.itemPorId(params.item) : params.card ? sel.itemPorId(params.card) : undefined;
  const prazoItem = item ? (item.tipo === "subtarefa" ? item.sub.prazo ?? item.card.prazo : item.card.prazo) : undefined;

  if (existente) return editorDoPost(existente, cores);
  if (item) {
    const doItem = sel.postDoItem(item.id);
    if (doItem) return editorDoPost(doItem, cores);
  }

  const ed = editorVazio(cores);
  const trendId = params.trend ?? item?.card.trendId;
  const trend = trendId ? dados.tendencias.find((t) => t.id === trendId) : undefined;

  // Linha 8: vindo de tendência, briefing preenchido e segmento pré-selecionado pelo nome.
  if (trend) {
    ed.trendId = trend.id;
    ed.tagTendencia = trend.tag;
    ed.tema = trend.titulo;
    ed.contexto = trend.proposta;
    if (dados.marca.segmentos.some((s) => s.nome === trend.segmento)) ed.segmentos = [trend.segmento];
    // Linha 9: hashtags preenchidas sem IA, a partir da tag e do tema.
    const tags = hashtagsDaTendencia(trend.tag, trend.titulo);
    if (tags.length) {
      ed.hashtagsManuais = tags.join(" ");
      ed.hashtagsVieramDaTendencia = true;
      ed.jaTenhoTextoAberto = true;
    }
    ed.origens.push({
      tipo: "tendencia",
      texto: trend.titulo,
      detalhe: "Este post nasceu de uma tendência de mercado. O briefing já veio preenchido.",
      href: hrefDe("tendencias", "tendencias", { trend: trend.id }),
    });
  }

  // Linha 10: vindo de card ou pedido, o post nasce ligado ao item.
  if (item) {
    ed.itemId = item.id;
    const card = item.card;
    ed.tema = item.tipo === "subtarefa" ? item.sub.titulo : ed.tema || card.titulo;
    const descricao = item.tipo === "subtarefa" ? item.sub.descricao || card.descricao : card.descricao;
    if (descricao && !trend) ed.contexto = descricao;
    ed.origens.push({
      tipo: "card",
      texto: item.tipo === "subtarefa" ? `${card.titulo} · ${item.sub.titulo}` : card.titulo,
      detalhe: "Quando o texto for aprovado, o post é salvo neste item e o card vai sozinho para Em andamento.",
      href: hrefDe("tarefas", "quadro", { card: card.id }),
    });
    if (card.pedido) {
      const proposta = card.pedido.meta.mensagemChave || card.descricao;
      if (proposta) ed.origens.push({ tipo: "pedido", texto: `Do pedido: ${proposta}` });
    }
  }

  ed.dataSugerida = dataSugeridaInicial(hoje, undefined, prazoItem);
  return ed;
}

/** Em qual seção o editor abre. */
export function secaoInicial(ed: Editor, somenteLeitura: boolean, postExiste: boolean): SecaoId {
  if (somenteLeitura) return "enviar";
  if (ed.geracao !== "pronto") return "sobre";
  if (!postExiste) return "texto";
  return ed.arteFinal ? "enviar" : "arte";
}
