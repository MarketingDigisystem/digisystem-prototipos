/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/metricas.tsx (parte SWOT), src/hooks/use-swot.ts
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Tendências → SWOT (proposta 2.3: sai de Métricas e vem para o olhar de fora).
 *  - Os 4 quadrantes do real (tons e ícones iguais: Forças Shield verde,
 *    Fraquezas AlertTriangle vermelho, Oportunidades Target azul, Ameaças Zap
 *    âmbar), com bolinha laranja, chip "Editado", editar no hover e voltar ao
 *    texto da IA.
 *  - Os quadrantes ganham o eixo "Por dentro" / "Por fora" (leitura editorial,
 *    em vez de 4 caixas soltas).
 *  - "Regenerar" vira "Regenerar com a IA", com o símbolo IaDigisystem (nunca
 *    RefreshCw/Sparkles). A leitura é simulada (regras.ts → regenerarSwot): o
 *    que foi editado à mão não é trocado; os pontos novos ficam marcados "Novo".
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AlertTriangle, Check, Pencil, RotateCcw, Shield, Target, Zap, type LucideIcon } from "lucide-react";
import { IaDigisystem } from "../../../IaDigisystem";
import { TextGenerateDigisystem } from "../../../TextGenerateDigisystem";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { useHub } from "../../store/HubStore";
import { ddmm, diaDe, itensDoQuadrante, plural } from "../../store/regras";
import type { QuadranteSwot, SwotItem } from "../../store/tipos";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

const QUADRANTE: Record<QuadranteSwot, { titulo: string; frase: string; Icone: LucideIcon; tom: string }> = {
  forcas: { titulo: "Forças", frase: "O que joga a favor da Digisystem hoje.", Icone: Shield, tom: "bg-success-soft text-success" },
  fraquezas: { titulo: "Fraquezas", frase: "O que ainda segura o marketing.", Icone: AlertTriangle, tom: "bg-destructive/10 text-destructive" },
  oportunidades: { titulo: "Oportunidades", frase: "Onde o mercado está abrindo espaço.", Icone: Target, tom: "bg-sky-soft text-primary" },
  ameacas: { titulo: "Ameaças", frase: "O que pode tirar a conversa da Digisystem.", Icone: Zap, tom: "bg-warning-soft text-warning" },
};

const EIXOS: { rotulo: string; explica: string; quadrantes: [QuadranteSwot, QuadranteSwot] }[] = [
  { rotulo: "Por dentro", explica: "o que depende da própria Digisystem", quadrantes: ["forcas", "fraquezas"] },
  { rotulo: "Por fora", explica: "o que vem do mercado, das tendências e dos concorrentes", quadrantes: ["oportunidades", "ameacas"] },
];

const DURACAO_ANALISE = 3600;

/** Dias inteiros entre dois dias YYYY-MM-DD. */
function diasEntre(de: string, ate: string): number {
  const [a1, m1, d1] = de.split("-").map(Number);
  const [a2, m2, d2] = ate.split("-").map(Number);
  return Math.round((new Date(a2, m2 - 1, d2).getTime() - new Date(a1, m1 - 1, d1).getTime()) / 86_400_000);
}

