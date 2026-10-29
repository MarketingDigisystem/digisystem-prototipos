// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Gerado de: conceito novo (DigiPlace v4, marketplace de brindes) @ leitura 2026-10-29.
// Regenerar (não remendar) se o conceito mudar. Dados MOCK, sem backend, sem segredos.
// Decisão de design correspondente: .agents/tasks/digiplace-v4/ (protótipo para validar a ideia).
//
// Shell da loja: provider + rota por hash → tela. Gaveta do pedido abre por ?carrinho=1;
// a gaveta de sugerir um brinde abre por ?sugerir=1.

import { useEffect } from "react";
import { Cabecalho } from "./Cabecalho";
import { LojaProvider, useLoja } from "./estado";
import { trocarParams, useRotaLoja } from "./rota";
import { Toasts } from "./ui";
import { Vitrine } from "./telas/Vitrine";
import { PaginaProduto } from "./telas/PaginaProduto";
import { CarrinhoGaveta } from "./telas/CarrinhoGaveta";
import { SugerirItem } from "./telas/SugerirItem";
import { Checkout } from "./telas/Checkout";
import { DetalhePedido, MeusPedidos } from "./telas/MeusPedidos";
import { FilaPedidos } from "./gestao/FilaPedidos";
import { Estoque } from "./gestao/Estoque";
import { ProdutoForm } from "./gestao/ProdutoForm";
import { Rastreabilidade } from "./gestao/Rastreabilidade";
import { Sugestoes } from "./gestao/Sugestoes";

function Shell() {
  const rota = useRotaLoja();
  const { toasts, fecharToast } = useLoja();
  const chaveTela = rota.t.tela === "checkout" ? "checkout" : rota.caminho;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [rota.caminho]);

  const t = rota.t;
  let tela;
  switch (t.tela) {
    case "vitrine": tela = <Vitrine rota={rota} />; break;
    case "produto": tela = <PaginaProduto slug={t.slug} rota={rota} />; break;
    case "checkout": tela = <Checkout etapa={t.etapa} rota={rota} />; break;
    case "pedidos": tela = <MeusPedidos rota={rota} />; break;
    case "pedido": tela = <DetalhePedido id={t.id} />; break;
    case "gestao-pedidos": tela = <FilaPedidos rota={rota} />; break;
    case "gestao-estoque": tela = <Estoque rota={rota} />; break;
    case "gestao-produto": tela = <ProdutoForm key={t.slug} slug={t.slug} />; break;
    case "gestao-rastreabilidade": tela = <Rastreabilidade rota={rota} />; break;
    case "gestao-sugestoes": tela = <Sugestoes rota={rota} />; break;
  }

  return (
    <div className="min-h-screen app-ambience">
      <Cabecalho rota={rota} />
      <main key={chaveTela} className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 animate-rise md:px-6 md:pt-7">
        {tela}
      </main>
      {rota.perfil === "diretor" && (
        <>
          <CarrinhoGaveta aberto={rota.params.get("carrinho") === "1"} onFechar={() => trocarParams({ carrinho: undefined }, true)} />
          <SugerirItem aberto={rota.params.get("sugerir") === "1"} onFechar={() => trocarParams({ sugerir: undefined }, true)} />
        </>
      )}
      <Toasts toasts={toasts} onFechar={fecharToast} />
    </div>
  );
}

export function LojaBrindes() {
  return (
    <LojaProvider>
      <Shell />
    </LojaProvider>
  );
}
