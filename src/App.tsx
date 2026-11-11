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
import { EstudioConteudo } from "./estudio-conteudo/EstudioConteudo";
import { OpcaoDPopover } from "./estudio-conteudo/OpcaoDPopover";
import { EstudioFinal } from "./estudio-final/EstudioFinal";
import { LojaDigiStore } from "./loja-digi-store/LojaDigiStore";

type ProtoId = "auth" | "digiplace" | "estudio-conteudo" | "estudio-opcao-d" | "estudio-final" | "loja-digi-store";

const PROTOTIPOS: { id: ProtoId; rotulo: string }[] = [
  { id: "estudio-conteudo", rotulo: "Estúdio — Conteúdo + Arte" },
  { id: "estudio-opcao-d", rotulo: "Estúdio — Opção D (popover)" },
  { id: "estudio-final", rotulo: "Estúdio — Visão final (produção)" },
  { id: "digiplace", rotulo: "DigiPlace" },
  { id: "loja-digi-store", rotulo: "Digi Store" },
  { id: "auth", rotulo: "Login (Auth)" },
];

// Lê a escolha do hash (#auth / #digiplace / #estudio-conteudo) para o link
// carregar direto no protótipo certo. O hash router aceita "#/estudio-conteudo"
// (com barra) e "#estudio-conteudo" — normalizamos removendo a barra inicial.
function protoDoHash(): ProtoId {
  // Primeiro segmento do hash: "loja-digi-store/pedidos?estado=vazio" -> "loja-digi-store".
  const h = window.location.hash.replace(/^#\/?/, "").split(/[/?]/)[0];
  if (h === "auth" || h === "digiplace" || h === "estudio-conteudo" || h === "estudio-opcao-d" || h === "estudio-final" || h === "loja-digi-store") return h;
  return "digiplace";
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
      {/* Seletor de protótipo — só do protótipo. Oculto na Digi Store para não cobrir o cabeçalho (trocar via hash). */}
      {proto !== "loja-digi-store" && (
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
      )}

      {proto === "auth" ? (
        <AuthProto />
      ) : proto === "estudio-conteudo" ? (
        <EstudioConteudo />
      ) : proto === "estudio-opcao-d" ? (
        <OpcaoDPopover />
      ) : proto === "estudio-final" ? (
        <EstudioFinal />
      ) : proto === "loja-digi-store" ? (
        <LojaDigiStore />
      ) : (
        <LojaBrindes />
      )}
    </>
  );
}


