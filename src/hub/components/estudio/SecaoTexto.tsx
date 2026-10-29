/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/DirecaoCriativaStep.tsx, src/hooks/use-gerar-direcao.ts,
 *   src/components/estudio/AgenteMolecula.tsx (ações de texto) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Texto" (D1, D2, D6).
 *
 * "Texto" (a Direção criativa do real, linhas 20 a 30 do inventário):
 *  - Legenda com o alternador "Sua versão / Sugestão da IA", Editar,
 *    Regenerar ao lado e Aprovar.
 *  - Hashtags com adicionar, remover, Regenerar e Aprovar. O limite de 8 é só
 *    um contador de guia (D6).
 *  - Chamadas (CTA): opcionais (D2), uma por rede escolhida (D1), com
 *    Sugerir, editar, remover e Aprovar. Sem chamada com texto, não há o que
 *    aprovar.
 *  - Editar um item aprovado reabre a aprovação dele; nada é apagado.
 * As ações de IA ficam ao lado do campo e também no agente-molécula.
 */
import { useState, type ReactNode } from "react";
import { AlertTriangle, AlignLeft, ArrowRight, Check, Edit2, Hash, Info, Megaphone, Plus, Trash2, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { campo } from "../NovaTarefaDialog";
import { REDE_META } from "../RedeIcone";
import {
  ctaPrecisaAprovar,
  faltaAprovarTexto,
  formatarHashtag,
  fraseFaltaAprovar,
  guiaHashtags,
  type AprovacoesTexto,
} from "../../store/regras";
import type { Rede } from "../../store/tipos";
import { ctaDaRede, legendaFinal, temDuasVersoes, type Editor } from "./editor";
import { BotaoIa, ParPilulas, acaoLeve, botaoAzul, botaoLaranja } from "./partes";

export function SecaoTexto({
  ed,
  setEd,
  ocupado,
  onIa,
  postSalvo,
  onIrArte,
}: {
  ed: Editor;
  setEd: React.Dispatch<React.SetStateAction<Editor>>;
  /** Ação de IA em andamento (id), para o botão certo mostrar "Escrevendo…". */
  ocupado: string | null;
  onIa: (id: string) => void;
  postSalvo: boolean;
  onIrArte: () => void;
}) {
  const [editandoLegenda, setEditandoLegenda] = useState(false);
  const [novaHashtag, setNovaHashtag] = useState("");

  const aprovar = (k: keyof AprovacoesTexto) => setEd((e) => ({ ...e, aprovados: { ...e.aprovados, [k]: true }, sujo: true }));
  /** Toda mudança num item volta a pedir aprovação dele (linhas 22, 24 e 25). */
  const mudarItem = (k: keyof AprovacoesTexto, patch: Partial<Editor>) =>
    setEd((e) => ({ ...e, ...patch, aprovados: { ...e.aprovados, [k]: false }, sujo: true }));

  const legenda = legendaFinal(ed);
  const duas = temDuasVersoes(ed);
  const guia = guiaHashtags(ed.hashtags.length);
  const falta = faltaAprovarTexto(ed.aprovados, ed.ctas, ed.redes);
  const ctaPede = ctaPrecisaAprovar(ed.ctas, ed.redes);

  const adicionarHashtag = () => {
    const h = formatarHashtag(novaHashtag);
    setNovaHashtag("");
    if (!h || ed.hashtags.includes(h)) return;
    mudarItem("hashtags", { hashtags: [...ed.hashtags, h] });
  };
  const textoCta = (rede: Rede, texto: string) =>
    mudarItem("cta", {
      ctas: ctaDaRede(ed, rede)
        ? ed.ctas.map((c) => (c.plataformas.includes(rede) ? { ...c, texto } : c))
        : [...ed.ctas, { texto, plataformas: [rede] }],
    });
  const removerCta = (rede: Rede) => mudarItem("cta", { ctas: ed.ctas.filter((c) => !c.plataformas.includes(rede)) });

  return (
    <div className="space-y-4">
      {ed.fallback ? (
        <div role="status" className="flex items-start gap-2 rounded-2xl bg-warning-soft px-4 py-3 text-xs leading-relaxed text-warning">
          <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <span>IA indisponível. As sugestões vieram do modelo padrão da marca. Revise antes de aprovar.</span>
        </div>
      ) : (
        ed.justificativa && (
          <div className="flex items-start gap-2 rounded-2xl bg-sky-soft px-4 py-3 text-xs leading-relaxed text-primary">
            <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{ed.justificativa}</span>
          </div>
        )
      )}

      {/* Legenda */}
      <ItemTexto
        titulo="Legenda"
        descricao={`${legenda.length} caracteres`}
        Icone={AlignLeft}
        aprovado={ed.aprovados.legenda}
        onAprovar={() => {
          setEditandoLegenda(false);
          aprovar("legenda");
        }}
        podeAprovar={Boolean(legenda.trim())}
        ferramentas={
          <>
            {duas && (
              <ParPilulas
                rotulo="Qual legenda usar"
                valor={ed.versaoLegenda}
                onMudar={(v) => mudarItem("legenda", { versaoLegenda: v })}
                opcoes={[
                  { id: "sua", label: "Sua versão" },
                  { id: "ia", label: "Sugestão da IA" },
                ]}
              />
            )}
            {!editandoLegenda && (
              <button
                type="button"
                className={acaoLeve}
                onClick={() => {
                  setEditandoLegenda(true);
                  if (ed.aprovados.legenda) mudarItem("legenda", {});
                }}
              >
                <Edit2 aria-hidden className="h-3 w-3" /> Editar
              </button>
            )}
            <BotaoIa onClick={() => onIa("regen-legenda")} ocupado={ocupado === "regen-legenda"} disabled={Boolean(ocupado)}>
              Regenerar
            </BotaoIa>
          </>
        }
      >
        {editandoLegenda ? (
          <div className="space-y-2">
            <textarea
              value={legenda}
              aria-label={ed.versaoLegenda === "sua" && ed.legendaSua.trim() ? "Editar a sua versão da legenda" : "Editar a legenda sugerida"}
              onChange={(e) => mudarItem("legenda", ed.versaoLegenda === "sua" && ed.legendaSua.trim() ? { legendaSua: e.target.value } : { legendaIa: e.target.value })}
              rows={8}
              className={cn(campo, "mt-0 resize-y")}
            />
            <button type="button" onClick={() => setEditandoLegenda(false)} className={acaoLeve}>
              Fechar a edição
            </button>
          </div>
        ) : (
          <p className="whitespace-pre-line rounded-2xl bg-secondary/40 p-3 text-sm leading-relaxed text-foreground">{legenda}</p>
        )}
      </ItemTexto>

      <div className="space-y-4">
        {/* Hashtags */}
        <ItemTexto
          titulo="Hashtags"
          descricao={guia.texto}
          descricaoAlerta={guia.acima}
          Icone={Hash}
          aprovado={ed.aprovados.hashtags}
          onAprovar={() => aprovar("hashtags")}
          podeAprovar={ed.hashtags.length > 0}
          ferramentas={
            <>
              {ed.aprovados.hashtags && (
                <button type="button" className={acaoLeve} onClick={() => mudarItem("hashtags", {})}>
                  <Edit2 aria-hidden className="h-3 w-3" /> Editar
                </button>
              )}
              <BotaoIa onClick={() => onIa("regen-hashtags")} ocupado={ocupado === "regen-hashtags"} disabled={Boolean(ocupado)}>
                Regenerar
              </BotaoIa>
            </>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {ed.hashtags.map((h) => (
              <span key={h} className="inline-flex items-center gap-1 rounded-full bg-orange-soft px-2.5 py-1 font-display text-[11px] font-bold text-accent">
                {h}
                {!ed.aprovados.hashtags && (
                  <button
                    type="button"
                    aria-label={`Remover ${h}`}
                    onClick={() => mudarItem("hashtags", { hashtags: ed.hashtags.filter((x) => x !== h) })}
                    className="opacity-50 transition-opacity hover:opacity-100"
                  >
                    <X aria-hidden className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
            {ed.hashtags.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma hashtag ainda.</span>}
          </div>
          {!ed.aprovados.hashtags && (
            <div className="mt-3 flex gap-2">
              <input
                value={novaHashtag}
                onChange={(e) => setNovaHashtag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionarHashtag();
                  }
                }}
                aria-label="Nova hashtag"
                placeholder="#Novahashtag"
                className={cn(campo, "mt-0 h-8 py-1 text-xs")}
              />
              <button type="button" onClick={adicionarHashtag} className={acaoLeve}>
                <Plus aria-hidden className="h-3 w-3" /> Adicionar
              </button>
            </div>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">Padrão da marca: só a primeira letra maiúscula, como #Governançadedados.</p>
        </ItemTexto>

        {/* Chamadas (CTA) */}
        <ItemTexto
          titulo="Chamadas (CTA)"
          descricao="Opcional. Uma por rede escolhida."
          Icone={Megaphone}
          aprovado={ctaPede && ed.aprovados.cta}
          onAprovar={() => aprovar("cta")}
          podeAprovar={ctaPede}
          semAprovacao={!ctaPede ? "Sem chamada, nada a aprovar" : undefined}
          ferramentas={
            <>
              {ctaPede && ed.aprovados.cta && (
                <button type="button" className={acaoLeve} onClick={() => mudarItem("cta", {})}>
                  <Edit2 aria-hidden className="h-3 w-3" /> Editar
                </button>
              )}
              <BotaoIa onClick={() => onIa("sugerir-cta")} ocupado={ocupado === "sugerir-cta"} disabled={Boolean(ocupado)}>
                Sugerir para todas
              </BotaoIa>
            </>
          }
        >
          <ul className="space-y-2">
            {ed.redes.map((r) => {
              const cta = ctaDaRede(ed, r);
              const { Icone, label, className } = REDE_META[r];
              const travado = ctaPede && ed.aprovados.cta;
              return (
                <li key={r} className="rounded-2xl bg-secondary/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-display text-[11px] font-bold text-primary">
                      <span className={cn("grid h-5 w-5 place-items-center rounded-md", className)}>
                        <Icone aria-hidden className="h-3 w-3" />
                      </span>
                      {label}
                    </span>
                    {!travado && (
                      <span className="flex items-center gap-2">
                        <BotaoIa
                          onClick={() => onIa(`sugerir-cta:${r}`)}
                          ocupado={ocupado === `sugerir-cta:${r}`}
                          disabled={Boolean(ocupado)}
                          rotuloAria={`Sugerir a chamada do ${label}`}
                        >
                          Sugerir
                        </BotaoIa>
                        {cta && (
                          <button type="button" className={acaoLeve} onClick={() => removerCta(r)} aria-label={`Remover a chamada do ${label}`}>
                            <Trash2 aria-hidden className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                  {travado ? (
                    <p className="mt-1.5 text-sm text-foreground">{cta?.texto || <span className="text-muted-foreground">Sem chamada.</span>}</p>
                  ) : cta ? (
                    <input
                      value={cta.texto}
                      aria-label={`Chamada do ${label}`}
                      onChange={(e) => textoCta(r, e.target.value)}
                      className={cn(campo, "mt-1.5 h-9 py-1.5")}
                    />
                  ) : (
                    <button type="button" className={cn(acaoLeve, "mt-1.5")} onClick={() => textoCta(r, "")}>
                      <Plus aria-hidden className="h-3 w-3" /> Escrever a chamada
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">Link direto no LinkedIn e no Facebook, palavra-gatilho no Instagram.</p>
        </ItemTexto>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border px-4 py-3">
        <p className={cn("text-xs", falta.length ? "text-muted-foreground" : "font-semibold text-success")}>
          {falta.length
            ? `${fraseFaltaAprovar(falta)} Ao aprovar, o post é salvo sozinho como rascunho.`
            : postSalvo
              ? "Texto aprovado e salvo como rascunho. A arte já está liberada."
              : "Texto aprovado."}
        </p>
        {!falta.length && postSalvo && (
          <button type="button" onClick={onIrArte} className={botaoAzul}>
            Seguir para a arte <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function ItemTexto({
  titulo,
  descricao,
  descricaoAlerta,
  Icone,
  aprovado,
  onAprovar,
  podeAprovar,
  semAprovacao,
  ferramentas,
  children,
}: {
  titulo: string;
  descricao: string;
  descricaoAlerta?: boolean;
  Icone: typeof AlignLeft;
  aprovado: boolean;
  onAprovar: () => void;
  podeAprovar: boolean;
  /** Texto no lugar do Aprovar quando não há o que aprovar (CTA vazio, D2). */
  semAprovacao?: string;
  ferramentas?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-3xl border bg-card p-5 shadow-card transition-all duration-300", aprovado ? "border-success/40" : "border-border")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl", aprovado ? "bg-success/15 text-success" : "bg-orange-soft text-accent")}>
            {aprovado ? <Check aria-hidden className="h-4 w-4" /> : <Icone aria-hidden className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-primary">{titulo}</p>
            <p className={cn("text-[11px]", descricaoAlerta ? "font-semibold text-warning" : "text-muted-foreground")}>{descricao}</p>
          </div>
        </div>
        {aprovado ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-3 py-1 font-display text-[11px] font-bold text-success">
            <Check aria-hidden className="h-3 w-3" /> Aprovado
          </span>
        ) : semAprovacao ? (
          <span className="shrink-0 rounded-full bg-muted px-3 py-1 font-display text-[11px] font-bold text-muted-foreground">{semAprovacao}</span>
        ) : (
          <button type="button" onClick={onAprovar} disabled={!podeAprovar} className={botaoLaranja}>
            <Check aria-hidden className="h-3.5 w-3.5" /> Aprovar
          </button>
        )}
      </div>
      {ferramentas && <div className="mt-3 flex flex-wrap items-center gap-2.5">{ferramentas}</div>}
      <div className="mt-3">{children}</div>
    </div>
  );
}
