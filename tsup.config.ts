import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/helpers.ts', 'src/palette.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  target: 'es2022',
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  // tsup auto-externalizes `dependencies` and `peerDependencies` from
  // package.json. Listed explicitly: `react`/`react-dom` (so JSX runtime
  // imports are external) and `slack-web-api-client` (types-only consumer
  // moved to devDependencies — must stay external in the runtime bundle).
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    /^@radix-ui\//,
    /^@dnd-kit\//,
    /^@tiptap\//,
    'lucide-react',
    'slack-blocks-to-jsx',
    'slack-web-api-client'
  ]
});
