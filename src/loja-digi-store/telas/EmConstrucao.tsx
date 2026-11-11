/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Marcador de rota das telas que entram nas tarefas 1.3 (Diretor) e 1.4 (Equipe_da_Loja).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { href } from "../rota";

export function EmConstrucao({ titulo, tarefa }: { titulo: string; tarefa: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-3xl font-bold text-navy">{titulo}</h1>
      <p className="mt-2 text-muted-foreground">Rota criada. A tela completa entra na tarefa {tarefa} do protótipo.</p>
      <a href={href("")} className="mt-6 inline-flex h-10 items-center rounded-full bg-navy px-5 font-display text-sm font-bold text-white">
        Voltar à vitrine
      </a>
    </div>
  );
}
