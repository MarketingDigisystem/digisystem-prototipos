// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/ e loja-brindes/ (cartões, selos, fallback de foto), lidos em 2026-11-11; reescrito aqui, sem importar deles.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Peças visuais reutilizáveis: foto do brinde com placeholder de marca, selos e a pista de rolagem das faixas horizontais.

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Package } from "lucide-react";
import { SAIDA_DIALOGO_MS, movimentoReduzido } from "./movimento";

/**
 * Resolve o caminho de uma foto sob a base do Vite (ex.: "/digisystem-prototipos/" no GitHub Pages).
 * Só caminhos que começam com "/" (arquivos de public/) são prefixados; URLs absolutas, data: e blob: passam como estão.
 */
export function urlDaFoto(src: string, base: string): string {
  if (!src.startsWith("/") || src.startsWith("//")) return src;
  const b = base.endsWith("/") ? base : `${base}/`;
  if (b !== "/" && src.startsWith(b)) return src;
  return `${b}${src.slice(1)}`;
}

/**
 * Foto real do brinde. As imagens de public/brindes/ são quadradas 1:1 (fundo contínuo), então preenche o quadro sem margem.
 * Se a imagem falhar, entra um placeholder elegante da marca (gradiente navy/sky + silhueta discreta), nunca um bloco vazio.
 * `compacto`: miniaturas (carrinho, revisão, métricas, cadastro); o placeholder usa um ícone maior.
 *
 * Carregamento (10.3): o quadro já reserva o tamanho (aspect-square), então nada se desloca. Enquanto a imagem carrega, o fundo neutro
 * pulsa de leve; no onLoad a imagem faz fade-in. Imagem que já estava em cache na montagem entra sem fade (não "pisca").
 */
export function FotoBrinde({
  src,
  alt,
  className = "",
  compacto = false,
}: {
  src: string;
  alt: string;
  className?: string;
  compacto?: boolean;
}) {
  const url = urlDaFoto(src, import.meta.env.BASE_URL);
  // key: trocar a foto reinicia o estado de carregamento.
  return <FotoCarregavel key={url} url={url} alt={alt} className={className} compacto={compacto} />;
}

/**
 * Polimento final: só nas miniaturas (`compacto`), as fotos em que o produto ocupa pouco do quadrado (caixa do produto ≤ 55% nos dois eixos,
 * medida nos pixels de 800×800) ganham um zoom leve de 1,25 em torno do centro, sem cortar nem deformar (a caixa ampliada fica em ≤ 70%).
 * Foto grande (vitrine, página do brinde) nunca passa por aqui.
 */
export const ZOOM_MINIATURA = 1.25;
const FOTOS_PEQUENAS_NO_QUADRO = ["camiseta.png", "caderno-caneta-2.png"];
export function zoomDaMiniatura(url: string): { scale: number } | undefined {
  const arquivo = url.split("/").pop() ?? "";
  return FOTOS_PEQUENAS_NO_QUADRO.includes(arquivo) ? { scale: ZOOM_MINIATURA } : undefined;
}

/** URLs que já terminaram de carregar nesta sessão: ao voltar para uma tela, a foto entra direto (sem pulso e sem fade). */
const fotosJaCarregadas = new Set<string>();

function FotoCarregavel({ url, alt, className, compacto }: { url: string; alt: string; className: string; compacto: boolean }) {
  const [estado, setEstado] = useState<"carregando" | "pronta" | "cache" | "falhou">(() => (fotosJaCarregadas.has(url) ? "cache" : "carregando"));
  // Ref estável: na montagem, se o navegador já tem a imagem decodificada, pula o fade. A atualização acontece antes da primeira pintura.
  const aoMontar = useCallback(
    (img: HTMLImageElement | null) => {
      if (img && img.complete && img.naturalWidth > 0) {
        fotosJaCarregadas.add(url);
        setEstado((e) => (e === "carregando" ? "cache" : e));
      }
    },
    [url],
  );
  return (
    <div className={`le-foto relative aspect-square w-full overflow-hidden bg-secondary ${className}`}>
      {estado === "falhou" ? (
        <div role="img" aria-label={alt} className="grid size-full place-items-center bg-gradient-to-br from-navy to-sky">
          <Package className={`${compacto ? "size-1/2" : "size-1/4"} text-navy-foreground/70`} strokeWidth={1.25} aria-hidden />
        </div>
      ) : (
        <>
          {estado === "carregando" && <span className="le-foto-pulso" aria-hidden />}
          <img
            ref={aoMontar}
            src={url}
            alt={alt}
            width={800}
            height={800}
            loading="lazy"
            decoding="async"
            data-cache={estado === "cache"}
            onLoad={() => {
              fotosJaCarregadas.add(url);
              setEstado((e) => (e === "carregando" ? "pronta" : e));
            }}
            onError={() => setEstado("falhou")}
            // Propriedade `scale` (não `transform`): o zoom de hover do cartão da vitrine usa transform e não se soma a este.
            style={compacto ? zoomDaMiniatura(url) : undefined}
            className={`size-full object-cover ${estado === "carregando" ? "opacity-0" : "opacity-100"}`}
          />
        </>
      )}
    </div>
  );
}

