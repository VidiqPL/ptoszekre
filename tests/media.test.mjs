import test from 'node:test';
import assert from 'node:assert/strict';
import {createVideoPicker,videos} from '../public/js/config.js';
import {createMedia} from '../public/js/effects/media.js';
test('popup videos are shuffled without repeats until every film has been used',()=>{
 const pick=createVideoPicker(()=>0.4);let previous;
 for(let cycle=0;cycle<3;cycle++){
  const round=Array.from({length:videos.length},()=>pick());
  assert.equal(new Set(round).size,videos.length);assert.notEqual(round[0],previous);previous=round.at(-1);
 }
});
class Video extends EventTarget {
 constructor(){super();this.muted=false;this.calls=0;}
 play(){this.calls++;return this.calls===1?Promise.reject(Object.assign(Error('autoplay denied'),{name:'NotAllowedError'})):Promise.resolve();}
 pause(){} removeAttribute(name){delete this[name];} load(){}
}
test('new windows loop the assigned film and retry autoplay muted when sound is blocked',async()=>{
 const video=new Video(),status={textContent:''};const media=createMedia(video,status,'duck.mp4');
 media.play();await new Promise(r=>setTimeout(r,0));
 assert.equal(video.src,'/media/videos/duck.mp4');assert.equal(video.loop,true);assert.equal(video.muted,true);assert.equal(video.calls,2);
 media.resume();assert.equal(video.muted,false);media.stop();assert.equal(video.src,undefined);
});
test('unsupported video falls back and stops retrying after Stop',()=>{
 const video=new Video();video.play=()=>Promise.resolve();const media=createMedia(video,{textContent:''},'duck.mp4');
 media.play();video.dispatchEvent(new Event('error'));assert.ok(video.src.startsWith('/media/videos/'));
 media.stop();video.dispatchEvent(new Event('error'));assert.equal(video.src,undefined);
});

test('every new video tries sound immediately, without waiting for a click',()=>{
 const video=new Video();const mutedAtPlay=[];video.play=()=>{mutedAtPlay.push(video.muted);return Promise.resolve();};
 const media=createMedia(video,{textContent:''},'duck.mp4');media.play();
 assert.deepEqual(mutedAtPlay,[false]);assert.equal(video.volume,1);assert.equal(video.preload,'auto');assert.equal(video.loop,true);media.stop();
});
test('blocked sound is explained, muted fallback plays, and any later unlock clears the message',async()=>{
 const video=new Video(),status={textContent:''};const media=createMedia(video,status,'duck.mp4');media.play();
 await new Promise(r=>setTimeout(r,0));assert.equal(video.muted,true);assert.match(status.textContent,/blokuje dźwięk/);
 media.resume();await new Promise(r=>setTimeout(r,0));assert.equal(video.muted,false);assert.equal(status.textContent,'');media.stop();
});

test('upstream-style warmup plays muted first and activation reuses the same loaded source',()=>{
 const video=new Video();const calls=[];let loads=0,src;
 Object.defineProperty(video,'src',{configurable:true,get(){return src;},set(value){src=value;loads++;}});
 video.play=()=>{calls.push(video.muted);return Promise.resolve();};
 const media=createMedia(video,{textContent:''},'duck.mp4');
 media.prime();media.prime();assert.deepEqual(calls,[true]);assert.equal(loads,1);
 media.play();assert.deepEqual(calls,[true,false]);assert.equal(loads,1,'activation must not reload the prepared movie');
 media.stop();
});

test('popup video stays muted while parent owns sound, avoiding duplicate audio',()=>{
 const video=new Video();video.play=()=>Promise.resolve();const media=createMedia(video,{textContent:''},'duck.mp4',{externalAudio:true});
 media.play();assert.equal(video.muted,true);media.resume();assert.equal(video.muted,true);
 media.useLocalAudio();assert.equal(video.muted,false);media.stop();
});
