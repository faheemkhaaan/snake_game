class Point {
    constructor(pos, rad) {
        this.pos = pos;
        this.velocity = new Vector(0, 0);
        this.prevPos = new Vector(pos.x, pos.y);

        this.acceleration = 2.2;
        this.friction = 0.95;
        this.max = 20;
        this.radius = rad;
        this.gravity = Math.floor(Math.random() * 8 + 3);

        // Collision resolution settings
        this.collisionSteps = 4;
        this.circleCheckPoints = 12;

        // Spatial hashing cache
        this.spatialMap = null;
        this.cellSize = 100;
        this.lastMapUpdate = 0;
        this.mapUpdateInterval = 120;
    }

    /**
     * Build spatial hash map for O(1) cell lookups
     * @param {Cell[]} cells
     */
    buildSpatialMap(cells) {
        const spatialMap = new Map();

        cells.forEach(cell => {
            // Hash room bounds
            const minCellX = Math.floor(cell.roomMin.x / this.cellSize);
            const maxCellX = Math.floor(cell.roomMax.x / this.cellSize);
            const minCellY = Math.floor(cell.roomMin.y / this.cellSize);
            const maxCellY = Math.floor(cell.roomMax.y / this.cellSize);

            for (let x = minCellX; x <= maxCellX; x++) {
                for (let y = minCellY; y <= maxCellY; y++) {
                    const key = `${x},${y}`;
                    if (!spatialMap.has(key)) {
                        spatialMap.set(key, []);
                    }
                    spatialMap.get(key).push(cell);
                }
            }

            // IMPORTANT: Also hash hall bounds so they're findable!
            // Horizontal halls
            if (cell.hHalls && cell.hHalls.length > 0) {
                for (const hall of cell.hHalls) {
                    const hallMinCellX = Math.floor(hall.hallMin.x / this.cellSize);
                    const hallMaxCellX = Math.floor(hall.hallMax.x / this.cellSize);
                    const hallMinCellY = Math.floor(hall.hallMin.y / this.cellSize);
                    const hallMaxCellY = Math.floor(hall.hallMax.y / this.cellSize);

                    for (let x = hallMinCellX; x <= hallMaxCellX; x++) {
                        for (let y = hallMinCellY; y <= hallMaxCellY; y++) {
                            const key = `${x},${y}`;
                            if (!spatialMap.has(key)) {
                                spatialMap.set(key, []);
                            }
                            // Only add if not already there (avoid duplicates)
                            if (!spatialMap.get(key).includes(cell)) {
                                spatialMap.get(key).push(cell);
                            }
                        }
                    }
                }
            }

            // Vertical halls
            if (cell.vHalls && cell.vHalls.length > 0) {
                for (const hall of cell.vHalls) {
                    const hallMinCellX = Math.floor(hall.hallMin.x / this.cellSize);
                    const hallMaxCellX = Math.floor(hall.hallMax.x / this.cellSize);
                    const hallMinCellY = Math.floor(hall.hallMin.y / this.cellSize);
                    const hallMaxCellY = Math.floor(hall.hallMax.y / this.cellSize);

                    for (let x = hallMinCellX; x <= hallMaxCellX; x++) {
                        for (let y = hallMinCellY; y <= hallMaxCellY; y++) {
                            const key = `${x},${y}`;
                            if (!spatialMap.has(key)) {
                                spatialMap.set(key, []);
                            }
                            if (!spatialMap.get(key).includes(cell)) {
                                spatialMap.get(key).push(cell);
                            }
                        }
                    }
                }
            }
        });

        return spatialMap;
    }

    /**
     * Get nearby cells using spatial hash
     */
    getPotentialCells(x, y) {
        if (!this.spatialMap) return [];

        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const potentialCells = new Set();

        // time complexity is O(k) where k = 9
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cellX + dx},${cellY + dy}`;
                if (this.spatialMap.has(key)) {
                    this.spatialMap.get(key).forEach(cell => potentialCells.add(cell));
                }
            }
        }

        return Array.from(potentialCells);
    }

    /**
     * AABB point containment check
     * Checks if point (x, y) is within a rectangle defined by min and max
     */
    isPointInAABB(x, y, min, max) {
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
    }

    /**
     * Check if a single point is in any walkable area (room or hall)
     * FIX: This properly checks both rooms AND halls
     */
    isPointWalkable(x, y, cells) {
        const cellsToCheck = this.spatialMap ?
            this.getPotentialCells(x, y) :
            cells;

        for (const cell of cellsToCheck) {
            // Check if point is in the room
            if (this.isPointInAABB(x, y, cell.roomMin, cell.roomMax)) {
                return true;
            }

            // Check horizontal halls (if they exist and are not empty)
            if (cell.hHalls && cell.hHalls.length > 0) {
                for (const hall of cell.hHalls) {
                    if (this.isPointInAABB(x, y, hall.hallMin, hall.hallMax)) {
                        return true;
                    }
                }
            }

            // Check vertical halls (if they exist and are not empty)
            if (cell.vHalls && cell.vHalls.length > 0) {
                for (const hall of cell.vHalls) {
                    if (this.isPointInAABB(x, y, hall.hallMin, hall.hallMax)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if a circle at (x, y) with radius fits in walkable space
     * Samples 12 points on the circle perimeter
     */
    isCircleWalkable(x, y, cells) {
        // Check center point
        if (!this.isPointWalkable(x, y, cells)) {
            return false;
        }

        // Check perimeter points
        const radius = this.radius;
        for (let i = 0; i < this.circleCheckPoints; i++) {
            const angle = (i / this.circleCheckPoints) * Math.PI * 2;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);

            if (!this.isPointWalkable(px, py, cells)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Continuous Collision Detection with sampling
     * Tests 5 points along the movement path
     */
    getCollisionFreePosition(nextX, nextY, cells) {
        const steps = 5;
        const prevX = this.prevPos.x;
        const prevY = this.prevPos.y;

        // Test if final position is valid
        if (this.isCircleWalkable(nextX, nextY, cells)) {
            return { x: nextX, y: nextY, collision: false };
        }

        // Sample backwards to find collision point
        let lastValidX = prevX;
        let lastValidY = prevY;
        let lastValidT = 0;

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const testX = prevX + (nextX - prevX) * t;
            const testY = prevY + (nextY - prevY) * t;

            if (this.isCircleWalkable(testX, testY, cells)) {
                lastValidX = testX;
                lastValidY = testY;
                lastValidT = t;
            } else {
                // Hit collision between last valid and current test point
                return this.binarySearchCollision(
                    prevX, prevY, testX, testY,
                    lastValidX, lastValidY, cells
                );
            }
        }

        // Last valid position is the furthest we can go
        return {
            x: lastValidX,
            y: lastValidY,
            collision: true
        };
    }

    /**
     * Binary search to find exact collision boundary
     * Recursively narrows down between valid and invalid positions
     */
    binarySearchCollision(prevX, prevY, invalidX, invalidY, validX, validY, cells, iterations = 0) {
        if (iterations >= this.collisionSteps) {
            return { x: validX, y: validY, collision: true };
        }

        const midX = (validX + invalidX) / 2;
        const midY = (validY + invalidY) / 2;

        if (this.isCircleWalkable(midX, midY, cells)) {
            // Midpoint is valid, search further
            return this.binarySearchCollision(
                prevX, prevY, invalidX, invalidY, midX, midY, cells, iterations + 1
            );
        } else {
            // Midpoint is invalid, search back
            return this.binarySearchCollision(
                prevX, prevY, midX, midY, validX, validY, cells, iterations + 1
            );
        }
    }

    /**
     * Calculate slide velocity when hitting a wall
     * Allows smooth wall sliding instead of stopping dead
     */
    getSlideVelocity(collisionX, collisionY, nextX, nextY) {
        const dx = nextX - this.pos.x;
        const dy = nextY - this.pos.y;
        const actualDx = collisionX - this.pos.x;
        const actualDy = collisionY - this.pos.y;

        // Determine which axis was blocked more
        const xBlockage = Math.abs(actualDx) / (Math.abs(dx) + 0.001);
        const yBlockage = Math.abs(actualDy) / (Math.abs(dy) + 0.001);

        const slideVelocity = new Vector(this.velocity.x, this.velocity.y);

        // If X movement was blocked more, dampen X velocity (slide along Y)
        if (xBlockage < yBlockage) {
            slideVelocity.x *= 0.1;
        } else {
            slideVelocity.y *= 0.1;
        }

        return slideVelocity;
    }
    resolveWallPenetration(cells) {
        if (this.isCircleWalkable(this.pos.x, this.pos.y, cells)) return;

        // Try nudging in 8 directions to find nearest valid spot
        const nudges = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [-1, 1], [1, -1], [-1, -1]
        ];

        for (let dist = 1; dist <= this.radius * 2; dist += 1) {
            for (const [nx, ny] of nudges) {
                const tx = this.pos.x + nx * dist;
                const ty = this.pos.y + ny * dist;
                if (this.isCircleWalkable(tx, ty, cells)) {
                    this.pos.x = tx;
                    this.pos.y = ty;
                    return;
                }
            }
        }
    }
    /**
     * Main physics update with collision detection
     * Called once per frame
     */
    update(delta, keys, cells) {
        // Update spatial map periodically
        this.lastMapUpdate++;
        if (!this.spatialMap || this.lastMapUpdate >= this.mapUpdateInterval) {
            this.spatialMap = this.buildSpatialMap(cells);
            this.lastMapUpdate = 0;
        }

        // Store previous position for CCD
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

        // Calculate next position
        // const nextX = this.pos.x + this.velocity.x;
        // const nextY = this.pos.y + this.velocity.y;

        // // Resolve collision
        // const result = this.getCollisionFreePosition(nextX, nextY, cells);

        // // Update position
        // this.pos.x = result.x;
        // this.pos.y = result.y;

        // // Update velocity based on collision (smooth sliding)
        // if (result.collision) {
        //     this.velocity = this.getSlideVelocity(result.x, result.y, nextX, nextY);
        // }
        const nextX = this.pos.x + this.velocity.x;
        const nextY = this.pos.y + this.velocity.y;

        // Try full movement first
        if (this.isCircleWalkable(nextX, nextY, cells)) {
            this.pos.x = nextX;
            this.pos.y = nextY;
            return;
        }

        // Try X axis only
        const canMoveX = this.isCircleWalkable(nextX, this.pos.y, cells);
        // Try Y axis only
        const canMoveY = this.isCircleWalkable(this.pos.x, nextY, cells);

        if (canMoveX) {
            this.pos.x = nextX;
            this.velocity.y = 0;  // kill only the blocked axis
        } else if (canMoveY) {
            this.pos.y = nextY;
            this.velocity.x = 0;
        } else {
            // Truly cornered — kill all movement
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }

    draw(ctx, { fill = true, color = "black" } = {}) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);

        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }
}

