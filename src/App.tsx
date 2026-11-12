// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// UI limpa (sem banner) para refino visual — a proveniência vive no código e no README.
// Este app tem dois protótipos (decisão do usuário, 2026-11-11: "apenas o Digistore e login"):
//   - Digi Store (src/loja-equilibrio/), rota #/loja-equilibrio. É a rota padrão.
//   - Login (src/auth-proto/), rota #/auth.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ e .kiro/specs/loja-equilibrio-digiplace/.
// Os demais protótipos (DigiPlace, Digi Store antiga, Redes, Estúdio, Hub) foram removidos; o histórico
// está no repositório publicado digisystem-prototipos.
import { useEffect, useState } from "react";
import { AuthProto } from "./auth-proto/AuthProto";
import { LojaEquilibrio } from "./loja-equilibrio/LojaEquilibrio";

type ProtoId = "auth" | "loja-equilibrio";

const PROTOTIPOS: { id: ProtoId; rotulo: string }[] = [
  { id: "loja-equilibrio", rotulo: "Digi Store" },
  { id: "auth", rotulo: "Login" },
];

const ROTA_PADRAO = "#/loja-equilibrio";

// Primeiro segmento do hash: "#/loja-equilibrio/brinde/x?a=1" -> "loja-equilibrio". Hash vazio -> "".
function raizDoHash(): string {
  return window.location.hash.replace(/^#\/?/, "").split(/[/?]/)[0];
}

// Hash vazio não precisa de redirecionamento (a Digi Store é o padrão). Qualquer outra raiz que não seja
// "auth" nem "loja-equilibrio" é um link antigo (#/loja-digi-store, #/digiplace, #/loja, #/loja-brindes,
// #/redes, #/estudio-*...) e vai para a Digi Store. A raiz "loja-equilibrio" é válida, então não há laço.
function ehLinkAntigo(): boolean {
  const raiz = raizDoHash();
  return raiz !== "" && raiz !== "auth" && raiz !== "loja-equilibrio";
}

function protoDoHash(): ProtoId {
  return raizDoHash() === "auth" ? "auth" : "loja-equilibrio";
}

// Antes da primeira renderização: troca o hash do link antigo sem criar entrada no histórico e sem
// disparar hashchange. As telas leem o hash ao montar, então já veem a rota nova.
function protoInicial(): ProtoId {
  if (ehLinkAntigo()) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${ROTA_PADRAO}`);
  }
  return protoDoHash();
}

export function App() {
  const [proto, setProto] = useState<ProtoId>(protoInicial);

  useEffect(() => {
    const aoMudarHash = () => {
      if (ehLinkAntigo()) {
        // location.replace dispara um novo hashchange, que cai no ramo normal abaixo.
        window.location.replace(ROTA_PADRAO);
        return;
      }
      setProto(protoDoHash());
    };
    window.addEventListener("hashchange", aoMudarHash);
    return () => window.removeEventListener("hashchange", aoMudarHash);
  }, []);

  function escolher(id: ProtoId) {
    window.location.hash = id === "auth" ? "#/auth" : ROTA_PADRAO;
  }

  return (
    <>
      {/* Seletor Digi Store | Login. Oculto na Digi Store, que tem cabeçalho próprio no topo. */}
      {proto === "auth" && (
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

      {proto === "auth" ? <AuthProto /> : <LojaEquilibrio />}
    </>
  );
}
