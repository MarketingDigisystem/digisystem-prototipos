// PROTÓTIPO DESCARTÁVEL — não é o app. Regras puras da aba Retirada.
// Gerado de: src/lib/loja/config-loja.ts e src/hub/pages/loja/AbaRetirada.tsx @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import type { ConfigLoja } from "./dados";
import { T_RETIRADA_MSG_GESTOR, T_RETIRADA_MSG_PRAZO, T_RETIRADA_MSG_TEXTO } from "./textos";

export type { ConfigLoja };
export type ErrosConfig = Partial<Record<keyof ConfigLoja, string>>;

export const CONFIG_PADRAO: ConfigLoja = {
  local: "7º andar do escritório da Digisystem",
  horario: "dias úteis, horário comercial",
  prazoRetiradaDiasUteis: 5,
  prazoGuardadasDiasUteis: 3,
  limiteParadoDiasUteis: 2,
  gestorId: null,
};

export const PRAZO_MINIMO_DIAS = 1;
export const PRAZO_MAXIMO_DIAS = 30;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function prazoValido(n: unknown): boolean {
  return typeof n === "number" && Number.isInteger(n) && n >= PRAZO_MINIMO_DIAS && n <= PRAZO_MAXIMO_DIAS;
}

/** Valida a configuração inteira; nunca altera a entrada. `erros` traz uma mensagem por campo inválido. */
export function validarConfig(c: ConfigLoja): { ok: boolean; erros: ErrosConfig } {
  const erros: ErrosConfig = {};
  if (typeof c.local !== "string" || c.local.trim() === "") erros.local = T_RETIRADA_MSG_TEXTO;
  if (typeof c.horario !== "string" || c.horario.trim() === "") erros.horario = T_RETIRADA_MSG_TEXTO;
  if (!prazoValido(c.prazoRetiradaDiasUteis)) erros.prazoRetiradaDiasUteis = T_RETIRADA_MSG_PRAZO;
  if (!prazoValido(c.prazoGuardadasDiasUteis)) erros.prazoGuardadasDiasUteis = T_RETIRADA_MSG_PRAZO;
  if (!prazoValido(c.limiteParadoDiasUteis)) erros.limiteParadoDiasUteis = T_RETIRADA_MSG_PRAZO;
  if (c.gestorId !== null && !(typeof c.gestorId === "string" && UUID.test(c.gestorId))) erros.gestorId = T_RETIRADA_MSG_GESTOR;
  return { ok: Object.keys(erros).length === 0, erros };
}

/** Texto digitado -> número (como a AbaRetirada real: só dígitos inteiros; o resto vira NaN e é recusado). */
export const comoNumero = (t: string): number => (/^\s*\d+\s*$/.test(t) ? Number(t) : Number.NaN);

/** PROPOSTA NOVA: prévia "Como o Solicitante vê". */
export function textoRetirada(c: Pick<ConfigLoja, "local" | "horario" | "prazoRetiradaDiasUteis">): string {
  const dias = c.prazoRetiradaDiasUteis;
  const n = Number.isInteger(dias) && dias >= 1 ? dias : null;
  const prazo = n === null ? "O prazo para retirar ainda não foi definido." : `O prazo para retirar é de ${n} ${n === 1 ? "dia útil" : "dias úteis"}.`;
  return `Retire no ${c.local.trim()}, ${c.horario.trim()}. ${prazo}`;
}

/** PROPOSTA NOVA: etiqueta de destino de cada campo (o Hub real já diferencia, decisão O5, mas não exibe estes textos). */
export const DESTINO_CAMPO: Readonly<Record<keyof ConfigLoja, "loja" | "hub">> = {
  local: "loja",
  horario: "loja",
  prazoRetiradaDiasUteis: "loja",
  prazoGuardadasDiasUteis: "loja",
  limiteParadoDiasUteis: "hub",
  gestorId: "hub",
};
export const ETIQUETA_DESTINO: Readonly<Record<"loja" | "hub", string>> = { loja: "Vai para a Loja", hub: "Fica só no Hub" };
export const T_RESTAURAR_PADRAO = "Restaurar padrão";
export const T_COMO_O_SOLICITANTE_VE = "Como o Solicitante vê";

/** Chaves comparáveis: o formulário foi alterado em relação ao salvo? */
export function configIgual(a: ConfigLoja, b: ConfigLoja): boolean {
  return (
    a.local === b.local &&
    a.horario === b.horario &&
    a.prazoRetiradaDiasUteis === b.prazoRetiradaDiasUteis &&
    a.prazoGuardadasDiasUteis === b.prazoGuardadasDiasUteis &&
    a.limiteParadoDiasUteis === b.limiteParadoDiasUteis &&
    a.gestorId === b.gestorId
  );
}
