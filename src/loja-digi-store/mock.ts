/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (modelo de SKU/pedido). Dados FICTÍCIOS, sem Supabase e sem segredo.
 * Fotos: prototipos/react/public/brindes/ (tarefa 1.2 completa as que faltarem).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import type { Categoria, Movimento, Pedido, Sku, Sugestao } from "./tipos";

export const PESSOA_DIRETOR = "Ana Souza";
export const PESSOA_EQUIPE = "Ariadne Lima";

export const CATEGORIAS: Categoria[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "escritorio", rotulo: "Escritório" },
  { id: "vestuario", rotulo: "Vestuário" },
  { id: "bolsas", rotulo: "Bolsas" },
  { id: "copos", rotulo: "Copos e garrafas" },
  { id: "tecnologia", rotulo: "Tecnologia" },
];

export const SKUS_INICIAIS: Sku[] = [
  {
    id: "caneca-ceramica", nome: "Caneca de cerâmica 300 ml", categoria: "copos", tipo: "propriedade",
    descricao: "Caneca branca com acabamento brilhante. Vai bem em reuniões e na mesa de trabalho.",
    especificacoes: [{ rotulo: "Capacidade", valor: "300 ml" }, { rotulo: "Material", valor: "Cerâmica" }],
    foto: "/brindes/caneca.png", aceitaPersonalizacao: [], custoUnitario: 18.9, saldoFisico: 120, reserva: 12, minimoEstoque: 30,
  },
  {
    id: "garrafa-termica", nome: "Garrafa térmica 500 ml", categoria: "copos", tipo: "propriedade",
    descricao: "Mantém a bebida gelada por 12 horas e quente por 6.",
    especificacoes: [{ rotulo: "Capacidade", valor: "500 ml" }, { rotulo: "Material", valor: "Aço inox" }],
    foto: "/brindes/garrafa.png", aceitaPersonalizacao: [], custoUnitario: 54, saldoFisico: 40, reserva: 6, minimoEstoque: 20,
  },
  {
    id: "squeeze", nome: "Squeeze 600 ml", categoria: "copos", tipo: "propriedade",
    descricao: "Squeeze leve para o dia a dia e para eventos.",
    especificacoes: [{ rotulo: "Capacidade", valor: "600 ml" }],
    foto: "/brindes/squeeze.png", aceitaPersonalizacao: [], custoUnitario: 21.5, saldoFisico: 8, reserva: 2, minimoEstoque: 25,
  },
  {
    id: "caderno-capa-dura", nome: "Caderno capa dura A5", categoria: "escritorio", tipo: "propriedade",
    descricao: "Caderno pautado com elástico e 80 folhas.",
    especificacoes: [{ rotulo: "Formato", valor: "A5" }, { rotulo: "Folhas", valor: "80" }],
    foto: "/brindes/caderno.png", aceitaPersonalizacao: [], custoUnitario: 29.9, saldoFisico: 75, reserva: 10, minimoEstoque: 20,
  },
  {
    id: "kit-caderno-caneta", nome: "Kit caderno e caneta", categoria: "escritorio", tipo: "propriedade",
    descricao: "Caderno A5 com caneta metálica em estojo.",
    especificacoes: [{ rotulo: "Itens", valor: "2" }],
    foto: "/brindes/caderno-caneta.png", aceitaPersonalizacao: [], custoUnitario: 44, saldoFisico: 30, reserva: 4, minimoEstoque: 10,
  },
  {
    id: "caneta-metal", nome: "Caneta metálica azul", categoria: "escritorio", tipo: "propriedade",
    descricao: "Caneta esferográfica com corpo metálico e tinta azul.",
    especificacoes: [{ rotulo: "Tinta", valor: "Azul" }],
    foto: "/brindes/caneta.png", aceitaPersonalizacao: [], custoUnitario: 6.5, saldoFisico: 300, reserva: 40, minimoEstoque: 80,
  },
  {
    id: "bloco-adesivo", nome: "Bloco de notas adesivo", categoria: "escritorio", tipo: "propriedade",
    descricao: "Bloco de notas com adesivo, 100 folhas. Reposição em andamento.",
    especificacoes: [{ rotulo: "Folhas", valor: "100" }],
    foto: "/brindes/bloco-adesivo.png", aceitaPersonalizacao: [], custoUnitario: 9.9, saldoFisico: 20, reserva: 20, minimoEstoque: 15,
  },
  {
    id: "powerbank", nome: "Carregador portátil 5.000 mAh", categoria: "tecnologia", tipo: "propriedade",
    descricao: "Carrega um celular até duas vezes. Saída USB-C.",
    especificacoes: [{ rotulo: "Bateria", valor: "5.000 mAh" }],
    foto: "/brindes/powerbank.png", aceitaPersonalizacao: [], custoUnitario: 62, saldoFisico: 25, reserva: 5, minimoEstoque: 10,
  },
  {
    id: "mochila", nome: "Mochila executiva", categoria: "bolsas", tipo: "propriedade",
    descricao: "Mochila com compartimento para notebook de até 15 polegadas.",
    especificacoes: [{ rotulo: "Notebook", valor: "até 15\"" }],
    foto: "/brindes/mochila.png", aceitaPersonalizacao: [], custoUnitario: 118, saldoFisico: 14, reserva: 3, minimoEstoque: 6,
  },
  {
    id: "camiseta-personalizada", nome: "Camiseta de algodão", categoria: "vestuario", tipo: "personalizavel",
    descricao: "Camiseta com a sua estampa. O Marketing avalia o valor conforme a quantidade e envia o orçamento antes da produção.",
    especificacoes: [{ rotulo: "Tecido", valor: "Algodão" }, { rotulo: "Tamanhos", valor: "P ao GG" }],
    foto: "/brindes/camiseta.png", aceitaPersonalizacao: ["logo", "nome", "texto"], custoUnitario: null, saldoFisico: 0, reserva: 0, minimoEstoque: 0,
  },
  {
    id: "ecobag-personalizada", nome: "Ecobag de algodão cru", categoria: "bolsas", tipo: "personalizavel",
    descricao: "Ecobag com logo ou texto. Valor avaliado pelo Marketing conforme a quantidade.",
    especificacoes: [{ rotulo: "Material", valor: "Algodão cru" }],
    foto: "/brindes/ecobag.png", aceitaPersonalizacao: ["logo", "texto"], custoUnitario: null, saldoFisico: 0, reserva: 0, minimoEstoque: 0,
  },
  {
    id: "chaveiro-personalizado", nome: "Chaveiro personalizado", categoria: "escritorio", tipo: "personalizavel",
    descricao: "Chaveiro gravado com logo ou nome.",
    especificacoes: [{ rotulo: "Acabamento", valor: "Couro com argola de metal" }],
    foto: "/brindes/chaveiro.png", aceitaPersonalizacao: ["logo", "nome"], custoUnitario: null, saldoFisico: 0, reserva: 0, minimoEstoque: 0,
  },
];

