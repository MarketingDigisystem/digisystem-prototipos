/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hooks/use-posts.ts, src/hooks/use-tasks.ts,
 *   src/hooks/use-solicitacoes-externas.ts, src/hooks/use-trends.ts
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Store em memória do hub-novo: context + reducer + seletores.
 *  - `reduzir` é o reducer puro: só aplica a mudança.
 *  - `acoes` valida com regras.ts ANTES de despachar e devolve um Resultado
 *    com a mensagem pronta para a tela (a mesma mensagem vira aviso).
 *  - `sel` são as regras de leitura já ligadas aos dados atuais.
 * O estado vive num ref atualizado de forma síncrona, para que duas ações na
 * mesma interação (ex.: salvar e enviar) enxerguem o estado mais novo.
 * No app real, cada ação equivale a um hook central (use-posts / use-tasks) e
 * a automação card ← post fica no banco (K13, proposta 4.5).
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { PERSONAS_DEMO, criarDadosExemplo, isoDia } from "./mock-dados";
import { SWOT_REGENERADO } from "./mock-referencia";
import * as R from "./regras";
import type {
  CamposAgente,
  Card,
  Comentario,
  DadosHub,
  Etiqueta,
  Marca,
  Papel,
  Post,
  Problema,
  Subtarefa,
  SwotItem,
  Usuario,
} from "./tipos";

// ─── Estado ───────────────────────────────────────────────────────────────

export type EstadoHub = {
  dados: DadosHub;
  /** "Hoje" do protótipo (YYYY-MM-DD). O painel de demo avança 1 dia. */
  hoje: string;
  papel: Papel;
  usuarioId: string;
  /** K11 em decisão: arte travada depois de publicar? (alternador do painel). */
  arteTravadaAposPublicar: boolean;
  /** Simula a IA do Estúdio fora do ar (fallback "IA indisponível", linha 20 do inventário). */
  iaIndisponivel: boolean;
  /** Simula a busca no acervo (linha 38): normal, sem resultado ou com erro. */
  acervoDemo: "normal" | "vazio" | "erro";
  /** Simula o compositor da arte (linha 67): normal ou falha com motivo. */
  composicaoDemo: "normal" | "falha";
  aviso: { id: number; texto: string; tom: "info" | "erro" } | null;
};

function estadoInicial(): EstadoHub {
  const agora = new Date();
  return {
    dados: criarDadosExemplo(agora),
    hoje: isoDia(agora),
    papel: "marketing",
    usuarioId: PERSONAS_DEMO.marketing,
    arteTravadaAposPublicar: true,
    iaIndisponivel: false,
    acervoDemo: "normal",
    composicaoDemo: "normal",
    aviso: null,
  };
}

/** Instante ISO no "hoje" do protótipo, com a hora do relógio. */
function agoraNo(hoje: string): string {
  const [a, m, d] = hoje.split("-").map(Number);
  const r = new Date();
  return new Date(a, m - 1, d, r.getHours(), r.getMinutes(), r.getSeconds()).toISOString();
}

// ─── Ações do reducer ─────────────────────────────────────────────────────

export type Destino = { tipo: "existente"; itemId: string } | { tipo: "novo"; card: Card };
type Alvo = { tipo: "card" | "subtarefa"; id: string };

export type Acao =
  | { t: "entrar_como"; papel: Papel }
  | { t: "avancar_dia" }
  | { t: "restaurar" }
  | { t: "alternar_k11" }
  | { t: "alternar_ia" }
  | { t: "definir_acervo"; modo: EstadoHub["acervoDemo"] }
  | { t: "definir_composicao"; modo: EstadoHub["composicaoDemo"] }
  | { t: "avisar"; texto: string; tom: "info" | "erro"; id: number }
  | { t: "limpar_aviso"; id: number }
  // Cards e subtarefas
  | { t: "criar_card"; card: Card }
  | { t: "atualizar_card"; id: string; patch: Partial<Card> }
  | { t: "mover_card"; id: string; destino: R.Coluna }
  | { t: "criar_subtarefa"; sub: Subtarefa }
  | { t: "atualizar_subtarefa"; id: string; patch: Partial<Subtarefa> }
  | { t: "concluir_subtarefa"; id: string; concluida: boolean }
  | { t: "excluir_item"; id: string }
  | { t: "comentar"; comentario: Comentario }
  // Posts
  | { t: "salvar_post"; post: Post }
  | { t: "enviar_post"; id: string; dataSugerida?: string; destino?: Destino }
  | { t: "assumir_revisao"; id: string }
  | { t: "aprovar_post"; id: string; dataPublicacao?: string; por: string }
  | { t: "reprovar_post"; id: string; motivo: string; por: string; problemaId: string }
  | { t: "marcar_publicado"; id: string }
  | { t: "associar_post"; postId: string; itemId: string }
  | { t: "desassociar_post"; postId: string }
  | { t: "trocar_arte"; postId: string; arteUrl: string }
  | { t: "apagar_post"; postId: string }
  // Problemas
  | { t: "marcar_bloqueado"; alvo: Alvo; motivo: string; problemaId: string }
  | { t: "resolver_problema"; id: string }
  // Pedidos
  | { t: "assumir_pedido"; cardId: string }
  | { t: "aprovar_pedido"; cardId: string; responsavelId: string; etiquetas: string[]; decisaoId: string }
  | { t: "devolver_pedido"; cardId: string; motivo: string; decisaoId: string; problemaId: string }
  | { t: "negar_pedido"; cardId: string; motivo: string; decisaoId: string }
  | { t: "solicitante_reenviou"; cardId: string }
  // Tendências
  | { t: "descartar_tendencia"; id: string; motivo: string }
  | { t: "reativar_tendencia"; id: string }
  // SWOT
  | { t: "trocar_swot"; item: SwotItem }
  | { t: "regenerar_swot"; itens: SwotItem[] }
  // Configurações e marca
  | { t: "criar_etiqueta"; etiqueta: Etiqueta }
  | { t: "atualizar_etiqueta"; id: string; patch: Partial<Etiqueta> }
  | { t: "atualizar_marca"; patch: Partial<Marca> }
  | { t: "atualizar_prompt"; id: string; texto: string }
  | { t: "salvar_campos_agente"; campos: CamposAgente }
  | { t: "atualizar_webhook"; id: string; url: string }
  | { t: "convidar_usuario"; usuario: Usuario }
  | { t: "atualizar_usuario"; id: string; patch: Partial<Usuario> }
  | { t: "remover_usuario"; id: string };

