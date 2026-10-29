// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Fila de pedidos da equipe: dois recortes. PRONTA ENTREGA (prontos para retirada → registrar
// retirada). ENCOMENDAS (avançar o alinhamento: solicitada → em alinhamento → confirmada →
// em produção → pronto → retirada; negar com motivo; cancelar). A retirada debita o centro
// de custo em qualquer trilho.

import { useState } from "react";
import { ArrowRight, CalendarDays, CircleCheck, Clock, Factory, FileUp, Handshake, Package, Palette, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { FotoProduto } from "../FotoProduto";
import { useLoja } from "../estado";
import { dataCurta, dataLonga, moeda, relativo, unidades } from "../formato";
import { areaDoCentro, usuario } from "../mock";
import { custoPedido, ENCOMENDA_EM_ANDAMENTO, saiuNaHora, unidadesPedido } from "../regras";
import { navegar, trocarParams, type RotaLoja } from "../rota";
import type { Pedido, StatusPedido } from "../tipos";
import { passosDoPedido } from "../telas/MeusPedidos";
import { Avatar, Botao, Campo, classeInput, Gaveta, LinhaDoTempo, ParPills, Selo, SeloStatus, Vazio } from "../ui";
import { GestaoShell } from "./GestaoShell";

const FILTROS: { valor: string; rotulo: string; teste: (p: Pedido) => boolean }[] = [
  { valor: "encomendas", rotulo: "Encomendas em andamento", teste: (p) => p.tipoPedido === "encomenda" && ENCOMENDA_EM_ANDAMENTO.includes(p.status) && p.status !== "pronto" },
  { valor: "pronto", rotulo: "Prontos para retirada", teste: (p) => p.status === "pronto" },
  { valor: "encerrados", rotulo: "Encerrados", teste: (p) => ["encerrado", "negado", "cancelado"].includes(p.status) },
];
const PESO: Record<StatusPedido, number> = {
  encomenda_solicitada: 0, em_alinhamento: 1, confirmada: 2, em_producao: 3, pronto: 4, encerrado: 5, negado: 6, cancelado: 7,
};

// Rótulo da próxima etapa da encomenda (botão "avançar").
const PROXIMO_ROTULO: Partial<Record<StatusPedido, string>> = {
  encomenda_solicitada: "Assumir alinhamento",
  em_alinhamento: "Confirmar encomenda",
  confirmada: "Enviar para produção",
  em_producao: "Marcar pronta para retirada",
};

export function FilaPedidos({ rota }: { rota: RotaLoja }) {
  const { estado } = useLoja();
  const filtro = FILTROS.find((f) => f.valor === rota.params.get("status")) ?? FILTROS[0];
  const lista = estado.pedidos
    .filter((p) => filtro.teste(p))
    .sort((a, b) => PESO[a.status] - PESO[b.status] || a.dataNecessaria.localeCompare(b.dataNecessaria));
  const aberto = estado.pedidos.find((p) => p.id === rota.params.get("pedido"));

  return (
    <GestaoShell titulo="Pedidos de brinde" descricao="Pronta entrega sai na hora e aguarda só a retirada. Encomendas passam pelo alinhamento (volume, prazo, produção) antes de ficarem prontas. O custo entra no centro de custo na retirada.">
      <div className="mb-5 overflow-x-auto [scrollbar-width:none]">
        <ParPills rotulo="Filtrar pedidos" valor={filtro.valor} onChange={(v) => trocarParams({ status: v === "encomendas" ? undefined : v })} className="max-w-none flex-nowrap"
          opcoes={FILTROS.map((f) => ({ valor: f.valor, rotulo: <span className="whitespace-nowrap">{f.rotulo} <span className="tabular-nums opacity-70">{estado.pedidos.filter((p) => f.teste(p)).length}</span></span> }))} />
      </div>

      {lista.length === 0 ? (
        <Vazio icone={<Package className="size-7" />} titulo="Nenhum pedido nesta fila" texto="Encomendas novas aparecem aqui para você alinhar; prontos para retirada esperam a retirada.">
          <Botao variante="contorno" onClick={() => trocarParams({ status: undefined })}>Ver encomendas em andamento</Botao>
        </Vazio>
      ) : (
        <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {lista.map((p) => <CartaoFila key={p.id} pedido={p} ativo={aberto?.id === p.id} />)}
        </ul>
      )}

      <Gaveta aberto={!!aberto} onFechar={() => trocarParams({ pedido: undefined }, true)} largura={540}
        titulo={aberto ? `${aberto.id} · ${aberto.destino}` : ""}
        subtitulo={aberto ? `${usuario(aberto.solicitanteId).nome} · ${aberto.centroCustoId} ${areaDoCentro(aberto.centroCustoId)}` : undefined}>
        {aberto && <PainelPedido key={aberto.id + aberto.status} pedido={aberto} />}
      </Gaveta>
    </GestaoShell>
  );
}

function CartaoFila({ pedido: p, ativo }: { pedido: Pedido; ativo: boolean }) {
  const { estado } = useLoja();
  const u = usuario(p.solicitanteId);
  const perso = p.itens.some((i) => i.personalizacao) || !!p.encomenda?.observacoesPersonalizacao;
  const dias = relativo(p.dataNecessaria);
  const urgente = p.dataNecessaria <= "2026-11-10" && ENCOMENDA_EM_ANDAMENTO.includes(p.status);
  const encomenda = p.tipoPedido === "encomenda";
  const acao = p.status === "pronto" ? "Registrar retirada" : encomenda && PROXIMO_ROTULO[p.status] ? PROXIMO_ROTULO[p.status]! : "Ver detalhes";
  return (
    <li className="min-w-0">
      <button type="button" onClick={() => trocarParams({ pedido: p.id })}
        className={cn("flex h-full w-full flex-col gap-3 rounded-3xl border bg-card p-4 text-left shadow-card transition-shadow hover:shadow-[var(--shadow-float)] sm:p-5", ativo ? "border-primary" : "border-border")}>
        <div className="flex w-full flex-wrap items-start gap-3">
          <Avatar iniciais={u.iniciais} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15.5px] font-bold leading-tight">{u.nome} <span className="font-semibold text-muted-foreground">· {p.centroCustoId}</span></p>
            <p className="truncate text-[13px] text-muted-foreground">{p.id} · {p.destino}</p>
          </div>
          <SeloStatus status={p.status} />
        </div>
        <div className="flex w-full items-center gap-3">
          <div className="flex shrink-0 -space-x-3">
            {p.itens.slice(0, 3).map((i) => {
              const prod = estado.produtos.find((x) => x.id === i.produtoId)!;
              return <FotoProduto key={i.produtoId + i.variacaoId} produto={prod} corHex={prod.variacoes.find((v) => v.id === i.variacaoId)?.cor?.hex} tamanho="mini" className="size-12 rounded-xl ring-2 ring-card" />;
            })}
          </div>
          <p className="min-w-0 flex-1 text-[13.5px]">
            {p.itens.map((i) => {
              const prod = estado.produtos.find((x) => x.id === i.produtoId)!;
              const v = prod.variacoes.find((x) => x.id === i.variacaoId)!;
              return `${i.qtd}× ${prod.nome}${v.rotulo !== "Único" ? ` ${v.rotulo}` : ""}`;
            }).join(" · ")}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2">
          {p.dataNecessaria && (
            <Selo tom={urgente ? "atencao" : "neutro"}>
              <CalendarDays className={cn("size-3.5", urgente ? "text-warning" : "text-muted-foreground")} aria-hidden /> Para {dataCurta(p.dataNecessaria)} · {dias}
            </Selo>
          )}
          <Selo tom={encomenda ? "apoio" : "info"}>{encomenda ? <><Factory className="size-3.5" aria-hidden /> Encomenda</> : <><Zap className="size-3.5 text-primary" aria-hidden /> Pronta entrega</>}</Selo>
          {perso && <Selo tom="apoio"><Palette className="size-3.5" aria-hidden /> Personalizado</Selo>}
          <span className="ml-auto font-display text-[15.5px] font-bold tabular-nums">{moeda(custoPedido(p))}</span>
        </div>
        <span className="flex items-center gap-1 font-display text-[13.5px] font-bold text-primary">{acao} <ArrowRight className="size-4" aria-hidden /></span>
      </button>
    </li>
  );
}

