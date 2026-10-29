/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/lib/hub-meta.ts, src/hooks/use-posts.ts, src/hooks/use-tasks.ts,
 *   src/hooks/use-trends.ts, src/hooks/use-competitors.ts, src/hooks/use-swot.ts,
 *   src/hooks/use-brand-kit.ts @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Modelo de dados do protótipo hub-novo. Segue o modelo NOVO da proposta
 * (cards + subtarefas com pai, post associado a 1 item, problemas como registro),
 * e não o schema atual do banco. Onde o banco já tem o campo, o nome é o mesmo
 * (em camelCase); o que é novo está marcado com "novo (proposta X)".
 *
 * ─── MUDANÇAS NO APP REAL ADIADAS PARA A RODADA LOVABLE (Task 5.2) ──────────
 * Esta rodada é SÓ protótipo (regras + tipos). Quando a feature entrar no app
 * real (`src/lib/hub-meta.ts` + `src/hooks/use-posts.ts`), aplicar, de forma
 * ESTRITAMENTE ADITIVA (não remover/renomear nada):
 *   1. Tipo `Post` em hub-meta.ts: ADICIONAR `subtitulo` (coluna `posts.subtitulo`,
 *      hoje existe no banco mas falta no tipo) e `arte_erro` (coluna `posts.arte_erro`,
 *      hoje fora do POST_COLS).
 *   2. `POST_COLS` em use-posts.ts: ADICIONAR `subtitulo` e `arte_erro` à lista de
 *      colunas lidas (`mapPost` passa a mapeá-las).
 *   3. PRESERVAR sem renomear: `rede` (enum legado) + `redes` (array) coexistindo;
 *      `svg_url`, `svg_urls[]`, todos os `story_*`, `status_arte`, `arte_original_*`.
 *   Ref.: design.md → "Divergências código↔banco a tratar ao mexer no tipo Post".
 */
import type { ConfigArte } from "../components/estudio/arte-config";

// ─── Pessoas ────────────────────────────────────────────────────────────────

/** Papéis do protótipo. No banco: editor → "marketing"; aprovador; admin. */
export type Papel = "marketing" | "aprovador" | "admin";

export type Usuario = {
  id: string;
  nome: string;
  iniciais: string;
  papel: Papel;
  cargo: string;
  /** Sempre fictício (domínio exemplo.com). */
  email: string;
  /** false = convite pendente, ainda sem acesso. */
  ativo: boolean;
  /** ISO. Ausente quando nunca acessou. */
  ultimoAcesso?: string;
  criadoEm: string;
  /**
   * Removido em Configurações → Equipe (ISO). O registro fica para o histórico
   * (autor dos posts, decisões); some da Equipe e das escolhas de responsável.
   */
  removidoEm?: string;
};

/** Solicitante externo (login OTP). A área é novo (proposta 4.10). */
export type Solicitante = {
  id: string;
  nome: string;
  area: string;
  /** Quando o pedido foi aberto por alguém do time (trava de autoria). */
  usuarioId?: string;
};

// ─── Etiquetas (novo, proposta 4.2 item 7) ──────────────────────────────────

export type Etiqueta = {
  id: string;
  nome: string;
  /** Hex, sempre editado por ColorHexInput. */
  cor: string;
  arquivada: boolean;
};

// ─── Pedido externo ────────────────────────────────────────────────────────

/** Espelho de SolicitacaoMeta (hub-meta.ts). */
export type SolicitacaoMeta = {
  tipoPedido: "post" | "acao";
  objetivos?: string[];
  objetivoOutro?: string;
  plataformas?: string[];
  publico?: string;
  formato?: string;
  /**
   * No banco às vezes chega como texto solto ("a definir") em vez de lista.
   * É a origem do bug B-06 (chips quebrados letra por letra). Mantido assim de
   * propósito no mock para a tela provar a correção.
   */
  tipoAcao?: string[] | string;
  tipoAcaoOutro?: string;
  mensagemChave?: string;
  clientes?: string[];
  destino?: string;
  quantidade?: string;
  referencias?: string;
  cta?: string;
  prioridade?: string;
  dataEvento?: string;
  dependeFornecedor?: boolean;
  orcamento?: string;
  duracao?: string;
  aprovacao?: string;
  anexos?: { nome: string; tipo: string; tamanho: number }[];
};

/** Estado da triagem do pedido. "aprovado" = virou card normal do Quadro. */
export type EstadoTriagem = "recebido" | "triagem" | "aprovado" | "devolvido" | "negado";

