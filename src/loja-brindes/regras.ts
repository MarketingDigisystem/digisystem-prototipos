// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Funções PURAS das regras de estoque e dos dois trilhos de pedido. Não mutam a entrada.
// FLUXO v4 (DigiPlace):
// - PRONTA ENTREGA: só se pede o que tem saldo. Dá baixa imediata na criação, o pedido nasce
//   "pronto" e, na retirada, vira "encerrado" (débito do centro de custo). Sem etapa de aprovação.
//   Item esgotado não é pedível como pronta entrega.
// - ENCOMENDA (produção externa, sob demanda): nasce "encomenda_solicitada", passa por
//   "em_alinhamento" → "confirmada" → "em_producao" → "pronto" → "encerrado". Não mexe no saldo
//   próprio (é produção fora); na retirada debita o centro de custo igual à pronta entrega.
//   Exige quantidade mínima (QTD_MINIMA_ENCOMENDA ou a mínima do produto).
// - SUGESTÃO: "sugerida" → "em_analise" → "aprovada" (vira item de encomenda) / "recusada".
// Invariante central: o saldo de uma variação nunca fica negativo.
//
// DECISÃO ADIADA (não entra nesta rodada): "pedido acima do estoque vira encomenda". Hoje,
// pedir acima do disponível em pronta entrega é inválido; a ponte pronta→encomenda fica para
// a implementação real.

import { HOJE, somarDiasUteis } from "./formato";
import { GASTO_MESES_ANTERIORES } from "./mock";
import type {
  CentroCustoId, DadosEncomenda, EstadoLoja, ItemCarrinho, Movimentacao, Pedido, Produto, StatusPedido, Sugestao,
  TipoMov, Variacao,
} from "./tipos";

export const PRAZO_SEPARACAO_DIAS_UTEIS = 2;

/** Quantidade mínima de uma encomenda. O piso é 10 e pode subir até 20 unidades — a decisão
 *  fina fica para a implementação real. É o default de `encomendaMinima` quando não informado. */
export const QTD_MINIMA_ENCOMENDA = 10;

export const encomendaMinimaDe = (produto: Produto) => produto.encomendaMinima ?? QTD_MINIMA_ENCOMENDA;

/** Sem reserva: disponível é o próprio saldo físico (a baixa é imediata na saída). */
export const disponivel = (_produto: Produto, variacao: Variacao, _pedidos: Pedido[]) =>
  Math.max(0, variacao.saldo);

export function disponivelTotal(produto: Produto, pedidos: Pedido[]) {
  return produto.variacoes.reduce((s, v) => s + disponivel(produto, v, pedidos), 0);
}

export type Situacao = "disponivel" | "ultimas" | "esgotado";

/** Situação da variação: esgotado (0), últimas unidades (abaixo do mínimo) ou disponível. */
export function situacaoVariacao(produto: Produto, v: Variacao, pedidos: Pedido[]): Situacao {
  const d = disponivel(produto, v, pedidos);
  if (d <= 0) return "esgotado";
  if (v.minimo > 0 && d < v.minimo) return "ultimas";
  return "disponivel";
}

export function situacaoProduto(produto: Produto, pedidos: Pedido[]): Situacao {
  // Item encomenda-only não tem estoque próprio; a situação não se aplica (tratado na UI
  // como "sob encomenda"). Ainda assim respondemos "esgotado" por consistência do saldo.
  const s = produto.variacoes.map((v) => situacaoVariacao(produto, v, pedidos));
  if (s.every((x) => x === "esgotado")) return "esgotado";
  if (s.some((x) => x === "disponivel")) return "disponivel";
  return "ultimas";
}

/** O item pode ser pedido como pronta entrega (tem alguma variação com saldo e não é só-encomenda). */
export function temProntaEntrega(produto: Produto, pedidos: Pedido[]) {
  if (produto.somenteEncomenda) return false;
  return produto.variacoes.some((v) => disponivel(produto, v, pedidos) > 0);
}

