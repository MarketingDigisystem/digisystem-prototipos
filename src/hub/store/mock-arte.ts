/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/lib/compose/template-a.ts (referência visual da arte) @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Artes e imagens de exemplo em SVG (data URI), sem rede e sem upload.
 * Substituem o compositor real (n8n + Magnific) e o "Enviar imagem".
 */

export type FundoArte = "azul" | "laranja" | "claro" | "branco";

const FUNDOS: Record<FundoArte, { bg: string; texto: string; sub: string; anel: string; marca: string }> = {
  azul: { bg: "#36499b", texto: "#ffffff", sub: "#dfe6ff", anel: "#ff6d2d", marca: "#ffffff" },
  laranja: { bg: "#ff6d2d", texto: "#ffffff", sub: "#fff1ea", anel: "#36499b", marca: "#ffffff" },
  claro: { bg: "#67cfee", texto: "#2a397a", sub: "#2a397a", anel: "#ffffff", marca: "#2a397a" },
  branco: { bg: "#ffffff", texto: "#36499b", sub: "#5b6279", anel: "#ff6d2d", marca: "#36499b" },
};

function escapar(t: string): string {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Quebra o texto em linhas de até `max` caracteres, sem cortar palavras. */
function quebrar(texto: string, max: number): string[] {
  const linhas: string[] = [];
  let atual = "";
  for (const palavra of texto.split(/\s+/).filter(Boolean)) {
    if ((atual + " " + palavra).trim().length > max && atual) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = (atual + " " + palavra).trim();
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

const svgUri = (svg: string) => "data:image/svg+xml;utf8," + encodeURIComponent(svg);

/**
 * Arte de post no espírito do template A/B real: fundo de marca, anel laranja
 * (elemento oficial do Brand Kit), título em Dosis, subtítulo em Open Sans e a
 * assinatura "digisystem" no rodapé.
 */
export function arteExemplo(fundo: FundoArte, titulo: string, subtitulo = ""): string {
  const c = FUNDOS[fundo];
  const linhasT = quebrar(titulo, 17).slice(0, 4);
  const linhasS = subtitulo ? quebrar(subtitulo, 34).slice(0, 2) : [];
  const yBase = 400 - 64 - linhasS.length * 20 - linhasT.length * 36;
  const tTitulo = linhasT
    .map((l, i) => `<text x='36' y='${yBase + i * 36}' font-family='Dosis, sans-serif' font-size='32' font-weight='800' fill='${c.texto}'>${escapar(l)}</text>`)
    .join("");
  const ySub = yBase + linhasT.length * 36 + 6;
  const tSub = linhasS
    .map((l, i) => `<text x='36' y='${ySub + i * 20}' font-family='Open Sans, sans-serif' font-size='14' fill='${c.sub}'>${escapar(l)}</text>`)
    .join("");
  return svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>` +
      `<rect width='400' height='400' fill='${c.bg}'/>` +
      `<circle cx='338' cy='62' r='96' fill='none' stroke='${c.anel}' stroke-width='22' opacity='.55'/>` +
      `<circle cx='338' cy='62' r='40' fill='${c.anel}' opacity='.18'/>` +
      `<rect x='36' y='${yBase - 34}' width='34' height='4' rx='2' fill='${c.anel}'/>` +
      tTitulo +
      tSub +
      `<text x='36' y='372' font-family='Dosis, sans-serif' font-size='15' font-weight='700' letter-spacing='1' fill='${c.marca}' opacity='.9'>digisystem</text>` +
      `</svg>`,
  );
}

/** Variação "versão do designer": mesma peça com acabamento diferente. */
export function arteDesigner(titulo: string, subtitulo = ""): string {
  const linhasT = quebrar(titulo, 15).slice(0, 4);
  const tTitulo = linhasT
    .map((l, i) => `<text x='200' y='${150 + i * 38}' text-anchor='middle' font-family='Dosis, sans-serif' font-size='34' font-weight='800' fill='#ffffff'>${escapar(l)}</text>`)
    .join("");
  const ySub = 150 + linhasT.length * 38 + 10;
  const tSub = subtitulo
    ? quebrar(subtitulo, 36)
        .slice(0, 2)
        .map((l, i) => `<text x='200' y='${ySub + i * 20}' text-anchor='middle' font-family='Open Sans, sans-serif' font-size='14' fill='#fff1ea'>${escapar(l)}</text>`)
        .join("")
    : "";
  return svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#2a397a'/><stop offset='1' stop-color='#36499b'/></linearGradient></defs>` +
      `<rect width='400' height='400' fill='url(#g)'/>` +
      `<circle cx='40' cy='360' r='120' fill='none' stroke='#ff6d2d' stroke-width='18' opacity='.6'/>` +
      `<circle cx='370' cy='40' r='70' fill='#67cfee' opacity='.25'/>` +
      tTitulo +
      tSub +
      `<text x='200' y='374' text-anchor='middle' font-family='Dosis, sans-serif' font-size='15' font-weight='700' letter-spacing='1' fill='#ffffff'>digisystem</text>` +
      `</svg>`,
  );
}

/** Rascunho salvo antes de compor a arte: moldura tracejada com o gancho. */
export function arteRascunho(titulo: string): string {
  const linhas = quebrar(titulo || "Post sem título", 22).slice(0, 3);
  const t = linhas
    .map((l, i) => `<text x='200' y='${178 + i * 30}' text-anchor='middle' font-family='Dosis, sans-serif' font-size='24' font-weight='700' fill='#36499b' opacity='.75'>${escapar(l)}</text>`)
    .join("");
  return svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>` +
      `<rect width='400' height='400' fill='#f4f6fb'/>` +
      `<rect x='20' y='20' width='360' height='360' rx='28' fill='none' stroke='#9aa6d6' stroke-width='3' stroke-dasharray='10 10'/>` +
      t +
      `<text x='200' y='${200 + linhas.length * 30}' text-anchor='middle' font-family='Open Sans, sans-serif' font-size='13' fill='#5b6279'>Arte ainda não composta</text>` +
      `</svg>`,
  );
}

/** true quando a arte guardada no post ainda é o rascunho (nenhuma arte finalizada). */
export function ehArteRascunho(url?: string): boolean {
  if (!url) return true;
  try {
    return decodeURIComponent(url).includes("Arte ainda não composta");
  } catch {
    return false;
  }
}

/**
 * Arte composta no Estúdio, no espírito dos templates reais:
 *  - A: foto de base + véu azul de baixo para cima + título e subtítulo;
 *  - B: bandas sobre o fundo sólido da marca (reaproveita arteExemplo);
 *  - C: capa do carrossel (fundo claro), com a indicação "1/4".
 */
export function arteComposta(opcoes: {
  template: "A" | "B" | "C";
  titulo: string;
  subtitulo?: string;
  imagemUrl?: string;
  fundo?: FundoArte;
}): string {
  const { template, titulo, subtitulo = "", imagemUrl, fundo = "azul" } = opcoes;
  if (template === "B" || (template === "A" && !imagemUrl)) return arteExemplo(fundo, titulo, subtitulo);
  if (template === "C") {
    const capa = arteExemplo("claro", titulo, subtitulo);
    const marcaPagina = `<rect x='318' y='352' width='52' height='24' rx='12' fill='#2a397a'/><text x='344' y='369' text-anchor='middle' font-family='Dosis, sans-serif' font-size='13' font-weight='700' fill='#ffffff'>1/4</text>`;
    return svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>` +
        `<image href="${capa}" width='400' height='400'/>` +
        marcaPagina +
        `</svg>`,
    );
  }
  const linhasT = quebrar(titulo, 18).slice(0, 3);
  const linhasS = subtitulo ? quebrar(subtitulo, 36).slice(0, 2) : [];
  const yBase = 400 - 60 - linhasS.length * 20 - linhasT.length * 34;
  const tTitulo = linhasT
    .map((l, i) => `<text x='32' y='${yBase + i * 34}' font-family='Dosis, sans-serif' font-size='30' font-weight='800' fill='#ffffff'>${escapar(l)}</text>`)
    .join("");
  const ySub = yBase + linhasT.length * 34 + 4;
  const tSub = linhasS
    .map((l, i) => `<text x='32' y='${ySub + i * 20}' font-family='Open Sans, sans-serif' font-size='14' fill='#dfe6ff'>${escapar(l)}</text>`)
    .join("");
  return svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>` +
      `<defs><linearGradient id='v' x1='0' y1='0' x2='0' y2='1'><stop offset='.35' stop-color='#2a397a' stop-opacity='0'/><stop offset='1' stop-color='#2a397a' stop-opacity='.92'/></linearGradient></defs>` +
      `<image href="${imagemUrl}" width='400' height='400' preserveAspectRatio='xMidYMid slice'/>` +
      `<rect width='400' height='400' fill='url(#v)'/>` +
      `<rect x='32' y='${yBase - 32}' width='34' height='4' rx='2' fill='#ff6d2d'/>` +
      tTitulo +
      tSub +
      `<text x='32' y='374' font-family='Dosis, sans-serif' font-size='15' font-weight='700' letter-spacing='1' fill='#ffffff' opacity='.9'>digisystem</text>` +
      `</svg>`,
  );
}

/** Imagens de exemplo para o Estúdio ("Enviar imagem" e "Buscar no acervo"). */
export type ImagemExemplo = { id: string; descricao: string; url: string };

/** Data URI de um SVG (a prévia ao vivo do Estúdio grava a arte final assim). */
export const svgParaUri = svgUri;

/** Variações para o acervo ter até 30 resultados a partir das 6 cenas (sem rede). */
const VARIACOES_ACERVO: { nome: string; tom?: string; espelhar?: boolean }[] = [
  { nome: "" },
  { nome: "em tons frios", tom: "#67cfee" },
  { nome: "em outro ângulo", espelhar: true },
  { nome: "em tons quentes", tom: "#ff6d2d" },
  { nome: "com luz suave", tom: "#ffffff" },
];

/**
 * Acervo de exemplo (Magnific/Freepik no real, linha 38): primeiro as cenas que
 * combinam com o termo, depois as outras, cada uma em 5 variações. Até 30.
 */
export function acervoDeExemplo(termo: string): ImagemExemplo[] {
  const palavras = termo.trim().toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const combina = (img: ImagemExemplo) => palavras.some((w) => img.descricao.toLowerCase().includes(w));
  const ordem = [...IMAGENS_EXEMPLO.filter(combina), ...IMAGENS_EXEMPLO.filter((i) => !combina(i))];
  const lista: ImagemExemplo[] = [];
  for (const v of VARIACOES_ACERVO) {
    for (const img of ordem) {
      if (!v.nome) {
        lista.push(img);
        continue;
      }
      lista.push({
        id: `${img.id}-${VARIACOES_ACERVO.indexOf(v)}`,
        descricao: `${img.descricao}, ${v.nome}`,
        url: svgUri(
          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>` +
            `<image href="${img.url}" width='400' height='400'${v.espelhar ? " transform='translate(400 0) scale(-1 1)'" : ""}/>` +
            (v.tom ? `<rect width='400' height='400' fill='${v.tom}' opacity='.22'/>` : "") +
            `</svg>`,
        ),
      });
    }
  }
  return lista.slice(0, 30);
}

