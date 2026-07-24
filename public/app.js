let course = { modules: [], tracks: [], labs: [] };
let progress = new Set();
let progressData = { solved: [], attempts: {}, quizHistory: [], finalChallenges: [], earnedPoints: 0, availablePoints: 0 };
let currentLesson = 0;
let activeModule = 'web-cache';
let activeFilter = 'all';
let originalRequestSequence = 0;
let dialogReturnFocus = null;
let currentLab = null;
let examQuestions = [];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const moduleById = id => course.modules.find(module => module.id === id);
const moduleLabel = id => moduleById(id)?.shortName || id.toUpperCase();

async function apiJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Falha HTTP ${response.status}`);
  return body;
}

function renderModuleControls() {
  $('#moduleSubmenu').innerHTML = course.modules.map(module => {
    const trackCount = course.tracks.filter(track => track.module === module.id).length;
    const labCount = course.labs.filter(lab => lab.module === module.id).length;
    return `<button class="module-side ${module.id === activeModule ? 'active' : ''}" data-module="${esc(module.id)}" aria-pressed="${module.id === activeModule}"><i>${String(module.order).padStart(2, '0')}</i><span>${esc(module.name)}<small>${trackCount} trilhas · ${labCount} labs</small></span></button>`;
  }).join('');
  $('#moduleFilters').innerHTML = [
    ['all', 'Módulo atual'],
    ...course.modules.map(module => [module.id, module.shortName]),
    ['open', 'Em aberto'], ['solved', 'Resolvidos']
  ].map(([value, label], index) => `<button class="chip ${index === 0 ? 'active' : ''}" data-filter="${esc(value)}" aria-pressed="${index === 0}">${esc(label)}</button>`).join('');
  $('#originalModules').innerHTML = course.modules.map((module, index) => `<button class="chip original-module ${index === 0 ? 'active' : ''}" data-original-module="${esc(module.id)}">${esc(module.shortName)}</button>`).join('');

  $$('.module-side').forEach(button => {
    button.onclick = () => {
      switchModule(button.dataset.module);
      show('dashboard');
      closeModuleMenu();
    };
  });
  $$('.chip[data-filter]').forEach(button => {
    button.onclick = () => {
      if (moduleById(button.dataset.filter)) switchModule(button.dataset.filter);
      $$('.chip[data-filter]').forEach(item => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      renderTracks(button.dataset.filter);
    };
  });
  $$('.original-module').forEach(button => { button.onclick = () => renderOriginal(button.dataset.originalModule); });
}

function closeModuleMenu() {
  $('#moduleSubmenu').classList.remove('open');
  $('#moduleSubmenu').hidden = true;
  $('#moduleMenuToggle').classList.remove('open');
  $('#moduleMenuToggle').setAttribute('aria-expanded', 'false');
}

function enableScopedHorizontalWheel(container) {
  if (!container) return;
  container.addEventListener('wheel', event => {
    if (!event.shiftKey || container.scrollWidth <= container.clientWidth) return;
    const delta = event.deltaY || event.deltaX;
    if (!delta) return;
    event.preventDefault();
    container.scrollLeft += delta;
  }, { passive: false });
}

async function boot() {
  try {
    const [catalog, savedProgress] = await Promise.all([apiJson('/api/course'), apiJson('/api/progress')]);
    course = catalog;
    progressData = savedProgress;
    progress = new Set(savedProgress.solved);
    activeModule = course.modules[0]?.id || activeModule;
    renderModuleControls();
    $('#sideTotal').textContent = course.labs.length;
    renderStats();
    renderModuleDashboard(activeModule);
    renderTracks();
    renderLessons();
    renderOriginal();
    loadNotes();
    renderLearning();
    renderMetrics();
    loadStudyProfile();
    updateProgress();
    $('#systemStatus').innerHTML = '<i></i> LAB SERVER ONLINE';
  } catch (error) {
    $('#systemStatus').textContent = 'LAB SERVER OFFLINE';
    $('#stats').innerHTML = `<div class="load-error"><strong>Não foi possível carregar a academia.</strong><span>${esc(error.message)}</span></div>`;
    toast(error.message);
  }
}

function show(view) {
  $$('.view').forEach(element => {
    const active = element.id === view;
    element.classList.toggle('active', active);
    element.hidden = !active;
  });
  $$('.nav-item[data-view]').forEach(element => {
    const active = element.dataset.view === view;
    element.classList.toggle('active', active);
    if (active) element.setAttribute('aria-current', 'page');
    else element.removeAttribute('aria-current');
  });
  $('#currentCrumb').textContent = view.toUpperCase();
  if (view === 'learning') renderLearning();
  if (view === 'metrics') renderMetrics();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderModuleDashboard(module) {
  const dashboard = moduleById(module)?.dashboard;
  if (!dashboard) return;
  $('#requestExample').textContent = dashboard.request;
  $('#methodEyebrow').textContent = dashboard.eyebrow;
  $('#methodDescription').textContent = dashboard.description;
  $('#methodGrid').innerHTML = dashboard.steps.map(([title, description, example], index) => `<article><span>0${index + 1}</span><h3>${esc(title)}</h3><p>${esc(description)}</p><code>${esc(example)}</code></article>`).join('');
}

function renderStats() {
  const done = course.labs.filter(lab => progress.has(lab.id)).length;
  const percentage = Math.round(done / course.labs.length * 100) || 0;
  $('#stats').innerHTML = [
    [course.modules.length, 'MÓDULOS'], [course.tracks.length, 'TRILHAS'], [`${progressData.earnedPoints || 0} XP`, 'EXPERIÊNCIA'], [`${percentage}%`, 'PROGRESSO GLOBAL']
  ].map(([value, label], index) => `<div class="stat"><strong${index === 3 ? ' id="statSolved"' : ''}>${value}</strong><span>${label}</span></div>`).join('');
}

function switchModule(module) {
  const presentation = moduleById(module);
  if (!presentation) return;
  activeModule = module;
  activeFilter = 'all';
  $$('.module-btn, .module-side').forEach(button => {
    const active = button.dataset.module === module;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $$('.chip[data-filter]').forEach(button => {
    const selected = button.dataset.filter === 'all';
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('#heroTag').textContent = presentation.hero.tag;
  $('#heroTitle').innerHTML = `${esc(presentation.hero.lead)}<br><em>${esc(presentation.hero.accent)}</em>`;
  $('#heroDescription').textContent = presentation.hero.description;
  $('#moduleCrumb').textContent = presentation.shortName;
  renderModuleDashboard(module);
  renderStats();
  renderTracks();
  renderLessons();
  renderLearning();
  renderMetrics();
  updateProgress();
}

function updateProgress() {
  const solvedCount = course.labs.filter(lab => progress.has(lab.id)).length;
  const percentage = Math.round(solvedCount / course.labs.length * 100) || 0;
  $('#sideProgress').style.width = `${percentage}%`;
  $('#sideSolved').textContent = solvedCount;
  $('#progressBar').setAttribute('aria-valuemax', String(course.labs.length));
  $('#progressBar').setAttribute('aria-valuenow', String(solvedCount));
  $('#progressBar').setAttribute('aria-valuetext', `${solvedCount} de ${course.labs.length} laboratórios concluídos`);
  if ($('#statSolved')) $('#statSolved').textContent = `${percentage}%`;
  $$('.lab-tile').forEach(tile => tile.classList.toggle('solved', progress.has(tile.dataset.id)));
}

function renderTracks(filter = activeFilter) {
  activeFilter = filter;
  const requestedModule = moduleById(filter) ? filter : activeModule;
  const moduleTracks = course.tracks.filter(track => track.module === requestedModule);
  const moduleLabs = course.labs.filter(lab => lab.module === requestedModule);
  const visibleLabs = moduleLabs.filter(lab => filter === 'open' ? !progress.has(lab.id) : filter === 'solved' ? progress.has(lab.id) : true);
  const scope = filter === 'open' ? `${visibleLabs.length} EM ABERTO EM ${moduleLabel(requestedModule)}`
    : filter === 'solved' ? `${visibleLabs.length} RESOLVIDOS EM ${moduleLabel(requestedModule)}`
      : `${moduleLabs.length} EM ${moduleLabel(requestedModule)}`;
  $('#labsTag').textContent = `${course.labs.length} LABS TOTAIS · ${scope}`;

  $('#trackList').innerHTML = moduleTracks.map(track => {
    const all = course.labs.filter(lab => lab.track === track.id);
    const labs = all.filter(lab => filter === 'open' ? !progress.has(lab.id) : filter === 'solved' ? progress.has(lab.id) : true);
    if (!labs.length) return '';
    const done = all.filter(lab => progress.has(lab.id)).length;
    const status = done === all.length ? 'CONCLUÍDO' : done ? 'EM PROGRESSO' : 'NÃO INICIADO';
    const safeColor = /^#[0-9a-f]{6}$/i.test(track.color) ? track.color : '#8cffc1';
    return `<article class="track-card">
      <div class="track-head"><div class="track-icon" style="color:${safeColor}">${esc(track.icon)}</div><div><h2>${esc(track.title)}</h2><p>${esc(track.summary)}</p></div><div class="track-score">${done}/${all.length}<br><span>${status}</span></div></div>
      <div class="lab-row">${labs.map(lab => `<button class="lab-tile ${progress.has(lab.id) ? 'solved' : ''}" data-id="${esc(lab.id)}" data-lab="${esc(lab.id)}"><small>0${lab.level} · ${esc(lab.difficulty.toUpperCase())}</small><strong>${esc(lab.title)}</strong><span>${progress.has(lab.id) ? '✓ CONCLUÍDO' : `${lab.points} XP · ABRIR →`}</span></button>`).join('')}</div>
    </article>`;
  }).join('') || '<p class="muted empty-state">Nenhum lab neste filtro.</p>';

  $$('.lab-tile').forEach(tile => { tile.onclick = () => openLab(course.labs.find(lab => lab.id === tile.dataset.lab)); });
}

function renderLessons() {
  const lessons = window.COURSE_LESSONS[activeModule] || [];
  $('#lessonIndex').innerHTML = lessons.map((lesson, index) => `<button class="${index === 0 ? 'active' : ''}" data-lesson="${index}">${String(index + 1).padStart(2, '0')} · ${esc(lesson[0])}</button>`).join('');
  $$('#lessonIndex button').forEach(button => { button.onclick = () => { currentLesson = Number(button.dataset.lesson); renderLesson(); }; });
  currentLesson = 0;
  renderLesson();
}

function renderLesson() {
  const lessons = window.COURSE_LESSONS[activeModule] || [];
  $('#lessonContent').innerHTML = lessons[currentLesson]?.[1] || '<p>Conteúdo indisponível.</p>';
  $$('#lessonIndex button').forEach((button, index) => button.classList.toggle('active', index === currentLesson));
}

async function renderOriginal(module = 'web-cache') {
  const sequence = ++originalRequestSequence;
  $$('.original-module').forEach(button => button.classList.toggle('active', button.dataset.originalModule === module));
  $('#searchOriginal').value = '';
  $('#searchCount').textContent = '';
  $('#originalText').textContent = 'Carregando referência…';
  try {
    const data = await apiJson(`/api/content/original?module=${encodeURIComponent(module)}`);
    if (sequence !== originalRequestSequence) return;
    $('#originalText').textContent = data.text;
    $('#searchOriginal').oninput = event => {
      const query = event.target.value.trim();
      if (!query) {
        $('#originalText').textContent = data.text;
        $('#searchCount').textContent = '';
        return;
      }
      const expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let count = 0;
      $('#originalText').innerHTML = esc(data.text).replace(expression, match => { count += 1; return `<mark>${match}</mark>`; });
      $('#searchCount').textContent = `${count} ocorrência(s)`;
    };
  } catch (error) {
    $('#originalText').textContent = error.message;
  }
}

function buildRawRequest(lab, includeVictim = false) {
  const target = new URL(lab.payload, location.origin);
  const request = lab.request || { method: 'GET', headers: {}, body: null };
  const headers = { Host: target.host, ...(request.headers || {}) };
  if (includeVictim && lab.victimCookie) headers.Cookie = lab.victimCookie;
  const headerLines = Object.entries(headers).map(([name, value]) => `${name}: ${value}`);
  const body = request.body == null ? '' : `\n\n${JSON.stringify(request.body, null, 2)}`;
  return `${request.method || 'GET'} ${target.pathname}${target.search} HTTP/1.1\n${headerLines.join('\n')}${body}`;
}

function openLab(lab) {
  if (!lab) return;
  currentLab = lab;
  const profile = getStored('bscp-forge-profile', 'standard');
  const victimButton = lab.victimCookie ? '<button class="outline" id="copyVictim">Copiar como vítima</button>' : '';
  const flow = lab.studyFlow.map((step, index) => `<li><span>${index + 1}</span>${esc(step)}</li>`).join('');
  const protocol = (lab.protocol || []).map(step => `<li>${esc(step)}</li>`).join('');
  const success = profile === 'expert' ? 'Perfil especialista: deduza a condição a partir do comportamento observável.' : esc(lab.successCondition || lab.evidence);
  $('#labDetail').innerHTML = `<div class="lab-detail">
    <span class="lab-meta">${esc(lab.track.toUpperCase())} · LAB 0${lab.level} · ${esc(lab.difficulty.toUpperCase())}</span>
    <h2 id="labDialogTitle">${esc(lab.title)}</h2><p id="labDialogObjective">${esc(lab.objective)}</p>
    <div class="scenario-card"><small>CENÁRIO LOCAL</small><p>${esc(lab.context)}</p><p><b>Atacante:</b> ${esc(lab.actors?.attacker || 'estudante')} · <b>Vítima:</b> ${esc(lab.actors?.victim || 'dados fictícios')}</p></div>
    <div class="mini-site-launch"><div><small>APLICAÇÃO DO LAB</small><h3>Pratique dentro de um mini site navegável</h3><p>Abra a aplicação fictícia, gere o tráfego pelo navegador e intercepte as requisições no Burp.</p></div><a class="primary lab-launch" href="${esc(lab.sitePath)}" target="_blank" rel="noopener">Abrir mini site ↗</a></div>
    <div class="success-condition"><small>CONDIÇÃO DE SUCESSO</small><p>${success}</p></div>
    ${profile === 'expert' ? '' : `<div class="lab-learning"><h3>Roteiro de investigação</h3><ol>${flow}</ol></div>`}
    <div class="instruction"><span class="eyebrow">REQUISIÇÃO INICIAL — EDITE NO BURP REPEATER</span><pre id="requestSample">${esc(buildRawRequest(lab))}</pre><div class="copy-row"><button class="primary" id="copyRequest">Copiar requisição</button>${victimButton}</div></div>
    ${protocol && profile !== 'expert' ? `<details class="protocol"><summary>Protocolo deste engine</summary><ol>${protocol}</ol></details>` : ''}
    <div class="hints" id="hintArea"><p class="muted">Carregando dicas liberadas…</p></div>
    <div class="evidence-card"><small>EVIDÊNCIA ESPERADA</small><p>${esc(lab.evidence)}</p><small>IMPACTO SIMULADO</small><p>${esc(lab.impact)}</p><small>PERGUNTA DE REFLEXÃO</small><p>${esc(lab.reflection)}</p><small>COMO CORRIGIR</small><p>${esc(lab.mitigation)}</p></div>
    <div class="lab-note"><label for="labNote"><small>ANOTAÇÕES DESTE LAB</small></label><textarea id="labNote" placeholder="Payload, hipótese, evidência e correção…"></textarea></div>
    <div class="lab-state"><span>Explore o mini site, confirme no Burp Repeater e consulte o progresso.</span><button class="outline" id="checkProgress">Verificar progresso</button></div>
    <div id="postSolution"></div>
  </div>`;
  const dialog = $('#labDialog');
  dialogReturnFocus = document.activeElement;
  dialog.showModal();
  $('#copyRequest').onclick = () => copy(buildRawRequest(lab));
  if ($('#copyVictim')) $('#copyVictim').onclick = () => copy(buildRawRequest(lab, true));
  const noteKey = `bscp-forge-lab-note:${lab.id}`;
  $('#labNote').value = getStored(noteKey, '');
  $('#labNote').oninput = event => setStored(noteKey, event.target.value);
  loadLabHints(lab, profile);
  $('#checkProgress').onclick = async () => {
    await refreshProgress();
    const solved = progress.has(lab.id);
    toast(solved ? 'Lab concluído — XP registrado.' : 'A condição comportamental ainda não foi atingida.');
    if (solved) await loadPostSolution(lab);
  };
  if (progress.has(lab.id)) loadPostSolution(lab);
}

async function loadLabHints(lab, profile) {
  const area = $('#hintArea');
  if (!area || currentLab?.id !== lab.id) return;
  if (profile === 'expert') { area.innerHTML = '<p class="muted">Perfil especialista: dicas desativadas.</p>'; return; }
  if (!lab.hintCount) { area.innerHTML = '<p class="muted">Modo CTF: investigue sem dicas.</p>'; return; }
  try {
    const data = await apiJson(`/api/labs/hints?lab=${encodeURIComponent(lab.id)}`);
    area.innerHTML = data.hints.map((hint, index) => `<div class="hint open"><button aria-expanded="true">Dica ${index + 1}</button><p>${esc(hint)}</p></div>`).join('')
      + (data.unlocked < data.total ? '<button class="outline" id="unlockHint">Desbloquear próxima dica</button>' : '<p class="muted">Todas as dicas deste nível foram liberadas.</p>');
    if ($('#unlockHint')) $('#unlockHint').onclick = async () => {
      await apiJson('/api/labs/hints/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ labId: lab.id }) });
      await loadLabHints(lab, profile);
    };
  } catch (error) { area.innerHTML = `<p class="muted">${esc(error.message)}</p>`; }
}

async function loadPostSolution(lab) {
  const container = $('#postSolution');
  if (!container || currentLab?.id !== lab.id) return;
  try {
    const result = await apiJson(`/api/labs/result?lab=${encodeURIComponent(lab.id)}`);
    const reportKey = `bscp-forge-report:${lab.id}`;
    let saved = {};
    try { saved = JSON.parse(getStored(reportKey, '{}')); } catch {}
    container.innerHTML = `<section class="post-solution"><span class="tag">PÓS-RESOLUÇÃO LIBERADO</span><h3>Explique antes de memorizar</h3><p>${esc(result.solution.explanation)}</p>
      <div class="solution-steps"><small>SEQUÊNCIA CORRETA</small>${result.solution.steps.map((step, index) => `<div><b>Etapa ${index + 1}</b><pre>${esc(step)}</pre></div>`).join('')}</div>
      <div class="interpretation-grid"><article><small>INTERPRETAÇÃO DO INTERMEDIÁRIO</small><p>${esc(result.solution.cacheInterpretation)}</p></article><article><small>INTERPRETAÇÃO DO COMPONENTE FINAL</small><p>${esc(result.solution.originInterpretation)}</p></article></div>
      <div class="report-builder"><h3>Relatório de exploração</h3><label>Causa<textarea data-report="cause">${esc(saved.cause || '')}</textarea></label><label>Evidência<textarea data-report="evidence">${esc(saved.evidence || '')}</textarea></label><label>Impacto<textarea data-report="impact">${esc(saved.impact || result.impact)}</textarea></label><label>Mitigação<textarea data-report="mitigation">${esc(saved.mitigation || result.mitigation)}</textarea></label><button class="primary" id="exportLabReport">Exportar relatório .md</button></div>
    </section>`;
    $$('[data-report]').forEach(field => field.oninput = () => saveLabReport(lab.id));
    $('#exportLabReport').onclick = () => exportLabReport(lab, result);
  } catch (error) { container.innerHTML = `<p class="muted">${esc(error.message)}</p>`; }
}

function saveLabReport(labId) {
  const data = Object.fromEntries($$('[data-report]').map(field => [field.dataset.report, field.value]));
  setStored(`bscp-forge-report:${labId}`, JSON.stringify(data));
}

function exportLabReport(lab, result) {
  saveLabReport(lab.id);
  let report = {};
  try { report = JSON.parse(getStored(`bscp-forge-report:${lab.id}`, '{}')); } catch {}
  const text = `# Relatório — ${lab.id}\n\n## Objetivo\n${lab.objective}\n\n## Causa\n${report.cause || 'Não preenchida.'}\n\n## Evidência\n${report.evidence || result.evidence}\n\n## Impacto\n${report.impact || result.impact}\n\n## Mitigação\n${report.mitigation || result.mitigation}\n`;
  downloadText(`${lab.id}-relatorio.md`, text, 'text/markdown');
}

