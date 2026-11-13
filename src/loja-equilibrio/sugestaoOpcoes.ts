// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: tipos.ts e regras.ts desta pasta (sugestão de brinde), escritos em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Sugestão de brinde completa", Req. 16).
//
// Opções, rótulos e textos do formulário de sugestão. Fonte única: o formulário, o resumo e (na gestão) o cartão leem daqui.
// Funções puras, sem React.

import { dataCurta } from "./formato";
import type { ComLogo, DadosSugestao, FaixaCusto, Frequencia, Sugestao } from "./tipos";

export const OCASIOES = ["Evento", "Visita a cliente", "Boas-vindas", "Fim de ano", "Feira", "Treinamento", "Outro"] as const;
export const PUBLICOS = ["Clientes", "Parceiros", "Equipe interna", "Fornecedores", "Candidatos"] as const;

export const ROTULO_FREQUENCIA: Record<Frequencia, string> = {
  uma_vez: "Uma vez",
  todo_mes: "Todo mês",
  trimestral: "A cada trimestre",
  anual: "Uma vez por ano",
};

export const ROTULO_FAIXA_CUSTO: Record<FaixaCusto, string> = {
  ate_10: "Até R$ 10",
  "10_30": "R$ 10 a 30",
  "30_60": "R$ 30 a 60",
  "60_120": "R$ 60 a 120",
  acima_120: "Acima de R$ 120",
  nao_sei: "Ainda não sei",
};

export const ROTULO_COM_LOGO: Record<ComLogo, string> = {
  com_logo: "Com logo",
  sem_logo: "Sem logo",
  nao_sei: "Ainda não sei",
};

export const CATEGORIA_OUTRA = "Outra";
export const TOTAL_DETALHES = 9;
export const TEXTO_PARECIDOS = "Já temos algo parecido. Dá uma olhada antes de enviar.";
export const TEXTO_FALTOU_ALGO = "Faltou algo? Os campos acima são opcionais, mas ajudam o Marketing a decidir mais rápido.";
export const TEXTO_FOTO_PROTOTIPO = "Neste protótipo, só o nome do arquivo é guardado.";

/** "N de 9 detalhes preenchidos". */
export function textoIndicador(n: number): string {
  return `${n} de ${TOTAL_DETALHES} detalhes preenchidos`;
}

/** Estado bruto do formulário: tudo texto ou lista, para os campos controlados. */
export interface FormSugestao {
  nome: string;
  categoria: string;
  descricao: string;
  porQueCombina: string;
  link: string;
  fotoReferencia: string;
  ocasioes: string[];
  publicos: string[];
  dataNecessaria: string;
  frequencia: Frequencia | "";
  quantidade: string;
  faixaCusto: FaixaCusto | "";
  comLogo: ComLogo | "";
}

export const FORM_VAZIO: FormSugestao = {
  nome: "",
  categoria: "",
  descricao: "",
  porQueCombina: "",
  link: "",
  fotoReferencia: "",
  ocasioes: [],
  publicos: [],
  dataNecessaria: "",
  frequencia: "",
  quantidade: "",
  faixaCusto: "",
  comLogo: "",
};

/** Liga ou desliga um item de uma lista de escolha múltipla, sem mexer na lista original. */
export function alternar(lista: readonly string[], item: string): string[] {
  return lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item];
}

/** Converte o texto da quantidade; vazio vira undefined e texto que não é número vira NaN (a validação recusa). */
export function lerQuantidade(texto: string): number | undefined {
  const t = texto.trim();
  if (t === "") return undefined;
  return Number(t.replace(",", "."));
}

/** Monta os dados enviados à regra, omitindo o que está vazio. */
export function montarDados(f: FormSugestao): DadosSugestao {
  const d: DadosSugestao = { nome: f.nome };
  const t = (x: string) => x.trim();
  if (t(f.descricao)) d.descricao = f.descricao;
  if (t(f.categoria)) d.categoria = f.categoria;
  if (t(f.porQueCombina)) d.porQueCombina = f.porQueCombina;
  if (t(f.link)) d.link = f.link;
  if (t(f.fotoReferencia)) d.fotoReferencia = f.fotoReferencia;
  if (f.ocasioes.length > 0) d.ocasioes = [...f.ocasioes];
  if (f.publicos.length > 0) d.publicos = [...f.publicos];
  if (t(f.dataNecessaria)) d.dataNecessaria = f.dataNecessaria;
  if (f.frequencia) d.frequencia = f.frequencia;
  const q = lerQuantidade(f.quantidade);
  if (q !== undefined) d.quantidadeEstimada = q;
  if (f.faixaCusto) d.faixaCusto = f.faixaCusto;
  if (f.comLogo) d.comLogo = f.comLogo;
  return d;
}

