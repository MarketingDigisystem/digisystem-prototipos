// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: o formulário de sugestão desta pasta, escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Sugestão de brinde completa", Req. 16.6).
//
// Chips de escolha: botões com aria-pressed e alvo de 44 px. Os chips só trocam de cor ao marcar; a posição e o tamanho não mudam.

const CHIP =
  "le-btn inline-flex min-h-11 items-center rounded-full border px-4 font-display text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";
const CHIP_ON = "border-navy bg-navy text-navy-foreground";
const CHIP_OFF = "bg-card text-navy hover:bg-navy-soft";

interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
}

/** Escolha múltipla: cada clique liga ou desliga uma opção. */
export function ChipsMultiplos({
  idRotulo,
  opcoes,
  marcados,
  onAlternar,
}: {
  idRotulo: string;
  opcoes: readonly Opcao<string>[];
  marcados: readonly string[];
  onAlternar: (valor: string) => void;
}) {
  return (
    <div role="group" aria-labelledby={idRotulo} className="flex flex-wrap gap-2">
      {opcoes.map((o) => {
        const on = marcados.includes(o.valor);
        return (
          <button key={o.valor} type="button" aria-pressed={on} onClick={() => onAlternar(o.valor)} className={`${CHIP} ${on ? CHIP_ON : CHIP_OFF}`}>
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}

/** Escolha única: clicar na opção marcada desmarca (vazio). */
export function ChipsUnica<T extends string>({
  idRotulo,
  opcoes,
  valor,
  onEscolher,
}: {
  idRotulo: string;
  opcoes: readonly Opcao<T>[];
  valor: T | "";
  onEscolher: (valor: T | "") => void;
}) {
  return (
    <div role="group" aria-labelledby={idRotulo} className="flex flex-wrap gap-2">
      {opcoes.map((o) => {
        const on = valor === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={on}
            onClick={() => onEscolher(on ? "" : o.valor)}
            className={`${CHIP} ${on ? CHIP_ON : CHIP_OFF}`}
          >
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}
