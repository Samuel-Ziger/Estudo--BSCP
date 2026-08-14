# BSCP//Forge — Training System

Plataforma local e modular para estudar segurança web com o Burp Suite. O catálogo atual possui 31 módulos, 77 trilhas e 385 mini labs progressivos. Cada lab abre um mini site navegável próprio e é validado por comportamento observável.

## Executar

Requer Node.js 18 ou superior e não precisa instalar dependências:

```bash
npm start
```

Abra `http://127.0.0.1:3000`. Para usar outra porta, defina a variável `PORT` antes de iniciar o processo. Escolha um lab e clique em **Abrir mini site**. Para treinar com o Burp, configure esse navegador para passar pelo proxy, use os formulários da aplicação e confirme as requisições capturadas no Repeater.

O progresso é salvo em `.data/progress.json`. O botão **Reiniciar labs** limpa cache, sessões, contadores e demais estados efêmeros, sem apagar o progresso. O botão **Zerar progresso** remove conclusões, tentativas, dicas liberadas, histórico de quiz e desafios finais. Caderno, checklists e relatórios permanecem no armazenamento local do navegador.

## Como os labs funcionam

Cada item do catálogo possui uma URL estável no formato `/site/<lab-id>`. O mini site é uma aplicação fictícia completa para o cenário: tem identidade visual, navegação, formulários, cookies quando necessários e um console que mostra a última requisição e a resposta observável. A interface chama o mesmo motor local usado pelo Burp; ela não substitui a vulnerabilidade por uma demonstração visual.

- **Web Cache Deception — 40 labs:** chave, regra, normalização, TTL, headers de diagnóstico e respostas públicas ou privadas em um cache de memória limitado.
- **Web LLM — 20 labs:** agente determinístico, ferramentas virtuais, argumentos estruturados, fontes indiretas e sinks de saída; não há modelo externo.
- **Autenticação — 25 labs:** credenciais fictícias, cookies, rate limit, lockout, MFA, tokens persistentes e fluxos de redefinição com estado separado por lab.
- **Path Traversal — 25 labs:** filtro, decoding, validação e canonicalização sobre um sistema de arquivos totalmente virtual.
- **OS Command Injection — 25 labs:** saída direta, atraso cego, redirecionamento, interação OAST e exfiltração sobre shell, arquivos, relógio, DNS e rede totalmente virtuais.
- **Lógica de Negócios — 25 labs:** confiança no cliente, entradas incomuns, sequência de etapas, validação inconsistente e abuso de regras do domínio sobre pedidos e valores fictícios.
- **Teste de API — 25 labs:** reconhecimento e documentação, métodos e formatos, parâmetros ocultos, atribuição em massa e poluição de parâmetros sobre endpoints, objetos e requisições internas virtuais.
- **Divulgação de Informações — 25 labs:** artefatos públicos, erros detalhados, debug e configuração, dados de contas, backups e histórico Git sobre respostas e arquivos exclusivamente virtuais.
- **Controle de Acesso — 25 labs:** escalonamento vertical e horizontal, discrepâncias de rota e método, IDOR e controles contextuais sobre identidades, funções e objetos exclusivamente fictícios.
- **Upload de Arquivos — 25 labs:** interpretação virtual, confiança em MIME, caminhos de destino, extensões, conteúdo composto, métodos alternativos, objetos temporários e quota sobre um cofre totalmente em memória.
- **Injeção NoSQL — 25 labs:** sintaxe e Booleanos, operadores em autenticação, inferência de campos e prefixos e canal temporal declarado sobre coleções documentais fechadas em memória.
- **20 temas adicionais — 100 labs:** Race Conditions, GraphQL, Prototype Pollution, habilidades essenciais, SQL Injection, XSS, CSRF, XXE, Clickjacking, CORS, SSRF, Request Smuggling, SSTI, desserialização, OAuth, WebSockets, DOM, Cache Poisoning, Host Header e JWT, todos com cinco níveis sobre um motor declarativo fechado.