/** O item aparece disponível de alguma forma: pronta entrega com saldo, ou aceita encomenda. */
export function pedivel(produto: Produto, pedidos: Pedido[]) {
  return temProntaEncomendaOuEstoque(produto, pedidos);
}

function temProntaEncomendaOuEstoque(produto: Produto, pedidos: Pedido[]) {
  return temProntaEntrega(produto, pedidos) || !!produto.aceitaEncomenda;
}

export function alertasMinimo(produtos: Produto[], pedidos: Pedido[]) {
  const r: { produto: Produto; variacao: Variacao; disponivel: number }[] = [];
  for (const p of produtos) {
    if (!p.ativo || p.somenteEncomenda) continue;
    for (const v of p.variacoes) {
      const d = disponivel(p, v, pedidos);
      if (v.minimo > 0 && d > 0 && d < v.minimo) r.push({ produto: p, variacao: v, disponivel: d });
    }
  }
  return r;
}

export function esgotados(produtos: Produto[], pedidos: Pedido[]) {
  const r: { produto: Produto; variacao: Variacao }[] = [];
  for (const p of produtos) {
    if (p.somenteEncomenda) continue;
    for (const v of p.variacoes) if (disponivel(p, v, pedidos) <= 0) r.push({ produto: p, variacao: v });
  }
  return r;
}

export function dataMinima(prazoExtra: number, hoje = HOJE) {
  return somarDiasUteis(hoje, PRAZO_SEPARACAO_DIAS_UTEIS + prazoExtra);
}

export function prazoExtraDoCarrinho(itens: ItemCarrinho[], produtos: Produto[]) {
  let maior = 0;
  for (const i of itens) {
    if (!i.personalizacao) continue;
    const p = produtos.find((x) => x.id === i.produtoId);
    maior = Math.max(maior, p?.personalizacao?.prazoExtraDiasUteis ?? 0);
  }
  return maior;
}

export interface ResultadoValidacao {
  ok: boolean;
  maximo: number;
  minimo: number;
  erros: string[];
}

/** Valida um item de PRONTA ENTREGA. Sem o antigo ramo "sem saldo": o teto é o disponível e
 *  pedir acima dele é inválido. Também exige o mínimo (e o mínimo de personalização). */
export function validarItem(
  produto: Produto, variacao: Variacao, qtd: number, personalizado: boolean, pedidos: Pedido[], jaNoPedido = 0,
): ResultadoValidacao {
  const disp = disponivel(produto, variacao, pedidos);
  const minimo = personalizado ? produto.personalizacao?.qtdMinima ?? 1 : 1;
  const maximo = Math.max(0, disp - jaNoPedido);
  const erros: string[] = [];
  if (personalizado && !produto.personalizacao) erros.push("Este item não aceita personalização.");
  if (qtd < minimo) erros.push(personalizado ? `A personalização é feita a partir de ${minimo} unidades.` : "Escolha pelo menos 1 unidade.");
  if (qtd + jaNoPedido > disp) erros.push(disp <= 0 ? "Este item está esgotado para pronta entrega." : `Só há ${disp} unidades em estoque${jaNoPedido ? ` (${jaNoPedido} já no seu pedido)` : ""}.`);
  return { ok: erros.length === 0, maximo, minimo, erros };
}

/** Valida a quantidade de uma ENCOMENDA: precisa ser >= a mínima do produto (ou QTD_MINIMA_ENCOMENDA). */
export function validarEncomenda(produto: Produto, qtd: number): ResultadoValidacao {
  const minimo = encomendaMinimaDe(produto);
  const erros: string[] = [];
  if (!produto.aceitaEncomenda) erros.push("Este item não está disponível para encomenda.");
  if (!Number.isInteger(qtd) || qtd < minimo) erros.push(`A encomenda é a partir de ${minimo} unidades.`);
  return { ok: erros.length === 0, maximo: Number.MAX_SAFE_INTEGER, minimo, erros };
}

export function validarData(dataNecessaria: string, prazoExtra: number, hoje = HOJE) {
  if (!dataNecessaria) return "Informe para quando você precisa dos brindes.";
  const min = dataMinima(prazoExtra, hoje);
  if (dataNecessaria < min) return `min:${min}`;
  return null;
}

