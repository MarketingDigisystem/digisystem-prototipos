// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/ e loja-brindes/ (revisão do pedido), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 3 e 4).
//
// Tela única "Revise o pedido": itens, finalidade, destino, data desejada opcional, observação e linha do tempo.
// Sem centro de custo, sem local de retirada, sem "Como funciona". As mensagens usam faixas de altura reservada.

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PrecoBrinde } from "../../PrecoBrinde";
import { TotalPedido } from "../../TotalPedido";
import { formatarDdMm, hojeDe, precoDaLinhaDoCarrinho, prazoExtraDasLinhas, totalDoCarrinho, validarDataDesejada } from "../../regras";
import { href } from "../../rota";
import { useLoja } from "../../store";
import type { Pedido } from "../../tipos";
import { estiloEntrada } from "../../movimento";
import { FotoBrinde, Msg } from "../../ui";
import { LinhaDoTempo } from "./LinhaDoTempo";

const CAMPO =
  "h-11 w-full rounded-2xl border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";
const BOTAO_PRIMARIO =
  "inline-flex h-11 items-center justify-center rounded-full bg-navy px-6 font-display text-sm font-bold text-navy-foreground le-btn hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:cursor-not-allowed disabled:opacity-50";

export function Revisao() {
  const loja = useLoja();
  const [finalidade, setFinalidade] = useState("");
  const [destino, setDestino] = useState("");
  const [data, setData] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [criado, setCriado] = useState<Pedido | null>(null);

  if (criado) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="le-entra rounded-3xl border bg-card p-6 text-center shadow-card sm:p-8" role="status">
          <CheckCircle2 className="le-pop mx-auto size-10 text-[color:var(--success-strong)]" aria-hidden />
          <h1 className="mt-3 font-display text-3xl font-bold text-navy">Pedido enviado</h1>
          <p className="mt-2 text-sm text-foreground/85">
            O pedido {criado.id} foi recebido pelo Marketing. O Marketing entra em contato se precisar alinhar algum detalhe.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a href={href("pedidos")} className={BOTAO_PRIMARIO}>
              Ver meus pedidos
            </a>
            <a
              href={href("")}
              className="le-btn inline-flex h-11 items-center rounded-full px-5 font-display text-sm font-bold text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
            >
              Voltar aos brindes
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (loja.carrinho.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border bg-card p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-bold text-navy">Seu carrinho está vazio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Escolha um brinde no catálogo para montar o pedido.</p>
          <a href={href("")} className={`${BOTAO_PRIMARIO} mt-4`}>
            Ver brindes
          </a>
        </div>
      </section>
    );
  }

  const hoje = hojeDe(loja.dados);
  const prazoExtra = prazoExtraDasLinhas(loja.dados.brindes, loja.carrinho);
  const validade = validarDataDesejada(data || undefined, prazoExtra, hoje);

  const { total, aAvaliar } = totalDoCarrinho(loja.dados.brindes, loja.carrinho);

  const enviar = () => {
    if (!finalidade.trim()) {
      setErro("Informe a finalidade do pedido.");
      return;
    }
    if (!validade.ok) {
      setErro(validade.erros.join(" "));
      return;
    }
    const r = loja.criarPedido({
      finalidade,
      destino: destino || undefined,
      observacao: observacao || undefined,
      dataDesejada: data || undefined,
    });
    if (!r.ok) {
      setErro(r.motivo); // o carrinho continua como estava
      return;
    }
    setErro(null);
    setCriado(r.dado);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy">Revise o pedido</h1>
      <p className="mt-1 text-sm text-muted-foreground">Confira os itens, diga para que serão usados e envie.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0 space-y-3">
          <h2 className="font-display text-lg font-bold text-navy">Itens</h2>
          <ul className="space-y-2">
            {loja.carrinho.map((l, idx) => {
              const b = loja.brinde(l.brindeId);
              if (!b) return null;
              const extra = [l.personalizacao?.texto, l.personalizacao?.arte ? `Arte: ${l.personalizacao.arte}` : ""].filter(Boolean).join(" · ");
              return (
                <li key={l.chave} style={estiloEntrada(idx)} className="le-entra flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-card">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl border">
                    <FotoBrinde src={b.foto} alt={b.nome} compacto />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p title={b.nome} className="line-clamp-2 break-words font-display text-base font-bold leading-snug text-navy">{b.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.qtd} {l.qtd === 1 ? "unidade" : "unidades"}
                    </p>
                    {extra && <p className="line-clamp-2 text-xs text-foreground/80">{extra}</p>}
                  </div>
                  <PrecoBrinde modo="linha" linha={precoDaLinhaDoCarrinho(b, l.qtd)} className="max-w-[11rem] shrink-0 text-right" />
                </li>
              );
            })}
          </ul>
          <TotalPedido total={total} aAvaliar={aAvaliar} className="rounded-2xl bg-secondary px-4 py-3" />
        </div>

        <form
          className="min-w-0 space-y-4 rounded-3xl border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
          noValidate
        >
          <label className="block text-sm">
            <span className="mb-1 block font-display font-bold text-navy">Finalidade *</span>
            <input
              className={CAMPO}
              value={finalidade}
              onChange={(e) => {
                setFinalidade(e.target.value);
                setErro(null);
              }}
              placeholder="Ex.: presentes para clientes do evento"
              aria-required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-display font-bold text-navy">Destino</span>
            <input className={CAMPO} value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Ex.: evento em São Paulo (opcional)" />
          </label>
          <div className="text-sm">
            <label htmlFor="data-desejada" className="mb-1 block font-display font-bold text-navy">
              Data desejada <span className="font-sans text-xs font-normal text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="data-desejada"
              type="date"
              className={`${CAMPO} ${!validade.ok ? "border-destructive" : ""}`}
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                setErro(null);
              }}
              aria-invalid={!validade.ok}
              aria-describedby="data-erro"
            />
            {/* Faixa reservada: a mensagem e o botão "Usar dd/mm" aparecem sem mover o resto do formulário. */}
            <div id="data-erro" className="mt-2 flex min-h-[5.5rem] flex-wrap content-start items-center gap-2 text-xs sm:min-h-11 lg:min-h-[5.5rem] font-semibold text-[color:var(--destructive-strong)]" role={validade.ok ? undefined : "alert"}>
              {!validade.ok && (
                <div key={validade.erros.join(" ")} className="le-msg flex flex-wrap items-center gap-2">
                  <span>{validade.erros.join(" ")}</span>
                  {validade.sugestao && (
                    <button
                      type="button"
                      onClick={() => setData(validade.sugestao ?? "")}
                      className="le-btn inline-flex h-11 items-center rounded-full bg-navy-soft px-4 font-display text-sm font-bold text-[color:var(--le-ativo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
                    >
                      Usar {formatarDdMm(validade.sugestao)}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-display font-bold text-navy">Observação</span>
            <textarea
              className={`${CAMPO} h-24 resize-none py-3`}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Algo que o Marketing precise saber (opcional)"
            />
          </label>
          <div>
            <button type="submit" className={`${BOTAO_PRIMARIO} w-full`}>
              Enviar pedido
            </button>
            <p role={erro ? "alert" : undefined} className="mt-2 min-h-5 text-sm font-semibold text-[color:var(--destructive-strong)]">
              <Msg texto={erro} />
            </p>
          </div>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg font-bold text-navy">O que acontece depois</h2>
        <LinhaDoTempo />
      </div>
    </section>
  );
}
