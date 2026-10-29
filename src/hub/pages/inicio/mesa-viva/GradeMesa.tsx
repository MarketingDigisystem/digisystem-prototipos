/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/tarefas/QuadroHub.tsx e CardKanban.tsx (padrão dnd-kit:
 *   sensores, Announcements pt-BR, DragOverlay, CSS.Translate) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 * Revisado em 2026-10-27 (noite): disposição livre em colunas (decisão 8) e só Acordeão (decisão 2).
 *
 * A mesa é uma sequência de seções: card largo (largura toda) ou bloco de
 * duas colunas INDEPENDENTES. Cada coluna é uma pilha flex própria, então um
 * card fica colado no de cima da mesma coluna, não importa a altura da outra
 * (acaba o "buraco" da grade por linhas).
 *
 * Arrastar (só no modo Reorganizar):
 *  - card normal: receita "multiple containers" do dnd-kit. Cada coluna é um
 *    container; no onDragOver o card muda de lugar AO VIVO no estado de
 *    trabalho (dentro da coluna, para a outra coluna, para coluna vazia, entre
 *    blocos). A vaga (nó original, tracejado azul) mostra onde ele vai cair;
 *    os vizinhos animam pela transformação derivada (FLIP) do useSortable.
 *    Decisão de mesa: o ponto que manda é o ponteiro (ou o canto do card no
 *    teclado), acima/abaixo do meio do card de baixo dele. Sem oscilação.
 *  - card largo: lista vertical de seções (verticalListSortingStrategy) e,
 *    ao soltar, a seção muda de lugar e os blocos vizinhos se juntam.
 *  - levantar com escala 1,025 e giro -1° (DragOverlay), encaixe com overshoot.
 */
import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type ClientRect,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, defaultAnimateLayoutChanges, useSortable, verticalListSortingStrategy, type AnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../../../../lib/utils";
import { useMovimentoReduzido } from "./anim";
import { CATALOGO, type CardId } from "./catalogo";
import type { Casca } from "./CardMesa";
import { chaveColuna, containerDe, moverNoTrabalho, type ColunasTrabalho, type Lado, type SecaoVista } from "./layout";

export type CascaSemAlca = Omit<Casca, "alca" | "indiceEntrada">;

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  args.isSorting || args.wasDragging ? defaultAnimateLayoutChanges({ ...args, wasDragging: true }) : false;

/** Dentro das colunas, a pilha reflui de verdade a cada troca; os irmãos animam pelo FLIP. */
const estrategiaNula = () => null;

const titulo = (id: UniqueIdentifier) => CATALOGO[id as CardId]?.titulo ?? "Card";
const tipoDe = (d: { current?: { tipo?: string } | null } | undefined) => d?.current?.tipo;

type Ponto = { x: number; y: number };
const contem = (r: ClientRect, p: Ponto) => p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;

/** Colunas da vista em ordem lógica (para o teclado andar coluna a coluna). */
const ordemDasColunas = (vista: SecaoVista[]) =>
  vista.flatMap((v) => (v.tipo === "colunas" ? [chaveColuna(v.chave, "esq"), chaveColuna(v.chave, "dir")] : []));

