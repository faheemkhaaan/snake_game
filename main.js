

/**
 * @type {HTMLCanvasElement}
 */
const canvas = myCanvas;
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;


const world = new World();
function animate(time) {
    clearCanvas();

    world.update()
    world.draw(ctx);


    requestAnimationFrame((time) => animate(time));
}

function* animteGenerator() {
    while (true) {
        // clearCanvas();

        world.update()
        world.draw(ctx);


        yield "Frame complete"
    }
}

const simulation = animteGenerator();

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        simulation.next();

    } else if (e.code === "KeyW") {
        animate()
    }
})

animate(0);

