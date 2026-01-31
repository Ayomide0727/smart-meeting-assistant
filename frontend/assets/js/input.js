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

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  
  // Set worker source for pdf.js
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const validExtensions = ['.txt', '.md', '.doc', '.docx', '.pdf'];
  const fileName = file.name.toLowerCase();
  const isValidType = validExtensions.some(ext => fileName.endsWith(ext));

  if (!isValidType) {
    showError('Please upload a valid document file (.txt, .md, .doc, .docx, or .pdf)');
    return;
  }

  // Handle PDF files with pdf.js
  if (fileName.endsWith('.pdf')) {
    try {
      showSuccess('Reading PDF file...');
      els.error.style.color = 'var(--accent-blue, #60a5fa)';
      
      const text = await extractPdfText(file);
      
      if (!text || text.trim().length === 0) {
        showError('Could not extract text from PDF. The file may be scanned or image-based.');
        return;
      }
      
      els.transcript.value = text;
      showSuccess(`PDF "${file.name}" loaded successfully! Click "Process Transcript" to analyze it.`);
      els.error.style.color = 'var(--accent-blue, #60a5fa)';
    } catch (err) {
      console.error('PDF parsing error:', err);
      showError('Failed to read PDF file. Please ensure it is a valid PDF document.');
    }
    return;
  }

  // For text-based files (.txt, .md, .doc, .docx)
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const content = e.target.result;
    els.transcript.value = content;
    showSuccess(`Document "${file.name}" loaded successfully! Click "Process Transcript" to analyze it.`);
    els.error.style.color = 'var(--accent-blue, #60a5fa)';
  };

  reader.onerror = function() {
    showError('Failed to read the file. Please try again.');
  };

  reader.readAsText(file);
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
  
  // Add upload button functionality
  const uploadBtn = qs('uploadBtn');
  const fileInput = qs('fileInput');
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
  }
  
  // Periodically check connection status
  setInterval(updateConnectionStatus, 30000); // Check every 30 seconds
}

document.addEventListener('DOMContentLoaded', init);
