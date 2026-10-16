import {createClient} from '@supabase/supabase-js';
import {supabaseUrl,supabasePublishableKey} from './config';
import {initial,projectSchema,type Project} from './model';

// Le poste partagé n'est pas mémorisé entre deux sessions de navigateur.
export const supabase=createClient(supabaseUrl,supabasePublishableKey,{
 auth:{storage:sessionStorage,storageKey:'cockpit-global-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},
});

export async function loadProjects():Promise<{projects:Project[],revision:number}>{
 const {data:{user},error:authError}=await supabase.auth.getUser();
 if(authError||!user)throw Error('Session expirée. Reconnecte-toi pour retrouver tes projets.');
 const {data:membership,error:memberError}=await supabase.from('cockpit_members').select('user_id').eq('user_id',user.id).maybeSingle();
 if(memberError)throw Error('Vérification des accès impossible. Réessaie dans quelques instants.');
 if(!membership)throw Error('Ce compte n’est pas autorisé à ouvrir ce cockpit.');
 const {data,error}=await supabase.from('cockpit_state').select('revision,projects').eq('user_id',user.id).maybeSingle();
 if(error)throw Error('Lecture impossible. Vérifie ta connexion et réessaie.');
 if(!data)return {revision:0,projects:initial()};
 return {revision:data.revision,projects:projectSchema.array().max(200).parse(data.projects)};
}

export async function saveProjects(revision:number,projects:Project[]):Promise<number>{
 const valid=projectSchema.array().max(200).parse(projects);
 if(new Set(valid.map(p=>p.id)).size!==valid.length)throw Error('Identifiants de projets en double.');
 if(new TextEncoder().encode(JSON.stringify(valid)).length>2000000)throw Error('Sauvegarde trop volumineuse. Exporte tes fiches avant de réduire leur taille.');
 const {data,error}=await supabase.rpc('save_cockpit',{expected_revision:revision,new_projects:valid});
 if(error){
  if(error.code==='40001')throw Error('Une autre fenêtre a modifié les données. Ton formulaire est conservé : copie les changements, ferme-le, actualise puis réessaie.');
  if(error.code==='42501')throw Error('Accès refusé ou session expirée. Reconnecte-toi.');
  throw Error('Enregistrement impossible. Tes modifications restent dans le formulaire. Vérifie la connexion puis réessaie.');
 }
 return data as number;
}
