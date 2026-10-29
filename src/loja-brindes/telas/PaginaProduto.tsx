// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Página do produto, dois trilhos: PRONTA ENTREGA (item com saldo, sai na hora) e ENCOMENDA
// (item esgotado que aceita encomenda, ou item encomenda-only — abre o painel de alinhamento).
// Decisão de design: a encomenda tem fluxo próprio (painel dedicado nesta página), não passa
// pelo carrinho de 4 etapas da pronta entrega.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft, Check, ChevronDown, CircleX, Clock, Factory, FileUp, MapPin, Palette, ShoppingBag, Timer, Trash2, TriangleAlert, Users, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CardProduto } from "../CardProduto";
import { FotoProduto } from "../FotoProduto";
import { useLoja } from "../estado";
import { dataCurta, dataLonga, moeda, unidades } from "../formato";
import { areaDoCentro, LOCAL_RETIRADA, nomeCategoria, usuario } from "../mock";
import {
  dataMinima, disponivel, encomendaMinimaDe, situacaoProduto, situacaoVariacao, temProntaEntrega, usosDoProduto, validarEncomenda, validarItem,
} from "../regras";
import { navegar, trocarParams, voltar, type RotaLoja } from "../rota";
import type { CentroCustoId, Finalidade, Produto, Tamanho, Variacao } from "../tipos";
import { BarraFixaMobile, Botao, Breadcrumb, Campo, classeInput, ParPills, Selo, SeloSituacao, Stepper, Vazio } from "../ui";

const TIPOS_ARTE = ["svg", "pdf", "ai", "eps", "png", "jpg", "jpeg"];
const SELO_TXT = { "mais-pedido": "Mais pedido", novidade: "Novidade" } as const;

export function PaginaProduto({ slug, rota }: { slug: string; rota: RotaLoja }) {
  const { estado } = useLoja();
  const produto = estado.produtos.find((p) => p.slug === slug);
  if (!produto) {
    return (
      <Vazio icone={<CircleX className="size-7" />} titulo="Não achamos esse brinde" texto="Ele pode ter saído do catálogo. Volte para a vitrine e veja o que está disponível.">
        <Botao onClick={() => navegar("/loja")}>Ir para a vitrine</Botao>
      </Vazio>
    );
  }
  return <Detalhe key={produto.id} produto={produto} rota={rota} />;
}

