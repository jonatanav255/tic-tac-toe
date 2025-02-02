// src/game/gameManager.ts

import { WebSocket } from 'ws'
import { GameState } from '../types/gameState'
import { checkWin, checkDraw } from './gameLogic'
import pgClient from '../db'

export class GameManager {
  gameState: GameState

  constructor () {
    this.gameState = {
      board: Array(3)
        .fill(null)
        .map(() => Array(3).fill('')),
      currentPlayer: 'X',
      players: [],
      winner: null
    }
  }

  /**
   * Broadcasts a message (object) to all connected players.
   */
  broadcast (message: object): void {
    this.gameState.players.forEach(player =>
      player.send(JSON.stringify(message))
    )
  }

  /**
   * Processes a player's move.
   */
  processMove (ws: WebSocket, row: number, col: number): void {
    const playerIndex = this.gameState.players.indexOf(ws)
    const playerSymbol: 'X' | 'O' = playerIndex === 0 ? 'X' : 'O'

    // Validate turn
    if (playerSymbol !== this.gameState.currentPlayer) {
      ws.send(JSON.stringify({ type: 'error', message: "It's not your turn!" }))
      return
    }

    // Validate cell occupancy
    if (this.gameState.board[row][col] !== '') {
      ws.send(
        JSON.stringify({ type: 'error', message: 'Cell is already occupied!' })
      )
      return
    }

    // Place the move
    this.gameState.board[row][col] = playerSymbol

    // Check for win
    if (checkWin(this.gameState.board, playerSymbol)) {
      this.gameState.winner = playerSymbol
      this.broadcast({
        type: 'gameOver',
        winner: playerSymbol,
        board: this.gameState.board
      })

      pgClient
        .query('INSERT INTO game_winners (winner) VALUES ($1)', [playerSymbol])
        .then(() => console.log(`Game result saved: winner ${playerSymbol}`))
        .catch(err => console.error('Error saving game result:', err))

      return
    }

    // Check for a draw
    if (checkDraw(this.gameState.board)) {
      this.gameState.winner = 'Draw'
      this.broadcast({
        type: 'gameOver',
        winner: 'Draw',
        board: this.gameState.board
      })
      return
    }

    // Toggle turn and broadcast update
    this.gameState.currentPlayer = playerSymbol === 'X' ? 'O' : 'X'
    this.broadcast({
      type: 'update',
      board: this.gameState.board,
      currentPlayer: this.gameState.currentPlayer
    })
  }

  /**
   * Reset the game state, typically after a disconnect.
   */
  resetGame (): void {
    this.gameState.board = Array(3)
      .fill(null)
      .map(() => Array(3).fill(''))
    this.gameState.currentPlayer = 'X'
    this.gameState.winner = null
  }
}
