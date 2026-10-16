# Règles de collaboration — v0.1

## Préserver l'existant
- Ne pas supprimer une fonction existante sans décision explicite.
- Avant modification : lire la mémoire du projet, identifier les interfaces et les dépendances touchées.
- Après modification : tester les parcours concernés et les parcours voisins, documenter ce qui n'a pas été testé.

## Demandes
- Classer chaque intervention : correctif, évolution ou refonte.
- Regrouper les corrections cohérentes pour limiter les allers-retours.
- Séparer demande, contraintes, critères de réussite et limites.
- N'utiliser que des contraintes réellement applicables au projet.

## Livraison
- Résumer ce qui a changé.
- Identifier commit / version / environnement.
- Mettre à jour le journal des décisions quand une règle durable a été validée.
- Conserver un retour arrière praticable.

## Sécurité
- Les secrets et données personnelles ne doivent pas être copiés dans une mémoire destinée aux demandes IA.
- Toute fonctionnalité liée à l'authentification ou aux données réelles doit être testée séparément.
- Une décision globale peut être proposée aux projets sans être imposée automatiquement.

## Limite importante
Une conversation ChatGPT ne lit pas automatiquement tous ces fichiers : ils doivent être fournis ou accessibles par une intégration explicite.
