import {Session} from './session.js';
import {startChaos} from './effects/chaos.js';
import {showBrowserFacts} from './effects/console.js';
import {createMedia} from './effects/media.js';
const $ = id => document.getElementById(id);
const video = $('bird-video');
const media = createMedia(video, $('status'));
let session = null, spaces = 0;
function start() {
  if (session) return;
  session = new Session(); spaces = 0;
  $('intro').hidden = true; $('experience').hidden = false; $('status').textContent = '';
  showBrowserFacts($('browser-facts'));
  media.play();
  startChaos(session, $('effects'), $('stage'));
  session.cleanup(() => media.stop());
  $('stop').focus({preventScroll:true});
}
function stop() {
  if (!session) return;
  session.stop(); session = null;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  $('experience').hidden = true; $('intro').hidden = false; spaces = 0; $('progress').textContent = '0 / 3';
  $('start').focus({preventScroll:true});
}
$('start').addEventListener('click', start);
$('stop').addEventListener('click', stop);
$('next-video').addEventListener('click', () => media.next());
video.addEventListener('error', () => { $('status').textContent = 'Ten film nie jest obsługiwany. Wybierz następnego ptaka.'; });
video.addEventListener('volumechange', () => { $('mute').setAttribute('aria-pressed', String(video.muted)); $('mute').textContent = video.muted ? 'Włącz dźwięk' : 'Wycisz'; });
$('mute').addEventListener('click', () => { video.muted = !video.muted; });
$('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($('experience').requestFullscreen) await $('experience').requestFullscreen();
    else $('status').textContent = 'Ta przeglądarka nie obsługuje pełnego ekranu.';
  } catch { $('status').textContent = 'Pełny ekran jest niedostępny.'; }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { stop(); return; }
  if (session || event.code !== 'Space' || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('button,a,input,textarea,select,[contenteditable]')) return;
  event.preventDefault(); spaces += 1; $('progress').textContent = `${spaces} / 3`;
  if (spaces === 3) start();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
window.addEventListener('pagehide', stop);
