// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/mock.ts (DigiPlace) e loja-digi-store/mock.ts (Digi Store), lidos em 2026-11-11; dados refeitos aqui, sem importar deles.
// Fotos: prototipos/react/public/brindes/ (conferidas no disco em 2026-11-11).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Dados fictícios. Saldo e reserva saem das movimentações e dos pedidos ativos, então a conta fecha.

import { reconstruirEstoque } from "./regras";
import type { Brinde, Estado, EstadoPedido, Evento, LinhaPedido, Movimentacao, Pedido, Pessoa, Sugestao } from "./tipos";

export const AGORA = "2026-11-11T10:00:00";
export const HOJE = AGORA.slice(0, 10);

/* ------------------------------ Pessoas ------------------------------ */

export const PESSOAS: Pessoa[] = [
  { id: "d1", nome: "Marina Costa", papel: "diretor", area: "Comercial" },
  { id: "d2", nome: "Ricardo Alves", papel: "diretor", area: "Operações" },
  { id: "d3", nome: "Helena Duarte", papel: "diretor", area: "Tecnologia" },
  { id: "d4", nome: "Paulo Martins", papel: "diretor", area: "Financeiro" },
  { id: "d5", nome: "Camila Rocha", papel: "diretor", area: "Recursos Humanos" },
  { id: "g1", nome: "Ana Beatriz Lopes", papel: "gestao" },
  { id: "g2", nome: "Felipe Moura", papel: "gestao" },
];

/* ------------------------------ Brindes ------------------------------ */

function v(id: string, rotulo: string, minimo: number) {
  return { id, rotulo, saldo: 0, reserva: 0, minimo };
}

const BRINDES_BASE: Brinde[] = [
  {
    id: "caneca", slug: "caneca-ceramica", nome: "Caneca de cerâmica", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/caneca.png", descricao: "Caneca branca com acabamento brilhante. Vai bem em reuniões e na mesa de trabalho.",
    custoUnitario: 18.9, variacoes: [v("branca", "Branca", 30), v("azul", "Azul", 20)], novidade: false, ativo: true,
  },
  {
    id: "garrafa", slug: "garrafa-termica", nome: "Garrafa térmica", tipo: "estoque", categoria: "Bem-estar",
    foto: "/brindes/garrafa.png", descricao: "Mantém a bebida gelada por 12 horas e quente por 6. Capacidade de 500 ml.",
    custoUnitario: 54, variacoes: [v("preta", "Preta", 15), v("azul", "Azul", 10)], novidade: true, ativo: true,
  },
  {
    id: "squeeze", slug: "squeeze-600", nome: "Squeeze 600 ml", tipo: "estoque", categoria: "Bem-estar",
    foto: "/brindes/squeeze.png", descricao: "Squeeze leve para o dia a dia e para eventos.",
    custoUnitario: 21.5, variacoes: [v("azul", "Azul", 25), v("laranja", "Laranja", 15)], novidade: false, ativo: true,
  },
  {
    id: "caderno", slug: "caderno-pautado", nome: "Caderno pautado A5", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/caderno.png", descricao: "Caderno pautado com elástico e 80 folhas.",
    custoUnitario: 29.9, variacoes: [v("padrao", "Padrão", 20)], novidade: false, ativo: true,
  },
  {
    id: "caderno-caneta", slug: "kit-caderno-caneta", nome: "Kit caderno e caneta", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/caderno-caneta.png", descricao: "Caderno A5 com caneta metálica em estojo.",
    custoUnitario: 44, variacoes: [v("padrao", "Padrão", 10)], novidade: true, ativo: true,
  },
  {
    id: "caneta", slug: "caneta-metalica", nome: "Caneta metálica", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/caneta.png", descricao: "Caneta esferográfica com corpo metálico e tinta azul.",
    custoUnitario: 6.5, variacoes: [v("azul", "Tinta azul", 80)], novidade: false, ativo: true,
  },
  {
    id: "bloco-adesivo", slug: "bloco-adesivo", nome: "Bloco de notas adesivo", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/bloco-adesivo.png", descricao: "Bloco de notas com adesivo, 100 folhas. Reposição em andamento.",
    custoUnitario: 9.9, variacoes: [v("padrao", "Padrão", 15)], novidade: false, ativo: true,
  },
  {
    id: "powerbank", slug: "carregador-portatil", nome: "Carregador portátil", tipo: "estoque", categoria: "Tecnologia",
    foto: "/brindes/powerbank.png", descricao: "Carrega um celular até duas vezes. Saída USB-C, bateria de 5.000 mAh.",
    custoUnitario: 62, variacoes: [v("padrao", "5.000 mAh", 10)], novidade: false, ativo: true,
  },
  {
    id: "mochila", slug: "mochila-notebook", nome: "Mochila para notebook", tipo: "estoque", categoria: "Tecnologia",
    foto: "/brindes/mochila.png", descricao: "Mochila com compartimento para notebook de até 15 polegadas.",
    custoUnitario: 118, variacoes: [v("preta", "Preta", 6), v("cinza", "Cinza", 4)], novidade: false, ativo: true,
  },
  {
    id: "camiseta", slug: "camiseta-personalizada", nome: "Camiseta personalizada", tipo: "personalizavel", categoria: "Vestuário",
    foto: "/brindes/camiseta.png",
    descricao: "Camiseta de algodão com a sua estampa. O Marketing avalia o valor conforme a quantidade e envia o orçamento antes da produção.",
    custoUnitario: null, variacoes: [v("p", "P", 0), v("m", "M", 0), v("g", "G", 0), v("gg", "GG", 0)],
    prazoExtraDiasUteis: 7, opcoesPersonalizacao: ["logo", "nome", "texto"], novidade: true, ativo: true,
  },
  {
    id: "ecobag", slug: "ecobag-personalizada", nome: "Ecobag personalizada", tipo: "personalizavel", categoria: "Vestuário",
    foto: "/brindes/ecobag.png", descricao: "Ecobag de algodão cru com logo ou texto. Valor avaliado pelo Marketing conforme a quantidade.",
    custoUnitario: null, variacoes: [v("unica", "Única", 0)],
    prazoExtraDiasUteis: 5, opcoesPersonalizacao: ["logo", "texto"], novidade: false, ativo: true,
  },
  {
    id: "chaveiro", slug: "chaveiro-gravado", nome: "Chaveiro gravado", tipo: "personalizavel", categoria: "Acessórios",
    foto: "/brindes/chaveiro.png", descricao: "Chaveiro de couro com argola de metal, gravado com logo ou nome.",
    custoUnitario: null, variacoes: [v("unico", "Único", 0)],
    prazoExtraDiasUteis: 5, opcoesPersonalizacao: ["logo", "nome"], novidade: false, ativo: true,
  },
];

