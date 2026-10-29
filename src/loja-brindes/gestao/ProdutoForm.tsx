// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Cadastro e edição de produto, com prévia ao vivo do card como o diretor vai ver.
// Custo unitário e saldo são campos diferentes. Saldo de variação existente só muda por
// entrada ou ajuste (fica registrado na rastreabilidade). v4: a flag "disponível sob encomenda"
// libera a produção sob demanda e revela a quantidade mínima.

import { useState, type ReactNode } from "react";
import { ArrowLeft, ImageUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardProduto } from "../CardProduto";
import { FotoProduto } from "../FotoProduto";
import { useLoja } from "../estado";
import { HOJE } from "../formato";
import { CATEGORIAS, CORES } from "../mock";
import { navegar, voltar } from "../rota";
import { QTD_MINIMA_ENCOMENDA } from "../regras";
import type { AceitaPersonalizacao, AnguloFoto, CategoriaId, FundoFoto, Produto, Tamanho, Variacao } from "../tipos";
import { Botao, Campo, classeInput, ParPills, Vazio } from "../ui";
import { GestaoShell } from "./GestaoShell";

const ANGULOS: { id: AnguloFoto; rotulo: string }[] = [
  { id: "frente", rotulo: "Frente" }, { id: "detalhe", rotulo: "Detalhe" }, { id: "uso", rotulo: "Em uso" }, { id: "embalagem", rotulo: "Embalagem" },
];
const FUNDOS: { id: FundoFoto; rotulo: string; amostra: string }[] = [
  { id: "navy-sky", rotulo: "Azul e apoio", amostra: "linear-gradient(140deg, var(--navy-soft), var(--sky-soft))" },
  { id: "sky-orange", rotulo: "Apoio e laranja", amostra: "linear-gradient(140deg, var(--sky-soft), var(--orange-soft))" },
  { id: "navy-escuro", rotulo: "Azul Reflex", amostra: "var(--navy)" },
  { id: "neutro", rotulo: "Neutro", amostra: "var(--secondary)" },
];
const TAMANHOS: Tamanho[] = ["P", "M", "G", "GG"];

function novoProduto(): Produto {
  return {
    id: `p-novo-${Date.now().toString(36)}`, slug: "", nome: "", categoria: "bebidas", icone: "garrafa",
    galeria: [{ angulo: "frente", fundo: "navy-sky", legenda: "" }],
    descricaoCurta: "", descricaoLonga: [""], especificacoes: [{ rotulo: "Material", valor: "" }],
    custoUnitario: 0, variacoes: [{ id: "unico", rotulo: "Único", saldo: 0, minimo: 0 }],
    selos: ["novidade"], cadastradoEm: HOJE, ativo: true, usos: [],
  };
}