async function refreshProgress() {
  const saved = await apiJson('/api/progress');
  progressData = saved;
  progress = new Set(saved.solved);
  renderTracks();
  updateProgress();
  renderStats();
  renderLearning();
  renderMetrics();
}

async function copy(value) {
  try { await navigator.clipboard.writeText(value); toast('Copiado para a área de transferência.'); }
  catch { toast('Selecione e copie a requisição manualmente.'); }
}

function getStored(key, fallback = '') {
  try { return localStorage.getItem(key) ?? fallback; }
  catch { return fallback; }
}

function setStored(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch { return false; }
}

function downloadText(filename, value, type = 'text/plain') {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([value], { type }));
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

function toast(text) {
  const element = $('#toast');
  element.textContent = text;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 2600);
}

function loadStudyProfile() {
  const select = $('#difficultyProfile');
  if (!select) return;
  select.value = getStored('bscp-forge-profile', 'standard');
  select.onchange = event => {
    setStored('bscp-forge-profile', event.target.value);
    toast(`Perfil ${event.target.options[event.target.selectedIndex].text} ativado.`);
  };
}

function checklistState(moduleId) {
  try { return JSON.parse(getStored(`bscp-forge-checklist:${moduleId}`, '{}')); }
  catch { return {}; }
}

function unresolvedQuizErrors(moduleId) {
  const latest = new Map();
  for (const item of progressData.quizHistory || []) {
    if (item.type !== 'quiz' || (moduleId && item.module !== moduleId)) continue;
    latest.set(item.questionId, item);
  }
  return [...latest.values()].filter(item => !item.correct);
}

