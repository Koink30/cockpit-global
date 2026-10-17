import {createRoot} from 'react-dom/client';
import {useEffect,useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {supabase} from './cloud';
import Cockpit from './ui';
import './globals.css';
import './signin.css';

function AuthApp(){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[recovery,setRecovery]=useState(false);
 const [mode,setMode]=useState<'login'|'signup'|'reset'>('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{
  let live=true;
  supabase.auth.getSession().then(({data,error})=>{if(live){setSession(data.session);setReady(true);if(error)setError('Connexion à rétablir.')}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,s)=>{setSession(s);setReady(true);if(event==='PASSWORD_RECOVERY')setRecovery(true);if(event==='SIGNED_OUT'){setRecovery(false);setPassword('');setConfirm('')}});
  return()=>{live=false;subscription.unsubscribe()};
 },[]);
 async function submit(e:React.FormEvent){
  e.preventDefault();setError('');setNotice('');setBusy(true);
  try{
   const redirect=location.origin+location.pathname;
   if(recovery){
    if(password!==confirm)throw Error('Les deux mots de passe ne correspondent pas.');
    const {error}=await supabase.auth.updateUser({password});if(error)throw error;
    setRecovery(false);setPassword('');setConfirm('');
   }else if(mode==='login'){
    const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;
    setPassword('');
   }else if(mode==='signup'){
    if(password!==confirm)throw Error('Les deux mots de passe ne correspondent pas.');
    const {error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:redirect}});if(error)throw error;
    setNotice('Consulte ta messagerie pour confirmer ton adresse, puis connecte-toi ici.');setPassword('');setConfirm('');setMode('login');
   }else{
    const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:redirect});if(error)throw error;
    setNotice('Si ce compte existe, un lien pour choisir un nouveau mot de passe vient d’être envoyé.');
   }
  }catch(e){const m=(e as Error).message;setError(m.includes('Invalid login')?'Adresse ou mot de passe incorrect.':m.includes('Email not confirmed')?'Confirme ton adresse avec le message reçu avant de te connecter.':m.includes('rate limit')?'Trop de tentatives. Patiente quelques minutes avant de réessayer.':m.includes('Failed to fetch')?'Connexion indisponible. Vérifie ton accès Internet.':m)}finally{setBusy(false)}
 }
 if(!ready)return <div className="auth-shell app"><p>Ouverture de ton espace…</p></div>;
 if(session&&!recovery)return <Cockpit key={session.user.id} user={session.user.email||'Mon compte'} onSignOut={async()=>{const {error}=await supabase.auth.signOut({scope:'local'});if(error)throw error;location.hash=''}}/>;
 return <div className="auth-shell app"><section className="auth-card panel">
 <div className="eyebrow">MES PROJETS · COCKPIT GLOBAL</div><h1>{recovery?'Nouveau mot de passe':'Ton bureau, partout.'}</h1><p className="muted">Retrouve tes projets et tes notes depuis ton ordinateur ou ton téléphone.</p>
 <h2>{recovery?'Sécuriser mon compte':mode==='signup'?'Première connexion':mode==='reset'?'Mot de passe oublié':'Connexion à ton espace privé'}</h2>
 <form onSubmit={submit}>
 {!recovery&&<label>Adresse e-mail<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}
 {(recovery||mode!=='reset')&&<label>Mot de passe<input type="password" autoComplete={mode==='login'&&!recovery?'current-password':'new-password'} minLength={mode==='signup'||recovery?12:1} required value={password} onChange={e=>setPassword(e.target.value)}/></label>}
 {(recovery||mode==='signup')&&<label>Confirmer le mot de passe<input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>}
 {error&&<p role="alert" className="error">{error}</p>}{notice&&<p role="status" className="notice">{notice}</p>}
 <button className="primary" disabled={busy} type="submit">{busy?'Connexion en cours…':recovery?'Enregistrer le mot de passe':mode==='signup'?'Créer mon accès':mode==='reset'?'Recevoir un lien':'Se connecter'}</button>
 </form>
 {!recovery&&<div className="auth-links">{mode!=='login'&&<button onClick={()=>{setMode('login');setError('')}}>Revenir à la connexion</button>}{mode==='login'&&<><button onClick={()=>{setMode('signup');setError('')}}>Première connexion</button><button onClick={()=>{setMode('reset');setError('')}}>Mot de passe oublié</button></>}</div>}
 <p className="tiny muted">Accès réservé aux comptes autorisés. Sur un ordinateur partagé, déconnecte-toi et ferme toutes les fenêtres privées en partant.</p>
 </section></div>
}
createRoot(document.getElementById('root')!).render(<AuthApp/>);
