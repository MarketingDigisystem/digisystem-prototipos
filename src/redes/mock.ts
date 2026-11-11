/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/hub/pages/resultados/Redes.tsx e rede/PaginaRede.tsx @ leitura 2026-11-11 (commit 83755ae).
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md.
 *
 * Dados FICTÍCIOS, sem backend. Por padrão só o LinkedIn tem coleta (como no app hoje);
 * Instagram, Facebook e YouTube ficam "Em breve". O modo "demonstração" simula as quatro redes
 * com coleta, só para aprovar o desenho do gráfico por rede e do consolidado.
 */
import type { EntradaRede } from "./nucleo/consolidado";
import type { ConexaoEstado, Kpis, SocialProvider } from "./nucleo/tipos-proto";
import { estadoDaRede } from "./nucleo/estado-rede";

export const REDES: readonly SocialProvider[] = ["linkedin", "instagram", "facebook", "youtube"];

/** LinkedIn ativo; Instagram conectado mas ainda sem coleta (gera o alerta do consolidado). */
export const CONEXOES_MOCK: ConexaoEstado[] = [
  { id: "c-li", provider: "linkedin", status: "ativo", tipoAcesso: "leitura" },
  { id: "c-ig", provider: "instagram", status: "ativo", tipoAcesso: "leitura" },
];

export const CONEXOES_DEMO: ConexaoEstado[] = REDES.map((r) => ({
  id: `c-${r}`,
  provider: r,
  status: "ativo",
  tipoAcesso: "leitura",
}));

export type PeriodoDias = 7 | 30 | 90;
export const PERIODOS: readonly PeriodoDias[] = [7, 30, 90];

const FATOR_PERIODO: Record<PeriodoDias, number> = { 7: 0.24, 30: 1, 90: 2.85 };
/** Escala por rede só no modo demonstração. */
const FATOR_REDE: Record<SocialProvider, number> = { linkedin: 1, instagram: 0.8, facebook: 0.35, youtube: 0.5 };

export const ROTULO_REDE: Record<SocialProvider, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

const BASE: Kpis = {
  impressoes: 48210,
  alcance: 31640,
  cliques: 1385,
  engajamentosTotais: 2290,
  taxaEngajamento: 4.75,
  ctr: 2.87,
  seguidoresTotais: 74222,
  seguidoresGanhos: 412,
  crescimentoSeguidores: 0.56,
};

/** Variação contra o período anterior (pontos percentuais para taxas, % para volumes). */
export const VARIACAO_LINKEDIN: Record<string, number> = {
  impressoes: 12.4,
  alcance: 8.1,
  cliques: -3.2,
  taxaEngajamento: 0.6,
  ctr: -0.2,
  seguidoresTotais: 0.6,
};

export function kpisDaRede(rede: SocialProvider, dias: PeriodoDias): Kpis {
  const f = FATOR_PERIODO[dias] * FATOR_REDE[rede];
  const r = (n: number) => Math.round(n * f);
  return {
    impressoes: r(BASE.impressoes!),
    alcance: r(BASE.alcance!),
    cliques: r(BASE.cliques!),
    engajamentosTotais: r(BASE.engajamentosTotais!),
    taxaEngajamento: BASE.taxaEngajamento,
    ctr: BASE.ctr,
    seguidoresTotais: Math.round(BASE.seguidoresTotais! * FATOR_REDE[rede]),
    seguidoresGanhos: r(BASE.seguidoresGanhos!),
    crescimentoSeguidores: BASE.crescimentoSeguidores,
  };
}

/**
 * Estado da página (tarefa 10.4). `dados` = comportamento normal; `carregando` e `erro` são tratados nos
 * cards (esqueleto / mensagem com nova tentativa); `vazio` = conectadas, mas sem linhas no período;
 * `embreve` = nenhuma rede com coleta.
 */
export type FasePagina = "dados" | "carregando" | "vazio" | "erro" | "embreve";
export const FASES: readonly FasePagina[] = ["dados", "carregando", "vazio", "erro", "embreve"];
export const ROTULO_FASE: Record<FasePagina, string> = {
  dados: "Com dados",
  carregando: "Carregando",
  vazio: "Vazio",
  erro: "Erro",
  embreve: "Em breve",
};

export function entradasMock(demo: boolean, dias: PeriodoDias, fase: FasePagina = "dados"): EntradaRede[] {
  const conexoes = demo || fase === "vazio" ? CONEXOES_DEMO : CONEXOES_MOCK;
  return REDES.map((rede) => {
    const coleta = fase === "embreve" ? false : fase === "vazio" ? true : demo || rede === "linkedin";
    const estado = estadoDaRede(rede, conexoes, coleta && fase !== "vazio" ? dias : 0, coleta);
    const kpis = estado.tipo === "ok" ? kpisDaRede(rede, dias) : null;
    return {
      rede,
      estado,
      kpis,
      postsElegiveis: kpis ? { engajamento: kpis.engajamentosTotais, impressoes: kpis.impressoes } : null,
    };
  });
}

