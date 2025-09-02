// Main exports
export { CircuitUI } from './lib/CircuitUI.js';
export { Canvas } from './lib/Canvas.js';
export { Node } from './lib/Node.js';
export { Path } from './lib/Path.js';

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
  MinimapConfig
} from './lib/types.js';

// Import and auto-inject CSS
import './styles/circuit-ui.css';

// Re-import for default export
import { CircuitUI } from './lib/CircuitUI.js';

// Default export as the main CircuitUI class
export default CircuitUI;