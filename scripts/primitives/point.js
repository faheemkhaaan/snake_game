


class Point {
    constructor(pos, rad) {
        this.pos = pos;
        this.velocity = new Vector(0, 0);

        this.acceleration = 2.2
        this.friction = 0.95
        this.max = 8;
        this.radius = rad;
        this.gravity = Math.floor(Math.random() * 8 + 3)
    }

    setPos(pos) {
        this.pos.x = pos.x;
        this.pos.y = pos.y;
    }

    update(delta, keys) {

        if (keys.ArrowUp) {
            this.velocity.y -= this.acceleration;
        }
        if (keys.ArrowDown) {
            this.velocity.y += this.acceleration;
        }
        if (keys.ArrowRight) {
            this.velocity.x += this.acceleration;
        }
        if (keys.ArrowLeft) {
            this.velocity.x -= this.acceleration;
        }
        this.velocity.mult(this.friction);
        const speed = this.velocity.mag();

        if (speed > this.max) {
            this.velocity = this.velocity.norm().mult(this.max);
        }

        this.pos.add(this.velocity)
    }

    draw(ctx, { fill = true, color = "black" } = {}) {
        ctx.beginPath();

        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }

}