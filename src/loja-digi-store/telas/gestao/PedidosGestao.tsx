/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: requirements.md Requisitos 7, 8, 10, 11 e maquina.ts (acoesPermitidas, avaliarTransicao).
 * Fila em linhas + detalhe com Estado_Interno, fluxo confirmado, linhas, ações e histórico.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { useState } from "react";
import { acoesPermitidas, ETAPAS, ROTULO_ESTADO, TRANSICOES, avaliarTransicao } from "../../maquina";
import { href, useRota, type EstadoTela } from "../../rota";
import { useLoja } from "../../store";
import type { AcaoPedido, AndamentoLinha, EstadoPedido, LinhaPedido, Pedido } from "../../tipos";
import { BotaoAcao, brl, CAMPO, Campo, dataCurta, dataHora, Erro, EstadosDaTela, Modal, SeloEstado } from "./ui";

const FILTROS: { id: EstadoPedido | "abertos" | "todos"; rotulo: string }[] = [
  { id: "abertos", rotulo: "Em andamento" },
  { id: "solicitada", rotulo: "Solicitadas" },
  { id: "em_alinhamento", rotulo: "Em alinhamento" },
  { id: "pronto_para_retirada", rotulo: "Prontas" },
  { id: "todos", rotulo: "Todos" },
];

const ROTULO_ACAO: Record<AcaoPedido, string> = {
  assumir: "Assumir pedido",
  marcar_pronto: "Marcar pronto para retirada",
  encerrar: "Registrar retirada",
  recusar: "Recusar",
  cancelar: "Cancelar pedido",
};

const PROXIMO_PASSO: Partial<Record<EstadoPedido, string>> = {
  solicitada: "Assumir",
  em_alinhamento: "Separar e concluir",
  pronto_para_retirada: "Registrar retirada",
};

const ROTULO_ANDAMENTO: Record<AndamentoLinha, string> = {
  em_separacao: "Em separação",
  aguardando_orcamento: "Aguardando orçamento",
  orcamento_enviado: "Orçamento enviado",
  orcamento_aceito: "Orçamento aceito",
  pronta: "Pronta",
};

const ORDEM_ESTADO: Record<EstadoPedido, number> = { solicitada: 0, em_alinhamento: 1, pronto_para_retirada: 2, encerrada: 3, recusada: 4, cancelada: 5 };

function pedidoDaHash(): string | null {
  const q = window.location.hash.split("?")[1] ?? "";
  return new URLSearchParams(q).get("pedido");
}

export function PedidosGestao({ estadoTela }: { estadoTela: EstadoTela }) {
  useRota(); // re-renderiza quando o hash muda (?pedido=)
  const loja = useLoja();
  const id = pedidoDaHash();
  const pedido = id ? loja.pedidos.find((p) => p.id === id) : undefined;
  if (pedido) return <Detalhe pedido={pedido} />;
  return <Fila estadoTela={estadoTela} />;
}

