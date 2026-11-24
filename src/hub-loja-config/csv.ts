// PROTÓTIPO DESCARTÁVEL — não é o app. CSV puro, sem DOM.
// Gerado de: src/hub/pages/loja/csv-loja.ts (serializarCsv e lerCsv copiados sem alteração) @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import type { PainelMetricas } from "./metricas-calc";
import { rotuloMes, formatarReal, formatarTempoAtendimento } from "./metricas-calc";

export const BOM_UTF8 = "\ufeff";
export type Celula = string | number | null;

function escapar(valor: Celula, soUmaCelula: boolean): string {
  const texto = valor === null ? "" : String(valor);
  // Linha com uma única célula vazia viraria linha em branco; as aspas a preservam.
  if (texto === "" && soUmaCelula) return '""';
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** Serializa a matriz: BOM + linhas separadas por "\n", células por ";". */
export function serializarCsv(linhas: readonly (readonly Celula[])[]): string {
  return BOM_UTF8 + linhas.map((l) => l.map((c) => escapar(c, l.length === 1)).join(";")).join("\n");
}

/** Inverso de `serializarCsv` (aceita também o texto sem BOM). */
export function lerCsv(texto: string): string[][] {
  const t = texto.startsWith(BOM_UTF8) ? texto.slice(1) : texto;
  if (t === "") return [];
  const linhas: string[][] = [];
  let linha: string[] = [];
  let celula = "";
  let entreAspas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (entreAspas) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          celula += '"';
          i++;
        } else {
          entreAspas = false;
        }
      } else {
        celula += c;
      }
    } else if (c === '"') {
      entreAspas = true;
    } else if (c === ";") {
      linha.push(celula);
      celula = "";
    } else if (c === "\n") {
      linha.push(celula);
      linhas.push(linha);
      linha = [];
      celula = "";
    } else {
      celula += c;
    }
  }
  linha.push(celula);
  linhas.push(linha);
  return linhas;
}

/**
 * PROPOSTA NOVA (D1): o csv-loja.ts real não protege contra fórmulas. Prefixa `'` quando o texto,
 * depois de espaços iniciais, começa com `=`, `+`, `-` ou `@`. Só vale para células de texto.
 */
export function neutralizarFormula(texto: string): string {
  return /^\s*[=+\-@]/.test(texto) ? `'${texto}` : texto;
}

export const nomeArquivoCsv = (mes: string): string => `metricas-loja-${mes}.csv`;

/** Linhas do "Exportar mês" (Proposta nova): seções separadas por uma linha em branco. Texto passa por `neutralizarFormula`. */
export function linhasCsvDoMes(p: PainelMetricas): Celula[][] {
  const t = (s: string): string => neutralizarFormula(s);
  const gasto = (titulo: string, linhas: PainelMetricas["porSolicitante"]): Celula[][] => [
    [t(titulo)],
    ["Nome", "Valor", "Pedidos", "Unidades"],
    ...linhas.map((x): Celula[] => [t(x.rotulo), formatarReal(x.valor), x.pedidos, x.unidades]),
  ];
  const alertas = (titulo: string, itens: PainelMetricas["esgotados"]): Celula[][] => [
    [t(titulo)],
    ["Brinde", "Disponível", "Mínimo"],
    ...itens.map((x): Celula[] => [t(x.nome), x.disponivel, x.minimo]),
  ];
  const sep: Celula[][] = [[""]];
  return [
    [t(`Métricas da Loja: ${rotuloMes(p.mes)}`)],
    ...sep,
    ["Indicadores"],
    ["Indicador", "Valor"],
    ["Gasto do mês", formatarReal(p.gasto)],
    ["Unidades entregues", p.unidadesEntregues],
    ["Prontos para entregar ou retirar (un.)", p.prontosUnidades],
    ["Valor em estoque", formatarReal(p.valorEmEstoque)],
    ["Pedidos parados", p.pedidosParados],
    ["Tempo médio de atendimento", formatarTempoAtendimento(p.tempoMedioAtendimentoMs)],
    ["Esgotados", p.esgotados.length],
    ["Abaixo do mínimo", p.abaixoDoMinimo.length],
    ...sep,
    ...gasto("Gasto por Solicitante", p.porSolicitante),
    ...sep,
    ...gasto("Gasto por área", p.porArea),
    ...sep,
    ...alertas("Alertas de mínimo", p.abaixoDoMinimo),
    ...sep,
    ...alertas("Esgotados", p.esgotados),
    ...sep,
    [t("Popularidade")],
    ["Brinde", "Unidades", "Pedidos"],
    ...p.popularidade.map((x): Celula[] => [t(x.nome), x.unidades, x.pedidos]),
  ];
}
