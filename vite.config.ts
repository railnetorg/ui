import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'preview',
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@preview': new URL('./preview', import.meta.url).pathname,
      '@': new URL('./registry', import.meta.url).pathname,
    },
  },
});
