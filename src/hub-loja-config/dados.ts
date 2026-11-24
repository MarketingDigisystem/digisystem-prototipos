// PROTÓTIPO DESCARTÁVEL — não é o app. Dados MOCK (fictícios, em memória).
// Gerado de: src/lib/loja/ (config-loja, acesso, regras, regras-datas) e src/hub/pages/loja/ (ponte-loja, acesso-loja) @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md

/** Hoje no protótipo (terça-feira). Mês atual = 2026-11. */
export const HOJE = "2026-11-24";
export const MES_ATUAL = "2026-11";

export type Papel = "admin" | "marketing";
/** "ponte_desligada" só tem efeito na Ponte (força ponteLigada = false); nas outras abas vale como "normal". */
export type EstadoProto = "normal" | "carregando" | "vazio" | "erro" | "ponte_desligada";

export interface ConfigLoja {
  local: string;
  horario: string;
  prazoRetiradaDiasUteis: number;
  prazoGuardadasDiasUteis: number;
  limiteParadoDiasUteis: number;
  gestorId: string | null;
}

export type Sinc = "sincronizado" | "pendente" | "falhou" | "sem_registro";
export interface Solicitante {
  email: string;
  nome: string;
  area: string;
  ativo: boolean;
  pedidos: number;
  sinc: Sinc;
}

export type TipoEvento =
  | "pedido.estado"
  | "catalogo.sincronizado"
  | "autorizado.sincronizado"
  | "sugestao.decidida"
  | "disponibilidade.sincronizada";
export interface EventoFila {
  id: string;
  tipo: TipoEvento;
  estado: "pendente" | "enviado" | "falhou";
  tentativas: number;
  /** ISO local (sem fuso). Só em eventos pendentes. */
  proximaTentativa: string | null;
  /** UUID do pedido (mostrado só com 8 caracteres). */
  pedidoId: string | null;
  /** Código do servidor (`http_503`, `falha_de_rede`...). */
  erro: string | null;
}
export interface Divergencia {
  pedidoId: string;
  hub: { versao: number; estado: string } | null;
  loja: { versao: number; estado: string } | null;
}

export type EstadoPedido =
  | "aguardando"
  | "em_separacao"
  | "pronto_entrega"
  | "pronto_retirada"
  | "entregue"
  | "recusada"
  | "cancelada";

export interface Brinde {
  id: string;
  nome: string;
  foto: string;
  /** Custo unitário em reais; null = sem custo cadastrado. */
  custo: number | null;
  saldo: number;
  reserva: number;
  guardadas: number;
  minimo: number;
  ativo: boolean;
}
export interface LinhaPedido {
  brindeId: string;
  qtd: number;
  custoNaHora: number | null;
}
export interface PedidoMock {
  /** Código de leitura (DS-AAMM-XXXXXX). */
  id: string;
  /** Identificador completo usado na ponte; só os 8 primeiros caracteres aparecem. */
  uuid: string;
  solicitanteEmail: string;
  solicitanteNome: string;
  area: string;
  estado: EstadoPedido;
  /** ISO local AAAA-MM-DDTHH:MM:SS. */
  criadoEm: string;
  assumidoEm?: string;
  /** Só pedidos `entregue`. */
  entregueEm?: string;
  linhas: LinhaPedido[];
}
export interface PessoaEquipe {
  id: string;
  nome: string;
}
export interface DadosMock {
  brindes: Brinde[];
  pedidos: PedidoMock[];
}

/* ------------------------------------------------------------------ */
/* Brindes (8 reais, com foto de public/brindes/)                      */
/* ------------------------------------------------------------------ */
const BASE: string = import.meta.env.BASE_URL;
export const foto = (arq: string): string => `${BASE}brindes/${arq}`;

