// PROTÓTIPO DESCARTÁVEL — não é o app. Dados MOCK.
// Catálogo e fotos são os brindes reais da Digi Store; pessoas, pedidos e movimentações são exemplos.
// Fonte da verdade = Lovable/GitHub. Decisão: docs-marketing-hub/implementacao/analise-redesign-loja-hub-2026-11-19.md
import { HOJE, somarDias, somarDiasUteis, type Estado, type Recebimento } from "./regras";

const BASE = import.meta.env.BASE_URL;
export const foto = (arq: string) => `${BASE}brindes/${arq}`;

export interface Brinde {
  id: string; nome: string; categoria: string; foto: string | null; fotoExtra?: string | null;
  /** Custo unitário; null = sem preço (o rascunho nasce assim). */
  custo: number | null;
  saldo: number; reserva: number; guardadas: number; minimo: number; maximoPorPedido: number | null; ativo: boolean;
  descricao?: string; novidade?: boolean;
  /** Brinde criado automaticamente ao aprovar uma sugestão. Fica inativo, fora da vitrine e do Estoque, até ser publicado. */
  rascunho?: { sugestaoId: string; sugeridoPor: string };
}
export const BRINDES: Brinde[] = [
  { id: "b1", nome: "Copo térmico com logo Digisystem", categoria: "Bem-estar", foto: foto("copo-termico.jpg"), custo: 54, saldo: 2, reserva: 2, guardadas: 0, minimo: 0, maximoPorPedido: null, ativo: true },
  { id: "b2", nome: "Kit churrasco 9 peças", categoria: "Casa e lazer", foto: foto("kit-churrasco-aberto.jpg"), custo: 120, saldo: 1, reserva: 1, guardadas: 0, minimo: 0, maximoPorPedido: 1, ativo: true },
  { id: "b3", nome: "Caneta azul touch", categoria: "Escritório", foto: foto("caneta-azul-touch.jpg"), custo: 6.4, saldo: 1700, reserva: 68, guardadas: 0, minimo: 200, maximoPorPedido: 50, ativo: true },
  { id: "b4", nome: "Caderneta azul Selo 35 Anos", categoria: "Escritório", foto: foto("caderneta-azul-35-anos.jpg"), custo: 19.9, saldo: 35, reserva: 7, guardadas: 0, minimo: 10, maximoPorPedido: 10, ativo: true },
  { id: "b5", nome: "Caderno bambu laranja", categoria: "Escritório", foto: foto("caderno-bambu-laranja.jpg"), custo: 14.8, saldo: 9, reserva: 4, guardadas: 0, minimo: 0, maximoPorPedido: null, ativo: true },
  { id: "b6", nome: "Caderno espiral Selo 35 Anos", categoria: "Escritório", foto: foto("caderno-espiral-35-anos.jpg"), custo: 14.8, saldo: 20, reserva: 8, guardadas: 0, minimo: 5, maximoPorPedido: null, ativo: true },
  { id: "b7", nome: "Caderneta azul Digisystem", categoria: "Escritório", foto: foto("caderneta-azul-digisystem.jpg"), custo: 22.5, saldo: 37, reserva: 3, guardadas: 0, minimo: 0, maximoPorPedido: null, ativo: true },
  { id: "b8", nome: "Estojo de churrasco", categoria: "Casa e lazer", foto: foto("estojo-churrasco-fechado.jpg"), custo: 45, saldo: 1, reserva: 0, guardadas: 0, minimo: 0, maximoPorPedido: null, ativo: false },
];

const DESCRICAO: Record<string, string> = {
  b1: "Copo térmico em aço inox, com tampa e logo Digisystem gravado a laser.",
  b2: "Estojo com 9 peças em aço inox para churrasco, em bolsa com zíper.",
  b3: "Caneta esferográfica azul com ponta touch para tela.",
  b4: "Caderneta de capa dura azul com o selo de 35 anos da Digisystem.",
  b5: "Caderno com capa de bambu e detalhes em laranja.",
  b6: "Caderno espiral azul com o selo de 35 anos.",
  b7: "Caderneta azul com elástico e o logo Digisystem.",
  b8: "Estojo de churrasco em lona, fechado com fivela.",
};
for (const b of BRINDES) b.descricao = DESCRICAO[b.id];
BRINDES.push({
  id: "b9", nome: "Caneca de cerâmica 35 anos", categoria: "Bem-estar", foto: null, custo: null, saldo: 0, reserva: 0, guardadas: 0,
  minimo: 0, maximoPorPedido: null, ativo: false, descricao: "Caneca branca de cerâmica com o selo de 35 anos.",
  rascunho: { sugestaoId: "s6", sugeridoPor: "Mariana Souza" },
});

