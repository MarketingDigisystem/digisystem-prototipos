/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/biblioteca/$postId.tsx,
 *   src/components/estudio/ArteAjustePanel.tsx, src/hooks/use-posts.ts (useAjustarArte)
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Painel lateral de um post (Meus posts; Publicados reaproveita no item 3.4).
 * A página /biblioteca/$postId vira painel, como o card do Quadro. Proposta 6:
 * é aqui que o autor refina, sobe a versão do designer, reenvia e associa o
 * post a um card.
 *  - Onde está: card/subtarefa com "Ver o card" e Desassociar (K5: só em
 *    rascunho ou reprovado); fora de card: "Associar a um card" e "Criar card
 *    com este post" (4.6 caminhos 1 e 2).
 *  - Próximo passo pelo estado: Enviar/Reenviar com data sugerida (sem card,
 *    abre a pergunta 4.6), aguardando, Marcar como publicado, publicado.
 *  - Versão do designer: fiel ao ArteAjustePanel; aprovado volta para a
 *    aprovação; depois de publicado depende do alternador K11 do painel de demo.
 *    Sem seletor de arquivo: a versão nova é uma arte de exemplo.
 */
import { useEffect, useId, useState, type ReactNode } from "react";
import { ArrowUpRight, Link2, Lock, Plus, Send, Unlink, UploadCloud, X } from "lucide-react";
import { IaDigisystem } from "../../IaDigisystem";
import { cn } from "../../lib/utils";
import { hrefDe } from "../router";
import { useHub } from "../store/HubStore";
import { arteDesigner } from "../store/mock-arte";
import { dataSugeridaInicial, ddmm } from "../store/regras";
import type { Post } from "../store/tipos";
import { EnviarSemCardDialog } from "./EnviarSemCardDialog";
import { EstadoPost } from "./EstadoPost";

const REDE: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };

const kicker = "font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground";
const botaoSecundario =
  "inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 font-display text-[11px] font-bold text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5";
const botaoLaranja =
  "inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-display text-[11px] font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float";
const botaoDiscreto =
  "inline-flex items-center gap-1 rounded-full px-2 py-1.5 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-destructive";

