// Utility to call backend Gemini summarization route
export async function summarizeTranscript(transcript, speaker = '') {
  try {
    const response = await fetch('/summarize-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, speaker })
    });
    if (!response.ok) throw new Error('Failed to summarize');
    const data = await response.json();
    console.log('Gemini summary API response:', data);
    return data.summary || data.per_speaker || data.overall_summary || [];
  } catch (err) {
    console.error('Summarization error:', err);
    return [];
  }
} 