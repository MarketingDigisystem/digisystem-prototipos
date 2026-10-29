/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: mhdgst-trabalho src/routes/_authenticated/index.tsx @ 6d98c66^ (constante QUOTES,
 *   9 frases do Dashboard antigo) @ leitura 2026-10-27.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-minha-mesa-viva-2026-10-27.md
 *
 * Frase do dia: lista curada (5 da lista antiga + 59 novas = 64), rotação
 * determinística por dia (mesmo dia = mesma frase para todo mundo). A frase só
 * muda de um dia para o outro: não existe mais "Outra frase". Autoria
 * documentada ou consolidada; frases de autoria contestada ficaram de fora
 * (ver design.md, seção 10.3).
 * Revisão 2026-10-27: saíram "Marca é o que dizem..." (Bezos, sem fonte
 * primária) e "Se não vende, não é criativo" (lema da Benton & Bowles);
 * a furadeira passou a creditar Leo McGinneva, como o próprio Levitt faz.
 * Revisão 2026-10-27 (tarde): cada frase ganhou a `chave`, a palavra que
 * recebe o marca-texto laranja no card novo. Tem que aparecer no texto.
 */

export type Tema = "Marketing" | "Criatividade" | "Marca e design" | "Negócios" | "Liderança" | "Inovação";
export type Frase = { id: string; texto: string; autor: string; fonte?: string; tema: Tema; chave: string };

type Bruta = [texto: string, autor: string, tema: Tema, chave: string, fonte?: string];