export const custoPedido = (p: Pedido) => p.itens.reduce((s, i) => s + i.qtd * i.custoUnitarioNaHora, 0);
export const unidadesPedido = (p: Pedido) => p.itens.reduce((s, i) => s + i.qtd, 0);

/** Pronta entrega sempre "saiu na hora" (nasce pronto). Encomenda, não. */
export const saiuNaHora = (p: Pedido) => p.tipoPedido === "pronta";

/** Estados de encomenda ainda em andamento (não finais). */
export const ENCOMENDA_EM_ANDAMENTO: StatusPedido[] = ["encomenda_solicitada", "em_alinhamento", "confirmada", "em_producao", "pronto"];

/* ---------------- Transições de pedido ---------------- */

function exigir(p: Pedido | undefined, de: StatusPedido[], acao: string): Pedido {
  if (!p) throw new Error("Pedido não encontrado.");
  if (!de.includes(p.status)) throw new Error(`Não dá para ${acao} um pedido com status "${p.status}".`);
  return p;
}

let seq = 0;
function novoMov(m: Omit<Movimentacao, "id">): Movimentacao {
  seq += 1;
  return { id: `mv-${Date.now().toString(36)}-${seq}`, ...m };
}

function trocarPedido(estado: EstadoLoja, p: Pedido): Pedido[] {
  return estado.pedidos.map((x) => (x.id === p.id ? p : x));
}

function saidasDoPedido(p: Pedido, em: string, porId: string, destino = p.destino) {
  return p.itens.map((i) =>
    novoMov({ em, produtoId: i.produtoId, variacaoId: i.variacaoId, tipo: "saida", qtd: -i.qtd, pedidoId: p.id, destino, porId }),
  );
}

/** Dá baixa no saldo físico dos itens do pedido. O saldo nunca fica negativo. */
function baixarSaldo(produtos: Produto[], p: Pedido): Produto[] {
  return produtos.map((prod) => {
    const itens = p.itens.filter((i) => i.produtoId === prod.id);
    if (!itens.length) return prod;
    return {
      ...prod,
      variacoes: prod.variacoes.map((v) => {
        const q = itens.filter((i) => i.variacaoId === v.id).reduce((s, i) => s + i.qtd, 0);
        return q ? { ...v, saldo: Math.max(0, v.saldo - q) } : v;
      }),
    };
  });
}

/** Cria o pedido de PRONTA ENTREGA: exige saldo em todos os itens, dá baixa imediata e nasce
 *  "pronto". Se algum item não tiver saldo, lança (não há mais pedido "em aberto"). */
export function criarPedido(
  estado: EstadoLoja,
  base: Omit<Pedido, "itens" | "status" | "historico" | "criadoEm" | "tipoPedido" | "encomenda">,
  itens: { produtoId: string; variacaoId: string; qtd: number; personalizacao?: Pedido["itens"][number]["personalizacao"] }[],
  porId: string,
  em: string,
): { estado: EstadoLoja; pedido: Pedido } {
  const itensPedido = itens.map((i) => {
    const prod = estado.produtos.find((p) => p.id === i.produtoId);
    const v = prod?.variacoes.find((x) => x.id === i.variacaoId);
    const d = prod && v ? disponivel(prod, v, estado.pedidos) : 0;
    if (!prod || !v || d < i.qtd) {
      const nome = prod ? prod.nome : "item";
      throw new Error(`${nome} está sem saldo para pronta entrega. Reveja o pedido.`);
    }
    return {
      produtoId: i.produtoId, variacaoId: i.variacaoId, qtd: i.qtd, personalizacao: i.personalizacao,
      custoUnitarioNaHora: prod.custoUnitario,
    };
  });
  const pedido: Pedido = {
    ...base, itens: itensPedido, status: "pronto", tipoPedido: "pronta",
    historico: [{ status: "pronto", em, porId }],
    criadoEm: em,
  };
  const novoEstado: EstadoLoja = {
    ...estado,
    produtos: baixarSaldo(estado.produtos, pedido),
    pedidos: [pedido, ...estado.pedidos],
    movimentos: [...estado.movimentos, ...saidasDoPedido(pedido, em, porId)],
  };
  return { estado: novoEstado, pedido };
}

