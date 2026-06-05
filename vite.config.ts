/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Project page deploy: https://<user>.github.io/chara-snap-enhanced/
// Override with VITE_BASE (e.g. "/" for a custom domain) at build time.
const base = process.env.VITE_BASE ?? "/chara-snap-enhanced/";

// GitHub Pages serves 404.html for unknown paths. Making it a copy of
// index.html lets deep links like /editor and /guide boot the SPA, which
// then routes client-side. Also drop a .nojekyll so Pages serves all files.
function ghPagesSpaFallback(): Plugin {
  return {
    name: "gh-pages-spa-fallback",
    apply: "build",
    closeBundle() {
      const out = resolve(__dirname, "dist");
      copyFileSync(resolve(out, "index.html"), resolve(out, "404.html"));
      writeFileSync(resolve(out, ".nojekyll"), "");
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), ghPagesSpaFallback()],
  build: {
    target: "es2020",
    sourcemap: false,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
