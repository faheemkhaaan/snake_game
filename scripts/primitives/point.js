


class Point {
    constructor(pos, rad) {
        this.pos = pos;
        this.velocity = new Vector(0, 0);

        this.acceleration = 2.2
        this.friction = 0.95
        this.max = 8;
        this.radius = rad;
        this.gravity = Math.floor(Math.random() * 8 + 3)

        // Cache for performance
        this.collisionCache = new Map();
        this.lastCellCheck = null;
        this.cacheValidFrames = 0;
    }

    setPos(pos) {
        this.pos.x = pos.x;
        this.pos.y = pos.y
    }

    // Build spatial hash map for faster lookups
    buildSpatialMap(cells, cellSize = 100) {
        const spatialMap = new Map();

        cells.forEach(cell => {
            // Add room to spatial map
            const minCellX = Math.floor(cell.roomMin.x / cellSize);
            const maxCellX = Math.floor(cell.roomMax.x / cellSize);
            const minCellY = Math.floor(cell.roomMin.y / cellSize);
            const maxCellY = Math.floor(cell.roomMax.y / cellSize);

            for (let x = minCellX; x <= maxCellX; x++) {
                for (let y = minCellY; y <= maxCellY; y++) {
                    const key = `${x},${y}`;
                    if (!spatialMap.has(key)) {
                        spatialMap.set(key, []);
                    }
                    spatialMap.get(key).push(cell);
                }
            }
        });

        return spatialMap;
    }

