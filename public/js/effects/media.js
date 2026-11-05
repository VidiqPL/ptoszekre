import { videos } from '../config.js';
export function createMedia(video, status) {
  let index = Math.floor(Math.random() * videos.length), generation = 0;
  function play() {
    const current = ++generation;
    video.src = '/media/videos/' + videos[index];
    video.play()?.catch(() => {
      if (current === generation) status.textContent = 'Kliknij film, żeby go odtworzyć. Przeglądarka może blokować automatyczny dźwięk.';
    });
  }
  return {
    play,
    next() { index = (index + 1) % videos.length; play(); },
    stop() { generation++; video.pause(); video.removeAttribute('src'); video.load(); }
  };
}
