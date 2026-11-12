# ⚠️ Protótipos React fiéis — descartáveis, NÃO é o app

> Fonte da verdade = **Lovable**. Ver `.kiro/steering/prototipos.md` para a regra completa (direção única, "regenerar não remendar", carimbo de proveniência, gate de frescor).

Protótipos de UI em React + Vite + Tailwind v4, usando os **tokens de marca reais** (copiados de `src/styles.css` do Lovable) e componentes que espelham os shadcn reais — para aprovar visual/interação **antes** de gastar crédito Lovable. Dados são **mock** (em `src/mock/`), sem backend, sem Supabase, sem segredos.

## Como rodar

O PowerShell desta máquina bloqueia `npm.ps1`, e `bun` não está instalado. Use `npm.cmd`:

```
cd prototipos/react
npm.cmd install
npm.cmd run dev
```

Abre em `http://localhost:5199`.

## O que tem hoje

O protótipo ativo é escolhido pelo `import` no topo de `src/App.tsx` — troque a linha para rever outra tela.

| Tela / decisão | Arquivo | Estado |
|---|---|---|
| **DigiPlace (v4)** (ativo, 2026-10-29) | `src/LojaBrindes.tsx` → `src/loja-brindes/**` | Marketplace de brindes da marca (dentro do Marketing Hub Digisystem). **Sem o antigo conceito de "sem saldo / Para aprovar".** Dois trilhos: **pronta entrega** (item com saldo sai na hora, baixa imediata, vai direto para "Pronto para retirada" e, na retirada, "Encerrado" com débito no centro de custo — sem aprovação) e **encomenda** (produção sob demanda, quantidade mínima configurável `QTD_MINIMA_ENCOMENDA = 10`, fluxo de alinhamento: Encomenda solicitada → Em alinhamento → Confirmada → Em produção → Pronta para retirada → Encerrada). Item esgotado fica indisponível como pronta entrega, mas pode ser oferecido por encomenda se tiver a flag. Mini-feature **Sugerir um brinde**: qualquer usuário sugere um item que não existe; o marketing analisa e, se aprovar, ele vira um item de encomenda no catálogo. Catálogo com **fotos reais** em `public/brindes/*.png` (todos os produtos). Topo "DigiPlace" (wordmark em Dosis com ponto laranja, sem ícone de presente genérico). Página do produto com galeria real, variações, personalização; pronta entrega via carrinho + checkout em 4 etapas; encomenda com painel de alinhamento próprio; Meus pedidos com os dois trilhos; back-office (fila separando pronta entrega × encomendas, aba **Sugestões**, cadastro com flag "disponível sob encomenda", rastreabilidade com linha de saldo inicial). Navegação por hash `#/loja…`. Decisão em `.agents/tasks/digiplace-v4/`. Conceito para validar a ideia, sem pacote de implementação ainda. |
| **Planejamento → Tarefas anti-AI** (2026-10-06) | `src/PlanejamentoAntiAI.tsx`, `components/planejamento/PlanejamentoAtual.tsx`, `PlanejamentoProposta.tsx`, `AppDockMock.tsx`, `mock/planejamento.ts` | Alternador no topo "Como está / Proposta anti-AI" com os mesmos dados (tasks reais do banco em 2026-10-06). Proposta: origem por faixa lateral + rótulo discreto, sem responsável tracejado, prazo vencido em laranja, grafia única das redes, marcadores de coluna na paleta, respiro do dock, "Nova tarefa" na linha dos filtros, molécula no "Iniciar no Estúdio", títulos em Dosis. "Como está" reproduz o bug dos chips letra por letra. Lido do commit `4fcf254`. Decisão durável: `implementacao/pacote-17-planejamento-anti-ai.md`. **Layout aprovado (2026-10-06), aguardando implementação** — morre quando o `send_message` correspondente for disparado. |
| **Admin consolidado (abas no topo)** (consumido, v3) | `src/AdminPage.tsx` | Equipe / IA & Conteúdo / Integrações / Marca. Equipe rica (stats/filtros/cards/tabela) + fix do menu 3 pontinhos (portal). Aba IA & Conteúdo em 3 sub-abas: **"Como a IA é montada"** (4 camadas de prompt em linha do tempo editorial), **Texto** (Manual de Estilo + refino de legenda por direção + variações de texto curto + CTA por rede) e **Imagem** (prompt estruturado só-cena + presets + teste ao vivo). v3 = refino **zero-AI-interface**: Dosis (display) + Open Sans (corpo), molécula no lugar de Sparkles, sem look mono/console. Decisão durável: `implementacao/pacote-10-admin-consolidado.md`. |
| **MP-02 — solicitante vê o post final** | `src/MP02Page.tsx` | "Meus pedidos" com o ciclo fechado: pedido concluído mostra arte + legenda do post final (galeria se carrossel). Leitura do real em 2026-09-22. |
| **MP-01 — devolver ao solicitante** | `src/MP01Page.tsx` | Triagem + Meus pedidos: detalhamento rico, prazo por urgência, fluxo devolver/reenviar, Parecer da triagem. |
| Símbolo animado da IA Digisystem | `src/IaDigisystem.tsx` | ícone oficial de IA (coreografia de bolinhas). Ver `docs-marketing-hub/design/ia-digisystem-simbolo.md`. |
| Estúdio — redesenho do fluxo de IA (agente-molécula) | `src/EstudioPage.tsx`, `ArteStep.tsx`, `DirecaoCriativaStep.tsx`, `components/estudio/AgenteMolecula.tsx`, `IaDigisystem.tsx` | redesenho 2026-09-22: símbolo IA vivo (estados vivo/processando); botão-herói "Gerar direção criativa"; Arte com "Gerar imagem por IA" (sem círculo); Direção Criativa = Legenda+Hashtags+CTA (sem "sugestão de imagem"); **AGENTE-MOLÉCULA único** que acompanha o scroll, com ações contextuais por seção (Arte com toggles por campo no estático/blog, "montar completo" no carrossel) e preenchimento real; removidos os botões de IA soltos. Gate: arte obrigatória. Detalhes em `docs-marketing-hub/design/ia-digisystem-simbolo.md`. |
| Parecer da triagem | `src/ParecerTriagem.tsx` | painel de análise + contorno de prontidão (usado pelo MP-01). |
| Efeito de texto (IA escrevendo) | `src/TextGenerateDigisystem.tsx` / `TextGenerateDemo.tsx` | efeito CSS-only. |
| Estúdio (shell + sub-abas + stepper) | `src/EstudioPage.tsx` | fiel a `src/routes/_authenticated/estudio.tsx` |
| Aprovação (redesign pacote-03) | `src/AprovacoesView.tsx` | card enxuto, imagem clicável, tela abrindo, observação, verde/vermelho |

