/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: requirements.md Requisito 12 (Sugerida, Em análise, Aprovada, Recusada; toda a Equipe_da_Loja decide).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { useState } from "react";
import type { EstadoTela } from "../../rota";
import { useLoja } from "../../store";
import type { Sugestao } from "../../tipos";
import { BotaoAcao, CAMPO, Campo, Erro, EstadosDaTela, Modal, ROTULO_SUGESTAO } from "./ui";

const COR: Record<Sugestao["estado"], string> = {
  sugerida: "bg-[var(--warning-soft,oklch(0.95_0.05_85))] text-[var(--warning-strong)]",
  em_analise: "bg-navy-soft text-navy",
  aprovada: "bg-[oklch(0.95_0.05_155)] text-[var(--success-strong)]",
  recusada: "bg-[oklch(0.95_0.04_25)] text-[oklch(0.5_0.18_25)]",
};
const ORDEM = { sugerida: 0, em_analise: 1, aprovada: 2, recusada: 3 } as const;

export function SugestoesGestao({ estadoTela }: { estadoTela: EstadoTela }) {
  const loja = useLoja();
  const [alvo, setAlvo] = useState<{ s: Sugestao; modo: "aprovar" | "recusar" } | null>(null);
  const lista = [...loja.sugestoes].sort((a, b) => ORDEM[a.estado] - ORDEM[b.estado]);

  return (
    <section aria-label="Sugestões" className="mt-6">
      <p className="text-sm text-muted-foreground">Qualquer pessoa da Equipe decide. Aprovar cria o brinde em rascunho, fora do catálogo até a primeira entrada de estoque.</p>
      <EstadosDaTela estado={estadoTela} vazio="Ninguém sugeriu um brinde ainda." />
      {!estadoTela && (lista.length === 0 ? (
        <div className="mt-4 rounded-3xl bg-card p-10 text-center text-muted-foreground shadow-[var(--shadow-card)]">Ninguém sugeriu um brinde ainda.</div>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {lista.map((s) => (
            <li key={s.id} className="flex flex-col rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold leading-tight text-navy">{s.nome}</h2>
                <span className={`inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-xs font-bold ${COR[s.estado]}`}>{ROTULO_SUGESTAO[s.estado]}</span>
              </div>
              <p className="mt-1 text-sm">{s.paraQueServe}</p>
              <p className="mt-2 text-xs text-muted-foreground">Sugerido por {s.solicitante}{s.qtdEstimada ? ` · cerca de ${s.qtdEstimada} unidades` : ""}</p>
              {s.motivo && <p className="mt-2 rounded-2xl bg-secondary px-3 py-2 text-sm">{s.estado === "recusada" ? "Motivo: " : "Nota: "}{s.motivo}</p>}
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                {s.estado === "sugerida" && <BotaoAcao rotulo="Colocar em análise" onClick={() => loja.decidirSugestao(s.id, "em_analise")} />}
                {(s.estado === "sugerida" || s.estado === "em_analise") && (
                  <>
                    {s.estado === "em_analise" && <BotaoAcao rotulo="Aprovar" onClick={() => setAlvo({ s, modo: "aprovar" })} />}
                    <BotaoAcao rotulo="Recusar" variante="perigo" onClick={() => setAlvo({ s, modo: "recusar" })} />
                  </>
                )}
                {s.estado === "aprovada" && <p className="text-xs text-muted-foreground">Falta registrar a primeira entrada de estoque para publicar no catálogo.</p>}
              </div>
            </li>
          ))}
        </ul>
      ))}
      {alvo && <ModalDecisao s={alvo.s} modo={alvo.modo} onFechar={() => setAlvo(null)} />}
    </section>
  );
}

function ModalDecisao({ s, modo, onFechar }: { s: Sugestao; modo: "aprovar" | "recusar"; onFechar: () => void }) {
  const loja = useLoja();
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<"propriedade" | "personalizavel">("propriedade");
  const [erro, setErro] = useState<string | null>(null);
  return (
    <Modal titulo={modo === "aprovar" ? `Aprovar: ${s.nome}` : `Recusar: ${s.nome}`} onFechar={onFechar}>
      {modo === "aprovar" ? (
        <>
          <p className="mb-3 text-sm text-muted-foreground">Defina o tipo do brinde. O rascunho não aparece na vitrine até a publicação.</p>
          <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1" role="group" aria-label="Tipo do brinde">
            {([["propriedade", "Em estoque"], ["personalizavel", "Personalizável"]] as const).map(([v, r]) => (
              <button key={v} type="button" aria-pressed={tipo === v} onClick={() => setTipo(v)} className={`h-9 rounded-full font-display text-sm font-bold transition-colors ${tipo === v ? "bg-navy text-white" : "text-navy hover:bg-card"}`}>{r}</button>
            ))}
          </div>
        </>
      ) : (
        <Campo rotulo="Motivo da recusa (quem sugeriu vai ler)">
          <textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} className={CAMPO} autoFocus />
        </Campo>
      )}
      <Erro texto={erro} />
      <div className="mt-4 flex justify-end gap-2">
        <BotaoAcao rotulo="Voltar" variante="secundario" onClick={onFechar} />
        <BotaoAcao
          rotulo={modo === "aprovar" ? "Aprovar sugestão" : "Recusar sugestão"}
          variante={modo === "aprovar" ? "primario" : "perigo"}
          onClick={() => {
            const r = modo === "aprovar"
              ? loja.decidirSugestao(s.id, "aprovada", `Rascunho criado como brinde ${tipo === "propriedade" ? "em estoque" : "personalizável"}.`)
              : loja.decidirSugestao(s.id, "recusada", texto);
            if (!r.ok) setErro(r.motivo); else onFechar();
          }}
        />
      </div>
    </Modal>
  );
}
