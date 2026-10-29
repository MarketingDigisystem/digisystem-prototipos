// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).

export const HOJE = "2026-10-29";

const fmtMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const moeda = (v: number) => fmtMoeda.format(v);

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function partes(iso: string) {
  const [d, h] = iso.split("T");
  const [a, m, dia] = d.split("-").map(Number);
  return { a, m, dia, hora: h ?? "" };
}

export function dataCurta(iso: string) {
  const { m, dia } = partes(iso);
  return `${String(dia).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

export function dataLonga(iso: string) {
  const { m, dia } = partes(iso);
  return `${dia} de ${MESES[m - 1]}`;
}

export function dataHora(iso: string) {
  const { hora } = partes(iso);
  return hora ? `${dataCurta(iso)} às ${hora.slice(0, 5)}` : dataCurta(iso);
}

export function nomeMes(aaaaMm: string) {
  const m = Number(aaaaMm.split("-")[1]);
  const n = MESES[m - 1];
  return n.charAt(0).toUpperCase() + n.slice(1);
}

function paraData(iso: string) {
  const { a, m, dia } = partes(iso);
  return new Date(Date.UTC(a, m - 1, dia));
}

export function paraIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function diasEntre(deIso: string, ateIso: string) {
  return Math.round((paraData(ateIso).getTime() - paraData(deIso).getTime()) / 86400000);
}

export function relativo(iso: string, hoje = HOJE) {
  const d = diasEntre(hoje, iso);
  if (d === 0) return "hoje";
  if (d === 1) return "amanhã";
  if (d === -1) return "ontem";
  return d > 0 ? `em ${d} dias` : `há ${-d} dias`;
}

export function somarDiasUteis(iso: string, dias: number) {
  const d = paraData(iso);
  let faltam = dias;
  while (faltam > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) faltam--;
  }
  return paraIso(d);
}

export function plural(n: number, um: string, varios: string) {
  return `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;
}

export const unidades = (n: number) => plural(n, "unidade", "unidades");

/** Hora atual mantendo a data mock fixa (datas estáveis nas fotos). */
export function agora() {
  const d = new Date();
  return `${HOJE}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
