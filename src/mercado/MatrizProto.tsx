/*
PROTÓTIPO DESCARTÁVEL — não é o app.
Gerado de: src/hub/pages/marca/mercado/ no Lovable (origin/main) @ leitura 2026-11-26.
Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
Decisão de design correspondente: docs-marketing-hub/implementacao/analise-redesign-mercado-2026-11-25.md.
*/
import { useMemo, useState } from "react";
import { CircleCheck, CircleSlash, Lightbulb, Target, Users, type LucideIcon } from "lucide-react";
import { ROTULO_ESTADO, type CelulaMatriz, type EstadoCelula } from "./dados";
import {
  CONC_POR_ID,
  DADOS,
  fmtData,
  ITEM_POR_ID,
  Logo,
  Pill,
  PainelFlutuante,
  porRisco,
  SEG_POR_ID,
  SeloRisco,
  SimboloIA,
  useMinWidth,
} from "./ui";

const ESTILO_ESTADO: Record<EstadoCelula, { Icon: LucideIcon; cls: string }> = {
  vendemos: { Icon: CircleCheck, cls: "bg-[#e1f3ea] text-[#1b5136]" },
  potencial: { Icon: Target, cls: "bg-[#e3f5fb] text-[#154a63]" },
  nao_atende: { Icon: CircleSlash, cls: "bg-[#eceef6] text-[#3a4372]" },
};

const CELULA_POR_CHAVE = new Map<string, CelulaMatriz>(DADOS.matriz.map((c) => [`${c.itemId}|${c.segmentoId}`, c]));
const ESTADOS: EstadoCelula[] = ["vendemos", "potencial", "nao_atende"];
const CONTAGEM_ESTADO = (e: EstadoCelula) => DADOS.matriz.filter((c) => c.estado === e).length;

