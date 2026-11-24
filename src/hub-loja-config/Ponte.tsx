// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/AbaPonte.tsx, ponte-loja.ts e usePonteLoja.ts @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock, HelpCircle, PowerOff } from "lucide-react";
import { BOTAO_SECUNDARIO, CARTAO, ROTULO_PEQUENO, cx } from "../hub-loja/ui";
import { useProto } from "./contexto";
import { ULTIMA_SINCRONIZACAO, ULTIMO_ENVIO_DISPONIBILIDADE, type EventoFila } from "./dados";
import {
  MSG_FALHA_PONTE,
  aplicarReenvio,
  type ResultadoReenvio,
  ROTULO_ESTADO_FILA,
  ROTULO_FILTRO_FILA,
  TIPOS_EVENTO,
  contadoresFila,
  filtrarFila,
  formatarDataHora,
  idCurto,
  mensagemReenvio,
  podeReenviarSnapshot,
  reconciliar,
  resolverDivergencia,
  resultadoReenvio,
  rotuloTipoEvento,
  textoConfirmacaoPonte,
  textoLado,
  textoMotivo,
  type ConfirmacaoPonte,
  type FiltroFila,
  type Mensagem,
} from "./ponte-regras";
import {
  T_PONTE_CARREGANDO,
  T_PONTE_CARTAO_DISPONIBILIDADE,
  T_PONTE_CARTAO_DIVERGENCIAS,
  T_PONTE_CARTAO_ESTADO,
  T_PONTE_CARTAO_FILA,
  T_PONTE_CONFIGURADO,
  T_PONTE_CONTADOR_AGUARDANDO,
  T_PONTE_CONTADOR_ENVIADOS,
  T_PONTE_CONTADOR_FALHARAM,
  T_PONTE_DESLIGADA,
  T_PONTE_DESLIGAR,
  T_PONTE_DESLIGOU,
  T_PONTE_DISPONIBILIDADE_AJUDA,
  T_PONTE_DISPONIBILIDADE_OK,
  T_PONTE_DIVERGENCIAS_AJUDA,
  T_PONTE_ERRO,
  T_PONTE_FILA_VAZIA,
  T_PONTE_LIGADA,
  T_PONTE_LIGAR,
  T_PONTE_LIGOU,
  T_PONTE_NAO_RECONCILIADO,
  T_PONTE_RECONCILIAR,
  T_PONTE_REENVIAR,
  T_PONTE_REENVIAR_DISPONIBILIDADE,
  T_PONTE_REENVIAR_SNAPSHOT,
  T_PONTE_SEM_BRINDES,
  T_PONTE_SEM_PEDIDO_NO_HUB,
  T_PONTE_SNAPSHOT_OK,
  T_PONTE_SO_ADMIN_DISPONIBILIDADE,
  T_PONTE_SO_ADMIN_INTERRUPTOR,
  T_PONTE_TUDO_EM_DIA_DESCRICAO,
  T_PONTE_TUDO_EM_DIA_TITULO,
  T_CANCELAR,
  T_CONFIRMAR,
  T_ACESSO_CONFIRMAR_ARIA,
} from "./textos";
import { CaixaReservada, EstadoAba, Esqueleto, Ocultavel, PropostaNova, SegmentadoGrande, SeloProposta } from "./ui-config";

/** Textos do protótipo (o Hub real não restringe o snapshot por linha; a decisão do design deixa só o Admin reenviar). */
const T_SO_ADMIN_SNAPSHOT = "Só o Admin reenvia o snapshot.";
const T_FILA_PARADA = "A ponte está desligada: a fila fica parada até religar.";
const T_FILA_FILTRO_VAZIO = "Nenhum evento neste filtro.";
const T_PROXIMA_PARADA = "parada";
const T_O_QUE_E = "O que é a ponte?";
const T_EXPLICA_PONTE =
  "A ponte é o caminho entre o Hub e a Loja. Quando algo muda aqui, como um pedido, um brinde ou uma pessoa autorizada, o Hub deixa um aviso na fila e a ponte entrega esse aviso à Loja. Se a Loja não responder, o aviso espera e é tentado de novo. No dia a dia você não precisa mexer nisso.";
const T_ULTIMA_SINC = "Última sincronização por tipo de evento";

const TOM: Record<Mensagem["tom"], string> = {
  sucesso: "border-emerald-600/40 bg-emerald-50 text-foreground",
  erro: "border-[#b42318]/40 bg-[#fde8e6] text-foreground",
  info: "border-border bg-muted text-foreground",
};

