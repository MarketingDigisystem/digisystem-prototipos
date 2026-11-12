// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-brindes/ (estoque da gestão) e regras.ts desta pasta (disponivel, alertasMinimo, esgotados, valorEmEstoque, registrarEntrada, registrarAjuste), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md (Req. 4.4, 4.5, 5.4).
//
// Estoque da gestão: KPIs, uma linha por variação (saldo, reserva, disponível, mínimo, alerta) e diálogo de entrada/ajuste.
// A gestão PODE ver saldo, reserva e mínimo (o diretor não). Entrada e ajuste abrem num diálogo fixo, sem mover a tabela.

import { useMemo, useState } from "react";
import { alertasMinimo, disponivel, esgotados, valorEmEstoque } from "../../regras";
import { useLoja } from "../../store";
import type { Brinde, Variacao } from "../../tipos";
import { BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO, Campo, Dialogo, ErroInline, PILL, PILL_ATIVO, PILL_INATIVO, brl } from "./comum";

interface Alvo {
  b: Brinde;
  v: Variacao;
  modo: "entrada" | "ajuste";
}

function Kpi({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: "alerta" | "esgotado" }) {
  const cor = destaque === "esgotado" ? "text-destructive" : destaque === "alerta" ? "text-[color:var(--warning-strong)]" : "text-navy";
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <p className="text-xs font-semibold text-muted-foreground">{rotulo}</p>
      <p className={`font-display text-2xl font-bold tabular-nums ${cor}`}>{valor}</p>
    </div>
  );
}

