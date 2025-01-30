import { createServer } from 'http'
import { WebSocketServer, WebSocket as WsWebSocket } from 'ws'
import { GameState } from './types/gameState'

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('WebSocket Server Running')
})

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocketServer({ server })

const gameState: GameState = {
  board: Array(3)
    .fill(null)
    .map(() => Array(3).fill('')),
  currentPlayer: 'X',
  players: [], // Explicitly typed as WebSocket[]
  winner: null
}

wss.on('connection', (ws: WsWebSocket) => {
  console.log('A new client connected')

  if (gameState.players.length < 2) {
    gameState.players.push(ws)
    const playerSymbol = gameState.players.length === 1 ? 'X' : 'O'

    ws.send(
      JSON.stringify({
        type: 'welcome',
        player: playerSymbol
      })
    )

    console.log(`Player ${playerSymbol} connected`)

    if (gameState.players.length === 2) {
      gameState.players.forEach(player => {
        player.send(
          JSON.stringify({
            type: 'start',
            board: gameState.board
          })
        )
      })
      console.log('Game started')
    }
  } else {
    // Reject extra connections
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'Game already full!'
      })
    )
    ws.close()
  }

  // Listen for messages from the client
  ws.on('message', message => {
    try {
      const data = JSON.parse(message.toString())

      // Validate the message structure
      if (
        !data.type || // Ensure 'type' exists
        data.type !== 'move' || // Ensure it's a 'move' type
        typeof data.row !== 'number' || // Ensure 'row' is a number
        typeof data.col !== 'number' || // Ensure 'col' is a number
        data.row < 0 ||
        data.row > 2 || // Check row bounds
        data.col < 0 ||
        data.col > 2 // Check col bounds
      ) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid message structure!'
          })
        )
        return
      }

      // Your existing move handling logic here
      const { row, col } = data
      const playerIndex = gameState.players.indexOf(ws)
      const playerSymbol = playerIndex === 0 ? 'X' : 'O'

      if (playerSymbol !== gameState.currentPlayer) {
        ws.send(
          JSON.stringify({ type: 'error', message: "It's not your turn!" })
        )
        return
      }

      if (gameState.board[row][col] !== '') {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Cell is already occupied!'
          })
        )
        return
      }

      // Place the move
      gameState.board[row][col] = playerSymbol
      gameState.currentPlayer = playerSymbol === 'X' ? 'O' : 'X'

      // Broadcast the updated board
      gameState.players.forEach(player =>
        player.send(
          JSON.stringify({
            type: 'update',
            board: gameState.board,
            currentPlayer: gameState.currentPlayer
          })
        )
      )
    } catch (error) {
      // Handle invalid JSON
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid J format!' }))
    }
  })

  // Handle client disconnection
  ws.on('close', () => {
    console.log('A client disconnected')

    // Find and remove the disconnected player
    const playerIndex = gameState.players.indexOf(ws)
    if (playerIndex !== -1) {
      gameState.players.splice(playerIndex, 1) // Remove the player
    }

    // Reset the game if someone disconnects
    gameState.board = Array(3)
      .fill(null)
      .map(() => Array(3).fill('')) // Reset the board
    gameState.currentPlayer = 'X' // Reset to Player X's turn
    gameState.winner = null // Reset winner

    console.log('Game state reset due to disconnection')

    // Notify the remaining player (if any)
    if (gameState.players.length === 1) {
      gameState.players[0].send(
        JSON.stringify({
          type: 'notification',
          message: 'The other player disconnected. Waiting for a new player...'
        })
      )
    }
  })
})

const PORT = 8080
server.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`)
})