const textoTentativas = (n: number): string => (n === 1 ? "1 tentativa" : `${n} tentativas`);
const textoBrindesAtivos = (n: number): string => (n === 1 ? "1 brinde ativo" : `${n} brindes ativos`);

function Secao({ titulo, children, ancora, acao }: { titulo: string; children: ReactNode; ancora: string; acao?: ReactNode }) {
  return (
    <section aria-label={titulo} data-secao={ancora} className={cx(CARTAO, "p-4 sm:p-5")}>
      <div className="mb-3 flex min-h-[52px] flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-primary">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

function Contador({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div data-contador={rotulo} className="rounded-2xl border border-border bg-background p-3">
      <p className={ROTULO_PEQUENO}>{rotulo}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums text-primary">{valor}</p>
    </div>
  );
}

function EtiquetaEstado({ estado }: { estado: EventoFila["estado"] }) {
  const falhou = estado === "falhou";
  const Icone = falhou ? AlertTriangle : estado === "enviado" ? CheckCircle2 : Clock;
  return (
    <span
      className={cx(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold",
        falhou ? "bg-[#fde8e6] text-[#b42318]" : estado === "enviado" ? "bg-emerald-50 text-emerald-800" : "bg-[#fff1d6] text-[#7a4300]",
      )}
    >
      <Icone className="h-3.5 w-3.5" aria-hidden />
      {ROTULO_ESTADO_FILA[estado]}
    </span>
  );
}

export function Ponte() {
  const {
    papel,
    estado,
    fila,
    enviados,
    ponteLigada,
    divergencias,
    divergenciasReais,
    dados,
    setEstado,
    setFila,
    setEnviados,
    setPonteLigada,
    setDivergencias,
    setDivergenciasReais,
  } = useProto();
  const ehAdmin = papel === "admin";

  const [confirmacao, setConfirmacao] = useState<ConfirmacaoPonte | null>(null);
  const [aviso, setAviso] = useState<Mensagem | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [filtro, setFiltro] = useState<FiltroFila>("todos");
  const [explicando, setExplicando] = useState(false);
  const [ultimoEnvioDisp, setUltimoEnvioDisp] = useState<string>(ULTIMO_ENVIO_DISPONIBILIDADE);

  const origemRef = useRef<HTMLElement | null>(null);
  const confirmarRef = useRef<HTMLButtonElement | null>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contadorDispRef = useRef(1);

  useEffect(() => () => {
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
  }, []);

  useEffect(() => {
    if (confirmacao) confirmarRef.current?.focus();
  }, [confirmacao]);

  const pedir = useCallback((c: ConfirmacaoPonte) => {
    origemRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setConfirmacao(c);
  }, []);

  const fechar = useCallback(() => {
    setConfirmacao(null);
    const alvo = origemRef.current;
    origemRef.current = null;
    if (alvo && alvo.isConnected) requestAnimationFrame(() => alvo.focus());
  }, []);

  const executar = (acao: () => Mensagem) => {
    setOcupado(true);
    temporizadorRef.current = setTimeout(() => {
      setAviso(acao());
      setOcupado(false);
    }, 450);
  };

  const confirmar = () => {
    const c = confirmacao;
    if (!c) return;
    fechar();
    switch (c.tipo) {
      case "interruptor":
        executar(() => {
          setPonteLigada(c.ativa);
          return { tom: "sucesso", texto: c.ativa ? T_PONTE_LIGOU : T_PONTE_DESLIGOU };
        });
        break;
      case "reenviar":
        executar(() => {
          const r = resultadoReenvio(c.eventId, ponteLigada);
          setFila((atual) => {
            if (!atual.some((e) => e.id === c.eventId)) return atual;
            return aplicarNaFila(atual, c.eventId, r);
          });
          if (r === "enviado") setEnviados((n) => n + 1);
          return mensagemReenvio(r);
        });
        break;
      case "snapshot":
        executar(() => {
          if (!ponteLigada) return mensagemReenvio("ponte_desativada");
          const r = resolverDivergencia(divergenciasReais, c.pedidoId);
          if (!r.resolveu) return MSG_FALHA_PONTE;
          setDivergenciasReais(r.reais);
          setDivergencias(divergencias ? divergencias.filter((d) => d.pedidoId !== c.pedidoId) : divergencias);
          return { tom: "sucesso", texto: T_PONTE_SNAPSHOT_OK };
        });
        break;
      case "disponibilidade":
        executar(() => {
          if (!ponteLigada) return mensagemReenvio("ponte_desativada");
          if (dados.brindes.filter((b) => b.ativo).length === 0) return { tom: "info", texto: T_PONTE_SEM_BRINDES };
          setFila((atual) =>
            atual.some((e) => e.tipo === "disponibilidade.sincronizada" && e.estado === "pendente")
              ? atual
              : [
                  ...atual,
                  {
                    id: `evt-disp-${contadorDispRef.current++}`,
                    tipo: "disponibilidade.sincronizada",
                    estado: "pendente",
                    tentativas: 0,
                    proximaTentativa: null,
                    pedidoId: null,
                    erro: null,
                  },
                ],
          );
          setUltimoEnvioDisp("2026-11-24T14:40:00");
          return { tom: "sucesso", texto: T_PONTE_DISPONIBILIDADE_OK };
        });
        break;
      case "reconciliar":
        executar(() => {
          const r = reconciliar(divergenciasReais);
          setDivergencias(r.divergencias);
          return r.mensagem;
        });
        break;
    }
  };

  const filaVisivel = estado === "vazio" ? [] : fila;
  const filaFiltrada = filtrarFila(filaVisivel, filtro);
  const cont = contadoresFila(filaVisivel, enviados);
  const ativos = dados.brindes.filter((b) => b.ativo).length;
  const estadoVisual = estado === "carregando" ? "carregando" : estado === "erro" ? "erro" : "normal";
  const dicaInterruptor = !ehAdmin ? T_PONTE_SO_ADMIN_INTERRUPTOR : "";

  const esqueleto = (
    <div role="status" aria-label={T_PONTE_CARREGANDO} className="mx-auto max-w-4xl space-y-4">
      <p className="sr-only">{T_PONTE_CARREGANDO}</p>
      <Esqueleto linhas={1} altura={200} />
      <Esqueleto linhas={1} altura={56} />
      <Esqueleto linhas={2} altura={120} />
    </div>
  );

  return (
    <div data-aba="ponte" className="hl-entra mx-auto flex max-w-4xl flex-col gap-4">
      <h1 className="sr-only">Ponte</h1>
      <EstadoAba estado={estadoVisual} esqueleto={esqueleto} erro={T_PONTE_ERRO} aoTentarDeNovo={() => setEstado("normal")}>
        {/* 1. Estado da ponte */}
        <Secao
          titulo={T_PONTE_CARTAO_ESTADO}
          ancora="estado"
          acao={
            <Ocultavel>
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={explicando}
                  aria-controls="ponte-explica"
                  data-ancora="o-que-e-ponte"
                  onClick={() => setExplicando((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setExplicando(false);
                  }}
                  className={cx(BOTAO_SECUNDARIO, "min-w-11 sm:min-w-[11.5rem]")}
                  aria-label={T_O_QUE_E}
                >
                  <HelpCircle className="h-4 w-4" aria-hidden />
                  <span className="max-sm:sr-only">{T_O_QUE_E}</span>
                </button>
                {explicando ? (
                  <div
                    id="ponte-explica"
                    role="note"
                    className={cx(CARTAO, "hlc-caixa-entra absolute right-0 top-full z-20 mt-2 w-[min(22rem,calc(100vw-3rem))] p-4 text-sm text-foreground")}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <SeloProposta />
                    </div>
                    {T_EXPLICA_PONTE}
                  </div>
                ) : null}
              </div>
            </Ocultavel>
          }
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 text-sm">
              <p className="inline-flex items-center gap-2 font-semibold text-foreground" role="status">
                {ponteLigada ? <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden /> : <PowerOff className="h-5 w-5 text-[#b42318]" aria-hidden />}
                {ponteLigada ? T_PONTE_LIGADA : T_PONTE_DESLIGADA}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Endereço da Loja: {T_PONTE_CONFIGURADO} · Segredo: {T_PONTE_CONFIGURADO}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-ancora="interruptor-ponte"
                disabled={!ehAdmin || ocupado}
                title={dicaInterruptor || undefined}
                onClick={() => pedir({ tipo: "interruptor", ativa: !ponteLigada })}
                className={cx(BOTAO_SECUNDARIO, "min-w-[10.5rem] disabled:cursor-not-allowed disabled:opacity-60")}
              >
                {ponteLigada ? T_PONTE_DESLIGAR : T_PONTE_LIGAR}
              </button>
              <button
                type="button"
                data-ancora="reenviar-disponibilidade"
                disabled={!ehAdmin || ocupado}
                title={!ehAdmin ? T_PONTE_SO_ADMIN_DISPONIBILIDADE : undefined}
                onClick={() => pedir({ tipo: "disponibilidade" })}
                className={cx(BOTAO_SECUNDARIO, "min-w-[13.5rem] disabled:cursor-not-allowed disabled:opacity-60")}
              >
                {T_PONTE_REENVIAR_DISPONIBILIDADE}
              </button>
            </div>
          </div>
          <p data-ancora="dica-admin" className="mt-2 min-h-10 text-xs font-semibold text-[#7a4300]">
            {!ehAdmin ? `${T_PONTE_SO_ADMIN_INTERRUPTOR} ${T_PONTE_SO_ADMIN_DISPONIBILIDADE} ${T_SO_ADMIN_SNAPSHOT}` : ""}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Contador rotulo={T_PONTE_CONTADOR_AGUARDANDO} valor={cont.pendente} />
            <Contador rotulo={T_PONTE_CONTADOR_ENVIADOS} valor={cont.enviado} />
            <Contador rotulo={T_PONTE_CONTADOR_FALHARAM} valor={cont.falhou} />
          </div>
        </Secao>

        {/* 2 e 3. Aviso e confirmação, em caixas de altura fixa */}
        <div aria-live="polite">
          <CaixaReservada altura="h-14 max-sm:h-20" ancora="aviso-ponte" role="status">
            {aviso ? <p className={cx("h-full overflow-y-auto rounded-2xl border p-3 text-sm", TOM[aviso.tom])}>{aviso.texto}</p> : null}
          </CaixaReservada>
        </div>
        <CaixaReservada altura="h-[88px] max-sm:h-[148px]" ancora="confirmacao-ponte">
          {confirmacao ? (
            <div
              role="alertdialog"
              aria-label={T_ACESSO_CONFIRMAR_ARIA}
              onKeyDown={(e) => {
                if (e.key === "Escape") fechar();
              }}
              className={cx(CARTAO, "flex h-full flex-wrap items-center justify-between gap-3 p-3")}
            >
              <p className="min-w-0 flex-1 basis-60 text-sm text-foreground">{textoConfirmacaoPonte(confirmacao)}</p>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={fechar} className={BOTAO_SECUNDARIO}>
                  {T_CANCELAR}
                </button>
                <button
                  ref={confirmarRef}
                  type="button"
                  onClick={confirmar}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] hover:brightness-110"
                >
                  {T_CONFIRMAR}
                </button>
              </div>
            </div>
          ) : null}
        </CaixaReservada>

        {/* 4. Fila de eventos */}
        <Secao
          titulo={T_PONTE_CARTAO_FILA}
          ancora="fila"
          acao={
            <PropostaNova id="filtro-fila" className="flex max-w-full flex-wrap items-center gap-2">
              <SeloProposta />
              <SegmentadoGrande<FiltroFila>
                rotulo="Filtrar a fila"
                ancora="filtro-fila"
                valor={filtro}
                aoMudar={setFiltro}
                opcoes={(Object.keys(ROTULO_FILTRO_FILA) as FiltroFila[]).map((id) => ({ id, rotulo: ROTULO_FILTRO_FILA[id] }))}
              />
            </PropostaNova>
          }
        >
          <p className="min-h-10 text-xs font-semibold text-[#7a4300] sm:min-h-5">
            <Ocultavel>{!ponteLigada ? T_FILA_PARADA : ""}</Ocultavel>
          </p>
          <div className="min-h-[88px]">
            {filaFiltrada.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">{filaVisivel.length === 0 ? T_PONTE_FILA_VAZIA : T_FILA_FILTRO_VAZIO}</p>
            ) : (
              <ul className="divide-y divide-border">
                {filaFiltrada.map((e) => (
                  <li key={e.id} data-evento={e.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                        <span className="min-w-0">{rotuloTipoEvento(e.tipo)}</span>
                        <EtiquetaEstado estado={e.estado} />
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {textoTentativas(e.tentativas)}
                        {e.estado === "pendente" ? ` · próxima ${ponteLigada ? (e.proximaTentativa ? `em ${formatarDataHora(e.proximaTentativa)}` : "em breve") : T_PROXIMA_PARADA}` : ""}
                        {e.pedidoId ? ` · pedido ${idCurto(e.pedidoId)}` : ""}
                      </p>
                      {e.erro ? <p className="text-xs text-muted-foreground">Último erro: {textoMotivo(e.erro)}</p> : null}
                    </div>
                    <div data-ancora="acao-linha" className="flex w-28 shrink-0 justify-end">
                      <button
                        type="button"
                        disabled={ocupado}
                        aria-label={`${T_PONTE_REENVIAR}: ${rotuloTipoEvento(e.tipo)}`}
                        onClick={() => pedir({ tipo: "reenviar", eventId: e.id, rotulo: rotuloTipoEvento(e.tipo) })}
                        className={cx(BOTAO_SECUNDARIO, "w-full disabled:cursor-not-allowed disabled:opacity-60")}
                      >
                        {T_PONTE_REENVIAR}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Secao>

        {/* 5. Disponibilidade dos brindes (a ação mora em "Estado da ponte") */}
        <Secao titulo={T_PONTE_CARTAO_DISPONIBILIDADE} ancora="disponibilidade">
          <p className="text-sm font-semibold text-foreground">{textoBrindesAtivos(ativos)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Último envio: {formatarDataHora(ultimoEnvioDisp)}</p>
          <p className="mt-2 text-xs text-muted-foreground">{T_PONTE_DISPONIBILIDADE_AJUDA}</p>
        </Secao>

        {/* 6. Divergências com a Loja */}
        <Secao
          titulo={T_PONTE_CARTAO_DIVERGENCIAS}
          ancora="divergencias"
          acao={
            <button
              type="button"
              data-ancora="reconciliar"
              disabled={ocupado}
              onClick={() => pedir({ tipo: "reconciliar" })}
              className={cx(BOTAO_SECUNDARIO, "min-w-[9.5rem] disabled:cursor-not-allowed disabled:opacity-60")}
            >
              {T_PONTE_RECONCILIAR}
            </button>
          }
        >
          <p className="text-xs text-muted-foreground">{T_PONTE_DIVERGENCIAS_AJUDA}</p>
          <p className="min-h-5 text-xs font-semibold text-[#7a4300]">{!ehAdmin ? T_SO_ADMIN_SNAPSHOT : ""}</p>
          {divergencias === null ? (
            <p className="mt-2 text-sm text-muted-foreground">{T_PONTE_NAO_RECONCILIADO}</p>
          ) : divergencias.length === 0 ? (
            <div className="mt-2 rounded-2xl border border-border bg-background p-4 text-center">
              <p className="font-display text-base font-bold text-primary">{T_PONTE_TUDO_EM_DIA_TITULO}</p>
              <p className="mt-1 text-sm text-muted-foreground">{T_PONTE_TUDO_EM_DIA_DESCRICAO}</p>
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {divergencias.map((d) => {
                const temHub = podeReenviarSnapshot(d);
                const dica = !temHub ? T_PONTE_SEM_PEDIDO_NO_HUB : !ehAdmin ? T_SO_ADMIN_SNAPSHOT : undefined;
                return (
                  <li key={d.pedidoId} data-pedido={idCurto(d.pedidoId)} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="font-semibold text-foreground">Pedido {idCurto(d.pedidoId)}</p>
                      <p className="text-xs text-muted-foreground">Hub: {textoLado(d.hub)}</p>
                      <p className="text-xs text-muted-foreground">Loja: {textoLado(d.loja)}</p>
                    </div>
                    <div data-ancora="acao-divergencia" className="flex w-44 shrink-0 flex-col items-end gap-1">
                      <button
                        type="button"
                        disabled={!temHub || !ehAdmin || ocupado}
                        title={dica}
                        onClick={() => pedir({ tipo: "snapshot", pedidoId: d.pedidoId })}
                        className={cx(BOTAO_SECUNDARIO, "w-full disabled:cursor-not-allowed disabled:opacity-60")}
                      >
                        {T_PONTE_REENVIAR_SNAPSHOT}
                      </button>
                      <p className="min-h-4 text-right text-xs font-semibold text-[#7a4300]">{!temHub ? T_PONTE_SEM_PEDIDO_NO_HUB : ""}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>

        {/* 7. Proposta nova, depois de Divergências para não alterar a ordem real */}
        <PropostaNova id="ultima-sincronizacao" titulo={T_ULTIMA_SINC} className={cx(CARTAO, "p-4 sm:p-5")}>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {TIPOS_EVENTO.map((t) => (
              <li key={t} data-sinc={t} className="rounded-2xl border border-border bg-background p-3">
                <p className={ROTULO_PEQUENO}>{rotuloTipoEvento(t)}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{formatarDataHora(ULTIMA_SINCRONIZACAO[t])}</p>
              </li>
            ))}
          </ul>
        </PropostaNova>
      </EstadoAba>
    </div>
  );
}

/** Aplica o resultado do reenvio numa fila já existente (usa a regra pura do ponte-regras). */
function aplicarNaFila(fila: EventoFila[], id: string, r: ResultadoReenvio): EventoFila[] {
  return aplicarReenvio(fila, id, r).fila;
}
