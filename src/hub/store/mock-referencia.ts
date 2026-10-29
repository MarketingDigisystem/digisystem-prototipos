/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: banco do Lovable (SELECT em brand_kit, trends, swot, app_settings),
 *   src/components/admin/AbaIA.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Dados de referência (mudam pouco): marca, tendências, concorrentes, SWOT,
 * prompts e webhooks. Ajustes feitos sobre o dado real, de propósito:
 *  - Travessões usados como enfeite nas propostas das tendências viraram ":" ou ",".
 *  - Descrições de segmento reescritas sem os termos banidos do Manual de Estilo
 *    ("garantindo", "otimização").
 *  - Nenhuma URL real: logos, fundos e elementos ficam só com o rótulo; webhooks
 *    usam o domínio exemplo.com.
 *  - Concorrentes: a tabela real está vazia (0 linhas), então os 4 são fictícios.
 */
import type { Concorrente, Marca, PromptConfig, SwotItem, Tendencia, Webhook } from "./tipos";

// ─── Marca (brand_kit real) ────────────────────────────────────────────────

export const MARCA: Marca = {
  nome: "Digisystem",
  tagline: "Parceria que transforma",
  descricao:
    "Com mais de 35 anos de experiência, a Digisystem é referência no Brasil e na América Latina em soluções tecnológicas que impulsionam a inovação e a eficiência empresarial. Atuamos como o parceiro estratégico ideal para organizações de diferentes setores que buscam transformar desafios em oportunidades por meio da tecnologia.",
  cultura:
    "Orientada a resultados, com um alto padrão de entrega; age de maneira íntegra e transparente e quer trabalhar como parceira do cliente.",
  voz: "Espírito jovem, inteligente, amante da tecnologia. Traz os conceitos de maneira leve e inovadora, oferece uma visão alternativa ao status quo.",
  experiencia:
    "Encorajadora, inovadora, voltada para a resolução de problemas complexos de maneira simples, mas sem relativizar o tamanho do desafio que o gestor enfrenta.",
  elementos:
    "Os elementos gráficos podem ser utilizados de forma livre nas aplicações da marca, desde que sejam mantidas suas proporções originais. A ampliação ou redução deve ocorrer proporcionalmente, evitando distorções que comprometam a integridade visual dos elementos.",
  tomVoz: ["Consultivo", "Direto"],
  ctaPadrao: "Fale com nossos especialistas",
  assinatura: "Equipe DigiSystem",
  cores: [
    { hex: "#36499b", label: "Azul Principal" },
    { hex: "#ff6d2d", label: "Laranja" },
    { hex: "#67cfee", label: "Azul Claro" },
    { hex: "#2a397a", label: "Azul escuro" },
    { hex: "#dadada", label: "Cinza" },
    { hex: "#ffffff", label: "Branco" },
  ],
  logos: [
    { id: "logo-principal", label: "Colorido (principal)" },
    { id: "logo-branco", label: "Branco" },
    { id: "logo-slogan", label: "Colorido Slogan" },
    { id: "logo-vertical", label: "Vertical" },
    { id: "logo-icon-branco", label: "Icon Branco" },
    { id: "logo-icon-colorido", label: "Icon Colorido" },
  ],
  fundos: [
    { id: "fundo-laranja", label: "Laranja", hex: "#ff6d2d" },
    { id: "fundo-azul", label: "Azul", hex: "#36499b" },
    { id: "fundo-azul-claro", label: "Azul claro", hex: "#67cfee" },
    { id: "fundo-branco", label: "Branco", hex: "#ffffff" },
  ],
  elementosImagens: [
    "Cilindro Laranja",
    "Anel azul claro",
    "Elementos f azul",
    "Elemento f branco",
    "Cilindro",
    "Cilindro azul claro",
    "Anel azul",
    "Circulo azul claro",
    "Circulo azul",
    "Circulo laranja",
    "Icon Colorido",
    "Anel laranja",
    "Icon Negativo",
  ].map((label) => ({ label })),
  hashtagsOficiais: ["#Transformaçãodigital", "#Ti", "#Tecnologia", "#Inovação", "#Digisystem", "#Parceriaquetransforma"],
  segmentos: [
    {
      id: "seg-saude",
      nome: "Saúde",
      descricao:
        "Segmento focado em oferecer prestação de serviços a hospitais e clínicas, com foco em Gestão Hospitalar, Suporte Bionexo Tasy e PACS.",
    },
    {
      id: "seg-atendimento",
      nome: "Atendimento ao Cliente",
      descricao: "Service desk, field service, suporte especializado, suporte residente e monitoramento.",
    },
    {
      id: "seg-alocacao",
      nome: "Alocação Especializada",
      descricao:
        "A Alocação Especializada da Digisystem fornece profissionais qualificados sob demanda, com agilidade e custo operacional menor.",
    },
    {
      id: "seg-desenvolvimento",
      nome: "Desenvolvimento",
      descricao:
        "A Digisystem desenvolve aplicações personalizadas que se adaptam às necessidades de cada setor, com eficiência operacional e uma experiência digital diferenciada para os clientes.",
    },
    {
      id: "seg-infraestrutura",
      nome: "Infraestrutura",
      descricao:
        "Com a Infraestrutura da Digisystem, a operação ganha estabilidade, suporte contínuo, custos sob controle e uma gestão proativa para o negócio crescer.",
    },
    {
      id: "seg-integracao",
      nome: "Integração",
      descricao:
        "A Digisystem transforma desafios técnicos em soluções inteligentes, para que sistemas, plataformas e aplicações se comuniquem de forma fluida e segura.",
    },
  ],
  objetivos: ["Engajar", "Salvar", "Educar", "Gerar leads"],
  formatos: ["Reels", "Post", "Artigo", "Carrossel"],
  tipografia: {
    display: { family: "Dosis", size: 50, weight: 800 },
    h1: { family: "Dosis", size: 40, weight: 700 },
    h2: { family: "Dosis", size: 30, weight: 600 },
    h3: { family: "Dosis", size: 25, weight: 500 },
    body: { family: "Open Sans", size: 16, weight: 400 },
    caption: { family: "Open Sans", size: 12, weight: 500 },
    mono: { family: "Open Sans", size: 14, weight: 400 },
    escala: "Padrão",
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  tamanhosLogo: { P: 25, M: 30, G: 35 },
};

// ─── Tendências (as 12 reais de `trends`) ─────────────────────────────────

/**
 * `criadoEmDias` = dias antes de "hoje". No banco todas têm o mesmo created_at;
 * aqui a de contexto no atendimento é a mais recente, para ser o destaque
 * (maior potencial, ainda nova, mais nova) do roteiro R1.
 */
export const TENDENCIAS_BASE: (Omit<Tendencia, "criadoEm"> & { criadoEmDias: number })[] = [
  {
    id: "c79633a8-c3c8-4949-bf0d-c29b65772a5b",
    titulo: "Não transfira o cliente, transfira o contexto",
    descricao:
      "Tema destaque do CONAREC 2026: a frustração do cliente não está em falar com várias pessoas, mas em repetir o problema toda vez. O futuro é contexto integrado entre agentes.",
    tag: "contexto-atendimento",
    proposta:
      "Post conceitual com exemplo prático: mostrar a jornada típica (ruim) ao lado da jornada com contexto preservado, e as tecnologias que viabilizam isso (CRM, IA, integração).",
    potencial: "Alto",
    formato: "carrossel",
    segmento: "Atendimento ao Cliente",
    criadoEmDias: 1,
  },
  {
    id: "d313b164-8c6a-43e9-a8eb-9bdf0b537720",
    titulo: "Omnichannel virou critério de escolha para 60% dos pacientes",
    descricao:
      "Mais da metade dos pacientes em 2026 escolhe serviços de saúde pela conveniência digital. Atendimento integrado entre canais deixou de ser nice-to-have.",
    tag: "omnichannel-saúde",
    proposta:
      "Checklist interativo: \"Sua clínica ou hospital é omnichannel de verdade?\". São 8 perguntas para avaliar a maturidade (agendamento, prontuário, telemedicina, pós-consulta).",
    potencial: "Alto",
    formato: "carrossel",
    segmento: "Saúde",
    criadoEmDias: 2,
  },
  {
    id: "2909957a-91db-433e-b1ce-e98207543db9",
    titulo: "1.000+ healthtechs no Brasil, crescimento de 25% em 2 anos",
    descricao:
      "O mercado de tecnologia para saúde brasileiro explodiu: mais de mil startups ativas, com foco em IA aplicada, interoperabilidade e experiência do paciente.",
    tag: "mercado-healthtech",
    proposta:
      "Análise de cenário: \"O que separa as 100 healthtechs que escalam das 900 que estagnam\". Identificar padrões de sucesso: integração, compliance, UX e vendas B2B.",
    potencial: "Alto",
    formato: "carrossel",
    segmento: "Saúde",
    criadoEmDias: 3,
  },
  {
    id: "dbe88ac7-40f5-4b45-aeb3-cd7d58aeefe8",
    titulo: "IA virou infraestrutura crítica na saúde",
    descricao:
      "A inteligência artificial multimodal deixou de ser diferencial e passou a ser base operacional essencial para healthtechs em 2026. Quem ainda trata IA como projeto paralelo está ficando para trás.",
    tag: "IA-infraestrutura",
    proposta:
      "Carrossel mostrando a evolução de \"piloto de IA\" para \"IA como camada de sistema crítico\", com exemplos práticos de transcrição, diagnóstico assistido e integração de dados clínicos.",
    potencial: "Alto",
    formato: "carrossel",
    segmento: "Saúde",
    criadoEmDias: 6,
  },
  {
    id: "92349120-7e02-45b8-9d6d-af35fa9deeb8",
    titulo: "78% automatizaram, mas poucos conectaram tudo",
    descricao:
      "Três em cada quatro empresas brasileiras já investiram em automação, mas na saúde o gargalo não é mais automatizar. É integrar fluxos entre faturamento, prontuário e gestão clínica.",
    tag: "interoperabilidade",
    proposta:
      "Post com dado impactante e framework visual: \"Os 3 níveis de maturidade em automação na saúde\". Nível 1: tarefas isoladas. Nível 2: fluxos departamentais. Nível 3: ecossistema integrado.",
    potencial: "Alto",
    formato: "carrossel",
    segmento: "Saúde",
    criadoEmDias: 14,
  },
  {
    id: "c4f433a1-3846-4d09-8ca0-20d8c270bd57",
    titulo: "88% adotaram IA no atendimento, mas só 25% integraram",
    descricao:
      "O mercado de IA para contact center vai atingir US$ 15 bi em 2026, mas a maioria das empresas ainda usa IA como ferramenta isolada, não como parte do fluxo operacional.",
    tag: "IA-atendimento",
    proposta:
      "Post de opinião forte: \"Chatbot não é estratégia de atendimento. É ferramenta.\" Explicar a diferença entre implantar IA e redesenhar a experiência do cliente com IA no centro.",
    potencial: "Alto",
    formato: "carrossel",
    segmento: "Atendimento ao Cliente",
    criadoEmDias: 8,
  },
  {
    id: "c907b3ec-818d-4c6d-b246-b55c9511e995",
    titulo: "59% dos brasileiros rejeitam respostas automáticas no WhatsApp",
    descricao:
      "Apenas 20% dos consumidores brasileiros tiveram boas experiências com chatbots. A resistência não é à tecnologia, mas à experiência mal desenhada.",
    tag: "chatbot-experiência",
    proposta:
      "Carrossel \"Os 5 erros que fazem seu cliente odiar seu chatbot\", com exemplos reais anônimos e o que fazer diferente. Tom educativo, sem demonizar a automação.",
    potencial: "Alto",
    formato: "carrossel",
    segmento: "Atendimento ao Cliente",
    criadoEmDias: 9,
  },
  {
    id: "eaa7e7bf-3b18-4268-a702-1ef2549afc63",
    titulo: "Company Pages têm só 5% de espaço no feed",
    descricao:
      "Perfis pessoais recebem 65% da distribuição de conteúdo no LinkedIn, enquanto páginas corporativas ficam com apenas 5%. Empresas B2B que não ativam seus colaboradores estão invisíveis.",
    tag: "employee-advocacy",
    proposta:
      "Guia prático: \"Como transformar sua equipe em amplificadores de marca no LinkedIn\". São 4 passos para criar um programa de advocacy sem forçar a barra.",
    potencial: "Alto",
    formato: "documento PDF nativo",
    segmento: "Atendimento ao Cliente",
    criadoEmDias: 10,
    descarte: {
      motivo: "Fala com o RH, não com gestores de TI. O programa interno de advocacy já está em andamento.",
      por: "u-marina",
      em: "",
    },
  },
  {
    id: "43342499-73d6-4df7-837e-4f200181a74d",
    titulo: "LinkedIn agora privilegia relevância, não alcance",
    descricao:
      "O algoritmo 360 Brew reduziu o alcance médio em 50%, mas aumentou o engajamento em 12%. Conteúdo genérico morreu: só quem entrega valor real para o público certo sobrevive.",
    tag: "algoritmo-linkedin",
    proposta:
      "Post meta: \"Por que seu alcance caiu, mas sua empresa deveria comemorar\". Explicar a mudança do algoritmo e como adaptar a estratégia de conteúdo para relevância.",
    potencial: "Médio",
    formato: "carrossel",
    segmento: "Desenvolvimento",
    criadoEmDias: 11,
  },
  {
    id: "e0922435-924b-4096-a2bd-168bed97ac53",
    titulo: "90% dos brasileiros escolhem pela proteção de dados",
    descricao:
      "Brasileiros confiam mais em empresas que protegem dados pessoais do que a média global (90% contra 83%). Na saúde, segurança virou fator de escolha, não só compliance.",
    tag: "confiança-dados",
    proposta:
      "Imagem com a estatística em destaque e a pergunta: \"Sua plataforma de saúde comunica segurança ou só cumpre a LGPD?\". Provocar reflexão sobre transparência ativa e passiva.",
    potencial: "Médio",
    formato: "imagem única",
    segmento: "Saúde",
    criadoEmDias: 4,
  },
  {
    id: "fdc97ef1-8a34-4396-a280-040a922c213d",
    titulo: "Carrosséis e PDFs nativos lideram engajamento em 2026",
    descricao:
      "Posts com múltiplas imagens geram 6,6% de engajamento e documentos PDF nativos alcançam 6,1%. Texto puro ficou para trás, com apenas 4%.",
    tag: "formatos-linkedin",
    proposta:
      "Carrossel sobre carrosséis: \"Os 3 formatos que mais engajam no LinkedIn em 2026\", com templates visuais e exemplos práticos de cada formato.",
    potencial: "Médio",
    formato: "carrossel",
    segmento: "Integração",
    criadoEmDias: 5,
  },
  {
    id: "4a9d8783-e1dc-49f6-8a75-d005eebe062d",
    titulo: "IA cresceu 155x em perfis brasileiros desde 2022",
    descricao:
      "O número de profissionais declarando competências em IA no LinkedIn Brasil explodiu. As habilidades mais buscadas: Estratégia de IA, Plataformas Inteligentes e aplicação de LLMs ao negócio.",
    tag: "skills-IA",
    proposta:
      "Post de dados com provocação: \"Sua equipe tem skills de IA no currículo, mas usa IA de verdade no dia a dia?\". Conectar o hype do perfil com a aplicação prática.",
    potencial: "Médio",
    formato: "imagem única",
    segmento: "Desenvolvimento",
    criadoEmDias: 7,
  },
];

/** Atalhos de id das tendências usadas nos cards e posts de exemplo. */
export const T = {
  contexto: "c79633a8-c3c8-4949-bf0d-c29b65772a5b",
  iaSaude: "dbe88ac7-40f5-4b45-aeb3-cd7d58aeefe8",
  maturidade: "92349120-7e02-45b8-9d6d-af35fa9deeb8",
  iaAtendimento: "c4f433a1-3846-4d09-8ca0-20d8c270bd57",
  whatsapp: "c907b3ec-818d-4c6d-b246-b55c9511e995",
  companyPages: "eaa7e7bf-3b18-4268-a702-1ef2549afc63",
  algoritmo: "43342499-73d6-4df7-837e-4f200181a74d",
} as const;

// ─── Concorrentes (fictícios: a tabela real está vazia) ───────────────────

export const CONCORRENTES_BASE: (Omit<Concorrente, "temas"> & {
  temas: { tema: string; frequencia: number; ultimaOcorrenciaDias: number; notas: string }[];
})[] = [
  {
    id: "co-nexo",
    nome: "Nexo Atende",
    descricao: "Plataforma de atendimento com chatbot e central omnichannel para varejo e serviços.",
    segmento: "Atendimento ao Cliente",
    sentimento: "positivo",
    engajamentoMedio: 4.8,
    frequenciaSemanal: 5,
    temaForte: "IA no atendimento",
    links: [
      { tipo: "linkedin", url: "https://exemplo.com/nexo-atende", handle: "nexo-atende" },
      { tipo: "instagram", url: "https://exemplo.com/nexoatende", handle: "@nexoatende" },
    ],
    temas: [
      { tema: "Chatbot humanizado", frequencia: 6, ultimaOcorrenciaDias: 2, notas: "Série semanal com antes e depois de fluxos de atendimento." },
      { tema: "Contexto entre canais", frequencia: 3, ultimaOcorrenciaDias: 4, notas: "Usam o mesmo dado do CONAREC que a nossa tendência de contexto." },
      { tema: "Cases de varejo", frequencia: 2, ultimaOcorrenciaDias: 9, notas: "Vídeos curtos com o cliente falando." },
    ],
  },
  {
    id: "co-vitalis",
    nome: "Vitalis Sistemas de Saúde",
    descricao: "Software de gestão hospitalar e prontuário eletrônico para hospitais de médio porte.",
    segmento: "Saúde",
    sentimento: "neutro",
    engajamentoMedio: 3.1,
    frequenciaSemanal: 3,
    temaForte: "Interoperabilidade hospitalar",
    links: [{ tipo: "linkedin", url: "https://exemplo.com/vitalis-saude", handle: "vitalis-saude" }],
    temas: [
      { tema: "Interoperabilidade", frequencia: 4, ultimaOcorrenciaDias: 3, notas: "Carrosséis técnicos, pouco engajamento fora do público de TI." },
      { tema: "LGPD na saúde", frequencia: 2, ultimaOcorrenciaDias: 12, notas: "Tom jurídico, sem exemplo prático." },
      { tema: "Telemedicina", frequencia: 2, ultimaOcorrenciaDias: 15, notas: "" },
    ],
  },
  {
    id: "co-prisma",
    nome: "Prisma Cloud Serviços",
    descricao: "Consultoria de infraestrutura e migração para nuvem pública.",
    segmento: "Infraestrutura",
    sentimento: "negativo",
    engajamentoMedio: 1.9,
    frequenciaSemanal: 2,
    temaForte: "Migração para nuvem",
    links: [{ tipo: "linkedin", url: "https://exemplo.com/prisma-cloud", handle: "prisma-cloud" }],
    temas: [
      { tema: "Custos de nuvem", frequencia: 3, ultimaOcorrenciaDias: 6, notas: "Comentários reclamando de suporte lento." },
      { tema: "Segurança", frequencia: 2, ultimaOcorrenciaDias: 10, notas: "" },
    ],
  },
  {
    id: "co-codex",
    nome: "Codex Fábrica de Software",
    descricao: "Desenvolvimento de aplicações sob medida e squads alocados.",
    segmento: "Desenvolvimento",
    sentimento: "positivo",
    engajamentoMedio: 5.6,
    frequenciaSemanal: 4,
    temaForte: "Carrosséis técnicos no LinkedIn",
    links: [
      { tipo: "linkedin", url: "https://exemplo.com/codex-software", handle: "codex-software" },
      { tipo: "site", url: "https://exemplo.com/codex", handle: "exemplo.com/codex" },
    ],
    temas: [
      { tema: "IA generativa no desenvolvimento", frequencia: 5, ultimaOcorrenciaDias: 1, notas: "Posts dos próprios desenvolvedores, com muito comentário." },
      { tema: "Carrosséis e PDFs", frequencia: 4, ultimaOcorrenciaDias: 3, notas: "Formato que mais engaja na página deles." },
      { tema: "Employee advocacy", frequencia: 3, ultimaOcorrenciaDias: 5, notas: "Time inteiro compartilha os posts da empresa." },
    ],
  },
];

// ─── SWOT (os 16 itens reais de `swot`) ──────────────────────────────────

const swotReal: [SwotItem["quadrante"], string][] = [
  ["forcas", "Posicionamento em três verticais estratégicas com forte crescimento projetado: saúde digital, IA e atendimento automatizado"],
  ["forcas", "Atuação no mercado B2B brasileiro de tecnologia, segmento com investimentos prioritários em IA generativa e agentes inteligentes"],
  ["forcas", "Presença em healthtech, maior ecossistema da América Latina com dois terços das startups da região concentradas no Brasil"],
  ["fraquezas", "Ausência total de presença digital mensurável: zero alcance, impressões e engajamento em 30 dias"],
  ["fraquezas", "Sem base de seguidores nas redes sociais, comprometendo autoridade de marca e geração de demanda inbound"],
  ["fraquezas", "Nenhum concorrente mapeado formalmente, indicando falta de inteligência competitiva estruturada"],
  ["fraquezas", "Invisibilidade digital em mercado onde criação de conteúdo representa 61% dos casos de uso de IA"],
  ["oportunidades", "18% dos estabelecimentos de saúde já usam IA no Brasil, com empresas em estágios iniciais buscando fornecedores de implementação"],
  ["oportunidades", "Gap de maturidade: 50% das empresas brasileiras usam IA mas apenas 15% estão em estágio avançado, demandando integração e suporte"],
  ["oportunidades", "Telemedicina consolidada como linha de receita estável pós-pandemia, com pressão por eficiência acelerando adoção de IA em regulação e faturamento"],
  ["oportunidades", "Google Cloud e Alibaba Cloud dobrando infraestrutura no Brasil até 2030, reduzindo barreiras para soluções cloud-native"],
  ["oportunidades", "IA conversacional no atendimento tornou-se investimento com maior ROI para clínicas em 2026"],
  ["ameacas", "Mercado de atendimento dominado por players internacionais consolidados (Zendesk, Salesforce, Intercom) com grande poder de investimento"],
  ["ameacas", "12 milhões de empresas brasileiras já alegam usar IA, aumentando saturação e exigindo diferenciação clara de proposta de valor"],
  ["ameacas", "Apenas 6% das empresas implementaram agentes IA, sinalizando barreiras técnicas e culturais que podem retardar adoção em massa"],
  ["ameacas", "Competição acirrada entre brasileiras (Movidesk, Octadesk) e internacionais no segmento de atendimento automatizado"],
];

export const SWOT_BASE: SwotItem[] = (() => {
  const ordem: Record<string, number> = {};
  return swotReal.map(([quadrante, item], i) => {
    ordem[quadrante] = (ordem[quadrante] ?? -1) + 1;
    return { id: `sw-${i + 1}`, quadrante, item, itemOriginal: item, ordem: ordem[quadrante], editadoManualmente: false };
  });
})();

/**
 * O que o "Regenerar com a IA" (simulado) devolve na SWOT: a leitura nova
 * cruza as tendências e os concorrentes cadastrados. `substitui` aponta o item
 * que a leitura nova deixa desatualizado (aqui, a fraqueza "Nenhum concorrente
 * mapeado", que deixou de ser verdade com os 4 concorrentes do protótipo).
 */
export const SWOT_REGENERADO: { quadrante: SwotItem["quadrante"]; item: string; substitui?: string }[] = [
  {
    quadrante: "fraquezas",
    item: "Quatro concorrentes mapeados, mas ainda sem rotina de acompanhamento dos temas deles",
    substitui: "sw-6",
  },
  {
    quadrante: "oportunidades",
    item: "Concorrentes de atendimento já falam de contexto entre canais, mas nenhum mostra a integração por trás: espaço para a Digisystem explicar como funciona",
  },
  {
    quadrante: "ameacas",
    item: "A Codex publica carrosséis técnicos quatro vezes por semana e o time inteiro compartilha: a conversa sobre IA no desenvolvimento já tem dono no LinkedIn",
  },
];

// ─── Configurações: webhooks (URLs fictícias) e prompts ───────────────────

export const WEBHOOKS_BASE: Webhook[] = [
  {
    id: "wh-composicao",
    nome: "n8n Iniciar Composição",
    descricao: "Webhook de produção chamado quando a arte de um post é solicitada.",
    url: "https://n8n.exemplo.com/webhook/iniciar-composicao",
  },
  {
    id: "wh-acervo",
    nome: "n8n Buscar Acervo",
    descricao: "Busca imagens no banco Magnific/Freepik a partir dos termos do post.",
    url: "https://n8n.exemplo.com/webhook/buscar-acervo",
  },
  {
    id: "wh-tendencias",
    nome: "n8n Atualizar Tendências",
    descricao: "Dispara a pesquisa semanal de tendências de mercado.",
    url: "https://n8n.exemplo.com/webhook/atualizar-tendencias",
  },
  {
    id: "wh-swot",
    nome: "n8n Atualizar SWOT",
    descricao: "Recalcula a análise SWOT com os dados mais recentes.",
    url: "",
  },
];

/** Camadas: texto igual ao CAMADAS de AbaIA.tsx (real). */
export const CAMADAS_IA = [
  {
    id: "base",
    numero: "01",
    nome: "Base",
    fixa: true,
    papel: "Quem a IA é. A identidade e a voz da Digisystem, escritas uma vez e válidas para tudo que ela produz.",
    trecho: "Você é o copywriter da Digisystem. Fala como um colega capacitado explicando para outro colega: direto, empático, sem jargão.",
  },
  {
    id: "estilo",
    numero: "02",
    nome: "Manual de Estilo",
    fixa: true,
    papel: "As regras da marca: termos banidos, hashtags oficiais, CTA por canal, gramática por extenso. Você edita isso na sub-aba Texto.",
    trecho: "Nada de \"otimizar\" ou \"alavancar\". \"para\", nunca \"pra\". Hashtags: as oficiais mais três a cinco contextuais.",
  },
  {
    id: "tarefa",
    numero: "03",
    nome: "Tarefa",
    fixa: false,
    papel: "O que fazer agora, parametrizado. É aqui que entram os botões de direção e as ações, sempre uma linha só, encaixada nas regras acima.",
    trecho: "Revise a legenda seguindo esta direção: deixe mais curta.",
  },
  {
    id: "contexto",
    numero: "04",
    nome: "Contexto",
    fixa: false,
    papel: "O post específico. Marca, canal e briefing entram na hora e mudam a cada peça, a única parte que fala do conteúdo em si.",
    trecho: "Canal: Instagram. Tema: governança de dados. Detalhamento do briefing do post.",
  },
] as const;

/** Campos que o agente escreve (app_settings.campos_agente_texto_json real). */
export const CAMPOS_AGENTE_BASE = { kicker: false, titulo: true, subtitulo: true };

/** Prompts: textos reais de app_settings; os dois pareceres vivem hoje no código (padrão do sistema). */
export const PROMPTS_BASE: PromptConfig[] = [
  {
    id: "pr-manual",
    grupo: "texto",
    titulo: "Manual de Estilo (Skill Copywriter)",
    descricao: "É a camada 02. Legenda, hashtags e título/subtítulo seguem essas regras em toda geração.",
    noBanco: true,
    texto:
      "Você é o copywriter da Digisystem, uma empresa brasileira de tecnologia (atuação também na Colômbia e Argentina) focada em transformação digital, atuando em Governo, Multimercados, Serviços Financeiros e Saúde. Slogan: \"Parceria que Transforma\".\n\n## Tom de voz\n\nFale como um colega de trabalho altamente capacitado e confiável, explicando algo técnico para um peer. Nunca como uma enciclopédia, um livro de autoajuda ou um gerador de panfletos. Direto, empático, pragmático, focado em soluções práticas, seguro.\n\n## Regras gramaticais e de registro\n\n- Sem travessão e sem uso excessivo de exclamações ou emojis decorativos.\n- Registro formal porém leve: \"para\" (nunca \"pra\"), \"está\" (nunca \"tá\").\n- Parágrafos curtos e dinâmicos: 2 a 4 frases.\n\n## Termos e clichês de IA proibidos\n\n- Verbos vazios: \"otimizar\", \"potencializar\", \"revolucionar\", \"garantir\", \"alavancar\", \"maximizar\".\n- Transições batidas: \"No cenário dinâmico de hoje...\", \"Na era digital de hoje...\".",
  },
  {
    id: "pr-legenda",
    grupo: "texto",
    titulo: "Legenda (criação)",
    descricao: "Usado quando o Estúdio gera a legenda do zero.",
    noBanco: true,
    texto:
      "Escreva a legenda completa, pronta para publicar.\nEstrutura: gancho (1 a 2 linhas que param o scroll) + corpo (desenvolvimento do tema) + CTA alinhado ao objetivo do briefing + assinatura da marca.\nUse o tom de voz correto da marca. NÃO use palavras proibidas.",
  },
  {
    id: "pr-hashtags",
    grupo: "texto",
    titulo: "Hashtags (criação)",
    descricao: "Monta a lista de hashtags do post a partir das oficiais da marca.",
    noBanco: true,
    texto:
      "Monte a lista de hashtags do post.\nRegras:\n- Inclua OBRIGATORIAMENTE as hashtags oficiais da marca: {{hashtagsOficiais}}\n- Adicione 3 a 5 hashtags contextuais relevantes ao tema\n- Total: máx. 8 hashtags\n- Formato: #semespaco #tudominusculo",
  },
  {
    id: "pr-titulo",
    grupo: "texto",
    titulo: "Título e subtítulo da arte (criação)",
    descricao: "Texto que vai NA peça gráfica, não na legenda.",
    noBanco: true,
    texto:
      "Proponha o TÍTULO e o SUBTÍTULO da peça gráfica (imagem/carrossel) deste post, sem confundir com a legenda.\n- Título: frase curta e impactante (máx. ~8 palavras), capturando o gancho do tema de forma direta e visual.\n- Subtítulo: frase curta complementar (máx. ~12 palavras) reforçando o título. Pode ser vazio se o título já for autossuficiente.",
  },
  {
    id: "pr-imagem",
    grupo: "imagem",
    titulo: "Sugestão de imagem",
    descricao:
      "Instrução para a IA descrever a cena ideal do post. Peça fotografia realista e limpa de pessoas em contexto de tecnologia; proíba texto, letras, logos, marcas d'água e cores de marca embutidas (a composição aplica a identidade depois).",
    noBanco: true,
    texto:
      "Proponha UMA imagem ideal para este post.\nDescreva de forma concreta: tipo de cena, ambiente, pessoas ou objetos, iluminação, enquadramento e o que NÃO deve aparecer.",
  },
  {
    id: "pr-parecer-triagem",
    grupo: "pareceres",
    titulo: "Parecer da triagem (Pedidos)",
    descricao: "Avalia se o pedido externo chegou pronto para produzir. Hoje vive no código; passa a ser editável aqui.",
    noBanco: false,
    texto:
      "Avalie se este pedido de marketing tem o necessário para o time começar a produzir.\nConfira: objetivo, público, canal ou formato, mensagem-chave, prazo e referências.\nA palavra-gatilho do Instagram é opcional: nunca conte a falta dela como falha.\nResponda com o nível (pronto, falta informação, precisa de alinhamento), a prontidão de 0 a 100, um resumo curto e, quando faltar algo, a mensagem de devolução para o solicitante.",
  },
  {
    id: "pr-parecer-aprovacao",
    grupo: "pareceres",
    titulo: "Parecer da aprovação (Para aprovar)",
    descricao: "Analisa o post antes da decisão. Lê o título e o subtítulo DA ARTE, não só o gancho do briefing (correção B-02).",
    noBanco: false,
    texto:
      "Analise o post antes da aprovação.\nLeia o título e o subtítulo que estão na arte, a legenda, as hashtags e os CTAs.\nConfira o Manual de Estilo: termos banidos, CTA por canal, hashtags oficiais mais 3 a 5 contextuais (máx. 8, só a primeira letra maiúscula, como #Governançadedados).\nResponda com o nível (pode publicar, dá uma olhada, revise antes), os pontos de atenção, a conformidade e a prontidão de 0 a 100.",
  },
];