/* ------------------------------ Movimento (10.3) ------------------------------ */

/**
 * Mensagem de sucesso ou erro numa faixa reservada: a faixa (e a altura dela) é do chamador; aqui só o texto aparece com fade de 120 ms.
 * O `key` pelo texto refaz o fade quando a mensagem muda. Sem texto não renderiza nada.
 */
export function Msg({ texto, className = "" }: { texto: string | null | undefined; className?: string }) {
  if (!texto) return null;
  return (
    <span key={texto} className={`le-msg ${className}`}>
      {texto}
    </span>
  );
}

/**
 * Fecha com animação de saída: marca `saindo` (a saída roda no CSS) e só chama `onFechar` depois de `ms`, para o desmonte vir depois.
 * Com movimento reduzido fecha na hora. Chamadas repetidas durante a saída são ignoradas.
 */
export function useSaidaAnimada(onFechar: () => void, ms: number = SAIDA_DIALOGO_MS) {
  const [saindo, setSaindo] = useState(false);
  const aoFechar = useRef(onFechar);
  aoFechar.current = onFechar;
  const emSaida = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const fechar = useCallback(() => {
    if (emSaida.current) return;
    if (movimentoReduzido()) {
      aoFechar.current();
      return;
    }
    emSaida.current = true;
    setSaindo(true);
    timer.current = window.setTimeout(() => aoFechar.current(), ms);
  }, [ms]);
  return { saindo, fechar };
}

/**
 * Mantém o último valor não nulo por `ms` depois que `valor` vira null, para a saída animada ter o que mostrar.
 * Com movimento reduzido não retém nada. Enquanto `valor` existe, devolve `valor` direto.
 */
export function useRetido<T>(valor: T | null, ms: number): T | null {
  const [retido, setRetido] = useState<T | null>(valor);
  useEffect(() => {
    if (valor !== null) {
      setRetido(valor);
      return;
    }
    const t = window.setTimeout(() => setRetido(null), ms);
    return () => window.clearTimeout(t);
  }, [valor, ms]);
  if (valor !== null) return valor;
  return movimentoReduzido() ? null : retido;
}

/** Número que sobe a cada mudança de `valor` depois da montagem (0 até a primeira mudança). Serve de `key` para reiniciar um pulso. */
export function useContagemDeMudancas(valor: unknown): number {
  const [n, setN] = useState(0);
  const anterior = useRef(valor);
  useEffect(() => {
    if (anterior.current === valor) return;
    anterior.current = valor;
    setN((c) => c + 1);
  }, [valor]);
  return n;
}

/**
 * Par (ou trio) de pills de largura igual com um indicador que DESLIZA (translateX) entre as opções.
 * Os botões não mudam de posição nem de largura: só o indicador e a cor do texto mudam. `aria-pressed` segue em cada botão.
 */
