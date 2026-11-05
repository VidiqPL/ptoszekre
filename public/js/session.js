// Every recurring effect belongs to a session and is cleaned up together.
export class Session {
  constructor() { this.controller = new AbortController(); this.cleanups = []; }
  on(target, event, handler, options = {}) { target.addEventListener(event, handler, {...options, signal:this.controller.signal}); }
  every(callback, ms) { const id = setInterval(callback, ms); this.cleanups.push(() => clearInterval(id)); }
  later(callback, ms) {
    const cancel = () => clearTimeout(id);
    const id = setTimeout(() => { this.cleanups = this.cleanups.filter(fn => fn !== cancel); callback(); }, ms);
    this.cleanups.push(cancel);
  }
  cleanup(callback) { this.cleanups.push(callback); }
  stop() { this.controller.abort(); this.cleanups.splice(0).reverse().forEach(fn => fn()); }
}
