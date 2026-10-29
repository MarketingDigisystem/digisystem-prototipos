/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/admin/AbaIA.tsx, src/components/admin/PromptModularItem.tsx,
 *   src/components/planejamento/ParecerTriagem.tsx, src/components/estudio/PainelParecerPost.tsx
 *   @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md
 *   (seções 2.3 e 7: todos os prompts num lugar só).
 *
 * Configurações → IA e prompts (antiga IA & Conteúdo). Sub-abas em pílula do
 * real (Como a IA é montada · Texto · Imagem) e uma nova, Pareceres, com os
 * prompts do parecer da triagem (Pedidos) e da aprovação (Para aprovar), que
 * hoje vivem no código. A sub-aba fica no endereço (?sub=), para outras telas
 * apontarem direto para ela.
 * Regras (regras.ts → IA e prompts): prompt não fica vazio e mantém os
 * marcadores obrigatórios ({{hashtagsOficiais}}); contradições com a marca
 * aparecem em cima do campo com a correção pronta; "O que o agente escreve"
 * precisa de ao menos um campo ligado.
 */
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, Image as ImageIcon, Info, Layers, MessageSquareText, Type, Undo2 } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { TextGenerateDigisystem } from "../../../TextGenerateDigisystem";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { hrefDe, navegar, type Rota } from "../../router";
import { useHub } from "../../store/HubStore";
import { CAMADAS_IA, PROMPTS_BASE } from "../../store/mock-referencia";
import { avisosDoPrompt, MARCADORES_OBRIGATORIOS, validarCamposAgente, validarPrompt } from "../../store/regras";
import type { CamposAgente, PromptConfig } from "../../store/tipos";
import { atraso, BotaoContorno, BotaoSalvar, Origem, SecaoConfig } from "./partes";

type SubAba = "camadas" | "texto" | "imagem" | "pareceres";

const SUBS: { id: SubAba; label: string; Icone?: typeof Layers }[] = [
  { id: "camadas", label: "Como a IA é montada", Icone: Layers },
  { id: "texto", label: "Texto", Icone: Type },
  { id: "imagem", label: "Imagem", Icone: ImageIcon },
  { id: "pareceres", label: "Pareceres", Icone: MessageSquareText },
];

export function IaPrompts({ rota }: { rota: Rota }) {
  const { dados } = useHub();
  const sub: SubAba = (SUBS.find((s) => s.id === rota.params.sub)?.id ?? "camadas") as SubAba;
  const noBanco = dados.prompts.filter((p) => p.noBanco).length;
  const padrao = dados.prompts.length - noBanco;

  return (
    <>
      <CabecalhoArea
        area="configuracoes"
        aba="ia"
        subtitulo="Todos os prompts da IA num lugar só: texto, imagem e os pareceres de pedidos e posts."
      />

      <div className="animate-rise mt-8 flex flex-wrap items-center justify-between gap-4" style={atraso(60)}>
        <div role="tablist" aria-label="Partes da IA" className="inline-flex flex-wrap gap-1 rounded-full bg-secondary/60 p-1">
          {SUBS.map(({ id, label, Icone }) => {
            const ativo = sub === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => navegar("configuracoes", "ia", { sub: id === "camadas" ? undefined : id })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-display text-[12px] font-bold transition-all duration-300",
                  ativo ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-primary",
                )}
              >
                {Icone && <Icone aria-hidden className="h-3.5 w-3.5" />} {label}
              </button>
            );
          })}
        </div>
        <p className="text-[13px] text-muted-foreground">
          {dados.prompts.length} prompts: {noBanco} configurados no banco e {padrao} no padrão do sistema.
        </p>
      </div>

      <div key={sub} className="animate-rise mt-6 max-w-4xl">
        {sub === "texto" ? <IaTexto /> : sub === "imagem" ? <IaImagem /> : sub === "pareceres" ? <IaPareceres /> : <IaCamadas />}
      </div>
    </>
  );
}

// ─── Como a IA é montada (IaCamadas real) ─────────────────────────────────

