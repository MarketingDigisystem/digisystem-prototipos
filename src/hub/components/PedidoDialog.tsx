/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/planejamento/DetalhePedidoExterno.tsx, src/components/planejamento/ParecerTriagem.tsx,
 *   src/components/planejamento/DecisaoTriagem.tsx, src/routes/_authenticated/planejamento.tsx (dialog da Triagem)
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Dialog do pedido externo (Tarefas → Pedidos, proposta 4.9). Mesmo desenho
 * do dialog da Triagem real (max-w-3xl, max-h-[85vh], pedido à esquerda e o
 * parecer da IA à direita) com o que a proposta muda:
 *  - "Aprovar e designar" escolhe o responsável E as etiquetas; pedido de
 *    post já chega com "Post" (4.9, K1: vai para A fazer);
 *  - "Devolver para ajuste" abre o problema "Aguardando o solicitante" e o
 *    card vai para Problemas (4.4);
 *  - "Negar" pede o motivo, tira o card do Quadro e grava no histórico (4.1);
 *  - pedido já decidido abre só para leitura, com a decisão e o caminho do card;
 *  - chips de tipo de ação e redes com o B-06 corrigido (texto solto = 1 item).
 * O parecer é simulado: o texto já vem do mock, a coreografia é a do real.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Paperclip, X } from "lucide-react";
import { IaDigisystem } from "../../IaDigisystem";
import { TextGenerateDigisystem } from "../../TextGenerateDigisystem";
import { cn } from "../../lib/utils";
import { hrefDe } from "../router";
import { useHub } from "../store/HubStore";
import { COLUNAS, ddmm, diaDe } from "../store/regras";
import type { Card, EstadoTriagem, ParecerPedido, SolicitacaoMeta } from "../store/tipos";
import { comoLista, itensDoPedido } from "./CardTarefa";
import { campo, rotulo } from "./NovaTarefaDialog";

// ─── Apoio visual compartilhado com a página ──────────────────────────────

export const CATEGORIA_PEDIDO: Record<"post" | "acao", string> = {
  post: "Post para redes",
  acao: "Ação de marketing",
};

/** StatusTriagemBadge do real, com os estados novos (aprovado e negado aparecem no histórico). */
export const STATUS_TRIAGEM: Record<EstadoTriagem, { texto: string; classe: string }> = {
  recebido: { texto: "Novo", classe: "bg-navy-soft text-primary" },
  triagem: { texto: "Em triagem", classe: "bg-sky-soft text-primary" },
  devolvido: { texto: "Devolvido para ajuste", classe: "bg-orange-soft text-accent" },
  aprovado: { texto: "Aprovado", classe: "bg-success-soft text-success" },
  negado: { texto: "Negado", classe: "bg-destructive/10 text-destructive" },
};

/** Dias inteiros entre dois dias YYYY-MM-DD (b − a). */
export function diasEntre(a: string, b: string): number {
  const [a1, m1, d1] = a.split("-").map(Number);
  const [a2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000);
}

/** "hoje", "ontem", "há 3 dias". */
export function haQuanto(iso: string, hoje: string): string {
  const n = diasEntre(diaDe(iso), hoje);
  if (n <= 0) return "hoje";
  if (n === 1) return "ontem";
  return `há ${n} dias`;
}

/** PrazoBadge do real: atrasado e perto do fim em vermelho, até 7 dias em amarelo, o resto neutro. */
export function PrazoPedido({ prazo, hoje }: { prazo?: string; hoje: string }) {
  if (!prazo) return <span className="text-[11px] text-muted-foreground/70">Sem data desejada</span>;
  const n = diasEntre(hoje, prazo);
  const [texto, classe] =
    n < 0
      ? ["Atrasado", "bg-destructive/10 text-destructive"]
      : n === 0
        ? ["Vence hoje", "bg-destructive/10 text-destructive"]
        : n <= 2
          ? [`Vence em ${n}d`, "bg-destructive/10 text-destructive"]
          : n <= 7
            ? [`Vence em ${n}d`, "bg-warning-soft text-warning"]
            : [`Para ${ddmm(prazo)}`, "bg-secondary text-muted-foreground"];
  return (
    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 font-display text-[11px] font-bold", classe)}>{texto}</span>
  );
}

