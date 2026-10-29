/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/metricas.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Resultados → Redes: fora do go-live (proposta 2.3). Fica visível e
 * desativada, com "Em breve". Mostra as 4 conexões da "Visão própria" real
 * (cards rounded-3xl p-5) esmaecidas e sem ação, porque a sincronização com
 * as redes ainda é só uma data no real. Nenhum número inventado.
 */
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { REDES, RedeIcone, REDE_META } from "../../components/RedeIcone";
import { hrefDe } from "../../router";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Redes() {
  return (
    <>
      <CabecalhoArea area="resultados" aba="redes" subtitulo="Alcance e engajamento por rede social." />

      <section className="animate-rise mt-8 max-w-3xl" style={delay(70)}>
        <span className="rounded-full bg-secondary px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Em breve
        </span>
        <p className="mt-4 font-display text-2xl font-bold leading-snug text-primary">
          Os números das redes voltam quando a sincronização estiver ligada.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Hoje o Hub só guarda a data da última sincronização, sem trazer alcance nem engajamento. Para não mostrar
          número que ninguém conferiu, esta aba fica desligada no go-live. O andamento do time continua na aba{" "}
          <a href={hrefDe("resultados", "time")} className="font-semibold text-primary underline-offset-4 hover:text-accent hover:underline">
            Time
          </a>
          .
        </p>
      </section>

      <ul aria-label="Redes que vão entrar" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REDES.map((r, i) => (
          <li
            key={r}
            aria-disabled
            className="animate-rise rounded-3xl border border-dashed border-border bg-card/60 p-5 opacity-70 grayscale-[35%]"
            style={delay(140 + i * 60)}
          >
            <div className="flex items-center gap-3">
              <RedeIcone rede={r} tamanho="lg" />
              <div>
                <p className="font-display text-sm font-bold text-primary">{REDE_META[r].label}</p>
                <p className="text-xs text-muted-foreground">Sem conexão</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Seguidores, alcance e engajamento por post.</p>
          </li>
        ))}
      </ul>
    </>
  );
}
