import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Resolve current file and directory paths for compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite configuration for the "client" app (main frontend)
export default defineConfig({
  // Enable React plugin for Vite
  plugins: [react() as PluginOption],

  // Define module path aliases for cleaner imports
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "@": path.resolve(__dirname, "src"),
    },
  },

  // Allow importing image assets (PNG files)
  assetsInclude: ["**/*.png"],

  // --- Development server configuration ---
  server: {
    port: 4173,   // Custom port for the client app (frontend)
    open: true,   // Automatically open the browser when dev server starts
  },

  // --- Optional build configuration ---
  // (You can adjust output paths or assets if needed for Netlify)
  build: {
    outDir: "dist", // Output directory for production build
  },
});
