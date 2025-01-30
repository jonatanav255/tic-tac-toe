export interface GameState {
  board: string[][]
  currentPlayer: 'X' | 'O'
  players: WebSocket[]
  winner: 'X' | 'O' | 'Draw' | null
}
