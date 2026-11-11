/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: requirements.md 18.7 (estados vazio, erro, carregando e sucesso) + design.md (seletor ?estado=).
 * Primitivas de estado das telas. O seletor lê `?estado=` de rota.ts; a tarefa 1.5 só confere a cobertura.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { BOTAO_SECUNDARIO } from "./util";

export function Esqueleto({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-secondary motion-reduce:animate-none ${className}`} />;
}

export function EstadoVazio({ titulo, texto, acao }: { titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl bg-card px-6 py-12 text-center shadow-[var(--shadow-card)]">
      <span className="grid size-12 place-items-center rounded-full bg-navy-soft text-navy">
        <Inbox className="size-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-bold text-navy">{titulo}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

/** Tira `estado` da URL e deixa a tela refazer a leitura. */
export function limparEstado() {
  const h = window.location.hash.replace(/([?&])estado=[^&]*&?/, "$1").replace(/[?&]$/, "");
  window.location.hash = h;
}

export function EstadoErro({ titulo = "Não foi possível carregar", texto = "Tente de novo em instantes." }: { titulo?: string; texto?: string }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center rounded-3xl bg-card px-6 py-12 text-center shadow-[var(--shadow-card)]">
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-bold text-navy">{titulo}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
      <button type="button" onClick={limparEstado} className={`${BOTAO_SECUNDARIO} mt-5`}>
        Tentar de novo
      </button>
    </div>
  );
}

export function Aviso({ tom, children }: { tom: "erro" | "sucesso" | "atencao"; children: ReactNode }) {
  const cls =
    tom === "erro"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : tom === "sucesso"
        ? "border-[var(--success-strong)]/30 bg-success-soft text-[var(--success-strong)]"
        : "border-[var(--warning-strong)]/30 bg-warning-soft text-foreground";
  return (
    <p role={tom === "erro" ? "alert" : "status"} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${cls}`}>
      {children}
    </p>
  );
}
