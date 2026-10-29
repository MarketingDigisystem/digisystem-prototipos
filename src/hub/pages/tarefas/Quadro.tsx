/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/planejamento.tsx (PlanejamentoPage + TarefasView),
 *   src/components/planejamento/EditarTarefaDialog.tsx (STATUS_TASK) @ commit 4fcf254 / leitura 2026-10-07.
 *   Referência visual (não é fonte): prototipos/react/src/components/planejamento/PlanejamentoProposta.tsx.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Tarefas → Quadro (proposta 4.1 a 4.4). Cinco colunas: Recebidos, A fazer,
 * Em andamento, Concluído e, ao lado, Problemas. A coluna de cada card é
 * CALCULADA em regras.ts (colunaDoCard): Recebidos, Concluído e Problemas não
 * são guardadas, então o card entra e sai delas sozinho. Arrastar usa o HTML5
 * nativo e passa pelos bloqueios de regras.ts (podeMover), com a mensagem do
 * que falta quando não pode.
 */
import { useEffect, useRef, useState, type DragEvent } from "react";
import { ChevronDown, Plus, Tag } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { CardTarefa, MARCADOR_COLUNA } from "../../components/CardTarefa";
import { DetalheCard } from "../../components/DetalheCard";
import { NovaTarefaDialog } from "../../components/NovaTarefaDialog";
import { hrefDe, navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { COLUNAS, type Coluna } from "../../store/regras";
import type { Card } from "../../store/tipos";

type FiltroPessoa = "todas" | "minhas" | "sem";
type FiltroPost = "com" | "sem" | null;

/** Dica fixa sob o nome da coluna, só onde o comportamento foge do esperado. */
const DICA: Partial<Record<Coluna, string>> = {
  recebidos: "Decisão em Pedidos",
  problemas: "O card entra e sai sozinho",
};

const VAZIA: Record<Coluna, string> = {
  recebidos: "Nenhum pedido novo.",
  afazer: "Nada na fila.",
  andamento: "Nenhum card em produção.",
  concluido: "Nada concluído ainda.",
  problemas: "Nada parado. Quando um card travar por inteiro, ele aparece aqui.",
};

/** Prazo mais próximo primeiro; sem prazo vai para o fim. */
const porPrazo = (a: Card, b: Card) => (a.prazo ?? "9999").localeCompare(b.prazo ?? "9999");

export function Quadro({ rota }: { rota: Rota }) {
  const { dados, usuario, sel, acoes } = useHub();
  const cardAberto = rota.params.card;

  const [pessoa, setPessoa] = useState<FiltroPessoa>("todas");
  const [comPost, setComPost] = useState<FiltroPost>(null);
  // ?etiqueta= já abre filtrado (link "Ver no Quadro" de Configurações → Etiquetas).
  const [etiquetas, setEtiquetas] = useState<string[]>(rota.params.etiqueta ? [rota.params.etiqueta] : []);
  useEffect(() => {
    if (rota.params.etiqueta) setEtiquetas([rota.params.etiqueta]);
  }, [rota.params.etiqueta]);
  const [novaAberta, setNovaAberta] = useState(false);
  const [arrastando, setArrastando] = useState<Card | null>(null);
  const [sobre, setSobre] = useState<Coluna | null>(null);

  const porColuna = sel.cardsPorColuna();
  const noQuadro = COLUNAS.flatMap((c) => porColuna[c.id]);

  // "Minhas" inclui os cards em que tenho alguma subtarefa (proposta 4.2 item 6).
  const ehMeu = (c: Card) =>
    c.responsavelId === usuario.id || dados.subtarefas.some((s) => s.cardId === c.id && s.responsavelId === usuario.id);

  const passaOutros = (c: Card) => {
    if (comPost === "com" && sel.postsDoCard(c.id).length === 0) return false;
    if (comPost === "sem" && sel.postsDoCard(c.id).length > 0) return false;
    if (etiquetas.length && !c.etiquetas.some((e) => etiquetas.includes(e))) return false;
    return true;
  };
  const passaPessoa = (c: Card, f: FiltroPessoa) =>
    f === "todas" ? true : f === "minhas" ? ehMeu(c) : !c.responsavelId;

  const base = noQuadro.filter(passaOutros);
  const contagem: Record<FiltroPessoa, number> = {
    todas: base.length,
    minhas: base.filter((c) => passaPessoa(c, "minhas")).length,
    sem: base.filter((c) => passaPessoa(c, "sem")).length,
  };
  const visivel = (c: Card) => passaOutros(c) && passaPessoa(c, pessoa);
  const filtrando = pessoa !== "todas" || comPost !== null || etiquetas.length > 0;

  // ─── Arrastar e soltar (HTML5 nativo) ───────────────────────────────────

  const iniciarArraste = (e: DragEvent<HTMLElement>, card: Card) => {
    const origem = sel.colunaDoCard(card);
    // Recebidos e Problemas nem começam a arrastar: o motivo aparece na hora.
    if (origem === "recebidos" || origem === "problemas") {
      e.preventDefault();
      const r = sel.podeMover(card, origem === "recebidos" ? "afazer" : "andamento");
      if (!r.ok) acoes.avisar(r.motivo, "erro");
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
    setArrastando(card);
  };

  const encerrarArraste = () => {
    setArrastando(null);
    setSobre(null);
  };

  const soltar = (e: DragEvent<HTMLElement>, destino: Coluna) => {
    e.preventDefault();
    const id = arrastando?.id ?? e.dataTransfer.getData("text/plain");
    encerrarArraste();
    if (!id) return;
    const card = sel.cardPorId(id);
    if (!card || sel.colunaDoCard(card) === destino) return;
    // moverCard valida em regras.ts e, se barrar, já mostra o que falta (K7).
    acoes.moverCard(id, destino);
  };

  const abrir = (card: Card) => {
    if (sel.colunaDoCard(card) === "recebidos") navegar("tarefas", "pedidos", { card: card.id });
    else navegar("tarefas", "quadro", { card: card.id });
  };

  return (
    <>
      <CabecalhoArea area="tarefas" aba="quadro" />

      {/* Filtros à esquerda e "+ Nova tarefa" à direita, na mesma linha (proposta 4.2 item 7). */}
      <div className="animate-rise mt-8 flex flex-wrap items-center gap-2" style={{ animationDelay: "60ms" }}>
        <GrupoPilulas
          rotulo="Pessoas"
          opcoes={[
            { id: "todas", label: "Todas", n: contagem.todas },
            { id: "minhas", label: "Minhas", n: contagem.minhas },
            { id: "sem", label: "Sem responsável", n: contagem.sem },
          ]}
          ativa={pessoa}
          onEscolher={(id) => setPessoa(id as FiltroPessoa)}
        />
        <GrupoPilulas
          rotulo="Post"
          opcoes={[
            { id: "com", label: "Com post" },
            { id: "sem", label: "Sem post" },
          ]}
          ativa={comPost}
          // Clicar na opção ativa desliga o filtro.
          onEscolher={(id) => setComPost((atual) => (atual === id ? null : (id as FiltroPost)))}
        />
        <FiltroEtiquetas escolhidas={etiquetas} onMudar={setEtiquetas} />
        {filtrando && (
          <button
            type="button"
            onClick={() => {
              setPessoa("todas");
              setComPost(null);
              setEtiquetas([]);
            }}
            className="px-2 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:text-accent"
          >
            Limpar filtros
          </button>
        )}
        <button
          type="button"
          onClick={() => setNovaAberta(true)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
        >
          <Plus className="h-4 w-4" /> Nova tarefa
        </button>
      </div>

      {/* No celular e no tablet as colunas rolam de lado; a partir de 1280px cabem as cinco. */}
      <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 xl:mx-0 xl:grid xl:snap-none xl:grid-cols-5 xl:overflow-visible xl:px-0">
        {COLUNAS.map((coluna, ci) => {
          const cards = porColuna[coluna.id].filter(visivel).sort(porPrazo);
          const total = porColuna[coluna.id].length;
          const permitido = arrastando ? sel.podeMover(arrastando, coluna.id).ok : false;
          const origem = arrastando ? sel.colunaDoCard(arrastando) === coluna.id : false;
          const alvo = sobre === coluna.id && !origem;

          return (
            <section
              key={coluna.id}
              aria-labelledby={`col-${coluna.id}`}
              onDragOver={(e) => {
                if (!arrastando) return;
                // Aceita soltar em qualquer coluna: se a regra barrar, a mensagem explica o porquê.
                e.preventDefault();
                e.dataTransfer.dropEffect = permitido || origem ? "move" : "none";
                if (sobre !== coluna.id) setSobre(coluna.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSobre(null);
              }}
              onDrop={(e) => soltar(e, coluna.id)}
              className={cn(
                "animate-rise flex w-[80vw] max-w-[300px] shrink-0 snap-start flex-col gap-3 rounded-2xl transition-all duration-300 xl:w-auto xl:max-w-none",
                coluna.id === "problemas" && "xl:border-l xl:border-dashed xl:border-border xl:pl-4",
                arrastando && !origem && !permitido && "opacity-55",
                alvo && permitido && "bg-sky-soft/50 ring-2 ring-sky/60 ring-offset-4 ring-offset-background",
              )}
              style={{ animationDelay: `${(ci + 1) * 60}ms` }}
            >
              <header className="border-b border-border px-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", MARCADOR_COLUNA[coluna.id])} aria-hidden />
                  <h2 id={`col-${coluna.id}`} className="font-display text-[15px] font-bold text-primary">
                    {coluna.label}
                  </h2>
                  <span className="ml-auto font-display text-sm font-semibold tabular-nums text-muted-foreground">
                    {filtrando && cards.length !== total ? `${cards.length} de ${total}` : total}
                  </span>
                </div>
                {DICA[coluna.id] &&
                  (coluna.id === "recebidos" ? (
                    <a href={hrefDe("tarefas", "pedidos")} className="mt-1 inline-block text-[11px] text-muted-foreground hover:text-accent">
                      {DICA[coluna.id]}
                    </a>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted-foreground">{DICA[coluna.id]}</p>
                  ))}
              </header>

              <div className="flex min-h-32 flex-col gap-3">
                {cards.map((card, i) => (
                  <CardTarefa
                    key={card.id}
                    card={card}
                    coluna={coluna.id}
                    indice={ci + i + 2}
                    arrastando={arrastando?.id === card.id}
                    onAbrir={abrir}
                    onDragStart={iniciarArraste}
                    onDragEnd={encerrarArraste}
                  />
                ))}

                {cards.length === 0 && (
                  <p className="px-1 pt-1 text-xs text-muted-foreground/80">
                    {total > 0 ? "Nenhum card com estes filtros." : VAZIA[coluna.id]}
                  </p>
                )}

                {coluna.id === "afazer" && (
                  <button
                    type="button"
                    onClick={() => setNovaAberta(true)}
                    className="inline-flex items-center justify-center gap-1 rounded-2xl border-[1.5px] border-dashed border-border px-4 py-2.5 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:border-sky hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar tarefa
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {novaAberta && <NovaTarefaDialog onFechar={() => setNovaAberta(false)} onCriado={() => setNovaAberta(false)} />}
      {cardAberto && <DetalheCard cardId={cardAberto} onFechar={() => navegar("tarefas", "quadro")} />}
    </>
  );
}

// ─── Filtros ──────────────────────────────────────────────────────────────

function GrupoPilulas({
  rotulo,
  opcoes,
  ativa,
  onEscolher,
}: {
  rotulo: string;
  opcoes: { id: string; label: string; n?: number }[];
  ativa: string | null;
  onEscolher: (id: string) => void;
}) {
  return (
    <div role="group" aria-label={rotulo} className="inline-flex items-center gap-1 rounded-full bg-card p-1 shadow-card">
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onEscolher(o.id)}
          aria-pressed={ativa === o.id}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 font-display text-xs font-bold transition-all duration-300",
            ativa === o.id ? "bg-navy-soft text-primary" : "text-muted-foreground hover:text-primary",
          )}
        >
          {o.label}
          {o.n !== undefined && <span className="ml-1 font-semibold tabular-nums opacity-60">{o.n}</span>}
        </button>
      ))}
    </div>
  );
}

/** Etiquetas num menu pequeno: o card tem QUALQUER uma das escolhidas. */
function FiltroEtiquetas({ escolhidas, onMudar }: { escolhidas: string[]; onMudar: (ids: string[]) => void }) {
  const { sel, papel } = useHub();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  const ativas = sel.etiquetasAtivas();
  const alternar = (id: string) =>
    onMudar(escolhidas.includes(id) ? escolhidas.filter((x) => x !== id) : [...escolhidas, id]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="true"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-xs font-bold shadow-card transition-all duration-300",
          escolhidas.length ? "bg-navy-soft text-primary" : "bg-card text-muted-foreground hover:text-primary",
        )}
      >
        <Tag aria-hidden className="h-3.5 w-3.5" />
        Etiquetas
        {escolhidas.length > 0 && <span className="tabular-nums opacity-70">{escolhidas.length}</span>}
        <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 transition-transform duration-300", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="animate-rise absolute left-0 top-full z-30 mt-2 w-60 rounded-2xl bg-card p-2 shadow-float">
          <ul className="max-h-72 overflow-y-auto">
            {ativas.map((e) => {
              const marcada = escolhidas.includes(e.id);
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    aria-pressed={marcada}
                    onClick={() => alternar(e.id)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors duration-300 hover:bg-muted"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors duration-300",
                        marcada ? "border-primary bg-primary" : "border-border",
                      )}
                    >
                      {marcada && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                    </span>
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.cor }} />
                    <span className="truncate">{e.nome}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 flex items-center justify-between border-t border-border px-2.5 pt-2">
            {/* Etiquetas se gerenciam em Configurações, que é só do admin (proposta 7). */}
            {papel === "admin" ? (
              <a href={hrefDe("configuracoes", "etiquetas")} className="text-[11px] text-muted-foreground hover:text-accent">
                Gerenciar etiquetas
              </a>
            ) : (
              <span className="text-[11px] text-muted-foreground/80">Quem administra cria etiquetas novas</span>
            )}
            {escolhidas.length > 0 && (
              <button type="button" onClick={() => onMudar([])} className="font-display text-[11px] font-bold text-accent">
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