export const BRINDES: Brinde[] = [
  { id: "b1", nome: "Copo térmico com logo Digisystem", foto: foto("copo-termico.jpg"), custo: 54, saldo: 2, reserva: 1, guardadas: 1, minimo: 0, ativo: true },
  { id: "b2", nome: "Kit churrasco 9 peças", foto: foto("kit-churrasco-aberto.jpg"), custo: 120, saldo: 1, reserva: 1, guardadas: 0, minimo: 0, ativo: true },
  { id: "b3", nome: "Caneta azul touch", foto: foto("caneta-azul-touch.jpg"), custo: 6.4, saldo: 1700, reserva: 120, guardadas: 0, minimo: 200, ativo: true },
  { id: "b4", nome: "Caderneta azul Selo 35 Anos", foto: foto("caderneta-azul-35-anos.jpg"), custo: 19.9, saldo: 14, reserva: 4, guardadas: 0, minimo: 10, ativo: true },
  { id: "b5", nome: "Caderno bambu laranja", foto: foto("caderno-bambu-laranja.jpg"), custo: 14.8, saldo: 14, reserva: 8, guardadas: 0, minimo: 8, ativo: true },
  { id: "b6", nome: "Caderno espiral Selo 35 Anos", foto: foto("caderno-espiral-35-anos.jpg"), custo: 14.8, saldo: 22, reserva: 6, guardadas: 0, minimo: 5, ativo: true },
  { id: "b7", nome: "Caderneta azul Digisystem", foto: foto("caderneta-azul-digisystem.jpg"), custo: null, saldo: 37, reserva: 0, guardadas: 0, minimo: 0, ativo: true },
  { id: "b8", nome: "Estojo de churrasco", foto: foto("estojo-churrasco-fechado.jpg"), custo: 45, saldo: 1, reserva: 0, guardadas: 0, minimo: 0, ativo: false },
];

/* ------------------------------------------------------------------ */
/* Equipe (candidatos a Gestor) e Solicitantes                         */
/* ------------------------------------------------------------------ */
export const EQUIPE: PessoaEquipe[] = [
  { id: "3f1c2a10-5b7e-4c1d-9a21-0d6e8f4a1b01", nome: "Ariadne Lima" },
  { id: "3f1c2a10-5b7e-4c1d-9a21-0d6e8f4a1b02", nome: "Felipe Puertas" },
  { id: "3f1c2a10-5b7e-4c1d-9a21-0d6e8f4a1b03", nome: "Fernando Alvarez" },
  { id: "3f1c2a10-5b7e-4c1d-9a21-0d6e8f4a1b04", nome: "Marcelo Lucas" },
  { id: "3f1c2a10-5b7e-4c1d-9a21-0d6e8f4a1b05", nome: "Fernando Pires" },
];

const ALINE = { email: "aline.castro@digisystem.com.br", nome: "Aline Castro", area: "Marketing" };
const THIAGO = { email: "thiago.reis@digisystem.com.br", nome: "Thiago Reis", area: "Energia e Utilities" };
const RAFAEL = { email: "rafael.lima@digisystem.com.br", nome: "Rafael Lima", area: "Saúde" };
const JULIANA = { email: "juliana.prado@digisystem.com.br", nome: "Juliana Prado", area: "Pessoas e Cultura" };
const PATRICIA = { email: "patricia.ramos@digisystem.com.br", nome: "Patrícia Ramos", area: "Governo" };

/* ------------------------------------------------------------------ */
/* Pedidos (14). Hoje = 2026-11-24 (terça).                            */
/* Parado = estado "aguardando" e dias úteis em (criadoEm, hoje] > limite. */
/* ------------------------------------------------------------------ */
const uuidDe = (n: number): string => {
  const h = n.toString(16).padStart(2, "0");
  return `${h}a4c7e1-3b52-4d08-9e6f-5a1b2c3d4e${h}`;
};
const custo = (id: string): number | null => BRINDES.find((b) => b.id === id)?.custo ?? null;
const l = (brindeId: string, qtd: number): LinhaPedido => ({ brindeId, qtd, custoNaHora: custo(brindeId) });