function PainelPedido({ pedido: p }: { pedido: Pedido }) {
  const { estado, avancarEncomenda, negar, retirar, cancelar, equipeId } = useLoja();
  const [modo, setModo] = useState<"normal" | "negar" | "retirar" | "cancelar">("normal");
  const [motivo, setMotivo] = useState("");
  const [nota, setNota] = useState("");
  const [tentou, setTentou] = useState(false);
  const total = custoPedido(p);
  const u = usuario(p.solicitanteId);
  const encomenda = p.tipoPedido === "encomenda";
  const proximoRotulo = PROXIMO_ROTULO[p.status];
  const podeNegar = p.status === "encomenda_solicitada" || p.status === "em_alinhamento";
  const podeCancelar = ENCOMENDA_EM_ANDAMENTO.includes(p.status);

  const confirmarMotivo = (fn: (m: string) => boolean) => {
    setTentou(true);
    if (!motivo.trim()) return;
    if (fn(motivo)) { setModo("normal"); setMotivo(""); setTentou(false); }
  };

  return (
    <div className="space-y-6 pb-2">
      <div className="flex flex-wrap items-center gap-2">
        <SeloStatus status={p.status} />
        <Selo tom={encomenda ? "apoio" : "info"}>{encomenda ? "Encomenda" : "Pronta entrega"}</Selo>
        <span className="text-[13px] text-muted-foreground">Feito em {dataLonga(p.criadoEm)}</span>
      </div>

      <section>
        <h3 className="mb-3 font-display text-[16px] font-bold">Itens</h3>
        <ul className="space-y-2.5">
          {p.itens.map((i) => {
            const prod = estado.produtos.find((x) => x.id === i.produtoId)!;
            const v = prod.variacoes.find((x) => x.id === i.variacaoId)!;
            return (
              <li key={i.produtoId + i.variacaoId} className="rounded-2xl border border-border p-3">
                <div className="flex gap-3">
                  <FotoProduto produto={prod} corHex={v.cor?.hex} tamanho="mini" className="size-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[15px] font-bold leading-tight">{prod.nome}</p>
                    <p className="text-[13px] text-muted-foreground">{v.rotulo !== "Único" && `${v.rotulo} · `}{i.qtd} × {moeda(i.custoUnitarioNaHora)}</p>
                  </div>
                </div>
                {i.personalizacao && (
                  <div className="mt-2.5 rounded-xl bg-sky-soft px-3 py-2 text-[13px]">
                    <p className="flex items-center gap-1.5 font-display font-bold"><Palette className="size-3.5 text-primary" aria-hidden /> Personalização</p>
                    <p className="mt-0.5">{i.personalizacao.texto}</p>
                    {i.personalizacao.arteNome && <p className="mt-1 flex items-center gap-1.5 text-muted-foreground"><FileUp className="size-3.5" aria-hidden /> {i.personalizacao.arteNome}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {encomenda && p.encomenda && (
        <section className="rounded-2xl border border-sky/50 bg-sky-soft p-3.5">
          <p className="flex items-center gap-1.5 font-display text-[14px] font-bold"><Factory className="size-4 text-primary" aria-hidden /> Alinhamento da encomenda</p>
          <dl className="mt-2 grid gap-2 text-[13px] sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Quantidade alinhada</dt><dd className="font-semibold">{unidades(p.encomenda.quantidadeAlinhada ?? unidadesPedido(p))}</dd></div>
            {p.encomenda.prazoDesejado && <div><dt className="text-muted-foreground">Prazo desejado</dt><dd className="font-semibold">{dataLonga(p.encomenda.prazoDesejado)}</dd></div>}
            {p.encomenda.prazoConfirmado && <div><dt className="text-muted-foreground">Prazo confirmado</dt><dd className="font-semibold">{dataLonga(p.encomenda.prazoConfirmado)}</dd></div>}
            {p.encomenda.observacoesPersonalizacao && <div className="sm:col-span-2"><dt className="text-muted-foreground">Personalização</dt><dd className="font-semibold">{p.encomenda.observacoesPersonalizacao}</dd></div>}
          </dl>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-secondary p-3.5">
          <p className="text-[12.5px] text-muted-foreground">Data em que precisa</p>
          <p className="font-display text-[16px] font-bold">{p.dataNecessaria ? `${dataLonga(p.dataNecessaria)} · ${relativo(p.dataNecessaria)}` : "A combinar"}</p>
        </div>
        <div className="rounded-2xl bg-secondary p-3.5">
          <p className="text-[12.5px] text-muted-foreground">Custo do pedido</p>
          <p className="font-display text-[16px] font-bold tabular-nums">{moeda(total)}</p>
          <p className="mt-1 text-[12.5px]">{p.status === "encerrado" ? `Debitado de ${p.centroCustoId}.` : p.status === "negado" || p.status === "cancelado" ? "Nada debitado." : `Debita ${p.centroCustoId} ${areaDoCentro(p.centroCustoId)} na retirada.`}</p>
        </div>
      </section>

      {(p.observacao || p.motivo) && (
        <section className="space-y-2 text-[14px]">
          {p.observacao && <p><span className="font-display font-bold">Observação de {u.nome.split(" ")[0]}:</span> {p.observacao}</p>}
          {p.motivo && <p><span className="font-display font-bold">Motivo{p.status === "cancelado" ? " do cancelamento" : " da negativa"}:</span> {p.motivo}</p>}
        </section>
      )}

      <section>
        <h3 className="mb-3 font-display text-[16px] font-bold">Linha do tempo</h3>
        <LinhaDoTempo orientacao="vertical" passos={passosDoPedido(p, true)} />
      </section>

      {/* Ações por etapa */}
      <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
        {modo === "normal" && encomenda && proximoRotulo && (
          <div className="space-y-3">
            <p className="flex items-start gap-1.5 rounded-xl bg-navy-soft p-3 text-[13.5px]" role="status">
              {p.status === "em_producao" ? <Factory className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> : <Handshake className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />}
              {p.status === "encomenda_solicitada" && "Encomenda nova. Assuma o alinhamento para conversar volume e prazo com quem pediu."}
              {p.status === "em_alinhamento" && "Em alinhamento. Quando volume e prazo estiverem fechados, confirme a encomenda."}
              {p.status === "confirmada" && "Encomenda confirmada. Envie para a produção quando o fornecedor tiver tudo."}
              {p.status === "em_producao" && "Em produção. Marque como pronta quando o lote chegar para retirada."}
            </p>
            <Campo rotulo="Nota para quem pediu (opcional)" htmlFor="nota-enc">
              <input id="nota-enc" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ex.: fechado em 30 unidades, pronto dia 25/11" className={classeInput} />
            </Campo>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Botao tamanho="lg" className="flex-1" onClick={() => { if (avancarEncomenda(p.id, nota.trim() || undefined)) setNota(""); }}>{proximoRotulo}</Botao>
              {podeNegar && <Botao tamanho="lg" variante="perigo" className="flex-1" onClick={() => setModo("negar")}>Negar…</Botao>}
            </div>
            {!podeNegar && <Botao variante="fantasma" className="w-full text-destructive" onClick={() => setModo("cancelar")}>Cancelar encomenda</Botao>}
          </div>
        )}
        {modo === "normal" && p.status === "pronto" && (
          <div className="space-y-3">
            <p className="flex items-start gap-1.5 rounded-xl bg-success-soft p-3 text-[13.5px]">
              {saiuNaHora(p) ? <Zap className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> : <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />}
              {saiuNaHora(p) ? "Pronta entrega: a baixa no estoque já foi feita na criação." : "Encomenda pronta: o lote chegou para retirada."} Na retirada, registre e o custo entra no centro de custo.
            </p>
            <p className="text-[13.5px] text-muted-foreground">O aviso de pronto já foi para {u.nome}.</p>
            <Botao tamanho="lg" className="w-full" onClick={() => setModo("retirar")}>Registrar retirada</Botao>
            {saiuNaHora(p)
              ? <Botao variante="fantasma" className="w-full text-destructive" onClick={() => setModo("cancelar")}>Cancelar e devolver ao estoque</Botao>
              : <Botao variante="fantasma" className="w-full text-destructive" onClick={() => setModo("cancelar")}>Cancelar encomenda</Botao>}
          </div>
        )}
        {modo === "normal" && ["encerrado", "negado", "cancelado"].includes(p.status) && (
          <p className="text-[13.5px] text-muted-foreground">
            {p.status === "encerrado" ? `Pedido encerrado. O débito de ${moeda(total)} em ${p.centroCustoId} está na rastreabilidade.` : "Pedido encerrado, sem efeito no estoque."}
            {p.status === "encerrado" && (
              <button type="button" className="ml-1 font-display font-bold text-primary underline" onClick={() => navegar("/loja/gestao/rastreabilidade", { cc: p.centroCustoId })}>Ver gasto de {p.centroCustoId}</button>
            )}
          </p>
        )}

        {modo === "retirar" && (
          <div className="space-y-3">
            <p className="font-display text-[16px] font-bold">Confirmar a retirada?</p>
            <p className="rounded-xl bg-warning-soft p-3 text-[13.5px]">
              Registrar a retirada encerra o pedido e debita <b>{moeda(total)}</b> de <b>{p.centroCustoId} {areaDoCentro(p.centroCustoId)}</b>.
              {saiuNaHora(p) ? " O estoque já baixou na criação." : " É uma encomenda: a produção foi externa."} Não dá para desfazer pelo protótipo.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Botao variante="fantasma" className="flex-1" onClick={() => setModo("normal")}>Voltar</Botao>
              <Botao tamanho="lg" className="flex-[2]" onClick={() => { if (retirar(p.id)) setModo("normal"); }}>Confirmar retirada</Botao>
            </div>
          </div>
        )}
        {(modo === "negar" || modo === "cancelar") && (
          <div className="space-y-3">
            <Campo rotulo={modo === "negar" ? "Motivo da negativa" : "Motivo do cancelamento"} htmlFor="motivo"
              ajuda={modo === "negar" ? `${u.nome} vai ver este texto em Meus pedidos.` : saiuNaHora(p) && p.status === "pronto" ? "As unidades voltam para o estoque." : "A encomenda é encerrada."}
              erro={tentou && !motivo.trim() ? "O motivo é obrigatório." : null}>
              <textarea id="motivo" rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} className={classeInput}
                placeholder={modo === "negar" ? "Ex.: custo acima do previsto para o volume" : "Ex.: evento cancelado pelo cliente"} />
            </Campo>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Botao variante="fantasma" className="flex-1" onClick={() => { setModo("normal"); setTentou(false); }}>Voltar</Botao>
              <Botao tamanho="lg" variante="perigo" className="flex-[2]"
                onClick={() => confirmarMotivo((m) => (modo === "negar" ? negar(p.id, m) : cancelar(p.id, m, equipeId)))}>
                {modo === "negar" ? "Confirmar negativa" : "Confirmar cancelamento"}
              </Botao>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
