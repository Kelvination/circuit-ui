import { 
  CanvasConfig, 
  Position, 
  Size, 
  Viewport, 
  CanvasEvent,
  CanvasEventHandler,
  NavigationConfig 
} from './types.js';

export class Canvas {
  private container: HTMLElement;
  private svg!: SVGSVGElement;
  private mainGroup!: SVGGElement;
  private pathsGroup!: SVGGElement;
  private nodesGroup!: SVGGElement;
  private debugGroup!: SVGGElement;
  
  private viewport: Viewport;
  private config: Required<CanvasConfig>;
  private isDragging: boolean = false;
  private dragStarted: boolean = false;
  private startPointer: Position = { x: 0, y: 0 };
  private lastPointer: Position = { x: 0, y: 0 };
  private momentum: { x: number; y: number } = { x: 0, y: 0 };
  private dragThreshold: number = 5; // pixels
  private animationId: number | null = null;
  private zoomSensitivity: number = 0.1;
  private debugMode: boolean = false;
  private debugCrosshair!: SVGGElement;
  private debugText!: SVGTextElement;
  
  private eventHandlers: Map<string, CanvasEventHandler[]> = new Map();

  constructor(config: CanvasConfig) {
    this.config = this.mergeDefaultConfig(config);
    this.container = this.resolveContainer(config.container);
    
    this.viewport = {
      x: 0,
      y: 0,
      zoom: 1
    };

    this.createSVGStructure();
    this.setupEventListeners();
  }

