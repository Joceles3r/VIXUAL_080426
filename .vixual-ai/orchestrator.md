# 🧭 VIXUAL Orchestrator

Rôle : piloter le cycle IA officiel de VIXUAL.

Cycle obligatoire :

1. 🏗️ VIXUAL Architect
   - analyse le module ciblé
   - identifie les risques
   - propose une priorité
   - ne modifie aucun fichier

2. 💻 VIXUAL Builder
   - reçoit le diagnostic Architect
   - propose un patch ciblé
   - ne modifie rien sans validation

3. 🔍 VIXUAL Inspector
   - relit le patch proposé
   - vérifie les risques de régression
   - donne un verdict : validé / à corriger

4. 👤 Jocelyn + ChatGPT
   - décident si le patch est appliqué
   - testent localement
   - commitent uniquement si tout est bon

Règles absolues :
- Une seule cible à la fois.
- Toujours lire le code réel.
- Toujours afficher les fichiers concernés.
- Pas de modification directe par IA.
- Pas de patch global.
- Pas de changement métier sans validation.
- Git commit uniquement après test local.

Format de mission :

## Mission
Module ciblé :

## Architect
Diagnostic attendu :

## Builder
Patch attendu :

## Inspector
Contrôle attendu :

## Décision finale
Appliquer / refuser / reporter