// ─── Parecer da IA (ParecerTriagem real) ──────────────────────────────────

const CFG: Record<ParecerPedido["nivel"], { cor: string; selo: string; rotulo: string }> = {
  verde: { cor: "var(--success)", selo: "bg-success-soft text-success", rotulo: "Pronto para produzir" },
  ambar: { cor: "var(--warning)", selo: "bg-warning-soft text-warning", rotulo: "Falta informação" },
  vermelho: { cor: "var(--destructive)", selo: "bg-destructive/10 text-destructive", rotulo: "Precisa de alinhamento" },
};

export function corProntidao(pct: number) {
  if (pct >= 75) return "var(--success)";
  if (pct >= 45) return "var(--warning)";
  return "var(--destructive)";
}

const ETAPAS_ANALISE = ["Lendo o pedido…", "Cruzando com o padrão da marca…"];
const MS_POR_ETAPA = 2100;

/** Dois traços que nascem no topo-centro e crescem até a prontidão (igual ao real). */
export function ContornoProntidao({ pct }: { pct: number }) {
  const p = Math.max(0, Math.min(100, pct)) / 100;
  const [frac, setFrac] = useState(0);
  const [animar, setAnimar] = useState(true);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setAnimar(false);
      setFrac(p);
      return;
    }
    const t = window.setTimeout(() => setFrac(p), 60);
    return () => window.clearTimeout(t);
  }, [p]);
  const estilo = animar ? { transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,0.84,0.44,1)" } : undefined;
  const traco = (d: string) => (
    <path
      d={d}
      fill="none"
      stroke={corProntidao(pct)}
      strokeWidth="1.2"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - frac}
      style={estilo}
      opacity={0.75}
      vectorEffect="non-scaling-stroke"
    />
  );
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {traco("M50 0 H96 Q100 0 100 4 V96 Q100 100 96 100 H50")}
      {traco("M50 0 H4 Q0 0 0 4 V96 Q0 100 4 100 H50")}
    </svg>
  );
}

/**
 * `ativo` = alguém já assumiu. `analisar` = acabou de assumir neste dialog:
 * só aí roda a coreografia "Lendo o pedido…" (≈4 s, igual ao real). Pedido
 * que já estava em triagem mostra o parecer pronto (o real guarda em cache).
 */
