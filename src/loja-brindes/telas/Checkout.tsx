// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Checkout da PRONTA ENTREGA em 4 etapas (encomenda tem fluxo próprio na página do produto).
// Centro de custo vem do cadastro do diretor (v1: só diretores pedem). O item com saldo sai
// na hora e o débito acontece na retirada.

import { useState, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, Building2, CalendarDays, CircleCheck, Lock, MapPin, PackageCheck, ShoppingBag, HandCoins, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FotoProduto } from "../FotoProduto";
import { useLoja } from "../estado";
import { dataCurta, dataLonga, moeda } from "../formato";
import { areaDoCentro, LOCAL_RETIRADA, usuario } from "../mock";
import { prazoExtraDoCarrinho, validarData } from "../regras";
import { navegar, voltar, type EtapaCheckout, type RotaLoja } from "../rota";
import type { CentroCustoId, Finalidade } from "../tipos";
import { BarraFixaMobile, Botao, Campo, classeInput, LinhaDoTempo, Vazio } from "../ui";
import { ListaItens, useResumoCarrinho } from "./CarrinhoGaveta";
import { passosDoPedido } from "./MeusPedidos";

const ETAPAS: { id: EtapaCheckout; rotulo: string }[] = [
  { id: "itens", rotulo: "Itens" },
  { id: "finalidade", rotulo: "Finalidade e entrega" },
  { id: "revisao", rotulo: "Centro de custo e revisão" },
  { id: "confirmacao", rotulo: "Confirmação" },
];

const FINALIDADES: { id: Finalidade; rotulo: string; campo: string; exemplo: string }[] = [
  { id: "evento", rotulo: "Evento", campo: "Nome do evento", exemplo: "Ex.: Feira Tech Summit, estande da Acme" },
  { id: "cliente", rotulo: "Cliente", campo: "Cliente", exemplo: "Ex.: visita ao Banco Horizonte" },
  { id: "parceiro", rotulo: "Parceiro", campo: "Parceiro", exemplo: "Ex.: encontro de parceiros Sul" },
  { id: "interno", rotulo: "Uso interno", campo: "Para quê (opcional)", exemplo: "Ex.: integração do time novo" },
];

