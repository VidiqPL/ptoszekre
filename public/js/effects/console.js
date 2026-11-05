// Local-only adaptation of the browser-information demo from UhcWolfe's PR #28.
export function showBrowserFacts(container) {
  const facts = [
    ['Język', navigator.language],
    ['Strefa', Intl.DateTimeFormat().resolvedOptions().timeZone],
    ['Ekran', `${screen.width} × ${screen.height}`],
    ['Wątki CPU', navigator.hardwareConcurrency ?? 'niedostępne'],
    ['Pamięć RAM', navigator.deviceMemory ? `~${navigator.deviceMemory} GB` : 'niedostępne'],
    ['Dotyk', navigator.maxTouchPoints > 0 ? 'tak' : 'nie'],
    ['Motyw', matchMedia('(prefers-color-scheme: dark)').matches ? 'ciemny' : 'jasny']
  ];
  container.replaceChildren(...facts.map(([key,value]) => {
    const row = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd');
    dt.textContent = key; dd.textContent = String(value); row.append(dt,dd); return row;
  }));
}
