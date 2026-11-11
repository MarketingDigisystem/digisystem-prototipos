/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (RevisaoPedido, LinhaDoTempo) + requirements.md Req. 6 e 8.
 * Linhas, finalidade (obrigatória), destino, data desejada e observação. Linha do tempo completa com uma frase por etapa,
 * aviso de retirada com o Marketing e, havendo personalizável, aviso de orçamento antes da produção.
 * Sem centro de custo e sem local de retirada. Falha na criação mantém o carrinho.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { FotoBrinde } from "../FotoBrinde";
import { PESSOA_DIRETOR } from "../mock";
import { href, navegar, useRota } from "../rota";
import { useLoja } from "../store";
import type { Pedido } from "../tipos";
import { Aviso, EstadoVazio, Esqueleto } from "./Estados";
import { LinhaDoTempo } from "./LinhaDoTempo";
import { AREA, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, brl } from "./util";

export function Revisao() {
  const loja = useLoja();
  const { estado } = useRota();
  const [finalidade, setFinalidade] = useState("");
  const [destino, setDestino] = useState("");
  const [data, setData] = useState("");
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [criado, setCriado] = useState<Pedido | null>(null);

  const linhas = loja.carrinho.map((l) => ({ l, sku: loja.skus.find((s) => s.id === l.skuId)! }));
  const temPersonalizavel = linhas.some((x) => x.sku.tipo === "personalizavel");
  const excede = (x: (typeof linhas)[number]) => x.sku.tipo === "propriedade" && x.l.quantidade > loja.disponivel(x.sku.id);
  const temExcesso = linhas.some(excede);
  const total = linhas.reduce((n, x) => n + (x.sku.custoUnitario ?? 0) * x.l.quantidade, 0);

  const voltar = (
    <a href={href("")} className="mb-4 inline-flex h-10 items-center gap-2 rounded-full pr-3 font-display text-sm font-bold text-navy hover:underline">
      <ArrowLeft className="size-4" aria-hidden /> Continuar escolhendo
    </a>
  );

  // Sucesso: pedido recém-criado ou, no seletor ?estado=sucesso, o mais recente do diretor.
  const pedidoOk = criado ?? (estado === "sucesso" ? loja.pedidos.find((p) => p.solicitante === PESSOA_DIRETOR) ?? null : null);
  if (pedidoOk) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-success-soft text-[var(--success-strong)]">
              <CheckCircle2 className="size-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-navy sm:text-3xl">Pedido nº {pedidoOk.numero} registrado</h1>
              <p className="mt-1 text-muted-foreground">Reservamos os brindes e avisamos o Marketing. Você acompanha cada etapa em Pedidos.</p>
            </div>
          </div>
          <div className="mt-8"><LinhaDoTempo estado={pedidoOk.estado} eventos={pedidoOk.eventos} /></div>
          <div className="mt-8 flex flex-wrap gap-2">
            <a href={href(`pedidos/${pedidoOk.id}`)} className={BOTAO_PRIMARIO}>Ver o pedido</a>
            <a href={href("")} className={BOTAO_SECUNDARIO}>Voltar aos brindes</a>
          </div>
        </div>
      </div>
    );
  }

  if (estado === "carregando") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6" aria-busy="true">
        {voltar}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4"><Esqueleto className="h-56 w-full" /><Esqueleto className="h-72 w-full" /></div>
          <Esqueleto className="h-96 w-full" />
        </div>
      </div>
    );
  }
  if (estado === "vazio" || linhas.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {voltar}
        <EstadoVazio titulo="Seu carrinho está vazio" texto="Escolha os brindes na vitrine para revisar o pedido." acao={<a href={href("")} className={BOTAO_PRIMARIO}>Ver brindes</a>} />
      </div>
    );
  }

  const confirmar = () => {
    if (!finalidade.trim()) return setErro("Informe a finalidade do pedido.");
    if (temExcesso) return setErro("Ajuste as quantidades sinalizadas no carrinho.");
    setErro("");
    setEnviando(true);
    window.setTimeout(() => {
      setEnviando(false);
      if (estado === "erro") return setErro("Não foi possível criar o pedido. Seu carrinho continua como estava. Tente de novo em instantes.");
      const r = loja.criarPedido({ finalidade: finalidade.trim(), destino: destino.trim() || undefined, dataDesejada: data || undefined, observacao: obs.trim() || undefined });
      if (!r.ok) return setErro(r.motivo);
      setCriado(r.dado);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {voltar}
      <h1 className="text-3xl font-bold text-navy sm:text-4xl">Revise o pedido</h1>
      <p className="mt-1 text-muted-foreground">Confira os brindes, conte para que serve e veja o caminho até a retirada.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section aria-label="Brindes do pedido" className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold text-navy">Brindes</h2>
            <ul className="mt-3 divide-y">
              {linhas.map((x) => (
                <li key={x.l.chave} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <FotoBrinde src={x.sku.foto} alt={x.sku.nome} className="size-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy">{x.sku.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {x.sku.tipo === "propriedade" ? `${x.l.quantidade} × ${brl(x.sku.custoUnitario ?? 0)}` : `${x.l.quantidade} unidades · valor a avaliar conforme a quantidade`}
                    </p>
                    {excede(x) && <p role="alert" className="text-xs font-semibold text-destructive">Quantidade acima do disponível. Ajuste no carrinho.</p>}
                  </div>
                  {x.sku.tipo === "propriedade" && <p className="font-display text-base font-bold text-navy">{brl((x.sku.custoUnitario ?? 0) * x.l.quantidade)}</p>}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">Total</span>
              {temPersonalizavel ? <span className="text-sm font-semibold text-navy">Valor a avaliar pelo Marketing</span> : <span className="font-display text-xl font-bold text-navy">{brl(total)}</span>}
            </div>
            <button type="button" onClick={() => loja.abrirCarrinho(true)} className="mt-3 text-sm font-semibold text-navy underline-offset-2 hover:underline">Editar no carrinho</button>
          </section>

          <section aria-label="Dados do pedido" className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold text-navy">Sobre o pedido</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="finalidade" className="mb-1.5 block text-sm font-semibold text-navy">Finalidade <span className="text-destructive">*</span></label>
                <input id="finalidade" value={finalidade} onChange={(e) => { setFinalidade(e.target.value); setErro(""); }} aria-required placeholder="Ex.: Visita de clientes em Curitiba" className={CAMPO} />
              </div>
              <div>
                <label htmlFor="destino" className="mb-1.5 block text-sm font-semibold text-navy">Destino <span className="font-normal text-muted-foreground">(opcional)</span></label>
                <input id="destino" value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Ex.: Evento no Rio de Janeiro" className={CAMPO} />
              </div>
              <div>
                <label htmlFor="data" className="mb-1.5 block text-sm font-semibold text-navy">Data desejada <span className="font-normal text-muted-foreground">(opcional)</span></label>
                <input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} className={CAMPO} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="obs" className="mb-1.5 block text-sm font-semibold text-navy">Observação <span className="font-normal text-muted-foreground">(opcional)</span></label>
                <textarea id="obs" rows={3} value={obs} onChange={(e) => setObs(e.target.value)} className={AREA} />
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section aria-label="O que acontece depois" className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold text-navy">O que acontece depois</h2>
            <div className="mt-4"><LinhaDoTempo vertical /></div>
            <div className="mt-2 space-y-2 text-sm">
              <p className="rounded-2xl bg-secondary/60 px-4 py-3 text-foreground">A retirada é feita com o Marketing. Você recebe um aviso quando estiver pronto.</p>
              {temPersonalizavel && (
                <p className="rounded-2xl bg-sky-soft px-4 py-3 text-foreground">O Marketing avalia o valor dos brindes personalizáveis conforme a quantidade e envia o orçamento antes da produção.</p>
              )}
            </div>
            <div className="mt-4 min-h-[5rem]" aria-live="polite">{erro && <Aviso tom="erro">{erro}</Aviso>}</div>
            <button type="button" disabled={enviando} onClick={confirmar} className={`${BOTAO_PRIMARIO} mt-2 w-full`}>
              {enviando ? <><Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> Enviando</> : "Confirmar pedido"}
            </button>
            <button type="button" onClick={() => navegar("")} className="mt-2 h-10 w-full rounded-full font-display text-sm font-bold text-navy hover:bg-navy-soft">Voltar à vitrine</button>
          </section>
        </aside>
      </div>
    </div>
  );
}
