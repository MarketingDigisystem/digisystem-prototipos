/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/planejamento.tsx (aba Triagem), src/components/planejamento/DecisaoTriagem.tsx,
 *   src/components/planejamento/DetalhePedidoExterno.tsx, src/components/planejamento/ParecerTriagem.tsx,
 *   src/hooks/use-solicitacoes-externas.ts @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Tarefas → Pedidos (proposta 4.9: a aba Triagem vira esta). Mesmo desenho da
 * Triagem real (fila à esquerda, decisões à direita em lg:grid-cols-[…_320px]):
 *  - fila em três grupos: Novos (ninguém assumiu), Em triagem (com quem está
 *    e o parecer em uma linha) e Aguardando o solicitante (os devolvidos, que
 *    no Quadro estão em Problemas);
 *  - "Pedidos já triados" vira "Histórico de decisões" com filtro
 *    aprovados/devolvidos/negados; o negado só existe aqui (saiu do Quadro);
 *  - ?card=<id> abre o dialog do pedido: é o caminho do card em Recebidos e
 *    do "Ver o pedido" do detalhe do card.
 */
import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Paperclip } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { itensDoPedido } from "../../components/CardTarefa";
import {
  CATEGORIA_PEDIDO,
  PedidoDialog,
  PrazoPedido,
  corProntidao,
  diasEntre,
  haQuanto,
} from "../../components/PedidoDialog";
import { navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { ddmm, diaDe, plural } from "../../store/regras";
import type { Card, DecisaoPedido, RegistroPedido } from "../../store/tipos";

type Filtro = "todas" | DecisaoPedido["tipo"];

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "aprovado", label: "Aprovados" },
  { id: "devolvido", label: "Devolvidos" },
  { id: "negado", label: "Negados" },
];

const DECISAO: Record<DecisaoPedido["tipo"], { verbo: string; ponto: string; texto: string }> = {
  aprovado: { verbo: "Aprovado", ponto: "bg-success", texto: "text-success" },
  devolvido: { verbo: "Devolvido", ponto: "bg-accent", texto: "text-accent" },
  negado: { verbo: "Negado", ponto: "bg-destructive", texto: "text-destructive" },
};

const primeiroNome = (nome?: string) => nome?.split(" ")[0] ?? "";

export function Pedidos({ rota }: { rota: Rota }) {
  const { dados, hoje, sel } = useHub();
  const cardAberto = rota.params.card;

  const pedidos = dados.cards.filter((c) => c.pedido);
  const porRecebimento = (a: Card, b: Card) => (a.pedido?.recebidoEm ?? "").localeCompare(b.pedido?.recebidoEm ?? "");
  const novos = pedidos.filter((c) => c.pedido?.estado === "recebido").sort(porRecebimento);
  const emTriagem = pedidos.filter((c) => c.pedido?.estado === "triagem").sort(porRecebimento);
  const aguardando = pedidos.filter((c) => c.pedido?.estado === "devolvido").sort(porRecebimento);

  const abrir = (id: string) => navegar("tarefas", "pedidos", { card: id });
  const fechar = () => navegar("tarefas", "pedidos");

  // Resumo editorial em uma frase, no lugar de contadores soltos.
  const fila = [...novos, ...emTriagem];
  const maisAntigo = fila.reduce<Card | undefined>(
    (velho, c) => (!velho || (c.pedido?.recebidoEm ?? "") < (velho.pedido?.recebidoEm ?? "") ? c : velho),
    undefined,
  );
  const partes = [
    novos.length > 0 && `${plural(novos.length, "pedido esperando", "pedidos esperando")} alguém assumir`,
    emTriagem.length > 0 && `${emTriagem.length} em triagem`,
  ].filter(Boolean) as string[];
  const resumo =
    fila.length === 0
      ? "Nenhum pedido esperando decisão. Quando outra área pedir algo, ele aparece aqui e em Recebidos no Quadro."
      : `${partes.join(" e ")}. O mais antigo chegou ${haQuanto(maisAntigo?.pedido?.recebidoEm ?? "", hoje)}.`;

  return (
    <>
      <CabecalhoArea
        area="tarefas"
        aba="pedidos"
        subtitulo="Pedidos de outras áreas esperando decisão, com o parecer da IA ao lado."
      />

      <p className="animate-rise mt-6 max-w-2xl font-display text-lg font-semibold leading-snug text-primary" style={{ animationDelay: "60ms" }}>
        {resumo.charAt(0).toUpperCase() + resumo.slice(1)}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <Grupo
            titulo="Novos"
            n={novos.length}
            dica="Ninguém assumiu ainda. Abra para assumir e ver o parecer."
            vazio="Nenhum pedido novo."
            atraso={120}
          >
            {novos.map((c, i) => (
              <LinhaPedido key={c.id} card={c} indice={i} onAbrir={abrir} />
            ))}
          </Grupo>

          <Grupo titulo="Em triagem" n={emTriagem.length} dica="Já tem alguém analisando." vazio="Nenhum pedido em triagem." atraso={200}>
            {emTriagem.map((c, i) => (
              <LinhaPedido key={c.id} card={c} indice={i} onAbrir={abrir} />
            ))}
          </Grupo>

          {aguardando.length > 0 && (
            <Grupo
              titulo="Aguardando o solicitante"
              n={aguardando.length}
              dica="Devolvidos para ajuste. No Quadro, ficam em Problemas até o solicitante reenviar."
              atraso={280}
            >
              {aguardando.map((c, i) => (
                <LinhaAguardando key={c.id} card={c} indice={i} onAbrir={abrir} />
              ))}
            </Grupo>
          )}
        </div>

        <Historico onAbrir={abrir} />
      </div>

      {cardAberto && sel.cardPorId(cardAberto)?.pedido && <PedidoDialog cardId={cardAberto} onFechar={fechar} />}
    </>
  );
}