export type EstadoSugestao = "aberta" | "aprovada" | "recusada";
export interface Sugestao {
  id: string; nome: string; categoria: string; descricao: string; porQueCombina: string; link: string;
  ocasioes: string[]; publicos: string[]; dataNecessaria: string; quantidadeEstimada: number | null; faixaCusto: string;
  pessoa: string; email: string; area: string; estado: EstadoSugestao; motivo: string; criadoEm: string; brindeRascunhoId?: string;
}
export const ROTULO_FAIXA: Record<string, string> = {
  ate_10: "Até R$ 10", "10_30": "De R$ 10 a R$ 30", "30_60": "De R$ 30 a R$ 60", "60_120": "De R$ 60 a R$ 120", acima_120: "Acima de R$ 120", nao_sei: "Não sei",
};
const sg = (s: Partial<Sugestao> & Pick<Sugestao, "id" | "nome" | "pessoa" | "email" | "area" | "criadoEm">): Sugestao => ({
  categoria: "", descricao: "", porQueCombina: "", link: "", ocasioes: [], publicos: [], dataNecessaria: "", quantidadeEstimada: null,
  faixaCusto: "", estado: "aberta", motivo: "", ...s,
});
export const SUGESTOES: Sugestao[] = [
  sg({ id: "s1", nome: "Squeeze térmico 500 ml", categoria: "Bem-estar", descricao: "Garrafa térmica em aço inox, 500 ml, com logo gravado.",
    porQueCombina: "Combina com o kit dos eventos de saúde e com o calendário de visitas do projeto Tasy.", link: "https://exemplo.com.br/squeeze-500",
    ocasioes: ["Eventos", "Visitas a clientes"], publicos: ["Hospitais"], dataNecessaria: "2026-12-10", quantidadeEstimada: 30, faixaCusto: "30_60",
    pessoa: "Rafael Lima", email: "rafael.lima@digisystem.com.br", area: "Saúde", criadoEm: "2026-11-17T10:20:00" }),
  sg({ id: "s2", nome: "Carregador portátil com logo", categoria: "Tecnologia", descricao: "Bateria externa de 10.000 mAh com o logo Digisystem.",
    quantidadeEstimada: 50, pessoa: "Juliana Prado", email: "juliana.prado@digisystem.com.br", area: "Pessoas e Cultura", criadoEm: "2026-11-12T15:05:00" }),
  sg({ id: "s3", nome: "Garrafa térmica inox", categoria: "Bem-estar", porQueCombina: "Os clientes de governo pedem brinde útil para o dia a dia.",
    ocasioes: ["Reuniões"], faixaCusto: "30_60", pessoa: "Patrícia Ramos", email: "patricia.ramos@digisystem.com.br", area: "Governo", criadoEm: "2026-11-05T09:40:00" }),
  sg({ id: "s4", nome: "Mochila executiva", categoria: "Escritório", descricao: "Mochila para notebook de até 15 polegadas, cor azul-marinho.",
    porQueCombina: "Para os diretores levarem nas visitas a clientes grandes.", ocasioes: ["Visitas a clientes"], publicos: ["Diretoria de clientes"],
    quantidadeEstimada: 15, faixaCusto: "acima_120", pessoa: "Felipe Andrade", email: "felipe.andrade@digisystem.com.br", area: "Comercial", criadoEm: "2026-11-10T11:00:00" }),
  sg({ id: "s5", nome: "Boné bordado", categoria: "Vestuário", pessoa: "Bruno Teixeira", email: "bruno.teixeira@digisystem.com.br", area: "Tecnologia",
    estado: "recusada", motivo: "Vestuário não está no plano de brindes de 2026.", criadoEm: "2026-10-28T14:30:00" }),
  sg({ id: "s6", nome: "Caneca de cerâmica 35 anos", categoria: "Bem-estar", descricao: "Caneca branca de cerâmica com o selo de 35 anos.",
    ocasioes: ["Eventos"], quantidadeEstimada: 100, pessoa: "Mariana Souza", email: "mariana.souza@digisystem.com.br", area: "Comercial",
    estado: "aprovada", criadoEm: "2026-11-03T16:10:00", brindeRascunhoId: "b9" }),
];

