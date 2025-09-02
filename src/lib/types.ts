// Core geometric types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Node types
export interface NodeConfig {
  id: string;
  position: Position;
  size?: Size;
  content?: string;
  className?: string;
  draggable?: boolean;
  zIndex?: number;
}

export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  fontSize?: number;
  textColor?: string;
  glow?: boolean;
  glowColor?: string;
}

// Path types - enforcing circuit board angles
export type PathDirection = 'horizontal' | 'vertical' | 'diagonal-ne' | 'diagonal-nw' | 'diagonal-se' | 'diagonal-sw';

export interface Waypoint {
  x: number;
  y: number;
  direction?: PathDirection;
}

export interface PathConfig {
  id?: string;
  waypoints: Waypoint[];
  width?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}

export interface PathStyle {
  color: string;
  width: number;
  opacity: number;
  animated: boolean;
  dashArray?: string;
  glowColor?: string;
}

// Canvas configuration
export interface CanvasConfig {
  container: string | HTMLElement;
  dimensions?: Size;
  theme?: 'dark' | 'light' | 'matrix';
  grid?: {
    enabled: boolean;
    size: number;
    opacity?: number;
  };
  zoom?: {
    min: number;
    max: number;
    step: number;
  };
  pan?: {
    momentum: boolean;
    edgeResistance: boolean;
  };
}

// Viewport and camera
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CameraState {
  position: Position;
  zoom: number;
  bounds: Bounds;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  onComplete?: () => void;
}

export interface NavigationConfig extends AnimationConfig {
  zoomOut?: boolean;
  fitToView?: boolean;
  padding?: number;
}

// Event types
export type NodeEventType = 'click' | 'hover' | 'leave' | 'drag';
export type CanvasEventType = 'pan' | 'zoom' | 'click';

export interface NodeEvent {
  type: NodeEventType;
  node: any; // Will be Node class instance
  position: Position;
  originalEvent: Event;
}

export interface CanvasEvent {
  type: CanvasEventType;
  position: Position;
  viewport: Viewport;
  originalEvent: Event;
}

// Minimap types
export interface MinimapConfig {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: Size;
  opacity?: number;
  collapsible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export interface MinimapStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  nodeColor: string;
  pathColor: string;
  viewportColor: string;
}

// Theme definitions
export interface Theme {
  name: string;
  canvas: {
    backgroundColor: string;
    gridColor?: string;
  };
  node: NodeStyle;
  path: PathStyle;
  minimap: MinimapStyle;
}

// Event handler types
export type NodeEventHandler = (event: NodeEvent) => void;
export type CanvasEventHandler = (event: CanvasEvent) => void;

// Circuit board path constraints
export const CIRCUIT_ANGLES = {
  HORIZONTAL: 0,
  VERTICAL: 90,
  DIAGONAL_NE: 45,
  DIAGONAL_NW: 135,
  DIAGONAL_SE: -45,
  DIAGONAL_SW: -135
} as const;

export type CircuitAngle = typeof CIRCUIT_ANGLES[keyof typeof CIRCUIT_ANGLES];