// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Fila de sugestões de brinde (mini-feature v4). O diretor sugere na vitrine; aqui o marketing
// analisa e aprova (vira item de encomenda no catálogo) ou recusa com motivo.

import { useState } from "react";
import { ArrowRight, CalendarDays, CircleCheck, CircleX, ExternalLink, Lightbulb, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoja } from "../estado";
import { dataHora, dataLonga, unidades } from "../formato";
import { usuario } from "../mock";
import { navegar, trocarParams, type RotaLoja } from "../rota";
import type { Sugestao, StatusSugestao } from "../tipos";
import { Avatar, Botao, Campo, classeInput, Gaveta, Selo, Vazio } from "../ui";
import { GestaoShell } from "./GestaoShell";

const FILTROS: { valor: string; rotulo: string; st: StatusSugestao[] }[] = [
  { valor: "pendentes", rotulo: "Para analisar", st: ["sugerida", "em_analise"] },
  { valor: "aprovadas", rotulo: "Aprovadas", st: ["aprovada"] },
  { valor: "recusadas", rotulo: "Recusadas", st: ["recusada"] },
  { valor: "todas", rotulo: "Todas", st: [] },
];

const SELO: Record<StatusSugestao, { tom: "info" | "apoio" | "ok" | "erro"; rotulo: string }> = {
  sugerida: { tom: "info", rotulo: "Sugerida" },
  em_analise: { tom: "apoio", rotulo: "Em análise" },
  aprovada: { tom: "ok", rotulo: "Aprovada" },
  recusada: { tom: "erro", rotulo: "Recusada" },
};

export function Sugestoes({ rota }: { rota: RotaLoja }) {
  const { estado } = useLoja();
  const filtro = FILTROS.find((f) => f.valor === rota.params.get("status")) ?? FILTROS[0];
  const lista = (filtro.st.length ? estado.sugestoes.filter((s) => filtro.st.includes(s.status)) : estado.sugestoes)
    .slice()
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  const aberta = estado.sugestoes.find((s) => s.id === rota.params.get("sugestao"));

  return (
    <GestaoShell titulo="Sugestões de brinde" descricao="Ideias de brinde que o time mandou. Analise cada uma: aprovar transforma a sugestão em um item de encomenda no catálogo; recusar devolve um motivo para quem sugeriu.">
      <div className="mb-5 overflow-x-auto [scrollbar-width:none]">
        <SeletorFiltro valor={filtro.valor} contar={(st) => (st.length ? estado.sugestoes.filter((s) => st.includes(s.status)).length : estado.sugestoes.length)} />
      </div>

      {lista.length === 0 ? (
        <Vazio icone={<Lightbulb className="size-7" />} titulo="Nenhuma sugestão nesta fila" texto="Quando alguém sugerir um brinde na vitrine, ele aparece aqui para você analisar.">
          <Botao variante="contorno" onClick={() => trocarParams({ status: undefined })}>Ver as pendentes</Botao>
        </Vazio>
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {lista.map((s) => <CartaoSugestao key={s.id} sugestao={s} ativo={aberta?.id === s.id} />)}
        </ul>
      )}

      <Gaveta aberto={!!aberta} onFechar={() => trocarParams({ sugestao: undefined }, true)} largura={520}
        titulo={aberta ? aberta.nome : ""} subtitulo={aberta ? `${aberta.id} · sugerida por ${usuario(aberta.sugeridaPorId).nome}` : undefined}>
        {aberta && <PainelSugestao key={aberta.id + aberta.status} sugestao={aberta} />}
      </Gaveta>
    </GestaoShell>
  );
}

