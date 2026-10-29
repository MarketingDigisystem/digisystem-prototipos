/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/lib/compose/template-a.ts, template-b.ts, template-c.ts (capa, slides de cor e
 *   chamada final) e layers.ts (layerOverlay, layerDegradeMarca, layerAnelGrande, quebrarLinhas,
 *   alturaBloco, calcularYAbaixo, calcularXBlocoCentralizado, resolveLogoConfig, CANVAS_FEED,
 *   CANVAS_STORY) @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Arte" (prévia ao vivo,
 *   carrossel, Story).
 *
 * PRÉVIA AO VIVO desenhada no cliente. O real renderiza no servidor
 * (`preview-arte.server.ts` chamando os builders) com 500 ms de espera; aqui
 * a mesma geometria é refeita em SVG, na hora, a cada ajuste. Canvas do feed
 * 1080×1350 (4:5) e do Story 1080×1920 (9:16), como CANVAS_FEED/CANVAS_STORY.
 * Margens, tamanhos, larguras em caracteres, véu, anéis, kicker, botão da
 * chamada final e o destaque **palavra** são os números do template-c real.
 * Logo e fundos do Brand Kit são desenhados (o protótipo não tem os arquivos).
 * Diferenças propositais (ESPEC seção 5, bugs que não entram): o slide tem
 * cor de fundo; o botão da chamada final usa a cor mostrada na tela.
 * Nunca copiar para o app: no real a prévia continua chamando os builders.
 */
import {
  POSICAO_BLOCO_CARROSSEL,
  POSICAO_BLOCO_PADRAO,
  POSICAO_TEXTO_Y,
  POSICAO_TEXTO_Y_PADRAO,
  TAMANHOS_CARROSSEL,
  TAMANHOS_PADRAO_ARTE,
  TAMANHO_KICKER_PADRAO,
  coresBotaoChamada,
  corAnelSlide,
  corDestaqueSobre,
  fundoClaroArte,
  lerPorcentagem,
  opacidadeDegrade,
  pranchetasDaArte,
  semMarcasDestaque,
  subtituloDaArte,
  tamanhoLogoPreset,
  tituloDaArte,
  type ModeloArte,
  type TipoPrancheta,
} from "../../store/regras";
import type { Marca } from "../../store/tipos";
import type { AjustesPrancheta, ConfigArte, DegradeDirecao, FocoImagem, PosicaoLogo } from "./arte-config";
import type { Editor } from "./editor";

export type FormatoArte = "feed" | "story";

// Canvas atual. Cada desenho roda dentro de `noCanvas`, que troca e restaura (tudo é síncrono).
let W = 1080;
let H = 1350;
const MARGEM_LATERAL = 64;
/** Faixa de interface da rede no Story (SAFE_ZONE_STORY do template-c). */
const SAFE_ZONE_STORY = 250;
const ehStory = () => H > W * 1.4;

function noCanvas<T>(formato: FormatoArte, f: () => T): T {
  const antes = [W, H];
  W = 1080;
  H = formato === "story" ? 1920 : 1350;
  try {
    return f();
  } finally {
    [W, H] = antes;
  }
}

type Rect = { x: number; y: number; width: number; height: number };

export type EntradaArte = {
  modelo: ModeloArte;
  /** Título já resolvido (digitado ou sugerido; nunca a legenda). No carrossel, o da capa. */
  titulo: string;
  subtitulo: string;
  imagemUrl?: string;
  cfg: ConfigArte;
  marca: Pick<Marca, "cores" | "logos" | "fundos" | "tamanhosLogo">;
  /** Prefixo dos ids de gradiente (duas prévias na mesma página não colidem). */
  id: string;
};

// ─── Texto ────────────────────────────────────────────────────────────────

