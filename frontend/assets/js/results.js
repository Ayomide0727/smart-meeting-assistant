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

/**
 * Render the meeting summary section
 * Handles the new backend response format
 */
function renderSummary(data) {
  // Handle new API response structure: data.data.summary
  const summaryData = data.data?.summary || data.summary || {};
  
  let html = '';
  
  // Meeting summary text
  if (summaryData.meetingSummary) {
    html += `<li><strong>📝 Overview:</strong> ${escapeHtml(summaryData.meetingSummary)}</li>`;
  }
  
  // Participants
  if (summaryData.participants?.length > 0) {
    html += `<li><strong>👥 Participants:</strong> ${escapeHtml(summaryData.participants.join(', '))}</li>`;
  }
  
  // Key Points
  if (summaryData.keyPoints?.length > 0) {
    html += `<li><strong>📌 Key Points:</strong><ul>`;
    summaryData.keyPoints.forEach(point => {
      html += `<li>${escapeHtml(point)}</li>`;
    });
    html += `</ul></li>`;
  }
  
  // Decisions
  if (summaryData.decisions?.length > 0) {
    html += `<li><strong>✅ Decisions Made:</strong><ul>`;
    summaryData.decisions.forEach(decision => {
      html += `<li>${escapeHtml(decision)}</li>`;
    });
    html += `</ul></li>`;
  }
  
  // Unresolved Issues
  if (summaryData.unresolvedIssues?.length > 0) {
    html += `<li><strong>⚠️ Unresolved Issues:</strong><ul>`;
    summaryData.unresolvedIssues.forEach(issue => {
      html += `<li style="color: var(--accent-orange);">${escapeHtml(issue)}</li>`;
    });
    html += `</ul></li>`;
  }
  
  // Risks
  if (summaryData.risks?.length > 0) {
    html += `<li><strong>🚨 Risks Identified:</strong><ul>`;
    summaryData.risks.forEach(risk => {
      html += `<li style="color: var(--accent-red, #ff6b6b);">${escapeHtml(risk)}</li>`;
    });
    html += `</ul></li>`;
  }
  
  // Topics
  if (summaryData.topics?.length > 0) {
    html += `<li><strong>🏷️ Topics:</strong> ${escapeHtml(summaryData.topics.join(', '))}</li>`;
  }
  
  // Fallback for old format or empty
  if (!html) {
    const items = pick(summaryData);
    html = items.length ? items.map(i => `<li>${escapeHtml(i)}</li>`).join('') : '<li>No summary available.</li>';
  }
  
  els.summary.innerHTML = html;
}

/**
 * Render the action items section
 * Handles the new backend response format with flagged items
 */
function renderActions(data) {
  // Handle new API response structure: data.data.actionItems
  const actionsData = data.data?.actionItems || data.actionItems || {};
  const actions = actionsData.actionItems || actionsData.actions || data.action_items || [];
  
  let html = '';
  
  // Show summary stats if available
  if (actionsData.summary) {
    const s = actionsData.summary;
    html += `<li class="stats" style="background: var(--bg-dark); padding: 8px; border-radius: 4px; margin-bottom: 8px;">
      📊 <strong>Total:</strong> ${s.totalTasks || 0} | 
      <span style="color: var(--accent-green, #4ade80);">✅ Assigned: ${s.assignedTasks || 0}</span> | 
      <span style="color: var(--accent-orange, #fb923c);">⚠️ Flagged: ${s.flaggedItems || 0}</span>
    </li>`;
  }
  
  if (Array.isArray(actions) && actions.length > 0) {
    actions.forEach(item => {
      if (typeof item === 'string') {
        html += `<li>${escapeHtml(item)}</li>`;
      } else {
        const task = item.task || item.title || item.name || 'Action item';
        const owner = item.owner || item.assignee || 'Unassigned';
        const deadline = item.deadline || item.due || 'No deadline';
        const priority = item.priority || 'medium';
        const flagged = item.flagged;
        
        const priorityColors = {
          high: 'var(--accent-red, #ff6b6b)',
          medium: 'var(--accent-orange, #fb923c)',
          low: 'var(--accent-green, #4ade80)'
        };
        
        const ownerStyle = owner === 'UNASSIGNED' || flagged 
          ? 'color: var(--accent-orange, #fb923c); font-weight: bold;' 
          : 'color: var(--accent-blue, #60a5fa);';
        
        html += `<li style="display: flex; flex-direction: column; gap: 4px; padding: 8px; background: var(--bg-dark); border-radius: 4px; margin-bottom: 6px; border-left: 3px solid ${priorityColors[priority]};">
          <span style="color:#f4f4f4; font-weight: 500;">${flagged ? '⚠️ ' : ''}${escapeHtml(task)}</span>
          <span style="font-size: 12px;">
            <span style="${ownerStyle}">👤 ${escapeHtml(owner)}</span> • 
            <span style="color: var(--text-dim);">📅 ${escapeHtml(deadline)}</span> • 
            <span style="color: ${priorityColors[priority]}; text-transform: uppercase; font-size: 10px;">${priority}</span>
          </span>
          ${item.flagReason ? `<span style="font-size: 11px; color: var(--accent-orange);">⚡ ${escapeHtml(item.flagReason)}</span>` : ''}
        </li>`;
      }
    });
  } else {
    html += '<li>No tasks found.</li>';
  }
  
  els.actions.innerHTML = html;
}