export type EstadoMais = "aberta" | "vamos_repor" | "nao_repor" | "outra_opcao";
export interface MaisUnidades {
  id: string; brindeId: string; qtd: number; motivo: string; pessoa: string; area: string; estado: EstadoMais;
  previsao: string; motivoResposta: string; alternativoId: string; criadoEm: string;
}
const mu = (m: Partial<MaisUnidades> & Pick<MaisUnidades, "id" | "brindeId" | "qtd" | "pessoa" | "area" | "criadoEm">): MaisUnidades => ({
  motivo: "", estado: "aberta", previsao: "", motivoResposta: "", alternativoId: "", ...m,
});
export const MAIS: MaisUnidades[] = [
  mu({ id: "m1", brindeId: "b1", qtd: 10, motivo: "Feira de saúde em dezembro.", pessoa: "Aline Castro", area: "Marketing", estado: "vamos_repor", previsao: "2026-11-28", criadoEm: "2026-11-14T10:00:00" }),
  mu({ id: "m2", brindeId: "b2", qtd: 2, motivo: "Visita ao cliente da Energisa.", pessoa: "Thiago Reis", area: "Energia e Utilities", estado: "vamos_repor", previsao: "2026-11-26", criadoEm: "2026-11-17T15:20:00" }),
  mu({ id: "m3", brindeId: "b3", qtd: 80, motivo: "Treinamento de novos colaboradores, turma de dezembro.", pessoa: "Juliana Prado", area: "Pessoas e Cultura", criadoEm: "2026-11-18T09:30:00" }),
  mu({ id: "m4", brindeId: "b5", qtd: 20, motivo: "Kit para o congresso de saúde digital.", pessoa: "Rafael Lima", area: "Saúde", criadoEm: "2026-11-19T08:45:00" }),
];

export type TipoMov = "saldo_inicial" | "entrada" | "saida" | "ajuste";
export interface Mov { id: string; brindeId: string; tipo: TipoMov; qtd: number; em: string; nota: string | null }
const mes = (m: string, d = "10") => `2026-${m}-${d}`;
let seq = 0;
const mv = (brindeId: string, tipo: TipoMov, qtd: number, em: string, nota: string | null = null): Mov => ({ id: `m${++seq}`, brindeId, tipo, qtd, em, nota });
export const MOVS: Mov[] = [
  mv("b1", "saldo_inicial", 20, mes("05", "02"), "Compra inicial"),
  mv("b1", "saida", 2, mes("06")), mv("b1", "saida", 4, mes("07")), mv("b1", "saida", 3, mes("08")),
  mv("b1", "saida", 5, mes("09")), mv("b1", "saida", 2, mes("10")), mv("b1", "saida", 2, mes("11", "12"), "Pedido DS-0390"),
  mv("b3", "saldo_inicial", 2000, mes("05", "02"), "Compra inicial"),
  mv("b3", "saida", 40, mes("06")), mv("b3", "saida", 60, mes("07")), mv("b3", "saida", 50, mes("08")),
  mv("b3", "saida", 70, mes("09")), mv("b3", "saida", 50, mes("10")), mv("b3", "saida", 30, mes("11", "05")),
  mv("b4", "saldo_inicial", 50, mes("06", "01")), mv("b4", "saida", 3, mes("07")), mv("b4", "saida", 5, mes("09")),
  mv("b4", "saida", 4, mes("10")), mv("b4", "saida", 3, mes("11", "03")),
  mv("b5", "saldo_inicial", 20, mes("06", "01")), mv("b5", "saida", 4, mes("08")), mv("b5", "saida", 3, mes("10")),
  mv("b5", "saida", 4, mes("11", "08")),
  mv("b6", "saldo_inicial", 30, mes("06", "01")), mv("b6", "saida", 2, mes("09")), mv("b6", "saida", 5, mes("10")), mv("b6", "saida", 3, mes("11", "06")),
  mv("b7", "saldo_inicial", 40, mes("07", "01")), mv("b7", "saida", 2, mes("10")), mv("b7", "saida", 1, mes("11", "04")),
  mv("b2", "saldo_inicial", 3, mes("06", "01")), mv("b2", "saida", 1, mes("08")), mv("b2", "saida", 1, mes("10")),
  mv("b8", "saldo_inicial", 1, mes("06", "01")),
];

