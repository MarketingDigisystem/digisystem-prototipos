/*
PROTÓTIPO DESCARTÁVEL — não é o app.
Gerado de: src/hub/pages/marca/mercado/ no Lovable (origin/main) @ leitura 2026-11-26, só como referência de conteúdo e papéis.
Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
Decisão de design correspondente: docs-marketing-hub/implementacao/analise-redesign-mercado-2026-11-25.md.
*/
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Gauge,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  DADOS_MERCADO,
  iniciais,
  ROTULO_RISCO,
  urlLogo,
  type Concorrente,
  type NivelRisco,
  type SinaisRisco,
} from "./dados";

/* ------------------------------------------------------------------ dados e mapas */

export const DADOS = DADOS_MERCADO;
export const SEG_POR_ID = new Map(DADOS.segmentos.map((s) => [s.id, s]));
export const ITEM_POR_ID = new Map(DADOS.itens.map((i) => [i.id, i]));
export const CONC_POR_ID = new Map(DADOS.concorrentes.map((c) => [c.id, c]));

export const TOTAL_ITENS = DADOS.itens.length;

export type ChaveSinal = "sobreposicao" | "segmentos" | "regional" | "porte";
export const SINAIS: { k: ChaveSinal; curto: string; longo: string; niveis: string[] }[] = [
  { k: "sobreposicao", curto: "Oferta", longo: "Sobreposição de portfólio", niveis: ["Nenhuma", "Baixa", "Média", "Alta"] },
  { k: "segmentos", curto: "Segmentos", longo: "Segmentos em comum", niveis: ["Nenhum", "Um", "Dois", "Três ou mais"] },
  { k: "regional", curto: "Praça", longo: "Presença regional", niveis: ["Fora do alvo", "Distante", "Parcial", "Mesma praça"] },
  { k: "porte", curto: "Porte", longo: "Porte", niveis: ["Micro ou local", "Pequeno", "Médio", "Grande"] },
];

export function rotuloPorte(c: Concorrente): string {
  return c.sinais ? SINAIS[3].niveis[c.sinais.porte] ?? "Não avaliado" : "Não avaliado";
}

/** O banco ainda não traz "situação" do concorrente; se vier e não for "ativa", o cartão mostra. */
export function situacaoDe(c: Concorrente): string | null {
  const s = c.situacao?.trim();
  return s && s.toLowerCase() !== "ativa" ? s.charAt(0).toUpperCase() + s.slice(1) : null;
}

