(() => {
  const body = document.body;
  const lab = {
    id: body.dataset.labId,
    module: body.dataset.module,
    track: body.dataset.track,
    level: Number(body.dataset.level),
    endpoint: body.dataset.endpoint
  };
  const byId = id => document.getElementById(id);
  const value = id => byId(id)?.value ?? '';
  let requestCount = 0;
  let lastRequest = '';

  function toast(message) {
    const element = byId('site-toast');
    element.textContent = message;
    element.classList.add('show');
    window.setTimeout(() => element.classList.remove('show'), 2200);
  }

  function sameOriginUrl(route) {
    const target = new URL(route, location.origin);
    if (target.origin !== location.origin) throw new Error('O mini site aceita somente rotas locais da própria origem.');
    return target;
  }

  function requestText(target, options) {
    const method = options.method || 'GET';
    const headers = { Host: target.host, ...(options.headers || {}) };
    if (document.cookie) headers.Cookie = document.cookie;
    const lines = Object.entries(headers).map(([name, headerValue]) => `${name}: ${headerValue}`);
    const requestBody = options.body ? `\n\n${options.body}` : '';
    return `${method} ${target.pathname}${target.search} HTTP/1.1\n${lines.join('\n')}${requestBody}`;
  }

  function responseText(response, parsed, elapsed) {
    const headers = [...response.headers.entries()]
      .filter(([name]) => ['age', 'cache-control', 'content-type', 'retry-after', 'x-access-lab', 'x-api-lab', 'x-auth-lab', 'x-cache', 'x-cache-key', 'x-cache-normalized-path', 'x-cache-rule', 'x-command-lab', 'x-info-lab', 'x-lab-response-time', 'x-llm-lab', 'x-logic-lab', 'x-nosql-lab', 'x-origin-path', 'x-path-lab', 'x-upload-lab'].includes(name))
      .map(([name, headerValue]) => `${name}: ${headerValue}`);
    const content = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
    return `HTTP ${response.status} ${response.statusText}\nTempo observado no navegador: ${elapsed}ms\n${headers.join('\n')}\n\n${content}`;
  }

  async function sendRequest(route, options = {}) {
    const target = sameOriginUrl(route);
    const normalized = { credentials: 'same-origin', cache: 'no-store', ...options };
    lastRequest = requestText(target, normalized);
    byId('request-output').textContent = lastRequest;
    byId('response-status').textContent = 'ENVIANDO';
    byId('response-status').className = 'pending';
    const started = performance.now();
    try {
      const response = await fetch(target, normalized);
      const raw = await response.text();
      let parsed = raw;
      try { parsed = raw ? JSON.parse(raw) : {}; } catch {}
      const elapsed = Math.max(1, Math.round(performance.now() - started));
      byId('response-output').textContent = responseText(response, parsed, elapsed);
      byId('response-status').textContent = `${response.status} ${response.ok ? 'OK' : 'ERRO'}`;
      byId('response-status').className = response.ok ? 'ok' : 'error';
      const signal = parsed && typeof parsed === 'object' ? parsed.lab_signal : null;
      let solved = signal === 'TRIGGERED';
      if (!solved) {
        try {
          const progressResponse = await fetch('/api/progress', { credentials: 'same-origin', cache: 'no-store' });
          const progress = await progressResponse.json();
          solved = Array.isArray(progress.solved) && progress.solved.includes(lab.id);
        } catch {}
      }
      byId('lab-signal').textContent = solved ? '● CONDIÇÃO COMPORTAMENTAL ATINGIDA' : `● ${signal || 'RESPOSTA RECEBIDA'}`;
      byId('lab-signal').className = solved ? 'triggered' : '';
      requestCount += 1;
      byId('request-count').textContent = `${requestCount} ${requestCount === 1 ? 'REQUISIÇÃO' : 'REQUISIÇÕES'}`;
      hydrateFollowUp(parsed);
      return parsed;
    } catch (error) {
      byId('response-status').textContent = 'FALHA LOCAL';
      byId('response-status').className = 'error';
      byId('response-output').textContent = error.message;
      toast(error.message);
      return null;
    }
  }

  function jsonOptions(payload, extraHeaders = {}) {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(payload)
    };
  }

  function parseJsonField(id, fallback) {
    const raw = value(id).trim();
    if (!raw) return fallback;
    try { return JSON.parse(raw); }
    catch { throw new Error('O campo JSON contém uma estrutura inválida.'); }
  }

  function hydrateFollowUp(result) {
    if (!result || typeof result !== 'object') return;
    const tokenField = byId('auth-token');
    if (tokenField && result.token) tokenField.value = result.token;
    const link = result.mail_preview?.link;
    if (tokenField && link) {
      try { tokenField.value = new URL(link).searchParams.get('token') || tokenField.value; } catch {}
    }
  }

  function initCache() {
    const state = byId('session-state');
    const updateState = victim => {
      state.textContent = victim ? 'SESSÃO: VÍTIMA FICTÍCIA' : 'SESSÃO: ATACANTE';
      state.classList.toggle('victim', victim);
    };
    byId('use-victim').addEventListener('click', () => {
      document.cookie = 'session=victim; Path=/; SameSite=Strict';
      updateState(true);
      toast('Sessão fictícia de vítima aplicada.');
    });
    byId('use-attacker').addEventListener('click', () => {
      document.cookie = 'session=; Max-Age=0; Path=/; SameSite=Strict';
      updateState(false);
      toast('Sessão removida.');
    });
    updateState(document.cookie.split(';').some(item => item.trim() === 'session=victim'));
    byId('cache-form').addEventListener('submit', event => {
      event.preventDefault();
      sendRequest(value('cache-path').trim(), { method: 'GET' });
    });
  }

  function llmPayload() {
    if (lab.track === 'llm-indirect') {
      const payload = { task: value('llm-task'), sourceId: value('llm-source-id') };
      if (value('llm-source').trim()) payload.source = value('llm-source');
      return payload;
    }
    if (lab.track === 'llm-output') {
      const action = value('llm-action');
      if (action === 'view') return { action, viewer: value('llm-viewer') || 'victim-user' };
      return { action, html: value('llm-html') };
    }
    const action = value('llm-action');
    if (action === 'chat') return { message: value('llm-message') };
    if (action === 'list_tools') return { action };
    if (action === 'describe_tool') return { action, tool: value('llm-tool') };
    return { action, tool: value('llm-tool'), args: parseJsonField('llm-args', {}) };
  }

  function initLlm() {
    byId('llm-form').addEventListener('submit', event => {
      event.preventDefault();
      try { sendRequest(lab.endpoint, jsonOptions(llmPayload())); }
      catch (error) { toast(error.message); }
    });
  }

  function authPayload() {
    if (lab.track === 'auth-enumeration') return { username: value('auth-username'), password: value('auth-password') };
    if (lab.track === 'auth-bruteforce') {
      const shape = value('auth-shape');
      if (shape === 'password-array') return { username: value('auth-username'), password: parseJsonField('auth-list', []) };
      if (shape === 'credentials-array') return { credentials: parseJsonField('auth-list', []) };
      return { username: value('auth-username'), password: value('auth-password') };
    }
    const action = value('auth-action');
    if (lab.track === 'auth-mfa') {
      if (action === 'start') return { action, username: value('auth-username'), password: value('auth-password') };
      if (action === 'verify') return { action, code: value('auth-code') };
      return { action };
    }
    if (lab.track === 'auth-remember') {
      if (action === 'issue') return { action, username: value('auth-username'), password: value('auth-password') };
      if (action === 'access') return { action, token: value('auth-token') };
      return { action };
    }
    if (action === 'request') return { action, username: value('auth-username') };
    if (action === 'open') return { action, token: value('auth-token') };
    return { action, username: value('auth-username'), currentPassword: value('auth-current'), newPassword: value('auth-new'), token: value('auth-token') };
  }

  function authHeaders() {
    const headers = {};
    if (byId('auth-ip') && value('auth-ip').trim()) headers['X-Lab-IP'] = value('auth-ip').trim();
    if (byId('auth-forwarded-host') && value('auth-forwarded-host').trim()) headers['X-Forwarded-Host'] = value('auth-forwarded-host').trim();
    return headers;
  }

  function initAuth() {
    byId('set-account')?.addEventListener('click', () => {
      const account = value('auth-account').trim();
      document.cookie = `account=${encodeURIComponent(account)}; Path=/; SameSite=Strict`;
      toast(`Cookie account definido como ${account || '(vazio)'}.`);
    });
    byId('auth-form').addEventListener('submit', event => {
      event.preventDefault();
      try { sendRequest(lab.endpoint, jsonOptions(authPayload(), authHeaders())); }
      catch (error) { toast(error.message); }
    });
    byId('send-auth-raw').addEventListener('click', () => {
      try { sendRequest(lab.endpoint, jsonOptions(parseJsonField('auth-raw', {}), authHeaders())); }
      catch (error) { toast(error.message); }
    });
  }

  function initPath() {
    const base = lab.endpoint.split('?')[0];
    byId('path-form').addEventListener('submit', event => {
      event.preventDefault();
      sendRequest(`${base}?filename=${value('path-filename')}`, { method: 'GET' });
    });
  }

  function initCommand() {
    byId('command-form').addEventListener('submit', event => {
      event.preventDefault();
      const payload = lab.track === 'cmd-direct'
        ? { productId: value('command-product'), storeId: value('command-store') }
        : { email: value('command-email'), message: value('command-message') };
      sendRequest(lab.endpoint, jsonOptions(payload));
    });
    byId('command-observe')?.addEventListener('click', () => {
      if (lab.track === 'cmd-redirect') {
        const name = value('command-artifact').trim();
        if (!/^[a-z0-9._-]+$/i.test(name)) return toast('Informe somente o nome do artefato virtual.');
        return sendRequest(`/cmd/artifacts/${lab.track}/${lab.level}/${encodeURIComponent(name)}`, { method: 'GET' });
      }
      return sendRequest(`/cmd/collaborator/${lab.track}/${lab.level}`, { method: 'GET' });
    });
  }

  function businessPayload() {
    const payload = {};
    const textFields = {
      action: 'business-action', productId: 'business-product', target: 'business-target',
      orderId: 'business-order', operation: 'business-operation', channel: 'business-channel',
      code: 'business-code', payment: 'business-payment'
    };
    const numberFields = {
      quantity: 'business-quantity', unitPrice: 'business-unit-price', discountPercent: 'business-discount',
      shippingFee: 'business-shipping', clientTotal: 'business-client-total', amount: 'business-amount', points: 'business-points'
    };
    for (const [key, id] of Object.entries(textFields)) {
      if (byId(id) && value(id) !== '') payload[key] = value(id);
    }
    for (const [key, id] of Object.entries(numberFields)) {
      if (byId(id) && value(id).trim() !== '') payload[key] = Number(value(id));
    }
    if (byId('business-confirmed')) payload.confirmed = value('business-confirmed') === 'true';
    return payload;
  }

  function initBusiness() {
    byId('business-form').addEventListener('submit', event => {
      event.preventDefault();
      sendRequest(lab.endpoint, jsonOptions(businessPayload()));
    });
  }

  function apiRequestOptions(method, input) {
    const headers = {};
    const override = value('api-override').trim();
    if (override) headers['X-HTTP-Method-Override'] = override;
    if (['GET', 'OPTIONS'].includes(method)) {
      const target = sameOriginUrl(lab.endpoint);
      for (const [key, item] of Object.entries(input)) target.searchParams.set(key, typeof item === 'object' ? JSON.stringify(item) : String(item));
      return { route: `${target.pathname}${target.search}`, options: { method, headers } };
    }
    const contentType = value('api-content-type');
    headers['Content-Type'] = contentType;
    const bodyText = contentType === 'application/x-www-form-urlencoded'
      ? new URLSearchParams(Object.entries(input).map(([key, item]) => [key, typeof item === 'object' ? JSON.stringify(item) : String(item)])).toString()
      : JSON.stringify(input);
    return { route: lab.endpoint, options: { method, headers, body: bodyText } };
  }

  function initApi() {
    const baseline = value('api-input');
    byId('api-reset-input').addEventListener('click', () => {
      byId('api-input').value = baseline;
      byId('api-method').value = byId('api-method').querySelector('[selected]')?.value || 'GET';
      byId('api-override').value = '';
      toast('Requisição-base restaurada.');
    });
    byId('api-form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        const method = value('api-method');
        const prepared = apiRequestOptions(method, parseJsonField('api-input', {}));
        sendRequest(prepared.route, prepared.options);
      } catch (error) {
        toast(error.message);
      }
    });
  }

  function informationHeaders() {
    const headers = {};
    if (value('information-user').trim()) headers['X-Lab-User'] = value('information-user').trim();
    if (value('information-debug').trim()) headers['X-Debug-Level'] = value('information-debug').trim();
    if (value('information-auth').trim()) headers['X-Lab-Auth'] = value('information-auth').trim();
    return headers;
  }

  function informationRequestOptions(method, input) {
    const headers = informationHeaders();
    const payload = { ...input, path: value('information-path').trim() || '/' };
    if (method === 'GET') {
      const target = sameOriginUrl(lab.endpoint);
      for (const [key, item] of Object.entries(payload)) target.searchParams.set(key, typeof item === 'object' ? JSON.stringify(item) : String(item));
      return { route: `${target.pathname}${target.search}`, options: { method: 'GET', headers } };
    }
    headers['Content-Type'] = 'application/json';
    if (method === 'TRACE') headers['X-Lab-Method'] = 'TRACE';
    return { route: lab.endpoint, options: { method: 'POST', headers, body: JSON.stringify(payload) } };
  }

  function initInformationDisclosure() {
    const baseline = {
      method: value('information-method'),
      path: value('information-path'),
      input: value('information-input'),
      user: value('information-user'),
      debug: value('information-debug'),
      auth: value('information-auth')
    };
    byId('information-reset').addEventListener('click', () => {
      byId('information-method').value = baseline.method;
      byId('information-path').value = baseline.path;
      byId('information-input').value = baseline.input;
      byId('information-user').value = baseline.user;
      byId('information-debug').value = baseline.debug;
      byId('information-auth').value = baseline.auth;
      toast('Requisição-base restaurada.');
    });
    byId('information-form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        const prepared = informationRequestOptions(value('information-method'), parseJsonField('information-input', {}));
        sendRequest(prepared.route, prepared.options);
      } catch (error) {
        toast(error.message);
      }
    });
  }

  function accessHeaders() {
    const headers = {};
    if (value('access-user').trim()) headers['X-Lab-User'] = value('access-user').trim();
    if (value('access-region').trim()) headers['X-Lab-Region'] = value('access-region').trim();
    if (value('access-original-url').trim()) headers['X-Original-URL'] = value('access-original-url').trim();
    if (value('access-rewrite-url').trim()) headers['X-Rewrite-URL'] = value('access-rewrite-url').trim();
    if (value('access-referer').trim()) headers['X-Lab-Referer'] = value('access-referer').trim();
    return headers;
  }

  function accessRequestOptions(method, input) {
    const headers = accessHeaders();
    const payload = { ...input, path: value('access-path').trim() || '/' };
    if (method === 'GET') {
      const target = sameOriginUrl(lab.endpoint);
      for (const [key, item] of Object.entries(payload)) target.searchParams.set(key, typeof item === 'object' ? JSON.stringify(item) : String(item));
      return { route: `${target.pathname}${target.search}`, options: { method: 'GET', headers } };
    }
    headers['Content-Type'] = 'application/json';
    return { route: lab.endpoint, options: { method, headers, body: JSON.stringify(payload) } };
  }

  function initAccessControl() {
    const baseline = {
      method: value('access-method'),
      path: value('access-path'),
      input: value('access-input'),
      user: value('access-user'),
      region: value('access-region'),
      originalUrl: value('access-original-url'),
      rewriteUrl: value('access-rewrite-url'),
      referer: value('access-referer')
    };
    byId('access-reset').addEventListener('click', () => {
      byId('access-method').value = baseline.method;
      byId('access-path').value = baseline.path;
      byId('access-input').value = baseline.input;
      byId('access-user').value = baseline.user;
      byId('access-region').value = baseline.region;
      byId('access-original-url').value = baseline.originalUrl;
      byId('access-rewrite-url').value = baseline.rewriteUrl;
      byId('access-referer').value = baseline.referer;
      toast('Requisição-base restaurada.');
    });
    byId('access-form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        const prepared = accessRequestOptions(value('access-method'), parseJsonField('access-input', {}));
        sendRequest(prepared.route, prepared.options);
      } catch (error) {
        toast(error.message);
      }
    });
  }

  function uploadRequestOptions(method, input) {
    const payload = { ...input };
    const action = String(payload.action || '');
    if (['upload', 'stage-upload', 'import-local'].includes(action) || method === 'PUT') {
      payload.filename = value('upload-filename').trim();
      payload.declaredType = value('upload-type').trim();
    }
    if (['request', 'render', 'process'].includes(action)) {
      payload.path = value('upload-path').trim();
    }
    if (['GET', 'OPTIONS'].includes(method)) {
      const target = sameOriginUrl(lab.endpoint);
      for (const [key, item] of Object.entries(payload)) {
        target.searchParams.set(key, typeof item === 'object' ? JSON.stringify(item) : String(item));
      }
      return { route: `${target.pathname}${target.search}`, options: { method } };
    }
    return {
      route: lab.endpoint,
      options: { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    };
  }

  function initFileUpload() {
    const baseline = {
      method: value('upload-method'),
      filename: value('upload-filename'),
      declaredType: value('upload-type'),
      path: value('upload-path'),
      input: value('upload-input')
    };
    byId('upload-reset').addEventListener('click', () => {
      byId('upload-method').value = baseline.method;
      byId('upload-filename').value = baseline.filename;
      byId('upload-type').value = baseline.declaredType;
      byId('upload-path').value = baseline.path;
      byId('upload-input').value = baseline.input;
      toast('Requisição-base restaurada.');
    });
    byId('upload-form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        const prepared = uploadRequestOptions(value('upload-method'), parseJsonField('upload-input', {}));
        sendRequest(prepared.route, prepared.options);
      } catch (error) {
        toast(error.message);
      }
    });
  }

  function nosqlRequestOptions(method, input) {
    if (method === 'GET') {
      const target = sameOriginUrl(lab.endpoint);
      for (const [key, item] of Object.entries(input)) target.searchParams.set(key, typeof item === 'object' ? JSON.stringify(item) : String(item));
      return { route: `${target.pathname}${target.search}`, options: { method: 'GET' } };
    }
    const contentType = value('nosql-content-type');
    const bodyText = contentType === 'application/x-www-form-urlencoded'
      ? new URLSearchParams(Object.entries(input).map(([key, item]) => [key, typeof item === 'object' ? JSON.stringify(item) : String(item)])).toString()
      : JSON.stringify(input);
    return { route: lab.endpoint, options: { method: 'POST', headers: { 'Content-Type': contentType }, body: bodyText } };
  }

  function initNoSql() {
    const baseline = {
      method: value('nosql-method'),
      contentType: value('nosql-content-type'),
      input: value('nosql-input')
    };
    byId('nosql-reset').addEventListener('click', () => {
      byId('nosql-method').value = baseline.method;
      byId('nosql-content-type').value = baseline.contentType;
      byId('nosql-input').value = baseline.input;
      toast('Consulta-base restaurada.');
    });
    byId('nosql-form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        const prepared = nosqlRequestOptions(value('nosql-method'), parseJsonField('nosql-input', {}));
        sendRequest(prepared.route, prepared.options);
      } catch (error) {
        toast(error.message);
      }
    });
  }

  byId('copy-traffic').addEventListener('click', async () => {
    if (!lastRequest) return toast('Faça uma requisição primeiro.');
    try { await navigator.clipboard.writeText(lastRequest); toast('Requisição copiada.'); }
    catch { toast('Não foi possível acessar a área de transferência.'); }
  });

  if (lab.module === 'web-cache') initCache();
  else if (lab.module === 'web-llm') initLlm();
  else if (lab.module === 'web-auth') initAuth();
  else if (lab.module === 'os-command-injection') initCommand();
  else if (lab.module === 'business-logic') initBusiness();
  else if (lab.module === 'api-testing') initApi();
  else if (lab.module === 'information-disclosure') initInformationDisclosure();
  else if (lab.module === 'access-control') initAccessControl();
  else if (lab.module === 'file-upload') initFileUpload();
  else if (lab.module === 'nosql-injection') initNoSql();
  else initPath();
})();
