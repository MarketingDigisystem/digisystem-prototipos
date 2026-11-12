// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Cabecalho.tsx desta pasta (Seletor_de_Visao), lido em 2026-11-12; reescrito aqui, sem importar de outro protótipo.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Layout da vitrine, Req. 12.4) e .agents/tasks/loja-equilibrio/.
//
// Faixa fina acima do Cabecalho com o par de pills "Ver o protótipo como" (Diretor | Gestão). Altura fixa e pills sempre
// na mesma coordenada, em qualquer rota, visão, estado do Carrinho ou largura de tela (âncora fixa, Req. 12.4 e 12.15).

import { navegar } from "./rota";
import { useLoja, type Visao } from "./store";
import { ParDeslizante } from "./ui";

export function FaixaSeletor() {
  const loja = useLoja();

  const trocar = (v: Visao) => {
    if (v === loja.visao) return;
    loja.trocarVisao(v);
    navegar(v === "gestao" ? "gestao/fila" : "");
  };

  return (
    <div className="border-b bg-secondary">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-end gap-2 px-4 sm:px-6">
        <span className="hidden text-xs font-semibold text-muted-foreground sm:block" aria-hidden>
          Ver o protótipo como
        </span>
        {/* Indicador que desliza entre as duas opções; os botões ficam parados (mesma posição e largura). */}
        <ParDeslizante<Visao>
          rotulo="Ver o protótipo como"
          opcoes={[
            { id: "diretor", rotulo: "Diretor" },
            { id: "gestao", rotulo: "Gestão" },
          ]}
          valor={loja.visao}
          onChange={trocar}
          className="grid w-[168px] shrink-0 grid-cols-2 gap-0.5 rounded-full bg-card p-0.5"
          botaoClassName="h-7 w-full rounded-full font-display text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
        />
      </div>
    </div>
  );
}