/**
 * Render the follow-up recommendations section
 * Handles the new backend response format with escalations and meeting suggestions
 */
function renderFollowups(data) {
  // Handle new API response structure: data.data.followUps
  const followUpData = data.data?.followUps || data.followUps || {};
  const followUpActions = followUpData.followUpActions || followUpData.followups || data.follow_up || [];
  const escalations = followUpData.escalations || [];
  const nextMeeting = followUpData.nextMeetingSuggestion || {};
  
  let html = '';
  
  // Escalations (high priority)
  if (escalations.length > 0) {
    html += `<li style="background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 4px; border-left: 3px solid var(--accent-red, #ef4444); margin-bottom: 8px;">
      <strong>🚨 Escalations Required:</strong><ul style="margin: 4px 0 0 16px;">`;
    escalations.forEach(esc => {
      html += `<li><strong>${escapeHtml(esc.issue)}</strong> → Escalate to: ${escapeHtml(esc.escalateTo)}${esc.reason ? ` (${escapeHtml(esc.reason)})` : ''}</li>`;
    });
    html += `</ul></li>`;
  }
  
  // Next Meeting Suggestion
  if (nextMeeting.recommended) {
    html += `<li style="background: rgba(59, 130, 246, 0.1); padding: 8px; border-radius: 4px; border-left: 3px solid var(--accent-blue, #3b82f6); margin-bottom: 8px;">
      <strong>📅 Next Meeting Suggested:</strong> ${escapeHtml(nextMeeting.suggestedTimeframe || 'TBD')}`;
    if (nextMeeting.agenda?.length > 0) {
      html += `<br><span style="font-size: 12px; color: var(--text-dim);">Agenda: ${escapeHtml(nextMeeting.agenda.join(', '))}</span>`;
    }
    if (nextMeeting.requiredAttendees?.length > 0) {
      html += `<br><span style="font-size: 12px; color: var(--text-dim);">Required: ${escapeHtml(nextMeeting.requiredAttendees.join(', '))}</span>`;
    }
    html += `</li>`;
  }
  
  // Follow-up Actions
  if (Array.isArray(followUpActions) && followUpActions.length > 0) {
    followUpActions.forEach(action => {
      if (typeof action === 'string') {
        html += `<li>${escapeHtml(action)}</li>`;
      } else {
        const urgencyColors = {
          high: 'var(--accent-red, #ef4444)',
          medium: 'var(--accent-orange, #fb923c)',
          low: 'var(--accent-green, #4ade80)'
        };
        const typeIcons = {
          meeting: '📅',
          email: '📧',
          escalation: '🚨',
          reminder: '⏰',
          review: '📋'
        };
        
        html += `<li style="padding: 6px; background: var(--bg-dark); border-radius: 4px; margin-bottom: 4px; border-left: 3px solid ${urgencyColors[action.urgency] || urgencyColors.medium};">
          <span>${typeIcons[action.type] || '📌'} ${escapeHtml(action.action)}</span>
          ${action.suggestedDate ? `<br><span style="font-size: 11px; color: var(--text-dim);">📆 ${escapeHtml(action.suggestedDate)}</span>` : ''}
          ${action.reason ? `<br><span style="font-size: 11px; color: var(--text-dim);">💡 ${escapeHtml(action.reason)}</span>` : ''}
        </li>`;
      }
    });
  } else if (!escalations.length && !nextMeeting.recommended) {
    html += '<li>No follow-ups available.</li>';
  }
  
  els.followups.innerHTML = html;
}