function Fila({ estadoTela }: { estadoTela: EstadoTela }) {
  const loja = useLoja();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["id"]>("abertos");
  const lista = loja.pedidos
    .filter((p) => (filtro === "todos" ? true : filtro === "abertos" ? ["solicitada", "em_alinhamento", "pronto_para_retirada"].includes(p.estado) : p.estado === filtro))
    .sort((a, b) => ORDEM_ESTADO[a.estado] - ORDEM_ESTADO[b.estado] || a.criadoEm.localeCompare(b.criadoEm));

  return (
    <section aria-label="Fila de pedidos">
      <FluxoConfirmado />
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar pedidos">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={`h-9 min-w-[96px] shrink-0 rounded-full px-4 font-display text-sm font-bold transition-colors ${filtro === f.id ? "bg-navy-soft text-navy shadow-[0_0_0_2px_var(--sky)]" : "text-foreground/80 hover:bg-navy-soft"}`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      <EstadosDaTela estado={estadoTela} vazio="Nenhum pedido por aqui ainda." />
      {!estadoTela && (lista.length === 0 ? (
        <div className="mt-4 rounded-3xl bg-card p-10 text-center text-muted-foreground shadow-[var(--shadow-card)]">Nenhum pedido neste filtro.</div>
      ) : (
        <div className="relative mt-4 overflow-x-auto rounded-3xl bg-card shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Pedido</th>
                <th className="px-3 py-3 font-semibold">Quem pediu</th>
                <th className="px-3 py-3 font-semibold">Finalidade</th>
                <th className="px-3 py-3 font-semibold">Brindes</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-3 py-3 font-semibold">Responsável</th>
                <th className="px-3 py-3 font-semibold">Próximo passo</th>
                <th className="w-10 px-3 py-3"><span className="sr-only">Abrir</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-navy-soft/40">
                  <td className="px-5 py-3 font-display font-bold text-navy">
                    <a href={href("gestao", { aba: "pedidos", pedido: p.id })} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">#{p.numero}</a>
                    <span className="block text-xs font-normal text-muted-foreground">{dataCurta(p.criadoEm)}</span>
                  </td>
                  <td className="px-3 py-3">{p.solicitante}</td>
                  <td className="max-w-[220px] truncate px-3 py-3" title={p.finalidade}>{p.finalidade}</td>
                  <td className="px-3 py-3 tabular-nums">{p.linhas.reduce((n, l) => n + l.quantidade, 0)} un. · {p.linhas.length} {p.linhas.length === 1 ? "item" : "itens"}</td>
                  <td className="px-3 py-3"><SeloEstado estado={p.estado} /></td>
                  <td className="px-3 py-3">{p.responsavel ?? <span className="text-muted-foreground">Ninguém ainda</span>}</td>
                  <td className="px-3 py-3 text-muted-foreground">{PROXIMO_PASSO[p.estado] ?? "—"}</td>
                  <td className="px-3 py-3">
                    <a href={href("gestao", { aba: "pedidos", pedido: p.id })} aria-label={`Abrir pedido ${p.numero}`} className="grid size-8 place-items-center rounded-full text-navy hover:bg-navy-soft">
                      <ChevronRight className="size-4" aria-hidden />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}

/** Legenda do fluxo do Requisito 8 (confirmado em 2026-11-10). */
function FluxoConfirmado() {
  return (
    <div className="mt-6 rounded-3xl bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fluxo confirmado</p>
      <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-sm font-bold text-navy">
        {ETAPAS.map((e, i) => (
          <li key={e.etapa} className="flex items-center gap-2">
            {e.rotulo}
            {i < ETAPAS.length - 1 && <ChevronRight className="size-4 text-muted-foreground" aria-hidden />}
          </li>
        ))}
      </ol>
      <p className="mt-1 text-xs text-muted-foreground">Em qualquer ponto antes de encerrar: recusar (só a Equipe, com motivo) ou cancelar (com motivo).</p>
    </div>
  );
}

function FluxoDoPedido({ pedido }: { pedido: Pedido }) {
  const desvio = pedido.estado === "recusada" || pedido.estado === "cancelada";
  const atual = ETAPAS.findIndex((e) => e.etapa === pedido.estado);
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Etapas do fluxo">
      {ETAPAS.map((e, i) => {
        const feito = !desvio && i < atual;
        const ativo = !desvio && i === atual;
        return (
          <li key={e.etapa} className={`flex h-12 items-center gap-2 rounded-2xl px-3 font-display text-sm font-bold ${ativo ? "bg-navy text-white" : feito ? "bg-navy-soft text-navy" : "bg-secondary text-muted-foreground"}`} aria-current={ativo ? "step" : undefined}>
            {feito ? <Check className="size-4 shrink-0" aria-hidden /> : <span className="grid size-5 shrink-0 place-items-center rounded-full border text-[11px]">{i + 1}</span>}
            <span className="leading-tight">{e.rotulo}</span>
          </li>
        );
      })}
      {desvio && (
        <li className="col-span-full rounded-2xl bg-[oklch(0.95_0.04_25)] px-4 py-2 text-sm font-semibold text-[oklch(0.5_0.18_25)]">
          {ROTULO_ESTADO[pedido.estado]}{pedido.motivo ? `: ${pedido.motivo}` : ""}
        </li>
      )}
    </ol>
  );
}

function Detalhe({ pedido }: { pedido: Pedido }) {
  const loja = useLoja();
  const [confirmar, setConfirmar] = useState<AcaoPedido | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [orcLinha, setOrcLinha] = useState<LinhaPedido | null>(null);
  const [qtdLinha, setQtdLinha] = useState<LinhaPedido | null>(null);

  const temOrcAceito = pedido.linhas.some((l) => l.andamento === "orcamento_aceito" || (l.skuTipo === "personalizavel" && l.andamento === "pronta"));
  const acoes = acoesPermitidas(pedido.estado, "equipe", { temOrcamentoAceito: temOrcAceito });
  const todasProntas = pedido.linhas.every((l) => l.andamento === "pronta");
  const exigeMotivo = (a: AcaoPedido) => TRANSICOES.find((t) => t.de === pedido.estado && t.acao === a)?.exigeMotivo ?? false;
  const emAlinhamento = pedido.estado === "em_alinhamento";

  const executar = (a: AcaoPedido) => {
    const r = loja.transicionar(pedido.id, a, motivo);
    if (!r.ok) { setErro(r.motivo); return; }
    setErro(null); setConfirmar(null); setMotivo("");
    setAviso(`Pedido #${pedido.numero}: ${ROTULO_ACAO[a].toLowerCase()} registrado.`);
  };

  const clicar = (a: AcaoPedido) => {
    setAviso(null);
    if (exigeMotivo(a)) { setConfirmar(a); setErro(null); return; }
    // Mostra a mensagem da própria máquina (ex.: ainda há brindes que não estão prontos).
    const v = avaliarTransicao({ estado: pedido.estado, acao: a, ator: "equipe", todasLinhasProntas: todasProntas, temOrcamentoAceito: temOrcAceito });
    if (!v.ok) { setErro(v.motivo); return; }
    executar(a);
  };

  return (
    <section aria-label={`Pedido ${pedido.numero}`} className="mt-6">
      <a href={href("gestao", { aba: "pedidos" })} className="inline-flex h-9 items-center gap-2 rounded-full px-3 font-display text-sm font-bold text-navy hover:bg-navy-soft">
        <ArrowLeft className="size-4" aria-hidden /> Voltar à fila
      </a>

      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-navy">Pedido #{pedido.numero}</h2>
              <SeloEstado estado={pedido.estado} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Estado interno do fluxo confirmado. O diretor vê só a etapa equivalente.</p>
            <div className="mt-4"><FluxoDoPedido pedido={pedido} /></div>
            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Dado rotulo="Quem pediu" valor={pedido.solicitante} />
              <Dado rotulo="Pedido em" valor={dataHora(pedido.criadoEm)} />
              <Dado rotulo="Finalidade" valor={pedido.finalidade} />
              <Dado rotulo="Responsável" valor={pedido.responsavel ?? "Ninguém assumiu"} />
              {pedido.destino && <Dado rotulo="Destino" valor={pedido.destino} />}
              {pedido.dataDesejada && <Dado rotulo="Data desejada" valor={new Date(pedido.dataDesejada + "T12:00:00").toLocaleDateString("pt-BR")} />}
              {pedido.observacao && <Dado rotulo="Observação" valor={pedido.observacao} />}
            </dl>
          </div>

          <div className="relative rounded-3xl bg-card shadow-[var(--shadow-card)]">
            <h3 className="px-5 pt-5 text-lg font-bold text-navy sm:px-6">Brindes do pedido</h3>
            <div className="overflow-x-auto">
              <table className="mt-2 w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2 font-semibold sm:px-6">Brinde</th>
                    <th className="px-3 py-2 font-semibold">Qtd.</th>
                    <th className="px-3 py-2 font-semibold">Andamento</th>
                    <th className="px-3 py-2 text-right font-semibold sm:pr-6">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.linhas.map((l) => (
                    <tr key={l.id} className="border-b align-top last:border-0">
                      <td className="px-5 py-3 sm:px-6">
                        <span className="font-semibold text-navy">{l.skuNome}</span>
                        <span className="block text-xs text-muted-foreground">
                          {l.skuTipo === "propriedade" ? `Em estoque · ${brl(l.custoUnitario ?? 0)} por unidade` : "Personalizável · sem reserva"}
                        </span>
                        {l.personalizacao?.texto && <span className="block text-xs text-muted-foreground">Texto: {l.personalizacao.texto}</span>}
                        {l.orcamento && <span className="block text-xs text-muted-foreground">Orçamento: {brl(l.orcamento.valorTotal)} para {l.orcamento.quantidade} un., prazo de {l.orcamento.prazoDias} dias</span>}
                      </td>
                      <td className="px-3 py-3 tabular-nums">{l.quantidade}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex h-7 items-center whitespace-nowrap rounded-full px-3 text-xs font-bold ${l.andamento === "pronta" ? "bg-[oklch(0.95_0.05_155)] text-[var(--success-strong)]" : "bg-secondary text-navy"}`}>{ROTULO_ANDAMENTO[l.andamento]}</span>
                      </td>
                      <td className="px-3 py-3 text-right sm:pr-6">
                        <div className="flex flex-wrap justify-end gap-2">
                          {emAlinhamento && l.andamento === "aguardando_orcamento" && <MiniBotao rotulo="Informar orçamento" onClick={() => setOrcLinha(l)} />}
                          {emAlinhamento && l.andamento === "orcamento_enviado" && <span className="text-xs text-muted-foreground">Aguardando aceite do diretor</span>}
                          {emAlinhamento && (l.andamento === "em_separacao" || l.andamento === "orcamento_aceito") && (
                            <MiniBotao rotulo="Marcar pronta" onClick={() => { loja.marcarLinhaPronta(pedido.id, l.id); setErro(null); }} />
                          )}
                          {emAlinhamento && l.andamento !== "pronta" && <MiniBotao rotulo="Ajustar qtd." onClick={() => setQtdLinha(l)} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-lg font-bold text-navy">Ações permitidas</h3>
            {acoes.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Este pedido está {ROTULO_ESTADO[pedido.estado].toLowerCase()}. Não há mais ações.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {acoes.map((a) => (
                  <BotaoAcao
                    key={a}
                    rotulo={ROTULO_ACAO[a]}
                    variante={a === "recusar" || a === "cancelar" ? "perigo" : "primario"}
                    desabilitado={a === "marcar_pronto" && !todasProntas}
                    dica={a === "marcar_pronto" && !todasProntas ? "Ainda há brindes que não estão prontos." : undefined}
                    onClick={() => clicar(a)}
                  />
                ))}
              </div>
            )}
            {emAlinhamento && !todasProntas && <p className="mt-3 text-xs text-muted-foreground">Para marcar pronto, todas as linhas precisam estar prontas.</p>}
            {pedido.estado === "pronto_para_retirada" && <p className="mt-3 text-xs text-muted-foreground">Ao registrar a retirada, a reserva vira baixa do saldo físico.</p>}
            {aviso && <p role="status" className="mt-3 rounded-2xl bg-[oklch(0.95_0.05_155)] px-3 py-2 text-sm font-semibold text-[var(--success-strong)]">{aviso}</p>}
            <Erro texto={confirmar ? null : erro} />
          </div>

          <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-lg font-bold text-navy">Histórico</h3>
            <ol className="mt-3 space-y-3 border-l-2 border-navy-soft pl-4">
              {[...pedido.eventos].reverse().map((ev, i) => (
                <li key={i} className="relative text-sm">
                  <span className="absolute -left-[22px] top-1.5 size-2.5 rounded-full bg-navy" aria-hidden />
                  <p className="font-semibold text-navy">
                    {ev.de === ev.para ? "Quantidade ajustada" : ev.de ? `${ROTULO_ESTADO[ev.de]} para ${ROTULO_ESTADO[ev.para]}` : `Pedido ${ROTULO_ESTADO[ev.para].toLowerCase()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{ev.pessoa} · {dataHora(ev.em)}</p>
                  {ev.nota && <p className="mt-0.5 text-xs">{ev.nota}</p>}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      {confirmar && (
        <Modal titulo={ROTULO_ACAO[confirmar]} onFechar={() => { setConfirmar(null); setMotivo(""); setErro(null); }}>
          <Campo rotulo={confirmar === "recusar" ? "Motivo da recusa (o diretor recebe)" : "Motivo do cancelamento"}>
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} className={CAMPO} autoFocus />
          </Campo>
          <p className="mt-2 text-xs text-muted-foreground">A reserva dos brindes em estoque volta para o disponível.</p>
          <Erro texto={erro} />
          <div className="mt-4 flex justify-end gap-2">
            <BotaoAcao rotulo="Voltar" variante="secundario" onClick={() => { setConfirmar(null); setMotivo(""); setErro(null); }} />
            <BotaoAcao rotulo={confirmar === "recusar" ? "Recusar pedido" : "Cancelar pedido"} variante="perigo" onClick={() => executar(confirmar)} />
          </div>
        </Modal>
      )}

      {orcLinha && <ModalOrcamento pedido={pedido} linha={orcLinha} onFechar={() => setOrcLinha(null)} />}
      {qtdLinha && <ModalQuantidade pedido={pedido} linha={qtdLinha} onFechar={() => setQtdLinha(null)} />}
    </section>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground">{rotulo}</dt>
      <dd className="font-semibold text-foreground">{valor}</dd>
    </div>
  );
}

function MiniBotao({ rotulo, onClick }: { rotulo: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-8 whitespace-nowrap rounded-full bg-navy-soft px-3 font-display text-xs font-bold text-navy hover:bg-navy-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
      {rotulo}
    </button>
  );
}

function ModalOrcamento({ pedido, linha, onFechar }: { pedido: Pedido; linha: LinhaPedido; onFechar: () => void }) {
  const loja = useLoja();
  const [valor, setValor] = useState("");
  const [prazo, setPrazo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  return (
    <Modal titulo={`Orçamento: ${linha.skuNome}`} onFechar={onFechar}>
      <p className="mb-3 text-sm text-muted-foreground">Para {linha.quantidade} unidades. O diretor recebe o aviso e decide se aceita.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Valor total (R$)"><input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} className={CAMPO} placeholder="3.120,00" autoFocus /></Campo>
        <Campo rotulo="Prazo (dias)"><input inputMode="numeric" value={prazo} onChange={(e) => setPrazo(e.target.value)} className={CAMPO} placeholder="12" /></Campo>
      </div>
      <Erro texto={erro} />
      <div className="mt-4 flex justify-end gap-2">
        <BotaoAcao rotulo="Voltar" variante="secundario" onClick={onFechar} />
        <BotaoAcao
          rotulo="Enviar orçamento"
          onClick={() => {
            const v = Number(valor.replace(/\./g, "").replace(",", "."));
            const r = loja.informarOrcamento(pedido.id, linha.id, v, Number(prazo));
            if (!r.ok) setErro(r.motivo); else onFechar();
          }}
        />
      </div>
    </Modal>
  );
}

function ModalQuantidade({ pedido, linha, onFechar }: { pedido: Pedido; linha: LinhaPedido; onFechar: () => void }) {
  const loja = useLoja();
  const [qtd, setQtd] = useState(String(linha.quantidade));
  const [nota, setNota] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  return (
    <Modal titulo={`Ajustar quantidade: ${linha.skuNome}`} onFechar={onFechar}>
      <p className="mb-3 text-sm text-muted-foreground">Hoje são {linha.quantidade} unidades. A reserva acompanha o novo valor e a nota vai para o histórico.</p>
      <Campo rotulo="Nova quantidade"><input inputMode="numeric" value={qtd} onChange={(e) => setQtd(e.target.value)} className={CAMPO} autoFocus /></Campo>
      <div className="mt-3"><Campo rotulo="Nota para o diretor"><textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} className={CAMPO} /></Campo></div>
      <Erro texto={erro} />
      <div className="mt-4 flex justify-end gap-2">
        <BotaoAcao rotulo="Voltar" variante="secundario" onClick={onFechar} />
        <BotaoAcao rotulo="Salvar ajuste" onClick={() => { const r = loja.ajustarQuantidadeLinha(pedido.id, linha.id, Number(qtd), nota); if (!r.ok) setErro(r.motivo); else onFechar(); }} />
      </div>
    </Modal>
  );
}
