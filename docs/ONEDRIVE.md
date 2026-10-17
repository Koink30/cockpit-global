# Connexion OneDrive — 17 octobre 2026

Application personnelle Microsoft : `545d576c-55f4-4c07-a42d-ce3651617815`.
Plateforme SPA, retour enregistré : `https://koink30.github.io/cockpit-global/`.
Autorité `consumers`, MSAL Browser 4.30.0, flux code avec PKCE par redirection.
Permission déléguée `Files.ReadWrite`, demandée au consentement utilisateur pour gérer ses dossiers existants. Aucun secret client. Les jetons Microsoft sont uniquement conservés dans sessionStorage et effacés à la déconnexion du Cockpit.

## Utilisation
- Accueil : Connecter OneDrive puis consentement Microsoft.
- Projet > Accès & dossiers : choisir un dossier existant, ou créer une arborescence sous OneDrive/Cockpit Global.
- Compléter l’arborescence réutilise les dossiers présents et conserve les liens manuels renseignés.
- Afficher les fichiers : navigation paginée, ouverture OneDrive, ajout de fichiers jusqu’à 20 Mo avec noms uniques.
- Les références du dossier (lecteur, élément, compte Microsoft) sont sauvegardées dans la fiche projet. Aucun jeton dans Supabase.
- Les versions restent un catalogue manuel. Aucun déplacement ni suppression automatique, pas de sauvegarde à chaque seconde.

## Vérification
Compilation TypeScript/Vite et tests automatisés : compatibilité fiches, destinations Graph, réutilisation de dossiers, conflits, refus d’accès, liaison à un autre compte, pagination, noms de téléversement uniques.
Connexion et opérations réelles à valider dans le navigateur du propriétaire : la session du navigateur distant est bloquée après authentification. Ne pas annoncer un OneDrive connecté avant ce test.

Sources : https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-acquire-token ; https://learn.microsoft.com/en-us/graph/api/driveitem-post-children ; https://learn.microsoft.com/en-us/graph/api/driveitem-put-content
