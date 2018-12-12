"use strict";

// function loadSpriteSheet() {
//     // http://pixi.js.download/dev/docs/PIXI.BaseTexture.html
//     let spriteSheet = PIXI.BaseTexture.fromImage("images/spider-spritesheet.png");
//     let width = 120;
//     let height = 148;
//     let rowFrames = 4;
//     let colFrames = 5;
//     let textures = [];
//     for (let i = 0; i < colFrames; i++) {
//         for (let j = 0; j < rowFrames; j++) {
//             // http://pixijs.download/dev/docs/PIXI.Texture.html
//             let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, j * height, width, height));
//             textures.push(frame);
//         }
//     }
//     return textures;
// }

// The actual game loop that runs when game plays
function gameLoop() {
    if (currentScene == gameState.GameScene) {

        if (roundToPointFive(time) == timeToFire) {
            liquidDrops();
            timeToFire += 0.5;
        }

        // if (paused) return; // keep this commented out for now
        // #1 - Calculate "delta time"
        dt = 1 / app.ticker.FPS;
        if (dt > 1 / 12) dt = 1 / 12;
        increaseTimeBy(dt);

        // #2 - Move Spider
        let newX = spider.x;
        let newY = spider.y;
        let amt = spider.speed * dt;
        let w2 = spider.width / 2;
        let h2 = spider.height / 2;

        // Animation Loop
        app.ticker.add(() => {
            // #2 - Check Keys
            if (keys[keyboard.d]) {
                newX += amt;
            } else if (keys[keyboard.a]) {
                newX -= amt;
            }

            if (keys[keyboard.s]) {
                newY += amt;
            } else if (keys[keyboard.w]) {
                newY -= amt;
            }

            spider.update(newX, newY);
        });

        // crawl(crawlAnimation);

        // Move Bullets
        for (let b of bullets) {
            b.move(dt);
        }

        // Collisions between bullets and spider
        for (let b of bullets) {
            if (rectsIntersect(b, spider)) {
                hitSound.play();
                gameScene.removeChild(b);
                gameScene.removeChild(spider);
                end();
                return;
            }
        }

        //get rid of dead bullets
        bullets = bullets.filter(b => b.isAlive);
    }
}

function liquidDrops() {

    let divider = 8;
    let division = sceneWidth / divider;

    let randomNum = Math.floor(Math.random() * divider) + 1;

    // Water
    if (randomNum == 1) {
        let water = new Bullet(0x538fef, division * randomNum, 0);
        bullets.push(water);
        gameScene.addChild(water);
        waterDropSound.play();
    }
    // Fire
    else if (randomNum == 2) {
        let fire = new Bullet(0xFF0000, division * randomNum, 0);
        bullets.push(fire);
        gameScene.addChild(fire);
        fireSound.play();
    }
    // Goo
    else if (randomNum == 3) {
        let goo = new Bullet(0x00FF00, division * randomNum, 0);
        bullets.push(goo);
        gameScene.addChild(goo);
        gooSound.play();
    }
    // Poison
    else if (randomNum == 4) {
        let poison = new Bullet(0xFF00FF, division * randomNum, 0);
        bullets.push(poison);
        gameScene.addChild(poison);
        poisonSound.play();
    }
    // Chocolate
    else if (randomNum == 5) {
        let chocolate = new Bullet(0x654321, division * randomNum, 0);
        bullets.push(chocolate);
        gameScene.addChild(chocolate);
        chocolateSound.play();
    }
    // Pee
    else if (randomNum == 6) {
        let pee = new Bullet(0xFFFF00, division * randomNum, 0);
        bullets.push(pee);
        gameScene.addChild(pee);
        peeSound.play();
    }
    // Liquid Nitrogen / Ice
    else if (randomNum == 7) {
        let ice = new Bullet(0xA5F2F3, division * randomNum, 0);
        bullets.push(ice);
        gameScene.addChild(ice);
        liquidNitroSound.play();
    }
}

// Sprite sheet animation
function crawl(crawlAnimation) {
    gameScene.addChild(crawlAnimation);
    crawlAnimation.animationSpeed = 5 * dt;
    crawlAnimation.loop = false;
    crawlAnimation.onComplete = e => gameScene.removeChild(crawlAnimation);
    gameScene.addChild(crawlAnimation);
    crawlAnimation.play();
}

function gameOverLoop() {
    if (currentScene == gameState.GameOverScene) {
        app.ticker.add(() => {
            // Enter to restart
            if (keys[keyboard.r]) {
                startGame();
            }

            // Q to return to the start scene
            if (keys[keyboard.s]) {

            }
        });
    }
}