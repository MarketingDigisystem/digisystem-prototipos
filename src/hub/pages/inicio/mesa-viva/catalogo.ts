/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/MinhaMesa.tsx (main @ 0a6b425) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Catálogo dos cards da Minha Mesa viva: quem é principal, quem é opcional,
 * o tamanho de fábrica e o gate R-PED-11 (cards de decisão só para quem decide).
 */
import type { AreaId } from "../../../router";
import type { Papel } from "../../../store/tipos";

export const IDS = ["tarefas", "publicar", "ajustar", "aprovar", "triagem", "pedidos", "tendencia", "prazos", "recentes"] as const;
export type CardId = (typeof IDS)[number];
export type Tamanho = "normal" | "largo";

export type MetaCard = {
  id: CardId;
  titulo: string;
  tipo: "principal" | "opcional";
  /** R-PED-11: só Aprovador e Admin veem. */
  soDecide: boolean;
  tamanhoPadrao: Tamanho;
  descricaoGaleria: string;
  linkVerTodos: { rotulo: string; area: AreaId; aba?: string };
};

export const CATALOGO: Record<CardId, MetaCard> = {
  tarefas: {
    id: "tarefas",
    titulo: "Minhas tarefas e subtarefas",
    tipo: "principal",
    soDecide: false,
    tamanhoPadrao: "largo",
    descricaoGaleria: "Os cards e as subtarefas com o seu nome.",
    linkVerTodos: { rotulo: "Abrir o Quadro", area: "tarefas", aba: "quadro" },
  },
  publicar: {
    id: "publicar",
    titulo: "Publicar hoje",
    tipo: "principal",
    soDecide: false,
    tamanhoPadrao: "normal",
    descricaoGaleria: "Posts aprovados que saem hoje.",
    linkVerTodos: { rotulo: "Calendário", area: "posts", aba: "calendario" },
  },
  ajustar: {
    id: "ajustar",
    titulo: "Para ajustar",
    tipo: "principal",
    soDecide: false,
    tamanhoPadrao: "normal",
    descricaoGaleria: "Posts seus que voltaram com motivo de reprovação.",
    linkVerTodos: { rotulo: "Meus posts", area: "posts", aba: "meus" },
  },
  aprovar: {
    id: "aprovar",
    titulo: "Para aprovar",
    tipo: "opcional",
    soDecide: true,
    tamanhoPadrao: "normal",
    descricaoGaleria: "Posts do time esperando a sua decisão.",
    linkVerTodos: { rotulo: "Fila completa", area: "posts", aba: "aprovar" },
  },
  triagem: {
    id: "triagem",
    titulo: "Na minha triagem",
    tipo: "opcional",
    soDecide: true,
    tamanhoPadrao: "normal",
    descricaoGaleria: "Pedidos que você assumiu e ainda não decidiu, com o parecer da IA.",
    linkVerTodos: { rotulo: "Pedidos", area: "tarefas", aba: "pedidos" },
  },
  pedidos: {
    id: "pedidos",
    titulo: "Pedidos novos",
    tipo: "opcional",
    soDecide: true,
    tamanhoPadrao: "normal",
    descricaoGaleria: "Pedidos de outras áreas que ninguém assumiu ainda.",
    linkVerTodos: { rotulo: "Pedidos", area: "tarefas", aba: "pedidos" },
  },
  tendencia: {
    id: "tendencia",
    titulo: "Tendência da semana",
    tipo: "opcional",
    soDecide: false,
    tamanhoPadrao: "largo",
    descricaoGaleria: "O assunto com mais potencial que o time ainda não usou.",
    linkVerTodos: { rotulo: "Ver no radar", area: "tendencias" },
  },
  prazos: {
    id: "prazos",
    titulo: "Prazos da semana",
    tipo: "opcional",
    soDecide: false,
    tamanhoPadrao: "largo",
    descricaoGaleria: "O que vence nos próximos 7 dias, seus cards e publicações.",
    linkVerTodos: { rotulo: "Cronograma", area: "tarefas", aba: "cronograma" },
  },
  recentes: {
    id: "recentes",
    titulo: "Meus posts recentes",
    tipo: "opcional",
    soDecide: false,
    tamanhoPadrao: "normal",
    descricaoGaleria: "Os últimos posts que você mexeu e em que pé estão.",
    linkVerTodos: { rotulo: "Meus posts", area: "posts", aba: "meus" },
  },
};

export const PRINCIPAIS: CardId[] = IDS.filter((id) => CATALOGO[id].tipo === "principal");

export const ehCardId = (x: unknown): x is CardId => typeof x === "string" && (IDS as readonly string[]).includes(x);

/** R-PED-11: quem decide pedidos e posts. */
export const papelDecide = (papel: Papel) => papel === "aprovador" || papel === "admin";

/** O card existe para este papel? (grade, gaveta e galeria usam a mesma regra). */
export function cardDisponivel(id: CardId, papel: Papel): boolean {
  return !CATALOGO[id].soDecide || papelDecide(papel);
}
