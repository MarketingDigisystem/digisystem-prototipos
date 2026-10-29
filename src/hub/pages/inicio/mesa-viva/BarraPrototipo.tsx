/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * "Opções do protótipo": ferramentas de AVALIAÇÃO, fora da mesa (não fazem
 * parte da tela final). Fica num canto, fechada, no mesmo visual cinza/mono do
 * painel de demonstração, para não parecer produto: papel (R-PED-11), tema,
 * rever a entrada da frase do dia, restaurar a mesa padrão.
 * Revisado em 2026-10-27 (noite): sai o seletor das subtarefas; ficou só o
 * Acordeão (decisão 2).
 */
import { useEffect, useRef, useState } from "react";
import { hrefDe } from "../../../router";
import type { Papel } from "../../../store/tipos";
import type { PrefsPrototipo } from "./layout";

const btn = "rounded-sm border border-zinc-600 px-2 py-1 font-mono text-[11px] text-zinc-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300";
const btnAtivo = "border-zinc-200 bg-zinc-200 text-zinc-900 hover:bg-zinc-300";

function Opcoes<T extends string>({ rotulo, valor, onChange, opcoes }: { rotulo: string; valor: T; onChange: (v: T) => void; opcoes: { id: T; label: string }[] }) {
  return (
    <div role="group" aria-label={rotulo} className="flex flex-col gap-1">
      <span className="text-zinc-400">{rotulo}</span>
      <div className="flex flex-wrap gap-1">
        {opcoes.map((o) => (
          <button key={o.id} type="button" aria-pressed={o.id === valor} onClick={() => onChange(o.id)} className={`${btn} ${o.id === valor ? btnAtivo : ""}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BarraPrototipo({
  papel,
  onPapel,
  prefs,
  onPrefs,
  onRestaurar,
  onReverEntrada,
}: {
  papel: Papel;
  onPapel: (p: Papel) => void;
  prefs: PrefsPrototipo;
  onPrefs: (p: PrefsPrototipo) => void;
  onRestaurar: () => void;
  onReverEntrada: () => void;
}) {
  const [aberta, setAberta] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const refBotao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberta) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setAberta(false);
      refBotao.current?.focus();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [aberta]);

  return (
    <aside aria-label="Opções do protótipo" className="fixed bottom-24 left-2 z-[70] flex flex-col items-start gap-2 sm:bottom-5 sm:left-3">
      {aberta && (
        <div
          id="mmv-opcoes-prototipo"
          className="flex max-h-[calc(100vh-10rem)] w-[min(19rem,calc(100vw-1rem))] flex-col gap-3 overflow-y-auto rounded-sm border border-zinc-600 bg-zinc-900 p-3 font-mono text-[11px] text-zinc-200 shadow-lg"
        >
          <p className="text-zinc-400">Só para avaliar o protótipo. Não faz parte da tela.</p>
          <Opcoes<Papel>
            rotulo="Ver como"
            valor={papel}
            onChange={onPapel}
            opcoes={[
              { id: "marketing", label: "Marketing" },
              { id: "aprovador", label: "Aprovador" },
              { id: "admin", label: "Admin" },
            ]}
          />
          <Opcoes<PrefsPrototipo["tema"]>
            rotulo="Tema"
            valor={prefs.tema}
            onChange={(tema) => onPrefs({ ...prefs, tema })}
            opcoes={[
              { id: "claro", label: "Claro" },
              { id: "escuro", label: "Escuro" },
            ]}
          />
          <div className="flex flex-wrap gap-1">
            <button type="button" onClick={onReverEntrada} className={btn}>
              Rever entrada da frase
            </button>
            {confirmar ? (
              <span role="group" aria-label="Confirmar restauração" className="flex items-center gap-1">
                Restaurar?
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    setConfirmar(false);
                    onRestaurar();
                  }}
                  className={btn}
                >
                  sim
                </button>
                <button type="button" onClick={() => setConfirmar(false)} className={btn}>
                  não
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmar(true)} className={btn}>
                Restaurar mesa padrão
              </button>
            )}
          </div>
          <a href={hrefDe("inicio")} className="text-zinc-400 underline hover:text-zinc-100">
            Ver a mesa atual
          </a>
        </div>
      )}
      <button
        ref={refBotao}
        type="button"
        aria-expanded={aberta}
        aria-controls="mmv-opcoes-prototipo"
        onClick={() => setAberta((v) => !v)}
        className="rounded-sm border border-zinc-600 bg-zinc-900/90 px-2 py-1 font-mono text-[11px] text-zinc-200 shadow hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
      >
        {aberta ? "fechar opções" : "opções do protótipo"}
      </button>
    </aside>
  );
}
