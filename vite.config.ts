import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'CircuitUI',
      fileName: (format) => `circuit-ui.${format}.js`
    },
    rollupOptions: {
      output: {
        globals: {}
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});