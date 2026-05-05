

class SnakeSkin {
    constructor(segments, thickness = 25) {
        this.segments = segments;
        this.vertices = [];
        this.thickness = thickness;
        this.capResolution = 6;
    }
    getRoundedCap(center, direction, radius, isHead = true) {
        const points = [];
        // Get the base angle of the segment
        const baseAngle = Math.atan2(direction.y, direction.x);

        // If head, we go from -PI/2 to PI/2. If tail, we go from PI/2 to 3PI/2.
        const startAngle = isHead ? baseAngle - Math.PI / 2 : baseAngle + Math.PI / 2;
        const endAngle = isHead ? baseAngle + Math.PI / 2 : baseAngle + 3 * Math.PI / 2;

        for (let i = 0; i <= this.capResolution; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / this.capResolution);
            points.push(new Vector(
                center.x + Math.cos(angle) * radius,
                center.y + Math.sin(angle) * radius
            ));
        }
        return points;
    }
    update() {
        const leftSide = [];
        const rightSide = [];
        let tailCap = [];
        let headCap = []
        this.segments.forEach((seg, i) => {
            const taper = this.thickness * (1 - (i / this.segments.length) * 0.5);

            // 1. Handle the Head Cap (on the first segment's p1)
            if (i === 0) {
                const headDir = seg.getDir().mult(-1); // Pointing out from the head
                const headPoints = this.getRoundedCap(seg.p1.pos, headDir, this.thickness, true);
                // The first half go to left side, second half to right side
                // But for a continuous path, it's easier to just store them in order
                headCap = headPoints;
            }

            // 2. Standard body points
            leftSide.push(seg.side(this.thickness));
            rightSide.push(seg.side(-this.thickness));

            // 3. Handle the Tail Cap (on the last segment's p2)
            if (i === this.segments.length - 1) {
                const tailDir = seg.getDir(); // Pointing out from the tail
                tailCap = this.getRoundedCap(seg.p2.pos, tailDir, -this.thickness, false);
            }
        });

        // Combine everything into one continuous path for drawing
        this.vertices = [
            ...headCap,
            ...leftSide,
            ...tailCap,
            ...rightSide.reverse()
        ];
    }

    draw(ctx) {
        if (this.vertices.length < 2) return;
        // ctx.beginPath();
        // ctx.fillStyle = "#2ecc71";
        // ctx.strokeStyle = "#27ae60";
        // ctx.lineWidth = 2;

        // ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        // for (let i = 1; i < this.vertices.length; i++) {
        //     ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        // }

        // ctx.closePath();
        // ctx.fill();
        // ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "#2ecc71";
        ctx.strokeStyle = "#27ae60";
        ctx.lineWidth = 2;

        // 1. Move to the midpoint between the first and last vertex to ensure a closed smooth loop
        const first = this.vertices[0];
        const last = this.vertices[this.vertices.length - 1];
        let midX = (first.x + last.x) / 2;
        let midY = (first.y + last.y) / 2;

        ctx.moveTo(midX, midY);

        // 2. Loop through vertices and curve through midpoints
        for (let i = 0; i < this.vertices.length; i++) {
            const p1 = this.vertices[i];
            const p2 = this.vertices[(i + 1) % this.vertices.length]; // Next vertex (wrapped)

            // Calculate midpoint between current point and next point
            const midNextX = (p1.x + p2.x) / 2;
            const midNextY = (p1.y + p2.y) / 2;

            // Use p1 as the control point, and midNext as the anchor
            ctx.quadraticCurveTo(p1.x, p1.y, midNextX, midNextY);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}