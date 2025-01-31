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
  board: Array(3).fill(null).map(() => Array(3).fill('')),
  currentPlayer: 'X',
  players: [],
  winner: null
}

/**
 * Check if the given symbol has won the game.
 * Returns true if the player with the symbol wins.
 */
function checkWin(board: string[][], symbol: 'X' | 'O'): boolean {
  // Check rows and columns
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === symbol && board[i][1] === symbol && board[i][2] === symbol) return true;
    if (board[0][i] === symbol && board[1][i] === symbol && board[2][i] === symbol) return true;
  }
  // Check diagonals
  if (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) return true;
  if (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) return true;

  return false;
}

/**
 * Check if the board is completely filled with no winner.
 * Returns true if the game is a draw.
 */
function checkDraw(board: string[][]): boolean {
  return board.every(row => row.every(cell => cell !== ''));
}

/**
 * Broadcasts a message (object) to all connected players.
 */
function broadcast(message: object) {
  gameState.players.forEach(player => player.send(JSON.stringify(message)));
}

wss.on('connection', (ws: WsWebSocket) => {
  console.log('A new client connected');

  // Only allow two players
  if (gameState.players.length < 2) {
    gameState.players.push(ws);
    const playerSymbol = gameState.players.length === 1 ? 'X' : 'O';

    ws.send(JSON.stringify({
      type: 'welcome',
      player: playerSymbol
    }));

    console.log(`Player ${playerSymbol} connected`);

    // When two players have connected, start the game
    if (gameState.players.length === 2) {
      broadcast({
        type: 'start',
        board: gameState.board,
        currentPlayer: gameState.currentPlayer
      });
      console.log('Game started');
    }
  } else {
    // Reject extra connections
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Game already full!'
    }));
    ws.close();
    return;
  }

  // Listen for messages from the client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      // Validate the incoming move message
      if (
        !data.type ||
        data.type !== 'move' ||
        typeof data.row !== 'number' ||
        typeof data.col !== 'number' ||
        data.row < 0 || data.row > 2 ||
        data.col < 0 || data.col > 2
      ) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message structure!'
        }));
        return;
      }

      const { row, col } = data;
      const playerIndex = gameState.players.indexOf(ws);
      const playerSymbol: 'X' | 'O' = playerIndex === 0 ? 'X' : 'O';

      // Check if it's the player's turn
      if (playerSymbol !== gameState.currentPlayer) {
        ws.send(JSON.stringify({
          type: 'error',
          message: "It's not your turn!"
        }));
        return;
      }

      // Ensure the cell is not already occupied
      if (gameState.board[row][col] !== '') {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Cell is already occupied!'
        }));
        return;
      }

      // Place the move
      gameState.board[row][col] = playerSymbol;
      
      // Check for win
      if (checkWin(gameState.board, playerSymbol)) {
        gameState.winner = playerSymbol;
        broadcast({
          type: 'gameOver',
          winner: playerSymbol,
          board: gameState.board
        });
        console.log(`Player ${playerSymbol} wins!`);
        return;
      }

      // Check for a draw
      if (checkDraw(gameState.board)) {
        gameState.winner = 'Draw';
        broadcast({
          type: 'gameOver',
          winner: 'Draw',
          board: gameState.board
        });
        console.log('Game is a draw!');
        return;
      }

      // Toggle turn and broadcast updated game state
      gameState.currentPlayer = playerSymbol === 'X' ? 'O' : 'X';
      broadcast({
        type: 'update',
        board: gameState.board,
        currentPlayer: gameState.currentPlayer
      });
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON format!'
      }));
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('A client disconnected');

    // Remove the disconnected player
    const playerIndex = gameState.players.indexOf(ws);
    if (playerIndex !== -1) {
      gameState.players.splice(playerIndex, 1);
    }

    // Reset the game state when a player disconnects
    gameState.board = Array(3).fill(null).map(() => Array(3).fill(''));
    gameState.currentPlayer = 'X';
    gameState.winner = null;
    console.log('Game state reset due to disconnection');

    // Notify the remaining player, if any
    if (gameState.players.length === 1) {
      gameState.players[0].send(JSON.stringify({
        type: 'notification',
        message: 'The other player disconnected. Waiting for a new player...'
      }));
    }
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`);
});