function SeletorFiltro({ valor, contar }: { valor: string; contar: (st: StatusSugestao[]) => number }) {
  return (
    <div role="group" aria-label="Filtrar sugestões" className="inline-flex max-w-none flex-nowrap gap-1 rounded-full bg-secondary p-1">
      {FILTROS.map((f) => {
        const ativo = f.valor === valor;
        return (
          <button key={f.valor} type="button" aria-pressed={ativo} onClick={() => trocarParams({ status: f.valor === "pendentes" ? undefined : f.valor })}
            className={cn("h-10 shrink-0 whitespace-nowrap rounded-full px-4 font-display text-[13.5px] font-bold transition-colors", ativo ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-foreground")}>
            {f.rotulo} <span className="tabular-nums opacity-70">{contar(f.st)}</span>
          </button>
        );
      })}
    </div>
  );
}

function CartaoSugestao({ sugestao: s, ativo }: { sugestao: Sugestao; ativo: boolean }) {
  const u = usuario(s.sugeridaPorId);
  const selo = SELO[s.status];
  return (
    <li className="min-w-0">
      <button type="button" onClick={() => trocarParams({ sugestao: s.id })}
        className={cn("flex h-full w-full flex-col gap-3 rounded-3xl border bg-card p-4 text-left shadow-card transition-shadow hover:shadow-[var(--shadow-float)] sm:p-5", ativo ? "border-primary" : "border-border")}>
        <div className="flex w-full items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-navy-soft text-primary"><Lightbulb className="size-5" aria-hidden /></span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[16px] font-bold leading-tight">{s.nome}</p>
            <p className="line-clamp-2 text-[13px] text-muted-foreground">{s.descricao}</p>
          </div>
          <Selo tom={selo.tom}>{selo.rotulo}</Selo>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><Avatar iniciais={u.iniciais} tamanho={22} /> {u.nome}</span>
          {s.qtdEstimada ? <Selo tom="neutro"><Package className="size-3.5" aria-hidden /> ~{unidades(s.qtdEstimada)}</Selo> : null}
          <span className="ml-auto flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden /> {dataLonga(s.criadaEm)}</span>
        </div>
        <span className="flex items-center gap-1 font-display text-[13.5px] font-bold text-primary">
          {s.status === "sugerida" || s.status === "em_analise" ? "Analisar" : "Ver detalhes"} <ArrowRight className="size-4" aria-hidden />
        </span>
      </button>
    </li>
  );
}

function PainelSugestao({ sugestao: s }: { sugestao: Sugestao }) {
  const { estado, analisarSugestao, aprovarSugestao, recusarSugestao } = useLoja();
  const [modo, setModo] = useState<"normal" | "recusar">("normal");
  const [motivo, setMotivo] = useState("");
  const [tentou, setTentou] = useState(false);
  const selo = SELO[s.status];
  const pendente = s.status === "sugerida" || s.status === "em_analise";
  const produtoGerado = s.produtoGeradoId ? estado.produtos.find((p) => p.id === s.produtoGeradoId) : undefined;

  return (
    <div className="space-y-6 pb-2">
      <div className="flex flex-wrap items-center gap-2">
        <Selo tom={selo.tom}>{selo.rotulo}</Selo>
        <span className="text-[13px] text-muted-foreground">Sugerida em {dataLonga(s.criadaEm)}</span>
      </div>

      <section className="space-y-2">
        <h3 className="font-display text-[16px] font-bold">O que foi sugerido</h3>
        <p className="text-[14.5px] leading-relaxed">{s.descricao}</p>
        <dl className="grid gap-3 pt-1 text-[14px] sm:grid-cols-2">
          {s.qtdEstimada ? <div><dt className="text-muted-foreground">Quantidade estimada</dt><dd className="font-semibold">{unidades(s.qtdEstimada)}</dd></div> : null}
          {s.referencia ? (
            <div className="min-w-0"><dt className="text-muted-foreground">Referência</dt>
              <dd className="truncate font-semibold text-primary"><a href={s.referencia} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">{s.referencia} <ExternalLink className="size-3.5 shrink-0" aria-hidden /></a></dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section>
        <h3 className="mb-3 font-display text-[16px] font-bold">Histórico</h3>
        <ol className="space-y-2">
          {s.historico.map((h, i) => (
            <li key={i} className="flex items-center gap-2 text-[13px]">
              <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
              <span className="font-semibold">{SELO[h.status].rotulo}</span>
              <span className="text-muted-foreground">· {dataHora(h.em)} · {usuario(h.porId).nome}</span>
            </li>
          ))}
        </ol>
      </section>

      {s.status === "aprovada" && produtoGerado && (
        <section className="rounded-2xl border border-success/40 bg-success-soft p-3.5 text-[14px]">
          <p className="flex items-center gap-1.5 font-display font-bold"><CircleCheck className="size-4 text-success" aria-hidden /> Virou item de encomenda</p>
          <p className="mt-1">O item <b>{produtoGerado.nome}</b> está no catálogo, disponível por encomenda.</p>
          <Botao variante="suave" tamanho="sm" className="mt-2" onClick={() => navegar(`/loja/produto/${produtoGerado.slug}`)}>Ver no catálogo <ArrowRight className="size-4" aria-hidden /></Botao>
        </section>
      )}
      {s.status === "recusada" && s.motivo && (
        <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3.5 text-[14px]">
          <p className="flex items-center gap-1.5 font-display font-bold"><CircleX className="size-4 text-destructive" aria-hidden /> Recusada</p>
          <p className="mt-1">{s.motivo}</p>
        </section>
      )}

      {pendente && (
        <section className="rounded-3xl border border-border bg-card p-4 shadow-card">
          {modo === "normal" ? (
            <div className="space-y-3">
              {s.status === "sugerida" && (
                <Botao variante="contorno" className="w-full" onClick={() => analisarSugestao(s.id)}>Marcar como em análise</Botao>
              )}
              <p className="text-[13.5px] text-muted-foreground">Aprovar cria um item de encomenda no catálogo (sem estoque próprio, mínimo padrão). Recusar devolve um motivo para quem sugeriu.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Botao tamanho="lg" className="flex-1" onClick={() => aprovarSugestao(s.id)}>Aprovar e criar item</Botao>
                <Botao tamanho="lg" variante="perigo" className="flex-1" onClick={() => setModo("recusar")}>Recusar…</Botao>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Campo rotulo="Motivo da recusa" htmlFor="motivo-rec" ajuda="Quem sugeriu vai ver este texto." erro={tentou && !motivo.trim() ? "O motivo é obrigatório." : null}>
                <textarea id="motivo-rec" rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} className={classeInput} placeholder="Ex.: já temos um item parecido na lista de encomenda" />
              </Campo>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Botao variante="fantasma" className="flex-1" onClick={() => { setModo("normal"); setTentou(false); }}>Voltar</Botao>
                <Botao tamanho="lg" variante="perigo" className="flex-[2]" onClick={() => { setTentou(true); if (motivo.trim() && recusarSugestao(s.id, motivo)) setModo("normal"); }}>Confirmar recusa</Botao>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
