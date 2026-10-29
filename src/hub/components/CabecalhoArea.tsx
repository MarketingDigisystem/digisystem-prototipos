/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/PageHeader.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Cabeçalho padrão de uma aba: lê o kicker, o título e as abas da área no
 * router e filtra as abas pelo papel atual ("Para aprovar" só Aprovador e Admin).
 * Cada página monta o seu, para poder trocar o subtítulo e as ações.
 */
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { AREAS, abasVisiveis, hrefDe, type AreaId } from "../router";
import { useHub } from "../store/HubStore";
import { PageHeader } from "./PageHeader";

export function CabecalhoArea({
  area,
  aba,
  subtitulo,
  actions,
}: {
  area: AreaId;
  aba: string;
  /** Subtítulo próprio da aba. Ausente = subtítulo da área. */
  subtitulo?: string;
  actions?: ReactNode;
}) {
  const { papel } = useHub();
  const meta = AREAS[area];
  return (
    <PageHeader
      eyebrow={meta.eyebrow}
      title={meta.titulo}
      subtitle={subtitulo ?? meta.subtitulo}
      area={area}
      abas={abasVisiveis(area, papel)}
      abaAtiva={aba}
      actions={actions}
    />
  );
}

/** Botão "Criar post" das abas de Posts: abre o Estúdio (#/posts/criar). */
export function BotaoCriarPost({ params }: { params?: Record<string, string | undefined> }) {
  return (
    <a
      href={hrefDe("posts", "criar", params)}
      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
    >
      <Plus className="h-3.5 w-3.5" /> Criar post
    </a>
  );
}

/**
 * Corpo provisório de uma aba ainda sem conteúdo (item 1.3 do checklist).
 * Some quando a página ganha a tela inicial nos itens seguintes.
 */
export function CorpoProvisorio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <section className="animate-rise mt-8 rounded-3xl bg-card p-6 shadow-card" style={{ animationDelay: "90ms" }}>
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{titulo}</p>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{texto}</p>
    </section>
  );
}
