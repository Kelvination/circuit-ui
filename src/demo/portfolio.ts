import { CircuitUI } from '../index.js';

// Portfolio content data
const portfolioContent = {
  about: `
    <div style="padding: 20px; background: linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(15,15,35,0.9) 100%); border-radius: 8px; box-shadow: inset 0 0 20px rgba(0,255,136,0.2);">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 80px; height: 80px; border: 3px solid #00ff88; border-radius: 50%; margin: 0 auto 15px; background: radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%); display: flex; align-items: center; justify-content: center; font-size: 24px;">👨‍💻</div>
        <h2 style="color: #00ff88; margin-bottom: 15px; font-size: 22px; text-shadow: 0 0 10px rgba(0,255,136,0.5);">John Developer</h2>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid rgba(0,255,136,0.3); padding-bottom: 5px;">🎯 Specializations</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <span style="background: rgba(0,255,136,0.2); color: #00ff88; padding: 4px 8px; border-radius: 12px; font-size: 11px; border: 1px solid rgba(0,255,136,0.4);">Frontend</span>
          <span style="background: rgba(0,255,136,0.2); color: #00ff88; padding: 4px 8px; border-radius: 12px; font-size: 11px; border: 1px solid rgba(0,255,136,0.4);">TypeScript</span>
          <span style="background: rgba(0,255,136,0.2); color: #00ff88; padding: 4px 8px; border-radius: 12px; font-size: 11px; border: 1px solid rgba(0,255,136,0.4);">React</span>
          <span style="background: rgba(0,255,136,0.2); color: #00ff88; padding: 4px 8px; border-radius: 12px; font-size: 11px; border: 1px solid rgba(0,255,136,0.4);">WebGL</span>
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 8px; border-bottom: 1px solid rgba(0,255,136,0.3); padding-bottom: 5px;">⚡ Current Focus</h3>
        <p style="color: #ffffff; font-size: 13px; line-height: 1.5; opacity: 0.9;">
          Building interactive visualization tools and exploring the intersection of design and technology. Currently working on CircuitUI - a library for creating infinite canvas experiences.
        </p>
      </div>
      
      <div style="display: flex; justify-content: space-around; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,255,136,0.3);">
        <div style="text-align: center;">
          <div style="color: #00ff88; font-weight: bold; font-size: 16px;">5+</div>
          <div style="color: #ffffff; font-size: 11px; opacity: 0.7;">Years</div>
        </div>
        <div style="text-align: center;">
          <div style="color: #00ff88; font-weight: bold; font-size: 16px;">50+</div>
          <div style="color: #ffffff; font-size: 11px; opacity: 0.7;">Projects</div>
        </div>
        <div style="text-align: center;">
          <div style="color: #00ff88; font-weight: bold; font-size: 16px;">∞</div>
          <div style="color: #ffffff; font-size: 11px; opacity: 0.7;">Ideas</div>
        </div>
      </div>
    </div>
  `,
  
  work: `
    <div>
      <h3 style="color: #00ff88; margin-bottom: 12px; font-size: 16px;">Work Experience</h3>
      <div style="margin-bottom: 10px;">
        <strong style="color: #ffffff;">Senior Developer</strong><br/>
        <span style="opacity: 0.8; font-size: 12px;">Tech Corp • 2021-Present</span>
      </div>
      <div style="margin-bottom: 10px;">
        <strong style="color: #ffffff;">Full Stack Developer</strong><br/>
        <span style="opacity: 0.8; font-size: 12px;">StartupXYZ • 2019-2021</span>
      </div>
      <p style="font-size: 11px; opacity: 0.7;">
        Click to expand details...
      </p>
    </div>
  `,
  
  projects: `
    <div>
      <h3 style="color: #00ff88; margin-bottom: 12px; font-size: 16px;">Personal Projects</h3>
      <div style="margin-bottom: 8px;">
        <strong style="color: #ffffff; font-size: 14px;">CircuitUI</strong><br/>
        <span style="opacity: 0.8; font-size: 11px;">Interactive canvas library</span>
      </div>
      <div style="margin-bottom: 8px;">
        <strong style="color: #ffffff; font-size: 14px;">Neural Network Visualizer</strong><br/>
        <span style="opacity: 0.8; font-size: 11px;">ML visualization tool</span>
      </div>
      <div>
        <strong style="color: #ffffff; font-size: 14px;">Quantum Simulator</strong><br/>
        <span style="opacity: 0.8; font-size: 11px;">WebGL quantum state viz</span>
      </div>
    </div>
  `,
  
  contact: `
    <div style="text-align: center;">
      <h3 style="color: #00ff88; margin-bottom: 12px; font-size: 16px;">Contact</h3>
      <div style="margin-bottom: 8px;">
        <strong style="color: #ffffff;">📧 Email</strong><br/>
        <span style="opacity: 0.8; font-size: 12px;">hello@circuitui.dev</span>
      </div>
      <div style="margin-bottom: 8px;">
        <strong style="color: #ffffff;">🐙 GitHub</strong><br/>
        <span style="opacity: 0.8; font-size: 12px;">github.com/circuitui</span>
      </div>
      <div>
        <strong style="color: #ffffff;">💼 LinkedIn</strong><br/>
        <span style="opacity: 0.8; font-size: 12px;">linkedin.com/in/circuitui</span>
      </div>
    </div>
  `,
  
  resume: `
    <div style="text-align: center;">
      <h3 style="color: #00ff88; margin-bottom: 12px; font-size: 16px;">Resume</h3>
      <p style="margin-bottom: 15px; line-height: 1.4;">
        Download my complete<br/>
        professional experience<br/>
        and technical skills.
      </p>
      <button style="
        background: rgba(0, 255, 136, 0.2);
        border: 2px solid #00ff88;
        color: #00ff88;
        padding: 8px 16px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        font-size: 12px;
      ">
        📄 Download PDF
      </button>
    </div>
  `
};

