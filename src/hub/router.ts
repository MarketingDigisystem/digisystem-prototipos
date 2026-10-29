/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/AppDock.tsx, src/routes/_authenticated/route.tsx,
 *   src/routes/_authenticated/admin.integracoes.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Roteador por hash feito à mão (sem dependência). Cada área e cada aba da
 * seção 2.3 da proposta tem um endereço próprio (#/tarefas/quadro…), e as rotas
 * antigas redirecionam para as novas (seção 2.4: "nenhum link salvo quebra").
 *
 * Navegar = trocar location.hash (cria entrada no histórico, então o voltar do
 * navegador funciona). Redirect = history.replaceState (não cria entrada, para
 * o voltar não cair de novo no endereço antigo).
 */
import { useEffect, useState } from "react";
import type { Papel } from "./store/tipos";

// ─── Áreas e abas (proposta 2.3) ───────────────────────────────────────────

export type AreaId =
  | "inicio"
  | "tendencias"
  | "tarefas"
  | "posts"
  | "marca"
  | "resultados"
  | "configuracoes"
  /** Meu perfil (#/perfil): fora do Dock, entra pelo menu do avatar. */
  | "perfil";

export type Aba = {
  id: string;
  label: string;
  /** Aba que existe mas está fora do go-live (Resultados → Redes). */
  emBreve?: boolean;
  /** Papéis que enxergam a aba. Ausente = todos. */
  papeis?: Papel[];
};

export type AreaMeta = {
  id: AreaId;
  label: string;
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  abas: Aba[];
  /** Papéis que enxergam a área. Ausente = todos. */
  papeis?: Papel[];
};

export const AREAS: Record<AreaId, AreaMeta> = {
  inicio: {
    id: "inicio",
    label: "Início",
    eyebrow: "Início",
    titulo: "Minha mesa",
    subtitulo: "Só o que é com você hoje.",
    abas: [{ id: "mesa", label: "Minha mesa" }],
  },
  tendencias: {
    id: "tendencias",
    label: "Tendências",
    eyebrow: "Radar do mercado",
    titulo: "Tendências",
    subtitulo: "O que o mercado está discutindo e o que o time já fez com isso.",
    abas: [
      { id: "tendencias", label: "Tendências" },
      { id: "concorrencia", label: "Concorrência" },
      { id: "swot", label: "SWOT" },
    ],
  },
  tarefas: {
    id: "tarefas",
    label: "Tarefas",
    eyebrow: "Trabalho do time",
    titulo: "Tarefas",
    subtitulo: "Cards, subtarefas e pedidos do marketing num quadro só.",
    abas: [
      { id: "quadro", label: "Quadro" },
      { id: "pedidos", label: "Pedidos" },
      { id: "cronograma", label: "Cronograma" },
    ],
  },
  posts: {
    id: "posts",
    label: "Posts",
    eyebrow: "Acervo",
    titulo: "Posts",
    subtitulo: "Do rascunho ao publicado, tudo do post num lugar só.",
    abas: [
      { id: "meus", label: "Meus posts" },
      { id: "aprovar", label: "Para aprovar", papeis: ["aprovador", "admin"] },
      { id: "calendario", label: "Calendário" },
      { id: "publicados", label: "Publicados" },
    ],
  },
  marca: {
    id: "marca",
    label: "Marca",
    eyebrow: "Identidade",
    titulo: "Marca",
    subtitulo: "A marca num lugar só, usada por Tendências, Estúdio e IA.",
    abas: [
      { id: "identidade", label: "Identidade" },
      { id: "voz", label: "Voz" },
      { id: "logos", label: "Logos e fundos" },
      { id: "cores", label: "Cores e fontes" },
      { id: "hashtags", label: "Hashtags" },
    ],
  },
  resultados: {
    id: "resultados",
    label: "Resultados",
    eyebrow: "Olhar para dentro",
    titulo: "Resultados",
    subtitulo: "Como o time está indo, sem ninguém marcar horas.",
    abas: [
      { id: "time", label: "Time" },
      { id: "redes", label: "Redes", emBreve: true },
    ],
  },
  configuracoes: {
    id: "configuracoes",
    label: "Configurações",
    eyebrow: "Gestão",
    titulo: "Configurações",
    subtitulo: "Equipe, prompts da IA, integrações e etiquetas do Quadro.",
    papeis: ["admin"],
    abas: [
      { id: "equipe", label: "Equipe" },
      { id: "ia", label: "IA e prompts" },
      { id: "integracoes", label: "Integrações" },
      { id: "etiquetas", label: "Etiquetas" },
    ],
  },
  // Protótipo do Perfil: docs-marketing-hub/implementacao/pacote-perfil-e-foto-2026-10-27.md
  perfil: {
    id: "perfil",
    label: "Meu perfil",
    eyebrow: "Conta",
    titulo: "Meu perfil",
    subtitulo: "Como você aparece para o time e como o hub abre para você.",
    abas: [{ id: "perfil", label: "Meu perfil" }],
  },
};

/** Ordem do dock (proposta 2.2: Tendências logo depois do Início). */
export const ORDEM_DOCK: AreaId[] = ["inicio", "tendencias", "tarefas", "posts", "marca", "resultados"];

/**
 * Telas que não são aba: o Estúdio ("Criar post", proposta 5) mora em Posts,
 * mas não aparece entre as abas. Fica em #/posts/criar.
 */
export const TELAS_EXTRAS: Partial<Record<AreaId, string[]>> = {
  posts: ["criar"],
};

// ─── Rota atual ────────────────────────────────────────────────────────────

export type Rota = {
  area: AreaId;
  aba: string;
  /** Parâmetros depois do "?" (ex.: #/posts/criar?card=c-1&trend=t-3). */
  params: Record<string, string>;
};

export const ROTA_INICIAL: Rota = { area: "inicio", aba: "mesa", params: {} };

export function hrefDe(area: AreaId, aba?: string, params?: Record<string, string | undefined>): string {
  const meta = AREAS[area];
  const destino = aba ?? meta.abas[0].id;
  const base = area === "inicio" || area === "perfil" ? `#/${area}` : `#/${area}/${destino}`;
  const q = params
    ? Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join("&")
    : "";
  return q ? `${base}?${q}` : base;
}

export function navegar(area: AreaId, aba?: string, params?: Record<string, string | undefined>) {
  window.location.hash = hrefDe(area, aba, params).slice(1);
}

function lerHash(hash: string): { caminho: string[]; params: Record<string, string> } {
  const limpo = hash.replace(/^#\/?/, "");
  const [p, q = ""] = limpo.split("?");
  const caminho = p.split("/").filter(Boolean).map((s) => s.toLowerCase());
  const params: Record<string, string> = {};
  for (const par of q.split("&").filter(Boolean)) {
    const [k, v = ""] = par.split("=");
    params[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return { caminho, params };
}

// ─── Redirects das rotas antigas (proposta 2.4) ────────────────────────────

/**
 * Converte um endereço antigo do Hub para o novo. Devolve null quando o
 * endereço já é novo (ou é desconhecido e cai no Início pelo resolverRota).
 *
 * Mapa:
 *  /planejamento            → Tarefas → Quadro   (?tab=triagem → Pedidos, ?tab=gantt|cronograma → Cronograma,
 *                                                  ?tab=metricas → Resultados → Time)
 *  /estudio                 → Posts → Criar post (?tab=aprovacao → Para aprovar, ?tab=calendario → Calendário)
 *  /biblioteca              → Posts → Publicados (a Biblioteca vira Publicados; ?tab=meus → Meus posts)
 *  /biblioteca/{id}         → Posts → Publicados com o detalhe do post aberto
 *  /tendencias              → Tendências → Tendências
 *  /brand-kit               → Marca → Identidade
 *  /metricas                → Resultados → Time  (?tab=concorrentes → Tendências → Concorrência, ?tab=swot → SWOT)
 *  /admin, /admin/usuarios  → Configurações → Equipe (?tab=ia|integracoes|marca)
 *  /admin/integracoes       → Configurações → Integrações
 */
export function redirecionarAntiga(hash: string): string | null {
  const { caminho, params } = lerHash(hash);
  const [a, b] = caminho;
  const tab = params.tab?.toLowerCase();

  switch (a) {
    case undefined:
    case "":
      return hrefDe("inicio");
    case "planejamento":
      if (tab === "triagem") return hrefDe("tarefas", "pedidos");
      if (tab === "gantt" || tab === "cronograma") return hrefDe("tarefas", "cronograma");
      if (tab === "metricas") return hrefDe("resultados", "time");
      return hrefDe("tarefas", "quadro");
    case "estudio":
      if (tab === "aprovacao") return hrefDe("posts", "aprovar");
      if (tab === "calendario") return hrefDe("posts", "calendario");
      return hrefDe("posts", "criar", { trend: params.trendId, card: params.tarefaId });
    case "biblioteca":
      if (b) return hrefDe("posts", "publicados", { post: b });
      if (tab === "meus") return hrefDe("posts", "meus");
      return hrefDe("posts", "publicados");
    case "tendencias":
      // "tendencias" também é área nova: só redireciona o endereço antigo sem aba.
      return b ? null : hrefDe("tendencias", "tendencias");
    case "brand-kit":
      return hrefDe("marca", "identidade");
    case "metricas":
      if (tab === "concorrentes") return hrefDe("tendencias", "concorrencia");
      if (tab === "swot") return hrefDe("tendencias", "swot");
      return hrefDe("resultados", "time");
    case "admin":
      if (b === "integracoes" || tab === "integracoes") return hrefDe("configuracoes", "integracoes");
      if (tab === "ia") return hrefDe("configuracoes", "ia");
      if (tab === "marca") return hrefDe("marca", "logos");
      return hrefDe("configuracoes", "equipe");
    default:
      // Endereço novo: fica. Desconhecido: cai no Início.
      return a in AREAS ? null : hrefDe("inicio");
  }
}

/** Lê o hash e devolve a rota nova. Endereço desconhecido cai no Início. */
export function resolverRota(hash: string): Rota {
  const { caminho, params } = lerHash(hash);
  const [a, b] = caminho;
  if (!a || !(a in AREAS)) return ROTA_INICIAL;
  const area = a as AreaId;
  const meta = AREAS[area];
  if (area === "inicio") return { area, aba: "mesa", params };
  if (area === "perfil") return { area, aba: "perfil", params };
  const valida = meta.abas.some((x) => x.id === b) || TELAS_EXTRAS[area]?.includes(b ?? "");
  return { area, aba: valida ? (b as string) : meta.abas[0].id, params };
}

/** O papel enxerga a área? (Configurações só admin, proposta 7.) */
export function areaVisivel(area: AreaId, papel: Papel): boolean {
  const p = AREAS[area].papeis;
  return !p || p.includes(papel);
}

/** Abas que o papel enxerga ("Para aprovar" só Aprovador e Admin, proposta 2.3). */
export function abasVisiveis(area: AreaId, papel: Papel): Aba[] {
  return AREAS[area].abas.filter((a) => !a.papeis || a.papeis.includes(papel));
}

/**
 * Hook da rota atual. Aplica os redirects das rotas antigas com replaceState
 * e reage ao voltar/avançar do navegador (evento hashchange).
 */
export function useRota(): Rota {
  const [rota, setRota] = useState<Rota>(() => aplicar());

  useEffect(() => {
    const onChange = () => setRota(aplicar());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return rota;
}

function aplicar(): Rota {
  const novo = redirecionarAntiga(window.location.hash);
  if (novo && novo !== window.location.hash) {
    window.history.replaceState(null, "", novo);
  }
  return resolverRota(window.location.hash);
}
