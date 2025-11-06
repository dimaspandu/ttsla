import { defineConfig } from "vite";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "TTSLAServer",
      fileName: "server",
      formats: ["es"],
    },
    rollupOptions: {
      external: [],
    },
  },
  server: {
    port: 5174,
  },
});
