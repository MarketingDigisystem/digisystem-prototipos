/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/MinhaMesa.tsx (Tendência da semana, main @ 0a6b425) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Tendência da semana como card opcional. O arco laranja do hero entra e
 * cresce um pouco no hover do card.
 */
import { useHub } from "../../../../store/HubStore";
import { ChipPlataforma, ChipPotencial, formatoLegivel } from "../../../../components/TendenciaChips";
import { CriarPostTendencia } from "../../../../components/TendenciaDetalhe";
import { CardMesa, Vazio, type Casca } from "../CardMesa";

export function CardTendencia({ casca }: { casca: Casca }) {
  const { sel } = useHub();
  const t = sel.tendenciaDestaque();
  const largo = casca.tamanho === "largo";

  return (
    <CardMesa casca={casca} className="isolate">
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <span className="mmv-arco absolute -bottom-28 -right-28 h-56 w-56 rounded-full border-[30px] border-accent" />
      </span>
      {!t ? (
        <Vazio>Todas as tendências do radar já têm um destino.</Vazio>
      ) : (
        <div className={largo ? "grid gap-x-10 gap-y-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" : "space-y-4"}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ChipPotencial potencial={t.potencial} />
              <ChipPlataforma tag={t.tag} />
            </div>
            <p className="mt-3 font-display text-2xl font-bold leading-tight text-primary">{t.titulo}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t.segmento} · {formatoLegivel(t.formato)}
            </p>
          </div>
          <div className="flex min-w-0 flex-col">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Por que importa para a Digisystem</p>
            <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-foreground/85">{t.proposta}</p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              {/* "Ver no radar" fica só no rodapé do card, sem repetir aqui. */}
              <CriarPostTendencia tendencia={t} />
            </div>
          </div>
        </div>
      )}
    </CardMesa>
  );
}