function PainelParecer({ parecer, ativo, analisar }: { parecer: ParecerPedido; ativo: boolean; analisar: boolean }) {
  const [analisando, setAnalisando] = useState(false);
  const [etapa, setEtapa] = useState(0);

  // Layout effect: entra em "analisando" antes de pintar, sem piscar o resultado.
  useLayoutEffect(() => {
    if (!analisar) return;
    setAnalisando(true);
    setEtapa(0);
    const timers = [
      window.setTimeout(() => setEtapa(1), MS_POR_ETAPA),
      window.setTimeout(() => setAnalisando(false), MS_POR_ETAPA * ETAPAS_ANALISE.length),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [analisar]);

  if (!ativo) {
    return (
      <div className="rounded-3xl bg-card p-6 shadow-card">
        <div className="flex flex-col items-center gap-3 text-center">
          <IaDigisystem size={64} estado="vivo" />
          <p className="text-xs text-muted-foreground">Assuma a triagem para eu analisar a prontidão deste pedido.</p>
        </div>
      </div>
    );
  }

  if (analisando) {
    return (
      <div className="ia-borda-analise bg-card p-6 shadow-card" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-center">
          <IaDigisystem size={76} estado="processando" animarEntrada />
          <TextGenerateDigisystem key={etapa} texto={ETAPAS_ANALISE[etapa]} className="text-xs text-muted-foreground" />
        </div>
      </div>
    );
  }

  const cfg = CFG[parecer.nivel];
  const cor = corProntidao(parecer.prontidao);
  return (
    <div className="parecer-settle relative rounded-3xl bg-card p-5 shadow-card">
      <ContornoProntidao pct={parecer.prontidao} />
      <div className="relative">
        <div className="flex items-center gap-2">
          <IaDigisystem size={30} />
          <span className={cn("rounded-full px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wide", cfg.selo)}>
            {cfg.rotulo}
          </span>
        </div>
        {/* No mock o título às vezes repete o selo; só aparece quando acrescenta algo. */}
        {parecer.titulo !== cfg.rotulo && <h4 className="mt-3 font-display text-lg font-bold text-primary">{parecer.titulo}</h4>}
        <TextGenerateDigisystem texto={parecer.resumo} className="mt-2 text-sm text-muted-foreground" />
        {parecer.pontos.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {parecer.pontos.map((p) => (
              <li key={p} className="flex gap-2 text-xs text-foreground">
                <span aria-hidden className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: cfg.cor }} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
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

// ─── Detalhe do pedido (DetalhePedidoExterno real) ────────────────────────

function Par({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null;
  return (
    <p className="text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{label}:</span> {valor}
    </p>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto?: string }) {
  if (!texto) return null;
  return (
    <div className="rounded-xl bg-secondary px-3 py-2">
      <p className="font-display text-[11px] font-bold uppercase tracking-wide text-primary">{titulo}</p>
      <p className="whitespace-pre-wrap text-xs text-muted-foreground">{texto}</p>
    </div>
  );
}

function tamanho(bytes: number): string {
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} MB` : `${Math.round(bytes / 1000)} KB`;
}

function DetalhePedido({ card, meta }: { card: Card; meta: SolicitacaoMeta }) {
  const { acoes } = useHub();
  // B-06 corrigido: comoLista trata texto solto como 1 item.
  const chips = itensDoPedido(meta);
  const objetivos = comoLista(meta.objetivos);
  const objetivo = objetivos.length ? objetivos.join(", ") + (meta.objetivoOutro ? ` (${meta.objetivoOutro})` : "") : undefined;
  const fornecedor =
    meta.dependeFornecedor === true
      ? `Fornecedor externo: ${meta.orcamento ? `R$ ${meta.orcamento}` : "orçamento a definir"}`
      : meta.dependeFornecedor === false
        ? "Interno (sem verba)"
        : undefined;
  const clientes = comoLista(meta.clientes);
  const anexos = meta.anexos ?? [];

  return (
    <div className="flex flex-col">
      {card.descricao && <p className="whitespace-pre-wrap text-sm text-foreground/85">{card.descricao}</p>}
      <div className="mt-3 space-y-2 border-t border-border pt-3">
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span key={c} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
        )}
        <Par label="Objetivo" valor={objetivo} />
        <Par label="Formato" valor={meta.formato} />
        <Par label="CTA" valor={meta.cta} />
        <Par label="Público" valor={meta.publico} />
        <Par label="Quantidade" valor={meta.quantidade} />
        <Par label="Destino" valor={meta.destino} />
        <Par label="Prioridade" valor={meta.prioridade} />
        <Par label="Data do evento" valor={meta.dataEvento ? ddmm(meta.dataEvento) : undefined} />
        <Par label="Clientes" valor={clientes.length ? clientes.join(", ") : undefined} />
        <Par label="Duração" valor={meta.duracao} />
        <Par label="Aprova/acompanha" valor={meta.aprovacao} />
        {fornecedor && <p className="text-xs text-muted-foreground">{fornecedor}</p>}
        <Bloco titulo="Mensagem-chave" texto={meta.mensagemChave} />
        <Bloco titulo="Referências" texto={meta.referencias} />
      </div>
      {anexos.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          <p className="font-display text-[11px] font-bold uppercase tracking-wide text-primary">Anexos ({anexos.length})</p>
          {anexos.map((a) => (
            <button
              key={a.nome}
              type="button"
              onClick={() => acoes.avisar("No protótipo, os anexos não abrem: só o nome do arquivo é de exemplo.")}
              className="flex w-full items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-left text-xs text-foreground transition-colors duration-300 hover:bg-secondary/70"
            >
              <Paperclip aria-hidden className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="truncate">{a.nome}</span>
              <span className="ml-auto shrink-0 text-muted-foreground">{tamanho(a.tamanho)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dialogs de decisão (DecisaoTriagem real) ─────────────────────────────

type Decisao = "aprovar" | "devolver" | "negar";

function DialogDecisao({
  titulo,
  ajuda,
  onFechar,
  rodape,
  children,
}: {
  titulo: string;
  ajuda: string;
  onFechar: () => void;
  rodape: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="fixed inset-0 z-[58] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Fechar" onClick={onFechar} className="absolute inset-0 bg-primary/20" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className="animate-rise relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-card p-6 shadow-float sm:max-w-md sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id={id} className="font-display text-xl font-bold text-primary">
            {titulo}
          </h3>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{ajuda}</p>
        <div className="mt-5 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full px-4 py-2.5 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
          >
            Cancelar
          </button>
          {rodape}
        </div>
      </div>
    </div>
  );
}

const botaoBase =
  "rounded-full px-5 py-2.5 font-display text-xs font-bold shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float disabled:pointer-events-none disabled:opacity-40";

function AprovarDialog({ card, onFechar, onFeito }: { card: Card; onFechar: () => void; onFeito: () => void }) {
  const { dados, sel, acoes } = useHub();
  const ehPost = card.pedido?.categoria === "post";
  const [responsavelId, setResponsavelId] = useState("");
  const [etiquetas, setEtiquetas] = useState<string[]>(ehPost ? ["e-post"] : []);
  const alternar = (id: string) => setEtiquetas((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <DialogDecisao
      titulo="Aprovar e designar"
      ajuda="O card entra no Quadro em A fazer para o responsável escolhido."
      onFechar={onFechar}
      rodape={
        <button
          type="button"
          disabled={!responsavelId}
          onClick={() => acoes.aprovarPedido(card.id, responsavelId, etiquetas).ok && onFeito()}
          className={cn(botaoBase, "bg-primary text-primary-foreground")}
        >
          Confirmar aprovação
        </button>
      }
    >
      <label className="block">
        <span className={rotulo}>Responsável</span>
        <select value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} className={campo}>
          <option value="">Escolha quem vai cuidar</option>
          {dados.usuarios
            .filter((u) => u.ativo)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
        </select>
      </label>
      <fieldset>
        <legend className={rotulo}>Etiquetas (opcional)</legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {sel.etiquetasAtivas().map((et) => {
            const fixa = ehPost && et.id === "e-post";
            const ativa = fixa || etiquetas.includes(et.id);
            return (
              <button
                key={et.id}
                type="button"
                aria-pressed={ativa}
                aria-disabled={fixa}
                title={fixa ? "Pedido de post já chega com a etiqueta Post." : undefined}
                onClick={() => !fixa && alternar(et.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-semibold transition-all duration-300",
                  ativa ? "bg-navy-soft text-primary ring-1 ring-primary/30" : "bg-muted text-muted-foreground hover:text-primary",
                  fixa && "cursor-default",
                )}
              >
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: et.cor }} />
                {et.nome}
              </button>
            );
          })}
        </div>
        {ehPost && <p className="mt-2 text-[11px] text-muted-foreground">Pedido de post já chega com a etiqueta Post.</p>}
      </fieldset>
    </DialogDecisao>
  );
}

function MotivoDialog({
  card,
  tipo,
  sugestao,
  onFechar,
  onFeito,
}: {
  card: Card;
  tipo: "devolver" | "negar";
  sugestao?: string;
  onFechar: () => void;
  onFeito: () => void;
}) {
  const { acoes } = useHub();
  const [motivo, setMotivo] = useState(tipo === "devolver" ? sugestao ?? "" : "");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const negar = tipo === "negar";

  return (
    <DialogDecisao
      titulo={negar ? "Negar pedido" : "Devolver para ajuste"}
      ajuda={
        negar
          ? "O pedido sai do Quadro e fica no histórico de decisões. O solicitante vê o motivo em Meus pedidos."
          : "O card vai para Problemas como Aguardando o solicitante e volta para Recebidos quando ele reenviar."
      }
      onFechar={onFechar}
      rodape={
        <button
          type="button"
          disabled={motivo.trim().length < 5}
          onClick={() => (negar ? acoes.negarPedido(card.id, motivo) : acoes.devolverPedido(card.id, motivo)).ok && onFeito()}
          className={cn(botaoBase, negar ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground")}
        >
          {negar ? "Confirmar negativa" : "Devolver para o solicitante"}
        </button>
      }
    >
      <label className="block">
        <span className={rotulo}>{negar ? "Motivo da negativa" : "O que precisa ser ajustado?"}</span>
        <textarea
          ref={ref}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={4}
          placeholder={negar ? "Por que este pedido não será atendido?" : "Conte ao solicitante o que falta no pedido."}
          className={cn(campo, "resize-none")}
        />
      </label>
      {!negar && sugestao && <p className="text-[11px] text-muted-foreground">Texto sugerido pelo parecer da IA. Ajuste como quiser.</p>}
    </DialogDecisao>
  );
}

// ─── Dialog do pedido ─────────────────────────────────────────────────────

export function PedidoDialog({ cardId, onFechar }: { cardId: string; onFechar: () => void }) {
  const { dados, hoje, usuario, sel, acoes } = useHub();
  const idTitulo = useId();
  const [decisao, setDecisao] = useState<Decisao | null>(null);
  const [assumiuAgora, setAssumiuAgora] = useState(false);
  const card = sel.cardPorId(cardId);
  const pedido = card?.pedido;

  useEffect(() => {
    const onTecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (decisao) setDecisao(null);
      else onFechar();
    };
    window.addEventListener("keydown", onTecla);
    return () => window.removeEventListener("keydown", onTecla);
  }, [decisao, onFechar]);

  if (!card || !pedido) return null;

  const solicitante = sel.solicitantePorId(pedido.solicitanteId);
  const triador = sel.usuarioPorId(pedido.triagemPor);
  const status = STATUS_TRIAGEM[pedido.estado];
  const aberto = pedido.estado === "recebido" || pedido.estado === "triagem";
  // Trava de autoria (igual ao real): quem abriu o pedido não decide.
  const autor = solicitante?.usuarioId === usuario.id;
  const decisoesDoCard = dados.decisoes.filter((d) => d.cardId === card.id).sort((a, b) => b.em.localeCompare(a.em));
  const ultima = decisoesDoCard[0];
  const coluna = sel.colunaDoCard(card);
  const nomeColuna = COLUNAS.find((c) => c.id === coluna)?.label;

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Fechar o pedido" onClick={onFechar} className="absolute inset-0 bg-primary/25 backdrop-blur-[2px]" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="animate-tela-abrindo relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-float sm:max-h-[85vh] sm:max-w-3xl sm:rounded-3xl"
      >
        <header className="border-b border-border px-6 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <span className={cn("rounded-full px-2.5 py-0.5 normal-case tracking-normal", status.classe)}>{status.texto}</span>
                {CATEGORIA_PEDIDO[pedido.categoria]}
              </p>
              <h2 id={idTitulo} className="mt-2 font-display text-xl font-bold leading-snug text-primary sm:text-2xl">
                {card.titulo}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {solicitante && (
                  <span>
                    {solicitante.nome} · <span className="font-semibold text-foreground/80">{solicitante.area}</span>
                  </span>
                )}
                <span>Recebido {haQuanto(pedido.recebidoEm, hoje)}</span>
                <PrazoPedido prazo={card.prazo} hoje={hoje} />
              </p>
            </div>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar"
              className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <DetalhePedido card={card} meta={pedido.meta} />
            <div className="lg:border-l lg:border-border lg:pl-5">
              <PainelParecer key={card.id} parecer={pedido.parecer} ativo={pedido.estado !== "recebido"} analisar={assumiuAgora} />
            </div>
          </div>
        </div>

        <footer className="border-t border-border bg-card px-6 py-4">
          {aberto && autor ? (
            <p className="rounded-2xl bg-orange-soft px-4 py-3 text-sm text-foreground/85">
              Você criou este pedido: por padrão, a decisão cabe a outra pessoa do time.
            </p>
          ) : pedido.estado === "recebido" ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Ninguém assumiu ainda. Quem assume fica com o pedido até decidir.</p>
              <button
                type="button"
                onClick={() => acoes.assumirPedido(card.id).ok && setAssumiuAgora(true)}
                className={cn(botaoBase, "bg-primary text-primary-foreground")}
              >
                Assumir triagem
              </button>
            </div>
          ) : pedido.estado === "triagem" ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Em triagem com{" "}
                <span className="font-semibold text-foreground/85">{triador?.id === usuario.id ? "você" : triador?.nome.split(" ")[0]}</span>
                {pedido.triagemEm && <> desde {ddmm(pedido.triagemEm)}</>}.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDecisao("negar")}
                  className="rounded-full border border-destructive/50 px-4 py-2.5 font-display text-xs font-bold text-destructive transition-all duration-300 hover:-translate-y-0.5 hover:bg-destructive/5"
                >
                  Negar
                </button>
                <button
                  type="button"
                  onClick={() => setDecisao("devolver")}
                  className="rounded-full border border-accent/60 px-4 py-2.5 font-display text-xs font-bold text-accent transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-soft"
                >
                  Devolver para ajuste
                </button>
                <button type="button" onClick={() => setDecisao("aprovar")} className={cn(botaoBase, "bg-primary text-primary-foreground")}>
                  Aprovar e designar
                </button>
              </div>
            </div>
          ) : (
            <Decidido card={card} ultima={ultima} nomeColuna={nomeColuna} />
          )}
        </footer>
      </section>

      {decisao === "aprovar" && <AprovarDialog card={card} onFechar={() => setDecisao(null)} onFeito={onFechar} />}
      {(decisao === "devolver" || decisao === "negar") && (
        <MotivoDialog
          card={card}
          tipo={decisao}
          sugestao={pedido.parecer.sugestaoDevolucao}
          onFechar={() => setDecisao(null)}
          onFeito={onFechar}
        />
      )}
    </div>
  );
}

/** Rodapé do pedido já decidido: quem decidiu, quando, o motivo e onde o card está agora. */
function Decidido({
  card,
  ultima,
  nomeColuna,
}: {
  card: Card;
  ultima?: { tipo: string; por: string; em: string; motivo?: string };
  nomeColuna?: string;
}) {
  const { hoje, sel } = useHub();
  const estado = card.pedido?.estado;
  const quem = sel.usuarioPorId(ultima?.por)?.nome.split(" ")[0];
  const quando = ultima ? ` em ${ddmm(ultima.em)}` : "";

  const linkCard = nomeColuna && (
    <a
      href={hrefDe("tarefas", "quadro", { card: card.id })}
      className="inline-flex items-center gap-1 font-display text-xs font-bold text-primary transition-colors duration-300 hover:text-accent"
    >
      Abrir o card em {nomeColuna} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
    </a>
  );

  if (estado === "aprovado") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/85">
          Aprovado{quem && ` por ${quem}`}
          {quando}. O trabalho segue no Quadro.
        </p>
        {linkCard}
      </div>
    );
  }
  if (estado === "devolvido") {
    const dias = ultima ? diasEntre(diaDe(ultima.em), hoje) : 0;
    return (
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-xl">
          <p className="text-sm text-foreground/85">
            Devolvido{quem && ` por ${quem}`}
            {quando}. Aguardando o solicitante ajustar e reenviar{dias > 0 && ` (${dias === 1 ? "1 dia" : `${dias} dias`})`}.
          </p>
          {ultima?.motivo && <p className="mt-1 text-xs italic text-muted-foreground">"{ultima.motivo}"</p>}
        </div>
        {linkCard}
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm text-foreground/85">
        Negado{quem && ` por ${quem}`}
        {quando}. Este pedido não aparece mais no Quadro.
      </p>
      {ultima?.motivo && <p className="mt-1 text-xs italic text-muted-foreground">"{ultima.motivo}"</p>}
    </div>
  );
}
