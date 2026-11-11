# Digi Store — protótipo descartável

**PROTÓTIPO DESCARTÁVEL — não é o app.**

- Fonte da verdade = Lovable (projeto `2d1b57ac-2cef-495c-bec7-4ec19da575df`). Se o real mudar, **regenerar**, não remendar.
- Decisão de design: `docs-marketing-hub/implementacao/pacote-loja-digi-store.md` (a criar na tarefa 2.1) e a spec `.kiro/specs/loja-digi-store-brindes/` (requirements, design, tasks).
- Regenerado do zero a partir do `design.md`. A pasta `../loja-brindes/` (DigiPlace) é referência congelada e não foi tocada.
- Nunca é copiado para o app. Quando aprovado, o valor sobe como texto de PR (PR-C e PR-D).
- Sem Supabase, sem backend, sem segredo. Dados fictícios em memória (`mock.ts`).

## Gate de frescor (leitura em 2026-11-11)

- Tokens de tema: `src/styles.css` do Lovable lido via MCP em 2026-11-11; idêntico aos tokens já espelhados em `prototipos/react/src/styles.css` (Azul Reflex `#36499b`, laranja `#ff6d2d`, apoio `#67cfee`, Dosis + Open Sans, `--shadow-card`, `--radius: 1rem`). Nada novo a copiar.
- Último commit do Lovable na leitura: `9a27b08` (PR #93, matriz de permissões D6B).
- O app real não tem Loja: não há componente a imitar além dos tokens e dos padrões shadcn (Sheet, botões em pílula, `rounded-2xl`/`3xl`).

## Como abrir

```
cd prototipos/react
npm.cmd run dev          # PowerShell bloqueia npm.ps1
```

Abrir `http://localhost:<porta>/#/loja-digi-store` (ler a porta real no output do Vite).

## Rotas (hash)

| Hash | Tela | Estado |
|---|---|---|
| `#/loja-digi-store` | Vitrine | pronta (1.3) |
| `#/loja-digi-store/brinde/<id>` | Página do brinde (Propriedade e Personalizável) | pronta (1.3) |
| `#/loja-digi-store/revisar` | Revisão do pedido com Linha_do_Tempo | pronta (1.3) |
| `#/loja-digi-store/pedidos` e `/pedidos/<id>` | Pedidos do diretor (lista e detalhe) | pronta (1.3) |
| `#/loja-digi-store/sugestoes` | Sugira um brinde | pronta (1.3) |
| `#/loja-digi-store/gestao?aba=pedidos\|estoque\|sugestoes` (+ `&pedido=<id>` no detalhe) | Equipe_da_Loja (visão Equipe) | pronta (1.4), em `telas/gestao/` |

## Quatro estados (tarefa 1.5)

`?estado=carregando|vazio|erro|sucesso` é lido por `rota.ts` e cobre Catálogo (vitrine), Carrinho (sheet), Confirmação (`/revisar`), Pedidos (lista e detalhe) e Sugestão (formulário e lista). Sucesso: aviso verde na vitrine e em Pedidos, linha de confirmação no rodapé do carrinho, tela de pedido criado em Confirmação e aviso após enviar em Sugestão.

### Controle de revisão (só do protótipo)

Botão discreto fixo no canto **inferior esquerdo** (nunca sobre o cabeçalho) que abre cinco opções: Normal, Carregando, Vazio, Erro, Sucesso. Troca só o `?estado=` da URL atual. Fica **oculto por padrão**:

- ligue com `?revisao=1` na URL (ex.: `#/loja-digi-store?revisao=1`), lembrado na aba por `sessionStorage`;
- ou alterne com **Alt+Shift+R**.

Está em `ControleRevisao.tsx` e não existe no app real.

### Carrinho persistido (Req. 5.7)

O carrinho é gravado em `sessionStorage` (`digi-store:carrinho`) e volta ao recarregar a página; linhas com brinde inexistente ou quantidade inválida são descartadas. Pedidos, estoque e sugestões continuam só em memória.

### Âncora fixa dos controles

Cabeçalho com larguras fixas (marca 148px; "Sugira um brinde" 168px, "Pedidos" 104px, "Carrinho" 112px, conta 40px), selo do carrinho em posição absoluta, carrinho em Sheet fixo, `scrollbar-gutter: stable`. Ativo (nav, categorias, filtros) muda só cor e anel; o peso é sempre `font-bold`.



## Arquivos

- `tipos.ts` tipos do design.
- `maquina.ts` `TRANSICOES`, `avaliarTransicao`, `acoesPermitidas`, `etapaDaLinhaDoTempo` (escrita do zero; Requisito 8).
- `maquina.test.ts` testes da máquina.
- `mock.ts` categorias, brindes (fotos em `public/brindes/`), pedidos e sugestões fictícios.
- `store.tsx` estado em memória: carrinho, pedidos, estoque (reserva, baixa, liberação), visão Diretor/Equipe.
- `rota.ts` roteamento por hash.
- `Cabecalho.tsx` cabeçalho com controles em âncora fixa.
- `ControleRevisao.tsx` seletor de estado só do protótipo (oculto por padrão).
- `FotoBrinde.tsx` foto com fallback elegante da marca.
- `LojaDigiStore.tsx` raiz e shell.
- `telas/` telas.

## Link para revis�o (tarefa 1.7)

- URL: https://marketingdigisystem.github.io/digisystem-prototipos/#/loja-digi-store?revisao=1 (abre como Diretor; para a vis�o Equipe, menu da conta > "Ver o prot�tipo como" > Equipe, pois a vis�o n�o � controlada pela URL)
- Commit no repo de prot�tipos: e2a4db5 ("prot�tipo Digi Store para revis�o"), Action run 43063200177 (success)
- Link tempor�rio de prot�tipo descart�vel; dados fict�cios.