/** Cria uma ENCOMENDA: nasce "encomenda_solicitada", não mexe no saldo próprio (produção
 *  externa). Exige quantidade >= mínima do produto. */
export function criarEncomenda(
  estado: EstadoLoja,
  base: Omit<Pedido, "itens" | "status" | "historico" | "criadoEm" | "tipoPedido" | "encomenda">,
  item: { produtoId: string; variacaoId: string; qtd: number; personalizacao?: Pedido["itens"][number]["personalizacao"] },
  dados: DadosEncomenda,
  porId: string,
  em: string,
): { estado: EstadoLoja; pedido: Pedido } {
  const prod = estado.produtos.find((p) => p.id === item.produtoId);
  if (!prod) throw new Error("Item não encontrado.");
  const val = validarEncomenda(prod, item.qtd);
  if (!val.ok) throw new Error(val.erros[0]);
  const pedido: Pedido = {
    ...base,
    itens: [{ produtoId: item.produtoId, variacaoId: item.variacaoId, qtd: item.qtd, personalizacao: item.personalizacao, custoUnitarioNaHora: prod.custoUnitario }],
    status: "encomenda_solicitada", tipoPedido: "encomenda",
    encomenda: { ...dados, quantidadeAlinhada: dados.quantidadeAlinhada ?? item.qtd },
    historico: [{ status: "encomenda_solicitada", em, porId }],
    criadoEm: em,
  };
  return { estado: { ...estado, pedidos: [pedido, ...estado.pedidos] }, pedido };
}

const PROXIMO_ENCOMENDA: Partial<Record<StatusPedido, StatusPedido>> = {
  encomenda_solicitada: "em_alinhamento",
  em_alinhamento: "confirmada",
  confirmada: "em_producao",
  em_producao: "pronto",
};

/** Avança a encomenda um passo na ordem. Transição fora de ordem lança. */
export function avancarEncomenda(estado: EstadoLoja, pedidoId: string, porId: string, em: string, nota?: string): EstadoLoja {
  const p = estado.pedidos.find((x) => x.id === pedidoId);
  if (!p) throw new Error("Pedido não encontrado.");
  if (p.tipoPedido !== "encomenda") throw new Error("Esta ação é só para encomendas.");
  const proximo = PROXIMO_ENCOMENDA[p.status];
  if (!proximo) throw new Error(`Não dá para avançar uma encomenda com status "${p.status}".`);
  const novo: Pedido = { ...p, status: proximo, historico: [...p.historico, { status: proximo, em, porId, nota }] };
  return { ...estado, pedidos: trocarPedido(estado, novo) };
}

/** Negar: só para encomenda em análise (solicitada ou em alinhamento). Exige motivo. */
export function negar(estado: EstadoLoja, pedidoId: string, motivo: string, porId: string, em: string): EstadoLoja {
  const p = exigir(estado.pedidos.find((x) => x.id === pedidoId), ["encomenda_solicitada", "em_alinhamento"], "negar");
  if (!motivo.trim()) throw new Error("Escreva o motivo da negativa. Quem pediu vai ver esse texto.");
  const novo: Pedido = { ...p, status: "negado", motivo: motivo.trim(), historico: [...p.historico, { status: "negado", em, porId }] };
  return { ...estado, pedidos: trocarPedido(estado, novo) };
}

/** Retirada: "pronto" → "encerrado" (pronta entrega e encomenda). Debita o centro de custo. */
export function retirar(estado: EstadoLoja, pedidoId: string, porId: string, em: string, nota?: string): EstadoLoja {
  const p = exigir(estado.pedidos.find((x) => x.id === pedidoId), ["pronto"], "registrar a retirada");
  const novo: Pedido = { ...p, status: "encerrado", historico: [...p.historico, { status: "encerrado", em, porId, nota }] };
  return { ...estado, pedidos: trocarPedido(estado, novo) };
}

