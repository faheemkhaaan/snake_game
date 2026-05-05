

class Controls {
    constructor() {
        this.mouse = new Vector(0, 0);
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowDown: false,
            ArrowUp: false
        }
        this.#addEventListeners();
    }

    #addEventListeners() {

        document.addEventListener("mousemove", (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        document.addEventListener("keydown", e => {

            if (e.key in this.keys) {
                this.keys[e.key] = true;
                // console.log(`${e.key} Pressed`)
            }
        })
        document.addEventListener("keyup", e => {
            if (e.key in this.keys) {
                this.keys[e.key] = false;
                // console.log(`${e.key} Pressed`)
            }
        })
    }
}