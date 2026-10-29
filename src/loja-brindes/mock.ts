// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Catálogo de 14 produtos: todos com foto real em public/brindes/ servida como /brindes/<arquivo>.
// v4 (DigiPlace): item com saldo sai na hora (pronta entrega); item esgotado fica indisponível
// como pronta entrega, mas MAY ser pedido por encomenda se tiver a flag. Alguns itens são pronta
// entrega E aceitam encomenda (ex.: Caderno); a Camiseta é encomenda-only (sem estoque próprio).
// Se um arquivo de foto faltar, o FotoProduto cai no placeholder de marca sem quebrar.

import type {
  CategoriaId, CentroCusto, CentroCustoId, CorProduto, Foto, ItemCarrinho, Movimentacao, Pedido, Produto, Sugestao, Usuario,
} from "./tipos";

export const LOCAL_RETIRADA = "Sede São Paulo, recepção do marketing (3º andar)";
export const DIRETOR_LOGADO = "u-ana";
export const EQUIPE_LOGADA = "u-felipe";

/** Cores de produto permitidas: as da marca + neutros. Nenhuma cor nova de interface. */
export const CORES: Record<string, CorProduto> = {
  azul: { nome: "Azul Reflex", hex: "#36499b" },
  laranja: { nome: "Laranja", hex: "#ff6d2d" },
  apoio: { nome: "Azul apoio", hex: "#67cfee" },
  grafite: { nome: "Grafite", hex: "#2b2f3a" },
  preto: { nome: "Preto", hex: "#111318" },
  branco: { nome: "Branco", hex: "#ffffff" },
  prata: { nome: "Prata", hex: "#c4c8d0" },
  cru: { nome: "Algodão cru", hex: "#efe6d2" },
};

export const CATEGORIAS: { id: CategoriaId; nome: string }[] = [
  { id: "escritorio", nome: "Escritório" },
  { id: "bebidas", nome: "Bebidas" },
  { id: "vestuario", nome: "Vestuário" },
  { id: "tecnologia", nome: "Tecnologia" },
  { id: "sustentaveis", nome: "Sustentáveis" },
];

export const nomeCategoria = (id: CategoriaId) => CATEGORIAS.find((c) => c.id === id)?.nome ?? id;

export const CENTROS_CUSTO: CentroCusto[] = [
  { id: "MKT-DIR", area: "Marketing", diretorId: "u-ana" },
  { id: "COM-DIR", area: "Comercial", diretorId: "u-rafael" },
  { id: "RH-DIR", area: "Pessoas", diretorId: "u-juliana" },
  { id: "TI-DIR", area: "Tecnologia", diretorId: "u-carlos" },
  { id: "FIN-DIR", area: "Financeiro", diretorId: "u-beatriz" },
];

export const areaDoCentro = (id: CentroCustoId) => CENTROS_CUSTO.find((c) => c.id === id)?.area ?? id;

export const USUARIOS: Usuario[] = [
  { id: "u-ana", nome: "Ana Souza", papel: "diretor", centroCustoId: "MKT-DIR", iniciais: "AS" },
  { id: "u-rafael", nome: "Rafael Mendes", papel: "diretor", centroCustoId: "COM-DIR", iniciais: "RM" },
  { id: "u-juliana", nome: "Juliana Alves", papel: "diretor", centroCustoId: "RH-DIR", iniciais: "JA" },
  { id: "u-carlos", nome: "Carlos Tavares", papel: "diretor", centroCustoId: "TI-DIR", iniciais: "CT" },
  { id: "u-beatriz", nome: "Beatriz Nogueira", papel: "diretor", centroCustoId: "FIN-DIR", iniciais: "BN" },
  { id: "u-felipe", nome: "Felipe Puertas", papel: "implementacao", iniciais: "FP" },
  { id: "u-fernando", nome: "Fernando Alvarez", papel: "aprovador", iniciais: "FA" },
  { id: "u-ariadne", nome: "Ariadne Lima", papel: "designer", iniciais: "AL" },
];

export const usuario = (id: string) => USUARIOS.find((u) => u.id === id) ?? USUARIOS[0];

const g = (angulo: Foto["angulo"], fundo: Foto["fundo"], legenda: string, src?: string, pdf?: string): Foto => ({ angulo, fundo, legenda, src, pdf });

