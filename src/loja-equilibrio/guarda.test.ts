// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: o código-fonte desta pasta (src/loja-equilibrio/) e de src/auth-proto/, escrito em 2026-11-12.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .kiro/specs/loja-equilibrio-digiplace/design.md (Testing Strategy, teste de guarda).
//
// Teste de guarda de código-fonte e de textos, sem PBT. Lê os arquivos como texto bruto com `import.meta.glob(..., ?raw)`
// (o projeto não tem @types/node, então `node:fs` não passaria no `tsc`; o efeito é o mesmo: ler o texto dos arquivos).

import { describe, expect, it } from "vitest";
import { ROTULO_ESTADO } from "./formato";
import { TRANSICOES } from "./regras";

const fontesBrutas = import.meta.glob<string>("./**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true });
const fontesAuth = import.meta.glob<string>("../auth-proto/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true });

/** Fontes do protótipo, sem os arquivos de teste. Chaves no formato "telas/gestao/Fila.tsx". */
const fontes: Record<string, string> = Object.fromEntries(
  Object.entries(fontesBrutas)
    .filter(([caminho]) => !/\.test\.tsx?$/.test(caminho))
    .map(([caminho, texto]) => [caminho.replace(/^\.\//, ""), texto]),
);
const arquivos = Object.keys(fontes).sort();

/* ---------------------------------------------------------------- */
/* Varredura de texto                                                */
/* ---------------------------------------------------------------- */

interface Varredura {
  /** Código e literais (strings, templates, texto JSX), sem comentários. */
  exibivel: string;
  /** Corpo de cada comentário. */
  comentarios: string[];
}

/** Separa comentários do resto. Erra para o lado de reportar demais, nunca de menos. */
function varrer(src: string): Varredura {
  type Modo = { tipo: "codigo"; chaves: number } | { tipo: "template" };
  const pilha: Modo[] = [{ tipo: "codigo", chaves: 0 }];
  const comentarios: string[] = [];
  const n = src.length;
  let exibivel = "";
  let i = 0;
  while (i < n) {
    const modo = pilha[pilha.length - 1];
    const c = src[i];
    const d = src[i + 1];
    if (modo.tipo === "template") {
      if (c === "\\") {
        exibivel += c + (d ?? "");
        i += 2;
      } else if (c === "`") {
        exibivel += c;
        pilha.pop();
        i += 1;
      } else if (c === "$" && d === "{") {
        exibivel += "${";
        pilha.push({ tipo: "codigo", chaves: 0 });
        i += 2;
      } else {
        exibivel += c;
        i += 1;
      }
      continue;
    }
    if (c === "/" && d === "/") {
      const fim = src.indexOf("\n", i);
      const f = fim === -1 ? n : fim;
      comentarios.push(src.slice(i + 2, f));
      i = f;
    } else if (c === "/" && d === "*") {
      const fim = src.indexOf("*/", i + 2);
      const f = fim === -1 ? n : fim;
      comentarios.push(src.slice(i + 2, f));
      exibivel += " ";
      i = f + 2;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== "\n") {
        if (src[j] === "\\") j += 1;
        j += 1;
      }
      exibivel += src.slice(i, j + 1);
      i = j + 1;
    } else if (c === "`") {
      exibivel += c;
      pilha.push({ tipo: "template" });
      i += 1;
    } else if (c === "}" && modo.chaves === 0 && pilha.length > 1) {
      exibivel += c;
      pilha.pop();
      i += 1;
    } else {
      if (c === "{") modo.chaves += 1;
      if (c === "}") modo.chaves -= 1;
      exibivel += c;
      i += 1;
    }
  }
  return { exibivel, comentarios };
}

/** Termos antigos de estado de pedido. Os identificadores (minúsculos, com "_") não casam. */
const TERMOS_ANTIGOS = /\b(?:Solicitadas?|Encerradas?|Recusadas?|Canceladas?)\b|em alinhamento/gi;
/** Os quatro primeiros só valem com maiúscula (em minúsculas são identificadores como "encerrada"). */
function termosAntigos(texto: string): string[] {
  return (texto.match(TERMOS_ANTIGOS) ?? []).filter((t) => /^[A-Z]/.test(t) || /^em alinhamento$/i.test(t));
}

/** Tira o bloco ROTULO_SUGESTAO: estado de sugestão é outro conceito e mantém "Recusada". */
function semBlocoDeSugestao(texto: string): string {
  return texto.replace(/export const ROTULO_SUGESTAO[\s\S]*?\n\};/, "");
}

/**
 * A tela de Sugestões tem o próprio mapa de rótulos do estado de SUGESTÃO ("Aprovada", "Recusada", filtro "Recusadas").
 * É outro conceito (design: ROTULO_SUGESTAO não muda), então nesse arquivo só "Recusada(s)" é permitido;
 * "Solicitada", "Em alinhamento", "Encerrada" e "Cancelada" continuam proibidos nele.
 */
const PERMITIDOS_POR_ARQUIVO: Record<string, string[]> = {
  "telas/gestao/Sugestoes.tsx": ["Recusada", "Recusadas"],
};

describe("varredura de texto (ferramenta do próprio teste)", () => {
  it("separa comentários, preserva strings com // e entende templates aninhados", () => {
    const v = varrer('const a = "http://x"; // Solicitada\nconst b = `x ${ok ? "Recusada" : `y`} z`; /* Cancelada */');
    expect(v.comentarios.map((c) => c.trim())).toEqual(["Solicitada", "Cancelada"]);
    expect(v.exibivel).toContain('"http://x"');
    expect(termosAntigos(v.exibivel)).toEqual(["Recusada"]);
  });

  it("não confunde identificadores com rótulos", () => {
    expect(termosAntigos('estado === "encerrada" && pedidosEncerrados')).toEqual([]);
    expect(termosAntigos("em_alinhamento")).toEqual([]);
    expect(termosAntigos("Pedido em alinhamento")).toEqual(["em alinhamento"]);
  });

  it("encontra o conjunto esperado de arquivos", () => {
    expect(arquivos).toEqual(expect.arrayContaining([
      "formato.ts", "regras.ts", "mock.ts", "tipos.ts", "Cabecalho.tsx", "CarrinhoPainel.tsx", "LogoDigiStore.tsx",
      "LojaEquilibrio.tsx", "telas/gestao/Fila.tsx", "telas/gestao/Cadastro.tsx", "telas/solicitante/PaginaBrinde.tsx",
    ]));
  });
});

/* ---------------------------------------------------------------- */
/* 1. Rótulos de estado                                              */
/* ---------------------------------------------------------------- */

describe("guarda 1: rótulos antigos de estado de pedido fora dos textos", () => {
  // **Validates: Requirements 8.1, 8.5, 8.6**
  it.each(arquivos)("%s não usa Solicitada, Em alinhamento, Encerrada, Recusada nem Cancelada como rótulo", (arquivo) => {
    const { exibivel, comentarios } = varrer(semBlocoDeSugestao(fontes[arquivo]));
    // Comentário que cita um identificador entre crases (`solicitada`) fica de fora só no trecho entre crases.
    const textoDosComentarios = comentarios.map((c) => c.replace(/`[^`]*`/g, "")).join("\n");
    const permitidos = PERMITIDOS_POR_ARQUIVO[arquivo] ?? [];
    const proibidos = (texto: string) => termosAntigos(texto).filter((t) => !permitidos.includes(t));
    expect({ arquivo, exibivel: proibidos(exibivel), comentarios: proibidos(textoDosComentarios) }).toEqual({
      arquivo,
      exibivel: [],
      comentarios: [],
    });
  });
});

/* ---------------------------------------------------------------- */
/* 2 e 3. Fonte única e mapas esperados                              */
/* ---------------------------------------------------------------- */

describe("guarda 2 e 3: ROTULO_ESTADO tem fonte única e valores esperados", () => {
  // **Validates: Requirements 8.1, 8.2**
  it("só formato.ts declara ROTULO_ESTADO (os demais importam ou reexportam)", () => {
    const declaracao = /\b(?:const|let|var)\s+ROTULO_ESTADO\b/;
    const quemDeclara = arquivos.filter((a) => declaracao.test(fontes[a]));
    expect(quemDeclara).toEqual(["formato.ts"]);
  });

  it("o mapa tem exatamente os rótulos do Requirement 8.1", () => {
    expect(ROTULO_ESTADO).toEqual({
      solicitada: "Recebido",
      em_alinhamento: "Em preparação",
      pronto: "Pronto para retirada",
      encerrada: "Retirado",
      recusada: "Recusado",
      cancelada: "Cancelado",
    });
  });

  it("TRANSICOES é a tabela do design, com os mesmos identificadores", () => {
    expect(TRANSICOES).toEqual({
      solicitada: ["em_alinhamento", "recusada", "cancelada"],
      em_alinhamento: ["pronto", "recusada", "cancelada"],
      pronto: ["encerrada", "cancelada"],
      encerrada: [],
      recusada: [],
      cancelada: [],
    });
  });
});

/* ---------------------------------------------------------------- */
/* 4. Filtro Recebidos                                               */
/* ---------------------------------------------------------------- */

describe("guarda 4: filtro da Fila", () => {
  // **Validates: Requirements 8.3**
  it('Fila.tsx tem o filtro "Recebidos" e nenhum "Solicitadas"', () => {
    const fila = fontes["telas/gestao/Fila.tsx"];
    expect(fila).toMatch(/rotulo:\s*"Recebidos"/);
    expect(fila).not.toMatch(/Solicitadas/);
  });
});

/* ---------------------------------------------------------------- */
/* 5. Quantidade mínima fora                                         */
/* ---------------------------------------------------------------- */

describe("guarda 5: quantidade mínima do Personalizável não existe mais", () => {
  // **Validates: Requirements 3.8, 3.9, 3.10**
  const alvo = arquivos.filter(
    (a) => ["tipos.ts", "regras.ts", "mock.ts", "CarrinhoPainel.tsx"].includes(a) || a.startsWith("telas/"),
  );

  it("o conjunto verificado inclui as telas", () => {
    expect(alvo.length).toBeGreaterThan(10);
  });

  it.each(alvo)("%s não cita quantidadeMinima nem 'quantidade mínima'", (arquivo) => {
    expect(fontes[arquivo]).not.toMatch(/quantidadeMinima/);
    expect(fontes[arquivo]).not.toMatch(/quantidade\s+m[ií]nima/i);
  });
});

/* ---------------------------------------------------------------- */
/* 6. Logo                                                           */
/* ---------------------------------------------------------------- */

describe("guarda 6: logo da Digi Store", () => {
  // **Validates: Requirements 9.3**
  it("o Cabecalho usa LogoDigiStore", () => {
    expect(fontes["Cabecalho.tsx"]).toMatch(/<LogoDigiStore\b/);
  });

  it("LogoDigiStore usa urlDoAsset com BASE_URL, alt fixo e fallback onError", () => {
    const logo = fontes["LogoDigiStore.tsx"];
    expect(logo).toMatch(/urlDoAsset\(/);
    expect(logo).toContain("import.meta.env.BASE_URL");
    expect(logo).toContain('alt="Digi Store"');
    expect(logo).toMatch(/onError=/);
  });

  it.each(arquivos)('%s não tem literal "/digistore/ (usa urlDoAsset)', (arquivo) => {
    expect(fontes[arquivo]).not.toMatch(/["'`]\/digistore\//);
  });
});

/* ---------------------------------------------------------------- */
/* 7. Login intacto                                                  */
/* ---------------------------------------------------------------- */

describe("guarda 7: auth-proto não depende de loja-equilibrio", () => {
  it("nenhum arquivo de src/auth-proto/ cita loja-equilibrio", () => {
    const caminhos = Object.keys(fontesAuth);
    expect(caminhos.length).toBeGreaterThan(0);
    for (const caminho of caminhos) {
      expect({ caminho, cita: /loja-equilibrio/.test(fontesAuth[caminho]) }).toEqual({ caminho, cita: false });
    }
  });
});

/* ================================================================ */
/* Guardas 8 a 14 (tarefa 13.4)                                      */
/* ================================================================ */

import { razaoDeContraste } from "./formato";
import {
  COR_FAIXA_CANTO, COR_FAIXA_DESTAQUE, COR_FAIXA_ETIQUETA, COR_FAIXA_FUNDO, COR_FAIXA_SUBTITULO, COR_FAIXA_TEXTO,
  CONTRASTE_MINIMO_TEXTO_GRANDE, CONTRASTE_MINIMO_TEXTO_PEQUENO,
} from "./FaixaApresentacao";

/** Minúsculas e sem acento, para a busca por "variac". */
const semAcento = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/* ---- 8. Sem variação ---- */

describe("guarda 8: o modelo não tem variações", () => {
  // **Validates: Requirements 11.1, 11.2**
  const alvo = arquivos.filter(
    (a) =>
      ["tipos.ts", "regras.ts", "mock.ts", "store.tsx", "CarrinhoPainel.tsx", "Cabecalho.tsx", "FaixaApresentacao.tsx", "PrecoBrinde.tsx"].includes(a) ||
      a.startsWith("telas/"),
  );

  it("o conjunto verificado inclui as telas e os arquivos nomeados", () => {
    expect(alvo.length).toBeGreaterThan(14);
    expect(alvo).toEqual(expect.arrayContaining(["tipos.ts", "regras.ts", "mock.ts", "store.tsx", "PrecoBrinde.tsx"]));
  });

  it.each(alvo)("%s não contém 'variac' (nem em comentário)", (arquivo) => {
    expect(semAcento(fontes[arquivo])).not.toContain("variac");
  });
});

/* ---- 9. Textos da faixa ---- */

describe("guarda 9: textos da Faixa_de_Apresentacao", () => {
  // **Validates: Requirements 12.5, 12.7**
  it("a faixa tem os textos literais", () => {
    const faixa = fontes["FaixaApresentacao.tsx"];
    for (const t of [
      "DIGI STORE · BRINDES DIGISYSTEM",
      "Brindes que levam a marca",
      "para perto.",
      "Escolha os itens, monte o carrinho e acompanhe cada solicitação em Pedidos.",
    ]) expect(faixa).toContain(t);
  });

  it("LojaEquilibrio só renderiza a faixa para o Diretor na vitrine", () => {
    const loja = fontes["LojaEquilibrio.tsx"];
    const usos = loja.match(/<FaixaApresentacao\b/g) ?? [];
    expect(usos).toHaveLength(1);
    expect(loja).toMatch(/loja\.visao === "diretor" && tela === "vitrine" && <FaixaApresentacao\s*\/>/);
  });

  it("nenhum outro arquivo renderiza a faixa", () => {
    const outros = arquivos.filter((a) => a !== "LojaEquilibrio.tsx" && /<FaixaApresentacao\b/.test(fontes[a]));
    expect(outros).toEqual([]);
  });
});

/* ---- 10. Sem quadros numerados ---- */

describe("guarda 10: sem 'Como funciona' nem quadros 01/02/03", () => {
  // **Validates: Requirements 12.6**
  it.each(arquivos)("%s não exibe 'Como funciona', quadros numerados nem os títulos Escolha/Envie/Acompanhe", (arquivo) => {
    const { exibivel } = varrer(fontes[arquivo]);
    expect(exibivel).not.toMatch(/Como funciona/i);
    expect(exibivel).not.toMatch(/["'`]0[123]["'`]|>\s*0[123]\s*</);
    expect(exibivel).not.toMatch(/>\s*(?:Escolha|Envie|Acompanhe)\s*<|["'`](?:Escolha|Envie|Acompanhe)["'`]/);
  });
});

/* ---- 11. Preço ---- */

describe("guarda 11: preço visível ao diretor", () => {
  // **Validates: Requirements 10.1, 10.5, 10.6**
  it("PrecoBrinde tem os dois textos", () => {
    const preco = fontes["PrecoBrinde.tsx"];
    expect(preco).toContain("por unidade");
    expect(preco).toContain("Valor avaliado conforme a quantidade");
  });

  it.each(["CarrinhoPainel.tsx", "telas/solicitante/Revisao.tsx", "telas/solicitante/Vitrine.tsx", "telas/solicitante/PaginaBrinde.tsx", "telas/solicitante/Pedidos.tsx"])(
    "%s importa PrecoBrinde",
    (arquivo) => {
      expect(fontes[arquivo]).toMatch(/import\s*\{[^}]*\bPrecoBrinde\b[^}]*\}\s*from\s*"[^"]*PrecoBrinde"/);
    },
  );

  it.each(["CarrinhoPainel.tsx", "telas/solicitante/Revisao.tsx"])("%s mostra 'Mais itens a avaliar' (direto ou via TotalPedido)", (arquivo) => {
    const direto = fontes[arquivo].includes("Mais itens a avaliar");
    const viaTotal = /<TotalPedido\b/.test(fontes[arquivo]) && fontes["TotalPedido.tsx"].includes("Mais itens a avaliar");
    expect(direto || viaTotal).toBe(true);
  });

  it("as telas do diretor não leem saldo, reserva nem mínimo do brinde", () => {
    for (const a of arquivos.filter((x) => x.startsWith("telas/solicitante/") || x === "CarrinhoPainel.tsx" || x === "PrecoBrinde.tsx")) {
      expect({ a, le: /\.(?:saldo|reserva|minimo)\b/.test(varrer(fontes[a]).exibivel) }).toEqual({ a, le: false });
    }
  });
});

/* ---- 12. Faixa do seletor ---- */

describe("guarda 12: seletor de visão na FaixaSeletor", () => {
  // **Validates: Requirements 12.4**
  it("FaixaSeletor existe e o Cabecalho não tem o seletor", () => {
    expect(arquivos).toContain("FaixaSeletor.tsx");
    expect(fontes["FaixaSeletor.tsx"]).toContain("Ver o protótipo como");
    expect(fontes["Cabecalho.tsx"]).not.toContain("Ver o protótipo como");
  });
});

/* ---- 13. Contraste ---- */

describe("guarda 13: contraste da faixa sobre o navy", () => {
  // **Validates: Requirements 12.8**
  it("as constantes exportadas são exatamente as testadas", () => {
    expect({
      fundo: COR_FAIXA_FUNDO, texto: COR_FAIXA_TEXTO, destaque: COR_FAIXA_DESTAQUE, etiqueta: COR_FAIXA_ETIQUETA, subtitulo: COR_FAIXA_SUBTITULO,
    }).toEqual({ fundo: "#36499b", texto: "#ffffff", destaque: "#ff7a3d", etiqueta: "#ffb88f", subtitulo: "#e8ecfb" });
    expect(COR_FAIXA_CANTO).toBe("#17234f");
    const faixa = fontes["FaixaApresentacao.tsx"];
    for (const hex of ["#36499b", "#17234f", "#ffffff", "#ff7a3d", "#ffb88f", "#e8ecfb"]) expect(faixa).toContain(`"${hex}"`);
  });

  it("título grande tem 3:1 ou mais e textos pequenos 4,5:1 ou mais no ponto mais claro e no canto escuro", () => {
    for (const fundo of [COR_FAIXA_FUNDO, COR_FAIXA_CANTO]) {
      for (const cor of [COR_FAIXA_TEXTO, COR_FAIXA_DESTAQUE]) {
        expect(razaoDeContraste(cor, fundo)).toBeGreaterThanOrEqual(CONTRASTE_MINIMO_TEXTO_GRANDE);
      }
      for (const cor of [COR_FAIXA_ETIQUETA, COR_FAIXA_SUBTITULO, COR_FAIXA_TEXTO]) {
        expect(razaoDeContraste(cor, fundo)).toBeGreaterThanOrEqual(CONTRASTE_MINIMO_TEXTO_PEQUENO);
      }
    }
  });

  it("o degradê usa quatro radiais nos cantos, sem arcos nem SVG decorativo", () => {
    const faixa = fontes["FaixaApresentacao.tsx"];
    expect(faixa).toContain("radial-gradient");
    for (const posicao of ["0% 0%", "100% 0%", "0% 100%", "100% 100%"]) expect(faixa).toContain(`"${posicao}"`);
    expect(faixa).not.toMatch(/<svg|<circle/i);
  });
});

/* ---- 14. Movimento ---- */

describe("guarda 14: movimento da faixa respeita prefers-reduced-motion", () => {
  // **Validates: Requirements 12.7**
  it("animate- e transition em FaixaApresentacao vêm com motion-reduce:", () => {
    const { exibivel } = varrer(fontes["FaixaApresentacao.tsx"]);
    if (/animate-|transition/.test(exibivel)) expect(exibivel).toContain("motion-reduce:");
    else expect(exibivel).not.toMatch(/animate-|transition/);
  });
});