export function GradeMesa({
  vista,
  componentes,
  casca,
  destaque,
  onSoltarColunas,
  onMoverLargo,
  onArrastando,
  reorganizar,
  rodapeGrade,
}: {
  /** Seções já filtradas por papel (vistaDaMesa). */
  vista: SecaoVista[];
  /** Modo Reorganizar: fora dele o arrastar fica desligado (nenhum card sai do lugar sem querer). */
  reorganizar: boolean;
  /** Avisa quando um arrastar começa/termina (o Esc do arrastar não sai do modo). */
  onArrastando?: (arrastando: boolean) => void;
  componentes: Record<CardId, ComponentType<{ casca: Casca }>>;
  casca: (id: CardId) => CascaSemAlca;
  destaque: Set<CardId>;
  /** Card normal solto: colunas finais (só visíveis). */
  onSoltarColunas: (t: ColunasTrabalho, ativo: CardId) => void;
  /** Card largo solto sobre a seção `indiceSecao` (índice em arranjo.secoes). */
  onMoverLargo: (id: CardId, indiceSecao: number) => void;
  /** Bloco "+ Adicionar card" depois das seções. */
  rodapeGrade?: ReactNode;
}) {
  const reduzido = useMovimentoReduzido();
  const [ativo, setAtivo] = useState<{ id: CardId; largo: boolean } | null>(null);
  const [trabalho, setTrabalhoEstado] = useState<ColunasTrabalho | null>(null);
  // Espelhos em ref: colisão, teclado e onDragEnd leem o estado mais novo.
  const refTrabalho = useRef<ColunasTrabalho | null>(null);
  const setTrabalho = (t: ColunasTrabalho | null) => {
    refTrabalho.current = t;
    setTrabalhoEstado(t);
  };
  const refVista = useRef(vista);
  refVista.current = vista;
  const refPonto = useRef<Ponto | null>(null);
  const ultimoAlvo = useRef<UniqueIdentifier | null>(null);
  const mudouDeColuna = useRef(false);
  const refSobreLargo = useRef<number>(-1);

  // Depois do render que trocou o card de coluna, a colisão volta a valer.
  useEffect(() => {
    const r = requestAnimationFrame(() => {
      mudouDeColuna.current = false;
    });
    return () => cancelAnimationFrame(r);
  }, [trabalho]);

  const colunasDaVista = (): ColunasTrabalho => {
    const t: ColunasTrabalho = {};
    for (const v of refVista.current) {
      if (v.tipo !== "colunas") continue;
      t[chaveColuna(v.chave, "esq")] = v.esquerda;
      t[chaveColuna(v.chave, "dir")] = v.direita;
    }
    return t;
  };
  const trabalhoAtual = () => refTrabalho.current ?? colunasDaVista();

  // ─── Colisão ────────────────────────────────────────────────────────────
  const colisao: CollisionDetection = (args) => {
    const { active, droppableContainers, droppableRects, collisionRect, pointerCoordinates } = args;
    if (tipoDe(active.data) === "largo") {
      return closestCenter({ ...args, droppableContainers: droppableContainers.filter((c) => ["secao", "largo"].includes(tipoDe(c.data) ?? "")) });
    }
    // Ponto que manda: o ponteiro; no teclado, o canto de cima do card levantado.
    const ponto = pointerCoordinates ?? { x: collisionRect.left + 2, y: collisionRect.top + 2 };
    refPonto.current = ponto;
    const t = trabalhoAtual();
    const cards = droppableContainers.filter((c) => tipoDe(c.data) === "card");
    const colunas = droppableContainers.filter((c) => tipoDe(c.data) === "coluna");
    const rect = (id: UniqueIdentifier) => droppableRects.get(id);

    let alvo: UniqueIdentifier | null = null;
    const card = cards.find((c) => {
      const r = rect(c.id);
      return r && contem(r, ponto);
    });
    if (card) alvo = card.id;
    else {
      const distV = (r: ClientRect) => (ponto.y < r.top ? r.top - ponto.y : ponto.y > r.bottom ? ponto.y - r.bottom : 0);
      // Dentro de uma coluna; se não, a coluna mais perto na vertical sob o mesmo x
      // (ex.: soltar logo abaixo do último card da coluna mais alta, fora do bloco).
      let coluna = colunas.find((c) => {
        const r = rect(c.id);
        return r && contem(r, ponto);
      });
      if (!coluna) {
        let perto: { c: (typeof colunas)[number]; d: number } | null = null;
        for (const c of colunas) {
          const r = rect(c.id);
          if (!r || ponto.x < r.left || ponto.x > r.right) continue;
          const d = distV(r);
          if (!perto || d < perto.d) perto = { c, d };
        }
        // Só perto o bastante (um vão entre seções), para não "puxar" de longe.
        if (perto && perto.d <= 160) coluna = perto.c;
      }
      if (coluna) {
        // Espaço livre da coluna: o card mais perto na vertical (ex.: logo abaixo de "Para ajustar").
        const itens = t[String(coluna.id)] ?? [];
        let melhor: { id: UniqueIdentifier; d: number } | null = null;
        for (const id of itens) {
          const r = rect(id);
          if (!r) continue;
          const d = ponto.y < r.top ? r.top - ponto.y : ponto.y > r.bottom ? ponto.y - r.bottom : 0;
          if (!melhor || d < melhor.d) melhor = { id, d };
        }
        alvo = melhor?.id ?? coluna.id;
      }
    }
    if (alvo != null) {
      ultimoAlvo.current = alvo;
      return [{ id: alvo }];
    }
    if (mudouDeColuna.current) ultimoAlvo.current = active.id;
    return ultimoAlvo.current != null ? [{ id: ultimoAlvo.current }] : [];
  };

  // ─── Teclado na alça ────────────────────────────────────────────────────
  // ↑↓ andam na ordem lógica (coluna a coluna); ← → trocam de coluna no bloco.
  const coordenadasTeclado = useRef<KeyboardCoordinateGetter>((event, { context }) => {
    const { active, droppableRects, collisionRect } = context;
    const dir = ({ ArrowUp: "cima", ArrowDown: "baixo", ArrowLeft: "esq", ArrowRight: "dir" } as Record<string, string>)[event.code];
    if (!dir || !active || !collisionRect) return undefined;
    event.preventDefault();
    const id = active.id as CardId;
    const vistaAtual = refVista.current;

    if (tipoDe(active.data) === "largo") {
      if (dir !== "cima" && dir !== "baixo") return undefined;
      const chaves = vistaAtual.map((v) => v.chave);
      const atual = refSobreLargo.current >= 0 ? refSobreLargo.current : chaves.indexOf(id);
      const prox = chaves[atual + (dir === "baixo" ? 1 : -1)];
      const r = prox ? droppableRects.get(prox) : undefined;
      if (!r) return undefined;
      return { x: collisionRect.left, y: dir === "baixo" ? r.bottom - collisionRect.height : r.top };
    }

    const t = trabalhoAtual();
    const k = containerDe(t, id);
    if (!k) return undefined;
    const lista = t[k];
    const i = lista.indexOf(id);
    const antes = (alvo: UniqueIdentifier) => {
      const r = droppableRects.get(alvo);
      return r ? { x: r.left, y: r.top } : undefined;
    };
    const depois = (alvo: UniqueIdentifier) => {
      const r = droppableRects.get(alvo);
      return r ? { x: r.left, y: r.top + r.height / 2 + 2 } : undefined;
    };
    const coluna = (chave: string) => {
      const r = droppableRects.get(chave);
      return r ? { x: r.left, y: r.top } : undefined;
    };
    if (dir === "baixo" && i < lista.length - 1) return depois(lista[i + 1]);
    if (dir === "cima" && i > 0) return antes(lista[i - 1]);
    if (dir === "baixo" || dir === "cima") {
      const ordem = ordemDasColunas(vistaAtual);
      const vizinha = ordem[ordem.indexOf(k) + (dir === "baixo" ? 1 : -1)];
      if (!vizinha) return undefined;
      const itens = t[vizinha] ?? [];
      if (itens.length === 0) return coluna(vizinha);
      return dir === "baixo" ? antes(itens[0]) : depois(itens[itens.length - 1]);
    }
    const [chave, lado] = k.split("|") as [string, Lado];
    const para = dir === "esq" ? "esq" : "dir";
    if (lado === para) return undefined;
    const outra = chaveColuna(chave, para);
    const itens = t[outra] ?? [];
    if (itens.length === 0) return coluna(outra);
    return i < itens.length ? antes(itens[i]) : depois(itens[itens.length - 1]);
  });

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: coordenadasTeclado.current }),
  );

  // ─── Anúncios ───────────────────────────────────────────────────────────
  const descrever = (id: UniqueIdentifier) => {
    const v = refVista.current;
    const t = trabalhoAtual();
    const k = containerDe(t, String(id));
    if (!k) {
      const n = v.findIndex((s) => s.tipo === "largo" && s.id === id);
      return `está no bloco ${n + 1} de ${v.length}`;
    }
    const [chave, lado] = k.split("|");
    const comCards = v.filter((s) => s.tipo === "colunas" && (t[chaveColuna(s.chave, "esq")]?.length || t[chaveColuna(s.chave, "dir")]?.length));
    const b = comCards.findIndex((s) => s.chave === chave);
    const bloco = comCards.length > 1 && b >= 0 ? `, bloco ${b + 1} de ${comCards.length}` : "";
    return `está na coluna da ${lado === "esq" ? "esquerda" : "direita"}, posição ${t[k].indexOf(id as CardId) + 1} de ${t[k].length}${bloco}`;
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Você pegou ${titulo(active.id)}. Ele ${descrever(active.id)}.`,
    onDragOver: ({ active }) => `${titulo(active.id)} ${descrever(active.id)}.`,
    onDragEnd: ({ active }) => `${titulo(active.id)} ${descrever(active.id).replace(/^está/, "ficou")}.`,
    onDragCancel: ({ active }) => `Movimento cancelado. ${titulo(active.id)} voltou para onde estava.`,
  };

  const dropAnimation: DropAnimation | null = reduzido
    ? null
    : {
        duration: 220,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.35" } } }),
      };

  // ─── Ciclo do arrastar ──────────────────────────────────────────────────
  const inicio = ({ active }: DragStartEvent) => {
    onArrastando?.(true);
    const largo = tipoDe(active.data) === "largo";
    setAtivo({ id: active.id as CardId, largo });
    ultimoAlvo.current = null;
    refSobreLargo.current = largo ? refVista.current.findIndex((s) => s.chave === active.id) : -1;
    setTrabalho(largo ? null : colunasDaVista());
  };

  const sobre = ({ active, over }: DragOverEvent) => {
    if (tipoDe(active.data) === "largo") {
      if (over) refSobreLargo.current = refVista.current.findIndex((s) => s.chave === over.id);
      return;
    }
    const t = refTrabalho.current;
    if (!t || !over || over.id === active.id) return;
    const id = active.id as CardId;
    const de = containerDe(t, id);
    const para = containerDe(t, String(over.id));
    if (!de || !para) return;
    let indice: number;
    if (String(over.id) === para) {
      indice = t[para].filter((x) => x !== id).length; // coluna: vai para o fim
    } else {
      const semEle = t[para].filter((x) => x !== id);
      const r = over.rect;
      const p = refPonto.current;
      const abaixo = p ? p.y > r.top + r.height / 2 : false;
      indice = semEle.indexOf(over.id as CardId) + (abaixo ? 1 : 0);
    }
    const novo = moverNoTrabalho(t, id, para, indice);
    if (novo === t) return;
    if (de !== para) mudouDeColuna.current = true;
    setTrabalho(novo);
  };

  const encerrar = () => {
    setAtivo(null);
    setTrabalho(null);
    refSobreLargo.current = -1;
    // Depois do Esc/soltar deste mesmo evento de teclado.
    window.setTimeout(() => onArrastando?.(false), 0);
  };

  const fim = ({ active, over }: DragEndEvent) => {
    const id = active.id as CardId;
    if (tipoDe(active.data) === "largo") {
      const alvo = over ? refVista.current.find((s) => s.chave === over.id) : undefined;
      encerrar();
      if (alvo && over?.id !== id) onMoverLargo(id, alvo.indice);
      return;
    }
    const final = refTrabalho.current;
    encerrar();
    if (final) onSoltarColunas(final, id);
  };

  const render = ativo ? componentes[ativo.id] : null;
  const t = trabalho;
  const colunaDe = (v: Extract<SecaoVista, { tipo: "colunas" }>, lado: Lado) => t?.[chaveColuna(v.chave, lado)] ?? (lado === "esq" ? v.esquerda : v.direita);
  // Índice de entrada (animação escalonada) pela ordem lógica.
  const ordem = vista.flatMap((v) => (v.tipo === "largo" ? [v.id] : [...colunaDe(v, "esq"), ...colunaDe(v, "dir")]));

  const item = (id: CardId, tipo: "card" | "largo", lado?: Lado) => (
    <ItemSortavel
      key={id}
      id={id}
      tipo={tipo}
      lado={lado}
      Componente={componentes[id]}
      casca={{ ...casca(id), indiceEntrada: ordem.indexOf(id) + 3 }}
      arrastandoAlgum={ativo !== null}
      reduzido={reduzido}
      destacado={destaque.has(id)}
    />
  );

  return (
    <DndContext
      sensors={sensores}
      collisionDetection={colisao}
      // Os retângulos mudam a cada troca de coluna: medir sempre.
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={inicio}
      onDragOver={sobre}
      onDragEnd={fim}
      onDragCancel={encerrar}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: "Para pegar o card, aperte Espaço. Use as setas para mover (esquerda e direita trocam de coluna) e Espaço de novo para soltar. Esc cancela.",
        },
      }}
    >
      <p id="mmv-instrucoes" className="sr-only">
        {reorganizar
          ? "Use as setas de cada card para mudar a ordem e de coluna, ou a alça para arrastar."
          : "Para mudar a ordem, o tamanho ou ocultar cards, use o botão Reorganizar."}
      </p>
      <SortableContext id="secoes" items={vista.map((v) => v.chave)} strategy={verticalListSortingStrategy}>
        <div role="list" aria-label="Cards da sua mesa" aria-describedby="mmv-instrucoes" className="flex flex-col gap-5">
          {vista.map((v) => {
            if (v.tipo === "largo") return item(v.id, "largo");
            const esq = colunaDe(v, "esq");
            const dir = colunaDe(v, "dir");
            // Fora do modo, bloco e coluna vazios nem entram no DOM (sem vão fantasma).
            if (!reorganizar && esq.length === 0 && dir.length === 0) return null;
            return (
              <Bloco key={v.chave} chave={v.chave} reorganizar={reorganizar} vazio={esq.length === 0 && dir.length === 0}>
                {(["esq", "dir"] as const).map((lado) => {
                  const ids = lado === "esq" ? esq : dir;
                  if (!reorganizar && ids.length === 0) return null;
                  return (
                    <Coluna key={lado} id={chaveColuna(v.chave, lado)} lado={lado} ids={ids} reorganizar={reorganizar}>
                      {ids.map((id) => item(id, "card", lado))}
                    </Coluna>
                  );
                })}
              </Bloco>
            );
          })}
        </div>
      </SortableContext>
      {rodapeGrade}
      <DragOverlay dropAnimation={dropAnimation}>
        {ativo && render
          ? (() => {
              const R = render;
              return <R casca={{ ...casca(ativo.id), indiceEntrada: 0, sobreposicao: true }} />;
            })()
          : null}
      </DragOverlay>
    </DndContext>
  );
}

/** Bloco de duas colunas. É item da lista de seções (alvo do card largo), nunca arrastável. */
function Bloco({ chave, reorganizar, vazio, children }: { chave: string; reorganizar: boolean; vazio: boolean; children: ReactNode }) {
  const { setNodeRef, transform, transition } = useSortable({
    id: chave,
    data: { tipo: "secao" },
    disabled: { draggable: true, droppable: !reorganizar },
  });
  return (
    <div
      ref={setNodeRef}
      role="none"
      data-secao={chave}
      style={{ transform: CSS.Translate.toString(transform), transition: transition ?? undefined }}
      // Bloco todo vazio no celular: some (lá não há arrastar, só as setas).
      className={cn("grid gap-5 lg:grid-cols-2", vazio && "max-sm:hidden")}
    >
      {children}
    </div>
  );
}

/** Coluna: container do arrastar. Vazia no modo Reorganizar vira zona de soltar. */
function Coluna({ id, lado, ids, reorganizar, children }: { id: string; lado: Lado; ids: CardId[]; reorganizar: boolean; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { tipo: "coluna" }, disabled: !reorganizar });
  return (
    <SortableContext id={id} items={ids} strategy={estrategiaNula}>
      <div
        ref={setNodeRef}
        role="none"
        data-coluna={id}
        className={cn("min-w-0 flex-col gap-5", ids.length === 0 ? "hidden sm:flex" : "flex", lado === "dir" && "lg:col-start-2")}
      >
        {children}
        {reorganizar && ids.length === 0 && (
          <div
            data-mmv-zona
            data-sobre={isOver}
            aria-hidden
            className="mmv-zona-vazia mmv-aparece flex min-h-24 items-center justify-center rounded-3xl border-2 border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground"
          >
            Espaço livre. Arraste um card para cá.
          </div>
        )}
      </div>
    </SortableContext>
  );
}

function ItemSortavel({
  id,
  tipo,
  lado,
  Componente,
  casca,
  arrastandoAlgum,
  reduzido,
  destacado,
}: {
  id: CardId;
  tipo: "card" | "largo";
  lado?: Lado;
  Componente: ComponentType<{ casca: Casca }>;
  casca: Omit<Casca, "alca">;
  arrastandoAlgum: boolean;
  reduzido: boolean;
  destacado: boolean;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { tipo },
    // Fora do modo Reorganizar o card não é arrastável (nem por ponteiro nem por teclado).
    disabled: !casca.reorganizar,
    animateLayoutChanges,
    transition: reduzido ? null : { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? undefined,
    // View Transitions só fora do arrastar (os dois não podem mover o mesmo nó).
    viewTransitionName: arrastandoAlgum ? undefined : `mmv-card-${id}`,
  } as CSSProperties;

  return (
    <div
      ref={setNodeRef}
      role="listitem"
      data-card-id={id}
      data-arrastavel={casca.reorganizar}
      data-lado={lado}
      data-largo={tipo === "largo" || undefined}
      style={style}
      className={cn("min-w-0 rounded-3xl", casca.reorganizar && "mmv-reorg", isDragging && "mmv-vaga", destacado && "mmv-destaque")}
    >
      <Componente casca={{ ...casca, alca: { ref: setActivatorNodeRef, listeners, attributes } }} />
    </div>
  );
}