export const PRODUTOS_INICIAIS: Produto[] = [
  // ---------------- DISPONÍVEIS (saem na hora, foto real) ----------------
  {
    id: "p01", slug: "caderno-digisystem", nome: "Caderno Digisystem", categoria: "escritorio", icone: "caderno",
    galeria: [
      g("frente", "neutro", "Caderno de capa dura com a marca Digisystem", "/brindes/caderno.png"),
      g("detalhe", "sky-orange", "Hot stamping da marca na capa", "/brindes/caderno.png"),
      g("uso", "neutro", "Miolo pautado com 96 folhas", "/brindes/caderno.png"),
    ],
    descricaoCurta: "O caderno de capa dura que entra em todo kit de evento.",
    descricaoLonga: [
      "Miolo pautado de 90 g, elástico e marcador de página. É a peça que segura o kit de feira e que o cliente leva para a reunião seguinte.",
      "Com hot stamping, a marca fica em baixo-relevo na capa, sem tinta. Este é um dos itens que o diretor retira na hora, porque há saldo na prateleira.",
    ],
    especificacoes: [
      { rotulo: "Formato", valor: "A5 (14,8 × 21 cm)" },
      { rotulo: "Miolo", valor: "96 folhas pautadas, papel 90 g" },
      { rotulo: "Capa", valor: "Dura, acabamento soft touch" },
      { rotulo: "Extras", valor: "Elástico, marcador e bolso interno" },
    ],
    custoUnitario: 27,
    variacoes: [
      { id: "azul", rotulo: "Azul Reflex", cor: CORES.azul, saldo: 60, minimo: 20 },
      { id: "laranja", rotulo: "Laranja", cor: CORES.laranja, saldo: 24, minimo: 10 },
    ],
    personalizacao: { tecnica: "Hot stamping na capa", area: "6 × 6 cm", qtdMinima: 20, prazoExtraDiasUteis: 7, aceita: ["logo", "nome"] },
    selos: ["mais-pedido"], cadastradoEm: "2026-02-20", ativo: true,
    // Pronta entrega E aceita encomenda: dá para pedir volume maior sob demanda.
    aceitaEncomenda: true, encomendaMinima: 20,
    usos: [{ evento: "Workshop com o Banco Horizonte", centroCustoId: "COM-DIR", qtd: 15, em: "2026-10-12" }],
  },
  {
    id: "p02", slug: "caneta-metalica", nome: "Caneta metálica", categoria: "escritorio", icone: "caneta",
    galeria: [
      g("frente", "neutro", "Caneta de corpo metálico com a marca", "/brindes/caneta.png"),
      g("detalhe", "navy-sky", "Gravação a laser no corpo", "/brindes/caneta.png"),
    ],
    descricaoCurta: "Caneta de tinta azul que vai bem em visita a cliente.",
    descricaoLonga: [
      "Corpo de metal com toque macio e carga que dura cerca de 1.500 m de escrita. Vem em estojo, então já dá para entregar como presente.",
      "Tem bastante saldo: o pedido sai na hora para retirada.",
    ],
    especificacoes: [
      { rotulo: "Material", valor: "Alumínio com acabamento emborrachado" },
      { rotulo: "Tinta", valor: "Azul, ponta 1,0 mm" },
      { rotulo: "Embalagem", valor: "Estojo de papel rígido" },
    ],
    custoUnitario: 9.5,
    variacoes: [{ id: "unico", rotulo: "Único", saldo: 300, minimo: 50 }],
    personalizacao: { tecnica: "Gravação a laser no corpo", area: "4 × 0,6 cm", qtdMinima: 50, prazoExtraDiasUteis: 3, aceita: ["nome", "texto"] },
    selos: ["mais-pedido"], cadastradoEm: "2025-11-04", ativo: true,
    usos: [
      { evento: "Rodada de visitas no Rio", centroCustoId: "COM-DIR", qtd: 40, em: "2026-10-08" },
      { evento: "Treinamento de líderes", centroCustoId: "RH-DIR", qtd: 25, em: "2026-10-16" },
    ],
  },
  {
    id: "p03", slug: "caderno-com-caneta", nome: "Caderno com caneta", categoria: "escritorio", icone: "caderno",
    galeria: [
      g("frente", "neutro", "Caderno 'Digisystem 35 anos' de capa dura com a caneta azul da marca", "/brindes/caderno-caneta.png"),
      g("uso", "neutro", "Bloco espiral Digisystem com a caneta, pronto para a reunião", "/brindes/caderno-caneta-2.png"),
    ],
    descricaoCurta: "O caderno e a caneta da marca, entregues como um presente só.",
    descricaoLonga: [
      "O par mais pedido para reunião com cliente: o caderno de capa dura com a caneta metálica presa na lombada, numa cinta de papel.",
      "Tem saldo para retirar na hora. A personalização vale para os dois: marca na capa e nome gravado na caneta.",
    ],
    especificacoes: [
      { rotulo: "Conteúdo", valor: "1 caderno A5 + 1 caneta metálica" },
      { rotulo: "Caderno", valor: "96 folhas pautadas, capa dura" },
      { rotulo: "Caneta", valor: "Metálica, tinta azul 1,0 mm" },
      { rotulo: "Embalagem", valor: "Cinta de papel kraft" },
    ],
    custoUnitario: 34,
    variacoes: [{ id: "azul", rotulo: "Azul Reflex", cor: CORES.azul, saldo: 38, minimo: 12 }],
    personalizacao: { tecnica: "Hot stamping no caderno + gravação na caneta", area: "6 × 6 cm (capa)", qtdMinima: 20, prazoExtraDiasUteis: 7, aceita: ["logo", "nome"] },
    selos: ["mais-pedido"], cadastradoEm: "2026-03-01", ativo: true,
    usos: [{ evento: "Encontro de parceiros Sul", centroCustoId: "MKT-DIR", qtd: 10, em: "2026-10-19" }],
  },
  {
    id: "p04", slug: "moleskine", nome: "Moleskine clássico", categoria: "escritorio", icone: "caderno",
    galeria: [
      g("frente", "neutro", "Moleskine preto com elástico", "/brindes/moleskine.png"),
      g("detalhe", "navy-sky", "Capa com gravação discreta da marca", "/brindes/moleskine.png"),
      g("uso", "neutro", "Bolso interno na contracapa", "/brindes/moleskine.png"),
    ],
    descricaoCurta: "O caderno clássico para presente de peso.",
    descricaoLonga: [
      "Capa dura clássica, papel marfim e elástico. É o brinde que sai para cliente estratégico e para reconhecimento de equipe.",
      "Tem saldo para retirada imediata. A gravação da marca fica discreta no canto da capa.",
    ],
    especificacoes: [
      { rotulo: "Formato", valor: "Grande (13 × 21 cm)" },
      { rotulo: "Miolo", valor: "240 páginas, papel marfim 70 g" },
      { rotulo: "Capa", valor: "Dura, com elástico e fita marcadora" },
    ],
    custoUnitario: 58,
    variacoes: [
      { id: "preto", rotulo: "Preto", cor: CORES.preto, saldo: 22, minimo: 8 },
      { id: "azul", rotulo: "Azul Reflex", cor: CORES.azul, saldo: 14, minimo: 8 },
    ],
    personalizacao: { tecnica: "Gravação a laser na capa", area: "4 × 4 cm", qtdMinima: 10, prazoExtraDiasUteis: 5, aceita: ["logo", "nome"] },
    selos: ["novidade"], cadastradoEm: "2026-10-18", ativo: true, usos: [],
  },
  {
    id: "p05", slug: "folder-institucional", nome: "Folder institucional", categoria: "escritorio", icone: "folder",
    galeria: [
      g("frente", "neutro", "Arte real do folder institucional da Digisystem", "/brindes/folder.png", "/brindes/folder-digisystem.pdf"),
      g("detalhe", "sky-orange", "Três dobras com os serviços da empresa", "/brindes/folder.png"),
    ],
    descricaoCurta: "O material impresso que apresenta a Digisystem em uma folha.",
    descricaoLonga: [
      "Folder de três dobras com a apresentação institucional: quem somos, o que fazemos e como falar com a empresa. É o impresso que acompanha o kit no estande.",
      "Tem bastante saldo e sai na hora. O conteúdo é padrão da marca, sem personalização por pedido.",
    ],
    especificacoes: [
      { rotulo: "Formato", valor: "A4 com três dobras" },
      { rotulo: "Papel", valor: "Couché fosco 170 g" },
      { rotulo: "Acabamento", valor: "Verniz localizado na capa" },
    ],
    custoUnitario: 3.2,
    variacoes: [{ id: "unico", rotulo: "Único", saldo: 420, minimo: 80 }],
    selos: [], cadastradoEm: "2026-05-02", ativo: true,
    usos: [{ evento: "Expo Indústria 4.0", centroCustoId: "COM-DIR", qtd: 60, em: "2026-10-02" }],
  },

  // ---------------- ESGOTADOS com foto real (pronta entrega indisponível; alguns aceitam encomenda) ----------------
  {
    id: "p06", slug: "garrafa-termica", nome: "Garrafa térmica 500 ml", categoria: "bebidas", icone: "garrafa",
    galeria: [
      g("frente", "neutro", "Garrafa de aço inox com tampa de rosca", "/brindes/garrafa.png"),
      g("detalhe", "sky-orange", "Gravação a laser na lateral", "/brindes/garrafa.png"),
    ],
    descricaoCurta: "Mantém a bebida gelada por até 12 horas.",
    descricaoLonga: [
      "Parede dupla de aço inox, sem gosto de metal e sem suor por fora. É o brinde que mais volta para a mesa de quem recebeu.",
      "Está sem estoque para pronta entrega. Dá para pedir por encomenda: a produção é feita sob demanda, a partir da quantidade mínima.",
    ],
    especificacoes: [
      { rotulo: "Material", valor: "Aço inox 304 com parede dupla" },
      { rotulo: "Capacidade", valor: "500 ml" },
      { rotulo: "Conservação", valor: "12 h gelado, 6 h quente" },
      { rotulo: "Cuidados", valor: "Lavar à mão; não vai ao micro-ondas" },
    ],
    custoUnitario: 42,
    variacoes: [
      { id: "azul", rotulo: "Azul Reflex", cor: CORES.azul, saldo: 0, minimo: 10 },
      { id: "preta", rotulo: "Preta", cor: CORES.preto, saldo: 0, minimo: 10 },
    ],
    personalizacao: { tecnica: "Gravação a laser na lateral", area: "4 × 6 cm", qtdMinima: 10, prazoExtraDiasUteis: 5, aceita: ["logo", "nome"] },
    selos: ["mais-pedido"], cadastradoEm: "2026-03-10", ativo: true,
    aceitaEncomenda: true, encomendaMinima: 10,
    usos: [
      { evento: "Feira Agro Digital", centroCustoId: "COM-DIR", qtd: 12, em: "2026-10-04" },
      { evento: "Café com clientes do setor público", centroCustoId: "MKT-DIR", qtd: 8, em: "2026-10-15" },
    ],
  },
  {
    id: "p07", slug: "caneca-ceramica", nome: "Caneca de cerâmica 330 ml", categoria: "bebidas", icone: "caneca",
    galeria: [
      g("frente", "neutro", "Caneca branca com alça larga", "/brindes/caneca.png"),
      g("detalhe", "navy-sky", "Impressão que dá a volta inteira", "/brindes/caneca.png"),
    ],
    descricaoCurta: "A caneca da mesa de trabalho, com impressão que dá a volta toda.",
    descricaoLonga: [
      "Cerâmica grossa, que segura o calor do café e aguenta lava-louças. A impressão sublimada pega a peça inteira.",
      "Está sem estoque para pronta entrega e ainda não entrou na lista de encomenda.",
    ],
    especificacoes: [
      { rotulo: "Material", valor: "Cerâmica esmaltada" },
      { rotulo: "Capacidade", valor: "330 ml" },
      { rotulo: "Cuidados", valor: "Pode ir ao lava-louças e ao micro-ondas" },
    ],
    custoUnitario: 19.9,
    variacoes: [
      { id: "branca", rotulo: "Branca", cor: CORES.branco, saldo: 0, minimo: 30 },
      { id: "azul", rotulo: "Azul Reflex", cor: CORES.azul, saldo: 0, minimo: 15 },
    ],
    personalizacao: { tecnica: "Impressão colorida por sublimação", area: "20 × 8 cm", qtdMinima: 12, prazoExtraDiasUteis: 4, aceita: ["logo", "texto"] },
    selos: [], cadastradoEm: "2026-02-02", ativo: true, usos: [],
  },
  {
    id: "p08", slug: "ecobag-algodao", nome: "Ecobag de algodão cru", categoria: "sustentaveis", icone: "ecobag",
    galeria: [
      g("frente", "neutro", "Ecobag de algodão cru com alça longa", "/brindes/ecobag.png"),
      g("detalhe", "navy-sky", "Serigrafia de uma cor", "/brindes/ecobag.png"),
    ],
    descricaoCurta: "Sacola de algodão cru, reutilizável, com serigrafia.",
    descricaoLonga: [
      "Algodão cru de 140 g, sem tingimento. Aguenta peso e dura anos, o que faz dela o brinde sustentável mais usado em feira.",
      "Está sem estoque para pronta entrega. Dá para pedir por encomenda, com produção sob demanda.",
    ],
    especificacoes: [
      { rotulo: "Material", valor: "Algodão cru 140 g/m²" },
      { rotulo: "Dimensões", valor: "38 × 42 cm, alça de 60 cm" },
      { rotulo: "Cuidados", valor: "Lavar à mão em água fria" },
    ],
    custoUnitario: 16,
    variacoes: [{ id: "cru", rotulo: "Algodão cru", cor: CORES.cru, saldo: 0, minimo: 20 }],
    personalizacao: { tecnica: "Serigrafia de uma cor", area: "25 × 25 cm", qtdMinima: 30, prazoExtraDiasUteis: 6, aceita: ["logo"] },
    selos: [], cadastradoEm: "2026-04-22", ativo: true,
    aceitaEncomenda: true, encomendaMinima: 20, usos: [],
  },
  {
    id: "p09", slug: "mochila-executiva", nome: "Mochila executiva 15\"", categoria: "escritorio", icone: "mochila",
    galeria: [
      g("frente", "neutro", "Mochila com compartimento acolchoado", "/brindes/mochila.png"),
      g("detalhe", "sky-orange", "Bolso antifurto nas costas", "/brindes/mochila.png"),
    ],
    descricaoCurta: "Mochila para notebook, para cliente de contrato longo.",
    descricaoLonga: [
      "Tecido resistente à água, alça de trolley e bolso antifurto nas costas. É um dos brindes de maior custo, então costuma sair para diretoria de cliente.",
      "Está sem estoque para pronta entrega. Dá para pedir por encomenda, com alinhamento de prazo e volume.",
    ],
    especificacoes: [
      { rotulo: "Material", valor: "Poliéster 600D resistente à água" },
      { rotulo: "Capacidade", valor: "22 litros, notebook até 15,6\"" },
      { rotulo: "Dimensões", valor: "30 × 44 × 14 cm" },
    ],
    custoUnitario: 189,
    variacoes: [
      { id: "grafite", rotulo: "Grafite", cor: CORES.grafite, saldo: 0, minimo: 6 },
      { id: "preta", rotulo: "Preta", cor: CORES.preto, saldo: 0, minimo: 6 },
    ],
    selos: [], cadastradoEm: "2026-06-01", ativo: true,
    aceitaEncomenda: true, encomendaMinima: 10, usos: [],
  },
  {
    id: "p10", slug: "power-bank", nome: "Power bank 10.000 mAh", categoria: "tecnologia", icone: "powerbank",
    galeria: [
      g("frente", "neutro", "Power bank com duas saídas USB", "/brindes/powerbank.png"),
      g("detalhe", "navy-sky", "Indicador de carga com quatro luzes", "/brindes/powerbank.png"),
    ],
    descricaoCurta: "Carregador portátil com duas saídas.",
    descricaoLonga: [
      "Carrega um celular duas vezes. Saiu muito no primeiro semestre e acabou.",
      "Está sem estoque para pronta entrega. Dá para pedir por encomenda, com produção sob demanda.",
    ],
    especificacoes: [
      { rotulo: "Capacidade", valor: "10.000 mAh" },
      { rotulo: "Saídas", valor: "2 USB-A e 1 USB-C" },
      { rotulo: "Peso", valor: "210 g" },
    ],
    custoUnitario: 79,
    variacoes: [{ id: "unico", rotulo: "Único", saldo: 0, minimo: 10 }],
    selos: [], cadastradoEm: "2025-12-10", ativo: true,
    aceitaEncomenda: true, encomendaMinima: 10, usos: [],
  },
  {
    id: "p11", slug: "squeeze-esportivo", nome: "Squeeze esportivo 750 ml", categoria: "bebidas", icone: "squeeze",
    galeria: [
      g("frente", "neutro", "Squeeze de plástico com bico retrátil", "/brindes/squeeze.png"),
      g("detalhe", "sky-orange", "Impressão colorida na lateral", "/brindes/squeeze.png"),
    ],
    descricaoCurta: "Squeeze leve para corrida e evento ao ar livre.",
    descricaoLonga: [
      "Plástico sem BPA, bico retrátil e alça para pendurar. É o brinde de ação de rua e corrida patrocinada.",
      "Está sem estoque para pronta entrega e ainda não entrou na lista de encomenda.",
    ],
    especificacoes: [
      { rotulo: "Material", valor: "Plástico PP sem BPA" },
      { rotulo: "Capacidade", valor: "750 ml" },
      { rotulo: "Extras", valor: "Bico retrátil e alça" },
    ],
    custoUnitario: 14.5,
    variacoes: [{ id: "unico", rotulo: "Único", saldo: 0, minimo: 20 }],
    personalizacao: { tecnica: "Impressão colorida na lateral", area: "8 × 10 cm", qtdMinima: 25, prazoExtraDiasUteis: 4, aceita: ["logo"] },
    selos: [], cadastradoEm: "2026-03-28", ativo: true, usos: [],
  },
  {
    id: "p12", slug: "chaveiro-metalico", nome: "Chaveiro metálico", categoria: "escritorio", icone: "chaveiro",
    galeria: [
      g("frente", "neutro", "Chaveiro de metal com a marca gravada", "/brindes/chaveiro.png"),
      g("detalhe", "navy-sky", "Gravação a laser nos dois lados", "/brindes/chaveiro.png"),
    ],
    descricaoCurta: "Chaveiro de metal, lembrança simples para evento grande.",
    descricaoLonga: [
      "Chaveiro de zinco com argola reforçada. É o brinde de baixo custo para distribuir em volume no estande.",
      "Está sem estoque para pronta entrega e ainda não entrou na lista de encomenda.",
    ],
    especificacoes: [
      { rotulo: "Material", valor: "Liga de zinco" },
      { rotulo: "Dimensões", valor: "4 × 2,5 cm" },
      { rotulo: "Gravação", valor: "A laser, nos dois lados" },
    ],
    custoUnitario: 6.5,
    variacoes: [{ id: "unico", rotulo: "Único", saldo: 0, minimo: 50 }],
    personalizacao: { tecnica: "Gravação a laser", area: "3 × 2 cm", qtdMinima: 50, prazoExtraDiasUteis: 3, aceita: ["logo"] },
    selos: [], cadastradoEm: "2026-01-30", ativo: true, usos: [],
  },

  // ---------------- ESGOTADOS / ENCOMENDA ----------------
  {
    id: "p13", slug: "bloco-adesivo", nome: "Bloco adesivo", categoria: "escritorio", icone: "bloco",
    galeria: [
      g("frente", "navy-sky", "Bloco de notas adesivas com a marca", "/brindes/bloco-adesivo.png"),
      g("detalhe", "sky-orange", "Capa de papel-cartão com a logo", "/brindes/bloco-adesivo.png"),
    ],
    descricaoCurta: "Bloco de notas adesivas para a mesa de trabalho.",
    descricaoLonga: [
      "Bloco com folhas adesivas coloridas e marcadores de página, capa de papel-cartão com a marca. Brinde barato para kit de boas-vindas.",
      "Está sem estoque para pronta entrega e ainda não entrou na lista de encomenda.",
    ],
    especificacoes: [
      { rotulo: "Conteúdo", valor: "4 blocos de cores + 5 marcadores" },
      { rotulo: "Dimensões", valor: "9 × 12 cm fechado" },
      { rotulo: "Capa", valor: "Papel-cartão 300 g" },
    ],
    custoUnitario: 8.9,
    variacoes: [{ id: "unico", rotulo: "Único", saldo: 0, minimo: 40 }],
    selos: [], cadastradoEm: "2026-04-11", ativo: true, usos: [],
  },
  // Camiseta: item ENCOMENDA-ONLY. Não tem estoque próprio; só existe por encomenda sob demanda.
  {
    id: "p14", slug: "camiseta-digisystem", nome: "Camiseta Digisystem", categoria: "vestuario", icone: "camiseta",
    galeria: [
      g("frente", "navy-escuro", "Camiseta azul com a marca no peito", "/brindes/camiseta.png"),
      g("detalhe", "navy-sky", "Logo bordado de 8 cm", "/brindes/camiseta.png"),
    ],
    descricaoCurta: "Camiseta de algodão para o time usar em evento. Feita sob encomenda.",
    descricaoLonga: [
      "Malha penteada fio 30, modelagem unissex. É a camiseta que o time usa no estande.",
      "É um item sob encomenda: não tem estoque próprio. A produção é feita sob demanda, a partir da quantidade mínima, depois do alinhamento com o marketing.",
    ],
    especificacoes: [
      { rotulo: "Material", valor: "100% algodão, malha fio 30" },
      { rotulo: "Modelagem", valor: "Unissex, gola redonda" },
      { rotulo: "Tamanhos", valor: "P, M e G" },
      { rotulo: "Cuidados", valor: "Lavar do avesso, não usar secadora" },
    ],
    custoUnitario: 38,
    variacoes: [
      { id: "p", rotulo: "P", tamanho: "P", saldo: 0, minimo: 0 },
      { id: "m", rotulo: "M", tamanho: "M", saldo: 0, minimo: 0 },
      { id: "g", rotulo: "G", tamanho: "G", saldo: 0, minimo: 0 },
    ],
    selos: [], cadastradoEm: "2026-01-15", ativo: true,
    aceitaEncomenda: true, somenteEncomenda: true, encomendaMinima: 20, usos: [],
  },
  // Item de encomenda que NASCEU de uma sugestão aprovada (SG-0002). Sem estoque próprio.
  {
    id: "p-enc-sg0002", slug: "mousepad-emborrachado", nome: "Mousepad emborrachado", categoria: "tecnologia", icone: "mousepad",
    galeria: [g("frente", "navy-sky", "Mousepad grande com a marca Digisystem", "/brindes/bloco-adesivo.png")],
    descricaoCurta: "Mousepad grande com a marca, para o kit de boas-vindas do time novo.",
    descricaoLonga: [
      "Mousepad emborrachado de superfície lisa, com a marca impressa. Nasceu de uma sugestão do time aprovada pelo marketing.",
      "Item sob encomenda: não tem estoque próprio. A produção é feita sob demanda, a partir da quantidade mínima, depois do alinhamento com o marketing.",
    ],
    especificacoes: [
      { rotulo: "Dimensões", valor: "70 × 30 cm" },
      { rotulo: "Base", valor: "Borracha antiderrapante" },
      { rotulo: "Origem", valor: "Sugestão aprovada pela equipe de marketing" },
    ],
    custoUnitario: 22,
    variacoes: [{ id: "unico", rotulo: "Único", saldo: 0, minimo: 0 }],
    selos: ["novidade"], cadastradoEm: "2026-10-22", ativo: true,
    aceitaEncomenda: true, somenteEncomenda: true, encomendaMinima: 10, origemSugestao: "SG-0002", usos: [],
  },
];

