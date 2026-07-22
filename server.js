const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const originalText = fs.readFileSync(path.join(ROOT, 'Webcache.txt'), 'utf8');
const cache = new Map();
const solved = new Set();

const tracks = [
  { id: 'cache-detection', title: 'Detectando respostas em cache', icon: 'RADAR', summary: 'Aprenda a provar HIT, MISS, idade e revalidação sem confiar em um único sinal.', color: '#8cffc1' },
  { id: 'cache-buster', title: 'Cache busters e chaves', icon: 'KEY', summary: 'Isole seus testes alterando a chave de cache e evite conclusões contaminadas.', color: '#ffd166' },
  { id: 'path-mapping', title: 'Mapeamento de caminho', icon: 'PATH', summary: 'Explore a diferença entre rotas REST e arquivos estáticos.', color: '#62d9ff' },
  { id: 'delimiter', title: 'Discrepâncias de delimitadores', icon: 'DELIM', summary: 'Descubra caracteres que truncam o caminho apenas na origem.', color: '#ff8fab' },
  { id: 'encoded-delimiter', title: 'Delimitadores codificados', icon: '%23', summary: 'Teste diferenças de decodificação entre cache e aplicação.', color: '#c7a6ff' },
  { id: 'origin-normalization', title: 'Normalização na origem', icon: '../', summary: 'Faça a origem resolver traversal enquanto o cache preserva o prefixo estático.', color: '#ff9f68' },
  { id: 'cache-normalization', title: 'Normalização no cache', icon: 'NORM', summary: 'Combine normalização do cache e truncamento na origem.', color: '#7de2d1' },
  { id: 'exact-file', title: 'Correspondência exata', icon: 'FILE', summary: 'Acione regras para index.html, robots.txt e favicon.ico.', color: '#f5e663' },
  { id: 'llm-api-agency', module: 'web-llm', title: 'Agência excessiva em APIs LLM', icon: 'TOOL', summary: 'Mapeie funções e abuse de APIs expostas ao modelo.', color: '#ff8fab' },
  { id: 'llm-chaining', module: 'web-llm', title: 'Encadeamento de vulnerabilidades', icon: 'CHAIN', summary: 'Use o LLM como ponte para ataques clássicos na API.', color: '#c7a6ff' },
  { id: 'llm-indirect', module: 'web-llm', title: 'Injeção imediata indireta', icon: 'PROMPT', summary: 'Investigue instruções hostis vindas de e-mails e páginas.', color: '#62d9ff' },
  { id: 'llm-output', module: 'web-llm', title: 'Manuseio de saída inseguro', icon: 'OUT', summary: 'Demonstre XSS e ações perigosas geradas pelo modelo.', color: '#ffd166' }
];

const difficulty = ['Aprendiz', 'Básico', 'Praticante', 'Avançado', 'CTF'];
const extension = ['css', 'js', 'ico', 'exe', 'map'];

