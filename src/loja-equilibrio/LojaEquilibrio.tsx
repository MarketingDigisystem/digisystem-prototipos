// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: loja-digi-store/LojaDigiStore.tsx (casca e roteamento), lido em 2026-11-11; reescrito aqui, sem importar dele.
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design correspondente: .agents/tasks/loja-equilibrio/ (relatorio.md) e .kiro/specs/loja-equilibrio-digiplace/design.md.
//
// Casca: cabeçalho com âncora fixa + Seletor_de_Visao, rota interna e placeholders das telas (as reais vêm nas tarefas 4.x e 5.x).

import { useEffect, useRef, type ReactNode } from "react";
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
          <a href={href("")} className="mt-5 inline-flex h-11 items-center rounded-full bg-navy px-5 font-display text-sm font-bold text-navy-foreground">
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

  // Trocar de tela (A-06): volta ao topo sem animação e leva o foco ao <main>, para leitor de tela e teclado começarem no conteúdo novo.
  // Filtros e buscas dentro da mesma tela não passam por aqui. A primeira montagem não rouba o foco.
  const principal = useRef<HTMLElement>(null);
  const primeira = useRef(true);
  const aba = rota.t.tela === "gestao" ? rota.t.aba : "";
  const slug = rota.t.tela === "brinde" ? rota.t.slug : "";
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    principal.current?.focus({ preventScroll: true });
  }, [tela, aba, slug]);

  return (
    <div className="le-root">
      <Cabecalho rota={rota} />
      <main ref={principal} tabIndex={-1} className="focus:outline-none">
        {/*
          Troca de tela e de visão (10.3): o conteúdo entra com fade + translateY(8px → 0). A chave é a rota (tela + slug + aba);
          as pills Diretor/Gestão sempre navegam junto com a troca de visão, então a chave da rota já cobre a troca de visão
          sem remontar duas vezes. O cabeçalho fica fora do bloco, então não anima.
        */}
        <div key={`${tela}|${slug}|${aba}`} className="le-tela">
          <Corpo t={rota.t} />
        </div>
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
