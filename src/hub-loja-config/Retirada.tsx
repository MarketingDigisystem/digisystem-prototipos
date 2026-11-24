// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/AbaRetirada.tsx @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import { useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { CARTAO, cx } from "../hub-loja/ui";
import { useProto } from "./contexto";
import {
  CONFIG_PADRAO,
  DESTINO_CAMPO,
  ETIQUETA_DESTINO,
  T_COMO_O_SOLICITANTE_VE,
  T_RESTAURAR_PADRAO,
  comoNumero,
  textoRetirada,
  validarConfig,
  type ErrosConfig,
} from "./config";
import { EQUIPE, type ConfigLoja } from "./dados";
import {
  T_RETIRADA_CARREGANDO,
  T_RETIRADA_CARTAO_GESTOR,
  T_RETIRADA_CARTAO_ONDE,
  T_RETIRADA_CARTAO_PRAZOS,
  T_RETIRADA_CONFIRA,
  T_RETIRADA_ERRO,
  T_RETIRADA_GESTOR_AJUDA,
  T_RETIRADA_GUARDADAS,
  T_RETIRADA_GUARDADAS_AJUDA,
  T_RETIRADA_HORARIO,
  T_RETIRADA_LIMITE,
  T_RETIRADA_LIMITE_AJUDA,
  T_RETIRADA_LOCAL,
  T_RETIRADA_PRAZO,
  T_RETIRADA_PRAZO_AJUDA,
  T_RETIRADA_SALVA,
  T_RETIRADA_SALVANDO,
  T_RETIRADA_SALVAR,
  T_RETIRADA_SEM_GESTOR,
} from "./textos";
import { BotaoConfirmavel, CaixaReservada, CampoTexto, EstadoAba, Esqueleto, Ocultavel, PropostaNova, SeloProposta } from "./ui-config";

interface CamposForm {
  local: string;
  horario: string;
  prazoRetirada: string;
  prazoGuardadas: string;
  limiteParado: string;
  gestorId: string;
}

const paraFormulario = (c: ConfigLoja): CamposForm => ({
  local: c.local,
  horario: c.horario,
  prazoRetirada: String(c.prazoRetiradaDiasUteis),
  prazoGuardadas: String(c.prazoGuardadasDiasUteis),
  limiteParado: String(c.limiteParadoDiasUteis),
  gestorId: c.gestorId ?? "",
});

const paraConfig = (f: CamposForm): ConfigLoja => ({
  local: f.local,
  horario: f.horario,
  prazoRetiradaDiasUteis: comoNumero(f.prazoRetirada),
  prazoGuardadasDiasUteis: comoNumero(f.prazoGuardadas),
  limiteParadoDiasUteis: comoNumero(f.limiteParado),
  gestorId: f.gestorId === "" ? null : f.gestorId,
});

type Aviso = { tom: "sucesso" | "erro"; texto: string };

const CAMPO_SELECT =
  "block min-h-11 w-full rounded-xl border bg-card px-3 text-sm text-foreground";

