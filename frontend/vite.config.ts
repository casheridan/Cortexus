import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// Remove the line below - it's no longer needed
// import tailwindcss from '@tailwindcss/vite' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Remove tailwindcss() from this array
  ],
})