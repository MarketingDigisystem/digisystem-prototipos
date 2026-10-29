/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/brand-kit.tsx (ChipsField "Hashtags oficiais", seção
 *   Elementos) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Marca → Hashtags. As hashtags oficiais saem da seção Elementos do Brand Kit
 * e ganham aba própria, com a regra escrita ao lado:
 *  - toda hashtag nova passa por formatarHashtag (só a primeira letra
 *    maiúscula, sem espaço); o real só acrescenta o "#";
 *  - regras.ts → avaliarHashtagsOficiais avisa quando as oficiais não deixam
 *    vaga para 3 de contexto no limite de 8;
 *  - "Como fica num post" mostra, por segmento, o que entra e o que fica de
 *    fora (regras.ts → previaHashtags), com as de contexto da IA simulada.
 */
import { useState } from "react";
import { AlertTriangle, Hash } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { cn } from "../../../lib/utils";
import { hrefDe } from "../../router";
import { useHub } from "../../store/HubStore";
import { hashtagsDeContexto } from "../../store/mock-geracao";
import { avaliarHashtagsOficiais, formatarHashtag, LIMITES_CONTEUDO, plural, previaHashtags } from "../../store/regras";
import { atraso, CampoChips, Secao, type PropsAba } from "./partes";

export function Hashtags({ form, patch, podeEditar }: PropsAba) {
  const { acoes, papel } = useHub();
  const oficiais = form.hashtagsOficiais;
  const aval = avaliarHashtagsOficiais(oficiais);
  const segmentos = form.segmentos.map((s) => s.nome).filter(Boolean);
  const [segmento, setSegmento] = useState(segmentos[0] ?? "");
  const contexto = hashtagsDeContexto(segmento);
  const previa = previaHashtags(oficiais, contexto);

  return (
    <>
      <p className="animate-rise mt-8 max-w-3xl text-[15px] leading-relaxed text-foreground/85" style={atraso(70)}>
        {plural(oficiais.length, "hashtag oficial", "hashtags oficiais")}. Num post entram as oficiais e mais 3 a 5 de
        contexto, até {LIMITES_CONTEUDO.hashtags} no total, sempre com só a primeira letra maiúscula, como #Governançadedados.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Secao icone={<Hash aria-hidden className="h-4 w-4" />} titulo="Hashtags oficiais" delay={120}>
          <div className="mt-4">
            <CampoChips
              rotulo="Entram em todo post"
              valores={oficiais}
              onChange={(v) => patch("hashtagsOficiais", v)}
              podeEditar={podeEditar}
              tom="accent"
              placeholder="#Digisystem"
              normalizar={formatarHashtag}
              aoAjustar={(digitado, gravado) => acoes.avisar(`"${digitado}" entrou como ${gravado}, no padrão da marca.`)}
            />
          </div>

          {aval.foraDoPadrao.length > 0 && (
            <div className="mt-4 rounded-2xl bg-warning-soft px-4 py-3 text-xs text-foreground">
              <p className="font-display font-bold text-warning">Fora do padrão de capitalização</p>
              <ul className="mt-1 space-y-0.5">
                {aval.foraDoPadrao.map((h) => (
                  <li key={h.atual}>
                    {h.atual} → <span className="font-semibold">{h.sugerida}</span>
                  </li>
                ))}
              </ul>
              {podeEditar && (
                <button
                  type="button"
                  onClick={() => patch("hashtagsOficiais", [...new Set(oficiais.map((h) => formatarHashtag(h) || h))])}
                  className="mt-2 font-display text-[11px] font-bold text-primary underline-offset-2 hover:underline"
                >
                  Corrigir todas
                </button>
              )}
            </div>
          )}

          {aval.aviso && (
            <div role="note" className="mt-4 flex gap-3 rounded-2xl border border-warning/40 bg-card px-4 py-3">
              <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div className="text-xs leading-relaxed text-foreground/85">
                <p>{aval.aviso}</p>
                <p className="mt-1 text-muted-foreground">
                  Ponto em aberto para decidir na implementação: hoje o Estúdio do protótipo põe só 3 oficiais fixas
                  (#Digisystem, #Parceriaquetransforma e #Tecnologia) para caber o contexto.
                </p>
              </div>
            </div>
          )}
        </Secao>

        <Secao
          icone={<IaDigisystem size={20} />}
          titulo="Como fica num post"
          ajuda="As de contexto mudam conforme o tema. Aqui, as que a IA sugere para cada segmento."
          delay={190}
        >
          <div role="radiogroup" aria-label="Segmento do exemplo" className="mt-4 flex flex-wrap gap-1.5">
            {segmentos.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={s === segmento}
                onClick={() => setSegmento(s)}
                className={cn(
                  "rounded-full px-3 py-1 font-display text-[11px] font-bold transition-all duration-300",
                  s === segmento ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-muted-foreground hover:text-primary",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
            <p className="text-sm leading-relaxed text-primary">
              {previa.usadas.map((h) => (
                <span key={h} className={cn("mr-1.5 inline-block", oficiais.map(formatarHashtag).includes(h) ? "font-semibold" : "text-accent")}>
                  {h}
                </span>
              ))}
            </p>
            <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
              {previa.usadas.length} de {LIMITES_CONTEUDO.hashtags}.{" "}
              <span className="font-semibold text-primary">Oficiais</span> primeiro,{" "}
              <span className="font-semibold text-accent">contexto</span> depois.
              {previa.cortadas.length > 0 && (
                <>
                  {" "}
                  Ficaram de fora: <span className="line-through">{previa.cortadas.join(" ")}</span>.
                </>
              )}
            </p>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            O prompt de hashtags ainda pede "#tudominusculo", o que contradiz esta regra.{" "}
            {papel === "admin" ? (
              <a href={hrefDe("configuracoes", "ia")} className="font-semibold text-primary underline-offset-2 hover:underline">
                Ajustar em Configurações → IA e prompts
              </a>
            ) : (
              "Quem ajusta é o admin, em Configurações → IA e prompts."
            )}
          </p>
        </Secao>
      </div>
    </>
  );
}
