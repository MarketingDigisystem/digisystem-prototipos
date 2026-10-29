/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hooks/use-tasks.ts, src/hooks/use-posts.ts, src/lib/hub-meta.ts
 *   @ commit 4fcf254 / leitura 2026-10-07 (só como ponto de partida: as regras
 *   abaixo são as NOVAS, da proposta, e ainda não existem no Lovable).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * REGRAS PURAS do ciclo card/subtarefa/post/problema/tendência.
 * Sem React, sem estado: toda função recebe os dados e devolve uma resposta.
 * Servem de especificação legível para a implementação real (a automação no
 * banco, K13, proposta 4.5, deve ser escrita olhando para elas). Nunca copiar
 * este arquivo para o app.
 *
 * Índice (seção da proposta):
 *  - Datas e textos auxiliares
 *  - Itens do card e níveis ............................ 4.2
 *  - Conclusão de subtarefa e de card .................. 4.1, 4.2 item 5
 *  - Problemas: travado, card parou, alerta ............ 4.4 (revisão 3), K9
 *  - Coluna calculada do card .......................... 4.1, 4.4
 *  - Resumo e estado do post exibido ................... 4.2 item 1, 4.4
 *  - Bloqueios de arraste .............................. 4.1, K7
 *  - Associar / desassociar / enviar / aprovar ......... 4.3, 4.6, K4, K5, K6
 *  - Publicação e arte depois de publicar .............. K8, K11
 *  - Post apagado ...................................... K10
 *  - Pedidos externos .................................. 4.9, K1, K15
 *  - Estado da tendência ............................... 2.7
 *  - SWOT: editar, reverter, regenerar ................. 2.3
 *  - Estúdio: Sobre o post e Texto ..................... ESPEC-criar-post, D1, D2, D6
 *  - Estúdio: Arte (modelo, imagem, texto, ajustes) .... ESPEC-criar-post seção 2
 *  - Estúdio: Carrossel, finalizar, falha, Story, Baixar  ESPEC-criar-post seção 2
 *  - Estúdio: Enviar, conclusão e salvamento ........... ESPEC-criar-post, D3, D4, D5, D7
 *  - Minha mesa: o que é com cada pessoa ............... 2.6
 *  - Métricas do time (Resultados → Time) .............. 4.11, 2.7
 *  - Marca: quem edita, cor, logo P/M/G, hashtags ...... 2.3
 *  - Configurações: equipe, etiquetas, prompts, webhooks  7, 4.2 item 7
 */
import type {
  CamposAgente,
  Card,
  Cta,
  DadosHub,
  EstadoTendencia,
  Etiqueta,
  Papel,
  Post,
  PostEstado,
  Potencial,
  Problema,
  QuadranteSwot,
  Rede,
  Subtarefa,
  SwotItem,
  Tendencia,
  TipoProblema,
  Usuario,
} from "./tipos";

// ─── Resultado padrão das validações ──────────────────────────────────────

/** Toda regra que pode barrar uma ação devolve isto. `motivo` é texto pronto para a tela. */
export type Resultado = { ok: true } | { ok: false; motivo: string };

const OK: Resultado = { ok: true };
const nao = (motivo: string): Resultado => ({ ok: false, motivo });

// ─── Datas e textos auxiliares ────────────────────────────────────────────

/** YYYY-MM-DD local de um instante ISO (ou de um dia já no formato). */
export function diaDe(isoOuDia: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOuDia)) return isoOuDia;
  const d = new Date(isoOuDia);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Soma dias a um YYYY-MM-DD. */
export function somarDias(dia: string, n: number): string {
  const [a, m, d] = dia.split("-").map(Number);
  return diaDe(new Date(a, m - 1, d + n).toISOString());
}

/** "DD/MM" de um dia ou instante. */
export function ddmm(isoOuDia: string): string {
  const [, m, d] = diaDe(isoOuDia).split("-");
  return `${d}/${m}`;
}

/** Plural simples: plural(2, "post", "posts") → "2 posts". */
export function plural(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`;
}

/** Junta "a", "b" e "c" em português. */
function juntar(partes: string[]): string {
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`;
}

/**
 * Primeira letra minúscula, para encaixar o título do item numa frase.
 * Siglas ("IA") e primeira palavra com maiúscula no meio ("LinkedIn") ficam
 * como estão.
 */
function emFrase(titulo: string): string {
  if (/^\p{Lu}\p{Lu}/u.test(titulo) || /^\p{Lu}\p{Ll}*\p{Lu}/u.test(titulo.split(" ")[0])) return titulo;
  return titulo.charAt(0).toLowerCase() + titulo.slice(1);
}

// ─── Itens do card e níveis (proposta 4.2) ────────────────────────────────

/**
 * "Item" = o card ou qualquer subtarefa dele. Todo item pode ter UM post (4.2 item 4).
 * Nível 1 = card, 2 = subtarefa, 3 = sub-subtarefa. Não existe nível 4 (4.2 item 2).
 */
export type Item =
  | { tipo: "card"; id: string; card: Card; nivel: 1; titulo: string }
  | { tipo: "subtarefa"; id: string; card: Card; sub: Subtarefa; nivel: 2 | 3; titulo: string };

export const NIVEL_MAXIMO = 3;

export function cardPorId(dados: DadosHub, id: string): Card | undefined {
  return dados.cards.find((c) => c.id === id);
}

export function itemPorId(dados: DadosHub, id: string): Item | undefined {
  const card = cardPorId(dados, id);
  if (card) return { tipo: "card", id, card, nivel: 1, titulo: card.titulo };
  const sub = dados.subtarefas.find((s) => s.id === id);
  if (!sub) return undefined;
  const dono = cardPorId(dados, sub.cardId);
  if (!dono) return undefined;
  return { tipo: "subtarefa", id, card: dono, sub, nivel: sub.parentId ? 3 : 2, titulo: sub.titulo };
}

/** Todas as subtarefas do card (níveis 2 e 3), na ordem de exibição em árvore. */
export function subtarefasDoCard(dados: DadosHub, cardId: string): Subtarefa[] {
  const doCard = dados.subtarefas.filter((s) => s.cardId === cardId);
  const porOrdem = (a: Subtarefa, b: Subtarefa) => a.ordem - b.ordem;
  const raiz = doCard.filter((s) => !s.parentId).sort(porOrdem);
  return raiz.flatMap((s) => [s, ...doCard.filter((f) => f.parentId === s.id).sort(porOrdem)]);
}

/** Filhas diretas de um item (do card, quando paiId é o id do card). */
export function filhasDe(dados: DadosHub, cardId: string, paiId: string): Subtarefa[] {
  const ehCard = paiId === cardId;
  return dados.subtarefas
    .filter((s) => s.cardId === cardId && (ehCard ? !s.parentId : s.parentId === paiId))
    .sort((a, b) => a.ordem - b.ordem);
}

/** Ids do card e de todas as subtarefas dele. */
export function idsDoCard(dados: DadosHub, cardId: string): string[] {
  return [cardId, ...dados.subtarefas.filter((s) => s.cardId === cardId).map((s) => s.id)];
}

/** Ids do item e de todos os descendentes (para excluir em cascata). */
export function idsDescendentes(dados: DadosHub, itemId: string): string[] {
  const item = itemPorId(dados, itemId);
  if (!item) return [];
  if (item.tipo === "card") return idsDoCard(dados, item.id);
  const filhas = dados.subtarefas.filter((s) => s.parentId === item.id).map((s) => s.id);
  return [item.id, ...filhas];
}

/** Pode criar uma subtarefa dentro deste item? Até 3 níveis contando o card (4.2 item 2). */
export function podeCriarSubtarefa(dados: DadosHub, paiId: string): Resultado {
  const pai = itemPorId(dados, paiId);
  if (!pai) return nao("Item não encontrado.");
  if (pai.nivel >= NIVEL_MAXIMO) {
    return nao("O limite é de 3 níveis: card, subtarefa e sub-subtarefa. Crie esta como subtarefa do card.");
  }
  if (pai.card.pedido && ["recebido", "triagem", "negado"].includes(pai.card.pedido.estado)) {
    return nao("Decida o pedido em Tarefas → Pedidos antes de dividir o trabalho em subtarefas.");
  }
  return OK;
}

/** O post associado a um item (card ou subtarefa). 1 post = 1 item (K4). */
export function postDoItem(dados: DadosHub, itemId: string): Post | undefined {
  return dados.posts.find((p) => p.itemId === itemId);
}

/** Todos os posts associados ao card ou às subtarefas dele. */
export function postsDoCard(dados: DadosHub, cardId: string): Post[] {
  const ids = new Set(idsDoCard(dados, cardId));
  return dados.posts.filter((p) => p.itemId && ids.has(p.itemId));
}

/** Indicador automático de post no card (4.2 item 7): aparece sozinho quando há post. */
export function temPost(dados: DadosHub, cardId: string): boolean {
  return postsDoCard(dados, cardId).length > 0;
}

// ─── Conclusão (proposta 4.1 e 4.2 item 5) ────────────────────────────────

/**
 * Subtarefa concluída. Com post: conclui SOZINHA quando o post é publicado e não
 * dá para marcar à mão (4.2 item 5). Sem post: a pessoa marca.
 */
export function subtarefaConcluida(dados: DadosHub, sub: Subtarefa): boolean {
  const post = postDoItem(dados, sub.id);
  if (post) return post.estado === "publicado";
  return Boolean(sub.concluidaEm);
}

/** Dá para marcar/desmarcar a subtarefa à mão? */
export function podeConcluirManual(dados: DadosHub, sub: Subtarefa): Resultado {
  if (postDoItem(dados, sub.id)) {
    return nao("Subtarefa com post conclui sozinha quando o post é marcado como publicado.");
  }
  return OK;
}

/**
 * O que ainda falta no card. Cada entrada é um item pendente:
 *  - cada subtarefa não concluída;
 *  - o post do próprio card, se ainda não foi publicado;
 *  - o próprio card, quando ele não tem post nem subtarefa e ainda não foi
 *    arrastado para Concluído (é o único caso de conclusão manual, 4.1).
 */
export type Pendente = { itemId: string; titulo: string; comPost: boolean; tipo: "card" | "subtarefa" };

export function pendentesDoCard(dados: DadosHub, card: Card): Pendente[] {
  const subs = dados.subtarefas.filter((s) => s.cardId === card.id);
  const postCard = postDoItem(dados, card.id);
  const lista: Pendente[] = [];

  if (postCard && postCard.estado !== "publicado") {
    lista.push({ itemId: card.id, titulo: card.titulo, comPost: true, tipo: "card" });
  }
  for (const s of subtarefasDoCard(dados, card.id)) {
    if (!subtarefaConcluida(dados, s)) {
      lista.push({ itemId: s.id, titulo: s.titulo, comPost: Boolean(postDoItem(dados, s.id)), tipo: "subtarefa" });
    }
  }
  if (!postCard && subs.length === 0 && !card.concluidoManualEm) {
    lista.push({ itemId: card.id, titulo: card.titulo, comPost: false, tipo: "card" });
  }
  return lista;
}

/** Card sem post e sem subtarefa: o único que se conclui arrastando (4.1). */
export function cardSemConteudo(dados: DadosHub, card: Card): boolean {
  return !postDoItem(dados, card.id) && !dados.subtarefas.some((s) => s.cardId === card.id);
}

/** Tudo dentro do card terminou: subtarefas concluídas e posts publicados (4.1). */
export function cardConcluido(dados: DadosHub, card: Card): boolean {
  return pendentesDoCard(dados, card).length === 0;
}

/** "Falta publicar 1 post e concluir 2 subtarefas" (K7). Vazio quando nada falta. */
export function textoFalta(dados: DadosHub, card: Card): string {
  const pend = pendentesDoCard(dados, card);
  const posts = pend.filter((p) => p.comPost).length;
  const subs = pend.filter((p) => !p.comPost && p.tipo === "subtarefa").length;
  const partes: string[] = [];
  if (posts) partes.push(`publicar ${plural(posts, "post", "posts")}`);
  if (subs) partes.push(`concluir ${plural(subs, "subtarefa", "subtarefas")}`);
  return partes.length ? `Falta ${juntar(partes)}.` : "";
}

// ─── Problemas (proposta 4.4, revisão 3) ──────────────────────────────────

export const ROTULO_PROBLEMA: Record<TipoProblema, string> = {
  reprovado: "Reprovado",
  aguardando_solicitante: "Aguardando o solicitante",
  bloqueado: "Bloqueado",
};

export function problemasAbertosDoCard(dados: DadosHub, cardId: string): Problema[] {
  return dados.problemas.filter((p) => p.cardId === cardId && !p.resolvidoEm);
}

/** Problemas abertos ligados ao item: no próprio item ou no post dele. */
export function problemasDoItem(dados: DadosHub, itemId: string): Problema[] {
  const post = postDoItem(dados, itemId);
  return dados.problemas.filter(
    (p) =>
      !p.resolvidoEm &&
      ((p.alvo.tipo !== "post" && p.alvo.id === itemId) || (p.alvo.tipo === "post" && post && p.alvo.id === post.id)),
  );
}

/**
 * Um item pendente está TRAVADO quando há problema aberto:
 *  - no card inteiro (trava tudo);
 *  - na própria subtarefa ou na subtarefa-mãe (bloquear a mãe trava as filhas);
 *  - no post do próprio item (o reprovado trava só aquele item, não as filhas).
 */
export function itemTravado(dados: DadosHub, card: Card, itemId: string): boolean {
  const abertos = problemasAbertosDoCard(dados, card.id);
  if (abertos.length === 0) return false;
  if (abertos.some((p) => p.alvo.tipo === "card")) return true;

  const item = itemPorId(dados, itemId);
  const linhagem = item?.tipo === "subtarefa" && item.sub.parentId ? [itemId, item.sub.parentId] : [itemId];
  const post = postDoItem(dados, itemId);

  return abertos.some(
    (p) =>
      (p.alvo.tipo === "subtarefa" && linhagem.includes(p.alvo.id)) ||
      (p.alvo.tipo === "post" && post !== undefined && p.alvo.id === post.id),
  );
}

