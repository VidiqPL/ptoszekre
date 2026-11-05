import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {Session} from '../public/js/session.js';
import {images,videos} from '../public/js/config.js';
test('every configured media file exists in the deployable site',async()=>{
  for(const name of images) await access(new URL('../public/media/images/'+name,import.meta.url));
  for(const name of videos) await access(new URL('../public/media/videos/'+name,import.meta.url));
});
test('session stops listeners, pending work and intervals, and can stop twice',async()=>{
  const session=new Session(); const target=new EventTarget(); let count=0, cleaned=false;
  session.on(target,'demo',()=>count++); target.dispatchEvent(new Event('demo')); assert.equal(count,1);
  session.every(()=>count++,5); session.later(()=>count++,10); session.cleanup(()=>cleaned=true);
  session.stop();session.stop();target.dispatchEvent(new Event('demo'));
  await new Promise(resolve=>setTimeout(resolve,30)); assert.equal(count,1);assert.equal(cleaned,true);
});
test('home has exactly one navigation action and build excludes original source',async()=>{
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.equal((html.match(/<a /g)||[]).length,1); assert.match(html,/href="\/onlyfans"/);
 await assert.rejects(access(new URL('../dist/ptoszek.pl-main/index.js',import.meta.url)));
});
