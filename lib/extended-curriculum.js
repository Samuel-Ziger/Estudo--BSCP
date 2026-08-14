const TOPICS = Object.freeze([
  ['race-conditions', 'Race Conditions', 'CONCORRÊNCIA', '#ff8fab', ['baseline concorrente', 'colisão de limite', 'janela multi-endpoint', 'estado parcial', 'confirmação sincronizada']],
  ['graphql', 'Vulnerabilidades GraphQL', 'GRAPHQL', '#c7a6ff', ['introspecção controlada', 'campos ocultos', 'argumentos e IDs', 'aliases e limites', 'autorização por resolver']],
  ['prototype-pollution', 'Prototype Pollution', 'PROTÓTIPOS', '#ffd166', ['chaves herdadas', 'merge recursivo', 'fontes e gadgets', 'poluição no servidor', 'validação de propriedades']],
  ['essential-skills', 'Habilidades Essenciais', 'METODOLOGIA', '#62d9ff', ['baseline reproduzível', 'encoding em camadas', 'comparação de respostas', 'Scanner com validação manual', 'relatório de evidência']],
  ['sql-injection', 'SQL Injection', 'SQL INJECTION', '#8cffc1', ['diferença Booleana', 'erros controlados', 'UNION virtual', 'inferência cega', 'consulta parametrizada']],
  ['cross-site-scripting', 'Cross-site Scripting', 'XSS', '#ff8fab', ['reflexão em texto', 'persistência virtual', 'fonte e sink DOM', 'contextos de saída', 'encoding contextual e CSP']],
  ['csrf', 'Cross-site Request Forgery', 'CSRF', '#ffd166', ['ação com cookie', 'token desvinculado', 'SameSite simulado', 'validação de origem', 'token vinculado à sessão']],
  ['xxe', 'XML External Entity Injection', 'XXE', '#c7a6ff', ['parser XML virtual', 'entidade local fictícia', 'erro diferencial', 'interação cega virtual', 'parser endurecido']],
  ['clickjacking', 'Clickjacking', 'UI REDRESSING', '#62d9ff', ['página enquadrável', 'sobreposição virtual', 'ação em múltiplas etapas', 'frame busting insuficiente', 'frame-ancestors']],
  ['cors', 'Cross-Origin Resource Sharing', 'CORS', '#8cffc1', ['origem refletida', 'origem null virtual', 'subdomínio confiável', 'credenciais e ACAO', 'allowlist exata']],
  ['ssrf', 'Server-side Request Forgery', 'SSRF', '#ff8fab', ['URL controlada', 'rede interna virtual', 'filtros por string', 'SSRF cego virtual', 'allowlist e egress']],
  ['request-smuggling', 'HTTP Request Smuggling', 'SMUGGLING', '#ffd166', ['CL e TE declarativos', 'dessincronização virtual', 'fila de resposta', 'downgrade HTTP/2', 'parsing uniforme']],
  ['ssti', 'Server-side Template Injection', 'SSTI', '#c7a6ff', ['contexto de template', 'expressão aritmética virtual', 'identificação de engine', 'sandbox virtual', 'templates sem entrada dinâmica']],
  ['deserialization', 'Desserialização Insegura', 'SERIALIZAÇÃO', '#62d9ff', ['objeto assinado', 'tipo inesperado', 'gadget virtual', 'integridade e estado', 'schema seguro']],
  ['oauth', 'Vulnerabilidades OAuth 2.0', 'OAUTH', '#8cffc1', ['redirect URI', 'state e sessão', 'fluxo de concessão', 'OpenID Connect', 'validação estrita']],
  ['websockets', 'Segurança de WebSockets', 'WEBSOCKETS', '#ff8fab', ['handshake local', 'mensagem manipulada', 'autorização por mensagem', 'CSWSH simulado', 'origem e sessão']],
  ['dom-vulnerabilities', 'Vulnerabilidades DOM', 'DOM', '#ffd166', ['fonte e sink', 'mensagem entre janelas', 'redirecionamento virtual', 'armazenamento HTML5', 'DOM clobbering virtual']],
  ['web-cache-poisoning', 'Web Cache Poisoning', 'CACHE POISONING', '#c7a6ff', ['entrada não chaveada', 'cache buster', 'header refletido', 'normalização da chave', 'política segura']],
  ['host-header', 'Ataques ao Header Host', 'HOST HEADER', '#62d9ff', ['Host arbitrário', 'override de host', 'reset poisoning virtual', 'routing virtual', 'host canônico']],
  ['jwt', 'Ataques JWT', 'JWT', '#8cffc1', ['estrutura do token', 'algoritmo aceito', 'chave e kid virtuais', 'confusão de algoritmo', 'allowlist criptográfica']]
]);

const difficulty = ['Aprendiz', 'Básico', 'Praticante', 'Avançado', 'CTF'];
const colors = ['#8cffc1', '#ffd166', '#62d9ff', '#c7a6ff', '#ff8fab'];

