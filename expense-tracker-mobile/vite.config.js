import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = path.resolve(process.cwd(), ".");
const envPath = path.join(root, ".env");
const envExamplePath = path.join(root, ".env.example");
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
}

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
