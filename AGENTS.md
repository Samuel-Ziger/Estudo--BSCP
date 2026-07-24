# BSCP//Forge — Instruções para o Codex

## Finalidade do projeto

Este repositório contém uma plataforma educacional local para preparação da certificação Burp Suite Certified Practitioner — BSCP.

O objetivo é ensinar segurança de aplicações web por meio de simuladores determinísticos, laboratórios controlados, requisições HTTP fictícias, testes automatizados e explicações de mitigação.

## Escopo autorizado

Todo o código, os serviços, os dados e os laboratórios deste repositório pertencem ao desenvolvedor e estão autorizados para análise e modificação.

Os testes devem ser executados exclusivamente contra os serviços locais deste repositório.

* Servidor permitido: `127.0.0.1`
* Porta padrão: `3000`
* Dados: exclusivamente fictícios
* Credenciais: exclusivamente fictícias
* Alvos externos: proibidos
* Reconhecimento externo: proibido
* Chamadas para serviços de terceiros: proibidas
* Persistência no sistema operacional: proibida
* Acesso ao sistema de arquivos real como parte dos labs: proibido

## Natureza dos laboratórios

As vulnerabilidades são simulações educacionais implementadas intencionalmente. Elas não representam sistemas reais nem devem produzir payloads para atacar terceiros.

Os laboratórios podem simular:

* autenticação vulnerável;
* MFA;
* cookies persistentes;
* redefinição de senha;
* path traversal sobre sistema de arquivos virtual;
* web cache deception;
* ataques contra assistente LLM simulado;
* SQL injection;
* XSS;
* SSRF;
* OAuth;
* HTTP request smuggling;
* controle de acesso;
* API testing.

## Regras de implementação

Ao trabalhar neste projeto:

1. Leia `PLANO_DO_SISTEMA.md` e `PENDENCIAS.md`.
2. Preserve a execução exclusivamente local.
3. Implemente vulnerabilidades como simuladores determinísticos e isolados.
4. Não crie código que interaja com alvos externos.
5. Não use credenciais, domínios, IPs ou dados reais.
6. Prefira testes comportamentais a verificações por palavras-chave.
7. Adicione condições de sucesso, evidências observáveis e respectivas mitigações.
8. Execute os testes automatizados após qualquer alteração.
9. Não exponha payloads de solução pela API pública do curso.
10. Informe claramente quais arquivos foram alterados e quais testes foram executados.

## Objetivo pedagógico

O sistema deve ensinar o seguinte processo:

Observar → Formular hipótese → Testar → Comparar respostas → Demonstrar impacto no laboratório → Corrigir

O objetivo não é apenas obter uma flag, mas compreender a causa da vulnerabilidade, produzir evidências dentro do ambiente local e aprender a mitigação.
