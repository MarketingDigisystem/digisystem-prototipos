/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/MinhaMesa.tsx (bloco Publicar hoje, main @ 0a6b425) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Publicar hoje: "Marcar como publicado" vira um círculo verde com o tique
 * desenhando, um pulso único, o rótulo "Publicado", e a linha sai.
 */
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Check } from "lucide-react";
import { useHub } from "../../../../store/HubStore";
import { ddmm } from "../../../../store/regras";
import type { Post } from "../../../../store/tipos";
import { EstadoPost } from "../../../../components/EstadoPost";
import { hrefDe } from "../../../../router";
import { useMovimentoReduzido } from "../anim";
import { CardMesa, Resto, Vazio, useListaDensa, type Casca } from "../CardMesa";

type Fase = "confirmando" | "saindo";

export function CardPublicarHoje({ casca }: { casca: Casca }) {
  const { sel, hoje } = useHub();
  const posts = sel.mesa().publicarHoje;
  const lista = useListaDensa(posts, casca.densidade);
  const [fases, setFases] = useState<Record<string, Fase>>({});

  return (
    <CardMesa casca={casca} contador={posts.length} rodape={lista.botao}>
      {posts.length === 0 ? (
        <Vazio>Nenhum post seu para publicar hoje.</Vazio>
      ) : (
        <>
          <ul className="-mx-2">
            {lista.primeiros.map((p) => (
              <LinhaPublicar key={p.id} p={p} hoje={hoje} fase={fases[p.id]} setFases={setFases} />
            ))}
          </ul>
          <Resto aberto={lista.aberto}>
            <ul className="-mx-2">
              {lista.resto.map((p) => (
                <LinhaPublicar key={p.id} p={p} hoje={hoje} fase={fases[p.id]} setFases={setFases} />
              ))}
            </ul>
          </Resto>
        </>
      )}
    </CardMesa>
  );
}

function LinhaPublicar({
  p,
  hoje,
  fase,
  setFases,
}: {
  p: Post;
  hoje: string;
  fase?: Fase;
  setFases: Dispatch<SetStateAction<Record<string, Fase>>>;
}) {
  const { sel, acoes } = useHub();
  const reduzido = useMovimentoReduzido();
  const timers = useRef<number[]>([]);
  const [carregou, setCarregou] = useState(false);
  const atrasado = (p.dataPublicacao as string) < hoje;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const publicar = () => {
    if (fase) return;
    const tirar = () =>
      setFases((f) => {
        const n = { ...f };
        delete n[p.id];
        return n;
      });
    setFases((f) => ({ ...f, [p.id]: "confirmando" }));
    const sair = reduzido ? 600 : 1000;
    timers.current.push(window.setTimeout(() => setFases((f) => ({ ...f, [p.id]: "saindo" })), sair));
    timers.current.push(
      window.setTimeout(() => {
        const r = acoes.marcarPublicado(p.id);
        if (!r.ok) tirar();
      }, sair + (reduzido ? 0 : 280)),
    );
  };

  const confirmando = fase === "confirmando" || fase === "saindo";
  return (
    <li className="mmv-recolhe" data-saindo={fase === "saindo"}>
      <div>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 rounded-2xl px-2 py-2.5">
          <a href={hrefDe("posts", "calendario", { post: p.id })} className="group/l flex min-w-[11rem] flex-1 items-center gap-3">
            <img
              src={p.arteUrl}
              alt=""
              onLoad={() => setCarregou(true)}
              data-carregou={carregou}
              className="mmv-mini h-11 w-11 shrink-0 rounded-xl object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold text-primary transition-colors duration-200 group-hover/l:text-accent">
                {p.titulo}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5">
                <EstadoPost estado={sel.estadoPost(p)} />
                {atrasado && <span className="text-[11px] text-muted-foreground">era {ddmm(p.dataPublicacao as string)}</span>}
              </span>
            </span>
          </a>
          <span className="flex shrink-0 items-center gap-2">
            {confirmando && (
              <span role="status" className="mmv-entra-item font-display text-[11px] font-bold text-success">
                Publicado
              </span>
            )}
            <button
              type="button"
              onClick={publicar}
              disabled={confirmando}
              data-fase={confirmando ? "confirmando" : undefined}
              aria-label={confirmando ? `${p.titulo}: publicado` : `Marcar ${p.titulo} como publicado`}
              title="Marcar como publicado"
              className="mmv-pub inline-flex h-9 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full bg-primary px-3 font-display text-[11px] font-bold text-primary-foreground hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-default"
            >
              {confirmando ? (
                <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path className="mmv-pub-tique" d="M5.5 10.5l3 3 6-6.5" pathLength={1} />
                </svg>
              ) : (
                <>
                  <Check aria-hidden className="h-3.5 w-3.5" /> Marcar como publicado
                </>
              )}
            </button>
          </span>
        </div>
      </div>
    </li>
  );
}
