class ARMeasure {
    constructor() {
        // Initialize DOM elements
        this.video = document.getElementById('camera-feed');
        this.canvas = document.getElementById('ar-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.distanceEl = document.getElementById('distance');
        this.instructionEl = document.getElementById('instruction');
        
        // Buttons
        this.startButton = document.getElementById('startButton');
        this.captureButton = document.getElementById('captureButton');
        this.resetButton = document.getElementById('resetButton');
        
        // State
        this.measuring = false;
        this.points = [];
        this.deviceMotion = { alpha: 0, beta: 0, gamma: 0 };
        
        // Initialize
        this.setupEventListeners();
        this.handleResize();
    }
    
    setupEventListeners() {
        // Button events
        this.startButton.addEventListener('click', () => this.start());
        this.captureButton.addEventListener('click', () => this.capturePoint());
        this.resetButton.addEventListener('click', () => this.reset());
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleResize());
        
        // Device motion events
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                this.deviceMotion = {
                    alpha: e.alpha,
                    beta: e.beta,
                    gamma: e.gamma
                };
            });
        }
    }
    
    async start() {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: window.innerWidth },
                    height: { ideal: window.innerHeight }
                }
            });
            
            // Start video stream
            this.video.srcObject = stream;
            await this.video.play();
            
            // Update UI
            this.measuring = true;
            this.startButton.style.display = 'none';
            this.captureButton.disabled = false;
            this.resetButton.disabled = false;
            this.instructionEl.textContent = 'Tap to capture first point';
            
            // Start render loop
            this.render();
            
        } catch (error) {
            console.error('Camera access error:', error);
            this.instructionEl.textContent = 'Camera access denied';
        }
    }
    
    capturePoint() {
        if (this.points.length < 2) {
            // Capture point at center of screen
            const point = {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                motion: { ...this.deviceMotion }
            };
            
            this.points.push(point);
            
            if (this.points.length === 1) {
                this.instructionEl.textContent = 'Move to capture second point';
            } else {
                this.calculateDistance();
                this.captureButton.disabled = true;
                this.instructionEl.textContent = 'Tap reset to start over';
            }
        }
    }
    
    calculateDistance() {
        if (this.points.length === 2) {
            // Basic distance calculation
            // Note: This is a simplified calculation. Real AR apps use depth data
            const dx = this.points[1].x - this.points[0].x;
            const dy = this.points[1].y - this.points[0].y;
            
            // Factor in device motion for slightly better accuracy
            const motionDiff = Math.abs(this.points[1].motion.beta - this.points[0].motion.beta);
            
            // Calculate pixel distance and convert to meters (approximate)
            const pixelDistance = Math.sqrt(dx * dx + dy * dy);
            const estimatedMeters = (pixelDistance / this.canvas.width) * (2 + motionDiff / 90);
            
            this.distanceEl.textContent = estimatedMeters.toFixed(2);
        }
    }
    
    reset() {
        this.points = [];
        this.distanceEl.textContent = '0.00';
        this.instructionEl.textContent = 'Tap to capture first point';
        this.captureButton.disabled = false;
    }
    
    handleResize() {
        // Update canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    render() {
        if (!this.measuring) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw measuring UI
        this.drawMeasuringUI();
        
        // Continue render loop
        requestAnimationFrame(() => this.render());
    }
    
    drawMeasuringUI() {
        // Draw crosshair
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        // Vertical line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 20);
        this.ctx.lineTo(centerX, centerY + 20);
        this.ctx.stroke();
        
        // Horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 20, centerY);
        this.ctx.lineTo(centerX + 20, centerY);
        this.ctx.stroke();
        
        // Draw points and line
        if (this.points.length > 0) {
            // Draw points
            this.points.forEach(point => {
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
                this.ctx.fillStyle = '#007AFF';
                this.ctx.fill();
            });
            
            // Draw line between points
            if (this.points.length === 2) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.points[0].x, this.points[0].y);
                this.ctx.lineTo(this.points[1].x, this.points[1].y);
                this.ctx.strokeStyle = '#007AFF';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ARMeasure();
});