Cada lab informa cenário, atores fictícios, objetivo, requisição inicial, condição de sucesso, protocolo, evidência, impacto, reflexão, mitigação e anotações próprias. As dicas são liberadas uma por vez. Depois da conclusão, a API libera a explicação, a sequência HTTP correta, a interpretação dos componentes e um relatório exportável. Os níveis CTF não expõem dicas nem o payload interno usado pelos testes.

## Recursos de aprendizagem

Os 31 módulos atuais possuem:

- glossário e checklist interativo;
- quiz por seção com validação no servidor;
- revisão das questões cujo último resultado foi incorreto;
- desafio final integrador com bônus de XP;
- perfis Guiado, Padrão e Especialista;
- métricas de conclusão, tentativas e observações por técnica;
- banco de questões e simulado local;
- exportação de relatório por lab e relatório geral em Markdown.

O catálogo publica perguntas sem respostas, labs sem dicas e sem campos internos de solução. Dicas são liberadas por uma API progressiva e soluções somente após a conclusão comportamental.

Nos labs de cache com dados privados, a vítima simulada usa:

```http
Cookie: session=victim
```

Envie primeiro a URL explorável com esse cookie e depois repita a mesma URL sem o cookie para confirmar o `HIT` e recuperar apenas o segredo fictício.

## Dados fictícios de treinamento

Estas identidades existem somente dentro do simulador local:

| Usuário | Senha | Uso principal |
| --- | --- | --- |
| `attacker` | `attacker` | conta controlada pelo estudante |
| `carlos` | `montoya` | enumeração, força bruta e cookies persistentes |
| `victim-user` | `summer2026` | MFA, cache privado e redefinição de senha |
| `administrator` | `admin-secret` | conta privilegiada virtual |
| `wiener` | `peter` | conta adicional de treinamento |
| `guest` | `password1` | conta adicional de treinamento |

Os códigos MFA usados pelos cenários são `111111` para a conta do atacante, `123456` para a vítima, `654321` no cenário de reutilização e `0042` nos cenários de força bruta. Tokens, chaves de API, e-mails, pedidos, arquivos e segredos retornados também são artefatos fictícios.

## Limites de segurança da simulação

O BSCP//Forge foi feito para execução local e didática:

- não chama LLMs, APIs, sites, CDNs, servidores de e-mail ou provedores de identidade externos;
- não executa JavaScript fornecido pelos labs nem renderiza a saída hostil em um navegador real;
- não lê nem grava arquivos do sistema operacional por meio dos labs de Path Traversal;
- não inicia processos, executa comandos, grava arquivos ou faz consultas de rede reais nos labs de OS Command Injection;
- não cria pedidos, pagamentos, créditos, gift cards ou benefícios reais nos labs de Lógica de Negócios;
- não faz reconhecimento externo nem chama APIs internas ou de terceiros nos labs de Teste de API; contratos, objetos e requisições internas são simulações em memória;
- não lê backups, repositórios ou segredos reais nos labs de Divulgação de Informações; respostas, contas, arquivos e histórico são fixtures fechadas em memória;
- não consulta contas, diretórios, provedores de identidade ou mecanismos de autorização reais nos labs de Controle de Acesso; funções, objetos e decisões ficam em memória;
- não grava uploads, consulta diretórios reais, executa scripts ou JavaScript, abre documentos em parsers reais nem importa URLs nos labs de Upload; todo objeto e efeito fica em um mapa fechado em memória;
- não consulta um banco NoSQL, executa JavaScript, compila expressões arbitrárias nem realiza atrasos reais nos labs de Injeção NoSQL; documentos, predicados e tempos são modelos declarativos em memória;
- não usa credenciais, contas, tokens ou dados reais;
- não representa uma aplicação vulnerável isolada pronta para exposição pública.

Somente o progresso é persistente. Cache, sessões, códigos usados, contadores, regras de encaminhamento e tokens de reset ficam em memória e são descartados ao reiniciar o servidor.

## Testar

```bash
npm test
```

A suíte integrada:

