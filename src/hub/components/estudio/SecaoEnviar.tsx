/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/estudio.tsx (etapa 3, Revisão e envio; `enviarParaAprovacao`),
 *   src/components/estudio/AnalisePostCard.tsx @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Enviar" (D2, D3, D4, D7).
 *
 * Seção Enviar do "Criar post" (item 5.5d, linhas 74 a 81 do inventário):
 *  - Análise da IA (AnaliseIa), que não barra o envio e avisa quando falta chamada (D2).
 *  - Observação para quem aprova e Data sugerida, opcional e sem mínimo (D3).
 *  - Como a legenda vai ser gravada: legenda + bloco "[Rede]: chamada" (D4).
 *  - Enviar para aprovação, que exige o texto aprovado e a arte pronta; sem
 *    card, o Estúdio pergunta "Associar ou criar?" (4.6, caminho 3).
 *  - Depois de enviar, a tela de conclusão com "Ir para Meus posts", "Voltar
 *    para o card" (quando veio de um card) e "Criar outro" (D7).
 * Sem "Salvar rascunho" nem "Exportar SVG" (linhas 78 e 79): o post se salva
 * sozinho, e os downloads ficam no menu Baixar da prévia (ESPEC, ponto 13).
 */
import { ArrowUpRight, CheckCircle2, FilePlus, Send, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { EstadoPost } from "../EstadoPost";
import { campo, rotulo } from "../NovaTarefaDialog";
import { hrefDe } from "../../router";
import { useHub } from "../../store/HubStore";
import type { EntradaAnalise } from "../../store/mock-geracao";
import { atalhosDaConclusao, avisoDataSugerida, blocoCtas, ddmm, type Resultado } from "../../store/regras";
import type { Post } from "../../store/tipos";
import { AnaliseIa } from "./AnaliseIa";
import type { Editor } from "./editor";
import { acaoLeve, botaoAzul, botaoLaranja, pilulaAcao } from "./partes";

export function SecaoEnviar({
  ed,
  mudar,
  post,
  somenteLeitura,
  podeEnviar,
  analise,
  onEnviar,
  onNovo,
  linkCard,
  veioDeCard,
  tituloCard,
}: {
  ed: Editor;
  mudar: (p: Partial<Editor>) => void;
  post?: Post;
  somenteLeitura: boolean;
  podeEnviar: Resultado;
  analise: EntradaAnalise;
  onEnviar: () => void;
  onNovo: () => void;
  linkCard?: string;
  /** O post foi aberto a partir de um card (muda o atalho para "Voltar para o card"). */
  veioDeCard: boolean;
  tituloCard?: string;
}) {
  const { sel, hoje, estado } = useHub();

  if (post && somenteLeitura) {
    return <Conclusao post={post} onNovo={onNovo} linkCard={linkCard} veioDeCard={veioDeCard} tituloCard={tituloCard} />;
  }

  const reenviar = post?.estado === "reprovado";
  const aviso = avisoDataSugerida(ed.dataSugerida, hoje);
  const bloco = blocoCtas(analise.ctas);

  return (
    <div className="space-y-5">
      <AnaliseIa entrada={analise} indisponivel={estado.iaIndisponivel} />

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_210px]">
        <label className="block">
          <span className={rotulo}>
            Observação para quem aprova <span className="font-normal normal-case tracking-normal">(opcional)</span>
          </span>
          <textarea
            value={ed.observacao}
            onChange={(e) => mudar({ observacao: e.target.value })}
            rows={3}
            placeholder="Ex: a data acompanha o lançamento do evento"
            className={cn(campo, "resize-none")}
          />
        </label>
        <div>
          <label className="block">
            <span className={rotulo}>
              Data sugerida <span className="font-normal normal-case tracking-normal">(opcional)</span>
            </span>
            <input type="date" value={ed.dataSugerida} onChange={(e) => mudar({ dataSugerida: e.target.value })} className={campo} />
          </label>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {aviso && <span className="text-[11px] leading-snug text-muted-foreground">{aviso}</span>}
            {ed.dataSugerida && (
              <button type="button" onClick={() => mudar({ dataSugerida: "" })} className={acaoLeve}>
                <X aria-hidden className="h-3 w-3" /> Sem data
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-secondary/40 px-4 py-3">
        <p className="font-display text-[11px] font-bold uppercase tracking-wide text-primary">Como a legenda vai para a aprovação</p>
        {bloco ? (
          <>
            <p className="mt-1 text-xs text-muted-foreground">A legenda aprovada e, no fim, uma linha por chamada:</p>
            <pre className="mt-1.5 whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground/85">{bloco}</pre>
          </>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">Só a legenda aprovada. O post não tem chamada, o que é permitido.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onEnviar} disabled={!podeEnviar.ok} title={podeEnviar.ok ? undefined : podeEnviar.motivo} className={botaoAzul}>
          <Send aria-hidden className="h-3.5 w-3.5" /> {reenviar ? "Reenviar para aprovação" : "Enviar para aprovação"}
        </button>
        <p className="text-xs text-muted-foreground">
          {!podeEnviar.ok
            ? podeEnviar.motivo
            : reenviar
              ? "O reenvio volta para a fila de Para aprovar."
              : post?.itemId
                ? "Quem aprova vê o post em Posts → Para aprovar e confirma ou troca a data."
                : "O post ainda não está em nenhum card. Ao enviar, você escolhe onde ele fica no Quadro."}
        </p>
      </div>
      {post && (
        <p className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <EstadoPost estado={sel.estadoPost(post)} /> Está em Meus posts e se salva sozinho.
        </p>
      )}
    </div>
  );
}

/** D7 (R-EST-7): a tela de conclusão depois do envio, com os atalhos. */
function Conclusao({
  post,
  onNovo,
  linkCard,
  veioDeCard,
  tituloCard,
}: {
  post: Post;
  onNovo: () => void;
  linkCard?: string;
  veioDeCard: boolean;
  tituloCard?: string;
}) {
  const { sel } = useHub();
  const enviado = post.estado === "enviado";
  const atalhos = atalhosDaConclusao({ veioDeCard, temCard: Boolean(linkCard) });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-success/10 text-success">
          <CheckCircle2 aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold leading-tight text-primary">
            {enviado ? "Post enviado para aprovação" : "Este post já passou pela aprovação"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <EstadoPost estado={sel.estadoPost(post)} />
            {enviado && (
              <span className="text-xs text-muted-foreground">{post.dataSugerida ? `Data sugerida: ${ddmm(post.dataSugerida)}` : "Sem data sugerida"}</span>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-foreground">
        {enviado ? "Quem aprova vê o post em Posts → Para aprovar, confirma ou troca a data e decide. " : ""}
        {tituloCard ? (
          <>
            Ele está no card <span className="font-semibold text-primary">"{tituloCard}"</span>, que mostra o mesmo estado no Quadro, e em Meus posts.
          </>
        ) : (
          "Ele está em Meus posts."
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {atalhos.map((a) =>
          a === "meus-posts" ? (
            <a key={a} href={hrefDe("posts", "meus", { post: post.id })} className={botaoLaranja}>
              Ir para Meus posts
            </a>
          ) : a === "criar-outro" ? (
            <button key={a} type="button" onClick={onNovo} className={pilulaAcao}>
              <FilePlus aria-hidden className="h-3.5 w-3.5" /> Criar outro
            </button>
          ) : (
            <a key={a} href={linkCard} className={pilulaAcao}>
              {a === "voltar-card" ? "Voltar para o card" : "Ver o card no Quadro"} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            </a>
          ),
        )}
      </div>
    </div>
  );
}
