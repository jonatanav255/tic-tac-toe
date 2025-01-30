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

      if (data.type === 'move') {
        const { row, col } = data

        // Find the current player's symbol
        const playerIndex = gameState.players.indexOf(ws)
        const playerSymbol = playerIndex === 0 ? 'X' : 'O'

        // Check if it's the correct player's turn
        if (playerSymbol !== gameState.currentPlayer) {
          ws.send(
            JSON.stringify({ type: 'error', message: "It's not your turn!" })
          )
          return
        }

        // Validate if the move is within bounds and the cell is empty
        if (
          row < 0 ||
          row > 2 ||
          col < 0 ||
          col > 2 || // Out of bounds check
          gameState.board[row][col] !== '' // Cell already occupied
        ) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid move!' }))
          return
        }

        // Place the player's move
        gameState.board[row][col] = playerSymbol

        // Switch turn to the other player
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X'

        // Broadcast the updated board to both players
        gameState.players.forEach(player =>
          player.send(
            JSON.stringify({
              type: 'update',
              board: gameState.board,
              currentPlayer: gameState.currentPlayer
            })
          )
        )

        console.log(`Player ${playerSymbol} moved to (${row}, ${col})`)
      }
    } catch (error) {
      console.error('Error parsing message:', error)
    }
  })

  // Handle client disconnection
  ws.on('close', () => {
    console.log('A client disconnected')
  })
})

const PORT = 8080
server.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`)
})