function renderRaw(data) {
  if (els.raw) {
    els.raw.textContent = JSON.stringify(data, null, 2);
  }
}

/**
 * Render metadata section if available
 */
/**
 * Render metadata section if available
 */
function renderMetadata(data) {
  const metadata = data.metadata || {};
  const processingTime = data.processingTime || '';
  const sessionId = data.sessionId || '';
  
  const metaContainer = document.getElementById('metadata') || els.raw;
  if (!metaContainer) return;

  if (Object.keys(metadata).length > 0 || processingTime) {
    const metaHtml = `
      <div style="font-size: 11px; color: var(--text-dim); padding: 8px; background: var(--bg-dark); border-radius: 4px; margin-bottom: 8px;">
        ${processingTime ? `⏱️ Processing: ${processingTime}` : ''} 
        ${metadata.participantCount ? `| 👥 ${metadata.participantCount} participants` : ''}
        ${metadata.actionItemCount ? `| ✅ ${metadata.actionItemCount} actions` : ''}
        ${metadata.followUpCount ? `| 🔄 ${metadata.followUpCount} follow-ups` : ''}
        ${metadata.hasEscalations ? '| 🚨 Has escalations' : ''}
        ${sessionId ? `<br>Session: ${sessionId}` : ''}
      </div>
    `;
    metaContainer.innerHTML = metaHtml;
  }
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
  if (log.length === 0) {
    els.qaLog.innerHTML = '<div style="color: var(--text-dim); font-size: 12px; padding: 8px;">💬 Ask questions about the meeting. Try: "What decisions were made?" or "Who is responsible for what?"</div>';
    return;
  }
  els.qaLog.innerHTML = log.map(m => {
    if (m.role === 'user') {
      return `<div class="bubble user"><b>You:</b> ${escapeHtml(m.text)}</div>`;
    } else {
      let html = `<div class="bubble ai"><b>AI:</b> ${escapeHtml(m.text)}`;
      if (m.confidence) {
        const confidenceColors = { high: '#4ade80', medium: '#fb923c', low: '#ef4444' };
        html += `<br><span style="font-size: 10px; color: ${confidenceColors[m.confidence]};">Confidence: ${m.confidence}</span>`;
      }
      if (m.relatedTopics?.length > 0) {
        html += `<br><span style="font-size: 10px; color: var(--text-dim);">Related: ${escapeHtml(m.relatedTopics.join(', '))}</span>`;
      }
      html += `</div>`;
      return html;
    }
  }).join('');
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
    const data = await askQuestion(q);
    const answer = data.answer || data.text || data.response || 'No answer provided.';
    const newLog = loadQALog();
    newLog.push({ 
      role: 'ai', 
      text: answer,
      confidence: data.confidence,
      relatedTopics: data.relatedTopics
    });
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
    renderMetadata(data);
    renderRaw(data);
  } else {
    els.summary.innerHTML = '<li>No results found. <a href="input.html" style="color: var(--accent-blue);">Process a transcript first</a>.</li>';
  }
  renderQALog();

  els.askBtn.addEventListener('click', onAsk);
  els.question.addEventListener('keydown', (e) => { if (e.key === 'Enter') onAsk(); });
}

document.addEventListener('DOMContentLoaded', init);
