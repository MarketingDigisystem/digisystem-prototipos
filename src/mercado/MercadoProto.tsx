/*
PROTÓTIPO DESCARTÁVEL — não é o app.
Gerado de: src/hub/pages/marca/mercado/ no Lovable (origin/main) @ leitura 2026-11-26.
Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
Decisão de design correspondente: docs-marketing-hub/implementacao/analise-redesign-mercado-2026-11-25.md.
*/
import { useCallback, useEffect, useRef, useState } from "react";
import { GitCompareArrows, Grid2x2, LayoutGrid } from "lucide-react";
import { CompararLadoALado } from "./CompararLadoALado";
import { ConcorrentesGrade } from "./ConcorrentesGrade";
import { MatrizProto } from "./MatrizProto";
import { alternar, LIMITE_COMPARAR, MINIMO_COMPARAR, podeComparar, type Selecao } from "./selecao-comparar";
import { BOTAO_SECUNDARIO, CONC_POR_ID, DADOS } from "./ui";

type Aba = "concorrentes" | "comparativo" | "matriz";

const ABAS: { id: Aba; rotulo: string; Icon: typeof LayoutGrid }[] = [
  { id: "concorrentes", rotulo: "Concorrentes", Icon: LayoutGrid },
  { id: "comparativo", rotulo: "Comparativo", Icon: GitCompareArrows },
  { id: "matriz", rotulo: "Matriz", Icon: Grid2x2 },
];

const ESTILO = `
@keyframes mercado-painel-in { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
.mercado-painel-in { animation: mercado-painel-in .2s ease-out; }
@media (prefers-reduced-motion: reduce) {
  .mercado-painel-in { animation: none; }
  .mercado-proto * { scroll-behavior: auto !important; transition-duration: 0s !important; }
}
`;

/** Estado inicial vindo do hash: #/mercado?aba=matriz&abrir=accenture&comparar=accenture,brq (slugs). */
function lerHash(): { aba: Aba; aberto: string | null; selecao: Selecao } {
  const q = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  const a = q.get("aba");
  const porSlug = (s: string) => DADOS.concorrentes.find((c) => c.slug === s)?.id;
  const aberto = q.get("abrir") ? porSlug(q.get("abrir")!) ?? null : null;
  const selecao = (q.get("comparar") ?? "")
    .split(",")
    .map(porSlug)
    .filter((x): x is string => Boolean(x))
    .slice(0, LIMITE_COMPARAR);
  return { aba: a === "comparativo" || a === "matriz" ? a : "concorrentes", aberto, selecao };
}

