# Pendências para concluir a melhoria geral

Este documento acompanha o trabalho necessário para manter os 385 exercícios como laboratórios locais consistentes, observáveis e didáticos. Ele deve ser atualizado conforme os itens forem concluídos.

## Situação atual

- [x] Mapear a arquitetura, as 57 trilhas e os 285 labs existentes.
- [x] Ler as referências locais da PortSwigger em `burp/` e `Auth.txt`.
- [x] Substituir os gatilhos por palavras dos labs de LLM por ações estruturadas, ferramentas virtuais e estado por laboratório.
- [x] Substituir os gatilhos dos labs de autenticação por fluxos com credenciais fictícias, cookies, contadores, MFA, tokens persistentes e redefinição de senha.
- [x] Substituir os gatilhos de Path Traversal por um pipeline de decodificação, filtragem, validação e resolução sobre um sistema de arquivos virtual.
- [x] Melhorar o simulador de Web Cache com chave, regra, normalização, TTL, headers de diagnóstico e limite de entradas.
- [x] Adicionar requisição inicial, condição de sucesso e protocolo de investigação ao catálogo dos labs.
- [x] Corrigir a listagem de trilhas por módulo e melhorar o modal dos labs.
- [x] Remover a dependência externa do Google Fonts e adicionar ajustes responsivos e de acessibilidade.

## O que falta fazer

### 1. Testes automatizados

- [x] Substituir a suíte antiga, que ainda usa palavras-gatilho, por fluxos completos dos 285 labs.
- [x] Testar explicitamente que palavras como `admin`, `sql` e `xss` sozinhas não concluem labs.
- [x] Validar cookies e transições de estado nos cinco labs de MFA.
- [x] Validar rate limit, lockout, arrays de senhas e arrays de credenciais.
- [x] Validar emissão, composição e falsificação dos cinco formatos de cookie persistente.
- [x] Validar todas as etapas dos fluxos de redefinição de senha e o uso único dos tokens.
- [x] Validar os 25 pipelines de Path Traversal com os caminhos canônicos esperados.
- [x] Validar MISS/HIT, conteúdo privado e headers dos 40 labs de cache.
- [x] Testar limites de corpo, JSON inválido, módulos inválidos, rotas inexistentes e headers de segurança.
- [x] Confirmar persistência e reset do progresso após concluir os 285 labs.

### 2. Conteúdo didático

- [x] Revisar os novos blocos de protocolo adicionados às lições especializadas.
- [x] Conferir se objetivo, condição de sucesso, evidência e mitigação estão coerentes em todos os níveis.
- [x] Documentar as credenciais e dados exclusivamente fictícios usados nos labs.
- [x] Explicar claramente o que é simulado: nenhuma chamada LLM externa, rede externa, JavaScript hostil ou acesso ao sistema de arquivos real.
- [x] Atualizar o README e o plano técnico para refletirem os motores stateful atuais.
- [x] Criar uma matriz final ligando cada trilha ao conceito oficial, comportamento vulnerável, evidência observável e defesa.

### 3. Interface e experiência de uso

- [x] Executar o fluxo completo pela interface e corrigir erros de integração.
- [x] Validar o request viewer, a cópia de requisições, dicas, anotações e conteúdo original.
- [x] Conferir navegação, menu lateral, modal e formulários em desktop.
- [x] Conferir os mesmos fluxos em largura de celular e corrigir overflow ou controles inacessíveis.
- [x] Confirmar estados de foco, atributos ARIA e navegação básica por teclado.
- [x] Verificar o console do navegador e garantir que não existam erros nem requisições externas inesperadas.

### 4. Robustez e manutenção

- [x] Revisar entradas malformadas e casos extremos dos parsers.
- [x] Conferir que dados internos de solução não sejam expostos por `/api/course`.
- [x] Executar `npm test`, verificações de sintaxe e `git diff --check`.
- [x] Revisar o diff final sem alterar nem remover materiais de referência do usuário.
- [x] Registrar limitações restantes e oportunidades futuras sem apresentar os simuladores como aplicações reais isoladas.

### 5. Auditoria de falsos positivos

- [x] Exigir duas chaves independentes nos níveis avançados de cache buster.
- [x] Vincular o bypass de rate limit ao mesmo IP fictício.
- [x] Rejeitar exclusão de usuário inexistente e operação administrativa vazia.
- [x] Vincular cookies persistentes ao alvo descrito pela condição do nível.
- [x] Exigir caminho canônico e representação específicos em cada lab de Path Traversal.
- [x] Adicionar regressões negativas para técnica, alvo, chave, estado e pré-condição incorretos.

### 6. Aprendizagem e recursos avançados

- [x] Adicionar contexto, atores, impacto e anotações próprias a cada lab.
- [x] Liberar dicas uma por vez sem publicá-las no catálogo.
- [x] Liberar explicação e sequência HTTP correta somente depois da conclusão.
- [x] Adicionar relatório Markdown por lab e relatório geral.
- [x] Adicionar glossário, quiz, revisão de erros e checklist por módulo.
- [x] Adicionar desafio final integrador aos onze módulos existentes.
- [x] Calcular XP real, métricas por técnica e histórico de tentativas.
- [x] Adicionar perfis de estudo, banco de questões e simulado local.
- [x] Tornar metadados e controles de módulos orientados pelo catálogo.
- [x] Criar registro local de plugins sem instalar conteúdo da Fase 3.

