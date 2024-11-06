// app.js

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const measurementText = document.getElementById('measurement');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

let points = [];
let active = false;

// Set up video stream for the camera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accessing the camera: ", error);
    }
}

// Function to start the measurement process
startBtn.addEventListener('click', () => {
    active = true;
    points = [];
    resetBtn.disabled = false;
    startBtn.disabled = true;
    measurementText.textContent = 'Distance: 0.00 m';
});

// Reset button functionality
resetBtn.addEventListener('click', () => {
    points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    measurementText.textContent = 'Distance: 0.00 m';
    startBtn.disabled = false;
    resetBtn.disabled = true;
});

// Utility to convert pixel distance to meters (approximate)
const PIXELS_PER_METER = 200; // Adjust this based on your screen resolution

function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy) / PIXELS_PER_METER;
}

// Handle canvas click to set points
canvas.addEventListener('click', (e) => {
    if (!active) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.push({ x, y });

    // Draw points and lines
    if (points.length === 1) {
        drawPoint(points[0]);
    } else if (points.length === 2) {
        drawLine(points[0], points[1]);
        const distance = calculateDistance(points[0], points[1]);
        measurementText.textContent = `Distance: ${distance.toFixed(2)} m`;
        active = false; // Stop further clicks until reset
    }
});

function drawPoint(point) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

function drawLine(point1, point2) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke();
}

// Resize canvas to fit the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Start camera and set up video feed
setupCamera();