/** Formato do parecer real (ParecerTriagem.tsx). */
export type ParecerPedido = {
  nivel: "verde" | "ambar" | "vermelho";
  prontidao: number;
  titulo: string;
  resumo: string;
  pontos: string[];
  sugestaoDevolucao?: string;
};

export type Pedido = {
  solicitanteId: string;
  categoria: "post" | "acao";
  meta: SolicitacaoMeta;
  estado: EstadoTriagem;
  recebidoEm: string;
  /** Quem assumiu a triagem ("Em triagem com {nome}"). */
  triagemPor?: string;
  triagemEm?: string;
  parecer: ParecerPedido;
};

/** Histórico de decisões da aba Pedidos (novo, proposta 4.9). */
export type DecisaoPedido = {
  id: string;
  cardId: string;
  tipo: "aprovado" | "devolvido" | "negado";
  por: string;
  em: string;
  motivo?: string;
};

// ─── Cards e subtarefas (proposta 4.2) ─────────────────────────────────────

export type OrigemCard = "manual" | "tendencia" | "pedido" | "estudio";

/**
 * Coluna "base" escolhida pela pessoa ou pela automação. A coluna EXIBIDA é
 * calculada em regras.ts (Recebidos e Problemas nunca são guardadas).
 */
export type ColunaBase = "afazer" | "andamento";

export type Card = {
  id: string;
  titulo: string;
  descricao: string;
  etiquetas: string[];
  responsavelId?: string;
  /** YYYY-MM-DD */
  inicio?: string;
  /** YYYY-MM-DD */
  prazo?: string;
  origem: OrigemCard;
  trendId?: string;
  pedido?: Pedido;
  colunaBase: ColunaBase;
  /** Só para card sem post e sem subtarefa arrastado para Concluído (ISO). */
  concluidoManualEm?: string;
  /** K10 (proposta 4.7): o post associado foi apagado; o item volta a "sem post". */
  postApagado?: { titulo: string; em: string };
  criadoPor: string;
  criadoEm: string;
};

/**
 * Subtarefa = tarefa com pai (novo, proposta 4.2 item 8: tasks.parent_id).
 * parentId ausente = filha direta do card (nível 2). Com parentId = neta (nível 3).
 * Até 3 níveis contando o card.
 */
export type Subtarefa = {
  id: string;
  cardId: string;
  parentId?: string;
  titulo: string;
  descricao?: string;
  responsavelId?: string;
  prazo?: string;
  /** Ignorado quando há post: a subtarefa com post conclui sozinha (4.2 item 5). */
  concluidaEm?: string;
  /** K10 (proposta 4.7): o post associado foi apagado. */
  postApagado?: { titulo: string; em: string };
  ordem: number;
  criadoEm: string;
};

export type Comentario = {
  id: string;
  /** Card ou subtarefa. */
  itemId: string;
  autorId: string;
  texto: string;
  em: string;
};

// ─── Problemas (proposta 4.4, revisão 3) ───────────────────────────────────

export type TipoProblema = "reprovado" | "aguardando_solicitante" | "bloqueado";

export type Problema = {
  id: string;
  tipo: TipoProblema;
  /** Onde aconteceu: card, subtarefa ou post. */
  alvo: { tipo: "card" | "subtarefa" | "post"; id: string };
  cardId: string;
  motivo: string;
  abertoPor: string;
  abertoEm: string;
  resolvidoEm?: string;
  resolvidoPor?: string;
};

// ─── Posts ─────────────────────────────────────────────────────────────────

export type Rede = "instagram" | "linkedin" | "facebook" | "youtube";

/**
 * Estado guardado do post. "aprovado com data" e "agendado" viram um só
 * (proposta 4.4). "Publicar hoje" e "Publicação atrasada" são derivados da
 * dataPublicacao contra o "hoje" do store (regras.ts).
 */
export type PostEstado = "rascunho" | "enviado" | "reprovado" | "aprovado" | "publicado";

export type Cta = { texto: string; plataformas: Rede[] };

