# 📱 Energy Chess - Guide Android

## 🚀 Votre jeu est maintenant une app Android native !

### ✅ Ce qui a été fait :
- ✅ Conversion React → Android avec Capacitor
- ✅ Configuration native (StatusBar, SplashScreen, Vibrations)
- ✅ Scripts de build automatisés
- ✅ Icône personnalisée Energy Chess
- ✅ Optimisations mobile complètes
- ✅ Gestion du bouton retour Android

---

## 🛠️ Prérequis (première utilisation)

### 1. Installer Android Studio
```bash
# Télécharger depuis https://developer.android.com/studio
# Installer avec SDK Manager : Android 13+ (API 33+)
```

### 2. Configurer les variables d'environnement
```bash
# Ajouter à votre PATH Windows :
# C:\Users\VOTRE_UTILISATEUR\AppData\Local\Android\Sdk\platform-tools
# C:\Users\VOTRE_UTILISATEUR\AppData\Local\Android\Sdk\tools
```

---

## 🚀 Commandes rapides

### **Développement quotidien :**
```bash
cd frontend

# 🔨 Build + Sync (après modifications du code)
npm run mobile:build

# 📱 Lancer sur émulateur/téléphone
npm run mobile:run

# 🔧 Ouvrir Android Studio (pour config avancée)
npm run mobile:open
```

### **Live Reload (développement en temps réel) :**
```bash
# Développement avec recharge automatique
npm run mobile:live
# ⚠️ Votre téléphone et PC doivent être sur le même WiFi
```

---

## 📱 Lancer sur émulateur

### 1. Créer un émulateur Android
```bash
# Dans Android Studio : Tools > AVD Manager
# Create Virtual Device > Pixel 7 > Android 13
# ⚡ Recommandé : activer "Hardware Acceleration"
```

### 2. Lancer l'app
```bash
npm run mobile:run
# L'app se lance automatiquement sur l'émulateur ouvert
```

---

## 📲 Déployer sur votre téléphone Android

### 1. Activer le mode développeur
```
Réglages > À propos du téléphone > 
Taper 7 fois sur "Numéro de build"
```

### 2. Activer le débogage USB
```
Réglages > Options développeur > 
✅ Débogage USB
```

### 3. Connecter et autoriser
```bash
# Connecter téléphone en USB
# Autoriser le débogage sur le téléphone

# Vérifier la connexion :
adb devices
# Doit afficher votre appareil
```

### 4. Installer l'app
```bash
npm run mobile:run
# L'app s'installe et se lance automatiquement !
```

---

## 🎮 Fonctionnalités mobiles incluses

### ✨ **Capacitor intégré :**
- 📱 StatusBar personnalisée (couleur Energy Chess)
- 🎨 SplashScreen avec logo (2s)
- 📳 Vibrations tactiles natives
- ⬅️ Bouton retour Android géré
- 🔄 Orientation portrait/paysage

### 🎯 **Interface optimisée :**
- 👆 Touch events natifs
- 📱 Interface responsive complète
- 🎮 Vibrations sur actions de jeu
- ⚡ Performance native Android

---

## 🛠️ Commandes de maintenance

```bash
# Nettoyer et rebuilder complètement
npm run build
npm run mobile:sync

# Synchroniser uniquement (sans rebuild web)
npm run mobile:sync

# Ouvrir le projet Android dans Android Studio
npm run mobile:open
```

---

## 📦 Structure du projet Android

```
frontend/
├── android/                 # 📱 Projet Android natif
│   ├── app/
│   │   ├── src/main/assets/public/  # 🌐 Votre app React
│   │   └── AndroidManifest.xml      # ⚙️ Config Android
│   └── build.gradle
├── capacitor.config.json    # ⚙️ Config Capacitor
└── src/                     # 💻 Code React (inchangé)
```

---

## 🐛 Résolution des problèmes

### ❌ "Command not found: adb"
```bash
# Ajouter Android SDK platform-tools au PATH Windows
# Redémarrer PowerShell/CMD
```

### ❌ "No emulator found"
```bash
# Créer un émulateur dans Android Studio AVD Manager
# Ou lancer un émulateur existant avant npm run mobile:run
```

### ❌ "Device unauthorized"
```bash
# Débrancher/rebrancher le téléphone USB
# Accepter le débogage sur l'écran du téléphone
```

### ❌ Modifications non visibles
```bash
# Toujours faire npm run mobile:build après changement code
npm run mobile:build
```

---

## 🎯 Prochaines étapes

1. **Premier test :** `npm run mobile:run` sur émulateur
2. **Test téléphone :** Connecter votre Android et relancer
3. **Développement :** Utiliser `npm run mobile:live` pour itérer rapidement
4. **Publication :** Générer un APK signé avec Android Studio

---

## 🏆 **Votre Energy Chess est maintenant une vraie app Android !**

### 📱 Features incluses :
- ✅ Jeu d'échecs classique + Energy mode
- ✅ IA intelligente (3 niveaux)
- ✅ Interface mobile native optimisée
- ✅ Vibrations et feedback captile
- ✅ Mode portrait/paysage automatique
- ✅ Performance 60fps native

**Commande magique pour commencer :**
```bash
cd frontend && npm run mobile:run
```

🎮 **Amusez-vous bien avec votre Energy Chess Android !** ⚡♟️ 