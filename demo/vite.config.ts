import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@tightknitai/block-kitchen': resolve(__dirname, '../src/index.ts')
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
