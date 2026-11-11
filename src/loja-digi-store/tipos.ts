/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: .kiro/specs/loja-digi-store-brindes/design.md (seção Components and Interfaces)
 *   + Lovable src/styles.css @ leitura 2026-11-11 (commit 9a27b08).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */

export type TipoBrinde = "propriedade" | "personalizavel";
export type EstadoPedido =
  | "solicitada"
  | "em_alinhamento"
  | "pronto_para_retirada"
  | "encerrada"
  | "recusada"
  | "cancelada";
export type EtapaLinhaDoTempo = "solicitada" | "em_alinhamento" | "pronto_para_retirada" | "encerrada";
export type AndamentoLinha =
  | "em_separacao"
  | "aguardando_orcamento"
  | "orcamento_enviado"
  | "orcamento_aceito"
  | "pronta";
export type EstadoSugestao = "sugerida" | "em_analise" | "aprovada" | "recusada";
export type Visao = "diretor" | "equipe";
export type AtorPedido = "equipe" | "solicitante" | "outro";

export type AcaoPedido = "assumir" | "marcar_pronto" | "encerrar" | "recusar" | "cancelar";

export interface Categoria {
  id: string;
  rotulo: string;
}

/** Brinde (SKU). Estoque só é lido pela visão da Equipe; o diretor vê `disponivel` só em Propriedade. */
export interface Sku {
  id: string;
  nome: string;
  categoria: string;
  tipo: TipoBrinde;
  descricao: string;
  especificacoes: { rotulo: string; valor: string }[];
  foto: string; // caminho em /brindes/
  aceitaPersonalizacao: ("logo" | "nome" | "texto")[];
  custoUnitario: number | null; // só Propriedade
  saldoFisico: number; // Personalizável = 0
  reserva: number;
  minimoEstoque: number;
}

export interface LinhaCarrinho {
  chave: string;
  skuId: string;
  quantidade: number;
  personalizacao?: { texto?: string; observacao?: string; arte?: string };
}

export interface LinhaPedido {
  id: string;
  skuId: string;
  skuNome: string; // congelado na criação
  skuTipo: TipoBrinde; // congelado
  custoUnitario: number | null; // congelado
  quantidade: number;
  andamento: AndamentoLinha;
  personalizacao?: { texto?: string; observacao?: string; arte?: string };
  orcamento?: { valorTotal: number; quantidade: number; prazoDias: number };
}

export interface EventoPedido {
  em: string; // ISO
  pessoa: string;
  de: EstadoPedido | null;
  para: EstadoPedido;
  nota?: string;
}

export interface Pedido {
  id: string;
  numero: number;
  solicitante: string;
  criadoEm: string; // ISO
  finalidade: string;
  destino?: string;
  dataDesejada?: string;
  observacao?: string;
  estado: EstadoPedido;
  responsavel?: string;
  motivo?: string;
  linhas: LinhaPedido[];
  eventos: EventoPedido[];
}

/** Movimentação de estoque (tarefa 1.4). Histórico imutável; mostra pessoa e instante. */
export interface Movimento {
  id: string;
  em: string; // ISO
  skuId: string;
  tipo: "entrada" | "ajuste" | "saida";
  quantidade: number; // com sinal
  pessoa: string;
  nota: string; // origem/lote, motivo ou pedido
}

export interface Sugestao {
  id: string;
  nome: string;
  paraQueServe: string;
  qtdEstimada?: number;
  referencia?: string;
  solicitante: string;
  estado: EstadoSugestao;
  motivo?: string;
}
