// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ (cadastro de brinde do DigiPlace) e regras.ts desta pasta (salvarBrinde, alternarAtivo), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md, matriz: cadastro volta do DigiPlace) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Cadastro de brindes (mock): lista com ativar/desativar e formulário em diálogo fixo para criar ou editar.
// Saldo e reserva nunca são editados aqui: entram pelo Estoque (entrada/ajuste), para a conta continuar fechando.

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useLoja } from "../../store";
import type { Brinde, TipoBrinde, Variacao } from "../../tipos";
import { SAIDA_DIALOGO_MS, estiloEntrada } from "../../movimento";
import { FotoBrinde, Msg, useSaidaAnimada } from "../../ui";
import { BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO, Campo, Dialogo, ErroInline, PILL, PILL_ATIVO, PILL_INATIVO } from "./comum";

/** Fotos disponíveis em public/brindes/ (conferidas no disco em 2026-11-11). */
const FOTOS = [
  "bloco-adesivo", "caderno-caneta", "caderno", "camiseta", "caneca", "caneta", "chaveiro", "ecobag",
  "folder", "garrafa", "mochila", "moleskine", "powerbank", "squeeze",
].map((n) => `/brindes/${n}.png`);

const CATEGORIAS_SUGERIDAS = ["Escritório", "Bem-estar", "Tecnologia", "Vestuário", "Acessórios"];

function rascunhoNovo(): Brinde {
  return {
    id: "",
    slug: "",
    nome: "",
    tipo: "estoque",
    categoria: "",
    foto: FOTOS[0],
    descricao: "",
    custoUnitario: null,
    variacoes: [{ id: "", rotulo: "", saldo: 0, reserva: 0, minimo: 0 }],
    novidade: false,
    ativo: true,
  };
}

