/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/planejamento/EditarTarefaDialog.tsx (campos da tarefa),
 *   src/components/UserPicker.tsx (UserAvatar) @ commit 4fcf254 / leitura 2026-10-07.
 *   Sem origem direta para a árvore: subtarefas são novas (proposta 4.2).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Subtarefas do card no modelo do Asana (proposta 4.2), até 3 níveis
 * (card → subtarefa → sub-subtarefa). Cada linha: conclusão, título, estado do
 * post, problema, prazo e responsável. Ao abrir a linha: título, responsável,
 * prazo, descrição, o post do item (PostDoItem), problemas e "Marcar como
 * bloqueado", criar sub-subtarefa e excluir.
 * Regras (todas em regras.ts): subtarefa com post conclui sozinha quando o
 * post é publicado e não dá para marcar à mão (4.2 item 5); a subtarefa-mãe
 * conclui à mão, sem depender das filhas; item com post não é excluído sem
 * antes desassociar (4.3 item 6).
 */
import { useState, type FormEvent } from "react";
import { Check, ChevronDown, Image as ImageIcon, MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useHub } from "../store/HubStore";
import { ddmm, plural } from "../store/regras";
import type { Card, Subtarefa } from "../store/tipos";
import { Avatar } from "./CardTarefa";
import { EstadoPost } from "./EstadoPost";
import { LinhaProblema, MarcarBloqueado } from "./ItemProblemas";
import { campo, rotulo } from "./NovaTarefaDialog";
import { PostDoItem } from "./PostDoItem";

