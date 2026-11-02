import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Java server (../server) serves /api on port 8080; proxy it during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
