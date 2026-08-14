# BSCP//Forge — Plano do sistema de estudos

## 1. Visão do projeto

O BSCP//Forge é uma plataforma local, interativa e modular para preparar o estudo da certificação BSCP. O sistema transforma conteúdos teóricos de segurança web em uma trilha prática, com explicações progressivas, exemplos de requisições HTTP e mini laboratórios resolvidos com o Burp Suite.

A versão atual contém 31 módulos, 77 trilhas e 385 laboratórios comportamentais. Além dos onze motores especializados, o inventário fornecido pelo desenvolvedor acrescenta 20 temas com cinco níveis declarativos cada, preservando o mesmo contrato pedagógico e o isolamento local.

## Module 04 — Path Traversal

O módulo possui cinco trilhas e 25 labs sobre traversal básico, caminhos absolutos, remoção não recursiva, encoding, validação de diretório base e bypass de extensão com null byte.

## Módulo 05 — OS Command Injection

O conteúdo integral está em `burp/CommandInjection.txt`. O módulo possui cinco trilhas e 25 labs sobre saída direta, detecção cega por tempo, redirecionamento de saída, interação OAST e exfiltração virtual. Cada lab é um mini site da loja fictícia ForgeSupply e produz tráfego local interceptável pelo Burp.

O motor interpreta apenas uma gramática educacional restrita. Comandos, relógio, arquivos, processos, DNS e rede são objetos virtuais mantidos em memória; nenhum comando do sistema operacional é executado. O vídeo fornecido pelo estudante aparece ao fim da trilha como link explícito e não é carregado automaticamente.

## Módulo 06 — Vulnerabilidades na Lógica de Negócios

O conteúdo integral está em `burp/regadenogocio.txt`. O módulo possui cinco trilhas e 25 labs sobre confiança excessiva no cliente, entradas incomuns, sequência de etapas, validação inconsistente entre canais e abuso de regras específicas do domínio.

Cada lab abre o marketplace fictício LoopMarket. Pedidos, saldos, descontos, cupons, pontos e gift cards ficam isolados em memória por laboratório. O motor registra premissa, decisão, transição e efeito observável sem movimentar dinheiro ou chamar qualquer serviço externo.

## Módulo 07 — Teste de API

O conteúdo integral está em `burp/testedeapi.txt`. O módulo possui cinco trilhas e 25 labs sobre reconhecimento e documentação, métodos e tipos de conteúdo, parâmetros ocultos, atribuição em massa e poluição de parâmetros no servidor.

Cada lab abre o portal fictício AtlasAPI, com explorador de requisições, verbos HTTP, formatos e console de resposta. Contratos, endpoints, registros e requisições internas são objetos locais e determinísticos. A atribuição em massa exige alteração seguida de leitura do recurso; a poluição de parâmetros mostra a requisição interna construída, mas nunca inicia uma conexão.

## Módulo 08 — Vulnerabilidades de Divulgação de Informações

O conteúdo integral está em `burp/vulnerabilidadesdedivulgaçãodeinformações.txt`. O módulo possui cinco trilhas e 25 labs sobre artefatos públicos, mensagens de erro, depuração e configuração, dados de contas, arquivos de backup e histórico de versão.

Cada lab abre o BeaconPortal e gera respostas interceptáveis pelo Burp. Robots, sitemaps, stack traces, contas, backups e objetos Git pertencem a mapas fechados em memória. O motor nunca enumera alvos externos, lê o filesystem real nem utiliza segredos verdadeiros.

## Módulo 09 — Vulnerabilidades de Controle de Acesso e Escalonamento de Privilégios

O conteúdo integral está em `burp/Access controlvulnerabilitiesandprivilegeescalation.txt`. O módulo possui cinco trilhas e 25 labs sobre escalonamento vertical, discrepâncias de rota e método, escalonamento horizontal, referências diretas a objetos e controles dependentes de contexto.

Cada lab abre o workspace fictício Gatehouse. Identidades, funções, contas, registros, downloads, projetos, etapas e decisões de autorização são objetos locais mantidos em memória. O motor não consulta diretórios, provedores de identidade, arquivos ou mecanismos de autorização reais.