/** Seleção do Gestor, no mesmo molde do CampoTexto: rótulo, ajuda e linha de erro reservada. */
function CampoGestor({
  valor,
  aoMudar,
  erro,
}: {
  valor: string;
  aoMudar: (v: string) => void;
  erro?: string;
}) {
  const id = useId();
  const foraDaLista = valor !== "" && !EQUIPE.some((p) => p.id === valor);
  return (
    <div className="space-y-1">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          Gestor
        </label>
        <span className="text-xs font-semibold text-muted-foreground">
          <Ocultavel>{ETIQUETA_DESTINO[DESTINO_CAMPO.gestorId]}</Ocultavel>
        </span>
      </div>
      <select
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={erro ? true : undefined}
        aria-describedby={`${id}-ajuda ${id}-erro`}
        className={cx(CAMPO_SELECT, erro ? "border-[#b42318]" : "border-[#7b87b8]")}
      >
        <option value="">{T_RETIRADA_SEM_GESTOR}</option>
        {foraDaLista ? <option value={valor}>Pessoa atual (fora da lista)</option> : null}
        {EQUIPE.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
      <p id={`${id}-ajuda`} className="min-h-5 text-xs text-muted-foreground">
        {T_RETIRADA_GESTOR_AJUDA}
      </p>
      <p id={`${id}-erro`} role={erro ? "alert" : undefined} className="min-h-5 text-xs font-semibold text-[#b42318]">
        {erro ?? ""}
      </p>
    </div>
  );
}

export function Retirada() {
  const { estado, config, setConfig, setEstado } = useProto();
  const [f, setF] = useState<CamposForm>(() => paraFormulario(config));
  const [erros, setErros] = useState<ErrosConfig>({});
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const temporizador = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    },
    [],
  );

  const mudar = (campo: keyof CamposForm) => (valor: string) => {
    setF((a) => ({ ...a, [campo]: valor }));
    setAviso(null);
  };

  const salvar = () => {
    if (ocupado) return;
    const nova = paraConfig(f);
    const v = validarConfig(nova);
    setErros(v.erros);
    if (!v.ok) {
      setAviso({ tom: "erro", texto: T_RETIRADA_CONFIRA });
      return;
    }
    setAviso(null);
    setOcupado(true);
    temporizador.current = window.setTimeout(() => {
      const limpa = { ...nova, local: nova.local.trim(), horario: nova.horario.trim() };
      setConfig(limpa);
      setF(paraFormulario(limpa));
      setErros({});
      setOcupado(false);
      setAviso({ tom: "sucesso", texto: T_RETIRADA_SALVA });
      temporizador.current = null;
    }, 700);
  };

  const restaurar = () => {
    setF(paraFormulario(CONFIG_PADRAO));
    setErros({});
    setAviso(null);
  };

  const previa =
    f.local.trim() === "" || f.horario.trim() === ""
      ? "Preencha o local e o horário para ver o texto."
      : textoRetirada({ local: f.local, horario: f.horario, prazoRetiradaDiasUteis: comoNumero(f.prazoRetirada) });

  // A Retirada não tem estado Vazio; Vazio e Ponte desligada valem como Normal.
  const visual = estado === "carregando" ? "carregando" : estado === "erro" ? "erro" : "normal";

  return (
    <EstadoAba
      estado={visual}
      esqueleto={
        <div role="status" aria-label={T_RETIRADA_CARREGANDO} className="mx-auto max-w-3xl">
          <p className="sr-only">{T_RETIRADA_CARREGANDO}</p>
          <Esqueleto linhas={3} altura={150} />
        </div>
      }
      erro={T_RETIRADA_ERRO}
      aoTentarDeNovo={() => setEstado("normal")}
    >
      <form
        data-aba="retirada"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
        className="hl-entra mx-auto flex max-w-3xl flex-col gap-4"
      >
        <section aria-label={T_RETIRADA_CARTAO_ONDE} className={cx(CARTAO, "p-4")}>
          <h2 className="mb-3 font-display text-base font-bold text-primary">{T_RETIRADA_CARTAO_ONDE}</h2>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <CampoTexto rotulo={T_RETIRADA_LOCAL} valor={f.local} aoMudar={mudar("local")} erro={erros.local} destino={DESTINO_CAMPO.local} placeholder={CONFIG_PADRAO.local} />
            <CampoTexto rotulo={T_RETIRADA_HORARIO} valor={f.horario} aoMudar={mudar("horario")} erro={erros.horario} destino={DESTINO_CAMPO.horario} placeholder={CONFIG_PADRAO.horario} />
          </div>
        </section>

        <section aria-label={T_RETIRADA_CARTAO_PRAZOS} className={cx(CARTAO, "p-4")}>
          <h2 className="mb-3 font-display text-base font-bold text-primary">{T_RETIRADA_CARTAO_PRAZOS}</h2>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <CampoTexto
              rotulo={T_RETIRADA_PRAZO}
              valor={f.prazoRetirada}
              aoMudar={mudar("prazoRetirada")}
              ajuda={T_RETIRADA_PRAZO_AJUDA}
              erro={erros.prazoRetiradaDiasUteis}
              destino={DESTINO_CAMPO.prazoRetiradaDiasUteis}
            />
            <CampoTexto
              rotulo={T_RETIRADA_GUARDADAS}
              valor={f.prazoGuardadas}
              aoMudar={mudar("prazoGuardadas")}
              ajuda={T_RETIRADA_GUARDADAS_AJUDA}
              erro={erros.prazoGuardadasDiasUteis}
              destino={DESTINO_CAMPO.prazoGuardadasDiasUteis}
            />
            <CampoTexto
              rotulo={T_RETIRADA_LIMITE}
              valor={f.limiteParado}
              aoMudar={mudar("limiteParado")}
              ajuda={T_RETIRADA_LIMITE_AJUDA}
              erro={erros.limiteParadoDiasUteis}
              destino={DESTINO_CAMPO.limiteParadoDiasUteis}
            />
          </div>
        </section>

        <section aria-label={T_RETIRADA_CARTAO_GESTOR} className={cx(CARTAO, "p-4")}>
          <h2 className="mb-3 font-display text-base font-bold text-primary">{T_RETIRADA_CARTAO_GESTOR}</h2>
          <div className="max-w-md">
            <CampoGestor valor={f.gestorId} aoMudar={mudar("gestorId")} erro={erros.gestorId} />
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <CaixaReservada ancora="aviso-retirada" altura="h-[104px] sm:h-16" className="min-w-0 sm:flex-1" role="status">
            {aviso ? (
              <p
                className={cx(
                  "flex h-full items-start gap-2 rounded-2xl border p-3 text-sm text-foreground",
                  aviso.tom === "sucesso" ? "border-[#1f7a4d] bg-[#e7f5ee]" : "border-[#b42318] bg-[#fde8e6]",
                )}
              >
                {aviso.tom === "sucesso" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1f7a4d]" aria-hidden />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#b42318]" aria-hidden />
                )}
                <span>{aviso.texto}</span>
              </p>
            ) : null}
          </CaixaReservada>
          <div className="flex shrink-0 justify-end">
            <BotaoConfirmavel ancora="salvar-retirada" minLargura="min-w-[8.5rem]" aoClicar={salvar} desabilitado={ocupado}>
              {ocupado ? T_RETIRADA_SALVANDO : T_RETIRADA_SALVAR}
            </BotaoConfirmavel>
          </div>
        </div>

        <PropostaNova id="retirada-previa" className={cx(CARTAO, "space-y-3 p-4")}>
          <div className="flex min-h-11 flex-wrap items-center justify-between gap-2">
            <div className="flex min-h-6 flex-wrap items-center gap-2">
              <h2 className="font-display text-base font-bold text-primary">{T_COMO_O_SOLICITANTE_VE}</h2>
              <SeloProposta />
            </div>
            <button
              type="button"
              onClick={restaurar}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-primary transition hover:bg-muted active:scale-[0.98]"
            >
              {T_RESTAURAR_PADRAO}
            </button>
          </div>
          <p data-ancora="previa-retirada" className="h-24 overflow-y-auto rounded-2xl bg-muted p-3 text-sm text-foreground sm:h-20">
            {previa}
          </p>
        </PropostaNova>
      </form>
    </EstadoAba>
  );
}
