# Jeu de Songo - Projet Académique (Déploiement Local XAMPP)

Ce projet propose une implémentation web interactive du **Songo**, jeu traditionnel d'Afrique Centrale (famille des Mancalas). Développé sous forme d'application web modulaire, le projet comprend une version locale (Joueur contre Joueur / Joueur contre IA) et une version distante en réseau.

L'ensemble de l'application est configuré pour un **déploiement et une exécution en environnement local strict** via la suite logicielle **XAMPP**.

---

## 🚀 Modes de Jeu Disponibles

1. **Mode Local (Même PC) :** Deux joueurs humains s'affrontent à tour de rôle sur le même écran.
2. **Mode Contre l'IA (Machine) :** Un joueur humain (SUD) affronte un algorithme automatisé autonome (NORD).
3. **Mode Distant (Réseau Local) :** Deux joueurs s'affrontent depuis deux navigateurs/ordinateurs distincts connectés au serveur local PHP de XAMPP via des requêtes AJAX (API Fetch).

---

## 📂 Architecture des Fichiers

```text
SONGO/
├── index.html              # Page d'accueil (Sélection des modes de jeu)
├── jeu.html                # Plateau de jeu (Interface en bois, scores et logs)
├── serveur.php             # Backend PHP (Gestion de l'état réseau et synchronisation)
├── style.css               # Design global du plateau, des graines et de l'interface
└── js/
    ├── local.js            # Moteur de jeu local et algorithme de l'IA autonome
    ├── distant.js          # Client réseau (Requêtes asynchrones Fetch vers serveur.php)
    └── core/               # Noyau logique partagé (Modules ES6)
        ├── capture.js      # Algorithme de vérification et calcul des prises (2, 3 ou 4 graines)
        ├── constants.js    # Variables immuables (Configuration du tableau initial)
        ├── coordinates.js  # Calculs des positions sur le plateau de bois
        ├── moves.js        # Logique d'égrainage et de distribution des pions
        ├── sowing.js       # Gestion de la boucle de distribution des graines
        └── state.js        # Structure du gestionnaire d'état global (gameState)
        
# Jeu de Songo - Projet Académique (Déploiement Local XAMPP)

Ce projet propose une implémentation web interactive du **Songo**, jeu traditionnel d'Afrique Centrale (famille des Mancalas). Développé sous forme d'application web modulaire, le projet comprend une version locale (Joueur contre Joueur / Joueur contre IA) et une version distante en réseau.

L'ensemble de l'application est configuré pour un **déploiement et une exécution en environnement local strict** via la suite logicielle **XAMPP**.

---

## 🚀 Modes de Jeu Disponibles

## Environnement Utiiser

1. **Serveur :** Apache (inckut dans XAMPP).
2. **Navigateur :** Google Chrome, Mozilla Firefox, etc
3. **Langages Utilises :** HTML, CSS, JavaScript, et PHP

## Demarrage des services 
1. **Ouvrez le panneau de controle XAMPP
2. **Cliquez sur Apache, puis sur Start pour active le web local sur le port 80
3. Accès à l'Application
Ouvrez votre navigateur web et saisissez l'adresse URL locale suivante :
http://localhost/songo/index.html

⚙️ Spécifications Techniques du Songo Implémenté

Le projet respecte les règles officielles et les décisions d'harmonisation académiques de la variante camerounaise (Ewondo/Bulu) :
Structure : 14 cases circulaires au total (7 par joueur).
Configuration : 5 graines initiales par case au démarrage de la partie (total de 70 graines sur le jeu).
Condition de Victoire : Le seuil de victoire standard est fixé dès qu'un joueur réussit à capturer un minimum de 36 graines (la fin de partie s'affiche alors via une boîte modale de fin).
Règles d'égrainage : Distribution continue une à une. Les captures ne s'effectuent que dans le camp adverse si le nombre final de graines d'une case après distribution est égal à 2, 3 ou 4 pions.