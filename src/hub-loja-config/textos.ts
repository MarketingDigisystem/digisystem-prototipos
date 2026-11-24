// PROTÓTIPO DESCARTÁVEL — não é o app.
// Gerado de: src/hub/pages/loja/ (AbaMetricas, AbaRetirada, AbaAcesso, AbaPonte, use*Loja, *-loja.ts) e src/lib/loja/ (acesso, config-loja) @ loja-redesign-l4 (leitura 2026-11-24).
// Fonte da verdade = Lovable. Regenerar (não remendar) se o real mudar.
// Decisão de design: docs-marketing-hub/implementacao/analise-redesign-loja-hub-config-2026-11-24.md

/* Mensagens literais do Hub real, uma constante por texto. Não reescrever: copiar do Clone_Fonte. */

/* ---------------- Métricas ---------------- */
export const T_METRICAS_CARREGANDO = "Carregando as métricas…";
export const T_METRICAS_ERRO = "Não foi possível carregar as métricas agora. Tente novamente em instantes.";
export const T_METRICAS_VAZIO_TITULO = "Ainda não há dados para as métricas";
export const T_METRICAS_VAZIO_DESCRICAO = "Quando houver brindes cadastrados e pedidos entregues, os números aparecem aqui.";
export const T_MES_ANTERIOR = "Mês anterior";
export const T_PROXIMO_MES = "Próximo mês";
export const T_IND_GASTO = "Gasto do mês";
export const T_IND_UNIDADES = "Unidades entregues";
export const T_IND_UNIDADES_APOIO = "Pedidos entregues neste mês.";
export const T_IND_PRONTOS = "Prontos para entregar ou retirar";
export const T_IND_VALOR_ESTOQUE = "Valor em estoque";
export const T_IND_VALOR_ESTOQUE_APOIO = "Saldo × custo unitário.";
export const T_IND_PARADOS = "Pedidos parados";
export const T_IND_PARADOS_APOIO = "Aguardando atendimento há mais dias úteis que o limite combinado.";
export const T_IND_TEMPO = "Tempo médio de atendimento";
export const T_IND_TEMPO_APOIO_SEM = "Nenhum pedido foi assumido ainda.";
export const T_IND_TEMPO_APOIO = "Do pedido feito até alguém assumir.";
export const T_IND_ESGOTADOS = "Esgotados";
export const T_IND_ESGOTADOS_APOIO = "Brindes sem nenhuma unidade disponível.";
export const T_IND_ABAIXO = "Abaixo do mínimo";
export const T_IND_ABAIXO_APOIO = "Unidades disponíveis menores ou iguais ao mínimo.";
export const T_CARTAO_POR_SOLICITANTE = "Gasto por Solicitante";
export const T_CARTAO_POR_AREA = "Gasto por área";
export const T_CARTAO_ALERTAS = "Alertas de mínimo";
export const T_CARTAO_ESGOTADOS = "Esgotados";
export const T_CARTAO_POPULARIDADE = "Popularidade";
export const T_SEM_ENTREGUES_MES = "Nenhum pedido entregue neste mês.";
export const T_SEM_ABAIXO_MINIMO = "Nenhum brinde abaixo do mínimo.";
export const T_SEM_ESGOTADOS = "Nenhum brinde esgotado.";
export const T_LISTA_CORTADA = "Foram lidos só os pedidos mais recentes. Meses antigos podem estar incompletos.";

/** "N brinde(s) sem custo cadastrado ficam fora." (apoio de Valor em estoque). */
export const textoSemCusto = (n: number): string => `${n} brinde(s) sem custo cadastrado ficam fora.`;
/** Apoio de Prontos para entregar ou retirar. */
export const textoCustoProntos = (valorFormatado: string): string => `Custo: ${valorFormatado}`;
/** Linha de detalhe das listas de gasto. */
export const textoPedidosEUnidades = (pedidos: number, unidades: number): string =>
  `${pedidos === 1 ? "1 pedido" : `${pedidos} pedidos`} · ${unidades === 1 ? "1 unidade" : `${unidades} unidades`}`;
/** Linha de detalhe das listas de alerta. */
export const textoDisponivelMinimo = (disponivel: number, minimo: number): string => `disponível ${disponivel} · mínimo ${minimo}`;
/** Linha de detalhe da popularidade. */
export const textoUnidadesPedidos = (unidades: number, pedidos: number): string =>
  `${unidades} un. · ${pedidos === 1 ? "1 pedido" : `${pedidos} pedidos`}`;

