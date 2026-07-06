import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 80,
    strictPort: true,
    hmr: {
      overlay: false
    }
  }
});
