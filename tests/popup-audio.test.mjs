import test from 'node:test';
import assert from 'node:assert/strict';
import {Session} from '../public/js/session.js';
import {createPopupAudio} from '../public/js/effects/popup-audio.js';
class Media extends EventTarget {
 constructor(){super();this.paused=true;this.ended=false;this.readyState=4;this.currentTime=0;this.playbackRate=1;this.loop=true;this.calls=0;}
 play(){this.paused=false;this.calls++;return Promise.resolve();}
 pause(){this.paused=true;}load(){}remove(){this.removed=true;}removeAttribute(name){delete this[name];}
}
function setup(t){
 t.mock.timers.enable({apis:['setInterval']});
 const created=[];const doc={baseURI:'https://example.test/onlyfans',body:{append(){}},createElement(tag){assert.equal(tag,'audio');const audio=new Media();created.push(audio);return audio;}};
 const session=new Session(),relay=createPopupAudio(session,doc),win={closed:false},video=new Media();
 video.src='https://example.test/media/videos/duck.mp4';video.paused=false;video.currentTime=2;
 return {created,session,relay,win,video};
}
test('popup sound plays in parent and follows playback, seek, rate and window close',async t=>{
 const {created,session,relay,win,video}=setup(t);assert.equal(relay.attach(win,video),true);await Promise.resolve();
 const audio=created[0];assert.equal(audio.src,video.src);assert.equal(audio.paused,false);assert.equal(audio.currentTime,2);
 video.currentTime=15;video.playbackRate=1.5;video.dispatchEvent(new Event('seeked'));assert.equal(audio.currentTime,15);assert.equal(audio.playbackRate,1.5);
 video.paused=true;video.dispatchEvent(new Event('pause'));assert.equal(audio.paused,true);
 win.closed=true;t.mock.timers.tick(250);assert.equal(relay.size,0);assert.equal(audio.removed,true);session.stop();
});
test('relay rejects external or unbundled URLs and stopped sessions',t=>{
 const {created,session,relay,win,video}=setup(t);video.src='https://other.test/media/videos/duck.mp4';assert.equal(relay.attach(win,video),false);
 video.src='https://example.test/private.mp4';assert.equal(relay.attach(win,video),false);assert.equal(created.length,0);
 session.stop();video.src='https://example.test/media/videos/duck.mp4';assert.equal(relay.attach(win,video),false);
});
test('Escape/session end removes every parent audio track',t=>{
 const {created,session,relay,win,video}=setup(t);relay.attach(win,video);relay.attach({closed:false},video);assert.equal(relay.size,2);
 session.stop();assert.equal(relay.size,0);assert.ok(created.every(audio=>audio.paused&&audio.removed&&!audio.src));
});