function FormularioBrinde({ inicial, onFechar: aoFechar }: { inicial: Brinde; onFechar: () => void }) {
  const loja = useLoja();
  // Fechar (Cancelar, Esc, X, fundo e salvar) passa pela saída animada: o diálogo só desmonta depois dela.
  const { saindo, fechar: onFechar } = useSaidaAnimada(aoFechar, SAIDA_DIALOGO_MS);
  const editando = inicial.id !== "";
  const [b, setB] = useState<Brinde>(() => structuredClone(inicial));
  const [custo, setCusto] = useState(inicial.custoUnitario !== null ? String(inicial.custoUnitario) : "");
  const [erro, setErro] = useState<string | null>(null);
  const personalizavel = b.tipo === "personalizavel";

  const mudarVariacao = (i: number, parte: Partial<Variacao>) =>
    setB((x) => ({ ...x, variacoes: x.variacoes.map((v, j) => (j === i ? { ...v, ...parte } : v)) }));

  const salvar = () => {
    const pronto: Brinde = personalizavel
      ? { ...b, custoUnitario: null, prazoExtraDiasUteis: b.prazoExtraDiasUteis ?? 0 }
      : { ...b, custoUnitario: custo.trim() === "" ? null : Number(custo.replace(",", ".")) };
    const r = loja.salvarBrinde(pronto);
    if (r.ok) onFechar();
    else setErro(r.motivo);
  };

  return (
    <Dialogo
      aberto
      largo
      saindo={saindo}
      titulo={editando ? `Editar ${inicial.nome}` : "Novo brinde"}
      onFechar={onFechar}
      rodape={
        <div>
          <ErroInline texto={erro} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onFechar} className={BTN_SECUNDARIO}>
              Cancelar
            </button>
            <button type="button" onClick={salvar} className={BTN_PRIMARIO}>
              {editando ? "Salvar alterações" : "Criar brinde"}
            </button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4">
        <Campo rotulo="Nome do brinde">
          <input value={b.nome} onChange={(e) => setB({ ...b, nome: e.target.value })} className={CAMPO} />
        </Campo>

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Categoria">
            <input value={b.categoria} onChange={(e) => setB({ ...b, categoria: e.target.value })} list="le-categorias" className={CAMPO} />
            <datalist id="le-categorias">
              {CATEGORIAS_SUGERIDAS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Campo>
          <div>
            <span className="mb-1 block text-xs font-semibold text-foreground/80">Tipo</span>
            <div role="group" aria-label="Tipo de brinde" className="flex gap-1">
              {(["estoque", "personalizavel"] as TipoBrinde[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={b.tipo === t}
                  disabled={editando && b.tipo !== t}
                  onClick={() =>
                    setB({
                      ...b,
                      tipo: t,
                      prazoExtraDiasUteis: t === "personalizavel" ? (b.prazoExtraDiasUteis ?? 5) : undefined,
                    })
                  }
                  className={`${PILL} disabled:opacity-40 ${b.tipo === t ? PILL_ATIVO : PILL_INATIVO}`}
                >
                  {t === "estoque" ? "Em estoque" : "Personalizável"}
                </button>
              ))}
            </div>
            {editando && <span className="mt-1 block text-xs text-muted-foreground">O tipo não muda depois de criado.</span>}
          </div>
        </div>

        <Campo rotulo="Descrição">
          <textarea
            value={b.descricao}
            onChange={(e) => setB({ ...b, descricao: e.target.value })}
            rows={2}
            className={`${CAMPO} h-auto py-2`}
          />
        </Campo>

        <fieldset>
          <legend className="mb-1 text-xs font-semibold text-foreground/80">Foto</legend>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {FOTOS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={b.foto === f}
                onClick={() => setB({ ...b, foto: f })}
                className={`relative overflow-hidden rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--le-foco)] ${b.foto === f ? "ring-2 ring-inset ring-sky" : ""}`}
              >
                <FotoBrinde src={f} alt="" compacto />
                <span className="sr-only">{`Foto ${f.replace("/brindes/", "").replace(".png", "")}`}</span>
                {b.foto === f && (
                  <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-navy text-navy-foreground" aria-hidden>
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </fieldset>

        {personalizavel ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Prazo extra (dias úteis)" dica="Soma ao prazo mínimo da data desejada.">
              <input
                type="number"
                min={0}
                value={b.prazoExtraDiasUteis ?? 0}
                onChange={(e) => setB({ ...b, prazoExtraDiasUteis: Number(e.target.value) })}
                className={CAMPO}
              />
            </Campo>
          </div>
        ) : (
          <Campo rotulo="Custo unitário (R$)">
            <input inputMode="decimal" value={custo} onChange={(e) => setCusto(e.target.value)} placeholder="0,00" className={`${CAMPO} sm:max-w-[200px]`} />
          </Campo>
        )}

        <fieldset>
          <legend className="mb-1 text-xs font-semibold text-foreground/80">Variações</legend>
          <ul className="grid gap-2">
            {b.variacoes.map((v, i) => (
              <li key={i} className="flex items-end gap-2">
                <Campo rotulo={i === 0 ? "Nome da variação" : ""}>
                  <input
                    aria-label={`Nome da variação ${i + 1}`}
                    value={v.rotulo}
                    onChange={(e) => mudarVariacao(i, { rotulo: e.target.value })}
                    placeholder="Ex.: Azul, M, Única"
                    className={CAMPO}
                  />
                </Campo>
                {!personalizavel && (
                  <div className="w-24 shrink-0">
                    <Campo rotulo={i === 0 ? "Mínimo" : ""}>
                      <input
                        aria-label={`Mínimo da variação ${i + 1}`}
                        type="number"
                        min={0}
                        value={v.minimo}
                        onChange={(e) => mudarVariacao(i, { minimo: Number(e.target.value) })}
                        className={CAMPO}
                      />
                    </Campo>
                  </div>
                )}
                {editando && v.id && !personalizavel && (
                  <p className="hidden w-20 shrink-0 pb-3 text-xs text-muted-foreground sm:block">saldo {v.saldo}</p>
                )}
                <button
                  type="button"
                  aria-label={`Remover variação ${i + 1}`}
                  disabled={b.variacoes.length === 1}
                  onClick={() => setB({ ...b, variacoes: b.variacoes.filter((_, j) => j !== i) })}
                  className="grid size-11 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:opacity-40"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setB({ ...b, variacoes: [...b.variacoes, { id: "", rotulo: "", saldo: 0, reserva: 0, minimo: 0 }] })}
            className={`${BTN_SECUNDARIO} mt-2 gap-2`}
          >
            <Plus className="size-4" aria-hidden />
            Adicionar variação
          </button>
        </fieldset>

        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input type="checkbox" checked={b.novidade} onChange={(e) => setB({ ...b, novidade: e.target.checked })} className="size-5 accent-[var(--navy)]" />
          <span className="text-sm font-semibold">Marcar como novidade na vitrine</span>
        </label>
      </div>
    </Dialogo>
  );
}

export function Cadastro() {
  const loja = useLoja();
  const { dados } = loja;
  const [formulario, setFormulario] = useState<Brinde | null>(null);
  const [erro, setErro] = useState<{ id: string; texto: string } | null>(null);

  const alternar = (id: string) => {
    const r = loja.alternarAtivo(id);
    setErro(r.ok ? null : { id, texto: r.motivo });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6" aria-labelledby="cad-titulo">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h1 id="cad-titulo" className="font-display text-xl font-bold text-navy">
          Cadastro de brindes
        </h1>
        <button type="button" onClick={() => setFormulario(rascunhoNovo())} className={`${BTN_PRIMARIO} gap-2`}>
          <Plus className="size-4" aria-hidden />
          Novo brinde
        </button>
      </div>
      <p className="mb-3 mt-1 text-xs text-muted-foreground">
        {dados.brindes.length} brindes, {dados.brindes.filter((b) => b.ativo).length} ativos. Desativar tira da vitrine; pedidos em andamento seguem normalmente.
      </p>

      <ul className="grid gap-2">
        {dados.brindes.map((b, i) => (
          <li key={b.id} style={estiloEntrada(i)} className="le-entra flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3 shadow-card">
            <div className={`size-16 shrink-0 overflow-hidden rounded-xl border ${b.ativo ? "" : "opacity-50"}`}>
              <FotoBrinde src={b.foto} alt={b.nome} compacto />
            </div>
            <div className="min-w-0 flex-1 basis-48">
              <p className="font-display text-base font-bold text-navy">{b.nome}</p>
              <p className="text-xs text-muted-foreground">
                {b.categoria} · {b.tipo === "estoque" ? "Em estoque" : "Personalizável"} · {b.variacoes.length}{" "}
                {b.variacoes.length === 1 ? "variação" : "variações"}
                {b.novidade ? " · Novidade" : ""}
              </p>
              {erro?.id === b.id && (
                <p role="alert" className="text-xs font-semibold text-[color:var(--destructive-strong)]">
                  <Msg texto={erro.texto} />
                </p>
              )}
            </div>
            <span
              className={`inline-flex h-6 w-16 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${b.ativo ? "bg-success-soft text-foreground ring-1 ring-success" : "bg-secondary text-muted-foreground"}`}
            >
              {b.ativo ? "Ativo" : "Inativo"}
            </span>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => setFormulario(b)} className={BTN_SECUNDARIO}>
                Editar
              </button>
              <button type="button" onClick={() => alternar(b.id)} className={`${BTN_SECUNDARIO} w-28`}>
                {b.ativo ? "Desativar" : "Ativar"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {formulario && <FormularioBrinde key={formulario.id || "novo"} inicial={formulario} onFechar={() => setFormulario(null)} />}
    </section>
  );
}
