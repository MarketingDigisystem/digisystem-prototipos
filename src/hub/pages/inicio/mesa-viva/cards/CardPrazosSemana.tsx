/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Prazos da semana (opcional novo): faixa de 7 dias a partir de hoje, pontos
 * por dia (azul = tarefa, laranja = publicação). Clicar num dia filtra a
 * lista; clicar de novo limpa. Os pontos aparecem com escalonamento.
 */
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "../../../../../lib/utils";
import { useHub } from "../../../../store/HubStore";
import { ddmm, somarDias } from "../../../../store/regras";
import { hrefDe } from "../../../../router";
import { CardMesa, Resto, Vazio, useListaDensa, type Casca } from "../CardMesa";
import { LinhaLink, tituloLinha } from "./partes";

type Prazo = { id: string; tipo: "tarefa" | "publicacao"; titulo: string; dia: string; href: string; detalhe: string };

const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
function diaDaSemana(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  return SEMANA[new Date(a, m - 1, d).getDay()];
}

export function CardPrazosSemana({ casca }: { casca: Casca }) {
  const { sel, dados, hoje, usuario } = useHub();
  const [filtro, setFiltro] = useState<string | null>(null);
  const mesa = sel.mesa();
  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => somarDias(hoje, i)), [hoje]);
  const fim = dias[6];

  const prazos: Prazo[] = [
    ...mesa.tarefas
      .filter((t) => t.prazo && t.prazo >= hoje && t.prazo <= fim)
      .map<Prazo>((t) => ({
        id: t.id,
        tipo: "tarefa",
        titulo: t.titulo,
        dia: t.prazo as string,
        href: hrefDe("tarefas", "quadro", { card: t.card.id }),
        detalhe: t.tipo === "subtarefa" ? `Subtarefa em ${t.card.titulo}` : "Seu card",
      })),
    ...dados.posts
      .filter((p) => p.autorId === usuario.id && p.estado === "aprovado" && p.dataPublicacao && p.dataPublicacao >= hoje && p.dataPublicacao <= fim)
      .map<Prazo>((p) => ({
        id: p.id,
        tipo: "publicacao",
        titulo: p.titulo,
        dia: p.dataPublicacao as string,
        href: hrefDe("posts", "calendario", { post: p.id }),
        detalhe: "Publicação",
      })),
  ].sort((a, b) => a.dia.localeCompare(b.dia) || a.titulo.localeCompare(b.titulo, "pt-BR"));

  const filtrados = filtro ? prazos.filter((p) => p.dia === filtro) : prazos;
  const lista = useListaDensa(filtrados, casca.densidade);

  const linha = (p: Prazo): ReactNode => (
    <li key={`${p.tipo}-${p.id}`}>
      <LinhaLink href={p.href}>
        <span aria-hidden className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", p.tipo === "tarefa" ? "bg-primary" : "bg-accent")} />
        <span className="min-w-0 flex-1">
          <span className={tituloLinha}>{p.titulo}</span>
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{p.detalhe}</span>
        </span>
        <span className="shrink-0 pt-0.5 font-display text-[11px] font-semibold text-muted-foreground">
          {p.dia === hoje ? "Hoje" : `${diaDaSemana(p.dia)} ${ddmm(p.dia)}`}
        </span>
      </LinhaLink>
    </li>
  );

  return (
    <CardMesa casca={casca} contador={prazos.length} rodape={lista.botao}>
      <div role="group" aria-label="Filtrar por dia" className="grid grid-cols-7 gap-1">
        {dias.map((d, i) => {
          const doDia = prazos.filter((p) => p.dia === d);
          const ativo = filtro === d;
          const ehHoje = d === hoje;
          return (
            <button
              key={d}
              type="button"
              aria-pressed={ativo}
              aria-label={`${diaDaSemana(d)} ${ddmm(d)}: ${doDia.length === 0 ? "nada vence" : `${doDia.length} ${doDia.length === 1 ? "prazo" : "prazos"}`}`}
              onClick={() => setFiltro(ativo ? null : d)}
              className={cn(
                "flex min-h-16 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                ehHoje ? "bg-primary text-primary-foreground" : ativo ? "bg-sky-soft text-primary ring-1 ring-sky" : "text-foreground hover:bg-secondary",
                ehHoje && ativo && "ring-2 ring-accent ring-offset-2 ring-offset-card",
              )}
            >
              <span className={cn("font-display text-[10px] font-bold uppercase tracking-wider", ehHoje ? "opacity-90" : "text-muted-foreground")}>
                {diaDaSemana(d)}
              </span>
              <span className="font-display text-base font-bold leading-none tabular-nums">{d.slice(8)}</span>
              <span aria-hidden className="flex h-1.5 items-center gap-0.5">
                {doDia.slice(0, 3).map((p, k) => (
                  <span
                    key={p.id}
                    className={cn("mmv-pop h-1.5 w-1.5 rounded-full", p.tipo === "tarefa" ? (ehHoje ? "bg-primary-foreground" : "bg-primary") : "bg-accent")}
                    style={{ animationDelay: `${i * 40 + k * 20}ms` }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        {filtrados.length === 0 ? (
          <Vazio>{filtro ? "Nada vence neste dia." : "Nada vence nos próximos 7 dias."}</Vazio>
        ) : (
          <>
            <ul>{lista.primeiros.map(linha)}</ul>
            <Resto aberto={lista.aberto}>
              <ul>{lista.resto.map(linha)}</ul>
            </Resto>
          </>
        )}
      </div>
    </CardMesa>
  );
}
