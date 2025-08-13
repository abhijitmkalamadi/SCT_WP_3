const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const firstPlayerSelect = document.getElementById('firstPlayer');
const difficultySelect = document.getElementById('difficultyLevel');
const modeRadios = document.querySelectorAll('input[name="mode"]');

const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDEl = document.getElementById('scoreD');

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let scoreX = 0, scoreO = 0, scoreD = 0;

const winningCombinations = [
  [0,1,2], [3,4,5], [6,7,8], // rows
  [0,3,6], [1,4,7], [2,5,8], // cols
  [0,4,8], [2,4,6]           // diagonals
];

// 🎯 Main click event
cells.forEach(cell => {
  cell.addEventListener('click', () => handleCellClick(cell));
});
restartBtn.addEventListener('click', restartGame);

// Handle cell click
function handleCellClick(cell) {
  const index = cell.dataset.index;
  if (board[index] !== '' || !gameActive) return;

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;

  let winner = checkWinner();
  if (winner) {
    endGame(winner);
    return;
  }

  if (board.every(c => c !== '')) {
    endGame('draw');
    return;
  }

  // Switch turn
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = `${currentPlayer}'s turn`;

  // If vs computer
  if (getSelectedMode() === 'pvc' && currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  }
}

// Get selected mode
function getSelectedMode() {
  return [...modeRadios].find(r => r.checked).value;
}

// Computer move based on difficulty
function computerMove() {
  const difficulty = difficultySelect.value;
  let move;

  if (difficulty === 'easy') {
    move = getRandomMove();
  } else if (difficulty === 'medium') {
    move = getMediumMove();
  } else {
    move = getBestMove();
  }

  board[move] = 'O';
  cells[move].textContent = 'O';

  let winner = checkWinner();
  if (winner) {
    endGame(winner);
    return;
  }

  if (board.every(c => c !== '')) {
    endGame('draw');
    return;
  }

  currentPlayer = 'X';
  statusText.textContent = `${currentPlayer}'s turn`;
}

// Easy: random
function getRandomMove() {
  const available = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  return available[Math.floor(Math.random() * available.length)];
}

// Medium: block or random
function getMediumMove() {
  // Try to win
  for (let combo of winningCombinations) {
    let vals = combo.map(i => board[i]);
    if (vals.filter(v => v === 'O').length === 2 && vals.includes('')) {
      return combo[vals.indexOf('')];
    }
  }
  // Try to block
  for (let combo of winningCombinations) {
    let vals = combo.map(i => board[i]);
    if (vals.filter(v => v === 'X').length === 2 && vals.includes('')) {
      return combo[vals.indexOf('')];
    }
  }
  return getRandomMove();
}

// Hard: minimax
function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  let result = checkWinnerStatic(newBoard); // ✅ No UI change here
  if (result !== null) {
    if (result === 'O') return 10 - depth;
    else if (result === 'X') return depth - 10;
    else return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'O';
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'X';
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// ✅ Pure static check for minimax
function checkWinnerStatic(boardState) {
  for (let combo of winningCombinations) {
    const [a, b, c] = combo;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a];
    }
  }
  if (boardState.every(cell => cell !== '')) return 'draw';
  return null;
}

// Check winner (UI version)
function checkWinner() {
  for (let combo of winningCombinations) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      highlightWinner(combo, board[a]);
      return board[a];
    }
  }
  if (board.every(cell => cell !== '')) return 'draw';
  return null;
}

// Highlight winner
function highlightWinner(combo, player) {
  combo.forEach(index => {
    cells[index].classList.add(player === 'X' ? 'win-x' : 'win-o');
  });
}

// End game
function endGame(result) {
  gameActive = false;
  if (result === 'draw') {
    statusText.textContent = "It's a Draw!";
    scoreD++;
  } else {
    statusText.textContent = `${result} Wins!`;
    if (result === 'X') scoreX++;
    else scoreO++;
  }
  updateScores();
}

// Update scores
function updateScores() {
  scoreXEl.textContent = scoreX;
  scoreOEl.textContent = scoreO;
  scoreDEl.textContent = scoreD;
}

// Restart game
function restartGame() {
  board = Array(9).fill('');
  currentPlayer = firstPlayerSelect.value;
  statusText.textContent = `${currentPlayer}'s turn`;
  gameActive = true;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win-x', 'win-o');
  });

  if (getSelectedMode() === 'pvc' && currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  }
}
