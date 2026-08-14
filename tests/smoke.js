const assert = require('assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { createPluginRegistry } = require('../lib/plugin-registry');
const { resolvePublicFile } = require('../lib/http-utils');
const { parsePort } = require('../lib/runtime-config');
const { EXTENDED_LABS } = require('../lib/extended-curriculum');

const testData = fs.mkdtempSync(path.join(os.tmpdir(), 'bscp-forge-test-'));
process.env.BSCPFORGE_DATA_DIR = testData;

const serverModulePath = require.resolve('../server');
const { PATH_SOLUTIONS, PATH_EXPECTATIONS, COMMAND_SOLUTIONS, BUSINESS_LOGIC_SOLUTIONS, API_TESTING_SOLUTIONS, INFO_DISCLOSURE_SOLUTIONS, ACCESS_CONTROL_SOLUTIONS, FILE_UPLOAD_SOLUTIONS, NOSQL_INJECTION_SOLUTIONS } = require('../lib/lab-simulator');
let application = require(serverModulePath);
let server;
let base;

async function startServer() {
  server = http.createServer(application.handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
}

async function stopServer() {
  if (!server?.listening) return;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

async function request(route, options = {}) {
  const response = await fetch(`${base}${route}`, options);
  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); }
    catch { body = text; }
  }
  return { response, body, text };
}

function post(route, body, headers = {}) {
  return request(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
}

function apiStep(route, step) {
  const input = step.query || step.input || {};
  let target = route;
  const headers = { ...(step.headers || {}) };
  const options = { method: step.method, headers };
  if (step.query) {
    const query = new URLSearchParams(Object.entries(input).map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : String(value)]));
    target = `${route}?${query.toString()}`;
  } else if (step.input) {
    const contentType = step.contentType || 'application/json';
    headers['Content-Type'] = contentType;
    options.body = contentType === 'application/x-www-form-urlencoded'
      ? new URLSearchParams(Object.entries(input).map(([key, value]) => [key, String(value)])).toString()
      : JSON.stringify(input);
  }
  return request(target, options);
}

function informationStep(route, step) {
  if (step.method !== 'TRACE') return apiStep(route, step);
  const input = step.query || step.input || {};
  return request(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Lab-Method': 'TRACE', ...(step.headers || {}) },
    body: JSON.stringify(input)
  });
}

function cookieFrom(result, name) {
  const values = typeof result.response.headers.getSetCookie === 'function'
    ? result.response.headers.getSetCookie()
    : [result.response.headers.get('set-cookie') || ''];
  for (const value of values) {
    const match = value.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
    if (match) return match[1];
  }
  assert.fail(`Cookie ${name} não foi emitido`);
}

function assertTriggered(result, label) {
  assert.ok(result.response.status >= 200 && result.response.status < 500, `${label} deveria produzir uma resposta controlada`);
  assert.equal(result.body.lab_signal, 'TRIGGERED', `${label} deveria atingir a condição comportamental`);
}

function expectedRememberToken(level, username, password) {
  const digest = (algorithm, value) => crypto.createHash(algorithm).update(value).digest('hex');
  const payload = level === 1 ? `${username}:${password}`
    : level === 2 || level === 4 ? `${username}:${digest('md5', password)}`
      : level === 3 ? `${username}:${digest('sha1', password)}`
        : `${username}:${digest('sha256', password).slice(0, 16)}`;
  return Buffer.from(payload).toString('base64');
}

