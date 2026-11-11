// PROTÓTIPO DESCARTÁVEL — não é o app. Simulação da visão final em produção.
// Gerado de: src/lib/compose/{layers,template-a,template-b,template-c}.ts (descrição do compositor SVG),
//   src/components/estudio/TemplateLivePreview.tsx, src/lib/estudio-fonts.ts @ leitura 2026-10 (clone
//   mhdgst-trabalho, somente leitura). Fonte da verdade = clone real.
// Decisão: docs-marketing-hub/implementacao/pacote-refino-ux-estudio.md
//
// Composição SVG on-brand que imita a SAÍDA do compositor real (foto + overlay / bandas / carrossel),
// com a marca Digisystem (mock do logo), Dosis/Open Sans. As "fotos" são cenas SVG da marca (mock).
import { useId } from "react";
import { type Ajustes, type Estilo, type Formato, type Slide } from "./efData";

const W = 1080;

/* ---------------- cenas (mock de fotografia) ---------------- */
export function FotoSvg({
  idx,
  x = 0,
  y = 0,
  w = 400,
  h = 500,
  foco = 4,
}: {
  idx: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  foco?: number;
}) {
  const uid = "f" + useId().replace(/:/g, "");
  const fx = ["xMin", "xMid", "xMax"][foco % 3];
  const fy = ["YMin", "YMid", "YMax"][Math.floor(foco / 3)];
  const par = `${fx}${fy} slice` as const;
  const c = idx % 6;
  return (
    <svg x={x} y={y} width={w} height={h} viewBox="0 0 400 500" preserveAspectRatio={par}>
      <defs>
        <linearGradient id={`${uid}a`} x1="0" y1="0" x2="0" y2="1">
          {c === 0 && (<><stop offset="0" stopColor="#1f2a44" /><stop offset="1" stopColor="#36499b" /></>)}
          {c === 1 && (<><stop offset="0" stopColor="#3b4a8f" /><stop offset="0.6" stopColor="#ff9a5c" /><stop offset="1" stopColor="#ffd2a8" /></>)}
          {c === 2 && (<><stop offset="0" stopColor="#16203a" /><stop offset="1" stopColor="#2c3c80" /></>)}
          {c === 3 && (<><stop offset="0" stopColor="#bfeaf7" /><stop offset="1" stopColor="#67cfee" /></>)}
          {c === 4 && (<><stop offset="0" stopColor="#4a5fb3" /><stop offset="1" stopColor="#ffb37f" /></>)}
          {c === 5 && (<><stop offset="0" stopColor="#8fdcf2" /><stop offset="1" stopColor="#36499b" /></>)}
        </linearGradient>
        <radialGradient id={`${uid}b`} cx="0.7" cy="0.25" r="0.6">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${uid}a)`} />
      <rect width="400" height="500" fill={`url(#${uid}b)`} />
      {c === 0 &&
        [0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={20 + i * 76} y={80 + i * 10} width={58} height={420 - i * 10} rx="6" fill="#0f1830" opacity="0.8" />
            {Array.from({ length: 12 }).map((_, j) => (
              <rect key={j} x={28 + i * 76} y={100 + i * 10 + j * 28} width={42} height={6} rx="3" fill={j % 4 === 0 ? "#ff6d2d" : "#67cfee"} opacity={j % 3 === 0 ? 0.95 : 0.55} />
            ))}
          </g>
        ))}
      {c === 1 && (
        <>
          <circle cx="290" cy="300" r="46" fill="#fff3e6" opacity="0.85" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={i * 60 - 10} y={340 - ((i * 53) % 130)} width={54} height={400} fill="#1f2a44" opacity={0.85 - (i % 3) * 0.1} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) =>
            [0, 1, 2, 3].map((j) => (
              <rect key={`${i}${j}`} x={i * 60 + 4} y={380 - ((i * 53) % 130) + j * 26} width={9} height={10} fill="#ffd9a8" opacity="0.8" />
            )),
          )}
        </>
      )}
      {c === 2 && (
        <>
          {[[70, 120], [200, 80], [320, 160], [120, 260], [260, 280], [60, 400], [210, 420], [340, 380]].map(([px, py], i, arr) => {
            const n = arr[(i + 2) % arr.length];
            return <line key={`l${i}`} x1={px} y1={py} x2={n[0]} y2={n[1]} stroke="#67cfee" strokeOpacity="0.45" strokeWidth="2" />;
          })}
          {[[70, 120], [200, 80], [320, 160], [120, 260], [260, 280], [60, 400], [210, 420], [340, 380]].map(([px, py], i) => (
            <g key={i}>
              <circle cx={px} cy={py} r={i % 3 === 0 ? 16 : 10} fill={i % 3 === 0 ? "#ff6d2d" : "#67cfee"} />
              <circle cx={px} cy={py} r={i % 3 === 0 ? 28 : 20} fill="none" stroke="#ffffff" strokeOpacity="0.25" />
            </g>
          ))}
        </>
      )}
      {c === 3 && (
        <>
          <rect x="30" y="90" width="340" height="300" rx="22" fill="#ffffff" opacity="0.9" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={55 + i * 52} y={350 - (40 + ((i * 47) % 150))} width={34} height={40 + ((i * 47) % 150)} rx="8" fill={i === 3 ? "#ff6d2d" : "#36499b"} opacity={i === 3 ? 1 : 0.85} />
          ))}
          <rect x="55" y="112" width="120" height="12" rx="6" fill="#36499b" opacity="0.5" />
          <rect x="55" y="132" width="70" height="8" rx="4" fill="#67cfee" />
        </>
      )}
      {c === 4 && (
        <>
          {[110, 200, 290].map((px, i) => (
            <g key={i}>
              <circle cx={px} cy={250 + (i % 2) * 18} r="34" fill="#1f2a44" opacity="0.9" />
              <path d={`M${px - 62} 500 Q${px} ${330 + (i % 2) * 18} ${px + 62} 500 Z`} fill="#1f2a44" opacity="0.9" />
            </g>
          ))}
          <rect x="0" y="420" width="400" height="80" fill="#36499b" opacity="0.7" />
        </>
      )}
      {c === 5 && (
        <>
          <path d="M0 300 Q100 250 200 300 T400 300 V500 H0 Z" fill="#67cfee" opacity="0.55" />
          <path d="M0 360 Q100 310 200 360 T400 360 V500 H0 Z" fill="#36499b" opacity="0.65" />
          <path d="M0 430 Q100 390 200 430 T400 430 V500 H0 Z" fill="#1f2a44" opacity="0.85" />
          <ellipse cx="120" cy="160" rx="70" ry="26" fill="#ffffff" opacity="0.75" />
          <ellipse cx="260" cy="120" rx="54" ry="20" fill="#ffffff" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

/** Miniatura quadrada/retrato de uma cena, para grades de candidatas/acervo. */
export function FotoMini({ idx, className }: { idx: number; className?: string }) {
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <FotoSvg idx={idx} />
    </svg>
  );
}

/* ---------------- logo (mock) ---------------- */
function Logo({ sel, x, y, tam }: { sel: Ajustes["logoSel"]; x: number; y: number; tam: Ajustes["logoTam"] }) {
  const esc = tam === "P" ? 0.8 : tam === "G" ? 1.3 : 1;
  const mark = (
    <g>
      <circle cx="18" cy="26" r="13" fill={sel === "principal" ? "#36499b" : "#ffffff"} />
      <circle cx="40" cy="16" r="9" fill={sel === "principal" ? "#ff6d2d" : "#ffffff"} opacity={sel === "principal" ? 1 : 0.85} />
      <circle cx="44" cy="38" r="7" fill={sel === "principal" ? "#67cfee" : "#ffffff"} opacity={sel === "principal" ? 1 : 0.7} />
    </g>
  );
  const largura = sel === "icone" ? 62 : 250;
  const tx = (W * x) / 100;
  const ty = (W * y) / 100;
  return (
    <g transform={`translate(${tx} ${ty}) scale(${esc})`}>
      {sel === "principal" && <rect x="-10" y="-8" width={largura + 10} height="72" rx="22" fill="#ffffff" opacity="0.95" />}
      {mark}
      {sel !== "icone" && (
        <text x="64" y="44" fontFamily="'Dosis', sans-serif" fontWeight="800" fontSize="40" fill={sel === "principal" ? "#36499b" : "#ffffff"}>
          digisystem
        </text>
      )}
    </g>
  );
}

/* ---------------- utilitários de texto ---------------- */
export function quebrar(texto: string, max: number, maxLinhas = 4): string[] {
  const palavras = texto.trim().split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    if ((atual + " " + p).trim().length > max && atual) {
      linhas.push(atual);
      atual = p;
    } else atual = (atual + " " + p).trim();
  }
  if (atual) linhas.push(atual);
  if (linhas.length > maxLinhas) {
    const cortado = linhas.slice(0, maxLinhas);
    cortado[maxLinhas - 1] = cortado[maxLinhas - 1].replace(/.{0,1}$/, "…");
    return cortado;
  }
  return linhas;
}