const custoDe = (brindeId: string): number | null =>
  BRINDES_BASE.find((b) => b.id === brindeId)?.custoUnitario ?? null;

/* --------------------------- Movimentações --------------------------- */

/** Saldo inicial (2026-10-01) por brinde/variação. */
const SALDO_INICIAL: Record<string, number> = {
  "caneca/branca": 120, "caneca/azul": 60,
  "garrafa/preta": 40, "garrafa/azul": 25,
  "squeeze/azul": 30, "squeeze/laranja": 30,
  "caderno/padrao": 80, "caderno-caneta/padrao": 30,
  "caneta/azul": 300, "bloco-adesivo/padrao": 20,
  "powerbank/padrao": 30,
  "mochila/preta": 14, "mochila/cinza": 8,
};

let contadorMov = 0;
function mov(
  brindeId: string, variacaoId: string, tipo: Movimentacao["tipo"], qtd: number,
  quem: string, em: string, extra: Partial<Movimentacao> = {},
): Movimentacao {
  contadorMov += 1;
  return { id: `M-h${contadorMov}`, brindeId, variacaoId, tipo, qtd, quem, em, ...extra };
}

const MOVS_BASE: Movimentacao[] = [
  ...Object.entries(SALDO_INICIAL).map(([k, qtd]) => {
    const [b, vv] = k.split("/");
    return mov(b, vv, "saldo_inicial", qtd, "g1", "2026-10-01T09:00:00", { nota: "Contagem inicial do mês" });
  }),
  mov("bloco-adesivo", "padrao", "entrada", 10, "g1", "2026-10-22T14:30:00", { nota: "Reposição parcial" }),
  mov("caneca", "branca", "entrada", 40, "g2", "2026-11-02T11:00:00", { nota: "Compra de reposição" }),
  mov("caneca", "branca", "ajuste", -2, "g2", "2026-11-03T16:10:00", { nota: "Duas canecas quebradas no transporte" }),
];

/* ------------------------------- Pedidos ------------------------------ */

