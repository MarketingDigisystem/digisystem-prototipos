# Protótipo descartável — Resultados › Redes (grade personalizável)

PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable (projeto `2d1b57ac-2cef-495c-bec7-4ec19da575df`).
Regenerar (não remendar) se o real mudar. Nunca copiar código daqui para o app.

- Rota: `#/redes` (alias `#/redes-grade`; `?rede=linkedin` abre uma Visao_Rede).
- Decisão de design: `docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md`. Spec: `.kiro/specs/redes-personalizaveis-visao-unificada/` (tarefas 10.1 a 10.5).

## Proveniência (gate de frescor, 2026-11-11)

- Lovable `list_edits`: topo = `83755ae` (merge PR #94, status `pending` de sincronização) e `f2f3b42` (PR-2). `read_file` de `src/hub/ui/painel-grade/grade.ts` no Lovable já devolve o PR-2.
- Clone `dev_mkt/mhdgst-trabalho` em `main` @ `83755ae` (`git pull` ok). Nenhuma mudança em `Redes.tsx`, `PaginaRede.tsx`, `PainelPersonalizavel.tsx` ou `arranjo-painel.ts` além do PR-2 (que só adicionou o núcleo sem tela).
- Lógica copiada para `nucleo/` (só imports trocados por `./tipos-proto`): `grade.ts`, `visao.ts`, `catalogo-cards.ts`, `estilo-series.ts`, `comparabilidade.ts`, `consolidado.ts`, `estado-rede.ts`.

## Conteúdo

- `mock.ts`: dados fictícios (LinkedIn com números; Instagram, Facebook e YouTube "Em breve").
- `RedesGrade.tsx`: tela completa (tarefa 10.3): Linha A (seletor de visão, período, Exportar), Linha B (faixa de contexto), Linha C (Restaurar disposição padrão e Reorganizar, ancorados à direita). Cada visão guarda o próprio arranjo na sessão.
- `PainelGradeProto.tsx`: grade com modo Reorganizar (mover por alça/teclado/setas, redimensionar por alças e botões, ocultar/restaurar pela gaveta). Usa só `nucleo/grade.ts` para a lógica.
- `cards.tsx` e `graficos.tsx`: conteúdo dos 6 cards da visão Todas e dos 8 da visão de rede; gráficos em SVG (sem recharts).
- Caixa "Só do protótipo" (canto inferior esquerdo): simula as 4 redes com dados, para ver o gráfico por rede e o consolidado completo.
- Imagens: `public/redes/` conferidas em 2026-11-11, sem texto ou logo inventado.

## Tarefa 10.4: estados, larguras, escuro e medição (2026-11-11)

- Estados: `?estado=carregando|vazio|erro|embreve` ou seletor "Estado" no painel "Só do protótipo" (posição fixa). Tema escuro: `?tema=escuro` ou caixa "Tema escuro" (classe `dark`, tokens em `styles.css`).
- Conferido no Playwright (72 cenários: 1366, 768 e 390 px; claro e escuro; Todas e LinkedIn; 5 estados; Todas com 4 redes e Reorganizar): sem rolagem horizontal, sem sobreposição, sem rolagem interna nos cards e controles do cabeçalho imóveis entre estados.
- Valores finais: `ALTURA_LINHA_PX = 224`, gap 20. `padrao` da Visão Rede: kpis 4×1, evolução 2×2, ranking 2×2, formatos 2×2, momento 2×2, frequência 2×1, metas 2×1, público 4×2. Visão Todas: consolidado 4×2, evolução por rede 4×2, resumos 2×2.
- h=2 comporta o gráfico de evolução (caixa de 321 px); o ranking cabe inteiro em h=2 (328 px naturais para 394 úteis).
- Em 1 coluna a altura salva vira altura mínima e as linhas são `auto`.
- Detalhe e justificativa: `docs-marketing-hub/implementacao/pacote-redes-personalizaveis.md`, seção 3.1.

Rodar: `npm.cmd run dev` em `prototipos/react`.
