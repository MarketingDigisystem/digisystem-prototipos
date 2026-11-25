/*
PROTÓTIPO DESCARTÁVEL — não é o app.
Gerado de: src/hub/pages/marca/mercado/ no Lovable (origin/main) @ leitura 2026-11-26.
Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
Decisão de design correspondente: docs-marketing-hub/implementacao/analise-redesign-mercado-2026-11-25.md.
*/
import type { ReactNode } from "react";
import { ExternalLink, Facebook, Globe, Instagram, Linkedin, MapPin, Plus, Check, type LucideIcon } from "lucide-react";
import { DICA_QUADRANTE, ROTULO_QUADRANTE, type Concorrente, type Quadrante, type TipoLink } from "./dados";
import {
  explicarSinais,
  fmtData,
  ITEM_POR_ID,
  listaDiferenciais,
  Logo,
  PainelFlutuante,
  Pips,
  rotuloPorte,
  SEG_POR_ID,
  SeloRisco,
  SINAIS,
  situacaoDe,
  TOTAL_ITENS,
} from "./ui";

const ICONE_LINK: Record<TipoLink, { Icon: LucideIcon; rotulo: string }> = {
  site: { Icon: Globe, rotulo: "Site" },
  linkedin: { Icon: Linkedin, rotulo: "LinkedIn" },
  instagram: { Icon: Instagram, rotulo: "Instagram" },
  facebook: { Icon: Facebook, rotulo: "Facebook" },
};

const QUADRANTES: { q: Quadrante; borda: string }[] = [
  { q: "forcas", borda: "border-l-navy" },
  { q: "fraquezas", borda: "border-l-orange" },
  { q: "oportunidades", borda: "border-l-sky" },
  { q: "ameacas", borda: "border-l-destructive" },
];