const ev = (status: Pedido["status"], em: string, porId: string, nota?: string) => ({ status, em, porId, nota });

export const PEDIDOS_INICIAIS: Pedido[] = [
  // ----- ENCOMENDAS (produção sob demanda, estados variados) -----
  // Encomenda recém-aberta, aguardando a equipe assumir o alinhamento.
  {
    id: "BR-0051", solicitanteId: "u-ana", centroCustoId: "MKT-DIR", tipoPedido: "encomenda",
    itens: [{ produtoId: "p14", variacaoId: "m", qtd: 40, custoUnitarioNaHora: 38, personalizacao: { texto: "Logo Digisystem no peito e \"Time 2026\" nas costas", arteNome: "camiseta-time.svg" } }],
    finalidade: "evento", destino: "Camisetas do time para o Tech Summit", dataNecessaria: "2026-12-10",
    localRetirada: LOCAL_RETIRADA, observacao: "Precisamos de 40, com o nome do time atrás.",
    status: "encomenda_solicitada",
    encomenda: { quantidadeAlinhada: 40, prazoDesejado: "2026-12-10", observacoesPersonalizacao: "Bordado no peito, serigrafia nas costas." },
    historico: [ev("encomenda_solicitada", "2026-10-28T16:40", "u-ana")], criadoEm: "2026-10-28T16:40",
  },
  // Encomenda em alinhamento: a equipe está conversando volume e prazo com quem pediu.
  {
    id: "BR-0050", solicitanteId: "u-rafael", centroCustoId: "COM-DIR", tipoPedido: "encomenda",
    itens: [{ produtoId: "p06", variacaoId: "azul", qtd: 30, custoUnitarioNaHora: 42 }],
    finalidade: "parceiro", destino: "Garrafas para o encontro de parceiros Sul", dataNecessaria: "2026-12-05",
    localRetirada: LOCAL_RETIRADA, status: "em_alinhamento",
    encomenda: { quantidadeAlinhada: 30, prazoDesejado: "2026-12-05" },
    historico: [
      ev("encomenda_solicitada", "2026-10-26T09:12", "u-rafael"),
      ev("em_alinhamento", "2026-10-27T11:00", "u-felipe", "Confirmando se são 30 ou 50 unidades com o fornecedor."),
    ],
    criadoEm: "2026-10-26T09:12",
  },
  // Encomenda em produção: confirmada e já na fábrica.
  {
    id: "BR-0043", solicitanteId: "u-juliana", centroCustoId: "RH-DIR", tipoPedido: "encomenda",
    itens: [{ produtoId: "p09", variacaoId: "grafite", qtd: 12, custoUnitarioNaHora: 189 }],
    finalidade: "interno", destino: "Mochilas para o onboarding de novembro", dataNecessaria: "2026-11-28",
    localRetirada: LOCAL_RETIRADA, status: "em_producao",
    encomenda: { quantidadeAlinhada: 12, prazoDesejado: "2026-11-28", prazoConfirmado: "2026-11-25", observacoesPersonalizacao: "Logo bordado na frente." },
    historico: [
      ev("encomenda_solicitada", "2026-10-15T10:00", "u-juliana"),
      ev("em_alinhamento", "2026-10-16T14:00", "u-felipe"),
      ev("confirmada", "2026-10-18T09:30", "u-felipe", "Fechado: 12 unidades, pronto em 25/11."),
      ev("em_producao", "2026-10-21T08:00", "u-felipe", "Pedido enviado à fábrica."),
    ],
    criadoEm: "2026-10-15T10:00",
  },
  // ----- PRONTA ENTREGA (saiu na hora) -----
  {
    id: "BR-0049", solicitanteId: "u-ana", centroCustoId: "MKT-DIR", tipoPedido: "pronta",
    itens: [
      { produtoId: "p01", variacaoId: "azul", qtd: 10, custoUnitarioNaHora: 27 },
      { produtoId: "p02", variacaoId: "unico", qtd: 20, custoUnitarioNaHora: 9.5 },
    ],
    finalidade: "cliente", destino: "Visita ao Banco Horizonte", dataNecessaria: "2026-11-06",
    localRetirada: LOCAL_RETIRADA, status: "pronto",
    historico: [ev("pronto", "2026-10-27T10:14", "u-ana", "Saiu na hora: havia saldo. Separado na recepção.")],
    criadoEm: "2026-10-27T10:14",
  },
  {
    id: "BR-0048", solicitanteId: "u-ana", centroCustoId: "MKT-DIR", tipoPedido: "pronta",
    itens: [{ produtoId: "p04", variacaoId: "preto", qtd: 6, custoUnitarioNaHora: 58 }],
    finalidade: "cliente", destino: "Kit diretoria do Grupo Vela", dataNecessaria: "2026-10-31",
    localRetirada: LOCAL_RETIRADA, status: "pronto",
    historico: [ev("pronto", "2026-10-26T14:30", "u-ana", "Separado na prateleira B2 da recepção.")],
    criadoEm: "2026-10-26T14:30",
  },
  // Encerrado: foi retirado (custo debitado).
  {
    id: "BR-0047", solicitanteId: "u-ana", centroCustoId: "MKT-DIR", tipoPedido: "pronta",
    itens: [{ produtoId: "p05", variacaoId: "unico", qtd: 60, custoUnitarioNaHora: 3.2 }],
    finalidade: "evento", destino: "Congresso de Dados SP", dataNecessaria: "2026-10-21",
    localRetirada: LOCAL_RETIRADA, status: "encerrado",
    historico: [
      ev("pronto", "2026-10-13T10:00", "u-ana", "Saiu na hora: havia saldo."),
      ev("encerrado", "2026-10-20T09:30", "u-felipe", "Retirado por Ana Souza."),
    ],
    criadoEm: "2026-10-13T10:00",
  },
  {
    id: "BR-0046", solicitanteId: "u-beatriz", centroCustoId: "FIN-DIR", tipoPedido: "pronta",
    itens: [{ produtoId: "p02", variacaoId: "unico", qtd: 40, custoUnitarioNaHora: 9.5 }],
    finalidade: "interno", destino: "Fechamento de trimestre do Financeiro", dataNecessaria: "2026-10-15",
    localRetirada: LOCAL_RETIRADA, status: "encerrado",
    historico: [
      ev("pronto", "2026-10-07T13:20", "u-beatriz", "Saiu na hora: havia saldo."),
      ev("encerrado", "2026-10-14T16:05", "u-felipe", "Retirado pela assistente do Financeiro."),
    ],
    criadoEm: "2026-10-07T13:20",
  },
  // ----- DESVIOS -----
  // Encomenda negada: o marketing decidiu não produzir.
  {
    id: "BR-0045", solicitanteId: "u-ana", centroCustoId: "MKT-DIR", tipoPedido: "encomenda",
    itens: [{ produtoId: "p10", variacaoId: "unico", qtd: 10, custoUnitarioNaHora: 79 }],
    finalidade: "cliente", destino: "Power banks de brinde VIP para a Acme", dataNecessaria: "2026-11-25",
    localRetirada: LOCAL_RETIRADA, status: "negado",
    motivo: "O custo por unidade ficou acima do previsto para o volume. Vamos rever a lista antes de encomendar.",
    encomenda: { quantidadeAlinhada: 10, prazoDesejado: "2026-11-25" },
    historico: [
      ev("encomenda_solicitada", "2026-10-19T15:00", "u-ana"),
      ev("em_alinhamento", "2026-10-20T09:00", "u-felipe"),
      ev("negado", "2026-10-20T10:30", "u-fernando"),
    ],
    criadoEm: "2026-10-19T15:00",
  },
  // Encomenda cancelada pelo próprio solicitante (ainda não baixou estoque).
  {
    id: "BR-0044", solicitanteId: "u-juliana", centroCustoId: "RH-DIR", tipoPedido: "encomenda",
    itens: [{ produtoId: "p08", variacaoId: "cru", qtd: 40, custoUnitarioNaHora: 16 }],
    finalidade: "interno", destino: "Ecobags para a semana de integração", dataNecessaria: "2026-11-30",
    localRetirada: LOCAL_RETIRADA, status: "cancelado", motivo: "O evento foi adiado para dezembro.",
    encomenda: { quantidadeAlinhada: 40, prazoDesejado: "2026-11-30" },
    historico: [
      ev("encomenda_solicitada", "2026-10-21T09:40", "u-juliana"),
      ev("cancelado", "2026-10-26T08:50", "u-juliana"),
    ],
    criadoEm: "2026-10-21T09:40",
  },
];

