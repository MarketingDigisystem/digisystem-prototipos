// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: (faixa própria do protótipo, sem equivalente no Hub real) @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import { SegmentadoGrande, type OpcaoSegmentada } from "./ui-config";
import { cx } from "../hub-loja/ui";

export type PapelFaixa = "admin" | "marketing";
export type OpcaoEstado = "normal" | "carregando" | "vazio" | "erro" | "ponte_desligada";

const ROTULO_ESTADO: Record<OpcaoEstado, string> = {
  normal: "Normal",
  carregando: "Carregando",
  vazio: "Vazio",
  erro: "Erro",
  ponte_desligada: "Ponte desligada",
};
const ORDEM_ESTADO: OpcaoEstado[] = ["normal", "carregando", "vazio", "erro", "ponte_desligada"];
const ROTULO_PAPEL: Record<PapelFaixa, string> = { admin: "Admin", marketing: "Marketing" };
const ORDEM_PAPEL: PapelFaixa[] = ["admin", "marketing"];

/**
 * Faixa de altura FIXA acima do cabeçalho (52 px; 96 px abaixo de 640 px). Rola com a página.
 * A partir de 1280 px os seletores são segmentados; abaixo disso viram listas (mesmos rótulos, sem encurtar),
 * para a faixa nunca mudar de altura nem criar rolagem horizontal.
 */
export function FaixaPrototipo({
  aba,
  estado,
  papel,
  aoMudarEstado,
  aoMudarPapel,
}: {
  aba: string;
  estado: OpcaoEstado;
  papel: PapelFaixa;
  /** "ponte_desligada" também desliga a ponte (regra do contexto); só vale na aba Ponte. */
  aoMudarEstado: (e: OpcaoEstado) => void;
  aoMudarPapel: (p: PapelFaixa) => void;
}) {
  const naPonte = aba === "ponte";
  const naRetirada = aba === "retirada";
  // Fora da Ponte a opção "Ponte desligada" não vale: a faixa mostra Normal.
  const atual: OpcaoEstado = estado === "ponte_desligada" && !naPonte ? "normal" : estado;

  const opcoes: OpcaoSegmentada<OpcaoEstado>[] = ORDEM_ESTADO.map((id) => ({
    id,
    rotulo: ROTULO_ESTADO[id],
    desabilitado: (id === "vazio" && naRetirada) || (id === "ponte_desligada" && !naPonte),
    dica: id === "vazio" ? "A Retirada não tem estado Vazio." : id === "ponte_desligada" ? "Só vale na aba Ponte." : undefined,
  }));
  const opcoesPapel: OpcaoSegmentada<PapelFaixa>[] = ORDEM_PAPEL.map((id) => ({ id, rotulo: ROTULO_PAPEL[id] }));

  const escolherEstado = (id: OpcaoEstado) => aoMudarEstado(id);

  const classeSelect =
    "min-h-11 min-w-0 flex-1 rounded-xl border border-[#7b87b8] bg-card px-3 text-sm font-semibold text-foreground disabled:opacity-50";

  return (
    <div data-ancora="faixa-prototipo" className="hlc-faixa hl-nao-imprime h-24 border-b border-border bg-muted sm:h-[52px]">
      <div className="mx-auto flex h-full max-w-[1400px] flex-col justify-center gap-0 px-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <p className="hidden shrink-0 text-xs font-semibold text-foreground md:block">Protótipo: dados fictícios</p>

        {/* Estado e papel como segmentados (≥ 1280 px). */}
        <div className="ml-auto hidden items-center gap-4 xl:flex">
          <span className="text-xs font-semibold text-muted-foreground">Estado</span>
          <SegmentadoGrande rotulo="Estado" opcoes={opcoes} valor={atual} aoMudar={escolherEstado} ancora="faixa-estado" />
          <span className="text-xs font-semibold text-muted-foreground">Papel</span>
          <SegmentadoGrande rotulo="Papel" opcoes={opcoesPapel} valor={papel} aoMudar={aoMudarPapel} ancora="faixa-papel" />
        </div>

        {/* Abaixo de 1280 px: duas listas de 44 px; empilhadas em < 640 px (2 linhas de 44 px = 96 px com a folga). */}
        <div className="flex min-w-0 flex-col gap-1 sm:ml-auto sm:flex-row sm:gap-3 xl:hidden">
          <label className="flex min-w-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="w-12 shrink-0">Estado</span>
            <select
              aria-label="Estado"
              value={atual}
              onChange={(e) => escolherEstado(e.target.value as OpcaoEstado)}
              className={cx(classeSelect, "sm:w-44")}
            >
              {opcoes.map((o) => (
                <option key={o.id} value={o.id} disabled={o.desabilitado}>
                  {ROTULO_ESTADO[o.id]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="w-12 shrink-0">Papel</span>
            <select aria-label="Papel" value={papel} onChange={(e) => aoMudarPapel(e.target.value as PapelFaixa)} className={cx(classeSelect, "sm:w-36")}>
              {opcoesPapel.map((o) => (
                <option key={o.id} value={o.id}>
                  {ROTULO_PAPEL[o.id]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
