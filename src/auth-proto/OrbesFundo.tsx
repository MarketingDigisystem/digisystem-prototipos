// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (tela de Auth "liquid glass") @ decisão 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/prototipo-auth/.
//
// Fundo da tela de Auth: azul Reflex da marca com esferas (orbes) em azul mais
// escuro flutuando devagar. Alguns ficam parcialmente ATRÁS do cartão (profundidade).
// Só anima transform/opacity; prefers-reduced-motion deixa tudo parado (ver css).

import { cn } from "@/lib/utils";

type Orbe = {
  /** posição/tamanho em % ou px via style inline */
  style: React.CSSProperties;
  /** classe de deriva (a/b/c/d) + variante de brilho */
  classe: string;
};

// 5 esferas de tamanhos diferentes, em camadas. As grandes/borradas ficam ao
// fundo; as com brilho de topo dão volume de esfera. Posições pensadas para
// algumas passarem por trás e um pouco além das bordas do cartão central.
const ORBES: Orbe[] = [
  // grande, atrás e à esquerda, suave
  { classe: "auth-orbe-liso auth-orbe-b", style: { width: 420, height: 420, top: "-8%", left: "-10%" } },
  // média, canto inferior direito, com brilho
  { classe: "auth-orbe-a", style: { width: 320, height: 320, bottom: "-12%", right: "-6%" } },
  // menor, alta à direita, com brilho
  { classe: "auth-orbe-d", style: { width: 180, height: 180, top: "10%", right: "14%" } },
  // média-grande, baixa à esquerda, suave
  { classe: "auth-orbe-liso auth-orbe-c", style: { width: 260, height: 260, bottom: "4%", left: "6%" } },
  // pequena, centro-alto (passa por trás do topo do cartão)
  { classe: "auth-orbe-a", style: { width: 130, height: 130, top: "18%", left: "40%" } },
];

export function OrbesFundo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {ORBES.map((o, i) => (
        <div key={i} className={cn("auth-orbe", o.classe)} style={o.style} />
      ))}
    </div>
  );
}