/** Pseudo-aleatório determinístico (o protótipo não pode "piscar" números a cada render). */
function ruido(i: number, sal: number): number {
  const s = Math.sin(i * 12.9898 + sal * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

export type PontoSerie = { dia: string; valor: number };

/** Impressões diárias de uma rede, com `dias` pontos terminando em 11/11. */
export function serieDaRede(rede: SocialProvider, dias: PeriodoDias, deslocamento = 0): PontoSerie[] {
  const salRede = REDES.indexOf(rede) + 1;
  const fim = new Date(2026, 10, 11);
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(fim);
    d.setDate(fim.getDate() - (dias - 1 - i));
    const dia = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const semana = d.getDay() === 0 || d.getDay() === 6 ? 0.55 : 1;
    const base = 1500 + 420 * Math.sin((i + deslocamento) / 3.2 + salRede) + ruido(i + deslocamento, salRede) * 260 + i * 6;
    return { dia, valor: Math.round(base * semana * FATOR_REDE[rede]) };
  });
}

/** Cliques diários (para o segundo botão do card de evolução). */
export function serieCliquesLinkedin(dias: PeriodoDias, deslocamento = 0): PontoSerie[] {
  return serieDaRede("linkedin", dias, deslocamento).map((p, i) => ({
    dia: p.dia,
    valor: Math.round(p.valor * (0.028 + ruido(i + deslocamento, 9) * 0.008)),
  }));
}

/** Base dos assets em public/redes/ (funciona no GitHub Pages com base /digisystem-prototipos/). */
const IMG = (arquivo: string) => import.meta.env.BASE_URL + "redes/" + arquivo;

export const AVATAR_DIGISYSTEM = IMG("avatar-digisystem.png");

export const POSTS_LINKEDIN = [
  { titulo: "Governança de dados começa pela pergunta certa", imagem: IMG("post-governanca.png"), formato: "Imagem", data: "04/11", impressoes: 6120, eng: 5.4 },
  { titulo: "Cinco sinais de que seu ERP pede revisão", imagem: IMG("post-erp.png"), formato: "Carrossel", data: "29/10", impressoes: 5480, eng: 6.1 },
  { titulo: "Bastidores da equipe no evento de Brasília", imagem: IMG("post-bastidores.png"), formato: "Vídeo", data: "22/10", impressoes: 4310, eng: 4.2 },
  { titulo: "Como reduzimos o tempo de atendimento ao cidadão", imagem: IMG("post-atendimento.png"), formato: "Imagem", data: "15/10", impressoes: 3890, eng: 3.8 },
  { titulo: "Nova solução para gestão de contratos públicos", imagem: IMG("post-contratos.png"), formato: "Artigo", data: "08/10", impressoes: 3120, eng: 3.1 },
];

export const FORMATOS_LINKEDIN = [
  { formato: "Carrossel", posts: 6, eng: 6.1 },
  { formato: "Imagem", posts: 11, eng: 4.6 },
  { formato: "Vídeo", posts: 4, eng: 4.2 },
  { formato: "Artigo", posts: 2, eng: 3.1 },
];

export const DIAS_SEMANA = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"] as const;
export const FAIXAS_HORA = ["6h–9h", "9h–12h", "12h–15h", "15h–18h", "18h–21h"] as const;

/** Engajamento médio (%) por faixa (linha) e dia (coluna). */
export const MOMENTO_LINKEDIN: number[][] = [
  [3.1, 4.2, 3.8, 3.6, 3.0, 1.2, 0.9],
  [4.4, 6.3, 5.1, 4.8, 4.1, 1.6, 1.1],
  [3.6, 4.9, 4.4, 4.0, 3.5, 1.3, 1.0],
  [3.2, 4.0, 3.9, 3.7, 2.9, 1.1, 0.8],
  [2.1, 2.6, 2.4, 2.3, 1.8, 0.9, 0.7],
];

export const FREQUENCIA_LINKEDIN = [
  { semana: "13/10", posts: 3 },
  { semana: "20/10", posts: 4 },
  { semana: "27/10", posts: 2 },
  { semana: "03/11", posts: 5 },
  { semana: "10/11", posts: 1 },
];

export const METAS_LINKEDIN = [
  { nome: "Novos seguidores no mês", atual: 412, meta: 600, unidade: "" },
  { nome: "Posts publicados no mês", atual: 21, meta: 24, unidade: "" },
  { nome: "Taxa de engajamento", atual: 4.75, meta: 5, unidade: "%" },
];

export const PUBLICO_LINKEDIN: { faceta: string; itens: { nome: string; pct: number }[] }[] = [
  {
    faceta: "Por função",
    itens: [
      { nome: "Tecnologia da informação", pct: 24 },
      { nome: "Gestão de projetos", pct: 17 },
      { nome: "Administração", pct: 14 },
      { nome: "Compras e contratos", pct: 11 },
    ],
  },
  {
    faceta: "Por setor",
    itens: [
      { nome: "Administração pública", pct: 31 },
      { nome: "Serviços de TI", pct: 22 },
      { nome: "Educação", pct: 9 },
      { nome: "Saúde", pct: 7 },
    ],
  },
  {
    faceta: "Por senioridade",
    itens: [
      { nome: "Sênior", pct: 33 },
      { nome: "Gerência", pct: 21 },
      { nome: "Diretoria", pct: 12 },
      { nome: "Pleno", pct: 18 },
    ],
  },
  {
    faceta: "Por porte da empresa",
    itens: [
      { nome: "Mais de 10 mil pessoas", pct: 28 },
      { nome: "1.001 a 5.000 pessoas", pct: 19 },
      { nome: "201 a 1.000 pessoas", pct: 16 },
      { nome: "Até 200 pessoas", pct: 13 },
    ],
  },
];

export const SINCRONIZADO_EM = "11/11/2026, 06h";
