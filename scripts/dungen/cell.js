

class Cell {
    /**
     * 
     * @param {Vector} pos1
     * @param {Vector} pos2
     */
    constructor(pos1, pos2) {
        this.leftSide = pos1;
        this.rightSide = pos2;
        this.roomLeftSide = null;
        this.roomRightSide = null;
        this.roomWdith = null;
        this.roomHeight = null;
        this.width = this.rightSide.x - this.leftSide.x;
        this.height = this.rightSide.y - this.leftSide.y;
        this.left = null;
        this.right = null;
    }
    calculateRoomDimension() {
        this.roomWdith = this.roomRightSide.x - this.roomLeftSide.x;
        this.roomHeight = this.roomRightSide.y - this.roomLeftSide.y;
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
            const midx = this.leftSide.x + splitOffset;
            // const midx = this.leftSide.x + Math.floor((Math.random() * 0.3 + 0.3) * this.width);
            this.left = new Cell(new Vector(this.leftSide.x, this.leftSide.y), new Vector(midx, this.rightSide.y));
            this.right = new Cell(new Vector(midx, this.leftSide.y), new Vector(this.rightSide.x, this.rightSide.y));
        } else {
            const minSplit = minimumSize;
            const maxSplit = this.height - minimumSize;

            if (maxSplit <= minSplit) return false;

            const splitOffset = Math.floor(Math.random() * (maxSplit - minSplit) + minSplit);
            const midy = this.leftSide.y + splitOffset;
            // const midy = this.leftSide.y + Math.floor((Math.random() * 0.3 + 0.3) * this.height);
            this.left = new Cell(new Vector(this.leftSide.x, this.leftSide.y), new Vector(this.rightSide.x, midy));
            this.right = new Cell(new Vector(this.leftSide.x, midy), new Vector(this.rightSide.x, this.rightSide.y));
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

            this.roomLeftSide = new Vector(this.leftSide.x + paddingX, this.leftSide.y + paddingY);
            this.roomRightSide = new Vector(this.rightSide.x - paddingX, this.rightSide.y - paddingY);
            // console.log(scalerX, scalerY)
            // this.roomLeftSide = new Vector(this.leftSide.x + scalerX, this.leftSide.y + scalerY);
            // this.roomRightSide = new Vector(this.rightSide.x - scalerX, this.rightSide.y - scalerY);
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
            // ctx.strokeRect(this.leftSide.x, this.leftSide.y, this.width, this.height);
            if (this.roomLeftSide && this.roomRightSide) {
                ctx.strokeRect(this.roomLeftSide.x, this.roomLeftSide.y, this.roomWdith, this.roomHeight);

            }
        }
    }
}