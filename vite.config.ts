import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vercel from "vite-plugin-vercel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), vercel()],
  server: {
    port: process.env.PORT as unknown as number,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "#": path.resolve(__dirname, "./convex"),
    },
  },
});