export const PEDIDOS: PedidoMock[] = [
  { id: "DS-2611-A1B2C3", uuid: uuidDe(1), solicitanteEmail: ALINE.email, solicitanteNome: ALINE.nome, area: ALINE.area, estado: "entregue",
    criadoEm: "2026-11-03T09:00:00", assumidoEm: "2026-11-03T11:30:00", entregueEm: "2026-11-05T10:00:00", linhas: [l("b1", 2)] },
  { id: "DS-2611-D4E5F6", uuid: uuidDe(2), solicitanteEmail: THIAGO.email, solicitanteNome: THIAGO.nome, area: THIAGO.area, estado: "entregue",
    criadoEm: "2026-11-04T14:00:00", assumidoEm: "2026-11-05T09:00:00", entregueEm: "2026-11-07T10:00:00", linhas: [l("b3", 50)] },
  { id: "DS-2611-G7H8J9", uuid: uuidDe(3), solicitanteEmail: RAFAEL.email, solicitanteNome: RAFAEL.nome, area: RAFAEL.area, estado: "entregue",
    criadoEm: "2026-11-06T08:00:00", assumidoEm: "2026-11-06T09:00:00", entregueEm: "2026-11-10T10:00:00", linhas: [l("b4", 5), l("b2", 1)] },
  { id: "DS-2611-K1L2M3", uuid: uuidDe(4), solicitanteEmail: ALINE.email, solicitanteNome: ALINE.nome, area: ALINE.area, estado: "entregue",
    criadoEm: "2026-11-11T15:00:00", assumidoEm: "2026-11-12T10:00:00", entregueEm: "2026-11-14T10:00:00", linhas: [l("b3", 30), l("b6", 4)] },
  // Aguardando há 5 dias úteis (18, 19, 20, 23 e 24): parado com qualquer limite até 4.
  { id: "DS-2611-N4P5Q6", uuid: uuidDe(5), solicitanteEmail: RAFAEL.email, solicitanteNome: RAFAEL.nome, area: RAFAEL.area, estado: "aguardando",
    criadoEm: "2026-11-17T10:00:00", linhas: [l("b5", 8)] },
  // Já assumido: nunca conta como parado, por mais antigo que seja.
  { id: "DS-2611-R7S8T9", uuid: uuidDe(6), solicitanteEmail: JULIANA.email, solicitanteNome: JULIANA.nome, area: JULIANA.area, estado: "em_separacao",
    criadoEm: "2026-11-18T09:30:00", assumidoEm: "2026-11-19T10:00:00", linhas: [l("b3", 20)] },
  { id: "DS-2611-U1V2W3", uuid: uuidDe(7), solicitanteEmail: PATRICIA.email, solicitanteNome: PATRICIA.nome, area: PATRICIA.area, estado: "pronto_retirada",
    criadoEm: "2026-11-14T11:00:00", assumidoEm: "2026-11-17T09:00:00", linhas: [l("b6", 6)] },
  // Aguardando há 3 dias úteis (20, 23 e 24): parado com limite 2, não parado com limite 3 ou mais.
  { id: "DS-2611-X4Y5Z6", uuid: uuidDe(8), solicitanteEmail: ALINE.email, solicitanteNome: ALINE.nome, area: ALINE.area, estado: "aguardando",
    criadoEm: "2026-11-19T08:30:00", linhas: [l("b1", 1)] },
  { id: "DS-2611-B7C8D9", uuid: uuidDe(9), solicitanteEmail: THIAGO.email, solicitanteNome: THIAGO.nome, area: THIAGO.area, estado: "recusada",
    criadoEm: "2026-11-10T16:00:00", linhas: [l("b2", 2)] },
  { id: "DS-2610-E1F2G3", uuid: uuidDe(10), solicitanteEmail: JULIANA.email, solicitanteNome: JULIANA.nome, area: JULIANA.area, estado: "entregue",
    criadoEm: "2026-10-06T10:00:00", assumidoEm: "2026-10-07T10:00:00", entregueEm: "2026-10-08T10:00:00", linhas: [l("b3", 70)] },
  { id: "DS-2610-H4J5K6", uuid: uuidDe(11), solicitanteEmail: RAFAEL.email, solicitanteNome: RAFAEL.nome, area: RAFAEL.area, estado: "entregue",
    criadoEm: "2026-10-13T09:00:00", assumidoEm: "2026-10-13T15:00:00", entregueEm: "2026-10-15T10:00:00", linhas: [l("b1", 3), l("b5", 4)] },
  { id: "DS-2610-L7M8N9", uuid: uuidDe(12), solicitanteEmail: THIAGO.email, solicitanteNome: THIAGO.nome, area: THIAGO.area, estado: "entregue",
    criadoEm: "2026-10-20T14:00:00", assumidoEm: "2026-10-21T09:00:00", entregueEm: "2026-10-22T10:00:00", linhas: [l("b2", 1)] },
  { id: "DS-2609-P1Q2R3", uuid: uuidDe(13), solicitanteEmail: PATRICIA.email, solicitanteNome: PATRICIA.nome, area: PATRICIA.area, estado: "entregue",
    criadoEm: "2026-09-15T10:00:00", assumidoEm: "2026-09-15T14:00:00", entregueEm: "2026-09-18T10:00:00", linhas: [l("b4", 6)] },
  { id: "DS-2609-S4T5U6", uuid: uuidDe(14), solicitanteEmail: JULIANA.email, solicitanteNome: JULIANA.nome, area: JULIANA.area, estado: "entregue",
    criadoEm: "2026-09-22T09:00:00", assumidoEm: "2026-09-23T09:00:00", entregueEm: "2026-09-25T10:00:00", linhas: [l("b3", 40)] },
];

