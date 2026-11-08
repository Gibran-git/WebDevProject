// AI-assisted - see AI-USAGE.md #1.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // dev proxy for the met api (see src/api/met.js)
            // /api/met/public/collection/... -> https://collectionapi.metmuseum.org/public/collection/...
            "/api/met": {
                target: "https://collectionapi.metmuseum.org",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/met/, ""),
            },
        },
    },
});