function lin(brindeId: string, variacaoId: string, qtd: number, extra: Partial<LinhaPedido> = {}): LinhaPedido {
  const b = BRINDES_BASE.find((x) => x.id === brindeId)!;
  return {
    brindeId, variacaoId, qtd, tipo: b.tipo,
    custoUnitarioNaHora: custoDe(brindeId),
    orcamentoAceito: false,
    ...extra,
  };
}

function evs(quem: string, passos: [EstadoPedido, string, string?][]): Evento[] {
  return passos.map(([estado, em, motivo]) => ({
    estado, em, quem: estado === "solicitada" ? quem : "g1", ...(motivo ? { motivo } : {}),
  }));
}

function pedido(
  id: string, solicitanteId: string, finalidade: string, estado: EstadoPedido,
  linhas: LinhaPedido[], historico: Evento[], extra: Partial<Pedido> = {},
): Pedido {
  const pessoa = PESSOAS.find((p) => p.id === solicitanteId)!;
  return { id, solicitanteId, areaSolicitante: pessoa.area ?? "", finalidade, linhas, estado, historico, ...extra };
}

const CAMINHO_ENCERRADO = (quem: string, criada: string, alinh: string, pronta: string, fim: string) =>
  evs(quem, [["solicitada", criada], ["em_alinhamento", alinh], ["pronto", pronta], ["encerrada", fim]]);

const PEDIDOS: Pedido[] = [
  // Retirados em outubro e novembro (entram no gasto calculado).
  pedido("P-901", "d1", "Visita a cliente em Curitiba", "encerrada",
    [lin("caneca", "branca", 20), lin("garrafa", "preta", 10)],
    CAMINHO_ENCERRADO("d1", "2026-10-05T09:10:00", "2026-10-05T15:00:00", "2026-10-07T10:00:00", "2026-10-09T11:20:00")),
  pedido("P-902", "d2", "Integração da equipe de campo", "encerrada",
    [lin("caderno", "padrao", 30), lin("caneta", "azul", 50)],
    CAMINHO_ENCERRADO("d2", "2026-10-12T08:40:00", "2026-10-13T09:00:00", "2026-10-16T10:00:00", "2026-10-20T14:00:00")),
  pedido("P-903", "d1", "Presente para clientes do trimestre", "encerrada",
    [lin("mochila", "preta", 5)],
    CAMINHO_ENCERRADO("d1", "2026-10-22T10:00:00", "2026-10-22T16:00:00", "2026-10-26T10:00:00", "2026-10-28T09:30:00")),
  pedido("P-906", "d5", "Boas-vindas para novos colaboradores", "encerrada",
    [lin("caderno-caneta", "padrao", 8)],
    CAMINHO_ENCERRADO("d5", "2026-10-08T09:00:00", "2026-10-09T09:00:00", "2026-10-13T10:00:00", "2026-10-14T10:30:00")),
  pedido("P-904", "d3", "Semana de tecnologia", "encerrada",
    [lin("powerbank", "padrao", 10), lin("caneca", "azul", 10)],
    CAMINHO_ENCERRADO("d3", "2026-10-30T09:00:00", "2026-10-30T14:00:00", "2026-11-03T10:00:00", "2026-11-04T15:00:00")),
  pedido("P-905", "d4", "Encontro anual com fornecedores", "encerrada",
    [
      lin("camiseta", "m", 20, { orcamentoUnitario: 38.5, orcamentoAceito: true, personalizacao: { texto: "Encontro 2026" } }),
      lin("squeeze", "azul", 15),
    ],
    CAMINHO_ENCERRADO("d4", "2026-10-15T09:00:00", "2026-10-16T09:00:00", "2026-11-04T10:00:00", "2026-11-06T16:00:00"),
    { dataDesejada: "2026-11-06" }),

  // Ativos.
  pedido("P-910", "d2", "Treinamento de novembro", "solicitada",
    [lin("garrafa", "azul", 5), lin("caneca", "branca", 10)],
    evs("d2", [["solicitada", "2026-11-10T16:20:00"]]),
    { dataDesejada: "2026-11-18" }),
  pedido("P-911", "d3", "Feira de inovação", "em_alinhamento",
    [lin("ecobag", "unica", 100, { orcamentoUnitario: 4.8, personalizacao: { arte: "logo-feira.svg" } })],
    evs("d3", [["solicitada", "2026-11-09T11:00:00"], ["em_alinhamento", "2026-11-10T09:00:00"]]),
    { dataDesejada: "2026-11-25" }),
  pedido("P-912", "d1", "Rodada de reuniões com parceiros", "pronto",
    [lin("squeeze", "laranja", 10), lin("chaveiro", "unico", 40, { orcamentoUnitario: 7.9, orcamentoAceito: true })],
    evs("d1", [["solicitada", "2026-10-29T09:00:00"], ["em_alinhamento", "2026-10-29T14:00:00"], ["pronto", "2026-11-09T10:00:00"]]),
    { dataDesejada: "2026-11-12" }),
  pedido("P-913", "d4", "Brinde de fim de ano para clientes", "em_alinhamento",
    [lin("camiseta", "g", 30, { personalizacao: { texto: "Boas festas" } })],
    evs("d4", [["solicitada", "2026-11-10T09:30:00"], ["em_alinhamento", "2026-11-11T08:50:00"]]),
    { dataDesejada: "2026-12-10" }),
  pedido("P-914", "d5", "Workshop de cultura", "solicitada",
    [lin("bloco-adesivo", "padrao", 30)],
    evs("d5", [["solicitada", "2026-11-11T09:00:00"]]),
    { dataDesejada: "2026-11-30" }),
  pedido("P-916", "d2", "Equipe de campo nova", "pronto",
    [lin("mochila", "preta", 6)],
    evs("d2", [["solicitada", "2026-11-04T10:00:00"], ["em_alinhamento", "2026-11-04T15:00:00"], ["pronto", "2026-11-10T10:00:00"]])),

  // Recusado e cancelado.
  pedido("P-920", "d3", "Evento interno", "recusada",
    [lin("mochila", "preta", 40)],
    evs("d3", [["solicitada", "2026-11-05T09:00:00"], ["recusada", "2026-11-05T11:00:00", "Quantidade acima do que temos em estoque. Sugerimos reduzir para 10."]])),
  pedido("P-921", "d5", "Confraternização do time", "cancelada",
    [lin("caneca", "branca", 5)],
    evs("d5", [["solicitada", "2026-11-06T09:00:00"], ["cancelada", "2026-11-07T10:00:00", "Evento adiado para o próximo mês."]])),
];

