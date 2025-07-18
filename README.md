# ♔ Operation Gambit ♔

**Operation Gambit** est une application de jeu d'échecs en cours de développement, construite avec React et Capacitor. L'objectif est de proposer des modes de jeu innovants en plus des échecs classiques.

---

## 🎯 État du Projet

Ce projet est actuellement en **phase de développement active**. Les fonctionnalités sont en cours de construction et peuvent être incomplètes ou sujettes à des modifications.

---

## 🔥 Modes de Jeu Implémentés

Voici les modes de jeu actuellement présents dans le code :

- **🏛️ Échecs Classiques**: Joueur vs Joueur et Joueur vs IA (Stockfish).
- **⚡ Energy Chess**: Un mode de jeu rapide basé sur un système d'énergie et de cartes.
- **💣 Chessweeper**: Un mélange entre les échecs et le Démineur.
- **🏓 PongChess**: Un mode hybride combinant Pong et échecs.

---

## 🛠️ Stack Technique

-   **Frontend**: React (avec Vite)
-   **Gestion d'état**: Zustand
-   **Moteur d'échecs**: Chess.js
-   **IA d'échecs**: Stockfish.js
-   **Mobile**: Capacitor (pour le déploiement natif sur Android)
-   **Styling**: CSS par composants

---

## 🚀 Lancer le Projet

### Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- [Android Studio](https://developer.android.com/studio) (uniquement pour la version mobile)

### 1. Cloner le dépôt et naviguer dans le dossier
```bash
git clone https://github.com/MattJeanLouis/Operation-Gambit.git
cd Operation-Gambit/frontend
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer l'application

#### Pour le développement web :
Le projet sera accessible sur `http://localhost:5173` (ou un port similaire).
```bash
npm run dev
```

#### Pour la version mobile (Android) :
```bash
# Compiler et synchroniser l'application
npm run mobile:build

# Lancer sur un émulateur ou un appareil connecté
npm run mobile:run
```

---

## 📂 Structure du Projet

La logique principale de l'application se trouve dans le dossier `frontend/`.

```
frontend/
├── src/
│   ├── components/     # Composants React (un par mode de jeu)
│   │   ├── Menu/
│   │   ├── Energy/
│   │   ├── Chessweeper/
│   │   └── Pong/
│   ├── store/          # Gestion d'état global avec Zustand
│   ├── utils/          # Logique de jeu
│   └── main.jsx        # Point d'entrée de l'application
├── capacitor.config.json # Configuration pour Capacitor
└── package.json
``` 