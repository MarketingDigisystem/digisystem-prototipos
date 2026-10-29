/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/estudio.tsx (envio para aprovação),
 *   src/components/planejamento/EditarTarefaDialog.tsx (rótulos e botão laranja)
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Proposta 4.6, caminho 3: o post vai para a aprovação sem estar em card. Em
 * vez de criar o card em silêncio, o Hub pergunta "Associar a um card
 * existente ou criar um novo?", com "Criar um card novo" já marcado. O card
 * novo nasce em Em andamento, mostrando "Enviado para aprovação".
 */
import { useEffect, useId, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { novoId, useHub, type Destino } from "../store/HubStore";
import { ddmm } from "../store/regras";
import type { Card, Post } from "../store/tipos";
import { campo, rotulo } from "./NovaTarefaDialog";

// Com modo="associar" (Meus posts, proposta 4.6 caminhos 1 e 2) o mesmo diálogo
// só põe o post no Quadro, sem enviar: associa a um card ou subtarefa existente,
// ou cria um card com este post em Em andamento.
type Opcao = "novo" | "existente";

export function EnviarSemCardDialog({
  post,
  dataSugerida,
  onFechar,
  onEnviado,
  modo = "enviar",
  opcaoInicial = "novo",
}: {
  post: Post;
  dataSugerida?: string;
  onFechar: () => void;
  /** Chamado com o id do card onde o post ficou. */
  onEnviado: (cardId: string) => void;
  /** "enviar" = pergunta do envio (4.6 caminho 3); "associar" = só põe no Quadro. */
  modo?: "enviar" | "associar";
  opcaoInicial?: Opcao;
}) {
  const { dados, usuario, sel, acoes } = useHub();
  const idTitulo = useId();
  const associando = modo === "associar";
  const [opcao, setOpcao] = useState<Opcao>(opcaoInicial);
  const [tituloCard, setTituloCard] = useState(post.titulo);
  const [busca, setBusca] = useState("");
  const [itemId, setItemId] = useState<string>("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const onTecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onTecla);
    return () => window.removeEventListener("keydown", onTecla);
  }, [onFechar]);

  // Cards em A fazer ou Em andamento, com os itens que ainda aceitam este post (K4).
  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return dados.cards
      .filter((c) => {
        const col = sel.colunaDoCard(c);
        return col === "afazer" || col === "andamento";
      })
      .map((c) => {
        const itens = [
          { id: c.id, titulo: "O próprio card", nivel: 1 },
          ...sel.subtarefasDoCard(c.id).map((s) => ({ id: s.id, titulo: s.titulo, nivel: s.parentId ? 3 : 2 })),
        ].filter((i) => sel.podeAssociar(post, i.id).ok);
        return { card: c, itens };
      })
      .filter((g) => g.itens.length > 0)
      .filter(
        (g) => !termo || g.card.titulo.toLowerCase().includes(termo) || g.itens.some((i) => i.titulo.toLowerCase().includes(termo)),
      );
  }, [dados.cards, busca, post, sel]);

  const confirmar = () => {
    let destino: Destino;
    let cardId: string;
    if (opcao === "novo") {
      if (!tituloCard.trim()) {
        setErro("Dê um título ao card.");
        return;
      }
      const card: Card = {
        id: novoId("c"),
        titulo: tituloCard.trim(),
        descricao: "",
        etiquetas: post.trendId ? ["e-post", "e-tendencia"] : ["e-post"],
        responsavelId: usuario.id,
        prazo: dataSugerida,
        origem: "estudio",
        trendId: post.trendId,
        colunaBase: "andamento",
        criadoPor: usuario.id,
        criadoEm: acoes.agora(),
      };
      destino = { tipo: "novo", card };
      cardId = card.id;
    } else {
      const item = itemId ? sel.itemPorId(itemId) : undefined;
      if (!item) {
        setErro("Escolha o card ou a subtarefa onde o post vai ficar.");
        return;
      }
      destino = { tipo: "existente", itemId };
      cardId = item.card.id;
    }
    if (associando) {
      // Só põe no Quadro (4.6 caminhos 1 e 2): sem enviar para a aprovação.
      if (destino.tipo === "novo") {
        const c = destino.card;
        const novo = acoes.criarCard({
          titulo: c.titulo,
          etiquetas: c.etiquetas,
          responsavelId: c.responsavelId,
          prazo: c.prazo,
          origem: c.origem,
          trendId: c.trendId,
          colunaBase: "andamento",
        });
        if (acoes.associarPost(post.id, novo).ok) {
          acoes.avisar("Card criado em Em andamento, já com este post.");
          onEnviado(novo);
        }
        return;
      }
      if (acoes.associarPost(post.id, destino.itemId).ok) onEnviado(cardId);
      return;
    }
    if (acoes.enviarPost(post.id, dataSugerida, destino).ok) onEnviado(cardId);
  };

  const radio = (valor: Opcao, titulo: string, texto: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={opcao === valor}
      onClick={() => {
        setOpcao(valor);
        setErro("");
      }}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
        opcao === valor ? "border-accent bg-orange-soft/40 ring-1 ring-accent/40" : "border-border bg-background hover:-translate-y-0.5",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2",
          opcao === valor ? "border-accent" : "border-muted-foreground/40",
        )}
      >
        {opcao === valor && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      <span>
        <span className="block font-display text-sm font-bold text-primary">{titulo}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{texto}</span>
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label="Fechar" onClick={onFechar} className="absolute inset-0 bg-primary/25 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="animate-rise relative flex max-h-[90vh] w-full flex-col rounded-t-3xl bg-card shadow-float sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 id={idTitulo} className="font-display text-xl font-bold text-primary">
              {associando ? "Em qual card este post vai ficar?" : "Este post ainda não está em nenhum card"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {associando
                ? "Escolha um card ou uma subtarefa que já existe, ou crie um card com este post. O card vai para Em andamento."
                : "Associar a um card existente ou criar um novo? Assim ele aparece no Quadro e nas métricas do time."}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div role="radiogroup" aria-label="Onde o post vai ficar" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-2 pt-5">
          {radio(
            "novo",
            associando ? "Criar card com este post" : "Criar um card novo",
            "O card nasce em Em andamento, com você como responsável e a etiqueta Post.",
          )}
          {opcao === "novo" && (
            <label className="animate-rise block pl-1">
              <span className={rotulo}>Título do card</span>
              <input
                value={tituloCard}
                onChange={(e) => {
                  setTituloCard(e.target.value);
                  setErro("");
                }}
                className={campo}
              />
              {dataSugerida && (
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  Entrega do card: {ddmm(dataSugerida)}, a data sugerida do post.
                </span>
              )}
            </label>
          )}

          {radio(
            "existente",
            "Associar a um card existente",
            associando
              ? "Card em A fazer ou Em andamento, ou uma subtarefa dele que ainda não tem post."
              : "Para quando já existe um card para este post e faltou associar.",
          )}
          {opcao === "existente" && (
            <div className="animate-rise space-y-2 pl-1">
              <label className="relative block">
                <span className="sr-only">Buscar card</span>
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar card ou subtarefa"
                  className={cn(campo, "mt-0 pl-8")}
                />
              </label>
              {grupos.length === 0 ? (
                <p className="rounded-2xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
                  Nenhum card em A fazer ou Em andamento tem lugar livre para este post.
                </p>
              ) : (
                <ul className="max-h-60 space-y-1 overflow-y-auto rounded-2xl border border-border bg-background p-2">
                  {grupos.map(({ card, itens }) => (
                    <li key={card.id} className="py-1">
                      <p className="flex items-center justify-between gap-2 px-2 pb-1 font-display text-xs font-bold text-primary">
                        <span className="truncate">{card.titulo}</span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {sel.colunaDoCard(card) === "afazer" ? "A fazer" : "Em andamento"}
                        </span>
                      </p>
                      <ul>
                        {itens.map((i) => (
                          <li key={i.id}>
                            <button
                              type="button"
                              aria-pressed={itemId === i.id}
                              onClick={() => {
                                setItemId(i.id);
                                setErro("");
                              }}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm transition-colors duration-300",
                                i.nivel === 3 && "pl-7",
                                i.nivel === 2 && "pl-4",
                                itemId === i.id ? "bg-navy-soft font-semibold text-primary" : "text-foreground hover:bg-card",
                              )}
                            >
                              <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0 rounded-full", itemId === i.id ? "bg-accent" : "bg-border")} />
                              <span className="truncate">{i.titulo}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {erro && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {erro}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full px-4 py-2.5 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            className="rounded-full bg-accent px-5 py-2.5 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
          >
            {associando
              ? opcao === "novo"
                ? "Criar card com este post"
                : "Associar"
              : opcao === "novo"
                ? "Criar card e enviar"
                : "Associar e enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
