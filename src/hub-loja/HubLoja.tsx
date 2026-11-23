// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/Loja.tsx e src/hub/components/sidebar/modulos.ts @ origin/main aff470d (2026-11-19).
// Fonte da verdade = Lovable/GitHub. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-2026-11-19.md
// Rodada 1: Pedidos e Estoque. Rodada 2: Solicitações e Cadastro (rascunho automático ao aprovar sugestão).
// Métricas, Acesso, Retirada e Ponte ficam como "próxima rodada".
import { useEffect, useState } from "react";
import { Search, Sun } from "lucide-react";
import "./hub-loja.css";
import { BRINDES, MAIS, MOVS, PEDIDOS, REPOSICOES, SUGESTOES, type Brinde, type MaisUnidades, type Mov, type Pedido, type Reposicao, type Sugestao } from "./dados";
import { Pedidos } from "./Pedidos";
import { Estoque } from "./Estoque";
import { Solicitacoes } from "./Solicitacoes";
import { Cadastro } from "./Cadastro";
import { CARTAO, ToastProvider, cx, useCarregando, Shimmer } from "./ui";

const BASE = import.meta.env.BASE_URL;
const MODULOS = ["Início", "Tarefas", "Posts", "Tendências", "Marca", "Resultados", "Loja", "Configurações"];
type Aba = "pedidos" | "estoque" | "cadastro" | "metricas" | "acesso" | "solicitacoes" | "retirada" | "ponte";
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "pedidos", rotulo: "Pedidos" },
  { id: "estoque", rotulo: "Estoque" },
  { id: "cadastro", rotulo: "Cadastro" },
  { id: "metricas", rotulo: "Métricas" },
  { id: "acesso", rotulo: "Acesso" },
  { id: "solicitacoes", rotulo: "Solicitações" },
  { id: "retirada", rotulo: "Retirada" },
  { id: "ponte", rotulo: "Ponte" },
];
const abaDoHash = (): Aba => {
  const seg = window.location.hash.replace(/^#\/?/, "").split(/[/?]/)[1] as Aba | undefined;
  return ABAS.some((a) => a.id === seg) ? (seg as Aba) : "pedidos";
};

export interface Loja {
  pedidos: Pedido[]; setPedidos: (f: (p: Pedido[]) => Pedido[]) => void;
  brindes: Brinde[]; setBrindes: (f: (b: Brinde[]) => Brinde[]) => void;
  movs: Mov[]; setMovs: (f: (m: Mov[]) => Mov[]) => void;
  reposicoes: Reposicao[]; setReposicoes: (f: (r: Reposicao[]) => Reposicao[]) => void;
  sugestoes: Sugestao[]; setSugestoes: (f: (s: Sugestao[]) => Sugestao[]) => void;
  mais: MaisUnidades[]; setMais: (f: (m: MaisUnidades[]) => MaisUnidades[]) => void;
  irPara: (aba: Aba, query?: string) => void;
}

export function HubLoja() {
  const [aba, setAba] = useState<Aba>(abaDoHash);
  const [pedidos, setPedidos] = useState(PEDIDOS);
  const [brindes, setBrindes] = useState(BRINDES);
  const [movs, setMovs] = useState(MOVS);
  const [reposicoes, setReposicoes] = useState(REPOSICOES);
  const [sugestoes, setSugestoes] = useState(SUGESTOES);
  const [mais, setMais] = useState(MAIS);
  useEffect(() => {
    const f = () => setAba(abaDoHash());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const irPara = (a: Aba, query = "") => { window.location.hash = `#/hub-loja/${a}${query}`; };
  const loja: Loja = { pedidos, setPedidos, brindes, setBrindes, movs, setMovs, reposicoes, setReposicoes, sugestoes, setSugestoes, mais, setMais, irPara };
  const carregando = useCarregando(aba, 600);
  const nAbertas = sugestoes.filter((s) => s.estado === "aberta").length + mais.filter((m) => m.estado === "aberta").length;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background font-sans text-foreground">
        <header className="hl-nao-imprime border-b border-border bg-card">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-6">
            <img src={`${BASE}mkthub/horizontal-colorido.png`} alt="MKT Hub" className="h-7 w-auto" />
            <nav aria-label="Módulos" className="hidden flex-1 justify-center gap-1 lg:flex">
              {MODULOS.map((m) => (
                <span key={m} className={cx("relative inline-flex min-h-11 items-center px-3 text-sm font-semibold", m === "Loja" ? "text-primary" : "text-muted-foreground")}>
                  {m}
                  {m === "Loja" ? <span className="absolute inset-x-3 -bottom-[11px] h-0.5 rounded-full bg-primary" /> : null}
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground md:flex">
                <Search className="h-4 w-4" aria-hidden /> Buscar card, post ou pedido
              </div>
              <Sun className="h-5 w-5 text-muted-foreground" aria-hidden />
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#d8c7b0] text-xs font-bold text-primary">ML</span>
            </div>
          </div>
          <nav aria-label="Abas da Loja" className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4">
            {ABAS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => irPara(a.id)}
                aria-current={aba === a.id ? "page" : undefined}
                className={cx("relative inline-flex min-h-12 shrink-0 items-center px-3 text-sm font-semibold transition-colors", aba === a.id ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                {a.rotulo}
                <span className={cx("hl-cresce absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary", aba === a.id ? "scale-x-100" : "scale-x-0")} />
              </button>
            ))}
          </nav>
        </header>
        {/* Barra fina de carregamento ao trocar de sub-aba (não ocupa espaço). */}
        <div className="relative h-0.5 overflow-hidden">{carregando ? <div className="hl-barra absolute inset-y-0 left-0 w-1/3 bg-accent" /> : null}</div>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
          {aba === "pedidos" ? <Pedidos loja={loja} carregando={carregando} /> : null}
          {aba === "estoque" ? <Estoque loja={loja} carregando={carregando} /> : null}
          {aba === "solicitacoes" ? <Solicitacoes loja={loja} carregando={carregando} /> : null}
          {aba === "cadastro" ? <Cadastro loja={loja} carregando={carregando} /> : null}
          {!["pedidos", "estoque", "solicitacoes", "cadastro"].includes(aba) ? <ProximaRodada aba={ABAS.find((x) => x.id === aba)!.rotulo} carregando={carregando} /> : null}
        </main>
      </div>
    </ToastProvider>
  );
}

function ProximaRodada({ aba, carregando }: { aba: string; carregando: boolean }) {
  if (carregando) return <Shimmer className="h-48 w-full" />;
  return (
    <div className={cx(CARTAO, "hl-entra mx-auto max-w-xl p-8 text-center")}>
      <h1 className="font-display text-2xl font-bold text-primary">{aba}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Esta sub-aba entra numa próxima rodada do protótipo. Por enquanto o foco é Pedidos, Estoque, Solicitações e Cadastro.
      </p>
    </div>
  );
}