/**
 * "Este card parou por inteiro?" (4.4). Parou quando:
 *  - alguém marcou o CARD inteiro (bloqueado, ou o pedido foi devolvido), ou
 *  - há problema aberto e TODO item que ainda falta está travado
 *    (não sobra nada pendente que consiga andar).
 */
export function cardParou(dados: DadosHub, card: Card): boolean {
  const abertos = problemasAbertosDoCard(dados, card.id);
  if (abertos.length === 0) return false;
  if (abertos.some((p) => p.alvo.tipo === "card")) return true;
  const pend = pendentesDoCard(dados, card);
  return pend.length > 0 && pend.every((p) => itemTravado(dados, card, p.itemId));
}

/** Descrição curta de um problema para o alerta: "Reels bastidores reprovado". */
export function descreverProblema(dados: DadosHub, p: Problema): string {
  if (p.tipo === "aguardando_solicitante") return "aguardando o solicitante";
  let titulo = "";
  if (p.alvo.tipo === "post") {
    const post = dados.posts.find((x) => x.id === p.alvo.id);
    const item = post?.itemId ? itemPorId(dados, post.itemId) : undefined;
    titulo = item?.tipo === "subtarefa" ? item.titulo : "post";
  } else if (p.alvo.tipo === "subtarefa") {
    titulo = itemPorId(dados, p.alvo.id)?.titulo ?? "subtarefa";
  } else {
    titulo = "card inteiro";
  }
  return `${emFrase(titulo)} ${p.tipo === "reprovado" ? "reprovado" : "bloqueado"}`;
}

/**
 * Alerta da frente do card quando há problema mas o card NÃO parou (4.4):
 * "1 problema: reels bastidores reprovado". Quando o card parou, ele está na
 * coluna Problemas e o alerta continua explicando o porquê.
 */
export function alertaDoCard(dados: DadosHub, card: Card): { texto: string; problemas: Problema[] } | null {
  const abertos = problemasAbertosDoCard(dados, card.id);
  if (abertos.length === 0) return null;
  const detalhe = abertos.length === 1 ? descreverProblema(dados, abertos[0]) : juntar(abertos.map((p) => descreverProblema(dados, p)));
  return { texto: `${plural(abertos.length, "problema", "problemas")}: ${detalhe}`, problemas: abertos };
}

/**
 * Pode marcar este item como bloqueado? (manual, com motivo obrigatório)
 * K9: post aguardando aprovação não vira bloqueado; quem decide é quem aprova.
 */
export function podeMarcarBloqueado(dados: DadosHub, alvo: { tipo: "card" | "subtarefa"; id: string }): Resultado {
  const item = itemPorId(dados, alvo.id);
  if (!item) return nao("Item não encontrado.");
  const post = postDoItem(dados, alvo.id);
  if (post?.estado === "enviado") {
    return nao("Este post está aguardando aprovação. Quem decide o próximo passo é quem aprova, em Posts → Para aprovar.");
  }
  if (post?.estado === "publicado") return nao("O post deste item já foi publicado.");
  if (item.tipo === "subtarefa" && subtarefaConcluida(dados, item.sub)) {
    return nao("Subtarefa concluída não precisa ser bloqueada. Reabra antes, se for o caso.");
  }
  if (item.tipo === "card" && cardConcluido(dados, item.card)) return nao("O card já está concluído.");
  const jaBloqueado = dados.problemas.some(
    (p) => !p.resolvidoEm && p.tipo === "bloqueado" && p.alvo.tipo === alvo.tipo && p.alvo.id === alvo.id,
  );
  if (jaBloqueado) return nao("Este item já está marcado como bloqueado.");
  return OK;
}

/** Motivo obrigatório para bloquear, devolver, negar, reprovar e descartar. */
export function validarMotivo(motivo: string): Resultado {
  return motivo.trim().length >= 5 ? OK : nao("Escreva o motivo em uma frase curta. Ele aparece para quem precisa agir.");
}

/** Só o "Bloqueado" fecha à mão. Reprovado e Aguardando fecham sozinhos (tabela de 4.4). */
export function podeResolverManual(p: Problema): Resultado {
  if (p.resolvidoEm) return nao("Este problema já foi resolvido.");
  if (p.tipo === "reprovado") return nao("O reprovado fecha sozinho quando o post é reenviado para aprovação.");
  if (p.tipo === "aguardando_solicitante") return nao("Fecha sozinho quando o solicitante reenviar o pedido.");
  return OK;
}

// ─── Coluna calculada do card (proposta 4.1 e 4.4) ────────────────────────

export type Coluna = "recebidos" | "afazer" | "andamento" | "concluido" | "problemas";

export const COLUNAS: { id: Coluna; label: string }[] = [
  { id: "recebidos", label: "Recebidos" },
  { id: "afazer", label: "A fazer" },
  { id: "andamento", label: "Em andamento" },
  { id: "concluido", label: "Concluído" },
  { id: "problemas", label: "Problemas" },
];

/**
 * Onde o card aparece no Quadro. `null` = fora do Quadro (pedido negado, que
 * fica só no histórico de decisões da aba Pedidos).
 *
 * Ordem de decisão:
 *  1. negado → fora do Quadro;
 *  2. pedido recebido ou em triagem → Recebidos (só pedido externo entra aqui);
 *  3. card parou por inteiro → Problemas (calculado, ninguém arrasta);
 *  4. tudo dentro terminou → Concluído;
 *  5. tem post associado → Em andamento (automático, 4.3 item 1);
 *  6. senão → a coluna base que a pessoa escolheu (A fazer ou Em andamento).
 *
 * Como Problemas e Concluído são calculados por cima da coluna base, quando os
 * problemas se resolvem o card VOLTA SOZINHO para onde estava (4.4).
 *
 * INVARIANTE (design Algoritmo 1; requisitos 1.1–1.6, 4.6):
 *  - Pura e idempotente: NUNCA grava estado; a UI/HubStore só a lê.
 *  - A saída é SEMPRE uma das 5 colunas (`recebidos`/`afazer`/`andamento`/
 *    `concluido`/`problemas`) ou `null` (fora do Quadro) — nunca outro valor.
 *  - `card.colunaBase` só pode ser `afazer` ou `andamento` (Coluna_Base). As
 *    colunas calculadas (recebidos/concluido/problemas) jamais são gravadas: a
 *    rejeição de uma escrita com `coluna_base` inválido (requisito 1.4) é da
 *    camada HubStore (tarefa posterior), não desta função — aqui só garantimos
 *    que a derivação nunca devolve coluna fora do contrato.
 */
export function colunaDoCard(dados: DadosHub, card: Card): Coluna | null {
  const estadoPedido = card.pedido?.estado;
  if (estadoPedido === "negado") return null;
  if (estadoPedido === "recebido" || estadoPedido === "triagem") return "recebidos";
  if (cardParou(dados, card)) return "problemas";
  if (cardConcluido(dados, card)) return "concluido";
  if (temPost(dados, card.id)) return "andamento";
  return card.colunaBase;
}

/**
 * Distribui cada card na sua coluna DERIVADA por `colunaDoCard` (requisito 1.1).
 * Cards cuja derivação é `null` (pedido negado — fora do Quadro) são omitidos
 * (requisitos 1.2 e 1.6). Nenhum card aparece em mais de uma coluna.
 */
export function cardsPorColuna(dados: DadosHub): Record<Coluna, Card[]> {
  const mapa: Record<Coluna, Card[]> = { recebidos: [], afazer: [], andamento: [], concluido: [], problemas: [] };
  for (const c of dados.cards) {
    const col = colunaDoCard(dados, c);
    if (col) mapa[col].push(c);
  }
  return mapa;
}

/** Prazo vencido e card ainda aberto. */
export function cardAtrasado(dados: DadosHub, card: Card, hoje: string): boolean {
  const col = colunaDoCard(dados, card);
  return Boolean(card.prazo && card.prazo < hoje && col !== "concluido" && col !== null);
}

export function subtarefaAtrasada(dados: DadosHub, sub: Subtarefa, hoje: string): boolean {
  return Boolean(sub.prazo && sub.prazo < hoje && !subtarefaConcluida(dados, sub));
}

// ─── Resumo e estado do post exibido (4.2 item 1 e 4.4) ───────────────────

export type ResumoCard = {
  subtarefas: number;
  subtarefasConcluidas: number;
  posts: number;
  postsPublicados: number;
  /** "3 de 5 subtarefas · 1 de 3 posts publicados". Vazio quando não há nada dentro. */
  texto: string;
};

export function resumoCard(dados: DadosHub, card: Card): ResumoCard {
  const subs = dados.subtarefas.filter((s) => s.cardId === card.id);
  const posts = postsDoCard(dados, card.id);
  const r = {
    subtarefas: subs.length,
    subtarefasConcluidas: subs.filter((s) => subtarefaConcluida(dados, s)).length,
    posts: posts.length,
    postsPublicados: posts.filter((p) => p.estado === "publicado").length,
  };
  const partes: string[] = [];
  if (r.subtarefas) partes.push(`${r.subtarefasConcluidas} de ${plural(r.subtarefas, "subtarefa", "subtarefas")}`);
  if (r.posts) partes.push(`${r.postsPublicados} de ${r.posts} ${r.posts === 1 ? "post publicado" : "posts publicados"}`);
  return { ...r, texto: partes.join(" · ") };
}

export type ChaveEstadoPost =
  | "em_producao"
  | "enviado"
  | "reprovado"
  | "aprovado_data"
  | "aprovado_sem_data"
  | "publicar_hoje"
  | "atrasado"
  | "publicado";

/** Tom visual de cada estado (a tela traduz para cor). */
export type TomEstado = "neutro" | "progresso" | "alerta" | "atencao" | "sucesso";

export type EstadoPostExibido = { chave: ChaveEstadoPost; rotulo: string; tom: TomEstado };

/**
 * Estado do post como aparece no card, na subtarefa, na mesa e no calendário
 * (tabela de 4.4). "Publicar hoje" e "Publicação atrasada" são derivados da
 * data de publicação contra o "hoje" (K8): no dia, "Publicar hoje"; a partir do
 * dia seguinte, "Publicação atrasada".
 */
export function estadoPostExibido(post: Post, hoje: string): EstadoPostExibido {
  switch (post.estado) {
    case "rascunho":
      return { chave: "em_producao", rotulo: "Em produção", tom: "neutro" };
    case "enviado":
      return { chave: "enviado", rotulo: "Enviado para aprovação", tom: "progresso" };
    case "reprovado":
      return { chave: "reprovado", rotulo: "Reprovado", tom: "alerta" };
    case "publicado":
      return {
        chave: "publicado",
        rotulo: `Publicado em ${ddmm(post.publicadoEm ?? post.dataPublicacao ?? hoje)}`,
        tom: "sucesso",
      };
    case "aprovado": {
      const data = post.dataPublicacao;
      if (!data) return { chave: "aprovado_sem_data", rotulo: "Aprovado: sem data de publicação", tom: "progresso" };
      if (data === hoje) return { chave: "publicar_hoje", rotulo: "Publicar hoje", tom: "atencao" };
      if (data < hoje) return { chave: "atrasado", rotulo: "Publicação atrasada", tom: "alerta" };
      return { chave: "aprovado_data", rotulo: `Aprovado: publicar em ${ddmm(data)}`, tom: "sucesso" };
    }
  }
}

/** Rótulo do estado guardado (filtros de Meus posts). */
export const ROTULO_ESTADO_GUARDADO: Record<PostEstado, string> = {
  rascunho: "Rascunho",
  enviado: "Aguardando aprovação",
  reprovado: "Reprovado",
  aprovado: "Aprovado",
  publicado: "Publicado",
};

/**
 * Aviso do card que está em Em andamento sem nada dentro (4.4, primeira linha):
 * "Associe ou crie um post". K10: se o post foi apagado, diz isso.
 */
export function avisoSemPost(dados: DadosHub, card: Card): string | null {
  if (card.postApagado && !postDoItem(dados, card.id)) return "O post associado foi apagado";
  if (colunaDoCard(dados, card) !== "andamento") return null;
  if (cardSemConteudo(dados, card)) return "Associe ou crie um post";
  return null;
}

// ─── Bloqueios de arraste (4.1, K7) ───────────────────────────────────────

/**
 * Pode arrastar o card para `destino`? Mensagens prontas para a tela.
 *  - Recebidos não arrasta: a decisão mora em Pedidos.
 *  - Problemas é calculada: não entra nem sai arrastando.
 *  - Concluído: só card sem post e sem subtarefa; nos outros, diz o que falta (K7).
 *  - Card com post fica em Em andamento (não volta para A fazer).
 *  - Card que concluiu sozinho não reabre arrastando.
 */
export function podeMover(dados: DadosHub, card: Card, destino: Coluna): Resultado {
  const atual = colunaDoCard(dados, card);
  if (atual === null) return nao("Pedido negado não aparece no Quadro.");
  if (atual === destino) return OK;
  if (atual === "recebidos") {
    return nao("Pedido novo é decidido em Tarefas → Pedidos. Abra o card para assumir e decidir.");
  }
  if (atual === "problemas") {
    return nao("Problemas é calculada: o card sai sozinho quando os problemas dele forem resolvidos.");
  }
  if (destino === "recebidos") return nao("Recebidos é só para pedidos externos que ainda não foram decididos.");
  if (destino === "problemas") {
    return nao("Ninguém arrasta para Problemas. Abra o card e use \"Marcar como bloqueado\", com o motivo.");
  }
  if (destino === "concluido") {
    if (cardSemConteudo(dados, card)) return OK;
    return nao(textoFalta(dados, card) || "Ainda há trabalho pendente dentro do card.");
  }
  if (atual === "concluido") {
    if (cardSemConteudo(dados, card)) return OK;
    return nao("Este card concluiu sozinho porque tudo dentro dele terminou. Para reabrir, crie uma subtarefa nova.");
  }
  if (destino === "afazer" && temPost(dados, card.id)) {
    return nao("O card tem post associado, por isso fica em Em andamento. Desassocie o post para voltar a A fazer.");
  }
  return OK;
}

/** Efeito do arraste já validado: devolve o card atualizado. */
export function aplicarMovimento(card: Card, destino: Coluna, agora: string): Card {
  if (destino === "concluido") return { ...card, concluidoManualEm: agora };
  if (destino === "afazer" || destino === "andamento") {
    return { ...card, colunaBase: destino, concluidoManualEm: undefined };
  }
  return card;
}

