import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa perquè la web funcioni també des d'una subcarpeta (p. ex. GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: './',
});