function moduleFor(topic, index) {
  const [id, name, shortName, color, techniques] = topic;
  return {
    id, order: 12 + index, name, shortName, source: 'PORTSWIGGER_MATERIALS.md', color,
    hero: { tag: `MÓDULO ${String(12 + index).padStart(2, '0')} · ${shortName}`, lead: 'OBSERVE O CONTRATO.', accent: 'PROVE A DIFERENÇA.', description: `Cinco laboratórios locais e determinísticos sobre ${name}, sem rede, processos ou dados reais.` },
    dashboard: { eyebrow: 'INVESTIGAÇÃO CONTROLADA', description: techniques.join(' → '), request: `GET /academy/${id}/${id}-path/1?variant=baseline HTTP/1.1\nHost: 127.0.0.1:3000`, steps: techniques.slice(0, 4).map((item, step) => [`ETAPA ${step + 1}`, item, `evidence-${step + 1}`]) },
    glossary: techniques.map((item, step) => [item, `Conceito ${step + 1} observado somente no simulador local de ${name}.`]),
    checklist: ['Registre uma resposta-base.', 'Mude uma variável por vez.', 'Compare decisão e transformação.', 'Demonstre apenas impacto fictício.', 'Relacione a mitigação à causa.'],
    quiz: techniques.slice(0, 4).map((item, step) => ({ id: `${id}-q${step + 1}`, question: `Qual abordagem é necessária ao investigar ${item}?`, options: ['Alterar várias variáveis', 'Comparar uma variante com a linha de base', 'Usar um alvo externo', 'Confiar apenas no status'], correct: 1, explanation: 'Uma comparação controlada produz evidência reproduzível sem sair do ambiente local.' })),
    finalChallenge: { title: `Operação ${shortName}`, brief: `Correlacione as cinco observações de ${name}.`, bonus: 1000, requiredLabIds: [`${id}-path-5`], tasks: ['Estabeleça a linha de base.', 'Produza uma diferença observável.', 'Documente causa, impacto fictício e mitigação.'] }
  };
}

function labFor(topic, level) {
  const [module, name, , , techniques] = topic;
  const id = `${module}-path-${level}`;
  return {
    id, module, track: `${module}-path`, level, difficulty: difficulty[level - 1], points: level * 100,
    title: techniques[level - 1], sitePath: `/site/${id}`, payload: `/academy/${module}/${module}-path/${level}`,
    context: `Aplicação fictícia dedicada a ${name}, com componentes e dados inteiramente virtuais.`, actors: { attacker: 'estudante', victim: 'serviço local fictício' },
    objective: `Compare a linha de base com a variante de ${techniques[level - 1]} e registre a decisão do simulador.`,
    successCondition: 'Obter a linha de base e enviar a variante estruturada correta para produzir evidência observável.',
    evidence: 'Registre baseline, variante, transformação, decisão, impacto fictício e defesa.', reflection: 'Qual componente deveria impor a política antes da interpretação?',
    mitigation: `Aplicar validação estrutural, autorização e interpretação uniforme para ${techniques[level - 1]}.`, impact: 'Mudança de estado ou exposição exclusivamente fictícia.',
    studyFlow: ['Observar a base', 'Formular hipótese', 'Enviar uma variante', 'Comparar a decisão', 'Registrar a mitigação'],
    protocol: ['GET da linha de base', 'POST da variante', 'Comparar evidence_id', 'Confirmar lab_signal'],
    initialRequest: `GET /academy/${module}/${module}-path/${level}?variant=baseline HTTP/1.1\nHost: 127.0.0.1:3000`,
    hints: level === 5 ? [] : [`Comece com variant=baseline no mesmo endpoint.`, `Use uma variante estruturada e preserve o evidence_id observado.`],
    solutionPayload: { variant: `variant-${level}`, evidenceId: `${module}-evidence-${level}` },
    solution: { explanation: `A variante ${techniques[level - 1]} atravessou uma decisão propositalmente inconsistente no simulador.`, requests: [`GET /academy/${module}/${module}-path/${level}?variant=baseline`, `POST /academy/${module}/${module}-path/${level}`] }
  };
}

const EXTENDED_MODULES = Object.freeze(TOPICS.map(moduleFor));
const EXTENDED_TRACKS = Object.freeze(TOPICS.map(([module, name], index) => ({ id: `${module}-path`, module, title: name, icon: 'LAB', summary: `Cinco níveis progressivos sobre ${name}.`, color: colors[index % colors.length] })));
const EXTENDED_LABS = Object.freeze(TOPICS.flatMap(topic => [1, 2, 3, 4, 5].map(level => labFor(topic, level))));

function publicExtendedModules() {
  return EXTENDED_MODULES.map(module => ({ ...module, quiz: module.quiz.map(({ correct, explanation, ...question }) => question), finalChallenge: { ...module.finalChallenge, requiredLabIds: undefined } }));
}

module.exports = { TOPICS, EXTENDED_MODULES, EXTENDED_TRACKS, EXTENDED_LABS, publicExtendedModules };