/** Cada pedido retirado gera as saídas de estoque das suas linhas de estoque. */
const MOVS_SAIDA: Movimentacao[] = PEDIDOS.filter((p) => p.estado === "encerrada").flatMap((p) => {
  const fim = p.historico.find((h) => h.estado === "encerrada")!.em;
  return p.linhas
    .filter((l) => l.tipo === "estoque")
    .map((l) => mov(l.brindeId, l.variacaoId, "saida", l.qtd, "g1", fim, { pedidoId: p.id }));
});

const MOVIMENTACOES: Movimentacao[] = [...MOVS_BASE, ...MOVS_SAIDA].sort((a, b) => a.em.localeCompare(b.em));

/* ------------------------------ Sugestões ----------------------------- */

const SUGESTOES: Sugestao[] = [
  { id: "S-1", autorId: "d1", nome: "Guarda-chuva compacto", descricao: "Para entregar em eventos de clientes na estação chuvosa.", estado: "sugerida", em: "2026-11-09T10:00:00" },
  { id: "S-2", autorId: "d3", nome: "Mouse pad ergonômico", descricao: "Para a equipe de tecnologia e visitas técnicas.", estado: "em_analise", em: "2026-11-03T15:00:00" },
  { id: "S-3", autorId: "d4", nome: "Relógio de mesa", descricao: "Brinde de fim de ano para fornecedores.", estado: "recusada", motivo: "Custo unitário acima da faixa prevista para brindes.", em: "2026-10-21T09:00:00" },
];

/* ------------------------------ Estado ------------------------------- */

export const ESTADO_INICIAL: Estado = {
  agora: AGORA,
  seq: 1001,
  pessoas: PESSOAS,
  brindes: reconstruirEstoque(BRINDES_BASE, PEDIDOS, MOVIMENTACOES),
  pedidos: PEDIDOS,
  sugestoes: SUGESTOES,
  movimentacoes: MOVIMENTACOES,
  /** Totais mock de meses já fechados (não calculados). */
  gastoFechado: { "2026-08": 2310, "2026-09": 2840 },
};

export const CATEGORIAS: string[] = [...new Set(BRINDES_BASE.map((b) => b.categoria))];
