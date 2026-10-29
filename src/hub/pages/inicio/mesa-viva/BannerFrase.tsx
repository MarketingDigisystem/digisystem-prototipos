/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho src/routes/_authenticated/index.tsx @ 6d98c66^ (frase do dia do Dashboard antigo) @ leitura 2026-10-27.
 *   Revisado em 2026-10-27 (fim da tarde), sem nova leitura do real: VERSÃO PRÉ-APROVADA
 *   "merge fita + traço à mão" (bilhete cinza grafite + fita laranja + divisor à mão intenso),
 *   com a preferência Com fita | Sem fita. Substitui a "folha de calendário".
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *   (decisão 6, VERSÃO PRÉ-APROVADA vigente).
 *
 * Card da frase do dia (R-MES-1). Fundo normal do card, sem degradê, sem faixa
 * lateral, sem símbolo da IA (lista curada, não é IA) e sem "Outra frase": a
 * frase só muda de um dia para o outro. Três colunas:
 *  - o dia num bilhete cinza grafite inclinado, preso por fita laranja com o
 *    TEMA da frase escrito nela (aprovado em 2026-10-27; a etiqueta de tema ao
 *    lado de "Frase do dia" some para não repetir). Com "Sem fita", o dia fica
 *    limpo (sem bilhete nem fita) e a etiqueta de tema volta;
 *  - um divisor desenhado à mão, em azul mais intenso;
 *  - a frase, com a palavra-chave circulada por traço de caneta e uma setinha
 *    desenhada até o autor.
 * Entrada animada só na primeira abertura da mesa no dia (localStorage). Hover
 * sempre vivo: o bilhete se endireita, a fita levanta, o círculo balança e
 * aparece "Copiar". Com menos movimento, tudo pronto.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { useMovimentoReduzido } from "./anim";
import { fraseDoDia, palavrasDaFrase, type Palavra } from "./frases";
import { deveAnimarEntradaFrase, marcarEntradaFrase, type Armazenamento } from "./layout";

// Linha do tempo da entrada (ms), a mesma do mock aprovado.
const INICIO_PALAVRAS = 900;
const PASSO_PALAVRA = 50;
const DURACAO_PALAVRA = 500;

function partesDaData(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  const data = new Date(a, m - 1, d);
  const semana = data.toLocaleDateString("pt-BR", { weekday: "long" });
  const mes = data.toLocaleDateString("pt-BR", { month: "long" });
  const extenso = data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return { semana, numero: d, mes, extenso };
}

