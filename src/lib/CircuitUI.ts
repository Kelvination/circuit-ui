import { Canvas } from './Canvas.js';
import { Node } from './Node.js';
import { Path } from './Path.js';
import { 
  CanvasConfig, 
  NodeConfig, 
  PathConfig,
  Position,
  Size,
  NavigationConfig,
  Bounds,
  CircuitUISchema
} from './types.js';

export class CircuitUI {
  private canvas: Canvas;
  private nodes: Map<string, Node> = new Map();
  private paths: Map<string, Path> = new Map();
  private activeNodeId?: string;
  private navigationHistory: string[] = [];
  protected eventListeners: Map<string, Function[]> = new Map();

  constructor(config: CanvasConfig) {
    this.canvas = new Canvas(config);
    this.setupCanvasEvents();
  }

  private setupCanvasEvents(): void {
    // Handle canvas events if needed
    this.canvas.on('click', (_event) => {
      // Handle canvas click
    });
  }

  // Node management
  public addNode(config: NodeConfig): Node {
    if (this.nodes.has(config.id)) {
      throw new Error(`Node with id '${config.id}' already exists`);
    }

    const node = new Node(config);
    this.nodes.set(config.id, node);
    
    // Add to canvas
    this.canvas.getNodesGroup().appendChild(node.getElement());
    
    return node;
  }