/** Cancelar: enquanto não encerrado nem negado. Pronta entrega em "pronto" devolve o estoque;
 *  encomenda não mexe no saldo (ainda não baixou). */
export function cancelar(estado: EstadoLoja, pedidoId: string, motivo: string, porId: string, em: string): EstadoLoja {
  const canceláveis: StatusPedido[] = ["pronto", ...ENCOMENDA_EM_ANDAMENTO.filter((s) => s !== "pronto")];
  const p = exigir(estado.pedidos.find((x) => x.id === pedidoId), canceláveis, "cancelar");
  if (!motivo.trim()) throw new Error("Escreva o motivo do cancelamento.");
  const devolve = p.tipoPedido === "pronta" && p.status === "pronto"; // só pronta entrega baixou estoque
  const novo: Pedido = {
    ...p, status: "cancelado", motivo: motivo.trim(),
    historico: [...p.historico, { status: "cancelado", em, porId, nota: devolve ? `${p.itens.reduce((s, i) => s + i.qtd, 0)} unidades devolvidas ao estoque.` : undefined }],
  };
  const produtos = devolve
    ? estado.produtos.map((prod) => {
        const itens = p.itens.filter((i) => i.produtoId === prod.id);
        if (!itens.length) return prod;
        return { ...prod, variacoes: prod.variacoes.map((v) => {
          const q = itens.filter((i) => i.variacaoId === v.id).reduce((s, i) => s + i.qtd, 0);
          return q ? { ...v, saldo: v.saldo + q } : v;
        }) };
      })
    : estado.produtos;
  const movs = devolve
    ? p.itens.map((i) => novoMov({ em, produtoId: i.produtoId, variacaoId: i.variacaoId, tipo: "entrada", qtd: i.qtd, pedidoId: p.id, destino: `Devolução do pedido cancelado: ${motivo.trim()}`, porId }))
    : [];
  return { ...estado, produtos, pedidos: trocarPedido(estado, novo), movimentos: [...estado.movimentos, ...movs] };
}

function mexerSaldo(estado: EstadoLoja, produtoId: string, variacaoId: string, novoSaldo: (v: Variacao) => number) {
  return estado.produtos.map((p) =>
    p.id !== produtoId ? p : { ...p, variacoes: p.variacoes.map((v) => (v.id === variacaoId ? { ...v, saldo: novoSaldo(v) } : v)) },
  );
}

export function registrarEntrada(
  estado: EstadoLoja, produtoId: string, variacaoId: string, qtd: number, lote: string, porId: string, em: string,
): EstadoLoja {
  if (!Number.isInteger(qtd) || qtd <= 0) throw new Error("A entrada precisa ser de pelo menos 1 unidade.");
  if (!lote.trim()) throw new Error("Informe o lote ou a origem da entrada.");
  return {
    ...estado,
    produtos: mexerSaldo(estado, produtoId, variacaoId, (v) => v.saldo + qtd),
    movimentos: [...estado.movimentos, novoMov({ em, produtoId, variacaoId, tipo: "entrada", qtd, destino: lote.trim(), porId })],
  };
}

export function ajustar(
  estado: EstadoLoja, produtoId: string, variacaoId: string, novoSaldo: number, motivo: string, porId: string, em: string,
): EstadoLoja {
  const p = estado.produtos.find((x) => x.id === produtoId);
  const v = p?.variacoes.find((x) => x.id === variacaoId);
  if (!p || !v) throw new Error("Item não encontrado.");
  if (!Number.isInteger(novoSaldo) || novoSaldo < 0) throw new Error("O saldo precisa ser um número inteiro, zero ou maior.");
  if (!motivo.trim()) throw new Error("Explique o motivo do ajuste (ex.: inventário, avaria).");
  if (novoSaldo === v.saldo) throw new Error("O saldo informado é igual ao atual.");
  return {
    ...estado,
    produtos: mexerSaldo(estado, produtoId, variacaoId, () => novoSaldo),
    movimentos: [...estado.movimentos, novoMov({ em, produtoId, variacaoId, tipo: "ajuste", qtd: novoSaldo - v.saldo, destino: motivo.trim(), porId })],
  };
}