// ─── Associar, desassociar, enviar e aprovar (4.3, 4.6) ───────────────────

/**
 * Pode associar o post a este item?
 *  - 1 post = 1 item, e cada item tem 1 post (K4).
 *  - Qualquer pessoa do time pode associar (K6): não há checagem de autor.
 *  - Publicado não muda de item.
 */
export function podeAssociar(dados: DadosHub, post: Post, itemId: string): Resultado {
  const item = itemPorId(dados, itemId);
  if (!item) return nao("Item não encontrado.");
  if (post.itemId === itemId) return nao("Este post já está neste item.");
  if (post.itemId) return nao("Este post já está em outro item. Cada post fica em um item só.");
  if (post.estado === "publicado") return nao("Post publicado não muda de item.");
  if (postDoItem(dados, itemId)) {
    return nao("Este item já tem um post. Para outro post, crie uma subtarefa.");
  }
  const estadoPedido = item.card.pedido?.estado;
  if (estadoPedido === "recebido" || estadoPedido === "triagem" || estadoPedido === "negado") {
    return nao("Decida o pedido em Tarefas → Pedidos antes de associar posts.");
  }
  if (item.tipo === "subtarefa" && item.sub.concluidaEm) {
    return nao("Reabra a subtarefa antes de associar um post.");
  }
  return OK;
}

/** Desassociar só em rascunho ou reprovado (K5). Depois de enviado, fica travado. */
export function podeDesassociar(post: Post): Resultado {
  if (!post.itemId) return nao("Este post não está em nenhum card.");
  if (post.estado === "rascunho" || post.estado === "reprovado") return OK;
  return nao("Só dá para desassociar post em rascunho ou reprovado. Depois de enviado para aprovação, a associação fica travada.");
}

/**
 * Posts que aparecem em "Associar post salvo" (4.3 item 3): primeiro os meus,
 * depois os do time que ainda não estão em nenhum card. Publicados ficam de fora.
 */
export function postsParaAssociar(dados: DadosHub, usuarioId: string): { meus: Post[]; time: Post[] } {
  const livres = dados.posts
    .filter((p) => !p.itemId && p.estado !== "publicado")
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  return { meus: livres.filter((p) => p.autorId === usuarioId), time: livres.filter((p) => p.autorId !== usuarioId) };
}

/** Enviar (rascunho) ou reenviar (reprovado). Reenvio sempre volta para a aprovação (4.3 item 5). */
export function podeEnviar(post: Post): Resultado {
  if (post.estado === "rascunho" || post.estado === "reprovado") return OK;
  if (post.estado === "enviado") return nao("Este post já está aguardando aprovação.");
  return nao("Este post já passou pela aprovação.");
}

/**
 * Enviar sem card → o Hub pergunta "Associar a um card existente ou criar um
 * novo?", com "Criar um card novo" pré-selecionado (4.6, caminho 3).
 */
export function precisaEscolherCard(post: Post): boolean {
  return !post.itemId;
}

/**
 * Quem decide o post (Para aprovar, proposta 5): Aprovador ou Admin, e nunca o
 * autor do próprio post.
 */
export function podeDecidirPost(post: Post, usuarioId: string, papel: Papel): Resultado {
  if (papel === "marketing") return nao("Só quem aprova decide posts.");
  if (post.autorId === usuarioId) return nao("Você é o autor deste post. Outra pessoa decide.");
  if (post.estado !== "enviado") return nao("Este post não está aguardando aprovação.");
  return OK;
}

// ─── Publicação e arte depois de publicar (K8, K11) ───────────────────────

/** "Marcar como publicado" fica no card e no Calendário (K8). Só para aprovado. */
export function podeMarcarPublicado(post: Post): Resultado {
  if (post.estado === "aprovado") return OK;
  if (post.estado === "publicado") return nao("Este post já foi marcado como publicado.");
  return nao("Só post aprovado pode ser marcado como publicado.");
}

/**
 * Versão do designer (K11, ainda em decisão; o painel de demo alterna).
 * Com a trava ligada, depois de publicado a arte não muda.
 */
export function podeTrocarArte(post: Post, arteTravadaAposPublicar: boolean): Resultado {
  if (post.estado === "publicado" && arteTravadaAposPublicar) {
    return nao("Depois de publicado, a arte fica travada.");
  }
  return OK;
}

/**
 * Estado depois de subir a versão do designer: post aprovado (ou publicado,
 * com a trava desligada) volta para a aprovação, e o card mostra
 * "Enviado para aprovação" (regra que já existe hoje em useAjustarArte).
 */
export function estadoAposTrocarArte(post: Post): PostEstado {
  return post.estado === "aprovado" || post.estado === "publicado" ? "enviado" : post.estado;
}

// ─── Post apagado (K10) ───────────────────────────────────────────────────

/** Item com post não é apagado sem antes desassociar ou apagar o post (4.3 item 6). */
export function podeExcluirItem(dados: DadosHub, itemId: string): Resultado {
  const ids = idsDescendentes(dados, itemId);
  if (ids.some((id) => postDoItem(dados, id))) {
    return nao("Desassocie ou apague o post antes de excluir. Isso vale também para as sub-subtarefas.");
  }
  return OK;
}

// ─── Pedidos externos (4.9, K1, K15) ──────────────────────────────────────

/** Trava de autoria: quem abriu o pedido não decide o próprio pedido. */
export function podeDecidirPedido(dados: DadosHub, card: Card, usuarioId: string): Resultado {
  if (!card.pedido) return nao("Este card não é um pedido externo.");
  const sol = dados.solicitantes.find((s) => s.id === card.pedido?.solicitanteId);
  if (sol?.usuarioId === usuarioId) return nao("Você criou este pedido. Outra pessoa do time decide.");
  if (card.pedido.estado !== "recebido" && card.pedido.estado !== "triagem") {
    return nao("Este pedido já foi decidido.");
  }
  return OK;
}

/** K1: ao aprovar, vai para A fazer. 4.9: pedido de post já chega com a etiqueta "Post". */
export function etiquetasAoAprovar(card: Card, escolhidas: string[], idEtiquetaPost = "e-post"): string[] {
  const base = card.pedido?.categoria === "post" ? [idEtiquetaPost, ...escolhidas] : escolhidas;
  return [...new Set(base)];
}

/** K15: como o solicitante vê o pedido em "Meus pedidos". */
export function estadoParaSolicitante(dados: DadosHub, card: Card): string {
  const estado = card.pedido?.estado;
  if (estado === "recebido") return "Recebido";
  if (estado === "triagem") return "Em análise";
  if (estado === "negado") return "Negado";
  if (estado === "devolvido") return "Aguardando você";
  if (colunaDoCard(dados, card) === "concluido") {
    const publicados = postsDoCard(dados, card.id).filter((p) => p.estado === "publicado").length;
    return publicados ? `Concluído · ${plural(publicados, "post publicado", "posts publicados")}` : "Concluído";
  }
  return "Em produção";
}

// ─── Estado da tendência (2.7) ────────────────────────────────────────────

export type SituacaoTendencia = {
  estado: EstadoTendencia;
  cards: Card[];
  posts: Post[];
  postsPublicados: number;
  /** "Aproveitada · 2 posts publicados", "Em produção", "Nova", "Descartada". */
  rotulo: string;
};

/**
 * Estado derivado do que o time fez com a tendência (só o descarte é gravado):
 *  - Descartada: tem motivo de descarte;
 *  - Aproveitada: já tem post publicado e nada ligado a ela continua aberto
 *    (assim, no roteiro R1, ela só vira "Aproveitada · 2 posts publicados"
 *    quando o card inteiro termina);
 *  - Em produção: tem post ou card ligado ainda em andamento;
 *  - Nova: nada ligado.
 * Ligados = cards com trendId + posts com trendId + posts dentro desses cards.
 */
export function situacaoTendencia(dados: DadosHub, t: Tendencia): SituacaoTendencia {
  const cards = dados.cards.filter((c) => c.trendId === t.id && c.pedido?.estado !== "negado");
  const idsCards = new Set(cards.flatMap((c) => idsDoCard(dados, c.id)));
  const posts = dados.posts.filter((p) => p.trendId === t.id || (p.itemId !== undefined && idsCards.has(p.itemId)));
  const postsPublicados = posts.filter((p) => p.estado === "publicado").length;

  if (t.descarte) return { estado: "descartada", cards, posts, postsPublicados, rotulo: "Descartada" };

  const algoAberto =
    cards.some((c) => colunaDoCard(dados, c) !== "concluido") || posts.some((p) => p.estado !== "publicado");

  if (postsPublicados > 0 && !algoAberto) {
    return {
      estado: "aproveitada",
      cards,
      posts,
      postsPublicados,
      rotulo: `Aproveitada · ${plural(postsPublicados, "post publicado", "posts publicados")}`,
    };
  }
  if (cards.length || posts.length) return { estado: "em_producao", cards, posts, postsPublicados, rotulo: "Em produção" };
  return { estado: "nova", cards, posts, postsPublicados, rotulo: "Nova" };
}

/**
 * Descartar (2.7, tabela de ações): a tendência some da lista principal e fica
 * no filtro "Descartadas", com o motivo. Só vale para a tendência que ainda não
 * tem nada ligado: descartar uma que já virou card ou post esconderia trabalho
 * em andamento (decisão de interpretação do protótipo).
 */
export function podeDescartarTendencia(dados: DadosHub, t: Tendencia): Resultado {
  const s = situacaoTendencia(dados, t);
  if (s.estado === "descartada") return nao("Esta tendência já foi descartada.");
  if (s.estado !== "nova") {
    return nao("O time já fez algo com esta tendência. Descartar esconderia um card ou post que está andando.");
  }
  return OK;
}

// ─── SWOT (Tendências → SWOT, proposta 2.3) ───────────────────────────────

/** Ordem fixa dos quadrantes na tela e nos relatórios. */
export const QUADRANTES_SWOT: QuadranteSwot[] = ["forcas", "fraquezas", "oportunidades", "ameacas"];

/** Itens de um quadrante na ordem gravada (o real ordena por quadrante e `ordem`). */
export function itensDoQuadrante(itens: SwotItem[], q: QuadranteSwot): SwotItem[] {
  return itens.filter((i) => i.quadrante === q).sort((a, b) => a.ordem - b.ordem);
}

/**
 * Edição manual de um ponto: texto obrigatório. O item fica "Editado" enquanto
 * difere do texto que a IA escreveu (`itemOriginal`); voltar ao mesmo texto
 * tira a marca, como o reverter do real.
 */
export function editarItemSwot(item: SwotItem, texto: string): Resultado & { item?: SwotItem } {
  const t = texto.trim().replace(/\s+/g, " ");
  if (t.length < 5) return nao("Escreva o ponto em uma frase. Um ponto vazio não entra na análise.");
  return { ok: true, item: { ...item, item: t, editadoManualmente: t !== item.itemOriginal } };
}

export type LeituraSwot = { quadrante: QuadranteSwot; item: string; substitui?: string };

/**
 * "Regenerar com a IA" (simulado). Regras do protótipo:
 *  - o que alguém editou à mão nunca é trocado pela IA (o time decidiu aquele texto);
 *  - um ponto que a leitura nova deixa desatualizado (`substitui`) é trocado no
 *    mesmo lugar, se ninguém editou; se foi editado, o novo entra no fim do quadrante;
 *  - ponto com o mesmo texto de um que já existe não se repete (regenerar duas
 *    vezes não duplica);
 *  - o ponto novo nasce com `itemOriginal` igual ao texto (é a nova base da IA).
 * Devolve a lista nova e os ids que mudaram, para a tela destacar o que é novo.
 */
export function regenerarSwot(
  itens: SwotItem[],
  leitura: LeituraSwot[],
  novoId: () => string,
): { itens: SwotItem[]; novos: string[]; mantidosEditados: number } {
  let lista = [...itens];
  const novos: string[] = [];
  const normal = (s: string) => s.trim().toLocaleLowerCase("pt-BR");

  for (const l of leitura) {
    if (lista.some((i) => normal(i.item) === normal(l.item) || normal(i.itemOriginal) === normal(l.item))) continue;
    const alvo = l.substitui ? lista.find((i) => i.id === l.substitui) : undefined;
    if (alvo && !alvo.editadoManualmente) {
      const id = novoId();
      lista = lista.map((i) => (i.id === alvo.id ? { ...i, id, item: l.item, itemOriginal: l.item, editadoManualmente: false } : i));
      novos.push(id);
      continue;
    }
    const ordem = Math.max(-1, ...lista.filter((i) => i.quadrante === l.quadrante).map((i) => i.ordem)) + 1;
    const id = novoId();
    lista = [...lista, { id, quadrante: l.quadrante, item: l.item, itemOriginal: l.item, ordem, editadoManualmente: false }];
    novos.push(id);
  }
  return { itens: lista, novos, mantidosEditados: itens.filter((i) => i.editadoManualmente).length };
}

// ─── Padrões de conteúdo do Estúdio (Skill Copywriter, steering product) ──

/** Limites da marca para o texto da arte e as hashtags. */
export const LIMITES_CONTEUDO = { palavrasTitulo: 8, palavrasSubtitulo: 12, hashtags: 8 } as const;

export function contarPalavras(texto: string): number {
  return texto.trim() ? texto.trim().split(/\s+/).length : 0;
}

/**
 * Hashtag no padrão da marca: sem espaços e com capitalização só na primeira
 * letra (`#Governançadedados`). Corrige o `toLowerCase` do Estúdio real e a
 * sugestão `#TI`/`#GestãodeTI` do parecer (achados da validação 2026-10-06).
 */
