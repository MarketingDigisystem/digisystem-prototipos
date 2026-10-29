// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// v4 (DigiPlace): dois trilhos de pedido, sem o antigo conceito de "sem saldo / Para aprovar".
// - PRONTA ENTREGA: item com saldo sai na hora (baixa imediata), nasce "pronto" e, na retirada,
//   vira "encerrado" (débito do centro de custo). Item esgotado não é pedível como pronta entrega.
// - ENCOMENDA (sob demanda): produção externa, quantidade mínima e fluxo de alinhamento
//   (encomenda_solicitada → em_alinhamento → confirmada → em_producao → pronto → encerrado).
//   Um item vira encomenda por cadastro (flag "disponível sob encomenda") ou por uma SUGESTÃO
//   aprovada que entra no catálogo.
// - SUGESTÃO DE ITEM: qualquer usuário sugere um brinde que não existe; o marketing analisa e,
//   se aprovar, ele vira um item de encomenda no catálogo.

export type CategoriaId = "vestuario" | "bebidas" | "escritorio" | "tecnologia" | "sustentaveis";
export type SeloProduto = "mais-pedido" | "novidade";
export type IconeProduto =
  | "garrafa" | "caneca" | "copo" | "camiseta" | "moletom" | "bone" | "caderno" | "caneta"
  | "mochila" | "powerbank" | "carregador" | "mousepad" | "cracha" | "ecobag" | "semente"
  | "bloco" | "squeeze" | "chaveiro" | "folder";

export type FundoFoto = "navy-sky" | "sky-orange" | "navy-escuro" | "neutro";
export type AnguloFoto = "frente" | "detalhe" | "uso" | "embalagem";

export interface Foto {
  angulo: AnguloFoto;
  legenda: string;
  fundo: FundoFoto;
  /** Caminho da foto real servida pelo Vite (ex.: /brindes/moleskine.png). Sem isso,
   *  cai no placeholder de marca. */
  src?: string;
  /** Caminho de um PDF real servido pelo Vite (ex.: /brindes/folder-digisystem.pdf).
   *  Quando presente, a galeria mostra a 1ª página do PDF via <embed> (o Chromium
   *  renderiza PDF nativo), com `src` como imagem de fallback. */
  pdf?: string;
}

export type Tamanho = "P" | "M" | "G" | "GG";

export interface CorProduto {
  nome: string;
  hex: string;
}

/** Saldo é por variação. Produto sem variação tem uma única variação "Único". */
export interface Variacao {
  id: string;
  rotulo: string;
  cor?: CorProduto;
  tamanho?: Tamanho;
  saldo: number;
  minimo: number;
}

export type AceitaPersonalizacao = "logo" | "nome" | "texto";

export interface OpcaoPersonalizacao {
  tecnica: string;
  area: string;
  qtdMinima: number;
  prazoExtraDiasUteis: number;
  aceita: AceitaPersonalizacao[];
}

export interface UsoAnterior {
  evento: string;
  centroCustoId: CentroCustoId;
  qtd: number;
  em: string; // AAAA-MM-DD
}

export interface Produto {
  id: string;
  slug: string;
  nome: string;
  categoria: CategoriaId;
  icone: IconeProduto;
  galeria: Foto[];
  descricaoCurta: string;
  descricaoLonga: string[];
  especificacoes: { rotulo: string; valor: string }[];
  custoUnitario: number;
  variacoes: Variacao[];
  personalizacao?: OpcaoPersonalizacao;
  selos: SeloProduto[];
  cadastradoEm: string;
  ativo: boolean;
  usos: UsoAnterior[];
  /** v4: o produto aceita encomenda sob demanda (back-office marca "disponível sob encomenda"). */
  aceitaEncomenda?: boolean;
  /** Quantidade mínima quando `aceitaEncomenda`. Sem isso, cai na constante QTD_MINIMA_ENCOMENDA. */
  encomendaMinima?: number;
  /** Item sem estoque próprio: só existe por encomenda (não tem trilho de pronta entrega). */
  somenteEncomenda?: boolean;
  /** Quando o item nasceu de uma sugestão aprovada, guarda o id da sugestão (informativo). */
  origemSugestao?: string;
}

