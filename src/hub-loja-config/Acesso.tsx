// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/AbaAcesso.tsx e acesso-loja.ts @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, Ban, CheckCircle2, Clock, Info, MinusCircle, Search, type LucideIcon } from "lucide-react";
import { BOTAO_DESTRUTIVO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO, cx } from "../hub-loja/ui";
import { useProto } from "./contexto";
import type { Sinc, Solicitante } from "./dados";
import {
  DOMINIO_ACESSO,
  ROTULO_FILTRO,
  ROTULO_SINCRONIZACAO,
  ROTULO_SITUACAO,
  filtrarSolicitantes,
  incluirSolicitante,
  iniciais,
  mudarSituacao,
  podeEditarAcesso,
  reenviarSolicitante,
  textoPedidos,
  validarInclusao,
  type FiltroSituacao,
} from "./acesso-regras";
import {
  T_ACESSO_CAMPO_AREA,
  T_ACESSO_CAMPO_NOME,
  T_ACESSO_CARTAO_INCLUIR,
  T_ACESSO_CONFIRMAR_ARIA,
  T_ACESSO_ERRO,
  T_ACESSO_INCLUIDO,
  T_ACESSO_PLACEHOLDER_NOME,
  T_ACESSO_REATIVADO,
  T_ACESSO_REVOGADO,
  T_ACESSO_SEM_AREA,
  T_ACESSO_SO_ADMIN_FORM,
  T_ACESSO_VAZIO_DESCRICAO,
  T_ACESSO_VAZIO_TITULO,
  T_ACESSO_INCLUIR,
  T_CANCELAR,
  T_CONFIRMAR,
  T_REATIVAR,
  T_REVOGAR,
  textoCartaoSolicitantes,
  textoConfirmarReativar,
  textoConfirmarRevogar,
} from "./textos";
import {
  CaixaReservada,
  CampoTexto,
  EstadoAba,
  Esqueleto,
  PropostaNova,
  SegmentadoGrande,
  SeloProposta,
  usePropostas,
  type EstadoVisual,
} from "./ui-config";

type Tom = "sucesso" | "erro" | "info";
type Mensagem = { tom: Tom; texto: string };
type Confirmacao = { tipo: "revogar" | "reativar"; email: string; nome: string };

/** Proposta nova: o Hub real não tem "Reenviar à Loja"; a mensagem é do protótipo. */
const T_REENVIAR_LOJA = "Reenviar à Loja";
const T_REENVIO_PEDIDO = "Reenvio pedido. O envio à Loja segue pela ponte.";
const T_BUSCAR = "Buscar Solicitante";
const T_BUSCA_SEM_RESULTADO = "Nenhum Solicitante encontrado";
const T_BUSCA_SEM_RESULTADO_DESCRICAO = "Mude a busca ou o filtro para ver outras pessoas da lista.";

const TOM: Record<Tom, { caixa: string; Icone: LucideIcon; cor: string }> = {
  sucesso: { caixa: "border-[#14633a]/40 bg-[#e6f4ec]", Icone: CheckCircle2, cor: "text-[#14633a]" },
  erro: { caixa: "border-[#b42318]/40 bg-[#fde8e6]", Icone: AlertTriangle, cor: "text-[#b42318]" },
  info: { caixa: "border-border bg-muted", Icone: Info, cor: "text-primary" },
};

const SINC_VISUAL: Record<Sinc, { Icone: LucideIcon; cor: string }> = {
  sincronizado: { Icone: CheckCircle2, cor: "text-[#14633a]" },
  pendente: { Icone: Clock, cor: "text-primary" },
  falhou: { Icone: AlertTriangle, cor: "text-[#b42318]" },
  sem_registro: { Icone: MinusCircle, cor: "text-muted-foreground" },
};

const FILTROS: FiltroSituacao[] = ["todos", "ativos", "revogados"];

