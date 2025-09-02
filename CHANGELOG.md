# Changelog

## [2.0.0] - 2025-09-02

### Major Breaking Changes
- **Component-Based Architecture** - Nodes now support React component types with full props and state management
- **Enhanced Type System** - Added `type` and `data` fields to `NodeConfig` for component-based nodes
- **Rebuilt Export Format** - JSON schemas now include component types and structured data

### New Features
- **CircuitUIReact** - New React integration class for component-based circuits with props and navigation
- **Node Type Registry** - Define reusable node types with default sizes, data, and constraints
- **Inter-Node Navigation** - Components can navigate to other nodes with `circuit.navigateToNode()`
- **Node Activation System** - Track active nodes with visual focus states and navigation history
- **Event System** - Full event emission and listening for navigation, selection, and data changes
- **Builder Node Types** - Visual builder now supports multiple node types with preview and selection

### Enhanced Builder Features
- **Multi-Type Node Creation** - Choose from registered node types when adding nodes
- **Type-Specific Properties** - Properties panel adapts to node type and data structure
- **Component Preview** - Visual representation of React components in builder
- **Enhanced Export** - Export includes component types, data, and relationship metadata

### React Integration
- **NodeComponent Interface** - Standard interface for React components with circuit navigation
- **Automatic Rendering** - Components render into SVG foreignObject with full HTML/CSS support
- **Props Management** - Node data becomes component props with type safety
- **Navigation Context** - Components receive circuit instance for inter-node navigation

### Development Experience
- **Proper Package Structure** - Separated builder (`pnpm builder`) from demo (`pnpm demo`)
- **Type Safety** - Complete TypeScript support for all new features
- **Event-Driven Architecture** - Components can listen to circuit events and state changes

### Usage Examples
```typescript
// Define component node
const ProjectCard: NodeComponent = ({ nodeId, data, circuit }) => (
  <div onClick={() => circuit.navigateToNode(data.detailsNodeId)}>
    <h3>{data.title}</h3>
  </div>
);

// Create circuit with components
const circuit = new CircuitUIReact({
  container: '#app',
  nodeRegistry: { 'project-card': ProjectCard },
  onNodeRender: (node, element, circuit) => {
    ReactDOM.render(<ProjectCard {...circuit.createNodeProps(node.getId())} />, element);
  }
});

// Use builder with types
const builder = new UIBuilder(canvasConfig, {
  nodeTypes: [
    {
      type: 'project-card',
      label: 'Project Card',
      defaultSize: { width: 200, height: 150 },
      defaultData: { title: 'New Project' }
    }
  ]
});
```

## [1.1.0] - 2025-09-02

### Added
- **UI Builder** - Complete visual circuit designer with drag-and-drop interface
- **Export/Import System** - Save and load circuit designs as JSON schemas
- **Interactive Toolbar** - Mode switching (Select, Add Node, Add Path, Delete) with keyboard shortcuts
- **Properties Panel** - Real-time editing of node content, position, size, and path properties
- **Layers Panel** - Navigate and manage all nodes and paths in the circuit
- **Templates System** - Pre-built circuit templates (Simple Layout, Flowchart)
- **Undo/Redo System** - Full history management with Ctrl+Z/Y support
- **Copy/Paste Operations** - Duplicate nodes and maintain relationships
- **JSON Schema Export** - Structured export format with metadata and versioning

### New Classes
- **UIBuilder** - Extended CircuitUI class with editing capabilities and selection management
- **BuilderUI** - Complete UI interface with panels, toolbar, and interactive controls
- **CircuitUISchema** - Type-safe schema format for export/import operations

### Builder Features
- **Multi-mode Operation** - Select (1), Add Node (2), Add Path (3), Delete (4) modes
- **Keyboard Shortcuts** - Full shortcut support for common operations
- **Visual Selection** - Node focusing and path highlighting for selected items
- **Real-time Updates** - Properties panel updates as you select different items
- **Grid Snapping** - Precise placement with visual grid reference
- **Path Creation** - Click two nodes to automatically create circuit board paths
- **Template Loading** - Quick-start templates for common circuit patterns
- **File Operations** - Export to JSON file or copy to clipboard, import from file or text

