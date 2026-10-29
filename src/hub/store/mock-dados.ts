/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: banco do Lovable (SELECT em tasks, posts, trends, brand_kit, swot,
 *   app_settings) + src/lib/hub-meta.ts @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Dados de exemplo do hub-novo. Tudo em memória, com datas RELATIVAS ao "hoje"
 * recebido (o painel de demo pode avançar o dia). Nomes de pessoas fictícios,
 * e-mails no domínio exemplo.com, nenhum dado sensível.
 *
 * Títulos, descrições e metadados partem do banco real (tasks/posts/trends), sem
 * os prefixos [TESTE]/[VALIDAÇÃO]. Mapa dos roteiros do plano (seção 5):
 *  R1  tendência "Não transfira o cliente, transfira o contexto" é o destaque
 *      (Alto, nova, mais recente). Cards em A fazer servem de destino.
 *  R2  card "Série LinkedIn: integração de sistemas": 3 subtarefas com post
 *      (2 aprovados, 1 enviado). Reprovar o enviado → alerta; publicar os 2 → Problemas.
 *  R3  Recebidos: "case de observabilidade" (aprovar), "Campanha nova" (devolver,
 *      com tipoAcao em texto solto, B-06), "Vídeo de boas-vindas" (negar).
 *  R4  posts soltos de Ana em Meus posts (sem card) e cards em A fazer para associar.
 *  R5  Ana (Marketing) tem reprovado para ajustar, tarefa atrasada e post para
 *      publicar hoje. Marina (Aprovador) tem fila em Para aprovar.
 */
import { arteExemplo } from "./mock-arte";
import {
  CAMPOS_AGENTE_BASE,
  CONCORRENTES_BASE,
  MARCA,
  PROMPTS_BASE,
  SWOT_BASE,
  T,
  TENDENCIAS_BASE,
  WEBHOOKS_BASE,
} from "./mock-referencia";
import type {
  Card,
  Comentario,
  DadosHub,
  DecisaoPedido,
  Etiqueta,
  Historico,
  Papel,
  Post,
  Problema,
  RegistroEntrega,
  RegistroPedido,
  RegistroProblema,
  Solicitante,
  Subtarefa,
  Usuario,
} from "./tipos";

// ─── Datas relativas ──────────────────────────────────────────────────────

/** YYYY-MM-DD do dia `offset` em relação a `base` (fuso local). */
export function isoDia(base: Date, offset = 0): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Instante ISO do dia `offset`, na hora indicada (fuso local). */
export function isoHora(base: Date, offset = 0, hora = 10, minuto = 0): string {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset, hora, minuto).toISOString();
}

// ─── Pessoas ─────────────────────────────────────────────────────────────

/** Quem o painel de demo usa para cada "Entrar como". */
export const PERSONAS_DEMO: Record<Papel, string> = {
  marketing: "u-ana",
  aprovador: "u-marina",
  admin: "u-paulo",
};

function usuarios(h: Date): Usuario[] {
  return [
    { id: "u-ana", nome: "Ana Ribeiro", iniciais: "AR", papel: "marketing", cargo: "Analista de conteúdo", email: "ana.ribeiro@exemplo.com", ativo: true, ultimoAcesso: isoHora(h, 0, 8, 40), criadoEm: isoHora(h, -210) },
    { id: "u-fernando", nome: "Fernando Lima", iniciais: "FL", papel: "marketing", cargo: "Redator", email: "fernando.lima@exemplo.com", ativo: true, ultimoAcesso: isoHora(h, 0, 9, 5), criadoEm: isoHora(h, -190) },
    { id: "u-julia", nome: "Júlia Prado", iniciais: "JP", papel: "marketing", cargo: "Designer", email: "julia.prado@exemplo.com", ativo: true, ultimoAcesso: isoHora(h, -1, 17, 20), criadoEm: isoHora(h, -150) },
    { id: "u-marina", nome: "Marina Costa", iniciais: "MC", papel: "aprovador", cargo: "Coordenadora de marketing", email: "marina.costa@exemplo.com", ativo: true, ultimoAcesso: isoHora(h, 0, 8, 15), criadoEm: isoHora(h, -240) },
    { id: "u-rafael", nome: "Rafael Souza", iniciais: "RS", papel: "aprovador", cargo: "Gerente de comunicação", email: "rafael.souza@exemplo.com", ativo: false, criadoEm: isoHora(h, -3) },
    { id: "u-paulo", nome: "Paulo Mendes", iniciais: "PM", papel: "admin", cargo: "Head de marketing", email: "paulo.mendes@exemplo.com", ativo: true, ultimoAcesso: isoHora(h, -2, 11, 0), criadoEm: isoHora(h, -260) },
  ];
}

const SOLICITANTES: Solicitante[] = [
  { id: "s-carla", nome: "Carla Nunes", area: "Comercial" },
  { id: "s-diego", nome: "Diego Alves", area: "Recursos Humanos" },
  { id: "s-beatriz", nome: "Beatriz Rocha", area: "Produto" },
  { id: "s-otavio", nome: "Otávio Ramos", area: "Financeiro" },
  /** Pedido aberto por alguém do time: aciona a trava de autoria quando se entra como Admin. */
  { id: "s-paulo", nome: "Paulo Mendes", area: "Marketing", usuarioId: "u-paulo" },
];

// ─── Etiquetas (Configurações → Etiquetas) ───────────────────────────────

/** Cores dentro da paleta oficial e de tons dela. */
const ETIQUETAS: Etiqueta[] = [
  { id: "e-post", nome: "Post", cor: "#ff6d2d", arquivada: false },
  { id: "e-tendencia", nome: "Tendência", cor: "#67cfee", arquivada: false },
  { id: "e-campanha", nome: "Campanha", cor: "#36499b", arquivada: false },
  { id: "e-evento", nome: "Evento", cor: "#2a397a", arquivada: false },
  { id: "e-folder", nome: "Folder", cor: "#9aa6d6", arquivada: false },
  { id: "e-video", nome: "Vídeo", cor: "#ff9a6b", arquivada: false },
  { id: "e-newsletter", nome: "Newsletter", cor: "#2aa6cc", arquivada: false },
  { id: "e-webinar", nome: "Webinar", cor: "#dadada", arquivada: true },
];

// ─── Dados de exemplo ────────────────────────────────────────────────────

