
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = [];
let games = {};

wss.on('connection', (ws) => {
    console.log('New connection');
    clients.push(ws);
  
    ws.on('message', (message) => {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    });
  
    ws.on('close', () => {
      console.log('Connection closed');
      clients = clients.filter(client => client !== ws);
    });
  });
  

function handleMessage(ws, data) {
  const { type, payload } = data;

  switch (type) {
    case 'create':
      createGame(ws, payload);
      break;
    case 'join':
      joinGame(ws, payload);
      break;
    case 'move':
      makeMove(ws, payload);
      break;
    default:
      console.log('Unknown message type:', type);
  }
}

function createGame(ws, { gameId }) {
  games[gameId] = { players: [ws], board: Array(9).fill(null), currentPlayer: 0 };
  ws.send(JSON.stringify({ type: 'created', payload: { gameId } }));
}

function joinGame(ws, { gameId }) {
  if (games[gameId] && games[gameId].players.length < 2) {
    games[gameId].players.push(ws);
    ws.send(JSON.stringify({ type: 'joined', payload: { gameId } }));
    startGame(gameId);
  } else {
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Cannot join game' } }));
  }
}

function startGame(gameId) {
  games[gameId].players.forEach(player => {
    player.send(JSON.stringify({ type: 'start', payload: { gameId } }));
  });
}

function makeMove(ws, { gameId, index }) {
  const game = games[gameId];
  if (game && game.players.includes(ws) && game.board[index] === null) {
    const playerIndex = game.players.indexOf(ws);
    if (playerIndex === game.currentPlayer) {
      game.board[index] = playerIndex;
      game.currentPlayer = 1 - game.currentPlayer;

      game.players.forEach(player => {
        player.send(JSON.stringify({ type: 'move', payload: { gameId, index, playerIndex } }));
      });

      if (checkWin(game.board)) {
        game.players.forEach(player => {
          player.send(JSON.stringify({ type: 'win', payload: { gameId, playerIndex } }));
        });
      } else if (game.board.every(cell => cell !== null)) {
        game.players.forEach(player => {
          player.send(JSON.stringify({ type: 'draw', payload: { gameId } }));
        });
      }
    }
  }
}

function checkWin(board) {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return winningCombinations.some(combination => 
    combination.every(index => board[index] !== null && board[index] === board[combination[0]])
  );
}

console.log('WebSocket server is running on ws://localhost:8080');
