// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Meus pedidos (visão do diretor): dois trilhos (pronta entrega e encomenda) com linha do tempo.

import { useState } from "react";
import { ArrowLeft, ArrowRight, Ban, CalendarDays, CircleX, HandCoins, MapPin, Package, Palette, Target } from "lucide-react";
import { FotoProduto } from "../FotoProduto";
import { useLoja } from "../estado";
import { dataCurta, dataHora, dataLonga, moeda, unidades } from "../formato";
import { areaDoCentro, usuario } from "../mock";
import { custoPedido, dataEncerramento, ENCOMENDA_EM_ANDAMENTO, unidadesPedido } from "../regras";
import { navegar, trocarParams, voltar, type RotaLoja } from "../rota";
import type { Pedido, StatusPedido } from "../tipos";
import { Botao, Campo, classeInput, LinhaDoTempo, ParPills, ROTULO_STATUS, SeloStatus, Vazio, type Passo } from "../ui";

const EM_ANDAMENTO: StatusPedido[] = ["encomenda_solicitada", "em_alinhamento", "confirmada", "em_producao", "pronto"];

const FILTROS = [
  { valor: "todos", rotulo: "Todos", st: [] as StatusPedido[] },
  { valor: "andamento", rotulo: "Em andamento", st: EM_ANDAMENTO },
  { valor: "encerrados", rotulo: "Encerrados", st: ["encerrado"] as StatusPedido[] },
  { valor: "recusados", rotulo: "Negados e cancelados", st: ["negado", "cancelado"] as StatusPedido[] },
];

const FINALIDADE_TXT = { evento: "Evento", cliente: "Cliente", parceiro: "Parceiro", interno: "Uso interno" } as const;

// Rótulos de cada passo da encomenda.
const ROT_ENCOMENDA: Record<string, string> = {
  encomenda_solicitada: "Solicitada",
  em_alinhamento: "Em alinhamento",
  confirmada: "Confirmada",
  em_producao: "Em produção",
  pronto: "Pronta para retirada",
  encerrado: "Encerrada",
};

/** Rastreio do pedido. Pronta entrega: Pronto → Encerrado (2 passos). Encomenda: o trilho
 *  completo Solicitada → Em alinhamento → Confirmada → Em produção → Pronta → Encerrada. */
export function passosDoPedido(p: Pedido, detalhado = false): Passo[] {
  const ev = (s: StatusPedido) => p.historico.find((h) => h.status === s);
  const det = (s: StatusPedido) => {
    const e = ev(s);
    if (!e) return undefined;
    return detalhado ? `${dataHora(e.em)} · ${usuario(e.porId).nome}${e.nota ? `. ${e.nota}` : ""}` : dataCurta(e.em);
  };
  const encomenda = p.tipoPedido === "encomenda";
  const ordem: StatusPedido[] = encomenda
    ? ["encomenda_solicitada", "em_alinhamento", "confirmada", "em_producao", "pronto", "encerrado"]
    : ["pronto", "encerrado"];
  const rot: Record<string, string> = encomenda ? ROT_ENCOMENDA : { pronto: "Separado · saiu na hora", encerrado: "Retirado" };

  if (p.status === "negado") {
    const feitos = ordem.filter((s) => ev(s));
    return [
      ...feitos.map((s) => ({ rotulo: rot[s], detalhe: det(s), estado: "feito" as const })),
      { rotulo: "Negado", detalhe: det("negado"), estado: "erro" },
    ];
  }
  if (p.status === "cancelado") {
    const feitos = ordem.filter((s) => ev(s));
    return [
      ...feitos.map((s) => ({ rotulo: rot[s], detalhe: det(s), estado: "feito" as const })),
      { rotulo: "Cancelado", detalhe: det("cancelado"), estado: "cancelado" },
    ];
  }
  const atual = ordem.indexOf(p.status);
  return ordem.map((s, i) => ({
    rotulo: rot[s],
    detalhe: det(s),
    estado: i < atual || (i === atual && s === "encerrado") ? "feito" : i === atual ? "atual" : "pendente",
  }));
}