let n = 0;
const mv = (m: Omit<Movimentacao, "id">): Movimentacao => ({ id: `mv-seed-${++n}`, ...m });

// Movimentações do mês. Cada variável que tem histórico começa com uma linha "saldo-inicial"
// para a conta fechar: saldo-inicial + entradas − saídas ± ajustes = saldo atual.
export const MOVIMENTOS_INICIAIS: Movimentacao[] = [
  // Garrafa azul (p06): esgotada. 40 inicial + 12 entrada − 52 saída (eventos) = 0.
  mv({ em: "2026-09-01T09:00", produtoId: "p06", variacaoId: "azul", tipo: "saldo-inicial", qtd: 40, destino: "Saldo de abertura set/26", porId: "u-ariadne" }),
  mv({ em: "2026-09-18T14:00", produtoId: "p06", variacaoId: "azul", tipo: "saida", qtd: -12, destino: "Feira Agro Digital (pedido de setembro)", porId: "u-felipe" }),
  mv({ em: "2026-10-03T09:30", produtoId: "p06", variacaoId: "azul", tipo: "entrada", qtd: 12, destino: "Reposição lote out/26", porId: "u-ariadne" }),
  mv({ em: "2026-10-15T10:00", produtoId: "p06", variacaoId: "azul", tipo: "saida", qtd: -40, destino: "Café com clientes do setor público e feiras", porId: "u-felipe" }),
  // Caderno azul (p01): 80 inicial − 20 saída (BR-0049 saiu na hora: 10) ... ajustado abaixo
  mv({ em: "2026-09-01T09:00", produtoId: "p01", variacaoId: "azul", tipo: "saldo-inicial", qtd: 55, destino: "Saldo de abertura set/26", porId: "u-ariadne" }),
  mv({ em: "2026-10-10T10:00", produtoId: "p01", variacaoId: "azul", tipo: "entrada", qtd: 15, destino: "Reposição de cadernos", porId: "u-ariadne" }),
  mv({ em: "2026-10-27T10:14", produtoId: "p01", variacaoId: "azul", tipo: "saida", qtd: -10, pedidoId: "BR-0049", destino: "Visita ao Banco Horizonte", porId: "u-ana" }),
  // Caneta (p02): 400 inicial − 40 (BR-0046 retirado) − 20 (BR-0049) − 40 (visitas) = 300.
  mv({ em: "2026-09-01T09:00", produtoId: "p02", variacaoId: "unico", tipo: "saldo-inicial", qtd: 400, destino: "Saldo de abertura set/26", porId: "u-ariadne" }),
  mv({ em: "2026-10-07T13:20", produtoId: "p02", variacaoId: "unico", tipo: "saida", qtd: -40, pedidoId: "BR-0046", destino: "Fechamento de trimestre do Financeiro", porId: "u-beatriz" }),
  mv({ em: "2026-10-08T10:00", produtoId: "p02", variacaoId: "unico", tipo: "saida", qtd: -40, destino: "Rodada de visitas no Rio", porId: "u-felipe" }),
  mv({ em: "2026-10-27T10:14", produtoId: "p02", variacaoId: "unico", tipo: "saida", qtd: -20, pedidoId: "BR-0049", destino: "Visita ao Banco Horizonte", porId: "u-ana" }),
  // Moleskine preto (p04): 28 inicial − 6 (BR-0048) = 22.
  mv({ em: "2026-10-18T10:00", produtoId: "p04", variacaoId: "preto", tipo: "saldo-inicial", qtd: 28, destino: "Primeiro lote de moleskines", porId: "u-ariadne" }),
  mv({ em: "2026-10-26T14:30", produtoId: "p04", variacaoId: "preto", tipo: "saida", qtd: -6, pedidoId: "BR-0048", destino: "Kit diretoria do Grupo Vela", porId: "u-ana" }),
  // Folder (p05): 480 inicial − 60 (BR-0047 retirado) = 420.
  mv({ em: "2026-09-30T11:00", produtoId: "p05", variacaoId: "unico", tipo: "saldo-inicial", qtd: 480, destino: "Tiragem institucional", porId: "u-ariadne" }),
  mv({ em: "2026-10-13T10:00", produtoId: "p05", variacaoId: "unico", tipo: "saida", qtd: -60, pedidoId: "BR-0047", destino: "Congresso de Dados SP", porId: "u-ana" }),
  // Caneca branca (p07): 30 inicial − 30 saída = 0 (esgotada).
  mv({ em: "2026-09-01T09:00", produtoId: "p07", variacaoId: "branca", tipo: "saldo-inicial", qtd: 30, destino: "Saldo de abertura set/26", porId: "u-ariadne" }),
  mv({ em: "2026-10-06T10:00", produtoId: "p07", variacaoId: "branca", tipo: "saida", qtd: -30, destino: "Semana de integração", porId: "u-felipe" }),
  // Ecobag (p08): 90 inicial − 90 saída = 0 (esgotada).
  mv({ em: "2026-09-05T10:00", produtoId: "p08", variacaoId: "cru", tipo: "saldo-inicial", qtd: 90, destino: "Lote de ecobags", porId: "u-ariadne" }),
  mv({ em: "2026-10-04T10:00", produtoId: "p08", variacaoId: "cru", tipo: "saida", qtd: -90, destino: "Feiras de outubro", porId: "u-felipe" }),
];