async function assertCatalogAndAssets() {
  assert.equal(parsePort(undefined), 3000);
  assert.equal(parsePort('3001'), 3001);
  for (const invalid of ['0', '65536', '3.5', 'not-a-port']) assert.throws(() => parsePort(invalid), /PORT deve ser/);
  assert.equal(resolvePublicFile(path.join(__dirname, '..', 'public'), '/index.html'), path.join(__dirname, '..', 'public', 'index.html'));
  assert.equal(resolvePublicFile(path.join(__dirname, '..', 'public'), '/../server.js'), null);

  const registry = createPluginRegistry(['web-cache']);
  registry.register({
    id: 'future-local',
    module: { id: 'future-module', quiz: [{ id: 'future-q1', question: 'Local?', options: ['Sim'], correct: 0, explanation: 'Local.' }], finalChallenge: { requiredLabIds: ['future-track-1'], bonus: 1000 } },
    tracks: [{ id: 'future-track', module: 'future-module' }],
    labs: [{ id: 'future-track-1', module: 'future-module', track: 'future-track', hints: ['local'], solution: { internal: true } }]
  });
  const pluginSnapshot = registry.publicSnapshot()[0];
  assert.equal(Object.hasOwn(pluginSnapshot.module.quiz[0], 'correct'), false);
  assert.equal(Object.hasOwn(pluginSnapshot.labs[0], 'solution'), false);
  assert.throws(() => registry.register({ id: 'future-local', module: { id: 'another' }, tracks: [], labs: [] }), /duplicado/);

  const courseResult = await request('/api/course');
  assert.equal(courseResult.response.status, 200);
  assert.equal(courseResult.body.tracks.length, 77);
  assert.equal(courseResult.body.labs.length, 385);
  assert.deepEqual(courseResult.body.stats, { modules: 31, tracks: 77, labs: 385, labPoints: 115500, challengePoints: 31000 });
  assert.equal(courseResult.body.modules.length, 31);
  for (const module of courseResult.body.modules) {
    assert.ok(module.glossary.length >= 5, `${module.id}: glossário incompleto`);
    assert.ok(module.checklist.length >= 5, `${module.id}: checklist incompleto`);
    assert.ok(module.quiz.length >= 4, `${module.id}: quiz incompleto`);
    assert.equal(Object.hasOwn(module.quiz[0], 'correct'), false, `${module.id}: resposta de quiz exposta`);
    assert.equal(Object.hasOwn(module.finalChallenge, 'requiredLabIds'), false, `${module.id}: composição interna do desafio exposta`);
  }
  assert.deepEqual(
    Object.fromEntries(['web-cache', 'web-llm', 'web-auth', 'path-traversal', 'os-command-injection', 'business-logic', 'api-testing', 'information-disclosure', 'access-control', 'file-upload', 'nosql-injection'].map(module => [module, courseResult.body.labs.filter(lab => lab.module === module).length])),
    { 'web-cache': 40, 'web-llm': 20, 'web-auth': 25, 'path-traversal': 25, 'os-command-injection': 25, 'business-logic': 25, 'api-testing': 25, 'information-disclosure': 25, 'access-control': 25, 'file-upload': 25, 'nosql-injection': 25 }
  );
  for (const module of courseResult.body.modules.slice(11)) {
    assert.equal(courseResult.body.labs.filter(lab => lab.module === module.id).length, 5, `${module.id}: deveria possuir cinco labs`);
    const source = await request(`/api/content/original?module=${module.id}`);
    assert.equal(source.response.status, 200);
    assert.match(source.body.text, /Materiais PortSwigger incorporados/);
  }

  for (const lab of courseResult.body.labs) {
    assert.equal(lab.studyFlow.length, 5, `${lab.id}: roteiro incompleto`);
    assert.equal(lab.protocol.length, 4, `${lab.id}: protocolo incompleto`);
    assert.equal(lab.sitePath, `/site/${lab.id}`, `${lab.id}: URL do mini site ausente`);
    for (const field of ['objective', 'successCondition', 'evidence', 'reflection', 'mitigation']) {
      assert.ok(lab[field], `${lab.id}: campo didático ${field} ausente`);
    }
    assert.equal(Object.hasOwn(lab, 'solutionPayload'), false, `${lab.id}: solução interna exposta pelo catálogo`);
    assert.equal(Object.hasOwn(lab, 'solution'), false, `${lab.id}: explicação interna exposta pelo catálogo`);
    assert.equal(Object.hasOwn(lab, 'hints'), false, `${lab.id}: dicas deveriam ser liberadas gradualmente`);
    if (lab.level === 5) assert.equal(lab.hintCount, 0, `${lab.id}: o CTF não deveria expor dicas`);
  }
  assert.doesNotMatch(JSON.stringify(courseResult.body), /BSCP-[A-Z-]+-\d+-SECRET/);
  assert.doesNotMatch(JSON.stringify(courseResult.body), /381 & echo forge-alpha &/, 'payload de command injection não deveria aparecer no catálogo');
  assert.doesNotMatch(JSON.stringify(courseResult.body), /"productId":"starter-kit","quantity":1,"unitPrice":1/, 'solução de lógica de negócios não deveria aparecer no catálogo');
  assert.doesNotMatch(JSON.stringify(courseResult.body), /"isAdmin":true,"role":"owner","quota":9999/, 'solução de teste de API não deveria aparecer no catálogo');
  assert.doesNotMatch(JSON.stringify(courseResult.body), /fictitious-backup-token/, 'segredo fictício de divulgação não deveria aparecer no catálogo');
  assert.doesNotMatch(JSON.stringify(courseResult.body), /admin-session-leaked/, 'artefato de solução de controle de acesso não deveria aparecer no catálogo');
  assert.doesNotMatch(JSON.stringify(courseResult.body), /UPLOAD-CONFIG-FICTITIOUS/, 'saída interna de upload não deveria aparecer no catálogo');
  assert.doesNotMatch(JSON.stringify(courseResult.body), /nova42-lab/, 'valor interno de NoSQL não deveria aparecer no catálogo');
  assert.equal(JSON.stringify(courseResult.body).includes('"username":{"operator":"ne","value":"invalid"},"password":"training-pass"'), false, 'payload de solução NoSQL não deveria aparecer no catálogo');

  const assets = {
    '/lessons.js': /window\.COURSE_LESSONS = \{\}/,
    '/cache-lessons.js': /Chave e regra têm funções diferentes/,
    '/llm-lessons.js': /O modelo é uma ponte/,
    '/auth-lessons.js': /Autenticação e autorização/,
    '/path-lessons.js': /Path Traversal Basics/,
    '/command-lessons.js': /8PDDjCW5XWw/,
    '/command-lessons.css': /command-video-card/,
    '/business-lessons.js': /Modele o caminho feliz/,
    '/business-lessons.css': /logic-invariant/,
    '/api-lessons.js': /Uma API é um contrato/,
    '/api-lessons.css': /api-principle/,
    '/information-lessons.js': /Informação desnecessária/,
    '/information-lessons.css': /info-principle/,
    '/access-lessons.js': /Autenticar não significa autorizar/,
    '/access-lessons.css': /access-principle/,
    '/upload-lessons.js': /Upload é uma cadeia de decisões/,
    '/upload-lessons.css': /upload-principle/,
    '/nosql-lessons.js': /NoSQL descreve uma família de modelos/,
    '/nosql-lessons.css': /nosql-principle/,
    '/lab-site.js': /sameOriginUrl/,
    '/lab-site.css': /\.traffic-console/
  };
  for (const [asset, expression] of Object.entries(assets)) {
    const result = await request(asset);
    assert.equal(result.response.status, 200, `${asset} deveria existir`);
    assert.match(result.text, expression, `${asset} deveria registrar seu conteúdo atual`);
  }
  const commandLessons = await request('/command-lessons.js');
  assert.match(commandLessons.text, /href="https:\/\/youtu\.be\/8PDDjCW5XWw\?si=rTLzLNDQLrlCC0-r"/);
  assert.match(commandLessons.text, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(commandLessons.text, /<iframe/i, 'o vídeo externo não deve ser carregado automaticamente');

  const index = await request('/');
  assert.equal(index.response.status, 200);
  assert.match(index.text, /aria-live="polite"/);
  assert.doesNotMatch(index.text, /https?:\/\//i, 'a interface não deveria carregar recursos externos');

  const sourceExpectations = {
    'web-cache': /cache/i,
    'web-llm': /LLM/i,
    'web-auth': /Vulnerabilidades em logins baseados em senha/,
    'path-traversal': /Como prevenir um ataque de travessia de diretório/,
    'os-command-injection': /Injeção de comandos do sistema operacional/i,
    'business-logic': /Vulnerabilidades na lógica de negócios/i,
    'api-testing': /Teste de API/i,
    'information-disclosure': /vulnerabilidades de divulgação de informações/i,
    'access-control': /Vulnerabilidades de controle de acesso e escalonamento de privilégios/i,
    'file-upload': /Vulnerabilidades no upload de arquivos/i,
    'nosql-injection': /injeção NoSQL/i
  };
  for (const [module, expression] of Object.entries(sourceExpectations)) {
    const source = await request(`/api/content/original?module=${module}`);
    assert.equal(source.response.status, 200);
    assert.ok(source.body.text.length > 1000, `${module}: referência deveria estar completa`);
    assert.match(source.body.text, expression);
  }

  return courseResult.body;
}

async function assertMiniSites(course) {
  const formByModule = {
    'web-cache': 'id="cache-form"',
    'web-llm': 'id="llm-form"',
    'web-auth': 'id="auth-form"',
    'path-traversal': 'id="path-form"',
    'os-command-injection': 'id="command-form"',
    'business-logic': 'id="business-form"',
    'api-testing': 'id="api-form"',
    'information-disclosure': 'id="information-form"',
    'access-control': 'id="access-form"',
    'file-upload': 'id="upload-form"',
    'nosql-injection': 'id="nosql-form"'
  };
  const seen = new Set();
  for (const lab of course.labs) {
    assert.equal(seen.has(lab.sitePath), false, `${lab.id}: URL de mini site duplicada`);
    seen.add(lab.sitePath);
    const site = await request(lab.sitePath);
    assert.equal(site.response.status, 200, `${lab.id}: mini site indisponível`);
    assert.match(site.response.headers.get('content-type'), /^text\/html/);
    assert.match(site.response.headers.get('content-security-policy'), /connect-src 'self'/);
    assert.match(site.response.headers.get('content-security-policy'), /form-action 'self'/);
    assert.match(site.text, new RegExp(`data-lab-id="${lab.id}"`));
    assert.match(site.text, new RegExp(`data-module="${lab.module}"`));
    assert.ok(site.text.includes(formByModule[lab.module] || 'id="academy-form"'), `${lab.id}: aplicação do módulo ausente`);
    assert.match(site.text, /\/lab-site\.js/);
    assert.match(site.text, /\/lab-site\.css/);
    assert.doesNotMatch(site.text, /(?:src|href)="https?:\/\//i, `${lab.id}: mini site não deve carregar recurso externo`);
    assert.doesNotMatch(site.text, /BSCP-[A-Z-]+-\d+-SECRET/, `${lab.id}: solução vazou no HTML`);
  }
  assert.equal(seen.size, 385);

  const head = await request(course.labs[0].sitePath, { method: 'HEAD' });
  assert.equal(head.response.status, 200);
  assert.equal(head.text, '');
  const invalid = await request('/site/lab-inexistente');
  assert.equal(invalid.response.status, 404);
  const method = await request(course.labs[0].sitePath, { method: 'POST' });
  assert.equal(method.response.status, 405);
  assert.equal(method.response.headers.get('allow'), 'GET, HEAD');
}

async function assertNegativeFlows(course) {
  for (const lab of course.labs.filter(item => item.module === 'web-cache')) {
    const result = await request(lab.payload);
    assert.notEqual(result.response.headers.get('x-cache'), 'hit', `${lab.id}: uma requisição isolada não deveria concluir o lab`);
  }

  for (const lab of course.labs.filter(item => item.module === 'web-llm')) {
    const result = await post(lab.payload, { message: 'admin sql xss' });
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: palavras soltas não deveriam concluir o lab`);
  }

  for (const lab of course.labs.filter(item => item.module === 'web-auth')) {
    const result = await post(lab.payload, { action: 'xss', username: 'admin', password: 'sql' });
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: palavras soltas não deveriam concluir o lab`);
  }

  for (const lab of course.labs.filter(item => item.module === 'path-traversal')) {
    const result = await request(`${lab.payload.split('?')[0]}?filename=admin`);
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: um nome comum não deveria escapar da base`);
  }

  for (const lab of course.labs.filter(item => item.module === 'os-command-injection')) {
    const body = lab.track === 'cmd-direct'
      ? { productId: 'whoami', storeId: '29' }
      : { email: 'nslookup probe.collaborator.bscp.local', message: 'admin sql xss' };
    const result = await post(lab.payload, body);
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: palavras sem uma fronteira de shell não deveriam concluir o lab`);
  }

  const wrongMarker = await post('/cmd/execute/cmd-direct/1', { productId: '381 & echo wrong-marker &', storeId: '29' });
  assert.notEqual(wrongMarker.body.lab_signal, 'TRIGGERED', 'uma saída diferente não deveria concluir o lab direto');
  const wrongDelay = await post('/cmd/execute/cmd-time/1', { email: 'student@bscp.local & ping -c 3 127.0.0.1 &', message: 'Feedback local' });
  assert.notEqual(wrongDelay.body.lab_signal, 'TRIGGERED', 'um atraso diferente não deveria concluir o lab de tempo');
  await post('/cmd/execute/cmd-redirect/1', { email: 'student@bscp.local | whoami > /var/www/static/whoami-1.txt |', message: 'Feedback local' });
  assert.notEqual((await request('/cmd/artifacts/cmd-redirect/1/whoami-1.txt')).body.lab_signal, 'TRIGGERED', 'o artefato deveria permanecer vinculado ao separador exigido');
  await post('/cmd/execute/cmd-oast/1', { email: 'student@bscp.local; nslookup probe-1.collaborator.bscp.local;', message: 'Feedback local' });
  assert.notEqual((await request('/cmd/collaborator/cmd-oast/1')).body.lab_signal, 'TRIGGERED', 'o evento deveria permanecer vinculado ao separador exigido');
  await post('/cmd/execute/cmd-exfil/1', { email: 'student@bscp.local & nslookup www-data-lab.leak-1.collaborator.bscp.local &', message: 'Feedback local' });
  assert.notEqual((await request('/cmd/collaborator/cmd-exfil/1')).body.lab_signal, 'TRIGGERED', 'o evento de exfiltração deveria exigir substituição de comando');

  for (const lab of course.labs.filter(item => item.module === 'business-logic')) {
    const result = await post(lab.payload, { action: 'checkout', operation: 'transfer', productId: 'starter-kit', quantity: 1, unitPrice: 49.9, channel: 'web', amount: 50, target: 'savings' });
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: o caminho normal não deveria violar a regra específica`);
  }
  assert.notEqual((await post('/logic/execute/logic-client-trust/1', { action: 'checkout', productId: 'starter-kit', quantity: 1, unitPrice: 49.9 })).body.lab_signal, 'TRIGGERED', 'o preço autoritativo não deveria concluir o lab');
  assert.notEqual((await post('/logic/execute/logic-unconventional/1', { action: 'update-cart', productId: 'proxy-pro', quantity: -1 })).body.lab_signal, 'TRIGGERED', 'a entrada incomum deveria permanecer vinculada ao cenário');
  assert.notEqual((await post('/logic/execute/logic-workflow/2', { action: 'dispatch', orderId: 'WRONG-ORDER' })).body.lab_signal, 'TRIGGERED', 'a transição deveria permanecer vinculada ao pedido do nível');
  assert.notEqual((await post('/logic/execute/logic-validation/1', { operation: 'transfer', channel: 'web', amount: 150, target: 'savings' })).body.lab_signal, 'TRIGGERED', 'o canal protegido não deveria concluir o bypass');
  assert.notEqual((await post('/logic/execute/logic-domain/1', { action: 'apply-coupon', code: 'WELCOME10' })).body.lab_signal, 'TRIGGERED', 'uma única aplicação de cupom não deveria provar reutilização');

  for (const lab of course.labs.filter(item => item.module === 'api-testing')) {
    const result = await post(lab.payload, { path: '/api/status', name: 'peter', action: 'baseline' });
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: uma requisição genérica não deveria concluir o comportamento específico`);
  }
  await apiStep('/api-lab/execute/api-mass-assignment/1', { method: 'PATCH', input: { action: 'update', resource: 'user-101', fields: { displayName: 'Student' } } });
  const unchangedMassAssignment = await apiStep('/api-lab/execute/api-mass-assignment/1', { method: 'GET', query: { action: 'read', resource: 'user-101' } });
  assert.notEqual(unchangedMassAssignment.body.lab_signal, 'TRIGGERED', 'campos documentados não deveriam provar atribuição em massa');
  const unencodedSspp = await apiStep('/api-lab/execute/api-sspp/2', { method: 'GET', query: { name: 'peter' } });
  assert.notEqual(unencodedSspp.body.lab_signal, 'TRIGGERED', 'uma busca normal não deveria poluir a requisição interna');

  for (const lab of course.labs.filter(item => item.module === 'information-disclosure')) {
    const result = await post(lab.payload, { path: '/', parameter: 'id', value: 'safe' });
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: uma resposta genérica não deveria concluir a divulgação específica`);
  }
  const isolatedCommit = await apiStep('/info/inspect/info-source/4', { method: 'GET', query: { path: '/.git/objects/commit-lab-4' } });
  assert.notEqual(isolatedCommit.body.lab_signal, 'TRIGGERED', 'o commit isolado não deveria substituir a descoberta pelo histórico');
  const genericError = await post('/info/inspect/info-errors/1', { path: '/catalog/item', parameter: 'id', value: '7' });
  assert.notEqual(genericError.body.lab_signal, 'TRIGGERED', 'uma entrada válida não deveria concluir o lab de erro');

  for (const lab of course.labs.filter(item => item.module === 'access-control')) {
    const result = await post(lab.payload, { path: '/profile', action: 'view' }, { 'X-Lab-User': 'student' });
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: uma requisição genérica não deveria concluir a decisão de acesso específica`);
  }
  const ownAccount = await apiStep('/access/check/access-horizontal/1', { method: 'GET', headers: { 'x-lab-user': 'student' }, query: { path: '/my-account', ownerId: 'user-1001' } });
  assert.notEqual(ownAccount.body.lab_signal, 'TRIGGERED', 'acessar a própria conta não deveria provar escalonamento horizontal');
  const undiscoveredGuid = await apiStep('/access/check/access-horizontal/2', { method: 'GET', headers: { 'x-lab-user': 'student' }, query: { path: '/my-account', ownerId: 'user-guid-carlos' } });
  assert.notEqual(undiscoveredGuid.body.lab_signal, 'TRIGGERED', 'o GUID isolado não deveria substituir sua descoberta pública');
  const protectedMethod = await apiStep('/access/check/access-routing/2', { method: 'POST', headers: { 'x-lab-user': 'student' }, input: { path: '/admin/delete-user', action: 'delete', target: 'demo-account-2' } });
  assert.notEqual(protectedMethod.body.lab_signal, 'TRIGGERED', 'o método protegido não deveria concluir o bypass por método alternativo');
  const resetWithoutObject = await apiStep('/access/check/access-idor/5', { method: 'POST', headers: { 'x-lab-user': 'student' }, input: { path: '/account/reset', user: 'administrator', resetCode: 'RESET-LOCAL-5' } });
  assert.notEqual(resetWithoutObject.body.lab_signal, 'TRIGGERED', 'o reset isolado não deveria substituir a cadeia iniciada pelo objeto estático');

  for (const lab of course.labs.filter(item => item.module === 'file-upload')) {
    const result = await post(lab.payload, {
      action: 'upload',
      filename: 'safe-avatar.jpg',
      declaredType: 'image/jpeg',
      size: 64,
      content: { kind: 'image', signature: 'JPEG' }
    });
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: um upload comum não deveria concluir o comportamento específico`);
    assert.equal(result.body.safety.real_filesystem, false, `${lab.id}: o fluxo negativo também deve permanecer em memória`);
  }
  const requestWithoutUpload = await apiStep('/upload/inspect/upload-execution/1', { method: 'GET', query: { action: 'request', path: '/uploads/avatar-lab.php' } });
  assert.notEqual(requestWithoutUpload.body.lab_signal, 'TRIGGERED', 'consultar um objeto inexistente não deveria substituir a etapa de upload');
  const rejectedDeclaredType = await apiStep('/upload/inspect/upload-type-path/1', { method: 'POST', input: { action: 'upload', filename: 'avatar.php', declaredType: 'text/plain', content: { kind: 'server-script', operation: 'training-marker' } } });
  assert.equal(rejectedDeclaredType.body.accepted, false);
  assert.notEqual(rejectedDeclaredType.body.lab_signal, 'TRIGGERED', 'o MIME divergente do cenário não deveria concluir o lab');
  const finalizeWithoutObservation = await apiStep('/upload/inspect/upload-race-impact/5', { method: 'POST', input: { action: 'finalize', token: 'temp-5', decision: 'reject' } });
  assert.notEqual(finalizeWithoutObservation.body.lab_signal, 'TRIGGERED', 'a finalização isolada não deveria provar uma janela de corrida');

  for (const lab of course.labs.filter(item => item.module === 'nosql-injection')) {
    const result = await post(lab.payload, { action: 'search', category: 'Gifts' });
    assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: uma consulta normal não deveria concluir o comportamento NoSQL específico`);
    assert.equal(result.body.safety.external_requests, false, `${lab.id}: o fluxo negativo NoSQL deve permanecer local`);
    assert.equal(result.body.safety.real_database, false, `${lab.id}: nenhum banco real deve ser consultado`);
    assert.equal(result.body.safety.javascript_execution, false, `${lab.id}: nenhum JavaScript deve ser executado`);
  }
  const loneTrue = await post('/nosql/query/nosql-syntax/2', { action: 'search', category: 'Gifts', predicate: { kind: 'boolean', value: true } });
  assert.notEqual(loneTrue.body.lab_signal, 'TRIGGERED', 'uma condição verdadeira isolada não deveria substituir a comparação falsa → verdadeira');
  const wrongOperator = await post('/nosql/query/nosql-operator-auth/1', { action: 'login', username: { operator: 'ne', value: 'invalid' }, password: 'wrong-password' });
  assert.notEqual(wrongOperator.body.lab_signal, 'TRIGGERED', 'um operador com a credencial divergente não deveria concluir o cenário');
  const realDelayForbidden = await post('/nosql/query/nosql-time/1', { action: 'timed-probe', delay: 800, condition: { kind: 'always-false' } });
  assert.equal(realDelayForbidden.body.real_delay_performed, false);
  assert.notEqual(realDelayForbidden.body.lab_signal, 'TRIGGERED', 'um atraso solicitado sem condição verdadeira não deveria concluir o cenário');

  const oneKey = '/lab/cache-buster/2/asset.js?cb=single-key';
  await request(oneKey);
  await request(oneKey);
  assert.equal((await request('/api/progress')).body.solved.includes('cache-buster-2'), false, 'uma única chave não deveria concluir cache-buster-2');

  const wrongBasicTarget = await request('/path/load/path-basic/1?filename=%2Fetc%2Fpasswd');
  assert.notEqual(wrongBasicTarget.body.lab_signal, 'TRIGGERED', 'path-basic-1 deveria exigir o alvo e a representação do nível');
  const unencodedTraversal = await request('/path/load/path-encoding/2?filename=%2Fetc%2Fpasswd');
  assert.notEqual(unencodedTraversal.body.lab_signal, 'TRIGGERED', 'path-encoding-2 deveria exigir double encoding');

  const missingUser = await post('/llm/chat/llm-api-agency/4', { action: 'call_tool', tool: 'delete_user', args: { username: 'does-not-exist' } });
  assert.notEqual(missingUser.body.lab_signal, 'TRIGGERED', 'excluir usuário inexistente não deveria concluir o lab');
  await post('/llm/chat/llm-api-agency/5', { action: 'list_tools' });
  const emptyOperation = await post('/llm/chat/llm-api-agency/5', { action: 'call_tool', tool: 'admin_action', args: {} });
  assert.notEqual(emptyOperation.body.lab_signal, 'TRIGGERED', 'operação administrativa vazia não deveria concluir o lab');

  const ratePath = '/auth/login/auth-bruteforce/2';
  const firstIp = { 'X-Lab-IP': '198.51.100.40' };
  await post(ratePath, { username: 'carlos', password: 'wrong-1' }, firstIp);
  await post(ratePath, { username: 'carlos', password: 'wrong-2' }, firstIp);
  await post(ratePath, { username: 'attacker', password: 'attacker' }, firstIp);
  const crossIp = await post(ratePath, { username: 'carlos', password: 'montoya' }, { 'X-Lab-IP': '198.51.100.41' });
  assert.notEqual(crossIp.body.lab_signal, 'TRIGGERED', 'o bypass deveria permanecer vinculado ao mesmo IP fictício');

  const guestToken = expectedRememberToken(2, 'guest', 'password1');
  const wrongRememberTarget = await post('/auth/remember/auth-remember/2', { action: 'access', token: guestToken });
  assert.notEqual(wrongRememberTarget.body.lab_signal, 'TRIGGERED', 'o nível deveria exigir o alvo fictício descrito');

  assert.equal((await request('/api/labs/result?lab=path-basic-1')).response.status, 403, 'solução não deveria ser pública antes da conclusão');
  const lockedHints = await request('/api/labs/hints?lab=path-basic-1');
  assert.deepEqual(lockedHints.body.hints, []);
  const firstHint = await post('/api/labs/hints/unlock', { labId: 'path-basic-1' });
  assert.equal(firstHint.body.unlocked, 1);
  assert.equal(firstHint.body.hints.length, 1);

  const progress = await request('/api/progress');
  assert.deepEqual(progress.body.solved, [], 'os fluxos negativos não deveriam registrar progresso');
  await request('/api/labs/reset', { method: 'POST' });
}

