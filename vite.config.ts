import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import Sitemap from "vite-plugin-sitemap";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

const dynamicRoutes = [
  "/blog/compliance-trabalhista",
  "/blog/reforma-tributaria",
  "/blog/lgpd-agro",
  "/sobre",
  "/sobre/entrega",
  "/sobre/inovacao",
  "/sobre/depoimentos",
  "/profissionais",
  "/areas",
  "/areas/trabalhista-bancario",
  "/areas/trabalhista",
  "/areas/previdenciario",
  "/areas/tributario",
  "/areas/imobiliario",
  "/areas/empresarial",
  "/areas/civel",
  "/blog",
  "/contato",
  "/privacidade",
  "/termos",
  "/bpc",
  "/isencao-ir",
  "/diagnostico-reforma-tributaria",
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const isProd = mode === "production";

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    preview: {
      port: 4173,
      host: "0.0.0.0",
    },
    plugins: [
      react(),
      Sitemap({
        hostname: "https://elilonlopesadvogados.com.br",
        dynamicRoutes,
      }),
      // Gzip + Brotli para assets estáticos em produção
      viteCompression({ algorithm: "gzip", ext: ".gz" }),
      viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
      visualizer({
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
    ],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(
        env.VITE_API_URL || "http://localhost:5000/api",
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      minify: "terser",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react-dom") || id.includes("/react/")) {
                return "react-vendor";
              }
              if (id.includes("react-router")) return "router-vendor";
              if (id.includes("lucide-react")) return "ui-vendor";
              if (
                id.includes("react-simple-maps") ||
                id.includes("d3-")
              ) {
                return "maps-vendor";
              }
              if (id.includes("react-quill")) return "editor-vendor";
              if (id.includes("isomorphic-dompurify")) return "sanitize-vendor";
            }
          },
          assetFileNames: (assetInfo) => {
            let extType = assetInfo.name.split(".").pop();
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      cssCodeSplit: true,
      cssMinify: true,
      target: "es2020",
      modulePreload: { polyfill: false },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
  };
});