export function formatarHashtag(bruta: string): string {
  const limpa = bruta.replace(/^#+/, "").replace(/[^\p{L}\p{N}]/gu, "");
  if (!limpa) return "";
  return `#${limpa.charAt(0).toLocaleUpperCase("pt-BR")}${limpa.slice(1).toLocaleLowerCase("pt-BR")}`;
}

/** Junta oficiais e contextuais sem repetir, no máximo 8 (oficiais primeiro). */
export function montarHashtags(oficiais: string[], contextuais: string[]): string[] {
  const todas = [...oficiais, ...contextuais].map(formatarHashtag).filter(Boolean);
  return [...new Set(todas)].slice(0, LIMITES_CONTEUDO.hashtags);
}

/**
 * Data sugerida inicial do envio (proposta 5): a que o post já tinha, se ainda
 * não passou; senão o prazo do item; senão daqui a 2 dias.
 */
export function dataSugeridaInicial(hoje: string, sugerida?: string, prazoItem?: string): string {
  if (sugerida && sugerida >= hoje) return sugerida;
  if (prazoItem && prazoItem >= hoje) return prazoItem;
  return somarDias(hoje, 2);
}

// ─── Estúdio: Sobre o post e Texto (ESPEC-criar-post, D1, D2, D6) ─────────
//
// Fonte: INVENTARIO-estudio.md, linhas 1 a 33 da matriz, com as decisões
// D1 a D7 da ESPEC (2026-10-08). Mantém as regras do real que importam:
// o post nasce como rascunho sozinho quando o texto é aprovado (linha 31) e
// a arte só libera depois disso (sem post não há arte).

/** D1: as redes do post são escolhidas em "Sobre o post". Só as 3 do real, sem YouTube. */
export const REDES_ESTUDIO: Rede[] = ["instagram", "linkedin", "facebook"];

/** Sem nenhuma escolha, o real publica só no Instagram (linha 18). O seletor nasce assim. */
export const REDES_PADRAO_ESTUDIO: Rede[] = ["instagram"];

/** "Escrever com a IA" exige o tema (linha 19) e, pela D1, pelo menos uma rede. */
export function podeEscreverComIa(tema: string, redes: Rede[]): Resultado {
  if (!tema.trim()) return nao("Escreva o tema do post para a IA escrever.");
  if (redes.length === 0) return nao("Escolha onde o post vai ser publicado.");
  return OK;
}

/** CTAs que valem para o post: só das redes escolhidas e com texto (D1 e D2). */
export function ctasValidos(ctas: Cta[], redes: Rede[]): Cta[] {
  return ctas
    .map((c) => ({ texto: c.texto.trim(), plataformas: c.plataformas.filter((r) => redes.includes(r)) }))
    .filter((c) => c.texto && c.plataformas.length > 0);
}

/** D2: o CTA é opcional. Só pede aprovação quando existe alguma chamada com texto (linha 25). */
export function ctaPrecisaAprovar(ctas: Cta[], redes: Rede[]): boolean {
  return ctasValidos(ctas, redes).length > 0;
}

export type AprovacoesTexto = { legenda: boolean; hashtags: boolean; cta: boolean };

/**
 * O que ainda falta aprovar no Texto, já em frase ("a legenda", "as hashtags",
 * "a chamada"). Vazio = texto aprovado. Regra do real: legenda e hashtags, e o
 * CTA só se houver chamada com texto.
 */
export function faltaAprovarTexto(aprovados: AprovacoesTexto, ctas: Cta[], redes: Rede[]): string[] {
  const falta: string[] = [];
  if (!aprovados.legenda) falta.push("a legenda");
  if (!aprovados.hashtags) falta.push("as hashtags");
  if (ctaPrecisaAprovar(ctas, redes) && !aprovados.cta) falta.push("a chamada");
  return falta;
}

/** Linha 31: com o texto aprovado, o post nasce como rascunho sem ninguém clicar em salvar. */
export function textoAprovado(aprovados: AprovacoesTexto, ctas: Cta[], redes: Rede[]): boolean {
  return faltaAprovarTexto(aprovados, ctas, redes).length === 0;
}

/** "Falta aprovar a legenda e as hashtags." */
export function fraseFaltaAprovar(falta: string[]): string {
  return falta.length ? `Falta aprovar ${juntar(falta)}.` : "Texto aprovado.";
}

const PALAVRAS_FRACAS = new Set([
  "para", "como", "com", "sem", "que", "uma", "das", "dos", "nas", "nos", "pela", "pelo", "sobre", "entre", "mais", "menos",
  "seu", "sua", "seus", "suas", "este", "esta", "isso", "isto", "quando", "onde", "porque", "cada", "muito", "ainda",
]);

/**
 * Linha 9: vindo de tendência, as hashtags já chegam preenchidas, sem IA:
 * a tag da tendência e até 5 palavras do tema com mais de 3 letras.
 * O formato é o da marca (`formatarHashtag`), não o minúsculo do real.
 */
export function hashtagsDaTendencia(tag: string, tema: string): string[] {
  const palavras = tema
    .split(/[^\p{L}\p{N}]+/u)
    .filter((p) => p.length > 3 && !PALAVRAS_FRACAS.has(p.toLocaleLowerCase("pt-BR")))
    .slice(0, 5);
  return [...new Set([tag, ...palavras].map(formatarHashtag).filter(Boolean))];
}

/** "Já tenho um texto": hashtags separadas por espaço ou vírgula (linha 15). */
export function lerHashtagsManuais(texto: string): string[] {
  return [...new Set(texto.split(/[\s,]+/).map(formatarHashtag).filter(Boolean))];
}

/** D6: o limite de 8 hashtags é só um guia. Nunca barra. */
export function guiaHashtags(n: number): { texto: string; acima: boolean } {
  const acima = n > LIMITES_CONTEUDO.hashtags;
  return {
    texto: acima
      ? `${n} hashtags. O guia da marca é até ${LIMITES_CONTEUDO.hashtags}.`
      : `${n} de até ${LIMITES_CONTEUDO.hashtags}, pelo guia da marca.`,
    acima,
  };
}

/** "Salvo agora", "Salvo há 3 min", "Salvo há 1 h" (salvamento automático do post). */
export function salvoHa(desdeMs: number, agoraMs: number): string {
  const s = Math.max(0, Math.round((agoraMs - desdeMs) / 1000));
  if (s < 45) return "Salvo agora";
  const min = Math.round(s / 60);
  if (min < 60) return `Salvo há ${min} min`;
  return `Salvo há ${Math.round(min / 60)} h`;
}

// ─── Estúdio: Arte (ESPEC-criar-post seção 2 "Arte", item 5.5b) ───────────
//
// Fonte: INVENTARIO-estudio.md, linhas 34 a 57 da matriz, e os builders reais
// src/lib/compose/template-a.ts, template-b.ts, template-c.ts e layers.ts
// (commit 4fcf254). Os números (tamanhos, posições, passos) são os do real.
// Bugs do real que NÃO entram (ESPEC seção 5): fonte do subtítulo sem efeito
// em Estático/Blog (aqui há uma fonte só para os dois, que é o que o real
// desenha) e kicker do agente que não chega à arte em Estático/Blog (aqui o
// agente só escreve título e subtítulo nesses modelos).

export type ModeloArte = Post["template"];

/** Tamanho padrão de título e subtítulo de cada modelo, em px no canvas 1080×1350 (linha 56). */
export const TAMANHOS_PADRAO_ARTE: Record<ModeloArte, { titulo: number; subtitulo: number }> = {
  A: { titulo: 75, subtitulo: 45 },
  B: { titulo: 52, subtitulo: 35 },
  C: { titulo: 62, subtitulo: 26 },
};

/** Stepper de tamanho: ±2 px, entre 20 e 120 (linha 56). */
export const LIMITES_FONTE_ARTE = { min: 20, max: 120, passo: 2 } as const;

/** Aplica o passo do stepper partindo do valor atual ou do padrão do modelo. */
export function passoTamanhoFonte(atual: number | undefined, padrao: number, sentido: 1 | -1): number {
  const base = atual ?? padrao;
  return Math.min(LIMITES_FONTE_ARTE.max, Math.max(LIMITES_FONTE_ARTE.min, base + sentido * LIMITES_FONTE_ARTE.passo));
}

/** Posição do texto no Básico (só Estático): fração da altura (linha 52). Sem escolha, 62%. */
export const POSICAO_TEXTO_Y = { topo: 0.3, centro: 0.5, rodape: 0.72 } as const;
export type PosicaoTexto = keyof typeof POSICAO_TEXTO_Y;
export const POSICAO_TEXTO_Y_PADRAO = 0.62;

/** Porcentagem digitada no Avançado (vazio = automático). */
export function lerPorcentagem(v: string): number | undefined {
  const n = Number(v.replace(",", "."));
  return v.trim() !== "" && Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : undefined;
}

/** D-pad do logo: passo de 3% (Shift = 1%), sempre dentro do canvas (linha 49). */
export const PASSO_DPAD_LOGO = { normal: 3, fino: 1 } as const;

export function moverLogo(pos: { xPct: number; yPct: number }, dx: number, dy: number, fino: boolean): { xPct: number; yPct: number } {
  const passo = fino ? PASSO_DPAD_LOGO.fino : PASSO_DPAD_LOGO.normal;
  const lim = (v: number) => Math.min(100, Math.max(0, Math.round(v)));
  return { xPct: lim(pos.xPct + dx * passo), yPct: lim(pos.yPct + dy * passo) };
}

/** P/M/G do logo vêm de Marca → Logos e fundos (linha 50); o mesmo número vale para largura e altura. */
export function tamanhoLogoPreset(tamanhos: { P: number; M: number; G: number }, preset: "P" | "M" | "G"): number {
  return tamanhos[preset];
}

/** Degradê: a intensidade 0-100 da tela vira opacidade 0,15 a 0,6 no SVG (linha 45). */
export function opacidadeDegrade(intensidadePct: number): number {
  const p = Math.min(100, Math.max(0, intensidadePct));
  return Math.round((0.15 + (p / 100) * 0.45) * 100) / 100;
}

/**
 * Título que vai na arte (linha 54): o digitado; se vazio, o sugerido com o
 * texto; nunca a legenda.
 */
export function tituloDaArte(digitado: string, sugerido: string): string {
  return digitado.trim() ? digitado : sugerido.trim();
}

/** Subtítulo da arte: no Estilo Blog vazio vira "Descubra no blog", como no builder real. */
export function subtituloDaArte(modelo: ModeloArte, digitado: string): string {
  if (digitado.trim()) return digitado;
  return modelo === "B" ? "Descubra no blog" : "";
}

/**
 * Finalizar arte (linha 65): precisa do post salvo, da imagem e, no Estático e
 * no Estilo Blog, do título (digitado ou sugerido). Nada pode estar gerando.
 */
export function podeFinalizarArte(a: {
  postSalvo: boolean;
  modelo: ModeloArte;
  temImagem: boolean;
  titulo: string;
  ocupado: boolean;
}): Resultado {
  if (!a.postSalvo) return nao("A arte libera quando o texto estiver aprovado.");
  if (a.ocupado) return nao("Espere terminar o que está gerando.");
  if (!a.temImagem) return nao("Escolha a imagem da arte antes de finalizar.");
  if (a.modelo !== "C" && !a.titulo.trim()) return nao("Escreva o título da arte para finalizar.");
  return OK;
}

/** Acervo (linha 38): 9 por vez, "Buscar mais" de 9 em 9 até 30. */
export const ACERVO = { porVez: 9, maximo: 30 } as const;

export function proximoLimiteAcervo(limite: number): number {
  return Math.min(limite + ACERVO.porVez, ACERVO.maximo);
}

/** "Buscar mais" só aparece quando a página veio cheia e ainda não chegou a 30. */
export function temMaisNoAcervo(qtdResultados: number, limite: number): boolean {
  return qtdResultados >= limite && limite < ACERVO.maximo;
}

/** "Gerar opções": quantas imagens a IA devolve por vez para escolher (ESPEC: "Gerar opções → escolher"). */
export const OPCOES_POR_GERACAO = 3;

/** Prompt da imagem é obrigatório para gerar (linha 35). */
export function podeGerarImagem(prompt: string): Resultado {
  return prompt.trim() ? OK : nao("Escreva o prompt da imagem ou use \"Descrever com a IA\".");
}

/**
 * "Escrever os textos da arte" (linha 57) respeita "O que o agente escreve"
 * (Configurações → IA e prompts). No Estático e no Estilo Blog só título e
 * subtítulo chegam à arte; o kicker fica para o carrossel.
 */
export function camposDoAgenteNaArte(
  modelo: ModeloArte,
  campos: CamposAgente,
): { titulo: boolean; subtitulo: boolean; kicker: boolean; motivo?: string } {
  const r = { titulo: campos.titulo, subtitulo: campos.subtitulo, kicker: modelo === "C" && campos.kicker };
  if (!r.titulo && !r.subtitulo && !r.kicker) {
    return { ...r, motivo: "Ligue ao menos o título ou o subtítulo em Configurações → IA e prompts → O que o agente escreve." };
  }
  return r;
}

// ─── Estúdio: Carrossel, finalizar, falha, Story e Baixar (item 5.5c) ─────
//
// Fonte: INVENTARIO-estudio.md, linhas 58 a 73 da matriz; src/lib/compose/template-c.ts,
// src/components/estudio/StoryPreviewPanel.tsx e ArteStep.tsx (commit 4fcf254).
// Bugs do real que NÃO entram (ESPEC seção 5): o slide ganha cor de fundo; o
// padrão do kicker aparece como 30px (o real mostra 16px e desenha 30px); a
// cor padrão do botão da chamada final mostrada é a que o compositor desenha
// (laranja com texto azul); slide sem título não some calado, a tela avisa.

/** Tamanhos padrão de cada prancheta do carrossel, em px no canvas 1080×1350 (linhas 60 a 62). */
export const TAMANHOS_CARROSSEL = {
  capa: { titulo: 62, subtitulo: 26 },
  slide: { titulo: 46, subtitulo: 24 },
  cta: { titulo: 34, subtitulo: 34 },
} as const;

/** Tamanho padrão da etiqueta acima do título (kicker). É o que o template-c desenha. */
export const TAMANHO_KICKER_PADRAO = 30;

export type TipoPrancheta = "capa" | "slide" | "cta";

/** Posição do bloco de texto no Básico das pranchetas, em % da altura (`BLOCO_Y_PRESETS` do real). */
export const POSICAO_BLOCO_CARROSSEL = { topo: 25, centro: 44, rodape: 65 } as const;
/** Sem escolha, cada prancheta usa a posição do template-c. */
export const POSICAO_BLOCO_PADRAO: Record<TipoPrancheta, number> = { capa: 63, slide: 44, cta: 42 };

/** Slide novo nasce na cor principal da marca (o real fixa #36499b, que é a principal). */
export function corSlideNovo(cores: { hex: string }[]): string {
  return cores[0]?.hex ?? "#36499b";
}

/** Fundo claro (luminância acima de 0,5, como `fundoClaro` do template-c): o texto vai na cor principal. */
export function fundoClaroArte(hex: string): boolean {
  return luminancia(hex) > 0.5;
}

/**
 * Cor do anel decorativo do slide (`anelSlideCor` do real): no fundo principal,
 * anel na cor de destaque; em fundo claro, anel na principal; nos demais, branco.
 */
export function corAnelSlide(fundo: string, cores: { hex: string }[]): string {
  const principal = (cores[0]?.hex ?? "#36499b").toLowerCase();
  const destaque = cores[1]?.hex ?? principal;
  const f = fundo.toLowerCase();
  if (f === principal) return destaque;
  return fundoClaroArte(fundo) ? principal : "#ffffff";
}

/**
 * Cor do trecho marcado com **palavra** (linha 63): a cor de destaque da marca.
 * Se o fundo do slide já é dessa cor, o destaque vai na principal para não sumir.
 */
export function corDestaqueSobre(fundo: string, cores: { hex: string }[]): string {
  const destaque = cores[1]?.hex ?? "#ff6d2d";
  return fundo.toLowerCase() === destaque.toLowerCase() ? cores[0]?.hex ?? "#36499b" : destaque;
}

/** Texto sem as marcas de destaque (para contar letras e palavras). */
export function semMarcasDestaque(texto: string): string {
  return texto.replace(/\*\*/g, "");
}

/** Quebra "texto **destaque** texto" em trechos, como o `comDestaque` do real lê. */
export function trechosComDestaque(texto: string): { texto: string; destaque: boolean }[] {
  return texto
    .split("**")
    .map((t, i) => ({ texto: t, destaque: i % 2 === 1 }))
    .filter((t) => t.texto !== "");
}

/** Slide de cor e chamada final só entram na arte com título (template-c descarta os vazios). */
export function pranchetaEntraNaArte(tipo: TipoPrancheta, titulo: string): boolean {
  return tipo === "capa" || Boolean(semMarcasDestaque(titulo).trim());
}

/** Lista de pranchetas que vão para a arte final, na ordem: capa, slides com título, chamada com título. */
export function pranchetasDaArte(c: { slides: { id: string; titulo: string }[]; cta: { titulo: string } }): string[] {
  return [
    "capa",
    ...c.slides.filter((s) => pranchetaEntraNaArte("slide", s.titulo)).map((s) => s.id),
    ...(pranchetaEntraNaArte("cta", c.cta.titulo) ? ["cta"] : []),
  ];
}

/** "Montar o carrossel com a IA" substitui capa, slides e chamada: pede confirmação se já há conteúdo (linha 64). */
export function montarCarrosselPedeConfirmacao(c: {
  kicker: string;
  slides: { titulo: string; subtitulo: string }[];
  cta: { titulo: string; botaoTexto: string };
}): boolean {
  return Boolean(c.kicker.trim() || c.slides.some((s) => s.titulo.trim() || s.subtitulo.trim()) || c.cta.titulo.trim() || c.cta.botaoTexto.trim());
}

/** Cores do botão da chamada final: sem escolha, laranja com texto na principal, como o compositor desenha. */
export function coresBotaoChamada(cores: { hex: string }[], botaoCor: string, botaoCorTexto: string): { fundo: string; texto: string } {
  return { fundo: botaoCor || cores[1]?.hex || "#ff6d2d", texto: botaoCorTexto || cores[0]?.hex || "#36499b" };
}

/** Setas da arte pronta e do Story: n/N com volta, como o real. */
export function navegarIndice(atual: number, delta: number, total: number): number {
  if (total <= 0) return 0;
  return (((atual + delta) % total) + total) % total;
}

/** Faixa de interface da rede no Story: 250 px de 1920 (cerca de 13%) no topo e na base (linha 72). */
export const SAFE_ZONE_STORY_PCT = 13;

/** Versão Story (linha 72): só depois da arte do feed pronta e com título no Estático e no Blog. */
export function podeGerarStory(a: { arteFinal: boolean; modelo: ModeloArte; titulo: string; ocupado: boolean }): Resultado {
  if (a.ocupado) return nao("Espere terminar o que está gerando.");
  if (!a.arteFinal) return nao("Finalize a arte do feed primeiro: o Story sai dela.");
  if (a.modelo !== "C" && !a.titulo.trim()) return nao("Escreva o título da arte para gerar o Story.");
  return OK;
}

/** Um item do menu Baixar (linhas 69, 70 e 72). */
export type ItemBaixar = { id: string; rotulo: string; arquivo: string; ok: boolean; motivo?: string };

/**
 * Menu único "Baixar" (ESPEC ponto confuso 13): SVG da prancheta à vista,
 * todas em .zip e imagem única no carrossel, e o Story. O que ainda não
 * existe aparece com o motivo.
 */
export function itensBaixar(a: { arteFinal: boolean; pranchetas: number; indice: number; stories: number; indiceStory: number }): ItemBaixar[] {
  const semArte = a.arteFinal ? undefined : "Finalize a arte primeiro.";
  const varias = a.pranchetas > 1;
  const itens: ItemBaixar[] = [
    {
      id: "svg",
      rotulo: varias ? `SVG desta prancheta (${a.indice + 1} de ${a.pranchetas})` : "SVG da arte",
      arquivo: varias ? `prancheta-${a.indice + 1}.svg` : "arte.svg",
      ok: a.arteFinal,
      motivo: semArte,
    },
  ];
  if (varias) {
    itens.push(
      { id: "zip", rotulo: "Todas as pranchetas (.zip)", arquivo: "carrossel-pranchetas.zip", ok: a.arteFinal, motivo: semArte },
      { id: "png", rotulo: "Imagem única do carrossel (lado a lado)", arquivo: "carrossel.png", ok: a.arteFinal, motivo: semArte },
    );
  }
  const semStory = a.stories ? undefined : "Gere a versão Story primeiro.";
  itens.push(
    a.stories > 1
      ? { id: "story-zip", rotulo: "Stories (.zip)", arquivo: "stories.zip", ok: true }
      : { id: "story", rotulo: "Story em SVG", arquivo: "arte-story.svg", ok: a.stories > 0, motivo: semStory },
  );
  if (a.stories > 1) {
    itens.splice(itens.length - 1, 0, { id: "story-svg", rotulo: `Story desta prancheta (${a.indiceStory + 1} de ${a.stories})`, arquivo: `arte-story-${a.indiceStory + 1}.svg`, ok: true });
  }
  return itens;
}

// ─── Estúdio: Enviar, conclusão e salvamento (item 5.5d) ──────────────────
//
// Fonte: INVENTARIO-estudio.md, linhas 74 a 81 da matriz; `enviarParaAprovacao`
// em estudio.tsx e AnalisePostCard.tsx (commit 4fcf254). Decisões D3 (data
// opcional, sem mínimo), D4 (bloco de CTAs na legenda + coluna própria), D5
// (configuração da arte salva no post) e D7 (tela de conclusão). Bugs do real
// que NÃO entram: o rascunho grava uma legenda diferente da escolhida, e não
// dá para salvar edições depois que o post existe (aqui tudo se salva sozinho).

/** Nome da rede como o real escreve no bloco de CTAs (`REDE_META[pl].label`). */
export const NOME_REDE: Record<Rede, string> = { instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook", youtube: "YouTube" };

/** D4: o bloco que o envio acrescenta à legenda, uma linha por chamada: "[Instagram & LinkedIn]: texto". */
export function blocoCtas(ctas: Cta[]): string {
  return ctas
    .filter((c) => c.texto.trim() && c.plataformas.length > 0)
    .map((c) => `[${c.plataformas.map((r) => NOME_REDE[r]).join(" & ")}]: ${c.texto.trim()}`)
    .join("\n");
}

const LINHA_DO_BLOCO = /^\[[^\]\n]+\]: \S/;

/**
 * A legenda sem o bloco de CTAs do fim (o último parágrafo, se todas as linhas
 * dele forem "[Rede]: texto"). Serve para reabrir um post enviado ou reprovado
 * e reenviar sem repetir o bloco.
 */
export function legendaSemBlocoCtas(legenda: string): string {
  const partes = legenda.split("\n\n");
  if (partes.length < 2) return legenda;
  const ultimo = partes[partes.length - 1].split("\n");
  return ultimo.every((l) => LINHA_DO_BLOCO.test(l)) ? partes.slice(0, -1).join("\n\n") : legenda;
}

/** D4: legenda gravada no envio = legenda + linha em branco + bloco de CTAs. Pode ser aplicada de novo sem duplicar. */
export function legendaComBlocoCtas(legenda: string, ctas: Cta[]): string {
  const base = legendaSemBlocoCtas(legenda).trimEnd();
  const bloco = blocoCtas(ctas);
  return bloco ? `${base}\n\n${bloco}` : base;
}

/**
 * Enviar para aprovação a partir do Estúdio (linha 77, R-EST-11): exige o
 * texto aprovado e a arte pronta (o post já existe, porque nasce com o texto
 * aprovado). Durante a composição, espera terminar.
 */
export function podeEnviarDoEstudio(a: { faltaTexto: string[]; arteFinal: boolean; compondo: boolean }): Resultado {
  if (a.faltaTexto.length) return nao(fraseFaltaAprovar(a.faltaTexto));
  if (a.compondo) return nao("Aguarde a arte finalizar.");
  if (!a.arteFinal) return nao("Falta finalizar a arte.");
  return OK;
}

/**
 * D3: a data sugerida é opcional e não tem mínimo. Nada barra; uma data que
 * já passou só ganha um lembrete, porque quem aprova escolhe a data final.
 */
export function avisoDataSugerida(data: string, hoje: string): string | null {
  if (!data) return "Sem data, quem aprova escolhe uma ao aprovar.";
  if (data < hoje) return "Essa data já passou. Pode enviar assim: quem aprova troca ao aprovar.";
  return null;
}

/** Data do post ao reabrir (D3): a que foi salva, mesmo que já tenha passado. Vazia continua vazia. */
export function dataSugeridaAoReabrir(salva: string | undefined): string {
  return salva ?? "";
}

export type AtalhoConclusao = "meus-posts" | "voltar-card" | "ver-card" | "criar-outro";

/**
 * D7 (R-EST-7): os atalhos da tela de conclusão. "Voltar para o card" só
 * quando o post veio de um card; se o card nasceu no envio (4.6, caminho 3),
 * o atalho é "Ver o card no Quadro".
 */
export function atalhosDaConclusao(a: { veioDeCard: boolean; temCard: boolean }): AtalhoConclusao[] {
  const card: AtalhoConclusao[] = a.temCard ? [a.veioDeCard ? "voltar-card" : "ver-card"] : [];
  return ["meus-posts", ...card, "criar-outro"];
}

// ─── Minha mesa (Início, proposta 2.6) ────────────────────────────────────

/** Uma linha de "Minhas tarefas e subtarefas". */
export type TarefaDaMesa = {
  tipo: "card" | "subtarefa";
  /** Id do card ou da subtarefa. */
  id: string;
  titulo: string;
  card: Card;
  coluna: Coluna;
  prazo?: string;
  atrasada: boolean;
  post?: Post;
  /** Problemas abertos do item (card inteiro, ou só a subtarefa e o post dela). */
  problemas: Problema[];
};

export type Mesa = {
  /** Meus posts reprovados, o mais recente primeiro. */
  paraAjustar: Post[];
  /** Cards e subtarefas comigo, abertos; atrasados primeiro, depois por prazo. */
  tarefas: TarefaDaMesa[];
  /** Aprovados com publicação hoje ou já vencida, que são meus; atrasados primeiro. */
  publicarHoje: Post[];
  /** Pedidos esperando alguém assumir a triagem, o mais antigo primeiro. */
  pedidosNovos: Card[];
  /** Pedidos que eu assumi e ainda não decidi. */
  naMinhaTriagem: Card[];
  /** Fila de aprovação sem os meus (B-05). null = o papel não aprova: o bloco não existe. */
  paraAprovar: Post[] | null;
};

/**
 * Quem responde por um item: a subtarefa sem responsável herda o do card
 * (é quem o time procura quando o item para).
 */
export function responsavelDoItem(dados: DadosHub, itemId: string): string | undefined {
  const item = itemPorId(dados, itemId);
  if (!item) return undefined;
  if (item.tipo === "card") return item.card.responsavelId;
  return item.sub.responsavelId ?? item.card.responsavelId;
}

/** Ordem das tarefas na mesa: atrasadas primeiro, depois o prazo mais próximo, sem prazo no fim. */
function ordemTarefa(a: TarefaDaMesa, b: TarefaDaMesa): number {
  if (a.atrasada !== b.atrasada) return a.atrasada ? -1 : 1;
  if (a.prazo && b.prazo) return a.prazo.localeCompare(b.prazo);
  if (a.prazo) return -1;
  if (b.prazo) return 1;
  return a.titulo.localeCompare(b.titulo, "pt-BR");
}

/**
 * A mesa de uma pessoa (2.6): só o que é com ela, calculado do estado atual.
 * Muda com "Entrar como" (outra pessoa, outro papel) e com "Avançar 1 dia"
 * (Publicar hoje vira Publicação atrasada; prazos vencem).
 *  - Para ajustar: posts reprovados de que sou autor.
 *  - Minhas tarefas e subtarefas: cards abertos com o meu nome (A fazer, Em
 *    andamento ou Problemas; Recebidos ainda não tem dono) e subtarefas com o
 *    meu nome que não concluíram, em cards que seguem no Quadro.
 *  - Publicar hoje: aprovado com data de hoje ou anterior, em que sou autor ou
 *    respondo pelo item do post (decisão de interpretação: quem publica é quem
 *    cuida do post; o Calendário mostra os do time inteiro).
 *  - Pedidos novos: recebidos sem ninguém na triagem (vale para todos os papéis:
 *    qualquer pessoa do time pode assumir, como no real).
 *  - Na minha triagem: pedidos que eu assumi.
 *  - Para aprovar: só Aprovador e Admin, sem os posts de que sou autor (B-05).
 */
export function mesaDoUsuario(dados: DadosHub, usuarioId: string, papel: Papel, hoje: string): Mesa {
  const paraAjustar = dados.posts
    .filter((p) => p.estado === "reprovado" && p.autorId === usuarioId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));

  const abertas: Coluna[] = ["afazer", "andamento", "problemas"];
  const tarefas: TarefaDaMesa[] = [];
  for (const card of dados.cards) {
    const coluna = colunaDoCard(dados, card);
    if (!coluna || !abertas.includes(coluna)) continue;
    if (card.responsavelId === usuarioId) {
      tarefas.push({
        tipo: "card",
        id: card.id,
        titulo: card.titulo,
        card,
        coluna,
        prazo: card.prazo,
        atrasada: cardAtrasado(dados, card, hoje),
        post: postDoItem(dados, card.id),
        problemas: problemasAbertosDoCard(dados, card.id),
      });
    }
    for (const sub of dados.subtarefas) {
      if (sub.cardId !== card.id || sub.responsavelId !== usuarioId || subtarefaConcluida(dados, sub)) continue;
      tarefas.push({
        tipo: "subtarefa",
        id: sub.id,
        titulo: sub.titulo,
        card,
        coluna,
        prazo: sub.prazo,
        atrasada: subtarefaAtrasada(dados, sub, hoje),
        post: postDoItem(dados, sub.id),
        problemas: problemasDoItem(dados, sub.id),
      });
    }
  }
  tarefas.sort(ordemTarefa);

  const publicarHoje = dados.posts
    .filter(
      (p) =>
        p.estado === "aprovado" &&
        !!p.dataPublicacao &&
        p.dataPublicacao <= hoje &&
        (p.autorId === usuarioId || (p.itemId !== undefined && responsavelDoItem(dados, p.itemId) === usuarioId)),
    )
    .sort((a, b) => (a.dataPublicacao as string).localeCompare(b.dataPublicacao as string));

  const pedidosNovos = dados.cards
    .filter((c) => c.pedido?.estado === "recebido")
    .sort((a, b) => (a.pedido as NonNullable<Card["pedido"]>).recebidoEm.localeCompare((b.pedido as NonNullable<Card["pedido"]>).recebidoEm));

  const naMinhaTriagem = dados.cards.filter((c) => c.pedido?.estado === "triagem" && c.pedido.triagemPor === usuarioId);

  const aprova = papel === "aprovador" || papel === "admin";
  const paraAprovar = aprova
    ? dados.posts
        .filter((p) => p.estado === "enviado" && p.autorId !== usuarioId)
        .sort((a, b) => a.atualizadoEm.localeCompare(b.atualizadoEm))
    : null;

  return { paraAjustar, tarefas, publicarHoje, pedidosNovos, naMinhaTriagem, paraAprovar };
}

