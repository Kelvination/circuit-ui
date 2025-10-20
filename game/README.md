# Bouncy Game

A mobile-first gravity-based slingshot game where you launch a ball at targets using a pull-down slingshot mechanic.

## How to Play

1. Pull down on the slingshot at the bottom of the screen
2. Release to launch the ball
3. Hit the colored targets at the top to score points
4. Clear all targets to get a new set

## Running the Game

### Option 1: Development Server (Local)

```bash
pnpm install
pnpm game
```

The game will be available at `http://localhost:3001/`

### Option 2: Standalone HTML File

Open `bouncy-game-standalone.html` directly in any web browser. This file contains all the code inline and doesn't require a build step.

### Option 3: Deploy to Hosting

Build the game:
```bash
pnpm build:game
```

The built files will be in `dist-game/` and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

### Option 4: Claude Artifact (Recommended for Mobile Access)

1. Open the `bouncy-game-standalone.html` file
2. Copy the entire contents
3. In Claude (claude.ai), paste the code and ask Claude to create an artifact
4. Click "Publish" on the artifact
5. Share the `claude.site` URL to access on your phone

## Game Features

- Mobile-first responsive design
- Touch and mouse controls
- Smooth physics simulation
- Colorful targets
- Score tracking
- Automatic target regeneration

## Technical Details

- Pure TypeScript/JavaScript (no frameworks)
- HTML5 Canvas for rendering
- Optimized for touch devices
- Works on all modern browsers

## Files

- `index.html` - Main game page (requires Vite dev server)
- `game.ts` - TypeScript game logic
- `style.css` - Game styling
- `bouncy-game-standalone.html` - Self-contained version (no build required)
