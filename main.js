

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
    let rooms = 0;
    while (true) {
        // clearCanvas();



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

