import { createVideoPicker } from '../config.js';
// The original openWindow/moveWindowBounce behavior, with one owner for cleanup.
export const MAX_POPUPS = 6;
export function createPopupManager({ host = window, sessionId, onBlocked = () => {}, onLimit = () => {} }) {
  const windows = new Set();
  const pickVideo = createVideoPicker();
  function prune() { for (const win of windows) if (win.closed) windows.delete(win); }
  return {
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
      // Must stay synchronous inside the click/keydown handler: browsers block delayed opens.
      const win = source.open(url.href, '', `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
      if (!win) { onBlocked(); return null; }
      windows.add(win);
      return win;
    },
    closeAll() { for (const win of windows) { try { if (!win.closed) win.close(); } catch {} } windows.clear(); },
    get size() { prune(); return windows.size; }
  };
}
export function bouncePopup(session, host = window) {
  if (host.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let vx = 15, vy = 15;
  session.every(() => {
    const left = host.screen.availLeft || 0, top = host.screen.availTop || 0;
    if (host.screenX <= left + 10) vx = Math.abs(vx);
    if (host.screenX + host.outerWidth >= left + host.screen.availWidth - 10) vx = -Math.abs(vx);
    if (host.screenY <= top + 30) vy = Math.abs(vy);
    if (host.screenY + host.outerHeight >= top + host.screen.availHeight - 10) vy = -Math.abs(vy);
    try { host.moveBy(vx, vy); } catch { /* Normal tabs and mobile browsers cannot move windows. */ }
  }, 50);
}