async function solveCacheLabs() {
  for (const lab of application.labs.filter(item => item.module === 'web-cache')) {
    const first = await request(lab.solutionPayload, { headers: lab.victimCookie ? { Cookie: lab.victimCookie } : {} });
    assert.equal(first.response.status, 200, `${lab.id}: primeira requisição inválida`);
    assert.equal(first.response.headers.get('x-cache'), 'miss', `${lab.id}: a chave limpa deveria começar com MISS`);
    assert.notEqual(first.response.headers.get('x-cache-rule'), 'none', `${lab.id}: a regra deveria ser observável`);
    assert.ok(first.response.headers.get('x-cache-key'), `${lab.id}: chave de cache ausente`);

    let second = await request(lab.solutionPayload);
    assert.equal(second.response.status, 200, `${lab.id}: resposta armazenada inválida`);
    assert.equal(second.response.headers.get('x-cache'), 'hit', `${lab.id}: a repetição deveria produzir HIT`);
    assert.match(second.response.headers.get('age'), /^\d+$/, `${lab.id}: Age deveria ser numérico`);
    if (lab.victimCookie) {
      assert.match(second.body.apiKey, /^BSCP-/, `${lab.id}: o conteúdo privado fictício deveria ser recuperado`);
      assert.equal(first.response.headers.get('x-origin-cache-control'), 'private, no-store');
    } else {
      assert.equal(second.body.content, 'Recurso público do laboratório');
    }
    if (lab.track === 'cache-buster' && lab.level > 1) {
      const separator = lab.solutionPayload.includes('?') ? '&' : '?';
      const secondKey = `${lab.solutionPayload}${separator}isolation=second-${lab.level}`;
      const isolatedMiss = await request(secondKey);
      assert.equal(isolatedMiss.response.headers.get('x-cache'), 'miss');
      second = await request(secondKey);
      assert.equal(second.response.headers.get('x-cache'), 'hit');
    }
  }
}

