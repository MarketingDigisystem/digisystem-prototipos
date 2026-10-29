// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Símbolo oficial da IA Digisystem — cacho de bolinhas (azul reflex + laranja +
// azul-claro) que se comporta como um pequeno sistema planetário: as menores
// orbitam as maiores. É a identidade visual da IA — nunca sparkles/genérico.
//
// v2 (2026-09-22): reescrito como MÁQUINA DE ESTADOS contínua (rAF), não mais um
// estático "parado com respiro". Sempre vivo:
//   - estado "vivo"        → satélites em micro-órbita LENTA e contínua + leve
//                            pulso no planeta laranja. É a assinatura viva
//                            (substitui o antigo PNG parado).
//   - estado "processando" → as órbitas ACELERAM (algo trabalhando). A
//                            velocidade INTERPOLA suavemente entre estados, então
//                            acelerar/desacelerar é fluido (sem salto).
//   - animarEntrada        → antes de cair no loop do estado, roda a coreografia
//                            de "surgir" (bolinhas nascem do centro e assentam).
//
// Fluxo do assistente (carrossel/templates): abre em "vivo" (devagar) → clica
// Gerar vira "processando" (rápido) → termina volta a "vivo" (desacelera).

import { useEffect, useRef, useState } from "react";
import { cn } from "./lib/utils";

const AZUL = "var(--navy)";
const LARANJA = "var(--accent)";
const SKY = "var(--sky)";

const CX = 32;
const CY = 32;

type Bolinha = {
  r: number;
  cor: string;
  fx: number; // âncora (posição de repouso) relativa ao centro
  fy: number;
  aparece: number; // ordem de surgimento na coreografia de entrada (ms)
  orbitaDe?: number; // índice do planeta que este satélite orbita
  raio?: number; // raio da órbita (repouso)
  vel?: number; // rad/s base (repouso). Sinal = sentido.
  fase?: number; // ângulo inicial (rad)
};

const IDX_LARANJA = 1;

// 0 e 1 são "planetas" (azul grande + laranja médio). 2,3,4 são satélites.
const BOLINHAS: Bolinha[] = [
  { r: 12, cor: AZUL, fx: -6, fy: 2, aparece: 0 },
  { r: 8, cor: LARANJA, fx: 9, fy: -6, aparece: 60 },
  { r: 4.5, cor: SKY, fx: 13, fy: 9, aparece: 260, orbitaDe: 0, raio: 17, vel: 0.55, fase: 0 },
  { r: 3.2, cor: LARANJA, fx: -13, fy: 12, aparece: 380, orbitaDe: 0, raio: 21, vel: -0.42, fase: 2.1 },
  { r: 2.6, cor: AZUL, fx: 3, fy: 15, aparece: 500, orbitaDe: 1, raio: 12, vel: 0.7, fase: 4.2 },
];

const NASCE_LARANJA = { x: CX - 2, y: CY - 1 };

// Coreografia de entrada (só quando animarEntrada)
const T_SURGIR = 800;
const T_ALINHAR = 1400;
const T_ASSENTAR = 2600; // entrada mais curta; o "vivo" assume depois

// Multiplicadores de velocidade por estado (interpolados suavemente).
const VEL_VIVO = 1; // órbita lenta (rad/s já são baixos nas bolinhas)
const VEL_PROCESSANDO = 5.5; // acelera bastante ao gerar

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type IaEstado = "vivo" | "processando";

