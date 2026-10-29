// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// UI limpa (sem banner) para refino visual — proveniência vive no código/README.
// Protótipo ATIVO: nova interface completa do Hub (hub-novo, em construção).
// Decisão: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
// Trocar o import abaixo para rever outro protótipo:
//   import { HubNovo } from "./hub/HubNovo";                // nova interface completa do Hub
//   import { PlanejamentoAntiAI } from "./PlanejamentoAntiAI"; // import anterior (até 2026-10-07)
//   import { ModalAprovacaoRefino } from "./ModalAprovacaoRefino"; // até 2026-10-06
//   import { MP01Page } from "./MP01Page";                 // devolver ao solicitante
//   import { TextGenerateDemo } from "./TextGenerateDemo";  // efeito de texto
//   import { AdminPage } from "./AdminPage";                // admin consolidado (consumido)
// Protótipo ATIVO: Mini Loja de Brindes (conceito novo, 2026-10-29).
import { LojaBrindes } from "./LojaBrindes";

export function App() {
  return <LojaBrindes />;
}
