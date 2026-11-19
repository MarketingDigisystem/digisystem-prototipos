// PROTÓTIPO DESCARTÁVEL — não é o app. Dados MOCK.
// Catálogo e fotos são os brindes reais da Digi Store; pessoas, pedidos e movimentações são exemplos.
// Fonte da verdade = Lovable/GitHub. Decisão: docs-marketing-hub/implementacao/analise-redesign-loja-hub-2026-11-19.md
import { HOJE, somarDias, somarDiasUteis, type Estado, type Recebimento } from "./regras";

const BASE = import.meta.env.BASE_URL;
export const foto = (arq: string) => `${BASE}brindes/${arq}`;

export interface Brinde {
  id: string; nome: string; categoria: string; foto: string | null; custo: number;
  saldo: number; reserva: number; guardadas: number; minimo: number; maximoPorPedido: number | null; ativo: boolean;
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