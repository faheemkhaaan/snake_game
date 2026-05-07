

class Hall {
    constructor(hallMin, hallMax) {
        this.hallMin = hallMin;
        this.hallMax = hallMax;

        this.width = this.hallMax.x - this.hallMin.x;
        this.height = this.hallMax.y - this.hallMin.y;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "grey"
        ctx.fillRect(this.hallMin.x, this.hallMin.y, this.width, this.height);
    }
}