// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/lib/estudio-fonts.ts (ESTUDIO_FONTES + GOOGLE_FONTS_HREF), src/lib/estudio-regras.ts
//   (REDES_POST, LIMITE_PALAVRAS_TITULO/SUBTITULO, LIMITE_HASHTAGS, itensDoTrilho), src/hub/components/
//   sidebar/modulos.ts (rótulos das áreas) @ leitura 2026-10 (clone mhdgst-trabalho, somente leitura).
// Fonte da verdade = clone real. Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
//
// Dados MOCK (sem backend). Copy real em português, dentro da marca.

export type Estilo = "A" | "B" | "C";
export type Formato = "feed" | "story";
export type RedeId = "instagram" | "linkedin" | "facebook";

/** Cópia de ESTUDIO_FONTES (src/lib/estudio-fonts.ts). */
export const ESTUDIO_FONTES: string[] = [
  "Dosis", "Sora", "Inter", "Manrope", "DM Sans", "Plus Jakarta Sans", "Space Grotesk", "Outfit",
  "Figtree", "Urbanist", "Work Sans", "Poppins", "Playfair Display", "Bebas Neue", "Archivo Black", "Syne",
];

/** Subconjunto do GOOGLE_FONTS_HREF real, só com o que o protótipo mostra. */
export const FONTES_HREF =
  "https://fonts.googleapis.com/css2?family=Dosis:wght@200..800&family=Open+Sans:wght@300..800&family=Sora:wght@300..800&family=Inter:wght@300..800&family=Manrope:wght@300..800&family=DM+Sans:wght@300..800&family=Plus+Jakarta+Sans:wght@300..800&family=Space+Grotesk:wght@300..700&family=Outfit:wght@300..800&family=Figtree:wght@300..800&family=Urbanist:wght@300..800&family=Work+Sans:wght@300..800&family=Poppins:wght@400;600;700;800&family=Playfair+Display:wght@400..800&family=Bebas+Neue&family=Archivo+Black&family=Syne:wght@400..800&display=swap";

export const LIMITE_HASHTAGS = 8;
export const LIMITE_PALAVRAS_TITULO = 8;
export const LIMITE_PALAVRAS_SUBTITULO = 12;

export const ESPACOS = ["Institucional", "Governo", "Produto", "Eventos", "Parcerias", "Employer branding", "Blog"];
export const SEGMENTOS = ["Governo", "Saúde", "Educação", "Indústria", "Varejo", "Financeiro", "Jurídico"];
export const REDES: { id: RedeId; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
];

export const PALETA = [
  { nome: "Azul Reflex", hex: "#36499b" },
  { nome: "Laranja", hex: "#ff6d2d" },
  { nome: "Apoio", hex: "#67cfee" },
  { nome: "Branco", hex: "#ffffff" },
  { nome: "Grafite", hex: "#1f2a44" },
];

export const LEGENDA_INICIAL =
  "Governança de dados não é sobre guardar tudo. É sobre encontrar o que importa, no momento certo, com segurança.\n\n" +
  "Na Digisystem, a gente estrutura a informação da sua operação para que a decisão venha do dado, não do achismo. " +
  "Quando a base está organizada, a equipe para de caçar planilha e volta a pensar no negócio.";
export const LEGENDA_NOVA =
  "Quem decide com dado bom decide mais rápido. E dado bom começa com regra clara: quem acessa, o que muda e onde fica o histórico.\n\n" +
  "Foi assim que ajudamos órgãos públicos a sair de dezenas de planilhas soltas para uma base única, auditável e fácil de consultar.";
export const HASHTAGS_INICIAL = ["#Digisystem", "#Parceriaquetransforma", "#Tecnologia", "#Governançadedados"];
export const HASHTAGS_NOVAS = ["#Digisystem", "#Parceriaquetransforma", "#Tecnologia", "#Dadosquedecidem", "#Setorpúblico"];
export const CTA_INICIAL = "Fale com um especialista da Digisystem e veja como organizar a sua base de dados.";
export const CTA_NOVO = "Quer ver isso funcionando na sua operação? Converse com um especialista da Digisystem.";

