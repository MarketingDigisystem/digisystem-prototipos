/*
PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable; regenerar (não remendar) se o real mudar.
Gerado de: banco do Hub (SELECT somente leitura via MCP) @ leitura 2026-11-26, depois da revisão dos 45 concorrentes e dos 45 SWOT (_saida-bruta-v2.json), via gerar-dados-proto.mjs.
Decisão de design correspondente: docs-marketing-hub/implementacao/analise-redesign-mercado-2026-11-25.md.
Dados reais da Digisystem e dos 45 concorrentes; sem segredos nem e-mails. Presença por célula é DERIVADA (segmento em comum + oferta sobreposta).
*/
export type TipoLink = "site" | "linkedin" | "instagram" | "facebook";
export type Quadrante = "forcas" | "fraquezas" | "oportunidades" | "ameacas";
export type EstadoCelula = "vendemos" | "potencial" | "nao_atende";
export type NivelRisco = 1 | 2 | 3 | 4 | 5;

export interface SegmentoDigisystem { id: string; nome: string; descricao: string | null }
export interface ItemPortfolio { id: string; nome: string; descricao: string | null; status: string }
export interface LinkConcorrente { tipo: TipoLink; url: string }
export interface TemaConcorrente { tema: string; frequencia: number | null }
export interface FichaConcorrente {
  porte: string | null;
  faixaPreco: string | null;
  /** 1 a 5; nulo quando não avaliado. */
  risco: NivelRisco | null;
  riscoMotivo: string | null;
  diferenciais: string | null;
  fonte: string | null;
  fonteData: string | null;
}
export interface SinaisRisco {
  sobreposicao: number; segmentos: number; regional: number; porte: number;
  pontuacao: string; justificativa: string; riscoPlanilha: number | null;
}
export interface SwotConcorrente {
  status: "pronta" | "pendente";
  geradoEm: string | null;
  itens: Record<Quadrante, string[]>;
}
export interface Concorrente {
  id: string;
  nome: string;
  slug: string;
  /** Caminho relativo a public/ (use urlLogo). Nulo = placeholder de marca com iniciais. */
  logo: string | null;
  descricao: string | null;
  links: LinkConcorrente[];
  temas: TemaConcorrente[];
  ficha: FichaConcorrente;
  segmentosAtua: string | null;
  presencaRegional: string | null;
  /** Texto livre de situação (ex.: "adquirida", "marca absorvida"); nulo = ativa. */
  situacao: string | null;
  revisadoEm: string | null;
  /** Ids de itens do portfólio da Digisystem em que o concorrente se sobrepõe. */
  ofertaSobreposta: string[];
  /** Ids de segmentos da Digisystem em que o concorrente também atua. */
  segmentosEmComum: string[];
  sinais: SinaisRisco | null;
  swot: SwotConcorrente;
}
export interface CelulaMatriz {
  itemId: string;
  segmentoId: string;
  estado: EstadoCelula;
  /** Ids dos concorrentes presentes (derivado). */
  concorrentes: string[];
}
export interface LeituraGeral {
  resumo: string;
  prioridade: string;
  motivos: string[];
  proximosPassos: string[];
  geradoEm: string;
  /** A IA recebeu só parte dos dados (corte de lista/texto). */
  parcial: boolean;
}
export interface DadosMercado {
  segmentos: SegmentoDigisystem[];
  itens: ItemPortfolio[];
  concorrentes: Concorrente[];
  matriz: CelulaMatriz[];
  leituraGeral: LeituraGeral | null;
}

export const ROTULO_RISCO: Record<NivelRisco, string> = { 1: "Muito baixo", 2: "Baixo", 3: "Moderado", 4: "Alto", 5: "Muito alto" };
export const ROTULO_ESTADO: Record<EstadoCelula, string> = { vendemos: "Vendemos", potencial: "Potencial", nao_atende: "Não atende" };
export const ROTULO_QUADRANTE: Record<Quadrante, string> = { forcas: "Forças", fraquezas: "Fraquezas", oportunidades: "Oportunidades", ameacas: "Ameaças" };
/** O SWOT é escrito do ponto de vista da Digisystem (prompt do Hub). */
export const DICA_QUADRANTE: Record<Quadrante, string> = {
  forcas: "Onde a Digisystem leva vantagem",
  fraquezas: "Onde ele leva vantagem sobre nós",
  oportunidades: "Espaço para a Digisystem ocupar",
  ameacas: "Onde ele pode nos tirar espaço",
};

/** URL do logo servido de public/ (respeita o base do Pages). Nulo quando só há placeholder. */
export function urlLogo(c: Concorrente): string | null {
  return c.logo ? import.meta.env.BASE_URL + c.logo : null;
}
/** Iniciais para o placeholder de marca (até 2 letras). */
export function iniciais(nome: string): string {
  const p = nome.replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "?") + (p.length > 1 ? (p[1]?.[0] ?? "") : (p[0]?.[1] ?? ""))).toUpperCase();
}

