// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: src/components/estudio/DirecaoCriativaStep.tsx + ArteStep.tsx +
//   AgenteMolecula.tsx + ParecerTriagem/analisar-pedido + src/lib/estudio-fonts.ts
//   + composicao-types.ts/ComposicaoInput @ leitura read-only 2026-10
//   (RODADA 6 de refino).
// Fonte da verdade = Lovable/clone real. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
//   (seção "Fonte da imagem vira a prévia vazia (rodada 6)").
//
// O QUE A RODADA 6 FAZ (a ÚNICA mudança desta rodada):
//  OPÇÃO A — A FONTE DA IMAGEM VIRA A PRÓPRIA PRÉVIA VAZIA.
//    O usuário rejeitou a fonte da imagem EMBAIXO da prévia (rodada 5): ficava
//    enterrada. Novo modelo:
//    - Enquanto NÃO há imagem escolhida/gerada, o PRÓPRIO quadro da prévia (que
//      já muda de aspecto Feed 4:5 / Story 9:16) É o seletor de fonte: três zonas
//      grandes e convidativas PREENCHENDO o quadro — "Arrastar ou enviar imagem"
//      (Upload), "Gerar com IA" (Gerar), "Buscar no acervo" (Acervo). Com uma
//      dica sutil de que o título/subtítulo vão renderizar SOBRE a imagem.
//    - Ao escolher a fonte, o estado assíncrono dela acontece NO MESMO quadro:
//      Upload → spinner discreto; Gerar → símbolo IaDigisystem COMPLETO + progresso
//      no quadro, DEPOIS a grade de candidatas ("clique para usar" + anel) dentro/
//      sobre o quadro; Acervo → grade de skeletons com a forma do card final +
//      pills de termos + "Buscar mais" acessíveis desse estado no quadro.
//    - Quando a imagem é escolhida/gerada, ela (ou o loading, depois o resultado)
//      SUBSTITUI o estado de três zonas NO MESMO QUADRO — a fonte vive exatamente
//      onde o resultado aparece, zero desconexão.
//    - Afordância DISCRETA "Trocar imagem" (botão pequeno num canto da prévia,
//      quando já existe imagem) reativa o seletor de três zonas (ou reabre a fonte
//      ativa), sem layout shift.
//    - NÃO HÁ MAIS área de fonte da imagem ABAIXO da prévia. A antiga tira/segmented
//      control de Upload/Gerar/Acervo que ficava embaixo foi REMOVIDA.
//    - Sem layout shift entre os estados (seletor vazio → loading → picker de
//      candidatas → imagem final): o aspecto do quadro é reservado. Respeita
//      prefers-reduced-motion.
//    - CARROSSEL (C): o seletor in-frame vale para a prancheta ATUAL (o navegador
//      ‹1/N› continua na prévia); "montar carrossel com a IA" segue no agente.
//    - Pilha da coluna de Arte segue enxuta: Estilo (segmented, topo) → Formato
//      Feed/Story → a PRÉVIA-que-é-também-a-fonte → (picker aparece in-frame ao
//      gerar) → ações de finalizar/exportar. Nada enterrado embaixo.
//
// PRESERVADO das rodadas anteriores (não regredir): ok-por-padrão + Editar em
// legenda/hashtags/CTA; os 4 estados assíncronos in-context sem layout shift;
// loader discreto × símbolo cheio + cartão de comparação; toggle de redução de
// movimento + @media; agente como único centro de comando de IA (texto E imagem)
// com outside-click + Esc; prévia-no-topo-como-resultado; seletor ‹1/N› do
// carrossel; os 3 passos (alternativa D) com a personalização avançada como
// DESVIO OPCIONAL (não um passo), gaveta redimensionável + prévia ao lado, por
// prancheta só no carrossel; Revisar mantém o Parecer da IA (símbolo cheio);
// stepper minimalista; rótulos enxutos "na arte"; "Estilo da arte" reposicionado
// no topo; Feed/Story; picker de candidatas; "montar carrossel"; controles MED na
// gaveta (degradê/logo/tipografia/exportar); laranja #ff6d2d SÓLIDO (sem degradê)
// nos indicadores de UI ativos; prévia nunca é um bloco cinza.
//
// RISCO QUE A INVESTIGAÇÃO APONTOU (segue valendo): o ComposicaoInput carrega
// TODOS os campos; qualquer campo que a UI deixar de popular CAI em default
// SILENCIOSAMENTE (sem erro). A implementação precisa continuar populando todos.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IaDigisystem } from "../IaDigisystem";
import { cn } from "../lib/utils";

/* ============================================================
   Mock data (sem backend). Copy real em português, dentro da marca.
   ============================================================ */

const LEGENDA_MOCK =
  "Governança de dados não é sobre guardar tudo. É sobre encontrar o que importa, " +
  "no momento certo, com segurança. Na Digisystem, a gente estrutura a informação " +
  "da sua operação para que a decisão venha do dado, não do achismo. Quando a base " +
  "está organizada, a equipe para de caçar planilha e volta a pensar no negócio.";

const HASHTAGS_MOCK = [
  "#Digisystem",
  "#Parceriaquetransforma",
  "#Tecnologia",
  "#Governançadedados",
  "#Inteligênciadedados",
];

const CTA_MOCK = "Fale com um especialista da Digisystem e organize seus dados.";

type ModoReduzido = boolean;

/* ============================================================
   Templates da arte. A/B têm um título/subtítulo; C (carrossel) tem várias
   pranchetas (slidesCor[]), cada uma com seu texto, cor, CTA e foco.
   ============================================================ */

type TemplateId = "A" | "B" | "C";

const TEMPLATES: { id: TemplateId; nome: string; curto: string; desc: string }[] = [
  { id: "A", nome: "Foto + overlay", curto: "A", desc: "Foto de fundo com faixa de texto por cima." },
  { id: "B", nome: "Bandas / sólido", curto: "B", desc: "Fundo sólido da marca com bandas de cor." },
  { id: "C", nome: "Carrossel", curto: "C", desc: "Várias pranchetas (capa, miolo, CTA)." },
];

// Conteúdo da ARTE (texto que renderiza SOBRE a imagem) — um por template A/B.
type ConteudoArte = { etiqueta: string; titulo: string; subtitulo: string };

const CONTEUDO_AB_MOCK: ConteudoArte = {
  etiqueta: "Governança de dados",
  titulo: "Dado organizado, decisão melhor",
  subtitulo: "A base certa tira a equipe do achismo.",
};

// Carrossel: 3 pranchetas mock, cada uma com conteúdo, cor, CTA e foco.
type FocoImagem = "centro" | "topo" | "base" | "esq" | "dir";
type Prancheta = ConteudoArte & {
  papel: string;
  cor: string;
  ctaTexto: string;
  ctaFundo: string;
  ctaTexto_cor: string;
  foco: FocoImagem;
};

const PRANCHETAS_MOCK: Prancheta[] = [
  {
    papel: "Capa",
    etiqueta: "Governança de dados",
    titulo: "Dado organizado, decisão melhor",
    subtitulo: "Por que a base certa muda o jogo.",
    cor: "linear-gradient(150deg, var(--navy), oklch(0.5 0.12 250) 60%, var(--sky))",
    ctaTexto: "",
    ctaFundo: "#ff6d2d",
    ctaTexto_cor: "#ffffff",
    foco: "centro",
  },
  {
    papel: "Miolo",
    etiqueta: "O problema",
    titulo: "A equipe caça planilha o dia todo",
    subtitulo: "Sem estrutura, o dado vira ruído.",
    cor: "linear-gradient(150deg, oklch(0.5 0.12 250), var(--accent))",
    ctaTexto: "",
    ctaFundo: "#ff6d2d",
    ctaTexto_cor: "#ffffff",
    foco: "centro",
  },
  {
    papel: "CTA",
    etiqueta: "Próximo passo",
    titulo: "Organize seus dados com a Digisystem",
    subtitulo: "Fale com um especialista.",
    cor: "linear-gradient(150deg, var(--accent), oklch(0.75 0.14 60))",
    ctaTexto: "Fale com um especialista",
    ctaFundo: "#36499b",
    ctaTexto_cor: "#ffffff",
    foco: "centro",
  },
];

// ~16+ famílias do compositor real (src/lib/estudio-fonts.ts → ESTUDIO_FONTES).
// Mock representativo — só rótulos. Na implementação real, fiar com ESTUDIO_FONTES.
const ESTUDIO_FONTES = [
  "Dosis", "Open Sans", "Inter", "Roboto", "Montserrat", "Poppins", "Lato",
  "Nunito", "Raleway", "Work Sans", "Oswald", "Bebas Neue", "Playfair Display",
  "Merriweather", "Rubik", "Sora",
];

// Logos do Brand Kit (mock). No real, vêm do brand_kit (principal + outros).
const LOGOS_BRAND = [
  { id: "principal", nome: "Principal (azul)" },
  { id: "branco", nome: "Monocromático branco" },
  { id: "simbolo", nome: "Símbolo isolado" },
];

// Termos sugeridos do acervo (mock). No real, vêm do contexto/tema do post.
const TERMOS_ACERVO = ["dados", "equipe", "tecnologia", "reunião", "dashboard", "nuvem"];

type FormatoArte = "feed" | "story";

/* ============================================================
   Topo: barra do protótipo com o toggle de redução de movimento (Req. 12.3)
   ============================================================ */

function BarraProto({
  reduzido,
  setReduzido,
}: {
  reduzido: ModoReduzido;
  setReduzido: (v: ModoReduzido) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
      <div className="flex items-center gap-3">
        <IaDigisystem size={28} estado="vivo" />
        <div>
          <h1 className="font-display text-lg font-bold leading-none text-navy">
            Estúdio · Conteúdo + Arte
          </h1>
          <p className="text-xs text-muted-foreground">
            Protótipo de refino de UX — revisar, não montar do zero.
          </p>
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-navy">
        <input
          type="checkbox"
          checked={reduzido}
          onChange={(e) => setReduzido(e.target.checked)}
          className="h-3.5 w-3.5 accent-[color:var(--accent)]"
        />
        Redução de movimento
      </label>
    </div>
  );
}

/* ============================================================
   INDICADOR DE ETAPAS — RODADA 5: MINIMALISTA. Uma linha só:
   "Etapa 2/3 · Conteúdo" + trilho de progresso laranja SÓLIDO bem fino.
   Footprint vertical drasticamente reduzido (antes era um cartão alto).
   Layout estável, laranja #ff6d2d sólido (sem degradê), reduced-motion.
   ============================================================ */

const ETAPAS = ["Contexto", "Conteúdo", "Revisar/Enviar"] as const;

function IndicadorEtapas({ etapaAtiva }: { etapaAtiva: number }) {
  const pct = ((etapaAtiva + 1) / ETAPAS.length) * 100;
  return (
    <div className="flex items-center gap-3 px-1">
      <p className="shrink-0 font-display text-xs font-bold text-navy">
        Etapa <span className="text-accent">{etapaAtiva + 1}</span>/{ETAPAS.length}
      </p>
      <span className="shrink-0 font-display text-xs font-semibold text-muted-foreground">
        · {ETAPAS[etapaAtiva]}
      </span>
      <div className="ec-mini-trilho flex-1">
        <div
          className="ec-mini-fill"
          style={{ ["--ec-mini-pct" as string]: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* Controle de demonstração (só do protótipo): simular a etapa ativa. */
function SimularEtapa({
  etapaAtiva,
  setEtapaAtiva,
}: {
  etapaAtiva: number;
  setEtapaAtiva: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
      <span className="text-muted-foreground">Simular etapa:</span>
      {ETAPAS.map((rot, i) => (
        <button
          key={rot}
          type="button"
          onClick={() => setEtapaAtiva(i)}
          className={cn(
            "rounded-full border px-2.5 py-1 transition-colors",
            etapaAtiva === i
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-background text-muted-foreground hover:border-navy/40",
          )}
        >
          {rot}
        </button>
      ))}
    </div>
  );
}

function CheckMini() {
  return (
    <svg viewBox="0 0 16 16" width={11} height={11} aria-hidden>
      <path
        d="M3 8.5l3 3 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================
   COMPONENTE DE TEXTO — "ok por padrão" + Editar (Req. 2.1 / 2.2)
   Sem botões de IA ao lado (Req. 11.2). O "Editar" fica SEMPRE ancorado no canto
   direito do cabeçalho (âncora fixa, não se desloca entre estados).
   ============================================================ */

type EstadoComp = "ok" | "editando";

function BlocoTexto({
  titulo,
  subtitulo,
  estado,
  onEditar,
  onConfirmar,
  acabouDeRegenerar,
  children,
  editor,
}: {
  titulo: string;
  subtitulo?: string;
  estado: EstadoComp;
  onEditar: () => void;
  onConfirmar: () => void;
  acabouDeRegenerar: boolean;
  children: React.ReactNode;
  editor: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-card p-3 shadow-card transition-colors",
        estado === "editando" ? "border-accent/60" : "border-border",
        acabouDeRegenerar && "ec-ok-flash",
      )}
    >
      <header className="mb-1.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-bold text-navy">{titulo}</h3>
            {estado === "ok" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-[color:var(--success)]">
                <CheckMini /> ok
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                editando
              </span>
            )}
          </div>
          {subtitulo && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitulo}</p>
          )}
        </div>
        <div className="shrink-0">
          {estado === "ok" ? (
            <button
              type="button"
              onClick={onEditar}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-navy transition-colors hover:border-navy/40 hover:bg-secondary"
            >
              Editar
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirmar}
              className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-navy-foreground transition-colors hover:bg-navy/90"
            >
              Confirmar
            </button>
          )}
        </div>
      </header>
      <div>{estado === "ok" ? children : editor}</div>
    </section>
  );
}

function RedeChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-sky-soft px-2 py-0.5 text-[11px] font-semibold text-navy">
      {children}
    </span>
  );
}

/* Tag enxuta "na arte" (rodada 5, item 2): ícone pequeno + rótulo curto, no
   lugar da frase longa "Aparece sobre a imagem / texto da arte". */
function TagNaArte() {
  return (
    <span
      title="Este texto é desenhado sobre a imagem (não é a legenda)"
      className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent"
    >
      <svg viewBox="0 0 16 16" width={10} height={10} aria-hidden>
        <rect x="2" y="2.5" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 10h6M5 7.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      na arte
    </span>
  );
}

/* ============================================================
   GRUPO "TEXTO DA ARTE" — título + subtítulo NO TOPO da coluna de texto.
   RODADA 5 (item 2): rótulos ENXUTOS — só a tag "na arte", sem frase longa.
   No carrossel, os campos editam a PRANCHETA selecionada.
   ============================================================ */

function GrupoTextoArte({
  ehCarrossel,
  conteudo,
  onCampo,
  slideAtivo,
  totalPranchetas,
  papelPrancheta,
  setSlideAtivo,
}: {
  ehCarrossel: boolean;
  conteudo: ConteudoArte;
  onCampo: (campo: keyof ConteudoArte, valor: string) => void;
  slideAtivo: number;
  totalPranchetas: number;
  papelPrancheta: string;
  setSlideAtivo: (i: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-sky/50 bg-sky-soft/40 p-3 shadow-card">
      <header className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TagNaArte />
          <h2 className="font-display text-base font-bold text-navy">Título e subtítulo</h2>
        </div>
        {ehCarrossel && (
          <div className="flex items-center gap-1.5">
            <span className="font-display text-[11px] font-bold text-navy">
              {slideAtivo + 1}/{totalPranchetas} · {papelPrancheta}
            </span>
            {Array.from({ length: totalPranchetas }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlideAtivo(i)}
                aria-label={`Editar prancheta ${i + 1}`}
                data-ativo={i === slideAtivo}
                className="ec-prancheta-chip"
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-2">
        <label className="block">
          <span className="mb-0.5 block text-[11px] font-semibold text-navy">Título</span>
          <input
            value={conteudo.titulo}
            onChange={(e) => onCampo("titulo", e.target.value)}
            placeholder="O título que aparece grande na arte"
            className="w-full rounded-xl border border-border bg-card p-2.5 font-display text-lg font-bold leading-tight text-navy outline-none focus:border-accent/60"
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] font-semibold text-navy">Subtítulo</span>
          <input
            value={conteudo.subtitulo}
            onChange={(e) => onCampo("subtitulo", e.target.value)}
            placeholder="Uma linha de apoio (opcional)"
            className="w-full rounded-xl border border-border bg-card p-2.5 text-base leading-snug text-foreground outline-none focus:border-accent/60"
          />
        </label>
        <details className="group rounded-xl bg-card/60 px-2.5 py-1.5">
          <summary className="cursor-pointer list-none text-[11px] font-semibold text-muted-foreground marker:content-['']">
            <span className="group-open:hidden">+ Etiqueta / kicker</span>
            <span className="hidden group-open:inline">− Etiqueta / kicker</span>
          </summary>
          <input
            value={conteudo.etiqueta}
            onChange={(e) => onCampo("etiqueta", e.target.value)}
            placeholder="Ex.: Governança de dados"
            className="mt-1.5 w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground outline-none focus:border-accent/60"
          />
        </details>
      </div>
    </section>
  );
}

/* ============================================================
   COLUNA ESQUERDA (passo Conteúdo) — "Texto da arte" NO TOPO, abaixo do divisor
   o "Texto do post" (legenda + hashtags + CTA). Blocos ok-por-padrão + Editar.
   ============================================================ */

type AsyncEstado = "carregando" | "vazio" | "erro" | "sucesso";

function ColunaTexto({
  ehCarrossel,
  conteudoVigente,
  onCampoArte,
  slideAtivo,
  totalPranchetas,
  papelPrancheta,
  setSlideAtivo,
  legenda,
  hashtags,
  cta,
  setLegenda,
  setCta,
  estadoLegenda,
  estadoHashtags,
  estadoCta,
  setEstado,
  flash,
  gerandoTexto,
}: {
  ehCarrossel: boolean;
  conteudoVigente: ConteudoArte;
  onCampoArte: (campo: keyof ConteudoArte, valor: string) => void;
  slideAtivo: number;
  totalPranchetas: number;
  papelPrancheta: string;
  setSlideAtivo: (i: number) => void;
  legenda: string;
  hashtags: string[];
  cta: string;
  setLegenda: (v: string) => void;
  setCta: (v: string) => void;
  estadoLegenda: EstadoComp;
  estadoHashtags: EstadoComp;
  estadoCta: EstadoComp;
  setEstado: (bloco: "legenda" | "hashtags" | "cta", e: EstadoComp) => void;
  flash: "legenda" | "hashtags" | "cta" | null;
  gerandoTexto: boolean;
}) {
  return (
    <div className="space-y-3">
      <GrupoTextoArte
        ehCarrossel={ehCarrossel}
        conteudo={conteudoVigente}
        onCampo={onCampoArte}
        slideAtivo={slideAtivo}
        totalPranchetas={totalPranchetas}
        papelPrancheta={papelPrancheta}
        setSlideAtivo={setSlideAtivo}
      />

      <div className="flex items-center gap-2 pt-0.5">
        <span className="h-px flex-1 bg-border" />
        <span className="font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Texto do post (vai na legenda)
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="h-1.5">
        {gerandoTexto && <div className="ec-bar-trilho h-1.5 w-full" aria-label="Gerando o texto" />}
      </div>

      <BlocoTexto
        titulo="Legenda"
        estado={estadoLegenda}
        onEditar={() => setEstado("legenda", "editando")}
        onConfirmar={() => setEstado("legenda", "ok")}
        acabouDeRegenerar={flash === "legenda"}
        editor={
          <textarea
            value={legenda}
            onChange={(e) => setLegenda(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm leading-relaxed text-foreground outline-none focus:border-accent/60"
          />
        }
      >
        <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {legenda}
        </p>
      </BlocoTexto>

      <BlocoTexto
        titulo="Hashtags"
        subtitulo="Fixas da marca + contextuais · máx. 8"
        estado={estadoHashtags}
        onEditar={() => setEstado("hashtags", "editando")}
        onConfirmar={() => setEstado("hashtags", "ok")}
        acabouDeRegenerar={flash === "hashtags"}
        editor={
          <div className="flex flex-wrap gap-2">
            {hashtags.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-accent/50 bg-accent/5 px-2.5 py-1 text-xs font-medium text-navy"
              >
                {h}
                <span className="text-accent">×</span>
              </span>
            ))}
            <span className="inline-flex items-center rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground">
              + adicionar
            </span>
          </div>
        }
      >
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((h) => (
            <span
              key={h}
              className="inline-flex items-center rounded-full bg-navy-soft px-2.5 py-0.5 text-xs font-medium text-navy"
            >
              {h}
            </span>
          ))}
        </div>
      </BlocoTexto>

      <BlocoTexto
        titulo="CTA"
        subtitulo="Sugerido pela IA junto com o texto"
        estado={estadoCta}
        onEditar={() => setEstado("cta", "editando")}
        onConfirmar={() => setEstado("cta", "ok")}
        acabouDeRegenerar={flash === "cta"}
        editor={
          <input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-accent/60"
          />
        }
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-foreground/90">“{cta}”</p>
          <div className="flex shrink-0 gap-1.5">
            <RedeChip>LinkedIn</RedeChip>
            <RedeChip>Instagram</RedeChip>
          </div>
        </div>
      </BlocoTexto>
    </div>
  );
}

/* ============================================================
   SELETOR DE ESTILO DA ARTE — RODADA 5 (item 3): REPOSICIONADO.
   Segmented control A/B/C compacto, SEMPRE visível no topo da área de Arte
   (acima da prévia). Escolher o estilo vira o primeiro movimento óbvio.
   Ativo = laranja #ff6d2d sólido, texto branco.
   ============================================================ */

function SeletorEstilo({
  template,
  setTemplate,
}: {
  template: TemplateId;
  setTemplate: (t: TemplateId) => void;
}) {
  return (
    <div>
      <p className="mb-1 font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        Estilo da arte
      </p>
      <div className="ec-estilo-seg" role="group" aria-label="Estilo da arte">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTemplate(t.id)}
            data-ativo={template === t.id}
            className="ec-estilo-btn"
            title={t.desc}
          >
            <span className="font-display text-sm font-bold">{t.nome}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   SELETOR DE FORMATO — RODADA 5 (lacuna ALTA): FEED 4:5 / STORY 9:16.
   O caminho Story inteiro faltava. Aqui ele vira escolha visível na área
   principal; muda o aspect-ratio da prévia. Ativo = laranja sólido.
   ============================================================ */

function SeletorFormato({
  formato,
  setFormato,
}: {
  formato: FormatoArte;
  setFormato: (f: FormatoArte) => void;
}) {
  return (
    <div className="ec-formato-seg" role="group" aria-label="Formato da arte">
      <button
        type="button"
        onClick={() => setFormato("feed")}
        data-ativo={formato === "feed"}
        className="ec-formato-btn"
      >
        <IconeFeed /> Feed <span className="opacity-70">4:5</span>
      </button>
      <button
        type="button"
        onClick={() => setFormato("story")}
        data-ativo={formato === "story"}
        className="ec-formato-btn"
      >
        <IconeStory /> Story <span className="opacity-70">9:16</span>
      </button>
    </div>
  );
}

function IconeFeed() {
  return (
    <svg viewBox="0 0 16 16" width={12} height={12} aria-hidden>
      <rect x="3" y="2" width="10" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconeStory() {
  return (
    <svg viewBox="0 0 16 16" width={12} height={12} aria-hidden>
      <rect x="4.5" y="1.5" width="7" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

type FonteImagem = "upload" | "gerar" | "acervo";

/* ============================================================
   COLUNA DIREITA — ARTE (passo Conteúdo)
   RODADA 6 — layout (a pilha segue enxuta, nada enterrado embaixo):
     1. SELETOR DE ESTILO (A/B/C) no TOPO, sempre visível.
     2. SELETOR DE FORMATO Feed/Story + "Gerar versão Story".
     3. PRÉVIA = resultado E FONTE da imagem no MESMO quadro:
        - sem imagem → o quadro É o seletor de fonte (3 zonas Upload/Gerar/Acervo);
        - fonte escolhida → o estado da fonte acontece no quadro (upload spinner;
          gerar símbolo cheio + progresso → picker de candidatas; acervo skeletons
          + pills + "Buscar mais");
        - imagem pronta → a composição aparece no quadro + botão discreto
          "Trocar imagem" que reabre o seletor sem layout shift.
     4. Ações de finalizar/exportar.
   NÃO HÁ MAIS fonte de imagem ABAIXO da prévia (removida nesta rodada).
   Controles finos vivem na gaveta. Indicador ativo = laranja sólido.
   ============================================================ */

function PainelArte({
  reduzido,
  template,
  setTemplate,
  formato,
  setFormato,
  onGerarStory,
  conteudoVigente,
  ehCarrossel,
  pranchetas,
  slideAtivo,
  setSlideAtivo,
  gerandoImagem,
  estadoImagem,
  onGerarImagem,
  candidatas,
  candidataSelecionada,
  onSelecionarCandidata,
  buscaEstado,
  onBuscar,
  onBuscarMais,
  paginaAcervo,
  resultados,
  imagemSelecionada,
  onSelecionar,
  finalizando,
  arteFinalizada,
  onFinalizar,
  uploadEstado,
  onUpload,
  fonteAtiva,
  setFonteAtiva,
  onTrocarImagem,
}: {
  reduzido: ModoReduzido;
  template: TemplateId;
  setTemplate: (t: TemplateId) => void;
  formato: FormatoArte;
  setFormato: (f: FormatoArte) => void;
  onGerarStory: () => void;
  conteudoVigente: ConteudoArte;
  ehCarrossel: boolean;
  pranchetas: Prancheta[];
  slideAtivo: number;
  setSlideAtivo: (fn: (i: number) => number) => void;
  gerandoImagem: boolean;
  estadoImagem: AsyncEstado;
  onGerarImagem: () => void;
  candidatas: string[];
  candidataSelecionada: number | null;
  onSelecionarCandidata: (i: number) => void;
  buscaEstado: AsyncEstado | "inicial";
  onBuscar: (termo?: string) => void;
  onBuscarMais: () => void;
  paginaAcervo: number;
  resultados: string[];
  imagemSelecionada: number | null;
  onSelecionar: (i: number) => void;
  finalizando: boolean;
  arteFinalizada: boolean;
  onFinalizar: () => void;
  uploadEstado: AsyncEstado | "inicial";
  onUpload: () => void;
  fonteAtiva: FonteImagem | null;
  setFonteAtiva: (f: FonteImagem | null) => void;
  onTrocarImagem: () => void;
}) {
  const temConteudo = conteudoVigente.titulo.trim().length > 0;
  const temImagem = imagemSelecionada !== null || uploadEstado === "sucesso" || candidataSelecionada !== null;

  const aspect = formato === "story" ? "aspect-[9/16]" : "aspect-[4/5]";
  const dimensoes = formato === "story" ? "1080×1920" : "1080×1350";

  // In-frame: o que o quadro mostra AGORA.
  //  - imagem pronta → composição + "Trocar imagem";
  //  - fonte ativa (sem imagem ainda) → a UI daquela fonte dentro do quadro;
  //  - nenhuma fonte ativa e sem imagem → o seletor de 3 zonas.
  const mostrarChooser = !temImagem && fonteAtiva === null && !gerandoImagem && estadoImagem !== "erro";
  const mostrarFonteInFrame = !temImagem && fonteAtiva !== null && estadoImagem !== "erro";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-navy">Arte</h2>
        <span className="text-[11px] text-muted-foreground">
          {ehCarrossel ? "Carrossel · " : ""}
          {formato === "story" ? "Story · " : "Feed · "}
          {dimensoes}
        </span>
      </div>

      {/* 1. ESTILO DA ARTE — reposicionado no topo (sempre visível). */}
      <SeletorEstilo template={template} setTemplate={setTemplate} />

      {/* 2. FORMATO Feed/Story + ação de gerar versão Story. */}
      <div className="flex items-center justify-between gap-2">
        <SeletorFormato formato={formato} setFormato={setFormato} />
        <button
          type="button"
          onClick={onGerarStory}
          className="inline-flex items-center gap-1.5 rounded-full border border-navy/30 bg-background px-3 py-1.5 text-[11px] font-semibold text-navy transition-colors hover:border-navy/50 hover:bg-secondary"
        >
          <IconeStory /> Gerar versão Story
        </button>
      </div>

      {/* 3. PRÉVIA = RESULTADO **E FONTE DA IMAGEM** no MESMO quadro (rodada 6).
         O aspecto é reservado (aspect-ratio fixo por formato) para NÃO haver
         layout shift entre seletor vazio → fonte in-frame → loading → picker →
         resultado. */}
      <div className={cn("relative w-full overflow-hidden rounded-2xl border border-border shadow-card", aspect)}>
        <PreviaArte
          selecionada={candidataSelecionada ?? imagemSelecionada}
          resultados={candidataSelecionada !== null ? candidatas : resultados}
          conteudo={conteudoVigente}
          fundoCarrossel={ehCarrossel ? pranchetas[slideAtivo].cor : null}
          ctaPrancheta={ehCarrossel ? pranchetas[slideAtivo] : null}
          /* No estado de seletor/fonte, o fundo da prévia fica mais apagado para
             a camada de escolha respirar — mas o título/subtítulo seguem visíveis
             (dica de que vão renderizar SOBRE a imagem). */
          esmaecido={mostrarChooser || mostrarFonteInFrame}
        />

        {/* Navegador ‹1/N› do carrossel — segue valendo (prancheta atual). */}
        {ehCarrossel && !gerandoImagem && estadoImagem !== "erro" && (
          <div className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy/85 px-2 py-1 text-navy-foreground shadow-card backdrop-blur">
            <button
              type="button"
              aria-label="Prancheta anterior"
              onClick={() => setSlideAtivo((i) => (i - 1 + pranchetas.length) % pranchetas.length)}
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/15"
            >
              ‹
            </button>
            <span className="font-display text-[11px] font-bold">
              {slideAtivo + 1}/{pranchetas.length} · {pranchetas[slideAtivo].papel}
            </span>
            <button
              type="button"
              aria-label="Próxima prancheta"
              onClick={() => setSlideAtivo((i) => (i + 1) % pranchetas.length)}
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/15"
            >
              ›
            </button>
          </div>
        )}

        {formato === "story" && !gerandoImagem && estadoImagem !== "erro" && (
          <span className="absolute right-3 top-3 z-30 inline-flex items-center gap-1 rounded-full bg-navy/85 px-2 py-0.5 text-[10px] font-bold text-navy-foreground backdrop-blur">
            <IconeStory /> Story
          </span>
        )}

        {/* Selo "falta" só quando o quadro está mostrando a imagem (não quando é
           o próprio seletor — ali a ausência de imagem já é óbvia). */}
        {temImagem && !temConteudo && !gerandoImagem && estadoImagem !== "erro" && (
          <span className="absolute left-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-warning px-2.5 py-1 text-[11px] font-semibold text-navy shadow-card">
            <PontoAtencao /> Falta título/subtítulo
          </span>
        )}

        {/* ----- SELETOR DE 3 ZONAS (o quadro vazio É a fonte) ----- */}
        {mostrarChooser && (
          <ChooserInFrame
            ehCarrossel={ehCarrossel}
            slideAtivo={slideAtivo}
            totalPranchetas={pranchetas.length}
            papelPrancheta={ehCarrossel ? pranchetas[slideAtivo].papel : ""}
            onUpload={() => {
              setFonteAtiva("upload");
              onUpload();
            }}
            onGerar={() => {
              setFonteAtiva("gerar");
              onGerarImagem();
            }}
            onAcervo={() => {
              setFonteAtiva("acervo");
              onBuscar();
            }}
          />
        )}

        {/* ----- FONTE ATIVA, ainda sem imagem: a UI da fonte DENTRO do quadro ----- */}
        {mostrarFonteInFrame && fonteAtiva === "upload" && !gerandoImagem && (
          <FonteUploadInFrame uploadEstado={uploadEstado} onVoltar={() => setFonteAtiva(null)} />
        )}
        {mostrarFonteInFrame && fonteAtiva === "acervo" && (
          <FonteAcervoInFrame
            buscaEstado={buscaEstado}
            onBuscar={onBuscar}
            onBuscarMais={onBuscarMais}
            paginaAcervo={paginaAcervo}
            resultados={resultados}
            imagemSelecionada={imagemSelecionada}
            onSelecionar={onSelecionar}
            onGerarImagem={() => {
              setFonteAtiva("gerar");
              onGerarImagem();
            }}
            onVoltar={() => setFonteAtiva(null)}
          />
        )}

        {/* ----- GERAÇÃO: símbolo IaDigisystem COMPLETO + progresso NO quadro ----- */}
        {gerandoImagem && (
          <div className="ec-gerando-fundo absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 text-center">
            <IaDigisystem size={92} estado="processando" />
            <div className="w-40">
              <div className="ec-bar-trilho h-1.5 w-full" />
            </div>
            <p className="font-display text-sm font-semibold text-white">Gerando as imagens…</p>
            <p className="max-w-[80%] text-[11px] text-white/70">
              A IA está compondo algumas opções a partir do seu texto.
            </p>
          </div>
        )}

        {/* ----- PICKER de candidatas DENTRO/SOBRE o quadro (não mais embaixo) ----- */}
        {candidatas.length > 0 && !gerandoImagem && estadoImagem !== "erro" && (
          <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/75 via-black/45 to-transparent p-3">
            <p className="mb-2 flex items-center gap-2 font-display text-[11px] font-bold text-white">
              <IaDigisystem size={15} estado="vivo" />
              Opções da IA
              <span className="font-normal text-white/75">· clique para usar</span>
              <button
                type="button"
                onClick={onTrocarImagem}
                className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-white/25"
              >
                Outra fonte
              </button>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {candidatas.map((grad, i) => {
                const sel = candidataSelecionada === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSelecionarCandidata(i)}
                    className={cn(
                      "relative aspect-[4/5] overflow-hidden rounded-lg border-2 transition-colors",
                      sel ? "border-accent ec-select-pop" : "border-white/30 hover:border-white/70",
                    )}
                    style={{ background: grad }}
                  >
                    {sel && (
                      <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-accent text-white">
                        <CheckMini />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ----- ERRO (no quadro) ----- */}
        {estadoImagem === "erro" && !gerandoImagem && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-card/95 p-6 text-center">
            <AvisoErroIcone />
            <p className="font-display text-sm font-bold text-navy">A geração da imagem falhou</p>
            <p className="text-[11px] text-muted-foreground">
              Algo deu errado no caminho. Você pode tentar de novo.
            </p>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={onGerarImagem}
                className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-navy-foreground hover:bg-navy/90"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={onTrocarImagem}
                className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-navy hover:bg-secondary"
              >
                Trocar fonte
              </button>
            </div>
          </div>
        )}

        {/* ----- IMAGEM PRONTA: "Trocar imagem" discreto + selo "Arte pronta" ----- */}
        {temImagem && !gerandoImagem && candidatas.length === 0 && estadoImagem !== "erro" && (
          <button
            type="button"
            onClick={onTrocarImagem}
            className="absolute left-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-semibold text-navy-foreground shadow-card backdrop-blur transition-colors hover:bg-navy"
          >
            <IconeTrocar /> Trocar imagem
          </button>
        )}

        {estadoImagem === "sucesso" && !gerandoImagem && temImagem && temConteudo && candidatas.length === 0 && (
          <span className="absolute bottom-3 right-3 z-30 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold text-white shadow-card">
            <CheckMini /> Arte pronta
          </span>
        )}
      </div>

      {/* FINALIZAR ARTE (loader DISCRETO, Req. 2.8). */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onFinalizar}
          disabled={finalizando || !temImagem || !temConteudo}
          className="inline-flex items-center gap-2 rounded-xl border border-navy bg-background px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-secondary disabled:opacity-50"
        >
          {finalizando ? (
            <>
              <span className="ec-spinner h-4 w-4" aria-hidden />
              Finalizando…
            </>
          ) : arteFinalizada ? (
            <>
              <span className="text-[color:var(--success)]">
                <CheckMini />
              </span>
              Arte finalizada
            </>
          ) : (
            "Finalizar arte"
          )}
        </button>
        <p className="text-[11px] text-muted-foreground">
          Ação pontual → loader discreto, nunca o símbolo da IA.
        </p>
      </div>

      <ComparacaoLoaders reduzido={reduzido} />
    </div>
  );
}

/* ============================================================
   RODADA 6 — A FONTE DA IMAGEM VIVE DENTRO DO QUADRO DA PRÉVIA.
   Três componentes que ocupam o quadro (position absolute inset-0):
     - ChooserInFrame   → o seletor de 3 zonas (quadro vazio = a fonte).
     - FonteUploadInFrame → estado do Upload dentro do quadro (spinner discreto).
     - FonteAcervoInFrame → busca + pills + skeletons + "Buscar mais" no quadro.
   A geração por IA e o picker de candidatas são desenhados direto no quadro em
   PainelArte (símbolo cheio + progresso → grade de candidatas sobre o quadro).
   ============================================================ */

/* O quadro vazio É o seletor: três zonas grandes Upload / Gerar / Acervo,
   preenchendo o quadro, com a dica de que o título/subtítulo vão sobre a imagem. */
function ChooserInFrame({
  ehCarrossel,
  slideAtivo,
  totalPranchetas,
  papelPrancheta,
  onUpload,
  onGerar,
  onAcervo,
}: {
  ehCarrossel: boolean;
  slideAtivo: number;
  totalPranchetas: number;
  papelPrancheta: string;
  onUpload: () => void;
  onGerar: () => void;
  onAcervo: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-display text-[11px] font-bold uppercase tracking-wide text-white/90 drop-shadow">
          Escolha a imagem desta arte
        </p>
        {ehCarrossel && (
          <span className="rounded-full bg-navy/70 px-2 py-0.5 text-[10px] font-bold text-navy-foreground backdrop-blur">
            Prancheta {slideAtivo + 1}/{totalPranchetas}
            {papelPrancheta ? ` · ${papelPrancheta}` : ""}
          </span>
        )}
      </div>

      <div className="grid flex-1 grid-rows-3 gap-2">
        <ZonaFonte
          onClick={onGerar}
          destaque
          titulo="Gerar com IA"
          desc="A IA compõe opções a partir do seu texto"
          icone={<IaDigisystem size={30} estado="vivo" />}
        />
        <ZonaFonte
          onClick={onUpload}
          titulo="Arrastar ou enviar imagem"
          desc="PNG ou JPG · até 10 MB"
          icone={<IconeUpload />}
        />
        <ZonaFonte
          onClick={onAcervo}
          titulo="Buscar no acervo"
          desc="Imagens já disponíveis da marca"
          icone={<IconeLupa />}
        />
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-white/80 drop-shadow">
        <PontoAtencao /> O título e o subtítulo vão aparecer sobre a imagem escolhida.
      </p>
    </div>
  );
}

function ZonaFonte({
  onClick,
  titulo,
  desc,
  icone,
  destaque,
}: {
  onClick: () => void;
  titulo: string;
  desc: string;
  icone: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={cn("ec-zona", destaque && "ec-zona-destaque")}>
      <span className="ec-zona-icone">{icone}</span>
      <span className="min-w-0 text-left">
        <span className="block font-display text-sm font-bold leading-tight text-navy">{titulo}</span>
        <span className="block text-[11px] leading-tight text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

/* Upload DENTRO do quadro: spinner discreto (ação pontual, não IA). */
function FonteUploadInFrame({
  uploadEstado,
  onVoltar,
}: {
  uploadEstado: AsyncEstado | "inicial";
  onVoltar: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-card/95 p-6 text-center">
      <BotaoVoltarFonte onClick={onVoltar} />
      {uploadEstado === "carregando" ? (
        <>
          <span className="ec-upload-spin h-8 w-8" aria-hidden />
          <p className="font-display text-sm font-bold text-navy">Enviando arquivo…</p>
          <p className="text-[11px] text-muted-foreground">
            Loader discreto: é uma ação pontual, não geração de IA.
          </p>
        </>
      ) : (
        <>
          <IconeUpload />
          <p className="font-display text-sm font-bold text-navy">
            Arraste uma imagem ou clique para enviar
          </p>
          <p className="text-[11px] text-muted-foreground">PNG ou JPG · até 10 MB</p>
        </>
      )}
    </div>
  );
}

/* Acervo DENTRO do quadro: busca + pills de termos + grade de skeletons com a
   forma do card final + "Buscar mais". Fecha a lacuna MÉDIA do ArteStep real. */
function FonteAcervoInFrame({
  buscaEstado,
  onBuscar,
  onBuscarMais,
  paginaAcervo,
  resultados,
  imagemSelecionada,
  onSelecionar,
  onGerarImagem,
  onVoltar,
}: {
  buscaEstado: AsyncEstado | "inicial";
  onBuscar: (termo?: string) => void;
  onBuscarMais: () => void;
  paginaAcervo: number;
  resultados: string[];
  imagemSelecionada: number | null;
  onSelecionar: (i: number) => void;
  onGerarImagem: () => void;
  onVoltar: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-y-auto bg-card/96 p-3">
      <div className="mb-2 flex items-center gap-2">
        <BotaoVoltarFonte onClick={onVoltar} inline />
        <div className="chat-caixa flex-1">
          <input placeholder="Buscar no acervo (ex.: dados, time, tecnologia)…" />
          <button type="button" onClick={() => onBuscar()} className="chat-enviar h-8 w-8" aria-label="Buscar">
            <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
              <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pills de termos sugeridos (lacuna MÉDIA). */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {TERMOS_ACERVO.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onBuscar(t)}
            className="rounded-full border border-sky/50 bg-sky-soft/50 px-2.5 py-0.5 text-[11px] font-semibold text-navy transition-colors hover:border-sky hover:bg-sky-soft"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grade de skeletons com a MESMA forma do card final (aspect-[4/5]). */}
      <div className="grid grid-cols-3 gap-2">
        {buscaEstado === "carregando" &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ec-skeleton aspect-[4/5] rounded-lg" />
          ))}

        {buscaEstado === "sucesso" &&
          resultados.map((grad, i) => {
            const sel = imagemSelecionada === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelecionar(i)}
                className={cn(
                  "relative aspect-[4/5] overflow-hidden rounded-lg border-2 transition-colors",
                  sel ? "border-sky ec-select-pop" : "border-transparent hover:border-border",
                )}
                style={{ background: grad }}
              >
                {sel && (
                  <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-sky text-white">
                    <CheckMini />
                  </span>
                )}
              </button>
            );
          })}

        {(buscaEstado === "vazio" || buscaEstado === "inicial") &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-lg border border-dashed border-border bg-background"
            />
          ))}
      </div>

      {buscaEstado === "sucesso" && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Página {paginaAcervo} · {resultados.length} resultados
          </span>
          <button
            type="button"
            onClick={onBuscarMais}
            className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-navy hover:bg-secondary"
          >
            Buscar mais
          </button>
        </div>
      )}
      {buscaEstado === "vazio" && (
        <div className="mt-2 rounded-lg bg-secondary px-3 py-2 text-center text-[11px] text-muted-foreground">
          Nenhuma imagem encontrada no acervo.{" "}
          <button
            type="button"
            onClick={onGerarImagem}
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            Gerar uma com IA?
          </button>
        </div>
      )}
      {buscaEstado === "carregando" && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">Buscando no acervo…</p>
      )}
      {buscaEstado === "inicial" && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Use um termo sugerido ou digite — os resultados aparecem como grade.
        </p>
      )}
    </div>
  );
}

/* Voltar ao seletor de 3 zonas sem fechar nada (sem layout shift). */
function BotaoVoltarFonte({ onClick, inline }: { onClick: () => void; inline?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-navy hover:bg-secondary",
        !inline && "absolute left-3 top-3 z-10",
      )}
    >
      ‹ Outra fonte
    </button>
  );
}

