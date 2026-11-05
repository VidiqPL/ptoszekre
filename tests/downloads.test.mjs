import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {createDownloads,downloadFiles,MAX_DOWNLOADS} from '../public/js/effects/downloads.js';
function documentStub() {
  const created=[];
  return {created,body:{append(){}},createElement(tag){assert.equal(tag,'a');const a={clicks:0,removed:false,click(){this.clicks++;},remove(){this.removed=true;}};created.push(a);return a;}};
}
test('all random downloads point to existing bundled image and video files',async()=>{
 assert.ok(downloadFiles.some(f=>f.startsWith('images/')));assert.ok(downloadFiles.some(f=>f.startsWith('videos/')));
 for(const file of downloadFiles)await access(new URL('../public/media/'+file,import.meta.url));
});
test('downloads use the original anchor mechanism for both image and video',()=>{
 const doc=documentStub();let random=0;const downloads=createDownloads({doc,random:()=>random});
 assert.match(downloads.trigger(),/^images\//);random=0.999;assert.match(downloads.trigger(),/^videos\//);
 for(const anchor of doc.created){assert.match(anchor.href,/^\/media\/(images|videos)\//);assert.ok(anchor.download);assert.equal(anchor.clicks,1);assert.equal(anchor.removed,true);}
});
test('download budget is shared by the session and stopped sessions cannot download',()=>{
 const doc=documentStub();const downloads=createDownloads({doc});
 for(let i=0;i<MAX_DOWNLOADS+5;i++)downloads.trigger();assert.equal(doc.created.length,MAX_DOWNLOADS);
 const other=createDownloads({doc});other.stop();assert.equal(other.trigger(),null);assert.equal(doc.created.length,MAX_DOWNLOADS);
});
