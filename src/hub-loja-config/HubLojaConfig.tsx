// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: Hub src/hub/pages/loja/Loja.tsx (abas e gate de papel) @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
// Rota: #/hub-loja-config/<aba>[?propostas=0]. Aba = segmento 1 do hash; vazio ou desconhecido abre "metricas".
import { useEffect, useState } from "react";
import "../hub-loja/hub-loja.css";
import "./hub-loja-config.css";
import { ToastProvider } from "../hub-loja/ui";
import { CascaHub, type AbaConfig, type AbaLoja } from "./CascaHub";
import { FaixaPrototipo } from "./FaixaPrototipo";
// Extensão explícita: no Windows "./Metricas" resolveria metricas.ts (cálculos) antes de Metricas.tsx (tela); idem Acesso e Ponte.
import { ProtoProvider, useProto } from "./contexto";
import { PropostasProvider } from "./ui-config";
import { Metricas } from "./Metricas.tsx";
import { Retirada } from "./Retirada";
import { Acesso } from "./Acesso.tsx";
import { Ponte } from "./Ponte.tsx";

const ABAS_NOVAS: AbaConfig[] = ["metricas", "retirada", "acesso", "ponte"];

/** Segmento 1 depois da raiz: "#/hub-loja-config/acesso?propostas=0" -> "acesso". */
function segmentoDoHash(): string {
  return window.location.hash.replace(/^#\/?/, "").split("?")[0].split("/")[1] ?? "";
}
const abaValida = (s: string): s is AbaConfig => (ABAS_NOVAS as string[]).includes(s);

function propostasLigadas(): boolean {
  const q = window.location.hash.split("?")[1] ?? "";
  return new URLSearchParams(q).get("propostas") !== "0";
}
const consulta = () => {
  const q = window.location.hash.split("?")[1];
  return q ? `?${q}` : "";
};

/** Lê aba e propostas do hash e corrige hash vazio ou desconhecido com replaceState (sem criar histórico). */
function useRota() {
  const [rota, setRota] = useState(() => ({ seg: segmentoDoHash(), propostas: propostasLigadas() }));
  useEffect(() => {
    const f = () => setRota({ seg: segmentoDoHash(), propostas: propostasLigadas() });
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const aba: AbaConfig = abaValida(rota.seg) ? rota.seg : "metricas";
  useEffect(() => {
    if (!abaValida(rota.seg)) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/hub-loja-config/metricas${consulta()}`);
    }
  }, [rota.seg]);
  return { aba, propostas: rota.propostas };
}

export function HubLojaConfig() {
  const { aba, propostas } = useRota();
  return (
    <ProtoProvider propostas={propostas}>
      <PropostasProvider value={propostas}>
        <Miolo aba={aba} />
      </PropostasProvider>
    </ProtoProvider>
  );
}

function Miolo({ aba }: { aba: AbaConfig }) {
  const { papel, estado, setPapel, setEstado } = useProto();
  const abrirNova = (id: AbaConfig) => {
    window.location.hash = `#/hub-loja-config/${id}${consulta()}`;
  };
  const abrirAnterior = (id: AbaLoja) => {
    window.location.hash = `#/hub-loja/${id}`;
  };
  return (
    <ToastProvider>
      <div className="hlc min-h-screen bg-background font-sans text-foreground">
        <FaixaPrototipo aba={aba} estado={estado} papel={papel} aoMudarEstado={setEstado} aoMudarPapel={setPapel} />
        <CascaHub aba={aba} aoAbrirAbaNova={abrirNova} aoAbrirAbaAnterior={abrirAnterior}>
          {aba === "metricas" ? <Metricas /> : null}
          {aba === "retirada" ? <Retirada /> : null}
          {aba === "acesso" ? <Acesso /> : null}
          {aba === "ponte" ? <Ponte /> : null}
        </CascaHub>
      </div>
    </ToastProvider>
  );
}
