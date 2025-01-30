import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { GameState } from './types/gameState'

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('WebSocket Server Running')
})

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocketServer({ server })

wss.on('connection', (ws: WebSocket) => {
  console.log('A new client connected')

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

const gameState: GameState = {
  board: Array(3)
    .fill(null)
    .map(() => Array(3).fill('')),
  currentPlayer: 'X',
  players: [],
  winner: null
}
