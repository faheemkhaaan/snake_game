

class SnakeSkeleton {
    constructor(segmentCount, spacing) {
        this.points = [];
        this.segments = [];

        this.build(segmentCount, spacing)
    }



    build(segmentCount, spacing, radiusScaler = 1.5) {
        const radiuss = [
            12, 15, 16, 15, 13, // Head and Neck (slight taper at index 4)
            14, 14, 14, 14, 14, // Front body
            14, 14, 14, 14, 14, // Mid body
            14, 14, 14, 14, 14, // Mid body
            14, 14, 14, 14, 14, // Mid body
            14, 14, 14, 14, 14, // Mid body
            13, 13, 12, 12, 11, // Beginning of taper
            10, 9, 8, 7, 6,     // Tail narrowing
            5, 4, 3, 2, 1.5,    // End of tail
            1, 0.8, 0.5, 0.2    // Tip
        ];
        for (let i = 0; i < radiuss.length; i++) {
            this.points.push(new Point(new Vector(100 + (spacing * radiusScaler * i), 100), radiuss[i] * radiusScaler));
        }
        for (let i = 0; i < this.points.length - 1; i++) {
            this.segments.push(new Segment(this.points[i], this.points[i + 1]));
        }
    }
    applyPhysics(cells) {
        for (let i = 0; i < 5; i++) {
            this.segments.forEach(s => s.applyDistanceConstraint());
        }
        for (let i = 0; i < this.segments.length - 1; i++) {
            this.segments[i].angleAngleConstraint(this.segments[i + 1], 145)
        }
        if (cells) {
            this.points.forEach(p => p.resolveWallPenetration(cells));
        }
    }
    update(cells) {
        this.applyPhysics(cells);
    }
    draw(ctx) {
        this.points.forEach(p => p.draw(ctx, { fill: false }));
        this.segments.forEach(s => s.draw(ctx));
    }
}