function renderLearning() {
  const container = $('#learningContent');
  const module = moduleById(activeModule);
  if (!container || !module) return;
  const checked = checklistState(module.id);
  const incorrect = unresolvedQuizErrors(module.id);
  const questionById = Object.fromEntries(module.quiz.map(question => [question.id, question]));
  const finalDone = (progressData.finalChallenges || []).includes(module.id);
  container.innerHTML = `<div class="learning-grid">
    <section class="learning-panel"><span class="eyebrow">GLOSSÁRIO</span><h2>${esc(module.name)}</h2><dl class="glossary-grid">${module.glossary.map(([term, definition]) => `<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join('')}</dl></section>
    <section class="learning-panel"><span class="eyebrow">CHECKLIST INTERATIVO</span><h2>Revisão do processo</h2><div class="checklist">${module.checklist.map((item, index) => `<label><input type="checkbox" data-check="${index}" ${checked[index] ? 'checked' : ''}><span>${esc(item)}</span></label>`).join('')}</div></section>
  </div>
  <section class="learning-panel quiz-panel"><span class="eyebrow">QUIZ POR SEÇÃO</span><h2>Valide o raciocínio</h2><div class="quiz-grid">${module.quiz.map((question, questionIndex) => `<form class="quiz-card" data-question="${esc(question.id)}"><fieldset><legend>${questionIndex + 1}. ${esc(question.question)}</legend>${question.options.map((option, optionIndex) => `<label><input type="radio" name="answer-${esc(question.id)}" value="${optionIndex}"><span>${esc(option)}</span></label>`).join('')}</fieldset><button class="outline" type="submit">Responder</button><p class="quiz-feedback" role="status"></p></form>`).join('')}</div></section>
  <div class="learning-grid"><section class="learning-panel"><span class="eyebrow">REVISÃO DE ERROS</span><h2>${incorrect.length} questão(ões) pendente(s)</h2>${incorrect.length ? `<ul class="review-errors">${incorrect.map(item => `<li>${esc(questionById[item.questionId]?.question || item.questionId)}</li>`).join('')}</ul><p>Refaça essas questões acima; um acerto remove o item da revisão.</p>` : '<p>Nenhum erro pendente neste módulo.</p>'}</section>
  <section class="learning-panel final-challenge ${finalDone ? 'complete' : ''}"><span class="eyebrow">DESAFIO FINAL · 1000 XP</span><h2>${esc(module.finalChallenge.title)}</h2><p>${esc(module.finalChallenge.brief)}</p><ol>${module.finalChallenge.tasks.map(task => `<li>${esc(task)}</li>`).join('')}</ol><button class="primary" id="submitFinalChallenge">${finalDone ? 'Desafio concluído' : 'Validar cadeia completa'}</button><p id="finalFeedback" role="status"></p></section></div>`;

  $$('[data-check]').forEach(input => input.onchange = () => {
    const state = checklistState(module.id);
    state[input.dataset.check] = input.checked;
    setStored(`bscp-forge-checklist:${module.id}`, JSON.stringify(state));
  });
  $$('.quiz-card').forEach(form => form.onsubmit = async event => {
    event.preventDefault();
    const selected = form.querySelector('input:checked');
    const feedback = form.querySelector('.quiz-feedback');
    if (!selected) { feedback.textContent = 'Selecione uma resposta.'; return; }
    try {
      const result = await apiJson('/api/quiz/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: form.dataset.question, answer: Number(selected.value) }) });
      feedback.textContent = `${result.correct ? 'Correto.' : `Incorreto. Resposta: ${result.correctAnswer + 1}.`} ${result.explanation}`;
      feedback.className = `quiz-feedback ${result.correct ? 'correct' : 'incorrect'}`;
      await syncProgressSummary();
    } catch (error) { feedback.textContent = error.message; }
  });
  $('#submitFinalChallenge').onclick = async () => {
    if (finalDone) return;
    try {
      const result = await apiJson('/api/final-challenge/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: module.id }) });
      $('#finalFeedback').textContent = result.completed ? `Cadeia confirmada. ${result.bonus} XP registrados.` : result.message;
      await refreshProgress();
    } catch (error) { $('#finalFeedback').textContent = error.message; }
  };
}

function renderMetrics() {
  const container = $('#metricsContent');
  if (!container || !course.tracks.length) return;
  const incorrect = unresolvedQuizErrors().length;
  container.innerHTML = `<div class="metric-summary"><article><strong>${progressData.earnedPoints || 0}</strong><span>XP OBTIDO</span></article><article><strong>${progress.size}/${course.labs.length}</strong><span>LABS</span></article><article><strong>${(progressData.finalChallenges || []).length}/${course.modules.length}</strong><span>DESAFIOS FINAIS</span></article><article><strong>${incorrect}</strong><span>ERROS PARA REVISAR</span></article></div>
  <section class="learning-panel"><span class="eyebrow">MÉTRICAS POR TÉCNICA</span><div class="technique-metrics">${course.tracks.map(track => {
    const trackLabs = course.labs.filter(lab => lab.track === track.id);
    const done = trackLabs.filter(lab => progress.has(lab.id)).length;
    const attempts = trackLabs.reduce((sum, lab) => sum + Number(progressData.attempts?.[lab.id]?.count || 0), 0);
    const failures = trackLabs.reduce((sum, lab) => sum + Number(progressData.attempts?.[lab.id]?.failures || 0), 0);
    return `<article><h3>${esc(track.title)}</h3><p>${esc(moduleLabel(track.module))}</p><strong>${done}/${trackLabs.length}</strong><span>${attempts} tentativas · ${failures} observações sem conclusão</span><i style="width:${done / trackLabs.length * 100}%"></i></article>`;
  }).join('')}</div></section>
  <section class="learning-panel"><span class="eyebrow">BANCO DE QUESTÕES E MODO PROVA</span><h2>Simulado local</h2><p>${course.modules.reduce((sum, module) => sum + module.quiz.length, 0)} questões disponíveis nos ${course.modules.length} módulos atuais.</p><div class="copy-row"><button class="primary" id="generateExam">Gerar simulado</button><button class="outline" id="exportStudyReport">Exportar relatório geral</button></div><div id="examArea"></div></section>`;
  $('#generateExam').onclick = generateExam;
  $('#exportStudyReport').onclick = exportStudyReport;
}

function generateExam() {
  const bank = course.modules.flatMap(module => module.quiz.map(question => ({ ...question, module: module.id })));
  examQuestions = bank.map(question => ({ question, order: Math.random() })).sort((a, b) => a.order - b.order).slice(0, Math.min(10, bank.length)).map(item => item.question);
  const area = $('#examArea');
  area.innerHTML = `<form id="examForm" class="exam-form">${examQuestions.map((question, index) => `<fieldset data-exam-question="${esc(question.id)}"><legend>${index + 1}. ${esc(question.question)}</legend>${question.options.map((option, optionIndex) => `<label><input type="radio" name="exam-${esc(question.id)}" value="${optionIndex}"><span>${esc(option)}</span></label>`).join('')}</fieldset>`).join('')}<button class="primary" type="submit">Corrigir simulado</button><p id="examResult" role="status"></p></form>`;
  $('#examForm').onsubmit = submitExam;
}

async function submitExam(event) {
  event.preventDefault();
  const answers = examQuestions.map(question => ({ questionId: question.id, answer: Number($(`[name="exam-${question.id}"]:checked`)?.value) })).filter(item => Number.isInteger(item.answer));
  if (answers.length !== examQuestions.length) { $('#examResult').textContent = 'Responda todas as questões.'; return; }
  try {
    const result = await apiJson('/api/exam/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) });
    $('#examResult').textContent = `Resultado: ${result.correct}/${result.total}. As respostas foram adicionadas à revisão de erros.`;
    await syncProgressSummary();
  } catch (error) { $('#examResult').textContent = error.message; }
}

async function syncProgressSummary() {
  progressData = await apiJson('/api/progress');
  progress = new Set(progressData.solved);
  updateProgress();
  renderStats();
}

function exportStudyReport() {
  const lines = ['# BSCP//Forge — Relatório geral', '', `XP: ${progressData.earnedPoints || 0}/${progressData.availablePoints || 0}`, `Labs: ${progress.size}/${course.labs.length}`, `Desafios finais: ${(progressData.finalChallenges || []).length}/${course.modules.length}`, ''];
  for (const module of course.modules) {
    lines.push(`## ${module.name}`);
    for (const track of course.tracks.filter(item => item.module === module.id)) {
      const labs = course.labs.filter(lab => lab.track === track.id);
      lines.push(`- ${track.title}: ${labs.filter(lab => progress.has(lab.id)).length}/${labs.length}`);
    }
    lines.push('');
  }
  lines.push('## Caderno', '', $('#notebook')?.value || 'Sem anotações.');
  downloadText('bscp-forge-relatorio-geral.md', `${lines.join('\n')}\n`, 'text/markdown');
}

