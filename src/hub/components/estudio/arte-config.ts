/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/ArteStep.tsx (estado dos cards Estilo, Logo, Texto, Fundo e
 *   Conteúdo; DEGRADE_GRID, LOGO_POSICOES), src/lib/estudio-fonts.ts (ESTUDIO_FONTES)
 *   @ commit 4fcf254 / leitura 2026-10-08.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: prototipos/ESPEC-criar-post.md, seção 2 "Arte" (D5).
 *
 * Configuração da arte do Estúdio: tudo o que os controles de Básico e
 * Avançado mudam, inclusive o carrossel por prancheta (item 5.5c; o real
 * guarda isso em ~30 useState soltos no ArteStep, gerado de template-c.ts). Pela D5 ela será salva no post (coluna jsonb nova no real);
 * no protótipo vive no editor e o item 5.5d a grava no store.
 * Sem React: só tipos, valores padrão e listas dos controles.
 */
import type { PosicaoTexto } from "../../store/regras";

export type DegradeDirecao = "tl-br" | "top-bottom" | "tr-bl" | "left-right" | "right-left" | "bl-tr" | "bottom-top" | "br-tl";
export type PosicaoLogo = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export type ConfigArte = {
  /** Qual grupo de controles está à vista (par de pílulas Básico | Avançado). */
  ajustes: "basico" | "avancado";

  // Texto (só Estático: ordem, posição e selo)
  tituloAcima: boolean;
  posicaoTexto: PosicaoTexto | null;
  textoXPct: string;
  textoYPct: string;
  textoLarguraPct: string;
  destaqueSubtitulo: boolean;
  corSelo: string;

  // Estilo (Estático e Blog)
  /** "" = Padrão do template (Dosis). Vale para título e subtítulo, que é o que o compositor desenha. */
  fonte: string;
  corTitulo: string;
  corSubtitulo: string;
  tamanhoTitulo?: number;
  tamanhoSubtitulo?: number;
  degrade: DegradeDirecao | null;
  degradeIntensidade: number;
  /** "" = usar a cor da marca. */
  degradeCorInicio: string;
  degradeCorFim: string;

  // Logo
  /** null = Logo principal do Brand Kit. */
  logoId: string | null;
  /** Só no carrossel: "Exibir logo no carrossel" desligado. */
  logoOculto: boolean;
  logoPosicao: PosicaoLogo | null;
  logoXPct: string;
  logoYPct: string;
  logoTamanho: "P" | "M" | "G" | null;
  logoLarguraPct: string;
  logoAlturaPct: string;

  // Fundo (só Estilo Blog). null = Fundo padrão do template.
  fundoId: string | null;

  /** Carrossel por prancheta (item 5.5c). O título e o subtítulo da capa são os do "Texto da arte". */
  carrossel: ConfigCarrossel;
};

export type FocoImagem = "centro" | "topo" | "base" | "esquerda" | "direita";

/** Ajustes de uma prancheta do carrossel (`PranchetaAjustes` do real). Vazio = automático. */
export type AjustesPrancheta = {
  /** Etiqueta acima do título (o "kicker" do real). */
  kicker: string;
  kickerFonte: string;
  kickerCor: string;
  kickerTamanho?: number;
  fonteTitulo: string;
  /** "" = automático (branco no escuro, cor principal no claro). */
  corTitulo: string;
  corSubtitulo: string;
  tamanhoTitulo?: number;
  tamanhoSubtitulo?: number;
  posicao: "topo" | "centro" | "rodape" | null;
  xPct: string;
  yPct: string;
  larguraPct: string;
  /** Só quando a prancheta tem foto ou fundo do Brand Kit. */
  foco: FocoImagem | null;
  /** A capa nunca tem anel. */
  mostrarAnel: boolean;
  /** "Usar logo própria nesta prancheta": versão, posição e tamanho só dela. */
  logoPropria: boolean;
  logoId: string | null;
  logoOculto: boolean;
  logoPosicao: PosicaoLogo | null;
  logoTamanho: "P" | "M" | "G" | null;
};

/** Fundo do slide: cor sólida (o real não deixa escolher, ESPEC ponto 11) ou imagem de fundo do Brand Kit. */
export type FundoSlide = { tipo: "cor"; hex: string } | { tipo: "brandkit"; fundoId: string };

export type SlideCarrossel = { id: string; titulo: string; subtitulo: string; fundo: FundoSlide; ajustes: AjustesPrancheta };

