# ⚠️ Protótipos React — descartáveis, NÃO é o app

> Fonte da verdade = **Lovable**. Ver `.kiro/steering/prototipos.md` para a regra completa (direção única, "regenerar não remendar", carimbo de proveniência, gate de frescor).

Protótipos de UI em React + Vite + Tailwind v4, com os **tokens de marca reais** (copiados de `src/styles.css` do Lovable), para aprovar visual e interação **antes** de gastar crédito do Lovable. Dados são **mock**, sem backend, sem Supabase, sem segredos.

Decisão do usuário (2026-11-11): "Vamos deixar apenas o Digistore e login". O app tem só dois protótipos. Os demais (DigiPlace, Digi Store antiga, Redes, Estúdio, Hub e as telas antigas de Aprovação, Admin e MP-01/MP-02) foram removidos. O histórico deles continua no repositório publicado `digisystem-prototipos`. A decisão de design está em `.agents/tasks/loja-equilibrio/` e em `.kiro/specs/loja-equilibrio-digiplace/`.

## Como rodar

O PowerShell desta máquina bloqueia `npm.ps1`, e `bun` não está instalado. Use `npm.cmd`:

```
cd prototipos/react
npm.cmd install
npm.cmd run dev
```

Abre em `http://localhost:5199`.

## O que tem hoje

| Protótipo | Rota (hash) | Pasta | O que é |
|---|---|---|---|
| **Digi Store** (padrão) | `#/loja-equilibrio` | `src/loja-equilibrio/` | Loja de brindes que junta o melhor da Digi Store com as funções e métricas do DigiPlace: variação dentro do brinde, brinde personalizável com quantidade mínima, data desejada opcional com prazo mínimo, selo de últimas unidades, busca e ordenação, cadastro de brinde e painel de métricas por solicitante e área. Subrotas: `/brinde/:slug`, `/pedidos`, `/revisao`, `/sugerir`, `/gestao/{fila,sugestoes,estoque,movimentacoes,metricas,cadastro}`. Fotos oficiais do Marketplace (8 JPG 800x800) em `public/brindes/`, geradas por `scripts/otimizar-fotos.py` (fora do que o Pages publica). |
| **Login** | `#/auth` | `src/auth-proto/` | Tela de acesso "liquid glass": login, acesso externo por código e redefinição de senha. Logo em `public/mkthub/`. |

Hash vazio ou desconhecido abre a Digi Store. Links antigos (`#/loja-digi-store`, `#/digiplace`, `#/loja`, `#/loja-brindes`, `#/redes` e ids de Estúdio) são redirecionados para `#/loja-equilibrio`. O seletor "Digi Store | Login" aparece só na tela de Login, porque a Digi Store tem cabeçalho próprio.

A UI é **limpa (sem banner)** para refino visual. A proveniência fica no cabeçalho de cada arquivo e neste README.

## Regras (resumo)

- **Não** é copiado de volta para o app. A implementação real vira `send_message` escrito nos componentes reais.
- Se o componente real mudar no Lovable, **regenerar** este protótipo do zero, sem remendar.
- Pode ser apagado a qualquer momento sem afetar nada.

## Estrutura

- `src/App.tsx` — roteador por hash com dois protótipos (`auth` e `loja-equilibrio`).
- `src/styles.css` — tokens de marca (OKLCH), usados pelos dois protótipos.
- `src/loja-equilibrio/` — Digi Store: regras puras (`regras.ts`, com testes em `regras.test.ts`), `store.tsx`, `rota.ts`, `mock.ts`, `telas/`.
- `src/auth-proto/` — Login.
- `src/lib/utils.ts` — `cn()` usado pelo Login.
- `public/brindes/`, `public/mkthub/` — imagens usadas pelos dois protótipos.

## Verificação

```
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build --base=/digisystem-prototipos/
```

O `tsc` sozinho não basta: import inexistente só aparece no build (Rollup), e quebra o deploy do GitHub Pages.
