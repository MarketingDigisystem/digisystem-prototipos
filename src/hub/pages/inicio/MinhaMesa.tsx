/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/index.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Início → Minha mesa (proposta 2.3 e 2.6): a mesa de trabalho de cada pessoa,
 * só com o que é com ela. O que sai seleciona regras.ts → mesaDoUsuario.
 *  - Do real ficam a barra glass do topo, a saudação com a data por extenso e o
 *    nome, o arco laranja do hero e os tons dos alertas.
 *  - Saem a grade de atalhos (agora é o dock) e a grade de 5 contadores iguais
 *    (anti-AI). No lugar dos contadores, uma frase com o que está com a pessoa.
 *  - Tendência da semana no topo; depois, à esquerda, o que pede ação dela
 *    (Para ajustar, Minhas tarefas e subtarefas com as atrasadas em destaque);
 *    à direita, as filas curtas (Publicar hoje, Para aprovar, Na minha triagem,
 *    Pedidos novos). Cada linha leva à tela certa.
 *  - Muda com "Entrar como" e com "Avançar 1 dia" do painel de demo.
 */
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { cn } from "../../../lib/utils";
import { MARCADOR_COLUNA, PrazoCard } from "../../components/CardTarefa";
import { EstadoPost } from "../../components/EstadoPost";
import { CATEGORIA_PEDIDO, diasEntre } from "../../components/PedidoDialog";
import { ChipPlataforma, ChipPotencial, formatoLegivel } from "../../components/TendenciaChips";
import { CriarPostTendencia } from "../../components/TendenciaDetalhe";
import { hrefDe } from "../../router";
import { useHub } from "../../store/HubStore";
import {
  COLUNAS,
  ROTULO_PROBLEMA,
  ddmm,
  diaDe,
  plural,
  resumoDaMesa,
  type TarefaDaMesa,
} from "../../store/regras";
import type { Card, Papel, Post, Tendencia } from "../../store/tipos";

const delay = (i: number) => ({ animationDelay: `${i * 90}ms` });

/** Pílula da barra do topo (no real é fixa "EQUIPE DE MARKETING"). */
const ROTULO_PAPEL: Record<Papel, string> = {
  marketing: "Equipe de marketing",
  aprovador: "Aprovação",
  admin: "Administração",
};

/** Quantas tarefas a mesa mostra antes de mandar para o Quadro. */
const LIMITE_TAREFAS = 7;