// ─── Reducer puro ─────────────────────────────────────────────────────────

const trocar = <T extends { id: string }>(lista: T[], id: string, f: (x: T) => T): T[] =>
  lista.map((x) => (x.id === id ? f(x) : x));

/** Quando um post é salvo ou associado num item, o card vai sozinho para Em andamento (4.3 item 1). */
function cardParaAndamento(d: DadosHub, itemId: string): DadosHub {
  const item = R.itemPorId(d, itemId);
  if (!item) return d;
  const limparK10 = <T extends { id: string; postApagado?: unknown }>(x: T) => (x.id === itemId ? { ...x, postApagado: undefined } : x);
  return {
    ...d,
    cards: d.cards.map((c) => (c.id === item.card.id ? { ...limparK10(c), colunaBase: "andamento", concluidoManualEm: undefined } : c)),
    subtarefas: d.subtarefas.map(limparK10),
  };
}

/** Fecha os problemas "reprovado" do post (abre e fecha sozinho, tabela de 4.4). */
function fecharReprovados(d: DadosHub, postId: string, por: string, agora: string): Problema[] {
  return d.problemas.map((p) =>
    !p.resolvidoEm && p.tipo === "reprovado" && p.alvo.tipo === "post" && p.alvo.id === postId
      ? { ...p, resolvidoEm: agora, resolvidoPor: por }
      : p,
  );
}