export const TERMOS_ACERVO = ["escritório", "equipe", "dados", "tecnologia", "reunião", "servidor", "cidade"];

export type PapelSlide = "capa" | "miolo" | "cta";
export type Slide = {
  papel: PapelSlide;
  titulo: string;
  subtitulo: string;
  etiqueta: string;
  /** número = cena do acervo/IA; string = URL local (upload real); null = sem imagem */
  img: number | string | null;
  bg: string;
  foco: number; // 0..8 (grade 3x3)
  ctaTexto: string;
  ctaBg: string;
  ctaFg: string;
};

export function slideNovo(papel: PapelSlide, extra: Partial<Slide> = {}): Slide {
  return {
    papel,
    titulo: "",
    subtitulo: "",
    etiqueta: "",
    img: null,
    bg: papel === "cta" ? "#ff6d2d" : "#36499b",
    foco: 4,
    ctaTexto: "Fale com a Digisystem",
    ctaBg: "#ffffff",
    ctaFg: "#36499b",
    ...extra,
  };
}

export const SLIDES_INICIAIS: Slide[] = [
  slideNovo("capa", {
    titulo: "Dado organizado decide melhor",
    subtitulo: "Governança de dados sem complicação",
    etiqueta: "Governança de dados",
  }),
  slideNovo("miolo", {
    titulo: "Quem acessa o quê?",
    subtitulo: "Regras claras evitam retrabalho e risco",
    etiqueta: "Passo 1",
    bg: "#36499b",
  }),
  slideNovo("cta", {
    titulo: "Vamos organizar a sua base?",
    subtitulo: "Converse com um especialista",
    etiqueta: "",
    bg: "#ff6d2d",
    ctaTexto: "Fale com a Digisystem",
    ctaBg: "#ffffff",
    ctaFg: "#36499b",
  }),
];

export type Ajustes = {
  fonteTitulo: string;
  fonteSub: string;
  corTitulo: string;
  corSub: string;
  tamTitulo: number;
  tamSub: number;
  tituloAcima: boolean;
  destaque: boolean;
  destaqueCor: string;
  posModo: "basico" | "avancado";
  posPreset: "topo" | "centro" | "rodape";
  posX: number;
  posY: number;
  posL: number;
  degDir: "up" | "down" | "right" | "diag";
  degInt: number;
  degMarca: boolean;
  degIni: string;
  degFim: string;
  logoSel: "principal" | "branco" | "icone";
  logoX: number;
  logoY: number;
  logoTam: "P" | "M" | "G";
  logoCarrossel: boolean;
};

export const AJUSTES_PADRAO: Ajustes = {
  fonteTitulo: "Dosis",
  fonteSub: "Open Sans",
  corTitulo: "#ffffff",
  corSub: "#ffffff",
  tamTitulo: 96,
  tamSub: 40,
  tituloAcima: true,
  destaque: false,
  destaqueCor: "#ff6d2d",
  posModo: "basico",
  posPreset: "rodape",
  posX: 8,
  posY: 62,
  posL: 84,
  degDir: "up",
  degInt: 82,
  degMarca: true,
  degIni: "#1f2a44",
  degFim: "#36499b",
  logoSel: "branco",
  logoX: 70,
  logoY: 5,
  logoTam: "M",
  logoCarrossel: true,
};

export function contarPalavras(t: string): number {
  return t.trim() ? t.trim().split(/\s+/).length : 0;
}

export const NOMES_CENAS = [
  "Corredor de servidores",
  "Cidade ao entardecer",
  "Rede de conexões",
  "Painel de indicadores",
  "Equipe em reunião",
  "Camadas de nuvem",
];

