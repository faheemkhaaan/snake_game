

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    mag() {
        return Math.hypot(this.y, this.x);
    }
    norm() {
        const mag = this.mag();
        if (mag !== 0) {
            return new Vector(this.x / mag, this.y / mag);
        }
        return new Vector(0, 0);
    }

    angle() {
        return Math.atan2(this.y, this.x)
    }
    mult(factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }
    divide(factor) {
        if (factor === 0) return new Vector(0, 0);
        return new Vector(this.x / factor, this.y / factor);
    }
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }


    static normal(v) {
        return new Vector(v.y, -v.x).norm();
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    static cross(v1, v2) {
        return v1.x * v2.y - v2.x * v1.y;
    }

    static angleBetween(v1, v2) {
        // when we pass the cross product it acts like a sin theata and the dot_product acts like a cos theata.
        // Math.atan2(cross_product,dot_product)
        // Math.atan2(sin0,cos0)
        return Math.atan2(Vector.cross(v1, v2), Vector.dot(v1, v2));
    }

    static calculateAngle(v1, v2) {
        const angle1 = Math.atan2(v1.y, v1.x);
        const angle2 = Math.atan2(v2.y, v2.x);

        let angle = angle2 - angle1;

        // Normalize to standard -PI to PI bounds
        while (angle <= -Math.PI) angle += Math.PI * 2;
        while (angle > Math.PI) angle -= Math.PI * 2;

        return angle;
    }
    static add(a, b) {
        return new Vector(a.x + b.x, a.y + b.y);
    }
    static sub(a, b) {
        return new Vector(a.x - b.x, a.y - b.y);
    }
    static mult(v, factor) {
        return new Vector(v.x * factor, v.y * factor);
    }
    static divide(v, factor) {
        if (factor === 0) return new Vector(0, 0);
        return new Vector(v.x / factor, v.y / factor)
    }
    static lerp(a, b, t) {
        return a + (b - a) * t
    }
}

// cross product x1y2 - x2y1
// dot product x1x2 + y1y2