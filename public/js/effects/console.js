// Local-only browser information, inspired by upstream PR #28. No external requests.
const unavailable = 'niedostępne';
const yesNo = value => typeof value === 'boolean' ? (value ? 'tak' : 'nie') : unavailable;
export function collectBrowserFacts(env = globalThis) {
  const nav = env.navigator ?? {}, screen = env.screen ?? {}, doc = env.document ?? {};
  const matches = query => env.matchMedia?.(query)?.matches ?? false;
  const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
  const dimensions = (width, height) => width && height ? `${width} × ${height}` : unavailable;
  let referringSite = 'brak';
  try { if (doc.referrer) referringSite = new URL(doc.referrer).hostname; } catch {}
  const offset = -new Date().getTimezoneOffset();
  const utc = `${offset >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')}`;
  return [
    ['Język', nav.language ?? unavailable],
    ['Wszystkie języki', nav.languages?.join(', ') || unavailable],
    ['Strefa czasowa', Intl.DateTimeFormat().resolvedOptions().timeZone],
    ['Czas lokalny', new Date().toLocaleString(nav.language)],
    ['Przesunięcie UTC', utc],
    ['Platforma (deklarowana)', nav.userAgentData?.platform || nav.platform || unavailable],
    ['Przeglądarka (deklarowana)', nav.userAgentData?.brands?.map(b => `${b.brand} ${b.version}`).join(', ') || nav.userAgent || unavailable],
    ['Wątki CPU', nav.hardwareConcurrency ?? unavailable],
    ['RAM (przybliżenie)', nav.deviceMemory ? `~${nav.deviceMemory} GB` : unavailable],
    ['Ekran', dimensions(screen.width, screen.height)],
    ['Dostępny obszar ekranu', dimensions(screen.availWidth, screen.availHeight)],
    ['Rozmiar okna strony', dimensions(env.innerWidth, env.innerHeight)],
    ['Gęstość pikseli', env.devicePixelRatio ? `${env.devicePixelRatio}×` : unavailable],
    ['Głębia kolorów', screen.colorDepth ? `${screen.colorDepth} bit` : unavailable],
    ['Orientacja ekranu', screen.orientation?.type ?? unavailable],
    ['Punkty dotyku', nav.maxTouchPoints ?? unavailable],
    ['Precyzyjny wskaźnik', yesNo(matches('(pointer: fine)'))],
    ['Obsługa najechania', yesNo(matches('(hover: hover)'))],
    ['Motyw', matches('(prefers-color-scheme: dark)') ? 'ciemny' : 'jasny'],
    ['Ograniczony ruch', yesNo(matches('(prefers-reduced-motion: reduce)'))],
    ['Większy kontrast', yesNo(matches('(prefers-contrast: more)'))],
    ['Internet (wg przeglądarki)', yesNo(nav.onLine)],
    ['Rodzaj połączenia', connection?.effectiveType ?? unavailable],
    ['Prędkość (szacowana)', connection?.downlink != null ? `${connection.downlink} Mb/s` : unavailable],
    ['Opóźnienie (szacowane)', connection?.rtt != null ? `${connection.rtt} ms` : unavailable],
    ['Oszczędzanie danych', yesNo(connection?.saveData)],
    ['Cookies włączone', yesNo(nav.cookieEnabled)],
    ['Do Not Track', nav.doNotTrack === '1' ? 'włączone' : nav.doNotTrack === '0' ? 'wyłączone' : 'brak deklaracji'],
    ['Global Privacy Control', yesNo(nav.globalPrivacyControl)],
    ['Bezpieczny kontekst', yesNo(env.isSecureContext)],
    ['Strona odsyłająca', referringSite]
  ];
}
export async function showBrowserFacts(container, { signal } = {}) {
  const doc = container.ownerDocument;
  function row(label, value) {
    const element = doc.createElement('div'), dt = doc.createElement('dt'), dd = doc.createElement('dd');
    dt.textContent = label; dd.textContent = String(value); element.append(dt, dd); return element;
  }
  container.replaceChildren(...collectBrowserFacts().map(([label, value]) => row(label, value)));
  // Optional APIs may be absent in Firefox, privacy modes, or restricted contexts.
  const details = [];
  try {
    const canvas = doc.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      details.push(['GPU (WebGL)', debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)]);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } else details.push(['GPU (WebGL)', unavailable]);
  } catch { details.push(['GPU (WebGL)', unavailable]); }
  container.append(...details.map(([label, value]) => row(label, value)));
  const extra = await Promise.all([
    Promise.resolve().then(() => navigator.getBattery?.()).then(battery => battery ? [
      ['Poziom baterii', `${Math.round(battery.level * 100)}%`], ['Ładowanie baterii', yesNo(battery.charging)]
    ] : [['Bateria', unavailable]]).catch(() => [['Bateria', unavailable]]),
    Promise.resolve().then(() => navigator.storage?.estimate?.()).then(storage => storage ? [
      ['Pamięć zajęta przez stronę', storage.usage != null ? `${(storage.usage / 1024).toFixed(1)} KB` : unavailable],
      ['Limit pamięci strony', storage.quota != null ? `~${Math.round(storage.quota / 1024 / 1024)} MB` : unavailable]
    ] : [['Pamięć strony', unavailable]]).catch(() => [['Pamięć strony', unavailable]])
  ]);
  if (signal?.aborted) return;
  container.append(...extra.flat().map(([label, value]) => row(label, value)));
}
