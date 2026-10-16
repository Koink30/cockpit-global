import {getChatGPTUser} from '../../chatgpt-auth';
import {getDb} from '../../../db';
import {cockpitState} from '../../../db/schema';
import {eq,sql} from 'drizzle-orm';
import {z} from 'zod';
import {initial,projectSchema} from '../../model';
export const dynamic='force-dynamic';
const json=(x:unknown,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const user=await getChatGPTUser();if(!user)return json({error:'Connexion requise.'},401);const [row]=await getDb().select().from(cockpitState).where(eq(cockpitState.id,user.userId));return json(row?{revision:row.revision,projects:JSON.parse(row.data)}:{revision:0,projects:initial()});}
export async function PUT(req:Request){const user=await getChatGPTUser();if(!user)return json({error:'Connexion requise.'},401);if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origine refusée.'},403);try{const raw=await req.text();if(raw.length>2000000)return json({error:'Sauvegarde trop volumineuse.'},413);const body=z.object({revision:z.number().int().nonnegative(),projects:z.array(projectSchema).max(200)}).parse(JSON.parse(raw));if(new Set(body.projects.map(p=>p.id)).size!==body.projects.length)return json({error:'Identifiants en double.'},400);const rows=await getDb().insert(cockpitState).values({id:user.userId,revision:body.revision+1,data:JSON.stringify(body.projects)}).onConflictDoUpdate({target:cockpitState.id,set:{revision:sql`${cockpitState.revision} + 1`,data:JSON.stringify(body.projects)},setWhere:eq(cockpitState.revision,body.revision)}).returning({revision:cockpitState.revision});if(!rows.length)return json({error:'Une autre fenêtre a modifié les données. Ferme le formulaire, actualise puis réessaie.'},409);return json({revision:rows[0].revision});}catch{return json({error:'Enregistrement impossible. Vérifie les champs et les liens web.'},400);}}