function labFor(track, level) {
  const ext = extension[level - 1];
  const common = {
    id: `${track}-${level}`,
    track,
    level,
    difficulty: difficulty[level - 1],
    points: level * 100,
    title: [
      'Primeiro sinal', 'Confirme a hipótese', 'Encontre a discrepância', 'Capture o segredo', 'Caixa-preta'
    ][level - 1],
    objective: level < 3
      ? 'Use o Burp Repeater para provocar e identificar o comportamento do cache.'
      : 'Faça uma resposta privada da vítima ser armazenada e recupere-a sem o cookie de sessão.',
    hints: [],
    startPath: `/lab/${track}/${level}/account`,
    victimCookie: 'session=victim'
  };
  const recipes = {
    'cache-detection': {
      payload: `/lab/${track}/${level}/asset.${ext}`,
      hints: ['Envie exatamente a mesma requisição duas vezes.', 'Compare X-Cache, Age e X-Lab-Response-Time.', 'MISS seguido de HIT confirma o armazenamento.']
    },
    'cache-buster': {
      payload: `/lab/${track}/${level}/asset.${ext}?cb=VALOR_UNICO`,
      hints: ['A query string faz parte da chave neste lab.', 'Troque o valor de cb entre os testes.', 'Compare a primeira e a segunda resposta de cada chave.']
    },
    'path-mapping': {
      payload: `/lab/${track}/${level}/account/wcd.${ext}`,
      hints: ['A origem usa uma rota REST e ignora um segmento extra.', `Tente terminar o caminho com .${ext}.`, 'Faça a primeira requisição como vítima e repita sem Cookie.']
    },
    delimiter: {
      payload: `/lab/${track}/${level}/account;wcd.${ext}`,
      hints: ['Teste um caractere entre account e o sufixo.', 'A origem trata ponto e vírgula como delimitador.', `O cache enxerga o final .${ext}.`]
    },
    'encoded-delimiter': {
      payload: `/lab/${track}/${level}/account%23wcd.${ext}`,
      hints: ['O caractere útil não aparece decodificado na chave.', 'Teste a versão URL-encoded de #.', 'Use %23 antes da extensão estática.']
    },
    'origin-normalization': {
      payload: `/lab/${track}/${level}/assets/..%2faccount`,
      hints: ['O cache reconhece um prefixo de diretório estático.', 'A origem decodifica a barra e resolve o segmento de pontos.', 'Tente /assets/..%2faccount.']
    },
    'cache-normalization': {
      payload: `/lab/${track}/${level}/account;%2f%2e%2e%2fstatic`,
      hints: ['Você precisa de normalização e de um delimitador.', 'A origem trunca em ; e o cache resolve o traversal.', 'Tente account;%2f%2e%2e%2fstatic.']
    },
    'exact-file': {
      payload: `/lab/${track}/${level}/account;%2f%2e%2e%2findex.html`,
      hints: ['A regra exige um nome de arquivo exato.', 'Combine ; com um traversal totalmente codificado.', 'Faça o cache normalizar o caminho para /index.html.']
    },
    'llm-api-agency': { payload: '/llm/chat', hints: ['Converse com o assistente e observe nomes de ferramentas.', 'Peça o catálogo de funções disponível.', 'Confirme se uma função administrativa pode ser chamada sem autorização.'] },
    'llm-chaining': { payload: '/llm/chat', hints: ['Mapeie as ferramentas antes de tentar explorá-las.', 'Procure parâmetros que aceitem URL, arquivo ou consulta.', 'Use somente dados fictícios do laboratório para demonstrar a segunda vulnerabilidade.'] },
    'llm-indirect': { payload: '/llm/summarize?source=email', hints: ['O prompt não está no campo de chat.', 'Inspecione o conteúdo retornado pela fonte externa.', 'Simule uma instrução falsa de sistema e observe a ação gerada.'] },
    'llm-output': { payload: '/llm/chat', hints: ['Verifique como a resposta do modelo é renderizada.', 'Peça uma saída com marcação controlada.', 'Confirme se o frontend sanitiza HTML antes de inserir a resposta.'] }
  };
  return { ...common, ...(recipes[track] || {}) };
}

const labs = tracks.flatMap(t => [1, 2, 3, 4, 5].map(n => labFor(t.id, n)));

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function serveFile(res, pathname) {
  const target = pathname === '/' ? '/index.html' : pathname;
  const full = path.join(PUBLIC, path.normalize(target).replace(/^(\.\.[/\\])+/, ''));
  if (!full.startsWith(PUBLIC) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) return false;
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
  res.writeHead(200, { 'Content-Type': types[path.extname(full)] || 'application/octet-stream' });
  fs.createReadStream(full).pipe(res);
  return true;
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(v => v.trim().split('=')));
}

function cacheRule(track, rawSuffix, decodedSuffix) {
  if (track === 'cache-detection' || track === 'cache-buster') return /\.(css|js|ico|exe|map)$/.test(decodedSuffix);
  if (track === 'path-mapping' || track === 'delimiter' || track === 'encoded-delimiter') return /\.(css|js|ico|exe|map)$/.test(rawSuffix);
  if (track === 'origin-normalization') return rawSuffix.startsWith('/assets/');
  if (track === 'cache-normalization') return normalizeEncoded(rawSuffix).endsWith('/static');
  if (track === 'exact-file') return normalizeEncoded(rawSuffix).endsWith('/index.html');
  return false;
}

function normalizeEncoded(value) {
  let decoded;
  try { decoded = decodeURIComponent(value); } catch { decoded = value; }
  const parts = [];
  for (const bit of decoded.split('/')) {
    if (!bit || bit === '.') continue;
    if (bit === '..') parts.pop(); else parts.push(bit);
  }
  return '/' + parts.join('/');
}

function originResource(track, suffix) {
  let decoded = suffix;
  try { decoded = decodeURIComponent(suffix); } catch {}
  if (track === 'path-mapping') return decoded.startsWith('/account/') ? '/account' : decoded;
  if (track === 'delimiter' || track === 'cache-normalization' || track === 'exact-file') return decoded.split(';')[0];
  if (track === 'encoded-delimiter') return decoded.split('#')[0];
  if (track === 'origin-normalization') return normalizeEncoded(suffix);
  return decoded;
}

