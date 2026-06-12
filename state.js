import { RULES } from './constants.js';

export function createGame(startingPlayer = "south") {
  return {
    board: {
      north: Array(RULES.pitsPerPlayer).fill(RULES.initialSeedsPerPit),
      south: Array(RULES.pitsPerPlayer).fill(RULES.initialSeedsPerPit)
    },
    scores: { north: 0, south: 0 },
    currentPlayer: startingPlayer,
    status: "playing",
    winner: null,
    reason: null,
    moveNumber: 0,
    history: []
  };
}

export function other(player) {
  return player === "north" ? "south" : "north";
}

export function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

export function boardSeeds(state) {
  return sum(state.board.north) + sum(state.board.south);
}

export function totalSeeds(state) {
  return state.scores.north + state.scores.south + boardSeeds(state);
}

export function attackPit(player) {
  return player === "north"
    ? { player: "north", pitIndex: 6 }
    : { player: "south", pitIndex: 0 };
}

export function opponentFirstPit(player) {
  return player === "north"
    ? { player: "south", pitIndex: 6 }
    : { player: "north", pitIndex: 0 };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}