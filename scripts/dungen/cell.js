

class Cell {
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
    }

    divide(minimumSize) {
        if (this.size.x < minimumSize && this.size.y < minimumSize) {
            return false;
        }
    }
}