import { UIBuilder, BuilderMode } from './UIBuilder.js';
import { Node } from './Node.js';
import { Path } from './Path.js';
import { Position } from './types.js';

export class BuilderUI {
  private builder: UIBuilder;
  private container: HTMLElement;
  private toolbar!: HTMLElement;
  private propertiesPanel!: HTMLElement;
  private exportPanel!: HTMLElement;
  private layersPanel!: HTMLElement;

  constructor(builder: UIBuilder, container: HTMLElement) {
    this.builder = builder;
    this.container = container;
    
    this.createUI();
    this.setupEventListeners();
  }

  private createUI(): void {
    // Create main wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'circuit-ui-builder';
    wrapper.innerHTML = `
      <div class="builder-toolbar"></div>
      <div class="builder-main">
        <div class="builder-canvas-container"></div>
        <div class="builder-panels">
          <div class="builder-properties-panel panel"></div>
          <div class="builder-layers-panel panel"></div>
          <div class="builder-export-panel panel"></div>
        </div>
      </div>
    `;
    
    // Move canvas to builder container
    const canvasElement = this.builder.getCanvas().getContainer();
    const canvasContainer = wrapper.querySelector('.builder-canvas-container') as HTMLElement;
    canvasContainer.appendChild(canvasElement);
    
    // Replace original container content
    this.container.innerHTML = '';
    this.container.appendChild(wrapper);
    
    // Force canvas to resize to new container
    setTimeout(() => {
      // Call canvas resize method directly
      this.builder.getCanvas().resize();
      // Also trigger window resize to ensure proper sizing
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
    // Store references
    this.toolbar = wrapper.querySelector('.builder-toolbar') as HTMLElement;
    this.propertiesPanel = wrapper.querySelector('.builder-properties-panel') as HTMLElement;
    this.layersPanel = wrapper.querySelector('.builder-layers-panel') as HTMLElement;
    this.exportPanel = wrapper.querySelector('.builder-export-panel') as HTMLElement;
    
    this.createToolbar();
    this.createPropertiesPanel();
    this.createLayersPanel();
    this.createExportPanel();
  }

  private createToolbar(): void {
    this.toolbar.innerHTML = `
      <div class="toolbar-section">
        <h3>Mode</h3>
        <div class="mode-buttons">
          <button class="mode-btn active" data-mode="select" title="Select (1)">
            <span class="icon">⚪</span>
            <span class="label">Select</span>
          </button>
          <button class="mode-btn" data-mode="add-node" title="Add Node (2)">
            <span class="icon">📦</span>
            <span class="label">Add Node</span>
          </button>
          <button class="mode-btn" data-mode="add-path" title="Add Path (3)">
            <span class="icon">🔗</span>
            <span class="label">Add Path</span>
          </button>
          <button class="mode-btn" data-mode="delete" title="Delete (4)">
            <span class="icon">🗑️</span>
            <span class="label">Delete</span>
          </button>
        </div>
      </div>
      
      <div class="toolbar-section">
        <h3>Actions</h3>
        <div class="action-buttons">
          <button class="action-btn" data-action="undo" title="Undo (Ctrl+Z)">
            <span class="icon">↶</span>
            <span class="label">Undo</span>
          </button>
          <button class="action-btn" data-action="redo" title="Redo (Ctrl+Shift+Z)">
            <span class="icon">↷</span>
            <span class="label">Redo</span>
          </button>
          <button class="action-btn" data-action="copy" title="Copy (Ctrl+C)">
            <span class="icon">📋</span>
            <span class="label">Copy</span>
          </button>
          <button class="action-btn" data-action="paste" title="Paste (Ctrl+V)">
            <span class="icon">📄</span>
            <span class="label">Paste</span>
          </button>
          <button class="action-btn" data-action="delete" title="Delete Selected (Del)">
            <span class="icon">🗑️</span>
            <span class="label">Delete</span>
          </button>
        </div>
      </div>
      
      <div class="toolbar-section">
        <h3>View</h3>
        <div class="view-buttons">
          <button class="view-btn" data-action="zoom-fit" title="Zoom to Fit">
            <span class="icon">🔍</span>
            <span class="label">Fit</span>
          </button>
          <button class="view-btn" data-action="zoom-100" title="Zoom 100%">
            <span class="icon">1:1</span>
          </button>
        </div>
      </div>
    `;
  }

  private createPropertiesPanel(): void {
    this.propertiesPanel.innerHTML = `
      <div class="panel-header">
        <h3>Properties</h3>
        <button class="panel-toggle">−</button>
      </div>
      <div class="panel-content">
        <div class="no-selection">
          <p>Select a node or path to edit properties</p>
        </div>
        <div class="node-properties" style="display: none;">
          <div class="property-group">
            <label>ID</label>
            <input type="text" class="prop-id" readonly>
          </div>
          <div class="property-group">
            <label>Content</label>
            <textarea class="prop-content" rows="3"></textarea>
          </div>
          <div class="property-group">
            <label>Position</label>
            <div class="position-inputs">
              <input type="number" class="prop-x" placeholder="X">
              <input type="number" class="prop-y" placeholder="Y">
            </div>
          </div>
          <div class="property-group">
            <label>Size</label>
            <div class="size-inputs">
              <input type="number" class="prop-width" placeholder="Width">
              <input type="number" class="prop-height" placeholder="Height">
            </div>
          </div>
          <div class="property-group">
            <label>Class Name</label>
            <input type="text" class="prop-classname">
          </div>
          <div class="property-group">
            <label>
              <input type="checkbox" class="prop-draggable"> Draggable
            </label>
          </div>
        </div>
        <div class="path-properties" style="display: none;">
          <div class="property-group">
            <label>ID</label>
            <input type="text" class="prop-path-id" readonly>
          </div>
          <div class="property-group">
            <label>Color</label>
            <input type="color" class="prop-path-color">
          </div>
          <div class="property-group">
            <label>Width</label>
            <input type="number" class="prop-path-width" min="1" max="20">
          </div>
          <div class="property-group">
            <label>
              <input type="checkbox" class="prop-path-animated"> Animated
            </label>
          </div>
        </div>
      </div>
    `;
  }

  private createLayersPanel(): void {
    this.layersPanel.innerHTML = `
      <div class="panel-header">
        <h3>Layers</h3>
        <button class="panel-toggle">−</button>
      </div>
      <div class="panel-content">
        <div class="layers-list">
          <div class="layer-group">
            <h4>Nodes</h4>
            <ul class="nodes-list"></ul>
          </div>
          <div class="layer-group">
            <h4>Paths</h4>
            <ul class="paths-list"></ul>
          </div>
        </div>
      </div>
    `;
  }

  private createExportPanel(): void {
    this.exportPanel.innerHTML = `
      <div class="panel-header">
        <h3>Export / Import</h3>
        <button class="panel-toggle">−</button>
      </div>
      <div class="panel-content">
        <div class="export-section">
          <h4>Export</h4>
          <button class="export-btn" data-format="json">Export as JSON</button>
          <button class="export-btn" data-action="copy-json">Copy JSON</button>
        </div>
        <div class="import-section">
          <h4>Import</h4>
          <input type="file" class="import-file" accept=".json" style="display: none;">
          <button class="import-btn">Import JSON File</button>
          <div class="import-text">
            <label>Or paste JSON:</label>
            <textarea class="import-textarea" rows="4" placeholder="Paste JSON here..."></textarea>
            <button class="import-paste-btn">Import from Text</button>
          </div>
        </div>
        <div class="templates-section">
          <h4>Templates</h4>
          <button class="template-btn" data-template="simple">Simple Layout</button>
          <button class="template-btn" data-template="flowchart">Flowchart</button>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    this.setupToolbarEvents();
    this.setupPropertiesEvents();
    this.setupLayersEvents();
    this.setupExportEvents();
    this.setupBuilderEvents();
  }

  private setupToolbarEvents(): void {
    // Mode buttons
    this.toolbar.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = (e.currentTarget as HTMLElement).dataset.mode as BuilderMode;
        this.builder.setMode(mode);
      });
    });

    // Action buttons
    this.toolbar.querySelectorAll('.action-btn, .view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        this.handleToolbarAction(action!);
      });
    });
  }

  private setupPropertiesEvents(): void {
    const panel = this.propertiesPanel;

    // Node properties
    panel.querySelector('.prop-content')?.addEventListener('input', (e) => {
      const selectedNodes = this.builder.getSelectedNodes();
      if (selectedNodes.length === 1) {
        selectedNodes[0].setContent((e.target as HTMLTextAreaElement).value);
      }
    });

    panel.querySelector('.prop-x')?.addEventListener('change', (e) => {
      this.updateSelectedNodePosition('x', parseFloat((e.target as HTMLInputElement).value));
    });

    panel.querySelector('.prop-y')?.addEventListener('change', (e) => {
      this.updateSelectedNodePosition('y', parseFloat((e.target as HTMLInputElement).value));
    });

    // Path properties
    panel.querySelector('.prop-path-color')?.addEventListener('change', (e) => {
      const selectedPaths = this.builder.getSelectedPaths();
      if (selectedPaths.length === 1) {
        selectedPaths[0].setColor((e.target as HTMLInputElement).value);
      }
    });

    panel.querySelector('.prop-path-width')?.addEventListener('change', (e) => {
      const selectedPaths = this.builder.getSelectedPaths();
      if (selectedPaths.length === 1) {
        selectedPaths[0].setWidth(parseInt((e.target as HTMLInputElement).value));
      }
    });
  }

  private setupLayersEvents(): void {
    this.updateLayers();
  }

  private setupExportEvents(): void {
    const panel = this.exportPanel;

    // Export buttons
    panel.querySelector('[data-format="json"]')?.addEventListener('click', () => {
      this.exportJSON();
    });

    panel.querySelector('[data-action="copy-json"]')?.addEventListener('click', () => {
      this.copyJSON();
    });

    // Import buttons
    panel.querySelector('.import-btn')?.addEventListener('click', () => {
      (panel.querySelector('.import-file') as HTMLInputElement).click();
    });

    panel.querySelector('.import-file')?.addEventListener('change', (e) => {
      this.importFromFile((e.target as HTMLInputElement).files?.[0]);
    });

    panel.querySelector('.import-paste-btn')?.addEventListener('click', () => {
      const textarea = panel.querySelector('.import-textarea') as HTMLTextAreaElement;
      this.importFromJSON(textarea.value);
    });

    // Template buttons
    panel.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = (e.currentTarget as HTMLElement).dataset.template;
        this.loadTemplate(template!);
      });
    });
  }

  private setupBuilderEvents(): void {
    // Listen for builder events
    document.addEventListener('builder-mode-change', (e: any) => {
      this.updateModeButtons(e.detail.mode);
    });

    document.addEventListener('builder-selection-change', () => {
      this.updatePropertiesPanel();
      this.updateLayers();
    });
  }

  private handleToolbarAction(action: string): void {
    switch (action) {
      case 'undo':
        this.builder.undo();
        break;
      case 'redo':
        this.builder.redo();
        break;
      case 'copy':
        this.builder.copy();
        break;
      case 'paste':
        this.builder.paste();
        break;
      case 'delete':
        this.builder.deleteSelected();
        break;
      case 'zoom-fit':
        this.builder.zoomToFit();
        break;
      case 'zoom-100':
        this.builder.zoomTo(1);
        break;
    }
  }

  private updateModeButtons(mode: BuilderMode): void {
    this.toolbar.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('active');
      if ((btn as HTMLElement).dataset.mode === mode) {
        btn.classList.add('active');
      }
    });
  }

  private updatePropertiesPanel(): void {
    const selectedNodes = this.builder.getSelectedNodes();
    const selectedPaths = this.builder.getSelectedPaths();
    
    const noSelection = this.propertiesPanel.querySelector('.no-selection') as HTMLElement;
    const nodeProps = this.propertiesPanel.querySelector('.node-properties') as HTMLElement;
    const pathProps = this.propertiesPanel.querySelector('.path-properties') as HTMLElement;

    if (selectedNodes.length === 1 && selectedPaths.length === 0) {
      // Single node selected
      noSelection.style.display = 'none';
      nodeProps.style.display = 'block';
      pathProps.style.display = 'none';
      
      this.populateNodeProperties(selectedNodes[0]);
    } else if (selectedPaths.length === 1 && selectedNodes.length === 0) {
      // Single path selected
      noSelection.style.display = 'none';
      nodeProps.style.display = 'none';
      pathProps.style.display = 'block';
      
      this.populatePathProperties(selectedPaths[0]);
    } else {
      // No selection or multiple selection
      noSelection.style.display = 'block';
      nodeProps.style.display = 'none';
      pathProps.style.display = 'none';
    }
  }

  private populateNodeProperties(node: Node): void {
    const panel = this.propertiesPanel;
    
    (panel.querySelector('.prop-id') as HTMLInputElement).value = node.getId();
    (panel.querySelector('.prop-content') as HTMLTextAreaElement).value = node.getContent();
    (panel.querySelector('.prop-x') as HTMLInputElement).value = node.getPosition().x.toString();
    (panel.querySelector('.prop-y') as HTMLInputElement).value = node.getPosition().y.toString();
    (panel.querySelector('.prop-width') as HTMLInputElement).value = node.getSize().width.toString();
    (panel.querySelector('.prop-height') as HTMLInputElement).value = node.getSize().height.toString();
    (panel.querySelector('.prop-classname') as HTMLInputElement).value = node.getClassName();
    (panel.querySelector('.prop-draggable') as HTMLInputElement).checked = node.isDraggable();
  }

  private populatePathProperties(path: Path): void {
    const panel = this.propertiesPanel;
    
    (panel.querySelector('.prop-path-id') as HTMLInputElement).value = path.getId();
    (panel.querySelector('.prop-path-color') as HTMLInputElement).value = path.getColor();
    (panel.querySelector('.prop-path-width') as HTMLInputElement).value = path.getWidth().toString();
    (panel.querySelector('.prop-path-animated') as HTMLInputElement).checked = path.isAnimated();
  }

  private updateSelectedNodePosition(axis: 'x' | 'y', value: number): void {
    const selectedNodes = this.builder.getSelectedNodes();
    if (selectedNodes.length === 1) {
      const currentPos = selectedNodes[0].getPosition();
      const newPos: Position = axis === 'x' 
        ? { x: value, y: currentPos.y }
        : { x: currentPos.x, y: value };
      selectedNodes[0].setPosition(newPos, true);
    }
  }

  private updateLayers(): void {
    const nodesList = this.layersPanel.querySelector('.nodes-list') as HTMLUListElement;
    const pathsList = this.layersPanel.querySelector('.paths-list') as HTMLUListElement;

    // Update nodes list
    nodesList.innerHTML = '';
    this.builder.getAllNodes().forEach(node => {
      const li = document.createElement('li');
      li.className = 'layer-item';
      li.innerHTML = `
        <span class="item-name">${node.getId()}</span>
        <span class="item-actions">
          <button class="focus-btn" data-node-id="${node.getId()}">🎯</button>
          <button class="delete-btn" data-node-id="${node.getId()}">❌</button>
        </span>
      `;
      nodesList.appendChild(li);
    });

    // Update paths list
    pathsList.innerHTML = '';
    this.builder.getAllPaths().forEach(path => {
      const li = document.createElement('li');
      li.className = 'layer-item';
      li.innerHTML = `
        <span class="item-name">${path.getId()}</span>
        <span class="item-actions">
          <button class="delete-btn" data-path-id="${path.getId()}">❌</button>
        </span>
      `;
      pathsList.appendChild(li);
    });

    // Add event listeners for layer actions
    this.layersPanel.querySelectorAll('[data-node-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nodeId = (e.currentTarget as HTMLElement).dataset.nodeId!;
        if ((e.currentTarget as HTMLElement).classList.contains('focus-btn')) {
          this.builder.navigateToNode(nodeId);
        } else {
          this.builder.deleteNode(nodeId);
        }
      });
    });

    this.layersPanel.querySelectorAll('[data-path-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pathId = (btn as HTMLElement).dataset.pathId!;
        this.builder.removePath(pathId);
      });
    });
  }

  private exportJSON(): void {
    const json = this.builder.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuit-ui-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  private copyJSON(): void {
    const json = this.builder.exportToJSON();
    navigator.clipboard.writeText(json).then(() => {
      alert('JSON copied to clipboard!');
    });
  }

  private importFromFile(file?: File): void {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.importFromJSON(e.target?.result as string);
    };
    reader.readAsText(file);
  }

  private importFromJSON(json: string): void {
    try {
      const schema = JSON.parse(json);
      
      // Clear current content
      this.builder.getAllNodes().forEach(node => this.builder.removeNode(node.getId()));
      this.builder.getAllPaths().forEach(path => this.builder.removePath(path.getId()));
      
      // Import nodes
      schema.nodes.forEach((nodeConfig: any) => {
        this.builder.addNode(nodeConfig);
      });
      
      // Import paths
      schema.paths.forEach((pathConfig: any) => {
        this.builder.addPath(pathConfig);
      });
      
      this.builder.zoomToFit();
      alert('Circuit imported successfully!');
    } catch (error) {
      alert('Error importing JSON: ' + error);
    }
  }

  private loadTemplate(template: string): void {
    switch (template) {
      case 'simple':
        this.loadSimpleTemplate();
        break;
      case 'flowchart':
        this.loadFlowchartTemplate();
        break;
    }
  }

  private loadSimpleTemplate(): void {
    // Clear existing content
    this.builder.getAllNodes().forEach(node => this.builder.removeNode(node.getId()));
    this.builder.getAllPaths().forEach(path => this.builder.removePath(path.getId()));
    
    // Create simple template
    this.builder.addNode({
      id: 'start',
      position: { x: 100, y: 100 },
      content: 'Start Node',
      draggable: true
    });
    
    this.builder.addNode({
      id: 'process',
      position: { x: 400, y: 100 },
      content: 'Process Node',
      draggable: true
    });
    
    this.builder.addNode({
      id: 'end',
      position: { x: 700, y: 100 },
      content: 'End Node',
      draggable: true
    });
    
    this.builder.connectNodes('start', 'process');
    this.builder.connectNodes('process', 'end');
    
    this.builder.zoomToFit();
  }

  private loadFlowchartTemplate(): void {
    // Clear existing content
    this.builder.getAllNodes().forEach(node => this.builder.removeNode(node.getId()));
    this.builder.getAllPaths().forEach(path => this.builder.removePath(path.getId()));
    
    // Create flowchart template
    this.builder.addNode({
      id: 'decision',
      position: { x: 300, y: 100 },
      content: 'Decision?',
      draggable: true
    });
    
    this.builder.addNode({
      id: 'yes',
      position: { x: 150, y: 250 },
      content: 'Yes Path',
      draggable: true
    });
    
    this.builder.addNode({
      id: 'no',
      position: { x: 450, y: 250 },
      content: 'No Path',
      draggable: true
    });
    
    this.builder.addNode({
      id: 'merge',
      position: { x: 300, y: 400 },
      content: 'Merge',
      draggable: true
    });
    
    this.builder.connectNodes('decision', 'yes');
    this.builder.connectNodes('decision', 'no');
    this.builder.connectNodes('yes', 'merge');
    this.builder.connectNodes('no', 'merge');
    
    this.builder.zoomToFit();
  }
}