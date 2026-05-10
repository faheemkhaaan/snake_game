

class World {
    constructor() {

        this.snake = new Snake();
        this.dungen = new Dungen();
        this.camera = new Camera();
        this.setup();
        this.firstCell = this.dungen.cells[0]
        this.boids = Array.from({ length: 50 }, () => {
            const centerX = this.firstCell.roomMin.x + this.firstCell.roomWdith / 2;
            const centerY = this.firstCell.roomMin.y + this.firstCell.roomHeight / 2;

            // Add a tiny random offset so they aren't exactly on top of each other
            return new Boid(new Vector(
                centerX + (Math.random() - 0.5) * 10,
                centerY + (Math.random() - 0.5) * 10
            ));
        })
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
        this.boids.forEach(b => b.applyBoid(this.boids))
        this.boids.forEach(b => b.update(this.dungen.cells))


        // this.dungen.update();
    }

    draw(ctx) {
        this.camera.apply(ctx);
        this.dungen.draw(ctx);
        this.snake.draw(ctx);
        this.boids.forEach(b => b.draw(ctx))

        this.camera.release(ctx);
    }
}