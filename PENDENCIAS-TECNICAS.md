# Pendências de alinhamento técnico (pós-aprovação do layout)

> Estes protótipos validam **layout e interação**. O funcionamento real no Hub (dados, RLS, IA, n8n) precisa ser alinhado tecnicamente antes de virar código. **Layout das Ondas 1 e 2 aprovado pelo usuário em 2026-09-15.** Decisões técnicas abaixo travadas com o usuário na mesma data. Este arquivo é o lembrete durável; nada aqui é implementação.

## Onda 1 — Aprovação (decisões travadas)

1. **Modal de aprovação com campos editáveis (legenda, redes, CTAs).**
   - Reusar `useUpdatePost` (já existe em `use-posts.ts`) para legenda/redes/ctas.
   - **A1 (decidido): salvar SÓ AO DECIDIR.** As edições do aprovador ficam em estado local do modal e só são persistidas (via `useUpdatePost`) no momento de Aprovar/Reprovar. Fechar o modal sem decidir descarta as edições. Não gravar a cada tecla.
   - **A2 (decidido): NÃO registrar "editado por".** Fica como está — sem rastro de quem editou legenda/CTA (caminho mais simples; sem coluna/coluna nova).
   - RLS: a policy de UPDATE de `posts` já cobre admin/editor/aprovador — confirmar via `pg_policies` que o aprovador pode editar (hoje pode) antes de concluir.

2. **Decisão vinculada à tarefa (recomendação a).**
   - Reprovar já cria tarefa de ajuste (`origem: reprovacao`, `post_id`) em `use-posts.ts::useRejectPost`.
   - **A3 (decidido): o vínculo com a tarefa reflete no PAINEL DIREITO da própria aba Aprovação** (o bloco "Decisões recentes", como no protótipo) — não é só um link solto que joga para outra tela. O item reprovado mostra motivo + "Ver tarefa de ajuste"; ao acionar, abre/foca a tarefa. **Variante B travada (2026-09-15):** deep-link real — `useRejectPost` retorna o id da tarefa, o botão navega `navigate({ to: "/planejamento", search: { taskId } })`, e a rota `/planejamento` ganha `validateSearch { taskId }` + efeito que chama `abrirEdicao` da tarefa ao montar (via ref, uma vez). São 2 mensagens (Aprovação + Planejamento).
   - Aprovação = registro simples em `approvals` (já existe). Sem tarefa nova.

3. **Observação (`posts.observacao`).** Coluna já criada no banco (Proposta B). Falta a UI real ler/escrever via hook central `useSalvarObservacaoPost` (ver `pacote-03` item 3.4). Nota: `useSubmitForApproval` hoje grava a observação do autor dentro de `motivo_recusa` com prefixo — mover para `posts.observacao`.

## Onda 2 — Estúdio / IA (decisões travadas)

4. **Sugestão de IA campo a campo em todos os tipos (pacote-02, parte 2A).** A/B já têm; levar à capa e pranchetas do carrossel, reusando as props/estados existentes. Sem server function nova.

5. **Painel "Montar carrossel com IA" (pacote-02, parte 2B — o maior).**
   - **Contrato JSON (validado por Zod):** `{ pranchetas: Array<{ tipo: "capa"|"conteudo"|"cta"; titulo; subtitulo?; kicker?; cta? }> }`.
   - Server function nova, padrão de 3 arquivos (`sugerir-carrossel-prompt.ts` / `.server.ts` / `.functions.ts`), reusando `chamarAnthropicJson`.
   - **B1 (decidido): 3 a 7 pranchetas** (capa + até 5 conteúdos + CTA). Se a IA devolver mais, truncar; menos que 3, completar/repropor.
   - **B2 (decidido): manter os DOIS botões** no aplicar — "Aplicar (substituir tudo)" e "Completar vazios" (preserva o que o usuário já digitou).
   - **B3 (decidido): fallback suave** — se a geração falhar (API fora / JSON inválido), mostrar mensagem curta ("Não consegui montar agora, tente de novo") e manter o carrossel como estava. Nunca quebrar o Estúdio.
   - **B4 (decidido — REFINAMENTO CRÍTICO): pranchetas são CONTÍNUAS, não independentes.** Este é o ponto que o usuário sinalizou e é o que faz o recurso funcionar de verdade. A IA NÃO deve gerar N títulos avulsos: deve planejar a **narrativa do carrossel como um todo** e só então distribuí-la em pranchetas encadeadas.
     - Prompt deve pedir: (a) uma **capa** que fisga/promete; (b) **conteúdos em sequência lógica**, cada prancheta desenvolvendo um ponto e **conectando com a anterior/próxima** (progressão, não repetição); (c) uma **CTA** que fecha coerente com a promessa da capa.
     - Estratégia de prompt sugerida: pedir à IA para primeiro esboçar a linha narrativa (1 frase por prancheta) e depois expandir — garante coesão. Testar geração real e ler o carrossel inteiro para checar se "flui" antes de plugar na UI.
     - Respeitar o Manual de Estilo da marca (Skill Copywriter): parágrafos/linhas curtas, termos banidos, título até ~8 palavras, tom consultivo e direto.
   - **UX aprovada (protótipo):** botão distinto "Montar carrossel com IA" (card com `IconIA` animado + selo "IA"); painel de alinhamento que propõe a estrutura numerada, permite Regenerar, e aplica (substituir/completar). Modal via portal (centraliza no viewport). Ícone de IA = barras/equalizador da marca, nunca `Sparkles` genérico.
   - Futuro declarado pelo usuário: "IA gera tudo por padrão, usuário só ajusta a arte"; edição manual continua disponível.
   - **n8n não é afetado** — é geração de texto (Anthropic direto), não composição visual.

## Estilo / identidade dos botões de IA (aprovado)

- Ícone próprio `IconIA` (barras laranja tipo equalizador, animação de onda `ia-wave`, shine no hover), em todos os pontos de IA.
- Botões de sugestão campo-a-campo (`ChipIA`): **fundo neutro** (card), sem bloco alaranjado; acento só no ícone; realce sutil no hover.
- No Hub real, replicar essa linguagem com os componentes shadcn reais (o protótipo usa `IconIA`/`ChipIA`/`AcaoIA`/`CardIA` como referência visual, não para copiar 1:1).

## Regra

Nada disso vira `send_message`/código no Hub sem: (1) usuário aprovar o layout no protótipo ✅ (feito), (2) este alinhamento técnico feito e registrado ✅ (feito), (3) e, para a parte 2B, a server function `sugerir-carrossel` testada com geração real (JSON válido + narrativa contínua) antes de plugar na UI.