export function ParDeslizante<T extends string | number | boolean>({
  rotulo,
  opcoes,
  valor,
  onChange,
  className = "",
  botaoClassName = "",
}: {
  rotulo: string;
  opcoes: { id: T; rotulo: ReactNode }[];
  valor: T;
  onChange: (id: T) => void;
  /** Classes do contêiner (grade de colunas iguais, fundo, largura). */
  className?: string;
  /** Classes dos botões (altura, largura, foco). */
  botaoClassName?: string;
}) {
  const i = Math.max(0, opcoes.findIndex((o) => o.id === valor));
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={`le-par ${className}`}
      style={{ "--n": opcoes.length, "--i": i } as CSSProperties}
    >
      <span aria-hidden className="le-par-ind rounded-full bg-navy" />
      {opcoes.map((o) => (
        <button
          key={String(o.id)}
          type="button"
          aria-pressed={valor === o.id}
          onClick={() => onChange(o.id)}
          className={`le-cor relative z-[1] ${botaoClassName} ${valor === o.id ? "text-navy-foreground" : "text-navy hover:bg-card"}`}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}

/** Selo informativo. "Últimas unidades" usa laranja com texto escuro; "Novidade" usa navy cheio com texto branco (Req. 12.12). */
export function Selo({ tipo }: { tipo: "novidade" | "ultimas" }) {
  const estilo = tipo === "novidade" ? "bg-navy text-white" : "bg-accent text-[color:var(--on-accent)]";
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 font-display text-xs font-bold ${estilo}`}>
      {tipo === "novidade" ? "Novidade" : "Últimas unidades"}
    </span>
  );
}

/**
 * Pista de rolagem horizontal (A-04, A-17). Liga data-borda-esq/data-borda-dir no elemento quando há conteúdo escondido
 * daquele lado (a máscara de gradiente fica em .le-rola, equilibrio.css) e rola o item ativo (aria-current ou aria-pressed)
 * para o centro da faixa quando `chave` muda. Só mexe em scrollLeft da faixa: a página nunca rola por causa disso.
 */
export function useFaixaRolante<T extends HTMLElement>(chave: unknown) {
  const ref = useRef<T>(null);

  const atualizar = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.bordaEsq = String(el.scrollLeft > 2);
    el.dataset.bordaDir = String(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    atualizar();
    el.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(atualizar) : null;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
      ro?.disconnect();
    };
  }, [atualizar]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ativo = el.querySelector<HTMLElement>('[aria-current="page"], [aria-pressed="true"]');
    if (ativo && el.scrollWidth > el.clientWidth) {
      const e = el.getBoundingClientRect();
      const a = ativo.getBoundingClientRect();
      el.scrollLeft += a.left - e.left - (el.clientWidth - a.width) / 2;
    }
    atualizar();
  }, [chave, atualizar]);

  return ref;
}

/* ----------------------- Foco e rolagem de painéis modais (A-13) ----------------------- */

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let travasDeRolagem = 0;
let overflowAnterior = "";

/** Trava a rolagem do fundo (contador: painéis empilhados só liberam quando o último fecha). A barra não some: scrollbar-gutter já é estável. */
function travarRolagem(): () => void {
  const html = document.documentElement;
  if (travasDeRolagem === 0) {
    overflowAnterior = html.style.overflow;
    html.style.overflow = "hidden";
  }
  travasDeRolagem += 1;
  return () => {
    travasDeRolagem -= 1;
    if (travasDeRolagem === 0) html.style.overflow = overflowAnterior;
  };
}

function focaveisDe(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCAVEIS)).filter(
    (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden",
  );
}

/**
 * Painel modal acessível: prende Tab/Shift+Tab dentro do contêiner, trava a rolagem do fundo e,
 * ao fechar, devolve o foco ao elemento que o abriu. O Esc continua com quem usa o hook.
 * `inicial`: "primeiro" foca o primeiro controle; "container" foca o próprio contêiner (precisa de tabIndex={-1}).
 */
export function useArmadilhaFoco(ativo: boolean, ref: RefObject<HTMLElement | null>, inicial: "primeiro" | "container" = "primeiro") {
  useEffect(() => {
    const el = ref.current;
    if (!ativo || !el) return;
    const gatilho = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const destravar = travarRolagem();

    if (inicial === "container") el.focus({ preventScroll: true });
    else (focaveisDe(el)[0] ?? el).focus({ preventScroll: true });

    const aoTeclar = (ev: KeyboardEvent) => {
      if (ev.key !== "Tab") return;
      const itens = focaveisDe(el);
      if (itens.length === 0) {
        ev.preventDefault();
        el.focus();
        return;
      }
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      const atual = document.activeElement;
      if (!el.contains(atual)) {
        ev.preventDefault();
        primeiro.focus();
      } else if (ev.shiftKey && (atual === primeiro || atual === el)) {
        ev.preventDefault();
        ultimo.focus();
      } else if (!ev.shiftKey && atual === ultimo) {
        ev.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      destravar();
      if (gatilho && gatilho !== document.body && document.contains(gatilho)) gatilho.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo]);
}

/** true enquanto a largura da janela é menor que o breakpoint lg (1024 px). */
export function useAbaixoDeLg(): boolean {
  const consulta = "(max-width: 1023.98px)";
  const [abaixo, setAbaixo] = useState(() => (typeof window === "undefined" ? false : window.matchMedia(consulta).matches));
  useEffect(() => {
    const m = window.matchMedia(consulta);
    const f = () => setAbaixo(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return abaixo;
}
