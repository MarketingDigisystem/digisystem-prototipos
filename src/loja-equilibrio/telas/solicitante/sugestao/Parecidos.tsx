// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: regras.ts (brindesParecidos) desta pasta, escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Sugestão de brinde completa", Req. 16.15 e 16.16).
//
// Parecidos no catálogo: só id, slug, nome e categoria. Nunca lê números do catálogo e nunca bloqueia o envio.
// O cartão tem altura mínima no desktop, então aparecer ou sumir não desloca o Resumo.

import { TEXTO_PARECIDOS } from "../../../sugestaoOpcoes";
import { href } from "../../../rota";

export interface BrindeParecido {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
}

export function Parecidos({ itens }: { itens: BrindeParecido[] }) {
  return (
    <section aria-labelledby="parecidos-titulo" className="rounded-3xl border bg-card p-5 shadow-card lg:min-h-[13rem]">
      <h2 id="parecidos-titulo" className="font-display text-lg font-bold text-navy">
        Parecidos no catálogo
      </h2>
      {itens.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Ao digitar o nome ou escolher a categoria, mostramos aqui brindes parecidos que já existem.</p>
      ) : (
        <div className="le-msg">
          <p role="status" className="mt-2 text-sm font-semibold text-foreground/90">
            {TEXTO_PARECIDOS}
          </p>
          <ul className="mt-2 space-y-1">
            {itens.map((b) => (
              <li key={b.id}>
                <a
                  href={href(`brinde/${b.slug}`)}
                  className="le-cor flex min-h-11 flex-wrap items-center justify-between gap-x-3 rounded-2xl border px-4 py-2 text-sm hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
                >
                  <span className="font-display font-bold text-navy">{b.nome}</span>
                  <span className="text-xs text-muted-foreground">{b.categoria}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
