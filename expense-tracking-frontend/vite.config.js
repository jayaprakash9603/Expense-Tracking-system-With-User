import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite replacement for CRA. Keeps `process.env.REACT_APP_*` and
// `process.env.NODE_ENV` working via `define` so source files don't need edits.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["REACT_APP_", "VITE_"]);

  const processEnv = { NODE_ENV: mode };
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith("REACT_APP_") || key.startsWith("VITE_")) {
      processEnv[key] = value;
    }
  }

  return {
    plugins: [
      react({
        // Allow JSX in .js files (CRA behavior)
        include: "**/*.{js,jsx,ts,tsx}",
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      "process.env": JSON.stringify(processEnv),
      global: "globalThis",
    },
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.(js|jsx|ts|tsx)$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { ".js": "jsx" },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.js"],
      css: false,
    },
  };
});
