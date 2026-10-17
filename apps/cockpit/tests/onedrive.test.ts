import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PublicClientApplication} from '@azure/msal-browser';
Object.defineProperty(globalThis,'BroadcastChannel',{value:undefined,configurable:true});
Object.defineProperty(globalThis,'location',{value:{origin:'https://koink30.github.io',pathname:'/cockpit-global/',hash:''},configurable:true});
PublicClientApplication.prototype.initialize=async()=>{};
PublicClientApplication.prototype.handleRedirectPromise=async()=>null;
PublicClientApplication.prototype.getAllAccounts=()=>[{homeAccountId:'account-a'} as any];
PublicClientApplication.prototype.getActiveAccount=()=>null;
PublicClientApplication.prototype.acquireTokenSilent=async()=>({accessToken:'test-token'} as any);
const {graph,ensureFolder,safeName,checkAccount,uploadFile,children}=await import('../src/onedrive.ts');
const parent={id:'parent',name:'Test',webUrl:'https://onedrive.live.com',parentReference:{driveId:'drive'}};
test('Graph refuses foreign destinations before transmitting credentials',async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return new Response('{}')};
 await assert.rejects(()=>graph('https://example.com/steal'),/refusée/);assert.equal(calls,0);
});
test('Existing folders are reused without writes',async()=>{
 const calls:RequestInit[]=[];globalThis.fetch=async(_url,init)=>{calls.push(init!);return Response.json({...parent,id:'existing',folder:{}})};
 assert.equal((await ensureFolder(parent,'Versions')).id,'existing');assert.equal(calls.length,1);assert.equal(calls[0].method,undefined);
});
test('Missing folder uses fail-on-conflict instead of overwrite or duplicate',async()=>{
 let calls=0;globalThis.fetch=async(_url,init)=>{calls++;if(calls===1)return Response.json({error:{message:'Missing'}},{status:404});assert.equal(init?.method,'POST');assert.equal(JSON.parse(init?.body as string)['@microsoft.graph.conflictBehavior'],'fail');return Response.json({...parent,id:'created',folder:{}})};
 assert.equal((await ensureFolder(parent,'Versions')).id,'created');
});
test('Permission errors do not trigger folder creation',async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({},{status:403})};await assert.rejects(()=>ensureFolder(parent,'Versions'),/refuse/);assert.equal(calls,1);
});
test('Account mismatch blocks access to saved binding',()=>{assert.throws(()=>checkAccount({id:'x',driveId:'d',accountId:'other'}),/autre compte/)});
test('Pagination retains all items and checks every destination',async()=>{
 let calls=0;globalThis.fetch=async()=>++calls===1?Response.json({value:[{id:'1',name:'B'}],'@odata.nextLink':'https://graph.microsoft.com/v1.0/me/drive/root/children?$skiptoken=2'}):Response.json({value:[{id:'2',name:'A'}]});assert.equal((await children(parent)).length,2);
});
test('Uploads retain extension and use unique names',async()=>{
 const paths:string[]=[];globalThis.fetch=async(url,init)=>{paths.push(String(url));assert.equal(init?.method,'PUT');return Response.json({id:'new'})};const file=new File(['hello'],'notes.txt');await uploadFile(parent,file);await uploadFile(parent,file);assert.notEqual(paths[0],paths[1]);assert.match(paths[0],/notes-[a-f0-9]+\.txt:/);assert.equal(safeName('a/b:c?'),'a_b_c_');
});
