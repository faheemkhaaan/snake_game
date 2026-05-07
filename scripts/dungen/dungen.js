const scaler = 8;
const gridSize = 20 * scaler;
const hallWidth = 40 * 3;
class Dungen {
    constructor() {

        this.minimumRooms = 2 * scaler;
        this.minimumSize = 2 * gridSize;
        this.root = new Cell(new Vector(0, 0), new Vector(width * scaler, height * scaler));
        /**
         * @type {Cell[]}
         */
        this.cells = []

    }


    divide() {
        let rooms = 0;
        let attempts = 0;
        while (rooms < this.minimumRooms && attempts < 500) {
            if (this.root.divide(this.minimumSize)) {
                rooms++
            }
            attempts++
        }
        return this;
    }

    getNeighbours() {
        this.root.getLeaves(this.cells);

        for (const c1 of this.cells) {
            for (const c2 of this.cells) {
                if (c1 === c2) continue;
                if (c1.bottomRight.x === c2.topLeft.x) {
                    if (Math.max(c1.topLeft.y, c2.topLeft.y) < Math.min(c1.bottomRight.y, c2.bottomRight.y)) {
                        c1.hNeighbours.push(c2);
                    }
                }
                if (c1.bottomRight.y === c2.topLeft.y) {

                    if (Math.max(c1.topLeft.x, c2.topLeft.x) < Math.min(c1.bottomRight.x, c2.bottomRight.x)) {
                        c1.vNeighbours.push(c2);
                    }
                }

            }
        }
        // console.log(this.cells);
        return this;
    }

    addHalls() {
        for (const c1 of this.cells) {

            for (const c2 of c1.hNeighbours) {
                if (Math.min(c1.roomMax.y, c2.roomMax.y) - Math.max(c1.roomMin.y, c2.roomMin.y) > hallWidth) {
                    // const minY = Math.max(c1.roomMin.y, c2.roomMin.y);
                    // const maxY = Math.min(c1.roomMax.y, c2.roomMax.y);
                    // const diff = maxY - minY;
                    // const hallY = Math.floor(diff * 0.5 + minY)
                    // const hallMin = new Vector(c1.roomMax.x, hallY)
                    // const hallMax = new Vector(c2.roomMin.x, hallY + hallWidth);
                    // c1.hHalls.push(new Hall(hallMin, hallMax));

                    const overlapMinY = Math.max(c1.roomMin.y, c2.roomMin.y);
                    const overlapMaxY = Math.min(c1.roomMax.y, c2.roomMax.y);
                    const overlapHeight = overlapMaxY - overlapMinY;

                    // Only build a hall if the rooms actually "see" each other vertically
                    if (overlapHeight > hallWidth) {
                        // Fix: hallY must be relative to the overlapMinY
                        const hallY = overlapMinY + (overlapHeight / 2) - (hallWidth / 2);

                        const hallMin = new Vector(c1.roomMax.x, hallY);
                        const hallMax = new Vector(c2.roomMin.x, hallY + hallWidth);

                        c1.hHalls.push(new Hall(hallMin, hallMax));
                    }
                }


            }

            for (const c2 of c1.vNeighbours) {
                if (Math.min(c1.roomMax.x, c2.roomMax.x) - Math.max(c1.roomMin.x, c2.roomMin.x) > hallWidth) {
                    // const minX = Math.max(c1.roomMin.x, c2.roomMin.x);
                    // const maxX = Math.min(c1.roomMax.x, c2.roomMax.x);

                    // const diff = maxX - minX;
                    // const hallX = Math.floor(diff * 0.5 + minX);
                    // const hallMin = new Vector(hallX, c1.roomMax.y);
                    // const hallMax = new Vector(hallX + hallWidth, c2.roomMin.y);
                    // c1.vHalls.push(new Hall(hallMin, hallMax));

                    const overlapMinX = Math.max(c1.roomMin.x, c2.roomMin.x);
                    const overlapMaxX = Math.min(c1.roomMax.x, c2.roomMax.x);
                    const overlapWidth = overlapMaxX - overlapMinX;

                    if (overlapWidth > hallWidth) {
                        // Fix: hallX must be relative to the overlapMinX
                        const hallX = overlapMinX + (overlapWidth / 2) - (hallWidth / 2);

                        const hallMin = new Vector(hallX, c1.roomMax.y);
                        const hallMax = new Vector(hallX + hallWidth, c2.roomMin.y);

                        c1.vHalls.push(new Hall(hallMin, hallMax));
                    }
                }
            }
        }
    }
    shrink() {
        this.root.shrink(this.minimumSize);
        return this
    }


    draw(ctx) {
        this.root.draw(ctx);
    }

}