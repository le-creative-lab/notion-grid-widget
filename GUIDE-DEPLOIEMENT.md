# 🎉 Guide de déploiement — Notion Grid Widget

## Ce que tu vas créer

Un widget que tes abonnées collent dans Notion pour voir leur grille Instagram avec leurs visuels Canva, en temps réel.

---

## Étape 1 — Crée ton compte GitHub (5 min)

1. Va sur **github.com** et crée un compte gratuit
2. Vérifie ton email
3. C'est tout ✓

---

## Étape 2 — Upload les fichiers sur GitHub (10 min)

1. Sur github.com, clique sur le **"+"** en haut à droite > **"New repository"**
2. Nomme-le `notion-grid-widget`
3. Laisse tout par défaut, clique **"Create repository"**
4. Clique sur **"uploading an existing file"** (lien bleu sur la page vide)
5. Glisse-dépose **tous les fichiers** du dossier `notion-grid-widget` que tu as reçu
6. Clique **"Commit changes"**

> ⚠️ Important : respecte bien la structure des dossiers.
> Le fichier `pages/index.js` doit rester dans un sous-dossier `pages/`, etc.
> GitHub te permet de créer des dossiers en nommant le fichier `pages/index.js` directement.

---

## Étape 3 — Déploie sur Vercel (10 min, gratuit)

1. Va sur **vercel.com** et connecte-toi avec ton compte GitHub
2. Clique **"Add New… > Project"**
3. Sélectionne ton repo `notion-grid-widget`
4. Vercel détecte automatiquement que c'est du Next.js ✓
5. Clique **"Deploy"** — attends 2-3 minutes
6. Vercel te donne une URL du type : `https://notion-grid-widget-xxx.vercel.app`

🎉 **Ton app est en ligne !**

---

## Étape 4 — Configure un domaine personnalisé (optionnel mais recommandé)

Pour avoir une URL propre du style `widget.lecreativelab.fr` :

1. Dans Vercel > ton projet > **"Settings" > "Domains"**
2. Ajoute ton sous-domaine
3. Vercel te donne les DNS à configurer chez Gandi
4. Dans Gandi > ton domaine > DNS > ajoute les enregistrements fournis par Vercel
5. Attends 5-15 min que ça se propage

---

## Étape 5 — Crée une intégration Notion (pour toi et pour tes abonnées)

Chaque abonnée devra faire ça une fois :

1. Aller sur **notion.so/my-integrations**
2. Cliquer **"+ New integration"**
3. Nommer l'intégration (ex: "Grid Widget")
4. Copier le **"Internal Integration Token"** (commence par `secret_`)
5. Ouvrir sa base Notion > cliquer les **"..."** en haut à droite > **"Connections"** > chercher et ajouter son intégration

---

## Étape 6 — Structure de la base Notion

Dis à tes abonnées de créer (ou adapter) leur base avec ces colonnes :

| Propriété    | Type              | Utilité                          |
|--------------|-------------------|----------------------------------|
| Titre        | Titre (auto)      | Nom du post                      |
| Image        | URL               | Lien de partage Canva            |
| Statut       | Sélection         | Brouillon / Programmé / Publié   |
| Date         | Date              | Date de publication prévue       |
| Plateforme   | Sélection         | Instagram / TikTok / LinkedIn    |

**Pour le lien Canva :**
Dans Canva > "Partager" > "Partager le lien" > copier > coller dans la propriété Image.

---

## Étape 7 — Utiliser le widget

1. L'abonnée va sur `ton-domaine.vercel.app` (ou ton domaine perso)
2. Elle entre son Integration Token et l'ID de sa base
3. Elle clique "Tester la connexion" pour vérifier
4. Elle clique "Générer mon lien widget"
5. Elle copie l'URL générée
6. Dans Notion, elle tape `/embed` > colle l'URL > "Embed link"
7. 🎉 Sa grille s'affiche !

**L'ID de la base Notion** se trouve dans l'URL :
`https://www.notion.so/monworkspace/`**`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`**`?v=...`
C'est la série de 32 caractères après le slash.

---

## Étape 8 — Vendre le widget avec ThriveCart

### Ce que l'achat donne accès à :
- L'URL de ton générateur de widget
- Le guide de configuration (ce fichier !)
- Un template Notion optionnel

### Mise en place ThriveCart :
1. Crée un nouveau produit "Widget Grille Instagram pour Notion"
2. En "Fulfillment", envoie un email automatique avec :
   - L'URL de ton app (`ton-domaine.vercel.app`)
   - Ce guide en PDF
   - Le lien vers le template Notion

### Prix suggéré : 19-27€ (one-time)

---

## Maintenance & mises à jour

**Pour modifier le code :**
1. Modifie les fichiers sur GitHub directement (bouton crayon)
2. Vercel redéploie automatiquement en 2 min

**Si une abonnée a un problème :**
- Token invalide → elle doit recréer une intégration Notion
- Base introuvable → elle a oublié d'inviter l'intégration dans sa base
- Image ne s'affiche pas → le lien Canva doit être un lien de partage public

---

## Fonctionnalités du widget

✓ Grille 3x3 infinie (jusqu'à 60 posts)
✓ Preview des visuels Canva via lien de partage
✓ Drag & drop pour réorganiser l'ordre
✓ Filtres : Tous / Brouillons / Programmés / Publiés
✓ Rafraîchissement automatique toutes les 30 secondes
✓ Clic sur un post pour voir les détails
✓ Lien direct vers la page Notion du post
✓ Compatible avec n'importe quelle base Notion existante

---

## Support

Des questions ? Tu peux rouvrir cette conversation Claude et demander de l'aide 😊
