

class Segment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;

        this.diff = Vector.sub(this.p1.pos, this.p2.pos);
        this.length = this.diff.mag();
    }

    side(thickness) {
        return Vector.add(this.p1.pos, Vector.mult(this.getNormal(), thickness))
    }
    getDir() {
        return Vector.sub(this.p2.pos, this.p1.pos);
    }
    getNormal() {
        const direction = this.getDir();
        const normalized = direction.norm();
        return new Vector(normalized.y, -normalized.x);
    }

    /**
     * 
     * 
     * @returns {void}
     */
    applyDistanceConstraint() {
        const currentVector = Vector.sub(this.p1.pos, this.p2.pos);
        const currentLength = currentVector.mag();
        if (currentLength === 0) return;

        const difference = (currentLength - this.length) / currentLength;
        const correction = Vector.mult(currentVector, difference);
        // this.p1.pos = Vector.sub(this.p1.pos, correction);
        this.p2.pos = Vector.add(this.p2.pos, correction);

        // console.log(Math.atan2(this.p1.pos.y, this.p2.pos.x) - Math.atan2(this.p2.pos.y, this.p2.pos.x))
    }

    angleAngleConstraint(seg2, targetAngleIndegrees) {
        // 1. Calculate vectors radiating OUTWARD from the shared joint
        // Assuming this.p2 is the joint connecting to seg2.p1
        const v1 = Vector.sub(this.p1.pos, this.p2.pos);
        const v2 = Vector.sub(seg2.p2.pos, seg2.p1.pos); // Fixed: points from p2 to p3

        const angle = Vector.angleBetween(v1, v2);
        const targetAngle = (targetAngleIndegrees * Math.PI) / 180;

        if (Math.abs(angle) < targetAngle) {
            const diff = angle - (targetAngle * Math.sign(angle));

            // 2. Fixed: Swap rotation signs to pull them towards the target
            v1.rotate(diff * 0.5);
            v2.rotate(-diff * 0.5);

            const newP1 = Vector.add(this.p2.pos, v1);

            // Only move p1 if it won't go through a wall
            // if (!cells || this.p1.isCircleWalkable(newP1.x, newP1.y, cells)) {
            //     this.p1.pos = newP1;
            // }
            // 3. Set new positions by projecting outward from the joint
            this.p1.pos = Vector.add(this.p2.pos, v1);
            seg2.p2.pos = Vector.add(seg2.p1.pos, v2);
        }
    }
    update() {

        this.applyDistanceConstraint();

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.beginPath()
        ctx.moveTo(this.p1.pos.x, this.p1.pos.y);
        ctx.lineTo(this.p2.pos.x, this.p2.pos.y);
        ctx.stroke();
        // this.p1.draw(ctx, { color: "blue" });
        // this.p2.draw(ctx, { color: "yellow" });
    }

}