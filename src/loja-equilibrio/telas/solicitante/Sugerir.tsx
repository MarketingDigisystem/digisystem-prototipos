// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/ (sugestão de brinde), lido em 2026-11-11; reescrito aqui em 2026-11-12, sem importar dele.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 16).
//
// Formulário de sugestão em três grupos (só o nome é obrigatório), com Parecidos no catálogo, Resumo ao vivo e a lista das sugestões da pessoa.
// Âncora fixa: o botão Enviar e a faixa de mensagem ficam no fim do formulário, e Parecidos e Resumo vivem na outra coluna
// (abaixo do formulário no mobile), então aparecer ou sumir qualquer um deles não desloca nenhum controle do formulário.

import { useMemo, useRef, useState } from "react";
import { ROTULO_SUGESTAO, dataCurta } from "../../formato";
import { estiloEntrada } from "../../movimento";
import { LIMITE_POR_QUE_COMBINA, brindesParecidos, detalhesPreenchidos, hojeDe, validarSugestao } from "../../regras";
import {
  CATEGORIA_OUTRA, FORM_VAZIO, OCASIOES, PUBLICOS, ROTULO_COM_LOGO, ROTULO_FAIXA_CUSTO, ROTULO_FREQUENCIA, TEXTO_FOTO_PROTOTIPO,
  alternar, chipsDaSugestao, linhasDoResumo, montarDados, textoIndicador, type FormSugestao,
} from "../../sugestaoOpcoes";
import { useLoja } from "../../store";
import { Msg } from "../../ui";
import { ChipsMultiplos, ChipsUnica } from "./sugestao/ChipsEscolha";
import { Parecidos } from "./sugestao/Parecidos";
import { ResumoSugestao } from "./sugestao/ResumoSugestao";

const CAMPO =
  "w-full rounded-2xl border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]";
const ROTULO = "mb-1 block font-display font-bold text-navy";
const OPCIONAL = <span className="font-sans text-xs font-normal text-muted-foreground"> (opcional)</span>;
const LEGENDA = "mb-3 font-display text-lg font-bold text-navy";
const BOTAO_SECUNDARIO =
  "le-btn inline-flex h-11 items-center justify-center rounded-full border bg-card px-5 font-display text-sm font-bold text-navy hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] disabled:cursor-not-allowed disabled:opacity-50";

const OPCOES_OCASIAO = OCASIOES.map((o) => ({ valor: o as string, rotulo: o }));
const OPCOES_PUBLICO = PUBLICOS.map((o) => ({ valor: o as string, rotulo: o }));
const OPCOES_FREQUENCIA = (Object.keys(ROTULO_FREQUENCIA) as (keyof typeof ROTULO_FREQUENCIA)[]).map((k) => ({ valor: k, rotulo: ROTULO_FREQUENCIA[k] }));
const OPCOES_FAIXA = (Object.keys(ROTULO_FAIXA_CUSTO) as (keyof typeof ROTULO_FAIXA_CUSTO)[]).map((k) => ({ valor: k, rotulo: ROTULO_FAIXA_CUSTO[k] }));
const OPCOES_LOGO = (Object.keys(ROTULO_COM_LOGO) as (keyof typeof ROTULO_COM_LOGO)[]).map((k) => ({ valor: k, rotulo: ROTULO_COM_LOGO[k] }));

