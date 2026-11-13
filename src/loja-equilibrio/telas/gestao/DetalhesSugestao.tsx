// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: sugestaoOpcoes.ts e regras.ts (brindesParecidos) desta pasta, escritos em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Sugestão de brinde completa", Req. 16.25 a 16.29).
//
// Blocos do cartão de sugestão da gestão: chips, quantidade, data, link, "Por que combina", foto de referência e
// "Parecidos no catálogo" (só nome e link). Este arquivo nunca lê números do catálogo.

import { dataCurta } from "../../formato";
import { href } from "../../rota";
import {
  ROTULO_COM_LOGO,
  ROTULO_FAIXA_CUSTO,
  ROTULO_FREQUENCIA,
  linkSeguro,
} from "../../sugestaoOpcoes";
import type { Sugestao } from "../../tipos";

export interface BrindeParecido {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
}

const CHIP = "inline-flex min-h-7 items-center rounded-full bg-secondary px-3 py-0.5 text-xs font-semibold text-foreground ring-1 ring-border";
const ROTULO = "text-xs font-bold uppercase tracking-wide text-foreground/80";

function GrupoChips({ rotulo, itens }: { rotulo: string; itens: string[] }) {
  if (itens.length === 0) return null;
  return (
    <div>
      <p className={ROTULO}>{rotulo}</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {itens.map((i) => (
          <li key={i} className={CHIP}>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Há algo a mostrar além do nome, da descrição e do estado? (decide se o cartão oferece "Ver detalhes") */
export function temDetalhes(s: Sugestao, parecidos: BrindeParecido[]): boolean {
  return (
    parecidos.length > 0 ||
    !!(s.porQueCombina?.trim() || s.link?.trim() || s.fotoReferencia?.trim() || s.dataNecessaria || s.frequencia || s.quantidadeEstimada !== undefined) ||
    !!(s.ocasioes?.length || s.publicos?.length || s.faixaCusto || s.comLogo)
  );
}

export function DetalhesSugestao({ s, parecidos }: { s: Sugestao; parecidos: BrindeParecido[] }) {
  const link = linkSeguro(s.link);
  const frequencia = s.frequencia ? [ROTULO_FREQUENCIA[s.frequencia]] : [];
  const custo = [...(s.faixaCusto ? [ROTULO_FAIXA_CUSTO[s.faixaCusto]] : []), ...(s.comLogo ? [ROTULO_COM_LOGO[s.comLogo]] : [])];
  const fatos: { rotulo: string; valor: string }[] = [];
  if (s.quantidadeEstimada !== undefined) fatos.push({ rotulo: "Quantidade estimada", valor: String(s.quantidadeEstimada) });
  if (s.dataNecessaria) fatos.push({ rotulo: "Precisa até", valor: dataCurta(s.dataNecessaria) });

  return (
    <div className="grid gap-3 text-sm">
      <GrupoChips rotulo="Ocasiões" itens={s.ocasioes ?? []} />
      <GrupoChips rotulo="Públicos" itens={s.publicos ?? []} />
      <GrupoChips rotulo="Frequência" itens={frequencia} />
      <GrupoChips rotulo="Custo e marca" itens={custo} />

      {fatos.length > 0 && (
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {fatos.map((f) => (
            <div key={f.rotulo}>
              <dt className={ROTULO}>{f.rotulo}</dt>
              <dd className="mt-0.5 font-semibold text-foreground">{f.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {s.porQueCombina?.trim() && (
        <div>
          <p className={ROTULO}>Por que combina</p>
          <p className="mt-0.5 text-foreground/90">{s.porQueCombina.trim()}</p>
        </div>
      )}

      {s.link?.trim() && (
        <div className="min-w-0">
          <p className={ROTULO}>Link de referência</p>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex min-h-11 max-w-full items-center break-all font-semibold text-navy underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
            >
              {s.link.trim()}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          ) : (
            <p className="mt-0.5 break-all text-foreground/90">{s.link.trim()}</p>
          )}
        </div>
      )}

      {s.fotoReferencia?.trim() && (
        <div>
          <p className={ROTULO}>Foto de referência</p>
          <p className="mt-0.5 break-all text-foreground/90">{s.fotoReferencia.trim()}</p>
        </div>
      )}

      {parecidos.length > 0 && (
        <div>
          <p className={ROTULO}>Parecidos no catálogo</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {parecidos.map((b) => (
              <li key={b.id}>
                <a
                  href={href(`brinde/${b.slug}`)}
                  className="inline-flex min-h-11 items-center rounded-full border bg-card px-4 text-sm font-semibold text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
                >
                  {b.nome}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
