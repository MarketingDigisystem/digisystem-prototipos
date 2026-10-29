/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/biblioteca/index.tsx,
 *   src/routes/_authenticated/biblioteca/$postId.tsx,
 *   src/components/estudio/ArteAjustePanel.tsx @ commit 4fcf254 / leitura 2026-10-07.
 *   Referência visual consumida (não é fonte): prototipos/react/src/MeusPostsRefino.tsx.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Posts → Meus posts (proposta 6): os posts que eu criei, em trabalho.
 *  - "Precisa de você" com os contadores do real (Para ajustar como autor;
 *    Para aprovar como aprovador). B-05 corrigido: "Para aprovar" não conta
 *    os meus, que eu não posso decidir.
 *  - Filtro por estado (só os presentes), "Fora de card" e os meus publicados
 *    (que moram em Publicados, mas o autor ainda alcança daqui).
 *  - Cada cartão diz em que card o post está. Clicar abre o painel do post,
 *    com associar a um card, criar card com este post, reenviar e versão do
 *    designer (components/DetalhePost.tsx).
 * Sem restrição de privacidade (K6): é um filtro de exibição por autor.
 */
import { useMemo, useState, type ReactNode } from "react";
import { ImageIcon, Link2 } from "lucide-react";
import { BotaoCriarPost, CabecalhoArea } from "../../components/CabecalhoArea";
import { DetalhePost } from "../../components/DetalhePost";
import { EstadoPost } from "../../components/EstadoPost";
import { cn } from "../../../lib/utils";
import { hrefDe, navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { ROTULO_ESTADO_GUARDADO, ddmm } from "../../store/regras";
import type { Post, PostEstado } from "../../store/tipos";

type Filtro = "aberto" | "sem_card" | PostEstado;

/** Ordem dos estados nos filtros (publicado fica por último, separado). */
const ORDEM: PostEstado[] = ["rascunho", "enviado", "reprovado", "aprovado"];

export function MeusPosts({ rota }: { rota: Rota }) {
  const { dados, usuario, papel, sel } = useHub();
  const [filtro, setFiltro] = useState<Filtro>("aberto");
  const [aberto, setAberto] = useState<"autor" | "aprovador" | null>(null);
  const postAberto = rota.params.post;

  const meus = useMemo(
    () => dados.posts.filter((p) => p.autorId === usuario.id).sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm)),
    [dados.posts, usuario.id],
  );
  const emTrabalho = meus.filter((p) => p.estado !== "publicado");
  const publicados = meus.filter((p) => p.estado === "publicado");
  const foraDeCard = emTrabalho.filter((p) => !p.itemId);

  // Precisa de você: reprovados primeiro, depois rascunhos (como autor).
  const paraAjustar = emTrabalho
    .filter((p) => p.estado === "reprovado" || p.estado === "rascunho")
    .sort((a, b) => Number(b.estado === "reprovado") - Number(a.estado === "reprovado"));
  // B-05: só os de outras pessoas, e só para quem aprova.
  const paraAprovar =
    papel === "marketing" ? [] : dados.posts.filter((p) => p.estado === "enviado" && p.autorId !== usuario.id);

  const estadosPresentes = ORDEM.filter((e) => emTrabalho.some((p) => p.estado === e));
  const visiveis =
    filtro === "aberto"
      ? emTrabalho
      : filtro === "sem_card"
        ? foraDeCard
        : meus.filter((p) => p.estado === filtro);

  const abrir = (p: Post) => navegar("posts", "meus", { post: p.id });
  const fechar = () => navegar("posts", "meus");

  return (
    <>
      <CabecalhoArea
        area="posts"
        aba="meus"
        subtitulo="Os posts que você criou, do rascunho até a publicação."
        actions={<BotaoCriarPost />}
      />

      {(paraAjustar.length > 0 || paraAprovar.length > 0) && (
        <section className="animate-rise mt-8" style={{ animationDelay: "70ms" }}>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">Precisa de você</h2>
          <div className="mt-3 grid items-start gap-3 sm:grid-cols-2">
            {paraAjustar.length > 0 && (
              <ContadorPrecisa
                cor="accent"
                titulo="Para ajustar"
                subtitulo="reprovados e rascunhos, como autor"
                n={paraAjustar.length}
                aberto={aberto === "autor"}
                onToggle={() => setAberto((a) => (a === "autor" ? null : "autor"))}
              >
                {paraAjustar.map((p) => (
                  <ItemPrecisa
                    key={p.id}
                    post={p}
                    acao={p.estado === "reprovado" ? "Ajustar" : "Continuar"}
                    cor="text-accent"
                    onClick={() => abrir(p)}
                  />
                ))}
              </ContadorPrecisa>
            )}
            {paraAprovar.length > 0 && (
              <ContadorPrecisa
                cor="sky"
                titulo="Para aprovar"
                subtitulo="aguardando decisão, de outras pessoas do time"
                n={paraAprovar.length}
                aberto={aberto === "aprovador"}
                onToggle={() => setAberto((a) => (a === "aprovador" ? null : "aprovador"))}
                rodape={
                  <a
                    href={hrefDe("posts", "aprovar")}
                    className="font-display text-[11px] font-bold text-primary transition-colors duration-300 hover:text-accent"
                  >
                    Ir para a fila de aprovação
                  </a>
                }
              >
                {paraAprovar.map((p) => (
                  <ItemPrecisa
                    key={p.id}
                    post={p}
                    acao="Decidir"
                    cor="text-primary"
                    detalhe={sel.usuarioPorId(p.autorId)?.nome.split(" ")[0]}
                    href={hrefDe("posts", "aprovar", { post: p.id })}
                  />
                ))}
              </ContadorPrecisa>
            )}
          </div>
        </section>
      )}

      <section className="animate-rise mt-10" style={{ animationDelay: "140ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">Em trabalho</h2>
          <div role="group" aria-label="Filtrar meus posts" className="flex flex-wrap items-center gap-1.5">
            <Pilula ativa={filtro === "aberto"} onClick={() => setFiltro("aberto")} n={emTrabalho.length}>
              Todos
            </Pilula>
            {estadosPresentes.map((e) => (
              <Pilula key={e} ativa={filtro === e} onClick={() => setFiltro(e)}>
                {ROTULO_ESTADO_GUARDADO[e]}
              </Pilula>
            ))}
            {foraDeCard.length > 0 && (
              <>
                <span aria-hidden className="mx-1 h-4 w-px bg-border" />
                <Pilula ativa={filtro === "sem_card"} onClick={() => setFiltro("sem_card")} n={foraDeCard.length}>
                  Fora de card
                </Pilula>
              </>
            )}
            {publicados.length > 0 && (
              <Pilula ativa={filtro === "publicado"} onClick={() => setFiltro("publicado")} n={publicados.length}>
                Publicados
              </Pilula>
            )}
          </div>
        </div>

        {filtro === "publicado" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Os publicados ficam no acervo do time, em{" "}
            <a href={hrefDe("posts", "publicados")} className="font-semibold text-primary hover:text-accent">
              Publicados
            </a>
            . Aqui aparecem só os seus.
          </p>
        )}
        {filtro === "sem_card" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Posts salvos que ainda não estão no Quadro. Abra um para associar a um card ou criar um card com ele.
          </p>
        )}

        {meus.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-border px-6 py-10 text-center">
            <p className="font-display text-base font-bold text-primary">Você ainda não criou posts.</p>
            <a href={hrefDe("posts", "criar")} className="mt-1 inline-block text-sm font-semibold text-accent hover:underline">
              Comece um no Estúdio.
            </a>
          </div>
        ) : visiveis.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">Nenhum post seu neste filtro.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visiveis.map((p, i) => (
              <li key={p.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
                <CartaoPost post={p} onAbrir={() => abrir(p)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {postAberto && <DetalhePost postId={postAberto} onFechar={fechar} />}
    </>
  );
}

// ─── Cartão leve do post (refino aprovado: aspect-video, sem legenda) ────

function CartaoPost({ post, onAbrir }: { post: Post; onAbrir: () => void }) {
  const { sel } = useHub();
  const estado = sel.estadoPost(post);
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;
  const pedido = Boolean(item?.card.pedido);
  const urgente = estado.chave === "publicar_hoje" || estado.chave === "atrasado";
  const semArte = post.estado === "rascunho" && !post.tituloArte;

  return (
    <button
      type="button"
      onClick={onAbrir}
      className={cn(
        "flex h-full w-full flex-col rounded-3xl bg-card p-4 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky",
        urgente && "ring-1 ring-warning/50",
      )}
    >
      {semArte ? (
        <div className="mb-3 flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-2xl bg-navy-soft text-muted-foreground">
          <ImageIcon aria-hidden className="h-5 w-5" />
          <span className="text-[11px]">sem arte ainda</span>
        </div>
      ) : (
        <img src={post.arteUrl} alt="" className="mb-3 aspect-video w-full rounded-2xl bg-navy-soft object-cover" />
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <EstadoPost estado={estado} />
        {pedido && (
          <span className="rounded-full bg-sky-soft px-2.5 py-0.5 font-display text-[10px] font-bold text-primary">Pedido externo</span>
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 font-display text-sm font-bold leading-snug text-foreground">{post.titulo}</h3>
      {post.estado === "reprovado" && post.motivoReprovacao && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-destructive">{post.motivoReprovacao}</p>
      )}
      <p className="mt-auto flex items-center gap-1.5 pt-3 text-[11px] text-muted-foreground">
        {item ? (
          <>
            <Link2 aria-hidden className="h-3 w-3 shrink-0 text-primary" />
            <span className="truncate">
              No card <span className="font-semibold text-primary">{item.card.titulo}</span>
            </span>
          </>
        ) : (
          <span className="rounded-full border border-dashed border-border px-2 py-0.5">Fora de card</span>
        )}
        <span className="ml-auto shrink-0">{ddmm(post.atualizadoEm)}</span>
      </p>
    </button>
  );
}

// ─── Precisa de você (ContadorPrecisa do real) ───────────────────────────

function ContadorPrecisa({
  cor,
  titulo,
  subtitulo,
  n,
  aberto,
  onToggle,
  children,
  rodape,
}: {
  cor: "accent" | "sky";
  titulo: string;
  subtitulo: string;
  n: number;
  aberto: boolean;
  onToggle: () => void;
  children: ReactNode;
  rodape?: ReactNode;
}) {
  const borda = cor === "accent" ? "border-accent" : "border-sky";
  const bolha = cor === "accent" ? "bg-orange-soft text-accent" : "bg-sky-soft text-primary";
  return (
    <div className={cn("rounded-3xl border-l-4 bg-card shadow-card", borda)}>
      <button type="button" aria-expanded={aberto} onClick={onToggle} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold", bolha)}>{n}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-sm font-bold text-foreground">{titulo}</span>
          <span className="block text-[11px] text-muted-foreground">{subtitulo}</span>
        </span>
        <span className="shrink-0 text-[11px] font-bold text-muted-foreground">{aberto ? "fechar" : "ver"}</span>
      </button>
      {aberto && (
        <div className="animate-rise px-4 pb-4">
          <ul className="space-y-1.5">{children}</ul>
          {rodape && <div className="mt-3 px-1">{rodape}</div>}
        </div>
      )}
    </div>
  );
}

function ItemPrecisa({
  post,
  acao,
  cor,
  detalhe,
  onClick,
  href,
}: {
  post: Post;
  acao: string;
  cor: string;
  detalhe?: string;
  onClick?: () => void;
  href?: string;
}) {
  const conteudo = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-semibold text-primary">{post.titulo}</span>
        {detalhe && <span className="shrink-0 text-[11px] text-muted-foreground">de {detalhe}</span>}
      </span>
      <span className={cn("shrink-0 font-display text-[11px] font-bold", cor)}>{acao}</span>
    </>
  );
  const classe =
    "flex w-full items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-4 py-2.5 text-left transition-colors duration-300 hover:bg-secondary";
  return (
    <li>
      {href ? (
        <a href={href} className={classe}>
          {conteudo}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={classe}>
          {conteudo}
        </button>
      )}
    </li>
  );
}

function Pilula({
  ativa,
  onClick,
  n,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  n?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativa}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 font-display text-[11px] font-bold transition-all duration-300",
        ativa ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-card hover:text-primary",
      )}
    >
      {children}
      {n !== undefined && <span className={cn("ml-1", ativa ? "opacity-80" : "opacity-60")}>{n}</span>}
    </button>
  );
}
