// src/game/gameLogic.ts

/**
 * Check if the given symbol has won the game.
 * Returns true if the player with the symbol wins.
 */
export function checkWin (board: string[][], symbol: 'X' | 'O'): boolean {
  // Check rows and columns
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] === symbol &&
      board[i][1] === symbol &&
      board[i][2] === symbol
    )
      return true
    if (
      board[0][i] === symbol &&
      board[1][i] === symbol &&
      board[2][i] === symbol
    )
      return true
  }
  // Check diagonals
  if (
    board[0][0] === symbol &&
    board[1][1] === symbol &&
    board[2][2] === symbol
  )
    return true
  if (
    board[0][2] === symbol &&
    board[1][1] === symbol &&
    board[2][0] === symbol
  )
    return true

  return false
}

/**
 * Check if the board is completely filled with no winner.
 * Returns true if the game is a draw.
 */
export function checkDraw (board: string[][]): boolean {
  return board.every(row => row.every(cell => cell !== ''))
}
