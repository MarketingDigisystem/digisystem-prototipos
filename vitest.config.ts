import { defineConfig } from "vitest/config";
import path from "node:path";

// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
// Testes de regras puras (src/hub/store/regras.ts): ambiente node, sem DOM.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
  },
});
