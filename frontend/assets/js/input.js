import { processTranscript } from './api.js';

const els = {
  transcript: null,
  processBtn: null,
  audioInput: null,
  status: null,
  error: null,
};

function qs(id) { return document.getElementById(id); }

function setLoading(isLoading) {
  els.status.style.display = isLoading ? 'inline-flex' : 'none';
  els.processBtn.disabled = isLoading;
}

function showError(message) {
  els.error.textContent = message;
  els.error.style.display = message ? 'block' : 'none';
}

async function onProcess() {
  showError('');
  const text = els.transcript.value.trim();
  if (!text) {
    showError('Transcript cannot be empty.');
    return;
  }
  setLoading(true);
  try {
    const data = await processTranscript(text);
    sessionStorage.setItem('meetingResults', JSON.stringify(data));
    window.location.href = 'results.html';
  } catch (e) {
    showError(e.message || 'Failed to process transcript.');
  } finally {
    setLoading(false);
  }
}

function init() {
  els.transcript = qs('transcript');
  els.processBtn = qs('processBtn');
  els.audioInput = qs('audioInput');
  els.status = qs('status');
  els.error = qs('error');

  els.processBtn.addEventListener('click', onProcess);
  els.audioInput.addEventListener('change', () => {
    showError('Audio upload is a placeholder. No backend processing wired.');
  });
}

document.addEventListener('DOMContentLoaded', init);
