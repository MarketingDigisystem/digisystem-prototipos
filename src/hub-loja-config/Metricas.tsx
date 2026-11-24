// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: src/hub/pages/loja/AbaMetricas.tsx, metricas-loja.ts e csv-loja.ts @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { CARTAO, FotoBrinde, cx } from "../hub-loja/ui";
import { useProto } from "./contexto";
import { HOJE, MES_ATUAL } from "./dados";
import { BOM_UTF8, linhasCsvDoMes, nomeArquivoCsv, serializarCsv } from "./csv";
import {
  formatarReal,
  formatarTempoAtendimento,
  painelDoMes,
  rotuloMes,
  somarMeses,
  textoComparacaoGasto,
  variacaoPercentual,
  type BrindeEmAlerta,
  type LinhaGasto,
  type PainelMetricas,
  type Popularidade,
} from "./metricas-calc";
import {
  T_CARTAO_ALERTAS,
  T_CARTAO_ESGOTADOS,
  T_CARTAO_POPULARIDADE,
  T_CARTAO_POR_AREA,
  T_CARTAO_POR_SOLICITANTE,
  T_IND_ABAIXO,
  T_IND_ABAIXO_APOIO,
  T_IND_ESGOTADOS,
  T_IND_ESGOTADOS_APOIO,
  T_IND_GASTO,
  T_IND_PARADOS,
  T_IND_PARADOS_APOIO,
  T_IND_PRONTOS,
  T_IND_TEMPO,
  T_IND_TEMPO_APOIO,
  T_IND_TEMPO_APOIO_SEM,
  T_IND_UNIDADES,
  T_IND_UNIDADES_APOIO,
  T_IND_VALOR_ESTOQUE,
  T_IND_VALOR_ESTOQUE_APOIO,
  T_MES_ANTERIOR,
  T_METRICAS_ERRO,
  T_METRICAS_VAZIO_DESCRICAO,
  T_METRICAS_VAZIO_TITULO,
  T_PROXIMO_MES,
  T_SEM_ABAIXO_MINIMO,
  T_SEM_ENTREGUES_MES,
  T_SEM_ESGOTADOS,
  textoCustoProntos,
  textoDisponivelMinimo,
  textoPedidosEUnidades,
  textoSemCusto,
  textoUnidadesPedidos,
} from "./textos";
import { EstadoAba, Indicador, BarraLinha, PropostaNova, SeloProposta, type EstadoVisual } from "./ui-config";

/* ----------------------------- helpers locais ----------------------------- */

const BOTAO_REDONDO =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";

/** Altura fixa do bloco "O que pede atenção". Sem a proposta, o mesmo espaço fica reservado (o real não se desloca). */
const ALTURA_ATENCAO = "h-[232px] sm:h-[112px]";

const nParados = (n: number): string => (n === 0 ? "Nenhum pedido parado" : n === 1 ? "1 pedido parado" : `${n} pedidos parados`);
const nEsgotados = (n: number): string => (n === 0 ? "Nenhum brinde esgotado" : n === 1 ? "1 brinde esgotado" : `${n} brindes esgotados`);
const nAbaixo = (n: number): string =>
  n === 0 ? "Nenhum brinde abaixo do mínimo" : n === 1 ? "1 brinde abaixo do mínimo" : `${n} brindes abaixo do mínimo`;

