const board = document.querySelector(".board");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const gamePausedModal = document.querySelector(".game-paused");
const startButton = document.querySelector(".btn-start");
const restartButton = document.querySelectorAll(".btn-restart");
const pauseButton = document.querySelector("#btn-pause");
const resumeButton = document.querySelector(".btn-resume");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const blockHeight = 20;
const blockWidth = 20;

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00-00`;
let gameSpeed = 400; // Initial speed in milliseconds
let isPaused = false;

highScoreElement.innerText = highScore;

const rows = Math.floor(board.clientHeight / blockHeight);
const cols = Math.floor(board.clientWidth / blockWidth);

let intervalId = null;
let timerIntervalId = null;

let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

const blocks = [];
let snake = [
  {
    x: 0,
    y: 1,
  },
  {
    x: 0,
    y: 0,
  },
];
let direction = "right";

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

function calculateSpeed(currentScore) {
  // Starting speed: 400ms, minimum speed: 100ms
  // Speed increases by 10ms for every 20 points
  const speedDecrease = Math.floor(currentScore / 20) * 15;
  const newSpeed = Math.max(100, 400 - speedDecrease);  
  return newSpeed;
}

function updateGameSpeed() {
  const newSpeed = calculateSpeed(score);
  if (newSpeed !== gameSpeed) {
    gameSpeed = newSpeed;
    // Restart interval with new speed
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      render();
    }, gameSpeed);
  }
}

function render() {
  let head = null;

  blocks[`${food.x}-${food.y}`].classList.add("food");

  if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  } else {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  // wall collision logic
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    clearInterval(intervalId);
    clearInterval(timerIntervalId);
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
    gamePausedModal.style.display = "none";
    return;
  }

  // snake body collision logic
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      clearInterval(intervalId);
      clearInterval(timerIntervalId);
      modal.style.display = "flex";
      startGameModal.style.display = "none";
      gameOverModal.style.display = "flex";
      gamePausedModal.style.display = "none";
      return;
    }
  }

  // food consume logic
  if (head.x == food.x && head.y == food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    blocks[`${food.x}-${food.y}`].classList.add("food");
    snake.unshift(head);

    score += 10;
    scoreElement.innerText = score;

    // Update game speed based on new score
    updateGameSpeed();

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
      highScoreElement.innerText = localStorage.getItem("highScore");
    }
  }

  snake.forEach((segment, index) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    blocks[`${segment.x}-${segment.y}`].classList.remove("head");
  });

  snake.unshift(head);
  snake.pop();

  snake.forEach((segment, index) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
    if (index === 0) {
      blocks[`${segment.x}-${segment.y}`].classList.add("head");
      blocks[`${segment.x}-${segment.y}`].setAttribute(
        "data-direction",
        direction,
      );
    }
  });
}

startButton.addEventListener("click", () => {
  modal.style.display = "none";
  isPaused = false;
  gameSpeed = 400; // Reset speed to initial
  pauseButton.style.display = "block";
  intervalId = setInterval(() => {
    render();
  }, gameSpeed);
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);

    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    time = `${min}-${sec}`;
    timeElement.innerText = time;
  }, 1000);
});

// Pause button functionality
pauseButton.addEventListener("click", () => {
  if (!isPaused) {
    isPaused = true;
    clearInterval(intervalId);
    clearInterval(timerIntervalId);
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "none";
    gamePausedModal.style.display = "flex";
    pauseButton.textContent = "Resume";
  }
});

// Resume button functionality
resumeButton.addEventListener("click", () => {
  isPaused = false;
  modal.style.display = "none";
  pauseButton.textContent = "Pause";

  // Resume game with current speed
  intervalId = setInterval(() => {
    render();
  }, gameSpeed);

  // Resume timer
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);

    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    time = `${min}-${sec}`;
    timeElement.innerText = time;
  }, 1000);
});

// Restart button functionality (multiple buttons)
restartButton.forEach((btn) => {
  btn.addEventListener("click", restartGame);
});

function restartGame() {
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    blocks[`${segment.x}-${segment.y}`].classList.remove("head");
  });
  score = 0;
  scoreElement.innerText = 0;
  highScoreElement.innerText = highScore;
  time = `00-00`;
  timeElement.innerText = time;
  modal.style.display = "none";
  direction = "right";
  gameSpeed = 400; // Reset speed to initial
  isPaused = false;
  pauseButton.textContent = "Pause";
  pauseButton.style.display = "block";
  snake = [
    {
      x: 0,
      y: 1,
    },
    {
      x: 0,
      y: 0,
    },
  ];
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  clearInterval(timerIntervalId);
  intervalId = setInterval(() => {
    render();
  }, gameSpeed);
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);

    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    time = `${min}-${sec}`;
    timeElement.innerText = time;
  }, 1000);
}

addEventListener("keydown", (event) => {
  // Pause with spacebar
  // if (event.key === " " || event.key === "Spacebar") {
  //   event.preventDefault();
  //   if (!isPaused && intervalId) {
  //     pauseButton.click();
  //   }
  //   return;
  // }

  if (event.key == "ArrowUp" && direction != "down") {
    direction = "up";
  } else if (event.key == "ArrowDown" && direction != "up") {
    direction = "down";
  } else if (event.key == "ArrowRight" && direction != "left") {
    direction = "right";
  } else if (event.key == "ArrowLeft" && direction != "right") {
    direction = "left";
  }
});
