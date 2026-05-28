const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const restartBtn = document.getElementById("restartBtn");

const xScoreText = document.getElementById("xScore");
const oScoreText = document.getElementById("oScore");
const drawScoreText = document.getElementById("drawScore");

const pvpBtn = document.getElementById("pvpBtn");
const aiBtn = document.getElementById("aiBtn");

const difficultyButtons = document.querySelectorAll(".difficulty-btn");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;
let vsAI = false;
let difficulty = "easy";

let scores = {
  X: 0,
  O: 0,
  draw: 0
};

const winPatterns = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

function startGame() {

  cells.forEach(cell => {
    cell.addEventListener("click", cellClicked);
  });

  restartBtn.addEventListener("click", restartGame);

  pvpBtn.addEventListener("click", () => setMode(false));

  aiBtn.addEventListener("click", () => setMode(true));

  difficultyButtons.forEach(button => {

    button.addEventListener("click", () => {

      difficultyButtons.forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      difficulty = button.dataset.level;

      restartGame();

    });

  });

  updateStatus();
}

function setMode(aiMode) {

  vsAI = aiMode;

  pvpBtn.classList.toggle("active", !aiMode);

  aiBtn.classList.toggle("active", aiMode);

  restartGame();
}

function cellClicked() {

  const index = this.dataset.index;

  if (board[index] !== "" || !running) {
    return;
  }

  updateCell(this, index);

  checkWinner();

  if (vsAI && currentPlayer === "O" && running) {

    setTimeout(aiMove, 500);

  }
}

function updateCell(cell, index) {

  board[index] = currentPlayer;

  cell.textContent = currentPlayer;

  cell.classList.add(currentPlayer.toLowerCase());

  playSound(300);

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  updateStatus();
}

function updateStatus() {

  statusText.textContent = `Player ${currentPlayer}'s Turn`;

}

function checkWinner() {

  let roundWon = false;

  for (let pattern of winPatterns) {

    const [a, b, c] = pattern;

    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {

      roundWon = true;

      cells[a].classList.add("winner");
      cells[b].classList.add("winner");
      cells[c].classList.add("winner");

      break;
    }
  }

  if (roundWon) {

    const winner = currentPlayer === "X" ? "O" : "X";

    statusText.textContent = `Player ${winner} Wins!`;

    scores[winner]++;

    updateScores();

    playSound(600);

    running = false;

    return;
  }

  if (!board.includes("")) {

    statusText.textContent = "Draw!";

    scores.draw++;

    updateScores();

    running = false;
  }
}

function updateScores() {

  xScoreText.textContent = scores.X;

  oScoreText.textContent = scores.O;

  drawScoreText.textContent = scores.draw;
}

function restartGame() {

  board = ["", "", "", "", "", "", "", "", ""];

  currentPlayer = "X";

  running = true;

  cells.forEach(cell => {

    cell.textContent = "";

    cell.classList.remove("x", "o", "winner");

  });

  updateStatus();
}

function aiMove() {

  let move;

  if (difficulty === "easy") {

    const emptyCells = board
      .map((cell, index) => cell === "" ? index : null)
      .filter(cell => cell !== null);

    move = emptyCells[Math.floor(Math.random() * emptyCells.length)];

  }

  else if (difficulty === "medium") {

    if (Math.random() < 0.5) {

      const emptyCells = board
        .map((cell, index) => cell === "" ? index : null)
        .filter(cell => cell !== null);

      move = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    }

    else {

      move = minimax(board, "O").index;

    }

  }

  else {

    move = minimax(board, "O").index;

  }

  board[move] = "O";

  const cell = document.querySelector(`[data-index='${move}']`);

  cell.textContent = "O";

  cell.classList.add("o");

  playSound(400);

  currentPlayer = "X";

  checkWinner();

  if (running) {

    updateStatus();

  }
}

function minimax(newBoard, player) {

  const emptySpots = newBoard
    .map((v, i) => v === "" ? i : null)
    .filter(v => v !== null);

  if (checkWin(newBoard, "X")) {

    return { score: -10 };

  }

  if (checkWin(newBoard, "O")) {

    return { score: 10 };

  }

  if (emptySpots.length === 0) {

    return { score: 0 };

  }

  let moves = [];

  for (let i = 0; i < emptySpots.length; i++) {

    let move = {};

    move.index = emptySpots[i];

    newBoard[emptySpots[i]] = player;

    if (player === "O") {

      let result = minimax(newBoard, "X");

      move.score = result.score;

    }

    else {

      let result = minimax(newBoard, "O");

      move.score = result.score;

    }

    newBoard[emptySpots[i]] = "";

    moves.push(move);
  }

  let bestMove;

  if (player === "O") {

    let bestScore = -Infinity;

    for (let i = 0; i < moves.length; i++) {

      if (moves[i].score > bestScore) {

        bestScore = moves[i].score;

        bestMove = i;
      }
    }
  }

  else {

    let bestScore = Infinity;

    for (let i = 0; i < moves.length; i++) {

      if (moves[i].score < bestScore) {

        bestScore = moves[i].score;

        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function checkWin(boardState, player) {

  return winPatterns.some(pattern => {

    return pattern.every(index => boardState[index] === player);

  });
}

function playSound(freq) {

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const oscillator = audioCtx.createOscillator();

  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);

  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = freq;

  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + 0.2
  );

  oscillator.start();

  oscillator.stop(audioCtx.currentTime + 0.2);
}

startGame();