export function MercadoProto() {
  const inicial = useRef(lerHash()).current;
  const [aba, setAba] = useState<Aba>(inicial.aba);
  const [selecao, setSelecao] = useState<Selecao>(inicial.selecao);
  const [abertoId, setAbertoId] = useState<string | null>(inicial.aberto);
  const [aviso, setAviso] = useState<string | null>(null);
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => {
    document.title = "Mercado (protótipo)";
    return () => window.clearTimeout(temporizador.current);
  }, []);

  const irPara = useCallback((a: Aba) => {
    setAba(a);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/mercado${a === "concorrentes" ? "" : `?aba=${a}`}`);
    window.scrollTo({ top: 0 });
  }, []);

  const alternarSelecao = useCallback(
    (id: string) => {
      const r = alternar(selecao, id);
      setSelecao(r.selecao);
      window.clearTimeout(temporizador.current);
      if (r.limite) {
        setAviso(`Limite de ${LIMITE_COMPARAR} concorrentes. Tire um para incluir outro.`);
        temporizador.current = window.setTimeout(() => setAviso(null), 4000);
      } else {
        setAviso(null);
      }
    },
    [selecao],
  );

  const abrirConcorrente = useCallback(
    (id: string) => {
      setAbertoId(id);
      if (aba !== "concorrentes") irPara("concorrentes");
    },
    [aba, irPara],
  );

  const nomes = selecao.map((id) => CONC_POR_ID.get(id)?.nome).filter(Boolean).join(", ");

  return (
    <div className="mercado-proto min-h-dvh bg-background font-sans text-foreground">
      <style>{ESTILO}</style>
      <div className="mx-auto w-full max-w-[1840px] px-[clamp(16px,2.5vw,40px)] pb-28 pt-5">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="font-display text-[14px] font-semibold uppercase tracking-wide text-muted-foreground">Marca</p>
            <h1 className="font-display text-[clamp(28px,3vw,36px)] font-bold leading-none text-navy">Mercado</h1>
          </div>
          <div role="tablist" aria-label="Visões de Mercado" className="flex w-full flex-wrap gap-2 min-[640px]:w-auto">
            {ABAS.map(({ id, rotulo, Icon }) => {
              const ativa = aba === id;
              return (
                <button
                  key={id}
                  id={`aba-${id}`}
                  role="tab"
                  type="button"
                  aria-selected={ativa}
                  aria-controls={`painel-${id}`}
                  onClick={() => irPara(id)}
                  className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-5 font-display text-[16px] font-semibold motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy min-[640px]:w-[172px] min-[640px]:flex-none ${
                    ativa ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy hover:bg-navy-soft"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {rotulo}
                </button>
              );
            })}
          </div>
        </header>

        <div id="painel-concorrentes" role="tabpanel" aria-labelledby="aba-concorrentes" hidden={aba !== "concorrentes"}>
          <ConcorrentesGrade selecao={selecao} onAlternar={alternarSelecao} abertoId={abertoId} onAbrir={setAbertoId} onFechar={() => setAbertoId(null)} />
        </div>
        <div id="painel-comparativo" role="tabpanel" aria-labelledby="aba-comparativo" hidden={aba !== "comparativo"}>
          {aba === "comparativo" && (
            <CompararLadoALado
              selecao={selecao}
              onAlternar={alternarSelecao}
              onLimpar={() => setSelecao([])}
              onDefinir={(ids) => setSelecao(ids.slice(0, LIMITE_COMPARAR))}
              onAbrir={abrirConcorrente}
              aviso={aviso}
            />
          )}
        </div>
        <div id="painel-matriz" role="tabpanel" aria-labelledby="aba-matriz" hidden={aba !== "matriz"}>
          {aba === "matriz" && <MatrizProto onAbrirConcorrente={abrirConcorrente} />}
        </div>
      </div>

      {/* Barra de comparação: posição e altura fixas; só alterna visível/oculta (reserva de 112 px no rodapé da página). */}
      <div
        role="region"
        aria-label="Comparação"
        className={`fixed inset-x-0 bottom-0 z-40 px-[clamp(16px,2.5vw,40px)] pb-3 motion-safe:transition-opacity ${selecao.length > 0 ? "opacity-100" : "pointer-events-none invisible opacity-0"}`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1760px] items-center gap-3 rounded-2xl border border-navy bg-card px-4 shadow-float">
          <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-foreground" aria-live="polite">
            {aviso ?? (
              <>
                {selecao.length} {selecao.length === 1 ? "selecionado" : "selecionados"}
                <span className="hidden font-normal text-muted-foreground min-[900px]:inline"> · {nomes}</span>
                {!podeComparar(selecao) && <span className="font-normal text-muted-foreground"> · escolha de {MINIMO_COMPARAR} a {LIMITE_COMPARAR}</span>}
              </>
            )}
          </p>
          <button type="button" className={BOTAO_SECUNDARIO} onClick={() => setSelecao([])}>
            Limpar
          </button>
          <button
            type="button"
            disabled={!podeComparar(selecao)}
            onClick={() => irPara("comparativo")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-navy bg-navy px-5 font-display text-[15px] font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GitCompareArrows className="size-4" aria-hidden />
            Comparar
          </button>
        </div>
      </div>
    </div>
  );
}