export function SubtarefaArvore({ card }: { card: Card }) {
  const { sel } = useHub();
  const [aberta, setAberta] = useState<string | null>(null);
  const raiz = sel.filhasDe(card.id, card.id);
  const resumo = sel.resumoCard(card);
  const alternar = (id: string) => setAberta((atual) => (atual === id ? null : id));

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-accent">Subtarefas</p>
        {resumo.subtarefas > 0 && (
          <p className="font-display text-[11px] font-semibold text-muted-foreground">
            {resumo.subtarefasConcluidas} de {plural(resumo.subtarefas, "concluída", "concluídas")}
          </p>
        )}
      </div>

      {resumo.subtarefas > 0 && (
        <div aria-hidden className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${(resumo.subtarefasConcluidas / resumo.subtarefas) * 100}%` }}
          />
        </div>
      )}

      {raiz.length > 0 ? (
        <ul className="mt-2 divide-y divide-border/60">
          {raiz.map((s) => (
            <LinhaSubtarefa key={s.id} sub={s} nivel={2} aberta={aberta} onAlternar={alternar} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Divida o trabalho em partes, cada uma com responsável e prazo. Uma campanha com 3 posts vira 3 subtarefas, cada uma com o seu post.
        </p>
      )}

      <NovaSubtarefa cardId={card.id} paiId={card.id} placeholder="Adicionar subtarefa" />
    </section>
  );
}

function LinhaSubtarefa({
  sub,
  nivel,
  aberta,
  onAlternar,
}: {
  sub: Subtarefa;
  nivel: 2 | 3;
  aberta: string | null;
  onAlternar: (id: string) => void;
}) {
  const { dados, hoje, sel } = useHub();
  const post = sel.postDoItem(sub.id);
  const concluida = sel.subtarefaConcluida(sub);
  const atrasada = sel.subtarefaAtrasada(sub);
  const responsavel = sel.usuarioPorId(sub.responsavelId);
  const problemas = sel.problemasDoItem(sub.id);
  const filhas = sel.filhasDe(sub.cardId, sub.id);
  const comentarios = dados.comentarios.filter((c) => c.itemId === sub.id).length;
  const expandida = aberta === sub.id;

  return (
    <li className={cn(nivel === 3 && "border-none")}>
      <div className={cn("flex items-start gap-3 py-2.5", nivel === 3 && "py-2")}>
        <Conclusao sub={sub} comPost={Boolean(post)} concluida={concluida} />

        <button
          type="button"
          onClick={() => onAlternar(sub.id)}
          aria-expanded={expandida}
          className="group min-w-0 flex-1 text-left"
        >
          <span
            className={cn(
              "block text-sm font-semibold leading-snug transition-colors duration-300 group-hover:text-primary",
              concluida ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground",
            )}
          >
            {sub.titulo}
          </span>
          {(post || problemas.length > 0 || filhas.length > 0 || comentarios > 0 || sub.postApagado) && (
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              {post && <EstadoPost estado={sel.estadoPost(post)} />}
              {!post && sub.postApagado && (
                <span className="text-[11px] text-muted-foreground">O post associado foi apagado</span>
              )}
              {/* O reprovado já aparece no estado do post; aqui só o que não tem outro sinal. */}
              {problemas.filter((p) => p.tipo !== "reprovado").map((p) => (
                <span
                  key={p.id}
                  className={cn(
                    "font-display text-[11px] font-semibold",
                    p.tipo === "aguardando_solicitante" ? "text-accent" : "text-destructive",
                  )}
                >
                  ⚑ Bloqueado
                </span>
              ))}
              {filhas.length > 0 && (
                <span className="font-display text-[11px] font-semibold text-muted-foreground">
                  {filhas.filter((f) => sel.subtarefaConcluida(f)).length} de {filhas.length}
                </span>
              )}
              {comentarios > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MessageSquare aria-hidden className="h-3 w-3" /> {comentarios}
                </span>
              )}
            </span>
          )}
        </button>

        <span
          className={cn(
            "shrink-0 pt-0.5 font-display text-[11px] font-semibold",
            atrasada ? "text-accent" : sub.prazo === hoje && !concluida ? "text-primary" : "text-muted-foreground",
          )}
        >
          {sub.prazo ? (atrasada ? `Atrasada · ${ddmm(sub.prazo)}` : sub.prazo === hoje && !concluida ? "Hoje" : ddmm(sub.prazo)) : ""}
        </span>
        <Avatar usuario={responsavel} tamanho="h-6 w-6" />
        <button
          type="button"
          onClick={() => onAlternar(sub.id)}
          aria-label={expandida ? `Fechar ${sub.titulo}` : `Abrir ${sub.titulo}`}
          className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors duration-300 hover:text-primary"
        >
          <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform duration-300", expandida && "rotate-180")} />
        </button>
      </div>

      {expandida && <DetalheSubtarefa sub={sub} nivel={nivel} />}

      {filhas.length > 0 && (
        <ul className="mb-2 ml-2.5 border-l border-border pl-5">
          {filhas.map((f) => (
            <LinhaSubtarefa key={f.id} sub={f} nivel={3} aberta={aberta} onAlternar={onAlternar} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Caixa de conclusão. Com post, conclui sozinha: mostra o ícone do post, sem clique. */
function Conclusao({ sub, comPost, concluida }: { sub: Subtarefa; comPost: boolean; concluida: boolean }) {
  const { acoes } = useHub();
  if (comPost) {
    return (
      <span
        role="img"
        aria-label={concluida ? "Concluída: o post foi publicado" : "Conclui sozinha quando o post for publicado"}
        title={concluida ? "Concluída: o post foi publicado" : "Conclui sozinha quando o post for publicado"}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          concluida ? "bg-success text-success-foreground" : "bg-sky-soft text-primary",
        )}
      >
        {concluida ? <Check aria-hidden className="h-3 w-3" /> : <ImageIcon aria-hidden className="h-3 w-3" />}
      </span>
    );
  }
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={concluida}
      aria-label={concluida ? `Reabrir ${sub.titulo}` : `Concluir ${sub.titulo}`}
      onClick={() => acoes.concluirSubtarefa(sub.id, !concluida)}
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-300",
        concluida
          ? "border-success bg-success text-success-foreground"
          : "border-muted-foreground/40 text-transparent hover:border-success hover:text-success",
      )}
    >
      <Check aria-hidden className="h-3 w-3" />
    </button>
  );
}

function DetalheSubtarefa({ sub, nivel }: { sub: Subtarefa; nivel: 2 | 3 }) {
  const { dados, sel, acoes } = useHub();
  const [titulo, setTitulo] = useState(sub.titulo);
  const [descricao, setDescricao] = useState(sub.descricao ?? "");
  const [criandoFilha, setCriandoFilha] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  // O motivo do reprovado já aparece no quadro do post, logo acima.
  const problemas = sel.problemasDoItem(sub.id).filter((p) => p.tipo !== "reprovado");
  const filhas = sel.filhasDe(sub.cardId, sub.id);

  const salvarTitulo = () => {
    const t = titulo.trim();
    if (!t) {
      setTitulo(sub.titulo);
      return;
    }
    if (t !== sub.titulo) acoes.atualizarSubtarefa(sub.id, { titulo: t });
  };

  return (
    <div className="animate-rise mb-3 ml-8 space-y-4 rounded-2xl bg-muted/45 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={rotulo}>Título</span>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={salvarTitulo}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className={cn(campo, "bg-card")}
          />
        </label>
        <label className="block">
          <span className={rotulo}>Responsável</span>
          <select
            value={sub.responsavelId ?? ""}
            onChange={(e) => acoes.atualizarSubtarefa(sub.id, { responsavelId: e.target.value || undefined })}
            className={cn(campo, "bg-card")}
          >
            <option value="">Ninguém</option>
            {dados.usuarios
              .filter((u) => u.ativo)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          <span className={rotulo}>Data de entrega</span>
          <input
            type="date"
            value={sub.prazo ?? ""}
            onChange={(e) => acoes.atualizarSubtarefa(sub.id, { prazo: e.target.value || undefined })}
            className={cn(campo, "bg-card")}
          />
        </label>
      </div>

      <label className="block">
        <span className={rotulo}>Descrição</span>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          onBlur={() => descricao.trim() !== (sub.descricao ?? "") && acoes.atualizarSubtarefa(sub.id, { descricao: descricao.trim() || undefined })}
          rows={2}
          placeholder="Detalhes e objetivo"
          className={cn(campo, "resize-none bg-card")}
        />
      </label>

      <div>
        <p className={rotulo}>Post</p>
        <div className="mt-1.5">
          <PostDoItem itemId={sub.id} prazoItem={sub.prazo} />
        </div>
      </div>

      {problemas.length > 0 && (
        <ul className="space-y-1.5">
          {problemas.map((p) => (
            <LinhaProblema key={p.id} problema={p} />
          ))}
        </ul>
      )}

      {criandoFilha && (
        <NovaSubtarefa
          cardId={sub.cardId}
          paiId={sub.id}
          placeholder={`Sub-subtarefa de ${sub.titulo}`}
          autoFocus
          onFechar={() => setCriandoFilha(false)}
        />
      )}

      <div className="flex flex-wrap items-center gap-1 border-t border-border/70 pt-3">
        {nivel === 2 && !criandoFilha && (
          <button
            type="button"
            onClick={() => setCriandoFilha(true)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-display text-[11px] font-bold text-primary transition-colors duration-300 hover:text-accent"
          >
            <Plus aria-hidden className="h-3.5 w-3.5" /> Sub-subtarefa
          </button>
        )}
        <MarcarBloqueado alvo={{ tipo: "subtarefa", id: sub.id }} />
        <span className="ml-auto" />
        {confirmarExclusao ? (
          <span className="inline-flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground">
              {filhas.length ? `Excluir com ${plural(filhas.length, "sub-subtarefa", "sub-subtarefas")}?` : "Excluir esta subtarefa?"}
            </span>
            <button
              type="button"
              onClick={() => {
                acoes.excluirItem(sub.id);
                setConfirmarExclusao(false);
              }}
              className="rounded-full px-2 py-1 font-display text-[11px] font-bold text-destructive"
            >
              Excluir
            </button>
            <button
              type="button"
              onClick={() => setConfirmarExclusao(false)}
              className="rounded-full px-2 py-1 font-display text-[11px] font-bold text-muted-foreground hover:text-primary"
            >
              Manter
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              const r = sel.podeExcluirItem(sub.id);
              if (!r.ok) acoes.avisar(r.motivo, "erro");
              else setConfirmarExclusao(true);
            }}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-destructive"
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" /> Excluir
          </button>
        )}
      </div>
    </div>
  );
}

/** Campo de uma linha para criar subtarefa (Enter cria). Responsável e prazo vêm depois, na linha. */
function NovaSubtarefa({
  cardId,
  paiId,
  placeholder,
  autoFocus,
  onFechar,
}: {
  cardId: string;
  paiId: string;
  placeholder: string;
  autoFocus?: boolean;
  onFechar?: () => void;
}) {
  const { acoes } = useHub();
  const [titulo, setTitulo] = useState("");

  const criar = (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    if (acoes.criarSubtarefa(cardId, paiId, { titulo: titulo.trim() }).ok) {
      setTitulo("");
      onFechar?.();
    }
  };

  return (
    <form onSubmit={criar} className="mt-2 flex items-center gap-3">
      <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-muted-foreground/40 text-muted-foreground">
        <Plus className="h-3 w-3" />
      </span>
      <input
        value={titulo}
        autoFocus={autoFocus}
        onChange={(e) => setTitulo(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && onFechar) {
            e.stopPropagation();
            onFechar();
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 border-b border-transparent bg-transparent py-1.5 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/70 focus:border-sky"
      />
      {titulo.trim() && (
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-3 py-1 font-display text-[11px] font-bold text-primary-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5"
        >
          Adicionar
        </button>
      )}
      {onFechar && !titulo.trim() && (
        <button type="button" onClick={onFechar} className="shrink-0 font-display text-[11px] font-bold text-muted-foreground hover:text-primary">
          Cancelar
        </button>
      )}
    </form>
  );
}