const BRUTAS: Bruta[] = [
  // Mantidas da lista antiga (QUOTES)
  ["As pessoas não compram o que você faz, elas compram o porquê de você fazer.", "Simon Sinek", "Marketing", "porquê", "Palestra TED, 2009"],
  ["O marketing não é mais sobre as coisas que você faz, mas sobre as histórias que você conta.", "Seth Godin", "Marketing", "histórias"],
  ["Design não é só como parece. Design é como funciona.", "Steve Jobs", "Marca e design", "funciona", "The New York Times Magazine, 2003"],
  ["Conteúdo é fogo, redes sociais são gasolina.", "Jay Baer", "Marketing", "gasolina"],
  ["A melhor propaganda é feita por clientes satisfeitos.", "Philip Kotler", "Marketing", "satisfeitos"],
  // Novas
  ["O objetivo do marketing é conhecer e entender o cliente tão bem que o produto ou serviço se encaixe nele e se venda sozinho.", "Peter Drucker", "Marketing", "entender", "Management: Tasks, Responsibilities, Practices, 1973"],
  ["O propósito de um negócio é criar um cliente.", "Peter Drucker", "Negócios", "cliente", "The Practice of Management, 1954"],
  ["As pessoas não querem comprar uma furadeira. Elas querem o furo.", "Leo McGinneva, citado por Theodore Levitt", "Marketing", "furo", "The Marketing Imagination, 1983"],
  ["Os mercados mudam mais rápido que o marketing.", "Philip Kotler", "Marketing", "rápido"],
  ["Marketing não é a arte de achar jeitos espertos de se livrar do que você produz. É a arte de criar valor de verdade para o cliente.", "Philip Kotler", "Marketing", "valor"],
  ["Não procure clientes para os seus produtos. Procure produtos para os seus clientes.", "Seth Godin", "Marketing", "clientes"],
  ["Num mercado lotado, se misturar é fracassar.", "Seth Godin", "Marketing", "misturar", "A Vaca Roxa, 2003"],
  ["As pessoas não compram produtos e serviços. Compram relações, histórias e magia.", "Seth Godin", "Marketing", "magia"],
  ["Em média, cinco vezes mais pessoas leem o título do que o texto.", "David Ogilvy", "Marketing", "título", "Confissões de um Publicitário, 1963"],
  ["Nunca escreva um anúncio que você não gostaria que a sua família lesse.", "David Ogilvy", "Marketing", "família", "Confissões de um Publicitário, 1963"],
  ["Regras são o que o artista quebra; o memorável nunca saiu de uma fórmula.", "Bill Bernbach", "Criatividade", "memorável"],
  ["A verdade não é verdade até que as pessoas acreditem em você.", "Bill Bernbach", "Marketing", "acreditem"],
  ["Faça simples. Faça memorável. Faça convidativo de olhar. Faça divertido de ler.", "Leo Burnett", "Criatividade", "simples"],
  ["Quando você mira as estrelas, pode não alcançar nenhuma, mas também não volta com a mão cheia de lama.", "Leo Burnett", "Criatividade", "estrelas"],
  ["As pessoas leem o que interessa a elas. Às vezes, é um anúncio.", "Howard Gossage", "Marketing", "interessa"],
  ["Tudo o que uma empresa faz é propaganda.", "Lee Clow", "Marca e design", "propaganda"],
  ["O melhor marketing não parece marketing.", "Tom Fishburne", "Marketing", "parece"],
  ["Faça do cliente o herói da sua história.", "Ann Handley", "Marketing", "herói"],
  ["Boa escrita serve a quem lê, não a quem escreve.", "Ann Handley", "Criatividade", "serve", "Everybody Writes, 2014"],
  ["Conteúdo é rei, mas o contexto é Deus.", "Gary Vaynerchuk", "Marketing", "contexto"],
  ["O oposto de uma boa ideia pode ser outra boa ideia.", "Rory Sutherland", "Criatividade", "oposto", "Alchemy, 2019"],
  ["Produtos são feitos na fábrica, mas marcas são criadas na mente.", "Walter Landor", "Marca e design", "mente"],
  ["Uma marca não é mais o que dizemos ao consumidor que ela é. É o que os consumidores dizem uns aos outros que ela é.", "Scott Cook", "Marca e design", "consumidores"],
  ["Uma marca é a sensação intuitiva que uma pessoa tem de um produto, serviço ou empresa.", "Marty Neumeier", "Marca e design", "sensação", "The Brand Gap, 2003"],
  ["Leva 20 anos para construir uma reputação e cinco minutos para arruiná-la.", "Warren Buffett", "Negócios", "reputação"],
  ["Design é o embaixador silencioso da sua marca.", "Paul Rand", "Marca e design", "embaixador"],
  ["Tudo é design. Tudo!", "Paul Rand", "Marca e design", "design"],
  ["Bom design é o mínimo de design possível.", "Dieter Rams", "Marca e design", "mínimo"],
  ["Os detalhes não são detalhes. Eles fazem o design.", "Charles Eames", "Marca e design", "fazem"],
  ["Há três respostas para um trabalho: sim, não e uau. Uau é a que vale buscar.", "Milton Glaser", "Criatividade", "uau"],
  ["A perfeição é alcançada não quando não há mais nada a acrescentar, mas quando não há mais nada a retirar.", "Antoine de Saint-Exupéry", "Marca e design", "retirar", "Terra dos Homens, 1939"],
  ["Criatividade é só conectar coisas.", "Steve Jobs", "Criatividade", "conectar", "Revista Wired, 1996"],
  ["Criatividade é um hábito, e a melhor criatividade vem de bons hábitos de trabalho.", "Twyla Tharp", "Criatividade", "hábito", "The Creative Habit, 2003"],
  ["A criatividade não se esgota. Quanto mais você usa, mais você tem.", "Maya Angelou", "Criatividade", "esgota"],
  ["Se você não está preparado para errar, nunca vai criar nada original.", "Ken Robinson", "Criatividade", "errar", "Palestra TED, 2006"],
  ["Criatividade é o fim súbito da estupidez.", "Edwin Land", "Criatividade", "súbito"],
  ["A melhor maneira de ter uma boa ideia é ter muitas ideias.", "Linus Pauling", "Criatividade", "muitas"],
  ["Uma ideia nada mais é do que uma combinação nova de elementos velhos.", "James Webb Young", "Criatividade", "combinação", "A Technique for Producing Ideas, 1940"],
  ["Nada é completamente original. Todo trabalho criativo se constrói sobre o que veio antes.", "Austin Kleon", "Criatividade", "original", "Roube como um Artista, 2012"],
  ["Dê uma boa ideia a uma equipe medíocre e ela vai estragá-la. Dê uma ideia medíocre a uma ótima equipe e ela vai consertá-la ou trocá-la por algo melhor.", "Ed Catmull", "Liderança", "ótima", "Criatividade S.A., 2014"],
  ["A vulnerabilidade é o berço da inovação, da criatividade e da mudança.", "Brené Brown", "Liderança", "berço", "Palestra TED, 2012"],
  ["A melhor maneira de prever o futuro é inventá-lo.", "Alan Kay", "Inovação", "inventá-lo", "1971"],
  ["A inovação é o instrumento específico do empreendedor.", "Peter Drucker", "Inovação", "instrumento", "Inovação e Espírito Empreendedor, 1985"],
  ["Muitas vezes, as pessoas não sabem o que querem até você mostrar a elas.", "Steve Jobs", "Inovação", "mostrar", "BusinessWeek, 1998"],
  ["Foco é dizer não.", "Steve Jobs", "Negócios", "não", "WWDC, 1997"],
  ["Se você não tem vergonha da primeira versão do seu produto, lançou tarde demais.", "Reid Hoffman", "Inovação", "vergonha"],
  ["A frase mais perigosa da língua é: sempre fizemos assim.", "Grace Hopper", "Inovação", "sempre"],
  ["Nosso setor não respeita a tradição. Só respeita a inovação.", "Satya Nadella", "Inovação", "inovação", "Carta aos funcionários da Microsoft, 2014"],
  ["O futuro já chegou. Só não está distribuído de forma igual.", "William Gibson", "Inovação", "distribuído"],
  ["Qualquer tecnologia suficientemente avançada é indistinguível da magia.", "Arthur C. Clarke", "Inovação", "magia", "Perfis do Futuro, 1973"],
  ["O software está engolindo o mundo.", "Marc Andreessen", "Inovação", "engolindo", "The Wall Street Journal, 2011"],
  ["Só os paranoicos sobrevivem.", "Andy Grove", "Negócios", "paranoicos", "Título do livro, 1996"],
  ["Não há nada tão inútil quanto fazer com grande eficiência algo que não deveria ser feito.", "Peter Drucker", "Negócios", "inútil", "Harvard Business Review, 1963"],
  ["Gestores fazem as coisas do jeito certo; líderes fazem a coisa certa.", "Warren Bennis", "Liderança", "certa", "Leaders, 1985"],
  ["O bom é inimigo do ótimo.", "Jim Collins", "Negócios", "inimigo", "Empresas Feitas para Vencer, 2001"],
  ["O principal é manter o principal como o principal.", "Stephen Covey", "Liderança", "manter", "First Things First, 1994"],
  ["Somos teimosos na visão e flexíveis nos detalhes.", "Jeff Bezos", "Liderança", "teimosos"],
  ["Seus clientes mais insatisfeitos são sua maior fonte de aprendizado.", "Bill Gates", "Negócios", "aprendizado", "A Empresa na Velocidade do Pensamento, 1999"],
  ["Sozinhos, fazemos tão pouco; juntos, fazemos muito.", "Helen Keller", "Liderança", "juntos"],
];

