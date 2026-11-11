/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Roteamento por hash: #/loja-digi-store/<caminho>?estado=carregando|vazio|erro|sucesso&aba=...
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { useEffect, useState } from "react";

export const RAIZ = "loja-digi-store";
export type EstadoTela = "carregando" | "vazio" | "erro" | "sucesso" | null;

export interface RotaAtual {
  caminho: string[]; // segmentos depois de "loja-digi-store"
  estado: EstadoTela;
  aba: string | null;
  revisao: boolean; // ?revisao=1 liga o controle de revisão do protótipo
}

/** Troca (ou remove) só o `estado` da URL atual, preservando caminho e demais parâmetros. */
export function definirEstado(estado: EstadoTela) {
  const limpo = window.location.hash.replace(/^#\/?/, "");
  const [path, query = ""] = limpo.split("?");
  const q = new URLSearchParams(query);
  if (estado) q.set("estado", estado);
  else q.delete("estado");
  const s = q.toString();
  window.location.hash = `#/${path}${s ? `?${s}` : ""}`;
}

export function lerRota(hash: string = window.location.hash): RotaAtual {
  const limpo = hash.replace(/^#\/?/, "");
  const [path, query = ""] = limpo.split("?");
  const partes = path.split("/").filter(Boolean);
  const caminho = partes[0] === RAIZ ? partes.slice(1) : [];
  const q = new URLSearchParams(query);
  const e = q.get("estado");
  const estado = e === "carregando" || e === "vazio" || e === "erro" || e === "sucesso" ? e : null;
  return { caminho, estado, aba: q.get("aba"), revisao: q.get("revisao") === "1" };
}

export function href(caminho: string, query?: Record<string, string>): string {
  const q = query && Object.keys(query).length ? `?${new URLSearchParams(query).toString()}` : "";
  return `#/${RAIZ}${caminho ? `/${caminho}` : ""}${q}`;
}

export function navegar(caminho: string, query?: Record<string, string>) {
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
