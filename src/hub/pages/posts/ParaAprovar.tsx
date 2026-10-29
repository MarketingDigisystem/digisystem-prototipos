/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/AprovacoesView.tsx, src/components/estudio/PainelParecerPost.tsx,
 *   src/components/estudio/ArteAjustePanel.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Posts → Para aprovar (proposta 5 e 6). Só Aprovador e Admin: o shell barra
 * os outros papéis antes de chegar aqui.
 *  - Fila em grade (mais antigo primeiro) + "Decisões recentes" à direita,
 *    como a AprovacoesView real. "Ver tarefa de ajuste" vira "Ver card".
 *  - Modal com a imagem única, o parecer da IA sob demanda (B-02 corrigido:
 *    lê título e subtítulo DA ARTE; hashtags sugeridas só com a primeira letra
 *    maiúscula), o conteúdo e a barra de decisão fixa (max-h, rolagem interna).
 *  - Aprovar confirma ou troca a data sugerida (novo, proposta 5). Reprovar
 *    pede o motivo e abre o problema "Reprovado" no item do card (4.4).
 *  - Autor não decide o próprio post (regras.podeDecidirPost).
 *  - "Assumir revisão" dá dono à fila; Aprovar/Reprovar seguem disponíveis
 *    para quem pode decidir (paridade com o real).
 */
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowUpRight, Check, Hash, Image as ImageIcon, UploadCloud, X } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { TextGenerateDigisystem } from "../../../TextGenerateDigisystem";
import { cn } from "../../../lib/utils";
import { BotaoCriarPost, CabecalhoArea } from "../../components/CabecalhoArea";
import { Avatar } from "../../components/CardTarefa";
import { EstadoPost } from "../../components/EstadoPost";
import { ContornoProntidao, corProntidao } from "../../components/PedidoDialog";
import { hrefDe, navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { arteDesigner } from "../../store/mock-arte";
import { parecerDoPost, type ParecerPost, type PontoParecer } from "../../store/mock-geracao";
import { contarPalavras, dataSugeridaInicial, ddmm, diaDe, legendaSemBlocoCtas, plural } from "../../store/regras";
import type { Post, Rede } from "../../store/tipos";

const REDE: Record<Rede, string> = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };
/** Cores das redes (REDE_META do real, mesmas de trend-platform). */
const REDE_COR: Record<Rede, string> = {
  instagram: "bg-orange-soft text-accent",
  linkedin: "bg-sky-soft text-primary",
  youtube: "bg-destructive/10 text-destructive",
  facebook: "bg-navy-soft text-primary",
};

const rotuloSecao = "font-display text-[11px] font-bold uppercase tracking-wide text-primary";
const botaoAprovar =
  "inline-flex items-center gap-1.5 rounded-full bg-success px-4 py-2 font-display text-xs font-bold text-success-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40";
const botaoReprovar =
  "inline-flex items-center gap-1.5 rounded-full bg-destructive px-4 py-2 font-display text-xs font-bold text-destructive-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40";
const botaoAssumir =
  "inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 font-display text-[11px] font-bold text-primary-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5";
const botaoDiscreto =
  "px-2 py-1.5 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary";

type Modo = "aprovar" | "reprovar" | null;

/** Dias inteiros entre dois YYYY-MM-DD. */
function diasEntre(de: string, ate: string): number {
  const [a1, m1, d1] = de.split("-").map(Number);
  const [a2, m2, d2] = ate.split("-").map(Number);
  return Math.round((new Date(a2, m2 - 1, d2).getTime() - new Date(a1, m1 - 1, d1).getTime()) / 86_400_000);
}

function haQuanto(iso: string, hoje: string): string {
  const n = diasEntre(diaDe(iso), hoje);
  if (n <= 0) return "hoje";
  if (n === 1) return "ontem";
  return `há ${n} dias`;
}

const primeiroNome = (nome?: string) => nome?.split(" ")[0] ?? "alguém do time";

// ─── Página ──────────────────────────────────────────────────────────────

