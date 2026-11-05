// Audio extracted from the downloaded ptoszek.pl index.js: speak/startTheramin.
// One graph per session; its waveform, pitch and mouse mapping follow the original.
import { pick, phrases } from '../config.js';
export function startAudio(session, host = window) {
  const synth = host.speechSynthesis;
  function speak(phrase = pick(phrases)) {
    if (!synth || !host.SpeechSynthesisUtterance) return;
    synth.cancel();
    synth.speak(new host.SpeechSynthesisUtterance(phrase));
  }
  let audioContext, oscillatorNode;
  const Audio = host.AudioContext || host.webkitAudioContext;
  if (Audio) {
    try {
      audioContext = new Audio();
      oscillatorNode = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const pitchBase = 50;
      const pitchRange = 4000;
      const wave = audioContext.createPeriodicWave(
        Array(10).fill(0).map((v, i) => Math.cos(i)),
        Array(10).fill(0).map((v, i) => Math.sin(i))
      );
      oscillatorNode.setPeriodicWave(wave);
      oscillatorNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillatorNode.start(0);
      audioContext.resume().catch(() => {});
      session.on(host.document.body, 'mousemove', event => {
        const { clientX, clientY } = event;
        const { clientWidth, clientHeight } = host.document.body;
        if (!clientWidth || !clientHeight) return;
        const pitch = (clientX - clientWidth / 2) / clientWidth;
        const volume = (clientY - clientHeight / 2) / clientHeight;
        oscillatorNode.frequency.value = pitchBase + pitch * pitchRange;
        gainNode.gain.value = volume * 3;
      });
    } catch {
      if (audioContext && audioContext.state !== 'closed') audioContext.close().catch(() => {});
      audioContext = null;
    }
  }
  speak('To był błąd');
  session.cleanup(() => {
    synth?.cancel();
    if (audioContext) {
      oscillatorNode?.stop();
      if (audioContext.state !== 'closed') audioContext.close().catch(() => {});
    }
  });
  return { speak, resume() { if (audioContext?.state !== 'closed') audioContext?.resume().catch(() => {}); } };
}