function SeloSituacao({ ativo }: { ativo: boolean }) {
  const Icone = ativo ? CheckCircle2 : Ban;
  return (
    <span
      data-situacao={ativo ? "ativo" : "revogado"}
      className={cx(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold",
        ativo ? "bg-[#e6f4ec] text-[#14633a]" : "bg-[#fde8e6] text-[#b42318]",
      )}
    >
      <Icone className="h-3.5 w-3.5" aria-hidden />
      {ROTULO_SITUACAO[ativo ? "ativo" : "revogado"]}
    </span>
  );
}

function LinhaSolicitante({
  s,
  indice,
  admin,
  propostas,
  aoAcao,
  aoReenviar,
}: {
  s: Solicitante;
  indice: number;
  admin: boolean;
  propostas: boolean;
  aoAcao: (s: Solicitante, origem: HTMLElement) => void;
  aoReenviar: (s: Solicitante) => void;
}) {
  const nomeExibido = s.nome || s.email;
  const detalhe = `${s.email} · ${s.area || T_ACESSO_SEM_AREA}`;
  const { Icone: IconeSinc, cor } = SINC_VISUAL[s.sinc];
  const comReenvio = admin && propostas && s.sinc === "falhou";
  return (
    <li data-autorizado={s.email} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted font-display text-sm font-bold text-primary"
        >
          {iniciais(nomeExibido)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground" title={nomeExibido}>
            {nomeExibido}
          </p>
          <p className="truncate text-xs text-muted-foreground" title={detalhe}>
            {detalhe}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-foreground">
            <SeloSituacao ativo={s.ativo} />
            <span className="tabular-nums">{textoPedidos(s.pedidos)}</span>
            <span data-sinc={s.sinc} className="inline-flex items-center gap-1">
              <IconeSinc className={cx("h-4 w-4 shrink-0", cor)} aria-hidden />
              {ROTULO_SINCRONIZACAO[s.sinc]}
            </span>
            {comReenvio ? <SeloProposta /> : null}
          </div>
        </div>
      </div>
      {admin ? (
        <div
          data-ancora="acao-linha"
          data-ancora-id={indice}
          className={cx("flex w-28 shrink-0 flex-col items-end gap-2 self-end sm:self-start", comReenvio ? "h-[96px]" : "h-11")}
        >
          <button
            type="button"
            data-acao={s.ativo ? "revogar" : "reativar"}
            aria-label={`${s.ativo ? T_REVOGAR : T_REATIVAR} acesso de ${nomeExibido}`}
            onClick={(e) => aoAcao(s, e.currentTarget)}
            className={cx(s.ativo ? BOTAO_DESTRUTIVO : BOTAO_SECUNDARIO, "w-full")}
          >
            {s.ativo ? T_REVOGAR : T_REATIVAR}
          </button>
          {comReenvio ? (
            <PropostaNova id={`reenviar-loja-${indice}`} className="w-full">
              <button
                type="button"
                onClick={() => aoReenviar(s)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-card px-2 text-center text-[13px] font-semibold leading-tight text-primary transition hover:bg-muted active:scale-[0.98]"
              >
                {T_REENVIAR_LOJA}
              </button>
            </PropostaNova>
          ) : null}
        </div>
      ) : (
        <div aria-hidden data-ancora="acao-linha" data-ancora-id={indice} className="hidden h-11 w-28 shrink-0 sm:block" />
      )}
    </li>
  );
}

export function Acesso() {
  const { papel, estado, solicitantes, setSolicitantes, setEstado } = useProto();
  const propostas = usePropostas();
  const admin = podeEditarAcesso(papel);

  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [aviso, setAviso] = useState<Mensagem | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroSituacao>("todos");

  const origemRef = useRef<HTMLElement | null>(null);
  const confirmarRef = useRef<HTMLButtonElement | null>(null);
  const idTexto = useId();

  // Foco em "Confirmar" ao abrir a confirmação.
  useEffect(() => {
    if (confirmacao) confirmarRef.current?.focus();
  }, [confirmacao]);

  // Sem permissão, a confirmação some junto com os botões.
  useEffect(() => {
    if (!admin) setConfirmacao(null);
  }, [admin]);

  const devolverFoco = useCallback(() => {
    window.setTimeout(() => {
      const origem = origemRef.current;
      if (origem && origem.isConnected) {
        origem.closest("button")?.focus();
        return;
      }
      document.querySelector<HTMLElement>('[data-ancora="busca-acesso"] input, [data-ancora="incluir-acesso"]')?.focus();
    }, 0);
  }, []);

  const cancelar = useCallback(() => {
    setConfirmacao(null);
    devolverFoco();
  }, [devolverFoco]);

  const incluir = (ev?: FormEvent) => {
    ev?.preventDefault();
    const r = validarInclusao({ email, nome, area }, solicitantes);
    if (!r.ok) {
      setAviso({ tom: "erro", texto: r.mensagem });
      return;
    }
    setSolicitantes((atual) => incluirSolicitante(atual, r.dados));
    setAviso({ tom: "sucesso", texto: T_ACESSO_INCLUIDO });
    setEmail("");
    setNome("");
    setArea("");
  };

  const confirmar = () => {
    const c = confirmacao;
    if (!c) return;
    const reativar = c.tipo === "reativar";
    setSolicitantes((atual) => mudarSituacao(atual, c.email, reativar));
    setAviso({ tom: "sucesso", texto: reativar ? T_ACESSO_REATIVADO : T_ACESSO_REVOGADO });
    setConfirmacao(null);
    devolverFoco();
  };

  const pedirConfirmacao = (s: Solicitante, origem: HTMLElement) => {
    origemRef.current = origem;
    setConfirmacao({ tipo: s.ativo ? "revogar" : "reativar", email: s.email, nome: s.nome || s.email });
  };

  const reenviar = (s: Solicitante) => {
    setSolicitantes((atual) => reenviarSolicitante(atual, s.email));
    setAviso({ tom: "info", texto: T_REENVIO_PEDIDO });
  };

  // "Vazio" forçado esvazia só a lista; a lista real vazia mostra o mesmo texto do Hub.
  const base: Solicitante[] = estado === "vazio" ? [] : solicitantes;
  const visiveis = useMemo(() => (propostas ? filtrarSolicitantes(base, busca, filtro) : base), [base, busca, filtro, propostas]);
  const estadoVisual: EstadoVisual = estado === "carregando" || estado === "erro" ? estado : "normal";

  const textoConfirmacao = confirmacao
    ? confirmacao.tipo === "revogar"
      ? textoConfirmarRevogar(confirmacao.nome)
      : textoConfirmarReativar(confirmacao.nome)
    : "";
  const tomAviso = aviso ? TOM[aviso.tom] : null;

  return (
    <EstadoAba
      estado={estadoVisual}
      erro={T_ACESSO_ERRO}
      aoTentarDeNovo={() => setEstado("normal")}
      esqueleto={<Esqueleto linhas={4} altura={120} />}
    >
      <div data-aba="acesso" aria-label="Acesso de Solicitantes" className="hl-entra mx-auto flex max-w-4xl flex-col gap-4">
        {/* 1. Incluir Solicitante */}
        <section aria-label={T_ACESSO_CARTAO_INCLUIR} className={cx(CARTAO, "p-4")}>
          <h2 className="mb-3 font-display text-base font-bold text-primary">{T_ACESSO_CARTAO_INCLUIR}</h2>
          {admin ? (
            <form data-slot="incluir" onSubmit={incluir} noValidate className="grid gap-x-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
              <CampoTexto rotulo={`E-mail (${DOMINIO_ACESSO})`} tipo="email" valor={email} aoMudar={setEmail} placeholder={`nome${DOMINIO_ACESSO}`} />
              <CampoTexto rotulo={T_ACESSO_CAMPO_NOME} valor={nome} aoMudar={setNome} placeholder={T_ACESSO_PLACEHOLDER_NOME} />
              <CampoTexto rotulo={T_ACESSO_CAMPO_AREA} valor={area} aoMudar={setArea} placeholder="Ex.: Comercial" />
              <div className="sm:col-span-2 lg:col-span-1 lg:mt-7">
                <button type="submit" data-ancora="incluir-acesso" className={cx(BOTAO_PRIMARIO, "w-full lg:w-28")}>
                  {T_ACESSO_INCLUIR}
                </button>
              </div>
            </form>
          ) : (
            <p data-slot="incluir" className="flex min-h-11 items-center gap-2 text-sm text-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              {T_ACESSO_SO_ADMIN_FORM}
            </p>
          )}
        </section>

        {/* 2. Aviso (altura fixa) */}
        <CaixaReservada altura="h-14" ancora="aviso-acesso" role={aviso?.tom === "erro" ? "alert" : "status"}>
          {aviso && tomAviso ? (
            <p className={cx("flex h-full items-center gap-2 rounded-2xl border px-3 text-sm text-foreground", tomAviso.caixa)}>
              <tomAviso.Icone className={cx("h-5 w-5 shrink-0", tomAviso.cor)} aria-hidden />
              <span className="min-w-0">{aviso.texto}</span>
            </p>
          ) : null}
        </CaixaReservada>

        {/* 3. Confirmação (altura fixa) */}
        <CaixaReservada altura="h-[88px] max-sm:h-[132px]" ancora="confirmacao-acesso">
          {confirmacao ? (
            <div
              role="alertdialog"
              aria-label={T_ACESSO_CONFIRMAR_ARIA}
              aria-describedby={idTexto}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  cancelar();
                }
              }}
              className={cx(CARTAO, "flex h-full flex-col justify-between gap-2 p-2.5 sm:flex-row sm:items-center sm:gap-4 sm:p-3")}
            >
              <p id={idTexto} className="min-w-0 text-[13px] leading-[18px] text-foreground sm:text-sm sm:leading-5">
                {textoConfirmacao}
              </p>
              <div className="flex shrink-0 justify-end gap-2">
                <button type="button" onClick={cancelar} className={BOTAO_SECUNDARIO}>
                  {T_CANCELAR}
                </button>
                <button ref={confirmarRef} type="button" onClick={confirmar} className={BOTAO_PRIMARIO}>
                  {T_CONFIRMAR}
                </button>
              </div>
            </div>
          ) : null}
        </CaixaReservada>

        {/* 4. Solicitantes (N) */}
        <section aria-label="Solicitantes autorizados" className={cx(CARTAO, "p-4")}>
          <h2 className="mb-3 font-display text-base font-bold text-primary">{textoCartaoSolicitantes(visiveis.length)}</h2>

          <PropostaNova id="busca-acesso" titulo={T_BUSCAR} className="mb-3 space-y-2">
            <div data-ancora="busca-acesso" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  aria-label={T_BUSCAR}
                  placeholder="Nome, e-mail ou área"
                  className="block min-h-11 w-full rounded-xl border border-[#7b87b8] bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <SegmentadoGrande
                rotulo="Filtrar por situação"
                valor={filtro}
                aoMudar={setFiltro}
                opcoes={FILTROS.map((f) => ({ id: f, rotulo: ROTULO_FILTRO[f] }))}
                className="self-start"
              />
            </div>
          </PropostaNova>

          {base.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <h3 className="font-display text-lg font-bold text-primary">{T_ACESSO_VAZIO_TITULO}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{T_ACESSO_VAZIO_DESCRICAO}</p>
            </div>
          ) : visiveis.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <h3 className="font-display text-lg font-bold text-primary">{T_BUSCA_SEM_RESULTADO}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{T_BUSCA_SEM_RESULTADO_DESCRICAO}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {visiveis.map((s, i) => (
                <LinhaSolicitante key={s.email} s={s} indice={i} admin={admin} propostas={propostas} aoAcao={pedirConfirmacao} aoReenviar={reenviar} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </EstadoAba>
  );
}