export type ChamadaFinal = {
  titulo: string;
  botaoTexto: string;
  /** "" = laranja da marca com texto na principal, que é o que o compositor desenha. */
  botaoCor: string;
  botaoCorTexto: string;
  /** null = fundo claro do template (#f2f2f0). */
  fundoId: string | null;
  ajustes: AjustesPrancheta;
};

export type ConfigCarrossel = {
  capa: { ajustes: AjustesPrancheta };
  slides: SlideCarrossel[];
  cta: ChamadaFinal;
  /** Prancheta em edição: "capa", "cta" ou o id de um slide. A prévia segue esta. */
  editando: string;
};

export function ajustesPranchetaIniciais(): AjustesPrancheta {
  return {
    kicker: "",
    kickerFonte: "",
    kickerCor: "",
    fonteTitulo: "",
    corTitulo: "",
    corSubtitulo: "",
    posicao: null,
    xPct: "",
    yPct: "",
    larguraPct: "",
    foco: null,
    mostrarAnel: true,
    logoPropria: false,
    logoId: null,
    logoOculto: false,
    logoPosicao: null,
    logoTamanho: null,
  };
}

let seqSlide = 0;
/** Slide novo: cor principal da marca, sem texto (o real nasce com 1 slide assim). */
export function novoSlide(corPrincipal: string, p: Partial<Omit<SlideCarrossel, "id">> = {}): SlideCarrossel {
  seqSlide += 1;
  return {
    id: `slide-${Date.now().toString(36)}-${seqSlide}`,
    titulo: "",
    subtitulo: "",
    fundo: { tipo: "cor", hex: corPrincipal },
    ajustes: ajustesPranchetaIniciais(),
    ...p,
  };
}

export function carrosselInicial(corPrincipal: string): ConfigCarrossel {
  return {
    capa: { ajustes: { ...ajustesPranchetaIniciais(), mostrarAnel: false } },
    slides: [novoSlide(corPrincipal)],
    cta: { titulo: "", botaoTexto: "", botaoCor: "", botaoCorTexto: "", fundoId: null, ajustes: ajustesPranchetaIniciais() },
    editando: "capa",
  };
}

/** Ordem das pranchetas na tira: capa, slides e a chamada final. */
export function idsPranchetas(c: ConfigCarrossel): string[] {
  return ["capa", ...c.slides.map((s) => s.id), "cta"];
}

/** Tipo da prancheta pelo id da tira. */
export function tipoPrancheta(id: string): "capa" | "slide" | "cta" {
  return id === "capa" ? "capa" : id === "cta" ? "cta" : "slide";
}

/** "Capa", "Slide 2", "Chamada final". */
export function rotuloPrancheta(c: ConfigCarrossel, id: string): string {
  if (id === "capa") return "Capa";
  if (id === "cta") return "Chamada final";
  const i = c.slides.findIndex((s) => s.id === id);
  return i >= 0 ? `Slide ${i + 1}` : "Capa";
}

export function ajustesDe(c: ConfigCarrossel, id: string): AjustesPrancheta {
  if (id === "capa") return c.capa.ajustes;
  if (id === "cta") return c.cta.ajustes;
  return c.slides.find((s) => s.id === id)?.ajustes ?? c.capa.ajustes;
}

/** Troca os ajustes de uma prancheta. */
export function comAjustes(c: ConfigCarrossel, id: string, p: Partial<AjustesPrancheta>): ConfigCarrossel {
  if (id === "capa") return { ...c, capa: { ajustes: { ...c.capa.ajustes, ...p } } };
  if (id === "cta") return { ...c, cta: { ...c.cta, ajustes: { ...c.cta.ajustes, ...p } } };
  return { ...c, slides: c.slides.map((s) => (s.id === id ? { ...s, ajustes: { ...s.ajustes, ...p } } : s)) };
}

export function comSlide(c: ConfigCarrossel, id: string, p: Partial<Omit<SlideCarrossel, "id">>): ConfigCarrossel {
  return { ...c, slides: c.slides.map((s) => (s.id === id ? { ...s, ...p } : s)) };
}

export function comChamada(c: ConfigCarrossel, p: Partial<ChamadaFinal>): ConfigCarrossel {
  return { ...c, cta: { ...c.cta, ...p } };
}

/** "+ Novo slide": entra antes da chamada final e já fica em edição. */
export function adicionarSlide(c: ConfigCarrossel, corPrincipal: string): ConfigCarrossel {
  const s = novoSlide(corPrincipal);
  return { ...c, slides: [...c.slides, s], editando: s.id };
}