function esc(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** `quebrarLinhas` real: Enter quebra linha; o resto quebra por largura em caracteres (sem contar as marcas **). */
function quebrarLinhas(texto: string, max: number): string[] {
  const linhas: string[] = [];
  for (const bloco of (texto || "").split("\n")) {
    let atual = "";
    const palavras = bloco.split(/\s+/).filter(Boolean);
    if (!palavras.length) {
      linhas.push("");
      continue;
    }
    for (const p of palavras) {
      if (atual && semMarcasDestaque(`${atual} ${p}`).length > max) {
        linhas.push(atual);
        atual = p;
      } else {
        atual = atual ? `${atual} ${p}` : p;
      }
    }
    linhas.push(atual);
  }
  return linhas.length ? linhas : [""];
}

const alturaBloco = (texto: string, tamanho: number, largura: number, fator = 1.15) =>
  quebrarLinhas(texto, largura).length * tamanho * fator;

/** `calcularYAbaixo` real: centro do bloco de baixo, a partir do centro do de cima. */
function yAbaixo(yAcima: number, tAcima: string, tamAcima: number, largAcima: number, tAbaixo: string, tamAbaixo: number, largAbaixo: number, margem: number) {
  return yAcima + alturaBloco(tAcima, tamAcima, largAcima) / 2 + margem + alturaBloco(tAbaixo, tamAbaixo, largAbaixo) / 2;
}

/** `calcularXBlocoCentralizado` real: centraliza o bloco alinhado à esquerda pela linha mais longa. */
function xCentralizado(texto: string, tamanho: number, largura: number, fator: number): number {
  const maior = Math.min(Math.max(...quebrarLinhas(texto || " ", largura).map((l) => semMarcasDestaque(l).length)), largura);
  return Math.max(MARGEM_LATERAL, (W - maior * tamanho * fator) / 2);
}

function familiaSvg(f: string): string {
  return f.includes(",") ? f : `'${f}', Dosis, sans-serif`;
}

/** Uma linha com os trechos **marcados** na cor de destaque. Sem cor de destaque, as marcas só somem. */
function linhaRica(linha: string, emDestaque: boolean, corDestaque?: string | null): { html: string; fim: boolean } {
  let d = emDestaque;
  let html = "";
  linha.split("**").forEach((parte, i) => {
    if (i > 0) d = !d;
    if (!parte) return;
    html += d && corDestaque ? `<tspan fill="${esc(corDestaque)}">${esc(parte)}</tspan>` : esc(parte);
  });
  return { html, fim: d };
}

function blocoTexto(o: {
  texto: string;
  largura: number;
  yCentro: number;
  x: number;
  ancora: "start" | "middle";
  tamanho: number;
  familia: string;
  cor: string;
  peso?: number;
  opacidade?: number;
  espacamento?: string;
  corDestaque?: string | null;
  id: string;
}): string {
  if (!semMarcasDestaque(o.texto).trim()) return "";
  const linhas = quebrarLinhas(o.texto, o.largura);
  const lh = o.tamanho * 1.15;
  const y0 = o.yCentro - ((linhas.length - 1) * lh) / 2;
  let emDestaque = false;
  const tspans = linhas
    .map((l, i) => {
      const r = linhaRica(l, emDestaque, o.corDestaque);
      emDestaque = r.fim;
      return `<tspan x="${o.x.toFixed(1)}" y="${(y0 + i * lh + o.tamanho * 0.35).toFixed(1)}">${r.html}</tspan>`;
    })
    .join("");
  return (
    `<g id="${o.id}"><text fill="${esc(o.cor)}" font-family="${esc(familiaSvg(o.familia))}" font-size="${o.tamanho}" ` +
    `font-weight="${o.peso ?? 700}" text-anchor="${o.ancora}"` +
    (o.opacidade !== undefined ? ` opacity="${o.opacidade}"` : "") +
    (o.espacamento ? ` letter-spacing="${o.espacamento}"` : "") +
    `>${tspans}</text></g>`
  );
}

/** Selo arredondado atrás do subtítulo do Estático ("Destaque do subtítulo", linha 55). */
function seloAtras(texto: string, largura: number, yCentro: number, x: number, tamanho: number, cor: string): string {
  const linhas = quebrarLinhas(texto, largura);
  const larguraTexto = Math.max(...linhas.map((l) => semMarcasDestaque(l).length)) * tamanho * 0.57;
  const altura = linhas.length * tamanho * 1.15;
  const padX = tamanho * 0.55;
  const padY = tamanho * 0.3;
  return `<rect x="${(x - padX).toFixed(1)}" y="${(yCentro - altura / 2 - padY).toFixed(1)}" width="${(larguraTexto + padX * 2).toFixed(1)}" height="${(altura + padY * 2).toFixed(1)}" rx="${Math.min(altura / 2 + padY, 48).toFixed(1)}" fill="${esc(cor)}"/>`;
}

// ─── Camadas ──────────────────────────────────────────────────────────────

const ALINHAR_FOCO: Record<FocoImagem, string> = {
  centro: "xMidYMid",
  topo: "xMidYMin",
  base: "xMidYMax",
  esquerda: "xMinYMid",
  direita: "xMaxYMid",
};

function imagem(href: string | undefined, r: Rect = { x: 0, y: 0, width: W, height: H }, foco: FocoImagem = "centro"): string {
  if (!href) return "";
  // "Cobrir" (slice) com o foco escolhido. As imagens de exemplo são SVG 400×400 e o navegador ignora o
  // preserveAspectRatio do <image> para SVG com viewBox, então o corte vai num <svg> por fora.
  return (
    `<svg x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" viewBox="0 0 400 400" preserveAspectRatio="${ALINHAR_FOCO[foco]} slice">` +
    `<image href="${esc(href)}" width="400" height="400"/></svg>`
  );
}

/** Véu do Estático (`layerOverlay` modo gradiente, opacidade 0,45, destaque laranja embaixo). */
function veuGradiente(id: string, cor: string, destaque: string | null): string {
  const opacidade = 0.45;
  return (
    `<defs><linearGradient id="${id}-veu" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="${cor}" stop-opacity="0.06"/>` +
    `<stop offset="55%" stop-color="${cor}" stop-opacity="${(opacidade * 0.55).toFixed(3)}"/>` +
    `<stop offset="100%" stop-color="${cor}" stop-opacity="${opacidade}"/></linearGradient>` +
    (destaque
      ? `<linearGradient id="${id}-veu-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${destaque}" stop-opacity="0"/>` +
        `<stop offset="70%" stop-color="${destaque}" stop-opacity="0"/><stop offset="100%" stop-color="${destaque}" stop-opacity="0.16"/></linearGradient>`
      : "") +
    `</defs><rect width="${W}" height="${H}" fill="url(#${id}-veu)"/>` +
    (destaque ? `<rect width="${W}" height="${H}" fill="url(#${id}-veu-d)"/>` : "")
  );
}

const COORDS_DEGRADE: Record<DegradeDirecao, [string, string, string, string]> = {
  "bl-tr": ["0%", "100%", "100%", "0%"],
  "tr-bl": ["100%", "0%", "0%", "100%"],
  "tl-br": ["0%", "0%", "100%", "100%"],
  "br-tl": ["100%", "100%", "0%", "0%"],
  "top-bottom": ["0%", "0%", "0%", "100%"],
  "bottom-top": ["0%", "100%", "0%", "0%"],
  "left-right": ["0%", "0%", "100%", "0%"],
  "right-left": ["100%", "0%", "0%", "0%"],
};

function degradeMarca(id: string, cfg: ConfigArte, cores: { hex: string }[]): string {
  if (!cfg.degrade) return "";
  const [x1, y1, x2, y2] = COORDS_DEGRADE[cfg.degrade];
  const inicio = cfg.degradeCorInicio || cores[1]?.hex || "#ff6d2d";
  const fim = cfg.degradeCorFim || cores[0]?.hex || "#36499b";
  return (
    `<defs><linearGradient id="${id}-deg" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
    `<stop offset="0%" stop-color="${inicio}"/><stop offset="100%" stop-color="${fim}"/></linearGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#${id}-deg)" opacity="${opacidadeDegrade(cfg.degradeIntensidade)}"/>`
  );
}

/** Fundo do Brand Kit desenhado (o padrão do template é o "Fundo Azul" com os anéis da marca). */
function fundoDesenhado(r: Rect, hex: string): string {
  const claro = ["#ffffff", "#67cfee", "#dadada"].includes(hex.toLowerCase());
  const anel = hex.toLowerCase() === "#ff6d2d" ? "#36499b" : claro ? "#36499b" : "#67cfee";
  return (
    `<svg x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" viewBox="0 0 ${r.width} ${r.height}">` +
    `<rect width="${r.width}" height="${r.height}" fill="${hex}"/>` +
    `<circle cx="${r.width * 0.92}" cy="${r.height * 0.15}" r="${r.height * 0.75}" fill="none" stroke="${anel}" stroke-width="${r.height * 0.12}" opacity=".22"/>` +
    `<circle cx="${r.width * 0.06}" cy="${r.height * 0.95}" r="${r.height * 0.32}" fill="#ff6d2d" opacity="${hex.toLowerCase() === "#ff6d2d" ? 0 : 0.14}"/>` +
    `</svg>`
  );
}

/** Fundo do Brand Kit como imagem quadrada, para o foco da prancheta funcionar como no `layerImagem` real. */
function fundoComoImagem(hex: string, foco: FocoImagem): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${fundoDesenhado({ x: 0, y: 0, width: 400, height: 400 }, hex).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')}</svg>`;
  return imagem(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, { x: 0, y: 0, width: W, height: H }, foco);
}

/** `layerAnelGrande` real: anel decorativo com diâmetro e espessura proporcionais à largura. */
function anelGrande(cor: string, o: { cx: number; cy: number; diametroFator: number; espessuraFator?: number; opacidade?: number }): string {
  const raio = (W * o.diametroFator) / 2;
  const espessura = raio * (o.espessuraFator ?? 0.36);
  return (
    `<g id="camada-anel" opacity="${o.opacidade ?? 1}"><circle cx="${(W * o.cx).toFixed(1)}" cy="${(H * o.cy).toFixed(1)}" fill="none" ` +
    `r="${(raio - espessura / 2).toFixed(1)}" stroke="${esc(cor)}" stroke-width="${espessura.toFixed(1)}"/></g>`
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────

/** Desenho da logo da marca pela versão do Brand Kit (sem arquivo no protótipo). */
function desenharLogo(versao: string, r: Rect): string {
  const branco = /branco/.test(versao);
  const soIcone = /icon/.test(versao);
  const vertical = versao === "logo-vertical";
  const slogan = versao === "logo-slogan";
  const corTexto = branco ? "#ffffff" : "#36499b";
  const corAnel = branco ? "#ffffff" : "#ff6d2d";
  const corPonto = branco ? "#ffffff" : "#36499b";
  const icone = (cx: number, cy: number) =>
    `<circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="${corAnel}" stroke-width="12"/><circle cx="${cx}" cy="${cy}" r="11" fill="${corPonto}"/>`;
  const palavra = (x: number, y: number, ancora = "start") =>
    `<text x="${x}" y="${y}" font-family="Dosis, sans-serif" font-size="56" font-weight="800" letter-spacing="1" fill="${corTexto}" text-anchor="${ancora}">digisystem</text>`;

  let vw: number;
  let vh: number;
  let corpo: string;
  if (soIcone) {
    [vw, vh] = [90, 90];
    corpo = icone(45, 45);
  } else if (vertical) {
    [vw, vh] = [320, 190];
    corpo = icone(160, 50) + palavra(160, 160, "middle");
  } else {
    [vw, vh] = [380, slogan ? 128 : 96];
    corpo =
      icone(45, 48) +
      palavra(96, 68) +
      (slogan
        ? `<text x="98" y="114" font-family="'Open Sans', sans-serif" font-size="22" font-weight="600" fill="${branco ? "#ffffff" : "#ff6d2d"}">Parceria que transforma</text>`
        : "");
  }
  // preserveAspectRatio "meet", como o <image> do layerLogo real.
  const escala = Math.min(r.width / vw, r.height / vh);
  const tx = r.x + (r.width - vw * escala) / 2;
  const ty = r.y + (r.height - vh * escala) / 2;
  return `<g id="camada-logo" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${escala.toFixed(4)})">${corpo}</g>`;
}

type LogoCfg = Pick<ConfigArte, "logoPosicao" | "logoXPct" | "logoYPct" | "logoTamanho" | "logoLarguraPct" | "logoAlturaPct">;

/** `resolveLogoConfig` real: avançado (X/Y e largura/altura em %) vence o Básico (posição e P/M/G). */
function retanguloLogo(cfg: LogoCfg, tamanhos: Marca["tamanhosLogo"], padrao: Rect): Rect {
  const larguraPct = lerPorcentagem(cfg.logoLarguraPct) ?? (cfg.logoTamanho ? tamanhoLogoPreset(tamanhos, cfg.logoTamanho) : undefined);
  const alturaPct = lerPorcentagem(cfg.logoAlturaPct) ?? (cfg.logoTamanho ? tamanhoLogoPreset(tamanhos, cfg.logoTamanho) : undefined);
  const width = larguraPct !== undefined ? (W * larguraPct) / 100 : padrao.width;
  const height = alturaPct !== undefined ? (H * alturaPct) / 100 : padrao.height;
  const xPct = lerPorcentagem(cfg.logoXPct);
  const yPct = lerPorcentagem(cfg.logoYPct);
  if (xPct !== undefined || yPct !== undefined) {
    return { x: xPct !== undefined ? (W * xPct) / 100 : padrao.x, y: yPct !== undefined ? (H * yPct) / 100 : padrao.y, width, height };
  }
  if (cfg.logoPosicao) {
    const mx = Math.max(padrao.x, 0) || 48;
    const my = Math.max(padrao.y, 0) || 48;
    const mapa: Record<PosicaoLogo, { x: number; y: number }> = {
      "top-left": { x: mx, y: my },
      "top-center": { x: (W - width) / 2, y: my },
      "top-right": { x: W - width - mx, y: my },
      "bottom-left": { x: mx, y: H - height - my },
      "bottom-center": { x: (W - width) / 2, y: H - height - my },
      "bottom-right": { x: W - width - mx, y: H - height - my },
    };
    return { ...mapa[cfg.logoPosicao], width, height };
  }
  return { ...padrao, width, height };
}

/** Posição atual do logo em %, ponto de partida do D-pad (linha 49). */
export function posicaoLogoPct(e: Pick<EntradaArte, "modelo" | "cfg" | "marca">): { xPct: number; yPct: number } {
  return noCanvas("feed", () => {
    const r = retanguloLogo(e.cfg, e.marca.tamanhosLogo, logoPadrao(e.modelo, e.cfg));
    return { xPct: Math.round((r.x / W) * 100), yPct: Math.round((r.y / H) * 100) };
  });
}

/** No Story o logo desce para fora da faixa da rede (SAFE_ZONE_STORY - 40, como o template-c). */
const yLogoTopo = (padrao: number) => (ehStory() ? SAFE_ZONE_STORY - 40 : padrao);

function logoPadrao(modelo: ModeloArte, cfg: Pick<ConfigArte, "logoPosicao">): Rect {
  if (modelo === "A") return { x: MARGEM_LATERAL, y: yLogoTopo(48), width: 300, height: 300 };
  if (modelo === "B") return cfg.logoPosicao ? { x: 48, y: yLogoTopo(40), width: 600, height: 180 } : { x: (W - 600) / 2, y: yLogoTopo(40), width: 600, height: 180 };
  return cfg.logoPosicao ? { x: 48, y: yLogoTopo(56), width: 240, height: 90 } : { x: (W - 240) / 2, y: yLogoTopo(56), width: 240, height: 90 };
}

/** Logo de uma prancheta do carrossel: a própria dela, se ligada, senão a do carrossel inteiro. */
function logoDaPrancheta(e: EntradaArte, aj: AjustesPrancheta, fundoEscuro: boolean, padrao: Rect, versaoPadrao?: string): string {
  const { cfg, marca } = e;
  const propria = aj.logoPropria;
  if (propria ? aj.logoOculto : cfg.logoOculto) return "";
  const temBranco = marca.logos.some((l) => l.id === "logo-branco");
  // `logoParaFundo` real: em fundo escuro, sem escolha, entra a versão branca.
  const automatica = versaoPadrao ?? (fundoEscuro && temBranco ? "logo-branco" : "logo-principal");
  const versao = (propria ? aj.logoId : null) ?? cfg.logoId ?? automatica;
  const logoCfg: LogoCfg = propria
    ? { logoPosicao: aj.logoPosicao, logoTamanho: aj.logoTamanho, logoXPct: "", logoYPct: "", logoLarguraPct: "", logoAlturaPct: "" }
    : cfg;
  const base = logoCfg.logoPosicao ? { ...padrao, x: 48 } : padrao;
  return desenharLogo(versao, retanguloLogo(logoCfg, marca.tamanhosLogo, base));
}

// ─── Estático e Estilo Blog ───────────────────────────────────────────────

/** Estático (template-a): foto inteira, véu da marca e o texto alinhado à esquerda. */
function estatico(e: EntradaArte): string {
  const { cfg, marca } = e;
  const principal = marca.cores[0]?.hex ?? "#36499b";
  const destaque = marca.cores[1]?.hex ?? null;
  const tamT = cfg.tamanhoTitulo ?? TAMANHOS_PADRAO_ARTE.A.titulo;
  const tamS = cfg.tamanhoSubtitulo ?? TAMANHOS_PADRAO_ARTE.A.subtitulo;
  const largPct = lerPorcentagem(cfg.textoLarguraPct);
  const largT = largPct !== undefined ? Math.round(((largPct / 100) * W) / (75 * 0.75)) : 22;
  const largS = largPct !== undefined ? Math.round(((largPct / 100) * W) / (45 * 0.57)) : 22;
  const yPct = lerPorcentagem(cfg.textoYPct);
  const yBloco = yPct !== undefined ? yPct / 100 : cfg.posicaoTexto ? POSICAO_TEXTO_Y[cfg.posicaoTexto] : POSICAO_TEXTO_Y_PADRAO;
  const xPct = lerPorcentagem(cfg.textoXPct);
  const x = xPct !== undefined ? (W * xPct) / 100 : MARGEM_LATERAL;
  const fonte = cfg.fonte || "Dosis";
  const sub = e.subtitulo;

  let yTitulo: number;
  let ySub = 0;
  if (sub.trim() && cfg.tituloAcima) {
    yTitulo = H * yBloco;
    ySub = yAbaixo(yTitulo, e.titulo, tamT, largT, sub, tamS, largS, 48);
  } else if (sub.trim()) {
    ySub = H * yBloco;
    yTitulo = yAbaixo(ySub, sub, tamS, largS, e.titulo, tamT, largT, 48);
  } else {
    yTitulo = H * yBloco;
  }

  const partes = [
    `<rect width="${W}" height="${H}" fill="${principal}"/>`,
    imagem(e.imagemUrl),
    veuGradiente(e.id, principal, destaque),
    degradeMarca(e.id, cfg, marca.cores),
    desenharLogo(cfg.logoId ?? "logo-principal", retanguloLogo(cfg, marca.tamanhosLogo, logoPadrao("A", cfg))),
  ];
  if (sub.trim()) {
    const corSelo = cfg.corSelo || destaque || principal;
    let corSub = cfg.corSubtitulo || "#ffffff";
    if (cfg.destaqueSubtitulo) {
      partes.push(seloAtras(sub, largS, ySub, x, tamS, corSelo));
      // Nos padrões do real, selo e subtítulo saem os dois laranja e o texto some. Aqui o texto vira branco.
      if (corSub.toLowerCase() === corSelo.toLowerCase()) corSub = "#ffffff";
    }
    partes.push(blocoTexto({ texto: sub, largura: largS, yCentro: ySub, x, ancora: "start", tamanho: tamS, familia: fonte, cor: corSub, id: "camada-subtitulo" }));
  }
  partes.push(blocoTexto({ texto: e.titulo, largura: largT, yCentro: yTitulo, x, ancora: "start", tamanho: tamT, familia: fonte, cor: cfg.corTitulo || "#ffffff", peso: 800, id: "camada-titulo" }));
  return partes.join("");
}

/** Estilo Blog (template-b): banda com o logo, foto no meio e banda com título e subtítulo. */
function estiloBlog(e: EntradaArte): string {
  const { cfg, marca } = e;
  const principal = marca.cores[0]?.hex ?? "#36499b";
  const tamT = cfg.tamanhoTitulo ?? TAMANHOS_PADRAO_ARTE.B.titulo;
  const tamS = cfg.tamanhoSubtitulo ?? TAMANHOS_PADRAO_ARTE.B.subtitulo;
  const largT = 28;
  const largS = 34;
  const sub = subtituloDaArte("B", e.subtitulo);
  const fonte = cfg.fonte || "Dosis";

  const altT = alturaBloco(e.titulo, tamT, largT);
  const altS = sub ? alturaBloco(sub, tamS, largS, 1.3) : 0;
  const necessaria = 40 + altT + (sub ? 28 + altS : 0) + 50;
  const banda = Math.max(H * 0.24, necessaria, 220);
  const fundo = cfg.fundoId ? marca.fundos.find((f) => f.id === cfg.fundoId) : undefined;
  const hexFundo = fundo?.hex ?? principal;

  const yTitulo = H - banda + 40 + altT / 2;
  const partes = [
    `<rect width="${W}" height="${H}" fill="${principal}"/>`,
    fundoDesenhado({ x: 0, y: 0, width: W, height: banda }, hexFundo),
    fundoDesenhado({ x: 0, y: H - banda, width: W, height: banda }, hexFundo),
    imagem(e.imagemUrl, { x: 0, y: banda, width: W, height: H - 2 * banda }),
    degradeMarca(e.id, cfg, marca.cores),
    desenharLogo(cfg.logoId ?? "logo-principal", retanguloLogo(cfg, marca.tamanhosLogo, logoPadrao("B", cfg))),
    blocoTexto({ texto: e.titulo, largura: largT, yCentro: yTitulo, x: W / 2, ancora: "middle", tamanho: tamT, familia: fonte, cor: cfg.corTitulo || "#ffffff", peso: 800, id: "camada-titulo" }),
  ];
  if (sub) {
    const ySub = yAbaixo(yTitulo, e.titulo, tamT, largT, sub, tamS, largS, 28);
    partes.push(blocoTexto({ texto: sub, largura: largS, yCentro: ySub, x: W / 2, ancora: "middle", tamanho: tamS, familia: fonte, cor: cfg.corSubtitulo || "#ff6d2d", peso: 600, id: "camada-subtitulo" }));
  }
  return partes.join("");
}

// ─── Carrossel (template-c) ───────────────────────────────────────────────

/** `resolverBlocoTexto` real: X/Y/largura em % (vazio = padrão da prancheta); posição do Básico em % da altura. */
function blocoDaPrancheta(
  aj: AjustesPrancheta,
  tipo: TipoPrancheta,
  padrao: { x: number; larguraTitulo: number; larguraSubtitulo: number; tamanhoTitulo: number; tamanhoSubtitulo: number },
) {
  const xPct = lerPorcentagem(aj.xPct);
  const yPct = lerPorcentagem(aj.yPct) ?? (aj.posicao ? POSICAO_BLOCO_CARROSSEL[aj.posicao] : POSICAO_BLOCO_PADRAO[tipo]);
  const largPct = lerPorcentagem(aj.larguraPct);
  return {
    x: xPct !== undefined ? (W * xPct) / 100 : padrao.x,
    xManual: xPct !== undefined,
    y: (H * yPct) / 100,
    larguraTitulo: largPct !== undefined ? Math.round(((largPct / 100) * W) / (padrao.tamanhoTitulo * 0.75)) : padrao.larguraTitulo,
    larguraSubtitulo: largPct !== undefined ? Math.round(((largPct / 100) * W) / (padrao.tamanhoSubtitulo * 0.57)) : padrao.larguraSubtitulo,
  };
}

const FONTE_APOIO = "'Open Sans', sans-serif";

/** Etiqueta acima do título (o "kicker" do template-c: negrito, espaçado, até 40 letras por linha). */
function kicker(aj: AjustesPrancheta, corPadrao: string, y: number, x: number): string {
  return blocoTexto({
    texto: aj.kicker,
    largura: 40,
    yCentro: y,
    x,
    ancora: "start",
    tamanho: aj.kickerTamanho ?? TAMANHO_KICKER_PADRAO,
    familia: aj.kickerFonte || FONTE_APOIO,
    cor: aj.kickerCor || corPadrao,
    peso: 700,
    espacamento: "0.12em",
    id: "camada-kicker",
  });
}

/** Kicker (se houver) e, abaixo dele, título e subtítulo na mesma margem esquerda. */
function blocoTituloSub(o: {
  aj: AjustesPrancheta;
  titulo: string;
  subtitulo: string;
  x: number;
  xKicker?: number;
  y: number;
  tamT: number;
  tamS: number;
  largT: number;
  largS: number;
  corTitulo: string;
  corSub: string;
  corKicker: string;
  corDestaque: string | null;
  margemSub: number;
  fonteTitulo: string;
  pesoSub?: number;
}): string[] {
  const partes: string[] = [];
  let yTitulo = o.y;
  if (o.aj.kicker.trim()) {
    const tamK = o.aj.kickerTamanho ?? TAMANHO_KICKER_PADRAO;
    yTitulo = yAbaixo(o.y, o.aj.kicker, tamK, 40, o.titulo, o.tamT, o.largT, 24);
    partes.push(kicker(o.aj, o.corKicker, o.y, o.xKicker ?? o.x));
  }
  partes.push(
    blocoTexto({ texto: o.titulo, largura: o.largT, yCentro: yTitulo, x: o.x, ancora: "start", tamanho: o.tamT, familia: o.fonteTitulo, cor: o.corTitulo, peso: 800, corDestaque: o.corDestaque, id: "camada-titulo" }),
  );
  if (semMarcasDestaque(o.subtitulo).trim()) {
    const ySub = yAbaixo(yTitulo, o.titulo, o.tamT, o.largT, o.subtitulo, o.tamS, o.largS, o.margemSub);
    partes.push(
      blocoTexto({
        texto: o.subtitulo,
        largura: o.largS,
        yCentro: ySub,
        x: o.x,
        ancora: "start",
        tamanho: o.tamS,
        familia: o.aj.fonteTitulo || FONTE_APOIO,
        cor: o.corSub,
        peso: o.pesoSub ?? 400,
        opacidade: 0.95,
        corDestaque: o.corDestaque,
        id: "camada-subtitulo",
      }),
    );
  }
  return partes;
}

/** Capa do Carrossel: foto com foco, véu liso de 40%, logo centralizado, kicker e o bloco de texto. Sem anel. */
function capaCarrossel(e: EntradaArte): string {
  const { cfg, marca } = e;
  const aj = cfg.carrossel.capa.ajustes;
  const principal = marca.cores[0]?.hex ?? "#36499b";
  const tamT = aj.tamanhoTitulo ?? TAMANHOS_CARROSSEL.capa.titulo;
  const tamS = aj.tamanhoSubtitulo ?? TAMANHOS_CARROSSEL.capa.subtitulo;
  const bloco = blocoDaPrancheta(aj, "capa", { x: xCentralizado(e.titulo, tamT, 18, 0.75), larguraTitulo: 18, larguraSubtitulo: 34, tamanhoTitulo: tamT, tamanhoSubtitulo: tamS });
  const corTitulo = aj.corTitulo || "#ffffff";
  return [
    `<rect width="${W}" height="${H}" fill="${principal}"/>`,
    imagem(e.imagemUrl, undefined, aj.foco ?? "centro"),
    `<rect width="${W}" height="${H}" fill="${principal}" opacity="0.4"/>`,
    degradeMarca(e.id, cfg, marca.cores),
    logoDaPrancheta(e, aj, true, logoPadrao("C", aj.logoPropria ? aj : cfg)),
    // O real passa destaque nulo na capa: as marcas ** só somem.
    ...blocoTituloSub({
      aj,
      titulo: e.titulo,
      subtitulo: e.subtitulo,
      x: bloco.x,
      y: bloco.y,
      tamT,
      tamS,
      largT: bloco.larguraTitulo,
      largS: bloco.larguraSubtitulo,
      corTitulo,
      corSub: aj.corSubtitulo || "#ffffff",
      corKicker: "#ffffff",
      corDestaque: null,
      margemSub: 30,
      fonteTitulo: aj.fonteTitulo || "Dosis",
    }),
  ].join("");
}

/** Slide de cor (slideCor do template-c): cor ou fundo do Brand Kit, anel por contraste, texto automático. */
function slideCor(e: EntradaArte, slideId: string): string {
  const { cfg, marca } = e;
  const slide = cfg.carrossel.slides.find((s) => s.id === slideId);
  if (!slide) return capaCarrossel(e);
  const aj = slide.ajustes;
  const principal = marca.cores[0]?.hex ?? "#36499b";
  const fundoBk = slide.fundo.tipo === "brandkit" ? marca.fundos.find((f) => f.id === (slide.fundo as { fundoId: string }).fundoId) : undefined;
  const corFundo = slide.fundo.tipo === "cor" ? slide.fundo.hex : fundoBk?.hex ?? principal;
  const claro = fundoClaroArte(corFundo);
  const corTitulo = aj.corTitulo || (claro ? principal : "#ffffff");
  const tamT = aj.tamanhoTitulo ?? TAMANHOS_CARROSSEL.slide.titulo;
  const tamS = aj.tamanhoSubtitulo ?? TAMANHOS_CARROSSEL.slide.subtitulo;
  const bloco = blocoDaPrancheta(aj, "slide", { x: xCentralizado(slide.titulo, tamT, 22, 0.75), larguraTitulo: 22, larguraSubtitulo: 32, tamanhoTitulo: tamT, tamanhoSubtitulo: tamS });

  // Anel do `anelSlideCor`: canto inferior direito no fundo principal; concêntrico cortado pela base nos demais.
  const anel =
    fundoBk || !aj.mostrarAnel
      ? ""
      : corFundo.toLowerCase() === principal.toLowerCase()
        ? anelGrande(corAnelSlide(corFundo, marca.cores), { cx: 0.9, cy: 0.95, diametroFator: 0.42 })
        : anelGrande(corAnelSlide(corFundo, marca.cores), { cx: 0.5, cy: 1.3, diametroFator: 1.45, espessuraFator: 0.2 });

  return [
    `<rect width="${W}" height="${H}" fill="${esc(corFundo)}"/>`,
    fundoBk ? fundoComoImagem(fundoBk.hex, aj.foco ?? "centro") : "",
    degradeMarca(e.id, cfg, marca.cores),
    anel,
    logoDaPrancheta(e, aj, Boolean(fundoBk) || !claro, logoPadrao("C", aj.logoPropria ? aj : cfg)),
    ...blocoTituloSub({
      aj,
      titulo: slide.titulo,
      subtitulo: slide.subtitulo,
      x: bloco.x,
      y: bloco.y,
      tamT,
      tamS,
      largT: bloco.larguraTitulo,
      largS: bloco.larguraSubtitulo,
      corTitulo,
      corSub: aj.corSubtitulo || corTitulo,
      corKicker: corTitulo,
      corDestaque: corDestaqueSobre(corFundo, marca.cores),
      margemSub: 40,
      fonteTitulo: aj.fonteTitulo || "Dosis",
    }),
  ].join("");
}

/** Chamada final (slideCta do template-c): fundo claro, título na principal, botão e logo colorida embaixo. */
function chamadaFinal(e: EntradaArte): string {
  const { cfg, marca } = e;
  const cta = cfg.carrossel.cta;
  const aj = cta.ajustes;
  const principal = marca.cores[0]?.hex ?? "#36499b";
  const destaque = marca.cores[1]?.hex ?? principal;
  const fundoBk = cta.fundoId ? marca.fundos.find((f) => f.id === cta.fundoId) : undefined;
  const corFundo = "#f2f2f0";
  const corTitulo = aj.corTitulo || principal;
  const tamT = aj.tamanhoTitulo ?? TAMANHOS_CARROSSEL.cta.titulo;
  const bloco = blocoDaPrancheta(aj, "cta", { x: xCentralizado(cta.titulo, tamT, 30, 0.61), larguraTitulo: 30, larguraSubtitulo: 30, tamanhoTitulo: tamT, tamanhoSubtitulo: tamT });

  const partes = [
    `<rect width="${W}" height="${H}" fill="${corFundo}"/>`,
    fundoBk ? fundoComoImagem(fundoBk.hex, aj.foco ?? "centro") : "",
    degradeMarca(e.id, cfg, marca.cores),
    fundoBk || !aj.mostrarAnel ? "" : anelGrande(destaque, { cx: 0.9, cy: 0.95, diametroFator: 0.42, opacidade: 0.9 }),
  ];

  let yTitulo = bloco.y;
  if (aj.kicker.trim()) {
    const tamK = aj.kickerTamanho ?? TAMANHO_KICKER_PADRAO;
    yTitulo = yAbaixo(bloco.y, aj.kicker, tamK, 40, cta.titulo, tamT, bloco.larguraTitulo, 24);
    partes.push(kicker(aj, corTitulo, bloco.y, bloco.xManual ? bloco.x : xCentralizado(aj.kicker, tamK, 40, 0.75)));
  }
  partes.push(
    blocoTexto({
      texto: cta.titulo,
      largura: bloco.larguraTitulo,
      yCentro: yTitulo,
      x: bloco.x,
      ancora: "start",
      tamanho: tamT,
      familia: aj.fonteTitulo || FONTE_APOIO,
      cor: corTitulo,
      peso: 700,
      corDestaque: corDestaqueSobre(corFundo, marca.cores),
      id: "camada-titulo",
    }),
  );

  if (cta.botaoTexto.trim()) {
    // Botão do template-c: 22 px, 34 de folga lateral, 16 vertical, cantos inteiros, 110 px abaixo do título.
    const { fundo, texto } = coresBotaoChamada(marca.cores, cta.botaoCor, cta.botaoCorTexto);
    const tamanho = 22;
    const boxW = cta.botaoTexto.length * tamanho * 0.62 + 68;
    const boxH = tamanho + 32;
    const yBotao = yTitulo + 110;
    partes.push(
      `<g id="camada-botao"><rect fill="${esc(fundo)}" height="${boxH}" rx="${boxH / 2}" width="${boxW.toFixed(1)}" x="${((W - boxW) / 2).toFixed(1)}" y="${(yBotao - boxH / 2).toFixed(1)}"/>` +
        `<text fill="${esc(texto)}" font-family="${FONTE_APOIO}" font-size="${tamanho}" font-weight="700" text-anchor="middle" x="${W / 2}" y="${(yBotao + tamanho * 0.34).toFixed(1)}">${esc(cta.botaoTexto)}</text></g>`,
    );
  }

  const larguraLogo = 220;
  const alturaLogo = 84;
  const yLogo = H - alturaLogo - (ehStory() ? SAFE_ZONE_STORY : 90);
  const padraoLogo = { x: (W - larguraLogo) / 2, y: yLogo, width: larguraLogo, height: alturaLogo };
  // Na chamada final entra a logo colorida (fundo claro).
  partes.push(logoDaPrancheta(e, aj, Boolean(fundoBk), padraoLogo, fundoBk ? undefined : "logo-principal"));
  return partes.join("");
}

// ─── Saída ────────────────────────────────────────────────────────────────

function corpoDa(e: EntradaArte, prancheta: string): string {
  if (e.modelo === "A") return estatico(e);
  if (e.modelo === "B") return estiloBlog(e);
  if (prancheta === "cta") return chamadaFinal(e);
  if (prancheta === "capa") return capaCarrossel(e);
  return slideCor(e, prancheta);
}

function envolver(corpo: string, fixo: boolean): string {
  const tam = fixo ? `width="${W}" height="${H}"` : `width="100%" height="100%"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" ` +
    `${tam} preserveAspectRatio="xMidYMid meet">${corpo}</svg>`
  );
}

/**
 * SVG de uma prancheta (no Estático e no Blog, a arte toda). No carrossel,
 * `prancheta` é "capa", "cta" ou o id do slide; sem ela, a que está em edição.
 */
export function desenharArte(e: EntradaArte, opcoes: { prancheta?: string; formato?: FormatoArte } = {}): string {
  return noCanvas(opcoes.formato ?? "feed", () => envolver(corpoDa(e, opcoes.prancheta ?? e.cfg.carrossel.editando), false));
}

/** Pranchetas que vão para a arte final, na ordem (capa, slides com título, chamada com título). */
export function pranchetasFinais(e: EntradaArte): string[] {
  return e.modelo === "C" ? pranchetasDaArte(e.cfg.carrossel) : ["arte"];
}

/** Arte final com largura e altura fixas, uma por prancheta (o `svg_urls[]` do real). O mesmo desenho da prévia. */
export function arteFinalSvgs(e: EntradaArte, formato: FormatoArte = "feed"): string[] {
  return noCanvas(formato, () => pranchetasFinais(e).map((p) => envolver(corpoDa(e, p), true)));
}

/** Entrada da prévia a partir do editor do Estúdio. */
export function entradaDoEditor(ed: Editor, marca: EntradaArte["marca"], id: string): EntradaArte {
  return {
    modelo: ed.template,
    titulo: tituloDaArte(ed.tituloArte, ed.tituloSugerido),
    subtitulo: ed.subtituloArte,
    imagemUrl: ed.imagemUrl,
    cfg: ed.arte,
    marca,
    id,
  };
}
