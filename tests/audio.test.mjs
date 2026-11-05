import test from 'node:test';
import assert from 'node:assert/strict';
import {startAudio} from '../public/js/effects/audio.js';
import {Session} from '../public/js/session.js';
test('original periodic-wave theremin starts immediately and is released on Stop',()=>{
 let context;
 class Audio {
  constructor(){this.state='running';context=this;}
  createOscillator(){return this.osc={frequency:{value:440},setPeriodicWave(wave){this.wave=wave;},connect(){},start(){this.started=true;},stop(){this.stopped=true;}};}
  createGain(){return this.gain={gain:{value:1},connect(){}};}
  createPeriodicWave(real,imag){return {real,imag};}
  resume(){this.resumed=true;return Promise.resolve();}
  close(){this.state='closed';return Promise.resolve();}
 }
 const body=new EventTarget();body.clientWidth=1000;body.clientHeight=800;
 const session=new Session();const audio=startAudio(session,{AudioContext:Audio,document:{body}});
 assert.ok(context.osc.started);assert.ok(context.resumed);assert.equal(context.gain.gain.value,1);
 assert.deepEqual(context.osc.wave.real,Array.from({length:10},(_,i)=>Math.cos(i)));
 assert.deepEqual(context.osc.wave.imag,Array.from({length:10},(_,i)=>Math.sin(i)));
 const move=new Event('mousemove');move.clientX=750;move.clientY=600;body.dispatchEvent(move);
 assert.equal(context.osc.frequency.value,1050);assert.equal(context.gain.gain.value,0.75);
 audio.resume();session.stop();assert.equal(context.state,'closed');assert.ok(context.osc.stopped);
});
