// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Arquivos_temporarios_for_AI/Marketplace/ (fotos oficiais) e design.md (seção "Catálogo oficial e fotos"), lidos em 2026-11-12; dados refeitos aqui.
// Fotos: prototipos/react/public/brindes/ (geradas por scripts/otimizar-fotos.py).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Dados fictícios: preços, saldos e mínimos são de protótipo [DEPENDE DE OK DO USUÁRIO para os reais].
// Saldo e reserva saem das movimentações e dos pedidos ativos, então a conta fecha.
// Saldo único por brinde (Req. 11). P-2006 e P-2007 estão acima do estoque (reserva parcial e pendente, Req. 15).

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

// Saldo e reserva nascem 0 aqui e são recalculados por `reconstruirEstoque` a partir das movimentações e dos pedidos.
const BRINDES_BASE: Brinde[] = [
  {
    id: "kit-churrasco", slug: "kit-churrasco-personalizado", nome: "Kit churrasco personalizado", tipo: "personalizavel", categoria: "Casa e lazer",
    foto: "/brindes/kit-churrasco-aberto.jpg", fotoExtra: "/brindes/estojo-churrasco-fechado.jpg",
    descricao:
      "Estojo preto com garfo, espátula, pegador, faca, espetos e pincel de silicone em aço inox. A placa metálica do estojo recebe a gravação do logo do cliente. O Marketing avalia o valor conforme a quantidade e envia o orçamento antes da produção.",
    custoUnitario: null, saldo: 0, reserva: 0, minimo: 0,
    prazoExtraDiasUteis: 7, opcoesPersonalizacao: ["logo", "nome"], novidade: false, ativo: true,
  },
  {
    id: "caderno-bambu", slug: "caderno-de-bambu-com-caneta", nome: "Caderno de bambu com caneta", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/caderno-bambu-laranja.jpg",
    descricao: "Caderno com capa de bambu e elástico laranja, acompanhado de caneta de bambu. Ótimo para reuniões e eventos.",
    custoUnitario: 38.9, saldo: 0, reserva: 0, minimo: 30, novidade: false, ativo: true,
  },
  {
    id: "caneta-azul-touch", slug: "caneta-azul-touch", nome: "Caneta azul touch", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/caneta-azul-touch.jpg",
    descricao: "Caneta azul com ponta touch para telas, tinta azul e corpo leve.",
    custoUnitario: 6.4, saldo: 0, reserva: 0, minimo: 100, novidade: false, ativo: true,
  },
  {
    id: "caderno-espiral-35", slug: "caderno-espiral-35-anos", nome: "Caderno espiral 35 anos", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/caderno-espiral-35-anos.jpg",
    descricao: "Caderno espiral azul com a marca comemorativa dos 35 anos da Digisystem.",
    custoUnitario: 14.8, saldo: 0, reserva: 0, minimo: 40, novidade: true, ativo: true,
  },
  {
    id: "caderneta-digisystem", slug: "caderneta-azul-digisystem", nome: "Caderneta azul Digisystem", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/caderneta-azul-digisystem.jpg",
    descricao: "Caderneta azul com elástico, trazendo as marcas Digisystem e do parceiro Ingram na capa.",
    custoUnitario: 22.5, saldo: 0, reserva: 0, minimo: 50, novidade: false, ativo: true,
  },
  {
    id: "caderneta-35", slug: "caderneta-azul-35-anos", nome: "Caderneta azul 35 anos", tipo: "estoque", categoria: "Escritório",
    foto: "/brindes/caderneta-azul-35-anos.jpg",
    descricao: "Caderneta azul com a marca comemorativa dos 35 anos da Digisystem.",
    custoUnitario: 19.9, saldo: 0, reserva: 0, minimo: 30, novidade: true, ativo: true,
  },
  {
    id: "copo-termico", slug: "copo-termico-digisystem", nome: "Copo térmico Digisystem", tipo: "estoque", categoria: "Bem-estar",
    foto: "/brindes/copo-termico.jpg",
    descricao: "Copo térmico preto de aço inox com a marca Digisystem gravada. Mantém a bebida na temperatura por horas.",
    custoUnitario: 54, saldo: 0, reserva: 0, minimo: 15, novidade: false, ativo: true,
  },
];

const custoDe = (brindeId: string): number | null =>
  BRINDES_BASE.find((b) => b.id === brindeId)?.custoUnitario ?? null;