/* ---------------- Retirada ---------------- */
export const T_RETIRADA_CARREGANDO = "Carregando a configuração da retirada…";
export const T_RETIRADA_ERRO = "Não foi possível carregar a configuração da retirada agora. Tente novamente em instantes.";
export const T_RETIRADA_CARTAO_ONDE = "Onde e quando retirar";
export const T_RETIRADA_CARTAO_PRAZOS = "Prazos, em dias úteis";
export const T_RETIRADA_CARTAO_GESTOR = "Quem acompanha os pedidos parados";
export const T_RETIRADA_LOCAL = "Local da retirada";
export const T_RETIRADA_HORARIO = "Horário da retirada";
export const T_RETIRADA_PRAZO = "Prazo para retirar";
export const T_RETIRADA_PRAZO_AJUDA = "Depois que o pedido fica pronto.";
export const T_RETIRADA_GUARDADAS = "Prazo das peças guardadas";
export const T_RETIRADA_GUARDADAS_AJUDA = "Quanto tempo o Marketing guarda a peça.";
export const T_RETIRADA_LIMITE = "Limite de pedido parado";
export const T_RETIRADA_LIMITE_AJUDA = "Só vale dentro do Hub.";
export const T_RETIRADA_GESTOR_AJUDA =
  "Recebe o aviso quando um pedido passa do limite. Sem gestor, o aviso vai para os Admin. Esta escolha não vai para a Loja.";
export const T_RETIRADA_SEM_GESTOR = "Sem gestor (avisar os Admin)";
export const T_RETIRADA_SALVAR = "Salvar";
export const T_RETIRADA_SALVANDO = "Salvando…";
export const T_RETIRADA_CONFIRA = "Confira os campos destacados.";
export const T_RETIRADA_SALVA = "Configuração salva. O envio à Loja segue pela ponte.";
export const T_RETIRADA_FALHA_SALVAR = "Não foi possível salvar agora. A configuração anterior foi mantida. Tente novamente em instantes.";
export const T_RETIRADA_MSG_TEXTO = "Preencha este campo.";
export const T_RETIRADA_MSG_PRAZO = "Informe um número inteiro de dias úteis, de 1 a 30.";
export const T_RETIRADA_MSG_GESTOR = "Escolha uma pessoa da lista ou deixe sem gestor.";

/* ---------------- Acesso ---------------- */
export const T_ACESSO_CARREGANDO = "Carregando os Solicitantes…";
export const T_ACESSO_ERRO = "Não foi possível carregar a lista de Solicitantes agora. Tente novamente em instantes.";
export const T_ACESSO_VAZIO_TITULO = "Nenhum Solicitante autorizado";
export const T_ACESSO_VAZIO_DESCRICAO = "Inclua a primeira pessoa para que ela possa pedir brindes na Digi Store.";
export const T_ACESSO_CARTAO_INCLUIR = "Incluir Solicitante";
export const T_ACESSO_CAMPO_NOME = "Nome";
export const T_ACESSO_PLACEHOLDER_NOME = "Nome da pessoa";
export const T_ACESSO_CAMPO_AREA = "Área (obrigatória)";
export const T_ACESSO_INCLUIR = "Incluir";
export const T_ACESSO_SO_ADMIN_FORM = "Só o Admin inclui, revoga ou reativa Solicitantes. Você pode consultar a lista abaixo.";
export const T_ACESSO_SO_ADMIN = "Só o Admin pode alterar a lista de Solicitantes.";
export const T_ACESSO_FALHA = "Não foi possível concluir agora. Tente novamente em instantes.";
export const T_ACESSO_INCLUIDO = "Solicitante incluído. O envio à Loja segue pela ponte.";
export const T_ACESSO_REVOGADO = "Acesso revogado. Os pedidos da pessoa continuam visíveis aqui.";
export const T_ACESSO_REATIVADO = "Acesso reativado.";
export const T_ACESSO_SEM_AREA = "Sem área";
export const T_ACESSO_EMAIL_VAZIO = "Informe o e-mail do Solicitante.";
export const T_ACESSO_AREA_VAZIA = "Informe a área do Solicitante.";
export const DOMINIO_ACESSO = "@digisystem.com.br";
export const T_ACESSO_DOMINIO = `Use um e-mail com final ${DOMINIO_ACESSO}.`;
/** Não existe no Hub real (o servidor faz upsert); mensagem do protótipo para o caso de duplicado (Req. 6.6). */
export const T_ACESSO_DUPLICADO = "Este e-mail já está na lista de Solicitantes.";
export const T_ACESSO_CONFIRMAR_ARIA = "Confirmar ação";
export const T_CANCELAR = "Cancelar";
export const T_CONFIRMAR = "Confirmar";
export const T_REVOGAR = "Revogar";
export const T_REATIVAR = "Reativar";
export const textoCartaoSolicitantes = (n: number): string => `Solicitantes (${n})`;
export const textoConfirmarRevogar = (nome: string): string =>
  `Revogar o acesso de ${nome}? A pessoa deixa de pedir brindes; os pedidos dela continuam visíveis aqui.`;
