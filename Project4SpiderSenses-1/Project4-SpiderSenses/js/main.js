"use strict";

let app = new PIXI.Application(800, 600, {
    backgroundColor: 0x808080
});

document.querySelector("#game").appendChild(app.view);

// Constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// Pre-load the images
PIXI.loader.
add(["media/lab-background.png", "media/game-over-bg.png", "media/start-scene.png",
    "media/spider.png", "media/liquids/chocolate.png", "media/liquids/goo.png",
    "media/liquids/icicle.png", "media/liquids/lava.png", "media/liquids/milk.png",
    "media/liquids/pee.png", "media/liquids/poison.png", "media/liquids/water.png",
    "media/jarreal.png", "media/pipette.png"
]).on("progress", e => {
    console.log(`progress=${e.progress}`)
}).
load(setup);

// Game State enum
const gameState = Object.freeze({
    StartScene: 0,
    GameScene: 1,
    ControlScene: 2,
    GameOverScene: 3
});

const liquidType = Object.freeze({
    Water: 1,
    Lava: 2,
    Goo: 3,
    Poison: 4,
    Chocolate: 5,
    Pee: 6,
    Ice: 7,
    Milk: 8
});

// Aliases
let stage;

// Field for local storage
const prefix = "Spidersenses-";
let storedHighScore = localStorage.getItem(prefix + "highScore");
let highScore;

// Field for game variables
let liquidsTextures = [];
let backgroundImgs = [];

let startScene;
let gameScene;
let controlsScene;
let spider;
let timeLabel;
let waterDropSound, fireSound, gooSound, poisonSound, chocolateSound, peeSound, liquidNitroSound, milkSound;
let hitSound, loseSound;
let gameOverScene;
let gameOverTimeLabel;
let highScoreLabel;
let dt;

// Game Scene variables
let divider = 8;
let division = (sceneWidth - 250) / divider;
let randomNum;

let circles = [];
let liquids = [];
let spiderTextures;
let crawlAnimation;
let time = 0;
let timeToFire = 0;
let paused = true;
let currentScene;

/// Set up the scenes
function setup() {
    stage = app.stage;

    // Create the 'controls scene'
    //controlsScene = new PIXI.Container();
    //controlsScene.visible = false;
    //stage.addChild(controlsScene); 

    // Load background images
    backgroundImgs.push(PIXI.loader.resources["media/start-scene.png"].texture);
    backgroundImgs.push(PIXI.loader.resources["media/lab-background.png"].texture);
    backgroundImgs.push(PIXI.loader.resources["media/game-over-bg.png"].texture);
    backgroundImgs.push(PIXI.loader.resources["media/jarreal.png"].texture);
    backgroundImgs.push(PIXI.loader.resources["media/pipette.png"].texture);

    // Load the liquid sprites
    liquidsTextures.push(PIXI.loader.resources["media/liquids/water.png"].texture);
    liquidsTextures.push(PIXI.loader.resources["media/liquids/lava.png"].texture);
    liquidsTextures.push(PIXI.loader.resources["media/liquids/goo.png"].texture);
    liquidsTextures.push(PIXI.loader.resources["media/liquids/poison.png"].texture);
    liquidsTextures.push(PIXI.loader.resources["media/liquids/chocolate.png"].texture);
    liquidsTextures.push(PIXI.loader.resources["media/liquids/pee.png"].texture);
    liquidsTextures.push(PIXI.loader.resources["media/liquids/icicle.png"].texture);
    liquidsTextures.push(PIXI.loader.resources["media/liquids/milk.png"].texture);

    // Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
    currentScene = gameState.StartScene;
    let startSceneBg = new Background(0, 0, sceneWidth, sceneHeight, 0);
    startScene.addChild(startSceneBg);
    
    // Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    let gameSceneBg = new Background(0, 0, sceneWidth, sceneHeight, 1);
    let jar = new Background(100, 50, sceneWidth * 0.8, sceneHeight - 30, 3);
    gameScene.addChild(gameSceneBg);

    // Add the pipettes
    for (let i = 2; i <= divider + 1; i++) {
        let pipette = new Background((division - 5) * i + 75, 0, 108, 600, 4, 0.2);
        gameScene.addChild(pipette);
    }

    gameScene.addChild(jar);

    // Create the `controls` scene
    controlsScene = new PIXI.Container();
    controlsScene.visible = false;
    stage.addChild(controlsScene);
    let controlsSceneBg = new Background(0, 0, sceneWidth, sceneHeight, 1);
    controlsScene.addChild(controlsSceneBg);

    // Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    let gameOverBg = new Background(0, 0, sceneWidth, sceneHeight, 2);
    gameOverScene.addChild(gameOverBg);

    // Create labels for all 3 scenes
    createLabelsAndButtons();

    spider = new Spider(300, 250, 250);

    // Load Sounds
    // waterDropSound, fire, goo, poison, chocolate, pee, liquidNitro;
    waterDropSound = new Howl({
        src: ['sounds/liquids/waterDrop.mp3']
    });

    fireSound = new Howl({
        src: ['sounds/liquids/fire.mp3']
    });

    gooSound = new Howl({
        src: ['sounds/liquids/goo.mp3']
    });

    poisonSound = new Howl({
        src: ['sounds/liquids/poison.mp3']
    });

    chocolateSound = new Howl({
        src: ['sounds/liquids/chocolate.mp3']
    });

    peeSound = new Howl({
        src: ['sounds/liquids/pee.mp3']
    });

    liquidNitroSound = new Howl({
        src: ['sounds/liquids/liquidNitro.mp3']
    });

    milkSound = new Howl({
        src: ['sounds/liquids/milk.mp3']
    });

    hitSound = new Howl({
        src: ['sounds/spider/say1.mp3']
    });

    loseSound = new Howl({
        src: ['sounds/spider/lose.mp3']
    });

    // Load spider spritesheet
    // spiderTextures = loadSpriteSheet();
    // crawlAnimation = new PIXI.extras.AnimatedSprite(spiderTextures);

    // Start update loop
    app.ticker.add(startSceneLoop);
    app.ticker.add(gameLoop);
    app.ticker.add(gameOverLoop);
    app.ticker.add(controlsLoop);
}

