const scaler = 5;
const gridSize = 20 * scaler;

class Dungen {
    constructor() {

        this.minimumRooms = 3 * scaler;
        this.minimumSize = 2 * gridSize;
        this.root = new Cell(new Vector(0, 0), new Vector(width, height));
    }


    divide() {
        let rooms = 0;
        while (rooms < this.minimumRooms) {
            if (this.root.divide(this.minimumSize)) {
                rooms++
            }
        }
        return this;
    }

    shrink() {
        this.root.shrink(this.minimumSize);
    }


    draw(ctx) {
        this.root.draw(ctx);
    }

}