  public removeNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (node) {
      node.destroy();
      this.nodes.delete(id);
      
      // Remove any paths connected to this node
      this.removePathsConnectedToNode(id);
      
      return true;
    }
    return false;
  }

  public getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  private removePathsConnectedToNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    const nodePosition = node.getPosition();
    
    this.paths.forEach((path, pathId) => {
      const waypoints = path.getWaypoints();
      const isConnected = waypoints.some(wp => 
        Math.abs(wp.x - nodePosition.x) < 10 && Math.abs(wp.y - nodePosition.y) < 10
      );
      
      if (isConnected) {
        this.removePath(pathId);
      }
    });
  }

  // Path management
  public addPath(config: PathConfig): Path {
    const id = config.id || `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pathConfig = { ...config, id };
    
    if (this.paths.has(id)) {
      throw new Error(`Path with id '${id}' already exists`);
    }

    const path = new Path(pathConfig);
    this.paths.set(id, path);
    
    // Add to canvas
    this.canvas.getPathsGroup().appendChild(path.getElement());
    
    return path;
  }

  public removePath(id: string): boolean {
    const path = this.paths.get(id);
    if (path) {
      path.destroy();
      this.paths.delete(id);
      return true;
    }
    return false;
  }

  public getPath(id: string): Path | undefined {
    return this.paths.get(id);
  }

  public getAllPaths(): Path[] {
    return Array.from(this.paths.values());
  }

  // Simplified navigation - just pan to center the node
  public async navigateToNode(nodeId: string, config?: Partial<NavigationConfig>): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node with id '${nodeId}' not found`);
    }

    const navigationConfig: NavigationConfig = {
      duration: 800,
      zoomOut: false,
      fitToView: false,
      padding: 50,
      ...config
    };

    const nodePosition = node.getPosition();
    const nodeSize = node.getSize();
    const viewport = this.canvas.getViewport();
    const viewportSize = this.getViewportSize();
    
    // Calculate the center point of the node
    const nodeCenterX = nodePosition.x + nodeSize.width / 2;
    const nodeCenterY = nodePosition.y + nodeSize.height / 2;
    
    let targetZoom = viewport.zoom;
    
    // If fitToView is enabled, calculate optimal zoom to fit the node
    if (navigationConfig.fitToView) {
      // Calculate zoom needed to fit node with padding
      const padding = navigationConfig.padding || 50;
      const availableWidth = viewportSize.width - padding * 2;
      const availableHeight = viewportSize.height - padding * 2;
      
      const zoomX = availableWidth / nodeSize.width;
      const zoomY = availableHeight / nodeSize.height;
      
      // Use the smaller zoom to ensure node fits completely
      targetZoom = Math.min(zoomX, zoomY);
      
      // Clamp zoom to configured limits
      const canvas = this.canvas;
      const config = canvas.getConfig();
      targetZoom = Math.max(config.zoom.min, Math.min(config.zoom.max, targetZoom));
    }
    
    // Calculate viewport position to center the node at the target zoom
    const targetPosition: Position = {
      x: viewportSize.width / 2 - nodeCenterX * targetZoom,
      y: viewportSize.height / 2 - nodeCenterY * targetZoom
    };
    
    // Debug logging
    console.log(`\n=== Navigating to node ${nodeId} ===`);
    console.log(`Node: (${nodePosition.x}, ${nodePosition.y}) ${nodeSize.width}x${nodeSize.height}`);
    console.log(`Node center: (${nodeCenterX}, ${nodeCenterY})`);
    console.log(`FitToView: ${navigationConfig.fitToView}, Target zoom: ${targetZoom.toFixed(2)}`);
    console.log(`Target position: (${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)})`);
    console.log(`=================================\n`);
    
    // Add to navigation history
    if (this.activeNodeId && this.activeNodeId !== nodeId) {
      this.navigationHistory.push(this.activeNodeId);
    }
    
    // Set active node
    if (this.activeNodeId) {
      const previousNode = this.nodes.get(this.activeNodeId);
      previousNode?.setFocused(false);
    }
    
    this.activeNodeId = nodeId;
    node.setFocused(true);
    
    // Animate to target position and zoom
    await this.animateViewport(targetPosition, targetZoom, navigationConfig);
    
    // Highlight the node
    node.pulse('#ffaa00', 1000);
    
    // Emit navigation event
    this.emit('node-navigated', { nodeId, node });
  }

  public async panTo(position: Position, duration = 800): Promise<void> {
    const viewportSize = this.getViewportSize();
    const targetPosition: Position = {
      x: -position.x + viewportSize.width / 2,
      y: -position.y + viewportSize.height / 2
    };
    
    await this.animateViewport(targetPosition, this.canvas.getViewport().zoom, { duration });
  }

  public async zoomTo(zoom: number, duration = 500): Promise<void> {
    const viewport = this.canvas.getViewport();
    const viewportSize = this.getViewportSize();
    
    // Calculate what world point is currently at screen center
    const currentCenterX = (viewportSize.width / 2 - viewport.x) / viewport.zoom;
    const currentCenterY = (viewportSize.height / 2 - viewport.y) / viewport.zoom;
    
    // Calculate new viewport position to keep the same world point centered
    const newX = viewportSize.width / 2 - currentCenterX * zoom;
    const newY = viewportSize.height / 2 - currentCenterY * zoom;
    
    console.log('ZoomTo Debug:');
    console.log(`  Current center in world: (${currentCenterX.toFixed(1)}, ${currentCenterY.toFixed(1)})`);
    console.log(`  Old viewport: (${viewport.x.toFixed(1)}, ${viewport.y.toFixed(1)}) @ ${viewport.zoom.toFixed(2)}x`);
    console.log(`  New viewport: (${newX.toFixed(1)}, ${newY.toFixed(1)}) @ ${zoom.toFixed(2)}x`);
    
    await this.animateViewport({ x: newX, y: newY }, zoom, { duration });
  }

  public async zoomToFit(duration = 800): Promise<void> {
    if (this.nodes.size === 0) return;
    
    const bounds = this.calculateContentBounds();
    const viewportSize = this.getViewportSize();
    
    // Calculate scale to fit all content
    const scaleX = viewportSize.width / bounds.width;
    const scaleY = viewportSize.height / bounds.height;
    const scale = Math.min(scaleX, scaleY) * 0.8; // 80% of available space
    
    // Center the content - need to account for the zoom level
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    // Calculate target position accounting for zoom
    const targetPosition: Position = {
      x: -centerX * scale + viewportSize.width / 2,
      y: -centerY * scale + viewportSize.height / 2
    };
    
    await this.animateViewport(targetPosition, scale, { duration });
  }

  private async animateViewport(position: Position, zoom: number, config: NavigationConfig): Promise<void> {
    const viewport = this.canvas.getViewport();
    const startPos = { x: viewport.x, y: viewport.y };
    const startZoom = viewport.zoom;
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / config.duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentPos = {
          x: startPos.x + (position.x - startPos.x) * easeOut,
          y: startPos.y + (position.y - startPos.y) * easeOut
        };
        const currentZoom = startZoom + (zoom - startZoom) * easeOut;
        
        // Set the viewport position using the proper method
        this.canvas.setViewport({
          x: currentPos.x,
          y: currentPos.y,
          zoom: currentZoom
        });
        
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

  private calculateContentBounds(): Bounds {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    // Include all nodes
    this.nodes.forEach(node => {
      const pos = node.getPosition();
      const size = node.getSize();
      
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + size.width);
      maxY = Math.max(maxY, pos.y + size.height);
    });
    
    // Include all path waypoints
    this.paths.forEach(path => {
      path.getWaypoints().forEach(wp => {
        minX = Math.min(minX, wp.x);
        minY = Math.min(minY, wp.y);
        maxX = Math.max(maxX, wp.x);
        maxY = Math.max(maxY, wp.y);
      });
    });
    
    return {
      x: minX - 100, // Add some padding
      y: minY - 100,
      width: maxX - minX + 200,
      height: maxY - minY + 200
    };
  }

  private getViewportSize(): Size {
    const container = this.canvas.getContainer();
    const rect = container.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }


  // Utility methods for creating paths between nodes
  public connectNodes(fromId: string, toId: string, pathConfig?: Partial<PathConfig>): Path {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    
    if (!fromNode || !toNode) {
      throw new Error(`One or both nodes not found: ${fromId}, ${toId}`);
    }
    
    const fromPos = fromNode.getPosition();
    const fromSize = fromNode.getSize();
    const toPos = toNode.getPosition();
    const toSize = toNode.getSize();
    
    // Calculate connection points (center of nodes)
    const startPoint: Position = {
      x: fromPos.x + fromSize.width / 2,
      y: fromPos.y + fromSize.height / 2
    };
    
    const endPoint: Position = {
      x: toPos.x + toSize.width / 2,
      y: toPos.y + toSize.height / 2
    };
    
    // Create L-shaped path (circuit board style)
    const waypoints = Path.createLPath(startPoint, endPoint);
    
    const config: PathConfig = {
      waypoints,
      ...pathConfig
    };
    
    return this.addPath(config);
  }

  // Search functionality
  public searchNodes(query: string): Node[] {
    return this.getAllNodes().filter(node => {
      const content = node.getContent().toLowerCase();
      const id = node.getId().toLowerCase();
      const searchTerm = query.toLowerCase();
      
      return content.includes(searchTerm) || id.includes(searchTerm);
    });
  }

  public highlightNodes(nodes: Node[], color = '#ffaa00', duration = 3000): void {
    nodes.forEach(node => {
      node.pulse(color, duration);
    });
  }

  // Canvas access
  public getCanvas(): Canvas {
    return this.canvas;
  }

  // Cleanup
  public destroy(): void {
    this.nodes.forEach(node => node.destroy());
    this.paths.forEach(path => path.destroy());
    this.nodes.clear();
    this.paths.clear();
  }

  // Export/Import functionality
  public toSchema(): CircuitUISchema {
    const nodes: NodeConfig[] = [];
    const paths: PathConfig[] = [];
    
    // Export all nodes
    this.nodes.forEach(node => {
      nodes.push({
        id: node.getId(),
        position: node.getPosition(),
        size: node.getSize(),
        content: node.getContent(),
        className: node.getClassName(),
        draggable: node.isDraggable(),
        zIndex: node.getZIndex(),
        type: node.getType(),
        data: node.getData()
      });
    });
    
    // Export all paths
    this.paths.forEach(path => {
      paths.push({
        id: path.getId(),
        waypoints: path.getWaypoints(),
        width: path.getWidth(),
        color: path.getColor(),
        animated: path.isAnimated(),
        className: path.getClassName()
      });
    });
    
    return {
      version: '1.0.0',
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      canvas: this.canvas.getConfig(),
      nodes,
      paths
    };
  }
  
  public static fromSchema(schema: CircuitUISchema, container?: string | HTMLElement): CircuitUI {
    // Use provided container or extract from schema
    const canvasConfig: CanvasConfig = {
      ...schema.canvas,
      container: container || schema.canvas.container
    };
    
    const circuitUI = new CircuitUI(canvasConfig);
    
    // Add all nodes
    schema.nodes.forEach(nodeConfig => {
      circuitUI.addNode(nodeConfig);
    });
    
    // Add all paths
    schema.paths.forEach(pathConfig => {
      circuitUI.addPath(pathConfig);
    });
    
    return circuitUI;
  }
  
  public exportToJSON(): string {
    return JSON.stringify(this.toSchema(), null, 2);
  }
  
  public static importFromJSON(json: string, container?: string | HTMLElement): CircuitUI {
    const schema = JSON.parse(json) as CircuitUISchema;
    return CircuitUI.fromSchema(schema, container);
  }

  // Event system
  public on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  public off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  protected emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // Navigation helpers
  public navigateBack(): void {
    if (this.navigationHistory.length > 0) {
      const previousNodeId = this.navigationHistory.pop()!;
      this.navigateToNode(previousNodeId);
    }
  }

  public getActiveNode(): Node | undefined {
    return this.activeNodeId ? this.nodes.get(this.activeNodeId) : undefined;
  }

  public getActiveNodeId(): string | undefined {
    return this.activeNodeId;
  }

  public getNavigationHistory(): string[] {
    return [...this.navigationHistory];
  }

  // Static factory method
  public static create(containerSelector: string | HTMLElement, config?: Partial<CanvasConfig>): CircuitUI {
    const fullConfig: CanvasConfig = {
      container: containerSelector,
      ...config
    };
    
    return new CircuitUI(fullConfig);
  }
}