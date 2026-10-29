/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/biblioteca/index.tsx, src/routes/_authenticated/biblioteca/$postId.tsx
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Posts → Publicados (proposta 2.4 e 6): o acervo do time, a antiga Biblioteca.
 *  - Só posts publicados. Os 6 contadores de status do real saem (só há um
 *    estado aqui); ficam a busca "por título, legenda ou hashtag", o filtro por
 *    rede e o alternador cards/lista do real.
 *  - Sem restrição de privacidade (K6): todo o time vê o acervo inteiro.
 *  - Em vez de uma grade corrida, o acervo é agrupado por mês de publicação.
 *  - ?post=<id> abre o detalhe em painel (é para onde /biblioteca/{id} redireciona).
 */
import { useMemo, useState, type ReactNode } from "react";
import { LayoutGrid, Rows3, Search, X } from "lucide-react";
import { BotaoCriarPost, CabecalhoArea } from "../../components/CabecalhoArea";
import { DetalhePost } from "../../components/DetalhePost";
import { REDE_META, REDES } from "../../components/RedeIcone";
import { cn } from "../../../lib/utils";
import { hrefDe, navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { ddmm, diaDe, plural, somarDias } from "../../store/regras";
import type { Post, Rede } from "../../store/tipos";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

/** Dia em que o post foi ao ar. */
const diaPublicado = (p: Post) => diaDe(p.publicadoEm ?? p.dataPublicacao ?? p.atualizadoEm);

/** Busca sem diferença de acento e de maiúscula. */
const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function Publicados({ rota }: { rota: Rota }) {
  const { dados, hoje } = useHub();
  const [busca, setBusca] = useState("");
  const [rede, setRede] = useState<Rede | "todas">("todas");
  const [modo, setModo] = useState<"cards" | "lista">("cards");
  const postAberto = rota.params.post;

  const publicados = useMemo(
    () => dados.posts.filter((p) => p.estado === "publicado").sort((a, b) => diaPublicado(b).localeCompare(diaPublicado(a))),
    [dados.posts],
  );
  const redesPresentes = REDES.filter((r) => publicados.some((p) => p.redes.includes(r)));

  const termo = normalizar(busca.trim());
  const visiveis = publicados.filter(
    (p) =>
      (rede === "todas" || p.redes.includes(rede)) &&
      (!termo || normalizar([p.titulo, p.legenda, p.tituloArte, ...p.hashtags].join(" ")).includes(termo)),
  );
  const filtrando = termo !== "" || rede !== "todas";

  // Agrupado por mês de publicação, do mais recente para o mais antigo.
  const grupos = useMemo(() => {
    const mapa = new Map<string, Post[]>();
    for (const p of visiveis) {
      const chave = diaPublicado(p).slice(0, 7);
      mapa.set(chave, [...(mapa.get(chave) ?? []), p]);
    }
    return [...mapa.entries()];
  }, [visiveis]);

  const semana = publicados.filter((p) => diaPublicado(p) > somarDias(hoje, -7)).length;
  const maisRecente = publicados[0];

  const abrir = (p: Post) => navegar("posts", "publicados", { post: p.id });
  const fechar = () => navegar("posts", "publicados");
  const limpar = () => {
    setBusca("");
    setRede("todas");
  };

  return (
    <>
      <CabecalhoArea
        area="posts"
        aba="publicados"
        subtitulo="O acervo do que já foi ao ar, para todo o time consultar."
        actions={<BotaoCriarPost />}
      />

      {publicados.length > 0 && (
        <p className="animate-rise mt-8 max-w-3xl text-[15px] leading-relaxed text-foreground/85" style={{ animationDelay: "70ms" }}>
          {plural(publicados.length, "post publicado", "posts publicados")} no acervo
          {semana > 0 && `, ${semana} nos últimos 7 dias`}. O mais recente,{" "}
          <button type="button" onClick={() => abrir(maisRecente)} className="font-semibold text-primary transition-colors duration-300 hover:text-accent">
            {maisRecente.titulo}
          </button>
          , foi ao ar em {ddmm(diaPublicado(maisRecente))}.
        </p>
      )}

      <section
        aria-label="Buscar e filtrar"
        className="animate-rise mt-6 flex flex-wrap items-center gap-2"
        style={{ animationDelay: "140ms" }}
      >
        <label className="relative min-w-[16rem] flex-1 sm:max-w-sm">
          <span className="sr-only">Buscar nos publicados</span>
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, legenda ou hashtag…"
            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm shadow-card outline-none transition-colors duration-300 placeholder:text-muted-foreground/80 focus:border-sky focus:ring-2 focus:ring-sky/30"
          />
        </label>

        <div role="group" aria-label="Filtrar por rede" className="flex flex-wrap items-center gap-1.5">
          <Pilula ativa={rede === "todas"} onClick={() => setRede("todas")}>
            Todas as redes
          </Pilula>
          {redesPresentes.map((r) => (
            <Pilula key={r} ativa={rede === r} onClick={() => setRede(rede === r ? "todas" : r)}>
              {REDE_META[r].label}
            </Pilula>
          ))}
        </div>

        {filtrando && (
          <button
            type="button"
            onClick={limpar}
            className="inline-flex items-center gap-1 px-2 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
          >
            <X aria-hidden className="h-3.5 w-3.5" /> Limpar filtros
          </button>
        )}

        <div role="group" aria-label="Modo de exibição" className="ml-auto flex items-center gap-1">
          <BotaoModo ativo={modo === "cards"} onClick={() => setModo("cards")} rotulo="Ver em cards">
            <LayoutGrid className="h-4 w-4" />
          </BotaoModo>
          <BotaoModo ativo={modo === "lista"} onClick={() => setModo("lista")} rotulo="Ver em lista">
            <Rows3 className="h-4 w-4" />
          </BotaoModo>
        </div>
      </section>

      {publicados.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border px-6 py-10 text-center">
          <p className="font-display text-base font-bold text-primary">Nada publicado ainda.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Os posts entram aqui quando alguém marca como publicado, no card ou no{" "}
            <a href={hrefDe("posts", "calendario")} className="font-semibold text-accent hover:underline">
              Calendário
            </a>
            .
          </p>
        </div>
      ) : visiveis.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          Nenhum publicado com esse filtro. Tente outra palavra ou outra rede.
        </p>
      ) : modo === "lista" ? (
        <Tabela posts={visiveis} onAbrir={abrir} />
      ) : (
        grupos.map(([chave, posts], g) => {
          const [a, m] = chave.split("-").map(Number);
          return (
            <section key={chave} className="animate-rise mt-10" style={{ animationDelay: `${210 + g * 70}ms` }}>
              <h2 className="flex items-baseline gap-2 border-b border-border pb-2 font-display text-sm font-bold uppercase tracking-wide text-primary">
                {MESES[m - 1]} {a}
                <span className="font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground">
                  {plural(posts.length, "post", "posts")}
                </span>
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {posts.map((p, i) => (
                  <li key={p.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
                    <CartaoPublicado post={p} onAbrir={() => abrir(p)} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {postAberto && <DetalhePost postId={postAberto} onFechar={fechar} noAcervo />}
    </>
  );
}

// ─── Cartão do acervo (card da Biblioteca real) ──────────────────────────

function CartaoPublicado({ post, onAbrir }: { post: Post; onAbrir: () => void }) {
  const { dados, sel } = useHub();
  const autor = sel.usuarioPorId(post.autorId);
  const item = post.itemId ? sel.itemPorId(post.itemId) : undefined;
  const tendencia = dados.tendencias.find((t) => t.id === post.trendId);
  const contextuais = post.hashtags.slice(-3);

  return (
    <button
      type="button"
      onClick={onAbrir}
      className="flex h-full w-full flex-col rounded-3xl bg-card p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
    >
      <img src={post.arteUrl} alt="" className="aspect-square w-full rounded-2xl bg-navy-soft object-cover" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {post.redes.map((r) => (
          <span key={r} className={cn("rounded-full px-2 py-0.5 font-display text-[10px] font-bold", REDE_META[r].className)}>
            {REDE_META[r].label}
          </span>
        ))}
        <span className="rounded-full bg-muted px-2 py-0.5 font-display text-[10px] font-bold text-muted-foreground">{post.formato}</span>
      </div>
      <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug text-primary">{post.titulo}</h3>
      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{post.legenda}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {contextuais.map((h) => (
          <span key={h} className="rounded-full bg-sky-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
            {h}
          </span>
        ))}
      </div>
      <div className="mt-auto pt-4">
        <p className="flex items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>Publicado em {ddmm(diaPublicado(post))}</span>
          <span className="truncate">{autor?.nome ?? "Time"}</span>
        </p>
        {(tendencia || item) && (
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {tendencia ? (
              <>
                Da tendência <span className="font-semibold text-primary">{tendencia.titulo}</span>
              </>
            ) : (
              item && (
                <>
                  Do card <span className="font-semibold text-primary">{item.card.titulo}</span>
                </>
              )
            )}
          </p>
        )}
      </div>
    </button>
  );
}

// ─── Lista (tabela da Biblioteca real) ───────────────────────────────────

function Tabela({ posts, onAbrir }: { posts: Post[]; onAbrir: (p: Post) => void }) {
  const { dados, sel } = useHub();
  return (
    <div className="animate-rise mt-8 overflow-x-auto rounded-3xl bg-card shadow-card" style={{ animationDelay: "210ms" }}>
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="bg-secondary/60 font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th scope="col" className="px-5 py-3">Post</th>
            <th scope="col" className="px-3 py-3">Redes</th>
            <th scope="col" className="px-3 py-3">Publicado em</th>
            <th scope="col" className="px-3 py-3">Autor</th>
            <th scope="col" className="px-5 py-3">Origem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {posts.map((p) => {
            const item = p.itemId ? sel.itemPorId(p.itemId) : undefined;
            const tendencia = dados.tendencias.find((t) => t.id === p.trendId);
            return (
              <tr key={p.id} className="transition-colors duration-300 hover:bg-secondary/40">
                <td className="px-5 py-3">
                  <button type="button" onClick={() => onAbrir(p)} className="flex items-center gap-3 text-left">
                    <img src={p.arteUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl bg-navy-soft object-cover" />
                    <span className="line-clamp-2 font-semibold text-primary transition-colors duration-300 hover:text-accent">{p.titulo}</span>
                  </button>
                </td>
                <td className="px-3 py-3">
                  <span className="flex flex-wrap gap-1">
                    {p.redes.map((r) => (
                      <span key={r} className={cn("rounded-full px-2 py-0.5 font-display text-[10px] font-bold", REDE_META[r].className)}>
                        {REDE_META[r].label}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{ddmm(diaPublicado(p))}</td>
                <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{sel.usuarioPorId(p.autorId)?.nome ?? "Time"}</td>
                <td className="max-w-[16rem] truncate px-5 py-3 text-xs text-muted-foreground">
                  {tendencia ? `Tendência: ${tendencia.titulo}` : item ? `Card: ${item.card.titulo}` : "Post avulso"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Controles ───────────────────────────────────────────────────────────

function Pilula({ ativa, onClick, children }: { ativa: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={ativa}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 font-display text-[11px] font-bold transition-all duration-300",
        ativa ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-card hover:-translate-y-0.5 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

function BotaoModo({
  ativo,
  onClick,
  rotulo,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      aria-pressed={ativo}
      title={rotulo}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300",
        ativo ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-card hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
