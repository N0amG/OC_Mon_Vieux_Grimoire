# Mon Vieux Grimoire

## 📖 Description
Mon Vieux Grimoire est une application permettant d'ajouter des livres, de les noter de 1 à 5, de mettre à jour les informations et les images associées, ainsi que de gérer un système de création de comptes.

## 🛠 Technologies utilisées
- **Back-end :** Node.js, Express, MongoDB
- **Front-end associé :** React (npm run start, port 3000)
- **Base de données :** MongoDB Atlas (par défaut, connectée à la base distante)

## 📋 Prérequis
### Environnement recommandé
- **Node.js** (version recommandée : LTS)
- **MongoDB** (utilisation de la base distante fournie, mais possibilité d'utiliser une base locale)

## 🚀 Installation
### 1️⃣ Cloner le projet
```bash
 git clone https://github.com/N0amG/OC_Mon_Vieux_Grimoire
 cd backend/
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Configuration du fichier `.env`
Un fichier `.env` est fourni avec les valeurs suivantes par défaut :
```
MONGODB_URI='mongodb://<votre_url_mongo>'
PORT='4000'
JWT_TOKEN_SECRET='<votre_secret>'
```
- Si vous utilisez une base locale, modifiez `MONGODB_URI` en conséquence.
- Il est recommandé de modifier `JWT_TOKEN_SECRET`.

### 4️⃣ Lancer le serveur
```bash
node server.js
```

### 5️⃣ Démarrer le front-end
```bash
cd ../frontend/
npm run start
```

## 📂 Structure du projet
```
backend/
├── controllers/
├── images/
├── middleware/
├── models/
├── node_modules/
├── routes/
├── .env
├── app.js
├── package.json
├── package-lock.json
├── server.js
```

## 📡 API Endpoints
### 📚 `/api/books`
- **POST `/`** : Ajouter un livre (auth + multer requis)
- **GET `/`** : Récupérer tous les livres
- **GET `/bestrating`** : Obtenir les meilleurs livres
- **POST `/:id/rating`** : Noter un livre (auth requis)
- **DELETE `/:id`** : Supprimer un livre (auth requis)
- **GET `/:id`** : Obtenir un livre spécifique
- **PUT `/:id`** : Modifier un livre (auth + multer requis)

### 🔐 `/api/auth`
- **POST `/signup`** : Inscription
- **POST `/login`** : Connexion

## 🛑 Gestion des erreurs
- Statuts HTTP renvoyés selon les erreurs rencontrées.

---
🚀 **Projet développé par Noam Guez**