export function reduzir(s: EstadoHub, a: Acao): EstadoHub {
  const d = s.dados;
  const agora = agoraNo(s.hoje);
  const com = (dados: DadosHub): EstadoHub => ({ ...s, dados });
  const posts = (f: (p: Post) => Post, id: string) => trocar(d.posts, id, f);

  switch (a.t) {
    case "entrar_como":
      return { ...s, papel: a.papel, usuarioId: PERSONAS_DEMO[a.papel] };
    case "avancar_dia":
      return { ...s, hoje: R.somarDias(s.hoje, 1) };
    case "restaurar":
      return { ...estadoInicial(), papel: s.papel, usuarioId: s.usuarioId };
    case "alternar_k11":
      return { ...s, arteTravadaAposPublicar: !s.arteTravadaAposPublicar };
    case "alternar_ia":
      return { ...s, iaIndisponivel: !s.iaIndisponivel };
    case "definir_acervo":
      return { ...s, acervoDemo: a.modo };
    case "definir_composicao":
      return { ...s, composicaoDemo: a.modo };
    case "avisar":
      return { ...s, aviso: { id: a.id, texto: a.texto, tom: a.tom } };
    case "limpar_aviso":
      return s.aviso?.id === a.id ? { ...s, aviso: null } : s;

    // Cards e subtarefas
    case "criar_card":
      return com({ ...d, cards: [a.card, ...d.cards] });
    case "atualizar_card":
      return com({ ...d, cards: trocar(d.cards, a.id, (c) => ({ ...c, ...a.patch })) });
    case "mover_card":
      return com({ ...d, cards: trocar(d.cards, a.id, (c) => R.aplicarMovimento(c, a.destino, agora)) });
    case "criar_subtarefa": {
      // Subtarefa nova num card concluído reabre o card (ele volta para a coluna base).
      return com({ ...d, subtarefas: [...d.subtarefas, a.sub] });
    }
    case "atualizar_subtarefa":
      return com({ ...d, subtarefas: trocar(d.subtarefas, a.id, (x) => ({ ...x, ...a.patch })) });
    case "concluir_subtarefa":
      return com({
        ...d,
        subtarefas: trocar(d.subtarefas, a.id, (x) => ({ ...x, concluidaEm: a.concluida ? agora : undefined })),
      });
    case "excluir_item": {
      const ids = new Set(R.idsDescendentes(d, a.id));
      return com({
        ...d,
        cards: d.cards.filter((c) => !ids.has(c.id)),
        subtarefas: d.subtarefas.filter((x) => !ids.has(x.id)),
        comentarios: d.comentarios.filter((c) => !ids.has(c.itemId)),
        problemas: d.problemas.filter((p) => !(p.alvo.tipo !== "post" && ids.has(p.alvo.id))),
      });
    }
    case "comentar":
      return com({ ...d, comentarios: [...d.comentarios, a.comentario] });

    // Posts
    case "salvar_post": {
      const existe = d.posts.some((p) => p.id === a.post.id);
      const salvo = { ...a.post, atualizadoEm: agora };
      let nd: DadosHub = { ...d, posts: existe ? trocar(d.posts, a.post.id, () => salvo) : [salvo, ...d.posts] };
      if (salvo.itemId) nd = cardParaAndamento(nd, salvo.itemId);
      return com(nd);
    }
    case "enviar_post": {
      let nd = d;
      let itemId = d.posts.find((p) => p.id === a.id)?.itemId;
      if (a.destino?.tipo === "novo") {
        nd = { ...nd, cards: [{ ...a.destino.card, colunaBase: "andamento" }, ...nd.cards] };
        itemId = a.destino.card.id;
      } else if (a.destino?.tipo === "existente") {
        itemId = a.destino.itemId;
      }
      nd = {
        ...nd,
        problemas: fecharReprovados(nd, a.id, s.usuarioId, agora),
        posts: trocar(nd.posts, a.id, (p) => ({
          ...p,
          // D4 (R-EST-4): a legenda gravada leva o bloco de CTAs no fim; os CTAs ficam também em `ctas`.
          legenda: R.legendaComBlocoCtas(p.legenda, p.ctas),
          estado: "enviado",
          itemId,
          dataSugerida: a.dataSugerida ?? p.dataSugerida,
          motivoReprovacao: undefined,
          emRevisaoPor: undefined,
          atualizadoEm: agora,
        })),
      };
      if (itemId) nd = cardParaAndamento(nd, itemId);
      return com(nd);
    }
    case "assumir_revisao":
      return com({ ...d, posts: posts((p) => ({ ...p, emRevisaoPor: s.usuarioId }), a.id) });
    case "aprovar_post":
      return com({
        ...d,
        posts: posts(
          (p) => ({
            ...p,
            estado: "aprovado",
            dataPublicacao: a.dataPublicacao,
            aprovadoEm: agora,
            aprovadoPor: a.por,
            emRevisaoPor: undefined,
            atualizadoEm: agora,
          }),
          a.id,
        ),
      });
    case "reprovar_post": {
      const post = d.posts.find((p) => p.id === a.id);
      const item = post?.itemId ? R.itemPorId(d, post.itemId) : undefined;
      const problema: Problema | null = item
        ? {
            id: a.problemaId,
            tipo: "reprovado",
            alvo: { tipo: "post", id: a.id },
            cardId: item.card.id,
            motivo: a.motivo,
            abertoPor: a.por,
            abertoEm: agora,
          }
        : null;
      return com({
        ...d,
        problemas: problema ? [...d.problemas, problema] : d.problemas,
        posts: posts(
          (p) => ({ ...p, estado: "reprovado", motivoReprovacao: a.motivo, emRevisaoPor: undefined, atualizadoEm: agora }),
          a.id,
        ),
      });
    }
    case "marcar_publicado":
      return com({ ...d, posts: posts((p) => ({ ...p, estado: "publicado", publicadoEm: agora, atualizadoEm: agora }), a.id) });
    case "associar_post":
      return com(cardParaAndamento({ ...d, posts: posts((p) => ({ ...p, itemId: a.itemId, atualizadoEm: agora }), a.postId) }, a.itemId));
    case "desassociar_post": {
      // O post reprovado leva o problema junto: o registro fica com o post, fora do card.
      return com({
        ...d,
        problemas: d.problemas.map((p) =>
          !p.resolvidoEm && p.alvo.tipo === "post" && p.alvo.id === a.postId ? { ...p, resolvidoEm: agora, resolvidoPor: s.usuarioId } : p,
        ),
        posts: posts((p) => ({ ...p, itemId: undefined, atualizadoEm: agora }), a.postId),
      });
    }
    case "trocar_arte":
      return com({
        ...d,
        posts: posts(
          (p) => ({
            ...p,
            arteAnteriorUrl: p.arteUrl,
            arteUrl: a.arteUrl,
            arteAjustadaPor: s.usuarioId,
            estado: R.estadoAposTrocarArte(p),
            publicadoEm: p.estado === "publicado" ? undefined : p.publicadoEm,
            dataSugerida: p.estado === "aprovado" || p.estado === "publicado" ? p.dataPublicacao ?? p.dataSugerida : p.dataSugerida,
            atualizadoEm: agora,
          }),
          a.postId,
        ),
      });
    case "apagar_post": {
      const post = d.posts.find((p) => p.id === a.postId);
      if (!post) return s;
      const marca = { titulo: post.titulo, em: agora };
      return com({
        ...d,
        posts: d.posts.filter((p) => p.id !== a.postId),
        problemas: d.problemas.filter((p) => !(p.alvo.tipo === "post" && p.alvo.id === a.postId)),
        cards: d.cards.map((c) => (c.id === post.itemId ? { ...c, postApagado: marca } : c)),
        subtarefas: d.subtarefas.map((x) => (x.id === post.itemId ? { ...x, postApagado: marca } : x)),
      });
    }

    // Problemas
    case "marcar_bloqueado": {
      const item = R.itemPorId(d, a.alvo.id);
      if (!item) return s;
      const problema: Problema = {
        id: a.problemaId,
        tipo: "bloqueado",
        alvo: a.alvo,
        cardId: item.card.id,
        motivo: a.motivo.trim(),
        abertoPor: s.usuarioId,
        abertoEm: agora,
      };
      return com({ ...d, problemas: [...d.problemas, problema] });
    }
    case "resolver_problema":
      return com({
        ...d,
        problemas: trocar(d.problemas, a.id, (p) => ({ ...p, resolvidoEm: agora, resolvidoPor: s.usuarioId })),
      });

    // Pedidos (4.9)
    case "assumir_pedido":
      return com({
        ...d,
        cards: trocar(d.cards, a.cardId, (c) =>
          c.pedido ? { ...c, pedido: { ...c.pedido, estado: "triagem", triagemPor: s.usuarioId, triagemEm: agora } } : c,
        ),
      });
    case "aprovar_pedido":
      return com({
        ...d,
        cards: trocar(d.cards, a.cardId, (c) =>
          c.pedido
            ? {
                ...c,
                responsavelId: a.responsavelId,
                etiquetas: R.etiquetasAoAprovar(c, a.etiquetas),
                colunaBase: "afazer",
                pedido: { ...c.pedido, estado: "aprovado", triagemPor: c.pedido.triagemPor ?? s.usuarioId },
              }
            : c,
        ),
        decisoes: [...d.decisoes, { id: a.decisaoId, cardId: a.cardId, tipo: "aprovado", por: s.usuarioId, em: agora }],
      });
    case "devolver_pedido":
      return com({
        ...d,
        cards: trocar(d.cards, a.cardId, (c) =>
          c.pedido ? { ...c, pedido: { ...c.pedido, estado: "devolvido", triagemPor: c.pedido.triagemPor ?? s.usuarioId } } : c,
        ),
        problemas: [
          ...d.problemas,
          {
            id: a.problemaId,
            tipo: "aguardando_solicitante",
            alvo: { tipo: "card", id: a.cardId },
            cardId: a.cardId,
            motivo: a.motivo.trim(),
            abertoPor: s.usuarioId,
            abertoEm: agora,
          },
        ],
        decisoes: [
          ...d.decisoes,
          { id: a.decisaoId, cardId: a.cardId, tipo: "devolvido", por: s.usuarioId, em: agora, motivo: a.motivo.trim() },
        ],
      });
    case "negar_pedido":
      return com({
        ...d,
        cards: trocar(d.cards, a.cardId, (c) =>
          c.pedido ? { ...c, pedido: { ...c.pedido, estado: "negado", triagemPor: c.pedido.triagemPor ?? s.usuarioId } } : c,
        ),
        decisoes: [
          ...d.decisoes,
          { id: a.decisaoId, cardId: a.cardId, tipo: "negado", por: s.usuarioId, em: agora, motivo: a.motivo.trim() },
        ],
      });
    case "solicitante_reenviou":
      // Fecha o "Aguardando o solicitante" e o pedido volta para Recebidos (roteiro R3).
      return com({
        ...d,
        problemas: d.problemas.map((p) =>
          !p.resolvidoEm && p.cardId === a.cardId && p.tipo === "aguardando_solicitante"
            ? { ...p, resolvidoEm: agora, resolvidoPor: p.abertoPor }
            : p,
        ),
        cards: trocar(d.cards, a.cardId, (c) =>
          c.pedido
            ? { ...c, pedido: { ...c.pedido, estado: "recebido", recebidoEm: agora, triagemPor: undefined, triagemEm: undefined } }
            : c,
        ),
      });

    // Tendências (2.7)
    case "descartar_tendencia":
      return com({
        ...d,
        tendencias: trocar(d.tendencias, a.id, (t) => ({ ...t, descarte: { motivo: a.motivo.trim(), por: s.usuarioId, em: agora } })),
      });
    case "reativar_tendencia":
      return com({ ...d, tendencias: trocar(d.tendencias, a.id, (t) => ({ ...t, descarte: undefined })) });

    // SWOT
    case "trocar_swot":
      return com({ ...d, swot: trocar(d.swot, a.item.id, () => a.item) });
    case "regenerar_swot":
      return com({ ...d, swot: a.itens, swotAnalisadoEm: agora });

    // Configurações e marca
    case "criar_etiqueta":
      return com({ ...d, etiquetas: [...d.etiquetas, a.etiqueta] });
    case "atualizar_etiqueta":
      return com({ ...d, etiquetas: trocar(d.etiquetas, a.id, (e) => ({ ...e, ...a.patch })) });
    case "atualizar_marca":
      return com({ ...d, marca: { ...d.marca, ...a.patch } });
    case "atualizar_prompt":
      return com({ ...d, prompts: trocar(d.prompts, a.id, (p) => ({ ...p, texto: a.texto, noBanco: true })) });
    case "salvar_campos_agente":
      return com({ ...d, camposAgente: a.campos });
    case "atualizar_webhook":
      return com({ ...d, webhooks: trocar(d.webhooks, a.id, (w) => ({ ...w, url: a.url })) });
    case "convidar_usuario":
      return com({ ...d, usuarios: [...d.usuarios, a.usuario] });
    case "atualizar_usuario":
      return com({ ...d, usuarios: trocar(d.usuarios, a.id, (u) => ({ ...u, ...a.patch })) });
    case "remover_usuario":
      return com(R.aplicarRemocao(d, a.id, agora));
  }
}

