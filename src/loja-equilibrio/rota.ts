// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/rota.ts (padrão de hash interno), lido em 2026-11-11; reescrito aqui, sem importar dele.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Hash interno: #/loja-equilibrio, /brinde/:slug, /pedidos, /sugerir, /gestao/{aba}.
// Nunca usa o prefixo `loja` sozinho: ele pertence ao roteador do DigiPlace.

import { useEffect, useState } from "react";

export const RAIZ = "loja-equilibrio";

export const ABAS_GESTAO = ["fila", "sugestoes", "estoque", "movimentacoes", "metricas", "cadastro"] as const;
export type AbaGestao = (typeof ABAS_GESTAO)[number];

export type Tela =
  | { tela: "vitrine" }
  | { tela: "brinde"; slug: string }
  | { tela: "pedidos" }
  | { tela: "revisao" }
  | { tela: "sugerir" }
  | { tela: "gestao"; aba: AbaGestao }
  | { tela: "nao-encontrada" };

export interface RotaAtual {
  t: Tela;
  params: URLSearchParams;
}

export function ehAbaGestao(x: string | undefined): x is AbaGestao {
  return !!x && (ABAS_GESTAO as readonly string[]).includes(x);
}

export function lerRota(hash: string = window.location.hash): RotaAtual {
  const limpo = hash.replace(/^#\/?/, "");
  const [path, query = ""] = limpo.split("?");
  const partes = path.split("/").filter(Boolean);
  const params = new URLSearchParams(query);
  const [raiz, a, b] = partes;
  if (raiz !== RAIZ) return { t: { tela: "vitrine" }, params };
  if (!a) return { t: { tela: "vitrine" }, params };
  if (a === "brinde" && b) return { t: { tela: "brinde", slug: decodeURIComponent(b) }, params };
  if (a === "pedidos" && !b) return { t: { tela: "pedidos" }, params };
  if (a === "revisao" && !b) return { t: { tela: "revisao" }, params };
  if (a === "sugerir" && !b) return { t: { tela: "sugerir" }, params };
  if (a === "gestao") {
    if (!b) return { t: { tela: "gestao", aba: "fila" }, params };
    if (ehAbaGestao(b)) return { t: { tela: "gestao", aba: b }, params };
  }
  return { t: { tela: "nao-encontrada" }, params };
}

/** Monta o hash. `caminho` sem barra inicial, ex.: "gestao/fila" ou "". */
export function href(caminho = "", query?: Record<string, string>): string {
  const q = query && Object.keys(query).length ? `?${new URLSearchParams(query).toString()}` : "";
  return `#/${RAIZ}${caminho ? `/${caminho}` : ""}${q}`;
}

export function navegar(caminho = "", query?: Record<string, string>) {
  window.location.hash = href(caminho, query);
}

export function useRota(): RotaAtual {
  const [rota, setRota] = useState<RotaAtual>(() => lerRota());
  useEffect(() => {
    const f = () => setRota(lerRota());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return rota;
}
