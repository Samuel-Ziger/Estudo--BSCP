# Cache//Lab — Plano do sistema de estudos BSCP

## 1. Visão do projeto

O Cache//Lab é uma plataforma local, interativa e modular para preparar o estudo da certificação BSCP. O sistema transforma conteúdos teóricos de segurança web em uma trilha prática, com explicações progressivas, exemplos de requisições HTTP e mini laboratórios resolvidos com o Burp Suite.

O primeiro módulo é **Web Cache Deception**. O segundo módulo implementado é **Ataques de Web LLM**. Outros módulos, como SQL Injection, XSS, SSRF, OAuth e HTTP Request Smuggling, poderão ser adicionados sem reescrever a plataforma.

## Módulo 02 — Ataques de Web LLM

O conteúdo integral está em `burpLLM.txt` e possui quatro trilhas práticas, com cinco labs cada:

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
- Layout responsivo para desktop e notebook.
- Estado de progresso atualizado pela API.

### Backend

- Node.js usando o módulo HTTP nativo.
- Servidor local em `127.0.0.1:3000`.
- API de catálogo, progresso e conteúdo original.
- Cache simulado em memória.
- Rotas vulneráveis isoladas por lab.
- Validação automática baseada no comportamento observado.

### Segurança do ambiente

- Execução somente local.
- Nenhuma chamada para alvos externos.
- Dados fictícios de vítima.
- Cache resetável.
- Labs independentes entre si.

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

- Quiz por seção.
- Revisão de erros.
- Checklist interativo.
- Relatório de exploração ao terminar cada lab.
- Desafio final do módulo.

### Fase 3 — Expansão BSCP

- SQL Injection.
- XSS.
- SSRF.
- OAuth.
- HTTP Request Smuggling.
- Access Control.
- API testing.
- Web cache poisoning.

### Fase 4 — Recursos avançados

- Perfis de dificuldade.
- Banco de questões.
- Modo simulado de prova.
- Métricas por técnica.
- Exportação de relatório.
- Sistema de plugins para módulos futuros.

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
