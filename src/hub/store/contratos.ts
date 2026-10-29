/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: .kiro/specs/kanban-asana-hub/design.md (seção "Components and
 *   Interfaces", Componente 1 e Componente 5) + prototipos/.../store/{tipos.ts,
 *   regras.ts,HubStore.tsx} @ leitura 2026-10-16.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente:
 *   .kiro/specs/kanban-asana-hub/design.md
 *   docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * CONTRATOS DE DOMÍNIO DO KANBAN (Perna 2 — Task 5.1).
 *
 * Este módulo NÃO redefine tipos: ele reúne, num único ponto, os tipos de
 * domínio que a UI do Kanban consome e formaliza as duas interfaces que o
 * design pede e que ainda não existiam como tipo nomeado no protótipo:
 *   - `HubStore`        — o contrato do adaptador de regras (dados + acoes + sel);
 *   - `ColunaDescriptor`— descritor das 5 colunas fixas do Quadro.
 *
 * A implementação concreta do protótipo (`useHub()` em HubStore.tsx) é SÍNCRONA
 * (store em memória, sem rede). O contrato `HubStore` abaixo descreve a forma
 * DURÁVEL do adaptador real (Perna 2, Task 8), em que cada ação persiste contra
 * os hooks reais (`use-tasks`/`use-posts`) e por isso é assíncrona
 * (`Promise<Resultado>`), conforme o design. O adaptador do protótipo satisfaz
 * um subconjunto síncrono deste contrato; o real satisfaz o contrato completo.
 */

// ─── Tipos de domínio do Kanban (reexportados — fonte única em tipos.ts) ────
// Reexporta, não redefine: a verdade dos tipos continua em `tipos.ts`.
export type {
  Card,
  Subtarefa,
  Problema,
  OrigemCard,
  ColunaBase,
  Post,
  DadosHub,
} from "./tipos";

// ─── Tipos de regra (reexportados — fonte única em regras.ts) ───────────────
export type {
  Resultado,
  Coluna,
  Pendente,
  EstadoPostExibido,
  ResumoCard,
} from "./regras";
export { NIVEL_MAXIMO, COLUNAS } from "./regras";

import type {
  Card,
  Post,
} from "./tipos";
import type {
  Coluna,
  EstadoPostExibido,
  Pendente,
  Resultado,
} from "./regras";

// ─── ColunaDescriptor (design: Componente 1) ───────────────────────────────

/**
 * Descritor de cada uma das 5 colunas fixas do Quadro.
 * `recebidos` e `problemas` são CALCULADAS: ninguém arrasta para dentro nem para
 * fora delas (`calculada: true` ⇒ `aceitaDrop: false`). O card entra/sai dessas
 * colunas sozinho, por derivação de `colunaDoCard`.
 */
export interface ColunaDescriptor {
  id: Coluna;
  label: string;
  /** `recebidos` e `problemas`: true → coluna derivada, não aceita arraste. */
  calculada: boolean;
  /** false para `recebidos`/`problemas` (espelha `calculada`). */
  aceitaDrop: boolean;
}

/**
 * As 5 colunas na ordem do Quadro. Recebidos e Problemas calculadas (read-only
 * para drag); A fazer, Em andamento e Concluído aceitam drop.
 * (A lista `COLUNAS` de regras.ts tem só id+label; esta carrega as flags de drag.)
 */
export const COLUNAS_KANBAN: readonly ColunaDescriptor[] = [
  { id: "recebidos", label: "Recebidos", calculada: true, aceitaDrop: false },
  { id: "afazer", label: "A fazer", calculada: false, aceitaDrop: true },
  { id: "andamento", label: "Em andamento", calculada: false, aceitaDrop: true },
  { id: "concluido", label: "Concluído", calculada: false, aceitaDrop: true },
  { id: "problemas", label: "Problemas", calculada: true, aceitaDrop: false },
] as const;

// ─── HubStore (design: Componente 5) ────────────────────────────────────────

