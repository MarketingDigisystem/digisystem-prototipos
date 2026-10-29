/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: nenhum arquivo (tela nova, sem origem no Lovable); linguagem visual de
 *   src/components/admin/AbaEquipe.tsx e src/components/estudio/ColorHexInput.tsx
 *   @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md
 *   (seções 4.2 item 7, 4.8 e 7).
 *
 * Configurações → Etiquetas (só admin). As etiquetas do Quadro no lugar do
 * antigo "tipo" do card: criar (nome + cor), editar e arquivar. O que muda aqui
 * aparece na hora no Quadro (filtro, frente do card, detalhe, Nova tarefa e
 * Aprovar pedido), porque tudo lê a mesma lista do store.
 * Regras (regras.ts → Configurações → Etiquetas): nome obrigatório, até 20
 * caracteres e único (sem acento, contando as arquivadas); Post e Tendência
 * são usadas pela automação e não arquivam; arquivar tira do filtro e da
 * escolha, mas os cards que já têm continuam com ela.
 * Cor sempre pelo ColorHexInput (nunca input type=color).
 */
import { useMemo, useState, type FormEvent } from "react";
import { Archive, ArrowUpRight, ChevronDown, Lock, Pencil, Plus, RotateCcw } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CabecalhoArea } from "../../components/CabecalhoArea";
import { ColorHexInput } from "../../components/ColorHexInput";
import { EtiquetaChip } from "../../components/EtiquetaChip";
import { hrefDe } from "../../router";
import { useHub } from "../../store/HubStore";
import {
  avisoCorEtiqueta,
  corSugeridaEtiqueta,
  ETIQUETAS_DO_SISTEMA,
  MAX_NOME_ETIQUETA,
  plural,
  podeArquivarEtiqueta,
  validarNomeEtiqueta,
} from "../../store/regras";
import type { Etiqueta } from "../../store/tipos";
import { atraso, CAMPO, ROTULO } from "./partes";

