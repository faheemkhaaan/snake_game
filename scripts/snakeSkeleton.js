

class SnakeSkeleton {
    constructor(segmentCount, spacing) {
        this.points = [];
        this.segments = [];

        this.build(segmentCount, spacing)
    }

    build(segmentCount, spacing) {
        // const radiuss = [14, 15, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 11]
        for (let i = 0; i < segmentCount; i++) {
            this.points.push(new Point(new Vector(100 + (spacing * i), 100), 1));
        }
        for (let i = 0; i < this.points.length - 1; i++) {
            this.segments.push(new Segment(this.points[i], this.points[i + 1]));
        }
    }
    applyPhysics() {
        for (let i = 0; i < 5; i++) {
            this.segments.forEach(s => s.applyDistanceConstraint());
        }
        for (let i = 0; i < this.segments.length - 1; i++) {
            this.segments[i].angleAngleConstraint(this.segments[i + 1], 145)
        }
    }
    update() {
        this.applyPhysics();
    }
    draw(ctx) {
        this.points.forEach(p => p.draw(ctx));
        this.segments.forEach(s => s.draw(ctx));
    }
}