import { nextPositionsAfter, opponentPath, samePosition } from './coordinates.js';
import { opponentFirstPit } from './state.js';

export function sowNormal(state, player, pitIndex) {
  const seeds = state.board[player][pitIndex];
  const source = { player, pitIndex };
  const visited = [];

  state.board[player][pitIndex] = 0;
  const path = nextPositionsAfter(source);

  for (let i = 0; i < seeds; i++) {
    const position = path[i];
    state.board[position.player][position.pitIndex] += 1;
    visited.push(position);
  }

  return {
    visited,
    lastPosition: visited[visited.length - 1],
    specialCapture: 0
  };
}

export function sowGranary(state, player, pitIndex) {
  const seeds = state.board[player][pitIndex];
  const source = { player, pitIndex };
  const visited = [];
  let remaining = seeds;
  let specialCapture = 0;

  state.board[player][pitIndex] = 0;

  const fullCirclePath = nextPositionsAfter(source);
  for (const position of fullCirclePath) {
    state.board[position.player][position.pitIndex] += 1;
    visited.push(position);
    remaining -= 1;
  }

  const path = opponentPath(player);
  for (let i = 0; i < remaining; i++) {
    const position = path[i % path.length];
    const isLastSeed = (i === remaining - 1);
    const isProtectedFirstPit = samePosition(position, opponentFirstPit(player));

    if (isLastSeed && isProtectedFirstPit) {
      specialCapture += 1;
      visited.push(position);
      continue;
    }

    state.board[position.player][position.pitIndex] += 1;
    visited.push(position);
  }

  return {
    visited,
    lastPosition: visited[visited.length - 1],
    specialCapture
  };
}

export function sow(state, player, pitIndex) {
  const seeds = state.board[player][pitIndex];
  if (seeds > 13) {
    return sowGranary(state, player, pitIndex);
  } else {
    return sowNormal(state, player, pitIndex);
  }
}