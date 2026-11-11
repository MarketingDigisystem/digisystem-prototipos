/*
 * PROTÓTIPO DESCARTÁVEL — não é o app.
 * Gerado de: .kiro/specs/loja-digi-store-brindes/design.md (LojaShell, Rotas) e Lovable src/styles.css
 *   @ leitura 2026-11-11 (commit 9a27b08). O app real não tem Loja: só tokens e padrões shadcn foram imitados.
 * Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
 * Decisão de design correspondente: docs-marketing-hub/implementacao/pacote-loja-digi-store.md
 */
import { CarrinhoPainel } from "./CarrinhoPainel";
import { Cabecalho } from "./Cabecalho";
import { ControleRevisao } from "./ControleRevisao";
import { href, useRota } from "./rota";
import { LojaProvider } from "./store";
import { EstadoVazio } from "./telas/Estados";
import { Gestao } from "./telas/gestao/Gestao";
import { PaginaBrinde } from "./telas/PaginaBrinde";
import { DetalhePedido, ListaPedidos } from "./telas/Pedidos";
import { Revisao } from "./telas/Revisao";
import { Sugestoes } from "./telas/Sugestoes";
import { BOTAO_PRIMARIO } from "./telas/util";
import { Vitrine } from "./telas/Vitrine";
import "./loja.css";

function Tela() {
  const rota = useRota();
  const [a, b] = rota.caminho;
  let corpo;
  if (!a) corpo = <Vitrine />;
  else if (a === "brinde" && b) corpo = <PaginaBrinde key={b} skuId={b} />;
  else if (a === "revisar") corpo = <Revisao />;
  else if (a === "pedidos") corpo = b ? <DetalhePedido key={b} id={b} /> : <ListaPedidos />;
  else if (a === "sugestoes") corpo = <Sugestoes />;
  else if (a === "gestao") corpo = <Gestao />;
  else corpo = <div className="px-4 py-12"><EstadoVazio titulo="Página não encontrada" texto="Esse endereço não existe na Digi Store." acao={<a href={href("")} className={BOTAO_PRIMARIO}>Ver brindes</a>} /></div>;

  return (
    <div className="ds-root">
      <Cabecalho rota={rota} />
      <main>{corpo}</main>
      <CarrinhoPainel />
      <ControleRevisao rota={rota} />
    </div>
  );
}

export function LojaDigiStore() {
  return (
    <LojaProvider>
      <Tela />
    </LojaProvider>
  );
}
