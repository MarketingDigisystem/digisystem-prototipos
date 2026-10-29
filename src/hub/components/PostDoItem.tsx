/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/planejamento/EditarTarefaDialog.tsx,
 *   src/routes/_authenticated/biblioteca/index.tsx (miniatura e status do post),
 *   src/hooks/use-posts.ts (enviar, publicar) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * O post de um item (card ou subtarefa), proposta 4.3 e 4.4:
 *  - sem post: Criar no Estúdio (nasce associado) ou Associar post salvo
 *    (primeiro os meus, depois os do time que ainda não estão em card);
 *  - rascunho ou reprovado: Enviar / Reenviar para aprovação com a data
 *    sugerida, e Desassociar (K5: só nesses dois estados);
 *  - enviado: associação travada, quem decide é quem aprova;
 *  - aprovado: Marcar como publicado (K8: fica no card e no Calendário);
 *  - publicado: link para Publicados.
 * Todas as regras vêm de regras.ts pelas ações do store.
 */
import { useState } from "react";
import { ArrowUpRight, Link2, Send, Unlink } from "lucide-react";
import { IaDigisystem } from "../../IaDigisystem";
import { cn } from "../../lib/utils";
import { hrefDe } from "../router";
import { useHub } from "../store/HubStore";
import { ddmm, somarDias } from "../store/regras";
import type { Post } from "../store/tipos";
import { EstadoPost } from "./EstadoPost";

const REDE: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };

const botaoSecundario =
  "inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-display text-[11px] font-bold text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5";
const botaoLaranja =
  "inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-display text-[11px] font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float";
const botaoDiscreto =
  "inline-flex items-center gap-1 rounded-full px-2 py-1 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-destructive";

export function PostDoItem({ itemId, prazoItem }: { itemId: string; prazoItem?: string }) {
  const { sel } = useHub();
  const item = sel.itemPorId(itemId);
  const post = sel.postDoItem(itemId);
  if (!item) return null;

  const params = {
    card: item.card.id,
    item: item.tipo === "subtarefa" ? item.id : undefined,
    trend: item.card.trendId,
  };

  if (post) return <PostAssociado post={post} params={params} prazoItem={prazoItem} />;

  const apagado = item.tipo === "card" ? item.card.postApagado : item.sub.postApagado;
  const concluida = item.tipo === "subtarefa" && Boolean(item.sub.concluidaEm);
  return <SemPost itemId={itemId} params={params} apagado={apagado} concluida={concluida} />;
}

// ─── Item sem post ────────────────────────────────────────────────────────