// ─── Contexto ─────────────────────────────────────────────────────────────

type Ctx = { estado: EstadoHub; despachar: (a: Acao) => void; ler: () => EstadoHub };
const HubCtx = createContext<Ctx | null>(null);

export function HubStoreProvider({ children }: { children: ReactNode }) {
  const ref = useRef<EstadoHub | null>(null);
  if (ref.current === null) ref.current = estadoInicial();
  const [, setVersao] = useState(0);

  const despachar = useCallback((a: Acao) => {
    ref.current = reduzir(ref.current as EstadoHub, a);
    setVersao((v) => v + 1);
  }, []);
  const ler = useCallback(() => ref.current as EstadoHub, []);

  const estado = ref.current;
  const valor = useMemo(() => ({ estado, despachar, ler }), [estado, despachar, ler]);
  return <HubCtx.Provider value={valor}>{children}</HubCtx.Provider>;
}

// ─── Hook público: estado + seletores + ações ─────────────────────────────

let contador = 0;
/** Id único em memória (prefixo legível para depurar). */
export const novoId = (prefixo: string) => `${prefixo}-${Date.now().toString(36)}-${(contador++).toString(36)}`;

export function useHub() {
  const ctx = useContext(HubCtx);
  if (!ctx) throw new Error("useHub precisa estar dentro de HubStoreProvider.");
  const { estado, despachar, ler } = ctx;

  const sel = useMemo(() => criarSeletores(estado), [estado]);
  const acoes = useMemo(() => criarAcoes(despachar, ler), [despachar, ler]);
  const usuario = estado.dados.usuarios.find((u) => u.id === estado.usuarioId) as Usuario;

  return { estado, dados: estado.dados, hoje: estado.hoje, papel: estado.papel, usuario, sel, acoes };
}

