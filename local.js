// ==========================================
//      GESTION DU JEU - MODE LOCAL & IA
// ==========================================

import { playTurn } from './core/moves.js';

// --- DETECTION DU MODE IA ---
const urlParamsLocal = new URLSearchParams(window.location.search);
const isVsMachine = urlParamsLocal.get('mode') === 'ia';

// Sécurité pour empêcher l'humain de cliquer pendant la réflexion de la machine
let iaEnTrainDeJouer = false;

// État initial du jeu Songo
let gameState = {
  status: "EnCours",
  currentPlayer: "south", // Le joueur SUD commence généralement
  scores: { north: 0, south: 0 },
  board: {
    north: [5, 5, 5, 5, 5, 5, 5],
    south: [5, 5, 5, 5, 5, 5, 5]
  }
};

// Fonction pour ajouter une ligne textuelle dans l'historique en bas
function ajouterAuLog(texte) {
  const historyDiv = document.getElementById("game-history");
  if (historyDiv) {
    const log = document.createElement("div");
    log.className = "history-log";
    log.textContent = texte;
    historyDiv.appendChild(log);
    historyDiv.scrollTop = historyDiv.scrollHeight; // Défilement automatique vers le bas
  }
}

// Met à jour l'affichage : chiffres centrés et greniers aux extrémités
function updateUI(state) {
  // 1. Mise à jour des 14 cases circulaires du tablier central
  document.querySelectorAll(".pit").forEach(pit => {
    const player = pit.getAttribute("data-player");
    const index = parseInt(pit.getAttribute("data-index"), 10);
    const seedsCount = state.board[player][index];
    
    const txtSpan = pit.querySelector(".seeds");
    if (txtSpan) {
      txtSpan.textContent = seedsCount;
    }
  });

  // 2. Mise à jour des scores dans les greniers d'extrémités
  const scoreNorth = document.getElementById("score-north");
  const scoreSouth = document.getElementById("score-south");
  if (scoreNorth) scoreNorth.textContent = state.scores.north;
  if (scoreSouth) scoreSouth.textContent = state.scores.south;

  // 3. Mise à jour du message indicateur de tour
  const currentPlayerSpan = document.getElementById("current-player");
  if (currentPlayerSpan) {
    // Si c'est au tour du Nord et qu'on est contre la machine, on affiche "ORDINATEUR"
    if (isVsMachine && state.currentPlayer === "north") {
      currentPlayerSpan.textContent = "ORDINATEUR (IA)";
    } else {
      currentPlayerSpan.textContent = state.currentPlayer.toUpperCase();
    }
    currentPlayerSpan.style.color = (state.currentPlayer === "south") ? "#2ecc71" : "#3498db";
  }
}

/**
 * Logique unifiée d'exécution d'un tour (Humain ou Machine)
 */
function gererLeCoup(player, index, isIaCall = false) {
  // Sécurités de jeu de base
  if (gameState.status === "Terminee") return;
  
  // Bloquer l'humain si l'ordinateur calcule son coup
  if (iaEnTrainDeJouer && !isIaCall) return;

  if (player !== gameState.currentPlayer) {
    if (!isIaCall) alert("Ce n'est pas votre tour de jouer !");
    return;
  }
  if (gameState.board[player][index] === 0) {
    if (!isIaCall) alert("Cette case est vide ! Choisissez une autre case.");
    return;
  }

  // Interdire à l'humain de cliquer sur les cases du Nord si le mode IA est actif
  if (isVsMachine && player === 'north' && !isIaCall) {
    alert("C'est à l'ordinateur de jouer sur ces cases !");
    return;
  }

  try {
    const nomAfficheur = (isVsMachine && player === 'north') ? "L'ORDINATEUR (IA)" : player.toUpperCase();
    
    // Appel de la fonction logique importée du Songo (distribution et capture)
    playTurn(gameState, index);
    
    // Ajout de l'action dans le panneau de l'historique
    ajouterAuLog(`${nomAfficheur} a joué la case numéro ${index + 1}.`);

    // Condition de fin de partie standard
    if (gameState.scores.north >= 36 || gameState.scores.south >= 36) {
      gameState.status = "Terminee";
    }

    // Rafraîchissement visuel du plateau
    updateUI(gameState);

    // Si la partie se termine, on déclenche la pop-up
    if (gameState.status === "Terminee") {
      afficherPopUpFinLocal(gameState.scores.north, gameState.scores.south);
      return;
    }

    // ====================================================
    // ACCROCHAGE DE L'IA (NORD) AUTOMATIQUE
    // ====================================================
    if (isVsMachine && gameState.currentPlayer === 'north') {
      
      // L'IA analyse ses cases pour trouver celles contenant des graines
      let casesDisponibles = [];
      gameState.board.north.forEach((graines, idx) => {
        if (graines > 0) {
          casesDisponibles.push(idx);
        }
      });

      if (casesDisponibles.length > 0) {
        // Choix d'une case aléatoire parmi les coups valides
        const indexChoisi = casesDisponibles[Math.floor(Math.random() * casesDisponibles.length)];
        
        // Verrouillage du plateau
        iaEnTrainDeJouer = true;

        // Délai de 900ms pour simuler le temps de réflexion
        setTimeout(() => {
          iaEnTrainDeJouer = false;
          
          // L'IA lance directement la logique de jeu
          gererLeCoup('north', indexChoisi, true);
        }, 900);
      }
    }

  } catch (error) {
    console.error(error);
    alert("Coup impossible ou invalide : " + error.message);
  }
}