function Detalhe({ produto, rota }: { produto: Produto; rota: RotaLoja }) {
  const { estado, carrinho, adicionarAoCarrinho, avisar, diretorId, enviarEncomenda } = useLoja();
  const { pedidos } = estado;
  const eu = usuario(diretorId);

  const padrao = produto.variacoes.find((v) => disponivel(produto, v, pedidos) > 0) ?? produto.variacoes[0];
  const v = produto.variacoes.find((x) => x.id === rota.params.get("v")) ?? padrao;
  const escolher = (nova: Variacao) => trocarParams({ v: nova.id === padrao.id ? undefined : nova.id }, true);

  const [foto, setFoto] = useState(0);
  const [personalizado, setPersonalizado] = useState(false);
  const [qtd, setQtd] = useState(1);
  const [texto, setTexto] = useState("");
  const [arte, setArte] = useState<string | null>(null);
  const [erroArte, setErroArte] = useState<string | null>(null);
  const [tentou, setTentou] = useState(false);
  // Alinhamento da encomenda (fluxo próprio, não passa pelo carrinho).
  const [encFinalidade, setEncFinalidade] = useState<Finalidade>("evento");
  const [encDestino, setEncDestino] = useState("");
  const [encPrazo, setEncPrazo] = useState("");
  const [encObs, setEncObs] = useState("");
  const [tentouEnc, setTentouEnc] = useState(false);

  const noCarrinho = carrinho.filter((i) => i.produtoId === produto.id && i.variacaoId === v.id).reduce((s, i) => s + i.qtd, 0);
  const disp = disponivel(produto, v, pedidos);
  const sitV = situacaoVariacao(produto, v, pedidos);
  const esgotadaVar = disp <= 0;
  const esgotadoTudo = situacaoProduto(produto, pedidos) === "esgotado";
  const opcao = produto.personalizacao;

  // Trilho da encomenda: o item é só-encomenda, ou está esgotado para pronta entrega mas
  // aceita encomenda. Nesse caso a área de compra vira "Solicitar encomenda".
  const temPronta = temProntaEntrega(produto, pedidos);
  const modoEncomenda = !!produto.aceitaEncomenda && (produto.somenteEncomenda || !temPronta);
  const minEncomenda = encomendaMinimaDe(produto);
  // Item esgotado para pronta entrega E sem encomenda: indisponível de verdade.
  const indisponivel = esgotadaVar && !modoEncomenda && !temPronta;

  const val = validarItem(produto, v, qtd, personalizado, pedidos, noCarrinho);

  useEffect(() => {
    setQtd((q) => Math.max(q, modoEncomenda ? minEncomenda : val.minimo));
  }, [v.id, personalizado, val.minimo, modoEncomenda, minEncomenda]);

  const erroTexto = tentou && personalizado && !texto.trim() ? "Conte o que vai na peça: logo, nome ou texto." : null;
  const podeAdicionar = val.ok && qtd > 0 && !(personalizado && !texto.trim());

  const adicionar = (depois?: "checkout") => {
    setTentou(true);
    if (!podeAdicionar) return;
    adicionarAoCarrinho({
      produtoId: produto.id, variacaoId: v.id, qtd,
      personalizacao: personalizado ? { texto: texto.trim(), arteNome: arte ?? undefined } : undefined,
    });
    if (depois === "checkout") { navegar("/loja/checkout/itens"); return; }
    avisar(`${produto.nome} adicionado ao pedido.`, "ok", { rotulo: "Ver pedido", onClick: () => trocarParams({ carrinho: "1" }) });
    setTentou(false);
  };

  const enviarArte = (arquivo?: File) => {
    if (!arquivo) return;
    const ext = arquivo.name.split(".").pop()?.toLowerCase() ?? "";
    if (!TIPOS_ARTE.includes(ext)) {
      setArte(null);
      setErroArte("Esse tipo de arquivo não serve para arte. Envie SVG, PDF, AI, EPS, PNG ou JPG.");
      return;
    }
    setErroArte(null);
    setArte(arquivo.name);
  };

  const valEnc = validarEncomenda(produto, qtd);
  const erroDestinoEnc = encFinalidade !== "interno" && !encDestino.trim() ? "Diga para que é a encomenda." : null;
  const podeEncomendar = valEnc.ok && !erroDestinoEnc && (!personalizado || !!texto.trim());

  const solicitarEncomenda = () => {
    setTentouEnc(true);
    if (!podeEncomendar) return;
    const r = enviarEncomenda({
      produtoId: produto.id, variacaoId: v.id, qtd,
      finalidade: encFinalidade, destino: encDestino.trim(),
      prazoDesejado: encPrazo || undefined,
      observacoesPersonalizacao: [encObs.trim(), personalizado ? texto.trim() : ""].filter(Boolean).join(" · ") || undefined,
      personalizacao: personalizado ? { texto: texto.trim(), arteNome: arte ?? undefined } : undefined,
    });
    if (r) navegar(`/loja/pedidos/${r.id}`);
  };

  const usos = usosDoProduto(produto, pedidos);
  const usosMes = usos.filter((u) => u.em.startsWith("2026-10"));
  const areas = [...new Set(usos.map((u) => u.centroCustoId))];
  const relacionados = useMemo(() => {
    const mesma = estado.produtos.filter((p) => p.id !== produto.id && p.categoria === produto.categoria);
    const disponiveis = estado.produtos.filter((p) => p.id !== produto.id && p.categoria !== produto.categoria && situacaoProduto(p, pedidos) === "disponivel");
    return [...mesma, ...disponiveis].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i && situacaoProduto(p, pedidos) !== "esgotado").slice(0, 4);
  }, [estado.produtos, produto, pedidos]);

  const cores = [...new Map(produto.variacoes.filter((x) => x.cor).map((x) => [x.cor!.hex, x.cor!])).values()];
  const tamanhos = [...new Set(produto.variacoes.filter((x) => x.tamanho).map((x) => x.tamanho!))] as Tamanho[];
  const temVariacao = produto.variacoes.length > 1;

  const escolherCor = (hex: string) => {
    const daCor = produto.variacoes.filter((x) => x.cor?.hex === hex);
    escolher(daCor.find((x) => x.tamanho === v.tamanho) ?? daCor.find((x) => disponivel(produto, x, pedidos) > 0) ?? daCor[0]);
  };
  const escolherTamanho = (t: Tamanho) => {
    const alvo = produto.variacoes.find((x) => x.tamanho === t && (!v.cor || x.cor?.hex === v.cor.hex));
    if (alvo) escolher(alvo);
  };

  const prazoTotal = dataMinima(personalizado && opcao ? opcao.prazoExtraDiasUteis : 0);
  const subtotal = qtd * produto.custoUnitario;

  return (
    <div className="pb-24 sm:pb-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="hidden sm:block">
          <Breadcrumb itens={[
            { rotulo: "Loja", onClick: () => navegar("/loja") },
            { rotulo: nomeCategoria(produto.categoria), onClick: () => navegar("/loja", { cat: produto.categoria }) },
            { rotulo: produto.nome },
          ]} />
        </div>
        <button type="button" onClick={() => voltar("/loja")} className="flex h-10 items-center gap-1.5 font-display text-[14px] font-bold text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> <span className="sm:hidden">{nomeCategoria(produto.categoria)}</span><span className="hidden sm:inline">Voltar</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-10">
        {/* Galeria */}
        <div className="min-w-0">
          <div className="hidden gap-3 lg:grid lg:grid-cols-[76px_minmax(0,1fr)]">
            <div className="flex flex-col gap-2.5" role="tablist" aria-label="Fotos do produto">
              {produto.galeria.map((f, i) => (
                <button key={i} type="button" role="tab" aria-selected={foto === i} aria-label={`Foto ${i + 1}: ${f.legenda}`} onClick={() => setFoto(i)}
                  className={cn("overflow-hidden rounded-2xl border-2 transition-colors", foto === i ? "border-primary" : "border-transparent hover:border-border")}>
                  <FotoProduto produto={produto} foto={f} tamanho="mini" className="aspect-square" dessaturar={esgotadoTudo} />
                </button>
              ))}
            </div>
            <figure className="min-w-0">
              <div className="relative overflow-hidden rounded-3xl border border-border shadow-card">
                <FotoProduto produto={produto} foto={produto.galeria[foto]} corHex={foto === 0 ? v.cor?.hex : undefined} tamanho="grande" className="aspect-square" dessaturar={esgotadoTudo} />
                {v.cor && foto === 0 && (
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 font-display text-[13px] font-bold shadow-card">
                    <span className="size-3.5 rounded-full ring-1 ring-border" style={{ background: v.cor.hex }} /> {v.cor.nome}
                  </span>
                )}
              </div>
              <figcaption className="mt-2 text-[13px] text-muted-foreground">{produto.galeria[foto].legenda}</figcaption>
            </figure>
          </div>
          <GaleriaMobile produto={produto} corHex={v.cor?.hex} esgotado={esgotadoTudo} />
        </div>

        {/* Compra */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[12.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{nomeCategoria(produto.categoria)}</span>
            {produto.selos.map((s) => (
              <Selo key={s} tom={s === "mais-pedido" ? "destaque" : s === "novidade" ? "apoio" : "escuro"}>{SELO_TXT[s]}</Selo>
            ))}
          </div>
          <h1 className="mt-1.5 font-display text-[28px] font-bold leading-[1.1] md:text-[34px]">{produto.nome}</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">{produto.descricaoCurta}</p>
          {usosMes.length > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-[13.5px] text-foreground">
              <Users className="size-4 text-primary" aria-hidden /> Usado em {usosMes.length} {usosMes.length === 1 ? "evento" : "eventos"} este mês
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-[34px] font-bold leading-none tabular-nums text-primary">{moeda(produto.custoUnitario)}</span>
            <span className="text-[14px] text-muted-foreground">por unidade</span>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">Custo interno. É debitado do centro de custo de quem pede, só na entrega.</p>

          {modoEncomenda && (
            <div className="mt-5 flex items-start gap-3 rounded-3xl border border-sky/60 bg-sky-soft p-4">
              <Factory className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="font-display text-[16px] font-bold">Sob encomenda · mínimo {unidades(minEncomenda)}</p>
                <p className="mt-0.5 text-[13.5px] text-foreground/85">
                  {produto.somenteEncomenda
                    ? "Este item não tem estoque próprio: a produção é feita sob demanda, depois do alinhamento com o marketing."
                    : "Está sem estoque para pronta entrega, mas dá para encomendar: produção sob demanda, a partir da quantidade mínima."}
                </p>
              </div>
            </div>
          )}
          {indisponivel && (
            <div className="mt-5 flex items-start gap-3 rounded-3xl border border-border bg-secondary p-4">
              <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="font-display text-[16px] font-bold">{temVariacao ? `Sem estoque em ${v.rotulo}` : "Sem estoque agora"}</p>
                <p className="mt-0.5 text-[13.5px] text-foreground/85">
                  Este item está esgotado para pronta entrega e ainda não entrou na lista de encomenda.
                  {temVariacao && " Veja uma opção com saldo abaixo."}
                </p>
              </div>
            </div>
          )}

          {/* Variações */}
              {cores.length > 1 && (
                <div className="mt-6">
                  <p className="font-display text-[14.5px] font-bold">Cor: <span className="font-semibold text-muted-foreground">{v.cor?.nome}</span></p>
                  <div className="mt-2.5 flex flex-wrap gap-3">
                    {cores.map((c) => {
                      const vars = produto.variacoes.filter((x) => x.cor?.hex === c.hex);
                      const d = vars.reduce((s, x) => s + disponivel(produto, x, pedidos), 0);
                      const ativo = v.cor?.hex === c.hex;
                      return (
                        <button key={c.hex} type="button" onClick={() => escolherCor(c.hex)} aria-pressed={ativo}
                          aria-label={`${c.nome}, ${d > 0 ? `${d} disponíveis` : "esgotado"}`}
                          className="flex w-[72px] flex-col items-center gap-1.5">
                          <span className={cn("relative grid size-12 place-items-center rounded-full ring-offset-2 transition-shadow", ativo ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-primary/40")}
                            style={{ background: c.hex }}>
                            {ativo && <Check className={cn("size-5", ["#ffffff", "#efe6d2", "#c4c8d0", "#67cfee"].includes(c.hex) ? "text-foreground" : "text-white")} aria-hidden />}
                            {d <= 0 && <span className="absolute h-0.5 w-14 rotate-45 bg-destructive" aria-hidden />}
                          </span>
                          <span className={cn("text-[12px] tabular-nums", d <= 0 ? "text-destructive font-semibold" : d < (vars[0].minimo || 0) ? "font-semibold text-foreground" : "text-muted-foreground")}>
                            {d <= 0 ? "Esgotado" : `${d} disp.`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {tamanhos.length > 1 && (
                <div className="mt-5">
                  <p className="font-display text-[14.5px] font-bold">Tamanho: <span className="font-semibold text-muted-foreground">{v.tamanho}</span></p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {tamanhos.map((t) => {
                      const alvo = produto.variacoes.find((x) => x.tamanho === t && (!v.cor || x.cor?.hex === v.cor.hex));
                      const d = alvo ? disponivel(produto, alvo, pedidos) : 0;
                      const ativo = v.tamanho === t;
                      return (
                        <button key={t} type="button" disabled={!alvo} onClick={() => escolherTamanho(t)} aria-pressed={ativo}
                          aria-label={`Tamanho ${t}, ${!alvo ? "não existe nesta cor" : d > 0 ? `${d} disponíveis` : "esgotado"}`}
                          className={cn(
                            "flex h-14 min-w-[64px] flex-col items-center justify-center rounded-2xl border px-3 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                            ativo ? "border-primary bg-navy-soft" : "border-border bg-card hover:border-primary/40",
                          )}>
                          <span className={cn("font-display text-[16px] font-bold", d <= 0 && "line-through decoration-destructive decoration-2")}>{t}</span>
                          <span className={cn("text-[11.5px] tabular-nums", d <= 0 ? "font-semibold text-destructive" : "text-muted-foreground")}>
                            {!alvo ? "não há" : d <= 0 ? "esgotado" : `${d} disp.`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

          {/* Saldo da variação (só no trilho de pronta entrega) */}
          {!modoEncomenda && <QuadroSaldo produto={produto} v={v} disp={disp} situacao={sitV} temVariacao={temVariacao} />}

              {/* Personalização */}
              {opcao && (
                <section className="mt-5 rounded-3xl border border-sky/50 bg-sky-soft p-4 sm:p-5" aria-labelledby="titulo-perso">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 id="titulo-perso" className="flex items-center gap-2 font-display text-[17px] font-bold">
                      <Palette className="size-5 text-primary" aria-hidden /> Personalizar este item
                    </h2>
                    <ParPills rotulo="Personalização" tamanho="sm" valor={personalizado ? "sim" : "nao"}
                      onChange={(x) => setPersonalizado(x === "sim")}
                      opcoes={[{ valor: "nao", rotulo: "Sem personalização" }, { valor: "sim", rotulo: "Personalizado" }]} className="bg-card/70" />
                  </div>
                  <p className="mt-2 text-[13.5px] text-foreground/85">
                    {opcao.tecnica}, área de {opcao.area}. Aceita {opcao.aceita.map((a) => (a === "logo" ? "logo" : a === "nome" ? "nome" : "texto")).join(", ")}.
                    A partir de {unidades(opcao.qtdMinima)}.
                  </p>
                  {personalizado && (
                    <div className="mt-4 space-y-4">
                      <Campo rotulo="O que vai na peça" htmlFor="texto-arte" erro={erroTexto}
                        ajuda="Descreva a arte ou o texto. O designer do marketing confere antes de produzir.">
                        <textarea id="texto-arte" rows={3} value={texto} onChange={(e) => setTexto(e.target.value)}
                          placeholder={'Ex.: logo da Acme centralizado e "Tech Summit 2026" embaixo'} className={cn(classeInput, "resize-y")} />
                      </Campo>
                      <div>
                        <p className="mb-1.5 font-display text-[13.5px] font-bold">Arquivo da arte <span className="font-semibold text-muted-foreground">(opcional)</span></p>
                        {arte ? (
                          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-2.5">
                            <FileUp className="size-5 shrink-0 text-primary" aria-hidden />
                            <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{arte}</span>
                            <button type="button" onClick={() => setArte(null)} className="grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label="Remover arquivo">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-primary/30 bg-card/70 px-4 py-4 text-center hover:border-primary/60">
                            <FileUp className="size-6 text-primary" aria-hidden />
                            <span className="font-display text-[14px] font-bold text-primary">Enviar arquivo da arte</span>
                            <span className="text-[12.5px] text-muted-foreground">SVG, PDF, AI, EPS, PNG ou JPG. No protótipo o arquivo não sai do seu computador.</span>
                            <input type="file" className="sr-only" accept=".svg,.pdf,.ai,.eps,.png,.jpg,.jpeg" onChange={(e) => enviarArte(e.target.files?.[0])} />
                          </label>
                        )}
                        {erroArte && <p className="mt-1.5 flex items-start gap-1.5 text-[13px] font-semibold text-destructive" role="alert"><CircleX className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {erroArte}</p>}
                      </div>
                      <p className="flex items-start gap-2 rounded-2xl bg-card/80 px-3.5 py-3 text-[13.5px]">
                        <Timer className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        <span>A personalização soma <b>{opcao.prazoExtraDiasUteis} dias úteis</b> de produção, mais 2 de separação. Pronto a partir de <b>{dataCurta(prazoTotal)}</b>.</span>
                      </p>
                    </div>
                  )}
                </section>
              )}

          {/* Quantidade e ações */}
          <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-3">
            <div>
              <p className="mb-1.5 font-display text-[14.5px] font-bold">Quantidade</p>
              <Stepper valor={qtd} min={modoEncomenda ? minEncomenda : val.minimo} max={modoEncomenda ? Math.max(qtd + 1, minEncomenda, 9999) : val.maximo} onChange={setQtd} rotulo="Quantidade" />
            </div>
            <p className="pb-2.5 text-[13px] text-muted-foreground">
              {modoEncomenda ? `Mínimo ${unidades(minEncomenda)} por encomenda` : `${disp} disponíveis nesta opção`}
              {!modoEncomenda && noCarrinho > 0 && ` · ${noCarrinho} já no seu pedido`}
            </p>
          </div>

          {modoEncomenda ? (
            <div className="mt-5 space-y-4 rounded-3xl border border-sky/50 bg-card p-4 shadow-card sm:p-5">
              <h2 className="flex items-center gap-2 font-display text-[17px] font-bold">
                <Factory className="size-5 text-primary" aria-hidden /> Alinhar a encomenda
              </h2>
              {!valEnc.ok && tentouEnc && (
                <p className="flex items-start gap-1.5 text-[13.5px] font-semibold text-destructive" role="alert">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {valEnc.erros[0]}
                </p>
              )}
              <div>
                <p className="mb-2 font-display text-[13.5px] font-bold">Finalidade</p>
                <div role="radiogroup" aria-label="Finalidade" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(["evento", "cliente", "parceiro", "interno"] as Finalidade[]).map((fid) => {
                    const ativo = encFinalidade === fid;
                    const rot = { evento: "Evento", cliente: "Cliente", parceiro: "Parceiro", interno: "Uso interno" }[fid];
                    return (
                      <button key={fid} type="button" role="radio" aria-checked={ativo} onClick={() => setEncFinalidade(fid)}
                        className={cn("h-11 rounded-full border font-display text-[14px] font-bold transition-colors", ativo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40")}>
                        {rot}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Campo rotulo={encFinalidade === "interno" ? "Para quê (opcional)" : "Para que é a encomenda"} htmlFor="enc-destino" erro={tentouEnc ? erroDestinoEnc : null}>
                <input id="enc-destino" value={encDestino} onChange={(e) => setEncDestino(e.target.value)} placeholder="Ex.: Camisetas do time para o Tech Summit" className={classeInput} />
              </Campo>
              <Campo rotulo="Prazo desejado (opcional)" htmlFor="enc-prazo" ajuda="A equipe confirma o prazo real de produção no alinhamento.">
                <input id="enc-prazo" type="date" value={encPrazo} onChange={(e) => setEncPrazo(e.target.value)} className={cn(classeInput, "max-w-[220px]")} />
              </Campo>
              <Campo rotulo="Observações de personalização (opcional)" htmlFor="enc-obs">
                <textarea id="enc-obs" rows={3} value={encObs} onChange={(e) => setEncObs(e.target.value)} placeholder="Ex.: logo bordado no peito, nome do time nas costas" className={cn(classeInput, "resize-y")} />
              </Campo>
              <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-sky-soft px-3.5 py-3">
                <span className="text-[13.5px] text-foreground/85">{qtd} × {moeda(produto.custoUnitario)} (estimado)</span>
                <span className="font-display text-[20px] font-bold tabular-nums">{moeda(subtotal)}</span>
              </div>
              <p className="flex items-start gap-1.5 text-[13px] text-muted-foreground">
                <Factory className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                Encomenda não é retirada na hora: abre um alinhamento com o marketing. O débito em {eu.centroCustoId} {areaDoCentro(eu.centroCustoId as CentroCustoId)} acontece só na retirada.
              </p>
              <Botao tamanho="lg" className="w-full" onClick={solicitarEncomenda}>Solicitar encomenda</Botao>
            </div>
          ) : indisponivel ? (
            <div className="mt-5 rounded-3xl border border-border bg-secondary p-4 text-[13.5px] text-muted-foreground">
              Este item está esgotado para pronta entrega e não está disponível para encomenda agora.
            </div>
          ) : (
            <>
              {tentou && !val.ok && (
                <p className="mt-2 flex items-start gap-1.5 text-[13.5px] font-semibold text-destructive" role="status">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {val.erros[0]}
                </p>
              )}
              <div className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[14px] text-muted-foreground">{qtd} × {moeda(produto.custoUnitario)}</span>
                  <span className="font-display text-[24px] font-bold tabular-nums">{moeda(subtotal)}</span>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Zap className="size-4 shrink-0 text-primary" aria-hidden /> Sai na hora. Debita {eu.centroCustoId} {areaDoCentro(eu.centroCustoId as CentroCustoId)} só na retirada.
                </p>
                <div className="mt-4 hidden gap-2 sm:flex">
                  <Botao tamanho="lg" className="flex-1" onClick={() => adicionar("checkout")}>Solicitar agora</Botao>
                  <Botao tamanho="lg" variante="contorno" className="flex-1" onClick={() => adicionar()}>
                    <ShoppingBag className="size-4.5" aria-hidden /> Adicionar ao pedido
                  </Botao>
                </div>
                <div className="mt-4 sm:hidden">
                  <Botao tamanho="lg" variante="contorno" className="w-full" onClick={() => adicionar()}>
                    <ShoppingBag className="size-4.5" aria-hidden /> Adicionar ao pedido
                  </Botao>
                </div>
              </div>
              <p className="mt-3 flex items-start gap-2 text-[13.5px] text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> Retirada na {LOCAL_RETIRADA}. Avisamos quando estiver separado.
              </p>
            </>
          )}
        </div>
      </div>

      <Abas produto={produto} usos={usos} areas={areas} usosMes={usosMes.length} />

      {relacionados.length > 0 && (
        <section className="mt-10" aria-labelledby="titulo-rel">
          <h2 id="titulo-rel" className="mb-4 font-display text-[22px] font-bold">Combina com este item</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {relacionados.map((p) => <CardProduto key={p.id} produto={p} pedidos={pedidos} />)}
          </div>
        </section>
      )}

      {!indisponivel && (
        <BarraFixaMobile className="sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-muted-foreground">{qtd} × {moeda(produto.custoUnitario)}</p>
              <p className="font-display text-[19px] font-bold leading-tight tabular-nums">{moeda(subtotal)}</p>
            </div>
            {modoEncomenda
              ? <Botao tamanho="lg" onClick={solicitarEncomenda}>Solicitar encomenda</Botao>
              : <Botao tamanho="lg" onClick={() => adicionar("checkout")}>Solicitar agora</Botao>}
          </div>
        </BarraFixaMobile>
      )}
    </div>
  );
}

function GaleriaMobile({ produto, corHex, esgotado }: { produto: Produto; corHex?: string; esgotado: boolean }) {
  const [atual, setAtual] = useState(0);
  return (
    <div className="lg:hidden">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl border border-border shadow-card [scrollbar-width:none]"
        onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        aria-label="Fotos do produto, deslize para ver mais"
      >
        {produto.galeria.map((f, i) => (
          <FotoProduto key={i} produto={produto} foto={f} corHex={i === 0 ? corHex : undefined} dessaturar={esgotado} className="aspect-[4/3] w-full shrink-0 snap-center sm:aspect-[16/10]" />
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[13px] text-muted-foreground">{produto.galeria[atual]?.legenda}</p>
        <div className="flex shrink-0 gap-1.5" aria-hidden>
          {produto.galeria.map((_, i) => <span key={i} className={cn("h-2 rounded-full transition-all", i === atual ? "w-5 bg-primary" : "w-2 bg-border")} />)}
        </div>
      </div>
    </div>
  );
}

function QuadroSaldo({ produto, v, disp, situacao, temVariacao }: {
  produto: Produto; v: Variacao; disp: number; situacao: ReturnType<typeof situacaoVariacao>; temVariacao: boolean;
}) {
  const teto = Math.max(disp, v.minimo, 1);
  return (
    <div className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-[15px] font-bold">
          Estoque {temVariacao ? <>de <span className="text-primary">{v.rotulo}</span></> : "do item"}
        </p>
        <SeloSituacao situacao={situacao} />
      </div>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-secondary" role="img" aria-label={`${disp} unidades disponíveis`}>
        <span className="bg-primary" style={{ width: `${Math.min(100, (disp / teto) * 100)}%` }} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
        <Legenda cor="bg-primary" rotulo="Disponíveis agora" valor={disp} />
        <Legenda cor="bg-secondary" rotulo="Mínimo de estoque" valor={v.minimo} />
      </dl>
      <p className="mt-3 flex items-start gap-1.5 text-[12.5px] leading-relaxed text-foreground">
        <Zap className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
        Tem saldo: o pedido sai na hora. A baixa no estoque acontece na mesma hora e o custo entra no centro de custo só na retirada.
      </p>
    </div>
  );
}

function Legenda({ cor, rotulo, valor }: { cor: string; rotulo: string; valor: number }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 whitespace-nowrap text-[12.5px] text-muted-foreground"><span className={cn("size-2.5 shrink-0 rounded-sm", cor)} aria-hidden /> {rotulo}</dt>
      <dd className="font-display text-[20px] font-bold tabular-nums text-foreground">{valor}</dd>
    </div>
  );
}

type IdAba = "descricao" | "especificacoes" | "personalizacao" | "uso";

function Abas({ produto, usos, areas, usosMes }: {
  produto: Produto; usos: ReturnType<typeof usosDoProduto>; areas: CentroCustoId[]; usosMes: number;
}) {
  const [aba, setAba] = useState<IdAba>("descricao");
  const [abertos, setAbertos] = useState<IdAba[]>(["descricao"]);
  const abas: { id: IdAba; rotulo: string; conteudo: ReactNode }[] = [
    {
      id: "descricao", rotulo: "Descrição",
      conteudo: <div className="max-w-[68ch] space-y-3 text-[15px] leading-relaxed">{produto.descricaoLonga.map((p, i) => <p key={i}>{p}</p>)}</div>,
    },
    {
      id: "especificacoes", rotulo: "Especificações",
      conteudo: (
        <dl className="grid max-w-3xl overflow-hidden rounded-2xl border border-border sm:grid-cols-2">
          {produto.especificacoes.map((e, i) => (
            <div key={i} className="flex flex-col gap-0.5 border-b border-border px-4 py-3 sm:[&:nth-last-child(-n+2)]:border-b-0 last:border-b-0 sm:odd:border-r">
              <dt className="font-display text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{e.rotulo}</dt>
              <dd className="text-[14.5px] text-foreground">{e.valor}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    ...(produto.personalizacao ? [{
      id: "personalizacao" as IdAba, rotulo: "Personalização",
      conteudo: (
        <dl className="grid max-w-3xl gap-4 text-[14.5px] sm:grid-cols-2">
          <Info2 rotulo="Técnica" valor={produto.personalizacao.tecnica} />
          <Info2 rotulo="Área de impressão" valor={produto.personalizacao.area} />
          <Info2 rotulo="Quantidade mínima" valor={unidades(produto.personalizacao.qtdMinima)} />
          <Info2 rotulo="Prazo extra" valor={`${produto.personalizacao.prazoExtraDiasUteis} dias úteis depois da aprovação`} />
          <Info2 rotulo="Aceita" valor={produto.personalizacao.aceita.map((a) => ({ logo: "Logo", nome: "Nome", texto: "Texto livre" })[a]).join(", ")} />
          <Info2 rotulo="Quem confere a arte" valor="O designer do marketing, antes de mandar para produção" />
        </dl>
      ),
    }] : []),
    {
      id: "uso", rotulo: "Histórico de uso",
      conteudo: usos.length ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <p className="font-display text-[16px] font-bold">Usado em {usosMes} {usosMes === 1 ? "evento" : "eventos"} este mês</p>
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border">
              {usos.slice(0, 6).map((u, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-12 shrink-0 font-display text-[13px] font-bold tabular-nums text-muted-foreground">{dataCurta(u.em)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold">{u.evento}</span>
                    <span className="text-[12.5px] text-muted-foreground">{areaDoCentro(u.centroCustoId)}</span>
                  </span>
                  <span className="shrink-0 font-display text-[14px] font-bold tabular-nums">{u.qtd} un.</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-[16px] font-bold">Quem mais pediu</p>
            <p className="mt-1 text-[13.5px] text-muted-foreground">Áreas que usaram este item nos últimos 90 dias.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {areas.map((a) => <Selo key={a} tom="info" className="text-[13px]">{areaDoCentro(a)}</Selo>)}
            </div>
          </div>
        </div>
      ) : <p className="text-[14.5px] text-muted-foreground">Ainda ninguém pediu este item. Ele pode ser uma boa novidade para o seu próximo evento.</p>,
    },
  ];

  return (
    <section className="mt-10" aria-label="Detalhes do produto">
      <div className="hidden md:block">
        <div role="tablist" className="flex gap-1 border-b border-border">
          {abas.map((a) => (
            <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} id={`aba-${a.id}`} aria-controls={`painel-${a.id}`} onClick={() => setAba(a.id)}
              className={cn("-mb-px h-12 border-b-[3px] px-4 font-display text-[15px] font-bold", aba === a.id ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {a.rotulo}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`painel-${aba}`} aria-labelledby={`aba-${aba}`} className="pt-6">
          {abas.find((a) => a.id === aba)?.conteudo}
        </div>
      </div>
      <div className="space-y-2.5 md:hidden">
        {abas.map((a) => {
          const aberto = abertos.includes(a.id);
          return (
            <div key={a.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <button type="button" aria-expanded={aberto} onClick={() => setAbertos((x) => (aberto ? x.filter((y) => y !== a.id) : [...x, a.id]))}
                className="flex h-14 w-full items-center justify-between px-4 font-display text-[16px] font-bold">
                {a.rotulo} <ChevronDown className={cn("size-5 transition-transform motion-reduce:transition-none", aberto && "rotate-180")} aria-hidden />
              </button>
              {aberto && <div className="border-t border-border p-4">{a.conteudo}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Info2({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="font-display text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{rotulo}</dt>
      <dd className="mt-0.5">{valor}</dd>
    </div>
  );
}