class PortfolioDemo {
  private circuit: CircuitUI;
  private currentNode: string | null = null;
  
  constructor() {
    this.circuit = CircuitUI.create('#canvas-container', {
      dimensions: { width: 3000, height: 2000 },
      theme: 'dark',
      grid: { enabled: true, size: 20 },
      zoom: { min: 0.05, max: 10, step: 0.1 },
      pan: { momentum: true, edgeResistance: true }
    });
    
    this.init();
  }
  
  private async init(): Promise<void> {
    try {
      // Create portfolio nodes
      this.createNodes();
      
      // Create circuit paths between nodes
      this.createPaths();
      
      // Setup navigation and controls
      this.setupNavigation();
      this.setupControls();
      this.setupSettings();
      
      // Initial animation - zoom to about node and focus it
      const aboutNode = this.circuit.getNode('about');
      if (aboutNode) {
        aboutNode.setFocused(true);
      }
      this.currentNode = 'about';
      
      await this.circuit.navigateToNode('about', { 
        duration: 1500,
        fitToView: true,
        padding: 100 
      });
      
      // Hide loading screen
      this.hideLoading();
      
      // Show welcome message
      this.showWelcomeMessage();
      
    } catch (error) {
      console.error('Failed to initialize CircuitUI demo:', error);
      document.getElementById('loading')!.innerHTML = 'Error loading demo';
    }
  }
  
  private createNodes(): void {
    // About Me - Center node (larger and more detailed)
    const aboutNode = this.circuit.addNode({
      id: 'about',
      position: { x: 1300, y: 800 },
      size: { width: 400, height: 350 },
      content: portfolioContent.about,
      className: 'center-node'
    });
    
    // Work Experience - Top left
    const workNode = this.circuit.addNode({
      id: 'work',
      position: { x: 500, y: 300 },
      size: { width: 350, height: 280 },
      content: portfolioContent.work
    });
    
    // Personal Projects - Top right  
    const projectsNode = this.circuit.addNode({
      id: 'projects',
      position: { x: 2000, y: 300 },
      size: { width: 350, height: 280 },
      content: portfolioContent.projects
    });
    
    // Contact - Bottom right
    const contactNode = this.circuit.addNode({
      id: 'contact',
      position: { x: 1900, y: 1400 },
      size: { width: 320, height: 250 },
      content: portfolioContent.contact
    });
    
    // Resume - Bottom left
    const resumeNode = this.circuit.addNode({
      id: 'resume',
      position: { x: 600, y: 1400 },
      size: { width: 320, height: 250 },
      content: portfolioContent.resume
    });
    
    // Add click handlers
    this.setupNodeInteractions([aboutNode, workNode, projectsNode, contactNode, resumeNode]);
  }
  
