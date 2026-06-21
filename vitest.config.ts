import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/engine/**/*.ts"],
      exclude: [
        "src/render/**",
        "src/audio/**",
        "src/ui/**",
        "src/input/**",
        "src/engine/types.ts",
      ],
    },
  },
});
