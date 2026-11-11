/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (FormSugestao, ListaSugestoes) + requirements.md Req. 12.1 a 12.5 e 12.9.
 * Formulário: nome e "para que serve" obrigatórios; referência e quantidade estimada opcionais.
 * O autor acompanha o estado (Sugerida, Em análise, Aprovada, Recusada) e vê o motivo da recusa.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { useState, type FormEvent } from "react";
import { PESSOA_DIRETOR } from "../mock";
import { useRota } from "../rota";
import { useLoja } from "../store";
import type { EstadoSugestao } from "../tipos";
import { Aviso, EstadoErro, EstadoVazio, Esqueleto } from "./Estados";
import { AREA, BOTAO_PRIMARIO, CAMPO } from "./util";

const ROTULO: Record<EstadoSugestao, string> = { sugerida: "Sugerida", em_analise: "Em análise", aprovada: "Aprovada", recusada: "Recusada" };
const CLASSE: Record<EstadoSugestao, string> = {
  sugerida: "bg-navy-soft text-navy",
  em_analise: "bg-sky-soft text-navy",
  aprovada: "bg-success-soft text-[var(--success-strong)]",
  recusada: "bg-destructive/10 text-destructive",
};

export function Sugestoes() {
  const loja = useLoja();
  const { estado } = useRota();
  const [nome, setNome] = useState("");
  const [paraQue, setParaQue] = useState("");
  const [ref, setRef] = useState("");
  const [qtd, setQtd] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);

  const minhas = estado === "vazio" ? [] : loja.sugestoes.filter((s) => s.solicitante === PESSOA_DIRETOR);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setOk(false);
    if (!nome.trim()) return setErro("Informe o nome do brinde.");
    if (!paraQue.trim()) return setErro("Conte para que o brinde serve.");
    const n = qtd.trim() ? Number(qtd) : undefined;
    if (n !== undefined && (!Number.isInteger(n) || n < 1)) return setErro("A quantidade estimada precisa ser um número inteiro maior que zero.");
    if (estado === "erro") return setErro("Não foi possível enviar a sugestão. Seus dados continuam no formulário. Tente de novo.");
    loja.criarSugestao(nome.trim(), paraQue.trim(), n, ref);
    setNome(""); setParaQue(""); setRef(""); setQtd(""); setErro(""); setOk(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-3xl font-bold text-navy sm:text-4xl">Sugira um brinde</h1>
      <p className="mt-1 text-muted-foreground">Não achou o que precisa? Conte para o Marketing avaliar.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={enviar} noValidate aria-label="Nova sugestão" className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="s-nome" className="mb-1.5 block text-sm font-semibold text-navy">Nome do brinde <span className="text-destructive">*</span></label>
              <input id="s-nome" value={nome} onChange={(e) => { setNome(e.target.value); setErro(""); }} placeholder="Ex.: Ventilador de mesa USB" className={CAMPO} />
            </div>
            <div>
              <label htmlFor="s-para" className="mb-1.5 block text-sm font-semibold text-navy">Para que serve <span className="text-destructive">*</span></label>
              <textarea id="s-para" rows={3} value={paraQue} onChange={(e) => { setParaQue(e.target.value); setErro(""); }} placeholder="Ex.: Dias quentes nos eventos externos" className={AREA} />
            </div>
            <div>
              <label htmlFor="s-ref" className="mb-1.5 block text-sm font-semibold text-navy">Referência <span className="font-normal text-muted-foreground">(link, opcional)</span></label>
              <input id="s-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="https://" className={CAMPO} />
            </div>
            <div>
              <label htmlFor="s-qtd" className="mb-1.5 block text-sm font-semibold text-navy">Quantidade estimada <span className="font-normal text-muted-foreground">(opcional)</span></label>
              <input id="s-qtd" type="number" inputMode="numeric" min={1} value={qtd} onChange={(e) => { setQtd(e.target.value); setErro(""); }} className={`${CAMPO} sm:w-40`} />
            </div>
            <div className="min-h-[3rem]" aria-live="polite">
              {erro ? <Aviso tom="erro">{erro}</Aviso> : (ok || estado === "sucesso") ? <Aviso tom="sucesso">Sugestão enviada. O Marketing vai avaliar e você acompanha por aqui.</Aviso> : null}
            </div>
            <button type="submit" className={`${BOTAO_PRIMARIO} w-full sm:w-auto`}>Enviar sugestão</button>
          </div>
        </form>

        <section aria-label="Minhas sugestões">
          <h2 className="mb-3 text-lg font-bold text-navy">Minhas sugestões</h2>
          {estado === "carregando" ? (
            <div className="space-y-2" aria-busy="true"><Esqueleto className="h-20 w-full" /><Esqueleto className="h-20 w-full" /></div>
          ) : estado === "erro" ? (
            <EstadoErro titulo="Não foi possível carregar suas sugestões" texto="Confira a conexão e tente de novo." />
          ) : minhas.length === 0 ? (
            <EstadoVazio titulo="Você ainda não sugeriu nada" texto="Quando enviar uma sugestão, o estado dela aparece aqui." />
          ) : (
            <ul className="space-y-2">
              {minhas.map((s) => (
                <li key={s.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-display text-base font-bold text-navy">{s.nome}</p>
                    <span className={`inline-flex h-7 shrink-0 items-center rounded-full px-3 text-xs font-bold ${CLASSE[s.estado]}`}>{ROTULO[s.estado]}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.paraQueServe}</p>
                  {s.qtdEstimada && <p className="mt-0.5 text-xs text-muted-foreground">Quantidade estimada: {s.qtdEstimada}</p>}
                  {s.estado === "recusada" && s.motivo && <p className="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">Motivo: {s.motivo}</p>}
                  {s.estado === "aprovada" && <p className="mt-2 rounded-xl bg-success-soft px-3 py-2 text-xs text-[var(--success-strong)]">O Marketing aprovou. Você recebe um aviso quando o brinde entrar no catálogo.</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
