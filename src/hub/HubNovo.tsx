/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: src/routes/_authenticated/route.tsx, src/components/AppDock.tsx,
 *   src/components/PageHeader.tsx @ commit 4fcf254 / leitura 2026-10-07.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/PROPOSTA-nova-interface-golive.md.
 *
 * Shell da nova interface: roteador por hash + dock + página da rota (pages/...).
 * Igual ao layout real (`<div className="pb-12"><Outlet/></div><AppDock/>`),
 * com o fundo `app-ambience` e o respiro inferior de cada página (pb-36).
 */
import { useEffect } from "react";
import { CabecalhoArea } from "./components/CabecalhoArea";
import { DemoPanel } from "./components/DemoPanel";
import { Dock } from "./components/Dock";
import { Equipe } from "./pages/configuracoes/Equipe";
import { Etiquetas } from "./pages/configuracoes/Etiquetas";
import { IaPrompts } from "./pages/configuracoes/IaPrompts";
import { Integracoes } from "./pages/configuracoes/Integracoes";
import { MinhaMesa } from "./pages/inicio/MinhaMesa";
import { MinhaMesaViva } from "./pages/inicio/MinhaMesaViva";
import { Marca } from "./pages/marca/Marca";
import { MenuAvatarPrototipo } from "./pages/perfil/MenuAvatarPrototipo";
import { Perfil } from "./pages/perfil/Perfil";
import { Calendario } from "./pages/posts/Calendario";
import { Estudio } from "./pages/posts/Estudio";
import { MeusPosts } from "./pages/posts/MeusPosts";
import { ParaAprovar } from "./pages/posts/ParaAprovar";
import { Publicados } from "./pages/posts/Publicados";
import { Redes } from "./pages/resultados/Redes";
import { Time } from "./pages/resultados/Time";
import { Cronograma } from "./pages/tarefas/Cronograma";
import { Pedidos } from "./pages/tarefas/Pedidos";
import { Quadro } from "./pages/tarefas/Quadro";
import { Concorrencia } from "./pages/tendencias/Concorrencia";
import { Swot } from "./pages/tendencias/Swot";
import { Tendencias } from "./pages/tendencias/Tendencias";
import { TELAS_EXTRAS, abasVisiveis, areaVisivel, hrefDe, useRota, type Rota } from "./router";
import { HubStoreProvider, useHub } from "./store/HubStore";
import type { Papel } from "./store/tipos";
import { cn } from "../lib/utils";

/** Áreas com contêiner largo no real (Planejamento, Estúdio e Biblioteca usam max-w-7xl). */
const LARGAS = new Set(["tarefas", "posts"]);

export function HubNovo() {
  return (
    <HubStoreProvider>
      <Shell />
    </HubStoreProvider>
  );
}

function Shell() {
  const rota = useRota();
  // O papel vem do store: "Entrar como" no painel de demo troca o que aparece.
  const { papel, estado, acoes } = useHub();
  const aviso = estado.aviso;

  // Cada troca de rota volta ao topo, como numa navegação de página.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [rota.area, rota.aba]);

  return (
    <div className="app-ambience min-h-screen">
      <div className="pb-12">
        <main
          key={`${rota.area}/${rota.aba}`}
          className={cn(
            "mx-auto px-4 pb-36 pt-10 sm:px-6",
            LARGAS.has(rota.area) || (rota.area === "inicio" && rota.params.mesa === "viva") ? "max-w-7xl" : "max-w-6xl",
          )}
        >
          <Pagina rota={rota} papel={papel} />
        </main>
      </div>

      <Dock
        areaAtiva={rota.area}
        papel={papel}
        onSair={() => acoes.avisar("No protótipo, Sair não encerra sessão: não existe login aqui.")}
      />

      <DemoPanel />

      <MenuAvatarPrototipo emPerfil={rota.area === "perfil"} />

      {aviso && (
        <div
          key={aviso.id}
          role={aviso.tom === "erro" ? "alert" : "status"}
          className={cn(
            "animate-rise fixed bottom-24 left-1/2 z-[60] w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl px-4 py-3 text-center text-sm shadow-float sm:bottom-28",
            aviso.tom === "erro" ? "bg-card text-foreground ring-1 ring-accent/40" : "bg-primary text-primary-foreground",
          )}
        >
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

/**
 * Página da rota. Antes de montar a página, o shell confere o acesso do papel
 * (Configurações só admin; Para aprovar só Aprovador e Admin).
 */
function Pagina({ rota, papel }: { rota: Rota; papel: Papel }) {
  if (!areaVisivel(rota.area, papel)) {
    return <SemAcesso texto="Configurações é só para quem administra o Hub." />;
  }

  const ehExtra = TELAS_EXTRAS[rota.area]?.includes(rota.aba);
  if (!ehExtra && !abasVisiveis(rota.area, papel).some((a) => a.id === rota.aba)) {
    return (
      <>
        <CabecalhoArea area={rota.area} aba={rota.aba} />
        <SemAcesso texto="Para aprovar aparece só para quem aprova posts." />
      </>
    );
  }

  switch (rota.area) {
    case "inicio":
      // Protótipo da Minha Mesa viva em #/inicio?mesa=viva; a mesa atual segue em #/inicio.
      return rota.params.mesa === "viva" ? <MinhaMesaViva /> : <MinhaMesa />;
    case "tendencias":
      if (rota.aba === "concorrencia") return <Concorrencia />;
      if (rota.aba === "swot") return <Swot />;
      return <Tendencias rota={rota} />;
    case "tarefas":
      if (rota.aba === "pedidos") return <Pedidos rota={rota} />;
      if (rota.aba === "cronograma") return <Cronograma rota={rota} />;
      return <Quadro rota={rota} />;
    case "posts":
      if (rota.aba === "criar") return <Estudio rota={rota} />;
      if (rota.aba === "aprovar") return <ParaAprovar rota={rota} />;
      if (rota.aba === "calendario") return <Calendario rota={rota} />;
      if (rota.aba === "publicados") return <Publicados rota={rota} />;
      return <MeusPosts rota={rota} />;
    case "marca":
      return <Marca aba={rota.aba} />;
    case "resultados":
      return rota.aba === "redes" ? <Redes /> : <Time />;
    case "configuracoes":
      if (rota.aba === "ia") return <IaPrompts rota={rota} />;
      if (rota.aba === "integracoes") return <Integracoes />;
      if (rota.aba === "etiquetas") return <Etiquetas />;
      return <Equipe />;
    case "perfil":
      return <Perfil rota={rota} />;
  }
}

function SemAcesso({ texto }: { texto: string }) {
  return (
    <section className="animate-rise mt-8 rounded-3xl bg-card p-6 shadow-card">
      <p className="font-display text-lg font-bold text-primary">Você não tem acesso a esta tela</p>
      <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
      <a href={hrefDe("inicio")} className="mt-4 inline-block font-display text-xs font-bold text-accent hover:underline">
        Ir para a Minha mesa
      </a>
    </section>
  );
}
