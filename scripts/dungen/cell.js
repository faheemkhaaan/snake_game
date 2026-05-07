

class Cell {
    /**
     * 
     * @param {Vector} pos1
     * @param {Vector} pos2
     */
    constructor(pos1, pos2) {
        this.topLeft = pos1;
        this.bottomRight = pos2;
        this.roomMin = null;
        this.roomMax = null;
        this.roomWdith = null;
        this.roomHeight = null;
        this.width = this.bottomRight.x - this.topLeft.x;
        this.height = this.bottomRight.y - this.topLeft.y;
        this.left = null;
        this.right = null;

        this.hNeighbours = [];
        this.vNeighbours = [];

        this.hHalls = [];
        this.vHalls = [];
    }
    calculateRoomDimension() {
        this.roomWdith = this.roomMax.x - this.roomMin.x;
        this.roomHeight = this.roomMax.y - this.roomMin.y;
    }

    getLeaves(cells) {
        if (this.left) {
            this.left.getLeaves(cells);
            this.right.getLeaves(cells)
        } else {
            cells.push(this);
        }
    }

    divide(minimumSize) {
        if (this.width < minimumSize && this.height < minimumSize) {
            return false;
        }

        if (this.left !== null) {
            if (Math.random() > 0.5) {
                return this.left.divide(minimumSize);
            } else {
                return this.right.divide(minimumSize);
            }
        }

        if (this.width > this.height) {
            // Find a split point between minimumSize and (totalWidth - minimumSize)
            const minSplit = minimumSize;
            const maxSplit = this.width - minimumSize;

            // If the range is too small to split fairly, return false
            if (maxSplit <= minSplit) return false;

            const splitOffset = Vector.lerp(minSplit, maxSplit, Math.random())
            const midx = this.topLeft.x + splitOffset;
            // const midx = this.topLeft.x + Math.floor((Math.random() * 0.3 + 0.3) * this.width);
            this.left = new Cell(new Vector(this.topLeft.x, this.topLeft.y), new Vector(midx, this.bottomRight.y));
            this.right = new Cell(new Vector(midx, this.topLeft.y), new Vector(this.bottomRight.x, this.bottomRight.y));
        } else {
            const minSplit = minimumSize;
            const maxSplit = this.height - minimumSize;

            if (maxSplit <= minSplit) return false;

            const splitOffset = Math.floor(Math.random() * (maxSplit - minSplit) + minSplit);
            const midy = this.topLeft.y + splitOffset;
            // const midy = this.topLeft.y + Math.floor((Math.random() * 0.3 + 0.3) * this.height);
            this.left = new Cell(new Vector(this.topLeft.x, this.topLeft.y), new Vector(this.bottomRight.x, midy));
            this.right = new Cell(new Vector(this.topLeft.x, midy), new Vector(this.bottomRight.x, this.bottomRight.y));
        }

        return true;
    }

    shrink(minimumSize) {
        // console.log(scalerX, scalerX)
        if (this.left) {
            this.left.shrink(minimumSize);
            this.right.shrink(minimumSize);
        } else {
            const paddingX = Math.floor(this.width * 0.15);
            const paddingY = Math.floor(this.height * 0.15);

            this.roomMin = new Vector(this.topLeft.x + paddingX, this.topLeft.y + paddingY);
            this.roomMax = new Vector(this.bottomRight.x - paddingX, this.bottomRight.y - paddingY);
            // console.log(scalerX, scalerY)
            // this.roomtopLeft = new Vector(this.topLeft.x + scalerX, this.topLeft.y + scalerY);
            // this.roombottomRight = new Vector(this.bottomRight.x - scalerX, this.bottomRight.y - scalerY);
            this.calculateRoomDimension()
        }

    }
    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (this.left) {
            this.left.draw(ctx);
            this.right.draw(ctx);
        } else {
            ctx.beginPath();
            // ctx.strokeRect(this.topLeft.x, this.topLeft.y, this.width, this.height);
            if (this.roomMin && this.roomMax) {
                this.vHalls.forEach(v => v.draw(ctx))
                this.hHalls.forEach(h => h.draw(ctx))
                ctx.fillStyle = "darkGrey"
                ctx.fillRect(this.roomMin.x, this.roomMin.y, this.roomWdith, this.roomHeight);

            }
        }
    }
}