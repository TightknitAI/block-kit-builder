import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  target: 'es2022',
  sourcemap: true,
  clean: false,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'slack-web-api-client']
});
