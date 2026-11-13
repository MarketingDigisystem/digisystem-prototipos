// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/ (sugestão de brinde), lido em 2026-11-11; reescrito aqui, sem importar dele.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Formulário curto (nome, descrição) e lista das sugestões da pessoa. A faixa de mensagem tem altura reservada.

import { useState } from "react";
import { ROTULO_SUGESTAO, dataCurta } from "../../formato";
import { estiloEntrada } from "../../movimento";
import { useLoja } from "../../store";
import { Msg } from "../../ui";

const CAMPO =
  "w-full rounded-2xl border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";

export function Sugerir() {
  const loja = useLoja();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  const minhas = loja.dados.sugestoes.filter((s) => s.autorId === loja.pessoa.id).slice().reverse();

  const enviar = () => {
    const r = loja.criarSugestao(nome, descricao);
    if (!r.ok) {
      setMsg({ ok: false, texto: r.motivo });
      return;
    }
    setNome("");
    setDescricao("");
    setMsg({ ok: true, texto: "Sugestão enviada. O Marketing vai analisar e você acompanha o estado aqui." });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy">Sugira um brinde</h1>
      <p className="mt-1 text-sm text-muted-foreground">Conte qual brinde faria sentido para a marca. O Marketing avalia cada ideia.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <form
          className="min-w-0 space-y-4 rounded-3xl border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
          noValidate
        >
          <label className="block text-sm">
            <span className="mb-1 block font-display font-bold text-navy">Nome do brinde *</span>
            <input
              className={`${CAMPO} h-11`}
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setMsg(null);
              }}
              placeholder="Ex.: Mouse pad ergonômico"
              aria-required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-display font-bold text-navy">Descrição</span>
            <textarea
              className={`${CAMPO} h-28 resize-none py-3`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Para quem seria, quando usar, onde já viu (opcional)"
            />
          </label>
          <div>
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-navy px-6 font-display text-sm font-bold text-navy-foreground le-btn hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
            >
              Enviar sugestão
            </button>
            <p
              role={msg ? (msg.ok ? "status" : "alert") : undefined}
              className={`mt-2 min-h-10 text-sm font-semibold ${msg?.ok ? "text-[color:var(--success-strong)]" : "text-[color:var(--destructive-strong)]"}`}
            >
              <Msg texto={msg?.texto} />
            </p>
          </div>
        </form>

        <div className="min-w-0">
          <h2 className="mb-3 font-display text-lg font-bold text-navy">Suas sugestões</h2>
          {minhas.length === 0 ? (
            <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">Você ainda não sugeriu nenhum brinde.</p>
          ) : (
            <ul className="space-y-2">
              {minhas.map((s, i) => (
                <li key={s.id} style={estiloEntrada(i)} className="le-entra rounded-2xl border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 font-display text-base font-bold text-navy">{s.nome}</p>
                    <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-navy-soft px-2.5 font-display text-xs font-bold text-[color:var(--le-ativo)]">
                      {ROTULO_SUGESTAO[s.estado]}
                    </span>
                  </div>
                  {s.descricao && <p className="mt-1 text-sm text-foreground/85">{s.descricao}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">Enviada em {dataCurta(s.em)}</p>
                  {s.estado === "recusada" && s.motivo && <p className="mt-1 text-xs font-semibold text-foreground/80">Motivo: {s.motivo}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
