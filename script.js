class PortfolioCanvas {
    constructor() {
        this.canvas = document.getElementById('portfolio-canvas');
        this.container = document.getElementById('canvas-container');
        this.nodes = document.querySelectorAll('.node');
        
        this.scale = 1;
        this.translateX = -460; // Center the canvas initially
        this.translateY = -140;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.minScale = 0.3;
        this.maxScale = 2;
        
        this.nodePositions = {
            about: { x: 960, y: 540 },
            work: { x: 500, y: 240 },
            projects: { x: 1420, y: 240 },
            contact: { x: 1300, y: 840 },
            resume: { x: 620, y: 840 }
        };
        
        this.init();
    }
    
    init() {
        this.createCircuitPaths();
        this.setupEventListeners();
        this.updateTransform();
        this.setupNavigation();
        this.setupZoomControls();
    }
    
    createCircuitPaths() {
        const pathsGroup = document.getElementById('circuit-paths');
        const centerPos = this.nodePositions.about;
        
        // Create paths from center to each other node
        Object.entries(this.nodePositions).forEach(([key, pos]) => {
            if (key === 'about') return;
            
            const path = this.createCircuitPath(centerPos, pos);
            pathsGroup.appendChild(path);
        });
    }
    
    createCircuitPath(start, end) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'circuit-connection');
        
        // Create straight-line circuit board paths with right angles
        const midX = start.x + (end.x - start.x) * 0.7;
        const midY = start.y;
        
        // Main horizontal line from center
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', start.x);
        line1.setAttribute('y1', start.y);
        line1.setAttribute('x2', midX);
        line1.setAttribute('y2', midY);
        line1.setAttribute('class', 'circuit-trace');
        
        // Vertical line to target height
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', midX);
        line2.setAttribute('y1', midY);
        line2.setAttribute('x2', midX);
        line2.setAttribute('y2', end.y);
        line2.setAttribute('class', 'circuit-trace');
        
        // Final horizontal line to target
        const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line3.setAttribute('x1', midX);
        line3.setAttribute('y1', end.y);
        line3.setAttribute('x2', end.x);
        line3.setAttribute('y2', end.y);
        line3.setAttribute('class', 'circuit-trace');
        
        // Add junction dots at corners
        const junction1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        junction1.setAttribute('cx', midX);
        junction1.setAttribute('cy', midY);
        junction1.setAttribute('r', '3');
        junction1.setAttribute('class', 'circuit-junction');
        
        const junction2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        junction2.setAttribute('cx', midX);
        junction2.setAttribute('cy', end.y);
        junction2.setAttribute('r', '3');
        junction2.setAttribute('class', 'circuit-junction');
        
        g.appendChild(line1);
        g.appendChild(line2);
        g.appendChild(line3);
        g.appendChild(junction1);
        g.appendChild(junction2);
        
        return g;
    }
    
    setupEventListeners() {
        // Mouse events for pan
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Wheel event for zoom
        this.container.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Touch events for mobile
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.container.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Node click events
        this.nodes.forEach(node => {
            node.addEventListener('click', this.handleNodeClick.bind(this));
        });
        
        // Prevent context menu
        this.container.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    handleMouseDown(e) {
        if (e.target.closest('.node')) return; // Don't drag when clicking nodes
        
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.container.style.cursor = 'grabbing';
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.translateX += deltaX / this.scale;
        this.translateY += deltaY / this.scale;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        this.updateTransform();
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.container.style.cursor = 'grab';
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        const rect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(this.scale * delta, this.minScale), this.maxScale);
        
        if (newScale !== this.scale) {
            // Zoom towards mouse position
            const scaleChange = newScale / this.scale;
            
            this.translateX -= (mouseX / this.scale) * (scaleChange - 1);
            this.translateY -= (mouseY / this.scale) * (scaleChange - 1);
            
            this.scale = newScale;
            this.updateTransform();
        }
    }
    
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.lastMouseX = touch.clientX;
            this.lastMouseY = touch.clientY;
            this.isDragging = true;
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.lastMouseX;
            const deltaY = touch.clientY - this.lastMouseY;
            
            this.translateX += deltaX / this.scale;
            this.translateY += deltaY / this.scale;
            
            this.lastMouseX = touch.clientX;
            this.lastMouseY = touch.clientY;
            
            this.updateTransform();
        }
    }
    
    handleTouchEnd() {
        this.isDragging = false;
    }
    
    handleNodeClick(e) {
        const node = e.currentTarget;
        const nodeType = node.getAttribute('data-node');
        
        // Add click animation
        node.style.transform += ' scale(0.95)';
        setTimeout(() => {
            node.style.transform = node.style.transform.replace(' scale(0.95)', '');
        }, 150);
        
        // Here you can add content display logic
        console.log(`Clicked on ${nodeType} node`);
        this.showNodeContent(nodeType);
    }
    
    showNodeContent(nodeType) {
        // Placeholder for showing node content
        // You can implement modal or side panel here
        alert(`${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} section clicked!\nYou can customize this content.`);
    }
    
    updateTransform() {
        this.canvas.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }
    
    setupNavigation() {
        const menuToggle = document.getElementById('menu-toggle');
        const navContent = document.getElementById('nav-content');
        const navItems = document.querySelectorAll('.nav-item');
        
        menuToggle.addEventListener('click', () => {
            navContent.classList.toggle('active');
        });
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                this.navigateToNode(target);
                navContent.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#nav-menu')) {
                navContent.classList.remove('active');
            }
        });
    }
    
    navigateToNode(nodeType) {
        const pos = this.nodePositions[nodeType];
        if (!pos) return;
        
        // Calculate target position to center the node
        const containerRect = this.container.getBoundingClientRect();
        const targetX = -pos.x + containerRect.width / 2;
        const targetY = -pos.y + containerRect.height / 2;
        
        // Animate to position
        this.animateToPosition(targetX, targetY, 1);
    }
    
    animateToPosition(targetX, targetY, targetScale, duration = 800) {
        const startX = this.translateX;
        const startY = this.translateY;
        const startScale = this.scale;
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.translateX = startX + (targetX - startX) * easeOut;
            this.translateY = startY + (targetY - startY) * easeOut;
            this.scale = startScale + (targetScale - startScale) * easeOut;
            
            this.updateTransform();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    setupZoomControls() {
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        const resetView = document.getElementById('reset-view');
        
        zoomIn.addEventListener('click', () => {
            const newScale = Math.min(this.scale * 1.2, this.maxScale);
            if (newScale !== this.scale) {
                this.scale = newScale;
                this.updateTransform();
            }
        });
        
        zoomOut.addEventListener('click', () => {
            const newScale = Math.max(this.scale * 0.8, this.minScale);
            if (newScale !== this.scale) {
                this.scale = newScale;
                this.updateTransform();
            }
        });
        
        resetView.addEventListener('click', () => {
            this.animateToPosition(-460, -140, 1);
        });
    }
}

// Initialize the portfolio canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioCanvas();
});