  private mergeDefaultConfig(config: CanvasConfig): Required<CanvasConfig> {
    return {
      container: config.container,
      dimensions: config.dimensions || { width: 3000, height: 2000 },
      theme: config.theme || 'dark',
      grid: {
        enabled: config.grid?.enabled ?? true,
        size: config.grid?.size ?? 20,
        opacity: config.grid?.opacity ?? 0.1
      },
      zoom: {
        min: config.zoom?.min ?? 0.1,
        max: config.zoom?.max ?? 3.0,
        step: config.zoom?.step ?? 0.1
      },
      pan: {
        momentum: config.pan?.momentum ?? true,
        edgeResistance: config.pan?.edgeResistance ?? true
      }
    };
  }

  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container) as HTMLElement;
      if (!element) {
        throw new Error(`Container not found: ${container}`);
      }
      return element;
    }
    return container;
  }

  private createSVGStructure(): void {
    // Clear container
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.cursor = 'grab';

    // Create main SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    this.svg.style.display = 'block';
    
    // Create main transform group
    this.mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.mainGroup.setAttribute('class', 'circuit-ui-main');
    
    // Create layer groups
    this.pathsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.pathsGroup.setAttribute('class', 'circuit-ui-paths');
    
    this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesGroup.setAttribute('class', 'circuit-ui-nodes');

    // Create debug group (not transformed - stays in screen space)
    this.debugGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.debugGroup.setAttribute('class', 'circuit-ui-debug');
    this.debugGroup.style.display = 'none'; // Hidden by default

    // Assemble structure
    this.mainGroup.appendChild(this.pathsGroup);
    this.mainGroup.appendChild(this.nodesGroup);
    this.svg.appendChild(this.mainGroup);
    this.svg.appendChild(this.debugGroup); // Debug group outside main group so it's not transformed
    this.container.appendChild(this.svg);

    // Apply initial theme
    this.applyTheme();
    
    // Create grid if enabled
    if (this.config.grid.enabled) {
      this.createGrid();
    }

    // Create debug overlay
    this.createDebugOverlay();

    // Center viewport initially
    this.centerView();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.container.addEventListener('mousedown', this.handlePointerDown.bind(this));
    document.addEventListener('mousemove', this.handlePointerMove.bind(this));
    document.addEventListener('mouseup', this.handlePointerUp.bind(this));
    
    // Wheel event for zoom
    this.container.addEventListener('wheel', this.handleWheel.bind(this));
    
    // Touch events
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Prevent context menu
    this.container.addEventListener('contextmenu', e => e.preventDefault());
    
    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Keyboard events for debug toggle
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'd' || e.key === 'D') {
      this.toggleDebugMode();
    }
  }

  private handlePointerDown(e: MouseEvent): void {
    this.isDragging = true;
    this.dragStarted = false;
    this.startPointer = { x: e.clientX, y: e.clientY };
    this.lastPointer = { x: e.clientX, y: e.clientY };
    this.momentum = { x: 0, y: 0 };
    
    // Stop any momentum animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Don't emit click event yet - wait to see if it's a drag
  }

  private handlePointerMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    
    const deltaX = e.clientX - this.lastPointer.x;
    const deltaY = e.clientY - this.lastPointer.y;
    
    // Check if we've moved far enough to start dragging
    if (!this.dragStarted) {
      const totalDistance = Math.sqrt(
        Math.pow(e.clientX - this.startPointer.x, 2) + 
        Math.pow(e.clientY - this.startPointer.y, 2)
      );
      
      if (totalDistance > this.dragThreshold) {
        this.dragStarted = true;
        this.container.style.cursor = 'grabbing';
      } else {
        return; // Don't pan until threshold is reached
      }
    }
    
    // Update momentum for smooth deceleration
    this.momentum.x = deltaX * 0.95;
    this.momentum.y = deltaY * 0.95;
    
    // Pan the viewport - no scaling needed since we want 1:1 mouse movement
    this.pan(deltaX, deltaY);
    
    this.lastPointer = { x: e.clientX, y: e.clientY };
  }

  private handlePointerUp(e: MouseEvent): void {
    const wasClick = this.isDragging && !this.dragStarted;
    
    this.isDragging = false;
    this.dragStarted = false;
    this.container.style.cursor = 'grab';
    
    // If it was just a click (no drag), emit click event
    if (wasClick) {
      this.emitEvent('click', { x: e.clientX, y: e.clientY }, e);
    } else {
      // Start momentum scrolling if enabled and we were dragging
      if (this.config.pan.momentum && (Math.abs(this.momentum.x) > 1 || Math.abs(this.momentum.y) > 1)) {
        this.startMomentumScroll();
      }
    }
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    
    const rect = this.container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Use configurable zoom sensitivity
    const zoomFactor = e.deltaY > 0 ? (1 - this.zoomSensitivity) : (1 + this.zoomSensitivity);
    this.zoomAt({ x: mouseX, y: mouseY }, zoomFactor);
  }

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handlePointerDown({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handlePointerMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    // Create a mock mouse event for touch end
    const touch = e.changedTouches[0] || { clientX: 0, clientY: 0 };
    this.handlePointerUp({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
  }

  private handleResize(): void {
    // Recalculate bounds and maintain viewport position
    this.updateTransform();
  }

  private startMomentumScroll(): void {
    const animate = () => {
      if (Math.abs(this.momentum.x) < 0.1 && Math.abs(this.momentum.y) < 0.1) {
        this.animationId = null;
        return;
      }
      
      this.pan(this.momentum.x, this.momentum.y);
      
      // Decay momentum
      this.momentum.x *= 0.95;
      this.momentum.y *= 0.95;
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }

  private createGrid(): void {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    pattern.setAttribute('id', 'circuit-ui-grid');
    pattern.setAttribute('width', this.config.grid.size.toString());
    pattern.setAttribute('height', this.config.grid.size.toString());
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    path.setAttribute('d', `M ${this.config.grid.size} 0 L 0 0 0 ${this.config.grid.size}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#00ff88');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('opacity', this.config.grid.opacity?.toString() || '0.1');
    
    pattern.appendChild(path);
    defs.appendChild(pattern);
    this.svg.insertBefore(defs, this.mainGroup);
    
    // Create infinite grid rect that covers a huge area
    const gridRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    gridRect.setAttribute('x', '-50000');
    gridRect.setAttribute('y', '-50000');
    gridRect.setAttribute('width', '100000');
    gridRect.setAttribute('height', '100000');
    gridRect.setAttribute('fill', 'url(#circuit-ui-grid)');
    gridRect.setAttribute('class', 'infinite-grid');
    
    // Insert grid as the first child so it's behind everything
    this.mainGroup.insertBefore(gridRect, this.mainGroup.firstChild);
  }

  private createDebugOverlay(): void {
    // Create crosshair group
    this.debugCrosshair = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.debugCrosshair.setAttribute('class', 'debug-crosshair');

    // Create horizontal crosshair line
    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', '-20');
    hLine.setAttribute('y1', '0');
    hLine.setAttribute('x2', '20');
    hLine.setAttribute('y2', '0');
    hLine.setAttribute('stroke', '#ff0000');
    hLine.setAttribute('stroke-width', '2');

    // Create vertical crosshair line
    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('x1', '0');
    vLine.setAttribute('y1', '-20');
    vLine.setAttribute('x2', '0');
    vLine.setAttribute('y2', '20');
    vLine.setAttribute('stroke', '#ff0000');
    vLine.setAttribute('stroke-width', '2');

    // Create center circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', '0');
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#ff0000');
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', '1');

    this.debugCrosshair.appendChild(hLine);
    this.debugCrosshair.appendChild(vLine);
    this.debugCrosshair.appendChild(circle);

    // Create text element for coordinates
    this.debugText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.debugText.setAttribute('class', 'debug-text');
    this.debugText.setAttribute('x', '30');
    this.debugText.setAttribute('y', '-10');
    this.debugText.setAttribute('fill', '#ff0000');
    this.debugText.setAttribute('font-family', 'monospace');
    this.debugText.setAttribute('font-size', '14');
    this.debugText.setAttribute('font-weight', 'bold');
    this.debugText.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';

    // Add to debug group
    this.debugGroup.appendChild(this.debugCrosshair);
    this.debugGroup.appendChild(this.debugText);
  }

  private applyTheme(): void {
    const theme = this.getThemeColors();
    this.container.style.background = theme.background;
  }

  private getThemeColors() {
    const themes = {
      dark: {
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f23 100%)',
        node: '#0f0f23',
        path: '#00ff88',
        text: '#ffffff'
      },
      light: {
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #d0d0d0 100%)',
        node: '#ffffff',
        path: '#2196F3',
        text: '#333333'
      },
      matrix: {
        background: 'linear-gradient(135deg, #000000 0%, #001100 50%, #000000 100%)',
        node: '#001100',
        path: '#00ff00',
        text: '#00ff00'
      }
    };
    
    return themes[this.config.theme];
  }

  // Public API methods
  public pan(deltaX: number, deltaY: number): void {
    this.viewport.x += deltaX;
    this.viewport.y += deltaY;
    
    // Skip edge resistance for infinite canvas
    // if (this.config.pan.edgeResistance) {
    //   this.applyEdgeResistance();
    // }
    
    this.updateTransform();
    this.emitEvent('pan', { x: this.viewport.x, y: this.viewport.y }, new Event('pan'));
  }

  public zoom(factor: number): void {
    const newZoom = Math.max(this.config.zoom.min, Math.min(this.config.zoom.max, this.viewport.zoom * factor));
    if (newZoom !== this.viewport.zoom) {
      this.viewport.zoom = newZoom;
      this.updateTransform();
      this.emitEvent('zoom', { x: this.viewport.x, y: this.viewport.y }, new Event('zoom'));
    }
  }

  public zoomAt(point: Position, factor: number): void {
    const oldZoom = this.viewport.zoom;
    const newZoom = Math.max(this.config.zoom.min, Math.min(this.config.zoom.max, oldZoom * factor));
    
    if (newZoom !== oldZoom) {
      // Standard zoom-to-point formula
      // The idea is: zoom around the mouse position by adjusting viewport
      const zoomRatio = newZoom / oldZoom;
      
      this.viewport.x = point.x - (point.x - this.viewport.x) * zoomRatio;
      this.viewport.y = point.y - (point.y - this.viewport.y) * zoomRatio;
      this.viewport.zoom = newZoom;
      
      this.updateTransform();
      this.emitEvent('zoom', point, new Event('zoom'));
    }
  }

  public animateTo(position: Position, config: NavigationConfig = { duration: 800 }): Promise<void> {
    return new Promise((resolve) => {
      const start = { x: this.viewport.x, y: this.viewport.y, zoom: this.viewport.zoom };
      const target = { 
        x: -position.x + this.getViewportSize().width / 2,
        y: -position.y + this.getViewportSize().height / 2,
        zoom: config.fitToView ? 1 : this.viewport.zoom
      };
      
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / config.duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        this.viewport.x = start.x + (target.x - start.x) * easeOut;
        this.viewport.y = start.y + (target.y - start.y) * easeOut;
        this.viewport.zoom = start.zoom + (target.zoom - start.zoom) * easeOut;
        
        this.updateTransform();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          config.onComplete?.();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  public centerView(): void {
    const viewportSize = this.getViewportSize();
    // For infinite canvas, center on origin (0, 0)
    this.viewport.x = viewportSize.width / 2;
    this.viewport.y = viewportSize.height / 2;
    this.viewport.zoom = 1;
    this.updateTransform();
  }


  private updateTransform(): void {
    this.mainGroup.setAttribute('transform', 
      `translate(${this.viewport.x}, ${this.viewport.y}) scale(${this.viewport.zoom})`
    );
    this.updateDebugOverlay();
  }

  private updateDebugOverlay(): void {
    if (!this.debugMode) return;
    
    const viewportSize = this.getViewportSize();
    const centerX = viewportSize.width / 2;
    const centerY = viewportSize.height / 2;
    
    // Position crosshair at screen center
    this.debugCrosshair.setAttribute('transform', `translate(${centerX}, ${centerY})`);
    
    // Calculate world coordinates at screen center
    const worldX = (centerX - this.viewport.x) / this.viewport.zoom;
    const worldY = (centerY - this.viewport.y) / this.viewport.zoom;
    
    // Update text display
    this.debugText.setAttribute('transform', `translate(${centerX}, ${centerY})`);
    this.debugText.textContent = `(${worldX.toFixed(1)}, ${worldY.toFixed(1)}) z:${this.viewport.zoom.toFixed(2)}`;
  }

  public toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
    this.debugGroup.style.display = this.debugMode ? 'block' : 'none';
    this.updateDebugOverlay();
  }

  private getViewportSize(): Size {
    const rect = this.container.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  private emitEvent(type: string, position: Position, originalEvent: Event): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      const event: CanvasEvent = {
        type: type as any,
        position,
        viewport: { ...this.viewport },
        originalEvent
      };
      handlers.forEach(handler => handler(event));
    }
  }

  // Event management
  public on(event: string, handler: CanvasEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: CanvasEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Viewport control methods
  public setViewport(viewport: Viewport): void {
    this.viewport = { ...viewport };
    this.updateTransform();
  }

  public setZoomSensitivity(sensitivity: number): void {
    this.zoomSensitivity = Math.max(0.01, Math.min(0.5, sensitivity));
  }

  public getZoomSensitivity(): number {
    return this.zoomSensitivity;
  }

  // Getters
  public getContainer(): HTMLElement { return this.container; }
  public getSVG(): SVGSVGElement { return this.svg; }
  public getNodesGroup(): SVGGElement { return this.nodesGroup; }
  public getPathsGroup(): SVGGElement { return this.pathsGroup; }
  public getViewport(): Viewport { return { ...this.viewport }; }
  public getConfig(): Required<CanvasConfig> { return this.config; }
}