

/**
 * @type {HTMLCanvasElement}
 */
const canvas = myCanvas;
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;


const snake = new Snake();
const dungen = new Dungen();
dungen
    .divide()
    .shrink();
;
console.log(dungen)

function animate(time) {
    clearCanvas();
    // snake.update();
    // snake.draw(ctx);

    dungen.draw(ctx);

    requestAnimationFrame((time) => animate(time));
}

function* animteGenerator() {
    let rooms = 0;
    while (true) {
        // clearCanvas();

        if (rooms < dungen.minimumRooms) {

            if (dungen.root.divide(dungen.minimumSize)) {
                rooms++
            }
        }


        yield "Frame complete"
    }
}

const simulation = animteGenerator();

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        simulation.next();
        dungen.draw(ctx);
        console.log(dungen)

    } else if (e.code === "Tab") {
        animate()
    }
})

animate(0);

