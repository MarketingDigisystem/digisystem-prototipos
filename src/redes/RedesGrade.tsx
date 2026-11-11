/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/pages/resultados/Redes.tsx e rede/PaginaRede.tsx @ leitura 2026-11-11 (commit 83755ae).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 *
 * Tela completa (tarefa 10.3): cabeçalho em três linhas de posição fixa, visão Todas, visões por rede
 * e modo Reorganizar. Cada visão guarda o próprio arranjo na sessão (no app real: por pessoa, em
 * user_preferencias). Dados fictícios.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, RotateCcw, SlidersHorizontal } from "lucide-react";
import { arranjoPadraoDaVisao, catalogoGrade, tituloDoCard, VISOES } from "./nucleo/catalogo-cards";
import { textosDoEstado } from "./nucleo/estado-rede";
import { alertaMenosRedes, consolidar } from "./nucleo/consolidado";
import { ehVisaoAtiva, paramDaVisao, type VisaoAtiva } from "./nucleo/visao";
import type { ArranjoGrade } from "./nucleo/grade";
import type { SocialProvider } from "./nucleo/tipos-proto";
import { PainelGradeProto } from "./PainelGradeProto";
import { ConteudoCard, type ContextoCards } from "./cards";
import { entradasMock, FASES, PERIODOS, ROTULO_FASE, ROTULO_REDE, SINCRONIZADO_EM, type FasePagina, type PeriodoDias } from "./mock";

