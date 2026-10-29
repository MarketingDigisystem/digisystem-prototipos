/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/planejamento.tsx (card do TarefasView),
 *   src/components/planejamento/DetalhePedidoExterno.tsx (ChipsSolicitacao),
 *   src/components/UserPicker.tsx (UserAvatar) @ commit 4fcf254 / leitura 2026-10-07.
 *   Referência visual (não é fonte): prototipos/react/src/components/planejamento/PlanejamentoProposta.tsx.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Frente do card no Quadro (proposta 4.1, 4.2 item 1 e 7, 4.4):
 * etiquetas, título, resumo de subtarefas/posts, estado do post, alerta de
 * problema, prazo (vencido em destaque) e responsável (círculo tracejado
 * quando não há). Tudo calculado por regras.ts via os seletores do store.
 */
import type { DragEvent } from "react";
import { CalendarDays, Image as ImageIcon, ListChecks, MessageSquare, Paperclip } from "lucide-react";
import { IaDigisystem } from "../../IaDigisystem";
import { cn } from "../../lib/utils";
import { hrefDe } from "../router";
import { useHub } from "../store/HubStore";
import { ddmm, plural, type ChaveEstadoPost, type Coluna, type EstadoPostExibido } from "../store/regras";
import type { Card, Etiqueta, SolicitacaoMeta, Usuario } from "../store/tipos";
import { AlertaProblema } from "./AlertaProblema";
import { EstadoPost } from "./EstadoPost";
import { EtiquetasLinha } from "./EtiquetaChip";

/**
 * Marcador de cada coluna (decisão do protótipo, sem origem no real).
 * Vazado = fila de decisão, ainda não é trabalho do time; cheio = trabalho.
 * Reaproveitado pelo Cronograma.
 */
export const MARCADOR_COLUNA: Record<Coluna, string> = {
  recebidos: "border-2 border-primary",
  afazer: "bg-muted-foreground/45",
  andamento: "bg-sky",
  concluido: "bg-success",
  problemas: "bg-destructive",
};

/** B-06 corrigido: texto solto vira 1 item, nunca letras soltas. */
export function comoLista(v?: string[] | string): string[] {
  if (Array.isArray(v)) return v.map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

const REDES: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };
const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Tipo de ação e redes do pedido numa linha de texto (sem chip por item). */
export function itensDoPedido(meta?: SolicitacaoMeta): string[] {
  if (!meta) return [];
  return [
    ...comoLista(meta.tipoAcao).map(capitalizar),
    ...comoLista(meta.plataformas).map((r) => REDES[r.toLowerCase()] ?? capitalizar(r)),
  ];
}

const primeiroNome = (nome?: string) => nome?.split(" ")[0] ?? "";

/** Sem responsável = círculo tracejado vazio (anti-AI aprovado), não um botão com "–". */
export function Avatar({
  usuario,
  tamanho = "h-7 w-7",
  rotulo = "Responsável",
}: {
  usuario?: Usuario;
  tamanho?: string;
  /** Prefixo do nome lido pelo leitor de tela (ex.: "Autor" nos comentários). */
  rotulo?: string;
}) {
  if (!usuario) {
    return (
      <span
        role="img"
        aria-label="Sem responsável"
        title="Sem responsável"
        className={cn("block shrink-0 rounded-full border-[1.5px] border-dashed border-muted-foreground/40", tamanho)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={`${rotulo}: ${usuario.nome}`}
      title={usuario.nome}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-navy-soft font-display text-[10px] font-bold text-primary",
        tamanho,
      )}
    >
      {usuario.iniciais}
    </span>
  );
}

/** Prazo do card: vencido em laranja, hoje em destaque leve, sem prazo discreto. */
export function PrazoCard({ prazo, atrasado, hoje, concluido }: { prazo?: string; atrasado: boolean; hoje: string; concluido?: boolean }) {
  if (!prazo) return <span className="text-[11px] text-muted-foreground/70">Sem prazo</span>;
  if (atrasado) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-soft px-2 py-0.5 font-display text-[11px] font-semibold text-accent">
        <CalendarDays aria-hidden className="h-3.5 w-3.5" /> Atrasada · {ddmm(prazo)}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-display text-[11px] font-semibold",
        prazo === hoje && !concluido ? "text-primary" : "text-muted-foreground",
      )}
    >
      <CalendarDays aria-hidden className="h-3.5 w-3.5" /> {prazo === hoje && !concluido ? "Hoje" : ddmm(prazo)}
    </span>
  );
}