function IconeLupa() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden>
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="var(--navy)" strokeWidth="2" />
      <path d="M20 20l-4.2-4.2" stroke="var(--sky)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconeTrocar() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} aria-hidden>
      <path
        d="M4 9a7 7 0 0 1 12-4l2 2M20 15a7 7 0 0 1-12 4l-2-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeUpload() {
  return (
    <svg viewBox="0 0 24 24" width={30} height={30} aria-hidden>
      <path
        d="M12 16V5m0 0l-4 4m4-4l4 4"
        fill="none"
        stroke="var(--navy)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 18h14" fill="none" stroke="var(--sky)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* Prévia da arte: SEMPRE uma imagem — placeholder de marca elegante (gradiente
   navy/sky + silhueta discreta), nunca um bloco cinza vazio. No carrossel,
   desenha o botão de CTA da prancheta quando houver. */
function PreviaArte({
  selecionada,
  resultados,
  conteudo,
  fundoCarrossel,
  ctaPrancheta,
  esmaecido,
}: {
  selecionada: number | null;
  resultados: string[];
  conteudo: ConteudoArte;
  fundoCarrossel: string | null;
  ctaPrancheta: Prancheta | null;
  esmaecido?: boolean;
}) {
  const fundo =
    fundoCarrossel ??
    (selecionada !== null && resultados[selecionada]
      ? resultados[selecionada]
      : "linear-gradient(150deg, var(--navy), oklch(0.5 0.12 250) 60%, var(--sky))");
  const temTitulo = conteudo.titulo.trim().length > 0;
  return (
    <div
      className={cn("absolute inset-0 transition-opacity", esmaecido && "opacity-45")}
      style={{ background: fundo }}
    >
      <svg
        viewBox="0 0 200 250"
        className="absolute inset-0 h-full w-full opacity-30"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <circle cx="60" cy="90" r="26" fill="white" opacity="0.25" />
        <circle cx="120" cy="70" r="16" fill="var(--accent)" opacity="0.55" />
        <circle cx="150" cy="120" r="8" fill="var(--sky)" opacity="0.8" />
        <circle cx="90" cy="150" r="6" fill="white" opacity="0.4" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        {conteudo.etiqueta.trim() && (
          <span className="mb-1.5 inline-block rounded-full bg-accent px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-white">
            {conteudo.etiqueta}
          </span>
        )}
        {temTitulo ? (
          <p className="font-display text-xl font-bold leading-tight text-white">
            {conteudo.titulo}
          </p>
        ) : (
          <p className="font-display text-base font-bold italic leading-tight text-white/60">
            Escreva o título no topo da coluna de texto…
          </p>
        )}
        {conteudo.subtitulo.trim() && (
          <p className="mt-1 text-xs text-white/85">{conteudo.subtitulo}</p>
        )}
        {ctaPrancheta && ctaPrancheta.ctaTexto.trim() && (
          <span
            className="mt-2 inline-block rounded-full px-3 py-1 font-display text-[11px] font-bold"
            style={{ background: ctaPrancheta.ctaFundo, color: ctaPrancheta.ctaTexto_cor }}
          >
            {ctaPrancheta.ctaTexto}
          </span>
        )}
      </div>
    </div>
  );
}