function armazenamentoPadrao(): Armazenamento | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function BannerFrase({
  dia,
  comFita = true,
  forcarEntrada = false,
  armazenamento = armazenamentoPadrao(),
  style,
}: {
  dia: string;
  /** Preferência da mesa: dia no bilhete com fita (padrão) ou limpo. */
  comFita?: boolean;
  /** "Rever entrada da frase" das opções do protótipo. */
  forcarEntrada?: boolean;
  armazenamento?: Armazenamento | null;
  style?: CSSProperties;
}) {
  const reduzido = useMovimentoReduzido();
  const f = fraseDoDia(dia);
  const palavras = palavrasDaFrase(f);
  const data = partesDaData(dia);

  // Decide uma vez por montagem (o pai remonta com outro `key` ao mudar o dia
  // ou ao pedir para rever a entrada).
  const [entrando, setEntrando] = useState(
    () => !reduzido && (forcarEntrada || (armazenamento ? deveAnimarEntradaFrase(armazenamento, dia) : false)),
  );
  const [copiada, setCopiada] = useState<"ok" | "erro" | null>(null);
  const timerCopia = useRef<number | undefined>(undefined);

  const tLaco = INICIO_PALAVRAS + palavras.length * PASSO_PALAVRA + 200;
  const tSeta = tLaco + 900;
  const tAutor = tSeta + 400;
  const total = tAutor + 600;

  useEffect(() => {
    if (armazenamento) marcarEntradaFrase(armazenamento, dia);
  }, [armazenamento, dia]);

  // Terminada a entrada, tira as animações (o hover volta a valer).
  useEffect(() => {
    if (!entrando) return;
    const t = window.setTimeout(() => setEntrando(false), total);
    return () => window.clearTimeout(t);
  }, [entrando, total]);

  useEffect(() => {
    if (reduzido) setEntrando(false);
  }, [reduzido]);

  useEffect(() => () => window.clearTimeout(timerCopia.current), []);

  const copiar = async () => {
    window.clearTimeout(timerCopia.current);
    try {
      await navigator.clipboard.writeText(`“${f.texto}” — ${f.autor}`);
      setCopiada("ok");
    } catch {
      setCopiada("erro");
    }
    timerCopia.current = window.setTimeout(() => setCopiada(null), 1800);
  };

  const tempos = {
    "--mmv-t-laco": `${tLaco}ms`,
    "--mmv-t-seta": `${tSeta}ms`,
    "--mmv-t-autor": `${tAutor}ms`,
  } as CSSProperties;

  return (
    <section
      aria-labelledby="mmv-frase-rotulo"
      data-entrada={entrando || undefined}
      data-fita={comFita ? "com" : "sem"}
      className="mmv-fd group animate-rise relative mt-6 flex flex-col gap-4 rounded-3xl bg-card px-5 pb-6 pt-6 text-card-foreground shadow-card sm:grid sm:grid-cols-[150px_auto_minmax(0,1fr)] sm:items-center sm:gap-x-6 sm:gap-y-0 sm:py-6 sm:pl-5 sm:pr-8"
      style={{ ...style, ...tempos }}
    >
      <Dia {...data} dia={dia} comFita={comFita} tema={f.tema} />

      <svg aria-hidden className="mmv-fd-divisor hidden h-[120px] w-3.5 overflow-visible sm:block" viewBox="0 0 14 120">
        <path pathLength={1} d="M7,4 C3,30 11,52 7,72 C4,90 10,104 7,116" />
      </svg>

      <figure className="relative min-w-0">
        <p className="mmv-fd-kick flex flex-wrap items-center gap-2.5">
          <span id="mmv-frase-rotulo" className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Frase do dia
          </span>
          {/* Com fita, o tema vai escrito na fita: a etiqueta não se repete aqui. */}
          {comFita ? (
            <span className="sr-only">Tema: {f.tema}</span>
          ) : (
            <span className="mmv-fd-tema rounded-full px-2.5 py-0.5 font-display text-[10.5px] font-bold uppercase tracking-wider">{f.tema}</span>
          )}
        </p>
        <blockquote className="relative z-0 mt-2.5 max-w-[50ch] font-display text-[21px] font-bold leading-[1.34] text-primary sm:text-[25px]">
          <FraseComChave palavras={palavras} />
        </blockquote>
        <figcaption className="mt-1.5 flex items-start gap-1.5">
          <svg aria-hidden className="mmv-fd-seta ml-1.5 h-[30px] w-[50px] shrink-0 overflow-visible" viewBox="0 0 50 30">
            <path pathLength={1} d="M4,2 C5,15 15,24 38,23" />
            <path pathLength={1} d="M31,17 L39,23 L31,28" />
          </svg>
          <span className="mmv-fd-autor mt-2.5 text-[13px] text-muted-foreground">
            <span className="mmv-texto-laranja font-display text-[12.5px] font-bold uppercase tracking-[0.06em]">{f.autor}</span>
            {f.fonte && (
              <>
                <span aria-hidden> · </span>
                {f.fonte}
              </>
            )}
          </span>
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={copiar}
        aria-label={copiada === "ok" ? "Frase copiada" : "Copiar a frase do dia"}
        className="mmv-fd-copiar absolute bottom-4 right-5 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-display text-[11px] font-bold text-muted-foreground ring-1 ring-border transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copiada === "ok" ? <Check aria-hidden className="h-3.5 w-3.5 text-success" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
        {copiada === "ok" ? "Copiada" : copiada === "erro" ? "Não deu para copiar" : "Copiar"}
      </button>
      <p className="sr-only" aria-live="polite">
        {copiada === "ok" ? "Frase copiada." : copiada === "erro" ? "Não deu para copiar a frase." : ""}
      </p>
    </section>
  );
}