  private createPaths(): void {
    // Connect all nodes to the center (About Me) with circuit-board style paths including 45° diagonals
    
    // About -> Work (diagonal then horizontal)
    this.circuit.addPath({
      waypoints: [
        { x: 1300, y: 975 },   // Start from about node (left side)
        { x: 1100, y: 775 },   // 45° diagonal up-left 
        { x: 900, y: 775 },    // Go left horizontally
        { x: 900, y: 580 },    // Go up vertically
        { x: 675, y: 580 }     // Connect to work node
      ],
      width: 4,
      animated: true
    });
    
    // About -> Projects (diagonal then horizontal)
    this.circuit.addPath({
      waypoints: [
        { x: 1700, y: 975 },   // Start from about node (right side)
        { x: 1900, y: 775 },   // 45° diagonal up-right
        { x: 2100, y: 775 },   // Go right horizontally  
        { x: 2100, y: 580 },   // Go up vertically
        { x: 2175, y: 580 }    // Connect to projects node
      ],
      width: 4,
      animated: true
    });
    
    // About -> Contact (diagonal then vertical)
    this.circuit.addPath({
      waypoints: [
        { x: 1700, y: 1150 },  // Start from about node (right side, lower)
        { x: 1850, y: 1300 },  // 45° diagonal down-right
        { x: 2060, y: 1300 },  // Go right horizontally
        { x: 2060, y: 1525 }   // Connect to contact node
      ],
      width: 4,
      animated: true
    });
    
    // About -> Resume (diagonal path)
    this.circuit.addPath({
      waypoints: [
        { x: 1300, y: 1150 },  // Start from about node (left side, lower)
        { x: 1150, y: 1300 },  // 45° diagonal down-left
        { x: 950, y: 1300 },   // Go left horizontally
        { x: 950, y: 1525 },   // Go down vertically  
        { x: 760, y: 1525 }    // Connect to resume node
      ],
      width: 4,
      animated: true
    });
    
    // Add interconnecting paths with diagonals between outer nodes
    this.circuit.addPath({
      waypoints: [
        { x: 675, y: 440 },    // From work node
        { x: 850, y: 440 },    // Go right
        { x: 1000, y: 590 },   // 45° diagonal down-right
        { x: 1850, y: 590 },   // Long horizontal
        { x: 2000, y: 440 },   // 45° diagonal up-right
        { x: 2175, y: 440 }    // To projects node
      ],
      width: 2,
      color: '#00aa66',
      animated: true
    });
  }
  
  private setupNodeInteractions(nodes: any[]): void {
    nodes.forEach(node => {
      node.on('click', () => {
        this.handleNodeClick(node.getId());
      });
      
      node.on('hover', () => {
        this.highlightConnectedPaths(node.getId());
      });
    });
  }
  
  private handleNodeClick(nodeId: string): void {
    // Unfocus previous node
    if (this.currentNode && this.currentNode !== nodeId) {
      const prevNode = this.circuit.getNode(this.currentNode);
      if (prevNode) {
        prevNode.setFocused(false);
      }
    }
    
    // Focus the clicked node
    const clickedNode = this.circuit.getNode(nodeId);
    if (clickedNode) {
      clickedNode.setFocused(true);
    }
    
    // Navigate to the clicked node
    this.circuit.navigateToNode(nodeId, {
      duration: 1200,
      fitToView: true,
      padding: 80
    });
    
    this.currentNode = nodeId;
    this.showNodeInfo(nodeId);
  }
  
  private highlightConnectedPaths(_nodeId: string): void {
    // This would highlight paths connected to the hovered node
    // Implementation depends on tracking path-node relationships
  }
  
