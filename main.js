

/**
 * @type {HTMLCanvasElement}
 */
const canvas = myCanvas;
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;


const snake = new Snake()

function animate(time) {
    clearCanvas();
    // snake.update();
    // snake.draw(ctx);

    requestAnimationFrame((time) => animate(time));
}

function* animteGenerator() {
    while (true) {
        clearCanvas();

        snake.update();
        snake.draw(ctx);

        yield "Frame complete"
    }
}

const simulation = animteGenerator();

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        simulation.next();
    } else if (e.code === "Tab") {
        animate()
    }
})

animate(0);