const slugify = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function ProdutoForm({ slug }: { slug: string }) {
  const { estado, salvarProduto, avisar } = useLoja();
  const existente = slug === "novo" ? undefined : estado.produtos.find((p) => p.slug === slug);
  const [d, setD] = useState<Produto>(() => (existente ? structuredClone(existente) : novoProduto()));
  const [tentou, setTentou] = useState(false);
  const editando = !!existente;
  const idsOriginais = new Set(existente?.variacoes.map((v) => v.id) ?? []);

  if (slug !== "novo" && !existente) {
    return <Vazio icone={<ImageUp className="size-7" />} titulo="Produto não encontrado" texto="Volte para o estoque e escolha outro item."><Botao onClick={() => navegar("/loja/gestao/estoque")}>Ir para o estoque</Botao></Vazio>;
  }

  const set = (p: Partial<Produto>) => setD((x) => ({ ...x, ...p }));
  const comVariacao = d.variacoes.length > 1 || d.variacoes[0]?.id !== "unico";
  const tipoVar: "cor" | "tamanho" = d.variacoes.some((v) => v.tamanho) && !d.variacoes.some((v) => v.cor) ? "tamanho" : "cor";

  const erros = {
    nome: !d.nome.trim() ? "Dê um nome ao produto." : null,
    custo: !(d.custoUnitario > 0) ? "O custo unitário precisa ser maior que zero." : null,
    curta: !d.descricaoCurta.trim() ? "Escreva uma frase que resuma o produto." : null,
    variacoes: d.variacoes.some((v) => !v.rotulo.trim()) ? "Toda variação precisa de um nome." : null,
    perso: d.personalizacao && (!(d.personalizacao.qtdMinima >= 1) || !d.personalizacao.tecnica.trim()) ? "Informe a técnica e uma quantidade mínima de pelo menos 1." : null,
  };
  const valido = Object.values(erros).every((e) => !e);

  const salvar = () => {
    setTentou(true);
    if (!valido) { avisar("Revise os campos marcados antes de salvar.", "erro"); return; }
    const final: Produto = {
      ...d,
      slug: d.slug || slugify(d.nome),
      descricaoLonga: d.descricaoLonga.filter((x) => x.trim()),
      especificacoes: d.especificacoes.filter((e) => e.rotulo.trim() && e.valor.trim()),
      galeria: d.galeria.map((g) => ({ ...g, legenda: g.legenda || d.nome })),
    };
    if (salvarProduto(final)) navegar("/loja/gestao/estoque");
  };

  const mudarVar = (i: number, p: Partial<Variacao>) => set({ variacoes: d.variacoes.map((v, j) => (j === i ? { ...v, ...p } : v)) });
  const addVar = () => {
    const idx = d.variacoes.length + 1;
    set({ variacoes: [...d.variacoes.filter((v) => v.id !== "unico"), tipoVar === "cor"
      ? { id: `cor-${idx}-${Date.now().toString(36)}`, rotulo: CORES.azul.nome, cor: CORES.azul, saldo: 0, minimo: 0 }
      : { id: `tam-${idx}-${Date.now().toString(36)}`, rotulo: "M", tamanho: "M", saldo: 0, minimo: 0 }] });
  };

  return (
    <GestaoShell
      titulo={editando ? `Editar ${existente!.nome}` : "Cadastrar produto"}
      descricao="Preencha como o diretor vai ver na loja. A prévia ao lado mostra o card da vitrine."
      acoes={<>
        <Botao variante="fantasma" onClick={() => voltar("/loja/gestao/estoque")}><ArrowLeft className="size-4" aria-hidden /> Voltar</Botao>
        <Botao onClick={salvar}>Salvar produto</Botao>
      </>}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Secao titulo="Fotos" texto="No protótipo as fotos são ilustrações. Escolha o fundo de cada ângulo.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ANGULOS.map((a) => {
                const foto = d.galeria.find((g) => g.angulo === a.id);
                return (
                  <div key={a.id} className="rounded-2xl border border-border p-2">
                    {foto ? (
                      <FotoProduto produto={d} foto={foto} tamanho="mini" className="aspect-square rounded-xl" />
                    ) : (
                      <button type="button" onClick={() => set({ galeria: [...d.galeria, { angulo: a.id, fundo: "neutro", legenda: "" }] })}
                        className="grid aspect-square w-full place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary">
                        <span className="flex flex-col items-center gap-1 text-[12.5px] font-semibold"><ImageUp className="size-6" aria-hidden /> Enviar foto</span>
                      </button>
                    )}
                    <p className="mt-1.5 font-display text-[13px] font-bold">{a.rotulo}</p>
                    {foto && (
                      <div className="mt-1 flex items-center gap-1.5">
                        {FUNDOS.map((f) => (
                          <button key={f.id} type="button" title={f.rotulo} aria-label={`Fundo ${f.rotulo}`} aria-pressed={foto.fundo === f.id}
                            onClick={() => set({ galeria: d.galeria.map((g) => (g.angulo === a.id ? { ...g, fundo: f.id } : g)) })}
                            className={cn("size-6 rounded-full ring-1 ring-border", foto.fundo === f.id && "ring-2 ring-primary ring-offset-1")} style={{ background: f.amostra }} />
                        ))}
                        {a.id !== "frente" && (
                          <button type="button" aria-label={`Remover foto ${a.rotulo}`} onClick={() => set({ galeria: d.galeria.filter((g) => g.angulo !== a.id) })}
                            className="ml-auto grid size-7 place-items-center rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Secao>

          <Secao titulo="Dados do produto">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Nome" htmlFor="f-nome" erro={tentou ? erros.nome : null} className="sm:col-span-2">
                <input id="f-nome" value={d.nome} onChange={(e) => set({ nome: e.target.value })} placeholder="Ex.: Garrafa térmica 500 ml" className={classeInput} />
              </Campo>
              <Campo rotulo="Categoria" htmlFor="f-cat">
                <select id="f-cat" value={d.categoria} onChange={(e) => set({ categoria: e.target.value as CategoriaId })} className={classeInput}>
                  {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Custo unitário (R$)" htmlFor="f-custo" erro={tentou ? erros.custo : null} ajuda="Quanto cada unidade custa para a empresa. Não é o saldo.">
                <input id="f-custo" type="number" step="0.01" min="0" value={d.custoUnitario || ""} onChange={(e) => set({ custoUnitario: Number(e.target.value) })} placeholder="0,00" className={cn(classeInput, "font-display text-[16px] font-bold")} />
              </Campo>
              <Campo rotulo="Descrição curta" htmlFor="f-curta" erro={tentou ? erros.curta : null} className="sm:col-span-2" ajuda="Uma frase. Aparece embaixo do nome na página do produto.">
                <input id="f-curta" value={d.descricaoCurta} onChange={(e) => set({ descricaoCurta: e.target.value })} placeholder="Ex.: Mantém a bebida gelada por até 12 horas." className={classeInput} />
              </Campo>
              <Campo rotulo="Descrição detalhada" htmlFor="f-longa" className="sm:col-span-2" ajuda="Separe os parágrafos com uma linha em branco.">
                <textarea id="f-longa" rows={4} value={d.descricaoLonga.join("\n\n")} onChange={(e) => set({ descricaoLonga: e.target.value.split(/\n\s*\n/) })} className={cn(classeInput, "resize-y")}
                  placeholder="Conte para que serve, quando costuma sair e o que vale saber antes de pedir." />
              </Campo>
            </div>
          </Secao>

          <Secao titulo="Especificações" texto="Material, dimensões, capacidade, peso, cuidados.">
            <ul className="space-y-2">
              {d.especificacoes.map((e, i) => (
                <li key={i} className="flex flex-col gap-2 sm:flex-row">
                  <input aria-label="Rótulo" value={e.rotulo} onChange={(ev) => set({ especificacoes: d.especificacoes.map((x, j) => (j === i ? { ...x, rotulo: ev.target.value } : x)) })} placeholder="Rótulo" className={cn(classeInput, "sm:max-w-[200px]")} />
                  <div className="flex min-w-0 flex-1 gap-2">
                    <input aria-label="Valor" value={e.valor} onChange={(ev) => set({ especificacoes: d.especificacoes.map((x, j) => (j === i ? { ...x, valor: ev.target.value } : x)) })} placeholder="Valor" className={classeInput} />
                    <button type="button" aria-label="Remover especificação" onClick={() => set({ especificacoes: d.especificacoes.filter((_, j) => j !== i) })} className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
            <Botao variante="suave" tamanho="sm" className="mt-3" onClick={() => set({ especificacoes: [...d.especificacoes, { rotulo: "", valor: "" }] })}><Plus className="size-4" aria-hidden /> Adicionar especificação</Botao>
          </Secao>

          <Secao titulo="Variações e saldo" texto="Cada variação tem saldo e mínimo próprios. O alerta de estoque aparece quando o disponível fica abaixo do mínimo.">
            <ParPills rotulo="Variações" valor={comVariacao ? "com" : "sem"}
              onChange={(x) => {
                if (x === "sem") set({ variacoes: [{ id: "unico", rotulo: "Único", saldo: d.variacoes.reduce((s, v) => s + v.saldo, 0), minimo: d.variacoes[0]?.minimo ?? 0 }] });
                else if (!comVariacao) set({ variacoes: [{ id: `cor-1-${Date.now().toString(36)}`, rotulo: CORES.azul.nome, cor: CORES.azul, saldo: d.variacoes[0]?.saldo ?? 0, minimo: d.variacoes[0]?.minimo ?? 0 }] });
              }}
              opcoes={[{ valor: "sem", rotulo: "Sem variação" }, { valor: "com", rotulo: "Com variações" }]} />
            {comVariacao && (
              <div className="mt-4">
                <ParPills rotulo="Tipo de variação" tamanho="sm" valor={tipoVar}
                  onChange={(t) => set({ variacoes: d.variacoes.map((v, i) => (t === "cor"
                    ? { id: v.id, rotulo: CORES.azul.nome, cor: CORES.azul, saldo: v.saldo, minimo: v.minimo }
                    : { id: v.id, rotulo: TAMANHOS[i % 4], tamanho: TAMANHOS[i % 4], saldo: v.saldo, minimo: v.minimo })) })}
                  opcoes={[{ valor: "cor", rotulo: "Cor" }, { valor: "tamanho", rotulo: "Tamanho" }]} />
              </div>
            )}
            <ul className="mt-4 space-y-2.5">
              {d.variacoes.map((v, i) => {
                const travado = editando && idsOriginais.has(v.id);
                return (
                  <li key={v.id} className="grid grid-cols-2 gap-2.5 rounded-2xl border border-border p-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] sm:items-end">
                    <div className="col-span-2 min-w-0 sm:col-span-1">
                      <p className="mb-1.5 font-display text-[12.5px] font-bold text-muted-foreground">{comVariacao ? (v.tamanho ? "Tamanho" : "Cor") : "Variação"}</p>
                      {!comVariacao ? <p className="flex h-11 items-center text-[14px] font-semibold">Único</p> : v.tamanho ? (
                        <div className="flex flex-wrap gap-1.5">
                          {TAMANHOS.map((t) => (
                            <button key={t} type="button" aria-pressed={v.tamanho === t} onClick={() => mudarVar(i, { tamanho: t, rotulo: t })}
                              className={cn("h-11 min-w-11 rounded-xl border font-display text-[14px] font-bold", v.tamanho === t ? "border-primary bg-navy-soft text-primary" : "border-border")}>{t}</button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.values(CORES).map((c) => (
                            <button key={c.hex} type="button" title={c.nome} aria-label={c.nome} aria-pressed={v.cor?.hex === c.hex} onClick={() => mudarVar(i, { cor: c, rotulo: c.nome })}
                              className={cn("size-9 rounded-full ring-1 ring-border", v.cor?.hex === c.hex && "ring-2 ring-primary ring-offset-2")} style={{ background: c.hex }} />
                          ))}
                        </div>
                      )}
                      {comVariacao && v.cor && <p className="mt-1 text-[12.5px] text-muted-foreground">{v.cor.nome}</p>}
                    </div>
                    <Campo rotulo={travado ? "Saldo atual" : "Saldo inicial"} htmlFor={`saldo-${v.id}`} ajuda={travado ? "Muda por entrada ou ajuste." : undefined}>
                      <input id={`saldo-${v.id}`} type="number" min="0" value={v.saldo} disabled={travado} onChange={(e) => mudarVar(i, { saldo: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} className={classeInput} />
                    </Campo>
                    <Campo rotulo="Mínimo" htmlFor={`min-${v.id}`}>
                      <input id={`min-${v.id}`} type="number" min="0" value={v.minimo} onChange={(e) => mudarVar(i, { minimo: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} className={classeInput} />
                    </Campo>
                    {comVariacao && d.variacoes.length > 1 && !travado ? (
                      <button type="button" aria-label="Remover variação" onClick={() => set({ variacoes: d.variacoes.filter((_, j) => j !== i) })}
                        className="col-span-2 grid h-11 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-destructive sm:col-span-1 sm:size-11"><Trash2 className="size-4" /></button>
                    ) : <span className="hidden sm:block sm:w-11" />}
                  </li>
                );
              })}
            </ul>
            {tentou && erros.variacoes && <p className="mt-2 text-[13px] font-semibold text-destructive">{erros.variacoes}</p>}
            {comVariacao && <Botao variante="suave" tamanho="sm" className="mt-3" onClick={addVar}><Plus className="size-4" aria-hidden /> Adicionar {tipoVar === "cor" ? "cor" : "tamanho"}</Botao>}
          </Secao>

          <Secao titulo="Encomenda sob demanda" texto="Libere a produção sob demanda. Um item pode ter pronta entrega e aceitar encomenda, ou ser só encomenda (sem estoque próprio).">
            <ParPills rotulo="Disponível sob encomenda" valor={d.aceitaEncomenda ? "sim" : "nao"}
              onChange={(x) => set(x === "sim"
                ? { aceitaEncomenda: true, encomendaMinima: d.encomendaMinima ?? QTD_MINIMA_ENCOMENDA }
                : { aceitaEncomenda: false, somenteEncomenda: false, encomendaMinima: undefined })}
              opcoes={[{ valor: "nao", rotulo: "Não aceita" }, { valor: "sim", rotulo: "Disponível sob encomenda" }]} />
            {d.aceitaEncomenda && (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo rotulo="Quantidade mínima de encomenda" htmlFor="enc-min" ajuda={`Piso de ${QTD_MINIMA_ENCOMENDA} unidades.`}>
                    <input id="enc-min" type="number" min={QTD_MINIMA_ENCOMENDA} value={d.encomendaMinima ?? QTD_MINIMA_ENCOMENDA}
                      onChange={(e) => set({ encomendaMinima: Math.max(1, Math.floor(Number(e.target.value) || 0)) })} className={classeInput} />
                  </Campo>
                </div>
                <div>
                  <p className="mb-2 font-display text-[13.5px] font-bold">Tipo de disponibilidade</p>
                  <ParPills rotulo="Tipo de disponibilidade" tamanho="sm" valor={d.somenteEncomenda ? "so" : "ambos"}
                    onChange={(x) => set({ somenteEncomenda: x === "so" })}
                    opcoes={[{ valor: "ambos", rotulo: "Pronta entrega + encomenda" }, { valor: "so", rotulo: "Só encomenda (sem estoque)" }]} />
                  <p className="mt-2 text-[12.5px] text-muted-foreground">
                    {d.somenteEncomenda ? "Sem estoque próprio: o item só aparece como encomenda, produzido sob demanda." : "Com saldo, sai na hora; sem saldo, fica disponível por encomenda."}
                  </p>
                </div>
              </div>
            )}
          </Secao>

          <Secao titulo="Personalização" texto="Itens personalizáveis pedem quantidade mínima e somam prazo de produção.">
            <ParPills rotulo="Personalização" valor={d.personalizacao ? "sim" : "nao"}
              onChange={(x) => set({ personalizacao: x === "sim" ? { tecnica: "", area: "", qtdMinima: 10, prazoExtraDiasUteis: 5, aceita: ["logo"] } : undefined })}
              opcoes={[{ valor: "nao", rotulo: "Não personalizável" }, { valor: "sim", rotulo: "Personalizável" }]} />
            {d.personalizacao && (() => {
              const op = d.personalizacao;
              const setOp = (p: Partial<typeof op>) => set({ personalizacao: { ...op, ...p } });
              return (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Campo rotulo="Técnica" htmlFor="p-tec"><input id="p-tec" value={op.tecnica} onChange={(e) => setOp({ tecnica: e.target.value })} placeholder="Ex.: Gravação a laser na lateral" className={classeInput} /></Campo>
                  <Campo rotulo="Área de impressão" htmlFor="p-area"><input id="p-area" value={op.area} onChange={(e) => setOp({ area: e.target.value })} placeholder="Ex.: 4 × 6 cm" className={classeInput} /></Campo>
                  <Campo rotulo="Quantidade mínima para personalizar" htmlFor="p-min"><input id="p-min" type="number" min="1" value={op.qtdMinima} onChange={(e) => setOp({ qtdMinima: Math.floor(Number(e.target.value) || 0) })} className={classeInput} /></Campo>
                  <Campo rotulo="Prazo extra (dias úteis)" htmlFor="p-prazo"><input id="p-prazo" type="number" min="0" value={op.prazoExtraDiasUteis} onChange={(e) => setOp({ prazoExtraDiasUteis: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} className={classeInput} /></Campo>
                  <div className="sm:col-span-2">
                    <p className="mb-2 font-display text-[13.5px] font-bold">Aceita</p>
                    <div className="flex flex-wrap gap-2">
                      {(["logo", "nome", "texto"] as AceitaPersonalizacao[]).map((a) => {
                        const ativo = op.aceita.includes(a);
                        return (
                          <button key={a} type="button" aria-pressed={ativo} onClick={() => setOp({ aceita: ativo ? op.aceita.filter((x) => x !== a) : [...op.aceita, a] })}
                            className={cn("h-10 rounded-full border px-4 font-display text-[13.5px] font-bold", ativo ? "border-primary bg-navy-soft text-primary" : "border-border text-muted-foreground")}>
                            {{ logo: "Logo", nome: "Nome", texto: "Texto livre" }[a]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {tentou && erros.perso && <p className="text-[13px] font-semibold text-destructive sm:col-span-2">{erros.perso}</p>}
                </div>
              );
            })()}
          </Secao>

          <div className="flex justify-end gap-2">
            <Botao variante="fantasma" onClick={() => voltar("/loja/gestao/estoque")}>Cancelar</Botao>
            <Botao tamanho="lg" onClick={salvar}>Salvar produto</Botao>
          </div>
        </div>

        <aside className="min-w-0">
          <div className="lg:sticky lg:top-[136px]">
            <p className="mb-2 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Prévia na vitrine</p>
            <div className="max-w-[300px]"><CardProduto produto={d} pedidos={estado.pedidos} previa /></div>
            <p className="mt-3 text-[12.5px] text-muted-foreground">O selo de disponibilidade usa o saldo e o mínimo de cada variação.</p>
          </div>
        </aside>
      </div>
    </GestaoShell>
  );
}

function Secao({ titulo, texto, children }: { titulo: string; texto?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <h2 className="font-display text-[18px] font-bold">{titulo}</h2>
      {texto && <p className="mb-4 mt-0.5 text-[13.5px] text-muted-foreground">{texto}</p>}
      {!texto && <div className="mb-4" />}
      {children}
    </section>
  );
}
