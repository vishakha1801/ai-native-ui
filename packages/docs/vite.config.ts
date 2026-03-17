import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/ai-native-ui/",
  plugins: [react()],
  resolve: {
    alias: {
      "ai-native-ui": fileURLToPath(new URL("../ai-ui/src/index.ts", import.meta.url)),
    },
  },
});
