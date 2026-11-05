import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../public/', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.mp4':'video/mp4','.mov':'video/quicktime'};
const server = createServer(async (req,res) => {
  try {
    const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file = resolve(root, '.' + path);
    if (file !== root.slice(0,-1) && !file.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(403).end(); return; }
    try { if ((await stat(file)).isDirectory()) file = resolve(file,'index.html'); } catch { if (!extname(file)) file += '.html'; }
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type':types[extname(file)] ?? 'application/octet-stream'}); res.end(data);
  } catch { res.writeHead(404, {'Content-Type':'text/html'}); res.end(await readFile(root+'404.html')); }
});
server.listen(Number(process.env.PORT || 5173), '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + server.address().port));