export interface LinhaResumo {
  rotulo: string;
  valor: string;
}

/** Linhas do Resumo_da_Sugestao: só os campos preenchidos, na ordem em que a gestão os lê. */
export function linhasDoResumo(d: DadosSugestao): LinhaResumo[] {
  const linhas: LinhaResumo[] = [];
  const t = (x: string | undefined) => (x ?? "").trim();
  if (t(d.categoria)) linhas.push({ rotulo: "Categoria", valor: t(d.categoria) });
  if (t(d.descricao)) linhas.push({ rotulo: "Descrição", valor: t(d.descricao) });
  if (t(d.porQueCombina)) linhas.push({ rotulo: "Por que combina", valor: t(d.porQueCombina) });
  if (t(d.link)) linhas.push({ rotulo: "Link", valor: t(d.link) });
  if (t(d.fotoReferencia)) linhas.push({ rotulo: "Foto de referência", valor: t(d.fotoReferencia) });
  if (d.ocasioes && d.ocasioes.length > 0) linhas.push({ rotulo: "Ocasiões", valor: d.ocasioes.join(", ") });
  if (d.publicos && d.publicos.length > 0) linhas.push({ rotulo: "Públicos", valor: d.publicos.join(", ") });
  const quando: string[] = [];
  if (t(d.dataNecessaria)) quando.push(`até ${dataCurta(t(d.dataNecessaria))}`);
  if (d.frequencia) quando.push(ROTULO_FREQUENCIA[d.frequencia]);
  if (quando.length > 0) linhas.push({ rotulo: "Quando", valor: quando.join(" · ") });
  if (d.quantidadeEstimada !== undefined && d.quantidadeEstimada !== null) {
    linhas.push({ rotulo: "Quantidade estimada", valor: Number.isNaN(d.quantidadeEstimada) ? "inválida" : String(d.quantidadeEstimada) });
  }
  if (d.faixaCusto) linhas.push({ rotulo: "Custo por unidade", valor: ROTULO_FAIXA_CUSTO[d.faixaCusto] });
  if (d.comLogo) linhas.push({ rotulo: "Marca Digisystem", valor: ROTULO_COM_LOGO[d.comLogo] });
  return linhas;
}

/** Rascunho do Novo brinde criado a partir de uma sugestão aprovada (Req. 16.28 e 16.29). Não salva nada. */
export interface RascunhoBrinde {
  nome: string;
  categoria: string;
  descricao: string;
}

/** Nome, categoria (vazia se ausente ou "Outra") e descrição (com "Por que combina" ao final, se houver). */
export function rascunhoDaSugestao(s: Pick<Sugestao, "nome" | "categoria" | "descricao" | "porQueCombina">): RascunhoBrinde {
  const t = (x: string | undefined) => (x ?? "").trim();
  const categoria = t(s.categoria);
  const partes = [t(s.descricao), t(s.porQueCombina) ? `Por que combina com a marca: ${t(s.porQueCombina)}` : ""].filter(Boolean);
  return {
    nome: t(s.nome),
    categoria: categoria === CATEGORIA_OUTRA ? "" : categoria,
    descricao: partes.join("\n\n"),
  };
}

/** Devolve o link só se for uma URL http ou https; qualquer outra coisa (javascript:, data:, texto solto) vira null. */
export function linkSeguro(link: string | undefined): string | null {
  const t = (link ?? "").trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname !== "" ? u.href : null;
  } catch {
    return null;
  }
}

/** Chips compactos da lista "Suas sugestões": categoria, até 2 ocasiões, públicos e faixa de custo, quando houver. */
export function chipsDaSugestao(s: Pick<Sugestao, "categoria" | "ocasioes" | "publicos" | "faixaCusto">): string[] {
  const chips: string[] = [];
  if (s.categoria) chips.push(s.categoria);
  chips.push(...(s.ocasioes ?? []).slice(0, 2));
  chips.push(...(s.publicos ?? []));
  if (s.faixaCusto) chips.push(ROTULO_FAIXA_CUSTO[s.faixaCusto]);
  return chips;
}
