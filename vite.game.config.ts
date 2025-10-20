import { defineConfig } from 'vite';

export default defineConfig({
  root: 'game',
  server: {
    port: 3001,
    host: true,
    open: false
  },
  build: {
    outDir: '../dist-game',
    emptyOutDir: true
  }
});
