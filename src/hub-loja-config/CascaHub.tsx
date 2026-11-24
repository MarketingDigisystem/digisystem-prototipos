// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/Loja.tsx e src/hub/components/sidebar/modulos.ts, via prototipos/react/src/hub-loja/HubLoja.tsx @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import { type ReactNode } from "react";
import { Search, Sun } from "lucide-react";
import { cx, useCarregando } from "../hub-loja/ui";

const BASE = import.meta.env.BASE_URL;
const MODULOS = ["Início", "Tarefas", "Posts", "Tendências", "Marca", "Resultados", "Loja", "Configurações"];

export type AbaConfig = "metricas" | "retirada" | "acesso" | "ponte";
export type AbaLoja = "pedidos" | "estoque" | "cadastro" | "solicitacoes";
export type AbaId = AbaLoja | AbaConfig;

/** As 8 abas, na ordem do Hub real. `nova` = vive neste protótipo; as outras levam ao protótipo anterior. */
export const ABAS: { id: AbaId; rotulo: string; nova: boolean }[] = [
  { id: "pedidos", rotulo: "Pedidos", nova: false },
  { id: "estoque", rotulo: "Estoque", nova: false },
  { id: "cadastro", rotulo: "Cadastro", nova: false },
  { id: "metricas", rotulo: "Métricas", nova: true },
  { id: "acesso", rotulo: "Acesso", nova: true },
  { id: "solicitacoes", rotulo: "Solicitações", nova: false },
  { id: "retirada", rotulo: "Retirada", nova: true },
  { id: "ponte", rotulo: "Ponte", nova: true },
];

/** Cabeçalho do Hub (marcação duplicada de propósito: o do protótipo anterior é inline e não pode ser editado). */
export function CascaHub({
  aba,
  aoAbrirAbaNova,
  aoAbrirAbaAnterior,
  children,
}: {
  aba: AbaConfig;
  aoAbrirAbaNova: (id: AbaConfig) => void;
  aoAbrirAbaAnterior: (id: AbaLoja) => void;
  children: ReactNode;
}) {
  // Barra fina de carregamento ao trocar de aba (450 ms). Sempre presente, mesmo vazia: 2 px fixos.
  const carregando = useCarregando(aba, 450);
  return (
    <>
      <header data-ancora="cabecalho" className="hl-nao-imprime border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 sm:px-6">
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
        {/* Só esta barra rola na horizontal abaixo de 1024 px. */}
        <nav data-ancora="barra-abas" aria-label="Abas da Loja" className="hlc-abas mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4">
          {ABAS.map((a) => {
            const ativa = a.nova && aba === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => (a.nova ? aoAbrirAbaNova(a.id as AbaConfig) : aoAbrirAbaAnterior(a.id as AbaLoja))}
                aria-current={ativa ? "page" : undefined}
                className={cx(
                  "relative inline-flex min-h-12 min-w-11 shrink-0 items-center px-3 text-sm font-semibold transition-colors",
                  ativa ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {a.rotulo}
                <span className={cx("hl-cresce absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary", ativa ? "scale-x-100" : "scale-x-0")} />
              </button>
            );
          })}
        </nav>
      </header>
      <div className="relative h-0.5 overflow-hidden" aria-hidden>
        {carregando ? <div className="hl-barra absolute inset-y-0 left-0 w-1/3 bg-accent" /> : null}
      </div>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
