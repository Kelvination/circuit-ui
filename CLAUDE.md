# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `pnpm dev` - Starts Vite dev server on port 3000 with host enabled
- **Build**: `pnpm build` - Compiles TypeScript and builds the library using Vite
- **Type checking**: `pnpm typecheck` - Runs TypeScript compiler without emitting files
- **Preview**: `pnpm preview` - Preview the built library

## Architecture Overview

This is a TypeScript library called "circuit-ui" that provides an interactive circuit board-style canvas for portfolio displays. The library is built with Vite and uses vanilla TypeScript (no React or other frameworks).

### Core Components Structure

- **CircuitUI** (src/lib/CircuitUI.ts) - Main orchestrator class that manages the entire system
- **Canvas** (src/lib/Canvas.ts) - Handles the SVG canvas, viewport, zoom/pan operations, and user interactions
- **Node** (src/lib/Node.ts) - Individual interactive elements on the canvas with positioning, styling, and events
- **Path** (src/lib/Path.ts) - Circuit board-style connections between nodes with waypoint system
- **types.ts** - Comprehensive type definitions for all components

### Key Features

- SVG-based rendering with zoom/pan/navigation controls
- Circuit board aesthetic with nodes connected by paths
- Strict TypeScript with exact optional property types
- Library build output to dist/ with proper ES module exports
- Demo portfolio application showing practical usage

### Project Structure

- `src/lib/` - Core library components
- `src/demo/` - Demo portfolio application (portfolio.ts)
- `src/styles/` - CSS styling for the library
- `dist/` - Built library output
- Entry point: `src/index.ts` with both named and default exports

### TypeScript Configuration

The project uses strict TypeScript with:
- `exactOptionalPropertyTypes: true` - Be precise with optional properties
- `noUnusedLocals: true` and `noUnusedParameters: true` - Clean unused code
- Output to `dist/` with declaration files for library consumers
- Excludes test files (though no tests currently exist)

### Build System

Vite is configured as a library build:
- Entry: `src/index.ts`
- Library name: `CircuitUI`
- Output: `circuit-ui.{format}.js`
- Auto-injects CSS styles

### Important Notes

- Don't put anything related to Claude Code or anything like that in commits or PRs, make all comments and commit messages sound just like a normal developer is working on them
- After each task, add a submission to the CHANGELOG.md
- Use pnpm instead of npm
- Clean up unused code - if replacing code, remove the old code
- Never use emojis in UIs
- Do not type cast to `as unknown as X` unless there is absolutely no alternative