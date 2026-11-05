// Original speech and mouse-controlled theremin, initialized once per session.
import { pick, phrases } from '../config.js';
export function startAudio(session) {
  const synth = window.speechSynthesis;
  function speak(text = pick(phrases)) {
    if (!synth || !window.SpeechSynthesisUtterance) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text); utterance.volume = 0.5; synth.speak(utterance);
  }
  speak('To był błąd');
  const Audio = window.AudioContext || window.webkitAudioContext;
  let audio, oscillator;
  if (Audio && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try {
      audio = new Audio(); oscillator = audio.createOscillator(); const gain = audio.createGain();
      oscillator.type = 'sawtooth'; oscillator.frequency.value = 100; gain.gain.value = 0.025;
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start();
      audio.resume().catch(() => {});
      session.on(window, 'pointermove', e => {
        oscillator.frequency.value = 50 + (e.clientX / Math.max(1, innerWidth)) * 1500;
        gain.gain.value = (e.clientY / Math.max(1, innerHeight)) * 0.04;
      });
    } catch { audio?.close().catch(() => {}); audio = null; }
  }
  session.cleanup(() => { synth?.cancel(); if (audio) { oscillator?.stop(); audio.close().catch(() => {}); } });
  return { speak, resume() { audio?.resume().catch(() => {}); } };
}