export function normalizar(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function fmtData(valor: string | null): string {
  if (!valor) return "sem data";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [a, m, d] = valor.split("-");
    return `${d}/${m}/${a}`;
  }
  const dt = new Date(valor);
  if (Number.isNaN(dt.getTime())) return "sem data";
  return dt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

/** "1. A. 2. B." vira ["A.", "B."]; texto sem numeração vira lista de um item. */
export function listaDiferenciais(t: string | null): string[] {
  if (!t) return [];
  const partes = t.split(/\s*(?=\b\d{1,2}\.\s)/).map((p) => p.replace(/^\d{1,2}\.\s*/, "").trim());
  return partes.filter(Boolean);
}

/** Separa a justificativa do critério em um texto por sinal. */
export function explicarSinais(s: SinaisRisco | null): Partial<Record<ChaveSinal, string>> {
  const out: Partial<Record<ChaveSinal, string>> = {};
  if (!s) return out;
  const mapa: Record<string, ChaveSinal> = { Sobreposição: "sobreposicao", Segmentos: "segmentos", Regional: "regional", Porte: "porte" };
  for (const parte of s.justificativa.split(/(?=(?:Sobreposição|Segmentos|Regional|Porte) \d: )/)) {
    const m = /^(Sobreposição|Segmentos|Regional|Porte) \d: ([\s\S]*)$/.exec(parte.trim());
    if (m) out[mapa[m[1]]] = m[2].trim();
  }
  return out;
}

export function porRisco(a: Concorrente, b: Concorrente): number {
  const r = (b.ficha.risco ?? 0) - (a.ficha.risco ?? 0);
  if (r) return r;
  const p = Number((b.sinais?.pontuacao ?? "0").replace(",", ".")) - Number((a.sinais?.pontuacao ?? "0").replace(",", "."));
  return p || a.nome.localeCompare(b.nome, "pt-BR");
}

export function useMinWidth(px: number): boolean {
  const consulta = `(min-width:${px}px)`;
  const [v, setV] = useState(() => typeof window !== "undefined" && window.matchMedia(consulta).matches);
  useEffect(() => {
    const m = window.matchMedia(consulta);
    const f = () => setV(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, [consulta]);
  return v;
}

/* ------------------------------------------------------------------ peças visuais */

const ESTILO_RISCO: Record<NivelRisco, { cls: string; Icon: LucideIcon }> = {
  5: { cls: "bg-[#fde2da] text-[#7f1d00] border-[#f0b3a2]", Icon: ShieldAlert },
  4: { cls: "bg-[#ffe8d6] text-[#7a3000] border-[#ffc59e]", Icon: TriangleAlert },
  3: { cls: "bg-[#e3f5fb] text-[#154a63] border-[#a9dff0]", Icon: Gauge },
  2: { cls: "bg-[#eef0f8] text-[#2f3d86] border-[#ccd2ea]", Icon: Shield },
  1: { cls: "bg-[#eef0f8] text-[#2f3d86] border-[#ccd2ea]", Icon: ShieldCheck },
};

export function SeloRisco({ nivel, curto = false }: { nivel: NivelRisco | null; curto?: boolean }) {
  if (!nivel) {
    return (
      <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-[13px] font-semibold text-foreground">
        Sem ficha
      </span>
    );
  }
  const { cls, Icon } = ESTILO_RISCO[nivel];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[13px] font-semibold ${cls}`}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {curto ? `Risco ${nivel}` : `Risco ${nivel} · ${ROTULO_RISCO[nivel]}`}
    </span>
  );
}

const VARIACOES_LOGO = [
  "bg-navy text-primary-foreground",
  "bg-[#e3f5fb] text-[#154a63]",
  "bg-[#ffe8d6] text-[#7a3000]",
];

export function Logo({ c, tam = 44 }: { c: Concorrente; tam?: number }) {
  const url = urlLogo(c);
  const [falhou, setFalhou] = useState(false);
  const estilo = { width: tam, height: tam };
  if (url && !falhou) {
    return (
      <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white" style={estilo}>
        <img src={url} alt={`Logo ${c.nome}`} className="size-[78%] object-contain" decoding="async" onError={() => setFalhou(true)} />
      </span>
    );
  }
  const variacao = VARIACOES_LOGO[[...c.slug].reduce((a, ch) => a + ch.charCodeAt(0), 0) % VARIACOES_LOGO.length];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl font-display font-bold ${variacao}`}
      style={{ ...estilo, fontSize: Math.round(tam * 0.38) }}
      role="img"
      aria-label={`Iniciais de ${c.nome}`}
    >
      {iniciais(c.nome)}
    </span>
  );
}

export function Pips({ valor }: { valor: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className={`h-2 w-4 rounded-full border-[1.5px] border-navy ${i < valor ? "bg-navy" : "bg-transparent opacity-45"}`} />
      ))}
    </span>
  );
}

