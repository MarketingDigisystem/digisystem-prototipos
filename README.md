# Protótipos React descartáveis, não é o app

> Fonte da verdade = **Lovable**. Estes protótipos servem para aprovar visual e interação antes de gastar crédito. Nada aqui é copiado de volta para o app.

React + Vite + Tailwind v4 com os tokens de marca reais da Digisystem. Dados são **mock**, sem backend, sem Supabase e sem segredos.

## O que o app tem hoje

| Rota (hash) | Protótipo | Código |
|---|---|---|
| `#/loja-equilibrio` (padrão) | **Digi Store**: loja de brindes com a visão do Diretor e da Gestão (fila, sugestões, estoque, movimentações, métricas, cadastro) | `src/loja-equilibrio/` |
| `#/auth` | **Login** | `src/auth-proto/` |

Links antigos (`#/loja-digi-store`, `#/digiplace`, `#/loja`, `#/redes`) caem na Digi Store.

Os protótipos anteriores (DigiPlace, Digi Store antiga, Redes, Estúdio, hub e outros) foram removidos desta árvore. Continuam no histórico do git, no commit `932af95` e anteriores.

## Como rodar

```
npm.cmd install
npm.cmd run dev
```

Build para o GitHub Pages: `node node_modules/vite/bin/vite.js build --base=/digisystem-prototipos/`. O Action em `.github/workflows/deploy-pages.yml` publica a cada push na `main`.

URL publicada: https://marketingdigisystem.github.io/digisystem-prototipos/