## Módulo 10 — Vulnerabilidades no Upload de Arquivos

O conteúdo integral está em `burp/Vulnerabilidadesnouploaddearquivos.txt`. O módulo possui cinco trilhas e 25 labs sobre interpretação de uploads, confiança em tipo declarado e destino, extensões e regras de configuração, conteúdo e processamento, métodos alternativos, corridas e impacto sobre disponibilidade.

Cada lab abre a biblioteca fictícia FrameVault. Arquivos, diretórios, handlers, parsers, objetos temporários, quotas e saídas existem apenas em mapas fechados em memória. O motor não lê nem grava o filesystem real, não executa código ou JavaScript, não abre documentos em parsers reais e não faz importações de rede.

## Módulo 11 — Injeção NoSQL

O conteúdo integral está em `burp/injeçãoNoSQL.txt`. O módulo possui cinco trilhas e 25 labs sobre injeção de sintaxe, respostas Booleanas, terminadores, operadores em autenticação, inferência de campos e valores e detecção por tempo.

Cada lab abre o catálogo documental fictício QueryNest. Produtos, usuários, campos e marcadores pertencem a coleções fechadas em memória. O motor aceita somente predicados declarativos conhecidos; não consulta banco NoSQL, não usa `eval`, não executa JavaScript ou regex arbitrária e representa atrasos apenas como valores na resposta.

## Módulo 03 — Vulnerabilidades de Autenticação

O módulo possui cinco trilhas e 25 labs sobre enumeração de usuários, força bruta e proteções falhas, autenticação multifator, sessões persistentes e recuperação ou alteração de senha. Os cenários usam somente contas e credenciais fictícias locais.

## Módulo 02 — Ataques de Web LLM

O conteúdo integral está em `burp/burpLLM.txt` e possui quatro trilhas práticas, com cinco labs cada:

- Agência excessiva em APIs LLM — descoberta de ferramentas, funções e permissões.
- Encadeamento de vulnerabilidades — uso do modelo como ponte para path traversal, SQLi e outras falhas clássicas.
- Injeção imediata indireta — instruções hostis vindas de e-mails, páginas e fontes externas.
- Manuseio de saída inseguro — respostas do modelo que chegam ao navegador ou a outros sistemas sem sanitização.

Os labs usam um assistente simulado e dados fictícios. O foco é aprender a mapear a superfície, observar chamadas de ferramentas, testar limites de confiança e registrar o impacto sem interagir com modelos ou APIs de terceiros.

## 2. Objetivos de aprendizagem

- Entender o conceito antes de memorizar payloads.
- Aprender uma metodologia repetível de investigação.
- Observar diferenças entre navegador, cache, CDN e servidor de origem.
- Praticar interceptação, alteração e repetição de requisições no Burp Suite.
- Reconhecer sinais de cache por headers, tempo e comportamento.
- Explicar impacto, evidência e correção como em um relatório profissional.

## 3. Estrutura de cada módulo

Cada módulo deve conter:

1. Visão geral do tema.
2. Glossário dos termos importantes.
3. Explicação didática em blocos curtos.
4. Conteúdo de referência integral fornecido pelo estudante.
5. Diagramas de fluxo.
6. Exemplos de requisições e respostas HTTP.
7. Trilhas práticas separadas por técnica.
8. Cinco mini labs por técnica.
9. Desafio final misturando técnicas.
10. Resumo, prevenção e checklist de revisão.

## 4. Módulo Web Cache Deception

O módulo inicial contém oito trilhas, com cinco labs cada, totalizando 40 desafios:

| Trilha | O que treina |
| --- | --- |
| Detectando respostas em cache | `X-Cache`, `Age`, `Cache-Control`, tempo e confirmação de HIT/MISS |
| Cache busters e chaves | Isolamento de testes e influência de query strings na cache key |
| Mapeamento de caminho | Diferença entre rota REST e interpretação de arquivo estático |
| Delimitadores | Caracteres como `;` e `.` processados de forma diferente |
| Delimitadores codificados | Diferenças ao decodificar `%23`, `%00`, `%0A` e outros caracteres |
| Normalização na origem | Origem resolve traversal codificado e ignora prefixo estático |
| Normalização no cache | Cache resolve traversal, enquanto a origem interpreta outro caminho |
| Correspondência exata de arquivo | Regras para `index.html`, `robots.txt` e `favicon.ico` |

