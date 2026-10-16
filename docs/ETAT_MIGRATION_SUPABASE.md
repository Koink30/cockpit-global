# Migration Cockpit Global — 16 octobre 2026

## Réalisé

- Sources d'origine importées intégralement sur la branche `migration-cockpit-existant`, commit `0bbdbc72c399d691a9102c0efc93394f4e976b98`.
- Application React existante conservée ; couche serveur Sites/D1 remplacée par Supabase Auth et PostgreSQL. Compilation statique Vite pour GitHub Pages.
- Projet Supabase dédié : `cockpit-global`, référence `fyhnarhyhqiwxlomlpkx`, Paris.
- Habilitation propriétaire par adresse vérifiée, RLS, sauvegarde atomique avec révision et validation SQL. Pas de secret serveur dans les sources.
- Relecture de D1 avant migration : `cockpit_state` contient zéro ligne. Aucun enregistrement à importer. Les cinq fiches initiales restent définies dans le code ; les données de l'ancien outil local ne sont pas importées automatiquement.
- Aucune modification de l'application Sites ni des autres projets.

## Vérifications

- Compilation TypeScript et Vite réussie.
- Tests transactionnels PostgreSQL réussis : création/lecture/mise à jour, conflit de révision, rejet des données invalides, isolation utilisateur, protection des habilitations, refus anonyme. Les comptes et écritures fictifs ont été annulés par ROLLBACK.
- Contrôle de sécurité Supabase : aucun avertissement ou erreur ; une information attendue « RLS sans politique » sur la liste d'adresses privée, volontairement inaccessible aux clients.
- Les essais navigateur de bout en bout et l'accès à l'URL publiée restent à valider après activation de l'hébergement et configuration des redirections Auth.

## Publication

Workflow `.github/workflows/cockpit-pages.yml` : installe les dépendances verrouillées, teste, compile, dépose l'artefact puis publie sur GitHub Pages.
La source Pages doit être « GitHub Actions ». Le dépôt reste privé ; vérifier que l'abonnement GitHub permet Pages pour un dépôt privé. Ne pas rendre le dépôt public pour contourner une restriction.
L'environnement `github-pages` doit autoriser la branche de migration. La publication de l'interface statique ne rend pas les données publiques : elles restent protégées par Supabase.

L'authentification et la sauvegarde réelles, la synchronisation sur deux appareils, l'import/export, les versions, demandes, notes et sessions doivent être vérifiés sur l'URL finale. Ne pas considérer le déploiement comme terminé avant ces contrôles.
