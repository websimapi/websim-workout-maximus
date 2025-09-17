const playerHealthEl = document.getElementById('player-health');
const enemyHealthEl = document.getElementById('enemy-health');
const instructionTextEl = document.getElementById('instruction-text');
const exerciseProgressContainer = document.getElementById('exercise-progress-container');
const exerciseProgressEl = document.getElementById('exercise-progress');
const gameOverScreenEl = document.getElementById('game-over-screen');
const gameOverTextEl = document.getElementById('game-over-text');

export function updateHealthBars(playerHealth, enemyHealth) {
    playerHealthEl.style.width = `${playerHealth}%`;
    enemyHealthEl.style.width = `${enemyHealth}%`;
}

export function setInstructionText(text) {
    instructionTextEl.textContent = text;
}

export function updateExerciseProgress(progress) {
    if (progress > 0) {
        exerciseProgressContainer.style.display = 'block';
        exerciseProgressEl.style.width = `${progress * 100}%`;
    } else {
        exerciseProgressContainer.style.display = 'none';
        exerciseProgressEl.style.width = '0%';
    }
}

export function showGameOverScreen(text) {
    gameOverTextEl.textContent = text;
    gameOverScreenEl.style.display = 'block';
}

export function hideGameOverScreen() {
    gameOverScreenEl.style.display = 'none';
}

