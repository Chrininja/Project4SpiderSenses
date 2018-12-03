function createCircles(numCircles) {
    for (let i = 0; i < numCircles; i++) {
        let c = new Circle(10, 0xFFFF00);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
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

function liquidDrops(e) {

    if (paused) return;
    let divider = 8;
    let division = sceneWidth / divider;

    let randomNum = Math.floor(Math.random() * divider) + 1;

    let water;
    water = new Bullet(0x538fef, division * randomNum, 0);
    bullets.push(water);

    gameScene.addChild(water);
    waterDropSound.play();
}