/**
 * A frase do topo da mesa, no lugar da grade de contadores do Início real
 * (anti-AI). Junta só o que existe, na ordem de urgência.
 */
export function resumoDaMesa(m: Mesa, hoje: string): string {
  const atrasadas = m.tarefas.filter((t) => t.atrasada).length;
  const atrasadosPublicar = m.publicarHoje.filter((p) => (p.dataPublicacao as string) < hoje).length;
  const partes: string[] = [];
  if (m.publicarHoje.length) {
    const nota =
      atrasadosPublicar === 0
        ? ""
        : m.publicarHoje.length === 1
          ? " (já atrasado)"
          : ` (${plural(atrasadosPublicar, "já atrasado", "já atrasados")})`;
    partes.push(plural(m.publicarHoje.length, "post para publicar", "posts para publicar") + nota);
  }
  if (m.paraAjustar.length) partes.push(plural(m.paraAjustar.length, "post para ajustar", "posts para ajustar"));
  if (m.paraAprovar?.length) partes.push(plural(m.paraAprovar.length, "post esperando a sua aprovação", "posts esperando a sua aprovação"));
  if (m.tarefas.length) {
    partes.push(
      plural(m.tarefas.length, "tarefa aberta", "tarefas abertas") +
        (atrasadas ? ` (${atrasadas === 1 ? "1 atrasada" : `${atrasadas} atrasadas`})` : ""),
    );
  }
  if (m.naMinhaTriagem.length) partes.push(plural(m.naMinhaTriagem.length, "pedido na sua triagem", "pedidos na sua triagem"));
  if (partes.length === 0) {
    return m.pedidosNovos.length
      ? `Nada parado com você. ${plural(m.pedidosNovos.length, "pedido novo espera", "pedidos novos esperam")} alguém assumir.`
      : "Nada parado com você agora. Vale olhar a tendência da semana.";
  }
  const lista = partes.length > 1 ? `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}` : partes[0];
  return `Com você hoje: ${lista}.`;
}