// For creatings labels and buttons
function createLabelsAndButtons() {
    // Start Scene
    // The title
    let title = new PIXI.Text("Spider Senses");
    title.style = new PIXI.TextStyle({
        fill: 0xBA55D3,
        fontSize: 100,
        fontFamily: 'Futura',
        stoke: 0xFF0000,
        strokeThickness: 12
    });
    title.x = sceneWidth / 4 - 70;
    title.y = 120;
    startScene.addChild(title);

    let playStyle = new PIXI.TextStyle({
        fill: 0xe75480,
        fontSize: 50,
        fontFamily: "Arial",
        stroke: 0x000000,
        strokeThickness:4
    });

    // How to play text
    let howToPlay = new PIXI.Text("Press C for Controls");
    howToPlay.style = playStyle;
    howToPlay.x = 200;
    howToPlay.y = sceneHeight - 140;
    startScene.addChild(howToPlay);

    // Start game text
    let startButton = new PIXI.Text("Press Enter to Play");
    startButton.style = playStyle;
    startButton.x = 200;
    startButton.y = sceneHeight - 260;
    startScene.addChild(startButton);

    // 2 - set up `gameScene`
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    // Make time label
    timeLabel = new PIXI.Text("Time " + time);
    timeLabel.style = new PIXI.TextStyle({
        fill: 0xBEFF00,
        fontSize: 50,
        fontFamily: "Futura",
        stroke: 0x000000,
        strokeThickness: 6
    });
    timeLabel.x = 5;
    timeLabel.y = 5;
    gameScene.addChild(timeLabel);

    // Game Over Text    
    textStyle = new PIXI.TextStyle({
        fill: 0xBE0000,
        fontSize: 90,
        fontFamily: "Futura",
        stroke: 0x000000,
        strokeThickness: 6
    });
    let gameOverText = new PIXI.Text("Game Over!");
    gameOverText.style = textStyle;
    gameOverText.x = sceneWidth / 4;
    gameOverText.y = sceneHeight / 12;
    gameOverScene.addChild(gameOverText);

    // Actual time
    gameOverTimeLabel = new PIXI.Text();
    gameOverTimeLabel.style = textStyle;
    gameOverTimeLabel.x = sceneWidth / 12 + 30;
    gameOverTimeLabel.y = sceneHeight / 2 - 100;
    gameOverScene.addChild(gameOverTimeLabel);

    // High score label
    highScoreLabel = new PIXI.Text();
    highScoreLabel.style = textStyle;
    highScoreLabel.x = sceneWidth / 12 + 10;
    highScoreLabel.y = sceneHeight / 2;
    gameOverScene.addChild(highScoreLabel);

    let overStyle = new PIXI.TextStyle({
        fill: 0x016699,
        fontSize: 44,
        fontFamily: "Arial",
        stroke: 0x000000,
        strokeThickness: 4
    });

    // Make play again text
    let playAgainText = new PIXI.Text("Press R to Play Again");
    playAgainText.style = overStyle;
    playAgainText.x = sceneWidth / 4;
    playAgainText.y = sceneHeight - 175;
    gameOverScene.addChild(playAgainText);

    // Make quit text
    let quitText = new PIXI.Text("Press Q to Quit");
    quitText.style = overStyle;
    quitText.x = sceneWidth / 4;
    quitText.y = sceneHeight - 100;
    gameOverScene.addChild(quitText);

    // Make how to play text
    let howToTitleCtor = new PIXI.TextStyle({
        fill: 0xFFFF00,
        fontSize: 90,
        fontFamily: "Futura",
        stroke: 0x000000,
        strokeThickness: 6
    });
    let howToTitle = new PIXI.Text("How To Play");
    howToTitle.style = howToTitleCtor;
    howToTitle.x = sceneWidth / 5 + 10;
    howToTitle.y = 35;
    controlsScene.addChild(howToTitle);

    // Make instructions
    let controlTxtStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 40,
        fontFamily: "Arial",
        stroke: 0x000000,
        strokeThickness: 5
    });
    let instructions = new PIXI.Text("- Spider crawls around the\ncontainer with the WASD keys." + 
    "\n\n- Your goal is to survive the\nlongest time by avoiding the\nlethal liquids falling from above.");
    instructions.style = controlTxtStyle;
    instructions.x = sceneWidth / 6;
    instructions.y = sceneHeight / 4 + 20;
    controlsScene.addChild(instructions);

    let sGoBack = new PIXI.Text("Press Q to go back");
    sGoBack.style = new PIXI.TextStyle({
        fill: 0xe75480,
        fontSize: 50,
        fontFamily: 'Futura',
        stoke: 0xFF0000,
        strokeThickness: 4
    });
    sGoBack.x = sceneWidth / 4;
    sGoBack.y = sceneHeight - 100;
    controlsScene.addChild(sGoBack);
}

