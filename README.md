# Cockpit Global — Développement

Dépôt privé de référence pour le cockpit central de suivi des projets.

## État au 16 octobre 2026
**Initialisation uniquement.** Le code de l'application existante publiée sur ChatGPT Sites n'a PAS été récupéré ni migré. Aucun déploiement n'est configuré.

Application existante : https://mes-projets-geoffroy.ferez-geoffroy.chatgpt.site/

## Objectif
Un point d'entrée unique : projets, accès GitHub/Supabase, historique des versions, sessions de travail, préparation des demandes IA, mémoire des décisions et bibliothèque de techniques.

## Sources de vérité
- GitHub : code et documentation versionnée ;
- ChatGPT : conception et assistance, avec contexte explicitement partagé ;
- Supabase : seulement si des données synchronisées le justifient ;
- OneDrive : documents et archives, selon les accès.

## Démarrage
1. Récupérer les sources de l'application publiée **sans toucher à la production**.
2. Examiner dépendances, stockage, authentification, fonctionnalités et possibilités de migration.
3. Placer une copie dans un environnement de test, puis vérifier les parcours existants.
4. Connecter le cockpit aux dépôts, puis enrichir progressivement la mémoire IA.

Documentation : [architecture](docs/ARCHITECTURE.md), [règles](docs/REGLES_GLOBALES.md), [migration](docs/MIGRATION.md).

**Ne jamais placer d'identifiants, clés secrètes, données clients ou informations sensibles dans ce dépôt.**