function mensagem(p: Pedido) {
  switch (p.status) {
    case "encomenda_solicitada": return "Encomenda enviada. O marketing vai assumir o alinhamento de prazo e volume.";
    case "em_alinhamento": return "O marketing está alinhando quantidade e prazo com você antes de confirmar.";
    case "confirmada": return "Encomenda confirmada. A produção vai começar.";
    case "em_producao": return "Em produção na fábrica. Avisamos quando chegar para retirada.";
    case "pronto": return `Pronto para retirar na recepção do marketing. Na retirada debitamos ${moeda(custoPedido(p))} de ${p.centroCustoId}.`;
    case "encerrado": return `Retirado em ${dataLonga(dataEncerramento(p)!)}. ${moeda(custoPedido(p))} debitados de ${p.centroCustoId}.`;
    case "negado": return `Motivo: ${p.motivo}`;
    case "cancelado": return `Cancelado. ${p.motivo ?? ""}`;
  }
}

export function MeusPedidos({ rota }: { rota: RotaLoja }) {
  const { estado, diretorId } = useLoja();
  const filtro = FILTROS.find((f) => f.valor === rota.params.get("status")) ?? FILTROS[0];
  const meus = estado.pedidos.filter((p) => p.solicitanteId === diretorId).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const lista = filtro.st.length ? meus.filter((p) => filtro.st.includes(p.status)) : meus;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold md:text-[30px]">Meus pedidos</h1>
          <p className="text-[14px] text-muted-foreground">Acompanhe cada pedido: pronta entrega sai na hora, encomenda passa pelo alinhamento.</p>
        </div>
        <Botao variante="contorno" onClick={() => navegar("/loja")}>Escolher mais brindes</Botao>
      </div>
      <div className="mb-5 overflow-x-auto [scrollbar-width:none]">
        <ParPills rotulo="Filtrar pedidos" valor={filtro.valor} onChange={(v) => trocarParams({ status: v === "todos" ? undefined : v })}
          opcoes={FILTROS.map((f) => ({ valor: f.valor, rotulo: <>{f.rotulo} <span className="tabular-nums opacity-70">{f.st.length ? meus.filter((p) => f.st.includes(p.status)).length : meus.length}</span></> }))}
          className="max-w-none flex-nowrap" />
      </div>

      {lista.length === 0 ? (
        <Vazio icone={<Package className="size-7" />} titulo="Nenhum pedido aqui" texto="Quando você enviar uma solicitação, ela aparece nesta lista com o andamento.">
          <Botao onClick={() => navegar("/loja")}>Ir para a vitrine</Botao>
        </Vazio>
      ) : (
        <ul className="space-y-4">
          {lista.map((p) => <CartaoPedido key={p.id} pedido={p} />)}
        </ul>
      )}
    </div>
  );
}

function CartaoPedido({ pedido: p }: { pedido: Pedido }) {
  const { estado } = useLoja();
  const itens = p.itens.map((i) => ({ i, prod: estado.produtos.find((x) => x.id === i.produtoId)! }));
  const negativo = p.status === "negado" || p.status === "cancelado";
  return (
    <li className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/50 px-5 py-3">
        <p className="min-w-0 text-[13.5px]">
          <span className="font-display text-[15px] font-bold">{p.id}</span>
          <span className="text-muted-foreground"> · feito em {dataCurta(p.criadoEm)}</span>
        </p>
        <SeloStatus status={p.status} />
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex shrink-0 -space-x-4">
            {itens.slice(0, 3).map(({ i, prod }) => (
              <FotoProduto key={i.produtoId + i.variacaoId} produto={prod} corHex={prod.variacoes.find((v) => v.id === i.variacaoId)?.cor?.hex} tamanho="mini" className="size-16 rounded-2xl ring-2 ring-card" />
            ))}
          </div>
          <div className="min-w-0">
            <p className="font-display text-[16.5px] font-bold leading-tight">{p.destino}</p>
            <p className="mt-0.5 text-[13.5px] text-muted-foreground">
              {itens.map(({ i, prod }) => `${i.qtd}× ${prod.nome}${i.personalizacao ? " (personalizado)" : ""}`).join(" + ")}
            </p>
            <p className="mt-1 font-display text-[16px] font-bold tabular-nums">{moeda(custoPedido(p))}</p>
          </div>
        </div>
        <div className="min-w-0">
          <LinhaDoTempo passos={passosDoPedido(p)} compactaNoMobile />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5">
        <p className={negativo && p.status === "negado" ? "min-w-0 flex-1 text-[13.5px] font-semibold text-foreground" : "min-w-0 flex-1 text-[13.5px] text-muted-foreground"}>
          {p.status === "negado" && <CircleX className="mr-1 inline size-4 align-[-3px] text-destructive" aria-hidden />}
          {mensagem(p)}
        </p>
        <Botao variante="suave" tamanho="sm" onClick={() => navegar(`/loja/pedidos/${p.id}`)}>Ver detalhes <ArrowRight className="size-4" aria-hidden /></Botao>
      </div>
    </li>
  );
}

