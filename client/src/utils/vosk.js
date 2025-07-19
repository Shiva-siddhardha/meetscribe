// vosk.js utility for in-browser STT
// You must host the Vosk model files in public/model or use a CDN

let recognizerInstance = null;

const voskSTT = async (onResult) => {
  if (recognizerInstance) recognizerInstance.stop();
  // Dynamically import Vosk
  const vosk = await import('vosk-browser');
  const model = new vosk.Model('model'); // assumes /public/model
  const recognizer = new vosk.Recognizer({ model, sampleRate: 48000 });

  // Start microphone
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);
  const processor = audioCtx.createScriptProcessor(4096, 1, 1);

  source.connect(processor);
  processor.connect(audioCtx.destination);

  processor.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    recognizer.acceptWaveform(input);
    const result = recognizer.result();
    if (result && result.text) {
      onResult(result.text);
    }
  };

  recognizerInstance = {
    stop: () => {
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach(track => track.stop());
      recognizer.free();
      model.free();
      audioCtx.close();
    }
  };
  return recognizerInstance;
};

export default voskSTT; 