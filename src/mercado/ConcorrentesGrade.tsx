/*
PROTÓTIPO DESCARTÁVEL — não é o app.
Gerado de: src/hub/pages/marca/mercado/ no Lovable (origin/main) @ leitura 2026-11-26.
Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
Decisão de design correspondente: docs-marketing-hub/implementacao/analise-redesign-mercado-2026-11-25.md.
*/
import { useMemo, useState } from "react";
import { MapPin, Search, X, CircleCheck, CircleDashed } from "lucide-react";
import type { Concorrente, NivelRisco } from "./dados";
import { DetalheLateral } from "./DetalheLateral";
import {
  BOTAO_SECUNDARIO,
  DADOS,
  Logo,
  normalizar,
  Pill,
  porRisco,
  rotuloPorte,
  SEG_POR_ID,
  SeloRisco,
  SinaisBarra,
  situacaoDe,
  useMinWidth,
} from "./ui";

type FiltroRisco = "todos" | NivelRisco;
type Ordem = "risco" | "nome" | "porte";
type Densidade = "confortavel" | "compacta";

const FILTROS: FiltroRisco[] = ["todos", 5, 4, 3, 2, 1];
const TODOS = DADOS.concorrentes;
const CONTAGEM = (f: FiltroRisco) => (f === "todos" ? TODOS.length : TODOS.filter((c) => c.ficha.risco === f).length);

