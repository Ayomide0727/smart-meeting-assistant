import { processTranscript, checkHealth } from './api.js';

const els = {
  transcript: null,
  processBtn: null,
  status: null,
  error: null,
  connectionStatus: null,
  attachmentArea: null,
  attachmentName: null,
  attachmentSize: null,
  removeAttachment: null,
};

// Store the uploaded file content separately
let uploadedFileContent = null;
let uploadedFileName = null;

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
  
  // Use uploaded file content if available, otherwise use textarea
  const text = uploadedFileContent || els.transcript.value.trim();
  if (!text) {
    showError('Please paste a transcript or upload a document.');
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
      
      // Store content and show as attachment
      uploadedFileContent = text;
      uploadedFileName = file.name;
      showAttachment(file);
      showSuccess(`PDF attached! Click "Process Transcript" to analyze it.`);
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
    // Store content and show as attachment
    uploadedFileContent = content;
    uploadedFileName = file.name;
    showAttachment(file);
    showSuccess(`Document attached! Click "Process Transcript" to analyze it.`);
    els.error.style.color = 'var(--accent-blue, #60a5fa)';
  };

  reader.onerror = function() {
    showError('Failed to read the file. Please try again.');
  };

  reader.readAsText(file);
}

function showAttachment(file) {
  els.attachmentArea.style.display = 'block';
  els.attachmentName.textContent = file.name;
  els.attachmentSize.textContent = formatFileSize(file.size);
  // Clear the textarea placeholder to indicate file is being used
  els.transcript.placeholder = 'Document attached above. You can also add additional notes here...';
}

function removeAttachment() {
  uploadedFileContent = null;
  uploadedFileName = null;
  els.attachmentArea.style.display = 'none';
  els.attachmentName.textContent = '';
  els.attachmentSize.textContent = '';
  els.transcript.placeholder = 'Paste your meeting transcript here... (Tip: Press Ctrl+Enter to process)';
  // Reset file input
  const fileInput = qs('fileInput');
  if (fileInput) fileInput.value = '';
  showError('');
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function init() {
  els.transcript = qs('transcript');
  els.processBtn = qs('processBtn');
  els.status = qs('status');
  els.error = qs('error');
  els.connectionStatus = qs('connectionStatus');
  els.attachmentArea = qs('attachmentArea');
  els.attachmentName = qs('attachmentName');
  els.attachmentSize = qs('attachmentSize');
  els.removeAttachment = qs('removeAttachment');

  // Check backend connection on load
  updateConnectionStatus();
  
  // Remove attachment button
  if (els.removeAttachment) {
    els.removeAttachment.addEventListener('click', removeAttachment);
  }
  
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
