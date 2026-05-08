# COLLISION DETECTION SYSTEM - DETAILED MATHEMATICAL EXPLANATION

## The Problem with Your Original System

Your original implementation has three critical flaws:

### 1. **Discrete Collision Detection (Tunneling)**
```
Frame 1                    Frame 2
   ●                           ●   <-- INSIDE WALL!
   │ velocity = 5              │
   │ pixels/frame              │
   │                           │
═══╪═══════════════════════════╪═══ WALL
   │                           │
   
The snake moves FROM valid position TO invalid position in one frame.
If the frame rate drops or speed increases, the snake can skip through walls.
```

**Problem**: You only check if the *final* position is valid, not the *path* to get there.

### 2. **Multi-Point Sampling Inadequacy**
Your original code checks 9 points in a circle:
```
        ↑
        │
    ◇   ●   ◇
    │  /│\  │
    ◇─●─●─◇   <- Center and 8 surrounding points
    │  \│/  │
    ◇   ●   ◇
        ↓

Problem: Doesn't catch diagonal wall collisions well
Missing: Needs 12+ points for thorough coverage
```

### 3. **Velocity Zeroing (Teleporting)**
```javascript
// Your code:
if (result.collided) {
    this.velocity.mult(0);  // ← WRONG! Stops momentum dead
}

Result: 
- Frame N: Snake at (100, 100) moving up
- Frame N+1: Hits wall, velocity becomes (0, 0)
- Frame N+2: Zero velocity = no movement = appears to teleport/stick
```

---

## The Solution: Continuous Collision Detection (CCD)

### Core Concept: Parameterized Movement Path

Instead of checking positions A and B, we check the LINE SEGMENT between them.

**Mathematical Representation:**
```
P(t) = A + t × (B - A)    where t ∈ [0, 1]

When t = 0:   P(0) = A (previous position)
When t = 0.5: P(0.5) = midpoint
When t = 1:   P(1) = B (target position)

Example with actual numbers:
A = (100, 100), B = (105, 105)
P(t) = (100, 100) + t × (5, 5)

P(0) = (100, 100)
P(0.2) = (101, 101)
P(0.4) = (102, 102)
P(0.6) = (103, 103)
P(0.8) = (104, 104)
P(1) = (105, 105)
```

**Why This Matters:**
```
Without CCD:                With CCD:
  ●                          ●
  │ Check only               │ Check: ●, ●, ●, ●, ●
  │ this point!              │ All 5 points on path
  │                          │
═══●═════════════════════  ═══●═════════════════════
  │ WALL                     │ WALL
  
Misses collision!           Catches collision!
```

---

## Swept Circle Collision (Radius-Based Buffer)

### Why a Simple Point Check Isn't Enough

The snake isn't a point—it has **radius = 10 pixels** (or whatever).

```
Without radius buffer:       With radius buffer (r=10):
     WALL                              WALL
    ████                              ████
    ████    ← Can fit point here       ████
    ████       but circle would        ████
    ████       overlap!                ████
    ════════                           ════════
     
    ●        Valid position      (X) Can't fit circle!
```

### The Math: Sampling the Circle's Perimeter

For a circle at position (x, y) with radius r, we check if these points are walkable:

```
For 12 sample points:
  θᵢ = (i / 12) × 2π    where i = 0, 1, 2, ..., 11

Each point: (x + r×cos(θᵢ), y + r×sin(θᵢ))

Visualization:
        ●           ← cos(90°) = 0, sin(90°) = 1
        │           → point at (x, y+r)
    ●───●───●
    │   C   │       C = center at (x, y)
    ●───●───●       Radius r = distance from C to outer ring
        │
        ●           ← cos(270°) = 0, sin(270°) = -1
                    → point at (x, y-r)
```

**Code Logic:**
```javascript
for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;  // 0°, 30°, 60°, 90°, ...
    const px = x + r * Math.cos(angle);     // x-coordinate on circle
    const py = y + r * Math.sin(angle);     // y-coordinate on circle
    
    if (!isPointWalkable(px, py)) {
        return false;  // Circle hits a wall
    }
}
return true;  // Circle fits!
```

---

## Binary Search Collision Resolution

### The Problem It Solves

After CCD sampling, we know collision happens *between* two sampled points:
```
Sample points on movement path:
P(0) ✓ valid
P(0.2) ✓ valid
P(0.4) ✗ invalid <-- Collision is somewhere between P(0.2) and P(0.4)
P(0.6) ✗ invalid
P(0.8) ✗ invalid
P(1.0) ✗ invalid

Goal: Find the exact boundary where collision happens!
```

### The Algorithm: Recursive Bisection

```
Iteration 1:
  Valid: P(0.2)         Invalid: P(0.4)
  ●────────────●────────────●
                Test: P(0.3) ✗ Invalid
                
Iteration 2:
  Valid: P(0.2)         Invalid: P(0.3)
  ●────────────●────────────●
                Test: P(0.25) ✓ Valid
                
Iteration 3:
  Valid: P(0.25)        Invalid: P(0.3)
  ●────────────●────────────●
                Test: P(0.275) ✓ Valid
                
Iteration 4:
  Valid: P(0.275)       Invalid: P(0.3)
  ●────────────●────────────●
                Test: P(0.288) ✓ Valid
                
After ~4 iterations: Found collision boundary within ~0.01 units!
```

### Time Complexity

- **Linear search** (your original): O(n) iterations needed
- **Binary search**: O(log n) iterations needed

For 1-pixel precision over 100-pixel movement:
- Linear: ~100 checks
- Binary: ~7 checks ← **14× faster!**

---

## Spatial Hashing (AABB Cell Partitioning)

### Why You Need It

Without optimization, checking collision against 100 rooms for each frame is expensive:

