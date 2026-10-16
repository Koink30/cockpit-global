# Migration du cockpit existant — plan sans risque

Source : https://mes-projets-geoffroy.ferez-geoffroy.chatgpt.site/

## Inconnues à lever
- Technologie et fichiers sources.
- Stockage actuel et mécanisme de connexion.
- Fonctionnalités spécifiques de ChatGPT Sites.
- Possibilité d'export depuis la conversation Work d'origine.

## Procédure
1. Dans la conversation Work d'origine, demander **une copie complète des sources** et la liste des dépendances, sans publication ni modification.
2. Vérifier que le code récupéré correspond bien au cockpit publié.
3. Importer les sources dans un répertoire dédié, via une branche de migration.
4. Relever les fonctions existantes et établir la liste de tests.
5. Tester hors production ; choisir GitHub Pages seulement si le site est compatible avec un hébergement statique.
6. Valider la nouvelle publication avant tout remplacement de l'adresse existante.

## Ne pas faire
- Ne pas considérer l'URL publiée comme une archive de code source.
- Ne pas recopier aveuglément des tokens/API keys.
- Ne pas exposer de clés Supabase service_role dans le navigateur.
- Ne pas déclarer la migration terminée avant tests effectifs.