const PESO_POTENCIAL: Record<Potencial, number> = { Alto: 3, Médio: 2, Baixo: 1 };

/**
 * Tendência em destaque (2.7 item 1 e "Tendência da semana", 2.6): a de maior
 * potencial ainda NÃO aproveitada (nova), e a mais recente no empate.
 */
export function tendenciaDestaque(dados: DadosHub): Tendencia | undefined {
  return dados.tendencias
    .filter((t) => situacaoTendencia(dados, t).estado === "nova")
    .sort((a, b) => PESO_POTENCIAL[b.potencial] - PESO_POTENCIAL[a.potencial] || b.criadoEm.localeCompare(a.criadoEm))[0];
}

// ─── Métricas do time (Resultados → Time, proposta 4.11 e 2.7) ────────────
//
// No real tudo sai de task_status_history, sem ninguém marcar horas. No
// protótipo, as mesmas perguntas são respondidas a partir do estado em memória:
//  - mês corrente: calculado do store (reage às ações do protótipo);
//  - mês anterior: o histórico fechado de `dados.historico` (só leitura), que
//    já representa tudo o que aconteceu naquele mês;
//  - carga por pessoa e problemas abertos: sempre "agora" (é uma foto, não um
//    acumulado do mês);
//  - tendências: sempre do store, nos dois meses (o histórico não guarda posts).
// Fica de fora de propósito: horas, tempo por post e ranking de produtividade.

export type PeriodoMes = {
  chave: "atual" | "anterior";
  /** YYYY-MM-DD do primeiro dia (incluso). */
  inicio: string;
  /** YYYY-MM-DD do primeiro dia do mês seguinte (exclusivo). */
  fim: string;
  /** "outubro" */
  nome: string;
  /** true = mês corrente, ainda em curso. */
  emCurso: boolean;
};

const nomeDoMes = (ano: number, mes0: number) =>
  new Date(ano, mes0, 1).toLocaleDateString("pt-BR", { month: "long" });

const primeiroDia = (ano: number, mes0: number) => diaDe(new Date(ano, mes0, 1, 12).toISOString());

/** O mês do "hoje" do protótipo e o anterior, para o alternador da tela. */
export function periodosDoTime(hoje: string): [PeriodoMes, PeriodoMes] {
  const [a, m] = hoje.split("-").map(Number);
  const atual: PeriodoMes = {
    chave: "atual",
    inicio: primeiroDia(a, m - 1),
    fim: primeiroDia(a, m),
    nome: nomeDoMes(a, m - 1),
    emCurso: true,
  };
  const anterior: PeriodoMes = {
    chave: "anterior",
    inicio: primeiroDia(a, m - 2),
    fim: atual.inicio,
    nome: nomeDoMes(a, m - 2),
    emCurso: false,
  };
  return [atual, anterior];
}

const noPeriodo = (isoOuDia: string | undefined, p: PeriodoMes) => {
  if (!isoOuDia) return false;
  const d = diaDe(isoOuDia);
  return d >= p.inicio && d < p.fim;
};

const horasEntre = (de: string, ate: string) => (new Date(ate).getTime() - new Date(de).getTime()) / 3_600_000;

const media = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);

/** Dias inteiros entre dois dias (YYYY-MM-DD ou ISO). */
export function diasEntre(de: string, ate: string): number {
  const [a1, m1, d1] = diaDe(de).split("-").map(Number);
  const [a2, m2, d2] = diaDe(ate).split("-").map(Number);
  return Math.round((new Date(a2, m2 - 1, d2).getTime() - new Date(a1, m1 - 1, d1).getTime()) / 86_400_000);
}

/**
 * Quando o card terminou: o último fato que o fechou (post publicado,
 * subtarefa sem post concluída, ou o arraste manual do card vazio).
 * undefined = o card não está em Concluído.
 */
export function dataConclusaoCard(dados: DadosHub, card: Card): string | undefined {
  if (colunaDoCard(dados, card) !== "concluido") return undefined;
  const datas: string[] = [];
  if (card.concluidoManualEm) datas.push(card.concluidoManualEm);
  for (const p of postsDoCard(dados, card.id)) if (p.publicadoEm) datas.push(p.publicadoEm);
  for (const s of dados.subtarefas) {
    if (s.cardId === card.id && s.concluidaEm && !postDoItem(dados, s.id)) datas.push(s.concluidaEm);
  }
  return datas.sort().pop();
}

export type ContagemNome = { chave: string; nome: string; n: number; cor?: string };

export type EntregaMedida = {
  id: string;
  titulo: string;
  prazo?: string;
  entregueEm: string;
  /** > 0 = dias depois do prazo. */
  diasAtraso: number;
  /** Só no mês corrente (o histórico não abre card). */
  cardId?: string;
};

export type CargaPessoa = {
  /** undefined = cards abertos sem responsável. */
  usuarioId?: string;
  abertas: number;
  atrasadas: number;
  emProblemas: number;
};

export type ProblemaPorTipo = {
  tipo: TipoProblema;
  /** Agora. */
  abertos: number;
  /** Há quantos dias está aberto o mais antigo (agora). */
  maisAntigoDias: number | null;
  /** Resolvidos no mês escolhido. */
  resolvidos: number;
  mediaResolucaoHoras: number | null;
};

export type MetricasTime = {
  periodo: PeriodoMes;
  /** 1. Pedidos que chegaram no mês. */
  pedidos: {
    total: number;
    /** Total do mês anterior ao escolhido, quando existe (comparação). */
    totalAnterior: number | null;
    porArea: ContagemNome[];
    porEtiqueta: ContagemNome[];
    post: number;
    acao: number;
  };
  /** 2. Resultado da triagem: decisões tomadas no mês. */
  triagem: { aprovados: number; devolvidos: number; negados: number; total: number };
  /** 3. Tempo de resposta: da chegada do pedido à decisão. */
  resposta: {
    mediaHoras: number | null;
    maisLentaHoras: number | null;
    /** Pedidos que esperam decisão agora (só no mês corrente). */
    esperando: { cardId: string; titulo: string; dias: number; comQuem?: string }[];
  };
  /** 4. Entregas no prazo. */
  entregas: { total: number; comPrazo: number; noPrazo: number; lista: EntregaMedida[] };
  /** 5. Carga por pessoa (agora). */
  carga: CargaPessoa[];
  /** 6. Problemas por tipo. */
  problemas: ProblemaPorTipo[];
  /** Aproveitamento de tendências (2.7). */
  tendencias: {
    /** Tendências com pelo menos 1 post publicado no mês. */
    aproveitadasNoMes: { id: string; titulo: string; posts: number }[];
    postsPublicadosNoMes: number;
    porEstado: Record<EstadoTendencia, number>;
    total: number;
  };
};

const TIPOS_PROBLEMA: TipoProblema[] = ["reprovado", "aguardando_solicitante", "bloqueado"];

function contar(chaves: string[], nomeDe: (c: string) => { nome: string; cor?: string }): ContagemNome[] {
  const mapa = new Map<string, number>();
  for (const c of chaves) mapa.set(c, (mapa.get(c) ?? 0) + 1);
  return [...mapa.entries()]
    .map(([chave, n]) => ({ chave, n, ...nomeDe(chave) }))
    .sort((a, b) => b.n - a.n || a.nome.localeCompare(b.nome, "pt-BR"));
}

/**
 * As 6 métricas da proposta 4.11 + aproveitamento de tendências (2.7) para um mês.
 * `agora` é o instante ISO do "hoje" do protótipo (idade do que está esperando).
 */