### Progressão dos cinco labs

1. **Aprendiz** — reconhecimento guiado.
2. **Básico** — exploração com objetivo e dicas.
3. **Praticante** — descoberta da discrepância.
4. **Avançado** — vítima, sessão e recuperação de dados.
5. **CTF** — caixa-preta, sem revelar a técnica.

## 5. Padrão de um mini lab

Todo lab deve possuir:

- Mini site navegável em uma URL própria.
- Interface contextual com formulários que geram tráfego interceptável no Burp.
- Título e nível de dificuldade.
- Objetivo claro.
- Contexto do cenário.
- Endpoint inicial.
- Usuário vítima e usuário atacante, quando aplicável.
- Estado de cache controlado.
- Payload inicial ou pista inicial.
- Dicas progressivas.
- Flag ou condição de sucesso.
- Validação automática.
- Explicação pós-resolução.
- Requisição HTTP correta.
- Requisição HTTP exploratória.
- Interpretação do cache.
- Interpretação da origem.
- Impacto e correção.
- Campo para anotações.

## 6. Fluxo prático com Burp Suite

```text
Navegador configurado
        ↓
Burp Proxy / HTTP history
        ↓
Requisição enviada ao lab local
        ↓
Cache simulado
        ↓ cache miss
Servidor de origem vulnerável
        ↓
Resposta armazenada ou não
        ↓
Burp Repeater confirma o comportamento
```

Nos labs de exploração, o estudante deve:

1. Enviar a requisição com `Cookie: session=victim`.
2. Observar a resposta e os headers.
3. Repetir a mesma URL sem o cookie.
4. Confirmar que os dados privados vieram do cache.
5. Registrar a evidência e a correção.

## 7. Arquitetura técnica

### Frontend

- HTML, CSS e JavaScript sem dependências obrigatórias.
- Dashboard, trilha didática, labs, conteúdo original e caderno.
- Mini sites orientados por dados para cache, LLM, autenticação, Path Traversal, Command Injection, Lógica de Negócios, Teste de API, Divulgação de Informações e Controle de Acesso.
- Console local de requisição e resposta que complementa, sem substituir, a observação pelo Burp Suite.
- Layout responsivo para desktop, notebook e celular, com foco visível, regiões nomeadas, estado ARIA e navegação por teclado.
- Estado de progresso atualizado pela API.

### Backend

- Node.js usando o módulo HTTP nativo.
- Servidor local em `127.0.0.1:3000`.
- API de catálogo, progresso e conteúdo original.
- Cache simulado em memória.
- Rotas vulneráveis isoladas por lab.
- Motores stateful em `lib/lab-simulator.js` para LLM, autenticação, Path Traversal, OS Command Injection, Lógica de Negócios, Teste de API, Divulgação de Informações, Controle de Acesso, Upload de Arquivos e Injeção NoSQL.
- Validação automática baseada no comportamento observado, sem palavras-gatilho.
- Limites de corpo, erros JSON controlados e headers de segurança nas respostas.

### Segurança do ambiente

- Execução somente local.
- Nenhuma chamada para alvos externos.
- Dados fictícios de vítima.
- Cache resetável.
- Labs independentes entre si.
- Nenhuma chamada LLM ou rede externa, execução de JavaScript hostil, comando do sistema operacional, acesso ao sistema de arquivos real, processamento real de uploads, transação comercial ou consulta a um sistema de autorização real.

### Contratos atuais

- `/api/course` publica o catálogo sem `solutionPayload`.
- `/api/progress` consulta o progresso persistido; `/api/progress/reset` o remove.
- `/api/labs/reset` limpa cache, sessões, contadores e estados efêmeros.
- `/api/content/original` entrega apenas os onze materiais locais permitidos.
- `/api/labs/hints` libera dicas progressivamente; `/api/labs/result` entrega a solução somente depois da conclusão.
- `/api/quiz/answer`, `/api/exam/submit` e `/api/final-challenge/submit` validam os recursos de aprendizagem.
- `/site/<lab-id>` abre a aplicação navegável correspondente a cada um dos 385 labs.
- `/lab`, `/llm`, `/auth`, `/path`, `/cmd`, `/logic`, `/api-lab`, `/info`, `/access`, `/upload` e `/nosql` expõem os onze motores de treinamento.

