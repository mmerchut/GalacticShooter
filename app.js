const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const playerNameInput = document.getElementById('playerName');
const startGameButton = document.getElementById('startGame');
const leaderboardList = document.getElementById('leaderboardList');
const leaderboard = document.getElementById('leaderboard');
const playAgainButton = document.getElementById('playAgainButton');

let playerPosition = gameArea.clientWidth / 2 - 20;
let bullets = [];
let enemies = [];
let score = 0;
let playerName = localStorage.getItem('playerName') || 'Player';

// Load previous scores from local storage
let scores = JSON.parse(localStorage.getItem('scores')) || [];

// Function to clear the game area
function clearGameArea() {
    bullets.forEach(bullet => bullet.remove());
    bullets = [];
    enemies.forEach(enemy => enemy.remove());
    enemies = [];
}

// Play Again Button Logic
playAgainButton.addEventListener('click', () => {
    leaderboard.style.display = 'none';
    startScreen.style.display = 'block';
    playerNameInput.value = '';
    score = 0;
    clearGameArea();
});

// Start the game
startGameButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name) {
        playerName = name;
        localStorage.setItem('playerName', playerName);
        startScreen.style.display = 'none';
        gameArea.style.display = 'block';
        scoreDisplay.textContent = 'Score: 0';
        score = 0;
        clearGameArea();
        playerPosition = gameArea.clientWidth / 2 - 20;
        player.style.left = playerPosition + 'px';
    } else {
        alert('Please enter your name!');
    }
});

// Move player with arrow keys
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && playerPosition > 0) {
        playerPosition -= 15;
    } else if (event.key === 'ArrowRight' && playerPosition < gameArea.clientWidth - 40) {
        playerPosition += 15;
    } else if (event.key === ' ') {
        shootBullet();
    }
    player.style.left = playerPosition + 'px';
});

// Function to shoot bullets
function shootBullet() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = playerPosition + 17 + 'px'; // Center the bullet
    bullet.style.bottom = '50px'; // Start position
    gameArea.appendChild(bullet);
    bullets.push(bullet);
    moveBullet(bullet);
}

// Move the bullet upwards
function moveBullet(bullet) {
    const bulletInterval = setInterval(() => {
        const bulletPosition = parseInt(bullet.style.bottom);
        if (bulletPosition >= gameArea.clientHeight) {
            clearInterval(bulletInterval);
            bullet.remove();
            bullets = bullets.filter(b => b !== bullet);
        } else {
            bullet.style.bottom = bulletPosition + 5 + 'px';
            checkCollision(bullet, bulletInterval);
        }
    }, 20);
}

// Create enemy
function createEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = Math.random() * (gameArea.clientWidth - 40) + 'px';
    enemy.style.top = '0px'; // Start from the top
    gameArea.appendChild(enemy);
    enemies.push(enemy);
    moveEnemy(enemy);
}

// Move the enemy downwards
function moveEnemy(enemy) {
    const enemyInterval = setInterval(() => {
        const enemyPosition = parseInt(enemy.style.top);
        if (enemyPosition >= gameArea.clientHeight) {
            clearInterval(enemyInterval);
            enemy.remove();
            enemies = enemies.filter(e => e !== enemy);
        } else {
            enemy.style.top = enemyPosition + 2 + 'px';
            checkCollisionWithPlayer(enemy, enemyInterval);
        }
    }, 100);
}

// Check collision between bullet and enemy
function checkCollision(bullet, bulletInterval) {
    enemies.forEach(enemy => {
        const bulletRect = bullet.getBoundingClientRect();
        const enemyRect = enemy.getBoundingClientRect();
        
        if (
            bulletRect.left < enemyRect.right &&
            bulletRect.right > enemyRect.left &&
            bulletRect.top < enemyRect.bottom &&
            bulletRect.bottom > enemyRect.top
        ) {
            clearInterval(bulletInterval);
            bullet.remove();
            enemy.remove();
            bullets = bullets.filter(b => b !== bullet);
            enemies = enemies.filter(e => e !== enemy);
            score++;
            scoreDisplay.textContent = 'Last Score: ' + score;
        }
    });
}

// Check collision between player and enemy
function checkCollisionWithPlayer(enemy, enemyInterval) {
    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    if (
        enemyRect.left < playerRect.right &&
        enemyRect.right > playerRect.left &&
        enemyRect.top < playerRect.bottom &&
        enemyRect.bottom > playerRect.top
    ) {
        clearInterval(enemyInterval);
        alert(`Game Over! ${playerName}, your score: ${score}`);
        saveScore();
        displayLeaderboard();
    }
}

// Save score to local storage
function saveScore() {
    scores.push({ name: playerName, score: score });
    localStorage.setItem('scores', JSON.stringify(scores));
}

// Display the leaderboard
function displayLeaderboard() {
    startScreen.style.display = 'none';
    gameArea.style.display = 'none';
    leaderboard.style.display = 'block';
    leaderboardList.innerHTML = ''; // Clear previous list
    scores.sort((a, b) => b.score - a.score); // Sort scores descending
    scores.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(listItem);
    });
}

// Create an enemy every second
setInterval(createEnemy, 1000);
