import { RULES } from './constants.js';
import { attackPit, other, cloneState } from './state.js';
import { sow } from './sowing.js';
import { canStartCapture, resolveCaptures } from './capture.js';

export function isAttackPitMove(player, pitIndex) {
  const attack = attackPit(player);
  return attack.player === player && attack.pitIndex === pitIndex;
}

export function isForbiddenAttackMove(state, player, pitIndex) {
  if (!isAttackPitMove(player, pitIndex)) return false;
  const seeds = state.board[player][pitIndex];
  if (seeds === 1) return true;
  if (seeds === 2) return !wouldMoveCapture(state, player, pitIndex);
  return false;
}

function wouldMoveCapture(state, player, pitIndex) {
  const simulated = cloneState(state);
  const sowing = sow(simulated, player, pitIndex);
  if (sowing.specialCapture > 0) return true;
  return canStartCapture(simulated, player, sowing.lastPosition);
}

export function ownNonEmptyMoves(state, player) {
  const moves = [];
  for (let i = 0; i < RULES.pitsPerPlayer; i++) {
    if (state.board[player][i] > 0) moves.push({ player, pitIndex: i });
  }
  return moves;
}

export function opponentCampIsEmpty(state, player) {
  const opponent = other(player);
  return state.board[opponent].reduce((total, s) => total + s, 0) === 0;
}

export function countDeliveredToOpponent(state, player, pitIndex) {
  const simulated = cloneState(state);
  const opponent = other(player);
  const before = simulated.board[opponent].reduce((total, s) => total + s, 0);
  sow(simulated, player, pitIndex);
  const after = simulated.board[opponent].reduce((total, s) => total + s, 0);
  return after - before;
}

export function getValidMoves(state, player) {
  const candidates = ownNonEmptyMoves(state, player);
  return candidates;
    return candidates.filter(move => !isForbiddenAttackMove(state, player, move.pitIndex));
}

export function playTurn(state, pitIndex) {
  const player = state.currentPlayer;
  const validMoves = getValidMoves(state, player);
  const isMoveValid = validMoves.some(move => move.pitIndex === pitIndex);
  
  if (!isMoveValid) throw new Error("Coup illégal ou non conforme aux règles de solidarité.");
  
  const chosenMove = validMoves.find(move => move.pitIndex === pitIndex);
  
  if (chosenMove && chosenMove.forcedDonation) {
    const opponent = other(player);
    const seeds = state.board[player][pitIndex];
    state.board[player][pitIndex] = 0;
    state.scores[opponent] += seeds;
    state.currentPlayer = opponent;
    state.moveNumber++;
    return { type: "forced-donation", seeds };
  }
  
  const sowingResult = sow(state, player, pitIndex);
  resolveCaptures(state, player, sowingResult);
  state.currentPlayer = other(player);
  state.moveNumber++;
}