function Estado({ estado }: { estado: EstadoCelula }) {
  const { Icon, cls } = ESTILO_ESTADO[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-semibold ${cls}`}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {ROTULO_ESTADO[estado]}
    </span>
  );
}

type Painel = { tipo: "celula"; itemId: string; segmentoId: string } | { tipo: "leitura" } | null;

/** Números calculados só com o que está cadastrado (a leitura em texto vem de mercado_analises). */
function useLeitura() {
  return useMemo(() => {
    const vendemos = DADOS.matriz.filter((c) => c.estado === "vendemos");
    const maisDisputadas = [...vendemos].sort((a, b) => b.concorrentes.length - a.concorrentes.length).slice(0, 3);
    const maisLivres = [...vendemos].sort((a, b) => a.concorrentes.length - b.concorrentes.length).slice(0, 3);
    const porSegmento = DADOS.segmentos
      .map((s) => ({ s, n: new Set(DADOS.matriz.filter((c) => c.segmentoId === s.id).flatMap((c) => c.concorrentes)).size }))
      .sort((a, b) => b.n - a.n);
    const alto = (ids: string[]) => ids.filter((id) => (CONC_POR_ID.get(id)?.ficha.risco ?? 0) >= 4).length;
    return { maisDisputadas, maisLivres, porSegmento, alto };
  }, []);
}

function nomeCelula(c: CelulaMatriz): string {
  return `${ITEM_POR_ID.get(c.itemId)?.nome ?? c.itemId} em ${SEG_POR_ID.get(c.segmentoId)?.nome ?? c.segmentoId}`;
}

export function MatrizProto({ onAbrirConcorrente }: { onAbrirConcorrente: (id: string) => void }) {
  const [painel, setPainel] = useState<Painel>(null);
  const [segMobile, setSegMobile] = useState(DADOS.segmentos[0].id);
  const lateral = useMinWidth(1366);
  const estreito = !useMinWidth(768);
  const leitura = useLeitura();
  const segmentos = estreito ? DADOS.segmentos.filter((s) => s.id === segMobile) : DADOS.segmentos;
  const fechar = () => setPainel(null);
  const celula = painel?.tipo === "celula" ? CELULA_POR_CHAVE.get(`${painel.itemId}|${painel.segmentoId}`) ?? null : null;

  const cabecalho =
    painel?.tipo === "leitura" ? (
      <div className="flex items-center gap-3">
        <SimboloIA tam={36} />
        <div>
          <h2 className="font-display text-[22px] font-bold leading-tight text-navy">Leitura geral</h2>
          <p className="text-[13px] text-muted-foreground">Texto da IA e números do cadastro</p>
        </div>
      </div>
    ) : celula ? (
      <div>
        <h2 className="font-display text-[20px] font-bold leading-tight text-navy">{ITEM_POR_ID.get(celula.itemId)?.nome}</h2>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[14px] text-foreground">
          em {SEG_POR_ID.get(celula.segmentoId)?.nome} <Estado estado={celula.estado} />
        </p>
      </div>
    ) : null;

  const concorrentesDaCelula = celula ? celula.concorrentes.map((id) => CONC_POR_ID.get(id)).filter((c) => !!c).sort((a, b) => porRisco(a!, b!)) : [];

  return (
    <div>
      {/* Legenda e ações: fora da área rolável, sempre visíveis junto da tabela. */}
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-border bg-card p-3 shadow-card">
        <p id="legenda-matriz" className="text-[14px] font-semibold text-foreground">
          Legenda
        </p>
        <ul aria-labelledby="legenda-matriz" className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {ESTADOS.map((e) => (
            <li key={e} className="flex items-center gap-2">
              <Estado estado={e} />
              <span className="text-[13px] text-muted-foreground">{CONTAGEM_ESTADO(e)} células</span>
            </li>
          ))}
          <li className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="inline-flex size-6 items-center justify-center rounded-md border border-navy/40 bg-card text-navy" aria-hidden>
              <Users className="size-3.5" />
            </span>
            Concorrentes presentes (toque para a lista)
          </li>
        </ul>
        <button
          type="button"
          aria-expanded={painel?.tipo === "leitura"}
          onClick={() => setPainel(painel?.tipo === "leitura" ? null : { tipo: "leitura" })}
          className={`ml-auto inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-display text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
            painel?.tipo === "leitura" ? "border-navy bg-navy text-primary-foreground" : "border-navy bg-card text-navy hover:bg-navy-soft"
          }`}
        >
          <Lightbulb className="size-4" aria-hidden />
          Leitura geral
        </button>
      </div>

      {estreito && (
        <div role="group" aria-label="Segmento exibido" className="mb-3 flex flex-wrap gap-2">
          {DADOS.segmentos.map((s) => (
            <Pill key={s.id} ativo={segMobile === s.id} onClick={() => setSegMobile(s.id)}>
              {s.nome}
            </Pill>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative max-h-[calc(100dvh-190px)] min-h-[420px] overflow-auto rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full border-separate border-spacing-0 text-left" style={{ minWidth: estreito ? 0 : 220 + segmentos.length * 164 }}>
            <caption className="sr-only">Portfólio da Digisystem por segmento: estado de venda e concorrentes presentes</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 top-0 z-30 w-[44%] border-b border-r border-border bg-card p-3 font-display text-[15px] font-bold text-navy min-[768px]:w-[240px]">
                  Portfólio
                </th>
                {segmentos.map((s) => (
                  <th key={s.id} scope="col" className="sticky top-0 z-20 border-b border-border bg-card p-3 font-display text-[15px] font-bold text-navy">
                    {s.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DADOS.itens.map((i) => (
                <tr key={i.id}>
                  <th scope="row" className="sticky left-0 z-10 border-b border-r border-border bg-card p-3 text-[14px] font-semibold leading-snug text-foreground">
                    {i.nome}
                  </th>
                  {segmentos.map((s) => {
                    const c = CELULA_POR_CHAVE.get(`${i.id}|${s.id}`);
                    if (!c) return <td key={s.id} className="border-b border-border p-2 text-[13px] text-muted-foreground">Sem dado</td>;
                    const ativa = painel?.tipo === "celula" && painel.itemId === i.id && painel.segmentoId === s.id;
                    return (
                      <td key={s.id} className={`border-b border-border p-2 ${ativa ? "bg-navy-soft" : ""}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Estado estado={c.estado} />
                          <button
                            type="button"
                            aria-label={`${c.concorrentes.length} concorrentes em ${nomeCelula(c)}. Abrir lista`}
                            aria-pressed={ativa}
                            onClick={() => setPainel(ativa ? null : { tipo: "celula", itemId: i.id, segmentoId: s.id })}
                            className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-xl border px-2 text-[14px] font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                              ativa ? "border-navy bg-navy text-primary-foreground" : "border-navy/40 bg-card text-navy hover:bg-navy-soft"
                            }`}
                          >
                            <Users className="size-3.5" aria-hidden />
                            {c.concorrentes.length}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PainelFlutuante
          aberto={painel !== null && (painel.tipo === "leitura" || celula !== null)}
          modo={lateral ? "lateral" : "sheet"}
          titulo={painel?.tipo === "leitura" ? "Leitura geral da matriz" : celula ? nomeCelula(celula) : "Detalhe"}
          cabecalho={cabecalho}
          onFechar={fechar}
          largura="min(34%, 460px)"
        >
          {painel?.tipo === "leitura" && (
            <div className="grid gap-5 text-[14px] leading-relaxed text-foreground">
              {DADOS.leituraGeral ? (
                <>
                  <section className="rounded-2xl border border-border bg-muted/60 p-4">
                    <p className="mb-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                      <span className="rounded-full border border-navy bg-navy-soft px-2.5 py-0.5 font-semibold text-navy">Prioridade {DADOS.leituraGeral.prioridade}</span>
                      Gerada pela IA em {fmtData(DADOS.leituraGeral.geradoEm)}, só quando um Decisor pede.
                    </p>
                    <p>{DADOS.leituraGeral.resumo}</p>
                    {DADOS.leituraGeral.parcial && (
                      <p className="mt-2 text-[13px] text-muted-foreground">A IA recebeu só parte dos dados cadastrados (a lista foi cortada para caber no pedido).</p>
                    )}
                  </section>
                  <section>
                    <h3 className="mb-1.5 font-display text-[17px] font-bold text-navy">Por que</h3>
                    <ul className="grid gap-2">
                      {DADOS.leituraGeral.motivos.map((m) => (
                        <li key={m} className="flex items-start gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-navy" aria-hidden />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="mb-1.5 font-display text-[17px] font-bold text-navy">Próximos passos</h3>
                    <ol className="grid list-decimal gap-2 pl-5">
                      {DADOS.leituraGeral.proximosPassos.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ol>
                  </section>
                  <h3 className="border-t border-border pt-4 font-display text-[17px] font-bold text-navy">Números do cadastro</h3>
                </>
              ) : (
                <p className="rounded-2xl border border-border bg-muted/60 p-3 text-[13px] text-muted-foreground">
                  Ainda não há leitura gerada pela IA. Os números abaixo vêm do cadastro de segmentos, portfólio e concorrentes.
                </p>
              )}
              <section>
                <h3 className="mb-1.5 font-display text-[17px] font-bold text-navy">Onde a disputa é maior</h3>
                <ul className="grid gap-2">
                  {leitura.maisDisputadas.map((c) => (
                    <li key={`${c.itemId}${c.segmentoId}`}>
                      <span className="font-semibold">{nomeCelula(c)}</span>: {c.concorrentes.length} concorrentes, {leitura.alto(c.concorrentes)} de risco alto ou muito alto.
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="mb-1.5 font-display text-[17px] font-bold text-navy">Onde há mais espaço</h3>
                <ul className="grid gap-2">
                  {leitura.maisLivres.map((c) => (
                    <li key={`${c.itemId}${c.segmentoId}`}>
                      <span className="font-semibold">{nomeCelula(c)}</span>: {c.concorrentes.length} concorrentes.
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="mb-1.5 font-display text-[17px] font-bold text-navy">Concorrentes por segmento</h3>
                <ul className="grid gap-1.5">
                  {leitura.porSegmento.map(({ s, n }) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 border-b border-border pb-1.5">
                      <span>{s.nome}</span>
                      <span className="font-semibold tabular-nums">{n}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <p className="text-[13px] text-muted-foreground">Dados de {fmtData("2026-11-26")}.</p>
            </div>
          )}
          {celula && (
            <div className="grid gap-3">
              <p className="text-[14px] text-foreground">{ITEM_POR_ID.get(celula.itemId)?.descricao}</p>
              <h3 className="font-display text-[17px] font-bold text-navy">{concorrentesDaCelula.length} concorrentes presentes</h3>
              {concorrentesDaCelula.length === 0 && <p className="text-[14px] text-muted-foreground">Nenhum concorrente mapeado nesta célula.</p>}
              <ul className="grid gap-2">
                {concorrentesDaCelula.map((c) => (
                  <li key={c!.id}>
                    <button
                      type="button"
                      onClick={() => onAbrirConcorrente(c!.id)}
                      aria-label={`Abrir ficha de ${c!.nome}`}
                      className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-card p-2 text-left hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                    >
                      <Logo c={c!} tam={36} />
                      <span className="min-w-0 flex-1 truncate font-display text-[16px] font-bold text-navy">{c!.nome}</span>
                      <SeloRisco nivel={c!.ficha.risco} curto />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </PainelFlutuante>
      </div>
    </div>
  );
}
