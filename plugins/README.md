# Plugins locais de módulos

Esta pasta é reservada para módulos futuros fornecidos pelo desenvolvedor. Nenhum plugin é instalado ou carregado da internet.

Um plugin deve registrar um manifesto local com:

- `id` único;
- metadados de `module`;
- `tracks` orientadas a dados;
- `labs` sem soluções no catálogo público;
- `routePrefix` e `handle` determinístico, quando houver simulador;
- aulas, quiz, checklist, desafio final e testes comportamentais.

O registro rejeita IDs duplicados, trilhas fora do módulo e labs associados a trilhas inexistentes. Soluções e dicas são removidas do snapshot público.

Conteúdo de SQL Injection, XSS, SSRF, OAuth e demais temas da Fase 3 somente deve ser adicionado quando as referências locais correspondentes forem fornecidas.