export function Etiquetas() {
  const { dados, sel } = useHub();
  const ativas = sel.etiquetasAtivas();
  const arquivadas = dados.etiquetas.filter((e) => e.arquivada);
  const [editando, setEditando] = useState<string | null>(null);
  const [verArquivadas, setVerArquivadas] = useState(false);
  const [criada, setCriada] = useState<string | null>(null);

  // Mais usada primeiro: é a ordem em que o time procura no filtro.
  const ordenadas = useMemo(
    () =>
      [...ativas].sort((a, b) => {
        const ua = sel.usoEtiqueta(a.id);
        const ub = sel.usoEtiqueta(b.id);
        return ub.abertos + ub.concluidos - (ua.abertos + ua.concluidos) || a.nome.localeCompare(b.nome, "pt-BR");
      }),
    [ativas, sel],
  );
  const maisUsada = ordenadas[0];
  const usoMaisUsada = maisUsada ? sel.usoEtiqueta(maisUsada.id) : null;
  const semUso = ordenadas.filter((e) => {
    const u = sel.usoEtiqueta(e.id);
    return u.abertos + u.concluidos === 0;
  }).length;

  return (
    <>
      <CabecalhoArea area="configuracoes" aba="etiquetas" subtitulo="As etiquetas que o time usa para separar os cards no Quadro." />

      <p className="animate-rise mt-8 max-w-3xl text-[15px] leading-relaxed text-muted-foreground" style={atraso(60)}>
        O Quadro usa <span className="font-display text-lg font-bold text-primary">{ativas.length}</span> etiquetas.
        {maisUsada && usoMaisUsada && usoMaisUsada.abertos > 0 && (
          <>
            {" "}
            A mais presente é <span className="font-semibold text-foreground">{maisUsada.nome}</span>, em{" "}
            {plural(usoMaisUsada.abertos, "card aberto", "cards abertos")}.
          </>
        )}
        {semUso > 0 && ` ${semUso === 1 ? "Uma ainda não está" : `${semUso} ainda não estão`} em nenhum card.`}
        {arquivadas.length > 0 && ` ${plural(arquivadas.length, "arquivada fica guardada", "arquivadas ficam guardadas")} para o histórico.`}
      </p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Lista das ativas: uma linha por etiqueta, sem grade de cards iguais. */}
        <section
          aria-label="Etiquetas em uso"
          className="animate-rise overflow-hidden rounded-3xl border border-border bg-card shadow-card"
          style={atraso(120)}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 font-display text-xs font-semibold text-muted-foreground">
            <span>Etiqueta</span>
            <span className="hidden sm:inline">Onde está</span>
          </div>
          <ul>
            {ordenadas.map((e, i) =>
              editando === e.id ? (
                <LinhaEdicao key={e.id} etiqueta={e} ultima={i === ordenadas.length - 1} onFechar={() => setEditando(null)} />
              ) : (
                <LinhaEtiqueta
                  key={e.id}
                  etiqueta={e}
                  ultima={i === ordenadas.length - 1}
                  recemCriada={criada === e.id}
                  onEditar={() => setEditando(e.id)}
                />
              ),
            )}
          </ul>
        </section>

        <NovaEtiqueta onCriada={setCriada} />
      </div>

      {arquivadas.length > 0 && (
        <section aria-label="Etiquetas arquivadas" className="animate-rise mt-8 max-w-3xl" style={atraso(200)}>
          <button
            type="button"
            onClick={() => setVerArquivadas((v) => !v)}
            aria-expanded={verArquivadas}
            className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-primary"
          >
            Arquivadas · {arquivadas.length}
            <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform duration-300", verArquivadas && "rotate-180")} />
          </button>
          {verArquivadas && (
            <ul className="mt-3 divide-y divide-border/70">
              {arquivadas.map((e) => (
                <LinhaArquivada key={e.id} etiqueta={e} />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}

// ─── Linha de uma etiqueta ativa ──────────────────────────────────────────

function LinhaEtiqueta({
  etiqueta,
  ultima,
  recemCriada,
  onEditar,
}: {
  etiqueta: Etiqueta;
  ultima: boolean;
  recemCriada: boolean;
  onEditar: () => void;
}) {
  const { sel, acoes } = useHub();
  const uso = sel.usoEtiqueta(etiqueta.id);
  const doSistema = ETIQUETAS_DO_SISTEMA[etiqueta.id];
  const arquivar = podeArquivarEtiqueta(etiqueta.id);
  const total = uso.abertos + uso.concluidos;

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors duration-300 hover:bg-secondary/30",
        !ultima && "border-b border-border/60",
        recemCriada && "bg-orange-soft/40",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <EtiquetaChip etiqueta={etiqueta} className="text-[12px]" />
          {doSistema && (
            <span title={doSistema} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Lock aria-hidden className="h-3 w-3" /> Usada pela automação
            </span>
          )}
          {recemCriada && <span className="font-display text-[11px] font-bold text-accent">Nova</span>}
        </div>
        {doSistema && <p className="mt-1 max-w-md text-[12px] leading-snug text-muted-foreground">{doSistema}</p>}
      </div>

      <p className="w-36 shrink-0 text-[12px] text-muted-foreground">
        {total === 0 ? (
          "Em nenhum card ainda"
        ) : (
          <>
            <span className="font-semibold text-foreground">{plural(uso.abertos, "aberto", "abertos")}</span>
            {uso.concluidos > 0 && ` · ${plural(uso.concluidos, "concluído", "concluídos")}`}
          </>
        )}
      </p>

      <div className="flex shrink-0 items-center gap-1">
        <a
          href={hrefDe("tarefas", "quadro", { etiqueta: etiqueta.id })}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 font-display text-[12px] font-bold text-primary transition-colors duration-300 hover:text-accent"
        >
          Ver no Quadro <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
        </a>
        <button
          type="button"
          onClick={onEditar}
          aria-label={`Editar ${etiqueta.nome}`}
          title="Editar nome e cor"
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-navy-soft hover:text-primary"
        >
          <Pencil aria-hidden className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => acoes.arquivarEtiqueta(etiqueta.id)}
          aria-label={`Arquivar ${etiqueta.nome}`}
          aria-disabled={!arquivar.ok}
          title={arquivar.ok ? (total > 0 ? `Arquivar. ${plural(total, "card continua", "cards continuam")} com ela.` : "Arquivar") : arquivar.motivo}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition-colors duration-300",
            arquivar.ok ? "text-muted-foreground hover:bg-orange-soft hover:text-accent" : "cursor-not-allowed text-muted-foreground/40",
          )}
        >
          <Archive aria-hidden className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

// ─── Edição na própria linha ──────────────────────────────────────────────

function LinhaEdicao({ etiqueta, ultima, onFechar }: { etiqueta: Etiqueta; ultima: boolean; onFechar: () => void }) {
  const { dados, sel, acoes } = useHub();
  const [nome, setNome] = useState(etiqueta.nome);
  const [cor, setCor] = useState(etiqueta.cor);
  const validacao = validarNomeEtiqueta(nome, dados.etiquetas, etiqueta.id);
  const avisoCor = avisoCorEtiqueta(cor);
  const mudou = nome.trim() !== etiqueta.nome || cor !== etiqueta.cor;
  const uso = sel.usoEtiqueta(etiqueta.id);
  const total = uso.abertos + uso.concluidos;

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    if (acoes.editarEtiqueta(etiqueta.id, { nome, cor }).ok) onFechar();
  };

  return (
    <li className={cn("bg-secondary/30 px-5 py-4", !ultima && "border-b border-border/60")}>
      <form onSubmit={salvar} onKeyDown={(e) => e.key === "Escape" && onFechar()}>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[180px] flex-1">
            <span className={ROTULO}>Nome</span>
            <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} maxLength={MAX_NOME_ETIQUETA + 10} className={cn(CAMPO, "mt-1.5")} />
          </label>
          <div>
            <span className={ROTULO}>Cor</span>
            <div className="mt-1.5">
              <ColorHexInput value={cor} onChange={setCor} paleta={dados.marca.cores} rotulo={`Cor da etiqueta ${etiqueta.nome}`} />
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-[12px] text-muted-foreground">Prévia</span>
          <EtiquetaChip etiqueta={{ ...etiqueta, nome: nome.trim() || "Sem nome", cor }} className="text-[12px]" />
          {total > 0 && mudou && (
            <span className="text-[12px] text-muted-foreground">Muda em {plural(total, "card", "cards")} de uma vez.</span>
          )}
        </div>
        {!validacao.ok && nome.trim() !== etiqueta.nome && <p className="mt-2 text-[12px] text-destructive">{validacao.motivo}</p>}
        {avisoCor && <p className="mt-2 text-[12px] text-accent">{avisoCor}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onFechar} className="rounded-full px-3 py-1.5 font-display text-xs font-bold text-muted-foreground hover:text-primary">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!mudou || !validacao.ok}
            className="rounded-full bg-accent px-4 py-1.5 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </li>
  );
}

// ─── Nova etiqueta ────────────────────────────────────────────────────────

function NovaEtiqueta({ onCriada }: { onCriada: (id: string) => void }) {
  const { dados, acoes } = useHub();
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState(() => corSugeridaEtiqueta(dados.etiquetas));
  const [tentou, setTentou] = useState(false);
  const [ultima, setUltima] = useState<Etiqueta | null>(null);
  const validacao = validarNomeEtiqueta(nome, dados.etiquetas);
  const avisoCor = avisoCorEtiqueta(cor);
  const tamanho = nome.trim().length;

  const criar = (e: FormEvent) => {
    e.preventDefault();
    setTentou(true);
    const id = acoes.criarEtiqueta(nome, cor);
    if (!id) return;
    onCriada(id);
    setUltima({ id, nome: nome.trim(), cor, arquivada: false });
    setNome("");
    setTentou(false);
    // A próxima já sugere um tom diferente das que estão em uso.
    setCor(corSugeridaEtiqueta([...dados.etiquetas, { id, nome, cor, arquivada: false }]));
  };

  return (
    <section
      aria-labelledby="nova-etiqueta"
      className="animate-rise rounded-3xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-6"
      style={atraso(160)}
    >
      <h2 id="nova-etiqueta" className="font-display text-base font-bold text-primary">
        Nova etiqueta
      </h2>
      <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
        Use para separar o trabalho por tipo ou frente, como Evento ou Newsletter. Quem cria o card escolhe as etiquetas dele.
      </p>
      <form onSubmit={criar} className="mt-4 space-y-4">
        <label className="block">
          <span className="flex items-baseline justify-between">
            <span className={ROTULO}>Nome</span>
            <span className={cn("text-[11px] tabular-nums", tamanho > MAX_NOME_ETIQUETA ? "text-destructive" : "text-muted-foreground")}>
              {tamanho}/{MAX_NOME_ETIQUETA}
            </span>
          </span>
          <input
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setUltima(null);
            }}
            placeholder="Ex: Case de cliente"
            className={cn(CAMPO, "mt-1.5")}
          />
        </label>
        <div>
          <span className={ROTULO}>Cor</span>
          <div className="mt-1.5">
            <ColorHexInput value={cor} onChange={setCor} paleta={dados.marca.cores} rotulo="Cor da nova etiqueta" />
          </div>
          {avisoCor && <p className="mt-1.5 text-[12px] text-accent">{avisoCor}</p>}
        </div>

        {/* Prévia na frente de um card, que é onde a etiqueta vai aparecer. */}
        <div className="rounded-2xl border border-dashed border-border p-3">
          <p className="text-[11px] text-muted-foreground">Como fica no card</p>
          <div className="mt-2 rounded-2xl bg-card p-3 shadow-card">
            <EtiquetaChip etiqueta={{ id: "previa", nome: nome.trim() || "Nome da etiqueta", cor, arquivada: false }} />
            <p className="mt-1.5 font-display text-sm font-bold text-primary">Roteiro do vídeo institucional</p>
          </div>
        </div>

        {tentou && !validacao.ok && <p className="text-[12px] text-destructive">{validacao.motivo}</p>}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 font-display text-xs font-bold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
        >
          <Plus aria-hidden className="h-4 w-4" /> Criar etiqueta
        </button>

        {ultima && (
          <p role="status" className="text-[12px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">{ultima.nome}</span> já está no filtro do Quadro.{" "}
            <a href={hrefDe("tarefas", "quadro", { etiqueta: ultima.id })} className="font-semibold text-primary hover:text-accent">
              Ver no Quadro
            </a>
          </p>
        )}
      </form>
    </section>
  );
}

// ─── Arquivada ────────────────────────────────────────────────────────────

function LinhaArquivada({ etiqueta }: { etiqueta: Etiqueta }) {
  const { sel, acoes } = useHub();
  const uso = sel.usoEtiqueta(etiqueta.id);
  const total = uso.abertos + uso.concluidos;
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <EtiquetaChip etiqueta={etiqueta} className="opacity-70" />
      <p className="flex-1 text-[12px] text-muted-foreground">
        {total > 0 ? `Continua em ${plural(total, "card", "cards")}, mas não aparece no filtro nem na escolha.` : "Fora do filtro e da escolha. Nenhum card usa."}
      </p>
      <button
        type="button"
        onClick={() => acoes.reativarEtiqueta(etiqueta.id)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-display text-xs font-bold text-primary transition-colors duration-300 hover:border-accent hover:text-accent"
      >
        <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Reativar
      </button>
    </li>
  );
}
