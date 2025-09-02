import { CircuitUI } from './CircuitUI.js';
import { Node } from './Node.js';
import { Path } from './Path.js';
import { 
  CanvasConfig, 
  NodeConfig, 
  PathConfig,
  Position,
  UIBuilderConfig,
  CircuitUISchema,
  NodeTypeDefinition
} from './types.js';

export type BuilderMode = 'select' | 'add-node' | 'add-path' | 'delete';

export interface BuilderState {
  mode: BuilderMode;
  selectedNodes: Set<string>;
  selectedPaths: Set<string>;
  pathInProgress?: {
    startNodeId: string;
    waypoints: Position[];
  } | undefined;
  clipboard: {
    nodes: NodeConfig[];
    paths: PathConfig[];
  };
  activeNodeType: string;
}

export interface UIBuilderConstructorConfig extends UIBuilderConfig {
  nodeTypes?: NodeTypeDefinition[];
}

export class UIBuilder extends CircuitUI {
  private builderConfig: Required<UIBuilderConfig>;
  private builderState: BuilderState;
  private undoStack: CircuitUISchema[] = [];
  private redoStack: CircuitUISchema[] = [];
  private maxUndoSteps = 50;
  private nodeTypes: Map<string, NodeTypeDefinition> = new Map();

  constructor(canvasConfig: CanvasConfig, builderConfig?: Partial<UIBuilderConstructorConfig>) {
    super(canvasConfig);
    
    this.builderConfig = this.mergeBuilderConfig(builderConfig || {});
    this.builderState = this.createInitialState();
    
    // Setup node types
    if (builderConfig?.nodeTypes) {
      builderConfig.nodeTypes.forEach(nodeType => {
        this.nodeTypes.set(nodeType.type, nodeType);
      });
    }
    
    // Add default node type if none provided
    if (this.nodeTypes.size === 0) {
      this.nodeTypes.set('default', {
        type: 'default',
        label: 'Default Node',
        defaultSize: { width: 200, height: 120 },
        icon: '📦',
        description: 'A basic node with text content'
      });
    }
    
    this.setupBuilderEvents();
    this.setupKeyboardShortcuts();
  }

  private mergeBuilderConfig(config: Partial<UIBuilderConfig>): Required<UIBuilderConfig> {
    return {
      toolbar: {
        position: 'top',
        collapsed: false,
        ...config.toolbar
      },
      panels: {
        properties: true,
        layers: true,
        export: true,
        ...config.panels
      },
      shortcuts: {
        enabled: true,
        customKeys: {},
        ...config.shortcuts
      }
    };
  }

  private createInitialState(): BuilderState {
    return {
      mode: 'select',
      selectedNodes: new Set(),
      selectedPaths: new Set(),
      clipboard: {
        nodes: [],
        paths: []
      },
      activeNodeType: 'default'
    };
  }

  private setupBuilderEvents(): void {
    const canvas = this.getCanvas();
    
    // Canvas click - deselect all or start node placement
    canvas.on('click', (event) => {
      if (this.builderState.mode === 'select') {
        this.clearSelection();
      } else if (this.builderState.mode === 'add-node') {
        this.addNodeAtPosition(event.position);
      }
    });
    
    // Node events for selection and path creation
    this.getAllNodes().forEach(node => {
      node.on('click', (event) => this.handleNodeClick(node, event));
    });
  }

