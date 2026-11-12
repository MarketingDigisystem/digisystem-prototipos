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