A UI é **limpa (sem banner)** para refino visual — a proveniência fica no cabeçalho de cada arquivo e neste README. Cada arquivo de tela diz de qual arquivo real do Lovable nasceu e em que data foi lido.

Abas/etapas ainda não recriadas mostram um aviso simples ("… ainda não está no protótipo").

## Regras (resumo)

- **Não** é copiado de volta para o app. A implementação real vira `send_message` escrito nos componentes reais.
- Se o componente real mudar no Lovable, **regenerar** este protótipo do zero — não remendar.
- Cada arquivo de tela tem, no topo, o carimbo de proveniência (de qual arquivo real nasceu).
- Pode ser apagado a qualquer momento sem afetar nada.

## Estrutura

- `src/styles.css` — tokens de marca reais (OKLCH), utilities (`animate-rise`, `app-ambience`) + a animação **proposta** `animate-tela-abrindo`.
- `src/mock/` — tipos, dados e "hooks" fake (mesma assinatura dos hooks reais de `use-posts.ts`).
- `src/components/ui/` — Button/Dialog/Textarea/Label/Avatar mínimos (no app real são shadcn/Radix).
- `src/AprovacoesView.tsx` — a tela prototipada.

- Loja de brindes Equil�brio (prot�tipo): rota `#/loja-equilibrio` (Diretor) e `#/loja-equilibrio/gestao/metricas` (Gest�o).
