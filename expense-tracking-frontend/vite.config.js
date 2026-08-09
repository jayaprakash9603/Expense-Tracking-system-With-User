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
        "@platform": path.resolve(__dirname, "src/platform"),
        "@api": path.resolve(__dirname, "src/api"),
        "@features": path.resolve(__dirname, "src/features"),
        "@shared": path.resolve(__dirname, "src/shared"),
        "@ui": path.resolve(__dirname, "src/components/ui"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@redux": path.resolve(__dirname, "src/Redux"),
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
      // Prefer node for port/use-case unit tests; DOM suites can override with
      // @vitest-environment jsdom at the top of the file.
      environment: "node",
      setupFiles: ["./src/setupTests.js"],
      css: false,
    },
  };
});
