const scaler = 5;
const gridSize = 20 * scaler;

class Dungen {
    constructor() {

        this.minimumRooms = 2 * scaler;
        this.minimumSize = 2 * gridSize;
        this.root = new Cell(new Vector(0, 0), new Vector(width, height));
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
                if (c1.rightSide.x === c2.leftSide.x) {
                    if (Math.max(c1.leftSide.y, c2.leftSide.y) < Math.min(c1.rightSide.y, c2.rightSide.y)) {
                        c1.hNeighbours.push(c2);
                    }
                }
                if (c1.rightSide.y === c2.leftSide.y) {

                    if (Math.max(c1.leftSide.x, c2.leftSide.x) < Math.min(c1.rightSide.x, c2.rightSide.x)) {
                        c1.vNeighbours.push(c2);
                    }
                }

            }
        }
        console.log(this.cells);
        return this;
    }

    shrink() {
        this.root.shrink(this.minimumSize);
    }


    draw(ctx) {
        this.root.draw(ctx);
    }

}