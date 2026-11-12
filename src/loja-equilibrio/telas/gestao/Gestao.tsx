// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: rota.ts desta pasta (AbaGestao), escrito em 2026-11-11.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Escolhe a tela de gestão pela aba. 

import type { AbaGestao } from "../../rota";
import { Cadastro } from "./Cadastro";
import { Estoque } from "./Estoque";
import { Fila } from "./Fila";
import { Metricas } from "./Metricas";
import { Movimentacoes } from "./Movimentacoes";
import { Sugestoes } from "./Sugestoes";

export function Gestao({ aba }: { aba: AbaGestao }) {
  switch (aba) {
    case "fila":
      return <Fila />;
    case "sugestoes":
      return <Sugestoes />;
    case "estoque":
      return <Estoque />;
    case "movimentacoes":
      return <Movimentacoes />;
    case "cadastro":
      return <Cadastro />;
    case "metricas":
      return <Metricas />;
  }
}