export function criarDadosExemplo(hoje: Date = new Date()): DadosHub {
  const h = hoje;
  const dia = (o: number) => isoDia(h, o);
  const hora = (o: number, hh = 10, mm = 0) => isoHora(h, o, hh, mm);

  // ── Cards ──────────────────────────────────────────────────────────────
  const cards: Card[] = [
    // Recebidos (só pedido externo)
    {
      id: "c-ped-obs",
      titulo: "Post: case de observabilidade no varejo",
      descricao:
        "Queremos um post no LinkedIn mostrando como reduzimos o tempo de resposta a incidentes de um cliente do varejo de 40 para 8 minutos com observabilidade. Gancho: o custo invisível de descobrir o problema pelo cliente antes da equipe.",
      etiquetas: [],
      prazo: dia(6),
      origem: "pedido",
      colunaBase: "afazer",
      criadoPor: "s-carla",
      criadoEm: hora(-1, 15, 20),
      pedido: {
        solicitanteId: "s-carla",
        categoria: "post",
        estado: "recebido",
        recebidoEm: hora(-1, 15, 20),
        meta: {
          tipoPedido: "post",
          objetivos: ["Autoridade", "Geração de leads"],
          plataformas: ["LinkedIn", "Instagram"],
          publico: "Gerentes de TI e CTOs de redes de varejo com operação 24/7",
          mensagemChave: "Quem enxerga a infraestrutura em tempo real resolve antes do cliente reclamar",
          referencias: "Case do cliente varejista apresentado no último webinar",
          cta: "Fale com um especialista",
          anexos: [{ nome: "case-varejo-observabilidade.pdf", tipo: "application/pdf", tamanho: 842_000 }],
        },
        parecer: {
          nivel: "verde",
          prontidao: 86,
          titulo: "Pronto para produzir",
          resumo:
            "O pedido traz público, mensagem-chave e um case concreto como referência. Dá para começar o post sem voltar ao solicitante.",
          pontos: [
            "Público e mensagem-chave bem definidos.",
            "Referência concreta: o case apresentado no último webinar, com o PDF anexado.",
            "A palavra-gatilho do Instagram não foi informada. É opcional.",
          ],
        },
      },
    },
    {
      id: "c-ped-campanha",
      titulo: "Campanha nova para divulgar a empresa",
      descricao: "Precisamos de algo para divulgar a empresa.",
      etiquetas: [],
      origem: "pedido",
      colunaBase: "afazer",
      criadoPor: "s-diego",
      criadoEm: hora(-3, 11, 0),
      pedido: {
        solicitanteId: "s-diego",
        categoria: "acao",
        estado: "triagem",
        recebidoEm: hora(-3, 11, 0),
        triagemPor: "u-fernando",
        triagemEm: hora(-2, 9, 30),
        meta: {
          tipoPedido: "acao",
          objetivos: [],
          publico: "vários",
          quantidade: "o de sempre",
          tipoAcao: "a definir",
          dependeFornecedor: true,
        },
        parecer: {
          nivel: "vermelho",
          prontidao: 28,
          titulo: "Precisa de alinhamento",
          resumo:
            "O pedido não diz o que divulgar, para quem nem em qual formato. Sem isso, o time não consegue estimar o trabalho.",
          pontos: [
            "Nenhum objetivo marcado.",
            "Público genérico: \"vários\".",
            "Tipo de ação \"a definir\" e quantidade \"o de sempre\".",
          ],
          sugestaoDevolucao:
            "Conte o que você quer divulgar, para qual público e em qual canal. Se houver uma data ou um evento ligado ao pedido, informe também.",
        },
      },
    },
    {
      id: "c-ped-video",
      titulo: "Vídeo de boas-vindas para novos colaboradores",
      descricao:
        "Um vídeo curto para passar no primeiro dia de quem entra na empresa, apresentando a história da Digisystem e as áreas.",
      etiquetas: [],
      prazo: dia(20),
      origem: "pedido",
      colunaBase: "afazer",
      criadoPor: "s-diego",
      criadoEm: hora(0, 8, 10),
      pedido: {
        solicitanteId: "s-diego",
        categoria: "acao",
        estado: "recebido",
        recebidoEm: hora(0, 8, 10),
        meta: {
          tipoPedido: "acao",
          objetivos: ["Integração de novos colaboradores"],
          tipoAcao: ["Vídeo"],
          duracao: "Até 2 minutos",
          publico: "Novos colaboradores",
          aprovacao: "Diretoria de RH",
        },
        parecer: {
          nivel: "ambar",
          prontidao: 52,
          titulo: "Falta informação",
          resumo: "Tem formato, duração e público, mas não diz onde o vídeo vai passar nem se já existe roteiro.",
          pontos: [
            "Formato e duração definidos.",
            "Não informa o canal de exibição (integração presencial, intranet ou e-mail).",
            "Sem referência de roteiro ou de vídeos anteriores.",
          ],
          sugestaoDevolucao: "Onde o vídeo vai ser exibido? Há algum roteiro ou vídeo anterior que sirva de referência?",
        },
      },
    },
    {
      id: "c-ped-webinar",
      titulo: "Webinar com parceiro de integração",
      descricao:
        "Divulgação do webinar conjunto com o parceiro de integração, com post de convite e lembrete no dia.",
      etiquetas: [],
      prazo: dia(12),
      origem: "pedido",
      colunaBase: "afazer",
      criadoPor: "s-paulo",
      criadoEm: hora(-1, 10, 0),
      pedido: {
        solicitanteId: "s-paulo",
        categoria: "post",
        estado: "recebido",
        recebidoEm: hora(-1, 10, 0),
        meta: {
          tipoPedido: "post",
          objetivos: ["Inscrições no webinar"],
          plataformas: ["LinkedIn"],
          publico: "Arquitetos de software e líderes de TI",
          mensagemChave: "Integração bem feita reduz retrabalho entre áreas e acelera decisões",
          cta: "Inscreva-se pelo link",
          dataEvento: dia(15),
        },
        parecer: {
          nivel: "verde",
          prontidao: 78,
          titulo: "Pronto para produzir",
          resumo: "Público, mensagem e data do evento estão claros. Falta só o link de inscrição, que pode vir depois.",
          pontos: ["Data do evento informada.", "Mensagem-chave alinhada ao segmento de Integração.", "Link de inscrição ainda não enviado."],
        },
      },
    },

    // A fazer
    {
      id: "c-tend-chatbot",
      titulo: "Produzir: IA contextual: o que separa um chatbot útil de um chatbot frustrante",
      descricao:
        "Carrossel comparando o chatbot tradicional com a IA contextual, com exemplos reais de quando a tecnologia resolve ou frustra o cliente.",
      etiquetas: ["e-tendencia", "e-post"],
      responsavelId: "u-fernando",
      prazo: dia(5),
      origem: "tendencia",
      trendId: T.whatsapp,
      colunaBase: "afazer",
      criadoPor: "u-fernando",
      criadoEm: hora(-4, 14, 0),
    },
    {
      id: "c-ped-tasy",
      titulo: "Post sobre o novo case Tasy",
      descricao: "Post para o LinkedIn sobre a migração de versão do Tasy no hospital parceiro, sem parar o atendimento.",
      etiquetas: ["e-post"],
      responsavelId: "u-ana",
      prazo: dia(3),
      origem: "pedido",
      colunaBase: "afazer",
      criadoPor: "s-beatriz",
      criadoEm: hora(-6, 9, 0),
      pedido: {
        solicitanteId: "s-beatriz",
        categoria: "post",
        estado: "aprovado",
        recebidoEm: hora(-6, 9, 0),
        triagemPor: "u-paulo",
        triagemEm: hora(-5, 10, 0),
        meta: {
          tipoPedido: "post",
          objetivos: ["Autoridade"],
          plataformas: ["LinkedIn"],
          publico: "Gestores de hospitais que usam Tasy",
          mensagemChave: "Migração de versão do Tasy sem parar o atendimento",
        },
        parecer: {
          nivel: "verde",
          prontidao: 81,
          titulo: "Pronto para produzir",
          resumo: "Pedido objetivo, com público e mensagem claros.",
          pontos: ["Público e canal definidos.", "Mensagem-chave forte para o segmento de Saúde."],
        },
      },
    },
    {
      id: "c-newsletter",
      titulo: "Newsletter DigiNEWS de outubro",
      descricao: "Edição mensal para clientes e parceiros, com quatro matérias e a agenda de eventos.",
      etiquetas: ["e-newsletter"],
      responsavelId: "u-julia",
      inicio: dia(-3),
      prazo: dia(9),
      origem: "manual",
      colunaBase: "afazer",
      criadoPor: "u-marina",
      criadoEm: hora(-5, 16, 0),
    },
    {
      id: "c-roteiro-reels",
      titulo: "Roteiro do Reels de bastidores do projeto Alfa",
      descricao: "Roteiro de 30 segundos mostrando o dia a dia do time no projeto Alfa.",
      etiquetas: ["e-video"],
      responsavelId: "u-ana",
      prazo: dia(-1),
      origem: "manual",
      colunaBase: "afazer",
      criadoPor: "u-ana",
      criadoEm: hora(-9, 10, 0),
    },
    {
      id: "c-concorrentes",
      titulo: "Pesquisa de concorrentes do quarto trimestre",
      descricao: "Atualizar os temas e a frequência de publicação dos concorrentes monitorados.",
      etiquetas: [],
      prazo: dia(-2),
      origem: "manual",
      colunaBase: "afazer",
      criadoPor: "u-paulo",
      criadoEm: hora(-12, 9, 0),
    },

    // Em andamento
    {
      id: "c-websummit",
      titulo: "Campanha Web Summit",
      descricao: "Material para levar ao Web Summit no fim do mês: folder do estande e posts de anúncio e cobertura.",
      etiquetas: ["e-campanha", "e-evento"],
      responsavelId: "u-ana",
      inicio: dia(-10),
      prazo: dia(10),
      origem: "pedido",
      colunaBase: "andamento",
      criadoPor: "s-carla",
      criadoEm: hora(-13, 11, 0),
      pedido: {
        solicitanteId: "s-carla",
        categoria: "acao",
        estado: "aprovado",
        recebidoEm: hora(-13, 11, 0),
        triagemPor: "u-fernando",
        triagemEm: hora(-12, 9, 0),
        meta: {
          tipoPedido: "acao",
          objetivos: ["Awareness"],
          tipoAcao: ["Folder"],
          formato: "Folder impresso A5",
          dependeFornecedor: true,
          dataEvento: dia(14),
        },
        parecer: {
          nivel: "verde",
          prontidao: 74,
          titulo: "Pronto para produzir",
          resumo: "Formato e data do evento claros. A gráfica precisa entrar no prazo.",
          pontos: ["Formato definido: folder A5.", "Depende de fornecedor: reservar a gráfica com antecedência."],
        },
      },
    },
    {
      id: "c-serie-integracao",
      titulo: "Série LinkedIn: integração de sistemas",
      descricao: "Três posts sobre o custo de sistemas que não conversam, para o segmento de Integração.",
      etiquetas: ["e-post", "e-campanha"],
      responsavelId: "u-ana",
      inicio: dia(-8),
      prazo: dia(7),
      origem: "manual",
      colunaBase: "andamento",
      criadoPor: "u-ana",
      criadoEm: hora(-9, 15, 0),
    },
    {
      id: "c-saude-ia",
      titulo: "Carrossel: IA como infraestrutura na saúde",
      descricao: "Da tendência \"IA virou infraestrutura crítica na saúde\".",
      etiquetas: ["e-tendencia", "e-post"],
      responsavelId: "u-marina",
      prazo: dia(4),
      origem: "tendencia",
      trendId: T.iaSaude,
      colunaBase: "andamento",
      criadoPor: "u-marina",
      criadoEm: hora(-5, 10, 0),
    },
    {
      id: "c-atend-opiniao",
      titulo: "Post de opinião: chatbot não é estratégia de atendimento",
      descricao: "Da tendência \"88% adotaram IA no atendimento, mas só 25% integraram\".",
      etiquetas: ["e-tendencia"],
      responsavelId: "u-fernando",
      prazo: dia(8),
      origem: "tendencia",
      trendId: T.iaAtendimento,
      colunaBase: "andamento",
      criadoPor: "u-fernando",
      criadoEm: hora(-3, 14, 0),
    },
    {
      id: "c-depoimento",
      titulo: "Post depoimento do cliente Beta",
      descricao: "Depoimento em vídeo curto transformado em post estático com a fala do cliente.",
      etiquetas: ["e-post"],
      responsavelId: "u-fernando",
      prazo: dia(-1),
      origem: "manual",
      colunaBase: "andamento",
      criadoPor: "u-fernando",
      criadoEm: hora(-11, 10, 0),
    },
    {
      id: "c-dia-cliente",
      titulo: "Post do Dia do Cliente",
      descricao: "Agradecimento aos clientes, com a arte comemorativa da marca.",
      etiquetas: ["e-post"],
      responsavelId: "u-julia",
      prazo: dia(12),
      origem: "manual",
      colunaBase: "andamento",
      criadoPor: "u-julia",
      criadoEm: hora(-6, 13, 0),
    },

    // Problemas (calculado): um de cada tipo
    {
      id: "c-ped-folder-saude",
      titulo: "Folder para o congresso de saúde",
      descricao: "Folder institucional para distribuir no estande do congresso.",
      etiquetas: [],
      prazo: dia(15),
      origem: "pedido",
      colunaBase: "afazer",
      criadoPor: "s-beatriz",
      criadoEm: hora(-4, 16, 0),
      pedido: {
        solicitanteId: "s-beatriz",
        categoria: "acao",
        estado: "devolvido",
        recebidoEm: hora(-4, 16, 0),
        triagemPor: "u-fernando",
        triagemEm: hora(-3, 9, 0),
        meta: {
          tipoPedido: "acao",
          objetivos: ["Engajar clientes"],
          tipoAcao: ["Folder / impresso"],
        },
        parecer: {
          nivel: "ambar",
          prontidao: 41,
          titulo: "Falta informação",
          resumo: "O pedido diz o formato, mas não traz a data do evento nem a quantidade de impressos.",
          pontos: ["Formato definido.", "Sem data do evento.", "Sem quantidade nem orçamento."],
          sugestaoDevolucao: "Informe a data do congresso, a quantidade de folders e se já existe orçamento aprovado.",
        },
      },
    },
    {
      id: "c-video-institucional",
      titulo: "Vídeo institucional da área de Saúde",
      descricao: "Vídeo de 1 minuto gravado no hospital parceiro, mostrando o suporte residente.",
      etiquetas: ["e-video"],
      responsavelId: "u-julia",
      inicio: dia(-7),
      prazo: dia(6),
      origem: "manual",
      colunaBase: "andamento",
      criadoPor: "u-marina",
      criadoEm: hora(-8, 9, 0),
    },
    {
      id: "c-linkedin-alcance",
      titulo: "Post: por que seu alcance caiu",
      descricao: "Da tendência \"LinkedIn agora privilegia relevância, não alcance\".",
      etiquetas: ["e-tendencia", "e-post"],
      responsavelId: "u-fernando",
      prazo: dia(2),
      origem: "tendencia",
      trendId: T.algoritmo,
      colunaBase: "andamento",
      criadoPor: "u-fernando",
      criadoEm: hora(-7, 11, 0),
    },

    // Concluído (calculado)
    {
      id: "c-maturidade",
      titulo: "Carrossel: os três níveis de maturidade em automação",
      descricao: "Da tendência \"78% automatizaram, mas poucos conectaram tudo\". Dois posts: o dado e o framework.",
      etiquetas: ["e-tendencia", "e-post"],
      responsavelId: "u-ana",
      inicio: dia(-13),
      prazo: dia(-3),
      origem: "tendencia",
      trendId: T.maturidade,
      colunaBase: "andamento",
      criadoPor: "u-ana",
      criadoEm: hora(-13, 10, 0),
    },
    {
      id: "c-artigo",
      titulo: "Artigo LinkedIn: o custo invisível do retrabalho",
      descricao: "Artigo longo para a página da empresa.",
      etiquetas: ["e-post"],
      responsavelId: "u-ana",
      prazo: dia(-8),
      origem: "manual",
      colunaBase: "andamento",
      criadoPor: "u-ana",
      criadoEm: hora(-16, 10, 0),
    },
    {
      id: "c-banner",
      titulo: "Banner do evento setorial",
      descricao: "Banner 2 x 1 m para o estande do evento setorial.",
      etiquetas: ["e-evento"],
      responsavelId: "u-julia",
      inicio: dia(-12),
      prazo: dia(-6),
      origem: "manual",
      colunaBase: "andamento",
      criadoPor: "u-marina",
      criadoEm: hora(-14, 9, 0),
    },
    {
      id: "c-calendario",
      titulo: "Calendário editorial de outubro aprovado",
      descricao: "Pauta do mês validada com a coordenação.",
      etiquetas: [],
      responsavelId: "u-marina",
      prazo: dia(-5),
      origem: "manual",
      colunaBase: "andamento",
      concluidoManualEm: hora(-5, 17, 0),
      criadoPor: "u-marina",
      criadoEm: hora(-10, 9, 0),
    },

    // Fora do Quadro: negado (fica no histórico de decisões da aba Pedidos)
    {
      id: "c-ped-brindes",
      titulo: "Brindes com a marca para o fim de ano",
      descricao: "Canecas e cadernos com a marca para os clientes do Comercial.",
      etiquetas: [],
      origem: "pedido",
      colunaBase: "afazer",
      criadoPor: "s-otavio",
      criadoEm: hora(-8, 14, 0),
      pedido: {
        solicitanteId: "s-otavio",
        categoria: "acao",
        estado: "negado",
        recebidoEm: hora(-8, 14, 0),
        triagemPor: "u-fernando",
        triagemEm: hora(-7, 9, 0),
        meta: { tipoPedido: "acao", objetivos: ["Relacionamento"], tipoAcao: ["Brindes"], quantidade: "200 kits" },
        parecer: {
          nivel: "ambar",
          prontidao: 55,
          titulo: "Falta informação",
          resumo: "Quantidade definida, mas sem orçamento nem fornecedor.",
          pontos: ["Quantidade: 200 kits.", "Sem orçamento informado."],
        },
      },
    },
  ];

  // ── Subtarefas (até 3 níveis) ──────────────────────────────────────────
  const sub = (s: Omit<Subtarefa, "criadoEm"> & { criadoEm?: string }): Subtarefa => ({ criadoEm: hora(-8), ...s });
  const subtarefas: Subtarefa[] = [
    // Web Summit (exemplo da proposta 4.2)
    sub({ id: "s-ws-folder", cardId: "c-websummit", titulo: "Folder do estande", responsavelId: "u-ana", prazo: dia(6), ordem: 0 }),
    sub({ id: "s-ws-folder-texto", cardId: "c-websummit", parentId: "s-ws-folder", titulo: "Texto do folder", responsavelId: "u-ana", prazo: dia(-1), concluidaEm: hora(-2, 16, 0), ordem: 0 }),
    sub({ id: "s-ws-folder-arte", cardId: "c-websummit", parentId: "s-ws-folder", titulo: "Arte final", responsavelId: "u-julia", prazo: dia(4), ordem: 1 }),
    sub({ id: "s-ws-anuncio", cardId: "c-websummit", titulo: "Post de anúncio", responsavelId: "u-fernando", prazo: dia(4), ordem: 1 }),
    sub({ id: "s-ws-cobertura", cardId: "c-websummit", titulo: "Post de cobertura", responsavelId: "u-fernando", prazo: dia(11), ordem: 2 }),
    sub({ id: "s-ws-reels", cardId: "c-websummit", titulo: "Reels bastidores", responsavelId: "u-ana", prazo: dia(8), ordem: 3 }),
    // Série integração (R2)
    sub({ id: "s-si-1", cardId: "c-serie-integracao", titulo: "Post 1: o custo do retrabalho entre áreas", responsavelId: "u-ana", prazo: dia(0), ordem: 0 }),
    sub({ id: "s-si-2", cardId: "c-serie-integracao", titulo: "Post 2: integrar é decisão de gestão", responsavelId: "u-fernando", prazo: dia(2), ordem: 1 }),
    sub({ id: "s-si-3", cardId: "c-serie-integracao", titulo: "Post 3: os três níveis de maturidade", responsavelId: "u-ana", prazo: dia(5), ordem: 2 }),
    // Newsletter (sem post)
    sub({ id: "s-nl-1", cardId: "c-newsletter", titulo: "Selecionar as quatro matérias do mês", responsavelId: "u-julia", prazo: dia(-1), concluidaEm: hora(-1, 15, 0), ordem: 0 }),
    sub({ id: "s-nl-2", cardId: "c-newsletter", titulo: "Texto de abertura", responsavelId: "u-fernando", prazo: dia(4), ordem: 1 }),
    sub({ id: "s-nl-3", cardId: "c-newsletter", titulo: "Montar no e-mail marketing", responsavelId: "u-julia", prazo: dia(8), ordem: 2 }),
    // Vídeo institucional (card inteiro bloqueado)
    sub({ id: "s-vi-1", cardId: "c-video-institucional", titulo: "Roteiro aprovado com a área de Saúde", responsavelId: "u-julia", prazo: dia(-5), concluidaEm: hora(-5, 12, 0), ordem: 0 }),
    sub({ id: "s-vi-2", cardId: "c-video-institucional", titulo: "Gravação no hospital parceiro", responsavelId: "u-julia", prazo: dia(2), ordem: 1 }),
    // Maturidade (concluído, 2 posts publicados)
    sub({ id: "s-mat-1", cardId: "c-maturidade", titulo: "Post 1: o dado de 78%", responsavelId: "u-ana", prazo: dia(-7), ordem: 0, criadoEm: hora(-13) }),
    sub({ id: "s-mat-2", cardId: "c-maturidade", titulo: "Post 2: os três níveis", responsavelId: "u-fernando", prazo: dia(-3), ordem: 1, criadoEm: hora(-13) }),
    // Banner (concluído, sem post)
    sub({ id: "s-bn-1", cardId: "c-banner", titulo: "Arte do banner 2 x 1 m", responsavelId: "u-julia", prazo: dia(-8), concluidaEm: hora(-7, 11, 0), ordem: 0, criadoEm: hora(-12) }),
    sub({ id: "s-bn-2", cardId: "c-banner", titulo: "Enviar para a gráfica", responsavelId: "u-ana", prazo: dia(-6), concluidaEm: hora(-4, 10, 0), ordem: 1, criadoEm: hora(-12) }),
  ];

  // ── Posts ──────────────────────────────────────────────────────────────
  const oficiais = ["#Digisystem", "#Parceriaquetransforma", "#Tecnologia"];
  const post = (p: Omit<Post, "criadoEm" | "atualizadoEm" | "ctas" | "arteUrl"> & Partial<Pick<Post, "criadoEm" | "atualizadoEm" | "ctas" | "arteUrl">> & { fundo?: "azul" | "laranja" | "claro" | "branco" }): Post => {
    const { fundo = "azul", ...resto } = p;
    return {
      criadoEm: hora(-5),
      atualizadoEm: hora(-2),
      ctas: [],
      arteUrl: arteExemplo(fundo, p.tituloArte, p.subtituloArte),
      ...resto,
    };
  };

  const posts: Post[] = [
    // Web Summit
    post({
      id: "p-ws-anuncio",
      titulo: "Estaremos no Web Summit Rio",
      tituloArte: "Nos vemos no Web Summit",
      subtituloArte: "Estande da Digisystem no pavilhão 2",
      legenda:
        "A Digisystem vai estar no Web Summit Rio, e queremos conversar com você.\n\nNo nosso estande, o time de Integração mostra na prática como sistemas que conversam entre si mudam a rotina de quem decide. Passe no pavilhão 2 para um café e uma conversa sem roteiro.",
      hashtags: [...oficiais, "#Websummitrio", "#Integraçãodesistemas", "#Eventosdetecnologia"],
      redes: ["linkedin", "instagram"],
      ctas: [
        { texto: "Agende uma conversa no estande pelo link", plataformas: ["linkedin"] },
        { texto: "Comente \"ESTANDE\" para receber o mapa", plataformas: ["instagram"] },
      ],
      segmento: "Integração",
      formato: "Post",
      template: "A",
      estado: "aprovado",
      autorId: "u-fernando",
      dataSugerida: dia(4),
      dataPublicacao: dia(4),
      aprovadoEm: hora(-1, 16, 0),
      aprovadoPor: "u-marina",
      itemId: "s-ws-anuncio",
      criadoEm: hora(-6),
    }),
    post({
      id: "p-ws-cobertura",
      titulo: "Cobertura do primeiro dia de Web Summit",
      tituloArte: "O que vimos no primeiro dia",
      subtituloArte: "Três conversas que ficaram com o time",
      legenda: "Rascunho: preencher depois do evento com as três conversas mais marcantes do estande.",
      hashtags: [...oficiais, "#Websummitrio"],
      redes: ["linkedin"],
      segmento: "Integração",
      formato: "Carrossel",
      template: "C",
      estado: "rascunho",
      autorId: "u-fernando",
      itemId: "s-ws-cobertura",
      fundo: "claro",
    }),
    post({
      id: "p-ws-reels",
      titulo: "Bastidores da montagem do estande",
      tituloArte: "Montando o estande",
      subtituloArte: "Do caminhão ao primeiro café",
      legenda:
        "Como nasce um estande em 12 horas? Mostramos a montagem do começo ao fim, com o time que transforma um espaço vazio em ponto de encontro.",
      hashtags: [...oficiais, "#Bastidores", "#Websummitrio", "#Timedigisystem"],
      redes: ["instagram"],
      segmento: "Integração",
      formato: "Reels",
      template: "A",
      estado: "reprovado",
      autorId: "u-ana",
      dataSugerida: dia(8),
      motivoReprovacao:
        "O roteiro mostra o rosto de visitantes sem autorização. Trocar por cenas do time montando o estande.",
      itemId: "s-ws-reels",
      fundo: "laranja",
    }),

    // Série integração (R2)
    post({
      id: "p-si-1",
      titulo: "O custo do retrabalho entre áreas",
      tituloArte: "Retrabalho tem origem: sistemas isolados",
      subtituloArte: "Quando cada área tem sua fonte, alguém traduz à mão",
      legenda:
        "Retrabalho entre áreas quase sempre tem a mesma origem: sistemas que não conversam entre si.\n\nQuando cada departamento opera com a sua própria fonte de dados, as equipes gastam horas reconciliando informações que deveriam chegar prontas. Não é falta de esforço das pessoas. É arquitetura.",
      hashtags: [...oficiais, "#Integraçãodesistemas", "#Gestãodeti", "#Produtividade"],
      redes: ["linkedin"],
      ctas: [{ texto: "Fale com nossos especialistas pelo link", plataformas: ["linkedin"] }],
      segmento: "Integração",
      formato: "Post",
      template: "A",
      estado: "aprovado",
      autorId: "u-ana",
      dataSugerida: dia(0),
      dataPublicacao: dia(0),
      aprovadoEm: hora(-2, 11, 0),
      aprovadoPor: "u-marina",
      itemId: "s-si-1",
    }),
    post({
      id: "p-si-2",
      titulo: "Integrar é decisão de gestão",
      tituloArte: "Integração é decisão de gestão",
      subtituloArte: "Não só uma escolha técnica",
      legenda:
        "Integrar sistemas não é apenas uma decisão técnica. É uma decisão de gestão.\n\nQuando os dados fluem de forma consistente entre as áreas, a liderança decide com a mesma informação que a operação usa. E a reunião deixa de ser sobre qual planilha está certa.",
      hashtags: [...oficiais, "#Integraçãodesistemas", "#Gestão", "#Dados"],
      redes: ["linkedin"],
      ctas: [{ texto: "Fale com nossos especialistas pelo link", plataformas: ["linkedin"] }],
      segmento: "Integração",
      formato: "Post",
      template: "B",
      estado: "aprovado",
      autorId: "u-fernando",
      dataSugerida: dia(2),
      dataPublicacao: dia(2),
      aprovadoEm: hora(-1, 10, 0),
      aprovadoPor: "u-marina",
      itemId: "s-si-2",
      fundo: "branco",
    }),
    post({
      id: "p-si-3",
      titulo: "Os três níveis de maturidade em integração",
      tituloArte: "Em que nível sua integração está?",
      subtituloArte: "Tarefas isoladas, fluxos por área ou ecossistema",
      legenda:
        "Toda empresa integra alguma coisa. A diferença está no nível.\n\nNo primeiro, cada tarefa é automatizada sozinha. No segundo, os fluxos de uma área se conectam. No terceiro, os sistemas da empresa inteira trocam dados em tempo real. Em qual deles a sua operação está hoje?",
      hashtags: [...oficiais, "#Integraçãodesistemas", "#Maturidadedigital", "#Arquitetura"],
      redes: ["linkedin"],
      ctas: [{ texto: "Baixe o diagnóstico de maturidade pelo link", plataformas: ["linkedin"] }],
      segmento: "Integração",
      formato: "Carrossel",
      template: "C",
      estado: "enviado",
      autorId: "u-ana",
      dataSugerida: dia(5),
      observacao: "Os números do carrossel vêm da pesquisa interna de setembro.",
      itemId: "s-si-3",
      atualizadoEm: hora(-1, 9, 30),
      fundo: "laranja",
    }),

    // Card com post no próprio card
    post({
      id: "p-saude-ia",
      titulo: "IA virou infraestrutura crítica na saúde",
      tituloArte: "IA na saúde já é infraestrutura",
      subtituloArte: "Do piloto isolado à camada que sustenta o hospital",
      legenda:
        "IA na saúde não é mais projeto piloto. É infraestrutura.\n\nO que antes vivia em prova de conceito isolada hoje sustenta fluxos inteiros: transcrição automática de consultas, diagnóstico assistido por imagem, integração de dados clínicos entre sistemas que nunca conversaram.",
      hashtags: [...oficiais, "#Saúdedigital", "#Inteligênciaartificial", "#Healthtech"],
      redes: ["instagram", "linkedin"],
      ctas: [
        { texto: "Comente \"IA\" para receber o material completo", plataformas: ["instagram"] },
        { texto: "Leia o material completo pelo link", plataformas: ["linkedin"] },
      ],
      segmento: "Saúde",
      formato: "Carrossel",
      template: "C",
      estado: "enviado",
      autorId: "u-marina",
      dataSugerida: dia(3),
      emRevisaoPor: "u-paulo",
      itemId: "c-saude-ia",
      trendId: T.iaSaude,
      atualizadoEm: hora(-1, 14, 0),
    }),
    post({
      id: "p-alcance",
      titulo: "Por que seu alcance caiu, e por que isso é bom",
      tituloArte: "Seu alcance caiu. Comemore",
      subtituloArte: "O LinkedIn passou a premiar relevância",
      legenda:
        "O novo algoritmo do LinkedIn, chamado 360 Brew, reclassifica cada post a partir de sinais semânticos e de afinidade de rede, reduzindo a distribuição de conteúdo de baixa aderência...",
      hashtags: [...oficiais, "#Linkedin", "#Marketingb2b"],
      redes: ["linkedin"],
      segmento: "Desenvolvimento",
      formato: "Carrossel",
      template: "C",
      estado: "reprovado",
      autorId: "u-fernando",
      dataSugerida: dia(2),
      motivoReprovacao:
        "Texto técnico demais para gestores. Abrir com o dado de engajamento e cortar o parágrafo sobre o funcionamento do algoritmo.",
      itemId: "c-linkedin-alcance",
      trendId: T.algoritmo,
      fundo: "branco",
    }),
    post({
      id: "p-beta",
      titulo: "Depoimento do cliente Beta",
      tituloArte: "\"Paramos de apagar incêndio\"",
      subtituloArte: "Gestora de TI do cliente Beta",
      legenda:
        "Quando o suporte conhece a sua operação, a conversa muda de \"o que caiu\" para \"o que vamos melhorar\". Foi assim com o cliente Beta, que contou a experiência dos primeiros seis meses com o suporte residente.",
      hashtags: [...oficiais, "#Suporteresidente", "#Depoimento", "#Atendimento"],
      redes: ["linkedin", "facebook"],
      segmento: "Atendimento ao Cliente",
      formato: "Post",
      template: "B",
      estado: "aprovado",
      autorId: "u-fernando",
      dataSugerida: dia(-1),
      dataPublicacao: dia(-1),
      aprovadoEm: hora(-3, 15, 0),
      aprovadoPor: "u-marina",
      itemId: "c-depoimento",
      fundo: "claro",
    }),
    post({
      id: "p-dia-cliente",
      titulo: "Dia do Cliente",
      tituloArte: "Obrigado por transformar com a gente",
      subtituloArte: "Feliz Dia do Cliente",
      legenda:
        "Hoje é dia de agradecer a quem constrói com a Digisystem todos os dias. Cada projeto entregue tem a marca de uma parceria de verdade.",
      hashtags: [...oficiais, "#Diadocliente", "#Parceria"],
      redes: ["instagram", "linkedin", "facebook"],
      segmento: "Atendimento ao Cliente",
      formato: "Post",
      template: "A",
      estado: "aprovado",
      autorId: "u-julia",
      aprovadoEm: hora(-1, 17, 0),
      aprovadoPor: "u-marina",
      itemId: "c-dia-cliente",
      fundo: "laranja",
    }),

    // Publicados
    post({
      id: "p-mat-1",
      titulo: "78% automatizaram, mas poucos conectaram tudo",
      tituloArte: "78% automatizaram",
      subtituloArte: "Mas poucos conectaram faturamento, prontuário e gestão",
      legenda:
        "Três em cada quatro empresas já investiram em automação. Na saúde, o gargalo agora é outro: fazer o faturamento, o prontuário e a gestão clínica conversarem.",
      hashtags: [...oficiais, "#Saúdedigital", "#Interoperabilidade", "#Automação"],
      redes: ["linkedin"],
      segmento: "Saúde",
      formato: "Post",
      template: "A",
      estado: "publicado",
      autorId: "u-ana",
      dataSugerida: dia(-6),
      dataPublicacao: dia(-6),
      aprovadoEm: hora(-8, 10, 0),
      aprovadoPor: "u-marina",
      publicadoEm: hora(-6, 9, 0),
      itemId: "s-mat-1",
      trendId: T.maturidade,
      criadoEm: hora(-12),
    }),
    post({
      id: "p-mat-2",
      titulo: "Os três níveis de maturidade em automação na saúde",
      tituloArte: "Três níveis de maturidade",
      subtituloArte: "Tarefas isoladas, fluxos por área, ecossistema integrado",
      legenda:
        "Automatizar uma tarefa é o primeiro passo. O ganho real aparece quando os fluxos se conectam. Montamos um guia rápido para você descobrir em que nível o seu hospital está.",
      hashtags: [...oficiais, "#Saúdedigital", "#Interoperabilidade", "#Gestãohospitalar"],
      redes: ["instagram", "linkedin"],
      segmento: "Saúde",
      formato: "Carrossel",
      template: "C",
      estado: "publicado",
      autorId: "u-fernando",
      dataSugerida: dia(-3),
      dataPublicacao: dia(-3),
      aprovadoEm: hora(-5, 14, 0),
      aprovadoPor: "u-paulo",
      publicadoEm: hora(-3, 9, 30),
      itemId: "s-mat-2",
      trendId: T.maturidade,
      criadoEm: hora(-11),
      fundo: "claro",
    }),
    post({
      id: "p-artigo",
      titulo: "O custo invisível do retrabalho",
      tituloArte: "O custo invisível do retrabalho",
      subtituloArte: "Horas que ninguém mede, decisões que atrasam",
      legenda:
        "Ninguém coloca na planilha as horas gastas conferindo dado que veio de outro sistema. Mas elas existem, e cobram juros na forma de decisões atrasadas.",
      hashtags: [...oficiais, "#Integraçãodesistemas", "#Produtividade", "#Gestãodeti"],
      redes: ["linkedin"],
      segmento: "Integração",
      formato: "Artigo",
      template: "B",
      estado: "publicado",
      autorId: "u-ana",
      dataPublicacao: dia(-9),
      aprovadoEm: hora(-10, 11, 0),
      aprovadoPor: "u-marina",
      publicadoEm: hora(-9, 8, 30),
      itemId: "c-artigo",
      criadoEm: hora(-15),
      fundo: "branco",
    }),
    post({
      id: "p-legado-suporte",
      titulo: "Suporte residente: o técnico que conhece sua operação",
      tituloArte: "Quem conhece sua operação resolve antes",
      subtituloArte: "Suporte residente da Digisystem",
      legenda:
        "O suporte residente vive a rotina do cliente. Por isso enxerga o problema antes de ele virar chamado, e resolve com o contexto de quem está ali todos os dias.",
      hashtags: [...oficiais, "#Suporteresidente", "#Servicedesk", "#Atendimento"],
      redes: ["instagram", "facebook"],
      segmento: "Atendimento ao Cliente",
      formato: "Post",
      template: "A",
      estado: "publicado",
      autorId: "u-julia",
      dataPublicacao: dia(-20),
      aprovadoEm: hora(-22, 10, 0),
      aprovadoPor: "u-marina",
      publicadoEm: hora(-20, 10, 0),
      criadoEm: hora(-25),
      fundo: "laranja",
    }),
    post({
      id: "p-legado-nuvem",
      titulo: "Migração para a nuvem sem susto",
      tituloArte: "Nuvem sem susto",
      subtituloArte: "Dependências, custo e segurança antes de migrar",
      legenda:
        "Migrar para a nuvem não é apertar um botão. É planejar dependências, custo e segurança antes, e é aí que a maioria dos projetos tropeça.",
      hashtags: [...oficiais, "#Cloud", "#Infraestrutura", "#Migração"],
      redes: ["linkedin", "facebook"],
      segmento: "Infraestrutura",
      formato: "Post",
      template: "B",
      estado: "publicado",
      autorId: "u-fernando",
      dataPublicacao: dia(-27),
      aprovadoEm: hora(-29, 10, 0),
      aprovadoPor: "u-paulo",
      publicadoEm: hora(-27, 9, 0),
      criadoEm: hora(-32),
      fundo: "azul",
    }),

    // Rascunhos sem card (R4 e "Associar post salvo")
    post({
      id: "p-solto-observabilidade",
      titulo: "Observabilidade: descobrir o problema antes do cliente",
      tituloArte: "Quem descobre primeiro?",
      subtituloArte: "Sua equipe ou o seu cliente",
      legenda:
        "Se o cliente descobre a falha antes da sua equipe, o problema já virou reclamação. Observabilidade é enxergar a infraestrutura em tempo real e agir antes.",
      hashtags: [...oficiais, "#Observabilidade", "#Infraestrutura", "#Monitoramento"],
      redes: ["linkedin"],
      segmento: "Infraestrutura",
      formato: "Post",
      template: "A",
      estado: "rascunho",
      autorId: "u-ana",
      criadoEm: hora(-2, 15, 0),
      atualizadoEm: hora(-1, 11, 0),
    }),
    post({
      id: "p-solto-lgpd",
      titulo: "LGPD na saúde: comunicar segurança, não só cumprir",
      tituloArte: "Segurança que o paciente enxerga",
      subtituloArte: "",
      legenda: "Rascunho: começar pelo dado de 90% e fechar com a pergunta sobre transparência ativa.",
      hashtags: [...oficiais, "#Lgpd", "#Saúdedigital"],
      redes: ["instagram"],
      segmento: "Saúde",
      formato: "Post",
      template: "B",
      estado: "rascunho",
      autorId: "u-ana",
      criadoEm: hora(-4, 10, 0),
      atualizadoEm: hora(-4, 10, 30),
      fundo: "claro",
    }),
    post({
      id: "p-solto-governanca",
      titulo: "Governança de dados sem burocracia",
      tituloArte: "Governança sem travar o time",
      subtituloArte: "Dono, política e ciclo de revisão",
      legenda:
        "Governança de dados não precisa travar o time. Estruture o essencial (dono, política e ciclo de revisão) e deixe o resto evoluir com o uso.",
      hashtags: [...oficiais, "#Governançadedados", "#Dados", "#Gestão"],
      redes: ["linkedin", "instagram"],
      segmento: "Integração",
      formato: "Post",
      template: "A",
      estado: "rascunho",
      autorId: "u-fernando",
      criadoEm: hora(-3, 9, 0),
      atualizadoEm: hora(-3, 9, 40),
      fundo: "azul",
    }),
  ];

  // ── Problemas (registro por item) ─────────────────────────────────────
  const problemas: Problema[] = [
    {
      id: "pr-ws-reels",
      tipo: "reprovado",
      alvo: { tipo: "post", id: "p-ws-reels" },
      cardId: "c-websummit",
      motivo: "O roteiro mostra o rosto de visitantes sem autorização. Trocar por cenas do time montando o estande.",
      abertoPor: "u-marina",
      abertoEm: hora(-1, 11, 0),
    },
    {
      id: "pr-alcance",
      tipo: "reprovado",
      alvo: { tipo: "post", id: "p-alcance" },
      cardId: "c-linkedin-alcance",
      motivo: "Texto técnico demais para gestores. Abrir com o dado de engajamento e cortar o parágrafo sobre o funcionamento do algoritmo.",
      abertoPor: "u-marina",
      abertoEm: hora(-2, 16, 30),
    },
    {
      id: "pr-folder-saude",
      tipo: "aguardando_solicitante",
      alvo: { tipo: "card", id: "c-ped-folder-saude" },
      cardId: "c-ped-folder-saude",
      motivo: "Informe a data do congresso, a quantidade de folders e se já existe orçamento aprovado.",
      abertoPor: "u-fernando",
      abertoEm: hora(-2, 10, 0),
    },
    {
      id: "pr-video",
      tipo: "bloqueado",
      alvo: { tipo: "card", id: "c-video-institucional" },
      cardId: "c-video-institucional",
      motivo: "Esperando a autorização de uso de imagem do hospital parceiro.",
      abertoPor: "u-julia",
      abertoEm: hora(-3, 14, 0),
    },
    // Resolvido: o post 1 da maturidade foi reprovado e reenviado antes de publicar
    {
      id: "pr-mat-1",
      tipo: "reprovado",
      alvo: { tipo: "post", id: "p-mat-1" },
      cardId: "c-maturidade",
      motivo: "Faltou a fonte do dado de 78% na arte.",
      abertoPor: "u-marina",
      abertoEm: hora(-10, 15, 0),
      resolvidoEm: hora(-9, 11, 0),
      resolvidoPor: "u-ana",
    },
  ];

  // ── Decisões de pedidos (histórico da aba Pedidos) ────────────────────
  const decisoes: DecisaoPedido[] = [
    { id: "d-websummit", cardId: "c-websummit", tipo: "aprovado", por: "u-fernando", em: hora(-12, 15, 0) },
    { id: "d-tasy", cardId: "c-ped-tasy", tipo: "aprovado", por: "u-paulo", em: hora(-5, 11, 0) },
    {
      id: "d-brindes",
      cardId: "c-ped-brindes",
      tipo: "negado",
      por: "u-fernando",
      em: hora(-6, 10, 0),
      motivo: "Brindes ficam com Compras. O marketing envia só a arte com a marca, se for pedida.",
    },
    {
      id: "d-folder-saude",
      cardId: "c-ped-folder-saude",
      tipo: "devolvido",
      por: "u-fernando",
      em: hora(-2, 10, 0),
      motivo: "Informe a data do congresso, a quantidade de folders e se já existe orçamento aprovado.",
    },
  ];

  // ── Comentários ───────────────────────────────────────────────────────
  const comentarios: Comentario[] = [
    { id: "cm-1", itemId: "c-websummit", autorId: "u-marina", texto: "O estande fica no pavilhão 2. Mandei a planta por e-mail para a Júlia.", em: hora(-6, 9, 20) },
    { id: "cm-2", itemId: "c-websummit", autorId: "u-ana", texto: "Gráfica reservada para o dia 20. O arquivo final precisa sair até o dia 18.", em: hora(-3, 14, 5) },
    { id: "cm-3", itemId: "s-ws-folder-arte", autorId: "u-julia", texto: "Arte em andamento. Falta só a foto do time.", em: hora(-1, 17, 40) },
    { id: "cm-4", itemId: "c-video-institucional", autorId: "u-julia", texto: "Pedi a autorização ao hospital na segunda. Sem ela não dá para gravar.", em: hora(-3, 14, 2) },
    { id: "cm-5", itemId: "c-serie-integracao", autorId: "u-fernando", texto: "Post 2 aprovado. Deixei a data para dois dias depois do primeiro.", em: hora(-1, 10, 20) },
  ];

  // ── Tendências e concorrentes com datas relativas ─────────────────────
  const tendencias = TENDENCIAS_BASE.map(({ criadoEmDias, ...t }) => ({
    ...t,
    criadoEm: hora(-criadoEmDias, 7, 0),
    descarte: t.descarte ? { ...t.descarte, em: hora(-criadoEmDias + 2, 15, 0) } : undefined,
  }));

  const concorrentes = CONCORRENTES_BASE.map((c) => ({
    ...c,
    temas: c.temas.map(({ ultimaOcorrenciaDias, ...t }) => ({ ...t, ultimaOcorrencia: dia(-ultimaOcorrenciaDias) })),
  }));

  return {
    usuarios: usuarios(h),
    solicitantes: SOLICITANTES.map((s) => ({ ...s })),
    etiquetas: ETIQUETAS.map((e) => ({ ...e })),
    cards,
    subtarefas,
    comentarios,
    posts,
    problemas,
    decisoes,
    tendencias,
    concorrentes,
    swot: SWOT_BASE.map((s) => ({ ...s })),
    swotAnalisadoEm: hora(-12, 6, 0),
    marca: structuredClone(MARCA),
    webhooks: WEBHOOKS_BASE.map((w) => ({ ...w })),
    prompts: PROMPTS_BASE.map((p) => ({ ...p })),
    camposAgente: { ...CAMPOS_AGENTE_BASE },
    historico: criarHistorico(h),
  };
}

