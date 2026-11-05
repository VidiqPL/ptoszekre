// Adapted visual ideas from Kocmouch's upstream PR #25.
import {images, messages, pick} from '../config.js';
export function startChaos(session, layer, stage) {
  const title = document.title;
  session.cleanup(() => { document.title = title; layer.replaceChildren(); stage.classList.remove('wobble'); });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  session.every(() => { document.title = pick(messages); }, 1800);
  for (let i = 0; i < 5; i++) {
    const bird = document.createElement('img');
    bird.src = '/media/images/' + pick(images); bird.alt = ''; bird.className = 'floating-bird';
    bird.style.left = `${8 + Math.random() * 78}%`; bird.style.top = `${5 + Math.random() * 68}%`;
    bird.style.animationDelay = `${-i}s`; layer.append(bird);
  }
  const trail = document.createElement('span'); trail.className = 'trail'; trail.textContent = '🐦'; trail.hidden = true; layer.append(trail);
  session.on(window, 'pointermove', e => { if(e.pointerType !== 'mouse') return; trail.hidden = false; trail.style.transform = `translate(${e.clientX + 18}px,${e.clientY + 15}px)`; });
  session.every(() => {
    layer.querySelector('.overlay-message')?.remove();
    const label = document.createElement('span'); label.className = 'overlay-message'; label.textContent = pick(messages);
    label.style.left = `${5 + Math.random() * 55}%`; label.style.top = `${10 + Math.random() * 65}%`; layer.append(label);
  }, 2600);
  session.every(() => { stage.classList.add('wobble'); session.later(() => stage.classList.remove('wobble'), 350); }, 4200);
}
