# Corpus d’apprentissage Fuse

Le fichier `annotations.json` relie chaque photo validée à son bar, son frigo et au profil concerné. Les boissons et les étages de référence restent la source de vérité dans `dist/profile-inventory.js`.

Chaque nouveau relevé photo validé doit ajouter : la photo, le bar, le frigo, l’étage, les boissons visibles, le nombre de lignes, le nombre de bouteilles de face (maximum 7) et, lorsque connu, la profondeur. Ces données permettront ensuite d’entraîner le modèle local `dist/models/fuse-inventory.onnx` pour la reconnaissance et le comptage.
