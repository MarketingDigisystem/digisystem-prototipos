/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/components/estudio/DirecaoCriativaStep.tsx, src/components/estudio/ArteStep.tsx,
 *   src/components/estudio/AgenteMolecula.tsx (o que a IA devolve em cada ponto)
 *   @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * "IA" simulada do Estúdio: textos já escritos a partir do briefing, sem rede.
 * No app real, cada função equivale a uma server function que chama a API
 * Anthropic com as 4 camadas de prompt (Configurações → IA e prompts).
 * Segue a Skill Copywriter: tom de colega, frases por extenso, sem termos
 * banidos, CTA por canal (link no LinkedIn/Facebook, gatilho no Instagram) e
 * hashtags oficiais + 3 a 5 contextuais, até 8.
 */
import { IMAGENS_EXEMPLO, type ImagemExemplo } from "./mock-arte";
import { LIMITES_CONTEUDO, contarPalavras, formatarHashtag, montarHashtags } from "./regras";
import type { Cta, Post, Rede } from "./tipos";

export type BriefingGeracao = {
  /** Tema do post (o "Gancho" do real). */
  gancho: string;
  /** Contexto (o "Detalhamento adicional" do real). */
  detalhamento: string;
  /** Primeiro segmento escolhido (o real grava `segmento` = primeiro de `segmentos[]`). */
  segmento: string;
  segmentos?: string[];
  redes: Rede[];
  /** Texto da tendência ou do pedido (o bloco "Da tendência:"/"Do pedido:"). */
  contexto?: string;
};

type PerfilSegmento = {
  fechamento: string;
  hashtags: string[][];
  subtitulo: string[];
  imagem: string;
  descricaoImagem: string;
  termos: string[];
};

const PERFIS: Record<string, PerfilSegmento> = {
  "Atendimento ao Cliente": {
    fechamento:
      "Na Digisystem, service desk e suporte especializado trabalham com o histórico do cliente à mão, para que ninguém precise contar a mesma história duas vezes.",
    hashtags: [
      ["#Atendimentoaocliente", "#Experiênciadocliente", "#Servicedesk"],
      ["#Omnichannel", "#Customerexperience", "#Suporteespecializado"],
    ],
    subtitulo: ["O contexto acompanha o cliente em todos os canais", "Menos repetição, mais resolução no primeiro contato"],
    imagem: "img-atendimento",
    descricaoImagem: "Atendente com headset diante de duas telas, uma delas mostrando o histórico do cliente, luz natural e tons azuis",
    termos: ["atendimento", "headset", "central de suporte", "cliente satisfeito"],
  },
  Saúde: {
    fechamento:
      "Na Digisystem, o time de Saúde acompanha hospitais e clínicas no dia a dia do Tasy e do PACS, com suporte que conhece a rotina assistencial.",
    hashtags: [
      ["#Saúdedigital", "#Gestãohospitalar", "#Tasy"],
      ["#Healthtech", "#Interoperabilidade", "#Hospitais", "#Prontuárioeletrônico"],
    ],
    subtitulo: ["Tecnologia que entende a rotina do hospital", "Do agendamento ao pós-consulta, sem retrabalho"],
    imagem: "img-saude",
    descricaoImagem: "Médica consultando um tablet no corredor de um hospital, ambiente claro e acolhedor",
    termos: ["hospital", "médica com tablet", "saúde digital", "clínica"],
  },
  "Alocação Especializada": {
    fechamento:
      "Na Digisystem, a Alocação Especializada coloca profissionais qualificados no projeto com agilidade, sem inflar o custo da operação.",
    hashtags: [
      ["#Alocaçãodeti", "#Talentosemti", "#Squads"],
      ["#Outsourcing", "#Profissionaisdeti", "#Projetosdeti"],
    ],
    subtitulo: ["O time certo no projeto, no tempo do negócio", "Especialistas sob demanda, sem inflar a operação"],
    imagem: "img-reuniao",
    descricaoImagem: "Time de tecnologia reunido em volta de uma mesa com notebooks abertos, clima de conversa",
    termos: ["equipe de tecnologia", "reunião de projeto", "squad", "notebooks"],
  },
  Desenvolvimento: {
    fechamento: "Na Digisystem, cada aplicação nasce da rotina de quem vai usar, e não de um modelo pronto.",
    hashtags: [
      ["#Desenvolvimentodesoftware", "#Aplicaçõessobmedida", "#Produtodigital"],
      ["#Ux", "#Softwaresobmedida", "#Timeságeis", "#Engenhariadesoftware"],
    ],
    subtitulo: ["Software feito a partir da rotina de quem usa", "Do problema real à aplicação no ar"],
    imagem: "img-reuniao",
    descricaoImagem: "Pessoas desenvolvedoras revisando código juntas diante de dois monitores, tons azuis",
    termos: ["programação", "desenvolvedores", "código", "produto digital"],
  },
  Infraestrutura: {
    fechamento:
      "Na Digisystem, a Infraestrutura cuida da estabilidade e do suporte contínuo, para o time de TI olhar para frente em vez de apagar incêndio.",
    hashtags: [
      ["#Infraestruturadeti", "#Cloud", "#Monitoramento"],
      ["#Datacenter", "#Disponibilidade", "#Operaçãodeti"],
    ],
    subtitulo: ["Operação estável para o negócio crescer", "Monitoramento contínuo, custos sob controle"],
    imagem: "img-datacenter",
    descricaoImagem: "Corredor de data center com racks iluminados em azul, perspectiva central",
    termos: ["data center", "servidores", "racks", "nuvem"],
  },
  Integração: {
    fechamento: "Na Digisystem, o time de Integração faz sistemas, plataformas e aplicações conversarem de forma fluida e segura.",
    hashtags: [
      ["#Integraçãodesistemas", "#Apis", "#Interoperabilidade"],
      ["#Arquiteturadesoftware", "#Dados", "#Automação"],
    ],
    subtitulo: ["Sistemas que conversam, decisões mais rápidas", "Dados no lugar certo, na hora certa"],
    imagem: "img-graficos",
    descricaoImagem: "Notebook com painel de indicadores em tempo real, gráficos conectados, tons laranja e azul",
    termos: ["painel de indicadores", "integração", "dados em tempo real", "dashboard"],
  },
};

