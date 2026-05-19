

class SnakeSkeleton {
    constructor(segmentCount, spacing) {
        this.points = [];
        this.segments = [];

        this.build(segmentCount, spacing)
    }
    getSegmentThickness(index, totalSegments) {
        // Head (first 5 segments)
        if (index === 0) return 14;  // Snout
        if (index === 1) return 18;  // Head widest
        if (index === 2) return 17;  // Head-narrowing
        if (index === 3) return 15;  // Neck
        if (index === 4) return 13;  // Neck

        // Tail (last 8 segments)
        const segmentsFromEnd = totalSegments - 1 - index;
        const tailSizes = [0.2, 0.3, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13.5];
        if (segmentsFromEnd < tailSizes.length) {
            return tailSizes[Math.min(segmentsFromEnd, tailSizes.length - 1)] || 0.3;
        }

        // Main body
        return 14;
    }

    build(segmentCount, spacing, radiusScaler = 1.5) {

        for (let i = 0; i < segmentCount; i++) {
            const radius = this.getSegmentThickness(i, segmentCount)
            this.points.push(new Point(new Vector(100 + (spacing * radiusScaler * i), 100), radius * radiusScaler));
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
            this.segments[i].angleAngleConstraint(this.segments[i + 1], 40)
        }
        if (cells) {
            for (let i = 0; i < 5; i++) {
                this.points.forEach(p => p.resolveWallPenetration(cells));
            }
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