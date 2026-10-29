import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// PROTÓTIPO DESCARTÁVEL — não é o app. Fonte da verdade = Lovable.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5199,
    open: true,
    // Libera o acesso via túnel público (Cloudflare quick tunnel) para compartilhar o protótipo.
    // `.trycloudflare.com` cobre qualquer subdomínio gerado; localhost segue funcionando normal.
    allowedHosts: [".trycloudflare.com"],
  },
});