function saudacao(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

/** "Terça-feira, 7 de outubro" a partir do "hoje" do protótipo. */
function dataPorExtenso(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  const s = new Date(a, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function haQuanto(instante: string, hoje: string) {
  const n = diasEntre(diaDe(instante), hoje);
  if (n <= 0) return "hoje";
  if (n === 1) return "ontem";
  return `há ${n} dias`;
}

export function MinhaMesa() {
  const { hoje, papel, usuario, sel } = useHub();
  const mesa = sel.mesa();
  const tendencia = sel.tendenciaDestaque();
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <>
      <header
        className="glass animate-rise grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-3xl px-5 py-4 sm:flex sm:justify-between"
        style={delay(0)}
      >
        <div className="flex min-w-0 items-center gap-4">
          <p className="font-display text-lg font-bold leading-none text-primary">
            digi<span className="text-accent">system</span>
          </p>
          <div aria-hidden className="hidden h-8 w-px bg-border sm:block" />
          <p className="hidden truncate text-sm text-muted-foreground sm:block">Marketing Hub</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full bg-sky-soft px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-primary">
            {ROTULO_PAPEL[papel]}
          </span>
          <span
            role="img"
            aria-label={usuario.nome}
            title={usuario.nome}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground"
          >
            {usuario.iniciais}
          </span>
        </div>
      </header>

      <section className="animate-rise mt-10" style={delay(1)}>
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent">{dataPorExtenso(hoje)}</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-primary sm:text-5xl">
          {saudacao(new Date().getHours())}, {primeiroNome}.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/85">{resumoDaMesa(mesa, hoje)}</p>
      </section>

      {tendencia ? (
        <TendenciaDaSemana t={tendencia} />
      ) : (
        <section className="animate-rise mt-8 rounded-3xl border border-dashed border-border px-6 py-8 text-center" style={delay(2)}>
          <IaDigisystem size={40} className="mx-auto" />
          <p className="mt-3 font-display text-base font-bold text-primary">Todas as tendências do radar já têm um destino.</p>
          <a href={hrefDe("tendencias")} className="mt-1 inline-block text-sm text-muted-foreground hover:text-accent">
            Ver o radar
          </a>
        </section>
      )}

      <div className="mt-10 grid items-start gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-10">
          <ParaAjustar posts={mesa.paraAjustar} />
          <MinhasTarefas tarefas={mesa.tarefas} hoje={hoje} />
        </div>

        <aside aria-label="Filas curtas" className="min-w-0 space-y-8">
          <PublicarHoje posts={mesa.publicarHoje} hoje={hoje} />
          {mesa.paraAprovar && <ParaAprovar posts={mesa.paraAprovar} hoje={hoje} />}
          <NaMinhaTriagem cards={mesa.naMinhaTriagem} hoje={hoje} />
          <PedidosNovos cards={mesa.pedidosNovos} hoje={hoje} />
        </aside>
      </div>
    </>
  );
}

// ─── Tendência da semana ─────────────────────────────────────────────────

function TendenciaDaSemana({ t }: { t: Tendencia }) {
  return (
    <section
      aria-labelledby="tendencia-semana"
      className="animate-rise relative isolate mt-8 overflow-hidden rounded-3xl bg-card px-6 py-7 shadow-card sm:px-8"
      style={delay(2)}
    >
      {/* arco laranja do hero do Início real */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-20 -z-10 h-64 w-64 rounded-full border-[38px] border-accent opacity-20"
      />
      <div className="grid gap-x-10 gap-y-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Tendência da semana</span>
            <span className="text-xs text-muted-foreground">maior potencial que o time ainda não aproveitou</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ChipPotencial potencial={t.potencial} />
            <ChipPlataforma tag={t.tag} />
          </div>
          <h2 id="tendencia-semana" className="mt-3 font-display text-2xl font-bold leading-tight text-primary sm:text-3xl">
            {t.titulo}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            {t.segmento} · {formatoLegivel(t.formato)}
          </p>
        </div>
        <div className="flex min-w-0 flex-col">
          <h3 className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Por que importa para a Digisystem
          </h3>
          <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-foreground/85">{t.proposta}</p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
            <CriarPostTendencia tendencia={t} />
            <a
              href={hrefDe("tendencias", "tendencias", { trend: t.id })}
              className="inline-flex items-center gap-1.5 px-2 py-2 font-display text-xs font-bold text-primary transition-all duration-300 hover:gap-2.5 hover:text-accent"
            >
              Ver no radar <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Blocos ──────────────────────────────────────────────────────────────

function TituloBloco({ children, n, href, link }: { children: ReactNode; n?: number; href?: string; link?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
        {children}
        {n !== undefined && n > 0 && <span className="ml-2 font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground">{n}</span>}
      </h2>
      {href && link && (
        <a href={href} className="inline-flex shrink-0 items-center gap-1 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-accent">
          {link} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

/** Bloco vazio: uma linha, sem caixa (não ocupa o lugar de quem tem algo). */
function Vazio({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm text-muted-foreground">{children}</p>;
}

/** Linha clicável das filas curtas. */
function Linha({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3 transition-colors duration-300 hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100" />
      {children}
    </a>
  );
}

function ParaAjustar({ posts }: { posts: Post[] }) {
  const { sel } = useHub();
  return (
    <section className="animate-rise" style={delay(3)}>
      <TituloBloco n={posts.length} href={hrefDe("posts", "meus")} link="Meus posts">
        Para ajustar
      </TituloBloco>
      {posts.length === 0 ? (
        <Vazio>Nenhum post seu foi reprovado.</Vazio>
      ) : (
        <ul className="mt-3 space-y-3">
          {posts.map((p) => {
            const item = p.itemId ? sel.itemPorId(p.itemId) : undefined;
            return (
              <li key={p.id}>
                <a
                  href={hrefDe("posts", "meus", { post: p.id })}
                  className="group relative flex gap-4 overflow-hidden rounded-3xl bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float sm:p-5"
                >
                  <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-destructive" />
                  <img src={p.arteUrl} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <EstadoPost estado={sel.estadoPost(p)} />
                      {item && <span className="truncate text-[11px] text-muted-foreground">No card {item.card.titulo}</span>}
                    </span>
                    <span className="mt-1.5 block font-display text-base font-bold leading-snug text-primary transition-colors duration-300 group-hover:text-accent">
                      {p.titulo}
                    </span>
                    {p.motivoReprovacao && (
                      <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-foreground/80">
                        <span className="font-semibold text-destructive">Motivo: </span>
                        {p.motivoReprovacao}
                      </span>
                    )}
                    <span className="mt-2 inline-flex items-center gap-1 font-display text-xs font-bold text-accent">
                      Ajustar e reenviar <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function MinhasTarefas({ tarefas, hoje }: { tarefas: TarefaDaMesa[]; hoje: string }) {
  const atrasadas = tarefas.filter((t) => t.atrasada);
  const resto = tarefas.filter((t) => !t.atrasada);
  const espaco = Math.max(LIMITE_TAREFAS - atrasadas.length, 2);
  const restoVisivel = resto.slice(0, espaco);
  const escondidas = resto.length - restoVisivel.length;

  return (
    <section className="animate-rise" style={delay(4)}>
      <TituloBloco n={tarefas.length} href={hrefDe("tarefas", "quadro")} link="Abrir o Quadro">
        Minhas tarefas e subtarefas
      </TituloBloco>
      {tarefas.length === 0 ? (
        <Vazio>Nenhum card ou subtarefa com o seu nome agora.</Vazio>
      ) : (
        <div className="mt-3 overflow-hidden rounded-3xl bg-card shadow-card">
          {atrasadas.length > 0 && (
            <>
              <p className="bg-orange-soft px-5 py-2 font-display text-[11px] font-bold uppercase tracking-wider text-accent">
                {plural(atrasadas.length, "atrasada", "atrasadas")}
              </p>
              <ul className="divide-y divide-border/70">
                {atrasadas.map((t) => (
                  <li key={t.id}>
                    <LinhaTarefa t={t} hoje={hoje} />
                  </li>
                ))}
              </ul>
            </>
          )}
          {restoVisivel.length > 0 && (
            <>
              {atrasadas.length > 0 && (
                <p className="border-t border-border/70 px-5 py-2 font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  No prazo
                </p>
              )}
              <ul className="divide-y divide-border/70">
                {restoVisivel.map((t) => (
                  <li key={t.id}>
                    <LinhaTarefa t={t} hoje={hoje} />
                  </li>
                ))}
              </ul>
            </>
          )}
          {escondidas > 0 && (
            <a
              href={hrefDe("tarefas", "quadro")}
              className="block border-t border-border/70 px-5 py-3 font-display text-xs font-bold text-primary transition-colors duration-300 hover:text-accent"
            >
              Mais {plural(escondidas, "tarefa", "tarefas")} no Quadro, no filtro Minhas
            </a>
          )}
        </div>
      )}
    </section>
  );
}

function LinhaTarefa({ t, hoje }: { t: TarefaDaMesa; hoje: string }) {
  const { sel } = useHub();
  const colunaLabel = COLUNAS.find((c) => c.id === t.coluna)?.label ?? "";
  const problema = t.problemas[0];
  return (
    <Linha href={hrefDe("tarefas", "quadro", { card: t.card.id })} className="px-5 py-3.5">
      <span aria-hidden className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", MARCADOR_COLUNA[t.coluna])} />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-bold leading-snug text-primary transition-colors duration-300 group-hover:text-accent">
          {t.titulo}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {t.tipo === "subtarefa" ? `Subtarefa em ${t.card.titulo}` : `Card em ${colunaLabel}`}
        </span>
        {(t.post || problema) && (
          <span className="mt-1.5 flex flex-wrap items-center gap-2">
            {t.post && <EstadoPost estado={sel.estadoPost(t.post)} />}
            {problema && (
              <span className="text-[11px] font-semibold text-destructive">
                ⚑ {ROTULO_PROBLEMA[problema.tipo]}
                {problema.tipo === "bloqueado" && `: ${problema.motivo}`}
              </span>
            )}
          </span>
        )}
      </span>
      <span className="shrink-0 pt-0.5">
        <PrazoCard prazo={t.prazo} atrasado={t.atrasada} hoje={hoje} />
      </span>
    </Linha>
  );
}

function PublicarHoje({ posts, hoje }: { posts: Post[]; hoje: string }) {
  const { sel, acoes } = useHub();
  return (
    <section className="animate-rise" style={delay(3)}>
      <TituloBloco n={posts.length} href={hrefDe("posts", "calendario")} link="Calendário">
        Publicar hoje
      </TituloBloco>
      {posts.length === 0 ? (
        <Vazio>Nenhum post seu para publicar hoje.</Vazio>
      ) : (
        <ul className="mt-3 divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-card">
          {posts.map((p) => {
            const atrasado = (p.dataPublicacao as string) < hoje;
            return (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <a href={hrefDe("posts", "calendario", { post: p.id })} className="group flex min-w-0 flex-1 items-center gap-3">
                  <img src={p.arteUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-bold text-primary transition-colors duration-300 group-hover:text-accent">
                      {p.titulo}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <EstadoPost estado={sel.estadoPost(p)} />
                      {atrasado && <span className="text-[11px] text-muted-foreground">era {ddmm(p.dataPublicacao as string)}</span>}
                    </span>
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => acoes.marcarPublicado(p.id)}
                  title="Marcar como publicado"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 font-display text-[11px] font-bold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
                >
                  <Check aria-hidden className="h-3.5 w-3.5" /> Marcar como publicado
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ParaAprovar({ posts, hoje }: { posts: Post[]; hoje: string }) {
  const { sel } = useHub();
  return (
    <section className="animate-rise" style={delay(4)}>
      <TituloBloco n={posts.length} href={hrefDe("posts", "aprovar")} link="Fila completa">
        Para aprovar
      </TituloBloco>
      {posts.length === 0 ? (
        <Vazio>A fila de aprovação está vazia.</Vazio>
      ) : (
        <ul className="mt-3 divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-card">
          {posts.map((p) => {
            const autor = sel.usuarioPorId(p.autorId)?.nome.split(" ")[0];
            const revisor = p.emRevisaoPor ? sel.usuarioPorId(p.emRevisaoPor)?.nome.split(" ")[0] : undefined;
            return (
              <li key={p.id}>
                <Linha href={hrefDe("posts", "aprovar", { post: p.id })}>
                  <img src={p.arteUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-bold text-primary transition-colors duration-300 group-hover:text-accent">
                      {p.titulo}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      De {autor}, enviado {haQuanto(p.atualizadoEm, hoje)}
                      {p.dataSugerida && ` · sugere ${ddmm(p.dataSugerida)}`}
                    </span>
                    {revisor && <span className="mt-0.5 block text-[11px] font-semibold text-primary">Em revisão por {revisor}</span>}
                  </span>
                </Linha>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function LinhaPedido({ c, hoje, extra }: { c: Card; hoje: string; extra?: ReactNode }) {
  const { sel } = useHub();
  const pedido = c.pedido as NonNullable<Card["pedido"]>;
  const solicitante = sel.solicitantePorId(pedido.solicitanteId);
  return (
    <Linha href={hrefDe("tarefas", "pedidos", { card: c.id })}>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-bold text-primary transition-colors duration-300 group-hover:text-accent">
          {c.titulo}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
          {CATEGORIA_PEDIDO[pedido.categoria]} · {solicitante?.area ?? "Área não informada"} · {haQuanto(pedido.recebidoEm, hoje)}
        </span>
        {extra}
      </span>
    </Linha>
  );
}

function NaMinhaTriagem({ cards, hoje }: { cards: Card[]; hoje: string }) {
  return (
    <section className="animate-rise" style={delay(5)}>
      <TituloBloco n={cards.length} href={hrefDe("tarefas", "pedidos")} link="Pedidos">
        Na minha triagem
      </TituloBloco>
      {cards.length === 0 ? (
        <Vazio>Você não assumiu nenhum pedido.</Vazio>
      ) : (
        <ul className="mt-3 divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-card">
          {cards.map((c) => {
            const parecer = (c.pedido as NonNullable<Card["pedido"]>).parecer;
            return (
              <li key={c.id}>
                <LinhaPedido
                  c={c}
                  hoje={hoje}
                  extra={
                    <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <IaDigisystem size={14} /> Parecer da IA: prontidão {parecer.prontidao}%
                    </span>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function PedidosNovos({ cards, hoje }: { cards: Card[]; hoje: string }) {
  return (
    <section className="animate-rise" style={delay(6)}>
      <TituloBloco n={cards.length} href={hrefDe("tarefas", "pedidos")} link="Pedidos">
        Pedidos novos
      </TituloBloco>
      {cards.length === 0 ? (
        <Vazio>Nenhum pedido esperando alguém assumir.</Vazio>
      ) : (
        <>
          <p className="mt-2 text-xs text-muted-foreground">Ninguém assumiu ainda. Qualquer pessoa do time pode abrir e assumir.</p>
          <ul className="mt-2 divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-card">
            {cards.map((c) => (
              <li key={c.id}>
                <LinhaPedido c={c} hoje={hoje} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