- resolve os 385 labs pelos fluxos comportamentais completos;
- confirma que palavras como `admin`, `sql` e `xss` não geram falsos positivos;
- rejeita técnica errada, alvo incorreto, uma única chave quando duas são exigidas, operações vazias e estado armado em outro IP;
- verifica MFA, rate limit, lockout, arrays, cinco formatos de cookie e tokens de uso único;
- valida os 25 caminhos canônicos e os 40 fluxos `MISS → HIT`;
- abre os 385 mini sites e verifica formulário do módulo, CSP de mesma origem, ausência de recursos externos e proteção contra vazamento de solução;
- valida métodos HTTP, tipos de conteúdo, parâmetros ocultos, sequências `PATCH → GET` e requisições internas virtuais nos 25 labs de Teste de API;
- valida artefatos, respostas diferenciais, TRACE virtual, dados de conta e sequências de histórico nos 25 labs de Divulgação de Informações;
- valida identidade, propriedade, normalização de rotas, métodos e transições de estado nos 25 labs de Controle de Acesso;
- valida MIME, canonicalização de nomes, extensões, processamento, PUT, objetos temporários e quota nos 25 labs de Upload sem tocar no disco ou executar conteúdo;
- valida comparações falsa/verdadeira, tipos estruturados, descoberta de campos, prefixos e tempo somente simulado nos 25 labs de Injeção NoSQL;
- testa catálogo modular, dicas, soluções protegidas, quiz, simulado, desafios finais, plugins locais, limites de corpo, JSON inválido, headers, persistência e resets.

## Organização

- `server.js` — catálogo, API, cache, arquivos estáticos e persistência do progresso.
- `lib/lab-simulator.js` — motores stateful de LLM, autenticação, Path Traversal, OS Command Injection, Lógica de Negócios, Teste de API, Divulgação de Informações, Controle de Acesso, Upload de Arquivos e Injeção NoSQL.
- `lib/mini-site.js` — renderização orientada por dados dos 385 mini sites.
- `lib/course-curriculum.js` e `lib/extended-curriculum.js` — metadados, glossários, checklists, quizzes e desafios dos 31 módulos.
- `lib/plugin-registry.js` e `plugins/` — registro local para módulos futuros, sem instalação ou rede externa.
- `tests/smoke.js` — suíte comportamental integrada dos 385 labs.
- `public/index.html`, `public/app.js` e folhas de estilo — interface responsiva e acessível da academia.
- `public/lab-site.js` e `public/lab-site.css` — interações e apresentação das aplicações de laboratório.
- `public/*-lessons.js` — aulas especializadas e protocolos de cada engine.
- `burp/`, `Auth.txt` e `Webcache.txt` — materiais de referência preservados, incluindo `burp/CommandInjection.txt`, `burp/regadenogocio.txt`, `burp/testedeapi.txt`, `burp/vulnerabilidadesdedivulgaçãodeinformações.txt`, `burp/Access controlvulnerabilitiesandprivilegeescalation.txt`, `burp/Vulnerabilidadesnouploaddearquivos.txt` e `burp/injeçãoNoSQL.txt`.
- `MATRIZ_DOS_LABS.md` — rastreabilidade entre trilha, conceito, comportamento, evidência e defesa.
- `PLANO_DO_SISTEMA.md` — arquitetura e evolução técnica.

Para adicionar um módulo, registre trilhas e receitas no catálogo, implemente o comportamento no simulador correspondente e mantenha a interface consumindo `/api/course`. Uma nova trilha deve incluir cinco níveis e testes positivos e negativos.

Plugins em `plugins/` são código Node.js local confiável, carregado sem sandbox. Revise cada arquivo antes de adicioná-lo e nunca instale plugins recebidos por upload ou por origem remota.

## Limitações e próximos passos

Os simuladores abstraem componentes reais para tornar cada conceito observável. Eles não reproduzem todas as particularidades de frameworks, CDNs, modelos, sistemas de arquivos ou mecanismos de identidade de produção.

O inventário fornecido pelo desenvolvedor está preservado em `PORTSWIGGER_MATERIALS.md`. Os 20 novos temas usam um motor declarativo comum para garantir execução local e cinco níveis por tema; aprofundamentos futuros podem substituir cada receita declarativa por um motor especializado sem mudar o contrato público.
