/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/admin/AbaIntegracoes.tsx, src/routes/_authenticated/admin.integracoes.tsx
 *   @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md
 *   (seção 7: Integrações fica só com webhooks e conexões).
 *
 * Configurações → Integrações (só admin). Os 4 webhooks do n8n do real
 * (Iniciar Composição, Buscar Acervo, Atualizar Tendências, Atualizar SWOT),
 * cada um com URL, origem e Salvar, e as conexões com as redes como "Em breve"
 * (os callbacks OAuth existem no código, sem tela). O que o real ainda carrega
 * aqui, duplicado, saiu: Manual de Estilo e prompts foram para IA e prompts;
 * tamanhos de logo foram para Marca → Logos e fundos.
 * Em vez de 4 cards iguais empilhados, uma lista só com divisores e uma frase
 * no topo dizendo o que está ligado. URLs fictícias (n8n.exemplo.com).
 * Regra (regras.ts → Integrações): URL https completa para salvar.
 */
import { useEffect, useState } from "react";
import { ArrowUpRight, Plug } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { REDE_META } from "../../components/RedeIcone";
import { hrefDe } from "../../router";
import { useHub } from "../../store/HubStore";
import { validarUrlWebhook } from "../../store/regras";
import type { Rede, Webhook } from "../../store/tipos";
import { atraso, BotaoSalvar, CAMPO } from "./partes";

/** O que no Hub depende de cada webhook (para a frase do topo e a linha "Usado por"). */
const USADO_POR: Record<string, string> = {
  "wh-composicao": "Compor a arte, no Estúdio",
  "wh-acervo": "Buscar no acervo, no Estúdio",
  "wh-tendencias": "A pesquisa semanal de Tendências",
  "wh-swot": "Regenerar com a IA, em Tendências → SWOT",
};

const CONEXOES: { redes: Rede[]; nome: string; texto: string }[] = [
  { redes: ["linkedin"], nome: "LinkedIn", texto: "Página da empresa: publicar e ler métricas." },
  { redes: ["instagram", "facebook"], nome: "Meta (Instagram e Facebook)", texto: "Conta comercial e página: publicar e ler métricas." },
  { redes: ["youtube"], nome: "YouTube", texto: "Canal: métricas dos vídeos." },
];