export function Checkout({ etapa, rota }: { etapa: EtapaCheckout; rota: RotaLoja }) {
  const { carrinho, estado, rascunho, setRascunho, enviarPedido, diretorId } = useLoja();
  const { total, ok: itensOk } = useResumoCarrinho();
  const [tentou, setTentou] = useState(false);
  const eu = usuario(diretorId);
  const cc = eu.centroCustoId as CentroCustoId;
  const idx = ETAPAS.findIndex((e) => e.id === etapa);

  if (etapa === "confirmacao") return <Confirmacao id={rota.params.get("pedido") ?? ""} />;

  if (!carrinho.length) {
    return (
      <Vazio icone={<ShoppingBag className="size-7" />} titulo="Seu pedido está vazio" texto="Escolha os brindes na vitrine e volte aqui para enviar a solicitação.">
        <Botao onClick={() => navegar("/loja")}>Ir para a vitrine</Botao>
      </Vazio>
    );
  }

  const prazo = prazoExtraDoCarrinho(carrinho, estado.produtos);
  const erroData = validarData(rascunho.dataNecessaria, prazo);
  const dataMin = erroData?.startsWith("min:") ? erroData.slice(4) : null;
  const fin = FINALIDADES.find((f) => f.id === rascunho.finalidade)!;
  const erroDestino = rascunho.finalidade !== "interno" && !rascunho.destino.trim() ? `Informe ${fin.campo.toLowerCase()}.` : null;
  const etapa2Ok = !erroData && !erroDestino;

  const avancar = () => {
    setTentou(true);
    if (etapa === "itens" && !itensOk) return;
    if (etapa === "finalidade" && !etapa2Ok) return;
    setTentou(false);
    if (etapa === "revisao") {
      const r = enviarPedido();
      if (r) navegar("/loja/checkout/confirmacao", { pedido: r.id });
      return;
    }
    navegar(`/loja/checkout/${ETAPAS[idx + 1].id}`);
  };

  const rotuloAvancar = etapa === "revisao" ? "Enviar pedido" : "Continuar";

  return (
    <div className="pb-28 lg:pb-0">
      <button type="button" onClick={() => voltar(idx === 0 ? "/loja" : `/loja/checkout/${ETAPAS[idx - 1].id}`)}
        className="mb-3 flex h-10 items-center gap-1.5 font-display text-[14px] font-bold text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> {idx === 0 ? "Voltar para a loja" : "Etapa anterior"}
      </button>
      <h1 className="font-display text-[26px] font-bold md:text-[30px]">Solicitar brindes</h1>

      {/* Stepper */}
      <div className="mt-4 hidden md:block"><StepperEtapas idx={idx} /></div>
      <div className="mt-3 md:hidden">
        <p className="font-display text-[14px] font-bold">Etapa {idx + 1} de 4 · <span className="text-primary">{ETAPAS[idx].rotulo}</span></p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${((idx + 1) / 4) * 100}%` }} /></div>
      </div>

      <details className="group mt-4 rounded-2xl border border-border bg-card shadow-card lg:hidden">
        <summary className="flex h-14 cursor-pointer list-none items-center justify-between px-4 font-display text-[15px] font-bold">
          <span>{carrinho.length} {carrinho.length === 1 ? "item" : "itens"} · Total {moeda(total)}</span>
          <span className="text-[13px] text-primary group-open:hidden">Ver resumo</span>
          <span className="hidden text-[13px] text-primary group-open:inline">Esconder</span>
        </summary>
        <div className="border-t border-border p-4"><Resumo compacto /></div>
      </details>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="min-w-0 rounded-3xl border border-border bg-card p-5 shadow-card md:p-6">
          {etapa === "itens" && (
            <>
              <h2 className="mb-1 font-display text-[20px] font-bold">Confira os itens</h2>
              <p className="mb-5 text-[14px] text-muted-foreground">Ajuste as quantidades se precisar. Estes itens têm saldo e saem na hora para retirada.</p>
              <ListaItens />
              {tentou && !itensOk && <p className="mt-4 text-[13.5px] font-semibold text-destructive" role="alert">Corrija os itens marcados antes de continuar.</p>}
            </>
          )}

          {etapa === "finalidade" && (
            <div className="space-y-5">
              <div>
                <h2 className="mb-1 font-display text-[20px] font-bold">Para que são os brindes</h2>
                <p className="text-[14px] text-muted-foreground">Isso entra no histórico do item e ajuda o marketing a priorizar.</p>
              </div>
              <div>
                <p className="mb-2 font-display text-[13.5px] font-bold">Finalidade</p>
                <div role="radiogroup" aria-label="Finalidade" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {FINALIDADES.map((f) => {
                    const ativo = rascunho.finalidade === f.id;
                    return (
                      <button key={f.id} type="button" role="radio" aria-checked={ativo} onClick={() => setRascunho({ finalidade: f.id })}
                        className={cn("h-11 rounded-full border font-display text-[14px] font-bold transition-colors", ativo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40")}>
                        {f.rotulo}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Campo rotulo={fin.campo} htmlFor="destino" erro={tentou ? erroDestino : null}>
                <input id="destino" value={rascunho.destino} onChange={(e) => setRascunho({ destino: e.target.value })} placeholder={fin.exemplo} className={classeInput} />
              </Campo>
              <Campo rotulo="Data em que você precisa" htmlFor="data"
                erro={tentou && erroData ? (dataMin ? `${prazo ? "Com a personalização, o" : "O"} pedido fica pronto a partir de ${dataCurta(dataMin)}. Escolha essa data ou uma depois.` : erroData) : null}
                ajuda={prazo ? `Seu pedido tem personalização: conte ${prazo + 2} dias úteis de produção e separação.` : "Conte 2 dias úteis para separar."}>
                <div className="flex flex-wrap items-center gap-2">
                  <input id="data" type="date" value={rascunho.dataNecessaria} onChange={(e) => setRascunho({ dataNecessaria: e.target.value })}
                    className={cn(classeInput, "max-w-[220px]")} />
                  {tentou && dataMin && (
                    <Botao variante="suave" tamanho="sm" onClick={() => setRascunho({ dataNecessaria: dataMin })}>Usar {dataCurta(dataMin)}</Botao>
                  )}
                </div>
              </Campo>
              <div className="flex items-start gap-3 rounded-2xl bg-navy-soft p-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-display text-[14.5px] font-bold">Retirada no local</p>
                  <p className="text-[13.5px] text-foreground/85">{LOCAL_RETIRADA}. Avisamos por e-mail quando estiver separado para retirar.</p>
                </div>
              </div>
              <Campo rotulo="Observação para o marketing (opcional)" htmlFor="obs">
                <textarea id="obs" rows={3} value={rascunho.observacao} onChange={(e) => setRascunho({ observacao: e.target.value })}
                  placeholder="Ex.: vamos entregar junto com o folder no estande" className={cn(classeInput, "resize-y")} />
              </Campo>
            </div>
          )}

          {etapa === "revisao" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1 font-display text-[20px] font-bold">Centro de custo e revisão</h2>
                <p className="text-[14px] text-muted-foreground">Confira tudo antes de enviar. Depois, você ainda pode cancelar enquanto o pedido não for retirado.</p>
              </div>
              <div className="rounded-2xl border border-primary/25 bg-navy-soft p-4">
                <p className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Centro de custo</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-card text-primary"><Building2 className="size-5" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[18px] font-bold">{cc} · {areaDoCentro(cc)}</p>
                    <p className="flex items-center gap-1 text-[13px] text-muted-foreground"><Lock className="size-3.5" aria-hidden /> Vem do seu cadastro de diretor</p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-foreground/85">Não é este? Fale com o marketing para corrigir o seu cadastro antes de enviar.</p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info rotulo="Finalidade" valor={fin.rotulo} />
                <Info rotulo={fin.campo.replace(" (opcional)", "")} valor={rascunho.destino || "Uso interno"} />
                <Info rotulo="Data em que você precisa" valor={rascunho.dataNecessaria ? dataLonga(rascunho.dataNecessaria) : "Não informada"} />
                <Info rotulo="Retirada" valor={LOCAL_RETIRADA} />
                {rascunho.observacao && <Info rotulo="Observação" valor={rascunho.observacao} />}
              </dl>
              <ComoFunciona total={total} cc={cc} />
              {!etapa2Ok && (
                <p className="text-[13.5px] font-semibold text-destructive" role="alert">
                  Falta preencher a finalidade e a data. <button type="button" className="underline" onClick={() => navegar("/loja/checkout/finalidade")}>Voltar para a etapa 2</button>
                </p>
              )}
            </div>
          )}

          <div className="mt-6 hidden items-center justify-between gap-3 border-t border-border pt-5 lg:flex">
            <Botao variante="fantasma" onClick={() => voltar(idx === 0 ? "/loja" : `/loja/checkout/${ETAPAS[idx - 1].id}`)}>
              <ArrowLeft className="size-4" aria-hidden /> {idx === 0 ? "Continuar escolhendo" : "Voltar"}
            </Botao>
            <Botao tamanho="lg" onClick={avancar} disabled={etapa === "revisao" && !etapa2Ok}>
              {rotuloAvancar} <ArrowRight className="size-4" aria-hidden />
            </Botao>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[136px] rounded-3xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-display text-[18px] font-bold">Resumo do pedido</h2>
            <Resumo />
          </div>
        </aside>
      </div>

      <BarraFixaMobile>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-muted-foreground">Total estimado</p>
            <p className="font-display text-[19px] font-bold leading-tight tabular-nums">{moeda(total)}</p>
          </div>
          <Botao tamanho="lg" onClick={avancar} disabled={etapa === "revisao" && !etapa2Ok}>{rotuloAvancar}</Botao>
        </div>
      </BarraFixaMobile>
    </div>
  );
}

function StepperEtapas({ idx }: { idx: number }) {
  return (
    <ol className="flex items-center gap-2">
      {ETAPAS.map((e, i) => (
        <li key={e.id} className="flex min-w-0 flex-1 items-center gap-2" aria-current={i === idx ? "step" : undefined}>
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-full font-display text-[14px] font-bold",
            i < idx ? "bg-primary text-primary-foreground" : i === idx ? "border-2 border-primary bg-card text-primary" : "border-2 border-border bg-card text-muted-foreground")}>
            {i < idx ? <CircleCheck className="size-4.5" aria-hidden /> : i + 1}
          </span>
          <span className={cn("truncate font-display text-[14px] font-bold", i === idx ? "text-foreground" : "text-muted-foreground")}>{e.rotulo}</span>
          {i < ETAPAS.length - 1 && <span className={cn("h-0.5 min-w-4 flex-1", i < idx ? "bg-primary" : "bg-border")} aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

function Resumo({ compacto }: { compacto?: boolean }) {
  const { carrinho, estado, diretorId } = useLoja();
  const { total } = useResumoCarrinho();
  const cc = usuario(diretorId).centroCustoId as CentroCustoId;
  return (
    <div>
      <ul className="space-y-3">
        {carrinho.map((i) => {
          const p = estado.produtos.find((x) => x.id === i.produtoId)!;
          const v = p.variacoes.find((x) => x.id === i.variacaoId)!;
          return (
            <li key={i.chave} className="flex items-center gap-3">
              {!compacto && <FotoProduto produto={p} corHex={v.cor?.hex} tamanho="mini" className="size-12 shrink-0 rounded-xl" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">{i.qtd}× {p.nome}</p>
                <p className="truncate text-[12.5px] text-muted-foreground">{v.rotulo !== "Único" ? v.rotulo : ""}{i.personalizacao ? `${v.rotulo !== "Único" ? " · " : ""}Personalizado` : ""}</p>
              </div>
              <span className="shrink-0 font-display text-[14px] font-bold tabular-nums">{moeda(i.qtd * p.custoUnitario)}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-[14px] text-muted-foreground">Total estimado</span>
        <span className="font-display text-[24px] font-bold tabular-nums">{moeda(total)}</span>
      </div>
      <p className="mt-1 text-[12.5px] text-muted-foreground">Debitado de {cc} {areaDoCentro(cc)} só na retirada. Nada é cobrado ao enviar.</p>
    </div>
  );
}

function ComoFunciona({ total, cc }: { total: number; cc: CentroCustoId }) {
  const passos: { icone: ReactNode; titulo: string; texto: string }[] = [
    { icone: <Zap className="size-4.5" />, titulo: "Tem saldo, então sai na hora", texto: "O pedido já dá baixa no estoque e vai direto para pronto para retirada. Sem aprovação." },
    { icone: <PackageCheck className="size-4.5" />, titulo: "Você retira na recepção", texto: `Avisamos quando estiver separado. A retirada é na ${LOCAL_RETIRADA}.` },
    { icone: <HandCoins className="size-4.5" />, titulo: "Na retirada, debitamos o centro de custo", texto: `${moeda(total)} saem de ${cc} ${areaDoCentro(cc)} só nesse momento.` },
  ];
  return (
    <section className="rounded-2xl border border-border p-4 sm:p-5" aria-labelledby="como-funciona">
      <h3 id="como-funciona" className="font-display text-[16px] font-bold">Como funciona daqui para a frente</h3>
      <ol className="mt-3 space-y-3">
        {passos.map((p, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy-soft text-primary">{p.icone}</span>
            <div className="min-w-0">
              <p className="font-display text-[14.5px] font-bold">{i + 1}. {p.titulo}</p>
              <p className="text-[13.5px] text-muted-foreground">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-display text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{rotulo}</dt>
      <dd className="mt-0.5 break-words text-[14.5px]">{valor}</dd>
    </div>
  );
}

function Confirmacao({ id }: { id: string }) {
  const { estado } = useLoja();
  const pedido = estado.pedidos.find((p) => p.id === id);
  if (!pedido) {
    return (
      <Vazio icone={<ShoppingBag className="size-7" />} titulo="Pedido não encontrado" texto="Recarregar a página volta o protótipo ao estado inicial. Veja os seus pedidos para continuar.">
        <Botao onClick={() => navegar("/loja/pedidos")}>Ver meus pedidos</Botao>
      </Vazio>
    );
  }
  const total = pedido.itens.reduce((s, i) => s + i.qtd * i.custoUnitarioNaHora, 0);
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 hidden md:block"><StepperEtapas idx={3} /></div>
      <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-card md:p-9">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft"><CircleCheck className="size-9 text-success" aria-hidden /></span>
        <p className="mt-4 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Pedido enviado</p>
        <h1 className="mt-1 font-display text-[30px] font-bold leading-tight md:text-[36px]">Pedido {pedido.id} enviado</h1>
        <p className="mx-auto mt-2 max-w-lg text-[15px] text-muted-foreground">
          Tinha saldo, então o pedido já saiu do estoque e está pronto para retirada na recepção do marketing. Avisamos quando separarmos.
        </p>
        <div className="mx-auto mt-6 max-w-xl">
          <LinhaDoTempo passos={passosDoPedido(pedido)} />
        </div>
        <div className="mx-auto mt-7 grid max-w-xl gap-3 text-left sm:grid-cols-3">
          <MiniInfo icone={<CalendarDays className="size-4.5" />} rotulo="Para quando" valor={dataLonga(pedido.dataNecessaria)} />
          <MiniInfo icone={<HandCoins className="size-4.5" />} rotulo="Total estimado" valor={moeda(total)} />
          <MiniInfo icone={<Building2 className="size-4.5" />} rotulo="Centro de custo" valor={pedido.centroCustoId} />
        </div>
        <div className="mx-auto mt-7 max-w-xl text-left"><ComoFunciona total={total} cc={pedido.centroCustoId} /></div>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Botao tamanho="lg" onClick={() => navegar(`/loja/pedidos/${pedido.id}`)}>Acompanhar pedido</Botao>
          <Botao tamanho="lg" variante="contorno" onClick={() => navegar("/loja")}>Voltar para a loja</Botao>
        </div>
      </section>
    </div>
  );
}

function MiniInfo({ icone, rotulo, valor }: { icone: ReactNode; rotulo: string; valor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-secondary px-3.5 py-3">
      <span className="text-primary">{icone}</span>
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground">{rotulo}</p>
        <p className="truncate font-display text-[15px] font-bold">{valor}</p>
      </div>
    </div>
  );
}
