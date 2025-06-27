# Opération Gambit – Game Design Document (v0.1)

**Date : 19 juin 2025**
**Auteur : ChatGPT (assisté par l'équipe)**

---

## 0. Historique des révisions

| Version | Date       | Auteur  | Commentaires                                 |
| ------- | ---------- | ------- | -------------------------------------------- |
| 0.1     | 19‑06‑2025 | ChatGPT | Première version complète pour revue interne |

---

## 1. Vision & High‑Level Concept

**Elevator pitch**

> Opération Gambit est un RPG d’espionnage autour d’un tournoi d’échecs international. Le joueur incarne un jeune agent‑joueur envoyé pour décrocher la victoire tout en déjouant les complots qui se trament en coulisses.

* **Genre** : Tactical RPG narratif + jeu d’échecs
* **Plateforme cible** : Web (navigateurs desktop et mobile)
* **Cible** : 15‑45 ans, amateurs de stratégie, joueurs d’échecs occasionnels à experts, fans de visual novels/RPG rétro
* **USP** :

  * Fusion originale d’un moteur d’échecs professionnel (Stockfish) avec un RPG narratif.
  * Système de « renseignement » permettant de trouver des faiblesses d’adversaires pour influer sur l’IA.
  * Coach intégré offrant un apprentissage adaptatif.

## 2. Gameplay

### 2.1 Boucle de jeu principale

1. **Exploration** d’un hub (hôtel, salle d’entraînement, coulisses) pour engager PNJ, récupérer infos.
2. **Préparation** : choix d’items/infos, briefing du coach.
3. **Match d’échecs** (partie classique ou à variante) contre IA.
4. **Débriefing** : coaching, récompenses, déblocage de scénarios.
5. **Progression** : XP « ELO narratif », nouvelles zones, montée en tension du tournoi.

### 2.2 Boucles secondaires

* **Espionnage léger** : mini‑missions à choix multiples (dialogue/objets) → octroient des « indices » appliqués comme malus au moteur d’IA (par ex. force de recherche limitée ou ouverture forcée).
* **Entraînement** : puzzles tactiques, relecture de parties avec conseils.
* **Relations PNJ** : affinité donnant bonus passifs (confiance, info, items).

### 2.3 Mécaniques détaillées

| Mécanique          | Description                                                                                | Futurs ajouts                              |
| ------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| **Match d’échecs** | Intégration Stockfish, niveaux ajustables (ELO 800→2400)                                   | Multijoueur P2P, variantes blitz, chess960 |
| **Infos/indicies** | Buffs/Debuffs injectés au moteur : profondeur réduite, ouverture imposée, temps réduit     | Mini‑jeux d’infiltration temps réel        |
| **Coach IA**       | Analyse rapide via Stockfish + heuristiques pour feedback clair (erreurs, coups critiques) | Modèle LLM pour explications naturelles    |
| **Progression**    | Points de « Classement » + badges pour missions clés                                       | Classement en ligne, tournois saisonniers  |

### 2.4 Conditions de victoire/défaite

* **Victoire globale** : gagner la finale du tournoi ou réussir l’objectif d’espionnage critique.
* **Échec** : élimination du tournoi OU menace non contrecarrée.
* Checkpoints après chaque ronde pour éviter frustration.

## 3. Narration

### 3.1 Synopsis

Année 2032. Dans la cité‑état de **Neo‑Geneva**, un open d’échecs sert de couverture à une guerre d’influence entre mégacorps. Le protagoniste (codename **« Gambit »**) doit remporter le titre ET subtiliser des informations sensibles.

### 3.2 Structure

| Acte             | Contenu                                                    | Lieux principaux             |
| ---------------- | ---------------------------------------------------------- | ---------------------------- |
| I. Préliminaires | Arrivée, installation, premiers matchs, découverte complot | Hall, lobby, parc            |
| II. Ascension    | Espionnage actif, rivaux coriaces, dilemmes moraux         | Etages VIP, backroom serveur |
| III. Dévoilement | Demi‑finale, sabotage, confrontation                       | Rooftop, salle secrète       |
| IV. Finale       | Match ultime, choix clé (espionnage vs victoire sportive)  | Arène principale             |

### 3.3 Personnages clés

| Nom                 | Rôle         | Style d’échecs          | Traits             |
| ------------------- | ------------ | ----------------------- | ------------------ |
| **Gambit** (joueur) | Protagoniste | Variable                | Curieux, adaptable |
| **Coach “Sage”**    | Mentor IA    | Défense solide          | Pédagogue          |
| **Viktor Dragunov** | Rival #1     | Attaque agressive       | Arrogant, impulsif |
| **Amira al‑Nasser** | Rival #2     | Stratégie positionnelle | Calme, mystérieuse |
| **Dr. Kessler**     | Antagoniste  | N/A (scientifique)      | Froid, calculateur |

## 4. World & Level Design

| Zone                     | Contenu clé                     | Interactions       |
| ------------------------ | ------------------------------- | ------------------ |
| **Lobby / Hub**          | PNJ joueurs, tableau des matchs | Info, quêtes       |
| **Salle d’entraînement** | Analyse PGN, puzzles            | Coaching           |
| **Backstage tech**       | Terminaux, gardes               | Espionnage         |
| **Arène**                | Parties officielles             | Matchs, cut‑scenes |

Chaque zone est une **grille 2D 32×32 px** style GBA. Colliders simples et chemin critique balisé.

## 5. Interface & UX

* **Vue exploration** : camera fixe top‑down, ZQSD/Click pour déplacement.
* **UI board** : échiquier 640 px, pièces pixel‑art, annotation flèches rouges/vertes.
* **HUD** : timer, score, bouton « Indice ».
* **Dialogues** : boîtes type VN, portraits, choix à 2‑3 options.

## 6. Art Direction

* **Palette** : tons néon + pastels doux, rappelle espionnage futuriste.
* **Personnages** : pixel‑art 48×48, 4 frames anim.
* **Effets** : particules simples (glow, sparks lors coups critiques).
* Références : Advance Wars, Chessformer.

## 7. Audio

* **OST** : électro‑jazz downtempo pour exploration, tension orchestral‑synth pour matchs.
* **SFX** : clic pièces, notifications UI, ambiance foule.
* **Voix** : ponctuelles (prises de vues), futur ajout doublage complet.

## 8. Technique

### 8.1 Stack

* **Frontend** : React + Vite + Zustand store.
* **Backend** : FastAPI + PostgreSQL + WebSocket pour temps réel.
* **Échecs** : Stockfish 16 via python‑chess.
* **Infra** : Docker‑compose dev, k8s cible prod.

### 8.2 Performance

* Cible : 60 FPS sur laptops modestes.
* Charge : ≤100 ms RTT pour coups WebSocket.

### 8.3 Sécurité

* Auth JWT, BCrypt hash.
* RGPD : consentement tracking analytics.

## 9. IA & Scripts

* **Moteur d’échecs** : profondeur ajustée (skillLevel 0‑20).
* **Scripting dialogues** : arbre JSON, nœuds avec conditions variables globales.
* **PNJ pathfinding** : A\* grille.

## 10. Progression & Economie

* **Devise** : points « Influence » dépensés pour indices.
* **Gains** : victoire, mini‑missions.
* Pas de monétisation pour MVP, envisager cosmétiques à terme.

## 11. Accessibilité

* Contraste WCAG AA.
* Option daltonisme : palette alternative.
* Sous‑titres, text‑to‑speech roadmap.

## 12. Production

### 12.1 Planning macro (résumé)

| Phase             | Durée  | Livrables              |
| ----------------- | ------ | ---------------------- |
| Prototype système | 3 sem. | Board + dialogues mock |
| MVP Alpha         | 6 sem. | 1er acte jouable       |
| Beta fermée       | 4 sem. | 3 actes, équilibrage   |
| Release 1.0       | 2 sem. | Finale + polish        |

### 12.2 Risques & mitigation

| Risque                    | Impact | Plan                            |
| ------------------------- | ------ | ------------------------------- |
| Intégration Stockfish/web | High   | Prototyper early, fallback WASM |
| Sur‑scope narration       | Medium | Découper actes, gel contenu MVP |
| Performance mobile        | Medium | Profiler sprites, lazy‑load     |

## 13. KPIs succès

* Taux de complétion Acte I > 70 %
* NPS > 50
* Taux d’erreur crash < 2 %

---

## 14. Annexes

* Glossaire échecs
* Liens ressources open‑source
* Table des indices & effets exacts
### Glossaire échecs

- **Échecs** : Jeu de stratégie opposant deux joueurs sur un plateau de 64 cases.
- **Roi** : Pièce la plus importante, sa capture signifie la fin de la partie.
- **Dame** : Pièce la plus puissante, pouvant se déplacer dans toutes les directions.
- **Tour** : Pièce se déplaçant en ligne droite horizontalement ou verticalement.
- **Fou** : Pièce se déplaçant en diagonale.
- **Cavalier** : Pièce se déplaçant en forme de "L".
- **Pion** : Pièce la plus nombreuse, se déplaçant principalement vers l'avant.
- **Échec** : Situation où le roi est menacé de capture au prochain coup.
- **Échec et mat** : Situation où le roi est en échec et ne peut pas s'échapper, fin de la partie.
- **Pat** : Situation de match nul où le joueur n'a aucun coup légal mais n'est pas en échec.
- **Roque** : Coup spécial impliquant le roi et une tour pour améliorer la sécurité du roi.
- **Promotion** : Transformation d'un pion arrivé à la dernière rangée en une autre pièce.
- **Capture en passant** : Coup spécial où un pion peut capturer un pion adverse qui vient de faire un double pas.
- **Notation algébrique** : Système de notation des coups d'échecs utilisé pour enregistrer les parties.
