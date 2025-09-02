import { CircuitUI } from './CircuitUI.js';
import { Node } from './Node.js';
import { 
  CanvasConfig, 
  NodeConfig, 
  CircuitUISchema,
  NodeRegistry,
  NodeComponentProps,
  NodeTypeDefinition
} from './types.js';

export interface CircuitUIReactConfig extends CanvasConfig {
  nodeRegistry?: NodeRegistry;
  nodeTypes?: NodeTypeDefinition[];
  onNodeRender?: (node: Node, element: HTMLElement, circuit: CircuitUIReact) => void;
  autoNavigateOnClick?: boolean;
}

export class CircuitUIReact extends CircuitUI {
  private nodeRegistry: NodeRegistry = {};
  private nodeTypes: Map<string, NodeTypeDefinition> = new Map();
  private onNodeRender: ((node: Node, element: HTMLElement, circuit: CircuitUIReact) => void) | undefined;
  private autoNavigateOnClick: boolean;

  constructor(config: CircuitUIReactConfig) {
    super(config);
    
    this.nodeRegistry = config.nodeRegistry || {};
    this.onNodeRender = config.onNodeRender;
    this.autoNavigateOnClick = config.autoNavigateOnClick ?? true;
    
    if (config.nodeTypes) {
      config.nodeTypes.forEach(nodeType => {
        this.nodeTypes.set(nodeType.type, nodeType);
      });
    }
    
    this.setupReactIntegration();
  }

  private setupReactIntegration(): void {
    // Listen for node additions to setup React rendering
    this.on('node-added', (data: { node: Node }) => {
      this.setupNodeReactIntegration(data.node);
    });
    
    // Setup auto-navigation on click if enabled
    if (this.autoNavigateOnClick) {
      this.on('node-clicked', (data: { nodeId: string, node: Node }) => {
        this.navigateToNode(data.nodeId);
      });
    }
  }

  private setupNodeReactIntegration(node: Node): void {
    const nodeType = node.getType();
    const component = this.nodeRegistry[nodeType];
    
    if (component && this.onNodeRender) {
      const element = node.getElement();
      const contentContainer = element.querySelector('.node-content') as HTMLElement;
      
      if (contentContainer) {
        // Create a wrapper div for React content
        const reactContainer = document.createElement('div');
        reactContainer.className = 'react-node-container';
        reactContainer.style.cssText = 'width: 100%; height: 100%;';
        
        // Clear existing content
        contentContainer.innerHTML = '';
        contentContainer.appendChild(reactContainer);
        
        // Call the render callback
        this.onNodeRender(node, reactContainer, this);
      }
    }
    
    // Setup click handler for navigation
    node.on('click', () => {
      this.emit('node-clicked', { nodeId: node.getId(), node });
    });
  }

  // Override addNode to emit node-added event
  public addNode(config: NodeConfig): Node {
    const node = super.addNode(config);
    this.emit('node-added', { node });
    return node;
  }

  // Enhanced methods for React integration
  public setNodeRegistry(registry: NodeRegistry): void {
    this.nodeRegistry = registry;
    
    // Re-render existing nodes if they have matching types
    this.getAllNodes().forEach(node => {
      const nodeType = node.getType();
      if (this.nodeRegistry[nodeType]) {
        this.setupNodeReactIntegration(node);
      }
    });
  }

  public addNodeType(nodeType: NodeTypeDefinition): void {
    this.nodeTypes.set(nodeType.type, nodeType);
  }

  public getNodeType(type: string): NodeTypeDefinition | undefined {
    return this.nodeTypes.get(type);
  }

  public getAllNodeTypes(): NodeTypeDefinition[] {
    return Array.from(this.nodeTypes.values());
  }

  public createNodeFromType(type: string, position: { x: number, y: number }, customData?: Record<string, any>): Node {
    const nodeTypeDef = this.nodeTypes.get(type);
    if (!nodeTypeDef) {
      throw new Error(`Node type '${type}' not found in registry`);
    }

    const config: NodeConfig = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: type,
      position: position,
      size: nodeTypeDef.defaultSize,
      data: { ...nodeTypeDef.defaultData, ...customData },
      draggable: true
    };

    return this.addNode(config);
  }

  // Navigation with React component integration
  public async navigateToNode(nodeId: string, config?: any): Promise<void> {
    const node = this.getNode(nodeId);
    if (!node) {
      throw new Error(`Node with id '${nodeId}' not found`);
    }

    // Call parent navigation
    await super.navigateToNode(nodeId, config);
    
    // Trigger React component updates if needed
    const nodeType = node.getType();
    const component = this.nodeRegistry[nodeType];
    
    if (component) {
      // Component can listen to navigation events
      this.emit('node-navigated-react', { 
        nodeId, 
        node, 
        data: node.getData(),
        component 
      });
    }
  }

  // Export schema with React-specific data
  public toReactSchema(): CircuitUISchema & { nodeTypes: NodeTypeDefinition[] } {
    const baseSchema = this.toSchema();
    return {
      ...baseSchema,
      nodeTypes: this.getAllNodeTypes()
    };
  }

  // Create from schema with React integration
  public static fromReactSchema(
    schema: CircuitUISchema & { nodeTypes?: NodeTypeDefinition[] }, 
    config: CircuitUIReactConfig
  ): CircuitUIReact {
    // Merge node types from schema
    const nodeTypes = [
      ...(config.nodeTypes || []),
      ...(schema.nodeTypes || [])
    ];
    
    const circuitConfig: CircuitUIReactConfig = {
      ...schema.canvas,
      ...config,
      nodeTypes
    };
    
    const circuit = new CircuitUIReact(circuitConfig);
    
    // Add nodes and paths
    schema.nodes.forEach(nodeConfig => {
      circuit.addNode(nodeConfig);
    });
    
    schema.paths.forEach(pathConfig => {
      circuit.addPath(pathConfig);
    });
    
    return circuit;
  }

  // Helper for creating component props
  public createNodeProps(nodeId: string): NodeComponentProps | null {
    const node = this.getNode(nodeId);
    if (!node) return null;
    
    return {
      nodeId: nodeId,
      data: node.getData(),
      circuit: this,
      onNavigate: (targetNodeId: string) => this.navigateToNode(targetNodeId)
    };
  }

  // Utility methods for React components
  public updateNodeData(nodeId: string, data: Record<string, any>): void {
    const node = this.getNode(nodeId);
    if (node) {
      node.setData(data);
      this.emit('node-data-updated', { nodeId, data, node });
    }
  }

  public getNodesByType(type: string): Node[] {
    return this.getAllNodes().filter(node => node.getType() === type);
  }

  // Cleanup
  public destroy(): void {
    // Clear React-specific event listeners
    this.eventListeners.clear();
    
    // Call parent destroy
    super.destroy();
  }
}