/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *   (decisão 7, modo Reorganizar; decisão 6, preferência Com fita | Sem fita).
 *
 * Configurações da mesa: densidade e fita da frase do dia. Só existem no DOM
 * dentro do modo Reorganizar (fora dele devolve null).
 */
import type { Densidade } from "./layout";
import { Pills } from "./Pills";

export function PreferenciasMesa({
  reorganizar,
  densidade,
  onDensidade,
  comFita,
  onComFita,
}: {
  reorganizar: boolean;
  densidade: Densidade;
  onDensidade: (d: Densidade) => void;
  comFita: boolean;
  onComFita: (v: boolean) => void;
}) {
  if (!reorganizar) return null;
  return (
    <div className="mmv-aparece flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Densidade da mesa</span>
        <Pills<Densidade>
          rotulo="Densidade da mesa"
          valor={densidade}
          onChange={onDensidade}
          opcoes={[
            { id: "compacto", label: "Compacto" },
            { id: "tudo", label: "Mostrar tudo" },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Frase do dia</span>
        <Pills<"com" | "sem">
          rotulo="Fita da frase do dia"
          valor={comFita ? "com" : "sem"}
          onChange={(v) => onComFita(v === "com")}
          opcoes={[
            { id: "com", label: "Com fita" },
            { id: "sem", label: "Sem fita" },
          ]}
        />
      </div>
    </div>
  );
}
