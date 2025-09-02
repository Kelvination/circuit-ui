# Changelog

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