/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/planejamento/EditarTarefaDialog.tsx,
 *   src/components/trends/TrendDetailSheet.tsx (formato do painel lateral) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Painel lateral do card. O EditarTarefaDialog real vira painel, como o Sheet
 * das tendências (sm:max-w-[640px], cabeçalho navy-soft), e ganha o que a
 * proposta 4.2 a 4.4 pede:
 *  - título, descrição, etiquetas, responsável, início e prazo (mesmos rótulos
 *    e botão laranja "Salvar alterações" do dialog real);
 *  - avisos "Publicar hoje" e "Publicação atrasada" (K8) com o botão
 *    "Marcar como publicado" ali mesmo;
 *  - o post do próprio card e as subtarefas em até 3 níveis (SubtarefaArvore),
 *    cada item com Criar no Estúdio / Associar post salvo / Desassociar /
 *    Reenviar para aprovação (PostDoItem);
 *  - problemas abertos com o tipo e "Marcar como bloqueado" com motivo;
 *  - comentários (mock);
 *  - "Mover para", alternativa ao arraste para teclado e celular, com os
 *    mesmos bloqueios de regras.ts.
 */
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, Pencil, Trash2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { hrefDe } from "../router";
import { useHub } from "../store/HubStore";
import { COLUNAS, ddmm } from "../store/regras";
import type { Card, Etiqueta } from "../store/tipos";
import { AlertaProblema } from "./AlertaProblema";
import { Avatar, MARCADOR_COLUNA } from "./CardTarefa";
import { EtiquetasLinha } from "./EtiquetaChip";
import { LinhaProblema, MarcarBloqueado } from "./ItemProblemas";
import { campo, rotulo } from "./NovaTarefaDialog";
import { PostDoItem } from "./PostDoItem";
import { SubtarefaArvore } from "./SubtarefaArvore";

const kicker = "font-display text-[10px] font-bold uppercase tracking-[0.14em]";

