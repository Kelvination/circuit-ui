interface Vector2D {
  x: number;
  y: number;
}

interface Ball {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  isLaunched: boolean;
  isActive: boolean;
}

interface Target {
  position: Vector2D;
  width: number;
  height: number;
  isActive: boolean;
  color: string;
}

interface SlingshotState {
  isDragging: boolean;
  dragPosition: Vector2D | null;
  anchorLeft: Vector2D;
  anchorRight: Vector2D;
}

class BouncyGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ball: Ball;
  private targets: Target[] = [];
  private slingshot: SlingshotState;
  private score: number = 0;
  private readonly GRAVITY = 0.5;
  private readonly MAX_DRAG_DISTANCE = 150;
  private readonly BALL_RADIUS = 15;
  private readonly SLINGSHOT_Y_OFFSET = 80;
  private animationId: number | null = null;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const context = this.canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not get canvas context');
    }

    this.ctx = context;
    this.setupCanvas();
    this.ball = this.createBall();
    this.slingshot = this.createSlingshot();
    this.createTargets();
    this.setupEventListeners();
    this.start();
  }

  private setupCanvas(): void {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      // Recreate slingshot anchors on resize
      if (this.slingshot) {
        this.slingshot.anchorLeft = {
          x: this.canvas.width / 2 - 60,
          y: this.canvas.height - this.SLINGSHOT_Y_OFFSET
        };
        this.slingshot.anchorRight = {
          x: this.canvas.width / 2 + 60,
          y: this.canvas.height - this.SLINGSHOT_Y_OFFSET
        };
      }

      // Reset ball position if not launched
      if (this.ball && !this.ball.isLaunched) {
        this.ball.position = {
          x: this.canvas.width / 2,
          y: this.canvas.height - this.SLINGSHOT_Y_OFFSET
        };
      }

      // Recreate targets on resize
      this.createTargets();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  private createBall(): Ball {
    return {
      position: {
        x: this.canvas.width / 2,
        y: this.canvas.height - this.SLINGSHOT_Y_OFFSET
      },
      velocity: { x: 0, y: 0 },
      radius: this.BALL_RADIUS,
      isLaunched: false,
      isActive: true
    };
  }

  private createSlingshot(): SlingshotState {
    return {
      isDragging: false,
      dragPosition: null,
      anchorLeft: {
        x: this.canvas.width / 2 - 60,
        y: this.canvas.height - this.SLINGSHOT_Y_OFFSET
      },
      anchorRight: {
        x: this.canvas.width / 2 + 60,
        y: this.canvas.height - this.SLINGSHOT_Y_OFFSET
      }
    };
  }

  private createTargets(): void {
    this.targets = [];
    const targetWidth = 60;
    const targetHeight = 60;
    const spacing = 20;
    const topMargin = 50;

    // Calculate how many targets fit on screen
    const availableWidth = this.canvas.width - spacing * 2;
    const targetCount = Math.floor(availableWidth / (targetWidth + spacing));
    const totalWidth = targetCount * targetWidth + (targetCount - 1) * spacing;
    const startX = (this.canvas.width - totalWidth) / 2;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];

    for (let i = 0; i < targetCount; i++) {
      this.targets.push({
        position: {
          x: startX + i * (targetWidth + spacing),
          y: topMargin
        },
        width: targetWidth,
        height: targetHeight,
        isActive: true,
        color: colors[i % colors.length]
      });
    }
  }

  private setupEventListeners(): void {
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

    // Mouse events for desktop
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private getTouchPosition(e: TouchEvent): Vector2D {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  private getMousePosition(e: MouseEvent): Vector2D {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private handleTouchStart(e: TouchEvent): void {
    if (!this.ball.isLaunched) {
      const pos = this.getTouchPosition(e);
      this.startDrag(pos);
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    if (this.slingshot.isDragging) {
      const pos = this.getTouchPosition(e);
      this.updateDrag(pos);
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (this.slingshot.isDragging) {
      e.preventDefault();
      this.endDrag();
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    if (!this.ball.isLaunched) {
      const pos = this.getMousePosition(e);
      this.startDrag(pos);
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.slingshot.isDragging) {
      const pos = this.getMousePosition(e);
      this.updateDrag(pos);
    }
  }

  private handleMouseUp(): void {
    if (this.slingshot.isDragging) {
      this.endDrag();
    }
  }

  private startDrag(pos: Vector2D): void {
    const slingshotCenter = {
      x: (this.slingshot.anchorLeft.x + this.slingshot.anchorRight.x) / 2,
      y: this.slingshot.anchorLeft.y
    };

    const distance = Math.sqrt(
      Math.pow(pos.x - slingshotCenter.x, 2) +
      Math.pow(pos.y - slingshotCenter.y, 2)
    );

    if (distance < 100) {
      this.slingshot.isDragging = true;
      this.slingshot.dragPosition = pos;
    }
  }

  private updateDrag(pos: Vector2D): void {
    const slingshotCenter = {
      x: (this.slingshot.anchorLeft.x + this.slingshot.anchorRight.x) / 2,
      y: this.slingshot.anchorLeft.y
    };

    const dx = pos.x - slingshotCenter.x;
    const dy = pos.y - slingshotCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.MAX_DRAG_DISTANCE) {
      const angle = Math.atan2(dy, dx);
      this.slingshot.dragPosition = {
        x: slingshotCenter.x + Math.cos(angle) * this.MAX_DRAG_DISTANCE,
        y: slingshotCenter.y + Math.sin(angle) * this.MAX_DRAG_DISTANCE
      };
    } else {
      this.slingshot.dragPosition = pos;
    }

    this.ball.position = { ...this.slingshot.dragPosition };
  }

  private endDrag(): void {
    if (this.slingshot.dragPosition) {
      const slingshotCenter = {
        x: (this.slingshot.anchorLeft.x + this.slingshot.anchorRight.x) / 2,
        y: this.slingshot.anchorLeft.y
      };

      const dx = slingshotCenter.x - this.slingshot.dragPosition.x;
      const dy = slingshotCenter.y - this.slingshot.dragPosition.y;

      const power = 0.15;
      this.ball.velocity = {
        x: dx * power,
        y: dy * power
      };

      this.ball.isLaunched = true;
    }

    this.slingshot.isDragging = false;
    this.slingshot.dragPosition = null;
  }

  private updatePhysics(): void {
    if (!this.ball.isLaunched || !this.ball.isActive) return;

    // Apply gravity
    this.ball.velocity.y += this.GRAVITY;

    // Update position
    this.ball.position.x += this.ball.velocity.x;
    this.ball.position.y += this.ball.velocity.y;

    // Bounce off walls
    if (this.ball.position.x - this.ball.radius < 0 ||
        this.ball.position.x + this.ball.radius > this.canvas.width) {
      this.ball.velocity.x *= -0.8;
      this.ball.position.x = Math.max(
        this.ball.radius,
        Math.min(this.canvas.width - this.ball.radius, this.ball.position.x)
      );
    }

    // Check if ball is off screen (bottom)
    if (this.ball.position.y - this.ball.radius > this.canvas.height) {
      this.resetBall();
    }

    // Check collision with targets
    this.checkTargetCollisions();
  }

  private checkTargetCollisions(): void {
    this.targets.forEach(target => {
      if (!target.isActive) return;

      const closestX = Math.max(
        target.position.x,
        Math.min(this.ball.position.x, target.position.x + target.width)
      );
      const closestY = Math.max(
        target.position.y,
        Math.min(this.ball.position.y, target.position.y + target.height)
      );

      const distanceX = this.ball.position.x - closestX;
      const distanceY = this.ball.position.y - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      if (distanceSquared < this.ball.radius * this.ball.radius) {
        target.isActive = false;
        this.score += 10;
        this.updateScore();

        // Add some bounce effect
        if (this.ball.position.y < target.position.y) {
          this.ball.velocity.y *= -0.7;
        } else {
          this.ball.velocity.y *= 0.7;
        }

        // Check if all targets are destroyed
        if (this.targets.every(t => !t.isActive)) {
          setTimeout(() => {
            this.createTargets();
          }, 1000);
        }
      }
    });
  }

  private resetBall(): void {
    this.ball = this.createBall();
  }

  private updateScore(): void {
    const scoreElement = document.getElementById('score-value');
    if (scoreElement) {
      scoreElement.textContent = this.score.toString();
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw targets
    this.targets.forEach(target => {
      if (target.isActive) {
        this.ctx.fillStyle = target.color;
        this.ctx.fillRect(
          target.position.x,
          target.position.y,
          target.width,
          target.height
        );

        // Add border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
          target.position.x,
          target.position.y,
          target.width,
          target.height
        );
      }
    });

    // Draw slingshot
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';

    if (this.slingshot.isDragging && this.slingshot.dragPosition) {
      // Draw stretched slingshot
      this.ctx.beginPath();
      this.ctx.moveTo(this.slingshot.anchorLeft.x, this.slingshot.anchorLeft.y);
      this.ctx.lineTo(this.slingshot.dragPosition.x, this.slingshot.dragPosition.y);
      this.ctx.lineTo(this.slingshot.anchorRight.x, this.slingshot.anchorRight.y);
      this.ctx.stroke();
    } else if (!this.ball.isLaunched) {
      // Draw relaxed slingshot
      this.ctx.beginPath();
      this.ctx.moveTo(this.slingshot.anchorLeft.x, this.slingshot.anchorLeft.y);
      this.ctx.lineTo(this.ball.position.x, this.ball.position.y);
      this.ctx.lineTo(this.slingshot.anchorRight.x, this.slingshot.anchorRight.y);
      this.ctx.stroke();
    }

    // Draw slingshot anchors
    this.ctx.fillStyle = '#666';
    this.ctx.beginPath();
    this.ctx.arc(this.slingshot.anchorLeft.x, this.slingshot.anchorLeft.y, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(this.slingshot.anchorRight.x, this.slingshot.anchorRight.y, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw ball
    if (this.ball.isActive) {
      const gradient = this.ctx.createRadialGradient(
        this.ball.position.x - 5,
        this.ball.position.y - 5,
        0,
        this.ball.position.x,
        this.ball.position.y,
        this.ball.radius
      );
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(1, '#00d4ff');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(
        this.ball.position.x,
        this.ball.position.y,
        this.ball.radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Add ball outline
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  private gameLoop(): void {
    this.updatePhysics();
    this.render();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  public start(): void {
    this.gameLoop();
  }

  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BouncyGame();
  });
} else {
  new BouncyGame();
}