/** Regras de leitura ligadas ao estado atual. */
function criarSeletores(s: EstadoHub) {
  const d = s.dados;
  return {
    usuarioPorId: (id?: string) => d.usuarios.find((u) => u.id === id),
    solicitantePorId: (id?: string) => d.solicitantes.find((x) => x.id === id),
    etiquetaPorId: (id: string) => d.etiquetas.find((e) => e.id === id),
    cardPorId: (id: string) => R.cardPorId(d, id),
    itemPorId: (id: string) => R.itemPorId(d, id),
    postPorId: (id: string) => d.posts.find((p) => p.id === id),
    postDoItem: (itemId: string) => R.postDoItem(d, itemId),
    postsDoCard: (cardId: string) => R.postsDoCard(d, cardId),
    subtarefasDoCard: (cardId: string) => R.subtarefasDoCard(d, cardId),
    filhasDe: (cardId: string, paiId: string) => R.filhasDe(d, cardId, paiId),
    subtarefaConcluida: (sub: Subtarefa) => R.subtarefaConcluida(d, sub),
    colunaDoCard: (card: Card) => R.colunaDoCard(d, card),
    cardsPorColuna: () => R.cardsPorColuna(d),
    resumoCard: (card: Card) => R.resumoCard(d, card),
    alertaDoCard: (card: Card) => R.alertaDoCard(d, card),
    avisoSemPost: (card: Card) => R.avisoSemPost(d, card),
    textoFalta: (card: Card) => R.textoFalta(d, card),
    problemasDoItem: (itemId: string) => R.problemasDoItem(d, itemId),
    problemasAbertosDoCard: (cardId: string) => R.problemasAbertosDoCard(d, cardId),
    estadoPost: (post: Post) => R.estadoPostExibido(post, s.hoje),
    cardAtrasado: (card: Card) => R.cardAtrasado(d, card, s.hoje),
    subtarefaAtrasada: (sub: Subtarefa) => R.subtarefaAtrasada(d, sub, s.hoje),
    podeMover: (card: Card, destino: R.Coluna) => R.podeMover(d, card, destino),
    podeAssociar: (post: Post, itemId: string) => R.podeAssociar(d, post, itemId),
    podeDesassociar: (post: Post) => R.podeDesassociar(post),
    podeEnviar: (post: Post) => R.podeEnviar(post),
    podeDecidirPost: (post: Post) => R.podeDecidirPost(post, s.usuarioId, s.papel),
    podeMarcarPublicado: (post: Post) => R.podeMarcarPublicado(post),
    podeTrocarArte: (post: Post) => R.podeTrocarArte(post, s.arteTravadaAposPublicar),
    podeMarcarBloqueado: (alvo: Alvo) => R.podeMarcarBloqueado(d, alvo),
    podeCriarSubtarefa: (paiId: string) => R.podeCriarSubtarefa(d, paiId),
    podeConcluirManual: (sub: Subtarefa) => R.podeConcluirManual(d, sub),
    podeExcluirItem: (itemId: string) => R.podeExcluirItem(d, itemId),
    podeDecidirPedido: (card: Card) => R.podeDecidirPedido(d, card, s.usuarioId),
    postsParaAssociar: () => R.postsParaAssociar(d, s.usuarioId),
    situacaoTendencia: (t: DadosHub["tendencias"][number]) => R.situacaoTendencia(d, t),
    tendenciaDestaque: () => R.tendenciaDestaque(d),
    /** Minha mesa (2.6) da pessoa e do papel atuais. */
    mesa: () => R.mesaDoUsuario(d, s.usuarioId, s.papel, s.hoje),
    /** Resultados → Time (4.11) do mês do "hoje" ou do anterior. */
    metricasTime: (chave: "atual" | "anterior") => {
      const [atual, anterior] = R.periodosDoTime(s.hoje);
      return R.metricasDoTime(d, chave === "atual" ? atual : anterior, s.hoje, agoraNo(s.hoje));
    },
    podeDescartarTendencia: (t: DadosHub["tendencias"][number]) => R.podeDescartarTendencia(d, t),
    estadoParaSolicitante: (card: Card) => R.estadoParaSolicitante(d, card),
    etiquetasAtivas: () => d.etiquetas.filter((e) => !e.arquivada),
    // Configurações (proposta 7)
    membrosEquipe: () => R.membrosDaEquipe(d.usuarios),
    resumoEquipe: () => R.resumoDaEquipe(d.usuarios),
    trabalhoAbertoDe: (usuarioId: string) => R.trabalhoAbertoDe(d, usuarioId),
    podeMudarPapel: (alvoId: string, novo: Papel) => R.podeMudarPapel(d.usuarios, alvoId, novo, s.usuarioId),
    podeRemoverUsuario: (alvoId: string) => R.podeRemoverUsuario(d.usuarios, alvoId, s.usuarioId),
    usoEtiqueta: (id: string) => R.usoDaEtiqueta(d, id),
  };
}

export type Seletores = ReturnType<typeof criarSeletores>;

/**
 * Ações da interface. Cada uma valida com regras.ts no estado MAIS NOVO,
 * despacha se puder e devolve o Resultado. Quando barra, já mostra o aviso.
 */
