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
add(["media/spider.png", "media/liquids/chocolate.png", "media/liquids/goo.png",
    "media/liquids/icicle.png", "media/liquids/lava.png", "media/liquids/milk.png",
    "media/liquids/pee.png", "media/liquids/poison.png", "media/liquids/water.png"
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

// Field for game variables
let liquidsTextures = [];
let startScene;
let gameScene;
let spider;
let timeLabel;
let waterDropSound, fireSound, gooSound, poisonSound, chocolateSound, peeSound, liquidNitroSound, milkSound;
let hitSound;
let gameOverScene;
let gameOverTimeLabel;
let dt;

// Game Scene variables
let divider = 8;
let division = sceneWidth / divider;
let randomNum;

let circles = [];
let liquids = [];
let spiderTextures;
let crawlAnimation;
let time = 0;
let timeToFire = 0;
let paused = true;
let currentScene;

// Game Objects
let water, lava, goo, poison, chocolate, pee, ice, milk;

/// Set up the scenes
function setup() {
    stage = app.stage;

    // Create the 'controls scene'
    //controlsScene = new PIXI.Container();
    //controlsScene.visible = false;
    //stage.addChild(controlsScene); 

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

    // Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene)

    // Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // Create labels for all 3 scenes
    createLabelsAndButtons();

    spider = new Spider(300, 250, 200);

    // Load game objects
    water = new Liquid(division * randomNum, 0, 500, liquidType.Water);
    lava = new Liquid(division * randomNum, 0, 500, liquidType.Lava);
    goo = new Liquid(division * randomNum, 0, 500, liquidType.Goo);
    poison = new Liquid(division * randomNum, 0, 500, liquidType.Poison);
    chocolate = new Liquid(division * randomNum, 0, 500, liquidType.Chocolate);
    pee = new Liquid(division * randomNum, 0, 500, liquidType.Pee);
    ice = new Liquid(division * randomNum, 0, 500, liquidType.Ice);
    milk = new Liquid(division * randomNum, 0, 500, liquidType.Milk);

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

    // Load spider spritesheet
    // spiderTextures = loadSpriteSheet();
    // crawlAnimation = new PIXI.extras.AnimatedSprite(spiderTextures);

    // Start update loop
    app.ticker.add(gameLoop);
    app.ticker.add(gameOverLoop);
}

// For creatings labels and buttons
function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 48,
        fontFamily: "Futura"
    });

    // Start Scene
    // The title
    let title = new PIXI.Text("Spider Senses");
    title.style = new PIXI.TextStyle({
        fill: 0xBA55D3,
        fontSize: 85,
        fontFamily: 'Futura',
        stoke: 0xFF0000,
        strokeThickness: 6
    });
    title.x = sceneWidth / 4 - 50;
    title.y = 120;
    startScene.addChild(title);

    // How to play button
    let howToPlay = new PIXI.Text("How To Play");
    howToPlay.style = buttonStyle;
    howToPlay.x = 80;
    howToPlay.y = sceneHeight - 250;
    howToPlay.interactive = true;
    howToPlay.buttonMode = true;
    startScene.addChild(howToPlay);

    // Start game button
    let startButton = new PIXI.Text("Press Enter to Play");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); // startGame is a function reference
    startButton.on('pointerover', e => e.target.alpha = 0.7) // concise arrow function with no brackets
    startButton.on('ponterout', e => e.currentTarget.alpha = 1.0); // ditto
    startScene.addChild(startButton);

    // 2 - set up `gameScene`
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    // 2A - make time label
    timeLabel = new PIXI.Text("Time " + time);
    timeLabel.style = textStyle;
    timeLabel.x = 5;
    timeLabel.y = 5;
    gameScene.addChild(timeLabel);

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = sceneWidth / 2 - 160;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // Actual time
    gameOverTimeLabel = new PIXI.Text();
    gameOverTimeLabel.style = textStyle;
    gameOverTimeLabel.x = sceneWidth / 2 - 260;
    gameOverTimeLabel.y = sceneHeight / 2 - 50;
    gameOverScene.addChild(gameOverTimeLabel);

    // // Make "play again?" button
    // let playAgainButton = new PIXI.Text("Press Enter to Play Again");
    // playAgainButton.style = buttonStyle;
    // playAgainButton.x = sceneWidth / 4 + 80;
    // playAgainButton.y = sceneHeight - 200;
    // playAgainButton.interactive = true;
    // playAgainButton.buttonMode = true;
    // playAgainButton.on("pointerup", startGame); // startGame is a function reference
    // playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    // playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    // gameOverScene.addChild(playAgainButton);


    let textStyle1 = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 44,
        fontFamily: "Futura",
        stroke: 0x000000,
        strokeThickness: 6
    });

    // Make play again text
    let playAgainText = new PIXI.Text("Press R to Play Again");
    playAgainText.style = textStyle1;
    playAgainText.x = sceneWidth / 4 + 80;
    playAgainText.y = sceneHeight - 200;
    gameOverScene.addChild(playAgainText);

    // Make quit text
    let quitText = new PIXI.Text("Press Q to Quit");
    quitText.style = textStyle1;
    quitText.x = sceneWidth / 4 + 80;
    quitText.y = sceneHeight - 100;

    gameOverScene.addChild(quitText);
}

// Clicking the button calls startGame()
function startGame() {
    currentScene = gameState.GameScene;

    gameScene.addChild(spider);
    spider.x = 450;
    spider.y = sceneHeight - 30;
    time = 0;
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

    gameOverTimeLabel.text = "Your Time: " + time.toFixed(2) + " s";
    startScene.visible = false;
    gameOverScene.visible = true;
    gameScene.visible = false;
}