export type Post = {
  id: string;
  /** Gancho/tema do briefing. */
  titulo: string;
  /**
   * Subtítulo editorial do post (coluna real `posts.subtitulo`).
   * Existe no banco mas faltava no tipo Post do app real → ao migrar o real,
   * ADICIONAR ao tipo Post E ao POST_COLS de use-posts.ts. Não confundir com
   * `subtituloArte` (texto que vai NA arte); são campos distintos no schema.
   */
  subtitulo?: string;
  /** Título e subtítulo que vão NA ARTE (o parecer lê estes, B-02). */
  tituloArte: string;
  subtituloArte: string;
  legenda: string;
  hashtags: string[];
  /**
   * Redes do post (array). Fonte da verdade de distribuição no modelo novo.
   * No banco real coexiste com a coluna legada `posts.rede` (enum único) — ver
   * `rede` abaixo. Os DOIS devem continuar existindo no real; não renomear nem
   * remover um em favor do outro.
   */
  redes: Rede[];
  /**
   * Enum legado `posts.rede` (rede única). Coexiste com `redes[]` no mesmo
   * registro — mantido sem renomear por depender dele partes antigas do fluxo.
   * No protótipo é opcional porque o modelo novo usa `redes[]`; no real a coluna
   * continua presente e deve permanecer no POST_COLS.
   */
  rede?: Rede;
  ctas: Cta[];
  segmento: string;
  /** Segmentos do briefing (multisseleção, linha 17 do inventário). `segmento` = o primeiro. */
  segmentos?: string[];
  formato: "Post" | "Carrossel" | "Reels" | "Artigo";
  template: "A" | "B" | "C";
  estado: PostEstado;
  autorId: string;
  criadoEm: string;
  atualizadoEm: string;
  /** Data sugerida pelo autor no envio (YYYY-MM-DD). */
  dataSugerida?: string;
  /** Data de publicação confirmada por quem aprovou (YYYY-MM-DD). */
  dataPublicacao?: string;
  aprovadoEm?: string;
  aprovadoPor?: string;
  /** novo (proposta 5): posts.publicado_em. */
  publicadoEm?: string;
  motivoReprovacao?: string;
  observacao?: string;
  emRevisaoPor?: string;
  /** Card ou subtarefa ao qual está associado. 1 post = 1 item (K4). */
  itemId?: string;
  trendId?: string;
  /** Arte atual (data URI SVG de exemplo). Mapeia `posts.svg_url` do real. */
  arteUrl: string;
  /** Carrossel: todas as pranchetas finais, na ordem (`svg_urls[]` do real). `arteUrl` = a primeira. */
  arteUrls?: string[];
  /** Versão Story 9:16 (colunas `story_*` do real); no carrossel, uma por prancheta. */
  storyUrls?: string[];
  /**
   * Estado do pipeline de composição (coluna real `posts.status_arte`):
   * `sem_arte | aguardando_imagem | processando | pronto`. Preservado sem
   * renomear; parte do contrato do pipeline Estúdio → n8n → Magnific.
   */
  statusArte?: "sem_arte" | "aguardando_imagem" | "processando" | "pronto";
  /**
   * Mensagem de erro do pipeline de composição (coluna real `posts.arte_erro`).
   * HOJE está FORA do POST_COLS no app real → ao migrar, INCLUIR no tipo Post
   * E no POST_COLS; nunca descartar. Preenchido quando a composição falha.
   */
  arteErro?: string;
  /** Versão do designer: a arte anterior (da IA) fica guardada. */
  arteAnteriorUrl?: string;
  arteAjustadaPor?: string;
  /**
   * "Arte original" preservada quando o designer sobe uma versão nova
   * (colunas reais `arte_original_svg_url` / `arte_original_svg_urls[]`).
   * Mantidas sem renomear; sustentam a feature "Versão do designer".
   */
  arteOriginalUrl?: string;
  arteOriginalUrls?: string[];
  /** "Contexto" do Criar post (`posts.detalhamento` do real). */
  detalhamento?: string;
  /** D5 (R-EST-5): a configuração da arte do Estúdio, restaurada ao reabrir. No real, coluna jsonb nova em `posts`. */
  configArte?: ConfigArtePost;
};

/**
 * D5: o que o Estúdio guarda da Arte para o post reabrir igual: textos da arte
 * como foram digitados, os sugeridos, a imagem escolhida e todos os ajustes de
 * Básico e Avançado, inclusive o carrossel por prancheta. O modelo é `Post.template`.
 * As opções geradas pela IA de imagem não entram, como no real (linha 36).
 */
export type ConfigArtePost = {
  tituloArte: string;
  subtituloArte: string;
  tituloSugerido: string;
  subtituloSugerido: string;
  origemImagem?: "enviar" | "ia" | "acervo";
  imagemUrl?: string;
  descricaoImagem: string;
  buscaAcervo: string;
  termos: string[];
  ajustes: ConfigArte;
};

// ─── Tendências, concorrência, SWOT ───────────────────────────────────────

export type Potencial = "Alto" | "Médio" | "Baixo";