export function Swot() {
  const { dados, hoje, acoes } = useHub();
  const [analisando, setAnalisando] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [novos, setNovos] = useState<Set<string>>(new Set());
  const [editando, setEditando] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const etapas = [
    `Lendo as ${dados.tendencias.length} tendências do radar…`,
    `Cruzando com ${plural(dados.concorrentes.length, "concorrente", "concorrentes")} acompanhados…`,
    "Revisando os pontos de cada quadrante…",
  ];

  const regenerar = () => {
    setEditando(null);
    setAnalisando(true);
    setEtapa(0);
    timers.current = [
      window.setTimeout(() => setEtapa(1), DURACAO_ANALISE / 3),
      window.setTimeout(() => setEtapa(2), (DURACAO_ANALISE * 2) / 3),
      window.setTimeout(() => {
        setNovos(new Set(acoes.regenerarSwot()));
        setAnalisando(false);
      }, DURACAO_ANALISE),
    ];
  };

  const total = dados.swot.length;
  const editados = dados.swot.filter((i) => i.editadoManualmente).length;
  const dias = diasEntre(diaDe(dados.swotAnalisadoEm), hoje);
  const quando = dias <= 0 ? "hoje" : dias === 1 ? "ontem" : `há ${dias} dias`;

  return (
    <>
      <CabecalhoArea
        area="tendencias"
        aba="swot"
        subtitulo="Forças, fraquezas, oportunidades e ameaças da Digisystem hoje."
      />

      <section
        aria-label="Sobre esta análise"
        className="animate-rise mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        style={delay(70)}
      >
        <p className="max-w-2xl text-[15px] leading-relaxed text-foreground/85">
          {plural(total, "ponto na análise", "pontos na análise")}. A última leitura da IA foi {quando}, em {ddmm(dados.swotAnalisadoEm)}, a partir
          das tendências do radar e dos concorrentes cadastrados.
          {editados > 0 && ` ${plural(editados, "ponto foi ajustado", "pontos foram ajustados")} à mão pelo time e não muda quando a IA relê.`}
        </p>
        <button
          type="button"
          onClick={regenerar}
          disabled={analisando}
          className="cta-ia inline-flex shrink-0 items-center gap-2 self-start rounded-full py-2 pl-2 pr-4 font-display text-xs font-bold text-primary-foreground disabled:pointer-events-none disabled:opacity-70 sm:self-auto"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-card">
            <IaDigisystem size={22} estado={analisando ? "processando" : "vivo"} />
          </span>
          {analisando ? "Relendo…" : "Regenerar com a IA"}
        </button>
      </section>

      {analisando && (
        <div role="status" aria-live="polite" className="ia-borda-analise animate-rise mt-6 flex items-center gap-4 bg-card px-5 py-4 shadow-card">
          <IaDigisystem size={44} estado="processando" animarEntrada />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-primary">A IA está relendo a SWOT</p>
            <TextGenerateDigisystem key={etapa} texto={etapas[etapa]} className="text-xs text-muted-foreground" />
          </div>
        </div>
      )}

      <div className={cn("transition-opacity duration-500", analisando && "pointer-events-none opacity-50")}>
        {EIXOS.map((eixo, e) => (
          <section key={eixo.rotulo} aria-label={eixo.rotulo} className="animate-rise mt-10" style={delay(140 + e * 90)}>
            <h2 className="flex flex-wrap items-baseline gap-x-2 border-b border-border pb-2">
              <span className="font-display text-sm font-bold uppercase tracking-wide text-primary">{eixo.rotulo}</span>
              <span className="text-xs text-muted-foreground">{eixo.explica}</span>
            </h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {eixo.quadrantes.map((q) => (
                <Quadrante
                  key={q}
                  q={q}
                  itens={itensDoQuadrante(dados.swot, q)}
                  novos={novos}
                  editando={editando}
                  onEditar={setEditando}
                  onSalvar={(id, texto) => {
                    const r = acoes.editarSwot(id, texto);
                    if (r.ok) setEditando(null);
                  }}
                  onReverter={(id) => acoes.reverterSwot(id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="animate-rise mt-8 flex items-center gap-2 text-xs text-muted-foreground" style={delay(360)}>
        <IaDigisystem size={18} />
        Passe o mouse num ponto para ajustar o texto. O que o time ajusta à mão a IA não troca.
      </p>
    </>
  );
}

// ─── Quadrante ────────────────────────────────────────────────────────────

function Quadrante({
  q,
  itens,
  novos,
  editando,
  onEditar,
  onSalvar,
  onReverter,
}: {
  q: QuadranteSwot;
  itens: SwotItem[];
  novos: Set<string>;
  editando: string | null;
  onEditar: (id: string | null) => void;
  onSalvar: (id: string, texto: string) => void;
  onReverter: (id: string) => void;
}) {
  const cfg = QUADRANTE[q];
  const tituloId = useId();
  return (
    <section aria-labelledby={tituloId} className="rounded-3xl bg-card p-6 shadow-card">
      <header className="flex items-start gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", cfg.tom)}>
          <cfg.Icone aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 id={tituloId} className="font-display text-lg font-bold leading-tight text-primary">
            {cfg.titulo} <span className="font-sans text-xs font-normal text-muted-foreground">{itens.length}</span>
          </h3>
          <p className="text-xs text-muted-foreground">{cfg.frase}</p>
        </div>
      </header>
      {itens.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nenhum ponto neste quadrante.</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {itens.map((i) => (
            <PontoSwot
              key={i.id}
              item={i}
              novo={novos.has(i.id)}
              editando={editando === i.id}
              onEditar={() => onEditar(i.id)}
              onCancelar={() => onEditar(null)}
              onSalvar={(texto) => onSalvar(i.id, texto)}
              onReverter={() => onReverter(i.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function PontoSwot({
  item,
  novo,
  editando,
  onEditar,
  onCancelar,
  onSalvar,
  onReverter,
}: {
  item: SwotItem;
  novo: boolean;
  editando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
  onSalvar: (texto: string) => void;
  onReverter: () => void;
}) {
  const [texto, setTexto] = useState(item.item);
  const campoId = useId();

  useEffect(() => {
    if (editando) setTexto(item.item);
  }, [editando, item.item]);

  if (editando) {
    const tecla = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") onCancelar();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSalvar(texto);
    };
    return (
      <li className="rounded-2xl bg-secondary/50 p-3">
        <label htmlFor={campoId} className="sr-only">
          Texto do ponto
        </label>
        <textarea
          id={campoId}
          autoFocus
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={tecla}
          className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm leading-relaxed outline-none transition-colors duration-300 focus:border-sky focus:ring-2 focus:ring-sky/30"
        />
        <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
          <span className="mr-auto text-[11px] text-muted-foreground">Ctrl + Enter salva, Esc cancela</span>
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-full px-3 py-1.5 font-display text-[11px] font-bold text-muted-foreground transition-colors duration-300 hover:text-primary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSalvar(texto)}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 font-display text-[11px] font-bold text-primary-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5"
          >
            <Check aria-hidden className="h-3.5 w-3.5" /> Salvar
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "group relative flex gap-3 rounded-2xl px-2 py-2 transition-colors duration-300 hover:bg-secondary/40",
        novo && "animate-rise bg-orange-soft/60",
      )}
    >
      <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-foreground">{item.item}</p>
        {(novo || item.editadoManualmente) && (
          <p className="mt-1 flex flex-wrap items-center gap-1.5">
            {novo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-accent shadow-card">
                <IaDigisystem size={12} /> Novo
              </span>
            )}
            {item.editadoManualmente && (
              <span className="rounded-full bg-warning-soft px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-warning">
                Editado
              </span>
            )}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-start gap-0.5 opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={onEditar}
          aria-label="Ajustar este ponto"
          title="Ajustar este ponto"
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-card hover:text-primary"
        >
          <Pencil aria-hidden className="h-3.5 w-3.5" />
        </button>
        {item.editadoManualmente && (
          <button
            type="button"
            onClick={onReverter}
            aria-label="Voltar ao texto da IA"
            title="Voltar ao texto da IA"
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-card hover:text-accent"
          >
            <RotateCcw aria-hidden className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}
