// js/game.js
import { applyMove } from './core/engine.js';

const urlParamsGame = new URLSearchParams(window.location.search);
const modeJeu = urlParamsGame.get('mode') || 'local'; 

let iaThinking = false;

// État du jeu conforme à la formalisation (14 cases, 5 graines, victoire à 40)
let gameState = {
    status: "EnCours",
    currentPlayer: "south", 
    scores: { north: 0, south: 0 },
    board: {
        north: [5, 5, 5, 5, 5, 5, 5],
        south: [5, 5, 5, 5, 5, 5, 5]
    }
};

export function initGame() {
    console.log("Songo initialisé en mode :", modeJeu);

    // Sélection large pour gérer à la fois la classe 'pit' ou 'case'
    const cases = document.querySelectorAll(".pit, .case, [data-player]");
    
    if (cases.length === 0) {
        console.error("Erreur critique : Aucune case détectée dans le HTML. Vérifie tes classes CSS.");
        return;
    }

    cases.forEach((pit, index) => {
        // Déduction automatique des attributs s'ils manquent dans le HTML
        let player = pit.getAttribute("data-player");
        let idxText = pit.getAttribute("data-index");

        if (!player || idxText === null) {
            // Ajustement si les cases sont simplement listées à la suite dans le HTML
            player = (index < 7) ? "north" : "south";
            let computedIndex = (index < 7) ? index : index - 7;
            pit.setAttribute("data-player", player);
            pit.setAttribute("data-index", computedIndex);
        }

        // Ajout de l'écouteur d'événement
        pit.style.cursor = "pointer";
        pit.addEventListener("click", (e) => {
            e.preventDefault();
            const targetPlayer = pit.getAttribute("data-player");
            const targetIndex = parseInt(pit.getAttribute("data-index"), 10);
            
            console.log(`Clic détecté sur : ${targetPlayer} ou index ${targetIndex}`);
            traiterActionUtilisateur(targetPlayer, targetIndex);
        });
    });

    updateUI(gameState);
}

function traiterActionUtilisateur(player, index, isIaAction = false) {
    if (gameState.status === "Terminee" || iaThinking) return;

    if (player !== gameState.currentPlayer) {
        if (!isIaAction) alert("Ce n'est pas votre tour de jouer !");
        return;
    }

    if (modeJeu === 'ia' && player === 'north' && !isIaAction) return;

    const coup = { player: player, index: index };
    const reponse = applyMove(gameState, coup);

    if (reponse.resultat.message !== "Coup joué avec succès") {
        if (!isIaAction) alert(reponse.resultat.message);
        return;
    }

    gameState = reponse.state;
    
    let nomJoueur = player.toUpperCase();
    if (modeJeu === 'ia' && player === 'north') nomJoueur = "L'ORDINATEUR (IA)";
    ajouterAuLog(`${nomJoueur} a joué la case ${(player === 'south' ? 'S' : 'N')}${index}.`);
    
    updateUI(gameState);

    if (gameState.status === "EnCours" && modeJeu === 'ia' && gameState.currentPlayer === "north") {
        ordonnerCoupMachine();
    }
}

function ordonnerCoupMachine() {
    iaThinking = true;
    let validIndices = [];
    gameState.board.north.forEach((seeds, idx) => {
        if (seeds > 0) validIndices.push(idx);
    });

    if (validIndices.length > 0) {
        const randomChoice = validIndices[Math.floor(Math.random() * validIndices.length)];
        setTimeout(() => {
            iaThinking = false;
            traiterActionUtilisateur('north', randomChoice, true);
        }, 800);
    } else {
        iaThinking = false;
    }
}

function updateUI(state) {
    const cases = document.querySelectorAll(".pit, .case, [data-player]");
    cases.forEach(pit => {
        const player = pit.getAttribute("data-player");
        const index = parseInt(pit.getAttribute("data-index"), 10);
        
        // Recherche d'un conteneur de texte interne ou mise à jour directe
        const txtSpan = pit.querySelector(".seeds, .graines, span");
        if (txtSpan) {
            txtSpan.textContent = state.board[player][index];
        } else {
            // Si pas de span, on remplace le texte brut directement
            pit.textContent = state.board[player][index];
        }
    });

    const scoreNorth = document.getElementById("score-north") || document.getElementById("score-nord");
    const scoreSouth = document.getElementById("score-south") || document.getElementById("score-sud");
    if (scoreNorth) scoreNorth.textContent = state.scores.north;
    if (scoreSouth) scoreSouth.textContent = state.scores.south;

    const currentPlayerSpan = document.getElementById("current-player") || document.getElementById("tour");
    if (currentPlayerSpan) {
        currentPlayerSpan.textContent = (modeJeu === "ia" && state.currentPlayer === "north") ? "ORDINATEUR (IA)" : state.currentPlayer.toUpperCase();
    }
}

function ajouterAuLog(texte) {
    const historyDiv = document.getElementById("game-history") || document.getElementById("historique");
    if (historyDiv) {
        const log = document.createElement("div");
        log.textContent = texte;
        historyDiv.appendChild(log);
        historyDiv.scrollTop = historyDiv.scrollHeight;
    }
}