import { 
  NodeConfig, 
  NodeStyle, 
  Position, 
  Size,
  NodeEvent,
  NodeEventHandler,
  NodeEventType 
} from './types.js';

export class Node {
  private config: Required<NodeConfig>;
  private element!: SVGGElement;
  private background!: SVGRectElement;
  private foreignObject!: SVGForeignObjectElement;
  private contentDiv!: HTMLDivElement;
  private glowElement?: SVGRectElement;
  
  private eventHandlers: Map<NodeEventType, NodeEventHandler[]> = new Map();
  private isHovered: boolean = false;
  private isDragging: boolean = false;
  private isFocused: boolean = false;

  constructor(config: NodeConfig) {
    this.config = this.mergeDefaultConfig(config);
    this.createElement();
    this.setupEventListeners();
    this.applyStyle();
  }

  private mergeDefaultConfig(config: NodeConfig): Required<NodeConfig> {
    return {
      id: config.id,
      position: config.position,
      size: config.size || { width: 200, height: 120 },
      content: config.content || '',
      className: config.className || '',
      draggable: config.draggable ?? false,
      zIndex: config.zIndex ?? 1
    };
  }

  private createElement(): void {
    // Create main group element
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.setAttribute('class', `circuit-ui-node ${this.config.className}`);
    this.element.setAttribute('data-node-id', this.config.id);
    this.element.setAttribute('transform', `translate(${this.config.position.x}, ${this.config.position.y})`);
    
    // Create glow effect (rendered first, so it's behind)
    this.glowElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.glowElement.setAttribute('class', 'node-glow');
    this.glowElement.setAttribute('x', '-5');
    this.glowElement.setAttribute('y', '-5');
    this.glowElement.setAttribute('width', (this.config.size.width + 10).toString());
    this.glowElement.setAttribute('height', (this.config.size.height + 10).toString());
    this.glowElement.setAttribute('rx', '8');
    this.glowElement.setAttribute('fill', 'none');
    this.glowElement.setAttribute('stroke', '#00ff88');
    this.glowElement.setAttribute('stroke-width', '2');
    this.glowElement.setAttribute('opacity', '0');
    this.glowElement.style.filter = 'drop-shadow(0 0 10px #00ff88)';
    
    // Create background rectangle
    this.background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.background.setAttribute('class', 'node-background');
    this.background.setAttribute('width', this.config.size.width.toString());
    this.background.setAttribute('height', this.config.size.height.toString());
    this.background.setAttribute('rx', '5');
    this.background.setAttribute('fill', 'transparent');
    this.background.setAttribute('stroke', 'transparent');
    this.background.setAttribute('stroke-width', '0');
    this.background.style.filter = 'none';
    
    // Create foreign object for HTML content
    this.foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    this.foreignObject.setAttribute('width', this.config.size.width.toString());
    this.foreignObject.setAttribute('height', this.config.size.height.toString());
    this.foreignObject.setAttribute('class', 'node-content-container');
    
    // Create HTML div for content
    this.contentDiv = document.createElement('div');
    this.contentDiv.className = 'node-content';
    this.contentDiv.style.cssText = `
      width: 100%;
      height: 100%;
      padding: 15px;
      box-sizing: border-box;
      color: #ffffff;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.4;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    `;
    
    // Set content
    if (this.config.content) {
      this.setContent(this.config.content);
    }
    
    // Assemble elements
    this.foreignObject.appendChild(this.contentDiv);
    this.element.appendChild(this.glowElement);
    this.element.appendChild(this.background);
    this.element.appendChild(this.foreignObject);
    
    // Set initial z-index
    this.element.style.zIndex = this.config.zIndex.toString();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.element.addEventListener('click', this.handleClick.bind(this));
    
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    
    // Drag events (if draggable)
    if (this.config.draggable) {
      this.element.addEventListener('mousedown', this.handleDragStart.bind(this));
      document.addEventListener('mousemove', this.handleDragMove.bind(this));
      document.addEventListener('mouseup', this.handleDragEnd.bind(this));
    }
    
    // Prevent text selection
    this.element.addEventListener('selectstart', e => e.preventDefault());
    this.element.style.cursor = 'pointer';
  }

  private handleMouseEnter(e: MouseEvent): void {
    this.isHovered = true;
    this.updateHoverState();
    this.emitEvent('hover', e);
  }

  private handleMouseLeave(e: MouseEvent): void {
    this.isHovered = false;
    this.updateHoverState();
    this.emitEvent('leave', e);
  }

  private handleClick(e: MouseEvent): void {
    // Don't handle clicks if this node is already focused
    if (this.isFocused) {
      return;
    }
    
    e.stopPropagation();
    this.addClickAnimation();
    this.emitEvent('click', e);
  }

  private handleTouchStart(e: TouchEvent): void {
    // Convert touch to mouse event
    const touch = e.touches[0];
    this.handleClick({ 
      clientX: touch.clientX, 
      clientY: touch.clientY,
      stopPropagation: () => e.stopPropagation()
    } as MouseEvent);
  }

  private handleDragStart(e: MouseEvent): void {
    if (!this.config.draggable) return;
    
    this.isDragging = true;
    // Implement drag logic here if needed
    this.emitEvent('drag', e);
  }

  private handleDragMove(_e: MouseEvent): void {
    if (!this.isDragging) return;
    // Implement drag move logic here if needed
  }

  private handleDragEnd(): void {
    this.isDragging = false;
  }

