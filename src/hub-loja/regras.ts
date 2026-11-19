// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/pedidos-loja.ts e estoque-loja.ts @ origin/main aff470d (lido em 2026-11-19).
// Fonte da verdade = Lovable/GitHub. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: docs-marketing-hub/implementacao/analise-redesign-loja-hub-2026-11-19.md

export type Estado = "aguardando" | "em_separacao" | "pronto_entrega" | "pronto_retirada" | "entregue" | "recusada" | "cancelada";
export type Recebimento =
  | { forma: "entrega"; ondeEncontrar: string; diaPresencial: string }
  | { forma: "retirada"; dataDesejada?: string };

export const ROTULO_ESTADO: Record<Estado, string> = {
  aguardando: "Aguardando atendimento",
  em_separacao: "Em separação",
  pronto_entrega: "Pronto para entrega",
  pronto_retirada: "Pronto para retirada",
  entregue: "Entregue",
  recusada: "Recusado",
  cancelada: "Cancelado",
};
export const ATIVOS: Estado[] = ["aguardando", "em_separacao", "pronto_entrega", "pronto_retirada"];
export const CONCLUIDOS: Estado[] = ["entregue", "recusada", "cancelada"];

/** Cor por Fase. Texto escuro no fundo claro para passar AA. */
export const COR_ESTADO: Record<Estado, { badge: string; ponto: string }> = {
  aguardando: { badge: "bg-orange-soft text-[#a83a0c]", ponto: "bg-accent" },
  em_separacao: { badge: "bg-sky-soft text-[#0b5874]", ponto: "bg-sky" },
  pronto_entrega: { badge: "bg-navy-soft text-primary", ponto: "bg-primary" },
  pronto_retirada: { badge: "bg-navy-soft text-primary", ponto: "bg-[#7b88c4]" },
  entregue: { badge: "bg-success-soft text-[#1a6340]", ponto: "bg-success" },
  recusada: { badge: "bg-[#fde8e6] text-[#b42318]", ponto: "bg-destructive" },
  cancelada: { badge: "bg-muted text-muted-foreground", ponto: "bg-[#b9c0d6]" },
};

export type AcaoPedido = "assumir" | "marcar_pronto" | "confirmar_entrega" | "mudar_para_retirada" | "recusar";
export const ROTULO_ACAO: Record<AcaoPedido, string> = {
  assumir: "Assumir pedido",
  marcar_pronto: "Marcar como pronto",
  confirmar_entrega: "Confirmar entrega",
  mudar_para_retirada: "Mudar para retirada",
  recusar: "Recusar pedido",
};
/** Igual a `acoesDaFase` do Hub: 3 posições fixas; null = posição invisível. */
export function acoesDaFase(e: Estado): { primaria: AcaoPedido | null; secundaria: AcaoPedido | null; destrutiva: AcaoPedido | null } {
  switch (e) {
    case "aguardando": return { primaria: "assumir", secundaria: null, destrutiva: "recusar" };
    case "em_separacao": return { primaria: "marcar_pronto", secundaria: null, destrutiva: "recusar" };
    case "pronto_entrega": return { primaria: "confirmar_entrega", secundaria: "mudar_para_retirada", destrutiva: null };
    case "pronto_retirada": return { primaria: "confirmar_entrega", secundaria: null, destrutiva: null };
    default: return { primaria: null, secundaria: null, destrutiva: null };
  }
}
export const ACOES_COM_CAMPO: AcaoPedido[] = ["confirmar_entrega", "mudar_para_retirada", "recusar"];
export function erroCampoAcao(a: AcaoPedido, v: string): string | null {
  if (v.trim()) return null;
  if (a === "confirmar_entrega") return "Informe quem recebeu o brinde.";
  if (a === "recusar") return "Informe o motivo da recusa.";
  if (a === "mudar_para_retirada") return "Informe o motivo da mudança para retirada.";
  return null;
}
export function textoSucessoAcao(a: AcaoPedido, codigo: string): string {
  switch (a) {
    case "assumir": return `Pedido ${codigo} em "Em separação". Você é o Responsável.`;
    case "marcar_pronto": return `Pedido ${codigo} marcado como pronto.`;
    case "confirmar_entrega": return `Pedido ${codigo} em "Entregue".`;
    case "mudar_para_retirada": return `Pedido ${codigo} em "Pronto para retirada".`;
    case "recusar": return `Pedido ${codigo} em "Recusado".`;
  }
}

/* ----------------------------- datas ----------------------------- */
export const HOJE = "2026-11-19";
export function somarDias(iso: string, n: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}
const diaSemana = (iso: string) => { const [a, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(a, m - 1, d)).getUTCDay(); };
export const ehDiaUtil = (iso: string) => { const w = diaSemana(iso); return w !== 0 && w !== 6; };
export function somarDiasUteis(iso: string, n: number): string {
  let d = iso; let k = 0;
  while (k < n) { d = somarDias(d, 1); if (ehDiaUtil(d)) k++; }
  return d;
}
export function diasUteisEntre(de: string, ate: string): number {
  let n = 0; let d = de;
  while (d < ate) { d = somarDias(d, 1); if (ehDiaUtil(d)) n++; }
  return n;
}
export const ddmm = (iso: string | null | undefined) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "");
export const hhmm = (iso: string) => iso.slice(11, 16);
export function limitesDaSemana(iso: string) { const desde = (diaSemana(iso) + 6) % 7; const ini = somarDias(iso, -desde); return { ini, fim: somarDias(ini, 6) }; }

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const iniciais = (nome: string) => nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");

/* ----------------------------- estoque ----------------------------- */
export type Alerta = "esgotado" | "minimo" | "cobertura" | "ok" | "inativo";
export function erroEntrada(qtd: number): string | null {
  return !Number.isInteger(qtd) || qtd < 1 ? "Informe uma quantidade inteira maior ou igual a 1." : null;
}
export function erroAjuste(b: { saldo: number; reserva: number; guardadas: number }, delta: number, nota: string): string | null {
  if (!Number.isInteger(delta) || delta === 0) return "Informe uma quantidade inteira diferente de zero (use sinal de menos para reduzir).";
  if (!nota.trim()) return "Informe o motivo do ajuste.";
  const comp = b.reserva + b.guardadas;
  if (b.saldo + delta < comp) {
    const partes = [`${b.reserva} reservadas para pedidos`];
    if (b.guardadas > 0) partes.push(`${b.guardadas} guardadas`);
    return `Esse ajuste deixaria o saldo em ${b.saldo + delta}, abaixo do que já está comprometido (${partes.join(" e ")}).`;
  }
  return null;
}
export function lerInteiro(t: string): number { const s = t.trim(); return /^[+-]?\d+$/.test(s) ? Number(s) : Number.NaN; }

/** Baixa um CSV gerado no navegador (com BOM para o Excel abrir com acento). */
export function baixarCsv(nome: string, linhas: (string | number)[][]) {
  const esc = (v: string | number) => { const s = String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = "\ufeff" + linhas.map((l) => l.map(esc).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = nome; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}