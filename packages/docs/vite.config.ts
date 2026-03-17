import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "ai-native-ui": path.resolve(__dirname, "../ai-ui/src/index.ts"),
    },
  },
});
