import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Transpiled fallback bundle so older Safari (iPhone 6 / iOS 12)
    // can run the production build.
    legacy({ targets: ["defaults", "ios_saf >= 12"] }),
  ],
});
