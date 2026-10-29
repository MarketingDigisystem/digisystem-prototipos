// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Roteador por hash (#/loja/...), no mesmo espírito do src/hub/router.ts.
// Toda tela tem URL própria, então o voltar do navegador funciona sem estado escondido.

import { useEffect, useState } from "react";

export type EtapaCheckout = "itens" | "finalidade" | "revisao" | "confirmacao";

export type Tela =
  | { tela: "vitrine" }
  | { tela: "produto"; slug: string }
  | { tela: "checkout"; etapa: EtapaCheckout }
  | { tela: "pedidos" }
  | { tela: "pedido"; id: string }
  | { tela: "gestao-pedidos" }
  | { tela: "gestao-estoque" }
  | { tela: "gestao-produto"; slug: string }
  | { tela: "gestao-rastreabilidade" }
  | { tela: "gestao-sugestoes" };

export interface RotaLoja {
  caminho: string;
  params: URLSearchParams;
  t: Tela;
  perfil: "diretor" | "equipe";
}

const ETAPAS: EtapaCheckout[] = ["itens", "finalidade", "revisao", "confirmacao"];

function interpretar(caminho: string): Tela | null {
  const s = caminho.split("/").filter(Boolean);
  if (s[0] !== "loja") return null;
  const [, a, b, c] = s;
  if (!a) return { tela: "vitrine" };
  if (a === "produto" && b) return { tela: "produto", slug: b };
  if (a === "checkout") return { tela: "checkout", etapa: ETAPAS.includes(b as EtapaCheckout) ? (b as EtapaCheckout) : "itens" };
  if (a === "pedidos" && !b) return { tela: "pedidos" };
  if (a === "pedidos" && b) return { tela: "pedido", id: b };
  if (a === "gestao") {
    if (!b || b === "pedidos") return { tela: "gestao-pedidos" };
    if (b === "estoque" && c) return { tela: "gestao-produto", slug: c };
    if (b === "estoque") return { tela: "gestao-estoque" };
    if (b === "rastreabilidade") return { tela: "gestao-rastreabilidade" };
    if (b === "sugestoes") return { tela: "gestao-sugestoes" };
  }
  return null;
}

function ler(): RotaLoja {
  const bruto = window.location.hash.replace(/^#/, "") || "/loja";
  const [caminho, qs = ""] = bruto.split("?");
  const t = interpretar(caminho) ?? { tela: "vitrine" as const };
  return {
    caminho: caminho.replace(/\/+$/, "") || "/loja",
    params: new URLSearchParams(qs),
    t,
    perfil: t.tela.startsWith("gestao") ? "equipe" : "diretor",
  };
}

const EVENTO = "loja:rota";
const emitir = () => window.dispatchEvent(new Event(EVENTO));

function montar(caminho: string, params?: URLSearchParams | Record<string, string | undefined>) {
  const p = params instanceof URLSearchParams ? params : new URLSearchParams();
  if (params && !(params instanceof URLSearchParams)) {
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") p.set(k, v);
  }
  const qs = p.toString();
  return `#${caminho}${qs ? `?${qs}` : ""}`;
}

/** Navega criando entrada no histórico (o voltar do navegador volta para cá). */
export function navegar(caminho: string, params?: Record<string, string | undefined>) {
  window.history.pushState({ loja: true }, "", montar(caminho, params));
  emitir();
}

/** Troca parâmetros da rota atual. replace=true não cria entrada (usado para fechar gaveta/painel). */
export function trocarParams(patch: Record<string, string | undefined | null>, replace = false) {
  const atual = ler();
  const p = new URLSearchParams(atual.params);
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === null || v === "") p.delete(k);
    else p.set(k, v);
  }
  const url = montar(atual.caminho, p);
  if (replace) window.history.replaceState(window.history.state, "", url);
  else window.history.pushState({ loja: true }, "", url);
  emitir();
}

/** Volta no histórico quando a entrada anterior é da loja; senão vai para a tela-mãe. */
export function voltar(fallback: string) {
  if (window.history.state?.loja) window.history.back();
  else navegar(fallback);
}

export function useRotaLoja(): RotaLoja {
  const [rota, setRota] = useState(ler);
  useEffect(() => {
    if (!interpretar((window.location.hash.replace(/^#/, "") || "").split("?")[0])) {
      window.history.replaceState(null, "", "#/loja");
    }
    const atualizar = () => setRota(ler());
    atualizar();
    window.addEventListener("hashchange", atualizar);
    window.addEventListener("popstate", atualizar);
    window.addEventListener(EVENTO, atualizar);
    return () => {
      window.removeEventListener("hashchange", atualizar);
      window.removeEventListener("popstate", atualizar);
      window.removeEventListener(EVENTO, atualizar);
    };
  }, []);
  return rota;
}
