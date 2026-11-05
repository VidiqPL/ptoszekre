import { videos, createVideoPicker } from '../config.js';
export function createMedia(video, status, requestedVideo, { background = false } = {}) {
  const pickVideo = createVideoPicker();
  let filename = videos.includes(requestedVideo) ? requestedVideo : pickVideo();
  let generation = 0, active = false, failures = 0;
  function attempt(current) {
    video.play()?.catch(() => {
      if (current !== generation || !active) return;
      // Autoplay with sound can be denied in a newly opened window. Keep the film moving.
      video.muted = true;
      video.play()?.catch(() => {
        if (current === generation && active) status.textContent = 'Kliknij film, żeby go odtworzyć.';
      });
    });
  }
  function play() {
    active = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    // Timer-opened windows have no user activation. Start muted rather than waiting on a rejected sound autoplay.
    if (background && !globalThis.navigator?.userActivation?.hasBeenActive) video.muted = true;
    video.src = '/media/videos/' + filename;
    attempt(++generation);
  }
  video.addEventListener('canplay', () => { if (active && video.paused) attempt(generation); });
  video.addEventListener('error', () => {
    if (!active) return;
    if (++failures >= videos.length) { status.textContent = 'Nie udało się odtworzyć filmów.'; return; }
    filename = pickVideo(); play();
  });
  return {
    play,
    resume() {
      if (!active) return;
      video.muted = false;
      attempt(generation);
    },
    stop() { active = false; generation++; failures = 0; video.pause(); video.removeAttribute('src'); video.load(); }
  };
}
