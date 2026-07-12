import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_DEV_SERVER_HOST = "127.0.0.1";
const DEFAULT_DEV_SERVER_PORT = 5173;

const root = path.resolve(process.cwd(), ".");
const envPath = path.join(root, ".env");
const envExamplePath = path.join(root, ".env.example");
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
}

const configuredDevServerPort = Number.parseInt(
  process.env.VITE_DEV_SERVER_PORT ?? "",
  10,
);
const devServerPort = Number.isNaN(configuredDevServerPort)
  ? DEFAULT_DEV_SERVER_PORT
  : configuredDevServerPort;
const devServerHost =
  process.env.VITE_DEV_SERVER_HOST?.trim() || DEFAULT_DEV_SERVER_HOST;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-redux",
      "recharts",
      "@tanstack/react-virtual",
      "@tanstack/react-table",
    ],
  },
  server: {
    host: devServerHost,
    port: devServerPort,
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
