/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/planejamento.tsx (chip "⚑ Reprovado" com Flag),
 *   src/components/planejamento/DecisaoTriagem.tsx (padrão de motivo obrigatório) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Problemas de um item (proposta 4.4, revisão 3): cada problema é um registro
 * ligado ao card, à subtarefa ou ao post, com tipo, motivo, quem abriu e
 * quando. Reprovado e Aguardando o solicitante abrem e fecham sozinhos; o
 * Bloqueado é manual, com motivo obrigatório, e fecha à mão. K9: post
 * aguardando aprovação não vira bloqueado (a regra está em regras.ts).
 */
import { useState } from "react";
import { Flag } from "lucide-react";
import { cn } from "../../lib/utils";
import { useHub } from "../store/HubStore";
import { ROTULO_PROBLEMA, ddmm, itemPorId } from "../store/regras";
import type { DadosHub, Problema } from "../store/tipos";

/** Onde o problema aconteceu, para a lista do card: o título do item, ou "card inteiro". */
function ondeAconteceu(dados: DadosHub, p: Problema): string {
  if (p.alvo.tipo === "card") return "card inteiro";
  if (p.alvo.tipo === "subtarefa") return itemPorId(dados, p.alvo.id)?.titulo ?? "subtarefa";
  const post = dados.posts.find((x) => x.id === p.alvo.id);
  const item = post?.itemId ? itemPorId(dados, post.itemId) : undefined;
  return item?.tipo === "subtarefa" ? item.titulo : "post do card";
}

/** Uma linha de problema aberto, com "Resolver" quando é Bloqueado. */
export function LinhaProblema({ problema, mostrarItem = false }: { problema: Problema; mostrarItem?: boolean }) {
  const { dados, sel, acoes } = useHub();
  const quem = sel.usuarioPorId(problema.abertoPor)?.nome.split(" ")[0];
  const espera = problema.tipo === "aguardando_solicitante";
  const fechaSozinho =
    problema.tipo === "reprovado"
      ? "Fecha sozinho quando o post for reenviado para aprovação."
      : espera
        ? "Fecha sozinho quando o solicitante reenviar o pedido."
        : null;

  return (
    <li className={cn("flex items-start gap-2.5 rounded-xl px-3 py-2.5", espera ? "bg-orange-soft" : "bg-destructive/[0.06]")}>
      <Flag aria-hidden className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", espera ? "text-accent" : "text-destructive")} />
      <div className="min-w-0 flex-1">
        <p className={cn("font-display text-xs font-bold", espera ? "text-accent" : "text-destructive")}>
          {ROTULO_PROBLEMA[problema.tipo]}
          {mostrarItem && <span className="font-semibold text-foreground/70"> · {ondeAconteceu(dados, problema)}</span>}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">{problema.motivo}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Aberto {quem ? `por ${quem} ` : ""}em {ddmm(problema.abertoEm)}
          {fechaSozinho && `. ${fechaSozinho}`}
        </p>
      </div>
      {problema.tipo === "bloqueado" && (
        <button
          type="button"
          onClick={() => acoes.resolverProblema(problema.id)}
          className="shrink-0 rounded-full bg-card px-3 py-1 font-display text-[11px] font-bold text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5"
        >
          Resolver
        </button>
      )}
    </li>
  );
}

/**
 * "Marcar como bloqueado" com motivo obrigatório. Antes de abrir o campo,
 * confere a regra: se não pode (K9, item concluído, já bloqueado), avisa o porquê.
 */
export function MarcarBloqueado({
  alvo,
  rotuloBotao = "Marcar como bloqueado",
}: {
  alvo: { tipo: "card" | "subtarefa"; id: string };
  rotuloBotao?: string;
}) {
  const { sel, acoes } = useHub();
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");

  const abrir = () => {
    const r = sel.podeMarcarBloqueado(alvo);
    if (!r.ok) {
      acoes.avisar(r.motivo, "erro");
      return;
    }
    setAberto(true);
  };

  const confirmar = () => {
    if (acoes.marcarBloqueado(alvo, motivo).ok) {
      setAberto(false);
      setMotivo("");
    }
  };

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={abrir}
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-destructive"
      >
        <Flag aria-hidden className="h-3.5 w-3.5" /> {rotuloBotao}
      </button>
    );
  }

  return (
    <div className="animate-rise w-full rounded-xl border border-destructive/25 bg-background p-3">
      <label className="block">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-destructive">O que está travando?</span>
        <textarea
          autoFocus
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={2}
          placeholder="Ex: esperando a autorização de uso de imagem do cliente"
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-sky focus:ring-2 focus:ring-sky/30"
        />
      </label>
      <p className="mt-1 text-[11px] text-muted-foreground">O motivo aparece no card e na mesa de quem precisa agir.</p>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setAberto(false);
            setMotivo("");
          }}
          className="px-2 py-1.5 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirmar}
          className="rounded-full bg-destructive px-3.5 py-1.5 font-display text-[11px] font-bold text-destructive-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5"
        >
          Marcar como bloqueado
        </button>
      </div>
    </div>
  );
}