function claro(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 190;
}

function fam(f: string): string {
  return `'${f}', 'Dosis', sans-serif`;
}

/* ---------------- canvas ---------------- */
export function ArteCanvas({
  estilo,
  formato,
  slide,
  indice,
  total,
  aj,
  className,
}: {
  estilo: Estilo;
  formato: Formato;
  slide: Slide;
  indice: number;
  total: number;
  aj: Ajustes;
  className?: string;
}) {
  const uid = "a" + useId().replace(/:/g, "");
  const H = estilo === "C" || formato === "feed" ? 1350 : 1920;
  const ehC = estilo === "C";
  const papel = ehC ? slide.papel : "capa";
  const temImg = slide.img !== null;

  const fotoNode = (x: number, y: number, w: number, h: number, extra?: { r?: number }) => {
    if (slide.img === null) return null;
    const content =
      typeof slide.img === "number" ? (
        <FotoSvg idx={slide.img} x={x} y={y} w={w} h={h} foco={slide.foco} />
      ) : (
        <image
          href={slide.img}
          x={x}
          y={y}
          width={w}
          height={h}
          preserveAspectRatio={`${["xMin", "xMid", "xMax"][slide.foco % 3]}${["YMin", "YMid", "YMax"][Math.floor(slide.foco / 3)]} slice`}
        />
      );
    if (!extra?.r) return content;
    return (
      <g clipPath={`url(#${uid}clip)`}>
        <clipPath id={`${uid}clip`}>
          <rect x={x} y={y} width={w} height={h} rx={extra.r} />
        </clipPath>
        {content}
      </g>
    );
  };

  /* fundo "marca" quando ainda não há imagem — nunca bloco cinza */
  const fundoMarca = (
    <g>
      <rect width={W} height={H} fill={`url(#${uid}marca)`} />
      <circle cx={W * 0.82} cy={H * 0.2} r={220} fill="#67cfee" opacity="0.18" />
      <circle cx={W * 0.12} cy={H * 0.55} r={300} fill="#ff6d2d" opacity="0.1" />
    </g>
  );

  /* posição do bloco de texto (A) */
  const alturaBloco = 560;
  let tx = (W * aj.posX) / 100;
  let ty = H - alturaBloco - 90;
  let largPct = aj.posL;
  if (aj.posModo === "basico") {
    tx = W * 0.08;
    largPct = 84;
    ty = aj.posPreset === "topo" ? 200 : aj.posPreset === "centro" ? (H - alturaBloco) / 2 : H - alturaBloco - 90;
  } else {
    ty = ((H - alturaBloco) * aj.posY) / 100;
  }
  const largTexto = (W * largPct) / 100;

  const tSize = aj.tamTitulo;
  const sSize = aj.tamSub;
  const corT = ehC && claro(papel === "miolo" ? slide.bg : papel === "cta" ? slide.bg : "#36499b") ? "#1f2a44" : aj.corTitulo;
  const corS = ehC && claro(slide.bg) && papel !== "capa" ? "#36499b" : aj.corSub;

  const tituloLinhas = quebrar(slide.titulo || "Seu título aqui", Math.max(8, Math.floor(largTexto / (tSize * 0.46))), 3);
  const subLinhas = slide.subtitulo ? quebrar(slide.subtitulo, Math.max(10, Math.floor(largTexto / (sSize * 0.52))), 3) : [];

  const bloco = (x: number, y: number, larg: number, ordemTituloAcima: boolean, alinhar: "start" | "middle" = "start") => {
    const itens: { k: "t" | "s"; linhas: string[] }[] = [];
    const t = { k: "t" as const, linhas: tituloLinhas };
    const s = { k: "s" as const, linhas: subLinhas };
    if (ordemTituloAcima) itens.push(t, s);
    else itens.push(s, t);
    let cy = y;
    const out: React.ReactNode[] = [];
    if (slide.etiqueta) {
      const wTag = 40 + slide.etiqueta.length * 19;
      out.push(
        <g key="tag">
          <rect x={alinhar === "middle" ? x + larg / 2 - wTag / 2 : x} y={cy} width={wTag} height={50} rx={25} fill="#ff6d2d" />
          <text x={alinhar === "middle" ? x + larg / 2 : x + wTag / 2} y={cy + 34} textAnchor="middle" fontFamily="'Dosis', sans-serif" fontWeight="800" fontSize="28" fill="#ffffff" letterSpacing="1.2">
            {slide.etiqueta.toUpperCase()}
          </text>
        </g>,
      );
      cy += 84;
    }
    for (const it of itens) {
      if (it.linhas.length === 0) continue;
      const size = it.k === "t" ? tSize : sSize;
      const lh = size * (it.k === "t" ? 1.05 : 1.3);
      if (it.k === "s" && aj.destaque) {
        const maxLen = Math.max(...it.linhas.map((l) => l.length));
        const wBadge = Math.min(larg, maxLen * size * 0.52 + 40);
        out.push(
          <rect key="dest" x={alinhar === "middle" ? x + larg / 2 - wBadge / 2 : x - 16} y={cy - 6} width={wBadge} height={it.linhas.length * lh + 22} rx={16} fill={aj.destaqueCor} opacity="0.95" />,
        );
        cy += 14;
      }
      out.push(
        <text
          key={it.k}
          x={alinhar === "middle" ? x + larg / 2 : x}
          y={cy + size * 0.92}
          textAnchor={alinhar}
          fontFamily={fam(it.k === "t" ? aj.fonteTitulo : aj.fonteSub)}
          fontWeight={it.k === "t" ? 800 : 500}
          fontSize={size}
          fill={it.k === "t" ? corT : corS}
        >
          {it.linhas.map((l, i) => (
            <tspan key={i} x={alinhar === "middle" ? x + larg / 2 : x} dy={i === 0 ? 0 : lh}>
              {l}
            </tspan>
          ))}
        </text>,
      );
      cy += it.linhas.length * lh + (it.k === "t" ? 22 : 0) + (it.k === "s" && aj.destaque ? 18 : 0);
    }
    return <g>{out}</g>;
  };

  /* gradiente do overlay */
  const vet = {
    up: { x1: 0, y1: 1, x2: 0, y2: 0.25 },
    down: { x1: 0, y1: 0, x2: 0, y2: 0.75 },
    right: { x1: 0, y1: 0, x2: 1, y2: 0 },
    diag: { x1: 0, y1: 0, x2: 1, y2: 1 },
  }[aj.degDir];
  const ini = aj.degMarca ? "#1f2a44" : aj.degIni;
  const fim = aj.degMarca ? "#36499b" : aj.degFim;
  const op = aj.degInt / 100;

  const mostrarLogo = !ehC || aj.logoCarrossel || papel === "capa";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="Prévia da arte">
      <defs>
        <linearGradient id={`${uid}marca`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#36499b" />
          <stop offset="1" stopColor="#1f2a44" />
        </linearGradient>
        <linearGradient id={`${uid}deg`} x1={vet.x1} y1={vet.y1} x2={vet.x2} y2={vet.y2}>
          <stop offset="0" stopColor={ini} stopOpacity={op} />
          <stop offset="1" stopColor={fim} stopOpacity={op * 0.04} />
        </linearGradient>
      </defs>

      {/* ---------- Estilo A (e capa do carrossel): foto + overlay ---------- */}
      {(estilo === "A" || (ehC && papel === "capa")) && (
        <g>
          {temImg ? fotoNode(0, 0, W, H) : fundoMarca}
          <rect width={W} height={H} fill={`url(#${uid}deg)`} />
          {bloco(tx, ty, largTexto, aj.tituloAcima)}
          {ehC && (
            <g transform={`translate(${W - 250} ${H - 110})`}>
              <text fontFamily="'Dosis', sans-serif" fontWeight="700" fontSize="34" fill="#ffffff" opacity="0.9">
                arraste →
              </text>
            </g>
          )}
        </g>
      )}

      {/* ---------- Estilo B: bandas / fundo sólido ---------- */}
      {estilo === "B" && (
        <g>
          <rect width={W} height={H} fill="#36499b" />
          {temImg ? fotoNode(0, 0, W, H * 0.62) : (
            <g>
              <rect width={W} height={H * 0.62} fill={`url(#${uid}marca)`} />
              <circle cx={W * 0.8} cy={H * 0.18} r={200} fill="#67cfee" opacity="0.2" />
            </g>
          )}
          <rect y={H * 0.62} width={W} height={14} fill="#ff6d2d" />
          {bloco(W * 0.08, H * 0.62 + 64, W * 0.84, aj.tituloAcima)}
        </g>
      )}

      {/* ---------- Estilo C: miolo ---------- */}
      {ehC && papel === "miolo" && (
        <g>
          <rect width={W} height={H} fill={slide.bg} />
          <circle cx={W * 0.9} cy={H * 0.08} r={260} fill="#67cfee" opacity="0.15" />
          {bloco(W * 0.08, 150, W * 0.84, true)}
          {temImg ? fotoNode(W * 0.08, H * 0.52, W * 0.84, H * 0.38, { r: 36 }) : (
            <rect x={W * 0.08} y={H * 0.52} width={W * 0.84} height={H * 0.38} rx={36} fill="#ffffff" opacity="0.12" />
          )}
        </g>
      )}

      {/* ---------- Estilo C: CTA ---------- */}
      {ehC && papel === "cta" && (
        <g>
          <rect width={W} height={H} fill={slide.bg} />
          <circle cx={W * 0.15} cy={H * 0.9} r={320} fill="#ffffff" opacity="0.1" />
          {bloco(W * 0.08, H * 0.26, W * 0.84, true, "middle")}
          <rect x={W / 2 - 280} y={H * 0.66} width={560} height={110} rx={55} fill={slide.ctaBg} />
          <text x={W / 2} y={H * 0.66 + 70} textAnchor="middle" fontFamily="'Dosis', sans-serif" fontWeight="800" fontSize="44" fill={slide.ctaFg}>
            {slide.ctaTexto || "Fale com a Digisystem"}
          </text>
        </g>
      )}

      {ehC && (
        <text x={64} y={H - 56} fontFamily="'Dosis', sans-serif" fontWeight="700" fontSize="34" fill="#ffffff" opacity="0.9">
          {indice + 1}/{total}
        </text>
      )}

      {mostrarLogo && <Logo sel={aj.logoSel} x={aj.logoX} y={aj.logoY} tam={aj.logoTam} />}
    </svg>
  );
}

