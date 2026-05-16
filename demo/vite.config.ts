import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@tightknitai/block-kitchen': resolve(__dirname, '../src/index.ts'),
      // Force a single copy of React. The library is aliased to source so
      // it resolves React from wherever Vite picks first; without these
      // aliases the root install and `demo/node_modules/react` both end
      // up loaded, tripping React's "Invalid hook call" check.
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom')
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: !process.env.PORT
  }
});