async function solveLlmLabs() {
  const indirectSources = [null, 'direct-injection', 'fake-system', 'fake-user', 'tool-markup', 'ctf-document'];
  for (const lab of application.labs.filter(item => item.module === 'web-llm')) {
    let result;
    if (lab.track === 'llm-api-agency') {
      if (lab.level === 1) result = await post(lab.payload, { action: 'list_tools' });
      if (lab.level === 2) result = await post(lab.payload, { action: 'describe_tool', tool: 'delete_user' });
      if (lab.level === 3) result = await post(lab.payload, { action: 'call_tool', tool: 'get_user', args: { user_id: '2002' } });
      if (lab.level === 4) result = await post(lab.payload, { action: 'call_tool', tool: 'delete_user', args: { username: 'guest' } });
      if (lab.level === 5) {
        const discovery = await post(lab.payload, { action: 'list_tools' });
        assert.notEqual(discovery.body.lab_signal, 'TRIGGERED');
        result = await post(lab.payload, { action: 'call_tool', tool: 'admin_action', args: { operation: 'export_users' } });
      }
    }
    if (lab.track === 'llm-chaining') {
      if (lab.level === 1) result = await post(lab.payload, { action: 'describe_tool', tool: 'read_file' });
      if (lab.level === 2) result = await post(lab.payload, { action: 'call_tool', tool: 'read_file', args: { path: '../../etc/passwd' } });
      if (lab.level === 3) result = await post(lab.payload, { action: 'call_tool', tool: 'fetch_url', args: { url: 'http://169.254.169.254/latest/meta-data/' } });
      if (lab.level === 4) result = await post(lab.payload, { action: 'call_tool', tool: 'search_orders', args: { query: "' OR 1=1 --" } });
      if (lab.level === 5) {
        await post(lab.payload, { action: 'list_tools' });
        result = await post(lab.payload, { action: 'call_tool', tool: 'read_file', args: { path: '../../../etc/passwd' } });
      }
    }
    if (lab.track === 'llm-indirect') {
      result = await post(lab.payload, { task: 'Resuma o documento.', sourceId: indirectSources[lab.level] });
      assert.equal(result.body.provenance.trusted, false);
      assert.equal(result.body.tool_result.changed_state, true);
    }
    if (lab.track === 'llm-output') {
      const outputs = [null, '<b>treino</b>', '<img src=x onerror=alert(1)>', '<a href="javascript:alert(1)">treino</a>', '<form action="https://evil.test"><input></form>'];
      if (lab.level < 5) result = await post(lab.payload, { action: 'render', html: outputs[lab.level] });
      else {
        const stored = await post(lab.payload, { action: 'store', html: '<img src=x onerror=alert(1)>' });
        assert.equal(stored.body.stored, true);
        result = await post(lab.payload, { action: 'view', viewer: 'victim-user' });
      }
      assert.equal(result.body.sink.execution, 'virtual-only; JavaScript is never executed by the simulator');
    }
    assertTriggered(result, lab.id);
    assert.equal(result.response.headers.get('x-llm-lab'), 'triggered');
  }
}

