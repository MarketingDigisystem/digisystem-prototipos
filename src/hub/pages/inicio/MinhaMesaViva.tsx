/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho/src/hub/pages/MinhaMesa.tsx (main @ 0a6b425) e
 *   src/routes/_authenticated/index.tsx @ 6d98c66^ (frase do dia antiga) @ leitura 2026-10-27.
 *   Revisado em 2026-10-27 (tarde), sem nova leitura do real: modo Reorganizar e
 *   card novo da frase do dia (decisões 7 e 6 revisada do pacote).
 *   Revisado em 2026-10-27 (fim da tarde): frase do dia na VERSÃO PRÉ-APROVADA
 *   (bilhete cinza grafite + fita + traço à mão) e pills "Com fita | Sem fita"
 *   no modo Reorganizar (arranjo.fraseComFita, salvo com a mesa).
 *   Revisado em 2026-10-27 (noite): disposição livre em colunas (decisão 8) e
 *   só Acordeão (decisão 2).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Minha Mesa viva (endereço #/inicio?mesa=viva; a mesa atual segue em #/inicio):
 *  - MODO REORGANIZAR é o único lugar de edição: fora dele a mesa é só de uso
 *    (sem alça, setas, tamanho, ⋯, Fixado, densidade, adicionar, gaveta; o
 *    arrastar fica desligado). Botão "Reorganizar" vira "Concluir"; Esc sai;
 *  - saudação + frase do dia de volta (R-MES-1), com o dia num bilhete com fita (ou limpo);
 *  - DISPOSIÇÃO LIVRE (decisão 8): sequência de seções; cada seção é um card
 *    largo (largura toda) ou um bloco de duas colunas independentes, cada uma
 *    uma pilha sem buracos. Arrastar (dnd-kit, multiple containers) move dentro
 *    da coluna, para a outra coluna ou entre blocos; setas ↑↓ andam na ordem
 *    lógica e ← → trocam de coluna (caminho de teclado garantido);
 *  - principais (Minhas tarefas, Publicar hoje, Para ajustar) e opcionais pela
 *    galeria; ocultar manda para a gaveta;
 *  - densidade Compacto / Mostrar tudo (mesa e por card);
 *  - subtarefas só em Acordeão (decisão 2; B1 Deslizar removido);
 *  - arranjo salvo no localStorage por pessoa, com migração do formato antigo
 *    (ordem linear) para o de seções (no app real: banco, com OK).
 */
import { useEffect, useRef, useState, type ComponentType } from "react";
import { Check, LayoutGrid, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useHub } from "../../store/HubStore";
import { resumoDaMesa } from "../../store/regras";
import type { Papel } from "../../store/tipos";
import { comTransicao, useMovimentoReduzido } from "./mesa-viva/anim";
import { BannerFrase } from "./mesa-viva/BannerFrase";
import { BarraPrototipo } from "./mesa-viva/BarraPrototipo";
import type { Casca } from "./mesa-viva/CardMesa";
import { CATALOGO, papelDecide, type CardId } from "./mesa-viva/catalogo";
import { CardParaAjustar } from "./mesa-viva/cards/CardParaAjustar";
import { CardParaAprovar } from "./mesa-viva/cards/CardParaAprovar";
import { CardPedidosNovos } from "./mesa-viva/cards/CardPedidosNovos";
import { CardPostsRecentes } from "./mesa-viva/cards/CardPostsRecentes";
import { CardPrazosSemana } from "./mesa-viva/cards/CardPrazosSemana";
import { CardPublicarHoje } from "./mesa-viva/cards/CardPublicarHoje";
import { CardTarefas } from "./mesa-viva/cards/CardTarefas";
import { CardTendencia } from "./mesa-viva/cards/CardTendencia";
import { CardTriagem } from "./mesa-viva/cards/CardTriagem";
import { GaleriaCards } from "./mesa-viva/GaleriaCards";
import { GavetaOcultos } from "./mesa-viva/GavetaOcultos";
import { GradeMesa, type CascaSemAlca } from "./mesa-viva/GradeMesa";
import type { DirecaoSeta } from "./mesa-viva/CardMesa";
import {
  adicionar,
  alternarTamanho,
  apagarArranjo,
  aplicarColunasDeTrabalho,
  arranjoPadrao,
  definirDensidadeCard,
  definirDensidadeMesa,
  definirFraseComFita,
  densidadeCardDe,
  densidadeDe,
  foraDaMesa,
  ladoDe,
  lerArranjo,
  lerPrefs,
  moverLargo,
  moverNaOrdem,
  ocultar,
  ocultosVisiveis,
  podeMover,
  restaurar,
  salvarArranjo,
  salvarPrefs,
  tamanhoDe,
  trocarColuna,
  vistaDaMesa,
  visiveisNaMesa,
  type ArranjoMesa,
  type Lado,
  type PrefsPrototipo,
} from "./mesa-viva/layout";
import { PreferenciasMesa } from "./mesa-viva/PreferenciasMesa";
import "./mesa-viva/mesa-viva.css";

const COMPONENTES: Record<CardId, ComponentType<{ casca: Casca }>> = {
  tarefas: CardTarefas,
  publicar: CardPublicarHoje,
  ajustar: CardParaAjustar,
  aprovar: CardParaAprovar,
  triagem: CardTriagem,
  pedidos: CardPedidosNovos,
  tendencia: CardTendencia,
  prazos: CardPrazosSemana,
  recentes: CardPostsRecentes,
};

const ordinal = (n: number) => `${n}º`;

function saudacao(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function dataPorExtenso(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  const s = new Date(a, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function MinhaMesaViva() {
  const { hoje, papel, usuario, sel, acoes } = useHub();
  const reduzido = useMovimentoReduzido();
  const armazenamento = window.localStorage;

  const [arranjo, setArranjo] = useState<ArranjoMesa>(() => lerArranjo(armazenamento, usuario.id).arranjo);
  const [prefs, setPrefsEstado] = useState<PrefsPrototipo>(() => lerPrefs(armazenamento));
  const [galeria, setGaleria] = useState(false);
  // Modo Reorganizar: o ÚNICO lugar onde a mesa se edita. Sempre começa desligado.
  const [reorganizar, setReorganizar] = useState(false);
  const refBotaoReorganizar = useRef<HTMLButtonElement>(null);
  const arrastando = useRef(false);
  const modoJaMudou = useRef(false);
  // "Rever entrada da frase" (opções do protótipo): remonta o card da frase.
  const [revisaoFrase, setRevisaoFrase] = useState(0);
  const [destaque, setDestaque] = useState<Set<CardId>>(new Set());
  const [anuncio, setAnuncio] = useState({ texto: "", n: 0 });
  const refsSetas = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});
  const refBotaoGaleria = useRef<HTMLButtonElement>(null);
  const arranjoRef = useRef(arranjo);
  arranjoRef.current = arranjo;

  // Cada pessoa de demo tem a própria mesa ("Entrar como" troca o usuário).
  const usuarioLido = useRef<string | null>(null);
  useEffect(() => {
    if (usuarioLido.current === usuario.id) return;
    const primeiraVez = usuarioLido.current === null;
    usuarioLido.current = usuario.id;
    const r = lerArranjo(armazenamento, usuario.id);
    if (!primeiraVez) setArranjo(r.arranjo);
    if (r.problema) acoes.avisar("Não deu para ler o arranjo salvo da sua mesa. Voltamos ao padrão.", "erro");
  }, [usuario.id, armazenamento, acoes]);

  // Tema escuro no <html>, como o useAplicarTemaHub do real (fundo e dock juntos).
  useEffect(() => {
    const html = document.documentElement;
    if (prefs.tema === "escuro") html.dataset.hubTema = "escuro";
    else delete html.dataset.hubTema;
    return () => {
      delete html.dataset.hubTema;
    };
  }, [prefs.tema]);

  const anunciar = (texto: string) => setAnuncio((a) => ({ texto, n: a.n + 1 }));

  // Foco: ao entrar no modo, vai para o primeiro controle de edição visível;
  // ao concluir, volta para o botão.
  useEffect(() => {
    if (!modoJaMudou.current) return;
    if (reorganizar) {
      const candidatos = document.querySelectorAll<HTMLElement>("[data-mmv-edicao]");
      const primeiro = [...candidatos].find((el) => el.offsetParent !== null && !el.hasAttribute("disabled") && el.tabIndex >= 0);
      primeiro?.focus({ preventScroll: true });
    } else {
      refBotaoReorganizar.current?.focus({ preventScroll: true });
    }
  }, [reorganizar]);

  // Esc sai do modo (menus, galeria e arrastar tratam o próprio Esc antes).
  useEffect(() => {
    if (!reorganizar) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || arrastando.current || galeria) return;
      alternarModo(false);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reorganizar, galeria]);

  const alternarModo = (ligar: boolean) => {
    modoJaMudou.current = true;
    setReorganizar(ligar);
    anunciar(ligar ? "Modo Reorganizar ligado. Arraste os cards, mude o tamanho ou oculte o que não usa." : "Mesa reorganizada. A ordem ficou salva.");
  };

  const destacar = (id: CardId) => {
    setDestaque((s) => new Set(s).add(id));
    window.setTimeout(
      () =>
        setDestaque((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        }),
      1250,
    );
  };

  /** Aplica uma mudança no arranjo, grava e (opcionalmente) anima com View Transitions. */
  const mudar = (f: (a: ArranjoMesa) => ArranjoMesa, opcoes: { transicao?: boolean; depois?: (novo: ArranjoMesa) => void } = {}) => {
    const novo = f(arranjoRef.current);
    if (novo === arranjoRef.current) return;
    const aplicar = () => {
      arranjoRef.current = novo;
      setArranjo(novo);
    };
    salvarArranjo(armazenamento, usuario.id, novo);
    if (opcoes.transicao) comTransicao(aplicar, reduzido, () => opcoes.depois?.(novo));
    else {
      aplicar();
      opcoes.depois?.(novo);
    }
  };

  const setPrefs = (p: PrefsPrototipo) => {
    setPrefsEstado(p);
    salvarPrefs(armazenamento, p);
  };

  const visiveis = visiveisNaMesa(arranjo, papel);
  const ocultos = ocultosVisiveis(arranjo, papel);
  const fora = foraDaMesa(arranjo, papel);

  const focarTitulo = (id: CardId) => document.getElementById(`mmv-titulo-${id}`)?.focus({ preventScroll: false });

  /** "na coluna da direita, 1º de 2, bloco 2 de 3" ou "o 2º bloco de 3". */
  const descreverPosicao = (a: ArranjoMesa, id: CardId) => {
    const vista = vistaDaMesa(a, papel).filter((v) => v.tipo === "largo" || v.esquerda.length + v.direita.length > 0);
    const b = vista.findIndex((v) => (v.tipo === "largo" ? v.id === id : v.esquerda.includes(id) || v.direita.includes(id)));
    const v = vista[b];
    if (!v) return "";
    if (v.tipo === "largo") return `agora é o ${ordinal(b + 1)} bloco de ${vista.length}`;
    const lado = v.esquerda.includes(id) ? "esquerda" : "direita";
    const coluna = lado === "esquerda" ? v.esquerda : v.direita;
    const blocos = vista.filter((x) => x.tipo === "colunas");
    const nBloco = blocos.indexOf(v);
    const bloco = blocos.length > 1 ? `, bloco ${nBloco + 1} de ${blocos.length}` : "";
    return `agora está na coluna da ${lado}, ${ordinal(coluna.indexOf(id) + 1)} de ${coluna.length}${bloco}`;
  };

  const OPOSTA: Record<DirecaoSeta, DirecaoSeta> = { subir: "descer", descer: "subir", esquerda: "direita", direita: "esquerda" };

  /** Depois de mover pelo botão: o foco fica no mesmo botão; se ele ficou desabilitado, vai para o oposto. */
  const focarSeta = (id: CardId, preferida: DirecaoSeta) => {
    // O botão só fica certo depois do render; um quadro depois basta.
    requestAnimationFrame(() => {
      const el = refsSetas.current[`${id}:${preferida}`];
      const alvo = el && !el.disabled ? el : refsSetas.current[`${id}:${OPOSTA[preferida]}`];
      alvo?.focus({ preventScroll: true });
      alvo?.scrollIntoView({ block: "nearest", behavior: reduzido ? "auto" : "smooth" });
    });
  };

  const mover = (id: CardId, delta: -1 | 1) =>
    mudar((a) => moverNaOrdem(a, id, delta, papel), {
      transicao: true,
      depois: (novo) => {
        focarSeta(id, delta === -1 ? "subir" : "descer");
        anunciar(`${CATALOGO[id].titulo} ${descreverPosicao(novo, id)}.`);
      },
    });

  const trocarLado = (id: CardId, para: Lado) =>
    mudar((a) => trocarColuna(a, id, para, papel), {
      transicao: true,
      depois: (novo) => {
        focarSeta(id, para === "esq" ? "esquerda" : "direita");
        anunciar(`${CATALOGO[id].titulo} ${descreverPosicao(novo, id)}.`);
      },
    });

  const ocultarCard = (id: CardId) =>
    mudar((a) => ocultar(a, id), {
      transicao: true,
      depois: () => {
        anunciar(`${CATALOGO[id].titulo} foi para a gaveta.`);
        document.querySelector<HTMLElement>("[aria-label='Cards ocultos'] button")?.focus();
      },
    });

  const trazer = (id: CardId, como: "restaurar" | "adicionar") =>
    mudar((a) => (como === "restaurar" ? restaurar(a, id) : adicionar(a, id)), {
      transicao: true,
      depois: () => {
        destacar(id);
        anunciar(como === "restaurar" ? `${CATALOGO[id].titulo} voltou para a mesa.` : `${CATALOGO[id].titulo} entrou na mesa.`);
        const el = document.getElementById(`mmv-titulo-${id}`);
        el?.scrollIntoView({ block: "nearest", behavior: reduzido ? "auto" : "smooth" });
        // O foco vai para o card que chegou (a gaveta pode ter sumido).
        focarTitulo(id);
      },
    });

  const casca = (id: CardId): CascaSemAlca => ({
    id,
    meta: CATALOGO[id],
    tamanho: tamanhoDe(arranjo, id),
    densidade: densidadeDe(arranjo, id),
    densidadeCard: densidadeCardDe(arranjo, id),
    reorganizar,
    fixado: !arranjo.movido && CATALOGO[id].tipo === "principal",
    primeiro: !podeMover(arranjo, id, -1, papel),
    ultimo: !podeMover(arranjo, id, 1, papel),
    lado: ladoDe(arranjo, id) ?? undefined,
    onEsquerda: () => trocarLado(id, "esq"),
    onDireita: () => trocarLado(id, "dir"),
    onSubir: () => mover(id, -1),
    onDescer: () => mover(id, 1),
    onTamanho: () =>
      mudar((a) => alternarTamanho(a, id), {
        transicao: true,
        depois: (novo) => {
          // O card muda de pai (coluna ↔ seção) e remonta: o foco volta ao botão de tamanho.
          requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-card-id="${id}"] button[aria-pressed]`)?.focus({ preventScroll: true }));
          const lado = ladoDe(novo, id);
          anunciar(
            lado
              ? `${CATALOGO[id].titulo} voltou para a coluna da ${lado === "esq" ? "esquerda" : "direita"}.`
              : `${CATALOGO[id].titulo} agora está largo, ocupando a largura toda.`,
          );
        },
      }),
    onOcultar: () => ocultarCard(id),
    onDensidadeCard: (d) => mudar((a) => definirDensidadeCard(a, id, d)),
    registrarSeta: (dir, el) => {
      refsSetas.current[`${id}:${dir}`] = el;
    },
  });

  const mesa = sel.mesa();
  const primeiroNome = usuario.nome.split(" ")[0];
  const indicados: CardId[] = papelDecide(papel) ? ["aprovar", "triagem", "pedidos"] : [];

  const trocarPapel = (p: Papel) => acoes.entrarComo(p);

  const restaurarPadrao = () => {
    apagarArranjo(armazenamento, usuario.id);
    comTransicao(
      () => {
        arranjoRef.current = arranjoPadrao();
        setArranjo(arranjoRef.current);
      },
      reduzido,
      () => anunciar("Mesa padrão restaurada."),
    );
    acoes.avisar("Mesa padrão restaurada.");
  };

  const fecharGaleria = () => {
    setGaleria(false);
    refBotaoGaleria.current?.focus();
  };

  const botaoGaleria = (
    <button
      ref={refBotaoGaleria}
      type="button"
      onClick={() => setGaleria(true)}
      disabled={fora.length === 0}
      title={fora.length === 0 ? "Todos os cards já estão na sua mesa ou na gaveta." : undefined}
      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-display text-xs font-bold text-primary-foreground shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
    >
      <Plus aria-hidden className="h-4 w-4" /> Adicionar card
      {fora.length > 0 && <span className="font-normal opacity-80">· {fora.length}</span>}
    </button>
  );

  return (
    <>
      <section className="animate-rise mt-8" style={{ animationDelay: "0ms" }}>
        <p className="mmv-texto-laranja font-display text-xs font-bold uppercase tracking-[0.2em]">{dataPorExtenso(hoje)}</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-primary sm:text-5xl">
          {saudacao(new Date().getHours())}, {primeiroNome}.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/85">{resumoDaMesa(mesa, hoje)}</p>
      </section>

      <BannerFrase key={`${hoje}:${revisaoFrase}`} dia={hoje} comFita={arranjo.fraseComFita} forcarEntrada={revisaoFrase > 0} style={{ animationDelay: "60ms" }} />

      <div className="animate-rise mt-8 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "120ms" }}>
        {reorganizar ? (
          <p className="mmv-aparece max-w-xl text-sm text-foreground/85">
            Arraste os cards, mude o tamanho ou oculte o que não usa. A ordem fica salva para você.
          </p>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <PreferenciasMesa
            reorganizar={reorganizar}
            densidade={arranjo.densidade.mesa}
            onDensidade={(d) => mudar((a) => definirDensidadeMesa(a, d))}
            comFita={arranjo.fraseComFita}
            onComFita={(v) => {
              mudar((a) => definirFraseComFita(a, v), { transicao: true });
              anunciar(v ? "Frase do dia com fita." : "Frase do dia sem fita.");
            }}
          />
          {reorganizar && <div className="mmv-aparece">{botaoGaleria}</div>}
          <button
            ref={refBotaoReorganizar}
            type="button"
            aria-pressed={reorganizar}
            onClick={() => alternarModo(!reorganizar)}
            title={reorganizar ? "Concluir (Esc)" : "Mudar a ordem, o tamanho e os cards da mesa"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              reorganizar ? "mmv-botao-laranja shadow-card hover:-translate-y-0.5 hover:shadow-float" : "text-muted-foreground ring-1 ring-border hover:bg-secondary hover:text-primary",
            )}
          >
            {reorganizar ? <Check aria-hidden className="h-4 w-4" /> : <LayoutGrid aria-hidden className="h-4 w-4" />}
            {reorganizar ? "Concluir" : "Reorganizar"}
          </button>
        </div>
      </div>

      <div className="mt-5">
        {visiveis.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-border px-6 py-10 text-center">
            <p className="font-display text-base font-bold text-primary">Sua mesa está vazia.</p>
            <p className="mt-1 text-sm text-muted-foreground">Em Reorganizar, traga um card de volta pela gaveta ou adicione um novo.</p>
          </section>
        ) : (
          <GradeMesa
            vista={vistaDaMesa(arranjo, papel)}
            componentes={COMPONENTES}
            casca={casca}
            destaque={destaque}
            reorganizar={reorganizar}
            onArrastando={(v) => {
              arrastando.current = v;
            }}
            onSoltarColunas={(t) => mudar((a) => aplicarColunasDeTrabalho(a, t, papel))}
            onMoverLargo={(id, indice) => mudar((a) => moverLargo(a, id, indice))}
            rodapeGrade={
              reorganizar && fora.length > 0 ? (
                <div className="mmv-aparece mt-5 grid gap-5 lg:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setGaleria(true)}
                    className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-border px-6 py-8 text-center transition-colors duration-200 hover:border-sky hover:bg-sky-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-primary">
                      <Plus aria-hidden className="h-4 w-4" /> Adicionar card
                    </span>
                    <span className="text-xs text-muted-foreground">Escolha o que mais ajuda no seu dia.</span>
                  </button>
                </div>
              ) : undefined
            }
          />
        )}
      </div>

      {reorganizar && (
        <div className="mmv-aparece">
          <GavetaOcultos ocultos={ocultos} onRestaurar={(id) => trazer(id, "restaurar")} />
        </div>
      )}

      {/* Região viva estável; o espaço fino alterna para repetir o mesmo texto. */}
      <p id="mmv-anuncio" className="sr-only" aria-live="polite">
        {anuncio.texto}
        {anuncio.n % 2 ? "\u00a0" : ""}
      </p>

      <BarraPrototipo
        papel={papel}
        onPapel={trocarPapel}
        prefs={prefs}
        onPrefs={setPrefs}
        onRestaurar={restaurarPadrao}
        onReverEntrada={() => setRevisaoFrase((n) => n + 1)}
      />

      {reorganizar && galeria && (
        <GaleriaCards
          cards={fora}
          indicados={indicados}
          onFechar={fecharGaleria}
          onAdicionar={(id) => {
            setGaleria(false);
            trazer(id, "adicionar");
          }}
        />
      )}
    </>
  );
}
