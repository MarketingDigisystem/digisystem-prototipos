// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: sugestaoOpcoes.ts desta pasta, escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (seção "Sugestão de brinde completa", Req. 16.17 e 16.18).
//
// Resumo ao vivo, como a gestão verá. Fica na coluna própria (ou abaixo do formulário no mobile), então nunca desloca o botão Enviar.

import { TEXTO_FALTOU_ALGO, type LinhaResumo } from "../../../sugestaoOpcoes";

export function ResumoSugestao({ nome, linhas, detalhes }: { nome: string; linhas: LinhaResumo[]; detalhes: number }) {
  const titulo = nome.trim();
  return (
    <section aria-labelledby="resumo-titulo" className="rounded-3xl border bg-card p-5 shadow-card">
      <h2 id="resumo-titulo" className="font-display text-lg font-bold text-navy">
        Resumo da sugestão
      </h2>
      <p className={`mt-2 break-words font-display text-base font-bold ${titulo ? "text-navy" : "text-muted-foreground"}`}>
        {titulo || "Nome do brinde ainda não informado"}
      </p>
      {linhas.length > 0 && (
        <dl className="mt-2 space-y-2 text-sm">
          {linhas.map((l) => (
            <div key={l.rotulo}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l.rotulo}</dt>
              <dd className="break-words text-foreground/90">{l.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {detalhes < 3 && <p className="mt-3 rounded-2xl bg-secondary p-3 text-sm text-foreground/85">{TEXTO_FALTOU_ALGO}</p>}
    </section>
  );
}