/** Excluir um slide; se era o que estava em edição, a edição volta para a capa. */
export function excluirSlide(c: ConfigCarrossel, id: string): ConfigCarrossel {
  return { ...c, slides: c.slides.filter((s) => s.id !== id), editando: c.editando === id ? "capa" : c.editando };
}

/** Foco da imagem (`FOCOS_IMAGEM` do real). */
export const FOCOS_IMAGEM: { valor: FocoImagem; label: string }[] = [
  { valor: "centro", label: "Centro" },
  { valor: "topo", label: "Topo" },
  { valor: "base", label: "Base" },
  { valor: "esquerda", label: "Esquerda" },
  { valor: "direita", label: "Direita" },
];

/** Padrões do real: título e subtítulo na 2ª cor da marca (laranja), sem degradê, logo automático. */
export function configArteInicial(cores: { hex: string }[]): ConfigArte {
  const destaque = cores[1]?.hex ?? "#ff6d2d";
  return {
    ajustes: "basico",
    tituloAcima: true,
    posicaoTexto: null,
    textoXPct: "",
    textoYPct: "",
    textoLarguraPct: "",
    destaqueSubtitulo: false,
    corSelo: destaque,
    fonte: "",
    corTitulo: destaque,
    corSubtitulo: destaque,
    degrade: null,
    degradeIntensidade: 45,
    degradeCorInicio: "",
    degradeCorFim: "",
    logoId: null,
    logoOculto: false,
    logoPosicao: null,
    logoXPct: "",
    logoYPct: "",
    logoTamanho: null,
    logoLarguraPct: "",
    logoAlturaPct: "",
    fundoId: null,
    carrossel: carrosselInicial(cores[0]?.hex ?? "#36499b"),
  };
}

/** As 16 fontes de título do Estúdio real (`ESTUDIO_FONTES`). */
export const FONTES_ESTUDIO = [
  "Dosis",
  "Sora",
  "Inter",
  "Manrope",
  "DM Sans",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "Outfit",
  "Figtree",
  "Urbanist",
  "Work Sans",
  "Poppins",
  "Playfair Display",
  "Bebas Neue",
  "Archivo Black",
  "Syne",
];

/** Carrega as fontes só enquanto o Estúdio está aberto (como `use-estudio-fonts.ts`). */
export const HREF_FONTES_ESTUDIO =
  "https://fonts.googleapis.com/css2?family=Sora:wght@300..800&family=Inter:wght@300..800&family=Manrope:wght@300..800" +
  "&family=DM+Sans:wght@300..800&family=Plus+Jakarta+Sans:wght@300..800&family=Space+Grotesk:wght@300..700" +
  "&family=Outfit:wght@300..800&family=Figtree:wght@300..800&family=Urbanist:wght@300..800&family=Work+Sans:wght@300..800" +
  "&family=Poppins:wght@400;700;800&family=Playfair+Display:wght@400..800&family=Bebas+Neue&family=Archivo+Black" +
  "&family=Syne:wght@400..800&display=swap";

/** Bússola 3×3 do degradê; o centro é "sem degradê" (linha 45). */
export const BUSSOLA_DEGRADE: ({ valor: DegradeDirecao; icone: string; label: string } | null)[] = [
  { valor: "tl-br", icone: "↘", label: "Do topo à esquerda para a base à direita" },
  { valor: "top-bottom", icone: "↓", label: "Do topo para a base" },
  { valor: "tr-bl", icone: "↙", label: "Do topo à direita para a base à esquerda" },
  { valor: "left-right", icone: "→", label: "Da esquerda para a direita" },
  null,
  { valor: "right-left", icone: "←", label: "Da direita para a esquerda" },
  { valor: "bl-tr", icone: "↗", label: "Da base à esquerda para o topo à direita" },
  { valor: "bottom-top", icone: "↑", label: "Da base para o topo" },
  { valor: "br-tl", icone: "↖", label: "Da base à direita para o topo à esquerda" },
];

/** As 6 posições do logo no Básico; clicar de novo volta ao automático (linha 49). */
export const POSICOES_LOGO: { valor: PosicaoLogo; icone: string; label: string }[] = [
  { valor: "top-left", icone: "◤", label: "Topo à esquerda" },
  { valor: "top-center", icone: "▲", label: "Topo no centro" },
  { valor: "top-right", icone: "◥", label: "Topo à direita" },
  { valor: "bottom-left", icone: "◣", label: "Base à esquerda" },
  { valor: "bottom-center", icone: "▼", label: "Base no centro" },
  { valor: "bottom-right", icone: "◢", label: "Base à direita" },
];
