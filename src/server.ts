// src/server.ts

import { createServer } from 'http'
import { WebSocketServer, WebSocket as WsWebSocket } from 'ws'
import { GameManager } from './game/gameManager'

import pgClient from './db'; 

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('WebSocket Server Running')
})

const wss = new WebSocketServer({ server })
const gameManager = new GameManager()

wss.on('connection', (ws: WsWebSocket) => {
  console.log('A new client connected')

  // Only allow two players
  if (gameManager.gameState.players.length < 2) {
    gameManager.gameState.players.push(ws)
    const playerSymbol = gameManager.gameState.players.length === 1 ? 'X' : 'O'

    ws.send(
      JSON.stringify({
        type: 'welcome',
        player: playerSymbol
      })
    )

    console.log(`Player ${playerSymbol} connected`)

    // When two players are connected, start the game
    if (gameManager.gameState.players.length === 2) {
      gameManager.broadcast({
        type: 'start',
        board: gameManager.gameState.board,
        currentPlayer: gameManager.gameState.currentPlayer
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
    return
  }

  ws.on('message', message => {
    try {
      const data = JSON.parse(message.toString())

      if (data.type === 'reset') {
        // Reset the game state on the server
        gameManager.resetGame()
        // Optionally, clear the players array if you want to force rejoining:
        // gameManager.gameState.players = []
        // Broadcast the new starting state to all connected players
        gameManager.broadcast({
          type: 'start',
          board: gameManager.gameState.board,
          currentPlayer: gameManager.gameState.currentPlayer
        })
        return
      }

      // Validate the incoming move message structure
      if (
        !data.type ||
        data.type !== 'move' ||
        typeof data.row !== 'number' ||
        typeof data.col !== 'number' ||
        data.row < 0 ||
        data.row > 2 ||
        data.col < 0 ||
        data.col > 2
      ) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid message structure!'
          })
        )
        return
      }

      const { row, col } = data
      gameManager.processMove(ws, row, col)
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Invalid JSON format!'
        })
      )
    }
  })

  ws.on('close', () => {
    console.log('A client disconnected')
    const playerIndex = gameManager.gameState.players.indexOf(ws)
    if (playerIndex !== -1) {
      gameManager.gameState.players.splice(playerIndex, 1)
    }

    // Reset the game state upon disconnect
    gameManager.resetGame()
    console.log('Game state reset due to disconnection')

    // Notify remaining player, if any
    if (gameManager.gameState.players.length === 1) {
      gameManager.gameState.players[0].send(
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