// Fluxo v4 — dois trilhos num único enum (`tipoPedido` diz qual renderizar):
// - Pronta entrega: "pronto" → "encerrado" (nasce pronto porque só se pede o que tem saldo).
// - Encomenda: "encomenda_solicitada" → "em_alinhamento" → "confirmada" → "em_producao"
//   → "pronto" → "encerrado".
// - Desvios: "negado" (só encomenda), "cancelado" (ambos, até antes de encerrar).
export type StatusPedido =
  | "encomenda_solicitada"
  | "em_alinhamento"
  | "confirmada"
  | "em_producao"
  | "pronto"
  | "encerrado"
  | "negado"
  | "cancelado";

export type TipoPedido = "pronta" | "encomenda";
export type Finalidade = "evento" | "cliente" | "parceiro" | "interno";

export interface Personalizacao {
  texto: string;
  arteNome?: string;
}

export interface ItemPedido {
  produtoId: string;
  variacaoId: string;
  qtd: number;
  custoUnitarioNaHora: number;
  personalizacao?: Personalizacao;
}

export interface EventoPedido {
  status: StatusPedido;
  em: string; // AAAA-MM-DDTHH:mm
  porId: string;
  nota?: string;
}

/** Dados de alinhamento da encomenda (produção sob demanda). */
export interface DadosEncomenda {
  prazoDesejado?: string;
  observacoesPersonalizacao?: string;
  quantidadeAlinhada?: number;
  prazoConfirmado?: string;
}

export interface Pedido {
  id: string;
  solicitanteId: string;
  centroCustoId: CentroCustoId;
  itens: ItemPedido[];
  finalidade: Finalidade;
  destino: string;
  dataNecessaria: string;
  localRetirada: string;
  observacao?: string;
  status: StatusPedido;
  tipoPedido: TipoPedido;
  encomenda?: DadosEncomenda;
  motivo?: string;
  historico: EventoPedido[];
  criadoEm: string;
}

// v4: entrada (+saldo), saída/baixa (−saldo, na saída imediata da pronta entrega),
// ajuste (±saldo, inventário) e saldo-inicial (linha de abertura para a conta fechar).
export type TipoMov = "saldo-inicial" | "entrada" | "saida" | "ajuste";

/** qtd com sinal. Todas as movimentações mexem no saldo físico. */
export interface Movimentacao {
  id: string;
  em: string;
  produtoId: string;
  variacaoId: string;
  tipo: TipoMov;
  qtd: number;
  pedidoId?: string;
  destino: string;
  porId: string;
}

export type CentroCustoId = "MKT-DIR" | "COM-DIR" | "RH-DIR" | "TI-DIR" | "FIN-DIR";

export interface CentroCusto {
  id: CentroCustoId;
  area: string;
  diretorId: string;
}

export type Papel = "diretor" | "implementacao" | "aprovador" | "designer";

export interface Usuario {
  id: string;
  nome: string;
  papel: Papel;
  centroCustoId?: CentroCustoId;
  iniciais: string;
}

export interface ItemCarrinho {
  chave: string;
  produtoId: string;
  variacaoId: string;
  qtd: number;
  personalizacao?: Personalizacao;
}

// Sugestão de item (mini-feature v4): nasce "sugerida", o marketing analisa e aprova (vira
// item de encomenda) ou recusa (com motivo).
export type StatusSugestao = "sugerida" | "em_analise" | "aprovada" | "recusada";

export interface EventoSugestao {
  status: StatusSugestao;
  em: string;
  porId: string;
}

export interface Sugestao {
  id: string;
  nome: string;
  descricao: string;
  referencia?: string;
  qtdEstimada?: number;
  status: StatusSugestao;
  motivo?: string;
  sugeridaPorId: string;
  criadaEm: string;
  historico: EventoSugestao[];
  /** Quando aprovada, o id do produto de encomenda gerado no catálogo. */
  produtoGeradoId?: string;
}

export interface EstadoLoja {
  produtos: Produto[];
  pedidos: Pedido[];
  movimentos: Movimentacao[];
  sugestoes: Sugestao[];
}

export interface RascunhoCheckout {
  finalidade: Finalidade;
  destino: string;
  dataNecessaria: string;
  observacao: string;
}
