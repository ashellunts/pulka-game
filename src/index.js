document.body.style.overflow = 'hidden'; // Prevent body overflow
document.documentElement.style.overflow = 'hidden'; // Prevent html overflow

const canvas = document.createElement('canvas');
canvas.style.overflow = 'hidden'; // Prevent vertical scroll
canvas.style.display = 'block'; // Ensure canvas takes full width

const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

let playerPos = { x: 50, y: 50 };
let canvasSize = { width: window.innerWidth, height: window.innerHeight };
let gameWon = false;
let gameLost = false;
let bullets = [];
let lastBulletTime = 0;
const goalWidth = 100;
const goalHeight = 95;
let waitforNextLevel = true;

const levelCount = 5;

// Load player image
const playerImage = new Image();
playerImage.src = '/pulka-game/player.jpg';

// Load bullet image
const bulletImage = new Image();
bulletImage.src = '/pulka-game/bullet.png';

const finishImage = new Image();
finishImage.src = '/pulka-game/finish.png';

// Calculate new dimensions
const originalWidth = 520;
const originalHeight = 900;
const scaleFactor = 1/25;
const playerWidth = originalWidth * scaleFactor;
const playerHeight = originalHeight * scaleFactor;

// Track the state of arrow keys
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasSize = { width: canvas.width, height: canvas.height };
}

function handleKeyDown(e) {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
  }
}

function handleKeyUp(e) {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
}

function handleTouchStart(e) {
  const touch = e.touches[0];
  const touchX = touch.clientX;
  const touchY = touch.clientY;

  if (touchY < playerPos.y) {
    keys.ArrowUp = true;
  } else if (touchY > playerPos.y + playerHeight) {
    keys.ArrowDown = true;
  }

  if (touchX < playerPos.x) {
    keys.ArrowLeft = true;
  } else if (touchX > playerPos.x + playerWidth) {
    keys.ArrowRight = true;
  }
}

function handleTouchEnd(e) {
  keys.ArrowUp = false;
  keys.ArrowDown = false;
  keys.ArrowLeft = false;
  keys.ArrowRight = false;
}

let currentLevel = 1;
let newBulletMilliseconds = 1000; // Level 1

function startLevel() {
  playerPos = { x: 50, y: 50 };
  bullets = [];
  gameWon = false;
  gameLost = false;
  lastBulletTime = 0;
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
  ctx.fillStyle = 'black';
  ctx.font = '40px Arial';
  ctx.fillText('Pulka', canvasSize.width / 2 - 50, canvasSize.height / 2 - 60);
  ctx.font = '30px Arial';
  ctx.fillText(`Level ${currentLevel}`, canvasSize.width / 2 - 70, canvasSize.height / 2);
  ctx.font = '20px Arial';
  ctx.fillText('Press (s) to start the level', canvasSize.width / 2 - 125, canvasSize.height / 2 + 40);
}