function criarAcoes(despachar: (a: Acao) => void, ler: () => EstadoHub) {
  const avisar = (texto: string, tom: "info" | "erro" = "info") => {
    const id = ++contador;
    despachar({ t: "avisar", texto, tom, id });
    window.setTimeout(() => despachar({ t: "limpar_aviso", id }), 4200);
  };
  /** Executa se a regra deixar; senão avisa com o motivo. */
  const se = (r: R.Resultado, f: () => void, ok?: string): R.Resultado => {
    if (!r.ok) {
      avisar(r.motivo, "erro");
      return r;
    }
    f();
    if (ok) avisar(ok);
    return r;
  };
  const post = (id: string) => ler().dados.posts.find((p) => p.id === id);
  const card = (id: string) => R.cardPorId(ler().dados, id);
  const naoAchou: R.Resultado = { ok: false, motivo: "Não encontrado no protótipo." };
  const agora = () => agoraNo(ler().hoje);

  return {
    avisar,

    // Painel de demo
    entrarComo: (papel: Papel) => despachar({ t: "entrar_como", papel }),
    avancarDia: () => despachar({ t: "avancar_dia" }),
    restaurar: () => {
      despachar({ t: "restaurar" });
      avisar("Dados de exemplo restaurados.");
    },
    alternarK11: () => despachar({ t: "alternar_k11" }),
    alternarIa: () => despachar({ t: "alternar_ia" }),
    definirAcervo: (modo: EstadoHub["acervoDemo"]) => despachar({ t: "definir_acervo", modo }),
    definirComposicao: (modo: EstadoHub["composicaoDemo"]) => despachar({ t: "definir_composicao", modo }),

    // Cards
    /** Cria um card em A fazer (Nova tarefa, Tendência → Criar card). Devolve o id. */
    criarCard: (dadosCard: Partial<Card> & { titulo: string }): string => {
      const s = ler();
      const id = novoId("c");
      despachar({
        t: "criar_card",
        card: {
          id,
          descricao: "",
          etiquetas: [],
          origem: "manual",
          colunaBase: "afazer",
          criadoPor: s.usuarioId,
          criadoEm: agoraNo(s.hoje),
          ...dadosCard,
        },
      });
      return id;
    },
    atualizarCard: (id: string, patch: Partial<Card>) => despachar({ t: "atualizar_card", id, patch }),
    moverCard: (id: string, destino: R.Coluna): R.Resultado => {
      const c = card(id);
      if (!c) return naoAchou;
      return se(R.podeMover(ler().dados, c, destino), () => despachar({ t: "mover_card", id, destino }));
    },

    // Subtarefas
    criarSubtarefa: (cardId: string, paiId: string, campos: { titulo: string; responsavelId?: string; prazo?: string }): R.Resultado => {
      const s = ler();
      return se(R.podeCriarSubtarefa(s.dados, paiId), () => {
        const irmas = R.filhasDe(s.dados, cardId, paiId);
        despachar({
          t: "criar_subtarefa",
          sub: {
            id: novoId("s"),
            cardId,
            parentId: paiId === cardId ? undefined : paiId,
            ordem: irmas.length,
            criadoEm: agoraNo(s.hoje),
            ...campos,
          },
        });
      });
    },
    atualizarSubtarefa: (id: string, patch: Partial<Subtarefa>) => despachar({ t: "atualizar_subtarefa", id, patch }),
    concluirSubtarefa: (id: string, concluida: boolean): R.Resultado => {
      const sub = ler().dados.subtarefas.find((x) => x.id === id);
      if (!sub) return naoAchou;
      return se(R.podeConcluirManual(ler().dados, sub), () => despachar({ t: "concluir_subtarefa", id, concluida }));
    },
    excluirItem: (id: string): R.Resultado => se(R.podeExcluirItem(ler().dados, id), () => despachar({ t: "excluir_item", id })),
    comentar: (itemId: string, texto: string) => {
      if (!texto.trim()) return;
      const s = ler();
      despachar({ t: "comentar", comentario: { id: novoId("cm"), itemId, autorId: s.usuarioId, texto: texto.trim(), em: agoraNo(s.hoje) } });
    },

    // Posts
    /** Salva (cria ou atualiza). Com itemId, o card vai para Em andamento (4.3 item 1). Devolve o id. */
    salvarPost: (p: Post): string => {
      despachar({ t: "salvar_post", post: p });
      return p.id;
    },
    /**
     * Envia ou reenvia. Sem card, a tela precisa perguntar antes (4.6) e passar
     * `destino`; sem destino, a ação barra com a pergunta.
     */
    enviarPost: (id: string, dataSugerida?: string, destino?: Destino): R.Resultado => {
      const p = post(id);
      if (!p) return naoAchou;
      const r = R.podeEnviar(p);
      if (!r.ok) return se(r, () => {});
      if (R.precisaEscolherCard(p) && !destino) {
        return se({ ok: false, motivo: "Este post ainda não está em nenhum card. Associe a um card existente ou crie um novo." }, () => {});
      }
      if (destino?.tipo === "existente") {
        const ra = R.podeAssociar(ler().dados, p, destino.itemId);
        if (!ra.ok) return se(ra, () => {});
      }
      return se(r, () => despachar({ t: "enviar_post", id, dataSugerida, destino }), "Enviado para aprovação.");
    },
    assumirRevisao: (id: string) => despachar({ t: "assumir_revisao", id }),
    /** Aprovar como o usuário atual (Para aprovar). */
    aprovarPost: (id: string, dataPublicacao?: string): R.Resultado => {
      const s = ler();
      const p = post(id);
      if (!p) return naoAchou;
      return se(
        R.podeDecidirPost(p, s.usuarioId, s.papel),
        () => despachar({ t: "aprovar_post", id, dataPublicacao, por: s.usuarioId }),
        dataPublicacao ? `Aprovado: publicar em ${R.ddmm(dataPublicacao)}.` : "Aprovado sem data de publicação.",
      );
    },
    reprovarPost: (id: string, motivo: string): R.Resultado => {
      const s = ler();
      const p = post(id);
      if (!p) return naoAchou;
      const rm = R.validarMotivo(motivo);
      if (!rm.ok) return se(rm, () => {});
      return se(
        R.podeDecidirPost(p, s.usuarioId, s.papel),
        () => despachar({ t: "reprovar_post", id, motivo: motivo.trim(), por: s.usuarioId, problemaId: novoId("pr") }),
        "Post reprovado. O autor vê o motivo no card e na Minha mesa.",
      );
    },
    /** Painel de demo: o aprovador decide por fora (ignora papel atual, nunca o autor). */
    simularDecisao: (id: string, decisao: "aprovar" | "reprovar", extra?: string): R.Resultado => {
      const p = post(id);
      if (!p) return naoAchou;
      if (p.estado !== "enviado") return se({ ok: false, motivo: "Só post aguardando aprovação pode ser decidido." }, () => {});
      const por = p.autorId === "u-marina" ? "u-paulo" : "u-marina";
      if (decisao === "aprovar") {
        return se({ ok: true }, () => despachar({ t: "aprovar_post", id, dataPublicacao: extra, por }), "Simulado: o aprovador aprovou.");
      }
      const motivo = extra?.trim() || "Simulação: o título da arte passa de duas linhas. Encurtar e reenviar.";
      return se({ ok: true }, () => despachar({ t: "reprovar_post", id, motivo, por, problemaId: novoId("pr") }), "Simulado: o aprovador reprovou.");
    },
    marcarPublicado: (id: string): R.Resultado => {
      const p = post(id);
      if (!p) return naoAchou;
      return se(R.podeMarcarPublicado(p), () => despachar({ t: "marcar_publicado", id }), "Marcado como publicado.");
    },
    associarPost: (postId: string, itemId: string): R.Resultado => {
      const p = post(postId);
      if (!p) return naoAchou;
      return se(R.podeAssociar(ler().dados, p, itemId), () => despachar({ t: "associar_post", postId, itemId }), "Post associado.");
    },
    desassociarPost: (postId: string): R.Resultado => {
      const p = post(postId);
      if (!p) return naoAchou;
      return se(R.podeDesassociar(p), () => despachar({ t: "desassociar_post", postId }), "Post desassociado.");
    },
    trocarArte: (postId: string, arteUrl: string): R.Resultado => {
      const s = ler();
      const p = post(postId);
      if (!p) return naoAchou;
      const volta = R.estadoAposTrocarArte(p) !== p.estado;
      return se(
        R.podeTrocarArte(p, s.arteTravadaAposPublicar),
        () => despachar({ t: "trocar_arte", postId, arteUrl }),
        volta ? "Versão do designer salva. O post voltou para a aprovação." : "Versão do designer salva.",
      );
    },
    apagarPost: (postId: string) => despachar({ t: "apagar_post", postId }),

    // Problemas
    marcarBloqueado: (alvo: Alvo, motivo: string): R.Resultado => {
      const rm = R.validarMotivo(motivo);
      if (!rm.ok) return se(rm, () => {});
      return se(
        R.podeMarcarBloqueado(ler().dados, alvo),
        () => despachar({ t: "marcar_bloqueado", alvo, motivo, problemaId: novoId("pr") }),
        "Marcado como bloqueado.",
      );
    },
    resolverProblema: (id: string): R.Resultado => {
      const p = ler().dados.problemas.find((x) => x.id === id);
      if (!p) return naoAchou;
      return se(R.podeResolverManual(p), () => despachar({ t: "resolver_problema", id }), "Problema resolvido.");
    },

    // Pedidos
    assumirPedido: (cardId: string): R.Resultado => {
      const c = card(cardId);
      if (!c) return naoAchou;
      return se(R.podeDecidirPedido(ler().dados, c, ler().usuarioId), () => despachar({ t: "assumir_pedido", cardId }));
    },
    aprovarPedido: (cardId: string, responsavelId: string, etiquetas: string[]): R.Resultado => {
      const c = card(cardId);
      if (!c) return naoAchou;
      if (!responsavelId) return se({ ok: false, motivo: "Escolha quem fica responsável pelo card." }, () => {});
      return se(
        R.podeDecidirPedido(ler().dados, c, ler().usuarioId),
        () => despachar({ t: "aprovar_pedido", cardId, responsavelId, etiquetas, decisaoId: novoId("d") }),
        "Pedido aprovado. O card foi para A fazer.",
      );
    },
    devolverPedido: (cardId: string, motivo: string): R.Resultado => {
      const c = card(cardId);
      if (!c) return naoAchou;
      const rm = R.validarMotivo(motivo);
      if (!rm.ok) return se(rm, () => {});
      return se(
        R.podeDecidirPedido(ler().dados, c, ler().usuarioId),
        () => despachar({ t: "devolver_pedido", cardId, motivo, decisaoId: novoId("d"), problemaId: novoId("pr") }),
        "Pedido devolvido. O card aparece em Problemas até o solicitante responder.",
      );
    },
    negarPedido: (cardId: string, motivo: string): R.Resultado => {
      const c = card(cardId);
      if (!c) return naoAchou;
      const rm = R.validarMotivo(motivo);
      if (!rm.ok) return se(rm, () => {});
      return se(
        R.podeDecidirPedido(ler().dados, c, ler().usuarioId),
        () => despachar({ t: "negar_pedido", cardId, motivo, decisaoId: novoId("d") }),
        "Pedido negado. Ele saiu do Quadro e está no histórico de decisões.",
      );
    },
    /** Painel de demo: o solicitante respondeu a devolução. */
    solicitanteReenviou: (cardId: string): R.Resultado => {
      const c = card(cardId);
      if (c?.pedido?.estado !== "devolvido") {
        return se({ ok: false, motivo: "Só pedido devolvido pode ser reenviado pelo solicitante." }, () => {});
      }
      return se({ ok: true }, () => despachar({ t: "solicitante_reenviou", cardId }), "Simulado: o solicitante reenviou. O pedido voltou para Recebidos.");
    },

    // Tendências
    descartarTendencia: (id: string, motivo: string): R.Resultado => {
      const t = ler().dados.tendencias.find((x) => x.id === id);
      if (!t) return naoAchou;
      const rp = R.podeDescartarTendencia(ler().dados, t);
      if (!rp.ok) return se(rp, () => {});
      const rm = R.validarMotivo(motivo);
      if (!rm.ok) return se(rm, () => {});
      return se(rm, () => despachar({ t: "descartar_tendencia", id, motivo }), "Tendência descartada. Ela fica no filtro Descartadas.");
    },
    reativarTendencia: (id: string) => despachar({ t: "reativar_tendencia", id }),

    // SWOT
    editarSwot: (id: string, texto: string): R.Resultado => {
      const item = ler().dados.swot.find((i) => i.id === id);
      if (!item) return naoAchou;
      const r = R.editarItemSwot(item, texto);
      return se(r, () => r.item && despachar({ t: "trocar_swot", item: r.item }));
    },
    reverterSwot: (id: string) => {
      const item = ler().dados.swot.find((i) => i.id === id);
      if (item) despachar({ t: "trocar_swot", item: { ...item, item: item.itemOriginal, editadoManualmente: false } });
    },
    /** Aplica a leitura simulada da IA (regras.ts → regenerarSwot). Devolve os ids novos. */
    regenerarSwot: (): string[] => {
      const r = R.regenerarSwot(ler().dados.swot, SWOT_REGENERADO, () => novoId("sw"));
      despachar({ t: "regenerar_swot", itens: r.itens });
      if (r.novos.length === 0) avisar("A IA releu tudo e não encontrou nada novo desde a última leitura.");
      else
        avisar(
          `A IA trouxe ${R.plural(r.novos.length, "ponto novo", "pontos novos")}.` +
            (r.mantidosEditados ? ` ${R.plural(r.mantidosEditados, "ponto editado à mão ficou", "pontos editados à mão ficaram")} como estava.` : ""),
        );
      return r.novos;
    },

    // Configurações e marca
    /** Configurações → Etiquetas. Devolve o id criado (ou null quando a regra barra). */
    criarEtiqueta: (nome: string, cor: string): string | null => {
      const r = R.validarNomeEtiqueta(nome, ler().dados.etiquetas);
      if (!r.ok) {
        se(r, () => {});
        return null;
      }
      const id = novoId("e");
      despachar({ t: "criar_etiqueta", etiqueta: { id, nome: nome.trim(), cor, arquivada: false } });
      avisar(`Etiqueta ${nome.trim()} criada. Ela já aparece no filtro do Quadro e na escolha de etiquetas dos cards.`);
      return id;
    },
    editarEtiqueta: (id: string, campos: { nome: string; cor: string }): R.Resultado =>
      se(
        R.validarNomeEtiqueta(campos.nome, ler().dados.etiquetas, id),
        () => despachar({ t: "atualizar_etiqueta", id, patch: { nome: campos.nome.trim(), cor: campos.cor } }),
        "Etiqueta atualizada. Os cards que já têm a etiqueta mostram a versão nova.",
      ),
    arquivarEtiqueta: (id: string): R.Resultado =>
      se(
        R.podeArquivarEtiqueta(id),
        () => despachar({ t: "atualizar_etiqueta", id, patch: { arquivada: true } }),
        "Etiqueta arquivada. Ela saiu do filtro do Quadro; os cards que já tinham continuam com ela.",
      ),
    reativarEtiqueta: (id: string) => {
      despachar({ t: "atualizar_etiqueta", id, patch: { arquivada: false } });
      avisar("Etiqueta reativada. Ela voltou para o filtro do Quadro.");
    },
    atualizarEtiqueta: (id: string, patch: Partial<Etiqueta>) => despachar({ t: "atualizar_etiqueta", id, patch }),
    atualizarMarca: (patch: Partial<Marca>) => despachar({ t: "atualizar_marca", patch }),
    atualizarPrompt: (id: string, texto: string) => despachar({ t: "atualizar_prompt", id, texto }),

    // Configurações → IA e prompts
    salvarPrompt: (id: string, texto: string): R.Resultado => {
      const p = ler().dados.prompts.find((x) => x.id === id);
      if (!p) return naoAchou;
      return se(R.validarPrompt(id, texto), () => despachar({ t: "atualizar_prompt", id, texto: texto.trim() }), `Prompt "${p.titulo}" atualizado.`);
    },
    salvarCamposAgente: (campos: CamposAgente): R.Resultado =>
      se(R.validarCamposAgente(campos), () => despachar({ t: "salvar_campos_agente", campos }), "Campos do agente atualizados."),

    // Configurações → Integrações
    salvarWebhook: (id: string, url: string): R.Resultado =>
      se(R.validarUrlWebhook(url), () => despachar({ t: "atualizar_webhook", id, url: url.trim() }), "URL do webhook atualizada."),

    // Configurações → Equipe
    convidarUsuario: (email: string, papel: Papel): R.Resultado => {
      const s = ler();
      return se(
        R.validarConvite(email, s.dados.usuarios),
        () => {
          const e = email.trim().toLowerCase();
          const nome = R.nomeDoEmail(e) || e;
          despachar({
            t: "convidar_usuario",
            usuario: {
              id: novoId("u"),
              nome,
              iniciais: R.iniciaisDe(nome),
              papel,
              cargo: "",
              email: e,
              ativo: false,
              criadoEm: agoraNo(s.hoje),
            },
          });
        },
        `Convite enviado para ${email.trim().toLowerCase()}.`,
      );
    },
    mudarPapel: (id: string, papel: Papel): R.Resultado =>
      se(
        R.podeMudarPapel(ler().dados.usuarios, id, papel, ler().usuarioId),
        () => despachar({ t: "atualizar_usuario", id, patch: { papel } }),
        `Papel alterado para ${R.ROTULO_PAPEL[papel]}.`,
      ),
    removerUsuario: (id: string): R.Resultado => {
      const nome = ler().dados.usuarios.find((u) => u.id === id)?.nome ?? "A pessoa";
      return se(
        R.podeRemoverUsuario(ler().dados.usuarios, id, ler().usuarioId),
        () => despachar({ t: "remover_usuario", id }),
        `${nome} saiu do time. O que estava aberto com ela ficou sem responsável.`,
      );
    },

    /** Instante ISO no "hoje" do protótipo. */
    agora,
  };
}

export type AcoesHub = ReturnType<typeof criarAcoes>;
