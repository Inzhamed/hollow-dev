const ws = new WebSocket('ws://localhost:8080');
let gameId = null;
let playerIndex = null;

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleMessage(data);
};

function handleMessage(data) {
  const { type, payload } = data;

  switch (type) {
    case 'created':
      gameId = payload.gameId;
      break;
    case 'joined':
      gameId = payload.gameId;
      break;
    case 'start':
      initializeBoard();
      break;
    case 'move':
      updateBoard(payload.index, payload.playerIndex);
      break;
    case 'win':
      alert(`Player ${payload.playerIndex + 1} wins!`);
      resetGame();
      break;
    case 'draw':
      alert('Draw!');
      resetGame();
      break;
    default:
      console.log('Unknown message type:', type);
  }
}

function createGame() {
  const gameId = prompt('Enter game ID:');
  if (gameId) {
    ws.send(JSON.stringify({ type: 'create', payload: { gameId } }));
  }
}

function joinGame() {
  const gameId = prompt('Enter game ID:');
  if (gameId) {
    ws.send(JSON.stringify({ type: 'join', payload: { gameId } }));
  }
}

function initializeBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.addEventListener('click', () => makeMove(i));
    board.appendChild(cell);
  }
}

function updateBoard(index, playerIndex) {
  const board = document.getElementById('board');
  const cell = board.children[index];
  cell.textContent = playerIndex === 0 ? 'X' : 'O';
}

function makeMove(index) {
  if (gameId !== null) {
    ws.send(JSON.stringify({ type: 'move', payload: { gameId, index } }));
  }
}

function resetGame() {
  gameId = null;
  playerIndex = null;
  document.getElementById('board').innerHTML = '';
}
