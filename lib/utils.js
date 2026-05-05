
function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
}

let previousTime = 0;
function getDelta(newTime) {
    const delta = (newTime - previousTime) / 1000;
    previousTime = newTime
    return delta;
}

// 1. Create the points in a 2D layout
// for (let y = 0; y < rows; y++) {
//     for (let x = 0; x < cols; x++) {
//         const pos = new Vector(200 + x * spacing, 100 + y * spacing);
//         points.push(new Point(pos, 5));
//     }
// }

// // 2. Connect the points
// for (let y = 0; y < rows; y++) {
//     for (let x = 0; x < cols; x++) {
//         const currentIndex = y * cols + x;

//         // Connect to the neighbor on the RIGHT
//         if (x < cols - 1) {
//             const rightIndex = y * cols + (x + 1);
//             segs.push(new Segment(points[currentIndex], points[rightIndex]));
//         }

//         // Connect to the neighbor BELOW
//         if (y < rows - 1) {
//             const belowIndex = (y + 1) * cols + x;
//             segs.push(new Segment(points[currentIndex], points[belowIndex]));
//         }
//     }
// }
