import { Session } from './session.js';
import { startChaos } from './effects/chaos.js';
import { showBrowserFacts } from './effects/console.js';
import { createMedia } from './effects/media.js';
import { createPopupManager } from './effects/popups.js';
import { startAudio } from './effects/audio.js';
import { createDownloads } from './effects/downloads.js';
import { createPopupAudio } from './effects/popup-audio.js';
const $ = id => document.getElementById(id);
const video = $('bird-video');
let session = null, popups = null, audio = null, popupAudio = null, spaces = 0;
let skipInitialClick = false;
let owner = null;
const params = new URLSearchParams(location.search);
try {
  if (params.get('child') === 'true' && window.opener && !window.opener.closed &&
      window.opener.location.origin === location.origin && window.opener.location.pathname.replace(/\/$/, '') === '/onlyfans') {
    const candidate = window.opener.ptoszekDemo;
    if (candidate?.active && candidate.sessionId === params.get('session')) owner = candidate;
  }
} catch { /* An unrelated opener must never be read or redirected. */ }
const media = createMedia(video, $('audio-status'), params.get('video'), {externalAudio: Boolean(owner?.attachAudio)});
function openBird() {
  if (!session) return;
  if (owner) owner.open(window); else popups.open();
  audio?.resume();
  audio?.speak();
}
function start({child = false} = {}) {
  if (session) return;
  session = new Session(); spaces = 0; $('status').textContent = '';
  $('intro').hidden = true; $('experience').hidden = false;
  $('stage').append(video);
  media.play();
  audio = startAudio(session);
  // Any real click/tap/key can unlock sound; it need not target the video.
  const unlockSound = () => { media.resume(); audio?.resume(); popupAudio?.resume(); owner?.resumePopupAudio?.(); };
  for (const type of ['mousedown', 'mouseup', 'touchend', 'keydown', 'keyup', 'keypress']) {
    session.on(document, type, event => { if (event.key !== 'Escape') unlockSound(); }, {capture: true, passive: true});
  }
  session.cleanup(() => { media.stop(); audio = null; });
  if (!child) {
    const sessionId = crypto.randomUUID();
    popupAudio = createPopupAudio(session);
    const downloads = createDownloads();
    session.cleanup(() => downloads.stop());
    popups = createPopupManager({sessionId,
      onOpened: () => downloads.trigger(),
      onBlocked: () => { $('status').textContent = 'Przeglądarka zablokowała okienko. Zezwól na wyskakujące okna dla tej strony — następne pojawi się automatycznie w ciągu 5 sekund.'; },
      onLimit: () => { $('status').textContent = 'Masz już 6 ptoszków. Zamknij jedno okienko, żeby wpuścić następnego.'; }
    });
    window.ptoszekDemo = {sessionId, active: true, open: (source = window) => popups?.open(source), stop,
      attachAudio: (...args) => popupAudio?.attach(...args), resumePopupAudio: () => popupAudio?.resume()};
    // Audio was resumed first; popup creation follows in the same input handler.
    popups.open();
    if (downloads.attempts === 0) downloads.trigger();
    popups.start(session);
    session.cleanup(() => { window.ptoszekDemo.active = false; popups.closeAll(); popups = null; popupAudio = null; });
  } else {
    window.ptoszekDemo = owner;
    if (!owner.attachAudio?.(window, video, message => { $('audio-status').textContent = message; })) media.useLocalAudio();
  }
  startChaos(session, $('effects'), $('stage'));
  $('click-prank').hidden = child;
  if (!child) {
    let clicks = 0;
    $('click-count').textContent = '0/10';
    session.on(video, 'click', () => { $('click-count').textContent = `${++clicks}/10`; });
    showBrowserFacts($('browser-facts'), {signal: session.controller.signal});
    session.later(() => { $('spy-console').hidden = false; $('spy-console').open = true; }, 2000);
  }
}
function stop() {
  if (!session) return;
  const current = session; session = null; current.stop();
  $('spy-console').hidden = true; $('experience').hidden = true; $('intro').hidden = false; spaces = 0; skipInitialClick = false;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}
function stopAll() { if (owner?.active) owner.stop(); else stop(); }
// Original activation events: native mousedown/touch/key, never mouse movement.
function startFromPress(event) {
  if (session || event.button > 0 || event.target.closest('a,input,textarea,select,[contenteditable]')) return;
  skipInitialClick = true;
  start();
}
document.addEventListener('mousedown', startFromPress, {capture: true, passive: true});
document.addEventListener('touchend', startFromPress, {capture: true, passive: true});
$('start').addEventListener('click', () => start());
document.addEventListener('click', event => {
  if (skipInitialClick) { skipInitialClick = false; return; }
  if (!session || event.target.closest('button,a,.spy-console')) return;
  media.resume();
  openBird();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { stopAll(); return; }
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('button,a,input,textarea,select,[contenteditable]')) return;
  if (session) {
    if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); media.resume(); openBird(); }
    return;
  }
  if (event.code === 'Space') {
    event.preventDefault();
    if (++spaces === 3) start();
  } else if (event.code === 'Enter') start();
});
// Popup focus must NOT stop the parent: unlike pagehide, it does not end the session.
window.addEventListener('pagehide', stop);
if (owner) start({child: true});
else media.prime();
