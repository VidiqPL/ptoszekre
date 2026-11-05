// Original URL/theme animation plus visual additions adapted from PR #25.
import { messages, pick } from '../config.js';
export function startChaos(session, layer, stage) {
  const title = document.title, url = location.href;
  const theme = document.querySelector('meta[name="theme-color"]');
  const color = theme.content;
  session.cleanup(() => {
    document.title = title; theme.content = color;
    history.replaceState(history.state, '', url);
    layer.replaceChildren(); stage.classList.remove('wobble');
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const moons = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  let frame = 0;
  session.every(() => {
    const hash = Array.from({length: 10}, (_, i) => moons[(frame + i) % moons.length]).join('');
    history.replaceState(history.state, '', location.pathname + location.search + '#' + hash);
    theme.content = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    frame++;
  }, 250);
  session.every(() => { document.title = pick(messages); }, 700);
  const cursors = ['🖱️','🐦','📎','❌'].map(symbol => {
    const el = document.createElement('span'); el.className = 'trail'; el.textContent = symbol; el.hidden = true; layer.append(el); return el;
  });
  session.on(window, 'pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    cursors.forEach((el, i) => { el.hidden = false; el.style.transform = `translate(${event.clientX + 18 + i * 22}px,${event.clientY + 15 + i * 12}px)`; });
  });
  session.every(() => {
    layer.querySelector('.overlay-message')?.remove();
    const label = document.createElement('span'); label.className = 'overlay-message'; label.textContent = pick(messages);
    label.style.left = `${Math.random() * 60}%`; label.style.top = `${Math.random() * 70}%`; layer.append(label);
  }, 900);
  session.every(() => { stage.classList.add('wobble'); session.later(() => stage.classList.remove('wobble'), 350); }, 3200);
}