const iso = (d: number, h = 10) => new Date(Date.UTC(2026, 10, d, h)).toISOString();

export const PEDIDOS_INICIAIS: Pedido[] = [
  {
    id: "p-1042", numero: 1042, solicitante: PESSOA_DIRETOR, criadoEm: iso(5), finalidade: "Visita de clientes em Curitiba",
    estado: "pronto_para_retirada", responsavel: PESSOA_EQUIPE,
    linhas: [
      { id: "l1", skuId: "caneca-ceramica", skuNome: "Caneca de cerâmica 300 ml", skuTipo: "propriedade", custoUnitario: 18.9, quantidade: 10, andamento: "pronta" },
    ],
    eventos: [
      { em: iso(5), pessoa: PESSOA_DIRETOR, de: null, para: "solicitada" },
      { em: iso(6), pessoa: PESSOA_EQUIPE, de: "solicitada", para: "em_alinhamento" },
      { em: iso(9), pessoa: PESSOA_EQUIPE, de: "em_alinhamento", para: "pronto_para_retirada" },
    ],
  },
  {
    id: "p-1043", numero: 1043, solicitante: PESSOA_DIRETOR, criadoEm: iso(9), finalidade: "Evento de fim de ano",
    dataDesejada: "2026-12-04", estado: "em_alinhamento", responsavel: PESSOA_EQUIPE,
    linhas: [
      { id: "l2", skuId: "camiseta-personalizada", skuNome: "Camiseta de algodão", skuTipo: "personalizavel", custoUnitario: null, quantidade: 80, andamento: "orcamento_enviado", personalizacao: { texto: "Parceria que transforma" }, orcamento: { valorTotal: 3120, quantidade: 80, prazoDias: 12 } },
      { id: "l3", skuId: "caneta-metal", skuNome: "Caneta metálica azul", skuTipo: "propriedade", custoUnitario: 6.5, quantidade: 80, andamento: "em_separacao" },
    ],
    eventos: [
      { em: iso(9), pessoa: PESSOA_DIRETOR, de: null, para: "solicitada" },
      { em: iso(10), pessoa: PESSOA_EQUIPE, de: "solicitada", para: "em_alinhamento" },
    ],
  },
  {
    id: "p-1044", numero: 1044, solicitante: "Carlos Mendes", criadoEm: iso(10), finalidade: "Boas-vindas a novos parceiros",
    estado: "solicitada",
    linhas: [{ id: "l4", skuId: "garrafa-termica", skuNome: "Garrafa térmica 500 ml", skuTipo: "propriedade", custoUnitario: 54, quantidade: 6, andamento: "em_separacao" }],
    eventos: [{ em: iso(10, 15), pessoa: "Carlos Mendes", de: null, para: "solicitada" }],
  },
];

export const SUGESTOES_INICIAIS: Sugestao[] = [
  { id: "s-1", nome: "Ventilador de mesa USB", paraQueServe: "Dias quentes nos eventos externos", qtdEstimada: 40, solicitante: PESSOA_DIRETOR, estado: "em_analise" },
];

/** Histórico de estoque fictício (tarefa 1.4). */
export const MOVIMENTOS_INICIAIS: Movimento[] = [
  { id: "m-3", em: iso(8, 14), skuId: "squeeze", tipo: "ajuste", quantidade: -4, pessoa: PESSOA_EQUIPE, nota: "Inventário: 4 unidades com defeito" },
  { id: "m-2", em: iso(4, 9), skuId: "caneca-ceramica", tipo: "entrada", quantidade: 60, pessoa: PESSOA_EQUIPE, nota: "Lote 2026-10, fornecedor Brindes Sul" },
  { id: "m-1", em: iso(2, 11), skuId: "caneta-metal", tipo: "entrada", quantidade: 200, pessoa: PESSOA_EQUIPE, nota: "Lote 2026-10, fornecedor Brindes Sul" },
];