const ROTULO_VISAO: Record<VisaoAtiva, string> = {
  todas: "Todas as redes",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

function paramsDoHash(): URLSearchParams {
  return new URLSearchParams(window.location.hash.split("?")[1] ?? "");
}

/** Atualiza só os parâmetros informados e preserva os demais (rede, estado, tema). */
function gravarHash(parcial: Record<string, string | null>) {
  const p = paramsDoHash();
  for (const [k, v] of Object.entries(parcial)) {
    if (v === null) p.delete(k);
    else p.set(k, v);
  }
  const qs = p.toString();
  history.replaceState(null, "", `#/redes${qs ? `?${qs}` : ""}`);
}

function visaoDoHash(): VisaoAtiva {
  const v = paramsDoHash().get("rede");
  return ehVisaoAtiva(v) ? v : "todas";
}

/** `?estado=carregando|vazio|erro|embreve` (só do protótipo). */
function faseDoHash(): FasePagina {
  const v = paramsDoHash().get("estado");
  return (FASES as readonly string[]).includes(v ?? "") ? (v as FasePagina) : "dados";
}

function escuroDoHash(): boolean {
  return paramsDoHash().get("tema") === "escuro";
}

const PILL = "min-h-11 rounded-full px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function RedesGrade() {
  const [visao, setVisao] = useState<VisaoAtiva>(visaoDoHash);
  const [dias, setDias] = useState<PeriodoDias>(30);
  const [demo, setDemo] = useState(false);
  const [fase, setFase] = useState<FasePagina>(faseDoHash);
  const [escuro, setEscuro] = useState(escuroDoHash);
  const [reorganizar, setReorganizar] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [arranjos, setArranjos] = useState<Partial<Record<VisaoAtiva, ArranjoGrade>>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  const padrao = useMemo(() => arranjoPadraoDaVisao(visao), [visao]);
  const arranjo = arranjos[visao] ?? padrao;
  const diferenteDoPadrao = JSON.stringify(arranjo) !== JSON.stringify(padrao);

  const entradas = useMemo(() => entradasMock(demo, dias, fase), [demo, dias, fase]);
  const carregandoOuErro = fase === "carregando" || fase === "erro";

  // Tema escuro: classe `dark` no <html> enquanto a tela está montada.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    return () => document.documentElement.classList.remove("dark");
  }, [escuro]);

  function trocarFase(f: FasePagina) {
    setFase(f);
    gravarHash({ estado: f === "dados" ? null : f });
  }
  function trocarTema(e: boolean) {
    setEscuro(e);
    gravarHash({ tema: e ? "escuro" : null });
  }
  const consolidado = useMemo(() => consolidar(entradas), [entradas]);

  function irParaVisao(v: VisaoAtiva) {
    setVisao(v);
    gravarHash({ rede: paramDaVisao(v) });
  }

  function abrirRede(r: SocialProvider) {
    irParaVisao(r);
    window.scrollTo({ top: 0 });
  }

  const ctx: ContextoCards = { dias, entradas, abrirRede, fase, tentarDeNovo: () => trocarFase("dados") };

  // Mensagem passageira da faixa de contexto (Exportar)
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(""), 5000);
    return () => clearTimeout(t);
  }, [aviso]);

  // Setas no seletor de visão (padrão tablist)
  function teclaNoSeletor(e: React.KeyboardEvent, i: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const prox = VISOES[(i + delta + VISOES.length) % VISOES.length];
    irParaVisao(prox);
    requestAnimationFrame(() => tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[VISOES.indexOf(prox)]?.focus());
  }

  // Faixa de contexto (Linha B): sempre uma linha, altura fixa
  const contexto =
    aviso ||
    (fase === "carregando"
      ? "Carregando os dados das redes. Os cards ficam no mesmo lugar."
      : fase === "erro"
        ? "Não foi possível carregar os dados das redes agora. Tente de novo."
        : visao === "todas"
      ? (() => {
          const inc = consolidado.impressoes.incluidas.length;
          const alerta = alertaMenosRedes(entradas, consolidado);
          return `Consolidado com ${inc} de ${entradas.length} redes${alerta ? ", menos do que as conectadas" : ""}. Só entram métricas comparáveis entre redes.`;
        })()
      : entradas.find((e) => e.rede === visao)!.estado.tipo === "ok"
        ? `Dados de ${ROTULO_REDE[visao]} sincronizados em ${SINCRONIZADO_EM}. Histórico de seguidores desde 09/11/2026.`
        : textosDoEstado(entradas.find((e) => e.rede === visao)!.estado).slice(0, 2).join(" "));

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ ["--accent-strong" as string]: "oklch(0.6 0.19 41)" }}
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-36 pt-6 sm:px-6 sm:pb-24">
        <h1 className="mb-4 mt-2 font-display text-3xl font-bold leading-none">Redes</h1>

        {/* Linha A: seletor de visão (esquerda) · período e exportar (direita) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Visão"
            className="flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1"
          >
            {VISOES.map((v, i) => {
              const entrada = entradas.find((e) => e.rede === v);
              const estado = entrada && !carregandoOuErro ? textosDoEstado(entrada.estado)[0] : null;
              const ativo = v === visao;
              return (
                <button
                  key={v}
                  role="tab"
                  type="button"
                  aria-selected={ativo}
                  tabIndex={ativo ? 0 : -1}
                  onClick={() => irParaVisao(v)}
                  onKeyDown={(e) => teclaNoSeletor(e, i)}
                  className={`${PILL} relative shrink-0 ${ativo ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-secondary"}`}
                >
                  {ROTULO_VISAO[v]}
                  {/* Indicador de largura fixa: o texto do estado vai só para leitor de tela e para os cards,
                      assim o seletor não muda de tamanho nem empurra os controles ao trocar de estado. */}
                  {entrada ? (
                    <span
                      aria-hidden="true"
                      className={`ml-2 inline-block h-2 w-2 rounded-full align-middle ${
                        entrada.estado.tipo === "ok" ? "bg-success" : ativo ? "bg-primary-foreground/60" : "bg-muted-foreground/50"
                      }`}
                    />
                  ) : null}
                  {estado ? <span className="sr-only"> ({estado})</span> : null}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div role="group" aria-label="Período" className="flex gap-1 rounded-full border border-border bg-card p-1">
              {PERIODOS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={dias === p}
                  onClick={() => setDias(p)}
                  className={`min-h-9 rounded-full px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    dias === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {p} dias
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAviso("Prévia: no app, o relatório mensal em PDF abre pelo diálogo de impressão do navegador.")}
              className={`${PILL} inline-flex items-center gap-2 border border-border bg-card hover:bg-secondary`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Exportar
            </button>
          </div>
        </div>

        {/* Linha B: faixa de contexto (altura fixa, sempre montada) */}
        <p
          className="mt-3 flex min-h-[5.25rem] items-center rounded-2xl sm:min-h-[3.75rem] lg:min-h-10 bg-secondary/60 px-4 text-sm text-muted-foreground"
          role={fase === "erro" ? "alert" : "status"}
          aria-live={fase === "erro" ? "assertive" : "polite"}
        >
          {contexto}
        </p>

        {/* Linha C: dica à esquerda · Restaurar e Reorganizar ancorados à direita (sempre montados) */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="min-h-6 text-sm text-muted-foreground">
            {reorganizar ? "Arraste pela alça, use as setas do teclado ou as alças de tamanho nas bordas." : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-disabled={!reorganizar || !diferenteDoPadrao}
              onClick={() => {
                if (reorganizar && diferenteDoPadrao) setConfirmando(true);
              }}
              className={`${PILL} inline-flex items-center gap-2 border border-border bg-card aria-disabled:opacity-40`}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restaurar disposição padrão
            </button>
            <button
              type="button"
              aria-pressed={reorganizar}
              onClick={() => setReorganizar((r) => !r)}
              className={`${PILL} inline-flex items-center gap-2 border ${
                reorganizar ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Reorganizar
            </button>
          </div>
        </div>

        <div className="mt-4">
          <PainelGradeProto
            key={visao}
            arranjo={arranjo}
            catalogo={catalogoGrade(visao)}
            onArranjo={(a) => setArranjos((s) => ({ ...s, [visao]: a }))}
            reorganizar={reorganizar}
            titulo={(id) => tituloDoCard(visao, id)}
            renderCard={(item) => <ConteudoCard visao={visao} id={item.id} h={item.h} ctx={ctx} />}
          />
        </div>
      </div>

      {confirmando ? (
        <div className="fixed inset-0 z-[10000] grid place-items-center bg-foreground/40 p-4" onKeyDown={(e) => e.key === "Escape" && setConfirmando(false)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="t-restaurar" className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-float">
            <h2 id="t-restaurar" className="font-display text-xl font-bold">
              Restaurar a disposição padrão?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A visão {ROTULO_VISAO[visao]} volta ao desenho original, com todos os cards visíveis. As outras visões não mudam.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" autoFocus className={`${PILL} border border-border bg-card hover:bg-secondary`} onClick={() => setConfirmando(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className={`${PILL} bg-primary text-primary-foreground`}
                onClick={() => {
                  setArranjos((s) => ({ ...s, [visao]: padrao }));
                  setConfirmando(false);
                  setAviso("Disposição padrão restaurada.");
                }}
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Só do protótipo: simula as quatro redes com coleta para aprovar o gráfico por rede e o consolidado */}
      {/* Painel fixo no canto, com posição e tamanho constantes em qualquer estado */}
      <div
        role="group"
        aria-label="Só do protótipo"
        className="fixed bottom-3 left-3 z-[9999] flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-3xl border border-border bg-card px-4 py-2 text-xs shadow-float"
      >
        <strong>Só do protótipo</strong>
        <label className="flex min-h-9 cursor-pointer items-center gap-2">
          <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
          <span>4 redes com dados</span>
        </label>
        <label className="flex min-h-9 items-center gap-2">
          <span>Estado</span>
          <select
            value={fase}
            onChange={(e) => trocarFase(e.target.value as FasePagina)}
            className="min-h-9 rounded-full border border-border bg-background px-3 text-xs text-foreground"
          >
            {FASES.map((f) => (
              <option key={f} value={f}>
                {ROTULO_FASE[f]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-9 cursor-pointer items-center gap-2">
          <input type="checkbox" checked={escuro} onChange={(e) => trocarTema(e.target.checked)} />
          <span>Tema escuro</span>
        </label>
      </div>
    </div>
  );
}