/** Gasto de meses anteriores, já fechado (histórico para as barras terem comparação). */
export const GASTO_MESES_ANTERIORES: Record<string, Record<CentroCustoId, { valor: number; pedidos: number; unidades: number }>> = {
  "2026-09": {
    "MKT-DIR": { valor: 2140, pedidos: 4, unidades: 86 },
    "COM-DIR": { valor: 1860, pedidos: 5, unidades: 120 },
    "RH-DIR": { valor: 920, pedidos: 2, unidades: 64 },
    "TI-DIR": { valor: 640, pedidos: 1, unidades: 20 },
    "FIN-DIR": { valor: 310, pedidos: 1, unidades: 15 },
  },
  "2026-08": {
    "MKT-DIR": { valor: 1580, pedidos: 3, unidades: 70 },
    "COM-DIR": { valor: 2410, pedidos: 6, unidades: 142 },
    "RH-DIR": { valor: 1340, pedidos: 3, unidades: 90 },
    "TI-DIR": { valor: 0, pedidos: 0, unidades: 0 },
    "FIN-DIR": { valor: 205, pedidos: 1, unidades: 10 },
  },
};

export const CARRINHO_INICIAL: ItemCarrinho[] = [
  { chave: "p03|azul|", produtoId: "p03", variacaoId: "azul", qtd: 10 },
  { chave: "p02|unico|", produtoId: "p02", variacaoId: "unico", qtd: 50 },
];

