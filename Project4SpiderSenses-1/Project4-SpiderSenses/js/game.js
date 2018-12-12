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

function liquidDrops(e) {

    if (currentScene != "gameScene") {
        return;
    }
    //if (paused) return;
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

function crawl(crawlAnimation) {
    gameScene.addChild(crawlAnimation);
    crawlAnimation.animationSpeed = 5 * dt;
    crawlAnimation.loop = false;
    crawlAnimation.onComplete = e => gameScene.removeChild(crawlAnimation);
    gameScene.addChild(crawlAnimation);
    crawlAnimation.play();
}