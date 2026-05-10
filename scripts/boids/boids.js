

class Boid {
    constructor(pos) {
        this.pos = pos;
        this.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
        this.acceleration = new Vector(0, 0);
        this.maxForce = 0.2;
        this.maxSpeed = 4;

        this.intervals = 120;
        this.frame = 0;

    }

    applyForce(force) {
        this.acceleration = Vector.add(this.acceleration, force);
    }
    update(cells) {

        this.velocity = Vector.add(this.velocity, this.acceleration);
        // console.log({ acceleration: this.acceleration, pos: this.pos })
        this.pos = Vector.add(this.pos, this.velocity);
        // this.velocity = this.velocity.limit(this.maxSpeed); // 
        // this.collideWithWalls(cells)

        this.acceleration = new Vector(0, 0);


    }

    applyBoid(others) {

        // seperation , alignment , cohision.

        let seperation = this.seperate(others);
        let alignment = this.alignment(others);
        let cohision = this.cohision(others);

        seperation = Vector.mult(seperation, 1.5);
        alignment = Vector.mult(alignment, 1.1);
        cohision = Vector.mult(cohision, 1.2);
        // console.log({ seperation, alignment, cohision, pos: this.pos, acceleration: this.acceleration, velocity: this.velocity })
        this.applyForce(seperation);
        this.applyForce(alignment)
        this.applyForce(cohision)

    }
    seperate(others) {
        let seperation = new Vector(0, 0);
        let count = 0
        others.forEach(other => {
            if (other === this) return;

            const diff = Vector.sub(this.pos, other.pos);
            const distance = diff.mag()
            if (distance < 100) {
                const strength = 1 / Math.max(distance, 0.1);
                let repulsion = diff.copy();
                repulsion.normalize()
                repulsion.mult(strength);

                seperation.add(repulsion);
                count++
            }

        });

        if (count > 0) {
            seperation
                .div(count)
                .sub(this.pos)
                .normalize()
                .mult(this.maxSpeed)
                .sub(this.velocity)
                .limit(this.maxForce);

        }
        return seperation;
    }

    alignment(others) {
        let alignment = new Vector(0, 0);
        let count = 0;
        others.forEach(other => {
            if (other === this) return;
            const diff = Vector.sub(this.pos, other.pos);
            const distance = diff.mag()

            if (distance < 100) {
                alignment.add(other.velocity);
                count++
            }
        });

        if (count > 0) {
            alignment
                .div(count)
                .sub(this.pos)
                .normalize()
                .mult(this.maxSpeed)
                .sub(this.velocity)
                .limit(this.maxForce);

        }

        return alignment
    }

    cohision(others) {
        let cohision = new Vector(0, 0);
        let count = 0;
        others.forEach(other => {
            if (other === this) return;
            const diff = Vector.sub(this.pos, other.pos);
            const distance = diff.mag();
            if (distance < 100) {
                cohision.add(other.pos);
                count++
            }
        });
        if (count > 0) {
            cohision.div(count)
                .sub(this.pos)
                .normalize()
                .mult(this.maxSpeed)
                .sub(this.velocity)
                .limit(this.maxForce)
        }
        return cohision
    }


    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.fillRect(this.pos.x, this.pos.y, 20, 20);
    }
}