export const DADOS_MERCADO: DadosMercado = {
  "segmentos": [
    {
      "id": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "nome": "Saúde",
      "descricao": "Tecnologia para hospitais, clínicas e operadoras, do prontuário ao faturamento. Somos o maior canal de implantação Bionexo Tasy da América Latina e trabalhamos também com PACS, interoperabilidade, ciclo da receita e IA aplicada à operação. O portfólio segue os princípios do Quadruple Aim: melhor desfecho, melhor experiência do paciente e da equipe e menor custo do cuidado."
    },
    {
      "id": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "nome": "Governo",
      "descricao": "Mais de 30 anos apoiando órgãos públicos a modernizar a gestão com segurança, transparência e continuidade. Atuamos com desenvolvimento e integração de sistemas, service desk, monitoramento 24x7 e alocação de especialistas, nas esferas federal, estadual e distrital. O mote do segmento é \"o serviço público não pode parar\"."
    },
    {
      "id": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "nome": "Serviços Financeiros",
      "descricao": "Sistemas críticos para bancos, cooperativas e instituições financeiras, que não podem falhar nem parar. Temos forte atuação em APIs e integrações, soluções financeiras, sustentação e segurança."
    },
    {
      "id": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "nome": "Energia",
      "descricao": "Operações distribuídas e críticas que exigem disponibilidade constante e suporte em campo. Atuamos com field service, monitoramento, observabilidade, desenvolvimento, dadosm inteligência artifcial e sustentação de infraestrutura."
    },
    {
      "id": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "nome": "Multimercado",
      "descricao": "Empresas privadas de varejo, educação, indústria e serviços que precisam de TI estável e de escala para crescer. Oferecemos alocação de profissionais, service desk, suporte residente, cloud e desenvolvimento sob medida."
    }
  ],
  "itens": [
    {
      "id": "0208ce4b-24a5-4a21-ae92-92f5e276a407",
      "nome": "Alocação de Profissionais",
      "descricao": "Squads e especialistas de TI sob demanda, com seleção apoiada por IA e acompanhamento contínuo, sem aumentar o headcount do cliente. São mais de 3.000 profissionais alocados.",
      "status": "ativo"
    },
    {
      "id": "db69daf9-928f-4db0-b60c-0d84f7567cca",
      "nome": "Desenvolvimento - APIS & Integração",
      "descricao": "API & Integração: conecta sistemas legados, plataformas (SAP, Salesforce, TOTVS, ServiceNow) e parceiros com APIs seguras e monitoradas. Mais de 250 instituições estão integradas.",
      "status": "ativo"
    },
    {
      "id": "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
      "nome": "Desenvolvimento - Dados & IA",
      "descricao": "Dados & Analytics: governança de dados, insights e apoio à decisão.\nIA: inteligência artificial aplicada à operação. A NIA (Núcleo de Inteligência Artificial) consulta e cruza dados de qualquer sistema e aciona processos no modelo agêntico.",
      "status": "ativo"
    },
    {
      "id": "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
      "nome": "Desenvolvimento - Soluções Digitais",
      "descricao": "Soluções Digitais: aplicações web e mobile sob medida, de superapps a portais e canais digitais.",
      "status": "ativo"
    },
    {
      "id": "4e4d4e8b-d431-496e-812a-8714e3164d01",
      "nome": "Desenvolvimento - Soluções Financeiras",
      "descricao": "Soluções Financeiras: sistemas críticos para o mercado financeiro, como o de pagamento de garantias conectado a todas as instituições financeiras do país.",
      "status": "ativo"
    },
    {
      "id": "229a802e-b6f6-4d29-8855-11c9eebf420e",
      "nome": "Digital Workplace Services - Field Service",
      "descricao": "Field Service: suporte presencial, manutenção e rollout em todo o Brasil, com mais de 350 localidades atendidas.",
      "status": "ativo"
    },
    {
      "id": "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
      "nome": "Digital Workplace Services - Service Desk",
      "descricao": "Service Desk: atendimento centralizado aos usuários de TI, com métricas e SLA. São mais de 47.750 chamados por mês, com 94% resolvidos no primeiro contato.\nOnCall: atendimento sob demanda. \nGestão de Ativos: controle do ciclo de vida de equipamentos e licenças.",
      "status": "ativo"
    },
    {
      "id": "1bc227f2-0fc9-4bea-b990-7b1eaf1f4110",
      "nome": "Digital Workplace Services - Suporte Residente",
      "descricao": "Suporte Residente (Tech Stop): especialistas dentro do cliente, com balcão para troca imediata de dispositivos. Mais de 15.300 chamados por mês e satisfação acima de 98%.",
      "status": "ativo"
    },
    {
      "id": "2186ef5f-0d44-4e3a-b7f6-0654e2188f8c",
      "nome": "Gestão Hospitalar",
      "descricao": "Tasy: maior canal de implantação Bionexo Tasy da América Latina, para hospitais e operadoras.\n\nPACS: imagens médicas digitais acessíveis de qualquer lugar.\n\nAtendimento especializado: sustentação e AMS para os sistemas de saúde.",
      "status": "ativo"
    },
    {
      "id": "350a1f5e-00b0-45cc-b365-9209c091267d",
      "nome": "Intelligence Hub",
      "descricao": "Metodologia consultiva que parte do problema de negócio e atua sobre processos, pessoas, tecnologia e infraestrutura. Diferente da consultoria tradicional, que entrega um relatório, aqui nós executamos o roadmap.\n\nPulse: diagnóstico rápido, de 1 a 2 semanas, que identifica dores",
      "status": "ativo"
    },
    {
      "id": "6a7b772e-8b06-438d-8b00-44506a3a9bef",
      "nome": "Serviços Gerenciados - AIOps",
      "descricao": "AIOps (inclui FinOps): operação de TI automatizada, com correção antes do chamado e custo de nuvem sob controle.",
      "status": "ativo"
    },
    {
      "id": "84e84938-3b5c-4d33-af12-84190673718d",
      "nome": "Serviços Gerenciados - Cloud",
      "descricao": "Cloud (OCI e AWS): migração, gestão e otimização de ambientes em nuvem e híbridos.",
      "status": "ativo"
    },
    {
      "id": "22e4a71a-42b6-40ac-9ce6-42317c81480c",
      "nome": "Serviços Gerenciados - DBA as a Service",
      "descricao": "DBA as a Service: administração, migração e sustentação de bancos de dados.",
      "status": "ativo"
    },
    {
      "id": "edcaab13-7483-47ac-ae0e-a06098c7ab92",
      "nome": "Serviços Gerenciados - Observabilidade",
      "descricao": "Observabilidade: visão completa do ambiente, do inventário ao relatório executivo. Monitoramento 24x7 com 99,84% de uptime.",
      "status": "ativo"
    }
  ],
  "concorrentes": [
    {
      "id": "5f904105-d9db-498a-acc2-b6c50faf330f",
      "nome": "4Infra",
      "slug": "4infra",
      "logo": null,
      "descricao": "Empresa de TI de Belo Horizonte, com consultoria, outsourcing e suporte de infraestrutura (servidores Windows e Linux, redes, e-mail corporativo), de forma remota e presencial.",
      "links": [
        {
          "tipo": "site",
          "url": "https://4infra.com.br/"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": null,
        "faixaPreco": null,
        "risco": 2,
        "riscoMotivo": "Pouca sobreposição de portfólio; um ou dois segmentos em comum.",
        "diferenciais": "1. Atendimento remoto e presencial. 2. Suporte a servidores Windows e Linux, Mikrotik, Fortinet, Zimbra, Google Workspace e Office 365. 3. Profissionais alocados in loco no modelo de outsourcing.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Atende \"diversos segmentos\", sem lista (site oficial).",
      "presencaRegional": "Minas Gerais: atendimento presencial em Belo Horizonte e região metropolitana; remoto para RJ, SP, Salvador e Brasília.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 1,
        "regional": 1,
        "porte": 0,
        "pontuacao": "0,9",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Alocação de Profissionais; Digital Workplace Services: Service Desk). Segmentos 1: 1 em comum (Multimercado). Regional 1: Minas Gerais: atendimento presencial em Belo Horizonte e região metropolitana; remoto para RJ, SP, Salvador e Brasília. Porte 0: manual: sem dado público de porte; empresa regional pequena segundo a planilha de risco.",
        "riscoPlanilha": 2.6
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:56:51.469+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: da infraestrutura ao desenvolvimento de software, dados, IA e soluções financeiras.",
            "Presença física em mais de 350 localidades no Brasil, além de Colômbia e Argentina.",
            "Mais de 3.000 profissionais alocados e seleção apoiada por IA, com escala que a 4Infra não declara.",
            "Service Desk com 47.750 chamados/mês e 94% de resolução no primeiro contato, com SLA comprovado.",
            "Especialização verticalizada em Saúde, Governo e Serviços Financeiros, com produtos próprios para cada setor."
          ],
          "fraquezas": [
            "A 4Infra é focada em infraestrutura, o que pode torná-la mais ágil e barata para contratos simples de suporte.",
            "Empresa regional de Belo Horizonte pode ter relacionamento local mais próximo com clientes de médio porte de MG.",
            "Sem informações públicas sobre o posicionamento de preço da 4Infra, o que dificulta comparação direta."
          ],
          "oportunidades": [
            "A 4Infra não declara segmentos específicos, deixando aberto o espaço em Saúde, Governo e Serviços Financeiros.",
            "Clientes que começaram com suporte básico de infraestrutura podem evoluir para serviços gerenciados e IA com a Digisystem.",
            "A ausência de soluções de dados e IA no portfólio visível da 4Infra é uma abertura clara para a NIA e AIOps.",
            "Empresas que precisam integrar sistemas legados (SAP, TOTVS, Salesforce) não encontram isso na 4Infra."
          ],
          "ameacas": [
            "A 4Infra pode competir por contratos de Field Service e suporte presencial em Minas Gerais com custo menor.",
            "Empresas que buscam apenas outsourcing de infraestrutura podem preferir um fornecedor mais especializado e enxuto.",
            "Sem dados públicos de crescimento da 4Infra, não é possível descartar expansão de portfólio ou de regiões."
          ]
        }
      }
    },
    {
      "id": "db9cefea-c91f-40f8-b49a-12e3552ddf73",
      "nome": "Accenture",
      "slug": "accenture",
      "logo": "mercado/logos/accenture.ico",
      "descricao": "Multinacional de serviços profissionais (consultoria de gestão, tecnologia e outsourcing), com operação em mais de 120 países e foco em transformação digital.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/accenture"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/accenture"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/accenture"
        },
        {
          "tipo": "site",
          "url": "https://www.accenture.com/br-pt"
        }
      ],
      "temas": [
        {
          "tema": "Tendências tecnológicas",
          "frequencia": 1
        },
        {
          "tema": "Insights de mercado",
          "frequencia": 1
        },
        {
          "tema": "Transformação digital",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "774.000+ colaboradores no mundo (planilha/LinkedIn). Faturamento US$ 64,9 bilhões 2023",
        "faixaPreco": null,
        "risco": 5,
        "riscoMotivo": "Portfólio muito parecido com o da Digisystem; quatro ou cinco segmentos em comum.",
        "diferenciais": "1. Presença global em mais de 120 países. 2. Expertise em transformação digital. 3. Amplas parcerias estratégicas com líderes de tecnologia.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Aeroespacial, automotivo, bancário, bens de consumo, saúde, telecomunicações, varejo e governo.",
      "presencaRegional": "Global (mais de 120 países), com operação no Brasil em escala nacional.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "350a1f5e-00b0-45cc-b365-9209c091267d",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 3,
        "segmentos": 3,
        "regional": 3,
        "porte": 3,
        "pontuacao": "3",
        "justificativa": "Sobreposição 3: 5 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Intelligence Hub; Serviços Gerenciados: Cloud). Segmentos 3: 4 em comum (Saúde, Governo, Serviços Financeiros, Multimercado). Regional 3: Global (mais de 120 países), com operação no Brasil em escala nacional. Porte 3: 774.000+ colaboradores.",
        "riscoPlanilha": 5
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T16:39:05.469+00:00",
        "itens": {
          "forcas": [
            "Executa o roadmap de transformação digital, não só entrega relatório — o Intelligence Hub vai do diagnóstico à operação.",
            "Atende governo com portfólio completo, incluindo field service em mais de 350 localidades no Brasil.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados mensais demonstra maturidade operacional.",
            "Especialização profunda em saúde digital: maior canal de implantação Tasy da América Latina.",
            "Mais de 250 instituições integradas via APIs seguras, com histórico real em sistemas críticos do mercado financeiro."
          ],
          "fraquezas": [
            "A Accenture tem presença em mais de 120 países; a Digisystem atua só no Brasil, Colômbia e Argentina.",
            "Parcerias com Microsoft, SAP, Oracle, AWS, Google Cloud e Salesforce dão à Accenture credencial global que a Digisystem ainda não tem na mesma escala.",
            "A Accenture tem alta autoridade de domínio e SEO consolidado, o que gera visibilidade orgânica difícil de alcançar no curto prazo.",
            "O porte da Accenture permite absorver contratos de grande volume com mais folga financeira e estrutura de entrega.",
            "Avaliação Glassdoor da Accenture em 3.8 ainda reflete marca empregadora mais reconhecida globalmente."
          ],
          "oportunidades": [
            "Clientes que pagam caro por consultoria sem execução buscam um parceiro que também opere — exatamente o que o Intelligence Hub entrega.",
            "A Accenture depende de grandes contratos; médias empresas e órgãos públicos de menor porte ficam desassistidos e são público natural da Digisystem.",
            "Segmento de saúde digital em expansão é pouco coberto pela Accenture no Brasil e é core da Digisystem com Tasy e PACS.",
            "A Accenture não tem field service capilar no Brasil; a Digisystem cobre mais de 350 localidades e pode avançar em contratos que exigem presença física.",
            "Soluções financeiras críticas, como pagamento de garantias conectado a todas as instituições do país, são um diferencial que a Accenture não replica localmente."
          ],
          "ameacas": [
            "A Accenture está expandindo para saúde digital e tecnologia financeira em 2025-2026, mercados centrais da Digisystem.",
            "O investimento da Accenture em IA generativa pode acelerar entregas de diagnóstico e consultoria, reduzindo o diferencial de velocidade do Pulse.",
            "Parcerias globais da Accenture com AWS e Oracle podem influenciar decisões de compra de cloud em contas que a Digisystem já atende.",
            "A Accenture tem blog ativo e forte presença no LinkedIn, o que pode ocupar o espaço de referência técnica antes da Digisystem chegar à conversa.",
            "Contratos de outsourcing de larga escala assinados com a Accenture criam barreiras de saída altas para clientes que poderiam migrar para a Digisystem."
          ]
        }
      }
    },
    {
      "id": "1e9ee3c1-b682-408f-b10d-0f1fc9e45b30",
      "nome": "ACT Digital",
      "slug": "act-digital",
      "logo": "mercado/logos/act-digital.ico",
      "descricao": "Multinacional brasileira de tecnologia AI-first, com sede em São Paulo, presente em 13 países, que atua em dados, produtos digitais e engenharia, e opera o hub de TI da BMW no Brasil.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/actdigitaloficial"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/act-digital"
        },
        {
          "tipo": "site",
          "url": "https://actdigital.com/pt/"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "Mais de 7.000 profissionais (site oficial, citado no cadastro)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Atua na mesma praça; pouca sobreposição de portfólio.",
        "diferenciais": "1. Engenheiros trabalhando com agentes de IA em projetos. 2. Investimento de R$ 100 milhões em 2026 e 2027 em P&D, formação e contratações para IA. 3. Opera o hub de TI da BMW em São Paulo (cerca de 200 pessoas no início).",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Automotivo (BMW) e demais setores; segmentos não detalhados publicamente.",
      "presencaRegional": "Sede em São Paulo (SP); 13 países; hub BMW em São Paulo; vagas no Brasil e em Portugal.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 1,
        "regional": 3,
        "porte": 2,
        "pontuacao": "1,5",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais). Segmentos 1: 1 em comum (Multimercado). Regional 3: Sede em São Paulo (SP); 13 países; hub BMW em São Paulo; vagas no Brasil e em Portugal. Porte 2: 7.000+ colaboradores.",
        "riscoPlanilha": 2.5
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:54:04.767+00:00",
        "itens": {
          "forcas": [
            "Presença consolidada em Governo e Saúde, segmentos que a ACT Digital não declara publicamente como foco.",
            "Mais de 250 instituições integradas via APIs, com cobertura de plataformas críticas como SAP, TOTVS e Salesforce.",
            "Field Service em mais de 350 localidades no Brasil, com capilaridade operacional difícil de replicar.",
            "Mais de 3.000 profissionais alocados e Service Desk com 94% de resolução no primeiro contato.",
            "Maior canal de implantação Tasy da América Latina, com solução completa para hospitais e operadoras."
          ],
          "fraquezas": [
            "A ACT Digital opera em 13 países; a Digisystem atua só no Brasil, Colômbia e Argentina.",
            "Posicionamento AI-first da ACT Digital é mais claro e assertivo na comunicação externa do que o da Digisystem.",
            "A ACT Digital tem um caso de referência de peso global (hub de TI da BMW), o que eleva a percepção de credibilidade enterprise."
          ],
          "oportunidades": [
            "A ACT Digital não detalha atuação em Governo; a Digisystem pode avançar nesse segmento sem concorrência direta.",
            "Ausência de portfólio declarado em Saúde pela ACT Digital deixa espaço para a Digisystem ampliar referências no setor.",
            "A verticalização em Serviços Financeiros, com soluções críticas de pagamento, é um diferencial que a ACT Digital não apresenta publicamente.",
            "A capilaridade de Field Service e Suporte Residente pode atrair clientes que precisam de operação presencial em todo o Brasil."
          ],
          "ameacas": [
            "A presença em 13 países torna a ACT Digital mais atrativa para multinacionais que buscam um parceiro com escala global.",
            "O posicionamento AI-first da ACT Digital pode ganhar preferência em projetos de dados e engenharia de alto valor.",
            "A associação com a BMW reforça credibilidade em contas enterprise e pode abrir portas em setores onde a Digisystem ainda não tem referências fortes.",
            "Sem informações públicas sobre temas e frequência de conteúdo da ACT Digital, é difícil antecipar movimentos de comunicação e posicionamento."
          ]
        }
      }
    },
    {
      "id": "2e97c62d-7477-4167-8bf8-92c1dc125209",
      "nome": "ACT Tecnologia",
      "slug": "act-tecnologia",
      "logo": null,
      "descricao": "Empresa de TI gerenciada de Guarapuava (PR), com monitoramento contínuo, segurança, conectividade, cloud e data center, que atende empresas de médio e grande porte no Brasil e no Paraguai.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/acttecnologia"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/acttecnologia"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/act-tecnologia"
        },
        {
          "tipo": "site",
          "url": "https://acttecnologia.com.br"
        }
      ],
      "temas": [
        {
          "tema": "Segurança e conectividade",
          "frequencia": 1
        },
        {
          "tema": "Treinamentos técnicos",
          "frequencia": 1
        },
        {
          "tema": "Inovação em TI",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "200+ colaboradores (LinkedIn)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; pouca sobreposição de portfólio.",
        "diferenciais": "1. Soluções personalizadas para clientes locais. 2. Foco em automação e conectividade. 3. Atendimento especializado.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Varejo, saúde, tecnologia, serviços financeiros e governo.",
      "presencaRegional": "Sede em Guarapuava (PR); atua em todo o Brasil e no Paraguai.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "84e84938-3b5c-4d33-af12-84190673718d",
        "edcaab13-7483-47ac-ae0e-a06098c7ab92"
      ],
      "segmentosEmComum": [
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 3,
        "regional": 2,
        "porte": 1,
        "pontuacao": "1,8",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Serviços Gerenciados: Cloud; Serviços Gerenciados: Observabilidade). Segmentos 3: 4 em comum (Saúde, Governo, Serviços Financeiros, Multimercado). Regional 2: Sede em Guarapuava (PR); atua em todo o Brasil e no Paraguai. Porte 1: 200+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:52:48.762+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: da consultoria com Intelligence Hub até IA agêntica, Field Service e Gestão Hospitalar, tudo sob o mesmo teto.",
            "Presença nacional comprovada: mais de 350 localidades atendidas com Field Service, contra atuação concentrada no PR e Paraguai.",
            "Números de operação concretos: 47.750 chamados/mês no Service Desk, 94% resolvidos no primeiro contato e 99,84% de uptime.",
            "Especialização vertical em Saúde com o maior canal de implantação Tasy da América Latina, diferencial que a ACT não apresenta.",
            "Mais de 250 instituições integradas via APIs seguras, com conectores para SAP, Salesforce, TOTVS e ServiceNow."
          ],
          "fraquezas": [
            "A ACT tem foco declarado em data center e conectividade próprios, o que pode passar imagem de maior controle de infraestrutura física.",
            "Presença regional consolidada no PR pode dar à ACT vantagem de relacionamento local com empresas médias da região.",
            "A ACT anuncia treinamentos técnicos como oferta direta, item que não aparece explicitamente no portfólio publicado da Digisystem."
          ],
          "oportunidades": [
            "A ACT não mostra solução de IA aplicada à operação, abrindo espaço para a NIA e o modelo agêntico da Digisystem.",
            "Segmento de Energia não está no escopo da ACT, o que deixa clientes desse setor sem concorrência direta entre as duas.",
            "A ACT não apresenta oferta de Dados e Analytics estruturada, espaço que a Digisystem cobre com governança e apoio à decisão.",
            "Ausência de Soluções Financeiras na ACT abre terreno nos Serviços Financeiros, onde a Digisystem já tem sistemas críticos rodando.",
            "A ACT não menciona atuação internacional além do Paraguai; a Digisystem pode avançar em Colômbia e Argentina sem concorrência direta dela."
          ],
          "ameacas": [
            "A ACT atua em saúde e governo, segmentos-chave da Digisystem, e pode disputar contratos de TI gerenciada nesses verticais.",
            "Foco em segurança e conectividade é tema de alta demanda; se a ACT crescer nisso, pode entrar em contas que a Digisystem já atende.",
            "Empresas de médio porte podem preferir a ACT por percepção de atendimento mais próximo e regional, especialmente no Sul do Brasil.",
            "A ACT atende varejo, segmento dentro do Multimercado da Digisystem, e pode ampliar esse alcance com proposta de TI gerenciada."
          ]
        }
      }
    },
    {
      "id": "3da078e8-dda6-4b2b-a3fb-47058f556ec2",
      "nome": "Algar Tech",
      "slug": "algar-tech",
      "logo": null,
      "descricao": "Empresa do Grupo Algar, de Uberlândia (MG), com 26 anos de mercado em relacionamento com o cliente (CX e BPO) e serviços de TI para grandes corporações.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/AlgarTech"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/algartech"
        },
        {
          "tipo": "linkedin",
          "url": "https://br.linkedin.com/company/algar-tech"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "10.000+ colaboradores (estimativa ZoomInfo); 12.000 agentes e pessoal de apoio em 73 unidades (NICE)",
        "faixaPreco": null,
        "risco": 2,
        "riscoMotivo": "Presença regional relevante; um ou dois segmentos em comum.",
        "diferenciais": "1. Parte do Grupo Algar (mais de 9 mil associados no grupo). 2. 26 anos de mercado em atendimento ao cliente. 3. Operação de grande escala, com cerca de 300 clientes (NICE).",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Grandes corporações; operações de atendimento para o setor financeiro (cartões) e outros.",
      "presencaRegional": "Sede em Uberlândia (MG); 73 unidades e clientes em vários estados (NICE); presença internacional.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 0,
        "segmentos": 1,
        "regional": 2,
        "porte": 3,
        "pontuacao": "1",
        "justificativa": "Sobreposição 0: 0 item(ns) do portfólio. Segmentos 1: 2 em comum (Serviços Financeiros, Multimercado). Regional 2: Sede em Uberlândia (MG); 73 unidades e clientes em vários estados (NICE); presença internacional. Porte 3: 10.000+ colaboradores.",
        "riscoPlanilha": 2.9
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:56:29.989+00:00",
        "itens": {
          "forcas": [
            "Portfólio vertical em Saúde e Governo, segmentos que a Algar Tech não endereça com profundidade.",
            "Intelligence Hub executa o roadmap, não entrega só relatório, o que diferencia a abordagem consultiva.",
            "NIA com modelo agêntico conecta e aciona dados de qualquer sistema, indo além de automação convencional.",
            "Mais de 250 instituições integradas via APIs seguras, com cobertura financeira crítica e abrangência multissetorial.",
            "Field Service em mais de 350 localidades e Suporte Residente com 98% de satisfação mostram capilaridade operacional real."
          ],
          "fraquezas": [
            "Algar Tech tem 26 anos de especialização em CX e BPO, histórico que a Digisystem não possui nesse nicho.",
            "A base consolidada da Algar Tech em grandes corporações de cartões e setor financeiro é difícil de disputar no curto prazo.",
            "A Algar Tech é parte de um grupo robusto e regional, o que pode pesar em decisões de compra em Minas Gerais e entorno."
          ],
          "oportunidades": [
            "Algar Tech foca em CX e BPO, deixando aberto o espaço de transformação digital ponta a ponta que a Digisystem ocupa.",
            "Segmentos de Saúde e Governo carecem de parceiros especializados, e a Algar Tech não demonstra foco nesses mercados.",
            "Clientes que já usam BPO da Algar Tech podem precisar de integração de sistemas e IA, serviços que a Digisystem entrega.",
            "Empresas de médio porte fora do eixo das grandes corporações ficam desatendidas pelo posicionamento da Algar Tech."
          ],
          "ameacas": [
            "A Algar Tech pode expandir seu portfólio de TI gerenciada para segmentos onde a Digisystem já atua, como Serviços Financeiros.",
            "Relacionamentos longos com grandes corporações dão à Algar Tech abertura para cross-sell de novos serviços digitais.",
            "A força de marca regional do Grupo Algar pode facilitar entrada em contas públicas e privadas no Centro-Oeste brasileiro."
          ]
        }
      }
    },
    {
      "id": "f2be0460-6023-4ae5-82ad-44735a6084a7",
      "nome": "Basis Tecnologia",
      "slug": "basis-tecnologia",
      "logo": "mercado/logos/basis-tecnologia.png",
      "descricao": "Empresa de TI sediada em Brasília, que presta serviços de fábrica de software, ECM, consultoria, BPM, soluções analíticas e outsourcing, com forte atuação no setor público.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/basistecnologia"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/basis-tecnologia-da-informacao-s.a."
        },
        {
          "tipo": "site",
          "url": "https://www.basis.com.br"
        }
      ],
      "temas": [
        {
          "tema": "Inovação em TI",
          "frequencia": 1
        },
        {
          "tema": "Soluções personalizadas e cases de sucesso",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "500+ colaboradores (LinkedIn)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Sobreposição parcial de portfólio; três segmentos em comum.",
        "diferenciais": "1. Expertise em software personalizado. 2. Forte atuação no setor público. 3. Atendimento flexível e adaptado às necessidades do cliente.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Governo, saúde, educação, empresas privadas.",
      "presencaRegional": "Sede em Brasília (DF), também Belo Horizonte e São Paulo.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735"
      ],
      "segmentosEmComum": [
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 2,
        "regional": 3,
        "porte": 1,
        "pontuacao": "2,1",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais). Segmentos 2: 3 em comum (Governo, Saúde, Multimercado). Regional 3: Sede em Brasília (DF), também Belo Horizonte e São Paulo. Porte 1: 500+ colaboradores.",
        "riscoPlanilha": 1.95
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:49:18.556+00:00",
        "itens": {
          "forcas": [
            "Portfólio mais amplo: vai de gestão hospitalar a soluções financeiras críticas, enquanto a Basis foca em fábrica de software e ECM.",
            "Presença física em mais de 350 localidades no Brasil, com Field Service e Suporte Residente estruturados.",
            "NIA e AIOps entregam IA aplicada à operação, não apenas como pauta de inovação.",
            "Mais de 250 instituições integradas via APIs seguras, com histórico comprovado de conectividade.",
            "Atuação internacional na Colômbia e Argentina amplia o alcance além do mercado brasileiro."
          ],
          "fraquezas": [
            "A Basis tem raízes profundas em Brasília e no setor público federal, onde o relacionamento institucional conta muito.",
            "BPM e ECM são especialidades consolidadas da Basis; a Digisystem não apresenta essas soluções no portfólio ativo.",
            "A Basis atua também em educação, segmento que a Digisystem não cobre com produtos específicos."
          ],
          "oportunidades": [
            "Serviços Financeiros e Energia são segmentos que a Basis não cobre, abrindo espaço direto para a Digisystem.",
            "Clientes públicos que precisam de infraestrutura gerenciada 24x7 e Field Service estruturado não encontram isso na Basis.",
            "Gestão Hospitalar com Tasy e PACS atende uma dor que a Basis aborda de forma genérica, sem produto especializado.",
            "Intelligence Hub com execução de roadmap é diferente do modelo de consultoria tradicional que a Basis pratica."
          ],
          "ameacas": [
            "A Basis pode ampliar seu portfólio de outsourcing e competir diretamente nos editais de alocação de profissionais.",
            "Cases de sucesso bem comunicados no setor público podem fortalecer a percepção de especialidade da Basis em Governo.",
            "Foco em soluções personalizadas pode atrair clientes que buscam menos padronização e mais desenvolvimento sob medida."
          ]
        }
      }
    },
    {
      "id": "f166a484-74fc-489c-8f2c-376f4a04e926",
      "nome": "BRQ",
      "slug": "brq",
      "logo": "mercado/logos/brq.ico",
      "descricao": "Empresa brasileira de tecnologia que combina especialistas, ferramentas e IA para entregar projetos e equipes de tecnologia, com clientes de grande porte nos setores financeiro, telecom e indústria.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/brqdigital"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/brq"
        },
        {
          "tipo": "site",
          "url": "https://www.brq.com"
        }
      ],
      "temas": [
        {
          "tema": "Tendências de mercado",
          "frequencia": 1
        },
        {
          "tema": "Inovação tecnológica",
          "frequencia": 1
        },
        {
          "tema": "Cases de sucesso",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "Mais de 2.000 especialistas, mais de 150 clientes e operação em mais de 12 países (site oficial)",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Sobreposição parcial de portfólio; três segmentos em comum.",
        "diferenciais": "1. Foco em inovação para transformação digital. 2. Especialização em open finance. 3. Alta capacitação em soluções mobile.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Financeiro, varejo, telecomunicações, indústria. Clientes citados: Santander, Itaú, B3, PicPay, Vivo, Nissan e Petrobras.",
      "presencaRegional": "Brasil (profissionais em mais de 350 cidades) e EUA; 12 países com operação.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 2,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,2",
        "justificativa": "Sobreposição 2: 4 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Serviços Gerenciados: Cloud). Segmentos 2: 3 em comum (Serviços Financeiros, Multimercado, Governo). Regional 3: Brasil (profissionais em mais de 350 cidades) e EUA; 12 países com operação. Porte 2: 2.000+ colaboradores.",
        "riscoPlanilha": 4.5
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:07:41.015+00:00",
        "itens": {
          "forcas": [
            "Presença internacional: a Digisystem atua no Brasil, Colômbia e Argentina, enquanto a BRQ está restrita ao Brasil e EUA.",
            "Portfólio de suporte físico capilar: mais de 350 localidades atendidas em Field Service, sem equivalente declarado na BRQ.",
            "Especialização em Saúde e Governo, segmentos fora do foco central da BRQ.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados mensais documentados.",
            "Intelligence Hub executa o roadmap, não apenas entrega relatório — diferencial concreto frente à consultoria tradicional."
          ],
          "fraquezas": [
            "BRQ tem casos públicos com resultados numéricos expressivos em grandes bancos, o que fortalece a credibilidade comercial.",
            "Especialização da BRQ em open finance é um diferencial claro no setor financeiro, onde a Digisystem também compete.",
            "Capacidade mobile da BRQ é destacada como ponto forte; a Digisystem não apresenta casos equivalentes publicados.",
            "BRQ possui presença digital ativa com SEO forte em transformação digital, aumentando visibilidade orgânica.",
            "Parceiros como FICO, Alteryx e Automation Anywhere ampliam o portfólio da BRQ em analytics e automação."
          ],
          "oportunidades": [
            "BRQ não tem foco declarado em Saúde; a Digisystem pode avançar com Tasy e PACS nesse segmento.",
            "Ausência de suporte presencial estruturado na BRQ abre espaço para a Digisystem em contratos que exigem Field Service.",
            "A expansão da BRQ para PMEs em 2025 não atinge Governo, onde a Digisystem já tem expertise consolidada.",
            "BRQ planeja entrar em educação e marketing digital, deixando segmentos como Energia menos disputados.",
            "Atuação na América Latina permite à Digisystem disputar contratos regionais que a BRQ não consegue atender."
          ],
          "ameacas": [
            "Expansão da BRQ para SaaS em 2025 pode alcançar clientes de médio porte que hoje contratam serviços da Digisystem.",
            "Cases públicos com métricas fortes da BRQ podem influenciar decisões de compra em processos competitivos no setor financeiro.",
            "Alta presença orgânica da BRQ em palavras-chave de transformação digital reduz a visibilidade digital da Digisystem.",
            "Certificação AWS Advanced Partner da BRQ fortalece a posição dela em cloud, área em que a Digisystem também compete.",
            "Entrada da BRQ em novos segmentos pode aumentar a sobreposição competitiva com o portfólio multimercado da Digisystem."
          ]
        }
      }
    },
    {
      "id": "0a966521-580f-40ab-9184-70842a0339f0",
      "nome": "Cast Group (CAST)",
      "slug": "cast-group-cast",
      "logo": "mercado/logos/cast-group-cast.png",
      "descricao": "Empresa brasileira de tecnologia, inovação e automação industrial, fundada em 1990 em Brasília, presente em 5 países e com mais de 500 clientes em cerca de 20 segmentos. Atua com SAP, desenvolvimento, automação industrial e soluções próprias.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/CastITGroup"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/cast4it"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/cast4it"
        },
        {
          "tipo": "site",
          "url": "https://www.cast4it.com/"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "Presente em 5 países, com mais de 500 clientes e 35 anos de atuação (site oficial). Headcount não publicado",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Três segmentos em comum; atua na mesma praça.",
        "diferenciais": "1. 35 anos de atuação, desde 1990. 2. Presença em 5 países e mais de 500 clientes. 3. Portfólio com SAP, automação industrial e soluções próprias.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Finanças, indústria, serviços, governo; cerca de 20 segmentos.",
      "presencaRegional": "Sede em Brasília (DF), com operação em São Paulo; 5 países.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735"
      ],
      "segmentosEmComum": [
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 2,
        "regional": 3,
        "porte": 1,
        "pontuacao": "1,7",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Soluções Digitais). Segmentos 2: 3 em comum (Governo, Serviços Financeiros, Multimercado). Regional 3: Sede em Brasília (DF), com operação em São Paulo; 5 países. Porte 1: manual: sem headcount; escala sugerida por 500 clientes em 5 países e 35 anos.",
        "riscoPlanilha": 3.6
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:09:11.939+00:00",
        "itens": {
          "forcas": [
            "Portfólio vertical em Saúde (Tasy, PACS, AMS) sem equivalente conhecido na CAST.",
            "NIA com modelo agêntico conecta qualquer sistema — diferencial claro em IA aplicada à operação.",
            "Field Service em mais de 350 localidades no Brasil, com presença física mais ampla documentada.",
            "Mais de 250 instituições integradas via API, incluindo SAP, Salesforce, TOTVS e ServiceNow.",
            "Atuação internacional na Colômbia e Argentina amplia a proposta de valor para clientes regionais."
          ],
          "fraquezas": [
            "CAST tem 35 anos de mercado e reputação consolidada em governo e legado, o que pesa em licitações.",
            "Presença forte da CAST em automação industrial é um território que a Digisystem não cobre nos dados disponíveis.",
            "CAST nasceu em Brasília com DNA público, o que pode favorecer relacionamentos institucionais em Governo Federal."
          ],
          "oportunidades": [
            "Saúde digital é um segmento que a CAST não demonstra cobertura — espaço aberto para a Digisystem crescer.",
            "A CAST não apresenta oferta visível de IA agêntica, deixando espaço para a Digisystem liderar essa conversa.",
            "Clientes de legado da CAST podem precisar de integração moderna via API — serviço que a Digisystem já entrega.",
            "Mercado financeiro com soluções críticas (pagamento de garantias) é um nicho que a CAST não evidencia."
          ],
          "ameacas": [
            "Histórico longo da CAST em outsourcing pode converter clientes que buscam fornecedor com track record extenso.",
            "Foco da CAST em integração de TI compete diretamente com API & Integração da Digisystem em contas de governo.",
            "A CAST pode expandir para Saúde ou IA aproveitando base instalada em clientes que a Digisystem também atende."
          ]
        }
      }
    },
    {
      "id": "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
      "nome": "Certsys",
      "slug": "certsys",
      "logo": "mercado/logos/certsys.png",
      "descricao": "Empresa de tecnologia de Barueri (SP), fundada em 2007, que atua em hiperautomação, cloud, produtos digitais e cibersegurança, com foco no setor público.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/certsys"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/certsys"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/certsystecnologia"
        },
        {
          "tipo": "site",
          "url": "https://www.certsys.com.br"
        }
      ],
      "temas": [
        {
          "tema": "Inovação em transformação digital",
          "frequencia": 1
        },
        {
          "tema": "Segurança cibernética",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "Cerca de 350 pessoas (estimativa Crustdata, out/2026); planilha trazia 200+",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Foco em automação inteligente. 2. Experiência em segurança cibernética. 3. Parcerias com fornecedores globais de tecnologia.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Setor público, financeiro, saúde, educação.",
      "presencaRegional": "Sede em Barueri (SP); escritórios em São Paulo, Rio de Janeiro e Brasília.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 3,
        "porte": 1,
        "pontuacao": "2,4",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Serviços Gerenciados: Cloud). Segmentos 3: 4 em comum (Governo, Serviços Financeiros, Saúde, Multimercado). Regional 3: Sede em Barueri (SP); escritórios em São Paulo, Rio de Janeiro e Brasília. Porte 1: 348+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T16:40:00.44+00:00",
        "itens": {
          "forcas": [
            "Atuação internacional: Brasil, Colômbia e Argentina, enquanto a Certsys está restrita ao Brasil.",
            "Portfólio mais amplo: vai de Gestão Hospitalar (Tasy, PACS) a Field Service em mais de 350 localidades.",
            "Mais de 3.000 profissionais alocados e Service Desk com 94% de resolução no primeiro contato.",
            "Presença forte em Saúde com soluções verticais exclusivas, segmento que a Certsys ainda está entrando.",
            "Intelligence Hub executa o roadmap, não apenas entrega relatório — diferencial claro frente à consultoria tradicional."
          ],
          "fraquezas": [
            "Certsys tem ISO 27001 e foco declarado em cibersegurança, área não destacada no portfólio ativo da Digisystem.",
            "Parcerias com Google Cloud, Microsoft, IBM e AWS dão à Certsys credenciais de ecossistema mais visíveis ao mercado.",
            "Certsys tem posicionamento consolidado como líder em transformação digital para o setor público, marca mais associada ao segmento.",
            "Hyperautomation é oferta clara da Certsys; a Digisystem não apresenta produto equivalente com esse nome no mercado."
          ],
          "oportunidades": [
            "Certsys tem alta dependência do setor público — a Digisystem pode avançar em Serviços Financeiros e Energia com menos competição direta.",
            "Saúde digital é uma expansão futura da Certsys; a Digisystem já opera no setor com Tasy e PACS, o que é vantagem de tempo.",
            "Certsys não tem Field Service estruturado nacionalmente — suporte presencial em mais de 350 localidades é diferencial a explorar.",
            "Atuação na Colômbia e Argentina abre mercados onde a Certsys não compete, especialmente em governo e serviços financeiros.",
            "Baixa velocidade de página da Certsys e SEO limitado fora de automação e cloud criam espaço para a Digisystem ganhar visibilidade digital."
          ],
          "ameacas": [
            "Certsys deve fortalecer cibersegurança e automação em 2025, áreas que também fazem parte do portfólio de transformação digital da Digisystem.",
            "Expansão da Certsys para saúde digital pode criar concorrência direta com a vertical de Gestão Hospitalar da Digisystem.",
            "Parcerias com fornecedores globais (Google, Microsoft, AWS, IBM) aumentam a percepção de robustez tecnológica da Certsys junto a decisores.",
            "Certsys atende Petrobras e indústria energética, segmento em que a Digisystem também opera — disputa direta por contas estratégicas.",
            "Foco em automação industrial previsto para 2025-2026 pode levar a Certsys para contas de Energia e Multimercado onde a Digisystem já está."
          ]
        }
      }
    },
    {
      "id": "29f46fd4-b6b2-4703-83a6-385c54afce60",
      "nome": "CI&T",
      "slug": "ci-t",
      "logo": "mercado/logos/ci-t.png",
      "descricao": "Empresa global de tecnologia e transformação digital, fundada em 1995 em Campinas (SP) e listada na bolsa de Nova York (CINT), que atende mais de 100 grandes empresas e clientes de rápido crescimento.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/ciandt"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/ciandt"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/ciandt"
        },
        {
          "tipo": "site",
          "url": "https://ciandt.com/br/pt-br/home"
        }
      ],
      "temas": [
        {
          "tema": "Inovação em transformação digital",
          "frequencia": 1
        },
        {
          "tema": "Experiência do cliente",
          "frequencia": 1
        },
        {
          "tema": "Tecnologia emergente",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "Mais de 8.000 profissionais (site de investidores)",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Sobreposição parcial de portfólio; três segmentos em comum.",
        "diferenciais": "1. Forte atuação em engenharia de software. 2. Expertise em experiência do cliente. 3. Presença internacional consolidada.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Financeiro, varejo, saúde, tecnologia, automotivo, manufatura e mídia.",
      "presencaRegional": "Fundada em Campinas (SP); mais de 25 países com centros de entrega nas Américas, Europa e Ásia-Pacífico.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "350a1f5e-00b0-45cc-b365-9209c091267d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 2,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,2",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Intelligence Hub). Segmentos 2: 3 em comum (Serviços Financeiros, Saúde, Multimercado). Regional 3: Fundada em Campinas (SP); mais de 25 países com centros de entrega nas Américas, Europa e Ásia-Pacífico. Porte 2: 8.000+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:48:30.244+00:00",
        "itens": {
          "forcas": [
            "Presença física em mais de 350 localidades no Brasil, com Field Service e Suporte Residente que a CI&T não declara operar.",
            "Gestão Hospitalar com Tasy e PACS posiciona a Digisystem como parceira especializada em saúde, além de consultoria digital.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados/mês demonstra operação de suporte em escala real.",
            "Atuação em Governo, segmento que a CI&T não lista como foco, abre mercado público sem concorrência direta.",
            "Intelligence Hub executa o roadmap, não entrega só relatório, diferenciando a Digisystem da consultoria tradicional."
          ],
          "fraquezas": [
            "CI&T é listada na NYSE (CINT), o que transmite credibilidade financeira e visibilidade global que a Digisystem ainda não tem.",
            "CI&T atende mais de 100 grandes empresas com presença global consolidada, portfólio de marca mais reconhecido internacionalmente.",
            "Atuação em automotivo, manufatura e mídia pela CI&T amplia o TAM dela além dos segmentos que a Digisystem cobre hoje.",
            "CI&T tem histórico público de projetos de experiência do cliente e tecnologia emergente com marcas globais de alto prestígio."
          ],
          "oportunidades": [
            "Governo é segmento ignorado pela CI&T, e a Digisystem já opera nele com portfólio completo, do Service Desk ao desenvolvimento.",
            "Gestão Hospitalar especializada (Tasy, PACS, AMS) é um nicho que a CI&T não endereça, deixando espaço livre em saúde.",
            "Clientes que precisam de suporte presencial e Field Service em cidades fora dos grandes centros não encontram isso na CI&T.",
            "Empresas do setor financeiro que precisam de sistemas críticos, como pagamento de garantias, têm na Digisystem uma solução que a CI&T não declara ter.",
            "AIOps com FinOps e Observabilidade 24x7 atendem demanda de operação contínua que a CI&T não posiciona como produto estruturado."
          ],
          "ameacas": [
            "CI&T pode avançar sobre Serviços Financeiros com força de marca global e atrair clientes que hoje avaliam a Digisystem.",
            "Presença internacional da CI&T (EUA, Europa, Ásia) pode influenciar decisões de multinacionais que operam no Brasil.",
            "A CI&T pode entrar em saúde com proposta de transformação digital, disputando espaço onde a Digisystem tem especialização.",
            "Reputação de inovação em IA e tecnologia emergente da CI&T pode pressionar a percepção de mercado sobre a NIA da Digisystem."
          ]
        }
      }
    },
    {
      "id": "39f636f5-eb96-4f92-9e67-b64e2e9ec208",
      "nome": "Compasso UOL (hoje Compass UOL / AI/R)",
      "slug": "compasso-uol-hoje-compass-uol-ai-r",
      "logo": "mercado/logos/compasso-uol-hoje-compass-uol-ai-r.svg",
      "descricao": "Empresa de cloud, dados e IA do grupo AI/R (antes Compasso UOL), Parceira do Ano da AWS no Brasil em 2026, que também moderniza mainframe e atua com Oracle.",
      "links": [
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/compass-uol"
        },
        {
          "tipo": "site",
          "url": "https://compass.uol/"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "Mais de 1.900 profissionais certificados AWS, o que indica equipe de pelo menos esse tamanho (nota de imprensa)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Sobreposição parcial de portfólio; atua na mesma praça.",
        "diferenciais": "1. Parceira do Ano da AWS no Brasil em 2026 (Consulting Partner). 2. Prêmio Oracle Partner Award 2026 para a América Latina. 3. Mais de 1.900 profissionais certificados AWS.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": null,
      "presencaRegional": "Operação nacional no Brasil (Parceira do Ano da AWS no país) e América Latina.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 0,
        "regional": 3,
        "porte": 2,
        "pontuacao": "1,6",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Serviços Gerenciados: Cloud). Segmentos 0: 0 em comum. Regional 3: Operação nacional no Brasil (Parceira do Ano da AWS no país) e América Latina. Porte 2: 1.900+ colaboradores.",
        "riscoPlanilha": 3.3
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:53:40.393+00:00",
        "itens": {
          "forcas": [
            "Presença física em mais de 350 localidades no Brasil, com Field Service e Suporte Residente que a Compass UOL não anuncia.",
            "Service Desk com 47.750 chamados/mês e 94% de resolução no primeiro contato: operação de suporte em escala real.",
            "Vertical de Saúde completa: maior canal Tasy da América Latina, PACS e AMS especializados sem concorrência declarada da Compass.",
            "Mais de 250 instituições integradas via APIs seguras, incluindo SAP, Salesforce, TOTVS e ServiceNow.",
            "Intelligence Hub executa o roadmap de transformação, não apenas entrega relatório: diferencial concreto frente a consultorias."
          ],
          "fraquezas": [
            "Compass UOL é Parceira do Ano da AWS no Brasil em 2026, selo que a Digisystem não possui publicamente.",
            "Compass tem histórico de modernização de mainframe e Oracle, áreas não listadas no portfólio ativo da Digisystem.",
            "A marca Compass UOL tem visibilidade internacional via grupo AI/R, enquanto a Digisystem atua em Brasil, Colômbia e Argentina."
          ],
          "oportunidades": [
            "Compass não anuncia atuação em Governo; a Digisystem pode avançar em contratos públicos sem disputa direta.",
            "Sem Field Service ou Suporte Residente visíveis na Compass, há espaço para liderar em operações presenciais distribuídas.",
            "A vertical de Saúde da Digisystem (Tasy, PACS, AMS) não tem equivalente declarado na Compass, abrindo espaço em hospitais e operadoras.",
            "Alocação de mais de 3.000 profissionais com seleção por IA é diferencial que a Compass não comunica publicamente."
          ],
          "ameacas": [
            "O selo AWS Parceira do Ano pode favorecer a Compass em disputas de cloud nos segmentos Financeiro e Energia.",
            "A modernização de mainframe da Compass pode atrair bancos e seguradoras antes que a Digisystem apresente alternativa clara.",
            "O grupo AI/R amplia o alcance da Compass com recursos e marca globais, o que pode influenciar decisões de grandes contas.",
            "Foco declarado em dados e IA da Compass compete diretamente com a NIA e o portfólio de Dados e Analytics da Digisystem."
          ]
        }
      }
    },
    {
      "id": "dee3b3e3-2781-4d9e-b798-6150a9857203",
      "nome": "Compwire",
      "slug": "compwire",
      "logo": "mercado/logos/compwire.png",
      "descricao": "Integradora de TI de Curitiba, fundada em 1996, com infraestrutura, armazenamento e backup, nuvem, segurança e serviços gerenciados para empresas e governo em todo o Brasil.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/compwire.informatica"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/compwire-inform-tica-ltda"
        },
        {
          "tipo": "site",
          "url": "https://www.compwire.com.br/"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "51 a 200 colaboradores (ZoomInfo, estimativa)",
        "faixaPreco": null,
        "risco": 2,
        "riscoMotivo": "Pouca sobreposição de portfólio; presença regional relevante.",
        "diferenciais": "1. Fundada em 1996 em Curitiba, com mais de 25 anos de mercado. 2. Gestão de ambientes de missão crítica de alta disponibilidade. 3. Parceira dos principais fornecedores de nuvem pública.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Empresas e governo.",
      "presencaRegional": "Sede em Curitiba (PR), com unidades em Florianópolis e Goiânia; vende em todo o Brasil.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 1,
        "regional": 2,
        "porte": 0,
        "pontuacao": "1,1",
        "justificativa": "Sobreposição 1: 1 item(ns) do portfólio (Serviços Gerenciados: Cloud). Segmentos 1: 2 em comum (Governo, Multimercado). Regional 2: Sede em Curitiba (PR), com unidades em Florianópolis e Goiânia; vende em todo o Brasil. Porte 0: 51+ colaboradores.",
        "riscoPlanilha": 2.8
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:55:41.515+00:00",
        "itens": {
          "forcas": [
            "Portfólio vai muito além da infraestrutura: desenvolvimento, dados, IA e soluções financeiras cobrem camadas que a Compwire não atinge.",
            "A NIA e o AIOps colocam inteligência artificial na operação, enquanto a Compwire não sinaliza nada nesse campo.",
            "Presença em mais de 350 localidades e 3.000 profissionais alocados mostram escala nacional difícil de replicar.",
            "Especialização em Saúde, com Tasy e PACS, cria um diferencial vertical que a Compwire, generalista, não tem.",
            "Intelligence Hub une diagnóstico e execução, enquanto a Compwire entrega produto, não transformação."
          ],
          "fraquezas": [
            "A Compwire tem quase 30 anos focada só em infraestrutura, o que pode gerar percepção de maior profundidade técnica nesse tema.",
            "Empresas de médio porte tendem a ver integradores menores como mais ágeis e fáceis de contratar.",
            "A Digisystem não tem histórico público de atuação forte em armazenamento e backup, terreno consolidado da Compwire."
          ],
          "oportunidades": [
            "Clientes de governo e empresas que já usam a Compwire para infra podem precisar evoluir para dados, IA e integração, onde a Digisystem atua.",
            "A Compwire não demonstra especialização setorial, o que abre espaço para a Digisystem em Saúde, Serviços Financeiros e Energia.",
            "Organizações que querem ir além do suporte reativo e adotar AIOps e Observabilidade não encontrarão isso na Compwire.",
            "Field Service com cobertura nacional é um diferencial que pode converter clientes que hoje dependem de fornecedores regionais."
          ],
          "ameacas": [
            "A Compwire pode ser percebida como opção mais simples e barata para contratações de infraestrutura em processos licitatórios.",
            "A proximidade regional em Curitiba e sul do Brasil pode favorecer a Compwire em decisões de compra locais.",
            "Integradores de infra estão expandindo para nuvem gerenciada, o que pode aproximar a Compwire de um portfólio mais próximo ao nosso."
          ]
        }
      }
    },
    {
      "id": "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
      "nome": "CTC",
      "slug": "ctc",
      "logo": null,
      "descricao": "Consultoria brasileira de tecnologia (CTC Tech), com mais de 30 anos de mercado, que atende os setores público e privado e apresentou em 2026 uma metodologia de projetos de software com agentes de IA supervisionados por pessoas.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/ctcconnectcom"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/ctc.tech"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/ctctech"
        },
        {
          "tipo": "site",
          "url": "https://ctctech.com.br"
        }
      ],
      "temas": [
        {
          "tema": "Soluções práticas e humanização da tecnologia",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "Cerca de 2.265 pessoas (Crustdata, estimativa de out/2026); a planilha trazia 50+",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Mais de 30 anos de mercado em tecnologia. 2. Metodologia de projetos de software com agentes de IA supervisionados por pessoas (2026). 3. Atende clientes do setor público e do privado.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Setores público e privado, vários segmentos (LinkedIn); a planilha marca saúde, governo, serviços financeiros e multimercado.",
      "presencaRegional": "Sede em São Paulo (SP), segundo base de terceiros (Crustdata); atende o Brasil.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "db69daf9-928f-4db0-b60c-0d84f7567cca",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5"
      ],
      "segmentosEmComum": [
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "891548c0-8f2e-46f9-92e7-9b456660be8e"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,5",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: APIS & Integração; Desenvolvimento: Soluções Digitais; Digital Workplace Services: Service Desk). Segmentos 3: 4 em comum (Saúde, Governo, Multimercado, Serviços Financeiros). Regional 3: Sede em São Paulo (SP), segundo base de terceiros (Crustdata); atende o Brasil. Porte 2: 2.265+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T16:40:09.135+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: da Gestão Hospitalar ao AIOps, cobrindo grandes empresas onde a CTC tem lacunas.",
            "Presença em mais de 350 localidades com Field Service presencial, enquanto a CTC não declara cobertura nacional.",
            "Mais de 250 instituições integradas via API, ante uma oferta de interoperabilidade ainda em construção pela CTC.",
            "Service Desk com 47.750 chamados/mês e 94% de resolução no primeiro contato, com métricas públicas e rastreáveis.",
            "Atuação internacional na Colômbia e Argentina; a CTC opera apenas no Brasil."
          ],
          "fraquezas": [
            "A CTC tem foco declarado em saúde e histórico consolidado no setor, com clientes como HCor e Johnson & Johnson.",
            "Expertise específica em autoatendimento é um diferencial da CTC que a Digisystem não declara explicitamente no portfólio.",
            "A CTC carrega certificação SAP Certified Partner, o que pode pesar em disputas onde SAP é o sistema central do cliente."
          ],
          "oportunidades": [
            "A CTC está apostando em agronegócio e energia renovável para 2025-2026, deixando espaço para a Digisystem avançar nos segmentos atuais dela.",
            "Portfolio menos diversificado da CTC para grandes contratos abre porta para a Digisystem entrar com propostas de serviços gerenciados completos.",
            "Presença digital fraca e conteúdo esporádico da CTC permitem que a Digisystem ocupe mais visibilidade nos segmentos que ambas disputam.",
            "Clientes da CTC em service desk, como Claro e Porto Seguro, podem ser abordados com uma oferta mais robusta e com métricas comprovadas."
          ],
          "ameacas": [
            "A CTC pode aprofundar o relacionamento em saúde com clientes de alto valor, dificultando a entrada da Digisystem nessas contas.",
            "A parceria com Microsoft e Oracle dá à CTC credenciais que podem ser decisivas em processos competitivos no setor financeiro e governo.",
            "Se a CTC expandir para energia renovável com a mesma abordagem de humanização da tecnologia, pode competir diretamente com a Digisystem no segmento.",
            "O posicionamento de co-criação e foco em pessoas pode ressoar bem em clientes que buscam uma relação mais próxima do que contratos tradicionais de TI."
          ]
        }
      }
    },
    {
      "id": "f878c625-a8d9-4f5a-a8d0-e2248f1b0400",
      "nome": "Dedalus (Dedalus Prime)",
      "slug": "dedalus-dedalus-prime",
      "logo": "mercado/logos/dedalus-dedalus-prime.png",
      "descricao": "Empresa especialista em cloud computing (Dedalus Prime), parceira AWS e Azure com atuação no Brasil e na América Latina. Não é a Dedalus Healthcare, de software de saúde.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/dedalus.cloudcomputing"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/dedalus.cloud"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/dedalus-prime"
        },
        {
          "tipo": "site",
          "url": "https://dedalusprime.com/br/"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "Mais de 170 colaboradores (página de carreiras da empresa; sem data)",
        "faixaPreco": null,
        "risco": 2,
        "riscoMotivo": "Pouca sobreposição de portfólio; presença regional relevante.",
        "diferenciais": "1. Especialista em cloud computing na América Latina. 2. Parceira AWS e Azure. 3. Gestão de nuvem sem perder escalabilidade e segurança.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": null,
      "presencaRegional": "Brasil e América Latina (sede não confirmada).",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 0,
        "regional": 2,
        "porte": 1,
        "pontuacao": "0,9",
        "justificativa": "Sobreposição 1: 1 item(ns) do portfólio (Serviços Gerenciados: Cloud). Segmentos 0: 0 em comum. Regional 2: Brasil e América Latina (sede não confirmada). Porte 1: 170+ colaboradores.",
        "riscoPlanilha": 3.5
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:09:50.195+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: da gestão hospitalar a soluções financeiras, enquanto a Dedalus Prime foca em cloud.",
            "Presença física em mais de 350 localidades brasileiras via Field Service, sem paralelo conhecido na Dedalus Prime.",
            "Mais de 3.000 profissionais alocados e Service Desk com 94% de resolução no primeiro contato.",
            "Atuação em Governo, segmento que a Dedalus Prime não declara atender.",
            "NIA e Intelligence Hub entregam execução de roadmap, não só diagnóstico ou infraestrutura."
          ],
          "fraquezas": [
            "Dedalus Prime é Premier Consulting Partner da AWS, parceria de alto nível que a Digisystem não declara ter nesse patamar.",
            "Especialização profunda em cloud pode ser percebida como mais sólida na Dedalus Prime por quem busca só esse serviço."
          ],
          "oportunidades": [
            "Dedalus Prime não declara atuação em Saúde estruturada; a Digisystem tem Tasy, PACS e AMS como diferenciais claros nesse setor.",
            "Sem oferta conhecida de Workplace Services, a Dedalus Prime deixa aberto o suporte presencial e residente ao usuário final.",
            "Clientes que precisam integrar sistemas legados (SAP, TOTVS, Salesforce) não encontram isso declarado no portfólio da Dedalus Prime.",
            "Segmento financeiro crítico, como pagamento de garantias, é terreno exclusivo da Digisystem nessa comparação.",
            "Alocação de profissionais com seleção por IA é uma oferta que a Dedalus Prime não apresenta publicamente."
          ],
          "ameacas": [
            "A parceria Premier AWS pode atrair clientes que priorizam credencial de nuvem reconhecida globalmente.",
            "Foco estreito em cloud pode posicionar a Dedalus Prime como especialista, enquanto a Digisystem é vista como generalista.",
            "Expansão da Dedalus Prime na América Latina pode disputar os mesmos territórios onde a Digisystem já atua."
          ]
        }
      }
    },
    {
      "id": "3ae4b0c3-1115-42f9-a694-7e0e8871c48f",
      "nome": "Delfia Tech",
      "slug": "delfia-tech",
      "logo": "mercado/logos/delfia-tech.png",
      "descricao": "Consultoria digital brasileira, com quase duas décadas de atuação, que se apresenta como curadoria de jornadas digitais e expande a operação na América Latina.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/delfiatech"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/delfia.tech"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/delfia"
        },
        {
          "tipo": "site",
          "url": "https://delfia.tech/"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "490 colaboradores e mais de 250 clientes (Valor, ago/2025); Crustdata estima 694 em set/2026",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Sobreposição parcial de portfólio; atua na mesma praça.",
        "diferenciais": "1. Receita de R$ 340 milhões em 2025, 43% acima de 2024. 2. Receita internacional cresceu 406% entre 2022 e 2024. 3. Posicionamento de curadoria de jornada digital.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Setores financeiro, telecomunicações e tecnologia (operação de field service).",
      "presencaRegional": "Sede em Barueri (SP), segundo Crustdata; centro de operações em São Roque (SP); atende todo o Brasil.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "229a802e-b6f6-4d29-8855-11c9eebf420e",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
        "350a1f5e-00b0-45cc-b365-9209c091267d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 1,
        "regional": 3,
        "porte": 1,
        "pontuacao": "1,8",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Digital Workplace Services: Field Service; Digital Workplace Services: Service Desk; Intelligence Hub). Segmentos 1: 2 em comum (Serviços Financeiros, Multimercado). Regional 3: Sede em Barueri (SP), segundo Crustdata; centro de operações em São Roque (SP); atende todo o Brasil. Porte 1: 490+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:53:16.043+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: vai de Field Service e Service Desk a Cloud, AIOps, IA e Gestão Hospitalar, enquanto a Delfia Tech foca em jornadas digitais.",
            "Presença física em mais de 350 localidades brasileiras com suporte presencial estruturado.",
            "Mais de 250 instituições integradas via APIs seguras, com cobertura que inclui SAP, Salesforce, TOTVS e ServiceNow.",
            "Atuação em Saúde com diferenciais exclusivos: maior canal Tasy da América Latina e PACS para imagens médicas.",
            "Mais de 3.000 profissionais alocados e Service Desk com 94% de resolução no primeiro contato, com métricas auditáveis."
          ],
          "fraquezas": [
            "A Delfia Tech tem quase duas décadas de mercado, o que pode representar relacionamentos consolidados em financeiro e telecom.",
            "O posicionamento de 'curadoria de jornadas digitais' é mais focado e pode soar mais especializado para clientes que buscam consultoria pura.",
            "Não há informações públicas suficientes para comparar presença de marca digital entre as duas empresas."
          ],
          "oportunidades": [
            "A Delfia Tech não atua visivelmente em Saúde nem em Governo, dois segmentos centrais da Digisystem.",
            "O segmento de Energia aparece no portfólio da Digisystem e não há evidência de atuação da Delfia Tech nele.",
            "Clientes de Field Service em telecom atendidos pela Delfia Tech podem demandar serviços gerenciados e AIOps que ela não entrega.",
            "A inteligência artificial aplicada à operação, como a NIA, é um diferencial que a Delfia Tech não demonstra ter.",
            "Empresas que crescem com a Delfia Tech em consultoria podem precisar de execução e sustentação, que é onde a Digisystem entra."
          ],
          "ameacas": [
            "A expansão da Delfia Tech na América Latina pode disputar os mesmos territórios que a Digisystem já ocupa na Colômbia e Argentina.",
            "O posicionamento consultivo da Delfia Tech pode influenciar decisões de compra antes de a Digisystem entrar na conversa.",
            "Em financeiro e telecom, a Delfia Tech tem histórico longo e pode estar mais enraizada em contas que a Digisystem quer crescer."
          ]
        }
      }
    },
    {
      "id": "44f2a61a-73ff-4b4a-9960-1b512d7bcd22",
      "nome": "Dextra",
      "slug": "dextra",
      "logo": null,
      "descricao": "Empresa de software de Campinas (SP), fundada em 1995, que criava produtos digitais de ponta a ponta. Foi adquirida pela CI&T em julho de 2021.",
      "links": [],
      "temas": [],
      "ficha": {
        "porte": "1.200 profissionais na data da aquisição pela CI&T (2021)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Atua na mesma praça; pouca sobreposição de portfólio.",
        "diferenciais": "1. Fundada em 1995 em Campinas. 2. Produtos digitais de ponta a ponta com squads ágeis. 3. Incorporada à CI&T em 2021.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Clientes na aquisição: Alelo, Serasa Experian, McDonald's, Solvay.",
      "presencaRegional": "Campinas (SP); hoje integrada à CI&T.",
      "situacao": "marca absorvida",
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 1,
        "regional": 3,
        "porte": 2,
        "pontuacao": "1,5",
        "justificativa": "Sobreposição 1: 1 item(ns) do portfólio (Desenvolvimento: Soluções Digitais). Segmentos 1: 2 em comum (Serviços Financeiros, Multimercado). Regional 3: Campinas (SP); hoje integrada à CI&T. Porte 2: 1.200+ colaboradores.",
        "riscoPlanilha": 2.6
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:54:29.004+00:00",
        "itens": {
          "forcas": [
            "Portfólio amplo: desenvolvimento, workplace, cloud, dados, IA e saúde num só fornecedor, sem depender de aquisições.",
            "Presença física em mais de 350 localidades no Brasil, além de Colômbia e Argentina.",
            "Mais de 250 instituições integradas via APIs seguras, com histórico em sistemas críticos do mercado financeiro.",
            "Gestão Hospitalar especializada: maior canal Tasy da América Latina, com PACS e sustentação dedicada.",
            "Mais de 3.000 profissionais alocados e Service Desk com 94% de resolução no primeiro contato."
          ],
          "fraquezas": [
            "A Dextra construiu reputação sólida em criação de produtos digitais de ponta a ponta por mais de 25 anos.",
            "Clientes como Alelo, Serasa Experian e McDonald's indicam forte presença em grandes contas de mercado privado.",
            "Agora integrada à CI&T, a Dextra acessa recursos, metodologia e rede global de uma empresa listada em bolsa."
          ],
          "oportunidades": [
            "A Dextra não atua em Governo; a Digisystem tem portfólio e histórico nesse segmento para avançar sem concorrência direta.",
            "Saúde é um vertical ausente na Dextra e presente em toda a stack da Digisystem, do Tasy ao AIOps.",
            "Com a absorção pela CI&T, a marca Dextra tende a diluir; clientes que valorizavam o relacionamento podem migrar.",
            "Energia é um segmento que a Dextra não endereçava e que a Digisystem cobre com múltiplos produtos."
          ],
          "ameacas": [
            "A CI&T tem escala global e pode oferecer contratos maiores e mais competitivos para clientes enterprise.",
            "A combinação CI&T e Dextra cria uma oferta forte em design e engenharia de produto que a Digisystem não declara explicitamente.",
            "A carteira de grandes marcas da Dextra pode ser usada como referência para abrir portas em Serviços Financeiros e Multimercado.",
            "A CI&T pode usar a Dextra para entrar em contas de médio porte no Brasil, segmento que a Digisystem também disputa."
          ]
        }
      }
    },
    {
      "id": "0a021021-4a64-414e-985f-5e5f0dabf615",
      "nome": "Engesoftware",
      "slug": "engesoftware",
      "logo": "mercado/logos/engesoftware.png",
      "descricao": "Empresa de TI de Brasília, fundada em 1995, que atende o Brasil todo com fábrica de software, outsourcing de TI, consultoria e suporte, administração de banco de dados, virtualização e DevOps. Tem certificação ISO 9001 desde 1999.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/EngesoftwareTecnologiaSa"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/engesoftwaretecnologiasa"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/engesoftware"
        },
        {
          "tipo": "site",
          "url": "https://www.engesoftware.com"
        }
      ],
      "temas": [
        {
          "tema": "Tendências de TI",
          "frequencia": 1
        },
        {
          "tema": "Cases de sucesso e inovações tecnológicas",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "100+ colaboradores (LinkedIn)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Sobreposição parcial de portfólio; três segmentos em comum.",
        "diferenciais": "1. Atuação desde 1995, com ISO 9001 desde 1999. 2. Atendimento nacional a partir de Brasília. 3. Serviços de fábrica de software, outsourcing e administração de banco de dados.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Governo, saúde, educação, empresas privadas.",
      "presencaRegional": "Sede em Brasília (DF), desde 1995; atende o Centro-Oeste desde 1996 e os demais estados desde 1997; equipe também em Fortaleza (CE).",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
        "350a1f5e-00b0-45cc-b365-9209c091267d",
        "22e4a71a-42b6-40ac-9ce6-42317c81480c"
      ],
      "segmentosEmComum": [
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 2,
        "regional": 3,
        "porte": 1,
        "pontuacao": "2,1",
        "justificativa": "Sobreposição 2: 4 item(ns) do portfólio (Desenvolvimento: Soluções Digitais; Digital Workplace Services: Service Desk; Intelligence Hub; Serviços Gerenciados: DBA as a Service). Segmentos 2: 3 em comum (Governo, Saúde, Multimercado). Regional 3: Sede em Brasília (DF), desde 1995; atende o Centro-Oeste desde 1996 e os demais estados desde 1997; equipe também em Fortaleza (CE). Porte 1: 100+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:49:36.704+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: da consultoria executiva ao campo, cobrindo Saúde, Financeiro, Governo e Energia num só contrato.",
            "Mais de 250 instituições integradas via API, incluindo SAP, Salesforce, TOTVS e ServiceNow, algo que a Engesoftware não declara.",
            "NIA e AIOps trazem IA aplicada à operação, não só como tendência de conteúdo, mas como produto entregue ao cliente.",
            "Field Service em mais de 350 localidades e Service Desk com 94% de resolução no primeiro contato são diferenciais mensuráveis.",
            "Presença internacional na Colômbia e Argentina amplia credibilidade para clientes com operação além do Brasil."
          ],
          "fraquezas": [
            "Engesoftware tem certificação ISO 9001 desde 1999, o que pode pesar em licitações que exigem histórico longo de qualidade certificada.",
            "Fundada em 1995, a Engesoftware carrega quase três décadas de relacionamento com o setor público, especialmente em Brasília.",
            "A Engesoftware atende educação, segmento que a Digisystem não cobre com produtos declarados no portfólio atual."
          ],
          "oportunidades": [
            "Engesoftware não apresenta solução declarada de Dados e IA aplicada, abrindo espaço para a Digisystem posicionar NIA e Analytics.",
            "Ausência de produto específico para Saúde na Engesoftware deixa o mercado hospitalar aberto para Tasy e PACS da Digisystem.",
            "Sem solução financeira declarada, a Engesoftware não compete no nicho de sistemas críticos de pagamento e garantias.",
            "Engesoftware não menciona atuação fora do Brasil, o que posiciona a Digisystem para clientes com expansão regional na América Latina.",
            "Conteúdo da Engesoftware é genérico em tendências de TI, abrindo espaço para a Digisystem comunicar cases com números reais."
          ],
          "ameacas": [
            "Engesoftware oferece outsourcing de TI, fábrica de software e consultoria, cobrindo frentes similares às da Digisystem em Governo e Saúde.",
            "Longa presença em Brasília e relacionamento consolidado com órgãos públicos pode dificultar a entrada da Digisystem em alguns contratos federais.",
            "Virtualização e DevOps no portfólio da Engesoftware concorrem diretamente com os Serviços Gerenciados e Cloud da Digisystem.",
            "Administração de banco de dados oferecida pela Engesoftware compete com o DBA as a Service da Digisystem nos mesmos segmentos."
          ]
        }
      }
    },
    {
      "id": "98e44789-9beb-4400-aed8-2cc50e47c5e9",
      "nome": "FCamara",
      "slug": "fcamara",
      "logo": "mercado/logos/fcamara.png",
      "descricao": "Ecossistema brasileiro de tecnologia e inovação, com mais de 16 anos, operações na Europa, no Reino Unido e nos Emirados, que oferece e-commerce, consultoria e outsourcing de TI, nuvem e cibersegurança (esta após comprar a SGA).",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/grupo.fcamara"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/grupo.fcamara"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/grupofcamara"
        },
        {
          "tipo": "site",
          "url": "https://fcamara.com"
        }
      ],
      "temas": [
        {
          "tema": "Transformação digital",
          "frequencia": 1
        },
        {
          "tema": "Inovação e tendências tecnológicas",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "1.000+ colaboradores (LinkedIn). Faturamento R$ 500 milhões 2022",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Sobreposição parcial de portfólio; três segmentos em comum.",
        "diferenciais": "1. Mais de 16 anos de atuação como multinacional brasileira. 2. Crescimento por aquisições (SGA, em nuvem e cibersegurança). 3. Oferta completa de TI para e-commerce e saúde.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Comércio eletrônico e varejo, saúde (Exame); serviços financeiros e multimercado (planilha).",
      "presencaRegional": "Empresa paulistana (SP), com operações na Europa, no Reino Unido e nos Emirados Árabes.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "4e4d4e8b-d431-496e-812a-8714e3164d01",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "891548c0-8f2e-46f9-92e7-9b456660be8e"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 2,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,2",
        "justificativa": "Sobreposição 2: 4 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Soluções Digitais; Desenvolvimento: Soluções Financeiras; Serviços Gerenciados: Cloud). Segmentos 2: 3 em comum (Multimercado, Saúde, Serviços Financeiros). Regional 3: Empresa paulistana (SP), com operações na Europa, no Reino Unido e nos Emirados Árabes. Porte 2: 1.000+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:48:54.455+00:00",
        "itens": {
          "forcas": [
            "Presença consolidada em Governo, segmento que a FCamara não demonstra atuação relevante.",
            "Field Service em mais de 350 localidades no Brasil, com capilaridade operacional que vai além do digital.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados mensais documentados.",
            "Gestão Hospitalar especializada: maior canal Tasy da América Latina, com PACS e AMS dedicados à Saúde.",
            "Intelligence Hub executa o roadmap, não apenas entrega diagnóstico, diferenciando da consultoria tradicional."
          ],
          "fraquezas": [
            "FCamara tem operações na Europa, Reino Unido e Emirados, enquanto a Digisystem atua só no Brasil, Colômbia e Argentina.",
            "FCamara oferece e-commerce, vertical que a Digisystem não cobre com produtos próprios.",
            "Cibersegurança como oferta estruturada está no portfólio da FCamara (via SGA); a Digisystem não apresenta essa vertical explicitamente.",
            "FCamara tem mais de 16 anos de marca consolidada no ecossistema de inovação brasileiro."
          ],
          "oportunidades": [
            "FCamara não demonstra atuação em Governo, deixando espaço aberto para a Digisystem crescer nesse segmento.",
            "A vertical de Saúde da FCamara parece pontual; a Digisystem pode avançar com Tasy, PACS e AMS de forma mais profunda.",
            "FCamara não apresenta Field Service físico estruturado; clientes que precisam de suporte presencial ficam descobertos.",
            "Soluções Financeiras críticas, como o sistema de pagamento de garantias, são diferenciais que a FCamara não entrega.",
            "AIOps com FinOps e Observabilidade 24x7 atendem demandas que o portfólio da FCamara não cobre de forma evidente."
          ],
          "ameacas": [
            "A compra da SGA sinaliza que a FCamara está estruturando cibersegurança, podendo ampliar o portfólio e atrair clientes da Digisystem.",
            "Atuação em outsourcing de TI e consultoria coloca a FCamara em disputa direta pela carteira de Serviços Financeiros e Multimercado.",
            "Presença internacional da FCamara pode atrair grandes contas que valorizam parceiros com alcance global.",
            "Tema forte em inovação e tendências tecnológicas pode posicionar a FCamara como referência de thought leadership no mercado."
          ]
        }
      }
    },
    {
      "id": "50540c32-aad8-4f15-a7ba-52b82023db40",
      "nome": "FindUp",
      "slug": "findup",
      "logo": "mercado/logos/findup.png",
      "descricao": "Empresa de suporte de TI fundada em 2015, que se apresenta com a maior rede de técnicos do país para atendimento a usuários, aliando tecnologia e atendimento presencial.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/findup"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/finduptech"
        },
        {
          "tipo": "site",
          "url": "https://www.findup.com.br/"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "144 pessoas (Revelio Labs, jun/2026) e rede de mais de 17 mil técnicos de TI parceiros (Glassdoor)",
        "faixaPreco": null,
        "risco": 2,
        "riscoMotivo": "Atua na mesma praça; pouca sobreposição de portfólio.",
        "diferenciais": "1. Maior rede de técnicos do país, segundo o próprio site. 2. Atendimento a usuários com tecnologia de gestão. 3. Fundada em 2015 no setor de suporte de TI.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": null,
      "presencaRegional": "Sede em Recife (PE), segundo Revelio; atendimento nacional por rede de técnicos.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "229a802e-b6f6-4d29-8855-11c9eebf420e",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5"
      ],
      "segmentosEmComum": [],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 0,
        "regional": 3,
        "porte": 1,
        "pontuacao": "1,1",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Digital Workplace Services: Field Service; Digital Workplace Services: Service Desk). Segmentos 0: 0 em comum. Regional 3: Sede em Recife (PE), segundo Revelio; atendimento nacional por rede de técnicos. Porte 1: 144+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:56:05.753+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: vai de Service Desk e Field Service a IA, Cloud e Dados, enquanto a FindUp foca em suporte de TI.",
            "Presença em setores regulados como Governo, Saúde e Serviços Financeiros, com soluções verticalizadas para cada um.",
            "NIA e AIOps permitem operação automatizada e proativa, bem além do atendimento reativo que a FindUp oferece.",
            "Mais de 350 localidades atendidas em Field Service presencial, com números públicos de chamados e uptime.",
            "Intelligence Hub entrega execução do roadmap, não só diagnóstico — diferencial claro frente a um fornecedor de suporte."
          ],
          "fraquezas": [
            "A FindUp se posiciona como maior rede de técnicos do país, o que pode ser percebido como especialização em capilaridade de campo.",
            "Empresa fundada em 2015 com foco único em suporte pode transmitir mensagem mais simples e direta ao comprador de TI operacional.",
            "Sem informação pública suficiente sobre a FindUp para mapear outras desvantagens com precisão."
          ],
          "oportunidades": [
            "Clientes que começaram com suporte básico da FindUp e precisam evoluir para transformação digital são um público natural para a Digisystem.",
            "A ausência de soluções de Dados, IA e Cloud na FindUp abre espaço para a Digisystem entrar como parceiro estratégico nesses mesmos clientes.",
            "Setores como Saúde e Serviços Financeiros demandam conformidade e integração complexa, onde a FindUp não parece atuar de forma especializada."
          ],
          "ameacas": [
            "Se a FindUp tem capilaridade nacional de técnicos, pode disputar contratos de Field Service e Suporte Residente por preço menor.",
            "Proposta simples e objetiva de suporte pode ganhar processos de compra onde o cliente quer apenas resolver chamados, sem transformação.",
            "Sem dados públicos suficientes sobre movimentos estratégicos da FindUp para mapear outras ameaças com precisão."
          ]
        }
      }
    },
    {
      "id": "a7a56864-85e1-4949-8e05-47b9b2553b9e",
      "nome": "G4F",
      "slug": "g4f",
      "logo": "mercado/logos/g4f.png",
      "descricao": "Integradora de tecnologia de Brasília, fundada em 2009, especializada em demandas do setor público e de estatais, com clientes como Petrobras, BNDES, TSE, Eletrobras e Copel. Oferece consultoria, fábrica de software, alocação de profissionais e gestão de serviços de TI.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/g4fbr"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/g4fbr"
        },
        {
          "tipo": "site",
          "url": "https://www.g4f.com.br"
        }
      ],
      "temas": [
        {
          "tema": "Inovação em TI e serviços gerenciados",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "Mais de 8.000 colaboradores (Exame, 2025); o LinkedIn da empresa cita mais de 10.000; a planilha trazia 200+",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Mais de 8.000 colaboradores em todo o país. 2. Especialização em demandas complexas do setor público e de estatais. 3. Clientes de grande porte: Petrobras, BNDES, TSE, Eletrobras e Copel.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Governo e estatais, energia (Eletrobras, Copel, Petrobras) e financeiro (BNDES), confirmados na Exame; saúde e multimercado só na planilha.",
      "presencaRegional": "Sede em Brasília (DF); presença em todo o país.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "350a1f5e-00b0-45cc-b365-9209c091267d",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "7387b283-bbf3-4fff-8885-22b643d4d458",
        "891548c0-8f2e-46f9-92e7-9b456660be8e"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,5",
        "justificativa": "Sobreposição 2: 4 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Soluções Digitais; Intelligence Hub; Serviços Gerenciados: Cloud). Segmentos 3: 5 em comum (Multimercado, Saúde, Governo, Energia, Serviços Financeiros). Regional 3: Sede em Brasília (DF); presença em todo o país. Porte 2: 8.000+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:46:28.827+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: da consultoria com execução (Intelligence Hub) a Gestão Hospitalar, Dados & IA e Cloud, em cinco segmentos.",
            "Presença física em mais de 350 localidades no Brasil, além de Colômbia e Argentina, contra atuação concentrada em Brasília.",
            "Service Desk com 47.750 chamados/mês e 94% de resolução no primeiro contato, com métricas e SLA estruturados.",
            "NIA (Núcleo de Inteligência Artificial) com modelo agêntico que cruza dados de qualquer sistema, sem equivalente confirmado na G4F.",
            "Mais de 250 instituições integradas via APIs seguras, conectando sistemas legados, SAP, Salesforce, TOTVS e ServiceNow."
          ],
          "fraquezas": [
            "G4F tem relacionamento consolidado com clientes de peso no setor público federal, como TSE, Petrobras, BNDES, Eletrobras e Copel.",
            "Por ser baseada em Brasília, a G4F pode ter acesso e proximidade política com decisores do governo federal que a Digisystem não possui na mesma medida.",
            "A G4F atua desde 2009 com foco exclusivo em governo e estatais, o que gera especialização e reputação setorial difíceis de superar rapidamente."
          ],
          "oportunidades": [
            "Saúde é um segmento sem presença confirmada da G4F: a Digisystem pode avançar com Tasy, PACS e Gestão Hospitalar sem concorrência direta.",
            "A G4F não tem oferta confirmada de IA aplicada à operação, o que abre espaço para a NIA em contas públicas que buscam automação.",
            "Municípios e órgãos estaduais fora de Brasília são um espaço pouco coberto pela G4F, onde a capilaridade da Digisystem é um diferencial real.",
            "Empresas de energia e financeiras que já conhecem a G4F podem buscar um parceiro com portfólio mais completo, incluindo Cloud e AIOps.",
            "Multimercado não tem presença confirmada da G4F, deixando empresas privadas de médio e grande porte acessíveis para a Digisystem."
          ],
          "ameacas": [
            "A G4F pode ampliar contratos dentro de estatais onde já está estabelecida, dificultando a entrada da Digisystem nessas contas.",
            "Em licitações federais, o histórico da G4F com órgãos como TSE e BNDES é um critério de qualificação que pesa contra novos entrantes.",
            "A G4F pode expandir seu portfólio de serviços gerenciados e fábrica de software para segmentos onde a Digisystem já atua, como energia e financeiro.",
            "Parcerias ou contratos de longo prazo da G4F com estatais criam barreiras de saída altas, reduzindo janelas de disputa para a Digisystem."
          ]
        }
      }
    },
    {
      "id": "4a68dd43-af37-4cce-80a0-6dbdb281800c",
      "nome": "GFT",
      "slug": "gft",
      "logo": "mercado/logos/gft.ico",
      "descricao": "Parceiro tecnológico global, centrado em IA, com origem no setor bancário e financeiro, que atende clientes de vários setores; no Brasil oferece engenharia, serviços gerenciados e design.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/gfttechnologiesbrasil"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/gft_technologies_brasil"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/gft-technologies-brasil"
        },
        {
          "tipo": "site",
          "url": "https://www.gft.com/br/pt"
        }
      ],
      "temas": [
        {
          "tema": "Inteligência artificial",
          "frequencia": 1
        },
        {
          "tema": "Transformação digital",
          "frequencia": 1
        },
        {
          "tema": "Inovação tecnológica",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "12.000+ colaboradores (LinkedIn). Faturamento € 730 milhões 2022",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Sobreposição parcial de portfólio; atua na mesma praça.",
        "diferenciais": "1. Origem no setor bancário e financeiro, com décadas de experiência. 2. Serviços que combinam estratégia, engenharia e IA. 3. Parcerias estratégicas em nuvem, core banking e seguros.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Bancos e finanças (origem), seguradoras (parceira Guidewire) e clientes de outros setores; multimercado na planilha.",
      "presencaRegional": "Operação no Brasil (site gft.com/br) e presença global; sede nacional não conferida.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "4e4d4e8b-d431-496e-812a-8714e3164d01",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 1,
        "regional": 3,
        "porte": 3,
        "pontuacao": "2",
        "justificativa": "Sobreposição 2: 4 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Desenvolvimento: Soluções Financeiras; Serviços Gerenciados: Cloud). Segmentos 1: 2 em comum (Serviços Financeiros, Multimercado). Regional 3: Operação no Brasil (site gft.com/br) e presença global; sede nacional não conferida. Porte 3: 12.000+ colaboradores.",
        "riscoPlanilha": 3
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:51:41.798+00:00",
        "itens": {
          "forcas": [
            "Portfólio mais amplo: vai de diagnóstico consultivo (Pulse) a Field Service em mais de 350 localidades, algo que a GFT não declara ter.",
            "Presença física nacional com suporte presencial e Suporte Residente dentro do cliente, o que a GFT, como empresa global, tende a não oferecer.",
            "Atuação consolidada em Saúde (Tasy, PACS, AMS) e Governo, segmentos fora do foco histórico da GFT.",
            "Mais de 250 instituições integradas via APIs e um sistema crítico de pagamento de garantias conectado a todo o mercado financeiro nacional.",
            "Mais de 3.000 profissionais alocados com seleção apoiada por IA, entregando escala sem aumentar o headcount do cliente."
          ],
          "fraquezas": [
            "A GFT tem origem bancária forte e reputação consolidada no setor financeiro global, o que pode pesar em decisões de grandes bancos internacionais.",
            "Como parceira Guidewire, a GFT tem entrada direta em seguradoras, nicho que a Digisystem não menciona nos dados disponíveis.",
            "A GFT opera em escala global, o que pode ser decisivo para multinacionais que buscam um parceiro com presença em vários países além de Brasil, Colômbia e Argentina."
          ],
          "oportunidades": [
            "A GFT não declara atuação em Governo; a Digisystem pode avançar nesse segmento sem concorrência direta dela.",
            "A GFT não apresenta serviços de Field Service ou suporte presencial estruturado; clientes que precisam de operação física ficam desatendidos por ela.",
            "A GFT publica sobre IA de forma genérica; a Digisystem pode mostrar aplicação real via NIA com modelo agêntico em operações concretas.",
            "Saúde é ausente no posicionamento público da GFT; a Digisystem pode consolidar liderança no setor com Tasy, PACS e AMS sem disputa direta.",
            "O Intelligence Hub executa o roadmap, não só entrega relatório; isso diferencia a Digisystem onde a GFT fica só na consultoria e engenharia."
          ],
          "ameacas": [
            "A GFT investe pesado em IA e transformação digital, temas que também são centrais para a Digisystem, o que acirra a disputa por budget de inovação.",
            "Com presença global e marca reconhecida, a GFT pode entrar em contas de Serviços Financeiros que hoje são da Digisystem.",
            "Serviços gerenciados e engenharia de software são ofertas que a GFT também tem, criando sobreposição direta em Multimercado.",
            "A GFT pode ampliar parcerias de ecossistema (como fez com Guidewire) e ocupar nichos verticais antes que a Digisystem chegue lá."
          ]
        }
      }
    },
    {
      "id": "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
      "nome": "Global Hitss",
      "slug": "global-hitss",
      "logo": "mercado/logos/global-hitss.png",
      "descricao": "Integradora de sistemas do grupo América Móvil (Claro, Embratel), com mais de 37 anos em soluções digitais e serviços de TI na América Latina e nos EUA. Oferece fábrica de software, infraestrutura, automação, nuvem, cibersegurança e análise avançada.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/globalhitssdobrasil"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/global-hitss"
        },
        {
          "tipo": "site",
          "url": "https://www.hitss.com/br/"
        }
      ],
      "temas": [
        {
          "tema": "Soluções inovadoras",
          "frequencia": 1
        },
        {
          "tema": "Casos de sucesso",
          "frequencia": 1
        },
        {
          "tema": "Transformação digital",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "Mais de 12.500 colaboradores no grupo (site global); cerca de 5.000 no Brasil (página de vagas Hitss Brasil)",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Sobreposição parcial de portfólio; três segmentos em comum.",
        "diferenciais": "1. Integradora de sistemas do grupo América Móvil. 2. Mais de 37 anos de experiência em soluções digitais. 3. Modelo de fábrica de software com DevOps e consultores especializados.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Telecomunicações, financeiro, varejo, manufatura.",
      "presencaRegional": "Operação no Brasil com cerca de 5.000 colaboradores; presença em 9 países (México, Chile, América Central, Colômbia, Equador, Peru, Brasil, Argentina e EUA).",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 2,
        "regional": 3,
        "porte": 3,
        "pontuacao": "2,3",
        "justificativa": "Sobreposição 2: 4 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Serviços Gerenciados: Cloud). Segmentos 2: 3 em comum (Multimercado, Serviços Financeiros, Governo). Regional 3: Operação no Brasil com cerca de 5.000 colaboradores; presença em 9 países (México, Chile, América Central, Colômbia, Equador, Peru, Brasil, Argentina e EUA). Porte 3: 12.500+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:48:09.116+00:00",
        "itens": {
          "forcas": [
            "Presença vertical profunda em Saúde e Governo, segmentos que a Global Hitss não atende com foco declarado.",
            "Intelligence Hub executa o roadmap; não entrega só um relatório, o que diferencia da consultoria tradicional.",
            "Mais de 250 instituições integradas via APIs seguras, com cobertura de plataformas como SAP, Salesforce e TOTVS.",
            "Field Service em mais de 350 localidades no Brasil, com suporte presencial que a Global Hitss não evidencia.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados mensais, com métricas públicas."
          ],
          "fraquezas": [
            "A Global Hitss pertence ao grupo América Móvil, o que dá peso de marca e musculatura financeira muito maiores.",
            "Histórico de 37 anos e atuação nos EUA ampliam a credibilidade internacional da Global Hitss frente à Digisystem.",
            "A Global Hitss cobre manufatura e varejo com portfólio declarado; a Digisystem não apresenta foco nesses segmentos.",
            "A base do grupo (Claro, Embratel) facilita ofertas integradas de conectividade mais TI, algo que a Digisystem não tem."
          ],
          "oportunidades": [
            "Saúde é ignorada pela Global Hitss: Tasy, PACS e AMS criam uma proposta completa que ela não consegue replicar.",
            "Governo exige compliance e presença local intensa; a Digisystem tem histórico e capilaridade que a concorrente não mostra.",
            "Soluções Financeiras críticas, como pagamento de garantias conectado a todas as instituições, não aparecem no portfólio dela.",
            "A NIA no modelo agêntico é diferencial concreto de IA aplicada; a Global Hitss fala em análise avançada, sem detalhar execução.",
            "Diagnóstico Pulse em até duas semanas é entrada rápida em contas que a concorrente aborda com ciclos de venda mais longos."
          ],
          "ameacas": [
            "A escala do grupo América Móvil permite à Global Hitss praticar preços agressivos em contratos de grande porte.",
            "Fábrica de software própria e infraestrutura integrada podem fechar negócios end-to-end antes de a Digisystem entrar na conta.",
            "Casos de sucesso publicados em transformação digital reforçam percepção de referência no mercado financeiro e de varejo.",
            "A atuação nos EUA pode atrair multinacionais que preferem um fornecedor com presença no país da matriz.",
            "Cibersegurança como oferta declarada da Global Hitss preenche uma lacuna que não está visível no portfólio atual da Digisystem."
          ]
        }
      }
    },
    {
      "id": "fc82c2d1-4825-403e-bb1e-70c621b83a13",
      "nome": "Globalweb",
      "slug": "globalweb",
      "logo": "mercado/logos/globalweb.png",
      "descricao": "Uma das maiores empresas de TI do Brasil, com mais de 4 mil colaboradores e cerca de três décadas de experiência. Atua em segurança, nuvem e serviços gerenciados e presta serviços a órgãos federais.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/globalweb.com.br"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/globalweb.corp"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/globalweb-com-br"
        },
        {
          "tipo": "site",
          "url": "https://www.globalweb.com.br"
        }
      ],
      "temas": [
        {
          "tema": "Inovação em TI",
          "frequencia": 1
        },
        {
          "tema": "Soluções digitais e casos de sucesso no mercado brasileiro",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "Mais de 4 mil colaboradores (site oficial); a planilha trazia 1.000+",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; atua na mesma praça.",
        "diferenciais": "1. Mais de 4 mil colaboradores e três décadas de experiência. 2. Segurança web unificada em parceria com a Azion. 3. Monitoramento da Deep e Dark Web contra venda de informação da empresa.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Órgãos federais (nota de esclarecimento do site) e empresas privadas; financeiro, saúde e multimercado na planilha.",
      "presencaRegional": "Operação de escala nacional no Brasil (uma das maiores de TI do país); sede não conferida.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "edcaab13-7483-47ac-ae0e-a06098c7ab92"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 3,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,1",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Desenvolvimento: Soluções Digitais; Serviços Gerenciados: Observabilidade). Segmentos 3: 4 em comum (Serviços Financeiros, Saúde, Multimercado, Governo). Regional 3: Operação de escala nacional no Brasil (uma das maiores de TI do país); sede não conferida. Porte 2: 4.000+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:49:57.894+00:00",
        "itens": {
          "forcas": [
            "Portfólio vertical em Saúde: Tasy, PACS e AMS são diferenciais que a Globalweb não demonstra ter.",
            "Intelligence Hub executa o roadmap, não apenas entrega relatório, o que é mais concreto para o cliente.",
            "Mais de 250 instituições integradas via APIs seguras, com cobertura multissetorial documentada.",
            "Field Service em mais de 350 localidades e Service Desk com 94% de resolução no primeiro contato.",
            "Atuação regional consolidada no Brasil, Colômbia e Argentina, ampliando a proposta para clientes com operação regional."
          ],
          "fraquezas": [
            "Globalweb tem mais de 4 mil colaboradores e quase três décadas de mercado, o que transmite escala e maturidade.",
            "Presença estabelecida em órgãos federais dá à Globalweb credibilidade institucional difícil de replicar no curto prazo.",
            "Sem dados públicos sobre o tamanho do time da Digisystem para contrabalançar a percepção de porte da concorrente."
          ],
          "oportunidades": [
            "Saúde digital é um segmento onde a Globalweb não apresenta soluções específicas visíveis, e a Digisystem tem profundidade real.",
            "Integração de sistemas legados via API é uma dor crescente que a Digisystem cobre e a Globalweb não destaca.",
            "Clientes que precisam de IA aplicada à operação, como a NIA, ainda não encontram isso no portfólio público da Globalweb.",
            "Empresas de médio porte fora do eixo federal podem preferir um parceiro com presença local e suporte residente especializado."
          ],
          "ameacas": [
            "A experiência da Globalweb em órgãos federais pode abrir portas em estados e municípios onde a Digisystem também atua.",
            "Capacidade de escala da Globalweb em serviços gerenciados e nuvem pode atrair clientes que priorizam fornecedor único de grande porte.",
            "Posicionamento neutro e consolidado da Globalweb facilita renovações de contrato sem grande esforço comercial do lado deles."
          ]
        }
      }
    },
    {
      "id": "8bdfe260-5525-4a30-b263-0ef3066de0ef",
      "nome": "Indra / Minsait",
      "slug": "indra-minsait",
      "logo": "mercado/logos/indra-minsait.png",
      "descricao": "Minsait é a empresa de transformação digital e TI do grupo espanhol Indra, no Brasil desde 2018, com atuação em administração pública, energia, indústria, consumo, serviços financeiros, telecom e mídia, além de casos em saúde pública.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/minsait"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/minsait/"
        },
        {
          "tipo": "site",
          "url": "https://www.minsait.com/pt-br"
        }
      ],
      "temas": [
        {
          "tema": "Relatórios",
          "frequencia": 1
        },
        {
          "tema": "Inovação e eventos públicos",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "~5.000 (Brasil) colaboradores (LinkedIn). Faturamento R$ 2 bilhões (Brasil)",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Grupo Indra, de origem espanhola e atuação global. 2. Transformação digital com tecnologia avançada e conhecimento setorial. 3. Casos de saúde pública e administração pública no Brasil.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Administração pública, energia, indústria, consumo, serviços financeiros, telecomunicações e mídia; caso de saúde pública em São Bernardo do Campo.",
      "presencaRegional": "Unidade Minsait no Brasil desde 2018 (grupo Indra); escala nacional por presunção, sem lista de praças na fonte.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "db69daf9-928f-4db0-b60c-0d84f7567cca",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "350a1f5e-00b0-45cc-b365-9209c091267d"
      ],
      "segmentosEmComum": [
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "7387b283-bbf3-4fff-8885-22b643d4d458",
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,5",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: APIS & Integração; Desenvolvimento: Soluções Digitais; Intelligence Hub). Segmentos 3: 4 em comum (Governo, Energia, Serviços Financeiros, Saúde). Regional 3: Unidade Minsait no Brasil desde 2018 (grupo Indra); escala nacional por presunção, sem lista de praças na fonte. Porte 2: 5.000+ colaboradores.",
        "riscoPlanilha": 4.85
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:08:26.51+00:00",
        "itens": {
          "forcas": [
            "Portfólio integrado de ponta a ponta: da consultoria executiva ao suporte presencial em mais de 350 localidades no Brasil.",
            "Intelligence Hub executa o roadmap, não entrega só relatório, o que é diferente da consultoria tradicional da Minsait.",
            "Presença vertical em Saúde com Tasy e PACS, segmento que a Minsait não cobre com profundidade.",
            "Service Desk com 94% de resolução no primeiro contato e Suporte Residente com satisfação acima de 98%.",
            "NIA no modelo agêntico consulta e aciona processos em qualquer sistema, com aplicação prática já disponível."
          ],
          "fraquezas": [
            "Minsait tem presença institucional consolidada em governos estaduais e estatais, com histórico mais longo nesse mercado.",
            "Portfólio de defesa e smart cities da Minsait cobre segmentos que a Digisystem não atua.",
            "Atuação na Europa dá à Minsait credibilidade internacional que a Digisystem ainda não construiu.",
            "Certificações como CMMI reforçam a credibilidade da Minsait em contratos públicos de alto valor.",
            "Parceria com SAP, Oracle e Microsoft posiciona a Minsait com peso institucional forte em grandes contratos."
          ],
          "oportunidades": [
            "Estrutura rígida da Minsait abre espaço para a Digisystem oferecer execução ágil e iterativa em projetos de governo.",
            "A Minsait não demonstra profundidade em Saúde digital, onde a Digisystem tem Tasy, PACS e sustentação especializada.",
            "Com mais de 250 instituições integradas via API, a Digisystem pode avançar em integrações onde a Minsait é menos flexível.",
            "Baixa frequência de publicação da Minsait deixa espaço para a Digisystem construir autoridade digital nos temas de governo e inovação.",
            "AIOps com FinOps é diferencial que a Minsait não apresenta explicitamente, especialmente para clientes em nuvem híbrida."
          ],
          "ameacas": [
            "Plano de expansão da Minsait na América Latina em 2025-2026 pode pressionar os mercados colombiano e argentino onde a Digisystem atua.",
            "Adoção de IA pela Minsait para governo em 2025 pode reduzir a vantagem atual da Digisystem com a NIA nesse segmento.",
            "Contratos por escopo da Minsait com estatais criam barreiras de entrada longas e difíceis de deslocar.",
            "Presença institucional forte da Minsait facilita renovações automáticas em clientes de governo sem processo competitivo aberto.",
            "Crescimento da Minsait em energia e utilities pode disputar diretamente clientes que a Digisystem também atende nesse segmento."
          ]
        }
      }
    },
    {
      "id": "157dd923-0aa2-4056-b210-f54df5a9111f",
      "nome": "Insi (antiga Meta)",
      "slug": "insi-antiga-meta",
      "logo": null,
      "descricao": "Consultoria brasileira de evolução digital com 35 anos de atuação, antes chamada Meta e renomeada Insi em 2026 após disputa de marca com a Meta Platforms. Atende clientes em 20 países.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/insi_global"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/insi-global"
        },
        {
          "tipo": "site",
          "url": "https://insi.com/br"
        }
      ],
      "temas": [
        {
          "tema": "Inovação tecnológica",
          "frequencia": 1
        },
        {
          "tema": "Transformação digital",
          "frequencia": 1
        },
        {
          "tema": "Inteligência artificial",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "35 anos de atuação, clientes em 20 países e 15,5% da receita no exterior; headcount não publicado",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Foco em automação e inteligência artificial. 2. Ampla experiência em plataformas de gestão. 3. Estratégias digitais personalizadas.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Financeiro, varejo, saúde, tecnologia.",
      "presencaRegional": "Brasil (empresa de origem brasileira), clientes em 20 países da América do Norte e Europa.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "350a1f5e-00b0-45cc-b365-9209c091267d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,5",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Intelligence Hub). Segmentos 3: 4 em comum (Serviços Financeiros, Saúde, Multimercado, Governo). Regional 3: Brasil (empresa de origem brasileira), clientes em 20 países da América do Norte e Europa. Porte 2: manual: sem headcount; 35 anos, 20 países e meta de faturamento de R$ 1 bilhão (Exame).",
        "riscoPlanilha": 3.4
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:46:53.027+00:00",
        "itens": {
          "forcas": [
            "Presença física em mais de 350 localidades no Brasil; a Insi não demonstra esse tipo de capilaridade operacional.",
            "Portfólio de execução completo: da consultoria ao Field Service, sem depender de terceiros para entregar o roadmap.",
            "Especialização profunda em Governo, segmento que a Insi não declara atender.",
            "Gestão Hospitalar com Tasy e PACS posiciona a Digisystem como referência técnica em Saúde, além da consultoria genérica.",
            "Mais de 250 instituições integradas via API e sistema de pagamento de garantias conectado ao mercado financeiro nacional."
          ],
          "fraquezas": [
            "A Insi atua em 20 países; a Digisystem está presente no Brasil, Colômbia e Argentina, escopo internacional menor.",
            "35 anos de história consolidada como Meta dão à Insi reconhecimento de marca que a Digisystem ainda precisa disputar.",
            "A Insi atende varejo e tecnologia como segmentos declarados; a Digisystem não tem oferta posicionada para esses verticais."
          ],
          "oportunidades": [
            "A Insi entrega relatórios consultivos; a Digisystem executa o roadmap, o que atrai clientes cansados de diagnósticos sem ação.",
            "Nenhum dado da Insi indica suporte residente ou Field Service; há espaço para a Digisystem ganhar contratos que exigem presença física.",
            "A Insi não declara atuação em Governo; licitações e contratos públicos são território aberto para a Digisystem crescer.",
            "O diagnóstico Pulse, de uma a duas semanas, é uma entrada rápida que a Insi não parece oferecer de forma equivalente.",
            "Clientes do setor de Energia não aparecem no portfólio declarado da Insi; a Digisystem pode avançar nesse vertical sem disputa direta."
          ],
          "ameacas": [
            "A Insi usa inteligência artificial como tema central; se comunicar isso com mais consistência, pode ocupar o imaginário de IA antes da Digisystem.",
            "Presença em 20 países atrai multinacionais que preferem um único fornecedor global, reduzindo oportunidades para a Digisystem nesse perfil de cliente.",
            "A reputação de 35 anos em serviços financeiros dá à Insi credibilidade para disputar os mesmos bancos e fintechs que a Digisystem atende.",
            "Com foco em transformação digital ampla, a Insi pode entrar em contas de Saúde oferecendo consultoria antes de a Digisystem apresentar sua solução especializada."
          ]
        }
      }
    },
    {
      "id": "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
      "nome": "Iteris",
      "slug": "iteris",
      "logo": null,
      "descricao": "Consultoria brasileira de negócios e tecnologia, fundada em 2009 em São Paulo, com cerca de 600 profissionais em dados e engenharia de software. Foi adquirida pela Globant em dezembro de 2023.",
      "links": [],
      "temas": [],
      "ficha": {
        "porte": "Cerca de 600 profissionais na aquisição pela Globant (2023)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Sobreposição parcial de portfólio; três segmentos em comum.",
        "diferenciais": "1. Fundada em 2009 em São Paulo. 2. Cerca de 600 profissionais em dados e engenharia de software. 3. Parte da Globant desde 2023.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Finanças, varejo, saúde e agronegócio (setores-alvo da Globant no Brasil, citados na aquisição).",
      "presencaRegional": "Fundada em São Paulo (SP); hoje parte da Globant.",
      "situacao": "marca absorvida",
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "350a1f5e-00b0-45cc-b365-9209c091267d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 2,
        "regional": 3,
        "porte": 1,
        "pontuacao": "2,1",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Intelligence Hub). Segmentos 2: 3 em comum (Serviços Financeiros, Saúde, Multimercado). Regional 3: Fundada em São Paulo (SP); hoje parte da Globant. Porte 1: 600+ colaboradores.",
        "riscoPlanilha": 2.7
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:50:19.032+00:00",
        "itens": {
          "forcas": [
            "Portfólio mais amplo: vai de gestão hospitalar (Tasy, PACS) a Field Service em mais de 350 localidades, algo que a Iteris não cobre.",
            "Presença física nacional com suporte presencial e Service Desk de 47.750 chamados/mês, enquanto a Iteris atua como consultoria remota.",
            "Atuação consolidada em Governo, segmento que a Iteris não declara como foco estratégico.",
            "Intelligence Hub executa o roadmap, não apenas entrega relatório — diferencial claro frente a uma consultoria tradicional.",
            "Mais de 3.000 profissionais alocados e mais de 250 instituições integradas via API, base operacional difícil de replicar rapidamente."
          ],
          "fraquezas": [
            "A Globant, que adquiriu a Iteris, é uma empresa global com capacidade de investimento e marca internacional muito maiores que a Digisystem.",
            "A Iteris tem histórico focado em dados e engenharia de software com cerca de 600 especialistas, o que pode soar mais especializado nesse recorte.",
            "A aquisição pela Globant amplia o alcance da Iteris para clientes globais, algo que a Digisystem ainda constrói com atuação na Colômbia e Argentina."
          ],
          "oportunidades": [
            "Governo é um segmento sem cobertura declarada da Iteris — a Digisystem pode aprofundar contratos e referências nesse mercado.",
            "A Iteris não apresenta oferta de suporte físico nem Field Service; clientes que precisam de presença local ficam descobertos.",
            "Gestão hospitalar especializada (Tasy, PACS, AMS) é uma lacuna clara, já que a Iteris não declara vertical de saúde estruturada.",
            "Clientes que buscam execução integrada (consultoria + operação + suporte) encontram na Digisystem o que a Iteris não entrega sozinha.",
            "Energia é um segmento que a Iteris não cita; a Digisystem pode consolidar presença e criar referências sem concorrência direta dela."
          ],
          "ameacas": [
            "O respaldo global da Globant pode levar clientes enterprise a preferirem a Iteris em projetos de alta visibilidade e orçamento elevado.",
            "A Globant pode injetar capital para a Iteris expandir para Governo e Energia, reduzindo as lacunas atuais rapidamente.",
            "Projetos de dados e IA com viés de consultoria pura podem ser direcionados à Iteris se ela fortalecer discurso de execução, não só diagnóstico.",
            "A marca Globant tem reconhecimento internacional que pode influenciar decisões de TI em subsidiárias de multinacionais no Brasil."
          ]
        }
      }
    },
    {
      "id": "ca3b4e48-de4e-487a-bfef-c85552003b88",
      "nome": "Ka Solution",
      "slug": "ka-solution",
      "logo": "mercado/logos/ka-solution.ico",
      "descricao": "Centro de treinamento oficial de tecnologia (Microsoft, Oracle, SAP, AWS, ISC2) com cursos presenciais e remotos em todo o país e telefone em São Paulo.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/kasolutiontecnologia"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/kasolution"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/ka-solution"
        },
        {
          "tipo": "site",
          "url": "https://www.kasolution.com.br/"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "Cerca de 516 pessoas (Crustdata, out/2026)",
        "faixaPreco": null,
        "risco": 1,
        "riscoMotivo": "Atua na mesma praça; porte pequeno.",
        "diferenciais": "1. Centro de Treinamento Oficial (ISC)2 no Brasil. 2. Cursos oficiais Microsoft, SAP e AWS. 3. Centro autorizado de testes Pearson Vue.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": null,
      "presencaRegional": "Sede em São Paulo (SP), segundo Crustdata; atende todo o Brasil.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [],
      "segmentosEmComum": [],
      "sinais": {
        "sobreposicao": 0,
        "segmentos": 0,
        "regional": 3,
        "porte": 1,
        "pontuacao": "0,7",
        "justificativa": "Sobreposição 0: 0 item(ns) do portfólio. Segmentos 0: 0 em comum. Regional 3: Sede em São Paulo (SP), segundo Crustdata; atende todo o Brasil. Porte 1: 516+ colaboradores.",
        "riscoPlanilha": 1.75
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:57:12.4+00:00",
        "itens": {
          "forcas": [
            "Portfólio completo de serviços gerenciados, desenvolvimento e alocação, enquanto a Ka Solution foca só em treinamento.",
            "Presença em mais de 350 localidades com Field Service presencial; a Ka Solution tem telefone apenas em São Paulo.",
            "Mais de 3.000 profissionais alocados e squads sob demanda, com seleção apoiada por IA.",
            "Atuação setorial profunda em Saúde, Governo e Serviços Financeiros, com soluções verticalizadas.",
            "NIA e AIOps entregam execução real, não só capacitação; a Ka Solution para no treinamento."
          ],
          "fraquezas": [
            "Ka Solution é parceiro oficial de Microsoft, Oracle, SAP, AWS e ISC2, o que confere credencial formal de treinamento que a Digisystem não oferece.",
            "Quem busca certificação individual de TI vai direto à Ka Solution; a Digisystem não compete nesse espaço.",
            "A Ka Solution tem cobertura nacional para cursos presenciais e remotos, com marca consolidada em educação corporativa."
          ],
          "oportunidades": [
            "Clientes treinados pela Ka Solution ainda precisam de quem execute, integre e opere; a Digisystem pode ser esse próximo passo.",
            "Empresas que consomem SAP ou AWS via Ka Solution têm sistemas legados a integrar, espaço direto para APIs & Integração da Digisystem.",
            "A Ka Solution não atua em Saúde com soluções verticais; o Tasy e o PACS abrem portas que ela não alcança.",
            "Governos e instituições financeiras precisam de serviços gerenciados com SLA, não só de cursos; a Digisystem preenche essa lacuna."
          ],
          "ameacas": [
            "Se a Ka Solution expandir para serviços pós-treinamento, pode capturar clientes que já formou e conhece bem.",
            "Parcerias oficiais com Microsoft, Oracle e AWS dão à Ka Solution acesso privilegiado a roadmaps e contatos corporativos.",
            "Certificações ISC2 colocam a Ka Solution no radar de decisores de segurança, um tema crescente nos segmentos da Digisystem."
          ]
        }
      }
    },
    {
      "id": "f6fa326e-3dbd-4953-8551-4f8570806e24",
      "nome": "Lambda3",
      "slug": "lambda3",
      "logo": null,
      "descricao": "Consultoria de software fundada em 2010 em São Paulo, com foco em produtos digitais, ciência de dados e métodos ágeis. Foi adquirida pela Tivit em 2021.",
      "links": [],
      "temas": [],
      "ficha": {
        "porte": null,
        "faixaPreco": null,
        "risco": 2,
        "riscoMotivo": "Atua na mesma praça; pouca sobreposição de portfólio.",
        "diferenciais": "1. Fundada em 2010 por nomes ligados à comunidade de métodos ágeis. 2. Foco em produtos digitais e ciência de dados. 3. Parte do grupo Tivit desde 2021.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Clientes citados na aquisição: Fast Shop e Banco Carrefour.",
      "presencaRegional": "São Paulo (SP); hoje integrada à Tivit.",
      "situacao": "marca absorvida",
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "891548c0-8f2e-46f9-92e7-9b456660be8e"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 1,
        "regional": 3,
        "porte": 0,
        "pontuacao": "1,3",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais). Segmentos 1: 2 em comum (Multimercado, Serviços Financeiros). Regional 3: São Paulo (SP); hoje integrada à Tivit. Porte 0: manual: sem headcount público.",
        "riscoPlanilha": 2.4
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:55:20.285+00:00",
        "itens": {
          "forcas": [
            "Portfólio amplo: da consultoria ao Field Service em mais de 350 localidades, a Digisystem entrega ponta a ponta.",
            "Mais de 250 instituições integradas via API, com suporte a SAP, Salesforce, TOTVS e ServiceNow.",
            "Presença em Saúde com implantação Tasy, PACS e sustentação especializada, segmento fora do escopo da Lambda3.",
            "Mais de 3.000 profissionais alocados e Service Desk com 94% de resolução no primeiro contato.",
            "Atuação em Governo, segmento que a Lambda3 não menciona entre seus clientes de referência."
          ],
          "fraquezas": [
            "Lambda3 tem histórico consolidado em produtos digitais e métodos ágeis, com cases em varejo e banco antes da aquisição.",
            "Como parte da Tivit, a Lambda3 acessa uma estrutura financeira e comercial maior do que a da Digisystem.",
            "A Lambda3 nasceu com foco em software e ciência de dados, o que pode passar mais credibilidade em projetos de produto digital puro."
          ],
          "oportunidades": [
            "A Lambda3 não apresenta serviços de infraestrutura gerenciada, campo em que a Digisystem tem AIOps, Cloud e Observabilidade.",
            "Clientes que precisam de suporte presencial nacional não encontram esse serviço na Lambda3; a Digisystem cobre mais de 350 localidades.",
            "O segmento de Saúde fica fora do posicionamento da Lambda3, e a Digisystem tem solução vertical completa nele.",
            "Governo é um segmento sem menção na Lambda3; a Digisystem pode avançar nele sem disputa direta."
          ],
          "ameacas": [
            "A estrutura da Tivit pode permitir que a Lambda3 ofereça pacotes integrados de consultoria e infraestrutura a preços mais competitivos.",
            "A reputação da Lambda3 em métodos ágeis e ciência de dados pode atrair clientes de Serviços Financeiros que a Digisystem também disputa.",
            "A aquisição pela Tivit amplia o alcance comercial da Lambda3, aumentando a chance de concorrência em contas que antes não eram disputadas."
          ]
        }
      }
    },
    {
      "id": "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
      "nome": "Maitha Tech",
      "slug": "maitha-tech",
      "logo": "mercado/logos/maitha-tech.png",
      "descricao": "Consultoria digital de São Paulo, com cerca de cinco anos de atuação, que desenha, desenvolve e evolui soluções digitais, com unidades de Salesforce e de IA. Faturou R$ 52 milhões em 2024.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/maitha.tech"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/maitha-tech"
        },
        {
          "tipo": "site",
          "url": "https://maitha.com.br"
        }
      ],
      "temas": [
        {
          "tema": "Tendências de inovação",
          "frequencia": 1
        },
        {
          "tema": "Conteúdos educativos",
          "frequencia": 1
        },
        {
          "tema": "Cases de sucesso",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "230 profissionais (Tiinside, mar/2025); a planilha trazia 50+",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Sobreposição parcial de portfólio; três segmentos em comum.",
        "diferenciais": "1. Equipe saltou de 20 para 230 profissionais em cinco anos. 2. Unidade de negócio dedicada a Salesforce (CRM). 3. Investimento em startup de integração com IA.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Varejo, saúde, financeiro, tecnologia.",
      "presencaRegional": "São Paulo (SP).",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "350a1f5e-00b0-45cc-b365-9209c091267d"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "891548c0-8f2e-46f9-92e7-9b456660be8e"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 2,
        "regional": 3,
        "porte": 1,
        "pontuacao": "2,1",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Intelligence Hub). Segmentos 2: 3 em comum (Multimercado, Saúde, Serviços Financeiros). Regional 3: São Paulo (SP). Porte 1: 230+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:50:43.931+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: da consultoria ao Field Service em 350+ localidades, cobrindo o ciclo completo de TI.",
            "Presença em Governo, segmento que a Maitha Tech não atende.",
            "Mais de 250 instituições integradas via APIs e sistemas críticos de mercado financeiro, como o de pagamento de garantias.",
            "Escala operacional comprovada: 47.750 chamados/mês no Service Desk, 3.000+ profissionais alocados e 99,84% de uptime.",
            "Especialização profunda em Saúde com Tasy, PACS e sustentação de sistemas hospitalares, sem equivalente no portfólio da concorrente."
          ],
          "fraquezas": [
            "A Maitha Tech tem unidade dedicada a Salesforce, parceria que a Digisystem não menciona no portfólio atual.",
            "Com cinco anos e foco em inovação digital, a Maitha Tech pode ser percebida como mais ágil em projetos de transformação front-end.",
            "A Maitha Tech atende Varejo e Tecnologia, segmentos fora da cobertura atual da Digisystem.",
            "Faturamento de R$ 52 milhões indica estrutura enxuta, o que pode torná-la mais competitiva em projetos menores e rápidos."
          ],
          "oportunidades": [
            "Governo é um segmento sem concorrência da Maitha Tech — a Digisystem pode aprofundar presença sem disputa direta.",
            "A lacuna de suporte presencial e Field Service da Maitha Tech abre espaço para a Digisystem em clientes que precisam de operação híbrida.",
            "O Intelligence Hub com execução de roadmap responde a uma dor que consultorias que só entregam relatório não resolvem.",
            "Clientes de Saúde que precisam de Tasy, PACS e AMS não encontram esse conjunto integrado na Maitha Tech.",
            "A atuação na Colômbia e Argentina diferencia a Digisystem para clientes com operação regional, onde a Maitha Tech não atua."
          ],
          "ameacas": [
            "A unidade de IA da Maitha Tech compete diretamente com Dados & IA e NIA da Digisystem nos segmentos de Saúde e Financeiro.",
            "Conteúdo educativo e de tendências publicado pela Maitha Tech pode construir autoridade de marca antes que a Digisystem ocupe esse espaço.",
            "Cases de sucesso bem comunicados pela Maitha Tech podem influenciar decisores em Serviços Financeiros e Saúde, segmentos disputados.",
            "O foco em inovação digital e desenvolvimento sob medida da Maitha Tech concorre com Soluções Digitais da Digisystem em projetos web e mobile."
          ]
        }
      }
    },
    {
      "id": "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
      "nome": "Mirante Tecnologia",
      "slug": "mirante-tecnologia",
      "logo": "mercado/logos/mirante-tecnologia.png",
      "descricao": "Empresa de TI de Brasília, com cerca de 20 anos, que desenvolve software sob encomenda e oferece automação de processos, consultoria e IA. Tem sede em Brasília e filial em São Paulo (Avenida Paulista).",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/MiranteTecnologia"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/mirantetecnologia"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/mirante-tecnologia"
        },
        {
          "tipo": "site",
          "url": "https://www.mirante.net.br"
        }
      ],
      "temas": [
        {
          "tema": "Inovação digital",
          "frequencia": 1
        },
        {
          "tema": "Eficiência operacional e tendências de low-code",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "Cerca de 742 pessoas (Crustdata, estimativa de out/2026); a planilha trazia 500+",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Cerca de 20 anos de mercado. 2. Papel de elo entre sistemas legados e inovação (descrição do LinkedIn). 3. Automação de processos e IA no portfólio.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Governo, saúde, financeiro, tecnologia.",
      "presencaRegional": "Sede em Brasília (DF) e filial em São Paulo (SP).",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735"
      ],
      "segmentosEmComum": [
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 3,
        "porte": 1,
        "pontuacao": "2,4",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais). Segmentos 3: 4 em comum (Governo, Saúde, Serviços Financeiros, Multimercado). Regional 3: Sede em Brasília (DF) e filial em São Paulo (SP). Porte 1: 742+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:47:17.191+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: da Gestão Hospitalar ao AIOps, a Digisystem atende demandas que a Mirante não cobre.",
            "Presença física em mais de 350 localidades no Brasil, além de Colômbia e Argentina — alcance que a Mirante não declara.",
            "Mais de 250 instituições integradas via APIs seguras, com conectores para SAP, Salesforce, TOTVS e ServiceNow.",
            "NIA (agente de IA) que consulta dados e aciona processos — vai além de consultoria e entrega execução real.",
            "Service Desk com 47.750 chamados/mês e 94% de resolução no primeiro contato, com SLA comprovado."
          ],
          "fraquezas": [
            "A Mirante tem foco declarado em low-code, tema em alta, que a Digisystem não posiciona publicamente no portfólio.",
            "Empresa brasiliense com 20 anos focada em Governo pode ter relacionamento institucional mais consolidado nesse segmento.",
            "A Mirante entrega software sob encomenda com posicionamento direto e simples, o que pode facilitar a venda para clientes menores."
          ],
          "oportunidades": [
            "A Mirante não declara cobertura em Energia, segmento em que a Digisystem atua com Field Service, Cloud e Observabilidade.",
            "Ausência de oferta de Gestão Hospitalar (Tasy e PACS) abre espaço para a Digisystem crescer sozinha no setor de Saúde.",
            "A Mirante não apresenta suporte presencial estruturado nem Suporte Residente — lacuna direta para a Digisystem entrar.",
            "Sem oferta visível de Alocação de Profissionais, a Mirante deixa livre um modelo que a Digisystem já opera com mais de 3.000 especialistas.",
            "A baixa frequência de publicação da Mirante deixa espaço para a Digisystem construir autoridade de conteúdo nos segmentos disputados."
          ],
          "ameacas": [
            "Foco em low-code e automação pode atrair clientes de Governo e Saúde que buscam soluções mais ágeis e baratas.",
            "Sede em Brasília com filial na Paulista posiciona a Mirante bem nos dois principais mercados de decisão do Brasil.",
            "Proposta de consultoria + execução de IA pode gerar confusão com o Intelligence Hub da Digisystem se a Mirante ampliar esse discurso.",
            "Com 20 anos de mercado, a Mirante tem credibilidade estabelecida que pode pesar em licitações e renovações de contrato."
          ]
        }
      }
    },
    {
      "id": "2600287d-2d5b-4869-a30a-df6be50a0eb2",
      "nome": "Moderna",
      "slug": "moderna",
      "logo": null,
      "descricao": "Consultoria local, segundo a planilha de risco, sem atuação expressiva nacional ou internacional. Não foi possível identificar com segurança qual empresa é esta.",
      "links": [],
      "temas": [],
      "ficha": {
        "porte": null,
        "faixaPreco": null,
        "risco": 1,
        "riscoMotivo": "Presença regional pequena na nossa área.",
        "diferenciais": null,
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": null,
      "presencaRegional": null,
      "situacao": "não identificada",
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [],
      "segmentosEmComum": [],
      "sinais": {
        "sobreposicao": 0,
        "segmentos": 0,
        "regional": 1,
        "porte": 0,
        "pontuacao": "0,2",
        "justificativa": "Sobreposição 0: 0 item(ns) do portfólio. Segmentos 0: 0 em comum. Regional 1. Porte 0: manual: empresa não identificada.",
        "riscoPlanilha": 2
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:57:36.647+00:00",
        "itens": {
          "forcas": [
            "Atuação nacional e internacional (Brasil, Colômbia e Argentina) frente a uma consultoria de alcance local.",
            "Portfólio completo: da consultoria ao suporte presencial, passando por dados, IA e cloud.",
            "Mais de 250 instituições integradas via APIs seguras e monitoradas.",
            "Field Service presente em mais de 350 localidades no Brasil.",
            "Mais de 3.000 profissionais alocados, com seleção apoiada por IA."
          ],
          "fraquezas": [
            "Sem informações suficientes sobre a Moderna para identificar vantagens concretas dela sobre a Digisystem."
          ],
          "oportunidades": [
            "Atuação local da Moderna sugere clientes regionais sem cobertura nacional — espaço direto para a Digisystem entrar.",
            "Ausência de portfólio identificado abre espaço para a Digisystem apresentar soluções mais completas nos mesmos segmentos.",
            "Clientes que precisam escalar além da região podem migrar naturalmente para um parceiro com presença ampla."
          ],
          "ameacas": [
            "Sem dados públicos sobre a Moderna, não é possível mapear ameaças concretas com segurança."
          ]
        }
      }
    },
    {
      "id": "d9c1b3cf-5005-414a-903e-687fb5376ad0",
      "nome": "Nava",
      "slug": "nava",
      "logo": "mercado/logos/nava.png",
      "descricao": "Consultoria brasileira de tecnologia (Nava Technology for Business) que atua em AIOps e observabilidade, estratégia digital e desenvolvimento ágil, pagamentos, outsourcing inteligente, nuvem, analytics, automação e cibersegurança. Abriu mais de 400 vagas em 2026.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/nava.technology"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/nava.technology"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/nava-technology"
        },
        {
          "tipo": "site",
          "url": "https://nava.com.br"
        }
      ],
      "temas": [
        {
          "tema": "Soluções digitais",
          "frequencia": 1
        },
        {
          "tema": "Inovação em tecnologia",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "1.000+ colaboradores (LinkedIn)",
        "faixaPreco": null,
        "risco": 5,
        "riscoMotivo": "Portfólio muito parecido com o da Digisystem; quatro ou cinco segmentos em comum.",
        "diferenciais": "1. Oferta ampla: AIOps, observabilidade, pagamentos e cibersegurança. 2. Expansão acelerada, com mais de 400 vagas em 2026. 3. Foco em engenharia de software e suporte.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Financeiro, saúde, educação, governo.",
      "presencaRegional": "Escritórios em São Paulo (SP) e Belo Horizonte (MG), segundo vagas abertas; contrata no país todo.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "4e4d4e8b-d431-496e-812a-8714e3164d01",
        "350a1f5e-00b0-45cc-b365-9209c091267d",
        "6a7b772e-8b06-438d-8b00-44506a3a9bef",
        "84e84938-3b5c-4d33-af12-84190673718d",
        "edcaab13-7483-47ac-ae0e-a06098c7ab92"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 3,
        "segmentos": 3,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,9",
        "justificativa": "Sobreposição 3: 8 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Desenvolvimento: Soluções Financeiras; Intelligence Hub; Serviços Gerenciados: AIOps; Serviços Gerenciados: Cloud; Serviços Gerenciados: Observabilidade). Segmentos 3: 4 em comum (Serviços Financeiros, Saúde, Multimercado, Governo). Regional 3: Escritórios em São Paulo (SP) e Belo Horizonte (MG), segundo vagas abertas; contrata no país todo. Porte 2: 1.000+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:45:18.999+00:00",
        "itens": {
          "forcas": [
            "Presença física em mais de 350 localidades no Brasil, algo que uma consultoria focada em digital dificilmente replica.",
            "Intelligence Hub executa o roadmap, não apenas entrega relatório — diferencial claro frente a uma consultoria tradicional.",
            "Gestão Hospitalar com Tasy e PACS posiciona a Digisystem como especialista em saúde, não apenas fornecedora genérica.",
            "Mais de 250 instituições integradas via APIs seguras e monitoradas, com histórico comprovado no mercado financeiro.",
            "Suporte Residente com satisfação acima de 98% e Service Desk com 94% de resolução no primeiro contato mostram maturidade operacional."
          ],
          "fraquezas": [
            "A Nava comunica publicamente suas frentes de cibersegurança; a Digisystem não apresenta essa oferta nos dados disponíveis.",
            "A Nava abriu mais de 400 vagas em 2026, sinalizando expansão acelerada de capacidade que pode superar o ritmo da Digisystem.",
            "A Nava atua em educação, segmento que a Digisystem não cobre, o que amplia o alcance de mercado do concorrente."
          ],
          "oportunidades": [
            "A Nava não apresenta suporte presencial estruturado; a Digisystem pode avançar em clientes que precisam de Field Service.",
            "Clientes de governo que demandam operação local e SLA presencial encontram na Digisystem uma alternativa mais concreta.",
            "A Nava não evidencia soluções financeiras críticas como pagamento de garantias; há espaço para a Digisystem se aprofundar nesse nicho.",
            "A ausência de uma oferta de gestão hospitalar especializada na Nava deixa o setor de saúde mais acessível para a Digisystem."
          ],
          "ameacas": [
            "A expansão acelerada de contratações da Nava pode aumentar a capacidade de alocação de profissionais e disputar os mesmos clientes.",
            "A Nava cobre AIOps e observabilidade, áreas em que a Digisystem também atua, o que torna a disputa direta nesses serviços.",
            "A atuação da Nava em analytics e automação pode atrair clientes que buscam dados e IA sem precisar de um parceiro de infraestrutura.",
            "Se a Nava fortalecer presença em governo e saúde, os dois segmentos de maior diferenciação da Digisystem ficam mais disputados."
          ]
        }
      }
    },
    {
      "id": "d5552bbb-6515-4b0b-9b5e-9c134f5b30a8",
      "nome": "NTT DATA",
      "slug": "ntt-data",
      "logo": "mercado/logos/ntt-data.ico",
      "descricao": "Multinacional japonesa de serviços de TI e consultoria. No Brasil atua em consultoria, SOC e cibersegurança, SAP, nuvem e acessibilidade digital, e comprou a SPRO em 2025 (SAP no agronegócio).",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/ntt.data.business.solutions.brazil"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/ndbs_brazil"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/ntt-data-business-solutions"
        },
        {
          "tipo": "site",
          "url": "https://nttdata-solutions.com/br/"
        }
      ],
      "temas": [
        {
          "tema": "Soluções SAP",
          "frequencia": 1
        },
        {
          "tema": "Transformação digital",
          "frequencia": 1
        },
        {
          "tema": "Inovação e cloud computing",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "139.000+ colaboradores (LinkedIn). Faturamento US$ 22 bilhões 2021",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Três segmentos em comum; atua na mesma praça.",
        "diferenciais": "1. Parceira validada do RISE with SAP. 2. Centro de operações de segurança (SOC) com resposta a incidentes. 3. Aquisição da SPRO amplia a presença no agronegócio.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Agronegócio, bens de consumo, varejo, manufatura, saúde.",
      "presencaRegional": "Operação nacional no Brasil, com escritório de soluções SAP em Vitória (ES); sede nacional não conferida.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "350a1f5e-00b0-45cc-b365-9209c091267d",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 2,
        "regional": 3,
        "porte": 3,
        "pontuacao": "1,9",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Intelligence Hub; Serviços Gerenciados: Cloud). Segmentos 2: 3 em comum (Multimercado, Saúde, Governo). Regional 3: Operação nacional no Brasil, com escritório de soluções SAP em Vitória (ES); sede nacional não conferida. Porte 3: 139.000+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:52:23.823+00:00",
        "itens": {
          "forcas": [
            "Presença consolidada em Governo e Serviços Financeiros, segmentos que a NTT DATA não cita como foco.",
            "Gestão Hospitalar com Tasy e PACS posiciona a Digisystem como especialista real em Saúde, não generalista.",
            "Field Service em mais de 350 localidades e Service Desk com 94% de resolução no primeiro contato mostram capilaridade operacional.",
            "Intelligence Hub executa o roadmap junto com o cliente, enquanto a consultoria tradicional entrega só o relatório.",
            "Integração com mais de 250 instituições conectando SAP, TOTVS, Salesforce e ServiceNow em um único ponto."
          ],
          "fraquezas": [
            "A NTT DATA tem marca global japonesa e presença em mais países, o que pesa em processos de grandes empresas multinacionais.",
            "A aquisição da SPRO em 2025 dá à NTT DATA especialização profunda em SAP para agronegócio, nicho que a Digisystem não cobre.",
            "A NTT DATA oferece SOC e cibersegurança como produto estruturado; a Digisystem não apresenta essa oferta nos dados disponíveis.",
            "Reputação estabelecida em manufatura, varejo e bens de consumo, verticais onde a Digisystem tem menos visibilidade."
          ],
          "oportunidades": [
            "Governo é um segmento ignorado pela NTT DATA e a Digisystem já atua nele com portfólio completo.",
            "Saúde especializada, com Tasy e PACS, é um diferencial que a NTT DATA não alcança com oferta genérica de TI.",
            "Empresas de médio porte que precisam de integração de sistemas legados tendem a preferir um parceiro de execução a uma grande consultoria.",
            "O modelo de alocação com mais de 3.000 profissionais e seleção por IA atende demandas que consultorias globais cobram caro para suprir."
          ],
          "ameacas": [
            "A entrada da NTT DATA no agronegócio via SPRO pode abrir caminho para ela avançar em outros mercados brasileiros com mais força local.",
            "O peso de marca global da NTT DATA pode influenciar decisões de compra em contas enterprise onde a Digisystem também compete.",
            "A combinação de SAP com cloud e transformação digital forma um pacote amplo que pode cobrir parte do portfólio da Digisystem em Multimercados.",
            "Expansão da NTT DATA em Saúde, segmento que ela já lista como foco, pode pressionar contratos onde a Digisystem é referência."
          ]
        }
      }
    },
    {
      "id": "caf6f815-55af-4022-97bb-0d942937b7c9",
      "nome": "Qintess",
      "slug": "qintess",
      "logo": null,
      "descricao": "Empresa de tecnologia nascida da união do Cimcorp Group com a Resource, com sede em São Paulo e operação no Brasil e no Chile. Foco em migração SAP S/4HANA, dados mestres e IA.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/qintessoficial"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/qintess"
        },
        {
          "tipo": "site",
          "url": "https://qintess.com/"
        }
      ],
      "temas": [
        {
          "tema": "Inovação tecnológica",
          "frequencia": 1
        },
        {
          "tema": "Práticas ESG e cases de sucesso",
          "frequencia": 1
        },
        {
          "tema": "Transformação digital",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "Cerca de 1.388 pessoas (Crustdata, out/2026, queda de 44% em um ano); a planilha trazia 5.000+",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Foco em SAP (migração S/4HANA até 2027), dados mestres e IA. 2. Operação no Brasil e no Chile. 3. Fusão do Cimcorp Group com a Resource.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Financeiro, telecomunicações, serviços públicos.",
      "presencaRegional": "Sede em São Paulo (SP); vagas no Rio de Janeiro, Belém e Brasília e no Chile.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "7387b283-bbf3-4fff-8885-22b643d4d458"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,5",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais). Segmentos 3: 4 em comum (Serviços Financeiros, Multimercado, Governo, Energia). Regional 3: Sede em São Paulo (SP); vagas no Rio de Janeiro, Belém e Brasília e no Chile. Porte 2: 1.388+ colaboradores.",
        "riscoPlanilha": 4.1
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:11:53.793+00:00",
        "itens": {
          "forcas": [
            "Portfólio end-to-end: da consultoria ao suporte físico em mais de 350 localidades, sem depender de terceiros para execução.",
            "Presença consolidada em Saúde com o Tasy e PACS, segmento em que a Qintess ainda está expandindo.",
            "Mais de 250 instituições integradas via APIs seguras, com histórico real em sistemas críticos do mercado financeiro.",
            "Service Desk com 94% de resolução no primeiro contato e Suporte Residente com satisfação acima de 98%.",
            "Mais de 3.000 profissionais alocados, com seleção apoiada por IA e sem aumentar o headcount do cliente."
          ],
          "fraquezas": [
            "A Qintess tem presença nos EUA e no México; a Digisystem atua só no Brasil, Colômbia e Argentina.",
            "O portfólio de Experience Management da Qintess cobre design e estratégia digital de forma mais explícita.",
            "A Qintess possui certificação AWS Advanced Partner; a Digisystem não apresenta esse nível de parceria declarado.",
            "Compromisso ESG estruturado e comunicado publicamente é um diferencial da Qintess ainda pouco visível na Digisystem.",
            "A Qintess tem presença de SEO forte em automação e IA, o que amplia sua captação orgânica de leads."
          ],
          "oportunidades": [
            "A Qintess tem desafios na integração de múltiplas expertises; a Digisystem executa o roadmap, não só entrega relatório.",
            "A expansão da Qintess para saúde em 2025-2026 ainda é incipiente; a Digisystem já opera com Tasy e PACS.",
            "Clientes de governo que precisam de suporte físico e Field Service encontram isso na Digisystem, não na Qintess.",
            "O AIOps com FinOps da Digisystem cobre uma lacuna operacional que o portfólio declarado da Qintess não endereça.",
            "Empresas de energia, segmento fora do foco atual da Qintess, podem ser abordadas com o portfólio completo da Digisystem."
          ],
          "ameacas": [
            "A Qintess planeia investir em automação para serviços financeiros em 2025, segmento central da Digisystem.",
            "Parceria com AWS, Microsoft e Oracle dá à Qintess acesso a ecossistemas e co-vendas relevantes.",
            "Posicionamento em Analytics e AI & Decision Science concorre diretamente com Dados e IA da Digisystem.",
            "Expansão para saúde e varejo em 2025-2026 pode trazer a Qintess para disputas onde a Digisystem está estabelecida.",
            "Presença nos EUA e México amplia a base de referências internacionais da Qintess em processos de qualificação."
          ]
        }
      }
    },
    {
      "id": "503af274-a4ae-429a-8466-f9f4d60d5b3d",
      "nome": "Sky.One (Skyone)",
      "slug": "sky-one-skyone",
      "logo": "mercado/logos/sky-one-skyone.png",
      "descricao": "Empresa brasileira de tecnologia fundada em 2013, especializada em nuvem, dados, IA e cibersegurança, com plataforma própria (Skyone Studio) que reúne integração de sistemas, gestão de dados, automação e agentes de IA. Tem o Bradesco como investidor.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/Skyoneplatform"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/skyone.platform"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/skyoneplataform"
        },
        {
          "tipo": "site",
          "url": "https://www.skyone.solutions/"
        }
      ],
      "temas": [
        {
          "tema": "Blog ativo",
          "frequencia": 1
        },
        {
          "tema": "Webinars e Sky.One Connect",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "~300 colaboradores (LinkedIn)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Sobreposição parcial de portfólio; presença regional relevante.",
        "diferenciais": "1. Plataforma própria Skyone Studio, com integração, dados, automação e IA. 2. Monitoramento e sustentação 24x7. 3. Modelo de franquias e investimento do Bradesco.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "PME com ERP legado, software houses, ISVs, varejo, logística.",
      "presencaRegional": "Empresa brasileira com unidades próprias e franquias (seis inauguradas no primeiro semestre de 2024) e expansão para a América Latina; sede não conferida.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "db69daf9-928f-4db0-b60c-0d84f7567cca",
        "4e4d4e8b-d431-496e-812a-8714e3164d01",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 1,
        "regional": 2,
        "porte": 1,
        "pontuacao": "1,6",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: APIS & Integração; Desenvolvimento: Soluções Financeiras; Serviços Gerenciados: Cloud). Segmentos 1: 1 em comum (Multimercado). Regional 2: Empresa brasileira com unidades próprias e franquias (seis inauguradas no primeiro semestre de 2024) e expansão para a América Latina; sede não conferida. Porte 1: 300+ colaboradores.",
        "riscoPlanilha": 3.9
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:12:41.379+00:00",
        "itens": {
          "forcas": [
            "Presença consolidada no setor público, onde a Skyone não atua.",
            "Portfólio amplo: de service desk e field service a dados, IA e saúde, muito além de ERP.",
            "Mais de 250 instituições integradas via APIs seguras, com histórico em sistemas críticos.",
            "Atuação em Saúde com o maior canal Tasy da América Latina, sem concorrência direta da Skyone.",
            "Suporte presencial em mais de 350 localidades no Brasil, com capilaridade que plataforma SaaS não cobre."
          ],
          "fraquezas": [
            "A Skyone tem plataforma própria (Auto.Sky), o que gera percepção de produto proprietário e escalável.",
            "Presença em 14 países dá à Skyone credencial internacional mais visível que a da Digisystem.",
            "Modelo de assinatura recorrente da Skyone é mais simples de vender para PMEs do que projetos sob medida.",
            "Parcerias declaradas com Oracle, AWS e Microsoft reforçam o posicionamento de ecossistema da Skyone.",
            "Foco específico em modernização de ERPs legados cria uma narrativa de especialidade difícil de contestar."
          ],
          "oportunidades": [
            "Governo é um segmento sem cobertura da Skyone, e a Digisystem tem histórico e credenciais nele.",
            "Grandes contas que precisam de suporte presencial, integração e workplace não encontram isso na Skyone.",
            "Hospitais e operadoras de saúde são um mercado ignorado pela Skyone e bem coberto pela Digisystem.",
            "Clientes que precisam de IA aplicada à operação (modelo agêntico, NIA) não têm essa oferta na Skyone.",
            "Empresas financeiras com sistemas críticos de pagamento encontram na Digisystem o que a Skyone não entrega."
          ],
          "ameacas": [
            "Expansão da Skyone em fintech e segurança em 2025 pode disputar clientes de serviços financeiros.",
            "Crescimento de parceiros ISVs pela Skyone pode aproximá-la de integrações onde a Digisystem já atua.",
            "Modelo aaS da Skyone é atrativo para médias empresas que a Digisystem pode estar deixando de lado.",
            "Expansão para LATAM e Europa pode aumentar a visibilidade da Skyone em mercados onde a Digisystem quer crescer.",
            "Alta presença digital e conteúdo ativo da Skyone podem influenciar decisores antes do contato comercial."
          ]
        }
      }
    },
    {
      "id": "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
      "nome": "Sonda",
      "slug": "sonda",
      "logo": "mercado/logos/sonda.png",
      "descricao": "Empresa de TI latino-americana com operação no Brasil em workplace services (atendimento omnichannel e suporte presencial com capilaridade nacional), data centers, soluções fiscais integradas ao SAP e soluções setoriais, como saúde.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/sondabrasil"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/sonda"
        },
        {
          "tipo": "site",
          "url": "https://www.sonda.com/pt/inicio"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "13.000 + colaboradores (LinkedIn)",
        "faixaPreco": null,
        "risco": 5,
        "riscoMotivo": "Portfólio muito parecido com o da Digisystem; quatro ou cinco segmentos em comum.",
        "diferenciais": "1. Suporte presencial com capilaridade nacional e atendimento omnichannel. 2. Data centers no Brasil e no Chile para nuvem híbrida e privada. 3. Mais de 25 anos em soluções fiscais, integradas ao SAP.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Saúde (hospitais e clínicas), soluções fiscais e outros setores; a planilha marca financeiro, governo, energia e multimercado.",
      "presencaRegional": "Operação nacional no Brasil, com escritório em Brasília (DF); data centers no Brasil e no Chile.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "db69daf9-928f-4db0-b60c-0d84f7567cca",
        "229a802e-b6f6-4d29-8855-11c9eebf420e",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
        "350a1f5e-00b0-45cc-b365-9209c091267d",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "7387b283-bbf3-4fff-8885-22b643d4d458"
      ],
      "sinais": {
        "sobreposicao": 3,
        "segmentos": 3,
        "regional": 3,
        "porte": 3,
        "pontuacao": "3",
        "justificativa": "Sobreposição 3: 6 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: APIS & Integração; Digital Workplace Services: Field Service; Digital Workplace Services: Service Desk; Intelligence Hub; Serviços Gerenciados: Cloud). Segmentos 3: 5 em comum (Serviços Financeiros, Saúde, Governo, Multimercado, Energia). Regional 3: Operação nacional no Brasil, com escritório em Brasília (DF); data centers no Brasil e no Chile. Porte 3: 13.000+ colaboradores.",
        "riscoPlanilha": 3.8
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:13:28.118+00:00",
        "itens": {
          "forcas": [
            "Gestão Hospitalar especializada (Tasy, PACS) sem equivalente claro no portfólio da Sonda no Brasil.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados/mês, com SLA mensurável.",
            "Field Service presente em mais de 350 localidades brasileiras, cobrindo capilaridade nacional.",
            "NIA e modelo agêntico de IA aplicada à operação, indo além de consultoria e entregando execução real.",
            "Intelligence Hub executa o roadmap, não apenas entrega relatório — diferencial claro frente à consultoria tradicional."
          ],
          "fraquezas": [
            "Sonda está em 11 países; a Digisystem atua no Brasil, Colômbia e Argentina, com alcance regional menor.",
            "Receita e escala da Sonda (US$ 1,54 bi) dão mais peso em negociações e contratos de grande porte.",
            "Parcerias da Sonda com Cisco, IBM, Oracle e Microsoft reforçam credencial de integração no mercado.",
            "Portfólio de cibersegurança da Sonda é explícito; a Digisystem não apresenta oferta destacada nessa frente.",
            "Colocation e datacenter próprios da Sonda oferecem proposta de infraestrutura que a Digisystem não cobre diretamente."
          ],
          "oportunidades": [
            "Sonda está revisando sua estratégia de data centers, o que pode gerar insegurança em clientes que dependem dessa infraestrutura.",
            "Foco amplo da Sonda em muitos segmentos reduz profundidade; a Digisystem pode ir mais fundo em Saúde e Governo.",
            "Expansão da Sonda para EUA, Europa e Ásia pode desviar atenção e investimento do mercado brasileiro.",
            "Clientes que precisam de execução, não só de consultoria, encontram na Digisystem um modelo mais aderente.",
            "Segmento de Serviços Financeiros com soluções críticas (pagamento de garantias, integração com instituições) é nicho que a Sonda não detalha no Brasil."
          ],
          "ameacas": [
            "Expansão do centro de operações digital da Sonda no Brasil pode aumentar competição direta nos mesmos clientes.",
            "Crescimento em Digital Communications pela Sonda pode cobrir canais digitais onde a Digisystem também atua.",
            "Ecossistema de parcerias da Sonda com grandes fabricantes pode facilitar entrada em contas que a Digisystem já ocupa.",
            "Investimento da Sonda em startups via SONDA Innova pode acelerar inovações e reduzir diferencial da Digisystem em IA.",
            "Presença em smart cities e utilities pela Sonda abre frente em Energia e Governo, segmentos-chave da Digisystem."
          ]
        }
      }
    },
    {
      "id": "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
      "nome": "Spread",
      "slug": "spread",
      "logo": "mercado/logos/spread.png",
      "descricao": "Empresa de tecnologia fundada em 1983, com escritório e Hub de Integração em São Paulo, que oferece squads e workforce especializada, serviços gerenciados, excelência em SAP e uma linha de IA governada (GABBI).",
      "links": [
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/spread"
        },
        {
          "tipo": "site",
          "url": "https://spread.com.br"
        }
      ],
      "temas": [
        {
          "tema": "Serviços personalizados",
          "frequencia": 1
        },
        {
          "tema": "Inovação em TI",
          "frequencia": 1
        },
        {
          "tema": "Cases de sucesso",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "De 1.000 a 5.000 funcionários (ZoomInfo, estimativa)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; atua na mesma praça.",
        "diferenciais": "1. Mais de quatro décadas de mercado (desde 1983). 2. Modelo de squads e workforce especializada. 3. Plataforma própria de governança de IA (GABBI) e excelência em SAP.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Financeiro, energia e utilities e telecom (casos do site); saúde (Datanyze); governo e multimercado na planilha.",
      "presencaRegional": "São Paulo (SP): escritório e Hub de Integração; 2 escritórios no Brasil.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "7387b283-bbf3-4fff-8885-22b643d4d458",
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "ff812362-678e-4ae8-9054-b910b7a6307f"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 3,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,1",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: Soluções Digitais). Segmentos 3: 5 em comum (Multimercado, Energia, Serviços Financeiros, Governo, Saúde). Regional 3: São Paulo (SP): escritório e Hub de Integração; 2 escritórios no Brasil. Porte 2: 1.000+ colaboradores.",
        "riscoPlanilha": 2.3
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:51:17.328+00:00",
        "itens": {
          "forcas": [
            "Presença capilar em mais de 350 localidades no Brasil, cobrindo campo onde a Spread não demonstra atuação.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados mensais documentados.",
            "Integração com mais de 250 instituições via APIs seguras, incluindo SAP, Salesforce, TOTVS e ServiceNow.",
            "Especialização profunda em Saúde: maior canal Tasy da América Latina, PACS e AMS para sistemas hospitalares.",
            "NIA em modelo agêntico consulta e aciona processos em qualquer sistema, indo além de uma IA apenas governada."
          ],
          "fraquezas": [
            "A Spread tem excelência reconhecida em SAP, o que pode pesar em disputas onde SAP é o critério central.",
            "A GABBI é uma oferta de IA com nome e identidade próprios, o que facilita o recall da marca em conversas de mercado.",
            "A Spread atua desde 1983, com histórico longo que pode transmitir mais segurança a compradores avessos a risco.",
            "Não há dados públicos suficientes para comparar a profundidade do portfólio de workforce da Spread com o nosso."
          ],
          "oportunidades": [
            "A Spread não evidencia cobertura de Field Service nacional; a Digisystem pode avançar em contratos que exigem presença física.",
            "Saúde é segmento fraco na comunicação da Spread; a Digisystem pode consolidar autoridade com cases de Tasy e PACS.",
            "A Spread não apresenta oferta estruturada de DBA as a Service, abrindo espaço em clientes com ambientes legados complexos.",
            "Governo aparece na planilha da Spread, mas sem cases visíveis no site; a Digisystem pode mostrar diferencial nesse segmento.",
            "A ausência de um diagnóstico rápido como o Pulse deixa espaço para a Digisystem entrar em contas novas com baixo atrito."
          ],
          "ameacas": [
            "A Spread oferece squads e workforce especializada, competindo diretamente com nossa alocação de profissionais.",
            "Serviços gerenciados são parte do portfólio da Spread, o que coloca as duas empresas na mesma mesa em RFPs.",
            "A comunicação da Spread em inovação e cases de sucesso pode influenciar percepção de mercado em segmentos que disputamos.",
            "A Spread atua em financeiro, energia e utilities, segmentos que também são foco da Digisystem, aumentando a sobreposição direta."
          ]
        }
      }
    },
    {
      "id": "db47f505-7d99-4083-98e1-d0fd3a2d950d",
      "nome": "Stefanini",
      "slug": "stefanini",
      "logo": "mercado/logos/stefanini.png",
      "descricao": "Grupo global de origem brasileira, com 36 anos de atuação, focado em transformação digital. Atende com IA, digital workplace e atendimento cognitivo (projeto da Caixa) e é o maior investidor brasileiro em open innovation na categoria de TI.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/stefanini"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/stefanini-brasil"
        },
        {
          "tipo": "site",
          "url": "https://stefanini.com/pt/"
        }
      ],
      "temas": [
        {
          "tema": "Cases de sucesso",
          "frequencia": 1
        },
        {
          "tema": "Transformação digital",
          "frequencia": 1
        },
        {
          "tema": "Inovação",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "30.000+ colaboradores (LinkedIn). Faturamento R$ 5 bilhões 2022",
        "faixaPreco": null,
        "risco": 5,
        "riscoMotivo": "Portfólio muito parecido com o da Digisystem; quatro ou cinco segmentos em comum.",
        "diferenciais": "1. 36 anos de atuação, origem brasileira e presença global. 2. Maior investidor do país em open innovation na categoria de TI (Open Corps 2024). 3. Projeto de atendimento cognitivo com IA para a Caixa.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Banco público (Caixa), automotivo e outros setores; a planilha marca financeiro, saúde, multimercado e governo.",
      "presencaRegional": "Grupo global com operação nacional no Brasil; sede não conferida.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
        "350a1f5e-00b0-45cc-b365-9209c091267d",
        "6a7b772e-8b06-438d-8b00-44506a3a9bef"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 3,
        "segmentos": 3,
        "regional": 3,
        "porte": 3,
        "pontuacao": "3",
        "justificativa": "Sobreposição 3: 5 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Digital Workplace Services: Service Desk; Intelligence Hub; Serviços Gerenciados: AIOps). Segmentos 3: 4 em comum (Serviços Financeiros, Saúde, Multimercado, Governo). Regional 3: Grupo global com operação nacional no Brasil; sede não conferida. Porte 3: 30.000+ colaboradores.",
        "riscoPlanilha": 4.25
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:14:12.548+00:00",
        "itens": {
          "forcas": [
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados por mês coloca a Digisystem à frente em suporte operacional.",
            "Field Service em mais de 350 localidades garante presença física nacional que a Stefanini, com foco global, tende a diluir.",
            "Gestão Hospitalar com o Tasy posiciona a Digisystem como especialista em saúde, segmento em que a Stefanini atua de forma genérica.",
            "Soluções Financeiras com sistema de pagamento de garantias conectado a todas as instituições do país é diferencial difícil de replicar rapidamente.",
            "Intelligence Hub executa o roadmap, não apenas entrega relatório — modelo mais concreto do que a consultoria tradicional da Stefanini."
          ],
          "fraquezas": [
            "A Stefanini está presente em mais de 40 países; a Digisystem atua em Brasil, Colômbia e Argentina, com alcance global muito menor.",
            "Parceiros como SAP, IBM, Microsoft e Oracle dão à Stefanini credencial de ecossistema que a Digisystem ainda não apresenta publicamente no mesmo nível.",
            "A Topaz, do grupo Stefanini, tem caso consolidado com quase 25 milhões de clientes e R$ 1 trilhão processado — referência forte em fintech.",
            "A Stefanini tem histórico de mais de 30 anos e marca reconhecida; a Digisystem precisa construir mais visibilidade de marca no mercado."
          ],
          "oportunidades": [
            "A Stefanini tem dificuldade de manter consistência local; a Digisystem pode crescer com clientes que precisam de parceiro presente e próximo.",
            "Governo é segmento forte da Digisystem e secundário para a Stefanini, que foca mais em financeiro, varejo e indústria.",
            "A especialização em Gestão Hospitalar abre espaço com hospitais e operadoras onde a Stefanini não tem solução dedicada como o Tasy.",
            "O Pulse, diagnóstico em até duas semanas, é uma entrada rápida e de baixo risco para clientes que ainda não conhecem a Digisystem.",
            "A NIA no modelo agêntico é diferencial em IA aplicada à operação, espaço ainda pouco explorado pela Stefanini publicamente."
          ],
          "ameacas": [
            "A expansão da Stefanini para mercados emergentes em 2025-2026 pode aumentar a pressão competitiva nos mesmos territórios que a Digisystem quer crescer.",
            "O ecossistema SAP da Stefanini pode travar clientes que já usam SAP, dificultando a entrada da Digisystem nesses contas.",
            "A diversificação de serviços de TI prevista para 2025 pode levar a Stefanini a cobrir lacunas onde hoje a Digisystem tem espaço.",
            "A presença forte da Stefanini no setor financeiro, com grandes bancos como clientes, pode dificultar a entrada da Digisystem nessas contas."
          ]
        }
      }
    },
    {
      "id": "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
      "nome": "Sys Manager",
      "slug": "sys-manager",
      "logo": "mercado/logos/sys-manager.png",
      "descricao": "Empresa brasileira de TI, fundada em 1996, que atua em transformação digital, desenvolvimento ágil, modernização com low-code (OutSystems), RPA e IA, além de equipes dedicadas, consultoria, suporte, licenciamento e treinamento.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/sysmanagerinformatica"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/sys.manager"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/sys-manager-inform%C3%A1tica"
        },
        {
          "tipo": "site",
          "url": "https://sysmanager.global/"
        }
      ],
      "temas": [
        {
          "tema": "Tendências tecnológicas",
          "frequencia": 1
        },
        {
          "tema": "Cases de sucesso e integração de sistemas",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "100+ colaboradores (LinkedIn)",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Portfólio muito parecido com o da Digisystem; quatro ou cinco segmentos em comum.",
        "diferenciais": "1. Mais de 28 anos de mercado, desde 1996. 2. Foco em low-code (OutSystems), RPA e IA. 3. Equipes dedicadas, consultoria, suporte, licenciamento e treinamento.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Varejo, governo, saúde, financeiro.",
      "presencaRegional": "Fundada no Brasil em 1996; atua nas Américas (Clutch); praça no Brasil não confirmada.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "db69daf9-928f-4db0-b60c-0d84f7567cca",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
        "350a1f5e-00b0-45cc-b365-9209c091267d"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "891548c0-8f2e-46f9-92e7-9b456660be8e"
      ],
      "sinais": {
        "sobreposicao": 3,
        "segmentos": 3,
        "regional": 2,
        "porte": 1,
        "pontuacao": "2,6",
        "justificativa": "Sobreposição 3: 5 item(ns) do portfólio (Alocação de Profissionais; Desenvolvimento: APIS & Integração; Desenvolvimento: Soluções Digitais; Digital Workplace Services: Service Desk; Intelligence Hub). Segmentos 3: 4 em comum (Multimercado, Governo, Saúde, Serviços Financeiros). Regional 2: Fundada no Brasil em 1996; atua nas Américas (Clutch); praça no Brasil não confirmada. Porte 1: 100+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:45:49.503+00:00",
        "itens": {
          "forcas": [
            "Presença física em mais de 350 localidades no Brasil, algo que a Sys Manager não demonstra ter em campo.",
            "Mais de 250 instituições integradas via APIs seguras, com conectividade comprovada em sistemas como SAP, TOTVS e Salesforce.",
            "Service Desk com 47.750 chamados/mês e 94% de resolução no primeiro contato, com métricas e SLA claros.",
            "Gestão Hospitalar especializada: maior canal de implantação Bionexo Tasy da América Latina, com PACS e sustentação dedicada.",
            "Mais de 3.000 profissionais alocados, com seleção apoiada por IA, sem aumentar o headcount do cliente."
          ],
          "fraquezas": [
            "A Sys Manager atua com low-code OutSystems, plataforma consolidada no mercado, que a Digisystem não menciona no portfólio.",
            "A Sys Manager oferece treinamento e licenciamento como serviços próprios, o que a Digisystem não apresenta formalmente.",
            "A Sys Manager tem histórico desde 1996 e pode usar maturidade de marca em disputas com clientes mais tradicionais."
          ],
          "oportunidades": [
            "A Sys Manager não evidencia atuação em Energia, segmento em que a Digisystem já opera com portfólio completo.",
            "A Sys Manager não apresenta operação internacional, enquanto a Digisystem já atua na Colômbia e na Argentina.",
            "A Sys Manager não demonstra capacidade de suporte presencial em campo, abrindo espaço para o Field Service da Digisystem.",
            "A Sys Manager não cita monitoramento 24x7 nem uptime documentado, espaço que a Observabilidade da Digisystem ocupa bem.",
            "A Sys Manager não apresenta solução dedicada a saúde hospitalar, área em que a Digisystem tem diferencial claro com o Tasy."
          ],
          "ameacas": [
            "A Sys Manager atua com RPA e IA, podendo disputar diretamente clientes que buscam automação de processos nos mesmos segmentos.",
            "A Sys Manager tem foco em cases de sucesso e integração de sistemas, narrativa próxima à da Digisystem em APIs e Dados.",
            "A Sys Manager oferece equipes dedicadas, concorrendo diretamente com a Alocação de Profissionais da Digisystem.",
            "A atuação da Sys Manager em governo e financeiro, combinada com low-code, pode acelerar entregas e atrair clientes que priorizam prazo."
          ]
        }
      }
    },
    {
      "id": "70a69a14-9736-4db5-acb7-76b177840c4e",
      "nome": "System Frame",
      "slug": "system-frame",
      "logo": "mercado/logos/system-frame.png",
      "descricao": "Empresa brasileira de infraestrutura de TI (redes, cabeamento, Wi-Fi, segurança), com NOC 24x7, service desk e alocação de profissionais, de unidades individuais a operações distribuídas.",
      "links": [
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/systemframe"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/system-frame"
        },
        {
          "tipo": "site",
          "url": "https://www.systemframe.com.br"
        }
      ],
      "temas": [],
      "ficha": {
        "porte": "51 a 200 colaboradores (LinkedIn, via planilha)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Sobreposição parcial de portfólio; atua na mesma praça.",
        "diferenciais": "Boa executora, confiável no operacional, custo competitivo.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": null,
      "presencaRegional": "Operação a partir de São Paulo (SP), com equipe também em Campinas.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0208ce4b-24a5-4a21-ae92-92f5e276a407",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
        "edcaab13-7483-47ac-ae0e-a06098c7ab92"
      ],
      "segmentosEmComum": [],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 0,
        "regional": 3,
        "porte": 0,
        "pontuacao": "1,4",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Alocação de Profissionais; Digital Workplace Services: Service Desk; Serviços Gerenciados: Observabilidade). Segmentos 0: 0 em comum. Regional 3: Operação a partir de São Paulo (SP), com equipe também em Campinas. Porte 0: 51+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:54:59.139+00:00",
        "itens": {
          "forcas": [
            "Portfólio muito mais amplo: da infraestrutura ao desenvolvimento de software, dados, IA e gestão hospitalar.",
            "Presença em mais de 350 localidades no Brasil, com Field Service presencial e rollout estruturado.",
            "Mais de 3.000 profissionais alocados e seleção apoiada por IA, com acompanhamento contínuo do cliente.",
            "Atuação setorial profunda em Saúde, Governo e Serviços Financeiros, com soluções verticalizadas para cada segmento.",
            "Intelligence Hub: nós não entregamos só diagnóstico, executamos o roadmap junto com o cliente."
          ],
          "fraquezas": [
            "System Frame tem foco declarado em redes, cabeamento, Wi-Fi e segurança física, áreas que a Digisystem não destaca no portfólio.",
            "NOC 24x7 especializado em infraestrutura de rede é uma oferta direta deles que a Digisystem não menciona explicitamente."
          ],
          "oportunidades": [
            "Clientes que começam com infraestrutura básica precisam evoluir para dados, IA e integração: a Digisystem pode entrar depois da base instalada.",
            "System Frame não informa atuação em Saúde ou Governo, segmentos onde a Digisystem tem soluções específicas e consolidadas.",
            "Ausência de oferta de desenvolvimento de software e IA abre espaço para a Digisystem ampliar contratos onde a System Frame já está.",
            "Sem produto consultivo visível, a System Frame não endereça o problema de negócio do cliente, e o Intelligence Hub faz exatamente isso."
          ],
          "ameacas": [
            "System Frame pode se posicionar como porta de entrada mais simples e barata para clientes que ainda não querem uma transformação digital ampla.",
            "Foco em alocação de profissionais de infraestrutura pode disputar diretamente contratos de Suporte Residente e Field Service da Digisystem.",
            "Operação de NOC 24x7 consolidada pode tornar a System Frame difícil de substituir em clientes com redes críticas já implantadas."
          ]
        }
      }
    },
    {
      "id": "941a16a1-079c-42c7-ba3d-94320e0b8032",
      "nome": "TCS (Tata)",
      "slug": "tcs-tata",
      "logo": "mercado/logos/tcs-tata.png",
      "descricao": "Multinacional indiana de TI com subsidiária no Brasil e centro de entregas em Londrina (PR). Investe R$ 200 milhões num novo campus no país e abre 1.600 vagas.",
      "links": [
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/tata-consultancy-services"
        },
        {
          "tipo": "site",
          "url": "https://www.tcs.com"
        }
      ],
      "temas": [
        {
          "tema": "Soluções tecnológicas",
          "frequencia": 1
        },
        {
          "tema": "Inovação",
          "frequencia": 1
        },
        {
          "tema": "Tendências de mercado",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "600.000+ colaboradores (LinkedIn). Faturamento US$ 25 bilhões 2022",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Novo campus de R$ 200 milhões em Londrina, com 1.600 vagas. 2. Centro especializado em transformação de negócios, IA e operações cognitivas. 3. Fundada em 1968 e presente em dezenas de países.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Bancário, bens de consumo, educação, energia, saúde, alta tecnologia, manufatura, serviços públicos, varejo, viagens, logística.",
      "presencaRegional": "Subsidiária Tata Consultancy Services do Brasil; centro de entregas em Londrina (PR), com novo campus previsto para 2027.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "350a1f5e-00b0-45cc-b365-9209c091267d",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "7387b283-bbf3-4fff-8885-22b643d4d458",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 3,
        "porte": 3,
        "pontuacao": "2,6",
        "justificativa": "Sobreposição 2: 4 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Intelligence Hub; Serviços Gerenciados: Cloud). Segmentos 3: 5 em comum (Serviços Financeiros, Multimercado, Energia, Saúde, Governo). Regional 3: Subsidiária Tata Consultancy Services do Brasil; centro de entregas em Londrina (PR), com novo campus previsto para 2027. Porte 3: 600.000+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:46:07.664+00:00",
        "itens": {
          "forcas": [
            "Presença capilar em campo: mais de 350 localidades atendidas no Brasil com Field Service próprio.",
            "Profundidade setorial em Saúde: maior canal de implantação Tasy da América Latina, sem equivalente na TCS.",
            "Mais de 250 instituições integradas via APIs seguras, com histórico em sistemas críticos do mercado financeiro.",
            "Intelligence Hub executa o roadmap, não entrega só relatório, o que encurta o caminho entre diagnóstico e resultado.",
            "Service Desk com 94% de resolução no primeiro contato e Suporte Residente com satisfação acima de 98%."
          ],
          "fraquezas": [
            "TCS tem escala global e portfólio de propriedade intelectual muito mais amplo para grandes contratos corporativos.",
            "Investimento de R$ 200 milhões em campus no Brasil sinaliza capacidade de expansão que a Digisystem ainda não igualou publicamente.",
            "Presença em mais segmentos (manufatura, varejo, logística, bens de consumo) dá à TCS mais frentes de entrada em contas enterprise.",
            "Marca TCS é reconhecida internacionalmente, o que facilita vendas em grupos multinacionais com decisão fora do Brasil."
          ],
          "oportunidades": [
            "Governo é segmento forte da Digisystem e está fora do foco declarado da TCS no Brasil.",
            "Hospitais e operadoras de saúde demandam especialização que a TCS não demonstra ter no mercado local.",
            "Clientes que precisam de suporte presencial capilar no interior do Brasil encontram na Digisystem cobertura que a TCS não anuncia.",
            "Empresas de médio porte em Serviços Financeiros buscam parceiro com entrega local e rápida, não uma multinacional de ciclo longo.",
            "O Pulse, diagnóstico de 1 a 2 semanas, abre portas em contas que ainda não querem um engajamento longo."
          ],
          "ameacas": [
            "A abertura de 1.600 vagas no Brasil aumenta a capacidade de entrega local da TCS e reduz a vantagem de proximidade da Digisystem.",
            "TCS pode usar escala para precificar abaixo da Digisystem em contratos de alocação de profissionais e serviços gerenciados.",
            "Expansão da TCS em Saúde e Energia pode disputar diretamente contas que hoje são base da Digisystem.",
            "Atração de talentos pela TCS, com campus e investimento visível, pode pressionar o mercado de profissionais que a Digisystem aloca."
          ]
        }
      }
    },
    {
      "id": "3f740c63-f2b4-4fb6-a2d3-7122069465e3",
      "nome": "THS Tecnologia",
      "slug": "ths-tecnologia",
      "logo": null,
      "descricao": "Empresa de TI com sede em Belém (PA) e vagas em São Paulo, Brasília, Curitiba e São Luís, que se apresenta entre as maiores de tecnologia do país, com nuvem, IA, blockchain e desenvolvimento de software.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/thstecnologia"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/thsglobal"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/ths-tecnologia"
        },
        {
          "tipo": "site",
          "url": "https://ths.inf.br"
        }
      ],
      "temas": [
        {
          "tema": "Soluções de TI",
          "frequencia": 1
        },
        {
          "tema": "Inovação em segurança e cloud computing",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "200+ colaboradores (LinkedIn)",
        "faixaPreco": null,
        "risco": 3,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; atua na mesma praça.",
        "diferenciais": "1. Posiciona-se entre as maiores empresas de tecnologia do Brasil (autodescrição). 2. Oferta de nuvem, IA, blockchain e desenvolvimento de software. 3. Vagas em várias praças (SP, DF, PR e MA).",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Varejo, saúde, financeiro, indústria.",
      "presencaRegional": "Sede em Belém (PA); vagas em Brasília (DF) e São Paulo (SP).",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 1,
        "segmentos": 3,
        "regional": 3,
        "porte": 1,
        "pontuacao": "2",
        "justificativa": "Sobreposição 1: 2 item(ns) do portfólio (Desenvolvimento: Soluções Digitais; Serviços Gerenciados: Cloud). Segmentos 3: 4 em comum (Multimercado, Saúde, Serviços Financeiros, Governo). Regional 3: Sede em Belém (PA); vagas em Brasília (DF) e São Paulo (SP). Porte 1: 200+ colaboradores.",
        "riscoPlanilha": null
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:52:05.681+00:00",
        "itens": {
          "forcas": [
            "Portfólio vertical profundo em Governo e Saúde, segmentos que a THS não declara como foco.",
            "Mais de 250 instituições integradas via API, com conectores para SAP, Salesforce, TOTVS e ServiceNow.",
            "Field Service presente em mais de 350 localidades no Brasil, com cobertura nacional comprovada.",
            "NIA com modelo agêntico consulta e aciona processos em qualquer sistema, além de analytics e governança de dados.",
            "Mais de 3.000 profissionais alocados com seleção apoiada por IA, sem aumentar headcount do cliente."
          ],
          "fraquezas": [
            "A THS declara atuação em blockchain, tecnologia que não consta no portfólio público da Digisystem.",
            "A THS se posiciona como uma das maiores do país, o que pode ter mais peso em processos de seleção por marca.",
            "Não há dados sobre presença da THS fora do Brasil, mas a Digisystem ainda tem atuação limitada na América Latina."
          ],
          "oportunidades": [
            "A THS não apresenta metodologia consultiva de execução; a Digisystem pode entrar com Intelligence Hub onde ela entrega só relatório.",
            "Segmento de Energia não aparece no radar da THS, abrindo espaço para a Digisystem se posicionar com exclusividade.",
            "A THS não menciona gestão hospitalar nem PACS; há espaço direto para avançar em saúde sem concorrência dela.",
            "Baixa frequência de publicação da THS indica menor presença digital, abrindo espaço para a Digisystem ganhar autoridade de marca."
          ],
          "ameacas": [
            "A THS atua em cloud computing, segmento que a Digisystem também opera; pode disputar os mesmos contratos de migração e gestão.",
            "Presença em São Paulo, Brasília e Curitiba coloca a THS nos principais hubs de decisão de TI do país.",
            "O posicionamento de inovação em segurança da THS pode atrair clientes do setor financeiro que também são alvo da Digisystem."
          ]
        }
      }
    },
    {
      "id": "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
      "nome": "Tivit",
      "slug": "tivit",
      "logo": null,
      "descricao": "Multinacional brasileira de tecnologia, adquirida pela Almaviva (líder global em transformação digital, IA e cloud). Atua em nuvem, dados, serviços gerenciados, digital workplace, banking as a service (TBanks) e soluções para varejo e logística.",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/TIVIToficial"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/tivit_oficial"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/tivit"
        },
        {
          "tipo": "site",
          "url": "https://tivit.com"
        }
      ],
      "temas": [
        {
          "tema": "Transformação digital",
          "frequencia": 1
        },
        {
          "tema": "Inovações em cloud e segurança",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "6.000+ colaboradores (LinkedIn). Faturamento R$ 2 bilhões 2022",
        "faixaPreco": null,
        "risco": 5,
        "riscoMotivo": "Portfólio muito parecido com o da Digisystem; quatro ou cinco segmentos em comum.",
        "diferenciais": "1. Adquirida pela Almaviva, o que amplia o alcance na América Latina. 2. Mais de 20 anos no mercado financeiro, com a plataforma TBanks (APIs). 3. Apoio aos maiores varejistas e empresas de logística do Brasil.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Mercado financeiro (mais de 20 anos), varejo, logística e serviços; a planilha marca multimercado, energia e governo.",
      "presencaRegional": "Multinacional brasileira, com operação nacional; sede não conferida na página lida.",
      "situacao": "adquirida",
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "4e4d4e8b-d431-496e-812a-8714e3164d01",
        "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
        "6a7b772e-8b06-438d-8b00-44506a3a9bef",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "7387b283-bbf3-4fff-8885-22b643d4d458",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 3,
        "segmentos": 3,
        "regional": 3,
        "porte": 2,
        "pontuacao": "2,9",
        "justificativa": "Sobreposição 3: 5 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Financeiras; Digital Workplace Services: Service Desk; Serviços Gerenciados: AIOps; Serviços Gerenciados: Cloud). Segmentos 3: 4 em comum (Serviços Financeiros, Multimercado, Energia, Governo). Regional 3: Multinacional brasileira, com operação nacional; sede não conferida na página lida. Porte 2: 6.000+ colaboradores.",
        "riscoPlanilha": 3.7
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:14:57.225+00:00",
        "itens": {
          "forcas": [
            "Presença consolidada em Saúde com o Tasy, produto sem equivalente no portfólio da Tivit.",
            "Field Service em mais de 350 localidades brasileiras, com suporte presencial que a Tivit não declara.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados mensais.",
            "Intelligence Hub executa o roadmap, não apenas entrega relatório — diferencial claro frente à consultoria tradicional.",
            "NIA com modelo agêntico integra e aciona processos em qualquer sistema, além de analytics convencional."
          ],
          "fraquezas": [
            "Tivit está em 10 países; a Digisystem atua só no Brasil, Colômbia e Argentina.",
            "Parceiros como SAP, Oracle, AWS e Microsoft reforçam a credibilidade da Tivit no mercado enterprise.",
            "Tivit tem SEO robusto em cloud e inovação, ampliando visibilidade digital frente à Digisystem.",
            "Portfólio da Tivit inclui cibersegurança estruturada, segmento que a Digisystem não declara explicitamente."
          ],
          "oportunidades": [
            "Tivit não declara atuação especializada em Saúde; a Digisystem pode avançar nesse segmento com o Tasy e o PACS.",
            "Tivit foca em outsourcing e cloud; a Digisystem pode ocupar o espaço de parceira consultiva que executa o roadmap.",
            "Tivit não menciona Soluções Financeiras críticas; a Digisystem tem sistemas conectados a todas as instituições do país.",
            "Tivit não declara Field Service estruturado; clientes que precisam de suporte presencial ficam descobertos.",
            "Expansão da Tivit para saúde em 2025-2026 ainda é planejada; a Digisystem já opera no setor com produto e clientes."
          ],
          "ameacas": [
            "Tivit planeja expansão para saúde em 2025-2026, segmento hoje exclusivo da Digisystem no confronto direto.",
            "Escala regional da Tivit atrai grandes empresas que valorizam presença multinacional acima de especialização local.",
            "Parceria com SAP permite à Tivit competir diretamente em projetos onde a Digisystem integra o mesmo ecossistema.",
            "SEO robusto da Tivit pode capturar demanda de transformação digital antes de a Digisystem aparecer na busca."
          ]
        }
      }
    },
    {
      "id": "3fcf539a-f676-4911-8832-54eec9e46e69",
      "nome": "V8.Tech",
      "slug": "v8-tech",
      "logo": "mercado/logos/v8-tech.png",
      "descricao": "Integradora de soluções digitais e serviços gerenciados, fundada em 2014, com mais de 100 clientes entre as mil maiores empresas do Brasil. É a primeira parceira Oracle Cloud Managed Services Provider da América Latina e foi comprada pela TIM Brasil em 2025.",
      "links": [
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/v8-consulting/"
        },
        {
          "tipo": "site",
          "url": "https://v8.tech"
        }
      ],
      "temas": [
        {
          "tema": "Cases e blog técnico",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "~300 colaboradores (LinkedIn). Faturamento R$ 380 milhões (2024 estimado)",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Mais de 100 clientes entre as 1.000 maiores empresas do Brasil. 2. Primeira parceira Oracle CMSP da América Latina. 3. Comprada pela TIM Brasil por até R$ 280 milhões.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Serviços financeiros, indústria, saúde, seguros, mídia e comunicação, utilities, educação, telecom, varejo, agronegócio e transporte.",
      "presencaRegional": "Posições híbridas em São Paulo (SP) e Rio de Janeiro (RJ) e remotas em todo o Brasil.",
      "situacao": "adquirida",
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "6a7b772e-8b06-438d-8b00-44506a3a9bef",
        "84e84938-3b5c-4d33-af12-84190673718d",
        "22e4a71a-42b6-40ac-9ce6-42317c81480c"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "7387b283-bbf3-4fff-8885-22b643d4d458",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 3,
        "porte": 1,
        "pontuacao": "2,4",
        "justificativa": "Sobreposição 2: 4 item(ns) do portfólio (Desenvolvimento: Dados & IA; Serviços Gerenciados: AIOps; Serviços Gerenciados: Cloud; Serviços Gerenciados: DBA as a Service). Segmentos 3: 5 em comum (Serviços Financeiros, Saúde, Multimercado, Energia, Governo). Regional 3: Posições híbridas em São Paulo (SP) e Rio de Janeiro (RJ) e remotas em todo o Brasil. Porte 1: 300+ colaboradores.",
        "riscoPlanilha": 4.35
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T17:15:41.714+00:00",
        "itens": {
          "forcas": [
            "Field Service em mais de 350 localidades no Brasil: presença física que a V8.Tech não demonstra ter.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados por mês.",
            "Suporte Residente com satisfação acima de 98%: especialista dentro do cliente, não só remoto.",
            "Gestão Hospitalar com Tasy e PACS: verticais de saúde que a V8.Tech não cobre.",
            "Mais de 250 instituições integradas via API, incluindo SAP, Salesforce, TOTVS e ServiceNow."
          ],
          "fraquezas": [
            "V8.Tech tem certificação AWS Advanced e parcerias com UiPath e VMware; portfólio de parceiros mais visível.",
            "Faturamento previsto de R$ 440 milhões em 2025 reforça a percepção de escala da V8.Tech no mercado.",
            "Blog técnico e cases ativos colocam a V8.Tech com presença de conteúdo mais estruturada publicamente.",
            "V8.Tech já opera no Chile, onde a Digisystem ainda não atua.",
            "Posicionamento de V8.Tech em RPA e FinOps é mais explícito e associado a parceiros reconhecidos."
          ],
          "oportunidades": [
            "V8.Tech tem baixa profundidade em saúde: Tasy e PACS da Digisystem cobrem um espaço que ela deixa aberto.",
            "Presença física limitada da V8.Tech abre espaço para Field Service e Suporte Residente da Digisystem em contas que exigem atendimento on-site.",
            "Colômbia e Argentina já são mercados da Digisystem; a V8.Tech ainda planeja entrar neles em 2025-2026.",
            "Intelligence Hub com execução de roadmap diferencia a Digisystem onde a V8.Tech entrega arquitetura sem condução operacional.",
            "Alocação de mais de 3.000 profissionais posiciona a Digisystem onde a V8.Tech não mostra capacidade de staffing estruturada."
          ],
          "ameacas": [
            "Expansão da V8.Tech para Colômbia e México pode disputar contas que a Digisystem já atende na região.",
            "Aceleração em IA e dados pela V8.Tech em 2025 pode reduzir a diferenciação da NIA da Digisystem.",
            "Parcerias robustas com AWS e Oracle dão à V8.Tech credibilidade técnica que influencia decisões em cloud.",
            "A V8.Tech atende 100 grandes empresas no Brasil: base que pode crescer nos mesmos segmentos da Digisystem.",
            "Presença de conteúdo técnico ativo da V8.Tech pode aumentar sua visibilidade em segmentos como financeiro e saúde."
          ]
        }
      }
    },
    {
      "id": "7c8f6aff-0d06-4c63-9841-aad9cafe7e24",
      "nome": "Wipro",
      "slug": "wipro",
      "logo": "mercado/logos/wipro.png",
      "descricao": "Multinacional indiana de TI, no Brasil há cerca de 14 anos, parceira de grandes provedores de nuvem. No país atende bancos, seguros, varejo, energia, utilities e setor público e comprou a IVIA (serviços financeiros, varejo e manufatura).",
      "links": [
        {
          "tipo": "facebook",
          "url": "https://www.facebook.com/WiproLimited"
        },
        {
          "tipo": "instagram",
          "url": "https://www.instagram.com/wiprolimited"
        },
        {
          "tipo": "linkedin",
          "url": "https://www.linkedin.com/company/wipro"
        },
        {
          "tipo": "site",
          "url": "https://www.wipro.com/pt-BR/"
        }
      ],
      "temas": [
        {
          "tema": "Soluções digitais",
          "frequencia": 1
        },
        {
          "tema": "Sustentabilidade",
          "frequencia": 1
        },
        {
          "tema": "Tendências de TI",
          "frequencia": 1
        }
      ],
      "ficha": {
        "porte": "250.000+ colaboradores (LinkedIn). Faturamento US$ 10 bilhões 2022",
        "faixaPreco": null,
        "risco": 4,
        "riscoMotivo": "Quatro ou cinco segmentos em comum; sobreposição parcial de portfólio.",
        "diferenciais": "1. Cerca de 14 anos de presença no Brasil. 2. Centro de co-inovação Wipro-AWS Launchpad no país. 3. Aquisição da IVIA para reforçar o setor financeiro, varejo e manufatura.",
        "fonte": "Planilha Analise_concorrentes.xlsx e pesquisa web com fonte por dado (revisao.csv); revisão de 26/11/2026.",
        "fonteData": "2026-11-26"
      },
      "segmentosAtua": "Bancos, serviços financeiros, seguros, varejo, energia, utilities e setor público (site Wipro Brasil); saúde e multimercado na planilha.",
      "presencaRegional": "Presença no Brasil há cerca de 14 anos, com centro de co-inovação com a AWS; praças não detalhadas na fonte.",
      "situacao": null,
      "revisadoEm": "2026-11-26",
      "ofertaSobreposta": [
        "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
        "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
        "84e84938-3b5c-4d33-af12-84190673718d"
      ],
      "segmentosEmComum": [
        "891548c0-8f2e-46f9-92e7-9b456660be8e",
        "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
        "7387b283-bbf3-4fff-8885-22b643d4d458",
        "ff812362-678e-4ae8-9054-b910b7a6307f",
        "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d"
      ],
      "sinais": {
        "sobreposicao": 2,
        "segmentos": 3,
        "regional": 2,
        "porte": 3,
        "pontuacao": "2,4",
        "justificativa": "Sobreposição 2: 3 item(ns) do portfólio (Desenvolvimento: Dados & IA; Desenvolvimento: Soluções Digitais; Serviços Gerenciados: Cloud). Segmentos 3: 5 em comum (Serviços Financeiros, Multimercado, Energia, Saúde, Governo). Regional 2: Presença no Brasil há cerca de 14 anos, com centro de co-inovação com a AWS; praças não detalhadas na fonte. Porte 3: 250.000+ colaboradores.",
        "riscoPlanilha": 2.85
      },
      "swot": {
        "status": "pronta",
        "geradoEm": "2026-11-25T19:47:38.359+00:00",
        "itens": {
          "forcas": [
            "Presença física em mais de 350 localidades no Brasil, com Field Service e Suporte Residente que a Wipro não demonstra ter em escala local.",
            "Especialização profunda em Saúde, com Tasy, PACS e AMS dedicados — segmento que a Wipro não evidencia como foco no Brasil.",
            "Mais de 250 instituições integradas via APIs seguras, com conectividade comprovada em sistemas legados e plataformas como SAP, Salesforce e TOTVS.",
            "Intelligence Hub executa o roadmap de ponta a ponta, não apenas entrega relatório — diferencial claro frente a consultorias tradicionais.",
            "Service Desk com 94% de resolução no primeiro contato e mais de 47.750 chamados mensais, com métricas e SLA mensuráveis."
          ],
          "fraquezas": [
            "Wipro é uma multinacional com escala global e relacionamentos estabelecidos com grandes provedores de nuvem, o que pode pesar em negociações enterprise.",
            "A aquisição da IVIA reforça a presença da Wipro em serviços financeiros e varejo, segmentos onde a Digisystem também compete.",
            "Marca Wipro tem reconhecimento internacional que pode influenciar decisões de compra em grandes contas com governança global.",
            "Wipro pode ter maior capacidade de absorver projetos de altíssimo volume com times distribuídos globalmente."
          ],
          "oportunidades": [
            "Wipro não evidencia atuação estruturada em Governo no Brasil — segmento em que a Digisystem tem portfólio e presença ativa.",
            "Suporte presencial e capilaridade regional são lacunas que a Wipro não comunica; a Digisystem pode avançar nesse diferencial.",
            "Gestão Hospitalar especializada é um espaço que a Wipro não ocupa, abrindo caminho para a Digisystem crescer em Saúde.",
            "Clientes que buscam execução, não só consultoria, encontram na Digisystem uma alternativa concreta ao modelo tradicional da Wipro.",
            "NIA e AIOps com correção proativa são diferenciais que a Digisystem pode comunicar onde a Wipro fala apenas em tendências de TI."
          ],
          "ameacas": [
            "A compra da IVIA pela Wipro amplia sua capacidade em serviços financeiros e pode acirrar a disputa em contas que a Digisystem já atende.",
            "Posicionamento em sustentabilidade e tendências de TI da Wipro pode atrair decisores que valorizam agenda ESG em grandes empresas.",
            "Parceria da Wipro com grandes provedores de nuvem pode facilitar a entrada em contas onde a Digisystem compete em Cloud.",
            "Escala global da Wipro permite precificação agressiva em projetos de longa duração, o que pode pressionar margens da Digisystem."
          ]
        }
      }
    }
  ],
  "matriz": [
    {
      "itemId": "0208ce4b-24a5-4a21-ae92-92f5e276a407",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f2be0460-6023-4ae5-82ad-44735a6084a7",
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30"
      ]
    },
    {
      "itemId": "0208ce4b-24a5-4a21-ae92-92f5e276a407",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f2be0460-6023-4ae5-82ad-44735a6084a7",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "0a966521-580f-40ab-9184-70842a0339f0",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30"
      ]
    },
    {
      "itemId": "0208ce4b-24a5-4a21-ae92-92f5e276a407",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "0a966521-580f-40ab-9184-70842a0339f0",
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30"
      ]
    },
    {
      "itemId": "0208ce4b-24a5-4a21-ae92-92f5e276a407",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d"
      ]
    },
    {
      "itemId": "0208ce4b-24a5-4a21-ae92-92f5e276a407",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "5f904105-d9db-498a-acc2-b6c50faf330f",
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f2be0460-6023-4ae5-82ad-44735a6084a7",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "0a966521-580f-40ab-9184-70842a0339f0",
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30"
      ]
    },
    {
      "itemId": "db69daf9-928f-4db0-b60c-0d84f7567cca",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30"
      ]
    },
    {
      "itemId": "db69daf9-928f-4db0-b60c-0d84f7567cca",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "vendemos",
      "concorrentes": [
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30"
      ]
    },
    {
      "itemId": "db69daf9-928f-4db0-b60c-0d84f7567cca",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30"
      ]
    },
    {
      "itemId": "db69daf9-928f-4db0-b60c-0d84f7567cca",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1"
      ]
    },
    {
      "itemId": "db69daf9-928f-4db0-b60c-0d84f7567cca",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "503af274-a4ae-429a-8466-f9f4d60d5b3d",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30"
      ]
    },
    {
      "itemId": "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f2be0460-6023-4ae5-82ad-44735a6084a7",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "29f46fd4-b6b2-4703-83a6-385c54afce60",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
        "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f2be0460-6023-4ae5-82ad-44735a6084a7",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "29f46fd4-b6b2-4703-83a6-385c54afce60",
        "4a68dd43-af37-4cce-80a0-6dbdb281800c",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
        "f6fa326e-3dbd-4953-8551-4f8570806e24",
        "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "b0aed06c-ff5b-4e7f-84e6-eeecdd04e73a",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "1e9ee3c1-b682-408f-b10d-0f1fc9e45b30",
        "f2be0460-6023-4ae5-82ad-44735a6084a7",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "29f46fd4-b6b2-4703-83a6-385c54afce60",
        "4a68dd43-af37-4cce-80a0-6dbdb281800c",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
        "f6fa326e-3dbd-4953-8551-4f8570806e24",
        "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f2be0460-6023-4ae5-82ad-44735a6084a7",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "29f46fd4-b6b2-4703-83a6-385c54afce60",
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "fc82c2d1-4825-403e-bb1e-70c621b83a13",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
        "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "3f740c63-f2b4-4fb6-a2d3-7122069465e3",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f2be0460-6023-4ae5-82ad-44735a6084a7",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "0a966521-580f-40ab-9184-70842a0339f0",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "fc82c2d1-4825-403e-bb1e-70c621b83a13",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "3f740c63-f2b4-4fb6-a2d3-7122069465e3",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "0a966521-580f-40ab-9184-70842a0339f0",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "29f46fd4-b6b2-4703-83a6-385c54afce60",
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "44f2a61a-73ff-4b4a-9960-1b512d7bcd22",
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "4a68dd43-af37-4cce-80a0-6dbdb281800c",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "fc82c2d1-4825-403e-bb1e-70c621b83a13",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
        "f6fa326e-3dbd-4953-8551-4f8570806e24",
        "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "3f740c63-f2b4-4fb6-a2d3-7122069465e3",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "0b3e6539-ae6f-43d1-a34f-f43e111a8735",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "1e9ee3c1-b682-408f-b10d-0f1fc9e45b30",
        "f2be0460-6023-4ae5-82ad-44735a6084a7",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "0a966521-580f-40ab-9184-70842a0339f0",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "29f46fd4-b6b2-4703-83a6-385c54afce60",
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "44f2a61a-73ff-4b4a-9960-1b512d7bcd22",
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "4a68dd43-af37-4cce-80a0-6dbdb281800c",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "fc82c2d1-4825-403e-bb1e-70c621b83a13",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
        "f6fa326e-3dbd-4953-8551-4f8570806e24",
        "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
        "8c5b4cce-3af3-4a6c-bd9d-82691f0b895c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "caf6f815-55af-4022-97bb-0d942937b7c9",
        "2bc1ffa5-18f8-4268-89b3-4a0b0a3bbf4d",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "3f740c63-f2b4-4fb6-a2d3-7122069465e3",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "4e4d4e8b-d431-496e-812a-8714e3164d01",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "nao_atende",
      "concorrentes": [
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0"
      ]
    },
    {
      "itemId": "4e4d4e8b-d431-496e-812a-8714e3164d01",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "nao_atende",
      "concorrentes": [
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb"
      ]
    },
    {
      "itemId": "4e4d4e8b-d431-496e-812a-8714e3164d01",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "4a68dd43-af37-4cce-80a0-6dbdb281800c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb"
      ]
    },
    {
      "itemId": "4e4d4e8b-d431-496e-812a-8714e3164d01",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "nao_atende",
      "concorrentes": [
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb"
      ]
    },
    {
      "itemId": "4e4d4e8b-d431-496e-812a-8714e3164d01",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "nao_atende",
      "concorrentes": [
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "4a68dd43-af37-4cce-80a0-6dbdb281800c",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "503af274-a4ae-429a-8466-f9f4d60d5b3d",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb"
      ]
    },
    {
      "itemId": "229a802e-b6f6-4d29-8855-11c9eebf420e",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1"
      ]
    },
    {
      "itemId": "229a802e-b6f6-4d29-8855-11c9eebf420e",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "vendemos",
      "concorrentes": [
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1"
      ]
    },
    {
      "itemId": "229a802e-b6f6-4d29-8855-11c9eebf420e",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "3ae4b0c3-1115-42f9-a694-7e0e8871c48f",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1"
      ]
    },
    {
      "itemId": "229a802e-b6f6-4d29-8855-11c9eebf420e",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1"
      ]
    },
    {
      "itemId": "229a802e-b6f6-4d29-8855-11c9eebf420e",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "3ae4b0c3-1115-42f9-a694-7e0e8871c48f",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1"
      ]
    },
    {
      "itemId": "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30"
      ]
    },
    {
      "itemId": "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "vendemos",
      "concorrentes": [
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb"
      ]
    },
    {
      "itemId": "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "3ae4b0c3-1115-42f9-a694-7e0e8871c48f",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb"
      ]
    },
    {
      "itemId": "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb"
      ]
    },
    {
      "itemId": "733f9ee1-9b4e-4594-9cf0-a0fbd3ba98f5",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "5f904105-d9db-498a-acc2-b6c50faf330f",
        "279a1843-9e35-4f47-b49c-b3fc7a3cb6ed",
        "3ae4b0c3-1115-42f9-a694-7e0e8871c48f",
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb"
      ]
    },
    {
      "itemId": "1bc227f2-0fc9-4bea-b990-7b1eaf1f4110",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": []
    },
    {
      "itemId": "1bc227f2-0fc9-4bea-b990-7b1eaf1f4110",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "vendemos",
      "concorrentes": []
    },
    {
      "itemId": "1bc227f2-0fc9-4bea-b990-7b1eaf1f4110",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": []
    },
    {
      "itemId": "1bc227f2-0fc9-4bea-b990-7b1eaf1f4110",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": []
    },
    {
      "itemId": "1bc227f2-0fc9-4bea-b990-7b1eaf1f4110",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": []
    },
    {
      "itemId": "2186ef5f-0d44-4e3a-b7f6-0654e2188f8c",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": []
    },
    {
      "itemId": "2186ef5f-0d44-4e3a-b7f6-0654e2188f8c",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "nao_atende",
      "concorrentes": []
    },
    {
      "itemId": "2186ef5f-0d44-4e3a-b7f6-0654e2188f8c",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "nao_atende",
      "concorrentes": []
    },
    {
      "itemId": "2186ef5f-0d44-4e3a-b7f6-0654e2188f8c",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "nao_atende",
      "concorrentes": []
    },
    {
      "itemId": "2186ef5f-0d44-4e3a-b7f6-0654e2188f8c",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "nao_atende",
      "concorrentes": []
    },
    {
      "itemId": "350a1f5e-00b0-45cc-b365-9209c091267d",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "29f46fd4-b6b2-4703-83a6-385c54afce60",
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
        "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "d5552bbb-6515-4b0b-9b5e-9c134f5b30a8",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "941a16a1-079c-42c7-ba3d-94320e0b8032"
      ]
    },
    {
      "itemId": "350a1f5e-00b0-45cc-b365-9209c091267d",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "nao_atende",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "d5552bbb-6515-4b0b-9b5e-9c134f5b30a8",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "941a16a1-079c-42c7-ba3d-94320e0b8032"
      ]
    },
    {
      "itemId": "350a1f5e-00b0-45cc-b365-9209c091267d",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "29f46fd4-b6b2-4703-83a6-385c54afce60",
        "3ae4b0c3-1115-42f9-a694-7e0e8871c48f",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
        "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "941a16a1-079c-42c7-ba3d-94320e0b8032"
      ]
    },
    {
      "itemId": "350a1f5e-00b0-45cc-b365-9209c091267d",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "8bdfe260-5525-4a30-b263-0ef3066de0ef",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "941a16a1-079c-42c7-ba3d-94320e0b8032"
      ]
    },
    {
      "itemId": "350a1f5e-00b0-45cc-b365-9209c091267d",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "29f46fd4-b6b2-4703-83a6-385c54afce60",
        "3ae4b0c3-1115-42f9-a694-7e0e8871c48f",
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "157dd923-0aa2-4056-b210-f54df5a9111f",
        "6ab8948b-8ab0-45fc-b076-e2b72d3f8b77",
        "c79c354a-636a-4ec8-a3d8-9a5c75d0574a",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "d5552bbb-6515-4b0b-9b5e-9c134f5b30a8",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "0334a7f5-e304-4cd0-a087-95bd59dd9f30",
        "941a16a1-079c-42c7-ba3d-94320e0b8032"
      ]
    },
    {
      "itemId": "6a7b772e-8b06-438d-8b00-44506a3a9bef",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "6a7b772e-8b06-438d-8b00-44506a3a9bef",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "nao_atende",
      "concorrentes": [
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "6a7b772e-8b06-438d-8b00-44506a3a9bef",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "6a7b772e-8b06-438d-8b00-44506a3a9bef",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "6a7b772e-8b06-438d-8b00-44506a3a9bef",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "db47f505-7d99-4083-98e1-d0fd3a2d950d",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "84e84938-3b5c-4d33-af12-84190673718d",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "2e97c62d-7477-4167-8bf8-92c1dc125209",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "d5552bbb-6515-4b0b-9b5e-9c134f5b30a8",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "3f740c63-f2b4-4fb6-a2d3-7122069465e3",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "84e84938-3b5c-4d33-af12-84190673718d",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "nao_atende",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "2e97c62d-7477-4167-8bf8-92c1dc125209",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "dee3b3e3-2781-4d9e-b798-6150a9857203",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "d5552bbb-6515-4b0b-9b5e-9c134f5b30a8",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "3f740c63-f2b4-4fb6-a2d3-7122069465e3",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "84e84938-3b5c-4d33-af12-84190673718d",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "2e97c62d-7477-4167-8bf8-92c1dc125209",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "4a68dd43-af37-4cce-80a0-6dbdb281800c",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "3f740c63-f2b4-4fb6-a2d3-7122069465e3",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "84e84938-3b5c-4d33-af12-84190673718d",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "84e84938-3b5c-4d33-af12-84190673718d",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "db9cefea-c91f-40f8-b49a-12e3552ddf73",
        "2e97c62d-7477-4167-8bf8-92c1dc125209",
        "f166a484-74fc-489c-8f2c-376f4a04e926",
        "f754e9db-0a1f-4c76-ade5-6ddbf2b36a15",
        "dee3b3e3-2781-4d9e-b798-6150a9857203",
        "98e44789-9beb-4400-aed8-2cc50e47c5e9",
        "a7a56864-85e1-4949-8e05-47b9b2553b9e",
        "4a68dd43-af37-4cce-80a0-6dbdb281800c",
        "9cca60cd-ce9b-4c8e-8160-c4f27867b3f0",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0",
        "d5552bbb-6515-4b0b-9b5e-9c134f5b30a8",
        "503af274-a4ae-429a-8466-f9f4d60d5b3d",
        "4c085f4d-71c8-442e-978b-4766fe8bc9e1",
        "941a16a1-079c-42c7-ba3d-94320e0b8032",
        "3f740c63-f2b4-4fb6-a2d3-7122069465e3",
        "9c8995f9-27eb-4dd2-8cb9-5a8680373bdb",
        "3fcf539a-f676-4911-8832-54eec9e46e69",
        "7c8f6aff-0d06-4c63-9841-aad9cafe7e24"
      ]
    },
    {
      "itemId": "22e4a71a-42b6-40ac-9ce6-42317c81480c",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "22e4a71a-42b6-40ac-9ce6-42317c81480c",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "nao_atende",
      "concorrentes": [
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "22e4a71a-42b6-40ac-9ce6-42317c81480c",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "22e4a71a-42b6-40ac-9ce6-42317c81480c",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": [
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "22e4a71a-42b6-40ac-9ce6-42317c81480c",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "0a021021-4a64-414e-985f-5e5f0dabf615",
        "3fcf539a-f676-4911-8832-54eec9e46e69"
      ]
    },
    {
      "itemId": "edcaab13-7483-47ac-ae0e-a06098c7ab92",
      "segmentoId": "ff812362-678e-4ae8-9054-b910b7a6307f",
      "estado": "vendemos",
      "concorrentes": [
        "2e97c62d-7477-4167-8bf8-92c1dc125209",
        "fc82c2d1-4825-403e-bb1e-70c621b83a13",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0"
      ]
    },
    {
      "itemId": "edcaab13-7483-47ac-ae0e-a06098c7ab92",
      "segmentoId": "dd7136bf-795e-4acf-99f4-cc22cd5eeb9d",
      "estado": "vendemos",
      "concorrentes": [
        "2e97c62d-7477-4167-8bf8-92c1dc125209",
        "fc82c2d1-4825-403e-bb1e-70c621b83a13",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0"
      ]
    },
    {
      "itemId": "edcaab13-7483-47ac-ae0e-a06098c7ab92",
      "segmentoId": "891548c0-8f2e-46f9-92e7-9b456660be8e",
      "estado": "vendemos",
      "concorrentes": [
        "2e97c62d-7477-4167-8bf8-92c1dc125209",
        "fc82c2d1-4825-403e-bb1e-70c621b83a13",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0"
      ]
    },
    {
      "itemId": "edcaab13-7483-47ac-ae0e-a06098c7ab92",
      "segmentoId": "7387b283-bbf3-4fff-8885-22b643d4d458",
      "estado": "vendemos",
      "concorrentes": []
    },
    {
      "itemId": "edcaab13-7483-47ac-ae0e-a06098c7ab92",
      "segmentoId": "f4e01f0c-f4bc-4a16-81f0-1e9a746dbcc0",
      "estado": "vendemos",
      "concorrentes": [
        "2e97c62d-7477-4167-8bf8-92c1dc125209",
        "fc82c2d1-4825-403e-bb1e-70c621b83a13",
        "d9c1b3cf-5005-414a-903e-687fb5376ad0"
      ]
    }
  ],
  "leituraGeral": {
    "resumo": "A leitura considera apenas parte dos dados disponíveis. Com base no que foi analisado, Saúde e Serviços Financeiros são os segmentos com maior cobertura de portfólio e menor presença de concorrentes com diferencial equivalente ao nosso.",
    "prioridade": "alta",
    "motivos": [
      "Saúde é o único segmento com portfólio exclusivo (Tasy, PACS, AMS), que concorrentes como Tivit, Globalweb e CTC não replicam com a mesma profundidade.",
      "Serviços Financeiros absorve quase todo o portfólio ativo, incluindo Soluções Financeiras e APIs com mais de 250 instituições integradas, o que cria barreira de entrada relevante.",
      "Governo tem histórico de mais de 30 anos e portfólio bem encaixado, mas tem restrições em Cloud, AIOps, DBA e Intelligence Hub, o que limita o ticket médio por contrato.",
      "Multimercado e Energia têm portfólio completo, mas os concorrentes nessas frentes são numerosos e com escala maior, o que exige posicionamento mais cuidadoso."
    ],
    "proximosPassos": [
      "Concentrar comunicação de Saúde no diferencial Tasy e PACS, onde poucos concorrentes têm portfólio comparável.",
      "Criar materiais específicos para Serviços Financeiros que evidenciem as 250+ integrações e os sistemas críticos em operação.",
      "Para Governo, mapear quais órgãos já usam serviços básicos e abrir conversa sobre Observabilidade e Field Service, que estão disponíveis no segmento.",
      "Revisar o posicionamento em Multimercado e Energia com foco em diferenciais de capilaridade, como as 350+ localidades de Field Service, frente a concorrentes sem presença física equivalente."
    ],
    "geradoEm": "2026-11-25T19:58:29.641+00:00",
    "parcial": true
  }
} as DadosMercado;