```
Naive approach:
for each frame:
    for each point on snake (50 points):
        for each room (100 rooms):
            check collision
            
Total: 50 × 100 = 5,000 checks per frame!

At 60fps = 300,000 checks per second = SLOW
```

### The Solution: Divide Space into Buckets

```
Grid of cells (cellSize = 100 pixels):

    0   1   2   3
  ┌───┬───┬───┬───┐
0 │A,B│ B │ C │ C │
  ├───┼───┼───┼───┤
1 │ A │ A │   │ C │
  ├───┼───┼───┼───┤
2 │   │   │   │   │
  ├───┼───┼───┼───┤
3 │ D │   │   │   │
  └───┴───┴───┴───┘

Room A occupies: cells (0,0), (0,1), (1,0), (1,1)
Room B occupies: cells (0,0), (1,0), (1,1)
Room C occupies: cells (2,0), (3,0), (2,1), (3,1)
Room D occupies: cell (0,3)

When checking point at (120, 150):
  cellX = floor(120 / 100) = 1
  cellY = floor(150 / 100) = 1
  
  Check 3×3 neighborhood:
  cells (0,0), (1,0), (2,0), 
         (0,1), (1,1), (2,1),
         (0,2), (1,2), (2,2)
  
  Result: Only check rooms A, B, C (skip D!)
```

### Mathematical Hash Function

```javascript
function getHash(x, y, cellSize = 100) {
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    return `${cellX},${cellY}`;  // String key for Map
}

// Instead of: if (point in roomA or in roomB or in roomC or ... roomZ)
// We do:     if (point in spatialMap[getHash(x,y)])

// Reduces from O(n) to O(1) average case!
```

---

## Slide Velocity (Wall Sliding)

### The Problem with Velocity = 0

When you hit a wall, zeroing velocity stops ALL movement:

```
Snake moving up-right at velocity (3, -5):
  Direction: ↗

Hits top wall:
  Old code: velocity becomes (0, 0)
  Result: Stuck against wall, can't move right anymore!
  
  New code: Detect wall is horizontal
            Set vy = 0 (can't move up)
            Keep vx = 3 (can still move right)
  Result: Slides along wall smoothly
```

### How It Works

```javascript
// Determine which wall type we hit
const xBlockage = percentOfMovementBlockedInX;
const yBlockage = percentOfMovementBlockedInY;

if (xBlockage < yBlockage) {
    // Less movement blocked in X → horizontal wall hit
    // Zero out X velocity, keep Y for sliding
    velocity.x *= 0.1;
} else {
    // Less movement blocked in Y → vertical wall hit  
    // Zero out Y velocity, keep X for sliding
    velocity.y *= 0.1;
}
```

**Visualization:**
```
Vertical wall (|):
  velocity = (3, -5)
  ↓ Hits wall
  velocity = (0.3, -5)  ← Can still move up!
  
  ●─────→ (slides up along wall)
  │
  │ WALL

Horizontal wall (─):
  velocity = (3, -5)
  ↓ Hits wall
  velocity = (3, -0.5)  ← Can still move right!
  
      WALL
  ═══════════
      ●─→ (slides right along wall)
      │
```

---

## Complete Algorithm Flow

```
START
  │
  ├─→ Update Spatial Hash (every 2 seconds)
  │
  ├─→ Store Previous Position (for CCD)
  │
  ├─→ Apply Input Acceleration
  │   if (ArrowUp pressed): velocity.y -= 2.2
  │
  ├─→ Apply Friction (Exponential Damping)
  │   velocity *= 0.95
  │   (After 1 second: vel = vel × 0.95^60 ≈ 0.05× original)
  │
  ├─→ Clamp Velocity to Max Speed
  │   if (|velocity| > 8): scale velocity to magnitude 8
  │
  ├─→ Calculate Target Position
  │   nextPos = currentPos + velocity
  │
  ├─→ COLLISION DETECTION & RESOLUTION
  │   │
  │   ├─→ Sample Path (CCD)
  │   │   Test: P(0), P(0.2), P(0.4), P(0.6), P(0.8), P(1.0)
  │   │   At each point, check if 12-point circle fits (Swept Circle)
  │   │
  │   ├─→ If Full Path Valid
  │   │   finalPos = nextPos
  │   │   collision = false
  │   │
  │   └─→ Else: Binary Search (4 iterations)
  │       Find exact collision point between last valid and first invalid
  │       finalPos = collision point
  │       collision = true
  │
  ├─→ Update Position
  │   currentPos = finalPos
  │
  ├─→ Update Velocity Based on Collision
  │   if (collision):
  │       Calculate wall orientation
  │       Apply slide velocity (dampen perpendicular, keep tangential)
  │
  └─→ END

```

---

## Expected Improvements

| Problem | Original | Improved |
|---------|----------|----------|
| **Tunneling** | ✗ Passes through walls at high speed | ✓ CCD detects all collisions |
| **Getting Stuck** | ✗ Velocity = 0 stops all movement | ✓ Slide velocity keeps tangential motion |
| **Teleporting** | ✗ Abrupt position jumps | ✓ Smooth wall sliding |
| **Inaccuracy** | ✗ 9-point circle | ✓ 12-point swept circle + BCD |
| **Performance** | ✗ O(n) cell checks | ✓ O(1) spatial hash |
| **Responsiveness** | ✗ Feels sluggish and stuck | ✓ Feels smooth and responsive |

---

## Testing Tips

1. **High-Speed Test**: Increase velocity.max to 20 → should still not tunnel
2. **Tight Corridor Test**: Create a passage narrower than snake radius → should still fit without getting stuck
3. **Corner Test**: Move diagonally at walls → should slide smoothly around corners
4. **Frame Rate Test**: Drop to 10 FPS → should still handle collisions correctly