function baixarCsv(p: PainelMetricas): string {
  const nome = nomeArquivoCsv(p.mes);
  const texto = serializarCsv(linhasCsvDoMes(p));
  // O BOM já vem do serializarCsv; o Blob em UTF-8 não o duplica.
  const blob = new Blob([texto.startsWith(BOM_UTF8) ? texto : BOM_UTF8 + texto], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return nome;
}

function CartaoLista({ titulo, children, className }: { titulo: string; children: ReactNode; className?: string }) {
  return (
    <section aria-label={titulo} className={cx(CARTAO, "hl-entra p-4", className)}>
      <h3 className="mb-3 font-display text-lg font-bold text-primary">{titulo}</h3>
      {children}
    </section>
  );
}

const VAZIO_LISTA = "text-sm text-muted-foreground";

/** Barras só ganham proporção depois da primeira pintura, para a entrada animar por scaleX. */
function ListaGasto({ linhas }: { linhas: LinhaGasto[] }) {
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMontado(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (linhas.length === 0) return <p className={VAZIO_LISTA}>{T_SEM_ENTREGUES_MES}</p>;
  const max = Math.max(...linhas.map((l) => l.valor), 0.01);
  return (
    <ul className="divide-y divide-border">
      {linhas.map((l) => (
        <BarraLinha
          key={l.chave}
          nome={l.rotulo}
          valor={l.valor}
          max={montado ? max : Number.POSITIVE_INFINITY}
          valorTexto={formatarReal(l.valor)}
          detalhe={textoPedidosEUnidades(l.pedidos, l.unidades)}
        />
      ))}
    </ul>
  );
}

function Miniatura({ src, alt }: { src: string; alt: string }) {
  return <FotoBrinde src={src} alt={alt} pad="p-1" className="h-10 w-10 shrink-0 rounded-lg border border-border" />;
}

function ListaAlerta({ itens, vazio }: { itens: BrindeEmAlerta[]; vazio: string }) {
  if (itens.length === 0) return <p className={VAZIO_LISTA}>{vazio}</p>;
  return (
    <ul className="divide-y divide-border">
      {itens.map((b) => (
        <li key={b.id} className="flex items-center gap-3 py-2">
          <Miniatura src={b.foto} alt={b.nome} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground" title={b.nome}>
              {b.nome}
            </p>
            <p className="text-xs text-muted-foreground">{textoDisponivelMinimo(b.disponivel, b.minimo)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ListaPopularidade({ itens }: { itens: Popularidade[] }) {
  if (itens.length === 0) return <p className={VAZIO_LISTA}>Nenhum pedido criado neste mês.</p>;
  return (
    <ol className="divide-y divide-border">
      {itens.map((p, i) => (
        <li key={p.brindeId} className="flex items-center gap-3 py-2">
          <span className="w-6 shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">{i + 1}.</span>
          <Miniatura src={p.foto} alt={p.nome} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground" title={p.nome}>
              {p.nome}
            </p>
            <p className="text-xs text-muted-foreground">{textoUnidadesPedidos(p.unidades, p.pedidos)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ItemAtencao({ href, texto, contagem }: { href: string; texto: string; contagem: number }) {
  const Icone = contagem > 0 ? AlertTriangle : CheckCircle2;
  return (
    <a
      href={href}
      className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground transition hover:bg-muted"
    >
      <Icone className={cx("h-4 w-4 shrink-0", contagem > 0 ? "text-[#a83a0c]" : "text-primary")} aria-hidden />
      <span className="min-w-0 flex-1 truncate" title={texto}>
        {texto}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </a>
  );
}

function ResumoAtencao({ p }: { p: PainelMetricas }) {
  return (
    <section aria-label="O que pede atenção" className={cx(CARTAO, "hl-entra flex h-full flex-col gap-3 p-4")}>
      <div className="flex min-h-6 flex-wrap items-center gap-2">
        <h3 className="font-display text-lg font-bold text-primary">O que pede atenção</h3>
        <SeloProposta />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ItemAtencao href="#/hub-loja/pedidos" texto={nParados(p.pedidosParados)} contagem={p.pedidosParados} />
        <ItemAtencao href="#/hub-loja/estoque" texto={nEsgotados(p.esgotados.length)} contagem={p.esgotados.length} />
        <ItemAtencao href="#/hub-loja/estoque" texto={nAbaixo(p.abaixoDoMinimo.length)} contagem={p.abaixoDoMinimo.length} />
      </div>
    </section>
  );
}

function EsqueletoMetricas() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando as métricas">
      <div className={cx("hlc-esqueleto rounded-2xl", ALTURA_ATENCAO)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="hlc-esqueleto h-[132px] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="hlc-esqueleto h-[260px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- aba --------------------------------- */

export function Metricas() {
  const { estado, mes, setMes, setEstado, dados, config } = useProto();
  const [avisoSr, setAvisoSr] = useState("");
  const painel = useMemo(() => painelDoMes(dados, mes, HOJE, config.limiteParadoDiasUteis), [dados, mes, config.limiteParadoDiasUteis]);
  const visual: EstadoVisual = estado === "carregando" || estado === "vazio" || estado === "erro" ? estado : "normal";
  const rotuloAnterior = rotuloMes(painel.mesAnterior);

  return (
    <div data-aba-metricas="" className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <h1 className="sr-only">Métricas da Loja</h1>

      {/* Seletor de mês: âncora fixa, rótulo com largura reservada, em qualquer mês e estado. */}
      <div className="flex min-h-11 items-center gap-2">
        <div role="group" aria-label="Mês das métricas" data-ancora="seletor-mes" className="flex items-center gap-2">
          <button type="button" aria-label={T_MES_ANTERIOR} onClick={() => setMes((m) => somarMeses(m, -1))} className={BOTAO_REDONDO}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <p aria-live="polite" className="w-[18ch] min-w-[15ch] whitespace-nowrap text-center font-display text-base font-bold capitalize text-primary">
            {rotuloMes(mes)}
          </p>
          <button
            type="button"
            aria-label={T_PROXIMO_MES}
            disabled={mes >= MES_ATUAL}
            onClick={() => setMes((m) => somarMeses(m, 1))}
            className={BOTAO_REDONDO}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <PropostaNova id="exportar-mes" className="flex items-center gap-2">
            <span className="max-sm:hidden">
              <SeloProposta />
            </span>
            <button
              type="button"
              data-ancora="exportar-mes"
              disabled={visual !== "normal"}
              title="Exportar mês (proposta nova)"
              onClick={() => setAvisoSr(`Arquivo ${baixarCsv(painel)} gerado.`)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-primary transition hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              <Download className="h-4 w-4" aria-hidden />
              <span className="max-sm:sr-only">Exportar mês</span>
            </button>
          </PropostaNova>
        </div>
      </div>
      <p role="status" className="sr-only">
        {avisoSr}
      </p>

      <EstadoAba
        estado={visual}
        esqueleto={<EsqueletoMetricas />}
        vazio={{ titulo: T_METRICAS_VAZIO_TITULO, texto: T_METRICAS_VAZIO_DESCRICAO }}
        erro={T_METRICAS_ERRO}
        aoTentarDeNovo={() => setEstado("normal")}
      >
        <div className="flex flex-col gap-4">
          <div className={ALTURA_ATENCAO} data-slot="atencao">
            <PropostaNova id="atencao" className="h-full">
              <ResumoAtencao p={painel} />
            </PropostaNova>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador
              rotulo={T_IND_GASTO}
              valor={formatarReal(painel.gasto)}
              apoio={textoComparacaoGasto(painel.gasto, painel.gastoMesAnterior, rotuloAnterior)}
              variacao={variacaoPercentual(painel.gasto, painel.gastoMesAnterior)}
            />
            <Indicador
              rotulo={T_IND_UNIDADES}
              valor={painel.unidadesEntregues}
              apoio={T_IND_UNIDADES_APOIO}
              variacao={variacaoPercentual(painel.unidadesEntregues, painel.unidadesMesAnterior)}
            />
            <Indicador
              rotulo={T_IND_PRONTOS}
              valor={`${painel.prontosUnidades} un.`}
              apoio={textoCustoProntos(formatarReal(painel.custoProntosAguardando))}
              posicaoHoje
            />
            <Indicador
              rotulo={T_IND_VALOR_ESTOQUE}
              valor={formatarReal(painel.valorEmEstoque)}
              apoio={painel.semCustoCadastrado > 0 ? textoSemCusto(painel.semCustoCadastrado) : T_IND_VALOR_ESTOQUE_APOIO}
              posicaoHoje
            />
            <Indicador rotulo={T_IND_PARADOS} valor={painel.pedidosParados} apoio={T_IND_PARADOS_APOIO} posicaoHoje />
            <Indicador
              rotulo={T_IND_TEMPO}
              valor={formatarTempoAtendimento(painel.tempoMedioAtendimentoMs)}
              apoio={painel.tempoMedioAtendimentoMs === null ? T_IND_TEMPO_APOIO_SEM : T_IND_TEMPO_APOIO}
              posicaoHoje
            />
            <Indicador rotulo={T_IND_ESGOTADOS} valor={painel.esgotados.length} apoio={T_IND_ESGOTADOS_APOIO} posicaoHoje />
            <Indicador rotulo={T_IND_ABAIXO} valor={painel.abaixoDoMinimo.length} apoio={T_IND_ABAIXO_APOIO} posicaoHoje />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CartaoLista titulo={T_CARTAO_POR_SOLICITANTE}>
              <ListaGasto linhas={painel.porSolicitante} />
            </CartaoLista>
            <CartaoLista titulo={T_CARTAO_POR_AREA}>
              <ListaGasto linhas={painel.porArea} />
            </CartaoLista>
            <CartaoLista titulo={T_CARTAO_ALERTAS}>
              <ListaAlerta itens={painel.abaixoDoMinimo} vazio={T_SEM_ABAIXO_MINIMO} />
            </CartaoLista>
            <CartaoLista titulo={T_CARTAO_ESGOTADOS}>
              <ListaAlerta itens={painel.esgotados} vazio={T_SEM_ESGOTADOS} />
            </CartaoLista>
            <CartaoLista titulo={T_CARTAO_POPULARIDADE} className="lg:col-span-2">
              <ListaPopularidade itens={painel.popularidade} />
            </CartaoLista>
          </div>
        </div>
      </EstadoAba>
    </div>
  );
}
