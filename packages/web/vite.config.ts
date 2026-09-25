import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@chalak/types': path.resolve(import.meta.dirname, '../../types/src/index.ts'),
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  css: {
    modules: {
      naming: '[name]__[local]__[hash:base64:5]',
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