/* --------------------------- Movimentações --------------------------- */

/** Saldo inicial (2026-10-01) por brinde de estoque. */
const SALDO_INICIAL: Record<string, number> = {
  "caderno-bambu": 100,
  "caneta-azul-touch": 400,
  "caderno-espiral-35": 80,
  "caderneta-digisystem": 260,
  "caderneta-35": 85,
  "copo-termico": 30,
};

let contadorMov = 0;
function mov(
  brindeId: string, tipo: Movimentacao["tipo"], qtd: number,
  quem: string, em: string, extra: Partial<Movimentacao> = {},
): Movimentacao {
  contadorMov += 1;
  return { id: `M-h${contadorMov}`, brindeId, tipo, qtd, quem, em, ...extra };
}

const MOVS_BASE: Movimentacao[] = [
  ...Object.entries(SALDO_INICIAL).map(([brindeId, qtd]) =>
    mov(brindeId, "saldo_inicial", qtd, "g1", "2026-10-01T09:00:00", { nota: "Contagem inicial do mês" }),
  ),
  mov("caderno-bambu", "entrada", 20, "g1", "2026-10-22T14:30:00", { nota: "Reposição do fornecedor" }),
  mov("copo-termico", "entrada", 10, "g2", "2026-11-02T11:00:00", { nota: "Compra de reposição" }),
  mov("caderno-espiral-35", "ajuste", -10, "g2", "2026-11-03T16:10:00", { nota: "Dez cadernos com defeito na capa" }),
  mov("caneta-azul-touch", "ajuste", -100, "g2", "2026-11-05T10:30:00", { nota: "Lote com tinta falhando, descartado" }),
];

/* ------------------------------- Pedidos ------------------------------ */

/** Por padrão a linha de estoque nasce toda reservada; o personalizável fica 0/0. `pedido()` ajusta recusados e cancelados. */
function lin(brindeId: string, qtd: number, extra: Partial<LinhaPedido> = {}): LinhaPedido {
  const b = BRINDES_BASE.find((x) => x.id === brindeId)!;
  const base: LinhaPedido = {
    brindeId, qtd, tipo: b.tipo,
    qtdReservada: b.tipo === "estoque" ? qtd : 0,
    qtdPendente: 0,
    acimaDoEstoque: false,
    custoUnitarioNaHora: custoDe(brindeId),
    orcamentoAceito: false,
    ...extra,
  };
  return { ...base, acimaDoEstoque: base.qtdPendente > 0 };
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
  // Recusado e cancelado liberam a reserva e descartam o pendente (Req. 15.13).
  const liberado = estado === "recusada" || estado === "cancelada";
  const linhasFinais = liberado
    ? linhas.map((l) => ({ ...l, qtdReservada: 0, qtdPendente: 0, acimaDoEstoque: false }))
    : linhas;
  return {
    id, solicitanteId, areaSolicitante: pessoa.area ?? "", finalidade, linhas: linhasFinais, estado, historico,
    acimaDoEstoque: linhasFinais.some((l) => l.acimaDoEstoque),
    cienteAcimaEstoque: false,
    ...extra,
  };
}

const CAMINHO_ENCERRADO = (quem: string, criada: string, alinh: string, pronta: string, fim: string) =>
  evs(quem, [["solicitada", criada], ["em_alinhamento", alinh], ["pronto", pronta], ["encerrada", fim]]);

