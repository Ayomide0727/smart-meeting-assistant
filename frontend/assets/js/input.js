import { processTranscript, checkHealth } from './api.js';

const els = {
  transcript: null,
  processBtn: null,
  status: null,
  error: null,
  connectionStatus: null,
};

function qs(id) { return document.getElementById(id); }

function setLoading(isLoading) {
  els.status.style.display = isLoading ? 'inline-flex' : 'none';
  els.processBtn.disabled = isLoading;
  if (isLoading) {
    els.processBtn.textContent = 'Processing...';
  } else {
    els.processBtn.textContent = 'Process Transcript';
  }
}

function showError(message) {
  els.error.textContent = message;
  els.error.style.display = message ? 'block' : 'none';
}

function showSuccess(message) {
  els.error.textContent = message;
  els.error.style.display = message ? 'block' : 'none';
  els.error.style.color = 'var(--accent-green, #4ade80)';
}

async function updateConnectionStatus() {
  if (!els.connectionStatus) return;
  
  els.connectionStatus.innerHTML = '<span class="spinner"></span> Checking backend...';
  els.connectionStatus.style.color = 'var(--text-dim)';
  
  try {
    const isHealthy = await checkHealth();
    if (isHealthy) {
      els.connectionStatus.innerHTML = '✅ Backend connected';
      els.connectionStatus.style.color = 'var(--accent-green, #4ade80)';
      els.processBtn.disabled = false;
    } else {
      els.connectionStatus.innerHTML = '❌ Backend offline';
      els.connectionStatus.style.color = 'var(--accent-red, #ef4444)';
      showError('Backend is not available. Please start the server with: npm start');
    }
  } catch {
    els.connectionStatus.innerHTML = '❌ Cannot connect to backend';
    els.connectionStatus.style.color = 'var(--accent-red, #ef4444)';
    showError('Cannot connect to backend at http://localhost:5000. Please ensure the server is running.');
  }
}

async function onProcess() {
  showError('');
  els.error.style.color = ''; // Reset color
  
  const text = els.transcript.value.trim();
  if (!text) {
    showError('Transcript cannot be empty.');
    return;
  }
  
  // Validate minimum length
  if (text.length < 50) {
    showError('Transcript seems too short. Please provide a more detailed meeting transcript.');
    return;
  }
  
  setLoading(true);
  
  try {
    // Clear previous session data
    sessionStorage.removeItem('meetingResults');
    sessionStorage.removeItem('qaLog');
    sessionStorage.removeItem('sessionId');
    
    const data = await processTranscript(text);
    
    // Store results for the results page
    sessionStorage.setItem('meetingResults', JSON.stringify(data));
    
    // Show success briefly before redirect
    showSuccess('✅ Processing complete! Redirecting to results...');
    
    // Redirect to results page
    setTimeout(() => {
      window.location.href = 'results.html';
    }, 500);
    
  } catch (e) {
    console.error('Processing error:', e);
    
    // Provide helpful error messages
    let errorMessage = e.message || 'Failed to process transcript.';
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      errorMessage = 'Cannot connect to the backend server. Please ensure it is running on http://localhost:5000';
    } else if (errorMessage.includes('watsonx') || errorMessage.includes('authenticate')) {
      errorMessage = 'AI service authentication failed. Please check your watsonx.ai credentials in the .env file.';
    }
    
    showError(errorMessage);
  } finally {
    setLoading(false);
  }
}

function loadSampleTranscript() {
  const sampleTranscript = `Meeting: Weekly Project Sync
Date: January 30, 2026
Participants: John (Project Manager), Sarah (Designer), David (Developer), Mike (QA Lead - absent)

John: Good morning everyone. Let's start with the project timeline update. David, where are we with the backend?

David: The API endpoints are 80% complete. I'll have the backend ready by Friday. The authentication module took longer than expected, but we're back on track.

Sarah: That's great to hear. I can have the UI mockups done by Wednesday. I've already completed the homepage and dashboard designs.

John: Excellent work, Sarah. David, once Sarah's mockups are ready, can you coordinate with her on the frontend integration?

David: Absolutely. I'll block out Thursday for integration work with Sarah.

John: What about the testing plan? Mike isn't here today - he's out sick.

Sarah: I think we need to assign someone to cover Mike's testing tasks until he's back.

John: Good point. David, can you handle basic smoke testing? We'll need Mike to do the comprehensive QA when he returns.

David: I can do basic testing, but someone should follow up with Mike about the full test plan.

John: Agreed. Now, about the budget allocation for the cloud infrastructure - we still need approval from management. This is blocking our deployment timeline.

Sarah: Should we escalate this to the director? We've been waiting for two weeks.

John: Yes, let's escalate. I'll send an email to Director Chen today. We need a decision by next Wednesday at the latest.

David: One more thing - I noticed some security vulnerabilities in the third-party library we're using. We should schedule a security review.

John: That's concerning. Can you document the specific vulnerabilities? We'll need to address this before launch.

David: I'll create a security assessment document by Monday.

John: Perfect. Let's schedule a follow-up meeting next Tuesday to review progress on all these items. Any other concerns?

Sarah: Just want to confirm - the design system documentation is still on track for next Friday.

John: Noted. Alright, let's wrap up. Remember: David on backend by Friday, Sarah on mockups by Wednesday, security assessment by Monday, and I'll handle the budget escalation today.

Meeting ended at 10:45 AM.`;

  els.transcript.value = sampleTranscript;
  showSuccess('Sample transcript loaded! Click "Process Transcript" to analyze it.');
  els.error.style.color = 'var(--accent-blue, #60a5fa)';
}

function init() {
  els.transcript = qs('transcript');
  els.processBtn = qs('processBtn');
  els.status = qs('status');
  els.error = qs('error');
  els.connectionStatus = qs('connectionStatus');

  // Check backend connection on load
  updateConnectionStatus();
  
  // Process button click
  els.processBtn.addEventListener('click', onProcess);
  
  // Keyboard shortcut: Ctrl+Enter to process
  els.transcript.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onProcess();
    }
  });
  
  // Add sample button if it exists
  const sampleBtn = qs('sampleBtn');
  if (sampleBtn) {
    sampleBtn.addEventListener('click', loadSampleTranscript);
  }
  
  // Periodically check connection status
  setInterval(updateConnectionStatus, 30000); // Check every 30 seconds
}

document.addEventListener('DOMContentLoaded', init);
