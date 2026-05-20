import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      // Map bare `react-router` imports to `react-router-dom` ONLY for files
      // in src-design. Skipping node_modules avoids rewriting react-router-dom's
      // own internal import of react-router (which would create a resolve cycle).
      name: 'src-design-react-router-shim',
      enforce: 'pre',
      async resolveId(source, importer) {
        if (
          source === 'react-router' &&
          importer &&
          !importer.includes('node_modules')
        ) {
          const resolved = await this.resolve('react-router-dom', importer, {
            skipSelf: true,
          });
          if (resolved) return resolved;
        }
        return null;
      },
    },
  ],
  root: path.resolve(__dirname, 'src-design'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src-design'),
    },
  },
  server: {
    port: 3001,
    fs: {
      allow: [path.resolve(__dirname)],
    },
  },
});