/** Solicitações de mais unidades em "Vamos repor": a próxima entrada guarda para elas, em ordem de chegada. */
export interface Reposicao { id: string; brindeId: string; pessoa: string; qtd: number; guardado: number; criadoEm: string }
export const REPOSICOES: Reposicao[] = [
  { id: "r1", brindeId: "b1", pessoa: "Aline Castro", qtd: 10, guardado: 0, criadoEm: "2026-11-14T10:00:00" },
  { id: "r2", brindeId: "b2", pessoa: "Thiago Reis", qtd: 2, guardado: 0, criadoEm: "2026-11-17T15:20:00" },
];

export interface Linha { brindeId: string; qtd: number }
export interface Evento { estado: Estado; em: string; quem: string; motivo?: string; nota?: string }
export interface Pedido {
  id: string; codigo: string; solicitante: string; email: string; area: string;
  estado: Estado; recebimento: Recebimento; finalidade: string; destino?: string; observacao?: string;
  responsavel: string | null; criadoEm: string; prazoRetirada?: string; entregueA?: string; motivo?: string;
  linhas: Linha[]; historico: Evento[];
}
const h = (estado: Estado, em: string, quem: string, extra: Partial<Evento> = {}): Evento => ({ estado, em, quem, ...extra });

export const EU = "Marcelo Lucas";
export const GESTOR = "Fernando Alvarez";
export const PEDIDOS: Pedido[] = [
  {
    id: "p1", codigo: "DS-0398", solicitante: "Thiago Reis", email: "thiago.reis@digisystem.com.br", area: "Energia e Utilities",
    estado: "pronto_retirada", recebimento: { forma: "retirada", dataDesejada: "2026-11-24" }, finalidade: "Visita técnica ao cliente", responsavel: "Ariadne Lima",
    criadoEm: "2026-11-12T09:30:00", prazoRetirada: somarDiasUteis("2026-11-18", 5), linhas: [{ brindeId: "b4", qtd: 2 }],
    historico: [h("aguardando", "2026-11-12T09:30:00", "Thiago Reis", { nota: "Pedido feito na Digi Store" }), h("em_separacao", "2026-11-13T10:02:00", "Ariadne Lima"), h("pronto_retirada", "2026-11-18T16:40:00", "Ariadne Lima")],
  },
  {
    id: "p2", codigo: "DS-0405", solicitante: "Felipe Andrade", email: "felipe.andrade@digisystem.com.br", area: "Comercial",
    estado: "pronto_entrega", recebimento: { forma: "entrega", ondeEncontrar: "3º andar, baia 12", diaPresencial: HOJE }, finalidade: "Reunião com diretoria do cliente", destino: "Grupo Energisa", responsavel: EU,
    criadoEm: "2026-11-13T11:15:00", linhas: [{ brindeId: "b6", qtd: 4 }],
    historico: [h("aguardando", "2026-11-13T11:15:00", "Felipe Andrade", { nota: "Pedido feito na Digi Store" }), h("em_separacao", "2026-11-14T09:00:00", EU), h("pronto_entrega", "2026-11-18T14:10:00", EU)],
  },
  {
    id: "p3", codigo: "DS-0409", solicitante: "Carlos Menezes", email: "carlos.menezes@digisystem.com.br", area: "Serviços Financeiros",
    estado: "em_separacao", recebimento: { forma: "entrega", ondeEncontrar: "Térreo, recepção", diaPresencial: HOJE }, finalidade: "Evento de relacionamento", responsavel: "Ariadne Lima",
    criadoEm: "2026-11-14T08:50:00", linhas: [{ brindeId: "b5", qtd: 3 }],
    historico: [h("aguardando", "2026-11-14T08:50:00", "Carlos Menezes", { nota: "Pedido feito na Digi Store" }), h("em_separacao", "2026-11-17T10:30:00", "Ariadne Lima")],
  },
  {
    id: "p4", codigo: "DS-0410", solicitante: "Patrícia Ramos", email: "patricia.ramos@digisystem.com.br", area: "Governo",
    estado: "em_separacao", recebimento: { forma: "retirada", dataDesejada: "2026-11-25" }, finalidade: "Visita à Secretaria de Saúde", responsavel: EU,
    criadoEm: "2026-11-14T14:05:00", linhas: [{ brindeId: "b7", qtd: 1 }],
    historico: [h("aguardando", "2026-11-14T14:05:00", "Patrícia Ramos", { nota: "Pedido feito na Digi Store" }), h("em_separacao", "2026-11-17T11:20:00", EU)],
  },
  {
    id: "p5", codigo: "DS-0412", solicitante: "Mariana Souza", email: "mariana.souza@digisystem.com.br", area: "Comercial",
    estado: "aguardando", recebimento: { forma: "entrega", ondeEncontrar: "4º andar, sala do Comercial", diaPresencial: "2026-11-21" },
    finalidade: "Visita ao Hospital Santa Clara", destino: "Hospital Santa Clara, São Paulo", observacao: "Se possível, entregar antes das 10h.", responsavel: null,
    criadoEm: "2026-11-14T09:12:00", linhas: [{ brindeId: "b4", qtd: 5 }, { brindeId: "b3", qtd: 10 }],
    historico: [h("aguardando", "2026-11-14T09:12:00", "Mariana Souza", { nota: "Pedido feito na Digi Store" })],
  },
  {
    id: "p6", codigo: "DS-0415", solicitante: "Rafael Lima", email: "rafael.lima@digisystem.com.br", area: "Saúde",
    estado: "aguardando", recebimento: { forma: "retirada", dataDesejada: "2026-11-25" }, finalidade: "Congresso de saúde digital", responsavel: null,
    criadoEm: "2026-11-18T10:40:00", linhas: [{ brindeId: "b1", qtd: 2 }],
    historico: [h("aguardando", "2026-11-18T10:40:00", "Rafael Lima", { nota: "Pedido feito na Digi Store" })],
  },
  {
    id: "p7", codigo: "DS-0416", solicitante: "Juliana Prado", email: "juliana.prado@digisystem.com.br", area: "Pessoas e Cultura",
    estado: "aguardando", recebimento: { forma: "retirada" }, finalidade: "Boas-vindas de novos colaboradores", responsavel: null,
    criadoEm: `${HOJE}T08:20:00`, linhas: [{ brindeId: "b6", qtd: 8 }, { brindeId: "b3", qtd: 8 }],
    historico: [h("aguardando", `${HOJE}T08:20:00`, "Juliana Prado", { nota: "Pedido feito na Digi Store" })],
  },
  {
    id: "p8", codigo: "DS-0390", solicitante: "Aline Castro", email: "aline.castro@digisystem.com.br", area: "Marketing",
    estado: "entregue", recebimento: { forma: "retirada" }, finalidade: "Feira de inovação", responsavel: "Ariadne Lima", entregueA: "Aline Castro",
    criadoEm: "2026-11-06T13:00:00", linhas: [{ brindeId: "b1", qtd: 2 }],
    historico: [h("aguardando", "2026-11-06T13:00:00", "Aline Castro", { nota: "Pedido feito na Digi Store" }), h("em_separacao", "2026-11-07T09:10:00", "Ariadne Lima"), h("pronto_retirada", "2026-11-10T15:00:00", "Ariadne Lima"), h("entregue", "2026-11-12T11:30:00", "Ariadne Lima", { nota: "Quem recebeu: Aline Castro" })],
  },
  {
    id: "p9", codigo: "DS-0393", solicitante: "Bruno Teixeira", email: "bruno.teixeira@digisystem.com.br", area: "Tecnologia",
    estado: "recusada", recebimento: { forma: "retirada" }, finalidade: "Uso pessoal", responsavel: null, motivo: "Brinde é só para relacionamento com clientes.",
    criadoEm: "2026-11-07T16:00:00", linhas: [{ brindeId: "b2", qtd: 1 }],
    historico: [h("aguardando", "2026-11-07T16:00:00", "Bruno Teixeira", { nota: "Pedido feito na Digi Store" }), h("recusada", "2026-11-10T09:40:00", "Ariadne Lima", { motivo: "Brinde é só para relacionamento com clientes." })],
  },
];
export const LIMITE_PARADO = 2;
export const PRAZO_GUARDADAS = 3;
export const LOCAL_RETIRADA = "7º andar do escritório da Digisystem";
export const ontem = somarDias(HOJE, -1);