export function salvarProduto(estado: EstadoLoja, produto: Produto): EstadoLoja {
  const existe = estado.produtos.some((p) => p.id === produto.id);
  return { ...estado, produtos: existe ? estado.produtos.map((p) => (p.id === produto.id ? produto : p)) : [...estado.produtos, produto] };
}

/* ---------------- Transições de sugestão ---------------- */

export function criarSugestao(
  estado: EstadoLoja,
  dados: { nome: string; descricao: string; referencia?: string; qtdEstimada?: number },
  porId: string,
  em: string,
): { estado: EstadoLoja; sugestao: Sugestao } {
  if (!dados.nome.trim()) throw new Error("Dê um nome ao brinde sugerido.");
  if (!dados.descricao.trim()) throw new Error("Conte para que serve o brinde.");
  const id = proximoIdSugestao(estado.sugestoes);
  const sugestao: Sugestao = {
    id, nome: dados.nome.trim(), descricao: dados.descricao.trim(),
    referencia: dados.referencia?.trim() || undefined,
    qtdEstimada: dados.qtdEstimada && dados.qtdEstimada > 0 ? dados.qtdEstimada : undefined,
    status: "sugerida", sugeridaPorId: porId, criadaEm: em,
    historico: [{ status: "sugerida", em, porId }],
  };
  return { estado: { ...estado, sugestoes: [sugestao, ...estado.sugestoes] }, sugestao };
}

function trocarSugestao(estado: EstadoLoja, s: Sugestao): Sugestao[] {
  return estado.sugestoes.map((x) => (x.id === s.id ? s : x));
}

function exigirSugestao(s: Sugestao | undefined, de: Sugestao["status"][], acao: string): Sugestao {
  if (!s) throw new Error("Sugestão não encontrada.");
  if (!de.includes(s.status)) throw new Error(`Não dá para ${acao} uma sugestão "${s.status}".`);
  return s;
}

export function analisarSugestao(estado: EstadoLoja, id: string, porId: string, em: string): EstadoLoja {
  const s = exigirSugestao(estado.sugestoes.find((x) => x.id === id), ["sugerida"], "analisar");
  const novo: Sugestao = { ...s, status: "em_analise", historico: [...s.historico, { status: "em_analise", em, porId }] };
  return { ...estado, sugestoes: trocarSugestao(estado, novo) };
}

export function recusarSugestao(estado: EstadoLoja, id: string, motivo: string, porId: string, em: string): EstadoLoja {
  const s = exigirSugestao(estado.sugestoes.find((x) => x.id === id), ["sugerida", "em_analise"], "recusar");
  if (!motivo.trim()) throw new Error("Escreva o motivo da recusa. Quem sugeriu vai ver esse texto.");
  const novo: Sugestao = { ...s, status: "recusada", motivo: motivo.trim(), historico: [...s.historico, { status: "recusada", em, porId }] };
  return { ...estado, sugestoes: trocarSugestao(estado, novo) };
}

/** Aprova a sugestão: cria um PRODUTO de encomenda (sem estoque próprio) no catálogo e marca a
 *  sugestão "aprovada" com o id do produto gerado. */