function quitGame() {
    currentScene = gameState.StartScene;
    startScene.visible = true;
    controlsScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
}

function viewControls(){
    currentScene = gameState.ControlScene;
    startScene.visible = false;
    controlsScene.visible = true;
    gameOverScene.visible = false;
    gameScene.visible = false;
}

function fromControlsToStart(){
    currentScene = gameState.StartScene;
    startScene.visible = true;
    controlsScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
}

// Clicking the button calls startGame()
function startGame() {
    currentScene = gameState.GameScene;

    gameScene.addChild(spider);
    spider.x = 450;
    spider.y = sceneHeight - 50;
    time = 0;
    timeToFire = 0.5;
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
}

// Load game over scene
function end() {
    //paused = true;
    currentScene = gameState.GameOverScene;

    // clear out the level
    liquids.forEach(b => gameScene.removeChild(b)); // ditto
    liquids = [];

    loseSound.play();
    let score = roundToTwoDP(time);
    gameOverTimeLabel.text = "Your Time: " + score + " s";

    // Local storage
    if (storedHighScore == null || parseInt(storedHighScore, 10) < score) {
        score = JSON.stringify(score);
        localStorage.setItem(prefix + "highScore", score);
    }
    
    // Retrieve the current high score
    storedHighScore = localStorage.getItem(prefix + "highScore");
    storedHighScore = JSON.parse(storedHighScore);
    highScoreLabel.text = "High Score: " + storedHighScore + "s";

    startScene.visible = false;
    controlsScene.visible = false;
    gameOverScene.visible = true;
    gameScene.visible = false;
}