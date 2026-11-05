import test from 'node:test';
import assert from 'node:assert/strict';
import {createPopupManager, MAX_POPUPS, bouncePopup} from '../public/js/effects/popups.js';
function setup(blocked = false) {
  const calls = [];
  const host = {location:{origin:'https://example.test'}, screen:{availWidth:1920,availHeight:1080}, open(...args) {
    calls.push(args); return blocked ? null : {closed:false,close(){this.closed=true;}};
  }};
  return {host,calls};
}
test('popup opens synchronously on the correct child route with matching session',()=>{
  const {host,calls}=setup();const manager=createPopupManager({host,sessionId:'session-123'});
  manager.open();assert.equal(calls.length,1);
  const url=new URL(calls[0][0]);assert.equal(url.pathname,'/onlyfans');
  assert.equal(url.searchParams.get('child'),'true');assert.equal(url.searchParams.get('session'),'session-123');
  assert.match(calls[0][2],/width=480,height=260/);assert.equal(manager.size,1);
});
test('popup blockers report failure without creating fake windows',()=>{
  const {host}=setup(true);let blocked=0;
  const manager=createPopupManager({host,sessionId:'test',onBlocked:()=>blocked++});
  assert.equal(manager.open(),null);assert.equal(blocked,1);assert.equal(manager.size,0);
});
test('popup sessions are capped, reuse closed slots and close every child on Stop',()=>{
  const {host}=setup();let limited=0;
  const manager=createPopupManager({host,sessionId:'test',onLimit:()=>limited++});const children=[];
  for(let i=0;i<MAX_POPUPS;i++)children.push(manager.open());
  assert.equal(manager.open(),null);assert.equal(limited,1);
  children[0].close();children.push(manager.open());assert.equal(manager.size,MAX_POPUPS);
  manager.closeAll();assert.ok(children.every(c=>c.closed));assert.equal(manager.size,0);
});
test('reduced motion skips moving popup windows',()=>{
  let started=false;
  bouncePopup({every(){started=true;}},{matchMedia:()=>({matches:true})});assert.equal(started,false);
});

test('child gestures open on the child Window to retain browser user activation',()=>{
  const {host,calls}=setup();const child=setup();const manager=createPopupManager({host,sessionId:'test'});
  manager.open(child.host);assert.equal(calls.length,0);assert.equal(child.calls.length,1);assert.equal(manager.size,1);
  manager.closeAll();assert.equal(manager.size,0);
});
