// PROTÓTIPO DESCARTÁVEL — não é o app. Regras puras da aba Acesso.
// Gerado de: src/lib/loja/acesso.ts e src/hub/pages/loja/acesso-loja.ts @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import type { Papel, Sinc, Solicitante } from "./dados";
import {
  DOMINIO_ACESSO,
  T_ACESSO_AREA_VAZIA,
  T_ACESSO_DOMINIO,
  T_ACESSO_DUPLICADO,
  T_ACESSO_EMAIL_VAZIO,
} from "./textos";

export const ROTULO_SITUACAO: Readonly<Record<"ativo" | "revogado", string>> = { ativo: "Ativo", revogado: "Revogado" };

export const ROTULO_SINCRONIZACAO: Readonly<Record<Sinc, string>> = {
  sincronizado: "Sincronizado com a Loja",
  pendente: "Aguardando envio à Loja",
  falhou: "Falha no envio à Loja",
  sem_registro: "Sem registro de envio",
};

const RE_EMAIL = /^[a-z0-9._%+-]+@digisystem\.com\.br$/;

/** Minúsculo e sem espaços (nas pontas e no meio). */
export function normalizarEmail(bruto: string): string {
  return (bruto ?? "").replace(/\s+/g, "").toLowerCase();
}

export type EntradaInclusao = { email: string; nome?: string; area: string };
export type InclusaoValida = { email: string; nome: string; area: string };

/**
 * Valida a inclusão (mesma regra do servidor). Devolve a entrada normalizada ou a mensagem de erro.
 * O duplicado é do protótipo (o servidor real faz upsert); `existentes` é a lista atual.
 */
export function validarInclusao(
  e: EntradaInclusao,
  existentes: readonly Pick<Solicitante, "email">[] = [],
): { ok: true; dados: InclusaoValida } | { ok: false; mensagem: string } {
  const email = normalizarEmail(e.email);
  if (!email) return { ok: false, mensagem: T_ACESSO_EMAIL_VAZIO };
  if (!RE_EMAIL.test(email)) return { ok: false, mensagem: T_ACESSO_DOMINIO };
  const area = (e.area ?? "").trim();
  if (!area) return { ok: false, mensagem: T_ACESSO_AREA_VAZIA };
  if (existentes.some((x) => normalizarEmail(x.email) === email)) return { ok: false, mensagem: T_ACESSO_DUPLICADO };
  const nome = (e.nome ?? "").trim() || email.split("@")[0];
  return { ok: true, dados: { email, nome, area } };
}

/** Só o Admin inclui, revoga e reativa; o Marketing apenas vê a lista. */
export const podeEditarAcesso = (papel: Papel): boolean => papel === "admin";

export function textoPedidos(n: number): string {
  return n === 1 ? "1 pedido" : `${n} pedidos`;
}

/** Iniciais para o avatar (até 2 letras). */
export function iniciais(nomeOuEmail: string): string {
  const partes = nomeOuEmail.split("@")[0].split(/[\s._-]+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const a = partes[0][0] ?? "";
  const b = partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "";
  return (a + b).toUpperCase();
}

const ordenar = (lista: Solicitante[]): Solicitante[] =>
  [...lista].sort((a, b) => (a.nome || a.email).localeCompare(b.nome || b.email, "pt-BR") || a.email.localeCompare(b.email));

/** Inclui um Solicitante novo: Ativo, 0 pedidos, "Aguardando envio à Loja". Não muta a lista. */
export function incluirSolicitante(lista: readonly Solicitante[], dados: InclusaoValida): Solicitante[] {
  return ordenar([...lista, { ...dados, ativo: true, pedidos: 0, sinc: "pendente" }]);
}

/** Revoga ou reativa; a mudança sempre fica "Aguardando envio à Loja". Não muta a lista. */
export function mudarSituacao(lista: readonly Solicitante[], email: string, ativo: boolean): Solicitante[] {
  return lista.map((s) => (s.email === email ? { ...s, ativo, sinc: "pendente" as const } : s));
}

/** PROPOSTA NOVA: "Reenviar à Loja" em linha com falha; volta a "Aguardando envio à Loja". */
export function reenviarSolicitante(lista: readonly Solicitante[], email: string): Solicitante[] {
  return lista.map((s) => (s.email === email ? { ...s, sinc: "pendente" as const } : s));
}

export type FiltroSituacao = "todos" | "ativos" | "revogados";
export const ROTULO_FILTRO: Readonly<Record<FiltroSituacao, string>> = { todos: "Todos", ativos: "Ativos", revogados: "Revogados" };

const semAcento = (s: string): string => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** PROPOSTA NOVA: busca por nome, e-mail ou área (sem diferenciar caixa nem acento) e filtro de situação. */
export function filtrarSolicitantes(lista: readonly Solicitante[], busca: string, filtro: FiltroSituacao): Solicitante[] {
  const q = semAcento(busca.trim());
  return lista.filter((s) => {
    if (filtro === "ativos" && !s.ativo) return false;
    if (filtro === "revogados" && s.ativo) return false;
    if (q === "") return true;
    return semAcento(`${s.nome} ${s.email} ${s.area}`).includes(q);
  });
}

export { DOMINIO_ACESSO };