export const FRASES: Frase[] = BRUTAS.map(([texto, autor, tema, chave, fonte], i) => ({
  id: `f${String(i + 1).padStart(2, "0")}`,
  texto,
  autor,
  tema,
  chave,
  ...(fonte ? { fonte } : {}),
}));

/** PRNG pequeno e determinístico (mesma semente = mesma sequência). */
function mulberry32(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Permutação fixa dos índices (Fisher-Yates), para dias seguidos alternarem temas. */
export const ORDEM: number[] = (() => {
  const r = mulberry32(20261027);
  const o = FRASES.map((_, i) => i);
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
})();

/** Dias desde 1970-01-01 de um YYYY-MM-DD, sem fuso. */
export function diasDesdeEpoch(dia: string): number {
  const [a, m, d] = dia.split("-").map(Number);
  return Math.floor(Date.UTC(a, m - 1, d) / 86_400_000);
}

export function fraseDoDia(dia: string, deslocamento = 0): Frase {
  const n = FRASES.length;
  const i = (((diasDesdeEpoch(dia) + deslocamento) % n) + n) % n;
  return FRASES[ORDEM[i]];
}

/** Uma palavra da frase; `marca` é o trecho com marca-texto (a chave). */
export type Palavra = { antes: string; marca: string; depois: string };

/**
 * Quebra a frase em palavras para a entrada palavra a palavra. A primeira
 * ocorrência da chave (sem diferenciar maiúscula) vira o trecho `marca`; as
 * aspas tipográficas entram na primeira e na última palavra.
 */
export function palavrasDaFrase(f: Pick<Frase, "texto" | "chave">): Palavra[] {
  const texto = `“${f.texto}”`;
  const ini = f.chave ? texto.toLocaleLowerCase("pt-BR").indexOf(f.chave.toLocaleLowerCase("pt-BR")) : -1;
  const fim = ini < 0 ? -1 : ini + f.chave.length;
  const palavras: Palavra[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const a = m.index;
    const b = a + m[0].length;
    if (ini >= 0 && a < fim && b > ini) {
      const de = Math.max(ini, a) - a;
      const ate = Math.min(fim, b) - a;
      palavras.push({ antes: m[0].slice(0, de), marca: m[0].slice(de, ate), depois: m[0].slice(ate) });
    } else {
      palavras.push({ antes: m[0], marca: "", depois: "" });
    }
  }
  return palavras;
}
