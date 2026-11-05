// Original triggerFileDownload behavior: download an existing bundled file through a link.
import { images, videos } from '../config.js';
export const MAX_DOWNLOADS = 3;
export const downloadFiles = [
  ...images.map(name => 'images/' + name),
  ...videos.map(name => 'videos/' + name)
];
export function createDownloads({ doc = document, random = Math.random } = {}) {
  let attempts = 0, stopped = false;
  return {
    trigger() {
      if (stopped || attempts >= MAX_DOWNLOADS) return null;
      const file = downloadFiles[Math.floor(random() * downloadFiles.length)];
      const anchor = doc.createElement('a');
      anchor.href = '/media/' + file;
      anchor.download = file.split('/').at(-1);
      anchor.hidden = true;
      doc.body.append(anchor);
      attempts++;
      try { anchor.click(); return file; }
      catch { return null; } // A refused download must not interrupt the popup or playback.
      finally { anchor.remove(); }
    },
    stop() { stopped = true; },
    get attempts() { return attempts; }
  };
}