export function Integracoes() {
  const { dados } = useHub();
  const semUrl = dados.webhooks.filter((w) => !w.url.trim());
  const comUrl = dados.webhooks.length - semUrl.length;

  return (
    <>
      <CabecalhoArea area="configuracoes" aba="integracoes" subtitulo="Os webhooks do n8n que o Hub chama e as conexões com as redes." />

      <div className="mx-auto w-full max-w-3xl">
        <p className="animate-rise mt-8 text-[15px] leading-relaxed text-muted-foreground" style={atraso(60)}>
          <span className="font-display text-lg font-bold text-primary">{comUrl}</span> de {dados.webhooks.length} webhooks têm URL.
          {semUrl.length === 0
            ? " Tudo o que o Hub manda para o n8n está ligado."
            : ` Falta ${semUrl.map((w) => w.nome.replace(/^n8n\s+/, "")).join(" e ")}: sem a URL, ${semUrl
                .map((w) => (USADO_POR[w.id] ?? w.nome).replace(/^./, (c) => c.toLowerCase()))
                .join(" e ")} não chega ao n8n.`}
        </p>

        <section
          aria-label="Webhooks do n8n"
          className="animate-rise mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card"
          style={atraso(120)}
        >
          <ul className="divide-y divide-border/70">
            {dados.webhooks.map((w) => (
              <LinhaWebhook key={w.id} webhook={w} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="conexoes-titulo" className="animate-rise mt-10" style={atraso(200)}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="conexoes-titulo" className="font-display text-lg font-bold text-primary">
              Conexões com as redes
            </h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Em breve
            </span>
          </div>
          <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
            Ficam para depois do go-live, junto de Resultados → Redes. Até lá, "publicado" é marcado à mão no Calendário, e nenhuma conta das redes é
            conectada.
          </p>
          <ul className="mt-4 divide-y divide-border/70">
            {CONEXOES.map((c) => (
              <li key={c.nome} className="flex items-center gap-3 py-3 opacity-70">
                <span className="flex shrink-0 -space-x-1.5">
                  {c.redes.map((r) => {
                    const { Icone, className, label } = REDE_META[r];
                    return (
                      <span key={r} title={label} className={cn("grid h-9 w-9 place-items-center rounded-2xl ring-2 ring-background", className)}>
                        <Icone aria-hidden className="h-4 w-4" />
                      </span>
                    );
                  })}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold text-primary">{c.nome}</p>
                  <p className="text-[12px] text-muted-foreground">{c.texto}</p>
                </div>
                <button
                  type="button"
                  disabled
                  className="shrink-0 cursor-not-allowed rounded-full border border-border px-3 py-1.5 font-display text-xs font-bold text-muted-foreground"
                >
                  Conectar
                </button>
              </li>
            ))}
          </ul>
        </section>

        <p className="animate-rise mt-10 text-[12px] leading-relaxed text-muted-foreground" style={atraso(260)}>
          Procurando o Manual de Estilo ou os prompts? Estão em{" "}
          <a href={hrefDe("configuracoes", "ia", { sub: "texto" })} className="font-semibold text-primary hover:text-accent">
            IA e prompts
          </a>
          . Os tamanhos do logo (P, M e G) estão em{" "}
          <a href={hrefDe("marca", "logos")} className="font-semibold text-primary hover:text-accent">
            Marca → Logos e fundos
          </a>
          .
        </p>
      </div>
    </>
  );
}

function LinhaWebhook({ webhook }: { webhook: Webhook }) {
  const { acoes } = useHub();
  const [url, setUrl] = useState(webhook.url);
  const [erro, setErro] = useState("");
  useEffect(() => setUrl(webhook.url), [webhook.url]);
  const mudou = url.trim() !== webhook.url;
  const id = `wh-${webhook.id}`;

  const salvar = () => {
    const r = validarUrlWebhook(url);
    if (!r.ok) return setErro(r.motivo);
    acoes.salvarWebhook(webhook.id, url);
  };

  return (
    <li className="px-6 py-5">
      <div className="flex items-start gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-navy-soft text-primary">
          <Plug aria-hidden className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-sm font-bold text-primary">{webhook.nome}</h3>
            <span className={cn("h-2 w-2 rounded-full", webhook.url ? "bg-success" : "bg-border")} aria-hidden />
            <span className="sr-only">{webhook.url ? "Configurado" : "Sem URL"}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{webhook.descricao}</p>
          {USADO_POR[webhook.id] && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <ArrowUpRight aria-hidden className="h-3 w-3" /> Usado por: {USADO_POR[webhook.id]}
            </p>
          )}
        </div>
      </div>
      <form
        className="mt-3 sm:pl-[46px]"
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
      >
        <label htmlFor={id} className="text-xs text-foreground/80">
          URL do webhook {webhook.nome}
        </label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <input
            id={id}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setErro("");
            }}
            placeholder="https://n8n.exemplo.com/webhook/…"
            inputMode="url"
            spellCheck={false}
            className={cn(CAMPO, "min-w-[240px] flex-1 font-mono text-xs", erro && "border-destructive")}
          />
          <BotaoSalvar type="submit" disabled={!mudou} />
        </div>
        <p className={cn("mt-1.5 text-[11px]", erro ? "text-destructive" : "text-muted-foreground")} role={erro ? "alert" : undefined}>
          {erro || (webhook.url ? "Valor configurado no banco de dados." : "Nenhuma URL configurada ainda.")}
        </p>
      </form>
    </li>
  );
}
