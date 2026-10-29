// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Modo Reorganizar e card novo da frase do dia (pacote, decisões 6 revisada e 7).
// Renderização estática (react-dom/server): ambiente node, sem DOM.
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BannerFrase } from "./BannerFrase";
import { CardMesa, type Casca } from "./CardMesa";
import { CATALOGO, type CardId } from "./catalogo";
import { fraseDoDia, palavrasDaFrase } from "./frases";
import { GradeMesa, type CascaSemAlca } from "./GradeMesa";
import {
  CHAVE_FRASE_ENTRADA,
  arranjoPadrao,
  chaveMesa,
  definirFraseComFita,
  deveAnimarEntradaFrase,
  ladoDe,
  lerArranjo,
  marcarEntradaFrase,
  normalizarArranjo,
  normalizarSecoes,
  salvarArranjo,
  tamanhoDe,
  vistaDaMesa,
  visiveisNaMesa,
  type ArranjoMesa,
  type Armazenamento,
  type Secao,
} from "./layout";
import { PreferenciasMesa } from "./PreferenciasMesa";

function memoria(inicial: Record<string, string> = {}): Armazenamento {
  const m = new Map(Object.entries(inicial));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

const nada = () => {};
const cascaDe = (id: CardId, reorganizar: boolean, a: ArranjoMesa = arranjoPadrao()): CascaSemAlca => ({
  id,
  meta: CATALOGO[id],
  tamanho: tamanhoDe(a, id),
  densidade: "compacto",
  densidadeCard: "seguir",
  reorganizar,
  fixado: true,
  primeiro: false,
  ultimo: false,
  lado: ladoDe(a, id) ?? undefined,
  onEsquerda: nada,
  onDireita: nada,
  onSubir: nada,
  onDescer: nada,
  onTamanho: nada,
  onOcultar: nada,
  onDensidadeCard: nada,
  registrarSeta: nada,
});

/** Card mínimo: a casca de verdade com um corpo de uso (link de abrir item). */
const CardTeste: ComponentType<{ casca: Casca }> = ({ casca }) =>
  createElement(CardMesa, { casca, contador: 2, children: createElement("a", { href: "#/x" }, "Abrir item") });

const COMPONENTES = Object.fromEntries(Object.keys(CATALOGO).map((id) => [id, CardTeste])) as Record<CardId, ComponentType<{ casca: Casca }>>;

function grade(reorganizar: boolean, a: ArranjoMesa = arranjoPadrao()) {
  return renderToStaticMarkup(
    createElement(GradeMesa, {
      vista: vistaDaMesa(a, "marketing"),
      componentes: COMPONENTES,
      casca: (id: CardId) => cascaDe(id, reorganizar, a),
      destaque: new Set<CardId>(),
      reorganizar,
      onSoltarColunas: nada,
      onMoverLargo: nada,
    }),
  );
}

const arranjo = (secoes: Secao[]): ArranjoMesa => ({ ...arranjoPadrao(), secoes: normalizarSecoes(secoes) });

const CONTROLES = [
  /aria-label="Arrastar /,
  /aria-label="Mover [^"]+ para cima"/,
  /aria-label="Mover [^"]+ para baixo"/,
  /aria-label="Mover [^"]+ para a coluna da (esquerda|direita)"/,
  /aria-label="Deixar [^"]+ (largo|normal)/,
  /aria-label="Opções de /,
  />Fixado</,
];

