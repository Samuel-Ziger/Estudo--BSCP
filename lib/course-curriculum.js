const MODULES = Object.freeze([
  {
    id: 'web-cache', order: 1, name: 'Web Cache Deception', shortName: 'WEB CACHE', source: 'burp/burpwebcache.txt', color: '#8cffc1',
    hero: { tag: 'MÓDULO 01 · WEB CACHE DECEPTION', lead: 'ENTENDA O CACHE.', accent: 'ENGANE AS REGRAS.', description: 'Transforme diferenças sutis de parsing em uma metodologia clara de investigação no Burp Suite.' },
    dashboard: {
      eyebrow: 'MAPA DE ATAQUE', description: 'Da observação à recuperação dos dados fictícios da vítima.',
      request: 'GET /account/wcd.css HTTP/1.1\nHost: 127.0.0.1:3000\nCookie: session=victim\n\nCACHE  → recurso estático\nORIGEM → rota /account\n\nX-Cache: MISS → HIT',
      steps: [['ENCONTRE O DINÂMICO', 'Registre a resposta-base de um endpoint com dados privados.', 'GET /account'], ['MEÇA O CACHE', 'Confirme chave, MISS, HIT, idade e tempo.', 'X-Cache: miss → hit'], ['CRIE AMBIGUIDADE', 'Faça cache e origem discordarem sobre a URL.', '/account;wcd.css'], ['PROVE O IMPACTO', 'Repita sem a sessão e registre a evidência.', 'Cookie: [removido]']]
    },
    glossary: [
      ['Cache key', 'Conjunto de componentes da requisição usado para identificar uma resposta armazenada.'],
      ['Cache buster', 'Valor único usado para criar uma chave limpa e isolar um teste.'],
      ['HIT', 'Resposta atendida por uma entrada existente no cache.'],
      ['MISS', 'Resposta não encontrada no cache e obtida da origem.'],
      ['Origem', 'Aplicação que produz a resposta antes do armazenamento intermediário.'],
      ['Normalização', 'Transformação de uma URL para uma representação canônica.']
    ],
    checklist: ['Use uma chave limpa.', 'Mude uma variável por vez.', 'Confirme MISS e HIT.', 'Compare caminho bruto e caminho da origem.', 'Remova a sessão para provar o impacto.', 'Relacione a correção à política de cache.'],
    quiz: [
      { id: 'cache-q1', question: 'Qual evidência confirma melhor que uma resposta foi armazenada?', options: ['Um único header X-Cache', 'A repetição controlada MISS → HIT na mesma chave', 'Uma resposta HTTP 200', 'A presença de Cache-Control'], correct: 1, explanation: 'A transição reproduzível na mesma chave reduz falsos sinais.' },
      { id: 'cache-q2', question: 'Para que serve um cache buster durante a investigação?', options: ['Desabilitar o navegador', 'Criar uma chave independente', 'Alterar o cookie da vítima', 'Forçar erro 500'], correct: 1, explanation: 'Um valor único evita que testes anteriores contaminem a observação.' },
      { id: 'cache-q3', question: 'Onde deve ser impedido o armazenamento de respostas autenticadas?', options: ['Somente no HTML', 'Na política aplicada por cache e origem', 'No nome do arquivo', 'Apenas no Burp'], correct: 1, explanation: 'A decisão precisa ser determinística nas camadas que processam e armazenam a resposta.' },
      { id: 'cache-q4', question: 'O que caracteriza a discrepância explorável?', options: ['Cache e origem interpretam a URL da mesma forma', 'A origem sempre responde 404', 'Cache e origem atribuem significados diferentes à mesma URL', 'O navegador não envia cookies'], correct: 2, explanation: 'A vulnerabilidade nasce da diferença de interpretação entre componentes.' }
    ],
    finalChallenge: { title: 'Operação Chave Fantasma', brief: 'Sem nomes de técnicas: investigue três URLs, prove armazenamento indevido e documente a correção.', bonus: 1000, requiredLabIds: ['cache-buster-5', 'delimiter-5', 'exact-file-5'], tasks: ['Isole duas observações sem reutilizar estado anterior.', 'Encontre uma URL cuja interpretação muda entre camadas.', 'Recupere somente o segredo fictício após remover a sessão.'] }
  },
  {
    id: 'web-llm', order: 2, name: 'Ataques de Web LLM', shortName: 'WEB LLM', source: 'burp/burpLLM.txt', color: '#ff8fab',
    hero: { tag: 'MÓDULO 02 · ATAQUES DE WEB LLM', lead: 'ENTENDA O MODELO.', accent: 'TESTE A AGÊNCIA.', description: 'Acompanhe ferramentas virtuais, argumentos e fronteiras de confiança de um agente determinístico.' },
    dashboard: {
      eyebrow: 'FRONTEIRA DE CONFIANÇA', description: 'Da entrada do usuário ao efeito de uma ferramenta virtual.',
      request: 'POST /llm/chat/llm-api-agency/3 HTTP/1.1\nContent-Type: application/json\n\n{ "action": "call_tool",\n  "tool": "get_user",\n  "args": { "user_id": "2002" } }\n\nAUTHORIZATION: not checked',
      steps: [['MAPEIE A ENTRADA', 'Separe intenção e fonte externa.', 'user_task ≠ source'], ['ENUMERE FERRAMENTAS', 'Observe schemas, argumentos e privilégios.', 'action=list_tools'], ['TESTE O LIMITE', 'Altere um argumento e registre a decisão.', 'tool_call.arguments'], ['FIXE O CONTROLE', 'Mova autorização para a API.', 'least privilege']]
    },
    glossary: [
      ['Agência', 'Capacidade do agente de selecionar ferramentas e produzir efeitos.'],
      ['Tool call', 'Chamada estruturada de uma ferramenta com argumentos.'],
      ['Prompt injection', 'Instrução hostil que tenta alterar o comportamento do agente.'],
      ['Proveniência', 'Origem e nível de confiança atribuído a um conteúdo.'],
      ['Sink', 'Consumidor que interpreta a saída produzida pelo modelo.'],
      ['Menor privilégio', 'Concessão apenas das permissões necessárias para uma tarefa.']
    ],
    checklist: ['Mapeie ferramentas e schemas.', 'Registre argumentos e resultados.', 'Separe usuário de fonte externa.', 'Teste autorização na API.', 'Não execute saída hostil.', 'Defina confirmação para mudanças de estado.'],
    quiz: [
      { id: 'llm-q1', question: 'Onde deve ocorrer a autorização de uma ferramenta?', options: ['Somente no prompt', 'Na API que executa a operação', 'Na mensagem do usuário', 'No CSS'], correct: 1, explanation: 'Prompts orientam; a API precisa impor autorização determinística.' },
      { id: 'llm-q2', question: 'O que diferencia uma injeção indireta?', options: ['A instrução vem de uma fonte externa consultada', 'O usuário envia JSON', 'A saída contém texto', 'A ferramenta não possui parâmetros'], correct: 0, explanation: 'O conteúdo não confiável ganha autoridade apesar de vir de uma fonte externa.' },
      { id: 'llm-q3', question: 'Como demonstrar saída insegura com segurança?', options: ['Executando JavaScript real', 'Registrando a saída e o sink virtual que a interpretaria', 'Enviando-a a um site externo', 'Desabilitando CSP'], correct: 1, explanation: 'A simulação prova o fluxo sem executar conteúdo hostil.' },
      { id: 'llm-q4', question: 'Ao encadear uma falha, o que deve aparecer no relatório?', options: ['Apenas o prompt', 'A causa no agente e a causa na ferramenta', 'Somente o status HTTP', 'A marca do modelo'], correct: 1, explanation: 'O agente abre o caminho e a ferramenta processa a entrada de forma insegura.' }
    ],
    finalChallenge: { title: 'Operação Assistente Cego', brief: 'Mapeie uma superfície desconhecida, acompanhe a origem dos dados e prove um efeito apenas virtual.', bonus: 1000, requiredLabIds: ['llm-api-agency-5', 'llm-indirect-5', 'llm-output-5'], tasks: ['Descubra uma capacidade sem receber seu nome.', 'Diferencie intenção confiável de conteúdo externo.', 'Demonstre o risco no consumidor sem executar código.'] }
  },
  {
    id: 'web-auth', order: 3, name: 'Vulnerabilidades de Autenticação', shortName: 'AUTENTICAÇÃO', source: 'Auth.txt', color: '#62d9ff',
    hero: { tag: 'MÓDULO 03 · AUTENTICAÇÃO', lead: 'VALIDE A IDENTIDADE.', accent: 'QUEBRE A LÓGICA.', description: 'Investigue sessões, contadores, MFA, tokens persistentes e recuperação de conta.' },
    dashboard: {
      eyebrow: 'MÁQUINA DE ESTADOS', description: 'Da resposta-base à quebra do vínculo entre identidade e sessão.',
      request: 'POST /auth/mfa/auth-mfa/2 HTTP/1.1\nContent-Type: application/json\nCookie: lab-session=...; account=victim-user\n\n{ "action": "verify", "code": "123456" }\n\nFIRST FACTOR: attacker\nAUTHENTICATED AS: victim-user',
      steps: [['REGISTRE A BASE', 'Compare respostas controladas.', 'status · body · time'], ['PRESERVE O ESTADO', 'Carregue cookies, tokens e contadores.', 'Set-Cookie → Cookie'], ['QUEBRE O VÍNCULO', 'Teste ordem, identidade e revalidação.', 'request → open → change'], ['PROVE E CORRIJA', 'Registre a conta afetada.', 'identity_source']]
    },
    glossary: [
      ['Autenticação', 'Processo de confirmar uma identidade.'],
      ['Autorização', 'Decisão sobre o que uma identidade pode fazer.'],
      ['MFA', 'Uso de mais de um fator independente de autenticação.'],
      ['Lockout', 'Bloqueio temporário após tentativas falhas.'],
      ['Token persistente', 'Credencial que mantém uma sessão entre acessos.'],
      ['Token de reset', 'Segredo de uso restrito para recuperação de conta.']
    ],
    checklist: ['Compare mensagens, status, tamanho e tempo.', 'Vincule contadores a identidades e origens.', 'Preserve cookies entre etapas.', 'Verifique identidade em cada fator.', 'Teste expiração e uso único.', 'Revalide o token no envio final.'],
    quiz: [
      { id: 'auth-q1', question: 'Qual é a melhor defesa contra enumeração de usuários?', options: ['Mensagens e processamento uniformes', 'Ocultar o botão de login', 'Usar apenas status 200', 'Bloquear o Burp'], correct: 0, explanation: 'Mensagem, status, tamanho e tempo devem evitar diferenças úteis.' },
      { id: 'auth-q2', question: 'O que deve vincular as etapas de MFA?', options: ['Um cookie editável isolado', 'A sessão, a identidade e o desafio no servidor', 'A URL da página', 'O navegador'], correct: 1, explanation: 'O servidor deve preservar e validar a mesma identidade em todos os fatores.' },
      { id: 'auth-q3', question: 'Como deve ser um token persistente seguro?', options: ['Base64 de usuário e senha', 'Hash MD5 previsível', 'Aleatório, revogável e com expiração', 'Nome do usuário'], correct: 2, explanation: 'Tokens não devem ser derivados diretamente de credenciais.' },
      { id: 'auth-q4', question: 'Quando um token de reset deve ser invalidado?', options: ['Nunca', 'Depois do primeiro uso ou da expiração', 'Depois de dez usos', 'Somente ao fechar o navegador'], correct: 1, explanation: 'Uso único e expiração reduzem reutilização e captura tardia.' }
    ],
    finalChallenge: { title: 'Operação Identidade Partida', brief: 'Atravesse uma cadeia de autenticação sem receber a categoria de cada falha.', bonus: 1000, requiredLabIds: ['auth-bruteforce-5', 'auth-mfa-5', 'auth-reset-5'], tasks: ['Compare o controle aplicado a múltiplas credenciais.', 'Prove uma quebra de vínculo entre fatores.', 'Conclua uma recuperação fictícia e teste o uso único.'] }
  },
  {
    id: 'path-traversal', order: 4, name: 'Path Traversal', shortName: 'PATH TRAVERSAL', source: 'burp/PathTraversal.txt', color: '#c7a6ff',
    hero: { tag: 'MÓDULO 04 · PATH TRAVERSAL', lead: 'CONTROLE O CAMINHO.', accent: 'ESCAPE DA BASE.', description: 'Acompanhe filtro, decoding, validação e canonicalização sobre um filesystem virtual seguro.' },
    dashboard: {
      eyebrow: 'PIPELINE DE CAMINHOS', description: 'Da entrada bruta ao arquivo resolvido no sistema virtual.',
      request: 'GET /path/load/path-basic/3?filename=../../../etc/passwd HTTP/1.1\nHost: 127.0.0.1:3000\n\nBASE: /var/www/images\nDECODED: ../../../etc/passwd\nCANONICAL: /etc/passwd\nESCAPED_BASE: true',
      steps: [['IDENTIFIQUE A BASE', 'Comece por um arquivo permitido.', 'filename=218.png'], ['MUDE A FORMA', 'Teste uma representação por vez.', '../ · %2e · %00'], ['SIGA O PIPELINE', 'Observe cada transformação.', 'raw → decoded → path'], ['PROVE COM SEGURANÇA', 'Leia somente arquivos fictícios.', 'canonical path']]
    },
    glossary: [
      ['Diretório base', 'Pasta à qual a aplicação pretende restringir o acesso.'],
      ['Canonicalização', 'Resolução de segmentos, separadores e caminhos absolutos.'],
      ['Percent-encoding', 'Representação de bytes por sequências iniciadas por %.'],
      ['Double encoding', 'Codificação aplicada em duas camadas sucessivas.'],
      ['Null byte', 'Byte zero que pode encerrar strings em integrações vulneráveis.'],
      ['Allowlist', 'Lista explícita de identificadores ou nomes permitidos.']
    ],
    checklist: ['Descubra o diretório base.', 'Registre a entrada bruta.', 'Acompanhe cada decoding.', 'Compare validação e caminho canônico.', 'Use apenas arquivos virtuais.', 'Recomende allowlist e confinamento canônico.'],
    quiz: [
      { id: 'path-q1', question: 'Em que momento deve ser conferido o confinamento?', options: ['Antes de decodificar', 'Depois da canonicalização controlada', 'Somente no navegador', 'Depois de ler o arquivo'], correct: 1, explanation: 'A decisão deve usar a mesma representação canônica consumida pela operação.' },
      { id: 'path-q2', question: 'Por que remover ../ uma única vez é insuficiente?', options: ['Porque altera o MIME type', 'Sequências aninhadas podem recriar o traversal', 'Porque o cache ignora cookies', 'Porque o arquivo fica maior'], correct: 1, explanation: 'Substituições não recursivas podem produzir novamente a sequência perigosa.' },
      { id: 'path-q3', question: 'Qual é a defesa preferida?', options: ['Aceitar qualquer caminho absoluto', 'Mapear identificadores permitidos para arquivos do servidor', 'Remover pontos do nome', 'Aplicar Base64'], correct: 1, explanation: 'Evitar transformar entrada em caminho elimina grande parte da superfície.' },
      { id: 'path-q4', question: 'O que o relatório deve demonstrar?', options: ['Somente o payload', 'Entrada, transformações, caminho final e arquivo virtual', 'Um arquivo real do computador', 'A versão do navegador'], correct: 1, explanation: 'A cadeia completa explica por que a validação falhou.' }
    ],
    finalChallenge: { title: 'Operação Caminho Sem Nome', brief: 'Reconstrua três pipelines sem indicação do bypass usado e prove somente leituras virtuais.', bonus: 1000, requiredLabIds: ['path-encoding-5', 'path-prefix-5', 'path-null-byte-5'], tasks: ['Determine quantas transformações ocorrem.', 'Compare a validação textual com o caminho final.', 'Relacione o bypass à defesa correta.'] }
  },
  {
    id: 'os-command-injection', order: 5, name: 'OS Command Injection', shortName: 'COMMAND INJECTION', source: 'burp/CommandInjection.txt', color: '#ff8a5b',
    hero: { tag: 'MÓDULO 05 · OS COMMAND INJECTION', lead: 'CONTROLE A ENTRADA.', accent: 'NÃO ENTREGUE O SHELL.', description: 'Investigue composição insegura de comandos, sinais cegos e efeitos virtuais sem executar processos reais.' },
    dashboard: {
      eyebrow: 'FRONTEIRA DO SHELL', description: 'Da entrada de um formulário ao efeito produzido pelo interpretador virtual.',
      request: 'POST /cmd/execute/cmd-direct/1 HTTP/1.1\nContent-Type: application/json\n\n{ "productId": "381",\n  "storeId": "29" }\n\nEXPECTED TYPE: numeric\nSHELL: virtual-only',
      steps: [['REGISTRE A BASE', 'Envie valores válidos e observe a função normal.', 'productId=381'], ['IDENTIFIQUE O CONTEXTO', 'Descubra aspas, argumentos e separadores.', 'argumento → shell'], ['COMPARE O SINAL', 'Use saída, tempo ou canal virtual.', 'body · delay · artifact · DNS'], ['CORRIJA NA ORIGEM', 'Substitua o shell por uma API segura.', 'allowlist + typed API']]
    },
    glossary: [
      ['Command injection', 'Interferência na string entregue a um interpretador de comandos.'],
      ['Shell', 'Interpretador que separa comandos, argumentos, redirecionamentos e substituições.'],
      ['Blind injection', 'Falha em que a saída do comando não aparece diretamente na resposta.'],
      ['Metacaractere', 'Símbolo como &, ; ou | que possui significado para o shell.'],
      ['Redirecionamento', 'Envio da saída de um comando para outro destino, como um arquivo.'],
      ['OAST', 'Observação de uma interação fora do fluxo HTTP principal; neste módulo, inteiramente virtual.']
    ],
    checklist: ['Registre a requisição válida.', 'Identifique o campo e o contexto controlados.', 'Teste um separador por vez.', 'Compare saída, tempo e efeitos secundários.', 'Confirme o efeito somente no ambiente virtual.', 'Recomende APIs sem shell e validação por tipo.'],
    quiz: [
      { id: 'cmd-q1', question: 'Qual defesa elimina melhor a superfície de command injection?', options: ['Escapar alguns caracteres', 'Não invocar o shell e usar uma API tipada', 'Ocultar a resposta', 'Trocar o método HTTP'], correct: 1, explanation: 'Sem composição de uma linha de comando, os metacaracteres deixam de ser interpretados.' },
      { id: 'cmd-q2', question: 'Como uma falha cega pode ser demonstrada?', options: ['Somente por erro 500', 'Por tempo ou efeito secundário controlado', 'Pela cor da página', 'Apenas pelo status 200'], correct: 1, explanation: 'O sinal pode aparecer fora do corpo principal, como atraso, artefato ou interação observável.' },
      { id: 'cmd-q3', question: 'Por que uma allowlist numérica ajuda em IDs de produto?', options: ['Converte o shell em SQL', 'Impede sintaxe e espaços não pertencentes ao domínio', 'Desativa cookies', 'Criptografa a resposta'], correct: 1, explanation: 'Validar pelo tipo esperado reduz a entrada a valores válidos para a função.' },
      { id: 'cmd-q4', question: 'O que o relatório deve diferenciar?', options: ['Entrada, comando construído, sinal e efeito', 'Somente o payload', 'Somente o navegador', 'A marca do sistema operacional'], correct: 0, explanation: 'A cadeia completa demonstra onde a entrada se tornou sintaxe e como o efeito foi observado.' }
    ],
    finalChallenge: { title: 'Operação Shell Fantasma', brief: 'Reconstrua três canais de observação sem receber o metacaractere ou o comando esperado.', bonus: 1000, requiredLabIds: ['cmd-direct-5', 'cmd-redirect-5', 'cmd-exfil-5'], tasks: ['Produza uma saída visível no terminal virtual.', 'Crie e recupere um artefato somente em memória.', 'Observe dados fictícios em uma interação DNS virtual.'] }
  },
  {
    id: 'business-logic', order: 6, name: 'Vulnerabilidades na Lógica de Negócios', shortName: 'LÓGICA DE NEGÓCIOS', source: 'burp/regadenogocio.txt', color: '#ef5da8',
    hero: { tag: 'MÓDULO 06 · LÓGICA DE NEGÓCIOS', lead: 'ENTENDA A REGRA.', accent: 'TESTE A PREMISSA.', description: 'Desvie do fluxo esperado, manipule valores fictícios e observe decisões de negócio que o servidor deveria rejeitar.' },
    dashboard: {
      eyebrow: 'PREMISSAS E ESTADOS', description: 'Da interface legítima ao estado incomum que revela uma regra ausente.',
      request: 'POST /logic/execute/logic-client-trust/1 HTTP/1.1\nContent-Type: application/json\n\n{ "action": "checkout",\n  "productId": "starter-kit",\n  "quantity": 1 }\n\nCATALOG PRICE: server-owned\nCLIENT VALUES: untrusted',
      steps: [['REGISTRE O FLUXO', 'Conclua a operação normal e anote suas invariantes.', 'catálogo → carrinho → pagamento'], ['QUESTIONE A PREMISSA', 'Identifique valores e estados que o servidor presume corretos.', 'preço · quantidade · etapa'], ['DESVIE COM CONTROLE', 'Altere uma variável por vez no Repeater.', 'cliente ≠ autoridade'], ['PROVE E CORRIJA', 'Mostre o efeito e a validação ausente.', 'invariante no servidor']]
    },
    glossary: [
      ['Lógica de negócios', 'Regras e estados que determinam como uma funcionalidade deve operar.'],
      ['Invariante', 'Condição que precisa permanecer verdadeira durante toda a transação.'],
      ['Premissa implícita', 'Comportamento esperado que não foi verificado pelo servidor.'],
      ['Máquina de estados', 'Conjunto de etapas e transições permitidas em um fluxo.'],
      ['Regra de domínio', 'Restrição específica do produto, como limites, descontos ou elegibilidade.'],
      ['Validação server-side', 'Verificação autoritativa realizada no componente que aplica a operação.']
    ],
    checklist: ['Registre o caminho feliz.', 'Liste valores controlados pelo cliente.', 'Teste limites, sinais e tipos incomuns.', 'Altere a ordem das etapas.', 'Compare canais que aplicam a mesma regra.', 'Documente a invariante e imponha-a no servidor.'],
    quiz: [
      { id: 'logic-q1', question: 'Por que controles no navegador não protegem uma regra de negócio?', options: ['Porque não usam CSS', 'Porque a requisição pode ser alterada antes de chegar ao servidor', 'Porque todo navegador está autenticado', 'Porque JSON não aceita números'], correct: 1, explanation: 'O servidor deve tratar todos os valores recebidos como não confiáveis, independentemente da interface.' },
      { id: 'logic-q2', question: 'O que deve proteger um fluxo com várias etapas?', options: ['A ordem visual dos botões', 'Uma máquina de estados validada no servidor', 'O histórico do navegador', 'Um campo hidden'], correct: 1, explanation: 'Cada transição deve confirmar o estado anterior e as invariantes obrigatórias.' },
      { id: 'logic-q3', question: 'Como investigar uma possível falha lógica?', options: ['Executar um scanner e encerrar o teste', 'Modelar o fluxo normal e variar uma premissa por vez', 'Enviar palavras aleatórias', 'Ignorar respostas válidas'], correct: 1, explanation: 'A comparação controlada revela qual premissa deixa de ser verdadeira.' },
      { id: 'logic-q4', question: 'Qual correção é mais completa para regras duplicadas entre canais?', options: ['Ocultar o canal legado', 'Centralizar a regra autoritativa e testá-la em todas as entradas', 'Renomear o endpoint', 'Validar apenas no frontend'], correct: 1, explanation: 'Uma única política server-side reduz inconsistências e impede que um canal alternativo contorne a regra.' }
    ],
    finalChallenge: { title: 'Operação Regra Quebrada', brief: 'Reconstrua uma transação desconhecida, encontre premissas não verificadas e prove três impactos apenas com valores fictícios.', bonus: 1000, requiredLabIds: ['logic-client-trust-5', 'logic-workflow-5', 'logic-domain-5'], tasks: ['Faça o servidor aceitar um valor que deveria calcular.', 'Alcance um estado final sem cumprir todas as etapas.', 'Combine benefícios virtuais além do limite do domínio.'] }
  },
  {
    id: 'api-testing', order: 7, name: 'Teste de API', shortName: 'TESTE DE API', source: 'burp/testedeapi.txt', color: '#28b8a7',
    hero: { tag: 'MÓDULO 07 · TESTE DE API', lead: 'MAPEIE A SUPERFÍCIE.', accent: 'TESTE O CONTRATO.', description: 'Descubra endpoints, varie métodos e formatos e acompanhe parâmetros até uma API interna inteiramente fictícia.' },
    dashboard: {
      eyebrow: 'CONTRATO E IMPLEMENTAÇÃO', description: 'Da documentação observável ao efeito produzido por um parâmetro não previsto.',
      request: 'PATCH /api-lab/execute/api-mass-assignment/1 HTTP/1.1\nContent-Type: application/json\n\n{ "action": "update",\n  "resource": "user-101",\n  "fields": { "isAdmin": true } }\n\nDOCUMENTED: displayName\nBOUND OBJECT: displayName + isAdmin',
      steps: [['DESCUBRA A SUPERFÍCIE', 'Relacione documentação, interface e endpoints observados.', 'OpenAPI · JavaScript · versões'], ['TESTE O CONTRATO', 'Varie método, formato e parâmetros de forma controlada.', 'OPTIONS · PATCH · Content-Type'], ['ACOMPANHE A ENTRADA', 'Observe como o servidor monta objetos e requisições internas.', 'client → server → internal API'], ['PROVE E CORRIJA', 'Confirme o novo estado e imponha uma lista permitida.', 'allowlist + encoding']]
    },
    glossary: [
      ['Endpoint', 'Combinação de caminho e operação pela qual uma API recebe uma solicitação.'],
      ['OpenAPI', 'Formato estruturado para descrever operações, parâmetros e modelos de uma API.'],
      ['Método HTTP', 'Verbo que expressa a operação pretendida, como GET, PATCH ou DELETE.'],
      ['Parâmetro oculto', 'Entrada aceita pela implementação, mas ausente do contrato publicado.'],
      ['Atribuição em massa', 'Vinculação automática de campos recebidos a propriedades de um objeto interno.'],
      ['Poluição de parâmetros', 'Manipulação da requisição interna construída pelo servidor por entrada sem codificação adequada.']
    ],
    checklist: ['Registre endpoints e versões observados.', 'Compare documentação e comportamento real.', 'Teste métodos e tipos de conteúdo permitidos.', 'Procure propriedades devolvidas mas não editáveis pela interface.', 'Acompanhe a requisição interna construída.', 'Aplique allowlists, encoding e autorização em todas as versões.'],
    quiz: [
      { id: 'api-q1', question: 'Por que a documentação não encerra o reconhecimento de uma API?', options: ['Porque JSON não descreve endpoints', 'Porque ela pode estar incompleta ou desatualizada', 'Porque APIs não usam métodos HTTP', 'Porque todo endpoint é público'], correct: 1, explanation: 'A interface, os arquivos do cliente e as respostas podem revelar operações ausentes ou diferentes da documentação.' },
      { id: 'api-q2', question: 'Qual controle reduz melhor a atribuição em massa?', options: ['Ocultar o campo no HTML', 'Permitir explicitamente somente propriedades editáveis', 'Trocar PATCH por POST', 'Codificar o corpo em Base64'], correct: 1, explanation: 'O servidor deve construir o objeto de atualização a partir de uma lista explícita de campos permitidos.' },
      { id: 'api-q3', question: 'O que demonstra poluição de parâmetros no servidor?', options: ['Uma query grande no navegador', 'A entrada altera a estrutura ou os parâmetros da requisição interna', 'Um status HTTP 200 isolado', 'A existência de documentação OpenAPI'], correct: 1, explanation: 'A evidência precisa ligar a entrada do cliente à requisição interna resultante e ao efeito observado.' },
      { id: 'api-q4', question: 'Como métodos e tipos de conteúdo devem ser protegidos?', options: ['Aceitando qualquer combinação', 'Com allowlist por operação e validação do formato esperado', 'Somente com validação no frontend', 'Retornando erros detalhados'], correct: 1, explanation: 'Cada endpoint deve aceitar apenas os métodos e formatos necessários e processá-los pela mesma política de segurança.' }
    ],
    finalChallenge: { title: 'Operação Contrato Fantasma', brief: 'Reconstrua uma API local desconhecida e prove três diferenças entre o contrato aparente e o comportamento implementado.', bonus: 1000, requiredLabIds: ['api-recon-5', 'api-mass-assignment-5', 'api-sspp-5'], tasks: ['Descubra uma operação ausente da interface.', 'Modifique e consulte uma propriedade não permitida.', 'Mostre como uma entrada altera a requisição interna virtual.'] }
  },
  {
    id: 'information-disclosure', order: 8, name: 'Vulnerabilidades de Divulgação de Informações', shortName: 'DIVULGAÇÃO DE INFORMAÇÕES', source: 'burp/vulnerabilidadesdedivulgaçãodeinformações.txt', color: '#f0b44d',
    hero: { tag: 'MÓDULO 08 · DIVULGAÇÃO DE INFORMAÇÕES', lead: 'OBSERVE A RESPOSTA.', accent: 'ENCONTRE O VAZAMENTO.', description: 'Reconheça detalhes sensíveis em artefatos públicos, erros, páginas de depuração, contas e histórico de código inteiramente fictícios.' },
    dashboard: {
      eyebrow: 'DADO, CONTEXTO E IMPACTO', description: 'Da pequena pista técnica à evidência de como ela amplia a superfície local.',
      request: 'GET /info/inspect/info-source/1?path=%2Fapp%2Fconfig.js~ HTTP/1.1\nHost: 127.0.0.1:3000\n\nHTTP/1.1 200 OK\nX-Info-Lab: triggered\n\nSOURCE: virtual backup\nSECRET: fictitious training value',
      steps: [['AMPLIE A OBSERVAÇÃO', 'Revise corpo, headers, comentários, arquivos e diferenças.', 'status · length · source'], ['FORMULE A HIPÓTESE', 'Classifique o dado e sua possível utilidade.', 'técnico · usuário · negócio'], ['FORCE A RESPOSTA', 'Mude uma entrada por vez e compare.', 'baseline → unexpected input'], ['PROVE E REDUZA', 'Demonstre impacto local e remova a causa.', 'generic errors + production hardening']]
    },
    glossary: [
      ['Divulgação de informações', 'Exposição involuntária de dados sensíveis, técnicos ou de negócio.'],
      ['Artefato público', 'Arquivo acessível que revela caminhos ou recursos não vinculados, como robots.txt.'],
      ['Stack trace', 'Rastro de chamadas que pode revelar componentes, arquivos e detalhes internos.'],
      ['Dados de depuração', 'Estado, variáveis e diagnóstico destinados ao desenvolvimento.'],
      ['Arquivo de backup', 'Cópia temporária ou alternativa que pode devolver código-fonte como texto.'],
      ['Histórico de versão', 'Metadados e alterações preservados por uma ferramenta de controle de versão.']
    ],
    checklist: ['Revise respostas completas, não apenas a página renderizada.', 'Compare status, tamanho, tempo e mensagens de erro.', 'Procure comentários e artefatos públicos locais.', 'Verifique páginas de diagnóstico e métodos inseguros.', 'Demonstre por que a informação é útil no cenário.', 'Remova segredos, debug, backups e metadados da publicação.'],
    quiz: [
      { id: 'info-q1', question: 'Quando um detalhe técnico merece maior prioridade?', options: ['Sempre que contém um número', 'Quando pode ser ligado a uma exploração ou superfície adicional', 'Somente quando aparece em HTML', 'Quando o status é 200'], correct: 1, explanation: 'A gravidade depende da sensibilidade direta ou da utilidade demonstrável da informação vazada.' },
      { id: 'info-q2', question: 'Qual é a resposta correta para erros inesperados em produção?', options: ['Exibir o stack trace completo', 'Devolver mensagem genérica e registrar detalhes somente em canal protegido', 'Ocultar apenas o status', 'Adicionar mais comentários'], correct: 1, explanation: 'O cliente recebe o mínimo necessário, enquanto o diagnóstico detalhado permanece protegido.' },
      { id: 'info-q3', question: 'Por que um arquivo de backup pode ser mais perigoso que o original?', options: ['Porque sempre é maior', 'Porque pode ser servido como texto em vez de executado', 'Porque desabilita cookies', 'Porque usa outro host'], correct: 1, explanation: 'A extensão alternativa pode impedir o processamento normal e revelar o código-fonte.' },
      { id: 'info-q4', question: 'Como prevenir exposição de histórico de versão?', options: ['Renomear apenas a página inicial', 'Excluir metadados do artefato publicado e bloquear acesso no servidor', 'Usar comentários HTML', 'Ativar TRACE'], correct: 1, explanation: 'A publicação deve conter somente artefatos necessários, com regras que impeçam servir diretórios de versionamento.' }
    ],
    finalChallenge: { title: 'Operação Sinal Residual', brief: 'Correlacione três pistas locais e demonstre como artefatos aparentemente menores revelam dados fictícios de maior impacto.', bonus: 1000, requiredLabIds: ['info-discovery-5', 'info-errors-5', 'info-source-5'], tasks: ['Use um artefato público para localizar uma rota não vinculada.', 'Extraia contexto técnico de respostas de erro comparadas.', 'Reconstrua um valor removido a partir do histórico virtual.'] }
  },
  {
    id: 'access-control', order: 9, name: 'Vulnerabilidades de Controle de Acesso e Escalonamento de Privilégios', shortName: 'CONTROLE DE ACESSO', source: 'burp/Access controlvulnerabilitiesandprivilegeescalation.txt', color: '#6f78ff',
    hero: { tag: 'MÓDULO 09 · CONTROLE DE ACESSO', lead: 'AUTENTIQUE A IDENTIDADE.', accent: 'AUTORIZE CADA AÇÃO.', description: 'Compare identidade, objeto, função e estado para demonstrar escalonamento vertical, horizontal e dependente de contexto em aplicações inteiramente fictícias.' },
    dashboard: {
      eyebrow: 'IDENTIDADE, RECURSO E DECISÃO', description: 'Da requisição legítima à prova de que o servidor confiou no caminho, no parâmetro ou no contexto errado.',
      request: 'GET /access/check/access-horizontal/1?path=%2Fmy-account&ownerId=user-2002 HTTP/1.1\nHost: 127.0.0.1:3000\nX-Lab-User: student\n\nHTTP/1.1 200 OK\nX-Access-Lab: triggered\n\nAUTHENTICATED: student\nRESOURCE OWNER: carlos\nDECISION: granted',
      steps: [['REGISTRE A IDENTIDADE', 'Separe autenticação, sessão e autorização.', 'quem sou · qual função'], ['MAPEIE O RECURSO', 'Identifique objeto, ação e contexto da decisão.', 'owner · endpoint · state'], ['MUDE UMA DIMENSÃO', 'Altere referência, rota, método ou etapa.', 'baseline → comparação'], ['PROVE E NEGUE', 'Demonstre o impacto e aplique deny by default.', 'central policy + ownership'] ]
    },
    glossary: [
      ['Controle de acesso', 'Política que decide se uma identidade pode executar uma ação sobre um recurso em determinado contexto.'],
      ['Escalonamento vertical', 'Acesso de uma função menos privilegiada a funcionalidades reservadas a uma função superior.'],
      ['Escalonamento horizontal', 'Acesso de um usuário aos recursos pertencentes a outro usuário do mesmo nível.'],
      ['IDOR', 'Referência direta a um objeto controlável pelo cliente sem verificação adequada de propriedade ou permissão.'],
      ['Deny by default', 'Princípio de negar uma operação quando nenhuma autorização explícita a permite.'],
      ['Controle contextual', 'Autorização que também considera estado, sequência ou condições da operação.']
    ],
    checklist: ['Registre a identidade e a função efetivas.', 'Compare recursos próprios e de outro usuário.', 'Teste a mesma ação por rotas e métodos equivalentes.', 'Não confie em parâmetros, headers ou campos de perfil para definir privilégios.', 'Valide todas as etapas de processos sensíveis.', 'Centralize a política, negue por padrão e teste a matriz de autorização.'],
    quiz: [
      { id: 'access-q1', question: 'Qual é a diferença central entre autenticação e controle de acesso?', options: ['Autenticação identifica o usuário; controle de acesso decide o que ele pode fazer', 'Autenticação protege apenas GET', 'Controle de acesso cria a sessão', 'Não existe diferença'], correct: 0, explanation: 'Uma identidade autenticada ainda precisa ser autorizada para cada ação e recurso.' },
      { id: 'access-q2', question: 'O que torna uma referência direta a objeto vulnerável?', options: ['O identificador ser numérico', 'O servidor usar a referência sem validar a permissão sobre o objeto', 'A resposta usar JSON', 'O objeto possuir um GUID'], correct: 1, explanation: 'IDs imprevisíveis reduzem adivinhação, mas não substituem a verificação de propriedade e autorização.' },
      { id: 'access-q3', question: 'Por que esconder uma rota administrativa não é um controle suficiente?', options: ['Porque toda rota deve ser curta', 'Porque a rota pode ser descoberta e o servidor ainda precisa autorizar a ação', 'Porque robots.txt bloqueia administradores', 'Porque URLs não carregam permissões'], correct: 1, explanation: 'Ofuscação não impõe uma política; a autorização deve ocorrer no servidor ao acessar a função.' },
      { id: 'access-q4', question: 'Qual abordagem reduz discrepâncias entre camadas e etapas?', options: ['Verificar apenas o menu', 'Centralizar autorização, negar por padrão e proteger cada transição', 'Confiar no Referer', 'Aceitar métodos equivalentes sem política'], correct: 1, explanation: 'Uma política consistente deve ser aplicada a toda rota, método, objeto e etapa relevante.' }
    ],
    finalChallenge: { title: 'Operação Fronteira Quebrada', brief: 'Correlacione uma função privilegiada, um objeto de outro usuário e uma etapa contextual para demonstrar uma cadeia local de escalonamento.', bonus: 1000, requiredLabIds: ['access-vertical-5', 'access-horizontal-5', 'access-context-5'], tasks: ['Alcance uma função reservada sem confiar na interface.', 'Demonstre acesso horizontal e sua evolução para privilégio superior.', 'Mostre uma decisão contextual tomada sem as pré-condições necessárias.'] }
  },
  {
    id: 'file-upload', order: 10, name: 'Vulnerabilidades no Upload de Arquivos', shortName: 'UPLOAD DE ARQUIVOS', source: 'burp/Vulnerabilidadesnouploaddearquivos.txt', color: '#a7d642',
    hero: { tag: 'MÓDULO 10 · UPLOAD DE ARQUIVOS', lead: 'VALIDE ANTES DE ARMAZENAR.', accent: 'ISOLE ANTES DE SERVIR.', description: 'Analise nome, extensão, MIME, conteúdo, destino e ciclo de vida de uploads em um cofre de mídia inteiramente virtual.' },
    dashboard: {
      eyebrow: 'ARQUIVO, POLÍTICA E CICLO DE VIDA', description: 'Do objeto recebido à decisão de armazenamento, processamento e entrega.',
      request: 'POST /upload/inspect/upload-type-path/1 HTTP/1.1\nHost: 127.0.0.1:3000\nContent-Type: application/json\n\n{ "action": "upload",\n  "filename": "avatar.lab.php",\n  "declaredType": "image/jpeg",\n  "content": { "kind": "server-script" } }\n\nVALIDATION: declared MIME only\nSTORAGE: virtual map',
      steps: [['REGISTRE O ARQUIVO', 'Separe nome, extensão, MIME, assinatura e tamanho.', 'metadata · bytes · intent'], ['ACOMPANHE O PIPELINE', 'Observe validação, destino e política de entrega.', 'receive → validate → store'], ['COMPARE PARSERS', 'Mude uma representação por vez.', 'validator ≠ storage ≠ server'], ['PROVE E ISOLE', 'Demonstre o efeito virtual e aplique defesa em profundidade.', 'allowlist + rename + sandbox']]
    },
    glossary: [
      ['Upload de arquivo', 'Transferência de conteúdo fornecido pelo usuário para processamento ou armazenamento pela aplicação.'],
      ['Tipo MIME', 'Metadado que declara o formato pretendido do conteúdo, mas não prova seus bytes reais.'],
      ['Assinatura de arquivo', 'Sequência de bytes ou propriedade estrutural usada para identificar um formato.'],
      ['Arquivo poliglota', 'Conteúdo que satisfaz características de mais de um formato ou parser.'],
      ['Diretório não executável', 'Área em que arquivos enviados são servidos somente como dados, sem interpretação como código.'],
      ['Condição de corrida', 'Falha em que um arquivo pode ser acessado durante uma janela temporária antes da validação ou remoção.']
    ],
    checklist: ['Registre nome, extensão, MIME, assinatura e tamanho.', 'Use lista permitida de extensões e valide o conteúdo.', 'Canonicalize o nome e remova componentes de diretório.', 'Renomeie no servidor e evite colisões.', 'Valide em área isolada antes da publicação.', 'Sirva uploads fora de contexto executável e com Content-Disposition seguro.'],
    quiz: [
      { id: 'upload-q1', question: 'Por que o Content-Type enviado pelo cliente não comprova o formato?', options: ['Porque navegadores não enviam MIME', 'Porque o cliente pode alterar esse cabeçalho', 'Porque MIME só existe em respostas', 'Porque todo arquivo é texto'], correct: 1, explanation: 'O valor declarado precisa ser confrontado com extensão, assinatura e parsing seguro.' },
      { id: 'upload-q2', question: 'Qual estratégia é preferível para extensões?', options: ['Bloquear algumas extensões conhecidas', 'Permitir explicitamente somente formatos necessários', 'Aceitar nomes com duas extensões', 'Confiar em letras minúsculas'], correct: 1, explanation: 'Uma allowlist pequena e explícita reduz as variantes esquecidas por listas negras.' },
      { id: 'upload-q3', question: 'Como reduzir uma corrida entre upload e validação?', options: ['Publicar primeiro e remover depois', 'Validar em sandbox não acessível e só então promover', 'Aumentar o nome do arquivo', 'Usar apenas antivírus'], correct: 1, explanation: 'O arquivo temporário não deve ser endereçável nem executável antes da validação completa.' },
      { id: 'upload-q4', question: 'O que deve acontecer com o nome enviado pelo usuário?', options: ['Ser usado diretamente', 'Ser canonicalizado e substituído por nome gerado no servidor', 'Definir o diretório final', 'Controlar o tipo executável'], correct: 1, explanation: 'Nomes gerados evitam traversal, colisões e interpretações divergentes.' }
    ],
    finalChallenge: { title: 'Operação Cofre Aberto', brief: 'Correlacione validação de metadados, interpretação do nome e ciclo de vida para demonstrar três falhas locais sem tocar no filesystem real.', bonus: 1000, requiredLabIds: ['upload-type-path-5', 'upload-extension-5', 'upload-race-impact-5'], tasks: ['Mostre uma discrepância entre tipo declarado e conteúdo virtual.', 'Faça validação e armazenamento discordarem sobre a extensão.', 'Observe um objeto temporário antes de sua promoção segura.'] }
  },
  {
    id: 'nosql-injection', order: 11, name: 'Injeção NoSQL', shortName: 'INJEÇÃO NOSQL', source: 'burp/injeçãoNoSQL.txt', color: '#24c7b1',
    hero: { tag: 'MÓDULO 11 · INJEÇÃO NOSQL', lead: 'COMPARE A CONSULTA.', accent: 'CONTROLE A ESTRUTURA.', description: 'Investigue sintaxe, operadores, autenticação, extração e tempo em consultas documentais inteiramente simuladas.' },
    dashboard: {
      eyebrow: 'DOCUMENTOS, PREDICADOS E OPERADORES', description: 'Da entrada do cliente à decisão de filtragem sobre coleções fictícias em memória.',
      request: 'POST /nosql/query/nosql-operator-auth/1 HTTP/1.1\nHost: 127.0.0.1:3000\nContent-Type: application/json\n\n{ "action": "login",\n  "username": "student",\n  "password": "training-pass" }\n\nQUERY ENGINE: deterministic virtual predicate\nDATABASE: none',
      steps: [['REGISTRE A LINHA DE BASE', 'Observe status, contagem, forma e tempo virtual.', 'input → predicate → result'], ['MUDE UMA DIMENSÃO', 'Separe erros de sintaxe, Booleanos e operadores.', 'false ≠ true'], ['EXTRAIA EVIDÊNCIA', 'Reconstrua somente o dado fictício necessário.', 'field · prefix · delay'], ['CORRIJA A FRONTEIRA', 'Valide estrutura e permita chaves conhecidas.', 'schema + allowlist']]
    },
    glossary: [
      ['Banco NoSQL', 'Modelo de armazenamento que pode organizar dados como documentos, pares chave-valor, grafos ou famílias de colunas.'],
      ['Injeção de sintaxe', 'Alteração da gramática textual usada para construir uma consulta dinâmica.'],
      ['Injeção de operador', 'Introdução de uma estrutura que muda o predicado esperado, como comparação, conjunto ou expressão regular.'],
      ['Consulta Booleana', 'Teste que compara respostas produzidas por uma condição falsa e outra verdadeira.'],
      ['Descoberta de campo', 'Inferência controlada sobre a existência ou o nome de propriedades em um documento fictício.'],
      ['Canal temporal', 'Diferença de tempo usada como evidência quando o conteúdo da resposta não revela diretamente o resultado.']
    ],
    checklist: ['Capture uma consulta normal e sua resposta.', 'Altere um campo por vez e compare erro, contagem, forma e tempo.', 'Diferencie texto de estrutura antes de testar operadores.', 'Use sequências falsa e verdadeira para sustentar a hipótese.', 'Trate toda extração como dado fictício do lab.', 'Valide schema, tipos e chaves permitidas antes de formar a consulta.'],
    quiz: [
      { id: 'nosql-q1', question: 'Qual é a diferença central entre injeção de sintaxe e de operador?', options: ['Sintaxe altera a gramática; operador altera a estrutura ou o predicado', 'Sintaxe existe apenas em SQL', 'Operador exige rede externa', 'Não existe diferença'], correct: 0, explanation: 'As duas classes mudam a consulta por caminhos diferentes e exigem observação do formato recebido pelo servidor.' },
      { id: 'nosql-q2', question: 'Por que comparar uma condição falsa com uma verdadeira é importante?', options: ['Para aumentar o tamanho da resposta', 'Para atribuir a diferença observada à condição controlada', 'Para criar um usuário real', 'Para executar JavaScript'], correct: 1, explanation: 'Uma linha de base diferencial reduz falsos positivos e produz evidência comportamental.' },
      { id: 'nosql-q3', question: 'O que torna perigoso aceitar objetos arbitrários em um campo de login?', options: ['Objetos sempre são mais lentos', 'O objeto pode ser interpretado como um operador em vez de um valor', 'JSON não suporta strings', 'O navegador bloqueia objetos'], correct: 1, explanation: 'O servidor deve validar tipo e schema para impedir que dados do cliente se tornem estrutura de consulta.' },
      { id: 'nosql-q4', question: 'Qual defesa é mais apropriada?', options: ['Remover apenas aspas', 'Validar tipos, permitir somente chaves esperadas e usar APIs seguras de consulta', 'Ocultar mensagens no CSS', 'Confiar no Content-Type'], correct: 1, explanation: 'Defesa efetiva controla valores e estrutura, independentemente da representação usada pelo cliente.' }
    ],
    finalChallenge: { title: 'Operação Coleção Fantasma', brief: 'Correlacione alteração de sintaxe, descoberta de campo e um canal temporal para provar uma cadeia NoSQL inteiramente local.', bonus: 1000, requiredLabIds: ['nosql-syntax-5', 'nosql-operator-exfil-5', 'nosql-time-5'], tasks: ['Demonstre uma diferença Booleana sustentada por linha de base.', 'Descubra e valide um campo fictício sem receber o documento completo.', 'Confirme a mesma hipótese por atraso somente simulado.'] }
  }
]);

function publicModules() {
  return MODULES.map(module => ({
    ...module,
    quiz: module.quiz.map(({ correct, explanation, ...question }) => question),
    finalChallenge: { ...module.finalChallenge, requiredLabIds: undefined }
  }));
}

function findQuestion(questionId) {
  for (const module of MODULES) {
    const question = module.quiz.find(item => item.id === questionId);
    if (question) return { module, question };
  }
  return null;
}

module.exports = { MODULES, publicModules, findQuestion };
