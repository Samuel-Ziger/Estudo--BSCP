# Plugins locais de módulos

Esta pasta é reservada para módulos futuros fornecidos pelo desenvolvedor. Nenhum plugin é instalado ou carregado da internet.

## Limite de confiança

Plugins são módulos Node.js carregados com `require()` durante a inicialização. Eles executam com as mesmas permissões do processo do BSCP//Forge e **não são uma sandbox**. Adicione somente arquivos locais revisados, nunca aceite upload de plugins e não implemente instalação por URL, pacote remoto ou registro externo.

Um handler de plugin deve preservar o escopo do projeto: responder apenas a rotas locais, usar dados fictícios e manter arquivos, processos, rede e serviços externos como simulações fechadas em memória.

Um plugin deve registrar um manifesto local com:

- `id` único;
- metadados de `module`;
- `tracks` orientadas a dados;
- `labs` sem soluções no catálogo público;
- `routePrefix` e `handle` determinístico, quando houver simulador;
- aulas, quiz, checklist, desafio final e testes comportamentais.

O registro rejeita IDs duplicados, trilhas fora do módulo e labs associados a trilhas inexistentes. Soluções e dicas são removidas do snapshot público.

Conteúdo de SQL Injection, XSS, SSRF, OAuth e demais temas da Fase 3 somente deve ser adicionado quando as referências locais correspondentes forem fornecidas.
