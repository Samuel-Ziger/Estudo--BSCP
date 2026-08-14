# Matriz de rastreabilidade dos laboratórios

Cada trilha contém cinco labs — Aprendiz, Básico, Praticante, Avançado e CTF — que exercitam o mesmo conceito com autonomia e impacto crescentes. A matriz liga o conteúdo de referência local ao comportamento do simulador, à evidência que deve ser registrada e à defesa correspondente.

| Módulo | Trilha | Conceito de referência | Comportamento vulnerável simulado | Evidência observável | Defesa principal |
| --- | --- | --- | --- | --- | --- |
| Web Cache | Detectando respostas em cache | Detecção de cache por headers e tempo | Recurso elegível passa de `MISS` para `HIT` | `X-Cache`, `Age`, chave, regra e tempo | Política de cache explícita e monitoramento coerente |
| Web Cache | Cache busters e chaves | Composição e isolamento da cache key | Query string cria entradas independentes | Duas chaves com sequências `MISS → HIT` próprias | Definir a chave corretamente e isolar testes |
| Web Cache | Mapeamento de caminho | Discrepância entre rota REST e arquivo estático | Origem ignora o sufixo; cache aplica regra de extensão | URL completa, `X-Origin-Path: /account` e segredo no `HIT` | Alinhar o parsing e nunca armazenar conteúdo autenticado |
| Web Cache | Discrepâncias de delimitadores | Delimitadores interpretados de forma diferente | Origem trunca em `;`; cache conserva a extensão | Caminho da origem versus regra `static-extension` | Normalizar delimitadores de modo uniforme |
| Web Cache | Delimitadores codificados | Ordem de decoding de delimitadores | Origem decodifica `%23`; cache usa a forma bruta | Chave codificada e origem resolvida para `/account` | Decodificar e validar uma única vez, de forma consistente |
| Web Cache | Normalização na origem | Segmentos de ponto resolvidos somente na origem | Prefixo `/assets` ativa o cache; origem chega a `/account` | Caminho normalizado e `X-Origin-Path` divergentes | Canonicalização consistente antes da decisão de cache |
| Web Cache | Normalização no cache | Normalização no cache combinada a delimitador | Cache resolve para `/static`; origem trunca para `/account` | `X-Cache-Normalized-Path` e origem divergentes | Usar a mesma representação canônica em todas as camadas |
| Web Cache | Correspondência exata | Regra para nomes de arquivo exatos | Normalização termina em arquivo especial, origem retorna conta | Regra `exact-filename` e resposta privada no `HIT` | Não sobrepor `private, no-store`; validar rota e tipo de conteúdo |
| Web LLM | Agência excessiva em APIs | Excessive agency e autorização de ferramentas | Agente revela e executa funções com privilégio excessivo | Schema, `tool_call`, argumentos e mudança de estado | Menor privilégio, autorização na API e confirmação |
| Web LLM | Encadeamento de vulnerabilidades | LLM como ponte para falhas web clássicas | Ferramentas virtuais permitem traversal, SSRF ou SQLi | Ferramenta, argumento perigoso e `tool_result` | Validar entradas na ferramenta e isolar recursos |
| Web LLM | Injeção imediata indireta | Indirect prompt injection e proveniência | Fonte externa é interpretada como comando confiável | `user_task`, `external_source`, instrução e ação criada | Preservar proveniência, delimitar dados e confirmar ações |
| Web LLM | Manuseio de saída inseguro | Insecure output handling | Sink virtual aceita HTML, eventos, URLs ou formulários | Achados do sink e consumidor afetado, sem execução real | Escapar e validar conforme o contexto de destino |
| Autenticação | Enumeração de usuários | Diferenças em mensagem, status, tamanho e tempo | Respostas distinguem conta existente de inexistente | Comparação controlada dos quatro sinais | Respostas uniformes e processamento equivalente |
| Autenticação | Força bruta e proteções falhas | Rate limit, lockout e entrada em lote | Contador pode ser reiniciado, lockout enumera e arrays ampliam tentativas | Contadores, `429`, forma aceita e credencial encontrada | Limites combinados, backoff e validação estrita de schema |
| Autenticação | Autenticação multifator | Vínculo entre fatores, identidade e código | Etapa pode ser pulada, cookie trocado, código reutilizado ou forçado | Sessão, primeiro fator, conta do cookie e tentativas | Vincular fatores no servidor, uso único e rate limiting |
| Autenticação | Sessões persistentes | Cookies previsíveis e quebra offline | Token deriva de usuário e senha/hash sem salt | Token emitido, composição decodificada e conta autenticada | Token aleatório, alta entropia, expiração e revogação |
| Autenticação | Recuperação e alteração de senha | Identidade, Host e revalidação do token | Formulário confia no cliente ou link pode ser envenenado | Cadeia `request → open → change`, host e token usado | Tokens aleatórios de uso único e identidade vinculada no servidor |
| Path Traversal | Basic Path Traversal | Traversal relativo em Unix e Windows | Caminho controlado escapa da pasta de imagens | Entrada, base, caminho canônico e arquivo virtual | Allowlist e verificação do caminho canonicalizado |
| Path Traversal | Absolute Paths & Stripping | Caminho absoluto e remoção não recursiva | Filtro único recria sequências de traversal | Etapas antes/depois do filtro e `/etc/passwd` virtual | Rejeitar caminhos absolutos e evitar filtros por substituição |
| Path Traversal | Encoded Traversal | Encoding, double encoding e separadores legados | Filtro roda antes de uma ou duas camadas de decoding | Valor bruto, `decode-1`, `decode-2` e caminho final | Decodificar uma vez, canonicalizar e validar depois |
| Path Traversal | Base Path Validation | Validação textual antes da canonicalização | `startsWith` aceita caminho que depois sai da base | `accepted=true`, caminho canônico e `escaped_base=true` | Comparar caminhos canônicos com fronteira de diretório |
| Path Traversal | Extension & Null Byte | Validação de extensão e truncamento por null byte | Entrada termina em `.png`, API virtual trunca em `%00` | `extension-check` e `native-null-truncation` | APIs seguras, rejeição de NUL e identificadores indiretos de arquivo |
| OS Command Injection | Saída direta | Entrada controlada incorporada a uma linha de comando | Shell virtual separa o argumento e produz uma segunda saída | Comando reconhecido, separador, contexto e saída virtual | Não invocar shell; usar API tipada e allowlist |
| OS Command Injection | Detecção cega por tempo | Atraso como canal lateral quando a saída não é retornada | Scheduler virtual registra duração somente para a sintaxe esperada | Tempo-base versus `simulated_delay_ms` | Eliminar o shell, validar o argumento e impor limites |
| OS Command Injection | Redirecionamento de saída | Saída de comando gravada em local depois consultado | Artefato virtual nasce de comando, separador e destino correspondentes | Primeira resposta cega e conteúdo recuperado em `/cmd/artifacts/...` | Diretórios sem escrita não corrigem a causa; remover composição de comandos |
| OS Command Injection | Interação OAST | Efeito externo como prova de execução cega | Resolvedor virtual registra apenas o hostname fictício esperado | Interação consultada em `/cmd/collaborator/...`, sem DNS real | Egress restrito como defesa em profundidade e API sem shell |
| OS Command Injection | Exfiltração OAST | Substituição de comando incorporada ao hostname | Shell virtual resolve um valor fictício e o adiciona ao domínio local | Hostname observado, substituição, separador e contexto escapado | Não usar shell, minimizar privilégios e bloquear saída desnecessária |
| Lógica de Negócios | Confiança excessiva no cliente | Controles client-side não são uma fronteira de confiança | Checkout aceita preço, desconto, frete ou total enviado pelo cliente | Valor do catálogo, valor recebido, total aceito e regra violada | Calcular todos os valores críticos no servidor |
| Lógica de Negócios | Entradas incomuns | Dados sintaticamente válidos podem ser implausíveis | Quantidade, valor, sinal, fração ou limite produzem estado inesperado | Checks de domínio, entrada aceita e saldo virtual resultante | Validar tipo, faixa, sinal, precisão e relações entre campos |
| Lógica de Negócios | Sequência de etapas | Suposição de que o usuário seguirá o fluxo visual | Endpoint posterior aceita transição sem suas pré-condições | Histórico, estado final e requisitos não verificados | Máquina de estados server-side com transições explícitas |
| Lógica de Negócios | Validação inconsistente | Canais diferentes duplicam a mesma política | Mobile, legado, parceiro ou importador omite uma regra central | Canal, policy engine, operação e decisão aceita | Centralizar a política autoritativa e testar todos os canais |
| Lógica de Negócios | Abuso de regras do domínio | Funções legítimas podem ser combinadas de forma não prevista | Cupons, gift cards e pontos são repetidos, empilhados ou mantidos após reversão | Sequência de benefícios, saldo e pontos somente em memória | Idempotência, consumo único e invariantes transacionais |
| Teste de API | Reconhecimento e documentação | Inventário de endpoints, versões, contratos e referências do cliente | Operações locais existem fora da interface ou da documentação aparente | Fonte observada, caminho encontrado e resposta do endpoint virtual | Inventário atualizado, documentação protegida e cobertura de todas as versões |
| Teste de API | Métodos e tipos de conteúdo | Verbos e media types ampliam a superfície de uma operação | Endpoint aceita método, parser ou override não usado pelo frontend | Método solicitado e efetivo, `Content-Type` e alteração em memória | Allowlist por endpoint, schema único e autorização por operação |
| Teste de API | Parâmetros ocultos | Implementação aceita entradas ausentes do contrato | Parâmetro adicional devolve rascunho, diagnóstico ou propriedade interna | Requisição-base versus resposta com o parâmetro adicional | Contratos precisos e rejeição de propriedades desconhecidas |
| Teste de API | Atribuição em massa | Binding automático de propriedades recebidas | PATCH modifica campo sensível e GET confirma o objeto alterado | Campos documentados, campos vinculados e leitura posterior | Allowlist explícita de propriedades editáveis |
| Teste de API | Poluição de parâmetros no servidor | Entrada controla sintaxe de query, caminho REST ou JSON interno | Delimitador ou estrutura altera a requisição interna virtual | Entrada do cliente, requisição construída e interpretação resultante | Encoding contextual, construção estruturada e validação de formato |
| Divulgação de Informações | Artefatos públicos e comentários | Crawlers, listagens e comentários revelam recursos não vinculados | Resposta pública expõe rota, arquivo temporário ou comentário interno | Artefato observado, pista e recurso local correlacionado | Remover comentários, desativar listagem e revisar arquivos públicos |
| Divulgação de Informações | Mensagens de erro detalhadas | Entradas inesperadas produzem diagnóstico excessivo | Erro revela tipo, schema, componente, versão ou stack trace virtual | Requisição-base, variação e campos adicionais da resposta | Mensagens genéricas e diagnóstico apenas em logs protegidos |
| Divulgação de Informações | Depuração e configuração insegura | Debug, server-info e TRACE permanecem habilitados | Resposta expõe variáveis, sessões, versões ou headers internos fictícios | Recurso, método, headers e dado de diagnóstico devolvido | Desativar recursos de debug e permitir somente métodos necessários |
| Divulgação de Informações | Dados de contas e enumeração | Autorização incompleta por campo ou resposta diferencial | Identidade atual consulta campo de outro usuário ou enumera recurso | Usuário autenticado, alvo solicitado, diferenças e campo exposto | Autorizar objeto e propriedades e uniformizar respostas |
| Divulgação de Informações | Backups e histórico de versão | Deploy inclui cópias e metadados desnecessários | Backup ou objeto Git virtual devolve código e valor removido | Caminho, conteúdo, commit e sequência do histórico | Publicar somente o build, bloquear metadados e retirar segredos do código |
| Controle de Acesso | Escalonamento vertical | Função sensível é ocultada ou definida por entrada controlada | Usuário comum alcança painel, altera função ou executa ação administrativa virtual | Identidade, função declarada, decisão e operação realizada | Autorizar toda função no servidor e não confiar em parâmetros de função |
| Controle de Acesso | Discrepâncias de rota e método | Política e roteador interpretam caminho ou verbo de formas diferentes | Normalização de header, case, sufixo ou método alcança o handler protegido | Caminho da política, rota canônica, método e efeito em memória | Centralizar autorização após canonicalização e proteger todos os métodos |
| Controle de Acesso | Escalonamento horizontal | Identificador é usado sem verificar o proprietário | Usuário atual lê ou altera conta de outro usuário fictício | Identidade autenticada, owner solicitado e `ownership_checked` | Verificar propriedade e permissão em toda leitura e escrita |
| Controle de Acesso | IDOR | Referência direta localiza registro, download ou arquivo sem autorização | Número ou caminho controlado devolve objeto virtual de outro proprietário | Referência recebida, objeto resolvido e proprietário real | Resolver o objeto e autorizar a identidade antes de devolver ou alterar |
| Controle de Acesso | Controles dependentes de contexto | Etapa, Referer, localização ou estado do cliente substitui a política | Confirmação direta ou transição fora de ordem produz estado privilegiado | Pré-condições, sequência, fonte da decisão e estado final | Validar cada transição server-side e tratar headers do cliente como não confiáveis |
| Upload de Arquivos | Upload e interpretação executável | Upload irrestrito e interpretação posterior pelo servidor | Objeto virtual aceito é solicitado por um caminho associado a um handler simulado | Nome armazenado, caminho solicitado, handler e saída virtual | Armazenar fora da raiz pública, sem execução, e servir sempre como dado |
| Upload de Arquivos | MIME e diretórios de destino | Confiança no tipo declarado e controle do caminho por filename | MIME do cliente libera conteúdo divergente ou o nome alcança outro diretório virtual | MIME, estrutura, decodificação, caminho canônico e política do destino | Detectar o formato, gerar o nome e confirmar o destino canônico |
| Upload de Arquivos | Extensões, listas negras e configuração | Extensões alternativas, case, sufixos e regras por diretório | Validador e handler virtual discordam sobre a extensão efetiva | Nome bruto, transformações, extensão final e regra do handler | Allowlist pequena, normalização única e configuração imutável do diretório |
| Upload de Arquivos | Conteúdo, processamento e métodos | Assinaturas, poliglotas, conteúdo ativo, parsers e PUT | Estrutura aceita alcança consumidor virtual perigoso ou método alternativo contorna a política | Assinatura, método, consumidor, interpretação e efeito fechado | Decodificar e recodificar, isolar parsers e aplicar a mesma política a todos os métodos |
| Upload de Arquivos | Corridas e impactos sem RCE | Objetos temporários, nomes previsíveis, importação e disponibilidade | Objeto em validação fica endereçável ou tamanho e colisão afetam quota virtual | Ordem, token, estado temporário, observação e uso de quota | Armazenamento temporário privado, promoção atômica, limites e nomes exclusivos |
| Injeção NoSQL | Sintaxe, Booleanos e null | Alteração de consulta textual, condições diferenciais e terminadores | Predicado virtual muda erro, contagem ou restrição de lançamento | Status, condição falsa/verdadeira, `match_count` e constraint aplicada | Evitar concatenação, validar tipos e construir consultas com API segura |
| Injeção NoSQL | Operadores e autenticação | Objetos recebidos como estrutura de comparação | Valor estruturado substitui igualdade e seleciona identidade fictícia | Tipo aceito, `authenticated_as` e ausência de enforcement do schema | Exigir strings escalares, schema estrito e comparação exata |
| Injeção NoSQL | Extração por sintaxe | Inferência Booleana de campo, caractere e prefixo | Predicados declarativos produzem variantes sem devolver o valor protegido | Hipóteses falsa/verdadeira e `condition_result` | Consultas parametrizadas, erros uniformes e menor exposição |
| Injeção NoSQL | Extração por operadores | Predicados sobre chaves e prefixos | Operador virtual permite inferir forma e parte de documento fictício | Operador, índice ou prefixo e variante de resposta | Allowlist de campos e operadores; rejeição de estrutura desconhecida |
| Injeção NoSQL | Detecção por tempo simulado | Canal lateral baseado em condição | Resposta declara atraso virtual somente quando a hipótese corresponde | Baselines, `simulated_delay_ms` e `real_delay_performed: false` | Evitar execução dinâmica, uniformizar comportamento e monitorar consultas |

