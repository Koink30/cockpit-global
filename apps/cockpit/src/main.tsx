import {driveReady} from './onedrive';
// Consume Microsoft's response before Supabase examines the URL.
driveReady.catch(()=>{sessionStorage.setItem('cockpit-drive-error','Connexion Microsoft interrompue ou refusée. Réessaie avec Connecter OneDrive.');if(/(?:^#|&)code=|(?:^#|&)error=/.test(location.hash))history.replaceState(null,'',location.pathname);}).then(()=>import('./auth-app'));
