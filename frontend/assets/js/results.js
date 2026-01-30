import { askQuestion } from './api.js';

const els = {
  summary: null,
  actions: null,
  followups: null,
  raw: null,
  qaLog: null,
  question: null,
  askBtn: null,
  qaStatus: null,
  qaError: null,
};

function qs(id) { return document.getElementById(id); }

function getResults() {
  const raw = sessionStorage.getItem('meetingResults');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function pick(arrLike) {
  if (!arrLike) return [];
  if (Array.isArray(arrLike)) return arrLike;
  if (typeof arrLike === 'string') return arrLike.split(/\n|\r/).map(s => s.trim()).filter(Boolean);
  return [];
}

function renderSummary(data) {
  const summary = data.summary || data.summary_points || data.overview || [];
  const items = pick(summary);
  els.summary.innerHTML = items.length ? items.map(i => `<li>${escapeHtml(i)}</li>`).join('') : '<li>No summary available.</li>';
}

function renderActions(data) {
  const actions = data.action_items || data.actions || [];
  let items = '';
  if (Array.isArray(actions)) {
    items = actions.map(it => {
      if (typeof it === 'string') return `<li>${escapeHtml(it)}</li>`;
      const task = it.task || it.title || it.name || 'Action item';
      const owner = it.owner || it.assignee || 'Owner not specified';
      const deadline = it.deadline || it.due || '';
      const meta = [owner, deadline].filter(Boolean).join(' • ');
      return `<li><span style="color:#f4f4f4;">${escapeHtml(task)}</span><span style="margin-left:auto; color:var(--text-dim);">${escapeHtml(meta)}</span></li>`;
    }).join('');
  }
  els.actions.innerHTML = items || '<li>No tasks found.</li>';
}

function renderFollowups(data) {
  const follow = data.followups || data.follow_up || data.recommendations || [];
  const items = pick(follow);
  els.followups.innerHTML = items.length ? items.map(i => `<li>${escapeHtml(i)}</li>`).join('') : '<li>No follow-ups available.</li>';
}

function renderRaw(data) {
  els.raw.textContent = JSON.stringify(data, null, 2);
}

function escapeHtml(s) {
  return (s || '').toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function loadQALog() {
  const raw = sessionStorage.getItem('qaLog');
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function saveQALog(log) {
  sessionStorage.setItem('qaLog', JSON.stringify(log));
}

function renderQALog() {
  const log = loadQALog();
  els.qaLog.innerHTML = log.map(m => `<div class="bubble ${m.role}"><b>${m.role === 'user' ? 'You' : 'AI'}:</b> ${escapeHtml(m.text)}</div>`).join('');
  els.qaLog.scrollTop = els.qaLog.scrollHeight;
}

function setLoading(isLoading) {
  els.qaStatus.style.display = isLoading ? 'inline-flex' : 'none';
  els.askBtn.disabled = isLoading;
}

function showError(message) {
  els.qaError.textContent = message;
  els.qaError.style.display = message ? 'block' : 'none';
}

async function onAsk() {
  showError('');
  const q = els.question.value.trim();
  if (!q) return;
  const log = loadQALog();
  log.push({ role: 'user', text: q });
  saveQALog(log);
  renderQALog();
  els.question.value = '';

  setLoading(true);
  try {
    const ctx = {}; // optionally pass ids from results if available
    const data = await askQuestion(q, ctx);
    const answer = data.answer || data.text || data.response || 'No answer provided.';
    const newLog = loadQALog();
    newLog.push({ role: 'ai', text: answer });
    saveQALog(newLog);
    renderQALog();
  } catch (e) {
    showError(e.message || 'Failed to get an answer.');
  } finally {
    setLoading(false);
  }
}

function init() {
  els.summary = qs('summary');
  els.actions = qs('actions');
  els.followups = qs('followups');
  els.raw = qs('raw');
  els.qaLog = qs('qaLog');
  els.question = qs('question');
  els.askBtn = qs('askBtn');
  els.qaStatus = qs('qaStatus');
  els.qaError = qs('qaError');

  const data = getResults();
  if (data) {
    renderSummary(data);
    renderActions(data);
    renderFollowups(data);
    renderRaw(data);
  } else {
    els.summary.innerHTML = '<li>No results found. Process a transcript first.</li>';
  }
  renderQALog();

  els.askBtn.addEventListener('click', onAsk);
  els.question.addEventListener('keydown', (e) => { if (e.key === 'Enter') onAsk(); });
}

document.addEventListener('DOMContentLoaded', init);