export function ParaAprovar({ rota }: { rota: Rota }) {
  const { dados, usuario, hoje } = useHub();
  const [preset, setPreset] = useState<Modo>(null);
  const postAberto = rota.params.post;

  const fila = useMemo(
    () => dados.posts.filter((p) => p.estado === "enviado").sort((a, b) => a.atualizadoEm.localeCompare(b.atualizadoEm)),
    [dados.posts],
  );
  const meus = fila.filter((p) => p.autorId === usuario.id).length;
  const emRevisao = fila.filter((p) => p.emRevisaoPor).length;
  const comigo = fila.filter((p) => p.emRevisaoPor === usuario.id).length;

  const abrir = (p: Post, modo: Modo = null) => {
    setPreset(modo);
    navegar("posts", "aprovar", { post: p.id });
  };
  const fechar = () => {
    setPreset(null);
    navegar("posts", "aprovar");
  };

  // Resumo em uma frase (sem contadores em grade).
  let resumo: ReactNode;
  if (fila.length === 0) {
    resumo = "Nenhum post esperando decisão agora.";
  } else {
    const partes = [`${plural(fila.length, "post espera", "posts esperam")} decisão`];
    if (emRevisao) partes.push(`${emRevisao} já ${emRevisao === 1 ? "tem" : "têm"} alguém revisando${comigo ? ` (${comigo} com você)` : ""}`);
    if (meus) partes.push(`${meus} ${meus === 1 ? "é seu e fica" : "são seus e ficam"} para outra pessoa decidir`);
    resumo = (
      <>
        {partes.join(", ")}. O mais antigo chegou <span className="font-semibold text-foreground">{haQuanto(fila[0].atualizadoEm, hoje)}</span>.
      </>
    );
  }

  return (
    <>
      <CabecalhoArea
        area="posts"
        aba="aprovar"
        subtitulo="Posts do time esperando a sua decisão."
        actions={<BotaoCriarPost />}
      />

      <p className="animate-rise mt-8 max-w-3xl font-display text-lg leading-snug text-primary sm:text-xl" style={{ animationDelay: "60ms" }}>
        {resumo}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="animate-rise min-w-0" style={{ animationDelay: "120ms" }}>
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
            Fila de aprovação <span className="text-muted-foreground">· {fila.length}</span>
          </h2>
          {fila.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-border px-6 py-10 text-center">
              <IaDigisystem size={48} />
              <p className="mt-3 font-display text-base font-bold text-primary">A fila está em dia.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Os aprovados estão no{" "}
                <a href={hrefDe("posts", "calendario")} className="font-semibold text-accent hover:underline">
                  Calendário
                </a>
                , esperando a data de publicação.
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 xl:grid-cols-2">
              {fila.map((p, i) => (
                <li key={p.id} className="animate-rise" style={{ animationDelay: `${160 + Math.min(i, 6) * 70}ms` }}>
                  <CartaoFila post={p} onAbrir={(modo) => abrir(p, modo)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <DecisoesRecentes />
      </div>

      {postAberto && <ModalPost key={postAberto} postId={postAberto} modoInicial={preset} onFechar={fechar} />}
    </>
  );
}

// ─── Cartão da fila (card da AprovacoesView, em linha) ───────────────────

function CartaoFila({ post, onAbrir }: { post: Post; onAbrir: (modo?: Modo) => void }) {
  const { usuario, hoje, sel, acoes } = useHub();
  const autor = sel.usuarioPorId(post.autorId);
  const revisor = sel.usuarioPorId(post.emRevisaoPor);
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;
  const proprio = post.autorId === usuario.id;
  const pode = sel.podeDecidirPost(post).ok;
  const dataPassou = post.dataSugerida && post.dataSugerida < hoje;

  return (
    <article className="flex h-full flex-col rounded-3xl bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onAbrir()}
          aria-label={`Abrir a arte do post ${post.titulo}`}
          className="w-28 shrink-0 overflow-hidden rounded-2xl bg-secondary transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          <img src={post.arteUrl} alt="" className="aspect-square w-full object-cover" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-warning-soft px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-warning">
              Aguardando
            </span>
            {post.redes.map((r) => (
              <span key={r} className="rounded-full bg-secondary px-2 py-0.5 font-display text-[10px] font-bold text-muted-foreground">
                {REDE[r]}
              </span>
            ))}
          </div>
          <button type="button" onClick={() => onAbrir()} className="mt-1.5 block text-left">
            <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-foreground transition-colors duration-300 hover:text-primary">
              {post.titulo}
            </h3>
          </button>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{post.legenda}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Avatar usuario={autor} tamanho="h-6 w-6" rotulo="Autor" />
        <span className="min-w-0 truncate">
          {primeiroNome(autor?.nome)} · enviou {haQuanto(post.atualizadoEm, hoje)}
        </span>
        <span className={cn("ml-auto shrink-0", dataPassou && "font-semibold text-warning")}>
          {post.dataSugerida ? `sugere ${ddmm(post.dataSugerida)}` : "sem data sugerida"}
        </span>
      </div>
      {item && (
        <a
          href={hrefDe("tarefas", "quadro", { card: item.card.id })}
          className="mt-1 truncate text-[11px] text-muted-foreground transition-colors duration-300 hover:text-primary"
        >
          No card <span className="font-semibold text-primary">{item.card.titulo}</span>
          {item.tipo === "subtarefa" && ` · ${item.titulo}`}
        </a>
      )}

      <div aria-hidden className="min-h-3 flex-1" />
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {proprio ? (
          // Autor não decide o próprio post: no cartão fica só o aviso (o modal mostra os botões desativados).
          <p className="py-1.5 text-[11px] text-muted-foreground">
            Você é o autor. A decisão cabe a outro aprovador
            {revisor && post.emRevisaoPor !== usuario.id ? `, e ${primeiroNome(revisor.nome)} já está revisando` : ""}.
          </p>
        ) : (
          <>
            {revisor ? (
              <span className="mr-auto min-w-0 truncate text-[11px] text-muted-foreground">
                Em revisão por: <span className="font-semibold text-foreground">{post.emRevisaoPor === usuario.id ? "você" : revisor.nome}</span>
              </span>
            ) : (
              <button type="button" onClick={() => acoes.assumirRevisao(post.id)} className={cn(botaoAssumir, "mr-auto")}>
                Assumir revisão
              </button>
            )}
            <button type="button" disabled={!pode} onClick={() => onAbrir("reprovar")} className={botaoReprovar}>
              Reprovar
            </button>
            <button type="button" disabled={!pode} onClick={() => onAbrir("aprovar")} className={botaoAprovar}>
              Aprovar
            </button>
          </>
        )}
      </div>
    </article>
  );
}

// ─── Decisões recentes (derivadas: aprovações dos posts + problemas "Reprovado") ─

type Decisao = { id: string; tipo: "aprovado" | "reprovado"; em: string; por?: string; motivo?: string; post?: Post; cardId?: string };

function DecisoesRecentes() {
  const { dados, sel } = useHub();
  const decisoes = useMemo(() => {
    const lista: Decisao[] = [
      ...dados.posts
        .filter((p) => p.aprovadoEm)
        .map((p) => ({
          id: `a-${p.id}`,
          tipo: "aprovado" as const,
          em: p.aprovadoEm as string,
          por: p.aprovadoPor,
          post: p,
          cardId: p.itemId ? sel.itemPorId(p.itemId)?.card.id : undefined,
        })),
      ...dados.problemas
        .filter((pr) => pr.tipo === "reprovado" && pr.alvo.tipo === "post")
        .map((pr) => ({
          id: pr.id,
          tipo: "reprovado" as const,
          em: pr.abertoEm,
          por: pr.abertoPor,
          motivo: pr.motivo,
          post: dados.posts.find((p) => p.id === pr.alvo.id),
          cardId: pr.cardId,
        })),
    ];
    return lista.sort((a, b) => b.em.localeCompare(a.em)).slice(0, 8);
  }, [dados.posts, dados.problemas, sel]);

  return (
    <aside className="animate-rise space-y-3" style={{ animationDelay: "200ms" }}>
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary">Decisões recentes</h2>
      {decisoes.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-6 text-center text-xs text-muted-foreground shadow-card">Ainda não há decisões registradas.</p>
      ) : (
        <ol className="space-y-2">
          {decisoes.map((d) => (
            <li key={d.id} className="rounded-2xl bg-card px-4 py-3 shadow-card">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide",
                    d.tipo === "aprovado" ? "bg-success-soft text-success" : "bg-destructive/10 text-destructive",
                  )}
                >
                  {d.tipo}
                </span>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {new Date(d.em).toLocaleString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-foreground">{d.post?.titulo ?? "Post removido"}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                por {primeiroNome(sel.usuarioPorId(d.por)?.nome)}
                {d.motivo ? ` · ${d.motivo}` : ""}
              </p>
              {d.cardId && (
                <a
                  href={hrefDe("tarefas", "quadro", { card: d.cardId })}
                  className="mt-1.5 inline-flex items-center gap-1 font-display text-[11px] font-bold text-primary transition-colors duration-300 hover:text-accent"
                >
                  Ver card <ArrowUpRight aria-hidden className="h-3 w-3" />
                </a>
              )}
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

// ─── Modal do post (arte única + parecer + barra de decisão fixa) ────────

function ModalPost({ postId, modoInicial, onFechar }: { postId: string; modoInicial: Modo; onFechar: () => void }) {
  const { sel } = useHub();
  const idTitulo = useId();
  const post = sel.postPorId(postId);

  useEffect(() => {
    const onTecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onTecla);
    return () => window.removeEventListener("keydown", onTecla);
  }, [onFechar]);

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Fechar o post" onClick={onFechar} className="absolute inset-0 bg-primary/25 backdrop-blur-[2px]" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="animate-tela-abrindo relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-background shadow-float sm:max-h-[90vh] sm:w-[min(95vw,72rem)] sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-start gap-4 border-b border-border bg-card px-6 pb-4 pt-5">
          <div className="min-w-0 flex-1">
            <h2 id={idTitulo} className="truncate font-display text-lg font-bold text-primary">
              Arte do post: {post?.titulo ?? "post não encontrado"}
            </h2>
            {post && <CabecalhoPost post={post} />}
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            title="Fechar (Esc)"
            className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors duration-300 hover:bg-secondary hover:text-primary sm:mr-10"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {post ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
                <ColunaArte post={post} />
                <div className="min-w-0 space-y-4">
                  <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
                    <p className={cn(rotuloSecao, "mb-3")}>Parecer da IA</p>
                    <PainelParecerPost post={post} />
                  </section>
                  <ConteudoPost post={post} />
                </div>
              </div>
            </div>
            <BarraDecisao post={post} modoInicial={modoInicial} onDecidido={onFechar} />
          </>
        ) : (
          <p className="px-6 py-10 text-sm text-muted-foreground">Este post não existe mais. Os outros continuam na fila.</p>
        )}
      </section>
    </div>
  );
}

function CabecalhoPost({ post }: { post: Post }) {
  const { sel } = useHub();
  const autor = sel.usuarioPorId(post.autorId);
  return (
    <p className="mt-1 truncate text-xs text-muted-foreground">
      {post.formato} · por {autor?.nome ?? "alguém do time"} · {post.segmento}
    </p>
  );
}

// ── Coluna esquerda: arte + gate de edição ───────────────────────────────

function ColunaArte({ post }: { post: Post }) {
  const { usuario, sel, acoes } = useHub();
  const [versao, setVersao] = useState<"designer" | "ia">("designer");
  const revisor = sel.usuarioPorId(post.emRevisaoPor);
  const assumidaPorMim = post.emRevisaoPor === usuario.id;
  const proprio = post.autorId === usuario.id;
  const src = post.arteAnteriorUrl && versao === "ia" ? post.arteAnteriorUrl : post.arteUrl;

  return (
    <div className="min-w-0 space-y-3 rounded-3xl bg-card p-4 shadow-card lg:sticky lg:top-0 lg:self-start">
      <div className="flex items-center justify-between gap-2">
        <p className={rotuloSecao}>Arte</p>
        {post.arteAnteriorUrl && (
          <div role="group" aria-label="Versão da arte" className="flex w-fit items-center gap-1 rounded-full bg-secondary p-1">
            {(
              [
                ["designer", "Designer"],
                ["ia", "IA"],
              ] as const
            ).map(([id, rotulo]) => (
              <button
                key={id}
                type="button"
                aria-pressed={versao === id}
                onClick={() => setVersao(id)}
                className={cn(
                  "rounded-full px-3 py-1 font-display text-[11px] font-bold transition-all duration-300",
                  versao === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary",
                )}
              >
                {rotulo}
              </button>
            ))}
          </div>
        )}
      </div>
      {src ? (
        <img src={src} alt={`Arte do post ${post.titulo}`} className="max-h-[42vh] w-full rounded-2xl bg-navy-soft object-contain" />
      ) : (
        <div className="flex h-[42vh] w-full items-center justify-center rounded-2xl bg-navy-soft text-muted-foreground">
          <ImageIcon aria-hidden className="h-7 w-7" />
        </div>
      )}

      {post.estado !== "enviado" ? null : assumidaPorMim ? (
        <div className="space-y-2 rounded-2xl bg-navy-soft px-4 py-3">
          <p className="text-xs text-primary">Revisão com você. Se a arte precisar de ajuste fino, suba a versão do designer aqui.</p>
          <button
            type="button"
            onClick={() => acoes.trocarArte(post.id, arteDesigner(post.tituloArte || post.titulo, post.subtituloArte))}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 font-display text-[11px] font-bold text-primary transition-all duration-300 hover:-translate-y-0.5"
          >
            <UploadCloud aria-hidden className="h-3.5 w-3.5" /> {post.arteAnteriorUrl ? "Enviar nova versão" : "Enviar versão do designer"}
          </button>
          <p className="text-[11px] text-muted-foreground">No protótipo, a versão nova é uma arte de exemplo, sem escolher arquivo.</p>
        </div>
      ) : revisor ? (
        <p className="rounded-2xl bg-navy-soft px-4 py-3 text-xs text-primary">
          Em revisão com {revisor.nome}. Só quem está revisando mexe na arte.
        </p>
      ) : proprio ? (
        <p className="rounded-2xl bg-navy-soft px-4 py-3 text-xs text-primary">
          Você é o autor. Ajustes na arte ficam em Meus posts, com a versão do designer.
        </p>
      ) : (
        <div className="space-y-2 rounded-2xl bg-navy-soft px-4 py-3">
          <p className="text-xs text-primary">Assuma a revisão para editar a arte.</p>
          <button type="button" onClick={() => acoes.assumirRevisao(post.id)} className={botaoAssumir}>
            Assumir revisão
          </button>
        </div>
      )}
    </div>
  );
}

// ── Parecer da IA (PainelParecerPost real, sob demanda) ───────────────────

const NIVEL: Record<ParecerPost["nivel"], { selo: string; rotulo: string }> = {
  verde: { selo: "bg-success-soft text-success", rotulo: "Pode publicar" },
  ambar: { selo: "bg-warning-soft text-warning", rotulo: "Dá uma olhada" },
  vermelho: { selo: "bg-destructive/10 text-destructive", rotulo: "Revise antes" },
};
const ETAPAS = ["Lendo o post…", "Cruzando com o padrão da marca…"];
const MS_POR_ETAPA = 2000;
/** O real guarda o parecer em cache: reabrir o mesmo post mostra o resultado direto. */
const analisados = new Set<string>();

function PainelParecerPost({ post }: { post: Post }) {
  const { hoje } = useHub();
  const [fase, setFase] = useState<"repouso" | "analisando" | "pronto">(() => (analisados.has(post.id) ? "pronto" : "repouso"));
  const [etapa, setEtapa] = useState(0);
  const parecer = useMemo(() => parecerDoPost(post, hoje), [post, hoje]);

  useEffect(() => {
    if (fase !== "analisando") return;
    setEtapa(0);
    const timers = [
      window.setTimeout(() => setEtapa(1), MS_POR_ETAPA),
      window.setTimeout(() => {
        analisados.add(post.id);
        setFase("pronto");
      }, MS_POR_ETAPA * ETAPAS.length),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [fase, post.id]);

  if (fase === "repouso") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFase("analisando")}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 font-display text-xs font-bold text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5"
        >
          <IaDigisystem size={20} /> Analisar com a IA
        </button>
        <p className="text-[11px] text-muted-foreground">Lê o título e o subtítulo da arte, a legenda, as hashtags e as chamadas.</p>
      </div>
    );
  }

  if (fase === "analisando") {
    return (
      <div className="ia-borda-analise bg-card p-6" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-center">
          <IaDigisystem size={64} estado="processando" animarEntrada />
          <TextGenerateDigisystem key={etapa} texto={ETAPAS[etapa]} className="text-xs text-muted-foreground" />
        </div>
      </div>
    );
  }

  const nivel = NIVEL[parecer.nivel];
  const cor = corProntidao(parecer.prontidao);
  return (
    <div className="parecer-settle relative rounded-3xl border border-border p-5">
      <ContornoProntidao pct={parecer.prontidao} />
      <div className="relative">
        <div className="flex items-center gap-2">
          <IaDigisystem size={28} />
          <span className={cn("rounded-full px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wide", nivel.selo)}>{nivel.rotulo}</span>
          <button
            type="button"
            onClick={() => setFase("analisando")}
            className="ml-auto font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
          >
            Analisar de novo
          </button>
        </div>
        <h4 className="mt-3 font-display text-base font-bold text-primary">{parecer.titulo}</h4>
        <TextGenerateDigisystem texto={parecer.resumo} className="mt-1.5 text-sm text-muted-foreground" />

        {parecer.atencao.length > 0 && (
          <div className="mt-4">
            <p className="font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Pontos de atenção</p>
            <ul className="mt-2 space-y-2">
              {parecer.atencao.map((p) => (
                <ItemParecer key={p.rotulo} ponto={p} />
              ))}
            </ul>
          </div>
        )}
        {parecer.conformidade.length > 0 && (
          <div className="mt-4">
            <p className="font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Conformidade</p>
            <ul className="mt-2 space-y-1.5">
              {parecer.conformidade.map((p) => (
                <li key={p.rotulo} className="flex items-start gap-2 text-xs">
                  <IconePonto tipo="ok" />
                  <span className="min-w-0">
                    <span className="font-display text-[13px] font-bold text-foreground">{p.rotulo}</span>
                    <span className="text-muted-foreground"> · {p.detalhe}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-3">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Prontidão</p>
            <p className="font-display text-2xl font-bold leading-none" style={{ color: cor }}>
              {parecer.prontidao}%
            </p>
          </div>
          <p className="text-right text-[11px] italic text-muted-foreground">Sugestão. A decisão é sua.</p>
        </div>
      </div>
    </div>
  );
}

function IconePonto({ tipo }: { tipo: PontoParecer["tipo"] }) {
  const cfg = {
    atencao: { Icone: AlertTriangle, classe: "bg-warning-soft text-warning" },
    tecnico: { Icone: Hash, classe: "bg-sky-soft text-primary" },
    ok: { Icone: Check, classe: "bg-success-soft text-success" },
  }[tipo];
  return (
    <span aria-hidden className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full", cfg.classe)}>
      <cfg.Icone className="h-3.5 w-3.5" />
    </span>
  );
}

function ItemParecer({ ponto }: { ponto: PontoParecer }) {
  return (
    <li className="flex gap-2.5 rounded-2xl bg-secondary/30 p-3">
      <IconePonto tipo={ponto.tipo} />
      <div className="min-w-0">
        <p className="font-display text-[13px] font-bold text-foreground">{ponto.rotulo}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{ponto.detalhe}</p>
        {ponto.sugestao && (
          <p className="mt-1.5 rounded-xl bg-success-soft px-2.5 py-1.5 text-[11px] text-success">
            <span className="font-semibold">Sugestão:</span> {ponto.sugestao}
          </p>
        )}
      </div>
    </li>
  );
}

// ── Conteúdo, classificação e onde o post está ───────────────────────────

function ConteudoPost({ post }: { post: Post }) {
  const { dados, sel } = useHub();
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;
  const tendencia = dados.tendencias.find((t) => t.id === post.trendId);
  const pt = contarPalavras(post.tituloArte);
  const ps = contarPalavras(post.subtituloArte);

  return (
    <>
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className={rotuloSecao}>Conteúdo do post</p>
        <div className="flex flex-wrap gap-1.5">
          {post.redes.map((r) => (
            <span key={r} className={cn("rounded-full px-3 py-1 font-display text-[11px] font-bold", REDE_COR[r])}>
              {REDE[r]}
            </span>
          ))}
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Título da arte · {pt}/8</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">{post.tituloArte || "Sem título"}</dd>
          </div>
          <div className="min-w-0">
            <dt className="font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Subtítulo da arte · {ps}/12</dt>
            <dd className="mt-1 text-sm text-foreground">{post.subtituloArte || "Vazio"}</dd>
          </div>
        </dl>
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Legenda</p>
          {/* As chamadas aparecem logo abaixo; o bloco "[Rede]: chamada" da legenda gravada (D4) não se repete aqui. */}
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{legendaSemBlocoCtas(post.legenda)}</p>
        </div>
        {post.ctas.length > 0 && (
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Chamadas</p>
            <ul className="mt-1 space-y-1">
              {post.ctas.map((c) => (
                <li key={c.texto} className="text-xs text-foreground">
                  <span className="font-semibold text-primary">{c.plataformas.map((r) => REDE[r]).join(", ")}:</span> {c.texto}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className={rotuloSecao}>Classificação</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Segmento:</span> {post.segmento} ·{" "}
          <span className="font-semibold text-foreground">Formato:</span> {post.formato}
        </p>
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.map((h) => (
              <span key={h} className="rounded-full bg-sky-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                {h}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className={rotuloSecao}>Onde está</p>
        {item ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="min-w-0 flex-1 text-xs text-muted-foreground">
              No card <span className="font-semibold text-primary">{item.card.titulo}</span>
              {item.tipo === "subtarefa" && <> · subtarefa {item.titulo}</>}
            </p>
            <a
              href={hrefDe("tarefas", "quadro", { card: item.card.id })}
              className="inline-flex items-center gap-1 font-display text-[11px] font-bold text-primary transition-colors duration-300 hover:text-accent"
            >
              Ver card <ArrowUpRight aria-hidden className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Fora de card.</p>
        )}
        {tendencia && (
          <p className="text-xs text-muted-foreground">
            Nasceu da tendência <span className="font-semibold text-foreground">{tendencia.titulo}</span>.
          </p>
        )}
        {post.observacao && (
          <p className="rounded-xl bg-secondary px-3 py-2 text-xs text-foreground">
            <span className="font-semibold">Observação do autor:</span> {post.observacao}
          </p>
        )}
      </section>
    </>
  );
}

// ── Barra de decisão fixa (rodapé do modal) ──────────────────────────────

function BarraDecisao({ post, modoInicial, onDecidido }: { post: Post; modoInicial: Modo; onDecidido: () => void }) {
  const { usuario, hoje, sel, acoes } = useHub();
  const pode = sel.podeDecidirPost(post);
  const [modo, setModo] = useState<Modo>(pode.ok ? modoInicial : null);
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;
  const prazoItem = item ? (item.tipo === "card" ? item.card.prazo : item.sub.prazo) : undefined;
  const [data, setData] = useState(() => dataSugeridaInicial(hoje, post.dataSugerida, prazoItem));
  const [motivo, setMotivo] = useState("");
  const revisor = sel.usuarioPorId(post.emRevisaoPor);
  const proprio = post.autorId === usuario.id;
  const idData = useId();
  const idMotivo = useId();

  const barra = "shrink-0 border-t border-border bg-card/95 px-6 py-3 backdrop-blur";

  // Já decidido (aberto por link): só leitura.
  if (post.estado !== "enviado") {
    const aprovador = sel.usuarioPorId(post.aprovadoPor);
    return (
      <div className={cn(barra, "flex flex-wrap items-center gap-2")}>
        <EstadoPost estado={sel.estadoPost(post)} />
        <span className="text-xs text-muted-foreground">
          {post.estado === "reprovado"
            ? "Este post já foi reprovado e voltou para o autor ajustar."
            : post.estado === "rascunho"
              ? "Este post ainda é rascunho."
              : `Decidido por ${aprovador?.nome ?? "quem aprova"}. Ele saiu da fila.`}
        </span>
      </div>
    );
  }

  const aprovar = (comData: boolean) => {
    if (acoes.aprovarPost(post.id, comData ? data || undefined : undefined).ok) onDecidido();
  };
  const reprovar = () => {
    if (acoes.reprovarPost(post.id, motivo).ok) onDecidido();
  };

  if (modo === "aprovar") {
    const trocou = Boolean(post.dataSugerida && data && data !== post.dataSugerida);
    return (
      <div className={cn(barra, "animate-rise space-y-2")}>
        <div className="flex flex-wrap items-end gap-3">
          <label htmlFor={idData} className="block">
            <span className="font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Publicar em</span>
            <input
              id={idData}
              type="date"
              value={data}
              min={hoje}
              onChange={(e) => setData(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
            />
          </label>
          <p className="min-w-0 flex-1 pb-1 text-[11px] leading-snug text-muted-foreground">
            {post.dataSugerida
              ? post.dataSugerida < hoje
                ? `A data sugerida pelo autor (${ddmm(post.dataSugerida)}) já passou. Escolha outra.`
                : trocou
                  ? `Você trocou a data sugerida pelo autor (${ddmm(post.dataSugerida)}).`
                  : `Data sugerida pelo autor. Confirme ou troque.`
              : "O autor não sugeriu data. Escolha uma ou aprove sem data."}{" "}
            O card passa a mostrar a data, e ela aparece no Calendário.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setModo(null)} className={botaoDiscreto}>
              Cancelar
            </button>
            <button type="button" onClick={() => aprovar(false)} className={botaoDiscreto}>
              Aprovar sem data
            </button>
            <button type="button" disabled={!data} onClick={() => aprovar(true)} className={botaoAprovar}>
              <Check aria-hidden className="h-3.5 w-3.5" /> Confirmar aprovação
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modo === "reprovar") {
    return (
      <div className={cn(barra, "animate-rise space-y-2")}>
        <label htmlFor={idMotivo} className="font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Motivo da reprovação
        </label>
        <textarea
          id={idMotivo}
          rows={2}
          autoFocus
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="O que precisa ser ajustado?"
          className="block w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
        />
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-muted-foreground">
            O autor vê o motivo no card e na Minha mesa, ajusta e reenvia. O reenvio volta para esta fila.
          </p>
          <button type="button" onClick={() => setModo(null)} className={botaoDiscreto}>
            Cancelar
          </button>
          <button type="button" disabled={!motivo.trim()} onClick={reprovar} className={botaoReprovar}>
            Confirmar reprovação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(barra, "flex flex-wrap items-center gap-2")}>
      {proprio ? (
        <span className="mr-auto text-xs text-muted-foreground">Você é o autor deste post. A decisão cabe a outro aprovador.</span>
      ) : revisor ? (
        <span className="mr-auto text-xs text-muted-foreground">
          Em revisão por: <span className="font-semibold text-foreground">{post.emRevisaoPor === usuario.id ? "você" : revisor.nome}</span>
        </span>
      ) : (
        <button type="button" onClick={() => acoes.assumirRevisao(post.id)} className={cn(botaoAssumir, "mr-auto")}>
          Assumir revisão
        </button>
      )}
      <button type="button" disabled={!pode.ok} onClick={() => setModo("reprovar")} className={botaoReprovar}>
        Reprovar
      </button>
      <button type="button" disabled={!pode.ok} onClick={() => setModo("aprovar")} className={botaoAprovar}>
        Aprovar
      </button>
    </div>
  );
}
