import { defineConfig } from "vitest/config";

// Runner isolado: não carrega os plugins de build do app (sitemap, compressão,
// visualizer) para manter o loop de teste rápido e sem efeitos colaterais.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