function Cartao({
  c,
  compacta,
  aberto,
  marcado,
  onAbrir,
  onAlternar,
}: {
  c: Concorrente;
  compacta: boolean;
  aberto: boolean;
  marcado: boolean;
  onAbrir: () => void;
  onAlternar: () => void;
}) {
  const segs = c.segmentosEmComum.map((id) => SEG_POR_ID.get(id)?.nome ?? id);
  const maxSegs = compacta ? 2 : 3;
  const situacao = situacaoDe(c);
  return (
    <li
      className={`flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card motion-safe:transition-colors ${
        aberto ? "border-navy ring-2 ring-navy" : "border-border hover:border-navy/50"
      }`}
    >
      <button
        type="button"
        onClick={onAbrir}
        aria-label={`Abrir detalhes de ${c.nome}`}
        aria-current={aberto ? "true" : undefined}
        className={`flex w-full flex-1 flex-col text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-navy ${compacta ? "gap-2.5 p-3" : "gap-3 p-4"}`}
      >
        <span className="flex items-center gap-3">
          <Logo c={c} tam={compacta ? 40 : 48} />
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 block font-display text-[19px] font-bold leading-tight text-navy">{c.nome}</span>
            <span className="block truncate text-[13px] text-muted-foreground">Porte {rotuloPorte(c).toLowerCase()}</span>
          </span>
        </span>

        <span className="flex flex-wrap items-center gap-2">
          <SeloRisco nivel={c.ficha.risco} />
          {situacao && <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[13px] font-semibold text-foreground">{situacao}</span>}
          <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
            {c.swot.status === "pronta" ? <CircleCheck className="size-3.5" aria-hidden /> : <CircleDashed className="size-3.5" aria-hidden />}
            {c.swot.status === "pronta" ? "SWOT pronto" : "SWOT pendente"}
          </span>
        </span>

        <span className="flex flex-wrap gap-1.5">
          {segs.length === 0 && <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-[13px] text-muted-foreground">Sem segmento em comum</span>}
          {segs.slice(0, maxSegs).map((s) => (
            <span key={s} className="rounded-full bg-navy-soft px-2.5 py-1 text-[13px] font-semibold text-navy">
              {s}
            </span>
          ))}
          {segs.length > maxSegs && <span className="rounded-full bg-muted px-2.5 py-1 text-[13px] font-semibold text-foreground">+{segs.length - maxSegs}</span>}
        </span>

        {!compacta && (
          <span className="flex items-start gap-1.5 text-[13px] leading-snug text-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-navy" aria-hidden />
            <span className="line-clamp-2">{c.presencaRegional ?? "Presença regional não mapeada."}</span>
          </span>
        )}

        <span className="mt-auto block border-t border-border pt-2.5">
          <SinaisBarra sinais={c.sinais} />
        </span>
      </button>

      <label
        className={`flex min-h-11 cursor-pointer items-center gap-3 border-t border-border px-4 text-[14px] font-semibold text-navy ${marcado ? "bg-navy-soft" : "hover:bg-navy-soft"}`}
      >
        <input
          type="checkbox"
          checked={marcado}
          onChange={onAlternar}
          className="size-5 shrink-0 cursor-pointer accent-[#36499b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        />
        Comparar
        <span className="sr-only"> {c.nome}</span>
      </label>
    </li>
  );
}

export function ConcorrentesGrade({
  selecao,
  onAlternar,
  abertoId,
  onAbrir,
  onFechar,
}: {
  selecao: readonly string[];
  onAlternar: (id: string) => void;
  abertoId: string | null;
  onAbrir: (id: string) => void;
  onFechar: () => void;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroRisco>("todos");
  const [ordem, setOrdem] = useState<Ordem>("risco");
  const [densidade, setDensidade] = useState<Densidade>("confortavel");
  const lateral = useMinWidth(1366);
  const compacta = densidade === "compacta";

  const lista = useMemo(() => {
    const q = normalizar(busca.trim());
    const base = TODOS.filter((c) => {
      if (filtro !== "todos" && c.ficha.risco !== filtro) return false;
      if (!q) return true;
      const alvo = normalizar([c.nome, c.descricao ?? "", ...c.segmentosEmComum.map((id) => SEG_POR_ID.get(id)?.nome ?? "")].join(" "));
      return alvo.includes(q);
    });
    const copia = [...base];
    if (ordem === "nome") copia.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    else if (ordem === "porte") copia.sort((a, b) => (b.sinais?.porte ?? -1) - (a.sinais?.porte ?? -1) || porRisco(a, b));
    else copia.sort(porRisco);
    return copia;
  }, [busca, filtro, ordem]);

  const aberto = abertoId ? TODOS.find((c) => c.id === abertoId) ?? null : null;
  const colunas = compacta
    ? "grid-cols-1 min-[640px]:grid-cols-2 min-[1000px]:grid-cols-4 min-[1700px]:grid-cols-5"
    : "grid-cols-1 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3 min-[1700px]:grid-cols-4";

  return (
    <div>
      {/* Controles: posição fixa; o painel de detalhe nasce abaixo deles e nunca os cobre. */}
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-card p-3 shadow-card min-[1366px]:grid-cols-[minmax(0,1fr)_auto] min-[1366px]:items-center">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <label htmlFor="busca-conc" className="sr-only">
                Buscar concorrente
              </label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="busca-conc"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou segmento"
                className="min-h-11 w-full rounded-full border border-border bg-background pl-10 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
              />
            </div>
            <div role="group" aria-label="Ordenar por" className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-muted-foreground">Ordenar</span>
              {(["risco", "nome", "porte"] as Ordem[]).map((o) => (
                <Pill key={o} ativo={ordem === o} onClick={() => setOrdem(o)} className="px-3.5">
                  {o === "risco" ? "Risco" : o === "nome" ? "Nome" : "Porte"}
                </Pill>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por risco">
            {FILTROS.map((f) => (
              <Pill key={f} ativo={filtro === f} onClick={() => setFiltro(f)} rotulo={f === "todos" ? `Todos, ${CONTAGEM(f)} concorrentes` : `Risco ${f}, ${CONTAGEM(f)} concorrentes`}>
                {f === "todos" ? "Todos" : `Risco ${f}`}
                <span aria-hidden className={`rounded-full px-2 text-[13px] font-semibold ${filtro === f ? "bg-white/20" : "bg-navy-soft"}`}>
                  {CONTAGEM(f)}
                </span>
              </Pill>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 min-[1366px]:justify-end" role="group" aria-label="Densidade dos cartões">
          <span className="text-[13px] font-semibold text-muted-foreground">Densidade</span>
          <Pill ativo={!compacta} onClick={() => setDensidade("confortavel")}>
            Confortável
          </Pill>
          <Pill ativo={compacta} onClick={() => setDensidade("compacta")}>
            Compacta
          </Pill>
        </div>
      </div>

      <p className="mb-3 text-[14px] font-semibold text-foreground" aria-live="polite">
        {lista.length === TODOS.length ? `${lista.length} concorrentes acompanhados` : `${lista.length} de ${TODOS.length} concorrentes`}
      </p>

      <div className="relative min-h-[70dvh]">
        {lista.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="font-display text-[20px] font-bold text-navy">Nenhum concorrente com esses filtros</p>
            <p className="mx-auto mt-1 max-w-md text-[14px] text-muted-foreground">Tire a busca ou volte para “Todos” para ver os {TODOS.length} concorrentes.</p>
            <button
              type="button"
              className={`${BOTAO_SECUNDARIO} mt-4`}
              onClick={() => {
                setBusca("");
                setFiltro("todos");
              }}
            >
              <X className="size-4" aria-hidden />
              Limpar filtros
            </button>
          </div>
        ) : (
          <ul className={`grid items-stretch gap-4 ${colunas}`}>
            {lista.map((c) => (
              <Cartao
                key={c.id}
                c={c}
                compacta={compacta}
                aberto={c.id === abertoId}
                marcado={selecao.includes(c.id)}
                onAbrir={() => (c.id === abertoId ? onFechar() : onAbrir(c.id))}
                onAlternar={() => onAlternar(c.id)}
              />
            ))}
          </ul>
        )}
        <DetalheLateral c={aberto} modo={lateral ? "lateral" : "sheet"} marcado={aberto ? selecao.includes(aberto.id) : false} onAlternar={onAlternar} onFechar={onFechar} />
      </div>
    </div>
  );
}