export const textoConfirmarReativar = (nome: string): string => `Reativar o acesso de ${nome}? A pessoa volta a poder pedir brindes.`;

/* ---------------- Ponte ---------------- */
export const T_PONTE_CARREGANDO = "Carregando a ponte…";
export const T_PONTE_ERRO = "Não foi possível carregar o estado da ponte agora. Tente novamente em instantes.";
export const T_PONTE_FALHA = "Não foi possível concluir agora. Tente novamente em instantes.";
export const T_PONTE_CARTAO_ESTADO = "Estado da ponte";
export const T_PONTE_CARTAO_FILA = "Fila de eventos";
export const T_PONTE_CARTAO_DISPONIBILIDADE = "Disponibilidade dos brindes";
export const T_PONTE_CARTAO_DIVERGENCIAS = "Divergências com a Loja";
export const T_PONTE_LIGADA = "Ponte ligada";
export const T_PONTE_DESLIGADA = "Ponte desligada";
export const T_PONTE_LIGAR = "Ligar ponte";
export const T_PONTE_DESLIGAR = "Desligar ponte";
export const T_PONTE_CONFIGURADO = "configurado";
export const T_PONTE_NAO_CONFIGURADO = "não configurado";
export const T_PONTE_SO_ADMIN_INTERRUPTOR = "Só o Admin liga ou desliga a ponte.";
export const T_PONTE_SO_ADMIN_DISPONIBILIDADE = "Só o Admin reenvia a disponibilidade.";
export const T_PONTE_CONTADOR_AGUARDANDO = "Aguardando";
export const T_PONTE_CONTADOR_ENVIADOS = "Enviados";
export const T_PONTE_CONTADOR_FALHARAM = "Falharam";
export const T_PONTE_FILA_VAZIA = "Nenhum evento aguardando envio ou com falha.";
export const T_PONTE_REENVIAR = "Reenviar";
export const T_PONTE_REENVIAR_DISPONIBILIDADE = "Reenviar disponibilidade";
export const T_PONTE_DISPONIBILIDADE_AJUDA =
  "Reenvia à Loja a quantidade disponível para retirada rápida de cada brinde ativo (carga inicial ou reparo).";
export const T_PONTE_RECONCILIAR = "Reconciliar";
export const T_PONTE_DIVERGENCIAS_AJUDA = "Compara só o estado e a versão de cada pedido. Nenhuma informação de estoque é enviada.";
export const T_PONTE_NAO_RECONCILIADO = "Ainda não reconciliado nesta sessão.";
export const T_PONTE_TUDO_EM_DIA_TITULO = "Tudo em dia";
export const T_PONTE_TUDO_EM_DIA_DESCRICAO = "Nenhum pedido diverge entre o Hub e a Loja.";
export const T_PONTE_REENVIAR_SNAPSHOT = "Reenviar snapshot";
export const T_PONTE_SEM_PEDIDO_NO_HUB = "O pedido não existe no Hub.";
export const T_PONTE_LIGOU = "Ponte ligada.";
export const T_PONTE_DESLIGOU = "Ponte desligada. Os eventos ficam na fila até religar.";
export const T_PONTE_SNAPSHOT_OK = "Estado do pedido reenviado à Loja. Reconcilie de novo para conferir.";
export const T_PONTE_DISPONIBILIDADE_OK = "Disponibilidade enviada à Loja. Ela aparece na fila até a confirmação.";
export const T_PONTE_SEM_BRINDES = "Nenhum brinde ativo para enviar.";
export const T_PONTE_CONFIRMA_LIGAR = "Ligar a ponte? Os eventos da fila voltam a ser enviados à Loja.";
export const T_PONTE_CONFIRMA_DESLIGAR = "Desligar a ponte? Nada será enviado nem recebido até religar; os eventos ficam na fila.";
export const T_PONTE_CONFIRMA_DISPONIBILIDADE =
  "Reenviar à Loja a disponibilidade de todos os brindes ativos? Só atualiza o número de unidades para retirada rápida; é seguro repetir.";
export const T_PONTE_CONFIRMA_RECONCILIAR = "Comparar os pedidos do Hub com os da Loja? Nada é alterado; só lista as diferenças.";
export const textoConfirmaReenviarEvento = (rotulo: string): string => `Reenviar agora o evento "${rotulo}" à Loja?`;
export const textoConfirmaSnapshot = (idCurto: string): string => `Reenviar à Loja o estado atual do pedido ${idCurto}?`;

/* ---------------- Genéricos ---------------- */
export const T_TENTAR_DE_NOVO = "Tentar de novo";
export const T_CARREGANDO = "Carregando";
