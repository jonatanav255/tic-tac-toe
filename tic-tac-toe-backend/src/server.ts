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
  }
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
    console.log('Received message:', message.toString())
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
