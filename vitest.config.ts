import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/**/*.test.{ts,tsx}'],
    environment: 'node',
    typecheck: {
      enabled: false,
    },
  },
  resolve: {
    alias: {
      '@chalak/types': path.resolve(import.meta.dirname, './packages/types/src/index.ts'),
      '@chalak/functions': path.resolve(import.meta.dirname, './packages/functions/src'),
      '@chalak/web': path.resolve(import.meta.dirname, './packages/web/src'),
      '@': path.resolve(import.meta.dirname, './packages/web/src'),
    },
  },
});