export function metricasDoTime(dados: DadosHub, periodo: PeriodoMes, hoje: string, agora: string): MetricasTime {
  const etiquetaNome = (id: string) => {
    const e = dados.etiquetas.find((x) => x.id === id);
    // Pedido de ação ainda sem decisão não tem etiqueta: ela é escolhida ao aprovar (4.9).
    return { nome: e?.nome ?? "Ainda sem etiqueta", cor: e?.cor };
  };
  const doMesAtual = periodo.chave === "atual";
  const h = dados.historico;

  // 1, 2 e 3: pedidos, triagem e tempo de resposta
  let pedidos: MetricasTime["pedidos"];
  let triagem: MetricasTime["triagem"];
  let resposta: MetricasTime["resposta"];

  if (doMesAtual) {
    const cardsPedido = dados.cards.filter((c) => c.pedido);
    const chegaram = cardsPedido.filter((c) => noPeriodo(c.pedido?.recebidoEm, periodo));
    const areaDe = (c: Card) => dados.solicitantes.find((s) => s.id === c.pedido?.solicitanteId)?.area ?? "Sem área";
    const etiquetasDe = (c: Card) => (c.etiquetas.length ? c.etiquetas : c.pedido?.categoria === "post" ? ["e-post"] : ["sem"]);
    pedidos = {
      total: chegaram.length,
      totalAnterior: h.pedidos.length,
      porArea: contar(chegaram.map(areaDe), (a) => ({ nome: a })),
      porEtiqueta: contar(chegaram.flatMap(etiquetasDe), etiquetaNome),
      post: chegaram.filter((c) => c.pedido?.categoria === "post").length,
      acao: chegaram.filter((c) => c.pedido?.categoria === "acao").length,
    };
    const decisoes = dados.decisoes.filter((x) => noPeriodo(x.em, periodo));
    triagem = {
      aprovados: decisoes.filter((x) => x.tipo === "aprovado").length,
      devolvidos: decisoes.filter((x) => x.tipo === "devolvido").length,
      negados: decisoes.filter((x) => x.tipo === "negado").length,
      total: decisoes.length,
    };
    // Reenvio do solicitante zera o recebidoEm: a decisão anterior a ele não conta (daria tempo negativo).
    const tempos = decisoes
      .map((x) => {
        const rec = cardPorId(dados, x.cardId)?.pedido?.recebidoEm;
        return rec ? horasEntre(rec, x.em) : -1;
      })
      .filter((t) => t >= 0);
    resposta = {
      mediaHoras: media(tempos),
      maisLentaHoras: tempos.length ? Math.max(...tempos) : null,
      esperando: cardsPedido
        .filter((c) => c.pedido?.estado === "recebido" || c.pedido?.estado === "triagem")
        .map((c) => ({
          cardId: c.id,
          titulo: c.titulo,
          dias: Math.max(0, diasEntre(c.pedido?.recebidoEm as string, agora)),
          comQuem: c.pedido?.estado === "triagem" ? c.pedido.triagemPor : undefined,
        }))
        .sort((a, b) => b.dias - a.dias),
    };
  } else {
    const ps = h.pedidos;
    pedidos = {
      total: ps.length,
      totalAnterior: null,
      porArea: contar(ps.map((p) => p.area), (a) => ({ nome: a })),
      porEtiqueta: contar(ps.flatMap((p) => p.etiquetas), etiquetaNome),
      post: ps.filter((p) => p.categoria === "post").length,
      acao: ps.filter((p) => p.categoria === "acao").length,
    };
    triagem = {
      aprovados: ps.filter((p) => p.decisao === "aprovado").length,
      devolvidos: ps.filter((p) => p.decisao === "devolvido").length,
      negados: ps.filter((p) => p.decisao === "negado").length,
      total: ps.length,
    };
    const tempos = ps.map((p) => horasEntre(p.recebidoEm, p.decididoEm));
    resposta = { mediaHoras: media(tempos), maisLentaHoras: tempos.length ? Math.max(...tempos) : null, esperando: [] };
  }

  // 4: entregas no prazo
  const lista: EntregaMedida[] = doMesAtual
    ? dados.cards
        .map((c) => ({ c, em: dataConclusaoCard(dados, c) }))
        .filter((x): x is { c: Card; em: string } => noPeriodo(x.em, periodo))
        .map(({ c, em }) => ({
          id: c.id,
          titulo: c.titulo,
          prazo: c.prazo,
          entregueEm: em,
          diasAtraso: c.prazo ? diasEntre(c.prazo, em) : 0,
          cardId: c.id,
        }))
    : h.entregas.map((e) => ({
        id: e.id,
        titulo: e.titulo,
        prazo: e.prazo,
        entregueEm: e.entregueEm,
        diasAtraso: diasEntre(e.prazo, e.entregueEm),
      }));
  lista.sort((a, b) => b.diasAtraso - a.diasAtraso || b.entregueEm.localeCompare(a.entregueEm));
  const comPrazo = lista.filter((e) => e.prazo).length;
  const entregas = { total: lista.length, comPrazo, noPrazo: lista.filter((e) => e.prazo && e.diasAtraso <= 0).length, lista };

  // 5: carga por pessoa (agora), reaproveitando a mesa de cada um
  const carga: CargaPessoa[] = dados.usuarios
    .map((u) => {
      const t = mesaDoUsuario(dados, u.id, u.papel, hoje).tarefas;
      return {
        usuarioId: u.id,
        abertas: t.length,
        atrasadas: t.filter((x) => x.atrasada).length,
        emProblemas: t.filter((x) => x.coluna === "problemas" || x.problemas.length > 0).length,
      };
    })
    .filter((c) => c.abertas > 0);
  const semDono = dados.cards.filter((c) => {
    const col = colunaDoCard(dados, c);
    return !c.responsavelId && (col === "afazer" || col === "andamento" || col === "problemas");
  });
  if (semDono.length) {
    carga.push({
      usuarioId: undefined,
      abertas: semDono.length,
      atrasadas: semDono.filter((c) => cardAtrasado(dados, c, hoje)).length,
      emProblemas: semDono.filter((c) => colunaDoCard(dados, c) === "problemas").length,
    });
  }
  carga.sort((a, b) => b.abertas - a.abertas);

  // 6: problemas por tipo (abertos agora + resolvidos no mês)
  const cardsNoQuadro = new Set(dados.cards.filter((c) => colunaDoCard(dados, c) !== null).map((c) => c.id));
  const problemas: ProblemaPorTipo[] = TIPOS_PROBLEMA.map((tipo) => {
    const abertos = dados.problemas.filter((p) => p.tipo === tipo && !p.resolvidoEm && cardsNoQuadro.has(p.cardId));
    const resolvidos = doMesAtual
      ? dados.problemas
          .filter((p) => p.tipo === tipo && noPeriodo(p.resolvidoEm, periodo))
          .map((p) => horasEntre(p.abertoEm, p.resolvidoEm as string))
      : h.problemas.filter((p) => p.tipo === tipo).map((p) => horasEntre(p.abertoEm, p.resolvidoEm));
    return {
      tipo,
      abertos: abertos.length,
      maisAntigoDias: abertos.length ? Math.max(...abertos.map((p) => Math.max(0, diasEntre(p.abertoEm, agora)))) : null,
      resolvidos: resolvidos.length,
      mediaResolucaoHoras: media(resolvidos),
    };
  });

  // Aproveitamento de tendências (2.7): quantas viraram post publicado no mês
  const porEstado: Record<EstadoTendencia, number> = { nova: 0, em_producao: 0, aproveitada: 0, descartada: 0 };
  const aproveitadasNoMes: MetricasTime["tendencias"]["aproveitadasNoMes"] = [];
  let postsPublicadosNoMes = 0;
  for (const t of dados.tendencias) {
    const s = situacaoTendencia(dados, t);
    porEstado[s.estado] += 1;
    const noMes = s.posts.filter((p) => p.estado === "publicado" && noPeriodo(p.publicadoEm, periodo)).length;
    if (noMes) {
      aproveitadasNoMes.push({ id: t.id, titulo: t.titulo, posts: noMes });
      postsPublicadosNoMes += noMes;
    }
  }
  aproveitadasNoMes.sort((a, b) => b.posts - a.posts);

  return {
    periodo,
    pedidos,
    triagem,
    resposta,
    entregas,
    carga,
    problemas,
    tendencias: { aproveitadasNoMes, postsPublicadosNoMes, porEstado, total: dados.tendencias.length },
  };
}

/**
 * O resumo em uma frase do topo (4.11). Exemplo da proposta:
 * "Em setembro chegaram 18 pedidos: 12 aprovados, 3 devolvidos e 3 negados.
 *  O time entregou 21 cards, 17 deles no prazo."
 * No mês em curso diz "até hoje" e separa o que ainda espera decisão.
 */
export function resumoDoTime(m: MetricasTime, hoje: string): string {
  const { periodo: p, pedidos, triagem, entregas } = m;
  const abertura = p.emCurso ? `Em ${p.nome}, até hoje (${ddmm(hoje)}),` : `Em ${p.nome}`;
  const partesDecisao = [
    triagem.aprovados ? plural(triagem.aprovados, "aprovado", "aprovados") : "",
    triagem.devolvidos ? plural(triagem.devolvidos, "devolvido", "devolvidos") : "",
    triagem.negados ? plural(triagem.negados, "negado", "negados") : "",
  ].filter(Boolean);
  const listaDecisao =
    partesDecisao.length > 1 ? `${partesDecisao.slice(0, -1).join(", ")} e ${partesDecisao[partesDecisao.length - 1]}` : partesDecisao[0];

  let fraseP: string;
  if (pedidos.total === 0 && triagem.total === 0) fraseP = `${abertura} ainda não chegou nenhum pedido.`;
  else if (triagem.total === pedidos.total && listaDecisao) {
    fraseP = `${abertura} ${pedidos.total === 1 ? "chegou 1 pedido" : `chegaram ${pedidos.total} pedidos`}: ${listaDecisao}.`;
  } else {
    const chegou = pedidos.total === 1 ? "chegou 1 pedido" : `chegaram ${pedidos.total} pedidos`;
    fraseP = listaDecisao
      ? `${abertura} ${chegou} e o time tomou ${plural(triagem.total, "decisão", "decisões")}: ${listaDecisao}.`
      : `${abertura} ${chegou} e nenhum foi decidido ainda.`;
  }

  const fraseE =
    entregas.total === 0
      ? "Nenhum card foi entregue ainda."
      : `O time entregou ${plural(entregas.total, "card", "cards")}, ${
          entregas.comPrazo === 0
            ? "nenhum com prazo marcado"
            : entregas.noPrazo === entregas.total
              ? entregas.total === 1
                ? "no prazo"
                : "todos no prazo"
              : `${entregas.noPrazo} deles no prazo`
        }.`;
  return `${fraseP} ${fraseE}`;
}

/** "5 h", "2,4 d" (formato do MetricasPlanejamentoView real, com horas abaixo de 1 dia). */
export function formatarDuracao(horas: number | null): string {
  if (horas === null) return "—";
  if (horas < 24) return `${Math.max(1, Math.round(horas))} h`;
  return `${(horas / 24).toFixed(1).replace(".", ",")} d`;
}

// ─── Marca (proposta 2.3: Brand Kit + aba Marca da Administração) ─────────

/**
 * Quem edita a marca. No real (brand-kit.tsx) é `admin` ou `editor`; no
 * protótipo o editor é o papel Marketing. O Aprovador vê em "Somente leitura".
 */
export function podeEditarMarca(papel: Papel): boolean {
  return papel === "marketing" || papel === "admin";
}

/** Limite da paleta do Brand Kit real ("Adicionar cor" some com 6 cores). */
export const MAX_CORES_PALETA = 6;

/**
 * Hex no formato do ColorHexInput real (`normalizeHex`): aceita 3 ou 6 dígitos,
 * com ou sem "#", e devolve "#rrggbb" em minúsculas. Inválido → null.
 */
export function normalizarHex(bruto: string): string | null {
  const limpo = bruto.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(limpo)) return `#${limpo.split("").map((c) => c + c).join("")}`;
  if (/^[0-9a-f]{6}$/.test(limpo)) return `#${limpo}`;
  return null;
}