export const DADOS_MOCK: DadosMock = { brindes: BRINDES, pedidos: PEDIDOS };

/** Pedidos de um Solicitante, contados dos 14 pedidos do mock (nunca um número solto). */
const contarPedidos = (email: string): number => PEDIDOS.filter((p) => p.solicitanteEmail === email).length;

/** 8 Solicitantes: cobre os 4 estados de sincronização, "Sem área", "1 pedido", "0 pedidos" e revogado.
 *  Bruno e Mariana têm pedidos antigos (anteriores a setembro) que não entram nos 14 do mock. */
export const SOLICITANTES_INICIAIS: Solicitante[] = [
  { ...ALINE, ativo: true, pedidos: contarPedidos(ALINE.email), sinc: "sincronizado" },
  { ...THIAGO, ativo: true, pedidos: contarPedidos(THIAGO.email), sinc: "sincronizado" },
  { ...RAFAEL, ativo: true, pedidos: contarPedidos(RAFAEL.email), sinc: "sincronizado" },
  { ...JULIANA, ativo: true, pedidos: contarPedidos(JULIANA.email), sinc: "pendente" },
  { ...PATRICIA, ativo: true, pedidos: contarPedidos(PATRICIA.email), sinc: "sincronizado" },
  { email: "felipe.andrade@digisystem.com.br", nome: "Felipe Andrade", area: "Comercial", ativo: true, pedidos: 0, sinc: "falhou" },
  { email: "bruno.teixeira@digisystem.com.br", nome: "Bruno Teixeira", area: "Tecnologia", ativo: false, pedidos: 2, sinc: "sem_registro" },
  { email: "mariana.souza@digisystem.com.br", nome: "Mariana Souza", area: "", ativo: true, pedidos: 1, sinc: "sincronizado" },
];

/* ------------------------------------------------------------------ */
/* Ponte: fila (6), divergências (2), última sincronização (5)         */
/* ------------------------------------------------------------------ */
export const FILA_INICIAL: EventoFila[] = [
  { id: "evt-1", tipo: "pedido.estado", estado: "pendente", tentativas: 0, proximaTentativa: null, pedidoId: uuidDe(5), erro: null },
  { id: "evt-2", tipo: "autorizado.sincronizado", estado: "pendente", tentativas: 1, proximaTentativa: "2026-11-24T14:35:00", pedidoId: null, erro: null },
  { id: "evt-3", tipo: "pedido.estado", estado: "falhou", tentativas: 3, proximaTentativa: null, pedidoId: uuidDe(7), erro: "http_503" },
  { id: "evt-4", tipo: "catalogo.sincronizado", estado: "falhou", tentativas: 2, proximaTentativa: null, pedidoId: null, erro: "falha_de_rede" },
  { id: "evt-5", tipo: "sugestao.decidida", estado: "falhou", tentativas: 5, proximaTentativa: null, pedidoId: null, erro: "tipo_sem_rota" },
  { id: "evt-6", tipo: "autorizado.sincronizado", estado: "falhou", tentativas: 4, proximaTentativa: null, pedidoId: null, erro: "http_422" },
];
/** Eventos já enviados (só entram no contador; a fila real mostra apenas pendentes e falhos). */
export const ENVIADOS_INICIAL = 128;

/** Divergências reais entre Hub e Loja (aparecem ao Reconciliar). */
export const DIVERGENCIAS_INICIAL: Divergencia[] = [
  { pedidoId: uuidDe(7), hub: { versao: 4, estado: "pronto_retirada" }, loja: { versao: 3, estado: "em_separacao" } },
  { pedidoId: uuidDe(15), hub: null, loja: { versao: 2, estado: "entregue" } },
];

export const ULTIMA_SINCRONIZACAO: Record<TipoEvento, string> = {
  "pedido.estado": "2026-11-24T09:12:00",
  "catalogo.sincronizado": "2026-11-23T17:40:00",
  "autorizado.sincronizado": "2026-11-24T08:05:00",
  "sugestao.decidida": "2026-11-20T11:25:00",
  "disponibilidade.sincronizada": "2026-11-24T07:30:00",
};

/** Último envio da disponibilidade (resumo da seção "Disponibilidade dos brindes"). */
export const ULTIMO_ENVIO_DISPONIBILIDADE = ULTIMA_SINCRONIZACAO["disponibilidade.sincronizada"];