/** "07/10 às 14:20" */
function dataHora(iso: string): string {
  const d = new Date(iso);
  return `${ddmm(iso)} às ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function DetalheCard({ cardId, onFechar }: { cardId: string; onFechar: () => void }) {
  const { sel } = useHub();
  const idTitulo = useId();
  const card = sel.cardPorId(cardId);

  useEffect(() => {
    const onTecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onTecla);
    return () => window.removeEventListener("keydown", onTecla);
  }, [onFechar]);

  if (!card) {
    return (
      <Painel idTitulo={idTitulo} onFechar={onFechar}>
        <div className="p-6">
          <p id={idTitulo} className="font-display text-lg font-bold text-primary">
            Card não encontrado
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Ele pode ter sido excluído ou o pedido foi negado.</p>
        </div>
      </Painel>
    );
  }

  return (
    <Painel idTitulo={idTitulo} onFechar={onFechar}>
      <ConteudoCard key={card.id} card={card} idTitulo={idTitulo} onFechar={onFechar} />
    </Painel>
  );
}

function ConteudoCard({ card, idTitulo, onFechar }: { card: Card; idTitulo: string; onFechar: () => void }) {
  const { dados, sel, acoes } = useHub();
  const [editando, setEditando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const coluna = sel.colunaDoCard(card);
  const etiquetas = card.etiquetas.map((id) => sel.etiquetaPorId(id)).filter((e): e is Etiqueta => Boolean(e));
  const responsavel = sel.usuarioPorId(card.responsavelId);
  const alerta = sel.alertaDoCard(card);
  const falta = sel.textoFalta(card);
  const nomeColuna = COLUNAS.find((c) => c.id === coluna)?.label ?? "Fora do Quadro";
  const solicitante = sel.solicitantePorId(card.pedido?.solicitanteId);
  const tendencia = dados.tendencias.find((t) => t.id === card.trendId);
  const subtarefas = sel.subtarefasDoCard(card.id);
  const postDoCard = sel.postDoItem(card.id);
  const problemas = sel.problemasAbertosDoCard(card.id);
  // Pedido ainda não decidido: o trabalho só começa depois da decisão em Pedidos.
  const pedidoAberto = card.pedido?.estado === "recebido" || card.pedido?.estado === "triagem";

  // Avisos de publicação (K8): todos os posts do card que pedem ação hoje.
  const urgentes = sel
    .postsDoCard(card.id)
    .map((p) => ({ post: p, estado: sel.estadoPost(p), item: sel.itemPorId(p.itemId ?? "") }))
    .filter((x) => x.estado.chave === "publicar_hoje" || x.estado.chave === "atrasado");

  return (
    <>
      <header className="border-b border-border bg-navy-soft px-6 py-6">
        <p className={cn(kicker, "flex items-center gap-2 text-[11px] text-accent")}>
          {coluna && <span aria-hidden className={cn("h-2 w-2 rounded-full", MARCADOR_COLUNA[coluna])} />}
          {nomeColuna}
        </p>
        <h2 id={idTitulo} className="mt-2 pr-8 font-display text-2xl font-bold leading-tight text-primary">
          {card.titulo}
        </h2>
        {(card.pedido || tendencia) && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {card.pedido && solicitante && (
              <>
                Pedido de {solicitante.nome} · {solicitante.area}.{" "}
                <a href={hrefDe("tarefas", "pedidos", { card: card.id })} className="font-semibold text-primary hover:text-accent">
                  Ver o pedido
                </a>
              </>
            )}
            {tendencia && (
              <>
                Nasceu da tendência{" "}
                <a href={hrefDe("tendencias", "tendencias", { trend: tendencia.id })} className="font-semibold text-primary hover:text-accent">
                  {tendencia.titulo}
                </a>
              </>
            )}
          </p>
        )}
        {etiquetas.length > 0 && (
          <div className="mt-3">
            <EtiquetasLinha etiquetas={etiquetas} max={8} />
          </div>
        )}
      </header>

      <div className="space-y-6 px-6 py-6">
        {editando ? (
          <EditarDados card={card} onFechar={() => setEditando(false)} />
        ) : (
          <div className="flex items-start gap-3">
            <dl className="grid flex-1 grid-cols-3 gap-3 text-sm">
              <div>
                <dt className={cn(kicker, "text-muted-foreground")}>Responsável</dt>
                <dd className="mt-1.5 flex items-center gap-2">
                  <Avatar usuario={responsavel} tamanho="h-6 w-6" />
                  <span className="truncate">{responsavel?.nome.split(" ")[0] ?? "Ninguém"}</span>
                </dd>
              </div>
              <div>
                <dt className={cn(kicker, "text-muted-foreground")}>Data de início</dt>
                <dd className="mt-1.5">{card.inicio ? ddmm(card.inicio) : "Sem data"}</dd>
              </div>
              <div>
                <dt className={cn(kicker, "text-muted-foreground")}>Data de entrega</dt>
                <dd className={cn("mt-1.5", sel.cardAtrasado(card) && "font-semibold text-accent")}>
                  {card.prazo ? ddmm(card.prazo) : "Sem prazo"}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card px-3 py-1.5 font-display text-[11px] font-bold text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5"
            >
              <Pencil aria-hidden className="h-3 w-3" /> Editar
            </button>
          </div>
        )}

        {urgentes.length > 0 && (
          <ul className="space-y-2">
            {urgentes.map(({ post, estado, item }) => {
              const atrasado = estado.chave === "atrasado";
              return (
                <li
                  key={post.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3",
                    atrasado ? "bg-destructive/[0.07]" : "bg-warning-soft",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-display text-sm font-bold", atrasado ? "text-destructive" : "text-warning")}>
                      {atrasado ? `Publicação atrasada: era para ${ddmm(post.dataPublicacao ?? "")}` : "Publicar hoje"}
                    </p>
                    <p className="truncate text-xs text-foreground/75">{item?.tipo === "subtarefa" ? item.titulo : post.titulo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => acoes.marcarPublicado(post.id)}
                    className="shrink-0 rounded-full bg-accent px-3.5 py-1.5 font-display text-[11px] font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
                  >
                    Marcar como publicado
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {(alerta || (falta && coluna !== "concluido")) && (
          <div className="space-y-2">
            {alerta && <AlertaProblema texto={alerta.texto} problemas={alerta.problemas} className="text-xs" />}
            {falta && coluna !== "concluido" && <p className="text-sm text-muted-foreground">{falta}</p>}
          </div>
        )}

        {card.descricao && !editando && (
          <section>
            <p className={cn(kicker, "text-accent")}>Descrição</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{card.descricao}</p>
          </section>
        )}

        {pedidoAberto ? (
          <section className="rounded-2xl border border-dashed border-border px-5 py-4">
            <p className="text-sm text-foreground/85">
              Este pedido ainda não foi decidido. Subtarefas e posts entram depois que alguém aprovar em Pedidos.
            </p>
            <a
              href={hrefDe("tarefas", "pedidos", { card: card.id })}
              className="mt-2 inline-flex items-center gap-1 font-display text-xs font-bold text-primary transition-colors duration-300 hover:text-accent"
            >
              Decidir em Pedidos <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            </a>
          </section>
        ) : (
          <>
            {/* O post do próprio card. Com subtarefas, os posts moram nelas (uma por post), salvo se o card já tiver o seu. */}
            {(postDoCard || subtarefas.length === 0) && (
              <section>
                <p className={cn(kicker, "text-accent")}>Post do card</p>
                <div className="mt-2">
                  <PostDoItem itemId={card.id} prazoItem={card.prazo} />
                </div>
              </section>
            )}

            <SubtarefaArvore card={card} />
          </>
        )}

        <section>
          <div className="flex items-center justify-between gap-3">
            <p className={cn(kicker, "text-accent")}>Problemas</p>
            {!pedidoAberto && <MarcarBloqueado alvo={{ tipo: "card", id: card.id }} rotuloBotao="Marcar o card como bloqueado" />}
          </div>
          {problemas.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {problemas.map((p) => (
                <LinhaProblema key={p.id} problema={p} mostrarItem />
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Nenhum problema aberto.</p>
          )}
        </section>

        <Comentarios card={card} />

        {coluna && (
          <section>
            <p className={cn(kicker, "text-muted-foreground")}>Mover para</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COLUNAS.map((c) => {
                const atual = c.id === coluna;
                const pode = sel.podeMover(card, c.id).ok;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-current={atual ? "true" : undefined}
                    onClick={() => !atual && acoes.moverCard(card.id, c.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-display text-xs font-bold transition-all duration-300",
                      atual
                        ? "bg-primary text-primary-foreground shadow-card"
                        : pode
                          ? "bg-card text-primary shadow-card hover:-translate-y-0.5"
                          : "bg-muted text-muted-foreground/70",
                    )}
                  >
                    <span aria-hidden className={cn("h-2 w-2 rounded-full", MARCADOR_COLUNA[c.id])} />
                    {c.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              As colunas em cinza não aceitam este card agora. Clique nelas para ver o motivo.
            </p>
          </section>
        )}

        <div className="flex justify-end border-t border-border pt-4">
          {confirmarExclusao ? (
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Excluir o card e as subtarefas dele?</span>
              <button
                type="button"
                onClick={() => {
                  if (acoes.excluirItem(card.id).ok) {
                    acoes.avisar("Card excluído.");
                    onFechar();
                  } else setConfirmarExclusao(false);
                }}
                className="rounded-full px-3 py-1.5 font-display text-xs font-bold text-destructive hover:bg-destructive/10"
              >
                Excluir
              </button>
              <button
                type="button"
                onClick={() => setConfirmarExclusao(false)}
                className="rounded-full px-3 py-1.5 font-display text-xs font-bold text-muted-foreground hover:text-primary"
              >
                Manter
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                const r = sel.podeExcluirItem(card.id);
                if (!r.ok) acoes.avisar(r.motivo, "erro");
                else setConfirmarExclusao(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:text-destructive"
            >
              <Trash2 aria-hidden className="h-3.5 w-3.5" /> Excluir card
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/** Edição dos dados do card, com os rótulos e o botão do EditarTarefaDialog real. */
function EditarDados({ card, onFechar }: { card: Card; onFechar: () => void }) {
  const { dados, sel, acoes } = useHub();
  const [titulo, setTitulo] = useState(card.titulo);
  const [descricao, setDescricao] = useState(card.descricao);
  const [etiquetas, setEtiquetas] = useState(card.etiquetas);
  const [inicio, setInicio] = useState(card.inicio ?? "");
  const [prazo, setPrazo] = useState(card.prazo ?? "");
  const [responsavelId, setResponsavelId] = useState(card.responsavelId ?? "");
  const [erro, setErro] = useState("");

  const alternar = (id: string) => setEtiquetas((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return setErro("Dê um título à tarefa.");
    if (inicio && prazo && prazo < inicio) return setErro("A data de entrega vem antes da data de início.");
    acoes.atualizarCard(card.id, {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      etiquetas,
      inicio: inicio || undefined,
      prazo: prazo || undefined,
      responsavelId: responsavelId || undefined,
    });
    acoes.avisar("Alterações salvas.");
    onFechar();
  };

  // Etiquetas arquivadas que o card já tinha continuam visíveis para poder tirar.
  const opcoes = [...sel.etiquetasAtivas(), ...dados.etiquetas.filter((e) => e.arquivada && card.etiquetas.includes(e.id))];

  return (
    <form onSubmit={salvar} className="animate-rise space-y-4 rounded-2xl bg-card p-5 shadow-card">
      <label className="block">
        <span className={rotulo}>Título</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Roteiro do Reels" className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Descrição</span>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Detalhes e objetivo"
          rows={3}
          className={cn(campo, "resize-none")}
        />
      </label>
      <fieldset>
        <legend className={rotulo}>Etiquetas</legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {opcoes.map((et) => {
            const ativa = etiquetas.includes(et.id);
            return (
              <button
                key={et.id}
                type="button"
                aria-pressed={ativa}
                onClick={() => alternar(et.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-semibold transition-all duration-300",
                  ativa ? "bg-navy-soft text-primary ring-1 ring-primary/30" : "bg-muted text-muted-foreground hover:text-primary",
                )}
              >
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: et.cor }} />
                {et.nome}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={rotulo}>Data de início</span>
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className={campo} />
        </label>
        <label className="block">
          <span className={rotulo}>Data de entrega</span>
          <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className={campo} />
        </label>
        <label className="block">
          <span className={rotulo}>Responsável</span>
          <select value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} className={campo}>
            <option value="">Sem responsável</option>
            {dados.usuarios
              .filter((u) => u.ativo)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
          </select>
        </label>
      </div>
      {erro && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {erro}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onFechar}
          className="rounded-full px-4 py-2 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
        >
          Salvar alterações
        </button>
      </div>
    </form>
  );
}

/** Comentários do card e das subtarefas, em ordem (mock). Os novos ficam no card. */
function Comentarios({ card }: { card: Card }) {
  const { dados, usuario, sel, acoes } = useHub();
  const [texto, setTexto] = useState("");
  const ids = new Set([card.id, ...sel.subtarefasDoCard(card.id).map((s) => s.id)]);
  const lista = dados.comentarios.filter((c) => ids.has(c.itemId)).sort((a, b) => a.em.localeCompare(b.em));

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    acoes.comentar(card.id, texto);
    setTexto("");
  };

  return (
    <section>
      <p className={cn(kicker, "text-accent")}>Comentários</p>
      {lista.length > 0 && (
        <ul className="mt-3 space-y-3">
          {lista.map((c) => {
            const autor = sel.usuarioPorId(c.autorId);
            const item = c.itemId !== card.id ? sel.itemPorId(c.itemId) : undefined;
            return (
              <li key={c.id} className="flex gap-3">
                <Avatar usuario={autor} tamanho="h-7 w-7" rotulo="Autor" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-display text-xs font-bold text-foreground">{autor?.nome}</span> · {dataHora(c.em)}
                    {item && <span> · em {item.titulo}</span>}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-foreground/85">{c.texto}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <form onSubmit={enviar} className="mt-3 flex items-start gap-3">
        <Avatar usuario={usuario} tamanho="h-7 w-7" rotulo="Você" />
        <div className="min-w-0 flex-1">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={2}
            placeholder="Escreva um comentário para o time"
            aria-label="Novo comentário"
            className={cn(campo, "mt-0 resize-none")}
          />
          {texto.trim() && (
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-primary px-4 py-1.5 font-display text-[11px] font-bold text-primary-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5"
              >
                Comentar
              </button>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}

function Painel({ idTitulo, onFechar, children }: { idTitulo: string; onFechar: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[55] flex justify-end">
      <button type="button" aria-label="Fechar o card" onClick={onFechar} className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="animate-rise relative h-full w-full overflow-y-auto bg-background shadow-float sm:max-w-[640px]"
      >
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          title="Fechar (Esc)"
          className="absolute right-4 top-12 z-10 rounded-full p-1.5 text-muted-foreground transition-colors duration-300 hover:bg-card hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </aside>
    </div>
  );
}
