import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import Sitemap from "vite-plugin-sitemap";
import viteCompression from "vite-plugin-compression";

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
  "/blog",
  "/contato",
  "/privacidade",
  "/termos",
  "/bpc",
  "/isencao-ir",
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
      viteCompression(),
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
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "router-vendor": ["react-router-dom"],
            "ui-vendor": ["lucide-react"],
            "maps-vendor": ["react-simple-maps", "d3-scale"],
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
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
  };
});
