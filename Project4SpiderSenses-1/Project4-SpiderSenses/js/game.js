function loadSpriteSheet() {
    // http://pixi.js.download/dev/docs/PIXI.BaseTexture.html
    let spriteSheet = PIXI.BaseTexture.fromImage("images/spider-spritesheet.png");
    let width = 120;
    let height = 148;
    let rowFrames = 4;
    let colFrames = 5;
    let textures = [];
    for (let i = 0; i < colFrames; i++) {
        for (let j = 0; j < rowFrames; j++) {
            // http://pixijs.download/dev/docs/PIXI.Texture.html
            let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, j * height, width, height));
            textures.push(frame);
        }
    }
    return textures;
}

function liquidDrops(e) {

    //if (paused) return;
    let divider = 8;
    let division = sceneWidth / divider;

    let randomNum = Math.floor(Math.random() * divider) + 1;

    if(randomNum == 1)
    {
        let water = new Bullet(0x538fef, division * randomNum, 0);
        bullets.push(water);
        gameScene.addChild(water);
        waterDropSound.play();
    }
    else if(randomNum == 2)
    {
        let fire = new Bullet(0xFF0000, division * randomNum, 0);
        bullets.push(fire);
        gameScene.addChild(fire);
        fireSound.play();
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