  private setupKeyboardShortcuts(): void {
    if (!this.builderConfig.shortcuts.enabled) return;
    
    document.addEventListener('keydown', (e) => {
      if (e.target !== document.body && !(e.target as HTMLElement).classList.contains('circuit-ui-canvas')) return;
      
      const key = e.key.toLowerCase();
      const isCtrl = e.ctrlKey || e.metaKey;
      
      if (isCtrl) {
        switch (key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              this.redo();
            } else {
              this.undo();
            }
            break;
          case 'c':
            e.preventDefault();
            this.copy();
            break;
          case 'v':
            e.preventDefault();
            this.paste();
            break;
          case 'a':
            e.preventDefault();
            this.selectAll();
            break;
        }
      } else {
        switch (key) {
          case 'escape':
            this.setMode('select');
            this.clearSelection();
            break;
          case 'delete':
          case 'backspace':
            this.deleteSelected();
            break;
          case '1':
            this.setMode('select');
            break;
          case '2':
            this.setMode('add-node');
            break;
          case '3':
            this.setMode('add-path');
            break;
          case '4':
            this.setMode('delete');
            break;
        }
      }
    });
  }

  private handleNodeClick(node: Node, event: any): void {
    event.originalEvent.stopPropagation();
    
    switch (this.builderState.mode) {
      case 'select':
        this.toggleNodeSelection(node.getId());
        break;
      case 'add-path':
        this.handlePathCreation(node);
        break;
      case 'delete':
        this.deleteNode(node.getId());
        break;
    }
  }

  private handlePathCreation(node: Node): void {
    if (!this.builderState.pathInProgress) {
      // Start new path
      this.builderState.pathInProgress = {
        startNodeId: node.getId(),
        waypoints: []
      };
    } else {
      // Complete path
      const endNodeId = node.getId();
      if (endNodeId !== this.builderState.pathInProgress.startNodeId) {
        this.saveState();
        this.connectNodes(this.builderState.pathInProgress.startNodeId, endNodeId);
        this.builderState.pathInProgress = undefined as any;
      }
    }
  }

  // Mode Management
  public setMode(mode: BuilderMode): void {
    this.builderState.mode = mode;
    this.builderState.pathInProgress = undefined as any;
    this.emitModeChange(mode);
  }

  public getMode(): BuilderMode {
    return this.builderState.mode;
  }

  // Selection Management
  public selectNode(nodeId: string): void {
    this.builderState.selectedNodes.add(nodeId);
    const node = this.getNode(nodeId);
    if (node) {
      node.setFocused(true);
    }
    this.emitSelectionChange();
  }

  public deselectNode(nodeId: string): void {
    this.builderState.selectedNodes.delete(nodeId);
    const node = this.getNode(nodeId);
    if (node) {
      node.setFocused(false);
    }
    this.emitSelectionChange();
  }

  public toggleNodeSelection(nodeId: string): void {
    if (this.builderState.selectedNodes.has(nodeId)) {
      this.deselectNode(nodeId);
    } else {
      this.selectNode(nodeId);
    }
  }

  public selectPath(pathId: string): void {
    this.builderState.selectedPaths.add(pathId);
    const path = this.getPath(pathId);
    if (path) {
      path.highlight('#ffaa00');
    }
    this.emitSelectionChange();
  }

  public deselectPath(pathId: string): void {
    this.builderState.selectedPaths.delete(pathId);
    this.emitSelectionChange();
  }

  public clearSelection(): void {
    // Clear node selection
    this.builderState.selectedNodes.forEach(nodeId => {
      const node = this.getNode(nodeId);
      if (node) {
        node.setFocused(false);
      }
    });
    this.builderState.selectedNodes.clear();
    
    // Clear path selection
    this.builderState.selectedPaths.clear();
    
    this.emitSelectionChange();
  }

  public selectAll(): void {
    this.getAllNodes().forEach(node => {
      this.selectNode(node.getId());
    });
    this.getAllPaths().forEach(path => {
      this.selectPath(path.getId());
    });
  }

  // Node Creation and Editing
  public addNodeAtPosition(position: Position, config?: Partial<NodeConfig>): Node {
    this.saveState();
    
    const activeNodeType = this.builderState.activeNodeType;
    const nodeTypeDef = this.nodeTypes.get(activeNodeType);
    
    const nodeConfig: NodeConfig = {
      id: `${activeNodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      position,
      type: activeNodeType,
      content: nodeTypeDef?.label || 'New Node',
      size: nodeTypeDef?.defaultSize || { width: 200, height: 120 },
      data: nodeTypeDef?.defaultData || {},
      draggable: true,
      ...config
    };
    
    const node = this.addNode(nodeConfig);
    this.setupNodeBuilderEvents(node);
    return node;
  }

  public deleteNode(nodeId: string): boolean {
    this.saveState();
    this.deselectNode(nodeId);
    return this.removeNode(nodeId);
  }

  public deleteSelected(): void {
    if (this.builderState.selectedNodes.size > 0 || this.builderState.selectedPaths.size > 0) {
      this.saveState();
      
      // Delete selected nodes
      Array.from(this.builderState.selectedNodes).forEach(nodeId => {
        this.removeNode(nodeId);
      });
      
      // Delete selected paths
      Array.from(this.builderState.selectedPaths).forEach(pathId => {
        this.removePath(pathId);
      });
      
      this.clearSelection();
    }
  }

  private setupNodeBuilderEvents(node: Node): void {
    node.on('click', (event) => this.handleNodeClick(node, event));
  }

  // Copy/Paste Operations
  public copy(): void {
    const selectedNodeConfigs: NodeConfig[] = [];
    const selectedPathConfigs: PathConfig[] = [];
    
    // Copy selected nodes
    this.builderState.selectedNodes.forEach(nodeId => {
      const node = this.getNode(nodeId);
      if (node) {
        selectedNodeConfigs.push(node.getConfig());
      }
    });
    
    // Copy selected paths
    this.builderState.selectedPaths.forEach(pathId => {
      const path = this.getPath(pathId);
      if (path) {
        selectedPathConfigs.push(path.getConfig());
      }
    });
    
    this.builderState.clipboard = {
      nodes: selectedNodeConfigs,
      paths: selectedPathConfigs
    };
  }

  public paste(): void {
    if (this.builderState.clipboard.nodes.length === 0) return;
    
    this.saveState();
    this.clearSelection();
    
    const offset = { x: 50, y: 50 };
    const nodeIdMap: Map<string, string> = new Map();
    
    // Paste nodes with new IDs and offset positions
    this.builderState.clipboard.nodes.forEach(nodeConfig => {
      const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      nodeIdMap.set(nodeConfig.id, newId);
      
      const newNodeConfig: NodeConfig = {
        ...nodeConfig,
        id: newId,
        position: {
          x: nodeConfig.position.x + offset.x,
          y: nodeConfig.position.y + offset.y
        }
      };
      
      const node = this.addNode(newNodeConfig);
      this.setupNodeBuilderEvents(node);
      this.selectNode(newId);
    });
    
    // TODO: Paste paths with updated node references
    // This would require mapping old node IDs to new ones
  }

  // Undo/Redo System
  private saveState(): void {
    const currentState = this.toSchema();
    this.undoStack.push(currentState);
    
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift();
    }
    
    // Clear redo stack when new action is performed
    this.redoStack = [];
  }

  public undo(): boolean {
    if (this.undoStack.length === 0) return false;
    
    const currentState = this.toSchema();
    this.redoStack.push(currentState);
    
    const previousState = this.undoStack.pop()!;
    this.loadFromSchema(previousState);
    
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    
    const currentState = this.toSchema();
    this.undoStack.push(currentState);
    
    const nextState = this.redoStack.pop()!;
    this.loadFromSchema(nextState);
    
    return true;
  }

  private loadFromSchema(schema: CircuitUISchema): void {
    // Clear current state
    this.clearSelection();
    this.destroy();
    
    // Clear current nodes and paths
    this.getAllNodes().forEach(node => this.removeNode(node.getId()));
    this.getAllPaths().forEach(path => this.removePath(path.getId()));
    
    schema.nodes.forEach(nodeConfig => {
      const node = this.addNode(nodeConfig);
      this.setupNodeBuilderEvents(node);
    });
    
    schema.paths.forEach(pathConfig => {
      this.addPath(pathConfig);
    });
  }

  // Override addNode to setup builder events
  public addNode(config: NodeConfig): Node {
    const node = super.addNode(config);
    this.setupNodeBuilderEvents(node);
    return node;
  }

  // Events
  private emitModeChange(mode: BuilderMode): void {
    // Emit custom event for UI updates
    document.dispatchEvent(new CustomEvent('builder-mode-change', { detail: { mode } }));
  }

  private emitSelectionChange(): void {
    const detail = {
      selectedNodes: Array.from(this.builderState.selectedNodes),
      selectedPaths: Array.from(this.builderState.selectedPaths)
    };
    document.dispatchEvent(new CustomEvent('builder-selection-change', { detail }));
  }

  // Getters
  public getSelectedNodes(): Node[] {
    return Array.from(this.builderState.selectedNodes)
      .map(id => this.getNode(id))
      .filter(node => node !== undefined) as Node[];
  }

  public getSelectedPaths(): Path[] {
    return Array.from(this.builderState.selectedPaths)
      .map(id => this.getPath(id))
      .filter(path => path !== undefined) as Path[];
  }

  public getBuilderState(): BuilderState {
    return { ...this.builderState };
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  // Node type management
  public addNodeType(nodeType: NodeTypeDefinition): void {
    this.nodeTypes.set(nodeType.type, nodeType);
  }

  public removeNodeType(type: string): boolean {
    return this.nodeTypes.delete(type);
  }

  public getNodeType(type: string): NodeTypeDefinition | undefined {
    return this.nodeTypes.get(type);
  }

  public getAllNodeTypes(): NodeTypeDefinition[] {
    return Array.from(this.nodeTypes.values());
  }

  public setActiveNodeType(type: string): void {
    if (this.nodeTypes.has(type)) {
      this.builderState.activeNodeType = type;
      this.emitActiveNodeTypeChange(type);
    }
  }

  public getActiveNodeType(): string {
    return this.builderState.activeNodeType;
  }

  public getActiveNodeTypeDefinition(): NodeTypeDefinition | undefined {
    return this.nodeTypes.get(this.builderState.activeNodeType);
  }

  private emitActiveNodeTypeChange(type: string): void {
    document.dispatchEvent(new CustomEvent('builder-active-node-type-change', { detail: { type } }));
  }
}