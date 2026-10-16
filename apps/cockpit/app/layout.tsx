import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Mes projets · Cockpit',description:'Un point de départ, tous vos projets.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}