const PERFIL_PADRAO: PerfilSegmento = {
  fechamento: "Na Digisystem, tecnologia é parceria: primeiro entendemos o problema, depois escolhemos a ferramenta.",
  hashtags: [
    ["#Transformaçãodigital", "#Inovação", "#Gestãodeti"],
    ["#Liderançaemti", "#Negócios", "#Estratégia"],
  ],
  subtitulo: ["Como a Digisystem resolve isso na prática", "O que muda na rotina de quem decide"],
  imagem: "img-reuniao",
  descricaoImagem: "Time reunido em volta de uma mesa com notebooks abertos, luz natural",
  termos: ["tecnologia", "reunião", "escritório", "inovação"],
};

const OFICIAIS_DO_POST = ["#Digisystem", "#Parceriaquetransforma", "#Tecnologia"];

const perfil = (segmento: string) => PERFIS[segmento] ?? PERFIL_PADRAO;

/** Hashtags de contexto que a IA simulada sugere para um segmento (Marca → Hashtags usa na prévia). */
export function hashtagsDeContexto(segmento: string): string[] {
  return perfil(segmento).hashtags[0];
}

/** Primeira palavra forte do gancho, em caixa alta, para o gatilho do Instagram. */
function gatilho(gancho: string): string {
  const fracas = new Set(["sinais", "passos", "dicas", "motivos", "formas", "maneiras", "precisa", "quando", "porque", "sobre", "entre", "cinco", "quatro"]);
  const fortes = gancho
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter((p) => p.length >= 5 && !fracas.has(p.toLowerCase()))
    .sort((a, b) => b.length - a.length);
  return (fortes[0] ?? "GUIA").toUpperCase();
}

const semPontoFinal = (t: string) => t.trim().replace(/[.!?]+$/, "");

/** Justificativa da direção criativa (o aviso sky do DirecaoCriativaStep real). */
export function justificativa(b: BriefingGeracao): string {
  const segs = b.segmentos?.length ? b.segmentos : b.segmento ? [b.segmento] : [];
  const publico = segs.length ? juntarPt(segs) : "o público geral da marca";
  const redes = b.redes.length ? `para ${juntarPt(b.redes.map((r) => NOME_REDE[r]))}` : "para as redes da marca";
  return `Post pensado para ${publico}, ${redes}, com tom consultivo e direto: abre pelo problema que o público reconhece e fecha mostrando como a Digisystem atua.`;
}

