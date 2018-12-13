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
function startSceneLoop() {
    if (currentScene == gameState.StartScene) {
        app.ticker.add(() => {
            // Enter to start
            if (keys[keyboard.ENTER]) {
                startGame();
            }
            else if(keys[keyboard.c]){
                viewControls();
            }
        });
    }
}

function gameLoop() {
    if (currentScene == gameState.GameScene) {

        if (roundToPointFive(time) == timeToFire) {
            // let level = Math.round(timeToFire / 15.0);
            // for (let i = 0; i < level; level++) {
            //     liquidDrops();
            // }
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

        // Move liquids
        for (let b of liquids) {
            b.move(dt);
        }

        // Collisions between liquids and spider
        for (let b of liquids) {
            if (rectsIntersect(b, spider)) {
                hitSound.play();
                gameScene.removeChild(b);
                gameScene.removeChild(spider);
                end();
                return;
            }
        }

        //get rid of dead liquids
        liquids = liquids.filter(b => b.isAlive);
    }
}

function liquidDrops() {

    randomNum = Math.floor(Math.random() * divider) + 1;

    let spawnX = division * randomNum + 125;
    let spawnY = 135;

    switch (randomNum) {
        case liquidType.Water:
            let water = new Liquid(spawnX, spawnY, 500, liquidType.Water);
            liquids.push(water);
            gameScene.addChild(water);
            waterDropSound.play();
            break;

        case liquidType.Lava:
            let lava = new Liquid(spawnX, spawnY, 500, liquidType.Lava);
            liquids.push(lava);
            gameScene.addChild(lava);
            fireSound.play();
            break;

        case liquidType.Goo:
            let goo = new Liquid(spawnX, spawnY, 500, liquidType.Goo);
            liquids.push(goo);
            gameScene.addChild(goo);
            gooSound.play();
            break;

        case liquidType.Poison:
            let poison = new Liquid(spawnX, spawnY, 500, liquidType.Poison);
            liquids.push(poison);
            gameScene.addChild(poison);
            poisonSound.play();
            break;

        case liquidType.Chocolate:
            let chocolate = new Liquid(spawnX, spawnY, 500, liquidType.Chocolate);
            liquids.push(chocolate);
            gameScene.addChild(chocolate);
            chocolateSound.play();
            break;

        case liquidType.Pee:
            let pee = new Liquid(spawnX, spawnY, 500, liquidType.Pee);
            liquids.push(pee);
            gameScene.addChild(pee);
            peeSound.play();
            break;

        case liquidType.Ice:
            let ice = new Liquid(spawnX, spawnY, 500, liquidType.Ice);
            liquids.push(ice);
            gameScene.addChild(ice);
            liquidNitroSound.play();
            break;

        case liquidType.Milk:
            let milk = new Liquid(spawnX, spawnY, 500, liquidType.Milk);
            liquids.push(milk);
            gameScene.addChild(milk);
            milkSound.play();
            break;
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
            // R to restart
            if (keys[keyboard.r]) {
                startGame();
            }

            // Q to return to the start scene
            if (keys[keyboard.q]) {
                quitGame();
            }
        });
    }
}

function controlsLoop(){
    if(currentScene == gameState.ControlScene){
        app.ticker.add(()=>{
            // C to go back to start scene
            if(keys[keyboard.q]){
                fromControlsToStart();
            }
        });
    }
}