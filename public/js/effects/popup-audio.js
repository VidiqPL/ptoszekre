// Play popup sound in the already-activated parent document, keeping it in sync.
import { videos } from '../config.js';
export function createPopupAudio(session, doc = document) {
  const entries = new Map();
  const base = new URL(doc.baseURI);
  function release(win) {
    const entry = entries.get(win);
    if (!entry) return;
    entry.controller.abort();
    entry.audio.pause();
    entry.audio.removeAttribute('src');
    entry.audio.load();
    entry.audio.remove();
    entries.delete(win);
  }
  function trackUrl(video) {
    const raw = video.currentSrc || video.src;
    if (!raw) return null;
    const url = new URL(raw, base);
    if (url.origin !== base.origin || !videos.some(name => url.pathname === '/media/videos/' + name)) return null;
    return url.href;
  }
  function sync(entry) {
    try {
      if (entry.win.closed) { release(entry.win); return; }
      const src = trackUrl(entry.video);
      if (!src) { entry.audio.pause(); return; }
      if (src !== entry.src) {
        entry.generation++;
        entry.pending = false; entry.blocked = false; entry.failed = false;
        entry.audio.pause(); entry.audio.src = src; entry.src = src;
      }
      entry.audio.loop = entry.video.loop;
      entry.audio.playbackRate = entry.video.playbackRate;
      if (entry.video.paused || entry.video.ended || entry.video.readyState < 2) { entry.audio.pause(); return; }
      if (entry.audio.readyState >= 1 && Math.abs(entry.audio.currentTime - entry.video.currentTime) > 0.3) {
        entry.audio.currentTime = entry.video.currentTime;
      }
      if (entry.audio.paused && !entry.pending && !entry.blocked && !entry.failed) {
        const generation = entry.generation;
        entry.pending = true;
        entry.audio.play()?.then(() => {
          if (entries.get(entry.win) !== entry || generation !== entry.generation) return;
          entry.pending = false; entry.report('');
        }).catch(error => {
          if (entries.get(entry.win) !== entry || generation !== entry.generation) return;
          entry.pending = false;
          if (error?.name === 'AbortError') return;
          entry.blocked = error?.name === 'NotAllowedError';
          entry.failed = !entry.blocked;
          entry.report(entry.blocked ? 'Przeglądarka zablokowała dźwięk tego okna. Kliknij okno główne, żeby ponowić.' : 'Nie udało się odtworzyć dźwięku tego filmu.');
        });
      }
    } catch { release(entry.win); }
  }
  session.every(() => { for (const entry of entries.values()) sync(entry); }, 250);
  session.cleanup(() => { for (const win of [...entries.keys()]) release(win); });
  return {
    attach(win, video, report = () => {}) {
      if (session.controller.signal.aborted || !trackUrl(video)) return false;
      release(win);
      const audio = doc.createElement('audio');
      audio.hidden = true; audio.preload = 'auto'; audio.loop = true; audio.volume = 1;
      doc.body.append(audio);
      const controller = new AbortController();
      const entry = {win, video, audio, report, controller, src: null, generation: 0, pending: false, blocked: false, failed: false};
      entries.set(win, entry);
      for (const event of ['playing', 'pause', 'seeked', 'ratechange', 'loadedmetadata', 'emptied']) {
        video.addEventListener(event, () => sync(entry), {signal: controller.signal});
      }
      audio.addEventListener('canplay', () => sync(entry), {signal: controller.signal});
      sync(entry);
      return true;
    },
    resume() { for (const entry of entries.values()) { entry.blocked = false; sync(entry); } },
    get size() { return entries.size; }
  };
}
