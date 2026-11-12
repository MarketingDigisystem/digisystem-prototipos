// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ (sugestões da gestão) e regras.ts desta pasta (analisarSugestao, decidirSugestao), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Fila de sugestões de brinde com abas. Cada cartão tem sempre o campo de motivo e a faixa de erro, então as ações não se movem.

import { useMemo, useState } from "react";
import { estiloEntrada } from "../../movimento";
import { useLoja } from "../../store";
import type { EstadoSugestao, Sugestao } from "../../tipos";
import { useFaixaRolante } from "../../ui";
import { BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO, Contador, ErroInline, PILL, PILL_ATIVO, PILL_INATIVO, formatarInstante } from "./comum";

type Aba = "analisar" | "aprovadas" | "recusadas" | "todas";
const ABAS: { id: Aba; rotulo: string; estados: EstadoSugestao[] }[] = [
  { id: "analisar", rotulo: "Para analisar", estados: ["sugerida", "em_analise"] },
  { id: "aprovadas", rotulo: "Aprovadas", estados: ["aprovada"] },
  { id: "recusadas", rotulo: "Recusadas", estados: ["recusada"] },
  { id: "todas", rotulo: "Todas", estados: ["sugerida", "em_analise", "aprovada", "recusada"] },
];

const ROTULO: Record<EstadoSugestao, string> = {
  sugerida: "Nova",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  recusada: "Recusada",
};
const COR: Record<EstadoSugestao, string> = {
  sugerida: "bg-sky-soft text-navy ring-1 ring-sky",
  em_analise: "bg-warning-soft text-foreground ring-1 ring-warning",
  aprovada: "bg-success-soft text-foreground ring-1 ring-success",
  recusada: "bg-secondary text-[color:var(--destructive-strong)] ring-1 ring-destructive/40",
};

function Cartao({ s, indice }: { s: Sugestao; indice: number }) {
  const loja = useLoja();
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const aberta = s.estado === "sugerida" || s.estado === "em_analise";

  const executar = (r: ReturnType<typeof loja.analisarSugestao>) => {
    if (r.ok) setMotivo("");
    setErro(r.ok ? null : r.motivo);
  };

  return (
    <li style={estiloEntrada(indice)} className="le-entra rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-navy">{s.nome}</h3>
          <p className="text-xs text-muted-foreground">
            {loja.nomeDaPessoa(s.autorId)} · {formatarInstante(s.em)}
          </p>
        </div>
        <span className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 font-display text-xs font-bold ${COR[s.estado]}`}>
          {ROTULO[s.estado]}
        </span>
      </div>
      {s.descricao && <p className="mt-2 text-sm text-foreground/90">{s.descricao}</p>}
      {s.estado === "recusada" && s.motivo && <p className="mt-2 text-sm">Motivo da recusa: {s.motivo}</p>}

      {aberta && (
        <div className="mt-3 border-t pt-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground/80">Motivo (obrigatório para recusar)</span>
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Explique para quem sugeriu" className={CAMPO} />
          </label>
          <ErroInline texto={erro} className="mt-1" />
          <div className="flex flex-wrap gap-2">
            {/* Posição fixa: o botão de análise fica no lugar mesmo quando a sugestão já está em análise. */}
            <button
              type="button"
              disabled={s.estado !== "sugerida"}
              onClick={() => executar(loja.analisarSugestao(s.id))}
              className={BTN_SECUNDARIO}
            >
              Colocar em análise
            </button>
            <button type="button" onClick={() => executar(loja.decidirSugestao(s.id, "aprovada"))} className={BTN_PRIMARIO}>
              Aprovar
            </button>
            <button type="button" onClick={() => executar(loja.decidirSugestao(s.id, "recusada", motivo))} className={BTN_SECUNDARIO}>
              Recusar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function Sugestoes() {
  const { dados } = useLoja();
  const [aba, setAba] = useState<Aba>("analisar");
  const config = ABAS.find((a) => a.id === aba)!;
  const refAbas = useFaixaRolante<HTMLDivElement>(aba);

  const contagem = useMemo(
    () => Object.fromEntries(ABAS.map((a) => [a.id, dados.sugestoes.filter((s) => a.estados.includes(s.estado)).length])) as Record<Aba, number>,
    [dados.sugestoes],
  );
  const lista = useMemo(
    () => dados.sugestoes.filter((s) => config.estados.includes(s.estado)).sort((a, b) => b.em.localeCompare(a.em)),
    [dados.sugestoes, config],
  );

  return (
    <section className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6" aria-labelledby="sug-titulo">
      <h1 id="sug-titulo" className="sr-only">
        Sugestões de brindes
      </h1>
      <div ref={refAbas} role="group" aria-label="Filtrar sugestões" className="le-nav le-rola -mx-1 -my-1 overflow-x-auto px-1 py-1">
        <div className="flex w-max items-center gap-1">
          {ABAS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={aba === a.id}
              onClick={() => setAba(a.id)}
              className={`${PILL} ${aba === a.id ? PILL_ATIVO : PILL_INATIVO}`}
            >
              {a.rotulo}
              <Contador n={contagem[a.id]} />
            </button>
          ))}
        </div>
      </div>
      <p className="flex min-h-9 items-center text-xs text-muted-foreground" aria-live="polite">
        {lista.length === 1 ? "1 sugestão" : `${lista.length} sugestões`}
      </p>
      {lista.length === 0 ? (
        <div className="rounded-3xl border bg-card p-8 text-center shadow-card">
          <h2 className="font-display text-xl font-bold text-navy">Nada por aqui</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Quando alguém sugerir um brinde, ele aparece nesta fila.</p>
        </div>
      ) : (
        <ul key={aba} className="grid gap-3">
          {lista.map((s, i) => (
            <Cartao key={s.id} s={s} indice={i} />
          ))}
        </ul>
      )}
    </section>
  );
}
