/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/ArteStep.tsx (card Carrossel, PranchetaAjustes, lista de
 *   pranchetas) e src/lib/compose/template-c.ts (capa, slideCor, slideCta) @ commit 4fcf254 /
 *   leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Arte" (Carrossel)
 *   e ponto confuso 11 (cor de fundo do slide entra).
 *
 * CARROSSEL por prancheta, item 5.5c (linhas 58 a 64 do inventário):
 *  - TiraPranchetas: capa · slides de cor · chamada final, embaixo da prévia,
 *    com "+ Novo slide", excluir e o aviso de prancheta sem título.
 *  - TextoPrancheta: título e subtítulo do slide, título e botão da chamada.
 *  - AjustesPranchetaCarrossel: Básico (posição, cor ou fundo do slide) e
 *    Avançado (etiqueta acima do título, fonte, cores, tamanhos, X/Y,
 *    anel decorativo, foco da imagem, logo própria).
 *  - ConfirmarMontar: "Montar o carrossel com a IA" substitui tudo.
 */
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ColorHexInput } from "../ColorHexInput";
import { campo } from "../NovaTarefaDialog";
import {
  TAMANHOS_CARROSSEL,
  TAMANHO_KICKER_PADRAO,
  coresBotaoChamada,
  fundoClaroArte,
  passoTamanhoFonte,
  pranchetaEntraNaArte,
} from "../../store/regras";
import type { Marca } from "../../store/tipos";
import {
  FOCOS_IMAGEM,
  adicionarSlide,
  ajustesDe,
  comAjustes,
  comChamada,
  comSlide,
  excluirSlide,
  idsPranchetas,
  rotuloPrancheta,
  tipoPrancheta,
  type AjustesPrancheta,
  type ConfigCarrossel,
} from "./arte-config";
import { CampoPct, GradePosicaoLogo, Grupo, SeletorFonte, Stepper, TamanhoLogoPmg } from "./controles-arte";
import { desenharArte, type EntradaArte } from "./desenhar-arte";
import { ParPilulas, Pilula, acaoLeve, pilulaAcao } from "./partes";

type MudarCarrossel = (c: ConfigCarrossel) => void;

// ─── Tira de pranchetas (embaixo da prévia) ───────────────────────────────