function IaCamadas() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="max-w-prose">
        <h2 className="font-display text-base font-bold text-primary">Como a IA é montada</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Todo texto e toda imagem nascem empilhando quatro camadas. As duas de cima são a marca e nunca mudam; as duas de baixo mudam por ação e por post.
        </p>
      </div>
      <ol className="relative mt-6 space-y-6 border-l border-border/70 pl-6">
        {CAMADAS_IA.map((c) => (
          <li key={c.id} className="relative">
            <span
              aria-hidden
              className={cn("absolute -left-[31px] top-1 grid h-3 w-3 place-items-center rounded-full ring-4 ring-card", c.fixa ? "bg-primary" : "bg-accent")}
            />
            <div className="flex items-baseline gap-2.5">
              <span className={cn("font-display text-2xl font-bold leading-none", c.fixa ? "text-primary" : "text-accent")}>{c.numero}</span>
              <h3 className="font-display text-base font-bold text-primary">{c.nome}</h3>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{c.fixa ? "fixa" : "muda"}</span>
            </div>
            <p className="mt-1.5 max-w-prose text-[13px] leading-relaxed text-foreground/80">{c.papel}</p>
            <p className="mt-2 border-l-2 border-border pl-3 text-[13px] italic leading-relaxed text-muted-foreground">{c.trecho}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
        É por isso que refinar "com direção" não cria um prompt do zero: só a camada de <span className="font-semibold text-primary">Tarefa</span> muda de frase.
        As regras da marca continuam as mesmas em toda geração. Os pareceres de Pedidos e de Para aprovar usam as mesmas duas camadas de cima.
      </p>
    </section>
  );
}

function PromptMontado({ tarefa, contexto }: { tarefa: string; contexto: string }) {
  const linhas = [
    { n: "01", nome: "Base", texto: "Identidade e voz da Digisystem", varia: false },
    { n: "02", nome: "Manual de Estilo", texto: "As regras da marca", varia: false },
    { n: "03", nome: "Tarefa", texto: tarefa, varia: true },
    { n: "04", nome: "Contexto", texto: contexto, varia: true },
  ];
  return (
    <div className="rounded-3xl border border-border bg-secondary/25 p-4">
      <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">O que a IA recebe</p>
      <ul className="mt-3 space-y-1.5">
        {linhas.map((l) => (
          <li key={l.n} className={cn("flex gap-3 rounded-2xl px-3 py-2", l.varia ? "bg-card shadow-card" : "opacity-70")}>
            <span className={cn("font-display text-sm font-bold leading-6", l.varia ? "text-accent" : "text-muted-foreground")}>{l.n}</span>
            <div className="min-w-0">
              <p className={cn("font-display text-[13px] font-bold leading-6", l.varia ? "text-primary" : "text-muted-foreground")}>
                {l.nome}
                {!l.varia && <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">fixa</span>}
              </p>
              <p className="text-[13px] leading-relaxed text-foreground/80">{l.texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Texto ────────────────────────────────────────────────────────────────

const LEGENDA_BASE =
  "Governança de dados não precisa travar o time. A gente estrutura o essencial (dono, política e ciclo de revisão) e deixa o resto evoluir com o uso. O resultado é previsibilidade sem burocracia.";
const DIRECOES = [
  {
    id: "curta",
    label: "Mais curta",
    diretriz: "deixe a legenda mais curta e enxuta",
    resultado: "Governança de dados não precisa travar o time. Estruture o essencial (dono, política, ciclo de revisão) e deixe o resto evoluir com o uso.",
  },
  {
    id: "provocativa",
    label: "Mais provocativa",
    diretriz: "use um tom mais provocativo, começando por uma pergunta que incomoda",
    resultado:
      "Sua governança de dados virou burocracia? Se ninguém sabe quem é dono do dado, o problema não é falta de regra, é excesso. Comece pelo essencial.",
  },
  {
    id: "beneficio",
    label: "Foca no benefício",
    diretriz: "foque nos benefícios concretos para o time e para o negócio",
    resultado:
      "Com governança de dados no ponto certo, quem precisa do dado encontra na hora e quem cuida dele sabe o que está sob sua responsabilidade. Menos retrabalho, mais confiança.",
  },
];

function IaTexto() {
  const { dados } = useHub();
  const manual = dados.prompts.find((p) => p.id === "pr-manual");
  const porTarefa = dados.prompts.filter((p) => p.grupo === "texto" && p.id !== "pr-manual");

  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-2xl bg-sky-soft p-4">
        <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-foreground/80">
          O texto já parte do Manual de Estilo da marca (tom, termos banidos, hashtags). A partir dele, o agente refina com uma direção, sem começar do
          zero. Esta aba mostra como isso funciona e deixa você editar as regras da marca.
        </p>
      </div>

      <RefinarComDirecao />
      <CamposDoAgente />

      {manual && (
        <SecaoConfig
          titulo="Manual de Estilo (a camada de regras da marca)"
          descricao="É a camada 02. Legenda, hashtags e título/subtítulo seguem essas regras em toda geração. Os termos banidos que a Marca mostra na aba Voz saem daqui."
        >
          <EditorPrompt prompt={manual} linhas={16} rotulo="Regras da marca" />
        </SecaoConfig>
      )}

      <SecaoConfig
        titulo="Prompts por tarefa"
        descricao="A camada 03 de cada geração de texto do Estúdio. Recebem o Manual de Estilo acima como contexto."
      >
        <div className="mt-4 divide-y divide-border border-y border-border">
          {porTarefa.map((p) => (
            <ItemPrompt key={p.id} prompt={p} abertoInicial={avisosDoPrompt(p.texto).length > 0} />
          ))}
        </div>
      </SecaoConfig>
    </div>
  );
}

function RefinarComDirecao() {
  const [legenda, setLegenda] = useState(LEGENDA_BASE);
  const [anterior, setAnterior] = useState<string | null>(null);
  const [diretriz, setDiretriz] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [chave, setChave] = useState(0);

  const refinar = (d: (typeof DIRECOES)[number]) => {
    if (processando) return;
    setProcessando(true);
    setDiretriz(d.diretriz);
    window.setTimeout(() => {
      setAnterior(legenda);
      setLegenda(d.resultado);
      setChave((k) => k + 1);
      setProcessando(false);
    }, 1200);
  };

  return (
    <SecaoConfig titulo="Refinar com direção" descricao="Demonstração ilustrativa: nada aqui chama a IA. A geração real acontece no Estúdio.">
      <div className="mt-4 min-h-[88px] rounded-2xl border border-border bg-secondary/25 p-4">
        {processando ? (
          <div className="flex items-center gap-3">
            <IaDigisystem size={40} estado="processando" />
            <p className="text-sm text-muted-foreground">Reescrevendo com a sua direção…</p>
          </div>
        ) : (
          <TextGenerateDigisystem remontarKey={chave} texto={legenda} className="text-sm leading-relaxed text-foreground" />
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">Refinar:</span>
        {DIRECOES.map((d) => (
          <button
            key={d.id}
            type="button"
            disabled={processando}
            onClick={() => refinar(d)}
            className="rounded-full border border-border bg-card px-3 py-1.5 font-display text-[12px] font-bold text-primary transition-colors duration-300 hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {d.label}
          </button>
        ))}
        {anterior !== null && !processando && (
          <button
            type="button"
            onClick={() => {
              setLegenda(anterior);
              setAnterior(null);
              setChave((k) => k + 1);
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[12px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
          >
            <Undo2 aria-hidden className="h-3.5 w-3.5" /> Desfazer
          </button>
        )}
      </div>
      {diretriz && (
        <div className="mt-4">
          <PromptMontado tarefa={`revise a legenda seguindo esta direção: «${diretriz}»`} contexto="marca Digisystem · canal Instagram · briefing do post" />
        </div>
      )}
    </SecaoConfig>
  );
}

function CamposDoAgente() {
  const { dados, acoes } = useHub();
  const [campos, setCampos] = useState<CamposAgente>(dados.camposAgente);
  useEffect(() => setCampos(dados.camposAgente), [dados.camposAgente]);
  const valido = validarCamposAgente(campos);
  const mudou = JSON.stringify(campos) !== JSON.stringify(dados.camposAgente);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2">
        <IaDigisystem size={22} />
        <h2 className="font-display text-base font-bold text-primary">O que o agente escreve</h2>
      </div>
      <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
        Quando você usa Criar post estático ou Estilo blog no Estúdio, o agente escreve os campos marcados aqui.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["kicker", "Kicker"],
            ["titulo", "Título"],
            ["subtitulo", "Subtítulo"],
          ] as const
        ).map(([k, label]) => {
          const ligado = campos[k];
          return (
            <button
              key={k}
              type="button"
              aria-pressed={ligado}
              onClick={() => setCampos((c) => ({ ...c, [k]: !c[k] }))}
              className={cn(
                "rounded-full px-4 py-2 font-display text-xs font-bold transition-all duration-300",
                ligado ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-muted-foreground hover:text-primary",
              )}
            >
              {label}: {ligado ? "ligado" : "desligado"}
            </button>
          );
        })}
      </div>
      {!valido.ok && <p className="mt-3 rounded-2xl bg-warning-soft px-3 py-2 text-[12px] text-foreground/80">{valido.motivo}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <BotaoSalvar onClick={() => acoes.salvarCamposAgente(campos)} disabled={!valido.ok || !mudou} />
        <Origem noBanco />
      </div>
    </section>
  );
}

/**
 * Editor de um prompt (PromptModularItem real): textarea mono, origem,
 * Salvar e Restaurar padrão. "Restaurar padrão" só preenche o campo; grava
 * quando a pessoa clica em Salvar, como no real.
 */
function EditorPrompt({ prompt, linhas = 10, rotulo }: { prompt: PromptConfig; linhas?: number; rotulo?: string }) {
  const { acoes } = useHub();
  const [texto, setTexto] = useState(prompt.texto);
  const [erro, setErro] = useState("");
  useEffect(() => setTexto(prompt.texto), [prompt.texto]);

  const padrao = PROMPTS_BASE.find((p) => p.id === prompt.id)?.texto ?? prompt.texto;
  const avisos = avisosDoPrompt(texto);
  const marcadores = MARCADORES_OBRIGATORIOS[prompt.id] ?? [];
  const mudou = texto.trim() !== prompt.texto.trim();
  const id = `prompt-${prompt.id}`;

  const salvar = () => {
    const r = validarPrompt(prompt.id, texto);
    if (!r.ok) return setErro(r.motivo);
    acoes.salvarPrompt(prompt.id, texto);
  };

  return (
    <div className="mt-4 space-y-3">
      {avisos.map((a) => (
        <div key={a.texto} className="flex flex-wrap items-start gap-3 rounded-2xl bg-warning-soft px-3 py-2.5 text-[12px] leading-relaxed text-foreground/85">
          <p className="min-w-0 flex-1">{a.texto}</p>
          {a.trocar && (
            <button
              type="button"
              onClick={() => setTexto((t) => t.replace(a.trocar!.de, a.trocar!.para))}
              className="shrink-0 font-display text-xs font-bold text-primary hover:text-accent"
            >
              Usar a regra da marca
            </button>
          )}
        </div>
      ))}
      <div>
        {rotulo && (
          <label htmlFor={id} className="font-display text-sm font-semibold text-foreground">
            {rotulo}
          </label>
        )}
        <textarea
          id={id}
          aria-label={rotulo ? undefined : prompt.titulo}
          rows={linhas}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setErro("");
          }}
          spellCheck={false}
          className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2 font-mono text-xs leading-relaxed outline-none transition-colors duration-300 focus:border-sky focus:ring-2 focus:ring-sky/30"
        />
        {marcadores.length > 0 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {marcadores.map((m) => (
              <span key={m.marcador}>
                <code className="rounded bg-secondary px-1 font-mono">{m.marcador}</code> é trocado na hora de gerar e precisa ficar no texto.{" "}
              </span>
            ))}
          </p>
        )}
      </div>
      {erro && <p role="alert" className="text-[12px] text-destructive">{erro}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <BotaoSalvar onClick={salvar} disabled={!mudou} />
        <BotaoContorno onClick={() => setTexto(padrao)} disabled={texto === padrao}>
          Restaurar padrão
        </BotaoContorno>
        <Origem noBanco={prompt.noBanco} extra="O formato da resposta é fixo e não editável." />
      </div>
    </div>
  );
}

/** Item de acordeão do PromptModularItem real: título + selo banco/padrão. */
function ItemPrompt({ prompt, abertoInicial = false }: { prompt: PromptConfig; abertoInicial?: boolean }) {
  const [aberto, setAberto] = useState(abertoInicial);
  const avisos = avisosDoPrompt(prompt.texto).length;
  const idConteudo = `conteudo-${prompt.id}`;
  return (
    <div>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls={idConteudo}
        className="flex w-full items-center gap-2 py-3 text-left"
      >
        <span className="font-display text-xs font-bold text-primary">{prompt.titulo}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            prompt.noBanco ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
          )}
        >
          {prompt.noBanco ? "banco" : "padrão"}
        </span>
        {avisos > 0 && <span className="font-display text-[11px] font-bold text-accent">contradiz a marca</span>}
        <ChevronDown aria-hidden className={cn("ml-auto h-4 w-4 text-muted-foreground transition-transform duration-300", aberto && "rotate-180")} />
      </button>
      {aberto && (
        <div id={idConteudo} className="pb-4">
          <p className="text-[11px] text-muted-foreground">{prompt.descricao}</p>
          <EditorPrompt prompt={prompt} />
        </div>
      )}
    </div>
  );
}

// ─── Imagem ───────────────────────────────────────────────────────────────

function IaImagem() {
  const { dados } = useHub();
  const imagem = dados.prompts.filter((p) => p.grupo === "imagem");
  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-2xl bg-sky-soft p-4">
        <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-foreground/80">
          A IA gera só a <strong>cena</strong> (a foto de pessoas em tecnologia). Cor, logo e título entram <strong>depois</strong>, na composição. Por
          isso o prompt de imagem nunca deve pedir texto, logotipo ou cores de marca dentro da foto.
        </p>
      </div>

      <SecaoConfig
        icone={<IaDigisystem size={20} />}
        titulo="Prompt de imagem"
        descricao="Instrução que a IA usa para descrever a cena do post quando não há imagem enviada. É a camada de Tarefa da geração de imagem; o estilo fotográfico e os negativos (sem texto, sem logo, sem marca) já vivem aqui."
      >
        <div className="mt-4 divide-y divide-border border-y border-border">
          {imagem.map((p) => (
            <ItemPrompt key={p.id} prompt={p} abertoInicial />
          ))}
        </div>
      </SecaoConfig>

      <SecaoConfig
        titulo="Proporção por situação"
        descricao="A proporção sai do tipo de peça, não precisa configurar aqui: post estático e carrossel usam quadrado (1:1); story e reels usam vertical (9:16). O mesmo prompt de cena serve para as três."
      >
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "Post estático", prop: "1:1" },
            { label: "Carrossel", prop: "1:1" },
            { label: "Story e Reels", prop: "9:16" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-secondary/25 px-4 py-2">
              <p className="font-display text-xs font-bold text-primary">{s.label}</p>
              <p className="text-[11px] text-muted-foreground">Proporção {s.prop}</p>
            </div>
          ))}
        </div>
      </SecaoConfig>
    </div>
  );
}

// ─── Pareceres (novo: hoje vivem no código) ───────────────────────────────

const ONDE_PARECER: Record<string, { onde: string; href: string; link: string }> = {
  "pr-parecer-triagem": {
    onde: "Aparece em Tarefas → Pedidos, logo depois que alguém assume o pedido.",
    href: hrefDe("tarefas", "pedidos"),
    link: "Abrir Pedidos",
  },
  "pr-parecer-aprovacao": {
    onde: "Aparece em Posts → Para aprovar, quando quem aprova pede a análise.",
    href: hrefDe("posts", "aprovar"),
    link: "Abrir Para aprovar",
  },
};

function IaPareceres() {
  const { dados } = useHub();
  const pareceres = dados.prompts.filter((p) => p.grupo === "pareceres");
  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-2xl bg-sky-soft p-4">
        <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-foreground/80">
          Hoje os dois pareceres vivem no código do app e só mudam com uma nova versão. Aqui eles passam a ser editáveis como os outros prompts. O
          formato da resposta (nível, prontidão de 0 a 100 e os pontos) continua fixo, porque as telas leem campo a campo.
        </p>
      </div>
      {pareceres.map((p, i) => {
        const onde = ONDE_PARECER[p.id];
        return (
          <SecaoConfig
            key={p.id}
            delay={i * 60}
            icone={<IaDigisystem size={20} />}
            titulo={p.titulo}
            descricao={p.descricao}
            extra={
              onde && (
                <a href={onde.href} className="inline-flex items-center gap-1 font-display text-xs font-bold text-primary hover:text-accent">
                  {onde.link} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                </a>
              )
            }
          >
            {onde && <p className="mt-3 text-[12px] text-muted-foreground">{onde.onde}</p>}
            <EditorPrompt prompt={p} linhas={8} />
          </SecaoConfig>
        );
      })}
    </div>
  );
}
