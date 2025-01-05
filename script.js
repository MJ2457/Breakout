const boardWidth = 500;
const boardHeight = 500;
let board;
let context;

// Players
const playerWidth = 80; // 500 for testing, 80 normal
const playerHeight = 10;
const initialPlayerVelocityX = 10;
let playerVelocityX = initialPlayerVelocityX;
let isMovingLeft = false;
let isMovingRight = false;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight
};

// Ball
const ballWidth = 10;
const ballHeight = 10;
const initialBallVelocityX = 3;
const initialBallVelocityY = 2;
let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: initialBallVelocityX,
    velocityY: initialBallVelocityY
};

// Blocks
let blockArray = [];
const blockWidth = 50;
const blockHeight = 10;
const blockColumns = 8;
let blockRows = 3;
const blockMaxRows = 10;
const blockX = 15;
const blockY = 45;
let blockCount = 0;

// Game variables
let score = 0;
let gameOver = false;
let lastTime = 0;
let speedMultiplier = 1; // For incremental ball speed increase

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Initialize game
    createBlocks();
    addEventListeners();
    requestAnimationFrame(update);
};

function update(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    // Update player position
    updatePlayerPosition();

    // Draw player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // Update and draw ball
    ball.x += ball.velocityX * deltaTime * 60 * speedMultiplier;
    ball.y += ball.velocityY * deltaTime * 60 * speedMultiplier;
    context.fillStyle = "yellow";
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // Ball collision with player
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;
    } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;
    }

    // Ball collision with walls
    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
        ball.velocityY *= -1;
    }
    if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {
        ball.velocityX *= -1;
    }

    // Ball out of bounds
    if (ball.y + ball.height >= boardHeight) {
        context.font = "20px sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        gameOver = true;
        return;
    }

    // Update and draw blocks
    context.fillStyle = "skyblue";
    for (const block of blockArray) {
        if (!block.break) {
            if (detectCollision(ball, block)) {
                block.break = true;
                ball.velocityY *= -1;
                score += 100;
                blockCount -= 1;
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    // Next level
    if (blockCount === 0) {
        score += 100 * blockRows * blockColumns;
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        speedMultiplier += speedMultiplier * 0.1; // Incrementally increase speed
        createBlocks();
    }

    // Draw score
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);

    requestAnimationFrame(update);
}

function addEventListeners() {
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            if (gameOver) {
                resetGame();
            }
        } else if (e.code === "ArrowLeft") {
            isMovingLeft = true;
        } else if (e.code === "ArrowRight") {
            isMovingRight = true;
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.code === "ArrowLeft") {
            isMovingLeft = false;
        } else if (e.code === "ArrowRight") {
            isMovingRight = false;
        }
    });

    document.addEventListener("mousemove", (e) => {
        const rect = board.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        player.x = Math.max(0, Math.min(mouseX - player.width / 2, boardWidth - player.width));
    });
}

function updatePlayerPosition() {
    const acceleration = 0.5;
    const maxSpeed = 20;

    if (isMovingLeft && !outOfBounds(player.x - playerVelocityX)) {
        playerVelocityX = Math.max(playerVelocityX - acceleration, -maxSpeed);
        player.x += playerVelocityX;
    } else if (isMovingRight && !outOfBounds(player.x + playerVelocityX)) {
        playerVelocityX = Math.min(playerVelocityX + acceleration, maxSpeed);
        player.x += playerVelocityX;
    } else {
        playerVelocityX *= 0.9; // Friction for smoother stopping
    }
}

function createBlocks() {
    blockArray = [];
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            blockArray.push({
                x: blockX + c * blockWidth + c * 10,
                y: blockY + r * blockHeight + r * 10,
                width: blockWidth,
                height: blockHeight,
                break: false
            });
        }
    }
    blockCount = blockArray.length;
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && ball.y + ball.height >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && block.y + block.height >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && ball.x + ball.width >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && block.x + block.width >= ball.x;
}

function outOfBounds(xPosition) {
    return xPosition < 0 || xPosition + playerWidth > boardWidth;
}

function resetGame() {
    gameOver = false;
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight
    };
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: initialBallVelocityX,
        velocityY: initialBallVelocityY
    };
    blockRows = 3;
    score = 0;
    speedMultiplier = 1; // Reset speed multiplier
    createBlocks();
    requestAnimationFrame(update); // Ensure game restarts
}