A matriz completa de conceito, comportamento, evidência e defesa está em `MATRIZ_DOS_LABS.md`.

## 8. Experiência de estudo

O usuário poderá:

- Acompanhar percentual geral e progresso por trilha.
- Ganhar XP por desafio concluído.
- Liberar dicas gradualmente.
- Filtrar labs abertos e resolvidos.
- Guardar payloads e observações no caderno.
- Exportar anotações para revisão.
- Consultar o texto integral da fonte.
- Fazer um desafio final sem indicação da vulnerabilidade.

## 9. Modelo conceitual de dados

```text
Módulo
 ├── teoria
 ├── conteúdo_original
 ├── trilhas
 │    ├── técnica
 │    └── labs[1..5]
 ├── quiz
 ├── checklist
 └── desafio_final
```

Cada lab deve ser descrito por dados, e não espalhado pela interface. Assim será possível adicionar uma nova vulnerabilidade criando apenas um novo módulo, suas trilhas, cenários e regras de validação.

## 10. Roadmap

### Fase 1 — Base atual

- Dashboard inicial.
- Módulo Web Cache Deception.
- 40 labs locais.
- Simulador de cache.
- Conteúdo original preservado.
- Anotações e progresso.

### Fase 2 — Aprendizagem

- [x] Quiz por seção.
- [x] Revisão de erros.
- [x] Checklist interativo.
- [x] Relatório de exploração ao terminar cada lab.
- [x] Desafio final do módulo.

### Fase 3 — Expansão BSCP

**Concluída no escopo declarativo.** Os 20 temas adicionais fornecidos pelo desenvolvedor foram incorporados com cinco labs progressivos cada. Motores especializados poderão aprofundar cada tema sem alterar as URLs ou o contrato público.

- [x] Incorporar os 20 temas relacionados em `PORTSWIGGER_MATERIALS.md`.
- [x] Criar cinco níveis por tema, totalizando 100 novos labs.
- [x] Exigir baseline, comparação estruturada, evidência e mitigação.
- [x] Manter rede, execução, arquivos e dados reais desativados.

### Fase 4 — Recursos avançados

- [x] Perfis de dificuldade.
- [x] Banco de questões.
- [x] Modo simulado de prova.
- [x] Métricas por técnica.
- [x] Exportação de relatório.
- [x] Sistema local de plugins para módulos futuros.

## 11. Critério de qualidade de um novo módulo

Um módulo só deve ser considerado completo quando tiver:

- Teoria compreensível sem depender do lab.
- Fonte de referência identificada.
- Exemplos reproduzíveis localmente.
- Cinco labs por técnica.
- Dificuldade crescente.
- Dicas graduais.
- Validação automática.
- Explicação da solução.
- Prevenção da vulnerabilidade.
- Desafio final integrador.

## 12. Princípio pedagógico

O sistema deve ensinar o **processo de raciocínio**:

```text
Observar → Formular hipótese → Testar → Comparar respostas → Explorar → Provar impacto → Corrigir
```

O objetivo não é apenas encontrar uma flag. É fazer o estudante conseguir explicar por que a vulnerabilidade existe, como ela foi comprovada e como seria corrigida em uma aplicação real.

## 13. Estado de validação

A suíte integrada resolve os 385 labs por comportamento, incluindo os 100 labs declarativos adicionais, e cobre fluxos positivos, negativos, isolamento, headers, persistência e reset. Também abre todos os mini sites, valida o formulário de cada módulo, o isolamento de mesma origem e a proteção das soluções.

Os mini sites e simuladores continuam sendo abstrações didáticas locais. Cache, sessões, contadores e tokens efêmeros ficam em memória; somente o progresso é persistido. Eles não devem ser publicados nem usados como substitutos exatos de produtos reais.