export function IaDigisystem({
  size = 64,
  estado = "vivo",
  animarEntrada = false,
  className,
}: {
  size?: number;
  estado?: IaEstado;
  animarEntrada?: boolean;
  className?: string;
}) {
  const finais = BOLINHAS.map((b) => ({ x: CX + b.fx, y: CY + b.fy }));

  const [, force] = useState(0);
  const t0 = useRef(performance.now());
  const raf = useRef(0);
  // Ângulo acumulado de cada satélite (integramos a velocidade no tempo, para
  // que a mudança de velocidade não cause salto de posição).
  const ang = useRef<number[]>(BOLINHAS.map((b) => b.fase ?? 0));
  // Multiplicador de velocidade atual (interpola em direção ao alvo do estado).
  const velMul = useRef(estado === "processando" ? VEL_PROCESSANDO : VEL_VIVO);
  const last = useRef(performance.now());
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    t0.current = performance.now();
    last.current = performance.now();
    const loop = () => {
      force((n) => (n + 1) % 1_000_000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const now = performance.now();
  const dt = Math.min(0.05, (now - last.current) / 1000); // s, capado p/ evitar saltos
  last.current = now;
  const elapsed = now - t0.current;

  // Interpola o multiplicador de velocidade em direção ao alvo do estado (fluido).
  const alvo = estado === "processando" ? VEL_PROCESSANDO : VEL_VIVO;
  velMul.current = lerp(velMul.current, alvo, clamp01(dt * 3.5));

  // Progresso da coreografia de entrada (se ligada).
  const entrando = animarEntrada && elapsed < T_ASSENTAR && !reduced.current;

  const pos = BOLINHAS.map((b, i) => {
    const fim = finais[i];

    // Surgir (fade + escala) — só durante a entrada.
    const apareceu = entrando ? clamp01((elapsed - b.aparece) / 350) : 1;
    const opacity = apareceu;
    const escala = entrando ? lerp(0.2, 1, easeOut(apareceu)) : 1;

    // Integra o ângulo dos satélites (mesmo durante a entrada, devagar).
    if (b.orbitaDe !== undefined && !reduced.current) {
      ang.current[i] += (b.vel ?? 0.5) * velMul.current * dt;
    }

    // Planetas (0 e 1): durante a entrada viajam do centro à âncora; depois ficam.
    if (b.orbitaDe === undefined) {
      if (entrando) {
        const origem = i === IDX_LARANJA ? NASCE_LARANJA : { x: CX, y: CY };
        const alvoT = i === IDX_LARANJA ? T_ASSENTAR : T_ALINHAR;
        const t = clamp01((elapsed - b.aparece) / (alvoT - b.aparece));
        return {
          x: lerp(origem.x, fim.x, easeOut(t)),
          y: lerp(origem.y, fim.y, easeOut(t)),
          r: b.r * escala,
          cor: b.cor,
          opacity,
        };
      }
      // O planeta LARANJA não fica parado colado no azul: ganha uma DERIVA
      // orgânica contínua em torno da âncora (duas senoides de períodos
      // diferentes = movimento tipo Lissajous, natural e não repetitivo). Mais
      // amplitude ao processar. Os demais planetas ficam firmes na âncora.
      if (i === IDX_LARANJA && !reduced.current) {
        const s = elapsed / 1000;
        const amp = estado === "processando" ? 5.5 : 3.2;
        const dx = Math.sin(s * 0.7) * amp + Math.sin(s * 1.9 + 1.3) * (amp * 0.4);
        const dy = Math.cos(s * 0.9 + 0.5) * amp + Math.sin(s * 1.5) * (amp * 0.35);
        return { x: fim.x + dx, y: fim.y + dy, r: b.r * escala, cor: b.cor, opacity };
      }
      return { x: fim.x, y: fim.y, r: b.r, cor: b.cor, opacity };
    }

    // Satélites: orbitam a âncora do planeta. Durante a entrada, o raio "abre"
    // do centro; depois é a órbita contínua do estado vivo/processando.
    const planeta = finais[b.orbitaDe];
    const a = reduced.current ? (b.fase ?? 0) : ang.current[i];
    const abertura = entrando ? easeOut(clamp01((elapsed - b.aparece) / (T_ASSENTAR - b.aparece))) : 1;
    const raio = (b.raio ?? 14) * abertura;
    return {
      x: planeta.x + Math.cos(a) * raio,
      y: planeta.y + Math.sin(a) * raio,
      r: b.r * escala,
      cor: b.cor,
      opacity,
    };
  });

  // Pulso sutil no planeta laranja (destaque vivo) — mais forte ao processar.
  const pulso =
    reduced.current
      ? 1
      : 1 + (estado === "processando" ? 0.08 : 0.04) * Math.sin((elapsed / 1000) * (estado === "processando" ? 6 : 2.2));

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={estado === "processando" ? "IA Digisystem processando" : "IA Digisystem"}
    >
      {pos.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === IDX_LARANJA ? p.r * pulso : p.r}
          fill={p.cor}
          opacity={p.opacity}
        />
      ))}
    </svg>
  );
}
