import { applyMove } from './engine.js';

console.log("=== DÉBUT DES TESTS UNITAIRES ===");

// État initial fictif pour le test
const testState = {
    status: "EnCours",
    currentPlayer: "south",
    scores: { north: 0, south: 0 },
    board: {
        north: [5, 5, 5, 5, 5, 5, 5],
        south: [5, 5, 5, 5, 5, 5, 5]
    }
};

const coupTest = { player: "south", index: 0 };

try {
    console.log("Test 1: Jouer un coup pour le Sud à l'index 0");
    const reponse = applyMove(testState, coupTest);
    
    console.log("Nouvel état généré :", reponse.state);
    
    if (reponse.state.board.south[0] === 0) {
        console.log("✅ SUCCÈS : La case S0 a bien été vidée.");
    } else {
        console.error("❌ ÉCHEC : La case S0 n'a pas été vidée.");
    }
} catch (e) {
    console.error("Erreur critique lors du test :", e);
}

console.log("=== FIN DES TESTS ===");