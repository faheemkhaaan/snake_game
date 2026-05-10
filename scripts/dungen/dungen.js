const scaler = 20;
const gridSize = 20 * scaler;
const hallWidth = 40 * (scaler * 0.3);
class Dungen {
    constructor() {

        this.minimumRooms = 2 * scaler;
        this.minimumSize = 2 * gridSize;
        this.root = new Cell(new Vector(0, 0), new Vector(width * scaler, height * scaler));
        /**
         * @type {Cell[]}
         */
        this.cells = []
        // NEW: The size of one "grid square" in your search map. 
        // Making this roughly the size of your minimum room is a good rule of thumb.
        this.cellSize = this.minimumSize;
        this.spatialMap = new Map();

    }

    /**
     * Creates a Map where keys are grid coordinates ("x,y") 
     * and values are arrays of cells overlapping that coordinate.
     * @param {Cell[]} cells 
     */
    buildSpatialMap(cells) {
        const map = new Map();
        for (const cell of cells) {
            // Find the grid boundaries for this specific cell
            const minX = Math.floor(cell.topLeft.x / this.cellSize);
            const maxX = Math.floor(cell.bottomRight.x / this.cellSize);
            const minY = Math.floor(cell.topLeft.y / this.cellSize);
            const maxY = Math.floor(cell.bottomRight.y / this.cellSize);

            // Add this cell to every grid bucket it touches
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const key = `${x},${y}`;
                    if (!map.has(key)) map.set(key, []);
                    map.get(key).push(cell);
                }
            }
        }
        return map;
    }
    /**
 * Returns all cells stored in the grid bucket containing world coordinate x, y.
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 * @returns {Cell[]}
 */
    getPotentialCells(x, y) {
        const gx = Math.floor(x / this.cellSize);
        const gy = Math.floor(y / this.cellSize);
        const key = `${gx},${gy}`;
        return this.spatialMap.get(key) || [];
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

    // getNeighbours() {
    //     this.root.getLeaves(this.cells);

    //     for (const c1 of this.cells) {

    //         for (const c2 of this.cells) {
    //             if (c1 === c2) continue;
    //             if (c1.bottomRight.x === c2.topLeft.x) {
    //                 if (Math.max(c1.topLeft.y, c2.topLeft.y) < Math.min(c1.bottomRight.y, c2.bottomRight.y)) {
    //                     c1.hNeighbours.push(c2);
    //                 }
    //             }
    //             if (c1.bottomRight.y === c2.topLeft.y) {

    //                 if (Math.max(c1.topLeft.x, c2.topLeft.x) < Math.min(c1.bottomRight.x, c2.bottomRight.x)) {
    //                     c1.vNeighbours.push(c2);
    //                 }
    //             }

    //         }
    //     }
    //     // console.log(this.cells);
    //     return this;
    // }

    getNeighbours() {
        this.root.getLeaves(this.cells);
        this.spatialMap = this.buildSpatialMap(this.cells);

        for (const c1 of this.cells) {

            const probeX = c1.bottomRight.x + 1;


            for (let y = c1.topLeft.y; y < c1.bottomRight.y; y += this.cellSize / 2) {
                const candidate = this.getPotentialCells(probeX, y);

                for (const c2 of candidate) {
                    if (c1 === c2) continue;
                    if (c1.bottomRight.x === c2.topLeft.x) {
                        const overLap = Math.max(c1.topLeft.y, c2.topLeft.y) < Math.min(c1.bottomRight.y, c2.bottomRight.y)
                        if (overLap) {
                            if (!c1.hNeighbours.includes(c2)) c1.hNeighbours.push(c2);
                        }
                    }
                }
            }
            const probeY = c1.bottomRight.y + 1;

            for (let x = c1.topLeft.x; x < c1.bottomRight.x; x += this.cellSize / 2) {
                const candidates = this.getPotentialCells(x, probeY);

                for (const c2 of candidates) {
                    if (c1 === c2) continue;
                    // If c1's bottom wall touches c2's top wall
                    if (c1.bottomRight.y === c2.topLeft.y) {
                        // Check if they actually overlap horizontally (x-axis)
                        if (Math.max(c1.topLeft.x, c2.topLeft.x) < Math.min(c1.bottomRight.x, c2.bottomRight.x)) {
                            if (!c1.vNeighbours.includes(c2)) c1.vNeighbours.push(c2);
                        }
                    }
                }
            }
        }
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