export function DetalhePost({
  postId,
  onFechar,
  noAcervo = false,
}: {
  postId: string;
  onFechar: () => void;
  /** Aberto de Publicados: o próximo passo não aponta de volta para o acervo. */
  noAcervo?: boolean;
}) {
  const { sel } = useHub();
  const idTitulo = useId();
  const post = sel.postPorId(postId);

  useEffect(() => {
    const onTecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onTecla);
    return () => window.removeEventListener("keydown", onTecla);
  }, [onFechar]);

  return (
    <div className="fixed inset-0 z-[55] flex justify-end">
      <button type="button" aria-label="Fechar o post" onClick={onFechar} className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
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
        {post ? (
          <Conteudo post={post} idTitulo={idTitulo} noAcervo={noAcervo} />
        ) : (
          <div className="px-6 py-12">
            <h2 id={idTitulo} className="font-display text-xl font-bold text-primary">
              Este post não existe mais
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Ele pode ter sido apagado. Os outros continuam na lista.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Conteudo({ post, idTitulo, noAcervo }: { post: Post; idTitulo: string; noAcervo: boolean }) {
  const { dados, sel } = useHub();
  const estado = sel.estadoPost(post);
  const autor = sel.usuarioPorId(post.autorId);
  const tendencia = dados.tendencias.find((t) => t.id === post.trendId);
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;
  const pedido = item?.card.pedido;

  return (
    <>
      <header className="border-b border-border bg-navy-soft px-6 py-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <EstadoPost estado={estado} />
          {pedido && (
            <span className="rounded-full bg-sky-soft px-2.5 py-0.5 font-display text-[10px] font-bold text-primary">Pedido externo</span>
          )}
        </div>
        <h2 id={idTitulo} className="mt-3 pr-8 font-display text-2xl font-bold leading-tight text-primary">
          {post.titulo}
        </h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {post.formato} · {post.redes.map((r) => REDE[r]).join(", ")} · por {autor?.nome ?? "alguém do time"}
          {tendencia && (
            <>
              {" "}
              · nasceu da tendência{" "}
              <a href={hrefDe("tendencias", "tendencias", { trend: tendencia.id })} className="font-semibold text-primary hover:text-accent">
                {tendencia.titulo}
              </a>
            </>
          )}
        </p>
      </header>

      <div className="space-y-6 px-6 py-6">
        <Arte post={post} />

        {post.estado === "reprovado" && post.motivoReprovacao && (
          <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive">
            <span className="font-semibold">Motivo da recusa:</span> {post.motivoReprovacao}
          </p>
        )}

        <ProximoPasso post={post} noAcervo={noAcervo} />
        <OndeEsta post={post} />
        <VersaoDesigner post={post} />
        <Texto post={post} />
      </div>
    </>
  );
}

// ─── Arte (atual + a anterior, quando houver versão do designer) ─────────

function Arte({ post }: { post: Post }) {
  return (
    <div className="flex items-end gap-4">
      <img
        src={post.arteUrl}
        alt={`Arte do post ${post.titulo}`}
        className="aspect-square w-full max-w-[15rem] rounded-3xl object-cover shadow-card"
      />
      {post.arteAnteriorUrl && (
        <figure className="w-24 shrink-0">
          <img src={post.arteAnteriorUrl} alt="Arte anterior, gerada no Estúdio" className="aspect-square w-full rounded-2xl object-cover opacity-80" />
          <figcaption className="mt-1.5 text-[11px] leading-snug text-muted-foreground">Antes: arte do Estúdio</figcaption>
        </figure>
      )}
    </div>
  );
}

// ─── Próximo passo, pelo estado do post ──────────────────────────────────

function ProximoPasso({ post, noAcervo = false }: { post: Post; noAcervo?: boolean }) {
  const { hoje, sel, acoes } = useHub();
  const [enviando, setEnviando] = useState(false);
  const [perguntando, setPerguntando] = useState(false);
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;
  const prazoItem = item ? (item.tipo === "card" ? item.card.prazo : item.sub.prazo) : undefined;
  const [data, setData] = useState(() => dataSugeridaInicial(hoje, post.dataSugerida, prazoItem));
  const estado = sel.estadoPost(post);
  const revisor = sel.usuarioPorId(post.emRevisaoPor);
  const reenviar = post.estado === "reprovado";

  const paramsEstudio = {
    post: post.id,
    card: item?.card.id,
    item: item?.tipo === "subtarefa" ? item.id : undefined,
  };

  const confirmar = () => {
    // Sem card, o Hub pergunta antes (4.6 caminho 3).
    if (!post.itemId) {
      setPerguntando(true);
      return;
    }
    if (acoes.enviarPost(post.id, data || undefined).ok) setEnviando(false);
  };

  let corpo: ReactNode = null;
  if (post.estado === "rascunho" || post.estado === "reprovado") {
    corpo = enviando ? (
      <div className="animate-rise flex flex-wrap items-end gap-2 rounded-2xl bg-muted/50 p-3">
        <label className="block">
          <span className={kicker}>Data sugerida</span>
          <input
            type="date"
            value={data}
            min={hoje}
            onChange={(e) => setData(e.target.value)}
            className="mt-1 block rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
          />
        </label>
        <button type="button" onClick={confirmar} className={botaoLaranja}>
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
          {!post.itemId && " Como o post ainda não está em card, o Hub pergunta onde ele vai ficar."}
        </p>
      </div>
    ) : (
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setEnviando(true)} className={botaoLaranja}>
          <Send aria-hidden className="h-3.5 w-3.5" /> {reenviar ? "Reenviar para aprovação" : "Enviar para aprovação"}
        </button>
        <a href={hrefDe("posts", "criar", paramsEstudio)} className={botaoSecundario}>
          <IaDigisystem size={18} /> {reenviar ? "Ajustar no Estúdio" : "Continuar no Estúdio"}
        </a>
      </div>
    );
  } else if (post.estado === "enviado") {
    corpo = (
      <p className="text-sm text-muted-foreground">
        {revisor ? `Em revisão com ${revisor.nome.split(" ")[0]}. ` : "Aguardando quem aprova, em Posts → Para aprovar. "}
        {post.dataSugerida && `Data sugerida: ${ddmm(post.dataSugerida)}.`}
      </p>
    );
  } else if (post.estado === "aprovado") {
    const urgente = estado.chave === "publicar_hoje" || estado.chave === "atrasado";
    corpo = (
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => acoes.marcarPublicado(post.id)} className={urgente ? botaoLaranja : botaoSecundario}>
          Marcar como publicado
        </button>
        <span className="text-xs text-muted-foreground">
          {post.dataPublicacao ? `Data confirmada por quem aprovou: ${ddmm(post.dataPublicacao)}.` : "Aprovado sem data de publicação."}
        </span>
      </div>
    );
  } else if (noAcervo) {
    const aprovador = sel.usuarioPorId(post.aprovadoPor);
    corpo = (
      <p className="text-sm text-muted-foreground">
        Foi ao ar em {ddmm(post.publicadoEm ?? post.dataPublicacao ?? post.atualizadoEm)}
        {aprovador && `, aprovado por ${aprovador.nome.split(" ")[0]}`}. Está no acervo do time.
      </p>
    );
  } else {
    corpo = (
      <a
        href={hrefDe("posts", "publicados", { post: post.id })}
        className="inline-flex items-center gap-1 font-display text-xs font-bold text-primary transition-colors duration-300 hover:text-accent"
      >
        Ver em Publicados <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <section>
      <p className={kicker}>Próximo passo</p>
      <div className="mt-2">{corpo}</div>
      {perguntando && (
        <EnviarSemCardDialog
          post={post}
          dataSugerida={data || undefined}
          onFechar={() => setPerguntando(false)}
          onEnviado={() => {
            setPerguntando(false);
            setEnviando(false);
          }}
        />
      )}
    </section>
  );
}

// ─── Onde o post está (card ou fora de card) ─────────────────────────────

function OndeEsta({ post }: { post: Post }) {
  const { sel, acoes } = useHub();
  const [dialogo, setDialogo] = useState<"novo" | "existente" | null>(null);
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;

  if (item) {
    const coluna = sel.colunaDoCard(item.card);
    const podeDesassociar = sel.podeDesassociar(post);
    return (
      <section>
        <p className={kicker}>Onde está</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-card px-4 py-3 shadow-card">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold text-primary">{item.card.titulo}</p>
            <p className="truncate text-xs text-muted-foreground">
              {item.tipo === "subtarefa" ? `Subtarefa: ${item.titulo}` : "No próprio card"}
              {coluna && ` · ${COLUNA_ROTULO[coluna]}`}
            </p>
          </div>
          <a href={hrefDe("tarefas", "quadro", { card: item.card.id })} className={botaoSecundario}>
            Ver o card <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </a>
          {podeDesassociar.ok ? (
            <button type="button" onClick={() => acoes.desassociarPost(post.id)} className={botaoDiscreto}>
              <Unlink aria-hidden className="h-3.5 w-3.5" /> Desassociar
            </button>
          ) : (
            <p className="flex w-full items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock aria-hidden className="h-3 w-3" /> {podeDesassociar.motivo}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (post.estado === "publicado") return null;

  return (
    <section>
      <p className={kicker}>Onde está</p>
      <div className="mt-2 rounded-2xl border border-dashed border-border px-4 py-3">
        <p className="text-sm text-foreground">Fora de card.</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Ele entra no Quadro quando você associa a um card ou cria um card com ele. Se for enviado sem card, o Hub pergunta.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setDialogo("existente")} className={botaoSecundario}>
            <Link2 aria-hidden className="h-3.5 w-3.5" /> Associar a um card
          </button>
          <button type="button" onClick={() => setDialogo("novo")} className={botaoSecundario}>
            <Plus aria-hidden className="h-3.5 w-3.5" /> Criar card com este post
          </button>
        </div>
      </div>
      {dialogo && (
        <EnviarSemCardDialog
          key={dialogo}
          modo="associar"
          opcaoInicial={dialogo}
          post={post}
          dataSugerida={post.dataSugerida}
          onFechar={() => setDialogo(null)}
          onEnviado={() => setDialogo(null)}
        />
      )}
    </section>
  );
}

const COLUNA_ROTULO: Record<string, string> = {
  recebidos: "Recebidos",
  afazer: "A fazer",
  andamento: "Em andamento",
  concluido: "Concluído",
  problemas: "Problemas",
};

// ─── Versão do designer (ArteAjustePanel, K11) ───────────────────────────

function VersaoDesigner({ post }: { post: Post }) {
  const { estado: hub, sel, acoes } = useHub();
  const [confirmando, setConfirmando] = useState(false);
  const pode = sel.podeTrocarArte(post);
  const temAnterior = Boolean(post.arteAnteriorUrl);
  const ajustadaPor = sel.usuarioPorId(post.arteAjustadaPor);
  // Aprovado (ou publicado com a trava desligada) volta para a aprovação.
  const voltaParaAprovacao = post.estado === "aprovado" || post.estado === "publicado";

  const enviar = () => {
    const r = acoes.trocarArte(post.id, arteDesigner(post.tituloArte || post.titulo, post.subtituloArte));
    if (r.ok) setConfirmando(false);
  };

  return (
    <section className="space-y-3 rounded-3xl bg-card p-4 shadow-card">
      <p className={kicker}>Versão do designer</p>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {temAnterior
          ? `Ajustada por ${ajustadaPor?.nome ?? "alguém do time"}. A arte do Estúdio fica guardada como versão anterior.`
          : "Nenhuma versão do designer enviada ainda. O designer pode baixar o SVG, editar livremente e subir a nova versão aqui."}
      </p>

      {!pode.ok ? (
        <p className="flex items-center gap-1.5 rounded-2xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <Lock aria-hidden className="h-3.5 w-3.5 shrink-0" /> {pode.motivo}
        </p>
      ) : confirmando ? (
        <div className="animate-rise space-y-2 rounded-2xl bg-warning-soft px-3 py-3">
          <p className="text-xs leading-relaxed text-foreground">
            {post.estado === "publicado"
              ? "Este post já foi publicado. A versão nova volta para a aprovação antes de valer."
              : "Este post já foi aprovado. A versão nova volta para a aprovação, e o card mostra Enviado para aprovação."}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={enviar} className={botaoLaranja}>
              Enviar e voltar para a aprovação
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="px-2 py-1.5 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => (voltaParaAprovacao ? setConfirmando(true) : enviar())}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 font-display text-xs font-bold text-primary transition-all duration-300 hover:-translate-y-0.5"
        >
          <UploadCloud aria-hidden className="h-4 w-4" /> {temAnterior ? "Enviar nova versão" : "Enviar versão do designer"}
        </button>
      )}

      <p className="text-[11px] text-muted-foreground/80">
        No protótipo, a versão nova é uma arte de exemplo, sem escolher arquivo. Regra em decisão (K11): depois de publicado, a arte{" "}
        {hub.arteTravadaAposPublicar ? "fica travada" : "pode mudar e volta para a aprovação"}. O painel de demonstração alterna.
      </p>
    </section>
  );
}

// ─── Texto do post ───────────────────────────────────────────────────────

function Texto({ post }: { post: Post }) {
  return (
    <section className="space-y-4">
      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <Campo rotulo="Título da arte">{post.tituloArte || "Sem título"}</Campo>
        <Campo rotulo="Subtítulo da arte">{post.subtituloArte || "Sem subtítulo"}</Campo>
        <Campo rotulo="Segmento">{post.segmento}</Campo>
        <Campo rotulo="Data sugerida">{post.dataSugerida ? ddmm(post.dataSugerida) : "Sem data"}</Campo>
        <Campo rotulo="Publicação">
          {post.publicadoEm ? `Publicado em ${ddmm(post.publicadoEm)}` : post.dataPublicacao ? ddmm(post.dataPublicacao) : "Sem data"}
        </Campo>
        <Campo rotulo="Criado em">{ddmm(post.criadoEm)}</Campo>
      </dl>
      <div>
        <p className={kicker}>Legenda</p>
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{post.legenda || "A legenda ainda não foi escrita."}</p>
      </div>
      {post.hashtags.length > 0 && (
        <div>
          <p className={kicker}>Hashtags</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {post.hashtags.map((h) => (
              <span key={h} className="rounded-full bg-sky-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
      {post.observacao && (
        <div>
          <p className={kicker}>Observação para quem aprova</p>
          <p className="mt-1.5 text-sm text-foreground/85">{post.observacao}</p>
        </div>
      )}
    </section>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className={kicker}>{rotulo}</dt>
      <dd className={cn("mt-1 truncate")}>{children}</dd>
    </div>
  );
}
