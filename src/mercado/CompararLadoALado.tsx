/*
PROTÓTIPO DESCARTÁVEL — não é o app.
Gerado de: src/hub/pages/marca/mercado/ no Lovable (origin/main) @ leitura 2026-11-26.
Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
Decisão de design correspondente: docs-marketing-hub/implementacao/analise-redesign-mercado-2026-11-25.md.
*/
import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeftRight, Check, Eye, X } from "lucide-react";
import { LIMITE_COMPARAR, MINIMO_COMPARAR } from "./selecao-comparar";
import type { Concorrente } from "./dados";
import { DICA_QUADRANTE, ROTULO_QUADRANTE } from "./dados";
import {
  BOTAO_SECUNDARIO,
  CONC_POR_ID,
  DADOS,
  fmtData,
  ITEM_POR_ID,
  listaDiferenciais,
  Logo,
  Pill,
  Pips,
  porRisco,
  rotuloPorte,
  SEG_POR_ID,
  SeloRisco,
  SINAIS,
  situacaoDe,
} from "./ui";

interface Linha {
  id: string;
  rotulo: string;
  /** Texto que decide se a linha "difere" entre as colunas. */
  chave: (c: Concorrente) => string;
  celula: (c: Concorrente, todos: Concorrente[]) => ReactNode;
}

/** Itens (ids) presentes em todas as colunas. */
function emTodos(todos: Concorrente[], pegar: (c: Concorrente) => string[]): Set<string> {
  const [primeiro, ...resto] = todos.map((c) => new Set(pegar(c)));
  return new Set([...(primeiro ?? [])].filter((id) => resto.every((s) => s.has(id))));
}

