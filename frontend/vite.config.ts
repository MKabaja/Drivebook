import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const alias = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [vue(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: { app: alias('./index.html'), preview: alias('./design-preview.html') }
    }
  },
  server: {
    port: 5174,
    strictPort: true
  },

  resolve: {
    alias: {
      '@': alias('./src')
    }
  }
});