// ─── Histórico do mês anterior (Resultados → Time) ──────────────────────

/**
 * Mês anterior fechado: 18 pedidos (12 aprovados, 3 devolvidos, 3 negados),
 * 21 entregas (17 no prazo) e 7 problemas resolvidos. Bate com o exemplo de
 * resumo da proposta 4.11. Distribuição determinística, sem aleatoriedade.
 */
function criarHistorico(hoje: Date): Historico {
  const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const noMes = (diaDoMes: number, hh = 10) =>
    new Date(inicioMesAnterior.getFullYear(), inicioMesAnterior.getMonth(), diaDoMes, hh).toISOString();
  const diaMes = (diaDoMes: number) => isoDia(new Date(inicioMesAnterior.getFullYear(), inicioMesAnterior.getMonth(), diaDoMes));

  const titulosPedidos = [
    "Post sobre a certificação ISO do service desk",
    "Folder do produto de PACS",
    "Convite para o café com clientes de Saúde",
    "Post de vagas abertas em desenvolvimento",
    "Apresentação comercial atualizada",
    "Post do case de field service",
    "Arte para a assinatura de e-mail",
    "Vídeo curto do evento de parceiros",
    "Post sobre o novo escritório em Bogotá",
    "Banner para o portal do cliente",
    "Carrossel de dicas de segurança da informação",
    "Post de aniversário de 35 anos",
    "Material para a feira de saúde",
    "Post de resultados do trimestre",
    "Camisetas para o time de suporte",
    "Post do webinar de integração",
    "Infográfico de maturidade em nuvem",
    "Anúncio pago no LinkedIn",
  ];
  const areas = ["Comercial", "Recursos Humanos", "Produto", "Financeiro", "Comercial", "Produto"];
  // índices devolvidos e negados (o resto é aprovado): 12 / 3 / 3
  const devolvidos = new Set([4, 10, 16]);
  const negados = new Set([7, 14, 17]);
  const horasResposta = [5, 26, 3, 49, 8, 20, 4, 30, 6, 72, 12, 2, 27, 9, 18, 7, 44, 15];
  const decisores = ["u-fernando", "u-paulo", "u-fernando", "u-marina"];

  const pedidos: RegistroPedido[] = titulosPedidos.map((titulo, i) => {
    const diaDoMes = 1 + Math.floor(i * 1.5);
    const recebido = new Date(noMes(diaDoMes, 9 + (i % 6)));
    const decidido = new Date(recebido.getTime() + horasResposta[i] * 3_600_000);
    const decisao = devolvidos.has(i) ? "devolvido" : negados.has(i) ? "negado" : "aprovado";
    const categoria: "post" | "acao" = /^(Post|Carrossel|Anúncio)/.test(titulo) ? "post" : "acao";
    return {
      id: `hp-${i + 1}`,
      titulo,
      area: areas[i % areas.length],
      categoria,
      etiquetas: categoria === "post" ? ["e-post"] : titulo.includes("Folder") || titulo.includes("Material") ? ["e-folder"] : titulo.includes("Vídeo") ? ["e-video"] : ["e-evento"],
      recebidoEm: recebido.toISOString(),
      decididoEm: decidido.toISOString(),
      decisao,
      decididoPor: decisores[i % decisores.length],
      motivo:
        decisao === "negado"
          ? i === 14
            ? "Uniformes ficam com o RH."
            : i === 17
              ? "Mídia paga ainda não está no orçamento do trimestre."
              : "Vídeo de evento externo fica com a agência do parceiro."
          : decisao === "devolvido"
            ? "Faltou o público e o prazo."
            : undefined,
    };
  });

  const titulosEntregas = [
    "Post do case de field service",
    "Folder do produto de PACS",
    "Post de vagas abertas em desenvolvimento",
    "Carrossel de dicas de segurança",
    "Post de aniversário de 35 anos",
    "Newsletter DigiNEWS de setembro",
    "Apresentação comercial atualizada",
    "Post do webinar de integração",
    "Banner para o portal do cliente",
    "Infográfico de maturidade em nuvem",
    "Convite para o café com clientes",
    "Post sobre a certificação ISO",
    "Arte para a assinatura de e-mail",
    "Post sobre o escritório em Bogotá",
    "Material para a feira de saúde",
    "Post de resultados do trimestre",
    "Carrossel sobre suporte residente",
    "Post de boas práticas em LGPD",
    "Roteiro do vídeo de parceiros",
    "Post de bastidores do service desk",
    "Calendário editorial de setembro",
  ];
  const atrasos: Record<number, number> = { 3: 2, 8: 1, 13: 3, 18: 1 };
  const responsaveis = ["u-ana", "u-fernando", "u-julia"];
  const entregas: RegistroEntrega[] = titulosEntregas.map((titulo, i) => {
    const diaPrazo = 3 + i;
    return {
      id: `he-${i + 1}`,
      titulo,
      responsavelId: responsaveis[i % responsaveis.length],
      etiquetas: titulo.startsWith("Post") || titulo.startsWith("Carrossel") ? ["e-post"] : titulo.startsWith("Newsletter") ? ["e-newsletter"] : [],
      prazo: diaMes(diaPrazo),
      entregueEm: noMes(diaPrazo + (atrasos[i] ?? 0) - (i % 4 === 0 && !atrasos[i] ? 1 : 0), 17),
    };
  });

  const duracoesHoras: [RegistroProblema["tipo"], number, number][] = [
    ["reprovado", 3, 20],
    ["reprovado", 8, 6],
    ["reprovado", 14, 30],
    ["reprovado", 22, 4],
    ["aguardando_solicitante", 6, 52],
    ["aguardando_solicitante", 17, 96],
    ["bloqueado", 11, 120],
  ];
  const problemas: RegistroProblema[] = duracoesHoras.map(([tipo, diaDoMes, horas], i) => {
    const aberto = new Date(noMes(diaDoMes, 10));
    return {
      id: `hpr-${i + 1}`,
      tipo,
      abertoEm: aberto.toISOString(),
      resolvidoEm: new Date(aberto.getTime() + horas * 3_600_000).toISOString(),
    };
  });

  return { pedidos, entregas, problemas };
}
