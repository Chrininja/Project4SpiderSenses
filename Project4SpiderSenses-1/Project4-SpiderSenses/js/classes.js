class Spider extends PIXI.Sprite {
    constructor(x = 0, y = 0, speed = 100) {
        super(PIXI.loader.resources["images/spider1.png"].texture);
        this.anchor.set(0.5, 0.5); // position, scaling, rotating etc are now from center of sprite
        this.scale.set(0.1);
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
    }

    update() {
        spider.x += this.dx / magnitude(this.dx, this.dy) * this.speed * dt;
        spider.y += this.dy / magnitude(this.dx, this.dy) * this.speed * dt;
    }
}

class Circle extends PIXI.Graphics {
    constructor(radius, color = 0xFF0000, x = 0, y = 0) {
        super();
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        //variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xFFFFFF, x = 0, y = 0) {
        super();
        this.beginFill(color);
        this.drawRect(-40, -40, 40, 40);
        this.endFill();
        this.x = x;
        this.y = y;
        //variables
        this.fwd = {
            x: 0,
            y: -1
        };
        this.speed = 600;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y -= this.fwd.y * this.speed * dt;
    }
}