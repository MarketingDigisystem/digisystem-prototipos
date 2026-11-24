// PROTÓTIPO DESCARTÁVEL — não é o app. Estado em memória do protótipo (papel, estado forçado, mês, dados).
// Gerado de: design.md (Contexto e navegação) e dos hooks use*Loja do Clone_Fonte @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CONFIG_PADRAO } from "./config";
import {
  DADOS_MOCK,
  DIVERGENCIAS_INICIAL,
  ENVIADOS_INICIAL,
  FILA_INICIAL,
  MES_ATUAL,
  SOLICITANTES_INICIAIS,
  type ConfigLoja,
  type DadosMock,
  type Divergencia,
  type EstadoProto,
  type EventoFila,
  type Papel,
  type Solicitante,
} from "./dados";

export interface ProtoState {
  papel: Papel;
  /** Um só seletor para as 4 abas. Trocar estado ou papel não muda aba nem mês (a aba vive no hash). */
  estado: EstadoProto;
  /** "AAAA-MM", preservado ao trocar estado ou papel (Req. 8.9). */
  mes: string;
  /** Valores salvos da Retirada (em memória). O limite de pedido parado alimenta "Pedidos parados" da Métricas. */
  config: ConfigLoja;
  solicitantes: Solicitante[];
  fila: EventoFila[];
  /** Acumulado do contador "Enviados" (128 + reenvios bem-sucedidos da sessão). */
  enviados: number;
  ponteLigada: boolean;
  /** Divergências exibidas; null = ainda não reconciliado nesta sessão. */
  divergencias: Divergencia[] | null;
  /** Divergências reais entre Hub e Loja (o que o Reconciliar devolve até alguém resolver). */
  divergenciasReais: Divergencia[];
  /** Falso com `?propostas=0` (o selo e os blocos de Proposta nova somem). Vem de HubLojaConfig. */
  propostas: boolean;
}

export interface ProtoContextValue extends ProtoState {
  dados: DadosMock;
  setPapel: (p: Papel) => void;
  /** "ponte_desligada" também desliga a ponte; sair dela não religa sozinho. */
  setEstado: (e: EstadoProto) => void;
  setMes: (m: string | ((atual: string) => string)) => void;
  setConfig: (c: ConfigLoja) => void;
  setSolicitantes: (f: Solicitante[] | ((atual: Solicitante[]) => Solicitante[])) => void;
  setFila: (f: EventoFila[] | ((atual: EventoFila[]) => EventoFila[])) => void;
  setEnviados: (f: number | ((atual: number) => number)) => void;
  /** Ligar a ponte com o estado "ponte_desligada" ativo volta o estado para "normal". */
  setPonteLigada: (ligada: boolean) => void;
  setDivergencias: (d: Divergencia[] | null) => void;
  setDivergenciasReais: (d: Divergencia[] | ((atual: Divergencia[]) => Divergencia[])) => void;
}

const Ctx = createContext<ProtoContextValue | null>(null);

export function ProtoProvider({ children, propostas = true }: { children: ReactNode; propostas?: boolean }) {
  const [papel, setPapel] = useState<Papel>("admin");
  const [estado, setEstadoBruto] = useState<EstadoProto>("normal");
  const [mes, setMes] = useState<string>(MES_ATUAL);
  const [config, setConfig] = useState<ConfigLoja>(CONFIG_PADRAO);
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>(SOLICITANTES_INICIAIS);
  const [fila, setFila] = useState<EventoFila[]>(FILA_INICIAL);
  const [enviados, setEnviados] = useState<number>(ENVIADOS_INICIAL);
  const [ponteLigada, setPonteLigadaBruto] = useState<boolean>(true);
  const [divergencias, setDivergencias] = useState<Divergencia[] | null>(null);
  const [divergenciasReais, setDivergenciasReais] = useState<Divergencia[]>(DIVERGENCIAS_INICIAL);

  const setEstado = useCallback((e: EstadoProto) => {
    setEstadoBruto(e);
    if (e === "ponte_desligada") setPonteLigadaBruto(false);
  }, []);

  const setPonteLigada = useCallback((ligada: boolean) => {
    setPonteLigadaBruto(ligada);
    if (ligada) setEstadoBruto((atual) => (atual === "ponte_desligada" ? "normal" : atual));
  }, []);

  const valor = useMemo<ProtoContextValue>(
    () => ({
      papel,
      estado,
      mes,
      config,
      solicitantes,
      fila,
      enviados,
      ponteLigada,
      divergencias,
      divergenciasReais,
      propostas,
      dados: DADOS_MOCK,
      setPapel,
      setEstado,
      setMes,
      setConfig,
      setSolicitantes,
      setFila,
      setEnviados,
      setPonteLigada,
      setDivergencias,
      setDivergenciasReais,
    }),
    [papel, estado, mes, config, solicitantes, fila, enviados, ponteLigada, divergencias, divergenciasReais, propostas, setEstado, setPonteLigada],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

/** Contexto do protótipo. Só funciona dentro de `ProtoProvider`. */
export function useProto(): ProtoContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProto fora de ProtoProvider");
  return v;
}

export { Ctx as ProtoContext };