function loadNotes() {
  const key = 'bscp-forge-notes';
  let legacy = '';
  let notes = '';
  try {
    legacy = localStorage.getItem('cachelab-notes') || '';
    notes = localStorage.getItem(key) ?? legacy;
    if (legacy && !localStorage.getItem(key)) localStorage.setItem(key, legacy);
  } catch {
    $('#noteStatus').textContent = 'Armazenamento local indisponível';
  }
  $('#notebook').value = notes;
  $('#notebook').oninput = event => {
    try { localStorage.setItem(key, event.target.value); }
    catch { $('#noteStatus').textContent = 'Não foi possível salvar neste navegador'; return; }
    $('#noteStatus').textContent = 'Salvo agora';
    setTimeout(() => { $('#noteStatus').textContent = 'Salvo automaticamente'; }, 900);
  };
  $('#exportNotes').onclick = () => {
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([$('#notebook').value], { type: 'text/plain' }));
    anchor.download = 'bscp-forge-notas.txt';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };
}

$$('.nav-item[data-view]').forEach(button => {
  button.onclick = () => {
    show(button.dataset.view);
    if (button.dataset.view === 'original') renderOriginal(activeModule);
  };
});
$$('.jump').forEach(button => { button.onclick = () => show(button.dataset.target); });
$('.dialog-close').onclick = () => $('#labDialog').close();
$('#labDialog').addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  $('#labDialog').close();
});
$('#labDialog').addEventListener('close', () => {
  if (dialogReturnFocus instanceof HTMLElement) dialogReturnFocus.focus();
  dialogReturnFocus = null;
});
$('#resetCache').onclick = async () => {
  await apiJson('/api/labs/reset', { method: 'POST' });
  toast('Cache, sessões e estados efêmeros reiniciados.');
};
$('#resetProgress').onclick = async () => {
  if (!confirm(`Zerar todo o progresso dos ${course.labs.length} labs?`)) return;
  await apiJson('/api/progress/reset', { method: 'POST' });
  await refreshProgress();
  toast('Progresso zerado.');
};
$('#moduleMenuToggle').onclick = () => {
  const opened = $('#moduleSubmenu').classList.toggle('open');
  $('#moduleSubmenu').hidden = !opened;
  $('#moduleMenuToggle').classList.toggle('open', opened);
  $('#moduleMenuToggle').setAttribute('aria-expanded', String(opened));
};

$('#moduleSubmenu').addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  closeModuleMenu();
  $('#moduleMenuToggle').focus();
});

enableScopedHorizontalWheel($('#moduleFilters'));
boot();
