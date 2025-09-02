import { 
  PathConfig, 
  Waypoint, 
  Position
} from './types.js';

export class Path {
  private config: Required<PathConfig>;
  private element!: SVGGElement;
  private pathElements: SVGPathElement[] = [];
  private junctionElements: SVGCircleElement[] = [];
  private glowElements: SVGPathElement[] = [];

  constructor(config: PathConfig) {
    this.config = this.mergeDefaultConfig(config);
    this.validateWaypoints();
    this.createElement();
    this.applyStyle();
  }

  private mergeDefaultConfig(config: PathConfig): Required<PathConfig> {
    return {
      id: config.id || `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      waypoints: config.waypoints,
      width: config.width || 3,
      color: config.color || '#00ff88',
      animated: config.animated ?? true,
      className: config.className || ''
    };
  }

  private validateWaypoints(): void {
    if (this.config.waypoints.length < 2) {
      throw new Error('Path must have at least 2 waypoints');
    }

    // Validate that all segments follow circuit board rules (horizontal, vertical, or 45-degree)
    for (let i = 0; i < this.config.waypoints.length - 1; i++) {
      const current = this.config.waypoints[i];
      const next = this.config.waypoints[i + 1];
      
      if (!this.isValidCircuitSegment(current, next)) {
        console.warn(`Invalid circuit segment from (${current.x}, ${current.y}) to (${next.x}, ${next.y}). Converting to circuit-board compatible path.`);
        // Auto-correct the path to be circuit-board compatible
        this.config.waypoints = this.correctWaypoints(this.config.waypoints);
        break;
      }
    }
  }

  private isValidCircuitSegment(from: Position, to: Position): boolean {
    const deltaX = Math.abs(to.x - from.x);
    const deltaY = Math.abs(to.y - from.y);
    
    // Horizontal line
    if (deltaY === 0) return true;
    
    // Vertical line
    if (deltaX === 0) return true;
    
    // 45-degree diagonal (equal deltaX and deltaY)
    if (deltaX === deltaY) return true;
    
    return false;
  }

  private correctWaypoints(waypoints: Waypoint[]): Waypoint[] {
    const corrected: Waypoint[] = [waypoints[0]];
    
    for (let i = 1; i < waypoints.length; i++) {
      const prev = corrected[corrected.length - 1];
      const current = waypoints[i];
      
      if (this.isValidCircuitSegment(prev, current)) {
        corrected.push(current);
      } else {
        // Insert intermediate waypoints to make it circuit-board compatible
        const intermediates = this.createCircuitPath(prev, current);
        corrected.push(...intermediates);
      }
    }
    
    return corrected;
  }

  private createCircuitPath(from: Position, to: Position): Waypoint[] {
    // const deltaX = to.x - from.x;
    // const deltaY = to.y - from.y;
    
    // Strategy: Go horizontal first, then vertical (L-shaped path)
    // This ensures we always have valid circuit board angles
    const intermediate: Waypoint = {
      x: to.x,
      y: from.y
    };
    
    // If the intermediate point is the same as start or end, skip it
    if (intermediate.x === from.x && intermediate.y === from.y) {
      return [to];
    }
    if (intermediate.x === to.x && intermediate.y === to.y) {
      return [to];
    }
    
    return [intermediate, to];
  }

  // private getSegmentAngle(from: Position, to: Position): CircuitAngle {
  //   const deltaX = to.x - from.x;
  //   const deltaY = to.y - from.y;
  //   
  //   if (deltaY === 0) {
  //     return CIRCUIT_ANGLES.HORIZONTAL;
  //   }
  //   if (deltaX === 0) {
  //     return CIRCUIT_ANGLES.VERTICAL;
  //   }
  //   if (deltaX > 0 && deltaY < 0) {
  //     return CIRCUIT_ANGLES.DIAGONAL_NE;
  //   }
  //   if (deltaX < 0 && deltaY < 0) {
  //     return CIRCUIT_ANGLES.DIAGONAL_NW;
  //   }
  //   if (deltaX > 0 && deltaY > 0) {
  //     return CIRCUIT_ANGLES.DIAGONAL_SE;
  //   }
  //   if (deltaX < 0 && deltaY > 0) {
  //     return CIRCUIT_ANGLES.DIAGONAL_SW;
  //   }
  //   
  //   return CIRCUIT_ANGLES.HORIZONTAL; // fallback
  // }

  private createElement(): void {
    // Create main group
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.setAttribute('class', `circuit-ui-path ${this.config.className}`);
    this.element.setAttribute('data-path-id', this.config.id);
    
    // Create path segments
    this.createPathSegments();
    
    // Create junctions at waypoints
    this.createJunctions();
    
    // Add animation if enabled
    if (this.config.animated) {
      this.addAnimation();
    }
  }

  private createPathSegments(): void {
    for (let i = 0; i < this.config.waypoints.length - 1; i++) {
      const from = this.config.waypoints[i];
      const to = this.config.waypoints[i + 1];
      
      // Create the main path
      const pathElement = this.createPathElement(from, to, false);
      this.pathElements.push(pathElement);
      this.element.appendChild(pathElement);
      
      // Create glow effect
      const glowElement = this.createPathElement(from, to, true);
      this.glowElements.push(glowElement);
      this.element.insertBefore(glowElement, pathElement); // Glow behind main path
    }
  }

  private createPathElement(from: Position, to: Position, isGlow: boolean): SVGPathElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    const pathData = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.config.color);
    path.setAttribute('stroke-width', isGlow ? (this.config.width + 2).toString() : this.config.width.toString());
    path.setAttribute('stroke-linecap', 'round');
    
    if (isGlow) {
      path.setAttribute('class', 'path-glow');
      path.setAttribute('opacity', '0.3');
      path.style.filter = `drop-shadow(0 0 8px ${this.config.color})`;
    } else {
      path.setAttribute('class', 'path-main');
      path.setAttribute('opacity', '0.8');
      path.style.filter = `drop-shadow(0 0 3px ${this.config.color})`;
    }
    
    return path;
  }

  private createJunctions(): void {
    // Create junctions at intermediate waypoints (not start/end)
    for (let i = 1; i < this.config.waypoints.length - 1; i++) {
      const waypoint = this.config.waypoints[i];
      
      const junction = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      junction.setAttribute('cx', waypoint.x.toString());
      junction.setAttribute('cy', waypoint.y.toString());
      junction.setAttribute('r', Math.max(3, this.config.width / 2 + 1).toString());
      junction.setAttribute('fill', this.config.color);
      junction.setAttribute('class', 'path-junction');
      junction.style.filter = `drop-shadow(0 0 5px ${this.config.color})`;
      
      this.junctionElements.push(junction);
      this.element.appendChild(junction);
    }
  }

  private addAnimation(): void {
    // Add pulsing animation to the path
    this.pathElements.forEach((path, index) => {
      path.style.animation = `circuitPulse 3s ease-in-out infinite`;
      path.style.animationDelay = `${index * 0.2}s`; // Stagger animation
    });
    
    this.junctionElements.forEach((junction, index) => {
      junction.style.animation = `junctionPulse 2s ease-in-out infinite`;
      junction.style.animationDelay = `${index * 0.3}s`;
    });
  }

  private applyStyle(): void {
    // Apply custom styling
    this.element.style.transition = 'opacity 0.3s ease';
  }

  // Public API methods
  public setColor(color: string): void {
    this.config.color = color;
    
    this.pathElements.forEach(path => {
      path.setAttribute('stroke', color);
      path.style.filter = `drop-shadow(0 0 3px ${color})`;
    });
    
    this.glowElements.forEach(glow => {
      glow.setAttribute('stroke', color);
      glow.style.filter = `drop-shadow(0 0 8px ${color})`;
    });
    
    this.junctionElements.forEach(junction => {
      junction.setAttribute('fill', color);
      junction.style.filter = `drop-shadow(0 0 5px ${color})`;
    });
  }

  public setWidth(width: number): void {
    this.config.width = width;
    
    this.pathElements.forEach(path => {
      path.setAttribute('stroke-width', width.toString());
    });
    
    this.glowElements.forEach(glow => {
      glow.setAttribute('stroke-width', (width + 2).toString());
    });
    
    this.junctionElements.forEach(junction => {
      junction.setAttribute('r', Math.max(3, width / 2 + 1).toString());
    });
  }

  public setOpacity(opacity: number): void {
    this.element.style.opacity = opacity.toString();
  }

  public highlight(color = '#ffaa00', duration = 2000): void {
    const originalColor = this.config.color;
    this.setColor(color);
    
    // Add extra glow
    this.pathElements.forEach(path => {
      path.style.filter = `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color})`;
    });
    
    setTimeout(() => {
      this.setColor(originalColor);
      this.pathElements.forEach(path => {
        path.style.filter = `drop-shadow(0 0 3px ${originalColor})`;
      });
    }, duration);
  }

  public updateWaypoints(waypoints: Waypoint[]): void {
    this.config.waypoints = waypoints;
    this.validateWaypoints();
    
    // Clear existing elements
    this.pathElements.forEach(el => el.remove());
    this.glowElements.forEach(el => el.remove());
    this.junctionElements.forEach(el => el.remove());
    
    this.pathElements = [];
    this.glowElements = [];
    this.junctionElements = [];
    
    // Recreate elements
    this.createPathSegments();
    this.createJunctions();
    
    if (this.config.animated) {
      this.addAnimation();
    }
  }

  public hide(): void {
    this.element.style.opacity = '0';
  }

  public show(): void {
    this.element.style.opacity = '1';
  }

  public destroy(): void {
    this.element.remove();
  }

  // Static utility methods
  public static createStraightPath(from: Position, to: Position): Waypoint[] {
    return [from, to];
  }

  public static createLPath(from: Position, to: Position, cornerAtDestination = true): Waypoint[] {
    if (cornerAtDestination) {
      return [
        from,
        { x: to.x, y: from.y },
        to
      ];
    } else {
      return [
        from,
        { x: from.x, y: to.y },
        to
      ];
    }
  }

  public static createZPath(from: Position, to: Position): Waypoint[] {
    const midX = from.x + (to.x - from.x) * 0.7;
    return [
      from,
      { x: midX, y: from.y },
      { x: midX, y: to.y },
      to
    ];
  }

  // Getters
  public getId(): string { return this.config.id; }
  public getWaypoints(): Waypoint[] { return [...this.config.waypoints]; }
  public getColor(): string { return this.config.color; }
  public getWidth(): number { return this.config.width; }
  public isAnimated(): boolean { return this.config.animated; }
  public getElement(): SVGGElement { return this.element; }
  public getConfig(): Required<PathConfig> { return { ...this.config }; }
}