/** Estados de post que merecem aparecer na frente mesmo quando o card tem vários posts. */
const URGENTES: ChaveEstadoPost[] = ["publicar_hoje", "atrasado"];

export function CardTarefa({
  card,
  coluna,
  indice,
  arrastando,
  onAbrir,
  onDragStart,
  onDragEnd,
}: {
  card: Card;
  coluna: Coluna;
  indice: number;
  arrastando: boolean;
  onAbrir: (card: Card) => void;
  onDragStart: (e: DragEvent<HTMLElement>, card: Card) => void;
  onDragEnd: () => void;
}) {
  const { dados, hoje, sel } = useHub();

  const etiquetas = card.etiquetas.map((id) => sel.etiquetaPorId(id)).filter((e): e is Etiqueta => Boolean(e));
  const resumo = sel.resumoCard(card);
  const posts = sel.postsDoCard(card.id);
  const alerta = sel.alertaDoCard(card);
  const avisoSemPost = sel.avisoSemPost(card);
  const atrasado = sel.cardAtrasado(card);
  const responsavel = sel.usuarioPorId(card.responsavelId);
  const pedido = card.pedido;
  const solicitante = sel.solicitantePorId(pedido?.solicitanteId);
  const emRecebidos = coluna === "recebidos";
  const concluido = coluna === "concluido";

  // Estado do post na frente: com 1 post, o estado dele; com vários, só o que
  // pede ação hoje (o resto aparece na linha de cada subtarefa, 4.4).
  const estados: { estado: EstadoPostExibido; n: number }[] = [];
  if (posts.length === 1) {
    estados.push({ estado: sel.estadoPost(posts[0]), n: 1 });
  } else if (posts.length > 1) {
    for (const p of posts) {
      const e = sel.estadoPost(p);
      if (!URGENTES.includes(e.chave)) continue;
      const ja = estados.find((x) => x.estado.chave === e.chave);
      if (ja) ja.n += 1;
      else estados.push({ estado: e, n: 1 });
    }
  }

  const idsCard = new Set([card.id, ...sel.subtarefasDoCard(card.id).map((s) => s.id)]);
  const comentarios = dados.comentarios.filter((c) => idsCard.has(c.itemId)).length;
  const anexos = pedido?.meta.anexos?.length ?? 0;
  const itensPedido = emRecebidos ? itensDoPedido(pedido?.meta) : [];

  // "Criar no Estúdio": card ainda vazio que pede post (etiqueta Post em A fazer,
  // ou qualquer card vazio arrastado para Em andamento, 4.3 item 3).
  const vazio = posts.length === 0 && resumo.subtarefas === 0;
  const sugerirEstudio =
    vazio && ((coluna === "afazer" && card.etiquetas.includes("e-post")) || coluna === "andamento");

  const faixa = alerta
    ? alerta.problemas.every((p) => p.tipo === "aguardando_solicitante")
      ? "bg-accent"
      : "bg-destructive"
    : null;

  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragEnd={onDragEnd}
      className={cn(
        "animate-rise group relative overflow-hidden rounded-2xl bg-card px-4 py-3.5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float",
        arrastando && "opacity-50",
        emRecebidos ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
      )}
      style={{ animationDelay: `${indice * 45}ms` }}
    >
      {faixa && <span aria-hidden className={cn("absolute inset-y-3 left-0 w-[3px] rounded-r-full", faixa)} />}

      {pedido && (
        <p className="font-display text-[11px] font-semibold text-muted-foreground">
          <span className="text-primary">Pedido</span>
          {solicitante && <span> · {solicitante.area}</span>}
        </p>
      )}

      {etiquetas.length > 0 && (
        <div className={cn(pedido && "mt-1.5")}>
          <EtiquetasLinha etiquetas={etiquetas} />
        </div>
      )}

      {/* O título é o alvo do clique; o ::after estica a área clicável para o card inteiro. */}
      <h3 className="mt-1.5 font-display text-[15px] font-semibold leading-snug">
        <button
          type="button"
          onClick={() => onAbrir(card)}
          aria-label={emRecebidos ? `Abrir o pedido ${card.titulo} em Pedidos` : `Abrir o card ${card.titulo}`}
          className={cn(
            "text-left outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-sky",
            concluido ? "text-foreground/65" : "text-foreground",
          )}
        >
          {card.titulo}
        </button>
      </h3>

      {/* Descrição só quando o card ainda não tem nada dentro: depois, o resumo fala por ele. */}
      {card.descricao && vazio && !emRecebidos && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.descricao}</p>
      )}

      {emRecebidos && pedido && (
        <>
          {itensPedido.length > 0 && (
            <p className="mt-1.5 font-display text-[12px] font-semibold text-primary/80">{itensPedido.join(" · ")}</p>
          )}
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {pedido.estado === "triagem"
              ? `Em triagem com ${primeiroNome(sel.usuarioPorId(pedido.triagemPor)?.nome)}`
              : "Novo: ninguém assumiu ainda"}
          </p>
          {pedido.estado === "triagem" && (
            <p className="mt-1.5 flex items-center gap-1.5 font-display text-[11px] font-semibold text-primary">
              <IaDigisystem size={16} />
              <span className="truncate">
                {pedido.parecer.titulo} · {pedido.parecer.prontidao}%
              </span>
            </p>
          )}
        </>
      )}

      {resumo.texto && (
        <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-display text-[11px] font-semibold text-muted-foreground">
          {resumo.subtarefas > 0 && (
            <span className="inline-flex items-center gap-1">
              <ListChecks aria-hidden className="h-3.5 w-3.5" />
              {resumo.subtarefasConcluidas} de {plural(resumo.subtarefas, "subtarefa", "subtarefas")}
            </span>
          )}
          {resumo.posts > 0 && (
            <span className="inline-flex items-center gap-1">
              <ImageIcon aria-hidden className="h-3.5 w-3.5" />
              {resumo.postsPublicados} de {resumo.posts} {resumo.posts === 1 ? "post publicado" : "posts publicados"}
            </span>
          )}
        </p>
      )}

      {estados.length > 0 && !concluido && (
        <div className="mt-2 flex flex-wrap gap-1">
          {estados.map(({ estado, n }) => (
            <EstadoPost key={estado.chave} estado={estado} sufixo={posts.length > 1 ? plural(n, "post", "posts") : undefined} />
          ))}
        </div>
      )}

      {avisoSemPost && (
        <p className="mt-2 rounded-xl border border-dashed border-border px-2.5 py-1.5 font-display text-[11px] font-semibold text-muted-foreground">
          {avisoSemPost}
        </p>
      )}

      {alerta && <AlertaProblema texto={alerta.texto} problemas={alerta.problemas} className="mt-2" />}

      <div className="mt-3 flex items-center gap-2">
        <PrazoCard prazo={card.prazo} atrasado={atrasado} hoje={hoje} concluido={concluido} />
        {comentarios > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground" title={plural(comentarios, "comentário", "comentários")}>
            <MessageSquare aria-hidden className="h-3 w-3" /> {comentarios}
          </span>
        )}
        {anexos > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground" title={plural(anexos, "anexo", "anexos")}>
            <Paperclip aria-hidden className="h-3 w-3" /> {anexos}
          </span>
        )}
        <span className="ml-auto">
          <Avatar usuario={responsavel} />
        </span>
      </div>

      {sugerirEstudio && (
        <a
          href={hrefDe("posts", "criar", { card: card.id, trend: card.trendId })}
          draggable={false}
          className="relative z-10 mt-3 flex w-full items-center gap-1.5 border-t border-border pt-2.5 font-display text-[12px] font-bold text-primary transition-colors duration-300 hover:text-accent"
        >
          <IaDigisystem size={18} /> Criar no Estúdio
        </a>
      )}
    </article>
  );
}
