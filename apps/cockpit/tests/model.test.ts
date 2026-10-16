import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,projectSchema,fresh} from '../src/model.ts';
test('Export V1 compatible et conservation de tous les modules',()=>{
 const p=fresh('Test migration');
 p.tasks=[{id:'a',title:'Action',text:'Détail\nDeuxième ligne',url:'',date:'2026-10-16T12:00:00Z',done:false}];
 p.versions=[{...p.tasks[0],id:'v',url:'https://example.com/v1'}];
 p.requests=[{...p.tasks[0],id:'r'}];p.notes='Mémoire accentuée';p.sessions=[{id:'s',start:'2026-10-16T12:00:00Z',end:'2026-10-16T13:00:00Z'}];
 const data=JSON.parse(JSON.stringify({format:'cockpit-global-v1',projects:[p]}));
 assert.deepEqual(projectSchema.parse(data.projects[0]),p);
});
test('Fiches de départ valides et identifiants stables',()=>{assert.equal(initial().length,5);assert.deepEqual(initial().map(p=>projectSchema.parse(p).id),initial().map(p=>p.id));});
test('Lien exécutable et limites invalides refusés',()=>{const p=fresh();assert.equal(projectSchema.safeParse({...p,live:'javascript:alert(1)'}).success,false);assert.equal(projectSchema.safeParse({...p,name:''}).success,false);assert.equal(projectSchema.safeParse({...p,notes:'x'.repeat(30001)}).success,false);});
