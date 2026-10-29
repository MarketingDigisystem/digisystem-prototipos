/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Gaveta dos cards ocultos: começa fechada; cada chip devolve o card para o
 * fim da mesa com um clique.
 */
import { useId, useState } from "react";
import { ChevronRight, Undo2 } from "lucide-react";
import { ContadorAnimado } from "./anim";
import { CATALOGO, type CardId } from "./catalogo";

export function GavetaOcultos({ ocultos, onRestaurar }: { ocultos: CardId[]; onRestaurar: (id: CardId) => void }) {
  const [aberta, setAberta] = useState(false);
  const id = useId();
  if (ocultos.length === 0) return null;

  return (
    <section aria-label="Cards ocultos" className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 px-4 py-3">
      <button
        type="button"
        aria-expanded={aberta}
        aria-controls={id}
        onClick={() => setAberta((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg px-1 py-1 font-display text-xs font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight aria-hidden data-aberto={aberta} className="mmv-seta-gira h-4 w-4" />
        Cards ocultos
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
          <ContadorAnimado valor={ocultos.length} />
        </span>
      </button>
      <div id={id} className="mmv-expansor" data-aberto={aberta}>
        <div inert={!aberta || undefined}>
          <ul className="flex flex-wrap gap-2 pb-1 pt-3">
            {ocultos.map((c, i) => (
              <li key={c} className={aberta ? "mmv-entra-item" : undefined} style={{ animationDelay: `${i * 30}ms` }}>
                <button
                  type="button"
                  onClick={() => onRestaurar(c)}
                  aria-label={`Trazer ${CATALOGO[c].titulo} de volta para a mesa`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-display text-xs font-bold text-secondary-foreground transition-colors duration-200 hover:bg-sky-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Undo2 aria-hidden className="h-3.5 w-3.5" /> {CATALOGO[c].titulo}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
