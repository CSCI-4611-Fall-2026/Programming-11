import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  optimizeDeps: {
    // GopherGfx's shader imports need to be transformed by the GLSL plugin.
    exclude: ['gophergfx']
  },
  server: {
    open: true
  },
  build: {
    rolldownOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  plugins: [glsl()]
});