const PEDIDOS: Pedido[] = [
  // Retirados: um em outubro (mês anterior) e um em novembro (entram no gasto calculado).
  pedido("P-2010", "d1", "Presente para clientes do trimestre", "encerrada",
    [lin("caderneta-digisystem", 60)],
    CAMINHO_ENCERRADO("d1", "2026-10-12T08:40:00", "2026-10-13T09:00:00", "2026-10-16T10:00:00", "2026-10-20T14:00:00")),
  pedido("P-2001", "d2", "Integração da equipe de campo", "encerrada",
    [lin("caneta-azul-touch", 300)],
    CAMINHO_ENCERRADO("d2", "2026-10-28T09:10:00", "2026-10-28T15:00:00", "2026-10-30T10:00:00", "2026-11-03T11:20:00")),

  // Recusado e cancelado.
  pedido("P-2002", "d3", "Semana de tecnologia", "recusada",
    [lin("copo-termico", 10)],
    evs("d3", [["solicitada", "2026-11-05T09:00:00"], ["recusada", "2026-11-05T11:00:00", "Verba da área já utilizada neste trimestre. Podemos reavaliar no próximo."]])),
  pedido("P-2003", "d1", "Visita a cliente em Curitiba", "cancelada",
    [lin("caderneta-digisystem", 20)],
    evs("d1", [["solicitada", "2026-11-06T09:00:00"], ["cancelada", "2026-11-07T10:00:00", "A visita foi adiada para o próximo mês."]])),

  // Ativos.
  pedido("P-2004", "d5", "Boas-vindas para novos colaboradores", "pronto",
    [lin("caderneta-35", 25)],
    evs("d5", [["solicitada", "2026-11-04T10:00:00"], ["em_alinhamento", "2026-11-04T15:00:00"], ["pronto", "2026-11-10T10:00:00"]]),
    { dataDesejada: "2026-11-14" }),
  pedido("P-2005", "d4", "Encontro anual com fornecedores", "em_alinhamento",
    [
      lin("kit-churrasco", 30, { orcamentoUnitario: 185, orcamentoAceito: true, personalizacao: { texto: "Logo e nome: Encontro Digisystem 2026", arte: "logo-encontro.svg" } }),
      lin("caderno-bambu", 8),
    ],
    evs("d4", [["solicitada", "2026-11-09T11:00:00"], ["em_alinhamento", "2026-11-10T09:00:00"]]),
    { dataDesejada: "2026-12-04" }),
  // Acima do estoque: pede 50, 30 reservadas e 20 pendentes de reposição (o diretor deu ciência ao enviar).
  pedido("P-2006", "d2", "Treinamento de novembro", "em_alinhamento",
    [lin("caderno-espiral-35", 50, { qtdReservada: 30, qtdPendente: 20 })],
    evs("d2", [["solicitada", "2026-11-09T16:20:00"], ["em_alinhamento", "2026-11-10T10:00:00"]]),
    { dataDesejada: "2026-11-24", cienteAcimaEstoque: true }),
  // Caneta sem saldo: tudo pendente (nada reservado).
  pedido("P-2007", "d5", "Ação de campo no fim do mês", "solicitada",
    [lin("caneta-azul-touch", 150, { qtdReservada: 0, qtdPendente: 150 })],
    evs("d5", [["solicitada", "2026-11-11T08:30:00"]]),
    { dataDesejada: "2026-11-27", cienteAcimaEstoque: true }),
  pedido("P-2008", "d1", "Reuniões com parceiros", "solicitada",
    [lin("caderno-bambu", 10), lin("copo-termico", 12)],
    evs("d1", [["solicitada", "2026-11-10T16:20:00"]]),
    { dataDesejada: "2026-11-18" }),
  pedido("P-2009", "d3", "Feira de inovação", "solicitada",
    [lin("caderno-espiral-35", 15), lin("caderneta-digisystem", 40)],
    evs("d3", [["solicitada", "2026-11-11T09:00:00"]]),
    { dataDesejada: "2026-11-30" }),
];

/** Cada pedido retirado gera as saídas de estoque das suas linhas de estoque. */
const MOVS_SAIDA: Movimentacao[] = PEDIDOS.filter((p) => p.estado === "encerrada").flatMap((p) => {
  const fim = p.historico.find((h) => h.estado === "encerrada")!.em;
  return p.linhas
    .filter((l) => l.tipo === "estoque")
    .map((l) => mov(l.brindeId, "saida", l.qtd, "g1", fim, { pedidoId: p.id }));
});

const MOVIMENTACOES: Movimentacao[] = [...MOVS_BASE, ...MOVS_SAIDA].sort((a, b) => a.em.localeCompare(b.em));

/* ------------------------------ Sugestões ----------------------------- */

const SUGESTOES: Sugestao[] = [
  { id: "S-1", autorId: "d1", nome: "Porta-cartão de couro", descricao: "Para entregar em visitas a clientes e em eventos.", estado: "sugerida", em: "2026-11-09T10:00:00" },
  { id: "S-2", autorId: "d3", nome: "Almofada de pescoço", descricao: "Para a equipe que viaja a campo e a feiras.", estado: "aprovada", em: "2026-11-03T15:00:00" },
  { id: "S-3", autorId: "d4", nome: "Kit de sementes", descricao: "Brinde de fim de ano para fornecedores.", estado: "recusada", motivo: "Custo unitário acima da faixa prevista para brindes.", em: "2026-10-21T09:00:00" },
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
