import { initPoseDetection, getPose } from 'pose-detection';
import { exercises, validatePose } from 'exercises';
import { updateHealthBars, setInstructionText, updateExerciseProgress, showGameOverScreen, hideGameOverScreen } from 'ui';
import { initAIHelper } from 'ai-helper';
import { playSound } from 'audio';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const videoElement = document.getElementById('webcam');

let player, enemy, background, currentExercise;
let gameRunning = true;

const playerImages = {
    idle: new Image(),
    attack: new Image(),
};
const enemyImages = {
    idle: new Image(),
    hit: new Image(),
};

function loadAssets() {
    background = new Image();
    background.src = 'background.png';

    playerImages.idle.src = 'player_idle.png';
    playerImages.attack.src = 'player_attack.png';
    enemyImages.idle.src = 'enemy_idle.png';
    enemyImages.hit.src = 'enemy_hit.png';
    
    return new Promise((resolve) => {
        let loaded = 0;
        const toLoad = 5;
        const onImgLoad = () => { if(++loaded >= toLoad) resolve(); };
        background.onload = onImgLoad;
        playerImages.idle.onload = onImgLoad;
        playerImages.attack.onload = onImgLoad;
        enemyImages.idle.onload = onImgLoad;
        enemyImages.hit.onload = onImgLoad;
    });
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function Character(x, y, images) {
    this.x = x;
    this.y = y;
    this.images = images;
    this.state = 'idle'; // 'idle', 'attack', 'hit'
    this.stateTimer = 0;
    this.health = 100;

    this.draw = (ctx) => {
        let img;
        switch (this.state) {
            case 'attack': img = this.images.attack; break;
            case 'hit': img = this.images.hit; break;
            default: img = this.images.idle; break;
        }
        
        if (img && img.complete) {
            const aspectRatio = img.width / img.height;
            const h = canvas.height * 0.5;
            const w = h * aspectRatio;
            ctx.drawImage(img, this.x - w / 2, this.y - h / 2, w, h);
        }
    };
    
    this.update = (deltaTime) => {
        if(this.stateTimer > 0) {
            this.stateTimer -= deltaTime;
            if(this.stateTimer <= 0) {
                this.state = 'idle';
                this.stateTimer = 0;
            }
        }
    }

    this.setState = (newState, duration) => {
        this.state = newState;
        this.stateTimer = duration;
    }
}

function chooseNewExercise() {
    currentExercise = exercises[Math.floor(Math.random() * exercises.length)];
    setInstructionText(currentExercise.instructions);
    updateExerciseProgress(0);
}

function resetGame() {
    player.health = 100;
    enemy.health = 100;
    player.state = 'idle';
    enemy.state = 'idle';
    updateHealthBars(player.health, enemy.health);
    hideGameOverScreen();
    chooseNewExercise();
    gameRunning = true;
    gameLoop();
}

async function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    await loadAssets();

    player = new Character(canvas.width * 0.25, canvas.height * 0.7, playerImages);
    enemy = new Character(canvas.width * 0.75, canvas.height * 0.7, enemyImages);

    document.getElementById('restart-button').addEventListener('click', resetGame);
    initAIHelper(currentExercise);

    try {
        await initPoseDetection(videoElement);
        chooseNewExercise();
        gameLoop();
    } catch (error) {
        console.error("Failed to initialize pose detection:", error);
        setInstructionText("Could not access camera. Please allow camera access and refresh.");
    }
}

let lastTime = 0;
async function gameLoop(timestamp) {
    if (!gameRunning) return;

    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    const pose = getPose();
    if (pose) {
       const result = validatePose(currentExercise.name, pose);
       if(result.completed) {
           player.setState('attack', 0.5);
           enemy.setState('hit', 0.5);
           enemy.health -= currentExercise.damage;
           playSound('punch.mp3');
           updateHealthBars(player.health, enemy.health);
           chooseNewExercise();
           
           if (enemy.health <= 0) {
               showGameOverScreen("Victory!");
               playSound('victory.mp3');
               gameRunning = false;
           }
       }
       updateExerciseProgress(result.progress);
    }
    
    player.update(deltaTime);
    enemy.update(deltaTime);

    // Draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(background && background.complete) {
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }
    player.draw(ctx);
    enemy.draw(ctx);

    requestAnimationFrame(gameLoop);
}

init();

