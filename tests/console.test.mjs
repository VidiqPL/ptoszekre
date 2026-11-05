import test from 'node:test';
import assert from 'node:assert/strict';
import {collectBrowserFacts} from '../public/js/effects/console.js';
test('missing browser APIs are shown as unavailable rather than guessed',()=>{
 const facts=new Map(collectBrowserFacts({}));
 for(const label of ['Platforma (deklarowana)','RAM (przybliżenie)','Rodzaj połączenia','Prędkość (szacowana)','Cookies włączone'])assert.equal(facts.get(label),'niedostępne');
 assert.ok(facts.size>=30);
});
test('facts preserve actual zero network values and declared hardware',()=>{
 const facts=new Map(collectBrowserFacts({navigator:{hardwareConcurrency:8,deviceMemory:4,connection:{downlink:0,rtt:0,saveData:false},languages:['pl-PL','en'],onLine:false},screen:{width:1920,height:1080},matchMedia:()=>({matches:false})}));
 assert.equal(facts.get('Wątki CPU'),8);assert.equal(facts.get('RAM (przybliżenie)'),'~4 GB');assert.equal(facts.get('Prędkość (szacowana)'),'0 Mb/s');assert.equal(facts.get('Opóźnienie (szacowane)'),'0 ms');assert.equal(facts.get('Internet (wg przeglądarki)'),'nie');
});
test('referrer is limited to a hostname and does not expose query strings',()=>{
 const facts=new Map(collectBrowserFacts({document:{referrer:'https://example.test/path?token=private'}}));assert.equal(facts.get('Strona odsyłająca'),'example.test');
});
