// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: src/hub/pages/loja/* (padrões de aba, campo, indicador e estados) @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import { createContext, useContext, useId, type ReactNode } from "react";
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { BOTAO_SECUNDARIO, CARTAO, Numero, ROTULO_PEQUENO, cx } from "../hub-loja/ui";

/* ------------------------- Propostas novas (liga/desliga) ------------------------- */

const PropostasCtx = createContext(true);
export const PropostasProvider = PropostasCtx.Provider;
export const usePropostas = () => useContext(PropostasCtx);

/** Selo "Proposta nova": laranja escuro (#a83a0c) sobre orange-soft, contraste ≥ 4,5:1. */
export function SeloProposta({ className }: { className?: string }) {
  return (
    <span
      aria-label="Proposta nova"
      className={cx("inline-flex h-6 shrink-0 items-center rounded-full bg-orange-soft px-2.5 text-xs font-semibold text-[#a83a0c]", className)}
    >
      Proposta nova
    </span>
  );
}

/**
 * Único ponto que sabe desligar propostas (`?propostas=0`). Envolve um bloco com `data-proposta`.
 * Com `titulo`, mostra o título e o selo na mesma linha; sem `titulo`, só o conteúdo (o selo vai por conta de quem usa).
 */
export function PropostaNova({ id, titulo, children, className }: { id: string; titulo?: ReactNode; children?: ReactNode; className?: string }) {
  const ligado = usePropostas();
  if (!ligado) return null;
  return (
    <div data-proposta={id} className={className}>
      {titulo ? (
        <div className="flex min-h-6 flex-wrap items-center gap-2">
          <span className="font-display text-base font-bold text-primary">{titulo}</span>
          <SeloProposta />
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Esconde uma variação em linha (texto, selo, etiqueta) quando as propostas estão desligadas. */
export function Ocultavel({ children }: { children: ReactNode }) {
  return usePropostas() ? <>{children}</> : null;
}

/* ------------------------------ Caixa reservada ------------------------------ */

/**
 * Caixa de altura FIXA para aviso ou confirmação. Vazia, fica em branco; cheia, mostra o conteúdo.
 * `altura` é uma classe Tailwind de altura (ex.: "h-14", "h-[88px] max-sm:h-[132px]"). Nunca cresce.
 */
export function CaixaReservada({
  altura,
  ancora,
  children,
  role,
  className,
}: {
  altura: string;
  ancora?: string;
  children?: ReactNode;
  role?: "status" | "alert" | "alertdialog";
  className?: string;
}) {
  return (
    <div data-ancora={ancora} className={cx("overflow-y-auto", altura, className)}>
      {children ? (
        <div role={role} className="hlc-caixa-entra h-full">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/* --------------------------------- Esqueleto --------------------------------- */

export function Esqueleto({ linhas = 3, altura = 56, className }: { linhas?: number; altura?: number; className?: string }) {
  return (
    <div className={cx("space-y-3", className)} aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="hlc-esqueleto rounded-2xl" style={{ height: altura }} />
      ))}
    </div>
  );
}

/* --------------------------------- EstadoAba --------------------------------- */

export type EstadoVisual = "normal" | "carregando" | "vazio" | "erro";

export function EstadoAba({
  estado,
  esqueleto,
  vazio,
  erro,
  aoTentarDeNovo,
  children,
}: {
  estado: EstadoVisual;
  esqueleto?: ReactNode;
  vazio?: { titulo: string; texto: string };
  erro: string;
  aoTentarDeNovo: () => void;
  children: ReactNode;
}) {
  if (estado === "carregando") return <div className="hl-entra">{esqueleto ?? <Esqueleto linhas={4} altura={96} />}</div>;
  if (estado === "vazio" && vazio) {
    return (
      <div className={cx(CARTAO, "hl-entra mx-auto max-w-xl p-8 text-center")}>
        <h2 className="font-display text-xl font-bold text-primary">{vazio.titulo}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{vazio.texto}</p>
      </div>
    );
  }
  if (estado === "erro") {
    return (
      <div role="alert" className={cx(CARTAO, "hl-entra mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center")}>
        <AlertTriangle className="h-7 w-7 text-[#b42318]" aria-hidden />
        <p className="text-sm text-foreground">{erro}</p>
        <button type="button" onClick={aoTentarDeNovo} className={BOTAO_SECUNDARIO}>
          Tentar de novo
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

/* --------------------------------- Indicador --------------------------------- */

export interface Variacao {
  texto: string;
  sentido: "alta" | "queda" | "igual" | "sem_base";
}

/** Cartão de indicador de altura fixa. Variação e legenda "Posição de hoje" são propostas e ocupam linhas já reservadas. */
export function Indicador({
  rotulo,
  valor,
  apoio,
  variacao,
  posicaoHoje,
}: {
  rotulo: string;
  valor: string | number;
  apoio?: string;
  variacao?: Variacao;
  posicaoHoje?: boolean;
}) {
  const Icone = variacao?.sentido === "alta" ? TrendingUp : variacao?.sentido === "queda" ? TrendingDown : Minus;
  return (
    <div className={cx(CARTAO, "flex min-h-[132px] flex-col gap-1 p-4")}>
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
        <p className={ROTULO_PEQUENO}>{rotulo}</p>
        {variacao || posicaoHoje ? (
          <Ocultavel>
            <SeloProposta />
          </Ocultavel>
        ) : null}
      </div>
      <p className="font-display text-3xl font-bold leading-tight text-primary">
        <Numero valor={valor} />
      </p>
      <p className="min-h-5 text-sm text-muted-foreground">{apoio ?? ""}</p>
      <p className="mt-auto min-h-5 text-xs font-semibold text-foreground">
        <Ocultavel>
          {variacao ? (
            <span className="inline-flex items-center gap-1">
              <Icone className="h-4 w-4" aria-hidden />
              {variacao.texto}
            </span>
          ) : posicaoHoje ? (
            <span className="text-muted-foreground">Posição de hoje</span>
          ) : null}
        </Ocultavel>
      </p>
    </div>
  );
}

/* --------------------------------- BarraLinha --------------------------------- */

/** Linha de gasto: nome, valor, barra proporcional (scaleX) e detalhe. */
export function BarraLinha({ nome, valor, max, detalhe, valorTexto }: { nome: string; valor: number; max: number; detalhe: string; valorTexto: string }) {
  const proporcao = max > 0 ? Math.min(1, Math.max(0, valor / max)) : 0;
  return (
    <li className="space-y-1.5 py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-semibold text-foreground" title={nome}>
          {nome}
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">{valorTexto}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="hlc-barra-escala h-full w-full rounded-full bg-primary" style={{ transform: `scaleX(${proporcao})` }} />
      </div>
      <p className="text-xs text-muted-foreground">{detalhe}</p>
    </li>
  );
}

/* ------------------------------ SegmentadoGrande ------------------------------ */

export interface OpcaoSegmentada<T extends string> {
  id: T;
  rotulo: ReactNode;
  desabilitado?: boolean;
  dica?: string;
}

/** Substitui `Segmentado` (36 px) por alvos de 44 px. Nunca quebra linha: o contêiner dono decide o espaço. */
export function SegmentadoGrande<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
  ancora,
  className,
}: {
  opcoes: OpcaoSegmentada<T>[];
  valor: T | null;
  aoMudar: (v: T) => void;
  rotulo: string;
  ancora?: string;
  className?: string;
}) {
  return (
    <div data-ancora={ancora} role="group" aria-label={rotulo} className={cx("inline-flex flex-nowrap gap-1 rounded-full bg-muted p-1", className)}>
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={valor === o.id}
          disabled={o.desabilitado}
          title={o.desabilitado ? o.dica : undefined}
          onClick={() => aoMudar(o.id)}
          className={cx(
            "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            valor === o.id ? "bg-card text-primary shadow-[var(--shadow-card)]" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------- CampoTexto ---------------------------------- */

/**
 * Rótulo, entrada, ajuda e linha de erro reservada (min-h-5, sempre presente).
 * `destino` é a etiqueta "Vai para a Loja" / "Fica só no Hub" (proposta): a linha do rótulo mantém a altura sem ela.
 */
export function CampoTexto({
  rotulo,
  valor,
  aoMudar,
  ajuda,
  erro,
  destino,
  tipo = "text",
  desabilitado,
  ancora,
  placeholder,
  className,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  ajuda?: string;
  erro?: string | null;
  destino?: "loja" | "hub";
  tipo?: "text" | "number" | "email";
  desabilitado?: boolean;
  ancora?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const idAjuda = `${id}-ajuda`;
  const idErro = `${id}-erro`;
  return (
    <div className={cx("space-y-1", className)}>
      <div className="flex min-h-6 items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {rotulo}
        </label>
        <span className="text-xs font-semibold text-muted-foreground">
          <Ocultavel>{destino === "loja" ? "Vai para a Loja" : destino === "hub" ? "Fica só no Hub" : ""}</Ocultavel>
        </span>
      </div>
      <input
        id={id}
        data-ancora={ancora}
        type={tipo}
        value={valor}
        disabled={desabilitado}
        placeholder={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={erro ? true : undefined}
        aria-describedby={cx(ajuda && idAjuda, erro && idErro) || undefined}
        className={cx(
          "block min-h-11 w-full rounded-xl border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60",
          erro ? "border-[#b42318]" : "border-[#7b87b8]",
        )}
      />
      <p id={idAjuda} className="min-h-5 text-xs text-muted-foreground">
        {ajuda ?? ""}
      </p>
      <p id={idErro} role={erro ? "alert" : undefined} className="min-h-5 text-xs font-semibold text-[#b42318]">
        {erro ?? ""}
      </p>
    </div>
  );
}

/* ------------------------------- BotaoConfirmavel ------------------------------- */

/** Botão que alterna o rótulo sem mudar de largura: `minLargura` é a classe `min-w` do maior rótulo. */
export function BotaoConfirmavel({
  children,
  aoClicar,
  minLargura = "min-w-[10rem]",
  variante = "primario",
  desabilitado,
  ancora,
  ancoraId,
  descritoPor,
  ariaLabel,
}: {
  children: ReactNode;
  aoClicar: () => void;
  minLargura?: string;
  variante?: "primario" | "secundario" | "destrutivo";
  desabilitado?: boolean;
  ancora?: string;
  ancoraId?: string | number;
  descritoPor?: string;
  ariaLabel?: string;
}) {
  const base = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
  const cor =
    variante === "primario"
      ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)] hover:brightness-110"
      : variante === "destrutivo"
        ? "border border-destructive/60 bg-card text-[#b42318] hover:bg-[#fde8e6]"
        : "border border-border bg-card text-primary hover:bg-muted";
  return (
    <button
      type="button"
      data-ancora={ancora}
      data-ancora-id={ancoraId}
      disabled={desabilitado}
      aria-describedby={descritoPor}
      aria-label={ariaLabel}
      onClick={aoClicar}
      className={cx(base, cor, minLargura)}
    >
      {children}
    </button>
  );
}