// ─── Fila ─────────────────────────────────────────────────────────────────

function Grupo({
  titulo,
  n,
  dica,
  vazio,
  atraso,
  children,
}: {
  titulo: string;
  n: number;
  dica: string;
  vazio?: string;
  atraso: number;
  children: ReactNode;
}) {
  return (
    <section className="animate-rise" style={{ animationDelay: `${atraso}ms` }} aria-label={`${titulo}: ${n}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
          {titulo} <span className="ml-1 text-muted-foreground">{n}</span>
        </h2>
        <p className="text-xs text-muted-foreground">{dica}</p>
      </div>
      {n === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-border px-5 py-4 text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="mt-3 space-y-3">{children}</ul>
      )}
    </section>
  );
}

function LinhaPedido({ card, indice, onAbrir }: { card: Card; indice: number; onAbrir: (id: string) => void }) {
  const { hoje, usuario, sel } = useHub();
  const pedido = card.pedido!;
  const solicitante = sel.solicitantePorId(pedido.solicitanteId);
  const itens = itensDoPedido(pedido.meta);
  const anexos = pedido.meta.anexos?.length ?? 0;
  const triador = sel.usuarioPorId(pedido.triagemPor);
  const meu = solicitante?.usuarioId === usuario.id;

  return (
    <li className="animate-rise" style={{ animationDelay: `${indice * 60}ms` }}>
      <article className="group relative rounded-2xl bg-card px-5 py-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float">
        <span
          aria-hidden
          className="absolute inset-y-4 left-0 w-[3px] origin-top scale-y-0 rounded-r-full bg-accent transition-transform duration-300 group-hover:scale-y-100"
        />
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[11px] font-semibold text-muted-foreground">
              <span className={pedido.categoria === "post" ? "text-accent" : "text-primary"}>{CATEGORIA_PEDIDO[pedido.categoria]}</span>
              {solicitante && (
                <>
                  {" · "}
                  {solicitante.area} · {solicitante.nome}
                </>
              )}
            </p>
            <h3 className="mt-1 font-display text-base font-semibold leading-snug text-foreground">
              <button
                type="button"
                onClick={() => onAbrir(card.id)}
                className="text-left outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-sky"
              >
                {card.titulo}
              </button>
            </h3>
            {itens.length > 0 && <p className="mt-1 font-display text-[12px] font-semibold text-primary/80">{itens.join(" · ")}</p>}
            {card.descricao && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{card.descricao}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <PrazoPedido prazo={card.prazo} hoje={hoje} />
            <span className="text-[11px] text-muted-foreground">Chegou {haQuanto(pedido.recebidoEm, hoje)}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          {pedido.estado === "triagem" ? (
            <>
              <span className="flex items-center gap-1.5 font-display font-semibold">
                <IaDigisystem size={16} />
                <span style={{ color: corProntidao(pedido.parecer.prontidao) }}>
                  {pedido.parecer.titulo} · {pedido.parecer.prontidao}%
                </span>
              </span>
              <span>
                Com <span className="font-semibold text-foreground/80">{triador?.id === usuario.id ? "você" : primeiroNome(triador?.nome)}</span>
              </span>
            </>
          ) : (
            <span>{meu ? "Você criou este pedido: outra pessoa do time decide." : "Abra para assumir a triagem."}</span>
          )}
          {anexos > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip aria-hidden className="h-3 w-3" /> {plural(anexos, "anexo", "anexos")}
            </span>
          )}
        </div>
      </article>
    </li>
  );
}

function LinhaAguardando({ card, indice, onAbrir }: { card: Card; indice: number; onAbrir: (id: string) => void }) {
  const { dados, hoje, sel } = useHub();
  const solicitante = sel.solicitantePorId(card.pedido?.solicitanteId);
  const devolucao = dados.decisoes
    .filter((d) => d.cardId === card.id && d.tipo === "devolvido")
    .sort((a, b) => b.em.localeCompare(a.em))[0];
  const dias = devolucao ? diasEntre(diaDe(devolucao.em), hoje) : 0;

  return (
    <li className="animate-rise" style={{ animationDelay: `${indice * 60}ms` }}>
      <button
        type="button"
        onClick={() => onAbrir(card.id)}
        className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl border border-dashed border-accent/40 px-5 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-card hover:shadow-card"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-display text-sm font-semibold text-foreground">{card.titulo}</span>
          {devolucao?.motivo && <span className="mt-0.5 block line-clamp-1 text-xs italic text-muted-foreground">"{devolucao.motivo}"</span>}
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {solicitante?.nome}
          {devolucao && ` · devolvido ${dias <= 0 ? "hoje" : dias === 1 ? "ontem" : `há ${dias} dias`}`}
        </span>
      </button>
    </li>
  );
}

// ─── Histórico de decisões ────────────────────────────────────────────────

function Historico({ onAbrir }: { onAbrir: (id: string) => void }) {
  const { dados, sel } = useHub();
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [verAnterior, setVerAnterior] = useState(false);

  const decisoes = useMemo(() => [...dados.decisoes].sort((a, b) => b.em.localeCompare(a.em)), [dados.decisoes]);
  const anteriores = useMemo(
    () => [...dados.historico.pedidos].sort((a, b) => b.decididoEm.localeCompare(a.decididoEm)),
    [dados.historico.pedidos],
  );
  const conta = (f: Filtro) =>
    f === "todas" ? decisoes.length : decisoes.filter((d) => d.tipo === f).length;

  const visiveis = filtro === "todas" ? decisoes : decisoes.filter((d) => d.tipo === filtro);
  const anterioresVisiveis = filtro === "todas" ? anteriores : anteriores.filter((r) => r.decisao === filtro);
  const mesAnterior = anteriores[0]
    ? new Date(anteriores[0].decididoEm).toLocaleDateString("pt-BR", { month: "long" })
    : "";

  return (
    <aside
      className="animate-rise self-start rounded-3xl bg-card p-5 shadow-card"
      style={{ animationDelay: "160ms" }}
      aria-labelledby="titulo-historico"
    >
      <h2 id="titulo-historico" className="font-display text-lg font-bold text-primary">
        Histórico de decisões
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Quem decidiu, quando e por quê. O negado fica só aqui.</p>

      <div role="group" aria-label="Filtrar decisões" className="mt-4 flex flex-wrap gap-0.5 rounded-full bg-secondary p-1">
        {FILTROS.map((f) => {
          const ativo = filtro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => setFiltro(f.id)}
              className={cn(
                "rounded-full px-2.5 py-1 font-display text-[11px] font-bold transition-all duration-300",
                ativo ? "bg-accent text-accent-foreground shadow-card" : "text-muted-foreground hover:text-primary",
              )}
            >
              {f.label} <span className={cn(ativo ? "opacity-80" : "opacity-60")}>{conta(f.id)}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-accent">Este mês</p>
      {visiveis.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Nenhuma decisão com este filtro.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {visiveis.map((d) => {
            const card = sel.cardPorId(d.cardId);
            const cfg = DECISAO[d.tipo];
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onAbrir(d.cardId)}
                  className="group w-full py-3 text-left"
                >
                  <span className="flex items-start gap-2.5">
                    <span aria-hidden className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", cfg.ponto)} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
                        {card?.titulo ?? "Pedido"}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        <span className={cn("font-semibold", cfg.texto)}>{cfg.verbo}</span> por{" "}
                        {primeiroNome(sel.usuarioPorId(d.por)?.nome)} · {ddmm(d.em)}
                      </span>
                      {d.motivo && <span className="mt-1 block line-clamp-2 text-xs italic text-muted-foreground">"{d.motivo}"</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {anteriores.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <button
            type="button"
            aria-expanded={verAnterior}
            onClick={() => setVerAnterior((v) => !v)}
            className="flex w-full items-center justify-between font-display text-xs font-bold text-primary transition-colors duration-300 hover:text-accent"
          >
            {verAnterior ? `Esconder ${mesAnterior}` : `Ver as ${plural(anterioresVisiveis.length, "decisão", "decisões")} de ${mesAnterior}`}
            <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform duration-300", verAnterior && "rotate-180")} />
          </button>
          {verAnterior && (
            <ul className="mt-2 max-h-72 divide-y divide-border overflow-y-auto pr-1">
              {anterioresVisiveis.map((r) => (
                <LinhaAnterior key={r.id} r={r} />
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}

/** Registro do mês anterior: só leitura (o card já não está no protótipo). */
function LinhaAnterior({ r }: { r: RegistroPedido }) {
  const { sel } = useHub();
  const cfg = DECISAO[r.decisao];
  return (
    <li className="flex items-start gap-2.5 py-2.5">
      <span aria-hidden className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", cfg.ponto)} />
      <span className="min-w-0">
        <span className="block text-[13px] leading-snug text-foreground/85">{r.titulo}</span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          <span className={cn("font-semibold", cfg.texto)}>{cfg.verbo}</span> · {r.area} · {primeiroNome(sel.usuarioPorId(r.decididoPor)?.nome)} ·{" "}
          {ddmm(r.decididoEm)}
        </span>
        {r.motivo && <span className="mt-0.5 block line-clamp-2 text-[11px] italic text-muted-foreground">"{r.motivo}"</span>}
      </span>
    </li>
  );
}
