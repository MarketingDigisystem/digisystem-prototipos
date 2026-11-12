// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/LojaDigiStore.tsx (casca e roteamento), lido em 2026-11-11; reescrito aqui, sem importar dele.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Casca: cabeçalho com âncora fixa + Seletor_de_Visao, rota interna e placeholders das telas (as reais vêm nas tarefas 4.x e 5.x).

import { useEffect, type ReactNode } from "react";
import { Cabecalho } from "./Cabecalho";
import { CarrinhoPainel } from "./CarrinhoPainel";
import { href, useRota, type Tela } from "./rota";
import { Gestao } from "./telas/gestao/Gestao";
import { PaginaBrinde } from "./telas/solicitante/PaginaBrinde";
import { Pedidos } from "./telas/solicitante/Pedidos";
import { Revisao } from "./telas/solicitante/Revisao";
import { Sugerir } from "./telas/solicitante/Sugerir";
import { Vitrine } from "./telas/solicitante/Vitrine";
import { LojaProvider, useLoja } from "./store";
import "./equilibrio.css";

function Placeholder({ titulo, texto, children }: { titulo: string; texto: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border bg-card p-6 shadow-card sm:p-8">
        <h1 className="font-display text-3xl font-bold text-navy">{titulo}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{texto}</p>
        {children}
      </div>
    </section>
  );
}

function Corpo({ t }: { t: Tela }) {
  switch (t.tela) {
    case "vitrine":
      return <Vitrine />;
    case "brinde":
      return <PaginaBrinde slug={t.slug} />;
    case "pedidos":
      return <Pedidos />;
    case "revisao":
      return <Revisao />;
    case "sugerir":
      return <Sugerir />;
    case "gestao":
      return <Gestao aba={t.aba} />;
    default:
      return (
        <Placeholder titulo="Página não encontrada" texto="Esse endereço não existe na Digi Store.">
          <a href={href("")} className="mt-5 inline-flex h-11 items-center rounded-full bg-navy px-5 font-display text-sm font-bold text-white">
            Ver brindes
          </a>
        </Placeholder>
      );
  }
}

function Casca() {
  const rota = useRota();
  const loja = useLoja();
  const { tela } = rota.t;

  // Link direto manda na visão: só reage quando a ROTA muda (não quando as pills trocam a visão).
  useEffect(() => {
    if (tela === "gestao" && loja.visao !== "gestao") loja.trocarVisao("gestao");
    else if ((tela === "vitrine" || tela === "brinde" || tela === "pedidos" || tela === "revisao" || tela === "sugerir") && loja.visao !== "diretor") loja.trocarVisao("diretor");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tela]);

  return (
    <div className="le-root">
      <Cabecalho rota={rota} />
      <main>
        <Corpo t={rota.t} />
      </main>
      <CarrinhoPainel />
    </div>
  );
}

export function LojaEquilibrio() {
  return (
    <LojaProvider>
      <Casca />
    </LojaProvider>
  );
}
