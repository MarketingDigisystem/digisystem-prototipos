/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: design.md (PaginaBrinde, FormPersonalizacao) + requirements.md Req. 4.
 * Propriedade: custo por unidade e Disponivel. Personalizável: "Valor avaliado conforme a quantidade de brindes",
 * quantidade, texto ou arte e observação. Sem saldo físico, reserva, mínimo ou detalhe de custo.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { FotoBrinde } from "../FotoBrinde";
import { href, useRota } from "../rota";
import { useLoja } from "../store";
import { Aviso, EstadoErro, EstadoVazio, Esqueleto } from "./Estados";
import { AREA, BOTAO_PRIMARIO, CAMPO, TIPO_ROTULO, brl } from "./util";

const PERSONALIZA = { logo: "logo", nome: "nome", texto: "texto" } as const;

export function PaginaBrinde({ skuId }: { skuId: string }) {
  const loja = useLoja();
  const { estado } = useRota();
  const sku = loja.skus.find((s) => s.id === skuId);
  const [qtd, setQtd] = useState("1");
  const [texto, setTexto] = useState("");
  const [obs, setObs] = useState("");
  const [arte, setArte] = useState("");
  const [erro, setErro] = useState("");

  const voltar = (
    <a href={href("")} className="mb-4 inline-flex h-10 items-center gap-2 rounded-full pr-3 font-display text-sm font-bold text-navy hover:underline">
      <ArrowLeft className="size-4" aria-hidden /> Voltar aos brindes
    </a>
  );

  if (estado === "carregando") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6" aria-busy="true">
        {voltar}
        <div className="grid gap-8 md:grid-cols-2">
          <Esqueleto className="aspect-square w-full rounded-3xl" />
          <div className="space-y-3">
            <Esqueleto className="h-8 w-3/4" />
            <Esqueleto className="h-4 w-1/3" />
            <Esqueleto className="h-24 w-full" />
            <Esqueleto className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (estado === "erro") return <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{voltar}<EstadoErro titulo="Não foi possível abrir o brinde" texto="Confira a conexão e tente de novo." /></div>;
  if (!sku || estado === "vazio") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {voltar}
        <EstadoVazio titulo="Brinde não encontrado" texto="Esse brinde não está mais no catálogo." />
      </div>
    );
  }

  const personalizavel = sku.tipo === "personalizavel";
  const disp = loja.disponivel(sku.id);
  const indisponivel = !personalizavel && disp <= 0;
  const noCarrinho = loja.carrinho.filter((l) => l.skuId === sku.id).reduce((n, l) => n + l.quantidade, 0);
  const aceita = sku.aceitaPersonalizacao;
  const quantidade = Number(qtd);

  const mudarQtd = (delta: number) => {
    const n = Number.isFinite(quantidade) ? Math.trunc(quantidade) : 1;
    setQtd(String(Math.max(1, n + delta)));
    setErro("");
  };

  const adicionar = () => {
    if (!Number.isInteger(quantidade) || quantidade < 1) return setErro("A quantidade mínima é 1 unidade.");
    if (!personalizavel && quantidade + noCarrinho > disp) {
      return setErro(noCarrinho ? `Só há ${disp} disponíveis, e ${noCarrinho} já estão no carrinho.` : `Só há ${disp} disponíveis.`);
    }
    const r = loja.adicionar(sku.id, quantidade, personalizavel ? { texto: texto.trim() || undefined, observacao: obs.trim() || undefined, arte: arte || undefined } : undefined);
    if (!r.ok) return setErro(r.motivo);
    setErro("");
    loja.abrirCarrinho(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {voltar}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="md:sticky md:top-24 md:self-start">
          <FotoBrinde src={sku.foto} alt={sku.nome} className="aspect-square w-full rounded-3xl p-6 shadow-[var(--shadow-card)]" />
        </div>

        <div>
          <span className="rounded-full bg-navy-soft px-3 py-1 text-xs font-bold text-navy">{TIPO_ROTULO[sku.tipo]}</span>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-navy sm:text-4xl">{sku.nome}</h1>
          <p className="mt-3 text-base text-foreground/80">{sku.descricao}</p>

          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 rounded-2xl bg-secondary/60 px-4 py-3 text-sm">
            {sku.especificacoes.map((e) => (
              <div key={e.rotulo} className="contents">
                <dt className="font-semibold text-muted-foreground">{e.rotulo}</dt>
                <dd className="text-foreground">{e.valor}</dd>
              </div>
            ))}
            {personalizavel && aceita.length > 0 && (
              <div className="contents">
                <dt className="font-semibold text-muted-foreground">Pode levar</dt>
                <dd className="text-foreground">{aceita.map((a) => PERSONALIZA[a]).join(", ")}</dd>
              </div>
            )}
          </dl>

          <section aria-label="Pedir este brinde" className="mt-6 rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-baseline justify-between gap-3">
              {personalizavel ? (
                <p className="font-display text-lg font-bold text-navy">Valor avaliado conforme a quantidade de brindes</p>
              ) : (
                <>
                  <p className="font-display text-2xl font-bold text-navy">{brl(sku.custoUnitario ?? 0)} <span className="text-sm font-semibold text-muted-foreground">cada</span></p>
                  <p className={`text-sm font-semibold ${indisponivel ? "text-destructive" : "text-muted-foreground"}`}>
                    {indisponivel ? "Indisponível no momento" : `${disp} ${disp === 1 ? "disponível" : "disponíveis"}`}
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="qtd" className="mb-1.5 block text-sm font-semibold text-navy">Quantidade</label>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Diminuir quantidade" disabled={indisponivel} onClick={() => mudarQtd(-1)} className="grid size-11 place-items-center rounded-full border text-navy hover:bg-navy-soft disabled:opacity-40"><Minus className="size-4" aria-hidden /></button>
                  <input
                    id="qtd" type="number" inputMode="numeric" min={1} value={qtd} disabled={indisponivel}
                    onChange={(e) => { setQtd(e.target.value); setErro(""); }}
                    className={`${CAMPO} w-24 text-center tabular-nums`}
                  />
                  <button type="button" aria-label="Aumentar quantidade" disabled={indisponivel} onClick={() => mudarQtd(1)} className="grid size-11 place-items-center rounded-full border text-navy hover:bg-navy-soft disabled:opacity-40"><Plus className="size-4" aria-hidden /></button>
                </div>
              </div>

              {personalizavel && (
                <>
                  {(aceita.includes("texto") || aceita.includes("nome")) && (
                    <div>
                      <label htmlFor="texto" className="mb-1.5 block text-sm font-semibold text-navy">{aceita.includes("nome") && !aceita.includes("texto") ? "Nome a gravar" : "Texto da personalização"}</label>
                      <input id="texto" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: Parceria que transforma" className={CAMPO} />
                    </div>
                  )}
                  {aceita.includes("logo") && (
                    <div>
                      <label htmlFor="arte" className="mb-1.5 block text-sm font-semibold text-navy">Arte ou logo</label>
                      <input
                        id="arte" type="file" accept="image/*,.pdf,.svg"
                        onChange={(e) => setArte(e.target.files?.[0]?.name ?? "")}
                        className="block w-full text-sm file:mr-3 file:h-10 file:rounded-full file:border-0 file:bg-navy file:px-4 file:font-display file:text-sm file:font-bold file:text-white"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="obs" className="mb-1.5 block text-sm font-semibold text-navy">Observação <span className="font-normal text-muted-foreground">(opcional)</span></label>
                    <textarea id="obs" rows={2} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Cor, posição da arte, tamanhos" className={AREA} />
                  </div>
                  <p className="rounded-2xl bg-sky-soft px-4 py-3 text-sm text-foreground">O Marketing avalia o valor conforme a quantidade e envia o orçamento antes da produção.</p>
                </>
              )}

              <div className="min-h-[2.75rem]" aria-live="polite">{erro && <Aviso tom="erro">{erro}</Aviso>}</div>

              <button type="button" disabled={indisponivel} onClick={adicionar} className={`${BOTAO_PRIMARIO} w-full`}>
                {indisponivel ? "Indisponível no momento" : "Adicionar ao carrinho"}
              </button>
              <p className="min-h-[1rem] text-xs text-muted-foreground">
                {noCarrinho > 0 ? `${noCarrinho} ${noCarrinho === 1 ? "unidade" : "unidades"} deste brinde no carrinho.` : ""}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