  private updateHoverState(): void {
    // Only show hover effects if not focused
    if (this.isHovered && !this.isFocused) {
      // Hover effects - show border and background
      this.element.style.transform = `translate(${this.config.position.x}px, ${this.config.position.y}px) scale(1.05)`;
      this.background.setAttribute('fill', 'rgba(15, 15, 35, 0.9)');
      this.background.setAttribute('stroke', '#00ff88');
      this.background.setAttribute('stroke-width', '3');
      this.background.style.filter = 'drop-shadow(0 0 15px rgba(0, 255, 136, 0.3))';
      if (this.glowElement) {
        this.glowElement.setAttribute('opacity', '0.6');
      }
    } else {
      // Normal/focused state - transparent background and border
      this.element.style.transform = `translate(${this.config.position.x}px, ${this.config.position.y}px) scale(1)`;
      this.background.setAttribute('fill', 'transparent');
      this.background.setAttribute('stroke', 'transparent');
      this.background.setAttribute('stroke-width', '0');
      this.background.style.filter = 'none';
      if (this.glowElement) {
        this.glowElement.setAttribute('opacity', '0');
      }
    }
  }

  private addClickAnimation(): void {
    // Quick scale animation
    this.element.style.transition = 'transform 0.1s ease-out';
    this.element.style.transform = `translate(${this.config.position.x}px, ${this.config.position.y}px) scale(0.95)`;
    
    setTimeout(() => {
      this.element.style.transform = this.isHovered 
        ? `translate(${this.config.position.x}px, ${this.config.position.y}px) scale(1.05)`
        : `translate(${this.config.position.x}px, ${this.config.position.y}px) scale(1)`;
      
      setTimeout(() => {
        this.element.style.transition = '';
      }, 150);
    }, 100);
  }

  private applyStyle(): void {
    // Apply any custom styling here
    this.element.style.transition = 'transform 0.3s ease';
  }

  private emitEvent(type: NodeEventType, originalEvent: Event): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      const rect = this.element.getBoundingClientRect();
      const event: NodeEvent = {
        type,
        node: this,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        originalEvent
      };
      handlers.forEach(handler => handler(event));
    }
  }

  // Public API methods
  public setContent(content: string): void {
    this.contentDiv.innerHTML = content;
    this.config.content = content;
  }

  public setPosition(position: Position, animated = false): void {
    this.config.position = position;
    
    if (animated) {
      this.element.style.transition = 'transform 0.5s ease-out';
      setTimeout(() => {
        this.element.style.transition = '';
      }, 500);
    }
    
    this.element.setAttribute('transform', `translate(${position.x}, ${position.y})`);
  }

  public setSize(size: Size): void {
    this.config.size = size;
    
    // Update background
    this.background.setAttribute('width', size.width.toString());
    this.background.setAttribute('height', size.height.toString());
    
    // Update foreign object
    this.foreignObject.setAttribute('width', size.width.toString());
    this.foreignObject.setAttribute('height', size.height.toString());
    
    // Update glow
    if (this.glowElement) {
      this.glowElement.setAttribute('width', (size.width + 10).toString());
      this.glowElement.setAttribute('height', (size.height + 10).toString());
    }
  }

  public setStyle(style: Partial<NodeStyle>): void {
    if (style.backgroundColor) {
      this.background.setAttribute('fill', style.backgroundColor);
    }
    if (style.borderColor) {
      this.background.setAttribute('stroke', style.borderColor);
      if (this.glowElement) {
        this.glowElement.setAttribute('stroke', style.borderColor);
      }
    }
    if (style.borderWidth !== undefined) {
      this.background.setAttribute('stroke-width', style.borderWidth.toString());
    }
    if (style.textColor) {
      this.contentDiv.style.color = style.textColor;
    }
    if (style.fontSize !== undefined) {
      this.contentDiv.style.fontSize = `${style.fontSize}px`;
    }
  }

  public pulse(color = '#00ff88', duration = 1000): void {
    const originalStroke = this.background.getAttribute('stroke');
    this.background.setAttribute('stroke', color);
    
    if (this.glowElement) {
      this.glowElement.setAttribute('stroke', color);
      this.glowElement.style.animation = `pulse ${duration}ms ease-in-out`;
      
      setTimeout(() => {
        this.glowElement!.style.animation = '';
        this.background.setAttribute('stroke', originalStroke || '#00ff88');
        if (this.glowElement) {
          this.glowElement.setAttribute('stroke', originalStroke || '#00ff88');
        }
      }, duration);
    }
  }

  public hide(): void {
    this.element.style.opacity = '0';
    this.element.style.pointerEvents = 'none';
  }

  public show(): void {
    this.element.style.opacity = '1';
    this.element.style.pointerEvents = 'auto';
  }

  public destroy(): void {
    this.element.remove();
    this.eventHandlers.clear();
  }

  // Event management
  public on(event: NodeEventType, handler: NodeEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: NodeEventType, handler: NodeEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Focus management
  public setFocused(focused: boolean): void {
    this.isFocused = focused;
    this.updateHoverState(); // Update visual state
  }

  public isFocusedState(): boolean {
    return this.isFocused;
  }

  // Getters
  public getId(): string { return this.config.id; }
  public getPosition(): Position { return { ...this.config.position }; }
  public getSize(): Size { return { ...this.config.size }; }
  public getContent(): string { return this.config.content; }
  public getElement(): SVGGElement { return this.element; }
  public getConfig(): Required<NodeConfig> { return { ...this.config }; }
}