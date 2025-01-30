import { WebSocket } from 'ws';

export interface GameState {
  board: string[][];
  currentPlayer: 'X' | 'O';
  players: WebSocket[]; // Ensure it's the ws WebSocket
  winner: 'X' | 'O' | 'Draw' | null;
}