function DialogoMovimento({ alvo, onFechar }: { alvo: Alvo | null; onFechar: () => void }) {
  const loja = useLoja();
  const [modo, setModo] = useState<"entrada" | "ajuste">(alvo?.modo ?? "entrada");
  const [qtd, setQtd] = useState("");
  const [nota, setNota] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  if (!alvo) return null;

  const salvar = () => {
    const n = Number(qtd);
    if (!qtd.trim() || !Number.isFinite(n)) {
      setErro("Informe a quantidade.");
      return;
    }
    const r =
      modo === "entrada"
        ? loja.registrarEntrada(alvo.b.id, alvo.v.id, n, nota)
        : loja.registrarAjuste(alvo.b.id, alvo.v.id, n, nota);
    if (r.ok) onFechar();
    else setErro(r.motivo);
  };

  return (
    <Dialogo
      aberto
      titulo={`${alvo.b.nome} · ${alvo.v.rotulo}`}
      onFechar={onFechar}
      rodape={
        <div>
          <ErroInline texto={erro} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onFechar} className={BTN_SECUNDARIO}>
              Cancelar
            </button>
            <button type="button" onClick={salvar} className={BTN_PRIMARIO}>
              {modo === "entrada" ? "Registrar entrada" : "Registrar ajuste"}
            </button>
          </div>
        </div>
      }
    >
      <p className="mb-3 text-sm text-muted-foreground">
        Saldo {alvo.v.saldo} · reservado {alvo.v.reserva} · disponível {disponivel(alvo.v)}
      </p>
      <div role="group" aria-label="Tipo de movimento" className="mb-3 flex gap-1">
        {(["entrada", "ajuste"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={modo === m}
            onClick={() => {
              setModo(m);
              setErro(null);
            }}
            className={`${PILL} ${modo === m ? PILL_ATIVO : PILL_INATIVO}`}
          >
            {m === "entrada" ? "Entrada" : "Ajuste"}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        <Campo
          rotulo={modo === "entrada" ? "Quantidade que entrou" : "Ajuste (use sinal negativo para tirar)"}
          dica={modo === "ajuste" ? "Ex.: -2 para tirar duas unidades; 5 para somar cinco." : undefined}
        >
          <input type="number" value={qtd} onChange={(e) => setQtd(e.target.value)} min={modo === "entrada" ? 1 : undefined} className={CAMPO} />
        </Campo>
        <Campo rotulo={modo === "ajuste" ? "Nota (obrigatória)" : "Nota (opcional)"}>
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder={modo === "ajuste" ? "Ex.: contagem física" : "Ex.: nota fiscal 1234"}
            className={CAMPO}
          />
        </Campo>
      </div>
    </Dialogo>
  );
}

export function Estoque() {
  const loja = useLoja();
  const { dados } = loja;
  const [alvo, setAlvo] = useState<Alvo | null>(null);

  const linhas = useMemo(
    () =>
      dados.brindes
        .filter((b) => b.tipo === "estoque")
        .flatMap((b) => b.variacoes.map((v) => ({ b, v })))
        .sort((x, y) => x.b.nome.localeCompare(y.b.nome, "pt-BR") || x.v.rotulo.localeCompare(y.v.rotulo, "pt-BR")),
    [dados.brindes],
  );
  const abaixo = useMemo(() => new Set(alertasMinimo(dados).map((a) => `${a.brindeId}/${a.variacaoId}`)), [dados]);
  const zerados = useMemo(() => new Set(esgotados(dados).map((a) => `${a.brindeId}/${a.variacaoId}`)), [dados]);
  const ativos = dados.brindes.filter((b) => b.ativo);
  const variacoesAtivas = dados.brindes.filter((b) => b.ativo && b.tipo === "estoque").reduce((s, b) => s + b.variacoes.length, 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6" aria-labelledby="est-titulo">
      <h1 id="est-titulo" className="sr-only">
        Estoque
      </h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Kpi rotulo="Brindes ativos" valor={String(ativos.length)} />
        <Kpi rotulo="Variações em estoque" valor={String(variacoesAtivas)} />
        <Kpi rotulo="Abaixo do mínimo" valor={String(abaixo.size)} destaque={abaixo.size > 0 ? "alerta" : undefined} />
        <Kpi rotulo="Esgotados" valor={String(zerados.size)} destaque={zerados.size > 0 ? "esgotado" : undefined} />
        <div className="col-span-2 md:col-span-1">
          <Kpi rotulo="Valor em estoque" valor={brl(valorEmEstoque(dados))} />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border bg-card shadow-card">
        <div
          className="hidden items-center gap-3 border-b bg-secondary/60 px-4 py-2 text-xs font-semibold text-muted-foreground md:grid md:grid-cols-[minmax(0,2fr)_repeat(4,72px)_130px_190px]"
          aria-hidden
        >
          <span>Brinde · variação</span>
          <span className="text-right">Saldo</span>
          <span className="text-right">Reserva</span>
          <span className="text-right">Disponível</span>
          <span className="text-right">Mínimo</span>
          <span>Alerta</span>
          <span className="text-right">Movimentar</span>
        </div>
        <ul>
          {linhas.map(({ b, v }) => {
            const k = `${b.id}/${v.id}`;
            const esgotado = zerados.has(k);
            const baixo = abaixo.has(k);
            return (
              <li
                key={k}
                className="grid grid-cols-4 items-center gap-x-3 gap-y-2 border-b px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,2fr)_repeat(4,72px)_130px_190px]"
              >
                <div className="col-span-4 min-w-0 md:col-span-1">
                  <p className="truncate font-display text-base font-bold text-navy">
                    {b.nome} <span className="font-normal text-foreground/80">· {v.rotulo}</span>
                  </p>
                  {!b.ativo && <p className="text-xs text-muted-foreground">Brinde desativado</p>}
                </div>
                {(
                  [
                    ["Saldo", v.saldo],
                    ["Reserva", v.reserva],
                    ["Disponível", disponivel(v)],
                    ["Mínimo", v.minimo],
                  ] as const
                ).map(([rot, n]) => (
                  <p key={rot} className="text-right text-sm tabular-nums md:text-right">
                    <span className="block text-[11px] font-semibold text-muted-foreground md:hidden">{rot}</span>
                    <span className="font-semibold">{n}</span>
                  </p>
                ))}
                <p className="col-span-4 min-h-6 md:col-span-1">
                  {esgotado ? (
                    <span className="inline-flex h-6 items-center rounded-full bg-destructive px-2.5 font-display text-xs font-bold text-destructive-foreground">
                      Esgotado
                    </span>
                  ) : baixo ? (
                    <span className="inline-flex h-6 items-center rounded-full bg-warning-soft px-2.5 font-display text-xs font-bold text-foreground ring-1 ring-warning">
                      Abaixo do mínimo
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Em dia</span>
                  )}
                </p>
                <div className="col-span-4 flex gap-2 md:col-span-1 md:justify-end">
                  <button type="button" onClick={() => setAlvo({ b, v, modo: "entrada" })} className={`${BTN_SECUNDARIO} flex-1 md:flex-none`}>
                    Entrada
                  </button>
                  <button type="button" onClick={() => setAlvo({ b, v, modo: "ajuste" })} className={`${BTN_SECUNDARIO} flex-1 md:flex-none`}>
                    Ajuste
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Brindes personalizáveis não têm saldo próprio: o valor sai do orçamento de cada pedido.</p>

      {/* key: cada abertura começa com os campos limpos e o tipo escolhido na linha. */}
      <DialogoMovimento key={alvo ? `${alvo.b.id}/${alvo.v.id}/${alvo.modo}` : "fechado"} alvo={alvo} onFechar={() => setAlvo(null)} />
    </section>
  );
}