function handleLab(req, res, url) {
  const match = url.pathname.match(/^\/lab\/([^/]+)\/(\d+)(\/.*)$/);
  if (!match) return send(res, 404, { error: 'Lab não encontrado' });
  const [, track, levelRaw, suffix] = match;
  const level = Number(levelRaw);
  const lab = labs.find(x => x.track === track && x.level === level);
  if (!lab) return send(res, 404, { error: 'Lab não encontrado' });
  if (track.startsWith('llm-')) {
    const prompt = `${url.searchParams.get('prompt') || ''} ${url.searchParams.get('source') || ''}`.toLowerCase();
    const triggers = {
      'llm-api-agency': ['tool', 'api', 'function', 'admin'],
      'llm-chaining': ['file', 'path', 'url', 'sql'],
      'llm-indirect': ['forward', 'system', 'important', 'email'],
      'llm-output': ['script', 'html', 'markup', 'xss']
    }[track] || [];
    const hit = triggers.some(x => prompt.includes(x));
    if (hit) solved.add(lab.id);
    return send(res, 200, { assistant: hit ? 'Ação simulada registrada pelo laboratório.' : 'Posso ajudar com sua solicitação.', available_tools: ['get_user', 'get_order', 'search_kb', 'create_forwarding_rule'], lab_signal: hit ? 'TRIGGERED' : 'OBSERVE_PROMPT' }, { 'X-LLM-Lab': hit ? 'triggered' : 'safe' });
  }
  const rawUrl = req.url.split('?')[0];
  const rawSuffix = rawUrl.replace(`/lab/${track}/${level}`, '');
  const key = `${track}:${level}:${rawUrl}${url.search}`;
  const eligible = cacheRule(track, rawSuffix, suffix);
  const stored = cache.get(key);
  if (stored && stored.expires > Date.now()) {
    const attacker = parseCookies(req).session !== 'victim';
    if ((stored.private && attacker) || ((track === 'cache-detection' || track === 'cache-buster') && !stored.private)) solved.add(lab.id);
    return send(res, 200, stored.body, {
      'X-Cache': 'hit', 'Age': String(Math.floor((Date.now() - stored.created) / 1000)),
      'X-Cache-Key': key, 'X-Lab-Response-Time': '4ms', 'Cache-Control': 'public, max-age=30'
    });
  }
  const resource = originResource(track, rawSuffix);
  const victim = parseCookies(req).session === 'victim';
  const isAccount = resource === '/account';
  const body = isAccount
    ? (victim ? { page: 'Minha conta', user: 'victim', email: 'victim@bscp.local', apiKey: `BSCP-${track.toUpperCase()}-${level}-SECRET` } : { error: 'Faça login para acessar sua conta' })
    : { resource: rawSuffix, content: 'Recurso público do laboratório', generatedAt: new Date().toISOString() };
  if (eligible) cache.set(key, { body, private: isAccount && victim, created: Date.now(), expires: Date.now() + 30000 });
  if ((track === 'cache-detection' || track === 'cache-buster') && eligible && stored) solved.add(lab.id);
  return send(res, isAccount && !victim ? 401 : 200, body, {
    'X-Cache': eligible ? 'miss' : 'dynamic', 'X-Cache-Key': key,
    'X-Origin-Path': resource, 'X-Lab-Response-Time': eligible ? '96ms' : '72ms',
    'Cache-Control': eligible ? 'public, max-age=30' : 'private, no-store'
  });
}

function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/course') return send(res, 200, { tracks, labs, stats: { tracks: tracks.length, labs: labs.length, points: labs.reduce((a, b) => a + b.points, 0) } });
  if (url.pathname === '/api/content/original') {
    const filename = url.searchParams.get('module') === 'web-llm' ? 'burpLLM.txt' : 'Webcache.txt';
    return send(res, 200, { text: fs.readFileSync(path.join(ROOT, filename), 'utf8'), module: filename });
  }
  if (url.pathname === '/api/progress') return send(res, 200, { solved: [...solved] });
  if (url.pathname === '/api/cache/reset' && req.method === 'POST') { cache.clear(); return send(res, 200, { ok: true }); }
  if (url.pathname.startsWith('/lab/')) return handleLab(req, res, url);
  if (serveFile(res, url.pathname)) return;
  send(res, 404, { error: 'Rota não encontrada' });
}

if (require.main === module) http.createServer(handler).listen(PORT, '127.0.0.1', () => {
  console.log(`Burp Academy disponível em http://127.0.0.1:${PORT}`);
});

module.exports = { handler, tracks, labs };