/** Luminância relativa (WCAG) de um "#rrggbb", para escolher texto claro ou escuro. */
export function luminancia(hex: string): number {
  const h = normalizarHex(hex) ?? "#000000";
  const canal = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

/** Texto sobre uma cor de fundo: escuro quando o fundo é claro. */
export function textoSobre(hex: string): "claro" | "escuro" {
  return luminancia(hex) > 0.45 ? "escuro" : "claro";
}

/**
 * Tamanhos de logo P/M/G (AbaMarca real: % da largura/altura usados nos botões
 * de tamanho Básico do Estúdio). Cada um entre 1 e 100, e P ≤ M ≤ G para os
 * botões manterem a ordem (a ordem é novidade do protótipo; o real só limita 1-100).
 */
export function validarTamanhosLogo(t: { P: number; M: number; G: number }): Resultado {
  for (const k of ["P", "M", "G"] as const) {
    if (!Number.isFinite(t[k]) || t[k] < 1 || t[k] > 100) return nao(`O tamanho ${k} precisa ficar entre 1% e 100%.`);
  }
  if (!(t.P <= t.M && t.M <= t.G)) return nao("Os tamanhos precisam crescer de P para G.");
  return { ok: true };
}

export type AvaliacaoHashtags = {
  /** Oficiais fora do padrão de capitalização, com a forma certa. */
  foraDoPadrao: { atual: string; sugerida: string }[];
  /** Vagas que sobram para as de contexto dentro do limite de 8. */
  vagasContexto: number;
  /** Aviso quando as oficiais não deixam espaço para 3 de contexto. */
  aviso: string | null;
};

/**
 * Hashtags oficiais contra a regra da marca (steering product): todas as
 * oficiais + 3 a 5 de contexto, no máximo 8, só a primeira letra maiúscula.
 */
export function avaliarHashtagsOficiais(oficiais: string[]): AvaliacaoHashtags {
  const foraDoPadrao = oficiais
    .map((atual) => ({ atual, sugerida: formatarHashtag(atual) }))
    .filter((h) => h.sugerida && h.sugerida !== h.atual);
  const vagasContexto = Math.max(0, LIMITES_CONTEUDO.hashtags - oficiais.length);
  const aviso =
    vagasContexto >= 3
      ? null
      : `Com ${plural(oficiais.length, "oficial", "oficiais")}, sobram ${plural(vagasContexto, "vaga", "vagas")} para as de contexto, e a regra pede de 3 a 5 dentro do limite de ${LIMITES_CONTEUDO.hashtags}.`;
  return { foraDoPadrao, vagasContexto, aviso };
}

/**
 * Como as hashtags saem num post: oficiais primeiro, depois as de contexto, até
 * o limite. Devolve também as de contexto que ficaram de fora.
 */
export function previaHashtags(oficiais: string[], contexto: string[]): { usadas: string[]; cortadas: string[] } {
  const usadas = montarHashtags(oficiais, contexto);
  const cortadas = contexto.map(formatarHashtag).filter((h) => h && !usadas.includes(h));
  return { usadas, cortadas };
}

// ─── Configurações (proposta 7) ───────────────────────────────────────────
//
// Área só do admin, com quatro abas: Equipe, IA e prompts, Integrações e
// Etiquetas. As regras abaixo são as que as telas respeitam; na
// implementação real, cada uma vira checagem no servidor (e RLS nas tabelas
// novas, como a de etiquetas).

/** Configurações é só para quem administra o Hub (proposta 7). O shell já barra os outros papéis. */
export function podeAdministrar(papel: Papel): boolean {
  return papel === "admin";
}

// Equipe ──────────────────────────────────────────────────────────────────

export const ROTULO_PAPEL: Record<Papel, string> = {
  marketing: "Marketing",
  aprovador: "Aprovador",
  admin: "Administrador",
};

/** Ordem dos papéis nas listas: de quem tem mais acesso para quem tem menos. */
export const ORDEM_PAPEIS: Papel[] = ["admin", "aprovador", "marketing"];

/**
 * O que cada papel faz no Hub novo. Junta o que as telas já respeitam:
 * Para aprovar só Aprovador e Admin (3.3); a Marca edita quem é Marketing ou
 * Admin (5.3); Configurações só Admin (7); qualquer pessoa assume e decide
 * pedidos (2.3); ninguém decide o próprio post ou o próprio pedido.
 */
export const O_QUE_O_PAPEL_FAZ: Record<Papel, string> = {
  admin: "Faz tudo o que os outros papéis fazem e cuida das Configurações: equipe, prompts da IA, integrações e etiquetas.",
  aprovador: "Aprova ou reprova os posts de outras pessoas, confirma a data de publicação e decide pedidos. Lê a Marca sem editar.",
  marketing: "Cria posts e cards, decide pedidos e edita a Marca. Envia para aprovação, mas não aprova.",
};

/** Quem continua no time. Quem foi removido fica só no histórico (autor de posts, decisões). */
export function membrosDaEquipe(usuarios: Usuario[]): Usuario[] {
  return usuarios.filter((u) => !u.removidoEm);
}

export type ResumoEquipe = {
  total: number;
  admins: number;
  /** Já aceitaram o convite. */
  ativos: number;
  /** Convite enviado, ainda sem acesso. */
  pendentes: number;
  porPapel: Record<Papel, number>;
};

export function resumoDaEquipe(usuarios: Usuario[]): ResumoEquipe {
  const membros = membrosDaEquipe(usuarios);
  const porPapel: Record<Papel, number> = { admin: 0, aprovador: 0, marketing: 0 };
  membros.forEach((u) => (porPapel[u.papel] += 1));
  return {
    total: membros.length,
    admins: porPapel.admin,
    ativos: membros.filter((u) => u.ativo).length,
    pendentes: membros.filter((u) => !u.ativo).length,
    porPapel,
  };
}

/** "ana.ribeiro@exemplo.com" → "Ana Ribeiro" (o nomeExibicaoUsuario do real, pacote-10). */
export function nomeDoEmail(email: string): string {
  const local = email.trim().split("@")[0] ?? "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

/** Iniciais do avatar: primeira letra do primeiro e do último nome. */
export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const ini = partes.length === 1 ? partes[0].slice(0, 2) : partes[0][0] + partes[partes.length - 1][0];
  return ini.toUpperCase();
}

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Convite: e-mail completo e de quem ainda não está no time (nem com convite pendente). */
export function validarConvite(email: string, usuarios: Usuario[]): Resultado {
  const e = email.trim().toLowerCase();
  if (!FORMATO_EMAIL.test(e)) return nao("Escreva o e-mail completo, como nome.sobrenome@empresa.com.");
  const ja = membrosDaEquipe(usuarios).find((u) => u.email.toLowerCase() === e);
  if (ja) return nao(ja.ativo ? `${ja.nome} já está no time.` : `${ja.nome} já tem um convite pendente. Use "Reenviar convite" no menu da pessoa.`);
  return OK;
}

/**
 * Administradores que já têm acesso. Convite pendente não conta: enquanto a
 * pessoa não entrar, ninguém administra por ela.
 */
function adminsComAcesso(usuarios: Usuario[]): Usuario[] {
  return membrosDaEquipe(usuarios).filter((u) => u.papel === "admin" && u.ativo);
}

const unicoAdmin = (usuarios: Usuario[], alvo: Usuario) =>
  alvo.papel === "admin" && alvo.ativo && adminsComAcesso(usuarios).length <= 1;

/**
 * Trocar o papel de alguém. Ninguém troca o próprio papel (evita perder o
 * acesso a Configurações sem querer) e o único administrador com acesso não é
 * rebaixado (regra do real: "promova outra pessoa antes").
 */
export function podeMudarPapel(usuarios: Usuario[], alvoId: string, novo: Papel, euId: string): Resultado {
  const alvo = usuarios.find((u) => u.id === alvoId);
  if (!alvo) return nao("Pessoa não encontrada.");
  if (alvo.papel === novo) return nao(`${alvo.nome} já tem o papel ${ROTULO_PAPEL[novo]}.`);
  if (alvoId === euId) return nao("Você não muda o próprio papel. Peça a outro administrador.");
  if (novo !== "admin" && unicoAdmin(usuarios, alvo)) {
    return nao(`${alvo.nome} é o único administrador com acesso. Promova outra pessoa antes de mudar o papel.`);
  }
  return OK;
}

/** Remover alguém: nunca a si mesmo e nunca o único administrador com acesso. */
export function podeRemoverUsuario(usuarios: Usuario[], alvoId: string, euId: string): Resultado {
  const alvo = usuarios.find((u) => u.id === alvoId);
  if (!alvo) return nao("Pessoa não encontrada.");
  if (alvoId === euId) return nao("Você não remove o próprio acesso. Peça a outro administrador.");
  if (unicoAdmin(usuarios, alvo)) return nao(`${alvo.nome} é o único administrador com acesso e não pode sair do time.`);
  return OK;
}

export type TrabalhoAberto = {
  cards: Card[];
  subtarefas: Subtarefa[];
  /** Posts com "Em revisão por" esta pessoa. */
  revisoes: Post[];
  /** Pedidos em triagem com esta pessoa. */
  triagens: Card[];
};

/** O que está aberto com a pessoa agora (cards fora de Concluído, subtarefas não concluídas). */
export function trabalhoAbertoDe(dados: DadosHub, usuarioId: string): TrabalhoAberto {
  const aberto = (c: Card) => {
    const coluna = colunaDoCard(dados, c);
    return coluna !== null && coluna !== "concluido";
  };
  return {
    cards: dados.cards.filter((c) => c.responsavelId === usuarioId && aberto(c)),
    subtarefas: dados.subtarefas.filter((s) => s.responsavelId === usuarioId && !subtarefaConcluida(dados, s)),
    revisoes: dados.posts.filter((p) => p.estado === "enviado" && p.emRevisaoPor === usuarioId),
    triagens: dados.cards.filter((c) => c.pedido?.estado === "triagem" && c.pedido.triagemPor === usuarioId),
  };
}

/**
 * Remover alguém do time. O registro da pessoa fica (é autora de posts,
 * comentários e decisões, e o histórico não pode perder o nome); ela some da
 * Equipe e das escolhas de responsável. O que estava aberto volta para o time:
 *  - cards e subtarefas ficam "Sem responsável" (círculo tracejado no Quadro);
 *  - a revisão assumida em Para aprovar é liberada;
 *  - o pedido em triagem com ela volta para Recebidos, sem dono.
 * O que já terminou continua com o nome dela.
 */
export function aplicarRemocao(dados: DadosHub, usuarioId: string, agora: string): DadosHub {
  const t = trabalhoAbertoDe(dados, usuarioId);
  const cards = new Set(t.cards.map((c) => c.id));
  const subtarefas = new Set(t.subtarefas.map((s) => s.id));
  return {
    ...dados,
    usuarios: dados.usuarios.map((u) => (u.id === usuarioId ? { ...u, ativo: false, removidoEm: agora } : u)),
    cards: dados.cards.map((c) => {
      let novo = cards.has(c.id) ? { ...c, responsavelId: undefined } : c;
      if (novo.pedido?.estado === "triagem" && novo.pedido.triagemPor === usuarioId) {
        novo = { ...novo, pedido: { ...novo.pedido, estado: "recebido", triagemPor: undefined, triagemEm: undefined } };
      }
      return novo;
    }),
    subtarefas: dados.subtarefas.map((s) => (subtarefas.has(s.id) ? { ...s, responsavelId: undefined } : s)),
    posts: dados.posts.map((p) => (p.emRevisaoPor === usuarioId ? { ...p, emRevisaoPor: undefined } : p)),
  };
}

// Etiquetas (proposta 4.2 item 7 e 7) ─────────────────────────────────────

/**
 * Etiquetas que a automação usa pelo id. Dá para mudar o nome e a cor, mas
 * não arquivar, senão a regra que depende delas para de funcionar.
 */
export const ETIQUETAS_DO_SISTEMA: Record<string, string> = {
  "e-post": "Pedido de post aprovado já chega com ela, e é ela que faz um card vazio em A fazer sugerir Criar no Estúdio.",
  "e-tendencia": "O card criado a partir de uma tendência e o post que nasce de uma tendência saem com ela.",
};

/** Cabe na frente do card sem cortar (o EtiquetaChip trunca acima disso). */
export const MAX_NOME_ETIQUETA = 20;

/** Comparação de nomes sem acento e sem diferença de maiúsculas ("Vídeo" = "video"). */
const chaveNome = (s: string) =>
  s
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

/**
 * Nome de etiqueta: obrigatório, até 20 caracteres e único, contando as
 * arquivadas (nome repetido vira dois filtros iguais no Quadro).
 */
export function validarNomeEtiqueta(nome: string, etiquetas: Etiqueta[], idAtual?: string): Resultado {
  const n = nome.trim();
  if (!n) return nao("Dê um nome à etiqueta.");
  if (n.length > MAX_NOME_ETIQUETA) return nao(`Use até ${MAX_NOME_ETIQUETA} caracteres, para o nome caber na frente do card.`);
  const igual = etiquetas.find((e) => e.id !== idAtual && chaveNome(e.nome) === chaveNome(n));
  if (igual) {
    return nao(
      igual.arquivada ? `Já existe a etiqueta ${igual.nome}, arquivada. Reative a que já existe.` : `Já existe a etiqueta ${igual.nome}.`,
    );
  }
  return OK;
}

/**
 * Arquivar tira a etiqueta do filtro do Quadro e da escolha em cards e
 * pedidos; os cards que já têm a etiqueta continuam com ela (o histórico e
 * Resultados → Time não perdem a contagem). As do sistema não arquivam.
 */
export function podeArquivarEtiqueta(id: string): Resultado {
  const motivo = ETIQUETAS_DO_SISTEMA[id];
  return motivo ? nao(`Esta etiqueta é usada pela automação e não pode ser arquivada. ${motivo} Dá para mudar o nome e a cor.`) : OK;
}

export type UsoEtiqueta = { abertos: number; concluidos: number };

/** Em quantos cards a etiqueta está. Pedido negado não conta: saiu do Quadro. */
export function usoDaEtiqueta(dados: DadosHub, id: string): UsoEtiqueta {
  let abertos = 0;
  let concluidos = 0;
  for (const c of dados.cards) {
    if (!c.etiquetas.includes(id)) continue;
    const coluna = colunaDoCard(dados, c);
    if (coluna === null) continue;
    if (coluna === "concluido") concluidos += 1;
    else abertos += 1;
  }
  return { abertos, concluidos };
}

/** Tons da marca para etiquetas, na ordem em que são sugeridos. */
export const TONS_ETIQUETA = ["#36499b", "#ff6d2d", "#67cfee", "#2a397a", "#e0561a", "#2aa6cc", "#9aa6d6", "#ff9a6b", "#1d6f8a", "#6b7280"];

/** Cor sugerida para uma etiqueta nova: o primeiro tom da marca que nenhuma ativa usa. */
export function corSugeridaEtiqueta(etiquetas: Etiqueta[]): string {
  const usadas = new Set(etiquetas.filter((e) => !e.arquivada).map((e) => e.cor.toLowerCase()));
  return TONS_ETIQUETA.find((c) => !usadas.has(c)) ?? TONS_ETIQUETA[0];
}

/** A etiqueta aparece como bolinha e fundo a 12%: cor clara demais some no card branco. */
export function avisoCorEtiqueta(cor: string): string | null {
  return luminancia(cor) > 0.65 ? "Cor muito clara: a bolinha quase some no card branco. Prefira um tom mais forte." : null;
}

// IA e prompts (proposta 7: todos os prompts num lugar só) ────────────────

/** Marcadores que o Hub troca na hora de gerar. Sem eles, o dado deixa de chegar à IA. */
export const MARCADORES_OBRIGATORIOS: Record<string, { marcador: string; sem: string }[]> = {
  "pr-hashtags": [{ marcador: "{{hashtagsOficiais}}", sem: "as hashtags oficiais da Marca deixam de entrar nos posts" }],
};

/** Salvar um prompt: não fica vazio e mantém os marcadores obrigatórios. */
export function validarPrompt(id: string, texto: string): Resultado {
  if (!texto.trim()) return nao("O prompt não pode ficar vazio. Use Restaurar padrão para voltar ao texto do sistema.");
  for (const m of MARCADORES_OBRIGATORIOS[id] ?? []) {
    if (!texto.includes(m.marcador)) return nao(`Mantenha ${m.marcador} no texto: sem ele, ${m.sem}.`);
  }
  return OK;
}

export type AvisoPrompt = { texto: string; trocar?: { de: string; para: string } };

/**
 * Contradições com as regras da marca. Não barram o salvar, mas aparecem em
 * cima do campo com a correção pronta. Hoje há uma real: o prompt de hashtags
 * do banco pede "#tudominusculo", e a regra da marca é só a primeira letra
 * maiúscula (#Governançadedados).
 */
export function avisosDoPrompt(texto: string): AvisoPrompt[] {
  const avisos: AvisoPrompt[] = [];
  const linha = texto.split("\n").find((l) => /#tudominusculo/i.test(l));
  if (linha) {
    avisos.push({
      texto: "Este texto pede hashtags em minúsculas, mas a regra da marca é só a primeira letra maiúscula, como #Governançadedados.",
      trocar: { de: linha, para: "- Formato: sem espaço, só a primeira letra maiúscula (ex.: #Governançadedados)" },
    });
  }
  return avisos;
}

/** "O que o agente escreve": ao menos um campo ligado (regra do real). */
export function validarCamposAgente(c: CamposAgente): Resultado {
  return c.kicker || c.titulo || c.subtitulo ? OK : nao("Marque ao menos um campo para o agente escrever.");
}

// Integrações ──────────────────────────────────────────────────────────────

/** URL de webhook: https completo (o real só exige não vazio; o protótipo pede https). */
export function validarUrlWebhook(url: string): Resultado {
  const u = url.trim();
  if (!u) return nao("Cole a URL do webhook do n8n.");
  if (!/^https:\/\//i.test(u)) return nao("Use uma URL que comece com https://.");
  try {
    new URL(u);
  } catch {
    return nao("Essa URL não parece completa. Confira se copiou inteira do n8n.");
  }
  return OK;
}
