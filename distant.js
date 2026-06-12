// ==========================================
//      GESTION DU JEU - MODE DISTANT CORRIGÉ
// ==========================================

let monRole = null;
const urlParams = new URLSearchParams(window.location.search);
monRole = urlParams.get('role'); // Lit le paramètre ?role=south ou ?role=north depuis l'URL

function ajouterAuLog(texte) {
  const historyDiv = document.getElementById("game-history");
  if (historyDiv) {
    const logsExistants = Array.from(historyDiv.querySelectorAll(".history-log")).map(el => el.textContent);
    if (!logsExistants.includes(texte)) {
      const log = document.createElement("div");
      log.className = "history-log";
      log.textContent = texte;
      historyDiv.appendChild(log);
      historyDiv.scrollTop = historyDiv.scrollHeight;
    }
  }
}

// Met à jour les valeurs affichées au centre exact des cases et les scores d'extrémités
function updateUI(state) {
  if (!state || !state.board) return;

  // Mise à jour des 14 cases circulaires
  document.querySelectorAll(".pit").forEach(pit => {
    const player = pit.getAttribute("data-player");
    const index = parseInt(pit.getAttribute("data-index"), 10);
    
    if (state.board[player]) {
      const txtSpan = pit.querySelector(".seeds");
      if (txtSpan) {
        txtSpan.textContent = state.board[player][index];
      }
    }
  });

  // Mise à jour des scores aux deux extrémités (Greniers)
  const scoreNorth = document.getElementById("score-north");
  const scoreSouth = document.getElementById("score-south");
  if (scoreNorth && state.scores) scoreNorth.textContent = state.scores.north;
  if (scoreSouth && state.scores) scoreSouth.textContent = state.scores.south;

  // Texte du tour
  const currentPlayerSpan = document.getElementById("current-player");
  if (currentPlayerSpan && state.currentPlayer) {
    if (state.currentPlayer === monRole) {
      currentPlayerSpan.textContent = "À VOUS DE JOUER (" + monRole.toUpperCase() + ")";
      currentPlayerSpan.style.color = "#2ecc71";
    } else {
      currentPlayerSpan.textContent = state.currentPlayer.toUpperCase() + " (En attente du coup...)";
      currentPlayerSpan.style.color = "#3498db";
    }
  }

  if (state.dernierCoup) {
    ajouterAuLog(state.dernierCoup);
  }
}

// ACTION : Rendre toutes les cases cliquables
document.querySelectorAll(".pit").forEach(pit => {
  pit.addEventListener("click", () => {
    const player = pit.getAttribute("data-player");
    const index = parseInt(pit.getAttribute("data-index"), 10);

    // Contrôle de sécurité : interdiction de cliquer sur les cases de l'adversaire
    if (player !== monRole) {
      alert("C'est le camp adverse ! Jouez sur vos cases.");
      return;
    }

    fetch("serveur.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=jouer&player=${monRole}&index=${index}`
    })
    .then(res => res.json())
    .then(state => {
      if (state.error) alert(state.error);
      else updateUI(state);
    })
    .catch(err => console.error("Erreur d'envoi du coup :", err));
  });
});

// Polling réseau sain (Evite la boucle infinie d'erreurs en cas de déconnexion)
function chargerEtatJeu() {
  fetch("serveur.php?action=get_state")
    .then(res => {
      if (!res.ok) throw new Error("Erreur HTTP");
      return res.json();
    })
    .then(state => {
      updateUI(state);
      if (state.status !== "Terminee") {
        setTimeout(chargerEtatJeu, 1000); // Rafraîchit toutes les secondes
      } else {
        afficherPopUpFinDistant(state.scores.north, state.scores.south);
      }
    })
    .catch(err => {
      console.warn("Vérification de la synchronisation réseau...", err);
      setTimeout(chargerEtatJeu, 2000); // Attend 2 secondes avant de retenter si le serveur coupe
    });
}

function afficherPopUpFinDistant(scoreN, scoreS) {
  const modal = document.getElementById("end-game-modal");
  const msg = document.getElementById("modal-message");
  const txt = document.getElementById("modal-scores");
  if (!modal) return;

  if (scoreN === scoreS) {
    msg.textContent = "Match nul !";
    msg.style.color = "#f39c12";
  } else if ((scoreN > scoreS && monRole === 'north') || (scoreS > scoreN && monRole === 'south')) {
    msg.textContent = "Victoire ! Vous gagnez la partie ! 🎉";
    msg.style.color = "#2ecc71";
  } else {
    msg.textContent = "Défaite... L'adversaire a gagné.";
    msg.style.color = "#e74c3c";
  }

  if (txt) txt.innerHTML = `Scores finaux - Nord : <b>${scoreN}</b> | Sud : <b>${scoreS}</b>`;
  modal.style.display = "flex";
}

// Événement pour les 3 boutons de la modale finale
document.addEventListener("click", (e) => {
  const modal = document.getElementById("end-game-modal");
  if (!e.target) return;

  if (e.target.id === "modal-btn-replay") {
    if (modal) modal.style.display = "none";
    fetch("serveur.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=reset"
    })
    .then(res => res.json())
    .then(() => {
      const historyDiv = document.getElementById("game-history");
      if (historyDiv) historyDiv.innerHTML = '<div class="history-log">Nouvelle partie réseau lancée.</div>';
      chargerEtatJeu();
    });
  }

  if (e.target.id === "modal-btn-close") {
    if (modal) modal.style.display = "none";
  }

  if (e.target.id === "modal-btn-quit") {
    window.location.href = "index.html";
  }
});

// Bouton réinitialiser sous le plateau
const btnReset = document.getElementById("btn-reset");
if (btnReset) {
  btnReset.addEventListener("click", () => {
    fetch("serveur.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=reset"
    })
    .then(res => res.json())
    .then(state => updateUI(state))
    .catch(err => console.error("Erreur réinitialisation :", err));
  });
}

// Lancement automatique du cycle
chargerEtatJeu();