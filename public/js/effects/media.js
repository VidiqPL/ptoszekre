import { videos, createVideoPicker } from '../config.js';
export function createMedia(video, status, requestedVideo) {
  const pickVideo = createVideoPicker();
  let filename = videos.includes(requestedVideo) ? requestedVideo : pickVideo();
  let generation = 0, active = false, failures = 0;
  function attempt(current) {
    video.play()?.then(() => {
      if (current === generation && active && !video.muted) status.textContent = '';
    }).catch(error => {
      if (current !== generation || !active || error?.name === 'AbortError') return;
      if (error?.name !== 'NotAllowedError') return;
      status.textContent = 'Przeglądarka blokuje dźwięk. Zezwól tej stronie na automatyczne odtwarzanie z dźwiękiem.';
      // Autoplay with sound can be denied in a newly opened window. Keep the film moving.
      video.muted = true;
      video.play()?.catch(() => {
        if (current === generation && active) status.textContent = 'Przeglądarka blokuje odtwarzanie. Sprawdź uprawnienia automatycznego odtwarzania.';
      });
    });
  }
  function play() {
    active = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    // Always try audible playback first, including timer-opened windows.
    video.muted = false;
    video.volume = 1;
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