export function Sugerir() {
  const loja = useLoja();
  const [form, setForm] = useState<FormSugestao>(FORM_VAZIO);
  const [tentou, setTentou] = useState(false);
  const [erroLoja, setErroLoja] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [chaveFoto, setChaveFoto] = useState(0);
  const botaoLimpar = useRef<HTMLButtonElement>(null);

  const hoje = hojeDe(loja.dados);
  const minhas = loja.dados.sugestoes.filter((s) => s.autorId === loja.pessoa.id).slice().reverse();
  const categorias = useMemo(() => [...new Set(loja.dados.brindes.filter((b) => b.ativo).map((b) => b.categoria))], [loja.dados.brindes]);

  const dados = useMemo(() => montarDados(form), [form]);
  const detalhes = detalhesPreenchidos(dados);
  const linhas = useMemo(() => linhasDoResumo(dados), [dados]);
  const parecidos = useMemo(
    () => brindesParecidos(loja.dados.brindes, form.nome, form.categoria && form.categoria !== CATEGORIA_OUTRA ? form.categoria : undefined),
    [loja.dados.brindes, form.nome, form.categoria],
  );
  const erros = tentou ? validarSugestao(dados, hoje).erros : {};
  const primeiroErro = Object.values(erros)[0] ?? erroLoja;
  const mensagem = confirmando ? null : (primeiroErro ?? (sucesso ? "Sugestão enviada. O Marketing vai analisar e você acompanha o estado aqui." : null));
  const sujo = JSON.stringify(form) !== JSON.stringify(FORM_VAZIO);
  const excedeu = form.porQueCombina.length > LIMITE_POR_QUE_COMBINA;

  const editar = <K extends keyof FormSugestao>(campo: K, valor: FormSugestao[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErroLoja(null);
    setSucesso(false);
  };

  const limparTudo = () => {
    setForm(FORM_VAZIO);
    setTentou(false);
    setErroLoja(null);
    setChaveFoto((k) => k + 1);
  };

  const enviar = () => {
    setTentou(true);
    setSucesso(false);
    setConfirmando(false);
    if (!validarSugestao(dados, hoje).ok) return;
    const r = loja.criarSugestao(dados);
    if (!r.ok) {
      setErroLoja(r.motivo);
      return;
    }
    limparTudo();
    setSucesso(true);
  };

  const invalido = (campo: keyof typeof erros) => (erros[campo] ? "border-destructive" : "");

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-navy">Sugira um brinde</h1>
      <p className="mt-1 text-sm text-muted-foreground">Só o nome é obrigatório. Quanto mais você contar, mais rápido o Marketing decide.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-start">
        <form
          className="flex min-w-0 flex-col gap-6 rounded-3xl border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
          noValidate
        >
          <fieldset className="m-0 min-w-0 space-y-4 border-0 p-0">
            <legend className={LEGENDA}>Sobre o brinde</legend>
            <label className="block text-sm">
              <span className={ROTULO}>
                Nome do brinde <span aria-hidden>*</span>
              </span>
              <input
                className={`${CAMPO} h-11 ${invalido("nome")}`}
                value={form.nome}
                onChange={(e) => editar("nome", e.target.value)}
                placeholder="Ex.: Mouse pad ergonômico"
                aria-required
                aria-invalid={!!erros.nome}
                aria-describedby="sug-msg"
              />
            </label>
            <label className="block text-sm">
              <span className={ROTULO}>Categoria{OPCIONAL}</span>
              <select className={`${CAMPO} h-11`} value={form.categoria} onChange={(e) => editar("categoria", e.target.value)}>
                <option value="">Escolha uma categoria</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value={CATEGORIA_OUTRA}>{CATEGORIA_OUTRA}</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className={ROTULO}>Descrição{OPCIONAL}</span>
              <textarea
                className={`${CAMPO} h-24 resize-none py-3`}
                value={form.descricao}
                onChange={(e) => editar("descricao", e.target.value)}
                placeholder="Como é o brinde, material, tamanho, onde já viu"
              />
            </label>
            <div className="text-sm">
              <label htmlFor="sug-combina" className={ROTULO}>
                Por que combina com a marca{OPCIONAL}
              </label>
              <textarea
                id="sug-combina"
                className={`${CAMPO} h-24 resize-none py-3 ${invalido("porQueCombina")}`}
                value={form.porQueCombina}
                onChange={(e) => editar("porQueCombina", e.target.value)}
                aria-invalid={!!erros.porQueCombina}
                aria-describedby="sug-contador sug-msg"
              />
              <p id="sug-contador" className={`mt-1 h-5 text-right text-xs font-semibold ${excedeu ? "text-[color:var(--destructive-strong)]" : "text-muted-foreground"}`}>
                {form.porQueCombina.length}/{LIMITE_POR_QUE_COMBINA}
              </p>
            </div>
            <label className="block text-sm">
              <span className={ROTULO}>Link de referência{OPCIONAL}</span>
              <input
                className={`${CAMPO} h-11 ${invalido("link")}`}
                value={form.link}
                onChange={(e) => editar("link", e.target.value)}
                inputMode="url"
                placeholder="https://"
                aria-invalid={!!erros.link}
                aria-describedby="sug-msg"
              />
            </label>
            <div className="text-sm">
              <span id="sug-foto-rotulo" className={ROTULO}>
                Foto de referência{OPCIONAL}
              </span>
              <div className="flex h-11 items-center gap-3">
                <input
                  key={chaveFoto}
                  id="sug-foto"
                  type="file"
                  accept="image/*,.pdf"
                  className="peer sr-only"
                  aria-labelledby="sug-foto-rotulo"
                  onChange={(e) => editar("fotoReferencia", e.target.files?.[0]?.name ?? "")}
                />
                <label
                  htmlFor="sug-foto"
                  className={`${BOTAO_SECUNDARIO} shrink-0 cursor-pointer whitespace-nowrap peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--le-foco)]`}
                >
                  Escolher arquivo
                </label>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground/85">{form.fotoReferencia || "Nenhum arquivo escolhido"}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{TEXTO_FOTO_PROTOTIPO}</p>
            </div>
          </fieldset>

          <fieldset className="m-0 min-w-0 space-y-4 border-0 border-t p-0 pt-5">
            <legend className={`${LEGENDA} float-left w-full`}>Para que serve</legend>
            <div className="clear-both text-sm">
              <span id="sug-ocasioes" className={ROTULO}>
                Ocasiões de uso{OPCIONAL}
              </span>
              <ChipsMultiplos idRotulo="sug-ocasioes" opcoes={OPCOES_OCASIAO} marcados={form.ocasioes} onAlternar={(v) => editar("ocasioes", alternar(form.ocasioes, v))} />
            </div>
            <div className="text-sm">
              <span id="sug-publicos" className={ROTULO}>
                Públicos{OPCIONAL}
              </span>
              <ChipsMultiplos idRotulo="sug-publicos" opcoes={OPCOES_PUBLICO} marcados={form.publicos} onAlternar={(v) => editar("publicos", alternar(form.publicos, v))} />
            </div>
            <div className="text-sm">
              <label htmlFor="sug-data" className={ROTULO}>
                Data em que você precisaria{OPCIONAL}
              </label>
              <input
                id="sug-data"
                type="date"
                min={hoje}
                className={`${CAMPO} h-11 ${invalido("dataNecessaria")}`}
                value={form.dataNecessaria}
                onChange={(e) => editar("dataNecessaria", e.target.value)}
                aria-invalid={!!erros.dataNecessaria}
                aria-describedby="sug-msg"
              />
            </div>
            <div className="text-sm">
              <span id="sug-frequencia" className={ROTULO}>
                Frequência{OPCIONAL}
              </span>
              <ChipsUnica idRotulo="sug-frequencia" opcoes={OPCOES_FREQUENCIA} valor={form.frequencia} onEscolher={(v) => editar("frequencia", v)} />
            </div>
          </fieldset>

          <fieldset className="m-0 min-w-0 space-y-4 border-0 border-t p-0 pt-5">
            <legend className={`${LEGENDA} float-left w-full`}>Quanto custa e quanto precisa</legend>
            <div className="clear-both text-sm">
              <label htmlFor="sug-quantidade" className={ROTULO}>
                Quantidade estimada por pedido{OPCIONAL}
              </label>
              <input
                id="sug-quantidade"
                className={`${CAMPO} h-11 ${invalido("quantidadeEstimada")}`}
                value={form.quantidade}
                onChange={(e) => editar("quantidade", e.target.value)}
                inputMode="numeric"
                placeholder="Ex.: 50"
                aria-invalid={!!erros.quantidadeEstimada}
                aria-describedby="sug-msg"
              />
            </div>
            <div className="text-sm">
              <span id="sug-faixa" className={ROTULO}>
                Faixa de custo por unidade{OPCIONAL}
              </span>
              <ChipsUnica idRotulo="sug-faixa" opcoes={OPCOES_FAIXA} valor={form.faixaCusto} onEscolher={(v) => editar("faixaCusto", v)} />
            </div>
            <div className="text-sm">
              <span id="sug-logo" className={ROTULO}>
                Teria a marca Digisystem?{OPCIONAL}
              </span>
              <ChipsUnica idRotulo="sug-logo" opcoes={OPCOES_LOGO} valor={form.comLogo} onEscolher={(v) => editar("comLogo", v)} />
            </div>
          </fieldset>

          <div>
            <p aria-live="polite" className="h-6 text-sm font-semibold text-foreground/85">
              {textoIndicador(detalhes)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-full bg-navy px-6 font-display text-sm font-bold text-navy-foreground le-btn hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)] sm:flex-none"
              >
                Enviar sugestão
              </button>
              <button ref={botaoLimpar} type="button" className={BOTAO_SECUNDARIO} disabled={!sujo} onClick={() => setConfirmando(true)}>
                Limpar
              </button>
            </div>
            {/* Faixa de altura fixa: mostra a confirmação de Limpar ou a mensagem, sem deslocar nada. */}
            <div id="sug-msg" className="mt-2 flex min-h-12 flex-wrap items-center gap-2 text-sm font-semibold">
              {confirmando ? (
                <div className="le-msg flex flex-wrap items-center gap-2">
                  <span className="text-foreground/90">Limpar tudo?</span>
                  <button
                    type="button"
                    className="le-btn inline-flex h-11 items-center rounded-full bg-navy px-4 font-display text-sm font-bold text-navy-foreground hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--le-foco)]"
                    onClick={() => {
                      limparTudo();
                      setConfirmando(false);
                      setSucesso(false);
                      botaoLimpar.current?.focus();
                    }}
                  >
                    Sim, limpar
                  </button>
                  <button
                    type="button"
                    className={BOTAO_SECUNDARIO}
                    onClick={() => {
                      setConfirmando(false);
                      botaoLimpar.current?.focus();
                    }}
                  >
                    Não
                  </button>
                </div>
              ) : (
                <p
                  role={mensagem ? (primeiroErro ? "alert" : "status") : undefined}
                  className={primeiroErro ? "text-[color:var(--destructive-strong)]" : "text-[color:var(--success-strong)]"}
                >
                  <Msg texto={mensagem} />
                </p>
              )}
            </div>
          </div>
        </form>

        <div className="min-w-0 space-y-4">
          <Parecidos itens={parecidos} />
          <ResumoSugestao nome={form.nome} linhas={linhas} detalhes={detalhes} />

          <div>
            <h2 className="mb-3 font-display text-lg font-bold text-navy">Suas sugestões</h2>
            {minhas.length === 0 ? (
              <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">Você ainda não sugeriu nenhum brinde.</p>
            ) : (
              <ul className="space-y-2">
                {minhas.map((s, i) => {
                  const chips = chipsDaSugestao(s);
                  return (
                    <li key={s.id} style={estiloEntrada(i)} className="le-entra rounded-2xl border bg-card p-4 shadow-card">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 break-words font-display text-base font-bold text-navy">{s.nome}</p>
                        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-navy-soft px-2.5 font-display text-xs font-bold text-[color:var(--le-ativo)]">
                          {ROTULO_SUGESTAO[s.estado]}
                        </span>
                      </div>
                      {chips.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Principais detalhes">
                          {chips.map((c, k) => (
                            <li key={`${c}-${k}`} className="inline-flex h-6 items-center rounded-full bg-secondary px-2.5 text-xs font-semibold text-foreground/85">
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}
                      {s.descricao && <p className="mt-2 break-words text-sm text-foreground/85">{s.descricao}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">Enviada em {dataCurta(s.em)}</p>
                      {s.estado === "recusada" && s.motivo && <p className="mt-1 text-xs font-semibold text-foreground/80">Motivo: {s.motivo}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