describe("modo Reorganizar", () => {
  it("(a) fora do modo, nenhum controle de edição existe no DOM", () => {
    const html = grade(false);
    for (const re of CONTROLES) expect(html, String(re)).not.toMatch(re);
    expect(html).not.toContain("data-mmv-edicao");
    expect(html).not.toContain("mmv-reorg");
    // As ações de uso continuam.
    expect(html).toContain("Abrir item");
  });

  it("(b) dentro do modo, alça, setas, tamanho, ⋯ e Fixado aparecem em cada card", () => {
    const html = grade(true);
    for (const re of CONTROLES) expect(html, String(re)).toMatch(re);
    expect(html.match(/aria-label="Arrastar /g)).toHaveLength(3);
    expect(html.match(/class="[^"]*mmv-reorg/g)).toHaveLength(3);
  });

  it("(c) o arrastar fica desligado fora do modo e ligado dentro", () => {
    expect(grade(false).match(/data-arrastavel="false"/g)).toHaveLength(3);
    expect(grade(false)).not.toContain('aria-roledescription="alça de arrastar"');
    const dentro = grade(true);
    expect(dentro.match(/data-arrastavel="true"/g)).toHaveLength(3);
    // useSortable habilitado: a alça sai com aria-disabled="false".
    expect(dentro.match(/aria-roledescription="alça de arrastar"[^>]*aria-disabled="false"|aria-disabled="false"[^>]*aria-roledescription="alça de arrastar"/g)).toHaveLength(3);
  });

  it("(b2) ← → só nos cards normais (o largo não troca de coluna)", () => {
    const html = grade(true);
    expect(html.match(/aria-label="Mover [^"]+ para a coluna da esquerda"/g)).toHaveLength(2);
    expect(html.match(/aria-label="Mover [^"]+ para a coluna da direita"/g)).toHaveLength(2);
    expect(html).not.toContain('aria-label="Mover Minhas tarefas e subtarefas para a coluna');
    expect(grade(false)).not.toMatch(/para a coluna da/);
  });

  it("(j) zona de soltar só no modo e só em coluna vazia; fora dele, vazio nem entra no DOM", () => {
    const fora = grade(false);
    expect(fora).not.toContain("data-mmv-zona");
    // Padrão: o bloco do topo (acima de Minhas tarefas) está vazio.
    expect(fora).not.toContain('data-secao="apos:topo"');
    const dentro = grade(true);
    expect(dentro.match(/data-mmv-zona/g)).toHaveLength(2);
    expect(dentro).toContain('data-secao="apos:topo"');
    expect(dentro).toContain("Espaço livre. Arraste um card para cá.");
  });

  it("(k) ordem do DOM = ordem lógica (por seção; esquerda e depois direita)", () => {
    const a = arranjo([
      { tipo: "colunas", esquerda: ["publicar", "recentes"], direita: ["ajustar"] },
      { tipo: "largo", id: "tarefas" },
      { tipo: "colunas", esquerda: ["tendencia"], direita: [] },
    ]);
    const html = grade(false, a);
    const ids = [...html.matchAll(/data-card-id="([a-z]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(visiveisNaMesa(a, "marketing"));
    expect(ids).toEqual(["publicar", "recentes", "ajustar", "tarefas", "tendencia"]);
    expect(grade(true, a).match(/data-card-id="([a-z]+)"/g)!.map((s) => s.slice(14, -1))).toEqual(ids);
  });

  it("(l) coluna da direita sozinha fica na metade da direita", () => {
    const a = arranjo([{ tipo: "colunas", esquerda: [], direita: ["ajustar"] }, { tipo: "largo", id: "tarefas" }]);
    const html = grade(false, a);
    expect(html).not.toContain('data-coluna="apos:topo|esq"');
    expect(html).toMatch(/data-coluna="apos:topo\|dir" class="[^"]*lg:col-start-2/);
  });
});

describe("card da frase do dia", () => {
  const dia = "2026-10-27";
  const render = (s: Armazenamento = memoria()) => renderToStaticMarkup(createElement(BannerFrase, { dia, armazenamento: s }));

  it("(d) sem trocar frase, sem barra de progresso e sem símbolo da IA", () => {
    const html = render();
    expect(html).not.toMatch(/Outra frase|Voltar à de hoje|ver outra/i);
    expect(html).not.toMatch(/role="progressbar"/);
    expect(html).not.toMatch(/class="[^"]*\bia-/);
    expect(html).not.toMatch(/IA Digisystem/i);
    expect(html).not.toMatch(/gradient/i);
    // Tem o dia, o tema, a chave circulada, a seta até o autor e o autor.
    const f = fraseDoDia(dia);
    expect(html).toContain(`dateTime="${dia}"`);
    expect(html).toContain(f.tema);
    expect(html.match(/class="mmv-fd-chave"/g)).toHaveLength(1);
    expect(html).toContain('class="mmv-fd-laco"');
    expect(html).toContain("mmv-fd-seta");
    expect(html).toContain("mmv-fd-divisor");
    expect(html).toContain(f.autor);
    expect(html).toContain("Copiar");
  });

  it("(f) com fita (padrão): bilhete e fita; sem fita: nem fita nem fundo do bilhete", () => {
    const com = render();
    expect(com).toContain('class="mmv-fd-bilhete"');
    expect(com).toContain('class="mmv-fd-fita"');
    expect(com).toContain('data-fita="com"');
    const sem = renderToStaticMarkup(createElement(BannerFrase, { dia, armazenamento: memoria(), comFita: false }));
    expect(sem).not.toContain("mmv-fd-bilhete");
    expect(sem).not.toContain("mmv-fd-fita");
    expect(sem).toContain('class="mmv-fd-limpo"');
    expect(sem).toContain('data-fita="sem"');
    // O dia continua inteiro.
    expect(sem).toContain(`dateTime="${dia}"`);
    expect(sem).toContain("mmv-fd-sublinha");
  });

  it("(g) com fita, o tema vai escrito na fita e a etiqueta lateral some; sem fita, o inverso", () => {
    const { tema } = fraseDoDia(dia);
    const com = render();
    expect(com).toContain(`<span class="mmv-fd-fita-texto font-display">${tema}</span>`);
    expect(com).not.toContain("mmv-fd-tema");
    const sem = renderToStaticMarkup(createElement(BannerFrase, { dia, armazenamento: memoria(), comFita: false }));
    expect(sem).not.toContain("mmv-fd-fita-texto");
    expect(sem).toMatch(new RegExp(`class="mmv-fd-tema[^"]*">${tema}<`));
  });
});

describe("preferência Com fita | Sem fita", () => {
  const dia = "2026-10-27";
  const render = (s: Armazenamento = memoria()) => renderToStaticMarkup(createElement(BannerFrase, { dia, armazenamento: s }));
  const props = (reorganizar: boolean) => ({ reorganizar, densidade: "compacto" as const, onDensidade: nada, comFita: true, onComFita: nada });

  it("(h) as pills só existem no modo Reorganizar", () => {
    const fora = renderToStaticMarkup(createElement(PreferenciasMesa, props(false)));
    expect(fora).toBe("");
    const dentro = renderToStaticMarkup(createElement(PreferenciasMesa, props(true)));
    expect(dentro).toContain('aria-label="Fita da frase do dia"');
    expect(dentro).toContain("Com fita");
    expect(dentro).toContain("Sem fita");
    expect(dentro).toMatch(/aria-checked="true"[^>]*>Com fita</);
  });

  it("(i) padrão com fita; a escolha persiste com a mesa e arranjo antigo vale como com fita", () => {
    expect(arranjoPadrao().fraseComFita).toBe(true);
    const s = memoria();
    const a = definirFraseComFita(arranjoPadrao(), false);
    salvarArranjo(s, "u-fita", a);
    expect(lerArranjo(s, "u-fita").arranjo.fraseComFita).toBe(false);
    expect(JSON.parse(s.getItem(chaveMesa("u-fita"))!).fraseComFita).toBe(false);
    const { fraseComFita: _x, ...antigo } = arranjoPadrao();
    expect(normalizarArranjo(antigo)!.fraseComFita).toBe(true);
    expect(definirFraseComFita(a, false)).toBe(a);
  });

  it("(e) a entrada animada roda só na 1ª abertura do dia (localStorage)", () => {
    const s = memoria();
    expect(deveAnimarEntradaFrase(s, dia)).toBe(true);
    expect(render(s)).toContain("data-entrada");
    marcarEntradaFrase(s, dia);
    expect(s.getItem(CHAVE_FRASE_ENTRADA)).toBe(dia);
    expect(deveAnimarEntradaFrase(s, dia)).toBe(false);
    expect(render(s)).not.toContain("data-entrada");
    // Dia seguinte: anima de novo.
    expect(deveAnimarEntradaFrase(s, "2026-10-28")).toBe(true);
    // "Rever entrada" das opções do protótipo força, mesmo já tendo rodado.
    expect(renderToStaticMarkup(createElement(BannerFrase, { dia, armazenamento: s, forcarEntrada: true }))).toContain("data-entrada");
  });

  it("a palavra-chave é marcada uma vez e o texto se mantém igual", () => {
    const f = fraseDoDia(dia);
    const p = palavrasDaFrase(f);
    expect(p.filter((x) => x.marca).map((x) => x.marca.toLowerCase()).join(" ")).toBe(f.chave.toLowerCase());
    expect(p.map((x) => x.antes + x.marca + x.depois).join(" ")).toBe(`“${f.texto}”`);
  });
});
