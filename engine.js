// js/core/engine.js

export function applyMove(currentState, coup) {
    let newState = JSON.parse(JSON.stringify(currentState));
    const player = coup.player;
    const index = coup.index;
    
    if (!newState.board[player] || newState.board[player][index] === undefined) {
        return { state: currentState, resultat: { message: "Case non valide." } };
    }
    
    if (newState.board[player][index] === 0) {
        return { state: currentState, resultat: { message: "La case sélectionnée est vide !" } };
    }

    let seeds = newState.board[player][index];
    newState.board[player][index] = 0;

    // Ordre de distribution anti-horaire complet du Songo (14 cases)
    let sequence = [
        { p: 'north', i: 0 }, { p: 'north', i: 1 }, { p: 'north', i: 2 },
        { p: 'north', i: 3 }, { p: 'north', i: 4 }, { p: 'north', i: 5 }, { p: 'north', i: 6 },
        { p: 'south', i: 6 }, { p: 'south', i: 5 }, { p: 'south', i: 4 },
        { p: 'south', i: 3 }, { p: 'south', i: 2 }, { p: 'south', i: 1 }, { p: 'south', i: 0 }
    ];

    let currentPos = sequence.findIndex(item => item.p === player && item.i === index);
    const startPos = currentPos;

    while (seeds > 0) {
        currentPos = (currentPos + 1) % sequence.length;
        if (currentPos === startPos) continue; 

        const target = sequence[currentPos];
        newState.board[target.p][target.i]++;
        seeds--;
    }

    // Capture standard (2, 3 ou 4 graines) dans le camp opposé
    const finalTarget = sequence[currentPos];
    const opponent = (player === 'south') ? 'north' : 'south';

    if (finalTarget.p === opponent) {
        let finalSeeds = newState.board[finalTarget.p][finalTarget.i];
        if (finalSeeds === 2 || finalSeeds === 3 || finalSeeds === 4) {
            newState.scores[player] += finalSeeds;
            newState.board[finalTarget.p][finalTarget.i] = 0;
        }
    }

    // Seuil de victoire fixé à 40 points (selon le PDF)
    if (newState.scores.south >= 40 || newState.scores.north >= 40) {
        newState.status = "Terminee";
    } else {
        newState.currentPlayer = (player === 'south') ? 'north' : 'south';
    }

    return { state: newState, resultat: { message: "Coup joué avec succès" } };
}