async function startMfa(lab) {
  const result = await post(lab.payload, { action: 'start', username: 'attacker', password: 'attacker' });
  assert.equal(result.response.status, 200, `${lab.id}: primeiro fator deveria ser aceito`);
  assert.equal(result.body.lab_signal, 'FIRST_FACTOR_ACCEPTED');
  const session = cookieFrom(result, 'lab-session');
  assert.equal(cookieFrom(result, 'account'), 'attacker');
  return session;
}

async function solveAuthLabs() {
  for (const lab of application.labs.filter(item => item.module === 'web-auth')) {
    let result;
    if (lab.track === 'auth-enumeration') {
      const baseline = await post(lab.payload, { username: 'not-a-user', password: 'invalid-password' });
      assert.notEqual(baseline.body.lab_signal, 'TRIGGERED');
      result = await post(lab.payload, { username: 'carlos', password: lab.level === 4 ? 'x'.repeat(120) : 'invalid-password' });
      assert.equal(result.body.authenticated, false);
    }

    if (lab.track === 'auth-bruteforce') {
      if (lab.level === 1) result = await post(lab.payload, { username: 'carlos', password: 'montoya' });
      if (lab.level === 2) {
        const blockedIp = { 'X-Lab-IP': '198.51.100.20' };
        for (let attempt = 0; attempt < 3; attempt += 1) await post(lab.payload, { username: 'carlos', password: 'wrong' }, blockedIp);
        const limited = await post(lab.payload, { username: 'carlos', password: 'montoya' }, blockedIp);
        assert.equal(limited.response.status, 429);
        assert.equal(limited.response.headers.get('retry-after'), '30');

        const bypassIp = { 'X-Lab-IP': '198.51.100.21' };
        await post(lab.payload, { username: 'carlos', password: 'wrong-1' }, bypassIp);
        await post(lab.payload, { username: 'carlos', password: 'wrong-2' }, bypassIp);
        const reset = await post(lab.payload, { username: 'attacker', password: 'attacker' }, bypassIp);
        assert.equal(reset.body.ip_failures, 0);
        result = await post(lab.payload, { username: 'carlos', password: 'montoya' }, bypassIp);
      }
      if (lab.level === 3) {
        for (let attempt = 0; attempt < 3; attempt += 1) {
          const unknown = await post(lab.payload, { username: 'not-a-user', password: 'wrong' });
          assert.equal(unknown.body.locked, false);
        }
        await post(lab.payload, { username: 'carlos', password: 'wrong-1' });
        await post(lab.payload, { username: 'carlos', password: 'wrong-2' });
        result = await post(lab.payload, { username: 'carlos', password: 'wrong-3' });
        assert.equal(result.body.account_failures, 3);
        assert.equal(result.body.locked, true);
      }
      if (lab.level === 4) {
        result = await post(lab.payload, { username: 'carlos', password: ['wrong', 'montoya', 'also-wrong'] });
        assert.equal(result.body.accepted_shape, 'password-array');
        assert.equal(result.body.attempts_processed, 3);
      }
      if (lab.level === 5) {
        result = await post(lab.payload, { credentials: [
          { username: 'nobody', password: 'wrong' },
          { username: 'carlos', password: 'montoya' },
          { username: 'guest', password: 'wrong' }
        ] });
        assert.equal(result.body.accepted_shape, 'credential-array');
        assert.equal(result.body.attempts_processed, 3);
      }
    }

    if (lab.track === 'auth-mfa') {
      const session = await startMfa(lab);
      const account = lab.level === 2 || lab.level === 5 ? 'victim-user' : 'attacker';
      const headers = { Cookie: `lab-session=${session}; account=${account}` };
      if (lab.level === 1) result = await post(lab.payload, { action: 'account' }, headers);
      if (lab.level === 2) result = await post(lab.payload, { action: 'verify', code: '123456' }, headers);
      if (lab.level === 3) {
        const firstUse = await post(lab.payload, { action: 'verify', code: '654321' }, headers);
        assert.equal(firstUse.body.lab_signal, 'CODE_ACCEPTED');
        assert.equal(firstUse.body.code_reused, false);
        result = await post(lab.payload, { action: 'verify', code: '654321' }, headers);
        assert.equal(result.body.code_reused, true);
      }
      if (lab.level >= 4) {
        for (const code of ['0000', '0001', '0002']) {
          const wrong = await post(lab.payload, { action: 'verify', code }, headers);
          assert.equal(wrong.body.lab_signal, 'CODE_REJECTED');
          assert.notEqual(wrong.response.status, 429, `${lab.id}: o cenário vulnerável não deveria aplicar rate limit`);
        }
        result = await post(lab.payload, { action: 'verify', code: '0042' }, headers);
        assert.equal(result.body.wrong_code_attempts, 3);
      }
      assert.equal(result.body.first_factor_user, 'attacker');
      if (lab.level === 2 || lab.level === 5) assert.equal(result.body.authenticated_as, 'victim-user');
    }

    if (lab.track === 'auth-remember') {
      const issued = await post(lab.payload, { action: 'issue', username: 'attacker', password: 'attacker' });
      assert.equal(issued.body.token, expectedRememberToken(lab.level, 'attacker', 'attacker'), `${lab.id}: composição do cookie inesperada`);
      assert.equal(cookieFrom(issued, 'stay-logged-in'), issued.body.token);
      const invalid = await post(lab.payload, { action: 'access', token: 'not-a-token' });
      assert.equal(invalid.response.status, 401);
      assert.notEqual(invalid.body.lab_signal, 'TRIGGERED');

      let token = expectedRememberToken(lab.level, 'carlos', 'montoya');
      if (lab.level === 4) {
        const profile = await post(lab.payload, { action: 'profile' });
        assert.equal(profile.body.leaked_cookie_sample, token);
        token = profile.body.leaked_cookie_sample;
      }
      result = await post(lab.payload, { action: 'access', token });
      assert.equal(result.body.authenticated_as, 'carlos');
    }

    if (lab.track === 'auth-reset') {
      if (lab.level === 1) result = await post(lab.payload, { action: 'change', username: 'victim-user', newPassword: 'changed-level-1' });
      if (lab.level === 2) {
        const requested = await post(lab.payload, { action: 'request', username: 'attacker' });
        const token = new URL(requested.body.mail_preview.link).searchParams.get('token');
        const opened = await post(lab.payload, { action: 'open', token });
        const form = cookieFrom(opened, 'reset-form');
        const withoutForm = await post(lab.payload, { action: 'change', username: 'victim-user', newPassword: 'rejected' });
        assert.equal(withoutForm.response.status, 400);
        result = await post(lab.payload, { action: 'change', username: 'victim-user', newPassword: 'changed-level-2' }, { Cookie: `reset-form=${form}` });
      }
      if (lab.level === 3) {
        result = await post(lab.payload, { action: 'request', username: 'victim-user' }, { 'X-Forwarded-Host': 'audit.evil.test' });
        assert.match(result.body.mail_preview.link, /^http:\/\/audit\.evil\.test\//);
        assert.equal(result.body.host_source, 'x-forwarded-host');
      }
      if (lab.level === 4) result = await post(lab.payload, { action: 'change', username: 'victim-user', currentPassword: 'summer2026', newPassword: 'changed-level-4' });
      if (lab.level === 5) {
        const requested = await post(lab.payload, { action: 'request', username: 'victim-user' }, { 'X-Forwarded-Host': 'capture.evil.test' });
        const token = new URL(requested.body.mail_preview.link).searchParams.get('token');
        const opened = await post(lab.payload, { action: 'open', token });
        assert.equal(opened.body.lab_signal, 'RESET_FORM_OPENED');
        result = await post(lab.payload, { action: 'change', token, newPassword: 'changed-level-5' });
        const reused = await post(lab.payload, { action: 'change', token, newPassword: 'changed-again' });
        assert.equal(reused.response.status, 400);
        assert.equal(reused.body.lab_signal, 'CHANGE_REJECTED');
      }
    }

    assertTriggered(result, lab.id);
    assert.equal(result.response.headers.get('cache-control'), 'no-store');
  }
}

async function solvePathLabs() {
  for (const lab of application.labs.filter(item => item.module === 'path-traversal')) {
    const solution = PATH_SOLUTIONS[lab.track][lab.level - 1];
    const route = `${lab.payload.split('?')[0]}?filename=${solution}`;
    const result = await request(route);
    assertTriggered(result, lab.id);
    assert.equal(result.body.canonical_path, PATH_EXPECTATIONS[lab.track][lab.level - 1], `${lab.id}: caminho canônico inesperado`);
    assert.equal(result.body.expected_path_matched, true);
    assert.equal(result.body.technique_observed, true);
    assert.equal(result.body.escaped_base, true);
    assert.ok(result.body.file_content, `${lab.id}: o arquivo virtual deveria ser observado`);
    assert.match(result.body.note, /nenhum arquivo real/i);
    assert.equal(result.response.headers.get('x-path-lab'), 'triggered');
  }
}

async function solveCommandLabs() {
  for (const lab of application.labs.filter(item => item.module === 'os-command-injection')) {
    const solution = COMMAND_SOLUTIONS[lab.track][lab.level - 1];
    const execution = await post(lab.payload, solution.input);
    assert.equal(execution.response.status, 200, `${lab.id}: execução virtual deveria responder de forma controlada`);
    assert.equal(execution.body.safety.operating_system_processes, false, `${lab.id}: nenhum processo real pode ser iniciado`);
    assert.equal(execution.body.safety.network, false, `${lab.id}: nenhuma rede externa pode ser usada`);
    assert.equal(execution.response.headers.get('cache-control'), 'no-store');
    let result = execution;
    if (lab.track === 'cmd-redirect') {
      assert.notEqual(execution.body.lab_signal, 'TRIGGERED', `${lab.id}: a primeira etapa cega não deveria concluir o lab`);
      result = await request(`/cmd/artifacts/${lab.track}/${lab.level}/${solution.expected.artifactName}`);
      assert.ok(result.body.content, `${lab.id}: artefato virtual deveria conter a saída`);
      assert.equal(result.body.safety.operating_system_files, false);
    }
    if (['cmd-oast', 'cmd-exfil'].includes(lab.track)) {
      assert.notEqual(execution.body.lab_signal, 'TRIGGERED', `${lab.id}: a primeira etapa OAST não deveria concluir o lab`);
      result = await request(`/cmd/collaborator/${lab.track}/${lab.level}`);
      assert.equal(result.body.external_dns_queries, false, `${lab.id}: nenhuma consulta DNS real pode ocorrer`);
      assert.ok(result.body.interactions.some(item => item.hostname === solution.expected.dnsHost), `${lab.id}: hostname virtual esperado ausente`);
    }
    assertTriggered(result, lab.id);
    assert.equal(result.response.headers.get('x-command-lab'), 'triggered');
  }
}

async function solveBusinessLabs() {
  for (const lab of application.labs.filter(item => item.module === 'business-logic')) {
    const solution = BUSINESS_LOGIC_SOLUTIONS[lab.track][lab.level - 1];
    const steps = solution.steps || [solution.input];
    let result;
    for (let index = 0; index < steps.length; index += 1) {
      result = await post(lab.payload, steps[index]);
      assert.equal(result.response.status, 200, `${lab.id}: operação deveria responder de forma controlada`);
      assert.equal(result.body.safety.real_orders, false, `${lab.id}: nenhum pedido real pode existir`);
      assert.equal(result.body.safety.real_money, false, `${lab.id}: nenhum dinheiro real pode ser movimentado`);
      assert.equal(result.body.safety.external_services, false, `${lab.id}: nenhum serviço externo pode ser usado`);
      assert.equal(result.response.headers.get('cache-control'), 'no-store');
      if (index < steps.length - 1) assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: a cadeia não deveria concluir antes da última etapa`);
    }
    assertTriggered(result, lab.id);
    assert.equal(result.body.observed_effect, solution.expected.effect, `${lab.id}: efeito de negócio inesperado`);
    assert.equal(result.response.headers.get('x-logic-lab'), 'triggered');
  }
}

async function solveApiLabs() {
  for (const lab of application.labs.filter(item => item.module === 'api-testing')) {
    const solution = API_TESTING_SOLUTIONS[lab.track][lab.level - 1];
    let result;
    for (let index = 0; index < solution.steps.length; index += 1) {
      result = await apiStep(lab.payload, solution.steps[index]);
      assert.equal(result.response.status, 200, `${lab.id}: a API virtual deveria responder de forma controlada`);
      assert.equal(result.body.safety.external_requests, false, `${lab.id}: nenhuma requisição externa pode ser realizada`);
      assert.equal(result.body.safety.external_targets, false, `${lab.id}: nenhum alvo externo pode ser consultado`);
      assert.equal(result.body.safety.real_data, false, `${lab.id}: nenhum dado real pode ser usado`);
      assert.equal(result.response.headers.get('cache-control'), 'no-store');
      if (index < solution.steps.length - 1) assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: a sequência não deveria concluir antes da última etapa`);
    }
    assertTriggered(result, lab.id);
    assert.equal(result.body.observed_effect, solution.expected.effect, `${lab.id}: efeito de API inesperado`);
    assert.equal(result.response.headers.get('x-api-lab'), 'triggered');
  }
}

