

class SnakeSkin {
    constructor(segments, thickness = 15) {
        this.segments = segments;
        this.vertices = [];

        this.thickness = thickness;
        this.capResolution = 6;
        this.leftEye = null;
        this.rightEye = null;
    }

    getRoundedCap(center, direction, radius, isHead = true) {
        const points = [];
        // Get the base angle of the segment
        const baseAngle = direction.angle();

        // If head, we go from -PI/2 to PI/2. If tail, we go from PI/2 to 3PI/2.
        const startAngle = isHead ? baseAngle - Math.PI / 2 : baseAngle + Math.PI / 2;
        const endAngle = isHead ? baseAngle + Math.PI / 2 : baseAngle + 3 * Math.PI / 2;

        for (let i = 0; i <= this.capResolution; i++) {
            const angle = Vector.lerp(startAngle, endAngle, i / this.capResolution);

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

            // 1. Handle the Head Cap (on the first segment's p1)
            if (i === 0) {
                const headDir = seg.getDir().mult(-1); // Pointing out from the head
                const headPoints = this.getRoundedCap(seg.p1.pos, headDir, seg.p1.radius, true);
                // The first half go to left side, second half to right side
                // But for a continuous path, it's easier to just store them in order
                headCap = headPoints;
            }
            if (i === 1) {
                this.leftEye = seg.side(seg.p1.radius * 0.65)
                this.rightEye = seg.side(-seg.p1.radius * 0.65)
            }

            // 2. Standard body points
            leftSide.push(seg.side(seg.p1.radius));
            rightSide.push(seg.side(-seg.p1.radius));

            // 3. Handle the Tail Cap (on the last segment's p2)
            if (i === this.segments.length - 1) {
                const tailDir = seg.getDir(); // Pointing out from the tail
                tailCap = this.getRoundedCap(seg.p2.pos, tailDir, -seg.p2.radius, false);
            }
        });

        // Combine everything into one continuous path for drawing
        this.vertices = [
            ...headCap,
            ...leftSide,
            ...tailCap,
            ...rightSide.reverse()
        ];
        console.log(this.vertices.length)
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @returns 
     */
    draw(ctx) {
        if (this.vertices.length < 2) return;
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
        ctx.fill('nonzero');
        ctx.stroke();
        if (this.leftEye) {
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.arc(this.leftEye.x, this.leftEye.y, 3, 0, Math.PI * 2);
            ctx.arc(this.rightEye.x, this.rightEye.y, 3, 0, Math.PI * 2);
            ctx.fill()
        }
    }
}