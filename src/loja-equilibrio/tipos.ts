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

export interface Brinde {
  id: string;
  slug: string;
  nome: string;
  tipo: TipoBrinde;
  categoria: string;
  foto: string;
  /** Segunda foto, mostrada só na galeria da página do brinde. */
  fotoExtra?: string;
  descricao: string;
  /** null no Personalizável: o valor sai do orçamento. */
  custoUnitario: number | null;
  /** Saldo físico, reserva e mínimo de estoque do brinde. Só no brinde de estoque; no Personalizável ficam 0 e são ignorados. */
  saldo: number;
  reserva: number;
  minimo: number;
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
  /** "reposicao" marca a reserva do que chegou (só gestão); sem `tipo` é uma transição de estado comum. */
  tipo?: "reposicao";
}

export interface LinhaPedido {
  brindeId: string;
  qtd: number;
  tipo: TipoBrinde;
  /** Quantidade com reserva garantida (estoque). Sempre 0 no Personalizável. qtdReservada + qtdPendente = qtd enquanto o pedido está ativo. */
  qtdReservada: number;
  /** Quantidade que aguarda reposição de estoque. Sempre 0 no Personalizável. */
  qtdPendente: number;
  /** Verdadeiro enquanto qtdPendente > 0. */
  acimaDoEstoque: boolean;
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
  /** Alguma linha tem quantidade pendente. */
  acimaDoEstoque: boolean;
  /** O diretor marcou a ciência de que o prazo será maior ao enviar. */
  cienteAcimaEstoque: boolean;
}

export type EstadoSugestao = "sugerida" | "em_analise" | "aprovada" | "recusada";

export type Frequencia = "uma_vez" | "todo_mes" | "trimestral" | "anual";
export type FaixaCusto = "ate_10" | "10_30" | "30_60" | "60_120" | "acima_120" | "nao_sei";
export type ComLogo = "com_logo" | "sem_logo" | "nao_sei";

export interface Sugestao {
  id: string;
  autorId: string;
  nome: string;
  descricao: string;
  estado: EstadoSugestao;
  motivo?: string;
  em: string;
  /** Categoria do catálogo ou "Outra". */
  categoria?: string;
  /** Até 280 caracteres. */
  porQueCombina?: string;
  /** URL http ou https. */
  link?: string;
  /** Só o nome do arquivo no protótipo. */
  fotoReferencia?: string;
  ocasioes?: string[];
  publicos?: string[];
  /** AAAA-MM-DD, não anterior a hoje no envio. */
  dataNecessaria?: string;
  frequencia?: Frequencia;
  /** Inteiro maior ou igual a 1. */
  quantidadeEstimada?: number;
  faixaCusto?: FaixaCusto;
  comLogo?: ComLogo;
}

/** Dados do formulário de sugestão: só o nome é obrigatório. */
export type DadosSugestao = Omit<Sugestao, "id" | "autorId" | "estado" | "motivo" | "em" | "descricao"> & { descricao?: string };

export type TipoMovimentacao = "saldo_inicial" | "entrada" | "saida" | "ajuste";

export interface Movimentacao {
  id: string;
  brindeId: string;
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

/** Dados do cadastro de brinde: saldo e reserva nunca vêm do formulário; `saldoInicial` só vale na criação. */
export type DadosBrinde = Omit<Brinde, "saldo" | "reserva"> & { saldoInicial?: number };

export interface LinhaEntrada {
  brindeId: string;
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
  /** Só gestão: pedidos em Recebido ou Em preparação com quantidade pendente. */
  pedidosAcimaDoEstoque: number;
  /** Só gestão: soma da quantidade pendente desses pedidos. */
  unidadesPendentes: number;
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
