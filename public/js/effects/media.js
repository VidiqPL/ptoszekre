import { videos, createVideoPicker } from '../config.js';
export function createMedia(video, status, requestedVideo, {externalAudio = false} = {}) {
  const pickVideo = createVideoPicker();
  let filename = videos.includes(requestedVideo) ? requestedVideo : pickVideo();
  let generation = 0, active = false, failures = 0, prepared = false;
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
  function prepare() {
    if (prepared) return;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = '/media/videos/' + filename;
    prepared = true;
  }
  function play() {
    active = true;
    prepare();
    // Unmute the already-prepared player before a popup consumes user activation.
    video.muted = externalAudio;
    video.volume = 1;
    attempt(++generation);
  }
  video.addEventListener('canplay', () => { if (active && video.paused) attempt(generation); });
  video.addEventListener('error', () => {
    if (!active) { filename = pickVideo(); prepared = false; return; }
    if (++failures >= videos.length) { status.textContent = 'Nie udało się odtworzyć filmów.'; return; }
    filename = pickVideo(); prepared = false; play();
  });
  return {
    prime() {
      if (active || prepared) return;
      // Mirrors upstream startInvisiblePictureInPictureVideo using the same player.
      video.muted = true;
      prepare();
      video.play()?.catch(() => {});
    },
    play,
    useLocalAudio() { externalAudio = false; if (active) { video.muted = false; attempt(generation); } },
    resume() {
      if (!active) return;
      video.muted = externalAudio;
      attempt(generation);
    },
    stop() { active = false; prepared = false; generation++; failures = 0; video.pause(); video.removeAttribute('src'); video.load(); }
  };
}
