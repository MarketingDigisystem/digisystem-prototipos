// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Moldura das telas da gestão (equipe de marketing). As abas ficam no cabeçalho da loja,
// então a gestão parece a mesma aplicação. Onde ela vai morar no Hub ainda não está definido.

import type { ReactNode } from "react";

export function GestaoShell({ titulo, descricao, acoes, children }: { titulo: string; descricao: string; acoes?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[12.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Gestão da loja · Equipe de marketing</p>
          <h1 className="mt-0.5 font-display text-[26px] font-bold leading-tight md:text-[30px]">{titulo}</h1>
          <p className="mt-0.5 max-w-2xl text-[14px] text-muted-foreground">{descricao}</p>
        </div>
        {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
      </div>
      {children}
    </div>
  );
}

export function Kpi({ rotulo, valor, detalhe, tom = "neutro" }: { rotulo: string; valor: string; detalhe?: string; tom?: "neutro" | "atencao" | "erro" }) {
  const barra = tom === "atencao" ? "bg-warning" : tom === "erro" ? "bg-destructive" : "bg-primary";
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-card">
      <span className={`absolute inset-y-0 left-0 w-1 ${barra}`} aria-hidden />
      <p className="text-[12.5px] text-muted-foreground">{rotulo}</p>
      <p className="mt-0.5 font-display text-[24px] font-bold leading-tight tabular-nums">{valor}</p>
      {detalhe && <p className="text-[12px] text-muted-foreground">{detalhe}</p>}
    </div>
  );
}
