import { Session } from './session.js';
import { startChaos } from './effects/chaos.js';
import { showBrowserFacts } from './effects/console.js';
import { createMedia } from './effects/media.js';
import { createPopupManager, bouncePopup } from './effects/popups.js';
import { startAudio } from './effects/audio.js';
const $ = id => document.getElementById(id);
const video = $('bird-video');
const media = createMedia(video, $('status'));
let session = null, popups = null, audio = null, spaces = 0;
let owner = null;
const params = new URLSearchParams(location.search);
try {
  if (params.get('child') === 'true' && window.opener && !window.opener.closed &&
      window.opener.location.origin === location.origin && window.opener.location.pathname.replace(/\/$/, '') === '/onlyfans') {
    const candidate = window.opener.ptoszekDemo;
    if (candidate?.active && candidate.sessionId === params.get('session')) owner = candidate;
  }
} catch { /* An unrelated opener must never be read or redirected. */ }
function openBird() {
  if (!session) return;
  if (owner) owner.open(window); else popups.open();
  audio?.speak();
}
function start({child = false} = {}) {
  if (session) return;
  session = new Session(); spaces = 0; $('status').textContent = '';
  if (!child) {
    const sessionId = crypto.randomUUID();
    popups = createPopupManager({sessionId,
      onBlocked: () => { $('status').textContent = 'Przeglądarka zablokowała okienko. Zezwól na wyskakujące okna dla tej strony i kliknij „Więcej ptoszków”.'; },
      onLimit: () => { $('status').textContent = 'Masz już 6 ptoszków. Zamknij jedno okienko, żeby wpuścić następnego.'; }
    });
    window.ptoszekDemo = {sessionId, active: true, open: (source = window) => popups?.open(source), stop};
    // Open before media/fullscreen calls can consume the user activation.
    popups.open();
    session.cleanup(() => { window.ptoszekDemo.active = false; popups.closeAll(); popups = null; });
  } else {
    window.ptoszekDemo = owner;
    bouncePopup(session);
  }
  $('intro').hidden = true; $('experience').hidden = false;
  media.play();
  startChaos(session, $('effects'), $('stage'));
  audio = startAudio(session);
  session.cleanup(() => { media.stop(); audio = null; });
  if (!child) {
    showBrowserFacts($('browser-facts'));
    session.later(() => { $('spy-console').hidden = false; }, 2000);
  }
}
function stop() {
  if (!session) return;
  const current = session; session = null; current.stop();
  $('spy-console').hidden = true; $('experience').hidden = true; $('intro').hidden = false; spaces = 0;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}
function stopAll() { if (owner?.active) owner.stop(); else stop(); }
$('start').addEventListener('click', () => start());
$('stop').addEventListener('click', stopAll);
$('more-birds').addEventListener('click', openBird);
$('next-video').addEventListener('click', () => media.next());
$('show-console').addEventListener('click', () => { showBrowserFacts($('browser-facts')); $('spy-console').hidden = false; });
$('close-console').addEventListener('click', () => { $('spy-console').hidden = true; });
video.addEventListener('error', () => { if(session) $('status').textContent = 'Ten film nie działa w tej przeglądarce. Kliknij „Inny film”.'; });
video.addEventListener('volumechange', () => { $('mute').setAttribute('aria-pressed', String(video.muted)); $('mute').textContent = video.muted ? 'Włącz dźwięk' : 'Wycisz'; });
$('mute').addEventListener('click', () => { video.muted = !video.muted; });
$('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($('experience').requestFullscreen) await $('experience').requestFullscreen();
    else $('status').textContent = 'Pełny ekran jest niedostępny.';
  } catch { $('status').textContent = 'Pełny ekran jest niedostępny.'; }
});
document.addEventListener('click', event => {
  if (!session || event.target.closest('button,a,video,.spy-console')) return;
  openBird();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { stopAll(); return; }
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('button,a,input,textarea,select,[contenteditable]')) return;
  if (session) {
    if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); openBird(); }
    return;
  }
  if (event.code !== 'Space') return;
  event.preventDefault(); spaces++;
  if (spaces === 3) start();
});
// Popup focus must NOT stop the parent: unlike pagehide, it does not end the session.
window.addEventListener('pagehide', stop);
if (owner) start({child: true});
