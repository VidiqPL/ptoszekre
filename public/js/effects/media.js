import {videos} from '../config.js';
export function createMedia(video, status) {
  let index = 0;
  function play() {
    video.src = '/media/videos/' + videos[index];
    const pending = video.play();
    pending?.catch(() => { status.textContent = 'Kliknij odtwarzanie na filmie, aby uruchomić dźwięk.'; });
  }
  return {
    play,
    next() { index = (index + 1) % videos.length; play(); },
    stop() { video.pause(); video.removeAttribute('src'); video.load(); }
  };
}