function cena(id: string, descricao: string, a: string, b: string, formas: string): ImagemExemplo {
  return {
    id,
    descricao,
    url: svgUri(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>` +
        `<defs><linearGradient id='c' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs>` +
        `<rect width='400' height='400' fill='url(#c)'/>` +
        formas +
        `</svg>`,
    ),
  };
}

export const IMAGENS_EXEMPLO: ImagemExemplo[] = [
  cena(
    "img-reuniao",
    "Time de tecnologia reunido em volta de uma mesa, com notebooks abertos",
    "#dfe6ff",
    "#9aa6d6",
    `<rect x='60' y='250' width='280' height='22' rx='8' fill='#2a397a' opacity='.7'/>` +
      `<circle cx='110' cy='190' r='30' fill='#36499b'/><rect x='80' y='220' width='60' height='40' rx='16' fill='#36499b'/>` +
      `<circle cx='200' cy='175' r='32' fill='#ff6d2d'/><rect x='168' y='207' width='64' height='50' rx='18' fill='#ff6d2d'/>` +
      `<circle cx='290' cy='190' r='30' fill='#2a397a'/><rect x='260' y='220' width='60' height='40' rx='16' fill='#2a397a'/>` +
      `<rect x='150' y='236' width='44' height='16' rx='3' fill='#ffffff' opacity='.85'/><rect x='214' y='236' width='44' height='16' rx='3' fill='#ffffff' opacity='.85'/>`,
  ),
  cena(
    "img-datacenter",
    "Corredor de data center com racks iluminados em azul",
    "#2a397a",
    "#121a3d",
    Array.from({ length: 5 })
      .map((_, i) => `<rect x='${30 + i * 72}' y='90' width='52' height='250' rx='6' fill='#36499b' opacity='.9'/>` +
        Array.from({ length: 8 }).map((__, j) => `<rect x='${38 + i * 72}' y='${104 + j * 28}' width='36' height='4' rx='2' fill='#67cfee' opacity='${0.4 + ((i + j) % 3) * 0.2}'/>`).join(""))
      .join(""),
  ),
  cena(
    "img-atendimento",
    "Atendente com headset sorrindo diante de duas telas",
    "#e8f7fc",
    "#67cfee",
    `<rect x='70' y='150' width='120' height='80' rx='8' fill='#2a397a'/><rect x='210' y='150' width='120' height='80' rx='8' fill='#2a397a'/>` +
      `<circle cx='200' cy='270' r='36' fill='#ff6d2d'/><rect x='150' y='300' width='100' height='70' rx='30' fill='#ff6d2d'/>` +
      `<path d='M164 262 a36 36 0 0 1 72 0' fill='none' stroke='#2a397a' stroke-width='7'/>`,
  ),
  cena(
    "img-saude",
    "Médica consultando um tablet no corredor de um hospital",
    "#f4f7fb",
    "#c9eef8",
    `<rect x='0' y='300' width='400' height='100' fill='#9aa6d6' opacity='.35'/>` +
      `<circle cx='200' cy='130' r='38' fill='#36499b'/><rect x='150' y='170' width='100' height='150' rx='34' fill='#ffffff' stroke='#9aa6d6' stroke-width='4'/>` +
      `<rect x='214' y='210' width='50' height='66' rx='8' fill='#2a397a'/><rect x='220' y='218' width='38' height='46' rx='4' fill='#67cfee'/>`,
  ),
  cena(
    "img-graficos",
    "Notebook com painel de indicadores e gráficos em tempo real",
    "#fff1ea",
    "#ffd2bd",
    `<rect x='80' y='110' width='240' height='150' rx='12' fill='#2a397a'/><rect x='60' y='260' width='280' height='16' rx='8' fill='#36499b'/>` +
      `<polyline points='100,230 140,200 180,215 220,170 260,185 300,140' fill='none' stroke='#ff6d2d' stroke-width='6' stroke-linecap='round'/>` +
      `<rect x='100' y='130' width='60' height='8' rx='4' fill='#67cfee'/>`,
  ),
  cena(
    "img-estande",
    "Estande de evento de tecnologia com painel iluminado e pessoas conversando",
    "#36499b",
    "#2a397a",
    `<rect x='60' y='80' width='280' height='160' rx='10' fill='#ffffff' opacity='.12'/>` +
      `<circle cx='200' cy='160' r='50' fill='none' stroke='#ff6d2d' stroke-width='14'/>` +
      `<circle cx='120' cy='300' r='22' fill='#67cfee'/><rect x='100' y='322' width='40' height='60' rx='14' fill='#67cfee'/>` +
      `<circle cx='280' cy='300' r='22' fill='#ff6d2d'/><rect x='260' y='322' width='40' height='60' rx='14' fill='#ff6d2d'/>`,
  ),
];
