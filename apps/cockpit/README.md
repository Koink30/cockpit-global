# Cockpit Global — version autonome 1.1

Interface React/Vite conservée depuis le cockpit Sites ; authentification Supabase et base PostgreSQL.

## Développement et compilation

Depuis ce dossier, avec Node 24 : `npm ci`, `npm test`, `npm run build`.
`npm run dev` lance le développement ; `npm run preview` sert le résultat compilé.
Le lockfile actif est `package-lock.json`. Le lockfile pnpm de la version Sites reste dans le commit d'archive.

Le contenu de `dist/` est statique et peut être servi sous un sous-chemin GitHub Pages. Les URL d'actifs sont relatives. Le dossier ne contient aucun secret serveur.

## Configuration

`src/config.ts` contient l'URL et la clé **publishable** du seul projet Supabase `cockpit-global` (Paris). Cette clé est publique par conception. Les droits reposent sur Supabase Auth, la table d'habilitation `cockpit_members` et les politiques RLS, jamais sur la confidentialité du JavaScript.

L'adresse propriétaire autorisée est enregistrée séparément dans `cockpit_private.allowed_emails`. Seul un compte dont l'adresse a été confirmée par Supabase peut recevoir cette habilitation automatiquement. Le navigateur ne peut ni ajouter ni modifier les habilitations. Les autres comptes ne peuvent pas accéder aux données.

Dans Supabase Auth, la Site URL et les URL de redirection doivent correspondre à l'URL publiée, y compris le sous-chemin GitHub Pages. Conserver la confirmation d'adresse e-mail active. Le premier accès passe par « Première connexion » puis la confirmation reçue. Les identifiants ChatGPT Sites ne sont pas les identifiants du nouveau compte.

La session utilise `sessionStorage` plutôt qu'un stockage permanent. Sur poste partagé, utiliser la navigation privée et se déconnecter avant de partir. Les téléchargements restent sur le poste.

## Données et sauvegardes

Les données d'un utilisateur restent un JSON de projets versionné par un compteur dans `public.cockpit_state`, pour préserver intégralement les fonctions et exports V1. La fonction `save_cockpit` effectue une comparaison atomique de révision ; en cas de conflit, le formulaire reste ouvert et aucune donnée n'est écrasée silencieusement.

Export/import `cockpit-global-v1` inchangé. L'import remplace les fiches après confirmation. Exporter avant toute restauration. Les fichiers OneDrive ne sont pas copiés ; leurs liens sont conservés. Aucun bucket Storage n'est requis pour cette migration.

## Sources d'origine et retour arrière

Sources Sites intégrales préservées dans le commit GitHub `0bbdbc72c399d691a9102c0efc93394f4e976b98`, dossier `apps/cockpit` ; commit source Sites : `b1fe44610d37a709ff3e7778c7f15f4a8147226d`.
Le site Sites d'origine n'est ni modifié ni supprimé. La version autonome remplace uniquement les fichiers de cette branche de migration. Aucun autre dépôt ni projet Supabase n'est concerné.

Ne pas restaurer le code Sites sur GitHub Pages : il nécessite son serveur d'origine. Pour un retour après publication autonome, redéployer un précédent artefact autonome validé et traiter séparément les sauvegardes de données.
