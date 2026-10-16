# Architecture minimale

## Modules du cockpit
1. Accueil / liste de projets : état, dernière activité et raccourcis.
2. Fiche projet : GitHub, Supabase le cas échéant, URL publiée, documents, conversations.
3. Versions : commits et livraisons, état test / production, points de restauration.
4. Temps : démarrer / arrêter une session et correction manuelle, durée réelle déclarée.
5. Demandes IA : demande libre, contraintes, contexte et critères d'acceptation.
6. Mémoire : décisions et règles, techniques réutilisables.

## Stockage progressif
- Étape initiale : fichiers Markdown / JSON dans GitHub, édités et relus.
- Plus tard : API ou backend sécurisés uniquement si le cockpit doit écrire automatiquement dans GitHub ou partager des données.
- Secrets : jamais dans les fichiers accessibles au navigateur.

## Principes
- Une seule source de code par projet.
- Séparation explicite entre test et production.
- Pas de pourcentage d'avancement inventé.
- Les informations importées (commits) et saisies (sessions) sont distinguées.
- Les temps ne sont jamais déduits avec certitude des commits.
