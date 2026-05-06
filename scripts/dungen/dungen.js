

class Dungen {
    constructor() {

        this.minimumRooms = 5;
        this.minimumSize = 30;
        this.root = new Cell(new Vector(0, 0), new Vector(width, height));
    }


    divide() {
        let rooms = 0;
        while (rooms < this.minimumRooms) {
            if (this.root.divide(this.minimumSize)) {
                rooms++
            }
        }
    }



}