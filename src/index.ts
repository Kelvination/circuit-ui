// Main exports
export { CircuitUI } from './lib/CircuitUI.js';
export { Canvas } from './lib/Canvas.js';
export { Node } from './lib/Node.js';
export { Path } from './lib/Path.js';
export { UIBuilder } from './lib/UIBuilder.js';
export { BuilderUI } from './lib/BuilderUI.js';
export { CircuitUIReact } from './lib/CircuitUIReact.js';

// Type exports
export type {
  CanvasConfig,
  NodeConfig,
  PathConfig,
  NodeStyle,
  PathStyle,
  Position,
  Size,
  Bounds,
  Viewport,
  Waypoint,
  NodeEvent,
  CanvasEvent,
  NavigationConfig,
  Theme,
  MinimapConfig,
  CircuitUISchema,
  CircuitUIMetadata,
  UIBuilderConfig,
  NodeTypeDefinition,
  ComponentNodeConfig,
  NodeComponentProps,
  NodeRegistry,
  NavigationTarget,
  NodeActivation,
  LayoutRelationship,
  EnhancedNodeConfig,
  EnhancedCircuitUISchema
} from './lib/types.js';

// Import and auto-inject CSS
import './styles/circuit-ui.css';
import './styles/builder-ui.css';

// Re-import for default export
import { CircuitUI } from './lib/CircuitUI.js';

// Default export as the main CircuitUI class
export default CircuitUI;