/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: nenhum arquivo do Lovable (ferramenta só do protótipo, plano seção 3.1)
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Painel de demonstração. Simula os outros papéis e o tempo, já que o
 * protótipo roda com uma pessoa só. Fica de propósito FORA da identidade do Hub
 * (cinza, monoespaçado, cantos retos) para ninguém confundir com a interface.
 * Recolhido por padrão, no canto superior direito.
 */
import { useState, type ReactNode } from "react";
import { useHub } from "../store/HubStore";
import { COLUNAS, ddmm, somarDias } from "../store/regras";
import type { Papel } from "../store/tipos";
import { PERSONAS_DEMO } from "../store/mock-dados";

const PAPEIS: { id: Papel; label: string }[] = [
  { id: "marketing", label: "Marketing" },
  { id: "aprovador", label: "Aprovador" },
  { id: "admin", label: "Admin" },
];

const btn =
  "rounded-sm border border-zinc-600 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40";
const btnAtivo = "rounded-sm border border-zinc-300 bg-zinc-200 px-2 py-1 text-[11px] text-zinc-900";
const campo = "w-full rounded-sm border border-zinc-600 bg-zinc-900 px-1.5 py-1 text-[11px] text-zinc-100";

export function DemoPanel() {
  const { estado, dados, hoje, papel, sel, acoes } = useHub();
  const [aberto, setAberto] = useState(false);

  const enviados = dados.posts.filter((p) => p.estado === "enviado");
  const devolvidos = dados.cards.filter((c) => c.pedido?.estado === "devolvido");

  const [postEscolhido, setPostEscolhido] = useState("");
  const [dataAprov, setDataAprov] = useState("");
  const [pedidoEscolhido, setPedidoEscolhido] = useState("");

  const postSel = enviados.find((p) => p.id === postEscolhido) ?? enviados[0];
  const pedidoSel = devolvidos.find((c) => c.id === pedidoEscolhido) ?? devolvidos[0];
  const dataSugerida = postSel?.dataSugerida && postSel.dataSugerida >= hoje ? postSel.dataSugerida : somarDias(hoje, 2);
  const data = dataAprov || dataSugerida;

  const colunas = sel.cardsPorColuna();
  const [a, m, d] = hoje.split("-");
  const diaSemana = new Date(Number(a), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR", { weekday: "short" });

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="fixed right-2 top-2 z-[70] rounded-sm border border-zinc-600 bg-zinc-900/90 px-2 py-1 font-mono text-[11px] text-zinc-200 shadow hover:bg-zinc-800"
        aria-expanded={false}
        aria-controls="painel-demo"
      >
        demo · {papel} · {d}/{m}
      </button>
    );
  }

  return (
    <aside
      id="painel-demo"
      aria-label="Painel de demonstração do protótipo"
      className="fixed right-2 top-2 z-[70] max-h-[calc(100vh-7rem)] w-[min(19rem,calc(100vw-1rem))] overflow-y-auto rounded-sm border border-zinc-600 bg-zinc-900 p-3 font-mono text-[11px] text-zinc-200 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="leading-tight text-zinc-400">
          Painel de demonstração
          <br />
          <span className="text-zinc-500">não faz parte do Hub</span>
        </p>
        <button type="button" onClick={() => setAberto(false)} className={btn} aria-label="Recolher painel">
          recolher
        </button>
      </div>

      <Secao titulo="hoje">
        <div className="flex items-center justify-between gap-2">
          <span>
            {d}/{m}/{a} ({diaSemana})
          </span>
          <button type="button" className={btn} onClick={acoes.avancarDia}>
            avançar 1 dia
          </button>
        </div>
      </Secao>

      <Secao titulo="entrar como">
        <div className="flex flex-wrap gap-1">
          {PAPEIS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={papel === p.id ? btnAtivo : btn}
              aria-pressed={papel === p.id}
              onClick={() => acoes.entrarComo(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-zinc-500">
          {dados.usuarios.find((u) => u.id === PERSONAS_DEMO[papel])?.nome}
        </p>
      </Secao>

      <Secao titulo="aprovador decide">
        {enviados.length === 0 ? (
          <p className="text-zinc-500">Nenhum post aguardando aprovação.</p>
        ) : (
          <div className="space-y-1.5">
            <select
              className={campo}
              value={postSel?.id ?? ""}
              onChange={(e) => {
                setPostEscolhido(e.target.value);
                setDataAprov("");
              }}
              aria-label="Post aguardando aprovação"
            >
              {enviados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <input
                type="date"
                className={campo}
                value={data}
                onChange={(e) => setDataAprov(e.target.value)}
                aria-label="Data de publicação"
              />
              <button
                type="button"
                className={btn}
                onClick={() => postSel && acoes.simularDecisao(postSel.id, "aprovar", data)}
                title={`Aprova com publicação em ${ddmm(data)}`}
              >
                aprova
              </button>
              <button type="button" className={btn} onClick={() => postSel && acoes.simularDecisao(postSel.id, "reprovar")}>
                reprova
              </button>
            </div>
          </div>
        )}
      </Secao>

      <Secao titulo="solicitante reenviou">
        {devolvidos.length === 0 ? (
          <p className="text-zinc-500">Nenhum pedido devolvido.</p>
        ) : (
          <div className="flex items-center gap-1">
            <select
              className={campo}
              value={pedidoSel?.id ?? ""}
              onChange={(e) => setPedidoEscolhido(e.target.value)}
              aria-label="Pedido devolvido"
            >
              {devolvidos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>
            <button type="button" className={btn} onClick={() => pedidoSel && acoes.solicitanteReenviou(pedidoSel.id)}>
              reenviar
            </button>
          </div>
        )}
      </Secao>

      <Secao titulo="K11 · arte travada depois de publicar">
        <div className="flex gap-1">
          <button
            type="button"
            className={estado.arteTravadaAposPublicar ? btnAtivo : btn}
            aria-pressed={estado.arteTravadaAposPublicar}
            onClick={() => !estado.arteTravadaAposPublicar && acoes.alternarK11()}
          >
            sim
          </button>
          <button
            type="button"
            className={!estado.arteTravadaAposPublicar ? btnAtivo : btn}
            aria-pressed={!estado.arteTravadaAposPublicar}
            onClick={() => estado.arteTravadaAposPublicar && acoes.alternarK11()}
          >
            não
          </button>
        </div>
      </Secao>

      <Secao titulo="ia do estúdio">
        <div className="flex gap-1">
          <button
            type="button"
            className={!estado.iaIndisponivel ? btnAtivo : btn}
            aria-pressed={!estado.iaIndisponivel}
            onClick={() => estado.iaIndisponivel && acoes.alternarIa()}
          >
            disponível
          </button>
          <button
            type="button"
            className={estado.iaIndisponivel ? btnAtivo : btn}
            aria-pressed={estado.iaIndisponivel}
            onClick={() => !estado.iaIndisponivel && acoes.alternarIa()}
          >
            indisponível
          </button>
        </div>
        <p className="mt-1 text-zinc-500">Indisponível: o Estúdio usa o modelo padrão e avisa.</p>
      </Secao>

      <Secao titulo="acervo de imagens">
        <div className="flex gap-1">
          {(["normal", "vazio", "erro"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={estado.acervoDemo === m ? btnAtivo : btn}
              aria-pressed={estado.acervoDemo === m}
              onClick={() => acoes.definirAcervo(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="mt-1 text-zinc-500">Vazio: nenhum resultado. Erro: a busca falha.</p>
      </Secao>

      <Secao titulo="finalizar arte">
        <div className="flex gap-1">
          {(["normal", "falha"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={estado.composicaoDemo === m ? btnAtivo : btn}
              aria-pressed={estado.composicaoDemo === m}
              onClick={() => acoes.definirComposicao(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="mt-1 text-zinc-500">Falha: a composição volta com motivo e Tentar novamente.</p>
      </Secao>

      <Secao titulo="quadro calculado (regras.ts)">
        <ul className="grid grid-cols-5 gap-1 text-center">
          {COLUNAS.map((c) => (
            <li key={c.id} className="rounded-sm border border-zinc-700 px-1 py-0.5" title={c.label}>
              <span className="block text-zinc-500">{c.label.slice(0, 4)}</span>
              {colunas[c.id].length}
            </li>
          ))}
        </ul>
      </Secao>

      <div className="mt-3 border-t border-zinc-700 pt-2">
        <button type="button" className={`${btn} w-full`} onClick={acoes.restaurar}>
          restaurar dados de exemplo
        </button>
      </div>
    </aside>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-3 border-t border-zinc-700 pt-2">
      <p className="mb-1 uppercase tracking-wide text-zinc-500">{titulo}</p>
      {children}
    </section>
  );
}
