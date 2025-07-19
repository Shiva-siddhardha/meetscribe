// Deepgram real-time STT utility
// Usage: deepgramSTT(apiKey, onResult)
// onResult(text, isFinal) is called for each transcript

let dgInstance = null;

const deepgramSTT = async (apiKey, onResult) => {
  if (dgInstance) dgInstance.stop();

  // Open Deepgram WebSocket with encoding and sample rate specified
  const ws = new WebSocket(
    `wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true&encoding=linear16&sample_rate=48000`,
    ["token", apiKey]
  );

  let audioCtx, source, processor, stream;

  ws.onopen = async () => {
    // Start microphone
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    source = audioCtx.createMediaStreamSource(stream);
    processor = audioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioCtx.destination);

    processor.onaudioprocess = (e) => {
      if (ws.readyState === 1) {
        const input = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to 16-bit PCM
        const pcm = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          let s = Math.max(-1, Math.min(1, input[i]));
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        ws.send(pcm.buffer);
      }
    };
  };

  ws.onmessage = (msg) => {
    console.log('Deepgram raw message:', msg.data);
    const data = JSON.parse(msg.data);
    if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
      const alt = data.channel.alternatives[0];
      if (alt.transcript && alt.transcript.length > 0) {
        onResult(alt.transcript, data.is_final);
      }
    }
  };

  ws.onerror = (err) => {
    console.error('Deepgram WebSocket error:', err);
  };

  ws.onclose = (e) => {
    console.warn('Deepgram WebSocket closed:', e);
    if (processor) processor.disconnect();
    if (source) source.disconnect();
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
  };

  dgInstance = {
    stop: () => {
      if (ws.readyState === 1) ws.close();
      if (processor) processor.disconnect();
      if (source) source.disconnect();
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    }
  };
  return dgInstance;
};

export default deepgramSTT; 