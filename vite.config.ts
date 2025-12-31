import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Importante para Capacitor/Android: usa caminhos relativos para carregar assets
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});