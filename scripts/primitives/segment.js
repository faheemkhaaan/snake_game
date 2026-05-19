

class Segment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;

        this.pos = Vector.sub(this.p1.pos, this.p2.pos);
        console.log(this.pos)
        this.prevPos = this.pos.clone()
        this.velocity = new Vector(0, 0);
        this.acceleration = 2;
        this.friction = 0.98
        this.length = this.pos.mag();
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

    angleAngleConstraint(seg2, maxBendDegrees) {
        // 1. Calculate vectors radiating OUTWARD from the shared joint
        // Assuming this.p2 is the joint connecting to seg2.p1
        const joint = this.p2.pos; // shared joint

        const v1 = Vector.sub(this.p1.pos, joint);
        const v2 = Vector.sub(seg2.p2.pos, joint); // Fixed: points from p2 to p3

        const angle = Vector.angleBetween(v1, v2);
        // const targetAngle = (targetAngleIndegrees * Math.PI) / 180;


        const v1flipped = Vector.mult(v1, -1); // now points forward like v2
        const bendAngle = Vector.angleBetween(v1flipped, v2); // 0 when straight

        const maxBend = (maxBendDegrees * Math.PI) / 180;

        if (Math.abs(bendAngle) > maxBend) {
            // const halfDiff = (Math.abs(bendAngle) - maxBend) * 0.5 * Math.sign(bendAngle);
            const correction = (Math.abs(bendAngle) - maxBend) * 0.5 * Math.sign(bendAngle);
            // 2. Fixed: Swap rotation signs to pull them towards the target
            v1.rotate(correction);
            v2.rotate(-correction);

            const newP1 = Vector.add(this.p2.pos, v1);

            // Only move p1 if it won't go through a wall
            // if (!cells || this.p1.isCircleWalkable(newP1.x, newP1.y, cells)) {
            //     this.p1.pos = newP1;
            // }
            // 3. Set new positions by projecting outward from the joint
            this.p1.pos = Vector.add(joint, v1);
            seg2.p2.pos = Vector.add(joint, v2);
        }
    }
    update(keys) {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;

        // Apply input
        if (keys.ArrowUp) this.velocity.y -= this.acceleration;
        if (keys.ArrowDown) this.velocity.y += this.acceleration;
        if (keys.ArrowRight) this.velocity.x += this.acceleration;
        if (keys.ArrowLeft) this.velocity.x -= this.acceleration;

        // Apply friction
        this.velocity.mult(this.friction);

        // Clamp velocity to max speed
        const speed = this.velocity.mag();
        if (speed > this.max) {
            this.velocity = this.velocity.norm().mult(this.max);
        }

        this.pos.add(this.velocity);
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