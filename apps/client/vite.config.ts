import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        rewrite: (path) => path.replace(/^\/api/, ""),
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        rewrite: (path) => path.replace(/^\/ws/, ""),
        ws: true,
      },
    },
  },
});
