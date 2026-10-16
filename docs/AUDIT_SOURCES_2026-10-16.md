# Audit des sources du cockpit — 2026-10-16

Archive reçue : Cockpit_Global_Sources_Audit_2026-10-16(1).zip (126 entrées ; ~1,36 Mo décompressé).

## Architecture observée
- Application React / TypeScript, Next.js 16 / Vinext, pnpm (lockfile présent).
- Interface cockpit : app/ui.tsx ; schémas des projets : app/model.ts.
- API de projets : app/api/projects/route.ts.
- Persistance Cloudflare D1 via Drizzle : db/ et drizzle/.
- Connexion spécifique ChatGPT Sites : app/chatgpt-auth.ts et headers oai-authenticated-user-*.
- Configuration liée à Sites : .openai/hosting.json, scripts/ et build/.
- Modules visibles dans le code : Vue d’ensemble, Accès & dossiers, Fichiers & versions, Demandes IA, À suivre, Temps & activité, Notes.

## Points de vigilance
- GitHub Pages seul ne peut pas exécuter l'API serveur et la base D1.
- L'authentification actuelle n'est pas portable telle quelle.
- L'archive contient des sources, pas une sauvegarde des données réelles hébergées dans D1.
- Aucune compilation ou recette navigateur n'a encore été vérifiée dans ce dépôt.
- Ne pas modifier le site en production pendant la migration.
- Contrôler toute configuration/secrets avant import et publication.

## Plan
1. Importer le contenu de source/ sur cette branche, après revue sécurité (sans les fichiers générés inutiles).
2. Installer les dépendances à partir de pnpm-lock.yaml.
3. Tester la compilation puis les parcours essentiels en environnement isolé.
4. Prévoir l'hébergement serveur, l'authentification et la migration des données.
5. Ne fusionner sur main qu'après validation.

Statut : **branche de migration créée, sources pas encore poussées sur GitHub**.