function ComparacaoLoaders({ reduzido }: { reduzido: ModoReduzido }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-dashed border-border bg-background p-3">
      <div className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 text-center shadow-card">
        <IaDigisystem size={48} estado="processando" />
        <p className="font-display text-[11px] font-bold text-navy">Símbolo cheio</p>
        <p className="text-[10px] leading-tight text-muted-foreground">
          Só no momento de peso: a IA gerando conteúdo.
        </p>
      </div>
      <div className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 text-center shadow-card">
        <span className="ec-spinner h-7 w-7" aria-hidden />
        <p className="font-display text-[11px] font-bold text-navy">Loader discreto</p>
        <p className="text-[10px] leading-tight text-muted-foreground">
          Ações pontuais: finalizar, exportar, selecionar.
        </p>
      </div>
      {reduzido && (
        <p className="col-span-2 rounded-lg bg-secondary px-2 py-1 text-center text-[10px] text-muted-foreground">
          Redução de movimento ativa: animações param, mas o estado de "em andamento" continua
          legível (arco e barra estáticos).
        </p>
      )}
    </div>
  );
}

function AvisoErroIcone() {
  return (
    <svg viewBox="0 0 24 24" width={36} height={36} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="var(--destructive)" opacity="0.14" />
      <path d="M12 7v6" stroke="var(--destructive)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.3" fill="var(--destructive)" />
    </svg>
  );
}

function PontoAtencao() {
  return (
    <svg viewBox="0 0 16 16" width={11} height={11} aria-hidden>
      <path d="M8 2l6 11H2L8 2z" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M8 6.5v3" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
    </svg>
  );
}

/* ============================================================
   BIFURCAÇÃO ao fim do passo Conteúdo (preservada da rodada 4)
   ============================================================ */

function Bifurcacao({
  onRevisar,
  onPersonalizar,
}: {
  onRevisar: () => void;
  onPersonalizar: () => void;
}) {
  return (
    <section className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 text-center">
        <h2 className="font-display text-lg font-bold text-navy">Conteúdo pronto. E agora?</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Se quiser só revisar e enviar, use o caminho rápido. Se quiser ajustar a arte com mais
          precisão, abra a personalização — ela é opcional e não adiciona um passo.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onRevisar}
          className="ec-cta-ia-solido group flex flex-col items-start gap-1 rounded-2xl px-5 py-4 text-left text-white"
        >
          <span className="inline-flex items-center gap-2 font-display text-base font-bold">
            Revisar e enviar
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
          <span className="text-[11px] font-medium text-white/85">
            Vai direto ao Parecer da IA e ao envio. É o caminho recomendado.
          </span>
        </button>

        <button
          type="button"
          onClick={onPersonalizar}
          className="group flex flex-col items-start gap-1 rounded-2xl border-2 border-navy/25 bg-background px-5 py-4 text-left transition-colors hover:border-navy/50 hover:bg-secondary"
        >
          <span className="inline-flex items-center gap-2 font-display text-base font-bold text-navy">
            <IconeAjustes />
            Personalizar em detalhe
            <span className="rounded-full bg-sky-soft px-2 py-0.5 text-[10px] font-bold text-navy">
              opcional
            </span>
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Tipografia, cor, logo, degradê, formato e — no carrossel — cada prancheta. Abre uma
            gaveta com prévia ao lado; depois você cai no Revisar.
          </span>
        </button>
      </div>
    </section>
  );
}