    // Get potential cells using spatial hashing
    getPotentialCells(x, y, spatialMap, cellSize = 100) {
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        const potentialCells = new Set();

        // Check surrounding cells (3x3 grid)
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cellX + dx},${cellY + dy}`;
                if (spatialMap.has(key)) {
                    spatialMap.get(key).forEach(cell => potentialCells.add(cell));
                }
            }
        }

        return Array.from(potentialCells);
    }

    // Advanced walkability check with better boundary handling
    isWalkable(x, y, cells, radius) {
        const padding = radius * 0.8; // Slightly reduced padding for tighter corridors

        // Check multiple points in a circular pattern
        const checkPoints = [
            { x: x, y: y },                    // Center
            { x: x + padding, y: y },          // Right
            { x: x - padding, y: y },          // Left
            { x: x, y: y + padding },          // Bottom
            { x: x, y: y - padding },          // Top
            { x: x + padding * 0.7, y: y + padding * 0.7 },  // Top-right
            { x: x - padding * 0.7, y: y + padding * 0.7 },  // Top-left
            { x: x + padding * 0.7, y: y - padding * 0.7 },  // Bottom-right
            { x: x - padding * 0.7, y: y - padding * 0.7 }   // Bottom-left
        ];

        // All points must be walkable
        return checkPoints.every(point => this.checkDungeonOptimized(point.x, point.y, cells));
    }

    // Optimized dungeon check with early exit and AABB optimization
    checkDungeonOptimized(x, y, cells) {
        // Use cached spatial map if available
        const cellsToCheck = this.spatialMap ?
            this.getPotentialCells(x, y, this.spatialMap) :
            cells;

        for (const cell of cellsToCheck) {
            // Quick AABB check for room
            if (this.isPointInAABB(x, y, cell.roomMin, cell.roomMax)) {
                return true;
            }

            // Check halls with AABB optimization
            for (const hall of cell.hHalls) {
                if (this.isPointInAABB(x, y, hall.hallMin, hall.hallMax)) {
                    return true;
                }
            }

            for (const hall of cell.vHalls) {
                if (this.isPointInAABB(x, y, hall.hallMin, hall.hallMax)) {
                    return true;
                }
            }
        }

        return false;
    }

    // Fast AABB point intersection
    isPointInAABB(x, y, min, max) {
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
    }

    // Find nearest walkable point when collision occurs
    findNearestWalkablePoint(x, y, cells, radius) {
        const searchRadius = radius * 2;
        const steps = 8;
        let bestPoint = null;
        let bestDistance = Infinity;

        // Search in expanding circles
        for (let r = radius; r <= searchRadius; r += radius / 2) {
            for (let i = 0; i < steps; i++) {
                const angle = (i / steps) * Math.PI * 2;
                const testX = x + Math.cos(angle) * r;
                const testY = y + Math.sin(angle) * r;

                if (this.isWalkable(testX, testY, cells, radius)) {
                    const distance = Math.hypot(testX - x, testY - y);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestPoint = { x: testX, y: testY };
                    }
                }
            }
        }

        return bestPoint;
    }

    // Improved collision resolution with sliding
    resolveCollision(nextX, nextY, cells) {
        const radius = this.radius;

        // Try full movement first
        if (this.isWalkable(nextX, nextY, cells, radius)) {
            return { x: nextX, y: nextY, collided: false };
        }

        // Try sliding along X axis
        if (this.isWalkable(nextX, this.pos.y, cells, radius)) {
            return { x: nextX, y: this.pos.y, collided: true, axis: 'x' };
        }

        // Try sliding along Y axis
        if (this.isWalkable(this.pos.x, nextY, cells, radius)) {
            return { x: this.pos.x, y: nextY, collided: true, axis: 'y' };
        }

        // Try diagonal sliding with reduced movement
        const reducedX = this.pos.x + (nextX - this.pos.x) * 0.5;
        const reducedY = this.pos.y + (nextY - this.pos.y) * 0.5;

        if (this.isWalkable(reducedX, reducedY, cells, radius)) {
            return { x: reducedX, y: reducedY, collided: true, axis: 'both' };
        }

        // Find nearest walkable point as last resort
        const nearest = this.findNearestWalkablePoint(this.pos.x, this.pos.y, cells, radius);
        if (nearest) {
            return { x: nearest.x, y: nearest.y, collided: true, axis: 'nearest' };
        }

        // If all else fails, stay in place
        return { x: this.pos.x, y: this.pos.y, collided: true, axis: 'none' };
    }

    // Main update with enhanced collision detection
    update(delta, keys, cells) {
        // Build spatial map periodically (every 60 frames)
        if (!this.spatialMap || this.cacheValidFrames <= 0) {
            this.spatialMap = this.buildSpatialMap(cells);
            this.cacheValidFrames = 60;
        }
        this.cacheValidFrames--;

        // Handle input
        if (keys.ArrowUp) this.velocity.y -= this.acceleration;
        if (keys.ArrowDown) this.velocity.y += this.acceleration;
        if (keys.ArrowRight) this.velocity.x += this.acceleration;
        if (keys.ArrowLeft) this.velocity.x -= this.acceleration;

        // Apply friction
        this.velocity.mult(this.friction);

        // Clamp velocity
        const speed = this.velocity.mag();
        if (speed > this.max) {
            this.velocity = this.velocity.norm().mult(this.max);
        }

        // Calculate next position
        const nextX = this.pos.x + this.velocity.x;
        const nextY = this.pos.y + this.velocity.y;

        // Resolve collision
        const result = this.resolveCollision(nextX, nextY, cells);

        // Update position
        this.pos.x = result.x;
        this.pos.y = result.y;

        // Handle velocity based on collision
        if (result.collided) {
            switch (result.axis) {
                case 'x':
                    this.velocity.y = 0;
                    break;
                case 'y':
                    this.velocity.x = 0;
                    break;
                case 'both':
                    this.velocity.mult(0.5);
                    break;
                case 'nearest':
                case 'none':
                    this.velocity.mult(0);
                    break;
            }
        }
    }

    // Enhanced nearest cell finder with distance consideration
    getNearestCell(x, y, cells) {
        let nearestCell = null;
        let minDistance = Infinity;

        // Use spatial map for performance if available
        const cellsToCheck = this.spatialMap ?
            this.getPotentialCells(x, y, this.spatialMap) :
            cells;

        for (const cell of cellsToCheck) {
            // Find closest point on room AABB to our position
            const closestX = Math.max(cell.roomMin.x, Math.min(x, cell.roomMax.x));
            const closestY = Math.max(cell.roomMin.y, Math.min(y, cell.roomMax.y));

            const dx = x - closestX;
            const dy = y - closestY;
            const distSq = dx * dx + dy * dy;

            if (distSq < minDistance) {
                minDistance = distSq;
                nearestCell = cell;
            }
        }

        return nearestCell;
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

// // Enhanced collision detection for the Point class
// class Point {
//     constructor(pos, rad) {
//         this.pos = pos;
//         this.velocity = new Vector(0, 0);
//         this.acceleration = 2.2;
//         this.friction = 0.95;
//         this.max = 8;
//         this.radius = rad;
//         this.gravity = Math.floor(Math.random() * 8 + 3);

//         // Cache for performance
//         this.collisionCache = new Map();
//         this.lastCellCheck = null;
//         this.cacheValidFrames = 0;
//     }

//     // Build spatial hash map for faster lookups
//     buildSpatialMap(cells, cellSize = 100) {
//         const spatialMap = new Map();

//         cells.forEach(cell => {
//             // Add room to spatial map
//             const minCellX = Math.floor(cell.roomMin.x / cellSize);
//             const maxCellX = Math.floor(cell.roomMax.x / cellSize);
//             const minCellY = Math.floor(cell.roomMin.y / cellSize);
//             const maxCellY = Math.floor(cell.roomMax.y / cellSize);

//             for (let x = minCellX; x <= maxCellX; x++) {
//                 for (let y = minCellY; y <= maxCellY; y++) {
//                     const key = `${x},${y}`;
//                     if (!spatialMap.has(key)) {
//                         spatialMap.set(key, []);
//                     }
//                     spatialMap.get(key).push(cell);
//                 }
//             }
//         });

//         return spatialMap;
//     }

//     // Get potential cells using spatial hashing
//     getPotentialCells(x, y, spatialMap, cellSize = 100) {
//         const cellX = Math.floor(x / cellSize);
//         const cellY = Math.floor(y / cellSize);
//         const potentialCells = new Set();

//         // Check surrounding cells (3x3 grid)
//         for (let dx = -1; dx <= 1; dx++) {
//             for (let dy = -1; dy <= 1; dy++) {
//                 const key = `${cellX + dx},${cellY + dy}`;
//                 if (spatialMap.has(key)) {
//                     spatialMap.get(key).forEach(cell => potentialCells.add(cell));
//                 }
//             }
//         }

//         return Array.from(potentialCells);
//     }

//     // Advanced walkability check with better boundary handling
//     isWalkable(x, y, cells, radius) {
//         const padding = radius * 0.8; // Slightly reduced padding for tighter corridors

//         // Check multiple points in a circular pattern
//         const checkPoints = [
//             { x: x, y: y },                    // Center
//             { x: x + padding, y: y },          // Right
//             { x: x - padding, y: y },          // Left
//             { x: x, y: y + padding },          // Bottom
//             { x: x, y: y - padding },          // Top
//             { x: x + padding * 0.7, y: y + padding * 0.7 },  // Top-right
//             { x: x - padding * 0.7, y: y + padding * 0.7 },  // Top-left
//             { x: x + padding * 0.7, y: y - padding * 0.7 },  // Bottom-right
//             { x: x - padding * 0.7, y: y - padding * 0.7 }   // Bottom-left
//         ];

//         // All points must be walkable
//         return checkPoints.every(point => this.checkDungeonOptimized(point.x, point.y, cells));
//     }

//     // Optimized dungeon check with early exit and AABB optimization
//     checkDungeonOptimized(x, y, cells) {
//         // Use cached spatial map if available
//         const cellsToCheck = this.spatialMap ?
//             this.getPotentialCells(x, y, this.spatialMap) :
//             cells;

//         for (const cell of cellsToCheck) {
//             // Quick AABB check for room
//             if (this.isPointInAABB(x, y, cell.roomMin, cell.roomMax)) {
//                 return true;
//             }

//             // Check halls with AABB optimization
//             for (const hall of cell.hHalls) {
//                 if (this.isPointInAABB(x, y, hall.hallMin, hall.hallMax)) {
//                     return true;
//                 }
//             }

//             for (const hall of cell.vHalls) {
//                 if (this.isPointInAABB(x, y, hall.hallMin, hall.hallMax)) {
//                     return true;
//                 }
//             }
//         }

//         return false;
//     }

//     // Fast AABB point intersection
//     isPointInAABB(x, y, min, max) {
//         return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
//     }

//     // Find nearest walkable point when collision occurs
//     findNearestWalkablePoint(x, y, cells, radius) {
//         const searchRadius = radius * 2;
//         const steps = 8;
//         let bestPoint = null;
//         let bestDistance = Infinity;

//         // Search in expanding circles
//         for (let r = radius; r <= searchRadius; r += radius / 2) {
//             for (let i = 0; i < steps; i++) {
//                 const angle = (i / steps) * Math.PI * 2;
//                 const testX = x + Math.cos(angle) * r;
//                 const testY = y + Math.sin(angle) * r;

//                 if (this.isWalkable(testX, testY, cells, radius)) {
//                     const distance = Math.hypot(testX - x, testY - y);
//                     if (distance < bestDistance) {
//                         bestDistance = distance;
//                         bestPoint = { x: testX, y: testY };
//                     }
//                 }
//             }
//         }

//         return bestPoint;
//     }

//     // Improved collision resolution with sliding
//     resolveCollision(nextX, nextY, cells) {
//         const radius = this.radius;

//         // Try full movement first
//         if (this.isWalkable(nextX, nextY, cells, radius)) {
//             return { x: nextX, y: nextY, collided: false };
//         }

//         // Try sliding along X axis
//         if (this.isWalkable(nextX, this.pos.y, cells, radius)) {
//             return { x: nextX, y: this.pos.y, collided: true, axis: 'x' };
//         }

//         // Try sliding along Y axis
//         if (this.isWalkable(this.pos.x, nextY, cells, radius)) {
//             return { x: this.pos.x, y: nextY, collided: true, axis: 'y' };
//         }

//         // Try diagonal sliding with reduced movement
//         const reducedX = this.pos.x + (nextX - this.pos.x) * 0.5;
//         const reducedY = this.pos.y + (nextY - this.pos.y) * 0.5;

//         if (this.isWalkable(reducedX, reducedY, cells, radius)) {
//             return { x: reducedX, y: reducedY, collided: true, axis: 'both' };
//         }

//         // Find nearest walkable point as last resort
//         const nearest = this.findNearestWalkablePoint(this.pos.x, this.pos.y, cells, radius);
//         if (nearest) {
//             return { x: nearest.x, y: nearest.y, collided: true, axis: 'nearest' };
//         }

//         // If all else fails, stay in place
//         return { x: this.pos.x, y: this.pos.y, collided: true, axis: 'none' };
//     }

//     // Main update with enhanced collision detection
//     update(delta, keys, cells) {
//         // Build spatial map periodically (every 60 frames)
//         if (!this.spatialMap || this.cacheValidFrames <= 0) {
//             this.spatialMap = this.buildSpatialMap(cells);
//             this.cacheValidFrames = 60;
//         }
//         this.cacheValidFrames--;

//         // Handle input
//         if (keys.ArrowUp) this.velocity.y -= this.acceleration;
//         if (keys.ArrowDown) this.velocity.y += this.acceleration;
//         if (keys.ArrowRight) this.velocity.x += this.acceleration;
//         if (keys.ArrowLeft) this.velocity.x -= this.acceleration;

//         // Apply friction
//         this.velocity.mult(this.friction);

//         // Clamp velocity
//         const speed = this.velocity.mag();
//         if (speed > this.max) {
//             this.velocity = this.velocity.norm().mult(this.max);
//         }

//         // Calculate next position
//         const nextX = this.pos.x + this.velocity.x;
//         const nextY = this.pos.y + this.velocity.y;

//         // Resolve collision
//         const result = this.resolveCollision(nextX, nextY, cells);

//         // Update position
//         this.pos.x = result.x;
//         this.pos.y = result.y;

//         // Handle velocity based on collision
//         if (result.collided) {
//             switch (result.axis) {
//                 case 'x':
//                     this.velocity.y = 0;
//                     break;
//                 case 'y':
//                     this.velocity.x = 0;
//                     break;
//                 case 'both':
//                     this.velocity.mult(0.5);
//                     break;
//                 case 'nearest':
//                 case 'none':
//                     this.velocity.mult(0);
//                     break;
//             }
//         }
//     }

//     // Enhanced nearest cell finder with distance consideration
//     getNearestCell(x, y, cells) {
//         let nearestCell = null;
//         let minDistance = Infinity;

//         // Use spatial map for performance if available
//         const cellsToCheck = this.spatialMap ?
//             this.getPotentialCells(x, y, this.spatialMap) :
//             cells;

//         for (const cell of cellsToCheck) {
//             // Find closest point on room AABB to our position
//             const closestX = Math.max(cell.roomMin.x, Math.min(x, cell.roomMax.x));
//             const closestY = Math.max(cell.roomMin.y, Math.min(y, cell.roomMax.y));

//             const dx = x - closestX;
//             const dy = y - closestY;
//             const distSq = dx * dx + dy * dy;

//             if (distSq < minDistance) {
//                 minDistance = distSq;
//                 nearestCell = cell;
//             }
//         }

//         return nearestCell;
//     }
// }