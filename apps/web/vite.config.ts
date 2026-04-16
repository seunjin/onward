import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@onward/contracts': path.resolve(
        __dirname,
        '../../packages/contracts/src/index.ts',
      ),
      '@onward/design-tokens': path.resolve(
        __dirname,
        '../../packages/design-tokens/src/index.ts',
      ),
      '@onward/domain': path.resolve(
        __dirname,
        '../../packages/domain/src/index.ts',
      ),
      '@onward/utils': path.resolve(
        __dirname,
        '../../packages/utils/src/index.ts',
      ),
    },
  },
  server: {
    port: 3000,
  },
});
