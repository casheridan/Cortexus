import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/postcss' // Import the plugin
import autoprefixer from 'autoprefixer'       // Import autoprefixer

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  css: { // Add this css object
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
})