function IconeAjustes() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
      <path
        d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4"
        stroke="var(--navy)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="6" r="2.2" fill="none" stroke="var(--accent)" strokeWidth="2" />
      <circle cx="8" cy="12" r="2.2" fill="none" stroke="var(--accent)" strokeWidth="2" />
      <circle cx="14" cy="18" r="2.2" fill="none" stroke="var(--accent)" strokeWidth="2" />
    </svg>
  );
}

/* ============================================================
   GAVETA — AJUSTES AVANÇADOS (RODADA 5)
   NOVIDADES:
     - REDIMENSIONÁVEL: toggle que alarga/estreita a gaveta (normal ↔ larga).
     - PRÉVIA AO LADO: painel lateral apartado dentro da gaveta — controles de um
       lado, prévia ao vivo do outro. Não precisa alargar para ver o efeito.
     - título/subtítulo POR PRANCHETA só no CARROSSEL (seção condicional).
   Reaproveita os controles do ArteStep real + fecha lacunas MÉDIAS:
     tipografia separada título/subtítulo (fonte + cor), degradê (intensidade +
     cores + usar cor da marca), logo (seleção + D-pad + presets + toggle no
     carrossel), tituloAcima (A), destaque do subtítulo + cor, carrossel por
     prancheta (cor/fundo, foco, CTA), exportar PNG/SVG/zip/combinada.
   ============================================================ */

type NivelControle = "basico" | "avancado";

function PillsBasicoAvancado({
  nivel,
  setNivel,
}: {
  nivel: NivelControle;
  setNivel: (n: NivelControle) => void;
}) {
  return (
    <div className="ec-pills" role="group" aria-label="Nível de controle">
      <button type="button" data-ativa={nivel === "basico"} onClick={() => setNivel("basico")} className="ec-pill">
        Básico
      </button>
      <button type="button" data-ativa={nivel === "avancado"} onClick={() => setNivel("avancado")} className="ec-pill">
        Avançado
      </button>
    </div>
  );
}

function BlocoAvancado({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-3 shadow-card">
      <h3 className="mb-2 font-display text-sm font-bold text-navy">{titulo}</h3>
      {children}
    </section>
  );
}