function ListaMarcada({ ids, comuns, nome }: { ids: string[]; comuns: Set<string>; nome: (id: string) => string }) {
  if (ids.length === 0) return <span className="text-muted-foreground">Nenhum</span>;
  return (
    <ul className="grid gap-1">
      {ids.map((id) => {
        const comum = comuns.has(id);
        return (
          <li key={id} className={`flex items-start gap-1.5 ${comum ? "text-foreground" : "font-semibold text-navy"}`}>
            <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${comum ? "bg-muted-foreground" : "bg-orange"}`} aria-hidden />
            <span>
              {nome(id)}
              <span className="sr-only">{comum ? " (em todos)" : " (só em alguns)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const LINHAS: Linha[] = [
  {
    id: "risco",
    rotulo: "Risco para a Digisystem",
    chave: (c) => String(c.ficha.risco),
    celula: (c) => (
      <div className="grid gap-2">
        <SeloRisco nivel={c.ficha.risco} />
        <p className="text-[13px] leading-relaxed text-muted-foreground">{c.ficha.riscoMotivo ?? "Sem motivo registrado."}</p>
      </div>
    ),
  },
  {
    id: "situacao",
    rotulo: "Situação",
    chave: (c) => situacaoDe(c) ?? "",
    celula: (c) => {
      const s = situacaoDe(c);
      return s ? (
        <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-[13px] font-semibold text-foreground">{s}</span>
      ) : (
        <span className="text-muted-foreground">Ativa</span>
      );
    },
  },
  ...SINAIS.map<Linha>((s) => ({
    id: `sinal-${s.k}`,
    rotulo: s.longo,
    chave: (c) => String(c.sinais?.[s.k] ?? "-"),
    celula: (c) =>
      c.sinais ? (
        <span className="flex items-center gap-2">
          <Pips valor={c.sinais[s.k]} />
          <span>{s.niveis[c.sinais[s.k]]}</span>
          <span className="sr-only">{c.sinais[s.k]} de 3</span>
        </span>
      ) : (
        <span className="text-muted-foreground">Não avaliado</span>
      ),
  })),
  {
    id: "porte",
    rotulo: "Porte (dado público)",
    chave: (c) => rotuloPorte(c),
    celula: (c) => (
      <span>
        <span className="font-semibold">{rotuloPorte(c)}.</span> {c.ficha.porte ?? "Sem dado público."}
      </span>
    ),
  },
  {
    id: "presenca",
    rotulo: "Presença regional",
    chave: (c) => c.presencaRegional ?? "",
    celula: (c) => c.presencaRegional ?? <span className="text-muted-foreground">Não mapeada</span>,
  },
  {
    id: "segmentos",
    rotulo: "Segmentos em comum com a Digisystem",
    chave: (c) => [...c.segmentosEmComum].sort().join("|"),
    celula: (c, todos) => (
      <ListaMarcada ids={c.segmentosEmComum} comuns={emTodos(todos, (x) => x.segmentosEmComum)} nome={(id) => SEG_POR_ID.get(id)?.nome ?? id} />
    ),
  },
  {
    id: "oferta",
    rotulo: "Oferta que sobrepõe a nossa",
    chave: (c) => [...c.ofertaSobreposta].sort().join("|"),
    celula: (c, todos) => (
      <div className="grid gap-1.5">
        <span className="text-[13px] font-semibold text-muted-foreground">
          {c.ofertaSobreposta.length} de {DADOS.itens.length} itens
        </span>
        <ListaMarcada ids={c.ofertaSobreposta} comuns={emTodos(todos, (x) => x.ofertaSobreposta)} nome={(id) => ITEM_POR_ID.get(id)?.nome ?? id} />
      </div>
    ),
  },
  {
    id: "diferenciais",
    rotulo: "Diferenciais",
    chave: (c) => c.ficha.diferenciais ?? "",
    celula: (c) => {
      const l = listaDiferenciais(c.ficha.diferenciais);
      return l.length === 0 ? (
        <span className="text-muted-foreground">Não informados</span>
      ) : (
        <ul className="grid gap-1.5">
          {l.map((d) => (
            <li key={d} className="flex items-start gap-1.5">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange" aria-hidden />
              {d}
            </li>
          ))}
        </ul>
      );
    },
  },
  {
    id: "swot",
    rotulo: "SWOT resumido",
    chave: (c) => c.swot.status + c.swot.itens.forcas.length,
    celula: (c) =>
      c.swot.status === "pendente" ? (
        <span className="inline-flex rounded-full border border-dashed border-border px-2.5 py-1 text-[13px] font-semibold text-muted-foreground">SWOT pendente</span>
      ) : (
        <div className="grid gap-2">
          {(["forcas", "ameacas"] as const).map((q) => (
            <div key={q}>
              <p className="text-[13px] font-semibold text-navy">
                {ROTULO_QUADRANTE[q]}
                <span className="font-normal text-muted-foreground"> · {DICA_QUADRANTE[q]}</span>
              </p>
              <ul className="mt-0.5 grid gap-1 text-[13px] leading-relaxed">
                {c.swot.itens[q].slice(0, 2).map((t) => (
                  <li key={t} className="line-clamp-3">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-[13px] text-muted-foreground">Gerado em {fmtData(c.swot.geradoEm)}</p>
        </div>
      ),
  },
];

export function CompararLadoALado({
  selecao,
  onAlternar,
  onLimpar,
  onDefinir,
  onAbrir,
  aviso,
}: {
  selecao: readonly string[];
  onAlternar: (id: string) => void;
  onLimpar: () => void;
  onDefinir: (ids: string[]) => void;
  onAbrir: (id: string) => void;
  aviso: string | null;
}) {
  const [soDiferencas, setSoDiferencas] = useState(false);
  const cols = selecao.map((id) => CONC_POR_ID.get(id)).filter((c): c is Concorrente => Boolean(c));
  const disponiveis = useMemo(() => DADOS.concorrentes.filter((c) => !selecao.includes(c.id)).sort(porRisco), [selecao]);
  const pronto = cols.length >= MINIMO_COMPARAR;

  const linhas = useMemo(
    () =>
      LINHAS.map((l) => ({ l, difere: pronto && new Set(cols.map((c) => l.chave(c))).size > 1 })).filter((x) => !soDiferencas || x.difere || !pronto),
    [cols, pronto, soDiferencas],
  );
  const totalDifere = pronto ? LINHAS.filter((l) => new Set(cols.map((c) => l.chave(c))).size > 1).length : 0;

  return (
    <div>
      {/* Seleção: altura estável, mesmos controles nos três estados. */}
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
        <div className="flex flex-wrap items-center gap-2" aria-label="Concorrentes na comparação" role="group">
          <span className="mr-1 text-[14px] font-semibold text-foreground">
            Comparando {cols.length} de {LIMITE_COMPARAR}
          </span>
          {cols.map((c) => (
            <span key={c.id} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy bg-navy-soft pl-3 text-[14px] font-semibold text-navy">
              {c.nome}
              <button
                type="button"
                onClick={() => onAlternar(c.id)}
                aria-label={`Tirar ${c.nome} da comparação`}
                className="inline-flex size-11 items-center justify-center rounded-full hover:bg-navy-soft focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy"
              >
                <X className="size-4" aria-hidden />
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="add-comparar" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-foreground">
            Adicionar
          </label>
          <select
            id="add-comparar"
            value=""
            disabled={cols.length >= LIMITE_COMPARAR}
            onChange={(e) => e.target.value && onAlternar(e.target.value)}
            className="min-h-11 w-full min-w-0 rounded-full border border-border bg-background px-4 text-[15px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:opacity-60 min-[640px]:w-[380px]"
          >
            <option value="">{cols.length >= LIMITE_COMPARAR ? "Limite de 4 atingido" : "Escolher concorrente (do maior risco ao menor)"}</option>
            {disponiveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} · risco {c.ficha.risco ?? "sem ficha"}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={BOTAO_SECUNDARIO}
            onClick={() => onDefinir(DADOS.concorrentes.slice().sort(porRisco).slice(0, LIMITE_COMPARAR).map((c) => c.id))}
          >
            Os 4 de maior risco
          </button>
          <button type="button" className={BOTAO_SECUNDARIO} onClick={onLimpar} disabled={cols.length === 0}>
            Limpar
          </button>
          <div role="group" aria-label="Linhas exibidas" className="ml-auto flex flex-wrap items-center gap-2">
            <Pill ativo={!soDiferencas} onClick={() => setSoDiferencas(false)}>
              <Eye className="size-4" aria-hidden />
              Todas as linhas
            </Pill>
            <Pill ativo={soDiferencas} onClick={() => setSoDiferencas(true)}>
              <ArrowLeftRight className="size-4" aria-hidden />
              {pronto ? `Só o que difere (${totalDifere})` : "Só o que difere"}
            </Pill>
          </div>
        </div>
        <p className="min-h-5 text-[13px] text-muted-foreground" aria-live="polite">
          {aviso ?? (pronto ? "Linhas com “Difere” têm valores diferentes entre as colunas. Itens em laranja existem só em parte dos concorrentes." : `Escolha de ${MINIMO_COMPARAR} a ${LIMITE_COMPARAR} concorrentes para comparar.`)}
        </p>
      </div>

      {!pronto ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="font-display text-[22px] font-bold text-navy">Escolha pelo menos {MINIMO_COMPARAR} concorrentes</p>
          <p className="mx-auto mt-1 max-w-lg text-[14px] text-muted-foreground">
            Use o campo acima, marque “Comparar” nos cartões da aba Concorrentes ou comece pelos quatro de maior risco.
          </p>
        </div>
      ) : (
        <div className="relative max-h-[calc(100dvh-210px)] min-h-[420px] overflow-auto rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full table-fixed border-separate border-spacing-0 text-left text-[14px]" style={{ minWidth: 132 + cols.length * 240 }}>
            <colgroup>
              <col className="w-[132px] min-[900px]:w-[190px]" />
              {cols.map((c) => (
                <col key={c.id} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 top-0 z-30 border-b border-r border-border bg-card p-3 text-[13px] font-semibold text-muted-foreground">
                  Atributo
                </th>
                {cols.map((c) => (
                  <th key={c.id} scope="col" className="sticky top-0 z-20 border-b border-border bg-card p-3 align-top">
                    <div className="flex items-center gap-2.5">
                      <Logo c={c} tam={40} />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-display text-[18px] font-bold leading-tight text-navy">{c.nome}</p>
                        <button
                          type="button"
                          onClick={() => onAbrir(c.id)}
                          className="mt-0.5 inline-flex min-h-11 items-center text-[13px] font-semibold text-navy underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                        >
                          Ver ficha completa
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map(({ l, difere }) => (
                <tr key={l.id}>
                  <th scope="row" className="sticky left-0 z-10 border-b border-r border-border bg-card p-3 align-top text-[13px] font-semibold text-foreground">
                    {l.rotulo}
                    <span
                      className={`mt-1.5 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${
                        difere ? "bg-orange-soft text-[#7a3000]" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {difere ? <ArrowLeftRight className="size-3" aria-hidden /> : <Check className="size-3" aria-hidden />}
                      {difere ? "Difere" : "Igual"}
                    </span>
                  </th>
                  {cols.map((c) => (
                    <td key={c.id} className={`border-b border-border p-3 align-top leading-relaxed text-foreground ${difere ? "bg-orange-soft/40" : ""}`}>
                      {l.celula(c, cols)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