export function TiraPranchetas({
  entrada,
  onMudar,
  bloqueada,
}: {
  entrada: EntradaArte;
  onMudar: MudarCarrossel;
  bloqueada: boolean;
}) {
  const c = entrada.cfg.carrossel;
  const ids = idsPranchetas(c);
  const principal = entrada.marca.cores[0]?.hex ?? "#36499b";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-[11px] font-bold text-foreground">Pranchetas ({ids.length})</p>
        <button
          type="button"
          disabled={bloqueada}
          onClick={() => onMudar(adicionarSlide(c, principal))}
          className="inline-flex items-center gap-1 rounded-full bg-sky-soft px-2.5 py-1 font-display text-[11px] font-bold text-primary transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Plus aria-hidden className="h-3 w-3" /> Novo slide
        </button>
      </div>
      <ul className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Pranchetas do carrossel">
        {ids.map((id) => {
          const tipo = tipoPrancheta(id);
          const ativa = c.editando === id;
          const rotulo = rotuloPrancheta(c, id);
          const titulo = tipo === "slide" ? c.slides.find((s) => s.id === id)?.titulo ?? "" : tipo === "cta" ? c.cta.titulo : entrada.titulo;
          const entra = pranchetaEntraNaArte(tipo, titulo);
          const svg = desenharArte({ ...entrada, id: `tira-${id}` }, { prancheta: id });
          return (
            <li key={id} className="relative w-16 shrink-0">
              <button
                type="button"
                disabled={bloqueada}
                aria-pressed={ativa}
                aria-label={`Editar ${rotulo}${entra ? "" : " (sem título, fica de fora da arte)"}`}
                onClick={() => onMudar({ ...c, editando: id })}
                className={cn(
                  "block w-full overflow-hidden rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5",
                  ativa ? "border-accent shadow-card" : "border-transparent",
                  !entra && "opacity-55",
                )}
              >
                <span aria-hidden className="block aspect-[4/5] [&>svg]:block [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
              </button>
              <span className={cn("mt-1 block truncate text-center text-[10px]", ativa ? "font-bold text-primary" : "text-muted-foreground")}>{rotulo}</span>
              {tipo === "slide" && (
                <button
                  type="button"
                  disabled={bloqueada}
                  onClick={() => onMudar(excluirSlide(c, id))}
                  aria-label={`Excluir ${rotulo}`}
                  title={`Excluir ${rotulo}`}
                  className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-card text-muted-foreground shadow-card transition-colors hover:text-destructive"
                >
                  <X aria-hidden className="h-3 w-3" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-1 text-[10px] text-muted-foreground">Clique numa prancheta para editar. Slide ou chamada sem título fica de fora da arte final.</p>
    </div>
  );
}

// ─── Texto do slide e da chamada final ────────────────────────────────────

export function TextoPrancheta({ c, onMudar }: { c: ConfigCarrossel; onMudar: MudarCarrossel }) {
  const id = c.editando;
  const tipo = tipoPrancheta(id);
  if (tipo === "capa") return null;
  const rotulo = rotuloPrancheta(c, id);

  if (tipo === "cta") {
    return (
      <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold text-muted-foreground">Título da chamada final</span>
          <textarea value={c.cta.titulo} onChange={(e) => onMudar(comChamada(c, { titulo: e.target.value }))} rows={2} placeholder="Ex.: Vamos conversar sobre **o seu cenário**?" className={cn(campo, "mt-1 resize-none")} />
          {!c.cta.titulo.trim() && <span className="mt-1 block text-[11px] font-semibold text-warning">Sem título, a chamada final fica de fora da arte.</span>}
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-muted-foreground">Texto do botão (opcional)</span>
          <input value={c.cta.botaoTexto} onChange={(e) => onMudar(comChamada(c, { botaoTexto: e.target.value }))} placeholder="Ex.: Fale com nossos especialistas" className={cn(campo, "mt-1")} />
        </label>
      </div>
    );
  }

  const slide = c.slides.find((s) => s.id === id);
  if (!slide) return null;
  return (
    <div className="mt-1.5 space-y-2">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold text-muted-foreground">Título do {rotulo.toLowerCase()}</span>
          <textarea value={slide.titulo} onChange={(e) => onMudar(comSlide(c, id, { titulo: e.target.value }))} rows={2} placeholder="Ex.: O problema que **ninguém vê**" className={cn(campo, "mt-1 resize-none")} />
          {!slide.titulo.trim() && <span className="mt-1 block text-[11px] font-semibold text-warning">Sem título, este slide fica de fora da arte.</span>}
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-muted-foreground">Subtítulo (opcional)</span>
          <textarea value={slide.subtitulo} onChange={(e) => onMudar(comSlide(c, id, { subtitulo: e.target.value }))} rows={2} placeholder="Pode ficar vazio" className={cn(campo, "mt-1 resize-none")} />
        </label>
      </div>
      <button type="button" onClick={() => onMudar(excluirSlide(c, id))} className={cn(acaoLeve, "hover:text-destructive")}>
        <Trash2 aria-hidden className="h-3.5 w-3.5" /> Excluir este slide
      </button>
    </div>
  );
}

/** "Montar o carrossel com a IA" substitui capa, slides e chamada: pede confirmação (linha 64). */
export function ConfirmarMontar({ onConfirmar, onCancelar }: { onConfirmar: () => void; onCancelar: () => void }) {
  return (
    <div role="alertdialog" aria-labelledby="montar-titulo" className="animate-rise mt-2 flex flex-wrap items-center gap-3 rounded-2xl border border-warning/40 bg-warning-soft px-4 py-3">
      <p id="montar-titulo" className="min-w-[12rem] flex-1 text-xs text-foreground/85">
        <span className="font-display font-bold text-primary">Substituir o carrossel?</span> A IA reescreve a capa, os slides e a chamada final. O que você escreveu se perde.
      </p>
      <button type="button" onClick={onConfirmar} className={pilulaAcao}>
        Substituir tudo
      </button>
      <button type="button" onClick={onCancelar} className={pilulaAcao}>
        Manter o que está
      </button>
    </div>
  );
}

// ─── Ajustes da prancheta (Básico | Avançado) ─────────────────────────────

/** Cor opcional: vazio = automática (a do template); "usar automática" volta ao padrão. */
function CorOpcional({
  rotuloCor,
  valor,
  padrao,
  paleta,
  onMudar,
}: {
  rotuloCor: string;
  valor: string;
  padrao: string;
  paleta: Marca["cores"];
  onMudar: (hex: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground">
          {rotuloCor}
          {!valor && " (automática)"}
        </span>
        {valor && (
          <button type="button" onClick={() => onMudar("")} className="text-[10px] font-semibold text-primary underline-offset-2 hover:underline">
            usar automática
          </button>
        )}
      </div>
      <div className="mt-1">
        <ColorHexInput rotulo={rotuloCor} value={valor || padrao} onChange={onMudar} paleta={paleta} />
      </div>
    </div>
  );
}

export function AjustesPranchetaCarrossel({
  modo,
  c,
  onMudar,
  marca,
  temImagem,
}: {
  modo: "basico" | "avancado";
  c: ConfigCarrossel;
  onMudar: MudarCarrossel;
  marca: Marca;
  temImagem: boolean;
}) {
  const id = c.editando;
  const tipo = tipoPrancheta(id);
  const rotulo = rotuloPrancheta(c, id);
  const aj = ajustesDe(c, id);
  const mudarAj = (p: Partial<AjustesPrancheta>) => onMudar(comAjustes(c, id, p));
  const paleta = marca.cores;
  const principal = paleta[0]?.hex ?? "#36499b";
  const slide = tipo === "slide" ? c.slides.find((s) => s.id === id) : undefined;
  const corFundoSlide = slide?.fundo.tipo === "cor" ? slide.fundo.hex : marca.fundos.find((f) => slide?.fundo.tipo === "brandkit" && f.id === slide.fundo.fundoId)?.hex ?? principal;
  // Cor automática do texto, como o template-c decide.
  const corAuto = tipo === "capa" ? "#ffffff" : tipo === "cta" ? principal : fundoClaroArte(corFundoSlide) ? principal : "#ffffff";
  const tamanhos = TAMANHOS_CARROSSEL[tipo];
  const temFoto = (tipo === "capa" && temImagem) || slide?.fundo.tipo === "brandkit" || (tipo === "cta" && Boolean(c.cta.fundoId));
  const semAnel = tipo === "capa" || slide?.fundo.tipo === "brandkit" || (tipo === "cta" && Boolean(c.cta.fundoId));

  const cabecalho = (
    <p className="rounded-2xl bg-navy-soft px-3 py-2 text-[11px] text-primary">
      Ajustes de <span className="font-bold">{rotulo}</span>. Escolha outra prancheta na tira embaixo da prévia.
    </p>
  );

  if (modo === "basico") {
    return (
      <div className="space-y-5">
        {cabecalho}
        <Grupo titulo="Posição do texto" dica="Clique de novo para voltar à posição automática desta prancheta.">
          <div className="flex flex-wrap gap-2">
            {(["topo", "centro", "rodape"] as const).map((p) => {
              const ativa = aj.posicao === p && !aj.yPct;
              return (
                <Pilula key={p} ativa={ativa} onClick={() => mudarAj({ posicao: ativa ? null : p, xPct: "", yPct: "" })}>
                  {p === "topo" ? "Topo" : p === "centro" ? "Centro" : "Rodapé"}
                </Pilula>
              );
            })}
          </div>
        </Grupo>

        {tipo === "capa" && <p className="text-[11px] text-muted-foreground">O fundo da capa é a imagem escolhida acima, com o véu da marca por cima.</p>}

        {slide && (
          <Grupo titulo="Fundo do slide" dica="Slide novo nasce na cor principal da marca.">
            {marca.fundos.length > 0 && (
              <ParPilulas
                rotulo="Tipo de fundo do slide"
                opcoes={[
                  { id: "cor", label: "Cor" },
                  { id: "brandkit", label: "Fundo do Brand Kit" },
                ]}
                valor={slide.fundo.tipo}
                onMudar={(v) =>
                  onMudar(comSlide(c, id, { fundo: v === "cor" ? { tipo: "cor", hex: corFundoSlide } : { tipo: "brandkit", fundoId: marca.fundos[0].id } }))
                }
              />
            )}
            <div className="mt-2.5">
              {slide.fundo.tipo === "cor" ? (
                <ColorHexInput rotulo="Cor de fundo do slide" value={slide.fundo.hex} onChange={(hex) => onMudar(comSlide(c, id, { fundo: { tipo: "cor", hex } }))} paleta={paleta} />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {marca.fundos.map((f) => (
                    <Pilula
                      key={f.id}
                      ativa={slide.fundo.tipo === "brandkit" && slide.fundo.fundoId === f.id}
                      onClick={() => onMudar(comSlide(c, id, { fundo: { tipo: "brandkit", fundoId: f.id } }))}
                    >
                      <span aria-hidden className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: f.hex }} /> {f.label}
                    </Pilula>
                  ))}
                </div>
              )}
            </div>
          </Grupo>
        )}

        {tipo === "cta" && (
          <Grupo titulo="Fundo da chamada final">
            <div className="flex flex-wrap gap-2">
              <Pilula ativa={c.cta.fundoId === null} onClick={() => onMudar(comChamada(c, { fundoId: null }))}>
                <span aria-hidden className="h-3.5 w-3.5 rounded-full border border-black/10 bg-[#f2f2f0]" /> Fundo claro do template
              </Pilula>
              {marca.fundos.map((f) => (
                <Pilula key={f.id} ativa={c.cta.fundoId === f.id} onClick={() => onMudar(comChamada(c, { fundoId: f.id }))}>
                  <span aria-hidden className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: f.hex }} /> {f.label}
                </Pilula>
              ))}
            </div>
          </Grupo>
        )}
      </div>
    );
  }

  const botao = coresBotaoChamada(paleta, "", "");
  return (
    <div className="space-y-5">
      {cabecalho}
      <Grupo titulo="Etiqueta acima do título" dica="Texto curto em maiúsculas, acima do título desta prancheta.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] text-muted-foreground">Texto da etiqueta</span>
            <input value={aj.kicker} onChange={(e) => mudarAj({ kicker: e.target.value })} placeholder="Ex.: GOVERNANÇA DE DADOS" className={cn(campo, "mt-1")} />
          </label>
          <SeletorFonte rotuloCampo="Fonte da etiqueta" valor={aj.kickerFonte} padrao="Padrão do template (Open Sans)" onMudar={(v) => mudarAj({ kickerFonte: v })} />
          <CorOpcional rotuloCor="Cor da etiqueta" valor={aj.kickerCor} padrao={corAuto} paleta={paleta} onMudar={(hex) => mudarAj({ kickerCor: hex })} />
          <Stepper
            rotuloCampo="Tamanho da etiqueta"
            valor={aj.kickerTamanho}
            padrao={TAMANHO_KICKER_PADRAO}
            onMudar={(s) => mudarAj({ kickerTamanho: passoTamanhoFonte(aj.kickerTamanho, TAMANHO_KICKER_PADRAO, s) })}
            onPadrao={() => mudarAj({ kickerTamanho: undefined })}
          />
        </div>
      </Grupo>

      <Grupo titulo="Tipografia">
        <div className="grid gap-3 sm:grid-cols-3">
          <SeletorFonte rotuloCampo="Fonte do título" valor={aj.fonteTitulo} padrao="Padrão do template (Dosis)" onMudar={(v) => mudarAj({ fonteTitulo: v })} />
          <CorOpcional rotuloCor="Cor do título" valor={aj.corTitulo} padrao={corAuto} paleta={paleta} onMudar={(hex) => mudarAj({ corTitulo: hex })} />
          {tipo !== "cta" && <CorOpcional rotuloCor="Cor do subtítulo" valor={aj.corSubtitulo} padrao={aj.corTitulo || corAuto} paleta={paleta} onMudar={(hex) => mudarAj({ corSubtitulo: hex })} />}
        </div>
      </Grupo>

      <Grupo titulo="Tamanhos">
        <div className="flex flex-wrap gap-6">
          <Stepper
            rotuloCampo="Tamanho do título"
            valor={aj.tamanhoTitulo}
            padrao={tamanhos.titulo}
            onMudar={(s) => mudarAj({ tamanhoTitulo: passoTamanhoFonte(aj.tamanhoTitulo, tamanhos.titulo, s) })}
            onPadrao={() => mudarAj({ tamanhoTitulo: undefined })}
          />
          {tipo !== "cta" && (
            <Stepper
              rotuloCampo="Tamanho do subtítulo"
              valor={aj.tamanhoSubtitulo}
              padrao={tamanhos.subtitulo}
              onMudar={(s) => mudarAj({ tamanhoSubtitulo: passoTamanhoFonte(aj.tamanhoSubtitulo, tamanhos.subtitulo, s) })}
              onPadrao={() => mudarAj({ tamanhoSubtitulo: undefined })}
            />
          )}
        </div>
      </Grupo>

      <Grupo titulo="Posição do texto" dica="Em % da prancheta. Vazio = automático. Largura muda quantas letras cabem por linha.">
        <div className="flex flex-wrap gap-3">
          <CampoPct rotuloCampo="X %" valor={aj.xPct} onMudar={(v) => mudarAj({ xPct: v })} />
          <CampoPct rotuloCampo="Y %" valor={aj.yPct} onMudar={(v) => mudarAj({ yPct: v })} />
          <CampoPct rotuloCampo="Largura %" valor={aj.larguraPct} onMudar={(v) => mudarAj({ larguraPct: v })} />
        </div>
      </Grupo>

      {!semAnel && (
        <Grupo titulo="Anel decorativo">
          <ParPilulas
            rotulo="Anel decorativo"
            opcoes={[
              { id: "com", label: "Com anel" },
              { id: "sem", label: "Sem anel" },
            ]}
            valor={aj.mostrarAnel ? "com" : "sem"}
            onMudar={(v) => mudarAj({ mostrarAnel: v === "com" })}
          />
        </Grupo>
      )}

      {temFoto && (
        <Grupo titulo="Foco da imagem" dica="Qual parte da imagem fica à vista quando ela é cortada.">
          <div className="flex flex-wrap gap-2">
            {FOCOS_IMAGEM.map((f) => {
              const ativo = (aj.foco ?? "centro") === f.valor;
              return (
                <Pilula key={f.valor} ativa={ativo} onClick={() => mudarAj({ foco: f.valor === "centro" ? null : f.valor })}>
                  {f.label}
                </Pilula>
              );
            })}
          </div>
        </Grupo>
      )}

      {tipo === "cta" && (
        <Grupo titulo="Cores do botão" dica={`Sem escolha, o botão sai como o compositor desenha: fundo ${botao.fundo}, texto ${botao.texto}.`}>
          <div className="flex flex-wrap gap-4">
            <CorOpcional rotuloCor="Fundo do botão" valor={c.cta.botaoCor} padrao={botao.fundo} paleta={paleta} onMudar={(hex) => onMudar(comChamada(c, { botaoCor: hex }))} />
            <CorOpcional rotuloCor="Texto do botão" valor={c.cta.botaoCorTexto} padrao={botao.texto} paleta={paleta} onMudar={(hex) => onMudar(comChamada(c, { botaoCorTexto: hex }))} />
          </div>
        </Grupo>
      )}

      <Grupo titulo="Logo desta prancheta">
        <ParPilulas
          rotulo="Logo desta prancheta"
          opcoes={[
            { id: "herda", label: "Logo do carrossel" },
            { id: "propria", label: "Logo própria" },
          ]}
          valor={aj.logoPropria ? "propria" : "herda"}
          onMudar={(v) => mudarAj({ logoPropria: v === "propria" })}
        />
        {aj.logoPropria && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                Versão
                <select
                  value={aj.logoId ?? ""}
                  onChange={(e) => mudarAj({ logoId: e.target.value || null })}
                  className="h-8 rounded-xl border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
                >
                  <option value="">Automática (branca em fundo escuro)</option>
                  {marca.logos.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
              <ParPilulas
                rotulo="Exibir logo nesta prancheta"
                opcoes={[
                  { id: "com", label: "Com logo" },
                  { id: "sem", label: "Sem logo" },
                ]}
                valor={aj.logoOculto ? "sem" : "com"}
                onMudar={(v) => mudarAj({ logoOculto: v === "sem" })}
              />
            </div>
            <div className="flex flex-wrap items-start gap-5">
              <GradePosicaoLogo valor={aj.logoPosicao} onMudar={(v) => mudarAj({ logoPosicao: v })} />
              <TamanhoLogoPmg valor={aj.logoTamanho} tamanhos={marca.tamanhosLogo} onMudar={(v) => mudarAj({ logoTamanho: v })} />
            </div>
          </div>
        )}
      </Grupo>
    </div>
  );
}
