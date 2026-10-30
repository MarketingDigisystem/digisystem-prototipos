// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// UI limpa (sem banner) para refino visual — proveniência vive no código/README.
// Protótipos ATIVOS (dois, com seletor): tela de Auth "liquid glass" e a loja DigiPlace.
//   Decisões de design: .agents/tasks/prototipo-auth/ e .agents/tasks/digiplace-v4/.
// Outros protótipos antigos (trocar aqui para rever):
//   import { HubNovo } from "./hub/HubNovo";                // nova interface completa do Hub
//   import { PlanejamentoAntiAI } from "./PlanejamentoAntiAI"; // até 2026-10-07
//   import { MP01Page } from "./MP01Page";                 // devolver ao solicitante
import { useEffect, useState } from "react";
import { AuthProto } from "./auth-proto/AuthProto";
import { LojaBrindes } from "./LojaBrindes";

type ProtoId = "auth" | "digiplace";

const PROTOTIPOS: { id: ProtoId; rotulo: string }[] = [
  { id: "digiplace", rotulo: "DigiPlace" },
  { id: "auth", rotulo: "Login (Auth)" },
];

// Lê a escolha do hash (#auth / #digiplace) para o link carregar direto no protótipo certo.
function protoDoHash(): ProtoId {
  const h = window.location.hash.replace("#", "");
  return h === "auth" || h === "digiplace" ? h : "digiplace";
}

export function App() {
  const [proto, setProto] = useState<ProtoId>(protoDoHash);

  useEffect(() => {
    const aoMudarHash = () => setProto(protoDoHash());
    window.addEventListener("hashchange", aoMudarHash);
    return () => window.removeEventListener("hashchange", aoMudarHash);
  }, []);

  function escolher(id: ProtoId) {
    window.location.hash = id;
    setProto(id);
  }

  return (
    <>
      {/* Seletor de protótipo — só do protótipo, para ver os dois no mesmo link. */}
      <div
        style={{
          position: "fixed",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 9999,
          background: "rgba(17,24,39,0.72)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        {PROTOTIPOS.map((p) => {
          const ativo = proto === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => escolher(p.id)}
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 9999,
                padding: "6px 14px",
                fontFamily: "'Dosis', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: ativo ? "#36499b" : "rgba(255,255,255,0.85)",
                background: ativo ? "#ffffff" : "transparent",
                transition: "all .15s",
              }}
            >
              {p.rotulo}
            </button>
          );
        })}
      </div>

      {proto === "auth" ? <AuthProto /> : <LojaBrindes />}
    </>
  );
}
