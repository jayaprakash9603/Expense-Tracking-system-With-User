import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-redux", "recharts"],
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.js",
    globals: true,
    include: ["src/**/*.test.{js,jsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
