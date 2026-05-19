


class Snake {

    constructor() {

        this.skeleton = new SnakeSkeleton(200, 10);
        this.skin = new SnakeSkin(this.skeleton.segments);
        this.controls = new Controls()
        this.thickness = 25; // How wide the snake is

    }
    get head() {
        return this.skeleton.points[0];
    }

    spawn(pos) {
        this.skeleton.points[0].pos = new Vector(pos.x, pos.y);

        // We should also move all other segments to the same spot 
        // so the snake doesn't start "stretched" across the map
        for (let i = 1; i < this.skeleton.points.length; i++) {
            this.skeleton.points[i].pos = new Vector(pos.x + (i * 10), pos.y + (i * 10));
        }
    }
    update(cells) {

        this.head.update(0, this.controls.keys);
        this.skeleton.update(cells);
        this.skin.update();
    }

    draw(ctx) {
        // this.points.forEach(p => p.draw(ctx));
        // this.skeleton.draw(ctx);
        this.skin.draw(ctx);
    }



}