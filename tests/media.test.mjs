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
 play(){this.calls++;return this.calls===1?Promise.reject(Error('autoplay denied')):Promise.resolve();}
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

test('timer-opened video starts muted immediately, without a mouse event',()=>{
 const video=new Video();const mutedAtPlay=[];video.play=()=>{mutedAtPlay.push(video.muted);return Promise.resolve();};
 const media=createMedia(video,{textContent:''},'duck.mp4',{background:true});media.play();
 assert.deepEqual(mutedAtPlay,[true]);assert.equal(video.preload,'auto');assert.equal(video.loop,true);media.stop();
});