export function aprovarSugestao(estado: EstadoLoja, id: string, porId: string, em: string, custoUnitario = 0): EstadoLoja {
  const s = exigirSugestao(estado.sugestoes.find((x) => x.id === id), ["sugerida", "em_analise"], "aprovar");
  const produtoId = `p-enc-${s.id.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  const slug = s.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || produtoId;
  const produto: Produto = {
    id: produtoId, slug, nome: s.nome, categoria: "escritorio", icone: "caderno",
    galeria: [{ angulo: "frente", fundo: "navy-sky", legenda: s.nome }],
    descricaoCurta: s.descricao.split(/[.!?]/)[0].slice(0, 120) || s.descricao,
    descricaoLonga: [s.descricao, "Item sob encomenda: não tem estoque próprio. A produção é feita sob demanda depois do alinhamento com o marketing."],
    especificacoes: [{ rotulo: "Origem", valor: "Sugestão aprovada pela equipe de marketing" }],
    custoUnitario,
    variacoes: [{ id: "unico", rotulo: "Único", saldo: 0, minimo: 0 }],
    selos: ["novidade"], cadastradoEm: em.slice(0, 10), ativo: true, usos: [],
    aceitaEncomenda: true, somenteEncomenda: true, encomendaMinima: QTD_MINIMA_ENCOMENDA,
    origemSugestao: s.id,
  };
  const novo: Sugestao = { ...s, status: "aprovada", produtoGeradoId: produtoId, historico: [...s.historico, { status: "aprovada", em, porId }] };
  return { ...estado, produtos: [...estado.produtos, produto], sugestoes: trocarSugestao(estado, novo) };
}

export function proximoIdSugestao(sugestoes: Sugestao[]) {
  const max = sugestoes.reduce((m, s) => Math.max(m, Number(s.id.replace("SG-", "")) || 0), 0);
  return `SG-${String(max + 1).padStart(4, "0")}`;
}

/* ---------------- Relatórios ---------------- */

/** Data de encerramento (retirada), quando o custo é debitado. */
export function dataEncerramento(p: Pedido) {
  return p.historico.find((h) => h.status === "encerrado")?.em;
}

export function gastoPorCentro(pedidos: Pedido[], mes: string) {
  const base = GASTO_MESES_ANTERIORES[mes];
  const r: Record<CentroCustoId, { valor: number; pedidos: number; unidades: number }> = {
    "MKT-DIR": { valor: 0, pedidos: 0, unidades: 0 },
    "COM-DIR": { valor: 0, pedidos: 0, unidades: 0 },
    "RH-DIR": { valor: 0, pedidos: 0, unidades: 0 },
    "TI-DIR": { valor: 0, pedidos: 0, unidades: 0 },
    "FIN-DIR": { valor: 0, pedidos: 0, unidades: 0 },
  };
  if (base) for (const k of Object.keys(base) as CentroCustoId[]) r[k] = { ...base[k] };
  for (const p of pedidos) {
    const ent = dataEncerramento(p);
    if (p.status !== "encerrado" || !ent?.startsWith(mes)) continue;
    r[p.centroCustoId].valor += custoPedido(p);
    r[p.centroCustoId].pedidos += 1;
    r[p.centroCustoId].unidades += unidadesPedido(p);
  }
  return r;
}

/** Usos amigáveis do produto: mock + pedidos que já saíram (prontos/encerrados). */
export function usosDoProduto(produto: Produto, pedidos: Pedido[]) {
  const dePedidos = pedidos
    .filter((p) => ["pronto", "encerrado"].includes(p.status))
    .flatMap((p) => p.itens.filter((i) => i.produtoId === produto.id).map((i) => ({
      evento: p.destino, centroCustoId: p.centroCustoId, qtd: i.qtd, em: p.criadoEm.slice(0, 10),
    })));
  return [...produto.usos, ...dePedidos].sort((a, b) => b.em.localeCompare(a.em));
}

export function popularidade(produto: Produto, pedidos: Pedido[]) {
  const pedidosAtivos = pedidos.filter((p) => p.status !== "negado" && p.status !== "cancelado");
  const q = pedidosAtivos.flatMap((p) => p.itens).filter((i) => i.produtoId === produto.id).reduce((s, i) => s + i.qtd, 0);
  return q + produto.usos.reduce((s, u) => s + u.qtd, 0);
}

export function proximoNumeroPedido(pedidos: Pedido[]) {
  const max = pedidos.reduce((m, p) => Math.max(m, Number(p.id.replace("BR-", "")) || 0), 0);
  return `BR-${String(max + 1).padStart(4, "0")}`;
}