async function solveInformationDisclosureLabs() {
  for (const lab of application.labs.filter(item => item.module === 'information-disclosure')) {
    const solution = INFO_DISCLOSURE_SOLUTIONS[lab.track][lab.level - 1];
    let result;
    for (let index = 0; index < solution.steps.length; index += 1) {
      result = await informationStep(lab.payload, solution.steps[index]);
      assert.equal(result.response.status, 200, `${lab.id}: o portal virtual deveria responder de forma controlada`);
      assert.equal(result.body.safety.external_requests, false, `${lab.id}: nenhuma requisição externa pode ocorrer`);
      assert.equal(result.body.safety.real_filesystem, false, `${lab.id}: nenhum arquivo real pode ser consultado`);
      assert.equal(result.body.safety.real_secrets, false, `${lab.id}: nenhum segredo real pode ser usado`);
      assert.equal(result.response.headers.get('cache-control'), 'no-store');
      if (index < solution.steps.length - 1) assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: a cadeia não deveria concluir antes da última observação`);
    }
    assertTriggered(result, lab.id);
    assert.equal(result.body.observed_effect, solution.expected.effect, `${lab.id}: efeito de divulgação inesperado`);
    assert.equal(result.response.headers.get('x-info-lab'), 'triggered');
  }
}

async function solveAccessControlLabs() {
  for (const lab of application.labs.filter(item => item.module === 'access-control')) {
    const solution = ACCESS_CONTROL_SOLUTIONS[lab.track][lab.level - 1];
    let result;
    for (let index = 0; index < solution.steps.length; index += 1) {
      result = await apiStep(lab.payload, solution.steps[index]);
      assert.equal(result.response.status, 200, `${lab.id}: o workspace de autorização deveria responder de forma controlada`);
      assert.equal(result.body.safety.external_requests, false, `${lab.id}: nenhuma requisição externa pode ocorrer`);
      assert.equal(result.body.safety.real_accounts, false, `${lab.id}: nenhuma conta real pode ser usada`);
      assert.equal(result.body.safety.real_authorization_system, false, `${lab.id}: nenhum sistema de autorização real pode ser consultado`);
      assert.equal(result.response.headers.get('cache-control'), 'no-store');
      if (index < solution.steps.length - 1) assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: a cadeia não deveria concluir antes da última decisão`);
    }
    assertTriggered(result, lab.id);
    assert.equal(result.body.observed_effect, solution.expected.effect, `${lab.id}: efeito de controle de acesso inesperado`);
    assert.equal(result.response.headers.get('x-access-lab'), 'triggered');
  }
}