function gameLoop(timestamp) {
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

  // Update player position based on keys pressed
  const speed = 5;
  if (keys.ArrowUp) {
    playerPos.y = Math.max(0, playerPos.y - speed);
  }
  if (keys.ArrowDown) {
    playerPos.y = Math.min(canvasSize.height - playerHeight, playerPos.y + speed);
  }
  if (keys.ArrowLeft) {
    playerPos.x = Math.max(0, playerPos.x - speed);
  }
  if (keys.ArrowRight) {
    playerPos.x = Math.min(canvasSize.width - playerWidth, playerPos.x + speed);
  }

  // Draw goal
  ctx.fillStyle = 'green';
  // ctx.fillRect(canvasSize.width - goalWidth, (canvasSize.height - goalHeight) / 2, goalWidth, goalHeight);

  // Draw finish line
  ctx.drawImage(finishImage, canvasSize.width - goalWidth, (canvasSize.height - goalHeight) / 2, goalWidth, goalHeight);

  // Draw level in up left corner
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Level ${currentLevel}`, 10, 30);

  // Draw player
  ctx.drawImage(playerImage, playerPos.x, playerPos.y, playerWidth, playerHeight);

  // Create new bullet every second
  if (timestamp - lastBulletTime > newBulletMilliseconds) {
    bullets.push({ x: canvasSize.width - 100, y: Math.random() * canvasSize.height });
    lastBulletTime = timestamp;
  }
  // Draw and update bullets
  bullets = bullets.filter(bullet => {
    ctx.drawImage(bulletImage, bullet.x, bullet.y, 20, 5);

    // Check collision with player
    if (bullet.x <= playerPos.x + playerWidth && bullet.x + 20 >= playerPos.x &&
        bullet.y <= playerPos.y + playerHeight && bullet.y + 5 >= playerPos.y) {
      gameLost = true;
    }

    bullet.x -= 5;
    return bullet.x > -10;
  });

  // Check win condition
  if (playerPos.x + playerWidth > canvasSize.width - goalWidth &&
      playerPos.y + playerHeight > (canvasSize.height - goalHeight) / 2 &&
      playerPos.y < (canvasSize.height + goalHeight) / 2) {
    gameWon = true;
  }

  if (gameWon) {
    waitforNextLevel = true;
    currentLevel = currentLevel + 1;
    console.log("currentLevel", currentLevel);
    if (currentLevel > levelCount) {
      // Game completed
      ctx.fillText('You Win! 🎉', canvasSize.width / 2 - 70, canvasSize.height / 2);
      ctx.fillText('Press (r) to restart the game', canvasSize.width / 2 - 170, canvasSize.height / 2 + 40);
      showRestartButton();
    } else {

      if (currentLevel === 2) {
        newBulletMilliseconds = 500;
      } else if (currentLevel === 3) {
        newBulletMilliseconds = 300;
      } else if (currentLevel === 4) {
        newBulletMilliseconds = 250;
      } else if (currentLevel === 5) {
        newBulletMilliseconds = 230;
      }

      startLevel(); // Show level name
    }
  }

  if (gameLost) {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('You Lose! 💥', canvasSize.width / 2 - 70, canvasSize.height / 2);
    ctx.fillText('Press (r) to restart the game', canvasSize.width / 2 - 170, canvasSize.height / 2 + 40);
    showRestartButton();
  }

  if (!gameWon && !gameLost && !waitforNextLevel) {
    requestAnimationFrame(gameLoop);
  }
}

function showStartButton() {
  const startButton = document.createElement('button');
  startButton.innerText = 'Start Level';
  startButton.style.position = 'absolute';
  startButton.style.left = '50%';
  startButton.style.top = '50%';
  startButton.style.transform = 'translate(-50%, -50%)';
  startButton.style.padding = '10px 20px';
  startButton.style.fontSize = '20px';
  document.body.appendChild(startButton);

  startButton.addEventListener('click', () => {
    waitforNextLevel = false;
    startButton.remove();
    startLevel();
    requestAnimationFrame(gameLoop);
  });
}

function showRestartButton() {
  const restartButton = document.createElement('button');
  restartButton.innerText = 'Restart Game';
  restartButton.style.position = 'absolute';
  restartButton.style.left = '50%';
  restartButton.style.top = '60%';
  restartButton.style.transform = 'translate(-50%, -50%)';
  restartButton.style.padding = '10px 20px';
  restartButton.style.fontSize = '20px';
  document.body.appendChild(restartButton);

  restartButton.addEventListener('click', () => {
    playerPos = { x: 50, y: 50 };
    bullets = [];
    gameWon = false;
    gameLost = false;
    lastBulletTime = 0;
    currentLevel = 1; // Reset to level 1
    newBulletMilliseconds = 1000; // Reset bullet interval
    resizeCanvas(); // Reset canvas size if needed
    restartButton.remove();
    requestAnimationFrame(gameLoop); // Restart the game loop
  });
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchend', handleTouchEnd);

resizeCanvas();
startLevel();
showStartButton();