export type Tendencia = {
  id: string;
  titulo: string;
  descricao: string;
  tag: string;
  /** O ângulo da Digisystem ("Por que importa para a Digisystem"). */
  proposta: string;
  potencial: Potencial;
  formato: string;
  segmento: string;
  criadoEm: string;
  /** novo (proposta 2.7): só o descarte é gravado; os outros estados são derivados. */
  descarte?: { motivo: string; por: string; em: string };
};

export type EstadoTendencia = "nova" | "em_producao" | "aproveitada" | "descartada";

export type Concorrente = {
  id: string;
  nome: string;
  descricao: string;
  segmento: string;
  sentimento: "positivo" | "neutro" | "negativo";
  engajamentoMedio: number;
  frequenciaSemanal: number;
  temaForte: string;
  links: { tipo: string; url: string; handle: string }[];
  temas: { tema: string; frequencia: number; ultimaOcorrencia: string; notas: string }[];
};

export type QuadranteSwot = "forcas" | "fraquezas" | "oportunidades" | "ameacas";

export type SwotItem = {
  id: string;
  quadrante: QuadranteSwot;
  item: string;
  itemOriginal: string;
  ordem: number;
  editadoManualmente: boolean;
};

// ─── Marca ─────────────────────────────────────────────────────────────────

export type NivelTipografia = { family: string; size: number; weight: number };

export type Marca = {
  nome: string;
  tagline: string;
  descricao: string;
  cultura: string;
  voz: string;
  experiencia: string;
  elementos: string;
  tomVoz: string[];
  ctaPadrao: string;
  assinatura: string;
  cores: { hex: string; label: string }[];
  logos: { id: string; label: string }[];
  fundos: { id: string; label: string; hex: string }[];
  elementosImagens: { label: string }[];
  hashtagsOficiais: string[];
  segmentos: { id: string; nome: string; descricao: string }[];
  objetivos: string[];
  formatos: string[];
  tipografia: {
    display: NivelTipografia;
    h1: NivelTipografia;
    h2: NivelTipografia;
    h3: NivelTipografia;
    body: NivelTipografia;
    caption: NivelTipografia;
    mono: NivelTipografia;
    escala: "Compacta" | "Padrão" | "Ampla";
    lineHeight: number;
    letterSpacing: number;
  };
  /** AbaMarca: tamanhos de logo P/M/G em % (vai para Marca → Logos e fundos). */
  tamanhosLogo: { P: number; M: number; G: number };
};

// ─── Configurações ─────────────────────────────────────────────────────────

export type Webhook = { id: string; nome: string; descricao: string; url: string };

/** "O que o agente escreve" (app_settings.campos_agente_texto_json real). */
export type CamposAgente = { kicker: boolean; titulo: boolean; subtitulo: boolean };

export type PromptConfig = {
  id: string;
  grupo: "camadas" | "texto" | "imagem" | "pareceres";
  titulo: string;
  descricao: string;
  texto: string;
  /** true = configurado no banco; false = usando o padrão do sistema. */
  noBanco: boolean;
};

// ─── Histórico para Resultados → Time (só leitura) ────────────────────────

/**
 * Registros do mês anterior, para Resultados → Time ter base de comparação.
 * O mês corrente é calculado direto do store, então reage às ações.
 */
export type RegistroPedido = {
  id: string;
  titulo: string;
  area: string;
  categoria: "post" | "acao";
  etiquetas: string[];
  recebidoEm: string;
  decididoEm: string;
  decisao: "aprovado" | "devolvido" | "negado";
  decididoPor: string;
  motivo?: string;
};

export type RegistroEntrega = {
  id: string;
  titulo: string;
  responsavelId: string;
  etiquetas: string[];
  prazo: string;
  entregueEm: string;
};

export type RegistroProblema = {
  id: string;
  tipo: TipoProblema;
  abertoEm: string;
  resolvidoEm: string;
};

export type Historico = {
  pedidos: RegistroPedido[];
  entregas: RegistroEntrega[];
  problemas: RegistroProblema[];
};

// ─── Conjunto de dados ────────────────────────────────────────────────────

export type DadosHub = {
  usuarios: Usuario[];
  solicitantes: Solicitante[];
  etiquetas: Etiqueta[];
  cards: Card[];
  subtarefas: Subtarefa[];
  comentarios: Comentario[];
  posts: Post[];
  problemas: Problema[];
  decisoes: DecisaoPedido[];
  tendencias: Tendencia[];
  concorrentes: Concorrente[];
  swot: SwotItem[];
  /** Instante da última leitura da SWOT pela IA (novo no protótipo; o real não guarda). */
  swotAnalisadoEm: string;
  marca: Marca;
  webhooks: Webhook[];
  prompts: PromptConfig[];
  camposAgente: CamposAgente;
  historico: Historico;
};
