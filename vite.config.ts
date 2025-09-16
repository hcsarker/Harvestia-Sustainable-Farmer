import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          // heavy mapping libs
          map: [
            "maplibre-gl",
          ],
          // visualization libs
          viz: [
            "deck.gl",
            "@deck.gl/react",
            "@deck.gl/layers",
            "recharts",
          ],
          // radix/shadcn bundle
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
          ],
          // react-query separate
          query: ["@tanstack/react-query"],
        }
      }
    }
  }
}));
