import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
    dedupe: ['react', 'react-dom'],
  },
  root: import.meta.dirname,
  build: {
    outDir: `${import.meta.dirname}/dist/public`,
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: Number(process.env.PORT) || 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