// Assigner la fonction aux clics des boutons physiques du plateau
document.querySelectorAll(".pit").forEach(pit => {
  pit.addEventListener("click", () => {
    const player = pit.getAttribute("data-player");
    const index = parseInt(pit.getAttribute("data-index"), 10);
    
    // Appel du gestionnaire de coup pour l'action humaine
    gererLeCoup(player, index, false);
  });
});

// Affiche la pop-up de fin de partie au centre du plateau local
function afficherPopUpFinLocal(scoreN, scoreS) {
  const modal = document.getElementById("end-game-modal");
  const msg = document.getElementById("modal-message");
  const txt = document.getElementById("modal-scores");
  if (!modal) return;

  if (scoreN === scoreS) {
    msg.textContent = "Match nul ! Égalité parfaite.";
    msg.style.color = "#f39c12";
  } else if (scoreN > scoreS) {
    msg.textContent = isVsMachine ? "L'Ordinateur (IA) remporte la partie ! 🤖" : "Le joueur NORD remporte la partie ! 🏆";
    msg.style.color = "#3498db";
  } else {
    msg.textContent = "Le joueur SUD remporte la partie ! 🏆";
    msg.style.color = "#2ecc71";
  }

  if (txt) txt.innerHTML = `Scores - Nord : <b>${scoreN}</b> | Sud : <b>${scoreS}</b>`;
  modal.style.display = "flex";
}

// Gestion des clics sur les boutons de la boîte modale de fin de partie
document.addEventListener("click", (e) => {
  const modal = document.getElementById("end-game-modal");
  if (!e.target) return;

  // Bouton "Nouvelle partie"
  if (e.target.id === "modal-btn-replay") {
    if (modal) modal.style.display = "none";
    
    // Réinitialisation complète de l'état
    gameState.board = { north: [5, 5, 5, 5, 5, 5, 5], south: [5, 5, 5, 5, 5, 5, 5] };
    gameState.scores = { north: 0, south: 0 };
    gameState.currentPlayer = "south";
    gameState.status = "EnCours";
    
    const historyDiv = document.getElementById("game-history");
    if (historyDiv) {
      historyDiv.innerHTML = isVsMachine 
        ? '<div class="history-log">Partie contre l\'IA lancée. Bon jeu !</div>' 
        : '<div class="history-log">Nouvelle partie locale lancée. Bon jeu !</div>';
    }
    
    updateUI(gameState);
  }

  // Bouton "Revoir le plateau"
  if (e.target.id === "modal-btn-close") {
    if (modal) modal.style.display = "none";
  }

  // Bouton "Quitter"
  if (e.target.id === "modal-btn-quit") {
    window.location.href = "index.html"; // Redirection vers le menu principal
  }
});

// Bouton rouge « Réinitialiser la partie » situé sous le plateau de bois
const btnResetPlateau = document.getElementById("btn-reset");
if (btnResetPlateau) {
  btnResetPlateau.addEventListener("click", () => {
    gameState.board = { north: [5, 5, 5, 5, 5, 5, 5], south: [5, 5, 5, 5, 5, 5, 5] };
    gameState.scores = { north: 0, south: 0 };
    gameState.currentPlayer = "south";
    gameState.status = "EnCours";
    
    const historyDiv = document.getElementById("game-history");
    if (historyDiv) historyDiv.innerHTML = '<div class="history-log">Le plateau de jeu a été réinitialisé.</div>';
    
    updateUI(gameState);
  });
}

// Premier affichage au chargement de la page
updateUI(gameState);