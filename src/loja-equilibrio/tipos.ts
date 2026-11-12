// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ (DigiPlace) e loja-digi-store/ (Digi Store) deste protótipo, lidos em 2026-11-11; não importa código delas.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.

export type TipoBrinde = "estoque" | "personalizavel";

export type OpcaoPersonalizacao = "texto" | "arte" | "logo" | "nome";

export interface Pessoa {
  id: string;
  nome: string;
  papel: "diretor" | "gestao";
  /** Área do diretor (só no mock); base do gasto por área. */
  area?: string;
}

export interface Variacao {
  id: string;
  rotulo: string;
  saldo: number;
  reserva: number;
  minimo: number;
}

export interface Brinde {
  id: string;
  slug: string;
  nome: string;
  tipo: TipoBrinde;
  categoria: string;
  foto: string;
  descricao: string;
  /** null no Personalizável: o valor sai do orçamento. */
  custoUnitario: number | null;
  variacoes: Variacao[];
  /** Só no Personalizável. */
  quantidadeMinima?: number;
  /** Só no Personalizável. */
  prazoExtraDiasUteis?: number;
  opcoesPersonalizacao?: OpcaoPersonalizacao[];
  novidade: boolean;
  ativo: boolean;
}

export type EstadoPedido = "solicitada" | "em_alinhamento" | "pronto" | "encerrada" | "recusada" | "cancelada";

export interface Evento {
  estado: EstadoPedido;
  quem: string;
  /** ISO com hora, ex.: 2026-11-11T10:00:00 */
  em: string;
  motivo?: string;
  nota?: string;
}

export interface LinhaPedido {
  brindeId: string;
  variacaoId: string;
  qtd: number;
  tipo: TipoBrinde;
  /** Gravado na criação. null no Personalizável. */
  custoUnitarioNaHora: number | null;
  personalizacao?: { texto?: string; arte?: string };
  /** Orçamento informado pelo Marketing, dentro da linha. */
  orcamentoUnitario?: number;
  orcamentoAceito: boolean;
  notaAjuste?: string;
}

export interface Pedido {
  id: string;
  solicitanteId: string;
  areaSolicitante: string;
  finalidade: string;
  destino?: string;
  observacao?: string;
  /** Opcional (AAAA-MM-DD). Se preenchida, respeita o prazo mínimo. */
  dataDesejada?: string;
  linhas: LinhaPedido[];
  estado: EstadoPedido;
  historico: Evento[];
}

export type EstadoSugestao = "sugerida" | "em_analise" | "aprovada" | "recusada";

export interface Sugestao {
  id: string;
  autorId: string;
  nome: string;
  descricao: string;
  estado: EstadoSugestao;
  motivo?: string;
  em: string;
}

export type TipoMovimentacao = "saldo_inicial" | "entrada" | "saida" | "ajuste";

export interface Movimentacao {
  id: string;
  brindeId: string;
  variacaoId: string;
  tipo: TipoMovimentacao;
  /** Positivo em saldo_inicial, entrada e saida (a saída subtrai); com sinal no ajuste. */
  qtd: number;
  quem: string;
  em: string;
  pedidoId?: string;
  nota?: string;
}

export interface Estado {
  /** ISO com hora; "hoje" = agora.slice(0, 10). */
  agora: string;
  seq: number;
  pessoas: Pessoa[];
  brindes: Brinde[];
  pedidos: Pedido[];
  sugestoes: Sugestao[];
  movimentacoes: Movimentacao[];
  /** "AAAA-MM" → total mock de meses fechados. */
  gastoFechado: Record<string, number>;
}

export interface DadosPedido {
  solicitanteId: string;
  finalidade: string;
  destino?: string;
  observacao?: string;
  dataDesejada?: string;
}

export interface LinhaEntrada {
  brindeId: string;
  variacaoId: string;
  qtd: number;
  personalizacao?: { texto?: string; arte?: string };
}

export interface ValorPedido {
  valor: number;
  /** Linhas personalizáveis sem orçamento aceito. */
  aAvaliar: number;
}

export interface LinhaGasto {
  chave: string;
  rotulo: string;
  valor: number;
  pedidos: number;
  unidades: number;
}

export interface Metricas {
  mes: string;
  mesAnterior: string;
  fechado: boolean;
  gasto: number;
  gastoMesAnterior: number;
  unidadesRetiradas: number;
  prontosUnidades: number;
  /** Custo dos prontos aguardando retirada (nada é debitado nesta fase). */
  custoProntosAguardando: number;
  linhasAAvaliar: number;
  porSolicitante: LinhaGasto[];
  porArea: LinhaGasto[];
  pedidosEncerrados: string[];
}

export type Urgencia = "sem_data" | "atrasada" | "urgente" | "proxima" | "normal";

export interface HistoricoBrinde {
  brindeId: string;
  saldoInicial: number;
  entradas: number;
  saidas: number;
  ajustes: number;
  saldoCalculado: number;
  saldoAtual: number;
  reserva: number;
  disponivel: number;
  /** saldoInicial + entradas − saídas + ajustes = saldo atual. */
  fecha: boolean;
  movimentacoes: Movimentacao[];
}