/**
 * Alvo de um problema que pode ser bloqueado à mão: o card inteiro ou uma
 * subtarefa (nunca o post direto — o reprovado do post é aberto por quem aprova).
 */
export type AlvoBloqueio = { tipo: "card" | "subtarefa"; id: string };

/** Decisão possível de um pedido externo na Triagem. */
export type DecisaoPedidoKanban = "aprovado" | "devolvido" | "negado";

/**
 * Ações do HubStore. Toda ação valida com a regra pura correspondente ANTES de
 * persistir e devolve `Resultado` (`{ok:true}` ou `{ok:false, motivo}` com texto
 * pronto para a tela). A UI NUNCA chama a regra pura direto — só estas ações.
 * No adaptador real (Task 8) a persistência é assíncrona (daí `Promise`).
 */
export interface HubStoreAcoes {
  /** Valida com `podeMover` → `aplicarMovimento`; persiste só coluna_base/rank/concluido_manual_em. */
  moverCard(cardId: string, destino: Coluna): Promise<Resultado>;
  /** Recusa acima de NIVEL_MAXIMO (3) e em pedido ainda não decidido. */
  criarSubtarefa(paiId: string, titulo: string): Promise<Resultado>;
  /** Não-clicável quando a subtarefa tem post (conclui sozinha ao publicar). */
  concluirSubtarefa(subId: string, concluir: boolean): Promise<Resultado>;
  /** Motivo obrigatório; abre um Problema calculado. */
  marcarBloqueado(alvo: AlvoBloqueio, motivo: string): Promise<Resultado>;
  /** Só o "Bloqueado" fecha à mão; reprovado/aguardando fecham sozinhos. */
  resolverProblema(problemaId: string): Promise<Resultado>;
  /** 1 post = 1 item; só se o item estiver livre e o pedido do card decidido. */
  associarPost(postId: string, itemId: string): Promise<Resultado>;
  /** Só em rascunho/reprovado; depois de enviado fica travado. */
  desassociarPost(postId: string): Promise<Resultado>;
  /** Barra se houver post associado no item ou nos descendentes. */
  excluirItem(itemId: string): Promise<Resultado>;
  /** Quem abriu o pedido não decide o próprio; motivo exigido em devolvido/negado. */
  decidirPedido(cardId: string, decisao: DecisaoPedidoKanban, motivo?: string): Promise<Resultado>;
}

/**
 * Seletores do HubStore: regras de leitura já ligadas aos dados atuais.
 * Lista mínima exigida pelo design; o adaptador expõe os demais seletores do
 * protótipo (`...demais seletores`), por isso a assinatura é aberta via index.
 */
export interface HubStoreSel {
  /** Coluna derivada do card, ou `null` (fora do quadro: pedido negado). */
  colunaDoCard(card: Card): Coluna | null;
  /** Cards distribuídos pela coluna derivada. */
  cardsPorColuna(): Record<Coluna, Card[]>;
  /** O que ainda falta no card (subtarefas, posts, o próprio card sem conteúdo). */
  pendentesDoCard(card: Card): Pendente[];
  /** O card parou por inteiro? (problema no card ou todo pendente travado). */
  cardParou(card: Card): boolean;
  /** Estado do post como aparece no card/subtarefa/calendário, contra "hoje". */
  estadoPostExibido(post: Post, hoje: string): EstadoPostExibido;
  /** Demais seletores do protótipo (resumoCard, alertaDoCard, podeMover, ...). */
  [outros: string]: unknown;
}

/**
 * Contrato do adaptador de regras. Ponte entre a UI nova e as ~120 regras do
 * protótipo. No protótipo, `dados` vem do mock; no app real, é montado dos
 * hooks reais (`use-tasks`/`use-posts`) com a MESMA semântica das regras.
 */
export interface HubStore {
  /** Montado dos hooks reais (não do mock) no adaptador da Perna 2. */
  dados: import("./tipos").DadosHub;
  acoes: HubStoreAcoes;
  sel: HubStoreSel;
}
