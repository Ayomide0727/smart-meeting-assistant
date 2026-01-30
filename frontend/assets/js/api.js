export async function processTranscript(transcript) {
  const res = await fetch('/process-transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed with status ${res.status}`);
  }
  return res.json();
}

export async function askQuestion(question, context = {}) {
  const res = await fetch('/ask-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, ...context })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed with status ${res.status}`);
  }
  return res.json();
}