const evs = (status: Sugestao["status"], em: string, porId: string) => ({ status, em, porId });

// Sugestões de item em estados variados (mini-feature v4). O diretor sugere, o marketing
// analisa e aprova (vira item de encomenda) ou recusa com motivo.
export const SUGESTOES_INICIAIS: Sugestao[] = [
  {
    id: "SG-0004", nome: "Guarda-chuva compacto", descricao: "Guarda-chuva automático com a marca na faixa, para dar em dia de feira com chuva.",
    referencia: "https://exemplo.com/guarda-chuva-automatico", qtdEstimada: 50,
    status: "sugerida", sugeridaPorId: "u-ana", criadaEm: "2026-10-28T11:20",
    historico: [evs("sugerida", "2026-10-28T11:20", "u-ana")],
  },
  {
    id: "SG-0003", nome: "Fone de ouvido sem fio", descricao: "Fone Bluetooth com estojo de carga, para presente de cliente estratégico.",
    qtdEstimada: 20, status: "em_analise", sugeridaPorId: "u-rafael", criadaEm: "2026-10-26T15:40",
    historico: [
      evs("sugerida", "2026-10-26T15:40", "u-rafael"),
      evs("em_analise", "2026-10-27T09:10", "u-felipe"),
    ],
  },
  {
    id: "SG-0002", nome: "Mousepad emborrachado", descricao: "Mousepad grande com a marca, para o kit de boas-vindas do time novo.",
    qtdEstimada: 30, status: "aprovada", sugeridaPorId: "u-juliana", criadaEm: "2026-10-20T10:00",
    produtoGeradoId: "p-enc-sg0002",
    historico: [
      evs("sugerida", "2026-10-20T10:00", "u-juliana"),
      evs("em_analise", "2026-10-21T08:30", "u-felipe"),
      evs("aprovada", "2026-10-22T14:00", "u-fernando"),
    ],
  },
  {
    id: "SG-0001", nome: "Boné trucker", descricao: "Boné com tela atrás e a marca bordada na frente, para ação de rua.",
    qtdEstimada: 40, status: "recusada", sugeridaPorId: "u-ana", criadaEm: "2026-10-14T09:15",
    motivo: "Já temos a camiseta como item de vestuário sob encomenda. Vamos concentrar o volume nela por enquanto.",
    historico: [
      evs("sugerida", "2026-10-14T09:15", "u-ana"),
      evs("em_analise", "2026-10-15T10:00", "u-felipe"),
      evs("recusada", "2026-10-16T16:20", "u-fernando"),
    ],
  },
];
