import { samePosition, opponentPath } from './coordinates.js';
import { other, opponentFirstPit } from './state.js';

export function isCaptureValue(seedCount) {
  return seedCount === 2 || seedCount === 3 || seedCount === 4;
}

export function canStartCapture(state, player, lastPosition) {
  const opponent = other(player);
  if (lastPosition.player !== opponent) return false;
  if (samePosition(lastPosition, opponentFirstPit(player))) return false;
  
  const count = state.board[lastPosition.player][lastPosition.pitIndex];
  return isCaptureValue(count);
}

export function captureChainPositions(state, player, lastPosition) {
  const path = opponentPath(player);
  const lastIndex = path.findIndex(position => samePosition(position, lastPosition));
  
  if (lastIndex <= 0) return [];
  
  const captured = [];
  for (let index = lastIndex; index >= 0; index--) {
    const position = path[index];
    const count = state.board[position.player][position.pitIndex];
    
    if (!isCaptureValue(count)) break;
    
    captured.push({
      player: position.player,
      pitIndex: position.pitIndex,
      seeds: count
    });
  }
  
  return captured;
}

export function wouldEmptyOpponent(state, player, captureList) {
  const opponent = other(player);
  const remaining = [...state.board[opponent]];
  
  for (const capture of captureList) {
    remaining[capture.pitIndex] -= capture.seeds;
  }
  
  return remaining.reduce((total, seeds) => total + seeds, 0) === 0;
}

export function applyCaptureIfAllowed(state, player, captureList) {
  if (captureList.length === 0) return 0;
  if (wouldEmptyOpponent(state, player, captureList)) return 0;
  
  let total = 0;
  for (const capture of captureList) {
    state.board[capture.player][capture.pitIndex] -= capture.seeds;
    total += capture.seeds;
  }
  
  state.scores[player] += total;
  return total;
}

export function resolveCaptures(state, player, sowingResult) {
  if (sowingResult.specialCapture > 0) {
    state.scores[player] += sowingResult.specialCapture;
    return { captured: sowingResult.specialCapture, type: "special-granary" };
  }
  
  const last = sowingResult.lastPosition;
  if (!canStartCapture(state, player, last)) return { captured: 0, type: "none" };
  
  const captureList = captureChainPositions(state, player, last);
  const captured = applyCaptureIfAllowed(state, player, captureList);
  
  return {
    captured: captured,
    type: captured > 0 ? (captureList.length > 1 ? "chain" : "normal") : "none"
  };
}