### Technical Implementation
- **Type-safe Schema** - Complete TypeScript interfaces for all export/import operations
- **Event System** - Custom events for mode changes and selection updates
- **State Management** - Comprehensive builder state with selection tracking
- **History Management** - Efficient undo/redo stack with configurable depth
- **Responsive Design** - Mobile-friendly builder interface with collapsible panels

### Usage Examples
```typescript
// Create builder
const builder = new UIBuilder(canvasConfig);
const builderUI = new BuilderUI(builder, container);

// Export circuit
const json = builder.exportToJSON();

// Import circuit  
const circuit = CircuitUI.importFromJSON(json, '#canvas');
```

## [1.0.2] - 2025-09-02

### Enhanced
- Updated CLAUDE.md with comprehensive codebase documentation including architecture overview, development commands, and TypeScript configuration details

## [1.0.1] - 2025-09-02

### Fixed
- Fixed zoomToFit calculation to properly center all nodes instead of zooming to bottom right
- Fixed home button (zoom-fit icon) behavior to correctly show all content centered
- Fixed dot icon (center-view button) to navigate to About node as home instead of centering on origin
- Fixed zoomTo method to maintain the same center point when zooming (prevents drift to bottom-right)
- Fixed double-click on same node behavior to zoom out while staying centered on that node
- Fixed node click behavior to zoom-to-fit individual nodes perfectly with proper padding
- Fixed drag vs click detection - can now drag/pan from nodes after movement threshold
- Implemented focused node system - nodes show as plain text until hovered/focused
- Cleaned up unused TypeScript functions and imports

### Added
- Debug overlay with crosshair and coordinate display to visualize viewport center
- Press 'D' key to toggle debug mode and see world coordinates at screen center
- Console logging for zoom operations to track viewport transformations
- Focused node system with visual state management
- Hover effects only show for unfocused nodes (nodes appear as plain text by default)

### Technical Changes
- Updated zoomToFit method in CircuitUI.ts to account for zoom level when calculating target position
- Fixed zoomTo method to calculate new viewport position that maintains the same world point at screen center
- Enhanced navigateToNode to calculate optimal zoom level for individual node fit-to-view
- Implemented drag threshold system in Canvas to distinguish clicks from drags
- Added focused node state system with visual styling and click handler management
- Modified centerView button to use navigateToNode instead of canvas.centerView for better UX
- Added debug overlay system with crosshair marker and real-time coordinate display
- Removed unused applyEdgeResistance, getViewportCenter functions and CIRCUIT_ANGLES imports

## [1.0.0] - 2025-09-02

### Added
- Interactive portfolio canvas with zoomable/pannable functionality
- Five portfolio nodes: About Me (center), Work Experience, Personal Projects, Contact, Resume
- Circuit board-style animated paths connecting center node to all other nodes
- Dark gradient background with professional aesthetic
- Navigation menu overlay with smooth transitions to each node
- Zoom controls (zoom in, zoom out, reset view)
- Touch/mobile support for panning and interaction
- Responsive design for different screen sizes
- Node hover effects with scaling and glow animations
- Click animations for interactive feedback

### Technical Implementation
- Pure HTML, CSS, and JavaScript (no frameworks)
- SVG-based rendering for crisp graphics and scalability
- CSS animations for smooth transitions and effects
- Transform matrix for zoom/pan functionality
- Event handling for mouse, touch, and keyboard interactions

### Features
- Mouse drag to pan around the canvas
- Mouse wheel to zoom in/out
- Click nodes for interaction (currently shows alerts - ready for content)
- Navigation menu to quickly jump to any section
- Smooth animated transitions between nodes
- Circuit board aesthetic with pulsing glow effects
- Mobile-friendly touch controls