# ÉPOPÉE : Moteur d'Échecs de Base

## Feature : Interface de jeu d'échecs complète
- **Type**: Feature
- **User Story**: En tant que joueur, je veux pouvoir jouer aux échecs avec une interface intuitive, afin de profiter d'une expérience de jeu fluide et agréable.
- **Status**: Done ✅
- **Labels**: `enhancement`, `user-story`, `core`
- **Modules**: `ChessBoard.jsx`, `ChessBoard.css`, `main.jsx`
- **Description**: Interface complète avec plateau 8x8, coordonnées, pièces Unicode, et interactions utilisateur.

---

### Task: Logique de jeu d'échecs intégrée
- **Type**: Task
- **Status**: Done ✅
- **Parent issue**: Feature: Interface de jeu d'échecs complète
- **Labels**: `core`, `chess-logic`
- **Description**: Intégration de chess.js pour gérer la logique complète du jeu (mouvements légaux, échec, mat, pat).

---

### Task: Système de drag & drop des pièces
- **Type**: Task
- **Status**: Done ✅
- **Parent issue**: Feature: Interface de jeu d'échecs complète
- **Labels**: `ui`, `interaction`
- **Description**: Implémentation du glisser-déposer pour déplacer les pièces sur le plateau avec validation des coups.

---

### Task: Interface responsive et moderne
- **Type**: Task
- **Status**: Done ✅
- **Parent issue**: Feature: Interface de jeu d'échecs complète
- **Labels**: `ui`, `css`, `responsive`
- **Description**: CSS moderne avec grille responsive, coordination du plateau, et design visuel attrayant.

---

## Feature : Navigation dans l'historique des coups
- **Type**: Feature
- **User Story**: En tant que joueur, je veux pouvoir naviguer dans l'historique de la partie, afin d'analyser et revoir les coups joués.
- **Status**: Done ✅
- **Labels**: `enhancement`, `user-story`, `analysis`
- **Modules**: `ChessBoard.jsx`
- **Description**: Système complet de navigation avec boutons, clavier, et molette de souris.

---

### Task: Affichage de l'historique des coups
- **Type**: Task
- **Status**: Done ✅
- **Parent issue**: Feature: Navigation dans l'historique des coups
- **Labels**: `ui`, `history`
- **Description**: Table formatée des coups avec notation algébrique et numérotation des coups.

---

### Task: Navigation clavier et molette
- **Type**: Task
- **Status**: Done ✅
- **Parent issue**: Feature: Navigation dans l'historique des coups
- **Labels**: `interaction`, `keyboard`
- **Description**: Support des flèches directionnelles et molette de souris pour naviguer dans l'historique.

---

### Task: Contrôles de navigation visuel
- **Type**: Task
- **Status**: Done ✅
- **Parent issue**: Feature: Navigation dans l'historique des coups
- **Labels**: `ui`, `buttons`
- **Description**: Boutons << < > >> pour naviguer au début, précédent, suivant, et fin de partie.

---

## Feature : Affichage des pièces capturées
- **Type**: Feature
- **User Story**: En tant que joueur, je veux voir les pièces capturées par chaque camp, afin d'évaluer l'équilibre matériel de la partie.
- **Status**: Done ✅
- **Labels**: `enhancement`, `user-story`, `visual`
- **Modules**: `ChessBoard.jsx`, `ChessBoard.css`
- **Description**: Zones dédiées pour afficher les pièces capturées par chaque joueur avec comptage automatique.

---

## Feature : Actions de partie de base
- **Type**: Feature
- **User Story**: En tant que joueur, je veux pouvoir effectuer les actions de base d'une partie d'échecs, afin de contrôler le déroulement du jeu.
- **Status**: Done ✅
- **Labels**: `enhancement`, `user-story`, `game-control`
- **Modules**: `ChessBoard.jsx`
- **Description**: Boutons pour nouvelle partie, proposer nulle, et abandonner la partie.

---

### Task: Validation et indication des coups légaux
- **Type**: Task
- **Status**: Done ✅
- **Parent issue**: Feature: Interface de jeu d'échecs complète
- **Labels**: `chess-logic`, `ui`
- **Description**: Surbrillance des cases de destination légales lors de la sélection d'une pièce. 