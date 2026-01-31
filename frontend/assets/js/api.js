// API Configuration - Uses relative path for port-agnostic operation
const API_BASE_URL = '/api';

/**
 * Process a meeting transcript through all AI agents
 * @param {string} transcript - The meeting transcript text
 * @returns {Promise<object>} - Processed meeting data with summary, actions, and follow-ups
 */
export async function processTranscript(transcript) {
  const res = await fetch(`${API_BASE_URL}/meeting/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed with status ${res.status}`);
  }
  
  const result = await res.json();
  
  if (!result.success) {
    throw new Error(result.message || result.error || 'Processing failed');
  }
  
  // Store session ID for Q&A context
  if (result.sessionId) {
    sessionStorage.setItem('sessionId', result.sessionId);
  }
  
  // Store the raw transcript for Q&A
  sessionStorage.setItem('transcript', transcript);
  
  return result;
}

/**
 * Ask a question about the meeting
 * @param {string} question - The question to ask
 * @param {object} context - Optional context (sessionId, transcript)
 * @returns {Promise<object>} - Answer data with confidence and context
 */
export async function askQuestion(question, context = {}) {
  // Get stored transcript and sessionId
  const transcript = context.transcript || sessionStorage.getItem('transcript');
  const sessionId = context.sessionId || sessionStorage.getItem('sessionId');
  
  if (!transcript) {
    throw new Error('No transcript available. Please process a transcript first.');
  }
  
  const res = await fetch(`${API_BASE_URL}/meeting/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      transcript, 
      question,
      sessionId 
    })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed with status ${res.status}`);
  }
  
  const result = await res.json();
  
  if (!result.success) {
    throw new Error(result.message || result.error || 'Q&A failed');
  }
  
  return result.data;
}

/**
 * Get only the meeting summary
 * @param {string} transcript - The meeting transcript text
 * @returns {Promise<object>} - Summary data
 */
export async function getSummary(transcript) {
  const res = await fetch(`${API_BASE_URL}/meeting/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed with status ${res.status}`);
  }
  
  return res.json();
}

/**
 * Get only the action items
 * @param {string} transcript - The meeting transcript text
 * @returns {Promise<object>} - Action items data
 */
export async function getActionItems(transcript) {
  const res = await fetch(`${API_BASE_URL}/meeting/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed with status ${res.status}`);
  }
  
  return res.json();
}

/**
 * Get only the follow-up suggestions
 * @param {string} transcript - The meeting transcript text
 * @returns {Promise<object>} - Follow-up data
 */
export async function getFollowUps(transcript) {
  const res = await fetch(`${API_BASE_URL}/meeting/followups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed with status ${res.status}`);
  }
  
  return res.json();
}

/**
 * Check if the backend is available
 * @returns {Promise<boolean>} - True if backend is healthy
 */
export async function checkHealth() {
  try {
    const res = await fetch('/health');
    const data = await res.json();
    return data.status === 'OK';
  } catch {
    return false;
  }
}
