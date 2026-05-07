

class Camera {
    constructor() {
        this.pos = new Vector(0, 0);
        this.lerpFactor = 0.1;
        this.shakeIntensity = 2
    }


    follow(target) {

        const centerX = width / 2;
        const centerY = height / 2;

        const targetX = centerX - target.pos.x;
        const targetY = centerY - target.pos.y;

        this.pos.x = Vector.lerp(this.pos.x, targetX, this.lerpFactor);
        this.pos.y = Vector.lerp(this.pos.y, targetY, this.lerpFactor);
    }

    apply(ctx) {
        ctx.save();
        const shakeX = Math.random() * this.shakeIntensity;
        const shakeY = Math.random() * this.shakeIntensity;
        ctx.translate(this.pos.x, this.pos.y);
    }

    release(ctx) {
        ctx.restore();
    }
}