function GavetaAvancada({
  aberta,
  reduzido,
  template,
  ehCarrossel,
  pranchetas,
  slideAtivo,
  setSlideAtivo,
  onCampoPrancheta,
  conteudoVigente,
  formato,
  totalPranchetas,
  onAddPrancheta,
  onRemovePrancheta,
  onFechar,
  onConcluir,
}: {
  aberta: boolean;
  reduzido: ModoReduzido;
  template: TemplateId;
  ehCarrossel: boolean;
  pranchetas: Prancheta[];
  slideAtivo: number;
  setSlideAtivo: (i: number) => void;
  onCampoPrancheta: (campo: keyof Prancheta, valor: string) => void;
  conteudoVigente: ConteudoArte;
  formato: FormatoArte;
  totalPranchetas: number;
  onAddPrancheta: () => void;
  onRemovePrancheta: () => void;
  onFechar: () => void;
  onConcluir: () => void;
}) {
  const [larga, setLarga] = useState(false);

  // Tipografia separada título × subtítulo (fonte + cor).
  const [fonteTitulo, setFonteTitulo] = useState("Dosis");
  const [fonteSubtitulo, setFonteSubtitulo] = useState("Open Sans");
  const [corTitulo, setCorTitulo] = useState("#ffffff");
  const [corSubtitulo, setCorSubtitulo] = useState("#e8edff");
  const [tamTitulo, setTamTitulo] = useState(64);
  const [tamSubtitulo, setTamSubtitulo] = useState(32);
  const [tituloAcima, setTituloAcima] = useState(false);
  const [destaqueSub, setDestaqueSub] = useState(false);
  const [corDestaque, setCorDestaque] = useState("#ff6d2d");

  // Posição do texto (Básico/Avançado).
  const [nivelTexto, setNivelTexto] = useState<NivelControle>("basico");
  const [posPreset, setPosPreset] = useState("rodape");
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(78);
  const [larguraPct, setLarguraPct] = useState(86);

  // Logo: seleção + posição + tamanho + toggle no carrossel.
  const [logoSel, setLogoSel] = useState("principal");
  const [logoPreset, setLogoPreset] = useState("inf-dir");
  const [logoTam, setLogoTam] = useState("M");
  const [logoNoCarrossel, setLogoNoCarrossel] = useState(true);

  // Degradê: intensidade + cores + usar cor da marca.
  const [degradeDir, setDegradeDir] = useState("150deg");
  const [degradeIntensidade, setDegradeIntensidade] = useState(70);
  const [corInicial, setCorInicial] = useState("#36499b");
  const [corFinal, setCorFinal] = useState("#67cfee");
  const [usarCorMarca, setUsarCorMarca] = useState(true);

  useEffect(() => {
    if (!aberta) return;
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberta, onFechar]);

  if (!aberta) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Fechar ajustes avançados"
        onClick={onFechar}
        className={cn("ec-gaveta-backdrop absolute inset-0 bg-navy/40", reduzido && "reduzir-mov")}
      />

      <aside
        className={cn(
          "ec-gaveta relative flex h-full w-full flex-col bg-background shadow-float transition-[max-width] duration-300",
          larga ? "max-w-5xl" : "max-w-2xl",
          reduzido && "reduzir-mov",
        )}
        role="dialog"
        aria-label="Ajustes avançados da arte"
      >
        {/* Cabeçalho fixo com o toggle de largura (âncora à direita, estável). */}
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <IconeAjustes />
            <div>
              <h2 className="font-display text-base font-bold text-navy">Ajustes avançados</h2>
              <p className="text-[11px] text-muted-foreground">
                Personalização opcional — com prévia ao lado.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLarga((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-navy hover:bg-secondary"
              aria-pressed={larga}
              title={larga ? "Estreitar a gaveta" : "Alargar a gaveta"}
            >
              {larga ? "⇥⇤ Estreitar" : "⇤⇥ Alargar"}
            </button>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar"
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background text-navy hover:bg-secondary"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Corpo: controles (rolam) + prévia lateral apartada (sticky). */}
        <div className="flex min-h-0 flex-1">
          {/* Lado dos controles. */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {/* TIPOGRAFIA — fonte do título e do subtítulo SEPARADAS + cor de cada. */}
            <BlocoAvancado titulo="Tipografia">
              <p className="mb-2 text-[11px] text-muted-foreground">
                Família do conjunto de marca ({ESTUDIO_FONTES.length} aqui no mock; o real fia com
                <span className="font-mono"> ESTUDIO_FONTES</span>).
              </p>
              <div className="grid grid-cols-2 gap-3">
                <SeletorFonte rotulo="Fonte do título" valor={fonteTitulo} onChange={setFonteTitulo} />
                <SeletorFonte rotulo="Fonte do subtítulo" valor={fonteSubtitulo} onChange={setFonteSubtitulo} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <ColorHexInput rotulo="Cor do título" valor={corTitulo} onChange={setCorTitulo} />
                <ColorHexInput rotulo="Cor do subtítulo" valor={corSubtitulo} onChange={setCorSubtitulo} />
              </div>
              <div className="mt-3 space-y-3">
                <SliderLinha rotulo="Tamanho do título" valor={tamTitulo} min={28} max={120} sufixo="px" onChange={setTamTitulo} />
                <SliderLinha rotulo="Tamanho do subtítulo" valor={tamSubtitulo} min={16} max={72} sufixo="px" onChange={setTamSubtitulo} />
              </div>
              {/* tituloAcima só faz sentido no template A (foto + overlay). */}
              {template === "A" && (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-navy">Ordem título × subtítulo</span>
                  <div className="ec-pills" role="group" aria-label="Ordem título e subtítulo">
                    <button type="button" data-ativa={!tituloAcima} onClick={() => setTituloAcima(false)} className="ec-pill">
                      Título abaixo
                    </button>
                    <button type="button" data-ativa={tituloAcima} onClick={() => setTituloAcima(true)} className="ec-pill">
                      Título acima
                    </button>
                  </div>
                </div>
              )}
              {/* Destaque do subtítulo (badge atrás) + cor. */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-navy">Destaque do subtítulo</span>
                <div className="ec-pills" role="group" aria-label="Destaque do subtítulo">
                  <button type="button" data-ativa={!destaqueSub} onClick={() => setDestaqueSub(false)} className="ec-pill">
                    Sem
                  </button>
                  <button type="button" data-ativa={destaqueSub} onClick={() => setDestaqueSub(true)} className="ec-pill">
                    Com badge
                  </button>
                </div>
              </div>
              {destaqueSub && (
                <div className="mt-2">
                  <ColorHexInput rotulo="Cor do destaque" valor={corDestaque} onChange={setCorDestaque} />
                </div>
              )}
            </BlocoAvancado>

            {/* POSIÇÃO DO TEXTO — Básico (preset) / Avançado (X/Y/Largura %). */}
            <BlocoAvancado titulo="Posição do texto">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Básico usa um preset; Avançado libera X/Y e largura.
                </span>
                <PillsBasicoAvancado nivel={nivelTexto} setNivel={setNivelTexto} />
              </div>
              {nivelTexto === "basico" ? (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "topo", rot: "Topo" },
                    { id: "centro", rot: "Centro" },
                    { id: "rodape", rot: "Rodapé" },
                  ].map((p) => (
                    <button key={p.id} type="button" onClick={() => setPosPreset(p.id)} data-ativo={posPreset === p.id} className="ec-preset-btn">
                      {p.rot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <SliderLinha rotulo="X (horizontal)" valor={posX} min={0} max={100} sufixo="%" onChange={setPosX} />
                  <SliderLinha rotulo="Y (vertical)" valor={posY} min={0} max={100} sufixo="%" onChange={setPosY} />
                  <SliderLinha rotulo="Largura do bloco" valor={larguraPct} min={40} max={100} sufixo="%" onChange={setLarguraPct} />
                </div>
              )}
            </BlocoAvancado>

            {/* LOGO — seleção + posição + D-pad + tamanho + toggle no carrossel. */}
            <BlocoAvancado titulo="Logo">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-navy">Qual logo (do Brand Kit)</span>
                <select
                  value={logoSel}
                  onChange={(e) => setLogoSel(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none focus:border-accent/60"
                >
                  {LOGOS_BRAND.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nome}
                    </option>
                  ))}
                </select>
              </label>

              <p className="mb-2 mt-3 text-[11px] font-semibold text-navy">Posição</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "sup-esq", rot: "↖" },
                  { id: "sup-cen", rot: "↑" },
                  { id: "sup-dir", rot: "↗" },
                  { id: "cen-esq", rot: "←" },
                  { id: "centro", rot: "•" },
                  { id: "cen-dir", rot: "→" },
                  { id: "inf-esq", rot: "↙" },
                  { id: "inf-cen", rot: "↓" },
                  { id: "inf-dir", rot: "↘" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLogoPreset(p.id)}
                    data-ativo={logoPreset === p.id}
                    aria-label={`Posição do logo ${p.id}`}
                    className="ec-logo-preset"
                  >
                    {p.rot}
                  </button>
                ))}
              </div>

              <p className="mb-1.5 mt-3 text-[11px] font-semibold text-navy">
                Mover logo <span className="font-normal text-muted-foreground">(Shift = fino)</span>
              </p>
              <DpadLogo />

              <p className="mb-1.5 mt-3 text-[11px] font-semibold text-navy">Tamanho</p>
              <div className="grid grid-cols-3 gap-2">
                {["P", "M", "G"].map((t) => (
                  <button key={t} type="button" onClick={() => setLogoTam(t)} data-ativo={logoTam === t} className="ec-preset-btn">
                    {t}
                  </button>
                ))}
              </div>

              {ehCarrossel && (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-navy">Exibir logo no carrossel</span>
                  <div className="ec-pills" role="group" aria-label="Exibir logo no carrossel">
                    <button type="button" data-ativa={logoNoCarrossel} onClick={() => setLogoNoCarrossel(true)} className="ec-pill">
                      Exibir
                    </button>
                    <button type="button" data-ativa={!logoNoCarrossel} onClick={() => setLogoNoCarrossel(false)} className="ec-pill">
                      Ocultar
                    </button>
                  </div>
                </div>
              )}
            </BlocoAvancado>

            {/* DEGRADÊ — direção + intensidade + cores + usar cor da marca. */}
            <BlocoAvancado titulo="Degradê do fundo">
              <p className="mb-1.5 text-[11px] font-semibold text-navy">Direção</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "0deg", rot: "↑" },
                  { id: "90deg", rot: "→" },
                  { id: "150deg", rot: "↘" },
                  { id: "180deg", rot: "↓" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDegradeDir(d.id)}
                    data-ativo={degradeDir === d.id}
                    aria-label={`Direção do degradê ${d.id}`}
                    className="ec-preset-btn text-lg"
                  >
                    {d.rot}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <SliderLinha rotulo="Intensidade" valor={degradeIntensidade} min={0} max={100} sufixo="%" onChange={setDegradeIntensidade} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-navy">Cores</span>
                <div className="ec-pills" role="group" aria-label="Origem das cores do degradê">
                  <button type="button" data-ativa={usarCorMarca} onClick={() => setUsarCorMarca(true)} className="ec-pill">
                    Cor da marca
                  </button>
                  <button type="button" data-ativa={!usarCorMarca} onClick={() => setUsarCorMarca(false)} className="ec-pill">
                    Personalizar
                  </button>
                </div>
              </div>
              {!usarCorMarca && (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <ColorHexInput rotulo="Cor inicial" valor={corInicial} onChange={setCorInicial} />
                  <ColorHexInput rotulo="Cor final" valor={corFinal} onChange={setCorFinal} />
                </div>
              )}
            </BlocoAvancado>

            {/* CARROSSEL — seção CONDICIONAL: só aparece quando template = C. */}
            {ehCarrossel && (
              <BlocoAvancado titulo="Carrossel · por prancheta">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-foreground">
                    {totalPranchetas} {totalPranchetas === 1 ? "prancheta" : "pranchetas"} (2–8)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onRemovePrancheta}
                      disabled={totalPranchetas <= 2}
                      aria-label="Remover prancheta"
                      className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background text-lg font-bold text-navy hover:bg-secondary disabled:opacity-40"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={onAddPrancheta}
                      disabled={totalPranchetas >= 8}
                      aria-label="Adicionar prancheta"
                      className="grid h-8 w-8 place-items-center rounded-full border border-navy bg-card text-lg font-bold text-navy hover:bg-secondary disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Chips para escolher QUAL prancheta estes campos editam. */}
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-navy">Editando:</span>
                  {pranchetas.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlideAtivo(i)}
                      data-ativo={i === slideAtivo}
                      className="ec-prancheta-chip"
                      aria-label={`Prancheta ${i + 1} (${p.papel})`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <span className="text-[11px] text-muted-foreground">· {pranchetas[slideAtivo]?.papel}</span>
                </div>

                {/* Cor/fundo da prancheta. */}
                <p className="mb-1.5 text-[11px] font-semibold text-navy">Fundo da prancheta</p>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[
                    "linear-gradient(150deg, var(--navy), var(--sky))",
                    "linear-gradient(150deg, var(--navy), var(--accent))",
                    "linear-gradient(150deg, var(--accent), oklch(0.75 0.14 60))",
                  ].map((g, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onCampoPrancheta("cor", g)}
                      data-ativo={pranchetas[slideAtivo]?.cor === g}
                      className={cn(
                        "h-10 rounded-lg border-2 transition-colors",
                        pranchetas[slideAtivo]?.cor === g ? "border-accent" : "border-border hover:border-navy/40",
                      )}
                      style={{ background: g }}
                      aria-label={`Fundo ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Foco da imagem. */}
                <p className="mb-1.5 text-[11px] font-semibold text-navy">Foco da imagem</p>
                <div className="mb-3 grid grid-cols-5 gap-1.5">
                  {(["esq", "topo", "centro", "base", "dir"] as FocoImagem[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => onCampoPrancheta("foco", f)}
                      data-ativo={pranchetas[slideAtivo]?.foco === f}
                      className="ec-preset-btn text-[11px]"
                    >
                      {f === "esq" ? "←" : f === "dir" ? "→" : f === "topo" ? "↑" : f === "base" ? "↓" : "•"}
                    </button>
                  ))}
                </div>

                {/* CTA da prancheta: texto + cores. */}
                <p className="mb-1.5 text-[11px] font-semibold text-navy">Botão de CTA (opcional)</p>
                <input
                  value={pranchetas[slideAtivo]?.ctaTexto ?? ""}
                  onChange={(e) => onCampoPrancheta("ctaTexto", e.target.value)}
                  placeholder="Ex.: Fale com um especialista"
                  className="mb-2 w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none focus:border-accent/60"
                />
                <div className="grid grid-cols-2 gap-3">
                  <ColorHexInput rotulo="Fundo do botão" valor={pranchetas[slideAtivo]?.ctaFundo ?? "#ff6d2d"} onChange={(v) => onCampoPrancheta("ctaFundo", v)} />
                  <ColorHexInput rotulo="Texto do botão" valor={pranchetas[slideAtivo]?.ctaTexto_cor ?? "#ffffff"} onChange={(v) => onCampoPrancheta("ctaTexto_cor", v)} />
                </div>
              </BlocoAvancado>
            )}

            {/* EXPORTAR — PNG / SVG / tudo (.zip) / combinada (carrossel). */}
            <BlocoAvancado titulo="Exportar">
              <div className="grid grid-cols-2 gap-2">
                <BotaoExport rotulo="Exportar PNG" />
                <BotaoExport rotulo="Baixar SVG" />
                <BotaoExport rotulo="Baixar tudo (.zip)" />
                {ehCarrossel && <BotaoExport rotulo="Imagem combinada" />}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Exportar é ação pontual → loader discreto, nunca o símbolo da IA.
              </p>
            </BlocoAvancado>
          </div>

          {/* Lado da PRÉVIA apartada (sticky) — ao vivo, sem precisar alargar. */}
          <div className="hidden w-[300px] shrink-0 flex-col border-l border-border bg-card p-4 sm:flex">
            <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Prévia ao vivo
            </p>
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-2xl border border-border shadow-card",
                formato === "story" ? "aspect-[9/16]" : "aspect-[4/5]",
              )}
            >
              <PreviaArte
                selecionada={0}
                resultados={["linear-gradient(150deg, var(--navy), var(--sky))"]}
                conteudo={conteudoVigente}
                fundoCarrossel={ehCarrossel ? pranchetas[slideAtivo].cor : null}
                ctaPrancheta={ehCarrossel ? pranchetas[slideAtivo] : null}
              />
            </div>
            <p className="mt-2 text-[10px] leading-tight text-muted-foreground">
              Como uma tela apartada: o que você mexe aqui reflete na hora, sem fechar a gaveta.
              {ehCarrossel ? " Mostra a prancheta em edição." : ""}
            </p>
          </div>
        </div>

        {/* Rodapé fixo (âncora estável). */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-navy hover:bg-secondary"
          >
            Voltar ao conteúdo
          </button>
          <button
            type="button"
            onClick={onConcluir}
            className="ec-cta-ia-solido rounded-full px-5 py-2 text-sm font-semibold text-white"
          >
            Concluir e revisar →
          </button>
        </footer>
      </aside>
    </div>
  );
}

function SeletorFonte({ rotulo, valor, onChange }: { rotulo: string; valor: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-navy">{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none focus:border-accent/60"
      >
        {ESTUDIO_FONTES.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </label>
  );
}

function BotaoExport({ rotulo }: { rotulo: string }) {
  const [carregando, setCarregando] = useState(false);
  const [feito, setFeito] = useState(false);
  const timer = useRef<number | null>(null);
  function rodar() {
    setCarregando(true);
    setFeito(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setCarregando(false);
      setFeito(true);
    }, 1100);
  }
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return (
    <button
      type="button"
      onClick={rodar}
      disabled={carregando}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy bg-background px-3 py-2 text-xs font-semibold text-navy hover:bg-secondary disabled:opacity-50"
    >
      {carregando ? (
        <>
          <span className="ec-spinner h-3.5 w-3.5" aria-hidden /> Gerando…
        </>
      ) : feito ? (
        <>
          <span className="text-[color:var(--success)]">
            <CheckMini />
          </span>
          Pronto
        </>
      ) : (
        rotulo
      )}
    </button>
  );
}

function SliderLinha({
  rotulo,
  valor,
  min,
  max,
  sufixo,
  onChange,
}: {
  rotulo: string;
  valor: number;
  min: number;
  max: number;
  sufixo?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] font-semibold text-navy">
        {rotulo}
        <span className="text-muted-foreground">
          {valor}
          {sufixo}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ec-slider w-full"
      />
    </label>
  );
}

function ColorHexInput({
  rotulo,
  valor,
  onChange,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-navy">{rotulo}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5">
        <span
          className="h-7 w-7 shrink-0 rounded-lg border border-border"
          style={{ background: valor }}
          aria-hidden
        />
        <input
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full bg-transparent font-mono text-sm uppercase text-foreground outline-none"
        />
      </div>
    </label>
  );
}

function DpadLogo() {
  const Botao = ({ rot, aria }: { rot: string; aria: string }) => (
    <button type="button" aria-label={aria} className="ec-dpad-btn">
      {rot}
    </button>
  );
  return (
    <div className="ec-dpad">
      <span />
      <Botao rot="↑" aria="Mover logo para cima" />
      <span />
      <Botao rot="←" aria="Mover logo para a esquerda" />
      <span className="grid place-items-center text-[10px] font-bold text-muted-foreground">•</span>
      <Botao rot="→" aria="Mover logo para a direita" />
      <span />
      <Botao rot="↓" aria="Mover logo para baixo" />
      <span />
    </div>
  );
}

/* ============================================================
   PASSO REVISAR / ENVIAR — mantém o PARECER DA IA (inegociável de marca).
   ============================================================ */

type ParecerEstado = "analisando" | "resultado";
type Veredito = "dentro" | "atencao";

function PassoRevisar({
  conteudoVigente,
  legenda,
  hashtags,
  cta,
  template,
  formato,
  reduzido,
  onVoltar,
}: {
  conteudoVigente: ConteudoArte;
  legenda: string;
  hashtags: string[];
  cta: string;
  template: TemplateId;
  formato: FormatoArte;
  reduzido: ModoReduzido;
  onVoltar: () => void;
}) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy">Revisar o post</h2>
          <button
            type="button"
            onClick={onVoltar}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-navy hover:bg-secondary"
          >
            ← Voltar ao conteúdo
          </button>
        </div>

        <div className={cn("relative w-full max-w-xs overflow-hidden rounded-2xl border border-border shadow-card", formato === "story" ? "aspect-[9/16]" : "aspect-[4/5]")}>
          <PreviaArte
            selecionada={0}
            resultados={["linear-gradient(150deg, var(--navy), var(--sky))"]}
            conteudo={conteudoVigente}
            fundoCarrossel={null}
            ctaPrancheta={null}
          />
        </div>

        <section className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <h3 className="mb-1.5 font-display text-sm font-bold text-navy">Texto do post</h3>
          <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {legenda}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hashtags.map((h) => (
              <span key={h} className="rounded-full bg-navy-soft px-2 py-0.5 text-[11px] font-medium text-navy">
                {h}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            CTA: <span className="text-foreground/90">“{cta}”</span>
          </p>
        </section>

        <p className="rounded-xl bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
          Estilo <strong className="font-semibold text-navy">{template}</strong> ·{" "}
          {formato === "story" ? "Story 9:16" : "Feed 4:5"} · "{conteudoVigente.titulo}" sobre a arte.
        </p>
      </div>

      <div className="space-y-4">
        <ParecerIa reduzido={reduzido} />
        <ControlesEnvio />
      </div>
    </div>
  );
}

function ParecerIa({ reduzido }: { reduzido: ModoReduzido }) {
  const [estado, setEstado] = useState<ParecerEstado>("analisando");
  const [veredito, setVeredito] = useState<Veredito>("dentro");
  const timer = useRef<number | null>(null);

  function analisar(resultado: Veredito) {
    setEstado("analisando");
    setVeredito(resultado);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setEstado("resultado"), reduzido ? 400 : 1800);
  }

  useEffect(() => {
    analisar("dentro");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prontidao = veredito === "dentro" ? 94 : 61;

  return (
    <section
      className={cn(
        "rounded-3xl border bg-card p-4 shadow-card transition-colors",
        estado === "analisando" ? "ia-borda-analise" : "border-border parecer-settle",
      )}
    >
      <header className="mb-3 flex items-center gap-2">
        <span className="parecer-dot inline-block h-2 w-2 rounded-full bg-accent" />
        <h3 className="font-display text-base font-bold text-navy">Parecer da IA</h3>
        <span className="ml-auto text-[11px] text-muted-foreground">Verificação de marca</span>
      </header>

      {estado === "analisando" ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <IaDigisystem size={76} estado="processando" />
          <p className="font-display text-sm font-semibold text-navy">
            Analisando dentro da identidade…
          </p>
          <div className="w-44">
            <div className="ec-bar-trilho h-1.5 w-full" />
          </div>
          <p className="max-w-[80%] text-[11px] text-muted-foreground">
            A IA confere tom de voz, cores, tipografia e hashtags oficiais.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <IaDigisystem size={48} estado="vivo" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Prontidão de marca
                </span>
                <span
                  className={cn(
                    "font-display text-sm font-bold",
                    veredito === "dentro" ? "text-[color:var(--success)]" : "text-[color:var(--warning)]",
                  )}
                >
                  {prontidao}%
                </span>
              </div>
              <div className="ec-prontidao-trilho mt-1">
                <div
                  className={cn("ec-prontidao-fill", veredito === "atencao" && "ec-prontidao-fill-atencao")}
                  style={{ ["--ec-pr-pct" as string]: `${prontidao}%` }}
                />
              </div>
            </div>
          </div>

          {veredito === "dentro" ? (
            <div className="rounded-2xl border border-[color:var(--success)]/40 bg-success-soft p-3">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-[color:var(--success)]">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-success text-white">
                  <CheckMini />
                </span>
                Dentro da identidade
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">
                Tom de voz consultivo, paleta Reflex Blue + laranja, hashtags oficiais presentes.
                Pronto para enviar à aprovação.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[color:var(--warning)]/50 bg-warning-soft p-3">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-navy">
                <PontoAtencao /> Atenção: fora do tom em 2 pontos
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-foreground/80">
                <li>• A legenda usa "alavancar" — termo banido pelo manual de marca.</li>
                <li>• Faltou a hashtag oficial #Parceriaquetransforma.</li>
              </ul>
            </div>
          )}

          <div className="flex gap-2 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => analisar("dentro")}
              className="rounded-full border border-border bg-background px-3 py-1 text-navy hover:bg-secondary"
            >
              Reanalisar (ok)
            </button>
            <button
              type="button"
              onClick={() => analisar("atencao")}
              className="rounded-full border border-border bg-background px-3 py-1 text-navy hover:bg-secondary"
            >
              Simular atenção
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ControlesEnvio() {
  const [quando, setQuando] = useState<"agora" | "agendar">("agora");
  const [exportando, setExportando] = useState(false);
  const [exportado, setExportado] = useState(false);
  const timer = useRef<number | null>(null);

  function exportar() {
    setExportando(true);
    setExportado(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setExportando(false);
      setExportado(true);
    }, 1300);
  }
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
      <h3 className="mb-3 font-display text-base font-bold text-navy">Enviar</h3>

      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-navy">Observação (opcional)</span>
        <textarea
          rows={2}
          placeholder="Um recado para quem aprova…"
          className="w-full resize-none rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none focus:border-accent/60"
        />
      </label>

      <div className="mt-3">
        <span className="mb-1.5 block text-[11px] font-semibold text-navy">Agendamento</span>
        <div className="ec-pills" role="group" aria-label="Quando publicar">
          <button type="button" data-ativa={quando === "agora"} onClick={() => setQuando("agora")} className="ec-pill">
            Enviar à aprovação
          </button>
          <button type="button" data-ativa={quando === "agendar"} onClick={() => setQuando("agendar")} className="ec-pill">
            Agendar
          </button>
        </div>
        {quando === "agendar" && (
          <input
            type="datetime-local"
            className="mt-2 w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none focus:border-accent/60"
          />
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button type="button" className="ec-cta-ia-solido flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
          {quando === "agora" ? "Enviar à aprovação" : "Agendar envio"}
        </button>
        <button
          type="button"
          onClick={exportar}
          disabled={exportando}
          className="inline-flex items-center gap-2 rounded-xl border border-navy bg-background px-4 py-2.5 text-sm font-semibold text-navy hover:bg-secondary disabled:opacity-50"
        >
          {exportando ? (
            <>
              <span className="ec-spinner h-4 w-4" aria-hidden />
              Exportando…
            </>
          ) : exportado ? (
            <>
              <span className="text-[color:var(--success)]">
                <CheckMini />
              </span>
              Exportado
            </>
          ) : (
            "Exportar PNG"
          )}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Exportar é ação pontual → loader discreto, nunca o símbolo da IA. Mais formatos (SVG, .zip)
        ficam na gaveta de ajustes.
      </p>
    </section>
  );
}

/* ============================================================
   AGENTE_IA FLUTUANTE — ponto ÚNICO de ação de IA (Req. 11)
   RODADA 5 — ações novas: "montar carrossel com a IA" (só carrossel), e ações
   de texto DA ARTE ("escrever título/subtítulo/etiqueta com IA", "descrever
   imagem com a IA"). Preservado: texto E imagem; outside-click + Esc fecham.
   ============================================================ */

type AcaoAgente =
  | { tipo: "gerar" }
  | { tipo: "regenerar"; alvo: "legenda" | "hashtags" | "cta" }
  | { tipo: "sugerir" }
  | { tipo: "gerar-imagem" }
  | { tipo: "buscar-acervo" }
  | { tipo: "montar-carrossel" }
  | { tipo: "escrever-arte"; alvo: "titulo" | "subtitulo" | "etiqueta" }
  | { tipo: "descrever-imagem" };

function AgenteIa({
  processando,
  ehCarrossel,
  onAcao,
}: {
  processando: boolean;
  ehCarrossel: boolean;
  onAcao: (acao: AcaoAgente) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (raizRef.current && !raizRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  function disparar(acao: AcaoAgente) {
    setAberto(false);
    onAcao(acao);
  }

  return (
    <div
      ref={raizRef}
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      {aberto && (
        <div
          className="agente-painel pointer-events-auto max-h-[70vh] w-72 overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-float"
          role="menu"
        >
          <p className="mb-2 font-display text-sm font-bold text-navy">Peça à IA</p>
          <p className="mb-3 text-[11px] text-muted-foreground">
            O centro de comando das duas IAs — texto E imagem. Nada de botões soltos pelos blocos.
          </p>

          <p className="mb-1.5 font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Texto do post
          </p>
          <div className="space-y-1.5">
            <AgenteAcao onClick={() => disparar({ tipo: "gerar" })}>Gerar tudo de novo</AgenteAcao>
            <AgenteAcao onClick={() => disparar({ tipo: "regenerar", alvo: "legenda" })}>Regenerar legenda</AgenteAcao>
            <AgenteAcao onClick={() => disparar({ tipo: "regenerar", alvo: "hashtags" })}>Regenerar hashtags</AgenteAcao>
            <AgenteAcao onClick={() => disparar({ tipo: "regenerar", alvo: "cta" })}>Regenerar CTA</AgenteAcao>
            <AgenteAcao onClick={() => disparar({ tipo: "sugerir" })}>Sugerir outro ângulo</AgenteAcao>
          </div>

          <p className="mb-1.5 mt-3 font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Texto da arte
          </p>
          <div className="space-y-1.5">
            <AgenteAcao onClick={() => disparar({ tipo: "escrever-arte", alvo: "titulo" })}>Escrever título com IA</AgenteAcao>
            <AgenteAcao onClick={() => disparar({ tipo: "escrever-arte", alvo: "subtitulo" })}>Escrever subtítulo com IA</AgenteAcao>
            <AgenteAcao onClick={() => disparar({ tipo: "escrever-arte", alvo: "etiqueta" })}>Escrever etiqueta com IA</AgenteAcao>
          </div>

          <p className="mb-1.5 mt-3 font-display text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Imagem
          </p>
          <div className="space-y-1.5">
            <AgenteAcao destaque onClick={() => disparar({ tipo: "gerar-imagem" })}>Gerar imagem por IA</AgenteAcao>
            <AgenteAcao onClick={() => disparar({ tipo: "descrever-imagem" })}>Descrever imagem com a IA</AgenteAcao>
            <AgenteAcao onClick={() => disparar({ tipo: "buscar-acervo" })}>Buscar no acervo</AgenteAcao>
            {ehCarrossel && (
              <AgenteAcao destaque onClick={() => disparar({ tipo: "montar-carrossel" })}>
                Montar carrossel com a IA
              </AgenteAcao>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label="Agente de IA"
        aria-expanded={aberto}
        className={cn(
          "agente-float pointer-events-auto relative grid h-16 w-16 place-items-center rounded-full bg-card shadow-float",
          processando && "agente-processando",
        )}
      >
        <span className="agente-glow-a" />
        <span className="agente-glow-b" />
        <IaDigisystem size={48} estado={processando ? "processando" : "vivo"} />
      </button>

      {processando && (
        <span className="pointer-events-none fixed bottom-24 right-6 z-50 rounded-full bg-navy px-3 py-1 text-[11px] font-semibold text-navy-foreground shadow-float">
          IA gerando conteúdo…
        </span>
      )}
    </div>
  );
}

function AgenteAcao({
  children,
  onClick,
  destaque,
}: {
  children: React.ReactNode;
  onClick: () => void;
  destaque?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "agente-acao relative w-full rounded-lg border px-3 py-2 text-left text-xs font-medium text-navy transition-colors hover:border-accent/50 hover:bg-secondary",
        destaque ? "border-accent/50 bg-accent/5" : "border-border bg-background",
      )}
    >
      {children}
    </button>
  );
}

/* ============================================================
   TELA
   ============================================================ */

export function EstudioConteudo() {
  const [reduzido, setReduzido] = useState(false);

  // Stepper de 3 passos; o Conteúdo (índice 1) é o foco inicial.
  const [etapaAtiva, setEtapaAtiva] = useState(1);

  // Gaveta de ajustes avançados (desvio opcional, não é passo).
  const [gavetaAberta, setGavetaAberta] = useState(false);

  // Arte — insumos.
  const [template, setTemplate] = useState<TemplateId>("A");
  const [formato, setFormato] = useState<FormatoArte>("feed");
  const [conteudoAB, setConteudoAB] = useState<ConteudoArte>(CONTEUDO_AB_MOCK);
  const [pranchetas, setPranchetas] = useState<Prancheta[]>(PRANCHETAS_MOCK);
  const [slideAtivo, setSlideAtivo] = useState(0);
  // null = o quadro mostra o seletor de 3 zonas (nenhuma fonte ativa ainda).
  const [fonteAtiva, setFonteAtiva] = useState<FonteImagem | null>(null);

  // Texto do post
  const [legenda, setLegenda] = useState(LEGENDA_MOCK);
  const [cta, setCta] = useState(CTA_MOCK);
  const [estLegenda, setEstLegenda] = useState<EstadoComp>("ok");
  const [estHashtags, setEstHashtags] = useState<EstadoComp>("ok");
  const [estCta, setEstCta] = useState<EstadoComp>("ok");
  const [flash, setFlash] = useState<"legenda" | "hashtags" | "cta" | null>(null);
  const [gerandoTexto, setGerandoTexto] = useState(false);
  const [agenteProcessando, setAgenteProcessando] = useState(false);

  // Arte — estado assíncrono.
  const [gerandoImagem, setGerandoImagem] = useState(false);
  const [estadoImagem, setEstadoImagem] = useState<AsyncEstado>("vazio");
  const [buscaEstado, setBuscaEstado] = useState<AsyncEstado | "inicial">("inicial");
  const [paginaAcervo, setPaginaAcervo] = useState(1);
  const [uploadEstado, setUploadEstado] = useState<AsyncEstado | "inicial">("inicial");
  const [imagemSelecionada, setImagemSelecionada] = useState<number | null>(null);
  const [finalizando, setFinalizando] = useState(false);
  const [arteFinalizada, setArteFinalizada] = useState(false);

  // Picker de candidatas geradas pela IA (lacuna ALTA).
  const [candidatas, setCandidatas] = useState<string[]>([]);
  const [candidataSelecionada, setCandidataSelecionada] = useState<number | null>(null);

  const resultados = [
    "linear-gradient(140deg, var(--navy), var(--sky))",
    "linear-gradient(140deg, oklch(0.5 0.12 250), var(--accent))",
    "linear-gradient(140deg, var(--accent), oklch(0.75 0.14 60))",
    "linear-gradient(140deg, var(--sky), var(--navy))",
  ];
  const candidatasMock = [
    "linear-gradient(150deg, var(--navy), var(--sky))",
    "linear-gradient(150deg, oklch(0.5 0.12 250), var(--accent))",
    "linear-gradient(150deg, var(--accent), oklch(0.78 0.13 55))",
    "linear-gradient(150deg, var(--sky), oklch(0.5 0.12 250))",
  ];

  const ehCarrossel = template === "C";
  const conteudoVigente: ConteudoArte = ehCarrossel ? pranchetas[slideAtivo] : conteudoAB;

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);
  const agendar = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  function setEstado(bloco: "legenda" | "hashtags" | "cta", e: EstadoComp) {
    if (bloco === "legenda") setEstLegenda(e);
    if (bloco === "hashtags") setEstHashtags(e);
    if (bloco === "cta") setEstCta(e);
  }

  function onCampoArte(campo: keyof ConteudoArte, valor: string) {
    if (ehCarrossel) {
      setPranchetas((lista) => lista.map((p, i) => (i === slideAtivo ? { ...p, [campo]: valor } : p)));
    } else {
      setConteudoAB((c) => ({ ...c, [campo]: valor }));
    }
  }

  function onCampoPrancheta(campo: keyof Prancheta, valor: string) {
    setPranchetas((lista) => lista.map((p, i) => (i === slideAtivo ? { ...p, [campo]: valor } : p)));
  }

  function addPrancheta() {
    setPranchetas((lista) =>
      lista.length >= 8
        ? lista
        : [
            ...lista,
            {
              papel: "Extra",
              etiqueta: "",
              titulo: "",
              subtitulo: "",
              cor: "linear-gradient(150deg, var(--navy), var(--sky))",
              ctaTexto: "",
              ctaFundo: "#ff6d2d",
              ctaTexto_cor: "#ffffff",
              foco: "centro",
            },
          ],
    );
  }
  function removePrancheta() {
    setPranchetas((lista) => (lista.length <= 2 ? lista : lista.slice(0, -1)));
    setSlideAtivo((i) => Math.min(i, pranchetas.length - 2));
  }

  function regenerarTexto(alvo?: "legenda" | "hashtags" | "cta") {
    setAgenteProcessando(true);
    setGerandoTexto(true);
    setFlash(null);
    agendar(() => {
      setAgenteProcessando(false);
      setGerandoTexto(false);
      if (alvo) {
        setEstado(alvo, "ok");
        setFlash(alvo);
      } else {
        setEstLegenda("ok");
        setEstHashtags("ok");
        setEstCta("ok");
        setFlash("legenda");
      }
      agendar(() => setFlash(null), 1100);
    }, 1600);
  }

  function onGerarImagem() {
    setFonteAtiva("gerar");
    setEstadoImagem("carregando");
    setGerandoImagem(true);
    setAgenteProcessando(true);
    setCandidatas([]);
    setCandidataSelecionada(null);
    agendar(() => {
      setGerandoImagem(false);
      setAgenteProcessando(false);
      setEstadoImagem("sucesso");
      setCandidatas(candidatasMock);
      setCandidataSelecionada(0);
    }, 2200);
  }

  function onGerarStory() {
    setFormato("story");
    onGerarImagem();
  }

  function onMontarCarrossel() {
    setTemplate("C");
    setSlideAtivo(0);
    onGerarImagem();
  }

  function onBuscar(_termo?: string) {
    setFonteAtiva("acervo");
    setBuscaEstado("carregando");
    setPaginaAcervo(1);
    agendar(() => setBuscaEstado("sucesso"), 1300);
  }
  function onBuscarMais() {
    setBuscaEstado("carregando");
    agendar(() => {
      setPaginaAcervo((p) => p + 1);
      setBuscaEstado("sucesso");
    }, 900);
  }

  function onUpload() {
    setFonteAtiva("upload");
    setUploadEstado("carregando");
    agendar(() => {
      setUploadEstado("sucesso");
      setEstadoImagem("sucesso");
      setCandidatas([]);
      setCandidataSelecionada(null);
      setImagemSelecionada((s) => (s === null ? 0 : s));
    }, 1400);
  }

  // RODADA 6: "Trocar imagem" — reabre o seletor de 3 zonas NO MESMO quadro,
  // limpando a imagem escolhida, sem fechar nada nem deslocar o layout.
  function onTrocarImagem() {
    setFonteAtiva(null);
    setEstadoImagem("vazio");
    setImagemSelecionada(null);
    setCandidatas([]);
    setCandidataSelecionada(null);
    setUploadEstado("inicial");
    setBuscaEstado("inicial");
    setArteFinalizada(false);
  }

  function onAcaoAgente(acao: AcaoAgente) {
    switch (acao.tipo) {
      case "gerar":
      case "sugerir":
        regenerarTexto();
        break;
      case "regenerar":
        regenerarTexto(acao.alvo);
        break;
      case "escrever-arte":
        // Mock: a IA "escreve" o campo da arte da prancheta/AB vigente.
        setAgenteProcessando(true);
        agendar(() => {
          setAgenteProcessando(false);
          const textos: Record<string, string> = {
            titulo: "Dado organizado, decisão melhor",
            subtitulo: "A base certa tira a equipe do achismo.",
            etiqueta: "Governança de dados",
          };
          onCampoArte(acao.alvo, textos[acao.alvo]);
        }, 1200);
        break;
      case "descrever-imagem":
        setAgenteProcessando(true);
        agendar(() => setAgenteProcessando(false), 1200);
        break;
      case "gerar-imagem":
        onGerarImagem();
        break;
      case "montar-carrossel":
        onMontarCarrossel();
        break;
      case "buscar-acervo":
        onBuscar();
        break;
    }
  }

  function onSelecionar(i: number) {
    setImagemSelecionada(i);
    setCandidataSelecionada(null);
    setEstadoImagem("sucesso");
  }
  function onSelecionarCandidata(i: number) {
    setCandidataSelecionada(i);
    setImagemSelecionada(null);
    setEstadoImagem("sucesso");
  }

  function onFinalizar() {
    setFinalizando(true);
    setArteFinalizada(false);
    agendar(() => {
      setFinalizando(false);
      setArteFinalizada(true);
    }, 1400);
  }

  function irParaRevisar() {
    setGavetaAberta(false);
    setEtapaAtiva(2);
    window.scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" });
  }
  function abrirPersonalizacao() {
    setGavetaAberta(true);
  }

  const noConteudo = etapaAtiva === 1;
  const noRevisar = etapaAtiva === 2;

  return (
    <div className={cn("app-ambience min-h-screen", reduzido && "reduzir-mov")}>
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-16">
        <BarraProto reduzido={reduzido} setReduzido={setReduzido} />

        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-card">
          <IndicadorEtapas etapaAtiva={etapaAtiva} />
          <SimularEtapa etapaAtiva={etapaAtiva} setEtapaAtiva={setEtapaAtiva} />
        </div>

        {/* ---------- PASSO CONTEÚDO (minimalista) ---------- */}
        {noConteudo && (
          <>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ColunaTexto
                ehCarrossel={ehCarrossel}
                conteudoVigente={conteudoVigente}
                onCampoArte={onCampoArte}
                slideAtivo={slideAtivo}
                totalPranchetas={pranchetas.length}
                papelPrancheta={pranchetas[slideAtivo]?.papel ?? ""}
                setSlideAtivo={setSlideAtivo}
                legenda={legenda}
                hashtags={HASHTAGS_MOCK}
                cta={cta}
                setLegenda={setLegenda}
                setCta={setCta}
                estadoLegenda={estLegenda}
                estadoHashtags={estHashtags}
                estadoCta={estCta}
                setEstado={setEstado}
                flash={flash}
                gerandoTexto={gerandoTexto}
              />
              <PainelArte
                reduzido={reduzido}
                template={template}
                setTemplate={setTemplate}
                formato={formato}
                setFormato={setFormato}
                onGerarStory={onGerarStory}
                conteudoVigente={conteudoVigente}
                ehCarrossel={ehCarrossel}
                pranchetas={pranchetas}
                slideAtivo={slideAtivo}
                setSlideAtivo={setSlideAtivo}
                gerandoImagem={gerandoImagem}
                estadoImagem={estadoImagem}
                onGerarImagem={onGerarImagem}
                candidatas={candidatas}
                candidataSelecionada={candidataSelecionada}
                onSelecionarCandidata={onSelecionarCandidata}
                buscaEstado={buscaEstado}
                onBuscar={onBuscar}
                onBuscarMais={onBuscarMais}
                paginaAcervo={paginaAcervo}
                resultados={resultados}
                imagemSelecionada={imagemSelecionada}
                onSelecionar={onSelecionar}
                finalizando={finalizando}
                arteFinalizada={arteFinalizada}
                onFinalizar={onFinalizar}
                uploadEstado={uploadEstado}
                onUpload={onUpload}
                fonteAtiva={fonteAtiva}
                setFonteAtiva={setFonteAtiva}
                onTrocarImagem={onTrocarImagem}
              />
            </div>

            <Bifurcacao onRevisar={irParaRevisar} onPersonalizar={abrirPersonalizacao} />

            {/* Demonstradores (só do protótipo). */}
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/70 p-4">
              <p className="mb-2 font-display text-sm font-bold text-navy">
                Demonstrar estados e lacunas (rodada 6 — fonte in-frame)
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <BotaoDemo onClick={onTrocarImagem}>Seletor vazio (3 zonas)</BotaoDemo>
                <BotaoDemo
                  onClick={() => {
                    setEstadoImagem("vazio");
                    setBuscaEstado("vazio");
                    setFonteAtiva("acervo");
                    setImagemSelecionada(null);
                    setCandidatas([]);
                    setCandidataSelecionada(null);
                  }}
                >
                  Vazio (acervo)
                </BotaoDemo>
                <BotaoDemo
                  onClick={() => {
                    setGerandoImagem(false);
                    setEstadoImagem("erro");
                  }}
                >
                  Erro
                </BotaoDemo>
                <BotaoDemo onClick={() => onBuscar()}>Carregando (busca)</BotaoDemo>
                <BotaoDemo onClick={onGerarImagem}>Gerar (candidatas)</BotaoDemo>
                <BotaoDemo onClick={onUpload}>Carregando (upload)</BotaoDemo>
                <BotaoDemo onClick={() => setFormato(formato === "feed" ? "story" : "feed")}>
                  Alternar Feed/Story
                </BotaoDemo>
                <BotaoDemo
                  onClick={() => {
                    setTemplate("C");
                    setSlideAtivo(0);
                  }}
                >
                  Ver carrossel (C)
                </BotaoDemo>
                <BotaoDemo onClick={abrirPersonalizacao}>Abrir ajustes avançados</BotaoDemo>
                <BotaoDemo
                  onClick={() => {
                    setBuscaEstado("inicial");
                    setUploadEstado("inicial");
                    setEstadoImagem("vazio");
                    setFonteAtiva(null);
                    setImagemSelecionada(null);
                    setCandidatas([]);
                    setCandidataSelecionada(null);
                    setArteFinalizada(false);
                    setTemplate("A");
                    setFormato("feed");
                  }}
                >
                  Reset
                </BotaoDemo>
              </div>
            </div>
          </>
        )}

        {/* ---------- PASSO REVISAR / ENVIAR ---------- */}
        {noRevisar && (
          <PassoRevisar
            conteudoVigente={conteudoVigente}
            legenda={legenda}
            hashtags={HASHTAGS_MOCK}
            cta={cta}
            template={template}
            formato={formato}
            reduzido={reduzido}
            onVoltar={() => setEtapaAtiva(1)}
          />
        )}

        {/* ---------- PASSO CONTEXTO (fora de escopo deste protótipo) ---------- */}
        {etapaAtiva === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center">
            <p className="font-display text-base font-bold text-navy">Etapa Contexto</p>
            <p className="mt-1 text-sm text-muted-foreground">
              O briefing (origem, tema, redes) vive na etapa anterior. Este protótipo foca em
              Conteúdo e Revisar/Enviar.
            </p>
            <button
              type="button"
              onClick={() => setEtapaAtiva(1)}
              className="ec-cta-ia-solido mt-3 rounded-full px-5 py-2 text-sm font-semibold text-white"
            >
              Ir para o Conteúdo →
            </button>
          </div>
        )}
      </div>

      {/* Gaveta de ajustes avançados (desvio opcional, redimensionável + prévia ao lado). */}
      <GavetaAvancada
        aberta={gavetaAberta}
        reduzido={reduzido}
        template={template}
        ehCarrossel={ehCarrossel}
        pranchetas={pranchetas}
        slideAtivo={slideAtivo}
        setSlideAtivo={setSlideAtivo}
        onCampoPrancheta={onCampoPrancheta}
        conteudoVigente={conteudoVigente}
        formato={formato}
        totalPranchetas={pranchetas.length}
        onAddPrancheta={addPrancheta}
        onRemovePrancheta={removePrancheta}
        onFechar={() => setGavetaAberta(false)}
        onConcluir={irParaRevisar}
      />

      <AgenteIa processando={agenteProcessando} ehCarrossel={ehCarrossel} onAcao={onAcaoAgente} />
    </div>
  );
}

function BotaoDemo({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border bg-background px-3 py-1.5 text-navy transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}