## Cobertura declarativa adicional

Os 20 temas adicionais usam a mesma sequência comportamental: registrar baseline, enviar variante estruturada, correlacionar `evidence_id`, observar uma decisão divergente e registrar a mitigação. Cada linha representa uma trilha com cinco níveis.

| Tema | Progressão observável | Defesa principal |
| --- | --- | --- |
| Race Conditions | baseline concorrente → confirmação sincronizada | atomicidade, locking e idempotência |
| GraphQL | introspecção → autorização por resolver | schemas mínimos, limites e autorização por campo |
| Prototype Pollution | chave herdada → validação de propriedades | objetos sem protótipo e allowlist de chaves |
| Habilidades Essenciais | baseline → relatório reproduzível | método controlado e validação manual |
| SQL Injection | Booleanos → consulta parametrizada | parâmetros tipados e menor privilégio |
| XSS | reflexão → encoding contextual e CSP | encoding por contexto e sinks seguros |
| CSRF | ação com cookie → token vinculado | token, origem e SameSite apropriado |
| XXE | parser virtual → parser endurecido | desabilitar entidades externas |
| Clickjacking | framing → `frame-ancestors` | CSP e confirmação de ações sensíveis |
| CORS | origem refletida → allowlist exata | origens explícitas sem reflexão |
| SSRF | URL controlada → allowlist e egress | resolução segura e segmentação de rede |
| Request Smuggling | CL/TE → parsing uniforme | normalização ponta a ponta |
| SSTI | contexto → template sem entrada dinâmica | separar dados de templates |
| Desserialização | objeto → schema seguro | integridade, tipos permitidos e formatos simples |
| OAuth | redirect URI → validação estrita | vínculo de state, sessão, issuer e redirect |
| WebSockets | handshake → origem e sessão | autenticação e autorização por mensagem |
| Vulnerabilidades DOM | fonte/sink → DOM seguro | APIs seguras e validação de origem |
| Cache Poisoning | entrada não chaveada → política segura | chave completa e saída não refletida |
| Host Header | host arbitrário → host canônico | allowlist e URLs configuradas |
| JWT | estrutura → allowlist criptográfica | algoritmo fixo, chaves confiáveis e claims validados |

## Regras comuns de evidência

1. Começar por uma requisição-base e mudar uma variável por vez.
2. Registrar entrada, transformação, decisão e efeito observável.
3. Demonstrar impacto apenas com contas, segredos, rede e arquivos fictícios.
4. Separar a causa da vulnerabilidade da condição específica usada no payload.
5. Relacionar a correção ao componente que deveria impor a política, não apenas à interface ou ao prompt.