  private setupNavigation(): void {
    const menuToggle = document.getElementById('menu-toggle')!;
    const navContent = document.getElementById('nav-content')!;
    const navItems = document.querySelectorAll('.nav-item');
    
    menuToggle.addEventListener('click', () => {
      navContent.classList.toggle('active');
    });
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = (item as HTMLElement).dataset.target!;
        
        // Unfocus previous node
        if (this.currentNode && this.currentNode !== target) {
          const prevNode = this.circuit.getNode(this.currentNode);
          if (prevNode) {
            prevNode.setFocused(false);
          }
        }
        
        // Focus the target node
        const targetNode = this.circuit.getNode(target);
        if (targetNode) {
          targetNode.setFocused(true);
        }
        
        this.circuit.navigateToNode(target, {
          duration: 1000,
          fitToView: true,
          padding: 60
        });
        navContent.classList.remove('active');
        this.currentNode = target;
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!(e.target as Element).closest('#nav-menu')) {
        navContent.classList.remove('active');
      }
    });
  }
  
  private setupControls(): void {
    const zoomIn = document.getElementById('zoom-in')!;
    const zoomOut = document.getElementById('zoom-out')!;
    const zoomFit = document.getElementById('zoom-fit')!;
    const centerView = document.getElementById('center-view')!;
    
    zoomIn.addEventListener('click', () => {
      const viewport = this.circuit.getCanvas().getViewport();
      this.circuit.zoomTo(viewport.zoom * 1.3, 300);
    });
    
    zoomOut.addEventListener('click', () => {
      const viewport = this.circuit.getCanvas().getViewport();
      this.circuit.zoomTo(viewport.zoom * 0.7, 300);
    });
    
    zoomFit.addEventListener('click', () => {
      // Unfocus current node when showing all
      if (this.currentNode) {
        const currentNode = this.circuit.getNode(this.currentNode);
        if (currentNode) {
          currentNode.setFocused(false);
        }
      }
      
      this.circuit.zoomToFit(800);
      this.currentNode = null;
    });
    
    centerView.addEventListener('click', () => {
      // Navigate to the about node as "home"
      
      // Unfocus previous node
      if (this.currentNode && this.currentNode !== 'about') {
        const prevNode = this.circuit.getNode(this.currentNode);
        if (prevNode) {
          prevNode.setFocused(false);
        }
      }
      
      // Focus the about node
      const aboutNode = this.circuit.getNode('about');
      if (aboutNode) {
        aboutNode.setFocused(true);
      }
      
      this.circuit.navigateToNode('about', {
        duration: 800,
        fitToView: true,
        padding: 100
      });
      this.currentNode = 'about';
    });
  }
  
  private showNodeInfo(nodeId: string): void {
    const infoPanel = document.getElementById('info-panel')!;
    const nodeNames: { [key: string]: string } = {
      about: 'About Me',
      work: 'Work Experience',  
      projects: 'Personal Projects',
      contact: 'Contact Information',
      resume: 'Resume & CV'
    };
    
    infoPanel.innerHTML = `
      <h4>Current: ${nodeNames[nodeId]}</h4>
      <p><strong>Actions:</strong></p>
      <p>• Click node again to zoom out</p>
      <p>• Use controls to navigate</p>
      <p>• Try the navigation menu</p>
    `;
  }
  
  private hideLoading(): void {
    const loading = document.getElementById('loading')!;
    loading.style.opacity = '0';
    setTimeout(() => {
      loading.style.display = 'none';
    }, 300);
  }
  
  private showWelcomeMessage(): void {
    // Could add a welcome toast or animation here
    console.log('🎉 CircuitUI Portfolio Demo loaded successfully!');
    console.log('Try clicking nodes, dragging to pan, and using the controls!');
  }

  private setupSettings(): void {
    const settingsToggle = document.getElementById('settings-toggle')!;
    const settingsPanel = document.getElementById('settings-panel')!;
    const settingsClose = document.getElementById('settings-close')!;
    const zoomSensitivity = document.getElementById('zoom-sensitivity') as HTMLInputElement;
    const zoomValue = document.getElementById('zoom-value')!;
    const panMomentum = document.getElementById('pan-momentum') as HTMLInputElement;
    
    // Toggle settings panel
    settingsToggle.addEventListener('click', () => {
      settingsPanel.classList.toggle('active');
    });
    
    // Close settings panel
    settingsClose.addEventListener('click', () => {
      settingsPanel.classList.remove('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target || (!settingsPanel.contains(e.target as Element) && e.target !== settingsToggle)) {
        settingsPanel.classList.remove('active');
      }
    });
    
    // Zoom sensitivity slider
    zoomSensitivity.addEventListener('input', () => {
      const value = parseFloat(zoomSensitivity.value);
      zoomValue.textContent = value.toFixed(2);
      this.circuit.getCanvas().setZoomSensitivity(value);
    });
    
    // Initialize zoom sensitivity
    const initialSensitivity = this.circuit.getCanvas().getZoomSensitivity();
    zoomSensitivity.value = initialSensitivity.toString();
    zoomValue.textContent = initialSensitivity.toFixed(2);
    
    // Pan momentum toggle (placeholder for future implementation)
    panMomentum.addEventListener('change', () => {
      console.log('Pan momentum:', panMomentum.checked);
      // TODO: Implement momentum toggle in Canvas class
    });
  }
}

// Initialize the demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioDemo();
});

// Add some developer-friendly console messages
console.log(`
 ______ _  ______  ______ _    _ _____ _______  _    _ _____ 
|      | |/      |/      | |  | |     |__   __|| |  | |     |
|      | |  /~~~~/|  /~~~| |  | |  |  | |  |   | |  | |  |  |
|      | | |  |   |  |   | |__| |  |  | |  |   | |__| |  |  |
|______| |_|  |   |__|    |______|__|  | |__|   |______|__|  |

Welcome to CircuitUI - Interactive Canvas Library
🚀 Version 0.1.0 | Built with TypeScript + SVG
`);