function Secao({ titulo, children, id }: { titulo: string; children: ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="mb-6">
      <h3 id={id} className="mb-2 font-display text-[17px] font-bold text-navy">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 border-b border-border py-2.5 last:border-b-0">
      <dt className="text-[13px] font-semibold text-muted-foreground">{rotulo}</dt>
      <dd className="text-[14px] leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}

export function DetalheLateral({
  c,
  modo,
  marcado,
  onAlternar,
  onFechar,
}: {
  c: Concorrente | null;
  modo: "lateral" | "sheet";
  marcado: boolean;
  onAlternar: (id: string) => void;
  onFechar: () => void;
}) {
  const aberto = c !== null;
  const explicacoes = c ? explicarSinais(c.sinais) : {};
  const situacao = c ? situacaoDe(c) : null;

  const cabecalho = c && (
    <div className="flex items-center gap-3">
      <Logo c={c} tam={56} />
      <div className="min-w-0">
        <h2 className="font-display text-[24px] font-bold leading-tight text-navy">{c.nome}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <SeloRisco nivel={c.ficha.risco} />
          {situacao && <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[13px] font-semibold">Situação: {situacao}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <PainelFlutuante aberto={aberto} modo={modo} titulo={c ? `Detalhes de ${c.nome}` : "Detalhes"} cabecalho={cabecalho} onFechar={onFechar} largura="min(40%, 720px)">
      {c && (
        <div>
          {c.descricao && <p className="mb-4 text-[14px] leading-relaxed text-foreground">{c.descricao}</p>}

          <div className="mb-6 flex flex-wrap gap-2">
            {c.links.length === 0 && <span className="text-[13px] text-muted-foreground">Nenhum link público cadastrado.</span>}
            {c.links.map((l) => {
              const { Icon, rotulo } = ICONE_LINK[l.tipo];
              return (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${rotulo} de ${c.nome} (abre em nova aba)`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-[14px] font-semibold text-navy hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  <Icon className="size-4" aria-hidden />
                  {rotulo}
                  <ExternalLink className="size-3.5 opacity-70" aria-hidden />
                </a>
              );
            })}
            <button
              type="button"
              aria-pressed={marcado}
              onClick={() => onAlternar(c.id)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-display text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                marcado ? "border-navy bg-navy text-primary-foreground" : "border-navy bg-card text-navy hover:bg-navy-soft"
              }`}
            >
              {marcado ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
              {marcado ? "Na comparação" : "Adicionar à comparação"}
            </button>
          </div>

          <Secao id="det-risco" titulo="Por que este risco">
            <div className="rounded-2xl border border-border bg-muted/60 p-4">
              <p className="text-[14px] leading-relaxed text-foreground">
                {c.ficha.riscoMotivo ?? "Sem motivo registrado."}
                {c.sinais && <span className="text-muted-foreground"> Pontuação ponderada {c.sinais.pontuacao} de 3.</span>}
              </p>
              {c.sinais && (
                <ul className="mt-3 grid gap-3">
                  {SINAIS.map((s) => (
                    <li key={s.k} className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-semibold text-foreground">{s.longo}</span>
                        <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                          {s.niveis[c.sinais![s.k]]}
                          <Pips valor={c.sinais![s.k]} />
                          <span className="sr-only">{c.sinais![s.k]} de 3</span>
                        </span>
                      </div>
                      {explicacoes[s.k] && <p className="text-[13px] leading-relaxed text-muted-foreground">{explicacoes[s.k]}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Secao>

          <Secao id="det-oferta" titulo="Oferta que sobrepõe a da Digisystem">
            {c.ofertaSobreposta.length === 0 ? (
              <p className="text-[14px] text-muted-foreground">Nenhum item do portfólio da Digisystem se sobrepõe.</p>
            ) : (
              <div className="rounded-2xl border-l-4 border-l-orange bg-orange-soft p-4">
                <p className="mb-2 text-[13px] font-semibold text-foreground">
                  {c.ofertaSobreposta.length} de {TOTAL_ITENS} itens do nosso portfólio
                </p>
                <ul className="grid gap-1.5 text-[14px] text-foreground">
                  {c.ofertaSobreposta.map((id) => (
                    <li key={id} className="flex items-start gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-navy" aria-hidden />
                      {ITEM_POR_ID.get(id)?.nome ?? id}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Secao>

          <Secao id="det-ficha" titulo="Ficha">
            <dl>
              <Linha rotulo="Porte">
                <span className="font-semibold">{rotuloPorte(c)}.</span> {c.ficha.porte ?? "Sem dado público de porte."}
              </Linha>
              <Linha rotulo="Presença regional">
                <span className="flex items-start gap-2">
                  <MapPin className="mt-1 size-4 shrink-0 text-navy" aria-hidden />
                  {c.presencaRegional ?? "Não mapeada."}
                </span>
              </Linha>
              <Linha rotulo="Segmentos em que atua">{c.segmentosAtua ?? "Não mapeado."}</Linha>
              <Linha rotulo="Segmentos em comum com a Digisystem">
                {c.segmentosEmComum.length === 0 ? (
                  "Nenhum."
                ) : (
                  <span className="flex flex-wrap gap-1.5">
                    {c.segmentosEmComum.map((id) => (
                      <span key={id} className="rounded-full bg-navy-soft px-2.5 py-1 text-[13px] font-semibold text-navy">
                        {SEG_POR_ID.get(id)?.nome ?? id}
                      </span>
                    ))}
                  </span>
                )}
              </Linha>
              {c.ficha.faixaPreco && <Linha rotulo="Faixa de preço">{c.ficha.faixaPreco}</Linha>}
              <Linha rotulo="Diferenciais">
                {listaDiferenciais(c.ficha.diferenciais).length === 0 ? (
                  "Não informados."
                ) : (
                  <ul className="grid gap-1.5">
                    {listaDiferenciais(c.ficha.diferenciais).map((d) => (
                      <li key={d} className="flex items-start gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-orange" aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </Linha>
              <Linha rotulo="Fonte">
                {c.ficha.fonte ?? "Sem fonte registrada."}
                <span className="block text-[13px] text-muted-foreground">Verificado em {fmtData(c.ficha.fonteData)}</span>
              </Linha>
            </dl>
          </Secao>

          <Secao id="det-swot" titulo="SWOT frente à Digisystem">
            {c.swot.status === "pronta" ? (
              <>
                <p className="mb-2 text-[13px] text-muted-foreground">Gerado em {fmtData(c.swot.geradoEm)}.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {QUADRANTES.map(({ q, borda }) => (
                    <div key={q} className={`rounded-2xl border border-border border-l-4 ${borda} bg-card p-3`}>
                      <h4 className="font-display text-[15px] font-bold text-navy">{ROTULO_QUADRANTE[q]}</h4>
                      <p className="mb-1.5 text-[13px] text-muted-foreground">{DICA_QUADRANTE[q]}</p>
                      <ul className="grid gap-1.5 text-[13px] leading-relaxed text-foreground">
                        {c.swot.itens[q].map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                        {c.swot.itens[q].length === 0 && <li className="text-muted-foreground">Nada registrado.</li>}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-[14px] leading-relaxed text-foreground">
                <span className="mb-1 inline-block rounded-full border border-border bg-card px-2.5 py-0.5 text-[13px] font-semibold">Pendente</span>
                <p>O SWOT deste concorrente ainda não foi gerado. No Hub, Aprovador e Admin geram por clique, um concorrente de cada vez.</p>
              </div>
            )}
          </Secao>

          <Secao id="det-temas" titulo="Temas que ele publica">
            {c.temas.length === 0 ? (
              <p className="text-[14px] text-muted-foreground">Sem temas monitorados até aqui.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {c.temas.map((t) => (
                  <li key={t.tema} className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-semibold text-navy">
                    {t.tema}
                    {t.frequencia ? <span className="ml-1.5 font-normal text-muted-foreground">×{t.frequencia}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </Secao>
        </div>
      )}
    </PainelFlutuante>
  );
}