function SemPost({
  itemId,
  params,
  apagado,
  concluida,
}: {
  itemId: string;
  params: Record<string, string | undefined>;
  apagado?: { titulo: string; em: string };
  concluida: boolean;
}) {
  const [escolhendo, setEscolhendo] = useState(false);

  if (concluida) {
    return <p className="text-xs text-muted-foreground">Subtarefa concluída sem post. Reabra para associar um.</p>;
  }

  return (
    <div>
      {apagado && (
        <p className="mb-2 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          O post associado foi apagado ({apagado.titulo}, em {ddmm(apagado.em)}). Crie outro ou associe um salvo.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <a href={hrefDe("posts", "criar", params)} className={botaoSecundario}>
          <IaDigisystem size={18} /> Criar no Estúdio
        </a>
        <button
          type="button"
          aria-expanded={escolhendo}
          onClick={() => setEscolhendo((v) => !v)}
          className={cn(botaoSecundario, escolhendo && "ring-1 ring-primary/30")}
        >
          <Link2 aria-hidden className="h-3.5 w-3.5" /> Associar post salvo
        </button>
      </div>
      {escolhendo && <EscolherPost itemId={itemId} onFechar={() => setEscolhendo(false)} />}
    </div>
  );
}

/** "Associar post salvo": primeiro os meus, depois os do time sem card (4.3 item 3). */
function EscolherPost({ itemId, onFechar }: { itemId: string; onFechar: () => void }) {
  const { sel, acoes } = useHub();
  const { meus, time } = sel.postsParaAssociar();

  const associar = (p: Post) => {
    if (acoes.associarPost(p.id, itemId).ok) onFechar();
  };

  if (meus.length + time.length === 0) {
    return (
      <p className="animate-rise mt-3 rounded-2xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
        Nenhum post salvo fora de card. Crie um no Estúdio e ele já nasce aqui.
      </p>
    );
  }

  return (
    <div className="animate-rise mt-3 max-h-72 overflow-y-auto rounded-2xl border border-border bg-background p-2">
      <GrupoPosts titulo="Meus posts" posts={meus} onEscolher={associar} />
      <GrupoPosts titulo="Do time, ainda sem card" posts={time} onEscolher={associar} />
    </div>
  );
}

function GrupoPosts({ titulo, posts, onEscolher }: { titulo: string; posts: Post[]; onEscolher: (p: Post) => void }) {
  const { sel } = useHub();
  if (posts.length === 0) return null;
  return (
    <div className="py-1">
      <p className="px-2 pb-1 pt-1.5 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{titulo}</p>
      <ul>
        {posts.map((p) => {
          const autor = sel.usuarioPorId(p.autorId);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onEscolher(p)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-300 hover:bg-card"
              >
                <img src={p.arteUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{p.titulo}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <EstadoPost estado={sel.estadoPost(p)} />
                    <span className="truncate">
                      {autor?.nome.split(" ")[0]} · atualizado em {ddmm(p.atualizadoEm)}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 font-display text-[11px] font-bold text-primary">Associar</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Item com post ────────────────────────────────────────────────────────

function PostAssociado({
  post,
  params,
  prazoItem,
}: {
  post: Post;
  params: Record<string, string | undefined>;
  prazoItem?: string;
}) {
  const { hoje, sel, acoes } = useHub();
  const [enviando, setEnviando] = useState(false);
  const sugestaoInicial =
    post.dataSugerida && post.dataSugerida >= hoje
      ? post.dataSugerida
      : prazoItem && prazoItem >= hoje
        ? prazoItem
        : somarDias(hoje, 2);
  const [data, setData] = useState(sugestaoInicial);

  const estado = sel.estadoPost(post);
  const autor = sel.usuarioPorId(post.autorId);
  const revisor = sel.usuarioPorId(post.emRevisaoPor);
  const podeEnviar = post.estado === "rascunho" || post.estado === "reprovado";
  const reenviar = post.estado === "reprovado";
  const urgente = estado.chave === "publicar_hoje" || estado.chave === "atrasado";

  const enviar = () => {
    if (acoes.enviarPost(post.id, data || undefined).ok) setEnviando(false);
  };

  return (
    <div className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
      <img src={post.arteUrl} alt={`Arte do post ${post.titulo}`} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{post.titulo}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {post.formato} · {post.redes.map((r) => REDE[r]).join(", ")} · por {autor?.nome.split(" ")[0]}
        </p>
        <div className="mt-1.5">
          <EstadoPost estado={estado} />
        </div>

        {post.estado === "reprovado" && post.motivoReprovacao && (
          <p className="mt-2 rounded-xl bg-destructive/[0.07] px-3 py-2 text-xs leading-relaxed text-destructive">
            <span className="font-semibold">Motivo de quem aprovou:</span> {post.motivoReprovacao}
          </p>
        )}

        {post.estado === "enviado" && (
          <p className="mt-2 text-xs text-muted-foreground">
            {revisor ? `Em revisão com ${revisor.nome.split(" ")[0]}. ` : "Aguardando quem aprova, em Posts → Para aprovar. "}
            {post.dataSugerida && `Data sugerida: ${ddmm(post.dataSugerida)}. `}A associação fica travada até a decisão.
          </p>
        )}

        {/* Ações por estado */}
        {podeEnviar && !enviando && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setEnviando(true)} className={botaoLaranja}>
              <Send aria-hidden className="h-3.5 w-3.5" /> {reenviar ? "Reenviar para aprovação" : "Enviar para aprovação"}
            </button>
            <a href={hrefDe("posts", "criar", { ...params, post: post.id })} className={botaoSecundario}>
              <IaDigisystem size={18} /> {reenviar ? "Ajustar no Estúdio" : "Continuar no Estúdio"}
            </a>
            <button type="button" onClick={() => acoes.desassociarPost(post.id)} className={botaoDiscreto}>
              <Unlink aria-hidden className="h-3.5 w-3.5" /> Desassociar
            </button>
          </div>
        )}

        {podeEnviar && enviando && (
          <div className="animate-rise mt-2.5 flex flex-wrap items-end gap-2 rounded-xl bg-muted/50 p-2.5">
            <label className="block">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Data sugerida</span>
              <input
                type="date"
                value={data}
                min={hoje}
                onChange={(e) => setData(e.target.value)}
                className="mt-1 block rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
              />
            </label>
            <button type="button" onClick={enviar} className={botaoLaranja}>
              {reenviar ? "Confirmar reenvio" : "Confirmar envio"}
            </button>
            <button
              type="button"
              onClick={() => setEnviando(false)}
              className="px-2 py-1.5 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
            >
              Cancelar
            </button>
            <p className="w-full text-[11px] text-muted-foreground">
              {reenviar ? "O reenvio sempre volta para a aprovação. " : ""}Quem aprova confirma ou troca a data.
            </p>
          </div>
        )}

        {post.estado === "aprovado" && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => acoes.marcarPublicado(post.id)}
              className={urgente ? botaoLaranja : botaoSecundario}
            >
              Marcar como publicado
            </button>
            <span className="text-[11px] text-muted-foreground">
              {post.dataPublicacao ? `Data confirmada: ${ddmm(post.dataPublicacao)}` : "Sem data de publicação"}
            </span>
          </div>
        )}

        {post.estado === "publicado" && (
          <a
            href={hrefDe("posts", "publicados", { post: post.id })}
            className="mt-2 inline-flex items-center gap-1 font-display text-[11px] font-bold text-primary transition-colors duration-300 hover:text-accent"
          >
            Ver em Publicados <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
