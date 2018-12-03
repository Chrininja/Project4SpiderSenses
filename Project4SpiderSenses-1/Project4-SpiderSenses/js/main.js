// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application(600, 600);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load the images
PIXI.loader.
add(["images/Spider.png", "images/explosions.png"]).
on("progress", e => {
    console.log(`progress=${e.progress}`)
}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene;
let spider;
let timeLabel;
let waterDropSound;
let hitSound;
let fireballSound;
let gameOverScene;
let gameOverTimeLabel;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let time = 0;
let levelNum = 1;
let paused = true;

function setup() {
    stage = app.stage;

    // #0 - Create the 'controls scene'
    //controlsScene = new PIXI.Container();
    //controlsScene.visible = false;
    //stage.addChild(controlsScene); 

    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene)

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #5 - Create spider
    spider = new Spider(50, 50, 200);
    gameScene.addChild(spider);

    // #6 - Load Sounds
    waterDropSound = new Howl({
        src: ['sounds/liquids/waterDrop.mp3']
    });

    hitSound = new Howl({
        src: ['sounds/spider/say1.mp3']
    });

    fireballSound = new Howl({
        src: ['sounds/liquids/fireball.mp3']
    })

    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();

    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas
    app.view.onclick = fireBullet;

    // Now our `startScene` is visible
    // Clicking the button calls startGame()
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
        fill: 0xFFFFFF,
        fontSize: 85,
        fontFamily: 'Futura',
        stoke: 0xFF0000,
        strokeThickness: 6
    });
    title.x = 50;
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
    gameOverText.x = 5;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // Actual time
    gameOverTimeLabel = new PIXI.Text();
    gameOverTimeLabel.style = textStyle;
    gameOverTimeLabel.x = 5;
    gameOverTimeLabel.y = sceneHeight / 2 + 50;
    gameOverScene.addChild(gameOverTimeLabel);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);
}

// Function to start the game
function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
}

// Function to keep increasing the time
function increaseTimeBy(value) {
    time += value;
    timeLabel.text = `Time ${time}`;
}

// The actual game loop that runs when game plays
function gameLoop() {
    // if (paused) return; // keep this commented out for now

    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;
    increaseTimeBy(dt);

    // #2 - Move Spider
    // Animation Loop
    app.ticker.add(() => {
        // #1 - Calculate "delta time"
        dt = 1 / app.ticker.FPS;
        if (dt > 1 / 12) dt = 1 / 12;

        // #2 - Check Keys
        if (keys[keyboard.RIGHT] || keys[keyboard.d]) {
            spider.dx = spider.speed;
        } else if (keys[keyboard.LEFT || keys[keyboard.a]]) {
            spider.dx = -spider.speed;
        } else {
            spider.dx = 0;
        }

        if (keys[keyboard.DOWN] || keys[keyboard.s]) {
            spider.dy = spider.speed;
        } else if (keys[keyboard.UP] || keys[keyboard.w]) {
            spider.dy = -spider.speed;
        } else {
            spider.dy = 0;
        }

        // #3 - move avatar
        spider.update(dt);

    });

    let amt = 6 * dt; // at 60 FPS would move about 10% of distance per update

    // lerp (linear interpolate) the x & y values with lerp()
    let newX = lerp(spider.x, amt);
    let newY = lerp(spider.y, amt);

    // keep the spider on the screen with clamp()
    let w2 = spider.width / 2;
    let h2 = spider.height / 2;
    spider.x = clamp(newX, 0 + w2, sceneWidth - w2);
    spider.y = clamp(newY, 0 + h2, sceneHeight - h2);


    // #3 - Move Circles
    for (let c of circles) {
        c.move(dt);
        if (c.x <= c.radius || c.x >= sceneWidth - c.radius) {
            c.reflectX();
            c.move(dt);
        }

        if (c.y <= c.radius || c.y >= sceneHeight - c.radius) {
            c.reflectY();
            c.move(dt);
        }
    }


    // #4 - Move Bullets
    for (let b of bullets) {
        b.move(dt);
    }


    // #5 - Check for Collisions
    for (let c of circles) {
        for (let b of bullets) {
            // #5A - circles & bullets
            if (rectsIntersect(c, b)) {
                fireballSound.play();
                createExplosion(c.x, c.y, 64, 64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
            }

            if (b.y < -10) b.isAlive = false;
        }

        // #5B - circles & spider
        if (c.isAlive && rectsIntersect(c, spider)) {
            hitSound.play();
            end();
            return;
        }
    }


    // #6 - Now do some clean up
    //get rid of dead bullets
    bullets = bullets.filter(b => b.isAlive);


    // get rid of dead circles 
    circles = circles.filter(c => c.isAlive);


    // get rid of explosions
    explosions = explosions.filter(e => e.playing);


    // #8 - Load next level
    if (circles.length == 0) {
        levelNum++;
        loadLevel();
    }

}

function createCircles(numCircles) {
    for (let i = 0; i < numCircles; i++) {
        let c = new Circle(10, 0xFFFF00);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel() {
    createCircles(levelNum * 5);
    paused = false;
}

// Clicking the button calls startGame()
function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    time = 0;
    spider.x = 300;
    spider.y = 550;
    loadLevel();
}

function end() {
    paused = true;

    // clear out the level
    circles.forEach(c => gameScene.removeChild(c)); // concise arrow function with no brackets and no return
    circles = [];

    bullets.forEach(b => gameScene.removeChild(b)); // ditto
    bullets = [];

    explosions.forEach(e => gameScene.removeChild(e)); // ditto
    explosions = [];

    gameOverTimeLabel.text = "Your Time: " + time;
    gameOverScene.visible = true;
    gameScene.visible = false;
}

function fireBullet(e) {
    // let rect = app.view.getBoundingClientRect();
    // let mouseX = e.clientX - rect.x;
    // let mouseY = e.clientY - rect.y;
    // console.log(`${mouseX},${mouseY}`);
    if (paused) return;

    if (levelNum > 1) {
        let bleft = new Bullet(0xFFFFFF, spider.x - 15, spider.y);
        bullets.push(bleft);
        gameScene.addChild(bleft);

        let bmiddle = new Bullet(0xFFFFFF, spider.x, spider.y)
        bullets.push(bmiddle);
        gameScene.addChild(bmiddle);

        let bright = new Bullet(0xFFFFFF, spider.x + 15, spider.y)
        bullets.push(bright);
        gameScene.addChild(bright);

        
    } else {
        let b = new Bullet(0xFFFFFF, spider.x, spider.y);
        bullets.push(b);
        gameScene.addChild(b);
    }

    waterDropSound.play();
}

function loadSpriteSheet() {
    // the 16 animation frames in each row are 64x64 pixels
    // we are using the second row
    // http://pixi.js.download/dev/docs/PIXI.BaseTexture.html
    let spriteSheet = PIXI.BaseTexture.fromImage("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/dev/docs/PIXI.Texture.html
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight) {
    // http://pixijs.download/dev/docs/PIXI.extras.AnimatedSprite.html
    // the animation frames are 64x64 pixels
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.extras.AnimatedSprite(explosionTextures);
    expl.x = x - w2; // we want the explosions to appear at the center of the circle
    expl.y = y - h2; // ditto
    expl.animationSpeed = 1 / 7;
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}