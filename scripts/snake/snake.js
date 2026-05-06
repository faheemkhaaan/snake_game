


class Snake {

    constructor() {

        this.skeleton = new SnakeSkeleton(100, 10);
        this.skin = new SnakeSkin(this.skeleton.segments);
        this.controls = new Controls()
        this.thickness = 15; // How wide the snake is

    }
    get head() {
        return this.skeleton.points[0];
    }
    update() {
        this.head.update(0, this.controls.keys);
        this.skeleton.update();
        this.skin.update();
    }

    draw(ctx) {
        // this.points.forEach(p => p.draw(ctx));
        // this.skeleton.draw(ctx);
        this.skin.draw(ctx);
    }



}