/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/planejamento/EditarTarefaDialog.tsx (modo "Nova tarefa") @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * "+ Nova tarefa" do Quadro. Mesmos rótulos e botão laranja do dialog real,
 * com as etiquetas no lugar do antigo campo de coluna (proposta 4.2 item 7):
 * toda tarefa nova nasce em A fazer (4.1). Subtarefas e post entram depois,
 * pelo detalhe do card.
 */
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useHub } from "../store/HubStore";

export const rotulo = "font-display text-xs font-bold uppercase tracking-wider text-muted-foreground";
export const campo =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground/70 focus:border-sky focus:ring-2 focus:ring-sky/30";

export function NovaTarefaDialog({ onFechar, onCriado }: { onFechar: () => void; onCriado: (id: string) => void }) {
  const { dados, usuario, sel, acoes } = useHub();
  const idTitulo = useId();
  const refTitulo = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [inicio, setInicio] = useState("");
  const [prazo, setPrazo] = useState("");
  const [responsavelId, setResponsavelId] = useState(usuario.id);
  const [erro, setErro] = useState("");

  useEffect(() => {
    refTitulo.current?.focus();
    const onTecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onTecla);
    return () => window.removeEventListener("keydown", onTecla);
  }, [onFechar]);

  const alternar = (id: string) =>
    setEtiquetas((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErro("Dê um título à tarefa.");
      refTitulo.current?.focus();
      return;
    }
    if (inicio && prazo && prazo < inicio) {
      setErro("A data de entrega vem antes da data de início.");
      return;
    }
    const id = acoes.criarCard({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      etiquetas,
      responsavelId: responsavelId || undefined,
      inicio: inicio || undefined,
      prazo: prazo || undefined,
      origem: "manual",
    });
    acoes.avisar("Tarefa criada em A fazer.");
    onCriado(id);
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label="Fechar" onClick={onFechar} className="absolute inset-0 bg-primary/25 backdrop-blur-[2px]" />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        onSubmit={salvar}
        className="animate-rise relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-6 shadow-float sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={idTitulo} className="font-display text-xl font-bold text-primary">
              Nova tarefa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Ela entra em A fazer. Subtarefas e post você adiciona depois, no card.</p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className={rotulo}>Título</span>
            <input
              ref={refTitulo}
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                setErro("");
              }}
              placeholder="Ex: Roteiro do Reels"
              className={campo}
            />
          </label>

          <label className="block">
            <span className={rotulo}>Descrição</span>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes e objetivo"
              rows={3}
              className={cn(campo, "resize-none")}
            />
          </label>

          <fieldset>
            <legend className={rotulo}>Etiquetas</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {sel.etiquetasAtivas().map((et) => {
                const ativa = etiquetas.includes(et.id);
                return (
                  <button
                    key={et.id}
                    type="button"
                    aria-pressed={ativa}
                    onClick={() => alternar(et.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-semibold transition-all duration-300",
                      ativa ? "bg-navy-soft text-primary ring-1 ring-primary/30" : "bg-muted text-muted-foreground hover:text-primary",
                    )}
                  >
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: et.cor }} />
                    {et.nome}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className={rotulo}>Data de início</span>
              <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className={campo} />
            </label>
            <label className="block">
              <span className={rotulo}>Data de entrega</span>
              <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className={campo} />
            </label>
            <label className="block">
              <span className={rotulo}>Responsável</span>
              <select value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} className={campo}>
                <option value="">Sem responsável</option>
                {dados.usuarios
                  .filter((u) => u.ativo)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {erro && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {erro}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full px-4 py-2.5 font-display text-xs font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
          >
            Salvar tarefa
          </button>
        </div>
      </form>
    </div>
  );
}