async function solveFileUploadLabs() {
  for (const lab of application.labs.filter(item => item.module === 'file-upload')) {
    const solution = FILE_UPLOAD_SOLUTIONS[lab.track][lab.level - 1];
    let result;
    for (let index = 0; index < solution.steps.length; index += 1) {
      result = await apiStep(lab.payload, solution.steps[index]);
      assert.equal(result.response.status, 200, `${lab.id}: o cofre virtual deveria responder de forma controlada`);
      assert.equal(result.body.safety.external_requests, false, `${lab.id}: nenhuma requisição externa pode ocorrer`);
      assert.equal(result.body.safety.real_filesystem, false, `${lab.id}: nenhum arquivo real pode ser consultado ou gravado`);
      assert.equal(result.body.safety.code_execution, false, `${lab.id}: nenhum código pode ser executado`);
      assert.equal(result.body.safety.javascript_execution, false, `${lab.id}: nenhum JavaScript de upload pode ser executado`);
      assert.equal(result.body.safety.real_parser, false, `${lab.id}: nenhum parser real de documento pode ser acionado`);
      assert.equal(result.response.headers.get('cache-control'), 'no-store');
      if (index < solution.steps.length - 1) assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: a cadeia não deveria concluir antes da última evidência`);
    }
    assertTriggered(result, lab.id);
    assert.equal(result.body.observed_effect, solution.expected.effect, `${lab.id}: efeito de upload inesperado`);
    assert.equal(result.response.headers.get('x-upload-lab'), 'triggered');
  }
}

async function solveNoSqlLabs() {
  for (const lab of application.labs.filter(item => item.module === 'nosql-injection')) {
    const solution = NOSQL_INJECTION_SOLUTIONS[lab.track][lab.level - 1];
    let result;
    for (let index = 0; index < solution.steps.length; index += 1) {
      result = await apiStep(lab.payload, solution.steps[index]);
      assert.equal(result.response.status, 200, `${lab.id}: o catálogo documental deveria responder de forma controlada`);
      assert.equal(result.body.safety.external_requests, false, `${lab.id}: nenhuma requisição externa pode ocorrer`);
      assert.equal(result.body.safety.real_database, false, `${lab.id}: nenhum banco NoSQL real pode ser consultado`);
      assert.equal(result.body.safety.javascript_execution, false, `${lab.id}: nenhuma expressão JavaScript pode ser executada`);
      assert.equal(result.body.safety.server_code_execution, false, `${lab.id}: nenhum código do servidor pode ser executado`);
      assert.equal(result.body.safety.real_credentials, false, `${lab.id}: nenhuma credencial real pode ser usada`);
      assert.equal(result.response.headers.get('cache-control'), 'no-store');
      if (lab.track === 'nosql-time') assert.equal(result.body.real_delay_performed ?? false, false, `${lab.id}: o canal temporal não pode bloquear o servidor`);
      if (index < solution.steps.length - 1) assert.notEqual(result.body.lab_signal, 'TRIGGERED', `${lab.id}: a cadeia não deveria concluir antes da última comparação`);
    }
    assertTriggered(result, lab.id);
    assert.equal(result.body.observed_effect, solution.expected.effect, `${lab.id}: efeito de NoSQL inesperado`);
    assert.equal(result.response.headers.get('x-nosql-lab'), 'triggered');
  }
}

async function solveExtendedLabs() {
  for (const lab of EXTENDED_LABS) {
    const baseline = await request(`${lab.payload}?variant=baseline`);
    assert.equal(baseline.body.lab_signal, 'BASELINE_RECORDED', `${lab.id}: baseline ausente`);
    assert.equal(baseline.body.safety.external_requests, false);
    const wrong = await post(lab.payload, { variant: lab.solutionPayload.variant, evidenceId: 'evidence-incorreta' });
    assert.notEqual(wrong.body.lab_signal, 'TRIGGERED', `${lab.id}: evidência incorreta não deveria concluir`);
    const result = await post(lab.payload, lab.solutionPayload);
    assertTriggered(result, lab.id);
    assert.equal(result.body.safety.external_requests, false);
    assert.equal(result.body.safety.real_data, false);
    assert.equal(result.body.safety.code_execution, false);
    assert.equal(result.response.headers.get('x-academy-lab'), 'triggered');
  }
}

async function assertRobustnessAndPersistence() {
  const invalidJson = await request('/llm/chat/llm-api-agency/1', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"action":'
  });
  assert.equal(invalidJson.response.status, 400);
  assert.match(invalidJson.body.error, /JSON inválido/);

  const oversized = await request('/llm/chat/llm-api-agency/1', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'x'.repeat(70 * 1024) })
  });
  assert.equal(oversized.response.status, 413);

  const malformedPath = await request('/path/load/path-basic/1?%ZZ=value');
  assert.equal(malformedPath.response.status, 400);
  assert.match(malformedPath.body.error, /codifica/i);

  assert.equal((await request('/api/content/original?module=unknown')).response.status, 400);
  assert.equal((await request('/api/not-found')).response.status, 404);
  assert.equal((await request('/llm/chat/not-a-track/1')).response.status, 404);
  assert.equal((await request('/auth/login/auth-enumeration/99')).response.status, 404);
  assert.equal((await request('/path/load/path-basic/99?filename=218.png')).response.status, 404);
  assert.equal((await request('/cmd/execute/cmd-direct/99')).response.status, 404);
  assert.equal((await request('/cmd/execute/cmd-direct/1')).response.status, 405);
  assert.equal((await request('/logic/execute/logic-client-trust/99')).response.status, 404);
  assert.equal((await request('/logic/execute/logic-client-trust/1')).response.status, 405);
  assert.equal((await request('/api-lab/execute/api-recon/99')).response.status, 404);
  assert.equal((await request('/api-lab/execute/api-recon/1', { method: 'HEAD' })).response.status, 405);
  assert.equal((await request('/info/inspect/info-discovery/99')).response.status, 404);
  assert.equal((await request('/info/inspect/info-discovery/1', { method: 'DELETE' })).response.status, 405);
  assert.equal((await request('/access/check/access-vertical/99')).response.status, 404);
  assert.equal((await request('/access/check/access-vertical/1', { method: 'OPTIONS' })).response.status, 405);
  assert.equal((await request('/upload/inspect/upload-execution/99')).response.status, 404);
  assert.equal((await request('/upload/inspect/upload-execution/1', { method: 'DELETE' })).response.status, 405);
  assert.equal((await request('/nosql/query/nosql-syntax/99')).response.status, 404);
  assert.equal((await request('/nosql/query/nosql-syntax/1', { method: 'DELETE' })).response.status, 405);

  for (const route of ['/api/health', '/', '/app.js']) {
    const result = await request(route);
    assert.equal(result.response.headers.get('x-content-type-options'), 'nosniff', `${route}: nosniff ausente`);
    assert.equal(result.response.headers.get('referrer-policy'), 'no-referrer', `${route}: Referrer-Policy ausente`);
    assert.equal(result.response.headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=()', `${route}: Permissions-Policy ausente`);
  }
  const index = await request('/');
  assert.match(index.response.headers.get('content-security-policy'), /connect-src 'self'/);

  const progress = await request('/api/progress');
  assert.equal(progress.body.solved.length, 385, 'todos os 385 labs deveriam estar concluídos');
  assert.equal(new Set(progress.body.solved).size, 385, 'não deveria haver IDs duplicados');
  assert.equal(progress.body.earnedPoints, 115500);
  assert.equal(progress.body.availablePoints, 146500);

  const solvedResult = await request('/api/labs/result?lab=path-basic-1');
  assert.equal(solvedResult.response.status, 200);
  assert.ok(solvedResult.body.solution.steps[0].includes('/path/load/path-basic/1'));
  assert.ok(solvedResult.body.impact);

  const course = (await request('/api/course')).body;
  const firstQuestion = course.modules[0].quiz[0];
  const wrongQuiz = await post('/api/quiz/answer', { questionId: firstQuestion.id, answer: 0 });
  assert.equal(typeof wrongQuiz.body.correct, 'boolean');
  assert.ok(wrongQuiz.body.explanation);
  const examAnswers = course.modules.map(module => ({ questionId: module.quiz[0].id, answer: 0 }));
  const exam = await post('/api/exam/submit', { answers: examAnswers });
  assert.equal(exam.response.status, 200);
  assert.equal(exam.body.total, 31);

  for (const module of course.modules) {
    const final = await post('/api/final-challenge/submit', { module: module.id });
    assert.equal(final.body.completed, true, `${module.id}: desafio final deveria ser concluído`);
  }
  const completeProgress = await request('/api/progress');
  assert.equal(completeProgress.body.finalChallenges.length, 31);
  assert.equal(completeProgress.body.earnedPoints, 146500);
  const persisted = JSON.parse(fs.readFileSync(path.join(testData, 'progress.json'), 'utf8'));
  assert.equal(persisted.version, 3);
  assert.equal(persisted.solved.length, 385);
  assert.equal(persisted.finalChallenges.length, 31);

  await stopServer();
  delete require.cache[serverModulePath];
  application = require(serverModulePath);
  await startServer();
  const restored = await request('/api/progress');
  assert.equal(restored.body.solved.length, 385, 'o progresso deveria sobreviver ao reinício do servidor');
  assert.equal(restored.body.finalChallenges.length, 31, 'os desafios finais deveriam sobreviver ao reinício');

  const labsReset = await request('/api/labs/reset', { method: 'POST' });
  assert.equal(labsReset.body.ok, true);
  const stillSolved = await request('/api/progress');
  assert.equal(stillSolved.body.solved.length, 385, 'reiniciar estado efêmero não deveria apagar progresso');

  const reset = await request('/api/progress/reset', { method: 'POST' });
  assert.deepEqual(reset.body.solved, []);
  const afterReset = await request('/api/progress');
  assert.deepEqual(afterReset.body.solved, []);
  const resetFile = JSON.parse(fs.readFileSync(path.join(testData, 'progress.json'), 'utf8'));
  assert.deepEqual(resetFile.solved, []);
  assert.deepEqual(resetFile.finalChallenges, []);
}

async function run() {
  await startServer();
  const course = await assertCatalogAndAssets();
  await assertMiniSites(course);
  await assertNegativeFlows(course);
  await solveCacheLabs();
  await solveLlmLabs();
  await solveAuthLabs();
  await solvePathLabs();
  await solveCommandLabs();
  await solveBusinessLabs();
  await solveApiLabs();
  await solveInformationDisclosureLabs();
  await solveAccessControlLabs();
  await solveFileUploadLabs();
  await solveNoSqlLabs();
  await solveExtendedLabs();
  await assertRobustnessAndPersistence();
  console.log('Validação concluída: 385 mini sites abertos e 385 labs resolvidos por comportamento, incluindo 100 labs adicionais baseados no inventário PortSwigger.');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await stopServer().catch(() => {});
  fs.rmSync(testData, { recursive: true, force: true });
});