export function DetalhePedido({ id }: { id: string }) {
  const { estado, cancelar, diretorId } = useLoja();
  const p = estado.pedidos.find((x) => x.id === id && x.solicitanteId === diretorId);
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [tentou, setTentou] = useState(false);

  if (!p) {
    return (
      <Vazio icone={<Package className="size-7" />} titulo="Pedido não encontrado" texto="Pode ser um pedido de outra área ou o protótipo foi recarregado.">
        <Botao onClick={() => navegar("/loja/pedidos")}>Ver meus pedidos</Botao>
      </Vazio>
    );
  }
  const total = custoPedido(p);
  const podeCancelar = ENCOMENDA_EM_ANDAMENTO.includes(p.status);
  const ent = dataEncerramento(p);

  return (
    <div>
      <button type="button" onClick={() => voltar("/loja/pedidos")} className="mb-3 flex h-10 items-center gap-1.5 font-display text-[14px] font-bold text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Meus pedidos
      </button>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Pedido {p.id} · feito em {dataLonga(p.criadoEm)}</p>
          <h1 className="mt-1 font-display text-[26px] font-bold leading-tight md:text-[32px]">{p.destino}</h1>
        </div>
        <SeloStatus status={p.status} />
      </div>

      {p.status === "negado" && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl border border-destructive/30 bg-destructive/5 p-5">
          <CircleX className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="font-display text-[16px] font-bold">O marketing negou este pedido</p>
            <p className="mt-0.5 text-[14.5px]">{p.motivo}</p>
          </div>
        </div>
      )}
      {p.status === "cancelado" && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl border border-border bg-secondary p-5">
          <Ban className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-display text-[16px] font-bold">Pedido cancelado</p>
            <p className="mt-0.5 text-[14.5px]">{p.motivo}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-display text-[18px] font-bold">Itens</h2>
            <ul className="divide-y divide-border">
              {p.itens.map((i) => {
                const prod = estado.produtos.find((x) => x.id === i.produtoId)!;
                const v = prod.variacoes.find((x) => x.id === i.variacaoId)!;
                return (
                  <li key={i.produtoId + i.variacaoId} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                    <FotoProduto produto={prod} corHex={v.cor?.hex} tamanho="mini" className="size-16 shrink-0 rounded-2xl" />
                    <div className="min-w-0 flex-1">
                      <button type="button" onClick={() => navegar(`/loja/produto/${prod.slug}`)} className="text-left font-display text-[15.5px] font-bold hover:underline">{prod.nome}</button>
                      <p className="text-[13px] text-muted-foreground">{v.rotulo !== "Único" && `${v.rotulo} · `}{i.qtd} × {moeda(i.custoUnitarioNaHora)}</p>
                      {i.personalizacao && (
                        <p className="mt-1.5 flex items-start gap-1.5 rounded-xl bg-sky-soft px-2.5 py-1.5 text-[12.5px]">
                          <Palette className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                          <span className="min-w-0">{i.personalizacao.texto}{i.personalizacao.arteNome && ` · arquivo ${i.personalizacao.arteNome}`}</span>
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-display text-[15.5px] font-bold tabular-nums">{moeda(i.qtd * i.custoUnitarioNaHora)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-[14px] text-muted-foreground">{unidades(unidadesPedido(p))}</span>
              <span className="font-display text-[22px] font-bold tabular-nums">{moeda(total)}</span>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {p.status === "encerrado" ? `Debitado de ${p.centroCustoId} ${areaDoCentro(p.centroCustoId)} em ${dataCurta(ent!)}.`
                : p.status === "negado" || p.status === "cancelado" ? "Nada foi debitado."
                : `O débito em ${p.centroCustoId} ${areaDoCentro(p.centroCustoId)} acontece na retirada.`}
            </p>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-display text-[18px] font-bold">Detalhes da solicitação</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Linha icone={<Target className="size-4" />} rotulo="Finalidade" valor={FINALIDADE_TXT[p.finalidade]} />
              <Linha icone={<CalendarDays className="size-4" />} rotulo="Data em que precisa" valor={dataLonga(p.dataNecessaria)} />
              <Linha icone={<MapPin className="size-4" />} rotulo="Retirada" valor={p.localRetirada} />
              <Linha icone={<HandCoins className="size-4" />} rotulo="Centro de custo" valor={`${p.centroCustoId} · ${areaDoCentro(p.centroCustoId)}`} />
              {p.observacao && <Linha icone={<Package className="size-4" />} rotulo="Observação" valor={p.observacao} />}
            </dl>
          </section>

          {p.tipoPedido === "encomenda" && p.encomenda && (
            <section className="rounded-3xl border border-sky/50 bg-sky-soft p-5 shadow-card">
              <h2 className="mb-1 font-display text-[18px] font-bold">Encomenda sob demanda</h2>
              <p className="mb-4 text-[13.5px] text-foreground/85">Este item não tem estoque próprio: a produção é feita sob demanda, depois do alinhamento com o marketing.</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Linha icone={<Package className="size-4" />} rotulo="Quantidade alinhada" valor={unidades(p.encomenda.quantidadeAlinhada ?? unidadesPedido(p))} />
                {p.encomenda.prazoDesejado && <Linha icone={<CalendarDays className="size-4" />} rotulo="Prazo desejado" valor={dataLonga(p.encomenda.prazoDesejado)} />}
                {p.encomenda.prazoConfirmado && <Linha icone={<CalendarDays className="size-4" />} rotulo="Prazo confirmado" valor={dataLonga(p.encomenda.prazoConfirmado)} />}
                {p.encomenda.observacoesPersonalizacao && <Linha icone={<Palette className="size-4" />} rotulo="Personalização" valor={p.encomenda.observacoesPersonalizacao} />}
              </dl>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-display text-[18px] font-bold">Andamento</h2>
            <LinhaDoTempo orientacao="vertical" passos={passosDoPedido(p, true)} />
            <p className="mt-4 rounded-2xl bg-navy-soft p-3 text-[13px]">{p.status === "negado" ? "Você pode fazer um novo pedido com outro item." : mensagem(p)}</p>
          </section>
          {podeCancelar && (
            <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
              {!cancelando ? (
                <>
                  <p className="text-[13.5px] text-muted-foreground">
                    {p.tipoPedido === "pronta" && p.status === "pronto" ? "Este pedido já saiu do estoque. Cancelar devolve as unidades para a prateleira." : "Enquanto a encomenda não encerra, cancelar não mexe no estoque."}
                  </p>
                  <Botao variante="perigo" className="mt-3 w-full" onClick={() => setCancelando(true)}>Cancelar pedido</Botao>
                </>
              ) : (
                <div className="space-y-3">
                  <Campo rotulo="Por que você está cancelando?" htmlFor="motivo-cancel" erro={tentou && !motivo.trim() ? "Escreva o motivo para o marketing saber." : null}>
                    <textarea id="motivo-cancel" rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: o evento foi adiado" className={classeInput} />
                  </Campo>
                  <div className="flex gap-2">
                    <Botao variante="fantasma" className="flex-1" onClick={() => { setCancelando(false); setTentou(false); }}>Manter pedido</Botao>
                    <Botao variante="perigo" className="flex-1" onClick={() => { setTentou(true); if (motivo.trim() && cancelar(p.id, motivo, diretorId)) setCancelando(false); }}>Confirmar cancelamento</Botao>
                  </div>
                </div>
              )}
            </section>
          )}
          <p className="px-1 text-[12.5px] text-muted-foreground">Status atual: {ROTULO_STATUS[p.status]}.</p>
        </aside>
      </div>
    </div>
  );
}

function Linha({ icone, rotulo, valor }: { icone: React.ReactNode; rotulo: string; valor: string }) {
  return (
    <div className="flex min-w-0 gap-2.5">
      <span className="mt-0.5 shrink-0 text-primary">{icone}</span>
      <div className="min-w-0">
        <dt className="font-display text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{rotulo}</dt>
        <dd className="text-[14.5px]">{valor}</dd>
      </div>
    </div>
  );
}
