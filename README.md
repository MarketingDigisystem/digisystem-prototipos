# Protótipos Digisystem — Marketing Hub

> ⚠️ **Apenas interface (protótipo visual descartável).** Não é o app real, não tem backend, não tem dados reais — tudo é mock. A fonte da verdade do produto é o Lovable/Marketing Hub. Este repositório existe só para **compartilhar o visual** de protótipos por um link estável (GitHub Pages), sem depender de nenhuma máquina ligada.

## O que é

Protótipos de UI em React + Vite + Tailwind (a mesma stack visual do app real), com dados fictícios. Servem para validar interface e fluxo antes de implementar no produto.

Protótipo atual: **DigiPlace** — a loja de brindes do Marketing Hub (catálogo, pronta entrega, encomenda, sugestão de item, back-office). Interface demonstrativa, nada conectado.

## Link publicado

GitHub Pages: **https://marketingdigisystem.github.io/digisystem-prototipos/**

(Atualiza sozinho a cada push na `main`, via GitHub Actions — o build roda na nuvem do GitHub.)

## Rodar localmente (opcional)

```
npm install
npm run dev
```

## Publicação

O workflow `.github/workflows/deploy-pages.yml` builda com `base=/digisystem-prototipos/` e publica em Pages. Não requer máquina ligada; o GitHub faz o build e a hospedagem.
