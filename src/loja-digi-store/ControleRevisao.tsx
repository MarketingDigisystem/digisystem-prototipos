/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Controle de revisão SÓ do protótipo: troca ?estado= sem editar a URL. Fica fixo no canto inferior esquerdo,
 * nunca sobre o cabeçalho. Oculto por padrão; liga com ?revisao=1 ou com Alt+Shift+R (lembrado na aba).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { definirEstado, type EstadoTela, type RotaAtual } from "./rota";

const CHAVE = "digi-store:revisao";
const OPCOES: { id: EstadoTela; rotulo: string }[] = [
  { id: null, rotulo: "Normal" },
  { id: "carregando", rotulo: "Carregando" },
  { id: "vazio", rotulo: "Vazio" },
  { id: "erro", rotulo: "Erro" },
  { id: "sucesso", rotulo: "Sucesso" },
];

export function ControleRevisao({ rota }: { rota: RotaAtual }) {
  const [ligado, setLigado] = useState(() => window.sessionStorage.getItem(CHAVE) === "1");
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (rota.revisao) {
      window.sessionStorage.setItem(CHAVE, "1");
      setLigado(true);
    }
  }, [rota.revisao]);

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (!(e.altKey && e.shiftKey && e.code === "KeyR")) return;
      setLigado((v) => {
        window.sessionStorage.setItem(CHAVE, v ? "0" : "1");
        return !v;
      });
    };
    document.addEventListener("keydown", f);
    return () => document.removeEventListener("keydown", f);
  }, []);

  if (!ligado) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[60] font-sans" data-revisao>
      {aberto ? (
        <div role="group" aria-label="Estado da tela (só do protótipo)" className="w-52 rounded-2xl border bg-card p-3 shadow-[var(--shadow-float)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Estado da tela (revisão)</p>
            <button type="button" onClick={() => setAberto(false)} aria-label="Fechar controle de revisão" className="grid size-7 place-items-center rounded-full text-navy hover:bg-navy-soft">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {OPCOES.map((o) => (
              <button
                key={o.rotulo}
                type="button"
                aria-pressed={rota.estado === o.id}
                onClick={() => definirEstado(o.id)}
                className={`h-8 rounded-full border border-transparent font-display text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky ${rota.estado === o.id ? "bg-navy-soft text-navy shadow-[0_0_0_2px_var(--sky)]" : "text-foreground/80 hover:bg-navy-soft hover:text-navy"}`}
              >
                {o.rotulo}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Alt+Shift+R esconde este controle.</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir controle de revisão"
          className="grid size-9 place-items-center rounded-full border bg-card text-navy opacity-70 shadow-[var(--shadow-card)] transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
