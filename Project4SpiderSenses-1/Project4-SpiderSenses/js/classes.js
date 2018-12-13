"use strict";
class Spider extends PIXI.Sprite {
    constructor(x = 0, y = 0, speed = 100) {
        super(PIXI.loader.resources["media/spider.png"].texture);
        this.anchor.set(0.5, 0.5); // position, scaling, rotating etc are now from center of sprite
        this.scale.set(0.1);
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.w2 = this.width / 2;
        this.h2 = this.height / 2;
    }

    update(newX, newY) {
        this.x = clamp(newX, 150, sceneWidth - 100);
        this.y = clamp(newY, this.h2 + 150, sceneHeight - 50);
    }
}

class Liquid extends PIXI.Sprite {
    constructor(x = 0, y = 0, speed = 500, liquidType = 1) {
        super(liquidsTextures[liquidType - 1]);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
        //variables
        this.fwd = {
            x: 0,
            y: -1
        };
        this.speed = speed;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y -= this.fwd.y * this.speed * dt;
    }
}

class Background extends PIXI.Sprite {
    constructor(x = 0, y = 0, width, height, gameState, scale = 1) {
        super(backgroundImgs[gameState]);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        if (scale != 1) {
            this.width *= scale;
            this.height *= scale;
        }
    }
}