const NOME_REDE: Record<Rede, string> = { instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook", youtube: "YouTube" };

function juntarPt(partes: string[]): string {
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`;
}

/** Legenda. `versao` alterna entre duas estruturas (o "Regenerar legenda" do agente). */
export function gerarLegenda(b: BriefingGeracao, versao = 0): string {
  const p = perfil(b.segmento);
  const gancho = semPontoFinal(b.gancho) || "Um tema que o seu time conhece bem";
  const meio = semPontoFinal(b.detalhamento || b.contexto || "Quem vive a rotina da operação sabe onde o processo emperra");
  if (versao % 2 === 1) {
    return `Você já parou para contar quantas vezes isso acontece por semana?\n\n${gancho}. ${meio}.\n\nO primeiro passo é olhar para o processo inteiro, e não só para a ferramenta. ${p.fechamento}`;
  }
  return `${gancho}.\n\n${meio}. Parece detalhe, mas é aí que o tempo do time e a paciência do cliente vão embora.\n\n${p.fechamento}`;
}

export function gerarHashtags(b: BriefingGeracao, versao = 0): string[] {
  const p = perfil(b.segmento);
  return montarHashtags(OFICIAIS_DO_POST, p.hashtags[versao % p.hashtags.length]);
}

/**
 * Uma chamada para uma rede (D1: 1 CTA sugerido por rede escolhida).
 * Link direto no LinkedIn e no Facebook, palavra-gatilho no Instagram.
 */
export function gerarCtaDaRede(b: BriefingGeracao, rede: Rede, versao = 0): Cta {
  const v = versao % 2;
  if (rede === "instagram") {
    const g = gatilho(b.gancho);
    return {
      texto: v ? `Comente "${g}" que enviamos o material por mensagem.` : `Comente "${g}" para receber o material completo.`,
      plataformas: ["instagram"],
    };
  }
  if (rede === "facebook") {
    return {
      texto: v ? "Acesse o link do post para conhecer a solução." : "Saiba mais no link do post e fale com o nosso time.",
      plataformas: ["facebook"],
    };
  }
  return {
    texto: v ? "Converse com o nosso time pelo link do post." : "Fale com nossos especialistas pelo link do post.",
    plataformas: [rede],
  };
}

/** "Sugerir CTA": uma chamada por rede escolhida, na ordem do seletor. */
export function gerarCtas(b: BriefingGeracao, versao = 0): Cta[] {
  return b.redes.filter((r) => r !== "youtube").map((r) => gerarCtaDaRede(b, r, versao));
}

/**
 * Fallback "IA indisponível" (linha 20 do inventário, `use-gerar-direcao.ts`):
 * legenda e hashtags montadas no navegador, sem chamada ao modelo. É o único
 * lugar onde o tom de voz da marca entra. Hashtags = tag da tendência +
 * oficiais + palavras do tema, até 8. Título sugerido = o próprio tema.
 * Não sugere CTA (no real o fallback também não sugere).
 */
export function direcaoFallback(
  b: BriefingGeracao,
  marca: { tomVoz: string[]; hashtagsOficiais: string[] },
  tag?: string,
): { legenda: string; hashtags: string[]; tituloSugerido: string; subtituloSugerido: string } {
  const ABERTURA: Record<string, string> = {
    Consultivo: "Vale olhar com calma para um ponto que aparece em muitas operações.",
    Direto: "Vamos direto ao ponto.",
    Inspirador: "Toda mudança grande começa por um passo pequeno.",
    Técnico: "Um detalhe técnico que faz diferença no dia a dia.",
  };
  const abertura = ABERTURA[marca.tomVoz[0] ?? ""] ?? "Um tema que merece a atenção do seu time.";
  const tema = semPontoFinal(b.gancho) || "Um tema que o seu time conhece bem";
  const meio = semPontoFinal(b.detalhamento || b.contexto || "");
  // Objetivo fixo "Engajar" no real: a chamada é para comentar.
  const legenda = `${abertura}\n\n${tema}.${meio ? ` ${meio}.` : ""}\n\nConte nos comentários como isso aparece na rotina do seu time.`;
  const palavras = tema.split(/[^\p{L}\p{N}]+/u).filter((p) => p.length > 3);
  const hashtags = montarHashtags([...(tag ? [tag] : []), ...marca.hashtagsOficiais], palavras);
  return { legenda, hashtags, tituloSugerido: tema, subtituloSugerido: "" };
}

/** Textos da arte: título até 8 palavras, subtítulo até 12 (pode ficar vazio). */
export function gerarTextosArte(b: BriefingGeracao, versao = 0): { titulo: string; subtitulo: string } {
  const p = perfil(b.segmento);
  const palavras = semPontoFinal(b.gancho).split(/\s+/).filter(Boolean);
  return {
    titulo: palavras.slice(0, 8).join(" ") || "Tecnologia que trabalha junto",
    subtitulo: p.subtitulo[versao % p.subtitulo.length],
  };
}

/** Etiqueta acima do título escrita pelo agente: as 4 primeiras palavras do tema, em maiúsculas (como o real). */
export function kickerDoTema(gancho: string): string {
  return semPontoFinal(gancho).split(/\s+/).filter(Boolean).slice(0, 4).join(" ").toUpperCase();
}

/** Carrossel montado pela IA (linha 64, `sugerirCarrossel` no real). */
export type CarrosselSugerido = {
  kicker: string;
  tituloCapa: string;
  subtituloCapa: string;
  slides: { titulo: string; subtitulo: string; cor: "principal" | "destaque" | "apoio"; mostrarAnel: boolean }[];
  cta: { titulo: string; botaoTexto: string };
};

/**
 * "Montar o carrossel com a IA": capa, 3 slides com cor e anel e a chamada
 * final de uma vez. Usa **palavra** para o destaque, que o template-c pinta
 * com a cor de destaque da marca.
 */
export function montarCarrossel(b: BriefingGeracao, versao = 0): CarrosselSugerido {
  const p = perfil(b.segmento);
  const textos = gerarTextosArte(b, versao);
  const segmento = b.segmento || "a sua operação";
  const blocos =
    versao % 2 === 1
      ? [
          { titulo: "Onde o tempo **se perde** hoje", subtitulo: "Retrabalho, filas e informação espalhada em sistemas que não conversam." },
          { titulo: "O que muda **na prática**", subtitulo: `Um processo desenhado para ${segmento.toLowerCase()}, com quem vive a rotina por perto.` },
          { titulo: "Como **medir** o resultado", subtitulo: "Tempo de resposta, chamados reabertos e satisfação, mês a mês." },
        ]
      : [
          { titulo: "O problema que **ninguém vê**", subtitulo: "Ele aparece no fim do mês, quando o retrabalho já virou custo." },
          { titulo: "Por onde **começar**", subtitulo: "Olhe o processo inteiro antes de trocar a ferramenta." },
          { titulo: "Quem faz **junto**", subtitulo: p.subtitulo[1] ?? "A Digisystem acompanha do diagnóstico ao suporte do dia a dia." },
        ];
  const cores: CarrosselSugerido["slides"][number]["cor"][] = ["principal", "destaque", "apoio"];
  return {
    kicker: kickerDoTema(b.gancho),
    tituloCapa: textos.titulo,
    subtituloCapa: textos.subtitulo,
    slides: blocos.map((s, i) => ({ ...s, cor: cores[i], mostrarAnel: true })),
    cta: versao % 2 === 1
      ? { titulo: "Quer ver isso **na sua operação**?", botaoTexto: "Fale com o nosso time" }
      : { titulo: "Vamos conversar sobre **o seu cenário**?", botaoTexto: "Fale com nossos especialistas" },
  };
}

/** "Descrever imagem com a IA". */
export function descreverImagem(b: BriefingGeracao): string {
  return perfil(b.segmento).descricaoImagem;
}

/** "Buscar termos no acervo". */
export function termosAcervo(b: BriefingGeracao): string[] {
  return perfil(b.segmento).termos;
}

/**
 * "Gerar imagem por IA": devolve a imagem de exemplo que mais combina com a
 * descrição (palavras em comum), começando pela do segmento.
 */
export function imagemParaDescricao(descricao: string, segmento: string, tentativa = 0): ImagemExemplo {
  const palavras = descricao.toLowerCase().split(/[^\p{L}]+/u).filter((w) => w.length > 3);
  const pontuadas = IMAGENS_EXEMPLO.map((img) => ({
    img,
    pontos:
      palavras.filter((w) => img.descricao.toLowerCase().includes(w)).length + (img.id === perfil(segmento).imagem ? 2 : 0),
  })).sort((a, b) => b.pontos - a.pontos);
  return pontuadas[tentativa % pontuadas.length].img;
}

/** Busca no acervo de exemplo (Magnific/Freepik no real). */
export function buscarAcervo(termo: string): ImagemExemplo[] {
  const t = termo.trim().toLowerCase();
  if (!t) return IMAGENS_EXEMPLO;
  const palavras = t.split(/\s+/);
  const achadas = IMAGENS_EXEMPLO.filter((img) => palavras.some((w) => img.descricao.toLowerCase().includes(w)));
  return achadas.length ? achadas : IMAGENS_EXEMPLO;
}

// ─── Parecer da aprovação (PainelParecerPost real, com o B-02 corrigido) ──

/** Tipo do ponto, igual ao real: atenção (warning), técnico (sky), ok (success). */
export type TipoPontoParecer = "atencao" | "tecnico" | "ok";

export type PontoParecer = { tipo: TipoPontoParecer; rotulo: string; detalhe: string; sugestao?: string };

export type ParecerPost = {
  nivel: "verde" | "ambar" | "vermelho";
  titulo: string;
  resumo: string;
  /** Pontos de atenção (atenção e técnicos). */
  atencao: PontoParecer[];
  /** O que já está conforme a marca. */
  conformidade: PontoParecer[];
  prontidao: number;
};

export const TERMOS_BANIDOS = ["otimizar", "potencializar", "revolucionar", "garantir", "alavancar", "maximizar", "sinergia", "em resumo"];
/** Palavra inteira com acento (o \b do JS não entende letras acentuadas). */
const palavra = (p: string) => new RegExp(`(^|[^\\p{L}])${p}(?=$|[^\\p{L}])`, "iu");
const FORMAS_CURTAS: [RegExp, string][] = [
  [palavra("pra"), "para"],
  [palavra("tá"), "está"],
  [palavra("pro"), "para o"],
];
const LIMITE_PRIMEIRA_LINHA = 110;

/**
 * Parecer simulado de um post na aprovação. Lê o que vai NA ARTE (título e
 * subtítulo, B-02), a legenda, as hashtags e os CTAs, e confere o Manual de
 * Estilo. As hashtags sugeridas saem com capitalização só na primeira letra
 * (achado da validação 2026-10-06: o real sugeria #TI e #GestãodeTI).
 */
export function parecerDoPost(post: Post, hoje: string): ParecerPost {
  const atencao: PontoParecer[] = [];
  const conformidade: PontoParecer[] = [];

  // Título e subtítulo DA ARTE (B-02).
  const pt = contarPalavras(post.tituloArte);
  if (!post.tituloArte.trim()) {
    atencao.push({ tipo: "atencao", rotulo: "Arte sem título", detalhe: "A arte não tem título escrito.", sugestao: "Escreva um título de até 8 palavras na arte." });
  } else if (pt > LIMITES_CONTEUDO.palavrasTitulo) {
    atencao.push({
      tipo: "atencao",
      rotulo: "Título da arte longo",
      detalhe: `"${post.tituloArte}" tem ${pt} palavras, e o limite da marca é ${LIMITES_CONTEUDO.palavrasTitulo}.`,
      sugestao: `Encurtar para "${post.tituloArte.split(/\s+/).slice(0, LIMITES_CONTEUDO.palavrasTitulo).join(" ")}".`,
    });
  } else {
    conformidade.push({ tipo: "ok", rotulo: "Título da arte", detalhe: `"${post.tituloArte}", ${pt} ${pt === 1 ? "palavra" : "palavras"}, dentro do limite.` });
  }
  const ps = contarPalavras(post.subtituloArte);
  if (ps > LIMITES_CONTEUDO.palavrasSubtitulo) {
    atencao.push({
      tipo: "atencao",
      rotulo: "Subtítulo da arte longo",
      detalhe: `O subtítulo tem ${ps} palavras, e o limite é ${LIMITES_CONTEUDO.palavrasSubtitulo}.`,
      sugestao: "Cortar o subtítulo ou deixá-lo vazio. Ele é opcional.",
    });
  } else if (ps > 0) {
    conformidade.push({ tipo: "ok", rotulo: "Subtítulo da arte", detalhe: `"${post.subtituloArte}", ${ps} palavras.` });
  }

  // Legenda: termos banidos, forma por extenso e primeira linha.
  const legenda = post.legenda.toLowerCase();
  const banidos = TERMOS_BANIDOS.filter((t) => legenda.includes(t));
  if (banidos.length) {
    atencao.push({
      tipo: "atencao",
      rotulo: "Termo fora do Manual de Estilo",
      detalhe: `A legenda usa ${banidos.map((t) => `"${t}"`).join(", ")}, que soa gerado por máquina.`,
      sugestao: "Trocar por um verbo concreto, que diga o que acontece na prática.",
    });
  }
  const curta = FORMAS_CURTAS.find(([re]) => re.test(post.legenda));
  if (curta) {
    atencao.push({
      tipo: "atencao",
      rotulo: "Forma abreviada",
      detalhe: "A legenda usa uma forma abreviada, e a marca escreve por extenso.",
      sugestao: `Escrever "${curta[1]}".`,
    });
  }
  if (!banidos.length && !curta && post.legenda.trim()) {
    conformidade.push({ tipo: "ok", rotulo: "Tom da legenda", detalhe: "Por extenso e sem termos banidos." });
  }
  const primeira = post.legenda.split("\n")[0] ?? "";
  if (primeira.length > LIMITE_PRIMEIRA_LINHA) {
    atencao.push({
      tipo: "tecnico",
      rotulo: "Primeira linha comprida",
      detalhe: `A abertura tem ${primeira.length} caracteres e corta antes do "ver mais".`,
      sugestao: "Fechar a primeira frase antes de 110 caracteres.",
    });
  }

  // Hashtags: oficiais, quantidade e capitalização só na primeira letra.
  const formatadas = post.hashtags.map(formatarHashtag);
  const foraDoPadrao = post.hashtags.filter((h, i) => h !== formatadas[i]);
  if (post.hashtags.length > LIMITES_CONTEUDO.hashtags) {
    atencao.push({
      tipo: "tecnico",
      rotulo: "Hashtags demais",
      detalhe: `São ${post.hashtags.length}; o máximo é ${LIMITES_CONTEUDO.hashtags}.`,
      sugestao: "Manter as oficiais e até 5 contextuais.",
    });
  }
  if (foraDoPadrao.length) {
    atencao.push({
      tipo: "tecnico",
      rotulo: "Capitalização das hashtags",
      detalhe: `${foraDoPadrao.join(" ")} fogem do padrão da marca.`,
      sugestao: `Usar ${foraDoPadrao.map(formatarHashtag).join(" ")}.`,
    });
  }
  if (!post.hashtags.some((h) => formatarHashtag(h) === "#Digisystem")) {
    atencao.push({ tipo: "tecnico", rotulo: "Hashtag oficial", detalhe: "Falta #Digisystem.", sugestao: "Incluir as hashtags oficiais da marca." });
  }
  if (post.hashtags.length && !foraDoPadrao.length && post.hashtags.length <= LIMITES_CONTEUDO.hashtags) {
    conformidade.push({ tipo: "ok", rotulo: "Hashtags", detalhe: `${post.hashtags.length} hashtags, com as oficiais e só a primeira letra maiúscula.` });
  }

  // CTA por canal: link no LinkedIn/Facebook; no Instagram a palavra-gatilho é opcional (régua v2).
  const temCta = (r: Rede) => post.ctas.some((c) => c.plataformas.includes(r));
  for (const r of post.redes) {
    const nome = r === "linkedin" ? "LinkedIn" : r === "facebook" ? "Facebook" : r === "instagram" ? "Instagram" : "YouTube";
    if (temCta(r)) {
      conformidade.push({ tipo: "ok", rotulo: `CTA do ${nome}`, detalhe: post.ctas.find((c) => c.plataformas.includes(r))?.texto ?? "" });
    } else if (r === "instagram") {
      atencao.push({ tipo: "tecnico", rotulo: "Palavra-gatilho no Instagram (opcional)", detalhe: "O post não pede um comentário com palavra-gatilho." });
    } else {
      atencao.push({ tipo: "atencao", rotulo: `CTA do ${nome}`, detalhe: `Não há chamada para o ${nome}.`, sugestao: "Fechar com um link direto, por exemplo para falar com o time." });
    }
  }

  // Data e observação do autor.
  if (!post.dataSugerida) {
    atencao.push({ tipo: "tecnico", rotulo: "Sem data sugerida", detalhe: "O autor não sugeriu data. Quem aprova pode definir ao aprovar." });
  } else if (post.dataSugerida < hoje) {
    atencao.push({ tipo: "tecnico", rotulo: "Data sugerida já passou", detalhe: `A sugestão era ${post.dataSugerida.split("-").reverse().slice(0, 2).join("/")}.`, sugestao: "Escolher uma data nova ao aprovar." });
  }
  if (post.observacao) {
    atencao.push({ tipo: "tecnico", rotulo: "Observação do autor", detalhe: post.observacao });
  }

  const nAtencao = atencao.filter((p) => p.tipo === "atencao").length;
  const nTecnico = atencao.length - nAtencao;
  const prontidao = Math.max(20, Math.min(98, 96 - nAtencao * 18 - nTecnico * 4));
  const nivel = prontidao >= 80 ? "verde" : prontidao >= 55 ? "ambar" : "vermelho";
  const titulo =
    nivel === "verde" ? "Dentro do padrão da marca" : nivel === "ambar" ? `${nAtencao} ${nAtencao === 1 ? "ajuste pequeno" : "ajustes pequenos"} antes de publicar` : "Pede revisão antes de seguir";
  const arte = post.subtituloArte.trim()
    ? `Li o título da arte, "${post.tituloArte}", e o subtítulo, "${post.subtituloArte}".`
    : `Li o título da arte, "${post.tituloArte}". O subtítulo está vazio, o que a marca permite.`;
  const fecho =
    nivel === "verde"
      ? "Legenda, hashtags e chamadas seguem o Manual de Estilo."
      : nivel === "ambar"
        ? "O conteúdo está bom, mas há pontos que valem uma olhada."
        : "Há pontos que mudam a leitura do post e convém ajustar antes.";
  return { nivel, titulo, resumo: `${arte} ${fecho}`, atencao, conformidade, prontidao };
}

// ─── Análise da IA no Enviar (linha 74, `analisarPost` + AnalisePostCard.tsx) ───

/** O que a análise do Estúdio recebe: o mesmo do real (tema, legenda, hashtags, CTAs, tipo de arte) mais as redes (D1). */
export type EntradaAnalise = {
  tema: string;
  legenda: string;
  hashtags: string[];
  ctas: Cta[];
  redes: Rede[];
  modelo: "A" | "B" | "C";
  hashtagsOficiais: string[];
};

/**
 * Formato da resposta do real: resumo, "O que está bom" e "Sugestões". No real
 * cada sugestão é um texto "rótulo — detalhe" que a tela separa; aqui já vem
 * separada, sem o travessão.
 */
export type AnaliseDoPost = { resumo: string; pontosFortes: string[]; sugestoes: { rotulo: string; detalhe: string }[] };

const NOME_MODELO = { A: "estático", B: "estilo blog", C: "carrossel" } as const;

/**
 * Análise simulada do post pronto, para quem vai enviar. Confere o Manual de
 * Estilo (termos banidos, forma por extenso, abertura curta), as hashtags
 * (oficiais, guia de 8, primeira letra maiúscula) e se há uma chamada por
 * rede escolhida. R-EST-2: o CTA é opcional, e a análise avisa quando falta.
 */
export function analisarPost(e: EntradaAnalise): AnaliseDoPost {
  const fortes: string[] = [];
  const sugestoes: AnaliseDoPost["sugestoes"] = [];
  const legenda = e.legenda.trim();
  const baixa = legenda.toLowerCase();

  // Abertura e tema.
  const primeira = legenda.split("\n")[0] ?? "";
  const palavrasTema = semPontoFinal(e.tema)
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((p) => p.length > 4);
  if (primeira.length > LIMITE_PRIMEIRA_LINHA) {
    sugestoes.push({ rotulo: "Abertura comprida", detalhe: `A primeira linha tem ${primeira.length} caracteres e corta antes do "ver mais". Feche a primeira frase antes de 110.` });
  } else if (palavrasTema.some((p) => primeira.toLowerCase().includes(p))) {
    fortes.push("A legenda entra no tema logo na primeira linha, que aparece inteira antes do \"ver mais\".");
  } else {
    fortes.push("A abertura é curta e aparece inteira antes do \"ver mais\".");
  }

  // Manual de Estilo.
  const banidos = TERMOS_BANIDOS.filter((t) => palavra(t).test(baixa));
  if (banidos.length) {
    sugestoes.push({ rotulo: "Termo fora do Manual de Estilo", detalhe: `Troque ${banidos.map((t) => `"${t}"`).join(", ")} por um verbo que diga o que acontece na prática.` });
  }
  const curta = FORMAS_CURTAS.find(([re]) => re.test(legenda));
  if (curta) sugestoes.push({ rotulo: "Forma abreviada", detalhe: `A marca escreve por extenso: use "${curta[1]}".` });
  if (!banidos.length && !curta) fortes.push("Tom de colega explicando a outro, por extenso e sem os termos que soam gerados por máquina.");

  // Hashtags.
  const formatadas = e.hashtags.map(formatarHashtag);
  const foraDoPadrao = e.hashtags.filter((h, i) => h !== formatadas[i]);
  const oficiais = e.hashtagsOficiais.map(formatarHashtag);
  const faltaOficial = !formatadas.includes("#Digisystem") && oficiais.includes("#Digisystem");
  if (e.hashtags.length > LIMITES_CONTEUDO.hashtags) {
    sugestoes.push({ rotulo: "Hashtags acima do guia", detalhe: `São ${e.hashtags.length}; o guia da marca é até ${LIMITES_CONTEUDO.hashtags}. Mantenha as oficiais e tire as menos ligadas ao tema.` });
  }
  if (foraDoPadrao.length) {
    sugestoes.push({ rotulo: "Capitalização das hashtags", detalhe: `Só a primeira letra maiúscula: ${foraDoPadrao.map(formatarHashtag).join(" ")}.` });
  }
  if (faltaOficial) sugestoes.push({ rotulo: "Hashtag oficial", detalhe: "Falta #Digisystem, que vai em todo post da marca." });
  if (e.hashtags.length && e.hashtags.length <= LIMITES_CONTEUDO.hashtags && !foraDoPadrao.length && !faltaOficial) {
    fortes.push(`${e.hashtags.length} hashtags, com as oficiais da marca e as do tema no padrão de capitalização.`);
  }

  // Uma chamada por rede escolhida (D1, D2).
  const semCta = e.redes.filter((r) => !e.ctas.some((c) => c.texto.trim() && c.plataformas.includes(r)));
  for (const r of semCta) {
    sugestoes.push(
      r === "instagram"
        ? { rotulo: "Sem chamada no Instagram", detalhe: "Uma palavra-gatilho para comentar ajuda a medir o interesse e a puxar a conversa." }
        : { rotulo: `Sem chamada no ${NOME_REDE[r]}`, detalhe: "Vale fechar com um link direto, por exemplo para falar com o time." },
    );
  }
  if (e.redes.length && !semCta.length) {
    fortes.push(e.redes.length > 1 ? "Uma chamada para cada rede escolhida, no formato de cada canal." : `Chamada pronta para o ${NOME_REDE[e.redes[0]]}.`);
  }

  const tema = semPontoFinal(e.tema) || "o tema do post";
  const fecho = sugestoes.length
    ? `${sugestoes.length === 1 ? "Há um ponto que vale" : `Há ${sugestoes.length} pontos que valem`} um ajuste antes de enviar, mas nada impede o envio.`
    : "Está dentro do Manual de Estilo e pode seguir para a aprovação.";
  return {
    resumo: `Li a legenda, as hashtags e as chamadas do post ${NOME_MODELO[e.modelo]} sobre "${tema}". ${fecho}`,
    pontosFortes: fortes,
    sugestoes,
  };
}