/** Os 4 sinais do critério de risco em grade 2x2 (ou lista, no detalhe). */
export function SinaisBarra({ sinais, detalhado = false }: { sinais: SinaisRisco | null; detalhado?: boolean }) {
  if (!sinais) return <p className="text-[13px] text-muted-foreground">Sinais ainda não avaliados.</p>;
  const resumo = SINAIS.map((s) => `${s.longo}: ${sinais[s.k]} de 3`).join("; ");
  return (
    <div role="group" aria-label={`Sinais de risco. ${resumo}`} className={detalhado ? "grid gap-2" : "grid grid-cols-2 gap-x-4 gap-y-1.5"}>
      {SINAIS.map((s) => (
        <div key={s.k} className="flex items-center justify-between gap-2 text-[13px] text-foreground">
          <span className="truncate">{detalhado ? s.longo : s.curto}</span>
          <span className="flex items-center gap-2">
            {detalhado && <span className="text-muted-foreground">{s.niveis[sinais[s.k]]}</span>}
            <Pips valor={sinais[s.k]} />
          </span>
        </div>
      ))}
    </div>
  );
}

/** Forma "assentada" do símbolo da IA Digisystem (cacho de bolinhas azul, laranja e céu). */
export function SimboloIA({ tam = 28 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 32 32" role="img" aria-label="IA Digisystem" className="shrink-0">
      <circle cx="13" cy="15" r="7" fill="#36499b" />
      <circle cx="24" cy="9" r="4" fill="#ff6d2d" />
      <circle cx="23" cy="23" r="3" fill="#67cfee" />
      <circle cx="6" cy="25" r="2.2" fill="#67cfee" />
    </svg>
  );
}

export function Pill({
  ativo,
  onClick,
  children,
  className = "",
  rotulo,
}: {
  ativo: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  rotulo?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={rotulo}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 font-display text-[15px] font-semibold motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
        ativo ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy hover:bg-navy-soft"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export const BOTAO_SECUNDARIO =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 font-display text-[15px] font-semibold text-navy motion-safe:transition-colors hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

/* ------------------------------------------------------------------ painel flutuante */

/**
 * Painel que NUNCA desloca a grade nem os controles.
 * - modo "lateral" (>= 1366 px): coluna absoluta à direita do pai `relative`; o painel fica sticky dentro dela.
 * - modo "sheet" (< 1366 px): folha sobreposta com cortina; Esc e clique fora fecham.
 */
export function PainelFlutuante({
  aberto,
  modo,
  titulo,
  cabecalho,
  onFechar,
  largura,
  children,
}: {
  aberto: boolean;
  modo: "lateral" | "sheet";
  titulo: string;
  cabecalho: ReactNode;
  onFechar: () => void;
  largura: string;
  children: ReactNode;
}) {
  const refFechar = useRef<HTMLButtonElement>(null);
  const refPainel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const previo = document.activeElement as HTMLElement | null;
    refFechar.current?.focus({ preventScroll: true });
    const aoTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", aoTecla);
    return () => {
      window.removeEventListener("keydown", aoTecla);
      const ativo = document.activeElement;
      if (previo && document.contains(previo) && (!ativo || ativo === document.body || refPainel.current?.contains(ativo))) {
        previo.focus({ preventScroll: true });
      }
    };
    // onFechar vem estável do pai; só reage à abertura e ao modo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, modo]);

  if (!aberto) return null;

  const corpo = (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0 flex-1">{cabecalho}</div>
        <button
          ref={refFechar}
          type="button"
          onClick={onFechar}
          aria-label="Fechar painel"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-navy hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-24">{children}</div>
    </>
  );

  if (modo === "sheet") {
    return (
      <div className="fixed inset-0 z-50">
        <button type="button" tabIndex={-1} aria-label="Fechar painel" onClick={onFechar} className="absolute inset-0 bg-black/45" />
        <section
          ref={refPainel}
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
          className="mercado-painel-in absolute inset-y-0 right-0 flex w-full max-w-[580px] flex-col bg-card shadow-float"
        >
          {corpo}
        </section>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-30" style={{ width: largura }}>
      <aside
        ref={refPainel}
        aria-label={titulo}
        className="mercado-painel-in pointer-events-auto sticky top-3 flex max-h-[calc(100dvh-24px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float"
      >
        {corpo}
      </aside>
    </div>
  );
}