### 7. Mini sites por laboratório

- [x] Adicionar uma URL navegável própria para cada um dos 285 labs atuais.
- [x] Criar aplicações contextuais para cache, LLM, autenticação, Path Traversal, OS Command Injection, Lógica de Negócios, Teste de API, Divulgação de Informações, Controle de Acesso e Upload de Arquivos.
- [x] Fazer os formulários chamarem os mesmos motores locais interceptáveis pelo Burp.
- [x] Adicionar controles de sessão fictícia, cookies, ações estruturadas e editor JSON quando necessários.
- [x] Mostrar requisição, headers, resposta e sinal comportamental sem executar conteúdo hostil.
- [x] Validar todos os mini sites sem recursos externos nem exposição de payloads de solução.

### 8. Expansão de conteúdo

- [x] Renomear a referência fornecida para `burp/CommandInjection.txt` após confirmar que o conteúdo trata de OS Command Injection.
- [x] Criar o módulo OS Command Injection com cinco trilhas, 25 mini sites, teoria, glossário, quiz, checklist e desafio final.
- [x] Simular saída direta, atraso, redirecionamento, OAST e exfiltração sem processos, arquivos ou rede reais.
- [x] Adicionar o vídeo fornecido no final da trilha sem carregamento automático de conteúdo externo.
- [x] Integrar a referência `burp/regadenogocio.txt` ao catálogo e à visualização de conteúdo original.
- [x] Criar o módulo Lógica de Negócios com cinco trilhas, 25 mini sites, teoria, glossário, quiz, checklist e desafio final.
- [x] Simular preços, pedidos, etapas, canais, cupons, pontos e saldos exclusivamente em memória.
- [x] Adicionar regressões negativas para preço normal, alvo incorreto, canal protegido, etapa isolada e benefício incompleto.
- [x] Integrar `burp/testedeapi.txt` ao catálogo, à teoria e à consulta de conteúdo original.
- [x] Criar o módulo Teste de API com cinco trilhas, 25 mini sites, glossário, quiz, checklist e desafio final.
- [x] Simular documentação, métodos, formatos, parâmetros ocultos, atribuição em massa e poluição de parâmetros sem rede ou dados reais.
- [x] Exigir evidência comportamental, incluindo sequência `PATCH → GET` e requisição interna virtual construída.
- [x] Integrar `burp/vulnerabilidadesdedivulgaçãodeinformações.txt` ao catálogo, à teoria e ao conteúdo original.
- [x] Criar Divulgação de Informações com cinco trilhas, 25 mini sites e desafio final.
- [x] Simular robots, sitemap, comentários, erros, debug, contas, backups e Git sem acessar arquivos ou segredos reais.
- [x] Adicionar regressões para entrada válida, sequência incompleta e artefato correto consultado fora de ordem.
- [x] Integrar `burp/Access controlvulnerabilitiesandprivilegeescalation.txt` ao catálogo, à teoria e ao conteúdo original.
- [x] Criar Controle de Acesso com cinco trilhas, 25 mini sites, glossário, quiz, checklist e desafio final.
- [x] Simular funções, rotas, métodos, ownership, objetos e contexto apenas com identidades e estado fictícios em memória.
- [x] Adicionar regressões para recurso próprio, GUID fora de sequência, método protegido e cadeia de objeto incompleta.
- [x] Integrar `burp/Vulnerabilidadesnouploaddearquivos.txt` ao catálogo, à teoria e ao conteúdo original.
- [x] Criar Upload de Arquivos com cinco trilhas, 25 mini sites, glossário, quiz, checklist e desafio final.
- [x] Simular MIME, destinos, extensões, conteúdo composto, PUT, objetos temporários, importação local e quota somente em memória.
- [x] Adicionar regressões para upload seguro, objeto ausente, tipo incorreto e finalização temporária fora de sequência.
- [x] Integrar `burp/injeçãoNoSQL.txt` ao catálogo, à teoria e ao conteúdo original.
- [x] Criar Injeção NoSQL com cinco trilhas, 25 mini sites, glossário, quiz, checklist e desafio final.
- [x] Simular sintaxe, Booleanos, operadores, autenticação, inferência e tempo apenas com coleções e predicados declarativos em memória.
- [x] Adicionar regressões para consulta normal, condição verdadeira isolada, operador com credencial divergente e atraso sem condição.
- [x] Incorporar o inventário de materiais fornecido pelo desenvolvedor para Race Conditions, GraphQL, Prototype Pollution, habilidades essenciais, SQL Injection, XSS, CSRF, XXE, Clickjacking, CORS, SSRF, Request Smuggling, SSTI, desserialização, OAuth, WebSockets, DOM, Cache Poisoning, Host Header e JWT.
- [x] Criar cinco mini labs progressivos para cada um dos 20 temas adicionais, com baseline obrigatório, variante estruturada, evidência observável e mitigação.

## Critério de conclusão

O trabalho estará concluído quando os 385 labs tiverem mini sites navegáveis e forem resolvidos por testes comportamentais, os fluxos negativos não produzirem falsos positivos, a interface estiver validada em desktop e mobile, a documentação refletir o funcionamento real e não houver erro de sintaxe, teste, console ou formatação no diff.
