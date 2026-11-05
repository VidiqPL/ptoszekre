import { createVideoPicker } from '../config.js';
// The original openWindow/moveWindowBounce behavior, with one owner for cleanup.
export const MAX_POPUPS = 6;
export const POPUP_INTERVAL = 5000;
export function createPopupManager({ host = window, sessionId, onBlocked = () => {}, onLimit = () => {}, onOpened = () => {} }) {
  const windows = new Set();
  const pickVideo = createVideoPicker();
  const movement = new Map();
  let started = false;
  function prune() { for (const win of windows) if (win.closed) { windows.delete(win); movement.delete(win); } }
  const manager = {
    start(session) {
      if (started) return;
      started = true;
      session.every(() => { if (manager.size < MAX_POPUPS) manager.open(); }, POPUP_INTERVAL);
      if (!host.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        session.every(() => { prune(); for (const step of movement.values()) step(); }, 50);
      }
      session.cleanup(() => { manager.closeAll(); started = false; });
    },
    open(source = host) {
      prune();
      if (windows.size >= MAX_POPUPS) { onLimit(); return null; }
      const screen = host.screen;
      const width = 480, height = 260;
      const left = (screen.availLeft || 0) + Math.floor(Math.random() * Math.max(1, screen.availWidth - width));
      const top = (screen.availTop || 0) + Math.floor(Math.random() * Math.max(1, screen.availHeight - height));
      const url = new URL('/onlyfans', host.location.origin);
      url.searchParams.set('child', 'true');
      url.searchParams.set('session', sessionId);
      url.searchParams.set('video', pickVideo());
      // First open uses the initiating gesture. Timer opens require site popup permission.
      const win = source.open(url.href, '', `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
      if (!win) { onBlocked(); return null; }
      windows.add(win);
      onOpened(win);
      movement.set(win, createBouncer(win));
      if (!host.matchMedia?.('(prefers-reduced-motion: reduce)').matches) movement.get(win)(); // Move even before the child scripts load.
      return win;
    },
    closeAll() { for (const win of windows) { try { if (!win.closed) win.close(); } catch {} } windows.clear(); movement.clear(); },
    get size() { prune(); return windows.size; }
  };
  return manager;
}
// Same 15px / 50ms movement as upstream, randomized in both axes.
// The parent drives these steps: a child needs no mouse movement, focus or loaded scripts.
export function createBouncer(host, random = Math.random) {
  let vx = 15 * (random() > 0.5 ? 1 : -1);
  let vy = 15 * (random() > 0.5 ? 1 : -1);
  return () => {
    if (host.closed) return;
    try {
      const screen = host.screen;
      const left = (screen.availLeft || 0) + 10;
      const top = (screen.availTop || 0) + 30;
      const right = Math.max(left, (screen.availLeft || 0) + screen.availWidth - host.outerWidth - 10);
      const bottom = Math.max(top, (screen.availTop || 0) + screen.availHeight - host.outerHeight - 10);
      let x = host.screenX, y = host.screenY;
      if (x <= left) vx = Math.abs(vx);
      if (x >= right) vx = -Math.abs(vx);
      if (y <= top) vy = Math.abs(vy);
      if (y >= bottom) vy = -Math.abs(vy);
      host.moveTo(Math.max(left, Math.min(right, x + vx)), Math.max(top, Math.min(bottom, y + vy)));
    } catch { /* Moving normal tabs is disallowed by browsers. */ }
  };
}
export function bouncePopup(session, host = window) {
  if (host.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const step = createBouncer(host);
  step();
  session.every(step, 50);
}
