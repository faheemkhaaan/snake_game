

class World {
    constructor() {

        this.snake = new Snake();
        this.dungen = new Dungen();
        this.camera = new Camera();
        this.setup();
    }

    setup() {
        this.dungen.divide().getNeighbours().shrink().addHalls();
        const firstCell = this.dungen.cells[0];

        if (firstCell && firstCell.roomMin) {
            // 3. Calculate the center of the room
            const centerX = firstCell.roomMin.x + (firstCell.roomWdith / 2);
            const centerY = firstCell.roomMin.y + (firstCell.roomHeight / 2);

            // 4. Move the snake there
            this.snake.spawn(new Vector(centerX, centerY));
        }
    }


    update() {
        this.snake.update(this.dungen.cells);
        this.camera.follow(this.snake.head);
        // this.dungen.update();
    }

    draw(ctx) {
        this.camera.apply(ctx);
        this.dungen.draw(ctx);
        this.snake.draw(ctx);
        this.camera.release(ctx);
    }
}