/** Dia da semana, número grande e mês com sublinhado à mão; no bilhete com fita ou limpo. */
function Dia({
  dia,
  semana,
  numero,
  mes,
  extenso,
  comFita,
  tema,
}: {
  dia: string;
  semana: string;
  numero: number;
  mes: string;
  extenso: string;
  comFita: boolean;
  tema: string;
}) {
  return (
    <time dateTime={dia} aria-label={extenso} className="mmv-fd-dia flex justify-start sm:min-h-[150px] sm:items-center sm:justify-center">
      <span aria-hidden className={comFita ? "mmv-fd-bilhete" : "mmv-fd-limpo"}>
        {comFita && (
          <span className="mmv-fd-fita-pos">
            <span className="mmv-fd-fita">
              <span className="mmv-fd-fita-texto font-display">{tema}</span>
            </span>
          </span>
        )}
        <span className="mmv-fd-semana block font-display text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{semana}</span>
        <span className="mmv-fd-numero block font-display font-bold tabular-nums text-primary">
          <span className="block">{numero}</span>
        </span>
        <span className="block">
          <span className="mmv-texto-laranja block font-display text-xs font-bold uppercase tracking-[0.14em]">{mes}</span>
          <svg className="mmv-fd-sublinha mx-auto mt-1 block h-2.5 w-[54px] overflow-visible" viewBox="0 0 54 10">
            <path pathLength={1} d="M3,6 C14,2 28,9 51,4" />
          </svg>
        </span>
      </span>
    </time>
  );
}

/** A frase palavra a palavra; as palavras da chave ficam juntas dentro do traço de caneta. */
function FraseComChave({ palavras }: { palavras: Palavra[] }) {
  const ini = palavras.findIndex((p) => p.marca);
  const fim = ini < 0 ? -1 : palavras.length - 1 - [...palavras].reverse().findIndex((p) => p.marca);

  const palavra = (p: Palavra, i: number) => (
    <span key={i} className="mmv-fd-palavra" style={{ animationDelay: `${INICIO_PALAVRAS + i * PASSO_PALAVRA}ms`, animationDuration: `${DURACAO_PALAVRA}ms` }}>
      {p.antes}
      {p.marca && <span className="mmv-fd-marca">{p.marca}</span>}
      {p.depois}
    </span>
  );
  const comEspaco = (nos: ReactNode[], i: number, no: ReactNode) => {
    nos.push(no);
    if (i < palavras.length - 1) nos.push(" ");
  };

  const nos: ReactNode[] = [];
  for (let i = 0; i < palavras.length; i++) {
    if (i === ini) {
      const dentro: ReactNode[] = [];
      for (let j = ini; j <= fim; j++) {
        dentro.push(palavra(palavras[j], j));
        if (j < fim) dentro.push(" ");
      }
      comEspaco(
        nos,
        fim,
        <span key="chave" className="mmv-fd-chave">
          {dentro}
          <svg aria-hidden viewBox="0 0 200 60" preserveAspectRatio="none">
            <path
              className="mmv-fd-laco"
              pathLength={1}
              d="M14,34 C8,16 58,5 104,7 C152,9 194,17 192,33 C190,49 142,57 96,55 C48,53 6,47 12,29 C16,19 38,12 62,10"
            />
          </svg>
        </span>,
      );
      i = fim;
      continue;
    }
    comEspaco(nos, i, palavra(palavras[i], i));
  }
  return <>{nos}</>;
}
